// The opening cut scene's LENGTH on the real clock (A1), and what the press and the first frames cost in script (A9).
//
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/length --script=tools/tests/intro-length.scenario.mjs --width=960 --height=540 [--quality=low] [--draw]
//
// A fresh save on a v3 build with the opt-in; the scenario presses Begin (a real click) and lets the game run on the page's own
// requestAnimationFrame. The canvas is not drawn unless --draw (software GL draws 1–10 frames a second here: with drawing on, the
// film's clamped clock gives up most of each frame and the wall time says nothing about the film). It records, per frame, the
// real frame time and what the film's clock took of it (at most INTRO.clock.maxDt), and reports:
//   - wall: performance.now() from `intro:start` to `intro:done`
//   - film: the sum of the frames' clamped times (must be INTRO.length within a frame)
//   - lost: what the clamp gave up on frames longer than maxDt (wall = film + lost, to a frame)
//   - the press: the script time of the click that starts the film; the longest update of the director in the first 1.4 s (the
//     stage going live under the ink) and over the whole film; the hand-off (`intro:done` → `run:start`)
// Fails when the film's own time is not INTRO.length ± 0.11 s, when wall − lost is not INTRO.length ± 0.5 s, when the press or
// any director update takes more than 0.5 s of script, or when the film does not end in the first run.
export default async function (api) {
  const { page, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const quality = typeof args.quality === 'string' ? args.quality : 'low';
  const base = page.url().split('?')[0];
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
  await g(() => { try { if (window.__gw?.game) window.__gw.game.save = () => {}; localStorage.clear(); } catch { /* ignore */ } });
  await page.goto(`${base}?v3=1&v3phase=1&intro=1`, { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 250 });
  await g(({ quality, draw }) => {
    const c = window.__gw, I = c.data.INTRO;
    c.state.meta.settings = c.state.meta.settings || {}; c.state.meta.settings.quality = quality; c.render.setQuality?.(quality);
    const M = (window.__il = { frames: [], start: null, done: null, run: null, press: null, ev: [], upd: [] });
    if (!draw) c.render.render = () => {};
    const update = c.intro.update.bind(c.intro);
    c.intro.update = (rawDt) => {
      const active = c.intro.isActive(), t0 = performance.now();
      update(rawDt);
      if (active) { const ms = performance.now() - t0; M.frames.push(rawDt); M.upd.push([c.intro.state.t, ms]); }
    };
    c.bus.on('intro:start', () => { M.start = performance.now(); });
    c.bus.on('intro:done', () => { M.done = performance.now(); });
    c.bus.on('run:start', () => { M.run = performance.now(); });
    // the press's own script time (the title's Begin runs game.beginIntro; its click listener stops the event, so it is timed here),
    // and the hand-off's (main calls game.startNewRun inside intro:done's own emit)
    const begin = c.game.beginIntro, start = c.game.startNewRun;
    c.game.beginIntro = (...a) => { const t0 = performance.now(); try { return begin(...a); } finally { M.press = performance.now() - t0; } };
    c.game.startNewRun = (...a) => { const t0 = performance.now(); try { return start(...a); } finally { M.handoff = performance.now() - t0; } };
    M.I = { length: I.length, maxDt: I.clock.maxDt };
  }, { quality, draw: !!args.draw });
  await page.waitForFunction(() => { const m = document.querySelector('.gw-m-title .gw-title-menu'); return !!m && Number(getComputedStyle(m).opacity) > 0.9; }, null, { timeout: 120000, polling: 200 });
  await page.waitForFunction(() => window.__gw.intro.stage?.ready === true, null, { timeout: 30000, polling: 200 }).catch(() => {});
  const ready = await g(() => window.__gw.intro.stage?.ready === true);
  const box = await g(() => { const b = [...document.querySelectorAll('.gw-m-title .gw-tbtn')].find((x) => x.textContent.trim().startsWith('Begin')); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  if (phone) await page.touchscreen.tap(box.x, box.y); else await page.mouse.click(box.x, box.y);
  await page.waitForFunction(() => window.__il.done !== null && window.__gw.flow !== 'intro', null, { timeout: 240000, polling: 100 });
  const r = await g(() => {
    const c = window.__gw, M = window.__il, mx = M.I.maxDt;
    const film = M.frames.reduce((a, d) => a + Math.min(d, mx), 0), lost = M.frames.reduce((a, d) => a + Math.max(0, d - mx), 0);
    const early = M.upd.filter(([t]) => t <= 1.4).reduce((a, [, ms]) => Math.max(a, ms), 0), worst = M.upd.reduce((a, [, ms]) => Math.max(a, ms), 0);
    return { wall: (M.done - M.start) / 1000, film, lost, frames: M.frames.length, over: M.frames.filter((d) => d > mx).length, longest: Math.max(...M.frames), press: M.press, early, worst,
      handoff: M.handoff ?? null, flow: c.flow, runs: c.state.meta.runs, seen: c.state.meta.intro?.seen === true, errors: c.errors.slice(), length: M.I.length,
      mem: { ...c.render.renderer.info.memory }, stage: c.intro.stage?.stats?.() };
  });
  log(`tier ${quality}, ${width}x${height}, drawing ${args.draw ? 'on' : 'off'}, the stage prebuilt under the title: ${ready}`);
  log(`wall ${r.wall.toFixed(2)} s from intro:start to intro:done; the film's clock took ${r.film.toFixed(2)} s of it in ${r.frames} frames (${(r.frames / r.wall).toFixed(0)} a second); ${r.over} frames were longer than the clamp (the longest ${r.longest.toFixed(2)} s) and gave up ${r.lost.toFixed(2)} s; wall − lost = ${(r.wall - r.lost).toFixed(2)} s`);
  log(`script: the press ${r.press?.toFixed(1)} ms; the director's longest update in the first 1.4 s ${r.early.toFixed(1)} ms, over the whole film ${r.worst.toFixed(1)} ms; the hand-off (game.startNewRun inside intro:done) ${r.handoff?.toFixed(1)} ms`);
  log(`after: flow ${r.flow}, runs ${r.runs}, seen ${r.seen}, the stage ${JSON.stringify({ built: r.stage?.built, live: r.stage?.live })}`);
  if (Math.abs(r.film - r.length) > 0.11) failures.push(`the film's clock ran ${r.film.toFixed(3)} s, not ${r.length}`);
  if (Math.abs(r.wall - r.lost - r.length) > 0.5) failures.push(`wall − lost is ${(r.wall - r.lost).toFixed(2)} s, not ${r.length} ± 0.5`);
  if (r.press > 500 || r.worst > 500) failures.push(`the press (${r.press} ms) or a director update (${r.worst} ms) took more than 0.5 s of script`);
  if (r.flow !== 'playing' || r.runs !== 1 || !r.seen) failures.push(`the film must end in the first run: ${JSON.stringify({ flow: r.flow, runs: r.runs, seen: r.seen })}`);
  for (const e of r.errors) failures.push('ctx.errors: ' + e);
  return { failures };
}
