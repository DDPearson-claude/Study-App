// tools/tests/loop-sheet.test.mjs — the Wick's sheet, "Taper's Sheet" (docs/loop/SHEET.md v2 §7.4, S1–S14): the Hold rule made true in
// the land roll (S3, SHEET §8.1), the pure model src/loop-sheet.js against the functions the game draws from, and the view's words.
//   node tools/tests/loop-sheet.test.mjs   (or node tools/check.mjs)
import { loadLoopData } from './loop-fixture.mjs';
import * as WC from '../../src/watercraft.js';

const D = await loadLoopData({ query: 'loop-sheet' });
const SIM = await import('../sim/clams.mjs');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);

const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
const MOSS = D.SPECIES.filter((s) => s.zone === 'mossmere' && s.rarity !== 'legendary' && !s.cove);
const LURES = [null, ...WC.LURE_IDS], BAITS = [null, ...WC.BAIT_IDS];

// ---------------------------------------------------------------- S3: the Hold rule (SHEET §8.1)
section('S3 the Hold rule: the land roll gives a tin\'s or lure\'s Hold to the fish that like it or better (gradeTargets), as the sim does');
{
  const kits = [{ rod: 1, line: 1, reel: 2 }, { rod: 0, line: 0, reel: 0 }];
  let n = 0, worst = 0; const diffs = new Map();
  for (const sp of MOSS) {
    const simSp = SIM.SPECIES.find((s) => s.id === sp.id && s.water === 'mossmere');
    if (!simSp) { ok(false, `the sim has ${sp.id}`); continue; }
    for (const kit of kits) for (const lure of LURES) for (const bait of BAITS) for (const cls of CLASSES) {
      const a = D.catchParts(sp, cls, { ...kit, item: lure, upgrade: bait ? { id: bait } : undefined }, { strike: 'struck' })?.p ?? 0;
      const b = SIM.landP(simSp, cls, { ...kit, lure, bait }, 'struck', false);
      n++;
      const d = Math.abs(a - b);
      if (d > worst) worst = d;
      if (d > 1e-9) diffs.set(sp.id, (diffs.get(sp.id) || 0) + 1);
    }
  }
  ok(n >= 3840, `S3 compared ${n} land chances`);
  ok(diffs.size === 0, `S3 catchParts equals the sim's landP on every Mossmere fish × class × hook × kit (worst ${worst.toExponential(2)}; differ: ${[...diffs].map(([k, v]) => `${k} ×${v}`).join(', ') || 'none'})`);
  for (const id of WC.HOOK_ITEMS.filter((x) => x !== 'bare')) {
    const helped = MOSS.filter((sp) => WC.gradeOf(sp.id, {}) !== undefined && D.catchItemHold(id, sp) > 0).map((s) => s.id).sort();
    eq(helped, WC.gradeTargets(id, D).filter((x) => MOSS.some((s) => s.id === x)).sort(), `S3 ${id} helps exactly its gradeTargets`);
  }
  // the counts the gear line prints (SHEET §8.1's measured audit, now true in the roll): Mire Worms 8, Lumen Moss 6, Cut Strip 10, the Feather Fly 5
  eq(['mireworm', 'lumen_moss', 'cut_strip', 'feather_fly'].map((id) => MOSS.filter((sp) => D.catchItemHold(id, sp) > 0).length), [8, 6, 10, 5],
    'S3 the fish each helps on the Mossmere: worms 8, moss 6, strip 10, fly 5');
  ok(D.catchItemHold('glimmer_spoon', 'mossback_perch') > 0 && D.catchItemHold('glimmer_spoon', 'hullkiss_lamprey') === 0, 'S3 the spoon helps the Mossback Perch, not the Hullkiss Lamprey');
  ok(D.CATCH_V3.items.cut_strip.family === 'predator' && D.CATCH_V3.items.mireworm.attract === true, 'S3 family and attract stay on the records (the sim\'s fallback)');
}
// off the loop the rule is the built one (the v3 fingerprint holds: validate-data --v3)
{
  globalThis.GW_LOOP = false;
  const V3 = await import('../../src/data.js?loop-sheet-v3');
  globalThis.GW_LOOP = true;
  ok(!V3.CATCH_V3.items.mireworm.species && !V3.CATCH_V3.items.cut_strip.species, 'S3 off the loop no item carries the patch\'s species list');
}

