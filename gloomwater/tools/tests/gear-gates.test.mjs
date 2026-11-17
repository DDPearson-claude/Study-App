// GEAR-GATES (docs/loop/GEAR-GATES.md §7.1, GG1–GG9; the user's ask of 17 Nov 2026): the start kit (the Bent Spoon and a tin of Mire
// Worms, fitted), the slow bare hook (commons only, small, ×2.5 waits), the gates by lure and bait (the seven hook-table cells and the
// Bent Spoon's column), the gear's size caps (watercraft.gearCap) and their got-away path through the real fishing.js, the logs' lines
// (the Journal's gate line, the sheet's "—", the gear log's "Lands up to") and the ladder. The pacing is tools/sim/clams.mjs's.
//   node tools/tests/gear-gates.test.mjs   (or node tools/check.mjs)
import { loadLoopData, freshLoopMeta, fakeLoop } from './loop-fixture.mjs';

const D = await loadLoopData({ query: 'gear-gates' });
const WC = await import('../../src/watercraft.js');
const PL = await import('../../src/progression-loop.js');
const U = await import('../../src/ui-loop.js');
const AF = await import('../../src/ui-af.js');
const SM = await import('../../src/loop-sheet.js');
const { makeFishingEnv } = await import('./fishing-env.mjs');
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_LOOP = undefined;
const DV3 = await import('../../src/data.js?gear-gates-v3');   // v3 without the loop (an expedition: no gate, no cap)
globalThis.GW_LOOP = true;

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const section = (s) => console.log(`- ${s}`);
const T = WC.WATERCRAFT.mossmere.hook.table, Z = D.BALANCE_V3.size.classMaxZ;
const cap = (id, k) => { const g = WC.gearCap(D, id, k); return g ? [g.cls, g.by] : null; };
const ORD = ['small', 'keeper', 'prize', 'trophy', 'elder'];

// =====================================================================================
section('GG1 gearCap: the lowest of the grade, the free hook and the line');
{
  eq(cap('mossback_perch', { bait: 'mireworm', line: 0 }), ['prize', 'line'], 'worms on Twine: the Mossback Perch (the right bait) up to Prize, by the line');
  eq(cap('mossback_perch', { bait: 'mireworm', line: 1 }), ['trophy', 'line'], 'worms on Line T1: up to Trophy');
  eq(cap('mossback_perch', { bait: 'mireworm', line: 2 }), ['elder', 'line'], 'worms on Line T2: Elder (capZ keeps it to old water; a tie reads the line)');
  eq(cap('overbold_bass', { lure: 'bent_spoon', line: 2 }), ['keeper', 'item'], 'the Bent Spoon on T2: the bass up to Keeper, by the spoon');
  eq(cap('reedjaw_pike', { lure: 'glimmer_spoon', line: 1 }), ['trophy', 'line'], 'the Glimmer Spoon on T1: the Reedjaw Pike up to Trophy');
  eq(cap('thousandcast_pike', { lure: 'glimmer_spoon', line: 1 }), ['prize', 'grade'], '… the Thousandcast (likes it) up to Prize, by its grade');
  eq(cap('dusk_minnow', {}), ['keeper', 'item'], 'the bare hook: the Dusk Minnow up to Keeper');
  eq(cap('likely_chub', { bait: 'cut_strip', line: 2 }), ['prize', 'item'], 'Cut Strip: up to Prize whatever the line');
  eq(cap('reedjaw_pike', { bait: 'mireworm', line: 2 }), ['keeper', 'grade'], 'a stray (the pike on worms) up to Keeper');
  eq(cap('hullkiss_lamprey', { lure: 'bell_spinner', line: 2 }), ['elder', 'line'], 'the Spinner on T2: the lamprey to the top');
  eq(cap('thousandcast_pike', { lure: 'bone_jig', line: 0 }), ['prize', 'line'], 'ties read the item, then the line, then the grade');
  eq(WC.gearCap(D, 'belled_matriarch', { bait: 'heartmoss' }), null, 'the legend: no cap');
  eq(WC.gearCap(D, 'mildew_angler', { bait: 'mireworm' }), null, 'a fish with no hook row (another water): no cap');
  eq(WC.gearCap({ ...D, LOOP: { ...D.LOOP, gearCap: undefined } }, 'dusk_minnow', {}), null, 'no LOOP.gearCap: no cap');
  eq(WC.gearCap(D, 'dusk_minnow', { bait: 'heartmoss' })?.cls, 'keeper', 'the Heartmoss Ball is a bare hook to every fish but her');
  ok(WC.gearCap(D, 'mossback_perch', { bait: 'mireworm', line: 0 }).z === Z.prize && WC.gearCap(D, 'mossback_perch', { bait: 'mireworm', line: 2 }).z === D.BALANCE_V3.size.z.max, 'z is classMaxZ (Elder: the size top)');
  ok(WC.gearCap(D, 'dusk_minnow', { line: 9 })?.cls === 'keeper' && WC.gearCap(D, 'mossback_perch', { bait: 'mireworm', line: 9 }).cls === 'elder', 'a line past T2 reads as T2');
}

