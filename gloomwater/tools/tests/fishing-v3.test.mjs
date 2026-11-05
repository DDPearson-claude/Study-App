// Unit tests for the v3 Phase 1 fishing items (DESIGN §25.14.2 F1, F4, F13, F7; CONTRACT §13.7 fishing) on the v3 data at
// phase 1 (raft build), plus a flag-off sanity pass. Pure logic from src/fishing-reel.js and src/fishing.js on a fake ctx
// (tools/tests/fishing-env.mjs; seeded through its fishSeed debug hook). D1′ retired the manual v3 reel's data (size → fight,
// the reel edits, old tricks, pips, drag presets, the v3 fight stats, tools/sim/reel-v3.mjs), so its sim-parity, old-trick, pip
// and fight-stat sections went with it; the code they drove is removed from the v3 path by the AF build (F4′, F2′, U2′).
//   node tools/tests/fishing-v3.test.mjs            (or node tools/check.mjs; --verbose prints every passing check)
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
import { createReel, rollZ, capZ, floatFavour, sumFavour, inGiantSpot } from '../../src/fishing-reel.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const D = await import('../../src/data.js?fishing-v3p1');
globalThis.GW_WALK = true;
const DW = await import('../../src/data.js?fishing-v3p1-walk');   // phase 1 with §24's walking lakes (their places are in the build)
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;
const { makeFishingEnv } = await import('./fishing-env.mjs');

const args = process.argv.slice(2);
let pass = 0, fail = 0;
const VERBOSE = args.includes('--verbose');
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const near = (a, b, eps) => Math.abs(a - b) <= eps;
const section = (s) => console.log(`- ${s}`);
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SZ = D.BALANCE.size, FV = D.BALANCE.favour;
const sp = (id, d = D) => d.SPECIES.find((s) => s.id === id);

// =================================================================== F1: the size model (pure)
section('F1 size roll: 10,000 seeded rolls per μ reproduce the §25.7.1 class table (giant water) within ±1 point');
const TABLE = {   // DESIGN §25.7.1 (Small, Keeper, Prize, Trophy, Elder, of which Ancient), %
  0: [38.7, 46.0, 12.2, 2.7, 0.4, 0.1],
  1.0: [10.5, 41.3, 29.6, 14.1, 4.5, 0.9],
  1.8: [2.1, 21.1, 32.0, 28.1, 16.8, 4.7],
};
for (const [muS, want] of Object.entries(TABLE)) {
  const mu = Number(muS), rng = mul(1000 + Math.round(mu * 10)), n = 10000, c = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    const z = rollZ(mu, rng, { min: SZ.z.min, max: SZ.z.max, sd: SZ.z.sd });
    const k = ['small', 'keeper', 'prize', 'trophy', 'elder'].indexOf(D.sizeClassOf(z));
    c[k]++; if (k === 4 && D.isAncient(z)) c[5]++;
  }
  const got = c.map((v) => (100 * v) / n);
  ok(got.every((g, i) => Math.abs(g - want[i]) <= 1 + 1e-9), `μ ${mu}: ${got.map((g) => g.toFixed(1)).join(' / ')} ≈ ${want.join(' / ')}`);
}
section('F1 caps: outside giant water z never exceeds 2.64; fry places cap at Prize; giantsKept lifts both caps for the kept species');
{
  const reed = sp('reedjaw_pike'), rng = mul(7);
  const capOut = capZ({ species: reed, giantWater: false, size: SZ }), capIn = capZ({ species: reed, giantWater: true, size: SZ });
  ok(capOut === 2.64 && capIn === 3.6, `Reedjaw cap ${capOut} outside / ${capIn} in giant water`);
  let maxOut = -9, eldIn = 0;
  for (let i = 0; i < 10000; i++) { maxOut = Math.max(maxOut, rollZ(1.8, rng, { cap: capOut })); if (rollZ(1.8, rng, { cap: capIn }) >= 2.65) eldIn++; }
  ok(maxOut <= 2.64, `max z outside giant water at μ 1.8 = ${maxOut.toFixed(3)} ≤ 2.64`);
  ok(eldIn > 1400 && eldIn < 1960, `Elders inside giant water at μ 1.8: ${eldIn} / 10000 (≈ 16.8%)`);
  const fry = { id: 'fry', maxClass: 'prize' };
  ok(capZ({ species: reed, place: fry, giantWater: true, size: SZ }) === SZ.classMaxZ.prize, 'a maxClass prize place caps z at 1.879 even in giant water');
  const kept = { id: 'gatehouse', maxClass: 'trophy', giantsKept: true, kept: ['old_portcullis'] };
  ok(capZ({ species: { id: 'old_portcullis' }, place: kept, giantWater: false, size: SZ }) === 3.6, 'giantsKept: the kept species rolls past the clamp and the place cap');
  ok(capZ({ species: reed, place: kept, giantWater: false, size: SZ }) === 2.64, 'giantsKept: every other species keeps both caps');
  ok(capZ({ species: { id: 'x', maxClass: 'trophy' }, giantWater: true, size: SZ }) === SZ.classMaxZ.trophy, 'a species maxClass (the Lampwarden) caps at Trophy in giant water');
  const ring = D.RAFT_FALLBACK_V3.mossmere.giants[0];
  ok(inGiantSpot(ring, ring.x + 5, ring.z) && !inGiantSpot(ring, ring.x + 1, ring.z) && !inGiantSpot(ring, ring.x + 10, ring.z), 'the legend-pool rim ring is giant water from r 3.2 to 9 only');
}
section('F13 float favour: species-independent terms + per-term max over the pool; never depends on the rolled species');
{
  const base = [{ family: 'hour', id: 'nightRise', value: 0.25 }];
  const a = [{ family: 'tackle', id: 'depthLowerThird', value: 0.25 }], b = [{ family: 'match', id: 'condition', value: 0.3 }];
  const f = floatFavour(base, [a, b, []], 1.8);
  ok(near(f.mu, 0.8, 1e-9) && f.terms.length === 3, `float μ = 0.25 + max depth 0.25 + max match 0.3 = ${f.mu}`);
  ok(sumFavour([{ value: 1.2 }, { value: 0.9 }], 1.8) === 1.8, 'μ caps at 1.8');
  const notch = (mu) => D.favourNotches(mu);
  ok([0.14, 0.15, 0.44, 0.45, 0.79, 0.8, 1.19, 1.2, 1.59, 1.6].map(notch).join('') === '0112233445', 'notches follow the six bands < .15 · .15–.45 · .45–.8 · .8–1.2 · 1.2–1.6 · ≥ 1.6');
}

