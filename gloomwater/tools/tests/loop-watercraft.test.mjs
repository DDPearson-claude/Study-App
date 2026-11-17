// tools/tests/loop-watercraft.test.mjs — WC-1 through the real src/fishing.js (docs/loop/WATERCRAFT.md §4, §9.2 gate (e), (f) and the
// reed-edge check): a trip on the Mossmere with the world's probe from world-layout (getDepth, getShoreRadius, the docks, the mooring),
// S.cast.area from areaAt, 20,000 seeded casts through fishing.js's one draw against castOdds, the comeback waiting on a stray, and
// 40 casts at a reed edge on worms, on the bare hook and on Cut Strip.
//   node tools/tests/loop-watercraft.test.mjs   (or node tools/check.mjs)
const { loadLoopData, fakeLoop } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-watercraft' });
const { makeFishingEnv } = await import('./fishing-env.mjs');
const WL = await import('../../src/world-layout.js');
const WC = await import('../../src/watercraft.js');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);
const CAST = 16 * 0.55;   // a forced cast lands CAST m up-screen (−z) of the raft (fishing-env's castMax 16)
const L = WL.buildLayout(D.ZONES[0]);
const mooring = D.loopMooring('mossmere', L.docks);
const REED = { x: -30, z: 21.5 };   // a reed line round Mossbell Isle (watercraft.test.mjs's authored point)

function env({ phase = 'dusk', bait = null, seed = 42, wick = 'wick', loopOver = {} } = {}) {
  const loop = fakeLoop({ D, wick, maps: { lakes: ['mossmere'], places: [] }, lifted: [], bag: bait ? { [bait]: 99 } : {}, ...loopOver });
  const E = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase, seed, loop, raft: [REED.x, REED.z + CAST],
    runOver: { bait: bait ? { [bait]: 99 } : {}, equippedBait: bait, evening: 2, character: wick, nightMode: 'still' } });
  Object.assign(E.ctx.world, {   // the world's probe as the game's world gives it (world.js over the same layout)
    getDepth: (x, z) => WL.depthAt(L, x, z), getShoreRadius: (a) => L.shoreR(a),
    getDocks: () => L.docks.map((d) => ({ position: { x: d.x, y: 0, z: d.z }, yaw: d.yaw })), getMooring: () => mooring,
  });
  E.ctx.bus.on('fishing:bite', (e) => loop.noteBite(e));
  E.loop = loop;
  E.castAt = (p) => { E.ctx.player.position.set(p.x, 0, p.z + CAST); E.tick(1); return E.ctx.debug.forceBite({ wait: 2 }); };
  E.toBite = () => { for (let i = 0; i < 400 && E.F.state === 'waiting'; i++) E.tick(1); return E.F.state === 'bite'; };
  return E;
}

// =====================================================================================
section('S.cast.area: the open water\'s area of the cast (areaAt with the world\'s probe); none in a place or the mist');
{
  const E = env({ bait: 'mireworm' });
  ok(E.castAt(REED), '(a cast at the reed edge)');
  const o = E.ctx.debug.fishOdds();
  eq(o?.area, 'reeds', 'the cast at (-30, 21.5) is the reeds');
  ok(o && Math.abs(o.entries.reduce((a, e) => a + e.p, 0) - 1) < 1e-4 && o.S > 0, 'its odds sum to 1 and it has takers');
  E.reset();
  for (const [x, z, a] of [[0, 10, 'deep'], [-26, 34, 'pads'], [54, 4, 'inflow']]) { E.castAt({ x, z }); eq(E.ctx.debug.fishOdds()?.area, a, `a cast at (${x}, ${z}) is the ${a}`); E.reset(); }
  const M = env({});
  M.castAt({ x: -40.5, z: 24.5 });   // the Lily Maze, not owned: a mist cast (no bite, no area)
  ok(M.F.state === 'lost' || M.F.state === 'idle', 'a cast into a bank bites nothing');
}

