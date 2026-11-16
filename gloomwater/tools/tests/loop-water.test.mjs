// M1 step 3a's water (docs/loop/m1-step3a/PLAN.md §2.2 items 1–4; T121–T127, T132): the real src/fishing.js on the loop's data
// (tools/tests/fishing-env.mjs) with a fake ledger (tools/tests/loop-fixture.mjs fakeLoop) owning and lifting places: a cast into a
// bank, the pool by place against data.placePool (the sim's rule), Elders by the place's kind, the giants, night water before dark,
// the legend's pool and her ball, a lost giant's mark; and the built fishing off a trip.
//   node tools/tests/loop-water.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const DV3 = await import('../../src/data.js?water-v3');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;
const { loadLoopData, fakeLoop } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-water' });
const { makeFishingEnv } = await import('./fishing-env.mjs');
const WC = await import('../../src/watercraft.js');   // WC-1: on the Mossmere a cast draws from watercraft.castOdds

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);
const note = (s) => console.log(`  note: ${s}`);
const OPEN = 'open:mossmere';
const ALL = Object.keys(D.LOOP.places);
const CAST = 16 * 0.55;   // a forced cast's distance (fishing-env's castMax 16): it lands CAST m up-screen (−z) of the raft

/** A point well inside a place's water (its centre; a path's middle). */
function centre(id) {
  const a = D.loopPlace(id).area;
  return a.kind === 'path' ? { x: (a.pts[0][0] + a.pts[1][0]) / 2, z: (a.pts[0][1] + a.pts[1][1]) / 2 } : { x: a.x, z: a.z };
}
/** A trip on the Mossmere: `own` place maps owned, `lifted` lifted (default: all owned), a fake ledger counting bites. */
function waterEnv({ own = [], lifted = own, wick = 'wick', phase = 'calm', seed = 42, bag = {}, fish = [], holdSlots = 5, runOver = {}, data = D, outing = 'trip', raft = [30, 30] } = {}) {
  const loop = fakeLoop({ D, wick, maps: { lakes: ['mossmere'], places: own.slice() }, lifted: lifted.slice(), bag: { ...bag }, fish: fish.slice(), holdSlots });
  const env = makeFishingEnv({ data, mode: 'still', outing, phase, seed, loop, raft,
    runOver: { bait: {}, equippedBait: null, evening: 2, character: wick, nightMode: 'still', ...runOver } });
  env.ctx.bus.on('fishing:bite', (e) => loop.noteBite(e));
  env.ctx.bus.on('fishing:miss', (e) => { if (e.reason === 'spooked') loop.noteBite(e); });
  env.loop = loop;
  env.count = (e) => env.events.filter((x) => x.e === e).length;
  env.last = (e) => env.events.filter((x) => x.e === e).at(-1)?.p;
  /** put the raft so a forced cast lands at (x, z) */
  env.raftFor = (p) => { env.ctx.player.position.set(p.x, 0, p.z + CAST); env.tick(1); };   // (a frame, so fishing's last raft place is here)
  /** a forced cast landing at a place's centre (or a point): → whether a bite is on its way (waiting) */
  env.castAt = (where, o = {}) => { env.raftFor(typeof where === 'string' ? centre(where) : where); return env.ctx.debug.forceBite({ wait: 2, ...o }); };
  env.toBite = () => { for (let i = 0; i < 400 && env.F.state === 'waiting'; i++) env.tick(1); return env.F.state === 'bite'; };
  env.toIdle = (max = 3000) => { for (let i = 0; i < max && env.F.state !== 'idle'; i++) { env.F.skipCeremony?.(); env.tick(1); } };
  env.roll = (n, o = {}) => env.ctx.debug.fishPoolRoll(n, o);
  return env;
}
/** The shares a cast draws from (WC-1, WATERCRAFT.md §4): watercraft.castOdds on placePool's pool, the hook table and the hour tilt
 *  (fishing-env's world has no shore probe, so open water has no area here); each species' share, the giant's included */
