// M1 step 5a, the home barge in the browser (docs/loop/M1.md §4 step 5a's gate; §2.6, §2.12, SPEC §6.1, §6.5): a loop dev build
// from a fresh save (no film), desktop and --mobile.
//
//   node build.mjs --dev --out=tools/out/m1-s5a/dev.html
//   node tools/playtest.mjs --html=tools/out/m1-s5a/dev.html --shots=tools/out/m1-s5a/scenario/desktop --script=tools/tests/loop-5a.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/m1-s5a/dev.html --shots=tools/out/m1-s5a/scenario/phone --script=tools/tests/loop-5a.scenario.mjs --mobile
//   options: --noshots   --quality=low|medium|high
//
// THE WALK. Start (no film) → home at the barge: the home camera, the raft tied at the stern (docks[0]), Murk moored at his slot
// (his lamp's PointLight at 0), the barge shown at its mooring; the targets [data-tile=murk|chart|journal] and, from wing I, the
// doorway [data-tile=wall]: each a button over its object, ≥ 44 px, none overlapping, each opening its screen (the shelf, the Chart,
// the Journal, the Journal from the doorway) and Escape (or the screen's close) coming back home; presses elsewhere at home (on
// the Jetty's sheet and, with no screen up, on the canvas) never reach fishing.onPointerDown; Sail unties the raft from the stern
// and glides out on the built path, clear of the hulls; on the trip Murk stays moored (lamp dark, no turning), no merchant:arrive
// and no Trade pill; from open water at night the barge is at its mooring, lit (the windows, the stove), no PointLight of its
// own; Home: the sail home's glide ends at the stern, the camera eases into the home framing; a reload at home lands at the
// mooring. Time runs on loop-1a's synthetic clock (the driver holds the page's frames), never the wall clock.
// Prints `LOOP_5A {size, failures, notes}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: '5a' });
  const near = (a, b) => (a && b ? Math.hypot(a[0] - b.x, a[1] - b.z) : Infinity);
  /** What the page knows of home: the barge, Murk, the camera, the raft, the mooring, the targets' buttons. */
  const homeState = () => g(() => {
    const c = window.__gw, T = window.__lp, M = c.world.getMooring?.(), h = c.actors.home, m = c.actors.merchant;
    const btns = [...document.querySelectorAll('[data-modal=jetty] .gw-jetty-target')].filter(T.visible).map((b) => {
      const r = b.getBoundingClientRect();
      return { id: b.dataset.tile, l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, word: (b.querySelector('b')?.textContent || '').trim(), label: b.getAttribute('aria-label') || null, cue: b.classList.contains('gw-cue') };
    });
    let lights = 0, homeLights = 0;
    c.render.scene.traverse((o) => { if (o.isPointLight && o.intensity > 0) { lights++; let p = o; while (p) { if (p === h?.object3d) homeLights++; p = p.parent; } } });
    const p = c.player.position;
    return {
      flow: c.flow, mode: c.render.getCameraMode(), homeW: c.debug.camera?.()?.homeW ?? null, raft: [p.x, p.z],
      mooring: M ? { raft: M.raft, hull: M.hull, murk: M.murk } : null,
      barge: h ? { visible: h.object3d.visible, x: h.object3d.position.x, z: h.object3d.position.z, levels: h.levels, water: h.waterLight.intensity } : null,
      murk: { mode: m.mode, lampLit: m.lampLit, light: c.actors.merchantLight.intensity, x: m.position.x, z: m.position.z },
      lights, homeLights, btns, modal: c.debug.ui().openModal, stack: (c.debug.ui().stack || []).slice(),
      trade: [...document.querySelectorAll('.gw-pill')].filter((e) => T.visible(e) && /trade/i.test(e.textContent)).length,
    };
  });
  const overlaps = (bs) => { const o = []; for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i], b = bs[j]; if (Math.min(a.r, b.r) - Math.max(a.l, b.l) > 0.5 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 0.5) o.push(`${a.id}/${b.id}`); } return o; };
  const top = async () => (await K.state()).modal;

  try {
    // ------------------------------------------------------------------ home at the barge
    K.step('5a: a fresh save, Start with no film');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    // the tutorial done (its own tests are loop-1a's), wing I of the Long Wall owned (the doorway's target), the Jetty again
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.state.meta.loop.home.wall = 1; c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    await K.secs(1.6);
    await K.settle(400);
    let s = await homeState();
    K.check(s.mooring && near(s.raft, s.mooring.raft) <= 0.6, 'the raft tied at the stern (the mooring\'s tie-up, docks[0])', { raft: s.raft, tie: s.mooring?.raft });
    K.check(s.mode === 'home' && s.homeW >= 0.99, 'the home camera: render mode \'home\', fully in after its ease', { mode: s.mode, w: s.homeW });
    K.check(s.barge?.visible && Math.hypot(s.barge.x - s.mooring.hull.x, s.barge.z - s.mooring.hull.z) < 0.01, 'the Slow Hearth at its mooring, shown', s.barge);
    K.check(s.murk.mode === 'moored' && s.murk.lampLit === 0 && s.murk.light === 0 && Math.hypot(s.murk.x - s.mooring.murk.x, s.murk.z - s.mooring.murk.z) < 0.01, 'Murk moored at his slot, his lamp\'s PointLight at 0', s.murk);
    K.check(s.homeLights === 0, 'the barge carries no PointLight', s.homeLights);
    // (SHEET.md §2.3: the rod rack, target `rack`, opens the Wick's sheet at Tackle, after `journal` and before `wall`; ui-loop's homeTargetIds)
    const want = ['murk', 'chart', 'journal', 'rack', 'wall'];
    K.check(JSON.stringify(s.btns.map((b) => b.id)) === JSON.stringify(want), 'the targets in the tiles\' order: Murk, Chart, Journal, the rod rack (SHEET.md §2.3), then the doorway (wing I)', s.btns.map((b) => b.id));
    K.check(s.btns.every((b) => b.w >= 43.5 && b.h >= 43.5), 'every target at least 44 px each way', s.btns.map((b) => [b.id, Math.round(b.w), Math.round(b.h)]));
    K.check(overlaps(s.btns).length === 0, 'no two targets overlap', overlaps(s.btns));
    const vw = await g(() => [innerWidth, innerHeight]);
    K.check(s.btns.every((b) => b.l >= -0.5 && b.t >= -0.5 && b.r <= vw[0] + 0.5 && b.b <= vw[1] + 0.5), 'every target inside the screen', vw);
    const T = await g(() => window.__gw.data.TEXT_LOOP.jetty);
    // the rack's accessible name: TEXT_LOOP.sheet.title with the Wick's name ("{name}'s Sheet", SHEET.md §6)
    const sheetName = await g(() => { const d = window.__gw.data, id = d.loopWickId?.(window.__gw.progression.loop.wick?.()) || 'wick'; const n = (d.CHARACTERS || []).find((c) => c.id === id)?.name || ''; return String(d.TEXT_LOOP.sheet?.title || '').replace('{name}', n); });
    const nameOf = { wall: T.wall, rack: sheetName };
    K.check(s.btns.filter((b) => !nameOf[b.id]).every((b) => b.word === T[b.id]) && ['wall', 'rack'].every((id) => s.btns.find((b) => b.id === id)?.word === '' && s.btns.find((b) => b.id === id)?.label === nameOf[id]),
      'each target carries its tile\'s word (Murk, Chart, Journal); the rod rack and the doorway none, their accessible names only', s.btns.map((b) => [b.id, b.word, b.label]));
    // int-C's word layout (CONTRACT, home-targets.js): the word-less rack and doorway get no word box and no hooks; the words drawn stay
    // 16 px from each other and from the word-less targets' buttons by 8 px (layoutTargets' gap and boxGap)
    const wl = await g(() => [...document.querySelectorAll('[data-modal=jetty] .gw-jetty-target')].filter(window.__lp.visible).map((b) => {
      const w = b.querySelector('.gw-jetty-tword'), r = w ? w.getBoundingClientRect() : null, br = b.getBoundingClientRect();
      return { id: b.dataset.tile, word: r && r.width > 0 ? { l: r.left, t: r.top, r: r.right, b: r.bottom } : null, slot: !!w, box: { l: br.left, t: br.top, r: br.right, b: br.bottom } };
    }));
    const apart = (a, b) => Math.max(a.l - b.r, b.l - a.r, a.t - b.b, b.t - a.b);
    const wordFaults = [];
    for (const a of wl) {
      if (['rack', 'wall'].includes(a.id) && a.slot) wordFaults.push(`${a.id} has a word slot`);
      if (!a.word) continue;
      for (const b of wl) {
        if (b === a) continue;
        if (b.word && b.id > a.id && apart(a.word, b.word) < 16 - 0.5) wordFaults.push(`${a.id}/${b.id} words ${apart(a.word, b.word).toFixed(1)} px apart`);
        if (!b.word && apart(a.word, b.box) < 8 - 0.5) wordFaults.push(`${a.id}'s word ${apart(a.word, b.box).toFixed(1)} px from ${b.id}'s button`);
      }
    }
    K.check(wordFaults.length === 0, 'int-C\'s word layout: no word on the rack or the doorway; words 16 px apart and 8 px off the word-less buttons', { faults: wordFaults, wl });
    const tg = await g(() => window.__gw.ui.loop.debug().targets);
    K.check(tg?.ok === true, 'the targets\' layout reports no fault', tg?.faults);
    // each button sits over its own object (its object's box inside the button, or the button grown round it to 44 px)
    const objs = await g(() => {
      const c = window.__gw, out = {};
      const boxes = c.actors.home.targetBoxes();
      for (const [id, b] of Object.entries(boxes)) { const o = c.render.projectToScreen({ x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2, z: (b.min.z + b.max.z) / 2 }); out[id] = [o.x, o.y]; }
      const m = c.actors.merchant.position; const o = c.render.projectToScreen({ x: m.x, y: 1.8, z: m.z }); out.murk = [o.x, o.y];
      return out;
    }).catch(() => ({}));
    K.check(s.btns.every((b) => { const p = objs[b.id]; return p && p[0] >= b.l - 2 && p[0] <= b.r + 2 && p[1] >= b.t - 2 && p[1] <= b.b + 2; }), 'each target sits over its own object on the barge', { objs, btns: s.btns.map((b) => [b.id, Math.round(b.l), Math.round(b.t), Math.round(b.r), Math.round(b.b)]) });
    await K.shoot('home');
    await K.noErrors('home');

    // ------------------------------------------------------------------ each target opens its screen; Escape / close comes home
    K.step('5a: each target opens its screen; Escape and close come home');
    const opens = { murk: 'shelf', chart: 'chart', journal: 'journal', rack: 'journal', wall: 'gallery' };   // (M1 step 5b: the doorway opens the cabin's gallery; the rack the Journal on its sheet, SHEET.md §2.3)
    for (const id of want) {
      const b = await K.tap(`[data-modal=jetty] [data-tile=${id}]`);
      K.need(b, `the ${id} target can be tapped`);
      await K.settle(300); await K.steps(3);
      const m = await top();
      K.check(m === opens[id], `[data-tile=${id}] opens its screen (${opens[id]})`, m);
      if (id === 'rack') K.check(await g(() => !!document.querySelector('[data-modal=journal] .gw-sheet')), '[data-tile=rack] opens the Journal on the Wick\'s sheet');
      if (id === 'chart') await K.shoot('chart-open');
      await K.key('Escape');
      await K.settle(400); await K.steps(3);
      const back = await K.state();
      K.check(back.modal === 'jetty' && back.flow === 'home', `… and Escape comes home (the Jetty over the barge)`, { modal: back.modal, stack: back.stack });
    }
    // the screen's own close (the Journal's ✕ or its Back) comes home too
    await K.tap('[data-modal=jetty] [data-tile=journal]');
    await K.settle(300); await K.steps(2);
    const closed = await g(() => { const T2 = window.__lp, x = T2.one('[data-modal=journal] .gw-x') || T2.one('[data-modal=journal] [data-action=close]') || T2.one('[data-modal=journal] .gw-back'); if (!x) return false; x.click(); return true; });
    await K.settle(400); await K.steps(3);
    if (closed) K.check((await top()) === 'jetty', 'the Journal\'s close comes home');
    else { K.note('no close button on the Journal: Escape only'); await K.key('Escape'); await K.settle(300); }

    // ------------------------------------------------------------------ a press anywhere else at home never casts
    K.step('5a: presses elsewhere at home never reach fishing');
    await g(() => { const f = window.__gw.fishing; window.__lp.casts = 0; const o = f.onPointerDown?.bind(f); f.onPointerDown = (...a) => { window.__lp.casts++; return o?.(...a); }; });
    const pts = await g(() => {
      const out = [], W = innerWidth, H = innerHeight;
      for (const [fx, fy] of [[0.12, 0.55], [0.5, 0.9], [0.85, 0.82], [0.3, 0.3], [0.62, 0.62], [0.08, 0.92]]) {
        const x = W * fx, y = H * fy, el = document.elementFromPoint(x, y);
        if (el && !el.closest('.gw-jetty-target, button, [data-loop=homepause]')) out.push([x, y]);
      }
      return out;
    });
    for (const [x, y] of pts) { await K.tapXY(x, y); await K.steps(4); }
    let st = await K.state();
    K.check(st.modal === 'jetty' && st.flow === 'home', 'presses on the Jetty outside the targets open nothing', { modal: st.modal });
    // with no screen up the press reaches the canvas and main's routing: still nothing for fishing
    await g(() => window.__gw.ui.closeAll?.());
    await K.steps(2);
    for (const [x, y] of pts.slice(0, 3)) { await K.pressHold(x, y, 0.4); await K.steps(4); }
    st = await K.state();
    const casts = await g(() => window.__lp.casts);
    K.check(casts === 0 && st.fishing === 'idle' && st.flow === 'home', 'no press at home reached fishing.onPointerDown (no cast at home, §8 question 5)', { casts, fishing: st.fishing });
    await g(() => window.__gw.ui.loop.openJetty());
    await K.steps(2); await K.settle(300);

    // ------------------------------------------------------------------ Sail: the raft unties from the stern and glides out
    K.step('5a: Sail unties the raft from the stern');
    const e0 = await K.evCount();
    await K.tap('[data-modal=jetty] [data-tile=chart]');
    await K.settle(400); await K.steps(3);
    K.need(await K.tap('[data-action=sail]'), 'the Chart\'s Sail');
    const path = [];
    for (let i = 0; i < 120; i++) {
      const q = await g(() => { const c = window.__gw, p = c.player.position; return { x: p.x, z: p.z, flow: c.flow, mode: c.render.getCameraMode() }; });
      path.push(q);
      if (q.flow === 'playing') break;
      await K.steps(1);
    }
    let ev = await K.events(e0);
    const so = ev.find((e) => e.e === 'player:glide' && e.p?.kind === 'sailOut' && e.p?.state === 'start');
    K.check(so && near(so.raft, s.mooring.raft) <= 0.6, 'the glide out starts at the stern\'s tie-up', so?.raft);
    const circles = await g(() => window.__gw.world.getMooring().circles.filter((c) => c.kind === 'hull'));
    const clear = Math.min(...path.map((q) => Math.min(...circles.map((c) => Math.hypot(q.x - c.x, q.z - c.z) - c.r))));
    K.check(clear >= 1.5, `the glide out stays clear of the hull (closest ${clear.toFixed(2)} m)`, clear);
    const out = await g(() => { const d = window.__gw.data; return d.sailPlan(d.LOOP.tutorial.outPath.mossmere[0], { x: 0, z: 0 }, d.LOOP.tutorial, 'mossmere').to; });
    K.check(path.at(-1).flow === 'playing' && Math.hypot(path.at(-1).x - out.x, path.at(-1).z - out.z) <= 0.6, 'then the trip, from the glide\'s end (step 1\'s path)', { end: path.at(-1), to: out });
    K.check(path.some((q) => q.mode === 'sail'), 'the camera leaves the home framing for the sail framing as the raft unties', [...new Set(path.map((q) => q.mode))]);
    await K.shoot('glide-out');

    // ------------------------------------------------------------------ on the trip: Murk moored, no merchant:arrive, no Trade pill
    K.step('5a: on the trip Murk stays moored');
    await K.secs(6);
    await K.settle(400);
    s = await homeState();
    ev = await K.events(e0);
    K.check(s.murk.mode === 'moored' && s.murk.lampLit === 0 && s.murk.light === 0, 'Murk moored through the trip, his lamp\'s PointLight at 0', s.murk);
    K.check(!ev.some((e) => e.e === 'merchant:arrive'), 'T29 (rev. 9): no merchant:arrive on a trip');
    K.check(s.trade === 0, 'T29 (rev. 9): no Trade pill on a trip', s.trade);
    K.check(s.barge?.visible && s.homeLights === 0, 'the barge stays moored and lit in flow playing, no PointLight', s.barge);
    // from open water at night: the barge at its mooring, lit
    K.step('5a: from open water at night the barge is at its mooring, lit');
    await g(() => { const c = window.__gw; c.debug.setPhase?.('gloomtide'); const i = c.survival.getPhaseInfo?.(); if (i && i.duration > 0) c.state.run.phaseTime = i.duration * 0.4; c.player.teleport({ x: -6, z: 8 }, 0); });
    await K.secs(5);
    s = await homeState();
    K.check(s.barge?.visible && Math.hypot(s.barge.x - s.mooring.hull.x, s.barge.z - s.mooring.hull.z) < 0.01, 'at night the barge lies at its mooring', s.barge);
    K.check(s.barge?.levels?.window >= 0.95 && s.barge?.levels?.door >= 0.95 && s.barge?.water > 0, 'its windows and the stove\'s glow lit, their streak on the water', s.barge);
    K.check(s.homeLights === 0 && s.murk.light === 0, 'emissive only: no PointLight on either barge', { home: s.homeLights, murk: s.murk.light });
    await g(() => window.__gw.render.setIntroCamera({ pos: [-8, 6, 4], look: [18, 1.5, 42], fov: 40, w: 1 }));
    await K.secs(0.4);
    await K.shoot('night-from-water');
    await g(() => window.__gw.render.setIntroCamera(null));
    await K.steps(2);

    // ------------------------------------------------------------------ the sail home ends at the stern
    K.step('5a: the sail home\'s glide ends at the stern');
    const e1 = await K.evCount();
    K.need(await g(() => window.__gw.game.goHome()), 'Home');
    const w = await K.until("c.debug.ui().openModal === 'tally'", 8);
    K.check(w.ok, 'the tally opens as the raft ties up', w);
    ev = await K.events(e1);
    const ge = ev.filter((e) => e.e === 'player:glide' && e.p?.kind === 'home');
    const end = ge.find((e) => e.p?.state === 'end');
    s = await homeState();
    K.check(end && near(end.raft, s.mooring.raft) <= 0.6 && near(s.raft, s.mooring.raft) <= 0.6, 'the sail home\'s glide ends at the stern (the raft\'s tie-up)', { end: end?.raft, raft: s.raft });
    await K.secs(1.4);
    s = await homeState();
    K.check(s.mode === 'home' && s.homeW >= 0.99, 'the camera eased into the home framing (1.2 s)', { mode: s.mode, w: s.homeW });
    await K.shoot('home-tally');
    await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
    await K.until("c.debug.ui().openModal === 'jetty'", 6);

    // ------------------------------------------------------------------ a reload at home lands at the mooring
    K.step('5a: a reload at home lands at the mooring');
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(0.5);
    s = await homeState();
    K.check(near(s.raft, s.mooring.raft) <= 0.6 && s.barge?.visible && s.murk.mode === 'moored', 'after a reload the raft is tied at the stern, the barge and Murk moored', { raft: s.raft, barge: s.barge?.visible, murk: s.murk.mode });
    K.check(s.mode === 'home' && s.homeW >= 0.99, 'the home camera on the cut (no ease after a Continue)', { mode: s.mode, w: s.homeW });
    const saved = await g(() => window.__lp.stored()?.meta?.loop?.barge ?? null);
    K.check(saved && saved.water === 'mossmere' && Array.isArray(saved.towed), 'the save holds meta.loop.barge = {water, towed}', saved);
    await K.shoot('reload-home');
    await K.noErrors('the walk');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});   // (the page's frames back: the runner's closing fps probe needs them)
  log('LOOP_5A', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
