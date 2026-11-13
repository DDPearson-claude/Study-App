// The catch as a frame strip (docs/v3/show/SPEC.md): for every size class, a legend, an eel, a flat fish and the smallest fish in
// the build, the whole sequence from the fish leaving the water (T0: fishing.state becomes 'landing') to the catch card being
// open, sampled BY THE GAME'S CLOCK on a deterministic 30 fps stepper (requestAnimationFrame is taken over for the sequence and
// every frame is given exactly 1/30 s, so a slow software-GL machine shoots the same frames a fast one does). Beside each PNG,
// notes.json records what the frame holds: where the Wick faces relative to the lens, the fish's box on screen (how big, how much
// of it a UI element covers), the camera, the ceremony's phase, the words on screen, and the timeline of the events.
//
//   node build.mjs --dev --out=tools/out/show/dev.html
//   node tools/playtest.mjs --html=tools/out/show/dev.html --shots=tools/out/show/before/desktop --script=tools/tests/show-audit.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/show/dev.html --shots=tools/out/show/before/phone --script=tools/tests/show-audit.scenario.mjs --mobile --only=small,elder
//   (--only=small,elder a subset · --frames=10 frames before the card · --heading=1.2 turns the raft (rad) before the cast)
//   node tools/show-sheet.mjs tools/out/show/before tools/out/show/before.jpg     (the contact sheet)
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

// name, species, z, {phase, mode}: the nine the audit asks for, a flat fish, and a night catch
export const CASES = [
  ['small', 'mossback_perch', -0.7, {}],
  ['keeper', 'weeping_carp', 0.5, {}],
  ['prize', 'reedjaw_pike', 1.5, {}],
  ['trophy', 'reedjaw_pike', 2.4, {}],
  ['elder', 'reedjaw_pike', 3.0, {}],
  ['ancient', 'reedjaw_pike', 3.45, {}],
  ['legend', 'belled_matriarch', 1.0, {}],
  ['eel', 'gloam_eel', 1.6, {}],
  ['tiny', 'quayling', -2, { fallback: ['dusk_minnow', -2] }],
  ['ray', 'velvet_ray', 0.6, {}],
  ['night', 'candlefin_koi', 0.6, { phase: 'gloomtide' }],
];
const STEP_MS = 1000 / 30;

