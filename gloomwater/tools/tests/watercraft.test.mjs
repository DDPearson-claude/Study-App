// tools/tests/watercraft.test.mjs — the Mossmere's watercraft (docs/loop/WATERCRAFT.md rev. 2 §2–§4, §9.2's gate (a)–(g)): the areas on
// authored points, the baked shares and factors against a recompute, the fit (the areas add nothing before the hook), the user's rule
// over every pool and cast type castOdds can be asked for (every grade-0 fish ≤ 1.00% of the whole cast), the tipped lure, pre-rolls and
// the comeback, Cut Strip and the hunters, bitesTable and gradeTargets. (T104 extended, the game's pool against the sim's, is a printed
// check of tools/sim/clams.mjs; the game's own draw through fishing.js is loop-watercraft.test.mjs's.)
//   node tools/tests/watercraft.test.mjs           (or node tools/check.mjs)
//   node tools/tests/watercraft.test.mjs --bake    print the shares and factors block for src/watercraft.js
import { loadLoopData } from './loop-fixture.mjs';
import * as WL from '../../src/world-layout.js';
import * as WC from '../../src/watercraft.js';

const D = await loadLoopData({ query: 'watercraft' });
const BAKE = process.argv.includes('--bake');
let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);
const rng = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const pc = (v) => `${(v * 100).toFixed(2)}%`;

const M = WC.WATERCRAFT.mossmere, A = D.ZONES[0].arena;
const L = WL.buildLayout(D.ZONES[0]);
const probe = { depth: (x, z) => WL.depthAt(L, x, z), fromShore: (x, z) => L.shoreR(Math.atan2(z, x)) - Math.hypot(x, z) };
const hulls = D.loopMooring('mossmere', L.docks).circles;
const docks = L.docks.map((d) => ({ x: d.x, z: d.z, yaw: d.yaw }));
const inPlace = (x, z) => !!D.placeAtV3('mossmere', x, z);
const geo = { arena: A, hulls, docks };

// ---------------------------------------------------------------- --bake: print the block and stop
if (BAKE) {
  const shares = WC.areaShares(probe, { ...geo, inPlace });
  const factors = WC.fitFactors(D, shares);
  const line = (o) => `{ ${Object.entries(o).map(([k, v]) => `${k}: ${v}`).join(', ')} }`;
  console.log('    // >>> baked by `node tools/tests/watercraft.test.mjs --bake` (the layout of ZONES[0], data.loopMooring\'s hulls, 100 seeded evenings)');
  console.log('    shares: {');
  for (const l of ['day', 'dusk', 'night']) console.log(`      ${l}: ${line(shares[l])},`);
  console.log('    },');
  console.log('    factors: {');
  for (const l of ['day', 'dusk', 'night']) console.log(`      ${l}: ${line(factors[l])},`);
  console.log('    },');
  console.log('    // <<< baked');
  process.exit(0);
}

const FISH = D.SPECIES.filter((s) => s.zone === 'mossmere').map((s) => s.id);
const SPC = (id) => D.SPECIES_BY_ID[id];
const PLACES = Object.keys(D.LOOP.places);
const PHASES = ['calm', 'dusk', 'gloomtide'];
// the 12 hooks of §8.3 (the bare hook, the three baits, the legend's ball, the four lures, three tipped lures)
const HOOKS = [{}, { bait: 'mireworm' }, { bait: 'lumen_moss' }, { bait: 'cut_strip' }, { bait: 'heartmoss' },
  { lure: 'feather_fly' }, { lure: 'glimmer_spoon' }, { lure: 'bone_jig' }, { lure: 'bell_spinner' },
  { lure: 'glimmer_spoon', bait: 'mireworm' }, { lure: 'feather_fly', bait: 'lumen_moss' }, { lure: 'bone_jig', bait: 'cut_strip' }];
