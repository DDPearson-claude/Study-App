// tools/tests/loop-finds.test.mjs — M1 step 5c (lane 5C): the Mossmere's finds (docs/loop/FINDS.md §12's tests, M1.md §2.16, §2.17).
// The pure rules (src/loop-finds.js, data.findShares), the ledger on a real progression (the snag roll, a good bite spent, keep and
// let go, the tally, the parts' effects, the catalogue's finds row), the 1% rule over 100,000 seeded snags in three states, the find
// plan, and the catch path in a real fishing.js (a snag's bite carries sizeClass 'find'; its landing emits fishing:found and never
// fishing:caught, fish:measured or fish:landed). Run: node tools/tests/loop-finds.test.mjs
import * as THREE from 'three';
import { createBus } from '../../src/core.js';
import * as LF from '../../src/loop-finds.js';

const { loadLoopData, freshLoopMeta, fakeLoop } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-finds' });
const { create } = await import('../../src/progression.js');
const PL = await import('../../src/progression-loop.js');
const { findPlan, presentAt, mulberry32 } = await import('../../src/fishing-play.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const OPEN = 'open:mossmere';
const F = D.LOOP.finds, items = LF.findsOf(D, 'mossmere');
const PARTS = items.filter((i) => i.kind === 'part').map((i) => i.id), LOOKS = items.filter((i) => i.kind === 'look').map((i) => i.id);
const SIX = [...PARTS, ...LOOKS];
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const metaWith = ({ got = {}, share = null } = {}) => { const m = freshLoopMeta(D); m.loop.finds = { got: { ...got }, worn: {}, share: share == null ? {} : { mossmere: share } }; return m; };

// ------------------------------------------------------------------ the data (FINDS §5.1, §10)
section('the data: the Mossmere\'s eleven');
eq(items.length, 11, 'eleven finds at the Mossmere');
eq(new Set(F.items.map((i) => i.id)).size, F.items.length, 'ids unique');
eq(items.filter((i) => i.kind === 'treasure').map((i) => i.grade), ['plain', 'fine', 'precious', 'rare', 'jackpot'], 'five treasures, one per grade, plain to jackpot');
eq(items.filter((i) => i.kind === 'part').map((i) => i.effect).sort(), ['bait', 'bite', 'order'], 'three parts, one of each effect');
eq(items.filter((i) => i.kind === 'look').map((i) => i.wearer).sort(), ['barge', 'raft', 'wick'], 'three looks, one per wearer');
near(sum(Object.fromEntries(Object.entries(F.grades).map(([k, g]) => [k, g.share]))), 1, 'the grade shares sum to 1');
eq(F.grades.jackpot.share, 0.01, 'the jackpot is exactly 1% of the snags');
eq(items.filter((i) => i.kind === 'treasure').map((i) => LF.findValue(D, i.id)), [14, 42, 105, 350, 1750], 'the treasures sell for tier × x: 14, 42, 105, 350, 1,750');
for (const it of items) {
  const w = D.TEXT_LOOP.finds.items[it.id];
  ok(w && w.name && w.line && w.line.trim().split(/\s+/).length <= 8, `${it.id}: a name and a line of ≤ 8 words`);
}
ok(!JSON.stringify([D.LOOP.finds, D.TEXT_LOOP.finds]).includes('%'), 'no percentage literal in LOOP.finds or TEXT_LOOP.finds (no rate is typed)');
eq(D.findShares, D.findShares && typeof D.findShares === 'function' ? D.findShares : null, 'data.findShares exported');

// ------------------------------------------------------------------ findShares, the one draw (FINDS §4.1a, §10; SPEC §8.8)
section('findShares and the catalogue\'s rates');
const fresh = D.findShares(freshLoopMeta(D), D, 'mossmere');
near(sum(fresh), 1, 'a fresh set: the shares sum to 1');
eq(fresh.toll_purse, 0.01, 'a fresh set: the Purse 1%');
eq(['tin_spoon', 'door_ring', 'salt_lens', 'two_headed_coin', 'toll_purse'].map((id) => LF.fmtRate(fresh[id])), ['31%', '17%', '12%', '4%', '1%'], 'a fresh set reads 31% · 17% · 12% · 4% · 1%');
ok(SIX.every((id) => LF.fmtRate(fresh[id]) === '5.8%'), 'a fresh set: each part and look 5.8% (35% ÷ 6)');
const mid = D.findShares(metaWith({ share: 0.5 }), D, 'mossmere');
near(sum(mid), 1, 'after one treasure snag (share 50%): the shares sum to 1');
ok(SIX.every((id) => LF.fmtRate(mid[id]) === '8.3%') && mid.toll_purse === 0.01, 'after a treasure snag: each part 8.3% (50% ÷ 6), the Purse still 1%');
const oneLeft = D.findShares(metaWith({ got: Object.fromEntries(SIX.slice(1).map((id) => [id, 1])) }), D, 'mossmere');
near(sum(oneLeft), 1, 'one left: the shares sum to 1');
near(oneLeft[SIX[0]], 0.35, 'one left: it has the whole kind share (35%)');
const owned = D.findShares(metaWith({ got: Object.fromEntries(SIX.map((id) => [id, 1])) }), D, 'mossmere');
near(sum(owned), 1, 'the set owned: the shares sum to 1');
ok(SIX.every((id) => owned[id] === 0) && near.length >= 0, 'the set owned: no part or look is ever drawn again');
near(owned.tin_spoon, 0.54, 'the set owned: the plain 54%'); near(owned.door_ring, 0.29, '… the fine 29%');
const cap = D.findShares(metaWith({ share: 0.99 }), D, 'mossmere');
ok(cap.tin_spoon >= 0.01 && cap.door_ring >= 0.01 && SIX.every((id) => cap[id] >= 0.01), 'at the cap (80%): the plain and fine keep ≥ 1% and nothing is rarer than the jackpot');
for (const [name, s] of [['fresh', fresh], ['mid', mid], ['one left', oneLeft], ['owned', owned], ['cap', cap]]) ok(Object.values(s).filter((x) => x > 0).every((x) => x >= 0.01 - 1e-12), `${name}: no find of the water is rarer than the jackpot`);
const ex = D.findShares(freshLoopMeta(D), D, 'mossmere', { exclude: ['buoy_bell'] });
ok(ex.buoy_bell === 0 && Math.abs(sum(ex) - 1) < 1e-9, 'a part already in this trip\'s hold is never drawn (its share goes to the others)');
eq(LF.fmtRate(0), null, 'never "0%" (an owned part or look shows its tick)');
eq(LF.snagHeading(D).rate, '1 bite in 20', 'the row\'s heading: "Snags · 1 bite in 20"');
const cat = PL.catalogueFor(freshLoopMeta(D), D, 'mossmere').finds;
ok(cat && [...cat.rows.treasure, ...cat.rows.part, ...cat.rows.look].every((c) => c.rate === fresh[c.id] && c.name === null), 'the catalogue\'s finds row: every rate is findShares\' and every find not had is "· · ·" (no name)');
ok(cat.rows.treasure.find((c) => c.id === 'toll_purse').gold === true, 'the jackpot\'s card is gold');
const catOwned = PL.catalogueFor(metaWith({ got: { buoy_bell: 1, tin_spoon: 3 } }), D, 'mossmere').finds;
ok(catOwned.rows.part.find((c) => c.id === 'buoy_bell').tick === true && catOwned.rows.part.find((c) => c.id === 'buoy_bell').rateText === null, 'an owned part: its tick in place of a rate');
ok(catOwned.rows.treasure.find((c) => c.id === 'tin_spoon').count === 3 && catOwned.rows.treasure.find((c) => c.id === 'tin_spoon').name === 'Bent Tin Spoon', 'a treasure had: named, with its count');
eq(PL.catalogueFor({ ...freshLoopMeta(D), loop: { ...freshLoopMeta(D).loop, maps: { lakes: ['sporewood'], places: [] } } }, D, 'mossmere').finds, null, 'a water the save does not own draws no finds row');

// ------------------------------------------------------------------ the 1% rule (FINDS §11, M1 §4 step 5c's gate)
section('the 1% rule: 100,000 seeded snags in each state');
for (const [name, m] of [['a fresh set', freshLoopMeta(D)], ['mid-set', metaWith({ got: { buoy_bell: 1, rod_tassel: 1, gate_glass: 1 }, share: 0.5 })], ['the set owned', metaWith({ got: Object.fromEntries(SIX.map((id) => [id, 1])) })]]) {
  const sh = D.findShares(m, D, 'mossmere'), rng = mulberry32(20261116), N = 100000, n = {};
  for (let i = 0; i < N; i++) { const id = LF.drawFind(sh, rng()); n[id] = (n[id] || 0) + 1; }
  const purse = (n.toll_purse || 0) / N;
  ok(Math.abs(purse - 0.01) <= 0.0007, `${name}: the Purse is ${(purse * 100).toFixed(3)}% of 100,000 snags (1% ± 0.07)`);
  ok(Object.keys(sh).every((id) => Math.abs((n[id] || 0) / N - sh[id]) <= 4 * Math.sqrt(sh[id] * (1 - sh[id]) / N) + 1e-12), `${name}: every find's seeded draw is within 4σ of findShares`);
  const g = {}; for (let i = 0; i < N; i++) { const id = LF.drawFind(sh, (i + 0.5) / N); g[id] = (g[id] || 0) + 1; }
  ok(Object.keys(sh).every((id) => Math.abs((g[id] || 0) / N - sh[id]) <= 0.001), `${name}: the draw and findShares agree to 0.1 point for every find`);
  ok(Object.entries(n).every(([, c]) => c / N >= 0.01 - 0.0007), `${name}: no find comes less often than the Purse`);
}

// ------------------------------------------------------------------ the soft guarantee (FINDS §4.1)
section('the soft guarantee');
{
  const L = freshLoopMeta(D).loop;
  eq(LF.noteSnag(L, D, 'mossmere', 'tin_spoon'), 0.5, 'a treasure while parts and looks are unowned: 35% → 50%');
  eq(LF.noteSnag(L, D, 'mossmere', 'door_ring'), 0.65, '… → 65%');
  eq(LF.noteSnag(L, D, 'mossmere', 'salt_lens'), 0.8, '… → 80%');
  eq(LF.noteSnag(L, D, 'mossmere', 'salt_lens'), 0.8, '… capped at 80%');
  eq(LF.noteSnag(L, D, 'mossmere', 'rod_tassel'), 0.35, 'a part or a look brought up: back to 35%');
  const all = metaWith({ got: Object.fromEntries(SIX.map((id) => [id, 1])) }).loop;
  eq(LF.noteSnag(all, D, 'mossmere', 'tin_spoon'), 0.35, 'with the set owned a treasure moves nothing');
}

// ------------------------------------------------------------------ the parts' three effects, at the Mossmere only (FINDS §3.2)
section('the parts\' effects');
{
  const base = D.goodBitesFor({ kind: 'open', holdSlots: 3 });
  eq(D.goodBitesFor({ kind: 'open', holdSlots: 3, extra: 1 }), base + 1, 'goodBitesFor\'s extra: one more good bite in open water');
  eq(D.goodBitesFor({ kind: 'day', holdSlots: 3, extra: 1 }), D.goodBitesFor({ kind: 'day', holdSlots: 3 }), '… and none at a place');
  const none = freshLoopMeta(D).loop, glass = metaWith({ got: { gate_glass: 1 } }).loop, bell = metaWith({ got: { buoy_bell: 1 } }).loop, boll = metaWith({ got: { moat_bollard: 1 } }).loop;
  eq([LF.findBiteBonus(none, D, 'mossmere'), LF.findBiteBonus(glass, D, 'mossmere'), LF.findBiteBonus(glass, D, 'sporewood')], [0, 1, 0], 'the Gate Lamp-Glass: +1 good bite at the Mossmere, none elsewhere');
  eq(LF.findOrderBonus(bell, D, 'mossmere'), 0, 'the Rust Buoy-Bell before Order Board I: nothing but its ring');
  bell.home.orders = 1;
  eq([LF.findOrderBonus(bell, D, 'mossmere'), LF.findOrderBonus(bell, D, 'sporewood'), LF.findOrderBonus({ ...none, home: { orders: 1 } }, D, 'mossmere')], [1, 0, 0], 'the bell with Order Board I: one more order at the Mossmere, none elsewhere or without it');
  eq(LF.findOrderWater(bell, D), 'mossmere', 'the bell\'s order is for a fish of its own water');
  eq(LF.findBaitFloor(boll, D, 'mossmere', 0), { baitId: 'mireworm', floor: 10 }, 'the Moat Bollard with no Bait Bed: a floor of one tin of Mire Worms');
  eq(LF.findBaitFloor(boll, D, 'mossmere', 10).floor, 20, 'the bollard on a Bed\'s floor: one tin more');
  eq([LF.findBaitFloor(none, D, 'mossmere', 10), LF.findBaitFloor(boll, D, 'sporewood', 0)], [{ baitId: null, floor: 10 }, { baitId: null, floor: 0 }], 'no bollard, or another water: nothing added');
}

// ------------------------------------------------------------------ the find plan (fishing-play.findPlan)
section('the find plan');
for (const [pose, dur] of Object.entries(F.haul)) {
  const p = findPlan(dur, 7);
  ok(p.sizeClass === 'find' && p.beats.every((b) => ['take', 'gain', 'lift'].includes(b.phase)) && !p.events.length && !p.lastStands.length && p.tow === 0 && p.music === null && !p.loss, `${pose}: no runs, no surges, no holds, no glimpse, no tow, no music, no loss`);
  near(p.dur, dur, `${pose}: the haul is ${dur} s`);
  const at = presentAt(p, p.dur, {});
  ok(at.done && at.k === 1, `${pose}: it comes all the way in`);
}

// ------------------------------------------------------------------ the ledger on a real progression
section('the ledger: the snag, keep, let go, the tally');
function makeEnv(meta = freshLoopMeta(D)) {
  const bus = createBus(), events = [], saves = [];
  const ctx = {
    THREE, bus, data: D, state: { meta, run: null }, time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {}, core: { debugEnabled: () => false },
    game: { save() { saves.push(clone({ meta: ctx.state.meta, run: ctx.state.run?.active ? ctx.state.run : null })); } },
    survival: { getPhaseInfo: () => ({ phase: 'calm', day: 1, time: 0, duration: 40, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(), isNear() { return true; } }, combat: { addXp() {} },
    fishing: { state: 'idle', spots: [], signs: [], addSpots() {}, armChum() {} }, ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const oe = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { events.push({ e, p }); oe(e, p); };
  ctx.progression = create(ctx); ctx.progression.init();
  return { ctx, bus, events, saves, P: ctx.progression, L: ctx.progression.loop, count: (e) => events.filter((x) => x.e === e).length };
}
function startTrip(env, { evening = null } = {}) {
  const r = env.P.createRun({ startZone: 'mossmere', character: 'wick', nightMode: 'still', outing: 'trip' });
  if (evening != null) r.evening = evening;
  env.ctx.state.run = r; env.ctx.flow = 'playing';
  env.bus.emit('zone:change', { zone: r.zone, prev: null, sail: true });
  env.bus.emit('run:start', { continued: false });
  return r;
}
const played = () => { const m = freshLoopMeta(D); Object.assign(m.loop, { wick: 'wick', tutorial: { done: true, step: null }, evenings: 3, holdSlots: 4 }); return m; };
{
  const E = makeEnv(played()), r = startTrip(E);
  ok(r.evening >= 2, 'a played save: the fourth evening');
  // the snag share over 20,000 bites
  const rng = mulberry32(5), N = 20000;
  let snags = 0;
  for (let i = 0; i < N; i++) if (E.L.snagRoll({ rng })) snags++;
  ok(Math.abs(snags / N - 0.05) <= 0.005, `over 20,000 bites the snag share is ${(snags / N * 100).toFixed(2)}% (5% ± 0.5)`);
  let legend = 0, tut = 0;
  for (let i = 0; i < 2000; i++) { if (E.L.snagRoll({ rng, legendCast: true })) legend++; if (E.L.snagRoll({ rng, tutorial: true })) tut++; }
  eq([legend, tut], [0, 0], 'never on a legend\'s cast, never in the tutorial');
  // a snag spends a good bite
  const left0 = E.L.bitesLeft(OPEN);
  E.bus.emit('fishing:bite', { sizeClass: 'find', biteTell: 'sinkUnder', waterKey: OPEN });
  eq(E.L.bitesLeft(OPEN), left0 - 1, 'a snag spends one good bite of its water');
  eq(r.flags.openBite, OPEN, 'the snag\'s bite is open');
  const e1 = E.L.noteFound({ findId: 'tin_spoon', waterKey: OPEN });
  ok(e1 && e1.find === 'tin_spoon' && e1.kind === 'treasure' && e1.clams === 14 && e1.waterKey === OPEN, 'noteFound: the hold entry the card offers (the spoon, 14)');
  eq(r.flags.openBite, null, 'noteFound closes the open bite (a find never reaches the measure)');
  near(E.L.state().finds.share.mossmere, 0.5, 'the soft guarantee moved (a treasure snag: 50%)');
  const kp = E.L.keepFind(e1);
  ok(kp.ok && r.creel.length === 1 && r.creel[0].find === 'tin_spoon', 'Keep: the find takes one slot like a fish');
  eq(E.L.hold().fish.length, 1, 'the hold reads it');
  // let go: the bite back, no favour
  E.bus.emit('fishing:bite', { sizeClass: 'find', waterKey: OPEN });
  const e2 = E.L.noteFound({ findId: 'buoy_bell', waterKey: OPEN });
  const before = E.L.bitesLeft(OPEN), mercy0 = r.mercy?.[OPEN] ?? 0;
  const lg = E.L.letGoFind(e2);
  ok(lg.ok && lg.gained.bite === 1 && lg.gained.favour === 0, 'Let go: the bite back, no favour');
  eq(E.L.bitesLeft(OPEN), before + 1, '… the good bite is refunded');
  eq(r.mercy?.[OPEN] ?? 0, mercy0, '… and no let-go favour is added (the favour is a fish\'s)');
  eq(E.L.letGoFind(r.creel[0]).ok, false, 'a kept find cannot be let go (kept stays kept)');
  // fill the hold: a full hold refuses Keep
  for (const id of ['door_ring', 'gate_glass', 'toll_purse']) { E.L.keepFind(E.L.noteFound({ findId: id, waterKey: OPEN })); }
  ok(E.L.holdFull(), 'four finds fill Hold 4');
  const full = E.L.keepFind(E.L.noteFound({ findId: 'salt_lens', waterKey: OPEN }));
  ok(!full.ok && full.full === true, 'a full hold refuses Keep');
  const fishEvents = E.count('fish:measured') + E.count('fish:landed');
  eq(fishEvents, 0, 'no fish:measured and no fish:landed for a find');
  // the tally: treasures paid exactly tier × x, the jackpot last, a part carried aboard for nothing
  const clams0 = E.L.state().clams;
  const t = E.L.endTrip();
  eq(t.lines.map((l) => l.find), ['tin_spoon', 'door_ring', 'toll_purse', 'gate_glass'], 'the tally: treasures by value, the jackpot last and alone, then the part');
  eq(t.lines.map((l) => l.clams), [14, 42, 1750, 0], '… each treasure paid tier × x, the part for nothing');
  eq(t.total, 1806, '… the total');
  eq(E.L.state().clams - clams0, 1806, 'the clams are paid');
  const again = E.L.endTrip();
  ok(again.already === true && E.L.state().clams - clams0 === 1806, 'a second tally (a reload during it) pays once');
  eq(E.L.state().finds.got, { tin_spoon: 1, door_ring: 1, toll_purse: 1, gate_glass: 1 }, 'each find brought home is counted; the Gate Lamp-Glass is fitted');
  eq(Object.keys(E.ctx.state.meta.journal || {}).filter((k) => ['tin_spoon', 'gate_glass'].includes(k)).length, 0, 'a find writes no Journal entry');
  eq([E.L.state().legends, E.L.state().giants, E.L.state().firsts.seen], [{}, {}, []], 'no legend, giant or Wick\'s first counted');
  ok(t.lines.every((l) => l.order !== true && l.first === false), 'a find fills no order and pays no first');
  // the next evening: the bite part's good bite, the parts never drawn again
  E.ctx.state.run = null;
  const r2 = startTrip(E);
  const L2 = E.L.state();
  eq(E.L.bitesLeft(OPEN), D.goodBitesFor({ kind: 'open', holdSlots: L2.holdSlots, wickId: 'wick' }) + 1, 'the evening after it is fitted: the Gate Lamp-Glass gives one more good bite in open water');
  eq(E.L.bitesLeft('lily_maze'), D.goodBitesFor({ kind: 'day', holdSlots: L2.holdSlots }), '… and none at a place');
  let glassAgain = 0;
  for (let i = 0; i < 20000; i++) if (E.L.snagRoll({ rng }) === 'gate_glass') glassAgain++;
  eq(glassAgain, 0, 'an owned part is never drawn again');
  void r2;
}
{
  const m = played();
  m.loop.finds = { got: Object.fromEntries(SIX.map((id) => [id, 1])), worn: {}, share: {} };
  const E = makeEnv(m), r = startTrip(E), rng = mulberry32(9);
  let n = 0, treasures = 0;
  for (let i = 0; i < 40000; i++) { const id = E.L.snagRoll({ rng }); if (id) { n++; if (LF.findById(D, id).kind === 'treasure') treasures++; } }
  ok(n > 0 && treasures === n, 'with all six owned every snag is a treasure');
  eq(r.bait.mireworm, 10, 'the Moat Bollard: the trip sets out with a tin of Mire Worms (no Bait Bed: a floor of one tin)');
  r.bait.mireworm = 3; E.ctx.state.run = null;
  const E2 = makeEnv(clone(E.ctx.state.meta)); const r3 = startTrip(E2);
  eq(r3.bait.mireworm, 10, 'it tops the bag up to the floor; it never piles up');
}
{
  const E = makeEnv(freshLoopMeta(D)), r = startTrip(E, { evening: 1 });
  let n = 0; const rng = mulberry32(3);
  for (let i = 0; i < 5000; i++) if (E.L.snagRoll({ rng })) n++;
  eq([r.evening, n], [1, 0], 'never on the first evening');
}
section('the flag-off boot rule with a find in the hold');
{
  const save = { meta: freshLoopMeta(D), run: { active: true, outing: 'trip', id: 'run_x', evening: 2, zone: 'mossmere',
    creel: [LF.holdEntry(D, 'salt_lens', { uid: 'f1', waterKey: OPEN }), LF.holdEntry(D, 'rod_tassel', { uid: 'f2', waterKey: OPEN })] } };
  const res = PL.sellStrandedTrip(save);
  ok(res.sold && save.meta.loop.lastTrip.total === 105 && save.meta.loop.finds.got.rod_tassel === 1, 'a stranded trip\'s treasure is sold at its stamped price and its look carried aboard');
}

// ------------------------------------------------------------------ the catch path in a real fishing.js (CONTRACT §13's fishing:found)
section('the catch path: fishing:bite {sizeClass: \'find\'}, then fishing:found in place of fishing:caught');
{
  const { makeFishingEnv } = await import('./fishing-env.mjs');
  const loop = fakeLoop({ D, holdSlots: 4, evening: 2, wick: 'wick' });
  const env = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase: 'calm', seed: 11, loop,
    runOver: { bait: {}, equippedBait: null, evening: 2, character: 'wick', nightMode: 'still', outing: 'trip' } });
  env.ctx.bus.on('fishing:bite', (e) => loop.noteBite(e));
  const okForce = env.ctx.debug.forceFind('door_ring', { wait: 2 });
  ok(okForce, 'debug forceFind: the next bite is a snag');
  for (let i = 0; i < 400 && env.F.state === 'waiting'; i++) env.tick(1);
  eq(env.F.state, 'bite', 'the snag bites');
  const b = env.events.filter((x) => x.e === 'fishing:bite').at(-1)?.p;
  eq(b?.sizeClass, 'find', 'its bite carries sizeClass: \'find\'');
  ok(!('speciesId' in (b || {})), '… and no species');
  const tell = env.events.filter((x) => x.e === 'fishing:tell').at(-1)?.p;
  eq([tell?.biteTell, tell?.sizeClass], ['sinkUnder', 'find'], 'its tell: the slow slide under, no class');
  eq(env.events.filter((x) => x.e === 'fishing:nibble').length, 0, 'no nibbles before a snag');
  env.F.onPointerDown({ input: 'mouse' }); env.F.onPointerUp?.();
  env.tick(2);
  eq(env.F.state, 'reeling', 'struck: the haul runs');
  const plan = env.ctx.debug.fishPlan?.();
  ok(plan && plan.sizeClass === 'find' && plan.beats.every((x) => ['take', 'gain', 'lift'].includes(x.phase)), 'the find plan: no runs');
  for (let i = 0; i < 3000 && env.F.state !== 'idle'; i++) { env.F.skipCeremony?.(); env.tick(1); if (env.events.some((x) => x.e === 'fishing:found')) break; }
  const found = env.events.find((x) => x.e === 'fishing:found')?.p;
  ok(found && found.findId === 'door_ring' && found.waterKey === OPEN, 'its landing emits fishing:found {findId, waterKey}');
  eq(['fishing:caught', 'fishing:escaped', 'fish:measured', 'fish:landed'].map((e) => env.events.filter((x) => x.e === e).length), [0, 0, 0, 0], 'never fishing:caught, fishing:escaped, fish:measured or fish:landed');
  for (let i = 0; i < 600 && !env.events.some((x) => x.e === 'fishing:show' && x.p.phase === 'card'); i++) { env.F.skipCeremony?.(); env.tick(1); }
  const card = env.events.find((x) => x.e === 'fishing:show' && x.p.phase === 'card')?.p;
  ok(card && card.uid === found.uid, 'the show reaches its card for the find (the find card opens on it)');
  eq(env.ctx.errors.length, 0, `no fishing errors (${env.ctx.errors.join(' | ')})`);
}
{
  // a find is never lost: a forced loss still lands
  const { makeFishingEnv } = await import('./fishing-env.mjs');
  const loop = fakeLoop({ D, holdSlots: 4, evening: 2, wick: 'wick' });
  const env = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase: 'calm', seed: 12, loop, runOver: { bait: {}, equippedBait: null, evening: 2, character: 'wick', outing: 'trip' } });
  env.ctx.debug.fishOutcome?.('lose');
  env.ctx.debug.forceFind('moat_bollard', { wait: 2 });
  for (let i = 0; i < 400 && env.F.state === 'waiting'; i++) env.tick(1);
  env.F.onPointerDown({ input: 'mouse' }); env.F.onPointerUp?.();
  for (let i = 0; i < 3000 && !env.events.some((x) => x.e === 'fishing:found' || x.e === 'fishing:escaped'); i++) env.tick(1);
  ok(env.events.some((x) => x.e === 'fishing:found') && !env.events.some((x) => x.e === 'fishing:escaped'), 'a snag is never lost (a forced loss still lands it)');
  const pl = env.ctx.debug.fishPlan?.();
  void pl;
}