function poolShares(o) {
  const pp = D.placePool(D.SPECIES, o), out = {};
  const odds = WC.castOdds(D, { pool: pp, area: null, phase: o.phase, bait: o.bait ?? null, wickId: o.wickId ?? null });
  for (const e of odds.entries) out[e.sp.id] = (out[e.sp.id] || 0) + e.p;
  return { shares: out, pp };
}
/** every drawn share within 3σ of the pool's (and no species drawn the pool does not hold) */
function sharesMatch(counts, shares, n) {
  const bad = [];
  for (const id of new Set([...Object.keys(counts), ...Object.keys(shares)])) {
    const p = shares[id] || 0, got = (counts[id] || 0) / n, sd = Math.sqrt(Math.max(p * (1 - p), 1e-12) / n);
    if (p === 0 ? got > 0 : Math.abs(got - p) > 3 * sd + 1e-9) bad.push(`${id} ${got.toFixed(4)} vs ${p.toFixed(4)}`);
  }
  return bad;
}

// =====================================================================================================================
section('a cast into a bank (T121)');
{
  for (const [label, o] of [['a place not owned', { own: [] }], ['a place owned but not lifted', { own: ['lily_maze'], lifted: [] }]]) {
    const E = waterEnv({ ...o, runOver: { bait: { mireworm: 4 }, equippedBait: 'mireworm' } });
    E.events.length = 0;
    const waiting = E.castAt('lily_maze');
    ok(!waiting && E.F.state === 'lost', `T121 (${label}): no wait, no bite: the line is in the bank`);
    eq(E.last('fishing:mist'), { placeId: 'lily_maze' }, `T121 (${label}): fishing:mist {placeId}`);
    ok(E.count('fishing:land') === 1, '… the float lands (its plop)');
    let t = 0, hid = false, under = false;
    for (; t < 4 && E.F.state !== 'idle'; t += 1 / 30) {
      E.tick(1);
      const fx = E.ctx.debug.fishFx();
      if (fx.mistFloatVisible) under = true;
      if (E.calls.bobber.at(-1)?.visible === false) hid = true;
    }
    ok(E.F.state === 'idle' && t <= 2.5, `T121 (${label}): back to idle within 2.5 s (${t.toFixed(2)} s)`);
    ok(under && hid, '… the float sinks into the bank (fishing-fx\'s float, the actor\'s hidden) and comes back');
    ok(!E.ctx.debug.fishFx().mistFloatVisible, '… the float back on the water when it is over');
    ok(E.count('fishing:bite') === 0 && E.count('fishing:miss') === 0 && E.count('fishing:nibble') === 0, 'T121: no fishing:bite (no nibble, no miss)');
    eq(E.loop.s.bites, {}, 'T121: run.bites unchanged (nothing spent at the place or in open water)');
    eq(E.calls.refund, ['mireworm'], 'T121: the cast\'s bait goes back to the bag (no bait spent)');
    eq(E.F.view.favour, null, '… no float favour');
  }
  // the next cast after a mist cast is an ordinary one; a new cast during it interrupts it cleanly
  const N = waterEnv({ own: [] });
  N.castAt('lily_maze'); N.tick(10);
  ok(N.ctx.debug.fishFx().mistFloatVisible, '(the float under the bank)');
  N.ctx.player.position.set(30, 0, 30); N.F.onPointerDown({ input: 'mouse' }); N.tick(2);
  ok(N.F.state === 'charging' && !N.ctx.debug.fishFx().mistFloatVisible, 'a new cast during it charges and the float under the bank is gone');
  N.F.onPointerUp(); N.reset();
  // no sign inside a bank
  const signs = (own) => {
    const E = waterEnv({ own });
    const c = centre('lily_maze'); let k = 0;
    E.ctx.player.position.set(c.x, 0, c.z + 12);
    E.ctx.world.randomWaterPoint = () => { k++; const a = k * 2.39996; return new THREE.Vector3(c.x + Math.cos(a) * 4, 0, c.z + Math.sin(a) * 4); };   // every point in the Lily Maze
    E.tick(30 * 30);
    return E.F.signs.filter((s) => D.placeContains(D.PLACE_BY_ID.lily_maze, s.position.x, s.position.z)).length;
  };
  const inBank = signs([]), lifted = signs(['lily_maze']);
  ok(inBank === 0 && lifted > 0, `T121: no sign spawns inside a bank (${inBank} in the bank; ${lifted} once the place is lifted)`);
}

