// Declutter before/after set: every in-play state of the v3 phase-1 game the user plays, one PNG each, plus a text inventory
// (visible words per screen, grouped by the element that carries them) in inventory.json beside the shots.
//
//   node build.mjs --dev --out=tools/out/polish/dev.html     (then insert the GW_V3 / GW_V3_PHASE=1 script, or let this add ?v3=1)
//   node tools/playtest.mjs --html=tools/out/polish/v3.html --shots=tools/out/polish/after/desktop --script=tools/tests/polish-shots.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/polish/v3.html --shots=tools/out/polish/after/phone --script=tools/tests/polish-shots.scenario.mjs --mobile
//   (--only=calm,catch takes a subset; frame names are stable)
//
// Frames: 01-title 02-calm 03-aim 04-wait 05-bite 06-reel 07-measure 08-catch 09-away 10-dusk 11-still 12-lantern 13-shop 14-pause 15-death
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

/** In the page: every visible text run in #ui (and aria-hidden excluded), grouped by its nearest classed ancestor. */
function inventory() {
  const root = document.getElementById('ui');
  const vis = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
  const groups = new Map();
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let words = 0;
  while (w.nextNode()) {
    const t = w.currentNode, s = t.nodeValue.replace(/\s+/g, ' ').trim();
    if (!s || !vis(t.parentElement)) continue;
    let g = t.parentElement;
    while (g && g !== root && !(g.className && typeof g.className === 'string' && /gw-/.test(g.className) && g.parentElement && (g.parentElement.id || /gw-(hud|layer|modal|m-|toast|banner|panel|card)/.test(g.parentElement.className || '')))) g = g.parentElement;
    const key = (g && g !== root ? String(g.className).split(' ').filter((c) => c.startsWith('gw-')).slice(0, 2).join('.') : 'ui') || 'ui';
    const n = s.split(' ').filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
    words += n;
    const e = groups.get(key) || { words: 0, text: [] };
    e.words += n; e.text.push(s);
    groups.set(key, e);
  }
  return { words, groups: Object.fromEntries([...groups].map(([k, v]) => [k, { words: v.words, text: v.text.join(' / ').slice(0, 400) }])) };
}

