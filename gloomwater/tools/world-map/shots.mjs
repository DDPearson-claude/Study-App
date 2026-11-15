// Renders the page with Playwright: the three deliverable PNGs and a folder of close looks and
// behaviour checks. The deliverables are taken in the dark scheme (the game's night table); one
// check is taken in the light scheme.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function renderShots(chromium, outDir, log = () => {}, only = null) {
  const url = pathToFileURL(path.join(outDir, 'preview.html')).href;
  const checks = path.join(outDir, 'checks');
  fs.mkdirSync(checks, { recursive: true });
  const browser = await chromium.launch();
  const allErrors = [];
  const open = async (opts) => {
    const context = await browser.newContext({ deviceScaleFactor: 1, colorScheme: 'dark', ...opts });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => { errors.push(e.message); allErrors.push(e.message); });
    page.on('console', (m) => { if (m.type() === 'error') { errors.push(m.text()); allErrors.push(m.text()); } });
    await page.goto(url);
    await page.waitForFunction(() => window.__chart && window.__chart.state.ready, null, { timeout: 60000 });
    await page.evaluate(() => (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 6000))]) : null));
    await page.waitForTimeout(600);
    return { context, page, errors };
  };
  const settle = (page, ms = 350) => page.waitForTimeout(ms);
  const want = (name) => !only || only.includes(name);
  const shot = async (page, file) => { await page.screenshot({ path: file }); log(`  ${path.relative(outDir, file)}`); };
  const ok = (name, cond) => log(`  ${cond ? 'pass' : 'FAIL'}  ${name}`);
  const overflow = async (page) => page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, scrollH: document.documentElement.scrollHeight, clientH: document.documentElement.clientHeight }));
  const noScroll = (o) => o.scrollW <= o.clientW && o.scrollH <= o.clientH;

  // ---- desktop
  const d = await open({ viewport: { width: 1600, height: 1000 } });
  const fonts = await d.page.evaluate(() => ({ fell: document.fonts.check('italic 15px "IM Fell English"'), marcellus: document.fonts.check('12px "Marcellus SC"'), alegreya: document.fonts.check('15px Alegreya'), hand: document.fonts.check('15px "Cedarville Cursive"') }));
  log(`  web fonts loaded: ${JSON.stringify(fonts)}`);
  if (want('desktop')) await shot(d.page, path.join(outDir, 'map-desktop.png'));
  if (want('journey')) {
    await d.page.evaluate(() => { const c = window.__chart; c.journeyStill(16, 0.7); c.fit(); document.getElementById('caption').innerHTML = '<b>16</b>The Inkwood. West from the lagoon’s head up the Monsoon Cut, about 140 km through the drowned orchard rows, then upstream under the closed canopy.'; document.getElementById('caption').classList.add('is-on'); });
    await settle(d.page);
    await shot(d.page, path.join(outDir, 'map-journey.png'));
    await d.page.evaluate(() => { const c = window.__chart; c.stopJourney(); c.state.raft = null; document.getElementById('caption').classList.remove('is-on'); c.fit(); });
  }
  if (want('checks')) {
    const look = async (name, fn, arg) => { await d.page.evaluate(fn, arg); await settle(d.page, 450); await shot(d.page, path.join(checks, name + '.png')); };
    await d.page.evaluate(() => { const c = window.__chart; c.stopJourney(); c.setMode('chart'); c.setOwned(16); c.select(null); });
    await look('d-kingdom', () => window.__chart.look([330, 150, 680, 480], 20));
    await look('d-coldrim', () => window.__chart.look([40, 170, 420, 660], 20));
    await look('d-fold-step', () => window.__chart.look([60, 600, 560, 1040], 20));
    await look('d-south', () => window.__chart.look([200, 940, 1000, 1360], 20));
    await look('d-heart', () => window.__chart.look([560, 820, 980, 1140], 20));
    await look('d-east', () => window.__chart.look([560, 80, 1040, 800], 20));
    await look('d-mossmere', () => window.__chart.look([540, 150, 660, 280], 20));
    await look('d-lagoon', () => window.__chart.look([760, 930, 900, 1040], 20));
    await look('d-title', () => window.__chart.look([-80, 1230, 330, 1480], 10));
    await look('d-corner', () => window.__chart.look([560, -80, 1080, 220], 10));
    await look('d-world', () => { const c = window.__chart; c.setMode('world'); c.fit(); });
    await d.page.evaluate(() => { const c = window.__chart; c.setMode('chart'); c.fit(); c.select(5); });
    await d.page.waitForTimeout(1300); await shot(d.page, path.join(checks, 'd-card.png'));
    for (const n of [1, 4, 8, 12, 15]) {
      await d.page.evaluate((k) => { const c = window.__chart; c.select(null); c.setMode('chart'); c.setOwned(k); c.fit(); }, n);
      await settle(d.page, 450); await shot(d.page, path.join(checks, `d-owned-${n}.png`));
    }
  }
  if (want('checks')) {
    // ---- behaviour: wheel, drag, tap, slider, journey
    const pg = d.page, st = () => pg.evaluate(() => { const s = window.__chart.state; return { k: s.view.k, x: s.view.x, y: s.view.y, owned: s.owned, mode: s.mode, sel: s.sel, raft: !!s.raft, phase: s.journey && s.journey.phase, leg: s.journey && s.journey.leg, card: !document.getElementById('card').hidden, hearth: s.hearthFull }; });
    await pg.evaluate(() => { const c = window.__chart; c.stopJourney(); c.select(null); c.setMode('chart'); c.setOwned(16); c.fit(); });
    const box = await pg.locator('#chart').boundingBox();
    const cxp = box.x + box.width / 2, cyp = box.y + box.height / 2;
    const a = await st();
    await pg.mouse.move(cxp, cyp); await pg.mouse.wheel(0, -600); await settle(pg, 200);
    const b = await st(); ok('wheel zooms in', b.k > a.k * 1.5);
    await pg.mouse.move(cxp, cyp); await pg.mouse.down(); await pg.mouse.move(cxp + 120, cyp + 60, { steps: 6 }); await pg.mouse.up(); await settle(pg, 200);
    const c2 = await st(); ok('drag pans', Math.abs(c2.x - b.x) > 20 && !c2.card);
    await pg.evaluate(() => window.__chart.fit()); await settle(pg, 200);
    const pos = await pg.evaluate(() => { const s = window.__chart.state, w = [220, 312]; return [(w[0] - s.view.x) * s.view.k + s.vw / 2, (w[1] - s.view.y) * s.view.k + s.vh / 2]; });
    await pg.mouse.click(box.x + pos[0], box.y + pos[1] - 3); await settle(pg, 1200);
    const e2 = await st(); ok('a tap on a water opens its card', e2.card && e2.sel === 5);
    await pg.keyboard.press('Escape');
    await pg.evaluate(() => window.__chart.select(null));
    await pg.locator('#owned').fill('6'); await settle(pg, 1500);
    const f2 = await st(); ok('the slider charts six maps', f2.owned === 6 && f2.mode === 'chart' && f2.sel === 6);
    await shot(pg, path.join(checks, 'd-slider-6.png'));
    const list = await pg.evaluate(() => ({ named: [...document.querySelectorAll('.ev-water')].filter((q) => !q.parentNode.hidden && !q.classList.contains('is-sealed')).length, sealed: document.querySelectorAll('.ev-water.is-sealed').length, acts: [...document.querySelectorAll('.ev-act')].filter((q) => !q.hidden && !q.classList.contains('is-next')).length }));
    ok('the road list names only owned waters (and one sealed sheet)', list.named === 7 && list.sealed === 1 && list.acts === 2);
    await pg.evaluate(() => window.__chart.select(null));
    await pg.locator('#journey').click(); await pg.waitForTimeout(4600);
    const g2 = await st(); ok('the journey sails', g2.raft && ['sail', 'dwell', 'fly'].includes(g2.phase) && g2.owned <= 3);
    await shot(pg, path.join(checks, 'd-journey-live.png'));
    await pg.locator('#journey').click(); await settle(pg, 300);
    const paused = await pg.evaluate(() => window.__chart.state.journey.paused); ok('the journey pauses', paused === true);
    await pg.locator('#journeyStop').click(); await settle(pg, 900);
    const h2 = await st(); ok('stopping gives the slider back (6 maps)', h2.owned === 6 && !h2.raft);
    // a long leg is framed from far out: the Long Coast
    await pg.locator('#journey').click();
    await pg.evaluate(() => { const c = window.__chart, j = c.state.journey; j.leg = 8; j.phase = 'dwell'; j.t0 = performance.now() - 5000; c.setOwned(8); });
    await pg.waitForTimeout(4200);
    const far = await st(); ok('the Long Coast is sailed in a whole-continent view', far.leg === 9 && far.k < 1.0);
    await shot(pg, path.join(checks, 'd-journey-coast.png'));
    // run on to the end: only the Landing's hearth changes
    await pg.evaluate(() => { const c = window.__chart, j = c.state.journey; j.leg = 16; j.phase = 'dwell'; j.t0 = performance.now() - 5000; c.setOwned(16); });
    await pg.waitForTimeout(2600);
    const end = await pg.evaluate(() => ({ phase: window.__chart.state.journey && window.__chart.state.journey.phase, hearth: window.__chart.state.hearthFull, text: document.getElementById('journey').textContent }));
    ok('the journey ends at home with the hearth full', end.phase === 'done' && end.hearth === true && end.text === 'Sail again');
    await shot(pg, path.join(checks, 'd-journey-end.png'));
  }
  const od = await overflow(d.page);
  ok(`desktop: no page scroll ${JSON.stringify(od)}`, noScroll(od));
  await d.context.close();

  if (want('checks')) {
    // ---- 1280 x 800, light scheme: the whole sheet in view, nothing clipped
    const l = await open({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
    await shot(l.page, path.join(checks, 'l-1280-light.png'));
    const whole = await l.page.evaluate(() => { const s = window.__chart.state, k = s.view.k, sh = DATA.sheet; return (sh.w * k <= s.vw + 0.5) && (sh.h * k <= s.vh + 0.5); });
    ok('1280 x 800: the full view holds the whole sheet', whole);
    await l.page.evaluate(() => window.__chart.pick(12)); await l.page.waitForTimeout(1300);
    await shot(l.page, path.join(checks, 'l-1280-card.png'));
    await l.context.close();
    // ---- reduced motion: the button steps, nothing flies
    const r = await open({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const t0 = await r.page.locator('#journey').textContent();
    await r.page.locator('#journey').click(); await r.page.locator('#journey').click(); await settle(r.page, 300);
    const s2 = await r.page.evaluate(() => { const s = window.__chart.state; return { owned: s.owned, raft: !!s.raft, tween: !!s.tween, journey: !!s.journey, mode: s.mode }; });
    ok('reduced motion steps the road without animation', t0 === 'Next water' && s2.owned === 2 && s2.raft && !s2.tween && !s2.journey);
    await shot(r.page, path.join(checks, 'r-step-2.png'));
    await r.context.close();
  }

  // ---- phone
  const p = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (want('phone')) await shot(p.page, path.join(outDir, 'map-phone.png'));
  if (want('checks')) {
    await p.page.evaluate(() => window.__chart.pick(9));
    await p.page.waitForTimeout(1300); await shot(p.page, path.join(checks, 'p-card.png'));
    const clip = await p.page.evaluate(() => { const c = document.getElementById('card'), m = document.getElementById('cardMurk'); c.scrollTop = c.scrollHeight; const cr = c.getBoundingClientRect(), mr = m.getBoundingClientRect(); return mr.bottom <= cr.bottom - 8; });
    ok('phone: the card’s last line clears its bottom edge', clip);
    await p.page.evaluate(() => { const c = window.__chart; c.select(null); document.getElementById('roadToggle').click(); });
    await settle(p.page); await shot(p.page, path.join(checks, 'p-road.png'));
    await p.page.evaluate(() => { document.getElementById('roadToggle').click(); const c = window.__chart; c.setOwned(6); c.look([40, 150, 660, 540], 14); });
    await settle(p.page); await shot(p.page, path.join(checks, 'p-owned-6.png'));
    await p.page.evaluate(() => { const c = window.__chart; c.setOwned(16); c.look([520, 800, 980, 1150], 10); });
    await settle(p.page); await shot(p.page, path.join(checks, 'p-heart.png'));
    const res = await p.page.evaluate(async () => {
      const c = window.__chart, el = document.getElementById('chart'), r = el.getBoundingClientRect();
      c.setMode('chart'); c.select(null); c.fit();
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
    ok('pinch zooms on a phone', res.k1 > res.k0 * 2); ok('one finger pans', res.x2 < res.x1 - 5);
  }
  const op = await overflow(p.page);
  ok(`phone: no page scroll ${JSON.stringify(op)}`, noScroll(op));
  await p.context.close();

  if (want('checks')) {
    // ---- a phone on its side: controls beside the chart, nothing scrolls, the lettering scaled to the sheet
    const s = await open({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await shot(s.page, path.join(checks, 'ph-land.png'));
    const os = await overflow(s.page);
    ok(`phone on its side: no page scroll ${JSON.stringify(os)}`, noScroll(os));
    const seen = await s.page.evaluate(() => { const r = document.getElementById('modeWorld').getBoundingClientRect(); return r.bottom <= window.innerHeight && r.top >= 0; });
    ok('phone on its side: every control is in view', seen);
    await s.page.evaluate(() => window.__chart.look([330, 150, 680, 480], 8)); await settle(s.page);
    await shot(s.page, path.join(checks, 'ph-land-kingdom.png'));
    await s.context.close();
  }
  ok(`no page errors${allErrors.length ? ': ' + allErrors.slice(0, 4).join(' | ') : ''}`, allErrors.length === 0);
  await browser.close();
}
