// The seam between the opening cut scene and the catch show, end to end in the browser (docs/v3/intro/SPEC.md §5, §7;
// docs/v3/show/SPEC.md §2.6, §2.9). Both drive render's camera (the film's pose over the rig, the show's fitted lens over the
// rig), both take the interface off the picture and both hold ctx.cinematic; this scenario plays them one after the other, and
// once on top of each other, in one page.
//
//   node build.mjs --dev --out=tools/out/show-merge/dev.html
//   node tools/playtest.mjs --html=tools/out/show-merge/dev.html --shots=tools/out/show-merge/seam --script=tools/tests/intro-show-seam.scenario.mjs --width=960 --height=540
//   --only=film,catch,replay   a subset (`catch` and `replay` need the run the film hands over, so `film` always runs)
//   --skip                     skip the film after 2 s instead of playing it through
//
// film    a fresh save, v3 at phase 1 with the film's opt-in: Begin (a real click) plays "One Warm Light" to its hand-off. Every
//         frame: the rig is held in `sail`, no show weight is under the film, and while the film's pose has full weight the
//         lens stands exactly on it (place and fov). It ends in the First Outing with the camera given back.
// catch   the first fish of that run: cast, a forced bite, a clean strike, then the show from the fish breaking the surface to
//         its card. The phases come once and in order, the show's lens comes in over the play camera and is there for the
//         pause, the picture is clean until the card, the card is docked beside the picture on a wide screen and takes a
//         press, and closing it eases the lens back to play with no weight left.
// replay  the two on top of each other: a second catch, and with its card up (the show's lens fully in) the run is left for
//         the title and the film replayed at once (the title's Prologue). The film's lens must win from its first frame (place
//         and fov, with the show's weight still easing out under it), the show's weight must be gone long before the film
//         ends, and the film must leave nothing of either behind on the title.
//
// HOW TIME IS DRIVEN. Software GL draws 1–10 frames a second here, so nothing is judged on real-time playback: the page's
// requestAnimationFrame is held and the game's own frame callback is called on a synthetic clock, 30 frames a second, with
// the canvas drawn only where a frame is shot (the film) or small (the show). The cast itself runs on the page's own frames.
// Six frames go to --shots, with seam.json (every number read).
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchCached } from './show-seq.scenario.mjs';

const DT = 1 / 30;
const FOV_EPS = 0.0015;   // (render writes camera.fov only when it has moved by more than 0.001°)