// =====================================================================================================================
section('an owned place: its key, its pool, the draws (T122)');
{
  const E = waterEnv({ own: ALL });
  const c = centre('lily_maze');
  eq(E.F.waterAt(c), { giant: false, waterKey: 'lily_maze', placeId: 'lily_maze' }, 'T122: waterAt gives its key and place (no mist)');
  eq(E.F.waterAt({ x: 30, z: 30 }), { giant: false, waterKey: OPEN, placeId: null }, '… open water the open key');
  E.events.length = 0;
  ok(E.castAt('lily_maze') && E.toBite(), '(a cast into the Lily Maze bites)');
  ok(E.last('fishing:bite')?.waterKey === 'lily_maze' && E.loop.s.bites.lily_maze === 1, 'T122: a bite spends there');
  const fav = E.F.favourAt(c);
  const pf = fav.terms.find((t) => t.family === 'place');
  ok(pf && pf.id === 'day' && Math.abs(pf.value - (D.LOOP.place.favour.base + D.LOOP.place.favour.window.day)) < 1e-9, `T122: its favour by kind (day +${pf?.value})`);
  E.toIdle(); E.reset();
  const N = 20000;
  for (const [place, phase] of [['lily_maze', 'calm'], ['lily_maze', 'dusk'], [null, 'calm'], [null, 'gloomtide'], ['under_the_span', 'dusk'], ['bell_pool', 'calm']]) {
    const P = waterEnv({ own: ALL, phase, seed: 7 });
    const r = P.roll(N, { place });
    const { shares } = poolShares({ placeId: place, phase });
    const bad = sharesMatch(r.counts, shares, N);
    ok(r.place === place && bad.length === 0, `T122: ${N} draws at ${place ?? 'open water'} (${phase}) match castOdds' shares on placePool within 3σ${bad.length ? ': ' + bad.join(', ') : ''}`);
  }
  const L = waterEnv({ own: ALL, seed: 3 }).roll(N, { place: 'lily_maze' }).counts, O = waterEnv({ own: ALL, seed: 3 }).roll(N, { place: null }).counts;
  const ratio = (C, a, b) => (C[a] || 0) / Math.max(1, C[b] || 0);
  // (the koi's ×3 against the carp's ×1.5 there: twice their open-water ratio; WC-1: on the bare hook the Kissmark is a stray, so the
  // ratio is taken against the carp, a taker; the hour tilts cancel)
  const koi = ratio(L, 'candlefin_koi', 'weeping_carp'), ko = ratio(O, 'candlefin_koi', 'weeping_carp'), com = (L.dusk_minnow / N) / (O.dusk_minnow / N);
  ok(Math.abs(koi / ko - 3 / 1.5) < 0.25, `T122: the Lily Maze's koi ×3 and carp ×1.5 (the koi against the carp ×${(koi / ko).toFixed(2)} of open water's)`);
  const kt = WC.tilt('candlefin_koi', 'calm') / WC.tilt('weeping_carp', 'calm');
  ok(Math.abs(ko - kt) < 0.12, `… in open water the koi draws as the carp, an uncommon, by their hour tilts (${ko.toFixed(2)}, want ${kt.toFixed(2)})`);
  note(`a common there against open water: ×${com.toFixed(2)} of its share (its weight ×${D.LOOP.place.common}, the rest of the pool heavier there)`);
  ok(D.placePool(D.SPECIES, { placeId: 'lily_maze', phase: 'calm' }).list.find(([s]) => s.id === 'dusk_minnow')[1] === D.RARITY_WEIGHTS.common * D.LOOP.place.common, 'T122: commons ×0.5 at a place (the pool\'s weight)');
  const twelve = new Set(D.LOOP.species.mossmere);
  for (const phase of ['calm', 'dusk', 'gloomtide']) {
    const r = waterEnv({ own: ALL, phase, seed: 9 }).roll(N, { place: null });
    const out = Object.keys(r.counts).filter((id) => !twelve.has(id));
    ok(out.length === 0 && Object.keys(r.counts).every((id) => !D.SPECIES_BY_ID[id].place && (!D.SPECIES_BY_ID[id].kind || D.SPECIES_BY_ID[id].kind === 'open')), `T122: open water (${phase}) draws only the list's twelve${out.length ? ': ' + out : ''}`);
  }
  // Lumen Moss forced on the line (a test-only fit: the tin is step 4's): the Gloam Eel at the Buoy Lights after dark only
  const eel = (o) => (waterEnv({ own: ALL, phase: o.phase, seed: 5 }).roll(6000, { place: o.place, bait: o.bait }).counts.gloam_eel || 0);
  const at = eel({ place: 'buoy_lights', phase: 'gloomtide', bait: 'lumen_moss' });
  ok(at > 0, `T122: with Lumen Moss the Gloam Eel bites at the Buoy Lights after dark (${at} of 6,000)`);
  ok([{ place: 'buoy_lights', phase: 'gloomtide', bait: null }, { place: null, phase: 'gloomtide', bait: 'lumen_moss' }, { place: 'buoy_lights', phase: 'calm', bait: 'lumen_moss' },
    { place: 'buoy_lights', phase: 'dusk', bait: 'lumen_moss' }, { place: 'under_the_span', phase: 'gloomtide', bait: 'lumen_moss' }, { place: 'lily_maze', phase: 'gloomtide', bait: 'lumen_moss' }].every((o) => eel(o) === 0),
  'T122: … and nowhere else, never without it (not before dark, not in open water)');
  const B = waterEnv({ own: ALL, phase: 'gloomtide', runOver: { bait: { lumen_moss: 5 }, equippedBait: 'lumen_moss' } });
  let seen = false;
  for (let i = 0; i < 300 && !seen; i++) { B.castAt('buoy_lights', { natural: true }); seen = B.dbg().species === 'gloam_eel'; B.reset(); }
  ok(seen, 'T122: … a real cast there on it brings one up');
}

