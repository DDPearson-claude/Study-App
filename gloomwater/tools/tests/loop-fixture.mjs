// tools/tests/loop-fixture.mjs — the Full Hold's shared test fixture (slice-1a PLAN §2.0, §3; owned by lane A). Lanes B and C import
// it from their first commit, so their tests read the real loop data and pass a working stand-in where `ctx.progression.loop` goes:
//   loadLoopData()        sets GW_V3 = true, GW_V3_PHASE = 1, GW_LOOP = true and imports src/data.js?loop (a module instance of its
//                         own; the flags stay set, as a loop build's page has them, so modules a test imports next see the loop too)
//   freshLoopMeta(D)      core.defaultMeta() with a fresh meta.loop (progression-loop.freshLoop)
//   tripRun(D, over)      a trip run as createTrip builds it (PLAN §2.1 item 6): outing 'trip', night mode 'still', the hold empty
//   fakeLoop(over)        an in-memory object with every method of PLAN §3.3 (LOOP_METHODS), working on its own small state, with
//                         a call log. `over`: `D` (the loop data, for the real helpers and words), `state` (initial state), any
//                         state key directly (holdSlots, wick, tutorial, clams, onTrip, …), any method to replace, and `bus` (a
//                         core.createBus(): the shelf's session then ends on ui:modal {id: 'shelf'} and home:enter, as the real one's).
//                         It follows CONTRACT §14.4 where a view can tell (lastTrip carries `zone`; sayOnce('firstChart') is the
//                         Wick's own count); progression's own tests run the real createLoop (loop-trip.test.mjs).
// Nothing here is used by the game. Run as a script it checks itself: node tools/tests/loop-fixture.mjs
import { pathToFileURL } from 'node:url';
import { defaultMeta } from '../../src/core.js';
import { freshLoop, LOOP_METHODS, tallyLines, shelfItems, goalOf, listCount as listCountOf } from '../../src/progression-loop.js';

/** The loop's data module (GW_V3, GW_V3_PHASE 1, GW_LOOP), cached per query. */
export async function loadLoopData({ query = 'loop' } = {}) {
  globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_LOOP = true;
  return import(`../../src/data.js?${query}`);
}

/** A fresh meta with a fresh meta.loop (no Wick, no tutorial, no evening: the title's "fresh" save). */
export function freshLoopMeta(D) {
  return { ...defaultMeta(), loop: freshLoop(D) };
}

let tripN = 0;
/** A trip run (PLAN §2.1 item 6, §3.4): the built run skeleton with the trip's fields. `over` is merged on top (its `flags` into the
 *  run's flags); `over.metaLoop` sets the evening (evenings + 1) and the bait bag of the trip's water. */
export function tripRun(D, over = {}) {
  const { metaLoop = null, flags = {}, ...rest } = over || {};
  const zone = rest.zone ?? 'mossmere';
  const wickOf = typeof D?.loopWickId === 'function' ? D.loopWickId : (id) => id ?? 'wick';
  const base = (k, d) => D?.STATS?.[k]?.base ?? d;
  const r = {
    active: true, id: `run_trip_${(++tripN).toString(36)}`, seed: 1, playTime: 0, character: wickOf(rest.character ?? metaLoop?.wick ?? null),
    day: 1, phase: 'calm', phaseTime: 0, hp: base('maxHp', 5), oil: base('maxOil', 100), satiety: base('maxSatiety', 100),
    zone, zonesUnlocked: [zone], gateOpen: false,
    shells: 0, bait: { ...(metaLoop?.bait?.[zone] || {}) }, equippedBait: null, creel: [], upgrades: {}, legendaries: {}, bounties: [],
    level: 1, xp: 0, xpNext: D?.xpForLevel?.(1) ?? 5, boons: {}, rerollsUsed: 0, stats: {},
    flags: {
      zoneEnteredDay: 1, streak: 0, mercy: 0, heartwax: 0, wounded: {},
      nights: 0, nightActive: false, nightSlain: 0, maxNightSlain: 0, nightCatch: 0, maxNightCatch: 0,
      nightDamaged: false, nightFlares: 0, perfectHooks: 0, bestStreak: 0, slain: 0, elites: 0, bosses: 0, landed: 0,
      deepestEndured: -1, bountiesDone: 0, bountyMemories: 0, challengesDone: [], records: [], ch: {}, startDeepest: 0,
      nightLog: [], openBite: null, openComeback: false, taperFirst: false,
    },
    outing: 'trip', nightMode: 'still', tally: { dawns: 0, stillNights: 0, swarmNights: 0 }, lures: {}, equipped: null,
    bites: {}, mercy: {}, evening: metaLoop ? Math.max(0, Number(metaLoop.evenings) || 0) + 1 : 1, comeback: null,
  };
  Object.assign(r, rest);
  Object.assign(r.flags, flags);
  return r;
}

