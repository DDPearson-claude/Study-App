// LAKE 2, lane G: the Tackle screen in the browser (docs/loop/LAKE2.md §5.5; the user's words of 17 Nov 2026: "you can change rods and
// reels at your leisure in an options menu"). A loop dev build from a fresh save: the tutorial done, the Mossmere's end (T2 everywhere,
// five lures and the found Gate-Guard's Button, three tins and the Heartmoss Ball, the found Belfry Winch), a scripted standard pad
// (navigator.getGamepads stubbed, idle until pressed). Every way in and every input:
//   home: the rod rack target opens the screen (its foot links to the Wick's sheet); a lower rod tapped (meta.loop.fit), the best bought
//   back, the found Winch on and off; the keys (arrows move the focus, Enter fits, Esc closes; desktop); the link to the sheet; the
//   home pause's Tackle item (Done back to the pause); the pad (the D-pad moves, A fits, B closes);
//   every size (the viewport changed in the page): the layout's checks (each target ≥ 44 px, text ≥ 16 px, every name whole inside its
//   chip, no two texts overlapping, nothing off screen, the five rows without a vertical scroll, the fitted chip in view) and T43's scan;
//   a trip: the tin's drawer carries the door (no line out) and the screen fits a bait on the trip's line; a line out: no door; a fish on:
//   the trip pause's Tackle item says "After this fish." and opens nothing;
//   after the tow (a reload, then LOOP.shipped = 'sporewood' and the ledger's towTo in the page): the head names Sporewood Pools with the
//   carried line, the rows Sporewood's own, the Wick's sheet's Tackle the carried line.
//   desktop: 960x540, then 1280x720, 900x1000 (near-square), 1920x1080        phone (--mobile): 390x844, then 358x664, 690x760, 844x390, 1280x800 (the Legion Go, touch)
//
//   node build.mjs --dev --out=tools/out/lake2-g/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/lake2-g/dev.html --shots=tools/out/lake2-g/desk --script=tools/tests/lake2-g-tackle.scenario.mjs --width=960 --height=540
//   nice -n 10 node tools/playtest.mjs --html=tools/out/lake2-g/dev.html --shots=tools/out/lake2-g/phone --script=tools/tests/lake2-g-tackle.scenario.mjs --mobile
// Options: --sizes=WxH,WxH (the sizes after the first)   --noshots   --skip=trip,tow
// Prints `LAKE2_G {size, failures, notes, sizes}`; returns its failures.
import { makeKit, Abort, uiLoopHelper } from './loop-1a.scenario.mjs';

