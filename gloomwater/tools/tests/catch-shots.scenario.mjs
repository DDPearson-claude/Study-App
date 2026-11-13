// The landing's payoff, captured (the user's ask of 2026-11-13: "I want it to feel more like a win when you catch one"): for a
// Small, a Prize, a Trophy, an Elder and a new-species record, a sequence of frames through the landing on the v3 phase-1 build:
// a-reveal (the ink flooding off the fish beside the raft), b-climax (the glory and the flare at the pose), c-cord (the count running),
// d-stamp, e-card.
// The game's clocks are slowed at each beat (debug.timeScale for the reveal, debug.cerRate for the ceremony) so a slow software-GL
// frame lands where it should; the art is the game's own at full speed.
//
//   node build.mjs --dev --out=tools/out/polish/catch/dev.html   (then insert the GW_V3 / GW_V3_PHASE=1 script, or let this add ?v3=1)
//   node tools/playtest.mjs --html=tools/out/polish/catch/v3.html --shots=tools/out/polish/catch/desktop --script=tools/tests/catch-shots.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/polish/catch/v3.html --shots=tools/out/polish/catch/phone --script=tools/tests/catch-shots.scenario.mjs --mobile
//   (--only=small,elder takes a subset)
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

const CASES = [
  // name, species, z, frames
  ['small', 'mossback_perch', -0.7, ['reveal', 'climax', 'stamp', 'card']],
  ['prize', 'reedjaw_pike', 1.5, ['reveal', 'climax', 'cord', 'stamp', 'card']],
  ['trophy', 'reedjaw_pike', 2.4, ['reveal', 'climax', 'cord', 'stamp', 'card']],
  ['elder', 'reedjaw_pike', 3.0, ['reveal', 'climax', 'cord', 'stamp', 'card']],
  ['new', 'gloam_eel', 1.6, ['reveal', 'climax', 'stamp', 'card']],
];