// ================================================================================================ the model (SHEET §7)
const SM = await import('../../src/loop-sheet.js');
const fs0 = await import('node:fs');
const PL = await import('../../src/progression-loop.js');
const FX = await import('./loop-fixture.mjs');
const pc = (p) => (p == null ? null : Math.round(p * 100));
const fl = (p) => (p == null ? null : D.catchDisplay(p));
const MET = ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'likely_chub', 'overbold_bass', 'rustfin_sucker', 'weeping_carp', 'candlefin_koi',
  'kissmark_trout', 'reedjaw_pike', 'bridgechain_sturgeon', 'thousandcast_pike'];
/** The worked example (SHEET §3): Taper, evening 14, the Double Creel, Ashwood · Braided Gut · Clockwork, Mire Worms on the hook. */
function example({ lure = null, bait = 'mireworm', met = MET, pin = { speciesId: 'thousandcast_pike', sizeClass: 'trophy' } } = {}) {
  const m = FX.placesMeta(D, { own: ['lily_maze', 'under_the_span'], holdSlots: 5, tackle: { rod: 1, line: 1, reel: 2 }, caught: met });
  const L = m.loop; L.wick = 'taper'; L.evenings = 14;
  L.bait.mossmere = { mireworm: 7, cut_strip: 3, lumen_moss: 5 }; L.lures = ['glimmer_spoon', 'feather_fly']; L.fitted = { lure, bait };
  L.raft = { oars: 1, keel: 2, lantern: 1 }; L.home = { orders: 1, baitBed: 1, wall: 1, lights: 1 };
  L.finds.got = { buoy_bell: 1, gate_glass: 1 }; L.looks = ['slate_dye', 'oxblood_pennant'];
  if (pin) m.gearPin = { ...pin };
  return m;
}
const model = (m, o = {}) => SM.sheetModel(m, D, { shelf: PL.shelfItems(D, m.loop), ...o });
const SPAN = { place: 'under_the_span', light: 'dusk', cls: 'trophy' };
const row = (S, id) => S.odds.rows.find((r) => r.id === id);

section('S1 shape: every section on a fresh save for each Wick and on the example; the exact lines from LOOP.wicks');
for (const w of D.LOOP.wicks.order) {
  const m = FX.freshLoopMeta(D); m.loop.wick = w;
  const S = model(m);
  ok(S && S.wick.id === w && S.tackle.slots.length === 3 && S.raft.length === 4 && S.home.length === 4 && Array.isArray(S.buffs) && S.odds && Array.isArray(S.fresh), `S1 ${w}: every section`);
  eq(S.odds.rows.length, 0, `S1 ${w}: a fresh save names no fish`);
  ok(S.odds.unmet === 11 || S.odds.unmet === 12, `S1 ${w}: the foot counts the open water's fish not met (${S.odds.unmet})`);
}
eq(SM.passiveExact(D, 'taper').values, { share: 1.3, cap: 12 }, 'S1 Taper: ×1.3, to 12%');
eq(SM.passiveExact(D, 'wick').values, { mult: 1.4, floor: 3 }, 'S1 the Wick: ×1.4, at least round(0.4 × 7) = 3');
eq(SM.passiveExact(D, 'stub').values, { sooner: 1.28, quiet: 0.5 }, 'S1 Stub: ×1.28 and ×0.5');
eq(SM.passiveExact(D, 'tallow').values, { good: 1 }, 'S1 Tallow: +1');
eq(SM.passiveExact(D, 'ashwick').values, { hold: 4 }, 'S1 Ashwick: +4');

section('S2 tackle: names, notches, the shelf\'s next card at factors 1 and 2, the rod\'s cast and strike');
{
  const m = example();
  const S = model(m, { view: SPAN });
  eq(S.tackle.slots.map((p) => [p.name, p.notches.on, p.notches.of]), [['Ashwood', 1, 2], ['Braided Gut', 1, 2], ['Clockwork', 2, 2]], 'S2 Ashwood ▮▯, Braided Gut ▮▯, Clockwork ▮▮');
  eq(S.tackle.slots[0].values, { hold: D.TACKLE.rod[1].hold, castMax: D.TACKLE.rod[1].castMax, strike: 4 }, 'S2 the rod: 17.5 m, 4% longer to strike');
  const f0 = model(FX.freshLoopMeta(D)).tackle.slots[0];
  eq([f0.name, f0.notches.on, f0.notches.of, f0.values.strike], ['Willow Switch', 0, 2, 0], 'S2 a fresh save: the Willow Switch ▯▯, 0%');
  for (const factor of [1, 2]) {
    const keep = D.LOOP.cost.factor; D.LOOP.cost.factor = factor;
    const shelf = PL.shelfItems(D, m.loop), S2 = SM.sheetModel(m, D, { shelf, view: SPAN });
    const want = shelf.find((c) => c.slot === 'rod' && !c.bought);
    eq([S2.tackle.slots[0].next?.id, S2.tackle.slots[0].next?.price], [want.id, want.price], `S2 the rod's Next is the shelf's card at ×${factor} (${want.price})`);
    D.LOOP.cost.factor = keep;
  }
  ok(!S.tackle.slots[2].next, 'S2 the reel at the shelf\'s top has no Next (no T3 in M1)');
  ok(S.raft.find((p) => p.slot === 'keel').notches.of === 2 && !S.raft.find((p) => p.slot === 'keel').next, 'S2 no Keel III in M1');
  const top = FX.placesMeta(D, { holdSlots: 6 }); ok(!model(top).raft[0].next, 'S2 no step past the Wellbox');
}

