// The opening cut scene AS THE PLAYER SEES IT, frame by frame (docs/v3/intro/SPEC.md; the stage agent's captures): the picture,
// the words, the Skip word and the ink, shot off the page (canvas and DOM together) at exact moments of the film's clock.
// The storyboard sheets and the video are made from these frames by tools/intro-board.py.
//
//   node build.mjs --dev --out=tools/out/intro/dev.html
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/board       --script=tools/tests/intro-board.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/board-phone --script=tools/tests/intro-board.scenario.mjs --mobile --step=2
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/video       --script=tools/tests/intro-board.scenario.mjs --width=960 --height=540 --fps=12 --before=1 --after=2
//
// Options: --step=1 (seconds of film between frames) or --fps=12 (frames a second of film: the video) · --at=3.6,7.2 (only these
// times) · --from=0 --to=18 · --quality=low|medium|high (default high) · --settle=0.5 (seconds of the world's own motion run
// before each frame of a storyboard; with --fps the world simply runs on, one video frame at a time) · --before=0 (seconds of the
// title shot before the press) · --after=1 (seconds of play shot after the hand-off: one frame at its end for a storyboard, every
// frame with --fps; --afterAt=0.042,0.5,1 for chosen moments; --nohandoff for none) · --replay (the title's Prologue word on a
// returning save instead of Begin: the film ends at the title)
//
// HOW A FRAME IS MADE. Software GL runs at 1–10 fps here, so nothing is recorded in real time. The page's requestAnimationFrame is
// held and the game's own frame callback is called on a synthetic clock (24 steps a second), so the game runs exactly as in play.
//   - The fresh save's title is up; the scenario presses Begin (a real click): the real flow, no other click.
//   - Up to the moment the stage is live under the opening ink (0.5 s) the film is PLAYED on that clock, frame by frame (a seek
//     would do the under-ink work at once and show the lake's grade over the title).
//   - From there every frame is a SEEK: window.__gw.debug.intro('seek', t) holds the film's clock at t (the stage is a pure
//     function of it), the world's own motion runs on for a moment, the film is put at t once more, one frame is drawn, and the
//     page is shot.
//   - After the last frame the film is let run from 17.9 s to its end: `intro:done`, the hand-off, the first run; `--after`
//     seconds of play are stepped and shot.
// It writes frames.json (per frame: file, t, beat, the line on screen, what the DOM shows) next to the frames, and fails on any
// page, console or ctx error, on a frame that is not at its time, and when the hand-off does not land in play.
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const STEP = 1 / 24;