/** In the page: the stepper, the event log and the frame metrics. */
function install() {
  const c = window.__gw;
  const raf = window.requestAnimationFrame.bind(window);
  const S = { on: false, q: [], now: null, step: 0, log: [], last: {} };
  window.__show = S;
  window.requestAnimationFrame = (cb) => { if (S.on) { S.q.push(cb); return 0; } return raf(cb); };
  const sample = () => {
    const m = c.fishing?.view?.measure, cur = { state: c.fishing?.state, phase: m?.phase ?? null, cinematic: !!c.cinematic, modal: c.debug.ui?.()?.openModal ?? null,
      glory: !!c.debug.fishReveal?.()?.glory, pose: c.actors?.measurePose ?? null, slowmo: !!c.debug.beats?.()?.slowmo?.active };
    for (const k of Object.keys(cur)) if (cur[k] !== S.last[k]) { S.log.push({ step: S.step, what: k, to: cur[k] }); S.last[k] = cur[k]; }
  };
  for (const ev of ['fishing:landing', 'fishing:caught', 'fish:measured', 'fish:landed', 'fishing:reveal'])
    c.bus.on(ev, (p) => S.log.push({ step: S.step, ev, sizeClass: p?.sizeClass ?? p?.fish?.sizeClass ?? null, length: p?.length ?? p?.fish?.length ?? null }));
  S.begin = () => { S.on = true; S.now = null; };
  /** One frame of exactly `ms` of the game's real clock, run inside a real animation frame (so it is composited). */
  S.frame = (ms) => new Promise((res) => raf(() => {
    const q = S.q; S.q = [];
    S.now = (S.now ?? performance.now()) + ms;
    for (const cb of q) { try { cb(S.now); } catch (e) { (c.errors || []).push(String(e)); } }
    S.step++; sample(); res(S.step);
  }));
  /** Step until `until()` is true or `max` frames have run. */
  S.run = async (max, ms, stopOn) => {
    for (let i = 0; i < max; i++) {
      await S.frame(ms);
      if (stopOn === 'landing' && c.fishing.state === 'landing') return { step: S.step, hit: true };
      if (stopOn === 'card' && c.debug.ui?.()?.openModal === 'catch') return { step: S.step, hit: true };
    }
    return { step: S.step, hit: false };
  };
  S.end = () => { S.on = false; const q = S.q; S.q = []; S.now = null; for (const cb of q) raf(cb); };
  S.reset = () => { S.step = 0; S.log = []; S.last = {}; };

  // ---- what the frame holds
  const words = () => {
    const root = document.getElementById('ui');
    const vis = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n = 0; const text = [];
    while (w.nextNode()) {
      const t = w.currentNode, s = t.nodeValue.replace(/\s+/g, ' ').trim();
      if (!s || !vis(t.parentElement)) continue;
      n += s.split(' ').filter((x) => /[\p{L}\p{N}]/u.test(x)).length; text.push(s);
    }
    return { n, text: text.join(' / ').slice(0, 300) };
  };
  const rectOf = (sel) => { const e = document.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return null; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null; };
  const overlap = (a, b) => { if (!a || !b) return 0; const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y); return w > 0 && h > 0 ? (w * h) / Math.max(1, a.w * a.h) : 0; };
  S.metrics = () => {
    const cam = c.render.camera, scene = c.render.scene, W = innerWidth, H = innerHeight;
    scene.updateMatrixWorld(true); cam.updateMatrixWorld(true);
    const head = c.actors.getHeadPos(), V3 = head.constructor;
    const px = (v) => { const p = v.clone().project(cam); return { x: (p.x * 0.5 + 0.5) * W, y: (1 - (p.y * 0.5 + 0.5)) * H, z: p.z }; };
    const r1 = (x) => Math.round(x * 10) / 10;
    const out = { step: S.step, state: c.fishing.state, phase: c.fishing.view?.measure?.phase ?? null, pose: c.actors.measurePose ?? null, modal: c.debug.ui?.()?.openModal ?? null, cinematic: !!c.cinematic };
    // the Wick: where its face points relative to the lens (0° = straight at the camera), its head on screen
    const wick = scene.getObjectByName('wick'), wp = c.actors.getWickPos(), cp = cam.getWorldPosition(new V3());
    if (wick) {
      const f = new V3(0, 0, 1).transformDirection(wick.matrixWorld), d = cp.clone().sub(wp);
      let a = (Math.atan2(f.x, f.z) - Math.atan2(d.x, d.z)) * 180 / Math.PI; a = ((a + 540) % 360) - 180;
      out.wickOffLens = Math.round(a);
      const hp = px(head), fp = px(wp);
      out.head = { x: Math.round(hp.x), y: Math.round(hp.y) };
      out.wickPx = Math.round(Math.abs(fp.y - hp.y));
      out.headInFrame = hp.z < 1 && hp.x > 0 && hp.x < W && hp.y > 0 && hp.y < H;
      out.camDist = r1(cp.distanceTo(head));
    }
    out.fov = r1(cam.fov);
    // the fish: its box on screen (every visible mesh under the three places a caught fish can hang)
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
          const v = new V3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(o.matrixWorld);
          const p = px(v); if (p.z >= 1) continue;
          box = box || { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
          box.x0 = Math.min(box.x0, p.x); box.y0 = Math.min(box.y0, p.y); box.x1 = Math.max(box.x1, p.x); box.y1 = Math.max(box.y1, p.y);
        }
        if (fishDist === null) {
          fishDist = r1(cp.distanceTo(o.getWorldPosition(new V3())));
          // how side-on the fish is: 0° = its flank square to the lens, 90° = end-on (local +z is the snout)
          const ax = new V3(0, 0, 1).transformDirection(o.matrixWorld), view = o.getWorldPosition(new V3()).sub(cp).normalize();
          noseTail = Math.round(90 - Math.acos(Math.min(1, Math.abs(ax.dot(view)))) * 180 / Math.PI);
        }
      });
    }
    if (box) {
      const fr = { x: box.x0, y: box.y0, w: box.x1 - box.x0, h: box.y1 - box.y0 };
      const on = { x: Math.max(0, fr.x), y: Math.max(0, fr.y), w: Math.min(W, fr.x + fr.w) - Math.max(0, fr.x), h: Math.min(H, fr.y + fr.h) - Math.max(0, fr.y) };
      out.fish = { x: Math.round(fr.x), y: Math.round(fr.y), w: Math.round(fr.w), h: Math.round(fr.h), wPct: Math.round(100 * fr.w / W), hPct: Math.round(100 * fr.h / H),
        inFrame: Math.round(100 * Math.max(0, on.w) * Math.max(0, on.h) / Math.max(1, fr.w * fr.h)), dist: fishDist, endOn: noseTail };
      const band = rectOf('#ui .gw-ms .gw-ms-band'), recs = rectOf('#ui .gw-ms .gw-ms-recs'), card = rectOf('#ui .gw-m-catch .gw-cc-grid') || rectOf('#ui .gw-m-catch .gw-modal-body') || null;
      out.cover = { band: Math.round(100 * overlap(fr, band)), banner: Math.round(100 * overlap(fr, recs)), card: Math.round(100 * overlap(fr, card)) };
      out.bandRect = band && { y: Math.round(band.y), h: Math.round(band.h) };
    } else out.fish = null;
    const w = words(); out.words = w.n; out.text = w.text;
    return out;
  };
  return true;
}

