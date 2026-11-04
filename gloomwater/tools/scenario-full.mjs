// Full-flow integration scenario:  node tools/playtest.mjs --script=tools/scenario-full.mjs
// Exercises: title -> new run -> cast -> bite -> reel (auto) -> catch card -> creel ->
// merchant/shop -> phases through Gloomtide with enemies -> zap/flare -> death -> summary.
export default async function (api) {
  const { page, shot, wait, evalGame, hold, log, width, height } = api;
  const g = (fn, a) => evalGame(fn, a);
  const snapshot = (label) => g((label) => {
    const c = window.__gw; const r = c.state.run;
    return { label, flow: c.flow, fishing: c.fishing?.state, phase: c.survival?.getPhaseInfo?.(), modal: c.debug.ui?.()?.openModal ?? null,
      run: r && { day: r.day, hp: r.hp, oil: Math.round(r.oil), sat: Math.round(r.satiety), shells: r.shells, creel: r.creel?.length, zone: r.zone },
      enemies: c.combat?.enemies?.length, level: r?.level, xp: r?.xp, calls: c.render?.renderer?.info?.render?.calls };
  }, label);

  await shot('f01-title');
  log(JSON.stringify(await snapshot('title')));
  await g(() => window.__gw.game.startNewRun({}));
  await wait(2500);
  await shot('f02-run');
  // sail forward and to the right for a bit
  await page.keyboard.down('KeyW'); await page.keyboard.down('KeyD'); await wait(1500);
  await page.keyboard.up('KeyD'); await page.keyboard.up('KeyW'); await wait(800);
  await shot('f02b-sailed');
  log(JSON.stringify(await g(() => ({ pos: window.__gw.player?.position, heading: window.__gw.player?.heading }))));

  // cast
  await page.mouse.move(width * 0.55, height * 0.6);
  await page.mouse.down(); await wait(650); await page.mouse.up();
  await wait(1800);
  await shot('f03-cast');
  log(JSON.stringify(await snapshot('after-cast')));

  // force a bite and hook it
  await g(() => window.__gw.debug.forceBite?.());
  await wait(250);
  log(JSON.stringify(await snapshot('bite')));
  await shot('f04-bite');
  await page.mouse.down(); await wait(120); await page.mouse.up();
  await wait(200);
  // reel: pulse hold/release reading tension
  for (let i = 0; i < 60; i++) {
    const v = await g(() => ({ s: window.__gw.fishing?.state, t: window.__gw.fishing?.view?.tension ?? 0, surge: window.__gw.fishing?.view?.surge }));
    if (v.s !== 'reeling') break;
    if (i === 8) await shot('f05-reel');
    if (v.t < 0.6 && !v.surge) { await page.mouse.down(); await wait(220); await page.mouse.up(); } else { await wait(220); }
  }
  log(JSON.stringify(await snapshot('after-reel')));
  // ensure a catch for the rest of the scenario
  await g(() => window.__gw.debug.instantCatch?.());
  await wait(1500);
  await shot('f06-catch');
  log(JSON.stringify(await snapshot('catch')));
  // take the first catch-card action button if any
  await g(() => { const b = document.querySelector('#ui [data-action="keep"], #ui [data-action="eat"]'); b?.click(); });
  await wait(600);

  // merchant & shop
  await g(() => { window.__gw.debug.addShells?.(500); window.__gw.debug.giveFish?.(window.__gw.data.SPECIES?.[0]?.id); });
  await g(() => { const c = window.__gw; if (c.progression.canShop?.()) c.ui.openShop?.(); });
  await wait(1200);
  await shot('f07-shop');
  log(JSON.stringify(await snapshot('shop')));
  await g(() => window.__gw.ui.closeAll?.());
  await wait(300);
  await g(() => window.__gw.ui.openJournal?.());
  await wait(800);
  await shot('f08-journal');
  await g(() => window.__gw.ui.closeAll?.());

  // to the Gloomtide
  for (let i = 0; i < 4; i++) {
    const p = await g(() => window.__gw.survival?.getPhaseInfo?.().phase);
    if (p === 'gloomtide') break;
    await g(() => window.__gw.debug.skipPhase?.());
    await wait(500);
  }
  await g(() => { const d = window.__gw.debug; d.spawn?.('wisp'); d.spawn?.('moth'); d.spawn?.('eel'); });
  await wait(3500);
  await shot('f09-gloomtide');
  await g(() => window.__gw.debug.levelUp?.());
  await wait(800);
  await shot('f09b-levelup');
  log(JSON.stringify(await g(() => ({ options: window.__gw.combat?.pendingOptions, modal: window.__gw.debug.ui?.()?.openModal }))));
  await g(() => { const c = window.__gw; const o = c.combat?.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); });
  await wait(500);
  log(JSON.stringify(await snapshot('gloomtide')));
  await g(() => window.__gw.combat?.flare?.());
  await wait(400);
  await shot('f10-flare');

  // death
  await g(() => { const c = window.__gw; c.debug.god?.(false); c.survival.damage?.(99, 'gloom'); });
  await wait(2500);
  await shot('f11-death');
  log(JSON.stringify(await snapshot('death')));
  await g(() => window.__gw.game.toTitle());
  await wait(1200);
  await g(() => window.__gw.ui.openShrine?.());
  await wait(800);
  await shot('f12-shrine');
}