// =================================================================== F2: the reel model's v3 options (src/fishing-reel.js, explicit options)
section('F2 reel: drag absorbs and slips progress 0.08 per unit absorbed; Spooled; pips thrown at 0');
{
  const sp0 = { power: 1, surgeEvery: 30, surgeTime: 1, stamina: 10, sweet: 1, erratic: 0 };
  const mk = (extra = {}) => createReel({ R: D.BALANCE.reel, sp: sp0, behavior: 'steady', LS: 1, RS: 1, rng: mul(3),
    v3: { ease: { base: 0.8, perLoad: 0.2 }, drag: { slipLoss: 0.08, spooledSlip: 0.5 }, absorb: 0.45, dragAt: 0.8, shock: 0, fatigue: { after: 60, perS: 0.01, floor: 0.6 }, pips: null, ...extra } });
  const r = mk();
  r.T = 0.9; r.vT = 0.6; r.P = 0.5;   // above the drag point, rising, out of the safe band (no reel gain)
  const T0 = r.T, P0 = r.P;
  r.step(1 / 30, true);
  const dP = r.P - P0, ab = r.slipped;
  ok(ab > 0 && near(dP, -0.08 * ab, 1e-12), `held above the drag point: ΔP ${dP.toExponential(3)} = −0.08 × absorbed ${ab.toExponential(3)}`);
  const raw = (r.T - T0) / (1 - 0.45);
  ok(near(ab, raw * 0.45, 1e-12), 'absorbed = dT × absorb (0.45, Reel T1)');
  const r2 = mk(); r2.T = 0.6; r2.vT = 0.6; r2.step(1 / 30, true);
  ok(r2.slipped === 0, 'no slip below the drag point');
  const r3 = mk(); r3.T = 0.95; r3.vT = -0.5; r3.step(1 / 30, false);
  ok(r3.slipped === 0, 'no slip while tension falls');
  const r4 = mk(); r4.slipped = 0.6; r4.P = 0.0005; r4.T = 0.1; r4.vT = -0.5; r4.step(1 / 30, false);
  ok(r4.done && r4.result === 'spooled', `progress 0 after slip > 0.5 → Spooled (${r4.result})`);
  const r5 = mk({ pips: { n: 2, low: 0.15 } });
  let lost = 0; const events = [];
  const r6 = createReel({ R: D.BALANCE.reel, sp: sp0, behavior: 'steady', LS: 1, RS: 1, rng: mul(4), onEvent: (t, p) => { events.push(t); if (t === 'pip') lost++; },
    v3: { ease: { base: 0.8, perLoad: 0.2 }, drag: { slipLoss: 0.08, spooledSlip: 0.5 }, absorb: 0.3, dragAt: 0.8, shock: 0, fatigue: null, pips: { n: 2, low: 0.15 } } });
  for (let round = 0; round < 2 && !r6.done; round++) {
    r6.forceSurge();
    let guard = 0;
    while (r6.surgeMode !== 'surge' && guard++ < 200) r6.step(1 / 30, false);
    r6.T = 0.3; r6.step(1 / 30, false);          // in the surge, above the line
    r6.T = 0.05; r6.vT = -0.5; r6.step(1 / 30, false);   // dips below 0.15: a pip
    guard = 0; while (r6.surgeMode === 'surge' && !r6.done && guard++ < 200) { r6.T = 0.3; r6.vT = 0; r6.step(1 / 30, false); }
  }
  ok(lost === 2 && r6.done && r6.result === 'thrown', `two surge dips with 2 pips → thrown (${lost} lost, ${r6.result})`);
  ok(r5.pips === 2 && r5.pipsMax === 2, 'pips read-out');
}
// =================================================================== fishing.js on a fake ctx
const makeEnv = (opts = {}) => makeFishingEnv({ data: D, ...opts });