/** In the page: the frame stepper, the per-frame camera trace and the event log. */
function install() {
  const c = window.__gw;
  const T = (window.__seam = { held: null, clock: 0, offset: 0, sim: 0, ev: [], trace: [], tracing: false });
  const raf = window.requestAnimationFrame.bind(window);
  // one monotonic frame clock: real time plus whatever the stepping ran ahead of it (main computes dt from these timestamps)
  window.requestAnimationFrame = (cb) => { if (T.held) { T.held.push(cb); return 0; } return raf((ts) => cb(Math.max(ts + T.offset, T.clock))); };
  T.hold = () => { if (!T.held) { T.held = []; T.clock = Math.max(T.clock, performance.now() + T.offset); } };
  T.release = () => { const q = T.held || []; T.held = null; T.offset = Math.max(T.offset, T.clock - performance.now()); for (const cb of q) raf((ts) => cb(Math.max(ts + T.offset, T.clock))); };
  const draw = c.render.render.bind(c.render);
  T.drawing = (on) => { c.render.render = on ? draw : () => {}; };
  const r4 = (x) => Math.round(x * 1e4) / 1e4;
  T.sample = () => {
    const cam = c.render.camera, ic = c.render.getIntroCamera?.() ?? null, dc = c.debug.camera?.() ?? {}, v = c.fishing?.view?.show;
    return { sim: r4(T.sim), flow: c.flow, film: c.intro?.isActive() ? r4(c.intro.state.t) : null, mode: dc.mode ?? null, cine: !!c.cinematic,
      pos: [cam.position.x, cam.position.y, cam.position.z], fov: cam.fov, rigFov: dc.cur?.fov ?? null,
      intro: ic ? { pos: ic.pos.slice(), fov: ic.fov, w: ic.w } : null,
      showW: dc.show ? dc.show.w : 0, showOn: !!dc.show?.on, showHold: !!dc.show?.hold, showFov: dc.show?.tgt?.fov ?? null,
      phase: v?.phase ?? null, state: c.fishing?.state ?? null, modal: c.debug.ui?.()?.openModal ?? null,
      hudHid: !!document.querySelector('#ui > .gw-hud')?.classList.contains('gw-showhide') };
  };
  /** n frames of the game's own loop on the synthetic clock; `until` (a name below) stops it early. Returns {n, hit}. */
  const STOP = {
    landing: () => c.fishing.state === 'landing',
    card: () => c.debug.ui?.()?.openModal === 'catch',
    pause: () => c.fishing.view?.show?.phase === 'pause',
    filmEnd: () => !c.intro.isActive(),
    noShow: () => !c.debug.camera?.()?.show,
  };
  T.step = (n = 1, dt = 1 / 30, paint = false, until = null) => {
    T.drawing(paint);
    let i = 0, hit = false;
    for (; i < n; i++) {
      if (!T.held || !T.held.length) { T.dry = (T.dry || 0) + 1; break; }   // (no frame queued: the scenario waits for one, see hold())
      T.clock += dt * 1000; T.sim += dt;
      const q = T.held; T.held = [];
      for (const cb of q) { try { cb(T.clock); } catch (e) { c.errors.push('frame: ' + (e?.message || e)); } }
      if (T.tracing) T.trace.push(T.sample());
      if (until && STOP[until]()) { hit = true; i++; break; }
    }
    T.drawing(true);
    return { n: i, hit };
  };
  /** Step until the film's clock reaches t (or the film ends). */
  T.filmTo = (t, dt = 1 / 30, max = 4000) => { let n = 0; while (c.intro.isActive() && c.intro.state.t < t - 1e-6 && n++ < max) T.step(1, dt, false); return c.intro.isActive() ? c.intro.state.t : null; };
  const WATCH = new Set(['intro:start', 'intro:skip', 'intro:done', 'flow:change', 'zone:change', 'run:start', 'run:end', 'fishing:landing', 'fishing:caught', 'fishing:show', 'fish:measured', 'fish:landed', 'card:stamp']);
  const emit = c.bus.emit.bind(c.bus);
  c.bus.emit = (e, p) => { if (WATCH.has(e)) T.ev.push({ e, phase: p?.phase ?? null, flow: p?.flow ?? null, intro: p?.intro ?? null, replay: p?.replay ?? null, skipped: p?.skipped ?? null, sim: r4(T.sim) }); return emit(e, p); };
}

