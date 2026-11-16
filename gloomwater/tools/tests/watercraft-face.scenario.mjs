// WC-3 (docs/loop/WATERCRAFT.md §9.4's browser gate): one short look at the water's face and the lost fish on the Mossmere under the
// loop. A trip from the step-2 save with every place owned and lifted: the Bell Pool's rim, the inflow's seam and gravel fan, the
// outflow's threads and the wind lane at dusk (and the lane on the next evening), the reed beds and the lily beds with a stems nudge,
// a forced Trophy loss (a scan of the page's text after it), a giant lost at its place and the Matriarch lost, the Chart after them,
// the gear log's Who bites on worms, and a night frame for the hue report.
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-wc3/dev.html --shots=tools/out/mvp-wc3/look --script=tools/tests/watercraft-face.scenario.mjs --width=960 --height=540
//   (and --mobile). Prints `WC3_LOOK {size, failures, notes}`.
import { Abort } from './loop-1a.scenario.mjs';
import { makeKit3a, seededSave, PLACE_IDS } from './loop-3a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'wc3' });
  const cam = (pos, look, fov = 50) => K.places.camera({ pos, look, fov });
  const settle = async (s = 0.6) => { await K.secs(s); await K.settle(250); };
  try {
    K.step('boot: the step-2 save, every place owned and lifted, worms in the bag');
    await K.boot(seededSave({ clams: 400, holdSlots: 5, own: PLACE_IDS, lifted: PLACE_IDS, balls: 2, over: { tackle: { rod: 1, line: 1, reel: 1 } } }));
    await g(() => { const m = window.__gw.state.meta; m.loop.bait = { ...(m.loop.bait || {}), mossmere: { ...(m.loop.bait?.mossmere || {}), mireworm: 6 } };
      for (const id of ['dusk_minnow', 'mossback_perch', 'reedjaw_pike', 'weeping_carp']) m.journal[id] = { ...(m.journal[id] || {}), caught: 1, biggest: 0, firstDay: 1, firstRun: 1 }; });
    await K.toJetty();
    await K.sail(null);
    const face = await g(() => { const c = window.__gw, U = c.water.material.uniforms; return { wc: U.uWc?.value ?? null, define: c.water.material.defines.GW_WC ?? null, stems: !!c.world.stems, evening: c.state.run.evening }; });
    K.check(face.define === 1 && face.wc === 1 && face.stems, 'the face is on: GW_WC, uWc 1, world.stems', face);

    K.step('dusk: the Bell Pool\'s rim, the inflow\'s seam and fan, the outflow, the wind lane');
    await K.places.light('dusk', 0.45);
    await K.places.pose(10, 2, 0);
    await settle(1.2);
    await cam([12, 11, 2], [-4, 0, -14], 52); await settle(0.8);
    await K.shoot('rim-dusk');
    await cam([39, 5.5, 10], [52, 0, 3.5], 50); await settle(0.8);
    await K.shoot('seam-fan-dusk');
    await cam([10, 9, -33], [0, 0, -47], 52); await settle(0.8);
    await K.shoot('outflow-dusk');
    const lane1 = await g(() => { const v = window.__gw.water.material.uniforms.uLane.value; return { x: v.x, z: v.y, h: v.z, k: v.w }; });
    const lanePose = (L) => { const px = -Math.sin(L.h), pz = Math.cos(L.h); return { pos: [L.x + px * 16 - Math.cos(L.h) * 10, 10, L.z + pz * 16 - Math.sin(L.h) * 10], look: [L.x, 0, L.z] }; };
    K.check(lane1.k > 0.3, 'the lane fades in at dusk', lane1);
    { const p = lanePose(lane1); await cam(p.pos, p.look, 58); await settle(0.8); await K.shoot(`lane-dusk-e${face.evening}`); }
    await g(() => { window.__gw.state.run.evening += 1; });
    await settle(3);
    const lane2 = await g(() => { const v = window.__gw.water.material.uniforms.uLane.value; return { x: v.x, z: v.y, h: v.z, k: v.w }; });
    K.check(Math.hypot(lane2.x - lane1.x, lane2.z - lane1.z) > 0.5 || Math.abs(lane2.h - lane1.h) > 0.05, 'the next evening the lane lies elsewhere', { lane1, lane2 });
    { const p = lanePose(lane2); await cam(p.pos, p.look, 58); await settle(0.8); await K.shoot(`lane-dusk-e${face.evening + 1}`); }
    await g(() => { window.__gw.state.run.evening -= 1; });

    K.step('the heron: it stands at a margin or reed spot, and lifts as the raft comes');
    const her0 = await g(() => window.__gw.debug.heron?.() ?? null);
    K.check(her0 && her0.spots > 0 && ['stand', 'stab'].includes(her0.mode), 'the heron stands at a spot at dusk', her0);
    if (her0) {
      const hx = her0.x, hz = her0.z, d = Math.hypot(hx, hz) || 1, ux = -hx / d, uz = -hz / d;
      await K.places.pose(hx + ux * 14, hz + uz * 14, 0); await settle(0.4);
      await cam([hx + ux * 4.5 + uz * 1.5, 1.6, hz + uz * 4.5 - ux * 1.5], [hx, 0.6, hz], 40); await settle(0.5);
      await K.shoot('heron-stands');
      await K.places.pose(hx + ux * 5, hz + uz * 5, 0); await settle(1.2);
      const her1 = await g(() => window.__gw.debug.heron?.() ?? null);
      K.check(her1 && her1.lifts >= 1, 'the raft within 8 m: it lifts off', her1);
      await cam([hx + ux * 9, 3.5, hz + uz * 9], [hx, 2.5, hz], 55); await K.steps(4);
      await K.shoot('heron-lifts');
    }
    await K.places.camera(null);

    K.step('the reed beds and the lily beds; a stems nudge');
    await cam([-24, 6, 26], [-30, 0, 15], 50); await settle(0.6);
    await K.shoot('reeds-mossbell');
    await cam([-14, 5, 40], [-25, 0, 34], 50); await settle(0.4);
    const nudged = await g(() => { const s = window.__gw.world.stems; s.nudge(-25.5, 34.5, 1.6); s.nudge(-29.5, 20.5, 1.6); return s.points().filter((p) => p.k > 0).length; });
    K.check(nudged === 2, 'world.stems.nudge takes the points', nudged);
    await K.steps(3);
    await K.shoot('stems-twitch');
    await settle(0.5);
    await cam([-44, 6, 36], [-36, 0, 48], 54); await settle(0.4);
    await K.shoot('reeds-shore');
    await K.places.camera(null);

    K.step('a forced Trophy loss: a slack line, a splash, the sting; the page names nothing');
    await K.places.light('dusk', 0.6);
    await K.places.pose(4, 20, 0); await settle(1);
    const ev0 = await K.evCount();
    await g(() => { const c = window.__gw; c.debug.fishOutcome('lose', 'thrown'); c.debug.fishHook('reedjaw_pike', { z: 2.2 }); });
    await K.secs(1.4);   // (the forced hook's strike burst plays out first: a debug hook has no float on screen, so it bursts mid-frame)
    await g(() => window.__gw.debug.fishPlayTo(0.97));
    const lost = await K.until("c.fishing.state === 'lost'", 25);
    K.check(lost.ok, 'the play ends in the loss', lost);
    await K.steps(4);
    await K.shoot('trophy-lost');
    const gone = await K.until("c.fishing.state === 'idle'", 12);
    K.check(gone.ok, 'the line comes in', gone);
    await K.steps(6); await K.settle(300);
    const evs = (await K.events(ev0)).map((e) => e.e);
    K.check(evs.includes('fish:escaped'), 'fish:escaped kept on the bus', evs.slice(-12));
    const scan = await g(() => {
      const c = window.__gw, names = Object.values(c.data.SPECIES_BY_ID || {}).map((s) => s?.name).filter(Boolean);
      const vis = (e) => { const r = e.getBoundingClientRect?.(); const st = getComputedStyle(e); return r && r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' && +st.opacity > 0.02; };
      const els = [...document.querySelectorAll('body *')].filter((e) => !['SCRIPT', 'STYLE'].includes(e.tagName) && vis(e));
      const text = els.map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ') + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.title || '')).join(' | ');
      const hits = names.filter((n) => text.includes(n));
      const cls = ['Small', 'Keeper', 'Prize', 'Trophy', 'Elder', 'Ancient'].filter((w) => new RegExp(`\\b${w}\\b`).test(text));
      const wt = /\d\s?(lb|oz)\b/.test(text);
      const note = !!document.querySelector('.gw-gotaway.gw-on, .gw-away.gw-on');
      return { hits, cls, wt, note, len: text.length };
    });
    K.check(!scan.hits.length && !scan.cls.length && !scan.wt && !scan.note, 'after the loss the page names no species, no class and no weight; no got-away note', scan);

    K.step('a giant lost at its place and the Matriarch lost: marked and wounded silently; the Chart draws neither');
    await g(() => { const c = window.__gw;
      c.bus.emit('fish:escaped', { speciesId: 'thousandcast_pike', sizeClass: 'keeper', z: 0.4, approxLength: 80, reason: 'thrown', place: 'under_the_span', markedFish: true, zone: 'mossmere' });
      c.bus.emit('fish:escaped', { speciesId: 'belled_matriarch', sizeClass: null, z: 0, approxLength: 140, reason: 'thrown', place: 'bell_pool', legendary: true, zone: 'mossmere' }); });
    await K.steps(4);
    const saved = await g(() => { const m = window.__gw.state.meta; return { marked: m.loop.giants?.thousandcast_pike?.marked ?? 0, wounds: m.legendWounds?.belled_matriarch ?? 0, seen: Object.entries(m.journal).filter(([, e]) => e?.seen || e?.gotAway).map(([k]) => k), note: !!document.querySelector('.gw-gotaway.gw-on, .gw-away.gw-on') }; });
    K.check(saved.marked === 1 && saved.wounds >= 1 && !saved.seen.length && !saved.note, 'the giant marked and the legend wounded in the save; no Journal line, no note', saved);
    await K.toHomeVia({ tally: false });
    await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); } catch { /* optional */ } c.ui.loop.openChart(); });
    await settle(1.5); await K.settle(1200);
    await K.shoot('chart-after-losses');
    await g(() => window.__gw.ui.closeAll?.()); await K.steps(2);

    K.step('the gear log: Who bites on worms');
    await g(() => { const c = window.__gw; c.ui.loop.openJetty?.(); });
    await settle(0.4);
    await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); } catch { /* optional */ } c.ui.openTackle?.() ?? c.ui.screens?.openTackle?.(); });
    await settle(0.5);
    let wb = await g(() => !!document.querySelector('[data-loop=whobites]'));
    if (!wb) {
      K.need(await K.tap('[data-modal=jetty] [data-tile=murk]'), 'the shelf');
      await settle(0.4);
      await g(() => document.querySelector('.gw-shelf-odds')?.scrollIntoView({ block: 'center' }));
      await K.tap('.gw-shelf-odds'); await settle(0.6);
      wb = await g(() => !!document.querySelector('[data-loop=whobites]'));
    }
    const worms = await g(() => { const row = [...document.querySelectorAll('.gw-gear-row')].find((r) => /Mire Worms/.test(r.textContent)); if (!row) return null; row.scrollIntoView({ block: 'center' });
      const t = row.querySelector('[data-loop=whobites]'); return t ? { pike: t.querySelector('[data-fish=reedjaw_pike]')?.textContent || null, text: t.textContent, hold: row.querySelector('.gw-item-hold')?.textContent } : { hold: row.querySelector('.gw-item-hold')?.textContent }; });
    K.check(wb && worms?.pike && /<1%/.test(worms.pike), 'the gear log\'s Who bites shows the Reedjaw Pike "<1%" on worms', worms);
    const metChk = await g(() => { const c = window.__gw, J = c.state.meta.journal || {}, t = document.querySelector('.gw-gear-row [data-loop=whobites]');
      const rows = t ? [...t.querySelectorAll('[data-fish]')].map((r) => r.dataset.fish) : [];
      const unmetNames = Object.values(c.data.SPECIES_BY_ID || {}).filter((sp) => sp && !J[sp.id] && t && t.textContent.includes(sp.name)).map((sp) => sp.name);
      return { rows, notMet: rows.filter((id) => !J[id]), unmetNames, more: t?.querySelector('.gw-wb-more')?.textContent || '' }; });
    K.check(metChk.rows.length > 0 && !metChk.notMet.length && !metChk.unmetNames.length, 'Who bites names only fish in the Journal; the rest counted', metChk);
    K.check(worms && /Hold on the fish it suits \(\d+ you have met\)\./.test(worms.hold || ''), 'the Hold line counts, never names', worms?.hold);
    await settle(0.3);
    await K.shoot('gear-log-who-bites');
    await g(() => window.__gw.ui.closeAll?.()); await K.steps(2);

    K.step('night on the water: the hue report\'s frame');
    await K.sail(null);
    await K.places.light('gloomtide', 0.5);
    await K.places.pose(2, 16, 0); await settle(1.5);
    await g(() => { const c = window.__gw; try { c.debug.sign?.('strike', { x: 1, z: 6 }); c.debug.sign?.('rise', { x: -3, z: 7 }); } catch { /* optional */ } });
    await K.steps(10);
    await K.shoot('night-water');
    const glow = await g(() => window.__gw.water.glowtide);
    K.note('the Glowtide at night', glow);
  } catch (e) {
    if (!(e instanceof Abort)) { K.check(false, `scenario threw: ${e?.message || e}`); log(String(e?.stack || e)); }
  }
  const out = { size: K.tag, failures: K.failures, notes: K.notes };
  log('WC3_LOOK', JSON.stringify(out));
  return out;
}
