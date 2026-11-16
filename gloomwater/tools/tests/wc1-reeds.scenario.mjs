// WC-1 in the browser (docs/loop/WATERCRAFT.md §9.2's browser gate): a loop dev build, a trip on the Mossmere at dusk, the raft off a reed
// line round Mossbell Isle, 40 seeded casts (debug.fishSeed) landing at the reed edge with Mire Worms, 40 with the bare hook and 40 with
// Cut Strip: no Reedjaw Pike on worms, none on the bare hook, at least one on Cut Strip. Every cast is checked to land in the reeds
// (debug.fishOdds' area); nothing of the odds is on screen (a scan of the page's text for a percentage). Desktop and --mobile.
//
//   node build.mjs --dev --out=tools/out/mvp-wc1/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-wc1/dev.html --shots=tools/out/mvp-wc1/desktop --script=tools/tests/wc1-reeds.scenario.mjs --width=1280 --height=720
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-wc1/dev.html --shots=tools/out/mvp-wc1/phone --script=tools/tests/wc1-reeds.scenario.mjs --mobile
//
// Prints `WC1 {size, failures, notes, counts}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

const REED = { x: -30, z: 21.5 };   // a reed line round Mossbell Isle (watercraft.test.mjs's authored point)

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'wc1' });
  const counts = {};
  try {
    K.step('wc1: a fresh save, the tutorial done, a trip on the Mossmere');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.game.save(); });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(1.2);
    K.need(await g(() => window.__gw.debug.loop.sail('mossmere')), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.loopHome?.gliding?.()", 12)).ok || (await K.until("c.flow === 'playing'", 2)).ok, 'the trip begins');
    await K.secs(2);
    // dusk, and the raft off the reed line: a forced cast (castMax × 0.55) lands on the reed point the pointer aims at
    const at = await g(([R]) => {
      const c = window.__gw;
      c.debug.setPhase?.('dusk');
      const d = Math.max(6, (c.progression.getStats?.().castMax ?? 16) * 0.55);
      c.player.teleport?.({ x: R.x, z: R.z + d }, 0);
      c.render.snapCamera?.();
      return { d, x: c.player.position.x, z: c.player.position.z, phase: c.survival.getPhaseInfo?.().phase };
    }, [REED]);
    await K.secs(0.6);
    K.check(Math.abs(at.x - REED.x) < 0.3 && Math.abs(at.z - (REED.z + at.d)) < 0.3 && at.phase === 'dusk', 'the raft off the reed line at dusk', at);

    const castOnce = (bait) => g(([R, bait]) => {
      const c = window.__gw, F = c.fishing, r = c.state.run;
      r.bait = { ...(r.bait || {}), ...(bait ? { [bait]: 99 } : {}) }; r.equippedBait = bait;
      const o = c.render.projectToScreen({ x: R.x, y: 0, z: R.z }, {}), W = innerWidth, H = innerHeight;
      c.input.ndc.set((o.x / W) * 2 - 1, -((o.y / H) * 2 - 1));
      c.debug.forceBite({ wait: 2 });
      if (F.state === 'casting') c.debug.forceBite({ wait: 2 });   // (the second call lands the forced cast)
      const odds = c.debug.fishOdds?.(), f = c.debug.fishing();
      const out = { state: F.state, species: f?.species ?? null, area: odds?.area ?? null, bob: F.bobberPos ? { x: +F.bobberPos.x.toFixed(2), z: +F.bobberPos.z.toFixed(2) } : null, bait: f?.castBait ?? r.equippedBait };
      return out;
    }, [REED, bait]);
    const reset = () => g(() => { window.__gw.fishing.cancel('reset'); return window.__lp.step(1, 1 / 30); });

    for (const [label, bait, seed] of [['Mire Worms', 'mireworm', 101], ['the bare hook', null, 102], ['Cut Strip', 'cut_strip', 103]]) {
      K.step(`wc1: 40 casts at the reed edge on ${label}`);
      await g((s) => window.__gw.debug.fishSeed(s), seed);
      const c = { casts: 0, reeds: 0, bites: 0, pike: 0, species: {} };
      for (let i = 0; i < 40; i++) {
        const x = await castOnce(bait);
        c.casts++;
        if (x.area === 'reeds') c.reeds++;
        if (x.state === 'waiting' && x.species) { c.bites++; c.species[x.species] = (c.species[x.species] || 0) + 1; if (x.species === 'reedjaw_pike') c.pike++; }
        if (i === 0) { K.note(`${label}: the first cast`, x); await K.steps(8); await K.settle(250); await K.shoot(`reeds-${bait || 'bare'}`); }
        await reset();
      }
      counts[bait || 'bare'] = c;
      K.check(c.reeds === 40 && c.bites === 40, `${label}: all 40 casts land in the reeds and bite`, c);
      if (bait === 'cut_strip') K.check(c.pike >= 1, `Cut Strip: the Reedjaw Pike comes (${c.pike} in 40)`, c.species);
      else K.check(c.pike === 0, `${label}: no Reedjaw Pike in 40 casts`, c.species);
    }
    // odds stay hidden: nothing on screen carries a percentage during the cast
    K.step('wc1: no odds on screen');
    await castOnce('mireworm'); await K.steps(6); await K.settle(200);
    const pct = await g(() => (document.body.innerText || '').match(/\d\s*%|<1%/g) || []);
    K.check(pct.length === 0, 'no percentage anywhere on the page during a cast', pct);
    await K.shoot('cast-reeds-hud');
    await reset();
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('WC1', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes, counts }));
  return { failures: K.failures };
}
