// UI screenshot set — a tools/playtest.mjs scenario that captures every important UI state as
// named PNGs (and, optionally, a measurement JSON per frame), on desktop and on phone, so a UI
// restyle can be judged before/after on the same deterministic frames.
//
//   node build.mjs --dev --out=tools/out/ui.html
//   # desktop, 1280×720 (playtest's default size)
//   node tools/playtest.mjs --html=tools/out/ui.html --shots=tools/out/ui-shots/desktop --script=tools/ui-shots.mjs
//   # phone, portrait 390×844 with touch (playtest's --mobile)
//   node tools/playtest.mjs --html=tools/out/ui.html --shots=tools/out/ui-shots/mobile --script=tools/ui-shots.mjs --mobile
//   # a subset, with measurements:
//   UI_ONLY=title,shop UI_MEASURE=1 node tools/playtest.mjs ... --script=tools/ui-shots.mjs
//
// Frames (file names are stable, whatever order they are taken in; numbers follow the flow):
//   01-title            title / main menu of a returning player (Continue, meta line)
//   02-new-descent      New Descent: Wick select + detail
//   03-trials           Trials (challenges) list, opened from the title
//   04-hud-calm         HUD while sailing in the calm (day 2, 5 boons, 3 fish in the creel, bait,
//                       perfect streak 2, one Ember out)
//   05-banner           area-title banner (the lake name on arrival)
//   06-toasts           a stack of three toasts (titled trial toast, lore line, warning)
//   07-hud-reel         HUD while reeling (tension gauge, sweet band, needle, progress ring)
//   08-catch-common     catch card of a common fish already in the Journal (no ribbons)
//   09-catch-legendary  catch card of a legendary caught for the first time (NEW, lore, gilded)
//   10-catch-record     catch card with the RECORD ribbon
//   11-creel            the creel (fish rows with Eat / Render / Sell / Release, bait chips)
//   12-shop-sell        Old Murk's shop, Sell tab
//   13-shop-gear        Old Murk's shop, Gear tab
//   14-journal          Journal, current lake, first known entry selected (entry + grid)
//   15-journal-grid     Journal, Sporewood tab (known + unknown silhouettes); on narrow screens the
//                       content is scrolled to the grid, because there the entry sits above it
//   16-levelup          level-up boon picker
//   17-pause            pause menu (with "Your flame" boon list)
//   18-settings         settings, opened from the pause menu
//   19-death            death / run summary (after the count-ups finish)
//   20-shrine           Shrine of Drowned Lanterns, opened from the death screen
// Extra frames (only with UI_EXTRA=1, or when UI_ONLY names them; prefix x):
//   x1-descend          the Descent Gate modal          x2-hud-night   Gloomtide HUD with a swarm
//   x3-catch-full       catch card with a full creel and "Make room…" open
//   x4-victory          victory card
//
// Env knobs:
//   UI_ONLY=a,b      substring match on frame names (UI_ONLY=catch → all catch cards)
//   UI_EXTRA=1       also take the x- frames
//   UI_MEASURE=1     write <frame>.measure.json beside each PNG (computed type, colours, sizes,
//                    effective opacity, tap targets, panel boxes/coverage, and a contrast ratio
//                    of every visible text run against the median screenshot pixel behind it),
//                    plus measure-summary.json for the set
//   UI_FONTS=0       do not load the Google web fonts (playtest blocks them; by default this
//                    scenario fetches whatever fonts.googleapis.com stylesheets the page links,
//                    through curl into tools/out/.font-cache, and serves them to the page, so the
//                    shots show the real type, not the Georgia/DejaVu fallback)
//   UI_SEED=1234     seeds Math.random from boot (the page is reloaded once with the seed, so
//                    taglines, epitaphs, Murk's lines, fish weights and boon offers repeat);
//                    UI_SEED=0 keeps the unseeded first load (and skips the reload if UI_FONTS=0)
//   UI_QUALITY=high  render quality pinned for every frame (auto|low|medium|high)
//   UI_QUIET=45      max seconds to wait for banners / toasts / fades to clear before a frame
//   UI_FAST=0.3      render scale used *between* shots (the world renders at full scale, or at the
//                    --lean scale, for the two frames before each shot); 1 = never drop it
//   UI_SHOT_TIMEOUT=300  seconds per screenshot attempt (3 attempts)
//
// Speed on a loaded machine: the game loop is held (requestAnimationFrame callbacks queued) while
// a screenshot is taken, so the capture does not wait behind multi-second software-GL frames; the
// canvas keeps its last full-scale frame and CSS animations keep running. Between shots the world
// renders at UI_FAST. Banners, held toasts, count-ups and modal ticks run on ui.update()'s own
// clock (≤ 0.25 s a frame, i.e. minutes for a 3.6 s banner at 0.3 fps); when the scenario waits
// for them it pumps that clock forward (pumpUi), which is what waiting would do, minutes sooner.
// CSS transitions and toast timers stay real time.
//
// Determinism: meta is seeded (6 descents, 412 Memories, a Journal with 8 names, 6 trials done,
// 5 relics), every first-run tip is marked seen, the run is seeded (The Wick, day 2 calm at 35%,
// level 5 at 62% XP, 5 boons, 248 Shells, creel perch/carp/minnow, Mireworm ×6 equipped, streak 2,
// 4/5 Embers, oil 72%, satiety 64%, god mode), gameplay time is frozen (timeScale 0) for the HUD
// frames, the phase/resources are re-pinned before every in-run frame, fish cinders cannot level
// up behind a catch card, the mouse is parked at the left edge (no hover; on desktop the modal's
// autofocused default item shows its keyboard-selection state, as it does for a keyboard player)
// and blocking modals are closed between frames. Nothing the player would see is hidden: before a
// frame the scenario waits for banners and toasts to finish (UI_QUIET), and the banner/toast frames
// raise them on purpose. The reel fight runs at timeScale 1 and is frozen for its shot.
//
// Every frame is wrapped in try/catch: a failure is logged and the rest still render. Frames
// can run alone (UI_ONLY): each starts from ensureTitle()/ensureRun(), which rebuild the state.
// Software GL renders 0.2–8 fps depending on machine load; a full set (24 frames) took ~25 min
// (phone) to ~60 min (desktop) at load 20–30 on 4 cores. --lean (render scale 0.45 for the shots
// too) is fine for logic checks, but baseline frames are taken without it so the world behind the
// UI looks like the real game. A UI_ONLY re-run merges into the folder's index/summary JSON.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const env = process.env;
const ONLY = (env.UI_ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);
const EXTRA = /^(1|true|yes)$/i.test(env.UI_EXTRA || '');
const MEASURE = /^(1|true|yes)$/i.test(env.UI_MEASURE || '');
const FONTS = !/^(0|false|no)$/i.test(env.UI_FONTS || '1');
const SEED = Number(env.UI_SEED ?? 1234) >>> 0;
const QUALITY = env.UI_QUALITY || 'high';
const QUIET = Number(env.UI_QUIET || 45);
const FAST = Math.max(0.2, Math.min(1, Number(env.UI_FAST || 0.3)));
const SHOT_TIMEOUT = Number(env.UI_SHOT_TIMEOUT || 300);
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const FONT_CACHE = resolve(here, 'out', '.font-cache');