// =====================================================================================
section('GG2 totality: every Mossmere fish reaches its top seal on some M1 hook at Line T2');
{
  const HOOKS = [{}, ...WC.BAIT_IDS.map((bait) => ({ bait })), ...WC.LURE_IDS.map((lure) => ({ lure }))];
  const fish = D.SPECIES.filter((s) => s.zone === 'mossmere' && s.rarity !== 'legendary' && T[s.id]);
  let seals = 0, elders = 0;
  for (const sp of fish) {
    const top = Math.max(...D.sealsFor(sp).map((c) => ORD.indexOf(c)), 1);
    const best = Math.max(-1, ...HOOKS.filter((h) => (WC.gradeOf(sp.id, h) ?? 0) >= 1).map((h) => ORD.indexOf(WC.gearCap(D, sp.id, { ...h, line: 2 })?.cls)));
    ok(best >= top, `${sp.name}: up to ${ORD[best]} on its best hook at T2 (its top seal ${ORD[top]})`);
    seals += D.sealsFor(sp).length; elders += D.sealsFor(sp).includes('elder') ? 1 : 0;
  }
  ok(fish.length === 16 && seals > 0, `${fish.length} fish, ${seals} seals (${elders} with an Elder seal) all reachable`);
}

// =====================================================================================
section('GG3 the hook table: the seven edited cells, the Bent Spoon\'s column, the strays\' cap and every pool bites');
{
  eq(['weeping_carp', 'candlefin_koi', 'bridgechain_sturgeon'].map((id) => T[id].bare), [0, 0, 0], 'the bare hook: carp, koi and the Bridgechain 1 → 0');
  eq([T.thousandcast_pike.cut_strip, T.hullkiss_lamprey.cut_strip], [0, 0], 'both giants\' Cut Strip 3 → 0 (a bought lure)');
  eq([T.hullkiss_lamprey.bell_spinner, T.gutter_crayfish.mireworm], [3, 3], 'the lamprey\'s Spinner 2 → 3; the crayfish\'s worm 2 → 3');
  const col = Object.fromEntries(Object.keys(T).map((id) => [id, T[id].bent_spoon]));
  eq(col, { dusk_minnow: 0, mossback_perch: 2, gutter_crayfish: 0, likely_chub: 1, overbold_bass: 2, rustfin_sucker: 0, lampsipper: 0, weeping_carp: 0, candlefin_koi: 0,
    milkeye_perch: 1, kissmark_trout: 1, reedjaw_pike: 0, bridgechain_sturgeon: 0, thousandcast_pike: 0, hullkiss_lamprey: 0, gloam_eel: 0, belled_matriarch: null }, 'the Bent Spoon\'s column (§2.1)');
  ok(Object.keys(T).every((id) => T[id].bare == null || (T[id].bare >= 1) === (D.SPECIES_BY_ID[id]?.rarity === 'common')), 'the bare hook takes the seven commons and nothing else');
  ok(WC.HOOK_ITEMS.at(-1) === 'bent_spoon' && WC.LURE_IDS.includes('bent_spoon'), 'bent_spoon is a hook item and a lure');
  eq(WC.gradeTargets('bent_spoon'), ['mossback_perch', 'overbold_bass'], 'its Hold goes to the perch and the bass');
  eq(D.CATCH_V3.items.bent_spoon, { kind: 'lure', hold: 3, species: ['mossback_perch', 'overbold_bass'] }, 'CATCH_V3.items.bent_spoon (loop-only)');
  let worst = 0, minS = Infinity, n = 0;
  for (const light of ['calm', 'dusk', 'gloomtide']) for (const place of [null, ...Object.keys(D.LOOP.places)]) for (const area of place ? [null] : WC.AREAS) {
    const pool = D.placePool(D.SPECIES, { placeId: place, phase: light, bait: null, water: 'mossmere' });
    const o = WC.castOdds(D, { pool, area, phase: light, lure: 'bent_spoon' });
    n++; minS = Math.min(minS, o.S);
    for (const e of o.entries) if (e.g === 0) worst = Math.max(worst, WC.castShare(o, e.sp.id));
  }
  ok(worst <= 0.01 + 1e-12 && minS > 0, `on the Bent Spoon every stray ≤ 1.00% (worst ${(100 * worst).toFixed(2)}%) and every pool bites (${n} pools, smallest S ${minS.toFixed(2)})`);
  const pike = WC.bitesTable(D, { lure: 'bent_spoon' }).find((r) => r.id === 'reedjaw_pike');
  ok(!pike || pike.share < 0.01, 'the Bent Spoon never brings a pike (a stray)');
}