const hookName = (h) => [h.lure, h.bait].filter(Boolean).join('+') || 'bare';
const legendBait = (b) => b === D.LOOP.legendBait.mossmere.id;
/** placePool as fishing.js's loopPool asks it (the legend's ball is a bare hook to the pool). */
const poolAt = (place, phase, bait, wickId = null) => D.placePool(D.SPECIES, { placeId: place, phase, bait: legendBait(bait) ? null : bait, wickId, water: 'mossmere' });
/** The water a cast is: the place (night water before dark is open water), else its area. */
const waters = () => [...WC.AREAS.map((a) => ({ area: a, place: null })), ...PLACES.map((p) => ({ area: null, place: p }))];

// =====================================================================================
section('(a) areaAt on 24 authored points (each ≥ 1.5 m inside its area: its eight neighbours at 1.2 m and 1.5 m the same), the places and the mist');
{
  const lane = WC.laneFor(1);
  const cast = (x, z, owned = PLACES) => { const p = D.placeAtV3('mossmere', x, z); if (p) return owned.includes(p.id) ? p.id : 'mist'; return WC.areaAt(x, z, probe, { ...geo, lane }); };
  const POINTS = [
    [54, 4, 'inflow'], [49.5, 9.5, 'inflow'],
    [0, -43, 'outflow'], [-5.5, -55.5, 'outflow'],
    [-4, -4, 'dropoff'], [-13, -15.5, 'dropoff'], [34.5, 37, 'dropoff'],
    [-26, 34, 'pads'], [-20.5, -50.5, 'pads'], [39.5, 29.5, 'pads'],
    [24, 34.5, 'stones'], [9.5, -5.5, 'stones'], [32, -28, 'stones'],
    [-30, 21.5, 'reeds'], [-33, -18, 'reeds'], [44.5, -35.5, 'reeds'],
    [0, 56, 'margin'], [-53, 4.5, 'margin'],
    [-3, 4.5, 'lane'], [-8, 7, 'lane'],
    [0, 10, 'deep'], [-13, 14.5, 'deep'],
    [7, -38, 'open'], [34.5, 7, 'open'],
  ];
  eq(POINTS.length, 24, 'twenty-four authored open-water points');
  for (const a of WC.AREAS) ok(POINTS.filter((p) => p[2] === a).length >= 2, `two or more points in ${a}`);
  for (const [x, z, want] of POINTS) {
    eq(cast(x, z), want, `(${x}, ${z}) is ${want}`);
    let same = true;
    for (const r of [1.2, 1.5]) for (let k = 0; k < 8; k++) { const t = k * Math.PI / 4; if (cast(x + r * Math.cos(t), z + r * Math.sin(t)) !== want) same = false; }
    ok(same, `(${x}, ${z}): its eight neighbours at 1.2 m and 1.5 m are ${want} too`);
  }
  for (const [x, z, id] of [[-40.5, 24.5, 'lily_maze'], [-30.5, -0.5, 'under_the_span'], [-48, -3, 'buoy_lights'], [-3, -13, 'bell_pool']]) {
    eq(cast(x, z), id, `(${x}, ${z}) owned and lifted is ${id}`);
    eq(cast(x, z, []), 'mist', `(${x}, ${z}) not owned is mist`);
  }
  eq(WC.areaAt(0, 70, probe, geo), null, 'past the shore: not water (null)');
  eq(WC.areaAt(22, -12, probe, geo), null, 'inside the Drowned Gatehouse: not water (null)');
  eq(WC.areaAt(-3, 4.5, probe, { ...geo, lane: null }), 'deep', 'the lane at night (no lane): the point is the deep');
  eq(WC.laneFor(1, 'gloomtide'), null, 'laneFor at night: null');
  eq(WC.laneFor(7), WC.laneFor(7, 'dusk'), 'laneFor is deterministic per evening (by day and dusk the same lane)');
  ok(JSON.stringify(WC.laneFor(7)) !== JSON.stringify(WC.laneFor(8)), 'laneFor: a different line the next evening');
  const span = D.loopPlace('under_the_span').area.pts, spanPts = [0, 1 / 3, 2 / 3, 1].map((t) => [span[0][0] + (span[1][0] - span[0][0]) * t, span[0][1] + (span[1][1] - span[0][1]) * t]);
  const avoid = [...A.islands.map((o) => [o.x, o.z, o.r + 7]), [-4, -14, 14], ...A.pillars.map((p) => [p.x, p.z, +(p.r + 5).toFixed(1)]), ...spanPts.map(([x, z]) => [+x.toFixed(1), +z.toFixed(1), 6])];
  eq(M.laneAvoid.map((c) => c.map((v) => +v.toFixed(1))), avoid, 'laneAvoid is ZONES[0].arena\'s islands (r + 7), the Bell Pool and rim (14 m), the pillars (r + 5) and Under the Span\'s channel');
  let laneOk = true; const lanes = {};
  for (let e = 1; e <= 500; e++) {
    const l = WC.laneFor(e), a = D.placeAtV3('mossmere', l.x, l.z)?.id || WC.areaAt(l.x, l.z, probe, geo);
    lanes[a] = (lanes[a] || 0) + 1;
    if (Math.hypot(l.x - 0, l.z + 5) > 25.01 && !(l.x === M.laneFallback.x && l.z === M.laneFallback.z)) laneOk = false;
    if (a !== 'deep' && a !== 'open') laneOk = false;
  }
  ok(laneOk, `laneFor over 500 evenings: each centre within 25 m of (0, −5) and in deep or open water (${JSON.stringify(lanes)})`);
  // §2.2's geometry block, verbatim
  eq(M.geometry.reedArcs, [[100, 112], [120, 135], [232, 244], [318, 332]], 'revision 2\'s reed arcs');
  eq(M.geometry.beds, [{ x: -26, z: 34, r: 5 }, { x: 40, z: 28, r: 5 }, { x: -20, z: -50, r: 4.5 }, { x: -6, z: 52, r: 4.5 }], 'revision 2\'s lily beds');
  ok(WL.depthAt(L, 54, 4) > 0 && probe.fromShore(54, 4) > 0, 'the inflow\'s centre is water');
}