section('S4 who bites: every lifted place and the open water × hour × hook sums to 1 and is castOdds / openMix with the roll\'s rb');
{
  const ALL = [...MET, 'milkeye_perch', 'lampsipper', 'hullkiss_lamprey', 'gloam_eel'];
  const m = FX.placesMeta(D, { own: ['lily_maze', 'under_the_span', 'buoy_lights'], holdSlots: 5, caught: ALL });
  m.loop.wick = 'taper'; m.loop.bait.mossmere = { mireworm: 5, lumen_moss: 5, cut_strip: 3 }; m.loop.lures = ['glimmer_spoon', 'bone_jig', 'feather_fly', 'bell_spinner'];
  let worst = 0, n = 0;
  for (const place of [null, 'lily_maze', 'under_the_span', 'buoy_lights']) for (const light of SM.LIGHTS) for (const lure of [null, 'glimmer_spoon', 'bell_spinner']) for (const bait of [null, 'mireworm', 'lumen_moss', 'cut_strip']) {
    m.loop.fitted = { lure, bait };
    const S = model(m, { view: { place, light, cls: 'trophy' } });
    const sum = S.odds.rows.reduce((a, r) => a + r.share, 0);
    const phase = SM.LIGHT_PHASE[S.picks.light], rb = D.BAITS.find((b) => b.id === bait)?.bonus?.rarityBonus || 0;
    let want;
    if (place) { const pool = D.placePool(D.SPECIES, { placeId: place, phase, bait, wickId: 'taper', water: 'mossmere' }); want = {}; for (const e of WC.castOdds(D, { pool, area: null, phase, lure, bait, wickId: 'taper', rb }).entries) want[e.sp.id] = (want[e.sp.id] || 0) + e.p; }
    else want = WC.openMix(D, { light: S.picks.light, lure, bait, wickId: 'taper', rb });
    for (const r of S.odds.rows) worst = Math.max(worst, Math.abs(r.share - (want[r.id] || 0)));
    if (S.odds.unmet === 0) worst = Math.max(worst, Math.abs(sum - 1));
    n++;
  }
  ok(worst < 1e-9 && n === 144, `S4 ${n} picks: the rows sum to 1 and equal castOdds / openMix (worst ${worst.toExponential(2)})`);
  m.loop.fitted = { lure: null, bait: 'lumen_moss' };
  const moss = row(model(m, { view: SPAN }), 'weeping_carp').share;
  const pool = D.placePool(D.SPECIES, { placeId: 'under_the_span', phase: 'dusk', bait: 'lumen_moss', wickId: 'taper', water: 'mossmere' });
  const at0 = WC.castShare(WC.castOdds(D, { pool, phase: 'dusk', bait: 'lumen_moss', wickId: 'taper', rb: 0 }), 'weeping_carp');
  ok(Math.abs(moss * 100 - 24.7) < 0.15 && Math.abs(at0 * 100 - 22.3) < 0.15, `S4 on Lumen Moss the carp at Under the Span at dusk is 24.7% with its rb, 22.3% without (${(moss * 100).toFixed(2)} / ${(at0 * 100).toFixed(2)})`);
  // the evening's mean of openMix at rb 0 is WC-3's bitesTable
  for (const o of [{}, { bait: 'mireworm' }, { lure: 'glimmer_spoon' }]) {
    const E = D.LOOP.evening, w = { day: E.day || 0, dusk: E.dusk || 0, night: E.night || 0 }, acc = {}; let ws = 0;
    for (const l of SM.LIGHTS) { if (!(w[l] > 0)) continue; const s = Object.values(WC.WATERCRAFT.mossmere.shares[l]).reduce((a, b) => a + b, 0); for (const [id, p] of Object.entries(WC.openMix(D, { light: l, ...o }))) acc[id] = (acc[id] || 0) + w[l] * s * p; ws += w[l] * s; }
    const bt = WC.bitesTable(D, o); let d = 0; for (const r of bt) d = Math.max(d, Math.abs(r.share - (acc[r.id] || 0) / ws));
    ok(d < 1e-9, `S4 bitesTable is openMix's evening mean (${JSON.stringify(o)}, worst ${d.toExponential(2)})`);
  }
}

