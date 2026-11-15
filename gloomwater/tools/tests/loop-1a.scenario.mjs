// The Full Hold's slice 1a in the browser (docs/loop/slice-1a/PLAN.md §2.4 and §0's lane D rows; lane D owns this file): T31, T32,
// T36, T43, T44, T46, T50, T56, T57, T59–T64, T66–T69, T71, T73, T74 on a loop dev build from a fresh save, and a smoke step for
// each Wick's passive (WICKS.md §5: the Wick's first-sale ticks, Taper's non-common first card, Stub's quick bite, Tallow's fourth
// slot, Ashwick's ember-glow comeback).
//
//   node build.mjs --dev --out=tools/out/loop-1a.html
//   node tools/playtest.mjs --html=tools/out/loop-1a.html --shots=tools/out/loop-1a/desktop --script=tools/tests/loop-1a.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/loop-1a.html --shots=tools/out/loop-1a/phone --script=tools/tests/loop-1a.scenario.mjs --mobile
//   (the regression runner takes it too: --script=tools/scenario-run.mjs --scenario=loop-1a)
// Options: --wick=<id>        the main pass's Wick (LOOP.wicks.order; default taper). The stager's step 4b runs one pass per Wick and
//                             looks at the film's close takes (shots `film-wick`, `film-home`)
//          --only=main,forget,nofilm   run some passes (forget needs the save main leaves)
//          --quality=low|medium|high   --noshots   --seed=<n> (the fishing RNG of the smoke steps; default 7)
//   node tools/tests/loop-1a.scenario.mjs   (no browser) dry-runs the pure helpers on the loop data and exits non-zero on a fault
//
// THE PASSES. `main`: the fresh title (New Descent · Settings) → the New Descent panel → a Wick → Start → the film in the same task
// (its close takes shot) → Skip → the hand-off glide to the Jetty → the tutorial at the wake (a reload, the home pause, Settings) →
// the Chart (a reload) → Escape (the Chart never opens itself again) → Sail → the glide out → the first trip (the two tips, a full
// hold by two debug catches and one real one, the press-and-hold checks, the refused cast) → Home from near docks[2] → the tally
// (Escape to its end, Sold) → the home pause → the shelf (Hold 4, "Yours.") → the Chart → Sail → the Wick's smoke step → the gate
// (scenery) → the pause and the Journal's species page → a reload mid-trip (Continue restores the hold, the bites and the raft) →
// a 0.7 s hold on the Home pill → the tally → Sold (Tallow then buys Hold 5 and sails: six cells on a phone).
// `forget`: a reload after main: Continue · Settings (· Prologue), then Settings → Forget everything → the two in-page confirms with
// the loop's words → a fresh title. `nofilm`: a fresh save with no film opt-in: Start goes straight to the Jetty at the wake.
//
// HOW TIME IS DRIVEN. Software GL runs at 1–10 fps here, so nothing is judged on wall-clock playback. The page's
// requestAnimationFrame is held and the game's own frame callback is stepped on a synthetic clock (1/30 s a frame, the canvas drawn
// only for the frames that are shot), and performance.now follows the same clock while frames are held, so the UI's real-dt clocks
// (the tutorial, the tally, the pill's hold) run on it too. CSS fades and setTimeout still run on the wall clock and are waited out.
//
// THE HOOKS. DOM and state through PLAN §3.6's names only (`[data-loop=…]`, `[data-tile=…]`, `[data-action=…]`, `[data-buy=…]`,
// `.gw-hold .gw-slot[data-filled]`, `.gw-home.gw-pulse`, `button.gw-char[data-wick]`, `.gw-loop-trait`, `.gw-cue`, `.gw-dim`,
// `[data-water=mossmere]`, `.gw-slot`, `button[data-loop=homepause]`; modal ids through `__gw.debug.ui()`; `ctx.progression.loop`,
// `ctx.ui.loop.tutorial`, `ctx.debug.loop`, `ctx.fishing.waterAt`, the events of §3.6), the built debug hooks §2.4 names
// (`debug.instantCatch`, `forceBite`, `fishOutcome`, `fishStrike`, `fishPlayTo`, `debug.intro`, `debug.ui`) and built markup the
// scenario only reads (the title's `.gw-tbtn`, the modal layer's `[data-modal]`, the HUD's `.gw-tl` / `.gw-tr` / `.gw-hb-pause`).
// A neighbour that is absent fails its check; it never throws (PLAN §3's stub rule).
import { pathToFileURL } from 'node:url';

export const SAVE_KEY = 'gloomwater.save.v1';   // core.SAVE_KEY (built)
export const STEP = 1 / 30;
/** The events the in-page driver records (PLAN §3.6, plus the built ones the checks read). */
export const WATCH = ['flow:change', 'home:enter', 'zone:change', 'run:start', 'run:end', 'player:glide', 'intro:start', 'intro:skip',
  'intro:done', 'ui:modal', 'fishing:cast', 'fishing:bite', 'fishing:miss', 'fishing:strike', 'fishing:escaped', 'fishing:landing',
  'fishing:show', 'fish:measured', 'fish:landed', 'fish:action', 'loop:holdFull', 'loop:tally', 'loop:buy', 'loop:tutorial',
  'fish:escaped', 'firstEvening:line', 'merchant:arrive', 'gate:open', 'card:stamp'];

export class Abort extends Error {}

