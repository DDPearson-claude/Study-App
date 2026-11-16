#!/usr/bin/env node
// The drawn Chart's captures and browser checks (docs/loop/M1.md §3, M1 step 3b's gate and look).
//
//   node build.mjs --dev --out=tools/out/m1-s3b/dev.html
//   nice -n 5 node tools/chart-shots.mjs [--html=tools/out/m1-s3b/dev.html] [--out=tools/out/m1-s3b] [--only=desk|phone|short]
//
// For each viewport (desktop 960 x 540 and phone 390 x 844 at DPR 2, so the shots show the ink as a phone does; and 'short', a
// 390 x 844 iPhone in Safari with its bars, which leave it 390 x 664, at its own DPR 3; M1.md §2.12): a fresh save on
// the loop (?loop=1, GW_DEBUG); New Descent → Start → the film skipped → the Jetty; the tutorial's Chart (mid ink-in and inked);
// then, the tutorial done, the M1 §2.4 fixture of the Mossmere's four places through ctx.debug.loop.chart: a later Chart (two
// owned, one with its giant landed, two priced), a place chosen, the sealed sheet's card, and the three-cards state (one owned:
// only Murk's two cheapest blots priced). Unlike the scenarios, the web fonts are not blocked: the Chart is shot as it letters.
// Checks: the art decodes and the faces are in before the first paint; the tutorial's Chart has no wisp, sealed sheet or price;
// no two tap targets overlap (the backdrop water aside) and each is at least 44 px; only priced blots open a card; the sealed
// card has no price and no buy button; the bare-paper test on the later sheet's ground; the hold's slots and Sail as T65 has them,
// under the sheet and never on it; on a phone every word at 16 px or more; the chosen place checked again on every open (the
// three-cards Chart, whose earlier choice is now a blot, chooses open water). The tutorial's ink-in is held half way for its shot
// (ctx.debug.loop.chart('ink', 0.5)). The Chart's own paint is timed (its raster read back; M1.md §2.14: first paint ≤ 150 ms, a
// redraw ≤ 16 ms), reported, and advisory on this shared software box: the gate on real phones is step 6's.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const html = path.resolve(root, String(args.html || 'tools/out/m1-s3b/dev.html'));
const out = path.resolve(root, String(args.out || 'tools/out/m1-s3b'));
fs.mkdirSync(out, { recursive: true });
const veil = JSON.parse(fs.readFileSync(path.join(root, 'tools/tests/fixtures/chart-veil.json'), 'utf8')).veil;
const fails = [], times = {};
const log = (...a) => console.log(...a);
const check = (ok, what, extra) => { log(`  ${ok ? 'ok  ' : 'FAIL'} ${what}${!ok && extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`); if (!ok) fails.push(what); return ok; };
const advise = (ok, what) => log(`  ${ok ? 'ok  ' : 'over'} ${what}${ok ? '' : ' (advisory on this shared box; step 6 reads it on the real phones)'}`);
const VIEW = { desk: { vp: { width: 960, height: 540 }, dpr: 2 }, phone: { vp: { width: 390, height: 844 }, dpr: 2 }, short: { vp: { width: 390, height: 664 }, dpr: 3 } };