section('S5 the user\'s rule on the page: a fish that will not take the hook is "<1%"');
{
  const ALL = [...MET, 'milkeye_perch', 'lampsipper', 'hullkiss_lamprey'];
  let worst = 0, where = '';
  for (const wick of ['wick', 'taper']) for (const bait of ['mireworm', null, 'lumen_moss']) for (const place of [null, 'lily_maze', 'under_the_span', 'buoy_lights']) for (const light of SM.LIGHTS) {
    const m = FX.placesMeta(D, { own: ['lily_maze', 'under_the_span', 'buoy_lights'], caught: ALL }); m.loop.wick = wick; m.loop.bait.mossmere = { mireworm: 5, lumen_moss: 5 }; m.loop.fitted = { lure: null, bait };
    const S = model(m, { view: { place, light } });
    for (const r of S.odds.rows) if (r.grade === 0 && r.share > worst) { worst = r.share; where = `${r.id} ${wick} ${bait} ${place} ${light}`; }
    if (bait !== 'lumen_moss') for (const id of ['reedjaw_pike', 'thousandcast_pike']) { const r = row(S, id); if (r) ok(r.share < 0.01, `S5 ${id} on ${bait || 'the bare hook'} at ${place || 'open'} ${light} (${wick}) is <1% (${(r.share * 100).toFixed(2)})`); }
  }
  ok(worst <= 0.01 + 1e-12, `S5 every grade-0 fish ≤ 1% at every pick (worst ${(worst * 100).toFixed(3)}%, ${where})`);
}

section('S6 your odds: catchParts with the hook\'s larger Hold, the struck strike; Elder the Ancient-weighted mean; the legend\'s one figure');
{
  const m = example(), S = model(m, { view: SPAN });
  const kit = { rod: 1, line: 1, reel: 2, item: null, upgrade: { id: 'mireworm' } };
  let worst = 0;
  for (const r of S.odds.rows) for (const c of ['keeper', 'prize', 'trophy']) if (r.land[c] != null) worst = Math.max(worst, Math.abs(r.land[c] - D.catchParts(r.id, c, kit, { strike: 'struck' }).p));
  ok(worst < 1e-12, 'S6 every figure is catchParts');
  eq(fl(row(S, 'dusk_minnow').land.elder), 15, 'S6 the Dusk Minnow\'s Elder at Under the Span at dusk on worms: 15 (the Ancient share mixed in)');
  eq([fl(row(S, 'thousandcast_pike').land.small), fl(row(S, 'thousandcast_pike').land.keeper), fl(row(S, 'thousandcast_pike').land.trophy)], [null, 61, 16], 'S6 the pinned giant: Small —, Keeper 61, Trophy 16');
  const open = model(m, { view: { place: null, light: 'dusk' } });
  ok(open.odds.rows.every((r) => r.land.elder === null), 'S6 no Elder in the open water');
  const maze = model(m, { view: { place: 'lily_maze', light: 'day' } });
  ok(maze.odds.rows.every((r) => r.land.elder === null), 'S6 no Elder in the Lily Maze');
  const L = FX.placesMeta(D, { own: ['bell_pool'], caught: ['belled_matriarch'], balls: 1, tackle: { rod: 1, line: 1, reel: 2 } });
  L.loop.fitted = { lure: null, bait: 'heartmoss' };
  const B = model(L, { view: { place: 'bell_pool', light: 'dusk' } });
  ok(!row(model(L, { view: { place: 'bell_pool', light: 'night' } }), 'belled_matriarch'), 'S6 out of her hours she is not in the table');
  const her = row(B, 'belled_matriarch');
  ok(her && her.share === 1 && Math.abs(her.land.legend - D.catchChance('belled_matriarch', 'legend', { rod: 1, line: 1, reel: 2, item: null, upgrade: { id: 'heartmoss' } }, { strike: 'struck' })) < 1e-12,
    `S6 the legend in her hours on her bait: the whole of the bites, her one figure (${her ? fl(her.land.legend) : '-'})`);
}

