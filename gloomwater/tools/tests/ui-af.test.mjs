// Unit tests for the automatic-fishing presentation and the logs (src/ui-af.js; DESIGN §25.6.4–§25.6.11, §25.14.2a U2′ / U19;
// CONTRACT §13.7 ui, §13.7a): the log lock, the strike word and ring, the class estimate's words, the got-away note (toast for
// Small–Prize, card for Trophy+; causes, hints, Marked Fish lines; never a %), the Journal's Your odds block (floored %, "?" unseen,
// "—" unreachable, owned relics as progression passes them, the best owned item's row, a cap is never printed), the gear log's lines
// and pinned compare, the rating in words, the PB / Old Ledger knots and the 2.4 s PB stretch, and the static guarantees: ui reads
// no key D1′ retired, and a % is produced only by the two log helpers.
//   node tools/tests/ui-af.test.mjs   (or node tools/check.mjs)
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const D = await import('../../src/data.js?ui-af');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;
const AF = await import('../../src/ui-af.js');
const V = await import('../../src/ui-v3.js');

const here = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const section = (s) => console.log(`- ${s}`);
const NB = ' ';

section('the automatic-fishing path');
ok(!AF.afOn(dataV1), 'flag-off data is never on the automatic path');
ok(AF.afOn(D), 'a v3 phase-1 build is');
ok(!AF.afOn(null) && !AF.afOn({ V3_ENABLED: true }), 'no AUTOFISH, no automatic path');

section('the log lock (AUTOFISH.logLock): from the cast until the line is back');
for (const st of ['charging', 'casting', 'waiting', 'bite', 'reeling', 'landing']) ok(AF.logLocked({ af: true, state: st }), `locked while ${st}`);
ok(!AF.logLocked({ af: true, state: 'idle' }), 'open when idle');
ok(AF.logLocked({ af: true, state: 'lost', awaitingNote: true }), 'locked in the quiet beat after a loss (before the note)');
ok(!AF.logLocked({ af: true, state: 'lost', awaitingNote: false }), 'open once the got-away note shows');
ok(!AF.logLocked({ af: true, state: 'landing', cardOpen: true }), 'open once the catch card shows');
for (const st of ['charging', 'waiting', 'bite', 'reeling', 'landing', 'lost']) ok(!AF.logLocked({ af: false, state: st, awaitingNote: true }), `flag off: never locked (${st})`);
eq(AF.LOCK_STATES, ['charging', 'casting', 'waiting', 'bite', 'reeling', 'landing'], 'the lock states are CONTRACT §13.7a\'s');
eq(D.AUTOFISH.text.logLocked, 'Reel in first.', 'the refusal reads "Reel in first."');
eq(D.AUTOFISH.logLockRoutes, ['KeyJ', 'pauseJournal', 'ledgerEntry', 'gearBench', 'murkLureRows', 'murkBaitRows', 'feLogGlyph', 'gotAwayLink'], 'every lock route is known (ui refuses each)');

section('the strike word and the strike ring (DESIGN §25.6.4)');
eq(AF.strikeWord(D, 'clean', 999), { text: 'Clean', grade: 'clean', tone: 'clean' }, 'Clean, always, with the lavender glow');
eq(AF.strikeWord(D, 'early', 0)?.tone, 'dim', 'Early, dim lavender');
eq(AF.strikeWord(D, 'late', 50)?.text, 'Late', 'Late, always');
eq(AF.strikeWord(D, 'struck', 0)?.text, 'Struck', '"Struck" for the first strikes');
ok(AF.strikeWord(D, 'struck', 19) && !AF.strikeWord(D, 'struck', 20), '…for the first 20 only (AUTOFISH.strike.showStruckWord)');
ok(!AF.strikeWord(D, 'spooked', 0) && !AF.strikeWord(D, 'passed', 0), 'no word for a spook or a pass (they are not strikes)');
ok(AF.strikeRingOn('always') && !AF.strikeRingOn('never', { firstExpedition: true, firstEvening: true }), 'always / never');
ok(AF.strikeRingOn('firstExpedition', { firstExpedition: true }) && AF.strikeRingOn('firstExpedition', { firstEvening: true }) && !AF.strikeRingOn('firstExpedition', {}), 'the default: the First Evening and the first expedition only');
ok(AF.strikeRingOn(undefined, { firstEvening: true }) && !AF.strikeRingOn(undefined, {}), 'an unset setting is the default (AUTOFISH.strike.ring.default)');
const W = { small: 0.6, keeper: 0.7, prize: 0.8, trophy: 0.85, elder: 0.9 };
for (const [c, w] of Object.entries(W)) {
  const t = AF.strikeTiming(D, c, 1);
  ok(Math.abs(t.dur - w) < 1e-9 && t.clean >= 0.3 - 1e-9 && Math.abs(t.clean - Math.max(0.3, w * 0.4)) < 1e-9, `${c}: window ${w} s, Clean part max(40%, 0.3 s)`, t);
}
ok(AF.strikeTiming(D, 'elder', 2).dur === 1.4 && AF.strikeTiming(D, 'small', 0.2).dur === 0.35, 'clamped to [0.35, 1.4] s');
ok(AF.strikeTiming.length <= 3 && !/species|speciesId/.test(AF.strikeTiming.toString()), 'the strike timing takes a class, never a species');

