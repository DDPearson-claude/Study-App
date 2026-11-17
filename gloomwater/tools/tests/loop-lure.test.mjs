// tools/tests/loop-lure.test.mjs — bait or a lure (the user, 17 Nov 2026): one thing on the hook, no tipped grades, and a lure's cast
// through the real src/fishing.js: the line comes back by itself (LOOP.lureCast.pace), a strike only from the hook table's odds at the
// area under the lure (watercraft.lureStrike), and at the raft it comes in quietly with nothing spent.
//   node tools/tests/loop-lure.test.mjs   (or node tools/check.mjs)
const { loadLoopData, fakeLoop } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-lure' });
const { makeFishingEnv } = await import('./fishing-env.mjs');
const WL = await import('../../src/world-layout.js');
const WC = await import('../../src/watercraft.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const section = (s) => console.log(`- ${s}`);
const L = WL.buildLayout(D.ZONES[0]);
const mooring = D.loopMooring('mossmere', L.docks);

section('no tipped rows: a lure reads its own column whatever bait is named');
{
  const ids = Object.keys(WC.WATERCRAFT.mossmere.hook.table);
  let same = true;
  for (const lure of ['glimmer_spoon', 'feather_fly', 'bone_jig']) for (const bait of ['mireworm', 'lumen_moss', 'cut_strip']) for (const id of ids) {
    if (WC.gradeOf(id, { lure, bait }) !== WC.gradeOf(id, { lure })) same = false;
  }
  ok(same, 'every fish: gradeOf({lure, bait}) === gradeOf({lure})');
  ok(WC.lureStrike({ entries: [] }, 0.5, 0) === null, 'lureStrike: no odds, no strike');
  const odds = { entries: [{ sp: { id: 'a' }, p: 1, g: 0 }] };
  ok(WC.lureStrike(odds, 0.1, 0.5, 0.1) === null && WC.lureStrike(odds, 0.1, 0.005, 0.1)?.sp.id === 'a', 'lureStrike: a grade-0 fish strikes only at the stray take (1%)');
  const g2 = { entries: [{ sp: { id: 'b' }, p: 1, g: 2 }] };
  ok(WC.lureStrike(g2, 0.1, 0.19, 0.1)?.sp.id === 'b' && WC.lureStrike(g2, 0.1, 0.21, 0.1) === null, 'lureStrike: grade 2 at base + 0.1');
}

function env({ lure = 'glimmer_spoon', seed = 42, raft = [0, 22] } = {}) {
  const loop = fakeLoop({ D, wick: 'wick', maps: { lakes: ['mossmere'], places: [] }, lifted: [], bag: { mireworm: 5 } });
  const E = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase: 'dusk', seed, loop, raft,
    runOver: { bait: { mireworm: 5 }, equippedBait: null, lure, evening: 2, character: 'wick', nightMode: 'still' } });
  Object.assign(E.ctx.world, {
    getDepth: (x, z) => WL.depthAt(L, x, z), getShoreRadius: (a) => L.shoreR(a),
    getDocks: () => L.docks.map((d) => ({ position: { x: d.x, y: 0, z: d.z }, yaw: d.yaw })), getMooring: () => mooring,
  });
  return E;
}
const raftD = (E, b) => Math.hypot(b.x - E.ctx.player.position.x, b.z - E.ctx.player.position.z);

section('a lure\'s cast: no wait, the line comes back toward the raft at the pace; at the raft it comes in quietly, nothing spent');
{
  // a strike chance of 0: the lure comes all the way in
  const saved = D.LOOP.lureCast.strike;
  D.LOOP.lureCast.strike = 0;
  const E = env();
  ok(E.ctx.debug.castAt(0, 8), 'cast 14 m out');
  for (let i = 0; i < 60 && E.F.state === 'casting'; i++) E.tick(1);
  ok(E.F.state === 'waiting' && E.F.hookLine().out === true, 'landed: the line is out', E.F.state);
  const bob = () => E.calls.bobber[E.calls.bobber.length - 1];
  const d0 = raftD(E, bob());
  E.tick(30);   // 1 s
  const d1 = raftD(E, bob());
  ok(d0 - d1 > D.LOOP.lureCast.pace * 0.8 && d0 - d1 < D.LOOP.lureCast.pace * 1.2, 'one second in: the lure is about pace m nearer', { d0, d1 });
  ok(bob().visible && bob().y < -0.05, 'the marker rides low while it comes back', bob());
  const ev0 = E.events.length, consume0 = E.calls.consume;
  let t = 1;
  for (; t < 30 && E.F.state === 'waiting'; t += 1 / 30) E.tick(1);
  ok(E.F.state === 'lost' || E.F.state === 'idle', 'at the raft the line comes in', E.F.state);
  const want = (d0 - D.LOOP.lureCast.inAt) / D.LOOP.lureCast.pace;   // (slow, as the user asked: about 10 s for this cast at 1.2 m/s)
  ok(t > want * 0.7 && t < want * 1.3, `a 14 m cast comes in at the pace, slowly (${t.toFixed(1)} s, about ${want.toFixed(1)} s)`);
  const evs = E.events.slice(ev0).map((e) => e.e);
  for (const e of ['fishing:miss', 'fishing:escaped', 'fishing:bite', 'fishing:hook']) ok(!evs.includes(e), `no ${e}`);
  ok(evs.includes('fishing:reelIn'), 'fishing:reelIn {quiet}');
  ok(E.calls.consume === consume0 && E.run.bait.mireworm === 5 && E.calls.refund.length === 0, 'nothing spent or refunded (no bait on a lure)');
  D.LOOP.lureCast.strike = saved;
}

section('a strike: only from the hook table\'s odds at the area under the lure, then the built bite');
{
  const saved = D.LOOP.lureCast.strike;
  D.LOOP.lureCast.strike = 0.9;
  const E = env({ seed: 3 });
  E.ctx.debug.castAt(0, 8);
  for (let i = 0; i < 60 && E.F.state === 'casting'; i++) E.tick(1);
  let struck = 0;
  E.ctx.bus.on('fishing:lureStrike', () => { struck++; });
  for (let i = 0; i < 400 && E.F.state === 'waiting'; i++) E.tick(1);
  ok(struck === 1 && E.F.state === 'bite', 'a strike: the bite follows', { struck, state: E.F.state });
  const o = E.ctx.debug.fishOdds();
  ok(o && o.entries.length > 0 && o.area, 'the strike came from castOdds at an area of open water', o && { area: o.area, n: o.entries.length });
  const sp = E.ctx.debug.fishing().species;
  ok(sp && o.entries.some((e) => e.id === sp), 'the fish on is one of the odds\' entries', sp);
  D.LOOP.lureCast.strike = saved;
}

console.log(`loop-lure: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
