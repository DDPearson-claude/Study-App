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
//                         Wick's own count); progression's own tests run the real createLoop (loop-trip.test.mjs). M1 step 3a's
//                         methods (PLAN §3.5) work on the same state: `fitted` {lure, bait}, `bag` {baitId: n} (the trip's water's),
//                         `lifted`, `marked` {speciesId: 1}, `best`, `chartPick`, `maps.places`; mapCards, seals and catalogue go
//                         through the real pure functions (they need `D`).
//   placesMeta(D, o)      M1 step 3a (PLAN §3.5): a meta with places owned and lifted, Heartmoss Balls in the Mossmere's bag, the hold
//                         and tackle set and Journal entries caught: o = {own, lifted (= own), balls, holdSlots, tackle, caught}
// Nothing here is used by the game. Run as a script it checks itself: node tools/tests/loop-fixture.mjs
import { pathToFileURL } from 'node:url';
import * as LF from '../../src/loop-finds.js';   // M1 step 5c (lane 5C): the finds' pure rules, for fakeLoop's finds methods
import { defaultMeta } from '../../src/core.js';
import { freshLoop, LOOP_METHODS, LOOP_SCHEMA, tallyLines, shelfItems, goalOf, listCount as listCountOf, mapCards as mapCardsOf, sealsOf, catalogueFor,
  liftDue as liftDueOf } from '../../src/progression-loop.js';
import { notePrint as notePrintOf, printsView, galleryModel } from '../../src/home-prints.js';   // M1 step 5b (lane 5b-home)
import { sheetModel, sheetKeys } from '../../src/loop-sheet.js';   // the Wick's sheet (SHEET.md §7): the real pure model on the fake's state

/** The loop's data module (GW_V3, GW_V3_PHASE 1, GW_LOOP), cached per query. */
export async function loadLoopData({ query = 'loop' } = {}) {
  globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_LOOP = true;
  return import(`../../src/data.js?${query}`);
}

/** A fresh meta with a fresh meta.loop (no Wick, no tutorial, no evening: the title's "fresh" save). */
export function freshLoopMeta(D) {
  return { ...defaultMeta(), loop: freshLoop(D) };
}

/** M1 step 3a (PLAN §3.5): a meta that has played (the Wick chosen, the tutorial done, one evening) with `own` place maps owned and
 *  `lifted` lifted (default: all of `own`), `balls` Heartmoss Balls in the Mossmere's bag, the hold's bought slots and the tackle set,
 *  and each id of `caught` landed once in the Journal. */
