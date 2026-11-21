// FE-S1 and the anchor (DESIGN §25.14.2b FE-S1, §25.0.2c; CONTRACT §13.3, §13.7 player, §13.7a): src/player.js driven in node
// with a fake ctx. The Landing's raft mode spawns at COVE.arena.moorings[0].slot (7, 2) with yaw 90; 60 s of scripted sailing
// along the whole closure (every heading, hard into the breakwaters and the soft wall across the arch) never crosses the arch line
// or leaves the cove; the Map Table post is an interact target; Set Out (the input-locked auto-sail at raft speed, then the 3 s
// glide) reaches the arch line 6 ± 0.3 s after the call from anywhere in the post's reach and fires once; every later run's
// glide fires once and a tap skips it; the anchor holds the raft (± 0.01 m) against held or mashed input and combat's knock /
// push / pull while a fish is on, in every night mode, and only fishing's tow moves it.
//   node tools/tests/player-cove.test.mjs
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const D = await import('../../src/data.js');
const core = await import('../../src/core.js');
const P = await import('../../src/player-cove.js');
const PL = await import('../../src/player.js');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, eps, msg) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`);
const section = (s) => console.log(`- ${s}`);
const C = D.COVE, GT = D.FIRST_EVENING.gate, ARCH = C.archLineZ;
const LEGS = [C.seaGate.legs[0].x, C.seaGate.legs[1].x];

function harness({ worldCove = false } = {}) {
  const bus = core.createBus();
  const events = [];
  const fishing = { state: 'idle', cancel() {} };
  const ctx = {
    bus, data: D, flow: 'hub', state: { meta: {}, run: null }, time: { dt: 1 / 30 },
    input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 } },
    render: { getYaw: () => 0 }, fishing, world: { getZone: () => (worldCove ? C : D.ZONES[0]), getMode: () => 'raft' },
    survival: null, combat: null, actors: null,
  };
  for (const e of ['interact:change', 'station:open', 'player:glide']) bus.on(e, (p) => events.push({ e, p: { ...p } }));
  const pl = PL.create(ctx);
  ctx.player = pl;
  pl.init();
  bus.emit('zone:change', { zone: 'cove', hub: true, prev: null, from: 'boot' });
  const step = (sec, dt = 1 / 30, each = null) => { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) { if (each) each(i * dt); pl.update(dt); } };
  return { ctx, pl, bus, events, fishing, step };
}

section('the pure cove model (player-cove.js)');
{
  const M = P.coveRaftMask(D);
  ok(!!M && M.cells > 5000, `the closed cove has raft water (${M?.cells} cells)`);
  ok(M.ok(C.arena.moorings[0].slot.x, C.arena.moorings[0].slot.z), 'the mooring slot is raft water');
  let beyond = 0;
  for (let k = 0; k < M.mask.length; k++) if (M.mask[k]) { const x = M.G.ox + ((k % M.G.n) + 0.5) * M.G.cell, z = M.G.oz + (((k / M.G.n) | 0) + 0.5) * M.G.cell; if (z < ARCH - 0.5 || (z < ARCH && x > LEGS[0] && x < LEGS[1])) beyond++; }
  eq(beyond, 0, 'no raft-water cell lies beyond the arch line (validate-data\'s closed cove)');
  ok(!M.ok(6.75, -18) && !M.ok(6.75, -24), 'the soft wall and the channel beyond are not raft water');
  ok(!M.ok(-17, 1) && !M.ok(0, 2) && !M.ok(4, -6.5), 'the quay, the jetty and Murk\'s barge are not raft water');
  const post = C.v0.posts.find((p) => p.id === GT.post);
  let starts = 0;
  for (let k = 0; k < M.mask.length; k++) if (M.mask[k]) { const x = M.G.ox + ((k % M.G.n) + 0.5) * M.G.cell, z = M.G.oz + (((k / M.G.n) | 0) + 0.5) * M.G.cell; if (Math.hypot(x - post.x, z - post.z) <= C.v0.range) {
    starts++;
    const plan = P.departurePlan({ start: [x, z], via: GT.via, joinAt: GT.joinAt, setOutPath: C.setOutPath, glideFrom: GT.glideFrom, archLineZ: ARCH, vRaft: 6 });
    if (Math.abs(plan.crossAt - 6) > 1e-6) ok(false, `departure from (${x}, ${z}) crosses at ${plan.crossAt}`);
  } }
  ok(starts > 20, `the departure plan crosses the arch line at exactly 6 s from all ${starts} points in the post's reach`);
  const h = P.hermite(30, 3, 6);
  near(h.s(0), 0, 1e-9, 'hermite s(0)'); near(h.s(3), 30, 1e-9, 'hermite s(T)'); near(h.v(0), 6, 1e-9, 'hermite v(0)');
}

