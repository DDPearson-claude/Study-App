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
  eq(m.tabs.map((t) => t.id), ['tackle', 'raft'], 'only the tabs with an item: Tackle and Raft');
  eq(m.tabs.map((t) => t.label), [TL.tabs.tackle, TL.tabs.raft], 'one word each, TEXT_LOOP.tabs');
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
  // Hold 5 and T2 keep a permanent "Yours." card (the last steps a 1a shelf offers)
  const L2 = fakeLoop({ D, clams: 0, holdSlots: 5, tackle: { rod: 2, line: 2, reel: 2 } });
  m = U.shelfCards(L2.shelf(), { D, clams: 0 });
  ok(m.tabs.length === 2 && m.tabs.every((t) => t.cards.every((c) => c.bought && c.buyWord === TL.yours)), 'Hold 5 and the T2s: permanent "Yours." cards', m.tabs.map((t) => t.cards.map((c) => c.id)));
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

section('T59: New Descent (descentModel): five Wicks, one line, Back, Start');
{
  const M = U.descentModel(D, 'wick');
  eq(M.cards.map((c) => c.id), D.LOOP.wicks.order, 'the five in LOOP.wicks order');
  eq(M.cards.map((c) => c.name), ['The Wick', 'Taper', 'Stub', 'Tallow', 'Ashwick'], 'their CHARACTERS names');
  ok(M.line === TL.wicks.wick && M.words.length === 8 && M.words.includes(TL.back) && M.words.includes(TL.start), 'its words: five names, one trait line, Back, Start', M.words);
  for (const id of D.LOOP.wicks.order) ok(U.descentModel(D, id).line === TL.wicks[id] && U.descentModel(D, id).sel === id, `${id}: its own line`);
  ok(U.descentModel(D, 'nobody').sel === 'wick', 'an unknown id lights the Wick');
  const scr = src('ui-screens.js');
  ok(scr.includes('if (loopOn()) return openLoopDescent();'), 'openNewDescent\'s first line under the loop');
  const body = scr.slice(scr.indexOf('function openLoopDescent()'), scr.indexOf('// <<< LOOP 1a', scr.indexOf('function openLoopDescent()')));
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
  ok(C.sheets.length === 1 && C.sheets[0].waterId === 'mossmere' && C.sheets[0].name === 'The Mossmere' && C.sheets[0].places.length === 0, 'a fresh save: one sheet, the Mossmere, no places');
  ok(C.next === null && C.pick.water === 'mossmere' && C.pick.place === null, 'no next; open water chosen');
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

section('v8 T83: the Journal\'s Mossmere tab under the loop: the list first, its count');
{
  const m = freshLoopMeta(D);
  const ids = listFor(D, 'mossmere');
  m.journal = { [ids[0]]: { caught: 2 }, [ids[1]]: { caught: 0, seen: true }, [ids[2]]: { caught: 0 }, gloam_eel: { caught: 4 } };
  const J = U.journalModel(m, D, 'mossmere', { listFor });
  ok(J.need === 11 && J.list.length === 11, 'eleven on the list (M1 step 2)', J.list.map((x) => x.id));
  ok(J.have === 1 && J.badge === '1/11', 'counted by num(caught) > 0 only: a Glimpsed entry and a caught-0 entry do not count, a fish off the list neither', J.badge);
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
