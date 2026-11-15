// The catch card in pounds, captured and checked (docs/v3/pounds/SPEC.md §3, §7.9): on the v3 phase-1 build a perch, a small
// minnow (ounces) and a trophy carp (a long pounds-and-ounces hero) are landed with debug.instantCatch; each card's hero must be
// the weight (counted up inside its sizer: the stamp row never moves), its list must open with the length line in cm, no kg may
// show, and nothing may overflow the card. Then the perch's Journal page (Biggest and Weight in pounds).
//
//   node build.mjs --dev --out=tools/out/pounds/dev.html     (this scenario turns v3 on with ?v3=1&v3phase=1)
//   node tools/playtest.mjs --html=tools/out/pounds/dev.html --shots=tools/out/pounds/desktop --script=tools/tests/pounds-shots.scenario.mjs --width=1280 --height=720
//   node tools/playtest.mjs --html=tools/out/pounds/dev.html --shots=tools/out/pounds/phone --script=tools/tests/pounds-shots.scenario.mjs --mobile
//   (--only=perch,journal takes a subset: perch, small, trophy, journal)
//
// Web fonts: like tools/tests/p1b-ui.scenario.mjs, the stylesheets the page links are served from tools/out/.font-cache (fetched
// with curl on a miss), so the shots show the real hand.
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
const WEIGHT = /^([¼½¾]|\d{1,2}) oz$|^\d{1,2} lb \d{1,2} oz$|^\d{1,3}(,\d{3})* lb$/;
const toOz = (t) => { const m = /^(?:([\d,]+) lb)?(?: ?([¼½¾]|\d+) oz)?$/.exec(String(t)); if (!m) return NaN; return (m[1] ? Number(m[1].replace(/,/g, '')) * 16 : 0) + (m[2] ? ({ '¼': 0.25, '½': 0.5, '¾': 0.75 }[m[2]] ?? Number(m[2])) : 0); };

// name, species, z, what the hero should look like
const CASES = [
  ['perch', 'mossback_perch', 0.3, /^\d lb \d{1,2} oz$/],
  ['small', 'dusk_minnow', -1.2, /^\d{1,2} oz$/],
  ['trophy', 'weeping_carp', 2.3, /^\d\d lb \d{1,2} oz$/],
];

