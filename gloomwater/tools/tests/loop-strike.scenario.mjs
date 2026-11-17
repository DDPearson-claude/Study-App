// The strike gauge in the browser (the user's mini-game, 17 November 2026: "a very small mini game the play visually when striking
// with the clean strike being moderately difficult to hit"). A loop dev build from a fresh save: the tutorial done, a trip, a real
// cast; a forced bite shows the gauge beside the float (a frame mid-sweep); a second bite is tapped by the page when the needle is
// inside the gold notch (the input's latency compensation added): Clean, "Hook set" under the float (a frame), the gauge gone.
//
//   node build.mjs --dev --out=tools/out/strike/dev.html
//   node tools/playtest.mjs --html=tools/out/strike/dev.html --shots=tools/out/strike/desk --script=tools/tests/loop-strike.scenario.mjs --width=960 --height=540
// Prints `LOOP_STRIKE {size, failures, notes}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log, width, height } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'strike' });
  const gauge = () => g(() => {
    const el = document.querySelector('.gw-sgauge'), r = el?.getBoundingClientRect();
    return el ? { on: el.classList.contains('gw-on'), l: r.left, t: r.top, r: r.right, b: r.bottom, vw: innerWidth, vh: innerHeight, view: window.__gw.fishing?.view?.strikeGauge || null } : null;
  });
  const bite = async () => {
    await g(() => { const d = window.__gw.debug; d.fishOutcome?.('land'); d.forceBite?.({ speciesId: 'dusk_minnow', z: 0.3, wait: 0.2 }); });
    return (await K.until("c.fishing.state === 'bite'", 6)).ok;
  };
  try {
    K.step('strike: a fresh save, the tutorial done, a trip');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__gw.game.beginIntro({ character: 'stub' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.game.save(); });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(1.2);
    await g(() => window.__gw.debug.loop.sail('mossmere'));
    K.need((await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.loopHome?.gliding?.()", 14)).ok || (await K.until("c.flow === 'playing'", 2)).ok, 'the trip begins');
    await K.secs(3);

    K.step('strike: a real cast, a bite, the gauge mid-sweep');
    const pt = await K.waterPoint();
    await K.pressHold(pt.x, pt.y, 0.5);
    K.need((await K.until("c.fishing.state === 'waiting'", 8)).ok, 'a real cast, the float waiting');
    K.need(await bite(), 'the bite opens');
    await K.settle(120);
    await K.shoot(`gauge-${width}x${height}`);
    const G = await gauge();
    K.check(G && G.on && G.view && G.view.to > G.view.from && G.view.from > 0, 'the gauge shows beside the float, a notch a little after the start', G);
    K.check(G && G.l >= 16 && G.r <= G.vw - 16 && G.t >= 90 && G.b <= G.vh - 150, 'the gauge is on screen, clear of the corners', G);
    // let this bite pass (no tap), then a second one, tapped by the page with the needle in the notch
    K.need((await K.until("c.fishing.state !== 'bite'", 4)).ok, 'the untapped bite passes');
    const gone = await gauge();
    K.check(gone && !gone.on, 'the gauge is gone when the window ends', gone);
    await K.until("c.fishing.state === 'idle'", 6);
    await K.secs(0.5);

    K.step('strike: a tap in the notch is Clean, "Hook set"');
    const pt2 = await K.waterPoint();
    await K.pressHold(pt2.x, pt2.y, 0.5);
    K.need((await K.until("c.fishing.state === 'waiting'", 8)).ok, 'the second cast');
    await g(() => {
      window.__strikeTap = null;
      const f = window.__gw.fishing, comp = window.__gw.data.AUTOFISH.strike.latencyComp.mouse;
      const watch = () => {
        const v = f.view?.strikeGauge;
        if (f.state === 'bite' && v && v.t + comp >= (v.from + v.to) / 2) { window.__strikeTap = { t: v.t, from: v.from, to: v.to }; f.onPointerDown({ input: 'mouse' }); return; }
        if (f.state === 'waiting' || f.state === 'bite') requestAnimationFrame(watch);
      };
      requestAnimationFrame(watch);
    });
    K.need(await bite() || (await K.until("c.fishing.state === 'reeling'", 2)).ok, 'the second bite');
    K.need((await K.until("c.fishing.state === 'reeling'", 4)).ok, 'the tap hooked the fish');
    await K.settle(160);
    await K.shoot(`hookset-${width}x${height}`);
    const hud = await g(() => window.__gw.ui?.hudV3?.debug?.() ?? window.__gw.debug.ui?.().hudV3 ?? null);
    const word = await g(() => document.querySelector('.gw-strike-w')?.textContent || '');
    const grade = await g(() => window.__gw.fishing.view?.strike ?? null);
    const tap = await g(() => window.__strikeTap);
    K.check(grade === 'clean' && word === 'Hook set', `inside the notch: ${grade}, "${word}" under the float`, { grade, word, tap, hud });
    K.check(!(await gauge())?.on, 'the gauge fades the moment the tap lands');
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${String(e?.stack || e).split('\n').slice(0, 3).join(' | ')}`); log('THREW', e); }
  }
  log('LOOP_STRIKE', JSON.stringify({ size: `${width}x${height}`, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
