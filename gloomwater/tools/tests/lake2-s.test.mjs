// LAKE 2, lane S (docs/loop/LAKE2.md §7, §5.6, §5.7, §6.5; FINDS §5.2): Murk's shop, orders and finds at Sporewood, in node.
//   the finds: Sporewood's five treasures (one a grade, its words, its values at tier 12), the 1% rule over 100,000 seeded snags there,
//     a snag at Sporewood through the real ledger (a treasure of Sporewood's, sold at its value; never a Mossmere find there, never a
//     Sporewood find at the Mossmere), the catalogue's finds row, the props (≤ 400 triangles, vertex-coloured, at their size) and ink;
//   the shop: every Sporewood item the save can see has its own engraving (none of the Mossmere's plates, the thirteen gear items all
//     different), the Mossmere's plate keys as built, the catalogue's pages with Sporewood's shelf at every layout, the glyphs, each
//     water's place maps on its own shelf (mapCards), the rack's rod and the raft's parts in Sporewood's make;
//   the orders: at Sporewood only its own fish (never a giant, the legend or an epic), two in three common or uncommon, never two of a
//     fish, the Mossmere's open orders waiting there and never filled by a Sporewood fish;
//   the guide: the new water's one box (its words, once a water, never at the Mossmere, the Mossmere's ten as built).
//   node tools/tests/lake2-s.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';

