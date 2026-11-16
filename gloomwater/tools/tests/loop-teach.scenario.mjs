// The float's two marks taught once, in the browser (src/ui-teach.js; the user's play-test, 16 November 2026). A loop dev build from
// a fresh save (no film), the tutorial done through the debug hook, Sail, the first cast: the captions by the notches and the dots on
// the first settled float (shot), their words, sizes and places checked against the marks, the float and the HUD; held, then gone.
// On a phone the same captions are shot again at 358 × 664 (the viewport resized while they hold). Then a fish landed, the water's
// good bites spent (the dots run out): Murk's first quiet-water line on the water (SPEC §8.6, shot); and a reload, Continue, a cast:
// the captions never again. Prints `LOOP_TEACH {size, failures, notes}`; returns its failures.
//
//   node build.mjs --dev --out=tools/out/mvp-teach/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-teach/dev.html --shots=tools/out/mvp-teach/desktop --script=tools/tests/loop-teach.scenario.mjs --width=960 --height=540
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-teach/dev.html --shots=tools/out/mvp-teach/phone --script=tools/tests/loop-teach.scenario.mjs --mobile
//   (--small=358x664: the phone's second size, default 358x664 on --mobile; --small=none skips it; on a desktop run --small=WxH
//   resizes the page the same way, a narrow window with a mouse)
import { makeKit, Abort } from './loop-1a.scenario.mjs';

