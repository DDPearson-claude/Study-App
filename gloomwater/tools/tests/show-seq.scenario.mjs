// The show's sequence in the browser (docs/v3/show/SPEC.md §4, §6.7; lane B's proof): for a Small and an Elder the whole catch
// from the fish breaking the surface (T0) to the card and back to play, on a deterministic 30 fps stepper (requestAnimationFrame
// is taken over; every frame is exactly 1/30 s of the game's real clock, so a slow software-GL machine measures what a fast one
// does). Checked: the phases in order and once (S7), the per-phase game time and T0 → card (S3), the pause and the clean frame
// (S2: nothing of the ui over the picture until the card), the camera's picture at the pause against the poses actors has (S1)
// and its continuity in and out (S5), then a hurried catch, a first-ever species that cannot be cut under its floor, a tap in
// the pause, a swarm window, a stuck show against the valve, an abort, and what is left after several cards (S8).
//
//   node build.mjs --dev --out=tools/out/show/dev.html
//   node tools/playtest.mjs --html=tools/out/show/dev.html --shots=tools/out/show/seq/desktop --script=tools/tests/show-seq.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/show/dev.html --shots=tools/out/show/seq/phone --script=tools/tests/show-seq.scenario.mjs --mobile
//   --only=small,elder,hurry,protected,pausetap,swarm,valve,abort,leak   a subset
//   --strip                 shoot a strip of each full catch (the camera coming in, the pause, the card opening, the card, back to play)
//   --unfold                with --strip: three more frames of the card unfolding from the fish (its animations held at 70 / 150 / 240 ms)
//   --cases=small:mossback_perch:-0.7,trophy:reedjaw_pike:2.4   extra full catches (name:species:z), each measured like `small`
//   --heading=1.2           turn the raft (rad) before casting · --character=taper
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const FONT_CACHE = resolve(here, '..', 'out', '.font-cache');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
function fetchCached(url) {
  const p = resolve(FONT_CACHE, createHash('sha1').update(url).digest('hex'));
  if (existsSync(p)) return readFileSync(p);
  try {
    const buf = execFileSync('curl', ['-sSfL', '-m', '40', '-A', UA, url], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
    mkdirSync(FONT_CACHE, { recursive: true }); writeFileSync(p, buf); return buf;
  } catch { return null; }
}
const STEP_MS = 1000 / 30;

/** In the page: the stepper, the per-frame trace and the frame metrics. */
function install() {
  const c = window.__gw;
  const raf = window.requestAnimationFrame.bind(window);
  const S = { on: false, q: [], now: null, step: 0, log: [], trace: [], tracing: false, taps: [] };
  window.__show = S;
  window.requestAnimationFrame = (cb) => { if (S.on) { S.q.push(cb); return 0; } return raf(cb); };
  const EVS = ['fishing:landing', 'fishing:caught', 'fishing:show', 'fish:measured', 'fish:landed', 'fish:action', 'card:count', 'card:stamp', 'show:beat', 'fishing:state'];
  for (const ev of EVS) c.bus.on(ev, (p) => S.log.push({ step: S.step, ev, phase: p?.phase ?? null, state: p?.state ?? null, kind: p?.kind ?? null, cls: p?.cls ?? null, pose: p?.pose ?? null,
    origin: p?.origin ?? null, isNew: p?.isNew ?? null, records: Array.isArray(p?.records) ? p.records.map((r) => r?.kind) : null, cinematic: !!c.cinematic, uid: p?.uid ?? p?.fish?.uid ?? null }));
  const uiCount = () => {
    // everything the ui draws over the picture: visible leaf elements of #ui (text, glyphs, canvases, gauges), dimmed ones included
    const W = innerWidth, H = innerHeight;
    let ui = 0, words = 0;
    for (const e of document.querySelectorAll('#ui *')) {
      if (e.children.length && !/^(svg|canvas|button)$/i.test(e.tagName)) continue;
      if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
      const r = e.getBoundingClientRect();
      if (r.width * r.height < 16 || r.bottom <= 0 || r.right <= 0 || r.top >= H || r.left >= W) continue;
      let op = 1, shown = true;
      for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') { shown = false; break; } op *= +cs.opacity; }
      if (!shown || op < 0.05) continue;
      const txt = e.textContent.replace(/\s+/g, ' ').trim();
      if (txt || /^(svg|canvas|img|i|b)$/i.test(e.tagName)) ui++;
      if (txt && !e.children.length) words += txt.split(' ').filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
    }
    return { ui, words };
  };
  const sample = () => {
    const v = c.fishing?.view?.show, cam = c.render.camera;
    const wp = c.actors.getWickPos?.() || { x: 0, y: 0, z: 0 };
    const row = { step: S.step, phase: v?.phase ?? null, poseT: v?.poseT ?? null, cine: !!c.cinematic, state: c.fishing?.state, modal: c.debug.ui?.()?.openModal ?? null,
      x: cam.position.x, y: cam.position.y, z: cam.position.z, fov: cam.fov, w: c.debug.camera?.()?.show?.w ?? 0, wx: wp.x, wy: wp.y, wz: wp.z };
    if (S.uiEvery && S.step % S.uiEvery === 0) Object.assign(row, uiCount());
    S.trace.push(row);
  };
  S.begin = () => { S.on = true; S.now = null; };
  /** One frame of exactly `ms` of the game's real clock, run inside a real animation frame (so it is composited). */
  S.frame = (ms) => new Promise((res) => raf(() => {
    const q = S.q; S.q = [];
    S.now = (S.now ?? performance.now()) + ms;
    for (const cb of q) { try { cb(S.now); } catch (e) { (c.errors || []).push(String(e)); } }
    S.step++;
    if (S.tracing) sample();
    res(S.step);
  }));
  const stopHit = (stopOn) => (stopOn === 'landing' ? c.fishing.state === 'landing' : stopOn === 'card' ? c.debug.ui?.()?.openModal === 'catch'
    : stopOn === 'noshow' ? !c.fishing.view?.show : stopOn === 'pause' ? c.fishing.view?.show?.phase === 'pause' : stopOn === 'hold' ? c.fishing.view?.show?.phase === 'hold' : false);
  /** Step until the stop condition or `max` frames; taps queued in S.taps ([{at: step, kind}]) fire before their frame. */
  S.run = async (max, ms, stopOn) => {
    for (let i = 0; i < max; i++) {
      while (S.taps.length && S.taps[0].at <= S.step) { const t = S.taps.shift(); S.log.push({ step: S.step, ev: 'tap', kind: t.kind }); t.fire(); }
      await S.frame(ms);
      if (stopOn && stopHit(stopOn)) return { step: S.step, hit: true };
    }
    return { step: S.step, hit: false };
  };
  S.end = () => { S.on = false; const q = S.q; S.q = []; S.now = null; for (const cb of q) raf(cb); };
  S.reset = () => { S.step = 0; S.log = []; S.trace = []; S.taps = []; };
  S.uiCount = uiCount;

  // ---- the picture: what the frame holds (the audit's metrics, for the show)
  const rectOf = (sel) => { const e = document.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return null; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null; };
  S.metrics = () => {
    const cam = c.render.camera, scene = c.render.scene, W = innerWidth, H = innerHeight;
    scene.updateMatrixWorld(true); cam.updateMatrixWorld(true);
    const head = c.actors.getHeadPos(), V3 = head.constructor;
    const px = (v) => { const p = v.clone().project(cam); return { x: (p.x * 0.5 + 0.5) * W, y: (1 - (p.y * 0.5 + 0.5)) * H, z: p.z }; };
    const r1 = (x) => Math.round(x * 10) / 10;
    const v = c.fishing.view?.show;
    const out = { step: S.step, state: c.fishing.state, phase: v?.phase ?? null, pose: v?.pose ?? null, actorsPose: c.actors.showPose ?? c.actors.measurePose ?? null, modal: c.debug.ui?.()?.openModal ?? null, cinematic: !!c.cinematic };
    const wick = scene.getObjectByName('wick'), wp = c.actors.getWickPos(), cp = cam.getWorldPosition(new V3());
    if (wick) {
      const f = new V3(0, 0, 1).transformDirection(wick.matrixWorld), d = cp.clone().sub(wp);
      let a = (Math.atan2(f.x, f.z) - Math.atan2(d.x, d.z)) * 180 / Math.PI; a = ((a + 540) % 360) - 180;
      out.wickOffLens = Math.round(a);
      const hp = px(head), fp = px(wp);
      out.head = { x: Math.round(hp.x), y: Math.round(hp.y) };
      out.wickPx = Math.round(Math.abs(fp.y - hp.y));
      out.wickPct = Math.round(100 * Math.abs(fp.y - hp.y) / H);
      out.headInFrame = hp.z < 1 && hp.x > 0 && hp.x < W && hp.y > 0 && hp.y < H;
      out.feetInFrame = fp.z < 1 && fp.x > 0 && fp.x < W && fp.y > 0 && fp.y < H;
      out.camDist = r1(cp.distanceTo(head));
    }
    out.fov = r1(cam.fov); out.camY = r1(cp.y);
    let box = null, fishDist = null, noseTail = null;
    for (const name of ['catchHolder', 'holdAnchor', 'fishing-fish']) {
      const holder = scene.getObjectByName(name);
      if (!holder || box) continue;
      holder.traverse((o) => {
        if (!o.isMesh || !o.geometry) return;
        for (let n = o; n && n !== scene; n = n.parent) if (n.visible === false) return;
        if (o.userData?.noReflect === true && /outline/i.test(o.name || '')) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        const b = o.geometry.boundingBox; if (!b || !Number.isFinite(b.min.x)) return;
        for (let i = 0; i < 8; i++) {
          const q = new V3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(o.matrixWorld);
          const p = px(q); if (p.z >= 1) continue;
          box = box || { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
          box.x0 = Math.min(box.x0, p.x); box.y0 = Math.min(box.y0, p.y); box.x1 = Math.max(box.x1, p.x); box.y1 = Math.max(box.y1, p.y);
        }
        if (fishDist === null) {
          fishDist = r1(cp.distanceTo(o.getWorldPosition(new V3())));
          const ax = new V3(0, 0, 1).transformDirection(o.matrixWorld), view = o.getWorldPosition(new V3()).sub(cp).normalize();
          noseTail = Math.round(90 - Math.acos(Math.min(1, Math.abs(ax.dot(view)))) * 180 / Math.PI);
        }
      });
    }
    if (box) {
      const fr = { x: box.x0, y: box.y0, w: box.x1 - box.x0, h: box.y1 - box.y0 };
      const on = { w: Math.min(W, fr.x + fr.w) - Math.max(0, fr.x), h: Math.min(H, fr.y + fr.h) - Math.max(0, fr.y) };
      const edge = Math.min(fr.x / W, fr.y / H, (W - fr.x - fr.w) / W, (H - fr.y - fr.h) / H);
      out.fish = { x: Math.round(fr.x), y: Math.round(fr.y), w: Math.round(fr.w), h: Math.round(fr.h), wPct: Math.round(100 * fr.w / W), hPct: Math.round(100 * fr.h / H),
        inFrame: Math.round(100 * Math.max(0, on.w) * Math.max(0, on.h) / Math.max(1, fr.w * fr.h)), clear: Math.round(edge * 1000) / 10, dist: fishDist, endOn: noseTail,
        cx: Math.round(fr.x + fr.w / 2), cy: Math.round(fr.y + fr.h / 2) };
      const card = rectOf('#ui .gw-m-catch .gw-p-catch');
      out.card = card && { x: Math.round(card.x), y: Math.round(card.y), w: Math.round(card.w), h: Math.round(card.h) };
    } else out.fish = null;
    // the flame's core and the kept points actors names, in the frame (−1..1; inside the safe area when ≤ 1 − 2·margin)
    try {
      const f = c.actors.getShowFocus?.();
      if (f?.keep) {
        const keys = c.debug.camera?.()?.show?.row?.keep || ['fish', 'head', 'flame'];   // (the points the pose's row keeps)
        const all = Object.entries(f.keep).filter(([k]) => keys.includes(k)).flatMap(([k, g]) => g.map((p) => ({ k, p })));
        const nd = all.map(({ k, p }) => { const q = p.clone().project(cam); return { k, x: q.x, y: q.y }; });
        out.keepMax = { x: r1(Math.max(...nd.map((q) => Math.abs(q.x))) * 100) / 100, y: r1(Math.max(...nd.map((q) => Math.abs(q.y))) * 100) / 100, n: nd.length };
        const fl = f.head?.flame ? f.head.flame.clone().project(cam) : null;
        out.flameInFrame = fl ? Math.abs(fl.x) < 1 && Math.abs(fl.y) < 1 : null;
      }
    } catch { /* optional */ }
    Object.assign(out, uiCount());
    try { const I = c.render.renderer.info; out.gl = { calls: I.render.calls, tris: I.render.triangles, geo: I.memory.geometries, tex: I.memory.textures, prog: I.programs?.length ?? null }; } catch { out.gl = null; }
    out.cam = c.debug.camera?.()?.show ?? null;
    return out;
  };
  return true;
}

export default async function (api) {
  const { page, wait, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const check = (cond, msg, extra) => { if (cond) { log('ok  ', msg); return true; } failures.push(`${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`); log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : ''); return false; };
  const only = args?.only ? String(args.only).toLowerCase().split(',') : null;
  const want = (n) => !only || only.includes(n);
  const strip = !!args.strip;
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/show/seq/desktop'));
  mkdirSync(shotsDir, { recursive: true });
  const notesPath = resolve(shotsDir, 'seq.json');
  const notes = existsSync(notesPath) && only ? JSON.parse(readFileSync(notesPath, 'utf8')) : {};
  const phone = api.width < 700;

  await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
    const url = route.request().url();
    const buf = fetchCached(url);
    if (!buf) return route.abort();
    const ct = /googleapis/.test(url) ? 'text/css; charset=utf-8' : /\.woff2(\?|$)/.test(url) ? 'font/woff2' : 'application/octet-stream';
    return route.fulfill({ status: 200, body: buf, headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
  });
  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub'), null, { timeout: 300000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub') && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  await g(async () => { await document.fonts.ready; });
  // a returning player with the tested species already in the Journal, at a best no test fish beats, but the eel (the first-ever catch)
  const KNOWN = ['mossback_perch', 'weeping_carp', 'reedjaw_pike', 'belled_matriarch', 'quayling', 'dusk_minnow', 'velvet_ray', 'candlefin_koi'];
  await g((known) => {
    const c = window.__gw, m = c.state.meta;
    m.runs = 3; m.deaths = 3; m.bestDay = 3;
    if (m.firstEvening) m.firstEvening.done = true;
    try { c.debug.firstEvening?.('done'); } catch { /* optional */ }
    m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) m.seenTips[t.id] = true;
    m.journal = m.journal || {};
    const PB = { mossback_perch: 46, weeping_carp: 88, reedjaw_pike: 196 };   // a best no test fish beats (but near enough for the card's ruler)
    for (const id of known) m.journal[id] = { caught: 4, biggest: 99, pbLength: PB[id] || 900, seals: { prize: true, trophy: true, elder: true } };
    c.game.save?.();
  }, KNOWN);
  if (await g(() => window.__gw.flow !== 'title')) { await g(() => window.__gw.game.toTitle?.() ?? window.__gw.game.quitToTitle?.()); await wait(1500); }
  await page.mouse.move(2, 200);
  await g(() => { try { window.__gw.render.setQuality?.('medium'); } catch { /* optional */ } });
  await g(install);
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 180) => { const f0 = await frameNo(), t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(100); } return false; };
  const waitFor = async (fn, arg, timeoutS = 90, stepMs = 120) => { const t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => ({ b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused, n: window.__gw.debug.ui?.()?.stack?.length || 0 }));
      if (!m.b && !m.p && !m.n) return;
      await g(() => { const c = window.__gw; const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
      await frames(2);
    }
  };
  const pin = () => g(() => { const c = window.__gw; c.debug.god?.(true); c.debug.setOil(72); c.debug.setSatiety(80); });
  const LOW = 0.34;
  await scale(LOW);
  await clearModals();
  await g((ch) => window.__gw.game.startNewRun({ character: ch, nightMode: 'still' }), String(args.character || 'wick'));
  await waitFor(() => window.__gw.flow === 'playing', null, 180);
  await frames(4);
  await clearModals();
  await g(() => { const c = window.__gw; c.debug.mode?.('still'); c.state.run.day = 2; });
  await pin();
  await g(() => window.__gw.debug.setPhase('calm'));
  await frames(3);
  if (args.heading != null) { await g((h) => { const p = window.__gw.player; if (p && 'heading' in p) p.heading = h; try { window.__gw.debug.setHeading?.(h); } catch { /* optional */ } }, Number(args.heading)); await frames(3); }
  const SH = await g(() => { const A = window.__gw.data.AUTOFISH; return { show: A.show, plan: Object.fromEntries(window.__gw.data.SHOW_CLASSES.map((c) => [c, { n: window.__gw.data.showPlan(c), h: window.__gw.data.showPlan(c, { hurried: true }), hp: window.__gw.data.showPlan(c, { hurried: true, protected: true }), sw: window.__gw.data.showPlan(c, { swarm: true }) }])) }; });
  const sec = (steps) => +((steps * STEP_MS) / 1000).toFixed(3);

  /** Cast, force the bite and the strike, jump the play to its last half second and step to T0 (the fish breaks the surface). */
  async function toT0(name, sp, z, o = {}) {
    await clearModals();
    await g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } c.debug.timeScale(1); c.debug.showRate?.(1); c.debug.showSwarm?.(null); });
    await pin();
    await g((ph) => window.__gw.debug.setPhase(ph), o.phase || 'calm');
    await frames(o.phase ? 12 : 2);
    await clearModals();
    const W = api.width, H = api.height;
    await page.mouse.move(W / 2, H * 0.42);
    await page.mouse.down();
    await waitFor(() => window.__gw.fishing.state === 'charging', null, 30, 80);
    await frames(5);
    await page.mouse.up();
    await page.mouse.move(2, H * 0.5);
    await waitFor(() => window.__gw.fishing.state === 'waiting', null, 90, 150);
    await frames(3);
    await g(([s, zz]) => { const c = window.__gw; c.debug.fishOutcome('land'); c.debug.forceBite({ speciesId: s, z: zz, wait: 0.2 }); }, [sp, z]);
    if (!(await waitFor(() => window.__gw.fishing.state === 'bite', null, 30, 60))) { failures.push(`${name}: no bite for ${sp}`); return null; }
    await g(() => window.__gw.debug.fishStrike('clean'));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 30);
    const info = await g(() => { const c = window.__gw, f = c.debug.fishing(), p = c.debug.fishPlay?.(); return { species: f.species, sizeClass: f.sizeClass, ancient: f.ancient, length: f.length, playEnd: p?.end ?? null, legendary: c.data.SPECIES_BY_ID[f.species]?.rarity === 'legendary' }; });
    info.cls = info.legendary || info.ancient ? 'ancient' : info.sizeClass;
    if (o.swarm != null) await g((on) => window.__gw.debug.showSwarm(on), o.swarm);
    if (o.rate != null) await g((k) => window.__gw.debug.showRate(k), o.rate);
    await g((end) => window.__gw.debug.fishPlayTo(end ? Math.max(0.5, 1 - 0.5 / end) : 0.95), info.playEnd);
    await g((every) => { const S = window.__show; S.reset(); S.uiEvery = every; S.begin(); }, o.uiEvery ?? 0);
    const t0r = await g((ms) => window.__show.run(300, ms, 'landing'), STEP_MS);
    if (!t0r.hit) { failures.push(`${name}: the play never reached the landing`); await g(() => window.__show.end()); return null; }
    await g(() => { window.__show.tracing = true; });
    info.step0 = t0r.step;
    return info;
  }
  const shootTo = (rec, name) => async (label) => {
    await scale(1);
    await g((ms) => window.__show.run(1, ms, null), STEP_MS);   // (one frame at full size, so the shot is sharp)
    await wait(120);
    const m = await g(() => window.__show.metrics()).catch((e) => ({ error: String(e) }));
    const file = `${name}-${String((rec.frames = rec.frames || []).length + 1).padStart(2, '0')}-${label}.png`;
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) { try { await page.screenshot({ path: resolve(shotsDir, file), timeout: 240000 }); ok = true; } catch (e) { log('shot retry', file, String(e?.message || e).split('\n')[0]); } }
    rec.frames.push({ file, t: sec((m.step ?? 0) - rec.step0), ...m });
    log('shot', file, JSON.stringify({ t: rec.frames.at(-1).t, phase: m.phase, off: m.wickOffLens, fish: m.fish && `${m.fish.wPct}x${m.fish.hPct}% in ${m.fish.inFrame}% clear ${m.fish.clear}%`, wick: `${m.wickPct}%`, ui: m.ui, words: m.words, dist: m.camDist }));
    await scale(LOW);
    return m;
  };
  const finish = async (name, rec) => {
    rec.log = (await g(() => window.__show.log)).map((e) => ({ ...e, t: sec(e.step - rec.step0) }));
    await g(() => { window.__show.tracing = false; window.__show.end(); });
    notes[name] = rec;
    writeFileSync(notesPath, JSON.stringify(notes, null, 1));
    await g(() => { const c = window.__gw; c.debug.showRate?.(1); c.debug.showSwarm?.(null); c.debug.fishOutcome(null); });
  };
  const closeCard = () => g(() => { const b = document.querySelector('#ui .gw-m-catch [data-action="release"]') || document.querySelector('#ui .gw-m-catch [data-action="keep"]'); if (b) { b.click(); return true; } return false; });
  const ORDER = ['fishing:landing', 'fishing:caught', 'fishing:show:lift', 'fish:measured', 'fish:landed', 'fishing:show:hold', 'fishing:show:pause', 'fishing:show:card'];
  const orderOf = (lg) => lg.filter((e) => ['fishing:landing', 'fishing:caught', 'fishing:show', 'fish:measured', 'fish:landed'].includes(e.ev)).map((e) => (e.ev === 'fishing:show' ? `${e.ev}:${e.phase}` : e.ev));
  const at = (lg, key) => { const e = lg.find((x) => (x.ev === 'fishing:show' ? `${x.ev}:${x.phase}` : x.ev) === key); return e ? e.t : null; };

  // ================================================================ a full catch, measured (and shot with --strip)
  async function fullCatch(name, sp, z, o = {}) {
    const info = await toT0(name, sp, z, { uiEvery: 2, ...o });
    if (!info) return;
    const P = SH.plan[info.cls].n;
    const rec = { case: name, species: sp, z, cls: info.cls, lengthCm: info.length, plan: P, step0: info.step0, frames: [] };
    const shoot = shootTo(rec, name);
    const stepTo = async (tWant, stopOn = 'card') => {
      const cur = await g(() => window.__show.step);
      const n = info.step0 + Math.round(tWant * 1000 / STEP_MS) - cur - (strip ? 1 : 0);
      return n > 0 ? g(([n, ms, s]) => window.__show.run(n, ms, s), [n, STEP_MS, stopOn]) : { hit: false };
    };
    let carded = false;
    if (strip) {
      // the camera coming in (the reveal, the lift), the present, the hold, the pause (twice), then the card
      const marks = [['reveal', 0.05], ['reveal2', P.reveal * 0.6], ['lift', P.reveal + P.lift * 0.45], ['present', P.reveal + P.lift + 0.04], ['hold', P.reveal + P.lift + P.hold * 0.6],
        ['pause', P.reveal + P.lift + P.hold + 0.1], ['pause2', P.total - 0.12]];
      for (const [label, t] of marks) { const r = await stepTo(t); if (r.hit) { carded = true; break; } await shoot(label); }
    }
    // measure the pause (no tap): its frames are still and clean
    if (!carded) {
      const r = await g((ms) => window.__show.run(400, ms, 'pause'), STEP_MS);
      if (r.hit) { rec.atPause = await g(() => window.__show.metrics()); }
      const r2 = await g((ms) => window.__show.run(400, ms, 'card'), STEP_MS);
      carded = r2.hit;
    }
    if (!check(carded, `${name}: the card opens`)) { await finish(name, rec); return; }
    rec.tCard = sec((await g(() => window.__show.step)) - info.step0);
    if (strip) {
      // the unfold itself (the card's entrance runs on the wall clock): its animations held at three moments
      if (args.unfold) {
        for (const ms of [70, 150, 240]) {
          await g((ms) => { for (const a of document.getAnimations()) { const t = a.effect?.target; if (t?.closest?.('.gw-m-catch')) { a.pause(); a.currentTime = ms; } } }, ms);
          await wait(60); await shoot(`unfold-${ms}`);
        }
        await g(() => { for (const a of document.getAnimations()) if (a.playState === 'paused') a.play(); });
      }
      await g((ms) => window.__show.run(3, ms, null), STEP_MS); await wait(160); await shoot('card-opening');
      await g((ms) => window.__show.run(6, ms, null), STEP_MS); await wait(260); await shoot('card-count');
      await g((ms) => window.__show.run(24, ms, null), STEP_MS); await wait(1500); await shoot('card');
    } else { await g((ms) => window.__show.run(30, ms, null), STEP_MS); await wait(900); }
    rec.cardWords = await g(() => { const e = document.querySelector('#ui .gw-m-catch'); if (!e) return null; let n = 0; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) { const t = w.currentNode, s = t.nodeValue.replace(/\s+/g, ' ').trim(); if (!s) continue; let vis = true; for (let p = t.parentElement; p && p !== e; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden') { vis = false; break; } } if (vis) n += s.split(' ').filter((x) => /[\p{L}\p{N}]/u.test(x)).length; }
      return n; });
    rec.cardState = await g(() => { const p = document.querySelector('#ui .gw-m-catch .gw-p-catch'); return p ? { cls: p.className, hero: p.querySelector('.gw-cc-hero')?.textContent ?? null, knots: [...p.querySelectorAll('.gw-cc-knot')].map((k) => k.className), ox: p.style.getPropertyValue('--ox'), oy: p.style.getPropertyValue('--oy') } : null; });
    rec.behindCard = await g(() => { const c = window.__gw; return { showView: c.fishing.view.show?.phase ?? null, cine: !!c.cinematic, inShow: !!c.fishing.inShow, camW: c.debug.camera?.()?.show?.w ?? null, pose: c.actors.showPose ?? c.actors.measurePose ?? null }; });
    // close the card and follow the lens back to play (1.5 s)
    const stepClose = await g(() => window.__show.step);
    await closeCard();
    await g((ms) => window.__show.run(8, ms, null), STEP_MS);
    if (strip) await shoot('out');
    await g((ms) => window.__show.run(45, ms, null), STEP_MS);
    if (strip) await shoot('play');
    rec.after = await g(() => { const c = window.__gw; return { showView: c.fishing.view.show ?? null, cine: !!c.cinematic, state: c.fishing.state, camW: c.debug.camera?.()?.show?.w ?? 0, camShow: !!c.debug.camera?.()?.show, pose: c.actors.showPose ?? null, exit: c.debug.show?.()?.exit ?? null, hud: document.querySelector('#ui .gw-hud').classList.contains('gw-showhide') ? 0 : 1 }; });
    const trace = await g(() => window.__show.trace);
    await finish(name, rec);
    const lg = rec.log;
    // ---- S7: the order, once each
    const ord = orderOf(lg);
    check(JSON.stringify(ord) === JSON.stringify(ORDER), `${name}: landing → caught → show{lift} → measured → landed → show{hold} → {pause} → {card}, once each`, ord);
    const cineOn = trace.filter((r) => r.cine).map((r) => sec(r.step - info.step0));
    const tCaught = at(lg, 'fishing:caught'), tCardEv = at(lg, 'fishing:show:card');
    check(cineOn.length > 0 && Math.abs(cineOn[0] - tCaught) <= 0.04 && Math.abs(cineOn.at(-1) - tCardEv) <= 0.07 && !trace.some((r) => r.cine && (r.phase === 'reveal' || r.phase === 'card' || r.phase === null)),
      `${name}: ctx.cinematic exactly from fishing:caught (${tCaught} s) to the card (${tCardEv} s)`, { first: cineOn[0], last: cineOn.at(-1) });
    // ---- S3: the clock, per phase and in all
    const tHold = at(lg, 'fishing:show:hold'), tPause = at(lg, 'fishing:show:pause');
    const got = { reveal: tCaught, lift: +(tHold - tCaught).toFixed(3), hold: +(tPause - tHold).toFixed(3), pause: +(tCardEv - tPause).toFixed(3), total: tCardEv };
    rec.clock = got;
    check(Math.abs(got.reveal - P.reveal) <= 0.1 && Math.abs(got.lift - P.lift) <= 0.07 && Math.abs(got.hold - P.hold) <= 0.07 && Math.abs(got.pause - P.pause) <= 0.07,
      `${name}: per-phase game time reveal ${got.reveal} / lift ${got.lift} / hold ${got.hold} / pause ${got.pause} s (plan ${P.reveal} / ${P.lift} / ${P.hold} / ${P.pause})`, got);
    check(Math.abs(got.total - P.total) <= 0.15 && got.total <= SH.show.max[info.cls] + 1e-6, `${name}: T0 → card ${got.total} s (plan ${P.total} ± 0.15, never over ${SH.show.max[info.cls]})`);
    const cardModal = trace.find((r) => r.modal === 'catch');
    rec.tCardModal = cardModal ? sec(cardModal.step - info.step0) : null;
    // ---- S2: the pause, then the card; the clean frame
    check(got.pause >= SH.show.minPause - 0.035 && cardModal && sec(cardModal.step - info.step0) >= tPause + SH.show.minPause - 0.035, `${name}: a still pause of ${got.pause} s (≥ ${SH.show.minPause}), and only then the card (${rec.tCardModal} s)`);
    const dirty = trace.filter((r) => r.ui != null && sec(r.step - info.step0) >= 0.25 && r.step < (cardModal?.step ?? Infinity) && (r.ui > 0 || r.words > 0));
    check(dirty.length === 0, `${name}: nothing of the ui over the picture from T0 + 0.25 s until the card`, dirty.slice(0, 4).map((r) => ({ t: sec(r.step - info.step0), ui: r.ui, words: r.words, phase: r.phase })));
    check(rec.cardState && /gw-cc-live/.test(rec.cardState.cls) && /gw-cc-pressed/.test(rec.cardState.cls) && /\d/.test(rec.cardState.hero || '') && (phone || /gw-cc-unfold/.test(rec.cardState.cls)),
      `${name}: the card ${phone ? 'rises from the foot' : `unfolds from the fish (${rec.cardState?.ox}, ${rec.cardState?.oy} from the centre)`}; the length counted to ${rec.cardState?.hero}; the stamp pressed`, rec.cardState);
    check(lg.filter((e) => e.ev === 'card:count').length === 1 && lg.filter((e) => e.ev === 'card:stamp').length === 1, `${name}: the card's count and stamp fire once (the cord's ticks and the seal's sound)`);
    if (rec.cardWords != null) { log(`${name}: ${rec.cardWords} words on the card`); if (o.maxWords) check(rec.cardWords <= o.maxWords, `${name}: the card carries no more words than before (${rec.cardWords} ≤ ${o.maxWords})`); }
    check(rec.behindCard.showView === 'card' && !rec.behindCard.cine && !rec.behindCard.inShow && rec.behindCard.camW > 0.99, `${name}: behind the card the framing holds (view.show 'card', the world unfrozen)`, rec.behindCard);
    check(rec.after.showView === null && !rec.after.cine && rec.after.state === 'idle' && rec.after.camW < 0.02 && rec.after.pose === null && rec.after.hud > 0.5, `${name}: after the card: view.show null, the lens back at play, the Wick released, the HUD back`, rec.after);
    // ---- S1: the picture at the pause (against the poses actors has: the measuring stand-ins until lane A lands)
    const m = rec.atPause || rec.frames.find((f) => f.phase === 'pause');
    if (m) {
      rec.picture = { pose: m.pose, actorsPose: m.actorsPose, wickOffLens: m.wickOffLens, fish: m.fish, wickPct: m.wickPct, head: m.headInFrame, flame: m.flameInFrame, keepMax: m.keepMax, camDist: m.camDist, fov: m.fov, cam: m.cam, gl: m.gl };
      log(`${name}: at the pause`, JSON.stringify(rec.picture));
      const safe = 1 - 2 * (phone ? SH.show.camera.margin.portrait : SH.show.camera.margin.landscape);
      check(m.fish && m.fish.inFrame === 100 && m.headInFrame && m.flameInFrame !== false, `${name}: at the pause the whole fish, the wax head and the flame are in frame`, { fish: m.fish, head: m.headInFrame, flame: m.flameInFrame });
      // (the fit also keeps the fish's whole box, fins and all, and the flame's tip: the named points sit a little inside the edge)
      if (m.keepMax) check(m.keepMax.x <= safe + 0.03 && m.keepMax.y <= safe + 0.03 && Math.max(m.keepMax.x, m.keepMax.y) >= safe - 0.3, `${name}: the fit: every kept point inside the safe area, the frame no looser than it needs (${m.keepMax.x}, ${m.keepMax.y} of ${safe.toFixed(2)})`, m.keepMax);
      check(m.cam && m.cam.w > 0.999 && m.ui === 0 && m.words === 0, `${name}: the lens has arrived (w ${m.cam?.w}); 0 ui elements, 0 words`, { w: m.cam?.w, ui: m.ui, words: m.words });
    } else check(false, `${name}: no frame measured at the pause`);
    // ---- the still: through the pause the lens moves less than 2 % of its distance per second. Measured against the Wick on its
    // raft (the lens rides the swell with it: the PICTURE is still; the world's horizon moves by the raft's own bob)
    const pauseRows = trace.filter((r) => r.phase === 'pause');
    if (pauseRows.length > 3 && m) {
      let mv = 0, mvWorld = 0;
      for (let i = 1; i < pauseRows.length; i++) {
        const a = pauseRows[i], b = pauseRows[i - 1];
        mv = Math.max(mv, Math.hypot((a.x - a.wx) - (b.x - b.wx), (a.y - a.wy) - (b.y - b.wy), (a.z - a.wz) - (b.z - b.wz)) * 30);
        mvWorld = Math.max(mvWorld, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) * 30);
      }
      const lim = SH.show.camera.still * Math.max(0.5, m.fish?.dist ?? m.camDist);
      rec.still = { mps: +mv.toFixed(4), world: +mvWorld.toFixed(4), limit: +lim.toFixed(4) };
      check(mv <= lim * 1.05, `${name}: the pause is still (against the Wick the lens moves ${mv.toFixed(3)} m/s, limit ${lim.toFixed(3)}; in the world ${mvWorld.toFixed(3)} m/s with the raft's bob)`);
    }
    // ---- S5: no pop, from T0 until 1.5 s after the card closes
    let dMax = 0, ddMax = 0, fMax = 0, prev = null, prevD = null, worst = null, fastest = null;
    for (const r of trace) {
      if (prev) {
        const d = Math.hypot(r.x - prev.x, r.y - prev.y, r.z - prev.z), df = Math.abs(r.fov - prev.fov);
        if (prevD != null) { const dd = Math.abs(d - prevD); if (dd > ddMax) { ddMax = dd; worst = { t: sec(r.step - info.step0), phase: r.phase, d: +d.toFixed(3), was: +prevD.toFixed(3) }; } }
        if (d > dMax) { dMax = d; fastest = { t: sec(r.step - info.step0), phase: r.phase, w: +(+r.w).toFixed(3) }; }
        fMax = Math.max(fMax, df); prevD = d;
      }
      prev = r;
    }
    rec.continuity = { move: +dMax.toFixed(3), fastest, jerk: +ddMax.toFixed(3), fov: +fMax.toFixed(2), worst, frames: trace.length, until: sec(trace.at(-1).step - info.step0), closedAt: sec(stepClose - info.step0) };
    check(dMax <= 0.9 && ddMax <= 0.45 && fMax <= 1.5, `${name}: no pop in or out (lens ≤ ${dMax.toFixed(2)} m/frame, its step changes by ≤ ${ddMax.toFixed(2)} m, fov ≤ ${fMax.toFixed(2)}°/frame over ${trace.length} frames)`, rec.continuity);
    log(`${name}: ${sp} ${info.cls} ${info.length} cm · T0 → card ${got.total} s`);
    notes[name] = rec; writeFileSync(notesPath, JSON.stringify(notes, null, 1));
    await clearModals();
  }

  if (want('small')) await fullCatch('small', 'mossback_perch', -0.7, { maxWords: 23 });
  if (want('elder')) await fullCatch('elder', 'reedjaw_pike', 3.0);
  for (const c of String(args.cases || '').split(',').filter(Boolean)) { const [n, s, z] = c.split(':'); if (!only || only.includes(n)) await fullCatch(n, s, Number(z)); }

  // ================================================================ the rules of the clock: hurry, its floor, a tap in the pause, a swarm window, the valve, an abort
  /** T0 → the card with taps at given times after T0; returns the log (times from T0). */
  async function timed(name, sp, z, { taps = [], pointer = false, tapOn = null, ...o } = {}) {
    const info = await toT0(name, sp, z, o);
    if (!info) return null;
    const rec = { case: name, species: sp, cls: info.cls, step0: info.step0, lengthCm: info.length };
    if (taps.length) await g(([ts, s0, ms]) => { const c = window.__gw; for (const t of ts) window.__show.taps.push({ at: s0 + Math.round(t * 1000 / ms), kind: 'tap', fire: () => c.fishing.onPointerDown({ input: 'mouse' }) }); }, [taps, info.step0, STEP_MS]);
    if (tapOn) {
      // a real pointer press on the canvas (main's routing) the moment the show reaches a phase
      const r0 = await g(([ms, s]) => window.__show.run(400, ms, s), [STEP_MS, tapOn]);
      rec.tTap = sec(r0.step - info.step0);
      if (pointer) { await page.mouse.move(api.width * 0.5, api.height * 0.3); await page.mouse.down(); await page.mouse.up(); await page.mouse.move(2, api.height * 0.5); }
      else await g(() => window.__gw.fishing.hurryShow());
    }
    const r = await g(([ms, n]) => window.__show.run(n, ms, 'card'), [STEP_MS, o.maxFrames ?? 400]);
    rec.carded = r.hit; rec.tCardModal = sec(r.step - info.step0);
    rec.state = await g(() => ({ show: window.__gw.debug.show?.() ?? null, cine: !!window.__gw.cinematic }));
    await g((ms) => window.__show.run(4, ms, null), STEP_MS);
    await closeCard();
    await g((ms) => window.__show.run(24, ms, null), STEP_MS);
    await finish(name, rec);
    await clearModals();
    return rec;
  }
  if (want('hurry')) {
    const r = await timed('hurry', 'weeping_carp', 0.5, { taps: [0.1] });
    if (r) {
      const H = SH.plan[r.cls].h, tc = at(r.log, 'fishing:show:card');
      check(r.carded && Math.abs(tc - H.total) <= 0.15, `hurry: a tap at T0 + 0.1 s → the card at ${tc} s (plan ${H.total} ± 0.15; unhurried ${SH.plan[r.cls].n.total})`);
      check(Math.abs(at(r.log, 'fishing:caught') - H.reveal) <= 0.1, `hurry: the reveal is never cut (${at(r.log, 'fishing:caught')} s of ${H.reveal})`);
      check(JSON.stringify(orderOf(r.log)) === JSON.stringify(ORDER), 'hurry: the same events in the same order, once each', orderOf(r.log));
    }
  }
  if (want('protected')) {
    // the Gloam Eel is not in this save's Journal: a first-ever species; tapped at T0, its present still holds 0.8 s
    const r = await timed('protected', 'gloam_eel', 0.3, { taps: [0.1, 0.5, 0.9, 1.2] });
    if (r) {
      const HP = SH.plan[r.cls].hp, tm = at(r.log, 'fish:measured'), tc = at(r.log, 'fishing:show:card');
      const hold = r.log.find((e) => e.ev === 'fishing:show' && e.phase === 'hold');
      check(r.carded && hold?.isNew === true && tc - tm >= SH.show.hurry.protectedHold - 0.035, `protected: a first-ever species, tapped four times: ${(tc - tm).toFixed(2)} s from fish:measured to the card (≥ ${SH.show.hurry.protectedHold})`, { tm, tc, isNew: hold?.isNew });
      check(Math.abs(tc - HP.total) <= 0.15, `protected: the card at ${tc} s (plan ${HP.total} ± 0.15)`);
      check(JSON.stringify(orderOf(r.log)) === JSON.stringify(ORDER), 'protected: the same events in the same order, once each', orderOf(r.log));
    }
  }
  if (want('pausetap')) {
    const r = await timed('pausetap', 'weeping_carp', 0.5, { tapOn: 'pause', pointer: true });
    if (r) {
      const tc = at(r.log, 'fishing:show:card');
      check(r.carded && tc - r.tTap <= 0.1 + 1e-6, `pausetap: a press on the canvas in the pause (at ${r.tTap} s) → the card within 0.1 s (${(tc - r.tTap).toFixed(3)} s)`);
    }
  }
  if (want('swarm')) {
    const r = await timed('swarm', 'reedjaw_pike', 3.0, { swarm: true });
    if (r) {
      const SW = SH.plan[r.cls].sw, tc = at(r.log, 'fishing:show:card'), tr = at(r.log, 'fishing:caught');
      const sum = SH.show.swarm.lift + SH.show.swarm.hold + SH.show.swarm.pause;
      check(r.carded && Math.abs((tc - tr) - sum) <= 0.1, `swarm: in a swarm window an Elder's world is frozen ${(tc - tr).toFixed(2)} s after its reveal (${sum} ± 0.1; plan total ${SW.total})`);
      check(at(r.log, 'fishing:show:card') - at(r.log, 'fishing:show:pause') >= SH.show.minPause - 0.035, 'swarm: its pause is still a pause (≥ 0.6 s)');
    }
  }
  if (want('valve')) {
    // a stuck show (its clock at 2 %): the valve opens the card at 8 s of the real clock, the records written once
    const r = await timed('valve', 'weeping_carp', 0.5, { rate: 0.02, maxFrames: 330 });
    if (r) {
      const tc = at(r.log, 'fishing:show:card');
      check(r.carded && tc <= SH.show.valve + 0.2 && tc >= SH.show.valve - 0.2, `valve: a stuck show opens its card at ${tc} s (valve ${SH.show.valve} s)`);
      check(r.log.filter((e) => e.ev === 'fish:measured').length === 1 && r.log.filter((e) => e.ev === 'fish:landed').length === 1 && JSON.stringify(orderOf(r.log)) === JSON.stringify(ORDER), 'valve: the records written once, the events in order', orderOf(r.log));
    }
  }
  if (want('abort')) {
    const info = await toT0('abort', 'weeping_carp', 0.5, {});
    if (info) {
      await g((ms) => window.__show.run(400, ms, 'hold'), STEP_MS);
      const n0 = await g(() => window.__show.log.filter((e) => e.ev === 'fish:measured').length);
      await g(() => window.__gw.fishing.cancel('reset'));
      await g((ms) => window.__show.run(40, ms, null), STEP_MS);
      const st = await g(() => { const c = window.__gw; return { show: c.fishing.view.show ?? null, cine: !!c.cinematic, inShow: !!c.fishing.inShow, state: c.fishing.state, modal: c.debug.ui?.()?.openModal ?? null, camW: c.debug.camera?.()?.show?.w ?? 0,
        measured: window.__show.log.filter((e) => e.ev === 'fish:measured').length, hud: document.querySelector('#ui .gw-hud').classList.contains('gw-showhide') ? 0 : 1 }; });
      check(st.show === null && !st.cine && !st.inShow && st.state === 'idle' && st.measured === n0 && n0 === 1 && st.camW < 0.4 && st.hud > 0.5, 'abort: a reset in the hold: no view, the world unfrozen, measured once, the lens easing out, the HUD back', st);
      await finish('abort', { step0: info.step0 });
      await clearModals();
      await wait(400);
      await clearModals();
    }
  }
  if (want('leak')) {
    // several catches and their cards: nothing is left behind (S8)
    const counts = [];
    const n = Number(args.leak) || 4;
    for (let i = 0; i < n; i++) {
      const info = await toT0(`leak${i}`, i % 2 ? 'weeping_carp' : 'mossback_perch', i % 2 ? 0.5 : -0.7, {});
      if (!info) break;
      await g(() => window.__gw.fishing.hurryShow());
      await g((ms) => window.__show.run(300, ms, 'card'), STEP_MS);
      await g((ms) => window.__show.run(40, ms, null), STEP_MS);
      await closeCard();
      await g((ms) => window.__show.run(50, ms, null), STEP_MS);
      counts.push(await g(() => { const c = window.__gw, I = c.render.renderer.info; return { geo: I.memory.geometries, tex: I.memory.textures, prog: I.programs?.length ?? null, calls: I.render.calls, show: c.fishing.view.show ?? null, pose: c.actors.showPose ?? null, cine: !!c.cinematic,
        fish: ['catchHolder', 'holdAnchor', 'fishing-fish'].map((nm) => c.render.scene.getObjectByName(nm)?.children.length ?? 0), cam: c.debug.camera?.()?.show ?? null }; }));
      await finish(`leak${i}`, { step0: info.step0 });
      await clearModals();
    }
    notes.leak = counts; writeFileSync(notesPath, JSON.stringify(notes, null, 1));
    log('leak', JSON.stringify(counts.map((c) => [c.geo, c.tex, c.prog, c.calls])));
    const a = counts[1] || counts[0], b = counts.at(-1);
    check(counts.length >= 3 && b.geo <= a.geo && b.tex <= a.tex && b.prog <= a.prog, `leak: after ${counts.length} catches and their cards the live geometries, textures and programs are what they were after the second (${a?.geo}/${a?.tex}/${a?.prog} → ${b?.geo}/${b?.tex}/${b?.prog})`, counts.map((c) => [c.geo, c.tex, c.prog]));
    check(counts.every((c) => c.show === null && c.pose === null && !c.cine && c.cam === null && c.fish.every((k) => k === 0)), 'leak: view.show and actors.showPose null, ctx.cinematic false, the show camera released, no fish left on any holder', counts.at(-1));
  }
  await g(() => { const c = window.__gw; c.debug.fishOutcome(null); c.debug.timeScale(1); c.debug.showRate?.(1); c.debug.showSwarm?.(null); });
  log(`show-seq (${phone ? 'phone' : 'desktop'}): ${failures.length ? `${failures.length} FAILED` : 'all checks passed'}`);
  return { failures };
}
