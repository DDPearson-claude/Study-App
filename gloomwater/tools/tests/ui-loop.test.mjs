// Unit tests for the Full Hold's screens (src/ui-loop.js pure helpers, slice-1a PLAN §2.3, §6.1 lane C): fmtClams through the
// clam tag, the tally's order (lightest first, giants last) and timing (a first ticks twice), the goal line (Tallow's own count),
// the shelf's cards (the bought-card rule, Hold 5 and T2 permanent), the hold row's cells, Murk's lines (empty unless due), the
// Home pill's 0.6 s, T43's allow-list helper, the modal options of T57 and T73, the keys of T58, T47's "Evening N", T54's two card
// buttons, the title and New Descent models (T59, T62), the first trip's two tips (T68), Settings' and Forget's words (T69, T74),
// the panel held under the ink (T71: ui-intro with a fake K), the Chart's model and v8's Journal list (T83), and that every word
// comes from TEXT_LOOP or a built word SPEC §8 names. Off the loop nothing here is built (the static checks at the end).
//   node tools/tests/ui-loop.test.mjs   (or node tools/check.mjs)
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as core from '../../src/core.js';
import { listFor } from '../../src/progression-loop.js';
import { loadLoopData, fakeLoop, freshLoopMeta } from './loop-fixture.mjs';