/** An in-memory `ctx.progression.loop` for B's and C's tests (every method of PLAN §3.3; see the header). */
export function fakeLoop(over = {}) {
  const { D = null, state = {}, bus = null, ...rest } = over || {};
  const methods = {}, plain = {};
  for (const [k, v] of Object.entries(rest)) (typeof v === 'function' ? methods : plain)[k] = v;
  const s = {
    clams: 0, evenings: 0, holdSlots: 3, tackle: { rod: 0, line: 0, reel: 0 }, maps: { lakes: ['mossmere'], places: [] },
    wick: null, tutorial: null, said: {}, lastTrip: null, parkedRun: null, journal: {},
    onTrip: true, runId: 'run_fake', zone: 'mossmere', evening: 1, fish: [], pending: [], bites: {}, mercy: {},
    openBite: null, openComeback: false, taperFirst: false, comeback: null, session: [], saves: 0,
    ...state, ...plain,
  };
  const calls = [];
  const T = D?.TEXT_LOOP || null;
  const wickId = (id) => (typeof D?.loopWickId === 'function' ? D.loopWickId(id) : ['wick', 'taper', 'stub', 'tallow', 'ashwick'].includes(id) ? id : 'wick');
  const passive = () => D?.LOOP?.wicks?.[wickId(s.wick)]?.passive ?? { wick: 'curious', taper: 'long_reach', stub: 'moth_bright', tallow: 'broad_back', ashwick: 'burns_back' }[wickId(s.wick)];
  const slots = () => (typeof D?.wickSlots === 'function' ? D.wickSlots(s.holdSlots, s.wick) : s.holdSlots + (wickId(s.wick) === 'tallow' ? 1 : 0));
  const keyOf = (place, zone = s.zone) => (typeof D?.loopWaterKey === 'function' ? D.loopWaterKey(place, zone) : place ? String(place) : `open:${zone}`);
  const good = (key) => {
    if (s.good != null) return typeof s.good === 'function' ? s.good(key) : s.good;
    const kind = String(key).startsWith('open:') ? 'open' : (s.placeKinds?.[key] ?? 'day');
    if (typeof D?.goodBitesFor === 'function') return D.goodBitesFor({ kind, holdSlots: s.holdSlots, wickId: s.wick });
    const tallow = wickId(s.wick) === 'tallow';
    return kind === 'open' ? slots() + 1 + (tallow ? 1 : 0) : 2 + (tallow ? 1 : 0);
  };
  const quiet = (over, wick) => (typeof D?.quietTerms === 'function' ? D.quietTerms(over, wick)
    : { over, favour: over > 0 ? Math.max(-1.2, -0.15 * over) : 0, waitMult: Math.min(2.2, 1 + 0.3 * over) });
  const spent = (key) => s.bites[key] | 0;
  const price = (f) => {
    if (Number.isFinite(Number(f?.clams))) return Number(f.clams);
    const sp = D?.SPECIES_BY_ID?.[f?.speciesId];
    return (sp && typeof D?.fishClams === 'function' ? D.fishClams(sp, f.z) : null) ?? 1;
  };
  const metaLoop = () => ({ v: 3, clams: s.clams, evenings: s.evenings, holdSlots: s.holdSlots, tackle: { ...s.tackle }, maps: s.maps,
    wick: s.wick, tutorial: s.tutorial, said: s.said, lastTrip: s.lastTrip, ...(s.parkedRun ? { parkedRun: s.parkedRun } : {}) });
  const items = () => (D ? shelfItems(D, metaLoop(), s.session) : [
    { id: 'rod:1', tab: 'tackle', slot: 'rod', level: 1, name: 'Ashwood', goalName: 'Ashwood', line: '', price: 50, bought: s.session.includes('rod:1') },
    { id: 'hold:4', tab: 'raft', slot: 'hold', level: 4, name: 'Lidded Creel', goalName: 'Hold 4', line: '', price: 30, bought: s.session.includes('hold:4') },
  ]);

  const api = {
    state: () => metaLoop(),
    hold: () => ({ slots: slots(), fish: s.onTrip ? s.fish : [], full: api.holdFull() }),
    holdFull: () => s.onTrip && s.fish.length >= slots(),
    priceOf: (f) => price(f),
    saleOf: (f) => { const b = price(f); return { base: b, clams: b, first: false }; },
    keep(f) {
      if (api.holdFull()) return { ok: false, full: true, msg: T?.holdFull ?? "Hold's full.", gained: { clams: 0 } };
      const clams = price(f); if (f && typeof f === 'object') f.clams = clams;
      s.fish.push(f); s.pending = s.pending.filter((p) => p !== f);
      return { ok: true, msg: '', gained: { clams } };
    },
    letGo(f) {
      const key = f?.waterKey ?? keyOf(f?.place ?? null);
      s.bites[key] = Math.max(0, spent(key) - 1);
      const favour = 0.2; s.mercy[key] = Math.min(0.4, (s.mercy[key] || 0) + favour);
      s.pending = s.pending.filter((p) => p !== f);
      return { ok: true, msg: '', gained: { bite: 1, favour } };
    },
    noteBite(e = {}) {
      const key = e.waterKey ?? keyOf(null);
      s.bites[key] = spent(key) + 1;
      if (e.reason !== 'spooked') s.openBite = key;
      if (e.comeback === true) s.openComeback = true;
    },
    bitesSpent: (key) => spent(key),
    bitesLeft: (key) => Math.max(0, good(key) - spent(key)),
    favour(key) {
      const n = spent(key), g = good(key), q = quiet(Math.max(0, n + 1 - g), s.wick);
      return { favour: q.favour, waitMult: q.waitMult, over: q.over, good: g, spent: n, mercy: s.mercy[key] || 0, quiet: n >= g };
    },
    closeBite() { s.openBite = null; s.openComeback = false; },
    refundOpenBite() {
      const key = s.openBite; if (!key) return false;
      s.openBite = null;
      if (s.pending.some((p) => (p?.waterKey ?? keyOf(p?.place ?? null)) === key)) return false;
      s.bites[key] = Math.max(0, spent(key) - 1);
      return true;
    },
    debugGive(n) { s.clams += Math.max(0, Number(n) || 0); return s.clams; },
    isOpen: (waterId) => (s.maps.lakes || []).includes(waterId),
    listCount: (waterId) => (D ? listCountOf({ journal: s.journal }, D, waterId) : { have: 0, need: 6 }),
    createTrip({ startZone = 'mossmere', character = null } = {}) {
      s.onTrip = true; s.zone = (s.maps.lakes || []).includes(startZone) ? startZone : s.maps.lakes[0];
      s.fish = []; s.pending = []; s.bites = {}; s.mercy = {}; s.openBite = null; s.openComeback = false; s.taperFirst = false; s.comeback = null;
      const r = tripRun(D, { zone: s.zone, character: character ?? s.wick, metaLoop: metaLoop() });
      s.runId = r.id; s.evening = r.evening; r.creel = s.fish; r.bites = s.bites; r.mercy = s.mercy;
      return r;
    },
    endTrip() {
      if (!s.onTrip) return null;
      if (s.lastTrip?.id === s.runId) return { ...s.lastTrip, already: true };
      for (const f of s.fish) if (f && typeof f === 'object' && !Number.isFinite(Number(f.clams))) f.clams = price(f);
      const lines = tallyLines(s.fish, { D, saleOf: api.saleOf }), total = lines.reduce((a, l) => a + l.clams, 0);
      s.clams += total; s.evenings += 1;
      s.lastTrip = { id: s.runId, evening: s.evening, zone: s.zone, total, lines, seen: false };
      s.fish = []; s.pending = []; s.openBite = null; s.onTrip = false; s.saves++;
      return { ...s.lastTrip };
    },
    lastTrip: () => s.lastTrip,
    markTallySeen(id) { if (s.lastTrip && s.lastTrip.id === id) s.lastTrip.seen = true; },
    shelf() {
      const all = items();
      return { tabs: ['tackle', 'raft'].map((id) => ({ id, items: all.filter((i) => i.tab === id) })).filter((t) => t.items.length) };
    },
    goal: () => goalOf(items()),
    buy(itemId) {
      const id = itemId === 'hold' ? `hold:${s.holdSlots + 1}` : String(itemId);
      const it = items().find((i) => i.id === id && !i.bought);
      if (!it || s.clams < it.price) return { ok: false, msg: '', clams: s.clams };
      s.clams -= it.price;
      if (it.slot === 'hold') s.holdSlots = it.level; else s.tackle[it.slot] = it.level;
      s.session.push(id); s.saves++;
      return { ok: true, msg: '', clams: s.clams };
    },
    sayOnce(id) {
      if (id === 'sailOut') {
        const lines = T?.murk?.sailOut ?? ['sailOut'], i = (s.said.sailOut | 0) % lines.length;
        s.said.sailOut = (i + 1) % lines.length; return lines[i];
      }
      if (s.said[id]) return null;
      s.said[id] = true;
      if (id === 'firstChart') return T?.murk?.firstChartBy?.[wickId(s.wick)] ?? T?.murk?.firstChart ?? id;
      return T?.murk?.[id] ?? id;
    },
    parkRun(run) { if (run && typeof run === 'object') s.parkedRun = run; },
    wick: () => wickId(s.wick),
    setWick(id) { s.wick = id == null ? null : wickId(id); return s.wick; },
    tutorial: () => s.tutorial,
    beginTutorial() { if (!s.tutorial) s.tutorial = { done: false, step: 'arrive' }; return s.tutorial; },
    setTutorialStep(id) { if (s.tutorial && !s.tutorial.done) s.tutorial.step = id ?? null; },
    tutorialDone() { s.tutorial = { done: true, step: null }; s.said.firstChart = true; s.saves++; },
    taperFirstOpen: () => s.onTrip && passive() === 'long_reach' && !s.taperFirst,
    spendTaperFirst() { if (!api.taperFirstOpen()) return false; s.taperFirst = true; return true; },
    comeback: (key) => (s.onTrip && s.comeback && s.comeback.waterKey === key ? { ...s.comeback } : null),
    consumeComeback() { const c = s.comeback; s.comeback = null; return c ? { ...c } : null; },
  };
  Object.assign(api, methods);
  if (bus && typeof bus.on === 'function') {
    bus.on('ui:modal', (e) => { if (e?.id === 'shelf') s.session = []; });
    bus.on('home:enter', () => { s.session = []; });
  }
  const fake = { calls, s };
  for (const name of Object.keys(api)) {
    const fn = api[name];
    fake[name] = (...args) => { calls.push({ name, args }); return fn.apply(fake, args); };
  }
  return fake;
}