// =====================================================================================================================
section('Elders by the place\'s kind (T123)');
{
  const E = waterEnv({ own: ALL });
  const elders = (id, place) => { let n = 0; for (let i = 0; i < 2000; i++) { const z = E.F.rollSize(id, 1.8, { place: place ? D.PLACE_BY_ID[place] : null, giant: false }); if (D.sizeClassOf(z) === 'elder') n++; } return n; };
  const span = elders('mossback_perch', 'under_the_span');
  ok(span > 0, `T123: Elders under the Span (old water: ${span} of 2,000 at the most favour)`);
  for (const p of [null, 'lily_maze', 'buoy_lights', 'bell_pool']) ok(elders('mossback_perch', p) === 0, `T123: none in ${p ?? 'open water'}`);
  ok(elders('hullkiss_lamprey', 'buoy_lights') > 0, 'T123: a giant at its own place may be an Elder (the Hullkiss at the Buoy Lights)');
  ok(elders('thousandcast_pike', 'under_the_span') > 0 && elders('thousandcast_pike', 'lily_maze') === 0 && elders('hullkiss_lamprey', 'under_the_span') > 0, '… and nowhere else but old water (the Hullkiss under the Span is in old water)');
  ok(D.ZONES[0].arena.places.every((p) => !p.maxClass && !p.holdsGiants), '(the arena\'s places carry no maxClass or holdsGiants under the loop: the kind decides)');
}