const DESC = {
  '01-title': 'title / main menu (returning player, Continue)',
  '02-new-descent': 'New Descent: Wick select',
  '03-trials': 'Trials list from the title',
  '04-hud-calm': 'HUD sailing in the calm',
  '05-banner': 'area-title banner',
  '06-toasts': 'three stacked toasts',
  '07-hud-reel': 'HUD while reeling',
  '08-catch-common': 'catch card, common, known species',
  '09-catch-legendary': 'catch card, legendary, first catch (NEW)',
  '10-catch-record': 'catch card, RECORD',
  '11-creel': 'creel',
  '12-shop-sell': 'shop, Sell tab',
  '13-shop-gear': 'shop, Gear tab',
  '14-journal': 'journal, entry + grid',
  '15-journal-grid': 'journal, Sporewood grid',
  '16-levelup': 'level-up boon picker',
  '17-pause': 'pause menu',
  '18-settings': 'settings from pause',
  '19-death': 'death / run summary',
  '20-shrine': 'Shrine from the death screen',
  'x1-descend': 'Descent Gate modal',
  'x2-hud-night': 'Gloomtide HUD with a swarm',
  'x3-catch-full': 'catch card, creel full, Make room open',
  'x4-victory': 'victory card',
};

// ------------------------------------------------------------------ web fonts (curl → cache → route)
function fetchCached(url) {
  const p = resolve(FONT_CACHE, createHash('sha1').update(url).digest('hex'));
  if (existsSync(p)) return readFileSync(p);
  try {
    const buf = execFileSync('curl', ['-sSfL', '-m', '40', '-A', UA, url], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
    mkdirSync(FONT_CACHE, { recursive: true });
    writeFileSync(p, buf);
    return buf;
  } catch { return null; }
}

// ------------------------------------------------------------------ measurement (PNG decode + contrast)
function decodePng(buf) {
  let p = 8, w = 0, h = 0, depth = 0, type = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), t = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; type = d[9]; if (d[12]) return null; }
    else if (t === 'IDAT') idat.push(d);
    else if (t === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8 || (type !== 2 && type !== 6)) return null;
  const bpp = type === 6 ? 4 : 3, stride = w * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(w * h * 3);
  let prev = Buffer.alloc(stride), line = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const o = y * (stride + 1), f = raw[o];
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = raw[o + 1 + i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = v & 255;
    }
    for (let x = 0; x < w; x++) { const s = x * bpp, dd = (y * w + x) * 3; px[dd] = line[s]; px[dd + 1] = line[s + 1]; px[dd + 2] = line[s + 2]; }
    [prev, line] = [line, prev];
  }
  return { w, h, px };
}
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const parseRgba = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return [0, 0, 0, 0]; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
function medianBg(img, box) {
  const x0 = Math.max(0, Math.floor(box.x)), y0 = Math.max(0, Math.floor(box.y));
  const x1 = Math.min(img.w, Math.ceil(box.x + box.w)), y1 = Math.min(img.h, Math.ceil(box.y + box.h));
  if (x1 <= x0 || y1 <= y0) return null;
  const step = Math.max(1, Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 4000)));
  const ch = [[], [], []];
  for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) { const i = (y * img.w + x) * 3; ch[0].push(img.px[i]); ch[1].push(img.px[i + 1]); ch[2].push(img.px[i + 2]); }
  return ch.map((a) => { a.sort((p, q) => p - q); return a[a.length >> 1]; });
}

/** Collected in the page: every visible text run, interactive target and container in #ui. */
function collectInPage() {
  const root = document.getElementById('ui');
  const vw = innerWidth, vh = innerHeight;
  const out = { vw, vh, texts: [], targets: [], panels: [], fonts: [] };
  const effOpacity = (el) => {
    let o = 1;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      o *= parseFloat(cs.opacity) || 0;
      if (o < 0.01) return 0;
    }
    return o;
  };
  const label = (el) => {
    const cls = typeof el.className === 'string' ? el.className : el.className?.baseVal || '';
    return el.tagName.toLowerCase() + (cls.trim() ? '.' + cls.trim().split(/\s+/).filter((c) => !/^gw-(on|in|out|visible|live)$/.test(c)).slice(0, 3).join('.') : '');
  };
  const box = (r) => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
  const onScreen = (r) => r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < vw && r.top < vh;
  for (const f of document.fonts) if (f.status === 'loaded') out.fonts.push(`${f.family.replace(/"/g, '')} ${f.weight} ${f.style}`);
  out.fonts = [...new Set(out.fonts)];
  for (const el of root.querySelectorAll('*')) {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    const direct = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    const isTarget = el.matches('button, input, select, [role="switch"], [role="tab"], a[href]');
    const isPanel = el.matches('.gw-panel, .gw-lu, .gw-lu-cards, .gw-card, .gw-title-menu, .gw-title-inner, .gw-death-inner, .gw-victory-card, .gw-banner, .gw-toast, .gw-jr-card, .gw-jr-detail, .gw-relic, .gw-shrine-detail, .gw-item, .gw-tabs, .gw-reel, .gw-reel-gauge, .gw-cluster, .gw-clock, .gw-top, .gw-actions, .gw-scrim, .gw-title-veil, .gw-death-veil, .gw-catch-yield, .gw-char, .gw-char-detail, .gw-set-row, .gw-zone-card, .gw-death-stats > div');
    if (!direct && !isTarget && !isPanel) continue;
    const r = el.getBoundingClientRect();
    if (!onScreen(r)) continue;
    const op = effOpacity(el);
    if (op < 0.05) continue;
    const cs = getComputedStyle(el);
    if (direct) {
      out.texts.push({
        el: label(el), text: direct.slice(0, 40), box: box(r), family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), stack: cs.fontFamily,
        size: parseFloat(cs.fontSize), weight: cs.fontWeight, style: cs.fontStyle, caps: cs.fontVariantCaps, transform: cs.textTransform,
        tracking: cs.letterSpacing, lineHeight: cs.lineHeight, color: cs.color, opacity: +op.toFixed(3), shadow: cs.textShadow !== 'none',
      });
    }
    if (isTarget) out.targets.push({ el: label(el), text: (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 30), box: box(r), disabled: !!el.disabled });
    if (isPanel) {
      out.panels.push({
        el: label(el), box: box(r), cover: +((Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / (vw * vh)) * 100).toFixed(1),
        bg: cs.backgroundColor, bgImage: cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0, 220),
        border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, radius: cs.borderTopLeftRadius,
        shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow.slice(0, 220), opacity: +op.toFixed(3),
      });
    }
  }
  return out;
}