section('S7 the sizes: the roll\'s law; the hour\'s words');
{
  const LAD = D.SIZE_CLASSES.map((c) => [c.id, c.zMax]);
  let worst = 0;
  for (const mu of [0, 0.7, 1.25, 1.8]) for (const cap of [2.64, 3.6]) {
    const a = SM.sizeOdds(mu, { min: -2, cap, classes: LAD, ancient: 3.2 }), b = D.classOdds(mu, cap);
    for (const k of ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient']) worst = Math.max(worst, Math.abs(a[k] - b[k]));
  }
  ok(worst < 1e-6, `S7 sizeOdds is classOdds at the floor −2 (worst ${worst.toExponential(2)})`);
  const { rollZ } = await import('../../src/fishing-reel.js');
  const rng = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const r = rng(11), N = 200000, cnt = { small: 0, keeper: 0, prize: 0, trophy: 0, elder: 0 };
  for (let i = 0; i < N; i++) { const z = rollZ(1.55, r, { min: -0.25, max: 3.6, cap: 3.6 }); cnt[D.sizeClassOf(z)]++; }
  const want = SM.sizeOdds(1.55, { min: -0.25, cap: 3.6, classes: LAD });
  let w2 = 0; for (const k of Object.keys(cnt)) w2 = Math.max(w2, Math.abs(cnt[k] / N - want[k]) * 100);
  ok(w2 < 0.3, `S7 200,000 rollZ draws with a giant's floor −0.25 agree within 0.3 points (${w2.toFixed(3)})`);
  const m = FX.placesMeta(D, { own: ['buoy_lights'] }); m.loop.raft = { oars: 0, keel: 0, lantern: 1 };
  const h = SM.favourHere(D, m.loop, { place: 'buoy_lights', light: 'night' });
  ok(h.terms.some((t) => t.id === 'nightRise' && t.value === 0.25) && h.terms.some((t) => t.id === 'lantern' && t.value === 0.1), 'S7 the Buoy Lights at night with Lantern I: Night Rise +0.25 and the Lantern +0.1');
  const G = await import('../../src/loop-gear.js');
  ok(G.raftTerms(D, m.loop, 'night').length === 0 && G.raftTerms(D, m.loop, 'gloomtide').length === 1, 'S7 the mapping is needed: raftTerms passed "night" holds no Lantern');
  // the example's figures (SHEET §3.5, measured)
  const S = model(example(), { view: SPAN });
  eq(Object.values(S.odds.size[0].shares).slice(0, 5).map(pc), [7, 35, 32, 19, 7], 'S7 Under the Span at dusk on worms: Small 7 · Keeper 35 · Prize 32 · Trophy 19 · Elder 7');
  const B = model(example({ lure: 'glimmer_spoon' }), { view: SPAN });
  eq(B.odds.size.map((s) => s.label), [null, 'predator', 'thousandcast_pike'], 'S7 the spoon over the worms: the plain line, Predators, the pinned giant');
  eq(Object.values(B.odds.size[1].shares).slice(0, 5).map(pc), [5, 30, 33, 22, 10], 'S7 Predators: 5 · 30 · 33 · 22 · 10');
  eq(Object.values(B.odds.size[2].shares).slice(1, 5).map(pc), [23, 33, 28, 16], 'S7 the Thousandcast Pike: — · 23 · 33 · 28 · 16');
  ok(B.odds.size[2].shares.small === 0, 'S7 a giant is never Small');
}

section('S7 each line\'s μ is fishing.js\'s favour for a plain cast (the real fishing module)');
{
  const { makeFishingEnv } = await import('./fishing-env.mjs');
  for (const [bait, lure, phase] of [['mireworm', null, 'dusk'], ['cut_strip', null, 'calm'], ['mireworm', 'glimmer_spoon', 'gloomtide'], [null, 'bone_jig', 'dusk']]) {
    const lp = FX.fakeLoop({ D, wick: 'taper', maps: { lakes: ['mossmere'], places: [] }, bag: bait ? { [bait]: 9 } : {}, raft: { oars: 0, keel: 2, lantern: 1 } });
    const E = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase, seed: 3, loop: lp, raft: [0, 18],
      runOver: { bait: bait ? { [bait]: 9 } : {}, equippedBait: bait, lure, evening: 2, character: 'taper', nightMode: 'still' } });
    E.ctx._depth = 0.05;   // (no depth band)
    E.ctx.player.position.set(0, 0, 18); E.tick(1);
    E.ctx.debug.forceBite?.({ wait: 30 });
    const light = { calm: 'day', dusk: 'dusk', gloomtide: 'night' }[phase];
    const h = SM.favourHere(D, lp.state(), { place: null, light, bait, lure });
    for (const id of ['overbold_bass', 'mossback_perch', 'dusk_minnow']) {
      const f = E.F.favourAt({ x: 0, z: 10 }, id), sp = D.SPECIES_BY_ID[id];
      const want = h.families[sp.family]?.mu ?? h.mu;
      ok(f && Math.abs(f.mu - Math.round(want * 100) / 100) < 1e-9, `S7 ${bait || 'bare'} + ${lure || 'no lure'} at ${phase}: ${id}'s μ ${f?.mu} is the sheet's ${want.toFixed(2)}`);
    }
  }
}

