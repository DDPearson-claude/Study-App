// M1 step 5b (LANE 5B-TOW): the opening at the Landing and the first tow in the browser (docs/loop/OPENING.md §6.2 rev. 5, SPEC §6.5,
// M1.md §2.1, §4 step 5b's gate). A loop dev build from a fresh save, desktop and --mobile, on loop-1a's synthetic clock.
//
//   node build.mjs --dev --out=tools/out/mvp-5bt/dev.html
//   node tools/playtest.mjs --html=tools/out/mvp-5bt/dev.html --shots=tools/out/mvp-5bt/desktop --script=tools/tests/loop-tow.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/mvp-5bt/dev.html --shots=tools/out/mvp-5bt/phone --script=tools/tests/loop-tow.scenario.mjs --mobile
//   options: --only=film,taps,reload   --noshots   --quality=low|medium|high
//
// THE PASSES. `film`: the fresh title (no barge at the Jetty yet) → New Descent → Start → the film, skipped at once → one ink dip →
// the Landing on the Chart (arrive) → the wake (the Wick's mark kindles, Murk's wake line) → the tow's leg up the Sluice Run (the
// barge's save written as it begins) → one ink dip → the glide in to the mooring, the barge shown → the chart beat over the moored
// barge (the Chart at once, its slots and line, Sail) → Sail → the glide out → the first trip; untouched, each part timed on its own
// and the whole opening under 60 s. `taps`: Start with no film; a tap ends the arrive, the wake once its line shows, the leg (the
// sheet inked at once) and the glide in (at the mooring). `reload`: a reload during the leg: Continue lands at the mooring with
// barge.towed written, on the chart beat, and the tow never plays again. Prints `LOOP_TOW {size, failures, notes}`.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'tow' });
  const only = typeof args.only === 'string' ? args.only.split(',') : null;
  const want = (p) => !only || only.includes(p);
  const TOL = 0.12;   // (a part's length on the 1/30 s clock: a frame or two either side)
  /** What the page knows of the tow: its phase and parts, the view, the barge, the save, the raft, the mooring, the modal. */
  const tow = () => g(() => {
    const c = window.__gw, T = window.__lp, M = c.world.getMooring?.(), h = c.actors.home, p = c.player.position;
    const ts = c.debug.loop?.tow?.() || null, vd = c.ui?.loop?.tow?.debug?.() || null, st = T.stored();
    return { phase: ts?.phase ?? null, t: ts?.t ?? null, u: ts?.u ?? null, ink: ts?.ink ?? null, line: ts?.line ?? null, parts: ts?.parts ?? null, marks: ts?.marks ?? [],
      view: vd, barge: h ? { visible: h.object3d.visible, x: +h.object3d.position.x.toFixed(2), z: +h.object3d.position.z.toFixed(2) } : null,
      towed: c.state.meta.loop?.barge?.towed ?? null, savedTowed: st?.meta?.loop?.barge?.towed ?? null, savedStep: st?.meta?.loop?.tutorial ?? null,
      raft: [+p.x.toFixed(2), +p.z.toFixed(2)], moor: M ? { raft: M.raft, hull: M.hull } : null, modal: c.debug.ui().openModal, stack: (c.debug.ui().stack || []).slice(),
      flow: c.flow, mode: c.render.getCameraMode?.() ?? null, sim: +T.sim.toFixed(3), tut: c.ui?.loop?.tutorial?.step ?? null,
      sayLine: (document.querySelector('[data-loop=tow] .gw-murk-line')?.textContent || '').trim() };
  });
  const D = () => g(() => { const d = window.__gw.data; return { T: d.TEXT_LOOP, tow: d.LOOP.tow, hold: d.LOOP.hold, wicks: d.LOOP.wicks }; });
  const tapMid = async () => { await K.tapXY(Math.round(api.width / 2), Math.round(api.height * 0.6)); await K.steps(2); };
  const atMooring = (s) => s.moor && Math.hypot(s.raft[0] - s.moor.raft.x, s.raft[1] - s.moor.raft.z) <= 0.6;
  const markAt = (s, what) => s.marks.find((m) => m.what === what)?.sim ?? null;

  // ================================================================ FILM: the whole opening, untouched
  if (want('film')) {
    try {
      K.step('film: the fresh title');
      await K.load({ fresh: true });
      const d = await D();
      await g(() => { window.__gw.debug.intro?.('auto', true); window.__gw.ui.showTitle(); });
      await K.titleReady();
      await K.release();
      await page.waitForFunction(() => window.__gw.intro?.stage?.ready === true, null, { timeout: 40000, polling: 250 }).catch(() => K.note('the film\'s stage was not prebuilt in 40 s'));
      await K.hold();
      let s = await tow();
      K.check(s.barge && s.barge.visible === false, 'the fresh title: no barge at the Jetty yet (it lies at the Landing until the tow)', s.barge);
      K.check(Array.isArray(s.towed) && s.towed.length === 0, 'a fresh save: barge.towed is empty', s.towed);
      K.step('film: Start, the film skipped');
      K.need(await K.tap('[data-modal=title] .gw-tbtn', d.T.newDescent), 'New Descent');
      await K.settle();
      K.need((await K.until("c.debug.ui().openModal === 'newdescent'", 2)).ok, 'the New Descent panel');
      await K.tap('[data-modal=newdescent] button.gw-char[data-wick=taper]');
      for (let i = 0; i < 12 && !(await g(() => !!window.__lp.one('[data-modal=newdescent] [data-action=start]'))); i++) await K.settle(300);   // (the panel's fade, on the wall clock)
      const st = await g(() => { const c = window.__gw, T = window.__lp; T.ev.length = 0; T.sim = 0; const b = T.one('[data-modal=newdescent] [data-action=start]'); if (!b) return null; b.click(); return { flow: c.flow }; });
      K.need(st && st.flow === 'intro', 'Start plays the film at once', st);
      await g(() => window.__lp.runTo(0.6));
      s = await tow();
      K.check(s.barge.visible === false, 'under the film: no barge at the Jetty', s.barge);
      await g(() => window.__gw.game.skipIntro?.());
      await g(() => window.__lp.runOut());
      K.need((await K.until("c.flow === 'home'", 4)).ok, 'the film hands off: flow home');
      s = await tow();
      K.check(['dipIn', 'dipOut', 'arrive'].includes(s.phase), 'the hand-off is the tow\'s: one ink dip to the Landing', s.phase);
      K.check(!(await K.events()).some((e) => e.e === 'player:glide' && e.p?.kind === 'home'), 'no hand-off glide to the Jetty (from step 5 the Landing)');

      K.step('film: the Landing (arrive)');
      K.need((await K.until("c.debug.loop.tow().phase === 'arrive'", 2)).ok, 'the dip opens on the Landing', await tow());
      await K.settle(600);   // (the bake decodes in idle time)
      await K.steps(3);
      s = await tow();
      K.check(s.modal === 'tow' && s.view?.open === true, 'the Landing on the tow\'s Chart (modal tow)', { modal: s.modal, view: s.view });
      K.check(s.view?.last?.art === true, 'the first sheet\'s bake is drawn', s.view?.last);
      K.check(s.barge.visible === false, 'the 3D barge stays hidden behind the Landing', s.barge);
      const dipIn = markAt(s, 'arrive') - (markAt(s, 'dipIn') ?? 0);
      K.check(Math.abs(dipIn - d.tow.landing.dip) <= TOL, `the film's ink dip ${d.tow.landing.dip} s`, dipIn);
      await K.shoot('landing');
      await K.scan('the Landing', { allow: true });

      K.step('film: the wake');
      K.need((await K.until("c.debug.loop.tow().phase === 'wake'", 3)).ok, 'arrive → the wake', await tow());
      await K.secs(1.2);
      await K.settle(500);
      s = await tow();
      K.check(s.sayLine === d.T.murk.wake, 'Murk\'s wake line over the Landing', s.sayLine);
      K.check(s.tut === 'wake', 'the tutorial machine at the wake (a Landing beat)', s.tut);
      const arr = markAt(s, 'wake') - markAt(s, 'arrive');
      K.check(Math.abs(arr - d.tow.landing.arrive) <= TOL, `arrive ${d.tow.landing.arrive} s untouched`, arr);
      await K.shoot('wake');
      await K.scan('the wake at the Landing');

      K.step('film: the leg');
      K.need((await K.until("c.debug.loop.tow().phase === 'leg'", 9)).ok, 'the wake → the leg', await tow());
      s = await tow();
      K.check(s.towed?.includes('mossmere') && s.savedTowed?.includes('mossmere'), 'the tow\'s begin writes barge.towed and saves it, before it plays', { towed: s.towed, saved: s.savedTowed });
      const wk = markAt(s, 'leg') - markAt(s, 'wake');
      K.check(wk <= 7 + TOL, 'the wake ≤ 7 s', wk);
      await K.secs(2.4);
      await K.shoot('leg-mid');
      await K.secs(1.6);
      await K.shoot('leg-late');
      K.need((await K.until("c.debug.loop.tow().phase === 'dip'", 4)).ok, 'the leg → the dip', await tow());
      s = await tow();
      const lg = markAt(s, 'dip') - markAt(s, 'leg');
      K.check(Math.abs(lg - 5) <= TOL, 'the Sluice Run\'s leg is 5 s (4 s and 0.5 s for the locks and the fall)', lg);
      K.check(s.ink >= 0.99, 'the Mossmere\'s sheet inked in as they arrive', s.ink);

      K.step('film: the dip and the glide in');
      K.need((await K.until("c.debug.loop.tow().phase === 'glide'", 2)).ok, 'the dip → the glide in', await tow());
      s = await tow();
      const dp = markAt(s, 'glide') - markAt(s, 'dip');
      K.check(dp >= 0.6 - TOL && dp <= 0.6 + 0.1 + TOL, 'the dip 0.6 s (held two frames at full ink)', dp);
      K.check(s.barge.visible === true && s.modal !== 'tow', 'in the water: the barge shown, the Chart closed', { barge: s.barge, modal: s.modal });
      await K.secs(1.2);
      await K.shoot('glide-in');
      K.need((await K.until("window.__lp.ev.some((e) => e.e === 'home:enter')", 4)).ok, 'the glide in ends at home:enter');
      s = await tow();
      const he = (await K.events()).find((e) => e.e === 'home:enter');
      const gl = he.sim - markAt(s, 'glide');
      K.check(Math.abs(gl - d.tow.glide) <= TOL + 0.1, `the glide in ${d.tow.glide} s`, gl);
      K.check(atMooring(s), 'the raft tied at the barge\'s stern (the mooring)', { raft: s.raft, moor: s.moor?.raft });
      K.check(s.moor && Math.hypot(s.barge.x - s.moor.hull.x, s.barge.z - s.moor.hull.z) <= 0.3, 'the barge at its mooring', { barge: s.barge, hull: s.moor?.hull });

      K.step('film: the chart beat over the moored barge');
      K.need((await K.until("c.debug.ui().openModal === 'chart'", 3)).ok, 'the Chart opens at once over the moored barge', await tow());
      await K.secs(1.4);
      await K.settle(900);
      const ch = await g(() => { const T = window.__lp, root = T.one('[data-loop=chart]'); const sail = T.one('[data-loop=chart] [data-action=sail]');
        return { water: !!T.one('[data-loop=chart] [data-water=mossmere]'), cells: root ? root.querySelectorAll('.gw-slot').length : 0, sail: sail ? { cue: sail.classList.contains('gw-cue') } : null, text: root ? root.textContent.replace(/\s+/g, ' ') : '' }; });
      const slots = d.hold.start + (d.wicks.taper?.slots || 0);
      K.check(ch.water && ch.cells === slots && ch.sail?.cue === true, `the chart beat: the Mossmere, ${slots} empty slots, Sail cued`, ch);
      K.check(ch.text.includes(d.T.murk.firstChartBy?.taper ?? d.T.murk.firstChart), 'Murk\'s departure line', ch.text.slice(0, 160));
      s = await tow();
      K.check(s.tut === 'chart' && s.barge.visible, 'the tutorial at the chart beat, the barge moored behind it', { tut: s.tut, barge: s.barge });
      await K.shoot('chart-beat');
      await K.scan('the chart beat');

      K.step('film: Sail and the first trip');
      K.need(await K.tap('[data-loop=chart] [data-action=sail]', null, { settle: 0 }), 'Sail');
      await K.secs(1.2);
      await K.shoot('glide-out');
      K.need((await K.until("c.flow === 'playing'", 6)).ok, 'the glide out ends in the first trip', await tow());
      s = await tow();
      const ev = await K.events(), rs = ev.find((e) => e.e === 'run:start');
      K.check(rs && rs.sim < 60, 'the opening reaches the first trip in under 60 s (from Start, untouched but Sail)', rs?.sim);
      log('timeline', JSON.stringify(s.marks.map((m) => [m.what, m.sim])), 'run:start', rs?.sim);
      K.check(s.phase === null && s.barge.visible === true, 'the tow is over; the barge stays moored', { phase: s.phase, barge: s.barge });
      await K.shoot('first-trip');
      await K.noErrors('film');
    } catch (e) {
      if (e instanceof Abort) K.note('the film pass stopped', e.message);
      else K.check(false, 'the film pass threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
    }
  }

  // ================================================================ TAPS: each part ends on a tap
  if (want('taps')) {
    try {
      K.step('taps: Start with no film');
      await K.load({ fresh: true });
      await K.titleReady();
      await g(() => { window.__lp.ev.length = 0; window.__lp.sim = 0; window.__gw.game.beginIntro({ character: 'tallow' }); });
      K.need((await K.until("c.debug.loop.tow().phase === 'arrive'", 3)).ok, 'Start (no film) → the Landing', await tow());
      await K.steps(3);
      await tapMid();
      let s = await tow();
      K.check(s.phase === 'wake', 'a tap ends the arrive', s.phase);
      await K.steps(4);
      await tapMid();
      s = await tow();
      K.check(s.phase === 'leg' && s.towed?.includes('mossmere'), 'a tap once the wake line shows begins the tow (barge.towed written)', { phase: s.phase, towed: s.towed });
      await K.secs(0.8);
      await tapMid();
      s = await tow();
      K.check(s.phase === 'dip' && s.ink >= 0.99 && s.u >= 0.99, 'a tap ends the leg, the sheet inked at once, then the dip', { phase: s.phase, u: s.u, ink: s.ink });
      K.need((await K.until("c.debug.loop.tow().phase === 'glide'", 2)).ok, 'the glide in', await tow());
      await K.secs(0.6);
      await K.shoot('taps-glide');
      await tapMid();
      await K.steps(2);
      s = await tow();
      K.check(s.phase === null && atMooring(s), 'a tap ends the glide in at the mooring', { phase: s.phase, raft: s.raft, moor: s.moor?.raft });
      K.need((await K.until("c.debug.ui().openModal === 'chart'", 3)).ok, 'the chart beat', await tow());
      await K.noErrors('taps');
    } catch (e) {
      if (e instanceof Abort) K.note('the taps pass stopped', e.message);
      else K.check(false, 'the taps pass threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
    }
  }

  // ================================================================ RELOAD: during the leg
  if (want('reload')) {
    try {
      K.step('reload: a reload during the leg');
      await K.load({ fresh: true });
      await K.titleReady();
      await g(() => { window.__gw.game.beginIntro({ character: 'wick' }); });
      K.need((await K.until("c.debug.loop.tow().phase === 'leg'", 12)).ok, 'the leg', await tow());
      await K.secs(1.5);
      await K.reload();
      const d = await D();
      K.need(await K.tap('[data-modal=title] .gw-tbtn', d.T.continue), 'Continue');
      K.need((await K.until("c.debug.ui().openModal === 'chart'", 5)).ok, 'Continue after a reload mid-tow → the chart beat', await tow());
      const s = await tow();
      K.check(s.phase === null && s.towed?.includes('mossmere'), 'the tow does not play again; barge.towed written', { phase: s.phase, towed: s.towed });
      K.check(atMooring(s) && s.barge.visible === true, 'the raft at the mooring, the barge moored', { raft: s.raft, barge: s.barge });
      K.check(s.tut === 'chart', 'the tutorial resumes at the chart beat', s.tut);
      await K.settle(600);
      await K.shoot('reload-chart');
      await K.noErrors('reload');
    } catch (e) {
      if (e instanceof Abort) K.note('the reload pass stopped', e.message);
      else K.check(false, 'the reload pass threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
    }
  }

  await K.release().catch(() => {});
  console.log(`LOOP_TOW ${JSON.stringify({ size: K.tag, failures: K.failures.length, notes: K.notes.length })}`);
  for (const n of K.notes) log('note:', n);
  return { failures: K.failures };
}