// =====================================================================================================================
section('a giant through fishing (T124)');
{
  const E = waterEnv({ own: ALL });
  let min = 9; for (let i = 0; i < 2000; i++) min = Math.min(min, E.F.rollSize('thousandcast_pike', -1.5, { place: D.PLACE_BY_ID.under_the_span }));
  ok(min >= D.LOOP.giant.minZ - 1e-9, `T124: never Small (z ≥ ${D.LOOP.giant.minZ}; lowest of 2,000 at μ −1.5: ${min.toFixed(3)})`);
  const f = E.F.favourAt(centre('under_the_span'), 'thousandcast_pike');
  ok(f.terms.some((t) => t.family === 'place' && t.id === 'giant' && t.value === D.LOOP.giant.favour), `T124: +${D.LOOP.giant.favour} in its favour terms`);
  ok(!E.F.favourAt(centre('under_the_span')).terms.some((t) => t.id === 'giant'), '… never in the float\'s (the float names no fish)');
  const N = 20000;
  // (WC-1: a giant takes Cut Strip; on the bare hook it is a stray, ≤ 1%: watercraft.test.mjs)
  const share = (place, phase, wick = 'wick') => { const W = waterEnv({ own: ALL, phase, wick, seed: 11 }); W.loop.s.taperFirst = true; return (W.roll(N, { place, bait: 'cut_strip' }).counts[place === 'buoy_lights' ? 'hullkiss_lamprey' : 'thousandcast_pike'] || 0) / N; };
  const sd = (p) => 3 * Math.sqrt(p * (1 - p) / N);
  const dusk = share('under_the_span', 'dusk'), night = share('under_the_span', 'gloomtide'), day = share('under_the_span', 'calm');
  ok(Math.abs(dusk - 0.06) <= 0.01 && Math.abs(night - 0.06) <= 0.01, `T124: the Thousandcast at Under the Span 6% ± 1 at dusk and night (${(100 * dusk).toFixed(2)}%, ${(100 * night).toFixed(2)}%)`);
  ok(Math.abs(day - 0.025) <= 0.007, `T124: 2.5% ± 0.7 by day, its offHour share (${(100 * day).toFixed(2)}%)`);
  const hk = share('buoy_lights', 'gloomtide'), hkDay = share('buoy_lights', 'dusk');
  ok(Math.abs(hk - 0.06) <= 0.01 && hkDay === 0, `T124: the Hullkiss at the Buoy Lights 6% ± 1 at night (${(100 * hk).toFixed(2)}%), none before dark`);
  const tp = share('under_the_span', 'dusk', 'taper');
  ok(Math.abs(tp - 0.078) <= 0.01 && tp <= D.LOOP.wicks.taper.giantCap + sd(0.12), `T124: Taper's ×1.3 on Taper's trip (${(100 * tp).toFixed(2)}%), never above 12%`);
  for (const [p, ph] of [[null, 'dusk'], [null, 'gloomtide'], ['lily_maze', 'dusk'], ['bell_pool', 'dusk'], ['buoy_lights', 'gloomtide'], ['under_the_span', 'gloomtide']]) {
    const W = waterEnv({ own: ALL, phase: ph, seed: 13 });
    const c = W.roll(5000, { place: p }).counts;
    const wrong = Object.keys(c).filter((id) => D.SPECIES_BY_ID[id]?.giant && D.SPECIES_BY_ID[id].place !== p);
    ok(wrong.length === 0, `T124: never hooked outside its place (${p ?? 'open water'}, ${ph})${wrong.length ? ': ' + wrong : ''}`);
  }
  // Taper's first bite at a giant's place: the commons zeroed, the giant keeps its share
  const T = waterEnv({ own: ALL, phase: 'dusk', wick: 'taper', seed: 17 });
  const tr = T.roll(N, { place: 'under_the_span', bait: 'cut_strip' }).counts;
  ok(!Object.keys(tr).some((id) => D.SPECIES_BY_ID[id].rarity === 'common') && Math.abs((tr.thousandcast_pike || 0) / N - 0.078) <= 0.012, `Taper's first bite there: no common, the giant at its share (${(100 * (tr.thousandcast_pike || 0) / N).toFixed(2)}%)`);
}

// =====================================================================================================================
section('night water before dark is open water (T125)');
{
  const c = centre('buoy_lights');
  const E = waterEnv({ own: ['buoy_lights'], phase: 'calm' });
  eq(E.F.waterAt(c), { giant: false, waterKey: OPEN, placeId: null }, 'T125: at the Buoy Lights before the gloomtide: the open key, no place');
  ok(!E.F.favourAt(c).terms.some((t) => t.family === 'place'), '… no place favour');
  E.events.length = 0;
  ok(E.castAt('buoy_lights') && E.toBite() && E.last('fishing:bite')?.waterKey === OPEN && E.loop.s.bites[OPEN] === 1, 'T125: a cast there counts as open water\'s (its good bites)');
  E.toIdle(); E.reset();
  const r = E.roll(6000, { place: 'buoy_lights' });
  ok(r.place === null && !r.counts.hullkiss_lamprey && sharesMatch(r.counts, poolShares({ placeId: null, phase: 'calm' }).shares, 6000).length === 0, 'T125: open water\'s pool there (no lamprey)');
  for (const ph of ['dusk']) { E.setPhase(ph); eq(E.F.waterAt(c).waterKey, OPEN, 'T125: … at dusk too'); }
  E.setPhase('gloomtide');
  eq(E.F.waterAt(c), { giant: false, waterKey: 'buoy_lights', placeId: 'buoy_lights' }, 'T125: from the gloomtide its own key');
  const nf = E.F.favourAt(c).terms.find((t) => t.family === 'place');
  ok(nf && nf.id === 'night' && Math.abs(nf.value - (D.LOOP.place.favour.base + D.LOOP.place.favour.window.night)) < 1e-9, `… its favour (night +${nf?.value})`);
  ok((E.roll(6000, { place: 'buoy_lights' }).counts.hullkiss_lamprey || 0) > 0, '… and its pool (the Hullkiss)');
  const U = waterEnv({ own: [], phase: 'calm' });
  ok(U.F.waterAt(c).mist === true && U.F.waterAt(c).waterKey === 'buoy_lights', 'an unowned night water is its bank by day as by night (mist first)');
}

