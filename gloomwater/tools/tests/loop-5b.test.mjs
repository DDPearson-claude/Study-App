// M1 step 5b, the barge's side (lane 5b-home; docs/loop/M1.md §2.5, §2.6, §4 step 5b; SPEC §6.2–§6.4, §8.4, §8.6), in node:
//   the shelf      the Home tab's step-5 cards (the Bait Bed I–II, the Long Wall's wing I, Barge lights I, the three looks), nothing of a
//                  later era; a buy through the real ledger; the Bait Bed's free plain bait topped up (never piled); the empty shelf
//                  and the Mossmere's gilding
//   the prints     an ink print at the measure for a kept and for a let-go fish; the best print per species wins (by the weight the
//                  card shows); the Prints page; the gallery's wing I at true size, the giants in gold; the legend's print on the eave
//   the scene      every home level changes the barge (actors-home's variants: a before-and-after pair each, in the same three
//                  meshes); the chart table's top and the looks
//   node tools/tests/loop-5b.test.mjs
import * as THREE from 'three';

const fakeCtx2d = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }) : k === 'measureText' ? () => ({ width: 10 }) : () => {}), set: () => true });
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, getContext: fakeCtx2d }) };

const { loadLoopData, freshLoopMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-5b' });
const { createBus } = await import('../../src/core.js');
const { create } = await import('../../src/progression.js');
const PL = await import('../../src/progression-loop.js');
const HS = await import('../../src/home-shelf.js');
const HP = await import('../../src/home-prints.js');
const AH = await import('../../src/actors-home.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const OPEN = 'open:mossmere';

/** A real progression (progression.js with the loop wired in) on a fake ctx, as loop-trip.test.mjs builds it. */
function makeEnv(meta = freshLoopMeta(D)) {
  const bus = createBus(), events = [];
  const ctx = {
    THREE, bus, data: D, state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {},
    core: { debugEnabled: () => false },
    game: { save() {} },
    survival: { getPhaseInfo: () => ({ phase: 'calm', day: 1, time: 0, duration: 40, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp() {} }, fishing: { state: 'idle', spots: [], signs: [], addSpots() {}, armChum() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const emit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); emit(evt, payload); };
  ctx.progression = create(ctx); ctx.progression.init();
  return { ctx, P: ctx.progression, L: ctx.progression.loop, events };
}
function startTrip(env) {
  const r = env.P.createRun({ startZone: 'mossmere', nightMode: 'still', outing: 'trip' });
  env.ctx.state.run = r; env.ctx.flow = 'playing';
  env.ctx.bus.emit('zone:change', { zone: r.zone, prev: null, sail: true });
  env.ctx.bus.emit('run:start', { continued: false });
  return r;
}
function land(env, id, z, key = OPEN) {
  env.ctx.bus.emit('fishing:bite', { sizeClass: 'keeper', biteTell: 'steady', waterKey: key });
  const fish = env.P.makeFish(id, z, 'normal', { place: null });
  env.P.measure(fish);
  return fish;
}
const played = () => { const m = freshLoopMeta(D); Object.assign(m.loop, { wick: 'wick', tutorial: { done: true, step: null }, evenings: 1 }); return m; };
const home = (items) => items.filter((i) => i.tab === 'home');

// =====================================================================================
section('the data: the Home tab\'s step-5 ladders and looks (SPEC §4.7, M1.md §2.5) and their words (SPEC §8.4, §8.6)');
{
  eq(D.LOOP.home.baitBed.prices, [120, 700, 9000], 'the Bait Bed I–III: 120 · 700 · 9,000');
  eq(D.LOOP.home.baitBed.floor, [3, 6, 10], 'its free plain bait: at least 3 / 6 / 10');
  eq(D.LOOP.home.wall.prices, [250, 30000, 80000, 150000], 'the Long Wall\'s four wings: 250 · 30,000 · 80,000 · 150,000');
  eq(D.LOOP.home.lights.prices, [200, 1200, 14000], 'Barge lights I–III: 200 · 1,200 · 14,000');
  eq(Object.entries(D.LOOP.looks).map(([id, k]) => [id, k.price]), [['slate_dye', 300], ['oxblood_pennant', 400], ['amber_glass', 600]], 'the three looks of the start: 300 · 400 · 600');
  for (const [id, k] of Object.entries(D.LOOP.looks)) ok(D.COSMETICS_V3.some((c) => c.id === id && c.price === k.price), `${id} is COSMETICS_V3's, at its price`);
  eq([D.TEXT_LOOP.shelf.baitBed, D.TEXT_LOOP.shelf.wall], ['Free bait every evening.', 'Your best prints, on the wall.'], 'SPEC §8.4\'s two lines');
  eq(D.TEXT_LOOP.murk.shelfBare, "Shelf's bare. Keep the rest; the road goes on.", 'Murk\'s empty-shelf line (SPEC §8.6)');
  eq(D.TEXT_LOOP.tabs.prints, 'Prints', 'the Prints page\'s tab word (SPEC §8.8)');
  ok(D.TEXT_LOOP.homeNames.lights[0] === 'Barge lights I' && !JSON.stringify(D.TEXT_LOOP).includes('Landing lights'), '"Barge lights", never "Landing lights" (M1.md §2.10)');
  ok(!/%/.test(JSON.stringify([D.LOOP.home, D.LOOP.looks, D.TEXT_LOOP.homeNames, D.TEXT_LOOP.lookNames])), 'no percentage anywhere in the new data');
}

section('the shelf: the Home tab on a fresh save, each ladder\'s next level, nothing of a later era');
{
  const fresh = PL.freshLoop(D);
  const H = home(PL.shelfItems(D, fresh)).filter((i) => i.slot !== 'orders');
  eq(H.map((i) => [i.id, i.name, i.price, i.bought]), [['baitBed:1', 'Bait Bed I', 120, false], ['wall:1', 'The Long Wall, wing I', 250, false], ['lights:1', 'Barge lights I', 200, false],
    ['look:slate_dye', 'Slate Cloak Dye', 300, false], ['look:oxblood_pennant', 'Oxblood Pennant', 400, false], ['look:amber_glass', 'Amber Lantern Glass', 600, false]], 'the Home tab\'s six step-5 cards');
  eq(H.map((i) => i.line), ['Free bait every evening.', 'Your best prints, on the wall.', '', '', '', ''], 'lines: the Bait Bed\'s and the wall\'s; lights and looks none');
  const one = { ...fresh, home: { ...fresh.home, baitBed: 1 } };
  eq(home(HS.homeItems(D, one)).find((i) => i.slot === 'baitBed').id, 'baitBed:2', 'after Bait Bed I: Bait Bed II at 700');
  const top = { ...fresh, home: { ...fresh.home, baitBed: 2, wall: 1, lights: 1 }, looks: ['slate_dye', 'oxblood_pennant', 'amber_glass'] };
  const T = HS.homeItems(D, top);
  ok(T.every((i) => i.bought === true), 'Bait Bed II, wing I, Barge lights I and the looks owned: every card "Yours." (III, II and II wait for later maps)');
  eq(T.filter((i) => i.slot !== 'look').map((i) => i.id), ['baitBed:2', 'wall:1', 'lights:1'], '… the last level this shelf offers, kept as a bought card');
  const ses = HS.homeItems(D, one, ['baitBed:1']);
  ok(ses.find((i) => i.slot === 'baitBed').id === 'baitBed:1' && ses.find((i) => i.slot === 'baitBed').bought === true, 'bought while the shelf is open: the card reads Yours. in place');
  const later = { ...fresh, maps: { lakes: ['mossmere', 'sporewood', 'glasswater', 'paleabyss'], places: [] }, home: { ...fresh.home, baitBed: 2, wall: 1, lights: 1 } };
  const DL = { ...D, LOOP: { ...D.LOOP, waters: { ...D.LOOP.waters, sporewood: { order: 2 }, glasswater: { order: 3 }, paleabyss: { order: 4 } } } };   // (later waters' data)
  eq(HS.homeItems(D, later).filter((i) => i.slot !== 'look' && !i.bought).length, 0, 'in M1\'s data no later water is known: nothing of a later era is offered');
  eq(HS.homeItems(DL, later).filter((i) => i.slot !== 'look' && !i.bought).map((i) => i.id), ['baitBed:3', 'lights:2'], 'with the Pallid Deep\'s map, Bait Bed III and Barge lights II (the era rule, decision 38)');
  const sum = H.reduce((a, i) => a + i.price, 0);
  eq([H.length, sum], [6, 1870], 'step 5b\'s first cards: six, 1,870 clams (seven with Bait Bed II, 2,570; with lane 4\'s and the earlier steps\', M1\'s 32 and 7,750)');
  ok(PL.goalOf(PL.shelfItems(D, fresh)).id === 'rod:1', 'the goal line is still the cheapest: Ashwood · 50 (Hold 4 at 200 is dearer)', PL.goalOf(PL.shelfItems(D, fresh)));
}

section('the buy: a home level and a look through the real ledger, saved at once');
{
  const env = makeEnv(played());
  const L = env.ctx.state.meta.loop; L.clams = 2000;
  ok(env.L.buy('baitBed:1').ok && L.home.baitBed === 1 && L.clams === 1880, 'Bait Bed I for 120: home.baitBed 1');
  ok(env.L.buy('look:amber_glass').ok && L.looks.includes('amber_glass') && L.clams === 1280, 'Amber Lantern Glass for 600: in meta.loop.looks');
  ok(env.L.buy('look:amber_glass').ok === false && L.looks.filter((x) => x === 'amber_glass').length === 1, 'a look is bought once');
  ok(env.L.buy('wall:1').ok && L.home.wall === 1, 'the Long Wall, wing I for 250');
  ok(env.L.buy('lights:1').ok && L.home.lights === 1 && L.clams === 830, 'Barge lights I for 200');
  const buys = env.events.filter((e) => e.evt === 'loop:buy').map((e) => e.payload.item);
  eq(buys, ['baitBed:1', 'look:amber_glass', 'wall:1', 'lights:1'], 'loop:buy for each');
  eq(env.L.shelf().tabs.map((t) => t.id).includes('home'), true, 'the shelf has its Home tab');
}

section('the Bait Bed: the free plain bait, topped up at each Sail, never piled (SPEC §6.3)');
{
  const Dt = { ...D, LOOP: { ...D.LOOP, tins: { mossmere: ['mireworm', 'lumen_moss'] } } };   // lane 4's tins (LOOP.tins)
  eq(HS.baitBedFloor(Dt, { home: { baitBed: 0 } }, 'mossmere'), null, 'no Bait Bed: nothing');
  eq(HS.baitBedFloor(Dt, { home: { baitBed: 1 } }, 'mossmere'), { baitId: 'mireworm', n: 3 }, 'Bait Bed I: at least 3 Mire Worms (the water\'s first tin)');
  eq(HS.baitBedFloor(Dt, { home: { baitBed: 2 } }, 'mossmere'), { baitId: 'mireworm', n: 6 }, 'Bait Bed II: 6');
  const r = { zone: 'mossmere', bait: { mireworm: 1 } };
  eq([HS.applyBaitBed(Dt, { home: { baitBed: 2 } }, r), r.bait.mireworm], [5, 6], 'a bag of 1 tops up to 6');
  const r2 = { zone: 'mossmere', bait: { mireworm: 9 } };
  eq([HS.applyBaitBed(Dt, { home: { baitBed: 2 } }, r2), r2.bait.mireworm], [0, 9], 'a bag of 9 keeps its 9: it tops you up, it does not pile up');
  eq(HS.baitBedFloor(D.LOOP.tins ? { ...D, LOOP: { ...D.LOOP, tins: {} } } : D, { home: { baitBed: 1 } }, 'mossmere'), null, 'a water with no plain tin: nothing (and no error)');
  const env = makeEnv(played());
  env.ctx.state.meta.loop.home.baitBed = 1;
  const run = startTrip(env);
  const want = D.LOOP.tins?.mossmere?.[0];
  ok(want ? run.bait[want] >= 3 : true, `createTrip sets out with the Bait Bed's floor${want ? '' : ' (no tins in this build: lane 4 brings them)'}`);
}

section('the empty shelf and the Mossmere\'s gilding (M1.md §2.5)');
{
  ok(HS.shelfBare([{ id: 'a', price: 1, bought: true }, { id: 'b', consumable: true, price: 60, bought: false }, { id: 'c', sealed: true, price: null }]), 'every permanent card bought: bare (the ball and the sealed card never count)');
  ok(!HS.shelfBare([{ id: 'a', price: 1, bought: true }, { id: 'd', price: 5, bought: false }]), 'one card left: not bare');
  ok(!HS.shelfBare([]), 'no cards: not bare');
  eq(HS.giantsOf(D, 'mossmere').sort(), ['belled_matriarch', 'hullkiss_lamprey', 'thousandcast_pike'], 'the Mossmere\'s three giants (its legend among them)');
  const m = played(), items = [{ id: 'a', price: 1, bought: true }];
  for (const id of PL.listFor(D, 'mossmere')) m.journal[id] = { caught: 1 };
  ok(!HS.waterGilded(m, D, 'mossmere', { items, listCount: PL.listCount }), 'the list full and the shelf bare, but the giants not landed: not gilded');
  for (const id of HS.giantsOf(D, 'mossmere')) m.journal[id] = { caught: 1 };
  ok(HS.waterGilded(m, D, 'mossmere', { items, listCount: PL.listCount }), 'the shelf, the list and the three giants: gilded');
  ok(!HS.waterGilded(m, D, 'mossmere', { items: [...items, { id: 'x', price: 9, bought: false }], listCount: PL.listCount }), 'a card left on the shelf: not gilded');
}

section('the prints: one at the measure for a kept and for a let-go fish; the best per species wins (SPEC §6.4)');
{
  const env = makeEnv(played());
  startTrip(env);
  const L = env.ctx.state.meta.loop;
  const a = land(env, 'mossback_perch', 0.2);
  ok(L.prints.mossback_perch && L.prints.mossback_perch.length === a.length, 'measured: the print is written before the card (its length, never a weight)');
  ok(env.L.keep(a).ok && L.prints.mossback_perch.length === a.length, 'kept: the print stays');
  const b = land(env, 'dusk_minnow', 0.4);
  ok(env.L.letGo(b).ok && L.prints.dusk_minnow?.length === b.length, 'let go: the print is still yours');
  eq(Object.keys(L.prints[b.speciesId]).sort(), ['cls', 'evening', 'key', 'length', 'n', 'zone'], 'a print: length, class, where (its water key), its water, which evening, how many taken');
  eq([L.prints.dusk_minnow.key, L.prints.dusk_minnow.evening, L.prints.dusk_minnow.zone], [OPEN, 2, 'mossmere'], '… open water of the Mossmere, evening 2');
  const big = land(env, 'dusk_minnow', 1.8);
  ok(big.length > b.length && L.prints.dusk_minnow.length === big.length && L.prints.dusk_minnow.n === 2, 'a heavier one: its print replaces the best');
  env.L.letGo(big);
  const small = land(env, 'dusk_minnow', -1.2);
  ok(small.length < big.length && L.prints.dusk_minnow.length === big.length && L.prints.dusk_minnow.n === 3, 'a lighter one: the best stays (counted)');
  const W = (len) => D.weightOz(D.fishWeight(D.SPECIES_BY_ID.dusk_minnow, { length: len }));
  const same = HP.notePrint(L, D, { speciesId: 'dusk_minnow', length: big.length + 1e-6 }, {});
  ok(W(big.length + 1e-6) === W(big.length) && same.best === false, 'a print that reads the same weight never replaces the one before');
  const v = env.L.prints();
  eq(v.cards.map((c) => c.id), ['dusk_minnow', 'mossback_perch'], 'the Prints page: each printed species, in the catalogue\'s order');
  const c0 = v.cards[0];
  ok(typeof c0.weight === 'string' && /lb|oz/.test(c0.weight) && c0.where === 'The Mossmere' && c0.evening === 2 && c0.length === Math.round(big.length * 10) / 10, 'a card: its weight in pounds, its length in cm, where and which evening');
  ok(!/%/.test(JSON.stringify(v)), 'no percentage on the Prints page');
}

section('the gallery: wing I at true size, the giants in gold, the legend on the eave (SPEC §6.2, §6.3)');
{
  const m = played(), L = m.loop;
  for (const [id, len] of [['dusk_minnow', 22], ['thousandcast_pike', 81], ['belled_matriarch', 262], ['reedjaw_pike', 70]]) HP.notePrint(L, D, { speciesId: id, length: len }, { evening: 3 });
  eq(HP.galleryModel(m, D).wings, [], 'no wing bought: no gallery (the prints live in the Journal)');
  L.home.wall = 1;
  const g = HP.galleryModel(m, D);
  eq(g.wings.map((w) => [w.n, w.waters]), [[1, ['mossmere']]], 'wing I: the Mossmere\'s wing (reach I\'s first water, the one that ships)');
  eq(g.wings[0].frames.map((f) => [f.id, f.length, f.gold]), [['dusk_minnow', 22, false], ['reedjaw_pike', 70, false], ['thousandcast_pike', 81, true]], 'its frames: each printed fish at its own length, the giant in gold; never the legend');
  eq(g.wings[0].span, 22 + 70 + 81 + 2 * 18, 'the wing\'s span: the prints end to end with their gaps (cm)');
  eq(g.eave, null, 'the legend printed but not home yet: no print on the eave');
  L.legends.belled_matriarch = 1;
  eq(HP.galleryModel(m, D).eave?.id, 'belled_matriarch', 'once she is home: her print along the eave');
  eq(HP.wingWaters(D, 2), [], 'wing II\'s waters (5–8) are not in M1\'s data');
}

section('the scene: every home level changes the barge, in the same three meshes (M1.md §2.6, §2.14)');
{
  const base = { home: { baitBed: 0, wall: 0, lights: 0, orders: 0 }, looks: [], barge: { towed: ['mossmere'] }, legends: {}, prints: {} };
  const sig = (o) => AH.homeVariants(o).sig;
  const steps = [
    ['Bait Bed I', { home: { ...base.home, baitBed: 1 } }], ['Bait Bed II', { home: { ...base.home, baitBed: 2 } }],
    ['Barge lights I', { home: { ...base.home, lights: 1 } }], ['the Long Wall, wing I', { home: { ...base.home, wall: 1 } }],
    ["Murk's Order Board I", { home: { ...base.home, orders: 1 } }], ["Murk's Order Board II", { home: { ...base.home, orders: 2 } }],
    ['the Matriarch home (her print on the eave, her stone gilt)', { legends: { belled_matriarch: 1 }, prints: { belled_matriarch: { length: 250 } } }],
  ];
  const home = AH.createHome({ data: D, world: { getMood: () => ({ night: 0.37, warm: 0.6 }) }, flow: 'home', state: { meta: { loop: PL.freshLoop(D) } }, models: { emitSmoke() {} } });
  home.setVariants(AH.homeVariants(base));
  const v0 = home.stats().verts;
  for (const [name, over] of steps) {
    const o = { ...clone(base), ...over };
    ok(sig(o) !== sig(base), `${name}: the barge's variant changes`);
    ok(home.setVariants(AH.homeVariants(o)) === true, `${name}: rebuilt`);
    const v = home.stats().verts;
    ok(v.timber !== v0.timber || v.glow !== v0.glow, `${name}: the barge's own meshes change (timber ${v0.timber} → ${v.timber}, glow ${v0.glow} → ${v.glow})`);
    home.setVariants(AH.homeVariants(base));
  }
  const all = { home: { baitBed: 2, wall: 1, lights: 1, orders: 2 }, looks: ['slate_dye', 'oxblood_pennant', 'amber_glass'], barge: { towed: ['mossmere'] }, legends: { belled_matriarch: 1 }, prints: { belled_matriarch: { length: 250 } }, tackle: { rod: 2 } };
  home.setVariants(AH.homeVariants(all));
  const c = home.calls();
  ok(c.main <= 6 && c.mirror <= 2 && c.shadow <= 2, `every M1 home object: ${c.main} main-pass, ${c.mirror} mirror, ${c.shadow} shadow calls (≤ 6 / 2 / 2)`);
  let lights = 0; home.object3d.traverse((o) => { if (o.isLight) lights++; });
  eq(lights, 0, 'no light of any kind on the barge');
  let meshes = 0; home.object3d.traverse((o) => { if (o.isMesh && o.material?.visible !== false) meshes++; });
  ok(meshes <= 6, `the barge's visible meshes: ${meshes} (each one draw call)`);
}

section('the gilding on the drawn Chart: 1.2 s on the next open, once (chart-gild.js; M1.md §2.5)');
{
  const CG = await import('../../src/chart-gild.js');
  const model = { sheets: [{ waterId: 'mossmere', gilded: true }] }, ml = {}, st = {};
  const a = CG.gildStep(ml, model, 1000, st), b = CG.gildStep(ml, model, 1600, st), c = CG.gildStep(ml, model, 2300, st);
  ok(a.k === 0 && a.more && b.k > 0.4 && b.k < 0.6 && b.more && c.k === 1 && !c.more, 'the re-inking runs 1.2 s on the page\'s clock', { a, b, c });
  eq(ml.gilt, ['mossmere'], 'then the water is kept as gilt (meta.loop.gilt): the next open draws it gold at once');
  eq(CG.gildStep(ml, model, 5000, {}), { k: 1, more: false }, '… and never re-inks again');
  const ml2 = {}; eq([CG.gildStep(ml2, model, 0, {}, true), ml2.gilt], [{ k: 1, more: false }, ['mossmere']], 'reduced motion: gold at once');
  eq(CG.gildStep({}, { sheets: [{ waterId: 'mossmere', gilded: false }] }, 0, {}), { k: 1, more: false }, 'a water not complete: nothing to re-ink');
  const calls = []; const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => calls.push(k)), set: (t, k, v) => { t[k] = v; return true; } });
  const card = { waterId: 'mossmere', x: 0, y: 0, w: 100, h: 80, lake: { cx: 50, cy: 40, s: 0.5 } };
  const view = { water: { mossmere: { shore: [[0, -10], [10, 0], [0, 10], [-10, 0]] } } };
  eq(CG.gildCard(ctx, card, { sheets: [{ waterId: 'mossmere', gilded: false }] }, 1, view), null, 'gildCard: a sheet not gilded draws nothing (its name keeps its ink)');
  ok(typeof CG.gildCard(ctx, card, model, 1, view) === 'string' && calls.includes('stroke'), 'gildCard: a gilded sheet strokes its shore and neatline in gold and gives its name a gold colour');
}

section('home\'s sound: the stove, water against the hulls, a far bell, Murk\'s hand bell (M1.md §2.13), under the loop at home only');
{
  const AHm = await import('../../src/audio-home.js');
  const { SFX } = await import('../../src/audio-sfx.js');
  ok(AHm.homeOn({ loopOn: true, flow: 'home' }) && !AHm.homeOn({ loopOn: true, flow: 'playing' }) && !AHm.homeOn({ loopOn: false, flow: 'home' }), 'home\'s bed: under the loop, at home only');
  eq([AHm.homeLevel(true), AHm.homeLevel(true, { blocking: true }), AHm.homeLevel(false)], [1, 0.6, 0], 'its level: full, softer under a screen, off');
  eq(Object.keys(AHm.HOME_VOICES), ['stove', 'hull', 'farBell', 'handBell'], 'its voices: the stove, the hulls, a far bell, Murk\'s hand bell');
  ok(Object.values(AHm.HOME_VOICES).every((V) => (AHm.SFX_HOME[V.sfx] || SFX[V.sfx]) && V.every[0] > 0 && V.every[1] >= V.every[0]), 'each voice has its recipe (the hand bell the built merchant_bell) and a sane interval');
  ok(AHm.HOME_SFX.every((id) => !(id in SFX)), 'the home recipes are not in the built SFX table until audio.js registers them under the loop (the v3 table unchanged)');
  const calls = [];
  const v = { burst: (o, x) => calls.push(['burst', x.peak]), tone: (o, x) => calls.push(['tone', x.peak]), filter: () => ({ connect() {} }) };
  for (const id of AHm.HOME_SFX) { calls.length = 0; AHm.SFX_HOME[id].fn(v, {}, 0, 1, {}); ok(calls.length > 0 && calls.every(([, pk]) => pk > 0 && pk <= 0.6), `${id}: plays (${calls.length} parts, every peak ≤ 0.6)`); }
}

console.log(`\nloop-5b: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