export default async function (api) {
  const { page, wait, evalGame: g, log, width, args } = api;
  page.setDefaultTimeout(240000);
  const failures = [];
  const only = args?.only ? String(args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.includes(x);
  const phone = width < 700;
  const check = (cond, msg, extra) => { if (cond) { log('ok  ', msg); return true; } failures.push(`${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`); log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : ''); return false; };

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
  const s0 = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE }));
  check(s0.en === true && s0.ph === 1, 'v3 phase-1 build', s0);
  await page.mouse.click(2, 200);
  await g(() => {
    const c = window.__gw;
    try { c.render.setQuality?.('low'); } catch { /* optional */ }
    if (!window.__rafHold) {
      const raf = window.requestAnimationFrame.bind(window);
      let held = null;
      window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
      window.__rafHold = (on) => { if (on) { held = held || []; return true; } if (held) { const q = held; held = null; for (const cb of q) raf(cb); } return false; };
    }
    // UI time pump (as tools/tests/p1b-ui.scenario.mjs): banners and held toasts advance on ui.update()'s own clock
    window.__pump = (sec = 1) => {
      if (window.__perfOff === undefined) { const realNow = performance.now.bind(performance); window.__perfOff = 0; performance.now = () => realNow() + window.__perfOff; }
      for (let i = 0; i < Math.ceil(sec / 0.25); i++) { window.__perfOff += 250; try { c.ui.update(0.25); } catch { /* keep going */ } }
    };
    // the count, sampled every animation frame while a card is up: the live figure, the sizer's box and where the stamp sits
    window.__pounds = { rows: [], on: false, el: null };
    const tick = () => {
      const P = window.__pounds;
      if (P.on) {
        const all = document.querySelectorAll('#ui .gw-m-catch .gw-p-catch'), e = all[all.length - 1];   // (a closing card may still be fading out)
        if (e !== P.el) { P.el = e || null; P.rows = []; }
        const n = e?.querySelector('.gw-cc-hero-n'), hero = e?.querySelector('.gw-cc-hero'), st = e?.querySelector('.gw-cc-stamp > span'), list = e?.querySelector('.gw-cc-stats');
        // layout boxes (offset*), so the card's own entrance, its small hit at the stamp and the hero's settle (transforms, the
        // whole column shifting together) do not count: the stamp row's own geometry, and the list's place under it
        if (n && hero && st) P.rows.push({ t: n.textContent, w: hero.offsetWidth, h: hero.parentElement.offsetHeight, x: hero.offsetLeft, sx: st.offsetLeft, ly: list ? list.offsetTop - hero.parentElement.offsetTop : 0, nw: n.offsetWidth });
      }
      raf0(tick);
    };
    const raf0 = window.requestAnimationFrame.bind(window);
    raf0(tick);
  });
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 240) => { const f0 = await frameNo(), t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(200); } return false; };
  const waitFor = async (fn, arg, timeoutS = 90, stepMs = 300) => { const t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  await scale(0.4);
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/pounds/shots'));
  mkdirSync(shotsDir, { recursive: true });
  async function shot(name) {
    for (let i = 0; i < 30; i++) {   // a trial's banner or a toast (the Heavyweight, a new name) leaves the picture first
      const busy = await g(() => !!document.querySelector('#ui .gw-banner') || !!document.querySelector('#ui .gw-toast:not(.gw-held)'));
      if (!busy) break;
      await g(() => window.__pump(1.5));
      await wait(400);
    }
    await scale(1);
    await frames(3);
    await wait(600);
    await g(() => window.__rafHold(true));
    await wait(400);
    const p = resolve(shotsDir, `${name}.png`);
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) { try { await page.screenshot({ path: p, timeout: 240000 }); ok = true; } catch (e) { log('shot retry', name, String(e?.message || e).split('\n')[0]); } }
    await g(() => window.__rafHold(false));
    await scale(0.4);
    if (ok) log('screenshot', p);
    return ok;
  }
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => ({ b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused }));
      if (!m.b && !m.p) return;
      await g(() => { const c = window.__gw; const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
      await frames(2);
    }
  };
  const idleFishing = () => g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } try { c.fishing.reset?.(); } catch { /* optional */ } });

  // ---------------------------------------------------------------- a Still run in open water
  await g(() => window.__gw.game.startNewRun({ character: 'wick' }));
  await waitFor(() => window.__gw.flow === 'playing', null, 120);
  await frames(4);
  await clearModals();
  await g(() => {
    const c = window.__gw; c.debug.god?.(true);
    const m = c.state.meta; m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) m.seenTips[t.id] = true;
    c.debug.setOil(80); c.debug.setSatiety(90);
    c.player.teleport ? c.player.teleport(new c.THREE.Vector3(4, 0, 14.8), 0) : c.player.position.set(4, 0, 14.8);
    try { c.render.snapCamera?.(); } catch { /* optional */ }
  });
  await frames(3);

  for (const [name, sp, z, look] of CASES) {
    if (!want(name)) continue;
    await clearModals();
    await idleFishing();
    await g(() => { window.__pounds.rows = []; window.__pounds.on = true; });
    await g(([sp, z]) => window.__gw.debug.instantCatch(sp, { z }), [sp, z]);
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 120);
    const done = await waitFor(() => { const p = document.querySelector('#ui .gw-m-catch .gw-p-catch'); return !!p && p.classList.contains('gw-cc-counted') && p.classList.contains('gw-cc-pressed'); }, null, 120);
    await wait(1600);   // the stamp, the seal and the ink sketch draw in
    await g(() => { window.__pounds.on = false; });
    const s = await g((sp) => {
      const c = window.__gw, D = c.data, e = document.querySelector('#ui .gw-m-catch'), p = e?.querySelector('.gw-p-catch');
      const fish = c.progression.getPendingCatch?.()?.slice(-1)[0] || c.state.run.creel.slice(-1)[0] || null;
      const rect = (q) => { const x = p?.querySelector(q); if (!x) return null; const r = x.getBoundingClientRect(); return { l: +r.left.toFixed(1), r: +r.right.toFixed(1), t: +r.top.toFixed(1), b: +r.bottom.toFixed(1) }; };
      const cs = (q, k) => { const x = p?.querySelector(q); return x ? getComputedStyle(x)[k] : null; };
      const spd = D.SPECIES_BY_ID[sp];
      return {
        cls: p?.className || '', hero: p?.querySelector('.gw-cc-hero-n')?.textContent ?? null, sizer: p?.querySelector('.gw-cc-hero-sizer')?.textContent ?? null, aria: p?.querySelector('.gw-cc-hero')?.getAttribute('aria-label') ?? null,
        long: !!p?.querySelector('.gw-cc-hero--long'), len: p?.querySelector('.gw-cc-len')?.textContent ?? null, lenShown: cs('.gw-cc-len', 'display') !== 'none' && cs('.gw-cc-lenk', 'display') !== 'none',
        stats: p?.querySelector('.gw-cc-stats')?.textContent?.replace(/\s+/g, ' ') ?? '', all: p?.innerText ?? '', note: p?.querySelector('.gw-cc-note')?.textContent?.replace(/\s+/g, ' ') ?? '',
        heroFont: cs('.gw-cc-hero-n', 'fontSize'), heroFamily: cs('.gw-cc-hero-n', 'fontFamily'), sizerVis: cs('.gw-cc-hero-sizer', 'visibility'),
        rHero: rect('.gw-cc-hero'), rN: rect('.gw-cc-hero-n'), rStamp: rect('.gw-cc-stamp > span'), rSeal: rect('.gw-cc-seal'), rStats: rect('.gw-cc-stats'), rName: rect('.gw-catch-name'),
        panel: (() => { const r = p?.getBoundingClientRect(); return r ? { l: +r.left.toFixed(1), r: +r.right.toFixed(1), t: +r.top.toFixed(1), b: +r.bottom.toFixed(1) } : null; })(),
        vw: innerWidth, vh: innerHeight, scrollW: document.documentElement.scrollWidth,
        fish: fish ? { speciesId: fish.speciesId, length: fish.length, weight: fish.weight, cls: fish.sizeClass } : null,
        want: fish ? { wt: D.fmtWeight(D.fishWeight(spd, fish)), cm: D.fmtCm(fish.length) } : null,
      };
    }, sp);
    const rows = await g(() => window.__pounds.rows);
    log(`${name}: ${sp} z ${z} → hero "${s.hero}" (sizer "${s.sizer}", ${s.heroFont}${s.long ? ', long hand' : ''}) · length "${s.len}" · ${rows.length} count frames · fish ${JSON.stringify(s.fish)}`);
    check(done, `${name}: the card counted and the stamp pressed`, s.cls);
    check(!!s.fish && s.fish.speciesId === sp && s.hero === s.want?.wt && s.aria === s.want?.wt && WEIGHT.test(s.hero || '') && look.test(s.hero || ''), `${name}: the hero is the fish's weight, fmtWeight(fishWeight(sp, fish)) = "${s.want?.wt}"`, { hero: s.hero, aria: s.aria, want: s.want });
    check(s.len === s.want?.cm && /^\d+(\.\d)? cm$/.test(s.len || '') && s.lenShown && /^length/.test(s.stats.trim()), `${name}: the list opens with the length line, "length ${s.want?.cm}"`, { len: s.len, stats: s.stats });
    check(!/\bkg\b/.test(s.all) && !/weight/.test(s.stats) && (s.all.match(/\bcm\b/g) || []).length === 1, `${name}: no kg on the card, no weight row, and exactly one cm (the length line)`, { stats: s.stats, cm: (s.all.match(/\bcm\b/g) || []).length });
    check(s.note.includes(s.want?.wt || '#'), `${name}: the handwritten note says the weight`, s.note);
    check(s.sizerVis === 'hidden' && (s.sizer || '').length >= (s.hero || '').length && s.long === ((s.hero || '').length >= 9), `${name}: a hidden sizer at least as wide as the figure; the long hand for a pounds-and-ounces figure`, { sizer: s.sizer, long: s.long });
    // nothing overflows or overlaps: the hero inside the card and the window, clear of the stamp and the seal, above the list
    const inside = s.rHero && s.panel && s.rHero.r <= Math.min(s.panel.r, s.vw) + 0.5 && s.rHero.l >= s.panel.l - 0.5 && s.rN.r <= Math.min(s.panel.r, s.vw) + 0.5;
    const hit = (a, b) => !!a && !!b && a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
    check(inside && s.scrollW <= s.vw + 1, `${name}: the hero sits inside the card (right edge ${s.rN?.r} ≤ ${Math.min(s.panel?.r ?? 0, s.vw)}); no sideways scroll`, { hero: s.rHero, n: s.rN, panel: s.panel, vw: s.vw, scrollW: s.scrollW });
    check(!hit(s.rN, s.rStamp) && !hit(s.rN, s.rSeal), `${name}: the figure clears the stamp and the seal`, { n: s.rN, stamp: s.rStamp, seal: s.rSeal });
    check(!!s.rStats && s.rN.b <= s.rStats.t + 14, `${name}: the list starts under the hero`, { n: s.rN, stats: s.rStats });
    // the count: it ran, never fell, landed on the final, and the stamp never moved while it ran
    const texts = rows.map((r) => r.t), vals = texts.map((t) => (t === '0 oz' || t === '0 lb' ? 0 : toOz(t)));
    const mono = vals.every((v, i) => Number.isFinite(v) && (i === 0 || v >= vals[i - 1]));
    const span = (k) => (rows.length ? Math.max(...rows.map((r) => r[k])) - Math.min(...rows.map((r) => r[k])) : 0);
    const moved = { heroW: span('w'), rowH: span('h'), heroX: span('x'), stampX: span('sx'), listY: span('ly') };
    const distinct = [...new Set(texts)];
    const over = rows.length ? Math.max(...rows.map((r) => r.nw - r.w)) : 0, last = rows.at(-1) || {};
    log(`${name}: count ${distinct.slice(0, 14).join(' → ')}${distinct.length > 14 ? ' …' : ''} · hero box ${last.w} px, final figure ${last.nw} px, widest passing figure ${over > 0 ? `${over} px past the box` : 'inside it'} · moved ${JSON.stringify(moved)} over ${rows.length} frames`);
    check(rows.length > 3 && mono && texts.at(-1) === s.hero, `${name}: the count never falls and lands on "${s.hero}" (${distinct.length} figures seen)`, distinct.slice(0, 20));
    check(rows.length > 3 && Object.values(moved).every((v) => v === 0), `${name}: the hero's box keeps one size through the count; the stamp, the hero and the list under them never move`, moved);
    check(last.nw <= last.w + 1, `${name}: the final figure fits its box (${last.nw} ≤ ${last.w} px)`, last);
    await shot(`card-${name}`);
    await g(() => { const e = document.querySelector('#ui .gw-m-catch'); (e?.querySelector('[data-action="keep"]:not([disabled])') || e?.querySelector('[data-action="release"]'))?.click(); });
    await waitFor(() => window.__gw.debug.ui?.()?.openModal !== 'catch', null, 30);
  }

  // ---------------------------------------------------------------- the Journal page: Biggest and Weight in pounds
  if (want('journal')) {
    await clearModals();
    await idleFishing();
    const has = await g(() => !!window.__gw.state.meta.journal?.mossback_perch?.pbLength);
    if (!has) { await g(() => window.__gw.debug.instantCatch('mossback_perch', { z: 0.3 })); await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 120); await wait(2400); await g(() => document.querySelector('#ui .gw-m-catch [data-action="keep"]')?.click()); await waitFor(() => window.__gw.debug.ui?.()?.openModal !== 'catch', null, 30); }
    await g(() => window.__gw.ui.openLog({ speciesId: 'mossback_perch' }));
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'journal', null, 60);
    await wait(1200);
    const j = await g(() => {
      const c = window.__gw, D = c.data, sp = D.SPECIES_BY_ID.mossback_perch, rec = c.state.meta.journal.mossback_perch;
      const facts = Object.fromEntries([...document.querySelectorAll('#ui .gw-facts > div')].map((d) => [d.querySelector('dt')?.textContent, d.querySelector('dd')?.textContent]));
      return { facts, all: document.querySelector('#ui .gw-facts')?.innerText ?? '', want: { big: D.fmtWeight(D.fishWeight(sp, { length: rec.pbLength })), range: `${D.fmtWeight(sp.weight[0])} – ${D.fmtWeight(sp.weight[1])}` } };
    });
    log(`journal: Biggest "${j.facts.Biggest}" · Weight "${j.facts.Weight}"`);
    check(j.facts.Biggest === j.want.big && WEIGHT.test(j.facts.Biggest || ''), `the Journal's Biggest is the weight of the best length ("${j.want.big}")`, j.facts);
    check(j.facts.Weight === j.want.range && !/\bkg\b|\bcm\b|\bmm\b/.test(j.all), `the Journal's Weight is the species' range in pounds ("${j.want.range}"); no kg, cm or mm in the facts`, j.facts);
    await g(() => document.querySelector('#ui .gw-facts')?.scrollIntoView({ block: 'center' }));   // (openLog lands on the odds; the facts sit above them)
    await wait(300);
    await shot('journal-perch');
    await g(() => window.__gw.ui.closeAll?.());
  }

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'no ctx.errors', errs.slice(0, 5));
  log(failures.length ? `pounds-shots: ${failures.length} failure(s)` : 'pounds-shots: ALL CHECKS PASS');
  return { failures };
}