// =====================================================================================
section('GG4 the start kit: a fresh save, an old save, the shelf');
{
  const L = PL.freshLoop(D);
  eq([L.lures, L.bait, L.fitted], [['bent_spoon'], { mossmere: { mireworm: 10 } }, { lure: null, bait: 'mireworm' }], 'freshLoop: the Bent Spoon, a tin of Mire Worms, fitted');
  eq(PL.startKit({ LOOP: { lures: {} } }), { lures: [], bait: {}, fit: null }, 'no LOOP.start: nothing');
  const old = freshLoopMeta(D); old.loop.lures = ['glimmer_spoon']; old.loop.bait = { mossmere: { lumen_moss: 2 } }; old.loop.fitted = { lure: 'glimmer_spoon', bait: null }; old.loop.evenings = 9;
  PL.migrateLoop(old, D);
  eq([old.loop.lures, old.loop.bait, old.loop.fitted], [['glimmer_spoon', 'bent_spoon'], { mossmere: { lumen_moss: 2 } }, { lure: 'glimmer_spoon', bait: null }], 'an old save gets the Bent Spoon, no bait, its fit kept');
  const again = JSON.stringify(old.loop); PL.migrateLoop(old, D);
  ok(JSON.stringify(old.loop) === again, 'migrateLoop is idempotent');
  const bare = freshLoopMeta(D); bare.loop.lures = []; bare.loop.bait = {}; bare.loop.fitted = { lure: null, bait: null };
  PL.migrateLoop(bare, D);
  eq([bare.loop.lures, bare.loop.bait], [['bent_spoon'], {}], 'a save that owns no lure: the free lure, nothing else (never taken away)');
  const items = PL.shelfItems(D, L);
  ok(!items.some((i) => i.id === 'lure:bent_spoon') && items.some((i) => i.id === 'lure:glimmer_spoon'), 'the shelf never lists the Bent Spoon');
  ok(PL.goalOf(items)?.id !== 'lure:bent_spoon', '… and it is never the goal');
  eq(D.LOOP.lures.bent_spoon, { water: 'mossmere', price: 0, start: true }, 'LOOP.lures.bent_spoon');
  eq(D.TEXT_LOOP.gearItems.bent_spoon, 'Bent Spoon', 'its name');
  const LV = D.LURES.find((l) => l.id === 'bent_spoon');
  ok(LV && LV.favour === -0.25 && !LV.family && DV3.LURES.every((l) => l.id !== 'bent_spoon') && !DV3.CATCH_V3.items.bent_spoon, 'its LURES row (favour −0.25, no family) only under the loop');
}