const { loadLoopData, freshLoopMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'lake2-s' });
const { createBus } = await import('../../src/core.js');
const { create } = await import('../../src/progression.js');
const PL = await import('../../src/progression-loop.js');
const LF = await import('../../src/loop-finds.js');
const LG = await import('../../src/loop-gear.js');
const U = await import('../../src/ui-loop.js');
const UF = await import('../../src/ui-finds.js');
const M = await import('../../src/murk-catalogue.js');
const E = await import('../../src/murk-engrave.js');
const G = await import('../../src/ui-guide.js');
const UT = await import('../../src/ui-tackle.js');
const { GEAR_GLYPH } = await import('../../src/ui-gear.js');
const { ICONS } = await import('../../src/ui-icons.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const near = (a, b, msg, e = 1e-9) => ok(Math.abs(a - b) <= e, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);
const rngOf = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const SW = ['seed_jar', 'skep_lid', 'gardeners_trowel', 'cloche_handle', 'seedkeeper_casket'];
const withShipped = (fn) => { const k = D.LOOP.shipped; D.LOOP.shipped = 'sporewood'; try { return fn(); } finally { D.LOOP.shipped = k; } };

/** A real progression on the loop's data (loop-carry.test.mjs's harness), a fake fishing. */
function makeEnv({ meta = freshLoopMeta(D) } = {}) {
  const bus = createBus();
  const F = { state: 'idle', hookLine: () => ({ state: F.state, out: false, fishOn: false, castBait: null }), reelInQuiet: () => ({ ok: false }), spots: [], signs: [], addSpots() {}, armChum() {} };
  const ctx = {
    THREE, bus, data: D, state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {}, core: { debugEnabled: () => false },
    game: { save() {} },
    survival: { getPhaseInfo: () => ({ phase: 'calm', day: 1, time: 0, duration: 40, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
    fishing: F,
  };
  ctx.progression = create(ctx);
  ctx.progression.init();
  return { ctx, P: ctx.progression, L: ctx.progression.loop };
}
/** The Mossmere's end, its lake map to Sporewood bought: T2 everywhere, Hold 6, the raft's parts II, Order Board II, rich. */
function mossEndMeta() {
  const meta = freshLoopMeta(D), L = meta.loop;
  Object.assign(L, { tackle: { rod: 2, line: 2, reel: 2 }, holdSlots: 6, raft: { oars: 2, keel: 2, lantern: 2 }, home: { ...(L.home || {}), orders: 2 },
    maps: { lakes: ['mossmere', 'sporewood'], places: [...Object.keys(D.LOOP.places).filter((id) => D.LOOP.places[id].water === 'mossmere' && D.LOOP.places[id].secret !== true), 'lullaby', 'gill_harp'] },
    barge: { water: 'mossmere', towed: ['mossmere'] }, evenings: 30, clams: 99999 });
  return meta;
}
/** A save towed to Sporewood (the real towTo), its world shipped for the test. */
function atSporewood() {
  const env = makeEnv({ meta: mossEndMeta() });
  const r = env.L.towTo('sporewood');
  ok(r?.ok === true && r.first === true, 'the harness: the first tow to Sporewood');
  return env;
}

// =====================================================================================================================
section('Sporewood\'s five treasures (FINDS §5.2, LAKE2 §7.3): one a grade, its words, its values at its tier');
{
  const set = LF.findsOf(D, 'sporewood');
  eq(set.map((i) => i.id), SW, 'Sporewood\'s finds: the five treasures, in grade order');
  eq(set.map((i) => i.grade), ['plain', 'fine', 'precious', 'rare', 'jackpot'], '… one a grade');
  ok(set.every((i) => i.kind === 'treasure'), '… treasures only this edition (its parts, looks and lost tackle are later, §10)');
  eq(SW.map((id) => LF.findName(D, id)), ['Seed Jar', 'Bee-Skep Lid', "Gardener's Trowel", 'Cloche Handle', "The Seed-Keeper's Casket"], 'their names (§7.3)');
  eq(SW.map((id) => LF.findLine(D, id)), ['Still sealed. Still waiting for spring.', 'Woven straw. The bees left long ago.', 'Brass, worn bright on one side.',
    'From a glass bell over seedlings.', 'Every seed the gardens ever kept.'], 'their card lines (§7.3), each ≤ 8 words');
  eq(SW.map((id) => LF.findValue(D, id)), [24, 72, 180, 600, 3000], 'sold at Sporewood\'s tier 12 by FINDS §4.2\'s rule: 24 · 72 · 180 · 600 · 3,000');
  eq(LF.findsOf(D, 'mossmere').filter((i) => i.kind === 'treasure').map((i) => LF.findValue(D, i.id)), [14, 42, 105, 350, 1750], 'the Mossmere\'s as built');
  const allowed = U.allowedWords(D);
  for (const id of SW) for (const t of [LF.findName(D, id), LF.findLine(D, id)]) ok(U.textAllowed(t, { D, words: allowed, screen: 'catch' }), `${id}: "${t}" on the card's allow-list`);
}

section('the 1% rule over 100,000 seeded snags at Sporewood (findShares, drawFind: the game\'s own draw)');
{
  const fresh = LF.findShares({ loop: { maps: { lakes: ['mossmere', 'sporewood'] }, finds: { got: {}, worn: {}, share: {}, tackleMiss: {} } } }, D, 'sporewood');
  eq(SW.map((id) => LF.fmtRate(fresh[id])), ['54%', '29%', '12%', '4%', '1%'], 'a snag there: 54% · 29% · 12% · 4% · 1% (no part or look to share with)');
  near(Object.values(fresh).reduce((a, b) => a + b, 0), 1, 'the shares sum to 1');
  near(fresh.seedkeeper_casket, 0.01, 'the jackpot is exactly 1%');
  ok(Object.keys(fresh).every((id) => SW.includes(id)), 'a snag at Sporewood draws only Sporewood\'s finds');
  const rng = rngOf(20261118), n = 100000, c = {};
  for (let i = 0; i < n; i++) { const id = LF.drawFind(fresh, rng()); c[id] = (c[id] || 0) + 1; }
  near(c.seedkeeper_casket / n, 0.01, `the Seed-Keeper's Casket over 100,000 snags: ${(c.seedkeeper_casket / n * 100).toFixed(3)}% (1% ± 0.07)`, 0.0007);
  for (const id of SW) near(c[id] / n, fresh[id], `${id}: ${(c[id] / n * 100).toFixed(2)}% against ${(fresh[id] * 100).toFixed(0)}%`, 0.004);
  ok(SW.every((id) => c[id] / n >= 0.0093), 'no find there is rarer than the jackpot');
  // the soft guarantee has nothing to climb at a water of treasures only: a treasure snag leaves the share where it was
  const L = freshLoopMeta(D).loop;
  LF.noteSnag(L, D, 'sporewood', 'seed_jar');
  ok(!('sporewood' in (L.finds.share || {})) && !('sporewood' in (L.finds.tackleMiss || {})), 'a treasure at Sporewood moves no guarantee (nothing unowned to raise)');
}

section('a snag at Sporewood through the real ledger: Sporewood\'s treasure, kept, sold at its value; the waters never swap finds');
{
  const env = atSporewood();
  withShipped(() => {
    const r = env.P.createRun({ startZone: 'sporewood', nightMode: 'still', outing: 'trip' });
    env.ctx.state.run = r; env.ctx.flow = 'playing';
    eq(r.zone, 'sporewood', 'a trip at Sporewood');
    const rng = rngOf(7);
    let snags = 0, bad = 0;
    for (let i = 0; i < 20000; i++) { const id = env.L.snagRoll({ rng }); if (!id) continue; snags++; if (!SW.includes(id)) bad++; }
    ok(snags > 700 && snags < 1300, `about 1 bite in 20 snags there (${snags} of 20,000)`);
    eq(bad, 0, 'every snag at Sporewood is one of its five treasures');
    eq(env.L.snagRoll({ force: 'tin_spoon' }), null, 'a Mossmere find is never brought up at Sporewood (even forced)');
    eq(env.L.snagRoll({ force: 'skep_lid' }), 'skep_lid', 'a Sporewood find forced there comes');
    const e = env.L.noteFound({ findId: 'skep_lid', waterKey: 'open:sporewood' });
    ok(e && e.find === 'skep_lid' && e.clams === 72 && e.water === 'sporewood', 'the card offers the Bee-Skep Lid at 72', e);
    ok(env.L.keepFind(e).ok, 'Keep: it takes a slot in the hold');
    const before = env.L.state().clams;
    const t = env.L.endTrip(); env.ctx.state.run = null;
    ok(t && t.lines.some((l) => l.find === 'skep_lid' && l.clams === 72), 'the tally sells it for 72');
    eq(env.L.state().clams - before, t.total, '… the purse takes the tally');
    eq(env.L.state().finds.got.skep_lid, 1, 'it is counted (the catalogue names it from now on)');
  });
  const m = makeEnv({ meta: mossEndMeta() });
  const r = m.P.createRun({ startZone: 'mossmere', nightMode: 'still', outing: 'trip' });
  m.ctx.state.run = r; m.ctx.flow = 'playing';
  eq(m.L.snagRoll({ force: 'seed_jar' }), null, 'a Sporewood find is never brought up at the Mossmere');
  const rng = rngOf(11);
  let swAtMoss = 0;
  for (let i = 0; i < 20000; i++) { const id = m.L.snagRoll({ rng }); if (id && SW.includes(id)) swAtMoss++; }
  eq(swAtMoss, 0, 'the Mossmere\'s snags as built: none of Sporewood\'s');
}

section('the catalogue\'s finds row at Sporewood (FINDS §6.5): five treasures, their rates, a name once had');
{
  const meta = mossEndMeta();
  meta.loop.finds = { got: { gardeners_trowel: 2 }, worn: {}, share: {}, tackleMiss: {} };
  const F = PL.catalogueFor(meta, D, 'sporewood').finds;
  ok(!!F, 'Sporewood\'s catalogue page carries its finds row');
  eq(F.rows.treasure.map((c) => c.id), SW, '… its five treasures');
  eq([F.rows.part.length, F.rows.look.length, F.rows.tackle.length], [0, 0, 0], '… no parts, looks or lost tackle this edition');
  eq(F.rows.treasure.map((c) => c.rateText), ['54%', '29%', '12%', '4%', '1%'], '… their rates (the page\'s only numbers)');
  const v = UF.findsRowView(F, D);
  eq(v.rows.find((r) => r.kind === 'treasure').cards.map((c) => c.name), ['· · ·', '· · ·', "Gardener's Trowel", '· · ·', '· · ·'], 'a treasure had is named (×2), the rest "· · ·"');
  ok(F.rows.treasure.find((c) => c.id === 'seedkeeper_casket').gold === true, 'the Casket\'s card is gold (the jackpot)');
}

section('the props and the ink (models-finds.js, ui-finds.js): ≤ 400 triangles, one toon material, at their size; an outline each');
{
  const MF = await import('../../src/models-finds.js');
  const seen = new Set();
  for (const id of SW) {
    const g = MF.findPropGeometry(id), tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
    ok(tris > 40 && tris <= 400, `${id}: ${tris} triangles (≤ 400)`);
    ok(!!g.attributes.color, `${id}: vertex-coloured (one toon material)`);
    let finite = true; const a = g.attributes.position.array; for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) { finite = false; break; }
    ok(finite, `${id}: no NaN in its geometry`);
    const p = MF.createFindProp(id, D);
    near(p.length, LF.findById(D, id).size, `${id}: the show holds it at its own size (${LF.findById(D, id).size} m)`, 1e-3);
    p.dispose();
    seen.add(tris);
    const calls = []; const rec = new Proxy({}, { get: (_, k) => (...xs) => { calls.push([k, ...xs]); } });
    const r = UF.findInkPath(rec, id, { detail: true });
    ok(r.aspect > 0.3 && r.aspect < 6 && calls.length >= 3 && calls.every((c) => c.slice(1).every((x) => Number.isFinite(x))), `${id}: its ink outline (aspect ${r.aspect}, ${calls.length} strokes)`);
  }
  ok(seen.size === SW.length, 'five different props');
  const def = MF.findPropGeometry('no_such_find'), tris0 = (def.index ? def.index.count : def.attributes.position.count) / 3;
  ok(SW.every((id) => (MF.findPropGeometry(id).index?.count ?? 0) / 3 !== tris0), 'none of them is the stand-in box');
}

// =====================================================================================================================
section('the shop: every Sporewood item the save can see has its own engraving; the Mossmere\'s plates as built');
{
  const moss = [
    [{ id: 'rod:1', slot: 'rod', level: 1 }, 'rod:1'], [{ id: 'hold:4', slot: 'hold', level: 4 }, 'hold:4'], [{ id: 'oars:2', slot: 'oars', level: 2 }, 'oars:2'],
    [{ id: 'lure:bone_jig' }, 'lure:bone_jig'], [{ id: 'tin:mireworm', slot: 'tin', baitId: 'mireworm' }, 'tin:mireworm'], [{ id: 'bait:heartmoss', slot: 'bait', baitId: 'heartmoss' }, 'bait:heartmoss'],
    [{ id: 'rod:1', slot: 'rod', level: 1, gearWater: 'mossmere' }, 'rod:1'], [{ id: 'oars:1', slot: 'oars', level: 1, gearWater: 'mossmere' }, 'oars:1'],
  ];
  for (const [c, k] of moss) eq(E.plateKey(c), k, `the Mossmere's ${c.id}: its plate as built`);
  const mossKeys = new Set(['rod:1', 'rod:2', 'line:1', 'line:2', 'reel:1', 'reel:2', 'hold:4', 'hold:5', 'hold:6', 'oars:1', 'oars:2', 'keel:1', 'keel:2', 'lantern:1', 'lantern:2',
    'lure:feather_fly', 'lure:glimmer_spoon', 'lure:bone_jig', 'lure:bell_spinner', 'lure:bent_spoon', 'tin:mireworm', 'tin:lumen_moss', 'bait:heartmoss']);
  const mossSvg = new Set([...mossKeys].map((k) => { const [s, r] = k.split(':'); return E.engrave(s === 'lure' ? { id: k } : s === 'tin' || s === 'bait' ? { id: k, slot: s, baitId: r } : { id: k, slot: s, level: Number(r) }, { uid: 'm' }); }));
  // the thirteen (TEXT_LOOP.gearItems' Sporewood items) and the rest of its shelf: the bulb, the four creels, the six raft-part levels
  const tier = (slot, level, itemId) => ({ id: `${slot}:${level}`, slot, level, itemId, gearWater: 'sporewood' });
  const cards = {
    seedpod_twirl: UT.artCard(D, 'lure', 'seedpod_twirl'), spore_moth: UT.artCard(D, 'lure', 'spore_moth'), ember_minnow: UT.artCard(D, 'lure', 'ember_minnow'),
    root_jig: UT.artCard(D, 'lure', 'root_jig'), sporelamp_fly: UT.artCard(D, 'lure', 'sporelamp_fly'), spore_cake: UT.artCard(D, 'bait', 'spore_cake'),
    amber_larvae: UT.artCard(D, 'bait', 'amber_larvae'), stalkwood: tier('rod', 1, 'stalkwood'), amberheart: tier('rod', 2, 'amberheart'), rootthread: tier('line', 1, 'rootthread'),
    mothsilk: tier('line', 2, 'mothsilk'), capwheel: tier('reel', 1, 'capwheel'), burlwheel: tier('reel', 2, 'burlwheel'),
  };
  const items13 = Object.keys(D.TEXT_LOOP.gearItems).filter((id) => [...Object.values(D.LOOP.gear.sporewood).flatMap((v) => (Array.isArray(v) ? v.map((t) => t.id) : [])),
    ...Object.keys(D.LOOP.lures).filter((l) => D.LOOP.lures[l].water === 'sporewood'), ...D.LOOP.tins.sporewood].includes(id));
  eq(items13.sort(), Object.keys(cards).sort(), 'the thirteen: Sporewood\'s lures, tins and tackle tiers in TEXT_LOOP.gearItems');
  const extra = { glowcap_bulb: UT.artCard(D, 'bait', 'glowcap_bulb'), bark_creel: tier('hold', 4, 'bark_creel'), rootwoven_creel: tier('hold', 5, 'rootwoven_creel'),
    mossbed_basket: tier('hold', 6, 'mossbed_basket'), gardeners_hamper: tier('hold', 7, 'gardeners_hamper') };
  for (const s of ['oars', 'keel', 'lantern']) for (const lv of [1, 2]) extra[`${s}${lv}`] = { id: `${s}:${lv}`, slot: s, level: lv, gearWater: 'sporewood' };
  const keys = new Set(), svgs = new Set();
  for (const [id, c] of Object.entries({ ...cards, ...extra })) {
    const key = E.plateKey(c), svg = E.engrave(c, { uid: `s${keys.size}` });
    ok(!mossKeys.has(key), `${id}: its own plate (${key}), none of the Mossmere's`);
    ok(!keys.has(key), `${id}: a plate no other Sporewood item has`);
    keys.add(key);
    const raw = E.engrave(c, { uid: 'm' });
    ok(!mossSvg.has(raw) && !svgs.has(raw), `${id}: drawn as nothing else on either shelf`);
    svgs.add(raw);
    ok(typeof svg === 'string' && svg.startsWith('<svg') && svg.length > 1200 && !/NaN|undefined|Infinity/.test(svg), `${id}: an engraving (${svg.length} chars)`);
    ok(!/Gradient/i.test(svg), `${id}: no gradient`);
    const fills = [...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]).filter((f) => !['none', 'currentColor'].includes(f) && !f.startsWith('url(#'));
    ok(fills.length === 0, `${id}: ink and paper only`, [...new Set(fills)]);
    ok(/cat-hatch|<circle/.test(svg), `${id}: hatching or stipple`);
    eq(E.engrave(c, { uid: 'd' }), E.engrave(c, { uid: 'd' }), `${id}: deterministic`);
  }
  eq(keys.size, 13 + 11, 'twenty-four plates for Sporewood\'s shelf: the thirteen, the bulb, four creels, six raft-part levels');
  eq(E.plateNumeral(tier('rod', 2, 'amberheart')), 'II', 'a tier\'s plate keeps its numeral (Amberheart: II)');
}

section('the catalogue\'s pages with Sporewood\'s shelf (murk-catalogue.bookPages): every card once, in its chapter, at every layout');
{
  const env = atSporewood();
  withShipped(() => {
    const ml = env.L.state();
    const TABS = ['tackle', 'raft', 'bait', 'maps', 'home'];
    const shelfOf = (session = []) => ({ tabs: TABS.map((id) => ({ id, items: PL.shelfItems(D, ml, session, { meta: env.ctx.state.meta }).filter((i) => i.tab === id) })).filter((t) => t.items.length) });
    const check = (label) => {
      const tabs = U.shelfCards(shelfOf(), { D, clams: ml.clams }).tabs;
      const ids = tabs.flatMap((t) => t.cards.map((c) => c.id));
      const goal = PL.goalOf(PL.shelfItems(D, ml, [], { meta: env.ctx.state.meta }));
      for (const [vw, vh] of [[1280, 720], [960, 540], [390, 844], [358, 664], [844, 390], [690, 760], [1280, 800]]) {
        const layout = M.bookLayout(vw, vh), size = M.bookSizes(vw, vh, layout).size, b = M.bookPages(tabs, { layout, size, goal });
        const placed = b.pages.flatMap((p) => p.items);
        ok(placed.length === ids.length && ids.every((id) => placed.includes(id)), `${label} ${vw}×${vh}: every card on a page once (${ids.length})`);
        ok(b.pages.every((p) => p.items.length <= (layout === 'desktop' && p.chapter === 'maps' && size !== 'low' ? (size === 'short' ? 1 : 2) : b.per)), `${label} ${vw}×${vh}: no page over its grid`);
        ok(layout !== 'desktop' || b.count % 2 === 0, `${label} ${vw}×${vh}: whole spreads`);
        ok(goal == null || b.goalPage != null, `${label} ${vw}×${vh}: the goal's page is found`);
        eq(b.chapters.map((c) => c.id), M.CHAPTERS.filter((c) => tabs.some((t) => t.id === c)), `${label} ${vw}×${vh}: the chapters in the shelf's order`);
      }
      return tabs;
    };
    const t0 = check('just towed');
    const tk = t0.find((t) => t.id === 'tackle').cards;
    eq(tk.filter((c) => /^(rod|line|reel):/.test(c.id)).map((c) => [c.name, c.itemId]), [['Stalkwood', 'stalkwood'], ['Rootthread', 'rootthread'], ['Capwheel', 'capwheel']],
      'its first tiers on the shelf, each carrying its item to the engraving');
    ok(tk.filter((c) => /^(rod|line|reel):/.test(c.id)).every((c) => !E.plateKey(c).match(/^(rod|line|reel):\d$/)), 'the catalogue draws them as their own make');
    ok(t0.find((t) => t.id === 'raft').cards.filter((c) => /^(oars|keel|lantern):/.test(c.id)).every((c) => /:sporewood$/.test(E.plateKey(c))), 'its raft parts drawn in its make');
    ok(t0.find((t) => t.id === 'raft').cards.filter((c) => c.slot === 'hold').every((c) => /^hold:[a-z_]+$/.test(E.plateKey(c))), 'its creel drawn in its make');
    // the shelf bought out: every tier, creel and part, each its own card, and the pages still whole
    for (const id of ['rod:1', 'line:1', 'reel:1', 'rod:2', 'line:2', 'reel:2', 'hold:5', 'hold:6', 'hold:7', 'oars:1', 'oars:2', 'keel:1', 'keel:2', 'lantern:1', 'lantern:2',
      'lure:spore_moth', 'lure:ember_minnow', 'lure:root_jig', 'lure:sporelamp_fly']) ok(env.L.buy(id).ok, `bought ${id}`);
    const t1 = check('bought out');
    eq(t1.find((t) => t.id === 'tackle').cards.filter((c) => /^(rod|line|reel):/.test(c.id)).map((c) => [c.name, c.bought]), [['Amberheart', true], ['Mothsilk', true], ['Burlwheel', true]],
      'the top tiers kept on the shelf as "Yours."');
  });
}

section('the glyphs: Sporewood\'s hooks each their own (ui-gear GEAR_GLYPH, loop-gear\'s shelf art), none a Mossmere item\'s');
{
  const swHooks = ['seedpod_twirl', 'spore_moth', 'ember_minnow', 'root_jig', 'sporelamp_fly', 'spore_cake', 'amber_larvae', 'glowcap_bulb'];
  const mossHooks = ['feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner', 'bent_spoon', 'mireworm', 'lumen_moss', 'heartmoss'];
  for (const id of swHooks) ok(typeof GEAR_GLYPH[id] === 'string' && typeof ICONS[GEAR_GLYPH[id]] === 'string', `${id}: its glyph (${GEAR_GLYPH[id]}) is drawn`);
  ok(new Set(swHooks.map((id) => GEAR_GLYPH[id])).size === swHooks.length, 'eight hooks, eight glyphs');
  ok(swHooks.every((id) => !mossHooks.map((m) => GEAR_GLYPH[m]).includes(GEAR_GLYPH[id])), 'no Sporewood hook wears a Mossmere hook\'s glyph');
  const env = atSporewood();
  withShipped(() => {
    const items = LG.gearItems(D, env.L.state());
    for (const it of items.filter((i) => i.slot === 'lure' || i.slot === 'tin')) ok(it.art === GEAR_GLYPH[it.lureId || it.baitId], `the shelf's ${it.id}: its own glyph (${it.art})`);
  });
}

section('each water\'s place maps on its own shelf (mapCards): the Mossmere\'s as before; Sporewood\'s at Sporewood');
{
  eq(PL.mapCards(D, freshLoopMeta(D).loop).map((c) => c.id), ['place:lily_maze', 'place:under_the_span', 'lake:sporewood'], 'a fresh save: the Mossmere\'s two cheapest, then Sporewood\'s sealed card');
  withShipped(() => {
    const m = mossEndMeta();
    const atMoss = PL.mapCards(D, m.loop, { meta: m });
    ok(atMoss.every((c) => !c.placeId || D.LOOP.places[c.placeId].water === 'mossmere'), 'at the Mossmere with Sporewood\'s map bought: only the Mossmere\'s place maps', atMoss.map((c) => c.id));
    const env = atSporewood();
    const atSw = PL.mapCards(D, env.L.state(), { meta: env.ctx.state.meta });
    eq(atSw.map((c) => c.id), ['place:veilwater', 'place:mothers_cup', 'lake:glasswater'], 'at Sporewood: the Veilwater\'s and the Mother\'s Cup\'s maps, then the next water\'s sealed card');
    const m3 = mossEndMeta(); m3.loop.maps.places = m3.loop.maps.places.filter((id) => id !== 'lily_maze');
    const env3 = makeEnv({ meta: m3 }); env3.L.towTo('sporewood');
    ok(!PL.mapCards(D, env3.L.state(), { meta: env3.ctx.state.meta }).some((c) => c.placeId === 'lily_maze'), 'a Mossmere place map not bought waits at the Mossmere (never offered at Sporewood)');
    ok(env.L.buy('place:veilwater').ok && env.L.state().maps.places.includes('veilwater'), 'the Veilwater\'s map bought at Sporewood');
    env.L.state().barge.water = 'mossmere';
    ok(PL.mapCards(D, env.L.state(), { meta: env.ctx.state.meta }).every((c) => !c.placeId || D.LOOP.places[c.placeId].water === 'mossmere'), 'the way back: the Mossmere\'s shelf sells its own maps again');
  });
}

// =====================================================================================================================
section('Murk\'s orders at Sporewood (LAKE2 §7.2): its own fish, the built rules; the Mossmere\'s wait');
{
  const ml = mossEndMeta().loop;
  ml.barge = { water: 'sporewood', towed: ['mossmere', 'sporewood'] };
  ml.maps.places = ['lullaby', 'gill_harp', 'veilwater', 'mothers_cup'];
  const rng = rngOf(99), N = 6000;
  let low = 0, bad = 0, n = 0;
  const kinds = { count: 0, class: 0, heavy: 0 };
  for (let i = 0; i < N; i++) {
    const o = LG.newOrder(D, ml, { rng, listFor: PL.listFor, water: 'sporewood' });
    if (!o) continue;
    n++;
    const s = D.SPECIES_BY_ID[o.speciesId];
    if (!s || s.zone !== 'sporewood' || s.giant || s.rarity === 'legendary' || s.rarity === 'epic' || o.water !== 'sporewood') bad++;
    if (s && (s.rarity === 'common' || s.rarity === 'uncommon')) low++;
    kinds[o.kind]++;
  }
  eq(n, N, 'an order every roll');
  eq(bad, 0, 'every order a Sporewood fish (never a giant, the legend or an epic), naming its water');
  near(low / n, 2 / 3, `two in three name a common or uncommon fish (${(low / n * 100).toFixed(1)}%)`, 0.03);
  ok(kinds.count > kinds.class && kinds.class > 0 && kinds.heavy > 0, 'counts, classes and weights, as built', kinds);
  // the board: two of Sporewood's, never two of one fish; the Mossmere's open orders wait; a Sporewood fish never fills one of them
  const m = mossEndMeta().loop;
  m.orders = [{ id: 'm1', speciesId: 'weeping_carp', kind: 'count', n: 2, have: 0 }];
  m.barge = { water: 'sporewood', towed: ['mossmere', 'sporewood'] };
  const added = LG.refillOrders(D, m, { listFor: PL.listFor, rng: rngOf(5) });
  ok(added.length === 2 && new Set(added.map((o) => o.speciesId)).size === 2, 'Order Board II at Sporewood: two orders, two fish');
  ok(m.orders.some((o) => o.id === 'm1'), 'the Mossmere\'s open order waits');
  const sw = added[0], fish = [{ uid: 'f1', speciesId: sw.speciesId, sizeClass: 'elder' }, { uid: 'f2', speciesId: 'weeping_carp', sizeClass: 'prize' }];
  const res = LG.assignOrders(D, m.orders.filter((o) => LG.orderWater(D, o) === 'sporewood'), fish);
  ok(res.fills.get('f1') === sw.id && !res.fills.has('f2'), 'a Sporewood fish fills Sporewood\'s order; nothing there fills the Mossmere\'s');
  // the ledger's board at Sporewood shows only its own (the slate, Murk's line, the Journal's "Murk wants one.")
  const env = atSporewood();
  withShipped(() => {
    env.L.state().orders = [{ id: 'mo', speciesId: 'weeping_carp', kind: 'count', n: 2, have: 0 }];
    const os = env.L.orders();
    ok(os.length === 2 && os.every((o) => o.water === 'sporewood' && D.SPECIES_BY_ID[o.speciesId].zone === 'sporewood'), 'the board at Sporewood: two of its own, chalked', os.map((o) => o.speciesId));
    ok(env.L.state().orders.some((o) => o.id === 'mo'), '… the Mossmere\'s kept for the way back');
    const line = env.L.sayOrders();
    ok(typeof line === 'string' && !/Weeping Carp/.test(line) && os.every((o) => line.includes(D.SPECIES_BY_ID[o.speciesId].name.split(' ')[0])), `Murk says Sporewood's ("${line}")`);
  });
}

// =====================================================================================================================
section('the guide: the new water\'s one box (LAKE2 §6.5), once a water, never at the Mossmere; the ten as built');
{
  eq(G.GUIDE_ORDER.length, 10, 'the Mossmere\'s ten boxes as built');
  ok(!G.GUIDE_ORDER.includes(G.WATER_BOX) && !(G.WATER_BOX in D.TEXT_LOOP.guide.boxes), 'the new water\'s box is its own (not one of the ten)');
  eq([G.newWaterOf(D, 'mossmere'), G.newWaterOf(D, 'sporewood'), G.newWaterOf(D, 'nowhere'), G.newWaterOf(D, null)], [null, 'sporewood', null, null], 'newWaterOf: a later water only');
  const w = G.guideWords(D, G.WATER_BOX);
  eq(w.text, D.TEXT_LOOP.guide.newWater, 'its words are TEXT_LOOP.guide.newWater');
  ok(w.text.split(/\s+/).length <= 30 && !/\d|%/.test(w.text) && U.textAllowed(w.text, { D, words: U.allowedWords(D) }), `its words: short, no number, on the allow-list ("${w.text}")`);
  eq(G.guideWords(D, G.WATER_BOX, { touch: true }).text, w.text, 'the same words on a touch screen');
  const calm = { flow: 'playing', top: null, trip: true, paused: false, fish: 'idle', casts: 0, evenings: 30, kit: true };
  ok(G.guideCond(G.WATER_BOX, { ...calm, newWater: 'sporewood' }), 'its moment: calm on a trip at a later water, before the first cast');
  ok(!G.guideCond(G.WATER_BOX, { ...calm, newWater: null }), '… never at the Mossmere');
  ok(!G.guideCond(G.WATER_BOX, { ...calm, newWater: 'sporewood', casts: 1 }) && !G.guideCond(G.WATER_BOX, { ...calm, newWater: 'sporewood', fish: 'bite' }), '… never after a cast or in a bite');
  const meta = { guide: { on: true, seen: Object.fromEntries(G.GUIDE_ORDER.map((id) => [id, true])) } };
  const mc = G.createGuide({ record: () => G.guideRecord(meta) });
  let shown = null;
  for (let i = 0; i < 20 && !shown; i++) shown = mc.step({ ...calm, newWater: null }, 0.1);
  eq(shown, null, 'at the Mossmere (every box seen): nothing');
  for (let i = 0; i < 20 && !shown; i++) shown = mc.step({ ...calm, newWater: 'sporewood' }, 0.1);
  eq(shown, G.WATER_BOX, 'the first trip at Sporewood: the new water\'s box');
  mc.open(shown); mc.close();
  ok(meta.guide.seen[G.waterBoxKey('sporewood')] === true && !meta.guide.seen[G.WATER_BOX], 'seen under its water\'s key (newWater:sporewood)');
  let again = null;
  for (let i = 0; i < 40 && !again; i++) again = mc.step({ ...calm, newWater: 'sporewood' }, 0.1);
  eq(again, null, 'once a water: never again at Sporewood');
  ok(mc.step({ ...calm, newWater: 'glasswater' }, 1) === G.WATER_BOX, 'a third water would have its own');
  const off = G.createGuide({ record: () => ({ on: false, seen: {} }) });
  eq(off.step({ ...calm, newWater: 'sporewood' }, 2), null, 'the guide off: no box');
  // a fresh first play never meets it (the ten come in order, none of them the water's box)
  const m2 = { guide: { on: true, seen: {} } }, mc2 = G.createGuide({ record: () => G.guideRecord(m2) });
  ok(mc2.step({ ...calm, newWater: null }, 1) === 'cast', 'a first play at the Mossmere: the ten\'s cast box, as built');
}

// =====================================================================================================================
section('the rack\'s rod and the raft\'s parts in Sporewood\'s make (actors-home homeVariants, actors-raft-gear raftGearParts)');
{
  const AH = await import('../../src/actors-home.js');
  const RG = await import('../../src/actors-raft-gear.js');
  const base = freshLoopMeta(D).loop;
  const v0 = AH.homeVariants({ ...base, tackle: { rod: 1, line: 0, reel: 0 } });
  ok(!('rodAt' in v0) && JSON.parse(v0.sig).length === 9, 'the Mossmere\'s rack as built (its signature\'s nine terms)');
  const v1 = AH.homeVariants({ ...base, gearWater: 'sporewood', tackle: { rod: 1, line: 0, reel: 0 } });
  ok(v1.rodAt === 'sporewood' && v1.sig !== v0.sig, 'a rod bought at Sporewood: the rack rebuilds in its make');
  const tris = (parts) => parts.reduce((a, g) => a + (g.index ? g.index.count : g.attributes.position.count) / 3, 0);
  const m = RG.raftGearParts({ oars: 2, keel: 2 }), mm = RG.raftGearParts({ oars: 2, keel: 2, water: 'mossmere' }), s = RG.raftGearParts({ oars: 2, keel: 2, water: 'sporewood' });
  eq(tris(mm), tris(m), 'the Mossmere\'s parts as built');
  ok(s.length > 0 && tris(s) !== tris(m), `Sporewood's Capleaf Oars and Root Keel are their own (${tris(s)} triangles against ${tris(m)})`);
  ok(tris(s) < 3000, '… a small merged mesh still (one draw call)');
}

console.log(`\nlake2-s: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
