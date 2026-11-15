// Renders the page with Playwright: the three deliverable PNGs and a folder of close looks.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function renderShots(chromium, outDir, log = () => {}, only = null) {
  const url = pathToFileURL(path.join(outDir, 'preview.html')).href;
  const checks = path.join(outDir, 'checks');
  fs.mkdirSync(checks, { recursive: true });
  const browser = await chromium.launch();
  const open = async (opts) => {
    const context = await browser.newContext({ deviceScaleFactor: 1, ...opts });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(url);
    await page.waitForFunction(() => window.__chart && window.__chart.state.ready, null, { timeout: 60000 });
    await page.evaluate(() => (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 6000))]) : null));
    await page.waitForTimeout(500);
    return { context, page, errors };
  };
  const settle = (page, ms = 350) => page.waitForTimeout(ms);
  const want = (name) => !only || only.includes(name);
  const shot = async (page, file) => { await page.screenshot({ path: file }); log(`  ${path.relative(outDir, file)}`); };

  // ---- desktop
  const d = await open({ viewport: { width: 1600, height: 1000 } });
  const fonts = await d.page.evaluate(() => ({ fell: document.fonts.check('italic 15px "IM Fell English"'), marcellus: document.fonts.check('12px "Marcellus SC"'), alegreya: document.fonts.check('15px Alegreya') }));
  log(`  web fonts loaded: ${JSON.stringify(fonts)}`);
  const overflow = async (page) => page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, scrollH: document.documentElement.scrollHeight, clientH: document.documentElement.clientHeight }));
  if (want('desktop')) await shot(d.page, path.join(outDir, 'map-desktop.png'));
  if (want('journey')) {
    await d.page.evaluate(() => { const c = window.__chart; c.setMode('blank'); c.journeyStill(16, 0.82); c.fit(); document.getElementById('caption').innerHTML = '<b>16</b>The Inkwood. West from the lagoon’s head up the Monsoon Cut, then upstream under the closed canopy.'; document.getElementById('caption').classList.add('is-on'); });
    await settle(d.page);
    await shot(d.page, path.join(outDir, 'map-journey.png'));
  }
  if (want('checks')) {
    const look = async (name, fn, arg) => { await d.page.evaluate(fn, arg); await settle(d.page, 450); await shot(d.page, path.join(checks, name + '.png')); };
    await d.page.evaluate(() => { const c = window.__chart; c.stopJourney(); document.getElementById('caption').classList.remove('is-on'); c.setMode('inked'); c.setOwned(16); c.select(null); });
    await look('d-kingdom', () => window.__chart.look([330, 160, 660, 480], 20));
    await look('d-coldrim', () => window.__chart.look([60, 170, 420, 660], 20));
    await look('d-fold-step', () => window.__chart.look([80, 600, 560, 1040], 20));
    await look('d-south', () => window.__chart.look([200, 940, 980, 1340], 20));
    await look('d-heart', () => window.__chart.look([560, 820, 960, 1140], 20));
    await look('d-east', () => window.__chart.look([560, 120, 1000, 800], 20));
    await look('d-mossmere', () => window.__chart.look([540, 170, 650, 280], 20));
    await look('d-title', () => window.__chart.look([-50, 1230, 330, 1450], 10));
    await look('d-corner', () => window.__chart.look([760, -50, 1050, 220], 10));
    await look('d-scale', () => window.__chart.look([760, 1250, 1050, 1450], 10));
    await look('d-card', () => { const c = window.__chart; c.fit(); c.select(5); });
    await d.page.waitForTimeout(1100); await shot(d.page, path.join(checks, 'd-card.png'));
    for (const n of [1, 4, 8, 12]) {
      await d.page.evaluate((k) => { const c = window.__chart; c.select(null); c.setMode('blank'); c.setOwned(k); c.fit(); }, n);
      await settle(d.page, 450); await shot(d.page, path.join(checks, `d-owned-${n}.png`));
    }
    await d.page.evaluate(() => { const c = window.__chart; c.setMode('faint'); c.setOwned(6); c.fit(); });
    await settle(d.page, 450); await shot(d.page, path.join(checks, 'd-faint-6.png'));
  }
  if (want('checks')) {
    // ---- behaviour: wheel, drag, tap, slider, journey
    const pg = d.page, st = () => pg.evaluate(() => { const s = window.__chart.state; return { k: s.view.k, x: s.view.x, y: s.view.y, owned: s.owned, mode: s.mode, sel: s.sel, raft: !!s.raft, phase: s.journey && s.journey.phase, leg: s.journey && s.journey.leg, card: !document.getElementById('card').hidden }; });
    const ok = (name, cond) => log(`  ${cond ? 'pass' : 'FAIL'}  ${name}`);
    await pg.evaluate(() => { const c = window.__chart; c.stopJourney(); c.select(null); c.setMode('inked'); c.setOwned(16); c.fit(); });
    const box = await pg.locator('#chart').boundingBox();
    const cxp = box.x + box.width / 2, cyp = box.y + box.height / 2;
    let a = await st();
    await pg.mouse.move(cxp, cyp); await pg.mouse.wheel(0, -600); await settle(pg, 200);
    let b = await st(); ok('wheel zooms in', b.k > a.k * 1.5);
    await pg.mouse.move(cxp, cyp); await pg.mouse.down(); await pg.mouse.move(cxp + 120, cyp + 60, { steps: 6 }); await pg.mouse.up(); await settle(pg, 200);
    let c2 = await st(); ok('drag pans', Math.abs(c2.x - b.x) > 20 && !c2.card);
    await pg.evaluate(() => window.__chart.fit()); await settle(pg, 200);
    const pos = await pg.evaluate(() => { const s = window.__chart.state, w = [220, 312]; return [(w[0] - s.view.x) * s.view.k + s.vw / 2, (w[1] - s.view.y) * s.view.k + s.vh / 2]; });
    await pg.mouse.click(box.x + pos[0], box.y + pos[1]); await settle(pg, 1200);
    let e2 = await st(); ok('a tap on a water opens its card', e2.card && e2.sel === 5);
    await pg.keyboard.press('Escape'); await pg.locator('#cardClose').click({ trial: true }).catch(() => {});
    await pg.evaluate(() => window.__chart.select(null));
    await pg.locator('#owned').fill('6'); await settle(pg, 1300);
    let f2 = await st(); ok('the slider charts six maps and blanks the rest', f2.owned === 6 && f2.mode === 'blank' && f2.sel === 6);
    await shot(pg, path.join(checks, 'd-slider-6.png'));
    await pg.evaluate(() => window.__chart.select(null));
    await pg.locator('#journey').click(); await pg.waitForTimeout(4200);
    let g2 = await st(); ok('the journey sails', g2.raft && (g2.phase === 'sail' || g2.phase === 'dwell' || g2.phase === 'fly') && g2.owned <= 3);
    await shot(pg, path.join(checks, 'd-journey-live.png'));
    await pg.locator('#journey').click(); await settle(pg, 300);
    const paused = await pg.evaluate(() => window.__chart.state.journey.paused); ok('the journey pauses', paused === true);
    // run the rest of the journey fast: the ending turns the lamps gold
    await pg.evaluate(() => { const c = window.__chart; c.state.journey.paused = false; c.state.journey.leg = 16; c.state.journey.phase = 'dwell'; c.state.journey.t0 = performance.now() - 5000; c.setOwned(16); c.state.view.k += 0; });
    await pg.locator('#zoomIn').click(); await pg.waitForTimeout(7200);
    const end = await pg.evaluate(() => ({ phase: window.__chart.state.journey && window.__chart.state.journey.phase, gold: window.__chart.state.gold, text: document.getElementById('journey').textContent }));
    ok('the journey ends in gold', end.phase === 'done' && end.gold >= 17 && end.text === 'Sail again');
    await shot(pg, path.join(checks, 'd-journey-end.png'));
  }
  log(`  desktop overflow: ${JSON.stringify(await overflow(d.page))}${d.errors.length ? '  errors: ' + d.errors.join(' | ') : ''}`);
  await d.context.close();

  if (want('checks')) {
    // ---- reduced motion: the button steps, nothing flies
    const r = await open({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const t0 = await r.page.locator('#journey').textContent();
    await r.page.locator('#journey').click(); await r.page.locator('#journey').click(); await settle(r.page, 300);
    const s2 = await r.page.evaluate(() => { const s = window.__chart.state; return { owned: s.owned, raft: !!s.raft, tween: !!s.tween, journey: !!s.journey, mode: s.mode }; });
    log(`  ${t0 === 'Next water' && s2.owned === 2 && s2.raft && !s2.tween && !s2.journey ? 'pass' : 'FAIL'}  reduced motion steps the road without animation`);
    await shot(r.page, path.join(checks, 'r-step-2.png'));
    await r.context.close();
  }

  // ---- phone
  const p = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (want('phone')) await shot(p.page, path.join(outDir, 'map-phone.png'));
  if (want('checks')) {
    await p.page.evaluate(() => window.__chart.pick(9));
    await p.page.waitForTimeout(1300); await shot(p.page, path.join(checks, 'p-card.png'));
    await p.page.evaluate(() => { const c = window.__chart; c.select(null); document.getElementById('roadToggle').click(); });
    await settle(p.page); await shot(p.page, path.join(checks, 'p-road.png'));
    await p.page.evaluate(() => { document.getElementById('roadToggle').click(); const c = window.__chart; c.setMode('blank'); c.setOwned(6); c.look([60, 150, 660, 540], 14); });
    await settle(p.page); await shot(p.page, path.join(checks, 'p-owned-6.png'));
    await p.page.evaluate(() => { const c = window.__chart; c.setMode('inked'); c.setOwned(16); c.look([520, 800, 960, 1150], 10); });
    await settle(p.page); await shot(p.page, path.join(checks, 'p-heart.png'));
  }
  if (want('checks')) {
    const res = await p.page.evaluate(async () => {
      const c = window.__chart, el = document.getElementById('chart'), r = el.getBoundingClientRect();
      c.setMode('inked'); c.select(null); c.fit();
      await new Promise((q) => setTimeout(q, 100));
      const k0 = c.state.view.k, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const ev = (type, id, x, y) => el.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, isPrimary: id === 11 }));
      ev('pointerdown', 11, cx - 30, cy); ev('pointerdown', 12, cx + 30, cy);
      for (let i = 1; i <= 6; i++) { ev('pointermove', 11, cx - 30 - i * 12, cy); ev('pointermove', 12, cx + 30 + i * 12, cy); }
      ev('pointerup', 11, cx - 102, cy); ev('pointerup', 12, cx + 102, cy);
      await new Promise((q) => setTimeout(q, 100));
      const k1 = c.state.view.k, x1 = c.state.view.x;
      ev('pointerdown', 13, cx, cy); for (let i = 1; i <= 5; i++) ev('pointermove', 13, cx + i * 14, cy); ev('pointerup', 13, cx + 70, cy);
      await new Promise((q) => setTimeout(q, 100));
      return { k0, k1, x1, x2: c.state.view.x };
    });
    log(`  ${res.k1 > res.k0 * 2 ? 'pass' : 'FAIL'}  pinch zooms on a phone   ${res.x2 < res.x1 - 5 ? 'pass' : 'FAIL'}  one finger pans`);
  }
  log(`  phone overflow: ${JSON.stringify(await overflow(p.page))}${p.errors.length ? '  errors: ' + p.errors.join(' | ') : ''}`);
  await p.context.close();
  await browser.close();
}