// =====================================================================================
section('(a) the baked shares: they sum to 1, match §2.1 within ±3 points and a recompute within ±0.2');
const SHARES = WC.areaShares(probe, { ...geo, inPlace });
{
  const DOC = { margin: 23.7, reeds: 5.8, pads: 2.9, stones: 11.7, dropoff: 10.7, lane: 1.2, open: 21.0, deep: 18.1, inflow: 1.8, outflow: 3.2 };
  for (const l of ['day', 'dusk', 'night']) {
    const s = M.shares[l], sum = WC.AREAS.reduce((a, k) => a + s[k], 0);
    ok(Math.abs(sum - 1) < 1e-3, `${l}: the baked shares sum to 1 (${sum.toFixed(4)})`);
    for (const a of WC.AREAS) {
      ok(Math.abs(s[a] - SHARES[l][a]) * 100 <= 0.2, `${l} ${a}: baked ${pc(s[a])} = the recompute ${pc(SHARES[l][a])} within ±0.2`);
      const doc = l === 'night' && a === 'lane' ? 0 : DOC[a];
      if (l !== 'night' || !['lane', 'open', 'deep'].includes(a)) ok(Math.abs(s[a] * 100 - doc) <= 3, `${l} ${a}: ${pc(s[a])} within ±3 of §2.1's ${doc}%`);
    }
  }
  eq(M.shares.night.lane, 0, 'no lane at night');
}

