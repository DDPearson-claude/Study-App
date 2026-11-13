// The show, staged (docs/v3/show/SPEC.md §4; the stage's proof): any catch as a frame strip from the fish breaking the surface
// (T0: fishing.state becomes 'landing') through the lift, the hold and the pause to the card and back to play, shot BY THE
// GAME'S CLOCK on a deterministic stepper (requestAnimationFrame is taken over; every frame is exactly 1/30 s of the game's real
// clock, so a slow software-GL machine shoots the same frames a fast one does). Beside each PNG, notes.json records what the frame
// holds (S1: where the Wick faces, the fish's box on screen from its posed hull, the head and flame in frame; S2: the ui over the
// picture; S3: the clock per phase from the bus; S5: every ripple and splash near the raft, the lens's continuity; S8: draw calls).
// The measuring ceremony's audit (the "before" set under tools/out/show/before/) was shot by this file's first version.
//
//   node build.mjs --dev --out=tools/out/show/dev.html
//   node tools/playtest.mjs --html=tools/out/show/dev.html --shots=tools/out/show/after/desktop --script=tools/tests/show-audit.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/show/dev.html --shots=tools/out/show/after/phone --script=tools/tests/show-audit.scenario.mjs --mobile --only=small,elder
//   --only=small,elder          a subset of the cases
//   --cases=name:species:z[:key=value;key=value]   more cases. Keys: phase (calm | dusk | gloomtide), zone (mossmere | sporewood |
//                               glasswater | paleabyss), body (wick | taper | stub | tallow | ashwick), heading (rad), lead (s of the
//                               play left before the landing; default 0.5), action (keep | release | eat | render)
//   --frames=sheet|strip        sheet (default): the five frames of the proof sheet (water, lift, show, pause, card) and the way
//                               out; strip: twelve
//   --quality=high              the render tier (default high)
//   --video=<dir>               instead: each case from the strike to the card closing, one PNG per 1/12 s of game time into <dir>
//                               (tools/show-sheet.mjs --video turns them into an mp4)
//   node tools/show-sheet.mjs --after=tools/out/show/after --before=tools/out/show/before --out=tools/out/show/sheet.jpg
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { install, fetchCached, STEP_MS } from './show-seq.scenario.mjs';

// name, species, z, options: the proof sheet's rows, then the extremes the stage looks at
export const CASES = [
  ['small', 'mossback_perch', -0.7, {}],
  ['keeper', 'weeping_carp', 0.5, {}],
  ['prize', 'reedjaw_pike', 1.5, {}],
  ['trophy', 'reedjaw_pike', 2.4, {}],
  ['elder', 'reedjaw_pike', 3.0, {}],
  ['legend', 'belled_matriarch', 1.0, {}],
  ['eel', 'gloam_eel', 1.6, {}],
];
const EXTRA = {
  ancient: ['reedjaw_pike', 3.45, {}],
  tiny: ['quayling', -2, {}],
  minnow: ['dusk_minnow', -2, {}],
  ray: ['velvet_ray', 0.6, {}],
  night: ['candlefin_koi', 0.6, { phase: 'gloomtide' }],
  leviathan: ['lantern_swallower', 1.0, {}],
};

