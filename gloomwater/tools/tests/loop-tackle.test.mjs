// TK, the tackle tin (the user's words of 16 November 2026: "We should have an option to equip bait or change lures whilst out on the
// lake"; SPEC §16 answer 43 superseded; CONTRACT §14.19): the ledger's canChangeHook / changeHook through the real progression on the
// loop's data (a fake fishing that answers hookLine and reelInQuiet as fishing.js does), and the real src/fishing.js's own half
// (hookLine, reelInQuiet) on tools/tests/fishing-env.mjs. The rule across the states; a change mid-wait (the line in, the cast's bait
// back once, no miss, no lost fish, no favour or streak lost, no bite counted); refused during a fight, the show and the card; an empty
// bait refused; a lure swap; a bare hook; the last bait out; the legend's ball; the fitted save (what the Chart shows at home).
//   node tools/tests/loop-tackle.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';
import { createBus } from '../../src/core.js';
import { create } from '../../src/progression.js';
import * as PL from '../../src/progression-loop.js';

const { loadLoopData, freshLoopMeta, placesMeta, fakeLoop } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-tackle' });
const { makeFishingEnv } = await import('./fishing-env.mjs');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const OPEN = 'open:mossmere';

/** A fake fishing with fishing.js's two TK seams: hookLine() (from the state, a tell, the show) and reelInQuiet() (the cast's bait back
 *  through progression.refundBait, the line in: state 'lost'). cast() spends the bait as fishing's beginCast does (consumeBait). */