// =====================================================================================
section('(b) the fit: before the hook the blind caster\'s mix is the built mix × the hour tilt within ±0.5 points (every fish and phase); factors baked = recompute');
{
  const F = WC.fitFactors(D, M.shares);
  for (const l of ['day', 'dusk', 'night']) {
    const b = WC.blindMix(D, M.shares, l), t = WC.tiltedTarget(D, l);
    let worst = 0, at = '';
    for (const id of Object.keys(t)) { const d = Math.abs((b[id] || 0) - t[id]) * 100; if (d > worst) { worst = d; at = id; } }
    ok(worst <= 0.5, `${l}: the blind pre-hook mix is the tilted target within ±0.5 points (worst ${worst.toFixed(3)} on ${at})`);
    let fw = 0;
    for (const id of Object.keys(F[l])) fw = Math.max(fw, Math.abs(F[l][id] - (M.factors[l][id] ?? NaN)) / F[l][id]);
    ok(fw < 0.01, `${l}: the baked factors are the recompute's within 1% (worst ${(fw * 100).toFixed(2)}%)`);
  }
}

// =====================================================================================
section('(c) the user\'s rule: every grade-0 fish ≤ 1.00% of the whole cast, from castOdds, over §8.3\'s whole list; S > 0 everywhere');
{
  let n = 0, worst = 0, worstAt = '', minS = Infinity, minSAt = '', bad = [];
  const tellRules = [null, ...Object.entries(M.tells).flatMap(([kind, T]) => {
    if (T.retired || T.noRule) return [];
    const forms = T.forms ? Object.entries(T.forms) : [[null, T]];
    return forms.map(([form, f]) => {
      const mk = Array.isArray(f.makers) ? f.makers : [...new Set(Object.values(f.makers || {}).flat())];
      return { kind, form, id: 1, inSign: true, makers: mk, tilt: 3 };
    });
  }), { kind: 'nervous', id: 2, inSign: true, predators: 3 }, { kind: 'bubbles', id: 3, inSign: true, bottom: 2 }];
  const strays = (h) => FISH.filter((id) => WC.gradeOf(id, h) === 0);
  for (const { area, place } of waters()) for (const phase of PHASES) for (const h of HOOKS) for (const wickId of [null, 'taper']) {
    const pool = poolAt(place, phase, h.bait ?? null, wickId);
    const ar = pool.place ? null : (area ?? 'open');   // night water before dark is open water: its geometric area (here: open)
    for (const taperFirst of wickId ? [false, true] : [false]) for (const rb of [0, 0.5]) for (const rule of tellRules) {
      const base = { pool, area: ar, phase, lure: h.lure ?? null, bait: h.bait ?? null, wickId, rb, rule, taperFirst };
      const odds = WC.castOdds(D, base);
      n++;
      if (odds.S < minS) { minS = odds.S; minSAt = `${place ?? area} ${phase} ${hookName(h)}`; }
      const sum = odds.entries.reduce((a, e) => a + e.p, 0);
      if (Math.abs(sum - 1) > 1e-9) bad.push(`${place ?? area} ${phase} ${hookName(h)}: p sums to ${sum}`);
      for (const id of strays(h)) {
        const p = WC.castShare(odds, id);
        if (p > worst) { worst = p; worstAt = `${SPC(id)?.name} at ${place ?? area}, ${phase}, ${hookName(h)}${wickId ? ', Taper' : ''}${taperFirst ? ' (first bite)' : ''}, rb ${rb}${rule ? `, ${rule.kind}${rule.form ? ' ' + rule.form : ''}` : ''}`; }
        if (p > 0.01 + 1e-12) bad.push(`${id} ${pc(p)} at ${place ?? area} ${phase} ${hookName(h)}`);
      }
      // each pre-roll source with each fish (the ones a sign or a silhouette can carry), once per pool (no tell, rb 0)
      if (rule === null && rb === 0) for (const src of [WC.WATERCRAFT.mossmere.take.rise, WC.WATERCRAFT.mossmere.take.swirl, WC.WATERCRAFT.mossmere.take.sight]) {
        for (const [sp] of pool.list) {
          const o2 = WC.castOdds(D, { ...base, preroll: { sp, z: 0.5, base: src } });
          for (const id of strays(h)) { const p = WC.castShare(o2, id); if (p > worst) { worst = p; worstAt = `${SPC(id)?.name} pre-rolled (${src}) at ${place ?? area}, ${phase}, ${hookName(h)}`; } if (p > 0.01 + 1e-12) bad.push(`pre-rolled ${id} ${pc(p)}`); }
          n++;
        }
        for (const id of strays(h)) {   // the comeback of each stray: it waits, and the cast still keeps the stray ≤ 1%
          const o3 = WC.castOdds(D, { ...base, comeback: { sp: SPC(id), z: 0.4 } });
          if (!o3.waited || o3.entries.some((e) => e.from === 'comeback')) bad.push(`comeback ${id} did not wait on ${hookName(h)}`);
          const p = WC.castShare(o3, id); if (p > 0.01 + 1e-12) bad.push(`comeback stray ${id} ${pc(p)}`);
          n++;
        }
      }
    }
  }
  console.log(`    ${n} casts; worst stray ${pc(worst)} (${worstAt}); smallest S ${minS.toFixed(2)} (${minSAt})`);
  ok(!bad.length, `${n} casts: every grade-0 fish ≤ 1.00% (worst ${pc(worst)}: ${worstAt})${bad.length ? ' — ' + bad.slice(0, 4).join('; ') : ''}`);
  ok(minS > 0, `every pool has a taker: S > 0 (smallest ${minS.toFixed(2)} at ${minSAt})`);
  // the named cases
  const allPools = (h, ids) => {
    let w = 0;
    for (const { area, place } of waters()) for (const phase of PHASES) { const pool = poolAt(place, phase, h.bait ?? null); const o = WC.castOdds(D, { pool, area: pool.place ? null : area ?? 'open', phase, lure: h.lure ?? null, bait: h.bait ?? null }); for (const id of ids) w = Math.max(w, WC.castShare(o, id)); }
    return w;
  };
  ok(allPools({ bait: 'mireworm' }, ['reedjaw_pike', 'thousandcast_pike', 'hullkiss_lamprey']) <= 0.01, `a worm everywhere leaves the Reedjaw Pike, the Thousandcast Pike and the Hullkiss Lamprey ≤ 1% (${pc(allPools({ bait: 'mireworm' }, ['reedjaw_pike', 'thousandcast_pike', 'hullkiss_lamprey']))})`);
  ok(allPools({}, WC.HUNTERS) <= 0.01, `a bare hook leaves the five hunters ≤ 1% (${pc(allPools({}, WC.HUNTERS))})`);
  ok(allPools({ lure: 'glimmer_spoon' }, ['weeping_carp', 'candlefin_koi', 'gutter_crayfish', 'rustfin_sucker', 'dusk_minnow']) <= 0.01, 'a spoon leaves the carp, the koi, the crayfish, the sucker and the minnow ≤ 1%');
  for (const id of WC.HUNTERS) eq(WC.gradeOf(id, {}), 0, `the bare hook is 0 for ${id}`);
  for (const id of ['reedjaw_pike', 'thousandcast_pike', 'hullkiss_lamprey']) eq(WC.gradeOf(id, { bait: 'mireworm' }), 0, `a worm is 0 for ${id}`);
  eq(WC.gradeOf('kissmark_trout', { lure: 'feather_fly' }), 2, 'revision 2: the trout takes the fly at 2');
  eq([WC.gradeOf('reedjaw_pike', { lure: 'bone_jig' }), WC.gradeOf('thousandcast_pike', { lure: 'bone_jig' })], [2, 2], 'revision 2: both pikes take the jig at 2');
  eq(WC.gradeOf('likely_chub', { bait: 'cut_strip' }), 2, 'revision 2: the chub takes Cut Strip at 2');
  eq(WC.gradeOf('belled_matriarch', { bait: 'heartmoss' }), null, 'the legend is outside the table (null)');
  eq(WC.gradeOf('gloam_eel', {}), null, 'the eel\'s bare cell is null');
  eq(WC.gradeOf('sporewood_fish', {}), undefined, 'a species with no row: undefined (the built family rule)');
  eq(WC.gradeOf('weeping_carp', { bait: 'heartmoss' }), WC.gradeOf('weeping_carp', {}), 'the Heartmoss Ball is a bare hook to every fish but her');
  for (const id of FISH) ok(id in M.hook.table, `the hook table has ${id}`);
}

