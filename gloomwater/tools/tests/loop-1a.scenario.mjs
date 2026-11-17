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
// scenario only reads (the title's `.gw-tbtn`, the modal layer's `[data-modal]`, the HUD's `.gw-tl` / `.gw-tr` / `.gw-hb-pause`, the
// shelf's `[role=tab]`, Settings' `.gw-set-row`). T43's allow-list is this file's rules (built from the data: PLAN T43's list) or
// ui-loop.js's own textAllowed when the tree has it (imported in node; a word passes when either lets it); the goal line is
// checked against ui-loop's goalLine of loop.goal() the same way. Stub's smoke step reads the seeded wait of the same cast as the
// Wick by setting run.character for that one cast (a debug-only poke, put back at once). A neighbour that is absent fails its
// check; it never throws (PLAN §3's stub rule). Each pass prints `LOOP_1A {wick, size, failures, notes, seen}` at the end.
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
export function expectFor(L, T, wick, cost = (b) => b) {
  const W = L.wicks, H = L.hold, s0 = slotsFor(W, H.start, wick);
  // (`cost(base, step)` the page's Murk price of a step's base price, data.loopCost: the shipped game doubles PLAN's prices, LOOP.cost.shipped)
  const step = (n) => { const x = H.ladder.find((y) => y.slots === n); return x ? { ...x, price: cost(x.price, x) } : x; };
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
  for (const c of D.SIZE_CLASSES || []) if (c && c.label) { exact.add(norm(c.label)); exact.add(norm(c.label) + '?'); }   // (the bite tell's class estimate, "Keeper?": decision 62)
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
    if (/^[\s·•\-–—:|/,.()[\]…›‹«»+×✕★☆!]+$/.test(x)) return true;                     // a separator or a glyph character
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
      else if (k === 'unknown' && o.allow !== false) {
        const screen = el.closest('[data-modal]')?.dataset.modal || (el.closest('.gw-hud') ? 'hud' : el.closest('.gw-toasts') ? 'toast' : null);
        if (!out.unknown.some((u) => u.text === text && u.screen === screen)) out.unknown.push({ text, screen });
      }
    }
  }
  out.texts = [...new Set(out.texts)];
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
  /** Wait ms of wall time while the browser keeps producing frames (its own requestAnimationFrame, never the game's held loop): a
   *  CSS transition or animation only starts on a rendered frame, and with the game's frames held and its canvas not drawn the
   *  browser may produce none, so a fade waited out with a bare timeout can sit at its first frame. */
  // (… and, past ms, until no CSS transition is still pending or running and no animation is still pending, at most 4 s more: with
  // software GL the compositor can take over a second to start a fade)
  const busy = () => { try { return document.getAnimations().some((a) => a.pending || (typeof CSSTransition === 'function' && a instanceof CSSTransition && a.playState === 'running')); } catch { return false; } };
  T.pump = (ms) => new Promise((r) => { const t0 = realNow(); const f = () => { const e = realNow() - t0; if (e >= ms && (e >= ms + 4000 || !busy())) r(); else raf(f); }; raf(f); });
  T.release = () => {
    const q = T.held || [];
    T.held = null;
    T.offset = Math.max(T.offset, T.clock - realNow());
    T.drawing(true);
    for (const cb of q) raf((ts) => cb(Math.max(ts + T.offset, T.clock)));
  };
  // a task boundary after every frame: the promise jobs a frame queued (a glide's end, a Sail's trip) run before the next frame,
  // as they do between two real frames (a synchronous loop of frames would hold them all until it returned)
  const mc = new MessageChannel(), waiters = [];
  mc.port1.onmessage = () => { const w = waiters.shift(); if (w) w(); };
  T.tick = () => new Promise((r) => { waiters.push(r); mc.port2.postMessage(0); });
  /** One frame of the game's own loop (dt seconds), then a task boundary. → whether a frame ran. */
  T.frame = async (dt = 1 / 30) => {
    if (!T.held || !T.held.length) { T.dry++; await T.tick(); return false; }
    T.clock += dt * 1000; T.sim += dt;
    const q = T.held; T.held = [];
    for (const cb of q) { try { cb(T.clock); } catch (e) { c.errors.push('frame: ' + (e?.message || e)); } }
    await T.tick();
    return true;
  };
  /** n frames, dt seconds each; the canvas drawn only for the last when `paint`. → the frames that ran. */
  T.step = async (n = 1, dt = 1 / 30, paint = false) => {
    let ran = 0;
    try { for (let i = 0; i < n; i++) { T.drawing(paint && i === n - 1); if (await T.frame(dt)) ran++; } } finally { T.drawing(true); }
    return ran;
  };
  /** Step until `src` (an expression of c and T) holds, at most maxSec of game time. → {ok, t}. */
  T.until = async (src, maxSec = 10, dt = 1 / 30) => {
    const f = new Function('c', 'T', `try { return !!(${src}); } catch (e) { return false; }`);
    let t = 0;
    if (f(c, T)) return { ok: true, t: 0 };
    while (t < maxSec - 1e-9) {
      if (!(await T.step(1, dt))) return { ok: false, t, dry: true };
      t += dt;
      if (f(c, T)) return { ok: true, t: +t.toFixed(3) };
    }
    return { ok: false, t: +t.toFixed(3) };
  };
  /** The film to time t (or its end); and to its end. */
  T.runTo = async (t, dt = 1 / 30, max = 4000) => { let n = 0; while (c.intro?.isActive?.() && c.intro.state.t < t - 1e-6 && n++ < max) await T.step(1, dt); return c.intro?.state?.t ?? null; };
  T.runOut = async (dt = 1 / 30, max = 4000) => { let n = 0; while (c.intro?.isActive?.() && n++ < max) await T.step(1, dt); await T.step(1, dt); return n; };
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
  /** Is `s` on screen: the smallest visible element in the UI's layers whose words hold it (a line split by a glyph or a <b> still
   *  reads whole; the world-space words are not looked at). */
  T.seen = (s) => {
    if (!s) return false;
    const want = String(s).replace(/\s+/g, ' ').trim();
    const has = (e) => e.textContent.replace(/\s+/g, ' ').includes(want);
    for (const root of document.querySelectorAll('#ui > .gw-hud, #ui > .gw-modal-layer, #ui > .gw-toasts, #ui > .gw-banner-layer')) {
      if (!has(root)) continue;
      for (const e of root.querySelectorAll('*')) if (has(e) && ![...e.children].some(has) && !e.closest('[data-held]') && T.visible(e)) return true;
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

// ================================================================== ui-loop's allow-list helper (node side, when the tree has it)
let kitP = null;
/** ui-loop.js and the loop data in node ({UL, D}), or null when the tree has no ui-loop.js (lane C's) or the fixture fails. */
export function uiLoopModule() {
  if (!kitP) {
    kitP = (async () => {
      try {
        const UL = await import('../../src/ui-loop.js');
        const { loadLoopData } = await import('./loop-fixture.mjs');
        return { UL, D: await loadLoopData() };
      } catch { return null; }
    })();
  }
  return kitP;
}
/** (text, screen) → boolean from ui-loop's textAllowed on the loop data, or null without it. */
export async function uiLoopHelper() {
  const k = await uiLoopModule();
  if (!k || typeof k.UL.textAllowed !== 'function') return null;
  const words = typeof k.UL.allowedWords === 'function' ? k.UL.allowedWords(k.D) : null;
  return (text, screen) => { try { return k.UL.textAllowed(text, { D: k.D, screen, words }) === true; } catch { return false; } };
}
/** The Jetty's goal line for loop.goal(): ui-loop's goalLine when the tree has it (PLAN §0's D row), else this file's goalText. */
export async function goalLineText(T, wicks, goal, wick) {
  const k = await uiLoopModule();
  if (k && typeof k.UL.goalLine === 'function') { try { return k.UL.goalLine(goal, { D: k.D, wick })?.text ?? null; } catch { /* fall back */ } }
  return goalText(T, wicks, goal, wick);
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
  K.settle = (ms = 320) => g((m) => (window.__lp?.pump ? window.__lp.pump(m) : new Promise((r) => setTimeout(r, m))), ms).catch(() => wait(ms));   // (wall time, the browser's frames pumped)
  /** A frame drawn, then shot (desk-/phone-<label>-NN-name.png in --shots). */
  K.shoot = async (name) => {
    if (args.noshots) return;
    try { await g(() => window.__lp.step(1, 1 / 120, true)); } catch { /* the page is between loads */ }
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
    if (opts.allow !== false) {
      const helper = await uiLoopHelper();
      const left = r.unknown.filter((u) => !(helper && helper(u.text, u.screen)));
      K.check(left.length === 0, `T43 (${where}): every visible word is on the allow-list${helper ? ' (this file\'s rules or ui-loop\'s textAllowed)' : ''}`, left);
    }
    return r;
  };
  /** The Home pill is live: canGoHome ok, a frame or two for the view to show it, its fade on the wall clock. */
  K.pillReady = async () => { const r = await K.until('c.game.canGoHome?.()?.ok === true', 6); await K.steps(2); await K.settle(350); return r.ok; };
  /** A shelf item's buy ([data-buy=id]). Murk's catalogue (16 November 2026): the shelf is a book; the item's plate ([data-item=id]) is
   *  found on its page (the fore-edge tab of its chapter first, then a leaf at a time), tapped to mark it, and its order line in the
   *  book's foot ("Buy · <price>", [data-buy=id]) is the buy. A dear item has no order line (null). */
  K.buyBox = async (id, tabWord) => {
    const plate = `[data-loop=shelf] [data-item="${id}"]`;
    let p = await K.box(plate);
    if (!p && tabWord) { await K.tap('[data-loop=shelf] [role=tab]', tabWord); await K.settle(650); p = await K.box(plate); }
    for (let i = 0; i < 8 && !p; i++) { await K.key('ArrowRight'); await K.settle(650); p = await K.box(plate); }
    if (!p) return null;
    let b = await K.box(`[data-loop=shelf] [data-buy="${id}"]`);
    if (!b) { await K.tapXY(p.x, p.y); await K.steps(1); await K.settle(250); b = await K.box(`[data-loop=shelf] [data-buy="${id}"]`); }
    return b;
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
  /** A real key press. Space and Enter first take the focus off any button (a focused button would take them as its click). */
  K.key = async (code, { settle = 2 } = {}) => {
    if (code === 'Space' || code === 'Enter') await g(() => { try { document.activeElement?.blur?.(); } catch { /* ignore */ } });
    await page.keyboard.press(code);
    if (settle) await K.steps(settle);
  };
  let cdp = null;
  const touch = async (type, x, y) => { cdp = cdp || await page.context().newCDPSession(page); await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] }); };
  /** A real press held `sec` of both clocks (game frames stepped meanwhile); `probe` (an expression) is sampled every frame;
   *  `mid` (async) runs once, while the press is still held, from `midAt` s of it. */
  K.pressHold = async (x, y, sec, probe = null, { mid = null, midAt = 0 } = {}) => {
    if (phone) await touch('touchStart', x, y); else { await page.mouse.move(x, y); await page.mouse.down(); }
    const w0 = Date.now(), seen = [];
    let sim = 0, midDone = !mid;
    while (sim < sec - 1e-6) {
      const r = await g(async ([src]) => { await window.__lp.step(1, 1 / 30); if (!src) return null; try { return new Function('c', 'T', `return (${src})`)(window.__gw, window.__lp); } catch { return null; } }, [probe]);
      if (probe) seen.push(r);
      sim += STEP;
      if (!midDone && sim >= midAt - 1e-6) { midDone = true; await mid(); }
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
    await K.until("c.fishing.state === 'idle'", 6);
    await K.secs(0.3);
    return cd;
  };
  /** A fish caught through the real path (a real press to cast, the bite forced, the strike, the play hurried to its end). */
  K.realCatch = async (speciesId, z, { what, onBite = null, outcome = 'land', natural = false, onCharge = null, onStrike = null, onPlay = null, hold = 0.5 } = {}) => {
    const pt = await K.waterPoint();
    const pr = await K.pressHold(pt.x, pt.y, hold, 'c.fishing.state', onCharge ? { mid: onCharge, midAt: Math.min(0.25, hold / 2) } : {});
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
    if (onStrike) { await K.steps(1); await K.settle(300); await onStrike(); }
    await K.steps(3);
    if (onPlay) { await g(() => window.__gw.debug.fishPlayTo?.(0.5)); await K.steps(2); await K.settle(300); await onPlay(); }
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
  const { page, evalGame: g, log, args } = api;
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
    // (the page's Murk price of each hold step: data.loopCost over the ladder's base price, LOOP.cost.factor ×2 in the shipped game)
    const cost = (b) => (typeof d.loopCost === 'function' ? d.loopCost(b) : b);
    return { loop: d.LOOP_ENABLED === true, phase: d.V3_PHASE, LOOP: { wicks: d.LOOP?.wicks, hold: d.LOOP?.hold, tutorial: d.LOOP?.tutorial }, T: d.TEXT_LOOP,
      prices: Object.fromEntries((d.LOOP?.hold?.ladder || []).map((x) => [x.slots, cost(x.price)])), factor: d.LOOP?.cost?.factor ?? 1,
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
      filled: root ? [...root.querySelectorAll('.gw-slot[data-filled]')].filter((x) => !['0', 'false'].includes(x.dataset.filled)).length : 0, sail: sail ? { cue: sail.classList.contains('gw-cue'), disabled: !!sail.disabled } : null,
      text: root ? root.textContent.replace(/\s+/g, ' ').trim() : '' };
  });
  /** The water's HUD: the hold row, the Home pill. */
  const hud = () => g(() => {
    const T = window.__lp, row = T.one('.gw-hud .gw-hold') || T.one('[data-loop=hold]'), pill = document.querySelector('[data-loop=home]');
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
    const tr = [...document.querySelectorAll('.gw-tr *')].filter((e) => T.visible(e) && !e.children.length).map(r);
    return { cells: row ? row.querySelectorAll('.gw-slot').length : 0, filled: row ? [...row.querySelectorAll('.gw-slot[data-filled]')].filter((x) => !['0', 'false'].includes(x.dataset.filled)).length : 0, row: r(row), right: tr,
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
      const TL = D.T, E = expectFor(D.LOOP, TL, wick, (b, st) => D.prices[st?.slots] ?? b), order = D.LOOP.wicks.order;
      const p4 = D.prices[4] ?? D.LOOP.hold.ladder[0].price;   // Hold 4 at Murk's price on this page
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
      const panel = () => g(([phone, names]) => {
        const T = window.__lp, m = T.one('[data-modal=newdescent]');
        const cards = m ? [...m.querySelectorAll('button.gw-char[data-wick]')] : [];
        // the name's own element (the deepest that holds just the name): not truncated, inside its card
        const fit = (b) => {
          const nm = names[b.dataset.wick], els = [...b.querySelectorAll('*')].filter((e) => e.textContent.replace(/\s+/g, ' ').trim() === nm);
          const e = els[els.length - 1] || (b.textContent.includes(nm) ? b : null);
          if (!e) return false;
          if (e.clientWidth > 0) return e.scrollWidth <= e.clientWidth + 1;
          const r = e.getBoundingClientRect(), cb = b.getBoundingClientRect();
          return r.left >= cb.left - 1 && r.right <= cb.right + 1;
        };
        const tr = m?.querySelector('.gw-loop-trait');
        const rowsOf = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return new Set([...rg.getClientRects()].filter((q) => q.width > 1 && q.height > 1).map((q) => Math.round(q.bottom))).size; };
        // the lit Wick's passive block (the user, 16 November 2026): its picture, its name and its line, clear of the cards and the
        // foot, inside the window, nothing cut
        const pv = m?.querySelector('.gw-loop-passive'), nm = pv?.querySelector('.gw-loop-passive-name'), pic = pv?.querySelector('.gw-loop-passive-ico svg.gw-pico');
        const bx = (e) => { const r = e?.getBoundingClientRect(); return r ? { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } : null; };
        const meet = (a, b) => !!a && !!b && a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
        const pb = bx(pic), tb = bx(tr), nb = bx(nm), cardB = cards.map((b) => bx(b.querySelector('.gw-char-name'))), footB = [...(m?.querySelectorAll('.gw-pf .gw-btn') || [])].map(bx);
        const parts = [pb, nb, tb].filter(Boolean);
        return {
          top: window.__gw.debug.ui().openModal, ids: cards.map((b) => b.dataset.wick), enabled: cards.every((b) => !b.disabled), on: cards.filter((b) => b.classList.contains('gw-on')).map((b) => b.dataset.wick),
          boxes: cards.map((b) => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), t: Math.round(r.top), l: Math.round(r.left) }; }), fit: cards.map(fit),
          trait: tr ? tr.textContent.replace(/\s+/g, ' ').trim() : null, traitRows: tr ? rowsOf(tr) : null,
          passive: nm ? nm.textContent.replace(/\s+/g, ' ').trim() : null, blocks: m ? m.querySelectorAll('.gw-loop-passive').length : 0, pic: pb ? Math.round(Math.min(pb.w, pb.h)) : 0,
          clear: parts.length === 3 && !parts.some((p) => cardB.some((c) => meet(p, c)) || footB.some((f) => meet(p, f))) && !meet(pb, nb) && !meet(pb, tb)
            && parts.every((p) => p.l >= 0 && p.r <= innerWidth && p.t >= 0 && p.b <= innerHeight) && (!tr || tr.scrollWidth <= tr.clientWidth + 1) && (!nm || nm.scrollWidth <= nm.clientWidth + 1),
          // each card's passive picture (the user, 16 November 2026: "put icons on every portrait"): under its name, inside its card,
          // whole on screen; quieter on the unlit cards than on the lit one
          picos: cards.map((b) => {
            const w = b.querySelector('.gw-char-pico'), sv = w?.querySelector('svg.gw-pico'), pb2 = bx(sv), cb = bx(b), nb2 = bx(b.querySelector('.gw-char-name'));
            return { id: b.dataset.wick, size: pb2 ? Math.round(Math.min(pb2.w, pb2.h)) : 0, under: !!pb2 && !!nb2 && pb2.t >= nb2.b - 1 && !meet(pb2, nb2),
              inside: !!pb2 && pb2.l >= cb.l - 1 && pb2.r <= cb.r + 1 && pb2.t >= 0 && pb2.b <= innerHeight, op: w ? Number(getComputedStyle(w).opacity) : 0, on: b.classList.contains('gw-on') };
          }),
          clearOfPicos: parts.length === 3 && !parts.some((p) => cards.some((b) => meet(p, bx(b.querySelector('.gw-char-pico'))))),
          forbidden: m ? ['.gw-locked', '.gw-mode', '.gw-ways', '.gw-cd-row', '.gw-chips', '.gw-rating', '.gw-lore'].filter((q) => m.querySelector(q)) : [],
          x: !!m?.querySelector('.gw-x'), phone,
        };
      }, [K.phone, D.names]);
      let nd = await panel();
      K.need(nd.top === 'newdescent', 'T59: New Descent opens its panel (modal newdescent)', nd.top);
      K.check(JSON.stringify(nd.ids) === JSON.stringify(order) && nd.enabled, 'T59: five button.gw-char[data-wick] in LOOP.wicks order, all enabled', nd.ids);
      K.check(nd.forbidden.length === 0, 'T59: no locks, modes, waystones, night cards, chips, rating or lore', nd.forbidden);
      K.check(!nd.x, 'T59: the panel has no ✕ (close: false)');
      const panelWords = (await K.scanRaw({ roots: ['#ui > .gw-modal-layer [data-modal=newdescent]'], newDescentOk: true })).texts;
      const wantWords = [...order.map((id) => D.names[id]), ...(TL.passives ? [TL.passives[nd.on[0] || 'wick']] : []), TL.wicks[nd.on[0] || 'wick'], TL.back, TL.start];
      K.check(panelWords.length === wantWords.length && wantWords.every((w) => panelWords.includes(w)), 'T59: the words are the five names, the lit Wick\'s passive name and one line, Back and Start', { panelWords, wantWords });
      K.check(nd.blocks === 1 && nd.pic >= (K.phone ? 56 : 104), 'T59: one passive block, its ink picture at least 56 px on a phone, 104 on a desktop', { blocks: nd.blocks, pic: nd.pic });
      { const lit = nd.picos.find((p) => p.on), dim = nd.picos.filter((p) => !p.on);
        K.check(nd.picos.length === 5 && nd.picos.every((p) => p.size >= (K.phone ? 28 : 36) && p.under && p.inside) && nd.clearOfPicos,
          'T59: every card carries its passive\'s picture under its name, inside the card and clear of the lit Wick\'s block', nd.picos);
        K.check(!!lit && dim.length === 4 && dim.every((p) => p.op < lit.op), 'T59: the unlit cards\' pictures are quieter than the lit one\'s', nd.picos.map((p) => [p.id, p.op])); }
      if (K.phone) {
        // (rows by top within 12 px: the lit card stands a few px proud of its row)
        const rows = [];
        for (const t of nd.boxes.map((b) => b.t).sort((a, b) => a - b)) if (!rows.length || t - rows[rows.length - 1] > 12) rows.push(t);
        const inRow = (b, r) => b.t >= r - 1 && b.t - r <= 12;
        const first = nd.boxes.filter((b) => inRow(b, rows[0])).length, second = nd.boxes.filter((b) => inRow(b, rows[1])).length;
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
        K.check(nd.on[0] === order[i] && nd.trait === TL.wicks[order[i]] && (!TL.passives || nd.passive === TL.passives[order[i]]), `T59: Digit${i + 1} lights ${order[i]}, its passive's name and its line`, { on: nd.on, passive: nd.passive, trait: nd.trait });
        K.check(nd.traitRows === 1, `WICKS §5: ${order[i]}'s line is one line high`, nd.traitRows);
        K.check(nd.clear, `T59: ${order[i]}'s passive block (picture, name, line) overlaps no card name and no button, and nothing in it is cut`);
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

      // >>> M1 step 5b (LANE 5B-TOW; OPENING §6.2 rev. 5): from step 5 the film hands off through one ink dip to the Landing on the
      // Chart, Murk's wake line there (T44, T65), a reload in the wake resumes at the Landing's wake (T67), then the first tow (its
      // leg, the dip, the glide in to the mooring) and the chart beat over the moored barge; Escape on it leaves the Jetty with the
      // chart table's cue. Without the tow (LOOP.tow.opening false, or a tree without it) the built hand-off below, as it was.
      let ev, docks, checkWake, e0;
      const TOW = await g(() => window.__gw.data.LOOP?.tow?.opening === true && typeof window.__gw.debug.loop?.tow === 'function');
      if (TOW) {
        K.step('main: the Landing (the tow\'s opening)');
        const tw = () => g(() => window.__gw.debug.loop.tow());
        const sayLine = () => g(() => (document.querySelector('[data-loop=tow] .gw-murk-line')?.textContent || '').trim());
        ev = await K.events();
        K.check(ev.some((e) => e.e === 'intro:done'), 'T64: intro:done');
        K.check(!ev.some((e) => e.e === 'player:glide' && e.p?.kind === 'home'), 'T64 (step 5): no hand-off glide to the Jetty; the Landing');
        w = await K.until("c.debug.loop.tow().phase === 'wake'", 4);
        K.need(w.ok, 'T64 (step 5): one ink dip → the Landing on the Chart → the wake', await tw());
        await K.secs(0.8);
        await K.settle(400);
        K.check((await sayLine()) === TL.murk.wake, 'T44 (step 5): Murk\'s wake line at the Landing', await sayLine());
        s = await K.state();
        K.check(s.tut?.step === 'wake' && s.loop?.tutorial?.done === false, 'T65 (step 5): the tutorial at the wake (a Landing beat)', s.tut);
        const sv0 = await g(() => window.__lp.stored());
        K.check(sv0?.meta?.intro?.seen === true && sv0?.meta?.loop?.wick === wick && sv0?.meta?.loop?.tutorial?.done === false, 'T64: the save at the hand-off holds meta.intro.seen, the Wick and the tutorial', { intro: sv0?.meta?.intro, wick: sv0?.meta?.loop?.wick, tutorial: sv0?.meta?.loop?.tutorial });
        await K.scan('the Landing (the wake)');
        await K.shoot('landing-wake');
        await K.noErrors('the Landing');

        K.step('main: a reload in the wake (the Landing)');
        await K.reload();
        words = await K.titleWords();
        K.check(words.includes(TL.continue) && words.includes(TL.settings.label) && !words.includes(TL.newDescent), 'T67/T62: after a reload the title says Continue · Settings, no New Descent', words);
        K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
        w = await K.until("c.debug.loop.tow().phase === 'wake'", 4);
        K.check(w.ok, 'T67 (step 5): Continue before the tow → the Landing, at the wake', await tw());
        await K.secs(0.5);
        K.check((await sayLine()) === TL.murk.wake, 'T67 (step 5): the wake line again', await sayLine());

        K.step('main: the tow');
        w = await K.until("c.debug.loop.tow().phase === 'leg'", 9);
        K.need(w.ok, 'T65 (step 5): the wake → the tow\'s leg', await tw());
        const st0 = await g(() => window.__lp.stored());
        K.check(st0?.meta?.loop?.barge?.towed?.includes('mossmere') === true, 'T67 (step 5): the tow\'s begin saves barge.towed before it plays', st0?.meta?.loop?.barge);
        await K.secs(2.5);
        await K.shoot('tow-leg');
        w = await K.until("c.debug.loop.tow().phase === 'glide'", 6);
        K.check(w.ok, 'T65 (step 5): the leg → one ink dip → the glide in', await tw());
        await K.secs(1.2);
        await K.shoot('tow-glide-in');
        w = await K.until("window.__lp.ev.some((e) => e.e === 'home:enter')", 12);
        K.need(w.ok, 'T65 (step 5): the leg, the dip and the glide in end at home:enter', await tw());
        const tl = await tw();
        const at = (k) => tl.marks.find((m) => m.what === k)?.sim ?? null;
        K.check(Math.abs(at('dip') - at('leg') - 5) <= 0.15 && Math.abs(at('glide') - at('dip') - 0.6) <= 0.2 && Math.abs(at('done') - at('glide') - 3) <= 0.2, 'T65 (step 5): the leg 5 s, the dip 0.6 s, the glide in 3 s', tl.marks.map((m) => [m.what, m.sim]));
        ev = await K.events();
        K.check(ev.find((e) => e.e === 'home:enter')?.p?.from === 'title', 'home:enter {from: title} (the Continue\'s tow)', ev.filter((e) => e.e === 'home:enter').map((e) => e.p));
        docks = await g(() => window.__lp.docks());
        s = await K.state();
        K.check(near(s.pos, docks[0]) <= 0.6, 'T44/T64: the raft at the barge\'s stern (docks[0])', { pos: s.pos, dock: docks[0] });

        K.step('main: the chart beat over the moored barge, then Escape');
        w = await K.until("c.debug.ui().openModal === 'chart'", 3);
        K.need(w.ok, 'T65 (step 5): the Chart opens at once over the moored barge', await top());
        await K.secs(1.4);
        await K.settle(600);
        s = await K.state();
        K.check(s.tut?.step === 'chart', 'T65 (step 5): the tutorial at the chart beat', s.tut);
        await K.shoot('chart-moored');
        checkWake = async (what) => {
          for (let i = 0; i < 12 && !(await g(() => !!window.__lp.one('[data-loop=jetty]'))); i++) await K.settle(300);
          const j = await jetty(), st2 = await K.state();
          K.check(j.root, `${what}: [data-loop=jetty] is on screen`);
          K.check(j.tiles.chart?.cue === true && j.tiles.chart?.dim !== true, `${what}: the chart table's target .gw-cue`, j.tiles);
          K.check(!j.text.includes(TL.next.split('{')[0].trim()), `${what}: no goal line during the tutorial`);
          K.check(st2.tut?.step === 'wake', `${what}: the tutorial waits on the Chart (step wake)`, st2.tut);
          return j;
        };
        await K.key('Escape');
        await K.settle();
        K.check((await top()) === 'jetty', 'T57/T65: Escape on the chart beat → home at the barge', await top());
        await checkWake('T65 (step 5)');
        await K.scan('home at the barge (the tutorial)');
        await K.shoot('jetty-wake');
      }
      // <<< M1 step 5b
      if (!TOW) {
      // ---------------------------------------------------------- the hand-off glide to the Jetty (T64, T56)
      K.step('main: the glide to the Jetty');
      ev = await K.events();
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
      docks = await g(() => window.__lp.docks());
      s = await K.state();
      K.check(near(s.pos, docks[0]) <= 0.6, 'T44/T64: the raft at the first dock', { pos: s.pos, dock: docks[0] });
      // (M1 step 5a: with the home barge the raft tied at its stern is framed by the mooring's own camera, 'home', eased from 'sail')
      const barge = await g(() => !!window.__gw.world.getMooring?.());
      K.check(he?.mode === 'sail' && (s.mode === 'sail' || (barge && s.mode === 'home')), `T56: the camera is still sail at the Jetty${barge ? ' (the home barge\'s framing, eased from it)' : ''}`, { enter: he?.mode, now: s.mode });
      const mood = await g(() => { try { return window.__gw.debug.audio?.()?.mood ?? null; } catch { return null; } });
      K.check(mood === null || mood === 'hub', 'T56: the audio mood at home is hub', mood);

      // ---------------------------------------------------------- the tutorial at the wake (T44, T65)
      K.step('main: the wake');
      w = await K.until("c.debug.ui().openModal === 'jetty'", 3);
      K.need(w.ok, 'T44: the Jetty opens on home:enter (modal jetty)', await K.state());
      await K.settle();
      checkWake = async (what) => {
        // (the Jetty's screen fades in on the wall clock; under load it can still be below the visible threshold after a short settle)
        for (let i = 0; i < 12 && !(await g(() => !!window.__lp.one('[data-loop=jetty]'))); i++) await K.settle(300);
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
      e0 = await K.evCount();
      K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'the title\'s Continue');
      w = await K.until("c.debug.ui().openModal === 'jetty'", 4);
      K.need(w.ok, 'T67: Continue → the Jetty', await K.state());
      await K.settle();
      ev = await K.events(e0);
      K.check(!ev.some((e) => e.e === 'player:glide' && e.p?.kind === 'home' && e.p?.state === 'start'), 'T67: Continue at home: the Jetty with no glide');
      K.check(ev.some((e) => e.e === 'home:enter' && e.p?.from === 'title'), 'home:enter {from: title}', ev.filter((e) => e.e === 'home:enter').map((e) => e.p));
      await checkWake('T67');

      }   // (M1 step 5b: the end of the built hand-off's block)

      // ---------------------------------------------------------- the home pause and Settings (T73, T74, T57)
      K.step('main: the home pause');
      const openHomePause = async () => {
        const j = await jetty();
        if (K.phone) K.check(!!j.glyph && j.glyph.w >= 44 && j.glyph.h >= 44 && j.glyph.l < api.width / 2 && j.glyph.t < 160 && !j.glyph.text, 'T73: the Jetty\'s quiet pause glyph on a phone (button[data-loop=homepause], no word, ≥ 44 px, top-left)', j.glyph);
        else if (!j.glyph) K.note('no pause glyph on the desktop Jetty (Escape is the way; T73 asks for the glyph on a phone)');
        if (K.phone) await K.tap('button[data-loop=homepause]');
        else await K.key('Escape');
        await K.settle();
        return K.until("c.debug.ui().openModal === 'homepause'", 1);
      };
      w = await openHomePause();
      K.check(w.ok, `T73: ${K.phone ? 'the pause glyph' : 'Escape'} on the Jetty opens the home pause`, await top());
      const t0 = (await K.state()).tut;
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
        await K.settle(900);   // (… as a CSS animation on the wall clock: the shot shows every cell inked)
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
      if (TOW) {   // M1 step 5b: after the tow a reload resumes at the chart beat over the moored barge: the Chart at once (T67)
        w = await K.until("c.debug.ui().openModal === 'chart'", 5);
        K.need(w.ok, 'T67 (step 5): Continue → the chart beat (the Chart at once over the barge)', await top());
        K.check((await g(() => window.__gw.debug.loop.tow().phase)) === null, 'T67 (step 5): the tow never plays again');
        await K.secs(1.4);
        await K.settle(900);
        ch = await chart();
      } else {
      w = await K.until("c.debug.ui().openModal === 'jetty'", 4);
      K.need(w.ok, 'T67: Continue → the Jetty', await top());
      await K.settle();
      await checkWake('T67 (chart beat)');
      ch = await openChart();
      }
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

      // M1 step 5b (LANE 5B-TOW): --until=sail stops the main pass here (the opening's path only: a short run for a lane's gate)
      if (args.until === 'sail') throw new Abort('the main pass stops after the first Sail (--until=sail)');
      // ---------------------------------------------------------- the first trip (T68, T50, T3, the HUD)
      K.step('main: the first trip');
      const castTip = tipText(D, 'fe_cast'), strikeTip = tipText(D, 'fe_strike');
      await K.secs(0.8);
      await K.settle(400);
      K.check(!(await g((t) => window.__lp.seen(t), castTip)), 'T68: fe_cast waits 1.5 s after run:start');
      await K.secs(1.4);
      await K.settle(450);
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
            onCharge: async () => {
              await K.settle(250);
              const fx = await g(() => { const sc = window.__gw.render?.scene, v = (n) => { const o = sc?.getObjectByName?.(n); return o ? !!o.visible : null; }; return { state: window.__gw.fishing.state, dist: window.__gw.fishing.view?.castDist ?? null, range: v('range-ring'), label: v('reticle-label'), reticle: v('reticle'), arc: v('cast-arc') }; });
              K.check(fx.state === 'charging', '(the real press charges a cast)', fx);
              K.check(fx.range === false && fx.label === false, 'the user\'s rule: no range ring round the raft and no band word while a trip\'s cast charges', fx);
              K.check(fx.reticle === false && fx.arc !== false, '… and no reticle: the cast arc alone shows the aim', fx);
              await K.scan('the water (a cast charging)');
              await K.shoot('charge');
            },
            onStrike: async () => { await K.scan('the water (the strike)'); },
            onPlay: async () => { await K.scan('the water (the play)'); },
            onBite: async () => {
              const bites = (await K.events()).filter((e) => e.e === 'fishing:bite');
              K.check(bites.length === 1 && typeof bites[0].p?.waterKey === 'string', 'T8: the first real bite of the evening carries its waterKey', bites.map((b) => b.p));
              await K.steps(1);      // (the tip's .gw-in lands in the next animation frame: one frame of the bite's window)
              await K.settle(450);   // (frames held: the bite's window does not run meanwhile)
              K.check(await g((t) => window.__lp.seen(t), strikeTip), 'T68: fe_strike in the first bite\'s window', strikeTip);
              K.check(!(await g((t) => window.__lp.seen(t), castTip)), 'T68: fe_cast is gone once the line is cast');
              await K.scan('the water (a bite)');
              await K.shoot('first-bite');
            },
          });
          await K.settle(600);
          K.check(!(await g((t) => window.__lp.seen(t), strikeTip)), 'T68: fe_strike is gone at the strike');
          cd = await toCard(what);
        }
        if (cd?.fish?.uid) stamped[cd.fish.uid] = cd.keep?.to;
        s = await K.state();
        h = await hud();
        K.check(s.hold?.n === i + 1 && h.filled === i + 1, `${what}: the hold and the HUD hold ${i + 1}`, { hold: s.hold, filled: h.filled });
        if (i === 0) {
          // T50 at 1 of N: a 0.3 s press on the pill does nothing, and never starts a cast charge
          await K.pillReady();
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
      await K.settle(450);
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
      await K.pillReady();
      const purse0 = (await K.state()).loop?.clams ?? null;
      e0 = await K.evCount();
      K.need(await K.tap('[data-loop=home]'), 'T50: a tap on the Home pill with a full hold');
      w = await K.until("c.debug.ui().openModal === 'tally'", 6);
      K.need(w.ok, 'T50/T21: the tap opens the tally (after the sail home)', await K.state());
      ev = await K.events(e0);
      s = await K.state();
      K.check(ev.some((e) => e.e === 'run:end' && e.p?.cause === 'home'), 'run:end {cause: home}');
      K.check(ev.some((e) => e.e === 'player:glide' && e.p?.kind === 'home'), 'the sail home glides (player:glide {kind: home})');
      K.check(ev.filter((e) => e.e === 'player:glide').every((e) => e.mode === 'sail'), 'T56: the camera stays sail through the sail home', ev.filter((e) => e.e === 'player:glide').map((e) => e.mode));
      K.check(near(s.pos, docks[0]) <= 0.6, 'T66: after the tally opens the raft is at docks[0] (home is the Jetty)', { pos: s.pos, dock: docks[0] });
      const lt = s.loop?.lastTrip;
      K.check(lt && Array.isArray(lt.lines) && lt.lines.length === E.slots0, `T21: the tally holds ${E.slots0} rows`, lt);
      K.check(purse0 !== null && s.loop.clams - purse0 === lt?.total, 'T21: the clams delta equals the tally\'s total (paid once, at endTrip)', { before: purse0, after: s.loop?.clams, total: lt?.total });
      K.check(lt?.total > 0 && lt.total < D.LOOP.hold.ladder[0].price, 'the first trip pays, but not for Hold 4 even at its base price (the user, 17 Nov 2026: "Make it 400 to start"; the purse is topped up below)', lt?.total);
      const tf = tallyFaults(lt?.lines, lt?.total, stamped, wick);
      K.check(tf.length === 0, 'T21/WICKS §2.1: every row pays what its card said (the Wick: its base, then its first)', tf);
      if (wick === 'wick') {
        const firsts = (lt?.lines || []).filter((l) => l.first === true && l.clams > (l.base ?? l.clams));
        seen.wickFirstSale = firsts.length;
        K.check(firsts.length >= 1, 'the Wick\'s seen event: a first sells higher at the tally (a row with first and clams > base)', lt?.lines);
      }
      await K.secs(wick === 'wick' ? 3 : 0.8);
      await K.shoot('tally');
      if (wick === 'wick') {
        // the Wick's first ticks twice with the brighter coin (WICKS §2.1): the built audio log, when this page logs its sounds
        const coins = await g(() => { try { return (window.__gw.debug.audioLog?.(400) || []).map((x) => x?.name).filter((n) => /^coin/.test(n || '')); } catch { return []; } });
        if (!coins.length) K.note('the audio log holds no coin yet (a suspended audio context?): the brighter coin is not checked', coins);
        else K.check(coins.includes('coinBright'), 'the Wick\'s first-sale ticks: coinBright at the tally', coins);
        seen.wickCoins = coins;
      }
      await K.key('Escape');
      await K.secs(0.3);
      await K.settle(400);
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
      const gl0 = await goalLineText(TL, D.LOOP.wicks, s.goal, wick);
      K.check(gl0 === E.goal0, 'the goal line from loop.goal() (ui-loop\'s goalLine) is the one PLAN §0 names', { goalLine: gl0, plan: E.goal0, goal: s.goal });
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
      let b4 = await K.buyBox('hold:4', TL.tabs?.raft);
      const purseAt = (await K.state()).loop?.clams ?? 0;
      if (purseAt < p4) {
        // Murk's prices are doubled in the shipped game (LOOP.cost.shipped, the user's 16 Nov 2026 call): the first tally no longer
        // pays for Hold 4. Too dear, its plate shows the price, dimmed, and no order line (SPEC §8.4); then the purse is topped up
        // to the price and the shelf opened again, so the real buy below runs on the real card.
        const plate = await K.box('[data-loop=shelf] [data-item="hold:4"]');
        K.check(!!plate && !b4, `SPEC §8.4: Hold 4 too dear at ${purseAt} (its price ${p4}): its plate, no order line`, { plate: !!plate, order: b4 });
        await K.key('Escape');
        await K.settle();
        await g((n) => window.__gw.debug.loop?.giveClams?.(n), p4 - purseAt);
        K.need(await K.tap('[data-loop=jetty] [data-tile=murk]'), 'the Jetty\'s Murk tile (again, the purse topped up)');
        await K.settle();
        w = await K.until("c.debug.ui().openModal === 'shelf'", 2);
        K.need(w.ok, 'the Murk tile opens the shelf again', await top());
        await K.secs(0.5);
        b4 = await K.buyBox('hold:4', TL.tabs?.raft);
      }
      const purse4 = (await K.state()).loop?.clams ?? 0;
      K.need(b4 && !b4.disabled, 'the shelf offers [data-buy="hold:4"]', b4);
      K.check(b4.text.includes(clamText(p4)) || (await g(() => window.__lp.text('[data-loop=shelf]') || '')).includes(clamText(p4)), `Hold 4's price on its card (${p4})`, b4.text);
      await K.scan('the shelf');
      await K.shoot('shelf');
      e0 = await K.evCount();
      await K.tapXY(b4.x, b4.y);
      await K.steps(3);
      s = await K.state();
      K.check(s.loop?.holdSlots === 4, 'T23: the buy: holdSlots 4', s.loop?.holdSlots);
      K.check(s.loop?.clams === purse4 - p4, `the buy spends Hold 4's price (${p4})`, { before: purse4, after: s.loop?.clams });
      K.check((await K.events(e0)).some((e) => e.e === 'loop:buy'), 'loop:buy');
      K.check((await g(() => window.__lp.text('[data-loop=shelf]') || '')).includes(TL.yours), `PLAN CHOICE 26: the bought card reads "${TL.yours}" until the shelf closes`);
      await K.shoot('shelf-bought');
      await K.key('Escape');
      await K.settle();
      K.check((await top()) === 'jetty', 'T57: Escape on the shelf → the Jetty', await top());
      s = await K.state();
      const gl = await goalLineText(TL, D.LOOP.wicks, s.goal, wick);
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
      // T73 / T66: a home glide is skipped, not paused: Escape (a tap on a phone) ends the glide out at its end, and the trip starts
      await K.secs(0.6);
      const sk0 = await K.sim();
      if (K.phone) { const wq = await K.waterPoint(); await K.tapXY(wq.x, wq.y); } else await page.keyboard.press('Escape');
      w = await K.until("c.flow === 'playing'", 6);
      K.need(w.ok, 'the second trip starts', await K.state());
      const skipT = (await K.sim()) - sk0;
      K.check(skipT < 0.5 && !(await K.events(e0)).some((e) => e.e === 'ui:modal' && e.p?.id === 'homepause' && e.p?.open), `T73: ${K.phone ? 'a tap' : 'Escape'} skips the glide out (the trip ${skipT.toFixed(2)} s later), and opens no home pause`, skipT);
      await K.steps(2);
      ev = await K.events(e0);
      const so2 = ev.find((e) => e.e === 'player:glide' && e.p?.kind === 'sailOut' && e.p?.state === 'start');
      K.check(so2 && pos1 && Math.hypot(so2.raft[0] - pos1[0], so2.raft[1] - pos1[1]) <= 0.5, 'T66: every Sail glides out, from within 0.5 m of the raft', { raft: pos1, glide: so2?.raft });
      s = await K.state();
      K.check(s.run?.evening === 2 && s.run?.character === wick, 'the second evening, as the same Wick', s.run);
      await K.settle(450);   // (the HUD fades in on the wall clock once the trip starts)
      h = await hud();
      K.check(h.cells === E.slots4 && h.filled === 0, `${E.slots4} empty cells on the water`, h);
      await K.secs(2.4);
      await K.settle(450);
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
        // Stub: the same cast waits ×0.78 of the Wick's. The wait's draw is Math.random's (unseeded in the game, so the reel's seeded
        // draws keep their sim parity), and in a page the cast's listeners (the sound, the actors) draw from it too, so a seeded
        // sequence lands at a different place for each cast: both casts run on a Math.random held at 0.5 through the forced cast's
        // synchronous roll, so the two waits differ by Stub's waitMul alone (unless a sign's rule or quiet water differs between
        // the two casts: noted). The node test (loop-evening) pins the mean over 200 casts.
        const waitOf = async (asId) => {
          await g(([id, n]) => {
            const c = window.__gw; c.state.run.character = id; c.debug.fishSeed?.(n);
            const R = Math.random; Math.random = () => 0.5;
            try { c.debug.forceBite?.({ natural: true }); } finally { Math.random = R; }
          }, [asId, seed]);
          const r = await K.until("c.fishing.state === 'waiting'", 4);
          const wd = await g(() => window.__gw.debug.fishing?.()?.waitDur ?? null);
          await g(() => { try { window.__gw.fishing.cancel('debug'); } catch { /* optional */ } });
          await K.until("c.fishing.state === 'idle'", 4);
          return r.ok ? wd : null;
        };
        const wWick = await waitOf('wick'), wStub = await waitOf('stub');
        await g(() => { window.__gw.state.run.character = 'stub'; });
        seen.stubWait = { stub: wStub, wick: wWick, ratio: wWick ? +(wStub / wWick).toFixed(3) : null };
        K.check(typeof wStub === 'number' && typeof wWick === 'number' && wStub < wWick, 'Stub\'s seen event: the same cast (the draws held) waits less than the Wick\'s', seen.stubWait);
        if (!(seen.stubWait.ratio !== null && Math.abs(seen.stubWait.ratio - 0.78) <= 0.03)) K.note('Stub\'s wait is not ×0.78 of the Wick\'s on this pair (the clamp, or a sign\'s rule hit one cast): the node test pins the mean', seen.stubWait);
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
      await K.pillReady();
      const pb = await K.box('[data-loop=home]');
      K.need(pb, 'the Home pill');
      e0 = await K.evCount();
      await K.pressHold(pb.x, pb.y, 0.72);
      w = await K.until("c.debug.ui().openModal === 'tally'", 6);
      K.check(w.ok, `T50: a 0.7 s hold on the pill at 1 of ${E.slots4} opens the tally`, await K.state().then((x) => ({ flow: x.flow, modal: x.modal })));
      if (w.ok) {
        await K.key('Escape');
        await K.secs(0.3);
        await K.settle(400);   // (Sold fades in on the wall clock at the tally's end)
        await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
        w = await K.until("c.debug.ui().openModal === 'jetty'", 2);
        K.check(w.ok, 'Sold → the Jetty');
        await K.settle();
      }

      // ---------------------------------------------------------- Tallow at Hold 5: six cells on the water (R11, WICKS §5)
      if (wick === 'tallow' && w.ok) {
        K.step('main: Tallow at Hold 5');
        await g((n) => window.__gw.debug.loop?.giveClams?.(n), D.prices[5] ?? 2 * D.LOOP.hold.ladder[1].price);   // Hold 5 at Murk's price on this page (the user, 17 Nov 2026: really expensive)
        await K.tap('[data-loop=jetty] [data-tile=murk]');
        await K.settle();
        await K.until("c.debug.ui().openModal === 'shelf'", 2);
        const b5 = await K.buyBox('hold:5', TL.tabs?.raft);
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
        await K.settle(700);   // (the HUD fades in on the wall clock once the trip starts)
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
      if (!mainRan) { await K.load({ fresh: false }); await K.titleReady(); } else await K.reload();
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
        const b = [...r.querySelectorAll('button')].find(T.visible);
        try { b?.scrollIntoView({ block: 'center' }); } catch { /* ignore */ }   // (Settings scrolls at 540 px high: the row is below the fold)
        const bb = b?.getBoundingClientRect();
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
      // T60: a first film abandoned to the title (debug.intro('stop')) forgets the Wick: the title is fresh again and a save writes none
      K.step('forget: a first film abandoned');
      await g(() => { window.__gw.debug.intro?.('auto', true); window.__gw.ui.showTitle(); });
      await K.titleReady();
      K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.newDescent), 'New Descent');
      await K.settle();
      K.need((await K.until("c.debug.ui().openModal === 'newdescent'", 1)).ok, 'the panel');
      await K.steps(2);
      await K.settle(400);   // (the panel fades in on the wall clock)
      await K.tap(`[data-modal=newdescent] button.gw-char[data-wick=${wick === 'wick' ? 'stub' : wick}]`);
      const ab = await g(() => { const c = window.__gw, b = window.__lp.one('[data-modal=newdescent] [data-action=start]'); if (!b) return null; b.click(); return { flow: c.flow, wick: c.debug.loop?.wick?.() ?? null }; });
      K.need(ab && ab.flow === 'intro', 'Start → the film', ab);
      await K.secs(0.8);   // (its stage may still be building: the film is stopped either way)
      await g(() => window.__gw.debug.intro?.('stop'));
      await K.until("c.flow === 'title'", 3);
      await K.titleReady();
      const back = await K.state();
      const tw2 = await K.titleWords();
      await g(() => window.__gw.game.save?.());
      const sv = await g(() => window.__lp.stored());
      K.check(back.flow === 'title' && JSON.stringify(tw2) === JSON.stringify([TL.newDescent, TL.settings.label]) && back.loop?.wick == null, 'T60: a first film abandoned to the title: the title is fresh again, the Wick forgotten', { flow: back.flow, words: tw2, wick: back.loop?.wick });
      K.check(sv?.meta?.loop ? sv.meta.loop.wick == null : true, 'T60: … and a save then writes no Wick', sv?.meta?.loop?.wick);
      await K.shoot('title-abandoned');
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
      // >>> M1 step 5b (LANE 5B-TOW): from step 5 Start with no film opens on the Landing too (OPENING §6.2): the wake there
      if (await g(() => window.__gw.data.LOOP?.tow?.opening === true && typeof window.__gw.debug.loop?.tow === 'function')) {
        const wt = await K.until("c.debug.loop.tow().phase === 'wake'", 4);
        K.check(wt.ok, 'T63 (step 5): Start with no film → one ink dip → the Landing → the wake', await g(() => window.__gw.debug.loop.tow()));
        await K.secs(0.5);
        const s5 = await K.state(), ev5 = await K.events();
        const say5 = await g(() => (document.querySelector('[data-loop=tow] .gw-murk-line')?.textContent || '').trim());
        K.check(say5 === TL.murk.wake, 'T63 (step 5): the wake line at the Landing', say5);
        K.check(s5.tut?.step === 'wake', 'T63: the tutorial at the wake', s5.tut);
        K.check(JSON.stringify(s5.intro) === JSON.stringify(intro0) && s5.intro?.seen !== true, 'T63: meta.intro untouched', { before: intro0, after: s5.intro });
        K.check(!ev5.some((e) => e.e === 'intro:start'), 'no film started');
        await K.scan('the Landing (no film)');
        await K.shoot('nofilm-landing');
        await K.noErrors('nofilm');
        throw new Abort('(step 5: the no-film Start checked at the Landing)');
      }
      // <<< M1 step 5b
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
    ok(E.goal0 === `Next: Hold ${id === 'tallow' ? 5 : 4} · ${clamText(L.hold.ladder[0].price)}`, `${id}: the first goal line (PLAN §0's D row; Hold 4's base price from the data)`, E.goal0);
    ok(E.firstChart === (id === 'tallow' ? TL.murk.firstChartBy.tallow : TL.murk.firstChart), `${id}: Murk's departure line`, E.firstChart);
    const plan = catchPlan(E.slots0);
    ok(plan.length === E.slots0 && plan.at(-1).via === 'real' && new Set(plan.map((p) => p.speciesId)).size === plan.length, `${id}: the first trip's catches`, plan);
    const sum = plan.reduce((a, p) => a + D.fishClams(D.SPECIES.find((s) => s.id === p.speciesId), p.z), 0);
    ok(sum > 0 && sum < L.hold.ladder[0].price, `${id}: the first trip pays (${sum}), but Hold 4 (${L.hold.ladder[0].price}) is more trips away (the user, 17 Nov 2026: "Make it 400 to start")`, sum);
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
  const yes = [[TL.holdFull], [TL.home], [TL.sold], [TL.yours], [TL.murk.wake], [`“${TL.murk.firstSale}”`], [TL.murk.firstChartBy.tallow], [TL.wicks.ashwick], [TL.wicks.tallow],
    ...Object.values(TL.passives || {}).map((n) => [n]), ['Next: Hold 4 · 30'], ['Next: Hold 4 ·'], ['Next: Ashwood · 50'], ['Hold 5'], ['Dusk Minnow'], ['Keeper'], ['The Mossmere'], ['Taper'], ['Prologue'],
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
  const hp = await uiLoopHelper();
  ok(hp === null || (hp('Sold', 'tally') === true && hp('Trade', 'hud') === false && hp('New Descent', 'pause') === false), 'ui-loop\'s helper: absent, or it agrees on plain cases', hp ? 'loaded' : 'absent');
  ok((await goalLineText(TL, L.wicks, { id: 'hold:4', name: 'Hold 4', price: 30, slot: 'hold', level: 4 }, 'tallow')) === 'Next: Hold 5 · 30', 'goalLineText: Tallow\'s first goal (ui-loop\'s goalLine when present)');
  ok((await goalLineText(TL, L.wicks, { id: 'rod:1', name: 'Ashwood', price: 50, slot: 'rod', level: 1 }, 'wick')) === 'Next: Ashwood · 50', 'goalLineText: a tackle goal');
  // the in-page driver on a fake page: the held frames, the synthetic clock (and performance.now on it), the task boundary after
  // each frame (a glide's promise ends it inside the same `until`), the event record, the dry frame when nothing is queued
  const drv = await driverSelfTest();
  for (const [msg, c, x] of drv) ok(c, `driver: ${msg}`, x);
  console.log(`loop-1a dry run: ${n - bad.length}/${n} checks passed`);
  for (const b of bad) console.log('  FAIL', b);
  return bad.length;
}
/** installDriver on a fake page (node globals standing in for the window): → [[msg, ok, extra]]. */
async function driverSelfTest() {
  const out = [], G = globalThis, saved = {};
  for (const k of ['window', 'requestAnimationFrame', 'localStorage', 'confirm', '__gw', '__lp']) saved[k] = Object.getOwnPropertyDescriptor(G, k);
  const realNow = performance.now.bind(performance);
  try {
    const handlers = {}, store = {};
    const bus = { on: (e, f) => { (handlers[e] = handlers[e] || []).push(f); }, emit: (e, p) => { for (const f of handlers[e] || []) f(p); } };
    // a game: each frame asks for the next first (as main does); a 3 s glide whose promise's job emits home:enter
    const game = { frames: 0, dts: [], uiDts: [], last: null, uiLast: null, glide: null };
    const frame = (now) => {
      G.requestAnimationFrame(frame);
      if (game.last !== null) game.dts.push((now - game.last) / 1000);
      game.last = now;
      const u = performance.now();
      if (game.uiLast !== null) game.uiDts.push((u - game.uiLast) / 1000);
      game.uiLast = u;
      game.frames++;
      if (game.glide && (game.glide.t += 1 / 30) >= 3 - 1e-9) { const r = game.glide.resolve; game.glide = null; r(); }
    };
    G.window = G;
    G.requestAnimationFrame = (cb) => setTimeout(() => cb(realNow()), 5);
    G.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } };
    G.__gw = { bus, errors: [], flow: 'home', render: { render() {} }, debug: { ui: () => ({ openModal: null, stack: [] }) }, state: { meta: {}, run: null } };
    G.requestAnimationFrame(frame);
    const r = (new Function(`return (${installDriver.toString()})`))()(WATCH);
    out.push(['installs', r === 'ok', r]);
    const T = G.__lp;
    T.hold();
    for (let i = 0; i < 200 && !(T.held && T.held.length); i++) await new Promise((res) => setTimeout(res, 5));
    out.push(['a frame is queued once held', T.held.length > 0, T.held.length]);
    const f0 = game.frames;
    const ran = await T.step(30);
    out.push(['30 frames step on the held clock', ran === 30 && game.frames - f0 === 30, { ran, frames: game.frames - f0 }]);
    out.push(['every frame is 1/30 s of the game\'s clock', game.dts.slice(-29).every((d) => Math.abs(d - 1 / 30) < 1e-6), game.dts.slice(-3)]);
    out.push(['performance.now follows the held clock', game.uiDts.slice(-29).every((d) => Math.abs(d - 1 / 30) < 1e-6), game.uiDts.slice(-3)]);
    // the glide ends inside an until: its promise job runs before the next frame, so home:enter is seen on time
    new Promise((resolve) => { game.glide = { t: 0, resolve }; }).then(() => bus.emit('home:enter', { from: 'intro' }));
    const s0 = T.sim;
    const u = await T.until("T.ev.some((e) => e.e === 'home:enter')", 6);
    const he = T.ev.find((e) => e.e === 'home:enter');
    out.push(['until sees a promise job of a frame (the glide\'s end) on time', u.ok && Math.abs(u.t - 3) < 0.05 && Math.abs(he.sim - s0 - 3) < 0.05, { u, at: he && he.sim - s0 }]);
    out.push(['the event record carries its payload', he?.p?.from === 'intro' && he?.flow === 'home', he]);
    const nope = await T.until('false', 0.5);
    out.push(['until gives up at its limit', nope.ok === false && Math.abs(nope.t - 0.5) < 0.05, nope]);
    // release: the clock never runs backwards, and frames run on their own again
    const c0 = T.clock;
    T.release();
    const f1 = game.frames;
    await new Promise((res) => setTimeout(res, 80));
    out.push(['released, the game runs on the wall clock again', game.frames > f1 && performance.now() >= c0, { frames: game.frames - f1 }]);
    out.push(['no dt ever negative', game.dts.every((d) => d >= 0) && game.uiDts.every((d) => d >= 0), Math.min(...game.dts, ...game.uiDts)]);
    T.hold();
    await new Promise((res) => setTimeout(res, 30));
    out.push(['window.confirm is counted and refused', G.confirm() === false && T.confirms === 1, T.confirms]);
  } catch (e) {
    out.push(['the self-test ran', false, String(e?.stack || e)]);
  } finally {
    try { if (G.__lp) G.__lp.held = null; } catch { /* ignore */ }
    for (const [k, d] of Object.entries(saved)) { if (d) Object.defineProperty(G, k, d); else delete G[k]; }
    try { delete performance.now; } catch { /* ignore */ }
  }
  return out;
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