export default async function (api) {
  const { page, wait, evalGame: g, log, width, args } = api;
  page.setDefaultTimeout(240000);
  const failures = [];
  const only = args?.only ? String(args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.some((o) => x.includes(o));
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/polish/shots'));
  mkdirSync(shotsDir, { recursive: true });
  const inv = {};

  await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
    const url = route.request().url();
    const buf = fetchCached(url);
    if (!buf) return route.abort();
    const ct = /googleapis/.test(url) ? 'text/css; charset=utf-8' : /\.woff2(\?|$)/.test(url) ? 'font/woff2' : 'application/octet-stream';
    return route.fulfill({ status: 200, body: buf, headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
  });
  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub'), null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub') && !document.getElementById('loader'), null, { timeout: 240000, polling: 500 });
  await g(async () => { await document.fonts.ready; });
  // a returning player: the First Evening done, three runs behind, every first-run tip already seen (deterministic HUD frames)
  await g(() => {
    const c = window.__gw, m = c.state.meta;
    m.runs = 3; m.deaths = 3; m.bestDay = 3;
    if (m.firstEvening) m.firstEvening.done = true;
    try { c.debug.firstEvening?.('done'); } catch { /* optional */ }
    m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) m.seenTips[t.id] = true;
    m.journal = m.journal || {};
    m.journal.mossback_perch = { caught: 7, biggest: 0.6, pbLength: 24 };
    m.journal.reedjaw_pike = { caught: 2, biggest: 3.2, pbLength: 80 };
    c.game.save?.();
  });
  if (await g(() => window.__gw.flow !== 'title')) { await g(() => window.__gw.game.toTitle?.() ?? window.__gw.game.quitToTitle?.()); await wait(1500); }
  await page.mouse.move(2, 200);
  await g(() => {
    const c = window.__gw;
    try { c.render.setQuality?.('medium'); } catch { /* optional */ }
    const raf = window.requestAnimationFrame.bind(window);
    let held = null;
    window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
    window.__rafHold = (on) => { if (on) { held = held || []; return true; } if (held) { const q = held; held = null; for (const cb of q) raf(cb); } return false; };
    window.__pump = (sec = 1) => {
      if (window.__perfOff === undefined) { const realNow = performance.now.bind(performance); window.__perfOff = 0; performance.now = () => realNow() + window.__perfOff; }
      for (let i = 0; i < Math.ceil(sec / 0.25); i++) { window.__perfOff += 250; try { c.ui.update(0.25); } catch { /* keep going */ } }
    };
  });
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 240) => { const f0 = await frameNo(), t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(150); } return false; };
  const waitFor = async (fn, arg, timeoutS = 60, stepMs = 250) => { const t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  await scale(0.4);
  async function shot(name, { keep = false, settle = 600, quiet = false } = {}) {
    if (quiet) for (let i = 0; i < 20; i++) {
      const busy = await g(() => !!document.querySelector('#ui .gw-banner') || !!document.querySelector('#ui .gw-toast:not(.gw-held)'));
      if (!busy) break;
      await g(() => window.__pump(1.5));
      await wait(350);
    }
    void keep;
    await scale(1);
    await frames(2);
    await wait(settle);
    await g(() => window.__rafHold(true));
    await wait(200);
    inv[name] = await g(inventory).catch((e) => ({ error: String(e) }));
    const p = resolve(shotsDir, `${name}.png`);
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) { try { await page.screenshot({ path: p, timeout: 240000 }); ok = true; } catch (e) { log('shot retry', name, String(e?.message || e).split('\n')[0]); } }
    await g(() => window.__rafHold(false));
    await scale(0.4);
    log('screenshot', p, `${inv[name]?.words ?? '?'} words`);
    writeFileSync(resolve(shotsDir, 'inventory.json'), JSON.stringify(inv, null, 1));
    return ok;
  }
  const freeze = (on = true) => g((on) => window.__gw.debug.timeScale(on ? 0 : 1), on);
  const idleFishing = () => g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } try { c.fishing.reset?.(); } catch { /* optional */ } });
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => ({ b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused, n: window.__gw.debug.ui?.()?.stack?.length || 0 }));
      if (!m.b && !m.p && !m.n) return;
      await g(() => { const c = window.__gw; const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
      await frames(2);
    }
  };
  const pin = () => g(() => { const c = window.__gw; c.debug.god?.(true); c.debug.setOil(72); c.debug.setSatiety(80); });
  const startRun = async (mode) => {
    await clearModals();
    await g((mode) => window.__gw.game.startNewRun({ character: 'wick', nightMode: mode }), mode);
    await waitFor(() => window.__gw.flow === 'playing', null, 120);
    await frames(4);
    await clearModals();
    await g((mode) => { const c = window.__gw; c.debug.mode?.(mode); const r = c.state.run; r.bait = { ...(r.bait || {}), mireworm: 6 }; try { c.progression.equipBait?.('mireworm'); } catch { /* optional */ } r.day = 2; }, mode);
    await pin();
    await g(() => window.__gw.debug.setPhase('calm'));
    await frames(3);
  };

  // ---------------------------------------------------------------- title
  if (want('title')) { await g(() => window.__pump(3)); await shot('01-title', { quiet: true }); }

  await startRun('lantern');
  // ---------------------------------------------------------------- calm sailing
  if (want('calm')) {
    await shot('02-calm-banner', { settle: 300 });   // the day / lake banner as it rises
    await freeze(true);
    await shot('02-calm', { quiet: true });
    await freeze(false);
  }
  // ---------------------------------------------------------------- aiming (charging) and waiting
  if (want('aim') || want('wait') || want('bite') || want('reel') || want('measure') || want('catch')) {
    await idleFishing();
    await pin();
    await g(() => window.__gw.debug.timeScale(1));
    const cx = width / 2, cy = api.height * 0.42;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await waitFor(() => window.__gw.fishing.state === 'charging', null, 20, 100);
    await frames(6);
    if (want('aim')) { await shot('03-aim', { settle: 200 }); }
    await page.mouse.up();
    await page.mouse.move(2, api.height * 0.5);   // no hover over the float's favour
    await waitFor(() => window.__gw.fishing.state === 'waiting', null, 60, 200);
    await frames(6);
    if (want('wait')) { await freeze(true); await shot('04-wait', { quiet: true }); await freeze(false); }
    // the bite (forced, a Keeper-size pike), the strike, the automatic play
    await g(() => window.__gw.debug.fishOutcome('land'));
    await g(() => window.__gw.debug.forceBite({ speciesId: 'reedjaw_pike', z: 1.2, wait: 0.2 }));
    await waitFor(() => window.__gw.fishing.state === 'bite', null, 60, 60);
    await freeze(true);
    if (want('bite')) await shot('05-bite', { settle: 300 });
    await freeze(false);
    await g(() => window.__gw.debug.fishStrike('clean'));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 30, 100);
    await waitFor(() => { const p = window.__gw.debug.fishPlay?.(); return !p || p.t > Math.min(3, p.dur * 0.45); }, null, 60, 200);
    await freeze(true);
    if (want('reel')) await shot('06-reel', { settle: 300 });
    await freeze(false);
    // the measuring ceremony and the card
    const cer = await waitFor(() => !!window.__gw.ui.measureDebug?.() && window.__gw.ui.measureDebug().t > 0.9, null, 120, 100);
    if (want('measure') && cer) { await g(() => window.__rafHold(true)); inv['07-measure'] = await g(inventory); await page.screenshot({ path: resolve(shotsDir, '07-measure.png'), timeout: 240000 }).catch(() => {}); await g(() => window.__rafHold(false)); log('screenshot 07-measure', inv['07-measure']?.words); }
    await waitFor(() => window.__gw.debug.ui()?.openModal === 'catch', null, 120, 200);
    await wait(2600);
    if (want('catch')) await shot('08-catch', { settle: 400 });
    await g(() => { document.querySelector('#ui .gw-m-catch [data-action="keep"]')?.click() || document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click(); });
    await clearModals();
    await wait(1500);   // a banked level-up left unpicked on the card opens its own picker next
    await clearModals();
  }
  // ---------------------------------------------------------------- the got-away note
  if (want('away')) {
    await idleFishing();
    await pin();
    // a Trophy lost: the ink card (Small–Prize get the one-line note)
    await g(() => { window.__gw.debug.fishOutcome('lose', 'thrown'); window.__gw.debug.fishHook?.('reedjaw_pike', { z: 2.4 }); });
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 30, 100);
    const lost = await waitFor(() => !!document.querySelector('#ui .gw-gotaway.gw-on, #ui .gw-away.gw-on'), null, 180, 100);
    await freeze(true);
    await wait(700);
    if (lost) await shot('09-away', { settle: 200 });
    await freeze(false);
    await g(() => window.__gw.debug.fishOutcome(null));
    await clearModals();
  }
  // ---------------------------------------------------------------- dusk
  if (want('dusk')) {
    await idleFishing();
    await pin();
    await g(() => window.__gw.debug.setPhase('dusk'));
    await frames(3);
    await freeze(true);
    await shot('10-dusk-banner', { settle: 300 });
    await shot('10-dusk', { quiet: true });
    await freeze(false);
  }
  // ---------------------------------------------------------------- a Lantern swarm
  if (want('lantern')) {
    await pin();
    await g(() => window.__gw.debug.setPhase('gloomtide'));
    await frames(3);
    await g(() => { const c = window.__gw; c.debug.swarmNow?.(); c.debug.spawn?.('mote', 8); });
    await frames(8);
    await freeze(true);
    await shot('12-lantern', { quiet: true });
    await freeze(false);
    await g(() => window.__gw.debug.killAll?.());
  }
  // ---------------------------------------------------------------- Murk's shop
  if (want('shop')) {
    await g(() => window.__gw.debug.setPhase('calm'));
    await frames(2);
    await g(() => window.__gw.ui.openShop());
    await waitFor(() => window.__gw.debug.ui().openModal === 'shop', null, 30, 200);
    await shot('13-shop', { settle: 500 });
    await clearModals();
  }
  // ---------------------------------------------------------------- pause
  if (want('pause')) {
    await g(() => window.__gw.game.pause());
    await waitFor(() => !!document.querySelector('#ui .gw-m-pause'), null, 30, 200);
    await shot('14-pause', { settle: 500 });
    await clearModals();
  }
  // ---------------------------------------------------------------- a Still night
  if (want('still')) {
    await startRun('still');
    await g(() => window.__gw.debug.setPhase('gloomtide'));
    await frames(4);
    await freeze(true);
    await shot('11-still', { quiet: true });
    await freeze(false);
  }
  // ---------------------------------------------------------------- death
  if (want('death')) {
    await clearModals();
    await g(() => { const c = window.__gw; c.debug.god?.(false); c.debug.setHp(0); });
    await waitFor(() => window.__gw.flow === 'dead' || !!document.querySelector('#ui .gw-m-death'), null, 60, 200);
    for (let i = 0; i < 12; i++) { await g(() => window.__pump(1)); await wait(150); }
    await shot('15-death', { settle: 600 });
  }
  const summary = Object.fromEntries(Object.entries(inv).map(([k, v]) => [k, v?.words]));
  log('WORDS', JSON.stringify(summary));
  return { failures };
}