section('D1′: the manual v3 reel\'s data is retired: the v3 path still runs (size, class, favour), with no pips and no old trick');
{
  ok(!('fight' in SZ) && !('reel' in SZ) && !('pips' in D.BALANCE.bite) && !('shock' in D.STATS), 'BALANCE.size.fight / .reel, bite.pips and the v3 fight stats are gone');
  const env = makeEnv({ raft: [4, 14.8] });
  env.ctx.debug.fishHook('reedjaw_pike', { z: 1.4 });
  const hk = [...env.events].reverse().find((x) => x.e === 'fishing:hook');
  ok(env.F.state === 'reeling' && env.dbg().v3 === true && env.dbg().z === 1.4 && env.F.view.pips === null && hk.p.pips === null, `a Prize (z ${env.dbg().z}) is hooked on the v3 path with no pips (${env.F.view.pips})`);
  env.reset();
  env.ctx.debug.fishHook('reedjaw_pike', { z: 2.95 });
  const reel = env.ctx.debug.fishReel();
  ok(env.F.state === 'reeling' && reel.trickDone === true && reel.trick === false, 'an Elder has no old trick pending');
}

section('F1 in game: z never exceeds 2.64 outside giant water; the stopgap giant spots hold Elders');
{
  const env = makeEnv({ raft: [30, 30] });            // the bobber lands at (30, 21.2): open water
  env.ctx.debug.setFavour(1.8);
  let maxZ = -9, n = 0;
  for (let i = 0; i < 1500; i++) { env.ctx.debug.forceBite({ speciesId: 'reedjaw_pike' }); const d = env.dbg(); if (d.z != null) { maxZ = Math.max(maxZ, d.z); n++; } env.reset(); }
  ok(n === 1500 && maxZ <= 2.64, `1500 forced bites at μ 1.8 in open water: max z ${maxZ.toFixed(3)} ≤ 2.64`);
  const g = makeEnv({ raft: [4, 14.8] });              // the bobber lands at (4, 6): the stopgap's mm_deep_centre disc
  g.ctx.debug.setFavour(1.8);
  let eld = 0, key = null;
  for (let i = 0; i < 1500; i++) { g.ctx.debug.forceBite({ speciesId: 'reedjaw_pike' }); const d = g.dbg(); if (d.sizeClass === 'elder') eld++; key = d.pressureKey; g.reset(); }
  ok(eld > 180 && eld < 330 && key === 'mm_deep_centre', `the same at a stopgap giant spot (${key}): ${eld} Elders / 1500 (≈ 16.8%)`);
}
section('F1 pressure: −0.12 per catch at a place, floor −0.6, reset at dawn; F13 "gone quiet" after three catches');
{
  const env = makeEnv({ raft: [4, 14.8] });
  const pressureTerm = () => (env.F.view.favour?.terms || []).find((t) => t.family === 'pressure')?.value ?? 0;
  const quiet = [];
  for (let i = 0; i < 6; i++) {
    env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
    ok(near(pressureTerm(), Math.max(-0.6, -0.12 * i), 1e-9), `cast after ${i} catch(es): pressure ${pressureTerm()}`);
    quiet.push(env.F.view.favour?.quiet);
    env.ctx.debug.instantCatch();
    env.tick(2);
  }
  ok(quiet.join() === 'false,false,false,true,true,true', `"gone quiet" from the 4th cast (after 3 catches): ${quiet.join()}`);
  ok(env.ctx.debug.fishPressure().mm_deep_centre === 6, 'six catches counted at the giant spot');
  const lastCaught = [...env.events].reverse().find((x) => x.e === 'fishing:caught');
  ok(lastCaught?.p.pressureKey === 'mm_deep_centre' && lastCaught.p.place === null, `fishing:caught names the pressure key (${lastCaught?.p.pressureKey}) for progression's pressure; place stays null in stopgap water`);
  env.ctx.bus.emit('phase:change', { phase: 'dawn', prev: 'gloomtide' });
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(pressureTerm() === 0 && env.F.view.favour.quiet === false, 'dawn resets pressure');
  const open = makeEnv({ raft: [30, 30] });
  for (let i = 0; i < 4; i++) { open.ctx.debug.forceBite({ speciesId: 'mossback_perch' }); open.ctx.debug.instantCatch(); open.tick(2); }
  ok(Object.keys(open.ctx.debug.fishPressure()).length === 0, 'open water (no place, no giant spot) carries no pressure');
}
section('F13 view.favour: two seeded bites of different species at the same point show the same notches; the roll uses the species’ own μ');
{
  const env = makeEnv({ raft: [30, 30], phase: 'dusk' });
  env.ctx._depth = 0.9;   // the Reedjaw's lower third (0.55–1) but not the Dusk Minnow's band
  env.ctx.debug.forceBite({ speciesId: 'dusk_minnow' });
  const a = { ...env.F.view.favour }, am = env.dbg().mu, aterms = env.dbg().terms.map((t) => t.id);
  env.reset();
  env.ctx.debug.forceBite({ speciesId: 'reedjaw_pike' });
  const b = { ...env.F.view.favour }, bm = env.dbg().mu, bterms = env.dbg().terms.map((t) => t.id);
  ok(a.notches === b.notches && a.mu === b.mu && JSON.stringify(a.terms) === JSON.stringify(b.terms), `float: ${a.mu} (${a.notches}) for both species, terms ${a.terms.map((t) => t.id).join(', ')}`);
  ok(a.terms.some((t) => t.id === 'depthLowerThird') && a.terms.some((t) => t.id === 'dusk'), 'the float carries the pool’s best species term (deep band) and the hour (dusk)');
  ok(!aterms.includes('depthLowerThird') && bterms.includes('depthLowerThird') && bm > am, `the roll: minnow μ ${am} without the deep band, Reedjaw μ ${bm} with it`);
  const notches = [];
  for (const mu of [0.1, 0.3, 0.6, 1.0, 1.4, 1.7]) { env.ctx.debug.setFavour(mu); notches.push(env.F.view.favour.notches); }
  ok(notches.join('') === '012345', `setFavour across the six bands → notches ${notches.join('')}`);
}
section('F4 bite tells per class (readable with sound off) and the bite payload');
{
  const env = makeEnv({ raft: [4, 14.8] });   // giant water, so a forced Elder is legal anyway
  const want = { '-1': 'doublePop', 0.4: 'plunge', 1.4: 'dragUnder', 2.2: 'flatSlide', 2.95: 'dome' };
  for (const [zs, tell] of Object.entries(want)) {
    env.calls.bobber.length = 0;
    const mark = env.events.length;
    env.ctx.debug.forceBite({ speciesId: 'reedjaw_pike', z: Number(zs), wait: 1.5 });
    let guard = 0;
    while (env.F.state === 'waiting' && guard++ < 200) env.tick(1);
    const ev = env.events.slice(mark);
    const tellEv = ev.find((x) => x.e === 'fishing:tell'), biteEv = ev.find((x) => x.e === 'fishing:bite');
    const cls = D.sizeClassOf(Number(zs));
    ok(tellEv?.p.biteTell === tell && biteEv?.p.biteTell === tell && biteEv?.p.sizeClass === cls && env.F.view.biteTell === tell, `z ${zs} (${cls}): tell ${tellEv?.p.biteTell}, bite {${biteEv?.p.sizeClass}, ${biteEv?.p.biteTell}}`);
    const last = env.calls.bobber.slice(-24).filter((b) => b.visible && b.state !== 'bite');
    const ys = last.map((b) => b.y), xs = last.map((b) => Math.hypot(b.x - 4, b.z - 6));
    const minY = Math.min(...ys), maxY = Math.max(...ys), moved = Math.max(...xs) - Math.min(...xs);
    if (tell === 'doublePop') ok(last.filter((b) => b.state === 'nibble').length >= 2 && minY < -0.05, 'Small: two quick pops under');
    if (tell === 'dragUnder') ok(minY < -0.15 && moved > 0.1, `Prize: a slow drag under (y ${minY.toFixed(2)}, ${moved.toFixed(2)} m)`);
    if (tell === 'flatSlide') ok(minY >= -0.05 && moved > 0.3, `Trophy: lies flat and slides (${moved.toFixed(2)} m)`);
    if (tell === 'dome') ok(maxY > 0.1, `Elder: the water domes up (y ${maxY.toFixed(2)})`);
    if (tell === 'plunge') ok(maxY <= 0.001 && moved < 0.01, 'Keeper: the classic plunge, no pre-tell');
    env.reset();
  }
}
section('F4 let it pass: a lapsed bite refunds the bait and banks +0.15 favour for the next cast within 6 m (cap 0.3, reset on a hook or after 60 s)');
{
  const env = makeEnv({ raft: [30, 30] });
  const lp = () => (env.F.view.favour?.terms || []).find((t) => t.id === 'letItPass')?.value ?? 0;
  const lapse = () => { env.ctx.debug.forceBite({ speciesId: 'mossback_perch' }); for (let i = 0; i < 80 && env.F.state === 'bite'; i++) env.tick(1); };
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(lp() === 0, 'first cast: no let-it-pass favour');
  env.reset();
  lapse();
  const miss = [...env.events].reverse().find((x) => x.e === 'fishing:miss');
  ok(miss?.p.reason === 'passed' && env.calls.refund.length === 1 && env.calls.refund[0] === 'mireworm', `lapsed bite: fishing:miss ${miss?.p.reason}, refundBait(${env.calls.refund[0]})`);
  env.tick(30);
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(near(lp(), 0.15, 1e-9), `the next cast in the same water: +${lp()}`);
  for (let i = 0; i < 80 && env.F.state === 'bite'; i++) env.tick(1);
  env.tick(30);
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(near(lp(), 0.3, 1e-9), `a second lapse: +${lp()}`);
  for (let i = 0; i < 80 && env.F.state === 'bite'; i++) env.tick(1);
  env.tick(30);
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(near(lp(), 0.3, 1e-9), `a third lapse stays capped: +${lp()}`);
  env.F.onPointerDown();   // hook it
  ok(env.F.state === 'reeling', 'hooked');
  env.reset(); env.tick(30);
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(lp() === 0, 'a hook resets let it pass');
  env.reset();
  lapse(); env.tick(30);
  env.ctx.player.position.set(45, 0, 30);   // the next cast lands 15 m away
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(lp() === 0, 'a cast more than 6 m away gets nothing');
  env.reset();
  env.ctx.player.position.set(30, 0, 30);
  env.tick(Math.ceil(61 * 30 / 2), 1 / 15);  // 61 s later
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(lp() === 0, 'after 60 s the bank is gone');
  const tap = makeEnv({ raft: [30, 30] });
  tap.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  tap.tick(12); tap.F.onPointerDown();
  ok(tap.F.state === 'reeling' && tap.calls.refund.length === 0 && !tap.events.some((x) => x.e === 'fishing:miss'), 'a tap inside the window hooks: no pass, no refund');
  const legend = makeEnv({ raft: [30, 30] });
  legend.run.equippedBait = 'heartmoss'; legend.run.bait.heartmoss = 1;
  legend.ctx.progression.consumeBait = () => null;   // legend baits are spent on the hook, never at the cast
  legend.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  for (let i = 0; i < 80 && legend.F.state === 'bite'; i++) legend.tick(1);
  ok(legend.calls.refund.length === 0, 'a legend bait is never refunded');
}
section('F7 Night Rise: every night cast carries favour +0.25 in each mode');
for (const mode of ['still', 'lantern', 'gloomtide']) {
  const env = makeEnv({ mode, phase: 'gloomtide' });
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  const fl = (env.F.view.favour?.terms || []).find((t) => t.id === 'nightRise'), roll = env.dbg().terms.find((t) => t.id === 'nightRise');
  ok(fl?.value === 0.25 && roll?.value === 0.25, `${mode}: float and roll carry Night Rise +0.25`);
}
section('F7 the hard rule: in Still and Lantern slams never snap and combat displacement never breaks the line; Gloomtide unchanged');
for (const mode of ['still', 'lantern', 'gloomtide']) {
  const env = makeEnv({ mode, phase: 'gloomtide' });
  env.ctx.debug.fishHook('reedjaw_pike', { z: 1.0 });
  const mark = env.events.length;
  env.F.slam(); env.tick(12); env.F.cancel('snap'); env.tick(1);
  const safe = mode !== 'gloomtide';
  const snapped = env.events.slice(mark).some((x) => x.e === 'fishing:escaped' && x.p.reason === 'snap');
  ok(safe ? env.F.state === 'reeling' && !snapped : snapped, `${mode}: a slam during a fight → ${snapped ? 'snapped' : env.F.state}`);
  const w = makeEnv({ mode, phase: 'gloomtide' });
  w.ctx.debug.forceBite({ speciesId: 'mossback_perch', wait: 3 });
  for (let i = 0; i < 20; i++) { w.ctx.player.position.x += 0.8; w.tick(1); }   // a 16 m shove with no paddling
  ok(safe ? w.F.state === 'waiting' && w.F.lineBroken() === false : w.F.state === 'lost', `${mode}: a 16 m shove while waiting → ${w.F.state}`);
  const p = makeEnv({ mode, phase: 'gloomtide' });
  p.ctx.debug.forceBite({ speciesId: 'mossback_perch', wait: 3 });
  p.ctx.input.move.x = 1;
  for (let i = 0; i < 20; i++) { p.ctx.player.position.x += 0.8; p.tick(1); }   // paddling away does break it
  ok(p.F.state === 'lost', `${mode}: paddling 16 m away still reels the line in (${p.F.state})`);
}
section('F1 in game: fishing:caught carries the size');
{
  const env = makeEnv({ raft: [4, 14.8] });
  env.ctx.debug.fishHook('reedjaw_pike', { z: 2.95 });
  env.ctx.debug.instantCatch();
  const c = [...env.events].reverse().find((x) => x.e === 'fishing:caught');
  const L = D.sizeLength(sp('reedjaw_pike'), 2.95);
  ok(c?.p.z === 2.95 && c.p.sizeClass === 'elder' && near(c.p.length, L, 0.06) && near(c.p.weight, D.sizeWeight(sp('reedjaw_pike'), L), 0.01) && Array.isArray(c.p.favours), `caught: z ${c?.p.z}, ${c?.p.sizeClass}, ${c?.p.length} cm, ${c?.p.weight} kg`);
}