export default async function (api) {
  const { page, wait, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const only = args?.only ? String(args.only).toLowerCase().split(',') : null;
  const nFrames = Math.max(4, Math.min(16, Number(args?.frames) || 9));
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/show/before/desktop'));
  mkdirSync(shotsDir, { recursive: true });
  const notesPath = resolve(shotsDir, 'notes.json');
  const notes = existsSync(notesPath) && only ? JSON.parse(readFileSync(notesPath, 'utf8')) : {};

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
  // a returning player with every audited species already in the Journal but the eel (one new-species landing in the set)
  await g(() => {
    const c = window.__gw, m = c.state.meta;
    m.runs = 3; m.deaths = 3; m.bestDay = 3;
    if (m.firstEvening) m.firstEvening.done = true;
    try { c.debug.firstEvening?.('done'); } catch { /* optional */ }
    m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) m.seenTips[t.id] = true;
    m.journal = m.journal || {};
    for (const id of ['mossback_perch', 'weeping_carp', 'reedjaw_pike', 'belled_matriarch', 'quayling', 'dusk_minnow', 'velvet_ray', 'candlefin_koi']) m.journal[id] = { caught: 4, biggest: 0.6, pbLength: 20 };
    m.journal.reedjaw_pike.pbLength = 80;
    c.game.save?.();
  });
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
  await scale(0.5);
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

  for (const [name, sp0, z0, o] of CASES) {
    if (only && !only.includes(name)) continue;
    let sp = sp0, z = z0;
    await clearModals();
    await g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } try { c.fishing.reset?.(); } catch { /* optional */ } c.debug.timeScale(1); c.debug.cerRate?.(1); });
    await pin();
    await g((ph) => window.__gw.debug.setPhase(ph), o.phase || 'calm');
    await frames(o.phase ? 12 : 2);
    await clearModals();
    // a real cast up the screen (the common case), the bite forced, struck clean, the outcome forced to land
    const W = api.width, H = api.height;
    await page.mouse.move(W / 2, H * 0.42);
    await page.mouse.down();
    await waitFor(() => window.__gw.fishing.state === 'charging', null, 30, 80);
    await frames(5);
    await page.mouse.up();
    await page.mouse.move(2, H * 0.5);
    await waitFor(() => window.__gw.fishing.state === 'waiting', null, 90, 150);
    await frames(3);
    let bit = false;
    for (const [s, zz] of [[sp, z], ...(o.fallback ? [o.fallback] : [])]) {
      await g(([s, zz]) => { const c = window.__gw; c.debug.fishOutcome('land'); c.debug.forceBite({ speciesId: s, z: zz, wait: 0.2 }); }, [s, zz]);
      bit = await waitFor(() => window.__gw.fishing.state === 'bite', null, 30, 60);
      if (bit) { sp = s; z = zz; break; }
    }
    if (!bit) { failures.push(`${name}: no bite for ${sp}`); continue; }
    await g(() => window.__gw.debug.fishStrike('clean'));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 30);
    const info = await g(() => { const c = window.__gw, f = c.debug.fishing(), p = c.debug.fishPlay?.(); return { species: f.species, sizeClass: f.sizeClass, ancient: f.ancient, length: f.length, playEnd: p?.end ?? null }; });
    if (info.species !== sp) log(`${name}: hooked ${info.species}, wanted ${sp}`);
    // jump the play to its last half second, then take the clock: every frame from here is exactly 1/30 s
    await g((end) => window.__gw.debug.fishPlayTo(end ? Math.max(0.5, 1 - 0.5 / end) : 0.95), info.playEnd);
    await g(() => { window.__show.reset(); window.__show.begin(); });
    const t0r = await g((ms) => window.__show.run(300, ms, 'landing'), STEP_MS);
    if (!t0r.hit) { failures.push(`${name}: the play never reached the landing`); await g(() => window.__show.end()); continue; }
    const step0 = t0r.step;
    // the length of today's sequence, predicted from the data (the reveal on the game's clock under the slow-motion beat, then the
    // ceremony), to space the frames; the card is watched for, not predicted
    const pred = await g((cls) => {
      const c = window.__gw, A = c.data.AUTOFISH, L = A.landing[cls] || A.landing.keeper, sm = L.slowmo || [0, 1];
      const wipe = L.wipe, slowGame = sm[0] * sm[1], reveal = wipe <= slowGame ? wipe / sm[1] : sm[0] + (wipe - slowGame);
      const cer = c.debug.ceremony?.();
      const sc = c.data.SIZE_CLASSES.find((x) => x.id === c.debug.fishing().sizeClass);
      return { reveal, ceremony: c.debug.fishing().species && c.data.SPECIES_BY_ID[c.debug.fishing().species]?.rarity === 'legendary' ? 5 : (sc?.ceremony ?? 1.2), cer: cer?.active ? cer.dur : null };
    }, info.ancient || name === 'legend' ? 'ancient' : info.sizeClass);
    const total = pred.reveal + pred.ceremony;
    const rec = { case: name, species: sp, z, sizeClass: info.sizeClass, ancient: !!info.ancient, lengthCm: info.length, predicted: { reveal: +pred.reveal.toFixed(2), ceremony: pred.ceremony, total: +total.toFixed(2) }, frames: [] };
    const shoot = async (label) => {
      const m = await g(() => window.__show.metrics()).catch((e) => ({ error: String(e) }));
      const file = `${name}-${String(rec.frames.length + 1).padStart(2, '0')}-${label}.png`;
      let ok = false;
      for (let a = 0; a < 3 && !ok; a++) { try { await page.screenshot({ path: resolve(shotsDir, file), timeout: 240000 }); ok = true; } catch (e) { log('shot retry', file, String(e?.message || e).split('\n')[0]); } }
      rec.frames.push({ file, t: +(((m.step ?? 0) - step0) * STEP_MS / 1000).toFixed(2), ...m });
      log('shot', file, JSON.stringify({ t: rec.frames.at(-1).t, phase: m.phase, pose: m.pose, off: m.wickOffLens, fish: m.fish && `${m.fish.wPct}x${m.fish.hPct}% in ${m.fish.inFrame}%`, cover: m.cover, words: m.words }));
    };
    // frames before the card: evenly spaced over the predicted length (the first just after the fish breaks the surface)
    let carded = false, tCard = null;
    for (let i = 0; i < nFrames && !carded; i++) {
      const tWant = total * (0.03 + 0.95 * i / (nFrames - 1));
      const at = step0 + Math.max(1, Math.round(tWant * 1000 / STEP_MS));
      const cur = await g(() => window.__show.step);
      if (at - 1 > cur) { const r = await g(([n, ms]) => window.__show.run(n, ms, 'card'), [at - 1 - cur, STEP_MS]); if (r.hit) { carded = true; tCard = r.step; break; } }
      await scale(1);
      const r = await g((ms) => window.__show.run(1, ms, 'card'), STEP_MS);
      await wait(120);
      await shoot(`t${String(Math.round(((r.step - step0) * STEP_MS) / 10)).padStart(3, '0')}`);
      await scale(0.5);
      if (r.hit) { carded = true; tCard = r.step; }
    }
    if (!carded) { const r = await g((ms) => window.__show.run(240, ms, 'card'), STEP_MS); if (r.hit) { carded = true; tCard = r.step; } }
    if (!carded) failures.push(`${name}: no catch card within 8 s of the predicted end`);
    else {
      // the card: just open (its own entrance runs on the wall clock), then settled
      await scale(1);
      await g((ms) => window.__show.run(4, ms, null), STEP_MS);
      await wait(250);
      await shoot('card-opening');
      await g((ms) => window.__show.run(30, ms, null), STEP_MS);
      await wait(1500);
      await shoot('card');
      await scale(0.5);
    }
    rec.tCard = tCard != null ? +(((tCard - step0) * STEP_MS) / 1000).toFixed(2) : null;
    rec.timeline = (await g(() => window.__show.log)).map((e) => ({ ...e, t: +(((e.step - step0) * STEP_MS) / 1000).toFixed(2) })).filter((e) => e.t >= -0.2);
    await g(() => window.__show.end());
    notes[name] = rec;
    writeFileSync(notesPath, JSON.stringify(notes, null, 1));
    log(`${name}: ${sp} ${info.sizeClass} ${info.length} cm · T0 → card ${rec.tCard} s (predicted ${rec.predicted.total})`);
    await g(() => { document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click() || document.querySelector('#ui .gw-m-catch [data-action="keep"]')?.click(); });
    await clearModals();
    await wait(600);
    await clearModals();
  }
  await g(() => { const c = window.__gw; c.debug.fishOutcome(null); c.debug.timeScale(1); c.debug.cerRate?.(1); });
  return { failures };
}
