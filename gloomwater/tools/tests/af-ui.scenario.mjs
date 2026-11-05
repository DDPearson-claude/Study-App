// AF UI (U2′ the automatic reel's presentation, U19 the fishing log and gear log; DESIGN §25.14.2a) screenshots and checks on a
// v3 phase-1 build driven through window.__gw, desktop (960×540) and phone (390 px portrait):
//
//   node build.mjs --dev --out=tools/out/af-ui.html
//   node tools/playtest.mjs --html=tools/out/af-ui.html --shots=tools/out/af-ui-shots/desktop --script=tools/tests/af-ui.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/af-ui.html --shots=tools/out/af-ui-shots/phone --script=tools/tests/af-ui.scenario.mjs --mobile
//   (--only=strike,play,lock,away,journal,gear,catch,measure,descent,settings takes a subset)
//
// The automatic play itself (F4′ / F2′ / F15) is the fishing branch's, built in parallel: this scenario puts fishing into its real
// bite / reeling states with the P1 debug hooks, freezes game time, and emits the AF events the fishing branch will emit
// (fishing:strike, fishing:reel, fishing:escaped, fish:escaped) with CONTRACT §13.5's payloads. Progression's log APIs (Pg13:
// getOdds, getLoadout, getGearLog, compareOdds, getTackleRating) are likewise a sibling's: when absent, the scenario installs a
// CONTRACT-shaped test shim over data.catchOdds / catchChance / catchRating (test scaffolding only; src/ui never computes a chance).
//
// Acceptance checks (U2′): a DOM + aria scan while fishing.state is bite or reeling finds no species name, rarity word or "%", no
// rarity tint on the bite, and no reel bar, cut or reel control; the strike word per grade; the class estimate after the first
// glimpse; the hurry mark; the got-away toast (Small–Prize) and card (Trophy+) with "Odds in your log"; the card's Strike line; the
// PB and Old Ledger knots and the 2.4 s PB stretch. (U19): every log route refuses with "Reel in first." while a line is out and
// opens once the note shows; the Your odds block (floored %, "?" unseen, "—" unreachable, the best owned item); openLog({speciesId:
// 'quayling', section: 'odds'}) lands on the Landing tab; the gear log's Hold lines and pinned compare; the rating in words; a "%"
// appears only inside the Journal and the gear log.
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