// =====================================================================================================================
section('the legend: her pool, her hour, her ball (T126)');
{
  const ball = D.LOOP.legendBait.mossmere.id;
  const legendEnv = (o = {}) => waterEnv({ own: ALL, bag: { [ball]: 2 }, runOver: { bait: { [ball]: 2 }, equippedBait: ball }, ...o });
  const E = legendEnv();
  ok(E.castAt('bell_pool') && E.dbg().legend === true && E.dbg().species === 'belled_matriarch', 'T126: the ball fitted, the Bell Pool owned and lifted, day: the sure bite (legendCast)');
  eq(E.dbg().events.length, 0, '(forceBite clears the nibbles: her own count is checked below)');
  ok(E.toBite(), '(her bite)');
  E.ctx.debug.fishOutcome('lose'); E.tick(3);
  E.F.onPointerDown({ input: 'mouse' }); E.F.onPointerUp();
  ok(E.F.state === 'reeling' && E.loop.calls.some((c) => c.name === 'spendBait' && c.args[0] === ball) && E.loop.s.bag[ball] === 1, 'T126: she spends the ball when hooked (loop.spendBait)');
  E.toIdle();
  // her nibbles: a natural cast
  const Nn = legendEnv();
  Nn.raftFor(centre('bell_pool')); Nn.ctx.debug.forceBite({ natural: true });
  ok(Nn.dbg().legend && Nn.dbg().events.filter((e) => e === 'nibble').length <= D.BALANCE.legend.nibbles, `her nibbles (${Nn.dbg().events.join(' ')})`);
  // anywhere in the place's water (PLAN CHOICE 4: the r 6 Bell Pool, not the built r 3.2 legend pool)
  const edge = { x: -4 + 5, z: -14 };
  const Ed = legendEnv(); Ed.castAt(edge);
  ok(Ed.dbg().legend === true && Math.hypot(edge.x + 4, edge.z + 14) > D.ZONES[0].arena.legendPool.r, 'PLAN CHOICE 4: her pool is the Bell Pool\'s whole water (5 m from its centre)');
  // no legend bite outside her hour, outside the pool, in its bank; the ball kept
  const cases = [
    ['outside her hour (night)', legendEnv({ phase: 'gloomtide' }), 'bell_pool'],
    ['outside the pool (open water)', legendEnv(), { x: 30, z: 30 }],
    ['outside the pool (the Lily Maze)', legendEnv(), 'lily_maze'],
  ];
  for (const [label, X, where] of cases) {
    X.castAt(where); X.toBite();
    ok(X.dbg().legend === false && X.dbg().species !== 'belled_matriarch', `T126: ${label}: no legend bite`);
    X.ctx.debug.fishOutcome('land'); X.tick(3); X.F.onPointerDown({ input: 'mouse' }); X.F.onPointerUp(); X.toIdle();
    ok(!X.loop.calls.some((c) => c.name === 'spendBait') && X.loop.s.bag[ball] === 2, `T126: ${label}: the ball kept (a bare-hook bite)`);
  }
  const Bk = legendEnv({ own: ALL, lifted: ALL.filter((id) => id !== 'bell_pool') });
  ok(!Bk.castAt('bell_pool') && Bk.last('fishing:mist')?.placeId === 'bell_pool' && !Bk.loop.calls.some((c) => c.name === 'spendBait'), 'T126: in its bank (owned, not lifted): a mist cast, no legend bite, the ball kept');
  // with the ball on, every other bite is a bare-hook bite: no bait favour; a pass keeps it
  const P = legendEnv();
  P.castAt({ x: 30, z: 30 });
  ok(!P.F.favourAt({ x: 30, z: 30 }).terms.some((t) => t.family === 'tackle' && t.id === ball), 'T126: the ball gives no bait favour to another fish');
  P.toBite(); for (let i = 0; i < 400 && P.F.state === 'bite'; i++) P.tick(1);
  ok(P.events.some((x) => x.e === 'fishing:miss' && x.p.reason === 'passed') && P.calls.refund.length === 0 && P.loop.s.bag[ball] === 2 && !P.loop.calls.some((c) => c.name === 'refundBait' || c.name === 'spendBait'),
    'T126: a pass spends nothing (the ball was never taken: nothing to give back)');
  // a full hold refuses the cast at her pool in her hour (PLAN CHOICE 23)
  const F = legendEnv({ holdSlots: 3, fish: [{}, {}, {}] });
  F.raftFor(centre('bell_pool')); F.events.length = 0;
  F.F.onPointerDown({ input: 'mouse' }); F.tick(2);
  ok(F.F.state === 'idle' && F.last('loop:holdFull')?.via === 'cast', 'T126: a full hold, the ball fitted, at the Bell Pool in her hour: the cast is refused ("Hold\'s full.")');
  ok(!F.ctx.debug.forceBite({ wait: 2 }) && F.count('fishing:bite') === 0 && F.dbg().legend === false && !F.loop.calls.some((c) => c.name === 'spendBait') && F.loop.s.bag[ball] === 2, '… no legend bite, the ball kept');
}