function summarise(m) {
  const t = m.texts;
  const sizes = t.map((x) => x.size).sort((a, b) => a - b);
  const fam = {};
  for (const x of t) { const f = (fam[x.family] = fam[x.family] || { n: 0, min: 1e9, max: 0, sizes: {} }); f.n++; f.min = Math.min(f.min, x.size); f.max = Math.max(f.max, x.size); f.sizes[x.size] = (f.sizes[x.size] || 0) + 1; }
  const cr = t.filter((x) => typeof x.contrast === 'number').map((x) => x.contrast).sort((a, b) => a - b);
  const small = m.targets.filter((x) => !x.disabled && (x.box.w < 44 || x.box.h < 44));
  const main = m.panels.filter((p) => /gw-panel|gw-lu\b|gw-death-inner|gw-victory-card|gw-title-inner/.test(p.el)).sort((a, b) => b.cover - a.cover)[0];
  return {
    texts: t.length, minSize: sizes[0] ?? null, medianSize: sizes[sizes.length >> 1] ?? null,
    under14: t.filter((x) => x.size < 14).length, under12: t.filter((x) => x.size < 12).length,
    families: fam, contrastMin: cr[0] ? +cr[0].toFixed(2) : null, contrastMedian: cr.length ? +cr[cr.length >> 1].toFixed(2) : null,
    under4_5: cr.filter((c) => c < 4.5).length, under3: cr.filter((c) => c < 3).length,
    targets: m.targets.length, smallTargets: small.map((x) => `${x.el} "${x.text}" ${x.box.w}×${x.box.h}`),
    mainPanel: main ? { el: main.el, cover: main.cover, box: main.box } : null, fonts: m.fonts,
  };
}

