// Veilback Brook, lanes W and C in the browser (docs/loop/LOST-TACKLE.md §5, §9.1's scenario, its brook half): a loop dev build from a
// fresh save, desktop and --mobile. The Veil before (mist behind it, no way through), the Veil Angler's Notebook landed and brought
// home (the tally, the hold on the chart table, Murk's line), the Chart with the brook inked in, the Sail's glide through the Veil, the
// lift, and the brook by day, at dusk and at night from the play camera.
//
//   node build.mjs --dev --out=tools/out/brook/dev.html
//   node tools/playtest.mjs --html=tools/out/brook/dev.html --shots=tools/out/brook/desktop --script=tools/tests/loop-brook.scenario.mjs --width=1280 --height=720
//   node tools/playtest.mjs --html=tools/out/brook/dev.html --shots=tools/out/brook/phone --script=tools/tests/loop-brook.scenario.mjs --mobile --width=820 --height=900
//
// Prints `LOOP_BROOK {size, failures, notes, info}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'brook' });
  const info = {};
  const ID = 'veilback_brook';
  const cam = (pos, look, fov) => g(({ pos, look, fov }) => window.__gw.render.setIntroCamera({ pos, look, fov, w: 1 }), { pos, look, fov });
  const uncam = () => g(() => window.__gw.render.setIntroCamera(null));
  const put = (x, z, yawDeg) => g(([x, z, y]) => { window.__gw.player.teleport({ x, z }, (y * Math.PI) / 180); window.__gw.render.snapCamera?.(); }, [x, z, yawDeg]);
  const phase = (p) => g((ph) => window.__gw.survival.setPhase(ph), p);
  const overlaps = (sel) => g((s) => { const R = [...document.querySelectorAll(s)].map((b) => b.getBoundingClientRect()).filter((r) => r.width > 0);
    const out = []; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], b = R[j]; if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) out.push([i, j]); } return out; }, sel);
  try {
    K.step('brook: a fresh save, home, Sail');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); const L = c.state.meta.loop; L.evenings = Math.max(1, L.evenings); L.holdSlots = 4; c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    await K.secs(1.2); await K.settle(300);
    K.need(await g(() => window.__gw.game.sail({ water: 'mossmere' })), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 12)).ok, 'on the water');

    K.step('brook: the Veil before: mist behind it, no way through');
    const shut = await g(() => { const c = window.__gw, N = c.world.getNotch(), p = { x: 66, z: 4.6 }, q = c.world.collide({ x: 61, z: 4.2 }, 1.6);
      return { n: !!N, open: N?.open, water: c.world.isOpenWater(p.x, p.z, 0.5), stop: q.x * N.ca + q.z * N.sa, r0: N.r0, bank: c.world.places()?.banks?.find((b) => b.id === 'veilback_brook')?.op, yaw: c.world.viewYaw(66, 4.6) }; });
    K.check(shut.n && shut.open === false && shut.water === false && shut.stop < shut.r0 && shut.bank === 1 && shut.yaw === null, 'before the notebook: the cut is shut (no water, the raft stops at the Veil), its mist bank standing', shut);
    await put(52, 9, 0); await K.secs(2.5); await K.settle(250);
    await K.shoot('veil-before-play');
    await cam([46.5, 2.6, 2.4], [62, 3.4, 5.2], 48); await K.secs(0.4);
    await K.shoot('veil-before-close');
    await uncam();
    await put(44, 2, -90); await K.secs(1.5);

    K.step('brook: the Veil Angler\'s Notebook landed and kept');
    await g(() => { window.__fd = { found: [] }; window.__gw.bus.on('fishing:found', (p) => window.__fd.found.push(p)); });
    K.need(await g(() => window.__gw.debug.finds.force('veil_notebook', { wait: 1.2 })), 'debug.finds.force(veil_notebook)');
    K.need((await K.until("c.fishing.state === 'bite'", 6)).ok, 'the snag bites');
    await g(() => { const f = window.__gw.fishing; f.onPointerDown?.({ input: 'mouse' }); f.onPointerUp?.(); });
    K.need((await K.until("c.debug.ui().openModal === 'catch'", 30)).ok, 'the card opens');
    await K.secs(0.5); await K.settle(300);
    K.need(await K.tap('[data-modal=catch] [data-action=keep]'), 'Keep');
    await K.settle(300); await K.secs(0.8);

    K.step('brook: home: the tally, the hold on the chart table, Murk\'s line');
    K.need(await g(() => window.__gw.game.goHome()), 'Home');
    K.need((await K.until("c.debug.ui().openModal === 'tally'", 10)).ok, 'the tally opens');
    await K.secs(9); await K.settle(300);
    await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
    await K.secs(0.95);
    const rev = await g(() => { const L = window.__gw.state.meta.loop; return { revealed: L.places?.revealed, owned: L.maps.places, said: L.said?.brook }; });
    K.check(JSON.stringify(rev.revealed) === '["veilback_brook"]' && rev.owned.includes(ID), 'the notebook showed the brook, and it is owned (free)', rev);
    await K.shoot('reveal-chart-table');
    await K.settle(2600); await K.secs(0.6); await K.settle(300);
    const line = await g(() => document.querySelector('[data-modal=jetty]')?.textContent || '');
    const want = await g(() => window.__gw.data.TEXT_LOOP.murk.brook);
    K.check(line.includes(want), 'as home opens, Murk says his one line', { want, line: line.slice(0, 160) });
    await K.shoot('home-murk-brook');

    K.step('brook: the Chart: the brook inked in on the Mossmere\'s sheet');
    // (the scenario holds the page's frames, so the ink-in is held at a point of its way for each capture: chart('ink', k))
    await g(() => { window.__gw.debug.loop.chart('ink', 0.45); window.__gw.ui.loop.openChart(); });
    await K.settle(650); await K.secs(0.05);
    await K.shoot('chart-ink');
    await g(() => window.__gw.debug.loop.chart('ink', 1)); await K.settle(500); await K.secs(0.05); await K.settle(300);
    const ch = await g(() => ({ place: !!document.querySelector('[data-place=veilback_brook]'), n: document.querySelectorAll('[data-place]').length }));
    K.check(ch.place, 'the Chart: the brook\'s mark, a place to pick', ch);
    const ov = await overlaps('[data-place], [data-action=catalogue], [data-action=sail]');
    K.check(ov.length === 0, 'the Chart\'s targets do not overlap', ov);
    // its name: wholly on the water or the paper (never across the shore's pen), inside the sheet, meeting no other word or target
    const nm = await g(() => { const L = window.__gw.debug.loop.chart('layout'), A = L?.places?.find((p) => p.id === 'veilback_brook'), c = L?.cards?.find((k) => k.waterId === 'mossmere');
      const meet = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
      const others = [...(L?.places || []).filter((p) => p !== A && p.box).map((p) => p.box), ...(L?.targets || []).filter((q) => !q.backdrop && q.place !== 'veilback_brook').map((q) => q.rect)];
      return A && c ? { box: A.box, side: A.side, lead: !!A.lead, inCard: A.box[0] >= c.x && A.box[0] + A.box[2] <= c.x + c.w && A.box[1] >= c.y && A.box[1] + A.box[3] <= c.y + c.h, hits: others.filter((o) => meet(A.box, o)).length } : null; });
    K.check(!!nm && nm.side !== 'cross' && nm.inCard && nm.hits === 0, 'the Chart: the brook\'s name clear of the shore\'s pen, on the sheet, meeting no other word or target', nm);
    await K.shoot('chart-brook');
    await K.scan('the Chart with the brook');
    await g(() => window.__gw.debug.loop.chart('ink', null));

    K.step('brook: the Sail through the Veil');
    K.need(await K.tap('[data-place=veilback_brook]'), 'pick the brook');
    await K.settle(300); await K.secs(0.1);
    K.need(await K.tap('[data-action=sail]'), 'Sail');
    await K.secs(1.4); await K.shoot('glide-1');
    await K.secs(1.4); await K.shoot('glide-veil');
    await K.secs(1.0); await K.shoot('glide-in');
    K.need((await K.until("c.flow === 'playing'", 8)).ok, 'the trip starts in the brook');
    const inb = await g(() => { const c = window.__gw, p = c.player.position, N = c.world.getNotch(); return { along: p.x * N.ca + p.z * N.sa, open: N.open, lifting: c.game.lifting?.() ?? null, yaw: c.render.getYaw(), want: c.world.viewYaw(p.x, p.z) }; });
    K.check(inb.open && inb.along > 66 && inb.lifting === ID, 'on the water in the brook, its mist lifting', inb);
    await K.secs(1.6); await K.shoot('lift');
    await K.secs(4.5);
    const yw = await g(() => { const c = window.__gw, p = c.player.position; return { yaw: c.render.getYaw(), want: c.world.viewYaw(p.x, p.z), bank: c.world.places()?.banks?.find((b) => b.id === 'veilback_brook') }; });
    K.check(yw.want != null && Math.abs(yw.yaw - yw.want) < 0.05 && yw.bank?.lifted, 'the lens looks down the brook; its mist is gone', yw);
    await phase('calm'); await K.secs(2); await K.settle(250);
    await K.shoot('brook-day');
    info.calls = await g(() => window.__gw.render.renderer?.info?.render?.calls ?? null);
    await phase('dusk'); await K.secs(2.5); await K.settle(250);
    await K.shoot('brook-dusk');
    await phase('gloomtide'); await K.secs(2.5); await K.settle(250);
    await K.shoot('brook-night');
    // a cast down the brook: it lands in the brook's own water
    await g(() => { const f = window.__gw.fishing; f.onPointerDown?.({ input: 'mouse' }); });
    await K.secs(0.5); await g(() => window.__gw.fishing.onPointerUp?.()); await K.secs(2.2);
    const cast = await g(() => { const c = window.__gw, b = c.fishing.bobberPos, N = c.world.getNotch(); return { state: c.fishing.state, b: b ? { x: +b.x.toFixed(1), z: +b.z.toFixed(1) } : null, along: b ? b.x * N.ca + b.z * N.sa : null }; });
    K.check(cast.b && cast.along > 62, 'a cast down the brook lands in its water', cast);
    await K.shoot('brook-cast-night');
    // the open mouth from the lake at dusk
    await g(() => window.__gw.fishing.cancel?.('scenario')); await phase('dusk');
    await put(52, 9, 0); await K.secs(3); await K.settle(250);
    await K.shoot('mouth-open-dusk');
    await K.noErrors('the brook');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_BROOK', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes, info }));
  return { failures: K.failures };
}