section('words for a fish: articles, classes, near-lengths, places');
eq([AF.withArticle('Dusk Minnow'), AF.withArticle('Ossuary Fry'), AF.withArticle('the Remembered Sun'), AF.withArticle('the Remembered Sun', { capital: false })], ['A Dusk Minnow', 'An Ossuary Fry', 'The Remembered Sun', 'the Remembered Sun'], 'articles');
eq([AF.classPhrase(D, 'elder'), AF.classPhrase(D, 'trophy'), AF.classPhrase(D, 'elder', true), AF.classPhrase(D, 'keeper')], ['An Elder', 'A Trophy', 'An Ancient', 'A Keeper'], 'class phrases (an Ancient is an Elder past its line)');
eq([AF.nearLength(D, 13.6), AF.nearLength(D, 19.4), AF.nearLength(D, 21), AF.nearLength(D, 87), AF.nearLength(D, 99), AF.nearLength(D, 108), AF.nearLength(D, 163)],
  [`near 14${NB}cm`, `near 19${NB}cm`, `near 20${NB}cm`, `near 85${NB}cm`, `near 100${NB}cm`, `near 1.1${NB}m`, `near 1.6${NB}m`], '1 cm under 20 cm, 5 cm under 1 m, 0.1 m above; always "near"');
eq(AF.nearLength(D, 0), '', 'no length, no words');
eq([AF.placePhrase('Under the Span'), AF.placePhrase('The Bell Pool'), AF.placePhrase('Cupped Hands'), AF.placePhrase('')], ['under the Span', 'at the Bell Pool', 'at Cupped Hands', ''], 'place phrases after "It\'s still out there,"');

