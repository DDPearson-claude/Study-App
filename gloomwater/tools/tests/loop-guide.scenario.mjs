// The first-play guide in the browser (src/ui-guide.js; the user's ask of 17 November 2026). A loop dev build from a fresh save with
// the guide on (?guide=1: the runner presets it off for every other scenario), Start with no film: the welcome over the Landing (the
// tow waits), the Chart's box at the mooring, Sail, the cast's box, the bite's box on the settled float, the fight's at the first hook,
// the card's on the first catch card, the tackle tin's, the hold full's, home: Murk's after the tally; a second trip's lost fish: the
// got-away box. Each box: its words (TEXT_LOOP.guide), ≥ 16 px text, inside the screen, never over its target (its arrow toward it),
// the screen under it still in view, and the game waiting (its clock held). Then Settings' two rows and Replay. On a phone run each
// box is shot again at 390 × 844. Prints `LOOP_GUIDE {size, failures, notes}`; returns its failures.
//
//   node build.mjs --dev --out=tools/out/guide/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/guide/dev.html --shots=tools/out/guide/desktop --script=tools/tests/loop-guide.scenario.mjs
//   nice -n 10 node tools/playtest.mjs --html=tools/out/guide/dev.html --shots=tools/out/guide/phone --script=tools/tests/loop-guide.scenario.mjs --mobile --width=820 --height=900
import { makeKit, Abort } from './loop-1a.scenario.mjs';

const GUIDE_WAIT_TACKLE = 0.8;   // (src/ui-guide.js GUIDE_WAIT.tackle)