section('spawn: the raft at the mooring slot (7, 2), yaw 90 (Landing v0 raft mode)');
{
  const H = harness();
  ok(H.pl.coveMode, 'cove raft mode after zone:change {hub: true}');
  near(H.pl.position.x, 7, 0.01, 'x'); near(H.pl.position.z, 2, 0.01, 'z');
  near(H.pl.heading, Math.PI / 2, 1e-6, 'yaw 90°');
}

section('60 s of scripted sailing along the whole closure never crosses the arch line or leaves the cove');
{
  const H = harness();
  // a sweep: hard north (the soft wall), north-east and north-west (the breakwaters), west along the quay, round the ring
  const legs = [[0, 1], [0.7, 0.7], [1, 0], [0, 1], [-0.7, 0.7], [-1, 0], [-0.7, 0.7], [0, 1], [-1, 0], [0, -1], [1, 0], [0.7, 0.7], [0, 1], [-1, 0.2], [0, 1], [1, 0.3], [0.2, 1]];
  let minZ = Infinity, maxR = 0, crossed = 0, outside = 0;
  H.step(60, 1 / 30, (t) => {
    const l = legs[Math.floor(t / (60 / legs.length)) % legs.length];
    H.ctx.input.move.x = l[0]; H.ctx.input.move.y = l[1];
    const p = H.pl.position;
    minZ = Math.min(minZ, p.z); maxR = Math.max(maxR, Math.hypot(p.x, p.z));
    if (p.z < ARCH && p.x > LEGS[0] && p.x < LEGS[1]) crossed++;
    if (p.z < ARCH - 0.5) crossed++;
    if (Math.hypot(p.x, p.z) > C.arena.radius) outside++;
  });
  eq(crossed, 0, `the raft never crosses the arch line (northmost z ${minZ.toFixed(2)})`);
  eq(outside, 0, `the raft never leaves the cove (farthest ${maxR.toFixed(1)} m of R ${C.arena.radius})`);
  ok(minZ < -12, `the sweep really pressed north toward the arch (reached z ${minZ.toFixed(1)})`);
  // straight at the soft wall from below the arch for 10 s
  H.pl.teleport({ x: 6.75, z: -12 }, 0);
  H.ctx.input.move.x = 0; H.ctx.input.move.y = 1;
  let mz = Infinity; H.step(10, 1 / 30, () => { mz = Math.min(mz, H.pl.position.z); });
  ok(mz > ARCH, `pressed against the soft wall for 10 s the raft stays south of the arch line (z ${mz.toFixed(2)})`);
  H.ctx.input.move.y = 0;
}

section('the Map Table post: an interact target (station:map_table, Plan) that opens the card');
{
  const H = harness();
  H.pl.toPost();
  H.step(0.2);
  eq(H.pl.interactable?.id, 'station:map_table', 'in the post\'s 5 m reach: station:map_table');
  eq(H.pl.interactable?.label, 'Plan', 'the pill reads Plan');
  ok(H.events.some((x) => x.e === 'interact:change' && x.p.id === 'station:map_table'), 'interact:change {id: station:map_table}');
  H.events.length = 0;
  ok(H.pl.interact() === true && H.events.some((x) => x.e === 'station:open' && x.p.id === 'map_table'), 'interact() → station:open {id: map_table}');
  H.pl.toMooring(); H.step(0.2);
  eq(H.pl.interactable, null, 'out of reach at the mooring: no pill');
}

section('Set Out: auto-sail + glide reach the arch line in 6 ± 0.3 s and fire once');
{
  for (const start of [[-9, 11.5], [-5, 10.5], [-12.5, 10], [-6.5, 12]]) {
    const H = harness();
    H.pl.teleport({ x: start[0], z: start[1] }, Math.PI / 2);
    let fired = 0, at = null, t = 0;
    const pr = H.pl.setOutFromPost({ onLine: () => { fired++; at = t; } });
    ok(pr && typeof pr.then === 'function', 'setOutFromPost returns a Promise');
    H.ctx.input.move.x = -1; H.ctx.input.move.y = -1;   // input during the departure does nothing (input-locked)
    let minZ = Infinity;
    for (let i = 0; i < 300; i++) { t += 1 / 30; H.pl.update(1 / 30); minZ = Math.min(minZ, H.pl.position.z); }
    eq(fired, 1, `from (${start}): the arch line fires once`);
    near(at, 6, 0.3, `from (${start}): the departure takes 6 ± 0.3 s`);
    ok(minZ < ARCH, `from (${start}): the glide passed the soft wall (z ${minZ.toFixed(1)})`);
    ok(H.events.some((x) => x.e === 'player:glide' && x.p.state === 'start' && x.p.kind === 'setout'), 'player:glide start (setout)');
  }
}

