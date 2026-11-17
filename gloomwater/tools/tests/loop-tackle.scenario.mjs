// TK, the tackle tin, in the browser (the user's words of 16 November 2026, during play-testing: "We should have an option to equip bait
// or change lures whilst out on the lake"; src/ui-tackle.js, CONTRACT §14.19). A loop dev build from a fresh save (no film): the
// tutorial done, a bag of tins and three lures, a trip. The tin under the hold row; a real cast; a real tap opens the drawer; Lumen Moss
// picked mid-wait (the line comes in quietly, the Mire Worms that went out are back: the count whole, no miss); a lure picked; the next
// cast's castInfo carries the new bait; a tap during a fight is refused ("After this fish.", no drawer); B opens and closes it on a
// desktop. Then the tin and the open drawer at each size (one run per input kind; the viewport changed in the page):
//   desktop: 960x540, 1280x720, 900x1000 (near-square)        phone (--mobile): 390x844, 358x664, 844x390 (landscape)
// with the layout's checks at each: every target ≥ 44 px, text ≥ 16 px, every name whole (no ellipsis, no overflow), nothing off screen,
// no two items overlapping, nothing scrolled out of the drawer; and T43's word scan on the drawer.
//
//   node build.mjs --dev --out=tools/out/mvp-tackle/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-tackle/dev.html --shots=tools/out/mvp-tackle/desk --script=tools/tests/loop-tackle.scenario.mjs --width=960 --height=540
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-tackle/dev.html --shots=tools/out/mvp-tackle/phone --script=tools/tests/loop-tackle.scenario.mjs --mobile
// Options: --sizes=WxH,WxH (the sizes after the first; default by input kind)   --noshots
// Prints `LOOP_TACKLE {size, failures, notes, sizes}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

const DESK = [[1280, 720], [900, 1000]];
const PHONE = [[358, 664], [844, 390]];