// ================================================================== pure helpers (node; the dry run checks them)
/** Clams as core.fmtClams writes them (PLAN §3.2; the dry run proves the two agree): "9,999", "12.4k", "1.2m". */
export function clamText(n) {
  const v = Number(n) || 0, a = Math.abs(v), sign = v < 0 ? '-' : '';
  if (Math.round(a) < 10000) return Math.round(v).toLocaleString('en-US');
  const k = Math.floor(a / 100) / 10;
  if (k < 1000) return `${sign}${k.toFixed(1)}k`;
  return `${sign}${(Math.floor(a / 100000) / 10).toFixed(1)}m`;
}
/** data.wickSlots on a plain LOOP.wicks table (WICKS §2.4): the bought count plus the Wick's own slot (Tallow 1). */
export function slotsFor(wicks, holdSlots, wick) {
  const id = Array.isArray(wicks?.order) && wicks.order.includes(wick) ? wick : 'wick';
  return (Number(holdSlots) || 0) + (Number(wicks?.[id]?.slots) || 0);
}
/** Murk's departure line for a Wick (TEXT_LOOP.murk.firstChartBy[wick], else firstChart: WICKS §2.4, PLAN §5.5). */
export function firstChartLine(T, wick) { return T?.murk?.firstChartBy?.[wick] ?? T?.murk?.firstChart ?? ''; }
/** The Jetty's goal line for a goal ({id, name, price, level}): a hold step names the slots it gives this Wick (WICKS §2.4). */
export function goalText(T, wicks, goal, wick) {
  if (!goal || typeof goal !== 'object') return null;
  const hold = typeof goal.id === 'string' && goal.id.startsWith('hold:');
  const level = Number(goal.level ?? (hold ? goal.id.split(':')[1] : NaN));
  const name = hold && Number.isFinite(level) ? String(T.holdName).replace('{n}', slotsFor(wicks, level, wick)) : goal.name;
  return String(T.next).replace('{name}', name).replace('{price}', clamText(goal.price));
}
/** A regex for a line as the DOM shows it: whitespace may grow, shrink or vanish around a glyph (a clam icon is no text). */
export function looseRe(s) {
  return new RegExp(String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'));
}
/** What the main pass expects of a Wick at the start (PLAN §2.4 as WICKS §5 rewrites it: counts from the hold, not "three"). */
export function expectFor(L, T, wick) {
  const W = L.wicks, H = L.hold, s0 = slotsFor(W, H.start, wick);
  const step = (n) => H.ladder.find((x) => x.slots === n);
  return {
    slots0: s0, slots4: slotsFor(W, 4, wick), slots5: slotsFor(W, 5, wick), firstChart: firstChartLine(T, wick),
    goal0: goalText(T, W, { id: 'hold:4', level: 4, price: step(4)?.price }, wick),
    goalHold5: goalText(T, W, { id: 'hold:5', level: 5, price: step(5)?.price }, wick),
  };
}
/** The first trip's catches (PLAN §2.4): `n` fish of different kinds (each a first for the Wick), keepers only, the last through
 *  the real path; chosen so the tally pays at least Hold 4's price. Returns [{speciesId, z, via}]. */
export function catchPlan(n) {
  const kinds = [['mossback_perch', 0.4], ['weeping_carp', 0.4], ['gutter_crayfish', 0.4], ['candlefin_koi', 0.3], ['dusk_minnow', 0.4]];
  const out = kinds.slice(0, Math.max(1, n - 1)).map(([speciesId, z]) => ({ speciesId, z, via: 'instant' }));
  out.length = Math.max(0, n - 1);
  out.push({ speciesId: 'dusk_minnow', z: 0.4, via: 'real' });
  return out;
}
/** The rows a tally must hold (T21, WICKS §2.1): every kept fish once; the total the sum; a non-Wick's row pays what its card said;
 *  the Wick's row keeps the card's figure as `base` and pays at least that, more for a first. */
export function tallyFaults(lines, total, stamped, wick) {
  const bad = [];
  if (!Array.isArray(lines)) return ['no lines'];
  const sum = lines.reduce((a, l) => a + (Number(l?.clams) || 0), 0);
  if (sum !== total) bad.push(`total ${total} is not the sum ${sum}`);
  const uids = Object.keys(stamped || {});
  if (uids.length && lines.length !== uids.length) bad.push(`${lines.length} rows for ${uids.length} kept fish`);
  for (const l of lines) {
    const card = stamped?.[l?.uid];
    if (card === undefined) { if (uids.length) bad.push(`row ${l?.uid} was never kept`); continue; }
    if (wick === 'wick') {
      const base = l.base ?? l.clams;
      if (base !== card) bad.push(`${l.speciesId}: base ${base}, the card said ${card}`);
      if (!(l.clams >= base)) bad.push(`${l.speciesId}: paid ${l.clams} under its base ${base}`);
      if (l.first === true && !(l.clams > base)) bad.push(`${l.speciesId}: a first paid no bonus`);
    } else if (l.clams !== card) bad.push(`${l.speciesId}: paid ${l.clams}, the card said ${card}`);
  }
  return bad;
}

// ================================================================== T43's word rules (also run in the page: self-contained)
/**
 * The allow-list of PLAN T43, built from the data: every TEXT_LOOP string (templates become patterns, and their leading or trailing
 * runs, since a glyph can split a line), species names, size-class labels, water names, the Wicks' names, the Prologue word, the
 * first trip's two tips, the shelf's item names (the ladder, the tackle tiers: the shelf's cards are named, PLAN §2.3 item 2) and the
 * card's "length" label. "New Descent" is kept apart: it is allowed on the fresh title and the panel only.
 */
export function wordRules(D) {
  const norm = (s) => String(s).replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim();
  const exact = new Set(), templates = [];
  const walk = (v) => {
    if (typeof v === 'string') { if (/\{[a-z]+\}/i.test(v)) templates.push(v); else if (norm(v)) exact.add(norm(v)); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  const T = (D && D.TEXT_LOOP) || {};
  for (const [k, v] of Object.entries(T)) if (k !== 'newDescent') walk(v);
  for (const sp of D.SPECIES || []) if (sp && sp.name) exact.add(norm(sp.name));
  for (const c of D.SIZE_CLASSES || []) if (c && c.label) exact.add(norm(c.label));
  exact.add('Ancient');
  for (const z of D.ZONES || []) if (z && z.name) exact.add(norm(z.name));
  for (const c of D.CHARACTERS || []) if (c && c.name) exact.add(norm(c.name));
  const R = D.INTRO && D.INTRO.trigger && D.INTRO.trigger.replay && D.INTRO.trigger.replay.word;
  if (R) exact.add(norm(R));
  const tips = (D.FIRST_EVENING && D.FIRST_EVENING.tips) || {};
  walk(tips.fe_cast); walk(tips.fe_strike);
  const L = D.LOOP || {};
  for (const s of (L.hold && L.hold.ladder) || []) if (s && s.name) exact.add(norm(s.name));
  if (L.hold && L.hold.startName) exact.add(norm(L.hold.startName));
  walk((L.tackle && L.tackle.names) || {});
  for (const slot of ['rod', 'line', 'reel']) for (const t of (D.TACKLE && D.TACKLE[slot]) || []) if (t && t.name) exact.add(norm(t.name));
  exact.add('length');
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [];
  for (const tpl of templates) {
    const parts = norm(tpl).split(/(\{[a-z]+\})/i).filter((p) => p !== '');
    const tok = parts.map((p) => (/^\{[a-z]+\}$/i.test(p) ? '(.+?)' : esc(p)));
    for (let i = 0; i < tok.length; i++) {
      for (let j = i + 1; j <= tok.length; j++) {
        if (i !== 0 && j !== tok.length) continue;
        if (!parts.slice(i, j).some((p) => !/^\{[a-z]+\}$/i.test(p) && /[A-Za-z]/.test(p))) continue;
        patterns.push('^' + tok.slice(i, j).join('').trim() + '$');
      }
    }
  }
  return { exact: [...exact], newDescent: T.newDescent ? norm(T.newDescent) : null, patterns: [...new Set(patterns)] };
}
/** One visible text against the rules: 'ok', 'banned:<what>' or 'unknown'. `where`: {card, newDescentOk}. Self-contained. */
export function classifyText(text, rules, where) {
  const w = where || {};
  const norm = (s) => String(s).replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim();
  const s = norm(text);
  if (!s) return 'ok';
  const unq = s.replace(/^[“"‘']+/, '').replace(/[”"’']+$/, '').trim();
  if (w.newDescentOk && rules.newDescent && unq === rules.newDescent) return 'ok';
  if (/\bshells?\b/i.test(s)) return 'banned:shells';
  if (/\bmemor(y|ies)\b/i.test(s)) return 'banned:memories';
  if (/descent/i.test(s)) return 'banned:descent';
  if (/\bkg\b/i.test(s)) return 'banned:kg';
  if (!rules._set) { try { Object.defineProperty(rules, '_set', { value: new Set(rules.exact), enumerable: false }); } catch { rules._set = new Set(rules.exact); } }
  if (!rules._re) { const re = rules.patterns.map((p) => new RegExp(p)); try { Object.defineProperty(rules, '_re', { value: re, enumerable: false }); } catch { rules._re = re; } }
  const one = (x) => {
    if (!x) return true;
    if (rules._set.has(x)) return true;
    if (/^[\s·•\-–—:|/,.()[\]…›‹«»+×✕★☆]+$/.test(x)) return true;                     // a separator or a glyph character
    if (/^[+\-−]?\d[\d,]*(\.\d+)?[km]?$/.test(x)) return true;                             // a number (clams as fmtClams writes them)
    if (/^\d+\s?\/\s?\d+$/.test(x)) return true;                                           // a count ("2 / 6")
    if (/^(\d[\d,]*\s?lb(\s\d+\s?oz)?|\d+\s?oz|[¼½¾]\s?oz|\d+\s?[¼½¾]\s?oz|lb|oz)$/.test(x)) return true;   // a weight as fmtWeight prints it
    if (w.card && /^(\d+(\.\d+)?\s?cm|cm)$/.test(x)) return true;                         // the card's one length line
    return rules._re.some((r) => r.test(x));
  };
  if (one(s) || one(unq)) return 'ok';
  const parts = unq.split(/\s+·\s+/);
  if (parts.length > 1 && parts.every((p) => one(p.trim()))) return 'ok';
  return 'unknown';
}
/**
 * T43's scan of what is on screen (the page; self-contained): every visible text node in the HUD, the screens, the toasts and the
 * banners (not the world-space words), less the exempt parts (the Settings panel and its confirms, the logotype, key glyphs, the
 * card's built record kicker, a screen held under the ink). → {n, texts, banned, unknown}. opts: {roots, newDescentOk, allow}.
 */
export function scanDom(opts, rules, classify) {
  const o = opts || {};
  const roots = (o.roots || ['#ui > .gw-hud', '#ui > .gw-modal-layer', '#ui > .gw-toasts', '#ui > .gw-banner-layer'])
    .flatMap((s) => [...document.querySelectorAll(s)]);
  const exempt = ['[data-modal=settings]', '[data-modal=confirm]', '.gw-logotype', 'kbd', '.gw-cc-kicker', '[data-held]', '[aria-hidden=true]'];
  const W = innerWidth, H = innerHeight;
  const vis = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0.5 && r.height > 0.5 && r.bottom > 0 && r.right > 0 && r.top < H && r.left < W;
  };
  const out = { n: 0, texts: [], banned: [], unknown: [] };
  for (const root of roots) {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
      const raw = t.nodeValue;
      if (!raw || !raw.trim()) continue;
      const el = t.parentElement;
      if (!el || el.closest('svg, style, script, template')) continue;
      if (exempt.some((s) => el.closest(s))) continue;
      if (!vis(el)) continue;
      const text = raw.replace(/\s+/g, ' ').trim();
      const card = !!el.closest('[data-modal=catch]');
      const nd = !!o.newDescentOk && !!(el.closest('[data-modal=title]') || el.closest('[data-modal=newdescent]'));
      const k = classify(text, rules, { card, newDescentOk: nd });
      out.n++;
      out.texts.push(text);
      if (k.startsWith('banned')) out.banned.push(`${k}: ${text}`);
      else if (k === 'unknown' && o.allow !== false) out.unknown.push(text);
    }
  }
  out.texts = [...new Set(out.texts)];
  out.unknown = [...new Set(out.unknown)];
  return out;
}

// ================================================================== the in-page driver (self-contained; installed per page load)
export function installDriver(watch) {
  const c = window.__gw;
  if (window.__lp) return 'again';
  const raf = window.requestAnimationFrame.bind(window);
  const realNow = performance.now.bind(performance);
  const T = { held: null, clock: 0, offset: 0, sim: 0, dry: 0, ev: [], landed: null, confirms: 0, pulses: [] };
  window.__lp = T;
  window.requestAnimationFrame = (cb) => { if (T.held) { T.held.push(cb); return 0; } return raf((ts) => cb(Math.max(ts + T.offset, T.clock))); };
  try { performance.now = () => (T.held ? T.clock : Math.max(realNow() + T.offset, T.clock)); } catch { /* a read-only clock: the UI keeps the wall clock */ }
  const draw = c.render.render.bind(c.render);
  T.drawing = (on) => { c.render.render = on ? draw : () => {}; };
  T.hold = () => { if (!T.held) { T.held = []; T.clock = Math.max(T.clock, realNow() + T.offset); } };
  T.release = () => {
    const q = T.held || [];
    T.held = null;
    T.offset = Math.max(T.offset, T.clock - realNow());
    T.drawing(true);
    for (const cb of q) raf((ts) => cb(Math.max(ts + T.offset, T.clock)));
  };
  /** n frames of the game's own loop, dt seconds each; the canvas drawn only when `paint`. Returns the frames that ran. */
  T.step = (n = 1, dt = 1 / 30, paint = false) => {
    T.drawing(paint);
    let ran = 0;
    for (let i = 0; i < n; i++) {
      if (!T.held || !T.held.length) { T.dry++; continue; }
      T.clock += dt * 1000; T.sim += dt;
      const q = T.held; T.held = [];
      for (const cb of q) { try { cb(T.clock); } catch (e) { c.errors.push('frame: ' + (e?.message || e)); } }
      ran++;
    }
    T.drawing(true);
    return ran;
  };
  /** Step until `src` (an expression of c and T) holds, at most maxSec of game time. → {ok, t}. */
  T.until = (src, maxSec = 10, dt = 1 / 30) => {
    const f = new Function('c', 'T', `try { return !!(${src}); } catch (e) { return false; }`);
    let t = 0;
    if (f(c, T)) return { ok: true, t: 0 };
    while (t < maxSec - 1e-9) {
      if (!T.step(1, dt)) return { ok: false, t, dry: true };
      t += dt;
      if (f(c, T)) return { ok: true, t: +t.toFixed(3) };
    }
    return { ok: false, t: +t.toFixed(3) };
  };
  /** The film to time t (or its end); and to its end. */
  T.runTo = (t, dt = 1 / 30, max = 4000) => { let n = 0; while (c.intro?.isActive?.() && c.intro.state.t < t - 1e-6 && n++ < max) T.step(1, dt); return c.intro?.state?.t ?? null; };
  T.runOut = (dt = 1 / 30, max = 4000) => { let n = 0; while (c.intro?.isActive?.() && n++ < max) T.step(1, dt); return n; };
  // ---- the DOM, read
  T.visible = (el) => {
    if (!el || !el.isConnected) return false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0.5 && r.height > 0.5;
  };
  const say = (e) => (e.querySelector(':scope > span')?.textContent || e.textContent || '').replace(/\s+/g, ' ').trim();
  T.say = say;
  T.all = (sel) => [...document.querySelectorAll(sel)].filter(T.visible);
  T.one = (sel) => T.all(sel)[0] || null;
  T.text = (sel) => { const e = T.one(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
  T.box = (sel, txt = null) => {
    let els = T.all(sel);
    if (txt) els = els.filter((e) => say(e).startsWith(txt) || e.textContent.replace(/\s+/g, ' ').trim().startsWith(txt));
    const e = els[0];
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top, r: r.right, b: r.bottom, disabled: !!e.disabled, text: say(e) };
  };
  T.buttons = (sel) => T.all(`${sel} button`).map(say).filter(Boolean);
  /** Is a visible text node in the UI's layers that contains `s`? */
  T.seen = (s) => {
    if (!s) return false;
    const want = String(s).replace(/\s+/g, ' ').trim();
    for (const root of document.querySelectorAll('#ui > .gw-hud, #ui > .gw-modal-layer, #ui > .gw-toasts, #ui > .gw-banner-layer')) {
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let t = tw.nextNode(); t; t = tw.nextNode()) {
        if (!t.nodeValue || !t.nodeValue.includes(want.slice(0, 12))) continue;
        const el = t.parentElement?.closest('*');
        const block = el?.closest('.gw-toast, [data-modal], .gw-hud > *') || el;
        if (block && T.visible(el) && block.textContent.replace(/\s+/g, ' ').includes(want)) return true;
      }
    }
    return false;
  };
  T.docks = () => (c.world?.getDocks?.() || []).map((d) => ({ x: d.position.x, z: d.position.z, yaw: d.yaw }));
  T.distTo = (p) => { const q = c.player?.position; return q && p ? Math.hypot(q.x - p.x, q.z - p.z) : null; };
  T.stored = () => { try { return JSON.parse(localStorage.getItem('gloomwater.save.v1') || 'null'); } catch { return null; } };
  // ---- the state, read (PLAN §3.3's loop, §3.6's fields)
  T.state = () => {
    const r = c.state.run, L = c.progression?.loop, u = c.debug.ui?.() || {}, p = c.player?.position;
    const safe = (f, d = null) => { try { const v = f(); return v === undefined ? d : v; } catch { return d; } };
    const m = safe(() => L?.state?.());
    const h = safe(() => L?.hold?.());
    const tut = safe(() => c.ui?.loop?.tutorial);
    return {
      flow: c.flow, paused: !!c.paused, modal: u.openModal ?? null, stack: Array.isArray(u.stack) ? u.stack.slice() : [], fishing: c.fishing?.state ?? null,
      inShow: c.fishing?.inShow === true, cinematic: !!c.cinematic, sim: +T.sim.toFixed(3), errors: c.errors.slice(),
      run: r ? { id: r.id, outing: r.outing ?? null, character: r.character ?? null, evening: r.evening ?? null, zone: r.zone, phase: r.phase, phaseTime: r.phaseTime,
        active: r.active, creel: (r.creel || []).length, bites: { ...(r.bites || {}) }, mercy: { ...(r.mercy || {}) } } : null,
      loop: m ? { clams: m.clams, evenings: m.evenings, holdSlots: m.holdSlots, wick: m.wick ?? null, tutorial: m.tutorial ? { ...m.tutorial } : null,
        said: { ...(m.said || {}) }, lastTrip: m.lastTrip ? JSON.parse(JSON.stringify(m.lastTrip)) : null } : null,
      hold: h ? { slots: h.slots, n: (h.fish || []).length, full: !!h.full } : null,
      goal: safe(() => L?.goal?.()),
      pos: p ? [p.x, p.z] : null, mode: safe(() => c.render?.getCameraMode?.()),
      tut: tut ? { step: safe(() => tut.step), active: safe(() => tut.isActive?.()), cue: safe(() => tut.cue?.()), t: safe(() => tut.state?.t) } : null,
      intro: c.state.meta.intro ? { ...c.state.meta.intro } : null, seenTips: { ...(c.state.meta.seenTips || {}) },
      enemies: (c.combat?.enemies || []).filter((e) => e?.alive).length,
    };
  };
  // ---- the events, recorded (listeners, so a module's own emit reference is caught too)
  const clone = (p) => {
    try { return JSON.parse(JSON.stringify(p ?? null)); } catch {
      const o = {};
      for (const [k, v] of Object.entries(p || {})) if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) o[k] = v;
      return o;
    }
  };
  for (const e of watch) {
    c.bus.on(e, (p) => {
      const rec = { e, sim: +T.sim.toFixed(4), flow: c.flow, p: clone(p) };
      if (e === 'player:glide') { const q = c.player?.position; rec.raft = q ? [q.x, q.z] : null; rec.mode = c.render?.getCameraMode?.() ?? null; if (p?.state === 'start') rec.save = T.stored(); }
      if (e === 'intro:done' || e === 'home:enter' || e === 'run:start') rec.mode = c.render?.getCameraMode?.() ?? null;
      if (e === 'fish:landed') T.landed = p?.fish ?? null;
      if (e === 'fish:landed' || e === 'fish:measured') rec.fish = p?.fish ? { uid: p.fish.uid ?? null, speciesId: p.fish.speciesId ?? p.fish.id ?? null, z: p.fish.z ?? null, sizeClass: p.fish.sizeClass ?? null } : null;
      T.ev.push(rec);
    });
  }
  // window.confirm is never the loop's (T69): counted, refused
  window.confirm = () => { T.confirms++; return false; };
  // Ashwick's ember (WICKS §2.5): the fx pulses, recorded (the built fx object the fishing debug hook hands out)
  try {
    const fx = c.debug.fishFx?.();
    if (fx && typeof fx.pulse === 'function') { const pulse = fx.pulse.bind(fx); fx.pulse = (...a) => { T.pulses.push({ sim: T.sim, color: a[2]?.color ?? null }); return pulse(...a); }; }
  } catch { /* optional */ }
  return 'ok';
}

// ================================================================== the node-side kit (shared with loop-time.scenario.mjs)
export function makeKit(api, { label = 'loop' } = {}) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  const phone = !!args.mobile || width < height;
  const tag = phone ? 'phone' : 'desk';
  const quality = typeof args.quality === 'string' ? args.quality : phone ? 'medium' : 'high';
  const base = page.url().split('?')[0];
  const K = { phone, tag, failures: [], notes: [], part: 'boot', t0: Date.now(), shotN: 0, prefix: label };
  K.step = (s) => { K.part = s; log(`---- ${s}  (+${((Date.now() - K.t0) / 1000).toFixed(0)} s)`); };
  K.check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg); return true; }
    const m = `[${K.part}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`;
    K.failures.push(m);
    log('FAIL', m);
    return false;
  };
  K.need = (cond, msg, extra) => { if (!K.check(cond, msg, extra)) throw new Abort(msg); return true; };
  K.note = (msg, extra) => { const m = `[${K.part}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`; K.notes.push(m); log('note', m); };
  K.g = g;
  K.steps = (n = 1, dt = STEP) => g(([n, dt]) => window.__lp.step(n, dt), [n, dt]);
  K.secs = (s, dt = STEP) => K.steps(Math.max(1, Math.round(s / dt)), dt);
  K.until = (src, maxSec = 10, dt = STEP) => g(([src, m, dt]) => window.__lp.until(src, m, dt), [src, maxSec, dt]);
  K.state = () => g(() => window.__lp.state());
  K.events = (from = 0) => g((f) => window.__lp.ev.slice(f), from);
  K.evCount = () => g(() => window.__lp.ev.length);
  K.sim = () => g(() => window.__lp.sim);
  K.settle = (ms = 320) => wait(ms);
  /** A frame drawn, then shot (desk-/phone-<label>-NN-name.png in --shots). */
  K.shoot = async (name) => {
    if (args.noshots) return;
    try { await g(() => { window.__lp.step(1, 1 / 120, true); }); } catch { /* the page is between loads */ }
    await wait(90);
    await api.shot(`${tag}-${K.prefix}-${String(++K.shotN).padStart(2, '0')}-${name}`);
  };
  K.hold = async () => {
    await g(() => window.__lp.hold());
    for (let i = 0; i < 2400; i++) { if (await g(() => (window.__lp.held?.length || 0) > 0)) return true; await wait(50); }
    K.note('no frame was queued after 120 s');
    return false;
  };
  K.release = () => g(() => window.__lp.release());
  /** Install the driver and the word rules on a freshly loaded page, then hold its frames. */
  K.install = async () => {
    await g(([q]) => { const c = window.__gw; c.state.meta.settings = c.state.meta.settings || {}; c.state.meta.settings.quality = q; c.render.setQuality?.(q); }, [quality]);
    await page.evaluate(`(${installDriver.toString()})(${JSON.stringify(WATCH)})`);
    await page.evaluate(`window.__lpw = { rules: (${wordRules.toString()})(window.__gw.data), classify: ${classifyText.toString()}, scan: ${scanDom.toString()} }`);
    await K.hold();
  };
  const titleUp = () => page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 250 });
  /** Load the loop page (?loop=1). fresh: an empty localStorage first (the page being left is told not to save on pagehide). */
  K.load = async ({ fresh = false, query = '' } = {}) => {
    if (fresh) await g(() => { try { if (window.__gw?.game) window.__gw.game.save = () => {}; localStorage.clear(); } catch { /* ignore */ } }).catch(() => {});
    for (let attempt = 0; ; attempt++) {
      try { await page.goto(`${base}?loop=1${query}`, { waitUntil: 'load', timeout: 300000 }); break; } catch (e) { if (attempt >= 2) throw e; log('goto failed, again:', String(e?.message || e).split('\n')[0]); await wait(1500); }
    }
    await titleUp();
    await K.install();
  };
  /** A reload with the save kept (the page saves itself on pagehide, as a closed tab would). */
  K.reload = async () => {
    await K.release().catch(() => {});
    for (let attempt = 0; ; attempt++) {
      try { await page.reload({ waitUntil: 'load', timeout: 300000 }); break; } catch (e) { if (attempt >= 2) throw e; await wait(1500); }
    }
    await titleUp();
    await K.install();
    await K.titleReady();
  };
  /** The title's menu faded in (real time), then frames held again. */
  K.titleReady = async () => {
    await K.release();
    await page.waitForFunction(() => { const m = document.querySelector('[data-modal=title] .gw-title-menu'); return !!m && Number(getComputedStyle(m).opacity) > 0.9; }, null, { timeout: 120000, polling: 200 }).catch(() => K.note('the title menu never faded in'));
    await K.hold();
  };
  K.titleWords = () => g(() => window.__lp.all('[data-modal=title] .gw-tbtn, [data-modal=title] .gw-title-replay').map(window.__lp.say));
  K.scanRaw = (opts = {}) => g((o) => window.__lpw.scan(o, window.__lpw.rules, window.__lpw.classify), opts);
  /** T43 on this screen: no banned word anywhere, and (unless allow is false) every visible text on the allow-list. */
  K.scan = async (where, opts = {}) => {
    const r = await K.scanRaw(opts);
    K.check(r.banned.length === 0, `T43 (${where}): no "Shells", "Memories", "Descent" or "kg" on screen`, r.banned);
    if (opts.allow !== false) K.check(r.unknown.length === 0, `T43 (${where}): every visible word is on the allow-list`, r.unknown);
    return r;
  };
  K.noErrors = async (where) => { const e = await g(() => window.__gw.errors.slice()); K.check(e.length === 0, `ctx.errors stays empty (${where})`, e.slice(0, 6)); };
  // ---- real input
  K.tapXY = async (x, y) => { if (phone) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
  K.box = (sel, text = null) => g(([s, t]) => window.__lp.box(s, t), [sel, text]);
  /** A real tap (a click on a desktop) on the first visible match (whose words start with `text`, when given). */
  K.tap = async (sel, text = null, { settle = 2 } = {}) => {
    const b = await K.box(sel, text);
    if (!b) return null;
    await K.tapXY(b.x, b.y);
    if (settle) await K.steps(settle);
    return b;
  };
  K.key = async (code, { settle = 2 } = {}) => { await page.keyboard.press(code); if (settle) await K.steps(settle); };
  let cdp = null;
  const touch = async (type, x, y) => { cdp = cdp || await page.context().newCDPSession(page); await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] }); };
  /** A real press held `sec` of both clocks (game frames stepped meanwhile); `probe` (an expression) is sampled every frame. */
  K.pressHold = async (x, y, sec, probe = null) => {
    if (phone) await touch('touchStart', x, y); else { await page.mouse.move(x, y); await page.mouse.down(); }
    const w0 = Date.now(), seen = [];
    let sim = 0;
    while (sim < sec - 1e-6) {
      const r = await g(([src]) => { window.__lp.step(1, 1 / 30); if (!src) return null; try { return new Function('c', 'T', `return (${src})`)(window.__gw, window.__lp); } catch { return null; } }, [probe]);
      if (probe) seen.push(r);
      sim += STEP;
    }
    while (Date.now() - w0 < sec * 1000) await wait(10);
    const wall = (Date.now() - w0) / 1000;
    if (phone) await touch('touchEnd', x, y); else await page.mouse.up();
    await K.steps(2);
    return { sim: +sim.toFixed(3), wall: +wall.toFixed(3), seen };
  };
  /** A point on the water to press (the canvas, clear of the HUD's buttons). */
  K.waterPoint = () => g(() => {
    const W = innerWidth, H = innerHeight;
    for (const [fx, fy] of [[0.5, 0.42], [0.5, 0.52], [0.38, 0.45], [0.62, 0.45], [0.5, 0.33]]) {
      const x = W * fx, y = H * fy, el = document.elementFromPoint(x, y);
      if (el && !el.closest('button, a, [data-loop], .gw-modal-layer > *, .gw-pill')) return { x, y, el: el.tagName };
    }
    return { x: W * 0.5, y: H * 0.42, el: null };
  });
  /** The catch card: Keep's figure, the buttons, and what loop.priceOf says of the fish it shows. */
  K.card = () => g(() => {
    const T = window.__lp, c = window.__gw, m = T.one('[data-modal=catch]');
    const keep = m?.querySelector('[data-action=keep]'), em = keep?.querySelector('em[data-to]');
    let price = null;
    try { price = T.landed ? c.progression.loop.priceOf(T.landed) : null; } catch { price = null; }
    return { open: !!m, keep: keep ? { to: em ? Number(em.dataset.to) : null, disabled: !!keep.disabled } : null, letgo: !!m?.querySelector('[data-action=letgo]'),
      buttons: m ? [...m.querySelectorAll('.gw-pf button, footer button')].filter(T.visible).map(T.say) : [], price,
      fish: T.landed ? { uid: T.landed.uid ?? null, speciesId: T.landed.speciesId ?? T.landed.id ?? null, z: T.landed.z ?? null } : null };
  });
  /** Keep the open card by a real tap on Keep; → the fish's uid and its figure. */
  K.keepCard = async (what, { shot = false, scan = false, dwell = 1.5 } = {}) => {
    const ok = await K.until("c.debug.ui().openModal === 'catch'", 8);
    K.need(ok.ok, `${what}: the catch card opens`, ok);
    await K.settle(250);
    if (dwell > 0) await K.secs(dwell);   // (gw-show's count-up starts after the stamp press: t0 + 1100 ms)
    const cd = await K.card();
    K.check(cd.keep && cd.keep.to !== null && cd.keep.to === cd.price, `${what}: Keep's em[data-to] is loop.priceOf(fish)`, cd);
    K.check(cd.keep && !cd.keep.disabled && cd.letgo, `${what}: the card offers Keep and Let go`, cd.buttons);
    if (scan) await K.scan('the card');
    if (shot) await K.shoot('card');
    await K.tap('[data-modal=catch] [data-action=keep]');
    const closed = await K.until("c.debug.ui().openModal !== 'catch'", 3);
    K.check(closed.ok, `${what}: Keep closes the card`);
    await K.secs(0.4);
    return cd;
  };
  /** A fish caught through the real path (a real press to cast, the bite forced, the strike, the play hurried to its end). */
  K.realCatch = async (speciesId, z, { what, onBite = null, outcome = 'land', natural = false } = {}) => {
    const pt = await K.waterPoint();
    const pr = await K.pressHold(pt.x, pt.y, 0.5, 'c.fishing.state');
    const cast = await K.until("c.fishing.state === 'waiting' || c.fishing.state === 'bite'", 8);
    if (!cast.ok) K.note(`${what}: the real press did not cast (${JSON.stringify(pr.seen.slice(-3))}); forceBite casts instead`);
    await g(([sp, z, o, nat]) => {
      const d = window.__gw.debug;
      d.fishOutcome?.(o);
      if (nat) d.forceBite?.({ natural: true });
      else d.forceBite?.({ speciesId: sp, z, wait: 0.2 });
    }, [speciesId, z, outcome, natural]);
    const bit = await K.until("c.fishing.state === 'bite'", natural ? 60 : 4);
    K.need(bit.ok, `${what}: a bite`, bit);
    if (onBite) await onBite();
    await g(() => window.__gw.debug.fishStrike?.('struck'));
    const reel = await K.until("c.fishing.state === 'reeling' || c.fishing.state === 'landing'", 3);
    K.need(reel.ok, `${what}: the strike hooks it`, reel);
    await K.steps(3);
    await g(() => window.__gw.debug.fishPlayTo?.(0.97));
    return bit;
  };
  /** Wait out a show into its card (Space hurries it, as a player may). */
  K.toCard = async (what, { hurry = true, dwell = 1.5 } = {}) => {
    const sh = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 25);
    K.need(sh.ok, `${what}: the play reaches its show`, sh);
    if (hurry && (await K.state()).inShow) await K.key('Space');
    return K.keepCard(what, { dwell });
  };
  return K;
}