section('every later run: the 3 s glide from the mooring fires once; a tap skips it');
{
  const H = harness();
  let fired = 0, at = null, t = 0;
  H.pl.setOutFromMooring({ onLine: () => { fired++; at = t; }, skippable: true });
  near(H.pl.position.x, 7, 0.01, 'starts at the mooring slot');
  for (let i = 0; i < 120; i++) { t += 1 / 30; H.pl.update(1 / 30); }
  eq(fired, 1, 'fires once');
  ok(at > 2 && at < 3.05, `the arch crossing inside the 3 s glide (${at?.toFixed(2)} s)`);
  eq(H.pl.glideState, null, 'the glide ends');
  const H2 = harness();
  let f2 = 0;
  H2.pl.setOutFromMooring({ onLine: () => f2++, skippable: true });
  H2.step(0.3);
  ok(H2.pl.skipGlide() === true && f2 === 1 && H2.pl.position.z < ARCH, 'skipGlide fires the line at once, past the arch');
  const H3 = harness();
  H3.pl.setOutFromMooring({ onLine: () => {}, skippable: false });
  ok(H3.pl.skipGlide() === false && !!H3.pl.glideState, 'the first departure is not skippable');
}

section('the anchor: no input, knock, push or pull moves the raft while a fish is on; only the tow does');
{
  for (const mode of ['still', 'lantern', 'gloomtide']) {
    const H = harness();
    H.ctx.flow = 'playing'; H.ctx.state.run = { active: true, nightMode: mode, zone: 'mossmere' };
    H.bus.emit('zone:change', { zone: 'mossmere', prev: 'cove' });
    H.pl.teleport({ x: 0, z: 10 }, 0);
    H.step(0.5);
    H.fishing.state = 'reeling';
    const x0 = H.pl.position.x, z0 = H.pl.position.z;
    H.step(4, 1 / 30, (t) => {
      const k = Math.floor(t * 7) % 4;   // mash: held, released, the other way
      H.ctx.input.move.x = [1, 0, -1, 0.5][k]; H.ctx.input.move.y = [1, 0, -1, -0.5][k];
      if (k === 2) { H.pl.knock(x0 + 2, z0, 4); H.pl.push(1, 0, 3); H.pl.pull(x0 - 10, z0, 4); H.pl.applyKnock(3, 3); }
    });
    near(Math.hypot(H.pl.position.x - x0, H.pl.position.z - z0), 0, 0.01, `${mode}: held / mashed input and combat's shoves leave the raft where it is`);
    eq(H.pl.cutLineK, 0, `${mode}: no hold-to-cut on the v3 path`);
    H.pl.tow(0, -0.6);
    near(H.pl.position.z, z0 - 0.6, 0.02, `${mode}: the play's tow moves it 0.6 m`);
    H.fishing.state = 'lost';
    H.pl.knock(x0 + 2, z0, 4); H.step(0.5);
    near(H.pl.position.z, z0 - 0.6, 0.02, `${mode}: still anchored in the quiet beat (lost)`);
    H.fishing.state = 'idle';
    H.ctx.input.move.x = 1; H.ctx.input.move.y = 0;
    H.step(1);
    ok(H.pl.position.x > x0 + 1, `${mode}: free to sail once the note is up (state idle)`);
    H.ctx.input.move.x = 0;
  }
}

section('writeSave / restore (run.pos)');
{
  const H = harness();
  H.ctx.flow = 'playing'; H.ctx.state.run = { active: true, zone: 'mossmere' };
  H.bus.emit('zone:change', { zone: 'mossmere', prev: 'cove' });
  H.pl.teleport({ x: 3, z: 12 }, 0);
  const run = { zone: 'mossmere' };
  H.pl.writeSave(run);
  ok(run.pos && run.pos.zone === 'mossmere' && Math.abs(run.pos.x - H.pl.position.x) < 0.01 && run.pos.mode === 'raft', 'run.pos {zone, x, z, y, mode, mooring}');
  H.pl.teleport({ x: 0, z: 0 }, 0);
  ok(H.pl.restore(run.pos) && Math.hypot(H.pl.position.x - run.pos.x, H.pl.position.z - run.pos.z) < 0.6, 'restore snaps back to run.pos');
}

console.log(`player-cove: ${pass} passed, ${fail} failed`);
if (fail) { for (const f of failures) console.log('  - ' + f); process.exit(1); }