/** In the page, on top of show-seq's stepper: the ripple log, the posed fish's box, the lake and the body. */
function installStage() {
  const c = window.__gw, S = window.__show;
  // every ripple and splash the water is asked for, with its distance from the raft (S5: never a ring round the raft)
  S.rip = [];
  const W = c.water;
  const wrap = (name) => {
    const orig = W[name];
    if (typeof orig !== 'function' || orig.__wrapped) return;
    const f = function (x, z, a, b) {
      try {
        const p = c.player?.position || { x: 0, z: 0 };
        const ring = name === 'addRipple' ? !(b && typeof b === 'object' && b.kind) : !(a && a.ring === false);
        S.rip.push({ step: S.step, fn: name, d: +Math.hypot(x - p.x, z - p.z).toFixed(2), s: +(name === 'addRipple' ? Number(a) || 1 : Number(a?.size) || 1).toFixed(2), ring, state: c.fishing?.state, phase: c.fishing?.view?.show?.phase ?? null });
      } catch { /* a log only */ }
      return orig.apply(this, arguments);
    };
    f.__wrapped = true;
    try { W[name] = f; } catch { /* frozen: no log */ }
  };
  wrap('addRipple'); wrap('splash');
  /** The fish as it is posed (actors' hull: bent, fins and all), boxed on screen. */
  S.hullBox = () => {
    let pts = null;
    try { pts = c.debug.showPoseHull?.(); } catch { pts = null; }
    if (!pts || !pts.length) return null;
    const cam = c.render.camera, Wd = innerWidth, H = innerHeight;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, n = 0;
    for (const p of pts) { const q = p.clone().project(cam); if (!(q.z < 1)) continue; const x = (q.x * 0.5 + 0.5) * Wd, y = (1 - (q.y * 0.5 + 0.5)) * H; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); n++; }
    if (!n) return null;
    const w = x1 - x0, h = y1 - y0, on = Math.max(0, Math.min(Wd, x1) - Math.max(0, x0)) * Math.max(0, Math.min(H, y1) - Math.max(0, y0));
    return { x: Math.round(x0), y: Math.round(y0), w: Math.round(w), h: Math.round(h), wPct: +(100 * w / Wd).toFixed(1), hPct: +(100 * h / H).toFixed(1), diagPct: +(100 * Math.hypot(w, h) / Math.hypot(Wd, H)).toFixed(1),
      inFrame: Math.round(100 * on / Math.max(1, w * h)), clear: +(100 * Math.min(x0 / Wd, y0 / H, (Wd - x1) / Wd, (H - y1) / H)).toFixed(1) };
  };
  S.goZone = (zone) => {
    const r = c.state.run;
    try { c.debug.unlockZone?.(zone); } catch { /* optional */ }
    if (!(r.zonesUnlocked || []).includes(zone)) r.zonesUnlocked = [...(r.zonesUnlocked || []), zone];
    try { c.combat.killAll?.('debug'); } catch { /* optional */ }
    try { c.fishing.cancel?.('debug'); } catch { /* optional */ }
    if (r.zone !== zone) { r.zone = zone; r.gateOpen = false; c.bus.emit('zone:change', { zone, prev: null }); }
    try { const sp = c.world.getSpawn?.(); if (sp?.position) c.player.teleport?.(sp.position, sp.yaw || 0); } catch { /* optional */ }
    return r.zone;
  };
  return true;
}