// =====================================================================================
section('(d) one thing on the hook: a lure reads its own column alone (no tipping; the user, 17 Nov 2026)');
{
  const ids = ['mossback_perch', 'overbold_bass', 'likely_chub', 'reedjaw_pike', 'weeping_carp', 'dusk_minnow', 'candlefin_koi', 'milkeye_perch', 'kissmark_trout'];
  for (const [lure, bait] of [['glimmer_spoon', 'mireworm'], ['feather_fly', 'lumen_moss'], ['bone_jig', 'cut_strip']]) {
    eq(ids.map((id) => WC.gradeOf(id, { lure, bait })), ids.map((id) => WC.gradeOf(id, { lure })), `${lure} + ${bait}: the lure's grades alone (no tipped step)`);
  }
  eq(WC.gradeOf('weeping_carp', { lure: 'glimmer_spoon', bait: 'lumen_moss' }), 0, 'a lure\'s 0 stays 0 whatever the bait');
}

// =====================================================================================
section('(e) pre-rolls: a stray\'s whole cast is exactly 1%; takeChance never puts a taker below its base; the draw agrees with castOdds');
{
  eq([1, 2, 3].map((g) => WC.takeChance(1, g)), [1, 1, 1], 'a rise\'s fish takes 1 at grades 1–3');
  eq([0, 1, 2, 3].map((g) => +WC.takeChance(0.45, g).toFixed(4)), [0.01, 0.45, 0.55, 0.65], 'a silhouette: 1% / 45% / 55% / 65%');
  eq([0, 1, 2, 3].map((g) => +WC.takeChance(0.6, g).toFixed(4)), [0.01, 0.6, 0.7, 0.8], 'a swirl: 1% / 60% / 70% / 80%');
  eq(WC.takeChance(0.85, 3), 0.9, 'never above 0.9 (but never below the base)');
  for (const base of [1, 0.6, 0.45]) {
    const pool = poolAt(null, 'dusk', 'mireworm');
    const o = WC.castOdds(D, { pool, area: 'reeds', phase: 'dusk', bait: 'mireworm', preroll: { sp: SPC('reedjaw_pike'), z: 1.2, base } });
    ok(Math.abs(WC.castShare(o, 'reedjaw_pike') - 0.01) < 1e-12, `a pike pre-rolled (base ${base}) on worms: its whole cast is exactly 1% (${pc(WC.castShare(o, 'reedjaw_pike'))})`);
  }
  const pool = poolAt(null, 'dusk', 'cut_strip');
  const o = WC.castOdds(D, { pool, area: 'reeds', phase: 'dusk', bait: 'cut_strip', rb: 0.2, preroll: { sp: SPC('reedjaw_pike'), z: 1.2, base: 0.45 } });
  const pre = o.entries.find((e) => e.from === 'preroll');
  ok(pre && Math.abs(pre.p - 0.65) < 1e-12, 'a pike silhouette led on Cut Strip takes 65%');
  ok(WC.castShare(o, 'reedjaw_pike') > 0.65, 'and if it turns away the pool behind it may still bring a pike (it takes the hook)');
  const r = rng(2), N = 20000, got = {};
  for (let i = 0; i < N; i++) { const e = WC.drawOdds(o, r()); const k = `${e.from}:${e.sp.id}`; got[k] = (got[k] || 0) + 1; }
  let worst = 0;
  for (const e of o.entries) { const k = `${e.from}:${e.sp.id}`; worst = Math.max(worst, Math.abs((got[k] || 0) / N - e.p) * 100); }
  ok(worst <= 0.3, `20,000 seeded draws agree with castOdds within ±0.3 points (worst ${worst.toFixed(2)})`);
  // the eel pre-rolled on a hook without its bait never takes (the bait-only gate)
  const np = poolAt('buoy_lights', 'gloomtide', 'mireworm');
  const oe = WC.castOdds(D, { pool: np, phase: 'gloomtide', bait: 'mireworm', preroll: { sp: SPC('gloam_eel'), z: 0, base: 1 } });
  eq(WC.castShare(oe, 'gloam_eel'), 0, 'the Gloam Eel pre-rolled on worms never takes (its bait does not fit)');
  // Taper's first bite refuses a pre-rolled common
  const tp = poolAt(null, 'dusk', null, 'taper');
  const ot = WC.castOdds(D, { pool: tp, area: 'margin', phase: 'dusk', wickId: 'taper', taperFirst: true, preroll: { sp: SPC('dusk_minnow'), z: 0, base: 1 } });
  ok(ot.taper && WC.castShare(ot, 'dusk_minnow') <= 0.01 + 1e-12, `Taper's first bite: a pre-rolled common does not take, the commons zeroed (the minnow ${pc(WC.castShare(ot, 'dusk_minnow'))})`);
}