section('F1 with §24 places in the build (walking P1): place favour, holdsGiants Elders, fry caps, gated giants wait for the place kit');
{
  const at = (x, z) => [x, z + 8.8];   // forceBite casts 8.8 m up-screen
  const run = (pt, id) => {
    const env = makeEnv({ data: DW, zoneId: 'sporewood', raft: at(...pt) });
    env.ctx.debug.setFavour(1.8);
    let max = -9, eld = 0, d = null;
    for (let i = 0; i < 600; i++) { env.ctx.debug.forceBite({ speciesId: id }); d = env.dbg(); max = Math.max(max, d.z); if (d.sizeClass === 'elder') eld++; env.reset(); }
    env.ctx.debug.setFavour(null);
    env.ctx.debug.forceBite({ speciesId: id });
    const inside = (env.F.view.favour?.terms || []).find((t) => t.family === 'place');
    return { max, eld, place: d.place, key: d.pressureKey, inside: inside?.value ?? 0 };
  };
  const cup = run([27, -30], 'mildew_angler');
  ok(cup.place === 'mothers_cup' && cup.key === 'mothers_cup' && cup.inside === 0.15 && cup.eld > 60, `the Mother's Cup (holdsGiants): place +${cup.inside}, ${cup.eld} Elders / 600 at μ 1.8`);
  const vent = run([-5, -25], 'sporebelly_puffer');
  ok(vent.place === 'puffball_vent' && vent.max <= DW.BALANCE.size.classMaxZ.prize, `the Puffball Vent (fry water): max z ${vent.max.toFixed(3)} ≤ a top Prize`);
  const harp = run([38.3, 29.8], 'velvet_ray');
  ok(harp.place === 'gill_harp' && harp.max <= 2.64 && harp.eld === 0, `the Gill Harp (giants only while it sings, P2): max z ${harp.max.toFixed(3)} ≤ 2.64 until the place kit`);
  ok(!DW.ZONES.find((z) => z.id === 'sporewood').arena.giantSpots && !!DW.ZONES.find((z) => z.id === 'mossmere').arena.giantSpots, 'stopgap giant spots only in lakes without places (the Mossmere in P1)');
}

