// The opening cut scene's FLOW in the browser (docs/v3/intro/SPEC.md §7, §10: A1–A5, A7, A8, A10; lane B owns this file).
// When it plays, how it is skipped, what it says, how it hands the player into the game, on a v3 dev build.
//
//   node build.mjs --dev --out=tools/out/intro/dev.html
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/flow --script=tools/tests/intro-flow.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/flow-phone --script=tools/tests/intro-flow.scenario.mjs --mobile
//
// Options: --only=title,full,…  (run some parts: title full after skips keys reduced hidden error reload lake resize audio real)
//          --quality=low|medium|high   --noshots (no screenshots)
//
// HOW TIME IS DRIVEN. Software GL runs at 1–10 fps here, so nothing is judged on real-time playback. The page's
// requestAnimationFrame is held and the game's own frame callback is called with a synthetic clock (30 frames a second of film),
// with the canvas drawn only for the frames that are shot. The film's clock, the director, main's flow, the UI and the audio
// all run exactly as in play; only the wall clock is replaced. The view's short real-time fades (a skip's opening ink, the still
// layer) are waited out in real time. One part (`real`) plays the whole film on the real clock with drawing off and measures
// intro:start → intro:done on performance.now().
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const FPS = 30;

export default async function (api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const tag = phone ? 'phone' : 'desk';
  const only = typeof args.only === 'string' ? new Set(args.only.split(',')) : null;
  const want = (name) => !only || only.has(name);
  const quality = typeof args.quality === 'string' ? args.quality : phone ? 'medium' : 'high';
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/intro/flow'));
  mkdirSync(shotsDir, { recursive: true });
  let part = 'boot';
  const t0 = Date.now();
  const step = (s) => { part = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) return true;
    failures.push(`[${part}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const base = page.url().split('?')[0];
  const shoot = async (name) => { if (args.noshots) return null; try { await page.screenshot({ path: resolve(shotsDir, `${tag}-${name}.png`), timeout: 90000 }); log('shot', `${tag}-${name}.png`); } catch (e) { log('shot failed', name, String(e?.message || e).split('\n')[0]); } return null; };

  // ------------------------------------------------------------------ the in-page driver
  async function load(query, { fresh = false } = {}) {
    // (a fresh save: the page being left asks for a save on pagehide, so it is told not to before the store is cleared)
    if (fresh) await g(() => { try { if (window.__gw?.game) window.__gw.game.save = () => {}; localStorage.clear(); } catch { /* ignore */ } });
    // (a navigation is now and then aborted on this loaded machine: once more, after a breath)
    for (let attempt = 0; ; attempt++) {
      try { await page.goto(`${base}?v3=1&v3phase=1${query || ''}`, { waitUntil: 'load', timeout: 300000 }); break; } catch (e) { if (attempt >= 2) throw e; log('goto failed, again:', String(e?.message || e).split('\n')[0]); await wait(1500); }
    }
    await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 250 });
    await g(({ quality }) => {
      const c = window.__gw;
      c.state.meta.settings = c.state.meta.settings || {};
      c.state.meta.settings.quality = quality;
      c.render.setQuality?.(quality);
      const T = (window.__if = { ev: [], sim: 0, held: null, t0: performance.now(), offset: 0, clock: 0 });
      const raf = window.requestAnimationFrame.bind(window);
      // the game's frame clock is one monotonic line: real time plus whatever the synthetic stepping ran ahead of it (the loop
      // computes its dt from the timestamps it is handed, so they must never go backwards between held and free running)
      window.requestAnimationFrame = (cb) => { if (T.held) { T.held.push(cb); return 0; } return raf((ts) => cb(Math.max(ts + T.offset, T.clock))); };
      T.hold = () => { if (!T.held) { T.held = []; T.clock = Math.max(T.clock, performance.now() + T.offset); } };
      T.release = () => { const q = T.held || []; T.held = null; T.offset = Math.max(T.offset, T.clock - performance.now()); for (const cb of q) raf((ts) => cb(Math.max(ts + T.offset, T.clock))); };
      const draw = c.render.render.bind(c.render);
      T.draw = draw;
      T.drawing = (on) => { c.render.render = on ? draw : () => {}; };
      /** n frames of the game's own loop on the synthetic clock (dt seconds each); the canvas is drawn only when `paint`. */
      T.step = (n = 1, dt = 1 / 30, paint = false) => {
        T.drawing(paint);
        for (let i = 0; i < n; i++) {
          if (!T.held || !T.held.length) { T.dry = (T.dry || 0) + 1; continue; }   // (no frame is queued: the scenario must wait for one, see hold())
          T.clock += dt * 1000; T.sim += dt;
          const q = T.held; T.held = [];
          for (const cb of q) { try { cb(T.clock); } catch (e) { c.errors.push('frame: ' + (e?.message || e)); } }
        }
        T.drawing(true);
      };
      /** Step until the film's clock reaches t (or the film ends). Returns the director's state. */
      T.runTo = (t, dt = 1 / 30, max = 4000) => {
        let n = 0;
        while (c.intro.isActive() && c.intro.state.t < t - 1e-6 && n++ < max) T.step(1, dt, false);
        return c.intro.state;
      };
      T.runOut = (dt = 1 / 30, max = 4000) => { let n = 0; while (c.intro.isActive() && n++ < max) T.step(1, dt, false); return n; };
      // every emit, in the order it is CALLED (a listener added here would come after main's hand-off, which emits inside its own)
      const WATCH = new Set(['intro:start', 'intro:beat', 'intro:line', 'intro:skip', 'intro:done', 'flow:change', 'zone:change', 'run:start', 'ui:modal', 'toast']);
      const emit = c.bus.emit.bind(c.bus);
      c.bus.emit = (e, p) => { if (WATCH.has(e)) T.ev.push({ e, p: JSON.parse(JSON.stringify(p || {})), sim: T.sim, wall: performance.now(), film: c.intro?.isActive() ? c.intro.state.t : null }); return emit(e, p); };
      T.clear = () => { T.ev.length = 0; };
      T.names = () => T.ev.map((x) => x.e);
    }, { quality });
  }
  const state = () => g(() => {
    const c = window.__gw, r = c.state.run, d = c.debug.intro();
    const sp = c.world.getSpawn?.();
    const vis = (sel) => [...document.querySelectorAll(sel)].some((el) => { const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.01 && el.getClientRects().length > 0; });
    return {
      flow: c.flow, cinematic: c.cinematic, paused: c.paused, run: r ? { character: r.character, nightMode: r.nightMode, outing: r.outing, zone: r.zone, day: r.day, phase: r.phase, phaseTime: r.phaseTime, active: r.active } : null,
      runs: c.state.meta.runs, intro: c.state.meta.intro ? { ...c.state.meta.intro } : null, gameT: c.time.gameT,
      pos: [c.player.position.x, c.player.position.z].map((x) => +x.toFixed(3)), heading: +Number(c.player.heading).toFixed(3),
      spawn: sp ? [sp.position.x, sp.position.z].map((x) => +x.toFixed(3)) : null, spawnYaw: sp ? +Number(sp.yaw || 0).toFixed(3) : null,
      fishing: c.fishing.state, introCam: c.render.getIntroCamera?.() ?? null, mode: c.render.getCameraMode?.(), zone: c.world.getZone?.()?.id ?? null,
      d: { phase: d.phase, t: d.t, beat: d.beat, line: d.line, skip: d.skip, replay: d.replay, reduced: d.reduced, entered: d.entered, pending: d.pending, stage: d.stage, view: d.view },
      active: c.intro.isActive(), modal: c.debug.ui?.()?.openModal ?? null, blocking: !!c.ui.isBlocking?.(),
      hud: (() => { const h = document.querySelector('#ui > .gw-hud'); return !!h && h.classList.contains('gw-visible') && h.classList.contains('gw-live') && getComputedStyle(h).visibility !== 'hidden'; })(), toast: vis('#ui > .gw-toasts .gw-toast'), banner: vis('#ui > .gw-banner-layer .gw-banner'), introEl: vis('.gw-intro > *'), introNode: !!document.querySelector('.gw-intro'),
      introOn: document.getElementById('ui').classList.contains('gw-intro-on'),
      stored: (() => { try { return localStorage.getItem('gloomwater.save.v1'); } catch { return null; } })(),
      errors: c.errors.slice(), mem: { ...c.render.renderer.info.memory }, programs: c.render.renderer.info.programs?.length ?? null,
    };
  });
  /** Hold the page's frames and wait until the game's own frame callback is queued (a real frame can take a second here). */
  const hold = async () => {
    await g(() => window.__if.hold());
    await page.waitForFunction(() => window.__if.held && window.__if.held.length > 0, null, { timeout: 120000, polling: 50 });
  };
  const titleWords = () => g(() => [...document.querySelectorAll('.gw-m-title .gw-title-menu .gw-tbtn')].map((b) => (b.querySelector(':scope > span')?.textContent || b.textContent).replace(/\s+/g, ' ').trim()));
  /** A real click on a title word (the pointer path the player uses). */
  const clickTitle = async (label, sel = '.gw-m-title .gw-tbtn') => {
    const box = await g(([label, sel]) => {
      const b = [...document.querySelectorAll(sel)].find((x) => (x.querySelector(':scope > span')?.textContent || x.textContent).replace(/\s+/g, ' ').trim().startsWith(label));
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    }, [label, sel]);
    if (!box) return null;
    if (phone) await page.touchscreen.tap(box.x, box.y); else await page.mouse.click(box.x, box.y);
    return box;
  };
  /** Wait (real time, bounded) until the title's menu has faded in and can be pressed. */
  const titleReady = async () => {
    await g(() => window.__if.release());
    await page.waitForFunction(() => { const m = document.querySelector('.gw-m-title .gw-title-menu'); return !!m && Number(getComputedStyle(m).opacity) > 0.9; }, null, { timeout: 120000, polling: 200 });
    await hold();
  };
  /** A fresh save again without a reload (the debug opt-in stays on for the page). */
  const freshSave = async () => {
    await g(() => { const c = window.__gw, T = window.__if; T.release(); c.game.wipeAll(); try { localStorage.removeItem('gloomwater.save.v1'); } catch { /* ignore */ } c.debug.intro('auto', true); c.ui.showTitle(); T.clear(); T.sim = 0; });
    await titleReady();
  };
  /** The state a full play and a skip must both land in (SPEC §7.5), as a list of named booleans. */
  const endState = (s) => ({
    flow: s.flow === 'playing', runs: s.runs === 1, character: s.run?.character === 'wick', nightMode: s.run?.nightMode === 'still', outing: s.run?.outing === 'first',
    zone: s.run?.zone === 'mossmere' && s.zone === 'mossmere', day: s.run?.day === 1, phase: s.run?.phase === 'calm', phaseTime: (s.run?.phaseTime ?? 9) < 0.1,
    raft: !!s.spawn && Math.hypot(s.pos[0] - s.spawn[0], s.pos[1] - s.spawn[1]) < 0.05, facing: Math.abs(s.heading - (s.spawnYaw ?? 0)) < 1e-3,
    fishing: s.fishing === 'idle', cinematic: s.cinematic === false, introCam: s.introCam === null, mode: s.mode === 'sail',
    idle: s.active === false && s.d.phase === 'idle', disposed: !s.d.stage || (s.d.stage.live === false && s.d.stage.built === false),
    seen: s.intro?.seen === true, stored: !!s.stored && JSON.parse(s.stored).meta?.intro?.seen === true && JSON.parse(s.stored).run?.active === true,
    errors: s.errors.length === 0,
  });
  const checkEnd = (s, what) => { const e = endState(s); const bad = Object.keys(e).filter((k) => !e[k]); check(bad.length === 0, `${what}: the end state (SPEC 7.5)`, { bad, run: s.run, pos: s.pos, spawn: s.spawn, mode: s.mode, d: s.d, errors: s.errors }); return e; };

  // ================================================================== boot: a debug build with no opt-in is today's title
  step('boot');
  await load('', { fresh: true });
  if (want('title')) {
    const words = await titleWords();
    const s = await state();
    check(s.d.pending === false, 'a debug build (GW_DEBUG) with no opt-in: the film is not pending', s.d);
    check(words[0] === 'New Descent' && words.includes('Journal') && !words.includes('Begin'), 'with no opt-in the title is today\'s', words);
    check(!(await g(() => !!document.querySelector('.gw-title-replay'))), 'a fresh save with no opt-in shows no replay word');
  }

  // ================================================================== the fresh title with the film pending
  await load('&intro=1', { fresh: true });
  const baseline = await state();
  if (want('title')) {
    step('title');
    await titleReady();
    const words = await titleWords();
    const s = await state();
    check(s.d.pending === true, 'fresh save + opt-in: pending', s.d);
    check(words.length === 2 && words[0] === 'Begin' && words[1] === 'Settings', 'the fresh title says Begin, then Settings, and nothing else', words);
    check(await g(() => document.activeElement?.classList.contains('gw-tbtn--main') || window.__gw.isMobile || matchMedia('(pointer: coarse)').matches), 'Begin has the focus (the main word)');
    check(!(await g(() => !!document.querySelector('.gw-title-premise'))), 'the premise paragraph is not shown (the film says it)');
    check(!(await g(() => !!document.querySelector('.gw-title-replay'))), 'no replay word while the film is pending');
    await g(() => { window.__if.step(1, 1 / 30, true); });
    await shoot('title-fresh');
    // the title asks the stage to build in idle time
    await g(() => window.__if.release());
    await page.waitForFunction(() => window.__gw.intro.stage?.ready === true, null, { timeout: 20000, polling: 200 }).catch(() => {});
    await hold();
    check(await g(() => window.__gw.intro.stage?.ready === true), 'the stage was prebuilt under the title (prewarm in idle time)');
  }

  // ------------------------------------------------------------------ helpers of the film's parts
  /** What is on screen of the film's own DOM at this moment. */
  const dom = () => g(() => {
    const c = window.__gw, D = c.data.INTRO;
    const line = document.querySelector('.gw-intro-line'), span = line?.firstElementChild, skip = document.querySelector('.gw-intro-skip'), veil = document.querySelector('.gw-intro-veil'), still = document.querySelector('.gw-intro-still');
    const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right }; };
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const lc = cs(line), sc = cs(skip), sp = cs(span);
    const probe = document.createElement('div'); probe.className = 'gw-safe-probe'; document.body.appendChild(probe);
    const pc = getComputedStyle(probe); const safe = { t: parseFloat(pc.paddingTop) || 0, r: parseFloat(pc.paddingRight) || 0, b: parseFloat(pc.paddingBottom) || 0 }; probe.remove();
    const on = (st) => !!st && st.visibility !== 'hidden' && Number(st.opacity) > 0.001;
    return {
      vw: innerWidth, vh: innerHeight, band: c.debug.intro().view?.band ?? null, text: span?.textContent || '', line: rect(span), lineBox: rect(line),
      rows: span && lc ? Math.round(span.getBoundingClientRect().height / parseFloat(lc.lineHeight)) : 0,
      font: lc ? { size: parseFloat(lc.fontSize), style: lc.fontStyle, family: lc.fontFamily, color: lc.color, lh: parseFloat(lc.lineHeight) } : null,
      lineOpacity: on(lc) ? Number(lc.opacity) : 0,
      frame: sp ? { border: sp.borderTopWidth + sp.borderBottomWidth, outline: sp.outlineStyle, shadow: sp.boxShadow, lb: lc.borderTopWidth, lo: lc.outlineStyle, ls: lc.boxShadow } : null,
      skip: rect(skip), skipOpacity: on(sc) ? Number(sc.opacity) : 0, skipText: skip?.textContent || '', skipPoked: !!skip?.classList.contains('gw-poked'),
      skipFont: sc ? { size: parseFloat(sc.fontSize), family: sc.fontFamily, color: sc.color } : null,
      skipFrame: sc ? { border: sc.borderTopWidth, outline: sc.outlineStyle, shadow: sc.boxShadow, bg: sc.backgroundColor } : null, safe,
      veil: veil && on(cs(veil)) ? Number(cs(veil).opacity) : 0, still: still && on(cs(still)) ? Number(cs(still).opacity) : 0, words: D.words,
      live: document.querySelector('.gw-intro-live')?.textContent || '',
    };
  });
  /** Run the film to t, draw that frame, read the state and the DOM, and shoot it. */
  const probe = async (t, name) => {
    await g((t) => { const T = window.__if; T.runTo(t); T.step(1, 1 / 600, true); }, t);
    await wait(60);
    const st = await state(), d = await dom();
    if (name) await shoot(name);
    if (args.verbose) log(`probe ${t} s: programs ${st.programs}, geometries ${st.mem.geometries}, textures ${st.mem.textures}, take ${st.d.stage?.take}`);
    return { st, dom: d };
  };
  /**
   * The contrast of the words against what is behind their box (the picture and the pool together, the glyphs hidden): the
   * WCAG ratio between the text colour and the mean luminance of those pixels.
   */
  const contrast = async () => {
    const box = await g(() => {
      const span = document.querySelector('.gw-intro-line > span'); if (!span) return null;
      span.style.color = 'transparent'; span.style.textShadow = 'none';
      const r = span.getBoundingClientRect(); return { x: Math.max(0, Math.floor(r.left)), y: Math.floor(r.top), width: Math.ceil(r.width), height: Math.ceil(r.height) };
    });
    if (!box || box.width < 2) return null;
    const png = await page.screenshot({ clip: box, timeout: 90000 });
    return g(async ({ b64 }) => {
      const span = document.querySelector('.gw-intro-line > span'); span.style.color = ''; span.style.textShadow = '';
      const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
      const c2 = cv.getContext('2d'); c2.drawImage(img, 0, 0);
      const px = c2.getImageData(0, 0, cv.width, cv.height).data;
      const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      let sum = 0, max = 0;
      for (let i = 0; i < px.length; i += 4) { const l = 0.2126 * lin(px[i]) + 0.7152 * lin(px[i + 1]) + 0.0722 * lin(px[i + 2]); sum += l; if (l > max) max = l; }
      const bg = sum / (px.length / 4);
      const m = getComputedStyle(document.querySelector('.gw-intro-line')).color.match(/[\d.]+/g).map(Number);
      const fg = 0.2126 * lin(m[0]) + 0.7152 * lin(m[1]) + 0.0722 * lin(m[2]);
      return { ratio: +((fg + 0.05) / (bg + 0.05)).toFixed(2), worst: +((fg + 0.05) / (max + 0.05)).toFixed(2), bg: +bg.toFixed(4), fg: +fg.toFixed(3) };
    }, { b64: png.toString('base64') });
  };
  /** A layer of flat colour under the film's words (over the picture): the worst the picture could put behind them. */
  const underlay = (css) => g((css) => { document.getElementById('gw-if-under')?.remove(); if (!css) return; const d = document.createElement('div'); d.id = 'gw-if-under'; d.style.cssText = `position:fixed;inset:0;z-index:8;pointer-events:none;background:${css}`; document.getElementById('ui').appendChild(d); }, css);
  const events = () => g(() => window.__if.ev.map((x) => ({ e: x.e, p: x.p, sim: x.sim, wall: x.wall, film: x.film })));
  /** After the film's end event: let the view's short real-time fades finish and its element go. */
  const settle = async (ms = 650) => { await g(() => window.__if.step(2, 1 / 30, true)); await wait(ms); await g(() => window.__if.step(3, 1 / 30, true)); await wait(40); };
  const begin = async ({ reduced } = {}) => {
    await g(() => { window.__if.clear(); window.__if.sim = 0; });
    if (reduced === undefined) return clickTitle('Begin');
    return g((reduced) => { window.__gw.debug.intro('play', { replay: false, reduced }); return true; }, reduced);
  };

  // ================================================================== a full play, frame by frame
  let fullEnd = null;
  if (want('full')) {
    step('full');
    await titleReady();
    const before = await state();
    const timing = await g(() => {
      // what the press and the hand-off cost in script time (drawing aside): the click's own task, and startNewRun
      const c = window.__gw, T = window.__if; T.cost = {};
      const b = c.game.beginIntro, n = c.game.startNewRun;
      c.game.beginIntro = (...a) => { const t = performance.now(); const r = b(...a); T.cost.press = performance.now() - t; return r; };
      c.game.startNewRun = (...a) => { const t = performance.now(); const r = n(...a); T.cost.handoff = performance.now() - t; return r; };
      return true;
    });
    const box = await begin();
    check(!!box && timing, 'the Begin word can be pressed', box);
    let s = await state();
    let ev = await events();
    check(ev.some((x) => x.e === 'intro:start'), 'one press: intro:start in the same task (no frame, no panel)', ev.map((x) => x.e));
    check(s.flow === 'intro' && s.cinematic === true && s.run === null && s.active, 'flow intro, ctx.cinematic held, no run', { flow: s.flow, cin: s.cinematic, run: s.run });
    check(s.modal == null && !s.blocking, 'no modal opens between Begin and the film', s.modal);
    check(s.stored === before.stored, 'Begin writes nothing to the save');
    const frozen = { gameT: before.gameT, pos: before.pos, fishing: before.fishing };

    // --- 0.3 s: a skip is ignored (the guard), by the game's call and by the keys
    await g(() => window.__if.runTo(0.3));
    const guard = await g(() => { const c = window.__gw; const r = c.game.skipIntro(); return { r, active: c.intro.isActive(), skip: c.intro.state.skip }; });
    check(guard.r === false && guard.active && guard.skip === null, 'a skip at 0.3 s is ignored (the stray second tap of Begin)', guard);
    for (const k of ['Enter', 'Space', 'Escape']) await page.keyboard.press(k);
    check(await g(() => window.__gw.intro.state.skip === null && window.__gw.intro.isActive()), 'Enter, Space and Esc inside the guard do nothing');
    let p = await probe(0.45, 'ink');
    check(p.dom.veil >= 0.99, 'the opening ink is full at the swap (0.45 s)', { veil: p.dom.veil });
    check(p.dom.skipOpacity === 0, 'the Skip word is not shown inside the guard', { o: p.dom.skipOpacity });

    // --- 1.0 s: the Skip word (A2)
    p = await probe(1.0, null);
    const sk = p.dom.skip;
    check(p.dom.skipOpacity >= 0.99, 'the Skip word is visible by 1.0 s', { o: p.dom.skipOpacity });
    check(!!sk && sk.w >= 44 && sk.h >= 44, 'the Skip word is a target of at least 44 x 44 px', sk);
    check(!!sk && sk.y >= Math.max(12, p.dom.safe.t) - 0.5 && p.dom.vw - sk.r >= Math.max(12, p.dom.safe.r) - 0.5 && sk.x > p.dom.vw / 2 && sk.b < p.dom.vh * 0.2, 'the Skip word sits top right, inside the safe area', { sk, safe: p.dom.safe, vw: p.dom.vw });
    check(p.dom.skipText.trim() === 'Skip' && p.dom.skipFrame.border === '0px' && p.dom.skipFrame.outline === 'none' && p.dom.skipFrame.shadow === 'none' && /rgba\(0, 0, 0, 0\)|transparent/.test(p.dom.skipFrame.bg) && /Marcellus/.test(p.dom.skipFont.family), 'the Skip word is a quiet word (Marcellus SC), not a box', { ...p.dom.skipFrame, font: p.dom.skipFont });

    // --- the film in order: each line at its full strength (A5), the wordless dark, nothing else on screen (A4)
    const I = await g(() => { const D = window.__gw.data.INTRO; return { lines: D.lines, text: D.text, fade: D.lineFade }; });
    const seenLines = [];
    const lineProbe = async (L) => {
      const mid = (L.at + L.out) / 2;
      p = await probe(mid, `line-${L.i + 1}`);
      const d = p.dom, st = p.st;
      seenLines.push(d.text);
      const top = d.band.top * d.vh - d.safe.b, bottom = d.band.bottom * d.vh - d.safe.b;
      check(d.text === I.text[L.i] && d.lineOpacity >= 0.99, `line ${L.i + 1} is on screen at ${mid.toFixed(2)} s`, { text: d.text, o: d.lineOpacity });
      check(d.live === I.text[L.i], `line ${L.i + 1} is announced (aria-live)`, d.live);
      check(d.font.size >= 16 && d.font.size >= (d.band.portrait || d.vw <= 700 ? 18 : 19) - 0.01 && d.font.style === 'italic' && /Alegreya/.test(d.font.family), `line ${L.i + 1}: Alegreya italic, at least 16 px (${d.font.size} px)`, d.font);
      check(d.rows >= 1 && d.rows <= d.words.maxLines, `line ${L.i + 1}: at most two rows (${d.rows})`, d.line);
      check(d.line.y >= top - 0.75 && d.line.b <= bottom + 0.75, `line ${L.i + 1}: its box is inside the words band (${top.toFixed(0)}–${bottom.toFixed(0)} px)`, { y: d.line.y, b: d.line.b });
      check(d.line.x >= 8 && d.line.r <= d.vw - 8, `line ${L.i + 1}: clear of the screen's sides`, d.line);
      check(d.frame.border === '0px0px' && d.frame.outline === 'none' && d.frame.shadow === 'none' && d.frame.lb === '0px' && d.frame.lo === 'none' && d.frame.ls === 'none', `line ${L.i + 1}: no border, outline or box shadow`, d.frame);
      check(st.flow === 'intro' && st.cinematic === true && st.run === null && st.gameT === frozen.gameT, `at ${mid.toFixed(1)} s: flow intro, cinematic, no run, the game clock stopped`, { flow: st.flow, c: st.cinematic, gameT: st.gameT });
      check(!st.hud && !st.toast && !st.banner && !st.blocking && st.modal == null && st.introOn, `at ${mid.toFixed(1)} s: no HUD, toast, banner or modal`, { hud: st.hud, toast: st.toast, banner: st.banner, modal: st.modal });
      // contrast (A5): on this frame, and over the worst the picture could put there (candle amber, and the contact's pale gold)
      if (!args.noshots) {
        const c1 = await contrast();
        await underlay('#ed9e3b'); const c2 = await contrast(); await shoot(`line-${L.i + 1}-amber`);
        await underlay('#f0d49c'); const c3 = await contrast(); await underlay(null);
        log(`line ${L.i + 1} contrast: ${c1?.ratio} : 1 on the frame (bg ${c1?.bg}); ${c2?.ratio} : 1 over flat candle amber; ${c3?.ratio} : 1 over flat pale gold`);
        check(c1 && c1.ratio >= 7, `line ${L.i + 1}: at least 7 : 1 against what is behind it (${c1?.ratio} : 1)`, c1);
        check(c2 && c2.ratio >= 7, `line ${L.i + 1}: at least 7 : 1 even over flat candle amber (${c2?.ratio} : 1)`, c2);
        check(c3 && c3.ratio >= 4.5, `line ${L.i + 1}: still 4.5 : 1 over flat pale gold (${c3?.ratio} : 1)`, c3);
      }
    };
    await lineProbe(I.lines[0]);
    // a line fades by the film's clock
    p = await probe(I.lines[1].at + I.fade / 2, null);
    check(p.dom.lineOpacity > 0.3 && p.dom.lineOpacity < 0.7 && p.dom.text === I.text[1], 'a line fades in over INTRO.lineFade on the film\'s clock', { o: p.dom.lineOpacity });
    await lineProbe(I.lines[1]);
    p = await probe(8.15, null);
    check(p.dom.lineOpacity === 0 && p.dom.veil === 0, 'the cut at 8.2 s is hard: no words across it, no veil', { o: p.dom.lineOpacity, veil: p.dom.veil });
    p = await probe(10.0, 'below');
    check(p.dom.lineOpacity === 0 && p.dom.live === '', 'the beat "below" is wordless', { o: p.dom.lineOpacity, live: p.dom.live });
    // input changes nothing (A4)
    await page.keyboard.down('KeyW'); await g(() => window.__if.step(6)); await page.keyboard.up('KeyW');
    for (const k of ['KeyE', 'KeyF', 'KeyP', 'KeyC', 'KeyJ', 'KeyR', 'Tab']) await page.keyboard.press(k);
    if (phone) await page.touchscreen.tap(width / 2, height * 0.6); else { await page.mouse.move(width / 2, height * 0.6); await page.mouse.down(); await g(() => window.__if.step(4)); await page.mouse.up(); }
    await g(() => window.__if.step(3, 1 / 30, true));
    s = await state();
    check(s.active && s.flow === 'intro' && s.d.skip === null && !s.paused, 'movement keys, E / F / P / C / J / R, Tab and a press on the picture do not skip or pause', { flow: s.flow, skip: s.d.skip, paused: s.paused });
    check(JSON.stringify(s.pos) === JSON.stringify(frozen.pos) && s.fishing === frozen.fishing && s.gameT === frozen.gameT && !s.blocking && s.modal == null, 'nothing reaches the game (the raft, the line, the clock, no screen)', { pos: s.pos, fishing: s.fishing, gameT: s.gameT, modal: s.modal });
    check((await dom()).skipPoked, 'a press on the picture only brightens the Skip word');
    await lineProbe(I.lines[2]);
    await lineProbe(I.lines[3]);
    check(JSON.stringify(seenLines) === JSON.stringify(I.text), 'the four lines, in order', seenLines);
    p = await probe(17.8, 'home-rest');
    check(p.dom.lineOpacity === 0, 'no words in the last half second', { o: p.dom.lineOpacity });
    check(p.st.mode === 'sail' && p.st.introCam && p.st.introCam.w === 0, 'the camera is the play camera, at rest, before control begins', { mode: p.st.mode, w: p.st.introCam?.w });
    // (A9 is lane A's: the set's own programs are warmed by prebuild. What is logged here is the game's own lazy work under the film's camera.)
    log(`during the film: shader programs ${before.programs} → ${p.st.programs}, geometries ${before.mem.geometries} → ${p.st.mem.geometries}, textures ${before.mem.textures} → ${p.st.mem.textures} (the stub stage owns none)`);

    // --- the end: 18 s, one end event, the hand-off in one task
    const out = await g(() => { const T = window.__if; const n = T.runOut(); return { n, sim: T.sim, cost: T.cost }; });
    ev = await events();
    const evStart = ev.find((x) => x.e === 'intro:start'), evDone = ev.find((x) => x.e === 'intro:done');
    const length = evDone && evStart ? evDone.sim - evStart.sim : -1;
    log(`full play: ${length.toFixed(3)} s of film between intro:start and intro:done; the press took ${out.cost.press?.toFixed(1)} ms of script, the hand-off ${out.cost.handoff?.toFixed(1)} ms`);
    check(length >= 15 && length <= 20 && Math.abs(length - 18) <= 0.05, `a full play lasts 18 s (15–20) from its first frame to its end event (measured ${length.toFixed(3)} s)`, { length });
    check(ev.filter((x) => x.e === 'intro:done').length === 1 && evDone.p.skipped === false && evDone.p.replay === false && evDone.p.error === false, 'one intro:done {skipped: false}', evDone?.p);
    const iDone = ev.indexOf(evDone);
    const order = ev.slice(iDone).filter((x) => ['intro:done', 'flow:change', 'zone:change', 'run:start'].includes(x.e)).map((x) => x.e);
    check(JSON.stringify(order) === JSON.stringify(['intro:done', 'flow:change', 'zone:change', 'run:start']), 'the hand-off on the bus: intro:done, flow:change, zone:change, run:start', order);
    check(ev.slice(iDone).every((x) => x.sim === evDone.sim), 'the hand-off happens in the frame the film ends (no frame in between)');
    const fc = ev.slice(iDone).find((x) => x.e === 'flow:change'), zc = ev.slice(iDone).find((x) => x.e === 'zone:change'), rs = ev.slice(iDone).find((x) => x.e === 'run:start');
    check(fc?.p.flow === 'playing' && fc?.p.prev === 'intro', 'flow:change {flow: playing, prev: intro}', fc?.p);
    check(zc && zc.p.intro === true && zc.p.zone === 'mossmere' && zc.p.prev === null, 'the hand-off\'s zone:change carries {intro: true}', zc?.p);
    check(rs?.p.continued === false, 'run:start {continued: false}', rs?.p);
    check(ev.filter((x) => x.e === 'intro:beat').map((x) => x.p.id).join() === 'lit,fall,below,wick,home', 'every beat, in order', ev.filter((x) => x.e === 'intro:beat').map((x) => x.p.id));
    check(ev.filter((x) => x.e === 'intro:line' && x.p.i !== null).map((x) => x.p.i).join() === '0,1,2,3', 'every line, once');
    check(!ev.some((x) => x.sim > evStart.sim && x.sim < evDone.sim && (x.e === 'toast' || (x.e === 'ui:modal' && x.p.open))), 'no toast and no screen during the film');
    check(out.cost.press < 100, `the press costs under 100 ms of script (${out.cost.press?.toFixed(1)} ms): no build, no world rebuild`, out.cost);
    check(out.cost.handoff < 500, `the hand-off costs under 500 ms of script (${out.cost.handoff?.toFixed(1)} ms)`, out.cost);
    s = await state();
    fullEnd = checkEnd(s, 'a full play');
    check(s.intro?.skipped === false, 'meta.intro = {seen: true, skipped: false}', s.intro);
    log(`shader programs: ${before.programs} at the press, ${s.programs} after the hand-off`);
    await settle(700);
    s = await state();
    check(s.hud === true, 'the HUD is back when control begins');
    check(!s.introNode && !s.introOn, 'nothing of the film is left in the DOM', { node: s.introNode, on: s.introOn });
    check(s.banner === true, 'the lake\'s name rises as its banner');
    await shoot('handoff');
    // control: the raft answers the keys now
    await page.keyboard.down('KeyW'); await g(() => window.__if.step(20)); await page.keyboard.up('KeyW');
    const moved = await state();
    check(Math.hypot(moved.pos[0] - s.pos[0], moved.pos[1] - s.pos[1]) > 0.05 && moved.gameT > s.gameT, 'control has begun: the raft sails, the clock runs', { from: s.pos, to: moved.pos });
    check(moved.errors.length === 0, 'no errors after the hand-off', moved.errors);
  }

  // ================================================================== afterwards: never again by itself; the replay word
  if (want('after') && want('full')) {
    step('after');
    await g(() => { const T = window.__if; T.release(); window.__gw.game.toTitle(); T.clear(); });
    await titleReady();
    let words = await titleWords();
    let s = await state();
    check(words[0] === 'Continue' && words.includes('New Descent') && !words.includes('Begin'), 'back at the title the film is not offered again (Continue / New Descent)', words);
    check(s.d.pending === false, 'not pending any more', s.d);
    const rw = await g(() => { const b = document.querySelector('.gw-title-replay'); if (!b) return null; const r = b.getBoundingClientRect(), cs = getComputedStyle(b); return { text: b.textContent.trim(), w: r.width, h: r.height, y: r.top, b: r.bottom, vh: innerHeight, size: parseFloat(cs.fontSize), border: cs.borderTopWidth, bg: cs.backgroundColor, title: b.title, opacity: Number(cs.opacity) }; });
    check(!!rw && rw.text === 'Prologue', 'the title carries one quiet replay word, "Prologue"', rw);
    check(!!rw && rw.w >= 44 && rw.h >= 44 && rw.b <= rw.vh && rw.size <= 14 && rw.border === '0px', 'the replay word: a 44 px target, small type, no box', rw);
    await g(() => { window.__if.step(1, 1 / 30, true); });
    await shoot('title-returning');
    // a second new run plays nothing
    await g(() => { const c = window.__gw; window.__if.clear(); c.game.startNewRun({ character: 'wick' }); });
    await g(() => window.__if.step(5));
    let ev = await events();
    s = await state();
    check(!ev.some((x) => x.e.startsWith('intro:')) && s.flow === 'playing' && s.runs === 2 && !s.active, 'a second new run plays nothing of the film', { ev: ev.map((x) => x.e), flow: s.flow, runs: s.runs });
    await g(() => { const T = window.__if; T.release(); window.__gw.game.toTitle(); T.clear(); });
  }

  // ================================================================== the replay: the same film, nothing written
  if (want('replay')) {
    step('replay');
    if (!(await g(() => !!document.querySelector('.gw-title-replay')))) { await g(() => { const c = window.__gw, T = window.__if; T.release(); c.state.meta.runs = Math.max(1, c.state.meta.runs); c.game.save(); c.ui.showTitle(); }); }
    await titleReady();
    const before = await state();
    const metaBefore = await g(() => JSON.stringify(window.__gw.state.meta));
    await g(() => { window.__if.clear(); window.__if.sim = 0; });
    const box = await clickTitle('Prologue', '.gw-m-title .gw-title-replay');
    check(!!box, 'the Prologue word can be pressed', box);
    let s = await state();
    check(s.flow === 'intro' && s.active && s.d.replay === true && s.cinematic === true, 'the replay is the film (flow intro, replay: true)', { flow: s.flow, d: s.d });
    let p = await probe(6.45, 'replay-line-2');
    check(p.dom.lineOpacity >= 0.99 && p.dom.skipOpacity >= 0.99, 'the same words and the same Skip word');
    await g(() => window.__if.runOut());
    let ev = await events();
    const done = ev.find((x) => x.e === 'intro:done'), start = ev.find((x) => x.e === 'intro:start');
    check(done && done.p.replay === true && done.p.skipped === false && Math.abs(done.sim - start.sim - 18) <= 0.05, 'the replay lasts 18 s and ends in intro:done {replay: true}', { p: done?.p, len: done ? done.sim - start.sim : null });
    check(!ev.some((x) => x.e === 'zone:change' || x.e === 'run:start'), 'a replay starts no run and changes no lake on the bus', ev.map((x) => x.e));
    await settle(500);
    s = await state();
    check(s.flow === 'title' && s.run === null && s.cinematic === false && !s.active && s.introCam === null, 'it ends at the title', { flow: s.flow, run: s.run, cin: s.cinematic });
    check((await g(() => JSON.stringify(window.__gw.state.meta))) === metaBefore, 'a replay leaves JSON.stringify(meta) identical');
    check(s.stored === before.stored, 'a replay leaves the stored save identical, byte for byte');
    check(s.runs === before.runs && JSON.stringify(s.intro) === JSON.stringify(before.intro), 'meta.runs and meta.intro unchanged', { runs: s.runs, intro: s.intro });
    check(s.modal === 'title', 'the title is back on screen', s.modal);
    check(!s.introNode && !s.introOn, 'nothing of the film is left in the DOM');
    check(s.mem.geometries === before.mem.geometries && s.mem.textures === before.mem.textures, 'renderer.info.memory is back to what it was before the replay', { before: before.mem, after: s.mem });
    check(s.errors.length === 0, 'no errors', s.errors);
    // a replay can be skipped too, both ways, and still writes nothing
    for (const at of [3, 13.5]) {
      await titleReady();
      await g(() => { window.__if.clear(); window.__gw.game.replayIntro(); });
      await g((at) => { const T = window.__if; T.runTo(at); window.__gw.game.skipIntro(); T.runOut(); }, at);
      await settle(600);
      s = await state();
      check(s.flow === 'title' && s.stored === before.stored && (await g(() => JSON.stringify(window.__gw.state.meta))) === metaBefore && !s.introNode && s.errors.length === 0, `a replay skipped at ${at} s ends at the title with nothing written`, { flow: s.flow, node: s.introNode, errors: s.errors });
      check(s.mem.geometries === before.mem.geometries && s.mem.textures === before.mem.textures, `… and memory back to its baseline (skip at ${at} s)`, { before: before.mem, after: s.mem });
    }
  }

  // ================================================================== skips: early, mid, in the last second; the keys
  if (want('skips')) {
    step('skips');
    const K = await g(() => window.__gw.data.INTRO.skip);
    const cases = [{ at: 0.6, how: 'word', name: 'early' }, { at: 6.6, how: 'Escape', name: 'fall' }, { at: 10.2, how: 'Enter', name: 'mid' }, { at: 13.4, how: 'Space', name: 'wick' }, { at: 17.2, how: 'word', name: 'last-second' }];
    for (const c of cases) {
      await freshSave();
      const words = await titleWords();
      check(words[0] === 'Begin', `[${c.name}] a fresh save says Begin again`, words);
      await begin();
      await g((at) => window.__if.runTo(at), c.at);
      await g(() => window.__if.step(1, 1 / 600, true));
      const pre = await state();
      // the skip, by the Skip word (a real press) or a key
      if (c.how === 'word') { const b = (await dom()).skip; if (phone) await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); else await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); } else await page.keyboard.press(c.how);
      let s = await state();
      const mode = pre.d.t >= 12.4 ? 'finish' : 'veil';
      check(s.d.skip && s.d.skip.mode === mode, `[${c.name}] ${c.how === 'word' ? 'one press on the Skip word' : c.how} skips at ${pre.d.t.toFixed(2)} s (${mode})`, s.d.skip);
      const d0 = await dom();
      check(d0.lineOpacity === 0 && d0.skipOpacity === 0, `[${c.name}] the words and the Skip word clear at once`, { line: d0.lineOpacity, skip: d0.skipOpacity });
      // frame by frame to the end event
      const trace = await g(() => { const T = window.__if, c = window.__gw; const out = []; let n = 0; while (c.intro.isActive() && n++ < 200) { T.step(1, 1 / 60, false); out.push({ k: c.intro.state.skip?.k ?? null, t: c.intro.state.t, veil: Number(getComputedStyle(document.querySelector('.gw-intro-veil') || document.body).opacity) }); } return out; });
      const ev = await events();
      const iSkip = ev.findIndex((x) => x.e === 'intro:skip'), evSkip = ev[iSkip], evDone = ev.find((x) => x.e === 'intro:done');
      const took = evDone && evSkip ? evDone.sim - evSkip.sim : -1;
      check(ev.filter((x) => x.e === 'intro:skip').length === 1 && evSkip.p.mode === mode, `[${c.name}] one intro:skip {mode: ${mode}}`, evSkip?.p);
      check(evDone && evDone.p.skipped === true && evDone.p.replay === false && evDone.p.mode === mode, `[${c.name}] one intro:done {skipped: true}`, evDone?.p);
      const budget = mode === 'veil' ? K.veilIn + 1 / 60 + 1e-6 : K.finish + 1 / 60 + 1e-6;
      check(took >= 0 && took <= budget && took + (mode === 'veil' ? K.veilOut : 0) <= 0.6 + 1 / 60 + 1e-6, `[${c.name}] intro:skip → intro:done in ${took.toFixed(3)} s (budget ${budget.toFixed(3)} s; 0.6 s with the opening ink)`, { took });
      if (mode === 'veil') {
        check(trace.some((x, i) => x.k >= 1 && i < trace.length - 1), `[${c.name}] the jump happens under a painted frame of full ink`, trace.map((x) => x.k));
        const dn = await dom();
        check(dn.veil >= 0.99, `[${c.name}] the ink is full when the game is handed over`, { veil: dn.veil });
        await shoot(`skip-${c.name}-ink`);
      } else check(trace.every((x) => x.veil === 0 || Number.isNaN(x.veil)), `[${c.name}] no ink in a fast finish: the film plays out`, trace.map((x) => x.veil));
      s = await state();
      const e = checkEnd(s, `[${c.name}] a skip at ${c.at} s`);
      if (fullEnd) check(JSON.stringify(e) === JSON.stringify(fullEnd), `[${c.name}] the same end state as a full play, item by item`, e);
      check(s.intro?.skipped === true, `[${c.name}] meta.intro = {seen: true, skipped: true}`, s.intro);
      const order = ev.slice(ev.indexOf(evDone)).filter((x) => ['intro:done', 'flow:change', 'zone:change', 'run:start'].includes(x.e)).map((x) => x.e);
      check(JSON.stringify(order) === JSON.stringify(['intro:done', 'flow:change', 'zone:change', 'run:start']), `[${c.name}] the same hand-off on the bus`, order);
      // the opening ink (real time), then nothing of the film is left
      await g(() => window.__if.step(2, 1 / 30, true)); await wait(K.veilOut * 1000 + 250); await g(() => window.__if.step(3, 1 / 30, true)); await wait(40);
      s = await state();
      check(!s.introNode && !s.introOn && s.hud === true, `[${c.name}] ${mode === 'veil' ? 'the ink has opened on the play frame' : 'the film is gone'} and the HUD is in`, { node: s.introNode, hud: s.hud });
      if (c.name === 'mid' || c.name === 'last-second') await shoot(`skip-${c.name}-after`);
      check(s.errors.length === 0, `[${c.name}] no errors`, s.errors);
    }
  }

  // ================================================================== reduced motion: stills, cross-faded
  if (want('reduced')) {
    step('reduced');
    await freshSave();
    await g(() => { const c = window.__gw, T = window.__if; T.poses = []; });
    await begin({ reduced: true });
    let s = await state();
    check(s.d.reduced === true && s.flow === 'intro', 'the film plays under reduced motion', s.d);
    // every frame: the stage's moment, the camera pose, the line and the still layer
    const run = await g(() => {
      const c = window.__gw, T = window.__if, D = c.data.INTRO, rows = [];
      let n = 0;
      while (c.intro.isActive() && n++ < 4000) {
        const paint = rows.length % 15 === 0;
        T.step(1, 1 / 30, false);
        if (!c.intro.isActive()) break;
        const st = c.intro.state, cam = c.render.getIntroCamera?.();
        const still = document.querySelector('.gw-intro-still'), cs = still ? getComputedStyle(still) : null;
        rows.push({ t: st.t, beat: st.beat, line: st.line, stage: c.intro.stage?.stats?.().t ?? null, pose: cam ? [...cam.pos, ...cam.look, cam.fov, cam.w].map((x) => +Number(x).toFixed(4)).join() : null,
          still: cs && cs.visibility !== 'hidden' ? Number(cs.opacity) : 0, wall: performance.now(), view: c.debug.intro().view });
        void paint;
      }
      return { rows, stills: D.stills, beats: D.beats, swapAt: D.swapAt, lines: D.lines, stillFade: D.stillFade };
    });
    const ev = await events();
    const start = ev.find((x) => x.e === 'intro:start'), done = ev.find((x) => x.e === 'intro:done');
    check(start?.p.reduced === true && done && Math.abs(done.sim - start.sim - 18) <= 0.05 && done.p.skipped === false, `reduced motion: the same length (${(done.sim - start.sim).toFixed(3)} s)`, done?.p);
    const after = run.rows.filter((r) => r.t >= run.swapAt + 0.1);
    const stageTimes = [...new Set(after.map((r) => r.stage))];
    check(JSON.stringify(stageTimes) === JSON.stringify(run.stills.map((x) => x.t)), 'the stage holds one still per beat (five in all)', stageTimes);
    const posesByBeat = run.beats.map((b) => [...new Set(after.filter((r) => r.beat === b.id && r.t > b.t0 + 0.05).map((r) => r.pose))]);
    check(posesByBeat.every((p) => p.length === 1), 'the camera pose is constant inside each beat', posesByBeat.map((p) => p.length));
    check(new Set(posesByBeat.map((p) => p[0])).size >= 4, 'at least four different poses over the film (the last two beats may share the play camera\'s)', posesByBeat.map((p) => p[0]));
    const lineSpans = run.lines.map((l) => { const on = run.rows.filter((r) => r.line === l.i); return on.length ? [on[0].t, on.at(-1).t] : null; });
    check(lineSpans.every((x, i) => x && Math.abs(x[0] - run.lines[i].at) <= 0.04 && Math.abs(x[1] - run.lines[i].out) <= 0.04), 'the same four lines at the same times', lineSpans);
    check(ev.filter((x) => x.e === 'intro:line' && x.p.i !== null).length === 4, 'four lines');
    // a cross-fade layer at each change of beat: there on the first frame of the new beat, gone within 0.6 s of real time
    const changes = run.beats.slice(1).map((b) => { const i = run.rows.findIndex((r) => r.beat === b.id); return { beat: b.id, first: run.rows[i], rows: run.rows.slice(i, i + 40) }; });
    const snaps = run.rows.at(-1)?.view?.snapCount ?? 0, snapsOk = run.rows.at(-1)?.view?.snapshots;
    log(`reduced motion: ${snaps} snapshots of the canvas (copying ${snapsOk ? 'works' : 'failed: ink dips instead'})`);
    if (snapsOk) {
      check(snaps === 4, 'the picture is copied once at each of the four changes of beat', { snaps });
      check(changes.every((c) => c.first.still > 0.5), 'the outgoing still is on screen as the new beat starts (the cross-fade layer)', changes.map((c) => [c.beat, c.first.still]));
      const gone = changes.map((c) => { const end = c.rows.find((r) => r.still === 0); return end ? (end.wall - c.first.wall) / 1000 : null; });
      void gone;   // (the fade runs on the wall clock, this loop does not: its length is measured just below)
    } else check(run.rows.some((r) => r.view && r.view.veil > 0.5 && r.t > 2), 'with no copy of the picture the changes are ink dips');
    s = await state();
    checkEnd(s, 'reduced motion');
    await settle(700);
    check(!(await state()).introNode, 'reduced motion: nothing of the film is left');
    // the cross-fade itself, on the wall clock: sit at a change of beat and watch the layer go
    await freshSave();
    await begin({ reduced: true });
    await g(() => { const T = window.__if; T.runTo(4.95); T.step(1, 1 / 600, true); });
    await shoot('reduced-still-lit');
    const fade = await g(async () => {
      const T = window.__if, c = window.__gw, still = () => { const el = document.querySelector('.gw-intro-still'); const cs = getComputedStyle(el); return cs.visibility === 'hidden' ? 0 : Number(cs.opacity); };
      // across the change of beat with the canvas being drawn (the view copies what the renderer draws in that same task)
      T.runTo(4.985, 1 / 120); let guard = 0; while (c.intro.state.t < 5.02 && guard++ < 20) T.step(1, 1 / 120, true);
      const t0 = performance.now(); const first = still(); const seen = [];
      // what the layer holds: the copied picture (opaque pixels that are not all one flat colour), not an empty canvas
      const el = document.querySelector('.gw-intro-still'); let copied = null;
      try { const d = el.getContext('2d').getImageData(0, 0, el.width, el.height).data; let a = 0, lo = 255, hi = 0, n = 0; for (let i = 0; i < d.length; i += 4 * 97) { a += d[i + 3]; const l = (d[i] + d[i + 1] + d[i + 2]) / 3; if (l < lo) lo = l; if (l > hi) hi = l; n++; } copied = { alpha: a / n, lo, hi, w: el.width, h: el.height }; } catch (e) { copied = { error: String(e) }; }
      // the film is held here so only the wall clock moves the fade
      c.intro.seek(c.intro.state.t);
      for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 40)); T.step(1, 1 / 600, i === 3); seen.push([+((performance.now() - t0) / 1000).toFixed(2), +still().toFixed(2)]); if (still() === 0) break; }
      c.intro.resume();
      return { first, seen, copied, fade: c.data.INTRO.stillFade, snapshots: c.debug.intro().view?.snapshots };
    });
    if (fade.snapshots) {
      check(fade.copied && fade.copied.alpha > 250 && fade.copied.hi - fade.copied.lo > 30, 'the layer holds the outgoing picture (opaque, not one flat colour)', fade.copied);
      const goneAt = fade.seen.find((x) => x[1] === 0)?.[0] ?? null;
      check(fade.first > 0.8, 'at the change of beat the outgoing still covers the new one', fade);
      // the fade is on the wall clock: every sample sits on 1 - elapsed / INTRO.stillFade (this machine can stall for seconds
      // between two samples, so the samples are checked against the line rather than counted)
      check(fade.fade <= 0.6 && fade.seen.length >= 1 && fade.seen.every(([x, o]) => Math.abs(o - Math.max(0, 1 - x / fade.fade)) <= 0.3), `the cross-fade layer fades out over ${fade.fade} s of wall clock (at most 0.6)`, fade.seen);
      check(goneAt !== null, `the cross-fade layer is gone (first seen gone at ${goneAt} s; samples ${fade.seen.length})`, fade.seen);
      check(fade.seen.every((x, i) => i === 0 || x[1] <= fade.seen[i - 1][1] + 1e-6), 'the layer only fades out', fade.seen);
    }
    await shoot('reduced-crossfade');
    // skippable under reduced motion
    await g(() => window.__if.runTo(9));
    await page.keyboard.press('Escape');
    await g(() => window.__if.runOut(1 / 60));
    s = await state();
    const e2 = checkEnd(s, 'a skip under reduced motion');
    check(s.intro?.skipped === true && (!fullEnd || JSON.stringify(e2) === JSON.stringify(fullEnd)), 'reduced motion: Esc skips, into the same end state');
    await settle(700);
  }

  // ================================================================== reduced flashing: the cut is an ink dip
  if (want('calm')) {
    step('calm');
    await freshSave();
    await g(() => { window.__gw.state.meta.settings.reducedFlashing = true; });
    await begin();
    let p = await probe(8.2, 'calm-cut');
    check(p.st.d.reduced === false && p.dom.veil > 0.8, 'reduced flashing: the hard cut is an ink dip (full on the cut)', { veil: p.dom.veil });
    p = await probe(8.2 - 0.3, null);
    const p2 = await g(() => { const T = window.__if; T.runTo(8.42); T.step(1, 1 / 600, true); return Number(getComputedStyle(document.querySelector('.gw-intro-veil')).opacity) || 0; });
    check(p2 === 0, 'the dip is over 0.15 s after the cut', { veil: p2 });
    await g(() => { window.__gw.state.meta.settings.reducedFlashing = false; window.__gw.game.skipIntro(); window.__if.runOut(1 / 60); });
    await settle(700);
  }

  // ================================================================== hidden: the film waits
  if (want('hidden')) {
    step('hidden');
    await freshSave();
    if (phone) await begin();
    else {
      // Begin by the keyboard: the word has the focus, Enter presses it, and that same Enter (held, repeating) never skips
      await g(() => { window.__if.clear(); window.__if.sim = 0; });
      await page.keyboard.down('Enter');
      const k = await g(() => ({ started: window.__if.ev.some((x) => x.e === 'intro:start'), flow: window.__gw.flow }));
      check(k.started && k.flow === 'intro', 'Enter on the focused Begin starts the film', k);
      await g(() => window.__if.runTo(0.8));
      await g(() => { for (let i = 0; i < 4; i++) window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', repeat: true, bubbles: true, cancelable: true })); });
      await page.keyboard.up('Enter');
      check(await g(() => window.__gw.intro.isActive() && window.__gw.intro.state.skip === null), 'a held Enter (key repeat) does not skip the film it started');
    }
    await g(() => window.__if.runTo(3));
    const r = await g(() => {
      const c = window.__gw, T = window.__if, t0 = c.intro.state.t, w0 = c.intro.state.wall;
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      T.step(120, 1 / 30, false);
      const t1 = c.intro.state.t, w1 = c.intro.state.wall;
      delete document.hidden;
      T.step(30, 1 / 30, false);
      return { t0, t1, w0, w1, t2: c.intro.state.t, hidden: document.hidden };
    });
    check(r.t1 === r.t0 && r.w1 === r.w0, 'while document.hidden the film\'s clock (and its valve) stand still', r);
    check(Math.abs(r.t2 - r.t0 - 1) < 0.05, 'it runs on when the page shows again', r);
    const s = await state();
    check(s.active && s.flow === 'intro' && s.stored === null, 'still the film, nothing saved meanwhile');
    await g(() => { window.__gw.game.skipIntro(); window.__if.runOut(1 / 60); });
    await settle(700);
  }

  // ================================================================== an exception in the stage ends it cleanly into the game
  if (want('error')) {
    step('error');
    for (const at of [0.2, 3, 9, 14]) {
      await freshSave();
      const patched = await g((at) => {
        const st = window.__gw.intro.stage, T = window.__if;
        st.__setTime = st.setTime; st.setTime = (t, o) => { if (t > at) throw new Error('planted: the stage breaks at ' + at); return st.__setTime(t, o); };
        // (the director reports the planted exception with console.error: collected here, so the run's console stays clean)
        T.said = []; T.cerr = console.error; console.error = (...a) => { T.said.push(a.map(String).join(' ')); };
        return true;
      }, at);
      await begin();
      await g(() => window.__if.runOut());
      const said = await g(() => { const st = window.__gw.intro.stage, T = window.__if; if (st.__setTime) { st.setTime = st.__setTime; delete st.__setTime; } console.error = T.cerr; return T.said; });
      check(said.length === 1 && /\[intro\] stage\.setTime/.test(said[0]) && /planted/.test(said[0]), `the exception is logged once [${at} s]`, said);
      const ev = await events();
      const dones = ev.filter((x) => x.e === 'intro:done');
      let s = await state();
      check(patched && dones.length === 1 && dones[0].p.error === true, `a stage that throws after ${at} s: one intro:done {error: true}`, dones.map((x) => x.p));
      check(s.errors.length >= 1 && s.errors.every((e) => /^intro\./.test(e)), 'the exception is reported (and nothing else)', s.errors);
      const e = endState({ ...s, errors: [] });
      const bad = Object.keys(e).filter((k) => !e[k]);
      check(bad.length === 0, `after the error the game is in the same end state (playable, seen: true) [${at} s]`, { bad, flow: s.flow, intro: s.intro });
      await g(() => { window.__gw.errors.length = 0; });
      await settle(600);
      s = await state();
      check(!s.introNode && s.hud === true, `nothing of the film is left after the error [${at} s]`, { node: s.introNode, hud: s.hud });
      await page.keyboard.down('KeyD'); await g(() => window.__if.step(15)); await page.keyboard.up('KeyD');
      const m = await state();
      check(Math.hypot(m.pos[0] - s.pos[0], m.pos[1] - s.pos[1]) > 0.02, `the game is playable after the error [${at} s]`, { from: s.pos, to: m.pos });
    }
    await g(() => { window.__gw.errors.length = 0; });
  }

  // ================================================================== resize and rotation, in every beat
  if (want('resize') && !phone) {
    step('resize');
    await freshSave();
    await begin();
    for (const t of [2.5, 6.5, 10, 13.5, 16]) {
      await g((t) => window.__if.runTo(t), t);
      await page.setViewportSize({ width: 390, height: 844 });
      await g(() => { window.__gw.render.resize?.(innerWidth, innerHeight); window.__if.step(2, 1 / 60, true); });
      const a = await dom(), sa = await state();
      await page.setViewportSize({ width, height });
      await g(() => { window.__gw.render.resize?.(innerWidth, innerHeight); window.__if.step(2, 1 / 60, true); });
      const b = await dom(), sb = await state();
      check(a.band?.portrait === true && b.band?.portrait === false, `at ${t} s: the words band follows a rotation`, { a: a.band, b: b.band });
      check(sa.errors.length === 0 && sb.errors.length === 0 && sb.active, `at ${t} s: resize and rotation raise no error`, sb.errors);
      if (a.lineOpacity > 0) { const top = a.band.top * a.vh, bottom = a.band.bottom * a.vh; check(a.line.y >= top - 0.75 && a.line.b <= bottom + 0.75 && a.rows <= 2 && a.line.x >= 8 && a.line.r <= a.vw - 8, `at ${t} s: the line sits in the portrait band after the rotation`, a.line); }
      check(a.skip.w >= 44 && a.skip.h >= 44 && a.vw - a.skip.r >= 11.5, `at ${t} s: the Skip word keeps its place and its target`, a.skip);
    }
    await g(() => window.__if.runOut());
    checkEnd(await state(), 'after resizes in every beat');
    await settle(700);
  }

  // ================================================================== the sound cue in the browser
  if (want('audio')) {
    step('audio');
    await freshSave();
    // a real press unlocks the audio (the same gesture that starts the film)
    await begin();
    const a0 = await g(() => { const c = window.__gw; return { unlocked: c.audio.isUnlocked?.(), intro: c.debug.audioIntro?.() }; });
    if (!a0.intro || a0.intro.state !== 'running') {
      log('audio: the context is not running in this browser (no audio device or autoplay policy); checking only that nothing is scheduled', JSON.stringify(a0.intro));
      await g(() => window.__if.runTo(3));
      const l = await g(() => window.__gw.debug.audioLog(240).filter((e) => e.name === 'intro_cue').map((e) => e.why));
      check(a0.intro?.state === 'locked' ? l.length === 0 : l.length <= 2, 'with the context not running nothing queues up past the first half second', l);
      await g(() => { window.__gw.game.skipIntro(); window.__if.runOut(1 / 60); });
      await settle(600);
    } else {
      check(a0.intro.active && a0.intro.hold && a0.intro.layers === 0, 'intro:start: the cue is on and the title music has been stopped', a0.intro);
      await wait(500);
      const a1 = await g(() => { const c = window.__gw; window.__if.step(1, 1 / 600); return { rms: c.audio.rms(), mood: c.audio.getMood(), i: c.debug.audioIntro() }; });
      check(a1.mood === null, 'the title mood is out (0.3 s after the start)', a1.mood);
      check(a1.rms > 0.0005, `the cue sounds (rms ${a1.rms.toFixed(4)})`, a1);
      // master at 0: silence at the output
      await g(() => { const c = window.__gw; c.state.meta.settings.master = 0; c.audio.applySettings(); });
      await wait(600);
      const a2 = await g(() => window.__gw.audio.rms());
      check(a2 < 0.0005, `with the master at 0 the cue is silent (rms ${a2.toFixed(5)})`);
      // the music slider at 0, the master still at 0 while the cavern reverb's tail (3.5 s) rings out unheard; then the master up
      await g(() => { const c = window.__gw; c.state.meta.settings.music = 0; c.audio.applySettings(); window.__if.step(2, 1 / 600); });
      await wait(4000);
      await g(() => { const c = window.__gw; c.state.meta.settings.master = 0.8; c.audio.applySettings(); window.__if.step(2, 1 / 600); });
      await wait(500);
      const a3 = await g(() => { window.__if.step(1, 1 / 600); return window.__gw.audio.rms(); });
      check(a3 < 0.001, `with the music slider at 0 the cue is silent too (rms ${a3.toFixed(5)})`);
      await g(() => { const c = window.__gw; c.state.meta.settings.music = 0.6; c.audio.applySettings(); window.__if.step(2, 1 / 600); });
      // the marks, in order, as the film's clock crosses them
      await g(() => window.__if.runTo(16.9));
      const cueLog = await g(() => { const l = window.__gw.debug.audioLog(240); let i = l.length - 1; while (i >= 0 && !(l[i].name === 'intro_cue' && l[i].why === 'start')) i--; return l.slice(Math.max(0, i)); });
      const marks = cueLog.filter((e) => e.name === 'intro_cue').map((e) => e.why);
      check(JSON.stringify(marks) === JSON.stringify(['start', 'drone', 'bell', 'glass', 'ping', 'glass:off', 'fallBend', 'fallBend:off', 'impact', 'drone:off', 'deep', 'ember', 'groan', 'deep:off', 'spark', 'flame', 'harp:note0', 'harp:note1', 'harp:note2']), 'audioLog: intro_cue and its marks in order', marks);
      const sfx = cueLog.map((e) => e.name).filter((n) => n === 'ember_swell' || n === 'flame_catch');
      check(sfx.join() === 'ember_swell,flame_catch', 'ember_swell and flame_catch played at their marks', sfx);
      // a skip in the last second: the bus ramps to 0 within 0.3 s, read back from the gain
      const lv0 = await g(() => window.__gw.debug.audioIntro().level);
      await page.keyboard.press('Enter');
      await wait(330);
      const lv1 = await g(() => { window.__if.step(1, 1 / 600); return window.__gw.debug.audioIntro(); });
      check(lv0 > 1 && (lv1.level === null || lv1.level < 0.02), `a skip ramps the cue's bus to 0 within 0.3 s (${lv0} → ${lv1.level})`, lv1);
      await g(() => window.__if.runOut(1 / 60));
      await settle(700);
      const a4 = await g(() => { const c = window.__gw; window.__if.step(20, 1 / 30); return { mood: c.audio.getMood(), i: c.debug.audioIntro(), log: c.debug.audioLog(40).map((e) => e.name) }; });
      check(a4.mood === 'calm' && !a4.i.active && !a4.i.hold, 'after the hand-off the lake\'s calm bed plays and the cue is released', a4);
      check(!a4.log.includes('descend') && !a4.log.includes('setout'), 'no sting at the hand-off', a4.log);
    }
  }

  // ================================================================== the real clock: 18 s on performance.now()
  if (want('real')) {
    step('real');
    await freshSave();
    await g(() => {
      const T = window.__if, c = window.__gw, maxDt = c.data.INTRO.clock.maxDt;
      T.clear(); T.drawing(false); T.release(); T.rafN = 0; T.stopCount = false; T.lost = 0; T.slow = 0; T.worst = 0; T.clamped = 0;
      // every real frame while the film plays: how long it took, what the film's clamped clock used of it, and what it gave up
      let last = 0;
      const tick = (ts) => {
        if (T.stopCount) return;
        if (last && (c.intro.isActive() || T.wasOn)) { const dt = (ts - last) / 1000; T.rafN++; T.worst = Math.max(T.worst, dt); T.clamped += Math.min(dt, maxDt); if (dt > maxDt) { T.lost += dt - maxDt; T.slow++; } }
        T.wasOn = c.intro.isActive(); last = ts;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const pressed = await clickTitle('Begin');
    try { await page.waitForFunction(() => window.__if.ev.some((x) => x.e === 'intro:done'), null, { timeout: 200000, polling: 250 }); } catch (e) {
      const d = await g(() => { const c = window.__gw, T = window.__if; return { flow: c.flow, d: c.intro.state, frames: T.rafN, held: T.held ? T.held.length : null, ev: T.ev.map((x) => x.e), worst: T.worst, lost: T.lost, clock: T.clock, offset: T.offset, now: performance.now() }; });
      check(false, 'the film ends on the real clock (the valve: 100 frames at the worst)', { pressed, ...d });
      await g(() => { window.__if.stopCount = true; window.__if.drawing(true); window.__gw.debug.intro('stop'); });
    }
    const r = await g(() => { const T = window.__if; T.stopCount = true; T.drawing(true); const a = T.ev.find((x) => x.e === 'intro:start'), b = T.ev.find((x) => x.e === 'intro:done'); return a && b ? { wall: (b.wall - a.wall) / 1000, frames: T.rafN, lost: T.lost, slow: T.slow, worst: T.worst, clamped: T.clamped, p: b.p } : null; });
    await hold();
    if (r) {
    const fps = r.frames / Math.max(1, r.wall);
    log(`real clock (drawing off): intro:start → intro:done in ${r.wall.toFixed(2)} s on performance.now(); ${r.frames} frames (about ${fps.toFixed(0)} a second), ${r.slow} of them over 0.1 s (worst ${r.worst.toFixed(2)} s), on which the film's clamped clock gave up ${r.lost.toFixed(2)} s; the frames' clamped time adds up to ${r.clamped.toFixed(2)} s`);
    // A1: real elapsed time with a clamped per-frame dt. The frames' time, each clamped to 0.1 s, adds up to the film's 18 s; at
    // 10 fps or better no frame is clamped and that is 18 s of wall clock (this shared software-GL machine stalls for seconds)
    check(Math.abs(r.clamped - 18) <= 0.5, `the film runs on real elapsed time: its frames, each clamped to 0.1 s, add up to 18 s ± 0.5 (${r.clamped.toFixed(2)} s)`, r);
    check(r.wall >= 17.5, `never faster than real time (${r.wall.toFixed(2)} s on performance.now(); 18 s + ${r.lost.toFixed(2)} s given up on slow frames)`, r);
    if (r.slow === 0) check(Math.abs(r.wall - 18) <= 0.5, `with every frame under 0.1 s a full play lasts 18 s ± 0.5 (${r.wall.toFixed(2)} s)`, r);
    check(r.p.skipped === false && r.p.error === false, 'unskipped', r.p);
    { const s2 = await state(); if (s2.run) s2.run.phaseTime = 0; checkEnd(s2, 'the real-clock play (frames ran on after the hand-off)'); }
    }
    await settle(700);
  }

  // ================================================================== a tab closed mid-film leaves the save as it was
  if (want('reload')) {
    step('reload');
    await load('&intro=1', { fresh: true });
    await titleReady();
    const stored0 = (await state()).stored;
    await begin();
    await g(() => window.__if.runTo(9));
    // the page's own leave handlers run (visibilitychange and pagehide both ask for a save)
    await g(() => { window.dispatchEvent(new Event('pagehide')); });
    const mid = await state();
    check(mid.stored === stored0, 'a save asked for mid-film (pagehide) writes nothing', { before: stored0, after: mid.stored });
    await g(() => window.__if.release());
    await load('&intro=1');
    await titleReady();
    const s = await state();
    const words = await titleWords();
    check(s.stored === stored0, 'after a reload at 9 s the stored save is byte-identical to before Begin', { before: stored0, after: s.stored });
    check(s.d.pending === true && words[0] === 'Begin' && s.runs === 0 && !s.intro, 'the film is pending again: it simply plays again', { words, runs: s.runs, intro: s.intro });
  }

  // ================================================================== a replay from a title that shows another lake
  if (want('lake')) {
    step('lake');
    await load('&intro=1', { fresh: true });
    await g(() => { const c = window.__gw; c.state.meta.runs = 3; c.state.meta.deepestZone = 1; c.game.save(); });
    await load('&intro=1');
    await titleReady();
    const before = await state();
    const metaBefore = await g(() => JSON.stringify(window.__gw.state.meta));
    const lake = before.zone;
    check(lake && lake !== 'mossmere', 'this save\'s title shows another lake', lake);
    check(before.d.pending === false && (await titleWords())[0] === 'New Descent', 'a returning save: not pending');
    await g(() => { window.__if.step(1, 1 / 30, true); });
    await shoot('lake-title');
    const grade0 = await g(() => JSON.stringify(window.__gw.render.getGrade()));
    await g(() => { window.__if.clear(); window.__if.sim = 0; });
    check(!!(await clickTitle('Prologue', '.gw-m-title .gw-title-replay')), 'the Prologue word is there');
    let p = await probe(0.3, null);
    check(p.st.zone === lake, 'before the ink is full the title\'s lake is still on screen', p.st.zone);
    p = await probe(0.62, null);
    check(p.st.zone === 'mossmere' && p.dom.veil >= 0.9, 'under the full ink the film\'s lake is put in place', { zone: p.st.zone, veil: p.dom.veil });
    check(JSON.stringify(p.st.pos) === JSON.stringify(p.st.spawn), 'the raft is at that lake\'s spawn', { pos: p.st.pos, spawn: p.st.spawn });
    p = await probe(3.6, 'lake-film');
    check(p.st.zone === 'mossmere' && p.st.d.stage?.take === 'gate', 'the film plays on the Mossmere');
    await g(() => window.__if.runOut());
    let ev = await events();
    check(!ev.some((x) => x.e === 'zone:change' || x.e === 'run:start'), 'no zone:change for either swap', ev.map((x) => x.e));
    // the curtain (real time): ink closes, the lake comes back under it, ink opens on the title
    let s = await state();
    check(s.flow === 'intro' && s.zone === 'mossmere', 'at the end event the swap back waits for its curtain of ink', { flow: s.flow, zone: s.zone });
    for (let i = 0; i < 12; i++) { await wait(60); await g(() => window.__if.step(1, 1 / 30, true)); if ((await state()).flow === 'title') break; }
    await shoot('lake-curtain');
    for (let i = 0; i < 10; i++) { await wait(60); await g(() => window.__if.step(1, 1 / 30, true)); }
    s = await state();
    check(s.flow === 'title' && s.zone === lake, 'the title\'s own lake is back', { flow: s.flow, zone: s.zone });
    check(!s.introNode && !s.introOn && s.modal === 'title', 'the title is on screen, the film gone', { node: s.introNode, modal: s.modal });
    check((await g(() => JSON.stringify(window.__gw.state.meta))) === metaBefore && s.stored === before.stored, 'nothing was written (meta and the stored save identical)');
    check((await g(() => JSON.stringify(window.__gw.render.getGrade()))) === grade0, 'the title\'s grade is back');
    check(s.errors.length === 0, 'no errors', s.errors);
    await shoot('lake-title-again');
    // skipped under ink, the lake comes back with the skip's own ink
    await titleReady();
    await g(() => { window.__if.clear(); window.__gw.game.replayIntro(); });
    await g(() => { const T = window.__if; T.runTo(5); window.__gw.game.skipIntro(); T.runOut(1 / 60); });
    s = await state();
    check(s.flow === 'title' && s.zone === lake, 'a replay skipped under the ink puts the lake back in the same frame', { flow: s.flow, zone: s.zone });
    await settle(600);
    s = await state();
    check(!s.introNode && s.stored === before.stored && s.errors.length === 0, 'and leaves nothing behind');
    // stopped from outside (the title's own toTitle / a wipe): the lake comes back too
    await titleReady();
    await g(() => { window.__gw.game.replayIntro(); const T = window.__if; T.runTo(7); window.__gw.debug.intro('stop'); T.step(3); });
    s = await state();
    check(s.flow === 'title' && s.zone === lake && !s.active && s.introCam === null && !s.introNode, 'a film stopped from outside gives the lake and the camera back', { flow: s.flow, zone: s.zone, node: s.introNode });
  }

  const dry = await g(() => { const T = window.__if; const d = T?.dry || 0; T?.release(); return d; });
  part = 'end';
  check(dry === 0, 'every synthetic frame ran the game\'s loop (none was stepped with no frame queued)', { dry });
  return { failures };
}