// =====================================================================================
section('GG5 the cap through fishing: hooked, then away; evening 1 lands at the cap; a legend untouched');
const CAST = 16 * 0.55;
function waterEnv({ evening = 2, bait = null, lure = null, line = 0, phase = 'dusk', wick = 'wick', seed = 42 } = {}) {
  const loop = fakeLoop({ D, wick, maps: { lakes: ['mossmere'], places: [] }, holdSlots: 5 });
  const env = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase, seed, loop, raft: [30, 30],
    runOver: { bait: bait ? { [bait]: 9 } : {}, equippedBait: bait, lure, evening, character: wick, nightMode: 'still' } });
  env.ctx.progression.getLoadout = () => ({ rod: 0, line, reel: 0, item: lure || bait || null });
  env.loop = loop;
  env.last = (e) => env.events.filter((x) => x.e === e).at(-1)?.p;
  env.castAt = (p, o) => { env.ctx.player.position.set(p.x, 0, p.z + CAST); env.tick(1); return env.ctx.debug.forceBite({ wait: 2, ...o }); };
  env.toBite = () => { for (let i = 0; i < 400 && env.F.state === 'waiting'; i++) env.tick(1); return env.F.state === 'bite'; };
  env.strike = () => { env.tick(3); env.F.onPointerDown({ input: 'mouse' }); env.F.onPointerUp(); };
  env.toIdle = (max = 3000) => { for (let i = 0; i < max && env.F.state !== 'idle'; i++) { env.F.skipCeremony?.(); env.tick(1); } };
  return env;
}
const OPENPT = { x: 30, z: 30 };
{
  const E = waterEnv({ bait: 'mireworm' });
  E.castAt(OPENPT, { speciesId: 'mossback_perch', z: 2.2 }); E.toBite();
  E.ctx.debug.fishOutcome('land'); E.strike();
  const d = E.ctx.debug.fishPlay(), f = E.dbg();
  ok(f.overCap && f.overCap.by === 'line' && f.overCap.cls === 'prize' && f.overCap.key === 'line', 'a Trophy perch on worms and Twine is over the cap (the line\'s Prize)', f.overCap);
  ok(d && d.p === 0 && d.outcome === 'lose' && d.loss?.cause === 'snapped', `its land chance 0, lost (even forced 'land'), the line parts (${d?.loss?.cause})`);
  ok(d && d.draws && ['planSeed', 'u', 'causeU', 'momentU'].every((k) => Number.isFinite(d.draws[k])), 'the four draws as ever (seeded parity)');
  E.toIdle();
  const g = E.last('fish:escaped');
  ok(g && g.speciesId === 'mossback_perch' && g.overCap?.key === 'line' && Math.abs(g.overCap.z - Z.prize) < 1e-9, 'fish:escaped carries overCap {by, cls, z, key}');
  const B = waterEnv({});
  B.castAt(OPENPT, { speciesId: 'dusk_minnow', z: 1.5 }); B.toBite(); B.strike();
  ok(B.dbg().overCap?.key === 'bare' && B.ctx.debug.fishPlay()?.loss?.cause === 'thrown', 'a Prize minnow on the bare hook: over the bare hook\'s Keeper, the hook comes free');
  const S = waterEnv({ lure: 'bent_spoon' });
  S.ctx.debug.forceBite({ speciesId: 'overbold_bass', z: 1.5, wait: 2 }); S.toBite(); S.strike();
  ok(S.dbg().overCap?.key === 'bent_spoon', `a Prize bass on the Bent Spoon: "${D.TEXT_LOOP.gate.away[S.dbg().overCap?.key]}"`);
  const U1 = waterEnv({ bait: 'mireworm', line: 1 });
  U1.castAt(OPENPT, { speciesId: 'mossback_perch', z: 2.2 }); U1.toBite(); U1.ctx.debug.fishOutcome('land'); U1.strike();
  ok(!U1.dbg().overCap && U1.ctx.debug.fishPlay()?.p > 0, 'on Line T1 the same Trophy perch keeps its land chance');
  const W1 = waterEnv({ evening: 1 });
  W1.castAt(OPENPT, { speciesId: 'dusk_minnow', z: 1.5 }); W1.toBite();
  ok(Math.abs(W1.dbg().z - Z.keeper) < 1e-4 && !W1.dbg().overCap, `evening 1: an over-cap fish lands at the cap (z ${W1.dbg().z}, Keeper)`);
  const G = waterEnv({});
  ok(G.castAt(OPENPT, { speciesId: 'belled_matriarch', z: 3 }) !== false, '(a forced legend)');
  G.toBite();
  ok(!G.dbg().overCap, 'a legend has no cap');
  const X = waterEnv({ bait: 'mireworm' });
  X.ctx.debug.forceFind?.('tin_spoon', { wait: 2 }); X.toBite();
  ok(!X.dbg().overCap, 'a find has no cap');
  const O = makeFishingEnv({ data: DV3, mode: 'still', outing: 'normal', phase: 'dusk', runOver: { bait: {}, equippedBait: null } });
  O.ctx.debug.forceBite({ speciesId: 'dusk_minnow', z: 2.2, wait: 2 }); for (let i = 0; i < 400 && O.F.state === 'waiting'; i++) O.tick(1);
  ok(!O.ctx.debug.fishing().overCap, 'off the loop: no cap');
}

