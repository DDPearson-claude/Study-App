// P1b UI (screens and overlays) screenshots and checks (DESIGN §25.14.2 U3, U14, U17, U18), on a v3 phase-1 build driven
// through window.__gw, desktop and phone:
//
//   node build.mjs --dev --out=tools/out/p1s.html
//   node tools/playtest.mjs --html=tools/out/p1s.html --shots=tools/out/p1s-shots/desktop --script=tools/tests/p1b-screens.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/p1s.html --shots=tools/out/p1s-shots/phone --script=tools/tests/p1b-screens.scenario.mjs --mobile
//   (--only=descent1,measure,f5,skip,card,dawn,pause,scorch,snuff,descent2 takes a subset)
//
// The measuring overlay runs on the UI's own clock: frames are taken with the page's animation loop held and the UI clock
// pumped to an exact ceremony time (window.__pump), so a shot shows the cord at, say, 1.9 s of a Trophy's 3.5 s. The F5
// frame drives a fishing-style live view.measure by hand (the ceremony's own driver), so the overlay's F5 path is exercised
// on a build without the sibling fishing branch. Web fonts come from tools/out/.font-cache, like tools/ui-shots.mjs.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const FONT_CACHE = resolve(here, '..', 'out', '.font-cache');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
function fetchCached(url) {
  const p = resolve(FONT_CACHE, createHash('sha1').update(url).digest('hex'));
  if (existsSync(p)) return readFileSync(p);
  try {
    const buf = execFileSync('curl', ['-sSfL', '-m', '40', '-A', UA, url], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
    mkdirSync(FONT_CACHE, { recursive: true }); writeFileSync(p, buf); return buf;
  } catch { return null; }
}

export default async function (api) {
  const { page, wait, evalGame: g, log, width, args } = api;
  page.setDefaultTimeout(240000);
  const failures = [];
  const only = args?.only ? String(args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.some((o) => x.includes(o));
  const phone = width < 700;
  const check = (cond, msg, extra) => { if (cond) { log('ok  ', msg); return true; } failures.push(`${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`); log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : ''); return false; };

  // ---------------------------------------------------------------- boot: fonts, v3 phase 1, a fresh save
  await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
    const url = route.request().url();
    const buf = fetchCached(url);
    if (!buf) return route.abort();
    const ct = /googleapis/.test(url) ? 'text/css; charset=utf-8' : /\.woff2(\?|$)/.test(url) ? 'font/woff2' : 'application/octet-stream';
    return route.fulfill({ status: 200, body: buf, headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
  });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  // a page built with the v3 flag preset (globalThis.GW_V3 / GW_V3_PHASE in its head) needs no reload; otherwise ?v3=1
  if (!(await g(() => window.__gw.data.V3_ENABLED === true && window.__gw.data.V3_PHASE === 1))) {
    for (let a = 0; a < 3; a++) {
      try { await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 240000 }); break; } catch (e) { log('reload retry', String(e?.message || e).split('\n')[0]); }
    }
  }
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 240000, polling: 500 });
  const fonts = await g(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))]; }).catch(() => []);
  log('fonts', fonts.join(', ') || 'fallback');
  const s0 = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE, runs: window.__gw.state.meta.runs || 0 }));
  check(s0.en === true && s0.ph === 1 && s0.runs === 0, 'v3 phase-1 build, a fresh save', s0);
  await page.mouse.click(2, 200);
  await g(() => {
    const c = window.__gw;
    try { c.render.setQuality?.('medium'); } catch { /* optional */ }
    if (!window.__rafHold) {
      const raf = window.requestAnimationFrame.bind(window);
      let held = null;
      window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
      window.__rafHold = (on) => { if (on) { held = held || []; return true; } if (held) { const q = held; held = null; for (const cb of q) raf(cb); } return false; };
    }
    // UI time pump (as tools/ui-shots.mjs): the overlay, banners and held toasts advance on ui.update()'s own clock
    window.__pump = (sec = 1, step = 0.25) => {
      if (window.__perfOff === undefined) { const realNow = performance.now.bind(performance); window.__perfOff = 0; performance.now = () => realNow() + window.__perfOff; }
      for (let i = 0; i < Math.round(sec / step); i++) { window.__perfOff += step * 1000; try { c.ui.update(step); } catch { /* keep going */ } }
    };
  });
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 240) => { const f0 = await frameNo(), t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(200); } return false; };
  const waitFor = async (fn, arg, timeoutS = 60, stepMs = 300) => { const t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  await scale(0.4);
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/shots'));
  const shots = [];
  /** Capture. held: the loop is already held (the overlay frames); otherwise clear banners and toasts first. */
  async function shot(name, { held = false, settle = 900 } = {}) {
    if (!held) {
      for (let i = 0; i < 30; i++) {
        const busy = await g(() => !!document.querySelector('#ui .gw-banner') || !!document.querySelector('#ui .gw-toast:not(.gw-held)'));
        if (!busy) break;
        await g(() => window.__pump(1.5));
        await wait(500);
      }
      await scale(1);
      await frames(3);
      await wait(700);
      await g(() => window.__rafHold(true));
    }
    await wait(settle);
    const p = resolve(shotsDir, `${name}.png`);
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) { try { await page.screenshot({ path: p, timeout: 240000 }); ok = true; } catch (e) { log('shot retry', name, String(e?.message || e).split('\n')[0]); } }
    if (!held) { await g(() => window.__rafHold(false)); await scale(0.4); }
    if (ok) { shots.push(p); log('screenshot', p); }
    return ok;
  }
  const ui = () => g(() => window.__gw.debug.ui?.() || {});
  const clearModals = async () => {
    for (let i = 0; i < 12; i++) {
      const m = await g(() => ({ b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused, o: window.__gw.debug.ui?.()?.openModal ?? null }));
      if (!m.b && !m.p && !m.o) return;
      await g(() => { const c = window.__gw; const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
      await frames(2);
    }
  };
  const place = (x, z, yaw = 0) => g(([x, z, yaw]) => { const c = window.__gw; c.player.teleport ? c.player.teleport(new c.THREE.Vector3(x, 0, z), yaw) : c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); try { c.render.snapCamera?.(); } catch { /* optional */ } }, [x, z, yaw]);
  const freeze = (on = true) => g((on) => window.__gw.debug.timeScale(on ? 0 : 1), on);
  const idleFishing = () => g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } try { c.fishing.reset?.(); } catch { /* optional */ } });
  const quiet = () => g(() => { const c = window.__gw; const m = c.state.meta; m.seenTips = m.seenTips || {}; for (const t of [...(c.data.TIPS || [])]) m.seenTips[t.id] = true; });

  // ---------------------------------------------------------------- U17: a fresh save sees only the First Outing card
  if (want('descent1')) {
    await g(() => window.__gw.ui.openNewDescent());
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'newdescent', null, 60);
    await wait(1200);
    const nd = await g(() => { const e = document.querySelector('#ui .gw-m-newdescent'); return { cards: [...(e?.querySelectorAll('.gw-mode') || [])].map((b) => ({ id: b.dataset.mode, on: b.classList.contains('gw-on'), t: b.textContent.replace(/\s+/g, ' ').trim() })) }; });
    check(nd.cards.length === 1 && nd.cards[0].id === 'first' && nd.cards[0].on && /First Outing/.test(nd.cards[0].t), 'U17: a fresh save sees only the First Outing card', nd);
    await shot('01-newdescent-first');
    // start run 1 from the card's own button (the First Outing: every night still)
    await g(() => document.querySelector('#ui .gw-m-newdescent .gw-pf .gw-btn--primary')?.click());
  } else {
    await g(() => window.__gw.game.startNewRun({ character: 'wick' }));
  }
  await waitFor(() => window.__gw.flow === 'playing', null, 120);
  await frames(4);
  await clearModals();
  await g(() => { const c = window.__gw; c.debug.god?.(true); c.debug.setOil(80); c.debug.setSatiety(90); });
  await quiet();
  let s = await g(() => ({ mode: window.__gw.state.run?.nightMode, outing: window.__gw.state.run?.outing }));
  check(s.mode === 'still' && s.outing === 'first', 'run 1 is the First Outing (Still)', s);
  await place(4, 14.8);
  await frames(3);

  /** Land a fish now (v3: fish:measured, then fish:landed) and hold the loop at the overlay's start. */
  async function land(sp, z) {
    await clearModals();
    await idleFishing();
    await frames(2);
    await g(([sp, z]) => { window.__rafHold(true); window.__gw.debug.instantCatch(sp, { z }); }, [sp, z]);
    return g(() => window.__gw.ui.measureDebug?.() || null);
  }
  const msState = () => g(() => {
    const e = document.querySelector('#ui .gw-ms');
    return { on: !!e, cls: e?.className || '', count: e?.querySelector('.gw-ms-count')?.textContent?.trim() || '', stamp: e?.querySelector('.gw-ms-stamp')?.textContent?.trim() || '',
      recs: [...(e?.querySelectorAll('.gw-ms-rec b') || [])].map((b) => b.textContent), hit: [...(e?.querySelectorAll('.gw-ms-mark.gw-hit b') || [])].map((b) => b.textContent),
      elder: e?.querySelector('.gw-ms-elder')?.textContent || '', d: window.__gw.ui.measureDebug?.() || null, modal: window.__gw.debug.ui?.()?.openModal ?? null };
  });

  // ---------------------------------------------------------------- U3: the measuring overlay (no F5: the UI runs the plan)
  if (want('measure')) {
    await scale(1);
    for (const [name, sp, z, midT, endT] of [['trophy', 'reedjaw_pike', 2.4, 2.0, 3.0], ['elder', 'reedjaw_pike', 3.3, 3.3, 4.3], ['keeper', 'dusk_minnow', 0.3, 0.7, 1.05], ['prize', 'mossback_perch', 1.5, 1.7, 2.2]]) {
      const d0 = await land(sp, z);
      check(!!d0 && d0.cls === name, `U3 ${name}: the overlay opens at the landing`, d0);
      await g((t) => window.__pump(t, 0.05), midT);
      s = await msState();
      check(s.on && !/gw-stamped/.test(s.cls) && Number(s.count.replace(/\D/g, '')) > 0, `U3 ${name}: the cord unrolls and the count ticks (${midT} s)`, s);
      await shot(`10-measure-${name}-cord`, { held: true });
      await g((t) => window.__pump(t, 0.05), endT - midT);
      s = await msState();
      check(/gw-stamped/.test(s.cls) && s.stamp.length > 0, `U3 ${name}: the stamp at ${endT} s`, s);
      if (name === 'elder') check(/“.+”/.test(s.elder), 'U3 elder: the Elder is named in pale gold', s.elder);
      await shot(`11-measure-${name}-stamp`, { held: true });
      // the card waits for the overlay, then opens
      const plan = s.d?.plan?.dur || 0;
      check(Math.abs(plan - ({ trophy: 3.5, elder: 5, keeper: 1.2, prize: 2.4 })[name]) < 0.01, `U3 ${name}: plan length matches §25.6.8`, s.d?.plan);
      check(s.modal === 'measure', `U3 ${name}: the card waits while the overlay runs`, s.modal);
      await g(() => window.__pump(3, 0.1));
      await g(() => window.__rafHold(false));
      const cardOk = await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 90);
      check(cardOk, `U3 ${name}: the card opens when the overlay ends`);
      await g(() => { document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click() || document.querySelector('#ui .gw-m-catch [data-action="keep"]')?.click(); });
      await frames(2);
    }
    await scale(0.4);
  }

  // ---------------------------------------------------------------- U3: skips (tap; an Elder only after 0.6 s)
  if (want('skip')) {
    let d = await land('mossback_perch', 1.5);
    await g(() => window.__pump(0.2, 0.05));
    await g(() => { const e = document.querySelector('#ui .gw-ms'); const r = e.getBoundingClientRect(); e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.width / 2, clientY: r.height / 3 })); });
    await g(() => window.__pump(0.6, 0.1));
    s = await msState();
    check(!s.on || s.d?.done, 'U3 skip: a Prize skips at once on a tap', s.d);
    await g(() => window.__rafHold(false));
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 60);
    await clearModals();
    d = await land('reedjaw_pike', 3.3);
    await g(() => window.__pump(0.3, 0.05));
    await g(() => { const e = document.querySelector('#ui .gw-ms'); e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 100 })); });
    s = await msState();
    check(s.on && !s.d?.done, 'U3 skip: an Elder ignores a tap before 0.6 s', s.d);
    await g(() => window.__pump(0.4, 0.05));
    await g(() => { const e = document.querySelector('#ui .gw-ms'); e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 100 })); });
    await g(() => window.__pump(0.6, 0.1));
    s = await msState();
    check(!s.on || s.d?.done, 'U3 skip: an Elder skips after 0.6 s', s.d);
    await g(() => window.__rafHold(false));
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 60);
    await clearModals();
  }

  // ---------------------------------------------------------------- U3 (F5 path): a live view.measure drives the overlay
  if (want('f5')) {
    await clearModals();
    await idleFishing();
    await scale(1);
    await frames(2);
    await g(() => {
      window.__rafHold(true);
      const c = window.__gw;
      const m = { phase: 'scoop', speciesId: 'gloam_eel', length: 131.4, count: 0, k: 0, cordDur: 1.36, sizeClass: 'elder', ancient: true, legendary: false, seal: null, pose: 'hang', dur: 5, t: 0, short: false, skippable: false, name: null, records: null, uid: 'f5test' };
      c.fishing.view.measure = m;
      c.cinematic = true;
      c.ui.showMeasure(m);
      window.__f5 = m;
    });
    const drive = (t) => g((t) => {
      const m = window.__f5, P = { scoop: 0.83, cordStart: 1.94, cordEnd: 3.89, dur: 5 };
      m.t = t; m.skippable = t >= 0.6;
      if (t < P.scoop) m.phase = 'scoop'; else if (t < P.cordStart) m.phase = 'pose';
      else if (t < P.cordEnd) { m.phase = 'cord'; m.k = (t - P.cordStart) / (P.cordEnd - P.cordStart); m.count = m.length * (1 - (1 - m.k) ** 2); }
      else if (t < P.dur) { m.phase = 'banners'; m.k = 1; m.count = m.length; m.seal = 'blackWaxRibbon'; m.name = 'Old Coilmouth'; m.records = [{ kind: 'classFirst', sizeClass: 'elder', ancient: true }, { kind: 'pb', length: 131.4, prevLength: 104 }, { kind: 'oldLedger' }]; }
      else { m.phase = 'card'; window.__gw.cinematic = false; }
      window.__pump(0.1, 0.05);
    }, t);
    await drive(3.0);
    s = await msState();
    check(s.on && /gw-ms-f5/.test(s.cls) && !/gw-stamped/.test(s.cls), 'U3 F5: the overlay follows view.measure (cord)', s);
    await shot('12-measure-f5-cord', { held: true });
    await drive(4.3);
    s = await msState();
    check(/gw-stamped/.test(s.cls) && s.recs.length >= 2 && /Old Coilmouth/.test(s.elder), 'U3 F5: the stamp, the name and the record banners from view.measure', s);
    await shot('13-measure-f5-banners', { held: true });
    const blk = await g(() => window.__gw.ui.isBlocking());
    check(blk === false, 'U3 F5: the overlay does not block (fishing runs the ceremony)', blk);
    await drive(5.2);
    await g(() => window.__pump(1, 0.1));
    s = await msState();
    check(!s.on || s.d?.done, 'U3 F5: the overlay closes on phase "card"', s.d);
    await g(() => { const c = window.__gw; c.fishing.view.measure = null; c.cinematic = false; window.__rafHold(false); });
    await scale(0.4);
  }

  // ---------------------------------------------------------------- U14: a level-up banked while reeling shows on the next card
  if (want('card')) {
    await clearModals();
    await idleFishing();
    await g(() => window.__gw.debug.fishHook?.('reedjaw_pike', { z: 1.6 }));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 60);
    const b0 = await g(() => { const c = window.__gw, r = c.state.run; const need = Math.max(1, (r.xpNext || 5) - (r.xp || 0)) + 0.5; c.combat.addXp?.(need * 2.2, { source: 'debug' }); return { bank: c.combat.bankedLevels, lvl: r.level }; });
    await frames(3);
    s = await g(() => ({ bank: window.__gw.combat.bankedLevels, modal: window.__gw.debug.ui?.()?.openModal ?? null, po: !!window.__gw.combat.pendingOptions }));
    check(s.bank >= 1 && s.modal !== 'levelup', 'U14: a level-up while reeling is banked (no modal with a line out)', { b0, s });
    await idleFishing();
    await land('reedjaw_pike', 2.1);
    await g(() => window.__pump(5, 0.25));
    await g(() => window.__rafHold(false));
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 90);
    await wait(2400);
    s = await g(() => { const e = document.querySelector('#ui .gw-m-catch'); return { pick: !!e?.querySelector('.gw-cc-pick'), opts: e?.querySelectorAll('.gw-cc-boon').length || 0, head: e?.querySelector('.gw-cc-pick-h')?.textContent || '' }; });
    check(s.pick && s.opts >= 2, 'U14: the next card carries the banked pick', s);
    await shot('20-card-banked-pick');
    const bank0 = await g(() => window.__gw.combat.bankedLevels);
    await g(() => document.querySelector('#ui .gw-m-catch .gw-cc-boon')?.click());
    await wait(900);
    s = await g(() => ({ bank: window.__gw.combat.bankedLevels, chosen: document.querySelector('#ui .gw-m-catch .gw-cc-pick')?.className || '', boons: Object.keys(window.__gw.state.run.boons || {}).length }));
    check(s.bank === bank0 - 1, 'U14: choosing on the card spends one banked level', { bank0, s });
    await shot('21-card-banked-chosen');
    await g(() => document.querySelector('#ui .gw-m-catch [data-action="keep"]')?.click() || document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click());
    await frames(3);
    await clearModals();
  }

  // ---------------------------------------------------------------- U14: the dawn bell
  if (want('dawn')) {
    await clearModals();
    await idleFishing();
    await g(() => { const c = window.__gw; c.state.run.levelBank = 2; c.debug.setPhase('gloomtide'); });
    await frames(3);
    await g(() => { window.__gw.debug.setPhase('dawn'); });
    const opened = await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'levelup', null, 60);
    s = await g(() => ({ k: document.querySelector('#ui .gw-m-levelup .gw-lu-head .gw-kicker')?.textContent || '', h: document.querySelector('#ui .gw-m-levelup h2')?.textContent || '' }));
    check(opened && /dawn/i.test(s.k + s.h), 'U14: the dawn bell offers the banked pick (still, no line out)', s);
    await wait(1500);
    await shot('22-dawn-bell-pick');
    await clearModals();
    await g(() => window.__gw.debug.setPhase('calm'));
  }

  // ---------------------------------------------------------------- U18: pause quick links in a lake
  if (want('pause')) {
    await clearModals();
    await g(() => window.__gw.game.pause?.());
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'pause', null, 30);
    await wait(1200);
    s = await g(() => [...document.querySelectorAll('#ui .gw-m-pause .gw-quick .gw-btn')].map((b) => b.textContent.trim()));
    check(['Journal', 'Trials', 'Settings', 'Title'].every((w) => s.some((t) => t.includes(w))), 'U18: pause quick links (Journal, Challenges, Settings, Title)', s);
    await shot('30-pause-quick');
    await g(() => document.querySelector('#ui .gw-m-pause .gw-quick [data-link="challenges"]')?.click());
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'challenges', null, 30);
    s = await ui();
    check(s.openModal === 'challenges', 'U18: the Challenges quick link opens the Trials', s);
    await clearModals();
  }

  // ---------------------------------------------------------------- U18: the Scorched card (Lantern, Embers at 0; play continues)
  if (want('scorch')) {
    await clearModals();
    await g(() => { const c = window.__gw; c.debug.god?.(false); c.debug.mode('lantern'); c.debug.setDay(2); c.debug.setPhase('gloomtide'); c.debug.setOil(80); });
    await frames(3);
    const r = await g(() => window.__gw.debug.scorch?.());
    await frames(3);
    const on = await waitFor(() => document.querySelector('#ui .gw-scorched')?.classList.contains('gw-on'), null, 30, 200);
    s = await g(() => ({ flow: window.__gw.flow, blocking: window.__gw.ui.isBlocking(), t: document.querySelector('#ui .gw-scorched')?.textContent?.replace(/\s+/g, ' ').trim() || '', scorched: !!window.__gw.state.run?.scorched }));
    check(on && s.flow === 'playing' && !s.blocking && /Scorched/.test(s.t) && s.scorched, 'U18: Embers at 0 in Lantern shows the Scorched card and play continues', { r, s });
    await freeze(true);
    await shot('31-scorched-card');
    await freeze(false);
    await g(() => { const c = window.__gw; c.debug.god?.(true); });
  }

  // ---------------------------------------------------------------- U18: Snuffed (oil), then U17's second New Descent
  if (want('snuff')) {
    await clearModals();
    await g(() => { const c = window.__gw; c.debug.god?.(false); c.debug.setPhase('calm'); c.state.meta.relics = c.state.meta.relics || {}; c.state.run.flags = c.state.run.flags || {}; c.state.run.flags.secondWickUsed = true; });
    const r = await g(() => window.__gw.debug.snuff?.());
    const dead = await waitFor(() => window.__gw.flow === 'dead' && window.__gw.debug.ui?.()?.openModal === 'death', null, 60);
    await wait(4200);
    s = await g(() => ({ h: document.querySelector('#ui .gw-death h1')?.textContent || '', ep: document.querySelector('#ui .gw-epitaph')?.textContent || '' }));
    check(dead && /Snuffed/.test(s.h), 'U18: a snuff shows "Snuffed"', { r, s });
    await shot('32-snuffed');
  }
  if (want('descent2')) {
    if (await g(() => window.__gw.flow !== 'dead' && window.__gw.flow !== 'title')) { await g(() => window.__gw.game.toTitle?.()); await wait(600); }
    await g(() => window.__gw.ui.openNewDescent());
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'newdescent', null, 60);
    await wait(1400);
    const nd = await g(() => { const e = document.querySelector('#ui .gw-m-newdescent'); return [...(e?.querySelectorAll('.gw-mode') || [])].map((b) => ({ id: b.dataset.mode, on: b.classList.contains('gw-on') })); });
    check(nd.length === 3 && nd.map((x) => x.id).join() === 'still,lantern,gloomtide' && nd.find((x) => x.on)?.id === 'lantern', 'U17: the second run offers Still / Lantern / Gloomtide with Lantern selected', nd);
    await shot('40-newdescent-modes');
    await g(() => document.querySelector('#ui .gw-m-newdescent .gw-mode[data-mode="gloomtide"]')?.click());
    await wait(500);
    await g(() => document.querySelector('#ui .gw-m-newdescent .gw-pf .gw-btn--primary')?.click());
    await waitFor(() => window.__gw.flow === 'playing', null, 120);
    s = await g(() => ({ mode: window.__gw.state.run?.nightMode, outing: window.__gw.state.run?.outing }));
    check(s.mode === 'gloomtide' && s.outing === 'normal', 'U17: the chosen card starts the run in its mode', s);
  }

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs);
  log(`shots: ${shots.length}`);
  return { failures };
}