export default async function (api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const quality = typeof args.quality === 'string' ? args.quality : 'high';
  const fps = Number(args.fps) > 0 ? Number(args.fps) : 0;
  const stepS = fps ? 1 / fps : Number(args.step) > 0 ? Number(args.step) : 1;
  const settle = Number(args.settle) >= 0 && args.settle !== true && args.settle !== undefined ? Number(args.settle) : 0.5;
  const before = Number(args.before) > 0 ? Number(args.before) : 0;
  const after = args.after === undefined ? 1 : Math.max(0, Number(args.after) || 0);
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/intro/board'));
  mkdirSync(shotsDir, { recursive: true });
  const base = page.url().split('?')[0];
  const frames = [];
  const shoot = async (name, meta) => {
    const file = `${name}.png`;
    for (let attempt = 0; ; attempt++) {
      try { await page.screenshot({ path: resolve(shotsDir, file), timeout: 120000 }); break; } catch (e) { if (attempt >= 1) { failures.push(`screenshot ${name}: ${String(e?.message || e).split('\n')[0]}`); break; } }
    }
    frames.push({ file, ...meta });
  };

  // ------------------------------------------------------------------ boot: a fresh save on a v3 build that plays the film
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
  await g(() => { try { if (window.__gw?.game) window.__gw.game.save = () => {}; localStorage.clear(); } catch { /* ignore */ } });
  for (let attempt = 0; ; attempt++) {
    try { await page.goto(`${base}?v3=1&v3phase=1&intro=1`, { waitUntil: 'load', timeout: 300000 }); break; } catch (e) { if (attempt >= 2) throw e; await wait(1500); }
  }
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 250 });
  const build = await g(({ quality, replay }) => {
    const c = window.__gw;
    c.state.meta.settings = c.state.meta.settings || {};
    c.state.meta.settings.quality = quality;
    c.render.setQuality?.(quality);
    if (replay) { c.state.meta.runs = 1; c.state.meta.intro = { seen: true, skipped: false }; c.ui.showTitle(); }
    const T = (window.__ib = { held: null, clock: 0, offset: 0, sim: 0, ev: [] });
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { if (T.held) { T.held.push(cb); return 0; } return raf((ts) => cb(Math.max(ts + T.offset, T.clock))); };
    // CSS transitions and animations (the title's words, the HUD's fade, the lake's banner) run on the wall clock, and a frame here
    // takes a second to shoot: while the page's frames are held they are held too, and each step moves them on by its own dt
    const anims = new Set();
    T.catchAnims = () => {
      void document.body.offsetWidth;   // (styles changed in this step start their transitions now)
      for (const a of document.getAnimations()) { if (anims.has(a)) continue; anims.add(a); try { a.pause(); } catch { /* ignore */ } }
    };
    T.moveAnims = (ms) => {
      for (const a of [...anims]) {
        try {
          const end = a.effect?.getComputedTiming?.().endTime;
          const t = (Number(a.currentTime) || 0) + ms;
          if (Number.isFinite(end) && t >= end) { a.finish(); anims.delete(a); } else a.currentTime = t;
        } catch { anims.delete(a); }
      }
    };
    T.hold = () => { if (!T.held) { T.held = []; T.clock = Math.max(T.clock, performance.now() + T.offset); T.catchAnims(); } };
    T.release = () => {
      const q = T.held || []; T.held = null; T.offset = Math.max(T.offset, T.clock - performance.now());
      for (const a of anims) { try { a.play(); } catch { /* ignore */ } } anims.clear();
      for (const cb of q) raf((ts) => cb(Math.max(ts + T.offset, T.clock)));
    };
    const draw = c.render.render.bind(c.render);
    /** n frames of the game's own loop on the synthetic clock; the canvas is drawn only on the last one when `paint`. */
    T.step = (n = 1, dt = 1 / 24, paint = false) => {
      for (let i = 0; i < n; i++) {
        if (!T.held || !T.held.length) { T.dry = (T.dry || 0) + 1; continue; }
        c.render.render = paint && i === n - 1 ? draw : () => {};
        T.clock += dt * 1000; T.sim += dt;
        T.moveAnims(dt * 1000);
        const q = T.held; T.held = [];
        for (const cb of q) { try { cb(T.clock); } catch (e) { c.errors.push('frame: ' + (e?.message || e)); } }
        T.catchAnims();
      }
      c.render.render = draw;
    };
    for (const e of ['intro:start', 'intro:done', 'flow:change', 'run:start', 'zone:change']) c.bus.on(e, (p) => T.ev.push({ e, p: JSON.parse(JSON.stringify(p || {})), sim: T.sim }));
    const I = c.data.INTRO;
    return { v3: c.data.V3_ENABLED === true, intro: !!c.intro, pending: c.game.introPending?.(), tier: c.render.quality, length: I?.length, beats: I?.beats || [], lines: I?.lines || [], text: I?.text || [], veil: I?.veil || [] };
  }, { quality, replay: !!args.replay });
  log(`build: v3=${build.v3} intro=${build.intro} pending=${build.pending} tier=${build.tier} ${width}x${height} ${fps ? `${fps} fps` : `every ${stepS} s`}`);
  if (!build.v3 || !build.intro) { failures.push('the v3 build does not carry the cut scene'); return { failures }; }
  if (!args.replay && build.pending !== true) { failures.push('a fresh save with the opt-in must have the film pending'); return { failures }; }
  const L = build.length;
  const beatOf = (t) => (build.beats.find((b) => t >= b.t0 && t < b.t1) || build.beats.at(-1)).id;
  const lineOf = (t) => { const l = build.lines.find((x) => t >= x.at && t < x.out); return l ? build.text[l.i] : ''; };
  const hold = async () => {
    await g(() => window.__ib.hold());
    await page.waitForFunction(() => window.__ib.held && window.__ib.held.length > 0, null, { timeout: 120000, polling: 50 });
  };
  /** What of the film's DOM is on screen now. */
  const dom = () => g(() => {
    const c = window.__gw, v = c.debug.intro().view || {}, d = c.debug.intro();
    const skip = document.querySelector('.gw-intro-skip'), r = skip ? skip.getBoundingClientRect() : null;
    return { t: d.t, phase: d.phase, flow: c.flow, line: v.line ?? null, lineK: v.lineK ?? 0, veil: v.veil ?? 0, skip: v.skip ?? 0, skipBox: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null,
      stage: d.stage ? { t: d.stage.t, take: d.stage.take, w: d.stage.w, calls: d.stage.calls, triangles: d.stage.triangles } : null, errors: c.errors.length };
  });

  // ------------------------------------------------------------------ the title: its menu in, the set built in idle time
  await page.waitForFunction(() => { const m = document.querySelector('.gw-m-title .gw-title-menu'); return !!m && Number(getComputedStyle(m).opacity) > 0.9; }, null, { timeout: 120000, polling: 200 });
  if (!args.replay) await page.waitForFunction(() => window.__gw.intro.stage?.ready === true, null, { timeout: 30000, polling: 200 }).catch(() => {});
  const ready = await g(() => window.__gw.intro.stage?.ready === true);
  log(`the stage prebuilt under the title: ${ready}`);
  await hold();
  const names = (t) => `f-${t.toFixed(3).padStart(6, '0')}`;
  let k = 0;
  const seq = (label) => `${String(k++).padStart(4, '0')}-${label}`;
  if (before > 0) {
    const n = fps ? Math.round(before * fps) : 1;
    for (let i = 0; i < n; i++) {
      await g((s) => window.__ib.step(s, 1 / 24, true), fps ? Math.max(1, Math.round(24 / fps)) : 6);
      await shoot(seq('title'), { kind: 'title', t: null, label: 'the title' });
    }
  } else { await g(() => window.__ib.step(2, 1 / 24, true)); }

  // ------------------------------------------------------------------ the press: a real click on the title's word
  const word = args.replay ? 'Prologue' : 'Begin';
  const box = await g((word) => {
    const b = [...document.querySelectorAll('.gw-m-title .gw-tbtn, .gw-title-replay')].find((x) => (x.querySelector(':scope > span')?.textContent || x.textContent).replace(/\s+/g, ' ').trim().startsWith(word));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, word);
  if (!box) { failures.push(`the title has no "${word}" word`); return { failures }; }
  if (phone) await page.touchscreen.tap(box.x, box.y); else await page.mouse.click(box.x, box.y);
  const started = await g(() => { window.__ib.catchAnims(); return { active: window.__gw.intro.isActive(), flow: window.__gw.flow, modal: !!document.querySelector('.gw-m-title'), ev: window.__ib.ev.map((x) => x.e) }; });
  if (!started.active || started.flow !== 'intro') { failures.push(`one press of ${word} must start the film: ${JSON.stringify(started)}`); return { failures }; }
  log(`pressed ${word}: flow ${started.flow}, the film is running`);

  // the times to shoot
  let times;
  if (typeof args.at === 'string') times = args.at.split(',').map(Number).filter((x) => Number.isFinite(x));
  else {
    const from = Number(args.from) > 0 ? Number(args.from) : 0, to = Number(args.to) > 0 ? Math.min(L, Number(args.to)) : L;
    times = [];
    for (let i = 0; from + i * stepS <= to + 1e-6; i++) times.push(+(from + i * stepS).toFixed(4));
  }
  const LIVE_UNTIL = 0.5;   // the stage goes live under the opening ink at 0.37–0.5 s: up to there the film is played, not sought

  // ------------------------------------------------------------------ the frames
  const t0 = Date.now();
  for (const t of times) {
    const name = seq(names(t));
    if (t <= LIVE_UNTIL + 1e-6) {
      // played: step the game's own loop until the film's clock is at t (it started at 0 with the press)
      const at = await g(({ t }) => {
        const c = window.__gw, T = window.__ib;
        let n = 0;
        while (c.intro.isActive() && !c.intro.state.hold && c.intro.state.t < t - 1e-6 && n++ < 200) T.step(1, 1 / 24, false);
        // one drawn frame that does not move the film (the director's clock is held for it)
        const d = c.intro, tt = d.state.t;
        if (Math.abs(tt - t) < 0.03 || tt > t) { c.render.render(); }
        return tt;
      }, { t });
      if (Math.abs(at - t) > 0.045) failures.push(`t ${t}: the played film is at ${at}`);
    } else {
      const n = fps ? Math.max(1, Math.round(24 / fps)) : Math.max(1, Math.round(settle * 24));
      await g(({ t, n }) => {
        const c = window.__gw, T = window.__ib;
        c.debug.intro('seek', t);
        if (n > 1) T.step(n - 1, 1 / 24, false);
        c.debug.intro('seek', t);
        T.step(1, 1 / 24, true);
      }, { t, n });
    }
    const d = await dom();
    await shoot(name, { kind: 'film', t, beat: beatOf(t), line: d.lineK > 0.5 ? lineOf(t) : '', lineK: d.lineK, veil: d.veil, skip: d.skip, skipBox: d.skipBox, stage: d.stage });
    if (t > LIVE_UNTIL && Math.abs(d.t - t) > 1e-3) failures.push(`t ${t}: the film is at ${d.t}`);
    if (d.errors) failures.push(`t ${t}: ctx.errors is not empty`);
    if (frames.length % 12 === 0) log(`${frames.length} frames, t ${t.toFixed(2)} (+${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }

  // ------------------------------------------------------------------ the hand-off: the film runs out from 17.9 s into play
  if (after > 0 && !args.nohandoff && !(Number(args.to) > 0 && Number(args.to) < L)) {
    const end = await g(({ L }) => {
      const c = window.__gw, T = window.__ib;
      c.debug.intro('seek', L - 0.1);
      T.step(2, 1 / 24, false);
      c.debug.intro('seek', L - 0.1);
      c.debug.intro('resume');
      let n = 0;
      while (c.intro.isActive() && n++ < 60) T.step(1, 1 / 24, false);
      return { n, flow: c.flow, run: !!c.state.run, runs: c.state.meta.runs, seen: c.state.meta.intro?.seen === true, ev: T.ev.map((x) => x.e), cam: c.render.getIntroCamera?.() ?? null, mode: c.render.getCameraMode?.() };
    }, { L });
    log(`the hand-off: ${JSON.stringify(end)}`);
    if (!args.replay && (end.flow !== 'playing' || !end.run || end.runs !== 1 || !end.seen)) failures.push(`the film must end in the first run: ${JSON.stringify(end)}`);
    if (args.replay && end.flow !== 'title') failures.push(`a replay must end at the title: ${JSON.stringify(end)}`);
    // (--afterAt=0.042,0.25,1: these moments of play instead; each a whole number of 1/24 s steps after the hand-off)
    const marks = typeof args.afterAt === 'string' ? args.afterAt.split(',').map(Number).filter((x) => x > 0).map((x) => Math.max(1, Math.round(x * 24))) : null;
    const per = fps ? Math.max(1, Math.round(24 / fps)) : Math.round(after * 24);
    const n = marks ? marks.length : fps ? Math.round(after * fps) : 1;
    let done = 0;
    for (let i = 0; i < n; i++) {
      const steps = marks ? Math.max(1, marks[i] - done) : per;
      await g((s) => window.__ib.step(s, 1 / 24, true), steps);
      done += steps;
      const s = done / 24;
      const hud = await g(() => { const h = document.querySelector('#ui > .gw-hud'); const b = document.querySelector('#ui > .gw-banner-layer .gw-banner'); return { hud: !!h && getComputedStyle(h).visibility !== 'hidden' ? Number(getComputedStyle(h).opacity) : 0, banner: b ? b.textContent.replace(/\s+/g, ' ').trim() : '' }; });
      await shoot(seq(`play-${s.toFixed(3)}`), { kind: 'play', t: L + s, after: s, label: args.replay ? 'the title again' : 'play', ...hud });
    }
  }
  const tail = await g(() => { const c = window.__gw; window.__ib.release(); return { errors: c.errors.slice(), flow: c.flow, ev: window.__ib.ev }; });
  for (const e of tail.errors) failures.push('ctx.errors: ' + e);
  writeFileSync(resolve(shotsDir, 'frames.json'), JSON.stringify({ width, height, quality, fps: fps || null, step: stepS, length: L, lines: build.lines.map((l) => ({ ...l, text: build.text[l.i] })), beats: build.beats, frames, events: tail.ev }, null, 1));
  log(`${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s → ${shotsDir}`);
  return { failures };
}