section('S8 buffs: each owned effect with its move; the hidden save shows exactly the same');
{
  const S = model(example(), { view: SPAN });
  const b = (k) => S.buffs.find((x) => x.key === k);
  eq([pc(b('keel:2').move.from), pc(b('keel:2').move.to)], [15, 19], 'S8 Keel II at Under the Span at dusk: Trophy 15% → 19%');
  eq([pc(b('lantern:1').move.from), pc(b('lantern:1').move.to)], [19, 21], 'S8 Lantern I at night there: Trophy 19% → 21%');
  eq([pc(b('bait:mireworm').move.from), pc(b('bait:mireworm').move.to)], [13, 19], 'S8 a tin: Trophy 13% → 19%');
  eq(b('bait:mireworm:sooner').effect.value, 1.3, 'S8 Mire Worms: Bites sooner ×1.3');
  const good = b('good').effect.list;
  eq(good.map((g) => g.n), [7, 2, 3], 'S8 good bites: the Mossmere 7 (5 + 1 + the Lamp-Glass), the Lily Maze 2, Under the Span 3');
  const M = model(example({ bait: 'lumen_moss' }), { view: SPAN });
  const rare = M.buffs.find((x) => x.key === 'bait:lumen_moss:rarer');
  ok(rare?.move?.what === 'weeping_carp' && pc(rare.move.from) === 22 && pc(rare.move.to) === 25, `S8 Lumen Moss: the Weeping Carp 22% → 25% (${rare?.move?.what} ${pc(rare?.move?.from)} → ${pc(rare?.move?.to)})`);
  // a trip at the water the raft is on: the let-go and the quiet terms
  const m = example(), run = FX.tripRun(D, { metaLoop: m.loop, character: 'taper', equippedBait: 'mireworm' });
  const T = SM.sheetModel(m, D, { run, view: { place: null, light: 'dusk' }, live: { waterKey: 'open:mossmere', place: null, light: 'dusk', mercy: 0.2, quiet: -0.3 }, shelf: PL.shelfItems(D, m.loop) });
  ok(T.buffs.some((x) => x.key === 'letGo' && x.effect.value === 0.2 && x.move) && T.buffs.some((x) => x.key === 'quiet' && x.effect.value === -0.3 && x.move), 'S8 on a trip: Let go and Quiet water, each with its move');
  ok(T.odds.here.terms.some((t) => t.family === 'letGo') && T.odds.here.terms.some((t) => t.family === 'quiet'), 'S8 … and in Bigger fish here');
  // the hidden save: a marked giant, a wounded Matriarch, Ashwick's comeback waiting: the same figures, no field naming them
  const h = example(); h.loop.giants = { thousandcast_pike: { landed: 0, marked: 1 } }; h.loop.legends = { belled_matriarch: { wounds: 2 } };
  const hr = FX.tripRun(D, { metaLoop: h.loop, character: 'taper', equippedBait: 'mireworm', comeback: { speciesId: 'reedjaw_pike', waterKey: 'open:mossmere' } });
  const plain = example(), pr = FX.tripRun(D, { metaLoop: plain.loop, character: 'taper', equippedBait: 'mireworm' });
  const A1 = SM.sheetModel(h, D, { run: hr, view: SPAN, shelf: PL.shelfItems(D, h.loop) }), A2 = SM.sheetModel(plain, D, { run: pr, view: SPAN, shelf: PL.shelfItems(D, plain.loop) });
  eq(JSON.stringify({ ...A1, fresh: 0 }), JSON.stringify({ ...A2, fresh: 0 }), 'S8 a marked giant, a wounded legend and a waiting comeback change nothing on the page');
  ok(!/marked|wound|comeback/i.test(JSON.stringify(A1)), 'S8 no field names them');
}

section('S9 names: met fish only; the rating once the Reedjaw Pike is met; a pin to an unmet fish refused; a misted place is no chip');
{
  const S = model(example({ met: ['dusk_minnow', 'mossback_perch'], pin: { speciesId: 'reedjaw_pike', sizeClass: 'prize' } }), { view: SPAN });
  ok(S.odds.rows.every((r) => ['dusk_minnow', 'mossback_perch'].includes(r.id)), 'S9 only met fish have rows');
  ok(S.tackle.rating === null && S.odds.ref?.speciesId !== 'reedjaw_pike' && S.picks.cls === 'trophy', 'S9 no rating, no pin, no pinned class before the Reedjaw Pike is met');
  const m = example(); m.loop.lifted = ['lily_maze'];
  ok(!model(m).picks.choices.some((c) => c.id === 'under_the_span'), 'S9 Under the Span, owned but in its mist, is no Where chip');
}

