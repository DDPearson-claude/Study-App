// The home barge's words take a tap on a 16:10 touch screen (a play-test, 17 Nov 2026, on an 8.8" 2560 × 1600 touch screen at 200%:
// at home after a trip "I pressed Chart and just nothing happens"). CHART's word lies under the raft near the foot of the screen,
// and the goal line's full-width band (.gw-jetty-low) lay over the targets' layer there, so the tap reached the band, not the button.
//
//   node build.mjs --dev --out=tools/out/home-taps/dev.html
//   node tools/playtest.mjs --html=tools/out/home-taps/dev.html --shots=tools/out/home-taps --script=tools/tests/loop-home-taps.scenario.mjs --width=1280 --height=800 --dpr=2 --touch
//   (also --width=1706 --height=1066 --dpr=1.5 --touch, or --mobile for a phone)
//
// THE WALK. A fresh save, Start (no film), home; the tutorial done (so the goal line shows, as after a first trip), the Jetty again.
// For MURK, CHART and JOURNAL: the word and its button wholly inside the view, the point under the word's centre inside its own
// button (document.elementFromPoint), and a touch tap on the word, a touch tap on the button's centre and a mouse click on the word
// each open its screen (the shelf, the Chart, the Journal); Escape comes home. Prints `LOOP_HOME_TAPS {size, failures, notes}`.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'taps' });
  const opens = { murk: 'shelf', chart: 'chart', journal: 'journal' };
  const where = () => g(() => {
    const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const out = { vw: innerWidth, vh: innerHeight, goal: (document.querySelector('[data-modal=jetty] .gw-jetty-goal')?.textContent || '').trim(), t: {} };
    for (const id of ['murk', 'chart', 'journal']) {
      const b = document.querySelector(`[data-modal=jetty] .gw-jetty-target[data-tile=${id}]`);
      if (!b) continue;
      const w = R(b.querySelector('.gw-jetty-tword b')), br = R(b), bh = parseFloat(b.style.getPropertyValue('--box-h'));
      // (the object's part of the button: its top --box-h px; the word's band under it. A word laid under the raft draws no box)
      const box = { ...br, b: Number.isFinite(bh) && bh > 0 ? br.t + bh : br.b };
      const hit = (x, y) => { const e = document.elementFromPoint(x, y); return e?.closest?.('[data-tile]')?.dataset.tile || (e ? String(e.className?.baseVal ?? e.className ?? e.tagName) : null); };
      out.t[id] = { word: w, box, hitWord: w && hit((w.l + w.r) / 2, (w.t + w.b) / 2), hitBox: hit((box.l + box.r) / 2, (box.t + box.b) / 2) };
    }
    return out;
  });
  const home = async () => {
    const m = (await K.state()).modal;
    if (m !== 'jetty') { await K.key('Escape'); await K.settle(400); await K.steps(3); }
    if ((await K.state()).modal !== 'jetty') { await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.ui.loop.openJetty(); }); await K.secs(0.6); await K.settle(300); }
  };
  try {
    K.step('taps: a fresh save, Start with no film, home');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    // the tutorial done: the goal line shows at the foot of the screen, as after the first trip
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    await K.secs(1.6);
    await K.settle(400);
    const s = await where();
    K.check(!!s.goal, 'the goal line shows at home (after the first trip)', s.goal);
    await K.shoot('home');
    for (const id of ['chart', 'journal', 'murk']) {
      const T = s.t[id];
      if (!K.check(!!T?.word, `${id}: its word is drawn`)) continue;
      const ins = (q) => q.l >= -0.5 && q.t >= -0.5 && q.r <= s.vw + 0.5 && q.b <= s.vh + 0.5;
      K.check(ins(T.word) && ins(T.box), `${id}: its word and its button wholly inside the ${s.vw} × ${s.vh} view`, { word: T.word, box: T.box });
      K.check(T.hitWord === id, `${id}: the point under its word's centre is its own button`, T.hitWord);
      K.check(T.hitBox === id, `${id}: the point under its button's centre is its own button`, T.hitBox);
      for (const [how, x, y] of [['a touch tap on the word', (T.word.l + T.word.r) / 2, (T.word.t + T.word.b) / 2], ['a touch tap on the button', (T.box.l + T.box.r) / 2, (T.box.t + T.box.b) / 2], ['a mouse click on the word', (T.word.l + T.word.r) / 2, (T.word.t + T.word.b) / 2]]) {
        if (how.startsWith('a touch')) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y);
        await K.steps(2); await K.settle(300); await K.steps(3);
        const m = (await K.state()).modal;
        K.check(m === opens[id], `${id}: ${how} opens its screen (${opens[id]})`, m);
        if (id === 'chart' && how === 'a touch tap on the word') await K.shoot('chart-open');
        await home();
      }
    }
    await K.noErrors('the taps');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_HOME_TAPS', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