section('the got-away note (DESIGN §25.6.7; fish:escaped after the quiet beat)');
const names = Object.fromEntries(D.SPECIES.map((s) => [s.id, s.name]));
const note = (p, o = {}) => AF.gotAwayNote(D, p, { speciesName: names[p.speciesId] || '', ...o });
for (const c of ['small', 'keeper', 'prize']) eq(note({ speciesId: 'dusk_minnow', sizeClass: c, approxLength: 20, reason: 'thrown' }).mode, 'toast', `${c}: a one-line toast`);
for (const c of ['trophy', 'elder']) eq(note({ speciesId: 'reedjaw_pike', sizeClass: c, approxLength: 120, reason: 'thrown' }).mode, 'card', `${c}: the card`);
eq(note({ speciesId: 'belled_matriarch', sizeClass: 'legend', legendary: true, approxLength: 420, reason: 'snapped' }).mode, 'card', 'a legend: the card');
const toastCases = { snapped: 'parted the line', thrown: 'threw the hook', spat: 'spat the hook', spooled: 'stripped the reel', fouled: 'fouled the line', staggered: 'parted the line' };
for (const [r, verb] of Object.entries(toastCases)) eq(note({ speciesId: 'mossback_perch', sizeClass: 'keeper', approxLength: 30, reason: r }).toast, `A Mossback Perch ${verb}.`, `toast: ${r}`);
const C = D.AUTOFISH.text.cause, H = D.AUTOFISH.text.hint;
const card = (reason, extra = {}) => note({ speciesId: 'reedjaw_pike', sizeClass: 'trophy', approxLength: 110, reason, ...extra });
eq([card('snapped').cause, card('snapped').hint], [C.snapped, H.line], 'snapped → "It parted the line." / heavier line');
eq(card('snapped', { beat: 'lastStand' }).cause, C.snappedLong, 'snapped on its last run');
eq([card('thrown').cause, card('thrown').hint], [C.thrown, H.rod], 'thrown → a stiffer rod');
eq(card('thrown', { beat: 'leap' }).cause, C.thrownLeap, 'thrown mid-leap');
eq([card('spooled').cause, card('spooled').hint], [C.spooled, H.reel], 'spooled → a bigger reel');
eq([card('spat', { grade: 'struck' }).hint, card('spat', { grade: 'early' }).hint, card('spat', { grade: 'late' }).hint], ['', H.strike, H.strike], 'spat: the strike hint only after an Early or Late strike');
eq([card('fouled').cause, card('fouled').hint], [C.fouled, H.place], 'fouled → the chains take their share');
eq([card('staggered').cause, card('staggered').hint], [C.staggered, ''], 'staggered (Gloomtide): no gear hint');
eq(card('thrown', { markedFish: true }).still, D.AUTOFISH.text.stillOutWater, 'a Marked Fish from open water: "in that deep water"');
eq(card('thrown', { markedFish: true }, {}).still, "It's still out there, in that deep water.", '…word for word');
eq(note({ speciesId: 'reedjaw_pike', sizeClass: 'trophy', approxLength: 110, reason: 'thrown', markedFish: true }, { placeName: 'Under the Span' }).still, "It's still out there, under the Span.", 'from a place: the place');
eq(card('thrown').still, '', 'not marked: no still-out-there line');
eq(note({ speciesId: 'reedjaw_pike', sizeClass: 'elder', ancient: true, approxLength: 240, reason: 'spooled' }).size, `An Ancient, near 2.4${NB}m.`, 'an Ancient\'s size line');
let anyPct = false;
for (const sp of ['dusk_minnow', 'reedjaw_pike', 'gloam_eel', 'belled_matriarch']) for (const c of ['small', 'keeper', 'prize', 'trophy', 'elder', 'legend']) for (const r of Object.keys(toastCases)) for (const g of ['clean', 'struck', 'early', 'late']) {
  const n = note({ speciesId: sp, sizeClass: c, legendary: c === 'legend', approxLength: 50, reason: r, grade: g, markedFish: c === 'elder' });
  if (/%|\d+\s*percent/i.test(JSON.stringify(n))) anyPct = true;
}
ok(!anyPct, 'no note in any class × cause × grade carries a % (the odds live in the log)');
ok(/^Odds in your log$/.test(card('thrown').link), 'the card links to the log ("Odds in your log")');