// ================================================================== the scenario
export default async function (api) {
  const { page, wait, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const wick = typeof args.wick === 'string' ? args.wick : 'taper';
  const K = makeKit(api, { label: wick });
  const only = typeof args.only === 'string' ? new Set(args.only.split(',')) : null;
  const want = (p) => !only || only.has(p);
  const seed = Number.isFinite(Number(args.seed)) ? Number(args.seed) : 7;
  const seen = {};   // each Wick's "seen" event (PLAN §0's D row), printed at the end
  let mainRan = false;

  // ---------------------------------------------------------------- shared readers
  const data = () => g(() => {
    const d = window.__gw.data;
    return { loop: d.LOOP_ENABLED === true, phase: d.V3_PHASE, LOOP: { wicks: d.LOOP?.wicks, hold: d.LOOP?.hold, tutorial: d.LOOP?.tutorial }, T: d.TEXT_LOOP,
      names: Object.fromEntries((d.CHARACTERS || []).map((c) => [c.id, c.name])), tips: d.FIRST_EVENING?.tips || {},
      rarity: Object.fromEntries((d.SPECIES || []).map((s) => [s.id, s.rarity])), cer: d.AUTOFISH?.time?.ceremony || {} };
  });
  const top = async () => (await K.state()).modal;
  const tipText = (D, id) => { const t = D.tips?.[id]; return typeof t === 'string' ? t : t ? (K.phone ? t.touch : t.desktop) : null; };
  const near = (a, b) => (a && b ? Math.hypot(a[0] - b.x, a[1] - b.z) : Infinity);
  /** The Jetty: its tiles and their cue / dim, its words. */
  const jetty = () => g(() => {
    const T = window.__lp, root = T.one('[data-loop=jetty]');
    const tile = (id) => { const e = T.one(`[data-loop=jetty] [data-tile=${id}]`) || T.one(`[data-tile=${id}]`); return e ? { cue: e.classList.contains('gw-cue'), dim: e.classList.contains('gw-dim') } : null; };
    return { root: !!root, text: root ? root.textContent.replace(/\s+/g, ' ').trim() : '', tiles: { murk: tile('murk'), chart: tile('chart'), journal: tile('journal') },
      cues: document.querySelectorAll('.gw-cue').length, glyph: T.box('button[data-loop=homepause]') };
  });
  /** The Chart: the Mossmere's row, its slot cells, Sail and the words. */
  const chart = () => g(() => {
    const T = window.__lp, root = T.one('[data-loop=chart]');
    const sail = T.one('[data-loop=chart] [data-action=sail]') || T.one('[data-action=sail]');
    return { root: !!root, water: !!T.one('[data-loop=chart] [data-water=mossmere]'), cells: root ? root.querySelectorAll('.gw-slot').length : 0,
      filled: root ? root.querySelectorAll('.gw-slot[data-filled]').length : 0, sail: sail ? { cue: sail.classList.contains('gw-cue'), disabled: !!sail.disabled } : null,
      text: root ? root.textContent.replace(/\s+/g, ' ').trim() : '' };
  });
  /** The water's HUD: the hold row, the Home pill. */
  const hud = () => g(() => {
    const T = window.__lp, row = T.one('.gw-hold'), pill = document.querySelector('[data-loop=home]');
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
    const tr = [...document.querySelectorAll('.gw-tr *')].filter((e) => T.visible(e) && !e.children.length).map(r);
    return { cells: row ? row.querySelectorAll('.gw-slot').length : 0, filled: row ? row.querySelectorAll('.gw-slot[data-filled]').length : 0, row: r(row), right: tr,
      pill: pill ? { shown: T.visible(pill), pulse: pill.classList.contains('gw-pulse') && pill.classList.contains('gw-home'), box: T.box('[data-loop=home]') } : null,
      vw: innerWidth };
  });
  const { card, keepCard, realCatch, toCard } = K;

  // ================================================================ MAIN
  if (want('main')) {
    try {
      mainRan = true;
      K.step('main: the fresh title');
      await K.load({ fresh: true });
      const D = await data();
      K.need(D.loop, 'a loop build: data.LOOP_ENABLED at ?loop=1', D.phase);
      K.need((D.LOOP.wicks?.order || []).includes(wick), `--wick=${wick} names a Wick of LOOP.wicks.order`, D.LOOP.wicks?.order);
      const TL = D.T, E = expectFor(D.LOOP, TL, wick), order = D.LOOP.wicks.order;
      log('expect', JSON.stringify(E));
      await g(() => { window.__gw.debug.intro?.('auto', true); window.__gw.ui.showTitle(); });
      await K.titleReady();
      await K.release();
      await page.waitForFunction(() => window.__gw.intro?.stage?.ready === true, null, { timeout: 40000, polling: 250 }).catch(() => K.note('the film\'s stage was not prebuilt in 40 s'));
      await K.hold();
      let s = await K.state();
      K.check(await g(() => window.__gw.game.loopFresh?.() === true), 'T62: game.loopFresh() on a fresh loop save');
      let words = await K.titleWords();
      K.check(JSON.stringify(words) === JSON.stringify([TL.newDescent, TL.settings.label]), 'T62: the fresh title says New Descent, then Settings, and nothing else', words);
      K.check(!(await g(() => { const t = window.__lp.one('[data-modal=title] .gw-tagline'); return !!t && !!t.textContent.trim(); })), 'T62: no tagline under the logotype');
      await K.scan('the fresh title', { newDescentOk: true });
      await K.shoot('title');

      // ---------------------------------------------------------- the New Descent panel (T59)
      K.step('main: New Descent');
      K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.newDescent), 'the title\'s New Descent');
      await K.settle();
      await K.steps(3);
      const panel = () => g(([phone]) => {
        const T = window.__lp, m = T.one('[data-modal=newdescent]');
        const cards = m ? [...m.querySelectorAll('button.gw-char[data-wick]')] : [];
        const fit = (b) => { const name = [...b.querySelectorAll('*')].reverse().find((e) => e.children.length === 0 && e.textContent.trim()); return name ? name.scrollWidth <= name.clientWidth + 1 : true; };
        const tr = m?.querySelector('.gw-loop-trait');
        const trs = tr ? getComputedStyle(tr) : null, lh = trs ? (parseFloat(trs.lineHeight) || parseFloat(trs.fontSize) * 1.25) : 0;
        return {
          top: window.__gw.debug.ui().openModal, ids: cards.map((b) => b.dataset.wick), enabled: cards.every((b) => !b.disabled), on: cards.filter((b) => b.classList.contains('gw-on')).map((b) => b.dataset.wick),
          boxes: cards.map((b) => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), t: Math.round(r.top), l: Math.round(r.left) }; }), fit: cards.map(fit),
          trait: tr ? tr.textContent.replace(/\s+/g, ' ').trim() : null, traitRows: tr && lh ? Math.round(tr.getBoundingClientRect().height / lh) : null,
          forbidden: m ? ['.gw-locked', '.gw-mode', '.gw-ways', '.gw-cd-row', '.gw-chips', '.gw-rating', '.gw-lore'].filter((q) => m.querySelector(q)) : [],
          x: !!m?.querySelector('.gw-x'), phone,
        };
      }, [K.phone]);
      let nd = await panel();
      K.need(nd.top === 'newdescent', 'T59: New Descent opens its panel (modal newdescent)', nd.top);
      K.check(JSON.stringify(nd.ids) === JSON.stringify(order) && nd.enabled, 'T59: five button.gw-char[data-wick] in LOOP.wicks order, all enabled', nd.ids);
      K.check(nd.forbidden.length === 0, 'T59: no locks, modes, waystones, night cards, chips, rating or lore', nd.forbidden);
      K.check(!nd.x, 'T59: the panel has no ✕ (close: false)');
      const panelWords = (await K.scanRaw({ roots: ['#ui > .gw-modal-layer [data-modal=newdescent]'], newDescentOk: true })).texts;
      const wantWords = [...order.map((id) => D.names[id]), TL.wicks[nd.on[0] || 'wick'], TL.back, TL.start];
      K.check(panelWords.length === wantWords.length && wantWords.every((w) => panelWords.includes(w)), 'T59: the words are the five names, the lit Wick\'s one line, Back and Start', { panelWords, wantWords });
      if (K.phone) {
        const rows = [...new Set(nd.boxes.map((b) => b.t))].sort((a, b) => a - b);
        const first = nd.boxes.filter((b) => b.t === rows[0]).length, second = nd.boxes.filter((b) => b.t === rows[1]).length;
        K.check(rows.length === 2 && first === 3 && second === 2, 'T59: on a phone the cards are a 3 + 2 grid', nd.boxes);
        K.check(nd.boxes.every((b) => Math.abs(b.w - 104) <= 2), 'T59: each card 104 px wide on a phone', nd.boxes.map((b) => b.w));
        K.check(nd.fit.every(Boolean), 'T59: no Wick\'s name is truncated (scrollWidth ≤ clientWidth)', nd.fit);
      }
      await K.shoot('newdescent');
      // ← → move the lit Wick (from the Wick, ArrowRight lights Taper), 1–5 pick; each line one line high (WICKS §5: the phone)
      K.check(nd.on.length === 1, 'T59: one Wick lit', nd.on);
      await K.key('ArrowRight');
      nd = await panel();
      const next = order[(order.indexOf('wick') + 1) % order.length];
      K.check(nd.on[0] === next && nd.trait === TL.wicks[next], `T59: ArrowRight lights ${next}, its one line`, { on: nd.on, trait: nd.trait });
      for (let i = 0; i < order.length; i++) {
        await K.key(`Digit${i + 1}`);
        nd = await panel();
        K.check(nd.on[0] === order[i] && nd.trait === TL.wicks[order[i]], `T59: Digit${i + 1} lights ${order[i]} and its line`, { on: nd.on, trait: nd.trait });
        K.check(nd.traitRows === 1, `WICKS §5: ${order[i]}'s line is one line high`, nd.traitRows);
        if (K.phone) await K.shoot(`lit-${order[i]}`);
      }
      await K.tap(`[data-modal=newdescent] button.gw-char[data-wick=${wick}]`);
      nd = await panel();
      K.check(nd.on[0] === wick && nd.trait === TL.wicks[wick], `the tap lights ${wick}`, nd.on);

      // ---------------------------------------------------------- Start → the film at once (T63, T60, T71)
      K.step('main: Start');
      const st = await g(() => {
        const c = window.__gw, T = window.__lp;
        T.ev.length = 0; T.sim = 0;
        const b = T.one('[data-modal=newdescent] [data-action=start]');
        if (!b) return null;
        b.click();
        return { flow: c.flow, wick: c.debug.loop?.wick?.() ?? null, active: c.intro?.isActive?.() ?? null };
      });
      K.need(st, 'T59: Start ([data-action=start]) on the panel');
      K.check(st.flow === 'intro', 'T63: Start → flow intro in the same task (no extra screen, no loading screen)', st);
      K.check(st.wick === wick, 'T60: Start writes the chosen Wick (debug.loop.wick())', st);
      await g(() => window.__lp.runTo(0.1));
      const held = await g(() => ({ nd: !!document.querySelector('[data-modal=newdescent]'), cards: document.querySelectorAll('[data-modal=newdescent] button.gw-char[data-wick]').length,
        title: !!document.querySelector('[data-modal=title]') }));
      K.check(held.nd && held.cards === 5 && held.title, 'T71: 0.1 s after Start the panel and the title still stand under the ink', held);
      await K.shoot('start-ink');
      // the film's close takes on the chosen Wick (the stager's step 4b), then Skip in the home beat
      await g(() => window.__lp.runTo(13.4));
      await K.shoot('film-wick');
      await g(() => window.__lp.runTo(15.6));
      await K.shoot('film-home');
      const sk = await g(() => { const c = window.__gw; return { r: c.game.skipIntro?.() === true, flow: c.flow }; });
      K.check(sk.r, 'the film is skipped (game.skipIntro) in its home beat', sk);
      await g(() => window.__lp.runOut());
      let w = await K.until("c.flow === 'home'", 4);
      K.need(w.ok, 'T64: intro:done → flow home', await K.state());

      // ---------------------------------------------------------- the hand-off glide to the Jetty (T64, T56)
      K.step('main: the glide to the Jetty');
      let ev = await K.events();
      const done = ev.find((e) => e.e === 'intro:done');
      K.check(done && done.mode === 'sail', 'T56/T64: the camera is the sail framing at intro:done', done?.mode);
      const gs = ev.find((e) => e.e === 'player:glide' && e.p?.state === 'start' && e.p?.kind === 'home');
      K.check(gs && gs.flow === 'home', 'T64: player:glide {kind: home} starts in flow home', gs ? { flow: gs.flow } : null);
      const sv = gs?.save?.meta;
      K.check(sv?.intro?.seen === true && sv?.loop?.wick === wick && sv?.loop?.tutorial?.done === false, 'T64: the save written at its start holds meta.intro.seen, the Wick and the tutorial', { intro: sv?.intro, wick: sv?.loop?.wick, tutorial: sv?.loop?.tutorial });
      await K.secs(1.4);
      s = await K.state();
      K.check(s.mode === 'sail', 'T56: the camera holds sail through the glide', s.mode);
      await K.shoot('arrive-glide');
      w = await K.until("window.__lp.ev.some((e) => e.e === 'home:enter')", 4);
      K.check(w.ok, 'T64: home:enter after the 3 s glide', w);
      ev = await K.events();
      const he = ev.find((e) => e.e === 'home:enter'), ge = ev.find((e) => e.e === 'player:glide' && e.p?.state === 'end' && e.p?.kind === 'home');
      K.check(he?.p?.from === 'intro', 'T64: home:enter {from: intro}', he?.p);
      K.check(ge && he && ge.sim <= he.sim + 1e-6 && he.sim - (gs?.sim ?? 0) <= (D.LOOP.tutorial?.arrive ?? 3) + 0.2, 'T64: the glide ends at the dock in about 3 s, then home:enter', { start: gs?.sim, end: ge?.sim, enter: he?.sim });
      const docks = await g(() => window.__lp.docks());
      s = await K.state();
      K.check(near(s.pos, docks[0]) <= 0.6, 'T44/T64: the raft at the first dock', { pos: s.pos, dock: docks[0] });
      K.check(he?.mode === 'sail' && s.mode === 'sail', 'T56: the camera is still sail at the Jetty', { enter: he?.mode, now: s.mode });
      const mood = await g(() => { try { return window.__gw.debug.audio?.()?.mood ?? null; } catch { return null; } });
      K.check(mood === null || mood === 'hub', 'T56: the audio mood at home is hub', mood);

      // ---------------------------------------------------------- the tutorial at the wake (T44, T65)
      K.step('main: the wake');
      w = await K.until("c.debug.ui().openModal === 'jetty'", 3);
      K.need(w.ok, 'T44: the Jetty opens on home:enter (modal jetty)', await K.state());
      await K.settle();
      const checkWake = async (what) => {
        const j = await jetty(), st2 = await K.state();
        K.check(j.root, `${what}: [data-loop=jetty] is on screen`);
        K.check(j.text.includes(TL.murk.wake), `${what}: Murk's wake line at the Jetty`, j.text.slice(0, 160));
        K.check(j.tiles.chart?.cue === true && j.tiles.murk?.dim === true && j.tiles.journal?.dim === true && j.tiles.chart?.dim !== true, `${what}: the Chart tile .gw-cue, Murk and the Journal .gw-dim`, j.tiles);
        K.check(!j.text.includes(TL.next.split('{')[0].trim()), `${what}: no goal line during the tutorial`);
        K.check(st2.tut?.step === 'wake', `${what}: the tutorial is at the wake`, st2.tut);
        return j;
      };
      await checkWake('T44');
      await K.scan('the Jetty (the wake)');
      await K.shoot('jetty-wake');
      await K.noErrors('the wake');

      // ---------------------------------------------------------- a reload in the wake (T67)
      K.step('main: a reload in the wake');
      await K.reload();
      words = await K.titleWords();
      K.check(words.includes(TL.continue) && words.includes(TL.settings.label) && !words.includes(TL.newDescent), 'T67/T62: after a reload the title says Continue · Settings, no New Descent', words);
      await K.scan('the returning title');
      let e0 = await K.evCount();
      K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
      w = await K.until("c.debug.ui().openModal === 'jetty'", 4);
      K.need(w.ok, 'T67: Continue → the Jetty', await K.state());
      await K.settle();
      ev = await K.events(e0);
      K.check(!ev.some((e) => e.e === 'player:glide' && e.p?.kind === 'home' && e.p?.state === 'start'), 'T67: Continue at home: the Jetty with no glide');
      K.check(ev.some((e) => e.e === 'home:enter' && e.p?.from === 'title'), 'home:enter {from: title}', ev.filter((e) => e.e === 'home:enter').map((e) => e.p));
      await checkWake('T67');

      // ---------------------------------------------------------- the home pause and Settings (T73, T74, T57)
      K.step('main: the home pause');
      const openHomePause = async () => {
        const j = await jetty();
        K.check(!!j.glyph && j.glyph.w >= 44 && j.glyph.h >= 44 && j.glyph.l < api.width / 2 && j.glyph.t < 160 && !j.glyph.text, 'T73: the Jetty\'s quiet pause glyph (button[data-loop=homepause], no word, ≥ 44 px, top-left)', j.glyph);
        if (K.phone) await K.tap('button[data-loop=homepause]');
        else await K.key('Escape');
        await K.settle();
        return K.until("c.debug.ui().openModal === 'homepause'", 1);
      };
      const t0 = (await K.state()).tut;
      w = await openHomePause();
      K.check(w.ok, `T73: ${K.phone ? 'the pause glyph' : 'Escape'} on the Jetty opens the home pause`, await top());
      const hpWords = await g(() => window.__lp.buttons('[data-modal=homepause]'));
      K.check(hpWords.length === 2 && hpWords[0] === TL.resume && hpWords[1] === TL.settings.label, 'T73: the home pause is exactly Resume · Settings', hpWords);
      await K.scan('the home pause');
      await K.shoot('homepause');
      await K.secs(4);
      let t1 = (await K.state()).tut;
      K.check(t1?.step === 'wake' && (typeof t0?.t !== 'number' || t1?.t === t0.t), 'T73: the tutorial\'s clock waits under the home pause', { before: t0, after: t1 });
      K.check(!(await K.state()).stack.includes('chart'), 'T73: the Chart did not open itself under the home pause');
      K.need(await K.tap('[data-modal=homepause] button', TL.settings.label), 'the home pause\'s Settings');
      await K.settle();
      w = await K.until("c.debug.ui().openModal === 'settings'", 1);
      K.check(w.ok, 'T73: Settings opens over the home pause');
      const setText = await g(() => window.__lp.text('[data-modal=settings]') || '');
      K.check(!setText.includes('Damage numbers') && !setText.includes('Softer flares and hit flashes'), 'T74: no Damage numbers row, no "Softer flares" line under the loop');
      K.check(setText.includes(TL.settings.ringFirst), `T74: the strike ring's first option reads "${TL.settings.ringFirst}"`);
      K.check(setText.includes(TL.settings.hurry), 'T74: the hurry row\'s line is TEXT_LOOP.settings.hurry');
      K.check(setText.includes(TL.forget.row), 'T74: the Forget row\'s line is TEXT_LOOP.forget.row');
      await K.shoot('settings');
      await K.secs(2);
      t1 = (await K.state()).tut;
      K.check(typeof t0?.t !== 'number' || t1?.t === t0.t, 'T73: the tutorial\'s clock waits under Settings', t1);
      await K.tap('[data-modal=settings] button', 'Done');
      await K.settle();
      K.check((await top()) === 'homepause', 'T73: Done returns to the home pause', await top());
      await K.tap('[data-modal=homepause] button', TL.resume);
      await K.settle();
      K.check((await top()) === 'jetty' && (await K.state()).tut?.step === 'wake', 'T57/T73: Resume returns to the Jetty as it was', await K.state().then((x) => ({ modal: x.modal, tut: x.tut })));

      // ---------------------------------------------------------- the Chart (T44, T65)
      K.step('main: the Chart');
      const openChart = async () => {
        K.need(await K.tap('[data-loop=jetty] [data-tile=chart]'), 'the Jetty\'s Chart tile');
        await K.settle();
        const r = await K.until("c.debug.ui().openModal === 'chart'", 2);
        K.need(r.ok, 'the Chart tile opens the Chart (modal chart)', await top());
        await K.secs(1.4);   // (the slot cells ink in 0.25 s apart)
        return chart();
      };
      const checkChart = (ch, what, { line = true, slots = E.slots0 } = {}) => {
        K.check(ch.root && ch.water, `${what}: [data-loop=chart] with the Mossmere's row ([data-water=mossmere])`, ch);
        K.check(ch.cells === slots && ch.filled === 0, `${what}: ${slots} empty .gw-slot cells (loop.hold().slots)`, { cells: ch.cells, filled: ch.filled });
        if (line) K.check(ch.text.includes(E.firstChart), `${what}: Murk's departure line "${E.firstChart}"`, ch.text.slice(0, 200));
        else K.check(!ch.text.includes(E.firstChart) && !ch.text.includes(TL.murk.firstChart), `${what}: no departure line once it has been said`);
        K.check(ch.sail && !ch.sail.disabled, `${what}: Sail ([data-action=sail]) is live`, ch.sail);
      };
      let ch = await openChart();
      checkChart(ch, 'T44/T65');
      K.check(ch.sail?.cue === true, 'T65: Sail .gw-cue during the tutorial', ch.sail);
      s = await K.state();
      K.check(s.tut?.step === 'chart' && s.hold?.slots === E.slots0, 'the tutorial at the chart beat; loop.hold().slots', { tut: s.tut, hold: s.hold });
      if (wick === 'tallow') seen.tallowChart = ch.cells === 4 && ch.text.includes(TL.murk.firstChartBy?.tallow ?? '\u0000');
      await K.scan('the Chart');
      await K.shoot('chart');

      // ---------------------------------------------------------- a reload in the chart beat (T67)
      K.step('main: a reload in the chart beat');
      await K.reload();
      K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
      w = await K.until("c.debug.ui().openModal === 'jetty'", 4);
      K.need(w.ok, 'T67: Continue → the Jetty', await top());
      await K.settle();
      await checkWake('T67 (chart beat)');
      ch = await openChart();
      checkChart(ch, 'T67: the Chart again after a reload');

      // ---------------------------------------------------------- Escape on the Chart: it never opens itself again (T65, T57)
      K.step('main: Escape on the Chart');
      await K.key('Escape');
      await K.settle();
      let j = await jetty();
      K.check((await top()) === 'jetty' && j.tiles.chart?.cue === true, 'T57/T65: Escape on the Chart → the Jetty, the Chart tile cued', { top: await top(), tiles: j.tiles });
      await K.secs(10);
      s = await K.state();
      K.check(s.modal === 'jetty' && !s.stack.includes('chart'), 'T65: after Escape the Chart does not open itself again (10 s)', { modal: s.modal, stack: s.stack, tut: s.tut });

      // ---------------------------------------------------------- Sail and the glide out (T66, T36)
      K.step('main: Sail');
      ch = await openChart();
      checkChart(ch, 'the Chart before the first Sail');
      const plan = await g(() => { const c = window.__gw, d = c.world.getDocks?.()[0]; return d ? c.data.sailPlan({ x: d.position.x, z: d.position.z }, { x: 0, z: 0 }, c.data.LOOP.tutorial, 'mossmere') : null; });
      const pos0 = (await K.state()).pos;
      e0 = await K.evCount();
      K.need(await K.tap('[data-loop=chart] [data-action=sail]', null, { settle: 0 }), 'the Chart\'s Sail');
      s = await K.state();
      K.check(s.stack.length === 0, 'T36: after Sail debug.ui().stack is empty', s.stack);
      K.check(s.flow === 'home', 'T66: the glide out runs in flow home', s.flow);
      const stored = await g(() => window.__lp.stored());
      K.check(stored?.meta?.loop?.tutorial?.done === true, 'T66: loop.tutorialDone() is saved at the first Sail, before anything moves', stored?.meta?.loop?.tutorial);
      await K.secs(1.2);
      await K.shoot('glide-out');
      w = await K.until("c.flow === 'playing'", 6);
      K.need(w.ok, 'T66: the glide out ends in the trip (flow playing)', await K.state());
      await K.steps(2);
      ev = await K.events(e0);
      const so = ev.find((e) => e.e === 'player:glide' && e.p?.kind === 'sailOut' && e.p?.state === 'start'), soEnd = ev.find((e) => e.e === 'player:glide' && e.p?.kind === 'sailOut' && e.p?.state === 'end');
      const rs = ev.find((e) => e.e === 'run:start');
      K.check(so && so.flow === 'home', 'T66: player:glide {kind: sailOut} in flow home', so ? { flow: so.flow } : null);
      K.check(soEnd && rs && soEnd.sim <= rs.sim + 1e-6, 'T66: run:start only after the glide out ends', { end: soEnd?.sim, start: rs?.sim });
      K.check(so && pos0 && Math.hypot(so.raft[0] - pos0[0], so.raft[1] - pos0[1]) <= 0.5, 'T66: the glide out starts within 0.5 m of the raft', { raft: pos0, glide: so?.raft });
      K.check(ev.some((e) => e.e === 'zone:change' && e.p?.sail === true && e.p?.prev === null), 'zone:change {prev: null, sail: true}');
      s = await K.state();
      K.check(s.run?.outing === 'trip' && s.run?.character === wick && s.run?.evening === 1, `T60/T66: a trip as ${wick}, evening 1`, s.run);
      K.check(plan && near(s.pos, plan.to) <= 0.5, 'T66: after run:start the raft is at the glide\'s end (no respawn jump)', { pos: s.pos, to: plan?.to });

      // ---------------------------------------------------------- the first trip (T68, T50, T3, the HUD)
      K.step('main: the first trip');
      const castTip = tipText(D, 'fe_cast'), strikeTip = tipText(D, 'fe_strike');
      await K.secs(0.8);
      K.check(!(await g((t) => window.__lp.seen(t), castTip)), 'T68: fe_cast waits 1.5 s after run:start');
      await K.secs(1.4);
      K.check(await g((t) => window.__lp.seen(t), castTip), 'T68: fe_cast shows on evening 1 while idle', castTip);
      let h = await hud();
      K.check(h.cells === E.slots0 && h.filled === 0, `the HUD's hold row: ${E.slots0} empty cells (.gw-hold .gw-slot)`, h);
      K.check(h.pill && h.pill.shown, 'the Home pill ([data-loop=home]) on the water', h.pill);
      await K.scan('the water\'s HUD');
      await K.shoot('water');
      K.check((await K.state()).enemies === 0, 'T26: no enemy on a trip');
      const catches = catchPlan(E.slots0);
      const stamped = {};
      for (let i = 0; i < catches.length; i++) {
        const { speciesId, z, via } = catches[i], what = `fish ${i + 1} of ${E.slots0} (${speciesId}, ${via})`;
        let cd;
        if (via === 'instant') {
          const ok = await g(([sp, z]) => window.__gw.debug.instantCatch?.(sp, { z }) === true, [speciesId, z]);
          K.need(ok, `${what}: debug.instantCatch`);
          cd = await keepCard(what, { shot: i === 0, scan: i === 0 });
        } else {
          await realCatch(speciesId, z, {
            what,
            onBite: async () => {
              const bites = (await K.events()).filter((e) => e.e === 'fishing:bite');
              K.check(bites.length === 1 && typeof bites[0].p?.waterKey === 'string', 'T8: the first real bite of the evening carries its waterKey', bites.map((b) => b.p));
              K.check(await g((t) => window.__lp.seen(t), strikeTip), 'T68: fe_strike in the first bite\'s window', strikeTip);
              K.check(!(await g((t) => window.__lp.seen(t), castTip)), 'T68: fe_cast is gone once the line is cast');
              await K.shoot('first-bite');
            },
          });
          K.check(!(await g((t) => window.__lp.seen(t), strikeTip)), 'T68: fe_strike is gone at the strike');
          cd = await toCard(what);
        }
        if (cd?.fish?.uid) stamped[cd.fish.uid] = cd.keep?.to;
        s = await K.state();
        h = await hud();
        K.check(s.hold?.n === i + 1 && h.filled === i + 1, `${what}: the hold and the HUD hold ${i + 1}`, { hold: s.hold, filled: h.filled });
        if (i === 0) {
          // T50 at 1 of N: a 0.3 s press on the pill does nothing, and never starts a cast charge
          const pb = await K.box('[data-loop=home]');
          K.need(pb, 'the Home pill is shown in idle (canGoHome ok)');
          const pr = await K.pressHold(pb.x, pb.y, 0.3, 'c.fishing.state');
          s = await K.state();
          if (pr.wall > 0.55) K.note('the 0.3 s press took longer on the wall clock; the check is on the game clock', pr.wall);
          K.check(s.flow === 'playing' && s.modal !== 'tally' && !(await K.events()).some((e) => e.e === 'run:end'), `T50: a 0.3 s press on the pill at 1 of ${E.slots0} does nothing`, { flow: s.flow, modal: s.modal });
          K.check(pr.seen.every((x) => x === 'idle') && s.fishing === 'idle', 'T50: a press on the pill never starts a cast charge (fishing stays idle)', pr.seen);
        }
      }
      s = await K.state();
      K.check(s.hold?.full === true && s.hold?.n === E.slots0, `P5: the hold is full at ${E.slots0}`, s.hold);
      if (wick === 'tallow') seen.tallowFour = s.hold?.n === 4;

      // the next cast is refused: "Hold's full.", the pill pulses, fishing stays idle (T3, D side)
      K.step('main: a full hold');
      e0 = await K.evCount();
      const wp = await K.waterPoint();
      const ref = await K.pressHold(wp.x, wp.y, 0.45, 'c.fishing.state');
      await K.steps(3);
      ev = await K.events(e0);
      K.check(ref.seen.every((x) => x === 'idle') && (await K.state()).fishing === 'idle', 'T3: a press with a full hold never enters charging', ref.seen);
      K.check(await g((t) => window.__lp.seen(t), TL.holdFull), `the "${TL.holdFull}" toast on the refused cast`);
      K.check((await hud()).pill?.pulse === true, 'the Home pill pulses (.gw-home.gw-pulse)');
      K.check(ev.filter((e) => e.e === 'loop:holdFull' && e.p?.via === 'cast').length === 1, 'loop:holdFull {via: cast} fires once', ev.filter((e) => e.e === 'loop:holdFull').map((e) => e.p));
      if (wick === 'tallow') seen.tallowRefused = seen.tallowFour === true;
      await K.scan('the water (a full hold)');
      await K.shoot('hold-full');

      // ---------------------------------------------------------- Home from near docks[2] (T50, T66, T21)
      K.step('main: Home');
      const far = docks[2] || docks[docks.length - 1];
      await g((p) => window.__gw.player.teleport({ x: p.x, z: p.z }, p.yaw), far);
      await K.steps(3);
      const purse0 = (await K.state()).loop?.clams ?? null;
      e0 = await K.evCount();
      K.need(await K.tap('[data-loop=home]'), 'T50: a tap on the Home pill with a full hold');
      w = await K.until("c.debug.ui().openModal === 'tally'", 6);
      K.need(w.ok, 'T50/T21: the tap opens the tally (after the sail home)', await K.state());
      ev = await K.events(e0);
      s = await K.state();
      K.check(ev.some((e) => e.e === 'run:end' && e.p?.cause === 'home'), 'run:end {cause: home}');
      K.check(ev.some((e) => e.e === 'player:glide' && e.p?.kind === 'home'), 'the sail home glides (player:glide {kind: home})');
      K.check(near(s.pos, docks[0]) <= 0.6, 'T66: after the tally opens the raft is at docks[0] (home is the Jetty)', { pos: s.pos, dock: docks[0] });
      const lt = s.loop?.lastTrip;
      K.check(lt && Array.isArray(lt.lines) && lt.lines.length === E.slots0, `T21: the tally holds ${E.slots0} rows`, lt);
      K.check(purse0 !== null && s.loop.clams - purse0 === lt?.total, 'T21: the clams delta equals the tally\'s total (paid once, at endTrip)', { before: purse0, after: s.loop?.clams, total: lt?.total });
      K.check(lt?.total >= (D.LOOP.hold.ladder[0]?.price ?? 30), 'the first trip pays for Hold 4', lt?.total);
      const tf = tallyFaults(lt?.lines, lt?.total, stamped, wick);
      K.check(tf.length === 0, 'T21/WICKS §2.1: every row pays what its card said (the Wick: its base, then its first)', tf);
      if (wick === 'wick') {
        const firsts = (lt?.lines || []).filter((l) => l.first === true && l.clams > (l.base ?? l.clams));
        seen.wickFirstSale = firsts.length;
        K.check(firsts.length >= 1, 'the Wick\'s seen event: a first sells higher at the tally (a row with first and clams > base)', lt?.lines);
      }
      await K.secs(0.8);
      await K.shoot('tally');
      await K.key('Escape');
      await K.secs(0.3);
      s = await K.state();
      const soldBox = await K.box('[data-loop=tally] [data-action=sold]') || await K.box('[data-action=sold]');
      K.check(s.modal === 'tally' && !!soldBox, 'T57: Escape on the tally skips to its end and leaves Sold', { modal: s.modal, sold: !!soldBox });
      K.check(await g((t) => window.__lp.seen(t), `+${clamText(lt?.total ?? 0)}`), `the tally's total +${clamText(lt?.total ?? 0)} at its end`);
      await K.scan('the tally');
      await K.shoot('tally-end');
      await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
      w = await K.until("c.debug.ui().openModal === 'jetty'", 2);
      K.need(w.ok, 'Sold → the Jetty', await top());
      await K.settle();
      j = await jetty();
      s = await K.state();
      K.check(looseRe(E.goal0).test(j.text), `the goal line "${E.goal0}"`, j.text.slice(0, 200));
      K.check(j.text.includes(clamText(s.loop?.clams ?? -1)), 'the purse shows the clams (fmtClams)', { clams: s.loop?.clams });
      K.check(j.cues === 0, 'T67: with the tutorial done no .gw-cue anywhere', j.cues);
      K.check(j.text.includes(TL.murk.firstSale), 'Murk\'s firstSale line after the first Sold', j.text.slice(0, 200));
      await K.scan('the Jetty');
      await K.shoot('jetty-paid');
      // Escape on the Jetty → the home pause; Resume → the Jetty (T57)
      w = await openHomePause();
      K.check(w.ok, 'T57: the home pause again');
      await K.tap('[data-modal=homepause] button', TL.resume);
      await K.settle();
      K.check((await top()) === 'jetty', 'T57: Resume → the Jetty');

      // ---------------------------------------------------------- the shelf: Hold 4 (T23, PLAN CHOICE 26)
      K.step('main: the shelf');
      K.need(await K.tap('[data-loop=jetty] [data-tile=murk]'), 'the Jetty\'s Murk tile');
      await K.settle();
      w = await K.until("c.debug.ui().openModal === 'shelf'", 2);
      K.need(w.ok, 'the Murk tile opens the shelf (modal shelf)', await top());
      await K.secs(0.5);
      const b4 = await K.box('[data-loop=shelf] [data-buy="hold:4"]') || await K.box('[data-buy="hold:4"]');
      K.need(b4 && !b4.disabled, 'the shelf offers [data-buy="hold:4"]', b4);
      K.check(b4.text.includes(clamText(D.LOOP.hold.ladder[0].price)) || (await g(() => window.__lp.text('[data-loop=shelf]') || '')).includes(clamText(D.LOOP.hold.ladder[0].price)), 'Hold 4\'s price on its card', b4.text);
      await K.scan('the shelf');
      await K.shoot('shelf');
      e0 = await K.evCount();
      await K.tapXY(b4.x, b4.y);
      await K.steps(3);
      s = await K.state();
      K.check(s.loop?.holdSlots === 4, 'T23: the buy: holdSlots 4', s.loop?.holdSlots);
      K.check(s.loop?.clams === (lt?.total ?? 0) - D.LOOP.hold.ladder[0].price, 'the buy spends Hold 4\'s price', s.loop?.clams);
      K.check((await K.events(e0)).some((e) => e.e === 'loop:buy'), 'loop:buy');
      K.check((await g(() => window.__lp.text('[data-loop=shelf]') || '')).includes(TL.yours), `PLAN CHOICE 26: the bought card reads "${TL.yours}" until the shelf closes`);
      await K.shoot('shelf-bought');
      await K.key('Escape');
      await K.settle();
      K.check((await top()) === 'jetty', 'T57: Escape on the shelf → the Jetty', await top());
      s = await K.state();
      const gl = goalText(TL, D.LOOP.wicks, s.goal, wick);
      j = await jetty();
      K.check(!gl || looseRe(gl).test(j.text), `the next goal line "${gl}" (loop.goal())`, j.text.slice(0, 200));
      if (wick === 'tallow') K.check(s.hold?.slots === 5, 'WICKS §2.4: Tallow\'s hold after Hold 4 is five slots', s.hold);

      // ---------------------------------------------------------- the second Sail (T36, T66)
      K.step('main: the second Sail');
      ch = await openChart();
      checkChart(ch, 'the Chart after Hold 4', { line: false, slots: E.slots4 });
      const pos1 = (await K.state()).pos;
      e0 = await K.evCount();
      K.need(await K.tap('[data-loop=chart] [data-action=sail]', null, { settle: 0 }), 'Sail');
      s = await K.state();
      K.check(s.stack.length === 0, 'T36: after Sail debug.ui().stack is empty', s.stack);
      w = await K.until("c.flow === 'playing'", 6);
      K.need(w.ok, 'the second trip starts', await K.state());
      await K.steps(2);
      ev = await K.events(e0);
      const so2 = ev.find((e) => e.e === 'player:glide' && e.p?.kind === 'sailOut' && e.p?.state === 'start');
      K.check(so2 && pos1 && Math.hypot(so2.raft[0] - pos1[0], so2.raft[1] - pos1[1]) <= 0.5, 'T66: every Sail glides out, from within 0.5 m of the raft', { raft: pos1, glide: so2?.raft });
      s = await K.state();
      K.check(s.run?.evening === 2 && s.run?.character === wick, 'the second evening, as the same Wick', s.run);
      h = await hud();
      K.check(h.cells === E.slots4 && h.filled === 0, `${E.slots4} empty cells on the water`, h);
      await K.secs(2.4);
      K.check(!(await g((t) => window.__lp.seen(t), castTip)), 'T68: no fe_cast on evening 2');
      K.check(!(await K.events(e0)).some((e) => e.e === 'merchant:arrive' && e.flow === 'playing'), 'T29: no merchant:arrive on a trip');
      await K.shoot('water-2');

      // ---------------------------------------------------------- the Wick's own smoke step (PLAN §0's D row, WICKS §5)
      K.step(`main: ${wick}'s smoke step`);
      await g((n) => window.__gw.debug.fishSeed?.(n), seed);
      if (wick === 'taper') {
        // Taper: the first bite of the evening is never common where the pool allows; while it does not, the rule waits
        let served = null;
        for (let tries = 0; tries < 5 && !served; tries++) {
          const open0 = await g(() => window.__gw.progression?.loop?.taperFirstOpen?.() === true);
          K.check(tries > 0 || open0, 'Taper: the evening starts with the first-bite rule open (loop.taperFirstOpen())', open0);
          await realCatch(null, null, { what: `Taper's bite ${tries + 1}`, natural: true });
          const ls = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 25);
          K.need(ls.ok, 'Taper: the bite reaches its card', ls);
          const cw = await K.until("c.debug.ui().openModal === 'catch'", 25);
          K.need(cw.ok, 'Taper: the card');
          await K.settle(250);
          const cd = await card(), rar = D.rarity[cd.fish?.speciesId];
          const open1 = await g(() => window.__gw.progression?.loop?.taperFirstOpen?.() === true);
          if (!open1) served = { speciesId: cd.fish?.speciesId, rarity: rar };
          else K.note('the rule waited: this pool failed the sign rule, so the bite was a plain one', { speciesId: cd.fish?.speciesId, rarity: rar });
          if (served || tries === 4) { await K.secs(1.5); await K.shoot('taper-first-card'); await K.tap('[data-modal=catch] [data-action=keep]'); }
          else await K.tap('[data-modal=catch] [data-action=letgo]');
          await K.until("c.debug.ui().openModal !== 'catch'", 3);
          await K.secs(0.5);
        }
        seen.taperFirst = served;
        K.check(served && served.rarity !== 'common', 'Taper\'s seen event: the bite served under the rule is uncommon or rare', served);
      } else if (wick === 'stub') {
        // Stub: the same seeded cast waits ×0.78 of the Wick's (the Wick read first, so a pity rule can only make Stub look quicker)
        const waitOf = async (asId) => {
          await g(([id, n]) => { const c = window.__gw; c.state.run.character = id; c.debug.fishSeed?.(n); c.debug.forceBite?.({ natural: true }); }, [asId, seed]);
          const r = await K.until("c.fishing.state === 'waiting'", 4);
          const wd = await g(() => window.__gw.debug.fishing?.()?.waitDur ?? null);
          await g(() => { try { window.__gw.fishing.cancel('debug'); } catch { /* optional */ } });
          await K.until("c.fishing.state === 'idle'", 4);
          return r.ok ? wd : null;
        };
        const wWick = await waitOf('wick'), wStub = await waitOf('stub');
        await g(() => { window.__gw.state.run.character = 'stub'; });
        seen.stubWait = { stub: wStub, wick: wWick, ratio: wWick ? +(wStub / wWick).toFixed(3) : null };
        K.check(typeof wStub === 'number' && typeof wWick === 'number' && wStub <= wWick * 0.78 + 0.05, 'Stub\'s seen event: the same seeded cast waits at most ×0.78 of the Wick\'s', seen.stubWait);
        K.check((await K.state()).run?.character === 'stub', 'the run is Stub\'s again');
        await realCatch(null, null, { what: 'Stub\'s quick bite', natural: true });
        await toCard('Stub\'s quick bite');
      } else if (wick === 'ashwick') {
        // Ashwick: a hooked fish that gets away comes back, the next bite at that water, the same fish, with the ember glow
        const lostSp = 'mossback_perch', lostZ = 0.6;
        e0 = await K.evCount();
        await realCatch(lostSp, lostZ, { what: 'Ashwick: a fish that gets away', outcome: 'lose' });
        const lost = await K.until("window.__lp.ev.some((e) => e.e === 'fishing:escaped')", 25);
        K.need(lost.ok, 'Ashwick: the fish gets away (fishing:escaped)', await K.state());
        await K.until("window.__lp.ev.some((e) => e.e === 'fish:escaped') && c.fishing.state === 'idle'", 15);
        await K.until("!!c.progression?.loop?.comeback?.('open:mossmere')", 3);
        await K.secs(0.5);
        await K.shoot('ashwick-got-away');
        const cb = await g(() => { try { return window.__gw.progression.loop.comeback('open:mossmere') ?? null; } catch { return null; } });
        K.check(cb && (cb.speciesId === lostSp) && Math.abs(Number(cb.z) - lostZ) < 1e-6, 'Ashwick: loop.comeback(open:mossmere) holds the lost fish', cb);
        await g(() => { window.__lp.pulses.length = 0; window.__gw.debug.fishOutcome?.('land'); window.__gw.debug.forceBite?.({ natural: true }); });
        const cbBite = await K.until("c.fishing.state === 'bite'", 60);
        K.need(cbBite.ok, 'Ashwick: the comeback bites', cbBite);
        const evc = await K.events(e0);
        const bite = evc.filter((e) => e.e === 'fishing:bite').pop();
        const pulses = await g(() => window.__lp.pulses.slice());
        const linger = await g(() => { try { return window.__gw.debug.fishLinger?.() ?? null; } catch { return null; } });
        K.check(bite?.p?.comeback === true, 'Ashwick: fishing:bite {comeback: true}', bite?.p);
        K.check(pulses.some((p) => p.color === 0xd0643a), 'Ashwick: the ember fx.pulse when the float settled', pulses);
        K.check(linger === null, 'the comeback and the linger never on one cast (fishLinger() null)', linger);
        await K.shoot('ashwick-comeback');
        await g(() => window.__gw.debug.fishStrike?.('struck'));
        await K.until("c.fishing.state === 'reeling' || c.fishing.state === 'landing'", 3);
        await g(() => window.__gw.debug.fishPlayTo?.(0.97));
        const cd = await toCard('Ashwick: the comeback');
        seen.ashwickComeback = { bite: bite?.p?.comeback === true, ember: pulses.some((p) => p.color === 0xd0643a), speciesId: cd?.fish?.speciesId, z: cd?.fish?.z };
        K.check(cd?.fish?.speciesId === lostSp && Math.abs(Number(cd?.fish?.z) - lostZ) < 1e-6, 'Ashwick\'s seen event: the comeback is the same fish, the same z', seen.ashwickComeback);
        K.check(await g(() => { try { return !window.__gw.progression.loop.comeback('open:mossmere'); } catch { return true; } }), 'Ashwick: it comes back once (loop.comeback is spent)');
      } else {
        // the Wick and Tallow: their events are the first trip's (the first-sale ticks; four slots home); one fish for the rest
        const ok = await g(() => window.__gw.debug.instantCatch?.('dusk_minnow', { z: -0.4 }) === true);
        K.need(ok, 'debug.instantCatch');
        await keepCard('the second trip\'s fish');
      }
      s = await K.state();
      K.check(s.hold?.n === 1, 'the second trip holds one fish', s.hold);
      K.check((await g(() => { try { return window.__gw.debug.fishLinger?.() ?? null; } catch { return null; } })) === null, 'T9: fishLinger() is null (F16 dropped)');
      await K.noErrors('the smoke step');

      // ---------------------------------------------------------- the gate is scenery (T46, T43)
      K.step('main: the gate');
      const gate = await g(() => { const gi = window.__gw.world.getGate?.(); return gi?.position ? { x: gi.position.x, z: gi.position.z, r: gi.radius ?? 4.5 } : null; });
      K.need(gate, 'world.getGate()');
      const gd = Math.hypot(gate.x, gate.z) || 1, off = Math.min(2, 0.4 * gate.r);
      await g(([p]) => window.__gw.player.teleport({ x: p.x, z: p.z }, 0), [{ x: gate.x - (gate.x / gd) * off, z: gate.z - (gate.z / gd) * off }]);
      await K.secs(0.5);
      e0 = await K.evCount();
      const gi = await g(() => ({ interact: window.__gw.player.interactable?.id ?? null, pills: window.__lp.all('.gw-pill').filter((p) => !p.matches('[data-loop=home]')).map(window.__lp.say), d: window.__lp.distTo(window.__gw.world.getGate().position) }));
      K.check(gi.interact !== 'gate' && gi.pills.length === 0, 'T46: at the gate no interact pill (player.interactable is not the gate)', gi);
      await K.key('KeyE');
      await K.secs(3);
      s = await K.state();
      K.check(s.modal === null && !(await K.events(e0)).some((e) => e.e === 'gate:open'), 'T46: E opens nothing at the gate; no gate:open', { modal: s.modal });
      await K.scan('the gate');
      await K.shoot('gate');

      // ---------------------------------------------------------- the pause and the Journal's species page (T43, T31)
      K.step('main: the pause');
      if (K.phone) await K.tap('.gw-hud .gw-hb-pause'); else await K.key('Escape');
      await K.settle();
      w = await K.until("c.debug.ui().openModal === 'pause'", 1);
      K.need(w.ok, 'the pause on the water', await top());
      const pw = await g(() => ({ b: window.__lp.buttons('[data-modal=pause]'), h2: window.__lp.text('[data-modal=pause] h2') }));
      K.check([TL.resume, TL.home, TL.settings.label].every((x) => pw.b.includes(x)), 'the pause is Resume · Home · Settings', pw.b);
      K.check(!pw.b.some((x) => /abandon/i.test(x) || x === TL.newDescent) && !pw.h2, 'T31: no Abandon, no New Descent and no title in the pause', pw);
      await K.scan('the pause');
      await K.shoot('pause');
      await K.tap('[data-modal=pause] button', TL.resume);
      await K.settle();
      w = await K.until('!c.paused && c.debug.ui().openModal === null', 1);
      K.check(w.ok, 'Resume closes the pause', await K.state().then((x) => ({ paused: x.paused, modal: x.modal })));
      const jl = await g(() => { try { return window.__gw.ui.openLog?.({ speciesId: 'dusk_minnow' }) ?? null; } catch { return null; } });
      w = await K.until("c.debug.ui().openModal === 'journal'", 1);
      if (K.check(w.ok, 'the Journal\'s species page opens on the water (ui.openLog)', jl)) {
        await K.settle();
        const jt = await g(() => window.__lp.text('[data-modal=journal]') || '');
        K.check(!/\bDay\b/.test(jt) && /Evening\s+\d/.test(jt), 'T47: the species page reads "Evening N", no "Day"', jt.slice(0, 240));
        await K.scan('the Journal\'s species page', { allow: false });
        await K.shoot('journal');
        await K.key('Escape');
        await K.settle();
        await K.until('c.debug.ui().openModal === null', 1);
      }

      // ---------------------------------------------------------- a reload mid-trip (T32, T62)
      K.step('main: a reload mid-trip');
      const pre = await K.state();
      await K.reload();
      words = await K.titleWords();
      K.check(words.includes(TL.continue) && !words.includes(TL.newDescent), 'T62: a trip out: the title says Continue (no New Descent)', words);
      K.check(!(await g(() => { const t = window.__lp.one('[data-modal=title] .gw-tagline'); return !!t && !!t.textContent.trim(); })), 'T62: no tagline');
      await K.scan('the title with a trip out');
      K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'Continue');
      w = await K.until("c.flow === 'playing'", 6);
      K.need(w.ok, 'T32: Continue → the trip', await K.state());
      await K.secs(0.5);
      s = await K.state();
      K.check(s.hold?.n === pre.hold?.n && JSON.stringify(s.run?.bites) === JSON.stringify(pre.run?.bites) && JSON.stringify(s.run?.mercy) === JSON.stringify(pre.run?.mercy),
        'T32: Continue restores the hold, the bites and the mercy', { before: { hold: pre.hold, bites: pre.run?.bites, mercy: pre.run?.mercy }, after: { hold: s.hold, bites: s.run?.bites, mercy: s.run?.mercy } });
      K.check(s.run?.phase === pre.run?.phase && Math.abs((s.run?.phaseTime ?? 0) - (pre.run?.phaseTime ?? 0)) <= 2, 'T32: … the evening\'s phase and clock', { before: [pre.run?.phase, pre.run?.phaseTime], after: [s.run?.phase, s.run?.phaseTime] });
      K.check(pre.pos && s.pos && Math.hypot(s.pos[0] - pre.pos[0], s.pos[1] - pre.pos[1]) <= 1, 'T32: … and the raft\'s place', { before: pre.pos, after: s.pos });
      h = await hud();
      K.check(h.filled === s.hold?.n && h.cells === E.slots4, 'the HUD after Continue', h);
      await K.shoot('continued');

      // ---------------------------------------------------------- a 0.7 s hold on the pill at 1 of N (T50), the tally, Sold
      K.step('main: the pill held');
      const pb = await K.box('[data-loop=home]');
      K.need(pb, 'the Home pill');
      e0 = await K.evCount();
      await K.pressHold(pb.x, pb.y, 0.72);
      w = await K.until("c.debug.ui().openModal === 'tally'", 6);
      K.check(w.ok, `T50: a 0.7 s hold on the pill at 1 of ${E.slots4} opens the tally`, await K.state().then((x) => ({ flow: x.flow, modal: x.modal })));
      if (w.ok) {
        await K.key('Escape');
        await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
        w = await K.until("c.debug.ui().openModal === 'jetty'", 2);
        K.check(w.ok, 'Sold → the Jetty');
        await K.settle();
      }

      // ---------------------------------------------------------- Tallow at Hold 5: six cells on the water (R11, WICKS §5)
      if (wick === 'tallow' && w.ok) {
        K.step('main: Tallow at Hold 5');
        await g(() => window.__gw.debug.loop?.giveClams?.(200));
        await K.tap('[data-loop=jetty] [data-tile=murk]');
        await K.settle();
        await K.until("c.debug.ui().openModal === 'shelf'", 2);
        const b5 = await K.box('[data-buy="hold:5"]');
        K.need(b5 && !b5.disabled, 'the shelf offers [data-buy="hold:5"]', b5);
        await K.tapXY(b5.x, b5.y);
        await K.steps(3);
        K.check((await K.state()).loop?.holdSlots === 5, 'Hold 5 bought');
        await K.key('Escape');
        await K.settle();
        ch = await openChart();
        K.check(ch.cells === E.slots5, `Tallow's Chart at Hold 5: ${E.slots5} cells`, ch.cells);
        await K.shoot('tallow-chart-hold5');
        await K.tap('[data-loop=chart] [data-action=sail]', null, { settle: 0 });
        await K.until("c.flow === 'playing'", 6);
        await K.secs(0.5);
        h = await hud();
        const overlap = h.row ? h.right.filter((r) => r && r.l < h.row.r - 1 && r.r > h.row.l && r.t < h.row.b && r.b > h.row.t) : ['no row'];
        seen.tallowHold5 = { cells: h.cells, row: h.row, overlap: overlap.length };
        K.check(h.cells === E.slots5, `Tallow: ${E.slots5} cells in the HUD's hold row at Hold 5`, h.cells);
        K.check(h.row && h.row.r <= h.vw - 16 && overlap.length === 0, 'R11: the six cells fit the top-left row beside the right cluster', seen.tallowHold5);
        await K.shoot('tallow-hud-hold5');
      }
      await K.noErrors('the main pass');
    } catch (e) {
      if (e instanceof Abort) K.note('the main pass stopped at a step it could not pass', e.message);
      else K.check(false, 'the main pass threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
      await K.shoot('stopped').catch(() => {});
    }
  }

  // ================================================================ FORGET (after main: the returning title, Forget everything; T69)
  if (want('forget')) {
    try {
      K.step('forget: the returning title');
      if (!mainRan) await K.load({ fresh: false });
      else await K.reload();
      const D = await data(), TL = D.T;
      const offered = await g(() => window.__gw.game.introReplayOffered?.() === true);
      const words = await K.titleWords();
      const replayWord = await g(() => window.__gw.data.INTRO?.trigger?.replay?.word ?? null);
      const wantWords = [TL.continue, TL.settings.label, ...(offered && replayWord ? [replayWord] : [])];
      if (!words.includes(TL.continue)) K.note('no Continue on this title (the main pass left no save?)', words);
      K.check(words.includes(TL.continue) && words.includes(TL.settings.label) && !words.includes(TL.newDescent), 'T62/T69: the returning title is Continue · Settings, no New Descent', words);
      K.check(wantWords.every((x) => words.includes(x)) && words.length === wantWords.length, 'T62: … and Prologue exactly when introReplayOffered()', { words, offered });
      await K.scan('the returning title');
      await K.shoot('title-return');
      K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.settings.label), 'the title\'s Settings');
      await K.settle();
      K.need((await K.until("c.debug.ui().openModal === 'settings'", 1)).ok, 'Settings opens from the title');
      const row = await g((rowLine) => {
        const T = window.__lp;
        const r = T.all('[data-modal=settings] .gw-set-row').find((x) => /Forget everything/.test(x.textContent));
        if (!r) return null;
        const b = [...r.querySelectorAll('button')].find(T.visible), bb = b?.getBoundingClientRect();
        return { small: r.querySelector('small')?.textContent.replace(/\s+/g, ' ').trim() ?? null, has: r.textContent.includes(rowLine), x: bb ? bb.left + bb.width / 2 : null, y: bb ? bb.top + bb.height / 2 : null };
      }, TL.forget.row);
      K.need(row && row.x !== null, 'T69: the Forget everything row and its button');
      K.check(row.has, 'T69: the Forget row\'s line is TEXT_LOOP.forget.row', row.small);
      await K.tapXY(row.x, row.y);
      await K.steps(2);
      await K.settle();
      let cf = await g(() => ({ top: window.__gw.debug.ui().openModal, text: window.__lp.text('[data-modal=confirm]') || '', cls: !!document.querySelector('[data-modal=confirm] .gw-confirm, [data-modal=confirm].gw-confirm, [data-modal=confirm] .gw-p-confirm') }));
      K.check(cf.top === 'confirm' && cf.cls, 'T69: the first confirm is in-page (modal confirm)', cf);
      K.check(cf.text.includes(TL.forget.confirm), 'T69: its sub-line is TEXT_LOOP.forget.confirm', cf.text);
      await K.shoot('forget-confirm-1');
      K.need(await K.tap('[data-modal=confirm] .gw-btn--danger'), 'the first confirm\'s yes');
      await K.settle();
      cf = await g(() => ({ top: window.__gw.debug.ui().openModal }));
      K.check(cf.top === 'confirm', 'T69: a second in-page confirm', cf);
      await K.shoot('forget-confirm-2');
      K.need(await K.tap('[data-modal=confirm] .gw-btn--danger'), 'the second confirm\'s yes');
      await K.settle(600);
      await K.until("c.flow === 'title' && c.debug.ui().openModal === 'title'", 3);
      await K.titleReady();
      const after = await K.titleWords();
      const s = await K.state();
      K.check(JSON.stringify(after) === JSON.stringify([TL.newDescent, TL.settings.label]), 'T69: a fresh title with New Descent · Settings', after);
      K.check((await g(() => window.__lp.confirms)) === 0, 'T69: window.confirm is never called');
      K.check(s.loop && s.loop.wick == null && s.loop.tutorial == null && (s.loop.clams || 0) === 0, 'T69: meta.loop is fresh (no Wick, no tutorial, no clams)', s.loop);
      K.check(await g(() => window.__gw.game.loopFresh?.() === true), 'T69: game.loopFresh()');
      await K.scan('the title after Forget', { newDescentOk: true });
      await K.shoot('title-forgot');
      await K.noErrors('forget');
    } catch (e) {
      if (e instanceof Abort) K.note('the forget pass stopped', e.message);
      else K.check(false, 'the forget pass threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
    }
  }

  // ================================================================ NO FILM (a fresh save, no opt-in: Start → the Jetty; T63)
  if (want('nofilm')) {
    try {
      K.step('nofilm: a fresh save with no opt-in');
      await K.load({ fresh: true });
      await K.titleReady();
      const D = await data(), TL = D.T;
      const intro0 = (await K.state()).intro;
      const words = await K.titleWords();
      K.check(JSON.stringify(words) === JSON.stringify([TL.newDescent, TL.settings.label]), 'T62: the fresh title (no opt-in)', words);
      K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.newDescent), 'New Descent');
      await K.settle();
      K.need((await K.until("c.debug.ui().openModal === 'newdescent'", 1)).ok, 'the panel');
      await K.tap(`[data-modal=newdescent] button.gw-char[data-wick=${wick}]`);
      const st = await g(() => { const c = window.__gw, b = window.__lp.one('[data-modal=newdescent] [data-action=start]'); if (!b) return null; window.__lp.ev.length = 0; b.click(); return { flow: c.flow, intro: c.intro?.isActive?.() ?? null }; });
      K.need(st, 'Start');
      K.check(st.flow === 'home' && st.intro !== true, 'T63: with no film Start goes to flow home in the same task', st);
      const w = await K.until("window.__lp.ev.some((e) => e.e === 'home:enter')", 4);
      K.check(w.ok, 'home:enter {from: new}');
      await K.until("c.debug.ui().openModal === 'jetty'", 2);
      await K.settle();
      const s = await K.state(), ev = await K.events(), docks = await g(() => window.__lp.docks());
      K.check(ev.find((e) => e.e === 'home:enter')?.p?.from === 'new', 'home:enter {from: new}', ev.filter((e) => e.e === 'home:enter').map((e) => e.p));
      K.check(near(s.pos, docks[0]) <= 0.6, 'T63: the raft at the first dock', { pos: s.pos, dock: docks[0] });
      K.check(s.tut?.step === 'wake', 'T63: the tutorial at the wake', s.tut);
      K.check(JSON.stringify(s.intro) === JSON.stringify(intro0) && s.intro?.seen !== true, 'T63: meta.intro untouched', { before: intro0, after: s.intro });
      K.check(!ev.some((e) => e.e === 'intro:start'), 'no film started');
      const jt = await g(() => window.__lp.text('[data-loop=jetty]') || '');
      K.check(jt.includes(TL.murk.wake), 'the wake line', jt.slice(0, 160));
      await K.scan('the Jetty (no film)');
      await K.shoot('nofilm-jetty');
      await K.noErrors('nofilm');
    } catch (e) {
      if (e instanceof Abort) K.note('the nofilm pass stopped', e.message);
      else K.check(false, 'the nofilm pass threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
    }
  }

  await K.release().catch(() => {});
  console.log(`LOOP_1A ${JSON.stringify({ wick, size: K.tag, failures: K.failures.length, notes: K.notes.length, seen })}`);
  for (const n of K.notes) log('note:', n);
  return { failures: K.failures };
}

