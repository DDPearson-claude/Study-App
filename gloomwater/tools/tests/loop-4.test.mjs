// M1 step 4 (lane 4): the tins and lures, the raft's parts, Murk's orders and the Matriarch a catfish (docs/loop/M1.md §4 step 4, SPEC
// §13's step-4 tests): the data against the sim's draft tables; the shelf and the `with` gate (no later-era item offered); fitting a lure
// and a bait together, their Hold never stacked; a tin's price; the Keel's and the Lantern's favour; the lures' draw (a family lure never
// raises a giant's share, its giants' lure does, ×1.5); the Gloam Eel on Lumen Moss and every one of the Mossmere's 17 biting; the orders
// engine (never a giant, never expiring, doubling exactly the fish that fill them) through the real progression; Cut Strip; the
// Matriarch's land chance on her new body; the words.
//   node tools/tests/loop-4.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';
import * as dataV1 from '../../src/data.js';               // evaluated first: no flags → the flag-off build
import { createBus } from '../../src/core.js';
import { create } from '../../src/progression.js';
import * as PL from '../../src/progression-loop.js';
import * as G from '../../src/loop-gear.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const dataV3 = await import('../../src/data.js?loop4-v3');   // v3 without the loop
const { loadLoopData, freshLoopMeta, placesMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-4' });
const SIM = await import('../sim/clams.mjs');
const U = await import('../../src/ui-loop.js');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const rng = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const OPEN = 'open:mossmere';
const ids = (items) => items.map((i) => i.id);

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

// =====================================================================================
section('the data: the sim\'s draft tables, moved (LOOP.lures, baitRule, tins, raft, home.orders)');
{
  const S = SIM.LOOP;
  for (const [id, p] of Object.entries(S.familyLures)) if (D.LOOP.lures[id]) eq(D.LOOP.lures[id].price, p, `${id}: the sim's price`);
  eq(D.LOOP.lures.bell_spinner.giants, S.giantsLures.bell_spinner, "the Harbour-Bell Spinner names the sim's three (re-aimed at the Mossmere's giants)");
  eq(D.LOOP.lures.bell_spinner.price, 180, 'the Harbour-Bell Spinner: 180 (0.3 of the old map, SPEC §4.4)');
  eq([D.LOOP.baitRule.grade, D.LOOP.baitRule.favour, D.LOOP.baitRule.tin], [S.baitRule.grade, S.baitRule.favour, S.tinSize], 'baitRule and the tin of 10: the sim\'s');
  for (const k of ['oars', 'keel', 'lantern']) eq(D.LOOP.raft[k].prices, S.raft[k].prices, `the raft's ${k}: the sim's prices`);
  eq(D.LOOP.home.orders.prices, S.home.orders.prices, "Murk's Order Board: the sim's prices");
  eq(D.LOOP.tins.mossmere, ['mireworm', 'lumen_moss'], "the Mossmere's tins: Mire Worms and Lumen Moss");
  eq(G.tinPrice(D, 'mossmere'), SIM.baitTin('mireworm', 'mossmere'), "a tin's price is the sim's baitTin (1.5 × the tier, to 5)");
  eq(G.tinPrice(D, 'mossmere'), 10, 'the Mossmere\'s tin: 10');
  ok(dataV1.LOOP.lures && dataV3.LOOP.lures && dataV1.BAITS.every((b) => b.id !== 'cut_strip') && dataV3.BAITS.every((b) => b.id !== 'cut_strip'), 'off the loop no BAITS row is added (Cut Strip is the loop\'s own)');
  eq(dataV3.CATCH_V3.items.bell_spinner.species, ['reedjaw_pike', 'weeping_carp', 'bridgechain_sturgeon'], 'off the loop the Spinner names its built three (v3 unchanged)');
  eq(D.CATCH_V3.items.bell_spinner.species, ['thousandcast_pike', 'hullkiss_lamprey', 'reedjaw_pike'], 'under the loop the Spinner names the Mossmere\'s giants and the Reedjaw');
  eq(D.BALANCE.favour.tackle.bait.mireworm, 0.3, 'a tin\'s favour +0.3 (every fish runs bigger)');
  eq(dataV3.BALANCE.favour.tackle.bait.mireworm, undefined, '… off the loop, none');
}

section('the shelf and the with gate (M1.md §2.5, SPEC §4.7, decision 38)');
{
  const fresh = PL.shelfItems(D, PL.freshLoop(D));
  const step4 = fresh.filter((i) => /^(lure|tin|cut|oars|keel|lantern|orders):/.test(i.id));
  eq(ids(step4), ['lure:feather_fly', 'lure:glimmer_spoon', 'lure:bone_jig', 'lure:bell_spinner', 'tin:mireworm', 'tin:lumen_moss', 'oars:1', 'keel:1', 'lantern:1', 'orders:1'], 'a fresh shelf: four lures, two tins, Oars I, Keel I, Lantern I, the Order Board I');
  eq(step4.map((i) => i.price), [50, 90, 110, 180, 10, 10, 60, 100, 100, 70], 'their prices (SPEC §4.4, §4.5, §4.7)');
  eq(step4.map((i) => i.tab), ['tackle', 'tackle', 'tackle', 'tackle', 'bait', 'bait', 'raft', 'raft', 'raft', 'home'], 'their tabs: Tackle, Bait, Raft, Home');
  ok(step4.every((i) => typeof i.name === 'string' && i.name && typeof i.line === 'string' && i.line), 'every card has a name and one line');
  ok(step4.every((i) => U.textAllowed(i.name, { D }) && U.textAllowed(i.line, { D })), 'every name and line passes the allow-list');
  const maxed = { ...PL.freshLoop(D), raft: { oars: 2, keel: 2, lantern: 2 }, home: { orders: 2, baitBed: 0, wall: 0, lights: 0 }, lures: ['feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner'] };
  const top = PL.shelfItems(D, maxed);
  ok(!top.some((i) => i.id === 'keel:3' || i.id === 'orders:3' || i.id === 'oars:3' || i.id === 'lantern:3'), 'the with gate: no Keel III (the Pallid Deep\'s), no Order Board III (Glasswater\'s), no Oars III or Lantern III (cut)');
  eq(top.filter((i) => /^(oars|keel|lantern|orders):/.test(i.id)).map((i) => [i.id, i.bought]), [['oars:2', true], ['keel:2', true], ['lantern:2', true], ['orders:2', true]], 'at II each reads Yours. for good');
  ok(top.filter((i) => i.slot === 'lure').every((i) => i.bought), 'the four lures owned: Yours.');
  ok(!top.some((i) => /moth_popper|lantern_lure|spore_cake|ember_roe|glass_larva|shimmerfly|sporelamp|mirror_shard|ferry_coin/.test(i.id)), 'no later water\'s lure or tin is offered (the Moth Popper, the Lantern Lure, Spore Cake …)');
  const goal = PL.goalOf(top.filter((i) => !/^(bait|place|lake|hold|rod|line|reel):/.test(i.id) && !(i.tab === 'home' && !/^orders:/.test(i.id))));   // (M1 step 5b's home cards aside: loop-5b.test.mjs's)
  eq(goal, null, 'every step-4 permanent owned: no goal among them (a tin is a consumable, never the goal)');
  ok(PL.goalOf(fresh)?.id === 'hold:4', 'the goal line is still Hold 4 · 30 first (the cheapest)');
}

section('buy, fit, the bag (SPEC §4.4, §4.5, §5.4)');
{
  const env = makeEnv({ meta: placesMeta(D, { own: ['buoy_lights'], holdSlots: 5 }) });
  const L = env.L, ml = env.ctx.state.meta.loop;
  ml.clams = 2000;
  ok(L.fit('lure', 'glimmer_spoon').ok === false, 'a lure not owned cannot be fitted');
  ok(L.buy('lure:glimmer_spoon').ok && ml.lures.includes('glimmer_spoon') && ml.clams === 1910, 'buy the Glimmer Spoon: owned for good, 90 off');
  ok(L.buy('lure:glimmer_spoon').ok === false, '… bought once');
  const f = L.fit('lure', 'glimmer_spoon');
  ok(f.ok && ml.fitted.lure === 'glimmer_spoon' && env.last('loop:fit')?.slot === 'lure', 'fit it: fitted.lure, loop:fit {slot: lure}');
  ok(L.fit('bait', 'lumen_moss').ok === false, 'a tin not in the bag cannot be fitted');
  ok(L.buy('tin:lumen_moss').ok && ml.bait.mossmere.lumen_moss === 10 && ml.clams === 1900, 'a tin of Lumen Moss: 10 in the bag for 10');
  ok(L.buy('tin:lumen_moss').ok && ml.bait.mossmere.lumen_moss === 20, '… a second tin: 20 (a consumable, always on the shelf)');
  ok(L.fit('bait', 'lumen_moss').ok && ml.fitted.bait === 'lumen_moss' && ml.fitted.lure === null, 'one thing on the hook: fitting a bait takes the lure off');
  ok(L.fit('lure', 'glimmer_spoon').ok && ml.fitted.lure === 'glimmer_spoon' && ml.fitted.bait === null && ml.bait.mossmere.lumen_moss === 20, '… and fitting the lure takes the bait off (it stays in the bag)');
  ok(L.buy('oars:2').ok === false, 'Oars II is refused before Oars I');
  ok(L.buy('oars:1').ok && ml.raft.oars === 1, 'Oars I');
  ok(PL.shelfItems(D, ml, ['oars:1']).find((i) => i.slot === 'oars')?.bought === true, '… reads Yours. in place while the shelf is open');
  env.ctx.bus.emit('ui:modal', { open: false, id: 'shelf' });
  ok(L.buy('oars:2').ok && ml.raft.oars === 2, 'Oars II');
  ok(L.buy('keel:1').ok && L.buy('lantern:1').ok && ml.raft.keel === 1 && ml.raft.lantern === 1, 'Keel I and Lantern I');
  ok(L.buy('orders:1').ok && ml.home.orders === 1 && ml.orders.length === 1, 'the Order Board I: Murk chalks one order at once');
  // the trip: the line carries the one thing on the hook (the lure); the loadout's Hold is the lure's
  const r = startTrip(env);
  ok(r.lure === 'glimmer_spoon' && !r.equippedBait && r.bait.lumen_moss === 20, 'on a trip the line carries the lure (run.lure) and no bait; the tins ride in the bag');
  const lo = env.P.getLoadout();
  ok(lo.item === 'glimmer_spoon' && !lo.upgrade, 'the loadout: the lure as the item, nothing beside it', lo);
  const parts = D.catchParts('reedjaw_pike', 'prize', lo, {});
  eq(parts.terms.item, D.catchItemHold('glimmer_spoon', 'reedjaw_pike'), 'the Reedjaw: the lure\'s Hold');
  ok(L.fit('bait', 'lumen_moss').ok && r.equippedBait === 'lumen_moss' && !r.lure, 'on the lake a bait fitted takes the lure off the line');
  const eelParts = D.catchParts('gloam_eel', 'keeper', env.P.getLoadout(), {});
  eq(eelParts.terms.item, 5, 'the Gloam Eel (a glow fish) on Lumen Moss: +5');
  const st = env.P.getStats();
  near(st.moveSpeed, 6 + 2 * 1.5, 'Oars II: raft speed 6 → 9');
  near(st.lightRadius, 8 * 1.15, 'Lantern I: the light 15% farther');
  // the cast spends a tin; a pass gives it back (the built consumeBait / refundBait)
  const id = env.P.consumeBait();
  ok(id === 'lumen_moss' && r.bait.lumen_moss === 19, 'a cast spends one bait');
  ok(env.P.refundBait('lumen_moss') === true && r.bait.lumen_moss === 20, 'a pass gives it back');
  ok(env.events.every((e) => e.evt !== 'toast'), 'no toast on a trip (the out-of-bait line is not the loop\'s)');
}

section('the Keel and the Lantern on the favour; the lures on the pool (SPEC §3.5, §4.4, §7)');
{
  eq(G.raftTerms(D, { raft: { keel: 2, lantern: 1 } }, 'calm'), [{ family: 'tackle', id: 'keel', value: 0.2 }], 'Keel II: +0.2 everywhere; the Lantern nothing by day');
  eq(G.raftTerms(D, { raft: { keel: 1, lantern: 2 } }, 'gloomtide'), [{ family: 'tackle', id: 'keel', value: 0.1 }, { family: 'tackle', id: 'lantern', value: 0.2 }], 'at night: Keel I +0.1, Lantern II +0.2');
  eq(G.raftTerms(D, { raft: { keel: 0, lantern: 0 } }, 'gloomtide'), [], 'no part: no term');
  const pool = D.placePool(D.SPECIES, { placeId: 'under_the_span', phase: 'dusk', water: 'mossmere' });
  const fam = G.lurePool(D, pool, { lure: 'glimmer_spoon', phase: 'dusk' });
  const famShare = fam.giant.weight / fam.tot, base = pool.giant.weight / pool.tot;
  near(base, D.LOOP.giant.share.inHour, 'the Thousandcast\'s share at dusk at Under the Span: 6%');
  near(famShare, base, 'a family lure does not raise a giant\'s share', 1e-12);
  const pike = (p) => p.list.find(([s]) => s.id === 'reedjaw_pike')[1];
  near(pike(fam), pike(pool) * 2.5, 'the Glimmer Spoon draws a predator ×2.5 (its built attract)');
  const sp = G.lurePool(D, pool, { lure: 'bell_spinner', phase: 'dusk' });
  near(sp.giant.weight / sp.tot, base * 1.5, 'its giants\' lure: ×1.5 the giant\'s share');
  near(pike(sp), pike(pool) * 1.5, '… and ×1.5 on the fish it names (the Reedjaw)');
  const tp = G.lurePool(D, D.placePool(D.SPECIES, { placeId: 'under_the_span', phase: 'dusk', water: 'mossmere', wickId: 'taper' }), { lure: 'bell_spinner', phase: 'dusk', wickId: 'taper' });
  near(tp.giant.weight / tp.tot, Math.min(0.12, 0.06 * 1.5 * 1.3), 'Taper with the Spinner: ×1.3 more, never above 12%');
  eq(G.lurePool(D, pool, { lure: null }), pool, 'no lure: the pool as it was');
}

section('every fish bites by step 4 (M1.md §2.3): the Gloam Eel on Lumen Moss, at the Buoy Lights, after dark');
{
  const at = (placeId, phase, bait) => new Set(D.placePool(D.SPECIES, { placeId, phase, bait, water: 'mossmere' }).list.map(([s]) => s.id));
  ok(at('buoy_lights', 'gloomtide', 'lumen_moss').has('gloam_eel'), 'the Gloam Eel bites at the Buoy Lights at night on Lumen Moss');
  ok(!at('buoy_lights', 'gloomtide', null).has('gloam_eel') && !at('buoy_lights', 'gloomtide', 'mireworm').has('gloam_eel'), '… on nothing else (a bare hook, Mire Worms)');
  ok(!at('buoy_lights', 'calm', 'lumen_moss').has('gloam_eel') && !at(null, 'gloomtide', 'lumen_moss').has('gloam_eel'), '… never by day, never in open water');
  const bites = new Set();
  for (const placeId of [null, 'lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool']) for (const phase of ['calm', 'dusk', 'gloomtide']) for (const bait of [null, 'mireworm', 'lumen_moss']) {
    const p = D.placePool(D.SPECIES, { placeId, phase, bait, water: 'mossmere' });
    for (const [s] of p.list) bites.add(s.id);
    if (p.giant) bites.add(p.giant.sp.id);
  }
  bites.add('belled_matriarch');   // her sure bite is her own (her pool, her bait, her hour: loop-trip's T107)
  const moss = D.SPECIES.filter((s) => s.zone === 'mossmere' && !s.cove).map((s) => s.id);
  eq(moss.length, 17, 'the Mossmere has 17 fish');
  eq(moss.filter((id) => !bites.has(id)), [], 'all 17 bite somewhere, in some light, on some bait (the Matriarch on her ball)');
  const shelf = PL.shelfItems(D, PL.freshLoop(D));
  ok(shelf.some((i) => i.id === 'tin:lumen_moss'), '… and Lumen Moss is on the shelf, so the Gloam Eel can be caught');
}

section('the catalogue: the Gloam Eel\'s card carries the Lumen Moss tin glyph, no rate (SPEC §8.8, M1.md §2.17)');
{
  const cat = PL.catalogueFor({ journal: {}, loop: PL.freshLoop(D) }, D, 'mossmere');
  const all = [...cat.list, ...cat.groups.flatMap((g) => g.entries)];
  const eel = all.find((e) => e.id === 'gloam_eel');
  ok(eel && eel.bait === 'lumen_moss', 'the Gloam Eel\'s entry names its tin (Lumen Moss)', eel);
  ok(Object.values(eel || {}).every((v) => typeof v !== 'number'), '… and carries no number (no rate)');
  ok(all.find((e) => e.id === 'belled_matriarch')?.bait === 'heartmoss', 'the Matriarch keeps her ball\'s glyph');
}

section('Murk\'s orders (SPEC §6.3, §8.2, §8.3): never a giant, never expiring, doubling exactly the fish that fill them');
{
  const ml = { ...PL.freshLoop(D), home: { orders: 2, baitBed: 0, wall: 0, lights: 0 }, maps: { lakes: ['mossmere'], places: ['under_the_span'] } };
  const r0 = rng(7);
  let low = 0, n = 0;
  const seen = new Set();
  for (let i = 0; i < 3000; i++) {
    const o = G.newOrder(D, ml, { rng: r0, listFor: PL.listFor });
    if (!o) continue;
    n++; seen.add(o.speciesId);
    const sp = D.SPECIES_BY_ID[o.speciesId];
    if (sp.rarity === 'common' || sp.rarity === 'uncommon') low++;
    if (sp.giant || sp.rarity === 'legendary' || sp.rarity === 'epic') { ok(false, `an order named ${o.speciesId}`); break; }
    if (o.kind === 'heavy') ok(o.oz > 0, `a weight order has its ounces (${o.speciesId})`);
  }
  near(low / n, 2 / 3, 'two orders in three ask for a common or uncommon fish', 0.03);
  ok(!seen.has('thousandcast_pike') && !seen.has('hullkiss_lamprey') && !seen.has('belled_matriarch') && !seen.has('gloam_eel'), 'never a giant, the legend or a one-tin fish');
  ok(seen.has('bridgechain_sturgeon'), 'an owned place\'s own fish may be asked for (the Bridgechain, Under the Span owned)');
  const m2 = clone(ml); m2.orders = [];
  G.refillOrders(D, m2, { rng: rng(3), listFor: PL.listFor });
  eq(m2.orders.length, 2, 'the Order Board II: two orders');
  ok(m2.orders[0].speciesId !== m2.orders[1].speciesId, '… never the same fish twice');
  // phrases
  const o1 = { id: 'a', speciesId: 'dusk_minnow', kind: 'count', n: 2, have: 0 };
  eq(G.orderPhrase(D, o1), '2 Dusk Minnows', 'a count order: "2 Dusk Minnows"');
  eq(G.orderPhrase(D, { ...o1, have: 1 }), 'a Dusk Minnow', '… one in: "a Dusk Minnow"');
  eq(G.orderPhrase(D, { id: 'b', speciesId: 'weeping_carp', kind: 'class', cls: 'prize', n: 1, have: 0 }), 'a Prize Weeping Carp', 'a class order: "a Prize Weeping Carp"');
  eq(G.orderPhrase(D, { id: 'c', speciesId: 'overbold_bass', kind: 'count', n: 1, have: 0 }), 'an Overbold Bass', '"an Overbold Bass"');
  const heavy = { id: 'd', speciesId: 'reedjaw_pike', kind: 'heavy', n: 1, have: 0, oz: 144 };
  eq(G.orderPhrase(D, heavy), 'a Reedjaw Pike over 9\u00a0lb\u00a00\u00a0oz', 'a weight order: "a Reedjaw Pike over 9 lb 0 oz" (the figure held together by non-breaking spaces)');
  ok(U.textAllowed(G.orderPhrase(D, heavy), { D }), 'the allow-list takes the weight order as drawn (non-breaking spaces)');
  for (const t of ['2 Dusk Minnows', 'a Dusk Minnow', 'a Prize Weeping Carp', 'an Overbold Bass', 'a Reedjaw Pike over 9 lb 0 oz', '3 Mossback Perch'])
    ok(U.textAllowed(t, { D }), `the allow-list takes "${t}"`);
  for (const t of ['2 Dragons', 'a Prize Dragon', 'a Reedjaw Pike over lots', 'an order']) ok(!U.textAllowed(t, { D }), `… and refuses "${t}"`);
  // matching
  const fishOf = (speciesId, length, sizeClass = 'keeper', uid = speciesId + length) => ({ uid, speciesId, length, sizeClass, z: 0 });
  const big = D.sizeLength(D.SPECIES_BY_ID.reedjaw_pike, 2.5), small = D.sizeLength(D.SPECIES_BY_ID.reedjaw_pike, -1);
  ok(G.orderMatches(D, heavy, fishOf('reedjaw_pike', big)) && !G.orderMatches(D, heavy, fishOf('reedjaw_pike', small)), 'a weight order: over its ounces as the card shows them');
  ok(G.orderMatches(D, { kind: 'class', cls: 'prize', speciesId: 'weeping_carp' }, fishOf('weeping_carp', 50, 'trophy')) && !G.orderMatches(D, { kind: 'class', cls: 'prize', speciesId: 'weeping_carp' }, fishOf('weeping_carp', 30, 'keeper')), 'a class order: that class or bigger');
  ok(!G.orderMatches(D, { kind: 'count', speciesId: 'thousandcast_pike' }, { ...fishOf('thousandcast_pike', 100), giant: true }), 'a giant never fills an order');
  const res = G.assignOrders(D, [o1], [fishOf('dusk_minnow', 8, 'keeper', 'u1'), fishOf('dusk_minnow', 9, 'keeper', 'u2'), fishOf('dusk_minnow', 10, 'keeper', 'u3')]);
  eq([...res.fills.keys()], ['u1', 'u2'], 'two Dusk Minnows wanted: the first two fill it, the third does not');
  eq(res.filled, ['a'], '… and the order is filled (gone)');
  const part = G.assignOrders(D, [o1], [fishOf('dusk_minnow', 8, 'keeper', 'u1')]);
  ok(part.filled.length === 0 && part.orders[0].have === 1, 'one of two: the order stays (never expiring), one counted');
}

section('the orders through the real progression: the card\'s tick, the tally\'s double, the next visit\'s new order');
{
  const meta = placesMeta(D, { own: [], holdSlots: 5 });
  meta.loop.clams = 500;
  meta.loop.wick = 'stub';   // (no Curious firsts: every fish's sale is its price or its order's double)
  const env = makeEnv({ meta });
  const L = env.L, ml = meta.loop;
  ok(L.buy('orders:1').ok && ml.orders.length === 1, 'the board bought: one order');
  ml.orders = [{ id: 'ord_t', speciesId: 'dusk_minnow', kind: 'count', n: 2, have: 0 }];
  ok(L.orders()[0].text === '2 Dusk Minnows', 'orders(): each with its chalked text');
  startTrip(env);
  const f1 = land(env, 'dusk_minnow', 0.2);
  ok(L.orderFor(f1) === 'ord_t', 'a Dusk Minnow on the card fills the order (the chalk tick)');
  ok(L.keep(f1).ok, 'keep it');
  const f2 = land(env, 'mossback_perch', 0.2);
  ok(L.orderFor(f2) === null, 'a Mossback Perch fills none');
  L.keep(f2);
  const f3 = land(env, 'dusk_minnow', 0.4);
  ok(L.orderFor(f3) === 'ord_t', 'a second Dusk Minnow: the order\'s second');
  L.keep(f3);
  const f4 = land(env, 'dusk_minnow', 0.1);
  ok(L.orderFor(f4) === null, 'a third: the order is full with the two in the hold');
  L.keep(f4);
  const base = (f) => L.priceOf(f);
  const T = L.endTrip();
  const lineOf = (f) => T.lines.find((l) => l.uid === f.uid);
  const doubled = [f1, f3, f4].filter((f) => lineOf(f).order === true);
  eq(doubled.length, 2, 'exactly two lines carry the chalk tick');
  ok(doubled.every((f) => lineOf(f).clams === 2 * lineOf(f).base), '… and sell for double');
  ok([f1, f3, f4].filter((f) => !lineOf(f).order).every((f) => lineOf(f).clams === lineOf(f).base) && lineOf(f2).clams === lineOf(f2).base, 'every other fish at its price');
  eq(T.total, T.lines.reduce((a, l) => a + l.clams, 0), 'the total is the sum');
  ok(!ml.orders.some((o) => o.id === 'ord_t') && ml.orders.length === 1, 'the filled order is gone; Murk chalks a new one for the next visit');
  ok(L.wipeOrder(ml.orders[0].id).ok && ml.orders.length === 1, 'tap an order to wipe it: Murk chalks another');
  void base;
}

section('Cut Strip (SPEC §3.2, §4.5): a held Let go on a Small or a Keeper');
{
  const meta = placesMeta(D, { own: [], holdSlots: 5 });
  const env = makeEnv({ meta });
  const L = env.L;
  const r = startTrip(env);
  const small = land(env, 'dusk_minnow', -1.2);
  ok(small.sizeClass === 'small', 'a Small Dusk Minnow on the card');
  const spent = r.bites[OPEN];
  const res = L.cutBait(small);
  ok(res.ok && r.bait.cut_strip === 3 && r.bites[OPEN] === spent, 'cut into three strips (no bite back, no favour)');
  const prize = land(env, 'reedjaw_pike', 1.4);
  ok(L.cutBait(prize).ok === false || prize.sizeClass === 'small' || prize.sizeClass === 'keeper', 'a Prize or bigger is never cut');
  ok(L.fit('bait', 'cut_strip').ok && r.equippedBait === 'cut_strip', 'Cut Strip fits the bait slot');
  L.endTrip();
  eq(meta.loop.bait.mossmere.cut_strip, 3, 'the strips come home in the bag');
  ok(!PL.shelfItems(D, meta.loop).some((i) => /cut_strip/.test(i.id)), 'Cut Strip is never on the shelf (never sold)');
}

section('the Matriarch a catfish (M1.md §2.3, §2.4): her plan, her land chance unchanged');
{
  const bm = D.SPECIES_BY_ID.belled_matriarch;
  eq(bm.model.shape, 'catfish', 'her plan is the catfish');
  ok(D.FISH_SHAPES.includes('catfish') && !dataV3.FISH_SHAPES.includes('catfish'), 'the catfish shape is the loop\'s only');
  eq(dataV3.SPECIES_V3_BY_ID.belled_matriarch.model.shape ?? 'carp', dataV3.SPECIES_BY_ID.belled_matriarch?.model?.shape ?? 'carp', 'off the loop her plan is as built');
  const T1 = { rod: 1, line: 1, reel: 1 };
  const p = D.catchChance('belled_matriarch', 'legend', T1, {});
  const pv3 = dataV3.catchChance('belled_matriarch', 'legend', T1, {});
  near(p, pv3, 'her first-try chance at T1 is the built one on her new body');
  near(p, 0.27, 'about 27% at T1 (the sim\'s)', 0.006);
}

section('the Chart\'s slots (ui-gear.js, pure): the bait slot cycles the bag, the lure slot the owned lures');
{
  const UG = await import('../../src/ui-gear.js');
  const ml = { ...PL.freshLoop(D), lures: ['bone_jig', 'glimmer_spoon'], bait: { mossmere: { heartmoss: 1, lumen_moss: 4, cut_strip: 0 } }, fitted: { lure: null, bait: null } };
  eq(UG.baitChoices(D, ml, 'mossmere').map((c) => [c.id, c.count]), [['heartmoss', 1], ['lumen_moss', 4]], 'the bait slot\'s choices: the bag\'s ball and tins (none at 0)');
  eq(UG.lureChoices(D, ml).map((c) => c.id), ['glimmer_spoon', 'bone_jig'], 'the lure slot\'s: the owned lures in LOOP.lures\' order');
  eq([UG.nextChoice(UG.baitChoices(D, ml), null), UG.nextChoice(UG.baitChoices(D, ml), 'heartmoss'), UG.nextChoice(UG.baitChoices(D, ml), 'lumen_moss')], ['heartmoss', 'lumen_moss', null], 'a tap takes the next, and after the last a bare hook');
  ok(UG.baitChoices(D, { ...ml, fitted: { bait: 'mireworm' } }).some((c) => c.id === 'mireworm' && c.count === 0), 'the fitted one stays a choice at 0 (so it can be taken off)');
}

section('the words (SPEC §8.4, §8.6)');
{
  const TL = D.TEXT_LOOP;
  eq([TL.shelf.oars, TL.shelf.keel, TL.shelf.lantern, TL.shelf.orders], ['Faster.', 'Bigger fish.', 'Bigger fish at night.', 'Orders pay double.'], 'the raft\'s and the board\'s lines, SPEC §8.4');
  eq(TL.shelf.bell_spinner, 'For the Thousandcast Pike.', 'a giants\' lure: "For the {first giant}."');
  eq(TL.shelf.lumen_moss, 'Sweet. The Gloam Eel bites on nothing else.', 'Lumen Moss: the one-tin line (SPEC v8.7 §8.11, WC-1)');
  eq(['mireworm', 'cut_strip', 'feather_fly', 'glimmer_spoon', 'bone_jig'].map((id) => TL.shelf[id]), ['Nearly every fish takes a worm.', 'Meat, for the hunters.',
    'For the fish that rise.', 'Flash, for the hunters.', 'Hopped on the bottom, for the hunters.'], 'the tins\' and lures\' lines, SPEC v8.7 §8.11 (WC-1)');
  eq(TL.murk.firstSmall, 'Small ones make good bait. Hold Let go.', "Murk's first-Small line, SPEC §8.6");
  const strings = [];
  const walk = (v) => { if (typeof v === 'string') strings.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk(TL.shelf); walk(TL.gearNames); walk(TL.gearItems); walk(TL.orderWords);
  ok(strings.every((s) => !s.includes('%')), 'no percentage in the new words');
}

console.log(`\nloop-4: ${pass} passed, ${fail} failed`);
if (fail) { for (const f of failures) console.log('  - ' + f); process.exitCode = 1; }