section('the Journal\'s Your odds block (DESIGN §25.6.11): floored %, "?" unseen, "—" unreachable, the best owned item');
const lo = { rod: 3, line: 3, reel: 3 };
const relics = { relics: { seven_knots: 2, steady_hook: 1 } };   // owned relics: progression passes them in (CATCH_V3.display.reference.buffs 'relics')
const oddsRJ = D.catchOdds('reedjaw_pike', lo, { buffs: relics });
const best = { item: 'bell_spinner', odds: D.catchOdds('reedjaw_pike', { ...lo, item: 'bell_spinner' }, { buffs: relics }) };
const v = AF.oddsView(D, { known: 'caught', odds: oddsRJ, withBest: best, marked: [], wounds: 0 }, { speciesName: 'Reedjaw Pike', loadout: ['Glassreed', 'Glass-Gut', 'Whisper Drag', 'Glimmer Spoon'], itemName: 'Harbour-Bell Spinner' });
eq(v.cells.map((c) => c.cls), ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'], 'six classes in order');
ok(v.cells.every((c) => c.text === `${D.catchDisplay(oddsRJ[c.cls])}%`), 'each cell is data.catchDisplay(p) + "%" (rounded down)', v.cells.map((c) => c.text));
ok(v.cells.every((c) => Number(c.text.replace('%', '')) < D.CATCH_V3.cap[c.cls] * 100), 'a cap is never printed');
eq(v.loadout, 'Glassreed · Glass-Gut · Whisper Drag · Glimmer Spoon', 'the loadout line (DESIGN\'s example)');
eq(v.withBest.label, 'With the Harbour-Bell Spinner:', 'the best owned item\'s row');
eq(v.withBest.cells.map((c) => c.cls), ['trophy', 'elder', 'ancient'], 'its three biggest classes');
ok(v.withBest.cells.every((c) => c.text === `${D.catchDisplay(best.odds[c.cls])}%`), '…at its own odds');
ok(v.notes[0] === D.AUTOFISH.text.log.strike && v.notes[1] === D.AUTOFISH.text.log.gloomtide, 'the fine print: strike and Gloomtide lines');
const un = AF.oddsView(D, { known: 'unseen', odds: null }, { speciesName: 'Gloam Eel' });
ok(un.unseen && un.cells.length === 6 && un.cells.every((c) => c.text === '?' && c.unseen), 'a species neither landed nor lost: "?" for every class');
eq(un.notes, ['Land or lose one to learn its odds.'], '…and "Land or lose one to learn its odds."');
ok(!un.withBest && !/%/.test(JSON.stringify(un)), 'unseen: no % anywhere, no best-item row');
const qu = AF.oddsView(D, { known: 'caught', odds: D.catchOdds('quayling', { rod: 0, line: 0, reel: 0 }, { lake: 'cove' }) }, { speciesName: 'Quayling' });
eq(qu.cells.map((c) => c.text.replace(/\d+/, 'n')), ['n%', 'n%', '—', '—', '—', '—'], 'the Quayling: "—" from Prize up (a class it never reaches)');
ok(qu.cells[0].p > 0.85 && qu.cells[0].p < 0.95, 'the Quayling\'s Small sits in the tutorial band (85–95%)', qu.cells[0]);
eq(AF.oddsView(D, { known: 'caught', odds: D.catchOdds('quayling', {}, { lake: 'cove' }) }, { cove: true }).notes, [D.AUTOFISH.text.log.strike], 'the Landing has no Gloom: no Gloomtide line under its odds');
const gl = AF.oddsView(D, { known: 'glimpsed', odds: oddsRJ }, { speciesName: 'Reedjaw Pike' });
ok(!gl.unseen && gl.cells.every((c) => /%$/.test(c.text)), 'a Glimpsed species shows its odds (it counts as known)');
const mk = AF.oddsView(D, { known: 'caught', odds: oddsRJ, marked: [{ name: 'Old Ninefin', sizeClass: 'trophy', approxLength: 108, p: 0.8123 }] }, { speciesName: 'Reedjaw Pike' });
eq(mk.marked, [`Old Ninefin, Trophy, near 1.1${NB}m: 81%`], 'a Marked Fish\'s own line');
eq(AF.oddsView(D, { known: 'caught', odds: oddsRJ, marked: [{ name: null, sizeClass: 'elder', approxLength: null, p: 0.2 }] }, { speciesName: 'Reedjaw Pike' }).marked, ['Reedjaw Pike, Elder: 20%'], 'a Marked Fish with no name or kept estimate');
const lg = AF.oddsView(D, { known: 'caught', odds: D.catchOdds('belled_matriarch', lo, {}), wounds: 2 }, { speciesName: 'The Belled Matriarch' });
ok(lg.legend && lg.cells.length === 1 && lg.cells[0].cls === 'legend' && /%$/.test(lg.cells[0].text), 'a legend: one attempt %');
eq(lg.wounds, 'Wounded twice: +12', 'its wounds ("Wounded twice: +12")');
ok(Number(lg.cells[0].text.replace('%', '')) < 50, 'a legend is never printed at 50% or better');

section('the gear log (DESIGN §25.6.11): Hold, ×1.6 styles, targets, the pinned compare');
eq(AF.gearLine(D, { kind: 'rod', hold: 8 }), '+8 Hold on every fish · counts ×1.6 against leapers.', 'Glassreed Rod (DESIGN\'s line)');
eq(AF.gearLine(D, { kind: 'line', hold: 9 }), '+9 Hold on every fish · counts ×1.6 against thrashers, sinkers and sulkers.', 'a line: thrashers, sinkers, sulkers');
eq(AF.gearLine(D, { kind: 'reel', hold: 1.25 }), '+1.3 Hold on every fish · counts ×1.6 against runners.', 'a reel (a per-run level: one decimal)');
eq(AF.gearLine(D, { kind: 'lure', hold: 6, targets: { family: 'predator', met: 9 } }), '+6 Hold against predators (9 species you have met).', 'Glimmer Spoon (DESIGN\'s line)');
const allNames = Object.fromEntries(D.SPECIES_V3.map((s) => [s.id, s.name]));
eq(AF.gearLine(D, { kind: 'lure', hold: 10, targets: { species: ['reedjaw_pike', 'weeping_carp', 'bridgechain_sturgeon'] } }, { names: allNames }), '+10 Hold against Reedjaw Pike, Weeping Carp and Bridgechain Sturgeon.', 'Harbour-Bell Spinner (DESIGN\'s line)');
eq(AF.gearLine(D, { kind: 'lure', hold: 10, targets: { species: ['reedjaw_pike', 'weeping_carp', 'bridgechain_sturgeon'] } }, { names }), '+10 Hold against Reedjaw Pike and Weeping Carp.', 'a giant the build does not carry yet (P1: the Bridgechain Sturgeon is P2) is not named');
eq(AF.gearLine(D, { kind: 'bait', hold: 2, targets: 'all' }), '+2 Hold on every fish.', 'Shimmerfly: the one global bait');
eq(AF.gearLine(D, { kind: 'bait', hold: 5, targets: [] }), D.AUTOFISH.text.gear.none, 'a bait for nothing you have met');
eq(AF.gearLine(D, { kind: 'bait', hold: 5, targets: ['mossback_perch', 'gutter_crayfish'] }, { names }), '+5 Hold against Mossback Perch and Gutter Crayfish.', 'a bait\'s met targets by name');
eq(AF.gearLine(D, { kind: 'lure', hold: 6, targets: { night: true, met: 0 } }), '+6 Hold against night-only fish, at night (none you have met yet).', 'Moth Popper before any night fish is met');
eq(AF.slotStyles(D, 'rod'), ['leaper'], 'the rod counts ×1.6 against leapers (CATCH_V3.emphasis)');
eq(AF.gearLine(D, { kind: 'line', upgrade: true, hold: 2.5, gain: 1.68, maxed: false, emphasis: { mult: 1.6, styles: ['thrasher', 'sinker', 'sulker'] } }), '+1.7 Hold on every fish · counts ×1.6 against thrashers, sinkers and sulkers.', 'a per-run level row: the Hold its next level adds (progression\'s {hold, gain} and {mult, styles})');
eq(AF.gearLine(D, { kind: 'rod', upgrade: true, hold: 12, gain: 0, maxed: true }), '+12 Hold on every fish · counts ×1.6 against leapers.', 'a maxed per-run slot: its whole Hold');
const pin = { speciesId: 'reedjaw_pike', sizeClass: 'trophy', reason: 'thrown' };
eq(AF.compareLine(D, pin, 0.161, 0.247, { speciesName: 'Reedjaw Pike' }), 'The Reedjaw Pike that threw the hook (Trophy): 16% → 24% with this.', 'the compare pinned to the last fish that got away (DESIGN\'s line)');
eq(AF.compareLine(D, { speciesId: 'reedjaw_pike', sizeClass: 'elder' }, 0.16, 0.32, { speciesName: 'Reedjaw Pike' }), 'Reedjaw Pike (Elder): 16% → 32% with this.', 'a species you pinned yourself');
eq(AF.compareLine(D, pin, null, 0.3), '', 'no compare without both chances');
eq(AF.pinnedLabel(D, pin, { speciesName: 'Reedjaw Pike' }), 'The Reedjaw Pike that threw the hook (Trophy)', 'the pinned fish\'s label');

section('the Set Out rating in words (DESIGN §25.6.6: no %)');
for (const t of [0, 1, 2, 3, 4]) {
  const r = D.catchRating('mossmere', { rod: t, line: t, reel: t }, {});
  const line = AF.ratingLine(D, r, { speciesName: 'Reedjaw Pike' });
  ok(/^Against the Reedjaw Pike: /.test(line) && !/%|\d/.test(line), `T${t}: "${line}"`);
}
eq(AF.ratingLine(D, { reference: 'reedjaw_pike', held: 'trophy', next: 'elder', word: 'rarely held' }, { speciesName: 'Reedjaw Pike' }), 'Against the Reedjaw Pike: holds Trophies. Elders are rarely held.', 'plurals (Trophies)');
eq(AF.ratingLine(D, { reference: 'reedjaw_pike', held: null, next: 'small', word: 'a coin flip' }, { speciesName: 'Reedjaw Pike' }), 'Against the Reedjaw Pike: even Smalls are a coin flip.', 'nothing held');
eq(AF.ratingLine(D, { reference: 'reedjaw_pike', held: 'elder', next: null, word: null }, { speciesName: 'Reedjaw Pike' }), 'Against the Reedjaw Pike: holds Elders.', 'everything held');
eq(AF.ratingLine(D, null), '', 'no rating, no line');

section('the hidden-information scan (U2′ acceptance helper)');
eq(AF.leakScan('Hold to hurry · by the look of it: Trophy', { names: ['Reedjaw Pike', 'Gloam Eel'] }), [], 'the play\'s words are clean');
eq(AF.leakScan('a Gloam Eel? 23%', { names: ['Reedjaw Pike', 'Gloam Eel'] }), ['%', 'Gloam Eel'], 'a species name and a % are found');
eq(AF.leakScan('Rare', {}), ['Rare'], 'a rarity word is found');
eq(AF.leakScan('Elders are rarely held', {}), [], 'word-bounded ("rarely" is not "Rare")');
const playWords = ['by the look of it', ...Object.values(D.AUTOFISH.text.strike), 'hurrying', D.AUTOFISH.text.logLocked];
eq(AF.leakScan(playWords.join(' · '), { names: Object.values(names) }), [], 'nothing shown from the cast to the reveal names a species, a rarity or a %');

section('the measuring cord: your PB (oxblood) and the Old Ledger (black); a PB pass stretches a Small / Keeper to 2.4 s');
const sp = D.SPECIES_BY_ID.reedjaw_pike;
const ledgerCm = Math.round(D.sizeLength(sp, D.BALANCE.records.oldLedgerZ, 'mossmere') * 10) / 10;
const r1 = V.cordRuler(D, sp, 112, { zone: 'mossmere', best: 97 });
ok(r1.ledger === ledgerCm && r1.max >= ledgerCm, 'the Old Ledger knot sits at the species\' mid-Trophy figure (BALANCE.records.oldLedgerZ)', { ledger: r1.ledger, want: ledgerCm });
ok(r1.best === 97 && r1.passesBest, 'a 112 cm fish passes a 97 cm PB');
ok(!V.cordRuler(D, sp, 90, { zone: 'mossmere', best: 97 }).passesBest, 'a 90 cm fish does not');
ok(V.cordRuler(D, D.SPECIES_BY_ID.belled_matriarch, 420).ledger === null, 'a legend has no Old Ledger knot');
eq(V.measurePlan(D, { sizeClass: 'small' }).dur, 1.2, 'a Small ceremony: 1.2 s');
eq(V.measurePlan(D, { sizeClass: 'small', pbPass: true }).dur, 2.4, '…2.4 s when it passes the PB knot (AUTOFISH.ceremony.pbStretch)');
eq(V.measurePlan(D, { sizeClass: 'keeper', pbPass: true }).dur, 2.4, 'a Keeper too');
eq(V.measurePlan(D, { sizeClass: 'trophy', pbPass: true }).dur, 3.5, 'a Trophy keeps its own 3.5 s');
eq(V.measurePlan(D, { sizeClass: 'small', pbPass: true, short: true }).dur, 1.2, 'a swarm window keeps the short variant');
eq(V.measurePlan(dataV1, { sizeClass: 'small', pbPass: true }).dur, 1.2, 'no AUTOFISH: no stretch');

section('static: ui reads no key D1′ retired; only the logs make a %');
const srcDir = resolve(here, '../../src');
const uiFiles = readdirSync(srcDir).filter((f) => /^ui.*\.js$/.test(f));
const RETIRED = [/\btackleRating\b/, /\bnearMiss\b/, /view\.pips|\bv\.pips\b|pipBonus|fishing:pip\b/, /\boldTrick\b|fishing:oldTrick/, /fishing:snag/, /escaped-big/, /effects\??\.reelSpeed|sweetZone/, /TEXT_V3\??\.(causes|tips)\b|T3\.(causes|tips)\b/, /ceremony\??\.nearMiss|bite\??\.pips|TACKLE\??\.rating\b/];
for (const f of uiFiles) {
  const src = readFileSync(resolve(srcDir, f), 'utf8');
  const hits = RETIRED.filter((re) => re.test(src)).map(String);
  ok(!hits.length, `${f}: no retired reel key (pips, near-miss, tackle rating, old trick, snag, reel stats)`, hits);
}
const afSrc = readFileSync(resolve(srcDir, 'ui-af.js'), 'utf8');
ok(!/catchChance\(|catchParts\(|catchOdds\(|catchRating\(/.test(afSrc.replace(/^\s*\/\/.*$/gm, '')), 'ui-af computes no chance (progression owns the one formula)');
const hudSrc = readFileSync(resolve(srcDir, 'ui-hud-v3.js'), 'utf8');
ok(!/catchChance|catchOdds|getOdds|getGearLog|compareOdds/.test(hudSrc), 'the in-play HUD never reads a chance or a log');
ok(!/speciesData\(v\.speciesId\)|view\.speciesId|v\.rarity/.test(hudSrc), 'the in-play HUD never reads the hooked species or its rarity');

console.log(`\nui-af: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