// =====================================================================================
section('(f) the comeback: it waits on a stray, comes on the next cast whose hook it takes, and is never also marked');
{
  const cb = { sp: SPC('reedjaw_pike'), z: 1.1 };
  const p1 = poolAt(null, 'dusk', 'mireworm');
  const o1 = WC.castOdds(D, { pool: p1, area: 'reeds', phase: 'dusk', bait: 'mireworm', comeback: cb });
  ok(o1.waited && !o1.entries.some((e) => e.from === 'comeback') && WC.castShare(o1, 'reedjaw_pike') <= 0.01, 'on worms the pike\'s comeback waits (no comeback entry; the pike ≤ 1%)');
  const p2 = poolAt(null, 'dusk', 'cut_strip');
  const o2 = WC.castOdds(D, { pool: p2, area: 'reeds', phase: 'dusk', bait: 'cut_strip', comeback: cb });
  ok(!o2.waited && o2.entries.length === 1 && o2.entries[0].from === 'comeback' && o2.entries[0].p === 1 && o2.entries[0].z === 1.1, 'on Cut Strip it comes: the whole cast is that fish, its z kept');
  ok(!o2.taper, 'a comeback never serves Taper\'s first bite (it is never also marked)');
  const o3 = WC.castOdds(D, { pool: p2, area: 'reeds', phase: 'dusk', bait: 'cut_strip', comeback: cb, preroll: { sp: SPC('overbold_bass'), z: 0, base: 1 } });
  ok(o3.entries.length === 1 && o3.entries[0].from === 'comeback', 'the comeback comes before a pre-rolled fish (§4 step 1)');
}