section('S10 the new marks: a buy marks its key; markSheetSeen clears it; a found part marks; an older save seeds before the fill');
{
  const m = example();
  m.loop.sheetSeen = SM.sheetKeys(m.loop, D);
  eq(model(m).fresh, [], 'S10 everything seen: no marks');
  m.loop.tackle.rod = 2;
  eq(model(m).fresh, ['rod:2'], 'S10 a bought Whalebone marks rod:2');
  m.loop.finds.got.moat_bollard = 1;
  eq(model(m).fresh, ['rod:2', 'find:moat_bollard'], 'S10 a found part marks find:<id>');
  m.loop.bait.mossmere.mireworm = 99;
  eq(model(m).fresh.length, 2, 'S10 a consumable is never marked');
  const old = example(); delete old.loop.sheetSeen;
  PL.migrateLoop(old, D);
  eq(SM.sheetModel(old, D, {}).fresh, [], 'S10 an older save (no sheetSeen) opens with no marks: seeded before the fill');
  eq(PL.freshLoop(D).sheetSeen, [], 'S10 a fresh save: sheetSeen []');
  const f = FX.fakeLoop({ D, lures: ['glimmer_spoon'] });
  ok(f.sheet().fresh.includes('lure:glimmer_spoon') && f.markSheetSeen(['lure:glimmer_spoon', 'rod:9']) && !f.sheet().fresh.includes('lure:glimmer_spoon') && !f.s.sheetSeen.includes('rod:9'),
    'S10 fakeLoop: markSheetSeen clears an owned mark and ignores a key not owned');
}

section('S12 live: a fit changes the hook\'s figures; the Buoy Lights moves the hour to night; the last cast (the user\'s answer 41)');
{
  const f = FX.fakeLoop({ D, wick: 'taper', maps: { lakes: ['mossmere'], places: ['buoy_lights'] }, lifted: ['buoy_lights'], bag: { mireworm: 5, cut_strip: 3 }, journal: Object.fromEntries(MET.map((id) => [id, { caught: 1 }])) });
  f.fit('bait', 'mireworm');
  const a = f.sheet({ place: null, light: 'dusk' });
  f.fit('bait', 'cut_strip');
  const b = f.sheet({ place: null, light: 'dusk' });
  ok(a.tackle.hook.bait === 'mireworm' && b.tackle.hook.bait === 'cut_strip', 'S12 the hook follows the fit');
  ok(JSON.stringify(a.odds.rows) !== JSON.stringify(b.odds.rows) && JSON.stringify(a.odds.size) !== JSON.stringify(b.odds.size) && JSON.stringify(a.buffs) !== JSON.stringify(b.buffs), 'S12 … and the rows, the size lines and the buffs change with it');
  eq(JSON.stringify(a.tackle.slots.map((p) => p.notches)), JSON.stringify(b.tackle.slots.map((p) => p.notches)), 'S12 … the tackle\'s notches do not');
  eq(f.sheet({ place: 'buoy_lights', light: 'day' }).picks.light, 'night', 'S12 the Buoy Lights moves the hour to night');
  const run = FX.tripRun(D, { character: 'taper', equippedBait: 'mireworm' });
  const m = example();
  const mist = SM.sheetModel(m, D, { run, live: { waterKey: 'open:mossmere', place: null, light: 'dusk' }, shelf: [] });
  eq(mist.picks.place, null, 'S12 a live raft in a mist bank (place null) picks the open water');
  // the user's answer 41: once a spot has been fished, the Odds open on where the player last cast; the area is never named
  const lc = SM.sheetModel(m, D, { cast: { area: 'reeds', place: null }, shelf: [] });
  ok(lc.picks.place === 'last' && lc.picks.choices.some((c) => c.id === 'last'), 'S12 a last cast in the open water: the picks open on "where you last cast"');
  const pool = D.placePool(D.SPECIES, { placeId: null, phase: 'dusk', bait: 'mireworm', wickId: 'taper', water: 'mossmere' });
  const want = WC.castShare(WC.castOdds(D, { pool, area: 'reeds', phase: 'dusk', bait: 'mireworm', wickId: 'taper' }), 'dusk_minnow');
  ok(Math.abs(row(lc, 'dusk_minnow').share - want) < 1e-12, 'S12 … its rows are castOdds at that area');
  ok(!JSON.stringify(lc).includes('reeds') && !JSON.stringify(lc.picks).includes('area'), 'S12 … and the model carries no area word');
  const lp = SM.sheetModel(m, D, { cast: { area: null, place: 'under_the_span' }, shelf: [] });
  ok(lp.picks.place === 'under_the_span' && !lp.picks.choices.some((c) => c.id === 'last'), 'S12 a last cast in a place opens on that place');
  ok(SM.sheetModel(m, D, { shelf: [] }).picks.place === null, 'S12 no cast yet: the open water');
}