// ------------------------------------------------------------------ the screens' pure parts (ui-loop's tally plan, Murk's lines; ui-finds)
section('the tally\'s rows and the card (pure)');
{
  const U = await import('../../src/ui-loop.js');
  const UF = await import('../../src/ui-finds.js');
  const lines = PL.tallyLines([LF.holdEntry(D, 'gate_glass', { uid: 'a' }), LF.holdEntry(D, 'toll_purse', { uid: 'b' }), LF.holdEntry(D, 'tin_spoon', { uid: 'c' })], { D });
  const plan = U.tallyPlan({ lines }, { D });
  eq(plan.rows.map((r) => r.name), ['Bent Tin Spoon', "The Toll-Keeper's Purse", 'Gate Lamp-Glass'], 'the tally plan: the spoon, the Purse, then the part');
  ok(plan.rows[1].jackpot === true && plan.rows[1].giant === false && plan.rows.every((r) => r.weight === ''), 'the Purse is the jackpot (never a giant), no weight under a find');
  ok(plan.rows[1].at - plan.rows[0].at > plan.rows[0].countDur, 'the Purse waits a giant\'s pause, alone');
  eq(plan.total, 1764, 'the tally\'s total: 14 + 1,750');
  eq(U.saleLineId({ rows: plan.rows, said: { firstSale: true } }), 'firstJackpot', 'Murk\'s line for the first jackpot sold');
  eq(U.saleLineId({ rows: plan.rows.slice(2), said: { firstSale: true } }), 'firstPart', 'Murk\'s line for the first part brought aboard');
  eq(U.saleLineId({ rows: plan.rows.slice(0, 1), said: { firstSale: true } }), 'firstTreasure', 'Murk\'s line for the first treasure sold');
  const cells = U.slotCells({ slots: 4, fish: [LF.holdEntry(D, 'toll_purse', { uid: 'x' })] }, { D });
  ok(cells[0].find === 'toll_purse' && cells[0].gild === true && cells.length === 4, 'the hold row: the Purse\'s slot gold-edged');
  const cv = UF.findCardView(LF.holdEntry(D, 'two_headed_coin', { uid: 'y' }), D);
  ok(cv.name === 'Two-Headed Coin' && cv.keep.clams === 350 && cv.keep.clamsText === '350' && cv.letGo.label === 'Let go', 'the card: Keep with its value, Let go');
  const cv2 = UF.findCardView(LF.holdEntry(D, 'toll_vane', { uid: 'z' }), D, { full: true });
  ok(cv2.keep.clams === null && cv2.keep.glyph === 'raft' && cv2.keep.disabled === true, 'a look\'s Keep shows where it goes (the raft), dimmed with the hold full');
  const row = UF.findsRowView(PL.catalogueFor(freshLoopMeta(D), D, 'mossmere').finds, D);
  ok(row.rate === '1 bite in 20' && row.rows[0].cards.map((c) => c.rateText).join() === '31%,17%,12%,4%,1%' && row.rows[1].cards.every((c) => c.rateText === '5.8%' && c.name === '· · ·'), 'the finds row\'s view: the heading and every rate formatted from findShares');
  ok(U.textAllowed('31%', { D, screen: 'journal' }) && !U.textAllowed('31%', { D }) && U.textAllowed('· 1 bite in 20', { D }), 'the allow-list: a rate only on the Journal; the row\'s heading');
}

console.log(`\nloop-finds: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