// =====================================================================================
section('(g) Cut Strip brings each hunter (each ≥ 2% somewhere it lives); every fish can be caught (the bare hook, Cut Strip or an M1 item)');
{
  for (const id of WC.HUNTERS) {
    let best = 0, at = '';
    for (const { area, place } of waters()) for (const phase of PHASES) {
      const pool = poolAt(place, phase, 'cut_strip');
      const o = WC.castOdds(D, { pool, area: pool.place ? null : area ?? 'open', phase, bait: 'cut_strip' });
      const p = WC.castShare(o, id); if (p > best) { best = p; at = `${place ?? area}, ${phase}`; }
    }
    ok(best >= 0.02, `Cut Strip brings ${SPC(id).name}: ${pc(best)} at ${at}`);
  }
  for (const id of FISH) {
    if (id === 'belled_matriarch') continue;
    ok(HOOKS.some((h) => WC.gradeOf(id, h) >= 1), `${SPC(id).name} takes at least one hook the player can fit`);
  }
}

// =====================================================================================
section('bitesTable, gradeTargets, hookWeights\' who-is-there, lightOf');
{
  const t = WC.bitesTable(D, { bait: 'mireworm' }), pike = t.find((r) => r.id === 'reedjaw_pike');
  ok(pike && pike.share < 0.01 && pike.bare < 0.01, `Who bites on worms: the pike "<1%" (${pc(pike?.share ?? 0)}), and on the bare hook (${pc(pike?.bare ?? 0)})`);
  const sum = t.reduce((a, r) => a + r.share, 0), sumB = t.reduce((a, r) => a + r.bare, 0);
  ok(Math.abs(sum - 1) < 1e-9 && Math.abs(sumB - 1) < 1e-9, 'its shares and the bare hook\'s each sum to 1');
  ok(t[0].share >= t[t.length - 1].share, 'largest first');
  const ts = WC.bitesTable(D, { lure: 'glimmer_spoon' });
  ok(['weeping_carp', 'candlefin_koi', 'gutter_crayfish'].every((id) => (ts.find((r) => r.id === id)?.share ?? 0) < 0.01), 'on the spoon the carp, the koi and the crayfish "<1%"');
  eq(WC.gradeTargets('bone_jig'), ['mossback_perch', 'overbold_bass', 'milkeye_perch', 'kissmark_trout', 'reedjaw_pike', 'thousandcast_pike'], 'the Bone Jig helps the perch, bass, zander, trout and both pikes');
  eq(WC.gradeTargets('bell_spinner', D), D.LOOP.lures.bell_spinner.giants, 'the Spinner keeps LANE 4\'s named list');
  eq(WC.gradeTargets('bell_spinner'), M.hook.spinner, 'the Spinner without D: the copy of that list');
  eq(M.hook.spinner, D.LOOP.lures.bell_spinner.giants, 'the copy is LOOP.lures.bell_spinner.giants');
  const pool = poolAt(null, 'dusk', null);
  const who = WC.hookWeights(pool.list, { area: 'reeds', phase: 'dusk', bait: 'mireworm', hook: false });
  ok(who.every((e) => e.g === undefined) && who.find((e) => e.sp.id === 'reedjaw_pike').w > 0, 'hook: false is who is there (no grade; the pike is in the reeds whatever the hook)');
  eq(['calm', 'day', 'dawn', 'dusk', 'gloomtide', 'night'].map(WC.lightOf), ['day', 'day', 'day', 'dusk', 'night', 'night'], 'lightOf');
  // giants: the spinner's share, Taper's cap, a grade-0 giant capped
  const sp = poolAt('under_the_span', 'dusk', null, 'taper');
  const os = WC.castOdds(D, { pool: sp, phase: 'dusk', lure: 'bell_spinner', wickId: 'taper' });
  ok(WC.castShare(os, 'thousandcast_pike') <= 0.12 + 1e-9 && WC.castShare(os, 'thousandcast_pike') > 0.06, `the Thousandcast at Under the Span at dusk on the spinner with Taper: ${pc(WC.castShare(os, 'thousandcast_pike'))} (≤ 12%)`);
  const ow = WC.castOdds(D, { pool: poolAt('under_the_span', 'dusk', 'mireworm'), phase: 'dusk', bait: 'mireworm' });
  ok(WC.castShare(ow, 'thousandcast_pike') <= 0.01, `the Thousandcast on worms: a stray (${pc(WC.castShare(ow, 'thousandcast_pike'))})`);
}

console.log(`\nwatercraft: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.slice(0, 20).join('\n')); process.exit(1); }