const DESK = [[1280, 720], [900, 1000], [1920, 1080]];
const PHONE = [[358, 664], [690, 760], [844, 390], [1280, 800]];
const PB = { A: 0, B: 1, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

export default async function (api) {
  const { page, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  await page.addInitScript(() => {
    const P = { buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })), axes: [0, 0, 0, 0] };
    const gp = { id: 'Scripted pad (STANDARD GAMEPAD)', index: 0, mapping: 'standard', connected: true, timestamp: 0, get buttons() { return P.buttons; }, get axes() { return P.axes; } };
    window.__pad = { set(b, on) { P.buttons[b].pressed = on; P.buttons[b].value = on ? 1 : 0; } };
    Object.defineProperty(Navigator.prototype, 'getGamepads', { configurable: true, value() { return [gp, null, null, null]; } });
  });
  const K = makeKit(api, { label: 'g' });
  const skip = new Set(String(args.skip || '').split(',').filter(Boolean));
  const sizes = typeof args.sizes === 'string' ? args.sizes.split(',').map((s) => s.split('x').map(Number)) : (K.phone ? PHONE : DESK);
  const seen = [];
  const modal = () => g(() => window.__gw.debug.ui().openModal);
  const stack = () => g(() => window.__gw.debug.ui().stack);
  const SC = () => g(() => window.__gw.ui.loop?.tackle?.debug?.()?.screen ?? null);
  const fitOf = () => g(() => { const m = window.__gw.state.meta.loop; return { fit: { ...(m.fit || {}) }, found: { ...(m.found || {}) }, fitted: { ...(m.fitted || {}) } }; });
  const onIn = (sc, row) => (sc?.rows?.[row] || []).filter((c) => c.on).map((c) => c.key);
  const press = async (b) => { await g((b) => window.__pad.set(b, true), b); await K.steps(2); await g((b) => window.__pad.set(b, false), b); await K.steps(3); };
  const padFocus = () => g(() => { const f = document.querySelector('.gw-padfocus'); return f ? { key: f.dataset.key ?? null, slot: f.dataset.slot ?? null, text: (f.textContent || '').trim().slice(0, 24) } : null; });
  /** A real tap on a chip, its strip first turned so the chip is in view (as a swipe would: the chip at the strip's left edge). */
  const tapChip = async (key) => {
    await g((k) => {
      const c = document.querySelector(`[data-modal=tacklescreen]:not(.gw-out) .gw-ts-chip[data-key="${k}"]`);
      if (!c) return;
      const s = c.closest('.gw-ts-strip'), sr = s.getBoundingClientRect(), cr = c.getBoundingClientRect();
      if (cr.left < sr.left + 2 || cr.right > sr.right - 2) s.scrollLeft += cr.left - sr.left;
    }, key);
    await K.settle(200);
    return K.tap(`[data-modal=tacklescreen]:not(.gw-out) .gw-ts-chip[data-key=${key}]`);
  };
  const closeScreen = async () => {
    if ((await modal()) !== 'tacklescreen') return;
    if (!(await K.tap('[data-modal=tacklescreen] .gw-ts-done'))) await K.key('Escape');
    await K.settle(400);
  };

  /** The screen's layout at this size (LAKE2 §5.5: no text cut, nothing overlapping, every target ≥ 44 px, text ≥ 16 px). */
  const layout = () => g(() => {
    const vw = innerWidth, vh = innerHeight, faults = [];
    const box = document.querySelector('[data-modal=tacklescreen]:not(.gw-out) [data-loop=tackle-screen]');
    if (!box) return { faults: ['no screen'] };
    const R = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const hit = (a, b) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > 0.5 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 0.5;
    const on = (r) => r.l >= -0.5 && r.t >= -0.5 && r.r <= vw + 0.5 && r.b <= vh + 0.5;
    const chips = [...box.querySelectorAll('.gw-ts-chip')], foot = [...box.querySelectorAll('.gw-ts-foot button')];
    for (const b of [...chips, ...foot]) { const r = R(b); if (r.w < 43.5 || r.h < 43.5) faults.push(`target ${b.dataset.key || b.textContent.trim()} ${r.w.toFixed(0)}×${r.h.toFixed(0)}`); }
    for (const b of foot) if (!on(R(b))) faults.push(`off screen: ${b.textContent.trim()}`);
    for (const el of [box.querySelector('.gw-ts-head'), ...box.querySelectorAll('.gw-ts-h, .gw-ts-strip')]) if (el && !on(R(el))) faults.push(`off screen: ${el.className} ${JSON.stringify(R(el))}`);
    for (const s of box.querySelectorAll('.gw-ts-strip')) {
      const cs = [...s.querySelectorAll('.gw-ts-chip')].map(R);
      for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) if (hit(cs[i], cs[j])) faults.push(`chips overlap in ${s.parentNode.dataset.row}`);
      const f = s.querySelector('[aria-pressed=true]');
      if (f) { const a = R(f), sr = R(s); if (a.l < sr.l - 0.5 || a.r > sr.r + 0.5) faults.push(`the fitted ${f.dataset.key} not in view in its strip`); }
      // a turned strip's left edge on a chip's own (no name cut at the left; the left fade lies over an engraving only)
      if (s.scrollLeft > 0.5) { const sl = R(s).l; if (!cs.some((c) => Math.abs(c.l - sl) < 1)) faults.push(`the ${s.parentNode.dataset.row} row's left edge cuts a chip`); }
    }
    // the words: ≥ 16 px; whole (no ellipsis, no overflow); a chip's words inside the chip
    const names = [];
    // (a foot button's label: its words inside the button; the label's span carries the hook curls, drawn past its words by design)
    for (const b of foot) { const rg0 = document.createRange(); rg0.selectNodeContents(b); const q = R(b); for (const t of rg0.getClientRects()) if (t.width > 1 && (t.left < q.l - 0.5 || t.right > q.r + 0.5)) faults.push(`"${b.textContent.trim()}" out of its button`); if (parseFloat(getComputedStyle(b).fontSize) < 15.9) faults.push(`"${b.textContent.trim()}" under 16 px`); }
    for (const n of box.querySelectorAll('.gw-ts-name, .gw-ts-n, .gw-ts-log, .gw-ts-h, .gw-ts-title, .gw-ts-sub > span')) {
      const cs = getComputedStyle(n), fs = parseFloat(cs.fontSize), r = R(n), chip = n.closest('.gw-ts-chip');
      if (fs < 15.9) faults.push(`text "${n.textContent}" at ${fs}px`);
      if (n.scrollWidth > n.clientWidth + 1 && cs.display !== 'inline') faults.push(`text cut: "${n.textContent}" (${n.scrollWidth} > ${n.clientWidth})`);
      if (/…|\.\.\.$/.test(n.textContent)) faults.push(`ellipsis: ${n.textContent}`);
      if (chip) { const c = R(chip); if (r.l < c.l - 0.5 || r.r > c.r + 0.5 || r.t < c.t - 0.5 || r.b > c.b + 0.5) faults.push(`"${n.textContent}" out of its chip`); }
      if (n.classList.contains('gw-ts-name')) names.push({ t: n.textContent, lines: Math.round(r.h / (parseFloat(cs.lineHeight) || fs * 1.15)) });
    }
    // no two words over each other: every visible text run (clipped to its strip's view) against every other
    const runs = [], tw = document.createTreeWalker(box, NodeFilter.SHOW_TEXT), rg = document.createRange();
    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
      if (!t.nodeValue.trim() || !t.parentElement?.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const strip = t.parentElement.closest('.gw-ts-strip'), clip = strip ? R(strip) : null;
      rg.selectNodeContents(t);
      for (const q of rg.getClientRects()) {
        const r = clip ? { l: Math.max(q.left, clip.l), r: Math.min(q.right, clip.r), t: Math.max(q.top, clip.t), b: Math.min(q.bottom, clip.b) } : { l: q.left, r: q.right, t: q.top, b: q.bottom };
        if (r.r - r.l > 1 && r.b - r.t > 1) runs.push({ r, el: t.parentElement, s: t.nodeValue.trim().slice(0, 20) });
      }
    }
    for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) {
      if (runs[i].el === runs[j].el) continue;
      const a = runs[i].r, b = runs[j].r;
      if (Math.min(a.r, b.r) - Math.max(a.l, b.l) > 1 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 1) faults.push(`words overlap: "${runs[i].s}" / "${runs[j].s}"`);
    }
    // the foot's buttons over no word of the head or the rows
    for (const b of foot) { const fr = R(b); for (const x of runs) if (!b.contains(x.el) && hit(fr, x.r)) faults.push(`${b.textContent.trim()} over "${x.s}"`); }
    const rows = box.querySelector('.gw-ts-rows');
    if (rows && rows.scrollHeight > rows.clientHeight + 1) faults.push(`the rows scroll (${rows.scrollHeight} > ${rows.clientHeight})`);
    return { faults, vw, vh, box: R(box), chips: chips.length, names: names.filter((n) => n.lines > 1).map((n) => n.t), sheet: getComputedStyle(box.closest('.gw-modal')).alignItems === 'flex-end' };
  });

  /** A pause menu at this size (the Tackle item one more line in it): every item and its lock line on screen, no two over each other. */
  const menuFit = (sel) => g((sel) => {
    const vw = innerWidth, vh = innerHeight, faults = [];
    const bs = [...document.querySelectorAll(`[data-modal=${sel}] .gw-mbtn`)].map((b) => { const r = b.getBoundingClientRect(); return { t: (b.querySelector('span')?.textContent || '').trim(), l: r.left, r: r.right, top: r.top, b: r.bottom }; });
    if (!bs.length) return { faults: ['no menu'] };
    for (const b of bs) if (b.l < -0.5 || b.top < -0.5 || b.r > vw + 0.5 || b.b > vh + 0.5) faults.push(`off screen: ${b.t} ${Math.round(b.top)}..${Math.round(b.b)}`);
    for (let i = 1; i < bs.length; i++) if (bs[i].top < bs[i - 1].b - 0.5) faults.push(`${bs[i].t} over ${bs[i - 1].t}`);
    // the panel's closing flourish (ui.css .gw-panel::after: 26 px tall, 8 px off its foot) under the last item, the panel on screen
    const pn = document.querySelector(`[data-modal=${sel}] .gw-panel`)?.getBoundingClientRect();
    if (pn) {
      const last = bs[bs.length - 1], fl = pn.bottom - 8 - 26;
      if (last.b > fl + 0.5) faults.push(`the closing flourish over ${last.t} (${Math.round(last.b)} > ${Math.round(fl)})`);
      if (pn.bottom > vh + 0.5) faults.push(`the panel's foot off screen (${Math.round(pn.bottom)} > ${vh})`);
    }
    return { faults, n: bs.length, vh };
  }, sel);

  try {
    // ------------------------------------------------------------------ the save
    K.step('g: a fresh save, Start, the tutorial done, the Mossmere\'s end');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'stub' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => {
      const c = window.__gw, m = c.state.meta.loop;
      c.debug.loop.tutorial('done');
      m.tackle = { rod: 2, line: 2, reel: 2 };
      m.bait.mossmere = { ...(m.bait.mossmere || {}), mireworm: 10, lumen_moss: 6, heartmoss: 1 };
      m.lures = ['bent_spoon', 'feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner', 'guard_button'];
      m.finds = m.finds || {}; m.finds.got = { ...(m.finds.got || {}), belfry_winch: 1, guard_button: 1 };
      m.fitted = { bait: 'mireworm', lure: null };
      m.maps = { ...(m.maps || {}), lakes: [...new Set([...(m.maps?.lakes || ['mossmere']), 'sporewood'])] };
      m.clams = 9000;
      c.game.save();
    });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.settle(800); await K.steps(30);

    // ------------------------------------------------------------------ the rack
    K.step('g: the rod rack opens the Tackle screen');
    const rack = await g(() => { const b = document.querySelector('[data-modal=jetty] [data-tile=rack]'); return b ? { label: b.getAttribute('aria-label'), vis: getComputedStyle(b).visibility } : null; });
    K.check(rack && rack.label === TL.tackle.tin, `the rack target's accessible name: "${TL.tackle.tin}"`, rack);
    if (rack?.vis !== 'hidden' && await K.tap('[data-modal=jetty] [data-tile=rack]')) await K.settle(450);
    else { K.note('the rack is not placed in this frame: the screen opened from its seam', rack); await g(() => window.__gw.ui.loop.tackle.openScreen({ from: 'rack' })); await K.settle(450); }
    K.need((await modal()) === 'tacklescreen', 'the Tackle screen opens');
    let sc = await SC();
    K.check(sc?.from === 'rack' && JSON.stringify(Object.keys(sc.rows)) === JSON.stringify(['rod', 'line', 'reel', 'lure', 'bait']), 'from the rack: the five rows Rod · Line · Reel · Lure · Bait', sc);
    K.check(JSON.stringify(sc.rows.rod.map((c) => c.key)) === JSON.stringify(['willow_switch', 'ashwood_rod', 'whalebone_rod']) && JSON.stringify(onIn(sc, 'rod')) === '["whalebone_rod"]',
      'the rod row: the start piece and the two bought, the Whalebone fitted', sc.rows.rod);
    K.check(sc.rows.reel.some((c) => c.key === 'belfry_winch' && !c.on), 'the found Belfry Winch in the reel row, not fitted', sc.rows.reel);
    K.check(JSON.stringify(sc.rows.lure.map((c) => c.key)) === JSON.stringify(['bent_spoon', 'feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner', 'guard_button']), 'the lure row: the water\'s own owned and the found Button', sc.rows.lure);
    K.check(JSON.stringify(sc.rows.bait.map((c) => c.key)) === JSON.stringify(['heartmoss', 'mireworm', 'lumen_moss', 'bare']) && JSON.stringify(onIn(sc, 'bait')) === '["mireworm"]', 'the bait row: the ball, the two tins, the bare hook; the worms fitted', sc.rows.bait);
    const head = await g(() => [...document.querySelectorAll('[data-loop=tackle-screen] .gw-ts-head .gw-ts-title, [data-loop=tackle-screen] .gw-ts-head .gw-ts-sub > span')].map((e) => e.textContent.trim()));
    K.check(JSON.stringify(head) === JSON.stringify([TL.tackle.tin, 'The Mossmere']), 'the head: Tackle · The Mossmere (nothing carried before the first tow)', head);
    K.check(await g(() => !!document.querySelector('[data-loop=tackle-screen] [data-loop=tackle-sheet]')), 'the foot links to the Wick\'s sheet (from the rack)');
    const logs = await g(() => [...document.querySelectorAll('[data-loop=tackle-screen] [aria-pressed=true]')].map((b) => [b.dataset.key, [...b.querySelectorAll('.gw-ts-log')].map((l) => l.textContent)]));
    K.check(JSON.stringify(logs.slice(0, 3)) === JSON.stringify([['whalebone_rod', ['+5 Hold.', 'Casts 19 m.']], ['waxed_silk', ['+5 Hold.', 'Lands up to Elder.']], ['clockwork_reel', ['+5 Hold.']]]), 'under each fitted chip its gear-log line', logs);
    const words = await g(() => document.querySelector('[data-loop=tackle-screen]')?.innerText || '');
    K.check(!/%|likes?\b|odds|chance/i.test(words), 'no odds, no percentage on the screen', words);
    let lay = await layout();
    K.check(lay.faults.length === 0, `the screen's layout at ${width}×${height}`, lay);
    seen.push({ size: `${width}x${height}`, from: 'rack', sheet: lay.sheet, box: lay.box, wrapped: lay.names });
    await K.scan('the Tackle screen');
    await K.shoot(`rack-${width}x${height}`);

    K.step('g: taps fit: a lower rod, the best bought, the found Winch');
    K.need(await tapChip('ashwood_rod'), 'a tap on the Ashwood');
    await K.settle(250);
    let f = await fitOf();
    sc = await SC();
    K.check(f.fit.rod === 'ashwood_rod' && JSON.stringify(onIn(sc, 'rod')) === '["ashwood_rod"]', 'the Ashwood fitted (meta.loop.fit.rod), pressed', { f, rod: sc.rows.rod });
    const hold = await g(() => window.__gw.progression.loop.holdOf());
    K.check(hold.rod === 2, 'its Hold in place (+2)', hold);
    await K.shoot(`fit-ashwood-${width}x${height}`);
    K.need(await tapChip('whalebone_rod'), 'a tap on the Whalebone');
    await K.settle(250);
    f = await fitOf();
    K.check(f.fit.rod === null && JSON.stringify(onIn(await SC(), 'rod')) === '["whalebone_rod"]', 'the best bought back (fit null)', f);
    K.need(await tapChip('belfry_winch'), 'a tap on the Belfry Winch');
    await K.settle(250);
    f = await fitOf();
    K.check(f.found.reel === 'belfry_winch' && f.fit.reel === 'belfry_winch', 'the found Winch fitted (found and fit agree)', f);
    const wl = await g(() => [...document.querySelector('[data-loop=tackle-screen] .gw-ts-chip[data-key=belfry_winch]')?.querySelectorAll('.gw-ts-log') || []].map((l) => l.textContent));
    K.check(wl.length === 2 && wl[1].startsWith('Plays '), 'the Winch\'s own lines under it', wl);
    K.need(await tapChip('clockwork_reel'), 'a tap on the Clockwork');
    await K.settle(250);
    f = await fitOf();
    K.check(!f.found.reel && !f.fit.reel, 'the Clockwork back (the Winch off)', f);
    K.need(await tapChip('glimmer_spoon'), 'a tap on the Glimmer Spoon');
    await K.settle(250);
    f = await fitOf();
    K.check(f.fitted.lure === 'glimmer_spoon' && f.fitted.bait === null, 'a lure: on, the bait off (one thing on the hook)', f.fitted);
    K.need(await tapChip('mireworm'), 'a tap on the Mire Worms');
    await K.settle(250);
    f = await fitOf();
    K.check(f.fitted.bait === 'mireworm' && f.fitted.lure === null, 'a bait: on, the lure off', f.fitted);
    await K.noErrors('the taps');

    if (!K.phone) {
      K.step('g: the keys: the arrows move the focus, Enter fits, Esc closes');
      await g(() => document.activeElement?.blur?.());   // (the taps above left the last chip focused: the keys start from none)
      await page.keyboard.press('ArrowDown'); await K.steps(2);
      let a = await g(() => ({ key: document.activeElement?.dataset?.key ?? null, slot: document.activeElement?.dataset?.slot ?? null }));
      K.check(a.slot === 'rod' && a.key === 'whalebone_rod', 'the first arrow focuses the fitted rod', a);
      await page.keyboard.press('ArrowLeft'); await K.steps(2);
      const seenL = await g(() => { const c = document.activeElement, s = c?.closest('.gw-ts-strip'); if (!s) return null; const a = c.getBoundingClientRect(), b = s.getBoundingClientRect(); return { key: c.dataset.key, whole: a.left >= b.left - 0.5 && a.right <= b.right + 0.5, edge: s.scrollLeft <= 0.5 || [...s.querySelectorAll('.gw-ts-chip')].some((x) => Math.abs(x.getBoundingClientRect().left - b.left) < 1) }; });
      K.check(seenL && seenL.whole && seenL.edge, 'ArrowLeft: the chip focused whole in view, the strip\'s left edge on a chip\'s', seenL);
      await page.keyboard.press('ArrowDown'); await K.steps(2);
      a = await g(() => ({ key: document.activeElement?.dataset?.key ?? null, slot: document.activeElement?.dataset?.slot ?? null }));
      K.check(a.slot === 'line', 'ArrowLeft then ArrowDown: a chip in the line row', a);
      await page.keyboard.press('ArrowUp'); await K.steps(2);
      a = await g(() => ({ key: document.activeElement?.dataset?.key ?? null, slot: document.activeElement?.dataset?.slot ?? null }));
      K.check(a.slot === 'rod' && a.key === 'ashwood_rod', 'ArrowUp: back to the Ashwood', a);
      await page.keyboard.press('Enter'); await K.steps(3); await K.settle(200);
      f = await fitOf();
      K.check(f.fit.rod === 'ashwood_rod', 'Enter fits the focused chip', f);
      a = await g(() => document.activeElement?.dataset?.key ?? null);
      K.check(a === 'ashwood_rod', 'the focus stays on it after the redraw', a);
      await K.shoot(`keys-${width}x${height}`);
      await page.keyboard.press('ArrowRight'); await K.steps(2);
      await page.keyboard.press('Enter'); await K.steps(3); await K.settle(200);
      K.check((await fitOf()).fit.rod === null, 'ArrowRight, Enter: the Whalebone back', await fitOf());
      await page.keyboard.press('Escape'); await K.steps(3); await K.settle(400);
      K.check((await modal()) === 'jetty', 'Esc closes the screen: home', await stack());
    } else await closeScreen();

    K.step('g: the link to the Wick\'s sheet');
    await g(() => window.__gw.ui.loop.tackle.openScreen({ from: 'rack' }));
    await K.settle(400);
    K.need(await K.tap('[data-modal=tacklescreen] [data-loop=tackle-sheet]'), 'a tap on the sheet\'s link');
    await K.settle(700);
    K.check(await g(() => !!document.querySelector('[data-modal=journal] .gw-sheet') && !document.querySelector('[data-modal=tacklescreen]:not(.gw-out)')), 'the link opens the Wick\'s sheet (the screen gives way)', await stack());
    await K.shoot(`sheet-${width}x${height}`);
    await K.key('Escape'); await K.settle(500);
    if ((await modal()) !== 'jetty') { await K.key('Escape'); await K.settle(500); }

    K.step('g: the home pause\'s Tackle item');
    await g(() => window.__gw.ui.loop.openHomePause());
    await K.settle(350);
    const items = await g(() => [...document.querySelectorAll('[data-modal=homepause] .gw-mbtn')].map((b) => b.querySelector('span:not(.gw-sh-wick)')?.textContent.trim()));
    K.check(items.includes(TL.tackle.tin) && items.indexOf(TL.tackle.tin) === items.length - 2, 'the home pause: … · Tackle · Settings', items);
    await K.shoot(`homepause-${width}x${height}`);
    K.need(await K.tap('[data-modal=homepause] [data-loop=tackle-item]'), 'a tap on Tackle');
    await K.settle(400);
    sc = await SC();
    K.check((await modal()) === 'tacklescreen' && sc?.from === 'pause', 'the screen from the pause', sc?.from);
    K.check(!(await g(() => !!document.querySelector('[data-loop=tackle-screen] [data-loop=tackle-sheet]'))), 'no sheet link from the pause (the pause has its own item)');
    await K.tap('[data-modal=tacklescreen] .gw-ts-done'); await K.settle(400);
    K.check((await modal()) === 'homepause', 'Done: back to the pause', await stack());
    await K.key('Escape'); await K.settle(400);

    K.step('g: the pad: the D-pad moves, A fits, B closes');
    await g(() => window.__gw.ui.loop.tackle.openScreen({ from: 'pause' }));
    await K.settle(400);
    await press(PB.DOWN);
    let pf = await padFocus();
    K.check(pf && pf.slot, 'the D-pad puts the focus on a chip', pf);
    for (let i = 0; i < 6 && (pf?.slot !== 'rod' || pf?.key !== 'willow_switch'); i++) { await press(pf?.slot && pf.slot !== 'rod' ? PB.UP : PB.LEFT); pf = await padFocus(); }
    K.check(pf?.key === 'willow_switch', 'the D-pad reaches the Willow Switch', pf);
    await press(PB.RIGHT);
    pf = await padFocus();
    K.check(pf?.key === 'ashwood_rod', 'right: the Ashwood', pf);
    const pv = await g(() => { const c = document.querySelector('.gw-padfocus'), s = c?.closest('.gw-ts-strip'); if (!s) return null; const a = c.getBoundingClientRect(), b = s.getBoundingClientRect(); return { whole: a.left >= b.left - 0.5 && a.right <= b.right + 0.5, edge: s.scrollLeft <= 0.5 || [...s.querySelectorAll('.gw-ts-chip')].some((x) => Math.abs(x.getBoundingClientRect().left - b.left) < 1) }; });
    K.check(pv && pv.whole && pv.edge, 'the pad\'s chip whole in view, the strip\'s left edge on a chip\'s', pv);
    await press(PB.DOWN);
    pf = await padFocus();
    K.check(pf?.slot === 'line', 'down: the line row', pf);
    await press(PB.UP);
    pf = await padFocus();
    for (let i = 0; i < 4 && pf?.key !== 'ashwood_rod'; i++) { await press(pf?.slot !== 'rod' ? PB.UP : PB.RIGHT); pf = await padFocus(); }
    K.check(pf?.key === 'ashwood_rod', 'up (and along): the Ashwood', pf);
    await press(PB.A); await K.settle(250);
    f = await fitOf();
    K.check(f.fit.rod === 'ashwood_rod', 'A fits the focused chip', { f, pf: await padFocus() });
    await K.settle(300);
    await K.shoot(`pad-${width}x${height}`);
    await press(PB.RIGHT); await press(PB.A); await K.settle(250);
    K.check((await fitOf()).fit.rod === null, 'right, A: the Whalebone back', await fitOf());
    await press(PB.B); await K.settle(450);
    K.check((await modal()) === 'jetty', 'B closes the screen', await stack());
    await page.mouse.move(5, 5); await page.keyboard.press('Shift'); await K.steps(2);   // (a mouse and a key: the page back from the pad)
    await K.noErrors('home');

    // ------------------------------------------------------------------ every size
    for (const [w, hgt] of sizes) {
      K.step(`g: ${w}×${hgt}`);
      await page.setViewportSize({ width: w, height: hgt });
      await K.settle(500); await K.steps(4); await K.settle(250);
      await g(() => window.__gw.ui.loop.tackle.openScreen({ from: 'rack' }));
      await K.settle(500);
      lay = await layout();
      K.check(lay.faults.length === 0, `the screen's layout at ${w}×${hgt}`, lay);
      seen.push({ size: `${w}x${hgt}`, sheet: lay.sheet, box: lay.box, wrapped: lay.names });
      await K.scan(`the Tackle screen ${w}×${hgt}`);
      await K.shoot(`screen-${w}x${hgt}`);
      // a strip that overflows turns sideways (a swipe or the wheel): its last chip comes into view, nothing cut
      const turned = await g(() => { const s = [...document.querySelectorAll('[data-loop=tackle-screen] .gw-ts-strip')].find((x) => x.scrollWidth > x.clientWidth + 2); if (!s) return null; s.scrollLeft = s.scrollWidth; return s.parentNode.dataset.row; });
      if (turned) {
        await K.settle(250);
        const end = await g((row) => { const s = document.querySelector(`[data-loop=tackle-screen] [data-row=${row}] .gw-ts-strip`), c = [...s.querySelectorAll('.gw-ts-chip')].pop(), a = c.getBoundingClientRect(), b = s.getBoundingClientRect(); return { inView: a.left >= b.left - 0.5 && a.right <= b.right + 0.5, fade: s.className }; }, turned);
        K.check(end.inView, `the ${turned} row turned to its end: the last chip in view`, end);
        await K.shoot(`screen-turned-${w}x${hgt}`);
      }
      await closeScreen();
      K.check((await modal()) === 'jetty', `closed (${w}×${hgt})`);
      // the home pause with its Tackle item at this size
      await g(() => window.__gw.ui.loop.openHomePause());
      await K.settle(400);
      const mf = await menuFit('homepause');
      K.check(mf.faults.length === 0, `the home pause fits at ${w}×${hgt} (${mf.n} items)`, mf);
      await K.key('Escape'); await K.settle(400);
    }
    await page.setViewportSize({ width, height });
    await K.settle(500); await K.steps(4);

    // ------------------------------------------------------------------ a trip
    if (!skip.has('trip')) {
      K.step('g: a trip: the tin\'s door to the screen (no line out)');
      await g(() => window.__gw.debug.loop.sail('mossmere'));
      K.need((await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.loopHome?.gliding?.()", 14)).ok || (await K.until("c.flow === 'playing'", 2)).ok, 'the trip begins');
      await K.secs(3);
      K.need(await K.tap('[data-loop=tin]'), 'a tap on the tin');
      await K.settle(350);
      K.check((await modal()) === 'tackle' && await g(() => !!document.querySelector('[data-loop=tackle] [data-loop=tackle-door]')), 'the drawer carries the door (no line out)');
      const dl = await g(() => { const b = document.querySelector('[data-loop=tackle-door]'), r = b.getBoundingClientRect(), h = b.closest('.gw-tk-hrow').querySelector('.gw-tk-h').getBoundingClientRect(); return { w: r.width, h: r.height, on: r.left >= 0 && r.right <= innerWidth && r.top >= 0, apart: r.left >= h.right - 0.5 || r.top >= h.bottom - 0.5, text: b.textContent.trim() }; });
      K.check(dl.w >= 44 && dl.h >= 44 && dl.on && dl.apart, 'the door: ≥ 44 px, on screen, clear of the row\'s head', dl);
      await K.shoot(`drawer-door-${width}x${height}`);
      K.need(await K.tap('[data-loop=tackle-door]'), 'a tap on the door');
      await K.settle(450);
      sc = await SC();
      K.check((await modal()) === 'tacklescreen' && sc?.from === 'tin', 'the Tackle screen from the tin (the drawer gives way)', await stack());
      K.need(await tapChip('lumen_moss'), 'Lumen Moss on the trip');
      await K.settle(250);
      const rr = await g(() => ({ eq: window.__gw.state.run.equippedBait ?? null, lure: window.__gw.state.run.lure ?? null }));
      K.check(rr.eq === 'lumen_moss' && !rr.lure, 'the trip\'s hook: Lumen Moss', rr);
      lay = await layout();
      K.check(lay.faults.length === 0, `the screen's layout on the trip (${width}×${height})`, lay);
      await K.steps(3);
      const tips = await g(() => [...document.querySelectorAll('.gw-loop-tip, .gw-toast--murk')].filter((t) => t.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true })).map((t) => t.textContent.trim()));
      K.check(tips.length === 0, 'no tip and no Murk line over the screen (they wait under it)', tips);
      await K.shoot(`trip-screen-${width}x${height}`);
      await closeScreen();
      const tk = await g(() => window.__gw.ui.loop.tackle.debug());
      K.check(tk.bait === 'lumen_moss', 'the tin shows the moss', tk);

      K.step('g: a line out: no door');
      const pt = await K.waterPoint();
      await K.pressHold(pt.x, pt.y, 0.5);
      K.need((await K.until("c.fishing.state === 'waiting'", 8)).ok, 'a real cast, the float waiting');
      await K.steps(2);
      K.need(await K.tap('[data-loop=tin]'), 'a tap on the tin');
      await K.settle(350);
      K.check((await modal()) === 'tackle' && !(await g(() => !!document.querySelector('[data-loop=tackle] [data-loop=tackle-door]'))), 'the drawer opens without the door (a line is out: rod, line and reel wait for the line in)');
      await K.key('Escape'); await K.settle(300);

      K.step('g: a fish on: the trip pause\'s Tackle item says "After this fish."');
      await g(() => { const d = window.__gw.debug; d.fishOutcome?.('land'); d.forceBite?.({ speciesId: 'dusk_minnow', z: 0.3, wait: 0.2 }); });
      K.need((await K.until("c.fishing.state === 'bite'", 4)).ok, 'a bite');
      await g(() => window.__gw.debug.fishStrike?.('struck'));
      K.need((await K.until("c.fishing.state === 'reeling' || c.fishing.state === 'landing'", 3)).ok, 'hooked: the play');
      await K.steps(2);
      await K.key('Escape'); await K.settle(700);
      if (!(await g(() => !!document.querySelector('[data-modal=pause]')))) { await g(() => window.__gw.game?.pause?.()); await K.settle(700); }
      const it = await g(() => { const b = document.querySelector('[data-modal=pause] [data-loop=tackle-item]'); return b ? { locked: b.classList.contains('gw-locked'), w: b.querySelector('.gw-lock-w')?.textContent ?? null } : null; });
      K.check(it && it.locked && it.w === TL.tackle.after, `the item dimmed with "${TL.tackle.after}"`, it);
      await K.shoot(`trip-pause-busy-${width}x${height}`);
      let tf = await menuFit('pause');
      K.check(tf.faults.length === 0, `the trip pause fits with its two lock lines (${width}×${height})`, tf);
      if (K.phone) {
        // a phone held sideways: the trip pause's five items and two lock lines on 390 px of height
        await page.setViewportSize({ width: 844, height: 390 }); await K.settle(500); await K.steps(3);
        tf = await menuFit('pause');
        K.check(tf.faults.length === 0, 'the trip pause fits at 844×390 with its two lock lines', tf);
        await K.shoot('trip-pause-busy-844x390');
        await page.setViewportSize({ width, height }); await K.settle(500); await K.steps(3);
      }
      if (it) { await K.tap('[data-modal=pause] [data-loop=tackle-item]'); await K.settle(300); }
      K.check((await modal()) === 'pause', 'a tap opens nothing while the fish is on', await stack());
      await K.tap('[data-modal=pause] .gw-btn--primary'); await K.settle(400);
      await g(() => window.__gw.debug.fishPlayTo?.(0.97));
      await K.toCard('the Dusk Minnow', { dwell: 1.0 });
      await K.until("c.fishing.state === 'idle'", 6);
      await K.noErrors('the trip');
    }

    // ------------------------------------------------------------------ after the tow
    if (!skip.has('tow')) {
      K.step('g: after the tow: Sporewood\'s own rows and the carried line');
      // (home first: the trip ends through its tally, as the Home pill ends it)
      if ((await g(() => window.__gw.flow)) !== 'home') {
        await g(() => window.__gw.debug.loop.home());
        for (let i = 0; i < 8; i++) {
          await K.until("c.debug.ui().openModal === 'tally' || (c.flow === 'home' && c.debug.ui().openModal === 'jetty')", 12);
          const m = await modal();
          if (m === 'jetty') break;
          if (!(await K.tap(`[data-modal=${m}] .gw-btn--primary`))) await K.key('Escape');
          await K.settle(600);
        }
      }
      const hm = await K.until("c.flow === 'home' && c.debug.ui().openModal === 'jetty'", 20);
      K.need(hm.ok, 'home after the trip', { hm, st: await g(() => window.__gw.debug.loop.homeState()), stack: await stack() });
      await K.settle(600); await K.steps(20);
      const tow = await g(() => { const c = window.__gw; c.data.LOOP.shipped = 'sporewood'; const L = c.progression.loop; const r = L.towTo('sporewood'); const b = L.buy('rod:1'); return { r: { ok: r.ok, first: r.first }, b: b?.ok ?? null, carried: L.carried()?.line ?? null }; });
      K.check(tow.r.ok && tow.r.first && tow.b === true && tow.carried === 'Carried +2 · +2 · +2', 'the first tow (the ledger\'s towTo), Stalkwood bought, "Carried +2 · +2 · +2"', tow);
      await g(() => window.__gw.ui.loop.tackle.openScreen({ from: 'rack' }));
      await K.settle(500);
      sc = await SC();
      const hd = await g(() => document.querySelector('[data-loop=tackle-screen] .gw-ts-head')?.innerText.replace(/\s+/g, ' ').trim());
      K.check(/Sporewood Pools/.test(hd) && /Carried \+2 · \+2 · \+2/.test(hd), 'the head: Sporewood Pools and the carried line', hd);
      K.check(JSON.stringify(sc.rows.rod.map((c) => c.key)) === JSON.stringify(['willow_switch', 'stalkwood']) && JSON.stringify(onIn(sc, 'rod')) === '["stalkwood"]', 'the rod row: the Willow Switch and Sporewood\'s Stalkwood, fitted', sc.rows.rod);
      K.check(JSON.stringify(sc.rows.lure.map((c) => c.key)) === JSON.stringify(['seedpod_twirl', 'guard_button']), 'the lure row: the Seedpod Twirl and the found Button (the Mossmere\'s wait there)', sc.rows.lure);
      K.check(sc.rows.bait.map((c) => c.key).includes('spore_cake') && !sc.rows.bait.some((c) => ['mireworm', 'lumen_moss'].includes(c.key)), 'the bait row: Spore Cake; no Mossmere tin', sc.rows.bait);
      K.check(sc.rows.reel.some((c) => c.key === 'belfry_winch'), 'the found Winch travels', sc.rows.reel);
      lay = await layout();
      K.check(lay.faults.length === 0, `the screen's layout after the tow (${width}×${height})`, lay);
      await K.scan('the Tackle screen at Sporewood');
      await K.shoot(`sporewood-${width}x${height}`);
      K.need(await K.tap('[data-modal=tacklescreen] [data-loop=tackle-sheet]'), 'the link to the sheet');
      await K.settle(800);
      const carry = await g(() => { const p = document.querySelector('[data-modal=journal] .gw-sh-carry'); if (!p) return null; const r = p.getBoundingClientRect(); return { t: p.textContent.trim(), vis: r.width > 0 && r.height > 0, fs: parseFloat(getComputedStyle(p).fontSize) }; });
      K.check(carry && carry.t === 'Carried +2 · +2 · +2' && carry.vis && carry.fs >= 16, 'the sheet\'s Tackle: the carried line above the plates', carry);
      // (the sheet's own word rule, ui-loop.textAllowed with screen 'sheet', as loop-sheet.scenario reads it: no raw item id, no banned word;
      //  any other unknown word is noted for the gate)
      const raw = await K.scanRaw();
      const hp = await uiLoopHelper();
      const left = raw.unknown.map((u) => u.text).filter((t) => !(hp && (hp(t, 'sheet') || hp(t, 'journal'))) && !['Close', 'Back', 'Journal'].includes(t) && !/^.+'s (Journal|Sheet)$/.test(t));
      K.check(raw.banned.length === 0 && !left.some((t) => /^[a-z]+(_[a-z]+)+$|^[a-z]+$/.test(t)), 'the sheet at Sporewood: no banned word, no raw item id (the start pieces by their names)', { banned: raw.banned, left });
      if (left.length) K.note('the sheet at Sporewood: words outside textAllowed (for the gate)', left);
      await K.shoot(`sporewood-sheet-${width}x${height}`);
      await K.key('Escape'); await K.settle(400);
      await K.noErrors('after the tow');
    }
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${String(e?.stack || e).split('\n').slice(0, 3).join(' | ')}`); log('THREW', e); }
  }
  await K.release().catch(() => {});
  log('LAKE2_G', JSON.stringify({ size: `${width}x${height}`, failures: K.failures, notes: K.notes, sizes: seen }));
  return { failures: K.failures };
}