const D = await loadLoopData();
const U = await import('../../src/ui-loop.js');
const { createLoopTutorial } = await import('../../src/loop-tutorial.js');
const { createIntroView } = await import('../../src/ui-intro.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const section = (s) => console.log(`- ${s}`);
const TL = D.TEXT_LOOP;
const ALL = (() => { const out = new Set(); const walk = (v) => { if (typeof v === 'string') out.add(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); }; walk(TL); return out; })();
const sp = (id) => D.SPECIES_BY_ID[id];
const lineOf = (id, length, clams, extra = {}) => ({ uid: `u_${id}_${length}`, speciesId: id, sizeClass: 'keeper', length, base: clams, clams, first: false, giant: false, legend: false, ...extra });

section('the clam tag: core.fmtClams');
{
  ok(U.clamTag(7).includes('<b>7</b>') && U.clamTag(9999).includes('<b>9,999</b>') && U.clamTag(10000).includes('<b>10.0k</b>') && U.clamTag(12400).includes('<b>12.4k</b>') && U.clamTag(1e6).includes('<b>1.0m</b>'), 'clamTag reads core.fmtClams (9,999 · 12.4k · 1.0m)');
  ok(/class="gw-ico[^"]*"/.test(U.clamTag(1)) && U.clamTag(1).includes('M3.4 12.6'), 'with the clam glyph (ICONS.clam: two valves and a hinge)');
  ok(!U.clamTag(1).includes('M12 19.2 8.4 6.3'), 'never the Shells fan');
  ok(U.clamTag(-5).includes('<b>0</b>') && U.clamTag('x').includes('<b>0</b>'), 'a bad number reads 0');
}

section('tallyPlan (SPEC §8.3, pounds): lightest first, heaviest last; ties by value, then the order caught; giants last');
{
  const carp = lineOf('weeping_carp', 51.2, 27), minnow = lineOf('dusk_minnow', 23.4, 7), perch = lineOf('mossback_perch', 27.0, 9);
  const P = U.tallyPlan({ lines: [carp, minnow, perch] }, { D });
  eq(P.rows.map((r) => r.speciesId), ['dusk_minnow', 'mossback_perch', 'weeping_carp'], 'three fish: by the weight the card showed');
  eq(P.rows.map((r) => r.weight), ['6 oz', '9 oz', '4 lb 12 oz'], 'each with its weight in pounds (fmtWeight of fishWeight), never kg');
  ok(P.total === 43 && !P.empty && P.line === null, 'the total +43');
  ok(P.rows.every((r, i) => i === 0 || r.at > P.rows[i - 1].at) && P.totalAt > P.rows[2].at && P.end > P.totalAt, 'one by one, then the total, then the end');
  ok(P.rows[0].at >= U.TALLY_PACE.start - 1e-9 && near(P.rows[1].at - P.rows[0].at, U.TALLY_PACE.row), 'a steady beat per fish', P.rows.map((r) => r.at));
  ok(P.end <= D.LOOP.time.sale, `the tally of three fish fits the sim's sale (${P.end.toFixed(2)} s ≤ ${D.LOOP.time.sale} s)`, P.end);
  // two that read the same weight: by value, then caught first
  const a = lineOf('dusk_minnow', 23.4, 9, { uid: 'a' }), b = lineOf('dusk_minnow', 23.4, 7, { uid: 'b' }), c = lineOf('dusk_minnow', 23.4, 7, { uid: 'c' });
  eq(U.tallyPlan({ lines: [a, b, c] }, { D }).rows.map((r) => r.uid), ['b', 'c', 'a'], 'the same weight: the lower value first, then the order caught');
  // giants and legends last, a giant alone with a longer pause
  const g = lineOf('reedjaw_pike', 40, 60, { giant: true, uid: 'g' }), L = lineOf('belled_matriarch', 120, 500, { legend: true, uid: 'L' });
  const PG = U.tallyPlan({ lines: [g, minnow, L, carp] }, { D });
  eq(PG.rows.map((r) => r.uid), [minnow.uid, carp.uid, 'L', 'g'], 'legends after the fish, a giant last of all');
  const last = PG.rows[3], prev = PG.rows[2];
  ok(last.at - prev.at > U.TALLY_PACE.row + U.TALLY_PACE.giantPause - 0.01 && last.countDur > U.TALLY_PACE.count, 'the giant waits a longer pause and counts slower', [prev.at, last.at]);
  // a first ticks twice: its base, then its sale (the row's own numbers: no arithmetic here)
  const f = lineOf('candlefin_koi', 30, 26, { base: 19, first: true, uid: 'f' });
  const PF = U.tallyPlan({ lines: [f] }, { D });
  const r = PF.rows[0];
  ok(r.first && r.base === 19 && r.clams === 26 && JSON.stringify(r.ticks) === '[19,26]' && r.secondAt > r.countAt, 'a first: two ticks, base then sale', r);
  const at = (t) => U.tallyRowAt(r, t);
  ok(!at(r.at - 0.01).shown && at(r.at).shown, 'the row shows when it settles');
  ok(at(r.countAt + r.countDur + 0.01).value === 19 && at(r.countAt + r.countDur + 0.01).ticked === 1, 'the first tick lands on the base');
  ok(at(r.secondAt + 1).value === 26 && at(r.secondAt + 1).ticked === 2, 'the second on the sale');
  ok(at(Infinity).value === 26, 'the end is the sale');
  const f2 = lineOf('candlefin_koi', 30, 19, { base: 19, first: true });
  ok(U.tallyPlan({ lines: [f2] }, { D }).rows[0].first === false, 'a "first" with no bonus ticks once');
  // an empty hold: Murk's line and Sold
  const E = U.tallyPlan({ lines: [] }, { D });
  ok(E.empty && E.rows.length === 0 && E.total === 0 && E.line === TL.murk.empty, "an empty hold: \"Nothing? The water keeps its own counsel. Go again.\"");
  ok(U.tallyPlan(null, { D }).empty && U.tallyPlan({ lines: 'x' }, { D }).empty, 'no tally: empty, never a throw');
}

section('goalLine (SPEC §8.3): "Next: Hold 4 · 30"; Tallow names the slots the step gives it');
{
  const g4 = { id: 'hold:4', slot: 'hold', level: 4, name: 'Hold 4', price: 30 };
  eq(U.goalLine(g4, { D, wick: 'wick' })?.text, 'Next: Hold 4 · 30', 'the Wick at the start');
  eq(U.goalLine(g4, { D, wick: 'tallow' })?.text, 'Next: Hold 5 · 30', 'Tallow at the start: Hold 5 · 30 (WICKS §2.4)');
  eq(U.goalLine({ id: 'hold:5', slot: 'hold', level: 5, price: 120 }, { D, wick: 'tallow' })?.text, 'Next: Hold 6 · 120', 'Tallow at Hold 4: Hold 6 · 120');
  for (const w of ['taper', 'stub', 'ashwick']) eq(U.goalLine(g4, { D, wick: w })?.text, 'Next: Hold 4 · 30', `${w}: Hold 4 · 30`);
  eq(U.goalLine({ id: 'rod:1', slot: 'rod', level: 1, name: 'Ashwood', price: 50 }, { D })?.text, 'Next: Ashwood · 50', 'a tier keeps its TACKLE name');
  eq(U.goalLine({ id: 'reel:6', slot: 'reel', level: 6, name: 'Last Wheel', price: 100000 }, { D })?.text, 'Next: Last Wheel · 100.0k', 'from 10,000 the price reads 12.4k-style');
  ok(U.goalLine(null, { D }) === null && U.goalLine({ id: 'x' }, { D }) === null, 'no goal: no line');
  ok(U.goalLine(g4, { D }).html.includes('M3.4 12.6') && U.goalLine(g4, { D }).html.startsWith('Next: Hold 4 · '), 'the price wears the clam glyph in the DOM');
  ok(U.textAllowed('Next: Hold 5 · 30', { D }) && U.textAllowed('Next: Ashwood · 50', { D }), 'the goal lines pass the allow-list');
}

section('shelfCards (SPEC §8.4, PLAN CHOICEs 11 and 26): tabs with items, a card per slot, the bought rule');
{
  const L = fakeLoop({ D, clams: 40 });
  let m = U.shelfCards(L.shelf(), { D, clams: 40 });
  eq(m.tabs.map((t) => t.id).filter((id) => id !== 'home'), ['tackle', 'raft', 'bait', 'maps'], 'only the tabs with an item: Tackle, Raft (M1 step 3a: Bait and Maps; M1 step 5b: Home)');
  eq(m.tabs.filter((t) => t.id !== 'home').map((t) => t.label), [TL.tabs.tackle, TL.tabs.raft, TL.tabs.bait, TL.tabs.maps], 'one word each, TEXT_LOOP.tabs');
  const tack = m.tabs[0].cards, raft = m.tabs[1].cards;
  eq(tack.map((c) => c.id), ['rod:1', 'line:1', 'reel:1'], 'Tackle: the next tier of each slot');
  eq(tack.map((c) => c.name), ['Ashwood', 'Braided Gut', 'Brass Spool'], 'the TACKLE names');
  eq(tack.map((c) => c.line), [TL.shelf.rod, TL.shelf.line, TL.shelf.reel], 'the one line each');
  ok(tack.every((c) => c.price === 50 && c.dear === true && !c.bought), 'T1 50 each: too dear with 40 clams (the price dimmed, no other words)');
  ok(raft.length === 1 && raft[0].id === 'hold:4' && raft[0].name === 'Lidded Creel' && raft[0].line === TL.shelf.hold && raft[0].price === 30 && !raft[0].dear, 'Raft: Hold 4, the Lidded Creel, 30, affordable');
  // a buy while the shelf is open: the card stays in place reading "Yours." until the shelf closes; the next step on the next open
  ok(L.buy('hold:4').ok === true, 'buy Hold 4');
  m = U.shelfCards(L.shelf(), { D, clams: 10 });
  const h4 = m.tabs.find((t) => t.id === 'raft').cards[0];
  ok(h4.id === 'hold:4' && h4.bought === true && h4.buyWord === TL.yours && !h4.dear, 'the bought card reads "Yours." in its place', h4);
  L.s.session = [];
  m = U.shelfCards(L.shelf(), { D, clams: 10 });
  const h5 = m.tabs.find((t) => t.id === 'raft').cards[0];
  ok(h5.id === 'hold:5' && h5.price === 120 && h5.name === 'Double Creel' && h5.dear, 'the next open: Hold 5 · 120, the Double Creel');
  // Hold 6 and T2 keep a permanent "Yours." card (the last steps the shelf offers; M1 step 3a: LOOP.hold.shelfMax 6)
  const L2 = fakeLoop({ D, clams: 0, holdSlots: 6, tackle: { rod: 2, line: 2, reel: 2 } });
  m = U.shelfCards(L2.shelf(), { D, clams: 0 });
  const kitTabs = m.tabs.filter((t) => t.id === 'tackle' || t.id === 'raft');   // M1 step 3a: the Bait and Maps tabs are lane C's T133–T135
  ok(kitTabs.length === 2 && kitTabs.every((t) => t.cards.every((c) => c.bought && c.buyWord === TL.yours)), 'Hold 6 and the T2s: permanent "Yours." cards', kitTabs.map((t) => t.cards.map((c) => c.id)));
  eq(m.tabs[0].cards.map((c) => c.id), ['rod:2', 'line:2', 'reel:2'], 'the T2s in place');
  ok(U.shelfCards(null, { D }).tabs.length === 0 && U.shelfCards({ tabs: [{ id: 'bait', items: [] }] }, { D }).tabs.length === 0, 'an empty shelf: no tabs');
  for (const t of U.shelfCards(L.shelf(), { D }).tabs) for (const c of t.cards) ok(U.textAllowed(c.name, { D }) && U.textAllowed(c.line, { D }), `allow-list: ${c.name} and its line`);
}

section('slotCells (SPEC §8.1): the Wick\'s count of cells, the kept fish in order, scaled by class, giants gilded');
{
  const empty = U.slotCells({ slots: 3, fish: [] }, { D });
  ok(empty.length === 3 && empty.every((c) => !c.filled), 'three empty cells');
  ok(U.slotCells(fakeLoop({ D, wick: 'tallow' }).hold(), { D }).length === 4, 'Tallow: four cells (loop.hold().slots; the view never tests the Wick)');
  ok(U.slotCells(fakeLoop({ D, wick: 'tallow', holdSlots: 5 }).hold(), { D }).length === 6, 'Tallow at Hold 5: six cells');
  const fish = [{ uid: 'a', speciesId: 'dusk_minnow', sizeClass: 'small' }, { uid: 'b', speciesId: 'reedjaw_pike', sizeClass: 'trophy' }, { uid: 'c', speciesId: 'weeping_carp', sizeClass: 'elder', giant: true }];
  const cells = U.slotCells({ slots: 4, fish }, { D });
  eq(cells.map((c) => c.filled), [true, true, true, false], 'filled in the order caught, then empty');
  eq(cells.slice(0, 3).map((c) => c.scale), [U.CLASS_SCALE.small, U.CLASS_SCALE.trophy, U.CLASS_SCALE.elder], 'scaled by class (Small 0.7 … Elder 1.2)');
  ok(U.CLASS_SCALE.small === 0.7 && U.CLASS_SCALE.elder === 1.2, 'the class scale\'s ends');
  eq(cells.map((c) => !!c.gild), [false, false, true, false], 'a giant\'s slot is gold-edged');
  ok(U.slotCells({ slots: 3, fish: [{ uid: 'L', speciesId: 'belled_matriarch', sizeClass: 'keeper' }] }, { D })[0].gild, 'a legend\'s too');
  ok(U.slotCells({ slots: 2, fish: [...fish] }, { D }).length === 3, 'never fewer cells than fish');
  ok(U.slotCells(null).length === 0, 'no hold: no cells');
}

section('Murk\'s lines (SPEC §8.6): from TEXT_LOOP.murk, empty unless a once-line is due');
{
  for (const id of ['firstSale', 'firstQuiet', 'firstLetGo', 'firstTrophy', 'empty', 'wake']) ok(U.murkLineFor(id, 'wick', { D }) === TL.murk[id], `${id} is TEXT_LOOP.murk's`);
  ok(U.murkLineFor('firstSale', 'wick', { D, said: { firstSale: true } }) === '', 'said once: empty');
  ok(U.murkLineFor('firstChart', 'tallow', { D }) === TL.murk.firstChartBy.tallow, 'the Chart\'s line counts Tallow\'s four');
  ok(U.murkLineFor('sailOut', 'wick', { D }) === '' && U.murkLineFor('greet', 'wick', { D }) === '', 'no built greet, no rotating line here (sayOnce owns it)');
}

section('pillHold (T50): 0.6 s press and hold; with a full hold a tap is enough');
{
  ok(U.PILL_HOLD === 0.6, 'the hold is 0.6 s');
  ok(!U.pillHold(0.3, false).fire && near(U.pillHold(0.3, false).k, 0.5), 'a 0.3 s press does nothing (the ring half full)');
  ok(U.pillHold(0.6, false).fire && U.pillHold(0.7, false).fire && U.pillHold(0.7, false).k === 1, 'the timer fires at 0.6 s');
  ok(U.pillHold(0.59, false).fire === false, 'not a moment before');
  ok(U.pillHold(0, true).fire && U.pillHold(0.05, true).k === 1, 'a full hold: a tap');
  ok(U.pillHold(NaN, false).fire === false && U.pillHold(-1, false).k === 0, 'nonsense never fires');
}

section('T43: the allow-list helper');
{
  const W = U.allowedWords(D);
  for (const s of ALL) ok(U.textAllowed(s, { D, words: W, screen: 'title' }), `TEXT_LOOP: ${s.slice(0, 40)}`);
  for (const s of ['Dusk Minnow', 'The Mossmere', 'Tallow', 'The Wick', 'Keeper', 'Trophy', 'Prologue', 'Lidded Creel', 'Ashwood', 'length', 'A new personal best', 'Your first Prize', 'Evening 3'])
    ok(U.textAllowed(s, { D, words: W }), `allowed: ${s}`);
  for (const s of ['7', '9,999', '12.4k', '+193', '6 oz', '¼ oz', '4 lb 12 oz', '212 lb', '7,055 lb', '1', 'H']) ok(U.textAllowed(s, { D, words: W }), `a number or a weight: ${s}`);
  ok(U.textAllowed('56 cm', { D, words: W, screen: 'catch' }) && !U.textAllowed('56 cm', { D, words: W, screen: 'tally' }), '"cm" only on the card\'s length line');
  for (const s of ['12 Shells', 'Shells', 'Memories', '3 Memories', 'Abandon Descent', 'Descend', 'The Water Waits', 'Day 3', '1.2 kg', 'Trade', 'Begin'])
    ok(!U.textAllowed(s, { D, words: W, screen: 'jetty' }), `refused: ${s}`);
  ok(U.textAllowed(TL.newDescent, { D, words: W, screen: 'title' }) && U.textAllowed(TL.newDescent, { D, words: W, screen: 'newdescent' }), '"New Descent" on the fresh title and the panel');
  ok(!U.textAllowed(TL.newDescent, { D, words: W, screen: 'jetty' }) && !U.textAllowed(TL.newDescent, { D, words: W, screen: 'pause' }), '… and nowhere else');
  for (const w of Object.values(TL.wicks)) ok(U.textAllowed(w, { D, words: W }) && w.split(/\s+/).length <= 8 && w.length <= 36, `the Wick line "${w}" (≤ 8 words, ≤ 36 characters)`);
  for (const n of Object.values(TL.passives)) ok(U.textAllowed(n, { D, words: W, screen: 'newdescent' }) && n.split(/\s+/).length <= 2, `the passive's name "${n}" (on the allow-list, one or two words)`);
  for (const t of [D.FIRST_EVENING.tips.fe_cast, D.FIRST_EVENING.tips.fe_strike.touch, D.FIRST_EVENING.tips.fe_strike.desktop]) ok(U.textAllowed(t, { D, words: W }), `the tip: ${t}`);
}

section('T57, T73: the modal options (Escape never strands the player at home)');
{
  const M = U.LOOP_MODALS;
  ok(M.jetty.screen === true && M.jetty.blocking === false && M.jetty.escape === 'homepause', 'the Jetty: a screen; Esc opens the home pause (never closes the Jetty)');
  ok(M.tally.dismissable === false && M.tally.escape === 'skip', 'the tally: Esc (or a scrim tap) skips to its end; Sold stays');
  ok(M.shelf.escape === 'jetty' && M.chart.escape === 'jetty', 'the shelf and the Chart: Esc goes back to the Jetty');
  ok(M.homepause.escape === 'close', 'the home pause: Esc (Resume) back to the Jetty');
  ok(Object.isFrozen(M) && Object.isFrozen(M.jetty), 'frozen');
  // the home pause's words: exactly Resume · Settings
  ok(TL.resume === 'Resume' && TL.settings.label === 'Settings', 'the home pause: Resume · Settings');
  // the tutorial's clock waits under the home pause and Settings (the machine's rule)
  const tut = createLoopTutorial({ bus: core.createBus(), loop: fakeLoop({ D, tutorial: { done: false, step: 'arrive' } }), data: D });
  tut.start({});
  for (const top of ['homepause', 'settings']) { const t0 = tut.state.t; for (let i = 0; i < 200; i++) tut.update(0.05, { top }); ok(tut.state.t === t0 && !tut.wantsChart, `the tutorial clock waits under ${top}`); }
}

section('T58: the parked keys on a trip');
{
  for (const k of ['KeyC', 'KeyR', 'KeyB']) ok(U.tripKeySwallow(k) === true, `${k} is swallowed (nothing done, nothing said)`);
  for (const k of ['KeyJ', 'KeyH', 'Escape', 'Space', 'KeyE', 'KeyF', 'Digit1']) ok(U.tripKeySwallow(k) === false, `${k} is not ui's to swallow`);
  // ui.js routes a trip's keys through the view before the built creel / Burn / bait keys
  const ui = src('ui.js');
  ok(/if \(loopTrip\(\) && loopView\?\.handleKey\?\.\(code\) === true\) return true;\s*\n\s*if \(code === 'KeyC'\)/.test(ui), 'ui.handleKey asks the loop view first, on a trip only');
}

section('T47: the Journal species page reads "Evening N" under the loop');
{
  ok(U.journalFirst({ firstEvening: 3 }) === 'Evening 3', 'firstEvening 3 → "Evening 3"');
  ok(!/day|descent/i.test(U.journalFirst({ firstEvening: 3, firstDay: 2, firstRun: 4 })), 'no "Day" and no "descent"');
  ok(U.journalFirst({}) === '—' && U.journalFirst(null) === '—', 'none yet: "—"');
  const scr = src('ui-screens.js');
  ok(scr.includes("${loopJ ? esc(journalFirst(rec)) : `${rec.firstDay ? `Day ${rec.firstDay}` : '—'}${rec.firstRun ? `, descent ${rec.firstRun}` : ''}`}"), 'off the loop the built line is unchanged');
}

section('T54: a card on a trip has exactly two buttons, Keep · clam · value and Let go');
{
  const crown = D.LOOP.waters.mossmere.prices.crown;
  const A = U.cardActions({ clams: crown, holdFull: false, D });
  eq(A.map((a) => a.action), ['keep', 'letgo'], 'exactly Keep and Let go');
  eq(A.map((a) => a.label), [TL.keep, TL.letGo], 'their words');
  ok(A[0].clams === 500 && A[0].clamsText === '500' && A[0].primary && A[0].key === '1' && A[1].key === '2', 'a legend\'s first landing: Keep · 500 (key 1), Let go (key 2)');
  ok(!A.some((a) => /eat|render|release|weight|strike|favour/i.test(a.action + a.label)), 'no Eat, Render, Release, weight, Strike or favour');
  const F = U.cardActions({ clams: 7, holdFull: true, D });
  ok(F[0].disabled === true && F[0].autofocus === false && F[1].autofocus === true, 'a full hold: Keep dimmed (no words), Let go focused');
  eq(U.CARD_KEYS, { Digit1: 'keep', Digit2: 'letgo', Numpad1: 'keep', Numpad2: 'letgo' }, 'the keys: 1 keeps, 2 lets go');
  ok(U.cardActions({ clams: 12400, D })[0].clamsText === '12.4k', 'a value up to 12.4k fits the card\'s type');
  const scr = src('ui-screens.js');
  ok(scr.includes("const loopCard = loopOn() && run()?.outing === 'trip';"), 'the card\'s loop branch is a trip\'s, under LOOP_ENABLED');
  ok(scr.includes("for (const x of content.querySelectorAll('.gw-cc-stats > :not(.gw-cc-lenk):not(.gw-cc-len)')) x.remove();"), 'no worth, Strike or favour row: the length line alone');
}

section('T62: the title (titleModel)');
{
  eq(U.titleModel({ fresh: true, D }).words, [TL.newDescent, TL.settings.label], 'fresh: New Descent · Settings');
  eq(U.titleModel({ fresh: false, replay: false, D }).words, [TL.continue, TL.settings.label], 'with progress: Continue · Settings');
  eq(U.titleModel({ fresh: false, replay: true, D }).words, [TL.continue, TL.settings.label, D.INTRO.trigger.replay.word], 'and Prologue when the film can be replayed');
  ok(U.titleModel({ fresh: true, replay: true, D }).prologue === false, 'a fresh title has no Prologue');
  for (const m of [U.titleModel({ fresh: true, D }), U.titleModel({ fresh: false, replay: true, D })]) ok(!m.words.some((w) => /Begin|Journal|Shrine|Trials|Day/.test(w)), 'never Begin, Journal, Shrine, Trials or a day', m.words);
  ok(!m0().includes(TL.newDescent), 'no New Descent once the loop has begun');
  function m0() { return U.titleModel({ fresh: false, replay: true, D }).words; }
  const scr = src('ui-screens.js');
  ok(scr.indexOf('if (loopOn()) {\n        wrap.classList.add(\'gw-title--loop\');') > 0 && scr.indexOf("wrap.classList.add('gw-title--loop')") < scr.indexOf('      if (hasRun) {'), 'the loop branch runs before the built Continue and the intro\'s Begin');
  ok(scr.includes("const fresh = safe(() => g.loopFresh?.(), false) === true;"), 'it keys on game.loopFresh, never on introPending');
}

section('T59: New Descent (descentModel): five Wicks (each with its passive\'s picture), the lit Wick\'s passive (its picture, name and line), Back, Start');
{
  const M = U.descentModel(D, 'wick');
  eq(M.cards.map((c) => c.id), D.LOOP.wicks.order, 'the five in LOOP.wicks order');
  eq(M.cards.map((c) => c.name), ['The Wick', 'Taper', 'Stub', 'Tallow', 'Ashwick'], 'their CHARACTERS names');
  ok(M.passive === TL.passives.wick && M.line === TL.wicks.wick && M.words.length === 9 && M.words.includes(TL.back) && M.words.includes(TL.start),
    'its words: five names, the lit Wick\'s passive name and one line, Back, Start', M.words);
  for (const id of D.LOOP.wicks.order) {
    const m = U.descentModel(D, id);
    ok(m.passive === TL.passives[id] && m.line === TL.wicks[id] && m.sel === id && m.words.filter((w) => w === m.passive || w === m.line).length === 2, `${id}: its own name and line`);
  }
  ok(U.descentModel(D, 'nobody').sel === 'wick', 'an unknown id lights the Wick');
  // (the user, 16 November 2026: "more obvious what it does": WICKS.md's passive names are shown, and four lines say plainly what changes)
  eq(D.LOOP.wicks.order.map((id) => TL.passives[id]), ['Curious', 'Long Reach', 'Moth-Bright', 'Broad Back', 'Burns Back'], 'the passives\' names are WICKS.md\'s');
  ok(/\bslot\b/.test(TL.wicks.tallow) && /\bhold\b/.test(TL.wicks.tallow), 'Tallow\'s line says one more slot in the hold', TL.wicks.tallow);
  ok(/\bsooner\b/.test(TL.wicks.stub) && /\bevening/i.test(TL.wicks.taper) && !/^Firsts\b/.test(TL.wicks.wick), 'Stub\'s says sooner, Taper\'s says each evening, the Wick\'s no bare "Firsts"', [TL.wicks.stub, TL.wicks.taper, TL.wicks.wick]);
  { const T2 = { ...TL }; delete T2.passives; ok(U.descentModel({ ...D, TEXT_LOOP: T2 }, 'stub').words.length === 8, 'without TEXT_LOOP.passives: no empty word'); }
  // the five ink pictures (ui-icons passiveIcon): one a Wick, all different, ink in currentColor with the candle amber at most
  const I = await import('../../src/ui-icons.js');
  const pics = D.LOOP.wicks.order.map((id) => I.passiveIcon(id));
  ok(pics.every((p) => /^<svg class="gw-pico" viewBox="0 0 64 64" aria-hidden="true" focusable="false">/.test(p) && p.endsWith('</svg>') && p.includes('currentColor')), 'passiveIcon: an inline 64-grid SVG for each Wick, hidden from the reader, drawn in currentColor');
  ok(new Set(pics).size === 5 && I.passiveIcon('nobody') === '' && I.passiveIcon('curious') === '', 'five different pictures; an unknown id (or a passive\'s code id) draws nothing');
  const colours = [...new Set(pics.flatMap((p) => p.match(/#[0-9a-f]{3,8}\b/gi) || []))];
  ok(colours.every((c) => c.toLowerCase() === '#ed9e3b') && pics.every((p) => p.includes('var(--amber, #ed9e3b)')), 'no colour but ink (currentColor) and the Starlit candle amber (var(--amber))', colours);
  ok(pics.every((p) => !/\b(curious|long_reach|moth_bright|broad_back|burns_back)\b/.test(p)), 'no passive\'s code id in a picture (WICKS §4 guard 7)');
  const scr = src('ui-screens.js');
  ok(scr.includes('if (loopOn()) return openLoopDescent();'), 'openNewDescent\'s first line under the loop');
  const body = scr.slice(scr.indexOf('function openLoopDescent()'), scr.indexOf('// <<< LOOP 1a', scr.indexOf('function openLoopDescent()')));
  ok(/h\('div', 'gw-loop-passive'\)/.test(body) && body.includes('${passiveIcon(M.sel)}') && body.includes('gw-loop-passive-name') && body.includes('class="gw-loop-trait"') && body.includes('M.passive') && body.includes('M.line'),
    'the panel draws one passive block for the lit Wick: its picture, its name and its line (.gw-loop-trait)');
  // (the user, 16 November 2026: "Make it bigger on desktop and put icons on every portrait")
  ok(/<span class="gw-char-name"><\/span><span class="gw-char-pico">\$\{passiveIcon\(c\.id\)\}<\/span>/.test(body), 'every card carries its own passive\'s picture under its name (.gw-char-pico)');
  { const css = src('ui.css'), rule = (sel) => { const i = css.indexOf(`${sel} {`); return i < 0 ? '' : css.slice(i, css.indexOf('}', i)); };
    const op = (r) => Number((/opacity:\s*([\d.]+)/.exec(r) || [])[1]);
    const dim = rule('.gw-loop-chars .gw-char-pico'), lit = rule('.gw-loop-chars .gw-char.gw-on .gw-char-pico');
    ok(op(dim) > 0.3 && op(dim) < 0.75 && op(lit) === 1 && /var\(--ink-dim\)/.test(dim) && /var\(--ink-hi\)/.test(lit), 'the cards\' pictures: quiet on the unlit Wicks (dim ink, opacity under .75), bright on the lit one', [op(dim), op(lit)]);
    ok(/\.gw-loop-chars \.gw-char \.gw-portrait \{/.test(css) && !/\.gw-loop-chars \.gw-char(?::not\(\.gw-on\))? svg \{/.test(css), 'the portrait rules name .gw-portrait, so no card picture is sized or dimmed as a portrait');
    const px = (r, k) => Number((new RegExp(`${k}:\\s*clamp\\((\\d+)px`).exec(r) || [])[1]);
    const ico = rule('.gw-loop-passive-ico'), txt = rule('.gw-loop-passive-txt');
    ok(px(ico, 'width') >= 104 && px(txt, 'font-size') >= 28, 'the lit Wick\'s block on a desktop: a picture ≥ 104 px and a line ≥ 28 px at the least (it was 80 and 24)', [px(ico, 'width'), px(txt, 'font-size')]); }
  ok(body.includes("close: false") && body.includes("title: '', sub: ''"), 'no ✕, no heading, no sub-line');
  ok(!/characters\(\)|challenges\(\)|modeCards|nightsStep|ratingFor|getWaystones|gw-locked/.test(body), 'never characters(), challenges(), the mode cards, the nights, the rating, the waystones or a lock');
  ok(/ArrowLeft[\s\S]*ArrowRight[\s\S]*\(\?:Digit\|Numpad\)\(\[1-5\]\)[\s\S]*Enter/.test(body), '← → and 1–5 move the selection; Enter presses Start');
  ok(!body.includes('K.closeAll()'), 'Start never closes the panel first (ui-intro holds it under the ink)');
}

section('T68: the first trip\'s two words');
{
  ok(U.castTipDue({ evening: 1, seen: false, state: 'idle', since: 1.5, after: 1.5 }), 'fe_cast 1.5 s after run:start while idle');
  ok(!U.castTipDue({ evening: 1, seen: false, state: 'idle', since: 1.4, after: 1.5 }), 'not before');
  ok(!U.castTipDue({ evening: 1, seen: false, state: 'waiting', since: 9, after: 1.5 }), 'not with a line out');
  ok(!U.castTipDue({ evening: 2, seen: false, state: 'idle', since: 9 }) && !U.castTipDue({ evening: 1, seen: true, state: 'idle', since: 9 }), 'never on evening 2 or with the tip seen');
  ok(!U.castTipDue({ evening: 1, seen: false, state: 'idle', since: 9, shown: true }), 'once');
  ok(U.strikeTipText(D, true) === 'Now. Tap.' && U.strikeTipText(D, false) === 'Now. Click.', 'fe_strike: the touch or desktop form');
  ok(D.LOOP.tutorial.castTipAfter === 1.5, 'castTipAfter is LOOP.tutorial\'s');
  const ui = src('ui.js');
  ok(/function onTipEvent[\s\S]{0,120}if \(loopTrip\(\)\) return;/.test(ui) && /if \(loopTrip\(\)\) \{ tipQ\.length = 0; return; \}/.test(ui), 'every built tip stays suppressed on a trip (CHOICE 8)');
  ok(/if \(loopOn\) return;   \/\/ the loop: Murk's greet/.test(ui), 'and the merchant greet');
}

section('T69, T74: Settings and Forget everything under the loop');
{
  const W = U.settingsWords(D, true);
  ok(W.damageNumbers === false && W.flashSub === '', 'no Damage numbers row, no flare line under Reduced flashing');
  ok(W.ringFirst === TL.settings.ringFirst && W.ringFirst === 'First evening', 'the strike ring\'s first option: "First evening"');
  ok(W.hurry === TL.settings.hurry && /evening/.test(W.hurry) && !/outing/.test(W.hurry), 'the hurry row\'s line says "evening"');
  ok(W.forgetRow === TL.forget.row && W.forgetConfirm === TL.forget.confirm, 'Forget everything: TEXT_LOOP.forget');
  ok(!/Memor|relic|trial/i.test(W.forgetRow + W.forgetConfirm), 'no Memories, relics or trials');
  const B = U.settingsWords(D, false);
  ok(B.damageNumbers === true && B.ringFirst === 'First outing' && /Memories/.test(B.forgetRow), 'off the loop: the built words');
  const scr = src('ui-screens.js');
  ok(scr.includes("if (!SW) content.appendChild(toggleRow('damageNumbers', 'Damage numbers', true));"), 'the Damage numbers row is the built one, off the loop');
  ok(scr.includes("rrow.appendChild(btn('Erase', { cls: 'gw-btn--danger gw-btn--sm', onClick: () => confirm('Forget everything?'") && !scr.includes('window.confirm'), 'the confirms stay the in-page confirm() (never window.confirm)');
}

section('T71: the New Descent panel is held under the ink with the title (ui-intro takeTitle / dropTitle)');
{
  const mk = (loopOn) => {
    const removed = [], closed = [];
    const el = (id) => ({ id, remove() { removed.push(id); } });
    const entries = { title: { el: el('title') }, newdescent: { el: el('newdescent') } };
    const K = { ctx: { data: { LOOP_ENABLED: loopOn, INTRO: null }, bus: { on() {} } }, root: { classList: { add() {}, remove() {}, toggle() {} } }, h: () => ({}), report() {},
      entry: (id) => entries[id] || null, closeModal: (id, o) => { closed.push([id, !!o?.hold]); delete entries[id]; return true; } };
    return { V: createIntroView(K), removed, closed };
  };
  const on = mk(true);
  ok(on.V.takeTitle() === true, 'takeTitle at Start');
  eq(on.closed, [['newdescent', true], ['title', true]], 'under the loop: the panel and the title both held (closed for the game, their pictures standing)');
  ok(on.removed.length === 0, 'nothing removed before the ink');
  const off = mk(false);
  off.V.takeTitle();
  eq(off.closed, [['title', true]], 'off the loop: the title only, exactly as built (the built panel is left alone)');
  const src2 = src('ui-intro.js');
  ok(/if \(ctx\.data\?\.LOOP_ENABLED === true\) \{\s*\n\s*const nd = K\.entry\?\.\('newdescent'\);/.test(src2), 'the hold is behind LOOP_ENABLED');
  ok(/if \(V\.held\) \{ const nd = V\.held; V\.held = null; try \{ nd\.remove\(\); \}/.test(src2), 'dropTitle removes both under the full ink');
  ok(/const title = V\.title, inked = V\.titleInked, held = V\.held;/.test(src2), 'the film\'s start keeps both standing through its teardown');
}

section('T65/T67 (the view side): a done tutorial draws no cue and the goal line');
{
  const L = fakeLoop({ D, tutorial: { done: true, step: null } });
  const tut = createLoopTutorial({ bus: core.createBus(), loop: L, data: D });
  tut.start({ from: 'title' });
  const c = tut.cue();
  ok(c.tile === null && c.sail === false && c.line === null, 'no .gw-cue anywhere once done');
  ok(U.goalLine(L.goal(), { D, wick: L.wick() })?.text === 'Next: Hold 4 · 30', 'and the goal line drawn');
  const L2 = fakeLoop({ D, tutorial: { done: false, step: 'chart' }, wick: 'tallow' });
  const t2 = createLoopTutorial({ bus: core.createBus(), loop: L2, data: D });
  t2.start({ from: 'title' });
  ok(t2.step === 'wake' && t2.cue().tile === 'chart' && t2.cue().line === TL.murk.wake, 'a reload in the chart beat resumes at the wake');
  t2.onTile('chart');
  ok(t2.cue().line === TL.murk.firstChartBy.tallow && U.slotCells(L2.hold(), { D }).length === 4, 'Tallow: four cells, its line, the same on a reload');
}

section('the Chart: chartModel (SPEC §5.4, M1.md §3.8)');
{
  const m = freshLoopMeta(D);
  const C = U.chartModel(m, D, {});
  ok(C.sheets.length === 1 && C.sheets[0].waterId === 'mossmere' && C.sheets[0].name === 'The Mossmere' && C.sheets[0].places.length === 4, 'a fresh save: one sheet, the Mossmere, its four places (M1 step 3a)');
  ok(C.next?.waterId === 'sporewood' && C.next.shipped === false && C.pick.water === 'mossmere' && C.pick.place === null, 'the next water sealed (M1 step 3b: Sporewood, "Coming soon"); open water chosen');
  ok(C.hold.slots === 3, 'three slots');
  ok(U.chartModel(m, D, { slots: 4 }).hold.slots === 4, 'hold.slots from loop.hold().slots');
  ok(U.chartModel({ loop: { ...m.loop, wick: 'tallow' } }, D).hold.slots === 4, 'without it, data.loopSlots (Tallow four)');
  ok(U.chartModel({ loop: { ...m.loop, maps: { lakes: ['mossmere', 'sporewood'], places: [] } } }, D).sheets.length === 1, 'no Sporewood row in 1a (only waters LOOP.waters ships)');
  ok(U.chartModel(m, D, { tutorial: true }).next === null && U.chartModel(m, D, { tutorial: true }).tutorial === true, 'the tutorial\'s Chart: one water, one line');
  ok(U.chartModel(null, D).sheets[0]?.waterId === 'mossmere', 'no meta: the Mossmere, never a throw');
  const v = U.chartVignette(D, 'mossmere');
  ok(v.startsWith('<svg class="gw-cv"') && (v.match(/gw-cv-isle/g) || []).length === D.ZONES[0].arena.islands.length && v.includes('gw-cv-home') && v.includes('gw-cv-way'), 'the vignette: the rim, its islands, the Jetty\'s lamp, the way out');
  ok(!/gate|sluice/i.test(v), 'no gate on the Chart (scenery, never a destination)');
}

section('T133: chartModel\'s places and its one next (M1.md §3.8; the signature and keys unchanged)');
{
  const { placesMeta } = await import('./loop-fixture.mjs');
  const { mapCards, sealsOf } = await import('../../src/progression-loop.js');
  ok(U.chartModel.length === 2, 'chartModel(meta, D, opts = {}): one signature');
  const m = freshLoopMeta(D);
  const C = U.chartModel(m, D, {});
  eq(Object.keys(C), ['sheets', 'next', 'hold', 'fitted', 'pick', 'tutorial'], 'its keys are 1a\'s');
  const P = C.sheets[0].places;
  eq(P.map((p) => p.id), ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool'], 'a fresh save: the four places in the Chart\'s order (day, old, night, crown)');
  ok(P.every((p) => JSON.stringify(Object.keys(p)) === JSON.stringify(['id', 'kind', 'owned', 'price', 'best', 'giantLanded', 'marked', 'wounds'])), 'each place exactly {id, kind, owned, price, best, giantLanded, marked, wounds}', P[0]);
  eq(P.map((p) => p.kind), ['day', 'old', 'night', 'crown'], 'their kinds');
  eq(P.map((p) => p.price), [60, 150, null, null], 'the prices are mapCards\' (Murk\'s three: the two cheapest place maps): 60, 150, null, null');
  ok(P.every((p) => p.owned === false && p.best === null && p.giantLanded === false && p.marked === false && p.wounds === 0), 'none owned, no best, no giant, no mark, no wound');
  eq(C.next, { waterId: 'sporewood', shipped: false, seals: sealsOf(m, D, 'sporewood') }, 'next: {waterId: sporewood, shipped: false, seals: sealsOf\'s} (one source)');
  const sl = C.next.seals;
  ok(typeof sl.map.held === 'boolean' && typeof sl.gear.held === 'boolean' && sl.gear.slot === 'rod' && sl.gear.tier === 1 && typeof sl.catch.held === 'boolean' && sl.catch.have === 0 && sl.catch.need === 12, 'a superset of 3b\'s chartNext shape (map.held, gear.held/slot/tier, catch.held/have/need)', sl);
  eq(U.chartNext(m, D), C.next, 'chartNext(meta, D) is the one next (3b\'s export, its seals sealsOf\'s)');
  const old = freshLoopMeta(D); old.loop.maps.lakes = ['mossmere', 'sporewood'];
  const on = U.chartNext(old, D);
  ok(on?.waterId === 'sporewood' && on.shipped === false && on.seals.map.held === true, 'an old save that owns Sporewood\'s map: Sporewood is still the next sheet, its map seal pressed', on);
  const T = U.chartModel(m, D, { tutorial: true });
  ok(T.next === null && T.sheets[0].places.every((p) => p.price === null), 'in the tutorial every price null and next null');
  // a later save: two owned, a best fish there, a giant landed, a mark, the Matriarch's wounds
  const pm = placesMeta(D, { own: ['lily_maze', 'bell_pool'] });
  pm.loop.best = { lily_maze: { speciesId: 'candlefin_koi', length: 51, extra: 'no' }, 'open:mossmere': { speciesId: 'reedjaw_pike', length: 60 } };
  pm.loop.giants = { thousandcast_pike: { landed: 0, marked: 1 }, hullkiss_lamprey: { landed: 2, marked: 0 } };
  pm.loop.legends = { belled_matriarch: 1 };
  pm.legendWounds = { belled_matriarch: 2 };
  const L = U.chartModel(pm, D, {}).sheets[0].places, by = Object.fromEntries(L.map((p) => [p.id, p]));
  ok(by.lily_maze.owned && by.lily_maze.price === null && by.bell_pool.owned && by.bell_pool.price === null, 'an owned place\'s price is null');
  eq(by.lily_maze.best, { speciesId: 'candlefin_koi', weight: D.fishWeight(D.SPECIES_BY_ID.candlefin_koi, { length: 51 }) }, 'best: {speciesId, weight} with weight = data.fishWeight of the saved length, no other field passed through');
  ok(by.under_the_span.marked === true && by.under_the_span.giantLanded === false && by.buoy_lights.giantLanded === true && by.buoy_lights.marked === false, 'giantLanded and marked from meta.loop.giants');
  ok(by.bell_pool.giantLanded === true && by.bell_pool.wounds === 2 && by.lily_maze.wounds === 0, 'the Bell Pool: its legend landed, her wounds (meta.legendWounds)');
  eq(L.filter((p) => p.price != null).map((p) => [p.id, p.price]), [['under_the_span', 150], ['buoy_lights', 260]], 'the two cheapest unowned maps priced');
  // T109's Chart case: the Chart's non-null prices are exactly mapCards' place cards
  for (const own of [[], ['lily_maze'], ['lily_maze', 'under_the_span'], ['under_the_span', 'buoy_lights'], ['lily_maze', 'under_the_span', 'buoy_lights'], ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool']]) {
    const mm = placesMeta(D, { own });
    const cards = mapCards(D, mm.loop, { meta: mm }).filter((c) => c.placeId).map((c) => [c.placeId, c.price]);
    const chart = U.chartModel(mm, D, {}).sheets[0].places.filter((p) => p.price != null).map((p) => [p.id, p.price]);
    eq(chart, cards, `T109: the Chart's prices are mapCards' (${own.join(', ') || 'none owned'})`);
  }
  // the pick: the saved one while the Chart can still choose it
  pm.loop.chartPick = { water: 'mossmere', place: 'bell_pool' };
  eq(U.chartModel(pm, D, {}).pick, { water: 'mossmere', place: 'bell_pool' }, 'the first open chooses the place sailed to last (meta.loop.chartPick)');
  pm.loop.chartPick = { water: 'mossmere', place: 'buoy_lights' };
  eq(U.chartModel(pm, D, {}).pick, { water: 'mossmere', place: null }, 'a pick the Chart cannot choose (a place not owned): open water');
  pm.loop.chartPick = 'first';
  eq(U.chartModel(pm, D, {}).pick, { water: 'mossmere', place: null }, 'a chartPick that is not an object reads as none');
  pm.loop.chartPick = { water: 'mossmere', place: 'bell_pool' };
  eq(U.chartModel(pm, D, { tutorial: true }).pick, { water: 'mossmere', place: null }, 'the tutorial: open water');
}

section('T134 (node): the list Chart\'s rows, the bait slot, the forced list');
{
  const { placesMeta } = await import('./loop-fixture.mjs');
  const fresh = U.chartModel(freshLoopMeta(D), D, {});
  const rows = U.chartRows(fresh, D);
  eq(rows.map((r) => [r.id, r.owned, r.price, r.name]), [['lily_maze', false, 60, null], ['under_the_span', false, 150, null]], 'a fresh save: a row per priced place, unnamed (the blot\'s rule), nothing else');
  const pm = placesMeta(D, { own: ['lily_maze', 'bell_pool'], balls: 2 });
  const C = U.chartModel(pm, D, {});
  eq(U.chartRows(C, D).map((r) => [r.id, r.owned, r.price, r.name]), [['lily_maze', true, null, 'The Lily Maze'], ['under_the_span', false, 150, null], ['buoy_lights', false, 260, null], ['bell_pool', true, null, 'The Bell Pool']],
    'owned rows named, priced rows priced, in the Chart\'s order');
  eq(U.chartRows(U.chartModel(pm, D, { tutorial: true }), D), [], 'the tutorial: exactly 1a\'s list (no place row)');
  eq(U.baitSlotModel(C, pm.loop, D), { id: 'heartmoss', water: 'mossmere', name: 'Heartmoss Ball', count: 2, fitted: false, can: true }, 'the bait slot: the Heartmoss Ball and its count');
  pm.loop.fitted.bait = 'heartmoss';
  ok(U.baitSlotModel(U.chartModel(pm, D, {}), pm.loop, D).fitted === true, 'fitted once loop.fit has written fitted.bait');
  const none = placesMeta(D, {});
  eq(U.baitSlotModel(U.chartModel(none, D, {}), none.loop, D), { id: 'heartmoss', water: 'mossmere', name: 'Heartmoss Ball', count: 0, fitted: false, can: false }, 'none in the bag: an empty slot');
  ok(U.baitSlotModel(U.chartModel(pm, D, { tutorial: true }), pm.loop, D) === null, 'no bait slot in the tutorial (T65, T67)');
  const v = src('ui-loop.js');
  ok(/function renderChartList\(entry, body, model\)/.test(v) && /function baitSlot\(model, \{ onFit = null \} = \{\}\)/.test(v) && /function placeBaitSlot\(root, model, entry\)/.test(v), 'renderChartList(entry, body, model), baitSlot(model, {onFit}) and placeBaitSlot are their own pieces');
  ok(/b\.dataset\.slot = 'bait';/.test(v) && /sail\.parentNode\.insertBefore\(el, sail\)/.test(v), 'the bait slot is [data-slot=bait], put in the foot before [data-action=sail]');
  ok(/book\.dataset\.action = 'catalogue';/.test(v) && /openJournal\?\.\(\{ from: 'chart', zone: sh\.waterId \}\)/.test(v), 'the Mossmere row\'s book glyph [data-action=catalogue] opens openJournal({from: \'chart\', zone})');
  ok(/openShelf\(\{ tab: 'maps', focus: r\.id \}\)/.test(v) && /L\('setPick', \{ \.\.\.s\.pick \}\)/.test(v) && /emit\('chart:pick'/.test(v), 'a priced row opens its map card; an owned row is chosen (setPick, chart:pick)');
  ok(/chartList: \(on\) =>/.test(v) && /ctx\.debug\.ui\.chartList = /.test(src('ui.js')), 'ctx.debug.ui.chartList(on): the forced list for 3b\'s drawn Chart');
}

section('T141: the hold row (Hold 6, Tallow\'s seven; two rows past six on a phone, one on a desktop)');
{
  ok(U.slotCells(fakeLoop({ D, holdSlots: 6, wick: 'tallow' }).hold(), { D }).length === 7, 'Tallow at Hold 6: seven cells');
  ok(U.slotCells(fakeLoop({ D, holdSlots: 6, wick: 'wick' }).hold(), { D }).length === 6, 'the Wick at Hold 6: six cells');
  ok(D.LOOP.hold.shelfMax === 6, 'Hold 6 on the shelf (shelfMax 6)');
  const v = src('ui-loop.js'), css = src('ui.css');
  ok(/holdRow\.classList\.toggle\('gw-hold--wrap', cells\.length > 6\)/.test(v), 'the row marks itself past six cells');
  const phone = css.slice(css.lastIndexOf('@media (max-width: 700px)'));
  ok(/\.gw-hud\.gw-loop \.gw-hold\.gw-hold--wrap \{ flex-wrap: wrap; width: 196px;/.test(phone) && /\.gw-hud\.gw-loop \.gw-hold\.gw-hold--wrap \{ flex-wrap: nowrap; \}/.test(css), 'two rows (4 + 3, 196 px) on a phone, one on a desktop');
  ok(/Math\.min\(9, Math\.round\(F\.bitesLeft\)\)/.test(src('ui-hud-v3.js')), 'the good-bite dots up to nine');
}

section('T142: the lift\'s title card (place:lift {phase: \'title\', name}, 1.2 s, the HUD layer)');
{
  eq(U.liftTitle({ placeId: 'lily_maze', phase: 'title', name: 'The Lily Maze' }, D), { show: true, name: 'The Lily Maze', dur: D.LOOP.lift.title }, 'the title phase: the place\'s name for LOOP.lift.title s');
  ok(U.liftTitle({ placeId: 'lily_maze', phase: 'start', name: 'The Lily Maze' }, D).show === false && U.liftTitle({ placeId: 'lily_maze', phase: 'end' }, D).show === false, 'nothing at start or end');
  eq(U.liftTitle({ placeId: 'bell_pool', phase: 'title' }, D).name, 'The Bell Pool', 'no name in the payload: the place\'s own');
  ok(D.LOOP.lift.title === 1.2, '1.2 s');
  const v = src('ui-loop.js');
  ok(/on\('place:lift'/.test(v) && /hudEl\.appendChild\(el\)/.test(v.slice(v.indexOf('function showLiftTitle'), v.indexOf('function dropLiftTitle'))), 'shown in the HUD layer (never in world space)');
  ok(U.textAllowed('The Lily Maze', { D }) && U.textAllowed('Under the Span', { D }) && U.textAllowed('The Buoy Lights', { D }) && U.textAllowed('The Bell Pool', { D }), 'its words are the places\' names');
}

section('T143: words (TEXT_LOOP, names, numbers; no percentage literal)');
{
  const W = U.allowedWords(D);
  for (const w of [TL.comingSoon, ...Object.values(TL.maps), TL.shelf.heartmoss, TL.back, 'Heartmoss Ball', 'Thousandcast Pike', '★ Thousandcast Pike', '12/12', '7/12', '· · ·', '★', '14 lb 10 oz', '60', '150'])
    ok(U.textAllowed(w, { D, words: W }), `"${w}"`);
  for (const w of ['6%', 'Coming Soon!', 'Locked', 'The Thousandcast Pike bites at dusk']) ok(!U.textAllowed(w, { D, words: W }), `not "${w}"`);
  const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  for (const f of ['ui-loop.js', 'ui-screens.js']) {
    const code = strip(src(f));
    const loopPart = f === 'ui-screens.js' ? code.slice(code.indexOf('function openCatalogue'), code.indexOf('function openLog')) : code;
    ok(loopPart.length > 1000 && !/\d\s*%['"`]|%\$\{|['"`]%/.test(loopPart), `no percentage literal in ${f}${f === 'ui-screens.js' ? '\'s catalogue' : ''}`);
  }
  const walk = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (v && typeof v === 'object') Object.values(v).forEach((x) => walk(x, out)); return out; };
  ok(!walk(TL).some((t) => /%/.test(t)), 'no percentage in TEXT_LOOP');
}

section('T144: Murk\'s lines at their moments, each once a save; the catch seal\'s press');
{
  eq(TL.murk.firstMap, "It's in the mist. Go and look.", 'the first place map');
  eq(TL.murk.firstGiant, 'That one had a name before you met it.', 'the first giant sold');
  eq(TL.murk.legendFirst, "Her. You brought me her. Sit down, I'll count it twice.", 'the Matriarch\'s first tally');
  eq(TL.murk.listComplete, "Every fish in this water. I'll write that down.", 'the list complete');
  eq(TL.shelf.heartmoss, 'For the Belled Matriarch. One try.', 'the ball\'s shelf line');
  const row = (o) => ({ giant: false, legend: false, sizeClass: 'keeper', ...o });
  eq(U.saleLineId({ rows: [row({})], said: {} }), 'firstSale', 'a first sale: firstSale');
  eq(U.saleLineId({ rows: [row({ giant: true })], said: { firstSale: true } }), 'firstGiant', 'the first giant sold: firstGiant');
  eq(U.saleLineId({ rows: [row({ giant: true })], said: { firstSale: true, firstGiant: true } }), 'firstTrophy', 'a second giant: the first Trophy-or-bigger line (once)');
  eq(U.saleLineId({ rows: [row({ legend: true }), row({ giant: true })], said: { firstSale: true } }), 'legendFirst', 'her first tally: legendFirst first');
  eq(U.saleLineId({ rows: [row({ legend: true })], said: { firstSale: true, legendFirst: true, firstGiant: true, firstTrophy: true } }), null, 'each once');
  eq(U.saleLineId({ rows: [row({ legend: true })], said: { firstSale: true }, listDone: true }), 'listComplete', 'the list complete: its line before any other (the catch seal presses with it)');
  eq(U.saleLineId({ rows: [], empty: true, said: {}, listDone: true }), 'listComplete', '… after an empty hold too (a fish let go counts)');
  eq(U.saleLineId({ rows: [], empty: true, said: { listComplete: true }, listDone: true }), null, 'once a save');
  const fl = fakeLoop({ D });
  ok(fl.sayOnce('listComplete') === TL.murk.listComplete && fl.sayOnce('listComplete') === null, 'sayOnce gives each line once (the ledger\'s rule)');
  const v = src('ui-loop.js');
  ok(/sayOnce', 'firstMap'\)/.test(v) && /String\(id\)\.startsWith\('place:'\)/.test(v), 'firstMap after a place map is bought (the shelf\'s head)');
  ok(/emit\('loop:seal', \{ seal: which \}\)/.test(v) && /press: line && id === 'listComplete' \? 'catch' : null/.test(v), 'the press: loop:seal {seal: \'catch\'} with Murk\'s line at the first home after the list completes');
}

section('v8 T83: the Journal\'s Mossmere tab under the loop: the list first, its count');
{
  const m = freshLoopMeta(D);
  const ids = listFor(D, 'mossmere');
  m.journal = { [ids[0]]: { caught: 2 }, [ids[1]]: { caught: 0, seen: true }, [ids[2]]: { caught: 0 }, gloam_eel: { caught: 4 } };
  const J = U.journalModel(m, D, 'mossmere', { listFor });
  ok(J.need === 12 && J.list.length === 12, 'twelve on the list (M1 step 3a, with the Kissmark Trout)', J.list.map((x) => x.id));
  ok(J.have === 1 && J.badge === '1/12', 'counted by num(caught) > 0 only: a Glimpsed entry and a caught-0 entry do not count, a fish off the list neither', J.badge);
  ok(J.rest.map((x) => x.id).includes('gloam_eel') && J.rest.map((x) => x.id).includes('belled_matriarch') && !J.rest.some((x) => ids.includes(x.id)), 'the Eel and the Matriarch follow, outside the count');
  ok(J.list[0].landed && !J.list[1].landed, 'each listed card knows its notch');
  ok(U.journalModel(m, D, 'mossmere', {}).need === 0, 'no listFor: an empty list (the built grid)');
  const scr = src('ui-screens.js');
  ok(scr.includes("badge: loopJ ? loopBadge(z.id) : `${n}/${sps.length}` };"), 'the badge is the list\'s under the loop, the built count off it');
}

section('every word the screens show is TEXT_LOOP\'s or a built word SPEC §8 names');
{
  const W = U.allowedWords(D);
  const words = [
    ...U.titleModel({ fresh: true, D }).words, ...U.titleModel({ fresh: false, replay: true, D }).words, ...U.descentModel(D, 'stub').words,
    // (M1 step 3a: every tab's cards, the Bait and Maps tabs' too: T143's allow-list names the places and the bait)
    ...U.shelfCards(fakeLoop({ D }).shelf(), { D }).tabs.flatMap((t) => [t.label, ...t.cards.flatMap((c) => [c.name, c.line, c.priceText])]),
    ...U.cardActions({ clams: 9, D }).map((a) => a.label), TL.sold, TL.sail, TL.home, TL.resume, TL.holdFull, TL.odds, TL.yours,
    ...Object.values(TL.jetty), U.tallyPlan({ lines: [] }, { D }).line,
  ];
  for (const w of words) ok(U.textAllowed(w, { D, words: W, screen: 'newdescent' }), `"${w}"`);
  // the view's fallbacks are TEXT_LOOP's own words (S delivered them; no stub literal is left for the stager)
  const v = src('ui-loop.js');
  const fall = [...v.matchAll(/TL(?:\(\))?\.[a-zA-Z.?]+ \|\| '([^']+)'/g)].map((m) => m[1]).filter((w) => !/[{}]/.test(w));
  ok(fall.length >= 8 && fall.every((w) => ALL.has(w)), `every fallback literal in ui-loop.js is a TEXT_LOOP string (${fall.length})`, fall.filter((w) => !ALL.has(w)));
}

section('flag-off safety (PLAN §4.1): nothing of the loop is built or read off the loop');
{
  const ui = src('ui.js');
  ok(/const loopOn = D\(\)\.LOOP_ENABLED === true;/.test(ui) && /if \(loopOn\) \{ try \{ loopView = createLoopView\(K\); \}/.test(ui), 'ui.js creates the view only when LOOP_ENABLED (read once)');
  ok(!/GW_LOOP/.test(ui + src('ui-loop.js') + src('ui-screens.js') + src('ui-hud.js') + src('ui-hud-v3.js') + src('loop-tutorial.js')), 'no lane C file reads globalThis.GW_LOOP');
  const hud = src('ui-hud.js');
  ok(/const loopTrip = D\(\)\.LOOP_ENABLED === true && r\.outing === 'trip';/.test(hud), 'the HUD\'s loop branch is a trip\'s under LOOP_ENABLED');
  const scr = src('ui-screens.js');
  ok(/const loopOn = \(\) => D\(\)\.LOOP_ENABLED === true;/.test(scr) && /function openDescend\(\) \{\s*\n\s*if \(loopOn\(\)\) return;/.test(scr), 'the screens read the data\'s switch; openDescend returns under the loop (T46)');
  const css = src('ui.css');
  const block = css.slice(css.indexOf('/* >>> LOOP 1a'), css.indexOf('/* <<< LOOP 1a */'));
  ok(block.length > 1000 && css.trim().endsWith('/* <<< LOOP 1a */'), 'one marked CSS block at the end of ui.css');
  const bare = block.replace(/\/\*[\s\S]*?\*\//g, '');
  const top = (sel) => { const out = []; let d = 0, cur = ''; for (const ch of sel) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; };
  const sels = bare.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, '').match(/(^|\})\s*([^{}@]+)\{/g) || [];
  const loose = sels.map((s) => s.replace(/^\}?\s*/, '').replace(/\{$/, '').trim()).filter((s) => s && !s.startsWith('@') && top(s).some((x) => !/gw-loop|gw-hold|gw-slot|gw-home|gw-fav-dots|gw-loopfav|gw-murk-line|gw-jetty|gw-tile|gw-cue|gw-trow|gw-tally|gw-scale|gw-sc-|gw-shelf|gw-chart|gw-cv|gw-clams|gw-cc-loop|gw-toast--loop|gw-cc-star|gw-cc-giant|gw-jr-notch|gw-jr-hours|gw-jr-hr|gw-jr-rule|gw-jr-listed|gw-title--loop|gw-p-homepause|gw-p-trippause|gw-p-tally|gw-p-shelf|gw-p-chart|gw-rm|gw-m-jetty|gw-m-newdescent:has\(\.gw-loop-descent\)|^(0%|100%|\d+%)/.test(x.trim())));
  ok(loose.length === 0, 'every rule in the block is under a loop class or a loop-only class', loose.slice(0, 8));
  ok(!/gw-world|position:\s*fixed/.test(bare), 'nothing in world space (no rule on the world layer, nothing fixed over the scene)');
}

console.log(`\nui-loop: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
