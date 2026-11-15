// Lane B's smoke of the loop's flow in the browser (slice-1a PLAN §2.2; D's loop-1a scenario is the full proof): a loop page
// (?loop=1, a debug build: no film without the opt-in, so Start goes straight to the Jetty), New Descent's Start → flow home with
// the raft at the first dock (the sail camera, home's dawn look, the hub mood) → Sail → the 3 s glide out → the evening (a trip
// once progression's loop creates one) → Home. Checks no page or ctx error, the flows in order, the camera mode and the glides;
// shoots the Jetty, the glide out and the water. Progression's loop and the screens are other lanes': what they add is read
// where present and skipped where not.
//   node tools/playtest.mjs --html=tools/out/loop-1a/dev.html --shots=tools/out/loop-1a/smoke --script=tools/tests/loop-evening-smoke.scenario.mjs --width=960 --height=540
export default async function (api) {
  const { page, evalGame: g, log, shot } = api;
  const failures = [];
  const check = (c, msg, extra) => { if (c) log('ok  ', msg); else { failures.push(msg + (extra !== undefined ? ` :: ${JSON.stringify(extra)}` : '')); log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : ''); } };
  await page.goto(page.url().split('?')[0] + '?loop=1&debug=1', { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 250 });
  await g(() => { window.__gw.game.wipeAll(); window.__gw.render.setQuality?.('low'); });
  await g(() => { const c = window.__gw, T = (window.__sm = { ev: [] }); for (const e of ['flow:change', 'home:enter', 'zone:change', 'run:start', 'run:end', 'player:glide']) c.bus.on(e, (p) => T.ev.push({ e, flow: p?.flow ?? null, kind: p?.kind ?? null, state: p?.state ?? null, from: p?.from ?? null, sail: p?.sail ?? null })); });
  const t0 = await g(() => ({ loop: window.__gw.data.LOOP_ENABLED, fresh: window.__gw.game.loopFresh(), atHome: window.__gw.game.atHome() }));
  check(t0.loop === true && t0.fresh === true, 'a fresh loop save on the title', t0);
  const s = await g(() => { const c = window.__gw; const ok = c.game.beginIntro({ character: 'stub' }); return { ok, flow: c.flow, wick: c.debug.loop?.wick?.() ?? null }; });
  check(s.ok && s.flow === 'home', 'Start with no film: flow home at once', s);
  await api.wait(1500);
  const h = await g(() => { const c = window.__gw, d = c.world.getDocks?.()[0], p = c.player.position; return { flow: c.flow, mode: c.render.getCameraMode?.() ?? c.debug.camera?.()?.mode, mood: c.audio.getMood?.() ?? null, dock: d ? Math.hypot(d.position.x - p.x, d.position.z - p.z) : null, fresh: c.game.loopFresh(), errs: c.errors.slice() }; });
  check(h.mode === 'sail' && h.dock !== null && h.dock < 0.6, 'the Jetty: the sail camera, the raft at the first dock', h);
  const hasLoop = await g(() => !!window.__gw.progression?.loop && !window.__gw.progression.loop.isStub);
  if (hasLoop) check(h.fresh === false, 'the title is no longer fresh (a Wick chosen, the tutorial begun)', h);
  else log('note', 'progression\'s loop is not wired in this build (lane A): the Wick and the tutorial are not recorded');
  await g(() => window.__gw.ui.closeAll?.());
  await api.wait(800);
  await shot('jetty');
  const sail = await g(() => window.__gw.game.sail({ water: 'mossmere' }));
  check(sail === true, 'Sail');
  await api.wait(900);
  const mid = await g(() => ({ flow: window.__gw.flow, glide: window.__gw.game.homeGlide?.() }));
  check(mid.flow === 'home' && mid.glide === 'sailOut', 'the glide out runs in flow home', mid);
  await shot('glide-out');
  await page.waitForFunction(() => window.__gw.flow === 'playing', null, { timeout: 120000, polling: 100 });
  await api.wait(1500);
  const w = await g(() => { const c = window.__gw; return { flow: c.flow, outing: c.state.run?.outing ?? null, ev: window.__sm.ev.map((x) => x.e + (x.flow ? ':' + x.flow : '') + (x.kind ? ':' + x.kind : '') + (x.state ? ':' + x.state : '') + (x.sail ? ':sail' : '')), errs: c.errors.slice() }; });
  log('events', JSON.stringify(w.ev));
  check(w.ev.indexOf('player:glide:sailOut:end') >= 0 && w.ev.indexOf('player:glide:sailOut:end') < w.ev.indexOf('run:start'), 'run:start only after the glide out ends', w.ev);
  check(w.ev.includes('zone:change:sail'), 'zone:change {sail: true}', w.ev);
  await shot('water');
  if (w.outing === 'trip') {
    const home = await g(() => { const c = window.__gw; const can = c.game.canGoHome(); const ok = c.game.goHome(); return { can, ok, flow: c.flow }; });
    check(home.ok && home.flow === 'home', 'Home: back to the Jetty', home);
    await api.wait(2600);
    const back = await g(() => ({ flow: window.__gw.flow, ev: window.__sm.ev.filter((x) => x.e === 'home:enter').map((x) => x.from) }));
    check(back.ev.includes('trip'), 'home:enter {from: trip} after the sail home', back);
    await shot('home-again');
  } else log('note', `the run is not a trip (outing ${w.outing}): progression's createTrip is lane A's; Home is skipped here`);
  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'no ctx errors', errs);
  return { failures };
}
