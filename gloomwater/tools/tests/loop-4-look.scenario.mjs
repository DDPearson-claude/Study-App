// M1 step 4 (lane 4): a short look at what loop-4.scenario.mjs walks past: the Matriarch on her catfish plan up close (3D) and in the
// Mossmere's catalogue (2D, caught: her ink drawing), the Gloam Eel's card there with its Lumen Moss glyph, and the gear log at the
// shelf's Odds › with the lures and tins. Desktop; frames only, a few checks.
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-4/dev.html --shots=tools/out/mvp-4/look --script=tools/tests/loop-4-look.scenario.mjs --width=960 --height=540
// Prints `LOOP_4_LOOK {size, failures, notes}`.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: '4look' });
  try {
    K.step('4 look: a save with the Matriarch and the Gloam Eel landed, the lures owned');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => window.__gw.game.beginIntro({ character: 'wick' }));
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => {
      const c = window.__gw, m = c.state.meta, L = m.loop;
      c.debug.loop.tutorial('done');
      for (const id of ['belled_matriarch', 'gloam_eel', 'dusk_minnow']) m.journal[id] = { ...(m.journal[id] || {}), caught: 1, biggest: 0, firstDay: 1, firstRun: 1, pbLength: id === 'belled_matriarch' ? 262 : 70 };
      L.lures = ['bent_spoon', 'feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner'];
      L.bait.mossmere = { ...(L.bait.mossmere || {}), lumen_moss: 10, mireworm: 10 };
      L.fitted = { lure: 'bell_spinner', bait: 'lumen_moss' };
      c.game.save();
    });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'home');
    await K.secs(1.6); await K.settle(300);

    K.step('4 look: the catalogue');
    K.need(await K.tap('[data-modal=jetty] [data-tile=journal]'), 'the Journal target');
    await K.settle(800); await K.steps(4);
    await K.shoot('catalogue-top');
    const eel = await g(() => { const el = document.querySelector('[data-species=gloam_eel]'); el?.scrollIntoView({ block: 'center' }); return el ? el.innerHTML.length : 0; });
    await K.settle(300);
    K.check(eel > 0, 'the catalogue holds the Gloam Eel\'s card');
    await K.shoot('catalogue-eel');
    await g(() => document.querySelector('[data-species=belled_matriarch]')?.scrollIntoView({ block: 'center' }));
    await K.settle(300);
    await K.shoot('catalogue-matriarch');
    await K.key('Escape'); await K.settle(300);
    await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    await K.settle(300);

    K.step('4 look: the gear log at the shelf');
    K.need(await K.tap('[data-modal=jetty] [data-tile=murk]'), 'the shelf');
    await K.settle(400);
    await K.tap('[data-loop=shelf] [role=tab]', await g(() => window.__gw.data.TEXT_LOOP.odds)); await K.settle(700);   // (Murk's catalogue: the gear log's page, the book's last)
    await K.settle(300);
    const odds = await K.tap('.gw-shelf-odds');
    K.check(!!odds, 'the Tackle tab\'s Odds › opens the gear log');
    await K.settle(500); await K.steps(2);
    const rows = await g(() => [...document.querySelectorAll('.gw-gear-row .gw-item-name')].map((e) => e.textContent.trim()));
    K.check(rows.some((t) => /Harbour-Bell Spinner/.test(t)) && rows.some((t) => /Lumen Moss/.test(t)), 'the gear log lists the lures and the tins', rows);
    await K.shoot('gear-log');
    await g(() => window.__gw.ui.closeAll?.());
    await K.settle(300);

    K.step('4 look: the Matriarch up close (her catfish plan)');
    const placed = await g(() => {
      const c = window.__gw, p = c.player.position, f = c.models?.createFish?.('belled_matriarch', { lengthCm: 262 });
      if (!f?.object3d) return false;
      f.object3d.position.set(p.x + 3.2, 0.9, p.z + 1.0); f.object3d.rotation.set(0, 0.5, 0); f.object3d.name = 'lookMatriarch';
      c.render.scene.add(f.object3d);
      c.render.setIntroCamera({ pos: [p.x + 3.4, 2.1, p.z + 5.6], look: [p.x + 3.2, 0.9, p.z + 1.0], fov: 46, w: 1 });
      return true;
    });
    K.check(placed, 'the catfish model builds');
    await K.secs(0.5);
    await K.shoot('matriarch-close');
    await g(() => { const c = window.__gw, p = c.player.position; c.render.setIntroCamera({ pos: [p.x + 5.6, 1.6, p.z + 1.4], look: [p.x + 3.2, 0.95, p.z + 1.0], fov: 40, w: 1 }); });
    await K.secs(0.4);
    await K.shoot('matriarch-head');
    await g(() => { const c = window.__gw; const o = c.render.scene.getObjectByName('lookMatriarch'); if (o) c.render.scene.remove(o); c.render.setIntroCamera(null); });
    await K.noErrors('the look');
  } catch (e) {
    if (e instanceof Abort) K.note('the look stopped', e.message);
    else K.check(false, 'the look threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_4_LOOK', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