// ================================================================== scenario
export default async function (api) {
  const { page, wait, evalGame: g, log, width, height, args } = api;
  page.setDefaultTimeout(180000);
  const ok = [], failed = [], skipped = [];
  const index = {};
  const summary = {};
  const shotsDir = resolve(here, '..', String(args.shots || 'tools/out/shots'));
  mkdirSync(shotsDir, { recursive: true });
  const BASE = args.lean ? (args.lean === true ? 0.45 : Number(args.lean)) : 1;
  const want = (name) => (name.startsWith('x') ? (EXTRA && !ONLY.length) || ONLY.some((s) => name.includes(s)) : !ONLY.length || ONLY.some((s) => name.includes(s)));
  const narrow = width < 760;

  // ---------------------------------------------------------------- boot: fonts + seed (one reload)
  if (FONTS) {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
      const url = route.request().url();
      const buf = fetchCached(url);
      if (!buf) return route.abort();
      const ct = /googleapis/.test(url) ? 'text/css; charset=utf-8' : /\.woff2(\?|$)/.test(url) ? 'font/woff2' : 'application/octet-stream';
      return route.fulfill({ status: 200, body: buf, headers: { 'content-type': ct, 'access-control-allow-origin': '*', 'cache-control': 'max-age=86400' } });
    });
  }
  if (SEED) {
    await page.addInitScript((seed) => {
      let s = seed >>> 0;
      Math.random = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }, SEED);
  }
  if (FONTS || SEED) {
    log(`reloading (fonts ${FONTS ? 'on' : 'off'}, seed ${SEED || 'off'})`);
    await page.reload({ waitUntil: 'load', timeout: 240000 });
    await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 240000, polling: 500 });
    if (args.lean) await g((sc) => window.__gw?.debug?.renderScale?.(sc), args.lean === true ? 0.45 : Number(args.lean)).catch(() => {});
  }
  const fontInfo = await g(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')); }).catch(() => []);
  log(`web fonts loaded: ${[...new Set(fontInfo)].join(', ') || 'none (fallback serif)'}`);
  // one harmless pointer interaction, so programmatic focus never paints focus rings; then park
  await page.mouse.click(2, Math.round(height * 0.5));
  const park = () => page.mouse.move(2, Math.round(height * 0.5));
  // rAF hold (the game loop calls the global requestAnimationFrame each frame, so a runtime wrap works)
  await g(() => {
    if (window.__rafHold) return;
    const raf = window.requestAnimationFrame.bind(window);
    let held = null;
    window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
    window.__rafHold = (on) => { if (on) { held = held || []; return true; } if (held) { const q = held; held = null; for (const cb of q) raf(cb); } return false; };
  });
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  if (FAST < BASE) await scale(FAST);

  // ---------------------------------------------------------------- in-page helpers
  await g(({ quality }) => {
    const c = window.__gw;
    if (!c) throw new Error('window.__gw missing');
    const D = c.data;
    const H = (window.__uis = {});
    H.quality = () => {
      try { c.state.meta.settings = c.state.meta.settings || {}; c.state.meta.settings.quality = quality; } catch { /* optional */ }
      try { c.render.setQuality?.(quality); } catch { /* optional */ }
    };
    H.tipsSeen = () => { const m = c.state.meta; m.seenTips = m.seenTips || {}; for (const t of D.TIPS || []) if (t?.id) m.seenTips[t.id] = true; };
    H.seedMeta = () => {
      const m = c.state.meta;
      Object.assign(m, { runs: 6, deaths: 5, bestDay: 4, bestLevel: 9, deepestZone: 1, memories: 412, totalFish: 63, lastCharacter: 'wick' });
      H.tipsSeen();
      const J = (caught, biggest, firstDay = 1, firstRun = 1) => ({ caught, biggest, firstDay, firstRun });
      m.journal = {
        dusk_minnow: J(7, 0.24), mossback_perch: J(12, 1.36), gutter_crayfish: J(4, 0.46), weeping_carp: J(3, 5.1, 2, 2),
        candlefin_koi: J(2, 2.6, 3, 3), reedjaw_pike: J(1, 6.2, 3, 5), sporebelly_puffer: J(2, 0.8, 1, 6), plumgill_perch: J(1, 1.2, 1, 6),
      };
      m.challenges = { first_light: true, first_dawn: true, ember_hoard: true, steady_hands: true, naturalist: true, break_a_hand: true };
      m.challengeProgress = { ...(m.challengeProgress || {}), three_nights: 2, catch_100: 63, gloombreaker: 140, long_vigil: 3 };
      m.unlocks = { ...(m.unlocks || {}), 'character:taper': true };
      m.relics = { oilskin_flask: 2, salt_glass_lens: 1, bent_tin_spoon: 3, mended_creel: 1, old_debt: 1 };
      H.quality();
      try { c.progression.invalidateStats?.(); } catch { /* optional */ }
    };
    H.stats = () => { try { return c.progression.getStats() || {}; } catch { return {}; } };
    H.phase = (name = 'calm', k = 0.35) => {
      const r = c.state.run;
      if (!r) return null;
      if (r.phase !== name) c.debug.setPhase?.(name);
      const info = c.survival.getPhaseInfo?.();
      if (info && info.duration > 0) r.phaseTime = info.duration * k;
      return c.survival.getPhaseInfo?.();
    };
    H.pin = () => {
      const r = c.state.run;
      if (!r) return;
      const s = H.stats();
      try { c.debug.god?.(true); } catch { /* optional */ }
      if (r.day !== 2) c.debug.setDay?.(2);
      H.phase('calm', 0.35);
      c.debug.setOil?.((s.maxOil || 100) * 0.72);
      c.debug.setSatiety?.((s.maxSatiety || 100) * 0.64);
      c.debug.setHp?.(Math.max(1, Math.round(s.maxHp || 5) - 1));
      H.quality();
    };
    H.seedRun = () => {
      const r = c.state.run;
      if (!r) return null;
      H.tipsSeen();
      try { c.debug.god?.(true); } catch { /* optional */ }
      r.level = 5;
      r.xpNext = D.xpForLevel?.(5) ?? 40;
      r.xp = Math.round(r.xpNext * 0.62);
      for (const [id, lv] of [['circling_cinders', 3], ['drifting_motes', 1], ['brighter_wick', 2], ['slow_burn', 1], ['steady_reel', 2]]) { try { c.debug.giveBoon?.(id, lv); } catch { /* optional */ } }
      r.shells = 248;
      r.bait = { mireworm: 6, lumen_moss: 2 };
      try { c.progression.equipBait?.('mireworm'); } catch { r.equippedBait = 'mireworm'; }
      r.creel = [];
      try { c.debug.giveFish?.('mossback_perch', 0.92, 'normal'); c.debug.giveFish?.('weeping_carp', 3.4, 'fine'); c.debug.giveFish?.('dusk_minnow', 0.17, 'normal'); } catch { /* optional */ }
      r.flags = r.flags || {};
      r.flags.streak = 2;
      r.stats = Object.assign(r.stats || {}, { fishCaught: 11, enemiesSlain: 186, shellsEarned: 342, newSpecies: 1, damageSources: { gloomling: 3, inkmite: 2 } });
      H.pin();
      return { level: r.level, shells: r.shells, creel: r.creel.length };
    };
    H.closeUi = () => {
      if (c.flow !== 'playing') return 0;
      for (let i = 0; i < 12 && c.combat?.pendingOptions; i++) { try { c.combat.skip?.(); } catch { break; } }
      if (c.paused) { try { c.game.resume?.(); } catch { c.paused = false; } }
      try { c.ui.closeAll?.(); } catch { /* optional */ }
      return c.ui?.isBlocking?.() ? 1 : 0;
    };
    H.settle = (sec = 2) => {
      const names = ['actors', 'models', 'world', 'water', 'render'];
      let t = c.time.t;
      for (let i = 0; i < Math.max(1, Math.round(sec / 0.05)); i++) {
        t += 0.05;
        for (const n of names) { const m = c[n]; if (!m || m.isStub || typeof m.update !== 'function') continue; try { m.update(0.05, t); } catch { /* keep pumping */ } }
      }
      try { c.render.snapCamera?.(); } catch { /* optional */ }
    };
    // UI time: ui.update() measures its own dt from performance.now() (≤ 0.25 s a call), so on a
    // 0.3 fps machine a 3.6 s banner takes minutes. pumpUi(sec) moves an offset clock forward and
    // calls ui.update() in 0.25 s steps: banners, held toasts, count-ups and modal ticks advance
    // exactly as they would have with time; nothing is removed by hand. CSS and setTimeout stay real.
    H.pumpUi = (sec = 1) => {
      if (window.__perfOff === undefined) {
        const realNow = performance.now.bind(performance);
        window.__perfOff = 0;
        performance.now = () => realNow() + window.__perfOff;
      }
      for (let i = 0; i < Math.ceil(sec / 0.25); i++) { window.__perfOff += 250; try { c.ui.update(0.25); } catch { /* keep going */ } }
      return !!document.querySelector('#ui .gw-banner');
    };
    H.quiet = () => !document.querySelector('#ui .gw-banner') && !document.querySelector('#ui .gw-toast:not(.gw-held)') && !document.querySelector('#ui .gw-modal.gw-out');
    H.click = (label, scope = '#ui') => {
      const root = document.querySelector(scope) || document;
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const want = norm(label);
      const btns = [...root.querySelectorAll('button')].filter((b) => !b.disabled && b.getClientRects().length);
      const txt = (b) => norm(b.querySelector(':scope > span')?.textContent || b.textContent);
      const b = btns.find((x) => x.dataset.action === want) || btns.find((x) => txt(x) === want) || btns.find((x) => txt(x).startsWith(want));
      if (!b) return false;
      b.click();
      return true;
    };
    H.modal = () => c.debug.ui?.()?.openModal ?? null;
    H.info = () => {
      const r = c.state.run;
      return { flow: c.flow, modal: H.modal(), zone: r?.zone, day: r?.day, phase: r?.phase, fishing: c.fishing?.state, ts: c.time.timeScale, hp: r?.hp, creel: r?.creel?.length };
    };
  }, { quality: QUALITY });

  const waitFor = async (fn, arg, timeoutS = 30, stepMs = 400) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutS * 1000) {
      if (await g(fn, arg).catch(() => false)) return true;
      await wait(stepMs);
    }
    return false;
  };
  /** Wait until no banner, toast or fading modal is up, and it stays that way for ~1 s. Banners
   *  run on UI time, so they are pumped forward (pumpUi); toasts and fades expire in real time. */
  const quiet = async (label = '') => {
    const t0 = Date.now();
    while (Date.now() - t0 < QUIET * 1000) {
      // a stray blocking modal (a queued level-up, a catch) would hold toasts forever: close it
      const st = await g(() => { const c = window.__gw; if (c.flow === 'playing' && c.ui.isBlocking?.()) window.__uis.closeUi(); return { q: window.__uis.quiet(), banner: !!document.querySelector('#ui .gw-banner') }; });
      if (st.q) {
        await wait(1000);
        if (await g(() => window.__uis.quiet())) return true;
        continue;
      }
      if (st.banner) await g(() => window.__uis.pumpUi(1));
      await wait(500);
    }
    log(`quiet: transients still up after ${QUIET}s ${label}`);
    return false;
  };
  const ts = (x) => g((x) => window.__gw.debug.timeScale?.(x), x);
  const clickUi = async (label, scope) => {
    const done = await g(([l, s]) => window.__uis.click(l, s), [label, scope]);
    if (!done) throw new Error(`no button "${label}"`);
    return done;
  };

  // ---------------------------------------------------------------- state builders
  let metaSeeded = false;
  const ensureMeta = async () => { if (!metaSeeded) { await g(() => window.__uis.seedMeta()); metaSeeded = true; } };
  async function newSeededRun() {
    await g(() => { window.__uis.tipsSeen(); window.__gw.game.startNewRun({ character: 'wick' }); });
    await wait(1500);
    await g(() => window.__uis.seedRun());
    await wait(5500);   // the first-visit lore line is raised 5.2 s (real time) after the arrival
  }
  async function ensureTitle() {
    await ensureMeta();
    const st = () => g(() => ({ flow: window.__gw.flow, saved: !!window.__gw.game.hasSavedRun?.() }));
    let s = await st();
    if (s.flow === 'title' && s.saved) return;
    if (s.flow === 'dead') { await g(() => { window.__gw.ui.closeAll(); window.__gw.game.toTitle(); }); await wait(600); s = await st(); }
    if (s.flow === 'title' && !s.saved) await newSeededRun();
    // a returning player: a seeded run waits behind Continue (its arrival banner must not linger)
    await quiet('(before title)');
    await g(() => { window.__uis.closeUi(); window.__gw.game.toTitle(); });
    await wait(600);
  }
  async function ensureRun() {
    await ensureMeta();
    const flow = await g(() => window.__gw.flow);
    if (flow === 'playing') { await g(() => { window.__uis.closeUi(); window.__uis.pin(); }); return; }
    if (flow === 'title' && (await g(() => !!window.__gw.game.hasSavedRun?.()))) {
      await g(() => window.__uis.tipsSeen());
      if (!(await g(() => window.__uis.click('Continue')))) await g(() => window.__gw.game.continueRun());
      await wait(1500);
      await g(() => window.__uis.pin());
    } else {
      if (flow === 'dead') await g(() => window.__gw.ui.closeAll());
      await newSeededRun();
    }
  }
  /** Re-pin, freeze gameplay, let the camera settle, wait for transients, park the mouse. */
  async function inRunReady({ freeze = true, settle = 2 } = {}) {
    await g(() => window.__uis.pin());
    await quiet();
    if (freeze) await ts(0);
    await g((s) => { window.__uis.pin(); window.__uis.settle(s); }, settle);
    await park();
    await wait(1600);   // HUD opacity transition .6 s, stat tick-ups
  }

  // ---------------------------------------------------------------- frame wrapper + shot + measure
  const frameNo = () => g(() => window.__gw.time.frame);
  async function renderedFrames(n, timeoutS = 240) {
    const f0 = await frameNo(), t0 = Date.now();
    while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(250); }
    return false;
  }
  /** Full-scale world for two frames, hold the loop, capture, release, back to the fast scale. */
  async function capture(name) {
    const p = resolve(shotsDir, `${name}.png`);
    if (FAST < BASE) await scale(BASE);
    if (!(await renderedFrames(2))) log(`capture ${name}: frames stalled`);
    await g(() => window.__rafHold(true));
    let f = await frameNo();
    for (let i = 0; i < 40; i++) { await wait(400); const f2 = await frameNo(); if (f2 === f) break; f = f2; }
    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      const t0 = Date.now();
      try { await page.screenshot({ path: p, timeout: SHOT_TIMEOUT * 1000 }); done = true; log(`screenshot ${p} (${((Date.now() - t0) / 1000).toFixed(1)}s)`); }
      catch (e) { log(`screenshot ${name} failed (attempt ${attempt + 1}): ${String(e?.message || e).split('\n')[0]}`); }
    }
    await g(() => window.__rafHold(false));
    if (FAST < BASE) await scale(FAST);
    return done ? p : null;
  }
  async function take(name) {
    const p = await capture(name);
    if (!p) throw new Error('screenshot failed');
    if (!MEASURE) return p;
    try {
      const m = await g(collectInPage);
      const img = decodePng(readFileSync(p));
      if (img) {
        for (const t of m.texts) {
          const bg = medianBg(img, t.box);
          if (!bg) continue;
          const [r, gg, b, a] = parseRgba(t.color);
          const al = a * t.opacity;
          const fg = [r * al + bg[0] * (1 - al), gg * al + bg[1] * (1 - al), b * al + bg[2] * (1 - al)];
          t.bg = bg;
          t.contrast = +contrast(fg, bg).toFixed(2);
        }
      }
      m.frame = name; m.summary = summarise(m);
      writeFileSync(p.replace(/\.png$/, '.measure.json'), JSON.stringify(m, null, 1));
      summary[name] = m.summary;
    } catch (e) { log(`measure ${name} failed: ${e?.message || e}`); }
    return p;
  }
  async function frame(name, fn) {
    if (!want(name)) { skipped.push(name); return; }
    const t0 = Date.now();
    try {
      await fn();
      ok.push(name);
      index[name] = { desc: DESC[name] || '', ok: true, s: +((Date.now() - t0) / 1000).toFixed(1) };
      log(`ok   ${name} (${((Date.now() - t0) / 1000).toFixed(1)}s) ${JSON.stringify(await g(() => window.__uis.info()).catch(() => ({})))}`);
    } catch (e) {
      failed.push(`${name}: ${e?.message || e}`);
      index[name] = { desc: DESC[name] || '', ok: false, error: String(e?.message || e) };
      log(`FAIL ${name}: ${e?.stack || e}`);
      await page.mouse.up().catch(() => {});
      await g(() => { try { window.__gw.debug.timeScale?.(1); } catch { /* ignore */ } }).catch(() => {});
    }
  }

  // ================================================================ title group
  await frame('01-title', async () => {
    await ensureTitle();
    await park();
    await wait(6000);   // logotype rise + menu/meta/premise fades (≤ 4.2 s of CSS delays)
    await take('01-title');
  });

  await frame('02-new-descent', async () => {
    await ensureTitle();
    await clickUi('New Descent');
    await park();
    await wait(1500);
    await take('02-new-descent');
    await clickUi('Back');
    await wait(500);
  });

  await frame('03-trials', async () => {
    await ensureTitle();
    await clickUi('Trials');
    await park();
    await wait(1500);
    await take('03-trials');
    await clickUi('Close');
    await wait(500);
  });

  // ================================================================ in-run group
  await frame('04-hud-calm', async () => {
    await ensureRun();
    await inRunReady({ settle: 4 });
    await take('04-hud-calm');
    await ts(1);
  });

  await frame('05-banner', async () => {
    await ensureRun();
    await inRunReady();
    await g(() => { const c = window.__gw, z = c.data.ZONE_BY_ID?.[c.state.run.zone]; c.ui.banner(z?.name || 'The Mossmere', z?.subtitle || '', { kind: 'area' }); });
    const up = await waitFor(() => !!document.querySelector('#ui .gw-banner.gw-in'), null, 20, 200);
    if (!up) throw new Error('banner never rose');
    await wait(1700);   // opacity .8 s / rise 1.4 s
    await take('05-banner');
    await ts(1);
  });

  await frame('06-toasts', async () => {
    await ensureRun();
    await inRunReady();
    await g(() => {
      const c = window.__gw;
      const ch = c.data.CHALLENGE_BY_ID?.first_dawn || (c.data.CHALLENGES || [])[0];
      c.bus.emit('challenge:complete', { challenge: { ...ch, reward: { memories: 25 } } });
      const line = (c.data.MERCHANT_LINES?.arrive || [])[0] || 'A bell across the water.';
      c.bus.emit('toast', { text: `“${line}”`, kind: 'lore' });
      c.bus.emit('toast', { text: 'Your lantern gutters. Oil is low.', kind: 'bad' });
    });
    const up = await waitFor(() => document.querySelectorAll('#ui .gw-toast.gw-in').length >= 3, null, 15, 200);
    if (!up) log('toasts: fewer than 3 on screen');
    await wait(900);
    await take('06-toasts');
    await ts(1);
  });

  let commonFromReel = false;
  await frame('07-hud-reel', async () => {
    await ensureRun();
    await g(() => window.__uis.pin());
    await quiet();
    await ts(1);
    const hooked = await g(() => window.__gw.debug.fishHook?.('mossback_perch'));
    if (!hooked) throw new Error('fishHook did not reach reeling (' + (await g(() => window.__gw.fishing?.state)) + ')');
    await page.mouse.move(width * 0.5, height * 0.42);
    // steer the needle into the pale band for a few game-seconds, then freeze the fight
    const t0 = Date.now();
    let v = null;
    while (Date.now() - t0 < 14000) {
      v = await g(() => { const f = window.__gw.fishing, w = f?.view || {}; return { s: f?.state, t: w.tension ?? 0, p: w.progress ?? 0, surge: !!w.surge }; });
      if (v.s !== 'reeling') break;
      if (Date.now() - t0 > 4000 && v.t > 0.3 && v.t < 0.72 && !v.surge) break;
      if (v.t < 0.5 && !v.surge) { await page.mouse.down(); await wait(260); await page.mouse.up(); } else await wait(260);
    }
    await ts(0);
    log('reel state at freeze', JSON.stringify(v));
    if (v?.s !== 'reeling') throw new Error('fish not on the line at freeze: ' + v?.s);
    await g(() => { window.__uis.pin(); window.__uis.settle(1.5); });
    await park();
    await wait(1400);
    await take('07-hud-reel');
    // land it: the common catch card follows from this fight when both frames run
    await ts(1);
    if (want('08-catch-common')) commonFromReel = true;
    else { await g(() => { window.__gw.debug.instantCatch?.(); }); await wait(800); await g(() => window.__uis.click('eat')); await wait(500); }
  });

  const catchCard = (name, species, prep, opts = {}) => frame(name, async () => {
    await ensureRun();
    const fromReel = name === '08-catch-common' && commonFromReel && (await g(() => window.__gw.fishing?.state)) === 'reeling';
    if (!fromReel) { await g(() => window.__uis.closeUi()); await quiet(); }
    const restore = await g(prep || (() => null), species);
    // fish cinders must not level up behind the card (a queued picker would cover the next frames)
    await g(() => { const r = window.__gw.state.run; window.__uis.xpReal = window.__uis.xpReal || r.xpNext; r.xpNext = 1e9; });
    await ts(1);
    const got = await g((id) => (id ? window.__gw.debug.instantCatch?.(id) : window.__gw.debug.instantCatch?.()), fromReel ? null : species);
    if (!got) throw new Error('instantCatch failed for ' + species);
    const up = await waitFor(() => window.__uis.modal() === 'catch', null, 20, 250);
    if (!up) throw new Error('catch card did not open');
    if (opts.room) { await g(() => document.querySelector('#ui [data-room]')?.click()); }
    await ts(0);
    await park();
    await wait(1800);   // card fade + fish float, the "New in the Journal" toast slides in
    await take(name);
    await g(({ id, restore }) => {
      const c = window.__gw, j = c.state.meta.journal?.[id];
      const f = (c.progression.getPendingCatch?.() || []).find((x) => x?.speciesId === id);
      if (j && restore != null) j.biggest = Math.max(restore, f?.weight || 0);
    }, { id: species, restore });
    await ts(1);
    const out = opts.out || 'eat';
    if (!(await g((a) => window.__uis.click(a), out))) await g(() => window.__uis.click('render') || window.__uis.click('keep'));
    await wait(600);
    await g(() => { const r = window.__gw.state.run, real = window.__uis.xpReal || 40; r.xpNext = real; r.xp = Math.min(r.xp, Math.round(real * 0.62)); window.__uis.xpReal = 0; });
    commonFromReel = false;
  });
  // a known common: pin "biggest" high for the catch so no RECORD ribbon, then restore it
  await catchCard('08-catch-common', 'mossback_perch', (id) => { const j = window.__gw.state.meta.journal; const was = j?.[id]?.biggest ?? null; if (j?.[id]) j[id].biggest = 999; return was; });
  // a first legendary: drop it from the Journal so it is NEW
  await catchCard('09-catch-legendary', 'belled_matriarch', (id) => { const j = window.__gw.state.meta.journal; if (j) delete j[id]; return null; }, { out: 'render' });
  // a known uncommon with a tiny "biggest": always a RECORD
  await catchCard('10-catch-record', 'weeping_carp', (id) => { const j = window.__gw.state.meta.journal; const was = j?.[id]?.biggest ?? 5.1; if (j?.[id]) j[id].biggest = 0.01; else if (j) j[id] = { caught: 3, biggest: 0.01, firstDay: 2, firstRun: 2 }; return was; });

  await frame('11-creel', async () => {
    await ensureRun();
    await inRunReady({ settle: 1 });
    await g(() => window.__gw.ui.openCreel());
    await wait(1200);
    await take('11-creel');
    await g(() => window.__uis.closeUi());
    await ts(1);
  });

  await frame('12-shop-sell', async () => {
    await ensureRun();
    await g(() => { const c = window.__gw; if (!c.actors?.merchant?.present) c.debug.summonMerchant?.(); });
    await inRunReady({ settle: 1 });
    await g(() => window.__gw.ui.openShop());
    await wait(1400);
    await take('12-shop-sell');
    if (want('13-shop-gear')) {
      await clickUi('Gear');
      await wait(900);
      await take('13-shop-gear');
      ok.push('13-shop-gear'); index['13-shop-gear'] = { desc: DESC['13-shop-gear'], ok: true };
    }
    await g(() => window.__uis.closeUi());
    await ts(1);
  });
  if (want('13-shop-gear') && !want('12-shop-sell')) {
    await frame('13-shop-gear', async () => {
      await ensureRun();
      await g(() => { const c = window.__gw; if (!c.actors?.merchant?.present) c.debug.summonMerchant?.(); });
      await inRunReady({ settle: 1 });
      await g(() => window.__gw.ui.openShop());
      await wait(900);
      await clickUi('Gear');
      await wait(1100);
      await take('13-shop-gear');
      await g(() => window.__uis.closeUi());
      await ts(1);
    });
  }

  const journal = (name, grid) => frame(name, async () => {
    await ensureRun();
    await inRunReady({ settle: 1 });
    await g(() => window.__gw.ui.openJournal());
    await wait(1200);
    if (grid) {
      await clickUi('Sporewood');
      await wait(700);
      if (narrow) await g(() => { const pc = document.querySelector('#ui .gw-p-journal .gw-pc'), gr = pc?.querySelector('.gw-jr-grid'); if (pc && gr) pc.scrollTop = gr.offsetTop - 4; });
      await wait(500);
    }
    await take(name);
    await g(() => window.__uis.closeUi());
    await ts(1);
  });
  await journal('14-journal', false);
  await journal('15-journal-grid', true);

  await frame('16-levelup', async () => {
    await ensureRun();
    await inRunReady({ settle: 1 });
    await g(() => { const r = window.__gw.state.run; if (r.xpNext > 1e6) r.xpNext = window.__gw.data.xpForLevel?.(r.level) ?? 40; window.__gw.debug.levelUp?.(1); });
    const up = await waitFor(() => window.__uis.modal() === 'levelup', null, 20, 250);
    if (!up) throw new Error('level-up picker did not open');
    await park();
    await wait(2000);   // cards rise in sequence (.6 s + .1 s each), footer fades at .5 s
    await take('16-levelup');
    await g(() => window.__uis.closeUi());
    await wait(500);
    await ts(1);
  });

  await frame('17-pause', async () => {
    await ensureRun();
    await inRunReady({ settle: 1 });
    await g(() => window.__gw.game.pause());
    await wait(1000);
    await take('17-pause');
    if (want('18-settings')) {
      await clickUi('Settings');
      await wait(1000);
      await take('18-settings');
      ok.push('18-settings'); index['18-settings'] = { desc: DESC['18-settings'], ok: true };
      await clickUi('Done');
      await wait(400);
    }
    await g(() => window.__uis.closeUi());
    await ts(1);
  });
  if (want('18-settings') && !want('17-pause')) {
    await frame('18-settings', async () => {
      await ensureRun();
      await inRunReady({ settle: 1 });
      await g(() => window.__gw.game.pause());
      await wait(700);
      await clickUi('Settings');
      await wait(1000);
      await take('18-settings');
      await g(() => window.__uis.closeUi());
      await ts(1);
    });
  }

  // ================================================================ extras (before the run ends)
  await frame('x1-descend', async () => {
    await ensureRun();
    await inRunReady({ settle: 1 });
    await g(() => window.__gw.ui.openDescend());
    await wait(1200);
    await take('x1-descend');
    await g(() => window.__uis.closeUi());
    await ts(1);
  });

  await frame('x2-hud-night', async () => {
    await ensureRun();
    await g(() => { window.__uis.pin(); window.__gw.debug.setPhase?.('gloomtide'); const r = window.__gw.state.run, i = window.__gw.survival.getPhaseInfo?.(); if (i?.duration) r.phaseTime = i.duration * 0.3; });
    await quiet('(gloomtide banner)');
    await ts(1);
    const kinds = ['gloomling', 'gloomling', 'inkmite', 'duskmantle'];
    await g((kinds) => { const c = window.__gw; for (let i = 0; i < 24; i++) { try { c.debug.spawn?.(kinds[i % kinds.length], 1, 6 + (i % 4)); } catch { /* keep going */ } } }, kinds);
    await wait(3500);
    await ts(0);
    await g(() => { const c = window.__gw, s = window.__uis.stats(); c.debug.setOil?.((s.maxOil || 100) * 0.55); c.debug.setHp?.(Math.max(1, Math.round(s.maxHp || 5) - 2)); window.__uis.settle(1); });
    await park();
    await wait(1500);
    await take('x2-hud-night');
    await g(() => { const c = window.__gw; try { c.combat.killAll?.('debug'); } catch { /* optional */ } window.__uis.phase('calm', 0.35); });
    await ts(1);
    await quiet('(after night)');
  });

  await frame('x3-catch-full', async () => {
    await ensureRun();
    await g(() => window.__uis.closeUi());
    await quiet();
    const n = await g(() => { const c = window.__gw, r = c.state.run, cs = Math.round(window.__uis.stats().creelSize || 4); while (r.creel.length < cs) c.debug.giveFish?.('gutter_crayfish', 0.3, 'normal'); return r.creel.length; });
    log('creel filled to', n);
    await g(() => { const r = window.__gw.state.run; window.__uis.xpReal = r.xpNext; r.xpNext = 1e9; });
    await ts(1);
    if (!(await g(() => window.__gw.debug.instantCatch?.('candlefin_koi')))) throw new Error('instantCatch failed');
    if (!(await waitFor(() => window.__uis.modal() === 'catch', null, 20, 250))) throw new Error('catch card did not open');
    await g(() => document.querySelector('#ui [data-room]')?.click());
    await ts(0);
    await park();
    await wait(1600);
    await take('x3-catch-full');
    await ts(1);
    await g(() => window.__uis.click('eat'));
    await wait(500);
    await g(() => { const r = window.__gw.state.run, real = window.__uis.xpReal || 40; r.creel = r.creel.slice(0, 3); r.xpNext = real; r.xp = Math.min(r.xp, Math.round(real * 0.62)); });
  });

  await frame('x4-victory', async () => {
    await ensureRun();
    await inRunReady({ settle: 1 });
    await g(() => window.__gw.ui.showVictory({ day: 6 }));
    await park();
    await wait(7500);   // lines fade in 1.4 s apart, buttons at 5.5 s
    await take('x4-victory');
    await g(() => window.__uis.click('Keep Drifting') || window.__uis.closeUi());
    await wait(400);
    await ts(1);
  });

  // ================================================================ end of the run
  await frame('19-death', async () => {
    await ensureRun();
    await g(() => { window.__uis.closeUi(); window.__uis.pin(); });
    await quiet();
    await ts(1);
    await g(() => window.__gw.game.endRun('gloom'));
    const up = await waitFor(() => window.__uis.modal() === 'death', null, 20, 250);
    if (!up) throw new Error('death screen did not open');
    await park();
    // CSS fades run ≤ 2.6 s; the Memories count-up runs on UI time, so pump it to the end
    await g(() => window.__uis.pumpUi(8));
    await waitFor(() => { const b = document.querySelector('#ui .gw-mem-n'); const rows = [...document.querySelectorAll('#ui .gw-mem-row b')]; return !!b && b.textContent !== '0' && rows.every((x) => x.textContent !== '+0'); }, null, 30, 500);
    await wait(3500);
    await take('19-death');
  });

  await frame('20-shrine', async () => {
    let flow = await g(() => window.__gw.flow);
    if (flow !== 'dead') {
      await ensureRun();
      await g(() => { window.__uis.closeUi(); });
      await quiet();
      await g(() => window.__gw.game.endRun('gloom'));
      await waitFor(() => window.__uis.modal() === 'death', null, 20, 250);
      await wait(2500);
      flow = 'dead';
    }
    await clickUi('Shrine');
    await park();
    await wait(1500);
    await take('20-shrine');
    await g(() => window.__uis.click('Close'));
    await wait(400);
  });

  // ---------------------------------------------------------------- wrap up
  await g(() => { try { window.__gw.debug.timeScale?.(1); } catch { /* ignore */ } }).catch(() => {});
  if (FAST < BASE) await scale(BASE);
  {
    // a UI_ONLY re-run merges into the set's index / summary instead of replacing them
    const merge = (file, obj) => { let prev = {}; try { prev = JSON.parse(readFileSync(file, 'utf8')); } catch { /* fresh */ } return Object.assign(prev, obj); };
    try {
      const f = resolve(shotsDir, 'index.json');
      const prev = merge(f, {});
      writeFileSync(f, JSON.stringify({ size: `${width}x${height}`, mobile: !!args.mobile, fonts: [...new Set(fontInfo)], seed: SEED, quality: QUALITY, frames: Object.assign(prev.frames || {}, index) }, null, 1));
    } catch { /* optional */ }
    if (MEASURE) { try { const f = resolve(shotsDir, 'measure-summary.json'); writeFileSync(f, JSON.stringify(merge(f, summary), null, 1)); } catch { /* optional */ } }
  }
  log(`ui frames: ${ok.length} ok, ${failed.length} failed${skipped.length ? `, ${skipped.length} skipped` : ''}`);
  for (const f of failed) log('  failed', f);
}
