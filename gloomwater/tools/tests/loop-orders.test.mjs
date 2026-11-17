// Murk's orders said and shown (the user's words of 17 November 2026: "When you buy murks board it doesn't tell you what he wants you
// to catch anywhere that I can see"): his line on buying the board and at a visit home, once an order (loop.sayOrders, loop-gear's
// orderSayLine); the line on ui-loop's allow-list; the HUD slate's presence rule and its ticks (slateShown, slateOrders); the Journal's
// "Murk wants one." (speciesWanted); the words in TEXT_LOOP, no odds.
//   node tools/tests/loop-orders.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';
import { createBus } from '../../src/core.js';
import { create } from '../../src/progression.js';
import * as G from '../../src/loop-gear.js';

const { loadLoopData, freshLoopMeta, placesMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-orders' });
const U = await import('../../src/ui-loop.js');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const OPEN = 'open:mossmere';

/** A real progression on the loop's data (loop-trip.test.mjs's harness, cut to what this file needs). */
function makeEnv({ meta = freshLoopMeta(D) } = {}) {
  const bus = createBus(), events = [], calls = { saves: [] };
  const phase = { phase: 'calm', day: 1, time: 0, duration: 40 };
  const ctx = {
    THREE, bus, data: D, state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {}, core: { debugEnabled: () => false },
    game: { save() { const r = ctx.state.run; calls.saves.push(clone({ meta: ctx.state.meta, run: r && r.active ? r : null })); } },
    survival: { getPhaseInfo: () => ({ ...phase, k: 0, isNight: phase.phase === 'gloomtide' }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp() {} }, fishing: { state: 'idle', spots: [], signs: [], addSpots() {}, armChum() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  ctx.progression = create(ctx);
  ctx.progression.init();
  return { ctx, events, phase, calls, P: ctx.progression, L: ctx.progression.loop, last: (e) => [...events].reverse().find((x) => x.evt === e)?.payload };
}
function startTrip(env) {
  const r = env.P.createRun({ startZone: 'mossmere', nightMode: 'still', outing: 'trip' });
  env.ctx.state.run = r; env.ctx.flow = 'playing';
  env.ctx.bus.emit('zone:change', { zone: r.zone, prev: null, sail: true });
  env.ctx.bus.emit('run:start', { continued: false });
  return r;
}
function land(env, id, z, { key = OPEN, place = null } = {}) {
  env.ctx.bus.emit('fishing:bite', { sizeClass: 'keeper', biteTell: 'steady', waterKey: key });
  const fish = env.P.makeFish(id, z, 'normal', { place });
  env.P.measure(fish);
  return fish;
}


const TL = D.TEXT_LOOP;
section('the words: TEXT_LOOP.orderSay, on the allow-list, no odds');
{
  ok(typeof TL.orderSay?.line === 'string' && TL.orderSay.line.includes('{order}') && TL.orderSay.wants === 'Murk wants one.', 'TEXT_LOOP.orderSay: the line and the Journal word');
  const W = U.allowedWords(D);
  ok(W.has(TL.orderSay.wants), '"Murk wants one." is an allowed word');
  ok(U.textAllowed('Bring me a Weeping Carp.', { D }) && U.textAllowed('Bring me 2 Dusk Minnows and a Prize Reedjaw Pike.', { D }), 'the line passes textAllowed (one order, two)');
  ok(!U.textAllowed('Bring me a Unicorn.', { D }) && !U.textAllowed('Bring me 40% of a Dusk Minnow.', { D }), '… never an unknown fish or a figure');
  ok(![TL.orderSay.line, TL.orderSay.wants].some((s) => /%|odds|chance/i.test(s)), 'no odds in the words');
  ok(TL.orderSay.line.split(/\s+/).length <= 4 && TL.orderSay.wants.split(/\s+/).length <= 3, 'few words');
}

section('orderSayLine: each order said once (pure)');
{
  const o1 = { id: 'a', speciesId: 'weeping_carp', kind: 'count', n: 1, have: 0 }, o2 = { id: 'b', speciesId: 'dusk_minnow', kind: 'count', n: 2, have: 0 };
  eq(G.orderSayLine(D, [o1]), { line: 'Bring me a Weeping Carp.', ids: ['a'] }, 'one new order: "Bring me a Weeping Carp."');
  eq(G.orderSayLine(D, [{ ...o1, said: true }, o2]).line, 'Bring me 2 Dusk Minnows.', 'a said order is not said again; the new one is');
  eq(G.orderSayLine(D, [o1, o2]).line, 'Bring me a Weeping Carp and 2 Dusk Minnows.', 'two new at once: one line names both');
  eq(G.orderSayLine(D, [{ ...o1, said: true }]), { line: null, ids: [] }, 'nothing new: no line');
}

section('the line on buying the board, and at a visit home, once an order (the real progression)');
{
  const meta = placesMeta(D, { own: [], holdSlots: 5 });
  meta.loop.clams = 5000;
  meta.loop.wick = 'stub';
  const env = makeEnv({ meta });
  const L = env.L, ml = meta.loop;
  eq(L.sayOrders(), null, 'no board: Murk says no order');
  ok(L.buy('orders:1').ok && ml.orders.length === 1, 'the Order Board I bought: one order');
  const line = L.sayOrders();
  ok(typeof line === 'string' && line === `Bring me ${G.orderPhrase(D, ml.orders[0])}.`, 'on buying: Murk says it, in his words', line);
  ok(U.textAllowed(line, { D }), '… on the allow-list');
  ok(ml.orders[0].said === true, '… marked said');
  eq(L.sayOrders(), null, '… once: not again');
  const saves = env.calls.saves.length;
  ok(saves > 0 && env.calls.saves[saves - 1].meta.loop.orders[0].said === true, '… and saved said');
  // a visit home: the filled order leaves, Murk chalks a new one; he says the new one, once
  ml.orders = [{ id: 'ord_t', speciesId: 'dusk_minnow', kind: 'count', n: 1, have: 0, said: true }];
  startTrip(env);
  const f = land(env, 'dusk_minnow', 0.2);
  L.keep(f);
  L.endTrip();
  ok(ml.orders.length === 1 && ml.orders[0].id !== 'ord_t' && ml.orders[0].said !== true, 'home: the filled order gone, a new one chalked (not yet said)');
  const l2 = L.sayOrders();
  ok(typeof l2 === 'string' && l2.includes(G.orderPhrase(D, ml.orders[0])), 'Murk says the new order at the visit home', l2);
  eq(L.sayOrders(), null, '… once');
  // an order not filled stays said: the next visit says nothing
  startTrip(env); L.endTrip();
  eq(L.sayOrders(), null, 'a visit with no order filled: nothing new to say');
  // Board II: one more order, said on buying (only the new one)
  ok(L.buy('orders:2').ok && ml.orders.length === 2, 'Board II: two orders');
  const l3 = L.sayOrders();
  ok(typeof l3 === 'string' && l3 === `Bring me ${G.orderPhrase(D, ml.orders[1])}.`, 'on buying Board II: the new order alone', l3);
  // a wiped order: Murk chalks another before the player's eyes (on the slate), said already
  ok(L.wipeOrder(ml.orders[0].id).ok && ml.orders.every((o) => o.said === true), 'a wipe: the new order is chalked in view, marked said');
  eq(L.sayOrders(), null, '… so no line for it');
}

section('the HUD slate: its presence rule and its ticks (pure)');
{
  const one = [{ id: 'a', speciesId: 'dusk_minnow' }];
  const base = { trip: true, flow: 'playing', orders: one, fishing: 'idle', modal: null };
  ok(G.slateShown(base), 'on a trip, an order open: shown');
  ok(G.slateShown({ ...base, fishing: 'waiting' }) && G.slateShown({ ...base, fishing: 'casting' }), '… while the float waits or the cast flies');
  for (const st of ['bite', 'reeling', 'landing']) ok(!G.slateShown({ ...base, fishing: st }), `… hidden: ${st} (the bite, the strike's gauge, the play)`);
  ok(!G.slateShown({ ...base, modal: 'catch' }), '… hidden under the catch show (a screen over the water)');
  ok(!G.slateShown({ ...base, orders: [] }), '… no open order: none');
  ok(!G.slateShown({ ...base, trip: false }) && !G.slateShown({ ...base, flow: 'home' }), '… not at home, not off a trip');
  const orders = [{ id: 'a', speciesId: 'dusk_minnow', kind: 'count', n: 2, have: 0 }, { id: 'b', speciesId: 'weeping_carp', kind: 'count', n: 1, have: 0 }];
  const fish = (id, uid) => ({ uid, speciesId: id, sizeClass: 'keeper' });
  let m = G.slateOrders(D, orders, [fish('dusk_minnow', 1)]);
  eq(m.map((o) => o.done), [false, false], 'one of two Dusk Minnows in the hold: no tick yet');
  eq(m[0].text, '2 Dusk Minnows', '… its tip is the order\'s text');
  m = G.slateOrders(D, orders, [fish('dusk_minnow', 1), fish('dusk_minnow', 2), fish('weeping_carp', 3)]);
  eq(m.map((o) => o.done), [true, true], 'both filled: both drawings ticked');
  eq(G.slateOrders(D, [], [fish('dusk_minnow', 1)]), [], 'no orders: an empty slate');
}

section('the Journal: "Murk wants one." while an open order names the fish');
{
  const orders = [{ id: 'a', speciesId: 'dusk_minnow' }];
  ok(G.speciesWanted(orders, 'dusk_minnow') === true, 'an order names the Dusk Minnow: wanted');
  ok(G.speciesWanted(orders, 'weeping_carp') === false && G.speciesWanted([], 'dusk_minnow') === false, '… no other fish, and none with no orders');
}

console.log(`\nloop-orders: ${pass} passed, ${fail} failed`);
if (fail) { for (const f of failures) console.log('  - ' + f); process.exitCode = 1; }