/** The captions, the marks, the float and the HUD's pieces on screen now (in the page). */
function readTeach() {
  const c = window.__gw, el = document.querySelector('[data-loop=teach]');
  const R = (r) => ({ left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom) });
  const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05; };
  const fav = document.querySelector('.gw-favour.gw-on');
  const ticks = fav?.querySelector('.gw-fav-ticks')?.getBoundingClientRect();
  let dots = null;
  for (const i of fav ? fav.querySelectorAll('.gw-fav-dots i') : []) { const r = i.getBoundingClientRect(); dots = dots ? { left: Math.min(dots.left, r.left), right: Math.max(dots.right, r.right), top: Math.min(dots.top, r.top), bottom: Math.max(dots.bottom, r.bottom) } : { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; }
  // the float as the view sees it (its projected tip, the bobber below it), shrunk to the drawn bobber
  const fr = c.ui?.loop?.teach?.debug?.()?.float;
  const float = fr ? { left: fr.left + 4, right: fr.right - 4, top: fr.top + 6, bottom: fr.bottom - 8 } : null;
  const hud = [];
  for (const sel of ['.gw-hold', '[data-loop=home]', '.gw-tl', '.gw-tr', '.gw-hb-pause', '.gw-toast.gw-in']) for (const e of document.querySelectorAll(sel)) if (vis(e)) hud.push({ sel, r: R(e.getBoundingClientRect()) });
  const caps = el ? [...el.querySelectorAll('.gw-teach-cap')].map((x) => { const r = x.getBoundingClientRect(), s = getComputedStyle(x);
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, hit = document.elementFromPoint(cx, cy);
    return { mark: x.dataset.mark, text: x.textContent, r: R(r), fs: parseFloat(s.fontSize), pe: s.pointerEvents, family: s.fontFamily.split(',')[0], shadow: s.textShadow, takesTap: !!hit && el.contains(hit) }; }) : [];
  const leaders = el ? [...el.querySelectorAll('path')].map((p) => p.getAttribute('d') || '') : [];
  return { on: !!el, cls: el?.className || '', caps, leaders, ticks: ticks ? R(ticks) : null, dots: dots ? R(dots) : null, float, hud, W: innerWidth, H: innerHeight,
    debug: c.ui?.loop?.teach?.debug?.() ?? null, seen: c.state.meta.seenTips?.loop_marks === true, state: c.fishing?.state };
}
const hit = (a, b, pad = 0) => !!a && !!b && a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'teach' });
  const TL = await g(() => window.__gw?.data?.TEXT_LOOP ?? null).catch(() => null);
  /** One look at the captions: their words, ≥ 16 px on a phone, pointer-events none, clear of each other, the marks, the float, the HUD. */
  async function look(where) {
    const t = await g(readTeach);
    K.check(t.on && t.caps.length === 2, `${where}: the two captions are up`, { on: t.on, n: t.caps.length, debug: t.debug });
    if (t.caps.length !== 2) return t;
    const [n, d] = t.caps;
    K.check(n.mark === 'notches' && d.mark === 'dots' && !!n.text && !!d.text, `${where}: the notches' and the dots' words`, [n.text, d.text]);
    if (K.phone || t.W <= 700) K.check(t.caps.every((x) => x.fs >= 16), `${where}: every caption ≥ 16 px on a phone`, t.caps.map((x) => x.fs));
    // (the raft and its Wick are kept clear where the HUD's bands leave room: soft, a note when they could not be)
    if ((t.debug?.layout?.soft || []).length) K.note(`${where}: near the raft's box (no room inside the bands to clear it)`, { soft: t.debug.layout.soft, raft: t.debug?.raft });
    K.check(t.caps.every((x) => x.pe === 'none' && !x.takesTap), `${where}: pointer-events none (a tap goes to the water)`, t.caps.map((x) => [x.pe, x.takesTap]));
    K.check(!hit(n.r, d.r), `${where}: the captions apart`, [n.r, d.r]);
    K.check(t.caps.every((x) => x.r.left >= 15 && x.r.right <= t.W - 15), `${where}: both on the screen (16 px gutters)`, t.caps.map((x) => x.r));
    K.check(t.ticks && t.dots && t.caps.every((x) => !hit(x.r, t.ticks) && !hit(x.r, t.dots)), `${where}: clear of the notches and the dots`, { ticks: t.ticks, dots: t.dots, caps: t.caps.map((x) => x.r) });
    K.check(!t.float || t.caps.every((x) => !hit(x.r, t.float)), `${where}: clear of the float`, { float: t.float, caps: t.caps.map((x) => x.r) });
    const hudHit = t.hud.filter((h) => t.caps.some((x) => hit(x.r, h.r)));
    K.check(hudHit.length === 0, `${where}: clear of the HUD`, hudHit);
    K.check(t.leaders.length === 2 && t.leaders.every((p) => /^M[\d.-]+ [\d.-]+ Q/.test(p)), `${where}: two fine ink leaders`, t.leaders);
    if (t.W > 700 && t.ticks) K.check(t.caps.every((x) => x.r.left >= t.ticks.right || x.r.right <= t.ticks.left), `${where}: beside the float's marks on a desktop`, t.caps.map((x) => x.r));
    K.check(t.debug?.layout?.ok === true, `${where}: the view's own layout reports no fault`, t.debug?.layout?.faults);
    log('teach', JSON.stringify({ where, W: t.W, H: t.H, caps: t.caps.map((x) => ({ m: x.mark, r: x.r, fs: x.fs, f: x.family })), ticks: t.ticks, dots: t.dots, float: t.float }));
    return t;
  }
  async function castNow(what) {
    const pt = await K.waterPoint();
    await K.pressHold(pt.x, pt.y, 0.5, 'c.fishing.state');
    const c = await K.until("c.fishing.state === 'waiting' || c.fishing.state === 'bite'", 8);
    K.need(c.ok, `${what}: the cast lands and the float settles`, await g(() => window.__gw.fishing.state));
  }
  try {
    K.step('teach: a fresh save, Start with no film, the tutorial done, Sail');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    K.check(await g(() => window.__gw.state.meta.seenTips?.loop_marks !== true), 'a fresh save has not been taught');
    K.need(await g(() => window.__gw.game.sail({ water: 'mossmere' })), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 12)).ok, 'on the water');
    await K.secs(2.2);   // (the first trip's cast tip has its moment)
    K.check(!(await g(readTeach)).on, 'nothing while the float is not out');

    K.step('teach: the first cast; the captions on the settled float');
    await castNow('the first cast');
    const up = await K.until('c.ui.loop.teach.debug().shown === true', 3);
    K.need(up.ok, 'the captions show on the first settled float', await g(readTeach));
    K.check(await g(() => window.__gw.state.meta.seenTips?.loop_marks === true), 'recorded at once (meta.seenTips.loop_marks)');
    await K.settle(1400);   // (the ink-in is a CSS animation on the wall clock)
    const t1 = await look(K.phone ? 'phone' : 'desktop');
    K.check(t1.caps[0]?.text === TL?.teach?.notches && t1.caps[1]?.text === TL?.teach?.dots, 'the words are TEXT_LOOP.teach\'s', t1.caps.map((x) => x.text));
    await K.shoot('captions');
    await K.scan('the captions');
    if ((K.phone && args.small !== 'none') || (!K.phone && typeof args.small === 'string' && args.small !== 'none')) {
      const [sw, sh] = String(args.small || '358x664').split('x').map(Number);
      K.step(`teach: the same captions at ${sw} × ${sh}`);
      await page.setViewportSize({ width: sw, height: sh });
      await K.steps(3); await K.settle(500); await K.steps(2);
      const tSmall = await g(readTeach);
      if (tSmall.on) { await look(`phone ${sw}`); await K.shoot(`captions-${sw}`); }
      else K.note(`the captions had gone before the ${sw} px look (t ${tSmall.debug?.t})`);
    }

    K.step('teach: held, then gone; the float keeps fishing');
    const t0 = (await g(readTeach)).debug?.t ?? 0;
    await K.secs(Math.max(0.2, 6.3 - t0));
    await K.settle(800);
    const gone = await g(readTeach);
    K.check(!gone.on && gone.debug?.shown === false, 'after about 6 s they have faded and gone', gone.debug);
    K.check(['waiting', 'bite', 'idle', 'lost'].includes(gone.state), 'the fishing ran on under them (a bite never waits on the captions)', gone.state);
    await K.shoot('after');

    K.step('teach: a fish landed; the good bites spent; Murk\'s first quiet-water line');
    await K.until("c.fishing.state === 'idle' || c.fishing.state === 'waiting'", 6);
    if (await g(() => window.__gw.fishing.state === 'idle')) await K.realCatch('dusk_minnow', 0, { what: 'the fish' });
    else {
      await g(() => { const d = window.__gw.debug; d.fishOutcome?.('land'); d.forceBite?.({ speciesId: 'dusk_minnow', z: 0, wait: 0.2 }); });
      K.need((await K.until("c.fishing.state === 'bite'", 4)).ok, 'a bite');
      await g(() => window.__gw.debug.fishStrike?.('struck'));
      K.need((await K.until("c.fishing.state === 'reeling' || c.fishing.state === 'landing'", 3)).ok, 'struck');
      await K.steps(3);
      await g(() => window.__gw.debug.fishPlayTo?.(0.97));
    }
    await K.toCard('the fish');
    await g(() => { const c = window.__gw, b = c.fishing.bobberPos || c.player?.position || { x: 0, z: 0 }, L = c.progression.loop;
      const keys = new Set(Object.keys(c.state.run.bites || {}));
      try { const k = c.fishing.waterAt?.({ x: b.x, z: b.z })?.waterKey; if (k) keys.add(k); } catch { /* ignore */ }
      for (const k of keys) for (let i = 0; i < 40; i++) L.noteBite({ waterKey: k, reason: 'spooked' }); });
    await castNow('the cast on quiet water');
    const quiet = await K.until(`[...document.querySelectorAll('.gw-toast--murk')].some((e) => e.textContent.includes(${JSON.stringify(TL?.murk?.firstQuiet || '')}))`, 4);
    const fav = await g(() => ({ left: window.__gw.fishing.view?.favour?.bitesLeft ?? null, dim: !!document.querySelector('.gw-fav-dots.gw-dim') }));
    K.check(fav.left === 0, 'the dots have run out (bitesLeft 0)', fav);
    K.check(quiet.ok, `Murk's first quiet-water line on the water ("${TL?.murk?.firstQuiet}")`, quiet);
    K.check(!(await g(readTeach)).on, 'no caption of ours over it (the quiet water is Murk\'s)');
    await K.settle(500);
    await K.shoot('quiet');

    K.step('teach: a reload, Continue, a cast: never again');
    await K.reload();
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL?.continue), 'the title\'s Continue');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 15)).ok, 'back on the water');
    K.check(await g(() => window.__gw.state.meta.seenTips?.loop_marks === true), 'the record survived the reload');
    await K.secs(1);
    await castNow('the cast after the reload');
    await K.secs(2.5);
    K.check(!(await g(readTeach)).on, 'the settled float after a reload: no captions');
    await K.noErrors('the teaching moment');
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${String(e?.stack || e).split('\n').slice(0, 4).join(' | ')}`); log('THREW', String(e?.stack || e)); }
  }
  try { await K.release(); } catch { /* ignore */ }
  const out = { size: K.tag, failures: K.failures, notes: K.notes };
  log(`LOOP_TEACH ${JSON.stringify(out)}`);
  return K.failures;
}