// =====================================================================================
section('(e) seeded casts through fishing.js\'s draw agree with castOdds within ±0.3 points (200,000 a hook: 20,000 casts\' own noise is ±0.3 points on a 20% fish)');
for (const [bait, phase] of [['mireworm', 'dusk'], ['cut_strip', 'dusk'], [null, 'calm'], ['lumen_moss', 'gloomtide']]) {
  const E = env({ bait, phase, seed: 5 });
  E.ctx.player.position.set(REED.x, 0, REED.z); E.tick(1);
  const N = 200000, r = E.ctx.debug.fishPoolRoll(N, { bait });
  eq(r.area, 'reeds', `(${bait ?? 'bare'}, ${phase}) the draw is at the reeds`);
  let worst = 0, at = '';
  for (const id of new Set([...Object.keys(r.counts), ...Object.keys(r.shares)])) { const d = Math.abs((r.counts[id] || 0) / N - (r.shares[id] || 0)) * 100; if (d > worst) { worst = d; at = id; } }
  ok(worst <= 0.3, `${bait ?? 'the bare hook'} at the reeds (${phase}): every fish within ±0.3 points of castOdds (worst ${worst.toFixed(2)} on ${at})`);
  const pike = (r.counts.reedjaw_pike || 0) / N;
  if (bait !== 'cut_strip') ok(pike <= 0.01, `… the Reedjaw Pike ${(100 * pike).toFixed(2)}% (≤ 1%)`);
  else ok(pike >= 0.02, `… on Cut Strip the Reedjaw Pike comes (${(100 * pike).toFixed(2)}%)`);
}

// =====================================================================================
section('40 casts at a reed edge (dusk, debug.fishSeed): no pike on worms, none on the bare hook, at least one on Cut Strip');
{
  const casts = (bait, seed) => {
    const E = env({ bait, seed }); let pike = 0, bites = 0;
    for (let i = 0; i < 40; i++) { if (E.castAt(REED) && E.toBite()) { bites++; if (E.dbg().species === 'reedjaw_pike') pike++; } E.reset(); }
    return { pike, bites };
  };
  const w = casts('mireworm', 101), b = casts(null, 102), c = casts('cut_strip', 103);
  ok(w.bites === 40 && w.pike === 0, `worms: ${w.pike} pike in ${w.bites} bites`);
  ok(b.bites === 40 && b.pike === 0, `the bare hook: ${b.pike} pike in ${b.bites} bites`);
  ok(c.bites === 40 && c.pike >= 1, `Cut Strip: ${c.pike} pike in ${c.bites} bites`);
}

// =====================================================================================
section('(f) through fishing.js: a stray\'s comeback waits (no ember, no fishing:comeback, kept); on a hook it takes it comes, once');
{
  const OPEN = 'open:mossmere';
  const cb = { waterKey: OPEN, speciesId: 'reedjaw_pike', z: 1.4 };
  const W = env({ bait: 'mireworm', wick: 'ashwick', loopOver: { comeback: { ...cb } } });
  W.events.length = 0;
  W.castAt(REED); W.toBite();
  ok(W.dbg().species !== 'reedjaw_pike' && W.loop.s.comeback !== null && !W.events.some((x) => x.e === 'fishing:comeback'), 'on worms the pike\'s comeback waits (not served, kept)');
  ok(W.ctx.debug.fishOdds()?.waited === true, '… castOdds says it waited');
  const C = env({ bait: 'cut_strip', wick: 'ashwick', loopOver: { comeback: { ...cb } } });
  C.events.length = 0;
  C.castAt(REED); C.toBite();
  ok(C.dbg().species === 'reedjaw_pike' && Math.abs(C.dbg().z - 1.4) < 1e-9, 'on Cut Strip it comes: that fish at its z');
  ok(C.loop.calls.some((c) => c.name === 'consumeComeback') && C.loop.s.comeback === null, '… consumed when its bite is served');
  const b = C.events.find((x) => x.e === 'fishing:bite')?.p;
  ok(b?.comeback === true && !('speciesId' in (b || {})), '… fishing:bite {comeback: true} names no fish');
}