export default async function (api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const only = typeof args.only === 'string' ? new Set(args.only.split(',')) : null;
  const want = (name) => !only || only.has(name);
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/show-merge/seam'));
  mkdirSync(shotsDir, { recursive: true });
  const notes = { width, height, parts: {} };
  let part = 'boot';
  const t0 = Date.now();
  const step = (s) => { part = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) return true;
    failures.push(`[${part}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const shoot = async (name) => {
    for (let a = 0; a < 3; a++) { try { await page.screenshot({ path: resolve(shotsDir, `${name}.png`), timeout: 240000 }); log('shot', `${name}.png`); return true; } catch (e) { log('shot retry', name, String(e?.message || e).split('\n')[0]); } }
    return false;
  };
  const errors = () => g(() => window.__gw.errors.slice());
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const lerp = (a, b, k) => a + (b - a) * k;

  // the game's own fonts where the cache or the network has them (else the fallbacks; nothing here measures type)
  await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
    const url = route.request().url();
    const buf = fetchCached(url);
    if (!buf) return route.abort();
    const ct = /googleapis/.test(url) ? 'text/css; charset=utf-8' : /\.woff2(\?|$)/.test(url) ? 'font/woff2' : 'application/octet-stream';
    return route.fulfill({ status: 200, body: buf, headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
  });

  // ------------------------------------------------------------------ a fresh save, v3 at phase 1, the film opted in
  step('boot (a fresh save, ?v3=1&v3phase=1&intro=1)');
  const base = page.url().split('?')[0];
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
  await g(() => { try { if (window.__gw?.game) window.__gw.game.save = () => {}; localStorage.clear(); } catch { /* ignore */ } });
  await page.goto(`${base}?v3=1&v3phase=1&intro=1`, { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 250 });
  await g(() => { const c = window.__gw; c.state.meta.settings = c.state.meta.settings || {}; c.state.meta.settings.quality = 'medium'; c.render.setQuality?.('medium'); });
  await g(install);
  const boot = await g(() => { const c = window.__gw; return { v3: c.data.V3_ENABLED, phase: c.data.V3_PHASE, intro: !!c.intro, pending: c.game.introPending?.(), show: !!c.data.AUTOFISH?.show, setShow: typeof c.render.setShowTarget, setIntro: typeof c.render.setIntroCamera,
    words: [...document.querySelectorAll('.gw-m-title .gw-title-menu .gw-tbtn')].map((b) => (b.querySelector(':scope > span')?.textContent || b.textContent).replace(/\s+/g, ' ').trim()) }; });
  log('boot', JSON.stringify(boot));
  notes.boot = boot;
  check(boot.v3 === true && boot.intro && boot.show, 'the page must be a v3 build with the film and the show', boot);
  check(boot.setShow === 'function' && boot.setIntro === 'function', 'render must offer both setShowTarget and setIntroCamera', boot);
  check(boot.pending === true && boot.words[0] === 'Begin', 'a fresh save\'s title must say Begin', boot);
  const hold = async () => { await g(() => window.__seam.hold()); await page.waitForFunction(() => window.__seam.held && window.__seam.held.length > 0, null, { timeout: 120000, polling: 50 }); };
  const release = () => g(() => window.__seam.release());
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});

  // ================================================================== the film, start to hand-off
  step('film: Begin, every frame to the hand-off');
  await page.waitForFunction(() => { const m = document.querySelector('.gw-m-title .gw-title-menu'); return !!m && Number(getComputedStyle(m).opacity) > 0.9; }, null, { timeout: 120000, polling: 200 });
  await page.waitForFunction(() => window.__gw.intro.stage?.ready === true, null, { timeout: 60000, polling: 200 }).catch(() => {});
  await hold();
  const box = await g(() => { const b = [...document.querySelectorAll('.gw-m-title .gw-tbtn')].find((x) => x.textContent.trim().startsWith('Begin')); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  if (box) await page.mouse.click(box.x, box.y);
  await page.mouse.move(4, height * 0.5);
  const started = await g(() => ({ flow: window.__gw.flow, active: window.__gw.intro.isActive(), cine: window.__gw.cinematic }));
  check(started.flow === 'intro' && started.active && started.cine === true, 'Begin must start the film (flow intro, ctx.cinematic held)', started);
  await g(() => { window.__seam.tracing = true; });
  const L = await g(() => window.__gw.data.INTRO.length);
  const skipAt = args.skip ? 2 : null;
  const filmShot = async (t, name) => {
    await g(([t, dt]) => { const T = window.__seam; T.filmTo(t, dt); T.step(1, 1 / 600, true); }, [t, DT]);
    await wait(80);
    await shoot(name);
  };
  if (skipAt === null) {
    await filmShot(3.6, 'seam-01-film-lit');
    await filmShot(16.0, 'seam-02-film-home');
  } else {
    await filmShot(skipAt, 'seam-01-film-lit');
    const sk = await g(() => window.__gw.game.skipIntro());
    check(sk === true, 'the film must take a skip after its guard');
  }
  // to the end (a skip's ink runs on the film's own clock too); then the first frames of play
  const end = await g(([dt]) => window.__seam.step(1200, dt, false, 'filmEnd'), [DT]);
  check(end.hit, 'the film must end by itself', end);
  await g(([dt]) => window.__seam.step(3, dt, false), [DT]);
  const film = await g(() => { const T = window.__seam; const tr = T.trace.slice(); T.trace.length = 0; return tr; });
  {
    const inFilm = film.filter((f) => f.flow === 'intro' && f.film !== null);
    const posed = inFilm.filter((f) => f.intro);
    const full = posed.filter((f) => f.intro.w === 1), part2 = posed.filter((f) => f.intro.w < 1);
    const worstPos = full.reduce((a, f) => Math.max(a, dist(f.pos, f.intro.pos)), 0);
    const worstFov = full.filter((f) => Number.isFinite(f.intro.fov)).reduce((a, f) => Math.max(a, Math.abs(f.fov - f.intro.fov)), 0);
    const worstBlend = part2.filter((f) => Number.isFinite(f.intro.fov) && f.rigFov !== null).reduce((a, f) => Math.max(a, Math.abs(f.fov - lerp(f.rigFov, f.intro.fov, f.intro.w))), 0);
    const modes = [...new Set(posed.map((f) => f.mode))], maxShowW = inFilm.reduce((a, f) => Math.max(a, f.showW), 0);
    const last = inFilm.at(-1), first = film.find((f) => f.flow === 'playing');
    const jump = last && first ? { pos: +dist(last.pos, first.pos).toFixed(4), fov: +Math.abs(last.fov - first.fov).toFixed(4) } : null;
    const r = { frames: inFilm.length, posed: posed.length, fullWeight: full.length, blending: part2.length, worstPos: +worstPos.toFixed(6), worstFov: +worstFov.toFixed(6), worstBlend: +worstBlend.toFixed(4), modes, maxShowW, jump, skipped: skipAt !== null };
    notes.parts.film = r;
    log('film', JSON.stringify(r));
    check(posed.length > 20 && full.length > 10, 'the film must hold the camera', r);
    check(worstPos < 1e-4, 'while the film\'s pose has full weight the lens must stand exactly on it', r);
    check(worstFov < FOV_EPS, 'while the film\'s pose has full weight the lens must have the film\'s fov', r);
    check(worstBlend < 0.05, 'the film\'s last take must ease its fov into the rig\'s', r);
    check(modes.length === 1 && modes[0] === 'sail', 'the rig under the film must be held in sail', r);
    check(maxShowW === 0, 'no show weight may be under the film of a fresh game', r);
    if (skipAt === null) check(!!jump && jump.pos < 0.5 && jump.fov < 1, 'the hand-off must not jump the lens', r);
  }
  await g(() => { window.__seam.step(2, 1 / 30, true); });
  await wait(700);   // (the view's own short fades, on the real clock)
  await g(() => { window.__seam.step(3, 1 / 30, true); });
  await wait(60);
  const handed = await g(() => {
    const c = window.__gw, r = c.state.run, ui = document.getElementById('ui'), hud = document.querySelector('#ui > .gw-hud');
    return { flow: c.flow, run: r ? { character: r.character, nightMode: r.nightMode, outing: r.outing, zone: r.zone } : null, runs: c.state.meta.runs, seen: c.state.meta.intro?.seen === true,
      introCam: c.render.getIntroCamera(), mode: c.render.getCameraMode(), show: c.debug.camera().show, cine: c.cinematic, fishing: c.fishing.state, inShow: c.fishing.inShow === true,
      introOn: ui.classList.contains('gw-intro-on'), hud: !!hud && getComputedStyle(hud).visibility !== 'hidden' && !hud.classList.contains('gw-showhide'), active: c.intro.isActive(), ev: window.__seam.ev.map((x) => x.e + (x.flow ? ':' + x.flow : '')), errors: c.errors.slice() };
  });
  notes.parts.handoff = handed;
  log('hand-off', JSON.stringify(handed));
  check(handed.flow === 'playing' && handed.run?.outing === 'first' && handed.run?.zone === 'mossmere' && handed.runs === 1 && handed.seen, 'the film must end in the First Outing', handed);
  check(handed.introCam === null && handed.mode === 'sail' && handed.show === null && handed.cine === false, 'the film must give the camera back whole (no pose, no show weight, ctx.cinematic off)', handed);
  check(!handed.introOn && handed.hud && handed.fishing === 'idle' && !handed.inShow, 'play must start with its interface and an idle line', handed);
  check(handed.errors.length === 0, 'no errors through the film', handed.errors);
  await shoot('seam-03-handoff-play');

  // ------------------------------------------------------------------ helpers for a catch
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 180) => { const f0 = await frameNo(), s0 = Date.now(); while (Date.now() - s0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(100); } return false; };
  const waitFor = async (fn, arg, timeoutS = 90, stepMs = 120) => { const s0 = Date.now(); while (Date.now() - s0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => ({ b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused, n: window.__gw.debug.ui?.()?.stack?.length || 0 }));
      if (!m.b && !m.p && !m.n) return;
      await g(() => { const c = window.__gw; const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
      await frames(2);
    }
  };
  const LOW = 0.34;
  /** Cast with the mouse, force the bite and a clean strike, jump the play to its end and step to T0 (the fish breaks the surface). */
  async function toT0(name, sp, z) {
    await release();
    await scale(LOW);
    await clearModals();
    await g(() => { const c = window.__gw; c.debug.god?.(true); c.debug.setOil?.(72); c.debug.setSatiety?.(80); c.debug.timeScale?.(1); });
    // the cast, with the mouse (a press the game does not take is looked at and tried again: a tip or a pick may open under it)
    let cast = false;
    for (let attempt = 0; attempt < 3 && !cast; attempt++) {
      await clearModals();
      await page.mouse.move(width / 2, height * 0.42);
      await page.mouse.down();
      const charging = await waitFor(() => window.__gw.fishing.state === 'charging', null, 12, 80);
      if (charging) await frames(5);
      await page.mouse.up();
      await page.mouse.move(2, height * 0.5);
      cast = charging && await waitFor(() => window.__gw.fishing.state === 'waiting', null, 90, 150);
      if (!cast) {
        const why = await g(([x, y]) => { const c = window.__gw, e = document.elementFromPoint(x, y), u = c.debug.ui?.() || {};
          return { state: c.fishing.state, flow: c.flow, paused: !!c.paused, blocking: !!c.ui.isBlocking?.(), modal: u.openModal ?? null, stack: u.stack ?? null, shop: !!c.ui.isShopOpen?.(), cine: !!c.cinematic, inShow: c.fishing.inShow === true,
            under: e ? `${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).split(' ').slice(0, 3).join('.')}` : null, merchant: c.actors.merchant?.present === true, held: !!window.__seam.held }; }, [width / 2, height * 0.42]);
        log(`${name}: the press was not taken (attempt ${attempt + 1})`, JSON.stringify(why));
        (notes.castRetries = notes.castRetries || []).push({ name, attempt, ...why });
        try { await g(() => window.__gw.fishing.cancel?.('debug')); } catch { /* optional */ }
        await wait(600);
      }
    }
    if (!cast) { check(false, `${name}: the cast never settled`, await g(() => window.__gw.fishing.state)); return null; }
    await frames(3);
    await g(([s, zz]) => { const c = window.__gw; c.debug.fishOutcome('land'); c.debug.forceBite({ speciesId: s, z: zz, wait: 0.2 }); }, [sp, z]);
    if (!(await waitFor(() => window.__gw.fishing.state === 'bite', null, 30, 60))) { check(false, `${name}: no bite`); return null; }
    await g(() => window.__gw.debug.fishStrike('clean'));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 30);
    const info = await g(() => { const c = window.__gw, f = c.debug.fishing(), p = c.debug.fishPlay?.(); return { species: f.species, sizeClass: f.sizeClass, length: f.length, playEnd: p?.end ?? null }; });
    await g((e) => window.__gw.debug.fishPlayTo(e ? Math.max(0.5, 1 - 0.5 / e) : 0.95), info.playEnd);
    await hold();
    const r = await g(([dt]) => window.__seam.step(300, dt, true, 'landing'), [DT]);
    if (!r.hit) { check(false, `${name}: the play never reached the landing`, r); return null; }
    await g(() => { const T = window.__seam; T.trace.length = 0; T.tracing = true; });
    return info;
  }
  const paintFull = async () => { await scale(1); await g(() => window.__seam.step(1, 1 / 600, true)); await wait(150); };

  // ================================================================== the first catch of the run the film handed over
  if (want('catch') || want('replay')) {
    step('catch: the first fish of the First Outing, shown');
    const info = await toT0('catch', 'mossback_perch', -0.7);
    if (info) {
      log('catch', JSON.stringify(info));
      const toPause = await g(([dt]) => window.__seam.step(400, dt, true, 'pause'), [DT]);
      check(toPause.hit, 'the show must reach its pause', toPause);
      await g(([dt]) => window.__seam.step(4, dt, true), [DT]);   // (a few frames into the still)
      const still = await g(() => { const c = window.__gw, layers = ['world', 'hud', 'fx', 'banner-layer', 'toasts'].map((k) => document.querySelector(`#ui > .gw-${k}`)).filter(Boolean);
        return { phase: c.fishing.view?.show?.phase ?? null, cine: c.cinematic, inShow: c.fishing.inShow === true, hid: layers.length > 0 && layers.every((e) => e.classList.contains('gw-showhide')), hudOpacity: Number(getComputedStyle(document.querySelector('#ui > .gw-hud')).opacity),
          modal: c.debug.ui().openModal, introCam: c.render.getIntroCamera(), cam: c.debug.camera().show, fov: c.render.camera.fov, introNode: !!document.querySelector('.gw-intro'), introOn: document.getElementById('ui').classList.contains('gw-intro-on') }; });
      await paintFull();
      await shoot('seam-04-show-pause');
      await scale(LOW);
      check(still.phase === 'pause' && still.cine === true && still.inShow, 'the pause must hold ctx.cinematic', still);
      check(still.hid && still.modal === null, 'nothing of the interface may be over the picture in the pause', still);
      check(still.introCam === null && !still.introOn, 'nothing of the film may be up during a show', still);
      check(!!still.cam && still.cam.w >= 0.99 && still.cam.on === true, 'the show\'s lens must be fully in for the pause', still.cam);
      check(!!still.cam && Math.abs(still.fov - still.cam.tgt.fov) < 0.6, 'at the pause the lens must have the show\'s fov', { fov: still.fov, show: still.cam?.tgt?.fov });
      const toCard = await g(([dt]) => window.__seam.step(400, dt, true, 'card'), [DT]);
      check(toCard.hit, 'the card must open after the pause', toCard);
      await g(([dt]) => window.__seam.step(6, dt, true), [DT]);
      await wait(1500);   // (the card's own unfold, count and stamp run on the real clock)
      await g(([dt]) => window.__seam.step(6, dt, true), [DT]);
      await paintFull();
      await wait(600);
      const card = await g(() => {
        const c = window.__gw, pn = document.querySelector('#ui .gw-m-catch .gw-p-catch'), b = document.querySelector('#ui .gw-m-catch [data-action="release"]') || document.querySelector('#ui .gw-m-catch [data-action="keep"]');
        const r = pn?.getBoundingClientRect(), br = b?.getBoundingClientRect();
        const top = br ? document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2) : null;
        return { open: c.debug.ui().openModal === 'catch', side: !!pn?.classList.contains('gw-cc-side'), live: !!pn?.classList.contains('gw-cc-live'), rect: r ? { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } : null,
          btn: br ? { x: br.left + br.width / 2, y: br.top + br.height / 2, action: b.dataset.action, inView: br.bottom <= innerHeight + 1 && br.top >= 0 } : null, pressable: !!top && (top === b || b.contains(top)),
          cine: c.cinematic, phase: c.fishing.view?.show?.phase ?? null, cam: c.debug.camera().show, hudHid: !!document.querySelector('#ui > .gw-hud')?.classList.contains('gw-showhide'), vw: innerWidth, vh: innerHeight };
      });
      await shoot('seam-05-show-card');
      await scale(LOW);
      const wide = card.vw >= 700 && card.vw >= card.vh * 1.2 && card.vh >= 480;
      check(card.open && card.live && card.cine === false, 'the card must be the show\'s card, with ctx.cinematic released', card);
      check(card.side === wide, wide ? 'on a wide screen the show\'s card must be docked at the right' : 'on a narrow screen the card must not be docked', card);
      if (wide && card.rect) check(card.rect.x > card.vw * 0.4 && card.rect.x + card.rect.w <= card.vw + 1, 'the docked card must stand in the right of the frame', card.rect);
      check(!!card.btn && card.btn.inView && card.pressable, 'the card\'s action must be in view and take a press (nothing of the film\'s layer over it)', card);
      check(!!card.cam && card.cam.hold === true && card.cam.w >= 0.99, 'the show\'s lens must hold behind the card', card.cam);
      const tr = await g(() => { const T = window.__seam; const t = T.trace.slice(); T.trace.length = 0; return t; });
      const phases = tr.map((f) => f.phase).filter((p, i, a) => p && p !== a[i - 1]);
      const ws = tr.filter((f) => f.phase && f.phase !== 'card').map((f) => f.showW);
      const back = ws.reduce((a, w, i) => (i ? Math.max(a, ws[i - 1] - w) : a), 0);
      const r = { phases, frames: tr.length, wBack: +back.toFixed(4), introSeen: tr.some((f) => f.intro), hidAll: tr.filter((f) => f.phase && f.phase !== 'card').every((f) => f.hudHid), cineLift: tr.filter((f) => ['lift', 'hold', 'pause'].includes(f.phase)).every((f) => f.cine) };
      notes.parts.catch = { info, still, card, ...r };
      log('show', JSON.stringify(r));
      check(JSON.stringify(phases) === JSON.stringify(['reveal', 'lift', 'hold', 'pause', 'card']), 'the show\'s phases must come once and in order', phases);
      check(back < 0.01, 'the show\'s lens must never step back on its way in', r);
      check(!r.introSeen, 'the film\'s camera must never be set during a show', r);
      check(r.hidAll && r.cineLift, 'from the fish breaking the surface to the card the interface is off the picture and the lift holds ctx.cinematic', r);
      // close the card with a real click; the lens eases back to play
      if (card.btn) await page.mouse.click(card.btn.x, card.btn.y);
      await page.mouse.move(2, height * 0.5);
      await g(() => { window.__seam.tracing = true; });
      const out = await g(([dt]) => window.__seam.step(300, dt, true, 'noShow'), [DT]);
      await g(([dt]) => window.__seam.step(20, dt, true), [DT]);
      const otr = await g(() => { const T = window.__seam; const t = T.trace.slice(); T.trace.length = 0; T.tracing = false; return t; });
      const ows = otr.map((f) => f.showW), up = ows.reduce((a, w, i) => (i ? Math.max(a, w - ows[i - 1]) : a), 0);
      const after = await g(() => { const c = window.__gw, hud = document.querySelector('#ui > .gw-hud'); return { show: c.debug.camera().show, mode: c.render.getCameraMode(), modal: c.debug.ui().openModal, cine: c.cinematic, inShow: c.fishing.inShow === true, state: c.fishing.state,
        hud: !!hud && !hud.classList.contains('gw-showhide') && getComputedStyle(hud).visibility !== 'hidden', introCam: c.render.getIntroCamera(), errors: c.errors.slice() }; });
      notes.parts.catch.after = { ...after, outSteps: out.n, outSecs: +(out.n * DT).toFixed(2), wUp: +up.toFixed(4) };
      log('after the card', JSON.stringify(notes.parts.catch.after));
      check(out.hit && after.show === null, 'closing the card must ease the show\'s lens out and leave no weight', notes.parts.catch.after);
      check(up < 0.01, 'the lens must never step back in on its way out', notes.parts.catch.after);
      // (the first catch of a fresh game levels the flame: the banked pick opens once the card has closed; it is taken below)
      check(after.modal !== 'catch' && after.cine === false && !after.inShow && after.hud && after.introCam === null, 'play must be whole again after the card', after);
      check(['sail', 'fish', 'night'].includes(after.mode), 'the rig must be back in a play mode', after);
      check(after.errors.length === 0, 'no errors through the show', after.errors);
      await release();
      await clearModals();
      await hold();
      await g(([dt]) => window.__seam.step(12, dt, true), [DT]);
      await wait(700);   // (the interface's own fades run on the real clock)
      await g(([dt]) => window.__seam.step(2, dt, true), [DT]);
      const play = await g(() => { const c = window.__gw, hud = document.querySelector('#ui > .gw-hud'), cs = hud ? getComputedStyle(hud) : null; return { flow: c.flow, modal: c.debug.ui().openModal, blocking: !!c.ui.isBlocking?.(), show: c.debug.camera().show, mode: c.render.getCameraMode(),
        hudClass: hud ? hud.className : null, hudOpacity: cs ? Number(cs.opacity) : null, hud: !!hud && cs.visibility !== 'hidden' && cs.display !== 'none' && !hud.classList.contains('gw-showhide') && Number(cs.opacity) > 0.5, kept: c.state.run?.creel?.length ?? null }; });
      notes.parts.catch.play = play;
      log('back in play', JSON.stringify(play));
      check(play.flow === 'playing' && play.modal === null && !play.blocking && play.show === null && play.hud, 'after the card (and the banked pick) the play frame is whole: its interface up, no lens weight', play);
      await paintFull();
      await shoot('seam-06-back-to-play');
      await scale(LOW);
    }
  }

  // ================================================================== the film replayed over a show's lens
  if (want('replay')) {
    step('replay: a second card up, the title, the film at once');
    const info = await toT0('replay', 'weeping_carp', 0.4);
    if (info) {
      const toCard = await g(([dt]) => window.__seam.step(600, dt, true, 'card'), [DT]);
      check(toCard.hit, 'the second show must reach its card', toCard);
      await g(([dt]) => window.__seam.step(8, dt, true), [DT]);
      const before = await g(() => ({ show: window.__gw.debug.camera().show, modal: window.__gw.debug.ui().openModal }));
      check(!!before.show && before.show.hold === true && before.show.w >= 0.99, 'the show\'s lens must be fully in behind the second card', before.show);
      // the title, and the film in the same breath (no frame between: the show's weight is still whole when the film starts)
      await g(() => { const T = window.__seam; T.trace.length = 0; T.tracing = true; T.ev.length = 0; });
      const went = await g(() => { const c = window.__gw; c.game.toTitle(); const flow = c.flow; const ok = c.game.replayIntro(); return { flow, ok, now: c.flow, active: c.intro.isActive() }; });
      check(went.flow === 'title' && went.ok === true && went.now === 'intro' && went.active, 'the title must replay the film', went);
      await scale(LOW);
      const ran = await g(([dt]) => window.__seam.step(1500, dt, false, 'filmEnd'), [DT]);
      check(ran.hit, 'the replayed film must end by itself', ran);
      await g(([dt]) => window.__seam.step(3, dt, false), [DT]);
      const tr = await g(() => { const T = window.__seam; const t = T.trace.slice(); T.trace.length = 0; T.tracing = false; return t; });
      const posed = tr.filter((f) => f.flow === 'intro' && f.intro), full = posed.filter((f) => f.intro.w === 1);
      const under = full.filter((f) => f.showW > 0.05);
      const worstPos = full.reduce((a, f) => Math.max(a, dist(f.pos, f.intro.pos)), 0);
      const fovOf = (set) => set.filter((f) => Number.isFinite(f.intro.fov)).reduce((a, f) => Math.max(a, Math.abs(f.fov - f.intro.fov)), 0);
      const lastW = posed.filter((f) => f.showW > 0).at(-1);
      const r = { frames: tr.length, posed: posed.length, fullWeight: full.length, underShow: under.length, maxShowW: under.reduce((a, f) => Math.max(a, f.showW), 0), worstPos: +worstPos.toFixed(6), worstFov: +fovOf(full).toFixed(6), worstFovUnderShow: +fovOf(under).toFixed(6),
        showFovThen: under[0]?.showFov ?? null, filmFovThen: under[0]?.intro.fov ?? null, showGoneAtFilm: lastW ? lastW.film : 0, modes: [...new Set(posed.map((f) => f.mode))], showHeld: posed.some((f) => f.showOn || f.showHold) };
      await g(() => { window.__seam.step(2, 1 / 30, true); });
      await wait(900);
      await g(() => { window.__seam.step(3, 1 / 30, true); });
      const end = await g(() => { const c = window.__gw; return { flow: c.flow, introCam: c.render.getIntroCamera(), show: c.debug.camera().show, cine: c.cinematic, active: c.intro.isActive(), title: c.debug.ui().openModal, introOn: document.getElementById('ui').classList.contains('gw-intro-on'),
        hid: !!document.querySelector('#ui > .gw-hud')?.classList.contains('gw-showhide'), ev: window.__seam.ev.map((x) => x.e + (x.flow ? ':' + x.flow : '')), errors: c.errors.slice() }; });
      notes.parts.replay = { info, went, ...r, end };
      log('replay', JSON.stringify(r));
      log('replay end', JSON.stringify(end));
      check(under.length >= 3 && r.maxShowW >= 0.3, 'the test must put a show\'s weight under the film (else it proves nothing)', r);
      check(r.worstPos < 1e-4, 'the film\'s pose must win over a show\'s lens: the camera stands exactly on it', r);
      check(r.worstFov < FOV_EPS && r.worstFovUnderShow < FOV_EPS, 'the film\'s fov must win over a show\'s lens', r);
      check(r.modes.length === 1 && r.modes[0] === 'sail' && !r.showHeld, 'under the film the rig is in sail and no show is on or held', r);
      check(r.showGoneAtFilm !== null && r.showGoneAtFilm < 6, 'the show\'s weight must be gone early in the film', r);
      check(end.flow === 'title' && end.introCam === null && end.show === null && end.cine === false && !end.active && !end.introOn && !end.hid, 'the replay must leave the title with nothing of the film or the show behind', end);
      check(end.errors.length === 0, 'no errors through the replay', end.errors);
    }
  }

  await release();
  await scale(1);
  notes.failures = failures.slice();
  notes.errors = await errors().catch(() => []);
  writeFileSync(resolve(shotsDir, 'seam.json'), JSON.stringify(notes, null, 1));
  log(failures.length ? `SEAM: ${failures.length} FAIL` : 'SEAM: ALL CHECKS PASS');
  return { failures };
}