async function run(kind) {
  const phone = kind !== 'desk';
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const context = await browser.newContext({ viewport: VIEW[kind].vp, deviceScaleFactor: VIEW[kind].dpr, hasTouch: phone, isMobile: phone });
  await context.addInitScript(() => { globalThis.GW_DEBUG = true; });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e?.message || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::ERR/.test(m.text())) errors.push(m.text()); });
  const g = (fn, a) => page.evaluate(fn, a);
  const wait = (ms) => page.waitForTimeout(ms);
  const shot = async (name) => { const p = path.join(out, `chart-${kind}-${name}.png`); await page.screenshot({ path: p, timeout: 300000 }); log(`  shot ${path.relative(root, p)}`); return p; };
  const until = async (fn, a, ms = 60000) => { const t0 = Date.now(); for (;;) { if (await g(fn, a).catch(() => false)) return true; if (Date.now() - t0 > ms) return false; await wait(150); } };
  const top = () => g(() => window.__gw.debug.ui().openModal);
  const tap = (sel) => g((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
  log(`${kind}: ${pathToFileURL(html).href}?loop=1`);
  await page.goto(`${pathToFileURL(html).href}?loop=1`, { timeout: 300000 });
  check(await until(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, 300000), `${kind}: the title is up`);
  await g((sc) => window.__gw?.debug?.renderScale?.(sc), Number(args.scale || 0.5)).catch(() => {});   // (a shared box's software GL: the world behind the Chart drawn at half scale)
  await wait(1200);
  check(await g(() => { const b = [...document.querySelectorAll('[data-modal=title] .gw-tbtn')].find((x) => /New Descent/.test(x.textContent)); if (!b) return false; b.click(); return true; }), `${kind}: New Descent`);
  await wait(600);
  check(await tap('[data-modal=newdescent] [data-action=start]'), `${kind}: Start`);
  await wait(1500);
  await until(() => { const c = window.__gw; c.game.skipIntro?.(); return c.flow === 'home'; }, null, 120000);
  check(await until(() => window.__gw.debug.ui().openModal === 'jetty', null, 60000), `${kind}: the Jetty`);
  // the art decoded in idle time after the title, the faces with it
  check(await until(() => window.__gw.debug.loop.chart()?.status === 'ready', null, 60000), `${kind}: the Chart's art decoded (createImageBitmap)`, await g(() => window.__gw.debug.loop.chart()));
  const st0 = await g(() => window.__gw.debug.loop.chart());
  check(st0.fonts === true, `${kind}: the chart's faces are loaded with the art (IM Fell English, Cedarville Cursive)`, st0);

  // ---- the tutorial's Chart: the first sheet inks in under Murk's line; the slots ink in; Sail breathes
  await g(() => { const d = window.__gw.debug.loop; d.chart('time'); d.chart('ink', 0.5); });   // (the ink-in held half way for its shot)
  check(await tap('[data-loop=jetty] [data-tile=chart]'), `${kind}: the Jetty's Chart tile`);
  check(await until(() => window.__gw.debug.ui().openModal === 'chart', null, 10000), `${kind}: the Chart opens`);
  await until(() => window.__gw.debug.loop.chart().draws > 0, null, 120000);
  const fp = await g(() => window.__gw.debug.loop.chart().firstPaint);
  check(fp && fp.fonts === true, `${kind}: the first paint letters in the chart's faces`, fp);
  check(fp && fp.sheetInk < 1, `${kind}: the first time the Chart opens its first sheet inks in`, fp);
  await until(() => { const m = document.querySelector('[data-modal=chart]'); return !!m && m.classList.contains('gw-in') && Number(getComputedStyle(m).opacity) > 0.98; }, null, 30000);
  await wait(900);   // (the panel's own ink-in: the ✕, Murk's line, the flourish)
  await shot('1-tutorial-inking');
  await g(() => window.__gw.debug.loop.chart('ink', null));
  await wait(2200);
  const tt = await g(() => window.__gw.debug.loop.chart('time'));
  times[kind] = { tutorial: { openToPaint: tt.openToPaint, first: tt.paints[0]?.ms, paints: tt.paints.length } };
  await until(() => !document.querySelector('[data-loop=chart] .gw-slot.gw-ink') || [...document.querySelectorAll('[data-loop=chart] .gw-slot')].every((c) => getComputedStyle(c).opacity > 0.95), null, 60000);
  // the sheet, the hold's slots and Sail: the slots and Sail under the sheet, never on it; nothing past the screen's edge
  const frame = () => g(() => {
    const root = document.querySelector('[data-loop=chart]'), R = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
    const sheet = root?.querySelector('.gw-chart-sheet'), sail = root?.querySelector('[data-action=sail]'), slots = [...(root?.querySelectorAll('.gw-slot') || [])];
    if (!sheet || !sail) return null;
    const s = R(sheet), below = [...slots, sail].map(R).every((r) => r[1] >= s[1] + s[3] - 4 && r[1] + r[3] <= innerHeight + 0.5);   // (a button's box may graze the sheet's edge by its padding)
    return { sheet: s.map(Math.round), sail: R(sail).map(Math.round), below, hScroll: document.scrollingElement.scrollWidth > innerWidth, vh: innerHeight, fonts: window.__gw.debug.loop.chart('layout')?.fonts || [] };
  });
  const tut = await g(() => {
    const L = window.__gw.debug.loop.chart('layout'), root = document.querySelector('[data-loop=chart]');
    const sail = root?.querySelector('[data-action=sail]');
    return { texts: L?.texts, sealed: !!L?.sealed, targets: L?.targets?.map((t) => t.kind), line: root?.querySelector('.gw-murk-line')?.textContent || '',
      slots: root ? root.querySelectorAll('.gw-slot').length : 0, sailCue: !!sail?.classList.contains('gw-cue'), sailLive: !!sail && !sail.disabled, water: !!root?.querySelector('[data-water=mossmere]') };
  });
  const f1 = await frame();
  check(f1 && f1.below && !f1.hScroll, `${kind}: the hold's slots and Sail under the sheet, on the screen; no sideways scroll (${VIEW[kind].vp.width} x ${f1?.vh})`, f1);
  check(!tut.targets.includes('book'), `${kind}: the tutorial's Chart has no book (nothing to read but Murk's)`, tut.targets);
  check(tut.water && tut.slots >= 3 && tut.sailLive && tut.sailCue, `${kind}: T65 on the drawn Chart: [data-water=mossmere], the .gw-slot cells, Sail live and breathing`, tut);
  check(/slots in that hold/.test(tut.line), `${kind}: Murk's departure line over the Chart`, tut.line);
  check(!tut.sealed && !tut.targets.includes('sealed'), `${kind}: no wisp and no sealed sheet in the tutorial`, tut.targets);
  check((tut.texts || []).every((t) => !/\d/.test(t)), `${kind}: no price or number on the tutorial's Chart`, tut.texts);
  await shot('2-tutorial');
  const pick0 = await g(() => window.__gw.state.meta.loop.chartPick);
  check(pick0 && pick0.water === 'mossmere', `${kind}: the Chart writes its chosen place (meta.loop.chartPick)`, pick0);

  // ---- a later Chart: the tutorial done, the fixture's four places (two owned, one with its giant landed, two priced)
  await page.keyboard.press('Escape');
  await wait(400);
  // the tutorial done (a later evening's Chart): the home's screens begin again as they do on a later home:enter
  await g(() => { const c = window.__gw, d = c.debug.loop; d.tutorial('done'); d.chart('fixture', 'later'); c.ui.closeAll?.(); c.bus.emit('home:enter', { from: null }); });
  await until(() => window.__gw.debug.ui().openModal === 'jetty', null, 20000);
  let drawn = await g(() => window.__gw.debug.loop.chart().draws);
  check(await tap('[data-loop=jetty] [data-tile=chart]'), `${kind}: the Chart again`);
  await until(() => window.__gw.debug.ui().openModal === 'chart', null, 10000);
  await until((n) => window.__gw.debug.loop.chart().draws > n, drawn, 120000);   // (this open's own paint, not the last open's layout)
  await wait(1600);
  const tl = await g(() => window.__gw.debug.loop.chart('time'));
  times[kind].later = { openToPaint: tl.openToPaint, first: tl.paints[0]?.ms };
  const f2 = await frame();
  check(f2 && f2.below && !f2.hScroll, `${kind}: a later Chart: the slots and Sail under the sheet; no sideways scroll`, f2);
  if (phone) { const px = (f) => parseFloat(/(\d+(?:\.\d+)?)px/.exec(f)?.[1] || 0); check(f2.fonts.length >= 4 && f2.fonts.every((f) => px(f) >= 16), `${kind}: every word on the phone's Chart at 16 px or more (M1.md §2.12)`, f2.fonts); }
  check(!f2.fonts.some((f) => /Alegreya/.test(f)), `${kind}: no word in Alegreya (M1.md §3.1)`, f2.fonts);
  const later = await g(() => {
    const L = window.__gw.debug.loop.chart('layout');
    const hits = [...document.querySelectorAll('[data-loop=chart] .gw-chart-hit')].map((b) => { const r = b.getBoundingClientRect(); return { kind: [...b.classList].find((c) => c.startsWith('gw-chart-hit--')).slice(14), place: b.dataset.place || null, buy: b.dataset.buy === '1', r: [r.left, r.top, r.width, r.height] }; });
    return { texts: L.texts, targets: L.targets, places: L.places.map((p) => ({ id: p.id, owned: p.owned, price: p.price, leader: p.leader })), hits, sealed: L.sealed, w: L.w };
  });
  const T = later.targets.filter((t) => !t.backdrop);
  const meet = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
  const pairs = []; for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) if (meet(T[i].rect, T[j].rect)) pairs.push([T[i].id, T[j].id]);
  check(pairs.length === 0, `${kind}: no two tap targets overlap (sheet ${Math.round(later.w)} px wide)`, pairs);
  check(later.hits.every((h) => h.r[2] >= 44 && h.r[3] >= 44), `${kind}: every tap target is at least 44 x 44 px`, later.hits.filter((h) => h.r[2] < 44 || h.r[3] < 44));
  check(later.places.filter((p) => p.price != null).length === 2 && later.hits.filter((h) => h.buy).length === 2, `${kind}: the two priced blots carry a price and open a card (Murk's three: two place maps and the next lake)`, later.places);
  check(later.texts.some((t) => t === 'Coming soon') && !later.texts.some((t) => /%/.test(t)), `${kind}: "Coming soon" on the sealed sheet; no percentage anywhere`, later.texts);
  check(later.texts.includes('★'), `${kind}: the giant landed: its gold star`, later.texts);
  const paper = await g((v) => window.__gw.debug.loop.chart('veil', { veil: v }), veil);
  check(paper && paper.sampled > 50 && paper.differing === 0, `${kind}: the sheet-2 region of the frame is bare paper (${paper?.sampled} cells sampled)`, paper);
  await shot('3-later');
  // a place chosen: its name underlined (on a phone its best fish shows under it)
  check(await tap('[data-loop=chart] [data-place=under_the_span]:not([data-buy])'), `${kind}: tap Under the Span`);
  await wait(500);
  const pk = await g(() => ({ pick: window.__gw.state.meta.loop.chartPick, pressed: document.querySelector('[data-place=under_the_span]')?.getAttribute('aria-pressed'), focus: document.activeElement?.dataset?.place || null }));
  check(pk.pick?.place === 'under_the_span' && pk.pressed === 'true', `${kind}: the chosen place (chartPick, aria-pressed)`, pk);
  const tp = await g(() => window.__gw.debug.loop.chart('time'));
  times[kind].redraw = tp.paints[tp.paints.length - 1]?.ms;
  await shot('4-chosen');

  // ---- the sealed sheet's card: the wax, three seals, "Coming soon"; no price and no buy button
  check(await tap('[data-loop=chart] [data-sealed=sporewood]'), `${kind}: tap the sealed sheet`);
  await until(() => { const m = document.querySelector('[data-modal=chartsealed]'); return !!m && m.classList.contains('gw-in') && Number(getComputedStyle(m).opacity) > 0.95; }, null, 30000);
  await wait(900);
  const sc = await g(() => {
    const m = document.querySelector('[data-modal=chartsealed]');
    return { open: !!m, text: m ? m.textContent.replace(/\s+/g, ' ').trim() : '', seals: m ? [...m.querySelectorAll('[data-seal]')].map((b) => ({ key: b.dataset.seal, disabled: b.disabled, w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height })) : [],
      buy: m ? m.querySelectorAll('[data-buy], [data-action=buy], .gw-shelf-buy').length : -1 };
  });
  check(sc.open && sc.text === 'Coming soon' && sc.buy === 0, `${kind}: the sealed sheet's card: "Coming soon", no price, no buy button`, sc);
  check(sc.seals.length === 3 && sc.seals.every((s) => s.w >= 44 && s.h >= 44) && sc.seals[0].disabled, `${kind}: its three seals, each a 44 px target (the map seal hollow and still)`, sc.seals);
  await shot('5-sealed');
  await page.keyboard.press('Escape');
  await wait(400);

  // ---- the three-cards state: one owned; only Murk's two cheapest blots priced, the Bell Pool's blot its glyph alone
  if ((await top()) === 'chart') { await page.keyboard.press('Escape'); await wait(400); }
  await g(() => { const d = window.__gw.debug.loop; d.chart('fixture', 'three'); });
  drawn = await g(() => window.__gw.debug.loop.chart().draws);
  await tap('[data-loop=jetty] [data-tile=chart]');
  await until(() => window.__gw.debug.ui().openModal === 'chart', null, 10000);
  await until((n) => window.__gw.debug.loop.chart().draws > n, drawn, 120000);
  await wait(1400);
  await until(() => !!window.__gw.debug.loop.chart('layout')?.places?.length, null, 120000);
  const three = await g(() => {
    const L = window.__gw.debug.loop.chart('layout');
    return { places: L.places.map((p) => ({ id: p.id, owned: p.owned, price: p.price })), buy: [...document.querySelectorAll('[data-loop=chart] [data-buy]')].map((b) => b.dataset.place),
      bell: !!document.querySelector('[data-loop=chart] [data-place=bell_pool]') };
  });
  check(JSON.stringify(three.buy.sort()) === JSON.stringify(['buoy_lights', 'under_the_span']) && !three.bell, `${kind}: the Chart's three-cards case: only Murk's blots carry a price or open a card (the Bell Pool's opens nothing)`, three);
  const re = await g(() => ({ pick: window.__gw.debug.loop.chart().pick, water: document.querySelector('[data-loop=chart] .gw-chart-hit--water')?.getAttribute('aria-pressed') }));
  check(re.pick && re.pick.place === null && re.water === 'true', `${kind}: the chosen place checked again on this open: Under the Span is a blot now, so open water is chosen`, re);
  await shot('6-three');
  check(await tap('[data-loop=chart] [data-place=under_the_span][data-buy]'), `${kind}: a priced blot`);
  await wait(500);
  check((await top()) === 'shelf', `${kind}: a priced blot opens Murk's shelf (buying it here is buying it at the shelf)`, await top());
  await page.keyboard.press('Escape');
  await wait(300);
  const errs = await g(() => window.__gw.errors.slice());
  check(errors.length === 0 && errs.length === 0, `${kind}: no page or console error, ctx.errors empty`, { errors, errs });
  await browser.close();
}

for (const kind of ['desk', 'phone', 'short']) if (!args.only || String(args.only).split(',').includes(kind)) await run(kind);
// the Chart's own paint (M1.md §2.14): drawChart and its raster read back, at each viewport's DPR; the open's render to its first paint
log('\nthe Chart\'s paint, ms (drawChart + the raster read back):');
for (const [kind, t] of Object.entries(times)) {
  log(`  ${kind} (${VIEW[kind].vp.width} x ${VIEW[kind].vp.height}, DPR ${VIEW[kind].dpr}): tutorial first paint ${t.tutorial?.first} (render to paint ${t.tutorial?.openToPaint}, ${t.tutorial?.paints} paints), later first paint ${t.later?.first} (render to paint ${t.later?.openToPaint}), a redraw (a place chosen) ${t.redraw}`);
  advise(Math.max(t.tutorial?.first ?? 0, t.later?.first ?? 0) <= 150, `${kind}: the first paint ≤ 150 ms`);
  advise((t.redraw ?? 0) <= 16, `${kind}: a redraw ≤ 16 ms`);
}
fs.writeFileSync(path.join(out, 'chart-times.json'), JSON.stringify(times, null, 1));
log(fails.length ? `\n${fails.length} check(s) failed` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