// =====================================================================================================================
section('a lost giant and its mark (T127)');
{
  const E = waterEnv({ own: ALL, phase: 'dusk' });
  E.castAt('under_the_span', { speciesId: 'thousandcast_pike', z: 0.4 }); E.toBite();
  E.ctx.debug.fishOutcome('lose'); E.tick(3); E.F.onPointerDown({ input: 'mouse' }); E.F.onPointerUp();
  E.toIdle();
  const g = E.last('fish:escaped');
  ok(g && g.speciesId === 'thousandcast_pike' && g.sizeClass === 'keeper' && g.markedFish === true && g.place === 'under_the_span', 'T127: a giant lost at Keeper: the got-away (fish:escaped) carries markedFish: true and its place');
  ok(E.events.some((x) => x.e === 'fishing:escaped' && !('speciesId' in x.p)), '(fishing:escaped itself names no fish, as built: F17)');
  const pOf = (marked) => {
    const W = waterEnv({ own: ALL, phase: 'dusk' });
    if (marked) W.loop.s.marked.thousandcast_pike = 1;
    W.ctx.progression.getLoadout = () => ({ rod: 4, line: 4, reel: 4, item: null });   // (strong tackle: a chance clear of the floor)
    W.castAt('under_the_span', { speciesId: 'thousandcast_pike', z: 1.5 }); W.toBite();
    W.ctx.debug.fishOutcome('land'); W.tick(3); W.F.onPointerDown({ input: 'mouse' }); W.F.onPointerUp();
    const p = W.ctx.debug.fishChance();
    W.toIdle();
    return { p, W };
  };
  const a = pOf(false), b = pOf(true);
  ok(b.p > a.p && b.W.loop.calls.some((c) => c.name === 'takeGiantMark') && b.W.loop.s.marked.thousandcast_pike === 0, `T127: its next hook carries mods.marked (p ${a.p.toFixed(3)} → ${b.p.toFixed(3)}), taken once`);
  const exp = D.catchChance(D.SPECIES_BY_ID.thousandcast_pike, 'prize', b.W.dbg().castLoadout, { lake: 'mossmere', strike: b.W.dbg().grade, buffs: { wellFed: false, boons: {}, relics: {}, character: null, firstHookTonight: false }, marked: true, night: false, perRun: b.W.dbg().castLoadout?.perRun ?? false });
  ok(Math.abs(exp - b.p) < 1e-9, '… exactly catchChance with marked: true');
  b.W.castAt('under_the_span', { speciesId: 'thousandcast_pike', z: 1.5 }); b.W.toBite(); b.W.ctx.debug.fishOutcome('land'); b.W.tick(3); b.W.F.onPointerDown({ input: 'mouse' }); b.W.F.onPointerUp();
  ok(Math.abs(b.W.ctx.debug.fishChance() - a.p) < 1e-9, '… and the hook after it is plain again (once)');
  // its Fight through data (S: CATCH_V3.rarity.epic): the roll's p is the sim's at Prize on T1 (26.9%), never the floor
  const T1 = waterEnv({ own: ALL, phase: 'dusk' });
  T1.ctx.progression.getLoadout = () => ({ rod: 1, line: 1, reel: 1, item: null });
  T1.castAt('under_the_span', { speciesId: 'thousandcast_pike', z: 1.5 }); T1.toBite(); T1.ctx.debug.fishStrike('struck');
  const p1 = T1.ctx.debug.fishChance();
  ok(Math.abs(p1 - 0.2688) < 0.005, `T124: a giant's land chance through fishing: Prize on T1 ${(100 * p1).toFixed(2)}% (the sim's 26.9%; by id it read the 1% floor)`);
  const K = waterEnv({ own: ALL, phase: 'calm' });
  K.ctx.progression.getLoadout = () => ({ rod: 1, line: 1, reel: 1, item: null });
  K.castAt({ x: 30, z: 30 }, { speciesId: 'kissmark_trout', z: 1.5 }); K.toBite(); K.ctx.debug.fishStrike('struck');
  ok(K.ctx.debug.fishChance() > 0.3, `a roster fish (the Kissmark Trout) lands at its own chance (${(100 * K.ctx.debug.fishChance()).toFixed(1)}%), not the floor`);
  const N = waterEnv({ own: ALL, phase: 'dusk' });
  N.castAt('under_the_span', { speciesId: 'mossback_perch', z: 0.4 }); N.toBite(); N.ctx.debug.fishOutcome('lose'); N.tick(3); N.F.onPointerDown({ input: 'mouse' }); N.F.onPointerUp(); N.toIdle();
  ok(N.last('fish:escaped')?.markedFish === false, '(any other fish lost at Keeper: not marked, as built)');
}