// =====================================================================================
section('GG6 the bare hook: ×2.5 waits before the clamp, its favour term, a trip only');
{
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const waitOf = (o, seed) => {
    const E = waterEnv(o); const prev = Math.random; Math.random = mulberry(seed);
    try { E.ctx.debug.forceBite({ natural: true }); } finally { Math.random = prev; }
    return E.dbg().wait;
  };
  let good = 0, n = 0;
  for (let s = 1; s <= 12; s++) {
    const moss = waitOf({ bait: 'lumen_moss' }, s), bare = waitOf({}, s);   // (Lumen Moss: no biteSpeed, so the same draw)
    n++; if (Math.abs(bare - Math.min(25, Math.max(2, moss * D.LOOP.bare.waitMult))) < 1e-6) good++;
  }
  ok(good === n, `the bare wait is the bait's × ${D.LOOP.bare.waitMult} before the 2–25 s clamp (${good}/${n} seeds)`);
  const E = waterEnv({}), fav = E.F.favourAt(OPENPT);
  ok(fav.terms.some((t) => t.id === 'bare' && t.value === D.LOOP.bare.favour), `the float's terms carry the bare hook's ${D.LOOP.bare.favour}`);
  const Wm = waterEnv({ bait: 'mireworm' }); Wm.castAt(OPENPT, { speciesId: 'dusk_minnow', z: 0 });   // (the cast's own bait: S.castBait)
  ok(!Wm.dbg().favourTerms?.some?.((t) => t.id === 'bare') && !Wm.F.favourAt(OPENPT).terms.some((t) => t.id === 'bare') && !waterEnv({ lure: 'bent_spoon' }).F.favourAt(OPENPT).terms.some((t) => t.id === 'bare'), '… never with a bait or a lure on');
  ok(waterEnv({ lure: 'bent_spoon' }).F.favourAt(OPENPT).terms.some((t) => t.id === 'bent_spoon' && t.value === -0.25), 'the Bent Spoon\'s own −0.25 for every fish');
  const O = makeFishingEnv({ data: DV3, mode: 'still', outing: 'normal', phase: 'dusk', runOver: { bait: {}, equippedBait: null } });
  ok(!O.F.favourAt(OPENPT).terms.some((t) => t.id === 'bare'), 'off a trip: no bare term');
  const here = SM.favourHere(D, PL.freshLoop(D), { light: 'dusk' });
  ok(here.terms.some((t) => t.id === 'bare'), 'the sheet\'s plain cast on the bare hook carries it too');
}