/** The names of fakeLoop's methods that PLAN §3.3 lists (every one of LOOP_METHODS). */
export const FAKE_METHODS = LOOP_METHODS;

// ---- run as a script: the fixture checks itself (the loop data loads in node; fakeLoop carries every method)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const D = await loadLoopData();
  const fails = [];
  const ok = (c, m) => { if (!c) fails.push(m); };
  ok(D.LOOP_ENABLED === true && D.V3_ENABLED === true && D.V3_PHASE === 1, 'loadLoopData: the loop build (v3, phase 1, loop on)');
  ok(Object.keys(D.PARKED).length === 31 && D.TEXT.loop === D.TEXT_LOOP, 'loadLoopData: PARKED and TEXT.loop');
  const m = freshLoopMeta(D);
  ok(m.loop.holdSlots === 3 && m.loop.wick === null && m.loop.tutorial === null && m.runs === 0, 'freshLoopMeta');
  const r = tripRun(D, { metaLoop: m.loop });
  ok(r.outing === 'trip' && r.nightMode === 'still' && r.evening === 1 && r.character === 'wick' && Array.isArray(r.creel), 'tripRun');
  for (const fl of [fakeLoop(), fakeLoop({ D })]) for (const k of LOOP_METHODS) ok(typeof fl[k] === 'function', `fakeLoop has ${k}`);
  const f = fakeLoop({ D, wick: 'tallow' });
  ok(f.hold().slots === 4 && f.bitesLeft('open:mossmere') === 6, 'fakeLoop: Tallow has 4 slots and 6 good bites');
  console.log(fails.length ? fails.map((x) => '  FAIL: ' + x).join('\n') : `loop-fixture: ok (${LOOP_METHODS.length} methods)`);
  process.exit(fails.length ? 1 : 0);
}