// =====================================================================================================================
section('no cast while a place\'s mist lifts (T128\'s fishing half)');
{
  const E = waterEnv({ own: ['lily_maze'], lifted: [] });
  E.ctx.game = { lifting: () => 'lily_maze' };
  E.F.onPointerDown({ input: 'mouse' }); E.tick(3);
  ok(E.F.state === 'idle' && E.count('loop:holdFull') === 0, 'T128: a press during the lift charges no cast');
  E.ctx.game.lifting = () => null;
  E.F.onPointerDown({ input: 'mouse' }); E.tick(2);
  ok(E.F.state === 'charging', '… and after it, it does');
  E.F.onPointerUp(); E.reset();
}

// =====================================================================================================================
section('flag-off and off a trip: the built fishing (T132)');
{
  const c = centre('lily_maze');
  const V = waterEnv({ data: DV3, outing: 'normal', runOver: { equippedBait: null, bait: {} } });
  eq(V.F.waterAt(c), { giant: false, waterKey: 'open:mossmere', placeId: null }, 'T132: v3 without the loop: no loop place there, no mist');
  ok(V.castAt('lily_maze') && V.count('fishing:mist') === 0, 'T132: … a cast there waits for a bite as built');
  const Lr = waterEnv({ outing: 'normal' });
  ok(Lr.castAt('lily_maze') && Lr.count('fishing:mist') === 0 && !('mist' in Lr.F.waterAt(c)), 'T132: the loop\'s data but not a trip: no mist');
  let elder = 0; for (let i = 0; i < 2000; i++) { const z = V.F.rollSize('mossback_perch', 1.8, { giant: true }); if (D.sizeClassOf(z) === 'elder') elder++; }
  ok(elder > 0, `T132: off the loop the built capZ (giant water still rolls Elders: ${elder})`);
  const Tn = waterEnv({ outing: 'normal' });
  let minZ = 9; for (let i = 0; i < 2000; i++) minZ = Math.min(minZ, Tn.F.rollSize('thousandcast_pike', -1.5, {}));
  ok(minZ < D.LOOP.giant.minZ, '… and no giant floor off a trip');
}

console.log(`loop-water: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
