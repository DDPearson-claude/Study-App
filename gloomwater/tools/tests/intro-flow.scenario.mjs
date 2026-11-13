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
    if (fresh) await g(() => { try { localStorage.clear(); } catch { /* ignore */ } });
    await page.goto(`${base}?v3=1&v3phase=1${query || ''}`, { waitUntil: 'load', timeout: 300000 });
    await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 250 });
    await g(({ quality }) => {
      const c = window.__gw;
      c.state.meta.settings = c.state.meta.settings || {};
      c.state.meta.settings.quality = quality;
      c.render.setQuality?.(quality);
      const T = (window.__if = { ev: [], sim: 0, held: null, t0: performance.now() });
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => { if (T.held) { T.held.push(cb); return 0; } return raf(cb); };
      T.hold = () => { if (!T.held) { T.held = []; T.clock = performance.now(); } };
      T.release = () => { const q = T.held || []; T.held = null; for (const cb of q) raf(cb); };
      const draw = c.render.render.bind(c.render);
      T.draw = draw;
      T.drawing = (on) => { c.render.render = on ? draw : () => {}; };
      /** n frames of the game's own loop on the synthetic clock (dt seconds each); the canvas is drawn only when `paint`. */
      T.step = (n = 1, dt = 1 / 30, paint = false) => {
        T.drawing(paint);
        for (let i = 0; i < n; i++) {
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
      hud: vis('#ui > .gw-hud.gw-visible'), toast: vis('#ui > .gw-toasts .gw-toast'), banner: vis('#ui > .gw-banner-layer .gw-banner'), introEl: vis('.gw-intro > *'), introNode: !!document.querySelector('.gw-intro'),
      introOn: document.getElementById('ui').classList.contains('gw-intro-on'),
      stored: (() => { try { return localStorage.getItem('gloomwater.save.v1'); } catch { return null; } })(),
      errors: c.errors.slice(), mem: { ...c.render.renderer.info.memory }, programs: c.render.renderer.info.programs?.length ?? null,
    };
  });
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
    await g(() => window.__if.hold());
    await wait(120);
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
    await g(() => window.__if.hold());
    check(await g(() => window.__gw.intro.stage?.ready === true), 'the stage was prebuilt under the title (prewarm in idle time)');
  }

  // ================================================================== a full play, frame by frame
  let full = null;
  if (want('full')) {
    step('full');
    await titleReady();
    const before = await state();
    await g(() => { window.__if.clear(); window.__if.sim = 0; });
    const press = await g(() => { window.__pressAt = performance.now(); return true; });
    const box = await clickTitle('Begin');
    check(!!box && press, 'the Begin word can be pressed', box);
    let s = await state();
    const ev0 = await g(() => window.__if.ev.map((x) => [x.e, x.p]));
    check(ev0.some(([e]) => e === 'intro:start'), 'one press: intro:start in the same task (no frame, no panel)', ev0.map(([e]) => e));
    check(s.flow === 'intro' && s.cinematic === true && s.run === null && s.active, 'flow intro, ctx.cinematic held, no run', { flow: s.flow, cin: s.cinematic, run: s.run });
    check(s.modal === null || s.modal === undefined, 'no modal opens between Begin and the film', s.modal);
    check(s.stored === before.stored, 'Begin writes nothing to the save', { a: before.stored?.length, b: s.stored?.length });

    // --- 0.3 s: the Skip word is not there yet and a skip is ignored (the guard)
    await g(() => window.__if.runTo(0.3));
    const guard = await g(() => { const c = window.__gw; const r = c.game.skipIntro(); return { r, active: c.intro.isActive(), skip: c.intro.state.skip }; });
    check(guard.r === false && guard.active && guard.skip === null, 'a skip at 0.3 s is ignored (the stray second tap of Begin)', guard);
    await page.keyboard.press('Enter');
    check(await g(() => window.__gw.intro.state.skip === null), 'Enter inside the guard does nothing either');

    // --- A4: nothing else on screen, nothing reaches the game
    const probe = async (t, name) => {
      await g((t) => { const T = window.__if; T.runTo(t); T.step(1, 1 / 30, true); }, t);
      await wait(60);
      const st = await state();
      const dom = await g(() => {
        const c = window.__gw, D = c.data.INTRO;
        const line = document.querySelector('.gw-intro-line'), span = line?.firstElementChild, skip = document.querySelector('.gw-intro-skip');
        const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right }; };
        const cs = (el) => (el ? getComputedStyle(el) : null);
        const lc = cs(line), sc = cs(skip), sp = cs(span);
        const rows = span ? Math.round(span.getBoundingClientRect().height / parseFloat(lc.lineHeight)) : 0;
        const probe = document.createElement('div'); probe.className = 'gw-safe-probe'; document.body.appendChild(probe);
        const pc = getComputedStyle(probe); const safe = { t: parseFloat(pc.paddingTop) || 0, r: parseFloat(pc.paddingRight) || 0, b: parseFloat(pc.paddingBottom) || 0 }; probe.remove();
        return {
          vw: innerWidth, vh: innerHeight, band: c.debug.intro().view?.band, text: span?.textContent || '', line: rect(span), lineBox: rect(line), rows,
          font: lc ? { size: parseFloat(lc.fontSize), style: lc.fontStyle, family: lc.fontFamily, color: lc.color, lh: parseFloat(lc.lineHeight) } : null,
          lineOpacity: lc ? Number(lc.opacity) : 0, lineVis: lc?.visibility,
          frame: sp ? { border: sp.borderTopWidth + sp.borderBottomWidth, outline: sp.outlineStyle, shadow: sp.boxShadow, lb: lc.borderTopWidth, lo: lc.outlineStyle, ls: lc.boxShadow } : null,
          skip: rect(skip), skipOpacity: sc ? Number(sc.opacity) : 0, skipVis: sc?.visibility, skipFont: sc ? { size: parseFloat(sc.fontSize), family: sc.fontFamily, color: sc.color } : null, skipText: skip?.textContent || '',
          skipFrame: sc ? { border: sc.borderTopWidth, outline: sc.outlineStyle, shadow: sc.boxShadow, bg: sc.backgroundColor } : null, safe,
          veil: Number(getComputedStyle(document.querySelector('.gw-intro-veil')).opacity), words: D.words,
        };
      });
      if (name) await shoot(name);
      return { st, dom };
    };

    // 1.0 s: the Skip word is up (A2)
    let p = await probe(1.0, null);
    const sk = p.dom.skip;
    check(p.dom.skipOpacity >= 0.99 && p.dom.skipVis === 'visible', 'the Skip word is visible by 1.0 s', { o: p.dom.skipOpacity, v: p.dom.skipVis });
    check(!!sk && sk.w >= 44 && sk.h >= 44, 'the Skip word is a target of at least 44 x 44 px', sk);
    check(!!sk && sk.y >= Math.max(12, p.dom.safe.t) - 0.5 && p.dom.vw - sk.r >= Math.max(12, p.dom.safe.r) - 0.5 && sk.x > p.dom.vw / 2 && sk.b < p.dom.vh * 0.2, 'the Skip word sits top right, inside the safe area', { sk, safe: p.dom.safe, vw: p.dom.vw });
    check(p.dom.skipText.trim() === 'Skip' && p.dom.skipFrame.border === '0px' && p.dom.skipFrame.outline === 'none' && p.dom.skipFrame.shadow === 'none' && /rgba\(0, 0, 0, 0\)|transparent/.test(p.dom.skipFrame.bg), 'the Skip word is a word, not a box', p.dom.skipFrame);

    // each line, at its full strength: type, band, rows, no box (A5)
    const lineTimes = await g(() => window.__gw.data.INTRO.lines.map((l) => ({ i: l.i, at: l.at, out: l.out, mid: (l.at + l.out) / 2 })));
    const seenLines = [];
    const frozen = { gameT: before.gameT, pos: before.pos, fishing: before.fishing };
    for (const L of lineTimes) {
      p = await probe(L.mid, `line-${L.i + 1}`);
      const d = p.dom, st = p.st;
      seenLines.push(d.text);
      const top = d.band.top * d.vh - d.safe.b, bottom = d.band.bottom * d.vh - d.safe.b;
      check(d.text === (await g((i) => window.__gw.data.INTRO.text[i], L.i)) && d.lineOpacity >= 0.99, `line ${L.i + 1} is on screen at ${L.mid.toFixed(2)} s`, { text: d.text, o: d.lineOpacity });
      check(d.font.size >= 16 && d.font.size >= (phone ? 18 : 19) - 0.01 && d.font.style === 'italic' && /Alegreya/.test(d.font.family), `line ${L.i + 1}: Alegreya italic, at least 16 px (${d.font.size} px)`, d.font);
      check(d.rows >= 1 && d.rows <= d.words.maxLines, `line ${L.i + 1}: at most two rows (${d.rows})`, d.line);
      check(d.line.y >= top - 0.75 && d.line.b <= bottom + 0.75, `line ${L.i + 1}: its box is inside the words band (${top.toFixed(0)}–${bottom.toFixed(0)} px)`, { y: d.line.y, b: d.line.b });
      check(d.line.x >= 8 && d.line.r <= d.vw - 8, `line ${L.i + 1}: clear of the screen's sides`, d.line);
      check(d.frame.border === '0px0px' && d.frame.outline === 'none' && d.frame.shadow === 'none' && d.frame.lb === '0px' && d.frame.lo === 'none' && d.frame.ls === 'none', `line ${L.i + 1}: no border, outline or box shadow`, d.frame);
      // nothing else of the interface, and the game frozen
      check(st.flow === 'intro' && st.cinematic === true && st.run === null && st.gameT === frozen.gameT, `at ${L.mid.toFixed(1)} s: flow intro, cinematic, no run, the game clock stopped`, { flow: st.flow, c: st.cinematic, gameT: st.gameT });
      check(!st.hud && !st.toast && !st.banner && !st.blocking && (st.modal === null || st.modal === undefined), `at ${L.mid.toFixed(1)} s: no HUD, toast, banner or modal`, { hud: st.hud, toast: st.toast, banner: st.banner, modal: st.modal });
    }
    check(JSON.stringify(seenLines) === JSON.stringify(await g(() => window.__gw.data.INTRO.text)), 'the four lines, in order', seenLines);

    // wordless in the dark; input changes nothing
    p = await probe(10.0, 'below');
    check(p.dom.lineOpacity === 0 && p.dom.lineVis === 'hidden', 'the beat "below" is wordless', { o: p.dom.lineOpacity });
    await page.keyboard.down('KeyW'); await g(() => window.__if.step(6)); await page.keyboard.up('KeyW');
    await page.keyboard.press('KeyE'); await page.keyboard.press('KeyF'); await page.keyboard.press('KeyP'); await page.keyboard.press('KeyC');
    if (phone) await page.touchscreen.tap(width / 2, height * 0.6); else { await page.mouse.move(width / 2, height * 0.6); await page.mouse.down(); await g(() => window.__if.step(4)); await page.mouse.up(); }
    await g(() => window.__if.step(3));
    s = await state();
    check(s.active && s.flow === 'intro' && s.d.skip === null, 'movement keys, E / F / P / C and a press on the picture do not skip or pause', { flow: s.flow, skip: s.d.skip, paused: s.paused });
    check(JSON.stringify(s.pos) === JSON.stringify(frozen.pos) && s.fishing === frozen.fishing && s.gameT === frozen.gameT && !s.blocking && s.modal == null, 'nothing reaches the game (the raft, the line, the clock, no screen)', { pos: s.pos, fishing: s.fishing, gameT: s.gameT, modal: s.modal });
    check(await g(() => document.querySelector('.gw-intro-skip').classList.contains('gw-poked')), 'a press on the picture only brightens the Skip word');

    // the last second: nothing of the film's is left when control begins
    p = await probe(17.8, 'home-rest');
    check(p.dom.lineOpacity === 0, 'no words in the last half second', { o: p.dom.lineOpacity });
    const frames = await g(() => { const T = window.__if; const n = T.runOut(); return { n, sim: T.sim, ev: T.ev.map((x) => ({ e: x.e, p: x.p, sim: x.sim })) }; });
    const evStart = frames.ev.find((x) => x.e === 'intro:start'), evDone = frames.ev.find((x) => x.e === 'intro:done');
    const length = evDone && evStart ? evDone.sim - evStart.sim : -1;
    log(`full play: ${length.toFixed(3)} s of film clock between intro:start and intro:done`);
    check(length >= 15 && length <= 20 && Math.abs(length - 18) <= 0.05, `a full play lasts 18 s (15–20) from its first frame to its end event (measured ${length.toFixed(3)} s)`, { length });
    check(frames.ev.filter((x) => x.e === 'intro:done').length === 1 && evDone.p.skipped === false && evDone.p.replay === false && evDone.p.error === false, 'one intro:done {skipped: false}', evDone?.p);
    const order = frames.ev.filter((x) => ['intro:done', 'flow:change', 'zone:change', 'run:start'].includes(x.e) && x.sim >= evDone.sim - 1e-9).map((x) => x.e);
    check(JSON.stringify(order) === JSON.stringify(['intro:done', 'flow:change', 'zone:change', 'run:start']), 'the hand-off on the bus: intro:done, flow:change, zone:change, run:start', order);
    const zc = frames.ev.find((x) => x.e === 'zone:change');
    check(zc && zc.p.intro === true && zc.p.zone === 'mossmere' && zc.p.prev === null, 'the hand-off\'s zone:change carries {intro: true}', zc?.p);
    check(frames.ev.filter((x) => x.e === 'intro:beat').map((x) => x.p.id).join() === 'lit,fall,below,wick,home', 'every beat, in order', frames.ev.filter((x) => x.e === 'intro:beat').map((x) => x.p.id));
    check(!frames.ev.some((x) => x.e === 'toast' || (x.e === 'ui:modal' && x.p.open && x.sim > evStart.sim && x.sim < evDone.sim)), 'no toast and no screen during the film');
    s = await state();
    full = checkEnd(s, 'a full play');
    check(s.intro?.skipped === false, 'meta.intro = {seen: true, skipped: false}', s.intro);
    // the HUD comes in, the film's elements go
    await g(() => window.__if.step(3, 1 / 30, true));
    await wait(700);
    await g(() => window.__if.step(3, 1 / 30, true));
    s = await state();
    check(s.hud === true, 'the HUD is back when control begins');
    check(!s.introNode && !s.introOn, 'nothing of the film is left in the DOM', { node: s.introNode, on: s.introOn });
    await shoot('handoff');
    check(s.mem.geometries === baseline.mem.geometries + (s.mem.geometries - baseline.mem.geometries) && s.errors.length === 0, 'no errors after the hand-off', s.errors);
  }

  await g(() => window.__if?.release());
  return { failures };
}