section('S13 no cycle: loop-sheet.js imports no progression-loop, data, DOM or three.js');
{
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../../src/loop-sheet.js', import.meta.url), 'utf8');
  const imps = [...src.matchAll(/^import .* from '([^']+)'/gm)].map((x) => x[1]);
  ok(!imps.some((x) => /progression-loop|data\.js|three/.test(x)) && !/\bdocument\.|\bwindow\./.test(src), `S13 its imports: ${imps.join(', ')}`);
  ok(!/\d\s*%/.test(src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')), 'S11 no digit before a percent sign in loop-sheet.js\'s code');
  ok(!Object.values(D.TEXT_LOOP.sheet).flatMap((v) => (typeof v === 'string' ? [v] : Object.values(v))).some((t) => /\d\s*%/.test(t) || /(^|[^+\d{])Hold \d/.test(t)), 'S11 TEXT_LOOP.sheet: no typed percentage, no "Hold {n}" form');
}

section('S11 words: every string the view draws passes textAllowed (screen \'sheet\'); no area word; no "Hold {n}"; no unmet fish named');
{
  const UL = await import('../../src/ui-loop.js');
  const SV = await import('../../src/ui-sheet.js');
  const W = UL.allowedWords(D);
  const areaRe = new RegExp(`\\b(${WC.AREAS.join('|')}|drop-off|wind lane)\\b`, 'i');
  let n = 0;
  const cases = [
    [example(), SPAN], [example({ lure: 'glimmer_spoon' }), SPAN], [example({ bait: 'cut_strip' }), { place: null, light: 'night', cls: 'prize' }],
    [example({ bait: 'lumen_moss' }), { place: 'lily_maze', light: 'day', cls: 'keeper' }], [FX.freshLoopMeta(D), {}],
  ];
  for (const [m, view] of cases) for (const phone of [false, true]) {
    if (!m.loop.wick) m.loop.wick = 'wick';
    const v = SV.sheetView(model(m, { view }), D, { phone });
    const strs = SV.sheetStrings(v);
    n += strs.length;
    const bad = strs.filter((t) => !UL.textAllowed(t, { D, screen: 'sheet', words: W }));
    ok(bad.length === 0, `S11 ${view.place || 'open'} ${view.light || ''} ${phone ? 'phone' : 'desktop'}: every string passes (${bad.slice(0, 4).join(' | ')})`);
    ok(!strs.some((t) => areaRe.test(t)), 'S11 no area word');
    ok(!strs.some((t) => /(^|[^+\d])Hold \d/.test(t)), 'S11 no "Hold {n}"');
  }
  const met2 = example({ met: ['dusk_minnow'] });
  const v2 = SV.sheetView(model(met2, { view: SPAN }), D, {});
  const unmetNames = D.SPECIES.filter((s) => s.zone === 'mossmere' && s.id !== 'dusk_minnow').map((s) => s.name);
  ok(!SV.sheetStrings(v2).some((t) => unmetNames.some((nm) => t.includes(nm))), 'S11 a fish not met is never named');
  ok(!/\d\s*%/.test(fs0.readFileSync(new URL('../../src/ui-sheet.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/`[^`]*`/g, '``')), 'S11 no typed percentage in ui-sheet.js\'s code (its CSS and its `${n}%` slots aside)');
  ok(n > 600, `S11 ${n} strings checked`);
}

section('S14 flag off: no sheet words, no sheet method');
{
  globalThis.GW_LOOP = false; globalThis.GW_V3 = true;
  const V3 = await import('../../src/data.js?loop-sheet-v3');
  globalThis.GW_LOOP = true;
  ok(V3.LOOP_ENABLED === false && V3.TEXT.loop === undefined, 'S14 off the loop TEXT.loop (and so the sheet\'s words) is not set');
}

console.log(`\nloop-sheet: ${pass} passed, ${fail} failed`);
if (fail) { for (const f of failures) console.log('  -', f); process.exit(1); }
