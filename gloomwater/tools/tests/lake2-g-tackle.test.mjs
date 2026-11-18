// LAKE 2, lane G (docs/loop/LAKE2.md §5.5; the user's words of 17 Nov 2026: "you can change rods and reels at your leisure in an options
// menu"): the Tackle screen's pure half. Its model (ui-tackle.tackleScreenModel) on the real loop data: the five rows, what each holds
// (the start piece, the tiers bought at the gear water, the found pieces; the water's own lures and the found ones; the tins with any left,
// Cut Strip, the legend's ball, the bare hook), the fitted chip and its log line (the Hold with the carry, the rod's cast, the line's cap),
// the head (the water's name, the carried line from the first tow on); a tap's call (screenCall) through the real ledger: fitTackle (a
// lower tier, the best bought as null, a found piece), changeHook (a bait takes the lure off, a lure the bait, the bare hook both), refused
// while a fish is on (the model's busy, nothing changed); a tier bought after a lower one was fitted is the one fitted; the way back by
// the lamps (the gear water's tackle, the Mossmere's own lures and tins); every word on the T43 list (no odds).
//   node tools/tests/lake2-g-tackle.test.mjs   (or node tools/check.mjs)
import fs from 'node:fs';
import * as THREE from 'three';

const { loadLoopData, freshLoopMeta, placesMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'lake2-g' });
const { createBus } = await import('../../src/core.js');
const { create } = await import('../../src/progression.js');
const UT = await import('../../src/ui-tackle.js');
const LC = await import('../../src/loop-carry.js');
const { wordRules, classifyText } = await import('./loop-1a.scenario.mjs');
const { textAllowed } = await import('../../src/ui-loop.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const FIX = JSON.parse(fs.readFileSync(new URL('./fixtures/loop-save-m1-end.json', import.meta.url), 'utf8'));

/** A real progression on the loop's data (loop-tackle.test.mjs's harness) with a fake fishing: its state, a tell, the cast's bait. */
function makeEnv({ meta = freshLoopMeta(D) } = {}) {
  const bus = createBus(), events = [];
  const phase = { phase: 'calm', day: 1, time: 0, duration: 40 };
  const F = {
    state: 'idle', tell: false, castBait: null, spots: [], signs: [], addSpots() {}, armChum() {},
    hookLine() { const fishOn = ['bite', 'reeling', 'landing'].includes(F.state) || (F.state === 'waiting' && F.tell); const out = !fishOn && (F.state === 'casting' || F.state === 'waiting'); return { state: F.state, out, fishOn, castBait: out ? F.castBait : null }; },
    reelInQuiet() { if (!F.hookLine().out) return { ok: false }; F.state = 'lost'; F.castBait = null; return { ok: true }; },
  };
  const ctx = {
    THREE, bus, data: D, state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'home', paused: false, debug: {}, errors: [], isMobile: false, input: {}, core: { debugEnabled: () => false },
    game: { save() {} },
    survival: { getPhaseInfo: () => ({ ...phase, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
    fishing: F,
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  ctx.progression = create(ctx);
  ctx.progression.init();
  const L = ctx.progression.loop;
  /** The screen's model as the view builds it (the trip's run on a trip, the line from fishing). */
  const model = () => { const r = ctx.state.run, trip = r && r.outing === 'trip' ? r : null; return UT.tackleScreenModel(D, { metaLoop: L.state(), run: trip, line: trip ? F.hookLine() : null, canChange: L.canChangeHook() !== false }); };
  /** A tap on a chip (row kind, chip key): the view's own call (screenCall) on the real ledger. */
  const tap = (kind, key) => { const it = model().rows.find((r) => r.kind === kind)?.items.find((x) => x.key === key); if (!it) return { ok: false, reason: 'no chip' }; const c = UT.screenCall(it); return c ? L[c[0]](...c.slice(1)) : { ok: true, changed: false, noop: true }; };
  return { ctx, events, P: ctx.progression, L, F, model, tap };
}
function startTrip(env, water = 'mossmere') {
  const r = env.P.createRun({ startZone: water, nightMode: 'still', outing: 'trip' });
  env.ctx.state.run = r; env.ctx.flow = 'playing';
  return r;
}
function endTrip(env) { env.L.endTrip(); env.ctx.state.run = null; env.ctx.flow = 'home'; }
const hook = (L) => ({ bait: L.state().fitted?.bait ?? null, lure: L.state().fitted?.lure ?? null });
const row = (m, kind) => m.rows.find((r) => r.kind === kind);
const keys = (m, kind) => row(m, kind).items.map((i) => i.key);
const onKey = (m, kind) => row(m, kind).items.filter((i) => i.on).map((i) => i.key);
const onLog = (m, kind) => row(m, kind).items.find((i) => i.on)?.log ?? null;
/** The Mossmere's end on a bare block: T2 everywhere, Hold 6, its two lures, both tins. */
const mossEnd = () => {
  const m = placesMeta(D, { holdSlots: 6, tackle: { rod: 2, line: 2, reel: 2 } });
  Object.assign(m.loop, { raft: { oars: 2, keel: 2, lantern: 2 }, maps: { lakes: ['mossmere', 'sporewood'], places: [] }, barge: { water: 'mossmere', towed: ['mossmere'] } });
  m.loop.lures = ['bent_spoon', 'feather_fly', 'glimmer_spoon'];
  m.loop.bait.mossmere = { mireworm: 6, lumen_moss: 2 };
  m.loop.fitted = { bait: 'mireworm', lure: null };
  return m;
};

// =====================================================================================================================
section('the words (TEXT_LOOP.tackle.screen and the logs\' own) and the API');
{
  const S = UT.screenWords(D);
  eq([S.title, S.rod, S.line, S.reel, S.lure, S.bait, S.done], ['Tackle', 'Rod', 'Line', 'Reel', 'Lure', 'Bait', 'Done'], 'the title is the tin\'s; the five rows; Done');
  eq([S.hold, S.cast, S.upTo], ['+{n} Hold.', 'Casts {m} m.', 'Lands up to {class}.'], 'the fitted piece\'s lines: its Hold, and the logs\' cast and cap lines');
  ok(typeof UT.tackleScreenModel === 'function' && typeof UT.screenCall === 'function', 'ui-tackle exports the model and the tap\'s call');
}

section('the Mossmere\'s first age (LAKE2 §5.5): five rows, what each holds, the best bought fitted, no carried line');
{
  const m = UT.tackleScreenModel(D, { metaLoop: mossEnd().loop });
  eq(m.rows.map((r) => r.kind), ['rod', 'line', 'reel', 'lure', 'bait'], 'the rows: Rod · Line · Reel · Lure · Bait');
  eq(m.rows.map((r) => r.head), ['Rod', 'Line', 'Reel', 'Lure', 'Bait'], 'each row\'s head');
  eq([m.water, m.waterName, m.carried, m.busy], ['mossmere', 'The Mossmere', null, false], 'the head: the water\'s name; nothing carried yet; not busy');
  eq(row(m, 'rod').items.map((i) => i.name), ['Willow Switch', 'Ashwood', 'Whalebone'], 'the rod row: the start piece, then each tier bought');
  eq(row(m, 'rod').items.map((i) => i.pick), ['willow_switch', 'ashwood_rod', null], '… a lower tier asked by its id, the best bought as null (a tier bought later is fitted by itself)');
  eq(['rod', 'line', 'reel'].map((k) => onKey(m, k)), [['whalebone_rod'], ['waxed_silk'], ['clockwork_reel']], 'the best bought is fitted in each slot');
  eq(onLog(m, 'rod'), ['+5 Hold.', 'Casts 19 m.'], 'the fitted rod\'s log: its Hold and its cast');
  eq(onLog(m, 'line'), ['+5 Hold.', 'Lands up to Elder.'], 'the fitted line\'s: its Hold and its cap (Waxed Silk: Elder)');
  eq(onLog(m, 'reel'), ['+5 Hold.'], 'the fitted reel\'s: its Hold');
  ok(m.rows.every((r) => r.items.filter((i) => !i.on).every((i) => i.log.length === 0)), 'the log line only under the fitted chip');
  eq(row(m, 'rod').items.map((i) => i.art), [0, 1, 2].map((t) => ({ id: `rod:${t}`, slot: 'rod', level: t })), 'the Mossmere\'s tiers drawn by murk-engrave\'s slot and level, as before');
  eq(keys(m, 'lure'), ['bent_spoon', 'feather_fly', 'glimmer_spoon'], 'the lure row: the water\'s own lures owned, in LOOP.lures\' order (no "none": the bare hook is the bait row\'s)');
  eq(keys(m, 'bait'), ['mireworm', 'lumen_moss', 'bare'], 'the bait row: the tins with any left, then the bare hook (no ball, no strip: none in the bag)');
  eq(row(m, 'bait').items.map((i) => i.count ?? null), [6, 2, null], '… each tin with its count');
  eq([onKey(m, 'bait'), onKey(m, 'lure')], [['mireworm'], []], 'the fitted Mire Worms pressed; no lure');
  const fresh = UT.tackleScreenModel(D, { metaLoop: freshLoopMeta(D).loop });
  eq(['rod', 'line', 'reel'].map((k) => row(fresh, k).items.map((i) => [i.key, i.pick, i.on])), [[['willow_switch', null, true]], [['twine', null, true]], [['wooden_winch', null, true]]],
    'a fresh save: the start pieces alone, fitted (asked as the best bought)');
  eq(onLog(fresh, 'line'), ['+0 Hold.', 'Lands up to Prize.'], 'Twine lands up to Prize (GEAR-GATES)');
  eq([keys(fresh, 'lure'), onKey(fresh, 'bait'), onLog(fresh, 'bait')], [['bent_spoon'], ['mireworm'], []], 'the start kit: the Bent Spoon, a tin of Mire Worms fitted');
  const spoon = UT.tackleScreenModel(D, { metaLoop: { ...fresh && freshLoopMeta(D).loop, fitted: { bait: null, lure: 'bent_spoon' } } });
  eq([onKey(spoon, 'lure'), onLog(spoon, 'lure'), onKey(spoon, 'bait')], [['bent_spoon'], ['Lands up to Keeper.'], []], 'the Bent Spoon fitted: "Lands up to Keeper." (its gear-log line)');
  const bare = UT.tackleScreenModel(D, { metaLoop: { ...freshLoopMeta(D).loop, fitted: { bait: null, lure: null } } });
  eq([onKey(bare, 'bait'), onLog(bare, 'bait')], [['bare'], ['Lands up to Keeper.']], 'nothing on the hook: the bare hook pressed, its cap line');
}

section('found pieces travel in their rows (LAKE2 §5.4): drawn as found, fitted in place of the tier, their own lines');
{
  const ml = clone(FIX.meta.loop);
  ok(ml.finds?.got?.belfry_winch >= 1, 'the M1-end fixture owns the Belfry Winch');
  ml.finds.got.lamp_pole = 1; ml.finds.got.ferry_thread = 1; ml.finds.got.guard_button = 1;
  if (!ml.lures.includes('guard_button')) ml.lures.push('guard_button');
  ml.found = { rod: 'lamp_pole', line: 'ferry_thread', reel: null }; ml.fit = { rod: 'lamp_pole', line: 'ferry_thread', reel: null };
  const m = UT.tackleScreenModel(D, { metaLoop: ml });
  eq(row(m, 'rod').items.filter((i) => i.find).map((i) => [i.key, i.pick, i.on]), [['lamp_pole', 'lamp_pole', true]], 'the Lamplighter\'s Pole: found, fitted');
  eq(onKey(m, 'rod'), ['lamp_pole'], '… the tiers stand behind it (none pressed)');
  eq(onLog(m, 'rod'), ['+0 Hold.', 'Casts 26 m.'], 'its log: its own Hold and cast');
  eq(onLog(m, 'line'), ['+2 Hold.', 'Lands up to Trophy.', 'Bites come 20% sooner.'], 'the Ferrywife\'s Thread: its Hold, its cap and its sooner bites');
  eq(row(m, 'reel').items.filter((i) => i.find).map((i) => [i.key, i.on]), [['belfry_winch', false]], 'the Belfry Winch owned, not fitted');
  ok(row(m, 'lure').items.some((i) => i.key === 'guard_button' && i.find === 'guard_button'), 'the found lure in the lure row, drawn as found');
  ml.found.reel = 'belfry_winch'; ml.fit.reel = 'belfry_winch';
  eq(onLog(UT.tackleScreenModel(D, { metaLoop: ml }), 'reel'), ['+2 Hold.', 'Plays 0.6× as long.'], 'the Belfry Winch fitted: its Hold and its play');
}

section('a tap through the real ledger at home: a lower tier, the best bought, a found piece (fitTackle); the hook (changeHook)');
{
  const env = makeEnv({ meta: clone(FIX.meta) });
  const { L, model, tap } = env;
  let res = tap('line', 'braided_gut');
  ok(res.ok && res.changed, 'the Braided Gut (a lower tier) fitted');
  let m = model();
  eq([onKey(m, 'line'), L.state().fit.line, L.holdOf().line, onLog(m, 'line')], [['braided_gut'], 'braided_gut', 2, ['+2 Hold.', 'Lands up to Trophy.']], '… pressed, saved in meta.loop.fit, its Hold and cap in place');
  res = tap('line', 'waxed_silk');
  eq([res.ok, L.state().fit.line, onKey(model(), 'line')], [true, null, ['waxed_silk']], 'the best bought back: asked as null (fit null)');
  eq(UT.screenCall(row(model(), 'line').items.find((i) => i.on)), null, 'a tap on the fitted chip asks nothing');
  res = tap('reel', 'clockwork_reel');
  eq([res.ok, L.state().found.reel, L.state().fit.reel, L.holdOf().reel], [true, null, null, 5], 'the found Winch off: the Clockwork (best bought) fitted');
  res = tap('reel', 'belfry_winch');
  eq([res.ok, L.state().found.reel, L.state().fit.reel, onKey(model(), 'reel')], [true, 'belfry_winch', 'belfry_winch', ['belfry_winch']], 'the Winch back on (fitFound: fit and found agree)');
  // the hook at home: the save's fitted (one thing on the hook)
  L.state().lures = [...new Set([...(L.state().lures || []), 'glimmer_spoon'])];
  L.state().bait.mossmere = { ...(L.state().bait.mossmere || {}), mireworm: 4, lumen_moss: 3 };
  L.state().fitted = { bait: 'mireworm', lure: null };
  res = tap('lure', 'glimmer_spoon');
  eq([res.ok, hook(L)], [true, { bait: null, lure: 'glimmer_spoon' }], 'a lure: on, the bait off (WATERCRAFT §3.4)');
  res = tap('bait', 'lumen_moss');
  eq([res.ok, hook(L)], [true, { bait: 'lumen_moss', lure: null }], 'a bait: on, the lure off');
  tap('lure', 'glimmer_spoon');
  res = tap('bait', 'bare');
  eq([res.ok, hook(L), onKey(model(), 'bait'), onKey(model(), 'lure')], [true, { bait: null, lure: null }, ['bare'], []], 'the bare hook: both off (the lure too)');
  eq(L.state().bait.mossmere.lumen_moss, 3, 'nothing is spent at home');
}

section('a tier bought after a lower one was fitted is the one fitted (a found piece stays)');
{
  const m0 = placesMeta(D, { holdSlots: 5, tackle: { rod: 1, line: 1, reel: 1 } });
  m0.loop.clams = 5000;
  const env = makeEnv({ meta: m0 });
  const { L, tap } = env;
  ok(tap('rod', 'willow_switch').ok && L.state().fit.rod === 'willow_switch', 'the Willow Switch fitted over the Ashwood');
  ok(L.buy('rod:2').ok, 'the Whalebone bought');
  eq([L.state().tackle.rod, L.state().fit.rod, L.holdOf().rod, onKey(env.model(), 'rod')], [2, null, 5, ['whalebone_rod']], 'the Whalebone is fitted (fit back to the best bought)');
  L.state().finds.got.belfry_winch = 1;
  ok(tap('reel', 'belfry_winch').ok, 'the found Winch fitted');
  ok(L.buy('reel:2').ok, 'the Clockwork bought');
  eq([L.state().fit.reel, L.state().found.reel, onKey(env.model(), 'reel')], ['belfry_winch', 'belfry_winch', ['belfry_winch']], 'the found Winch stays fitted (LOST-TACKLE: the bought tier stands behind it)');
}

section('on a trip: the run\'s hook and bag; a line out comes in quietly on a fit; refused while a fish is on (nothing changes)');
{
  const m0 = mossEnd();
  const env = makeEnv({ meta: m0 });
  const { L, F, model, tap } = env;
  startTrip(env, 'mossmere');
  let m = model();
  eq([m.busy, onKey(m, 'bait'), row(m, 'bait').items[0].count], [false, ['mireworm'], 6], 'the trip\'s bag and the bait on its line');
  F.state = 'waiting'; F.castBait = 'mireworm';
  m = model();
  eq(onKey(m, 'bait'), ['mireworm'], 'a line out: the cast\'s bait is the one on the hook');
  let res = tap('rod', 'ashwood_rod');
  eq([res.ok, res.reeled, F.state, L.state().fit.rod], [true, true, 'lost', 'ashwood_rod'], 'a rod fitted mid-wait: the line comes in quietly first');
  F.state = 'reeling';
  m = model();
  ok(m.busy === true, 'a fish on: the model is busy (the view dims its chips and says "After this fish.")');
  const before = clone(L.state());
  res = tap('rod', 'whalebone_rod');
  eq([res.ok, res.reason], [false, 'fish'], 'a rod refused while a fish is on');
  res = tap('lure', 'glimmer_spoon');
  eq([res.ok, res.reason], [false, 'fish'], 'a lure refused too');
  eq([L.state().fit, L.state().fitted], [before.fit, before.fitted], 'nothing changed');
  F.state = 'idle';
  res = tap('lure', 'glimmer_spoon');
  eq([res.ok, env.ctx.state.run.lure, env.ctx.state.run.equippedBait ?? null], [true, 'glimmer_spoon', null], 'the fish landed: the lure goes on the run\'s line, the bait off');
  endTrip(env);
}

section('after the tow (LAKE2 §5.2, §5.3): the gear water\'s tiers named by their items, the carried line, the water\'s own lures and tins');
{
  const env = makeEnv({ meta: mossEnd() });
  const { L, model } = env;
  L.state().clams = 5000;
  D.LOOP.shipped = 'sporewood';
  try {
    ok(L.towTo('sporewood').ok, 'the first tow');
    ok(L.buy('rod:1').ok && L.buy('rod:2').ok && L.buy('line:1').ok, 'Stalkwood, Amberheart and Rootthread bought at Sporewood');
    const m = model();
    eq([m.water, m.waterName, m.gearWater, m.carried], ['sporewood', 'Sporewood Pools', 'sporewood', 'Carried +2 · +2 · +2'], 'the head: Sporewood Pools, "Carried +2 · +2 · +2"');
    eq(row(m, 'rod').items.map((i) => i.name), ['Willow Switch', 'Stalkwood', 'Amberheart'], 'the rod row: the start rod (it travels), then Sporewood\'s own');
    eq(row(m, 'rod').items.slice(1).map((i) => i.art), [{ id: 'rod:1', slot: 'rod', level: 1, itemId: 'stalkwood', gearWater: 'sporewood' }, { id: 'rod:2', slot: 'rod', level: 2, itemId: 'amberheart', gearWater: 'sporewood' }],
      'a later water\'s tier cards name their item (as the shelf\'s, for lane S\'s plates)');
    eq(onLog(m, 'rod'), ['+8 Hold.', 'Casts 21 m.'], 'Amberheart on the carry: +8 Hold (6 + 2), 21 m (16 + 4 + 1)');
    eq(onLog(m, 'line'), ['+5 Hold.', 'Lands up to Trophy.'], 'Rootthread on the carry: +5 Hold, Trophy (lineAt.sporewood)');
    eq([keys(m, 'reel'), onLog(m, 'reel')], [['wooden_winch'], ['+2 Hold.']], 'the reel: the Wooden Winch on the carried +2');
    eq(keys(m, 'lure'), ['seedpod_twirl'], 'the lure row: Sporewood\'s own (its start lure); the Mossmere\'s wait there');
    eq([keys(m, 'bait'), onKey(m, 'bait')], [['spore_cake', 'bare'], ['spore_cake']], 'the bait row: the start kit\'s Spore Cake, fitted');
    ok(env.tap('rod', 'stalkwood').ok && L.holdOf().rod === 5 && onKey(model(), 'rod')[0] === 'stalkwood', 'a lower Sporewood rod fitted (3 + the carried 2)');
    ok(env.tap('rod', 'whalebone_rod').ok === false, 'a Mossmere rod left behind cannot be fitted');
    // the way back by the lamps (LAKE2 §6.3): the barge at the Mossmere, the gear water's tackle travels, the Mossmere's lures and tins
    ok(L.towTo('mossmere').ok, 'the way back');
    const b = model();
    eq([b.water, b.gearWater, keys(b, 'rod')], ['mossmere', 'sporewood', ['willow_switch', 'stalkwood', 'amberheart']], 'at the Mossmere: Sporewood\'s rods (the tackle travels)');
    eq(keys(b, 'lure'), ['bent_spoon', 'feather_fly', 'glimmer_spoon'], '… and the Mossmere\'s own lures, waiting there');
    eq(keys(b, 'bait'), ['mireworm', 'lumen_moss', 'bare'], '… and its tins (Sporewood\'s Spore Cake, fitted there, waits there)');
    eq([onKey(b, 'bait'), onKey(b, 'lure')], [['bare'], []], '… the next trip here carries no Sporewood bait: the bare hook until a Mossmere bait is picked');
    eq(onLog(b, 'line'), ['+5 Hold.', 'Lands up to Elder.'], 'Rootthread\'s +5 against the Mossmere\'s lineAt: Elder (the Mossmere fishes easier)');
  } finally { D.LOOP.shipped = 'mossmere'; }
}

section('every word the screen shows is on the T43 list (TEXT_LOOP, the names; no odds), and no "%" but a found line\'s own');
{
  const rules = wordRules(D);
  const words = (m) => [m.words.title, m.waterName, m.carried, m.busy ? m.words.after : null, m.words.done, ...m.rows.flatMap((r) => [r.head, ...r.items.flatMap((i) => [i.name, ...(i.count != null ? [String(i.count)] : []), ...i.log])])].filter(Boolean);
  const ml = mossEnd().loop;
  const ml2 = clone(ml); LC.applyTow(D, ml2, 'sporewood'); ml2.barge = { water: 'sporewood', towed: ['mossmere', 'sporewood'] }; ml2.tackle = { rod: 2, line: 2, reel: 1 };
  const fx = clone(FIX.meta.loop); fx.finds.got.ferry_thread = 1; fx.found = { rod: null, line: 'ferry_thread', reel: 'belfry_winch' }; fx.fit = { ...fx.found };
  const all = [...words(UT.tackleScreenModel(D, { metaLoop: ml })), ...words(UT.tackleScreenModel(D, { metaLoop: ml2, canChange: false })), ...words(UT.tackleScreenModel(D, { metaLoop: fx }))];
  const bad = [...new Set(all)].filter((t) => classifyText(t, rules, {}) !== 'ok' && !textAllowed(t, { D, screen: 'tacklescreen' }));
  eq(bad, [], 'each word passes T43\'s rules (the scenario\'s, else ui-loop\'s textAllowed: the legend\'s ball by its built name)');
  ok(all.filter((t) => /%/.test(t)).every((t) => /^Bites come \d+% sooner\.$/.test(t)), 'no percentage but the Ferrywife\'s Thread\'s own line (no odds)');
  eq([UT.screenWords(D).rod, UT.screenWords(D).line, UT.screenWords(D).reel].join(' · '), 'Rod · Line · Reel', 'the drawer\'s door to the screen: the three row words');
}

console.log(`\n${fail ? 'FAIL' : 'ok'}: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
