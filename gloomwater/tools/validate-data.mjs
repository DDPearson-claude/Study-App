#!/usr/bin/env node
// tools/validate-data.mjs — schema & consistency validation for src/data.js.
// Checks CONTRACT.md §8 (hybrid sail · fish · survive the swarm) plus the cross-references
// DESIGN.md relies on. Usage:  node tools/validate-data.mjs   (exit code 1 on any failure)
//
// Three passes: (1) the v1 tables with WALK_ENABLED and V3_ENABLED off — every v1 table must stay exactly as v1
// (QA §24.13 #1); (2) a child process with `--walk` re-checks every table with the walking build on and runs the v2
// map checks (DESIGN §24, CONTRACT §12); (3) a child process with `--v3` re-checks everything with the walking AND
// the v3 builds on (BRIEF-v3, DESIGN §25, CONTRACT §13) and runs the v3 rules; (4) a child process with `--loop` evaluates the
// Full Hold's build (GW_V3, GW_V3_PHASE 1, GW_LOOP; slice-1a PLAN §4.3) and runs the LOOP rules only. `--v1` skips passes 2–4;
// `--walk` runs pass 2 only; `--v3` runs pass 3 only; `--loop` runs pass 4 only.
const V3 = process.argv.includes('--v3');
const WALK = process.argv.includes('--walk') || V3;   // v3 is designed on top of §24: pass 3 runs both builds

// ---------------------------------------------------------------------------- the v3-without-loop fingerprint (slice 1a, PLAN §4.3)
// tools/tests/v3-exports.json hashes every export of data.js in the two v3 builds with GW_LOOP unset: phase 1 with walking off
// (`p1`, the loop's own data before its switch) and phase 4 with walking on (`walk`, pass 3's build). It was written once, from
// the merged base's untouched data.js, by the one-shot `--write-v3-fingerprint`, which refuses to overwrite the file. Pass 3
// asserts both builds still match it, so v3-without-loop data is proven unchanged by the loop. Never refreshed in place.
const V3_FP_PATH = new URL('./tests/v3-exports.json', import.meta.url);
// the originality scans' word lists (pass 1's for every display string, pass 3's v3 guardrails, brief §13.3), shared with pass 4
const ORIGINALITY_BANNED = /\b(hollow ?knight|hallownest|geo|soul|charms?|vessels?|grubs?|husks?|lumafly|dreamers?|mourner|greenpath|archives|masks?|shades?)\b/i;
const ORIGINALITY_V3 = [/\bpale\s+[A-Z][a-z]+/, /\bcollector\b/i, /bottled light/i, /\b(bronze|silver|gold|diamond)\s+(medal|tier|rank)\b/i, /\b(morphs?|aberrant|aberration|sanity|panic|spoil(ed|age)?)\b/i, /\bmarrow\b/i, /\bhallow/i];
/** Fresh module instances of the two v3 builds (GW_LOOP unset), the flags put back after. */
async function v3FingerprintBuilds() {
  const keep = { walk: globalThis.GW_WALK, v3: globalThis.GW_V3, phase: globalThis.GW_V3_PHASE, loop: globalThis.GW_LOOP };
  const put = (k, v) => { if (v === undefined) delete globalThis[k]; else globalThis[k] = v; };
  try {
    delete globalThis.GW_LOOP;
    globalThis.GW_WALK = false; globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
    const p1 = await import('../src/data.js?v3fp-p1');
    globalThis.GW_WALK = true; globalThis.GW_V3 = true; delete globalThis.GW_V3_PHASE;
    const walk = await import('../src/data.js?v3fp-walk');
    return { p1, walk };
  } finally {
    put('GW_WALK', keep.walk); put('GW_V3', keep.v3); put('GW_V3_PHASE', keep.phase); put('GW_LOOP', keep.loop);
  }
}
if (process.argv.includes('--write-v3-fingerprint')) {
  const fs = await import('node:fs');
  if (fs.existsSync(V3_FP_PATH)) {
    console.log(`validate-data --write-v3-fingerprint: ${V3_FP_PATH.pathname} exists; it is written once and never overwritten`);
    process.exit(1);
  }
  const { fingerprint } = await import('./fingerprint.mjs');
  const { execSync } = await import('node:child_process');
  const B = await v3FingerprintBuilds();
  if (B.p1.V3_ENABLED !== true || B.p1.V3_PHASE !== 1 || B.p1.WALK_ENABLED !== false || B.walk.V3_ENABLED !== true || B.walk.WALK_ENABLED !== true) {
    console.log('validate-data --write-v3-fingerprint: the two v3 builds did not evaluate with the expected flags'); process.exit(1);
  }
  const names = [...new Set([...Object.keys(B.p1), ...Object.keys(B.walk)])].sort();
  let from = 'unknown';
  try { from = execSync('git rev-parse --short HEAD', { cwd: new URL('..', import.meta.url), encoding: 'utf8' }).trim(); } catch { /* not a checkout */ }
  const REF = {
    from,
    note: 'per-export hash of src/data.js in the v3 builds with GW_LOOP unset (p1: GW_V3_PHASE 1, walking off; walk: phase 4, walking on); validate-data pass 3 asserts both; written once by --write-v3-fingerprint, never refreshed',
    names, p1: fingerprint(B.p1, names), walk: fingerprint(B.walk, names), written: new Date().toISOString().slice(0, 10),
  };
  fs.writeFileSync(V3_FP_PATH, JSON.stringify(REF, null, 1) + '\n');
  console.log(`validate-data --write-v3-fingerprint: ${names.length} exports of the two v3 builds written to tools/tests/v3-exports.json (from ${from})`);
  process.exit(0);
}
// ---------------------------------------------------------------------------- pass 4: the Full Hold (slice-1a PLAN §4.3, T41, T72, T84)
// Its own process: GW_V3, GW_V3_PHASE 1 and GW_LOOP set, GW_WALK unset, data.js?loop, the LOOP rules only, then exit. Nothing here
// runs in passes 1–3 (which assert the loop is off).
if (process.argv.includes('--loop')) {
  delete globalThis.GW_WALK;
  globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_LOOP = true;
  const L4 = await import('../src/data.js?loop');
  const WLY = await import('../src/world-layout.js');
  const { murkHold } = await import('../src/first-evening.js');
  const PLM = await import('../src/progression-loop.js');
  const errs = [], warns = [];
  let n = 0;
  const ok4 = (c, m) => { n++; if (!c) errs.push(m); return !!c; };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const num4 = (v) => typeof v === 'number' && Number.isFinite(v);
  const inR = (v, lo, hi) => num4(v) && v >= lo - 1e-12 && v <= hi + 1e-12;
  const { LOOP: LP, TEXT_LOOP: TL, PARKED: PK } = L4;
  // the build
  ok4(L4.V3_ENABLED === true && L4.V3_PHASE === 1 && L4.WALK_ENABLED === false && L4.LOOP_ENABLED === true, 'the loop build: V3_ENABLED, V3_PHASE 1, no walking, LOOP_ENABLED');
  const KEYS = 'swarm combat levels embers hunger oilAsLife nightModes death days farWater liveWell meta tolls longDescent challenges quality mercy passFavour baitAttract murkInLake runShop residents weather walking giantSpots watchLamps arrivalHush eatRender bounties firstCatchShells proofs'.split(' ');
  ok4(Object.isFrozen(PK) && same(Object.keys(PK).sort(), KEYS.slice().sort()) && Object.values(PK).every((v) => v === true), `PARKED has exactly the 31 keys of PLAN §3.1, all true (got ${Object.keys(PK).length})`);
  ok4(L4.TEXT.loop === TL, 'TEXT.loop === TEXT_LOOP');
  // T30 (A side): no Elder water and no watch lamps in any lake under the loop
  for (const z of L4.ZONES) ok4(!(z.arena.giantSpots || []).length && !(z.arena.watchLamps || []).length, `${z.id}: no giantSpots and no watchLamps under the loop (T30)`);
  // the hold ladder (SPEC §4.2) and the 1a shelf
  const H = LP.hold;
  ok4(H.start === 3 && H.max === 8 && H.shelfMax === 6 && H.startName === 'Wicker Creel', 'LOOP.hold: 3 to 8, the shelf to Hold 6 (M1 step 3a: the Wellbox, M1 §2.5)');
  ok4(same(H.ladder.map((s) => s.slots), [4, 5, 6, 7, 8]) && same(H.ladder.map((s) => s.price), [200, 500, 1000, 2000, 3500]) && H.ladder.every((s) => typeof s.name === 'string' && s.name),
    'LOOP.hold.ladder: slots 4..8 in order, prices 200 · 500 · 1,000 · 2,000 · 3,500, each named (the user, 17 Nov 2026: "Make it 400 to start": Hold 4 at 200, shown 400)');
  // tackle (SPEC §4.3): the prices and TACKLE T0–T4's Hold as the table states it
  const TK = LP.tackle;
  ok4(same(TK.price, [0, 50, 300, 1200, 6000, 32000, 100000]), 'LOOP.tackle.price: 0 · 50 · 300 · 1,200 · 6,000 · 32,000 · 100,000');
  ok4(same(TK.extraHold, { rod: [15, 18], line: [16, 19], reel: [15, 18] }) && [5, 6].every((t) => (TK.names[t] || []).length === 3), 'T5 and T6: Hold 15/16/15 and 18/19/18, three names each');
  ok4(same(['rod', 'line', 'reel'].map((s) => L4.TACKLE[s].map((t) => t.hold)), [[0, 2, 5, 8, 12], [0, 2, 5, 9, 13], [0, 2, 5, 8, 12]]), "TACKLE T0–T4's Hold equals SPEC §4.3's table");
  ok4(TK.shelfAt.length === TK.price.length && TK.shelfAt[6] === 9 && TK.shelfAt.slice(0, 3).every((w) => w === 1), 'v8 (T84): LOOP.tackle.shelfAt[6] === 9; T0–T2 on the first shelf');
  // quiet water (SPEC §3.3) and let go (§3.2)
  ok4(same(LP.water, { good: { day: 2, old: 3, night: 2, crown: 2 }, openPerSlot: 1, openExtra: 1, stale: { favour: -0.15, floor: -1.2, wait: 0.3, waitMax: 2.2 } }), 'LOOP.water: the good bites and quiet water of SPEC §3.3');
  ok4(same(LP.letGo, { favour: 0.2, cap: 0.4, refund: 1 }), 'LOOP.letGo: +0.2 to +0.4, the bite back');
  ok4(same(L4.quietTerms(1), { over: 1, favour: -0.15, waitMult: 1.3 }), 'quietTerms(1): the 5th bite at 4 good bites (CHOICE 17), −0.15 and ×1.3');
  ok4(same(L4.quietTerms(8), { over: 8, favour: -1.2, waitMult: 2.2 }), 'quietTerms(8) (the 12th bite at 4): floors at −1.2 with ×2.2');
  ok4(L4.goodBitesFor({ kind: 'open', holdSlots: 3 }) === 4 && L4.goodBitesFor({ kind: 'open', holdSlots: 8 }) === 9, 'open water: one good bite per slot, plus one (4 to 9)');
  // the evening (§3.4) and its hours
  ok4(LP.evening.day === 40 && LP.evening.dusk === 20 && LP.evening.night === null && num4(LP.evening.nightLook) && LP.evening.nightLook > 0, 'LOOP.evening: 40 / 20 / null (no end), a night look > 0');
  const PH = ['calm', 'dusk', 'gloomtide', 'dawn'];
  ok4(Object.values(LP.hours).every((v) => Array.isArray(v) && v.length && v.every((p) => PH.includes(p))) && ['calm', 'gloom', 'dawn'].every((b) => !(b in LP.hours)), "LOOP.hours: the roster's strings only, each a list of built phases");
  // value (§4.1)
  const SPX = (id) => L4.SPECIES_BY_ID[id];
  ok4(L4.fishClams(SPX('dusk_minnow'), 0.4) === 7, `fishClams(dusk_minnow, 0.4) === 7 on its roster L50 (got ${L4.fishClams(SPX('dusk_minnow'), 0.4)})`);
  ok4(L4.fishClams(SPX('belled_matriarch'), 0) === null, 'a legend is never priced by size');
  ok4(LP.waters.mossmere.tier === 7 && LP.waters.mossmere.prices.crown === 500 && LP.value.legendRematch === 0.4, "the Mossmere: tier 7, the Matriarch's crown 500, later ×0.4");
  ok4(num4(LP.priceFactor) && LP.priceFactor > 0, 'LOOP.priceFactor is a positive number (1 in 1a)');
  ok4(LP.time.show === 0 && ['out', 'between', 'raftSpeed', 'home', 'sale', 'shop', 'pass'].every((k) => num4(LP.time[k]) && LP.time[k] > 0), 'LOOP.time: show 0 (CHOICE 15), the other legs positive');
  // v8, the three keys (T84)
  const items = PLM.shelfItems(L4, { ...PLM.freshLoop(L4), holdSlots: H.max, tackle: { rod: 0, line: 0, reel: 0 } });
  for (const [w, id] of Object.entries(LP.access.gear)) {
    const [slot, lvl] = String(id).split(':'), t = Number(lvl);
    ok4(L4.ZONE_BY_ID[w] && (slot === 'hold' ? H.ladder.some((s) => s.slots === t) : ['rod', 'line', 'reel'].includes(slot) && Number.isInteger(t) && t >= 1 && t < TK.price.length),
      `v8 (T84): LOOP.access.gear.${w} = '${id}' names a shelf item of LOOP`);
  }
  ok4(items.length >= 0 && same(Object.keys(LP.access.pull).sort(), ['cap', 'floorFrom', 'keeperFloor', 'perEvening', 'sureFrom']), 'v8 (T84): LOOP.access.pull has perEvening, cap, keeperFloor, floorFrom, sureFrom');
  ok4(same(LP.access.list, { kinds: ['open', 'day', 'old'], plainBaitOnly: true }), 'v8: the list rule (SPEC §5.5 (c))');
  ok4(same(PLM.listFor(L4, 'mossmere'), LP.species.mossmere), `v8 (T81): the Mossmere's list is its ${LP.species.mossmere.length} open-water fish, computed (got ${PLM.listFor(L4, 'mossmere').length})`);
  ok4(LP.species.mossmere.length === 12, "M1 step 3a: the Mossmere's list page counts 12 with the Kissmark Trout (M1.md §2.3, SPEC §5.5 (c))");
  // ---- M1 step 2 (SPEC §13, M1.md §4 step 2): the converter, the allow-list, SPECIES_LOOP, LOOP.shipped, the names rule
  {
    const fs = await import('node:fs');
    const RS = await import('../src/roster-species.js');
    const { exportText, SHIPPED } = await import('./roster-export.mjs');
    const { REAL_NAMES } = await import('./sim/roster-check.mjs');
    const ROSTER = JSON.parse(fs.readFileSync(new URL('../docs/loop/roster.json', import.meta.url), 'utf8'));
    const SL = L4.SPECIES_LOOP, ids = SL.map((x) => x.id), SZK = L4.BALANCE_V3.size.k;
    // M1 step 3a: the open water's twelve, then each place's own fish and its giant in the Chart's order (LOOP.places' own, giant)
    // (a secret place's own fish are far waters' guests, never the Mossmere's roster records: LOST-TACKLE §5.1)
    const placeFish = L4.loopPlaceIds('mossmere').filter((p) => LP.places[p].secret !== true).flatMap((p) => [...(LP.places[p].own || []), ...(LP.places[p].giant ? [LP.places[p].giant] : [])]);
    ok4(same(ids, [...LP.species.mossmere, ...placeFish]), `SPECIES_LOOP is LOOP.species.mossmere, then the places' own fish and giants, in order (${ids.join(', ')})`);
    ok4(same(L4.SPECIES.slice(0, SL.length).map((x) => x.id), ids) && SL.every((x) => L4.SPECIES_BY_ID[x.id] === x), 'SPECIES holds SPECIES_LOOP in place of the built records, ahead of the rest');
    ok4(L4.SPECIES.filter((x) => x.zone === 'mossmere' && !ids.includes(x.id)).every((x) => x.rarity === 'legendary' || (x.bait && x.bait !== LP.waters.mossmere.plainBait)), 'the Mossmere\'s other fish (the Gloam Eel, the Matriarch) are a one-tin fish or the legend: off the list (M1.md §2.3)');
    ok4(same(SHIPPED.slice().sort(), ids.filter((id) => !LP.kept.includes(id)).sort()) && LP.kept.every((id) => L4.SPECIES_V3_BY_ID[id] && !ROSTER.fish.some((f) => f.id === id)),
      'the roster ships its eight (tools/roster-export.mjs SHIPPED) and the three built species the roster keeps (LOOP.kept)');
    // the worked values of SPEC §4.1 on the roster sizes
    const SPX = (id) => L4.SPECIES_BY_ID[id];
    ok4(L4.fishClams(SPX('weeping_carp'), 0.4) === 26, `a Keeper Weeping Carp (z 0.4) sells for 26 on its roster L50 (got ${L4.fishClams(SPX('weeping_carp'), 0.4)})`);
    ok4(same([1.4, 2.2, 2.95].map((z) => L4.fishClams(SPX('reedjaw_pike'), z)), [158, 406, 1022]), `a Reedjaw Pike sells for 158 / 406 / 1,022 at Prize, Trophy, Elder (got ${[1.4, 2.2, 2.95].map((z) => L4.fishClams(SPX('reedjaw_pike'), z)).join(' / ')})`);
    // the phase pin: the Lampsipper lifted, no other phase-2 record
    ok4(L4.V3_PHASE === 1 && same(L4.SPECIES.filter((x) => (x.phase ?? 1) > 1).map((x) => x.id), ['lampsipper', 'bridgechain_sturgeon']) && SPX('lampsipper')?.loopLift === true
      && SPX('bridgechain_sturgeon')?.loopLift === true && !('weather' in SPX('bridgechain_sturgeon')),
      'under GW_V3_PHASE 1 the Lampsipper and (M1 step 3a) the Bridgechain are in loop SPECIES (lifted past the phase pin, no weather), and no other phase-2 record is');
    // the allow-list: src/roster-shipped.js is a fresh export, cut to ROSTER_KEYS; the converter on it equals the converter on roster.json
    ok4(fs.readFileSync(new URL('../src/roster-shipped.js', import.meta.url), 'utf8') === exportText(ROSTER), 'src/roster-shipped.js is a fresh export of roster.json (node tools/roster-export.mjs)');
    const { ROSTER_SHIPPED } = await import('../src/roster-shipped.js');
    ok4(ROSTER_SHIPPED.fish.every((f) => Object.keys(f).every((k) => RS.ROSTER_KEYS.includes(k))), 'every shipped roster record holds only the allow-list\'s fields');
    const opts = { k: SZK, legendStyle: L4.CATCH_V3.legend.style, items: RS.rosterItemNames(L4), art: L4.ROSTER_ART, waters: ['mossmere'] };
    const strip = (x) => { const { difficulty, weight, night, ...r } = x; return r; };
    const byIdOrder = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);   // roster.json's order is not SHIPPED's (the giants come first there)
    const full = RS.rosterSpecies(ROSTER, L4.SPECIES_V3, { ...opts, ids: SHIPPED }).sort(byIdOrder), cut = RS.rosterSpecies(ROSTER_SHIPPED, L4.SPECIES_V3, { ...opts, ids: SHIPPED }).sort(byIdOrder);
    ok4(same(full.map(strip), cut.map(strip)), 'the converter gives the same fish from roster.json and from the allow-listed export (nothing it reads is cut)');
    // every shipped fish on its plan; k is its body's; weights within ±30% of the cousin (pounds SPEC §6.4)
    const KEPT_REF = { gutter_crayfish: { kg: 0.03 * 19 ** 3 / 1000, cm: 19, source: 'signal crayfish (pounds SPEC §6.2: 0%)' }, lampsipper: { kg: 0.0105 * 26 ** 3.08 / 1000, cm: 26, source: 'roach (pounds SPEC §6.2)' },
      candlefin_koi: { kg: (3 * 16 + 10) * 0.0283495, cm: 46, source: 'koi 3 lb 10 oz (pounds SPEC §6.2)' },
      bridgechain_sturgeon: { kg: (5 * 16 + 5) * 0.0283495, cm: 70, source: 'white sturgeon 5 lb 5 oz (pounds SPEC §6.2: −14%)' } };
    for (const x of SL) {
      const body = x.size?.body, k = SZK[body];
      ok4(L4.FISH_SHAPES.includes(x.model?.shape) && typeof k === 'number' && x.size.k === k, `${x.id}: on a built plan (${x.model?.shape}) and its k is its body's (${body} ${k})`);
      ok4(!REAL_NAMES.includes(body) && /^[a-z]+$/.test(body), `${x.id}: its body key "${body}" is a plain word, never a species' own name (roster-check REAL_NAMES)`);
      ok4(inR(x.size.sigma, L4.BALANCE_V3.size.sigma[0], L4.BALANCE_V3.size.sigma[1]) && x.weight[0] < x.weight[1] && same(x.depth, [0, 1]), `${x.id}: σ in range, a weight range, any depth`);
      ok4(L4.FISH_STYLES.includes(x.style) && L4.FISH_FAMILIES.includes(x.family) && L4.WEATHER.includes(x.prefers) && (x.time in LP.hours || ['calm', 'gloom', 'any'].includes(x.time)), `${x.id}: style, family, weather and hours are known words`);
      const rf = ROSTER.fish.find((f) => f.id === x.id), ref = rf ? rf.refWeight : KEPT_REF[x.id];
      const w = ref ? k * x.size.L50 ** 3 / 1000 : NaN, r = ref ? ref.kg * (x.size.L50 / ref.cm) ** 3 : NaN;
      ok4(ref && Math.abs(w / r - 1) <= 0.3, `${x.id}: ${w.toFixed(3)} kg at its L50 ${x.size.L50} cm is within ±30% of its cousin's ${r.toFixed(3)} kg (${ref ? Math.round((w / r - 1) * 100) : '—'}%)`);
    }
    // LOOP.shipped (decision 39): the Mossmere; no lake map past it is offered, no sheet past it is drawn
    ok4(LP.shipped === 'mossmere' && L4.loopShippedOrder() === 1 && L4.loopShipped('mossmere') && !L4.loopShipped('sporewood'), "LOOP.shipped is the Mossmere (order 1): Sporewood is sealed");
    // the names rule (SPEC §0 row 17, §13 allow-list): no research field, episode title, research name, series or presenter in src/ or
    // the built file (index.html); plain family words that are also a research row's whole name (carp, catfish) are the game's own
    const R = JSON.parse(fs.readFileSync(new URL('../docs/loop/research/river-monsters-fish.json', import.meta.url), 'utf8'));
    const GENERIC = new Set(['carp', 'catfish', 'unidentified fish', 'small fish', 'lost fish', 'small one', 'the giants']);   // plain words a research row uses as its whole name, never a name of its own
    const terms = new Map(), add = (kind, t) => { t = String(t || '').trim().toLowerCase(); if (t.length >= 4 && !GENERIC.has(t)) terms.set(t, kind); };
    const shortT = (t) => String(t).replace(/^River Monsters:? /, '').replace(/ \((?:international title|Extended Cut|two-hour)[^)]*\)$/i, '').trim();
    for (const e of R.episodes) {
      add('an episode title', e.title); add('an episode title', shortT(e.title));
      for (const a of e.animals || []) { add('a research name', String(a.common || '').replace(/\s*\(.*?\)\s*/g, ' ')); const b = String(a.scientific || '').match(/\b([A-Z][a-z]+ [a-z]{3,})\b/); if (b) add('a scientific name', b[1]); }
    }
    for (const f of ROSTER.fish) for (const i of f.inspiredBy || []) add('a research name', String(i.common || '').replace(/\s*\(.*?\)\s*/g, ' '));
    const files = fs.readdirSync(new URL('../src/', import.meta.url)).map((f) => ['src/' + f, new URL('../src/' + f, import.meta.url)]);
    const idx = new URL('../index.html', import.meta.url);
    if (fs.existsSync(idx)) files.push(['index.html', idx]);
    const escR = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const FIELDS = ['giantOf', 'gotAwayOf', 'inspiredBy', 'refWeight'];
    const res = [...terms].map(([t, kind]) => [new RegExp(`(^|[^a-z])${escR(t)}($|[^a-z])`), t, kind]);
    let scanned = 0;
    for (const [name, url] of files) {
      const text = fs.readFileSync(url, 'utf8'), low = text.toLowerCase(); scanned++;
      for (const fld of FIELDS) ok4(!new RegExp(`\\b${fld}\\b`).test(text), `${name}: no ${fld} field (it stays in docs/)`);
      const m = text.match(/River Monsters|Jeremy|\bWade\b/);
      ok4(!m, `${name}: names neither the series nor its presenter${m ? ` ("${m[0]}")` : ''}`);
      const hit = res.find(([re]) => re.test(low));
      ok4(!hit, `${name}: no research name or episode title${hit ? ` (${hit[2]}: "${hit[1]}")` : ''}`);
    }
    ok4(scanned > 50 && terms.size > 300, `the names rule scanned ${scanned} files for ${terms.size} research names and titles`);
  }
  // ---- M1 step 3a's seam (docs/loop/m1-step3a/PLAN.md §2.0, §3.1; T101–T103 and T118's shapes): the places, the giants, the words
  {
    // (the four place maps; a secret place, Veilback Brook, is checked on its own below: LOST-TACKLE §5)
    const PLC = LP.places, ids = L4.loopPlaceIds('mossmere').filter((id) => PLC[id].secret !== true), M3 = L4.MOSSMERE_V3.places;
    const secretIds = L4.loopPlaceIds('mossmere').filter((id) => PLC[id].secret === true);
    ok4(same(ids, ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool']) && same(ids.map((id) => PLC[id].kind), ['day', 'old', 'night', 'crown']),
      'T101: LOOP.places holds the four, in the Chart\'s order (day, old, night, crown)');
    ok4(ids.every((id) => PLC[id].price === LP.waters.mossmere.prices[PLC[id].kind]) && same(ids.map((id) => PLC[id].price), [60, 150, 260, 500]),
      'T101: each place map\'s price is LOOP.waters.mossmere.prices[kind] (60, 150, 260, 500)');
    ok4(ids.every((id) => { const p = L4.loopPlace(id), r = M3.find((x) => x.id === id); return p && r && p.name === r.name && same(p.landmark, r.landmark) && same(p.area, r.water) && p.water === 'mossmere'; }),
      'T101: loopPlace merges MOSSMERE_V3\'s geometry, name and landmark under LOOP.places\' fields');
    ok4(L4.loopPlace('nowhere') === null && !('places' in LP.waters.mossmere), 'T101: loopPlace(unknown) is null; LOOP.waters.mossmere has no places (migrateLoop rule 5 stays a no-op)');
    const arena = L4.ZONES[0].arena.places || [], KEYS = [...L4.LOOP_PLACE_KEYS, 'kind', 'zone'];
    const DROPPED = ['rule', 'attract', 'maxClass', 'giantsKept', 'holdsGiants', 'giantsWhile', 'giantsDuring', 'reveal', 'tally', 'tallyAt', 'legend', 'night', 'phase'];
    ok4(same(arena.map((p) => p.id), [...ids, ...secretIds]) && same(L4.PLACES.map((p) => p.id), [...ids, ...secretIds]) && [...ids, ...secretIds].every((id) => L4.PLACE_BY_ID[id]?.kind === PLC[id].kind),
      'T101: under the loop the arena\'s places and PLACES are the four and the secret brook, with their kinds');
    // LOST-TACKLE §5 (lanes W and C): each secret place is free, never a map card, shown by a lost notebook whose `reveals` names it, has its
    // own good bites and its only-pool (its own fish each a record or a roster fish still to come with L4's guests; its draws open-water
    // fish of the Mossmere), its geometry record under the loop only, and the arena's shoreNotch is its cut
    ok4(same(secretIds, ['veilback_brook']), 'LOST-TACKLE §5: the one secret place is Veilback Brook');
    const ROSTER_IDS = new Set(JSON.parse((await import('node:fs')).readFileSync(new URL('../docs/loop/roster.json', import.meta.url), 'utf8')).fish.map((f) => f.id));
    for (const id of secretIds) {
      const p = PLC[id], rec = M3.find((x) => x.id === id), N = (L4.ZONES[0].arena.shoreNotch || [])[0];
      ok4(p.price === 0 && p.kind === 'day' && p.only === true && Number.isInteger(p.good) && p.good === 1 && LP.lostTackle?.[p.revealedBy]?.reveals === id, `${id}: free, a day place with 1 good bite and its own pool, shown by ${p.revealedBy}`);
      ok4(!PLM.mapCards(L4, { maps: { lakes: ['mossmere'], places: [] } }).some((c) => c.placeId === id), `${id}: never a map card`);
      ok4(!!rec && rec.secret === true && same(rec.needs?.shoreNotch && { a: rec.needs.shoreNotch.a, w: rec.needs.shoreNotch.w, len: rec.needs.shoreNotch.len }, N && { a: N.a, w: N.w, len: N.len }) && N.place === id, `${id}: its record under the loop, the arena's shoreNotch its cut`);
      for (const o of p.own || []) ok4((L4.SPECIES_BY_ID[o] && !L4.SPECIES_BY_ID[o].giant) || ROSTER_IDS.has(o), `${id}: its own fish ${o} is a record or a roster fish`);
      for (const d of Object.keys(p.draws || {})) ok4(L4.SPECIES_BY_ID[d]?.zone === 'mossmere' && !L4.SPECIES_BY_ID[d].place && (L4.SPECIES_BY_ID[d].kind ?? 'open') === 'open', `${id}: it draws ${d}, an open-water fish of the Mossmere`);
      const pools = ['calm', 'dusk', 'gloomtide'].map((ph) => L4.placePool(L4.SPECIES, { placeId: id, phase: ph }));
      ok4(pools.every((q) => q.place === id && q.list.length > 0 && q.list.every(([x]) => [...(p.own || []), ...Object.keys(p.draws || {})].includes(x.id))), `${id}: it bites in every light, only its own fish and its draws`);
    }
    ok4(arena.every((p) => Object.keys(p).every((k) => KEYS.includes(k)) && DROPPED.every((k) => !(k in p))), `T101: no arena place carries a v3 rule (${DROPPED.join(', ')})`);
    for (const id of ids) {
      const p = PLC[id], card = L4.SPECIES_BY_ID[p.card];
      ok4(card && card.zone === 'mossmere', `${id}: its card's fish (${p.card}) is a loop species of the Mossmere`);
      if (p.giant) ok4(L4.SPECIES_BY_ID[p.giant]?.giant === true && L4.SPECIES_BY_ID[p.giant].place === id && L4.SPECIES_BY_ID[p.giant].rarity === 'epic', `${id}: its giant ${p.giant} is an epic giant whose place is ${id}`);
      for (const o of p.own || []) ok4(L4.SPECIES_BY_ID[o]?.place === id && !L4.SPECIES_BY_ID[o].giant, `${id}: its own fish ${o} has that place`);
      if (p.legend) ok4(L4.SPECIES_BY_ID[p.legend]?.rarity === 'legendary', `${id}: its legend ${p.legend}`);
      for (const d of Object.keys(p.draws || {})) ok4(L4.SPECIES_BY_ID[d] && !L4.SPECIES_BY_ID[d].place && (L4.SPECIES_BY_ID[d].kind ?? 'open') === 'open', `${id}: it draws ${d}, an open-water fish`);
    }
    // T102: the Mossmere's 17 once each; the Gloam Eel as built but for its night water
    const MS = L4.SPECIES.filter((x) => x.zone === 'mossmere');
    ok4(MS.length === 17 && new Set(MS.map((x) => x.id)).size === 17, `T102: loop SPECIES holds the Mossmere's 17 once each (got ${MS.length})`);
    const GE = L4.SPECIES_BY_ID.gloam_eel, GB = L4.SPECIES_V3_BY_ID.gloam_eel;
    ok4(GE.kind === 'night' && GE.bait === GB.bait && GE.time === GB.time && same(GE.size, GB.size) && !('kind' in GB), 'T102: the Gloam Eel bites in night water (kind night), its bait, hours and size as built; the built record untouched');
    ok4(L4.FISH_SHAPES.includes('lamprey') && L4.FISH_SHAPES.includes('sturgeon') && L4.FISH_SHAPES.includes('trout') && L4.AUTOFISH.show.poseRules.thin.includes('lamprey'), 'the three plans are FISH_SHAPES under the loop; the lamprey hangs (poseRules.thin)');
    ok4(L4.CATCH_V3.rarity.epic === L4.CATCH_V3.rarity.rare + LP.giant.fight - L4.CATCH_V3.kept && L4.CATCH_V3.elderRarity.epic === L4.CATCH_V3.elderRarity.rare + LP.giant.elderFight,
      'an epic giant fights LOOP.giant.fight over a rare, net of the place-kept term (+elderFight as an Elder)');
    // T103: the list is the twelve; nothing of a place counts
    const list = PLM.listFor(L4, 'mossmere');
    ok4(list.length === 12 && list.includes('kissmark_trout') && !list.some((id) => ['bridgechain_sturgeon', 'gloam_eel', 'thousandcast_pike', 'hullkiss_lamprey', 'belled_matriarch'].includes(id)),
      'T103: listFor(mossmere) is the twelve, with the places in PLACES: never a giant, the legend, the Bridgechain or the Gloam Eel');
    // the giants' share and the pool helpers
    const span = L4.placePool(L4.SPECIES, { placeId: 'under_the_span', phase: 'calm' }), spanDusk = L4.placePool(L4.SPECIES, { placeId: 'under_the_span', phase: 'dusk' });
    ok4(span.giant?.sp.id === 'thousandcast_pike' && span.giant.share === LP.giant.share.offHour && spanDusk.giant.share === LP.giant.share.inHour, 'placePool: the Thousandcast by day at its offHour share, at dusk its inHour share');
    const buoyDay = L4.placePool(L4.SPECIES, { placeId: 'buoy_lights', phase: 'dusk' }), openDusk = L4.placePool(L4.SPECIES, { placeId: null, phase: 'dusk' });
    ok4(buoyDay.place === null && !buoyDay.giant && same(buoyDay.list.map(([x, w]) => [x.id, w]), openDusk.list.map(([x, w]) => [x.id, w])), 'placePool: night water before dark is open water (PLAN CHOICE 3)');
    ok4(L4.giantShare(L4.SPECIES_BY_ID.thousandcast_pike, 'dusk', 'taper') <= LP.wicks.taper.giantCap, 'giantShare: Taper ×1.3, never above its cap');
    // T118's shapes: the words and the switches
    const words = (t) => String(t).trim().split(/\s+/).length;
    ok4(ids.every((id) => typeof TL.maps?.[id] === 'string' && words(TL.maps[id]) <= 8) && words(TL.shelf.heartmoss) <= 8, 'T118: the four map lines and the ball\'s shelf line, each ≤ 8 words');
    ok4(typeof TL.murk?.brook === 'string' && words(TL.murk.brook) <= 8 && TL.murk.brook.length <= 40 && !/\d/.test(TL.murk.brook), 'LOST-TACKLE §5.2: Murk\'s brook line, short, no digit');
    ok4(same(['firstMap', 'firstGiant', 'legendFirst', 'listComplete'].map((k) => TL.murk[k]), ["It's in the mist. Go and look.", 'That one had a name before you met it.',
      "Her. You brought me her. Sit down, I'll count it twice.", "Every fish in this water. I'll write that down."]), "T118: Murk's four new lines are SPEC §8.6's strings exactly");
    ok4([...ids.map((id) => TL.maps[id]), TL.shelf.heartmoss, TL.murk.firstMap, TL.murk.firstGiant, TL.murk.legendFirst, TL.murk.listComplete, TL.tabs.giants].every((t) => !/\d/.test(t)), 'T118: no new line carries a digit');
    const strings = []; const walk = (v) => { if (typeof v === 'string') strings.push(v); else if (v && typeof v === 'object') for (const x of Object.values(v)) walk(x); };
    // (WC-1: the gear log's "<1%" is SPEC §8.11's one share word; LOST-TACKLE §6.2: the gear log's "Bites come {p}% sooner." the other, both the log's only)
    walk({ ...TL, log: { ...(TL.log || {}), under: '' }, lost: { ...(TL.lost || {}), log: { ...(TL.lost?.log || {}), wait: '' } } }); walk(LP);
    ok4(!strings.some((t) => t.includes('%')), 'T118: no percentage literal anywhere in TEXT_LOOP or LOOP (but the gear log\'s "<1%", SPEC §8.11, and "Bites come {p}% sooner.", LOST-TACKLE §6.2)');
    ok4(LP.redress === true && LP.legendBait.mossmere.id === 'heartmoss' && LP.legendBait.mossmere.price === 60 && LP.hold.shelfMax === 6 && TL.comingSoon === 'Coming soon',
      'T118: LOOP.redress is true (on by default in the loop, the user\'s yes of 17 Nov 2026), the Heartmoss Ball 60, the shelf to Hold 6, "Coming soon"');
    // T118: each map card's fish bites at its place (its pool there in some light: the giant's share, a drawn or own fish; the legend
    // on her water's legend bait, her place's crown)
    const LIGHTS = ['calm', 'dusk', 'gloomtide'];
    for (const id of ids) {
      const p = PLC[id], sp = L4.SPECIES_BY_ID[p.card];
      const bites = sp?.rarity === 'legendary' ? p.legend === sp.id && sp.bait === LP.legendBait[p.water]?.id
        : LIGHTS.some((ph) => { const pool = L4.placePool(L4.SPECIES, { placeId: id, phase: ph, bait: sp?.bait ?? null }); return pool.place === id && (pool.giant?.sp.id === sp?.id || pool.list.some(([x]) => x.id === sp?.id)); });
      ok4(!!sp && bites, `T118: ${id}'s map card names ${p.card}, which bites there${sp?.rarity === 'legendary' ? ' (her sure bite on the ' + sp.bait + ')' : ''}`);
    }
  }
  // ---- M1 step 5c (lane 5C; docs/loop/FINDS.md §10's checks): LOOP.finds, its words and the 1% rule's shape
  {
    const FD = LP.finds, its = Array.isArray(FD?.items) ? FD.items : [], zoneIds = L4.ZONES.map((z) => z.id);
    ok4(!!FD && its.length > 0, 'LOOP.finds: a table of finds');
    ok4(new Set(its.map((i) => i.id)).size === its.length, 'LOOP.finds: every id unique');
    ok4(its.every((i) => zoneIds.includes(i.water)), 'LOOP.finds: every find\'s water is a water of the road');
    const SLOTS = ['bow_post', 'cabin_windows', 'stern_deck', 'wick_rod', 'raft_stern_post', 'barge_window_boxes'];
    for (const w of [...new Set(its.map((i) => i.water))]) {
      const set = its.filter((i) => i.water === w);
      ok4(JSON.stringify(set.filter((i) => i.kind === 'treasure').map((i) => i.grade).sort()) === JSON.stringify(['fine', 'jackpot', 'plain', 'precious', 'rare']), `LOOP.finds ${w}: five treasures, one per grade`);
      ok4(JSON.stringify(set.filter((i) => i.kind === 'part').map((i) => i.effect).sort()) === JSON.stringify(['bait', 'bite', 'order']), `LOOP.finds ${w}: three parts, one of each effect`);
      ok4(set.filter((i) => i.kind === 'look').length === 3 && new Set(set.filter((i) => i.kind === 'look').map((i) => i.wearer)).size === 3, `LOOP.finds ${w}: three looks, one per wearer`);
      ok4(set.filter((i) => i.kind === 'part' || i.kind === 'look').every((i) => SLOTS.includes(i.slot)), `LOOP.finds ${w}: every part's and look's slot is known`);
      ok4(set.every((i) => ['treasure', 'part', 'look', 'tackle'].includes(i.kind)), `LOOP.finds ${w}: every find's kind is known (treasure, part, look, tackle)`);
      ok4(set.every((i) => ['pinch', 'both', 'alongside'].includes(i.pose) && Number(i.size) > 0), `LOOP.finds ${w}: every find has a built pose and a size`);
      const unowned = set.filter((i) => i.kind === 'part' || i.kind === 'look').length;
      ok4(FD.kind.share / unowned >= 0.01 - 1e-12, `LOOP.finds ${w}: the kind share ÷ the set's parts and looks (${(FD.kind.share / unowned).toFixed(4)}) is ≥ the jackpot's 1%`);
      const sums = [];
      const meta = (got, share, miss = null) => ({ loop: { maps: { lakes: [w] }, finds: { got, worn: {}, share: share == null ? {} : { [w]: share }, tackleMiss: miss == null ? {} : { [w]: miss } } } });
      const ids6 = set.filter((i) => i.kind === 'part' || i.kind === 'look').map((i) => i.id), tk = set.filter((i) => i.kind === 'tackle').map((i) => i.id);
      const all = (ids) => Object.fromEntries(ids.map((id) => [id, 1]));
      // (lost tackle, LOST-TACKLE §9 L1: a fresh set, the guarantee at its cap with the parts' share at its own cap, one piece left, the set owned)
      for (const m of [meta({}, null), meta(all(ids6.slice(1)), null), meta({}, FD.kind.cap), meta(all(ids6), null), meta({}, FD.kind.cap, 99),
        meta(all([...ids6, ...tk.slice(1)]), null), meta(all([...ids6, ...tk]), null), meta(all(tk.slice(1)), FD.kind.cap, 99)]) {
        const sh = L4.findShares(m, L4, w), s = Object.values(sh).reduce((a, b) => a + b, 0);
        sums.push(s);
        ok4(Object.values(sh).filter((x) => x > 0).every((x) => x >= 0.01 - 1e-12), `LOOP.finds ${w}: no find is rarer than the jackpot (a state of the set)`);
        ok4(Math.abs(sh[set.find((i) => i.grade === 'jackpot').id] - 0.01) < 1e-12, `LOOP.finds ${w}: the jackpot is exactly 1% of the snags (a state of the set)`);
      }
      ok4(sums.every((s) => Math.abs(s - 1) < 1e-9), `LOOP.finds ${w}: findShares sums to 1 for a fresh set, one short, at the cap and finished (${sums.map((s) => s.toFixed(6)).join(', ')})`);
      if (tk.length) {
        const TK = FD.tackle || {}, GU = TK.guarantee || {};
        ok4(set.filter((i) => i.kind === 'tackle').every((i) => ['rod', 'line', 'reel', 'lure', 'notebook'].includes(i.slot)), `LOOP.finds ${w}: every lost-tackle piece's slot is known (rod, line, reel, lure, notebook)`);
        ok4(TK.each >= 0.01 - 1e-12 && GU.cap > TK.each && GU.step > 0 && TK.partCap <= FD.kind.cap + 1e-12, `LOOP.finds.tackle: each piece ≥ the jackpot's 1%, the guarantee climbs to a cap above it, partCap ≤ kind.cap`);
        ok4(GU.item == null || tk.includes(GU.item) || its.some((i) => i.id === GU.item && i.kind === 'tackle'), 'LOOP.finds.tackle.guarantee.item: a lost-tackle piece');
        const topT = GU.cap + (tk.length - 1) * TK.each;
        ok4(TK.partCap - topT >= FD.kind.share - 1e-12, `LOOP.finds ${w}: with the guarantee at its cap (${topT.toFixed(2)}), partCap leaves the parts and looks at least their base share`);
        const pf2 = FD.grades.plain.share + FD.grades.fine.share;
        ok4(FD.grades.plain.share - TK.partCap * FD.grades.plain.share / pf2 >= 0.01 - 1e-12 && FD.grades.fine.share - TK.partCap * FD.grades.fine.share / pf2 >= 0.01 - 1e-12, `LOOP.finds ${w}: at partCap the plain and fine each keep ≥ 1%`);
        const sh = L4.findShares(meta({}, null), L4, w);
        ok4(tk.every((id) => Math.abs(sh[id] - TK.each) < 1e-12), `LOOP.finds ${w}: a fresh set gives each lost-tackle piece ${TK.each * 100}%`);
        const capd = L4.findShares(meta({}, null, 99), L4, w);
        ok4(GU.item == null || Math.abs(capd[GU.item] - GU.cap) < 1e-12, `LOOP.finds ${w}: the guaranteed piece climbs to its cap (${GU.cap * 100}%)`);
        for (const id of tk) ok4(LP.lostTackle?.[id]?.slot === its.find((i) => i.id === id)?.slot, `LOOP.lostTackle.${id}: its stats, under the find's own slot`);
        for (const [id, v] of Object.entries(LP.lostTackle || {})) if (v?.reveals != null) ok4(typeof v.reveals === 'string' && tk.includes(id), `LOOP.lostTackle.${id}.reveals: a place id on a piece of this water`);
        // lanes L3–L4 (LOST-TACKLE §3.2, §4): a found lure is a loop lure that is never sold; a found rod, line or reel's stats in range; a
        // notebook's boosts name its water's fish and its guest is a guest record of another water with a hook row, one area and light
        const WCx = await import('../src/watercraft.js'), HT = WCx.WATERCRAFT.mossmere.hook;
        for (const id of tk) {
          const v = LP.lostTackle[id] || {};
          if (v.slot === 'lure') ok4(LP.lures?.[id]?.found === true && L4.LURES.some((l) => l.id === id) && L4.CATCH_V3.items?.[id]?.kind === 'lure' && WCx.LURE_IDS.includes(id), `LOOP.lostTackle.${id}: a found lure (LOOP.lures found, LURES, CATCH_V3, the hook table's column)`);
          if (v.slot === 'rod') ok4(v.castMax > L4.TACKLE.rod.at(-1).castMax && v.castMax <= L4.STATS.castMax.max && v.hookWindow >= 1, `LOOP.lostTackle.${id}: casts past the shop's best (${v.castMax} m) inside the stat's range`);
          if (v.slot === 'reel') ok4(v.playMult > 0 && v.playMult < 1 - 0.05 * 6, `LOOP.lostTackle.${id}: a play under the best bought reel's (${v.playMult})`);
          if (v.slot === 'line') ok4(v.waitMult > 0 && v.waitMult < 1 && ['keeper', 'prize', 'trophy', 'elder'].includes(v.cap), `LOOP.lostTackle.${id}: a quicker wait and a class cap`);
          if (v.slot === 'notebook') {
            ok4(Object.keys(v.boost || {}).every((f) => HT.table[f] && LP.species?.[w]?.includes(f)) && Object.values(v.boost || {}).every((x) => x > 1 && x <= 2), `LOOP.lostTackle.${id}: its boosts name ${w}'s own fish, ×1–2`);
            const g = v.guest, gs = g ? L4.SPECIES_BY_ID[g.id] : null;
            if (g) ok4(gs && gs.guestOf === w && gs.zone === g.from && HT.guests?.[g.id] && g.areas.length === 1 && WCx.AREAS.includes(g.areas[0]) && g.lights.every((l) => ['day', 'dusk', 'night'].includes(l)) && g.share > 0 && g.share <= 0.05 && (LP.guests?.[w] || []).includes(g.id),
              `LOOP.lostTackle.${id}.guest: ${g.id}, a guest record of ${g.from} with a hook row, one area, its lights and a share ≤ 5%`);
          }
        }
        for (const id of LP.guests?.[w] || []) ok4(!L4.SPECIES_LOOP.some((x) => x.id === id) && L4.SPECIES_BY_ID[id]?.guestOf === w && L4.SPECIES_BY_ID[id]?.zone !== w, `LOOP.guests.${w}: ${id} is a guest (never in SPECIES_LOOP or ${w}'s own fish)`);
      }
    }
    const gs = Object.values(FD.grades || {}).reduce((a, g) => a + g.share, 0);
    ok4(Math.abs(gs - 1) < 1e-9 && FD.grades.jackpot.share === 0.01, 'LOOP.finds.grades: the shares sum to 1, the jackpot\'s exactly 0.01 (the user\'s 1%)');
    const pf = FD.grades.plain.share + FD.grades.fine.share;
    ok4(FD.grades.plain.share - FD.kind.cap * FD.grades.plain.share / pf >= 0.01 - 1e-12 && FD.grades.fine.share - FD.kind.cap * FD.grades.fine.share / pf >= 0.01 - 1e-12, 'LOOP.finds: at kind.cap the plain and fine each keep ≥ 1%');
    ok4(FD.snag.perBite > 0 && FD.snag.perBite < 0.2 && FD.snag.firstEvening === 0 && FD.snag.legendCast === 0, 'LOOP.finds.snag: perBite in (0, 0.2), none on evening 1 or a legend\'s cast');
    ok4(JSON.stringify(its.filter((i) => i.water === 'mossmere' && i.kind === 'treasure').map((i) => Math.round(LP.waters.mossmere.tier * FD.grades[i.grade].x * LP.priceFactor))) === JSON.stringify([14, 42, 105, 350, 1750]), 'LOOP.finds: the Mossmere\'s treasures sell for 14 · 42 · 105 · 350 · 1,750');
    const FW = TL.finds?.items || {};
    for (const i of its) {
      const w = FW[i.id];
      // (the lines are FINDS §5.1's verbatim: ≤ 8 words; four of them run past §10's 36 characters, so the length cap here is 44 until
      // the lead rules on the doc's own lines)
      ok4(!!w && typeof w.name === 'string' && w.name.length > 0 && typeof w.line === 'string' && w.line.trim().split(/\s+/).length <= 8 && w.line.length <= 44, `TEXT_LOOP.finds.${i.id}: a name and a line of ≤ 8 words ("${w?.line}")`);
      ok4(!ORIGINALITY_BANNED.test(`${w?.name} ${w?.line}`), `TEXT_LOOP.finds.${i.id}: the names rule`);
      // lost tackle (LOST-TACKLE §6.1): the card's one plain line and the owner's, each ≤ 8 words and ≤ 36 characters, no digits
      if (i.kind === 'tackle') {
        const fits = (x) => typeof x === 'string' && x.trim().length > 0 && x.trim().split(/\s+/).length <= 8 && x.length <= 36 && !/\d/.test(x);
        ok4(fits(w?.does) && fits(w?.line) && w.name.length <= 36 && !/\d/.test(w.name), `TEXT_LOOP.finds.${i.id}: does and line ≤ 8 words and 36 characters, no digits ("${w?.does}" · "${w?.line}")`);
        ok4(!ORIGINALITY_BANNED.test(String(w?.does)), `TEXT_LOOP.finds.${i.id}: the names rule (does)`);
      }
    }
    ok4(typeof TL.finds?.snags === 'string' && typeof TL.finds?.biteIn === 'string' && TL.finds.biteIn.includes('{n}'), 'TEXT_LOOP.finds: the row\'s heading words (Snags · 1 bite in {n})');
    ok4(['firstTreasure', 'firstPart', 'firstJackpot'].every((k) => typeof TL.murk[k] === 'string' && TL.murk[k].trim().split(/\s+/).length <= 9), "TEXT_LOOP.murk: Murk's three find lines (FINDS §9)");
    if (its.some((i) => i.kind === 'tackle')) ok4(typeof TL.murk.firstTackle === 'string' && TL.murk.firstTackle.trim().split(/\s+/).length <= 9, "TEXT_LOOP.murk.firstTackle: Murk's lost-tackle line (LOST-TACKLE §6.1)");
  }
  const T = LP.tutorial, rr = L4.BALANCE.move.raftRadius, pad = rr + 0.3;
  const clear = (Lay, a, b) => {
    const obs = [...Lay.obstacles.filter((o) => o.kind !== 'post'), ...(Lay.gateObstacles || [])];
    const len = Math.hypot(b.x - a.x, b.z - a.z), steps = Math.max(1, Math.ceil(len / 0.25));
    let worst = Infinity, at = null;
    for (let i = 0; i <= steps; i++) {
      const x = a.x + (b.x - a.x) * (i / steps), z = a.z + (b.z - a.z) * (i / steps);
      const shore = WLY.fromShore(Lay, x, z);   // (the lake's own shore: radial on a polar one, an outline's field, LAKE2 §3.1)
      let m = shore;
      for (const o of obs) m = Math.min(m, Math.hypot(x - o.x, z - o.z) - o.r);
      if (m < worst) { worst = m; at = { x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 }; }
    }
    return { worst, at };
  };
  {
    const PLC = LP.places, ids = L4.loopPlaceIds('mossmere').filter((id) => PLC[id].secret !== true), secretIds = L4.loopPlaceIds('mossmere').filter((id) => PLC[id].secret === true);
    // T118: each place's water is open in the loop's own layout (≥ 80%, the v3 place validator's rule), with no dock and not the spawn
    // within its footprint + 1.5 m (a bank's feather); each glide out toward it (data.loopSailPlan, PLAN CHOICE 7) starts at docks[0]
    // and clears every island and pillar by the raft's radius + 0.3 m
    {
      const Lay = WLY.buildLayout(L4.ZONES[0]), obsW = [...Lay.obstacles, ...(Lay.gateObstacles || [])], feather = 1.5;
      for (const id of ids) {
        const q = L4.PLACE_BY_ID[id], [x0, z0, x1, z1] = L4.walkShapeBounds(q.water, feather);
        let n = 0, open = 0, dDock = Infinity, dSpawn = Infinity;
        for (let zz = z0; zz <= z1; zz += 0.5) for (let x = x0; x <= x1; x += 0.5) if (L4.placeContains(q, x, zz)) {
          n++; if (WLY.isOpenWaterL(Lay, obsW, x, zz, 0.3)) open++;
          for (const d of Lay.docks) dDock = Math.min(dDock, Math.hypot(x - d.x, zz - d.z));
          dSpawn = Math.min(dSpawn, Math.hypot(x - Lay.spawn.x, zz - Lay.spawn.z));
        }
        ok4(n > 0 && open / n >= 0.8 && dDock > feather && dSpawn > feather, `T118: ${id}'s water is ${n ? (100 * open / n).toFixed(0) : 0}% open in the loop's layout (≥ 80%), ${dDock.toFixed(1)} m from the nearest dock and ${dSpawn.toFixed(1)} m from the spawn (each > ${feather} m)`);
        const g = L4.loopSailPlan(Lay.docks[0], { water: 'mossmere', place: id });
        let worst = Infinity, at = null;
        for (let i = 1; i < g.path.length; i++) { const c = clear(Lay, g.path[i - 1], g.path[i]); if (c.worst < worst) ({ worst, at } = c); }
        const len = g.path.slice(1).reduce((a, b, i) => a + Math.hypot(b.x - g.path[i].x, b.z - g.path[i].z), 0);
        ok4(Math.hypot(g.from.x - Lay.docks[0].x, g.from.z - Lay.docks[0].z) < 1e-9 && worst >= pad && len <= T.outDist * 1.15,
          `T118 (PLAN CHOICE 7): the glide out toward ${id} (${PLC[id].out ? 'its own path' : `${T.outDist} m toward its centre`}, ${len.toFixed(1)} m) clears every island and pillar by ≥ ${pad.toFixed(1)} m (closest ${worst.toFixed(2)} m at ${JSON.stringify(at)})`);
      }
      // LOST-TACKLE §5.3: a secret place's water is its cut's: shut in the loop's layout until its place is owned (none of it open water),
      // ≥ 80% open once it is; its own glide in (through the Sluice Veil) clears every island and pillar
      for (const id of secretIds) {
        const q = L4.PLACE_BY_ID[id], [x0, z0, x1, z1] = L4.walkShapeBounds(q.water, 0), N = Lay.notch;
        let n = 0, shut = 0, open = 0;
        for (let zz = z0; zz <= z1; zz += 0.5) for (let x = x0; x <= x1; x += 0.5) if (L4.placeContains(q, x, zz)) {
          n++; N.open = false; if (!WLY.isOpenWaterL(Lay, obsW, x, zz, 0.3)) shut++; N.open = true; if (WLY.isOpenWaterL(Lay, obsW, x, zz, 0.3)) open++; N.open = false;
        }
        ok4(!!N && N.place === id && n > 0 && shut === n && open / n >= 0.8, `LOST-TACKLE §5.3: ${id}'s water is shut until it is shown (${shut}/${n}) and ${n ? (100 * open / n).toFixed(0) : 0}% open after (≥ 80%)`);
        const G = (PLC[id].glide || []).map(([x, z]) => ({ x, z })), obs = [...Lay.obstacles, ...(Lay.gateObstacles || [])];
        let worst = Infinity;
        N.open = true;
        for (let i = 1; i < G.length; i++) for (let k = 0; k <= 40; k++) {
          const x = G[i - 1].x + (G[i].x - G[i - 1].x) * (k / 40), z = G[i - 1].z + (G[i].z - G[i - 1].z) * (k / 40);
          worst = Math.min(worst, WLY.shoreDist(Lay, x, z), ...obs.map((o) => Math.hypot(x - o.x, z - o.z) - o.r));   // (the dock posts too: no glide through a post)
        }
        N.open = false;
        ok4(G.length >= 2 && worst >= pad && WLY.notchSdf(N, G[G.length - 1].x, G[G.length - 1].z) >= 1.6, `LOST-TACKLE §5.2: the glide in to ${id} clears every island and pillar by ≥ ${pad.toFixed(1)} m (closest ${worst.toFixed(2)} m) and ends in its water`);
      }
      const og = L4.loopSailPlan(Lay.docks[0], { water: 'mossmere' }), sg = L4.sailPlan(Lay.docks[0], { x: 0, z: 0 }, T, 'mossmere');
      ok4(JSON.stringify(og) === JSON.stringify(sg), "loopSailPlan with no place is the water's own glide (1a's T66 unchanged)");
    }
  }
  // the five Wicks (WICKS §2, §3.5, §5; T72)
  const W = LP.wicks, ids = L4.CHARACTERS.map((c) => c.id);
  ok4(same(W.order, ['wick', 'taper', 'stub', 'tallow', 'ashwick']) && W.order.every((id) => ids.includes(id)) && W.order.length === 5, 'LOOP.wicks.order is the five CHARACTERS ids');
  ok4(W.order.every((id) => typeof W[id]?.passive === 'string' && new Set(W.order.map((x) => W[x].passive)).size === 5), 'five Wicks, one passive each, all different');
  ok4(W.order.every((id) => Object.keys(W[id].stats || {}).every((k) => k in L4.STATS && num4(W[id].stats[k]))), 'every LOOP.wicks stats key is a STATS key');
  ok4(same(Object.entries(W).filter(([k]) => k !== 'order').flatMap(([, K]) => Object.keys(K.stats || {})), ['lightRadius']), "the only Wick stat is Stub's light (the look)");
  ok4(W.wick.passive === 'curious' && inR(W.wick.firstMult, 1.3, 1.6) && inR(W.wick.firstFloor, 0.3, 0.6), `the Wick: firstMult in 1.3–1.6 (${W.wick.firstMult}), firstFloor in 0.3–0.6 (${W.wick.firstFloor})`);
  ok4(W.taper.passive === 'long_reach' && Number.isInteger(W.taper.firstBites) && inR(W.taper.firstBites, 1, 2) && typeof W.taper.perWater === 'boolean', 'Taper: firstBites 1–2, perWater a boolean');
  ok4(inR(W.taper.giantShare, 1.1, 1.4) && inR(W.taper.giantCap, 0.01, 0.12), `Taper (slice 2, ranges only): giantShare 1.1–1.4 (${W.taper.giantShare}), giantCap ≤ 0.12 (${W.taper.giantCap})`);
  ok4(W.stub.passive === 'moth_bright' && inR(W.stub.waitMul, 0.7, 0.85) && inR(W.stub.quietStep, 0.05, 0.1) && typeof W.stub.quietWait === 'boolean', `Stub: waitMul 0.7–0.85 (${W.stub.waitMul}), quietStep 0.05–0.1 (${W.stub.quietStep})`);
  ok4(W.tallow.passive === 'broad_back' && W.tallow.slots === 1 && Number.isInteger(W.tallow.good) && inR(W.tallow.good, 0, 2) && typeof W.tallow.everyWater === 'boolean', 'Tallow: slots === 1 (the user\'s yes), good 0–2, everyWater a boolean');
  ok4(L4.wickSlots(H.max, 'tallow') === 9 && L4.wickSlots(H.max, 'wick') === 8 && L4.loopSlots({ holdSlots: 3 }, 'tallow') === 4, 'Tallow: 4 slots at the start, 9 at Hold 8; every other Wick 3 to 8');
  ok4(W.ashwick.passive === 'burns_back' && Number.isInteger(W.ashwick.hold) && inR(W.ashwick.hold, 2, 4) && W.ashwick.hold <= (L4.CATCH_V3.buffs.runCap ?? L4.CATCH_V3.buffs.cap), `Ashwick: hold 2–4, inside the run cap (${W.ashwick.hold})`);
  ok4(same(L4.CATCH_V3.buffs.wicks.ashwick, { hold: W.ashwick.hold }) && !('tallow' in L4.CATCH_V3.buffs.wicks), "the apply block: Ashwick's tired comeback {hold} with no `on`; no Tallow buff");
  // the Wicks' words (guard 12): one name and one line each (the user, 16 November 2026: "more obvious what it does": WICKS §7.4),
  // the line ≤ 8 words and ≤ 36 characters (one row of SPEC §8.10's budget), the name one or two words; the first Chart's line per Wick
  ok4(same(Object.keys(TL.wicks).sort(), W.order.slice().sort()), 'TEXT_LOOP.wicks has one line per Wick');
  for (const [id, line] of Object.entries(TL.wicks)) ok4(typeof line === 'string' && line.trim().split(/\s+/).length <= 8 && line.length <= 36, `TEXT_LOOP.wicks.${id}: ≤ 8 words and ≤ 36 characters ("${line}")`);
  ok4(same(Object.keys(TL.passives || {}).sort(), W.order.slice().sort()), 'TEXT_LOOP.passives has one name per Wick');
  { const P = TL.passives || {}, names = W.order.map((id) => P[id]);
    ok4(names.every((x) => typeof x === 'string' && /^[A-Z][a-z]+(?:[ -][A-Z][a-z]+)?$/.test(x) && x.length <= 16) && new Set(names).size === 5, `TEXT_LOOP.passives: five different names of one or two words, ≤ 16 characters (${names.join(', ')})`);
    ok4(W.order.every((id) => (P[id] || '').toLowerCase().replace(/[ -]/g, '_') === W[id].passive), 'TEXT_LOOP.passives: each Wick\'s name is its passive\'s (WICKS §2: curious → Curious, broad_back → Broad Back)'); }
  ok4(Object.keys(TL.murk.firstChartBy || {}).every((id) => W.order.includes(id) && typeof TL.murk.firstChartBy[id] === 'string'), 'TEXT_LOOP.murk.firstChartBy keys are Wick ids');
  ok4(L4.INTRO.text[2] === TL.introLine3 && L4.INTRO.cove.text[2] === TL.introLine3, "the film's line 3 under the loop is TEXT_LOOP.introLine3 (LORE §12)");
  { const I = L4.INTRO, l = I.lines[2], cps = I.text[2].length / Math.max(0.01, l.out - l.at - I.lineFade), below = I.beats.find((b) => b.id === 'below');
    ok4(cps <= 17.5 && I.lines[3].at >= l.out + 0.2 && l.out <= I.length - 0.15 && !(l.at < below.t1 && l.out > below.t0),
      `the film's line 3 under the loop keeps A5: ${cps.toFixed(1)} characters a second (at most 17.5), one line at a time, none in "below"`); }
  // every TEXT_LOOP string: no Shells, Memories or Descent (New Descent the one exception, the user's word), and the originality scans
  const words = [];
  const walk = (v, path) => { if (typeof v === 'string') words.push([path, v]); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`); };
  walk(TL, 'TEXT_LOOP');
  for (const [path, w] of words) {
    ok4(path === 'TEXT_LOOP.newDescent' || !/shells?|memories|descent/i.test(w), `${path}: no Shells, Memories or Descent ("${w}")`);
    ok4(!ORIGINALITY_BANNED.test(w) && !ORIGINALITY_V3.some((re) => re.test(w)), `${path}: passes the originality scans ("${w}")`);
    ok4(!/\b(curious|long_reach|moth_bright|broad_back|burns_back)\b/.test(w), `${path}: no passive's code id reaches a word (guard 7)`);
  }
  ok4(Array.isArray(TL.murk.sailOut) && TL.murk.sailOut.length >= 1 && TL.murk.sailOut.every((x) => typeof x === 'string' && x), "Murk's sail-out lines rotate (at least one)");
  // MVP teach: the float's two marks taught once (src/ui-teach.js): two plain captions of at most 6 words, no number; Murk's quiet line
  ok4(['notches', 'dots'].every((k) => typeof TL.teach?.[k] === 'string' && TL.teach[k].trim().split(/\s+/).length <= 6 && !/\d|%/.test(TL.teach[k])),
    `TEXT_LOOP.teach: the notches' and the dots' captions, each ≤ 6 words and no number ("${TL.teach?.notches}" · "${TL.teach?.dots}")`);
  ok4(typeof TL.murk.firstQuiet === 'string' && TL.murk.firstQuiet.trim().split(/\s+/).length <= 9, "TEXT_LOOP.murk.firstQuiet: Murk's first quiet-water line teaches the quiet water (SPEC §8.6)");
  // the first-play guide (src/ui-guide.js): ten plain boxes, each at most 30 words, no number
  { const B = TL.guide?.boxes || {}, ids = ['welcome', 'chart', 'cast', 'bite', 'fight', 'card', 'tackle', 'home', 'murk', 'away'];
    ok4(ids.every((k) => typeof B[k] === 'string' && B[k] && B[k].trim().split(/\s+/).length <= 30 && !/\d|%/.test(B[k])) && Object.keys(B).length === ids.length,
      'TEXT_LOOP.guide.boxes: the ten guide boxes, each ≤ 30 words and no number');
    const Tc = TL.guide?.touch || {};
    ok4(Object.entries(Tc).every(([k, v]) => ids.includes(k) && typeof v === 'string' && v.trim().split(/\s+/).length <= 30 && !/\d|%/.test(v)),
      'TEXT_LOOP.guide.touch: a box\'s touch words, each ≤ 30 words and no number'); }
  // the opening's paths (T72): the arrive glide (spawn → docks[0]) and every lake's glide out from docks[0] through data.sailPlan clear
  // every island, pillar and gate stone by the raft's radius + 0.3 m and stay inside the shore by as much (T, pad and clear above)
  const intro = L4.ZONE_BY_ID[L4.INTRO?.lake || 'mossmere'] || L4.ZONES[0];
  { const Lay = WLY.buildLayout(intro), c = clear(Lay, Lay.spawn, Lay.docks[0]);
    ok4(c.worst >= pad, `T72: ${intro.id}'s arrive glide (spawn → docks[0]) clears every island and pillar by ≥ ${pad.toFixed(1)} m (closest ${c.worst.toFixed(2)} m at ${JSON.stringify(c.at)})`);
    ok4(Math.abs(Math.hypot(Lay.docks[0].x - Lay.spawn.x, Lay.docks[0].z - Lay.spawn.z) / T.arrive - LP.time.raftSpeed) <= LP.time.raftSpeed, `T72: the arrive glide runs at most twice the raft's speed (R18)`); }
  for (const z of L4.ZONES) {
    const Lay = WLY.buildLayout(z), dock = Lay.docks[0], g = L4.sailPlan(dock, { x: 0, z: 0 }, T, z.id);
    ok4(Array.isArray(g.path) && g.path.length >= 2 && Number.isFinite(g.yaw) && Math.hypot(g.from.x - dock.x, g.from.z - dock.z) < 1e-9, `T72: ${z.id}'s glide out starts at docks[0]`);
    let worst = Infinity, at = null;
    for (let i = 1; i < g.path.length; i++) { const c = clear(Lay, g.path[i - 1], g.path[i]); if (c.worst < worst) ({ worst, at } = c); }
    ok4(worst >= pad, `T72: ${z.id}'s glide out (${T.outPath?.[z.id] ? 'its outPath' : `the outDist rule, ${T.outDist} m`}) clears every island and pillar by ≥ ${pad.toFixed(1)} m (closest ${worst.toFixed(2)} m at ${JSON.stringify(at)})`);
  }
  { const Lay = WLY.buildLayout(intro); ok4(clear(Lay, { x: -50, z: 0 }, { x: 50, z: 0 }).worst < pad, 'T72 self-test: a glide straight across the lake fails the clearance check'); }
  for (const [lake, P] of Object.entries(T.outPath || {})) ok4(L4.ZONE_BY_ID[lake] && Array.isArray(P) && P.length >= 2 && P.every((q) => Array.isArray(q) && q.length === 2 && q.every(num4)), `LOOP.tutorial.outPath.${lake}: a lake's path of [x, z] points`);
  // M1 step 5a, the home barge's mooring (M1 §4 step 5a; SPEC §6.5): every LOOP.mooring entry resolves on its lake's docks; both
  // hulls and the raft clear of every island, pillar, post and gate stone, every place and its mist bank (LOOP.places' footprints +
  // 1.5 m, from step 3a; none before it) and the shore; clear of the spawn; the glide in (the hand-off from the spawn, the sail home's
  // approach, the sail home from each place) and the glide out clear of the hulls and the lake; the home camera's frame holding
  // the barge, the raft and every target at 358 px (and the other sizes the game is played at), none overlapping, each ≥ 44 px
  {
    const LR = await import('../src/loop-rules.js'), HT = await import('../src/home-targets.js');
    const B = LP.barge, rr2 = L4.BALANCE.move.raftRadius;
    ok4(B && B.length === 12 && B.beam === 3.6 && B.keel?.n === 5 && B.keel?.r === 1.8 && num4(B.keel?.step) && num4(B.murkR) && num4(B.reach),
      'LOOP.barge: the Slow Hearth 12 × 3.6 m, five keel circles of r 1.8 m, Murk\'s own, the sail home\'s reach');
    ok4(B.reach <= 2 * LP.time.raftSpeed * LP.time.home + 1e-9, `LOOP.barge.reach (${B.reach} m) is at most twice the raft's speed over the sail home's ${LP.time.home} s`);
    const moorings = Object.entries(LP.mooring || {});
    ok4(moorings.length >= 1 && moorings.some(([w]) => w === 'mossmere'), 'LOOP.mooring: the Mossmere has its mooring (the Jetty)');
    for (const [water, raw] of moorings) {
      const Z = L4.ZONE_BY_ID[water];
      if (!ok4(!!Z, `LOOP.mooring.${water}: a lake`)) continue;
      // (LAKE 2, lane D1: a later water's mooring is the design's figures until its arena has the outline shore it is fitted to, lane
      // W1's; its checks run from then on. The Mossmere's always run)
      if (water !== 'mossmere' && !Z.arena?.outline) { warns.push(`LOOP.mooring.${water}: the design's figures, checked once ${water}'s arena has its outline (LAKE2 lane W1)`); continue; }
      const Lay = WLY.buildLayout(Z), M = L4.loopMooring(water, Lay.docks);
      if (!ok4(!!M && M.circles.filter((c) => c.kind === 'hull').length === B.keel.n && M.circles.filter((c) => c.kind === 'murk').length === 1, `${water}: the mooring resolves (${B.keel.n} keel circles and Murk's)`)) continue;
      const d0 = Lay.docks[raw.dock || 0];
      ok4(Math.hypot(M.raft.x - d0.x, M.raft.z - d0.z) < 1e-9, `${water}: the raft's tie-up at the stern is docks[${raw.dock || 0}] (PLAN CHOICE 44's place)`);
      const stern = { x: M.hull.x + Math.sin(M.hull.yaw) * B.length / 2, z: M.hull.z + Math.cos(M.hull.yaw) * B.length / 2 };
      ok4(Math.hypot(stern.x - M.raft.x, stern.z - M.raft.z) <= 4, `${water}: the raft lies at the stern (${Math.hypot(stern.x - M.raft.x, stern.z - M.raft.z).toFixed(2)} m from it)`);
      // the places and their banks: whatever LOOP.places holds for this water (step 3a's), through data's loopPlace when it has one
      const LPL = LP.places && typeof LP.places === 'object' && !Array.isArray(LP.places) ? LP.places : {};
      const places = Object.keys(LPL).filter((id) => LPL[id]?.water === water).map((id) => ({ id, area: typeof L4.loopPlace === 'function' ? L4.loopPlace(id)?.area : null })).filter((p) => p.area);
      const out = L4.sailPlan(Lay.docks[0], { x: 0, z: 0 }, LP.tutorial, water).path;
      const F = LR.mooringChecks(M, { obstacles: [...Lay.obstacles, ...(Lay.gateObstacles || [])], shoreR: Lay.shoreR, ...(Lay.outline ? { shoreDist: (x, z) => WLY.shoreDist(Lay, x, z) } : {}), spawn: Lay.spawn, out, places, raftR: rr2, reach: B.reach });
      ok4(F.length === 0, `${water}: the hulls, the raft and the glides clear the islands, pillars, posts, ${places.length} place(s) and their banks, the shore and the spawn${F.length ? `: ${F.slice(0, 4).join('; ')}` : ''}`);
      // the home camera's frame (the portrait pose on a screen taller than wide, the landscape on a wide one, the two eased into each
      // other between them: data.homeCamAt, as render picks it; a tablet held sideways, a 4:3 and a square window among the sizes)
      const cam = raw.cam;
      ok4(cam && Array.isArray(cam.pos) && Array.isArray(cam.look) && num4(cam.fov) && cam.portrait && Array.isArray(cam.portrait.pos), `${water}: the home camera has its pose and its portrait pose`);
      ok4(typeof L4.homeCamAt === 'function' && (cam.blend === undefined || (Array.isArray(cam.blend) && cam.blend.length === 2 && cam.blend[0] >= 0.5 && cam.blend[0] < cam.blend[1] && cam.blend[1] <= 2.2)),
        `${water}: the home camera's blend (the aspects between the portrait and the landscape poses) is a range inside 0.5 … 2.2`);
      for (const [vw, vh] of [[358, 664], [358, 775], [390, 844], [390, 664], [690, 760], [700, 760], [800, 800], [900, 900], [900, 1000], [1024, 768], [1180, 820], [960, 540], [1280, 720], [1920, 1080], [844, 390], [1280, 800], [1706, 1066], [1920, 1200]]) {
        const r = HT.frameCheck(M, L4.homeCamAt(cam, vw / vh), { vw, vh });
        ok4(r.ok, `${water}: the home camera at ${vw} × ${vh} holds the barge, the raft and Murk, the chart table, the lectern and the doorway, each button ≥ 44 px, none overlapping, each word ≥ 16 px from the others and the Wick${r.ok ? '' : `: ${r.faults.slice(0, 3).join('; ')}`}`);
      }
    }
    // self-tests: a hull laid over the Jetty's statue fails, and a camera turned away fails its frame
    { const Lay = WLY.buildLayout(L4.ZONE_BY_ID.mossmere), M = L4.loopMooring('mossmere', Lay.docks);
      const bad = { ...M, circles: [...M.circles, { x: 8, z: 36, r: 1.8, kind: 'hull' }] };
      ok4(LR.mooringChecks(bad, { obstacles: Lay.obstacles, shoreR: Lay.shoreR }).length > 0, 'mooring self-test: a hull circle on the statue fails');
      ok4(!HT.frameCheck(M, { pos: [18, 6, 60], look: [18, 1, 80], fov: 40 }, { vw: 358, vh: 664 }).ok, 'mooring self-test: a camera looking away fails its frame'); }
  }
  // >>> WC-1 (docs/loop/WATERCRAFT.md rev. 2 §2.2, §3.2, §3.3, §8.3): the Mossmere's watercraft. The lily beds and the reed arcs are open
  // water (≥ 80%) and ≥ 3 m clear of every dock post, place footprint, the mooring's hull circles and lane, and the tow's glide-in path
  // (LOOP.tow.glideIn, when present: the segment d m out from the hull along the barge's line, widened 3 m a side); the inflow's centre is
  // water; the baked shares sum to 1 and sit within ±3 points of §2.1; the hook table names only real ids, every Lake 1 fish, grades 0–3
  // and null only where §3.2 has it; every pool the game can draw has a taker (S > 0)
  {
    const WC = await import('../src/watercraft.js'), M = WC.WATERCRAFT.mossmere, G = M.geometry, Z = L4.ZONE_BY_ID.mossmere;
    const Lay = WLY.buildLayout(Z), moor = L4.loopMooring('mossmere', Lay.docks), posts = Lay.docks.flatMap((d) => d.posts || []);
    const fromShore = (x, z) => Lay.shoreR(Math.atan2(z, x)) - Math.hypot(x, z);
    const inPlace = (x, z) => !!L4.placeAtV3('mossmere', x, z);
    const gl = LP.tow?.glideIn?.mossmere, seg = gl && moor ? [{ x: moor.hull.x, z: moor.hull.z }, { x: moor.hull.x + Math.sin(moor.hull.yaw) * gl.d, z: moor.hull.z + Math.cos(moor.hull.yaw) * gl.d }] : null;
    const dSeg = (p, a, b) => { const vx = b.x - a.x, vz = b.z - a.z, t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.z - a.z) * vz) / (vx * vx + vz * vz || 1))); return Math.hypot(p.x - a.x - t * vx, p.z - a.z - t * vz); };
    /** the worst clearance of a set of points from the posts, the hulls, the mooring's lane, the glide-in and the places (by probing 3 m round each point) */
    const clearance = (pts) => {
      let worst = Infinity, what = '';
      const take = (d, w) => { if (d < worst) { worst = d; what = w; } };
      for (const p of pts) {
        for (const q of posts) take(Math.hypot(p.x - q.x, p.z - q.z) - q.r, 'a dock post');
        for (const c of moor?.circles || []) take(Math.hypot(p.x - c.x, p.z - c.z) - c.r, 'a hull circle');
        for (const q of moor?.lane || []) take(Math.hypot(p.x - q.x, p.z - q.z), 'the mooring\'s lane');
        if (seg) take(dSeg(p, seg[0], seg[1]) - 3, 'the glide-in path');
        for (let k = 0; k < 16; k++) for (const r of [0, 1, 2, 3]) { const a = k * Math.PI / 8; if (inPlace(p.x + r * Math.cos(a), p.z + r * Math.sin(a))) take(r, 'a place\'s footprint'); }
      }
      return { worst, what };
    };
    const openShare = (pts) => pts.filter((p) => fromShore(p.x, p.z) > 0 && WLY.isOpenWaterL(Lay, Lay.obstacles, p.x, p.z, 0)).length / Math.max(1, pts.length);
    for (const b of G.beds) {
      const pts = []; for (let x = b.x - b.r; x <= b.x + b.r; x += 0.75) for (let z = b.z - b.r; z <= b.z + b.r; z += 0.75) if (Math.hypot(x - b.x, z - b.z) <= b.r) pts.push({ x, z });
      const o = openShare(pts), c = clearance(pts);
      ok4(o >= 0.8 && c.worst >= 3, `WC-1: the lily bed (${b.x}, ${b.z}) r ${b.r} is ${(o * 100).toFixed(0)}% open water (≥ 80%) and ${c.worst.toFixed(1)} m clear (≥ 3; nearest: ${c.what})`);
    }
    for (const [a0, a1] of G.reedArcs) {
      const pts = []; for (let a = a0; a <= a1; a += 0.5) { const t = a * Math.PI / 180, sr = Lay.shoreR(t); for (let f = G.reedOff[0]; f <= G.reedOff[1]; f += 0.5) pts.push({ x: (sr - f) * Math.cos(t), z: (sr - f) * Math.sin(t) }); }
      const o = openShare(pts), c = clearance(pts);
      ok4(o >= 0.8 && c.worst >= 3, `WC-1: the reed arc [${a0}°, ${a1}°] is ${(o * 100).toFixed(0)}% open water (≥ 80%) and ${c.worst.toFixed(1)} m clear (≥ 3; nearest: ${c.what})`);
    }
    ok4(fromShore(G.inflow.x, G.inflow.z) > 0 && WLY.isOpenWaterL(Lay, Lay.obstacles, G.inflow.x, G.inflow.z, 0), `WC-1: the inflow's centre (${G.inflow.x}, ${G.inflow.z}) is water`);
    const DOC = { margin: 23.7, reeds: 5.8, pads: 2.9, stones: 11.7, dropoff: 10.7, lane: 1.2, open: 21.0, deep: 18.1, inflow: 1.8, outflow: 3.2 };
    for (const l of ['day', 'dusk', 'night']) {
      const sh = M.shares[l], nm = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0), sum = WC.AREAS.reduce((a, k) => a + nm(sh[k]), 0);
      const off = WC.AREAS.filter((a) => !(l === 'night' && ['lane', 'open', 'deep'].includes(a)) && Math.abs(nm(sh[a]) * 100 - DOC[a]) > 3);
      ok4(Math.abs(sum - 1) < 1e-3 && !off.length && (l !== 'night' || sh.lane === 0), `WC-1: the baked ${l} shares sum to 1 (${sum.toFixed(4)}) and are within ±3 points of §2.1${off.length ? ': off ' + off.join(', ') : ''}`);
    }
    const ITEMS = new Set([...L4.BAITS.map((b) => b.id), ...L4.LURES.map((l) => l.id), ...Object.keys(LP.lures || {}), ...(LP.tins?.mossmere || []), 'cut_strip']);
    const FISH = L4.SPECIES.filter((x) => x.zone === 'mossmere').map((x) => x.id), T = M.hook.table, rows = Object.keys(T);
    ok4(same([...rows].sort(), [...FISH].sort()), `WC-1: the hook table has a row for every Lake 1 fish and no other (${rows.length} rows)`);
    ok4(WC.HOOK_ITEMS.every((id) => id === 'bare' || ITEMS.has(id)), `WC-1: the hook table's items are real ids (${WC.HOOK_ITEMS.filter((id) => id !== 'bare').join(', ')})`);
    const badCell = [];
    for (const id of rows) for (const it of WC.HOOK_ITEMS) {
      const g = T[id][it], mayNull = id === L4.ZONES[0].legendary || (id === 'gloam_eel' && it === 'bare');
      if (!(g === null ? mayNull : Number.isInteger(g) && g >= 0 && g <= 3) || (mayNull && g !== null)) badCell.push(`${id}.${it} ${g}`);
    }
    ok4(!badCell.length && same(M.hook.mult, [0.1, 1, 1.6, 2.5]) && M.hook.cap === 0.01, `WC-1: every grade is 0–3, null only for the legend and the eel's bare cell; mult [0.1, 1, 1.6, 2.5], cap 0.01${badCell.length ? ': ' + badCell.slice(0, 4).join(', ') : ''}`);
    ok4(['reedjaw_pike', 'milkeye_perch', 'kissmark_trout', 'thousandcast_pike', 'hullkiss_lamprey'].every((id) => T[id].bare === 0) && T.reedjaw_pike.mireworm === 0, 'WC-1: the bare hook is 0 for the five hunters, and a worm 0 for the Reedjaw Pike (the user\'s rule)');
    let minS = Infinity, at = '', pools = 0;
    const HOOKS = [{}, { bait: 'mireworm' }, { bait: 'lumen_moss' }, { bait: 'cut_strip' }, ...WC.LURE_IDS.map((l) => ({ lure: l })), { lure: 'glimmer_spoon', bait: 'mireworm' }, { lure: 'feather_fly', bait: 'lumen_moss' }, { lure: 'bone_jig', bait: 'cut_strip' }];
    for (const where of [...WC.AREAS.map((a) => ({ area: a })), ...L4.loopPlaceIds('mossmere').map((p) => ({ place: p }))]) for (const ph of ['calm', 'dusk', 'gloomtide']) for (const h of HOOKS) for (const wick of [null, 'taper']) {
      const pool = L4.placePool(L4.SPECIES, { placeId: where.place ?? null, phase: ph, bait: h.bait ?? null, wickId: wick, water: 'mossmere' });
      const o = WC.castOdds(L4, { pool, area: pool.place ? null : where.area ?? 'open', phase: ph, lure: h.lure ?? null, bait: h.bait ?? null, wickId: wick });
      pools++; if (o.S < minS) { minS = o.S; at = `${where.place ?? where.area}, ${ph}, ${[h.lure, h.bait].filter(Boolean).join('+') || 'bare'}`; }
    }
    ok4(minS > 0, `WC-1: every pool the game can draw has a taker (${pools} pools; smallest S ${minS.toFixed(2)}, ${at})`);
    // GEAR-GATES (§4.1, test GG2): the gear's size caps are whole: every Mossmere fish but the legend reaches the top class it can be
    // sealed at (data.sealsFor) on some M1 hook that takes it, on Line T2; the start kit owns real ids; the bare hook brings the commons alone
    if (LP.gearCap) {
      const ORD = ['small', 'keeper', 'prize', 'trophy', 'elder'], short = [];
      for (const id of rows) {
        const sp = L4.SPECIES.find((x) => x.id === id);
        if (!sp || sp.rarity === 'legendary') continue;
        const top = Math.max(1, ...(L4.sealsFor?.(sp) || []).map((c) => ORD.indexOf(c)));
        const best = Math.max(-1, ...HOOKS.filter((h) => !(h.lure && h.bait) && (WC.gradeOf(id, h) ?? 0) >= 1).map((h) => ORD.indexOf(WC.gearCap(L4, id, { ...h, line: 2 })?.cls)));
        if (best < top) short.push(`${id} ${ORD[best] ?? 'none'} < ${ORD[top]}`);
      }
      ok4(!short.length, `GEAR-GATES: every Mossmere fish reaches its top seal on some hook at Line T2${short.length ? ': ' + short.join(', ') : ''}`);
      const ST = LP.start || {};
      ok4((ST.lures || []).every((id) => LP.lures?.[id]?.start === true && L4.LURES.some((l) => l.id === id)) && Object.keys(ST.bait || {}).every((id) => (LP.tins?.mossmere || []).includes(id)) && (!ST.fit || (ST.bait || {})[ST.fit] > 0),
        `GEAR-GATES: the start kit's lures are LOOP.lures' start lures with LURES rows, its bait a tin, its fit in the bag (${[...(ST.lures || []), ...Object.keys(ST.bait || {})].join(', ')})`);
      ok4(rows.every((id) => T[id].bare == null || (T[id].bare >= 1) === (L4.SPECIES.find((x) => x.id === id)?.rarity === 'common')), 'GEAR-GATES: the bare hook takes the commons and no other fish');
    }
  }
  // <<< WC-1
  // >>> LAKE 2, lane D1 (docs/loop/LAKE2.md §9; the user's answers of 17 Nov 2026): Sporewood Pools under the loop, as data. Every key,
  // every item a water's, no lure or tin in two waters, the hook table whole (the 1% stray rule as the Mossmere's), the line's cap by its
  // total Hold reproducing GEAR-GATES' Mossmere caps, the list rule, the repeats rule, the carry's shape (the raft's parts and the hold
  // among it, answer 1), the words; and nothing of it reaches the Mossmere (LOOP.shipped stays 'mossmere')
  {
    const WC = await import('../src/watercraft.js'), SW = WC.WATERCRAFT.sporewood, W2 = LP.waters.sporewood, PLC = LP.places;
    const words = (t) => String(t).trim().split(/\s+/).length, noDigit = (t) => typeof t === 'string' && !/\d/.test(t);
    ok4(LP.shipped === 'mossmere' && !PLM.waterShipped(L4, 'sporewood'), 'LAKE2 D1: LOOP.shipped stays the Mossmere (Sporewood ships at the integration gate)');
    ok4(W2 && W2.order === 2 && W2.tier === 12 && same(W2.prices, { night: 1200, crown: 2200 }) && W2.lake === 1400 && W2.plainBait === LP.tins.sporewood?.[0],
      'LAKE2 D1: LOOP.waters.sporewood: order 2, tier 12 (lane D2\'s tuning, LAKE2 §8.4), the Veilwater 1,200 and the Mother\'s Cup 2,200, the lake map 1,400, its plain bait its first tin');
    // the places (§3.2)
    const SPL = L4.loopPlaceIds('sporewood');
    ok4(same(SPL, ['lullaby', 'gill_harp', 'veilwater', 'mothers_cup']) && same(SPL.map((id) => PLC[id].kind), ['day', 'old', 'night', 'crown']), 'LAKE2 D1: Sporewood\'s four places in the Chart\'s order (day, old, night, crown)');
    ok4(same((W2.places || []).map((p) => [p.id, p.kind]), SPL.filter((id) => PLC[id].lake === true).map((id) => [id, PLC[id].kind])) && W2.places.every((p) => ['day', 'old'].includes(p.kind)),
      'LAKE2 D1: the lake map opens the day and the old water (LOOP.waters.sporewood.places), each a `lake` place');
    for (const id of SPL) {
      const p = PLC[id], q = L4.loopPlace(id), card = L4.SPECIES_BY_ID[p.card];
      ok4(p.water === 'sporewood' && (p.lake === true ? p.price === 0 : p.price === W2.prices[p.kind]), `LAKE2 D1: ${id}: priced by its kind (${p.lake ? 'opened by the lake map' : W2.prices[p.kind]})`);
      ok4(!!q && q.zone === 'sporewood' && typeof q.name === 'string' && q.area?.kind === 'disc' && num4(q.area.r) && q.area.r > 0 && L4.SPOREWOOD_LOOP.places.some((r) => r.id === id), `LAKE2 D1: ${id}: its record (SPOREWOOD_LOOP), name, footprint`);
      ok4(card?.zone === 'sporewood', `LAKE2 D1: ${id}: its card's fish (${p.card}) is Sporewood's`);
      if (p.giant) ok4(L4.SPECIES_BY_ID[p.giant]?.giant === true && L4.SPECIES_BY_ID[p.giant].place === id && L4.SPECIES_BY_ID[p.giant].rarity === 'epic', `LAKE2 D1: ${id}: its giant ${p.giant} is an epic giant whose place is ${id}`);
      for (const o of p.own || []) ok4(L4.SPECIES_BY_ID[o]?.place === id && !L4.SPECIES_BY_ID[o].giant, `LAKE2 D1: ${id}: its own fish ${o} has that place`);
      if (p.legend) ok4(L4.SPECIES_BY_ID[p.legend]?.rarity === 'legendary' && L4.SPECIES_BY_ID[p.legend].bait === LP.legendBait.sporewood?.id, `LAKE2 D1: ${id}: its legend ${p.legend} on Sporewood's legend bait`);
      for (const d of Object.keys(p.draws || {})) ok4(L4.SPECIES_BY_ID[d]?.zone === 'sporewood' && !L4.SPECIES_BY_ID[d].place && (L4.SPECIES_BY_ID[d].kind ?? 'open') === 'open', `LAKE2 D1: ${id}: it draws ${d}, an open-water fish of Sporewood`);
      ok4(Array.isArray(p.out) && p.out.length >= 2 && p.out.every((v) => Array.isArray(v) && v.length === 2 && v.every(num4)), `LAKE2 D1: ${id}: its glide out`);
      ok4(typeof TL.maps?.[id] === 'string' && words(TL.maps[id]) <= 8 && noDigit(TL.maps[id]), `LAKE2 D1: ${id}: its card line, ≤ 8 words`);
      const pools = ['calm', 'dusk', 'gloomtide'].map((ph) => L4.placePool(L4.SPECIES, { placeId: id, phase: ph, water: 'sporewood', bait: L4.SPECIES_BY_ID[p.card]?.bait ?? null }));
      ok4(pools.every((x) => x.list.length > 0 && x.list.every(([s]) => s.zone === 'sporewood')), `LAKE2 D1: ${id}: it bites in every light, only Sporewood's fish`);
    }
    ok4(typeof TL.maps?.sporewood === 'string' && words(TL.maps.sporewood) <= 8, 'LAKE2 D1: the lake map\'s own line, ≤ 8 words');
    // the fish (§2.1, §2.2): the fourteen, the list rule, the repeats rule
    const FOURTEEN = ['drifting_grove', 'harpstring_eel', 'festival_puffer', 'lostsea_mackerel', 'downcast_catfish', 'nightbloom_carp', 'mildew_angler', 'sleepspore_jelly',
      'threadling_eel', 'cindertail_catfish', 'velvet_ray', 'falsesmile_barb', 'netcloud_fry', 'capshell_crayfish'];
    const SWS = L4.SPECIES.filter((x) => x.zone === 'sporewood');
    ok4(same(SWS.map((x) => x.id).sort(), FOURTEEN.slice().sort()), `LAKE2 D1: loop SPECIES holds Sporewood's fourteen, once each (got ${SWS.length}: ${SWS.map((x) => x.id).join(', ')})`);
    ok4((LP.leftOut?.sporewood || []).every((id) => !L4.SPECIES.some((x) => x.id === id)) && same((LP.leftOut?.sporewood || []).slice().sort(), ['hushcap_koi', 'plumgill_perch', 'sporebelly_puffer']),
      'LAKE2 D1: the Sporebelly Puffer, the Hushcap Koi and the Plumgill Perch are out of the loop\'s SPECIES (§2.2; their built records stay for the flag-off game)');
    ok4(same(LP.species.sporewood, PLM.listFor(L4, 'sporewood')) && LP.species.sporewood.length === 9, `LAKE2 D1: the list rule: Sporewood's list is its nine open-water fish, computed (got ${PLM.listFor(L4, 'sporewood').join(', ')})`);
    const mossIds = new Set(L4.SPECIES.filter((x) => x.zone === 'mossmere').map((x) => x.id));
    ok4(SWS.every((x) => !mossIds.has(x.id)) && same((LP.guests?.mossmere || []).filter((id) => L4.SPECIES_BY_ID[id]?.zone === 'sporewood'), ['nightbloom_carp']),
      'LAKE2 D1: no fish repeats between the waters; the one fish of both is the Nightbloom Carp, the Mossmere\'s guest a notebook brings (§2.2)');
    ok4(SWS.every((x) => x.phase === 1 && x.depth?.[0] === 0 && x.depth?.[1] === 1 && Array.isArray(x.weight) && x.weight.every((v) => num4(v) && v > 0)), 'LAKE2 D1: each Sporewood record the loop\'s own: inside the phase pin, any depth, a finite weight');
    ok4(SWS.every((x) => L4.ROSTER_ART[x.id]?.model && (x.rarity === 'legendary' || num4(x.size?.k))), 'LAKE2 D1: each of the fourteen has its look\'s key (ROSTER_ART; lane F fills it) and a body key');
    // ---- LAKE 2, lane F (LAKE2.md §2.3, §9): the fourteen looks built and painted, each unlike its Mossmere relative; the three new plans drawn
    // shapes under the loop; glow only where the brief names it; each fish on a new plan within ±30% of its cousin (pounds SPEC §6.4)
    {
      const fsF = await import('node:fs');
      const RJ = JSON.parse(fsF.readFileSync(new URL('../docs/loop/roster.json', import.meta.url), 'utf8'));
      ok4(['disc', 'bream', 'finlet'].every((sh) => L4.FISH_SHAPES.includes(sh)) && SWS.every((x) => L4.FISH_SHAPES.includes(x.model?.shape)), 'LAKE2 F: the disc, the bream and the finlet are drawn shapes under the loop, and every Sporewood fish is on one');
      ok4(SWS.every((x) => ['body', 'belly', 'fin'].every((c) => Number.isInteger(x.model?.[c]))), 'LAKE2 F: every look is painted (its body, belly and fin colours)');
      const lit = SWS.filter((x) => x.model.glow !== null && x.model.glow !== undefined).map((x) => x.id).sort();
      ok4(same(lit, ['drifting_grove', 'festival_puffer', 'harpstring_eel', 'mildew_angler', 'nightbloom_carp', 'sleepspore_jelly']), `LAKE2 F: glow only where the brief names it (the Harpstring's strings, the Puffer's lantern, the Grove's gills, the Nightbloom's bloom; the Angler and the Jelly as built): ${lit.join(', ')}`);
      const WORDS = ['girth', 'head', 'strings', 'ventral', 'dorsal', 'skin', 'carapace', 'beak', 'eyeSpots', 'scales', 'back', 'eyeSet', 'whiskers', 'meadow', 'eyeRings', 'depth', 'finlets'];
      const PAIRS = [['harpstring_eel', 'gloam_eel'], ['harpstring_eel', 'hullkiss_lamprey'], ['threadling_eel', 'gloam_eel'], ['downcast_catfish', 'belled_matriarch'], ['cindertail_catfish', 'belled_matriarch'],
        ['nightbloom_carp', 'weeping_carp'], ['nightbloom_carp', 'rustfin_sucker'], ['netcloud_fry', 'dusk_minnow'], ['netcloud_fry', 'likely_chub'], ['capshell_crayfish', 'gutter_crayfish'],
        ['falsesmile_barb', 'overbold_bass'], ['falsesmile_barb', 'mossback_perch']];
      const unlike = ([a, b]) => { const A = L4.SPECIES_BY_ID[a]?.model, B = L4.SPECIES_BY_ID[b]?.model; return !!A && !!B && (A.shape !== B.shape || WORDS.some((w) => A[w] !== undefined && A[w] !== B[w])) && A.body !== B.body; };
      ok4(PAIRS.every(unlike), `LAKE2 F: each Sporewood fish with a Mossmere relative is drawn on another plan or the brief's own build of it, in its own colours (${PAIRS.filter((p) => !unlike(p)).map((p) => p.join(' ~ ')).join(', ') || 'all'})`);
      for (const id of ['velvet_ray', 'falsesmile_barb', 'lostsea_mackerel', 'cindertail_catfish', 'downcast_catfish', 'nightbloom_carp']) {
        const x = L4.SPECIES_BY_ID[id], rf = RJ.fish.find((f) => f.id === id)?.refWeight, k = x?.size?.k;
        const w = rf && k ? k * x.size.L50 ** 3 / 1000 : NaN, r = rf ? rf.kg * (x.size.L50 / rf.cm) ** 3 : NaN;
        ok4(rf && Math.abs(w / r - 1) <= 0.3, `LAKE2 F: ${id} (${x?.size?.body}) weighs ${w.toFixed(3)} kg at its L50, within ±30% of its cousin's ${r.toFixed(3)} kg (roster.json refWeight)`);
      }
    }
    ok4(L4.SPECIES_LOOP.every((x) => x.zone === 'mossmere'), 'LAKE2 D1: SPECIES_LOOP is the shipped water\'s alone');
    // the items (§5.6, §5.7, §7.1): every item a water's, no lure or tin in two waters, each with its rows, names and lines
    const LU = LP.lures, lw = Object.entries(LU);
    ok4(lw.every(([, v]) => typeof v.water === 'string' && LP.waters[v.water]), 'LAKE2 D1: every lure is a water\'s (LOOP.lures[id].water in LOOP.waters)');
    const tinsAll = Object.values(LP.tins).flat();
    ok4(new Set(tinsAll).size === tinsAll.length && !tinsAll.includes('cut_strip'), 'LAKE2 D1: no tin in two waters; Cut Strip is no water\'s tin (every water\'s hook)');
    const swLures = lw.filter(([, v]) => v.water === 'sporewood').map(([id]) => id);
    ok4(same(swLures, ['seedpod_twirl', 'spore_moth', 'ember_minnow', 'root_jig', 'sporelamp_fly']), `LAKE2 D1: Sporewood's five lures (${swLures.join(', ')})`);
    ok4(swLures.every((id) => L4.LURES.some((l) => l.id === id) && L4.CATCH_V3.items?.[id]?.kind === 'lure' && typeof TL.gearItems?.[id] === 'string'), 'LAKE2 D1: each Sporewood lure has a LURES row, a CATCH_V3 item and its name');
    ok4((LP.tins.sporewood || []).every((id) => L4.BAITS.some((b) => b.id === id && !b.legend) && L4.CATCH_V3.items?.[id]?.kind === 'bait' && typeof TL.gearItems?.[id] === 'string'), 'LAKE2 D1: each Sporewood tin has a BAITS row, a CATCH_V3 item and its name');
    const mossItems = new Set([...(LP.tins.mossmere || []), ...lw.filter(([, v]) => v.water === 'mossmere').map(([id]) => id)]);
    ok4([...swLures, ...(LP.tins.sporewood || [])].every((id) => !mossItems.has(id)), 'LAKE2 D1: every lure and bait at Sporewood is new (none of the Mossmere\'s: the user\'s "completely different lures etc on every new map")');
    ok4(LU.seedpod_twirl.start === true && LU.seedpod_twirl.price === 0 && same(LU.sporelamp_fly.giants, ['harpstring_eel', 'festival_puffer']) && same(L4.CATCH_V3.items.sporelamp_fly.species, LU.sporelamp_fly.giants),
      'LAKE2 D1: the Seedpod Twirl free (the start lure); the Spore-Lamp Fly re-aimed at Sporewood\'s giants');
    const ST2 = LP.start.sporewood;
    ok4(ST2 && (ST2.lures || []).every((id) => LU[id]?.water === 'sporewood' && LU[id].start === true) && Object.keys(ST2.bait || {}).every((id) => (LP.tins.sporewood || []).includes(id)) && ST2.bait?.[ST2.fit] > 0,
      'LAKE2 D1: Sporewood\'s start kit: its free lure and a tin of its plain bait, fitted');
    ok4(LP.legendBait.sporewood?.id === 'glowcap_bulb' && L4.BAITS.some((b) => b.id === 'glowcap_bulb' && b.legend) && num4(LP.legendBait.sporewood.price), 'LAKE2 D1: the Glowcap Bulb is Sporewood\'s legend bait (a built legend bait)');
    // the hook table (§2.4)
    const T2 = SW.hook.table, HI = WC.HOOK_ITEMS_AT.sporewood, ITEMS2 = new Set([...swLures, ...(LP.tins.sporewood || []), 'cut_strip', 'guard_button']);
    ok4(same(Object.keys(T2).sort(), FOURTEEN.slice().sort()) && HI.every((id) => id === 'bare' || ITEMS2.has(id)) && same(SW.hookItems, HI), `LAKE2 D1: Sporewood's hook table: a row for each of its fourteen, its columns its own items (${HI.join(', ')})`);
    const bad2 = [];
    for (const id of Object.keys(T2)) for (const it of HI) { const g = T2[id][it], leg = L4.SPECIES_BY_ID[id]?.rarity === 'legendary'; if (leg ? g !== null : !(Number.isInteger(g) && g >= 0 && g <= 3)) bad2.push(`${id}.${it} ${g}`); }
    ok4(!bad2.length && same(SW.hook.mult, WC.WATERCRAFT.mossmere.hook.mult) && SW.hook.cap === WC.WATERCRAFT.mossmere.hook.cap, `LAKE2 D1: every grade 0–3 (null only for the legend); the stray rule's mult and 1% cap the Mossmere's${bad2.length ? ': ' + bad2.slice(0, 4).join(', ') : ''}`);
    ok4(Object.keys(T2).filter((id) => T2[id].bare != null).every((id) => (T2[id].bare >= 1) === (L4.SPECIES_BY_ID[id]?.rarity === 'common')), 'LAKE2 D1: the bare hook takes the commons and no other fish');
    ok4(T2.lostsea_mackerel.bare === 0 && T2.lostsea_mackerel.seedpod_twirl === 0, 'LAKE2 D1: the hunter takes neither the bare hook nor the free Twirl');
    const bought = swLures.filter((id) => !LU[id].start);
    ok4(['harpstring_eel', 'festival_puffer'].every((id) => HI.every((it) => (bought.includes(it) ? true : T2[id][it] === 0)) && T2[id].sporelamp_fly === 3), 'LAKE2 D1: both giants need a bought lure (0 on every bait, the free hooks and the Button; the Spore-Lamp Fly their right lure)');
    ok4(['threadling_eel', 'sleepspore_jelly'].every((id) => { const t = HI.filter((it) => T2[id][it] > 0); return t.length === 1 && t[0] === L4.SPECIES_BY_ID[id]?.bait; }), 'LAKE2 D1: the two bait-only fish take their one bait and nothing else');
    ok4(Object.keys(T2).every((id) => T2[id].guard_button === (T2[id].bare === null ? null : SW.hook.button.not.includes(id) ? 0 : SW.hook.button.grade)), 'LAKE2 D1: the Gate-Guard\'s Button\'s column is its rule (2 but for the giants, the legend and the bait-only fish)');
    ok4(Object.keys(T2).filter((id) => T2[id].bare !== null).every((id) => HI.some((it) => T2[id][it] >= 1)), 'LAKE2 D1: every fish can be caught (some Sporewood hook takes each)');
    ok4(same(Object.keys(SW.raw).sort(), LP.species.sporewood.slice().sort()) && Object.values(SW.raw).every((r) => WC.AREAS.every((a) => num4(r[a]) && r[a] > 0)), 'LAKE2 D1: the raw area weights: the open water\'s nine, ten positive weights each');
    // the gear loop (§5, answer 1): per-water gear, the carry, the line's cap
    const GR = LP.gear, CAP = LP.gearCap;
    ok4(['rod', 'line', 'reel'].every((s) => same(GR.mossmere[s].map((t) => t.hold), [0, 1, 2].map((i) => L4.TACKLE[s][i].hold)) && same(GR.mossmere[s].map((t) => t.price), LP.tackle.price.slice(0, 3))),
      'LAKE2 D1: LOOP.gear.mossmere is TACKLE T0–T2 at LOOP.tackle\'s prices');
    ok4(same(['rod', 'line', 'reel'].map((s) => GR.sporewood[s].map((t) => t.hold)), [[0, 3, 6], [0, 3, 7], [0, 3, 6]]) && same(GR.sporewood.rod.map((t) => t.cast), [0, 2, 4]),
      'LAKE2 D1: Sporewood\'s tiers: +0 · +3 · +6 / +7 / +6 Hold, the rods casting +2 and +4 m (§7.1)');
    ok4(['rod', 'line', 'reel'].every((s) => GR.sporewood[s][0].start === true && GR.sporewood[s][0].id === GR.mossmere[s][0].id && GR.sporewood[s].slice(1).every((t) => typeof TL.gearItems?.[t.id] === 'string' && typeof TL.shelf?.[t.id] === 'string' && words(TL.shelf[t.id]) <= 8)),
      'LAKE2 D1: the start pieces are every water\'s (they travel); each Sporewood tier named, with its shelf line');
    const gearIds = Object.values(GR).flatMap((g) => ['rod', 'line', 'reel'].flatMap((s) => g[s].filter((t) => !t.start).map((t) => t.id)));
    ok4(new Set(gearIds).size === gearIds.length, 'LAKE2 D1: no tackle piece in two waters');
    const HL = GR.sporewood.hold;
    ok4(HL.shelfMax === 7 && HL.ladder.map((s) => s.slots).every((n, i, a) => i === 0 ? n > LP.hold.start : n === a[i - 1] + 1) && HL.ladder.at(-1).slots === 7 && HL.ladder.every((s) => num4(s.price) && s.name && !LP.hold.ladder.some((m) => m.name === s.name)),
      'LAKE2 D1: Sporewood\'s hold steps on its own shelf to Hold 7, each its own creel (the hold\'s slots are bought gear: answer 1)');
    ok4(['oars', 'keel', 'lantern'].every((s) => { const R = GR.sporewood.raft[s], N = TL.gearNamesAt?.sporewood?.[s]; return R && R.prices.length === R.with.length && R.prices.length <= LP.raft[s].prices.length && Array.isArray(N) && N.length === R.prices.length && R.with.every((w) => w === W2.order); }),
      'LAKE2 D1: Sporewood\'s raft parts on its own shelf, each level named (the raft\'s parts are bought gear: answer 1)');
    const C = LP.carry;
    ok4(C && C.share > 0 && C.share < 1 && C.round === 'up' && C.castFrom === L4.TACKLE.rod[0].castMax && same(C.tackle, ['rod', 'line', 'reel']) && C.slots === true && same(C.raft, ['oars', 'keel', 'lantern']),
      'LAKE2 D1: LOOP.carry: a share of the tackle\'s Hold, the cast, the hold\'s slots and the raft\'s parts (answer 1)');
    const carried = (h) => Math.ceil(h * C.share - 1e-9), mT2 = GR.mossmere.line[2].hold;
    ok4(carried(mT2) + GR.sporewood.line[1].hold >= CAP.lineAt.sporewood.trophy && carried(mT2) < CAP.lineAt.sporewood.trophy && carried(mT2) + GR.sporewood.line[2].hold >= CAP.lineAt.sporewood.elder,
      'LAKE2 D1: at Sporewood the carried line alone fishes at Prize, its first line lifts it to Trophy, its second to Elder (§5.6)');
    const capAt = (w, h) => (h < CAP.lineAt[w].trophy ? 'prize' : h < CAP.lineAt[w].elder ? 'trophy' : 'elder');
    ok4(same([0, 1, 2].map((t) => capAt('mossmere', L4.TACKLE.line[t].hold)), CAP.line), 'LAKE2 D1: lineAt.mossmere reproduces GEAR-GATES\' line caps (Twine · Line T1 · T2: Prize · Trophy · Elder)');
    ok4(CAP.item.seedpod_twirl === 'keeper' && CAP.item.bare === 'keeper' && CAP.item.cut_strip === 'prize', 'LAKE2 D1: the free Twirl lands up to Keeper, as the bare hook and the Bent Spoon');
    const AR = LP.arrival;
    ok4(AR && Number.isInteger(AR.evenings) && AR.evenings >= 1 && AR.cap === CAP.firstEvening && Array.isArray(AR.fight) && AR.fight.length === AR.evenings
      && AR.fight.every((f, i, a) => num4(f) && f < 0 && (i === 0 || f > a[i - 1])), 'LAKE2 D1 (answer 2): a new water\'s first evenings land an over-cap fish at the cap and ease its Fight term, less each evening, then whole');
    // the words (§5.2, §6.4, §6.5)
    const Lv = TL.leave || {};
    ok4(['title', 'stays', 'keeps', 'wait', 'come', 'tow', 'notYet'].every((k) => typeof Lv[k] === 'string' && Lv[k] && words(Lv[k]) <= 8 && noDigit(Lv[k])), 'LAKE2 D1: the leaving card\'s title, four lines and two buttons, each ≤ 8 words');
    ok4(typeof TL.mapLeaves === 'string' && words(TL.mapLeaves) <= 8 && typeof TL.carry === 'string' && ['{r}', '{l}', '{c}'].every((k) => TL.carry.includes(k)), 'LAKE2 D1: the map card\'s line and the carried line (rod · line · reel)');
    ok4(['map', 'home', 'away'].every((k) => typeof TL.murk?.at?.sporewood?.[k] === 'string' && words(TL.murk.at.sporewood[k]) <= 10 && noDigit(TL.murk.at.sporewood[k])), 'LAKE2 D1: Murk\'s three lines at Sporewood');
    ok4(typeof TL.guide?.newWater === 'string' && words(TL.guide.newWater) <= 30 && !('newWater' in (TL.guide.boxes || {})), 'LAKE2 D1: the new water\'s guide box (its own key, never one of the Mossmere\'s boxes)');
    ok4(Object.values(TL.shelfAt?.sporewood || {}).every((t) => words(t) <= 8 && noDigit(t)) && [...swLures.filter((id) => !LU[id].start), ...(LP.tins.sporewood || []), 'glowcap_bulb'].every((id) => typeof TL.shelf?.[id] === 'string' && words(TL.shelf[id]) <= 8),
      'LAKE2 D1: every Sporewood shelf line, ≤ 8 words');
    // nothing reaches the Mossmere: its shelf, its map cards, its Chart's sheets and its catalogue tabs are as they were
    const fresh = PLM.freshLoop(L4), shelf = PLM.shelfItems(L4, fresh);
    ok4(!shelf.some((it) => it.water === 'sporewood' || swLures.includes(it.lureId) || (LP.tins.sporewood || []).includes(it.baitId)), 'LAKE2 D1: a fresh save\'s shelf offers nothing of Sporewood\'s');
    ok4(PLM.mapCards(L4, fresh).every((c) => c.placeId ? PLC[c.placeId].water === 'mossmere' : c.waterId === 'sporewood' && c.sealed === true), 'LAKE2 D1: the map cards are the Mossmere\'s and Sporewood\'s sealed card');
  }
  // <<< LAKE 2, lane D1
  // >>> LAKE 2, lane W1 (docs/loop/LAKE2.md §1A (2), §3.1, §3.2, §3.5): Sporewood's outline shore. The basin natural (a closed curve that
  // never crosses itself, two pools and a neck 11 m wide, an isoperimetric ratio far from a circle's), six islands each its own land in
  // the shore's field, the depth (the shares, the Cup the deepest and monotone to its middle), every place's water open and its glide out
  // clear of the banks and the islands by the raft's radius + 0.3 m, open water ≥ 70% of the basin, the water's bake covering it, the
  // areas' geometry on the water; the mooring's checks above run on it (LOOP.mooring.sporewood, fitted)
  {
    const Z = L4.ZONE_BY_ID.sporewood, A = Z?.arena || {}, WO = await import('../src/world-outline.js'), LR = await import('../src/loop-rules.js');
    ok4(A.layout === 'outline' && same(A.outline, L4.SPOREWOOD_ARENA.outline), 'LAKE2 W1: under the loop Sporewood\'s arena is its outline basin (SPOREWOOD_ARENA)');
    const Lay = WLY.buildLayout(Z), O = Lay.outline, sd = (x, z) => WLY.shoreDist(Lay, x, z), raftR = L4.BALANCE.move.raftRadius, pad = raftR + 0.3;
    ok4(!!O && Array.isArray(A.banks) && A.banks.length === A.outline.length && A.banks.every((b) => Array.isArray(b) && b.length === 2 && b.every(num4) && b[0] > 0 && b[1] > 0), 'LAKE2 W1: a bank profile [top, shelf] at every control point');
    if (O) {
      const S = O.shore, segX = (a, b, c, d) => { const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
      let cross = 0;
      for (let i = 0; i < S.n; i += 1) for (let j = i + 2; j < S.n; j++) { if (i === 0 && j === S.n - 1) continue; if (segX([S.x[i], S.z[i]], [S.x[(i + 1) % S.n], S.z[(i + 1) % S.n]], [S.x[j], S.z[j]], [S.x[(j + 1) % S.n], S.z[(j + 1) % S.n]])) cross++; }
      const iso = (4 * Math.PI * O.area) / (O.len * O.len);
      ok4(cross === 0 && inR(O.area, 8500, 9800) && inR(O.len, 520, 620) && iso <= 0.45, `LAKE2 W1: the shore never crosses itself; ${O.area.toFixed(0)} m² inside it, ${O.len.toFixed(0)} m round, isoperimetric ${iso.toFixed(2)} (a circle 1)`);
      let lo = null, hi = null; for (let z = -6; z <= 18; z += 0.05) { if (sd(0, z) > 0) { if (lo === null) lo = z; hi = z; } }
      ok4(lo !== null && inR(hi - lo, 10.5, 11.5), `LAKE2 W1: the neck ${lo === null ? '?' : (hi - lo).toFixed(1)} m wide at x = 0 (11 m)`);
      ok4(O.islands.length === 6 && O.islands.every((o) => sd(o.x, o.z) < 0) && A.islands.every((o) => Lay.islands.some((q) => q.x === o.x && q.outline === true)), 'LAKE2 W1: six islands, each its own land in the shore\'s field');
      ok4(Lay.obstacles.filter((o) => o.kind === 'island').every((o) => sd(o.x, o.z) + o.r <= 0.05), 'LAKE2 W1: each island\'s collision circle lies inside its own bank (the field does the rest)');
      // the depth: the shares by DEPTH_BANDS, the Cup the deepest and only deepening on the way in
      const c = [0, 0, 0]; let nw = 0;
      for (let x = Math.floor(O.bbox.x0); x <= O.bbox.x1; x += 1.5) for (let z = Math.floor(O.bbox.z0); z <= O.bbox.z1; z += 1.5) { if (!WLY.isOpenWaterL(Lay, Lay.obstacles, x, z, 0.5)) continue; nw++; const d = WLY.depthAt(Lay, x, z); c[d < 0.35 ? 0 : d < 0.75 ? 1 : 2]++; }
      const share = c.map((v) => (100 * v) / Math.max(1, nw));
      ok4(share.every((v, i) => Math.abs(v - A.depthShare[i]) <= 4), `LAKE2 W1: depth shares ${share.map((v) => v.toFixed(0)).join('/')} ~ ${A.depthShare.join('/')}`);
      const Cp = A.deepPools[0];
      let mono = true;
      for (let k = 0; k < 48 && mono; k++) { const t = (k / 48) * Math.PI * 2; let prev = Infinity; for (let r = 0; r <= Cp.r + 2; r += 0.25) { const d = WLY.depthAt(Lay, Cp.x + Math.cos(t) * r, Cp.z + Math.sin(t) * r); if (d > prev + 1e-9) { mono = false; break; } prev = d; } }
      ok4(mono && WLY.depthAt(Lay, Cp.x, Cp.z) >= 0.99 && A.legendPool.x === Cp.x && A.legendPool.z === Cp.z, `LAKE2 W1: ${Cp.name} the deepest water (1.0), monotone from its lip to its middle, the legend's water`);
      // the places: open water, clear of the docks and the spawn; each glide out clear of the banks and the islands
      const PLC = LP.places, ids = L4.loopPlaceIds('sporewood');
      let fp = 0;
      for (const id of ids) {
        const q = L4.loopPlace(id), a = q.area;
        let n = 0, open = 0;
        for (let x = a.x - a.r; x <= a.x + a.r; x += 0.5) for (let z = a.z - a.r; z <= a.z + a.r; z += 0.5) if (Math.hypot(x - a.x, z - a.z) <= a.r) { n++; if (WLY.isOpenWaterL(Lay, Lay.obstacles, x, z, 0.3)) open++; }
        fp += Math.PI * (a.r + 1.5) ** 2;
        const dDock = Math.min(...Lay.docks.map((d) => Math.hypot(d.x - a.x, d.z - a.z) - a.r)), dSpawn = Math.hypot(Lay.spawn.x - a.x, Lay.spawn.z - a.z) - a.r;
        ok4(n > 0 && open / n >= 0.8 && dDock > 1.5 && dSpawn > 1.5, `LAKE2 W1: ${id}'s water ${(100 * open / Math.max(1, n)).toFixed(0)}% open (≥ 80%), ${dDock.toFixed(1)} m from the dock and ${dSpawn.toFixed(1)} m from the spawn (> 1.5)`);
        const g = L4.loopSailPlan(Lay.docks[0], { water: 'sporewood', place: id }), pts = g.path.map((p) => [p.x, p.z]);
        const sh = LR.pathShore(pts, sd), ob = LR.pathClearance(pts, Lay.obstacles.filter((o) => o.kind !== 'post'));
        ok4(Math.hypot(g.from.x - Lay.docks[0].x, g.from.z - Lay.docks[0].z) < 1e-9 && sh >= pad && ob >= pad && Math.hypot(g.to.x - a.x, g.to.z - a.z) <= a.r,
          `LAKE2 W1: the glide out to ${id} starts at docks[0], ends in its water and clears the banks by ${sh.toFixed(2)} m and the islands by ${ob.toFixed(2)} m (≥ ${pad.toFixed(1)})`);
      }
      { const g = L4.sailPlan(Lay.docks[0], { x: 0, z: 0 }, LP.tutorial, 'sporewood'), pts = g.path.map((p) => [p.x, p.z]);
        ok4(LR.pathShore(pts, sd) >= pad, `LAKE2 W1: the open water's glide out (LOOP.tutorial.outPath.sporewood) clears the banks by ${LR.pathShore(pts, sd).toFixed(2)} m`); }
      const water = nw * 1.5 * 1.5;
      ok4(1 - fp / water >= 0.7, `LAKE2 W1: open water ${(100 * (1 - fp / water)).toFixed(0)}% of the basin (the places' footprints and their banks aside: ≥ 70%)`);
      ok4(Lay.R + 8 >= Math.max(-O.bbox.x0, O.bbox.x1, -O.bbox.z0, O.bbox.z1) + 2, `LAKE2 W1: the water's bake (R + 8 = ${Lay.R + 8} m about the centre) covers the basin`);
      ok4(sd(Lay.spawn.x, Lay.spawn.z) >= 4 && Lay.docks.every((d) => sd(d.x, d.z) >= raftR + 0.5), 'LAKE2 W1: the spawn and the docks in open water');
      // the areas' geometry (WATERCRAFT.sporewood.geometry): beds and reed runs on the water, the inflow and outflow by the shore, the rim
      // round the legend's water
      const WC = await import('../src/watercraft.js'), GE = WC.WATERCRAFT.sporewood.geometry;
      ok4(!!GE && GE.beds.every((b) => sd(b.x, b.z) >= b.r * 0.6) && GE.reedRuns.every(([u0, u1]) => u0 < u1 && u1 - u0 <= 6 && u1 <= A.outline.length) && Math.hypot(GE.rim.x - Cp.x, GE.rim.z - Cp.z) < 1e-9 && GE.rim.r0 === Cp.r,
        'LAKE2 W1: Sporewood\'s areas: its lily beds on the water, its reed runs spans of the shore, its drop-off round the Mother\'s Cup');
      ok4(sd(GE.inflow.x, GE.inflow.z) > 0 && sd(GE.inflow.x, GE.inflow.z) < GE.inflow.r && sd(GE.outflow.x, GE.outflow.z) > 0 && sd(GE.outflow.x, GE.outflow.z) < GE.outflow.r1, 'LAKE2 W1: the inflow under the Seep and the outflow by the Root Weir lie on the water by the shore');
      ok4(GE.reedRuns.every(([u0, u1]) => [u0, (u0 + u1) / 2, u1].every((u) => { const q = WO.shoreAt(O, WO.arcAt(O, u)); return q.h <= 2.2; })), 'LAKE2 W1: the reed runs lie on low banks (≤ 2.2 m)');
    }
  }
  // <<< LAKE 2, lane W1
  // the tutorial's time budget (T72): arrive + Murk's wake line + chartWait + the longest departure line + out ≤ budget.max
  const FL = L4.FIRST_EVENING?.lines || {};
  const depart = Math.max(murkHold(TL.murk.firstChart, FL), ...Object.values(TL.murk.firstChartBy || {}).map((x) => murkHold(x, FL)));
  const sum = T.arrive + murkHold(TL.murk.wake, FL) + T.chartWait + depart + T.out;
  ok4(['arrive', 'out', 'chartWait', 'slotInk', 'castTipAfter', 'outDist'].every((k) => num4(T[k]) && T[k] > 0), 'LOOP.tutorial: every time and distance positive');
  ok4(T.budget.tapThrough <= T.budget.reference && T.budget.reference <= T.budget.max && sum <= T.budget.max, `T72: the tutorial's budget: ${sum.toFixed(2)} s ≤ ${T.budget.max} s (reference ≤ ${T.budget.reference}, tap-through ≤ ${T.budget.tapThrough})`);
  if (!(sum <= T.budget.reference + 0.5)) warns.push(`the tutorial's no-tap time ${sum.toFixed(2)} s is past its ${T.budget.reference} s reference`);
  // M1 step 3b (M1.md §3.7): the drawn Chart's art. src/chart-art.js holds exactly the shipped waters' sheets (LOOP.shipped; with
  // none set, the waters LOOP.waters holds), every place a sheet names exists in LOOP.places, and nothing of an unshipped water
  // (its name, a never-charted name) is in it
  {
    const { CHART_ART: CA } = await import('../src/chart-art.js');
    const ord = (id) => Number(LP.waters?.[id]?.order) || 0;
    const sh = LP.shipped;
    const shipped = Object.keys(LP.waters || {}).filter((id) => ord(id) > 0 && (typeof sh === 'string' ? ord(id) <= ord(sh) : Array.isArray(sh) ? sh.includes(id) : true)).sort((a, b) => ord(a) - ord(b));
    const art = Array.isArray(CA?.sheets) ? CA.sheets : [];
    ok4(same(art.map((q) => q.water), shipped), `chart-art.js: its sheets are exactly the shipped waters' (${art.map((q) => q.water).join(', ')} against ${shipped.join(', ')})`);
    ok4(art.every((q) => q.n === ord(q.water) && Array.isArray(q.box) && q.box.length === 4 && typeof q.uri === 'string' && q.uri.startsWith('data:image/webp;base64,') && /^[0-9a-f]{8}$/.test(q.hash)), 'chart-art.js: each sheet is its water\'s (n = LOOP.waters order), a box, a WebP crop and its decoded pixels\' hash');
    const LPL = LP.places, placeIds = new Set(Array.isArray(LPL) ? LPL.map((q) => q?.id) : LPL && typeof LPL === 'object' ? Object.keys(LPL) : []);
    const named = art.flatMap((q) => Array.isArray(q.places) ? q.places : []).concat(Array.isArray(CA?.live?.places) ? CA.live.places : []);
    ok4(named.every((id) => placeIds.has(typeof id === 'string' ? id : id?.id)), `chart-art.js: every place on a sheet exists in LOOP.places (${named.length} named)`);
    const text = JSON.stringify(CA?.live || {});
    const later = L4.ZONES.filter((z) => !shipped.includes(z.id)).map((z) => z.name.replace(/^The /, ''));
    ok4(![...later, 'Eastern Downs', 'Morning Gulf', 'Morning Isle', 'Low Horn'].some((nm) => text.includes(nm)), 'chart-art.js: no name of an unshipped water, and none of WORLD §10\'s never list');
    ok4((CA?.live?.waters || []).every((w) => shipped.includes(w.water)) && (CA?.live?.pieces || []).every((pc) => pc.leg <= Math.max(...art.map((q) => q.n))), 'chart-art.js: no lamp, vignette or road leg of an unshipped sheet');
    ok4(typeof TL.comingSoon === 'string' && TL.comingSoon === 'Coming soon', 'TEXT_LOOP.comingSoon: "Coming soon" (SPEC §5.4)');
  }
  // Murk's catalogue (16 November 2026): its two words, the name on the running head and the cover, the order line round the price
  ok4(typeof TL.goods?.name === 'string' && TL.goods.name.length > 0 && TL.goods.name.length <= 18 && TL.goods.name.split(/\s+/).length <= 3,
    `TEXT_LOOP.goods.name: the catalogue's name, at most three words and 18 characters ("${TL.goods?.name}")`);
  ok4(typeof TL.goods?.buy === 'string' && /^[A-Z][a-z]+ · \{price\}$/.test(TL.goods.buy) && !/%/.test(JSON.stringify(TL.goods)), `TEXT_LOOP.goods.buy: one word and the price ("${TL.goods?.buy}"), no percentage`);
  // the Wick's sheet (SHEET.md §6): its few words, each row ≤ 36 characters (an exact line two rows, ≤ 72), no typed percentage, no
  // "Hold {n}" form (on the sheet "Hold" is the grip only), and the title a template on the Wick's name
  if (TL.sheet) {
    const SW = [];
    const walkS = (v, k) => { if (typeof v === 'string') SW.push([k, v]); else if (v && typeof v === 'object') for (const [kk, x] of Object.entries(v)) walkS(x, `${k}.${kk}`); };
    walkS(TL.sheet, 'sheet');
    const filled = (v) => v.replace(/\{\w+\}/g, '0.00');   // (a slot as wide as the widest figure it takes)
    const longS = SW.filter(([k, v]) => filled(v).length > (k.startsWith('sheet.exact.') ? 76 : 36));
    ok4(longS.length === 0, `TEXT_LOOP.sheet: every row ≤ 36 characters filled, an exact line ≤ 76 (two rows at 18 px in a 358 px column)${longS.length ? `: ${longS.map(([k]) => k).join(', ')}` : ''}`);
    ok4(!SW.some(([, v]) => /\d\s*%/.test(v)) && !SW.some(([, v]) => /(^|[^+\d{])Hold \d/.test(v)), 'TEXT_LOOP.sheet: no typed percentage and no "Hold {n}"');
    ok4(TL.sheet.title === "{name}'s Sheet" && Object.keys(TL.sheet.exact || {}).sort().join() === [...LP.wicks.order].sort().join(), 'TEXT_LOOP.sheet: "{name}\'s Sheet" and one exact line for each Wick');
  }
  // >>> M1 step 5b (LANE 5B-TOW; SPEC §6.5, OPENING §6.2 rev. 5): the tow's parts, each water's leg on the Chart's live layer, and the
  // opening untouched (the Landing's dip and arrive, the wake line, the leg, the dip, the glide in, the chart beat, the glide out)
  if (LP.tow) {
    const TW = LP.tow, { CHART_ART: CA } = await import('../src/chart-art.js');
    ok4(TW.leg?.base === 4 && TW.leg?.crossing === 0.5 && TW.leg?.max === 6 && TW.dip === 0.6 && TW.glide === 3, 'LOOP.tow: the leg 4 s + 0.5 s a crossing, at most 6 s; the dip 0.6 s; the glide in 3 s (SPEC §6.5)');
    const pieces = new Set((CA?.live?.pieces || []).map((p) => p.id));
    for (const [water, leg] of Object.entries(TW.legs || {})) {
      ok4(pieces.has(leg.piece) && (leg.crossings || []).every((c) => ['locks', 'fall', 'sea'].includes(c.kind) && c.at > 0 && c.at < 1), `LOOP.tow.legs.${water}: its piece (${leg.piece}) on the Chart's live layer, each crossing a lock flight, fall or sea passage on the way`);
      ok4(L4.towLegSeconds(leg) <= TW.leg.max && L4.towPlan(water).total <= 10, `LOOP.tow.legs.${water}: the leg ${L4.towLegSeconds(leg)} s, the tow ${L4.towPlan(water).total.toFixed(1)} s ≤ 10 s`);
    }
    if (TW.opening === true && TW.legs?.mossmere) {
      const P = L4.towPlan('mossmere'), Ld = TW.landing || {};
      const open = Ld.dip + Ld.arrive + murkHold(TL.murk.wake, FL) + Ld.wakeAfter + P.total + depart + T.out;
      ok4(L4.towLegSeconds(TW.legs.mossmere) === 5 && open <= T.budget.max, `the opening (OPENING §6.2): the Sluice Run's leg 5 s; untouched ${open.toFixed(2)} s from the film's end to the first trip ≤ ${T.budget.max} s`);
    }
  }
  // <<< M1 step 5b
  for (const w of warns) console.log('  warn:', w);
  if (errs.length) {
    for (const e of errs.slice(0, 80)) console.log('  FAIL:', e);
    console.log(`validate-data --loop: ${errs.length} failure(s) in ${n} checks`);
    process.exit(1);
  }
  console.log(`validate-data --loop (V3_ENABLED, V3_PHASE 1 and LOOP_ENABLED on): OK (${n} checks; ${Object.keys(PK).length} parked, ${H.ladder.length} hold steps, ${W.order.length} Wicks, ${words.length} words; the tutorial ${sum.toFixed(2)} s of ${T.budget.max})`);
  process.exit(0);
}
if (WALK) globalThis.GW_WALK = true;
if (V3) globalThis.GW_V3 = true;
const D = await import(WALK ? '../src/data.js?walk' : '../src/data.js');

const errors = [];
const warnings = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) errors.push(msg); return !!cond; };
const warn = (cond, msg) => { if (!cond) warnings.push(msg); };
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isInt = (v) => Number.isInteger(v);
const isStr = (v) => typeof v === 'string' && v.length > 0;
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// ---------------------------------------------------------------------------- exports
const REQUIRED_EXPORTS = ['STATS', 'BALANCE', 'ZONES', 'SPECIES', 'BAITS', 'UPGRADES', 'SUPPLIES', 'RELICS', 'ENEMIES',
  'BOONS', 'CHARACTERS', 'CHALLENGES', 'BOUNTIES', 'TIPS', 'MERCHANT_LINES', 'EPITAPHS', 'TEXT', 'QUALITY',
  'FISH_SHAPES', 'CREATURE_KINDS', 'difficultyFor', 'xpForLevel', 'memoriesFor',
  'SPECIES_BY_ID', 'ZONE_BY_ID', 'ENEMY_BY_ID', 'UPGRADE_BY_ID', 'RELIC_BY_ID', 'BAIT_BY_ID', 'SUPPLY_BY_ID',
  'BOON_BY_ID', 'CHARACTER_BY_ID', 'CHALLENGE_BY_ID'];
for (const k of REQUIRED_EXPORTS) ok(k in D, `missing export ${k}`);

// ---------------------------------------------------------------------------- the flag-off fingerprint (passes 1 and 2)
// Every export of the c0e0ab9 data.js must hash identically with V3 off (v1 in pass 1, the walking build in pass 2): v3 may only
// add exports and act inside `if (V3_ENABLED)`. `--refresh-fingerprint` rewrites tools/tests/v1-exports.json from this build.
if (!V3) {
  const { fingerprint } = await import('./fingerprint.mjs');
  const fs = await import('node:fs');
  const FP_PATH = new URL('./tests/v1-exports.json', import.meta.url);
  const REF = JSON.parse(fs.readFileSync(FP_PATH, 'utf8'));
  const key = WALK ? 'walk' : 'v1', now = fingerprint(D, REF.names);
  if (process.argv.includes('--refresh-fingerprint')) {
    REF[key] = now; REF.refreshed = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(FP_PATH, JSON.stringify(REF, null, 1) + '\n'); console.log(`  fingerprint (${key}) refreshed`);
  } else {
    for (const n of REF.names) ok(now[n] === REF[key][n], `flag-off fingerprint: export ${n} changed from ${REF.from} in the ${key} build (v3 must stay behind V3_ENABLED; refresh only on purpose with --refresh-fingerprint)`);
  }
}
ok(D.V3_ENABLED === V3, `V3_ENABLED must be ${V3} in this pass`);
// the Full Hold stays off in passes 1–3 (slice-1a PLAN §4.3): no switch, nothing parked, no loop words in TEXT
ok(D.LOOP_ENABLED === false && Object.keys(D.PARKED || {}).length === 0 && !('loop' in D.TEXT), 'the loop is off in this pass (LOOP_ENABLED false, PARKED {}, no TEXT.loop)');

// ---------------------------------------------------------------------------- STATS (contract §8 list)
const STAT_KEYS = ['maxHp', 'maxOil', 'maxSatiety', 'oilDrain', 'satietyDrain', 'lightRadius', 'auraDps', 'flareCost',
  'flareRadius', 'flareCooldown', 'zapCost', 'zapDamage', 'damageMult', 'cooldownMult', 'critChance', 'moveSpeed',
  'pickupRadius', 'xpMult', 'luck', 'rerolls', 'dawnHeal', 'castMax', 'lineStrength', 'reelSpeed', 'sweetZone',
  'biteSpeed', 'hookWindow', 'rarityBonus', 'creelSize', 'sellMult', 'foodMult', 'oilYieldMult', 'armor', 'slackTime',
  'nibbleTells', ...(WALK ? ['stride'] : [])];   // v2 (walking): stride, + m/s on foot (DESIGN §24.3); v3 adds no STATS key (D1′ retired the manual reel's fight stats)
const FMTS = new Set(['int', 'pct', 'x', 'm', 's', 'num']);
for (const k of STAT_KEYS) {
  const s = D.STATS[k];
  if (!ok(isObj(s), `STATS.${k} missing`)) continue;
  ok(isNum(s.base), `STATS.${k}.base not numeric`);
  ok(isStr(s.label), `STATS.${k}.label missing`);
  ok(FMTS.has(s.fmt), `STATS.${k}.fmt invalid (${s.fmt})`);
  if (isNum(s.min) && isNum(s.max)) ok(s.min <= s.base && s.base <= s.max, `STATS.${k} base outside [min,max]`);
}
for (const k of Object.keys(D.STATS)) warn(STAT_KEYS.includes(k), `STATS.${k} is not a contract key`);
ok(D.STATS.armor?.max <= 0.6, 'STATS.armor max must be ≤ 0.6 (contract)');
const isStatKey = (k) => k in D.STATS;

// ---------------------------------------------------------------------------- BALANCE
const B = D.BALANCE;
for (const k of ['phases', 'drain', 'damage', 'move', 'xp', 'reel', 'cast', 'combat']) ok(isObj(B?.[k]), `BALANCE.${k} missing`);
for (const p of ['calm', 'dusk', 'gloomtide', 'dawn']) ok(isNum(B.phases?.[p]) && B.phases[p] > 0, `BALANCE.phases.${p} invalid`);
for (const k of ['accel', 'drag', 'turnRate']) ok(isNum(B.move?.[k]), `BALANCE.move.${k} missing`);

// ---------------------------------------------------------------------------- ZONES
const ZONE_IDS = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
ok(D.ZONES.length === 4, 'ZONES must have exactly 4 entries');
const PALETTE_KEYS = ['fog', 'fogDensity', 'water', 'waterDeep', 'foam', 'glow', 'accent', 'ambient', 'ink', 'far', 'light'];
D.ZONES.forEach((z, i) => {
  ok(z.id === ZONE_IDS[i], `ZONES[${i}].id must be ${ZONE_IDS[i]} (got ${z.id})`);
  ok(z.index === i, `ZONES[${i}].index must be ${i}`);
  ok(isStr(z.name) && isStr(z.subtitle) && isStr(z.description), `ZONES[${i}] name/subtitle/description`);
  const a = z.arena;
  if (ok(isObj(a), `${z.id}.arena missing`)) {
    ok(isNum(a.radius) && a.radius >= 55 && a.radius <= 80, `${z.id}.arena.radius must be 55–80`);
    ok(isNum(a.seed), `${z.id}.arena.seed`);
    ok(Array.isArray(a.islands) && Array.isArray(a.pillars), `${z.id}.arena islands/pillars arrays`);
    const obs = [...(a.islands || []), ...(a.pillars || [])];
    for (const o of obs) {
      ok(isNum(o.x) && isNum(o.z) && isNum(o.r) && o.r > 0, `${z.id} obstacle has bad geometry`);
      ok(Math.hypot(o.x, o.z) + o.r < a.radius - 2, `${z.id} obstacle (${o.x},${o.z}) pokes out of the lake`);
    }
    for (let p = 0; p < obs.length; p++) for (let q = p + 1; q < obs.length; q++) {
      const A = obs[p], C = obs[q];
      ok(Math.hypot(A.x - C.x, A.z - C.z) >= A.r + C.r + 1.5, `${z.id} obstacles overlap / no raft gap: (${A.x},${A.z}) & (${C.x},${C.z})`);
    }
    const clearOf = (pt, pad) => obs.every((o) => Math.hypot(pt.x - o.x, pt.z - o.z) >= o.r + pad);
    if (ok(isObj(a.spawn), `${z.id}.arena.spawn`)) ok(clearOf(a.spawn, 3) && Math.hypot(a.spawn.x, a.spawn.z) < a.radius - 3, `${z.id} spawn blocked`);
    if (a.gate) ok(clearOf(a.gate, a.gate.r + 1) && Math.hypot(a.gate.x, a.gate.z) + a.gate.r < a.radius - 3, `${z.id} gate blocked`);
    else ok(i === 3, `${z.id} needs a gate (only the final lake has none)`);
    if (ok(isObj(a.legendPool), `${z.id}.arena.legendPool`)) ok(clearOf(a.legendPool, a.legendPool.r + 1), `${z.id} legend pool blocked`);
    ok(Array.isArray(a.docks) && a.docks.length >= 3, `${z.id} needs ≥ 3 docks`);
    for (const d of a.docks || []) ok(clearOf(d, 2.5) && Math.hypot(d.x, d.z) < a.radius - 1, `${z.id} dock (${d.x},${d.z}) blocked / outside`);
  }
  ok(isObj(z.unlock) && isNum(z.unlock.shells) && Array.isArray(z.unlock.requires), `${z.id}.unlock {shells, requires[]}`);
  ok(isObj(z.drain) && isNum(z.drain.oil) && isNum(z.drain.satiety), `${z.id}.drain`);
  ok(isNum(z.gloom) && isNum(z.valueMult), `${z.id}.gloom / valueMult`);
  for (const k of PALETTE_KEYS) ok(isNum(z.palette?.[k]), `${z.id}.palette.${k} must be a number`);
  // optional Starlit keys (DESIGN §19.2): lamp / candle / nebula colours, stars brightness
  for (const k of ['lamp', 'candle', 'nebula']) if (z.palette && k in z.palette) ok(isNum(z.palette[k]) && z.palette[k] >= 0 && z.palette[k] <= 0xffffff, `${z.id}.palette.${k} must be a 0xRRGGBB number`);
  if (z.palette && 'stars' in z.palette) ok(isNum(z.palette.stars) && z.palette.stars >= 0 && z.palette.stars <= 3, `${z.id}.palette.stars must be 0–3`);
  // palette rule (DESIGN §19.1): no lake colour in the green/teal band (hue 65–195°) unless it is a near-grey
  for (const [k, v] of Object.entries(z.palette || {})) {
    if (k === 'fogDensity' || k === 'stars' || !isNum(v)) continue;
    const r = ((v >> 16) & 255) / 255, g = ((v >> 8) & 255) / 255, b = (v & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, sat = mx > 0 ? d / mx : 0;
    if (sat < 0.12 || d === 0) continue;
    let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    ok(!(h >= 65 && h < 195), `${z.id}.palette.${k} (#${v.toString(16).padStart(6, '0')}) sits in the green/teal band (hue ${h.toFixed(0)}°)`);
  }
  if (i > 0) ok(z.unlock.requires.some((r) => r.type === 'legendary' && r.id === D.ZONES[i - 1].legendary), `${z.id} gate must require ${D.ZONES[i - 1].legendary}`);
});

// ---------------------------------------------------------------------------- SPECIES
const RARITIES = ['common', 'uncommon', 'rare', 'legendary'];
const TIMES = ['any', 'calm', 'gloom'];
const BEHAVIORS = ['steady', 'darter', 'sinker', 'thrasher', 'leaper'];
const DIFF_KEYS = ['power', 'surgeEvery', 'surgeTime', 'stamina', 'sweet', 'erratic', 'window'];
const baitIds = new Set(D.BAITS.map((b) => b.id));
ok(JSON.stringify(D.FISH_SHAPES) === JSON.stringify(['minnow', 'perch', 'carp', 'pike', 'eel', 'angler', 'ray', 'puffer', 'jelly', 'crayfish', 'koi', 'ghost', 'leviathan', ...(V3 ? ['sturgeon'] : [])]), `FISH_SHAPES must match the contract list${V3 ? ' (+ sturgeon in v3)' : ''}`);
ok(JSON.stringify(D.CREATURE_KINDS) === JSON.stringify(['wisp', 'mite', 'moth', 'eel', 'hand', 'warden']), 'CREATURE_KINDS must match the contract list');
for (const s of D.SPECIES) {
  const id = s.id || '?';
  for (const f of ['id', 'name', 'zone', 'rarity', 'weight', 'value', 'food', 'oil', 'time', 'depth', 'bait', 'difficulty', 'behavior', 'model', 'lore'])
    ok(f in s, `species ${id} missing field ${f}`);
  ok(!('dist' in s), `species ${id} still uses 'dist' (hybrid uses 'depth')`);
  ok(ZONE_IDS.includes(s.zone) || (V3 && (s.zone === 'cove' || (s.zone === null && s.wanderer && s.zones.every((z) => ZONE_IDS.includes(z))))), `species ${id} bad zone ${s.zone}`);
  ok(RARITIES.includes(s.rarity), `species ${id} bad rarity ${s.rarity}`);
  ok(Array.isArray(s.weight) && s.weight.length === 2 && isNum(s.weight[0]) && s.weight[0] > 0 && s.weight[0] < s.weight[1], `species ${id} weight must be [min<max]`);
  ok(Array.isArray(s.depth) && s.depth.length === 2 && s.depth[0] >= 0 && s.depth[1] <= 1 && s.depth[0] < s.depth[1], `species ${id} depth must be [min<max] within 0..1`);
  for (const k of ['value', 'food', 'oil']) ok(isNum(s[k]) && (s[k] > 0 || (V3 && k === 'value' && s.noSale && s[k] === 0)), `species ${id}.${k} must be > 0`);
  ok(TIMES.includes(s.time) || (V3 && s.time === 'dawn'), `species ${id} bad time ${s.time}`);
  ok(s.bait === null || baitIds.has(s.bait), `species ${id} bait ${s.bait} unknown`);
  ok(BEHAVIORS.includes(s.behavior), `species ${id} bad behavior ${s.behavior}`);
  for (const k of DIFF_KEYS) ok(isNum(s.difficulty?.[k]), `species ${id}.difficulty.${k} not numeric`);
  const d = s.difficulty || {};
  ok(d.power >= 0.5 && d.power <= 3, `species ${id} power ${d.power} outside 0.5–3`);
  ok(d.erratic >= 0 && d.erratic <= 1, `species ${id} erratic outside 0..1`);
  ok(d.surgeEvery > d.surgeTime && d.stamina > 0 && d.sweet > 0 && d.window > 0, `species ${id} difficulty sanity`);
  const warnT = s.behavior === 'darter' ? B.reel.darterWarn : Math.max(B.reel.warnMin, B.reel.warnBase - B.reel.warnErratic * d.erratic);
  ok((d.surgeTime + warnT) / d.surgeEvery <= B.reel.dutyCap + 0.011, `species ${id} violates the surge duty cap`);
  const m = s.model || {};
  ok(D.FISH_SHAPES.includes(m.shape), `species ${id} model.shape ${m.shape} not in FISH_SHAPES`);
  for (const c of ['body', 'belly', 'fin']) ok(isNum(m[c]), `species ${id} model.${c} colour must be a number`);
  ok(m.glow === null || isNum(m.glow), `species ${id} model.glow must be a number or null`);
  ok(isNum(m.scale) && m.scale > 0, `species ${id} model.scale`);
  if (s.rarity === 'legendary') {
    ok(isObj(s.boss) && Array.isArray(s.boss.phases) && s.boss.phases.length > 0, `legendary ${id} needs a boss script`);
    ok(s.bait && D.BAIT_BY_ID[s.bait]?.legend === true, `legendary ${id} must require a legend bait`);
    ok(D.ZONE_BY_ID[s.zone]?.legendary === id, `legendary ${id} is not its zone's .legendary`);
  } else {
    ok(!s.final, `non-legendary ${id} marked final`);
    ok(!s.bait || !D.BAIT_BY_ID[s.bait]?.legend, `non-legendary ${id} requires a legend bait`);
  }
}
for (const z of ZONE_IDS) {
  const zs = D.SPECIES.filter((s) => s.zone === z);
  ok(zs.filter((s) => s.rarity === 'legendary').length === 1, `zone ${z} must have exactly one legendary`);
  // every depth must have an always-available (any-time, no-bait) common
  for (let dd = 0; dd <= 1.0001; dd += 0.01) {
    ok(zs.some((s) => s.rarity === 'common' && s.time === 'any' && !s.bait && s.depth[0] <= dd + 1e-9 && dd - 1e-9 <= s.depth[1]),
      `zone ${z} has no any-time common at depth ${dd.toFixed(2)}`);
  }
}
const FINAL = V3 ? 'lantern_swallower' : 'pale_leviathan';   // renamed in v3 (RENAMES.species)
ok(D.SPECIES_BY_ID[FINAL]?.final === true, `${FINAL} must have final:true`);
ok(D.SPECIES_BY_ID[FINAL]?.zone === 'paleabyss', `${FINAL} must live in paleabyss`);
ok(D.SPECIES.filter((s) => s.final).length === 1, 'exactly one species may be final');

// ---------------------------------------------------------------------------- BAITS
const BAIT_EXTRA = new Set(['attract', 'weightBias', 'shimmer', 'gloomDraw']);
for (const b of D.BAITS) {
  ok(isStr(b.id) && isStr(b.name) && isNum(b.price) && b.price > 0 && isInt(b.count) && b.count > 0, `bait ${b.id} basics`);
  for (const k of Object.keys(b.bonus || {})) ok(isStatKey(k) || BAIT_EXTRA.has(k), `bait ${b.id} bonus key ${k} unknown`);
  for (const sid of b.bonus?.attract || []) ok(!!D.SPECIES_BY_ID[sid], `bait ${b.id} attracts unknown species ${sid}`);
  if (b.unlock) ok(!!D.CHALLENGE_BY_ID[b.unlock], `bait ${b.id} unlock ${b.unlock} is not a challenge`);
}

// ---------------------------------------------------------------------------- UPGRADES / RELICS / SUPPLIES
const checkLevelled = (list, name) => {
  for (const u of list) {
    ok(isInt(u.maxLevel) && u.maxLevel >= 1, `${name} ${u.id} maxLevel`);
    ok(Array.isArray(u.costs) && u.costs.length === u.maxLevel, `${name} ${u.id} costs.length !== maxLevel`);
    ok((u.costs || []).every((c, i, a) => isNum(c) && c > 0 && (i === 0 || c >= a[i - 1])), `${name} ${u.id} costs must be positive & non-decreasing`);
    for (const [k, v] of Object.entries(u.effects || {})) ok(isStatKey(k) && isNum(v), `${name} ${u.id} effect ${k} not a STATS key / number`);
  }
};
checkLevelled(D.UPGRADES, 'upgrade');
checkLevelled(D.RELICS, 'relic');
for (const u of D.UPGRADES) ok(u.zone === null || u.zone === undefined || ZONE_IDS.includes(u.zone), `upgrade ${u.id} zone ${u.zone}`);
for (const r of D.RELICS) {
  ok(r.unlock === null || !!D.CHALLENGE_BY_ID[r.unlock], `relic ${r.id} unlock ${r.unlock} is not a challenge`);
  if (r.special) ok(/^(startShells:\d+|startKit|shimmer:[\d.]+|memMult:[\d.]+|secondWick|waystone:(sporewood|glasswater|paleabyss)|lampRadius:\d+|shortcutStart:\d+|measuringCord|spyglass|rumourShell)$/.test(r.special) && (WALK || !/^(lampRadius|shortcutStart)/.test(r.special))
    && (V3 || !/^(measuringCord|spyglass|rumourShell)$/.test(r.special)), `relic ${r.id} special '${r.special}' unknown`);
  ok(Object.keys(r.effects || {}).length > 0 || !!r.special || (V3 && !!D.CATCH_V3.buffs.relics[r.id]), `relic ${r.id} does nothing`);   // v3: Hold from CATCH_V3.buffs
}
for (const s of D.SUPPLIES) for (const k of Object.keys(s.give || {})) ok(['oil', 'satiety', 'hp', 'flareCharges', 'spots', ...(WALK ? ['stake'] : []), ...(V3 ? ['chum'] : [])].includes(k), `supply ${s.id} give key ${k}`);

// ---------------------------------------------------------------------------- ENEMIES
for (const e of D.ENEMIES) {
  ok(D.CREATURE_KINDS.includes(e.model), `enemy ${e.id} model ${e.model} not in wisp|mite|moth|eel|hand|warden`);
  for (const k of ['hp', 'speed', 'damage', 'oilDrain', 'xp']) ok(isNum(e[k]) && e[k] >= 0, `enemy ${e.id}.${k} must be a number ≥ 0`);
  ok(e.hp > 0 && isStr(e.behavior) && ZONE_IDS[e.zoneMin] !== undefined, `enemy ${e.id} hp/behavior/zoneMin`);
  ok(Array.isArray(e.weights) && e.weights.length === 4, `enemy ${e.id} weights[4]`);
  if (e.boss) ok(D.ZONE_BY_ID[e.zone]?.warden === e.id, `warden ${e.id} not referenced by its zone`);
}
ok(D.ENEMIES.some((e) => e.elite), 'need at least one elite enemy');
for (const z of D.ZONES) ok(D.ENEMY_BY_ID[z.warden]?.boss === true, `zone ${z.id} warden ${z.warden} is not a boss enemy`);

// ---------------------------------------------------------------------------- BOONS
const BOON_RARITY = ['common', 'rare', 'epic', 'legendary'];
for (const b of D.BOONS) {
  ok(isStr(b.id) && isStr(b.name) && isStr(b.desc) && isStr(b.icon), `boon ${b.id} id/name/desc/icon`);
  ok(BOON_RARITY.includes(b.rarity), `boon ${b.id} rarity ${b.rarity}`);
  ok(isInt(b.maxLevel) && b.maxLevel >= 1, `boon ${b.id} maxLevel`);
  ok(b.kind === 'stat' || b.kind === 'weapon', `boon ${b.id} kind`);
  ok(Array.isArray(b.tags), `boon ${b.id} tags[]`);
  ok(b.unlock === null || !!D.CHALLENGE_BY_ID[b.unlock], `boon ${b.id} unlock ${b.unlock} is not a challenge`);
  if (b.kind === 'weapon') {
    ok(isStr(b.weapon), `weapon boon ${b.id} missing weapon type`);
    ok(Array.isArray(b.levels) && b.levels.length === b.maxLevel, `weapon boon ${b.id} levels.length !== maxLevel`);
    for (const [i, L] of (b.levels || []).entries()) {
      const nums = Object.entries(L).filter(([k]) => k !== 'note');
      ok(nums.length > 0 && nums.every(([, v]) => isNum(v) || typeof v === 'boolean' || Array.isArray(v)), `weapon ${b.id} level ${i + 1} params`);
      ok(isNum(L.damage) || isNum(L.dps), `weapon ${b.id} level ${i + 1} has no damage/dps`);
    }
    if (b.kindle) ok(D.BOON_BY_ID[b.kindle.requires]?.kind === 'stat' && isObj(b.kindle.params), `weapon ${b.id} kindle.requires must be a stat boon`);
  } else {
    ok(isObj(b.effects), `stat boon ${b.id} effects{}`);
    for (const [k, v] of Object.entries(b.effects || {})) ok(isStatKey(k) && isNum(v), `stat boon ${b.id} effect ${k} not a STATS key`);
    ok(Object.keys(b.effects || {}).length > 0 || !!b.proc || (V3 && !!D.CATCH_V3.buffs.boons[b.id]), `stat boon ${b.id} does nothing`);   // v3: Hold from CATCH_V3.buffs
    if (b.proc?.levels) ok(b.proc.levels.length === b.maxLevel, `stat boon ${b.id} proc.levels.length !== maxLevel`);
  }
}

// ---------------------------------------------------------------------------- CHARACTERS
ok(D.CHARACTERS.length === 5 + (WALK ? D.WALK_CHARACTERS.length : 0), `need exactly ${5 + (WALK ? D.WALK_CHARACTERS.length : 0)} characters`);
ok(D.CHARACTERS.filter((c) => c.unlock === null).length === 1, 'exactly one character must be unlocked from the start');
for (const c of D.CHARACTERS) {
  ok(c.startBoon === null || !!D.BOON_BY_ID[c.startBoon], `character ${c.id} startBoon ${c.startBoon} unknown`);
  ok(c.unlock === null || !!D.CHALLENGE_BY_ID[c.unlock], `character ${c.id} unlock ${c.unlock} is not a challenge`);
  for (const k of Object.keys(c.effects || {})) ok(isStatKey(k), `character ${c.id} effect ${k} not a STATS key`);
  ok(isObj(c.startKit) && isObj(c.look), `character ${c.id} startKit/look`);
  for (const bid of Object.keys(c.startKit?.bait || {})) ok(baitIds.has(bid), `character ${c.id} kit bait ${bid}`);
  for (const k of ['flame', 'cloak', 'eyes']) ok(isNum(c.look?.[k]), `character ${c.id} look.${k} must be a number`);
}

// ---------------------------------------------------------------------------- CHALLENGES (+ unlock cross-refs)
if (V3) ok(D.CHALLENGES.length === 48, `CHALLENGES must hold 48 goals in v3 (30 + tier IV 10 + tier V 8), got ${D.CHALLENGES.length}`);
else ok(D.CHALLENGES.length >= 24 && D.CHALLENGES.length <= (WALK ? 40 : 30), `CHALLENGES must hold 24–${WALK ? 40 : 30} goals${WALK ? ' (v2: + tier IV Paths Underfoot)' : ''}`);
const COSMETIC_BY_ID = V3 ? Object.fromEntries(D.COSMETICS_V3.map((c) => [c.id, c])) : {};
const unlockTargetExists = (key) => {
  const [kind, id] = key.split(':');
  return ({ character: D.CHARACTER_BY_ID, boon: D.BOON_BY_ID, relic: D.RELIC_BY_ID, bait: D.BAIT_BY_ID, cosmetic: COSMETIC_BY_ID })[kind]?.[id];
};
for (const ch of D.CHALLENGES) {
  ok(isStr(ch.id) && isStr(ch.name) && isStr(ch.desc) && isStr(ch.type) && isObj(ch.params), `challenge ${ch.id} basics`);
  ok((V3 ? ch.scope === 'expedition' : ch.scope === 'run') || ch.scope === 'total', `challenge ${ch.id} scope ${ch.scope}`);
  ok(isObj(ch.reward) && isNum(ch.reward.memories), `challenge ${ch.id} reward.memories`);
  if (ch.reward?.unlock) {
    const target = unlockTargetExists(ch.reward.unlock);
    if (ok(!!target, `challenge ${ch.id} unlocks unknown ${ch.reward.unlock}`)) ok(target.unlock === ch.id, `${ch.reward.unlock}.unlock should name ${ch.id} (got ${target.unlock})`);
  }
}
// every gated item is unlocked by exactly the challenge it names
for (const [kind, list] of [['boon', D.BOONS], ['relic', D.RELICS], ['character', D.CHARACTERS], ['bait', D.BAITS], ...(V3 ? [['cosmetic', D.COSMETICS_V3]] : [])]) {
  for (const it of list) if (it.unlock) ok(D.CHALLENGE_BY_ID[it.unlock]?.reward?.unlock === `${kind}:${it.id}`, `${kind} ${it.id} is gated by ${it.unlock}, which does not unlock it`);
}

// ---------------------------------------------------------------------------- functions
let prev = -Infinity;
for (let L = 1; L <= 60; L++) {
  const x = D.xpForLevel(L);
  ok(isNum(x) && x > prev, `xpForLevel(${L}) = ${x} not finite / strictly increasing`);
  prev = x;
}
const DIFF_FIELDS = ['spawnRate', 'maxAlive', 'hpMult', 'speedMult', 'damageMult', 'drainMult', 'eliteEvery'];
for (let day = 1; day <= 40; day++) for (let z = 0; z <= 3; z++) for (const k of [0, 0.5, 1]) {
  for (const opts of [undefined, { nightInZone: ((day - 1) % 7) + 1 }]) {
    const r = D.difficultyFor(day, z, k, opts);
    const tag = `difficultyFor(${day},${z},${k}${opts ? ',niz' : ''})`;
    for (const f of DIFF_FIELDS) ok(isNum(r?.[f]) && r[f] >= 0, `${tag}.${f} not a finite number ≥ 0`);
    ok(r.hpMult >= 1 && r.speedMult >= 1 && r.damageMult >= 1 && r.drainMult >= 1 && r.maxAlive > 0, `${tag} multipliers < 1`);
    ok(Array.isArray(r.kinds) && r.kinds.length > 0, `${tag}.kinds empty`);
    for (const kd of r.kinds || []) {
      const e = D.ENEMY_BY_ID[kd.id];
      ok(!!e && !e.boss && !e.elite && isNum(kd.w) && kd.w > 0, `${tag} kind ${kd.id} invalid`);
    }
    ok(r.boss === null || D.ENEMY_BY_ID[r.boss]?.boss === true, `${tag}.boss ${r.boss} invalid`);
  }
}
// monotone escalation at mid-night
for (let z = 0; z <= 3; z++) for (let day = 2; day <= 40; day++) {
  const a = D.difficultyFor(day - 1, z, 0.5), b = D.difficultyFor(day, z, 0.5);
  ok(b.hpMult >= a.hpMult && b.maxAlive >= a.maxAlive, `difficultyFor not monotone at day ${day}, z ${z}`);
}
// optional balance extras (DESIGN §23.2): linger Heat, Warden hp scaling, Memories constants
const DIR = B.combat.director;
for (const k of ['lingerFrom', 'lingerHeat', 'bossHpLin']) if (k in DIR) ok(isNum(DIR[k]) && DIR[k] >= 0, `BALANCE.combat.director.${k}`);
if (B.memories) for (const [k, v] of Object.entries(B.memories)) ok(Array.isArray(v) ? v.length === 4 && v.every(isNum) : isNum(v), `BALANCE.memories.${k}`);
for (let z = 0; z <= 3; z++) for (let day = 1; day <= 30; day++) {
  let prevH = -1;
  for (let niz = 1; niz <= day; niz++) { const H = D.heatFor(day, z, niz); ok(isNum(H) && H >= prevH && H >= day - 1 + 3 * z, `heatFor(${day},${z},${niz}) not monotone in nightInZone`); prevH = H; }
  const r = D.difficultyFor(day, z, 0.5, { nightInZone: 1 });
  if ('bossHpMult' in r) ok(isNum(r.bossHpMult) && r.bossHpMult >= 1, `difficultyFor(${day},${z}).bossHpMult`);
}
const memCases = [{}, { day: 1, zoneIndex: 0 }, { day: 5, zoneIndex: 1, fishCaught: 20, newSpecies: 4, legendaries: { belled_matriarch: true }, bountiesDone: 3, enemiesSlain: 400, nightsSurvived: 4, bossesSlain: 1, elitesSlain: 3, memMult: 0.16 },
  { day: 14, zoneIndex: 3, victory: true, legendaries: 4, trophies: [0, 1], nightsSurvived: 13, deepestEnduredIndex: 3 }];
for (const s of memCases) {
  const m = D.memoriesFor(s);
  ok(isObj(m) && isNum(m.total) && Array.isArray(m.breakdown), `memoriesFor(${JSON.stringify(s)}) shape`);
  ok(m.breakdown.every((r) => isStr(r.label) && isNum(r.value)), 'memoriesFor breakdown rows {label, value}');
  ok(Math.abs(m.breakdown.reduce((a, r) => a + r.value, 0) - m.total) < 1e-9, 'memoriesFor total ≠ Σ breakdown');
}

// ---------------------------------------------------------------------------- lookups, tips, text
for (const [map, arr] of [['SPECIES_BY_ID', 'SPECIES'], ['ZONE_BY_ID', 'ZONES'], ['ENEMY_BY_ID', 'ENEMIES'], ['UPGRADE_BY_ID', 'UPGRADES'],
  ['RELIC_BY_ID', 'RELICS'], ['BAIT_BY_ID', 'BAITS'], ['SUPPLY_BY_ID', 'SUPPLIES'], ['BOON_BY_ID', 'BOONS'], ['CHARACTER_BY_ID', 'CHARACTERS'],
  ['CHALLENGE_BY_ID', 'CHALLENGES'], ['BOUNTY_BY_ID', 'BOUNTIES'], ['FORMATION_BY_ID', 'FORMATIONS'],
  ...(WALK ? [['PLACE_BY_ID', 'PLACES'], ['WALK_FORMATION_BY_ID', 'WALK_FORMATIONS'], ['WALK_BOUNTY_BY_ID', 'WALK_BOUNTIES']] : [])]) {
  if (!D[map] || !D[arr]) continue;
  const ids = D[arr].map((x) => x.id);
  ok(new Set(ids).size === ids.length, `${arr} has duplicate ids`);
  ok(Object.keys(D[map]).length === ids.length && ids.every((id) => D[map][id] === D[arr].find((x) => x.id === id)), `${map} incomplete`);
}
ok(Array.isArray(D.TIPS) && D.TIPS.length > 0, 'TIPS');
for (const t of D.TIPS) {
  ok(isStr(t.id) && isStr(t.trigger) && isStr(t.text), `tip ${t.id} needs string id/trigger/text`);
  ok(t.text.length <= 90, `tip ${t.id} longer than 90 chars`);
}
ok(new Set(D.TIPS.map((t) => t.id)).size === D.TIPS.length, 'duplicate tip ids');

// ---------------------------------------------------------------------------- palette rule (DESIGN §19.1)
// Green and teal (hue 65–195°) only as rare trace accents: no data colour (fish, characters, lake palettes,
// rarity colours) may sit in that band with any real saturation. The Mossback Perch's breath of sage (≤ 0.13) passes.
const hsl = (n) => {
  const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (d === 0) return { h: -1, s: 0, l };
  let h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  return { h, s: d / (1 - Math.abs(2 * l - 1)), l };
};
const PAL_MAX_SAT = 0.15;
const palCheck = (path, n) => {
  if (!isNum(n)) return;
  const { h, s } = hsl(n);
  ok(!(h >= 65 && h <= 195 && s >= PAL_MAX_SAT), `palette: ${path} #${n.toString(16).padStart(6, '0')} is green/teal (hue ${h.toFixed(0)}°, sat ${s.toFixed(2)}); DESIGN §19.1`);
};
for (const s of D.SPECIES) for (const k of ['body', 'belly', 'fin', 'glow']) palCheck(`species ${s.id}.model.${k}`, s.model?.[k]);
for (const c of D.CHARACTERS) for (const [k, v] of Object.entries(c.look || {})) if (k !== 'scale') palCheck(`character ${c.id}.look.${k}`, v);
for (const z of D.ZONES) for (const [k, v] of Object.entries(z.palette || {})) if (k !== 'fogDensity') palCheck(`zone ${z.id}.palette.${k}`, v);
for (const [k, v] of Object.entries(D.RARITY_COLORS || {})) palCheck(`RARITY_COLORS.${k}`, v);

// ---------------------------------------------------------------------------- the opening cut scene (INTRO; docs/v3/intro/SPEC.md)
// Checked in every pass: INTRO is always exported and identical in every build (inert until V3_ENABLED). The acceptance numbers
// A1 (length), A2 (skip), A5 (words) and A9 (the set's ceilings) are data rules here, so no lane can retune past them.
{
  const I = D.INTRO;
  if (ok(isObj(I), 'INTRO: the opening cut scene table exists in every build')) {
    const L = I.length, B = I.beats, eps = 1e-9;
    ok(isNum(L) && L >= 15 && L <= 20, `INTRO.length ${L} s must be within 15–20 s (A1)`);
    ok(Array.isArray(B) && B.length >= 3 && B[0].t0 === 0 && Math.abs(B.at(-1).t1 - L) < eps && B.every((b, i) => isStr(b.id) && b.t1 - b.t0 >= 1 && (i === 0 || Math.abs(b.t0 - B[i - 1].t1) < eps))
      && new Set(B.map((b) => b.id)).size === B.length, 'INTRO.beats: unique, contiguous from 0 to INTRO.length, each at least 1 s');
    const beat = (id) => B.find((b) => b.id === id), inBeat = (t, id) => { const b = beat(id); return !!b && t >= b.t0 - eps && t <= b.t1 + eps; };
    // words (A5): at most 4 lines of at most 60 characters, one at a time, readable, none in the wordless beat
    const T = I.text, W = I.words, LN = I.lines;
    ok(Array.isArray(T) && T.length >= 1 && T.length <= 4 && T.every((t) => isStr(t) && t.length <= 60 && t.length <= W.maxChars && !t.includes('%') && !t.includes('!') && !t.includes('\n')),
      'INTRO.text: at most 4 lines, each at most 60 characters, no % and no exclamation mark');
    ok(isObj(I.cove?.text) && Object.entries(I.cove.text).every(([i, t]) => Number(i) < T.length && isStr(t) && t.length <= 60), 'INTRO.cove.text: replacement lines for the cove, each at most 60 characters');
    ok(W.minSize >= 16 && W.size.phone >= W.minSize && W.size.desktop >= W.minSize && W.maxLines <= 2 && W.maxChars === 60
      && ['landscape', 'portrait'].every((k) => Array.isArray(W.band[k]) && W.band[k][0] > 0.5 && W.band[k][0] < W.band[k][1] && W.band[k][1] <= 0.98),
      'INTRO.words: at least 16 px, at most two rows, one band in the lower half per orientation');
    ok(Array.isArray(LN) && LN.length === T.length && LN.every((l, i) => l.i === i && isNum(l.at) && isNum(l.out)), 'INTRO.lines: one timed entry per text line, in order');
    for (const [k, l] of (LN || []).entries()) {
      const dur = l.out - l.at, cps = T[l.i].length / Math.max(0.01, dur - I.lineFade);
      ok(l.at >= 0.5 && dur >= 1.5 && l.out <= L - 0.15, `INTRO.lines[${k}]: on screen at least 1.5 s, gone before the hand-off (at least 0.15 s before the end)`);
      ok(cps <= 17.5, `INTRO.lines[${k}]: ${cps.toFixed(1)} characters a second is too fast to read (at most 17.5 after the fade-in)`);
      ok(k === 0 || l.at >= LN[k - 1].out + 0.2, `INTRO.lines[${k}]: one line at a time (starts at least 0.2 s after the last one is gone)`);
      ok(!(l.at < beat('below').t1 && l.out > beat('below').t0), `INTRO.lines[${k}]: the beat "below" is wordless`);
    }
    ok(I.lineFade > 0 && I.lineFade <= 0.5, 'INTRO.lineFade: at most 0.5 s');
    // the opening ink dip and the stage's swap under it
    ok(Array.isArray(I.veil) && I.veil[0][0] === 0 && I.veil[0][1] === 0 && I.veil.at(-1)[1] === 0 && I.veil.every(([t, k], i) => k >= 0 && k <= 1 && (i === 0 || t > I.veil[i - 1][0])) && I.veil.at(-1)[0] <= 2,
      'INTRO.veil: an ink dip that starts and ends clear within the first 2 s');
    { const full = I.veil.filter(([, k]) => k === 1).map(([t]) => t);
      ok(full.length >= 2 && I.swapAt >= full[0] && I.swapAt <= full.at(-1), 'INTRO.swapAt: the stage takes the picture only while the ink is full'); }
    ok(I.cut.kind === 'hard' && Math.abs(I.cut.at - beat('below').t0) < eps && I.cut.reduced === 'dip', 'INTRO.cut: one hard cut, at the start of "below"; a dip under reduced motion');
    // skip (A2) and the clock (A1)
    const K = I.skip, C = I.clock;
    ok(K.guard === 0.5 && K.showAt >= K.guard && K.showAt <= 1 && K.target >= 44 && ['Escape', 'Enter', 'Space'].every((c) => K.keys.includes(c)) && isStr(K.word),
      'INTRO.skip: a 0.5 s guard, the Skip word shown within 1 s on a target of at least 44 px, Esc / Enter / Space');
    ok(K.veilIn > 0 && K.veilOut > 0 && K.veilIn + K.veilOut <= 0.6 + eps && K.finish > 0 && K.finish <= 0.6 && K.soundFade > 0 && K.soundFade <= 0.3 && !!beat(K.finishFrom),
      'INTRO.skip: a skip fades out in at most 0.6 s, the sound in at most 0.3 s');
    ok(C.maxDt > 0 && C.maxDt <= 0.1 && C.valve === 25 && C.valve > L && C.valveDt >= C.maxDt, 'INTRO.clock: a clamped per-frame dt and a 25 s safety valve');
    // reduced motion (A8): one still per beat, inside its beat
    ok(Array.isArray(I.stills) && I.stills.length === B.length && I.stills.every((s, i) => s.beat === B[i].id && s.t > B[i].t0 && s.t < B[i].t1 + eps) && I.stillFade > 0 && I.stillFade <= 0.6,
      'INTRO.stills: one still per beat, taken inside that beat; cross-fades of at most 0.6 s');
    // cameras: takes cover swapAt → length; the last one hands over to the play rig and comes to rest
    const TK = I.cameras?.takes || [];
    ok(TK.length >= 2 && Math.abs(TK[0].from - I.swapAt) < eps && Math.abs(TK.at(-1).to - L) < eps && TK.every((t, i) => isStr(t.id) && t.to > t.from && (i === 0 || Math.abs(t.from - TK[i - 1].to) < eps)),
      'INTRO.cameras.takes: contiguous from INTRO.swapAt to INTRO.length');
    for (const t of TK) {
      if (t.rig) { ok(t === TK.at(-1) && t.rig === 'sail' && Array.isArray(t.blend) && Math.abs(t.blend[0] - t.from) < eps && t.blend[1] > t.blend[0] && t.blend[1] <= L - 0.4, `INTRO.cameras take ${t.id}: the last take blends into render's sail rig and rests at least 0.4 s before the end`); continue; }
      const isV = (v) => Array.isArray(v) && v.length === 4 && (v[0] === 'S' || v[0] === 'G') && v.slice(1).every(isNum);
      ok(Array.isArray(t.keys) && t.keys.length >= 2 && Math.abs(t.keys[0].t - t.from) < eps && Math.abs(t.keys.at(-1).t - t.to) < eps && t.keys.every((k, i) => (i === 0 || k.t > t.keys[i - 1].t) && isV(k.pos) && isV(k.look) && k.fov >= 20 && k.fov <= 80
        && k.pos[2] >= 1.2 && (!k.portrait || ((!k.portrait.pos || isV(k.portrait.pos)) && (!k.portrait.look || isV(k.portrait.look)) && (k.portrait.fov === undefined || (k.portrait.fov >= 20 && k.portrait.fov <= 85))))),
        `INTRO.cameras take ${t.id}: keys from its start to its end, [anchor, x, y, z] poses at least 1.2 m over the water, fov 20–80`);
    }
    ok(I.cameras.portraitBelow > 0.5 && I.cameras.portraitBelow < 1.1, 'INTRO.cameras.portraitBelow: an aspect between 0.5 and 1.1');
    // the set: its marks sit inside their beats; its own cost stays far under the ceilings (A9)
    const S = I.set, F = S.fall, BW = S.below, WK = S.wick;
    ok(F.part < F.drop && F.drop < F.contact && inBeat(F.part, 'fall') && inBeat(F.contact, 'fall') && F.contact + S.contact.flash <= beat('fall').t1 + eps, 'INTRO.set.fall: part < drop < contact, the flash over before the cut');
    ok(S.lantern.at[0] === 'G' && S.lantern.at[3] >= 25 && S.lantern.at[2] - S.lantern.height / 2 > 6 && S.lantern.chainTop > S.lantern.at[2], 'INTRO.set.lantern: hung over the lake (at least 25 m in front of the gate, clear of the cliff ring), on chains that run up');
    ok(inBeat(BW.flank.enter, 'below') && BW.flank.enter < BW.flank.eye && BW.flank.eye < BW.flank.cover && BW.flank.cover < BW.flank.leave && BW.flank.leave < BW.flank.out && inBeat(BW.flank.out, 'below') && BW.ember.sinkUntil < BW.flank.cover,
      'INTRO.set.below: the ember sinks, then the flank enters, covers it, leaves, and the ember is out before the beat ends');
    ok(inBeat(WK.spark, 'wick') && WK.flame.every(([t, k], i) => inBeat(t, 'wick') && k >= 0 && k <= 1 && (i === 0 || t > WK.flame[i - 1][0])) && WK.flame[0][1] === 0 && WK.flame.at(-1)[1] === 1
      && inBeat(WK.lantern[0], 'wick') && inBeat(WK.lantern[1], 'wick') && WK.lift[0] >= WK.spark && inBeat(WK.lift[1], 'wick'), 'INTRO.set.wick: the spark, the flame from 0 to 1, the lantern and the lifting ink all inside the beat');
    ok(S.budget.calls <= 60 && S.budget.triangles <= 40000 && S.budget.lights === 0 && S.budget.shadowMaps === 0 && S.budget.textures <= 4, 'INTRO.set.budget: at most 60 draw calls and 40,000 triangles, no light and no shadow map of its own (A9)');
    for (const [k, v] of Object.entries(S.colors || {})) palCheck(`INTRO.set.colors.${k}`, v);
    // sound (A7): marks in order inside the film; fades within the limits; existing sounds named where reused
    const SD = I.sound;
    ok(SD.titleFade <= 0.3 && SD.skipFade <= 0.3 && SD.skipFade === K.soundFade && SD.peakDb <= -3 && SD.marks.every((m, i) => isStr(m.id) && m.t >= 0 && m.t < L && (m.to === undefined || (m.to > m.t && m.to <= L)) && (i === 0 || m.t >= SD.marks[i - 1].t))
      && new Set(SD.marks.map((m) => m.id)).size === SD.marks.length, 'INTRO.sound: marks in time order inside the film; the title fades in at most 0.3 s, a skip in at most 0.3 s');
    // the trigger and the hand-off (A3)
    ok(I.trigger.replay.writes === false && I.trigger.debugOptIn.length >= 1 && D.CHARACTERS.some((c) => c.id === I.handoff.character) && I.handoff.nightMode === 'still' && I.handoff.at === 'intro:done' && I.handoff.event.intro === true,
      'INTRO.trigger / handoff: a replay writes nothing; the film hands to the First Outing (the Wick, still nights) at intro:done');
    ok(I.cove.replaces === 'FIRST_EVENING.text.lore' && I.cove.skipsStep === 'framing' && D.FIRST_EVENING.steps.includes(I.cove.skipsStep), "INTRO.cove: with the cove, the film's lines replace the Lantern Line and the framing step is not played");
  }
}

// ---------------------------------------------------------------------------- originality scan (display strings)
const BANNED = ORIGINALITY_BANNED;
const seen = new Set();
const scan = (v, path) => {
  if (typeof v === 'string') { if (BANNED.test(v)) errors.push(`originality: banned word in ${path}: "${v.slice(0, 80)}"`); return; }
  if (!v || typeof v !== 'object' || seen.has(v)) return;
  seen.add(v);
  for (const [k, c] of Object.entries(v)) if (!/^(id|icon|behavior|weapon|model|shape|type|trigger|mechanic)$/.test(k)) scan(c, `${path}.${k}`);
};
const V3_TEXT_EXPORTS = ['SPECIES_V3', 'FOUND_RELICS', 'AGE_MARKS', 'VISTAS', 'REMNANTS', 'MOSSMERE_V3', 'PLACES_V3', 'WALK_SYNC_V3', 'CONDITIONS', 'RUMOURS', 'TODAYS_RUMOUR', 'TACKLE', 'OUTFIT', 'LURES', 'EXPEDITION', 'LONG_DESCENT',
  'RELICS_V3', 'BOONS_V3', 'CHARACTERS_V3', 'CHALLENGES_V3', 'COSMETICS_V3', 'LEDGER', 'COVE', 'TEXT_V3', 'TIPS_V3', 'MERCHANT_LINES_V3', 'ELDER_NAMES',
  'CATCH_V3', 'AUTOFISH', 'FIRST_EVENING', 'INTRO'];
for (const k of ['ZONES', 'SPECIES', 'BAITS', 'UPGRADES', 'SUPPLIES', 'RELICS', 'ENEMIES', 'BOONS', 'CHARACTERS', 'CHALLENGES', 'BOUNTIES', 'TIPS', 'MERCHANT_LINES', 'EPITAPHS', 'TEXT', 'FORMATIONS', ...(WALK ? ['ARENA_V2', 'WALK_FORMATIONS', 'WALK_BOUNTIES'] : []), ...(V3 ? V3_TEXT_EXPORTS : [])]) scan(D[k], k);
checks++;

// ---------------------------------------------------------------------------- v2 (walking, DESIGN §24) — pass 2 only
if (WALK) {
  const WL = await import('./walk-lib.mjs');
  if (!ok(WL.D === D, 'walk-lib must share the walking data instance')) process.exit(1);
  const B = D.BALANCE, WB = B.walk, LB = B.lamps, PB = B.places, FB = B.combat.foot, F = D.WALK_FLAGS, EPS = WB.eps;
  const MODES = ['raft', 'mixed', 'foot'];
  const SHAPE_KINDS = ['disc', 'ring', 'rect', 'poly', 'path'];
  const SHAPE_TAGS = ['ground', 'ramp', 'jetty', 'bridge'];
  const RULES = ['rhythm', 'sequence', 'deed', 'targets', 'moving', 'drifters', 'cue', 'plumb', 'reflection', 'phaseWindow', ...(V3 ? ['sight', 'drift'] : [])];
  const MOD_KEYS = ['waitMult', 'rarity', 'quality', 'weightBias', 'surgeEveryMult', 'erraticMult', 'hookWindowMult', 'hookWindowAdd',
    'nibbleTells', 'bandAmpMult', 'bandNoiseMult', 'darterJumpMult', 'legendEnrageAdd', 'sweetAdd', 'surgeWarnAdd'];
  const COND_RULE = V3 ? D.KEPT_CONDS : { buff: 'sequence', deed: 'deed', reflection: 'reflection', plumbBottom: 'plumb', window: 'phaseWindow' };
  const DEED_KINDS = ['winch', 'strike', 'light', 'sequence', 'rope', 'offer'];
  const RESETS = ['run', 'day', 'dawn', 'dusk', 'never'];
  const MODE_RESET = { permanent: 'run', dawn: 'dawn', untilDusk: 'dusk', window: 'never' };
  const RAFT_MODES = ['free', 'skiff', 'beached', 'none'];
  const speed = WL.footSpeed();
  const near = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const halfStep = (v) => Math.abs((((v / WB.heightQuant) % 1) + 1) % 1 - 0.5) < 1e-6;

  // ---- BALANCE (v2) and the review rules that live in numbers
  for (const [k, o] of [['walk', WB], ['places', PB], ['lamps', LB], ['combat.foot', FB]]) ok(isObj(o), `BALANCE.${k} missing (v2)`);
  for (const k of ['speedMult', 'accel', 'decel', 'turnRate', 'radius', 'stepUp', 'stepDown', 'maxSlope', 'heightQuant', 'eps']) ok(isNum(WB[k]) && WB[k] > 0, `BALANCE.walk.${k}`);
  ok(WB.stepUp === WB.stepDown, 'steps must be symmetric (stepUp === stepDown); only authored drops are one-way');
  for (const [name, v] of [['walk.stepUp', WB.stepUp], ['walk.drop.max', WB.drop.max], ['walk.steepLine.from', WB.steepLine.from], ['combat.foot.crawl.climb', FB.crawl.climb],
    ['combat.foot.crawl.drop', FB.crawl.drop], ['combat.foot.eel.maxHeight', FB.eel.maxHeight], ['combat.foot.highGround.minHeight', FB.highGround.minHeight]])
    ok(halfStep(v), `height threshold ${name} = ${v} must sit on a half-step of heightQuant ${WB.heightQuant} (never within eps of a quantised height)`);
  ok(WB.eps < WB.heightQuant / 2 - 1e-9, 'eps must be < heightQuant / 2');
  // anticipation on foot (MF11): 90% speed no sooner than 0.35 s, a glide of at least 0.5 m
  ok(Math.log(10) / WB.accel >= 0.35 && (D.STATS.moveSpeed.base * WB.speedMult) / WB.decel >= 0.5, 'foot accel/decel too snappy (90% in ≥ 0.35 s, stop ≥ 0.5 m)');
  const hand = D.ENEMY_BY_ID.drowned_hand, ink = D.ENEMY_BY_ID.weeping_inkwell;
  ok(FB.hand.stainRadius === hand.telegraph.stainRadius, 'killers keep raft values: combat.foot.hand.stainRadius must equal the raft stain radius');
  ok(FB.warden.telegraphAdd === 0, 'killers keep raft values: combat.foot.warden.telegraphAdd must be 0');
  ok(JSON.stringify(FB.inkwell.hold) === JSON.stringify(ink.artillery.hold), 'killers keep raft values: inkwells hold at the raft distance');
  ok(!('globFlightAdd' in (FB.highGround || {})), 'no slower globs on high ground (killers keep raft values)');
  ok(FB.contactRadius >= 1.6 && FB.contactRadius <= B.damage.contactRadius, 'combat.foot.contactRadius in [1.6, raft]');
  ok(FB.flow.cell === (D.walkArenaFor('glasswater').walk.cell), 'the crawler flow field runs on the walk grid (same cell)');
  ok(FB.boonWeightRaftLake === 0, 'foot-tagged boons are never offered in raft-only lakes');
  ok(JSON.stringify(LB.hop.phases) === '["dawn"]' && LB.hop.perDay === 1, 'Flame-leap: dawn only, once a day');
  ok(LB.darknessShelter > 0 && LB.darknessShelter < 1, 'darkness shelter is partial (a rate multiplier in (0, 1))');
  ok(LB.stake.shelter === false, 'the Stake Lantern gives no darkness shelter');
  ok(LB.lightCost >= 12, 'sharing flame costs ≥ 12 × zone oil drain');
  ok(isObj(B.travel.arrivalHush) && (B.travel.arrivalHush.sporewood ?? 0) <= 10, 'Arrival Hush is per lake and ≤ 10 s in Sporewood');
  ok(D.ZONES[0].mode === 'raft' && !D.ARENA_V2.mossmere && !D.ZONES[0].arena.walk, 'the Mossmere stays raft-only (no walk layout)');
  for (const e of D.ENEMIES) ok(['fly', 'crawl', 'swim', 'static'].includes(D.ENEMY_MOVE[e.id]), `ENEMY_MOVE.${e.id} must be fly|crawl|swim|static`);
  for (const e of D.ENEMIES) if (D.ENEMY_MOVE[e.id] === 'crawl') ok(e.waterBound === true, `${e.id}: crawlers are the waterBound enemies`);
  ok(D.WALK_SHORE.pad + D.WALK_SHORE.cliffGap >= 2, 'land stays ≥ 2 m inside the cliff base (pad + cliffGap ≥ 2)');

  // ---- tips: every trigger is a real event + discriminator (ui matches `event` and `event:<phase|resource|reason|state|id>`)
  const EV = {
    'run:start': null, 'player:anchor': null, 'fishing:cast': null, 'fishing:nibble': null, 'fishing:hook': null, 'fishing:surge': null, 'fish:landed': null,
    'merchant:arrive': null, 'enemy:slain': null, 'levelup': null, 'lantern:out': null, 'enemy:steal': null, 'gate:open': null, 'boss:spawn': null,
    'journal:new': null, 'zone:unlock': null, 'lamp:lit': null, 'place:discover': null, 'walk:high': null, 'shortcut:open': null, 'foot:eelEdge': null, 'place:astir': null,
    'fishing:miss': ['early', 'late', 'moved'], 'fishing:escaped': ['slack', 'snap'], 'phase:change': ['calm', 'dusk', 'gloomtide', 'dawn'],
    'resource:low': ['oil', 'satiety', 'hp'], 'enemy:spawn': ['elite'], 'interact:change': ['merchant', 'gate', 'ashore', 'board', 'bell', 'lamp', 'hop', 'fishHere', 'stake', 'deed'],
    'player:mode': ['ashore', 'board', 'spawn'], 'lamp:snuffed': ['slam', 'moths', 'eclipse', 'legend'],
  };
  if (V3) Object.assign(EV, { 'hub:enter': null, 'fish:measured': null, 'farwater:dawn': null, 'resident:show': null, 'expedition:start': null, 'expedition:end': null });
  // v3 directed tips (D1′): `tip:show {id}` is emitted by the module that knows the moment (fishing, progression, the First Evening);
  // the First Evening's tips (FE-D1) are shown by its director as `firstEvening:line {kind: 'tip', key}`
  if (V3) EV['tip:show'] = D.TIPS_V3.filter((t) => t.trigger.startsWith('tip:show:')).map((t) => t.id);
  if (V3) EV['firstEvening:line'] = D.TIPS_V3.filter((t) => t.directed === 'firstEvening').map((t) => t.id);
  if (V3) EV['interact:change'] = [...EV['interact:change'], 'jetty', 'station', 'homeward'];
  for (const t of D.TIPS) {
    const parts = t.trigger.split(':'), ev = parts.slice(0, 2).join(':'), disc = parts[2];
    ok(ev in EV, `tip ${t.id}: unknown trigger event ${ev}`);
    if (disc !== undefined) ok(Array.isArray(EV[ev]) && EV[ev].includes(disc), `tip ${t.id}: ${ev} has no discriminator '${disc}'`);
  }
  ok(!D.TIPS.some((t) => t.trigger === 'player:mode'), "no tip on bare 'player:mode' (it would fire on raft spawns)");

  // ---- names: no head noun reused across lakes (places, rules, landmarks, candles, deeds, shortcuts, moorings, vigils)
  const STOP = /^(the|of|a|an|from|for|and|to|in|at)$/i;
  const head = (name) => {
    let s = String(name).replace(/\(.*?\)/g, '').replace(/\b(I|II|III|IV|V)\b/g, '').trim();
    const of = s.match(/^(.*?)\s+of\s+/i); if (of) s = of[1];
    const w = s.split(/[\s-]+/).filter((x) => x && !STOP.test(x)); return (w[w.length - 1] || '').replace(/['’]s$/, '').toLowerCase();
  };
  const nouns = new Map();   // noun → Set(zone)
  const addName = (zid, name, what) => { if (!isStr(name)) return; const h = head(name); if (!h) return; if (!nouns.has(h)) nouns.set(h, new Map()); nouns.get(h).set(zid, `${what} "${name}"`); };
  for (const z of D.ZONES) {
    const A = z.arena;
    for (const o of [...(A.islands || []), ...(A.deepPools || [])]) addName(z.id, o.name, 'landmark');
    if (A.gate) addName(z.id, A.gate.name, 'gate'); if (A.legendPool) addName(z.id, A.legendPool.name, 'legend pool');
    if (!A.walk) continue;
    for (const s of A.walk.shapes) addName(z.id, s.name, 'shape');
    for (const p of A.places || []) { addName(z.id, p.name, 'place'); addName(z.id, p.rule?.name, 'rule'); addName(z.id, p.standName, 'stand'); addName(z.id, p.altStand?.name, 'stand'); }
    for (const l of A.lamps || []) addName(z.id, l.name, 'candle');
    for (const x of [...(A.deeds || []), ...(A.shortcuts || []), ...(A.moorings || []), ...(A.vigils || [])]) addName(z.id, x.name, 'name');
  }
  for (const [h, m] of nouns) ok(m.size <= 1, `head noun '${h}' reused across lakes: ${[...m.entries()].map(([z, w]) => `${z}: ${w}`).join(' / ')}`);

  // ---- per walking lake
  const placeIds = new Set();
  let walkCells = 0, gridChecks = 0;
  const speciesOk = (zid, place, d0, d1, phase) => D.SPECIES.filter((sp) => sp.zone === zid && sp.rarity !== 'legendary' && !sp.bait
    && (!sp.place || (sp.place === place && !sp.cond)) && (phase === 'calm' ? sp.time !== 'gloom' : true) && sp.depth[0] <= d1 && d0 <= sp.depth[1]);
  for (const z of D.ZONES) {
    const A = z.arena, R = A.radius, tag = `${z.id} (v2)`;
    ok(MODES.includes(z.mode), `${z.id}.mode must be raft|mixed|foot (got ${z.mode})`);
    if (z.phases) ok(isNum(z.phases.calm) && z.phases.calm >= B.phases.calm && z.phases.calm <= 150, `${tag} phases.calm override`);
    if (z.mode === 'raft') continue;
    const Wk = A.walk;
    if (!ok(isObj(Wk) && Array.isArray(Wk.shapes) && Wk.shapes.length > 0, `${tag} needs arena.walk.shapes`)) continue;
    ok(['raft', 'foot'].includes(A.spawnMode) && (z.mode === 'mixed' ? A.spawnMode === 'raft' : A.spawnMode === 'foot'), `${tag} spawnMode must be raft (mixed) / foot (foot)`);
    ok(isObj(A.raft) && RAFT_MODES.includes(A.raft.mode), `${tag} raft.mode must be one of ${RAFT_MODES}`);
    ok(z.mode !== 'mixed' || A.raft.mode === 'free', `${tag} a mixed lake needs a free raft`);
    if (A.raft.at) ok(isNum(A.raft.at.yawDeg) && !('yaw' in A.raft.at), `${tag} raft.at needs yawDeg (degrees), not yaw`);
    ok(D.shoreRFor(z)?.(1.23) === R, `${tag} shoreRFor must be the exact circle R on walking lakes`);
    // shapes
    const sids = new Set(), shortcutIds = new Set((A.shortcuts || []).map((c) => c.id));
    for (const sh of [...Wk.shapes, ...(Wk.holes || []), ...(Wk.blocks || [])]) {
      ok(SHAPE_KINDS.includes(sh.kind), `${tag} shape ${sh.id} kind ${sh.kind}`);
      const [x0, z0, x1, z1] = D.walkShapeBounds(sh);
      ok([x0, z0, x1, z1].every(isNum) && Math.max(Math.abs(x0), Math.abs(x1), Math.abs(z0), Math.abs(z1)) <= R + 12, `${tag} shape ${sh.id} far outside the lake`);
    }
    for (const sh of Wk.shapes) {
      ok(isStr(sh.id) && !sids.has(sh.id), `${tag} shape id ${sh.id} missing/duplicate`); sids.add(sh.id);
      ok(SHAPE_TAGS.includes(sh.tag), `${tag} shape ${sh.id} tag ${sh.tag}`);
      if (sh.needs) ok(shortcutIds.has(sh.needs), `${tag} shape ${sh.id} needs unknown shortcut ${sh.needs}`);
      if (sh.kind === 'path') {
        ok(sh.w >= 2.4 - 1e-9, `${tag} walkway ${sh.id} narrower than 2.4 m`);
        for (let i = 0; i + 1 < sh.pts.length; i++) {
          const [ax, az, ay = sh.y ?? 0] = sh.pts[i], [bx, bz, by = sh.y ?? 0] = sh.pts[i + 1];
          ok(Math.abs(by - ay) / Math.max(1e-6, Math.hypot(bx - ax, bz - az)) <= WB.maxSlope + 1e-9, `${tag} ramp ${sh.id} steeper than maxSlope ${WB.maxSlope}`);
        }
      }
      if (sh.kind === 'ring') ok(sh.r1 - sh.r0 >= 2.4 - 1e-9, `${tag} ring ${sh.id} narrower than 2.4 m`);
    }
    for (const h of Wk.holes || []) {
      ok(isNum(h.depth) && h.depth > 0 && h.depth <= 1, `${tag} hole ${h.id} depth`);
      if (h.lip) ok(isNum(h.lip.w) && h.lip.w > 0 && h.lip.y <= 1.0 + EPS && h.lip.y >= 0.35 && (h.lip.a1 ?? 150) - (h.lip.a0 ?? 30) >= 120 - 1e-9, `${tag} hole ${h.id} lip must be a ≥ 120° south band at y 0.35–1.0`);
    }
    for (const b of Wk.blocks || []) ok(isNum(b.h), `${tag} block at (${b.x},${b.z}) needs a height h`);
    const vids = new Set();
    for (const v of Wk.variants || []) {
      ok(isStr(v.id) && !vids.has(v.id) && isStr(v.name) && isNum(v.weight) && v.weight > 0, `${tag} variant ${v.id} id/name/weight`); vids.add(v.id);
      for (const s of v.fallen || []) ok(sids.has(s), `${tag} variant ${v.id} fells unknown shape ${s}`);
      for (const [sc, ids] of Object.entries(v.swap || {})) { ok(shortcutIds.has(sc), `${tag} variant ${v.id} swaps unknown shortcut ${sc}`); for (const s of ids) ok((v.fallen || []).includes(s), `${tag} variant ${v.id} raises ${s}, which is not fallen`); }
    }
    // deeds, shortcuts, drops
    const deedById = Object.fromEntries((A.deeds || []).map((d) => [d.id, d]));
    for (const c of A.shortcuts || []) {
      ok(!!deedById[c.deed] && deedById[c.deed].opens === c.id, `${tag} shortcut ${c.id} must be opened by its deed ${c.deed}`);
      ok(Wk.shapes.some((sh) => sh.needs === c.id), `${tag} shortcut ${c.id} gates no shape`);
    }
    for (const d of A.deeds || []) {
      ok(DEED_KINDS.includes(d.kind), `${tag} deed ${d.id} kind ${d.kind}`);
      ok((d.points ? d.points.length >= 2 : true) && (d.at || d.points), `${tag} deed ${d.id} needs at / points`);
      ok(['pill', 'touch'].includes(d.trigger), `${tag} deed ${d.id} trigger must be 'pill' or 'touch'`);
      if (d.trigger === 'touch') ok(isNum(d.touchR) && d.touchR > 0 && d.touchR <= 1.5, `${tag} touch deed ${d.id} needs touchR (0, 1.5]`);
      if (d.kind === 'sequence') ok(d.trigger === 'touch', `${tag} sequence deed ${d.id} is walked through (touch)`);
      ok(RESETS.includes(d.resets), `${tag} deed ${d.id} resets ${d.resets}`);
      if (d.opens) ok(shortcutIds.has(d.opens) && d.resets === 'run', `${tag} deed ${d.id} opens unknown ${d.opens} / must reset per run`);
      if (d.place) ok((A.places || []).some((p) => p.id === d.place), `${tag} deed ${d.id} names unknown place ${d.place}`);
    }
    const stands = [];   // {p, st, name}
    for (const p of A.places || []) for (const st of [p.stand, p.altStand].filter(Boolean)) if (p.access !== 'raft') stands.push({ p, st, alt: st === p.altStand });
    // moorings
    for (const m of A.moorings || []) {
      ok(isNum(m.yawDeg) && !('yaw' in m), `${tag} mooring ${m.id} needs yawDeg (degrees)`);
      ok(near(m.stand, m.slot) - B.move.raftRadius <= WB.board.range + 1e-9, `${tag} mooring ${m.id}: stand → slot ${near(m.stand, m.slot).toFixed(2)} m − raft radius > board.range ${WB.board.range}`);
    }
    // ---- grids: every reachability check on the body-eroded grid, shortcuts closed and open, every variant
    let G0 = null, M0 = null, dist0 = null;
    for (const vId of WL.variantsOf(z)) for (const openK of [false, true]) {
      const G = D.walkGridFor(z, { open: openK ? WL.openAll(z) : {}, variant: vId }), M = WL.erode(G);
      const seeds = WL.footSeeds(G, z, M), dist = WL.walkDistances(G, z, seeds, M);
      const label = `${tag} [${vId || 'base'}, shortcuts ${openK ? 'open' : 'closed'}]`;
      if (!vId && !openK) { G0 = G; M0 = M; dist0 = dist; }
      gridChecks++;
      ok(seeds.length === (A.spawnMode === 'foot' ? 1 : (A.moorings || []).length), `${label} spawn / mooring stands must fit the Wick`);
      const reach = (p, rr) => { const k = WL.snap(G, M, p.x, p.z, rr); return k >= 0 && dist[k] < Infinity; };
      for (const { p, st, alt } of stands) ok(reach(st, 0.6), `${label} place ${p.id}${alt ? ' altStand' : ''} stand (${st.x},${st.z}) unreachable for the Wick (r ${WB.radius})`);
      for (const l of A.lamps || []) ok(reach(l, WB.interactRange - 0.4), `${label} candle ${l.id} unreachable`);
      for (const d of A.deeds || []) for (const q of d.points || [d.at]) ok(reach(q, d.trigger === 'touch' ? d.touchR : WB.interactRange - 0.4), `${label} deed ${d.id} (${q.x},${q.z}) unreachable`);
      for (const m of A.moorings || []) ok(reach(m.stand, 0.6), `${label} mooring ${m.id} stand unreachable`);
      if (A.gate && A.gateAccess === 'foot') {
        let g = false;
        for (let k = 0; k < G.n * G.n && !g; k++) if (M[k] && dist[k] < Infinity) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x - A.gate.x, zz - A.gate.z) <= A.gate.r + WB.gateFootRange) g = true; }
        ok(g, `${label} foot gate: no reachable cell within r + ${WB.gateFootRange} m of ${A.gate.name}`);
      }
      if (z.mode === 'foot') for (const d of A.docks || []) {
        const k0 = G.idx(d.x, d.z), r = Math.ceil(WB.tradeRange / G.cell); let nearW = false;
        for (let dj = -r; dj <= r && !nearW; dj++) for (let di = -r; di <= r && !nearW; di++) { const k = k0 + dj * G.n + di; if (M[k] && dist[k] < Infinity && Math.hypot(di, dj) * G.cell <= WB.tradeRange - 1) nearW = true; }
        ok(nearW, `${label} dock (${d.x},${d.z}) has no reachable walkway within trade range − 1 m`);
      }
    }
    const G = G0, M = M0, dist = dist0, { n } = G;
    // pools enclosed; shore; height rules
    let leaks = 0, beyond = 0, oneWay = 0, nearStep = 0, nearClimb = 0;
    for (let k = 0; k < n * n; k++) {
      const f = G.flags[k];
      if (!(f & F.VOID)) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x, zz) > R - D.WALK_SHORE.pad + 1e-9) beyond++; }
      if (f & F.POOL) { const i = k % n, j = (k / n) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (j + dj) * n + (i + di); if (G.flags[q] & F.WATER) leaks++; } }
      if (!WL.isWalk(G, k)) continue;
      const i = k % n, j = (k / n) | 0, t = G.top[k];
      for (const [di, dj] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
        const q = (j + dj) * n + (i + di); if (!WL.isWalk(G, q)) continue;
        if (D.walkStepOK(t, G.top[q]) !== D.walkStepOK(G.top[q], t)) oneWay++;
        if (Math.abs(Math.abs(G.top[q] - t) - WB.stepUp) <= EPS) nearStep++;
      }
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (WL.isLakeWater(G, (j + dj) * n + (i + di)) && Math.abs(t - FB.crawl.climb) <= EPS) nearClimb++;
    }
    ok(leaks === 0, `${tag} ${leaks} enclosed-pool cells touch open lake water (holes must sit inside ground)`);
    ok(beyond === 0, `${tag} ${beyond} cells beyond R − ${D.WALK_SHORE.pad} m are not VOID`);
    ok(oneWay === 0, `${tag} ${oneWay} one-way walkable pairs (only authored drops may be one-way)`);
    ok(nearStep === 0 && nearClimb === 0, `${tag} cells within eps of a threshold: ${nearStep} step pairs, ${nearClimb} climb edges`);
    for (const d of A.drops || []) {
      const a = G.idx(d.from.x, d.from.z), b = G.idx(d.to.x, d.to.z);
      ok(WL.isWalk(G, a) && WL.isWalk(G, b), `${tag} drop ${d.id} ends must be walkable`);
      const h = G.top[a] - G.top[b];
      ok(h > WB.stepUp + EPS && h <= WB.drop.max && Math.abs(h - WB.drop.max) > EPS, `${tag} drop ${d.id} height ${h.toFixed(2)} outside (stepUp, drop.max]`);
    }
    // every ramp can be walked end to end (painter's order: ramps after the platforms they climb onto)
    for (const sh of Wk.shapes) if (sh.kind === 'path' && sh.pts.some((p) => p.length > 2 && Math.abs(p[2] - sh.pts[0][2]) > WB.stepUp)) {
      const e0 = sh.pts[0], e1 = sh.pts[sh.pts.length - 1], a = WL.snap(G, M, e0[0], e0[1], 1.0), b = WL.snap(G, M, e1[0], e1[1], 1.0);
      const L = sh.pts.slice(1).reduce((s2, p, i) => s2 + Math.hypot(p[0] - sh.pts[i][0], p[1] - sh.pts[i][1]), 0);
      const dd = a >= 0 && b >= 0 ? WL.walkDistances(G, z, [a], M)[b] : Infinity;
      ok(dd <= 1.3 * L + 2, `${tag} ramp ${sh.id} cannot be walked end to end (${Number.isFinite(dd) ? dd.toFixed(1) + ' m' : 'cut'}; length ${L.toFixed(1)} m)`);
    }
    // candles: coverage
    ok((A.lamps || []).length >= 3, `${tag} needs ≥ 3 sister-candles`);
    const safePts = [...(A.lamps || []), ...(z.mode === 'mixed' ? (A.moorings || []).map((m) => m.stand) : [])];   // mixed lakes: the moored raft counts
    const lampDist = WL.walkDistances(G, z, safePts.map((l) => WL.snap(G, M, l.x, l.z, WB.interactRange)).filter((k) => k >= 0), M);
    let worst = 0, unreach = 0, walk = 0;
    for (let k = 0; k < n * n; k++) {
      if (!WL.isWalk(G, k) || (G.flags[k] & F.SILL)) continue; walk++;
      if (!M[k]) continue;
      if (dist[k] === Infinity) { unreach++; continue; }
      worst = Math.max(worst, lampDist[k]);
    }
    walkCells += walk;
    ok(worst <= LB.maxPathToLamp, `${tag} a reachable walkway is ${worst.toFixed(0)} m from the nearest sister-candle${z.mode === 'mixed' ? ' or mooring' : ''} (max ${LB.maxPathToLamp})`);
    warn(unreach / Math.max(1, walk) <= 0.06, `${tag} ${((100 * unreach) / Math.max(1, walk)).toFixed(1)}% of walkable cells unreachable (decor only)`);
    // pill separation and touch stations
    const lamps = A.lamps || [], pills = (A.deeds || []).filter((d) => d.trigger === 'pill').flatMap((d) => (d.points || [d.at]).map((q) => ({ ...q, id: d.id })));
    const touches = (A.deeds || []).filter((d) => d.trigger === 'touch').flatMap((d) => (d.points || [d.at]).map((q) => ({ ...q, id: d.id, r: d.touchR })));
    const standPts = [...stands.map(({ p, st }) => ({ ...st, id: p.id })), ...(A.moorings || []).map((m) => ({ ...m.stand, id: m.id }))];
    for (const l of lamps) {
      for (const s of standPts) {
        ok(near(l, s) >= LB.minFromStand - 1e-9, `${tag} candle ${l.id} is ${near(l, s).toFixed(1)} m from the ${s.id} stand (≥ ${LB.minFromStand}: pills overlap)`);
        ok(!(Math.abs(l.x - s.x) <= 1.5 && l.z - s.z > 0 && l.z - s.z <= 6), `${tag} candle ${l.id} stands south of the ${s.id} stand (camera line)`);
      }
      for (const q of pills) ok(near(l, q) >= 3 - 1e-9, `${tag} candle ${l.id} is ${near(l, q).toFixed(1)} m from deed ${q.id} (pills overlap)`);
      for (const d of A.docks || []) ok(near(l, d) >= LB.minFromDock - 1e-9, `${tag} candle ${l.id} too close to a dock`);
    }
    for (const q of pills) for (const s of standPts) ok(near(q, s) >= 3 - 1e-9, `${tag} deed ${q.id} is ${near(q, s).toFixed(1)} m from the ${s.id} stand (pills overlap)`);
    for (const t of touches) for (const s of [...standPts, ...lamps]) ok(near(t, s) >= t.r + 1 - 1e-9, `${tag} ${t.id} station (${t.x},${t.z}) is within touchR + 1 m of ${s.id}`);
    for (const d of A.docks || []) for (const s of standPts) ok(near(d, s) >= WB.tradeRange + 0.5 - 1e-9, `${tag} dock (${d.x},${d.z}) is ${near(d, s).toFixed(1)} m from the ${s.id} stand (trade pill would cover it)`);
    // vigil grounds: open ground within reach of every stand that is not a designated dead end
    const vigilCells = [];
    for (const v of A.vigils || []) {
      if (v.kind === 'disc') {
        let tot = 0, good = 0;
        for (let zz = v.z - v.r; zz <= v.z + v.r; zz += G.cell) for (let x = v.x - v.r; x <= v.x + v.r; x += G.cell) {
          if (Math.hypot(x - v.x, zz - v.z) > v.r) continue; tot++; const k = G.idx(x, zz); if (WL.isWalk(G, k) && dist[k] < Infinity) { good++; if (M[k]) vigilCells.push(k); }
        }
        ok(v.r >= WB.vigil.discMin && good / Math.max(1, tot) >= WB.vigil.discFill, `${tag} vigil ${v.id}: disc r ${v.r} only ${((100 * good) / Math.max(1, tot)).toFixed(0)}% open ground`);
      } else {
        let len = 0, bad = 0;
        for (let i = 0; i < v.pts.length; i++) {
          const [ax, az] = v.pts[i], [bx, bz] = v.pts[(i + 1) % v.pts.length], L = Math.hypot(bx - ax, bz - az); len += L;
          for (let s = 0; s <= L; s += 0.5) { const k = WL.snap(G, M, ax + (bx - ax) * (s / L), az + (bz - az) * (s / L), 0.8); if (k < 0 || dist[k] === Infinity) bad++; else vigilCells.push(k); }
        }
        ok(bad === 0 && len >= WB.vigil.loopMin, `${tag} vigil loop ${v.id}: ${bad} breaks, length ${len.toFixed(0)} m (≥ ${WB.vigil.loopMin})`);
      }
    }
    if (z.mode === 'mixed') for (const m of A.moorings || []) { const k = WL.snap(G, M, m.stand.x, m.stand.z, 0.6); if (k >= 0) vigilCells.push(k); }   // the raft is the open ground
    const vigDist = WL.walkDistances(G, z, vigilCells, M);
    for (const { p, st } of stands) if (!p.deadEnd) {
      const k = WL.snap(G, M, st.x, st.z, 0.6);
      ok(k >= 0 && vigDist[k] / speed <= WB.vigil.maxSeconds, `${tag} place ${p.id}: open ground is ${(vigDist[k] / speed).toFixed(1)} s away (≤ ${WB.vigil.maxSeconds} s, or mark it deadEnd)`);
    }
    // raft component
    const RM = WL.raftMask(G), raftStart = z.mode === 'mixed' ? G.idx(A.spawn.x, A.spawn.z)
      : A.raft.mode === 'skiff' ? G.idx(A.moorings.find((m) => m.id === A.raft.start)?.slot.x ?? 0, A.moorings.find((m) => m.id === A.raft.start)?.slot.z ?? 0) : -1;
    const RC = raftStart >= 0 ? WL.component(G, RM, raftStart) : null;
    if (z.mode === 'mixed') ok(RC && RC[raftStart], `${tag} raft spawn must be open water`);
    if (A.raft.mode === 'skiff') ok(A.moorings.some((m) => m.id === A.raft.start), `${tag} skiff start mooring`);
    for (const m of A.moorings || []) ok(RC && RC[G.idx(m.slot.x, m.slot.z)] === 1, `${tag} mooring ${m.id} slot not raft-reachable`);
    if (A.gate && A.gateAccess === 'raft') ok(RC && RC[G.idx(A.gate.x, A.gate.z)] === 1, `${tag} raft gate not raft-reachable`);
    if (z.mode === 'mixed') for (const d of A.docks || []) ok(WL.isLakeWater(G, G.idx(d.x, d.z)) && RC && RC[G.idx(d.x, d.z)] === 1, `${tag} dock (${d.x},${d.z}) not raft-reachable`);
    else for (const d of A.docks || []) ok(WL.isLakeWater(G, G.idx(d.x, d.z)), `${tag} dock (${d.x},${d.z}) must be open water`);
    // places
    ok(Array.isArray(A.places) && A.places.length >= 4, `${tag} needs ≥ 4 places`);
    ok((A.places || []).filter((p) => p.legend).length === 1, `${tag} exactly one place holds the legend pool`);
    const lampById = Object.fromEntries(lamps.map((l) => [l.id, l]));
    for (const p of A.places || []) {
      const pt = `${tag} place ${p.id}`;
      ok(isStr(p.id) && !placeIds.has(p.id), `${pt} id missing/duplicate`); placeIds.add(p.id);
      ok(isStr(p.name) && isStr(p.lore) && isStr(p.look), `${pt} name/lore/look`);
      ok(['foot', 'raft', 'both'].includes(p.access), `${pt} access`);
      ok(isObj(p.water) && SHAPE_KINDS.includes(p.water.kind) && Array.isArray(p.water.depth) && p.water.depth[0] >= 0 && p.water.depth[1] <= 1 && p.water.depth[0] <= p.water.depth[1], `${pt} water {kind, depth:[a,b]}`);
      if (p.lamp) ok(!!lampById[p.lamp], `${pt} candle ${p.lamp} unknown`);
      for (const sid of Object.keys(p.attract || {})) ok(D.SPECIES_BY_ID[sid]?.zone === z.id, `${pt} attracts ${sid} (not a ${z.id} species)`);
      for (const k of Object.keys({ ...(p.mods || {}), ...(p.standMods || {}), ...(p.altStand?.mods || {}) })) ok(MOD_KEYS.includes(k), `${pt} mods key ${k}`);
      if (p.stand === null) ok(p.rule?.type === 'moving' || p.access === 'raft', `${pt} only roaming or raft places may have no stand`);
      if (!p.legend && p.rule?.type !== 'moving') ok(isObj(p.alt), `${pt} needs an alt (B) twist`);
      if (p.alt) for (const k of Object.keys(p.alt)) ok(k in (p.rule || {}) || k in p || ['startStep', 'swap', 'cost', 'cooldown'].includes(k), `${pt} alt key ${k} overrides nothing`);
      if (p.deadEnd) ok(p.deadEnd === true, `${pt} deadEnd`);
      // fishing holes have low south rims (lips)
      for (const h of Wk.holes || []) if (D.placeContains(p, (h.x ?? 0) + (h.kind === 'ring' ? (h.r0 + h.r1) / 2 : 0), h.z ?? 0)) {
        const rim = []; const [x0, z0, x1, z1] = D.walkShapeBounds(h, 1);
        for (let zz = z0; zz <= z1; zz += G.cell) for (let x = x0; x <= x1; x += G.cell) {
          const k = G.idx(x, zz); if (!WL.isWalk(G, k) || Wk.shapes[G.shape[k]]?.tag === 'bridge') continue; const i = k % n, j = (k / n) | 0;   // footbridges excepted
          const adjPool = G.pool[(j - 1) * n + i] === Wk.holes.indexOf(h);   // the near rim: land whose northern neighbour is this pool
          if (!adjPool) continue; const [cx, cz] = WL.cellXZ(G, k); const a = ((Math.atan2(cz - (h.z ?? 0), cx - (h.x ?? 0)) / Math.PI * 180) + 360) % 360;
          if (a >= 30 && a <= 150) rim.push(G.top[k]);
        }
        ok(rim.length === 0 || Math.max(...rim) <= 1.0 + EPS, `${pt} hole ${h.id}: south rim up to ${Math.max(...rim).toFixed(1)} m above the water (≤ 1 m; add a lip)`);
      }
      // castable, visible, up-screen, the camera line south of the stand
      if (p.rule?.type !== 'moving') for (const st of [p.stand, p.altStand].filter(Boolean)) {
        if (p.access === 'raft') continue;
        const sname = st === p.altStand ? `${pt} altStand` : `${pt} stand`;
        const { sy, cells } = WL.castable(G, z, p, st);
        if (!ok(Number.isFinite(sy), `${sname} not on ground`)) continue;
        const vis = cells.filter((c) => c.vis).length;
        ok(cells.length >= 3, `${sname}: only ${cells.length} castable water cells (reach ${WL.castReach(sy).toFixed(1)} m, minDist ${B.cast.minDist}, arc clearance)`);
        ok(vis / Math.max(1, cells.length) >= PB.minVisible, `${sname}: the fish camera sees ${vis}/${cells.length} castable cells (≥ ${PB.minVisible * 100}%)`);
        let tx, tz;
        if (p.legend) { tx = A.legendPool.x; tz = A.legendPool.z; }
        else { tx = cells.reduce((a, c) => a + c.x, 0) / Math.max(1, cells.length); tz = cells.reduce((a, c) => a + c.z, 0) / Math.max(1, cells.length); }
        const ang = Math.abs(Math.atan2(tx - st.x, -(tz - st.z)) * 180 / Math.PI), dd = Math.hypot(tx - st.x, tz - st.z);
        ok(ang <= PB.upScreenDeg || dd <= PB.nearTarget, `${sname}: its water lies ${ang.toFixed(0)}° from up-screen at ${dd.toFixed(1)} m (≤ ${PB.upScreenDeg}° or ≤ ${PB.nearTarget} m)`);
        if (p.legend) {
          const LP = A.legendPool, inL = (x, zz) => Math.hypot(x - LP.x, zz - LP.z) <= LP.r;
          let tot = 0; for (let k = 0; k < n * n; k++) { if (!WL.isAnyWater(G, k) || (G.flags[k] & F.BRIDGE)) continue; const [x, zz] = WL.cellXZ(G, k); if (inL(x, zz)) tot++; }
          const good = WL.castable(G, z, p, st, inL).cells.filter((c) => c.vis).length;
          ok(good / Math.max(1, tot) >= 0.6, `${sname}: only ${good}/${tot} legend-pool cells have a clear arc and are seen by the camera (≥ 60%)`);
        }
        // nothing tall in the camera line south of a stand (props are occludable, the fish framing does not rely on it)
        const O = WB.occlusion; let tall = null;
        for (let dz = 0.5; dz <= O.lowSouthDist && !tall; dz += 0.5) for (let dx = -O.lowSouthHalfW; dx <= O.lowSouthHalfW && !tall; dx += 0.5) {
          const h = WL.solidHeight(G, z, st.x + dx, st.z + dz); if (h > sy + O.lowSouthMax) tall = `${h.toFixed(1)} m at (${st.x + dx}, ${st.z + dz})`;
        }
        ok(!tall, `${sname}: something ${tall} rises > ${O.lowSouthMax} m above the stand within ${O.lowSouthDist} m south`);
      }
      if (p.access !== 'foot' && p.raftStand) ok(RC && RC[G.idx(p.raftStand.x, p.raftStand.z)] === 1, `${pt} raftStand not raft-reachable`);
      ok(speciesOk(z.id, p.id, p.water.depth[0], p.water.depth[1], 'calm').length >= 1, `${pt} yields no species in calm`);
      if (p.legend) ok(D.placeContains(p, A.legendPool.x, A.legendPool.z) && A.legendPool.r <= 5, `${pt} must contain the legend pool`);
      const r = p.rule;
      if (r) {
        ok(RULES.includes(r.type) && isStr(r.name), `${pt} rule type ${r?.type}`);
        for (const k of Object.keys(r.mods || {})) ok(MOD_KEYS.includes(k), `${pt} rule mods key ${k}`);
        if (r.deed) ok(deedById[r.deed]?.place === p.id, `${pt} rule deed ${r.deed} must exist and name this place`);
        if (r.type === 'deed') ok(MODE_RESET[r.mode] === deedById[r.deed]?.resets, `${pt} rule mode ${r.mode} needs its deed to reset '${MODE_RESET[r.mode]}' (got ${deedById[r.deed]?.resets})`);
        if (r.type === 'deed' && r.mode === 'window') ok(isNum(deedById[r.deed]?.cooldown), `${pt} window deed needs a cooldown`);
        if (r.type === 'rhythm') ok(r.period > r.warn + r.live && r.live > 0, `${pt} rhythm period > warn + live`);
        if (r.type === 'sequence') ok(deedById[r.deed]?.kind === 'sequence' && deedById[r.deed]?.resets === 'day' && r.window > 0 && r.buff > 0, `${pt} sequence needs a daily sequence deed`);
        if (r.type === 'targets') {
          ok(['bed', 'hole'].includes(r.lockPicks), `${pt} targets lock picks 'bed' or 'hole'`);
          if (r.lit) ok(isNum(r.lit.chargeTol) && !('line' in r.lit), `${pt} lit rows: the bonus is a charge tick (chargeTol), not a lateral line the lock would give away`);
          for (const t of r.targets || []) {
            ok(D.placeContains(p, t.x, t.z), `${pt} target ${t.id} outside the place`);
            ok(WL.isAnyWater(G, G.idx(t.x, t.z)), `${pt} target ${t.id} is not water`);
            if (isNum(t.depth)) ok(speciesOk(z.id, p.id, t.depth, t.depth, 'any').length >= 1, `${pt} target ${t.id} yields nothing at depth ${t.depth}`);
          }
        }
        if (r.type === 'moving') ok(isObj(r.arc) && r.speed > 0 && r.r > 0, `${pt} moving arc/speed/r`);
        if (r.type === 'drifters') ok(r.lane.every(([x, zz]) => Math.hypot(x, zz) < R - 2) && r.perDay >= 1, `${pt} drifters lane inside the lake`);
        if (r.type === 'plumb') ok(r.depth[0] >= p.water.depth[0] - 1e-9 && r.depth[1] <= p.water.depth[1] + 1e-9, `${pt} plumb depth inside place depth`);
        if (r.type === 'reflection') {
          const area = p.water.kind === 'disc' ? Math.PI * p.water.r ** 2 : 1;
          ok(['flipX', 'flipZ'].includes(r.mirror) && (r.fish * Math.PI * r.hitR ** 2) / area <= 0.15, `${pt} reflection: mirror flipX|flipZ, hit circles ≤ 15% of the pool`);
        }
        if (r.type === 'phaseWindow') ok(isNum(r.perDescent) && r.perDescent >= 1, `${pt} phaseWindow needs perDescent (the Last Ferry is not a daily rare)`);
      }
    }
    // place-kept species
    for (const sp of D.SPECIES.filter((x) => x.place && x.zone === z.id)) {
      const p = (A.places || []).find((q) => q.id === sp.place);
      if (!ok(!!p, `species ${sp.id} place ${sp.place} is not a ${z.id} place`)) continue;
      ok(sp.rarity === 'rare' && !sp.bait, `species ${sp.id} (place-kept) must be a bait-free rare`);
      ok(sp.depth[0] <= p.water.depth[1] && p.water.depth[0] <= sp.depth[1], `species ${sp.id} depth never overlaps ${p.id}`);
      if (sp.cond) ok(COND_RULE[sp.cond] === p.rule?.type, `species ${sp.id} cond '${sp.cond}' needs a ${COND_RULE[sp.cond]} rule at ${p.id}`);
    }
    const kept = D.SPECIES.filter((x) => x.place && x.zone === z.id).length;
    ok(isInt(PB.awake[z.id]) && PB.awake[z.id] >= 1 && PB.awake[z.id] <= kept, `${tag} awake place-kept species per descent in [1, ${kept}]`);
    if (A.spotStyle) {
      const S = A.spotStyle;
      ok(isNum(S.live) && isNum(S.warn) && Array.isArray(S.every) && isNum(S.walkSecondsMax) && isNum(S.castInset), `${tag} spotStyle (live, warn, every, walkSecondsMax, castInset)`);
      ok(isObj(S.tideChart) && S.countsAsSpot === true, `${tag} spotStyle must define the Tide Chart and count as a feeding spot (spot_catch bounties)`);
    }
    if (A.wayside) ok(isStr(A.wayside.kind) && isObj(A.wayside.give) && isNum(A.wayside.touchR), `${tag} wayside`);
  }
  for (const sp of D.SPECIES) if (sp.place) ok(placeIds.has(sp.place) || (V3 && sp.zone === 'mossmere' && D.MOSSMERE_V3.places.some((p) => p.id === sp.place)), `species ${sp.id} names unknown place ${sp.place}`);
  const mossPlacesIn = V3 ? (D.ZONES[0].arena.places || []).length : 0;   // v3: PLACES also holds the Mossmere's places in the build
  ok(D.PLACES.length === placeIds.size + mossPlacesIn && Object.keys(D.PLACE_BY_ID).length === placeIds.size + mossPlacesIn, 'PLACES / PLACE_BY_ID incomplete');
  ok(D.CHALLENGE_BY_ID.complete_chronicle?.params?.n === D.SPECIES.length, 'complete_chronicle must ask for every species');
  ok(D.CHALLENGE_BY_ID.every_still_place?.params?.n === placeIds.size, 'every_still_place must ask for every §24 place');
  const TYPES4 = ['footAshore', 'placeFound', 'lampLit', 'placeSpecies', 'placeMastered', 'shortcutOpen', 'slayOnTag', 'nightNoLamp', 'lampLitZone'];
  for (const c of D.WALK_CHALLENGES) ok(c.tier === 4 && TYPES4.includes(c.type), `tier IV challenge ${c.id} type ${c.type}`);
  for (const b of D.WALK_BOONS) ok(b.tags.includes('foot'), `v2 boon ${b.id} must carry the foot tag (offer weighting)`);
  for (const f of D.WALK_FORMATIONS) {
    ok(!!D.ENEMY_BY_ID[f.enemy] && !D.FORMATION_BY_ID[f.id], `walk formation ${f.id} enemy / id clash`);
    ok(Array.isArray(f.modes) && f.modes.every((m) => MODES.includes(m) && m !== 'raft'), `walk formation ${f.id} modes`);
  }
  for (const b of D.WALK_BOUNTIES) ok(!D.BOUNTY_BY_ID[b.id] && isStr(b.text) && isNum(b.base) && Array.isArray(b.modes) && D.WALK_BOUNTY_TYPES.includes(b.type), `walk bounty ${b.id} (type ${b.type})`);
  ok(isNum(B.memories.placeNew) && D.memoriesFor({ placesNew: 3 }).total === 3 * B.memories.placeNew, 'memoriesFor counts placesNew');
  console.log(`  v2 walk: ${placeIds.size} places, ${walkCells} walkable cells, ${gridChecks} eroded grids (variants × shortcuts), ${D.SPECIES.filter((x) => x.place).length} place-kept species`);
}

// ---------------------------------------------------------------------------- v3 (BRIEF-v3, DESIGN §25, CONTRACT §13) — pass 3 only
if (V3) {
  const WL = await import('./walk-lib.mjs');
  const WLY = await import('../src/world-layout.js');
  const T0 = Date.now();
  const near = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const within = (v, target, tol) => Math.abs(v - target) <= tol + 1e-9;
  const B3 = D.BALANCE_V3, SZ = B3.size, FV = B3.favour;
  const LAKES = ZONE_IDS;
  // a v1 reference instance (both flags off) for "unchanged" and "disjoint" rules
  const flags = [globalThis.GW_WALK, globalThis.GW_V3];
  globalThis.GW_WALK = false; globalThis.GW_V3 = false;
  const V1 = await import('../src/data.js?v3ref');
  globalThis.GW_WALK = true; globalThis.GW_V3 = false;
  const W2 = await import('../src/data.js?v3walkref');
  globalThis.GW_WALK = false; globalThis.GW_V3 = true;
  const NW = await import('../src/data.js?v3nowalk');   // v3 without §24
  [globalThis.GW_WALK, globalThis.GW_V3] = flags;
  ok(V1.V3_ENABLED === false && NW.V3_ENABLED === true && NW.WALK_ENABLED === false, 'reference instances evaluated with the intended flags');

  // ---- the v3-without-loop fingerprint (slice 1a, PLAN §4.3): the phase-1 build and this pass's build hash as the merged base
  // wrote them (fresh instances, GW_LOOP unset; v3FingerprintBuilds puts the flags back as they were)
  {
    const fs = await import('node:fs');
    const { fingerprint } = await import('./fingerprint.mjs');
    if (ok(fs.existsSync(V3_FP_PATH), 'tools/tests/v3-exports.json (the v3-without-loop fingerprint) is missing')) {
      const REF = JSON.parse(fs.readFileSync(V3_FP_PATH, 'utf8')), FB = await v3FingerprintBuilds();
      ok(FB.p1.V3_PHASE === 1 && FB.p1.WALK_ENABLED === false && FB.walk.WALK_ENABLED === true && FB.p1.LOOP_ENABLED !== true && FB.walk.LOOP_ENABLED !== true,
        'the v3 fingerprint builds evaluated with the intended flags (phase 1 without walking; phase 4 with it; no loop)');
      for (const [key, M] of [['p1', FB.p1], ['walk', FB.walk]]) {
        const now = fingerprint(M, REF.names);
        for (const n of REF.names) ok(now[n] === REF[key][n], `v3 fingerprint: export ${n} changed from ${REF.from} in the ${key} build (the loop must stay behind LOOP_ENABLED; the file is never refreshed)`);
      }
    }
  }

  // ---- exports, the flag and the merge
  const V3_EXPORTS = ['V3_ENABLED', 'BALANCE_V3', 'SIZE_CLASSES', 'SPECIES_V3', 'SPECIES_V3_BY_ID', 'FISH_FAMILIES', 'FISH_STYLES', 'FISH_SHAPES_V3', 'WEATHER', 'KEPT_CONDS',
    'FISH_PALETTES', 'ELDER_NAMES', 'MOSSMERE_V3', 'PLACE_SYNC_V3', 'WALK_SYNC_V3', 'PLACES_V3', 'PLACE_V3_BY_ID', 'CONDITIONS', 'RUMOURS', 'TODAYS_RUMOUR', 'TACKLE', 'OUTFIT',
    'LURES', 'COMBAT_KIT', 'EXPEDITION', 'LONG_DESCENT', 'ECONOMY_V3', 'MEMORIES_V3', 'RELICS_V3', 'ANGLER_POOL', 'BOONS_V3', 'CHARACTERS_V3', 'GLOOM_TAB', 'CHALLENGES_V3',
    'CHALLENGE_TABS_V3', 'COSMETICS_V3', 'LEDGER', 'COVE', 'RENAMES', 'TEXT_V3', 'TIPS_V3', 'MERCHANT_LINES_V3', 'FOUND_RELICS', 'AGE_MARKS', 'VISTAS', 'REMNANTS',
    'sizeL50', 'sizeLength', 'sizeWeight', 'sizeClassOf', 'isAncient', 'maxZFor', 'reachOf', 'favourNotches', 'classOdds', 'fishValueV3', 'fishYieldV3', 'farWaterFor',
    'swarmTonight', 'swarmWindow', 'tallyFor', 'frameFor', 'CATCH_V3', 'AUTOFISH', 'FIRST_EVENING', 'INTRO', 'catchChance', 'catchParts', 'catchOdds', 'catchItemHold',
    'catchItemTargets', 'catchBuffHold', 'catchBestItem', 'catchRating', 'catchDisplay', 'catchClassAllowed', 'catchHomeLake'];
  for (const k of V3_EXPORTS) ok(k in D && k in V1, `v3 export ${k} must exist in every build (inert when V3 is off)`);
  const MERGED = ['bite'];   // v3 keys merged into an existing v1 block (CONTRACT §13.8); every other BALANCE_V3 key is a new block
  for (const k of Object.keys(B3)) {
    if (MERGED.includes(k)) {
      ok(isObj(V1.BALANCE[k]) && Object.keys(B3[k]).every((q) => !(q in V1.BALANCE[k])), `BALANCE_V3.${k}: its keys must be new inside v1's BALANCE.${k}`);
      ok(Object.entries(V1.BALANCE[k]).every(([q, v]) => JSON.stringify(D.BALANCE[k][q]) === JSON.stringify(v)) && Object.keys(B3[k]).every((q) => D.BALANCE[k][q] === B3[k][q]), `BALANCE.${k}: v1 keys kept, v3 keys added`);
    } else {
      ok(!(k in V1.BALANCE) && !(k in W2.BALANCE), `BALANCE_V3.${k} would replace a v1/v2 BALANCE key`);
      ok(D.BALANCE[k] === B3[k], `BALANCE.${k} must be BALANCE_V3.${k} in the v3 build`);
    }
  }
  ok(!('size' in V1.BALANCE) && !('farWater' in W2.BALANCE), 'v3 BALANCE keys stay out of the v1 and v2 builds');
  ok(V1.SPECIES.length === 32 && W2.SPECIES.length === 40, 'the v1 / v2 rosters are untouched (32 / 40)');
  // with V3 off nothing of v3 leaks into a v1 / v2 table (the v3 exports exist, inert)
  for (const R of [V1, W2]) {
    const tag = R === V1 ? 'v1' : 'v2';
    ok(R.SPECIES.every((s) => !('size' in s) && !('style' in s) && !('family' in s)) && R.SPECIES_BY_ID.pale_leviathan && !R.SPECIES_BY_ID.lantern_swallower, `${tag}: species carry no v3 fields; the Pale Leviathan keeps its id`);
    ok(!R.ZONES[0].arena.places && !R.ZONES.some((z) => 'homeward' in z) && R.ZONES[0].arena.pillars.every((o) => o.kind !== 'hands') && !('accent' in R.MOSSMERE_V3 && R.ZONES[0].palette.accent === R.MOSSMERE_V3.palette.accent), `${tag}: the Mossmere arena, palette and zones are untouched`);
    ok(R.BAIT_BY_ID.pale_marrow && R.SUPPLY_BY_ID.tide_chart && R.RELIC_BY_ID.old_debt && !R.RELIC_BY_ID.measuring_cord && R.CHALLENGES.length === (R === V1 ? 30 : 40) && !R.BOON_BY_ID.long_cast, `${tag}: baits, supplies, relics, challenges and boons are untouched`);
    ok(!('bite' in R.BALANCE && 'pips' in R.BALANCE.bite) && !R.CHARACTERS.some((c) => 'fishing' in c) && !('v3' in R.TEXT) && R.FISH_SHAPES.length === 13, `${tag}: BALANCE.bite, characters, TEXT and FISH_SHAPES are untouched`);
    ok(R.PLACES.every((p) => !('holdsGiants' in p) && !('maxClass' in p)) && R.ARENA_V2.paleabyss.lamps.every((l) => !l.watch), `${tag}: §24 places and lamps carry no v3 fields`);
  }

  // ---- the roster (brief §6.5)
  const S = D.SPECIES_V3, byId = D.SPECIES_V3_BY_ID;
  ok(S.length === 53 && new Set(S.map((s) => s.id)).size === 53, `SPECIES_V3 must hold 53 unique species (got ${S.length})`);
  ok(D.SPECIES.length === 53 && D.SPECIES.every((s, i) => s.id === S[i].id), 'the v3 build replaces SPECIES with the 53-species roster');
  const lakeOf = (s) => s.zone;
  const COUNT = { mossmere: [4, 2, 5, 1, 3, 2], sporewood: [3, 3, 5, 1, 3, 2], glasswater: [3, 2, 7, 1, 4, 2], paleabyss: [3, 2, 7, 1, 5, 3] };   // C U R L kept nightOnly
  for (const z of LAKES) {
    const zs = S.filter((s) => lakeOf(s) === z), n = (r) => zs.filter((s) => s.rarity === r).length;
    const kept = zs.filter((s) => s.place).length, night = zs.filter((s) => s.rarity !== 'legendary' && s.time === 'gloom').length;
    const got = [n('common'), n('uncommon'), n('rare'), n('legendary'), kept, night];
    ok(JSON.stringify(got) === JSON.stringify(COUNT[z]), `${z}: commons/uncommons/rares/legend/kept/night-only ${got} (brief §6.5: ${COUNT[z]})`);
    ok(night >= 2, `${z}: ≥ 2 night-only species`);
    ok(zs.filter((s) => s.rarity !== 'legendary' && s.size.sigma >= SZ.giantTailSigma).length >= 2, `${z}: ≥ 2 giant-tail species (σ ≥ ${SZ.giantTailSigma})`);
    ok(zs.filter((s) => s.rarity !== 'legendary').length === (z === 'mossmere' || z === 'sporewood' ? 11 : 12), `${z}: 11 / 11 / 12 / 12 non-legendary species (one Long Wall frame each)`);
  }
  const GIANT = ['weeping_carp', 'bridgechain_sturgeon', 'nightbloom_carp', 'mildew_angler', 'mirror_pike', 'blind_scrivener', 'gilt_eyed_eel', 'candlewake_sturgeon'];
  ok(JSON.stringify(S.filter((s) => s.rarity !== 'legendary' && s.zone && LAKES.includes(s.zone) && s.size.sigma >= SZ.giantTailSigma).map((s) => s.id).sort()) === JSON.stringify(GIANT.slice().sort()), 'the giant-tail species are exactly the brief\'s eight');
  ok(S.filter((s) => s.wanderer).map((s) => s.id).join() === 'pilgrim_salmon,hearthfish' && S.filter((s) => s.wanderer).every((s) => s.rarity === 'rare'), 'two rare Wanderers: the Pilgrim Salmon and the Hearthfish');
  ok(S.filter((s) => s.cove).map((s) => s.id).join() === 'quayling', 'the Landing has one species, the Quayling');
  ok(S.filter((s) => s.place).length === 15 && S.filter((s) => s.rarity !== 'legendary' && s.time === 'gloom').length === 10, 'totals: 15 place-kept, 10 night-only');
  ok(S.filter((s) => s.rarity === 'common').length === 14 && S.filter((s) => s.rarity === 'uncommon').length === 9 && S.filter((s) => s.rarity === 'rare').length === 26 && S.filter((s) => s.rarity === 'legendary').length === 4, 'totals: 14 C · 9 U · 26 R · 4 L');
  // phasing: 33 (32 lake species + the cove's Quayling, FE-D1) → 37 (P2) → 45 (+ §24's 8) → 47 (P3) → 53 (P4)
  const ph = (p, walk = false) => S.filter((s) => s.phase <= p && (walk || s.src !== 'walk')).length;
  const p45 = S.filter((s) => s.phase <= 2 || s.src === 'walk').length;
  ok(ph(1) === 33 && ph(2) === 37 && p45 === 45 && ph(3, true) === 47 && ph(4, true) === 53, `phasing 33/37/45/47/53 (got ${ph(1)}/${ph(2)}/${p45}/${ph(3, true)}/${ph(4, true)})`);
  ok(byId.quayling.phase === 1 && byId.quayling.zone === 'cove' && !byId.quayling.zones, 'FE-D1: the Quayling is a phase-1, cove-only species (the First Evening ships at phase 1)');
  ok(S.filter((s) => s.src === 'walk').length === 8 && S.filter((s) => s.src === 'walk').every((s) => s.phase === 3), '§24\'s 8 place-kept fish arrive with the §24 lake builds');
  // existing species keep their reel core (the sims' numbers depend on it)
  const v1ids = new Set([...V1.SPECIES, ...V1.WALK_SPECIES].map((s) => s.id));
  for (const o of [...V1.SPECIES, ...V1.WALK_SPECIES]) {
    const id = D.RENAMES.species[o.id] || o.id, s = byId[id];
    if (!ok(!!s, `v1/§24 species ${o.id} missing from SPECIES_V3 (and not renamed)`)) continue;
    for (const k of ['zone', 'rarity', 'tier', 'value', 'behavior', 'time', 'depth', 'difficulty']) ok(JSON.stringify(s[k]) === JSON.stringify(o[k]), `species ${id}.${k} changed from v1 (the reel core and the brief's tables assume today's ${k})`);
    if (o.boss) ok(JSON.stringify(s.boss) === JSON.stringify(o.boss), `legend ${id} boss script changed`);
  }
  ok(S.filter((s) => !v1ids.has(s.id) && !s.renamedFrom).length === 13, '13 new species (4 Mossmere, 3 P3, 6 P4)');
  const PATTERNS = ['scales', 'stripes', 'bands', 'spots', 'none', 'marks'];
  for (const s of S) {
    const id = s.id, zone = s.zones?.[0] ?? s.zone;
    ok(D.FISH_STYLES.includes(s.style), `species ${id} style ${s.style}`);
    ok(['steady', 'darter', 'sinker', 'thrasher', 'leaper'].includes(s.behavior), `species ${id} behavior must stay a reel-core behaviour`);
    if (s.style === 'runner' || s.style === 'sulker') ok(s.behavior !== s.style, `species ${id}: runner/sulker fight as their base behaviour until the verb lands`);
    ok(D.FISH_FAMILIES.includes(s.family), `species ${id} family ${s.family} (insect | predator | bottom | glow)`);
    ok(D.FISH_SHAPES_V3.includes(s.model.shape) && PATTERNS.includes(s.model.pattern), `species ${id} model shape/pattern`);
    ok(['any', 'calm', 'gloom', 'dawn'].includes(s.time) && s.night === (s.time === 'gloom'), `species ${id} time / night flag`);
    ok([1, 2, 3, 4].includes(s.phase) && ['v1', 'walk', 'v3'].includes(s.src), `species ${id} phase / src`);
    if (s.maxClass) ok(s.maxClass in SZ.classMaxZ, `species ${id} maxClass ${s.maxClass}`);
    if (s.rarity === 'legendary') {
      ok(s.size.sigma === SZ.legend.sigma && isNum(s.size.W50) && within(s.size.k * s.size.L50 ** 3 / 1000, s.size.W50, s.size.W50 * 0.001), `legend ${id} authored size (σ 0.02, W50 = k·L50³)`);
      ok(!s.place && D.PLACE_V3_BY_ID[s.legendPlace]?.legend === true && D.PLACE_V3_BY_ID[s.legendPlace]?.zone === s.zone, `legend ${id} legendPlace must be its lake's legend place`);
      continue;
    }
    ok(D.WEATHER.includes(s.prefers), `species ${id} prefers (field-note condition) ${s.prefers}`);
    ok(!('oldTrick' in s), `species ${id} carries an old trick (retired with the manual reel, D1′)`);
    ok(s.size.sigma >= SZ.sigma[0] - 1e-9 && s.size.sigma <= SZ.sigma[1] + 1e-9, `species ${id} σ ${s.size.sigma} outside ${SZ.sigma}`);
    ok(s.size.k === SZ.k[s.size.body], `species ${id} size.k must be the ${s.size.body} body constant`);
    const L50 = D.sizeL50(s, zone), ceil = D.sizeLength(s, SZ.reachZ, zone);
    ok(ceil / L50 <= SZ.maxReachRatio + 1e-9 && ceil / L50 >= 2.0 - 1e-9, `species ${id} ceiling ${(ceil / L50).toFixed(2)}× median (brief: 2.0–2.8×)`);
    const ek = D.sizeLength(s, SZ.elderKeeperRatio.elderZ, zone) / D.sizeLength(s, SZ.elderKeeperRatio.keeperZ, zone);
    ok(ek >= SZ.elderKeeperRatio.range[0] - 1e-9 && ek <= SZ.elderKeeperRatio.range[1] + 1e-9, `species ${id} Elder/Keeper length ${ek.toFixed(2)} outside ${SZ.elderKeeperRatio.range}`);
    ok(Array.isArray(s.weight) && s.weight[0] > 0 && s.weight[0] < s.weight[1], `species ${id} derived weight range`);
    for (const pid of Object.keys(s.spots || {})) ok(D.PLACE_V3_BY_ID[pid]?.zone === s.zone, `species ${id} spot ${pid} is not a place of its lake`);
    if (s.place) {
      const p = D.PLACE_V3_BY_ID[s.place];
      if (!ok(!!p && p.zone === s.zone, `kept species ${id} place ${s.place} unknown / not in its lake`)) continue;
      ok(s.rarity === 'rare' && !s.bait, `kept species ${id} must be a bait-free rare`);
      ok(s.depth[0] <= p.water.depth[1] && p.water.depth[0] <= s.depth[1], `kept species ${id} depth never overlaps ${p.id}`);
      if (s.cond) ok(D.KEPT_CONDS[s.cond] === p.rule?.type, `kept species ${id} cond '${s.cond}' needs a ${D.KEPT_CONDS[s.cond]} rule at ${p.id} (has ${p.rule?.type})`);
      if (s.weather) ok(D.WEATHER.includes(s.weather), `kept species ${id} weather ${s.weather}`);
      ok(!!(s.cond || s.weather || p.rule || s.time !== 'any'), `kept species ${id} must be tied to one condition (cond, weather, the place rule or its hour)`);
      if (s.src === 'v3' && s.zone !== 'mossmere') ok(s.proposal === true && (D.PLACE_SYNC_V3[s.place]?.kept || []).includes(id), `kept species ${id} on a §24 place must be a routed proposal (▲) listed in PLACE_SYNC_V3.${s.place}.kept`);
    }
  }
  ok(S.filter((s) => s.weather).map((s) => s.id).join() === 'bridgechain_sturgeon', 'condition-gated (weather) species: only the Bridgechain Sturgeon (Mirror Hush)');
  const ps = byId.pilgrim_salmon, L = ps.size.L50;
  ok(L.sporewood < L.glasswater && L.glasswater < L.paleabyss && !L.mossmere && ps.zones.join() === 'sporewood,glasswater,paleabyss', 'the Pilgrim Salmon grows each lake down, Sporewood and deeper');
  ok(within(D.sizeLength(ps, 3.6, 'paleabyss'), 206, 1), 'the Pilgrim Salmon reaches ≈ 206 cm in the Pallid Deep');
  ok(byId.hearthfish.zones.length === 4 && byId.hearthfish.minOilFrac === 0.75, 'the Hearthfish wanders every lake, oil ≥ 75%');
  const q = byId.quayling;
  ok(q.maxClass === 'keeper' && q.noSale && q.value === 0 && within(D.reachOf(q), 15.5, 0.1), 'the Quayling: Keeper cap (15.5 cm), never sold');
  ok(byId.lampwarden_angler.maxClass === 'trophy' && within(D.reachOf(byId.lampwarden_angler), 122, 0.6), 'the Lampwarden caps at Trophy (≈ 122 cm)');
  ok(byId.cupbearer.mm === true && D.sizeL50(byId.cupbearer) < 10, 'the Cupbearer is measured in millimetres');
  // legend rule: each legend ≥ 1.4 × the longest "said to reach" (z 3.6) in its lake
  for (const z of LAKES) {
    const lg = S.find((s) => s.zone === z && s.rarity === 'legendary');
    const longest = Math.max(...S.filter((s) => s.zone === z && s.rarity !== 'legendary').map((s) => D.sizeLength(s, SZ.reachZ, z)));
    const r = D.sizeL50(lg) / longest;
    ok(r >= SZ.legend.minRatio - 1e-9, `legend ${lg.id}: ${D.sizeL50(lg)} cm is ${r.toFixed(2)}× the lake's longest reach (≥ ${SZ.legend.minRatio}×)`);
  }
  ok(within(D.sizeL50(byId.lantern_swallower) / D.ceremony?.wickHeight || D.sizeL50(byId.lantern_swallower) / 100 / B3.ceremony.wickHeight, 10, 0.01), 'the Lantern-Swallower is 10 Wicks long');
  // recolours (brief §6.6) and the palette rule (stricter than the brief's 90–190° / 0.25: DESIGN §19.1's 65–195° / 0.15, run above on SPECIES)
  const RECOLOUR = { mossback_perch: { body: 0x585e66 }, reedjaw_pike: { body: 0x3e4a5c }, weeping_carp: { body: 0x646a74 }, dusk_minnow: { body: 0x7a8494 },
    gloam_eel: { body: 0x16142a, glow: 0xb9a8ff }, belled_matriarch: { body: 0x6a5a44, glow: 0xd8d0ff } };
  for (const [id, cols] of Object.entries(RECOLOUR)) for (const [k, v] of Object.entries(cols)) ok(byId[id].model[k] === v, `recolour ${id}.${k} must be #${v.toString(16)} (brief §6.6)`);
  for (const s of S.filter((x) => x.zone === 'glasswater')) { const g = s.model.glow; if (isNum(g)) { const { h, s: sat } = hsl(g); ok(!(h >= 150 && h <= 190 && sat > 0.25), `glasswater glow ${s.id} is aqua (brief: sapphire, not aqua)`); } }
  for (const [lake, P] of Object.entries(D.FISH_PALETTES)) for (const c of [...P.hues, P.glow].filter(isNum)) palCheck(`FISH_PALETTES.${lake}`, c);

  // ---- the size model (brief §6.1, §5.5)
  ok(JSON.stringify(D.SIZE_CLASSES.map((c) => c.id)) === '["small","keeper","prize","trophy","elder"]', 'one ladder: Small · Keeper · Prize · Trophy · Elder');
  ok(JSON.stringify(D.SIZE_CLASSES.slice(0, 4).map((c) => c.zMax)) === '[-0.25,1.04,1.88,2.65]' && SZ.ancient === 3.2 && SZ.reachZ === 3.6 && SZ.z.min === -2 && SZ.z.max === 3.6 && SZ.tail === 0.06, 'class cuts −0.25 / 1.04 / 1.88 / 2.65, Ancient 3.2, truncation [−2, 3.6], tail 0.06');
  ok(SZ.elsewhereMaxZ < 2.65 && SZ.classMaxZ.trophy < 2.65 && SZ.classMaxZ.prize < 1.88 && SZ.classMaxZ.keeper < 1.04, 'class caps sit just under their cuts');
  const ODDS = { 0: [38.7, 46.0, 12.2, 2.7, 0.4, 0.1], 0.5: [22.2, 48.2, 21.2, 6.9, 1.5, 0.3], 1.0: [10.5, 41.3, 29.6, 14.1, 4.5, 0.9], 1.5: [4.1, 28.8, 33.1, 23.1, 10.9, 2.7], 1.8: [2.1, 21.1, 32.0, 28.1, 16.8, 4.7] };
  for (const [mu, exp] of Object.entries(ODDS)) {
    const o = D.classOdds(+mu), got = [o.small, o.keeper, o.prize, o.trophy, o.elder, o.ancient].map((x) => 100 * x);
    ok(got.every((g, i) => within(g, exp[i], 0.11)), `class odds at μ ${mu}: ${got.map((g) => g.toFixed(1))} (brief ${exp})`);
  }
  ok(D.classOdds(1.8, SZ.elsewhereMaxZ).elder === 0, 'outside giant water z is clamped to a top Trophy (no Elders)');
  const dc = D.classOdds(0.55);
  ok(within(dc.prize * 100, 22, 0.6) && within(dc.trophy * 100, 7.4, 0.3) && within(dc.elder * 100, 1.7, 0.2), `the "decent cast" (μ 0.55): Prize ${(dc.prize * 100).toFixed(1)} Trophy ${(dc.trophy * 100).toFixed(1)} Elder ${(dc.elder * 100).toFixed(1)} (brief 22 / 7.4 / 1.7)`);
  // favour: notches, cap, examples
  ok(JSON.stringify(FV.notches) === '[0.15,0.45,0.8,1.2,1.6]' && FV.cap === 1.8, 'favour notches 0.15 / 0.45 / 0.8 / 1.2 / 1.6, cap 1.8');
  for (const e of FV.examples) {
    const mu = Math.min(FV.cap, e.terms.reduce((a, b) => a + b, 0));
    ok(within(mu, e.mu, 1e-9) && D.favourNotches(e.mu) === e.notches, `favour example "${e.name}": μ ${mu.toFixed(2)} → ${D.favourNotches(e.mu)} notches (brief ${e.notches})`);
  }
  ok(FV.place.inside === 0.15 && FV.place.astir === 0.35 && FV.hour.nightRise === 0.25 && FV.hour.dusk === 0.2 && FV.match.condition === 0.3 && FV.match.rumour === 0.3
    && FV.tackle.bait.ember_roe === 0.35 && FV.tackle.depthLowerThird === 0.25 && FV.tackle.cleanCast === 0.1 && FV.pressure.perCatch === -0.12 && FV.pressure.floor === -0.6
    && within(FV.pressure.quietAt, 3 * FV.pressure.perCatch, 1e-9), 'favour terms per brief §6.1 ("gone quiet" at 3 catches)');
  ok(Object.keys(FV.tackle.lure).every((id) => D.LURES.some((l) => l.id === id && l.favour === FV.tackle.lure[id])), 'favour lure terms match LURES');
  // value and yield
  ok(D.fishValueV3(byId.reedjaw_pike, 2.8) === 127, `Elder Reedjaw (z 2.8) is worth ${D.fishValueV3(byId.reedjaw_pike, 2.8)} Shells (brief 127)`);
  const VM = SZ.valueMix, Ez = (mu, cap) => { let num = 0, den = 0; for (let z = SZ.z.min; z <= cap; z += 0.002) { const p = Math.exp(-0.5 * (z - mu) ** 2); const cb = z >= 2.65 ? SZ.value.classBonus.elder : z >= 1.88 ? SZ.value.classBonus.trophy : 1; num += p * Math.min(SZ.value.clamp[1], Math.max(SZ.value.clamp[0], Math.exp(SZ.value.perZ * z))) * cb; den += p; } return num / den; };
  let mix = 0; for (const [mu, w] of VM.mu) mix += w * ((1 - VM.giantShare) * Ez(mu, SZ.elsewhereMaxZ) + VM.giantShare * Ez(mu, SZ.z.max));
  ok(within(mix, VM.multiplier, 0.005) && within(VM.sizeKMean / mix, SZ.value.factor, 0.005), `value factor: sizeK ${VM.sizeKMean} / mix ${mix.toFixed(3)} = ${(VM.sizeKMean / mix).toFixed(3)} (data ${SZ.value.factor})`);
  ok(within(VM.mu.reduce((a, [, w]) => a + w, 0), 1, 1e-9), 'value mix weights sum to 1');
  ok(D.fishValueV3(byId.pilgrim_salmon, 0, { zone: 'paleabyss' }) === Math.round(30 * 3.0 * 0.66), 'Wanderer values scale with the lake valueMult');
  // D1′: the manual reel's size → fight and reel blocks are retired (automatic fishing: CATCH_V3 decides, AUTOFISH.play performs)
  ok(!('fight' in SZ) && !('reel' in SZ), 'BALANCE.size carries no manual-reel block (fight, reel: retired by D1′)');
  // residents (brief §7.0)
  const R3 = B3.residents, erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const Phi = (x) => 0.5 * (1 + erf((x - R3.z.mean) / R3.z.sd / Math.SQRT2)), top = Phi(R3.z.max) - Phi(R3.z.min);
  let mzSum = 0, dz = 0.001; for (let z = R3.z.min; z <= R3.z.max; z += dz) mzSum += z * Math.exp(-0.5 * ((z - R3.z.mean) / R3.z.sd) ** 2); let den = 0; for (let z = R3.z.min; z <= R3.z.max; z += dz) den += Math.exp(-0.5 * ((z - R3.z.mean) / R3.z.sd) ** 2);
  const eS = (Phi(R3.z.max) - Phi(2.65)) / top, aS = (Phi(R3.z.max) - Phi(SZ.ancient)) / top;
  ok(within(eS, R3.checks.elderShare, 0.002) && within(aS, R3.checks.ancientShare, 0.001) && within(mzSum / den, R3.checks.meanZ, 0.01), `resident z: Elder ${(eS * 100).toFixed(1)}%, Ancient ${(aS * 100).toFixed(1)}%, mean ${(mzSum / den).toFixed(2)} (brief 12.4 / 1.1 / 2.27)`);
  ok(R3.z.min === 1.88 && R3.reroll.afterInLakeDays === 3 && B3.markedFish.max === 6, 'residents always Trophy+, re-roll after 3 in-lake days; ≤ 6 Marked Fish');

  // ---- signs, bite, ceremony (brief §5.1–§5.8)
  ok(JSON.stringify(Object.keys(B3.signs.kinds)) === '["rise","boil","nervous","strike","bubbles","glow"]' && B3.signs.maxAlive === 6 && B3.signs.kinds.glow.night, 'six signs (≤ 6 alive; the glow trail is night only)');
  ok(JSON.stringify(D.SIZE_CLASSES.map((c) => c.bite)) === '["doublePop","plunge","dragUnder","flatSlide","dome"]', 'one bite tell per class');
  ok(!('pips' in B3.bite) && !('pips' in D.BALANCE.bite) && !('nearMiss' in B3.ceremony), 'no hook-hold pips and no near-miss card config (retired by D1′; the got-away note is AUTOFISH.gotAway)');
  ok(JSON.stringify(D.SIZE_CLASSES.map((c) => c.ceremony)) === '[1.2,1.2,2.4,3.5,5]' && JSON.stringify(B3.ceremony.poses.map((p) => p.below)) === JSON.stringify([0.25, 0.85, 2.0, null].map((v) => v ?? Infinity)) || B3.ceremony.poses[3].below === Infinity, 'ceremony times and poses by length');
  const sealSpecies = S.filter((s) => D.sealsFor(s).length > 0), sealTotal = sealSpecies.reduce((a, s) => a + D.sealsFor(s).length, 0);
  ok(B3.ceremony.wickHeight === 0.85 && B3.records.oldLedgerZ === 2.3 && B3.records.seals.total === sealTotal && sealTotal === 143 && sealSpecies.length === 48, `the Wick is 0.85 m; Old Ledger at z 2.3; 48 species × 3 − the Lampwarden's Elder = ${sealTotal} seals (143)`);
  ok(S.every((s) => !s.maxClass || s.cove || D.sealsFor(s).length === (SZ.classMaxZ[s.maxClass] >= D.SIZE_CLASSES[3].zMax ? 3 : B3.records.seals.classes.filter((c) => c !== 'elder').length)) && D.sealsFor(byId.lampwarden_angler).join() === 'prize,trophy', 'a species capped below Elder has no Elder seal');
  ok(S.filter((s) => s.rarity !== 'legendary' && !s.cove).length === B3.records.seals.species, 'the seal grid covers the 48 non-legendary lake and Wanderer species');

  // ---- oil, Far Water, the Live Well (brief §3.4)
  const O = B3.oil.context, P3 = D.EXPEDITION.phases, base = D.STATS.oilDrain.base;
  const dayOil = (zone, ctx, nightBurn = 1, calm = P3.calm) => base * D.ZONE_BY_ID[zone].drain.oil * (calm * O[ctx].calm + P3.dusk * O[ctx].dusk + P3.gloomtide * O[ctx].gloomtide * nightBurn + P3.dawn * O[ctx].dawn);
  ok(within(dayOil('mossmere', 'raft'), B3.oil.checks.mossmereDay, 0.05) && within(dayOil('mossmere', 'raft', 1, P3.calm + D.EXPEDITION.arrivalHush), B3.oil.checks.mossmereDay1, 0.05),
    `Mossmere day on the raft: ${dayOil('mossmere', 'raft').toFixed(1)} oil, day 1 ${dayOil('mossmere', 'raft', 1, P3.calm + 30).toFixed(1)} (brief 28.3 / 30.1)`);
  const footMin = (ph) => D.STATS.maxOil.base / (base * D.ZONE_BY_ID.glasswater.drain.oil * O.foot[ph]) / 60;
  ok(within(footMin('calm'), B3.oil.checks.footLantern.day, 0.05) && within(footMin('gloomtide'), B3.oil.checks.footLantern.night, 0.05), `a full lantern on foot in Glasswater lasts ${footMin('calm').toFixed(1)} min by day, ${footMin('gloomtide').toFixed(1)} at night (brief 7 / 5)`);
  ok(O.raft.gloomtide === 1.0 && O.foot.gloomtide === 1.4 && O.lamp.gloomtide === 0.7, 'raft night 1.0 in all modes; foot night 1.4; lamp night 0.7');
  for (const row of B3.farWater.table) {
    const f = D.farWaterFor(row.day);
    ok(within(f.favour, row.favour, 1e-9) && f.shows === row.shows && f.murk === row.murk && (row.oilPrice === null ? f.oilPrice === null : within(f.oilPrice, row.oilPrice, 1e-9))
      && within(f.render, row.render, 1e-9) && within(f.nightBurn, row.nightBurn, 1e-9), `Far Water day ${row.day}: formulas reproduce the brief table`);
  }
  ok(D.farWaterFor(1).favour === 0 && D.farWaterFor(1).murk && D.farWaterFor(7).murk && !D.farWaterFor(8).murk && within(D.farWaterFor(7).oilPrice, 3, 1e-9), 'Far Water starts at the first dawn; Murk odd days only after day 3');
  // a Mossmere common's rendered oil = mean species.oil × factor × E[clamp(e^(0.3z))] over the favour mix (brief ≈ 17)
  const YY = SZ.yield, Ey = (mu, cap) => { let nn = 0, dd = 0; for (let z = SZ.z.min; z <= cap; z += 0.002) { const p = Math.exp(-0.5 * (z - mu) ** 2); nn += p * Math.min(YY.clamp[1], Math.max(YY.clamp[0], Math.exp(YY.perZ * z))); dd += p; } return nn / dd; };
  let ymix = 0; for (const [mu, w] of VM.mu) ymix += w * ((1 - VM.giantShare) * Ey(mu, SZ.elsewhereMaxZ) + VM.giantShare * Ey(mu, SZ.z.max));
  ok(within(ymix, YY.mix, 0.002) && within(VM.sizeKMean / ymix, YY.factor, 0.002), `yield factor: sizeK ${VM.sizeKMean} / mix ${ymix.toFixed(3)} = ${(VM.sizeKMean / ymix).toFixed(3)} (data ${YY.factor} / ${YY.mix})`);
  const mossCommons = S.filter((s) => s.zone === 'mossmere' && s.rarity === 'common');
  const common = mossCommons.reduce((a, s) => a + s.oil, 0) / mossCommons.length * YY.factor * ymix;
  ok(within(common, B3.oil.checks.renderedCommon, 0.1), `a Mossmere common renders ${common.toFixed(2)} oil on average (brief ${B3.oil.checks.renderedCommon})`);
  ok(within(D.fishYieldV3({ oil: 10 }, 0), 10 * YY.factor * 1, 1e-9), 'fishYieldV3 applies the yield factor');
  B3.farWater.rendersPerDay.forEach((exp, i) => {
    const day = i + 1, f = D.farWaterFor(day), oil = dayOil('mossmere', 'raft', f.nightBurn, P3.calm + (day === 1 ? D.EXPEDITION.arrivalHush : 0));
    ok(within(oil / (common * f.render), exp, 0.06), `Mossmere commons rendered on day ${day}: ${(oil / (common * f.render)).toFixed(2)} (brief ${exp})`);
  });
  ok(JSON.stringify(B3.liveWell.nightsByCreel) === JSON.stringify(D.TACKLE.creel.map((c) => c.nights)), 'Live Well nights follow the Creel tiers (3 / 3 / 4 / 4 / 5)');

  // ---- night modes (brief §4)
  const NM = B3.nightModes;
  ok(NM.default === 'lantern' && NM.firstOuting === 'still' && NM.offeredFrom === 2 && JSON.stringify(NM.order) === '["still","lantern","gloomtide"]', 'Lantern by default from the 2nd expedition; the First Outing is still');
  ok(within((NM.lantern.window[1] - NM.lantern.window[0]) * P3.gloomtide, 40.5, 1e-9) && within((1 - NM.lantern.window[1]) * P3.gloomtide, NM.lantern.quietTail, 1e-9), 'Lantern window 0.05 → 0.50 (40.5 s); the last 45 s are quiet');
  ok([1, 2, 3, 4, 5, 6].map((n) => +D.swarmTonight('lantern', n)).join('') === '010101' && [1, 2, 3].every((n) => D.swarmTonight('gloomtide', n) && !D.swarmTonight('still', n) && !D.swarmTonight('gloomtide', n, 'first')), 'swarm nights: Lantern even nights, Gloomtide every night, Still and the First Outing never');
  ok(NM.gloomtide.growth === D.BALANCE.gloomGrowth && NM.gloomtide.max === D.BALANCE.gloomMax && NM.gloomtide.wardens.every === D.BALANCE.combat.director.bossEvery, 'Gloomtide keeps today\'s night growth, cap and Warden cadence');
  ok(JSON.stringify(NM.lantern.heatOffset) === '[0,2,4,6]' && JSON.stringify(NM.gloomtide.heatOffset) === '[0,4,8,12]' && JSON.stringify(D.EXPEDITION.deepStarts.heatOffset) === JSON.stringify({ lantern: NM.lantern.heatOffset, gloomtide: NM.gloomtide.heatOffset }), 'Heat arrival offsets per mode');
  ok(NM.lantern.threat.slamSnaps === false && NM.lantern.threat.whileHooked === false && NM.lantern.embersZero === 'scorched' && NM.lantern.scorched.oil === -30 && JSON.stringify(NM.lantern.snuffBy) === '["oil"]' && JSON.stringify(NM.still.snuffBy) === '["oil"]', 'Lantern never costs a hooked fish or the expedition (Scorched, oil-only snuffs)');
  ok(JSON.stringify(NM.lantern.mult) === '{"spawnRate":0.55,"hpMult":0.8,"maxAlive":0.6,"eliteEvery":2}' && NM.lantern.wardens.hpMult === 0.75 && NM.lantern.wardens.everySwarmNight === 2, 'Lantern intensity and Warden cadence');
  ok(NM.lampWatch.modes.join() === 'lantern' && NM.lampWatch.fishWithin === 10, 'lamp-watch: Lantern only, fish within 10 m');
  for (const z of LAKES) {
    const ids = D.WALK_SYNC_V3.watchLamps[z];
    ok(ids?.length === 2, `${z}: two watch-lamps`);
    if (z === 'mossmere') {
      const LM = WLY.buildLayout(D.ZONES[0]);
      ok(ids.every((id) => D.MOSSMERE_V3.watchLamps.some((l) => l.id === id)) && D.MOSSMERE_V3.watchLamps.every((l) => near(LM.docks[l.dock].buoy, l) < 0.1 && l.radius === NM.lampWatch.radius), 'the Mossmere watch-lamps are the drawn buoy-lamps of the south-east and west docks (dock + buoy offset), pool r 6');
    }
    else for (const id of ids) ok(D.ARENA_V2[z].lamps.some((l) => l.id === id && l.watch === true), `${z} watch-lamp ${id} must be a flagged sister-candle`);
  }
  // the hard rule: nothing fishing exists only with combat on
  const fishingThing = (key) => { const [kind, id] = String(key).split(':'); return kind === 'bait' || kind === 'lure' || (kind === 'boon' && (D.ANGLER_POOL.includes(id) || D.BOON_BY_ID[id]?.tags?.includes('fishing'))) || (kind === 'relic' && D.RELIC_BY_ID[id]?.shelf === 'fishing'); };
  ok(JSON.stringify(D.CHALLENGES.filter((c) => c.tab === 'gloom').map((c) => c.id).sort()) === JSON.stringify(D.GLOOM_TAB.slice().sort()) && D.GLOOM_TAB.length === 9, 'the Gloom tab holds exactly the brief\'s nine challenges');
  for (const c of D.CHALLENGES.filter((x) => x.tab === 'gloom')) ok(!c.reward.unlock || !fishingThing(c.reward.unlock), `Gloom challenge ${c.id} unlocks a fishing thing (${c.reward.unlock}): the hard rule`);
  for (const r of D.RELICS.filter((x) => x.shelf === 'gloom')) ok(!Object.keys(r.effects).some((k) => ['castMax', 'lineStrength', 'reelSpeed', 'sweetZone', 'biteSpeed', 'hookWindow', 'rarityBonus', 'slackTime', 'nibbleTells'].includes(k)), `Gloom-shelf relic ${r.id} gives a fishing stat`);
  for (const s of S) ok(!('mode' in s) && !('combatOnly' in s), `species ${s.id} depends on a night mode`);
  for (const p of D.PLACES_V3) ok(!('combatOnly' in p) && !('mode' in p), `place ${p.id} depends on a night mode`);
  for (const t of [...D.LURES, ...D.TACKLE.rod, ...D.TACKLE.line, ...D.TACKLE.reel, ...D.TACKLE.creel, ...D.OUTFIT]) ok(!('modes' in t), `tackle ${t.id} depends on a night mode`);

  // ---- tackle, outfit, lures (brief §5.6, §5.3)
  const PR = { rod: [0, 120, 450, 1400, 3200], line: [0, 120, 450, 1400, 3200], reel: [0, 120, 450, 1400, 3200], creel: [0, 70, 270, 840, 1920] };
  for (const slot of D.TACKLE.slots) {
    const tiers = D.TACKLE[slot];
    ok(tiers.length === 5 && tiers.every((t, i) => t.tier === i && isStr(t.id) && isStr(t.name)), `TACKLE.${slot}: tiers T0–T4`);
    ok(JSON.stringify(tiers.map((t) => t.price)) === JSON.stringify(PR[slot]), `TACKLE.${slot} prices ${tiers.map((t) => t.price)} (brief ${PR[slot]})`);
    ok(tiers.every((t) => t.tier < 2 ? t.proof === null : !!D.TACKLE.proofs[t.proof]), `TACKLE.${slot}: T2–T4 need a proof catch, T0–T1 none`);
    ok(tiers.every((t) => (t.tier <= 2 ? t.onSale === 'start' : t.onSale === (t.tier === 3 ? 'sporewood' : 'glasswater'))), `TACKLE.${slot}: T3 with Sporewood lit, T4 with Glasswater lit`);
    const STAT = { rod: ['hold', 'castMax', 'hookWindow'], line: ['hold'], reel: ['hold'], creel: ['creelSize', 'liveWell', 'nights'] }[slot];
    const RETIRED = ['slackTime', 'shock', 'pips', 'lineStrength', 'slackAdd', 'reelSpeed', 'sweetZone', 'drag', 'absorb'];
    ok(tiers.every((t) => RETIRED.every((k) => !(k in t))), `TACKLE.${slot}: no manual-reel stat on any tier (retired by D1′)`);
    for (const k of STAT) ok(tiers.every((t, i) => i === 0 || t[k] >= tiers[i - 1][k]), `TACKLE.${slot}.${k} never drops with tier`);
    ok(D.TACKLE.catalogue[slot] === tiers.reduce((a, t) => a + t.price, 0), `TACKLE.catalogue.${slot}`);
  }
  ok(D.TACKLE.catalogue.total === 18610 && D.TACKLE.catalogue.total === D.TACKLE.slots.reduce((a, s) => a + D.TACKLE.catalogue[s], 0), 'tackle catalogue 18,610');
  ok(D.TACKLE.rod[0].castMax === D.STATS.castMax.base && D.TACKLE.rod[0].hookWindow === 1 && D.TACKLE.creel[0].creelSize === D.STATS.creelSize.base, 'T0 tackle equals the STATS base');
  ok(D.TACKLE.creel[0].creelSize === 4 && D.TACKLE.creel[4].creelSize === 8, 'the creel range (4–8) equals today\'s per-run Woven Creel range');
  ok(['drag', 'rating', 'gate', 'legends', 'targets'].every((k) => !(k in D.TACKLE)) && !('tackleRating' in B3) && !('tackleRating' in D.BALANCE) && !('stats' in B3), 'no drag presets, reel-sim tables, tackleRating or v3 fight stats (retired by D1′; the rating is catchRating, in words)');
  ok(D.OUTFIT.length === 4 && D.OUTFIT.every((o) => JSON.stringify(o.prices) === '[80,240,600]' && o.maxLevel === 3) && D.OUTFIT.reduce((a, o) => a + o.prices.reduce((x, y) => x + y, 0), 0) === 3680, 'outfit: 4 items × 80 / 240 / 600 (3,680)');
  for (const o of D.OUTFIT) { for (const k of Object.keys(o.effects)) ok(isStatKey(k), `outfit ${o.id} effect ${k} is not a STATS key`); ok(!!D.UPGRADE_BY_ID[o.from], `outfit ${o.id} from ${o.from}`); }
  ok(JSON.stringify(D.LURES.map((l) => l.price)) === '[120,90,120,260,1200,220,480,950,1600]' && D.LURES.reduce((a, l) => a + l.price, 0) === 5040,
    'lures 120 / 90 / 120 / 260 / 1,200 + the giants\' lures 220 / 480 / 950 / 1,600 (5,040; DESIGN §25.6.3; the Feather Fly 40 → 120 with AF)');
  ok(D.LURES.every((l) => l.family === null || D.FISH_FAMILIES.includes(l.family)), 'lure families');
  for (const id of D.COMBAT_KIT.ids) ok(D.UPGRADE_BY_ID[id] && !D.OUTFIT.some((o) => o.from === id), `combat kit ${id}`);
  const KIT = { lantern_mantle: [22, 56, 120, 224], lantern_lens: [36, 80, 168], lantern_striker: [22, 60, 132], raft_hull: [44, 100, 208], raft_hearth: [104, 240] };
  for (const [id, exp] of Object.entries(KIT)) ok(JSON.stringify(D.UPGRADE_BY_ID[id].costs.map((c) => Math.round(c * D.COMBAT_KIT.priceMult))) === JSON.stringify(exp), `combat kit ${id} at 40%: ${exp}`);

  // ---- the expedition and The Long Descent (brief §3)
  const E3 = D.EXPEDITION;
  ok(P3.calm + P3.dusk + P3.gloomtide + P3.dawn === 300 && E3.calmByMode.foot === 185 && E3.arrivalHush === 30, 'a day is 180 + 20 + 90 + 10 s (185 s calm in the foot lakes; +30 s Arrival Hush)');
  ok(JSON.stringify(E3.gates.tolls) === JSON.stringify(Object.fromEntries(D.ZONES.slice(1).map((z) => [z.id, z.unlock.shells]))), 'tolls 180 / 420 / 900 (unchanged, paid once)');
  ok(JSON.stringify(E3.deepStarts.picks) === '{"sporewood":3,"glasswater":6,"paleabyss":9}' && JSON.stringify(E3.deepStarts.draftLevels) === JSON.stringify(Object.fromEntries(Object.entries(D.BALANCE.economy.waystoneLevels).filter(([k]) => k !== 'mossmere'))), 'deep starts: 3 / 6 / 9 picks; the Kindling Draft keeps 9 / 18 / 28');
  ok(E3.tally.perDawn === 3 && E3.tally.perStillNight === 1 && E3.tally.perLanternSwarmNight === 4 && E3.tally.perLakeCrossed === 10 && E3.tally.perLedger === 2 && E3.tally.snuffedMult === 0.5, 'tally: 3 per dawn, 1 per still night, 4 per Lantern swarm night, 10 per lake crossed, 2 per Ledger request, × 0.5 if snuffed');
  ok(D.tallyFor({ dawns: 2, stillNights: 2, ledger: 1 }).total === 10, 'First Outing tally = 10 (brief §2.2)');
  ok(D.tallyFor({ dawns: 4, stillNights: 2, swarmNights: 2, ledger: 1 }).total === 24 && D.tallyFor({ dawns: 4, stillNights: 4, ledger: 1 }).total === 18, '4-day tally: Lantern 24, Still 18 (brief §9.4)');
  ok(D.tallyFor({ dawns: 4, stillNights: 4, ledger: 1, snuffed: true }).total === 9 && D.tallyFor({ mode: 'gloomtide', swarmNights: 3, zoneIndex: 2 }).total === 15, 'tally: snuffed halves; Gloomtide pays nightsSurvived × (3 + zone)');
  for (const [z, st] of Object.entries(E3.homeward.stones)) {
    const A = D.walkArenaFor(z);
    ok(near(st, A.spawn) >= E3.homeward.minPathFromSpawn, `${z} Homeward Waystone (${st.x}, ${st.z}) is ${near(st, A.spawn).toFixed(1)} m from the spawn in a straight line (≥ ${E3.homeward.minPathFromSpawn} m of path)`);
    ok(D.ZONE_BY_ID[z].homeward?.x === st.x, `${z}.homeward set in the v3 build`);
  }
  // beside, not on: clear of stands, slots, lamps, posts, buoys and barge pads; open raft water (Mossmere) or walkable ground that
  // still lets the Wick reach every mooring stand with the stone's block in place (§24 lakes)
  const HCL = E3.homeward.clearOf;
  const stoneClear = (zone, st, label) => {
    const A = D.walkArenaFor(zone), L = WLY.buildLayout(D.ZONE_BY_ID[zone]);
    const hits = [];
    for (const m of A.moorings || []) { if (near(st, m.stand) < HCL.stand) hits.push(`stand ${m.id}`); if (near(st, m.slot) < HCL.stand + 1) hits.push(`slot ${m.id}`); }
    for (const l of (D.ARENA_V2[zone]?.lamps || [])) if (near(st, l) < HCL.lamp) hits.push(`lamp ${l.id}`);
    for (const d of L.docks) { if (near(st, d) < HCL.bargePad) hits.push('barge pad'); if (near(st, d.buoy) < HCL.buoy) hits.push('buoy'); for (const p of d.posts) if (near(st, p) < HCL.post) hits.push('post'); }
    ok(hits.length === 0, `${label} Homeward stone (${st.x}, ${st.z}) is too close to ${hits.join(', ')}`);
    return L;
  };
  for (const [z, st] of Object.entries(E3.homeward.stones)) {
    const L = stoneClear(z, st, z);
    if (z === 'mossmere') ok(WLY.isOpenWaterL(L, [...L.obstacles, ...L.gateObstacles], st.x, st.z, E3.homeward.radius + 0.6), `mossmere Homeward stone must stand in open water`);
    else {
      const A = D.ARENA_V2[z], blocks = A.walk.blocks || (A.walk.blocks = []);
      blocks.push({ kind: 'disc', x: st.x, z: st.z, r: E3.homeward.radius, h: E3.homeward.block.h });
      const G = D.walkGridFor(z), M = WL.erode(G), dist = WL.walkDistances(G, D.ZONE_BY_ID[z], WL.footSeeds(G, D.ZONE_BY_ID[z], M), M);
      blocks.pop();
      let near4 = false; for (let k = 0; k < G.n * G.n; k++) if (M[k] && dist[k] < Infinity) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x - st.x, zz - st.z) <= E3.homeward.range) { near4 = true; break; } }
      ok(near4, `${z} Homeward stone: no walkable cell within ${E3.homeward.range} m once it stands`);
      { const G0 = D.walkGridFor(z), M0 = WL.erode(G0), d0 = WL.walkDistances(G0, D.ZONE_BY_ID[z], WL.footSeeds(G0, D.ZONE_BY_ID[z], M0), M0); let lost = 0;
        for (let k = 0; k < G.n * G.n; k++) if (d0[k] < Infinity && !(dist[k] < Infinity) && M[k]) lost++;
        ok(lost === 0, `${z} Homeward stone cuts ${lost} walkable cells off the rest of the lake`); }
    }
  }
  ok(E3.homeward.radius === 0.6 && E3.homeward.block.h > 1, 'Homeward stones: r 0.6 lantern-stones that block');
  ok(E3.firstOuting.zone === 'mossmere' && E3.firstOuting.character === 'wick' && E3.firstOuting.nightMode === 'still', 'the First Outing: the Mossmere, The Wick, every night still');
  ok(E3.snuffed.loses.join() === 'creel,marked' && !E3.snuffed.keeps.includes('creel') && E3.snuffed.keeps.includes('records') && E3.snuffed.keeps.includes('shells'), 'Snuffed: lose the creel and the marked fish, never a record or banked Shells');
  const LD = D.LONG_DESCENT;
  ok(LD.unlock.waystonesLit === 4 && LD.nightMode === 'gloomtide' && LD.purse.start === D.BALANCE.economy.startShells && LD.purse.separate && LD.tackle === 'UPGRADES' && !LD.persistentTackle && !LD.farWater, 'The Long Descent: all four Waystones; Gloomtide; its own 20-Shell purse; per-run UPGRADES; no Far Water');
  ok(D.BALANCE.phases.calm === 120 && D.BALANCE.phases.dawn === 8, 'today\'s phases stay in BALANCE.phases for The Long Descent');

  // ---- economy (brief §9)
  const EC = D.ECONOMY_V3;
  for (const [z, r] of Object.entries(EC.income)) {
    ok(within(r.eaten + r.marked + r.sold, r.landed, 1e-9) && within(r.sold * r.perFish, r.fish, 1) && r.fish + r.ledger === r.gross && r.gross - r.bait === r.net && within(r.net * EC.daysPerHour, r.netHour, 1),
      `income ${z}: landed/sold/fish/gross/net/hour arithmetic (brief §9.1)`);
  }
  const cost = (key) => {
    const [kind, a, b] = key.split(':');
    if (kind in D.TACKLE && D.TACKLE.slots.includes(kind)) return D.TACKLE[kind][+a].price;
    if (kind === 'outfit') return D.OUTFIT.find((o) => o.id === a).prices[+b - 1];
    if (kind === 'lure') return D.LURES.find((l) => l.id === a).price;
    if (kind === 'bait') return EC.legendBaits[a];
    if (kind === 'toll') return E3.gates.tolls[a];
    if (kind === 'pond') return EC.pond.tiers.find((t) => t.tier === +a).price;
    return NaN;
  };
  const netAt = (h) => { let s = EC.startShells; for (const z of LAKES) { const [a, b] = EC.spans[z]; s += EC.income[z].netHour * Math.max(0, Math.min(h, b) - a); } return s; };
  const coverAt = (need) => { let lo = 0, hi = 40; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (netAt(m) >= need) hi = m; else lo = m; } return hi; };
  ok(within(netAt(1.5), 1096, 1) && within(netAt(4.5), 4660, 1) && within(netAt(8.5), 10952, 1) && within(netAt(14), 22661, 1) && within(netAt(16), 26919, 1), 'cumulative net 1,096 / 4,660 / 10,952 / 22,661 / 26,919 at h1.5 / 4.5 / 8.5 / 14 / 16');
  let spend = 0, lastH = 0, worst = 0;
  // DESIGN §25.10.2 (automatic fishing: + the giants' lures and the expected legend attempts, 3 / 3 / 3 / 4 baits)
  const SPENDS = [430, 550, 770, 890, 1070, 1230, 1680, 2130, 2580, 2850, 3060, 3330, 3810, 3970, 4270, 4690, 5170, 6570, 7970, 8920, 9430, 10330, 11730, 12830, 16030, 17630, 18910, 22110, 25310, 25790, 28190, 29390, 30590, 32510];
  EC.timeline.forEach(([h, items], i) => {
    const c = items.reduce((a, k) => a + cost(k), 0); spend += c;
    ok(Number.isFinite(c), `timeline h${h}: unknown item in ${items}`);
    ok(spend === SPENDS[i], `timeline h${h}: cumulative spend ${spend} (brief ${SPENDS[i]})`);
    const at = coverAt(spend); worst = Math.max(worst, Math.abs(at - h));
    ok(h >= lastH && within(at, h, EC.tolerance), `timeline h${h}: income first covers ${spend} at h${at.toFixed(2)} (± ${EC.tolerance} h)`);
    lastH = h;
  });
  ok(spend === EC.mainSinks && within(coverAt(EC.mainSinks), EC.meetsAt, EC.tolerance), `income and the main sinks (${EC.mainSinks}) meet at h${coverAt(EC.mainSinks).toFixed(2)} (≈ h${EC.meetsAt})`);
  { const lh = (b) => EC.timeline.filter(([, it]) => it.includes(`bait:${b}`)).flatMap(([, it]) => it.filter((k) => k === `bait:${b}`)).length;
    ok(lh('heartmoss') === 3 && lh('glowcap_bulb') === 3 && lh('prism_moth') === 3 && lh('last_candle') === 4, 'the timeline buys the expected legend attempts: 3 / 3 / 3 / 4 baits (CATCH_V3 wounds; tools/sim/catch-v3.mjs)'); }
  // gates along the timeline: tiers on sale only after their Waystone, legend baits before their gate opens
  const tollH = Object.fromEntries(EC.timeline.flatMap(([h, it]) => it.filter((k) => k.startsWith('toll:')).map((k) => [k.split(':')[1], h])));
  for (const [h, items] of EC.timeline) for (const k of items) {
    const [kind, a, b] = k.split(':');
    const sale = D.TACKLE.slots.includes(kind) ? D.TACKLE[kind][+a].onSale : kind === 'outfit' ? D.OUTFIT.find((o) => o.id === a).onSale : kind === 'lure' ? D.LURES.find((l) => l.id === a).onSale : kind === 'pond' && +a === 3 ? 'glasswater' : 'start';
    if (sale !== 'start') ok(h > tollH[sale], `timeline h${h}: ${k} is on sale only once ${sale} is lit (toll at h${tollH[sale]})`);
  }
  ok(EC.pond.tiers.map((t) => t.price).join() === '300,1200' && EC.pond.tiers.map((t) => t.slots).join() === '5,6' && EC.pond.tier1.slots === 3 && EC.pond.maxLength === 1.4, 'keep-pond: 3 → 5 (300) → 6 (1,200); fish ≤ 1.4 m');
  ok(EC.welcomePurse === 200 && D.RENAMES.welcomePurse === 200 && D.BALANCE.economy.welcomePurse === 200, 'the 200-Shell welcome purse on migration');
  ok(EC.modeMult.still === 1.03 && EC.modeMult.gloomtide === 0.92, 'mode income: Still +3%, Gloomtide −8%');

  // ---- Memories, relics, Boons, Wicks (brief §9.4, §4.4, §4.5)
  const M3 = D.MEMORIES_V3, chSum = (f) => D.CHALLENGES.filter(f).reduce((a, c) => a + c.reward.memories, 0);
  ok(chSum((c) => c.tier <= 3) === M3.challenges.v1 && chSum((c) => c.tier === 4) === M3.challenges.tier4 && chSum((c) => c.tier === 5) === M3.challenges.tier5 && chSum(() => true) === M3.challenges.total, `challenge Memories ${chSum((c) => c.tier <= 3)} + ${chSum((c) => c.tier === 4)} + ${chSum((c) => c.tier === 5)} = ${chSum(() => true)} (brief 831 + 185 + 155 = 1,170)`);
  const n48 = B3.records.seals.species, nPlaces = D.PLACES_V3.filter((p) => !p.secret).length;
  const sumSeals = (tab) => S.reduce((a, s) => a + D.sealsFor(s).reduce((x, c) => x + tab[c], 0), 0);
  const parts = { challenges: M3.challenges.total, species: S.length * M3.newSpecies, classFirsts: sumSeals(M3.classFirst),
    firstMounts: sumSeals(M3.firstMount), firstReleases: sumSeals(M3.firstRelease),
    places: nPlaces * (M3.place.found + M3.place.mastered), rumours: D.RUMOURS.length * M3.rumourSolved, oldLedger: n48 * M3.oldLedger, legends: 4 * M3.legend.first, ancients: 4 * M3.firstAncientPerLake };
  for (const [k, v] of Object.entries(parts)) ok(v === M3.pool.parts[k], `Memories pool ${k}: ${v} (brief ${M3.pool.parts[k]})`);
  const pool = Object.values(parts).reduce((a, b) => a + b, 0);
  ok(within(pool, M3.pool.total, M3.pool.total * 0.01), `one-time Memories pool ${pool} (brief ≈ ${M3.pool.total})`);
  ok(M3.perHour.midGame.still / M3.perHour.midGame.lantern >= 1 - M3.perHour.stillWithin, 'Still Memories/h within 15% of Lantern');
  ok(JSON.stringify(EXP_TALLY_CHECK()) === '[24,18]', 'mid-game tally per expedition (24 Lantern / 18 Still)');
  function EXP_TALLY_CHECK() { return [D.tallyFor({ dawns: 4, stillNights: 2, swarmNights: 2, ledger: 1 }).total, D.tallyFor({ dawns: 4, stillNights: 4, ledger: 1 }).total]; }
  const shelf = (s) => D.RELICS.filter((r) => r.shelf === s);
  const lv = (s) => shelf(s).reduce((a, r) => a + r.maxLevel, 0), baseCost = (s) => shelf(s).reduce((a, r) => a + r.baseCosts.reduce((x, y) => x + y, 0), 0), nowCost = (s) => shelf(s).reduce((a, r) => a + r.costs.reduce((x, y) => x + y, 0), 0);
  ok(lv('fishing') === M3.shelves.fishing.levels && baseCost('fishing') === M3.shelves.fishing.base && within(nowCost('fishing'), M3.shelves.fishing.base * M3.shelves.fishing.costMult, 60),
    `Fishing & Exploration shelf: ${lv('fishing')} levels, ${baseCost('fishing')} → ${nowCost('fishing')} (brief 46, 8,800 → ≈ 4,840)`);
  ok(lv('gloom') === M3.shelves.gloom.levels && baseCost('gloom') === M3.shelves.gloom.base && within(nowCost('gloom'), M3.shelves.gloom.base * M3.shelves.gloom.costMult, 30),
    `Gloom shelf: ${lv('gloom')} levels, ${baseCost('gloom')} → ${nowCost('gloom')} (brief 14, 3,125 → ≈ 2,190)`);
  ok(lv('fishing') + lv('gloom') === 60, 'the Shrine shows ≈ 60 drowned lanterns (total relic levels, read from data)');
  ok(M3.cut.every((id) => !D.RELIC_BY_ID[id] && V1.RELIC_BY_ID[id]) && Object.keys(D.RELIC_BY_ID.seven_knots.effects).length === 0 && D.CATCH_V3.buffs.relics.seven_knots.perLevel === 1, 'Waystone relics and Murk\'s Old Debt cut; Seven Knots gives Hold (CATCH_V3.buffs), no line strength');
  ok(D.ANGLER_POOL.length === 15 && D.ANGLER_POOL.every((id) => D.BOON_BY_ID[id]?.tags.includes('angler')), 'the Angler pool: 9 existing + 6 new Boons, all tagged');
  for (const b of D.BOONS_V3) ok(!Object.keys(b.effects).includes('favour') && !b.opens, `Angler Boon ${b.id}: no Boon adds favour or opens a place`);
  for (const c of D.CHARACTERS) ok(isObj(c.fishing) && isStr(c.fishing.name) && isStr(c.fishing.desc), `Wick ${c.id} needs a fishing half (brief §4.5)`);

  // ---- challenges (brief §11)
  const CH = D.CHALLENGE_BY_ID;
  ok(D.CHALLENGES.every((c) => c.scope !== 'run') && D.CHALLENGES.filter((c) => c.tier === 5).length === 8, 'no "run" scope left; 8 tier V challenges');
  ok(JSON.stringify(D.CHALLENGES.filter((c) => c.tier === 5).map((c) => c.reward.memories)) === '[5,10,20,15,30,40,20,15]', 'tier V rewards +5 / +10 / +20 / +15 / +30 / +40 / +20 / +15');
  ok(CH.first_prize.reward.unlock === 'relic:measuring_cord' && CH.ten_trophies.reward.unlock === 'relic:rumour_shell' && CH.old_ledger_five.reward.unlock === 'relic:murks_spyglass', 'tier V reveals the Measuring Cord, the Rumour Shell and Murk\'s Spyglass');
  ok(CH.heavy_catch.params.lb === 33 && !('kg' in CH.heavy_catch.params) && /over 33 lb 0 oz\.$/.test(CH.heavy_catch.desc) && CH.complete_chronicle.params.n === 53 && CH.every_still_place.params.n === 21 && CH.light_comes_up.params.id === 'lantern_swallower'
    && CH.many_flames.params.class === 'trophy' && CH.unwarded.alt?.params?.n === 3 && CH.kindle_one.alt?.params?.pool === 'angler' && CH.down_the_sluice.type === 'lightWaystone' && CH.the_long_way_round.scope === 'total', 'challenge rewrites (brief §11)');
  ok(CH.long_vigil.reward.unlock === 'character:tallow' && CH.long_vigil.type === 'nightsOut' && CH.unwarded.reward.unlock === 'character:ashwick', 'either-path Wick unlocks keep their challenges');
  const TYPES = new Set(['catch', 'nights', 'nightsOut', 'level', 'slayElite', 'journal', 'slay', 'boss', 'lightWaystone', 'reachZone', 'nightNoDamage', 'slayNight', 'boonLevel', 'nightCatch', 'perfectHooks', 'quality', 'weight',
    'shells', 'kindle', 'bossDistinct', 'classZoneCharacters', 'catchSpecies', 'victory', 'footAshore', 'placeFound', 'lampLit', 'placeSpecies', 'placeMastered', 'shortcutOpen', 'slayOnTag', 'nightNoLamp', 'lampLitZone',
    'classCatch', 'lakeSet', 'elderEveryLake', 'oldLedger', 'markedHome', 'nightSpeciesClass']);
  for (const c of D.CHALLENGES) { ok(TYPES.has(c.type) && (!c.alt || TYPES.has(c.alt.type)), `challenge ${c.id} type ${c.type}`); ok(Object.keys(D.CHALLENGE_TABS_V3).includes(c.tab), `challenge ${c.id} tab ${c.tab}`); }
  ok(D.LEDGER.slots === 3 && D.LEDGER.templates.filter((t) => t.modes).every((t) => t.modes.every((m) => m !== 'still')), 'Murk\'s Ledger: 3 slots; combat requests only in combat modes');

  // ---- places (brief §7): the Mossmere's 8 + 1, the §24 sync, giants and residents
  const PV = D.PLACES_V3, real = PV.filter((p) => !p.secret);
  ok(real.length === 29 && PV.filter((p) => p.secret).length === 1 && D.WALK_SYNC_V3.secrets.length === 3 && new Set(PV.map((p) => p.id)).size === PV.length, '29 places (+ 4 secrets: the Moon Cistern and three §24 proposals)');
  ok(D.MOSSMERE_V3.places.filter((p) => !p.secret).length === 8 && D.MOSSMERE_V3.places.every((p) => p.access === 'raft'), 'the Mossmere: 8 raft places + 1 secret');
  ok(Object.keys(D.PLACE_SYNC_V3).length === 21 && Object.keys(D.PLACE_SYNC_V3).every((id) => D.PLACE_BY_ID[id]), 'PLACE_SYNC_V3 covers §24\'s 21 places by id');
  const RULES3 = ['rhythm', 'sequence', 'deed', 'targets', 'moving', 'drifters', 'cue', 'plumb', 'reflection', 'phaseWindow', 'sight', 'drift'];
  for (const z of LAKES) {
    const zp = real.filter((p) => p.zone === z);
    const giants = zp.filter((p) => p.holdsGiants).map((p) => p.id);
    ok(giants.length === B3.placesV3.giantsPerLake, `${z}: exactly 3 holdsGiants places (got ${giants.join(', ')})`);
    ok(zp.filter((p) => p.legend).length === 1, `${z}: one legend place`);
    ok(zp.every((p) => !p.ownResident || p.holdsGiants), `${z}: residents only at holdsGiants places`);
    for (const p of zp) {
      ok(!p.rule || RULES3.includes(p.rule.type), `place ${p.id} rule type ${p.rule?.type}`);
      if (p.rule?.type === 'rhythm') ok(p.rule.period > p.rule.warn + p.rule.live && (!p.rule.periodDrip || p.rule.periodDrip > p.rule.warn + p.rule.live), `place ${p.id} rhythm period > warn + live`);
      if (p.maxClass) ok(p.maxClass in SZ.classMaxZ, `place ${p.id} maxClass ${p.maxClass}`);
      if (p.holdsGiants) ok(!p.maxClass || p.maxClass === 'elder', `place ${p.id} holds giants but caps below Elder`);
      // every place yields a no-bait species at its depth (calm, or at night for night places)
      const night = p.night || p.rule?.phases?.includes('gloomtide');
      const yields = S.filter((s) => s.zone === z && s.rarity !== 'legendary' && !s.bait && (!s.place || s.place === p.id) && (night || s.time !== 'gloom') && s.depth[0] <= p.water.depth[1] && p.water.depth[0] <= s.depth[1]);
      ok(yields.length >= 1, `place ${p.id} yields no bait-free species at its depth ${p.water.depth}${night ? ' at night' : ' in calm'}`);
      for (const sid of Object.keys(p.attract || {})) ok(byId[sid]?.zone === z, `place ${p.id} attracts ${sid}, not a ${z} species`);
    }
  }
  ok(['puffball_vent', 'votive_font'].every((id) => D.PLACE_V3_BY_ID[id].maxClass === 'prize'), 'fry water (the Puffball Vent, the Votive Font) caps at Prize');
  ok(D.PLACE_V3_BY_ID.lullaby.rule?.type === 'sight' && D.PLACE_V3_BY_ID.chain_garden.turnFavour === 0.6 && D.PLACE_V3_BY_ID.stilled_cascade.thaw?.time === 40, '§24 sync: the Lullaby becomes sight; the Chain Garden\'s Turn +0.6; the Stilled Cascade thaws 40 s in Shard-chime');
  ok(D.ARENA_V2.sporewood.places.find((p) => p.id === 'lullaby').rule?.type === 'sight' && W2.ARENA_V2.sporewood.places.find((p) => p.id === 'lullaby').rule === null, 'the sync is applied only in the v3 build');
  ok(D.ARENA_V2.paleabyss.lamps.find((l) => l.id === 'landing_lamp').name === 'Shore of Last Rafts' && W2.ARENA_V2.paleabyss.lamps.find((l) => l.id === 'landing_lamp').name === 'Landing of Last Rafts', '"Landing of Last Rafts" becomes "Shore of Last Rafts" in the v3 build only');
  // the Mossmere places on the arena: inside the lake, raft-reachable and castable (the walk / arena geometry helpers)
  const mz = D.ZONES[0], GM = D.walkGridFor(mz), RM = WL.raftMask(GM), RC = WL.component(GM, RM, GM.idx(mz.arena.spawn.x, mz.arena.spawn.z));
  ok(RC[GM.idx(mz.arena.spawn.x, mz.arena.spawn.z)] === 1, 'the Mossmere spawn is open raft water');
  const raftCells = []; for (let k = 0; k < GM.n * GM.n; k++) if (RC[k]) raftCells.push(WL.cellXZ(GM, k));
  const castMax0 = D.TACKLE.rod[0].castMax, minD = D.BALANCE.cast.minDist;
  for (const p of D.MOSSMERE_V3.places) {
    if (p.secret) { ok(Math.hypot(p.x, p.z) < mz.arena.radius + 8 && !!p.needs?.shoreNotch, `secret ${p.id} sits behind the shore and needs a shoreNotch`); continue; }
    const pts = []; const [x0, z0, x1, z1] = D.walkShapeBounds(p.water);
    for (let zz = z0; zz <= z1; zz += 0.5) for (let x = x0; x <= x1; x += 0.5) if (D.placeContains(p, x, zz) && Math.hypot(x, zz) < mz.arena.radius - 2) pts.push([x, zz]);
    const water = pts.filter(([x, zz]) => WL.isLakeWater(GM, GM.idx(x, zz)));
    const targets = p.dropIn ? pts : water;
    ok(pts.length > 0 && Math.hypot(p.x, p.z) < mz.arena.radius - 4, `Mossmere place ${p.id} must lie inside the lake`);
    ok(p.dropIn || water.length >= 4, `Mossmere place ${p.id} has only ${water.length} open water cells`);
    let castable = 0; for (const [x, zz] of targets) if (raftCells.some(([rx, rz]) => { const d = Math.hypot(rx - x, rz - zz); return d >= minD && d <= castMax0; })) castable++;
    ok(castable >= Math.min(3, targets.length), `Mossmere place ${p.id}: ${castable} cells castable from raft-reachable water on starter tackle (castMax ${castMax0})`);
    for (const t of p.rule?.targets || []) {
      const c = t.kind === 'rect' ? [t.x, t.z] : [t.x, t.z];
      ok(D.placeContains(p, c[0], c[1]), `Mossmere place ${p.id} target ${t.id} outside the place`);
      ok(p.dropIn || WL.isLakeWater(GM, GM.idx(c[0], c[1])), `Mossmere place ${p.id} target ${t.id} is not open water`);
      ok(raftCells.some(([rx, rz]) => { const d = Math.hypot(rx - c[0], rz - c[1]); return d >= minD && d <= castMax0; }), `Mossmere place ${p.id} target ${t.id} out of cast reach from the raft`);
    }
  }
  const realM = D.MOSSMERE_V3.places.filter((p) => !p.secret);
  for (let i = 0; i < realM.length; i++) for (let j = i + 1; j < realM.length; j++) {
    const a = realM[i], b = realM[j]; let overlap = false; const [x0, z0, x1, z1] = D.walkShapeBounds(a.water);
    for (let zz = z0; zz <= z1 && !overlap; zz += 0.5) for (let x = x0; x <= x1 && !overlap; x += 0.5) if (D.placeContains(a, x, zz) && D.placeContains(b, x, zz)) overlap = true;
    ok(!overlap || a.legend || b.legend, `Mossmere places ${a.id} and ${b.id} overlap`);
  }
  ok(near(D.MOSSMERE_V3.places.find((p) => p.id === 'cupped_hands'), D.MOSSMERE_V3.props[0]) < 0.01 && D.ZONES[0].arena.pillars.some((o) => o.kind === 'hands'), 'the Cupped Hands stand in the water as a new obstacle (v3 build)');
  ok(D.MOSSMERE_V3.places.find((p) => p.id === 'cupped_hands').rule.periodDrip === D.CONDITIONS.looks.mossmere.drip.aqueduct, 'in Drizzle the aqueduct coughs every 25 s');
  ok(D.ZONES[0].palette.accent === 0x8a4b3a && V1.ZONES[0].palette.accent !== 0x8a4b3a, 'the Mossmere leads with rust iron (v3 build only)');
  // names: brief names that echo §24 head nouns (warned, never renamed: the brief is the source of truth)
  const headN = (name) => { let s = String(name).replace(/\(.*?\)/g, '').trim(); const of = s.match(/^(.*?)\s+of\s+/i); if (of) s = of[1]; const w = s.split(/[\s-]+/).filter((x) => x && !/^(the|of|a|an|from|for|and|to|in|at|under)$/i.test(x)); return (w[w.length - 1] || '').replace(/['’]s$/, '').toLowerCase(); };
  const otherNouns = new Map();
  for (const z of D.ZONES.slice(1)) { const A = z.arena; for (const n2 of [...(A.walk?.shapes || []), ...(A.places || []), ...(A.lamps || []), ...(A.shortcuts || []), ...(A.deeds || []), ...(A.moorings || [])].map((x) => x.name).filter(Boolean)) otherNouns.set(headN(n2), `${z.id} "${n2}"`); }
  for (const p of D.MOSSMERE_V3.places) for (const nm of [p.name, p.rule?.name].filter(Boolean)) warn(!otherNouns.has(headN(nm)), `name: the Mossmere's "${nm}" shares the head noun '${headN(nm)}' with ${otherNouns.get(headN(nm))} (brief name kept)`);

  // ---- P4: Found Relics, age marks, Vistas, Remnants (brief §7.7, §6.4)
  const secretIds = [...D.MOSSMERE_V3.places.filter((p) => p.secret).map((p) => p.id), ...D.WALK_SYNC_V3.secrets.map((x) => x.id)];
  const rewards = [...D.MOSSMERE_V3.places.filter((p) => p.secret).map((p) => p.reward), ...D.WALK_SYNC_V3.secrets.map((x) => x.reward)];
  ok(D.FOUND_RELICS.length === 4 && D.FOUND_RELICS.every((r) => secretIds.includes(r.foundIn) && rewards.includes(r.id) && r.phase === 4), 'four Found Relics, one from each secret');
  ok(D.WALK_SYNC_V3.secrets.every((x) => D.FOUND_RELICS.some((r) => r.id === x.needs)) && D.FOUND_RELICS.find((r) => r.id === 'deep_line').underdepth.favour === 0.8, 'each secret needs the previous Found Relic; the Deep Line opens the Underdepth (+0.8)');
  ok(Object.keys(D.AGE_MARKS).length === 10 && Object.keys(D.AGE_MARKS).every((id) => byId[id] && byId[id].rarity !== 'legendary'), 'age marks on 10 headline species');
  ok(D.VISTAS.perLake === 2 && D.VISTAS.hold === 1.5 && D.VISTAS.sit === false && D.VISTAS.sketch === false && D.REMNANTS.total === D.REMNANTS.perLake * 4, 'Vistas: 2 per lake, raise the lantern 1.5 s, no sitting or sketching; 12 Remnants');

  // ---- conditions, rumours (brief §7.0–§7.1)
  ok(Object.values(D.CONDITIONS.odds).reduce((a, b) => a + b, 0) === 100 && D.CONDITIONS.odds.none === 40, 'conditions: none 40 · Hush 20 · Drip 20 · Mist 20');
  for (const z of LAKES) ok(D.WEATHER.every((w) => isStr(D.CONDITIONS.looks[z]?.[w]?.name)), `${z}: a look for every archetype`);
  ok(D.CONDITIONS.archetypes.hush.favour === FV.hour.hush && D.CONDITIONS.movesGeometry === false, 'Hush favour = the Hour term; no geometry-moving weather');
  ok(D.RUMOURS.length === 24 && new Set(D.RUMOURS.map((r) => r.id)).size === 24 && LAKES.every((z) => D.RUMOURS.filter((r) => r.zone === z).length === 6), '24 rumours, 6 per lake');
  for (const r of D.RUMOURS) {
    ok(Array.isArray(r.tiers) && r.tiers.length === 3 && r.tiers.every((t) => isStr(t) && t.length <= 120), `rumour ${r.id}: three tiers (vague → place → condition), ≤ 120 chars`);
    if (r.place) ok(D.PLACE_V3_BY_ID[r.place]?.zone === r.zone, `rumour ${r.id} place ${r.place}`);
    if (r.species) ok(byId[r.species]?.zone === r.zone, `rumour ${r.id} species ${r.species}`);
    if (r.secret) ok(D.WALK_SYNC_V3.secrets.some((s) => s.id === r.secret && s.zone === r.zone), `rumour ${r.id} secret ${r.secret}`);
    ok(!!(r.place || r.secret), `rumour ${r.id} points nowhere`);
  }
  for (const s of S.filter((x) => x.place)) ok(D.RUMOURS.some((r) => r.species === s.id), `kept species ${s.id} needs a rumour`);
  ok(D.TODAYS_RUMOUR.giantsOnly && D.TODAYS_RUMOUR.favour === FV.match.rumour, 'today\'s rumour names a giant place, favour +0.3');

  // ---- the Landing (brief §3.7)
  const C = D.COVE, CA = C.arena;
  ok(!D.ZONE_BY_ID.cove && !D.ZONES.some((z) => z.id === 'cove') && C.id === 'cove' && C.hub === true, 'COVE is not in ZONES / ZONE_BY_ID');
  const SN = CA.shoreNotch[0], legX = C.seaGate.legs.map((l) => l.x), archX = (legX[0] + legX[1]) / 2;
  ok(CA.radius === 42 && CA.seed === 7707 && CA.layout === 'cove' && CA.shoreNotch.length === 1 && isNum(SN.a) && isNum(SN.w) && isNum(SN.depth) && isNum(SN.len), 'the cove: R 42, seed 7707, one shoreNotch {a, w, depth, len}');
  ok(Math.abs(CA.radius * Math.cos(SN.a * Math.PI / 180) - archX) <= 0.5 && Math.sin(SN.a * Math.PI / 180) < -0.95, `the channel notch (a ${SN.a}°) lines up with the arch centre x ${archX} (x at R = ${(CA.radius * Math.cos(SN.a * Math.PI / 180)).toFixed(1)})`);
  ok(C.theme === 'cove' && C.index === -1, 'COVE carries theme "cove" (no Mossmere set-pieces by index fallback)');
  for (const k of [...PALETTE_KEYS, 'lamp']) ok(k in C.palette, `COVE.palette.${k}`);
  for (const [k, v] of Object.entries(C.palette)) if (k !== 'fogDensity') palCheck(`COVE.palette.${k}`, v);
  for (const k of Object.keys(D.ZONES[0].grade)) ok(k in C.grade, `COVE.grade.${k}`);
  for (const w of C.waystones) { palCheck(`COVE.waystones.${w.zone}`, w.colour); ok(LAKES.includes(w.zone), `waystone ${w.zone}`); }
  ok(JSON.stringify(C.waystones.map((w) => w.colour)) === JSON.stringify([0xb0603e, 0xffb46a, 0x5cbcff, 0xe8c66a]) && C.waystones.filter((w) => w.litAtStart).length === 1, 'Waystone colours rust / amber / sapphire / ember-gold; the Mossmere\'s lit from the start');
  const sum = (o) => Object.entries(o).filter(([k]) => !['total', 'cap'].includes(k)).reduce((a, [, v]) => a + v, 0);
  ok(sum(C.budget.high) === C.budget.high.total && C.budget.high.total <= C.budget.high.cap && sum(C.budget.low) === C.budget.low.total && C.budget.low.total <= C.budget.low.cap, `cove draw calls ${sum(C.budget.high)} / ${sum(C.budget.low)} (budget 140 / 100)`);
  ok(C.lights.max <= 4 && C.lights.list.length <= 4, '≤ 4 PointLights at the Landing');
  // walk layout: §24's rules on COVE.walk (reachability, enclosure, paths, 14 m south clearance)
  for (const sh of CA.walk.shapes) {
    if (sh.kind === 'path') {
      ok(sh.w >= 2.4 - 1e-9, `COVE walkway ${sh.id} narrower than 2.4 m`);
      for (let i = 0; i + 1 < sh.pts.length; i++) { const [ax, az, ay = sh.y ?? 0] = sh.pts[i], [bx, bz, by = sh.y ?? 0] = sh.pts[i + 1]; ok(Math.abs(by - ay) / Math.hypot(bx - ax, bz - az) <= D.BALANCE.walk.maxSlope + 1e-9, `COVE ramp ${sh.id} steeper than ${D.BALANCE.walk.maxSlope}`); }
    }
    const [x0, z0, x1, z1] = sh.kind === 'rect' && !sh.yaw ? [sh.x - sh.w / 2, sh.z - sh.d / 2, sh.x + sh.w / 2, sh.z + sh.d / 2] : D.walkShapeBounds(sh);
    ok(Math.max(Math.hypot(x0, z0), Math.hypot(x1, z0), Math.hypot(x0, z1), Math.hypot(x1, z1)) <= CA.radius - 1, `COVE shape ${sh.id} reaches the cliff`);
  }
  for (const openK of [false, true]) {
    const G = D.walkGridFor(C, { open: openK ? { cove_stair: true } : {} }), M = WL.erode(G);
    const seed = WL.snap(G, M, CA.spawn.x, CA.spawn.z, 1.5), dist = WL.walkDistances(G, C, [seed], M);
    const reach = (p, r = 0.8) => { const k = WL.snap(G, M, p.x, p.z, r); return k >= 0 ? dist[k] : Infinity; };
    const label = `COVE [stair ${openK ? 'open' : 'silted'}]`;
    ok(seed >= 0, `${label}: the hearth spawn fits the Wick`);
    for (const st of C.stations) {
      if (st.needs === 'cove_stair' && !openK) continue;
      if (st.id === 'murk') { let best = Infinity; for (let k = 0; k < G.n * G.n; k++) if (M[k] && dist[k] < Infinity) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x - st.x, zz - st.z) <= st.range - 0.5) best = Math.min(best, dist[k]); } ok(best < Infinity, `${label}: no walkway within trade range of Murk's barge`); continue; }
      if (st.id === 'raft') { const m = CA.moorings[0]; ok(reach(m.stand) < Infinity && near(m.stand, m.slot) - D.BALANCE.move.raftRadius <= D.BALANCE.walk.board.range, `${label}: the raft mooring`); continue; }
      const d = reach(st, st.id === 'pond' ? CA.walk.holes[0].r + 1.2 : D.BALANCE.walk.interactRange + 0.4);
      ok(d < Infinity, `${label}: station ${st.id} unreachable`);
      if (!openK) ok(d <= 30, `${label}: station ${st.id} is ${d.toFixed(1)} m from the hearth (every station within ≈ 5 s at ${C.walkSpeed} m/s)`);
    }
    const gal = reach({ x: -20, z: -10 }), up = reach({ x: -20, z: -18.5 });
    ok(gal < Infinity, `${label}: the Lower Gallery is reachable (ramp)`);
    ok(openK ? up < Infinity : up === Infinity, `${label}: the Upper Gallery is ${openK ? 'reachable once the stair is dug out' : 'closed while the stair is silted'}`);
    // the lower and upper walls are viewable from their galleries
    ok(reach({ x: -24, z: -13.5 }) < Infinity && (!openK || reach({ x: -12, z: -20.5 }) < Infinity), `${label}: the walls are reachable from their galleries`);
    if (!openK) {
      let leaks = 0, cliff = 0, tall = 0; const F2 = D.WALK_FLAGS, n = G.n, O = C.lowSouth;
      for (let k = 0; k < n * n; k++) {
        if (G.flags[k] & F2.POOL) { const i = k % n, j = (k / n) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (G.flags[(j + dj) * n + i + di] & F2.WATER && !(G.flags[(j + dj) * n + i + di] & F2.GROUND)) leaks++; }
        if (!WL.isWalk(G, k) || !(dist[k] < Infinity)) continue;
        const [x, zz] = WL.cellXZ(G, k), y = G.top[k];
        for (let dzz = 0.5; dzz <= O.dist; dzz += 1) for (let dx = -O.halfW; dx <= O.halfW; dx += 1) {
          const q = G.idx(x + dx, zz + dzz); if (q < 0 || (G.flags[q] & F2.VOID)) { cliff++; continue; }
          if ((G.flags[q] & F2.GROUND) && G.top[q] > y + O.max + 1e-6) tall++;
        }
      }
      ok(leaks === 0, `COVE: the keep-pond is enclosed (${leaks} pool cells touch open water)`);
      ok(cliff === 0, `COVE: ${cliff} samples within ${O.dist} m south of a walkway hit the cliff (the portrait camera must stay inside the ring)`);
      ok(tall === 0, `COVE: ${tall} samples within ${O.dist} m south of a walkway rise > ${O.max} m above it`);
      const pond = CA.walk.holes[0];
      ok(near(pond, C.stations.find((s) => s.id === 'pond')) < 0.01 && pond.depth === 0.7 && pond.r === 2.8 && pond.rTier3 === 4.0, 'the keep-pond: centre (−16, 3.5), r 2.8 (4.0 at tier 3), depth 0.7');
    }
  }
  // the Long Wall: one frame per non-legendary species; every wing packs into 12 × 3.6 m as three rows, largest lowest
  for (const z of LAKES) {
    const sp = S.filter((s) => s.zone === z && s.rarity !== 'legendary');
    const fr = sp.map((s) => ({ id: s.id, ...D.frameFor(s) }));
    const boards = fr.filter((f) => f.id === 'board'), frames = [...fr.filter((f) => f.id !== 'board').map((f) => f.width), ...Array.from({ length: Math.ceil(boards.length / 4) }, () => C.frames[0].width)];
    ok(fr.every((f) => f.id !== 'great' || z === 'paleabyss'), `${z}: great arches only in the Pallid wing`);
    for (const f of fr.filter((x) => x.id !== 'board')) { const t = C.frames.find((c) => c.id === f.id); ok(f.width >= t.widthRange[0] - 0.01 && f.width <= t.widthRange[1] + 0.01, `frame ${f.id} for ${f.id === 'great' ? 'a great arch' : f.id}: ${f.width} m outside ${t.widthRange}`); }
    const W = C.wings[z].x[1] - C.wings[z].x[0];
    const items = [...fr.filter((f) => f.id !== 'board').map((f) => ({ w: f.width, h: f.height })), ...Array.from({ length: Math.ceil(boards.length / 4) }, () => ({ w: C.frames[0].width, h: C.frames[0].height }))];
    const rows = [0, 0, 0], counts = [0, 0, 0], heights = [0, 0, 0];
    for (const it of items.sort((a, b) => b.w - a.w)) { let placed = false; for (let r = 0; r < C.wing.rows && !placed; r++) { const need = rows[r] + (counts[r] ? C.wing.gap : 0) + it.w; if (need <= W + 1e-6) { rows[r] = need; counts[r]++; heights[r] = Math.max(heights[r], it.h); placed = true; } } ok(placed, `${z} wing: a ${it.w.toFixed(2)} m frame does not fit in 3 rows of ${W} m`); }
    const hSum = heights.reduce((a, b) => a + b, 0) + (C.wing.rows - 1) * C.wing.rowGap;
    ok(hSum <= C.wing.h + 1e-6, `${z} wing: rows ${heights.map((h) => h.toFixed(2)).join(' / ')} m tall need ${hSum.toFixed(2)} m (≤ ${C.wing.h})`);
    ok(fr.every((f) => isNum(f.height) && f.height > 0 && ['side', 'dorsal', 'hanging'].includes(f.view)), `${z}: every frame has a height and a mount view`);
  }
  ok(within(D.frameFor(byId.gilt_eyed_eel).width + D.frameFor(byId.candlewake_sturgeon).width + D.frameFor(byId.wax_bearer).width + 2 * C.wing.gap, 12.0, 0.05), 'the widest row: the Pallid\'s three great arches at 12.0 m');
  ok(JSON.stringify(C.walls.chimney.wanderers) === '["pilgrim_salmon","hearthfish"]', 'the two Wanderers hang on the chimney breast');
  { const ch = C.walls.chimney, cw = ch.x[1] - ch.x[0], wf = ch.wanderers.map((id) => D.frameFor(byId[id]));
    ok(cw >= 3 - 1e-9 && ch.wall === 'lower' && ch.x[0] <= C.stations.find((x) => x.id === 'hearth').x && ch.x[1] >= C.stations.find((x) => x.id === 'hearth').x, `the chimney breast is ${cw} m of the lower wall behind the hearth (≥ 3 m)`);
    ok(wf.every((f) => f.width <= cw + 1e-9) && wf.reduce((a, f) => a + f.height, 0) + C.wing.rowGap <= C.wing.h, `both Wanderer frames fit the chimney breast stacked (${wf.map((f) => `${f.width}×${f.height}`).join(', ')} m)`);
    ok(within(D.frameFor(byId.pilgrim_salmon).reach, D.reachOf(byId.pilgrim_salmon, 'paleabyss') / 100, 0.01), 'Wanderer frames size from their largest reach (the Pilgrim Salmon\'s Pallid 206 cm)');
    const wl = Object.values(C.wings).filter((w) => w.wall === 'lower').map((w) => w.x).concat([ch.x]).sort((a, b) => a[0] - b[0]);
    ok(wl.every((x, i) => i === 0 || within(x[0], wl[i - 1][1], 1e-9)) && within(wl[0][0], C.walls.lower.x[0], 1e-9) && within(wl[wl.length - 1][1], C.walls.lower.x[1], 1e-9), 'the lower wall is exactly Mossmere wing + chimney breast + Sporewood wing'); }
  ok(within(C.walkSpeed, D.BALANCE.walk.speedMult * D.STATS.moveSpeed.base, 0.01), `COVE.walkSpeed ${C.walkSpeed} must be §24's foot speed (${(D.BALANCE.walk.speedMult * D.STATS.moveSpeed.base).toFixed(2)} m/s)`);

  // ---- save migration (brief Pg3)
  const RN = D.RENAMES;
  for (const [a, b] of Object.entries(RN.species)) ok(V1.SPECIES_BY_ID[a] && D.SPECIES_BY_ID[b] && !D.SPECIES_BY_ID[a], `rename species ${a} → ${b}`);
  for (const [a, b] of Object.entries(RN.baits)) ok(V1.BAIT_BY_ID[a] && D.BAIT_BY_ID[b] && !D.BAIT_BY_ID[a] && D.SPECIES_BY_ID.lantern_swallower.bait === b, `rename bait ${a} → ${b}`);
  for (const [a, b] of Object.entries(RN.supplies)) ok(V1.SUPPLY_BY_ID[a] && D.SUPPLY_BY_ID[b] && !D.SUPPLY_BY_ID[a], `rename supply ${a} → ${b}`);
  for (const id of RN.relicsRefunded) ok(V1.RELIC_BY_ID[id] && !D.RELIC_BY_ID[id], `refunded relic ${id}`);
  for (const r of [...V1.RELICS, ...V1.WALK_RELICS]) ok(D.RELIC_BY_ID[r.id] || RN.relicsRefunded.includes(r.id), `relic ${r.id} neither kept nor refunded`);
  for (const s of [...V1.SPECIES, ...V1.WALK_SPECIES]) ok(D.SPECIES_BY_ID[s.id] || RN.species[s.id], `species ${s.id} neither kept nor renamed (saves would lose it)`);
  for (const b of V1.BAITS) ok(D.BAIT_BY_ID[b.id] || RN.baits[b.id], `bait ${b.id} neither kept nor renamed`);
  for (const s of V1.SUPPLIES) ok(D.SUPPLY_BY_ID[s.id] || RN.supplies[s.id], `supply ${s.id} neither kept nor renamed`);
  for (const c of [...V1.CHALLENGES, ...V1.WALK_CHALLENGES]) ok(!!D.CHALLENGE_BY_ID[c.id], `challenge ${c.id} lost (saves keep challenges by id)`);
  for (const c of [...V1.CHARACTERS, ...V1.WALK_CHARACTERS]) ok(!!D.CHARACTER_BY_ID[c.id], `Wick ${c.id} lost`);
  const upMap = [RN.upgradesToOutfit, RN.upgradesToTackle, RN.upgradesToLures].flatMap((m) => Object.keys(m));
  for (const u of [...V1.UPGRADES, ...V1.WALK_UPGRADES]) ok([...upMap, ...RN.upgradesCut, ...RN.combatKit].filter((x) => x === u.id).length === 1, `upgrade ${u.id} must map to exactly one of outfit / tackle / lures / cut / combat kit`);
  for (const [u, o] of Object.entries(RN.upgradesToOutfit)) ok(D.OUTFIT.some((x) => x.id === o && x.from === u), `outfit ${o} from ${u}`);
  for (const [u, l] of Object.entries(RN.upgradesToLures)) ok(D.LURES.some((x) => x.id === l && x.from === u), `lure ${l} from ${u}`);
  ok(JSON.stringify(RN.combatKit) === JSON.stringify(D.COMBAT_KIT.ids), 'the combat kit list matches');
  for (const [a, b] of Object.entries(RN.names)) ok(isStr(a) && isStr(b) && a !== b, `rename name ${a}`);

  // ---- originality guardrails (brief §13.3) on every v3 display string
  const G3 = ORIGINALITY_V3;
  const seen3 = new Set();
  const scan3 = (v, path) => {
    if (typeof v === 'string') { for (const re of G3) if (re.test(v)) errors.push(`originality (v3): "${v.slice(0, 70)}" at ${path} matches ${re}`); return; }
    if (!v || typeof v !== 'object' || seen3.has(v)) return; seen3.add(v);
    for (const [k, c] of Object.entries(v)) if (!/^(id|icon|behavior|style|weapon|model|shape|type|trigger|mechanic|renamedFrom|from)$/.test(k)) scan3(c, `${path}.${k}`);
  };
  for (const k of V3_TEXT_EXPORTS.filter((x) => x !== 'RENAMES')) scan3(D[k], k);
  scan3(D.SPECIES.map((s) => ({ name: s.name, epithet: s.epithet, hint: s.hint, lore: s.lore })), 'SPECIES');
  checks++;

  // ---- pounds (docs/v3/pounds/SPEC.md): a fish's size is told in pounds and ounces; internals stay kg and cm
  {
    // the format table (SPEC §2.3): exact strings
    const FW = [[0.0068, '¼ oz'], [0.0001, '¼ oz'], [0.0142, '½ oz'], [0.0248, '¾ oz'], [0.02481, '1 oz'], [0.0283, '1 oz'], [0.1, '4 oz'], [0.3118, '11 oz'],
      [0.4394, '15 oz'], [0.4395, '1 lb 0 oz'], [0.45, '1 lb 0 oz'], [0.4536, '1 lb 0 oz'], [0.8930, '1 lb 15 oz'], [0.8931, '2 lb 0 oz'], [1.9845, '4 lb 6 oz'],
      [14.515, '32 lb 0 oz'], [45.0, '99 lb 3 oz'], [45.35, '100 lb'], [45.5, '100 lb'], [45.6, '101 lb'], [96.16, '212 lb'], [120, '265 lb'], [300, '661 lb'],
      [453.6, '1,000 lb'], [3200, '7,055 lb'], [0, '—'], [-2, '—'], [NaN, '—'], [undefined, '—'], ['3', '—']];
    for (const [kg, want] of FW) ok(D.fmtWeight(kg) === want, `fmtWeight(${kg}) must read "${want}" (got "${D.fmtWeight(kg)}")`);
    ok(D.fmtWeight(1.9845, { nbsp: true }) === '4\u00a0lb\u00a06\u00a0oz', 'fmtWeight {nbsp} joins the figure with no-break spaces');
    // the shape and the carry: never "16 oz", "1 lb 16 oz" or "100 lb 0 oz"; the figure never falls as the weight grows
    const SHAPE = /^([¼½¾]|\d{1,2}) oz$|^\d{1,2} lb \d{1,2} oz$|^\d{1,3}(,\d{3})* lb$/;
    const toOz = (t) => { const m = /^(?:([\d,]+) lb)?(?: ?([¼½¾]|\d+) oz)?$/.exec(t); return (m[1] ? +m[1].replace(/,/g, '') * 16 : 0) + (m[2] ? ({ '¼': 0.25, '½': 0.5, '¾': 0.75 }[m[2]] ?? +m[2]) : 0); };
    let prev = 0, bad = null;
    for (let kg = 0.0001; kg < 4000 && !bad; kg *= 1.003) {
      const t = D.fmtWeight(kg), m = /^(\d+) lb (\d+) oz$/.exec(t), v = SHAPE.test(t) ? toOz(t) : -1;
      if (v < prev || (m && (+m[1] < 1 || +m[1] > 99 || +m[2] > 15)) || /^1[6-9] oz$|^[2-9]\d oz$/.test(t)) bad = `${kg.toFixed(4)} kg → "${t}"`;
      prev = v;
    }
    ok(!bad, `fmtWeight: a figure outside the format, or one that falls as the weight grows (${bad})`);
    ok(Math.abs(D.OZ_PER_KG - 16 * D.LB_PER_KG) < 1e-6 && Math.abs(1 / D.LB_PER_KG - 0.45359237) < 1e-9, 'OZ_PER_KG = 16 × LB_PER_KG; 1 lb = 0.45359237 kg');
    ok(D.weightOz(0.45) === 16 && D.weightOz(0) === 0 && D.weightOz(NaN) === 0 && D.weightOz(Infinity) === 0, 'weightOz: the ounces the card shows; 0 for no weight');
    ok(D.weightOz(0.0142) === 0.5 && D.weightOz(1607.9 / D.OZ_PER_KG) === 1600 && D.weightOz(1608.1 / D.OZ_PER_KG) === 1616, 'weightOz: quarters under an ounce, whole pounds from 100 lb (the figure fmtWeight prints)');
    { let off = ''; for (let kg = 0.0001; kg <= 500 && !off; kg *= 1.003) if (toOz(D.fmtWeight(kg)) !== D.weightOz(kg)) off = `${kg} kg: "${D.fmtWeight(kg)}" vs ${D.weightOz(kg)} oz`;
      ok(!off, `weightOz is the figure fmtWeight prints, at every weight (${off})`); }
    ok(D.fmtWeightNear(4.3) === '9 lb' && D.fmtWeightNear(9.1) === '20 lb' && D.fmtWeightNear(125) === '275 lb' && D.fmtWeightNear(3200) === '7,100 lb' && D.fmtWeightNear(0.17) === '6 oz' && D.fmtWeightNear(0) === '',
      'fmtWeightNear: the got-away steps (1 lb, 5 lb, 25 lb, 100 lb)');
    ok(JSON.stringify(D.AUTOFISH.gotAway.roundLb) === '[[10,1],[100,5],[1000,25],[null,100]]' && D.AUTOFISH.gotAway.roundLb[3][0] === Infinity, 'AUTOFISH.gotAway.roundLb: the "near" weight steps');
    ok(D.weightTarget(0.72, 0.81).text === '1 lb 8 oz' && D.weightTarget(3.88, 4.63).text === '9 lb 0 oz' && D.weightTarget(0.178, 0.201).text === '6 oz' && D.weightTarget(0.72, 0.66).text === '1 lb 0 oz', 'weightTarget: round bounty targets in the card\'s own figure, never above the cap');
    { let off = ''; for (let kg = 0.03; kg < 60 && !off; kg *= 1.02) { const T = D.weightTarget(kg, kg * 1.2); if (T.text !== D.fmtWeight(T.kg) || D.weightOz(T.kg) !== T.oz || !SHAPE.test(T.text)) off = `${kg} kg: ${JSON.stringify(T)}`; }
      ok(!off, `weightTarget: the words are fmtWeight of the target, and its ounces are the ones the check compares (${off})`); }
    ok(D.fmtCm(8.4) === '8.4 cm' && D.fmtCm(33.2) === '33 cm' && D.fmtCm(850) === '850 cm' && D.fmtCm(0) === '—', 'fmtCm: the card\'s length line, cm always');
    // a fish's displayed weight is derived from its length with the species' k
    { const carp = D.SPECIES_BY_ID.weeping_carp, bm = D.SPECIES_BY_ID.belled_matriarch;
      ok(D.fishWeight(carp, { length: 61, weight: 99 }) === 3.63 && D.fishWeight(carp, { weight: 2.5 }) === 2.5 && D.fishWeight(carp, {}) === 0, 'fishWeight: from the length (k·L³), else the stored kg');
      ok(D.fmtWeight(D.fishWeight(bm, { length: 260 })) === '265 lb', `the Belled Matriarch reads 265 lb at 260 cm (got ${D.fmtWeight(D.fishWeight(bm, { length: 260 }))})`); }
    // the audit's anchors (SPEC §6.2): a 61 cm carp ≈ 8 lb, a 112 cm pike ≈ 23 lb, a 90 cm eel ≈ 3½ lb; giants in the hundreds of pounds
    const at = (id, cm) => D.fmtWeight(D.sizeWeight(D.SPECIES_BY_ID[id], cm));
    ok(at('weeping_carp', 61) === '8 lb 0 oz' && at('reedjaw_pike', 112) === '23 lb 4 oz' && at('gloam_eel', 90) === '3 lb 9 oz', `weights ring true: carp 61 cm ${at('weeping_carp', 61)}, pike 112 cm ${at('reedjaw_pike', 112)}, eel 90 cm ${at('gloam_eel', 90)}`);
    for (const s of D.SPECIES.filter((x) => x.rarity === 'legendary')) { const lb = s.size.W50 * D.LB_PER_KG; ok(lb >= 200 && lb < 10000, `legend ${s.id}: ${Math.round(lb)} lb at first landing (the giants weigh hundreds of pounds)`); }
    for (const b of ['trout', 'gar', 'greateel', 'swampeel']) ok(isNum(SZ.k[b]) && D.SPECIES_V3.some((s) => s.size.body === b), `size.k.${b}: a body key split off for a cousin far from its plan, used by a species`);
    ok(D.SPECIES_BY_ID.threadling_eel.size.k === 0.0016 && D.SPECIES_BY_ID.gloam_eel.size.k === 0.0022 && D.SPECIES_BY_ID.pilgrim_salmon.size.k === SZ.k.trout, 'the eel retune keeps the Threadling (swampeel); the Pilgrim Salmon is a trout body');
    // a body key is a plain family or build word, never a real species' own name (the cousins live in docs only)
    ok(Object.keys(SZ.k).every((b) => !/conger|wels|roach|chinook|grayling|ratfish|kaluga|sixgill|zander|mussum/i.test(b)), `size.k: no body key is a real species' own name (${Object.keys(SZ.k).join(', ')})`);
    // the Journal's range: smallest to a top Trophy, then the ceiling ("said to reach")
    for (const s of D.SPECIES_V3) { const w = D.weightSpan(s); ok(!!w && w.min === s.weight[0] && w.reach === s.weight[1] && w.min < w.top && w.top <= w.reach, `weightSpan(${s.id}): min < top ≤ reach (${JSON.stringify(w)})`); }
    { const w = D.weightSpan(D.SPECIES_BY_ID.mossback_perch); ok(D.fmtWeight(w.top) === '5 lb 15 oz' && D.fmtWeight(w.reach) === '17 lb 11 oz', `a perch's page runs to a top Trophy (${D.fmtWeight(w.top)}), said to reach ${D.fmtWeight(w.reach)}`); }
    ok(typeof D.TEXT_V3.saidToReach === 'string' && D.TEXT_V3.saidToReach.includes('{w}'), 'TEXT_V3.saidToReach takes a weight');
    // no player-facing kg (or a bare cm figure for a fish) in v3 text
    const KG = /\bkg\b|\{kg\}|\{cm\} cm|\{len\}/;
    const scanKg = (v, path) => {
      if (typeof v === 'string') { ok(!KG.test(v), `${path}: a fish's size is told in pounds in v3 ("${v.slice(0, 60)}")`); return; }
      if (!v || typeof v !== 'object') return;
      for (const [k, c] of Object.entries(v)) scanKg(c, `${path}.${k}`);
    };
    scanKg(D.TEXT_V3, 'TEXT_V3'); scanKg(D.AUTOFISH.text, 'AUTOFISH.text'); scanKg(D.FIRST_EVENING.text, 'FIRST_EVENING.text'); scanKg(D.DESC_V3, 'DESC_V3');
    scanKg(D.TIPS.map((t) => t.text), 'TIPS'); scanKg(D.MERCHANT_LINES, 'MERCHANT_LINES'); scanKg(D.BOUNTIES.map((b) => b.text), 'BOUNTIES');
    scanKg(D.CHALLENGES.map((c) => [c.name, c.desc]), 'CHALLENGES'); scanKg(D.LEDGER, 'LEDGER');
    ok(D.TEXT_V3.newBest === 'New best: {w} (was {was})' && D.AUTOFISH.text.size.includes('{size}') && D.AUTOFISH.text.log.marked.includes('{size}'), 'the record line and the got-away words take a weight ({w}, {size})');
  }

  // ---- phases (DESIGN §25.14.1, CONTRACT §13.0): each phase's build carries exactly its data, with and without §24
  const PH = {};
  { const f0 = [globalThis.GW_WALK, globalThis.GW_V3, globalThis.GW_V3_PHASE];
    for (const walk of [false, true]) for (const p of [1, 2, 3, 4]) {
      globalThis.GW_WALK = walk; globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = p;
      PH[`${walk ? 'w' : 'r'}${p}`] = await import(`../src/data.js?v3p${p}${walk ? 'w' : 'r'}`);
    }
    [globalThis.GW_WALK, globalThis.GW_V3, globalThis.GW_V3_PHASE] = f0; }
  const EXPECT = { species: { r: [33, 37, 39, 41], w: [41, 45, 47, 53] }, challenges: { r: [30, 30, 38, 38], w: [40, 40, 48, 48] }, mossPlaces: [0, 8, 8, 9] };
  for (const [key, R] of Object.entries(PH)) {
    const walk = key[0] === 'w', p = +key[1], tag = `v3 P${p}${walk ? ' + §24' : ' (raft)'}`;
    ok(R.V3_PHASE === p && R.WALK_ENABLED === walk, `${tag}: evaluated with the intended flags`);
    ok(R.SPECIES.length === EXPECT.species[key[0]][p - 1], `${tag}: ${R.SPECIES.length} species (expected ${EXPECT.species[key[0]][p - 1]})`);
    ok(R.SPECIES.every((s) => (s.src === 'walk' ? walk : s.phase <= p)), `${tag}: every species belongs to this phase (or arrives with §24)`);
    ok(!!R.SPECIES_BY_ID.quayling && R.ZONES.every((z) => !R.SPECIES.some((s) => s.cove && (s.zone === z.id || (s.zones || []).includes(z.id)))) && JSON.stringify(R.COVE.fishing.species) === '["quayling"]',
      `${tag}: the Quayling is in the build and in no lake's pool (cove-only)`);
    ok(R.TEXT.v3?.firstEvening === R.FIRST_EVENING.text && Object.keys(R.FIRST_EVENING.tips).every((id) => R.TIPS.some((t) => t.id === id) === (id !== 'fe_walk' || p >= 3)),
      `${tag}: FE-D1: the First Evening's lines are TEXT_V3.firstEvening and its tips are in TIPS (fe_walk from P3)`);
    ok(R.CHALLENGES.length === EXPECT.challenges[key[0]][p - 1] && (p >= 3) === !!R.CHALLENGE_BY_ID.first_prize, `${tag}: challenges ${R.CHALLENGES.length} (v1 / §24 sets until P3, the 48 from P3)`);
    ok((p >= 3) === !R.RELIC_BY_ID.old_debt && (p >= 3) === !!R.RELIC_BY_ID.measuring_cord, `${tag}: relic cuts, shelves and costs only from P3 (the refund lands with Pg3)`);
    ok(Object.keys(R.BALANCE_V3).every((k) => ((R.V3_BLOCK_PHASE[k] ?? 1) <= p) === (k in R.BALANCE)), `${tag}: BALANCE_V3 blocks join BALANCE by V3_BLOCK_PHASE`);
    ok(R.FISH_SHAPES.includes('sturgeon') === (p >= 2), `${tag}: the sturgeon shape from P2`);
    ok((R.ZONES[0].arena.places || []).length === EXPECT.mossPlaces[p - 1] && R.ZONES[0].arena.pillars.some((o) => o.kind === 'hands') === (p >= 2), `${tag}: the Mossmere's places and props from P2 (the Moon Cistern P4)`);
    ok(R.ZONES.every((z) => !!z.homeward === (p >= 3)), `${tag}: Homeward stones from P3`);
    ok(R.BAIT_BY_ID.last_candle && !R.BAIT_BY_ID.pale_marrow && R.SPECIES_BY_ID.lantern_swallower && R.SUPPLY_BY_ID.murks_chum && R.BOUNTY_BY_ID.spot_catch.type === 'signCatch', `${tag}: renames (Pg0 migrates ids in P1), Murk's Chum and the sign bounty from P1`);
    ok(R.TIPS.filter((t) => t.id.startsWith('v3_')).every((t) => t.phase <= p), `${tag}: tips of later phases are not in the build`);
    { const hc = R.CHALLENGE_BY_ID.heavy_catch, lb = p >= 3 ? 33 : 18;   // pounds: 8 kg → 18 lb (P1–2), 15 kg → 33 lb (P3+); the heavy bounty's words take {w}
      ok(hc.params.lb === lb && !('kg' in hc.params) && hc.desc === `Land a non-legendary fish over ${D.fmtWeight(lb / D.LB_PER_KG)}.` && /over \d+ lb 0 oz\.$/.test(hc.desc), `${tag}: the Heavyweight asks for over ${lb} lb, in the card's own figure (got ${JSON.stringify(hc.params)}: "${hc.desc}")`);
      ok(R.BOUNTY_BY_ID.heavy.text === 'Land a {species} over {w}.', `${tag}: the heavy bounty's words take a weight in pounds ({w})`); }
    ok(R.CHALLENGE_BY_ID.complete_chronicle.params.n === R.SPECIES.length, `${tag}: the Chronicle asks for every species in the build`);
    // every lake has exactly 3 giant sources (its holdsGiants places, else the raft stopgap) and 2 watch lamps
    for (const z of R.ZONES) {
      const gp = (z.arena.places || []).filter((q) => q.holdsGiants && !q.secret).length, gs = (z.arena.giantSpots || []).length;
      ok((gp > 0) !== (gs > 0) && (gp || gs) === 3, `${tag} ${z.id}: 3 giant sources (places ${gp}, stopgap ${gs})`);
      const lamps = z.id === 'mossmere' || !walk ? (z.arena.watchLamps || []) : (R.ARENA_V2[z.id]?.lamps || []).filter((l) => l.watch);
      ok(lamps.length === 2 && lamps.every((l) => l.radius === R.BALANCE_V3.nightModes.lampWatch.radius), `${tag} ${z.id}: two watch lamps with pool r 6 (got ${lamps.length})`);
      // lamp-watch costs the giants: no holdsGiants water (place or stopgap) within fishWithin of a watch lamp
      const fw = R.BALANCE_V3.nightModes.lampWatch.fishWithin;
      for (const l of lamps) {
        let dmin = Infinity;
        for (const q of (z.arena.places || []).filter((x) => x.holdsGiants && !x.secret)) { const [x0, z0, x1, z1] = R.walkShapeBounds(q.water, fw + 1); for (let zz = z0; zz <= z1; zz += 0.5) for (let x = x0; x <= x1; x += 0.5) if (R.placeContains(q, x, zz)) dmin = Math.min(dmin, Math.hypot(x - l.x, zz - l.z)); }
        for (const g of z.arena.giantSpots || []) dmin = Math.min(dmin, Math.max(0, Math.hypot(g.x - l.x, g.z - l.z) - (Array.isArray(g.r) ? g.r[1] : g.r)));
        ok(dmin >= fw, `${tag} ${z.id}: watch lamp ${l.id} is ${dmin.toFixed(1)} m from giant water (≥ ${fw} m: a lamp-watch costs the night's giants)`);
      }
    }
  }
  ok(!('V3_PHASE' in V1) || V1.V3_PHASE === 4, 'V3_PHASE defaults to 4 (tools see the whole design)');
  // raft fallbacks: open water, clear of docks and the gate; Homeward stones placed as the §24 ones are
  for (const [zid, F] of Object.entries(D.RAFT_FALLBACK_V3)) {
    const Z1 = V1.ZONE_BY_ID[zid], L = WLY.buildLayout(Z1), obs = [...L.obstacles, ...L.gateObstacles];
    ok(F.giants.length === 3 && F.giants[0].kind === 'ring' && near(F.giants[0], Z1.arena.legendPool) < 0.01, `${zid} stopgap: the legend-pool rim + 2 more giant waters`);
    for (const g of F.giants.slice(1)) {
      const r = g.r; let open = 0, n = 0;
      for (let a = 0; a < 360; a += 30) for (const rr of [0, r / 2, r]) { n++; if (WLY.isOpenWaterL(L, obs, g.x + rr * Math.cos(a * Math.PI / 180), g.z + rr * Math.sin(a * Math.PI / 180), 0.3)) open++; }
      ok(open / n >= 0.9 && !L.docks.some((d) => near(d, g) < r + 4) && near(g, L.spawn) >= 16, `${zid} stopgap ${g.id}: open water clear of docks and the spawn (${open}/${n})`);
    }
    if (zid === 'mossmere') { ok(F.until === 2, 'the Mossmere stopgap ends in P2'); continue; }
    for (const l of F.watchLamps) ok(near(L.docks[l.dock].buoy, l) < 0.1, `${zid} raft watch lamp ${l.id} is its dock's drawn buoy-lamp`);
    const st = F.homeward, A1 = Z1.arena;
    ok(near(st, L.spawn) >= E3.homeward.minPathFromSpawn && WLY.isOpenWaterL(L, obs, st.x, st.z, E3.homeward.radius + 0.6) && !L.docks.some((d) => near(d, st) < HCL.bargePad || near(d.buoy, st) < HCL.buoy || d.posts.some((q) => near(q, st) < HCL.post)), `${zid} raft Homeward stone (${st.x}, ${st.z}): open water ≥ 25 m from the spawn, clear of barge, buoy and posts`);
    ok(A1 && true, `${zid} raft arena`);
  }

  // ---- Elder seals: every species that can earn one has a route (kept place with giantsKept or holdsGiants; else a holdsGiants
  // place, or raft builds' stopgap water, whose depth band and hours it can use)
  const elderRoute = (R, sp, depthOfSpot) => {
    const zs = sp.zones?.length ? sp.zones : [sp.zone];
    const overlap = (band) => sp.depth[0] <= band[1] && band[0] <= sp.depth[1];
    const placesOf = (z) => (R.ZONE_BY_ID[z]?.arena?.places || []).filter((q) => !q.secret);
    if (sp.place) { const q = zs.flatMap(placesOf).find((x) => x.id === sp.place); return !!q && !!(q.holdsGiants || q.giantsKept) && overlap(q.water.depth); }
    for (const z of zs) {
      for (const q of placesOf(z)) if (q.holdsGiants && overlap(q.water.depth) && !(q.giantsDuring === 'moonfall' && sp.time === 'gloom')) return true;
      for (const g of R.ZONE_BY_ID[z]?.arena?.giantSpots || []) if (overlap(depthOfSpot(z, g))) return true;
    }
    return false;
  };
  const spotDepth = {};
  const depthOfSpot = (z, g) => {
    const key = `${z}:${g.id}`; if (spotDepth[key]) return spotDepth[key];
    const L = WLY.buildLayout(V1.ZONE_BY_ID[z]), obs = [...L.obstacles, ...L.gateObstacles], R2 = Array.isArray(g.r) ? g.r : [0, g.r]; let lo = 9, hi = -9;
    for (let a = 0; a < 360; a += 10) for (let r = R2[0]; r <= R2[1]; r += 0.5) { const x = g.x + r * Math.cos(a * Math.PI / 180), zz = g.z + r * Math.sin(a * Math.PI / 180); if (!WLY.isOpenWaterL(L, obs, x, zz, 0.3)) continue; const d = WLY.depthAt(L, x, zz); lo = Math.min(lo, d); hi = Math.max(hi, d); }
    return (spotDepth[key] = [lo, hi]);
  };
  for (const [R, tag] of [[D, 'v3 + §24'], [NW, 'v3 raft (no §24)']]) {
    const miss = R.SPECIES.filter((sp) => R.sealsFor(sp).includes('elder') && !elderRoute(R, sp, depthOfSpot)).map((sp) => sp.id);
    ok(miss.length === 0, `${tag}: Elder seals with no Elder water: ${miss.join(', ')}`);
  }
  ok(['cupped_hands', 'gatehouse_door'].every((id) => D.PLACE_V3_BY_ID[id].giantsKept) && ['drowned_greenhouse', 'veilwater', 'bell_window', 'stilled_cascade', 'long_pier', 'sunken_belfry', 'bier_barge'].every((id) => D.PLACE_V3_BY_ID[id].giantsKept) && D.PLACES_V3.filter((q) => q.giantsKept).every((q) => !q.holdsGiants && S.some((x) => x.place === q.id)), 'giantsKept on exactly the places whose kept species had no Elder water (and never on a giant place)');
  ok(JSON.stringify(D.PLACE_V3_BY_ID.lullaby.water.depth) === '[0.4,0.85]' && JSON.stringify(D.PLACE_V3_BY_ID.ferry_slip.water.depth) === '[0.45,0.95]' && JSON.stringify(D.ARENA_V2.paleabyss.places.find((q) => q.id === 'ferry_slip').water.depth) === '[0.45,0.95]' && JSON.stringify(W2.ARENA_V2.paleabyss.places.find((q) => q.id === 'ferry_slip').water.depth) !== '[0.45,0.95]', 'shallow giant water (▲): the Lullaby rim and the Ferry Slip ramp, applied only in v3');

  // ---- the Mossmere's places against world-layout (the arena the raft actually sails)
  { const LM = WLY.buildLayout(D.ZONES[0]), obsM = [...LM.obstacles, ...LM.gateObstacles], islands = LM.obstacles.filter((o) => o.kind === 'island');
    for (const q of D.MOSSMERE_V3.places.filter((x) => !x.secret)) {
      const w = q.water;
      if (w.kind === 'disc') for (const o of islands) ok(Math.hypot(o.x - w.x, o.z - w.z) >= o.r + w.r - (q.dropIn ? w.r : 0), `Mossmere place ${q.id} overlaps an island's collision (${o.x}, ${o.z})`);
      let n = 0, open = 0; const [x0, z0, x1, z1] = D.walkShapeBounds(w);
      for (let zz = z0; zz <= z1; zz += 0.5) for (let x = x0; x <= x1; x += 0.5) if (D.placeContains(q, x, zz)) { n++; if (WLY.isOpenWaterL(LM, obsM, x, zz, 0.3)) open++; }
      if (!q.dropIn) ok(open / n >= 0.8, `Mossmere place ${q.id}: only ${(100 * open / n).toFixed(0)}% of its water is open in world-layout (≥ 80%)`);
      for (const t of (q.dropIn ? q.rule.targets : [])) ok(WLY.isOpenWaterL(LM, obsM, t.x, t.z, B3.placesV3.dropIn.centreOpenMargin), `Mossmere dropIn target ${q.id}.${t.id}: its centre must be open water (margin ${B3.placesV3.dropIn.centreOpenMargin})`);
      ok(isObj(q.tallyAt) && WLY.isOpenWaterL(LM, obsM, q.tallyAt.x, q.tallyAt.z, 1.0) && !D.MOSSMERE_V3.places.some((x) => !x.secret && D.placeContains(x, q.tallyAt.x, q.tallyAt.z)), `Mossmere place ${q.id}: its Tally Post stone stands in open water outside every place`);
      ok(isObj(q.landmark) && isNum(q.landmark.y) && D.landmarkOf(q).x === q.landmark.x, `Mossmere place ${q.id} has a landmark for the trophy camera`);
    }
    const bowl = D.PLACE_V3_BY_ID.cupped_hands.bowl, hands = D.MOSSMERE_V3.props.find((o) => o.kind === 'hands');
    ok(bowl.dropIn && bowl.y === 0 && near(bowl, hands) + bowl.r <= hands.r, 'the Cupped Hands\' bowl is a water-level (y 0) dropIn pool inside the hands\' collision');
    const lane = D.PLACE_V3_BY_ID.sluice_run.rule.lane, gate = LM.gate;
    ok(Math.min(...lane.map(([x, zz]) => Math.hypot(x - gate.x, zz - gate.z))) >= gate.radius * 1.2 + 2.5, `the Sluice Run's lane starts ${Math.min(...lane.map(([x, zz]) => Math.hypot(x - gate.x, zz - gate.z))).toFixed(1)} m from the gate (clear of its pill and stone ring)`);
    const MF = D.MOSSMERE_V3.happening, discs = MF.clear.discs;
    ok(MF.owner === 'progression' && discs.length === 2 && discs.every((c) => { const q = D.PLACE_V3_BY_ID[c.place]; const [rx, rz, rw, rh] = c.paint.rect; return q && rx <= c.x - c.r + 1e-9 && rz <= c.z - c.r + 1e-9 && rx + rw >= c.x + c.r - 1e-9 && rz + rh >= c.z + c.r - 1e-9 && D.placeContains(q, c.x, c.z); }) && new Set(discs.map((c) => c.paint.cell)).size === 2, 'Moonfall: two clear discs in their places, each with its own painting cell covering it');
    ok(near(D.MOSSMERE_V3.cracks[0], D.PLACE_V3_BY_ID.ferry_market) < 0.01 && near(D.MOSSMERE_V3.landmarks.find((l) => l.id === 'moon_eye'), D.PLACE_V3_BY_ID.ferry_market) < 0.01, 'the Moon-Eye\'s authored crack and landmark stand over the Ferry-Market');
    ok(D.MOSSMERE_V3.redress.reduce((a, r) => a + r.calls, 0) === 4 && D.PLACE_V3_BY_ID.buoy_lights.build.includes('y 0'), 'the harbour re-dress (W9) is 4 calls; the buoy-lanterns draw at the surface'); }

  // ---- tackle stats and the P1–P2 tier mapping
  { const t0 = D.tackleStats({}), t4 = D.tackleStats({ rod: 4, line: 4, reel: 4, creel: 4 });
    ok(t0.castMax === 16 && t0.hookWindow === 1 && t0.creelSize === 4 && JSON.stringify(t0.hold) === '{"rod":0,"line":0,"reel":0}', 'tackleStats(T0): castMax 16, hook window × 1, creel 4, no Hold');
    ok(t4.castMax === 22 && t4.creelSize === 8 && t4.liveWell === 3 && JSON.stringify(t4.hold) === '{"rod":12,"line":13,"reel":12}', 'tackleStats(T4): castMax 22, creel 8 with 3 Live Well slots, Hold 12 / 13 / 12');
    ok(Object.keys(t4).every((k) => ['castMax', 'hookWindow', 'creelSize', 'liveWell', 'nights', 'hold'].includes(k)), 'tackleStats carries no manual-reel stat (D1′)');
    const ups = Object.fromEntries(D.UPGRADES.map((u) => [u.id, u.maxLevel]));
    ok(JSON.stringify(D.upgradeTiers({})) === '{"rod":0,"line":0,"reel":0,"creel":0}' && JSON.stringify(D.upgradeTiers(ups)) === '{"rod":4,"line":4,"reel":4,"creel":4}', 'upgradeTiers: no upgrades → T0, every level → T4');
    for (const k of ['shock', 'absorb', 'pipBonus', 'dragAt']) ok(!(k in D.STATS) && !(k in V1.STATS) && !(k in W2.STATS), `STATS.${k} exists in no build (retired by D1′)`); }

  // ---- automatic fishing (DESIGN §25.6, CONTRACT §13.7; the user's direction of 2026-11-05): the catch model, the strike, the play,
  // leaps and the hidden-information data, the First Evening. Never 100%: every cap < 1 and no item, strike, buff or bonus reaches one.
  { const CT = D.CATCH_V3, AF = D.AUTOFISH, FE = D.FIRST_EVENING, CLS = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
    const SV = D.SPECIES_V3, TT = (n) => ({ rod: n, line: n, reel: n });
    // caps, floor, scale
    ok(Object.values(CT.cap).every((c) => c > CT.floor && c < 1), `CATCH_V3: every cap is below 1 and above the floor (${JSON.stringify(CT.cap)})`);
    ok(CT.floor >= 0.01 && CT.floor < 0.05 && CT.scale > 0, 'CATCH_V3: floor in [0.01, 0.05), scale > 0');
    ok(CLS.every((c, i) => i === 0 || CT.cap[c] <= CT.cap[CLS[i - 1]]) && CT.cap.legend <= CT.cap.ancient, 'CATCH_V3: bigger classes never have a higher cap');
    ok(CLS.every((c, i) => i === 0 || CT.class[c] > CT.class[CLS[i - 1]]), 'CATCH_V3: bigger is harder (class Fight rises with every class)');
    // tackle Hold
    for (const slot of ['rod', 'line', 'reel']) ok(D.TACKLE[slot].every((t, i) => Number.isFinite(t.hold) && (i === 0 ? t.hold === 0 : t.hold > D.TACKLE[slot][i - 1].hold)), `TACKLE.${slot}: hold starts at 0 and rises strictly with tier`);
    ok(JSON.stringify([0, 1, 2, 3, 4].map((n) => ['rod', 'line', 'reel'].reduce((a, s) => a + D.TACKLE[s][n].hold, 0))) === '[0,6,15,25,37]', 'TACKLE: matched sets give 0 / 6 / 15 / 25 / 37 Hold');
    ok(JSON.stringify(D.tackleStats({ rod: 3, line: 4, reel: 2 }).hold) === JSON.stringify({ rod: 8, line: 13, reel: 5 }), 'tackleStats(loadout).hold reads TACKLE hold per slot');
    // per-run gear (P1–P2 runs, The Long Descent): every rod / line / reel level adds Hold (upgradeHold interpolates; upgradeTiers rounds for the rating)
    { const { runHoldFor, slotLevels } = await import('./sim/catch-v3.mjs');
      for (const slot of ['rod', 'line', 'reel']) {
        const hs = [...Array(slotLevels(slot) + 1).keys()].map((k) => runHoldFor({ [slot]: k })[slot]);
        ok(hs[0] === 0 && hs.every((h, i) => i === 0 || h > hs[i - 1]) && within(hs.at(-1), D.TACKLE[slot][4].hold, 1e-9), `upgradeHold.${slot}: every level adds Hold, 0 → ${D.TACKLE[slot][4].hold} (${hs.map((h) => h.toFixed(1)).join(' / ')})`);
        const rj = D.TACKLE.reference.mossmere;
        for (let k = 0; k < hs.length - 1; k++) {
          const a = D.catchChance(rj, 'trophy', { hold: runHoldFor({ [slot]: k }) }), b = D.catchChance(rj, 'trophy', { hold: runHoldFor({ [slot]: k + 1 }) });
          ok((b - a) * 100 >= CT.targets.levelGain, `per-run ${slot} level ${k + 1} raises the ${rj} Trophy chance by ${((b - a) * 100).toFixed(2)} points (≥ ${CT.targets.levelGain}: no purchase buys nothing)`);
        }
      }
      ok(within(D.tackleHoldAt('line', 2.5), (D.TACKLE.line[2].hold + D.TACKLE.line[3].hold) / 2, 1e-9) && D.catchChance('reedjaw_pike', 'trophy', { rod: 2.5, line: 0, reel: 0 }) > D.catchChance('reedjaw_pike', 'trophy', { rod: 2, line: 0, reel: 0 }), 'fractional tiers interpolate Hold');
      const G0 = CT.targets.perRunSwallower, RH = CT.targets.relicHoldByTier;
      const sw = D.catchChance('lantern_swallower', 'legend', { rod: 3, line: 2, reel: 3 }, { perRun: true, buffs: RH[3] }), sw4 = D.catchChance('lantern_swallower', 'legend', TT(4), { perRun: true, buffs: RH[4] });
      ok(sw >= G0.R3L2E3[0] && sw <= G0.R3L2E3[1] && sw4 <= G0.T4Max, `the Lantern-Swallower on per-run gear: R3/L2/E3 ${(sw * 100).toFixed(1)}% (${G0.R3L2E3.map((x) => x * 100).join('–')}), T4 ${(sw4 * 100).toFixed(1)}% (≤ ${G0.T4Max * 100}); legend.fightRun is used when tiers come from UPGRADES`);
      ok(Object.keys(CT.legend.fight).every((id) => CT.legend.fightRun[id] > 0 && CT.legend.fightRun[id] < CT.legend.fight[id]), 'CATCH_V3.legend.fightRun: every legend, easier than on persistent tackle');
      ok(D.catchChance('reedjaw_pike', 'prize', { ...TT(0), item: 'glimmer_spoon', upgrade: { id: 'lure_glimmer', level: 3 } }) === D.catchChance('reedjaw_pike', 'prize', { ...TT(0), item: 'glimmer_spoon' }), 'a per-run upgrade lure never stacks with the equipped item (the larger counts)'); }
    // buffs: relics ≤ relicCap, run buffs ≤ runCap, together ≤ cap; owned relics are in the log
    ok(CT.buffs.relicCap <= CT.buffs.cap && CT.buffs.runCap <= CT.buffs.cap && CT.buffs.relicCap + CT.buffs.runCap >= CT.buffs.cap && CT.display.reference.buffs === 'relics', 'CATCH_V3.buffs: relic and run sub-caps under the shared cap; the log carries owned relics');
    ok(D.catchBuffHold('reedjaw_pike', 'prize', { relics: { seven_knots: 3, steady_hook: 3 } }) === CT.buffs.relicCap && D.catchBuffHold('reedjaw_pike', 'prize', { wellFed: true, boons: { steady_reel: 5 }, relics: { seven_knots: 3 } }) === CT.buffs.cap, 'two relics alone cannot fill the buff cap; run buffs still count beside them');
    ok(CT.targets.relicHoldByTier.length === 5 && CT.targets.relicHoldByTier.every((v, i, a) => v >= 0 && v <= CT.buffs.relicCap && (i === 0 || v >= a[i - 1])), 'CATCH_V3.targets.relicHoldByTier: the relic Hold a player has at each tier');
    for (const st of D.FISH_STYLES) { const e = CT.emphasis[st]; ok(e && within(e.rod + e.line + e.reel, 3, 1e-9) && st in CT.style, `CATCH_V3: style ${st} has an emphasis averaging 1 and a Fight term`); }
    // strike
    const SW = AF.strike.window;
    ok(CT.strike.clean > CT.strike.struck && CT.strike.struck > CT.strike.early && CT.strike.early === CT.strike.late && CT.strike.struck - CT.strike.early <= 3,
      'CATCH_V3.strike: clean > struck > early = late, and a mistimed strike is only "a bit lower" (≤ 3 Hold under the log\'s reference)');
    ok(AF.strike.lastDip > 0 && AF.strike.lastDip < SW.small && ['touch', 'mouse', 'key'].every((k) => AF.strike.latencyComp[k] >= 0 && AF.strike.latencyComp[k] < 0.15) && AF.strike.priority === 'bite',
      'AUTOFISH.strike: a fixed last dip shorter than any window; latency compensation per input; the strike takes input priority during the bite');
    { const { strikeGrades } = await import('./sim/catch-v3.mjs'); const nc = strikeGrades('small', 'novice', 'touch').clean;
      ok(nc >= CT.targets.noviceCleanSmall, `a novice on a phone strikes Clean on ${(nc * 100).toFixed(0)}% of Small bites (≥ ${CT.targets.noviceCleanSmall * 100}%)`); }
    ok(CLS.every((c, i) => SW[c] > 0 && (i === 0 || SW[c] >= SW[CLS[i - 1]])) && SW.legend >= SW.ancient, 'AUTOFISH.strike.window: by class (never by species), never shorter for a bigger class');
    ok((AF.strike.notch ? AF.strike.notch.at > 0 && AF.strike.notch.at + AF.strike.notch.width < 1 && AF.strike.notch.width >= 0.18 && AF.strike.notch.width <= 0.22 : CLS.every((c) => Math.max(AF.strike.cleanMin, AF.strike.cleanFrac * SW[c]) < SW[c])) && AF.strike.clamp[0] <= SW.small && AF.strike.clamp[1] >= SW.legend, 'AUTOFISH.strike: the Clean part (under the loop the gauge\'s notch: 0.18–0.22 of the window, a little after its start) fits every window; the clamp holds every window');
    ok(AF.strike.grades.every((g) => g in CT.strike) && AF.strike.reference === CT.display.reference.strike, 'AUTOFISH.strike grades match CATCH_V3.strike; the log uses the reference strike');
    // items: every bait / lure target exists, every lure and non-legend bait has an entry
    const baitIds = new Set([...D.BAITS, ...D.WALK_BAITS].filter((b) => !b.legend).map((b) => b.id)), lureIds = new Set(D.LURES.map((l) => l.id));
    for (const [id, it] of Object.entries(CT.items)) {
      const real = it.kind === 'bait' ? baitIds.has(id) || id === 'cut_strip' : it.kind === 'lure' ? lureIds.has(id) : !!D.UPGRADE_BY_ID[id];
      ok(real, `CATCH_V3.items.${id}: no ${it.kind} with that id`);
      ok(Number.isFinite(it.hold ?? it.holdPerLevel) && (it.hold ?? it.holdPerLevel) > 0, `CATCH_V3.items.${id}: a positive Hold`);
      if (it.species) for (const sid of it.species) ok(!!byId[sid] && byId[sid].rarity !== 'legendary', `CATCH_V3.items.${id}: target ${sid} is not a species`);
      if (it.family) ok(D.FISH_FAMILIES.includes(it.family), `CATCH_V3.items.${id}: family ${it.family}`);
      ok(D.catchItemTargets(id).length > 0 || it.kind === 'upgrade' && SV.some((s) => s.family === it.family), `CATCH_V3.items.${id} helps no species`);
      for (const sid of D.catchItemTargets(id)) ok(!!byId[sid], `CATCH_V3.items.${id}: target ${sid} missing from SPECIES_V3`);
    }
    for (const l of D.LURES) ok(CT.items[l.id]?.kind === 'lure' && (!l.species || JSON.stringify(l.species) === JSON.stringify(CT.items[l.id].species)), `lure ${l.id}: a CATCH_V3 item with the same targets`);
    for (const id of baitIds) ok(CT.items[id]?.kind === 'bait', `bait ${id}: no CATCH_V3 item (every bait helps something)`);
    ok(Object.values(CT.items).filter((it) => it.all).length === 1 && CT.items.shimmerfly.all, 'exactly one global bait (Shimmerfly); everything else is fish-specific');
    for (const id of CT.fouledSpecies) ok(!!byId[id], `CATCH_V3.fouledSpecies: ${id}`);
    for (const s of SV.filter((x) => x.rarity === 'legendary')) ok(Number.isFinite(CT.legend.fight[s.id]) && D.FISH_STYLES.includes(CT.legend.style[s.id]), `CATCH_V3.legend: ${s.id} has a Fight and a style`);
    for (const lake of Object.keys(CT.lake)) ok(lake === 'cove' || LAKES.includes(lake), `CATCH_V3.lake: ${lake}`);
    for (const id of Object.keys(CT.buffs.boons)) ok(D.BOONS.some((b) => b.id === id), `CATCH_V3.buffs.boons: ${id}`);
    for (const id of Object.keys(CT.buffs.relics)) ok(D.RELICS_V3.some((r) => r.id === id) || D.RELICS.some((r) => r.id === id), `CATCH_V3.buffs.relics: ${id}`);
    for (const id of Object.keys(CT.buffs.wicks)) ok(D.CHARACTERS.some((c) => c.id === id), `CATCH_V3.buffs.wicks: ${id}`);
    for (const id of AF.strike.windowBuffs) ok(D.BOONS.some((b) => b.id === id) || D.RELICS_V3.some((r) => r.id === id) || !!D.UPGRADE_BY_ID[id], `AUTOFISH.strike.windowBuffs: ${id}`);
    // never 100%: no tackle, item, strike, buff, Marked Fish or wound reaches a cap, anywhere
    { let worst = 0, who = '';
      for (const s of SV) for (const c of [...CLS, 'legend']) for (const it of [null, ...Object.keys(CT.items)]) {
        const q = D.catchParts(s, c, { ...TT(4), item: it, itemLevel: 3 }, { strike: 'clean', buffs: 99, marked: true, wounds: 99 });
        if (q && q.p / q.cap > worst) { worst = q.p / q.cap; who = `${s.id} ${c}${it ? ` + ${it}` : ''} ${(q.p * 100).toFixed(3)}%`; }
        if (q) ok(q.p < q.cap && q.p < 1 && D.catchDisplay(q.p) < q.cap * 100, `never 100%: ${s.id} ${c}${it ? ` + ${it}` : ''} reaches its cap`);
      }
      checks++; if (process.argv.includes('--verbose')) console.log(`  catch: closest to a cap ${who}`); }
    // the targets (CATCH_V3.targets)
    const G = CT.targets;
    { let e0 = 0, who = '';
      for (const s of SV) if (D.catchClassAllowed(s, 'elder')) for (const it of [null, ...Object.keys(CT.items).filter((k) => CT.items[k].kind !== 'upgrade')]) {
        const p = D.catchChance(s, 'elder', { ...TT(0), item: it }, { strike: 'struck' }); if (p > e0) { e0 = p; who = `${s.id}${it ? ` + ${it}` : ''}`; } }
      ok(e0 <= G.elderT0Max, `every Elder at matched T0 (reference strike, no buffs, any one bait or lure) ≤ ${G.elderT0Max * 100}%: ${who} ${(e0 * 100).toFixed(1)}%`); }
    { const c0 = SV.filter((s) => s.zone === 'mossmere' && s.rarity === 'common').flatMap((s) => ['small', 'keeper'].map((c) => D.catchChance(s, c, TT(0))));
      ok(c0.every((p) => p >= G.commonsT0[0] && p <= G.commonsT0[1]), `Mossmere commons on T0 land ${G.commonsT0.join('–')} (never boring, never guaranteed): ${c0.map((p) => p.toFixed(2)).join(' ')}`); }
    const REF = Object.values(D.TACKLE.reference), rel = (n) => ({ buffs: G.relicHoldByTier[n] });
    for (const id of REF.slice(0, 2)) ok([0, 1, 2].every((n) => D.catchChance(id, 'elder', TT(n), rel(n)) <= G.headlineElderEarlyMax), `${id}: its Elder stays ≤ ${G.headlineElderEarlyMax * 100}% on T0–T2 with that tier's relics (Q3, hard until late tackle)`);
    REF.forEach((id, i) => {
      const p4 = D.catchChance(id, 'elder', { ...TT(4), item: D.catchBestItem(byId[id]).id }, rel(4)), band = i < 3 ? G.headlineElderT4Item : G.deepHeadlineT4Item;
      ok(p4 >= band[0] && p4 <= band[1], `${id}: its Elder on T4 with its best item and T4's relics ${(p4 * 100).toFixed(0)}% (target ${band.map((x) => x * 100).join('–')}%${i === 3 ? ': the hardest regular fish, on purpose' : ''})`);
    });
    ok(SV.every((s) => !D.catchClassAllowed(s, 'ancient') || D.catchChance(s, 'ancient', { ...TT(4), item: D.catchBestItem(s).id }, { strike: 'clean', buffs: 99, marked: true }) < G.ancientMax), `no Ancient ever lands ${G.ancientMax * 100}% or better`);
    ok(SV.filter((s) => s.rarity === 'legendary').every((s) => D.catchChance(s, 'legend', TT(4), { strike: 'clean', buffs: 99, wounds: 99 }) < G.legendMax), `no legend ever lands ${G.legendMax * 100}% or better`);
    { const q = D.catchChance('quayling', 'small', TT(0), { lake: 'cove' }); ok(q >= G.tutorial[0] && q <= G.tutorial[1], `the tutorial Quayling (Small, T0, struck) ${(q * 100).toFixed(1)}% (${G.tutorial.join('–')}): likely, never certain`); }
    ok(D.catchChance('quayling', 'prize', TT(4)) === null && D.catchChance('lampwarden_angler', 'elder', TT(4)) === null && D.catchOdds('belled_matriarch', TT(0)).legend > 0, 'catchChance: out-of-reach classes are null; legends have one row');
    ok(D.catchDisplay(0.94999) === 94 && D.catchDisplay(null) === null, 'the logs round down (a cap is never printed)');
    ok(Object.values(CT.economy.norm).every((v) => v > 0.5 && v <= 1) && CT.economy.norm.cove === 1, 'CATCH_V3.economy.norm in (0.5, 1] per lake');
    ok(AF.rating.words.every(([t], i, a) => i === 0 || t < a[i - 1][0]) && AF.rating.words.at(-1)[0] === 0, 'AUTOFISH.rating words: descending thresholds down to 0');
    for (const z of LAKES) { const r = D.catchRating(z, TT(4)); ok(r && r.held && typeof (r.word ?? '') === 'string', `catchRating(${z}, T4) names a class held`); }
    // the play: class bands rise and never overlap; every loss lands in the second half
    ok(CLS.every((c, i) => AF.play[c].dur[0] < AF.play[c].dur[1] && (i === 0 || AF.play[c].dur[0] >= AF.play[CLS[i - 1]].dur[1])) && AF.play.legend.dur[0] >= AF.play.ancient.dur[1], 'AUTOFISH.play: durations rise with class and never overlap (class and z only)');
    ok(Object.values(AF.loss.at).every(([a, b]) => a >= AF.loss.minAt && b <= 0.97 && a < b), `AUTOFISH.loss: every cause lands at ≥ ${AF.loss.minAt} of the play (the first half is outcome-blind)`);
    for (const st of D.FISH_STYLES) { const w = AF.loss.byStyle[st]; ok(w && within(Object.values(w).reduce((a, b) => a + b, 0), 1, 1e-9) && Object.keys(w).every((k) => k in AF.loss.at), `AUTOFISH.loss.byStyle.${st}: weights sum to 1 over real causes`); }
    for (const c of CLS) ok(!!AF.loss.byClass[c] && !!AF.leap.perClassMax && c in AF.leap.perClassMax, `AUTOFISH: ${c} has loss and leap rules`);
    ok(Object.keys(AF.loss.hint).every((k) => k in AF.loss.at || AF.loss.external.includes(k)) && Object.values(AF.loss.hint).every((h) => h === null || h in AF.text.hint), 'every loss cause maps to a gear hint the text has');
    // leaps: real species, sane values, several leapers per lake, and the ambiguity rule over every phase's roster
    for (const [id, v] of Object.entries(AF.leaps)) {
      const s = byId[id];
      ok(!!s && s.rarity !== 'legendary' && !s.cove && D.catchClassAllowed(s, 'keeper'), `AUTOFISH.leaps.${id}: a non-legendary lake species that can reach Keeper`);
      ok(typeof v === 'number' && v > 0 && v <= 1, `AUTOFISH.leaps.${id}: one chance per play in (0, 1] (counts and windows are class-level, never per species)`);
    }
    ok(AF.leap.when.length === 2 && AF.leap.when[0] > 0 && AF.leap.when[1] < 1 && AF.leap.when[0] < AF.leap.when[1], 'AUTOFISH.leap.when: one window inside the play for every leaper');
    for (const [cls, dist] of Object.entries(AF.leap.count)) ok(within(dist.reduce((a, [, p]) => a + p, 0), 1, 1e-9) && dist.every(([n]) => Number.isInteger(n) && n >= 1 && n <= AF.leap.perClassMax[cls]), `AUTOFISH.leap.count.${cls}: a distribution over 1…${AF.leap.perClassMax[cls]} leaps`);
    ok(!('small' in AF.leap.count) && AF.leap.perClassMax.small === 0 && AF.leap.silhouette.mesh === 'proxy' && AF.leap.silhouette.length === 'presentLength', 'a leap is the proxy at presentLength (never the species outline); Small fish never leap');
    for (const z of LAKES) { const n = SV.filter((s) => (s.zone === z || (s.zones || []).includes(z)) && AF.leaps[s.id]).length; ok(n >= AF.leapRule.minLeapersPerLake, `${z}: ${n} species can leap (≥ ${AF.leapRule.minLeapersPerLake}), so a leap never pins one`); }
    { const { leapCells } = await import('./sim/catch-v3.mjs');
      const walkPlaces = new Set(Object.values(D.ARENA_V2).flatMap((a) => (a.places || []).map((p) => p.id)));
      const { biteCells, signCells } = await import('./sim/catch-v3.mjs');
      let cells = 0, bites = 0, fallbacks = 0, signs = 0; const usedAcc = new Set();
      for (const walk of [false, true]) for (let P = 1; P <= 4; P++) {
        const roster = SV.filter((s) => (s.src === 'walk' ? walk : s.phase <= P) && (walk || !(s.src === 'walk' || (s.place && walkPlaces.has(s.place)))));
        for (const c of leapCells(roster, { walk })) { cells++; ok(c.ok, `leap ambiguity (P${P}${walk ? ' + §24' : ''}): ${c.label}: ${c.n} leaper(s), top ${(c.share * 100).toFixed(0)}% (${c.split})`); }
        for (const c of biteCells(roster, { walk })) { bites++; if (c.accepted) usedAcc.add(AF.biteRule.accepted.find((a) => c.label.startsWith(`${a.cell} · `)).cell); ok(c.ok, `bite ambiguity (P${P}${walk ? ' + §24' : ''}): ${c.label}: ${c.n} species, top ${(c.share * 100).toFixed(0)}% (${c.split}); fix the pool or accept it by name in AUTOFISH.biteRule.accepted`); }
        for (const c of signCells(roster)) { signs++; if (!c.ok) fallbacks++; }
      }
      for (const a of AF.biteRule.accepted) ok(typeof a.reason === 'string' && a.reason.length > 10 && usedAcc.has(a.cell), `AUTOFISH.biteRule.accepted: ${a.cell} is a real failing cell in some phase's roster, with a reason (remove it once fixed)`);
      if (process.argv.includes('--verbose')) console.log(`  leaps: ${cells} cells, bites: ${bites} cells over 8 rosters; signs: ${fallbacks} of ${signs} tilted cells pre-roll from the blind pool (AUTOFISH.signRule)`); }
    // presentation data: one proxy for every species, the got-away note after the loss
    ok(AF.proxy.aspect > 0 && AF.proxy.length === 'class' && AF.proxy.oneMesh && AF.proxy.light === false && AF.proxy.wake === 'plain', 'AUTOFISH.proxy: one generic unlit night-ink shape, its length by class (never true length before the reveal), a plain wake');
    { const zs = []; for (let z = D.BALANCE_V3.size.z.min; z <= D.BALANCE_V3.size.z.max + 1e-9; z += 0.01) zs.push(z);
      for (const lake of [...LAKES, 'cove']) { const L = zs.map((z) => D.presentLength(lake, z)); ok(L.every((v, i) => i === 0 || v > L[i - 1] - 1e-12), `presentLength(${lake}, z) rises with z (bigger always looks bigger)`); }
      ok(D.presentLength.length === 2, 'presentLength(lake, z) takes no species: length before the reveal can never name one');
      ok(LAKES.every((l) => D.presentLength(l, D.BALANCE_V3.size.ancient) > 2.6), "an Ancient's pass is longer than the raft (2.6 m) in every lake"); }
    ok(AF.letPass.classes.every((c) => CLS.includes(c)) && AF.letPass.lingers > 0 && AF.letPass.rebite > 0 && AF.letPass.rebite < 1 && AF.letPass.once, 'AUTOFISH.letPass: a passed Prize+ fish lingers once');
    // no cut (the user's decision 3, DESIGN §25.0.2c): fully automatic after the strike; the anchor replaces the leash in every mode
    { const IN = AF.play.inputs, AN = AF.play.anchor;
      ok(!('cut' in IN) && IN.endsEarly === false && Object.keys(IN).every((k) => ['pan', 'hurry', 'endsEarly'].includes(k)) && IN.hurry.classes.every((c) => ['small', 'keeper'].includes(c)),
        'AUTOFISH.play.inputs: pan and hurry only; no cut, and no input ends a play early');
      ok(isObj(AN) && AN.from === 'strike' && JSON.stringify(AN.states) === '["reeling","landing","lost"]' && JSON.stringify(AN.modes) === '["still","lantern","gloomtide"]' && AN.hub === true
        && AN.moveInput === 'ignored' && AN.buffered === false && AN.combatMoves === false && AN.towOnly === true && AN.gloomtide?.slamPartsLine === true && AN.gloomtide.knockback === false,
        'AUTOFISH.play.anchor: the raft is anchored from the strike to the card or the note in every mode and in the hub; only the play\'s tow moves it; Gloomtide\'s slam parts the line');
      ok(JSON.stringify(AF.loss.external) === '["staggered"]' && D.CATCH_V3.gloomtide.slamPartsLine === true, "the one event that ends a play outside the roll is Gloomtide's hand slam ('staggered')");
      const cutKey = (o, path) => { if (!o || typeof o !== 'object') return []; return Object.entries(o).flatMap(([k, v]) => [...(/^cut(Marks|Hold)?$|^fromCut$/.test(k) ? [`${path}.${k}`] : []), ...cutKey(v, `${path}.${k}`)]); };
      const cuts = [...cutKey(AF, 'AUTOFISH'), ...cutKey(D.BALANCE_V3.markedFish, 'BALANCE_V3.markedFish'), ...cutKey(D.FIRST_EVENING, 'FIRST_EVENING')];
      ok(cuts.length === 0, `no cut anywhere in automatic fishing's data (the user's decision 3): ${cuts.join(', ')}`); }
    ok(CLS.every((c) => Array.isArray(AF.play.scare[c]) && AF.play.scare[c][0] <= AF.play.scare[c][1]) && AF.loss.onScare > 0 && AF.loss.onScare < 1 && JSON.stringify(AF.loss.draws) === '["planSeed","u","causeU","momentU"]', 'AUTOFISH: scares by class, losses on a scare, the unconditional draw order');
    ok(AF.gotAway.toast.includes('prize') && AF.gotAway.markedFrom.openWater === 'elder' && AF.gotAway.markedFrom.place === 'trophy' && D.V3_BLOCK_PHASE.markedFish === 1, 'got-away: Prize losses toast, open-water Marked Fish from Elder up (places from Trophy); the light Marked Fish ships at phase 1');
    ok(D.TACKLE.lostLureFrac === 0 && AF.runLures.priceMult === 0.4 && AF.runLures.phases.join() === '1,2', 'a snapped line never loses a lure; P1–P2 runs sell lures at 40%');
    // D1′ (the AF build's data): the manual reel's data is gone from the v3 build; its tips moved; Well-fed is +2 Hold; no v3 effect names a dead reel stat
    { const T3 = D.TEXT_V3, tipIds = D.TIPS_V3.map((t) => t.id), AFT = ['af_changed', 'af_letpass', 'af_strikeReminder', 'af_hurry'];
      ok(!('tips' in AF.text) && ['nearMiss', 'causes', 'tips'].every((k) => !(k in T3)), 'AUTOFISH.text.tips and TEXT_V3.nearMiss / causes / tips are retired (the tips live in TIPS_V3)');
      ok(AFT.every((id) => { const t = D.TIPS_V3.find((x) => x.id === id); return t && t.phase === 1 && t.trigger === `tip:show:${id}` && isStr(t.text); }) && AFT.every((id) => D.TIPS.some((t) => t.id === id)),
        'the automatic-fishing tips are directed TIPS_V3 entries (trigger tip:show:<id>, phase 1), so a build without the AF code never shows them');
      ok(new Set(tipIds).size === tipIds.length, 'TIPS_V3 ids are unique');
      ok(JSON.stringify(D.BALANCE.wellFed.effects) === JSON.stringify({ hold: CT.buffs.wellFed }) && !('hold' in D.STATS), 'Well-fed is +2 Hold (a run buff through getCatchBuffs; not a STATS key)');
      const dead = D.DESC_V3.deadStats, hits = [];
      for (const [name, list] of [['BOONS', D.BOONS], ['RELICS', D.RELICS], ['UPGRADES', D.UPGRADES], ['CHARACTERS', D.CHARACTERS], ['OUTFIT', D.OUTFIT]]) for (const x of list) for (const k of dead) if (k in (x.effects || {})) hits.push(`${name}.${x.id}.${k}`);
      for (const [k, p] of Object.entries(D.JOURNAL_PERKS || {})) for (const st of dead) if (st in (p.effects || {})) hits.push(`JOURNAL_PERKS.${k}.${st}`);
      ok(hits.length === 0, `no v3 effect names a reel stat v3 fishing never reads (${dead.join(', ')}): ${hits.join(', ')}`);
      const reelWords = /reel speed|reel \d+% faster|line strength|sweet band|sweet zone|slack grace|slack line|tension/i, words = [];
      for (const [name, list] of [['BOONS', D.BOONS], ['RELICS', D.RELICS], ['UPGRADES', D.UPGRADES], ['CHARACTERS', D.CHARACTERS]]) for (const x of list) for (const t of [x.desc, x.fishing?.desc, x.quirk?.desc]) if (typeof t === 'string' && reelWords.test(t)) words.push(`${name}.${x.id}`);
      ok(words.length === 0, `no v3 Boon, relic, per-run tackle or Wick text names a manual-reel stat: ${words.join(', ')}`);
      for (const [id, b] of Object.entries(CT.buffs.boons)) ok(D.BOON_BY_ID[id] && /Hold/.test(D.BOON_BY_ID[id].desc), `Boon ${id} says what Hold it gives`);
      ok(/Hold/.test(D.CHARACTER_BY_ID.ashwick.fishing.desc) && D.CHARACTER_BY_ID.ashwick.fishing.firstHookHold === CT.buffs.wicks.ashwick.hold, "Ashwick's Burned Once gives +3 Hold on the first fish hooked each night"); }
    ok(AF.gotAway.estimate === 0.08 && D.BALANCE_V3.records.escapeEstimate === AF.gotAway.estimate, 'the got-away length estimate is ±8% (§25.7.4)');
    // ---- the show (AUTOFISH.show; docs/v3/show/SPEC.md): the Wick presents the fish to the lens, a still pause, then the card
    { const SH = AF.show, SC = D.SHOW_CLASSES, POSES = ['pinch', 'both', 'hug', 'hang', 'alongside'];
      ok(isObj(SH) && JSON.stringify(SH.phases) === '["reveal","lift","hold","pause","card"]' && JSON.stringify(SC) === JSON.stringify(CLS), 'AUTOFISH.show: phases reveal → lift → hold → pause → card; one row per size class and the Ancient');
      const plans = Object.fromEntries(SC.map((c) => [c, D.showPlan(c)]));
      for (const [i, c] of SC.entries()) {
        const B = SH.beats[c], P = plans[c];
        ok(isObj(B) && B.lift > 0 && B.hold > 0 && B.pause >= SH.minPause, `AUTOFISH.show.beats.${c}: lift, hold and a pause of at least ${SH.minPause} s`);
        ok(isObj(AF.landing[c]) && within(P.reveal + B.lift + B.hold + B.pause, P.total, 2e-3), `AUTOFISH.show: ${c} has a landing row; showPlan adds up`);
        ok(Math.abs(P.total - SH.about[c]) <= SH.tolerance + 1e-9 && P.total <= SH.max[c] + 1e-9, `AUTOFISH.show: ${c} runs ${P.total} s from the fish clearing the water to the card (about ${SH.about[c]}, never over ${SH.max[c]})`);
        ok(within(AF.time.ceremony[c], P.total, 0.02), `AUTOFISH.time.ceremony.${c} ${AF.time.ceremony[c]} must be the show's ${P.total} s (the catch sim's time model)`);
        if (i) ok(P.total >= plans[SC[i - 1]].total && B.lift >= SH.beats[SC[i - 1]].lift && SH.max[c] >= SH.max[SC[i - 1]], `AUTOFISH.show: ${c} is never quicker than ${SC[i - 1]} (a small fish is quick, the biggest takes its time)`);
        // the hurry: a tap from T0 gets to the card sooner, the protected hold stays, the reveal is never cut
        const H = D.showPlan(c, { hurried: true }), HP = D.showPlan(c, { hurried: true, protected: true });
        ok(H.total < HP.total && HP.total < P.total && within(H.reveal, P.reveal, 1e-9) && HP.hold >= SH.hurry.protectedHold - 1e-9, `AUTOFISH.show.hurry: ${c} hurried ${H.total} s < protected ${HP.total} s < ${P.total} s; the reveal whole`);
        // the swarm window: every class plays the short variant
        ok(within(D.showPlan(c, { swarm: true }).show, D.BALANCE_V3.ceremony.cinematic.duringSwarm, 1e-9), `AUTOFISH.show.swarm: ${c} holds the arena hidden for ${D.BALANCE_V3.ceremony.cinematic.duringSwarm} s after the reveal, as today`);
        // weight and life
        const Lf = SH.life[c];
        ok(isObj(Lf) && Lf.overshoot > 0 && Lf.overshoot <= 0.25 && Array.isArray(Lf.twitch) && Lf.twitch[0] > SH.life.pauseStill && Lf.twitch[1] > 0 && Lf.drips > 0 && Lf.strain >= 0 && Lf.strain <= 1 && Lf.dip >= 0 && Lf.dip <= 0.1 && Lf.flame > 0,
          `AUTOFISH.show.life.${c}: an overshoot, a twitch livelier than the pause's still, drips, strain 0–1, a dip of at most 0.1 m, a proud flame`);
        ok(SH.life.firstFlap > 0 && SH.life.firstFlap < B.hold && (CLS.indexOf(c) < 4 || SH.life.firstFlap + Lf.twitch[1] < B.hold), `AUTOFISH.show.life: ${c} flaps in its hold (twice for an Elder or bigger)`);
        if (i) { const Pv = SH.life[SC[i - 1]]; ok(Lf.overshoot <= Pv.overshoot && Lf.strain >= Pv.strain && Lf.dip >= Pv.dip && Lf.flame >= Pv.flame && Lf.drips >= Pv.drips && Lf.twitch[1] >= Pv.twitch[1], `AUTOFISH.show.life: ${c} is heavier than ${SC[i - 1]} (less overshoot, more strain, dip, flame and drips, slower flaps)`); }
        // the camera has arrived by the present: a critically damped spring has (1 + x)·e^−x < 5 % of its travel left at x = ω·t ≥ 4.75
        ok(SH.camera.settle[c] * (P.reveal + B.lift) >= 4.75, `AUTOFISH.show.camera.settle.${c}: ω ${SH.camera.settle[c]} × ${(P.reveal + B.lift).toFixed(2)} s must reach 4.75 (the lens has arrived when the fish is presented)`);
      }
      ok(SH.max.small <= 2.5 && SH.max.keeper <= 2.5 && SH.max.ancient <= 6 && SH.about.small <= 2 && SH.about.keeper <= 2 && SH.minPause >= 0.6, 'AUTOFISH.show: a Small or a Keeper never over 2.5 s, nothing over 6 s, the pause at least 0.6 s');
      ok(within(SH.swarm.lift + SH.swarm.hold + SH.swarm.pause, D.BALANCE_V3.ceremony.cinematic.duringSwarm, 1e-9) && SH.swarm.pause >= SH.minPause, 'AUTOFISH.show.swarm: lift + hold + pause = BALANCE.ceremony.cinematic.duringSwarm, its pause still a pause');
      ok(SH.hurry.from === 'T0' && SH.hurry.cutsReveal === false && SH.hurry.liftRate > 1 && SH.hurry.hold > 0 && SH.hurry.hold < SH.hurry.protectedHold && SH.hurry.protectedHold >= 0.8 && SH.hurry.protectedHold <= 1 && JSON.stringify(SH.hurry.protected) === '["isNew","pb"]',
        'AUTOFISH.show.hurry: a tap hurries from T0, never cuts the reveal, and a first-ever species or a personal best is held at least 0.8 s');
      ok(within(AF.player.tapTo, (D.showPlan('small', { hurried: true }).total + D.showPlan('keeper', { hurried: true }).total) / 2, 0.1), `AUTOFISH.player.tapTo ${AF.player.tapTo} must be the hurried Small / Keeper show (${D.showPlan('small', { hurried: true }).total} / ${D.showPlan('keeper', { hurried: true }).total} s)`);
      ok(SH.valve > Math.max(...Object.values(SH.max)) && SH.valve <= 12, 'AUTOFISH.show.valve: past the longest show, well inside main\'s cinematic valve');
      ok(SH.at.measure === 'present' && SH.at.climax === 'present' && SH.at.cinematicFrom === 'caught' && SH.at.cinematicTo === 'card', 'AUTOFISH.show.at: records and the climax at the present; the world frozen from fishing:caught to the card (as the ceremony froze it)');
      // poses: by true length, then class and shape
      ok(JSON.stringify(SH.poses.map((p) => p.id)) === JSON.stringify(POSES) && SH.poses.every((p, i, a) => p.below > 0 && (i === 0 || p.below > a[i - 1].below)) && SH.poses.at(-1).below === Infinity, 'AUTOFISH.show.poses: pinch < both < hug < hang < alongside by length');
      ok(POSES.every((p) => typeof SH.poseNames[p] === 'string' && /^show[A-Z]/.test(SH.poseNames[p]) && isObj(SH.grip[p]) && isObj(SH.camera.pose[p])) && new Set(Object.values(SH.poseNames)).size === POSES.length, 'AUTOFISH.show: every pose has an actors name, a grip and a camera row');
      ok(SC.includes(SH.poseRules.noPinchFrom) && SC.includes(SH.poseRules.noHugFrom) && SH.poseRules.legend === 'alongside' && SH.poseRules.thin.every((sh) => D.FISH_SHAPES_V3.includes(sh)) && ['both', 'hang'].includes(SH.poseRules.thinDrape), 'AUTOFISH.show.poseRules: real classes and shapes; every legend lies alongside');
      ok(D.showPoseFor(0.08, { sizeClass: 'small' }) === 'pinch' && D.showPoseFor(0.2, { sizeClass: 'trophy' }) === 'both' && D.showPoseFor(0.6, { sizeClass: 'keeper' }) === 'both' && D.showPoseFor(1.2, { sizeClass: 'trophy', shape: 'pike' }) === 'hug'
        && D.showPoseFor(1.2, { sizeClass: 'elder', shape: 'pike' }) === 'hang' && D.showPoseFor(1.2, { sizeClass: 'keeper', shape: 'eel' }) === 'both' && D.showPoseFor(1.2, { sizeClass: 'elder', shape: 'eel' }) === 'hang' && D.showPoseFor(1.7, { sizeClass: 'keeper', shape: 'eel' }) === 'hang' && D.showPoseFor(1.2, { sizeClass: 'elder', ancient: true }) === 'hang'
        && D.showPoseFor(2.6, { sizeClass: 'elder' }) === 'alongside' && D.showPoseFor(0.5, { legend: true }) === 'alongside' && D.showPoseFor(9, { legend: true }) === 'alongside', 'data.showPoseFor: the ladder and its three rules');
      { const seen = new Set(); let n = 0;
        for (const sp of SV) for (const c of CLS) {
          const legend = sp.rarity === 'legendary';
          if (!legend && !D.catchClassAllowed(sp, c)) continue;
          const z = { small: -1.2, keeper: 0.4, prize: 1.45, trophy: 2.25, elder: 2.9, ancient: 3.4 }[c];
          const L = D.sizeLength(sp, legend ? 1 : z) / 100;
          const pose = D.showPoseFor(L, { sizeClass: c === 'ancient' ? 'elder' : c, ancient: c === 'ancient', legend, shape: sp.model?.shape });
          seen.add(pose); n++;
          ok(POSES.includes(pose) && (legend ? pose === 'alongside' : true) && !(pose === 'pinch' && CLS.indexOf(c) >= 3) && !(pose === 'hug' && (CLS.indexOf(c) >= 4 || sp.model?.shape === 'eel')) && !(pose !== 'alongside' && pose !== 'hang' && L >= 1.5),
            `show pose: ${sp.id} ${c} (${L.toFixed(2)} m) → ${pose}`);
        }
        ok(seen.size === POSES.length && n > 250, `the roster uses every show pose (${[...seen].join(', ')}; ${n} species × class cells)`); }
      // the grips, the facing and the camera
      ok(SH.grip.pinch.hands === 1 && SH.grip.pinch.reachTiny > SH.grip.pinch.reach && SH.grip.pinch.reach >= 0.2 && SH.grip.pinch.tinyBelow < SH.poses[0].below && SH.grip.both.hands === 2 && SH.grip.both.reach >= 0.15 && SH.grip.hug.tail === 'deck' && SH.grip.hug.tilt > 45 && SH.grip.hug.tilt < 90
        && SH.grip.hang.rod === 'raised' && SH.grip.alongside.stand === true && SH.grip.alongside.flankUp >= 30, 'AUTOFISH.show.grip: one hand held out to the lens (a tiny fish further) · both hands forward · hugged, tail on the deck · hung from the raised rod · standing beside an alongside fish');
      ok(SH.facing.faceWithin > 0 && SH.facing.faceWithin <= 20 && SH.facing.flankWithin > 0 && SH.facing.flankWithin <= 20 && Object.values(SH.facing.threeQuarter).every((a) => a > 0 && a <= 40), 'AUTOFISH.show.facing: the Wick to the lens, the flank square to it');
      for (const p of POSES) { const Cp = SH.camera.pose[p]; ok(Cp.elev >= 0 && Cp.elev <= 30 && Cp.fov >= 36 && Cp.fov <= 56 && Cp.fovPortrait >= Cp.fov && Cp.fovPortrait <= 70 && ['fish', 'head', 'flame'].every((k) => Cp.keep.includes(k)), `AUTOFISH.show.camera.pose.${p}: a near-level lens, a fov of 36–56° (to 70° upright), the fish, the head and the flame always kept in frame`); }
      ok(SH.camera.settleSwarm * (plans.small.reveal + SH.swarm.lift) >= 4.75, 'AUTOFISH.show.camera.settleSwarm: the lens has arrived by the present in a swarm window too');
      ok(SH.camera.from === 'T0' && SH.camera.margin.landscape > 0 && SH.camera.margin.landscape <= 0.15 && SH.camera.margin.portrait > 0 && SH.camera.margin.portrait <= 0.15 && SH.camera.minLens >= 0.3 && SH.camera.still > 0 && SH.camera.still <= 0.05 && SH.camera.out > 0
        && SH.camera.pose.alongside.rakeAbove > SH.poses.at(-2).below && SH.camera.pose.alongside.rake > 0 && SH.camera.pose.alongside.rake <= 65 && SH.camera.pose.alongside.craneElev > SH.camera.pose.alongside.elev,
        'AUTOFISH.show.camera: takes over at T0, safe margins, never nearer than the near plane allows, still in the pause; a long alongside fish is craned over and, upright, raked');
      ok(SH.card.opensFrom === 'fish' && SH.card.unfold > 0 && SH.card.unfold <= 0.5 && SH.card.knots.every((k) => AF.ceremony.cordMarks.includes(k)) && SH.card.stampAt >= SH.card.count, 'AUTOFISH.show.card: unfolds from the held fish; the count, then the stamp; your best and the Old Ledger as knots');
      ok(Object.values(SH.sound).every((v) => typeof v === 'string' && v.length) && SH.hud === 'hiddenFromT0', 'AUTOFISH.show: named sounds; nothing over the picture from T0');
      // lane B's own numbers (the fit's room, the target's springs, the present's kick, the card's count, the glory on the picture)
      { const Cm = SH.camera, G = AF.landing.show, minHold = Math.min(...SC.map((c) => SH.beats[c].hold), SH.swarm.hold);
        ok(Cm.headroom >= 0 && Cm.footroom >= 0 && Cm.margin.landscape + Math.max(Cm.headroom, Cm.footroom) <= 0.2 && Cm.flameTip >= 0 && Cm.flameTip <= 1.5 && Cm.finRoom >= 1 && Cm.finRoom <= 2,
          'AUTOFISH.show.camera: room over the flame and under the hands inside a fifth of the frame; the fish\'s box a little wider than its named points');
        ok(Cm.follow > 0 && Cm.followStill >= Cm.follow && Cm.settleAfter >= 0 && Cm.settleAfter < minHold && Cm.settleBefore > 0 && Cm.followStill * Cm.settleBefore >= 4,
          'AUTOFISH.show.camera: the fitted target is frozen before the pause and carried stiffly enough to be at rest when it begins');
        ok(Cm.outPerM >= 0 && Cm.outPerM <= 0.1 && Cm.out >= 1.2 && Cm.out <= 1.6 && Cm.behindCard.landscapeSide >= 0 && Cm.behindCard.landscapeSide <= 0.6, 'AUTOFISH.show.camera: the way back to play is about a second and a half (a little longer from far off), never a whip; a wide screen\'s card leaves the picture at least two fifths of the frame');
        ok(Cm.presentKick > 0 && Cm.presentKick <= 1 && Cm.presentBloom > 0 && Cm.presentBloom <= 1 && Cm.breath >= 0 && Cm.breath <= 0.5 && Math.abs(AF.landing.ancient.pull) * Cm.breath <= Cm.margin.landscape,
          'AUTOFISH.show.camera: at the present the kick and the bloom are no bigger than the landing\'s, and an Elder\'s breath out stays inside the margin');
        ok(SH.card.countFrom >= 0 && SH.card.countFrom + Math.max(SH.card.stampAt, SH.card.count) <= AF.time.card * 0.6, 'AUTOFISH.show.card: the count and the stamp are over well inside the card\'s 2 s of the time model');
        ok(isObj(G) && G.size > 0.5 && G.size <= 2 && G.perGlory >= 0 && G.strength > 0 && G.strength + G.perGloryStrength * AF.landing.ancient.glory + AF.landing.ancient.gloryBright <= 1 && G.rise > 0 && G.rise < Math.min(...SC.map((c) => SH.beats[c].hold))
          && G.holdShare >= 0 && G.holdShare <= 1 && G.fadePause > 0 && G.fadePause <= 1 && G.back > 0, 'AUTOFISH.landing.show: the glory sized to the picture, never over full strength, risen inside the shortest hold and gone by the card'); } }
    // every player-facing string of automatic fishing and the First Evening: one line (≤ 90), no %, no exclamation mark
    const strs = []; const walkS = (v, path) => { if (typeof v === 'string') strs.push([v, path]); else if (v && typeof v === 'object') for (const [k, c] of Object.entries(v)) walkS(c, `${path}.${k}`); };
    walkS(AF.text, 'AUTOFISH.text'); walkS(FE.text, 'FIRST_EVENING.text'); walkS(FE.tips, 'FIRST_EVENING.tips');
    for (const [v, path] of strs) ok(v.length <= FE.lines.maxChars && !v.includes('%') && !v.includes('!'), `${path}: "${v.slice(0, 60)}" must be ≤ ${FE.lines.maxChars} characters with no % and no "!"`);
    // the First Evening
    ok(FE.steps.length === new Set(FE.steps).size && FE.steps.every((st) => st in FE.stepSec) && FE.steps[0] === 'framing' && FE.steps.at(-1) === 'setout', 'FIRST_EVENING.steps: unique, timed, framing → setout');
    { const sum = FE.steps.reduce((a, st) => a + FE.stepSec[st], 0); ok(within(sum, FE.budget.reference, 0.5) && sum <= FE.budget.targetMax && sum <= FE.budget.toLake && sum - FE.stepSec.setout <= FE.budget.toCard && FE.budget.slowReaderMax <= 90 && within(sum - FE.stepSec.framing, FE.budget.skipFraming, 0.5), `FIRST_EVENING: the reference player reaches the First Outing card in ${sum - FE.stepSec.setout} s (≤ ${FE.budget.toCard}) and the Mossmere in ${sum} s (≈ ${FE.budget.reference}, ≤ ${FE.budget.toLake}; slow reader < 90)`); }
    // every step fits its animation and its Murk line (2.4 s + 0.05 s per character): the director never cuts a line short
    { const hold = (t) => FE.lines.murkHold + FE.lines.murkPerChar * t.length;
      for (const st of FE.steps) {
        const m = FE.stepMurk[st], need = Math.max(FE.stepAnim[st] ?? 0, m ? m.at + hold(FE.text[m.key] ?? '') + (m.then ?? 0) : 0);
        ok(FE.stepSec[st] + 1e-9 >= need, `FIRST_EVENING.stepSec.${st} ${FE.stepSec[st]} s must fit its animation and Murk line (${need.toFixed(2)} s)`);
        if (m) ok(typeof FE.text[m.key] === 'string', `FIRST_EVENING.stepMurk.${st}: line ${m.key} exists`);
      }
      ok(!FE.stepMurk.strike && !FE.stepMurk.wait, 'no Murk line in the wait or strike steps (never in the strike window)'); }
    ok(FE.everyRun.murk.every((k) => typeof FE.text[k] === 'string') && typeof FE.text[FE.snuffed.line] === 'string' && typeof FE.text[FE.legacy.offer.text] === 'string' && typeof FE.text[FE.legacy.offer.dismiss] === 'string' && FE.everyRun.skippableAfterFirst && FE.shipsWith === 'AF',
      'FIRST_EVENING: every run sets out from the Landing (rotating Murk lines), a snuff cuts to the hearth, legacy saves get the offer ribbon; FE ships with AF');
    ok(!('murkFrontYard' in FE.text) && FE.waitTipOn === 'floatSettled' && FE.odds.glowUntil === 'logOpened' && FE.replay.writes === false, 'FIRST_EVENING polish: no front-yard line, the wait tip on the settled float, the log glyph glows until opened, a replay writes nothing');
    ok(['outcome', 'chance', 'sizeClass'].every((k) => FE.tutorialApi.rejects.includes(k) && !FE.tutorialApi.accepts.includes(k)), 'FIRST_EVENING: the tutorial can shorten waits, never pass an outcome, a class or a chance');
    ok(D.COVE.fishing.species.includes('quayling') && byId.quayling?.maxClass === 'keeper' && FE.text.lore.length === 3, 'FIRST_EVENING: the cove Quayling (≤ Keeper) and three lore lines');
    for (const id of FE.wake.coldCandles) ok(D.CHARACTERS.some((c) => c.id === id) || id === 'wayfarer', `FIRST_EVENING.wake.coldCandles: ${id}`);
    ok(FE.marksSeen.every((id) => D.TIPS.some((t) => t.id === id)), 'FIRST_EVENING.marksSeen names real tips');
    ok(D.COVE.v0.posts.some((p) => p.id === FE.gate.post), `FIRST_EVENING.gate.post ${FE.gate.post} is a Landing v0 post`);
  }

  // ---- cameras: every framing preset carries render's full parameter set
  for (const [k, c] of Object.entries(B3.cameras)) {
    if (['night', 'fishFallback', 'vista', 'title'].includes(k)) continue;
    const need = ['elev', 'aim', 'aimY', 'fov', 'ahead', 'stiff', ...(['trophy', 'hang'].includes(k) ? ['base', 'perM', 'min', 'max'] : ['dist'])];
    ok(need.every((q) => isNum(c[q])), `BALANCE.cameras.${k} needs ${need.filter((q) => !isNum(c[q])).join(', ')} (render's elev / dist / aim / aimY / fov / ahead / stiff)`);
    if (c.portrait) ok(['elev', 'dist', 'fov'].every((q) => isNum(c.portrait[q])), `BALANCE.cameras.${k}.portrait {elev, dist, fov}`);
  }
  ok(B3.cameras.night.follows === 'swarmActive' && B3.cameras.trophy.yawMax <= 35 && isObj(B3.cameras.title.orbit) && B3.cameras.title.orbit.arcDeg[1] - B3.cameras.title.orbit.arcDeg[0] < 180, 'the night camera follows the swarm, the trophy yaw is limited, the title arc stays south');
  { const cv = B3.cameras.cove, pitch = Math.atan((cv.dist * Math.sin(cv.elev * Math.PI / 180) - cv.aimY) / (cv.dist * Math.cos(cv.elev * Math.PI / 180) + cv.aim)) * 180 / Math.PI;
    ok(within(pitch, 16.2, 0.3) && pitch - cv.fov / 2 < -8, `the cove camera (render's model): pitch ${pitch.toFixed(1)}°, top of frame ${(cv.fov / 2 - pitch).toFixed(1)}° above horizontal (the arch, stones and legends in view)`); }

  // ---- the Landing's water side: v0 posts, the test buoy, the Set Out glide
  { const G = D.walkGridFor(C), RMk = WL.raftMask(G), slot = CA.moorings[0].slot;
    let sk = -1, sd = Infinity; for (let k = 0; k < G.n * G.n; k++) if (RMk[k]) { const [x, zz] = WL.cellXZ(G, k), dd = Math.hypot(x - slot.x, zz - slot.z); if (dd < sd) { sd = dd; sk = k; } }
    const RC2 = WL.component(G, RMk, sk);
    const raftCells = []; for (let k = 0; k < G.n * G.n; k++) if (RC2[k]) raftCells.push(WL.cellXZ(G, k));
    ok(raftCells.length > 0 && sd <= 2.5, `the cove: raft water within ${sd.toFixed(1)} m of the mooring slot`);
    for (const p of C.v0.posts) ok(raftCells.some(([x, zz]) => Math.hypot(x - p.x, zz - p.z) <= C.v0.range), `Landing v0: post ${p.id} (${p.x}, ${p.z}) is out of the raft's ${C.v0.range} m reach`);
    ok(C.v0.posts.every((p, i) => C.v0.posts.every((o, j) => i === j || near(p, o) >= 3)) && ['map_table', 'lectern', 'hearth', 'trials', 'gear_bench', 'shrine', 'pond', 'wall'].every((id) => C.v0.posts.some((p) => p.id === id)), 'Landing v0: one post per land station, ≥ 3 m apart');
    const head = { x: 4, z: 2 }, tb = C.testBuoy, ang = Math.atan2(tb.x - head.x, -(tb.z - head.z)) * 180 / Math.PI;
    ok(Math.abs(ang) <= 50 && near(head, tb) >= D.BALANCE.cast.minDist && near(head, tb) <= D.TACKLE.rod[0].castMax && near(tb, C.stations.find((x) => x.id === 'murk')) >= 4, `the test buoy is ${near(head, tb).toFixed(1)} m from the jetty head at ${ang.toFixed(0)}° from up-screen (≤ 50°, in cast range, clear of the barge)`);
    const segD = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(p.x - a[0] - t * dx, p.z - a[1] - t * dz); };
    const pathMin = (path, p) => Math.min(...path.slice(1).map((b, i) => segD(p, path[i], b)));
    const barge = C.stations.find((x) => x.id === 'murk'), rr = D.BALANCE.move.raftRadius;
    for (const [nm, path] of [['setOutPath', C.setOutPath], ['homeInPath', C.homeInPath]]) {
      ok(pathMin(path, barge) >= 2.3 + rr, `COVE.${nm} passes ${pathMin(path, barge).toFixed(1)} m from Murk's barge (≥ pad 2.3 + raft ${rr})`);
      ok(pathMin(path, tb) >= rr + 0.4, `COVE.${nm} clears the test buoy`);
      ok(C.waystones.every((w) => pathMin(path, w) >= 1.1 + 0.4), `COVE.${nm} threads the Waystone sill (≥ 1.5 m from every stone)`);
      ok(path.every(([x, zz]) => { const k = G.idx(x, zz); return k >= 0 && !(G.flags[k] & D.WALK_FLAGS.GROUND); }), `COVE.${nm} stays on water`);
    }
    const cross = C.setOutPath.find(([, zz]) => zz === C.archLineZ);
    ok(!!cross && cross[0] > legX[0] + 2 && cross[0] < legX[1] - 2, 'the Set Out glide crosses the arch line between its legs');
    ok(C.stations.filter((x) => x.opens === 'wall').length === 4 && C.stations.find((x) => x.id === 'raft').needs === 'pendingSetOut', 'four wall stations; Board needs a Set Out plan');
    // automatic fishing / First Evening review: the mooring slot clears the jetty, the cove is closed to the raft except by a glide
    ok(RMk[G.idx(slot.x, slot.z)] === 1 && C.setOutPath[0][0] === slot.x && C.setOutPath[0][1] === slot.z && C.homeInPath.at(-1)[0] === slot.x && C.stations.find((x) => x.id === 'raft').x === slot.x,
      `the raft's mooring slot (${slot.x}, ${slot.z}) clears the jetty by the raft radius (raft spawn in raft mode; the glides start and end there)`);
    { const CL = CA.closure, segs = [...CL.breakwaters.map((b) => [b.pts, b.w]), [CL.softWall.pts, 0]];
      const M2 = RMk.slice(); for (let k = 0; k < G.n * G.n; k++) if (M2[k]) { const [x, zz] = WL.cellXZ(G, k); if (segs.some(([pts, w]) => pathMin(pts, { x, z: zz }) < rr + w / 2 + 0.1)) M2[k] = 0; }
      const comp = WL.component(G, M2, sk); let north = 0, ex = null;
      for (let k = 0; k < G.n * G.n; k++) if (comp[k]) { const [x, zz] = WL.cellXZ(G, k); if (zz < C.archLineZ - 0.5) { north++; ex = ex || [x, zz]; } }
      ok(north === 0, `the cove is closed: no raft path from the mooring crosses the arch line except by the glide (${north} cells beyond, e.g. ${JSON.stringify(ex)}; COVE.arena.closure)`);
      ok(CL.softWall.pts.every(([x, zz], i) => zz === C.archLineZ && within(x, legX[i], 1e-9)) && CL.softWall.passes === 'glide', 'the soft wall spans the arch between its legs, on the arch line');
      const post = C.v0.posts.find((p) => p.id === D.FIRST_EVENING.gate.post); let pd = Infinity;
      for (let k = 0; k < G.n * G.n; k++) if (comp[k]) { const [x, zz] = WL.cellXZ(G, k); pd = Math.min(pd, Math.hypot(x - post.x, zz - post.z)); }
      ok(pd <= C.v0.range, `the Map Table post is ${pd.toFixed(1)} m from closed-cove raft water (≤ ${C.v0.range})`);
      // FE-T1: the Set Out auto-sail (FE-S1) from any closed-cove raft-water point within the post's reach: straight to each
      // FIRST_EVENING.gate.via point, then to joinAt; then the join into the glide (joinAt → COVE.setOutPath[glideFrom]). Every leg stays
      // on closed-cove raft water and clears the jetty, Murk's barge (pad 2.3 m) and the Waystones (r 1.1 m) by the raft radius + 0.3 m.
      const GT = D.FIRST_EVENING.gate, jetty = CA.walk.shapes.find((sh) => sh.id === 'cv_jetty'), need = rr + 0.3;
      const jettyD = (path) => { const [a, b] = jetty.pts; let m = Infinity; for (let i = 0; i <= 40; i++) { const t = i / 40; m = Math.min(m, pathMin(path, { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t }) - jetty.w / 2); } return m; };
      const onWater = (path) => path.slice(1).every(([bx, bz], i) => { const [ax, az] = path[i], L = Math.hypot(bx - ax, bz - az); for (let t = 0; t <= L; t += 0.25) { const k = G.idx(ax + (bx - ax) * t / L, az + (bz - az) * t / L); if (k < 0 || !comp[k]) return false; } return true; });
      const starts = []; for (let k = 0; k < G.n * G.n; k++) if (comp[k]) { const [x, zz] = WL.cellXZ(G, k); if (Math.hypot(x - post.x, zz - post.z) <= C.v0.range) starts.push([x, zz]); }
      const laneFails = (via, join) => {
        const bad = [];
        for (const st of [...starts.map((p0) => [p0, ...via, join]), [join, C.setOutPath[GT.glideFrom]]]) {
          const j = jettyD(st), b = pathMin(st, barge) - 2.3, w = Math.min(...C.waystones.map((q) => pathMin(st, q) - 1.1));
          if (!onWater(st) || j < need || b < need || w < need) bad.push(`${JSON.stringify(st[0])}: ${onWater(st) ? '' : 'leaves raft water, '}jetty ${j.toFixed(1)}, barge ${b.toFixed(1)}, stones ${w.toFixed(1)}`);
        }
        return bad;
      };
      const fails = laneFails(GT.via || [], GT.joinAt);
      ok(starts.length > 20 && isNum(GT.glideFrom) && C.setOutPath[GT.glideFrom] && fails.length === 0,
        `FE-T1: the Set Out auto-sail from all ${starts.length} raft-water points within the post's ${C.v0.range} m (via ${JSON.stringify(GT.via)} to joinAt ${JSON.stringify(GT.joinAt)}, then into the glide) stays on raft water and clears the jetty, the barge and the Waystones by ${need.toFixed(1)} m: ${fails.slice(0, 3).join('; ')}`);
      ok(laneFails([[barge.x, barge.z + 3.5]], GT.joinAt).length > 0 && laneFails([], GT.joinAt).length > 0,
        'FE-T1 self-test: a lane that clips the barge, and a straight lane that clips the quay, both fail the check'); }
    ok(C.subtitle === 'A Drowned Ferry Cove' && C.mode === 'foot' && C.v0.mode === 'raft' && C.testBuoy.r === 1.2 && C.testBuoy.offDuring === 'firstEvening', 'COVE.subtitle / mode are real fields (not inside a comment); Landing v0 is raft mode; the test buoy has a capture radius and is off during the First Evening');
    ok(D.FIRST_EVENING.ember.z > -40 && D.FIRST_EVENING.ember.z <= -30, 'the ember sits in front of the channel-mouth card, clear of the cliff ring'); }

  // ---- v3 without §24 (V3 on, WALK off): nothing needs a §24 place, a walk challenge or a walk relic
  ok(NW.SPECIES.length === 41 && NW.SPECIES.every((s) => !s.place || NW.MOSSMERE_V3.places.some((p) => p.id === s.place)), `v3 without §24: 41 species, none kept at a §24 place (got ${NW.SPECIES.length})`);
  ok(NW.CHALLENGES.length === 38 && NW.CHALLENGES.every((c) => c.tier !== 4), 'v3 without §24: 38 challenges (no tier IV)');
  ok(NW.RELICS.every((r) => !r.needsWalk) && 'stride' in NW.STATS && NW.CHALLENGE_BY_ID.complete_chronicle.params.n === NW.SPECIES.length, 'v3 without §24: no walk relics; stride exists (Boots); the Chronicle asks for every species in the build');
  ok(NW.ZONES[0].arena.places?.length === 9, "v3 without §24 still has the Mossmere's places");

  console.log(`  v3: ${S.length} species (${S.filter((s) => s.place).length} kept, ${S.filter((s) => s.rarity !== 'legendary' && s.time === 'gloom').length} night-only), ${real.length} places (+4 secrets), ${D.RUMOURS.length} rumours, ${D.CHALLENGES.length} challenges, ${D.RELICS.length} relics; legend ratios ${LAKES.map((z) => { const lg = S.find((s) => s.zone === z && s.rarity === 'legendary'); return (D.sizeL50(lg) / Math.max(...S.filter((s) => s.zone === z && s.rarity !== 'legendary').map((s) => D.sizeLength(s, 3.6, z)))).toFixed(2); }).join(' / ')}; timeline worst ${worst.toFixed(2)} h; ${((Date.now() - T0) / 1000).toFixed(1)} s`);
}

// ---------------------------------------------------------------------------- report
for (const w of warnings) console.log('  warn:', w);
if (errors.length) {
  for (const e of errors.slice(0, 80)) console.log('  FAIL:', e);
  if (errors.length > 80) console.log(`  … and ${errors.length - 80} more`);
  console.log(`validate-data${V3 ? ' --v3' : WALK ? ' --walk' : ''}: ${errors.length} failure(s) in ${checks} checks`);
  process.exit(1);
}
console.log(`validate-data${V3 ? ' --v3 (V3_ENABLED and WALK_ENABLED on)' : WALK ? ' --walk (WALK_ENABLED on)' : ' (v1 tables, WALK_ENABLED off)'}: OK (${checks} checks; ${D.SPECIES.length} species, ${D.BOONS.length} boons, ${D.CHARACTERS.length} characters, ${D.CHALLENGES.length} challenges, ${D.RELICS.length} relics, ${D.UPGRADES.length} upgrades, ${D.ENEMIES.length} enemies)`);
if (!WALK && !process.argv.includes('--v1')) {
  const { spawnSync } = await import('node:child_process');
  for (const pass of ['--walk', '--v3', '--loop']) {
    const r = spawnSync(process.execPath, [new URL(import.meta.url).pathname, pass, ...(pass === '--walk' && process.argv.includes('--refresh-fingerprint') ? ['--refresh-fingerprint'] : [])], { stdio: 'inherit' });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
  process.exit(0);
}