function readGuide() {
  const c = window.__gw, d = c.ui?.loop?.guide?.debug?.() || null, el = document.querySelector('.gw-guide');
  const R = (r) => (r ? { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom) } : null);
  if (!el) return { on: false, debug: d, W: innerWidth, H: innerHeight };
  const tx = el.querySelector('.gw-guide-text'), s = getComputedStyle(tx), a = el.querySelector('.gw-guide-arrow');
  const btns = [...el.querySelectorAll('button')].map((b) => ({ act: b.dataset.guideAct, text: b.textContent, r: R(b.getBoundingClientRect()) }));
  const under = [...document.querySelectorAll('.gw-modal:not(.gw-m-guide):not(.gw-out)')].slice(-1).map((m) => ({ id: m.dataset.modal, op: Number(getComputedStyle(m).opacity),
    body: Number(getComputedStyle(m.querySelector('.gw-modal-body') || m).opacity) }));
  const r = el.getBoundingClientRect(), mid = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
  // the target as the eye sees it: its opacity multiplied up its parents (a child is never clearer than its parent)
  const te = d?.placed?.sel ? document.querySelector(d.placed.sel) : null;
  let seen = te ? 1 : null;
  for (let e = te; e; e = e.parentElement) seen *= Number(getComputedStyle(e).opacity);
  return { on: true, id: el.dataset.guide, text: tx.textContent, fs: parseFloat(s.fontSize), family: s.fontFamily.split(',')[0], r: R(r), btns,
    arrow: a && !a.hidden ? R(a.getBoundingClientRect()) : null, target: d?.placed?.target ? R(d.placed.target) : null,
    cut: tx.scrollWidth > tx.clientWidth + 1 || tx.scrollHeight > tx.clientHeight + 1 || tx.getBoundingClientRect().bottom > r.bottom, takesTap: !!mid && el.contains(mid),
    W: innerWidth, H: innerHeight, debug: d, blocking: c.ui.isBlocking?.() === true, under, seen,
    hidden: [...document.querySelectorAll('.gw-loop-tip, .gw-teach, .gw-murk-line')].filter((e) => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden').length };
}
const hit = (a, b) => !!a && !!b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'guide' });
  let n = 0;
  const TL = () => g(() => window.__gw?.data?.TEXT_LOOP?.guide ?? null);
  const open = () => g(() => window.__gw.ui.loop.guide.debug().open);
  /** Wait for box `id`, then look at it: words, size, place, the arrow, the screen under it, the game held; a shot. */
  async function look(id, { secs = 8, target = true, held = true } = {}) {
    const w = await K.until(`c.ui.loop.guide.debug().open === ${JSON.stringify(id)}`, secs);
    K.need(w.ok, `the ${id} box shows`, await g(() => window.__gw.ui.loop.guide.debug()));
    await K.settle(350);
    const t = await g(readGuide), words = await TL();
    K.check(t.on && t.id === id && [words?.boxes?.[id], words?.touch?.[id]].includes(t.text), `${id}: its words (TEXT_LOOP.guide.boxes.${id})`, t.text);
    K.check(t.fs >= 16, `${id}: the words ≥ 16 px (${t.fs})`, t.fs);
    K.check(t.r.left >= 15 && t.r.top >= 15 && t.r.right <= t.W - 15 && t.r.bottom <= t.H - 15, `${id}: inside the screen's 16 px gutters`, { r: t.r, W: t.W, H: t.H });
    K.check(!t.cut, `${id}: no word cut`, t.r);
    const okB = t.btns.find((b) => b.act === 'ok');
    K.check(!!okB && okB.text === words.ok && okB.r.bottom - okB.r.top >= 44, `${id}: one "Got it" ≥ 44 px`, t.btns);
    K.check(t.takesTap && t.blocking, `${id}: the box takes the taps (a blocking screen)`, { takesTap: t.takesTap, blocking: t.blocking });
    K.check(t.hidden === 0, `${id}: no in-world line beside it`, t.hidden);
    if (target) {
      K.check(!!t.target && !hit(t.r, t.target) && (!!t.arrow || id === 'card'), `${id}: beside its target, never over it, an arrow toward it`, { r: t.r, target: t.target, arrow: t.arrow });
      K.check(t.seen >= 0.9, `${id}: its target in plain view under it (opacity up its parents ${t.seen})`, t.seen);
    }
    if (id === 'card') {
      const cw = await g(() => [...document.querySelectorAll('[data-modal=catch] :is(.gw-catch-name, .gw-cc-stats, .gw-cc-measure)')].map((e) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }));
      K.check(cw.length > 0 && cw.every((w) => !hit(t.r, w)), 'card: clear of the fish\'s name, its length line and the ruler', { r: t.r, cw });
    }
    const bad = t.under.filter((u) => u.op < 0.99 || u.body < 0.99);
    K.check(bad.length === 0, `${id}: the screen under it stays in view`, t.under);
    if (held) {
      const t0 = await g(() => ({ gt: window.__gw.time.gameT, fs: window.__gw.fishing.state, tow: window.__gw.debug.loop.tow?.()?.phase ?? null }));
      await K.steps(4);
      const t1 = await g(() => ({ gt: window.__gw.time.gameT, fs: window.__gw.fishing.state, tow: window.__gw.debug.loop.tow?.()?.phase ?? null }));
      K.check(t1.gt === t0.gt && t1.fs === t0.fs && t1.tow === t0.tow, `${id}: the game waits while it is up`, { t0, t1 });
    }
    log('guide', JSON.stringify({ id, W: t.W, H: t.H, r: t.r, fs: t.fs, f: t.family, target: t.target, arrow: t.arrow, side: t.debug?.placed?.side, seen: t.seen }));
    await K.shoot(`${String(++n).padStart(2, '0')}-${id}`);
    return t;
  }
  async function gotIt(id, { key = false } = {}) {
    if (key) await K.key('Enter'); else await K.tap('[data-guide-act=ok]');
    await K.steps(2);
    K.check((await open()) === null && !(await g(() => !!document.querySelector('.gw-m-guide:not(.gw-out)'))), `${id}: "Got it" closes it`);
  }

  try {
    K.step('guide: a fresh save, ?guide=1, Start with no film');
    await K.load({ fresh: true, query: '&guide=1' });
    await K.titleReady();
    K.check((await g(() => window.__gw.ui.loop.guide.debug())).on === true, 'a new save: the guide is on');
    await g(() => { window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.debug.loop.tow().phase === 'arrive'", 4)).ok, 'the Landing');
    await look('welcome', { target: false });
    const sk = (await g(readGuide)).btns.find((b) => b.act === 'skip');
    K.check(!!sk && sk.text === (await TL()).skip, 'the welcome offers "Skip the guide"', sk);
    await gotIt('welcome', { key: !K.phone });
    K.check(await g(() => window.__gw.state.meta.guide?.seen?.welcome === true), 'seen, in meta.guide');

    K.step('guide: the tow, tapped through; the Chart at the mooring');
    const tapMid = async () => { await K.tapXY(Math.round(api.width / 2), Math.round(api.height * 0.6)); await K.steps(2); };
    await tapMid();                                   // the arrive → the wake
    await K.steps(4); await tapMid();                 // the wake line → the leg
    await K.secs(0.5); await tapMid();                // the leg → the dip
    K.need((await K.until("c.debug.loop.tow().phase === 'glide'", 3)).ok, 'the glide in');
    await K.steps(3); await tapMid();                 // the glide → the mooring
    await look('chart', { secs: 6 });
    await gotIt('chart');
    K.need(await K.tap('[data-action=sail]'), 'Sail');
    await K.steps(3); await K.key('Space');           // (the glide out: a skip key ends it)
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 6)).ok, 'on the water');

    K.step('guide: the first cast, the bite, the fight, the card');
    await look('cast', { target: false });
    await gotIt('cast');
    const tip = await K.until("[...document.querySelectorAll('.gw-loop-tip')].some((e) => e.getBoundingClientRect().width > 0)", 2);
    K.check(tip.ok, 'the first trip\'s cast tip comes after the box (never beside it)');
    const pt = await K.waterPoint();
    await K.pressHold(pt.x, pt.y, 0.5, 'c.fishing.state');
    K.need((await K.until("c.fishing.state === 'waiting'", 6)).ok, 'the float settles');
    await look('bite', { target: false });
    await gotIt('bite');
    await g(() => { const d = window.__gw.debug; d.fishOutcome?.('land'); d.forceBite?.({ speciesId: 'mossback_perch', z: 0.6, wait: 0.2 }); });
    K.need((await K.until("c.fishing.state === 'bite'", 4)).ok, 'a bite');
    K.check((await open()) === null, 'nothing over the bite');
    await g(() => window.__gw.debug.fishStrike?.('struck'));
    K.need((await K.until("c.fishing.state === 'reeling'", 3)).ok, 'hooked');
    await look('fight', { target: false });
    await gotIt('fight');
    await g(() => window.__gw.debug.fishPlayTo?.(0.97));
    const sh = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 15);
    K.need(sh.ok, 'the show');
    K.check((await open()) === null, 'nothing over the reveal and the show');
    if (await g(() => window.__gw.fishing.inShow === true && window.__gw.debug.ui().openModal !== 'catch')) await K.key('Space');
    await look('card', { secs: 12 });
    await gotIt('card');
    await K.keepCard('the first fish', { dwell: 0 });

    K.step('guide: the tackle tin; a fish gets away; the hold full');
    if (!(await g(() => window.__gw.ui.loop.guide.debug().snapshot.kit))) {
      // before GEAR-GATES' start kit (a fresh save owns no lure and no bait): the tin's box, which names worms and a spoon, waits
      await K.secs(GUIDE_WAIT_TACKLE + 0.6);
      K.check((await open()) === null, 'tackle: no box while the save owns no lure and no bait');
      K.note('the save has no start kit yet (before gw-gear): a lure and worms given here');
      await g(() => { const c = window.__gw, L = c.state.meta.loop; L.lures = [...(L.lures || []), Object.keys(c.data.LOOP.lures)[0]]; c.debug.loop.giveBait('mireworm', 6); });
    }
    await look('tackle');
    await gotIt('tackle');
    await g(() => window.__gw.bus.emit('fish:escaped', { speciesId: 'mossback_perch', sizeClass: 'prize', reason: 'thrown' }));   // (the lost fish's own event; the real loss is node-tested)
    await look('away', { target: false });
    await gotIt('away');
    for (const i of [2, 3]) {
      K.need(await g(() => window.__gw.debug.instantCatch?.('dusk_minnow', { z: 0 }) === true), `fish ${i}: debug.instantCatch`);
      await K.keepCard(`fish ${i}`, { dwell: 0 });
    }
    await look('home');
    await gotIt('home');

    K.step('guide: home, the tally, Murk');
    await K.tap('[data-loop=home]');
    await K.steps(3); await K.key('Space');           // (the sail home: a skip key ends it)
    K.need((await K.until("c.debug.ui().openModal === 'tally'", 6)).ok, 'the tally');
    await K.key('Escape'); await K.steps(3); await K.settle(300);
    await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
    await look('murk', { secs: 6 });
    await gotIt('murk');
    K.check(await g(() => { const s = window.__gw.state.meta.guide?.seen || {}; return ['welcome', 'chart', 'cast', 'bite', 'fight', 'card', 'tackle', 'home', 'murk', 'away'].every((k) => s[k]); }), 'all ten seen');

    K.step('guide: Settings, Guide tips and Replay guide');
    await g(() => window.__gw.ui.openSettings?.());
    await K.steps(2); await K.settle(400);
    const rows = await g(() => ({ tips: !!document.querySelector('[data-modal=settings] [data-guide-set=tips]'), replay: !!document.querySelector('[data-modal=settings] [data-guide-set=replay]') }));
    K.check(rows.tips && rows.replay, 'Settings: "Guide tips" and "Replay guide"', rows);
    await g(() => document.querySelector('[data-modal=settings] [data-guide-set=replay]')?.scrollIntoView?.({ block: 'center' }));
    await K.settle(300);
    await K.shoot(`${String(++n).padStart(2, '0')}-settings`);
    await K.tap('[data-modal=settings] [data-guide-set=tips]');
    K.check(await g(() => window.__gw.state.meta.guide.on === false), 'Guide tips off');
    await K.tap('[data-modal=settings] [data-guide-set=replay]');
    K.check(await g(() => window.__gw.state.meta.guide.on === true && Object.keys(window.__gw.state.meta.guide.seen).length === 0), 'Replay guide: on, nothing seen');
    await K.key('Escape'); await K.steps(2);

    if (K.phone) {
      K.step('guide: every box at 390 × 844');
      await page.setViewportSize({ width: 390, height: 844 });
      await K.steps(3); await K.settle(500);
      await g(() => { const c = window.__gw; c.ui.closeAll?.(); });
      for (const id of ['welcome', 'chart', 'cast', 'bite', 'fight', 'card', 'tackle', 'home', 'murk', 'away']) {
        await g((i) => window.__gw.ui.loop.guide.show(i), id);
        await K.steps(1); await K.settle(250);
        const t = await g(readGuide);
        K.check(t.on && t.fs >= 16 && !t.cut && t.r.left >= 15 && t.r.right <= t.W - 15 && t.r.top >= 15 && t.r.bottom <= t.H - 15, `390: ${id} fits`, { r: t.r, fs: t.fs, cut: t.cut });
        await K.shoot(`390-${id}`);
        await g(() => window.__gw.ui.loop.guide.close('ok'));
        await K.steps(2);
      }
    }
    await K.noErrors('guide');
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${String(e?.stack || e).split('\n').slice(0, 4).join(' | ')}`); log('THREW', String(e?.stack || e)); }
  }
  try { await K.release(); } catch { /* ignore */ }
  const out = { size: K.tag, failures: K.failures, notes: K.notes };
  log(`LOOP_GUIDE ${JSON.stringify(out)}`);
  return K.failures;
}