section('F1 in game: fishing.rollSize — 10,000 seeded rolls per μ in giant water reproduce the §25.7.1 table (±1 point); open water never passes 2.64');
{
  const env = makeEnv({ raft: [30, 30] });
  const CL = ['small', 'keeper', 'prize', 'trophy', 'elder'];
  for (const [muS, want] of Object.entries(TABLE)) {
    const mu = Number(muS), c = [0, 0, 0, 0, 0, 0];
    env.ctx.debug.fishSeed(1000 + Math.round(mu * 10));   // the pure test's seed: the game must draw the very same sizes
    const pure = mul(1000 + Math.round(mu * 10));
    let same = true;
    for (let i = 0; i < 10000; i++) {
      const z = env.F.rollSize('reedjaw_pike', mu, { giant: true }), zp = rollZ(mu, pure, { min: SZ.z.min, max: SZ.z.max, sd: SZ.z.sd });
      if (z !== zp) same = false;
      const k = CL.indexOf(D.sizeClassOf(z)); c[k]++; if (k === 4 && D.isAncient(z)) c[5]++;
    }
    const got = c.map((v) => v / 100);
    ok(same && got.every((g, i) => Math.abs(g - want[i]) <= 1 + 1e-9), `in game, μ ${mu}: ${got.map((g) => g.toFixed(1)).join(' / ')} ≈ ${want.join(' / ')} (the same draws as the pure roll: ${same})`);
  }
  let max = -9;
  for (let i = 0; i < 10000; i++) max = Math.max(max, env.F.rollSize('reedjaw_pike', 1.8, { giant: false }));
  ok(max <= 2.64, `in game, open water at μ 1.8: max z ${max.toFixed(3)} ≤ 2.64`);
  const fav = env.F.favourAt({ x: 4, z: 6 }), favSp = env.F.favourAt({ x: 4, z: 6 }, 'reedjaw_pike');
  ok(fav && favSp && Number.isFinite(fav.mu) && Array.isArray(fav.terms) && Number.isFinite(favSp.mu), `favourAt(point) ${fav?.mu} / favourAt(point, species) ${favSp?.mu}`);
}
section('F13 the float follows the hour while the bobber waits (refreshed twice a second)');
{
  const env = makeEnv({ raft: [30, 30], phase: 'calm' });
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch', wait: 4 });
  const a = { ...env.F.view.favour };
  env.setPhase('dusk'); env.tick(20);
  const b = { ...env.F.view.favour };
  ok(!a.terms.some((t) => t.id === 'dusk') && b.terms.some((t) => t.id === 'dusk') && near(b.mu - a.mu, 0.2, 1e-9) && env.F.state === 'waiting',
    `calm μ ${a.mu} → dusk μ ${b.mu} on the same waiting float`);
}
section('F13 the float is cleared once the fish is on; the bite tell too');
{
  const env = makeEnv({ raft: [30, 30] });
  env.ctx.debug.forceBite({ speciesId: 'reedjaw_pike', z: 1.4 });
  const before = { f: !!env.F.view.favour, t: env.F.view.biteTell };
  env.F.onPointerDown();
  ok(before.f && before.t === 'dragUnder' && env.F.state === 'reeling' && env.F.view.favour === null && env.F.view.biteTell === null,
    `bite: favour ${before.f}, tell ${before.t} → hooked: favour ${env.F.view.favour}, tell ${env.F.view.biteTell}`);
  ok(env.dbg().terms.length > 0, 'the rolled favours stay for the catch payload');
}
section('F7 the hard rule vs the player’s knock check: in Still / Lantern a cancel(\'moved\') with no paddling keeps the waiting line');
for (const mode of ['still', 'lantern', 'gloomtide']) {
  const safe = mode !== 'gloomtide';
  const env = makeEnv({ mode, phase: 'gloomtide' });
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch', wait: 3 });
  for (let i = 0; i < 4; i++) { env.ctx.player.position.x += 0.5; env.tick(1); }   // knocked 2 m
  env.F.cancel('moved');                                                            // player.js: a knock dragged the raft from the bobber
  ok(safe ? env.F.state === 'waiting' : env.F.state === 'lost', `${mode}: a knock then cancel('moved') → ${env.F.state}`);
  const p = makeEnv({ mode, phase: 'gloomtide' });
  p.ctx.debug.forceBite({ speciesId: 'mossback_perch', wait: 3 });
  p.ctx.input.move.x = 1; p.F.cancel('moved');
  ok(p.F.state === 'lost', `${mode}: paddling reels the line in as today (${p.F.state})`);
}
section('F7 the First Outing is all still (slams never snap); The Long Descent keeps Gloomtide’s slams');
{
  const first = makeEnv({ mode: 'gloomtide', outing: 'first', phase: 'gloomtide' });
  first.ctx.debug.fishHook('reedjaw_pike', { z: 1.0 });
  first.F.slam(); first.tick(2);
  ok(first.F.state === 'reeling', `First Outing: a slam → ${first.F.state}`);
  const desc = makeEnv({ mode: 'gloomtide', outing: 'descent', phase: 'gloomtide' });
  desc.ctx.debug.fishHook('reedjaw_pike', { z: 1.0 });
  desc.F.slam(); desc.tick(2);
  ok(desc.F.state === 'lost', `The Long Descent: a slam → ${desc.F.state}`);
}
section('F7 legend quiet: in Still / Lantern the Lantern-Swallower’s Grasping Dark is two telegraphed snags (1 s, +0.2 tension), no hands; Gloomtide spawns its hands');
for (const mode of ['still', 'lantern', 'gloomtide']) {
  const env = makeEnv({ mode, phase: 'gloomtide', zoneId: 'paleabyss', raft: [0, -30] });
  const spawned = [], snags = [], spikes = [];
  env.ctx.combat = { spawnEnemy: (id) => { spawned.push(id); return { id }; } };
  env.ctx.bus.on('fishing:snag', (p) => snags.push({ ...p, t: env.ctx.debug.fishReel()?.time ?? null }));
  env.ctx.debug.fishHook('lantern_swallower');
  const reel = env.ctx.debug.fishReel();
  const spike0 = reel.spike; reel.spike = (d) => { spikes.push(d); return spike0(d); };
  reel.P = Math.max(reel.P, 0.26);   // into Grasping Dark (at 0.25)
  for (let i = 0; i < 30 * 8 && env.F.state === 'reeling'; i++) { if (reel.T > 0.55) env.F.onPointerUp(); else env.F.onPointerDown(); env.tick(1); }
  if (mode !== 'gloomtide') {
    const w = snags.filter((x) => x.state === 'warn'), h = snags.filter((x) => x.state === 'hit');
    ok(spawned.length === 0 && w.length === 2 && h.length === 2 && spikes.length === 2 && spikes.every((d) => near(d, 0.2, 1e-9)), `${mode}: ${w.length} warnings, ${h.length} snags (+${spikes.join(', +')}), ${spawned.length} hands`);
    ok(near(h[0].t - w[0].t, 1, 0.05) && near(h[1].t - w[1].t, 1, 0.05), `${mode}: each snag lands 1 s after its warning (${(h[0].t - w[0].t).toFixed(2)} s, ${(h[1].t - w[1].t).toFixed(2)} s)`);
  } else ok(spawned.length === 2 && snags.length === 0, `gloomtide: ${spawned.length} hands (${spawned.join(', ')}), no snags`);
  ok(env.F.state === 'reeling', `${mode}: the legend fight goes on (${env.F.state})`);
}
{
  const env = makeEnv({ mode: 'lantern' });
  ok(env.F.snag() === false, 'fishing.snag() with nothing hooked does nothing');
}