// =====================================================================================
section('(h) T104 extended: the game\'s pool (castOdds on data.placePool, as fishing.js builds it) is the sim\'s poolFor, every place and area × light × the 12 hooks × no Wick and Taper');
{
  const SIM = await import('../sim/clams.mjs');
  const HOOKS = [{}, { bait: 'mireworm' }, { bait: 'lumen_moss' }, { bait: 'cut_strip' }, { bait: 'heartmoss' },
    { lure: 'feather_fly' }, { lure: 'glimmer_spoon' }, { lure: 'bone_jig' }, { lure: 'bell_spinner' },
    { lure: 'glimmer_spoon', bait: 'mireworm' }, { lure: 'feather_fly', bait: 'lumen_moss' }, { lure: 'bone_jig', bait: 'cut_strip' }];
  const LIGHTS = { day: 'calm', dusk: 'dusk', night: 'gloomtide' }, ball = D.LOOP.legendBait.mossmere.id, gb = (b) => (b === ball ? null : b ?? null);
  let n = 0, worst = 0; const bad = [];
  // (a secret place, Veilback Brook (LOST-TACKLE §5), is not in the sim until lane L6 ports it; its pool is checked in veilback-brook.test.mjs)
  for (const where of [...WC.AREAS.map((a) => ({ area: a, place: null })), ...Object.keys(D.LOOP.places).filter((p) => D.LOOP.places[p].secret !== true).map((p) => ({ area: null, place: p }))]) {
    for (const [ph, gph] of Object.entries(LIGHTS)) for (const h of HOOKS) for (const wick of [null, 'taper']) {
      const pool = D.placePool(D.SPECIES, { placeId: where.place, phase: gph, bait: gb(h.bait), wickId: wick, water: 'mossmere' });
      const ar = pool.place ? null : where.area ?? 'open';
      const game = WC.castOdds(D, { pool, area: ar, phase: gph, lure: h.lure ?? null, bait: gb(h.bait), wickId: wick });
      const sim = SIM.poolFor('mossmere', pool.place, ph, h.lure ?? null, h.bait ?? null, null, 1, wick, ar);
      const a = new Map(), b = new Map();
      for (const [sp, w] of sim.list) a.set(sp.id, (a.get(sp.id) || 0) + w / sim.tot);
      for (const e of game.entries) b.set(e.sp.id, (b.get(e.sp.id) || 0) + e.p);
      for (const id of new Set([...a.keys(), ...b.keys()])) { const d = Math.abs((a.get(id) ?? 0) - (b.get(id) ?? 0)); worst = Math.max(worst, d); if (d > 1e-9) bad.push(`${where.place ?? where.area} ${ph} ${JSON.stringify(h)} ${wick}: ${id}`); }
      n++;
    }
  }
  ok(!bad.length && n === 14 * 3 * 12 * 2, `T104 extended: ${n} pools, every share the same (worst ${worst.toExponential(1)})${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
}

section('Murk\'s price factor: the game ships at LOOP.cost.shipped (the user\'s ×2) in a page; node keeps ×1; GW_LOOP_COST, then ?cost=N, replace it');
{
  const f = D.loopCostFactor, page = (search, extra = {}) => ({ document: {}, location: { search }, ...extra });
  eq(D.LOOP_COST_SHIPPED, 2, 'the shipped factor is the user\'s "double the original costs"');
  eq([D.LOOP.cost.factor, D.LOOP.cost.shipped, D.LOOP.cost.consumables], [1, 2, 1], 'node (no page): LOOP.cost plays at ×1, ships at ×2, consumables 1');
  eq([f({}), f({ document: {} }), f(page('?loop=1')), f(page('')), f(page('?loop=1&cost=1')), f(page('?cost=4')), f(page('?cost=2.5'))],
    [1, 1, 2, 2, 1, 4, 2.5], 'loopCostFactor: node 1, a fake document without a location 1, a page 2, ?cost=N its N');
  eq([f(page('?cost=0')), f(page('?cost=-3')), f(page('?cost=abc')), f(page('?cost='))], [2, 2, 2, 2], 'loopCostFactor: a ?cost that is not a positive number keeps the shipped ×2');
  eq([f({ GW_LOOP_COST: 3 }), f(page('?cost=4', { GW_LOOP_COST: 1 })), f(page('', { GW_LOOP_COST: '5' })), f(page('', { GW_LOOP_COST: 0 }))], [3, 1, 5, 2], 'loopCostFactor: a preset GW_LOOP_COST wins over ?cost and the page');
  eq([D.loopCost(30), D.loopCost(10, { consumable: true })], [30, 10], 'node loopCost: base prices (the tests\' prices)');
}

console.log(`\nloop-watercraft: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.slice(0, 20).join('\n')); process.exit(1); }