// =====================================================================================
section('GG7 the words: few, no fish named, allowed; the got-away line fits a phone');
{
  const G = D.TEXT_LOOP.gate, names = D.SPECIES.map((s) => s.name);
  const lines = [G.upTo, G.needs, ...Object.values(G.away), D.TEXT_LOOP.murk.firstAway];
  ok(Object.values(G.away).every((t) => t.split(/\s+/).length <= 6), 'every got-away line ≤ 6 words');
  ok(lines.every((t) => !names.some((n) => t.includes(n))), 'no gate line names a fish');
  for (const id of ['line', 'glimmer_spoon', 'bone_jig']) ok(D.TEXT_LOOP.shelf[id].split(/\s+/).length <= 8, `the shelf's ${id} line ≤ 8 words ("${D.TEXT_LOOP.shelf[id]}")`);
  eq([D.TEXT_LOOP.shelf.line, D.TEXT_LOOP.shelf.glimmer_spoon, D.TEXT_LOOP.shelf.bone_jig], ['Lands bigger fish.', 'Flash, for pike and the big hunters.', 'Hopped deep, for big perch and bass.'], 'the three new shelf lines');
  const W = U.allowedWords(D);
  for (const t of ['Lands up to Prize.', 'Needs the Glimmer Spoon.', 'Needs Lumen Moss.', ...Object.values(G.away), D.TEXT_LOOP.murk.firstAway]) ok(U.textAllowed(t, { D, words: W }), `textAllowed: "${t}"`);
  // the phone's slot: 19 px Alegreya italic (≈ 0.47 em a character on average) inside 358 − 32 px
  const widest = Math.max(...Object.values(G.away).map((t) => t.length));
  ok(widest * 19 * 0.47 <= 358 - 32, `the longest got-away line (${widest} characters) fits 358 px with 16 px sides (≈ ${Math.round(widest * 19 * 0.47)} px)`);
}

// =====================================================================================
section('GG8 the logs: the Journal\'s gate line, the sheet\'s "—" and the gear log\'s "Lands up to"');
{
  const L = PL.freshLoop(D);
  eq(PL.gateLine(D, L, 'mossback_perch')?.text, 'Lands up to Prize.', 'a fresh save, the Mossback Perch: up to Prize (worms on Twine)');
  eq(PL.gateLine(D, L, 'reedjaw_pike')?.text, 'Lands up to Prize.', 'the Reedjaw Pike: Cut Strip, up to Prize');
  eq(PL.gateLine(D, L, 'thousandcast_pike')?.text, 'Needs the Glimmer Spoon.', 'the Thousandcast: needs the cheapest lure that takes it');
  eq(PL.gateLine(D, L, 'gloam_eel')?.text, 'Needs Lumen Moss.', 'the Gloam Eel: needs Lumen Moss');
  eq(PL.gateLine(D, L, 'belled_matriarch'), null, 'the legend: no line');
  const L1 = { ...L, tackle: { ...L.tackle, line: 1 } };
  eq(PL.gateLine(D, L1, 'mossback_perch')?.text, 'Lands up to Trophy.', 'Line T1: up to Trophy');
  const out = { ...L, bait: { mossmere: { mireworm: 0 } } };
  eq(PL.gateLine(D, out, 'weeping_carp')?.text, 'Needs Mire Worms.', 'worms run out: the carp needs a tin (the bare hook no longer takes it)');
  ok(AF.gearCapLine(D, { kind: 'line', tier: 0 }) === 'Lands up to Prize.' && AF.gearCapLine(D, { kind: 'line', tier: 2 }) === 'Lands up to Elder.', 'the gear log\'s Line slot: Twine Prize, T2 Elder');
  ok(AF.gearCapLine(D, { kind: 'lure', id: 'bent_spoon' }) === 'Lands up to Keeper.' && AF.gearCapLine(D, { kind: 'lure', id: 'glimmer_spoon' }) === '', '… the Bent Spoon Keeper; a bought lure none');
  ok(AF.gearCapLine(DV3, { kind: 'line', tier: 0 }) === '', '… none off the loop');
  // the sheet's "—": a class over the hook's cap reads null (sheet S6 checks the figures)
  const meta = freshLoopMeta(D); meta.journal = { dusk_minnow: { caught: 1 }, overbold_bass: { caught: 1 } };
  meta.loop.fitted = { lure: 'bent_spoon', bait: null };
  const S = SM.sheetModel(meta, D, {}), bass = S.odds.rows.find((r) => r.id === 'overbold_bass');
  ok(bass && bass.cap === 'keeper' && bass.land.prize === null && bass.land.trophy === null && bass.land.keeper > 0, 'the sheet on the Bent Spoon: the bass\'s Prize and Trophy read "—"');
}