function fakeFishing(ctx) {
  const F = {
    state: 'idle', tell: false, show: false, castBait: null, reels: 0, spots: [], signs: [], addSpots() {}, armChum() {},
    get inShow() { return F.show; },
    hookLine() {
      const fishOn = ['bite', 'reeling', 'landing'].includes(F.state) || (F.state === 'waiting' && F.tell) || F.show;
      const out = !fishOn && (F.state === 'casting' || F.state === 'waiting');
      return { state: F.state, out, fishOn, castBait: out ? F.castBait : null };
    },
    reelInQuiet() {
      if (!F.hookLine().out) return { ok: false, refunded: false, baitId: null };
      const b = F.castBait, legend = !!D.BAITS.find((x) => x.id === b)?.legend;
      const refunded = b && !legend ? ctx.progression.refundBait(b) === true : false;
      F.castBait = null; F.state = 'lost'; F.tell = false; F.reels++;
      ctx.bus.emit('fishing:reelIn', { quiet: true, refunded, baitId: b });
      return { ok: true, refunded, baitId: b };
    },
    /** a cast as fishing's beginCast spends it: consumeBait (a legend's ball rides unspent), then the float out and waiting */
    cast() {
      const eq0 = ctx.state.run.equippedBait ?? null;
      const spent = ctx.progression.consumeBait();
      F.castBait = typeof spent === 'string' ? spent : (eq0 && D.BAITS.find((x) => x.id === eq0)?.legend ? eq0 : null);
      F.state = 'waiting'; F.tell = false;
      ctx.bus.emit('fishing:cast', { power: 0.5 });
      return F.castBait;
    },
    idle() { F.state = 'idle'; F.tell = false; F.show = false; },
  };
  return F;
}
/** A real progression on the loop's data (loop-4.test.mjs's harness) with the fake fishing. */
function makeEnv({ meta = freshLoopMeta(D) } = {}) {
  const bus = createBus(), events = [], calls = { saves: 0 };
  const phase = { phase: 'calm', day: 1, time: 0, duration: 40 };
  const ctx = {
    THREE, bus, data: D, state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {}, core: { debugEnabled: () => false },
    game: { save() { calls.saves++; } },
    survival: { getPhaseInfo: () => ({ ...phase, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  ctx.fishing = fakeFishing(ctx);
  ctx.progression = create(ctx);
  ctx.progression.init();
  return { ctx, events, calls, P: ctx.progression, L: ctx.progression.loop, F: ctx.fishing, count: (e) => events.filter((x) => x.evt === e).length };
}
function startTrip(env) {
  const r = env.P.createRun({ startZone: 'mossmere', nightMode: 'still', outing: 'trip' });
  env.ctx.state.run = r; env.ctx.flow = 'playing';
  env.ctx.bus.emit('zone:change', { zone: r.zone, prev: null, sail: true });
  env.ctx.bus.emit('run:start', { continued: false });
  return r;
}
/** A save that has played, with tins, Cut Strip none, the ball and two lures owned. */
function tackleMeta({ bag = { mireworm: 10, lumen_moss: 10, heartmoss: 1 }, lures = ['feather_fly', 'glimmer_spoon'], fitted = { bait: 'mireworm', lure: null } } = {}) {
  const m = placesMeta(D, { holdSlots: 5 });
  m.loop.bait.mossmere = { ...bag };
  m.loop.lures = lures.slice();
  m.loop.fitted = { ...fitted };
  return m;
}

// =====================================================================================================================
section('the API: LOOP_METHODS, the pure rule (hookChangeable)');
{
  ok(PL.LOOP_METHODS.includes('canChangeHook') && PL.LOOP_METHODS.includes('changeHook'), 'LOOP_METHODS names canChangeHook and changeHook (CONTRACT §14.19)');
  const fl = fakeLoop({ D });
  ok(typeof fl.canChangeHook === 'function' && typeof fl.changeHook === 'function', 'the fixture\'s fakeLoop carries both');
  eq(PL.HOOK_BUSY, ['bite', 'reeling', 'landing'], 'a fish is on from the bite through the hook, the play and the landing');
  const H = PL.hookChangeable;
  ok(H({ trip: false, state: 'reeling', fishOn: true, card: true }), 'at home the hook always changes');
  for (const st of ['idle', 'charging', 'casting', 'waiting', 'lost']) ok(H({ trip: true, state: st }), `on a trip, ${st} with no fish on: it changes`);
  for (const st of ['bite', 'reeling', 'landing']) ok(!H({ trip: true, state: st }), `on a trip, ${st}: refused (a fish is on)`);
  ok(!H({ trip: true, state: 'waiting', fishOn: true }), 'waiting with the class tell begun: refused (the fish is at the float)');
  ok(!H({ trip: true, state: 'idle', fishOn: true }), 'the show (fishOn, the line idle): refused');
  ok(!H({ trip: true, state: 'idle', card: true }), 'a catch or a find on its card: refused');
}

section('canChangeHook across the states (the real ledger)');
{
  const env = makeEnv({ meta: tackleMeta() });
  const { L, F, ctx } = env;
  ok(L.canChangeHook() === true, 'at home (no trip): true');
  const r = startTrip(env);
  ok(r.equippedBait === 'mireworm', 'the trip starts with the fitted Mire Worms on the line');
  for (const st of ['idle', 'charging', 'casting', 'waiting', 'lost']) { F.state = st; ok(L.canChangeHook() === true, `${st}: true`); }
  F.state = 'waiting'; F.tell = true; ok(L.canChangeHook() === false, 'waiting with the tell begun: false');
  F.tell = false;
  for (const st of ['bite', 'reeling', 'landing']) { F.state = st; ok(L.canChangeHook() === false, `${st}: false`); }
  F.idle(); F.show = true; ok(L.canChangeHook() === false, 'the show: false');
  F.idle();
  r.flags.pendingCatch = [{ uid: 'f1', speciesId: 'dusk_minnow' }];
  ok(L.canChangeHook() === false, 'a fish on its card (flags.pendingCatch): false');
  delete r.flags.pendingCatch;
  r.flags.pendingFind = { uid: 'x1', find: 'tin_spoon' };
  ok(L.canChangeHook() === false, 'a find on its card (flags.pendingFind): false');
  delete r.flags.pendingFind;
  ok(L.canChangeHook() === true, 'the card closed, the line idle: true');
  void ctx;
}

section('a change mid-wait: the line in quietly, the bait back once, nothing lost');
{
  const env = makeEnv({ meta: tackleMeta() });
  const { L, F, P, ctx } = env;
  const r = startTrip(env);
  r.flags.streak = 3;
  r.mercy = { [OPEN]: 0.2 };
  const out = F.cast();
  eq(out, 'mireworm', 'the cast carries Mire Worms');
  eq(r.bait.mireworm, 9, 'the cast spent one (10 → 9)');
  const bites0 = clone(r.bites), fav0 = clone(L.favour(OPEN)), saves0 = env.calls.saves;
  const ev0 = env.events.length;
  const res = L.changeHook({ bait: 'lumen_moss' });
  ok(res.ok === true && res.changed === true && res.reeled === true, 'changeHook({bait: lumen_moss}) mid-wait: ok, changed, the line reeled in', res);
  eq(F.state, 'lost', 'the line comes in (fishing\'s quiet reel-in)');
  eq(F.reels, 1, 'reelInQuiet called once');
  eq(r.bait.mireworm, 10, 'the Mire Worms that went out come back: the tin\'s count is whole');
  ok(P.refundBait('mireworm') === false && r.bait.mireworm === 10, 'refunded once (a second refund of the same cast gives nothing)');
  eq(r.equippedBait, 'lumen_moss', 'Lumen Moss on the hook');
  eq(ctx.state.meta.loop.fitted.bait, 'lumen_moss', 'meta.loop.fitted.bait saved as Lumen Moss (what the Chart shows at home)');
  ok(env.calls.saves > saves0, 'saved at once (fit\'s save)');
  const evs = env.events.slice(ev0).map((e) => e.evt);
  for (const e of ['fishing:miss', 'fishing:escaped', 'fish:escaped', 'fishing:bite']) ok(!evs.includes(e), `no ${e} (no miss, no lost-fish line, no bite)`);
  ok(evs.includes('loop:hook') && evs.includes('bait:change') && evs.includes('fishing:reelIn'), 'loop:hook, bait:change and fishing:reelIn fire', evs);
  eq(r.flags.streak, 3, 'the streak is kept');
  eq(r.bites, bites0, 'no bite counted');
  eq(r.mercy, { [OPEN]: 0.2 }, 'the let-go favour kept');
  eq(L.favour(OPEN), fav0, 'the water\'s favour unchanged');
  F.idle();
  eq(F.cast(), 'lumen_moss', 'the next cast carries the new choice');
  eq(r.bait.lumen_moss, 9, '… and spends one Lumen Moss');
}

section('refused: during a fight, the show, the card; an empty bait; a lure not owned');
{
  const env = makeEnv({ meta: tackleMeta() });
  const { L, F, ctx } = env;
  const r = startTrip(env);
  F.cast();
  const before = { bag: clone(r.bait), eq: r.equippedBait, lure: r.lure ?? null, fitted: clone(ctx.state.meta.loop.fitted) };
  for (const st of ['bite', 'reeling', 'landing']) {
    F.state = st;
    eq(L.changeHook({ bait: 'lumen_moss' }), { ok: false, reason: 'fish' }, `${st}: refused ({ok: false, reason: 'fish'})`);
  }
  F.state = 'waiting'; F.tell = true;
  eq(L.changeHook({ lure: 'glimmer_spoon' }).reason, 'fish', 'the tell begun: refused');
  F.idle(); F.show = true;
  eq(L.changeHook({ bait: 'lumen_moss' }).reason, 'fish', 'the show: refused');
  F.idle();
  eq({ bag: r.bait, eq: r.equippedBait, lure: r.lure ?? null, fitted: ctx.state.meta.loop.fitted }, before, 'nothing changed by a refusal');
  eq(F.reels, 0, 'no reel-in on a refusal');
  eq(L.changeHook({ bait: 'cut_strip' }), { ok: false, reason: 'bait' }, 'Cut Strip with none in the bag: refused (fit refuses an empty one)');
  eq(L.changeHook({ bait: 'spore_cake' }).reason, 'bait', 'a bait not of this water: refused');
  eq(L.changeHook({ lure: 'bone_jig' }), { ok: false, reason: 'lure' }, 'a lure not owned: refused');
  r.bait.cut_strip = 3;
  ok(L.changeHook({ bait: 'cut_strip' }).ok === true && r.equippedBait === 'cut_strip', 'Cut Strip in the bag: fits as on the Chart');
}

section('a lure swap, none, a bare hook; the last bait out; the legend\'s ball');
{
  const env = makeEnv({ meta: tackleMeta({ bag: { mireworm: 4, lumen_moss: 1, heartmoss: 1 } }) });
  const { L, F, ctx } = env;
  const r = startTrip(env);
  let res = L.changeHook({ lure: 'glimmer_spoon' });
  ok(res.ok && res.changed && !res.reeled && r.lure === 'glimmer_spoon' && ctx.state.meta.loop.fitted.lure === 'glimmer_spoon', 'the line idle: the Glimmer Spoon on, saved, nothing reeled', res);
  res = L.changeHook({ lure: 'glimmer_spoon' });
  ok(res.ok && res.changed === false, 'the same lure again: no change');
  res = L.changeHook({ lure: null });
  ok(res.ok && r.lure === null && ctx.state.meta.loop.fitted.lure === null, 'No lure: taken off');
  res = L.changeHook({ bait: null });
  ok(res.ok && r.equippedBait === null && ctx.state.meta.loop.fitted.bait === null, 'Bare hook: the line and the slot bare', res);
  F.cast();
  eq(F.castBait, null, 'a bare cast carries no bait');
  res = L.changeHook({ bait: 'mireworm' });
  ok(res.ok && res.reeled && r.equippedBait === 'mireworm' && r.bait.mireworm === 4, 'from a bare hook mid-wait: in, Mire Worms on, the bag untouched', res);
  F.idle();
  // the last Lumen Moss out: the bag moves the hook onto the worms, a lure change brings it back whole and on the hook
  ok(L.changeHook({ bait: 'lumen_moss' }).ok && r.equippedBait === 'lumen_moss', 'Lumen Moss (the last one) on the hook');
  F.cast();
  eq(r.bait.lumen_moss ?? 0, 0, 'cast: the last Lumen Moss is out');
  ok(L.changeHook({ lure: 'feather_fly' }).ok, 'a lure change mid-wait');
  ok(r.bait.lumen_moss === 1 && !r.equippedBait && r.lure === 'feather_fly', 'the moss back (1) in the bag and off the hook, the Feather Fly on (one thing on the hook)', { bag: r.bait, eq: r.equippedBait, lure: r.lure });
  F.idle();
  // the ball: never spent at the cast, so nothing comes back
  ok(L.changeHook({ bait: 'heartmoss' }).ok && r.equippedBait === 'heartmoss', 'the Heartmoss Ball fits');
  eq(F.cast(), 'heartmoss', 'the ball rides the cast');
  eq(r.bait.heartmoss, 1, '… unspent (spent only at her hook)');
  ok(L.changeHook({ bait: 'mireworm' }).ok && r.bait.heartmoss === 1 && r.equippedBait === 'mireworm', 'changed mid-wait: the ball stays one, no refund');
}

section('at home: the change is the Chart\'s fit (the next trip carries it)');
{
  const env = makeEnv({ meta: tackleMeta() });
  const { L, ctx } = env;
  let res = L.changeHook({ bait: 'lumen_moss', lure: 'feather_fly' });
  ok(res.ok && res.changed && !res.reeled, 'at home: ok, nothing to reel', res);
  eq([ctx.state.meta.loop.fitted.bait, ctx.state.meta.loop.fitted.lure], [null, 'feather_fly'], 'one thing on the hook: asked for both, the lure is fitted and the bait is not');
  res = L.changeHook({ bait: 'cut_strip' });
  eq(res.reason, 'bait', 'at home an empty bait is refused too');
  const r = startTrip(env);
  ok(!r.equippedBait && r.lure === 'feather_fly', 'the trip starts with the lure alone on the line');
  ok(L.changeHook({ bait: 'lumen_moss' }).ok && r.equippedBait === 'lumen_moss' && !r.lure && ctx.state.meta.loop.fitted.lure === null, 'a bait asked for alone takes the lure off');
}

section('one thing on the hook: a save holding a lure and a bait keeps the lure');
{
  const env = makeEnv({ meta: tackleMeta({ fitted: { bait: 'lumen_moss', lure: 'feather_fly' } }) });
  env.L.fitted();
  const f = env.ctx.state.meta.loop.fitted;
  ok(f.lure === 'feather_fly' && f.bait === null, 'the lure kept, the bait off the hook', f);
  const r = startTrip(env);
  ok(r.lure === 'feather_fly' && !r.equippedBait && r.bait.lumen_moss === 10, 'the trip: the lure on the line, the tin in the bag');
}

// =====================================================================================================================
section('the real fishing.js: hookLine and reelInQuiet');
{
  const loop = fakeLoop({ D, wick: 'wick', maps: { lakes: ['mossmere'], places: [] }, bag: { mireworm: 5 }, holdSlots: 5 });
  const E = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase: 'calm', seed: 7, loop,
    runOver: { bait: { mireworm: 5 }, equippedBait: 'mireworm', evening: 2, character: 'wick', nightMode: 'still' } });
  const F = E.F;
  eq(F.hookLine(), { state: 'idle', out: false, fishOn: false, castBait: null }, 'idle: no line out, no fish');
  ok(F.reelInQuiet().ok === false, 'idle: nothing to reel in');
  const waiting = E.ctx.debug.forceBite({ wait: 6 });
  ok(waiting && F.state === 'waiting', 'a cast, waiting (a bite 6 s off)');
  E.tick(10);
  const hl = F.hookLine();
  ok(hl.out === true && hl.fishOn === false && hl.castBait === 'mireworm', 'waiting before the tell: the line out with Mire Worms, no fish on', hl);
  const ev0 = E.events.length;
  const res = F.reelInQuiet();
  ok(res.ok && res.refunded && res.baitId === 'mireworm', 'reelInQuiet: ok, the cast\'s bait refunded', res);
  eq(E.calls.refund, ['mireworm'], 'progression.refundBait called once with the cast\'s bait');
  eq(F.state, 'lost', 'the line comes in (the reel-in after a pass)');
  ok(F.reelInQuiet().ok === false, 'a second reelInQuiet: nothing out');
  for (let i = 0; i < 90 && F.state !== 'idle'; i++) E.tick(1);
  eq(F.state, 'idle', 'back to idle in under 3 s');
  const evs = E.events.slice(ev0).map((e) => e.e);
  for (const e of ['fishing:miss', 'fishing:escaped', 'fishing:bite', 'fishing:hook']) ok(!evs.includes(e), `no ${e}`);
  ok(evs.includes('fishing:reelIn'), 'fishing:reelIn {quiet} for the sound');
  // a bite: a fish is on, nothing reels in
  E.ctx.debug.forceBite({ wait: 0.6 });
  let sawTell = false;
  for (let i = 0; i < 200 && F.state !== 'bite'; i++) { E.tick(1); if (F.state === 'waiting' && F.hookLine().fishOn) sawTell = true; }
  ok(sawTell, 'the class tell begun: hookLine says a fish is on');
  eq(F.state, 'bite', 'the bite');
  ok(F.hookLine().fishOn === true && F.hookLine().out === false && F.reelInQuiet().ok === false, 'the bite: fish on, no quiet reel-in', F.hookLine());
}

// =====================================================================================================================
section('the tin\'s and the drawer\'s model (ui-tackle.tackleModel), its words and its pictures');
{
  const T = await import('../../src/ui-tackle.js');
  const U = await import('../../src/ui-loop.js');
  const E = await import('../../src/murk-engrave.js');
  const W = T.tackleWords(D);
  eq(W, { tin: 'Tackle', bait: 'Bait', lure: 'Lure', bare: 'Bare hook', none: 'No lure', after: 'After this fish.' }, 'TEXT_LOOP.tackle: six words');
  ok(Object.values(D.TEXT_LOOP.tackle).every((t) => !/%/.test(t) && U.textAllowed(t, { D })), 'every word on the allow-list, no percentage');
  const all = ['feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner'];
  const run = { zone: 'mossmere', bait: { mireworm: 9, lumen_moss: 3, heartmoss: 1, cut_strip: 2 }, equippedBait: 'mireworm', lure: 'bell_spinner' };
  let m = T.tackleModel(D, { run, metaLoop: { lures: all } });
  eq(m.bait.map((b) => b.id), ['heartmoss', 'mireworm', 'lumen_moss', 'cut_strip', null], 'Bait: the ball, the tins, Cut Strip, then a bare hook');
  eq(m.lure.map((b) => b.id), [...all, null], 'Lure: every owned lure in LOOP.lures\' order, then none');
  eq([m.baitOn, m.lureOn, m.count], ['mireworm', 'bell_spinner', 9], 'on the hook: Mire Worms (9 left) and the Harbour-Bell Spinner');
  ok(m.bait.filter((b) => b.on).length === 1 && m.lure.filter((b) => b.on).length === 1, 'one pressed in each row');
  eq(m.bait.map((b) => b.name), ['Heartmoss Ball', 'Mire Worms', 'Lumen Moss', 'Cut Strip', 'Bare hook'], 'the bait names (the shelf\'s)');
  ok([...m.bait, ...m.lure].every((b) => U.textAllowed(b.name, { D })), 'every name on the allow-list');
  ok([...m.bait, ...m.lure].every((b) => Math.max(...b.name.split(/\s+/).map((w) => w.length)) <= 12), 'no word longer than 12 letters (each fits a 100 px cell at 16 px on a 358 px phone)');
  ok(!JSON.stringify(m).match(/%|likes?\b|odds|chance/i), 'no odds, no likes, no percentage in the model');
  m = T.tackleModel(D, { run: { ...run, bait: { mireworm: 0, lumen_moss: 3 }, equippedBait: 'mireworm' }, metaLoop: { lures: [] }, line: { out: true, castBait: 'mireworm' } });
  eq(m.bait.map((b) => [b.id, b.count, b.on]), [['mireworm', 0, true], ['lumen_moss', 3, false], [null, null, false]], 'the last worm out on the line: still shown, pressed, 0 left; an empty tin is not offered');
  eq(m.lure.map((b) => [b.id, b.on]), [['bell_spinner', true], [null, false]], 'a lure on the line stays listed');
  m = T.tackleModel(D, { run: { zone: 'mossmere', bait: {}, equippedBait: null, lure: null }, metaLoop: { lures: [] } });
  eq([m.bait.map((b) => [b.id, b.on]), m.lure.map((b) => [b.id, b.on])], [[[null, true]], [[null, false]]], 'nothing in the bag, no lure: the bare hook pressed (one thing pressed)');
  m = T.tackleModel(D, { run: { zone: 'mossmere', bait: { mireworm: 4 }, equippedBait: null, lure: 'glimmer_spoon' }, metaLoop: { lures: ['glimmer_spoon'] } });
  eq([...m.bait, ...m.lure].filter((b) => b.on).map((b) => b.id), ['glimmer_spoon'], 'a lure on: the lure alone pressed (no bare hook, no bait)');
  for (const [kind, id] of [['bait', 'mireworm'], ['bait', 'lumen_moss'], ['bait', 'cut_strip'], ['bait', 'heartmoss'], ...all.map((x) => ['lure', x])]) {
    const svg = E.engrave(T.artCard(D, kind, id), { uid: `t-${id}` });
    ok(/^<svg class="cat-eng/.test(svg) && svg.length > 400 && !/NaN|undefined/.test(svg), `${id}: its engraving draws (${E.plateKey(T.artCard(D, kind, id))})`);
  }
  eq([E.plateKey(T.artCard(D, 'bait', 'cut_strip')), E.plateKey(T.artCard(D, 'bait', 'heartmoss')), E.plateKey(T.artCard(D, 'lure', 'bone_jig'))], ['tin:cut_strip', 'bait:heartmoss', 'lure:bone_jig'], 'the plates: Cut Strip\'s, the ball\'s, a lure\'s');
}

console.log(`\nloop-tackle: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
