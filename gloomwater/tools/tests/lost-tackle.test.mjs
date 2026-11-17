// tools/tests/lost-tackle.test.mjs — lost tackle, lanes L1 and L2 (docs/loop/LOST-TACKLE.md §2, §6, §8, §9.1): the draw (LT1: findShares
// with the six pieces and the Veil Angler's Notebook's soft guarantee), the miss count and the 1% rule over 100,000 seeded snags (LT2),
// the tally on a real progression (LT3: carried aboard for nothing, never twice, the notebook shows Veilback Brook), the words (LT7's
// node half), the card, the tally's rows, the hold and the catalogue's tackle row (pure views), the props and the barge's rack and
// chart table (merged: no new draw call). Run: node tools/tests/lost-tackle.test.mjs
import * as THREE from 'three';
import { createBus } from '../../src/core.js';
import * as LF from '../../src/loop-finds.js';

const { loadLoopData, freshLoopMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'lost-tackle' });
const { create } = await import('../../src/progression.js');
const PL = await import('../../src/progression-loop.js');
const UF = await import('../../src/ui-finds.js');
const U = await import('../../src/ui-loop.js');
const { mulberry32 } = await import('../../src/fishing-play.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const OPEN = 'open:mossmere';
const F = D.LOOP.finds, TK = F.tackle, items = LF.findsOf(D, 'mossmere');
const TACKLE = items.filter((i) => i.kind === 'tackle').map((i) => i.id);
const SIX = items.filter((i) => i.kind === 'part' || i.kind === 'look').map((i) => i.id);
const NB = TK.guarantee.item, OTHERS = TACKLE.filter((id) => id !== NB);
const gotAll = (ids) => Object.fromEntries(ids.map((id) => [id, 1]));
const metaWith = ({ got = {}, share = null, miss = null } = {}) => { const m = freshLoopMeta(D); m.loop.finds = { got: { ...got }, worn: {}, share: share == null ? {} : { mossmere: share }, tackleMiss: miss == null ? {} : { mossmere: miss } }; return m; };
const shares = (o) => D.findShares(metaWith(o), D, 'mossmere');

// ------------------------------------------------------------------ the data (§2.1, §3.2, §6.1)
section('the data: the Mossmere\'s six pieces');
eq(TACKLE, ['lamp_pole', 'belfry_winch', 'ferry_thread', 'guard_button', 'veil_notebook', 'lily_notebook'], 'six lost-tackle pieces at the Mossmere, in the design\'s order');
eq(items.filter((i) => i.kind === 'tackle').map((i) => i.slot), ['rod', 'reel', 'line', 'lure', 'notebook', 'notebook'], 'a rod, a reel, a line, a lure and two notebooks');
eq(items.filter((i) => i.kind === 'tackle').map((i) => i.pose), ['alongside', 'both', 'both', 'pinch', 'both', 'both'], 'the find poses: the pole alongside, the button pinched, the rest in both hands');
ok(LF.FIND_KINDS.includes('tackle') && LF.TACKLE_SLOTS.length === 5, 'tackle is a fourth kind, with five slots');
eq([TK.each, TK.guarantee.item, TK.guarantee.step, TK.guarantee.cap, TK.partCap], [0.01, 'veil_notebook', 0.05, 0.4, 0.8], 'LOOP.finds.tackle: 1% each; the Veil Angler\'s Notebook +5 points a snag to 40%; partCap 80%');
eq(D.LOOP.lostTackle.veil_notebook.reveals, 'veilback_brook', 'the Veil Angler\'s Notebook shows Veilback Brook');
ok(TACKLE.every((id) => D.LOOP.lostTackle[id]?.slot === items.find((i) => i.id === id).slot), 'every piece has its stats under its own slot (LOOP.lostTackle)');
ok(TACKLE.every((id) => LF.findValue(D, id) === 0), 'a piece is never priced (its slot is its price)');

// ------------------------------------------------------------------ LT1: findShares
section('LT1: findShares with the six pieces and the guarantee');
{
  const fresh = shares();
  near(sum(fresh), 1, 'a fresh set: the shares sum to 1');
  ok(TACKLE.every((id) => Math.abs(fresh[id] - 0.01) < 1e-12), 'a fresh set: each piece 1%, the notebook 1%');
  eq(fresh.toll_purse, 0.01, 'a fresh set: the jackpot exactly 1%');
  ok(SIX.every((id) => Math.abs(fresh[id] - 0.35 / 6) < 1e-12), 'a fresh set: the parts and looks keep their 35% (5.8% each)');
  near(fresh.tin_spoon + fresh.door_ring, 0.83 - 0.35 - 0.06, 'the plain and fine give up the parts\' 35% and the pieces\' 6%');
  near(fresh.tin_spoon / fresh.door_ring, 54 / 29, '… in proportion (54 : 29)');
  for (let n = 0; n <= 10; n++) {
    const s = shares({ miss: n });
    near(s[NB], Math.min(0.4, 0.01 + 0.05 * n), `after ${n} misses the notebook is min(40%, 1% + 5 × ${n})`);
    ok(OTHERS.every((id) => Math.abs(s[id] - 0.01) < 1e-12) && Math.abs(s.toll_purse - 0.01) < 1e-12 && Math.abs(sum(s) - 1) < 1e-9, `after ${n} misses the other five stay 1%, the jackpot 1%, the sum 1`);
  }
  const capd = shares({ miss: 99, share: 0.99 });
  near(capd[NB], 0.4, 'the guarantee at its cap: 40%');
  near(SIX.reduce((a, id) => a + capd[id], 0), 0.8 - 0.45, 'with the guarantee at its cap the parts\' share is clamped to partCap − T (35%)');
  ok(SIX.every((id) => capd[id] >= 0.35 / 6 - 1e-12), '… so each part keeps at least 35% ÷ 6 (5.8%)');
  near(sum(capd), 1, '… and the shares sum to 1');
  ok(capd.tin_spoon >= 0.01 && capd.door_ring >= 0.01, '… the plain and fine keep ≥ 1% each (3% between them)');
  near(capd.tin_spoon + capd.door_ring, 0.03, '… exactly FINDS\' floor at the cap: 3%');
  const oneLeft = shares({ got: gotAll(TACKLE.slice(1)) });
  ok(Math.abs(oneLeft.lamp_pole - 0.01) < 1e-12 && TACKLE.slice(1).every((id) => oneLeft[id] === 0) && Math.abs(sum(oneLeft) - 1) < 1e-9, 'one piece left: it 1%, the owned ones 0, the sum 1');
  const nbLeft = shares({ got: gotAll(OTHERS), miss: 3 });
  near(nbLeft[NB], 0.16, 'only the notebook left, 3 misses: 16%');
  const owned = shares({ got: gotAll([...SIX, ...TACKLE]) });
  ok(TACKLE.every((id) => owned[id] === 0) && Math.abs(owned.tin_spoon - 0.54) < 1e-12 && Math.abs(sum(owned) - 1) < 1e-9, 'the set owned: no piece is drawn again; the plain back to 54%');
  const nbOwned = shares({ got: { [NB]: 1 }, miss: 7 });
  ok(nbOwned[NB] === 0 && OTHERS.every((id) => Math.abs(nbOwned[id] - 0.01) < 1e-12), 'the notebook owned: a stale miss count raises nothing');
  const ex = D.findShares(metaWith({ miss: 4 }), D, 'mossmere', { exclude: [NB, 'lamp_pole'] });
  ok(ex[NB] === 0 && ex.lamp_pole === 0 && Math.abs(sum(ex) - 1) < 1e-9, 'a piece in this trip\'s hold is never drawn (its share goes back to the treasures)');
  for (const [name, s] of [['fresh', fresh], ['cap', capd], ['one left', oneLeft], ['owned', owned], ['nb left', nbLeft]]) {
    ok(Object.values(s).filter((x) => x > 0).every((x) => x >= 0.01 - 1e-12), `${name}: no find is rarer than the jackpot`);
    near(s.toll_purse, 0.01, `${name}: the jackpot exactly 1%`);
  }
}

// ------------------------------------------------------------------ LT2: noteSnag, the miss count, the 1% rule
section('LT2: noteSnag counts the misses; the 1% rule over 100,000 snags');
{
  const L = freshLoopMeta(D).loop;
  LF.noteSnag(L, D, 'mossmere', 'tin_spoon'); LF.noteSnag(L, D, 'mossmere', 'buoy_bell'); LF.noteSnag(L, D, 'mossmere', 'lamp_pole');
  eq(L.finds.tackleMiss.mossmere, 3, 'every snag that is not the notebook counts a miss (a treasure, a part, another piece)');
  for (let i = 0; i < 20; i++) LF.noteSnag(L, D, 'mossmere', 'door_ring');
  eq(L.finds.tackleMiss.mossmere, 8, 'the count stops where the share reaches its cap (8: 1% + 40 points)');
  LF.noteSnag(L, D, 'mossmere', NB);
  eq(L.finds.tackleMiss.mossmere, 8, 'bringing the notebook up keeps the count (let go, the guarantee still stands)');
  LF.bookFinds(L, [{ find: NB }], D);
  eq(L.finds.tackleMiss.mossmere, undefined, 'carried home at the tally, the count goes');
  const O = metaWith({ got: { [NB]: 1 } }).loop;
  LF.noteSnag(O, D, 'mossmere', 'tin_spoon');
  eq(O.finds.tackleMiss?.mossmere, undefined, 'with the notebook owned no miss is counted');
  LF.fillFinds(O);
  ok(LF.findShares({ loop: O }, D, 'mossmere')[NB] === 0, 'an owned piece leaves the draw');
  eq(LF.snagChance(D, { evening: 1 }) + LF.snagChance(D, { tutorial: true }) + LF.snagChance(D, { legendCast: true }), 0, 'never on evening 1, the tutorial or a legend\'s cast');
  const f = { finds: { got: {}, worn: {}, share: {}, tackleMiss: { mossmere: -2, glasswater: 2.7 } } };
  LF.fillFinds(f);
  eq(f.finds.tackleMiss, { glasswater: 2 }, 'fillFinds makes the counts whole (whole numbers; none at or under 0)');
  eq(f.places, { revealed: [] }, 'fillFinds makes meta.loop.places.revealed');
  for (const [name, m] of [['a fresh set', metaWith()], ['the guarantee climbing', metaWith({ miss: 3 })], ['the guarantee at its cap', metaWith({ miss: 8, share: 0.8 })]]) {
    const sh = D.findShares(m, D, 'mossmere'), rng = mulberry32(20261117), N = 100000, n = {};
    for (let i = 0; i < N; i++) { const id = LF.drawFind(sh, rng()); n[id] = (n[id] || 0) + 1; }
    for (const id of [...OTHERS, 'toll_purse']) ok(Math.abs((n[id] || 0) / N - 0.01) <= 0.0007, `${name}: ${id} is ${((n[id] || 0) / N * 100).toFixed(3)}% of 100,000 snags (1.00% ± 0.07)`);
    ok(Math.abs((n[NB] || 0) / N - sh[NB]) <= 4 * Math.sqrt(sh[NB] * (1 - sh[NB]) / N), `${name}: the notebook's draw is within 4σ of its share (${(sh[NB] * 100).toFixed(1)}%)`);
  }
}

// ------------------------------------------------------------------ the ledger on a real progression (LT2's draw, LT3's tally)
section('LT2 + LT3: the snag roll and the tally on a real progression');
function makeEnv(meta) {
  const bus = createBus(), events = [];
  const ctx = {
    THREE, bus, data: D, state: { meta, run: null }, time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {}, core: { debugEnabled: () => false },
    game: { save() {} },
    survival: { getPhaseInfo: () => ({ phase: 'calm', day: 1, time: 0, duration: 40, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(), isNear() { return true; } }, combat: { addXp() {} },
    fishing: { state: 'idle', spots: [], signs: [], addSpots() {}, armChum() {} }, ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const oe = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { events.push({ e, p }); oe(e, p); };
  ctx.progression = create(ctx); ctx.progression.init();
  return { ctx, bus, events, P: ctx.progression, L: ctx.progression.loop };
}
function startTrip(env) {
  const r = env.P.createRun({ startZone: 'mossmere', character: 'wick', nightMode: 'still', outing: 'trip' });
  env.ctx.state.run = r; env.ctx.flow = 'playing';
  env.bus.emit('zone:change', { zone: r.zone, prev: null, sail: true });
  env.bus.emit('run:start', { continued: false });
  return r;
}
const played = () => { const m = freshLoopMeta(D); Object.assign(m.loop, { wick: 'wick', tutorial: { done: true, step: null }, evenings: 3, holdSlots: 4 }); return m; };
{
  // the guarantee in play: snags roll until the notebook comes, each miss raising it (a seeded run)
  const E = makeEnv(played()), r = startTrip(E), rng = mulberry32(11);
  let snags = 0, at = null;
  for (let i = 0; i < 20000 && at == null; i++) {
    const id = E.L.snagRoll({ rng });
    if (!id) continue;
    snags++;
    const e = E.L.noteFound({ findId: id, waterKey: OPEN });
    if (id === NB) { at = snags; E.L.keepFind(e); } else E.L.letGoFind(e);
  }
  ok(at != null && at <= 12, `the seeded run brings the notebook up by its ${at}th snag (the guarantee climbs to 40% by the 9th)`);
  ok(E.L.state().finds.tackleMiss?.mossmere > 0, 'kept, its miss count stays until the tally');
  ok(r.creel.some((f) => f.find === NB && f.kind === 'tackle' && f.clams === 0), 'kept: the notebook takes a slot, worth nothing');
  { let again = 0; for (let i = 0; i < 4000; i++) if (E.L.snagRoll({ rng }) === NB) again++; eq(again, 0, 'a piece in this trip\'s hold is never drawn again (4,000 bites)'); }
  const pole = E.L.noteFound({ findId: 'lamp_pole', waterKey: OPEN });
  E.L.keepFind(pole);
  const clams0 = E.L.state().clams;
  const t = E.L.endTrip();
  eq(t.lines.filter((l) => l.find).map((l) => [l.find, l.clams]), [[NB, 0], ['lamp_pole', 0]], 'the tally: both carried aboard for nothing, after every other find');
  eq(E.L.state().clams - clams0, t.total, 'the tally pays only its own total');
  eq(E.L.state().finds.got[NB], 1, 'the notebook is owned');
  eq(E.L.state().finds.tackleMiss?.mossmere, undefined, 'its tally deleted the miss count');
  eq(E.L.state().places.revealed, ['veilback_brook'], 'the notebook\'s tally shows Veilback Brook (meta.loop.places.revealed)');
  ok(LF.placeRevealed(E.L.state(), 'veilback_brook') && !LF.placeRevealed(E.L.state(), 'under_the_span'), 'placeRevealed reads it');
  const again = E.L.endTrip();
  ok(again.already === true && E.L.state().finds.got[NB] === 1 && E.L.state().places.revealed.length === 1, 'a second tally (a reload during it) books nothing twice');
  E.ctx.state.run = null; startTrip(E);
  ok(E.L.findShares('mossmere')[NB] === 0 && E.L.findShares('mossmere').lamp_pole === 0, 'the next evening: the owned pieces leave the draw');
  eq(E.L.snagRoll({ force: NB }), null, 'debug force refuses an owned piece');
  eq(E.L.snagRoll({ force: 'lily_notebook' }), 'lily_notebook', 'debug force names an unowned piece');
}
{
  // a full hold (no swapping): no piece is offered while it could only be let go, and the notebook's count keeps climbing
  const E = makeEnv(played()), r = startTrip(E), rng = mulberry32(5), slots = E.L.hold().slots;
  for (let i = 0; i < slots; i++) r.creel.push({ uid: 'x' + i, find: 'tin_spoon', kind: 'treasure', clams: 1 });
  ok(E.L.hold().full, 'the hold is full');
  let tk = 0, snags = 0;
  for (let i = 0; i < 40000; i++) { const id = E.L.snagRoll({ rng }); if (!id) continue; snags++; if (TACKLE.includes(id)) tk++; else E.L.noteFound({ findId: id, waterKey: OPEN }); }
  ok(snags > 1000 && tk === 0, `a full hold: no piece in ${snags} snags`);
  eq(E.L.state().finds.tackleMiss?.mossmere, 8, '… and the notebook\'s guarantee climbed to its cap all the same');
  r.creel.pop();
  let back = 0; for (let i = 0; i < 4000; i++) if (E.L.snagRoll({ rng }) === NB) back++;
  ok(back > 0, `a slot free: the notebook can come again (${back} of 4,000 bites)`);
}
{
  // a let-go piece goes back to the water and may come again (no swapping: kept stays kept)
  const E = makeEnv(played()), r = startTrip(E);
  E.bus.emit('fishing:bite', { sizeClass: 'find', waterKey: OPEN });
  const e = E.L.noteFound({ findId: 'guard_button', waterKey: OPEN });
  ok(E.L.letGoFind(e).ok && !r.creel.length, 'Let go: the button drops back');
  ok(E.L.findShares('mossmere').guard_button === 0.01, '… and may come up again (1%)');
  const k = E.L.noteFound({ findId: 'belfry_winch', waterKey: OPEN });
  E.L.keepFind(k);
  eq(E.L.letGoFind(r.creel[0]).ok, false, 'a kept piece cannot be let go (kept stays kept)');
  ok(!E.events.some((x) => x.e === 'fish:measured' || x.e === 'fish:landed'), 'a piece never reaches the measure');
}
{
  // the save: a fresh loop and an old save are both made whole
  const f = PL.freshLoop(D);
  eq([f.finds.tackleMiss, f.places], [{}, { revealed: [] }], 'a fresh loop: no misses, nothing revealed');
  const old = { loop: { ...clone(PL.freshLoop(D)), finds: { got: {}, worn: {}, share: {} } } }; delete old.loop.places;
  PL.migrateLoop(old, D);
  eq([old.loop.finds.tackleMiss, old.loop.places], [{}, { revealed: [] }], 'an older save gains them on its next boot (no schema step)');
}

// ------------------------------------------------------------------ LT7 (node half): the words
section('LT7: the words');
{
  const W = D.TEXT_LOOP.finds.items;
  for (const id of TACKLE) {
    const w = W[id];
    for (const k of ['does', 'line']) ok(typeof w?.[k] === 'string' && w[k].trim().split(/\s+/).length <= 8 && w[k].length <= 36 && !/\d/.test(w[k]), `${id}.${k}: ≤ 8 words, ≤ 36 characters, no digits ("${w?.[k]}")`);
    ok(typeof w?.name === 'string' && w.name.length > 0 && w.name.length <= 36 && !/\d/.test(w.name), `${id}: a name`);
  }
  eq(TACKLE.map((id) => W[id].name), ["Lamplighter's Pole", 'Belfry Winch', "Ferrywife's Thread", "Gate-Guard's Button", "The Veil Angler's Notebook", "The Lily Gardener's Notebook"], 'the six names');
  eq(LF.findDoes(D, 'lamp_pole'), 'Casts farther than any rod sold.', 'findDoes: the card\'s one plain line');
  eq(LF.findDoes(D, 'tin_spoon'), '', 'findDoes: none for a treasure');
  ok(typeof D.TEXT_LOOP.murk.firstTackle === 'string', 'Murk\'s once-line at the first piece');
  ok(!JSON.stringify([D.LOOP.finds.tackle, D.LOOP.lostTackle, TACKLE.map((id) => W[id])]).includes('%'), 'no percentage literal in the data or the words');
  const allow = U.allowedWords(D);
  ok(TACKLE.every((id) => allow.has(W[id].name) && allow.has(W[id].does) && allow.has(W[id].line)), 'every name, does and line is an allowed screen word (textAllowed)');
}

// ------------------------------------------------------------------ L2: the card, the tally, the hold, the catalogue (pure views)
section('L2: the card, the tally\'s rows, the hold and the catalogue\'s tackle row');
{
  const cv = UF.findCardView(LF.holdEntry(D, 'lamp_pole', { uid: 'a' }), D);
  ok(cv.kind === 'tackle' && cv.stamp === 'hook' && cv.does === 'Casts farther than any rod sold.' && cv.name === "Lamplighter's Pole", 'the card: the hook stamp, the name, the one plain line');
  ok(cv.keep.clams === null && cv.keep.clamsText === null && cv.keep.glyph === 'rack' && cv.letGo.label === 'Let go', 'Keep shows the rack\'s glyph and no price; Let go');
  const nb = UF.findCardView(LF.holdEntry(D, 'lily_notebook', { uid: 'b' }), D, { full: true });
  ok(nb.keep.glyph === 'table' && nb.keep.disabled === true, 'a notebook\'s Keep shows the chart table\'s glyph (dimmed with the hold full)');
  ok(!/\d|%/.test(JSON.stringify([cv.name, cv.does, nb.name, nb.does])), 'no number on the card');
  eq(UF.findCardView(LF.holdEntry(D, 'tin_spoon', { uid: 'c' }), D).does, '', 'a treasure\'s card keeps its own line (no does)');
  ok(['hook', 'rack', 'table'].every((k) => typeof UF.FIND_GLYPHS[k] === 'string' && UF.FIND_GLYPHS[k].includes('<svg')), 'the hook, rack and chart-table glyphs');
  eq(['lamp_pole', 'belfry_winch', 'ferry_thread', 'guard_button', 'veil_notebook', 'lily_notebook'].map((id) => UF.whereOf(LF.findById(D, id))), ['rack', 'rack', 'rack', 'rack', 'table', 'table'], 'where each goes: the rack, or the chart table for a notebook');
  // the tally's rows: after the parts and looks, its name, no clams
  const lines = PL.tallyLines([LF.holdEntry(D, 'veil_notebook', { uid: 'n' }), LF.holdEntry(D, 'moat_bollard', { uid: 'p' }), LF.holdEntry(D, 'toll_purse', { uid: 'j' }), LF.holdEntry(D, 'tin_spoon', { uid: 's' })], { D });
  eq(lines.map((l) => l.find), ['tin_spoon', 'toll_purse', 'moat_bollard', 'veil_notebook'], 'tallyLines: the treasures, the jackpot, the part, then the lost tackle');
  const plan = U.tallyPlan({ lines }, { D });
  eq(plan.rows.map((r) => [r.find, r.kind, r.clams]), [['tin_spoon', 'treasure', 14], ['toll_purse', 'treasure', 1750], ['moat_bollard', 'part', 0], ['veil_notebook', 'tackle', 0]], 'tallyPlan: the notebook\'s row last, carried aboard for nothing');
  eq(plan.rows.at(-1).name, "The Veil Angler's Notebook", '… with its name');
  eq(U.saleLineId({ rows: plan.rows, said: { firstSale: true, firstJackpot: true } }), 'brook', 'Murk\'s line: the Veil Angler\'s Notebook aboard shows the brook ("Water behind the Veil. Always said so."), once (W, C)');
  eq(U.saleLineId({ rows: plan.rows, said: { firstSale: true, firstJackpot: true, brook: true } }), 'firstTackle', 'Murk\'s line: the first piece aboard ("Somebody fished here before you.")');
  eq(U.saleLineId({ rows: plan.rows.slice(2, 3), said: { firstSale: true } }), 'firstPart', '… a part alone still his part line');
  eq(U.saleLineId({ rows: plan.rows.slice(3), said: { firstSale: true, firstTackle: true, brook: true } }), null, '… and a piece never says the part line');
  const cells = U.slotCells({ slots: 3, fish: [LF.holdEntry(D, 'belfry_winch', { uid: 'w' })] }, { D });
  ok(cells[0].find === 'belfry_winch' && !cells[0].gild, 'the hold row: the winch\'s own glyph, never gold');
  // the catalogue's tackle row: hatched with its rate until found (the notebook's climbing share), then inked with a tick
  const cat = PL.catalogueFor(metaWith({ miss: 3 }), D, 'mossmere').finds;
  eq(cat.rows.tackle.map((c) => c.id), TACKLE, 'the catalogue\'s fourth row: the six pieces');
  const row = UF.findsRowView(cat, D);
  const tr = row.rows.find((r) => r.kind === 'tackle');
  eq(row.rows.map((r) => r.kind), ['treasure', 'part', 'look', 'tackle'], 'the row\'s view: four rows, tackle last');
  eq(tr.cards.map((c) => c.rateText), ['1%', '1%', '1%', '1%', '16%', '1%'], '… "1%" under each piece, the notebook\'s share as it stands (16% after 3 misses)');
  ok(tr.cards.every((c) => c.name === '· · ·' && !c.tick), '… every piece not yet had is "· · ·"');
  const had = UF.findsRowView(PL.catalogueFor(metaWith({ got: { lamp_pole: 1 } }), D, 'mossmere').finds, D).rows.find((r) => r.kind === 'tackle').cards[0];
  ok(had.name === "Lamplighter's Pole" && had.tick === true && had.rateText === null, 'an owned piece: inked, named, its tick in place of a rate');
  eq(PL.catalogueFor(metaWith({ got: { lamp_pole: 1 } }), D, 'mossmere').finds.rows.tackle[0].does, 'Casts farther than any rod sold.', 'catalogueFor gives an owned piece its does line (the tap)');
  for (const t of [...tr.cards.map((c) => c.rateText), ...TACKLE.flatMap((id) => [D.TEXT_LOOP.finds.items[id].name, D.TEXT_LOOP.finds.items[id].does, D.TEXT_LOOP.finds.items[id].line])]) ok(U.textAllowed(t, { D, screen: 'journal' }), `the catalogue may show "${t}"`);
  ok(!U.textAllowed('16%', { D, screen: 'catch' }) && !U.textAllowed('1%', { D, screen: 'hud' }), 'a rate never on the card or the HUD');
}

// ------------------------------------------------------------------ L2: the props and the barge (merged, no new draw call)
section('L2: the props, the rack and the chart table');
{
  const MF = await import('../../src/models-finds.js');
  for (const id of TACKLE) {
    const g = MF.findPropGeometry(id), tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
    ok(tris <= (id === 'lamp_pole' ? 600 : 400), `${id}: ${tris} triangles (≤ ${id === 'lamp_pole' ? 600 : 400})`);
    ok(!!g.attributes.color, `${id}: vertex-coloured (one toon material)`);
    const p = MF.createFindProp(id, D);
    near(p.length, LF.findById(D, id).size, `${id}: the show holds it at its own size (${LF.findById(D, id).size} m)`, 1e-3);
    p.dispose();
  }
  const AF = await import('../../src/actors-finds.js');
  eq(AF.findHomeSig({ finds: { got: { buoy_bell: 1 } } }), '1000', 'the barge\'s signature without lost tackle is the parts\' alone (5c\'s)');
  eq(AF.findHomeSig({ finds: { got: { buoy_bell: 1, lamp_pole: 1, veil_notebook: 1 } } }), '1000:100010', '… and with it, the six after a colon');
  const AH = await import('../../src/actors-home.js');
  const mk = (got) => AH.createHome({ data: D, world: { getMood: () => ({ night: 0.37, warm: 0.6 }) }, flow: 'home', state: { meta: { loop: { ...PL.freshLoop(D), finds: { got, worn: {}, share: {} } } } }, models: { emitSmoke() {} } });
  const h0 = mk({}), h1 = mk(gotAll(TACKLE));
  const tris = (h) => { let n = 0; h.object3d.traverse((o) => { if (o.isMesh && o.name === 'home:timber') n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); return n; };
  const meshes = (h) => { let n = 0; h.object3d.traverse((o) => { if (o.isMesh) n++; }); return n; };
  ok(tris(h1) > tris(h0), `the six pieces are merged into the barge's timber (+${tris(h1) - tris(h0)} triangles)`);
  eq(meshes(h1), meshes(h0), 'no new mesh on the barge');
  eq(h1.calls(), h0.calls(), 'home\'s draw calls unchanged');
  ok(h1.calls().main <= 6, 'home stays ≤ 6 main-pass calls');
  ok(tris(h1) - tris(h0) <= 2400, 'the rack and the chart table add ≤ 2,400 triangles');
  let lights = 0; h1.object3d.traverse((o) => { if (o.isLight) lights++; }); eq(lights, 0, 'no light on the barge');
  h0.dispose?.(); h1.dispose?.();
}

// ------------------------------------------------------------------ lanes L3–L5 (§3, §4, §6.2, §8)
const WC = await import('../../src/watercraft.js');
const { planPlay } = await import('../../src/fishing-play.js');
const AF = await import('../../src/ui-af.js');
const UT = await import('../../src/ui-tackle.js');
const LS = await import('../../src/loop-sheet.js');
const owning = (ids, extra = {}) => { const m = played(); m.loop.finds.got = gotAll(ids); Object.assign(m.loop, extra); return m; };

section('LT3: the found lure joins the lures and never the shelf');
{
  const ml = { finds: { got: {}, worn: {}, share: {}, tackleMiss: {} }, lures: ['bent_spoon'], places: { revealed: [] } };
  LF.bookFinds(ml, [{ find: 'guard_button' }], D);
  eq(ml.lures, ['bent_spoon', 'guard_button'], 'the tally adds the Gate-Guard\'s Button to meta.loop.lures');
  LF.bookFinds(ml, [{ find: 'guard_button' }], D);
  eq(ml.lures.filter((x) => x === 'guard_button').length, 1, '… once');
  ok(D.LOOP.lures.guard_button?.found === true && D.LOOP.lures.guard_button.price === 0, 'LOOP.lures.guard_button: found, free');
  const shelf = PL.shelfItems(D, freshLoopMeta(D).loop).map((it) => it.id);
  ok(!shelf.some((id) => String(id).includes('guard_button')) && shelf.some((id) => String(id).includes('feather_fly')), 'the shelf sells the Feather Fly, never the button (owned or not)');
  ok(D.LURES.some((l) => l.id === 'guard_button' && l.attract === 1) && D.CATCH_V3.items.guard_button?.hold === 0, 'LURES and CATCH_V3 carry it: attract 1 (the Bent Spoon\'s strike), +0 Hold');
}

section('LT4: fitting a found rod, line or reel; the four stats');
{
  // fitFound on a real progression: owned pieces only, of their slot; the stats and the loadout read them; unfit gives the tier back
  const E = makeEnv(owning(['lamp_pole', 'ferry_thread', 'belfry_winch'], { tackle: { rod: 2, line: 0, reel: 1 } })), r = startTrip(E);
  const T0 = E.P.getStats();
  eq([T0.castMax, T0.hookWindow], [D.TACKLE.rod[2].castMax, D.TACKLE.rod[2].hookWindow], 'the Whalebone bought: 19 m');
  eq(E.L.fitFound('rod', 'lily_notebook').ok, false, 'a notebook is no rod');
  eq(E.L.fitFound('rod', 'guard_button').ok, false, 'the button is no rod');
  ok(E.L.fitFound('rod', 'lamp_pole').ok && E.L.state().found.rod === 'lamp_pole', 'the Lamplighter\'s Pole fitted (meta.loop.found.rod)');
  E.ctx.time.frame++;
  const T1 = E.P.getStats(), lo1 = E.P.getLoadout();
  eq([T1.castMax, T1.hookWindow, lo1.hold.rod, lo1.rod], [26, 1, 0, 2], 'the Pole: casts 26 m, the T0 strike window, +0 Hold; the slot keeps its tier (T2)');
  ok(E.L.fitFound('line', 'ferry_thread').ok && E.L.fitFound('reel', 'belfry_winch').ok, 'the Thread and the Winch fitted');
  const lo2 = E.P.getLoadout();
  eq([lo2.hold.line, lo2.hold.reel, lo2.waitMult, lo2.playMult, lo2.lineCap], [2, 2, 0.8, 0.6, 'trophy'], 'the loadout: +2 Hold each, the wait ×0.8, the play ×0.6, the line\'s Trophy cap');
  E.ctx.fishing.state = 'reeling';
  eq(E.L.fitFound('rod', null).reason, 'fish', 'a fish on: "After this fish." (changeHook\'s rule)');
  E.ctx.fishing.state = 'idle';
  ok(E.L.unfitFound('rod').ok && E.L.state().found.rod === null, 'taken off: the bought tier is back');
  E.ctx.time.frame++;
  eq(E.P.getStats().castMax, D.TACKLE.rod[2].castMax, '… and its cast');
  E.ctx.state.run = null;
  ok(E.L.fitFound('rod', 'lamp_pole').ok, 'at home a piece is fitted too');
  const m = clone(E.ctx.state.meta); m.loop.finds.got = {}; PL.migrateLoop(m, D);
  eq(m.loop.found, { rod: null, line: null, reel: null }, 'a fitted piece the save no longer owns is not fitted (migrateLoop)');
  void r;
}
{
  // the Winch: a play's length × min(the tiers' factor, 0.6) (seeded planPlay)
  const a = planPlay('trophy', 2.2, 4242, { tiers: 2 }), b = planPlay('trophy', 2.2, 4242, { tiers: 2, playMult: 0.6 }), c = planPlay('trophy', 2.2, 4242, { tiers: 2, playMult: 0.95 });
  near(b.dur / a.dur, 0.6 / 0.9, 'the Winch plays a trophy at 0.6 of its length where the tiers give 0.9', 1e-3);
  near(c.dur, a.dur, 'a playMult above the tiers\' factor changes nothing', 1e-9);
  // the Thread: Trophy by its own cap, never Elder (gearCap's line term)
  eq([WC.gearCap(D, 'kissmark_trout', { lure: 'glimmer_spoon', line: 2 })?.cls, WC.gearCap(D, 'kissmark_trout', { lure: 'glimmer_spoon', line: 2, lineCap: 'trophy' })?.cls], ['elder', 'trophy'], 'the Thread caps an Elder-capable hook at Trophy');
  // the button's column
  const G = Object.fromEntries(Object.keys(WC.WATERCRAFT.mossmere.hook.table).map((id) => [id, WC.gradeOf(id, { lure: 'guard_button' })]));
  eq(Object.entries(G).filter(([, g]) => g === 2).length, 13, 'the button: liked (grade 2) by 13 Mossmere fish');
  eq([G.thousandcast_pike, G.hullkiss_lamprey, G.gloam_eel, G.belled_matriarch], [0, 0, 0, null], '… never the giants, the eel or the legend');
  ok(!Object.values(G).includes(3), 'it is no fish\'s right lure');
  eq(WC.gearCap(D, 'mossback_perch', { lure: 'guard_button', line: 2 })?.cls, 'prize', 'its grade caps it at Prize');
  const pool = D.placePool(D.SPECIES, { placeId: 'under_the_span', phase: 'dusk', water: 'mossmere' });
  ok(WC.castShare(WC.castOdds(D, { pool, phase: 'dusk', lure: 'guard_button' }), 'thousandcast_pike') <= 0.01 + 1e-9, 'it never brings a giant: the Thousandcast a stray (≤ 1%) at its own place');
}

section('LT5: the notebooks: boosts where a fish lives, a guest in its area and light');
{
  const NBS = ['veil_notebook', 'lily_notebook'];
  const at = (light, area, hook = {}) => { const ph = light === 'night' ? 'gloomtide' : light; return WC.castOdds(D, { pool: D.placePool(D.SPECIES, { phase: ph, bait: hook.bait ?? null, water: 'mossmere' }), area, phase: ph, ...hook }); };
  const at2 = (light, area, hook = {}) => { const ph = light === 'night' ? 'gloomtide' : light; return WC.castOdds(D, { pool: D.placePool(D.SPECIES, { phase: ph, bait: hook.bait ?? null, water: 'mossmere' }), area, phase: ph, ...hook, notes: NBS }); };
  const k0 = WC.castShare(at('day', 'deep', { lure: 'glimmer_spoon' }), 'kissmark_trout'), k1 = WC.castShare(at2('day', 'deep', { lure: 'glimmer_spoon' }), 'kissmark_trout');
  const kb = D.LOOP.lostTackle.veil_notebook.boost.kissmark_trout, kx = kb * k0 / (kb * k0 + 1 - k0);   // (its weight × the boost, the rest as it was)
  ok(kb > 1 && k1 > k0 + 0.03 && Math.abs(k1 - kx) < 0.005, `the Veil Angler's: the Kissmark Trout comes more often where it lives, ×${kb} (${(k0 * 100).toFixed(1)}% → ${(k1 * 100).toFixed(1)}%, want ${(kx * 100).toFixed(1)}%)`);
  { const list = D.placePool(D.SPECIES, { phase: 'day', water: 'mossmere' }).list, a0 = WC.hookWeights(list, { area: 'deep', phase: 'day' }), a1 = WC.hookWeights(list, { area: 'deep', phase: 'day', boost: { kissmark_trout: 1.6 } });
    const w = (es) => es.find((e) => e.sp.id === 'kissmark_trout').w;
    near(w(a1) / w(a0), 1.6, 'its weight ×1.6 in hookWeights, before finishPool', 1e-9);
    ok(a0.every((e, i) => e.sp.id === 'kissmark_trout' || e.w === a1[i].w), '… and no other fish\'s'); }
  eq(WC.castShare(at2('night', 'margin', {}), 'candlefin_koi'), WC.castShare(at('night', 'margin', {}), 'candlefin_koi'), 'a boost never puts a fish where it does not live (the koi off its hours)');
  near(WC.castShare(at2('day', 'inflow', { lure: 'feather_fly' }), 'rosefleck_trout'), 0.06, 'the Rosefleck at the Sluice Veil by day: 6% on the Feather Fly (grade 3)', 2e-3);
  near(WC.castShare(at2('dusk', 'inflow', { bait: 'mireworm' }), 'rosefleck_trout'), 0.02, '… 2% on worms (grade 1)', 2e-3);
  eq(WC.castShare(at2('night', 'inflow', { lure: 'feather_fly' }), 'rosefleck_trout'), 0, '… never at night');
  eq(WC.castShare(at2('day', 'deep', { lure: 'feather_fly' }), 'rosefleck_trout'), 0, '… never out of its area');
  eq(WC.castShare(at2('day', 'inflow', {}), 'rosefleck_trout'), 0, '… absent on a hook it will not take (grade 0: never a stray)');
  near(WC.castShare(at2('night', 'pads', { bait: 'lumen_moss' }), 'nightbloom_carp'), 0.045, 'the Nightbloom in the lily beds at night: 4.5% on Lumen Moss', 2e-3);
  eq(WC.castShare(at2('day', 'pads', { bait: 'lumen_moss' }), 'nightbloom_carp'), 0, '… never by day');
  // every stray ≤ 1% in every open-water pool with both notebooks (a castOdds sweep)
  let worst = 0, n = 0;
  for (const area of WC.AREAS) for (const light of ['day', 'dusk', 'night']) for (const it of WC.HOOK_ITEMS) {
    const hook = it === 'bare' ? {} : WC.LURE_IDS.includes(it) ? { lure: it } : { bait: it };
    const o = at2(light, area, hook); n++;
    for (const e of o.entries) if (e.g === 0) worst = Math.max(worst, WC.castShare(o, e.sp.id));
    ok(Math.abs(o.entries.reduce((a2, e) => a2 + e.p, 0) - 1) < 1e-9 || !o.entries.length, `p sums to 1 (${area} ${light} ${it})`);
  }
  ok(worst <= 0.01 + 1e-9, `every stray ≤ 1.00% in all ${n} open-water pools with both notebooks (worst ${(worst * 100).toFixed(3)}%)`);
  // the guests' records: their home water's, guestOf the Mossmere; never its list, its catch seal; sold at its tier
  for (const id of WC.GUESTS) { const sp = D.SPECIES_BY_ID[id]; ok(sp && sp.guestOf === 'mossmere' && sp.zone !== 'mossmere' && sp.roster === true, `${id}: a guest record on its home water (${sp?.zone})`); }
  ok(!PL.listFor(D, 'mossmere').some((id) => WC.GUESTS.includes(id)) && !D.SPECIES_LOOP.some((s) => WC.GUESTS.includes(s.id)), 'no guest in the Mossmere\'s list or SPECIES_LOOP');
  const rf = D.SPECIES_BY_ID.rosefleck_trout;
  eq(D.fishClams(rf, 0.4, { zone: rf.guestOf }), D.fishClams({ ...rf, zone: 'mossmere' }, 0.4), 'a guest sells at the Mossmere\'s tier');
  eq([rf.model.shape, D.SPECIES_BY_ID.rainglass_darter.model.shape, D.SPECIES_BY_ID.rainglass_darter.model.sail, D.SPECIES_BY_ID.nightbloom_carp.model.shape], ['trout', 'trout', true, 'carp'], 'the models: the trout plan (the darter\'s sail), the carp plan');
  // the catalogue: a guest shows once its notebook is owned (or once met), with no words
  const m0 = played(), c0 = PL.catalogueFor(m0, D, 'mossmere');
  eq(c0.guests, [], 'no notebook, never met: no guest in the catalogue');
  const m1 = owning(['veil_notebook']), c1 = PL.catalogueFor(m1, D, 'mossmere');
  eq(c1.guests.map((g) => g.id), ['rosefleck_trout', 'rainglass_darter'], 'the Veil Angler\'s owned: its guest and its brook\'s Darter show (hatched until caught)');
  const v1 = U.catalogueView(c1, D);
  ok(v1.guests.length === 2 && v1.guests.every((x) => x.guest === true && x.name === '· · ·'), 'the view: a guest card each, no name until caught');
  eq(c1.head.need, c0.head.need, 'the list\'s count is unchanged');
  m1.journal = { rosefleck_trout: { caught: 1 } };
  const v2 = U.catalogueView(PL.catalogueFor(m1, D, 'mossmere'), D);
  ok(v2.guests[0].caught === true && v2.guests[0].name === 'Rosefleck Trout', 'met: its card inked and named (a tap opens its Journal page)');
  const m3 = owning(['nightbloom_carp'].length ? [] : []); m3.journal = { nightbloom_carp: { caught: 1 } };
  eq(PL.catalogueFor(m3, D, 'mossmere').guests.map((g) => g.id), ['nightbloom_carp'], 'a guest met shows without its notebook');
  const m4 = owning(['guard_button']); m4.loop.lures = ['bent_spoon']; PL.migrateLoop(m4, D);
  ok(m4.loop.lures.includes('guard_button'), 'migrateLoop: an owned found lure is in the tin\'s lures');
}

section('LT5 + L5: the sheet, the gear log and the catalogue\'s words');
{
  const lines = Object.fromEntries(Object.keys(D.LOOP.lostTackle).map((id) => [id, AF.lostLogLines(D, id, { likes: id === 'guard_button' ? WC.gradeTargets(id, D).length : null })]));
  eq(lines.lamp_pole, ['Casts 26 m.'], 'the Pole\'s log line');
  eq(lines.belfry_winch, ['Plays 0.6× as long.'], 'the Winch\'s');
  eq(lines.ferry_thread, ['Bites come 20% sooner.', 'Lands up to Trophy.'], 'the Thread\'s');
  eq(lines.guard_button, ['Liked by 13 fish here.'], 'the button\'s');
  eq(lines.veil_notebook, ['Kissmark Trout come more often.', 'Rosefleck Trout bite at the Sluice Veil, day and dusk.', 'Shows the way to Veilback Brook.'], 'the Veil Angler\'s');
  eq(lines.lily_notebook, ['Weeping Carp come more often.', 'Candlefin Koi come more often.', 'Nightbloom Carp bite at the lily beds, night.'], 'the Lily Gardener\'s');
  ok(AF.gearLine(D, { id: 'lamp_pole', kind: 'rod', found: true, hold: 0 }).startsWith('+0 Hold') && AF.gearLine(D, { id: 'lamp_pole', kind: 'rod', found: true, hold: 0 }).endsWith('Casts 26 m.'), 'the gear log\'s row: its Hold, then its lines');
  for (const T of [D.TEXT_LOOP.tackle.kit, D.TEXT_LOOP.murk.brook]) ok(typeof T === 'string' && T.split(/\s+/).length <= 8 && T.length <= 40 && !/\d/.test(T), `"${T}": few words, no digits`);
  // the sheet: a fitted Pole stands in for the rod; a guest's row carries its mark; the notebooks on Who bites
  const m = owning(['lamp_pole', 'veil_notebook'], { found: { rod: 'lamp_pole', line: null, reel: null } });
  m.journal = { rosefleck_trout: { caught: 1 } };
  const sm = LS.sheetModel(m, D, { view: { light: 'day' } });
  const rod = sm.tackle?.slots?.find?.((x) => x.slot === 'rod') || sm.slots?.find?.((x) => x.slot === 'rod');
  ok(!!rod && (rod.found === 'lamp_pole' && rod.values.castMax === 26 && rod.values.hold === 0), 'the sheet\'s rod: the Pole, 26 m, +0 Hold');
  const who = LS.whoBites(D, { area: 'inflow', light: 'day', lure: 'feather_fly', notes: ['veil_notebook'] });
  near(who.rosefleck_trout || 0, 0.06, 'the sheet\'s Who bites reads the notebook (the Rosefleck at the Veil)', 2e-3);
}

section('L3: the tin\'s Kit row');
{
  const ml = owning(['lamp_pole', 'ferry_thread', 'guard_button', 'veil_notebook'], { found: { rod: 'lamp_pole', line: null, reel: null }, lures: ['bent_spoon', 'guard_button'] }).loop;
  const run0 = { outing: 'trip', zone: 'mossmere', bait: { mireworm: 4 }, equippedBait: 'mireworm', lure: null };
  const t = UT.tackleModel(D, { run: run0, metaLoop: ml });
  eq(t.kit.map((k) => [k.id, k.slot, k.on]), [['lamp_pole', 'rod', true], ['ferry_thread', 'line', false]], 'the Kit row: the found rod and line, the fitted one pressed (no notebook, no lure)');
  ok(t.lure.some((l) => l.id === 'guard_button' && l.found === true), 'the button in the Lure row, drawn as a found piece');
  eq(UT.tackleModel(D, { run: run0, metaLoop: owning(['guard_button', 'veil_notebook']).loop }).kit, [], 'no found rod, line or reel: no Kit row');
  eq(UT.tackleWords(D).kit, 'Kit', 'its heading');
}

console.log(`\nlost-tackle: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