export function placesMeta(D, { own = [], lifted = own, balls = 0, holdSlots = 5, tackle = { rod: 1, line: 1, reel: 1 }, caught = [] } = {}) {
  const m = freshLoopMeta(D), L = m.loop;
  Object.assign(L, { wick: 'wick', tutorial: { done: true, step: null }, evenings: 1, holdSlots, tackle: { rod: 0, line: 0, reel: 0, ...tackle } });
  L.maps.places = own.slice();
  L.lifted = lifted.filter((id) => own.includes(id));
  const ball = D?.LOOP?.legendBait?.mossmere?.id ?? 'heartmoss';
  if (balls > 0) L.bait.mossmere = { ...(L.bait.mossmere || {}), [ball]: balls };
  for (const id of caught) m.journal[id] = { caught: 1, biggest: 0, firstDay: 1, firstRun: 1 };
  return m;
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
    // M1 step 3a
    fitted: { lure: null, bait: null }, bag: {}, lifted: [], marked: {}, best: {}, chartPick: null,
    barge: { water: 'mossmere', towed: [] },
    finds: { got: {}, worn: {}, share: {} },   // M1 step 5c
    sheetSeen: [], lures: [], raft: { oars: 0, keel: 0, lantern: 0 }, home: { orders: 0, baitBed: 0, wall: 0, lights: 0 }, looks: [],   // the Wick's sheet
    ...state, ...plain,
  };
  if (!Array.isArray(s.maps.places)) s.maps = { ...s.maps, places: [] };
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
  const metaLoop = () => ({ v: LOOP_SCHEMA, clams: s.clams, evenings: s.evenings, holdSlots: s.holdSlots, tackle: { ...s.tackle }, maps: s.maps,
    wick: s.wick, tutorial: s.tutorial, said: s.said, lastTrip: s.lastTrip, barge: { water: s.barge.water, towed: [...s.barge.towed] }, ...(s.parkedRun ? { parkedRun: s.parkedRun } : {}),
    fitted: { ...s.fitted }, bait: { [s.zone]: { ...s.bag } }, lifted: s.lifted.slice(), best: s.best, chartPick: s.chartPick,
    giants: Object.fromEntries(Object.entries(s.marked).map(([id, n]) => [id, { landed: 0, marked: n }])), finds: s.finds,
    sheetSeen: s.sheetSeen.slice(), lures: s.lures.slice(), raft: { ...s.raft }, home: { ...s.home }, looks: s.looks.slice(),
    found: { rod: null, line: null, reel: null, ...(s.found || {}) } });
  const metaNow = () => ({ journal: s.journal, loop: metaLoop() });
  const items = () => (D ? shelfItems(D, metaLoop(), s.session, { meta: metaNow() }) : [
    { id: 'rod:1', tab: 'tackle', slot: 'rod', level: 1, name: 'Ashwood', goalName: 'Ashwood', line: '', price: 50, bought: s.session.includes('rod:1') },
    { id: 'hold:4', tab: 'raft', slot: 'hold', level: 4, name: 'Lidded Creel', goalName: 'Hold 4', line: '', price: 30, bought: s.session.includes('hold:4') },
  ]);

  const api = {
    state: () => metaLoop(),
    // M1 step 5c (lane 5C): the finds on the same state, through the real pure rules (they need `D`)
    snagRoll({ legendCast = false, tutorial = false, rng = Math.random, force = null } = {}) {
      if (!s.onTrip || !D) return null;
      if (typeof force === 'string') { const it = LF.findById(D, force); return it && it.water === s.zone && !(it.kind !== 'treasure' && LF.owned(metaLoop(), force)) ? force : null; }
      const p = LF.snagChance(D, { evening: s.evening, legendCast, tutorial });
      if (!(p > 0) || !(rng() < p)) return null;
      return LF.drawFind(LF.findShares(metaNow(), D, s.zone, { exclude: s.fish.filter((f) => f?.find).map((f) => f.find) }), rng());
    },
    noteFound({ findId, waterKey = null } = {}) {
      if (!D || !LF.findById(D, findId)) return null;
      LF.noteSnag(metaLoop(), D, s.zone, findId); s.openBite = null;
      return LF.holdEntry(D, findId, { uid: `find_fake_${s.fish.length}_${calls.length}`, waterKey: waterKey || keyOf(null) });
    },
    restoreFind: () => null,
    keepFind(e) {
      if (!e || typeof e.find !== 'string') return { ok: false, msg: '', gained: { clams: 0 } };
      if (api.holdFull()) return { ok: false, full: true, msg: T?.holdFull ?? "Hold's full.", gained: { clams: 0 } };
      s.fish.push({ ...e }); s.saves++; return { ok: true, msg: '', gained: { clams: e.kind === 'treasure' ? e.clams : 0 } };
    },
    letGoFind(e) {
      const key = e?.waterKey || keyOf(null), n = Math.max(0, s.bites[key] | 0), back = Math.min(1, n);
      s.bites[key] = n - back; return { ok: true, msg: '', gained: { bite: back, favour: 0 } };
    },
    finds: () => s.finds,
    findShares: (waterId = s.zone) => (D ? LF.findShares(metaNow(), D, waterId) : {}),
    findCatalogue: (waterId = 'mossmere') => (D ? LF.findCatalogue(metaNow(), D, waterId) : null),
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
    listCount: (waterId) => (D ? listCountOf({ journal: s.journal }, D, waterId) : { have: 0, need: 11 }),
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
      return { tabs: ['tackle', 'raft', 'bait', 'maps', 'home'].map((id) => ({ id, items: all.filter((i) => i.tab === id) })).filter((t) => t.items.length) };
    },
    goal: () => goalOf(items()),
    buy(itemId) {
      const id = itemId === 'hold' ? `hold:${s.holdSlots + 1}` : String(itemId);
      const it = items().find((i) => i.id === id && !i.bought);
      if (!it || it.sealed || it.price == null || s.clams < it.price) return { ok: false, msg: '', clams: s.clams };
      s.clams -= it.price;
      if (it.slot === 'hold') s.holdSlots = it.level;
      else if (it.slot === 'place') s.maps = { ...s.maps, places: [...(s.maps.places || []), it.placeId] };
      else if (it.slot === 'bait') s.bag[it.baitId] = (s.bag[it.baitId] | 0) + 1;
      else s.tackle[it.slot] = it.level;
      if (!it.consumable) s.session.push(id);
      s.saves++;
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
    resetTutorial() { s.tutorial = { done: false, step: 'arrive' }; delete s.said.firstChart; return { ...s.tutorial }; },
    taperFirstOpen: () => s.onTrip && passive() === 'long_reach' && !s.taperFirst,
    spendTaperFirst() { if (!api.taperFirstOpen()) return false; s.taperFirst = true; return true; },
    comeback: (key) => (s.onTrip && s.comeback && s.comeback.waterKey === key ? { ...s.comeback } : null),
    consumeComeback() { const c = s.comeback; s.comeback = null; return c ? { ...c } : null; },
    // M1 step 3a (PLAN §3.2): the bait slot, the ball, the lift, the Marked giant, the best fish there, the pick, cards, seals, catalogue
    fit(slot, id) {
      if (slot !== 'bait' && slot !== 'lure') return { ok: false };
      if (id != null && slot === 'bait' && !(s.bag[id] > 0)) return { ok: false };
      s.fitted = { ...s.fitted, [slot]: id ?? null }; s.saves++;
      return { ok: true };
    },
    fitted: () => ({ ...s.fitted }),
    spendBait(id) { if (!(s.bag[id] > 0)) return false; s.bag[id] -= 1; return true; },
    refundBait(id) { s.bag[id] = (s.bag[id] | 0) + 1; return true; },
    liftDue: () => (D ? liftDueOf(D, metaLoop()) : (s.maps.places || []).filter((id) => !s.lifted.includes(id))),
    markLifted(id) { if (typeof id !== 'string' || s.lifted.includes(id)) return false; s.lifted.push(id); s.saves++; return true; },
    lifted: () => s.lifted.slice(),
    markGiant(id) { if (typeof id !== 'string') return false; s.marked[id] = 1; return true; },
    takeGiantMark(id) { if (!s.marked[id]) return false; s.marked[id] = 0; return true; },
    noteBest(fish, key) {
      if (!fish || typeof key !== 'string') return false;
      const prev = s.best[key];
      if (prev && Number(prev.length) >= Number(fish.length)) return false;
      s.best[key] = { speciesId: fish.speciesId ?? null, length: Number(fish.length) || 0 }; return true;
    },
    setPick({ water = 'mossmere', place = null } = {}) {
      if (place != null && !(s.maps.places || []).includes(place)) return { ok: false };
      s.chartPick = { water, place }; return { ok: true };
    },
    pick: () => (s.chartPick && typeof s.chartPick === 'object' ? { water: s.chartPick.water ?? null, place: s.chartPick.place ?? null } : null),
    mapCards: () => (D ? mapCardsOf(D, metaLoop(), { meta: metaNow() }) : []),
    seals: (waterId = 'sporewood') => (D ? sealsOf(metaNow(), D, waterId) : null),
    catalogue: (waterId = 'mossmere') => (D ? catalogueFor(metaNow(), D, waterId) : null),
    // M1 step 5b (lane 5b-home): the print at the measure, the Prints page, the gallery (the real pure functions on the fake's meta)
    notePrint(fish, sp = null, cls = null) { const L5 = { prints: s.prints5b || (s.prints5b = {}) }; return D ? notePrintOf(L5, D, fish, { sp, cls, evening: 1 }) : { best: false, first: false }; },
    prints: () => (D ? printsView({ journal: s.journal, loop: { ...metaLoop(), prints: s.prints5b || {} } }, D, ['mossmere']) : { cards: [], count: 0, of: 0 }),
    gallery: () => (D ? galleryModel({ journal: s.journal, loop: { ...metaLoop(), prints: s.prints5b || {}, home: { wall: s.wall5b | 0 } } }, D) : { wings: [], eave: null, owned: 0 }),
    barge: () => ({ water: s.barge.water, towed: [...s.barge.towed] }),
    towBarge(w) { if (typeof w !== 'string' || !w) return null; s.barge.water = w; if (!s.barge.towed.includes(w)) s.barge.towed.push(w); s.saves++; return api.barge(); },
    // M1 step 4 (lane 4): Murk's orders (s.orders: [{id, speciesId, kind, n, have, text?}]) and Cut Strip (s.bag.cut_strip)
    orders: () => (Array.isArray(s.orders) ? s.orders.map((o) => ({ ...o })) : []),
    wipeOrder(id) { const before = (s.orders || []).length; s.orders = (s.orders || []).filter((o) => o.id !== id); return { ok: s.orders.length < before, orders: api.orders() }; },
    orderFor: (fish) => (Array.isArray(s.orders) ? s.orders.find((o) => o.speciesId === fish?.speciesId)?.id ?? null : null),
    // Murk says each new order once (the user, 17 Nov 2026): "Bring me …" for the orders not yet said, marked said
    sayOrders() { const fresh = (s.orders || []).filter((o) => o.said !== true); if (!fresh.length) return null; for (const o of fresh) o.said = true; s.saves++; return `Bring me ${fresh.map((o) => o.text || o.speciesId).join(' and ')}.`; },
    // the Wick's sheet (SHEET.md §7.3): the real model on the fake's meta (a trip's run when s.run is set), the marks seen
    sheet: (view = {}, live = null, cast = null) => (D ? sheetModel(metaNow(), D, { run: s.run || null, view, live, cast, shelf: items(), canChange: !(s.onTrip && s.fishOn === true) }) : null),
    markSheetSeen(keys = []) { const own = new Set(D ? sheetKeys(metaLoop(), D) : []); for (const k of keys || []) if (own.has(k) && !s.sheetSeen.includes(k)) s.sheetSeen.push(k); s.saves++; return true; },
    cutBait(fish) { if (!fish || !['small', 'keeper'].includes(fish.sizeClass)) return { ok: false, gained: { strips: 0 } }; s.bag.cut_strip = (s.bag.cut_strip | 0) + 3; return { ok: true, gained: { strips: 3 } }; },
    // TK (the tackle tin, CONTRACT §14.19): may the hook change (refused while s.fishOn on a trip), and the change (the fit's rules)
    canChangeHook: () => !(s.onTrip && s.fishOn === true),
    changeHook({ bait, lure } = {}) {
      if (s.onTrip && s.fishOn === true) return { ok: false, reason: 'fish' };
      if (bait != null && !(s.bag[bait] > 0)) return { ok: false, reason: 'bait' };
      const before = JSON.stringify(s.fitted);
      if (bait !== undefined) s.fitted = { ...s.fitted, bait: bait ?? null };
      if (lure !== undefined) s.fitted = { ...s.fitted, lure: lure ?? null };
      const changed = JSON.stringify(s.fitted) !== before;
      if (changed) s.saves++;
      return { ok: true, changed, reeled: false, bait: s.fitted.bait, lure: s.fitted.lure, count: s.fitted.bait ? s.bag[s.fitted.bait] | 0 : 0 };
    },
    // lost tackle (LOST-TACKLE §2.1): a found rod, line or reel fitted in its slot, or taken off (the ledger's rules: changeHook's)
    fitFound(slot, id) {
      if (s.onTrip && s.fishOn === true) return { ok: false, reason: 'fish' };
      if (!s.found) s.found = { rod: null, line: null, reel: null };
      const next = id ?? null, changed = (s.found[slot] ?? null) !== next;
      s.found[slot] = next; if (changed) s.saves++;
      return { ok: true, changed, slot, id: next, reeled: false };
    },
    unfitFound(slot) { return this.fitFound(slot, null); },
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
  // M1 step 3a: the new methods on the real pure functions, and placesMeta
  const g = fakeLoop({ D, maps: { lakes: ['mossmere'], places: ['lily_maze'] }, bag: { heartmoss: 1 } });
  ok(g.mapCards().map((c) => c.id).join() === 'place:under_the_span,place:buoy_lights,lake:sporewood' && g.liftDue().join() === 'lily_maze', 'fakeLoop: mapCards and liftDue');
  ok(g.fit('bait', 'heartmoss').ok && g.fitted().bait === 'heartmoss' && g.spendBait('heartmoss') && !g.spendBait('heartmoss') && g.refundBait('heartmoss'), 'fakeLoop: fit, spendBait, refundBait');
  ok(!g.setPick({ water: 'mossmere', place: 'bell_pool' }).ok && g.setPick({ water: 'mossmere', place: 'lily_maze' }).ok && g.pick().place === 'lily_maze', 'fakeLoop: setPick refuses a place not owned');
  ok(g.catalogue().list.length === 12 && g.seals().catch.need === 12, 'fakeLoop: catalogue and seals');
  const pm = placesMeta(D, { own: ['lily_maze', 'bell_pool'], lifted: ['lily_maze'], balls: 2, caught: ['dusk_minnow'] });
  ok(pm.loop.maps.places.length === 2 && pm.loop.lifted.join() === 'lily_maze' && pm.loop.bait.mossmere.heartmoss === 2 && pm.journal.dusk_minnow.caught === 1 && pm.loop.holdSlots === 5, 'placesMeta');
  console.log(fails.length ? fails.map((x) => '  FAIL: ' + x).join('\n') : `loop-fixture: ok (${LOOP_METHODS.length} methods)`);
  process.exit(fails.length ? 1 : 0);
}
