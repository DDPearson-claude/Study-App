// P1b UI (in-play HUD) screenshots and checks (DESIGN §25.14.2 U1, U2, U13, C2's HUD side, S6's watch-lamp line; the snag
// glyph and the near-miss card), on a v3 phase-1 build driven through window.__gw, desktop and phone:
//
//   node build.mjs --dev --out=tools/out/p1b-ui.html
//   node tools/playtest.mjs --html=tools/out/p1b-ui.html --shots=tools/out/p1b-shots/desktop --script=tools/tests/p1b-ui.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/p1b-ui.html --shots=tools/out/p1b-shots/phone --script=tools/tests/p1b-ui.scenario.mjs --mobile
//   (--only=calm,tell,… takes a subset; frames: calm, watch, swarm, still, favour, tell, reel, catch, nearmiss, gutter)
//
// Web fonts: like tools/ui-shots.mjs, the Google stylesheets the page links are served from tools/out/.font-cache (fetched
// with curl on a miss), so the shots show the real type. Gameplay time is frozen (timeScale 0) for most frames; the HUD
// runs on its own clock. A few states are set straight on fishing.view for the shot (the class after a breach, a lost
// pip, a quiet place), because a real breach or three catches at one place cannot be timed on software GL.
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
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 240000, polling: 500 });
  const fonts = await g(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))]; }).catch(() => []);
  log('fonts', fonts.join(', ') || 'fallback');
  const s0 = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE }));
  check(s0.en === true && s0.ph === 1, 'v3 phase-1 build', s0);
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
    // UI time pump (as tools/ui-shots.mjs): banners and held toasts advance on ui.update()'s own clock
    window.__pump = (sec = 1) => {
      if (window.__perfOff === undefined) { const realNow = performance.now.bind(performance); window.__perfOff = 0; performance.now = () => realNow() + window.__perfOff; }
      for (let i = 0; i < Math.ceil(sec / 0.25); i++) { window.__perfOff += 250; try { c.ui.update(0.25); } catch { /* keep going */ } }
    };
  });
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 240) => { const f0 = await frameNo(), t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(200); } return false; };
  const waitFor = async (fn, arg, timeoutS = 60, stepMs = 300) => { const t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  await scale(0.4);
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/shots'));
  const shots = [];
  /** Clear banners and toasts (pumped UI time), full-scale render for two frames, hold the loop, capture. */
  async function shot(name) {
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
    await wait(500);
    const p = resolve(shotsDir, `${name}.png`);
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) { try { await page.screenshot({ path: p, timeout: 240000 }); ok = true; } catch (e) { log('shot retry', name, String(e?.message || e).split('\n')[0]); } }
    await g(() => window.__rafHold(false));
    await scale(0.4);
    if (ok) { shots.push(p); log('screenshot', p); }
    return ok;
  }
  const S = () => g(() => {
    const c = window.__gw, r = c.state.run, hud = document.querySelector('#ui .gw-hud');
    const vis = (sel) => { const e = document.querySelector(sel); if (!e) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && e.getClientRects().length > 0; };
    const opa = (sel) => { const e = document.querySelector(sel); return e ? +getComputedStyle(e).opacity : 0; };
    return {
      mode: r?.nightMode, phase: r?.phase, day: r?.day, fishing: c.fishing.state, v3: hud?.classList.contains('gw-v3'),
      embers: !hud?.classList.contains('gw-hide-embers'), flare: vis('#ui .gw-flare'), burn: vis('#ui .gw-burn'), wf: vis('#ui .gw-wf'),
      sat: vis('#ui .gw-sat-fill'), emberOpacity: opa('#ui .gw-embers'), status: document.querySelector('#ui .gw-status-t')?.textContent || '',
      fore: document.querySelector('#ui .gw-clock-fore')?.textContent || '', phaseTxt: document.querySelector('#ui .gw-clock-phase')?.textContent || '',
      phaseW: document.querySelector('#ui .gw-phase-w')?.textContent || '', modal: c.debug.ui?.()?.openModal ?? null, errs: c.errors.slice(),
    };
  });
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => ({ m: window.__gw.debug.ui?.()?.openModal ?? null, b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused }));
      if (!m.b && !m.p) return;
      await g(() => { const c = window.__gw; const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
      await frames(2);
    }
  };
  const place = (x, z, yaw = 0) => g(([x, z, yaw]) => { const c = window.__gw; c.player.teleport ? c.player.teleport(new c.THREE.Vector3(x, 0, z), yaw) : c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); try { c.render.snapCamera?.(); } catch { /* optional */ } }, [x, z, yaw]);
  const setK = (k) => g((k) => { const c = window.__gw, r = c.state.run, d = c.survival.getPhaseInfo().duration || 90; r.phaseTime = k * d; }, k);
  const freeze = (on = true) => g((on) => window.__gw.debug.timeScale(on ? 0 : 1), on);
  const idleFishing = () => g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } try { c.fishing.reset?.(); } catch { /* optional */ } });

  // ---------------------------------------------------------------- run 1: the First Outing (Still)
  await g(() => window.__gw.game.startNewRun({ character: 'wick' }));
  await waitFor(() => window.__gw.flow === 'playing', null, 120);
  await frames(4);
  await clearModals();
  await g(() => { const c = window.__gw; c.debug.god?.(true); const m = c.state.meta; m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) m.seenTips[t.id] = true; c.debug.setOil(80); c.debug.setSatiety(90); });
  let s = await S();
  check(s.mode === 'still' && s.v3, 'run 1: Still, the v3 HUD is on', s);
  // open water south of the spawn, looking north over the lake
  await place(4, 14.8);
  await frames(3);

  if (want('calm')) {
    for (const mode of ['still', 'lantern', 'gloomtide']) {
      await g((mode) => { const c = window.__gw; c.debug.mode(mode); c.debug.setDay(mode === 'lantern' ? 2 : 1); c.debug.setPhase('calm'); c.debug.setOil(80); c.debug.setSatiety(90); }, mode);
      await setK(0.3);
      await frames(3);
      await freeze(true);
      await frames(2);
      s = await S();
      if (mode === 'gloomtide') check(s.embers && s.flare && s.burn && s.wf && !s.sat, 'Gloomtide calm: Embers, Flare and Burn always; the Well-fed glyph, no satiety arc', s);
      else check(!s.embers && !s.flare && !s.burn && s.wf && !s.sat, `${mode} calm: no combat UI (no Embers, Flare or Burn); the Well-fed glyph`, s);
      if (mode === 'lantern') check(/Gloom stirs/.test(s.fore), 'Lantern day 2 calm forecasts the swarm', s.fore);
      await shot(`01-calm-${mode}`);
      await freeze(false);
    }
    // hungry: the glyph dims
    await g(() => { const c = window.__gw; c.debug.mode('still'); c.debug.setSatiety(30); });
    await frames(3);
    s = await S();
    check(s.wf && !s.sat, 'satiety 30%: the Well-fed glyph stays (dim), no satiety bar', s);
    await g(() => window.__gw.debug.setSatiety(90));
  }

  if (want('watch')) {
    // Lantern, day 2 (a swarm night), calm past Murk's 85% bell: the watch-lamp line and its edge marker
    await g(() => { const c = window.__gw; c.debug.mode('lantern'); c.debug.setDay(2); c.debug.setPhase('calm'); c.debug.setOil(80); });
    await place(-8, 30);
    await setK(0.9);
    await frames(4);
    await freeze(true);
    await frames(2);
    s = await S();
    check(/watch-lamp \d+\sm · ≈ \d+\ss/.test(s.status), 'Lantern swarm night from the 85% bell: "Nearest watch-lamp N m · ≈ N s"', s.status);
    await shot('02-watchlamp-line');
    await freeze(false);
    // standing in the South-East buoy-lamp's pool as dusk ends: the lamp-watch
    await place(19.8, 34.2);
    await g(() => { const c = window.__gw; c.debug.setPhase('dusk'); });
    await frames(3);
    s = await S();
    check(/watch-lamp's light/.test(s.status), 'inside the pool at dusk: "In the watch-lamp\'s light"', s.status);
    await g(() => { const c = window.__gw; c.debug.setPhase('gloomtide'); c.debug.lampWatch?.('se_buoy'); });
    await frames(4);
    await freeze(true);
    await frames(2);
    s = await S();
    check(/^Lamp-watch/.test(s.status) && !s.embers, 'lampwatch:start: the lamp-watch line, Embers stay hidden (no swarm tonight)', s);
    await shot('03-lampwatch');
    await freeze(false);
    await g(() => { const c = window.__gw; c.debug.lampWatch?.(null); });
  }

  if (want('swarm')) {
    await g(() => { const c = window.__gw; c.debug.mode('lantern'); c.debug.setDay(2); c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); c.debug.setOil(80); });
    await place(4, 14.8);
    await setK(0.18);
    await waitFor(() => !!window.__gw.combat.swarmActive, null, 60);
    await frames(10);
    await freeze(true);
    await frames(2);
    s = await S();
    check(s.embers && s.flare && s.phaseW.includes('Gloomtide'), 'Lantern swarm window: Embers and Flare shown, the night reads Gloomtide', s);
    await shot('04-lantern-swarm');
    await freeze(false);
    await g(() => { const c = window.__gw; c.debug.killAll?.(); });
  }

  if (want('still')) {
    await g(() => { const c = window.__gw; c.debug.killAll?.(); c.debug.mode('still'); c.debug.setDay(3); c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); c.debug.setOil(80); });
    await place(4, 14.8);
    await setK(0.4);
    await frames(4);
    await freeze(true);
    await frames(2);
    s = await S();
    check(!s.embers && !s.flare && /Stillnight/.test(s.phaseW), 'a Still night: no combat UI, the night reads Stillnight', s);
    await shot('05-stillnight');
    await freeze(false);
  }

  // ---------------------------------------------------------------- fishing: the float's favour, tells, reel, cards
  await g(() => { const c = window.__gw; c.debug.killAll?.(); c.debug.mode('still'); c.debug.setDay(2); c.debug.setPhase('calm'); c.debug.setPhase('dusk'); c.debug.setOil(80); });
  await place(4, 14.8);
  await frames(3);
  // bait that carries favour (Ember Roe +0.35), at dusk (+0.2)
  await g(() => { const c = window.__gw, r = c.state.run; r.bait = r.bait || {}; r.bait.ember_roe = 6; try { c.progression.equipBait?.('ember_roe'); } catch { /* optional */ } });

  if (want('favour')) {
    await idleFishing();
    await g(() => window.__gw.debug.forceBite({ wait: 300 }));
    await waitFor(() => !!window.__gw.fishing.view.favour, null, 60);
    await frames(6);
    await freeze(true);
    await frames(2);
    const fv = await g(() => window.__gw.fishing.view.favour);
    log('favour', JSON.stringify(fv));
    const vis = await g(() => { const e = document.querySelector('#ui .gw-favour'); return { on: e?.classList.contains('gw-on'), lit: e?.querySelectorAll('.gw-fav-ticks path.gw-lit').length, say: e?.querySelector('.gw-fav-say')?.textContent }; });
    check(vis.on && vis.lit === fv.notches, 'the float shows its notches beside the bobber', { vis, fv });
    await shot('06-favour');
    // a long press on the float lists the favours by family in plain words
    const box = await g(() => { const r = document.querySelector('#ui .gw-favour')?.getBoundingClientRect(); return r ? { x: r.x + r.width / 2, y: r.y + 14 } : null; });
    if (box) {
      if (phone) { await page.touchscreen.tap(box.x, box.y); } else { await page.mouse.move(box.x, box.y); }
      await wait(600);
      const list = await g(() => { const e = document.querySelector('#ui .gw-favour'); return { open: e?.classList.contains('gw-open'), text: e?.querySelector('.gw-fav-list')?.textContent || '' }; });
      check(list.open && /Hour/.test(list.text) && /Tackle/.test(list.text), 'tap / hover lists the favours by family (Hour, Tackle …)', list);
      await shot('07-favour-list');
      // the same widget with a richer set of terms (the hour changed to night, a sign, a lapsed bite, pressure)
      await g(() => {
        const v = window.__gw.fishing.view;
        v.favour = { mu: 1.31, notches: 4, quiet: false, terms: [{ family: 'hour', id: 'nightRise', value: 0.25 }, { family: 'tackle', id: 'ember_roe', value: 0.35 }, { family: 'tackle', id: 'depthLowerThird', value: 0.25 },
          { family: 'signs', id: 'strike', value: 0.6 }, { family: 'signs', id: 'letItPass', value: 0.15 }, { family: 'pressure', id: 'pressure', value: -0.12 }] };
      });
      await frames(2);
      await shot('08-favour-list-rich');
      if (!phone) await page.mouse.move(2, 200);
      else await page.touchscreen.tap(box.x, box.y);
      await wait(400);
    }
    // a place fished three times today: the dimmed float and "The water here has gone quiet."
    await g(() => { const v = window.__gw.fishing.view; v.favour = { ...v.favour, mu: 0.06, notches: 0, quiet: true, terms: [{ family: 'hour', id: 'dusk', value: 0.2 }, { family: 'pressure', id: 'pressure', value: -0.36 }] }; });
    await frames(2);
    const q = await g(() => document.querySelector('#ui .gw-fav-say')?.textContent);
    check(/gone quiet/.test(q), 'pressure ≤ −0.36 shows "The water here has gone quiet."', q);
    await shot('09-favour-quiet');
    await freeze(false);
    await idleFishing();
  }

  if (want('tell')) {
    const TELLS = [['doublePop', 'dusk_minnow', -1.0], ['dragUnder', 'reedjaw_pike', 1.5], ['flatSlide', 'reedjaw_pike', 2.3], ['dome', 'reedjaw_pike', 3.0]];
    for (const [tellId, sp, z] of TELLS) {
      await idleFishing();
      await frames(2);
      const okBite = await g(([sp, z]) => window.__gw.debug.forceBite({ speciesId: sp, z, wait: 1.4 }), [sp, z]);
      const got = await waitFor(() => !!window.__gw.fishing.view.biteTell, null, 90, 100);
      await freeze(true);
      await frames(2);
      const t = await g(() => ({ tell: window.__gw.fishing.view.biteTell, st: window.__gw.fishing.state, on: document.querySelector('#ui .gw-tell')?.classList.contains('gw-on'), words: document.querySelector('#ui .gw-tell-w')?.textContent }));
      check(okBite && got && t.tell === tellId && t.on, `the ${tellId} tell shows as a pictogram with words`, t);
      await shot(`10-tell-${tellId}`);
      await freeze(false);
    }
    await idleFishing();
  }

  if (want('reel')) {
    await idleFishing();
    await g(() => window.__gw.debug.fishHook?.('reedjaw_pike', { z: 2.35 }));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 60);
    await frames(4);
    await freeze(true);
    // the first breach revealed a Trophy; one of three pips already lost on a leap
    await g(() => { const v = window.__gw.fishing.view; v.sizeClass = 'trophy'; v.ancient = false; v.pips = { n: 2, max: 3 }; });
    await frames(3);
    s = await g(() => ({ cls: document.querySelector('#ui .gw-reel-class')?.textContent, pips: document.querySelectorAll('#ui .gw-pip').length, lit: document.querySelectorAll('#ui .gw-pip.gw-lit').length }));
    check(/Trophy/.test(s.cls) && s.pips === 3 && s.lit === 2, 'reeling: the class estimate after the breach and the hook-hold pips', s);
    await shot('11-reel-class-pips');
    // an Elder, with its seal
    await g(() => { const v = window.__gw.fishing.view; v.sizeClass = 'elder'; v.ancient = true; v.pips = { n: 1, max: 3 }; });
    await frames(3);
    await shot('12-reel-ancient-lastpip');
    // the snag: a hand rises under the line (C4), "ease"
    await g(() => { const v = window.__gw.fishing.view; v.sizeClass = 'trophy'; v.ancient = false; v.pips = { n: 2, max: 3 }; window.__gw.fishing.snag?.({ lead: 40, spike: 0.2 }); });
    await wait(1200);
    await frames(3);
    s = await g(() => ({ on: document.querySelector('#ui .gw-reel-snag')?.classList.contains('gw-on'), hint: document.querySelector('#ui .gw-reel-hint')?.textContent }));
    check(s.on && /grasps/.test(s.hint), 'fishing:snag warn: the snag glyph and its words', s);
    await shot('13-reel-snag');
    await freeze(false);
    await idleFishing();
  }

  if (want('catch')) {
    for (const [name, sp, z] of [['trophy', 'reedjaw_pike', 2.4], ['elder', 'reedjaw_pike', 3.3], ['keeper', 'dusk_minnow', 0.3]]) {
      await clearModals();
      await idleFishing();
      await g(([sp, z]) => window.__gw.debug.instantCatch(sp, { z }), [sp, z]);
      await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 90);
      await wait(2600);   // the stamp and the ink sketch draw in
      s = await g(() => { const e = document.querySelector('#ui .gw-m-catch'); return { stamp: e?.querySelector('.gw-cc-stamp')?.textContent?.trim(), stats: e?.querySelector('.gw-cc-stats')?.textContent?.replace(/\s+/g, ' '), seal: !!e?.querySelector('.gw-cc-seal'), name: e?.querySelector('.gw-cc-elder')?.textContent || '' }; });
      check(/cm|mm/.test(s.stats) && /kg/.test(s.stats) && /favour/.test(s.stats) && new RegExp(name === 'elder' ? 'Ancient|Elder' : name, 'i').test(s.stamp), `catch card (${name}): class stamp, cm, kg and the favours`, s);
      await shot(`14-catch-${name}`);
      await g(() => { document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click() || document.querySelector('#ui .gw-m-catch [data-action="keep"]')?.click(); });
      await frames(3);
    }
    await clearModals();
  }

  if (want('nearmiss')) {
    await clearModals();
    await idleFishing();
    await frames(3);
    await g(() => window.__gw.bus.emit('fish:escaped-big', { speciesId: 'reedjaw_pike', z: 2.3, sizeClass: 'trophy', length: 108, progress: 0.84, cause: 'snap', place: null, markedFish: false }));
    await waitFor(() => document.querySelector('#ui .gw-nearmiss')?.classList.contains('gw-on'), null, 60, 200);
    await freeze(true);
    await wait(900);
    s = await g(() => ({ t: `${document.querySelector('#ui .gw-nm-title')?.textContent} · ${document.querySelector('#ui .gw-nm-est')?.textContent}`, l: document.querySelector('#ui .gw-nm-line')?.textContent, r: document.querySelector('#ui .gw-nm-rate')?.textContent, tip: document.querySelector('#ui .gw-nm-tip')?.textContent }));
    check(/Reedjaw Pike · Trophy · ~\d+ cm/.test(s.t) && /Snapped at 84%/.test(s.l) && /rated/.test(s.r) && s.tip, 'fish:escaped-big: the near-miss card (silhouette, class, ~length, %, cause, rating, tip)', s);
    await shot('15-nearmiss');
    await freeze(false);
  }

  if (want('gutter')) {
    await g(() => { const c = window.__gw; c.debug.mode('still'); c.debug.setPhase('calm'); c.debug.setOil(0); c.debug.gutter?.(); });
    await frames(4);
    await freeze(true);
    await frames(2);
    s = await S();
    check(/Guttering/.test(s.status) && s.burn, 'guttering: the countdown line and the Relight button', s);
    await shot('16-guttering');
    await freeze(false);
    await g(() => window.__gw.debug.setOil(80));
  }

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs);
  log(`shots: ${shots.length}`);
  return { failures };
}