export default async function (api) {
  const { page, wait, evalGame: g, log, args } = api;
  page.setDefaultTimeout(240000);
  const failures = [];
  const only = args?.only ? String(args.only).toLowerCase().split(',') : null;
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/polish/catch/shots'));
  mkdirSync(shotsDir, { recursive: true });
  const notes = {};

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
  });
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 120) => { const f0 = await frameNo(), t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(100); } return false; };
  const waitFor = async (fn, arg, timeoutS = 60, stepMs = 120) => { const t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  await scale(0.5);
  async function shot(name) {
    await g(() => window.__rafHold(true));
    await scale(1);
    await g(() => window.__rafHold(false));
    await frames(1, 60);
    await g(() => window.__rafHold(true));
    await wait(150);
    const p = resolve(shotsDir, `${name}.png`);
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) { try { await page.screenshot({ path: p, timeout: 240000 }); ok = true; } catch (e) { log('shot retry', name, String(e?.message || e).split('\n')[0]); } }
    notes[name] = await g(() => { const c = window.__gw; return { rev: c.debug.fishReveal?.() || null, cer: c.debug.ceremony?.() ? { t: c.debug.ceremony().t, stamped: c.debug.ceremony().stamped, pose: c.debug.ceremony().pose } : null, modal: c.debug.ui?.()?.openModal || null, slowmo: c.debug.beats?.()?.slowmo || null }; }).catch(() => null);
    await scale(0.5);
    await g(() => window.__rafHold(false));
    log('screenshot', p, JSON.stringify(notes[name]));
    return ok;
  }
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => ({ b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused, n: window.__gw.debug.ui?.()?.stack?.length || 0 }));
      if (!m.b && !m.p && !m.n) return;
      await g(() => { const c = window.__gw; const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
      await frames(2);
    }
  };
  const pin = () => g(() => { const c = window.__gw; c.debug.god?.(true); c.debug.setOil(72); c.debug.setSatiety(80); });
  await clearModals();
  await g(() => window.__gw.game.startNewRun({ character: 'wick', nightMode: 'still' }));
  await waitFor(() => window.__gw.flow === 'playing', null, 120);
  await frames(4);
  await clearModals();
  await g(() => { const c = window.__gw; c.debug.mode?.('still'); c.state.run.day = 2; });
  await pin();
  await g(() => window.__gw.debug.setPhase('calm'));
  await frames(3);

  for (const [name, sp, z, want] of CASES) {
    if (only && !only.includes(name)) continue;
    await clearModals();
    await g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } try { c.fishing.reset?.(); } catch { /* optional */ } c.debug.timeScale(1); c.debug.cerRate?.(1); });
    await pin();
    await frames(2);
    // a real cast ahead of the raft (the camera's framing of a real landing), then the bite forced and struck clean
    const W = api.width, H = api.height;
    await page.mouse.move(W / 2, H * 0.42);
    await page.mouse.down();
    await waitFor(() => window.__gw.fishing.state === 'charging', null, 20, 80);
    await frames(5);
    await page.mouse.up();
    await page.mouse.move(2, H * 0.5);
    await waitFor(() => window.__gw.fishing.state === 'waiting', null, 60, 150);
    await frames(3);
    await g(([sp, z]) => { const c = window.__gw; c.debug.fishOutcome('land'); c.debug.forceBite({ speciesId: sp, z, wait: 0.2 }); }, [sp, z]);
    const bit = await waitFor(() => window.__gw.fishing.state === 'bite', null, 60, 60);
    if (!bit) { failures.push(`${name}: no bite for ${sp}`); continue; }
    await g(() => window.__gw.debug.fishStrike('clean'));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 30);
    await g(() => window.__gw.debug.fishPlayTo(0.93));
    // the reveal: slow its clock to a crawl, take it as the band runs down the body
    await waitFor(() => window.__gw.fishing.state === 'landing' || !!window.__gw.debug.fishReveal?.()?.dur, null, 90, 60);
    await g(() => window.__gw.debug.timeScale(0.06));
    if (want.includes('reveal')) {
      await waitFor(() => (window.__gw.debug.fishReveal?.()?.k ?? 1) >= 0.42, null, 60, 80);
      await shot(`${name}-a-reveal`);
    }
    // the climax: the glory behind the fish, the flame flaring (the ceremony's clock slowed for the frames that follow)
    await g(() => window.__gw.debug.cerRate(0.22));
    await g(() => window.__gw.debug.timeScale(1));
    await waitFor(() => !!window.__gw.debug.ceremony?.()?.active, null, 60, 60);
    if (want.includes('climax')) {   // the climax fires at the pose, once the trophy camera has framed the held fish
      await waitFor(() => { const c = window.__gw.debug.ceremony?.(); return !c?.active || (!c.climaxPending && c.t >= (c.climaxAt ?? 0) + 0.35); }, null, 90, 80);
      await shot(`${name}-b-climax`);
    }
    if (want.includes('cord')) {
      await waitFor(() => { const c = window.__gw.debug.ceremony?.(); return !c?.active || (c.t >= c.cordStart + (c.beats.cord - c.cordStart) * 0.55); }, null, 90, 80);
      await shot(`${name}-c-cord`);
    }
    if (want.includes('stamp')) {
      await waitFor(() => { const c = window.__gw.debug.ceremony?.(); return !c?.active || c.stamped; }, null, 90, 60);
      await g(() => window.__gw.debug.cerRate(0.35));
      await wait(250);
      await shot(`${name}-d-stamp`);
    }
    await g(() => window.__gw.debug.cerRate(1));
    const card = await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 90, 150);
    if (!card) failures.push(`${name}: no catch card`);
    else if (want.includes('card')) { await wait(1900); await shot(`${name}-e-card`); }
    await g(() => { document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click() || document.querySelector('#ui .gw-m-catch [data-action="keep"]')?.click(); });
    await clearModals();
    await wait(600);
    await clearModals();
  }
  await g(() => { const c = window.__gw; c.debug.fishOutcome(null); c.debug.timeScale(1); c.debug.cerRate?.(1); });
  writeFileSync(resolve(shotsDir, 'notes.json'), JSON.stringify(notes, null, 1));
  return { failures };
}