// =================================================================== flag off: today's behaviour
section('flag off: no size, no favour, weights from the v1 roll, slams snap, v1 payloads');
{
  const env = makeEnv({ data: dataV1, mode: 'lantern' });
  env.ctx.debug.forceBite();
  const d = env.dbg();
  const s = sp(d.species, dataV1);
  ok(d.v3 === false && d.z === null && env.F.view.favour === null && d.weight >= s.weight[0] && d.weight <= s.weight[1], `v1 bite: ${d.species} ${d.weight} kg, no z, no favour`);
  const bite = [...env.events].reverse().find((x) => x.e === 'fishing:bite');
  ok(Object.keys(bite.p).join() === 'speciesId', 'fishing:bite payload is v1’s');
  env.F.onPointerDown();
  const hk = [...env.events].reverse().find((x) => x.e === 'fishing:hook');
  ok(!('pips' in hk.p) && env.F.view.pips === null, 'no pips');
  if (env.F.state === 'reeling' && d.species && sp(d.species, dataV1).rarity !== 'legendary') { env.tick(12); env.F.slam(); env.tick(1); ok(env.F.state === 'lost', 'a slam snaps the line (no night modes in v1)'); }
  env.reset();
  env.ctx.debug.forceBite(); env.ctx.debug.instantCatch(); env.tick(1);
  const c = [...env.events].reverse().find((x) => x.e === 'fishing:caught');
  ok(c && !('z' in c.p) && !('favours' in c.p), 'fishing:caught carries no v3 fields');
}

console.log(`\nfishing-v3: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