// ================================================================== the dry run (node, no browser): node tools/tests/loop-1a.scenario.mjs
export async function dryRun() {
  const { loadLoopData } = await import('./loop-fixture.mjs');
  const D = await loadLoopData();
  const { fmtClams } = await import('../../src/core.js');
  const bad = [];
  let n = 0;
  const ok = (c, m, x) => { n++; if (!c) bad.push(`${m}${x !== undefined ? ` :: ${JSON.stringify(x)}` : ''}`); };
  // clamText is core.fmtClams
  for (const v of [0, 7, 30, 999, 9999, 9999.4, 10000, 12400, 12499, 999999, 1000000, 1250000, -5, -12400]) ok(clamText(v) === fmtClams(v), `clamText(${v}) = fmtClams`, [clamText(v), fmtClams(v)]);
  // the Wicks' counts and lines, against data's own helpers
  const TL = D.TEXT_LOOP, L = D.LOOP;
  for (const id of L.wicks.order) {
    for (const hs of [3, 4, 5, 6, 7, 8]) ok(slotsFor(L.wicks, hs, id) === D.wickSlots(hs, id), `slotsFor(${hs}, ${id})`);
    const E = expectFor(L, TL, id);
    ok(E.slots0 === (id === 'tallow' ? 4 : 3) && E.slots4 === E.slots0 + 1 && E.slots5 === E.slots0 + 2, `${id}: the slot counts`, E);
    ok(E.goal0 === (id === 'tallow' ? 'Next: Hold 5 · 30' : 'Next: Hold 4 · 30'), `${id}: the first goal line (PLAN §0's D row)`, E.goal0);
    ok(E.firstChart === (id === 'tallow' ? TL.murk.firstChartBy.tallow : TL.murk.firstChart), `${id}: Murk's departure line`, E.firstChart);
    const plan = catchPlan(E.slots0);
    ok(plan.length === E.slots0 && plan.at(-1).via === 'real' && new Set(plan.map((p) => p.speciesId)).size === plan.length, `${id}: the first trip's catches`, plan);
    const sum = plan.reduce((a, p) => a + D.fishClams(D.SPECIES.find((s) => s.id === p.speciesId), p.z), 0);
    ok(sum >= L.hold.ladder[0].price, `${id}: the first trip pays for Hold 4 at card prices (${sum})`, sum);
    ok(plan.every((p) => listed(D, p.speciesId)), `${id}: every planned fish is on the Mossmere's list`, plan.map((p) => p.speciesId));
    ok(plan.every((p) => D.sizeClassOf(p.z) === 'keeper'), `${id}: every planned fish is a Keeper`);
  }
  // the goal line for a tackle goal and a hold goal, as goalOf hands them out
  ok(goalText(TL, L.wicks, { id: 'rod:1', name: 'Ashwood', price: 50, slot: 'rod', level: 1 }, 'tallow') === 'Next: Ashwood · 50', 'goalText: a tackle goal');
  ok(goalText(TL, L.wicks, { id: 'hold:5', name: 'Hold 5', price: 120, level: 5 }, 'tallow') === 'Next: Hold 6 · 120', 'goalText: Tallow\'s Hold 5 step reads Hold 6 (WICKS T23/T24)');
  ok(goalText(TL, L.wicks, null, 'wick') === null, 'goalText: no goal, no line');
  ok(looseRe('Next: Hold 4 · 30').test('Next: Hold 4 ·30') && looseRe('Next: Hold 4 · 30').test('Next:Hold 4 · 30') && !looseRe('Next: Hold 4 · 30').test('Next: Hold 5 · 30'), 'looseRe');
  // the tally's rows
  const st = { a: 9, b: 27, c: 7 };
  ok(tallyFaults([{ uid: 'a', clams: 9 }, { uid: 'b', clams: 27 }, { uid: 'c', clams: 7 }], 43, st, 'taper').length === 0, 'tallyFaults: a clean tally');
  ok(tallyFaults([{ uid: 'a', clams: 9 }, { uid: 'b', clams: 27 }], 36, st, 'taper').length > 0, 'tallyFaults: a row missing');
  ok(tallyFaults([{ uid: 'a', base: 9, clams: 13, first: true }, { uid: 'b', base: 27, clams: 38, first: true }, { uid: 'c', base: 7, clams: 10, first: true }], 61, st, 'wick').length === 0, 'tallyFaults: the Wick\'s firsts');
  ok(tallyFaults([{ uid: 'a', base: 9, clams: 9, first: true }], 9, { a: 9 }, 'wick').length > 0, 'tallyFaults: a first that paid no bonus');
  ok(tallyFaults([{ uid: 'a', clams: 9 }], 10, { a: 9 }, 'stub').length > 0, 'tallyFaults: a wrong total');
  // T43's rules: what must pass and what must not
  const R = wordRules(D);
  const yes = [[TL.holdFull], [TL.home], [TL.sold], [TL.yours], [TL.murk.wake], [`“${TL.murk.firstSale}”`], [TL.murk.firstChartBy.tallow], [TL.wicks.ashwick],
    ['Next: Hold 4 · 30'], ['Next: Hold 4 ·'], ['Next: Ashwood · 50'], ['Hold 5'], ['Dusk Minnow'], ['Keeper'], ['The Mossmere'], ['Taper'], ['Prologue'],
    ['Hold on the water. Let go to cast.'], ['Now. Tap.'], ['Lidded Creel'], ['Ashwood'], ['Bellwether'], ['12.4k'], ['+43'], ['9,999'], ['3 / 6'],
    ['6 oz'], ['4 lb 12 oz'], ['¼ oz'], ['lb'], ['·'], ['Dusk Minnow · 6 oz'], ['length', { card: true }], ['23.4 cm', { card: true }], [TL.settings.label], [TL.resume]];
  for (const [t, wh] of yes) ok(classifyText(t, R, wh || {}) === 'ok', `T43 allows "${t}"`, classifyText(t, R, wh || {}));
  const no = [['12 Shells', 'banned:shells'], ['Shell', 'banned:shells'], ['Memories', 'banned:memories'], ['New Descent', 'banned:descent'], ['Descend', 'unknown'],
    ['The Descent Gate', 'banned:descent'], ['2.4 kg', 'banned:kg'], ['23.4 cm', 'unknown'], ['Trade', 'unknown'], ['Day 2', 'unknown'], ['Clean Cast', 'unknown'], ['Abandon', 'unknown']];
  for (const [t, k] of no) ok(classifyText(t, R, {}) === k, `T43 refuses "${t}" (${k})`, classifyText(t, R, {}));
  ok(classifyText('New Descent', R, { newDescentOk: true }) === 'ok', 'T43: New Descent on the fresh title and the panel');
  ok(!R.exact.includes(TL.newDescent), 'New Descent is not on the plain allow-list');
  // the functions that run in the page are self-contained (they are sent as source)
  for (const f of [wordRules, classifyText, scanDom, installDriver]) {
    let fresh = null;
    try { fresh = new Function(`return (${f.toString()})`)(); } catch (e) { fresh = e; }
    ok(typeof fresh === 'function', `${f.name} compiles from its own source`, String(fresh));
  }
  const R2 = new Function(`return (${wordRules.toString()})`)()(D);
  ok(JSON.stringify(R2) === JSON.stringify(R), 'wordRules from its source gives the same rules');
  ok(new Function(`return (${classifyText.toString()})`)()('Sold', R2, {}) === 'ok', 'classifyText from its source');
  ok(WATCH.includes('player:glide') && WATCH.includes('home:enter') && WATCH.includes('loop:holdFull'), 'the watched events');
  console.log(`loop-1a dry run: ${n - bad.length}/${n} checks passed`);
  for (const b of bad) console.log('  FAIL', b);
  return bad.length;
}
/** Is a species on the Mossmere's list (progression-loop's listFor, when it is exported; else no bait and not a legend)? */
function listed(D, id) {
  const sp = D.SPECIES.find((s) => s.id === id);
  return !!sp && sp.zone === 'mossmere' && sp.rarity !== 'legendary' && !sp.bait;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const n = await dryRun();
  process.exit(n ? 1 : 0);
}