export default async function (api) {
  const { page, wait, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const failures = [], notesOut = [];
  const note = (msg) => { notesOut.push(msg); log('NOTE', msg); };
  const check = (cond, msg, extra) => { if (cond) { log('ok  ', msg); return true; } failures.push(`${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`); log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : ''); return false; };
  const only = args?.only ? String(args.only).toLowerCase().split(',') : null;
  const mode = String(args.frames || 'sheet');
  const videoDir = args.video ? resolve(process.cwd(), String(args.video)) : null;
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/show/after/desktop'));
  mkdirSync(shotsDir, { recursive: true });
  if (videoDir) mkdirSync(videoDir, { recursive: true });
  const notesPath = resolve(shotsDir, 'notes.json');
  const notes = existsSync(notesPath) ? JSON.parse(readFileSync(notesPath, 'utf8')) : {};
  const phone = api.width < 700;
  const quality = String(args.quality || 'high');

  const parseOpts = (s) => Object.fromEntries(String(s || '').split(';').filter(Boolean).map((kv) => { const [k, v] = kv.split('='); return [k, /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v]; }));
  let cases = CASES.map(([n, s, z, o]) => [n, s, z, { ...o }]);
  for (const c of String(args.cases || '').split(',').filter(Boolean)) { const [n, s, z, o] = c.split(':'); cases.push([n, s, Number(z), parseOpts(o)]); }
  if (only) {
    for (const n of only) if (!cases.some((c) => c[0] === n) && EXTRA[n]) cases.push([n, ...EXTRA[n]]);
    cases = only.map((n) => cases.find((c) => c[0] === n)).filter(Boolean);
  }

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
  // a returning player: every species here already in the Journal at a best no test fish beats (an ordinary catch, an ordinary card)
  await g(() => {
    const c = window.__gw, m = c.state.meta;
    m.runs = 3; m.deaths = 3; m.bestDay = 3;
    if (m.firstEvening) m.firstEvening.done = true;
    try { c.debug.firstEvening?.('done'); } catch { /* optional */ }
    m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) m.seenTips[t.id] = true;
    m.journal = m.journal || {};
    for (const sp of c.data.SPECIES || []) m.journal[sp.id] = { caught: 4, biggest: 99, pbLength: 2000, seals: { prize: true, trophy: true, elder: true } };
    c.game.save?.();
  });
  if (await g(() => window.__gw.flow !== 'title')) { await g(() => window.__gw.game.toTitle?.() ?? window.__gw.game.quitToTitle?.()); await wait(1500); }
  await page.mouse.move(2, 200);
  await g((q) => { const c = window.__gw; try { if (c.state.meta.settings) c.state.meta.settings.quality = q; c.render.setQuality?.(q); } catch { /* optional */ } }, quality);
  await g(install);
  await g(installStage);
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
  const pin = () => g(() => { const c = window.__gw; c.debug.god?.(true); c.debug.setOil(72); c.debug.setSatiety(80); if (c.state.run) c.state.run.xpNext = 1e9; });
  const LOW = 0.34;
  await scale(LOW);
  await clearModals();
  await g(() => window.__gw.game.startNewRun({ character: 'wick', nightMode: 'still' }));
  await waitFor(() => window.__gw.flow === 'playing', null, 180);
  await frames(4);
  await clearModals();
  await g(() => { const c = window.__gw; c.debug.mode?.('still'); c.state.run.day = 2; });
  await pin();
  await g(() => window.__gw.debug.setPhase('calm'));
  await frames(3);
  const SH = await g(() => { const A = window.__gw.data.AUTOFISH; return { show: A.show, plan: Object.fromEntries(window.__gw.data.SHOW_CLASSES.map((c) => [c, window.__gw.data.showPlan(c)])) }; });
  const sec = (steps) => +((steps * STEP_MS) / 1000).toFixed(3);
  let cur = { zone: 'mossmere', body: 'wick', heading: null };

  /** The lake, the hour, the body and the raft's heading for a case. */
  async function stage(o) {
    await clearModals();
    await g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } c.debug.timeScale(1); c.debug.showRate?.(1); c.debug.showSwarm?.(null); });
    const zone = o.zone || 'mossmere', body = o.body || 'wick';
    if (zone !== cur.zone) { await g((z) => window.__show.goZone(z), zone); cur.zone = zone; await frames(20); await clearModals(); }
    if (body !== cur.body) { await g((b) => window.__gw.actors.setCharacter(b), body); cur.body = body; await frames(4); }
    await pin();
    await g((ph) => window.__gw.debug.setPhase(ph), o.phase || 'calm');
    await frames(o.phase && o.phase !== 'calm' ? 14 : 3);
    if (o.heading != null) { await g((h) => { const p = window.__gw.player; try { p.teleport?.(p.position, h); } catch { /* optional */ } if (p && 'heading' in p) p.heading = h; }, Number(o.heading)); await frames(4); }
    await clearModals();
  }
  /** Cast, force the bite; returns at fishing.state 'bite'. */
  async function toBite(name, sp, z) {
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
    if (!(await waitFor(() => window.__gw.fishing.state === 'bite', null, 30, 60))) { failures.push(`${name}: no bite for ${sp}`); return false; }
    return true;
  }
  const playInfo = () => g(() => { const c = window.__gw, f = c.debug.fishing(), p = c.debug.fishPlay?.(); return { species: f.species, sizeClass: f.sizeClass, ancient: f.ancient, length: f.length, playEnd: p?.end ?? null, playT: p?.t ?? null, legendary: c.data.SPECIES_BY_ID[f.species]?.rarity === 'legendary' }; });
  const metrics = () => g(() => {
    const c = window.__gw, m = window.__show.metrics(); m.hull = window.__show.hullBox();
    try { m.info = c.debug.showPoseInfo?.() ?? null; } catch { m.info = null; }
    // every point actors names, where it lands in the frame (−1..1): what set the fit, what touches an edge
    try { const f = c.actors.getShowFocus?.(), cam = c.render.camera; m.keepPts = f?.keep ? Object.entries(f.keep).flatMap(([k, grp]) => grp.map((p) => { const q = p.clone().project(cam); return { k, x: +q.x.toFixed(2), y: +q.y.toFixed(2) }; })) : null; } catch { m.keepPts = null; }
    return m;
  }).catch((e) => ({ error: String(e) }));
  const closeCard = (action) => g((a) => { const q = (x) => document.querySelector(`#ui .gw-m-catch [data-action="${x}"]`); const b = (a && q(a)) || q('release') || q('keep'); if (b) { b.click(); return b.getAttribute('data-action'); } return null; }, action || null);
  const shotPng = async (path) => { for (let a = 0; a < 3; a++) { try { await page.screenshot({ path, timeout: 240000 }); return true; } catch (e) { log('shot retry', path, String(e?.message || e).split('\n')[0]); } } return false; };

  // ================================================================ one catch, shot and measured
  async function shootCase([name, sp, z, o]) {
    await stage(o);
    if (!(await toBite(name, sp, z))) return;
    await g(() => window.__gw.debug.fishStrike('clean'));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 30);
    const info = await playInfo();
    info.cls = info.legendary || info.ancient ? 'ancient' : info.sizeClass;
    const lead = Number.isFinite(o.lead) ? o.lead : 0.5;
    await g(([end, lead]) => window.__gw.debug.fishPlayTo(end ? Math.max(0, 1 - lead / end) : 0.95), [info.playEnd, lead]);
    await g(() => { const S = window.__show; S.reset(); S.rip.length = 0; S.uiEvery = 2; S.begin(); });
    const t0r = await g((ms) => window.__show.run(Math.round(60000 / ms), ms, 'landing'), STEP_MS);
    if (!t0r.hit) { failures.push(`${name}: the play never reached the landing`); await g(() => window.__show.end()); return; }
    await g(() => { window.__show.tracing = true; });
    const P = SH.plan[info.cls];
    const rec = { case: name, species: sp, z, cls: info.cls, sizeClass: info.sizeClass, ancient: !!info.ancient, legendary: !!info.legendary, lengthCm: info.length, plan: P, opts: o, step0: t0r.step, frames: [] };
    const shoot = async (label) => {
      await scale(1);
      await g((ms) => window.__show.run(1, ms, null), STEP_MS);   // (one frame at full size, so the shot is sharp)
      await wait(120);
      const m = await metrics();
      const file = `${name}-${String(rec.frames.length + 1).padStart(2, '0')}-${label}.png`;
      await shotPng(resolve(shotsDir, file));
      rec.frames.push({ file, label, t: sec((m.step ?? 0) - rec.step0), ...m });
      log('shot', file, JSON.stringify({ t: rec.frames.at(-1).t, phase: m.phase, off: m.wickOffLens, hull: m.hull && `${m.hull.wPct}x${m.hull.hPct}% clear ${m.hull.clear}%`, wick: `${m.wickPct}%`, ui: m.ui, words: m.words, dist: m.camDist }));
      await scale(LOW);
      return m;
    };
    const stepTo = async (tWant, stopOn = 'card') => {
      const at = await g(() => window.__show.step);
      const n = rec.step0 + Math.round(tWant * 1000 / STEP_MS) - at - 1;
      return n > 0 ? g(([n, ms, s]) => window.__show.run(n, ms, s), [n, STEP_MS, stopOn]) : { hit: false };
    };
    const tP = P.reveal + P.lift, marks = mode === 'strip'
      ? [['water', 0.06], ['water2', P.reveal * 0.6], ['lift', P.reveal + P.lift * 0.3], ['lift2', P.reveal + P.lift * 0.7], ['present', tP + 0.04], ['show', tP + P.hold * 0.55], ['pause', tP + P.hold + 0.12], ['pause2', P.total - 0.1]]
      : [['water', Math.min(P.reveal * 0.6, P.reveal - 0.1)], ['lift', P.reveal + P.lift * 0.6], ['show', tP + Math.min(0.3, P.hold * 0.5)], ['pause', P.total - 0.15]];
    let carded = false;
    for (const [label, t] of marks) { const r = await stepTo(t); if (r.hit) { carded = true; break; } await shoot(label); }
    if (!carded) carded = (await g((ms) => window.__show.run(400, ms, 'card'), STEP_MS)).hit;
    if (!check(carded, `${name}: the card opens`)) { await g(() => { window.__show.tracing = false; window.__show.end(); }); return; }
    if (mode === 'strip') { await g((ms) => window.__show.run(3, ms, null), STEP_MS); await wait(160); await shoot('card-opening'); }
    await g((ms) => window.__show.run(30, ms, null), STEP_MS); await wait(1500); await shoot('card');
    rec.cardWords = await g(() => { const e = document.querySelector('#ui .gw-m-catch'); if (!e) return null; let n = 0; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) { const t = w.currentNode, s = t.nodeValue.replace(/\s+/g, ' ').trim(); if (!s) continue; let vis = true; for (let p = t.parentElement; p && p !== e; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden') { vis = false; break; } } if (vis) n += s.split(' ').filter((x) => /[\p{L}\p{N}]/u.test(x)).length; }
      return n; });
    const stepClose = await g(() => window.__show.step);
    rec.action = await closeCard(o.action);
    await g((ms) => window.__show.run(5, ms, null), STEP_MS); await shoot('out');
    if (mode === 'strip') { await g((ms) => window.__show.run(8, ms, null), STEP_MS); await shoot('out2'); }
    await g((ms) => window.__show.run(40, ms, null), STEP_MS); await shoot('play');
    const trace = await g(() => window.__show.trace);
    rec.log = (await g(() => window.__show.log)).map((e) => ({ ...e, t: sec(e.step - rec.step0) }));
    rec.rip = (await g(() => window.__show.rip)).map((e) => ({ ...e, t: sec(e.step - rec.step0) }));
    rec.after = await g(() => { const c = window.__gw; return { showView: c.fishing.view.show ?? null, cine: !!c.cinematic, state: c.fishing.state, camW: c.debug.camera?.()?.show?.w ?? 0, pose: c.actors.showPose ?? null }; });
    await g(() => { window.__show.tracing = false; window.__show.end(); });
    await g(() => { const c = window.__gw; c.debug.showRate?.(1); c.debug.fishOutcome(null); });
    // ---- the clock (S3), from the bus
    const at = (key) => { const e = rec.log.find((x) => (x.ev === 'fishing:show' ? `${x.ev}:${x.phase}` : x.ev) === key); return e ? e.t : null; };
    const tCaught = at('fishing:caught'), tHold = at('fishing:show:hold'), tPause = at('fishing:show:pause'), tCard = at('fishing:show:card');
    rec.clock = { reveal: tCaught, lift: +(tHold - tCaught).toFixed(3), hold: +(tPause - tHold).toFixed(3), pause: +(tCard - tPause).toFixed(3), total: tCard };
    rec.tCard = tCard;
    check(Math.abs(tCard - P.total) <= 0.15 && tCard <= SH.show.max[info.cls] + 1e-6, `${name}: T0 → card ${tCard} s (plan ${P.total} ± 0.15, never over ${SH.show.max[info.cls]})`, rec.clock);
    check(rec.clock.pause >= SH.show.minPause - 0.035, `${name}: a still pause of ${rec.clock.pause} s before the card`);
    const order = rec.log.filter((e) => ['fishing:landing', 'fishing:caught', 'fishing:show', 'fish:measured', 'fish:landed'].includes(e.ev)).map((e) => (e.ev === 'fishing:show' ? `show:${e.phase}` : e.ev.replace('fishing:', '')));
    check(order.join(' ') === 'landing caught show:lift fish:measured fish:landed show:hold show:pause show:card', `${name}: the events in order, once each`, order);
    // ---- the clean frame (S2)
    const cardStep = trace.find((r) => r.modal === 'catch')?.step ?? Infinity;
    const dirty = trace.filter((r) => r.ui != null && sec(r.step - rec.step0) >= 0.25 && r.step < cardStep && (r.ui > 0 || r.words > 0));
    check(dirty.length === 0, `${name}: nothing of the ui over the picture from T0 + 0.25 s until the card`, dirty.slice(0, 3).map((r) => ({ t: sec(r.step - rec.step0), ui: r.ui, words: r.words })));
    // ---- the picture at the pause (S1)
    const m = rec.frames.find((f) => f.label === (mode === 'strip' ? 'pause2' : 'pause'));
    if (m) {
      const h = m.hull || m.fish, id = m.pose;
      const row = { pinch: phone ? ['w', m.info?.length < 0.2 ? 18 : 30] : ['w', m.info?.length < 0.2 ? 9 : 14], both: ['w', phone ? 55 : 28], hug: ['h', phone ? 38 : 45], hang: ['h', phone ? 38 : 45], alongside: ['w', phone ? 70 : 55] }[id] || ['w', 10];
      const share = h ? (row[0] === 'w' ? h.wPct : h.hPct) : 0;
      rec.picture = { pose: id, wickOffLens: m.wickOffLens, endOn: m.info?.endOn ?? m.fish?.endOn ?? null, hull: m.hull, box: m.fish, wickPct: m.wickPct, head: m.headInFrame, flame: m.flameInFrame, camDist: m.camDist, fov: m.fov, gl: m.gl, want: `${row[0]} ≥ ${row[1]} %`, share };
      log(`${name}: at the pause`, JSON.stringify(rec.picture));
      check(!!h && h.inFrame === 100 && m.headInFrame && m.flameInFrame !== false, `${name}: at the pause the whole fish, the wax head and the flame are in frame`, { hull: m.hull, head: m.headInFrame, flame: m.flameInFrame });
      if (!(share >= row[1]) && !(id === 'alongside' && phone && h?.diagPct >= 45)) note(`${name}: the fish is ${share} % of the frame's ${row[0] === 'w' ? 'width' : 'height'} at the pause (S1's row for ${id}: ≥ ${row[1]} %)`);
      const offLim = id === 'hang' || id === 'alongside' ? 40 : 15;
      check(Math.abs(m.wickOffLens) <= offLim, `${name}: the Wick faces the lens (${m.wickOffLens}° off, limit ${offLim}°)`);
      check(m.ui === 0 && m.words === 0, `${name}: 0 ui elements, 0 words at the pause`, { ui: m.ui, words: m.words });
    }
    // ---- no ring round the raft (S5): no plain ripple asked for within 3.2 m of the raft from T0 − 1.2 s until play resumes
    const rings = rec.rip.filter((e) => e.ring && e.d < 3.2 && e.t >= -1.2);
    rec.rings = rings;
    check(rings.length === 0, `${name}: no ripple ring asked for within 3.2 m of the raft from 1.2 s before T0 to the way out`, rings.slice(0, 6));
    // ---- no pop (S5): the lens from T0 until 1.5 s after the card closes
    let dMax = 0, ddMax = 0, fMax = 0, prev = null, prevD = null;
    for (const r of trace) { if (prev) { const d = Math.hypot(r.x - prev.x, r.y - prev.y, r.z - prev.z); if (prevD != null) ddMax = Math.max(ddMax, Math.abs(d - prevD)); dMax = Math.max(dMax, d); fMax = Math.max(fMax, Math.abs(r.fov - prev.fov)); prevD = d; } prev = r; }
    rec.continuity = { move: +dMax.toFixed(3), jerk: +ddMax.toFixed(3), fov: +fMax.toFixed(2), frames: trace.length, closedAt: sec(stepClose - rec.step0) };
    check(dMax <= 0.9 && ddMax <= 0.45 && fMax <= 1.5, `${name}: no pop in or out (lens ≤ ${dMax.toFixed(2)} m/frame, step change ≤ ${ddMax.toFixed(2)} m, fov ≤ ${fMax.toFixed(2)}°/frame)`, rec.continuity);
    check(rec.after.showView === null && !rec.after.cine && rec.after.state === 'idle' && rec.after.pose === null, `${name}: after the card the show is over (view null, the world unfrozen, the Wick released)`, rec.after);
    log(`${name}: ${sp} ${info.cls} ${info.length} cm · ${rec.picture?.pose} · T0 → card ${tCard} s · ${rec.cardWords} words on the card`);
    notes[name] = rec; writeFileSync(notesPath, JSON.stringify(notes, null, 1));
    await clearModals();
  }

  // ================================================================ a catch as a film: from the strike to the card closing
  async function filmCase([name, sp, z, o], n0) {
    await stage(o);
    if (!(await toBite(name, sp, z))) return n0;
    const STEP = 1000 / 36, EVERY = 3;   // 36 steps a second of the game's real clock, one frame kept in three: 12 a second
    let n = n0;
    const keep = async () => { await wait(60); await shotPng(resolve(videoDir, `f${String(n++).padStart(5, '0')}.png`)); };
    await scale(1);
    await g(() => { const S = window.__show; S.reset(); S.begin(); });
    const run = async (steps, stopOn = null) => {
      let hit = false;
      for (let i = 0; i < steps && !hit; i += EVERY) { hit = (await g(([k, ms, s]) => window.__show.run(k, ms, s), [EVERY, STEP, stopOn])).hit; await keep(); }
      return hit;
    };
    await run(9);   // the float going under
    await g(() => window.__gw.debug.fishStrike('clean'));
    await run(36, null);
    const info = await playInfo();
    // the play runs as it is for up to `play` s of it; a longer one is cut to its last seconds (the film is the show's proof)
    const left = Number.isFinite(o.play) ? o.play : 6;
    if (info.playEnd && info.playEnd - (info.playT || 0) > left) await g(([end, l]) => window.__gw.debug.fishPlayTo(Math.max(0, 1 - l / end)), [info.playEnd, left]);
    if (!(await run(36 * 70, 'landing'))) { failures.push(`${name}: the play never reached the landing`); await g(() => window.__show.end()); return n; }
    const s0 = await g(() => window.__show.step);
    await run(36 * 12, 'card');
    const s1 = await g(() => window.__show.step);
    // the card: its unfold runs on the wall clock, so each kept frame waits its twelfth of a second
    for (let i = 0; i < 30; i++) { await g(([k, ms]) => window.__show.run(k, ms, null), [EVERY, STEP]); await wait(70); await keep(); }
    await closeCard(o.action);
    await run(36 * 2.2);
    await g(() => { window.__show.end(); const c = window.__gw; c.debug.fishOutcome(null); });
    await scale(LOW);
    log(`${name}: filmed ${n - n0} frames; T0 → card ${((s1 - s0) * STEP / 1000).toFixed(2)} s`);
    notes[`film-${name}`] = { case: name, species: sp, cls: info.legendary || info.ancient ? 'ancient' : info.sizeClass, lengthCm: info.length, frames: [n0, n - 1], tCard: +((s1 - s0) * STEP / 1000).toFixed(2), playCutTo: left };
    writeFileSync(notesPath, JSON.stringify(notes, null, 1));
    await clearModals();
    return n;
  }

  if (videoDir) { let n = 0; for (const c of cases) n = await filmCase(c, n); }
  else for (const c of cases) await shootCase(c);
  await g(() => { const c = window.__gw; c.debug.fishOutcome(null); c.debug.timeScale(1); c.debug.showRate?.(1); });
  log(`show-audit (${phone ? 'phone' : 'desktop'}, ${quality}): ${failures.length ? `${failures.length} FAILED` : 'all checks passed'}${notesOut.length ? `; ${notesOut.length} notes` : ''}`);
  for (const n of notesOut) log('note', n);
  return { failures };
}