export default async function (api) {
  const { page, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'tk' });
  const R = () => g(() => { const r = window.__gw.state.run; return r ? { bait: { ...(r.bait || {}) }, lure: r.lure ?? null, eq: r.equippedBait ?? null } : null; });
  const TK = () => g(() => window.__gw.ui.loop?.tackle?.debug?.() ?? null);
  const modal = () => g(() => window.__gw.debug.ui().openModal);
  const tkEv = () => g(() => (window.__tkEv || []).slice());
  const sizes = typeof args.sizes === 'string' ? args.sizes.split(',').map((s) => s.split('x').map(Number)) : (K.phone ? PHONE : DESK);
  const seen = [];

  /** The drawer's layout at this size: targets, text, names, the screen, overlaps, a scroll that hides items. */
  const layout = () => g(() => {
    const vw = innerWidth, vh = innerHeight, faults = [];
    const box = document.querySelector('[data-loop=tackle]');
    if (!box) return { faults: ['no drawer'] };
    const rect = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const its = [...box.querySelectorAll('.gw-tk-it')], x = box.querySelector('.gw-x');
    for (const b of [...its, x].filter(Boolean)) {
      const r = rect(b), id = b.dataset.bait ?? b.dataset.lure ?? 'x';
      if (r.w < 44 || r.h < 44) faults.push(`target ${id} ${r.w.toFixed(0)}×${r.h.toFixed(0)}`);
      if (r.l < -0.5 || r.t < -0.5 || r.r > vw + 0.5 || r.b > vh + 0.5) faults.push(`off screen ${id} ${JSON.stringify(r)}`);
    }
    for (let i = 0; i < its.length; i++) for (let j = i + 1; j < its.length; j++) {
      const a = rect(its[i]), b = rect(its[j]);
      if (Math.min(a.r, b.r) - Math.max(a.l, b.l) > 0.5 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 0.5) faults.push(`overlap ${its[i].dataset.bait ?? its[i].dataset.lure}/${its[j].dataset.bait ?? its[j].dataset.lure}`);
    }
    const names = [];
    for (const n of box.querySelectorAll('.gw-tk-name, .gw-tk-n, .gw-tk-h')) {
      const cs = getComputedStyle(n), fs = parseFloat(cs.fontSize), r = rect(n), pr = rect(n.closest('.gw-tk-it') || box);
      if (fs < 15.9) faults.push(`text ${n.textContent} at ${fs}px`);
      if (n.scrollWidth > n.clientWidth + 1 || r.l < pr.l - 0.5 || r.r > pr.r + 0.5) faults.push(`name cut: ${n.textContent} (${n.scrollWidth} > ${n.clientWidth})`);
      if (/…|\.\.\.$/.test(n.textContent)) faults.push(`ellipsis: ${n.textContent}`);
      if (n.classList.contains('gw-tk-name')) names.push({ t: n.textContent, lines: Math.round(r.h / (parseFloat(cs.lineHeight) || fs * 1.15)) });
    }
    const rows = box.querySelector('.gw-tk-rows') || box;
    if (rows.scrollHeight > rows.clientHeight + 1) faults.push(`the drawer scrolls (${rows.scrollHeight} > ${rows.clientHeight}): items hidden`);
    const tin = document.querySelector('[data-loop=tin]');
    return { faults, vw, vh, box: rect(box), tin: tin ? rect(tin) : null, items: its.length, names, sheet: !!box.closest('.gw-tk-sheet') };
  });
  /** The tin in the corner: its box, ≥ 44 px, on screen, clear of every other HUD control (the hold row is pointer-less). */
  const tinCheck = () => g(() => {
    const tin = document.querySelector('[data-loop=tin]');
    if (!tin) return { faults: ['no tin'] };
    const r = tin.getBoundingClientRect(), faults = [];
    if (r.width < 44 || r.height < 44) faults.push(`tin ${r.width}×${r.height}`);
    if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) faults.push('tin off screen');
    for (const o of document.querySelectorAll('.gw-hud button, .gw-hud .gw-hold, .gw-hud .gw-pill')) {
      if (o === tin || tin.contains(o) || o.offsetParent === null) continue;
      const q = o.getBoundingClientRect();
      if (q.width && Math.min(r.right, q.right) - Math.max(r.left, q.left) > 0.5 && Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) > 0.5) faults.push(`overlaps ${o.className}`);
    }
    return { faults, box: { l: r.left, t: r.top, w: r.width, h: r.height } };
  });
  const castReal = async (what) => {
    const pt = await K.waterPoint();
    await K.pressHold(pt.x, pt.y, 0.5);
    const c = await K.until("c.fishing.state === 'waiting'", 8);
    K.need(c.ok, `${what}: a real cast, the float waiting`, c);
    return c;
  };

  try {
    K.step('tk: a fresh save, Start, the tutorial done, a bag of tins and three lures');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'stub' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => {
      const c = window.__gw, m = c.state.meta.loop;
      c.debug.loop.tutorial('done');
      m.bait.mossmere = { ...(m.bait.mossmere || {}), mireworm: 10, lumen_moss: 10, heartmoss: 1 };
      m.lures = ['feather_fly', 'glimmer_spoon', 'bell_spinner'];
      m.fitted = { bait: 'mireworm', lure: null };
      c.game.save();
    });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(1.2);
    await g(() => window.__gw.debug.loop.sail('mossmere'));
    K.need((await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.loopHome?.gliding?.()", 14)).ok || (await K.until("c.flow === 'playing'", 2)).ok, 'the trip begins');
    await K.secs(3);
    await g(() => { window.__tkEv = []; for (const e of ['fishing:miss', 'fishing:escaped', 'fish:escaped', 'fishing:reelIn', 'loop:hook', 'fishing:bite', 'fishing:cast']) window.__gw.bus.on(e, (p) => window.__tkEv.push({ e, p })); });

    // ------------------------------------------------------------------ the tin
    K.step('tk: the tin under the hold row');
    let t = await TK();
    K.check(t && t.shown && t.bait === 'mireworm' && t.lure === '' && !t.busy, 'the tin shows Mire Worms on the hook and no lure', t);
    const tc = await tinCheck();
    K.check(tc.faults.length === 0, 'the tin: ≥ 44 px, on screen, clear of the HUD\'s other controls', tc);
    const hr = await g(() => { const a = document.querySelector('.gw-hud .gw-hold')?.getBoundingClientRect(), b = document.querySelector('[data-loop=tin]')?.getBoundingClientRect(); return a && b ? { holdBottom: a.bottom, tinTop: b.top, tinLeft: b.left, vw: innerWidth } : null; });
    K.check(hr && hr.tinTop >= hr.holdBottom - 2 && hr.tinLeft < hr.vw / 2, 'the tin sits under the hold row in the top-left corner (no ring, nothing near the raft)', hr);
    const gearHud = await g(() => { const el = document.querySelector('.gw-gear-hud'); return el ? getComputedStyle(el).display : 'none'; });
    K.check(gearHud === 'none', 'the old gear glyphs make way for the tin', gearHud);
    await K.shoot(`tin-${width}x${height}`);

    // ------------------------------------------------------------------ a real cast, the drawer mid-wait
    K.step('tk: a real cast, then the tin');
    await castReal('the first cast');
    let r = await R();
    K.check(r.bait.mireworm === 9, 'the cast spent one Mire Worm (10 → 9)', r.bait);
    await K.steps(2);
    t = await TK();
    K.check(t.bait === 'mireworm' && !t.busy, 'waiting: the tin shows the worms on the line, not dimmed', t);
    const ev0 = (await tkEv()).length;
    K.need(await K.tap('[data-loop=tin]'), 'a real tap on the tin');
    await K.settle(350);
    K.check((await modal()) === 'tackle', 'the drawer opens (the tackle modal)');
    let lay = await layout();
    K.check(lay.faults.length === 0, `the drawer's layout at ${width}×${height}`, lay);
    seen.push({ size: `${width}x${height}`, sheet: lay.sheet, box: lay.box, names: lay.names?.filter((n) => n.lines > 1).map((n) => n.t) });
    const pressed = await g(() => [...document.querySelectorAll('[data-loop=tackle] [aria-pressed=true]')].map((b) => b.dataset.bait ?? b.dataset.lure));
    K.check(JSON.stringify(pressed) === JSON.stringify(['mireworm']), 'pressed: Mire Worms alone (one thing on the hook)', pressed);
    const rows = await g(() => ['bait', 'lure'].map((k) => [...document.querySelectorAll(`[data-loop=tackle] [data-row=${k}] .gw-tk-it`)].map((b) => b.dataset[k])));
    K.check(JSON.stringify(rows) === JSON.stringify([['heartmoss', 'mireworm', 'lumen_moss', ''], ['feather_fly', 'glimmer_spoon', 'bell_spinner', '']]), 'Bait: the ball, the two tins, a bare hook; Lure: the three owned, none', rows);
    const words = await g(() => document.querySelector('[data-loop=tackle]')?.innerText || '');
    K.check(!/%|likes?\b|odds|chance/i.test(words), 'no odds, no percentage, no likes on the drawer', words);
    await K.scan('the tackle drawer');
    await K.shoot(`drawer-${width}x${height}`);

    K.step('tk: Lumen Moss mid-wait: the line comes in quietly, the count whole');
    K.need(await K.tap('[data-loop=tackle] [data-bait=lumen_moss]'), 'a tap on Lumen Moss');
    await K.settle(250);
    r = await R();
    const fs1 = await g(() => window.__gw.fishing.state);
    K.check(r.eq === 'lumen_moss' && r.bait.mireworm === 10 && r.bait.lumen_moss === 10, 'Lumen Moss on the hook; the worm that went out is back (10)', r);
    K.check(fs1 === 'lost' || fs1 === 'idle', 'the line comes in (the quiet reel-in)', fs1);
    K.check((await modal()) === 'tackle', 'the drawer stays open (a lure can follow)');
    K.need(await K.tap('[data-loop=tackle] [data-lure=glimmer_spoon]'), 'a tap on the Glimmer Spoon');
    await K.settle(250);
    r = await R();
    const fitted = await g(() => ({ ...window.__gw.state.meta.loop.fitted }));
    K.check(r.lure === 'glimmer_spoon' && !r.eq && fitted.lure === 'glimmer_spoon' && fitted.bait === null && r.bait.lumen_moss === 10, 'the Glimmer Spoon on, the moss off the hook (in the bag); saved in meta.loop.fitted', { r, fitted });
    const pressed2 = await g(() => [...document.querySelectorAll('[data-loop=tackle] [aria-pressed=true]')].map((b) => b.dataset.bait ?? b.dataset.lure));
    K.check(JSON.stringify(pressed2) === JSON.stringify(['glimmer_spoon']), 'the drawer marks the Spoon alone pressed', pressed2);
    await K.shoot(`drawer-changed-${width}x${height}`);
    await K.key('Escape');
    await K.settle(300);
    K.check((await modal()) !== 'tackle', 'Escape closes the drawer');
    const idle = await K.until("c.fishing.state === 'idle'", 4);
    K.check(idle.ok, 'the line is in (idle) as the evening runs on', idle);
    const ev = (await tkEv()).slice(ev0).map((e) => e.e);
    K.check(!ev.includes('fishing:miss') && !ev.includes('fishing:escaped') && !ev.includes('fish:escaped') && !ev.includes('fishing:bite'), 'no miss, no lost fish, no bite', ev);
    K.check(ev.filter((e) => e === 'fishing:reelIn').length === 1 && ev.includes('loop:hook'), 'one quiet reel-in; loop:hook', ev);
    t = await TK();
    K.check(t.lure === 'glimmer_spoon', 'the tin shows the Spoon', t);
    await K.shoot(`tin-changed-${width}x${height}`);

    K.step('tk: a lure\'s cast: no float wait, the line comes back toward the raft by itself, nothing spent');
    await castReal('the lure cast');
    r = await R();
    K.check(r.bait.lumen_moss === 10 && r.bait.mireworm === 10, 'nothing spent on a lure cast', r.bait);
    const lureD = () => g(() => { const c = window.__gw, b = c.fishing.bobberPos, p = c.player?.position || c.state?.player?.position; return b && p ? Math.hypot(b.x - p.x, b.z - p.z) : null; });
    const da = await lureD();
    await K.secs(1.2);
    const db = await lureD();
    const fsL = await g(() => window.__gw.fishing.state);
    K.check(fsL !== 'waiting' || (da != null && db != null && da - db > 1.5), 'the lure comes in by itself (about 2.5 m a second)', { da, db, fsL });
    await K.shoot(`lure-coming-in-${width}x${height}`);
    const inL = await K.until("c.fishing.state === 'idle' || c.fishing.state === 'bite' || c.fishing.state === 'reeling'", 14);
    K.check(inL.ok, 'the lure reaches the raft quietly, or a fish strikes', inL);
    await g(() => window.__gw.debug.fishOutcome?.('land'));
    if ((await g(() => window.__gw.fishing.state)) !== 'idle') { await g(() => window.__gw.debug.fishStrike?.('struck')); await g(() => window.__gw.debug.fishPlayTo?.(0.97)); await K.toCard('the lure\'s fish', { dwell: 0.6 }); await K.until("c.fishing.state === 'idle'", 6); }

    K.step('tk: a bait back on: the next cast carries it');
    K.need((await g(() => window.__gw.progression.loop.changeHook({ bait: 'lumen_moss' })?.ok)) === true, 'Lumen Moss back on (the lure comes off)');
    r = await R();
    K.check(r.eq === 'lumen_moss' && !r.lure, 'the moss on, the lure off', r);
    await castReal('the next cast');
    const fd = await g(() => window.__gw.debug.fishing());
    r = await R();
    K.check(fd.castInfoBait === 'lumen_moss' && fd.castBait === 'lumen_moss' && r.bait.lumen_moss === 9 && r.bait.mireworm === 10, 'the cast\'s castInfo carries Lumen Moss (one spent; the worms untouched)', { castInfoBait: fd.castInfoBait, bag: r.bait });

    // ------------------------------------------------------------------ during a fight: refused
    K.step('tk: a tap during a fight');
    await g(() => { const d = window.__gw.debug; d.fishOutcome?.('land'); d.forceBite?.({ speciesId: 'dusk_minnow', z: 0.3, wait: 0.2 }); });
    K.need((await K.until("c.fishing.state === 'bite'", 4)).ok, 'a bite');
    await g(() => window.__gw.debug.fishStrike?.('struck'));
    K.need((await K.until("c.fishing.state === 'reeling' || c.fishing.state === 'landing'", 3)).ok, 'hooked: the play');
    await K.steps(3);
    t = await TK();
    K.check(t.busy === true, 'a fish on: the tin\'s contents dim', t);
    const before = await R();
    await K.tap('[data-loop=tin]');
    await K.settle(200);
    t = await TK();
    K.check((await modal()) !== 'tackle' && t.note === TL.tackle.after, `the tap refused: no drawer, the line "${TL.tackle.after}"`, t);
    if (!K.phone) { await K.key('KeyB'); await K.settle(150); K.check((await modal()) !== 'tackle', 'B refused too while the fish is on'); }
    K.check(JSON.stringify(await R()) === JSON.stringify(before), 'nothing changed on the hook', before);
    await K.shoot(`tin-busy-${width}x${height}`);
    await g(() => window.__gw.debug.fishPlayTo?.(0.97));
    await K.toCard('the Dusk Minnow', { dwell: 1.2 });
    await K.until("c.fishing.state === 'idle'", 6);
    t = await TK();
    K.check(t.busy === false, 'the card closed: the tin is live again', t);

    if (!K.phone) {
      K.step('tk: B opens and closes the drawer (desktop)');
      await K.key('KeyB'); await K.settle(300);
      K.check((await modal()) === 'tackle', 'B opens it');
      await K.key('KeyB'); await K.settle(300);
      K.check((await modal()) !== 'tackle', 'B closes it');
    }

    // ------------------------------------------------------------------ every size: the tin and the open drawer
    for (const [w, hgt] of sizes) {
      K.step(`tk: ${w}×${hgt}`);
      await page.setViewportSize({ width: w, height: hgt });
      await K.settle(500); await K.steps(4); await K.settle(250);
      const tcs = await tinCheck();
      K.check(tcs.faults.length === 0, `the tin at ${w}×${hgt}`, tcs);
      await K.shoot(`tin-${w}x${hgt}`);
      K.need(await K.tap('[data-loop=tin]'), `a tap on the tin (${w}×${hgt})`);
      await K.settle(400);
      K.check((await modal()) === 'tackle', `the drawer opens (${w}×${hgt})`);
      lay = await layout();
      K.check(lay.faults.length === 0, `the drawer's layout at ${w}×${hgt}`, lay);
      seen.push({ size: `${w}x${hgt}`, sheet: lay.sheet, box: lay.box, names: lay.names?.filter((n) => n.lines > 1).map((n) => n.t) });
      await K.shoot(`drawer-${w}x${hgt}`);
      const x = await K.box('[data-loop=tackle] [data-action=close]');
      if (x) await K.tapXY(x.x, x.y); else await K.key('Escape');
      await K.settle(300);
      K.check((await modal()) !== 'tackle', `the drawer closes (${w}×${hgt})`);
    }
    await K.noErrors('the end');
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${String(e?.stack || e).split('\n').slice(0, 3).join(' | ')}`); log('THREW', e); }
  }
  await K.release().catch(() => {});   // (the page's frames back: the runner's closing fps probe needs them)
  log('LOOP_TACKLE', JSON.stringify({ size: `${width}x${height}`, failures: K.failures, notes: K.notes, sizes: seen }));
  return { failures: K.failures };
}