// =====================================================================================
section('GG9 the ladder: each buy raises a cap the design names; the firstAway line once; T104 is the sim\'s');
{
  const up = (id, k) => WC.gearCap(D, id, k)?.cls;
  eq(['mossback_perch', 'dusk_minnow', 'rustfin_sucker'].map((id) => up(id, { bait: 'mireworm', line: 1 })), ['trophy', 'trophy', 'trophy'], 'Line T1: every grade-3 worm fish to Trophy');
  eq(['weeping_carp', 'candlefin_koi'].map((id) => up(id, { bait: 'lumen_moss', line: 1 })), ['trophy', 'trophy'], 'Lumen Moss: carp and koi to Trophy');
  eq(['likely_chub', 'lampsipper'].map((id) => up(id, { lure: 'feather_fly', line: 1 })), ['trophy', 'trophy'], 'the Feather Fly: chub and Lampsipper');
  eq(['reedjaw_pike', 'kissmark_trout'].map((id) => up(id, { lure: 'glimmer_spoon', line: 1 })), ['trophy', 'trophy'], 'the Glimmer Spoon: pike and trout');
  eq(['mossback_perch', 'overbold_bass', 'milkeye_perch'].map((id) => up(id, { lure: 'bone_jig', line: 1 })), ['trophy', 'trophy', 'trophy'], 'the Bone Jig: perch, bass, Milkeye');
  eq(['reedjaw_pike', 'thousandcast_pike', 'hullkiss_lamprey'].map((id) => up(id, { lure: 'bell_spinner', line: 2 })), ['elder', 'elder', 'elder'], 'the Spinner on T2: both pikes and the lamprey to the top');
  eq(U.saleLineId({ rows: [{}], said: { firstSale: true }, away: true }), 'firstAway', 'Murk\'s once-line after the first trip with a cap loss');
  eq(U.saleLineId({ rows: [{}], said: { firstSale: true, firstAway: true }, away: true }), null, '… once');
  eq(U.saleLineId({ rows: [], said: {}, empty: true, away: true }), 'firstAway', '… an empty hold too');
  eq(U.saleLineId({ rows: [{}], said: {}, away: true }), 'firstSale', '… the first sale first');
  // T104 (the game's pool is the sim's, every hook including the Bent Spoon) is tools/sim/clams.mjs's check: it reads watercraft's
  // HOOK_ITEMS, so the new column is in it; here the one function both call
  ok(typeof WC.castOdds === 'function' && WC.HOOK_ITEMS.includes('bent_spoon'), 'GG9: the sim and the game draw from the same castOdds and HOOK_ITEMS');
}

console.log(`gear-gates: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