export default async function (api) {
  const { page, wait, evalGame: g, log, width, args } = api;
  page.setDefaultTimeout(240000);
  const failures = [];
  const only = args?.only ? String(args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.some((o) => x.includes(o));
  const phone = width < 700;
  const check = (cond, msg, extra) => { if (cond) { log('ok  ', msg); return true; } failures.push(`${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`); log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : ''); return false; };

  // ---------------------------------------------------------------- boot: fonts, v3 phase 1, a fresh save
  await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
    const url = route.request().url();
    const buf = fetchCached(url);
    if (!buf) return route.abort();
    const ct = /googleapis/.test(url) ? 'text/css; charset=utf-8' : /\.woff2(\?|$)/.test(url) ? 'font/woff2' : 'application/octet-stream';
    return route.fulfill({ status: 200, body: buf, headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
  });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 240000, polling: 500 });
  const fonts = await g(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))]; }).catch(() => []);
  log('fonts', fonts.join(', ') || 'fallback');
  const s0 = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE, af: !!window.__gw.data.AUTOFISH }));
  check(s0.en === true && s0.ph === 1 && s0.af, 'v3 phase-1 build with AUTOFISH', s0);
  await page.mouse.click(2, 200);
  await g(() => {
    const c = window.__gw;
    try { c.render.setQuality?.('medium'); } catch { /* optional */ }
    if (!window.__rafHold) {
      const raf = window.requestAnimationFrame.bind(window);
      let held = null;
      window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
      window.__rafHold = (on) => { if (on) { held = held || []; return true; } if (held) { const q = held; held = null; for (const cb of q) raf(cb); } return false; };
    }
    window.__pump = (sec = 1) => {
      if (window.__perfOff === undefined) { const realNow = performance.now.bind(performance); window.__perfOff = 0; performance.now = () => realNow() + window.__perfOff; }
      for (let i = 0; i < Math.ceil(sec / 0.25); i++) { window.__perfOff += 250; try { c.ui.update(0.25); } catch { /* keep going */ } }
    };
    // the bus as the AF UI hears it (fish:action from the cove card, ui:screen, ui:refused)
    window.__heard = [];
    for (const e of ['fish:action', 'ui:screen', 'ui:refused']) c.bus.on(e, (p) => window.__heard.push({ e, p: { ...p, fish: undefined } }));
  });
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 240) => { const f0 = await frameNo(), t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(200); } return false; };
  const waitFor = async (fn, arg, timeoutS = 60, stepMs = 300) => { const t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  await scale(0.4);
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/af-ui-shots'));
  const shots = [];
  /** Clear banners and stray toasts (pumped UI time) unless told to keep them, render two full-scale frames, hold the loop, capture. */
  async function shot(name, { keep = false, settle = 700 } = {}) {
    if (!keep) for (let i = 0; i < 30; i++) {
      const busy = await g(() => !!document.querySelector('#ui .gw-banner') || !!document.querySelector('#ui .gw-toast:not(.gw-held)'));
      if (!busy) break;
      await g(() => window.__pump(1.5));
      await wait(400);
    }
    await scale(1);
    await frames(2);
    await wait(settle);
    await g(() => window.__rafHold(true));
    await wait(300);
    const p = resolve(shotsDir, `${name}.png`);
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) { try { await page.screenshot({ path: p, timeout: 240000 }); ok = true; } catch (e) { log('shot retry', name, String(e?.message || e).split('\n')[0]); } }
    await g(() => window.__rafHold(false));
    await scale(0.4);
    if (ok) { shots.push(p); log('screenshot', p); }
    return ok;
  }
  /** Freeze every running CSS animation inside a selector at t ms (so a 0.6 s burst can be photographed on software GL). */
  const freezeAnims = (sel, t) => g(([sel, t]) => { for (const el of document.querySelectorAll(sel)) for (const a of el.getAnimations({ subtree: true })) { a.pause(); a.currentTime = Math.min(t, (a.effect?.getTiming?.().duration || t) - 1); } }, [sel, t]);
  const resumeAnims = (sel) => g((sel) => { for (const el of document.querySelectorAll(sel)) for (const a of el.getAnimations({ subtree: true })) a.play(); }, sel);
  const freeze = (on = true) => g((on) => window.__gw.debug.timeScale(on ? 0 : 1), on);
  const place = (x, z, yaw = 0) => g(([x, z, yaw]) => { const c = window.__gw; c.player.teleport ? c.player.teleport(new c.THREE.Vector3(x, 0, z), yaw) : c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); try { c.render.snapCamera?.(); } catch { /* optional */ } }, [x, z, yaw]);
  const idleFishing = () => g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } try { c.fishing.reset?.(); } catch { /* optional */ } if (c.fishing.state !== 'idle') c.fishing.state = 'idle'; });
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => ({ b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused, n: window.__gw.debug.ui?.()?.stack?.length || 0 }));
      if (!m.b && !m.p && !m.n) return;
      await g(() => { const c = window.__gw; const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
      await frames(2);
    }
  };
  const toastText = () => g(() => [...document.querySelectorAll('#ui .gw-toast')].map((t) => t.textContent.trim()).join(' | '));
  const modalId = () => g(() => window.__gw.debug.ui?.()?.openModal ?? null);
  /** The hidden-information scan: visible text + aria-label + title inside #ui. */
  const scan = () => g(() => {
    const c = window.__gw, D = c.data, root = document.getElementById('ui');
    const vis = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.04) return false; } return true; };
    let text = '';
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const t = w.currentNode; if (t.nodeValue.trim() && vis(t.parentElement)) text += ` ${t.nodeValue}`; }
    for (const e of root.querySelectorAll('[aria-label],[title]')) if (vis(e)) text += ` ${e.getAttribute('aria-label') || ''} ${e.getAttribute('title') || ''}`;
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hits = [];
    if (text.includes('%')) hits.push('%');
    for (const n of D.SPECIES.map((s) => s.name)) if (new RegExp(`(^|[^A-Za-z])${esc(n)}($|[^A-Za-z])`, 'i').test(text)) hits.push(n);
    for (const wd of ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']) if (new RegExp(`\\b${wd}\\b`).test(text)) hits.push(wd);
    const bite = root.querySelector('.gw-bite');
    const rc = bite ? getComputedStyle(bite).getPropertyValue('--rc').trim() : '';
    const reel = root.querySelector('.gw-reel');
    return { state: c.fishing.state, hits, rc, reelVisible: !!reel && vis(reel) && getComputedStyle(reel).display !== 'none', controls: /\b(cut the line|cut|reel in|hold to reel|ease)\b/i.test(text), sample: text.replace(/\s+/g, ' ').slice(0, 240) };
  });

  // ---------------------------------------------------------------- run 1: the First Outing (Still): the strike ring is on by default
  await g(() => window.__gw.game.startNewRun({ character: 'wick' }));
  await waitFor(() => window.__gw.flow === 'playing', null, 120);
  await frames(4);
  await clearModals();
  await g(() => { const c = window.__gw; c.debug.god?.(true); const m = c.state.meta; m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) m.seenTips[t.id] = true; c.debug.setOil(80); c.debug.setSatiety(90); c.debug.setPhase?.('calm'); });
  await place(4, 14.8);
  await frames(3);
  // progression's log APIs (Pg13) are a sibling's: a CONTRACT-shaped shim when absent (test only)
  const shim = await g(() => {
    const c = window.__gw, D = c.data, P = c.progression;
    const added = [];
    const meta = () => c.state.meta;
    const buffs = () => ({ relics: { ...(meta().relics || {}) } });
    const lo = () => { const r = c.state.run; const t = D.upgradeTiers(r?.upgrades || {}); return { rod: t.rod, line: t.line, reel: t.reel, hold: D.upgradeHold(r?.upgrades || {}), item: r?.equipped ?? r?.equippedBait ?? null }; };
    const lake = () => c.state.run?.zone || 'mossmere';
    const known = (id) => { const e = meta().journal?.[id]; return !e ? 'unseen' : (e.caught | 0) > 0 ? 'caught' : e.seen ? 'glimpsed' : 'caught'; };
    const owned = () => { const r = c.state.run || {}; return [...Object.keys(r.bait || {}).filter((k) => r.bait[k] > 0), ...Object.keys(r.lures || {}).filter((k) => r.lures[k])].filter((k) => D.CATCH_V3.items[k]); };
    if (typeof P.getLoadout !== 'function') { P.getLoadout = lo; added.push('getLoadout'); }
    if (typeof P.getOdds !== 'function') {
      P.getOdds = (id) => {
        const k = known(id), L = lo(), sp = D.SPECIES_BY_ID[id];
        if (k === 'unseen' || !sp) return { known: 'unseen', odds: null, withBest: null, marked: [], wounds: 0 };
        const z = sp.zone === 'cove' ? 'cove' : (sp.zone || lake());
        const odds = D.catchOdds(id, L, { buffs: buffs(), lake: z });
        const b = D.catchBestItem(sp, owned());
        const withBest = b.id && b.id !== L.item ? { item: b.id, odds: D.catchOdds(id, { ...L, item: b.id }, { buffs: buffs(), lake: z }) } : null;
        const marked = (meta().markedFish || []).filter((m) => m.speciesId === id).map((m) => ({ name: m.name, sizeClass: D.sizeClassOf(m.z), approxLength: m.approxLength ?? D.sizeLength(sp, m.z, z), p: D.catchChance(id, D.sizeClassOf(m.z), L, { buffs: buffs(), lake: z, marked: true }) }));
        return { known: k, odds, withBest, marked, wounds: meta().legendWounds?.[id] | 0 };
      };
      added.push('getOdds');
    }
    if (typeof P.compareOdds !== 'function') { P.compareOdds = (id, cls, A, B) => ({ a: D.catchChance(id, cls, A, { buffs: buffs() }), b: D.catchChance(id, cls, B, { buffs: buffs() }) }); added.push('compareOdds'); }
    if (typeof P.getTackleRating !== 'function') { P.getTackleRating = (zone, L) => D.catchRating(zone, L || lo(), {}); added.push('getTackleRating'); }
    if (typeof P.getGearLog !== 'function') {
      window.__lastAway = null;
      c.bus.on('fish:escaped', (p) => { window.__lastAway = { speciesId: p.speciesId, sizeClass: p.sizeClass, reason: p.reason }; });
      P.getGearLog = () => {
        const r = c.state.run || {}, up = r.upgrades || {}, now = D.upgradeHold(up), L = lo(), met = new Set(Object.keys(meta().journal || {}));
        const entries = [];
        for (const [slot, ids] of Object.entries(D.BALANCE.upgradeTiers.slots)) {
          if (slot === 'creel') continue;
          for (const id of ids) {
            const u = D.UPGRADE_BY_ID[id]; if (!u) continue;
            const lv = up[id] | 0;
            if (lv >= u.maxLevel) continue;
            const nx = D.upgradeHold({ ...up, [id]: lv + 1 });
            entries.push({ id, kind: slot, name: u.name, hold: nx[slot] - now[slot], owned: lv, max: u.maxLevel, loadout: { ...L, hold: nx } });
          }
        }
        for (const [id, it] of Object.entries(D.CATCH_V3.items)) {
          if (it.kind === 'upgrade') continue;
          const tg = D.catchItemTargets(id);
          const targets = it.all ? 'all' : it.species ? { species: it.species } : it.family ? { family: it.family, met: tg.filter((x) => met.has(x)).length } : it.night ? { night: true, met: tg.filter((x) => met.has(x)).length } : tg.filter((x) => met.has(x));
          entries.push({ id, kind: it.kind, name: D.BAIT_BY_ID?.[id]?.name || D.LURES.find((l) => l.id === id)?.name || id, hold: it.hold, targets });
        }
        entries.pinned = window.__lastAway;
        return entries;
      };
      added.push('getGearLog');
    }
    return added;
  });
  log('progression shim (absent Pg13 APIs):', shim.join(', ') || 'none');
  // a little history: the Reedjaw landed (PB 97 cm), a Gloam Eel only lost (Glimpsed, with its Got away list), Ember Roe in the bag
  await g(() => {
    const c = window.__gw, m = c.state.meta, r = c.state.run;
    m.journal = m.journal || {};
    m.journal.reedjaw_pike = { ...(m.journal.reedjaw_pike || {}), caught: 4, biggest: 6.2, pbLength: 97, firstDay: 1, firstRun: 1 };
    m.journal.mossback_perch = { ...(m.journal.mossback_perch || {}), caught: 7, biggest: 0.6, pbLength: 24 };
    m.journal.dusk_minnow = { ...(m.journal.dusk_minnow || {}), caught: 3, biggest: 0.05, pbLength: 9.1 };
    m.journal.gloam_eel = { caught: 0, seen: true, gotAway: [{ sizeClass: 'trophy', length: 118, place: null, zone: 'mossmere', day: 2, reason: 'thrown' }, { sizeClass: 'keeper', length: 52, place: null, zone: 'mossmere', day: 1, reason: 'spat' }] };
    r.bait = r.bait || {}; r.bait.ember_roe = 4; r.bait.mireworm = 6;
    r.upgrades = { ...(r.upgrades || {}), rod_ashwood: 1, line_gut: 1 };
    try { c.progression.equipBait?.('mireworm'); } catch { /* optional */ }
  });

  // ---------------------------------------------------------------- U2′: the bite, the strike ring and the strike word
  if (want('strike')) {
    await idleFishing();
    await frames(2);
    await g(() => window.__gw.debug.forceBite({ speciesId: 'reedjaw_pike', z: 2.4, wait: 0.3 }));
    const bit = await waitFor(() => window.__gw.fishing.state === 'bite', null, 120, 80);
    await freeze(true);
    await frames(2);
    let sc = await scan();
    check(bit && sc.state === 'bite', 'fishing reached its real bite state', sc.state);
    check(!sc.hits.length, 'bite: the DOM / aria scan finds no species name, rarity or %', sc);
    check(sc.rc === '#ffe2a8' && !sc.reelVisible && !sc.controls, 'bite: no rarity tint on the "!", no reel bar, no reel or cut control', sc);
    const ring = await g(() => ({ on: document.querySelector('#ui .gw-bite')?.classList.contains('gw-ring'), r: document.querySelector('#ui .gw-bite .k')?.getAttribute('r'), dbg: window.__gw.debug.ui().af }));
    check(ring.on && Number(ring.r) > 12, 'the strike ring closes on the float (on by default on the First Outing)', ring);
    await shot('01-bite-ring');
    for (const grade of ['clean', 'struck', 'early']) {
      await g((grade) => window.__gw.bus.emit('fishing:strike', { grade, sizeClass: 'trophy' }), grade);
      await freezeAnims('#ui .gw-strike', grade === 'clean' ? 210 : 260);
      const w = await g(() => ({ word: document.querySelector('#ui .gw-strike-w')?.textContent, on: document.querySelector('#ui .gw-strike')?.classList.contains('gw-on'), tone: document.querySelector('#ui .gw-strike-w')?.className }));
      check(w.on && w.word === { clean: 'Clean', struck: 'Struck', early: 'Early' }[grade], `fishing:strike ${grade}: the word "${w.word}" under the float`, w);
      sc = await scan();
      check(!sc.hits.length && !sc.controls, `strike (${grade}): still no species, rarity or %`, sc);
      await shot(`02-strike-${grade}`, { keep: true, settle: 200 });
      await resumeAnims('#ui .gw-strike');
    }
    // "Struck" prints for the first 20 strikes only
    const struck20 = await g(() => { const m = window.__gw.state.meta; const was = m.seenTips.ui_struck; m.seenTips.ui_struck = 20; window.__gw.bus.emit('fishing:strike', { grade: 'struck', sizeClass: 'keeper' }); const t = document.querySelector('#ui .gw-strike-w')?.textContent; m.seenTips.ui_struck = was; return t; });
    check(struck20 === '', 'after 20 strikes "Struck" leaves the word to the ring', struck20);
    await freeze(false);
    await idleFishing();
  }

  // ---------------------------------------------------------------- U2′: the play: only the class estimate and the hurry mark
  if (want('play')) {
    await clearModals();
    await idleFishing();
    await g(() => window.__gw.debug.fishHook?.('reedjaw_pike', { z: 2.45 }));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 90);
    await frames(2);
    await freeze(true);
    await frames(2);
    let sc = await scan();
    check(sc.state === 'reeling' && !sc.hits.length, 'reeling: the DOM / aria scan finds no species name, rarity or %', sc);
    check(!sc.reelVisible && !sc.controls, 'reeling: no reel bar, pips or Ease glyph; no cut or reel control', sc);
    const est0 = await g(() => document.querySelector('#ui .gw-play-est')?.classList.contains('gw-on'));
    check(!est0, 'no class estimate before the first glimpse', est0);
    // the first Prize+ glimpse (the fishing branch sets view.sizeClass with it and emits the beat)
    await g(() => { const c = window.__gw; c.fishing.view.sizeClass = 'trophy'; c.fishing.view.ancient = false; c.bus.emit('fishing:reel', { phase: 'glimpse', sizeClass: 'trophy', t: 3.1, dur: 9.4, strength: 0.6, tier: 0.5, length: c.data.presentLength('mossmere', 2.45) }); });
    await frames(3);
    const est = await g(() => ({ txt: document.querySelector('#ui .gw-play-est')?.textContent?.replace(/\s+/g, ' ').trim(), seal: !!document.querySelector('#ui .gw-play-est .gw-seal') }));
    check(/by the look of it/.test(est.txt) && /Trophy/.test(est.txt) && est.seal, 'the first glimpse stamps the class estimate (seal + "by the look of it: Trophy")', est);
    sc = await scan();
    check(!sc.hits.length && !sc.controls, 'with the estimate up: still nothing names the fish', sc);
    await shot('03-play-estimate');
    // an Elder past its line (Ancient)
    await g(() => { const v = window.__gw.fishing.view; v.sizeClass = 'elder'; v.ancient = true; });
    await frames(2);
    await shot('04-play-estimate-ancient');
    await freeze(false);
    await idleFishing();
    // a Keeper held to hurry (from the 2nd run): the hurry mark, nothing else
    await g(() => window.__gw.debug.fishHook?.('mossback_perch', { z: 0.2 }));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 90);
    await freeze(true);
    await frames(2);
    await g(() => { const v = window.__gw.fishing.view; v.sizeClass = null; v.play = { t: 1.2, dur: 3.8, phase: 'gain', k: 0.3, line: 0.4, bend: 0.4, glimpse: false, leap: false, hurry: true }; });
    await frames(3);
    const hu = await g(() => document.querySelector('#ui .gw-play-hurry')?.classList.contains('gw-on'));
    sc = await scan();
    check(hu && !sc.hits.length && !sc.controls, 'a hurried Keeper play: the hurry mark only', { hu, sc });
    await shot('05-play-hurry');
    await g(() => { delete window.__gw.fishing.view.play; });
    await freeze(false);
    await idleFishing();
  }

  // ---------------------------------------------------------------- U19: the log lock on every route
  if (want('lock')) {
    await clearModals();
    await idleFishing();
    await g(() => window.__gw.debug.fishHook?.('reedjaw_pike', { z: 1.6 }));
    await waitFor(() => window.__gw.fishing.state === 'reeling', null, 90);
    await freeze(true);
    await frames(2);
    await g(() => { window.__heard.length = 0; });
    const routes = await g(() => {
      const c = window.__gw, ui = c.ui, out = {};
      const opened = () => c.debug.ui().stack.filter((id) => ['journal', 'gear', 'shop', 'creel'].includes(id));
      out.locked = ui.logLocked();
      ui.handleKey('KeyJ'); out.KeyJ = opened();
      document.querySelector('#ui .gw-st-journal')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); out.hudJournal = opened();
      out.openLog = ui.openLog({ speciesId: 'reedjaw_pike', section: 'odds' }); out.afterOpenLog = opened();
      ui.openShop(); out.murk = opened();
      ui.openTackle(); out.gear = opened();
      ui.handleKey('KeyC'); out.creel = opened();
      out.journalTitle = document.querySelector('#ui .gw-st-journal')?.getAttribute('title');
      out.refused = window.__heard.filter((h) => h.e === 'ui:refused').map((h) => h.p.route);
      return out;
    });
    const t1 = await toastText();
    check(routes.locked && !routes.KeyJ.length && !routes.hudJournal.length && routes.openLog === false && !routes.afterOpenLog.length && !routes.murk.length && !routes.gear.length && !routes.creel.length,
      'while a line is out: J, the HUD Journal, openLog (the got-away link and the First Evening glyph route), Murk\'s rows and the gear log all refuse', routes);
    check(/Reel in first\./.test(t1) && routes.journalTitle === 'Reel in first.', 'each refuses with "Reel in first." (the Journal button reads it)', { t1, title: routes.journalTitle });
    await shot('06-lock-refused', { keep: true });
    // pause → Journal
    await g(() => window.__gw.game.pause?.());
    await waitFor(() => !!document.querySelector('#ui .gw-m-pause'), null, 30, 200);
    const pj = await g(() => { const b = document.querySelector('#ui .gw-m-pause [data-link="journal"]'); const lockedCls = b?.classList.contains('gw-locked'); b?.click(); return { lockedCls, open: window.__gw.debug.ui().stack.includes('journal'), label: b?.getAttribute('aria-label') }; });
    check(pj.lockedCls && !pj.open && /Reel in first/.test(pj.label || ''), 'pause → Journal shows and says "Reel in first." and refuses', pj);
    await shot('07-pause-locked', { keep: true });
    await g(() => window.__gw.game.resume?.());
    await frames(2);
    // a loss: the quiet beat keeps it shut; the note lifts it
    const lossLock = await g(() => {
      const c = window.__gw;
      c.bus.emit('fishing:escaped', { reason: 'thrown', sizeClass: 'prize' });
      c.fishing.state = 'lost';
      const beat = c.ui.logLocked();
      const tried = c.ui.openLog({ speciesId: 'reedjaw_pike' });
      c.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', sizeClass: 'prize', z: 1.6, approxLength: 74, reason: 'thrown', place: null, x: 0, zPos: 0, markedFish: false, grade: 'struck', legendary: false });
      const after = c.ui.logLocked();
      return { beat, tried, after };
    });
    check(lossLock.beat && lossLock.tried === false && !lossLock.after, 'after a loss: locked through the quiet beat, open once the got-away note shows', lossLock);
    const opened = await g(() => { const ok = window.__gw.ui.openLog({ speciesId: 'reedjaw_pike', section: 'odds', sizeClass: 'prize' }); return { ok, stack: window.__gw.debug.ui().stack }; });
    check(opened.ok && opened.stack.includes('journal'), '…and the log opens then (the note\'s "Odds in your log")', opened);
    await clearModals();
    await g(() => { window.__gw.fishing.state = 'idle'; });
    await freeze(false);
    await idleFishing();
  }

  // ---------------------------------------------------------------- U2′: the got-away toast and card
  if (want('away')) {
    await clearModals();
    await idleFishing();
    await frames(3);
    await g(() => { const c = window.__gw; c.bus.emit('fishing:escaped', { reason: 'spat', sizeClass: 'small' }); c.bus.emit('fish:escaped', { speciesId: 'dusk_minnow', sizeClass: 'small', z: -1.2, approxLength: 8.6, reason: 'spat', place: null, x: 0, zPos: 0, markedFish: false, grade: 'clean', legendary: false }); });
    await frames(2);
    await freezeAnims('#ui .gw-away', 2000);
    const toast = await g(() => ({ on: document.querySelector('#ui .gw-away')?.classList.contains('gw-on'), t: document.querySelector('#ui .gw-away-t')?.textContent, card: document.querySelector('#ui .gw-gotaway')?.classList.contains('gw-on') }));
    check(toast.on && !toast.card && toast.t === 'A Dusk Minnow spat the hook.', 'a Small got away: the one-line toast ("A Dusk Minnow spat the hook.")', toast);
    let sc = await scan();
    check(!sc.hits.includes('%'), 'the toast carries no %', sc);
    await shot('08-gotaway-toast', { keep: true });
    await resumeAnims('#ui .gw-away');
    await g(() => { const c = window.__gw; c.bus.emit('fishing:escaped', { reason: 'snapped', sizeClass: 'elder' }); c.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', sizeClass: 'elder', z: 3.05, approxLength: 163, reason: 'snapped', beat: 'lastStand', place: null, x: 2, zPos: 9, markedFish: true, name: 'Old Ninefin', grade: 'struck', legendary: false }); });
    await frames(2);
    await wait(900);
    await freezeAnims('#ui .gw-gotaway', 1400);
    const card = await g(() => { const q = (s) => document.querySelector(`#ui .gw-gotaway ${s}`)?.textContent?.trim(); return { on: document.querySelector('#ui .gw-gotaway')?.classList.contains('gw-on'), k: q('.gw-ga-k'), title: q('.gw-ga-title'), name: q('.gw-ga-name'), line: q('.gw-ga-line'), still: q('.gw-ga-still'), hint: q('.gw-ga-hint'), link: q('.gw-ga-link') }; });
    check(card.on && card.title === 'Reedjaw Pike' && /Old Ninefin/.test(card.name) && /An Elder, near 1\.6\s?m\. It parted the line on its last run\./.test(card.line) && /in that deep water/.test(card.still) && /Heavier line/.test(card.hint) && /Odds in your log/.test(card.link),
      'an Elder got away: the ink card (name, near-length, cause, still out there, the gear hint, "Odds in your log")', card);
    sc = await scan();
    check(!sc.hits.includes('%'), 'the card carries no %', sc);
    await shot('09-gotaway-card', { keep: true });
    await resumeAnims('#ui .gw-gotaway');
    // the link opens that species at that class
    await g(() => document.querySelector('#ui .gw-ga-link')?.click());
    await waitFor(() => window.__gw.debug.ui().openModal === 'journal', null, 30, 200);
    const jo = await g(() => ({ sel: document.querySelector('#ui .gw-jr-card.gw-on .gw-jr-name')?.textContent, hl: document.querySelector('#ui .gw-odds-c.gw-hl small')?.textContent, cells: [...document.querySelectorAll('#ui .gw-odds-c b')].map((b) => b.textContent) }));
    check(/Reedjaw/.test(jo.sel || '') && jo.hl === 'Elder' && jo.cells.length === 6 && jo.cells.every((x) => /^\d+%$/.test(x)), '"Odds in your log" opens the Reedjaw at Elder in the Your odds block', jo);
    await shot('10-journal-odds-from-card', { settle: 900 });
    await clearModals();
  }

  // ---------------------------------------------------------------- U19: the Journal's Your odds block, Glimpsed, unseen, the Landing tab
  if (want('journal')) {
    await clearModals();
    await idleFishing();
    await g(() => window.__gw.ui.openLog({ speciesId: 'reedjaw_pike', section: 'odds' }));
    await waitFor(() => window.__gw.debug.ui().openModal === 'journal', null, 30, 200);
    const jr = await g(() => ({ kit: document.querySelector('#ui .gw-odds-kit')?.textContent, cells: [...document.querySelectorAll('#ui .gw-odds-c')].map((c) => `${c.querySelector('small').textContent} ${c.querySelector('b').textContent}`), withB: document.querySelector('#ui .gw-odds-with')?.textContent?.replace(/\s+/g, ' ').trim(), notes: [...document.querySelectorAll('#ui .gw-odds-note')].map((n) => n.textContent) }));
    const want6 = await g(() => { const c = window.__gw, D = c.data, P = c.progression; const o = P.getOdds('reedjaw_pike'); return ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'].map((k) => `${D.catchDisplay(o.odds[k])}%`); });
    check(jr.cells.map((x) => x.split(' ').pop()).join() === want6.join(), 'Your odds: each class prints progression.getOdds\'s p as data.catchDisplay (floored)', { jr, want6 });
    check(/With the Ember Roe:/.test(jr.withB || '') && /Ashwood/.test(jr.kit || '') && jr.notes.length === 2, 'the best owned item\'s row ("With the Ember Roe: …"), the loadout line and the fine print', jr);
    await shot('11-journal-odds', { settle: 900 });
    // an unseen species: "?" everywhere
    await g(() => { const c = [...document.querySelectorAll('#ui .gw-jr-card')].find((x) => x.classList.contains('gw-unknown') && !x.classList.contains('gw-glimpsed')); c?.click(); });
    await frames(2);
    const un = await g(() => ({ cells: [...document.querySelectorAll('#ui .gw-odds-c b')].map((b) => b.textContent), note: document.querySelector('#ui .gw-odds-note')?.textContent }));
    check(un.cells.length === 6 && un.cells.every((x) => x === '?') && /Land or lose one/.test(un.note || ''), 'a species neither landed nor lost: "?" for every class', un);
    await shot('12-journal-unseen', { settle: 600 });
    // a Glimpsed species (lost before it was ever landed): named, ink silhouette, its odds, the Got away list
    await g(() => { const c = [...document.querySelectorAll('#ui .gw-jr-card')].find((x) => x.classList.contains('gw-glimpsed')); c?.click(); });
    await frames(2);
    const gl = await g(() => ({ k: document.querySelector('#ui .gw-glimpse-k')?.textContent, h: document.querySelector('#ui .gw-jr-detail h3')?.textContent, list: [...document.querySelectorAll('#ui .gw-gotlist li')].map((l) => l.textContent), cells: [...document.querySelectorAll('#ui .gw-odds-c b')].map((b) => b.textContent) }));
    check(gl.k === 'Glimpsed' && gl.h === 'Gloam Eel' && gl.list.length === 2 && gl.cells.every((x) => /%$/.test(x)), 'a Glimpsed page: the name, "Glimpsed", its odds and the Got away list', gl);
    await shot('13-journal-glimpsed', { settle: 600 });
    await clearModals();
    // the Landing tab: openLog({speciesId: 'quayling', section: 'odds'})
    const q = await g(() => { const ok = window.__gw.ui.openLog({ speciesId: 'quayling', section: 'odds' }); const tab = document.querySelector('#ui .gw-m-journal .gw-tab.gw-on span')?.textContent; const cells = [...document.querySelectorAll('#ui .gw-odds-c b')].map((b) => b.textContent); return { ok, tab, cells }; });
    check(q.ok && q.tab === 'Landing' && q.cells.length === 6 && q.cells.slice(2).every((x) => x === '—' || x === '?'), 'openLog({speciesId: "quayling", section: "odds"}) lands on the Landing tab ("—" from Prize up once known)', q);
    await g(() => { window.__gw.state.meta.journal.quayling = { caught: 1, pbLength: 9.4 }; const e = window.__gw.ui; e.closeAll(); e.openLog({ speciesId: 'quayling', section: 'odds' }); });
    await frames(2);
    const q2 = await g(() => [...document.querySelectorAll('#ui .gw-odds-c b')].map((b) => b.textContent));
    check(/^\d+%$/.test(q2[0]) && q2.slice(2).every((x) => x === '—'), 'the Quayling once landed: Small / Keeper %, "—" from Prize up', q2);
    await shot('14-journal-landing', { settle: 900 });
    await clearModals();
  }

  // ---------------------------------------------------------------- U19: the gear log (read-only page and Murk's rows)
  if (want('gear')) {
    await clearModals();
    await idleFishing();
    await g(() => { window.__lastAway = window.__lastAway || { speciesId: 'reedjaw_pike', sizeClass: 'trophy', reason: 'thrown' }; window.__lastAway = { speciesId: 'reedjaw_pike', sizeClass: 'trophy', reason: 'thrown' }; });
    await g(() => window.__gw.ui.openTackle());
    await waitFor(() => window.__gw.debug.ui().openModal === 'gear', null, 30, 200);
    const gr = await g(() => ({ sub: document.querySelector('#ui .gw-m-gear .gw-psub')?.textContent, pin: document.querySelector('#ui .gw-gear-pin')?.textContent?.replace(/\s+/g, ' ').trim(), holds: [...document.querySelectorAll('#ui .gw-item-hold')].map((x) => x.textContent), cmps: [...document.querySelectorAll('#ui .gw-item-cmp')].map((x) => x.textContent) }));
    check(/^Against the Reedjaw Pike: holds /.test(gr.sub || '') && !/%/.test(gr.sub || ''), 'the gear log\'s heading: the tackle rating in words, no %', gr.sub);
    check(/The Reedjaw Pike that threw the hook \(Trophy\)/.test(gr.pin || '') && gr.cmps.some((x) => /^The Reedjaw Pike that threw the hook \(Trophy\): \d+% → \d+% with this\.$/.test(x)), 'the compare is pinned to the last fish that got away', { pin: gr.pin, cmps: gr.cmps.slice(0, 3) });
    check(gr.holds.some((x) => /counts ×1\.6 against leapers/.test(x)) && gr.holds.some((x) => /Hold against Reedjaw Pike, Weeping Carp/.test(x)) && gr.holds.some((x) => /^\+2 Hold on every fish\.$/.test(x)), 'each item\'s Hold, its ×1.6 styles and the fish it helps', gr.holds.slice(0, 8));
    await shot('15-gear-log', { settle: 900 });
    await clearModals();
    await g(() => window.__gw.ui.openShop());
    await waitFor(() => window.__gw.debug.ui().openModal === 'shop', null, 30, 200);
    await g(() => { const t = [...document.querySelectorAll('#ui .gw-m-shop .gw-tab')].find((b) => /Bait/.test(b.textContent)); t?.click(); });
    await frames(2);
    const sb = await g(() => ({ holds: [...document.querySelectorAll('#ui .gw-m-shop .gw-item-hold')].length, cmps: [...document.querySelectorAll('#ui .gw-m-shop .gw-item-cmp')].map((x) => x.textContent) }));
    check(sb.holds > 0 && sb.cmps.length > 0, 'Murk\'s Bait rows are the gear log: Hold lines and the pinned compare', sb);
    await shot('16-murk-bait', { settle: 900 });
    await g(() => { const t = [...document.querySelectorAll('#ui .gw-m-shop .gw-tab')].find((b) => /Gear/.test(b.textContent)); t?.click(); });
    await frames(2);
    const sg = await g(() => ({ rate: document.querySelector('#ui .gw-shop-rate')?.textContent, holds: [...document.querySelectorAll('#ui .gw-m-shop .gw-item-hold')].map((x) => x.textContent).slice(0, 3) }));
    check(/^Against the Reedjaw Pike: /.test(sg.rate || '') && !/%/.test(sg.rate || '') && sg.holds.length > 0, 'Murk\'s Gear tab: the rating in words and each level\'s Hold', sg);
    await shot('17-murk-gear', { settle: 900 });
    await clearModals();
  }

  // ---------------------------------------------------------------- U2′: the card's Strike line; the cove card (Release only)
  if (want('catch')) {
    await clearModals();
    await idleFishing();
    await g(() => { window.__gw.bus.emit('fishing:cast', {}); window.__gw.bus.emit('fishing:strike', { grade: 'clean', sizeClass: 'trophy' }); window.__gw.debug.instantCatch('reedjaw_pike', { z: 2.35 }); });
    await waitFor(() => window.__gw.debug.ui()?.openModal === 'catch', null, 120);
    await wait(2400);
    const cc = await g(() => ({ stats: document.querySelector('#ui .gw-m-catch .gw-cc-stats')?.textContent?.replace(/\s+/g, ' '), strike: document.querySelector('#ui .gw-m-catch .gw-cc-strike')?.textContent, pct: /%/.test(document.querySelector('#ui .gw-m-catch')?.innerText || '') }));
    check(cc.strike === 'Clean' && !cc.pct, 'the catch card: one line for the strike grade ("strike Clean"), no %', cc);
    await shot('18-catch-strike', { settle: 300 });
    await g(() => { document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click(); });
    await clearModals();
    // a cove catch: Release only, and the card's close is fish:action {action: 'release'}
    await g(() => { window.__heard.length = 0; window.__gw.ui.showCatch({ uid: 'q-test', speciesId: 'quayling', z: -0.3, sizeClass: 'small', ancient: false, length: 9.6, weight: 0.012, quality: 'normal', favours: [], cove: true }, { cove: true, grade: 'struck', isNew: true }); });
    await waitFor(() => window.__gw.debug.ui()?.openModal === 'catch', null, 30, 200);
    await wait(2200);
    const cv = await g(() => ({ acts: [...document.querySelectorAll('#ui .gw-m-catch .gw-catch-actions .gw-btn')].map((b) => b.dataset.action), worth: /worth/.test(document.querySelector('#ui .gw-m-catch .gw-cc-stats')?.textContent || ''), kicker: document.querySelector('#ui .gw-m-catch .gw-cc-kicker')?.textContent }));
    check(cv.acts.join() === 'release' && !cv.worth, 'the cove card offers Release only, and no worth (sales refused)', cv);
    await shot('19-catch-cove', { settle: 300 });
    await g(() => document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click());
    await frames(2);
    const fa = await g(() => window.__heard.filter((h) => h.e === 'fish:action').map((h) => h.p));
    check(fa.length === 1 && fa[0].action === 'release' && fa[0].speciesId === 'quayling', 'closing it emits fish:action {action: "release"} once (the First Evening listens)', fa);
    await clearModals();
  }

  // ---------------------------------------------------------------- U2′: the cord's PB and Old Ledger knots; the 2.4 s PB stretch
  if (want('measure')) {
    await clearModals();
    await idleFishing();
    await g(() => { window.__gw.state.meta.journal.mossback_perch.pbLength = 14; window.__gw.debug.instantCatch('mossback_perch', { z: 0.25 }); });
    const got = await waitFor(() => !!window.__gw.ui.measureDebug?.(), null, 60, 100);
    const md0 = await g(() => window.__gw.ui.measureDebug?.());
    check(got && md0?.knots && md0.knots.passesBest && md0.plan.dur === 2.4, 'a Keeper passing its PB knot: the ceremony runs 2.4 s (AUTOFISH.ceremony.pbStretch)', md0 && { plan: md0.plan?.dur, knots: md0.knots });
    await waitFor(() => { const d = window.__gw.ui.measureDebug?.(); return !d || d.stamped || d.t > d.plan.cordStart + d.plan.cordDur * 0.85; }, null, 60, 60);
    await g(() => window.__rafHold(true));
    const kn = await g(() => ({ pb: !!document.querySelector('#ui .gw-ms-pb'), passed: document.querySelector('#ui .gw-ms-pb')?.classList.contains('gw-passed'), ledger: !!document.querySelector('#ui .gw-ms-ledger'), dbg: window.__gw.ui.measureDebug?.()?.knots }));
    await g(() => window.__rafHold(false));
    check(kn.pb && kn.ledger, 'the cord carries your PB knot (oxblood) and the Old Ledger knot (black)', kn);
    check(kn.passed && kn.dbg?.stung, 'passing the PB knot flares it and plays the sting', kn);
    await g(() => window.__rafHold(true));
    const p = resolve(shotsDir, '20-measure-knots.png');
    try { await page.screenshot({ path: p, timeout: 240000 }); shots.push(p); log('screenshot', p); } catch (e) { log('shot failed', String(e?.message || e).split('\n')[0]); }
    await g(() => window.__rafHold(false));
    await waitFor(() => window.__gw.debug.ui()?.openModal === 'catch', null, 60, 200);
    await clearModals();
  }

  // ---------------------------------------------------------------- U19: the Set Out rating in words (the New Descent card in P1–P2)
  if (want('descent')) {
    await clearModals();
    await idleFishing();
    await g(() => window.__gw.ui.openNewDescent());
    await waitFor(() => window.__gw.debug.ui()?.openModal === 'newdescent', null, 30, 200);
    await g(() => document.querySelector('#ui .gw-m-newdescent .gw-pf .gw-btn--primary')?.click());
    await frames(2);
    const nd = await g(() => document.querySelector('#ui .gw-rating')?.textContent);
    check(/^Against the Reedjaw Pike: holds \w+s?\./.test(nd || '') && !/%|\d/.test(nd || ''), 'the New Descent card rates the tackle in words, never a %', nd);
    await shot('21-newdescent-rating', { settle: 900 });
    await clearModals();
  }

  // ---------------------------------------------------------------- settings: the strike ring and the hurry hold; no reel button
  if (want('settings')) {
    await clearModals();
    await g(() => window.__gw.ui.openSettings());
    await waitFor(() => window.__gw.debug.ui()?.openModal === 'settings', null, 30, 200);
    await g(() => { const sc = document.querySelector('#ui .gw-m-settings .gw-scroll'); if (sc) sc.scrollTop = sc.scrollHeight; });
    const st = await g(() => { const t = document.querySelector('#ui .gw-m-settings')?.innerText || ''; return { ring: /Strike ring/.test(t), hurry: /Hold to hurry/.test(t), reel: /Tap to reel/.test(t) }; });
    check(st.ring && st.hurry && !st.reel, 'Settings → Fishing: the strike ring and the hurry hold; no "Tap to reel"', st);
    await shot('22-settings-fishing', { settle: 600 });
    await clearModals();
  }

  // ---------------------------------------------------------------- a % only inside the Journal and the gear log
  {
    await clearModals();
    await idleFishing();
    await frames(3);
    const sc = await scan();
    check(!sc.hits.includes('%'), 'idle HUD: no % anywhere', sc);
  }

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs);
  log(`shots: ${shots.length}`);
  return { failures };
}
