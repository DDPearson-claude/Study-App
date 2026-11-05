// Unit tests for the v3 in-play HUD's pure helpers (src/ui-v3.js; DESIGN §25.5.7, §25.6.1, §25.6.4, §25.6.7, §25.5.2):
//   the §25.5.7 table (no combat UI on the day screen, by night mode), the Stillnight word, the float's favour bands and its
//   plain-word list by family, the five bite tells, class labels and seals, lengths (mm under 20 cm), the tackle rating from
//   BALANCE.tackleRating, the near-miss card's lines (DESIGN's own example) and the watch-lamp line.
//   node tools/tests/ui-v3.test.mjs   (or node tools/check.mjs)
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const D = await import('../../src/data.js?ui-v3');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;
const V = await import('../../src/ui-v3.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const section = (s) => console.log(`- ${s}`);

section('v3Run: only a v3 build with a night-mode run (not The Long Descent)');
ok(!V.v3Run(dataV1, { nightMode: 'still' }), 'flag-off data is never v3');
ok(D.V3_ENABLED === true && V.v3Run(D, { nightMode: 'still', outing: 'first' }), 'v3 data + a Still run');
ok(!V.v3Run(D, { nightMode: 'gloomtide', outing: 'descent' }), 'The Long Descent keeps the v1 HUD');
ok(!V.v3Run(D, {}), 'a run without a night mode');
ok(!V.v3Run(D, null), 'no run');

section('§25.5.7: the day screen carries no combat UI');
const hud = (m) => V.modeHud(D, m);
for (const mode of ['still', 'lantern']) {
  const v = V.hudVisibility({ hud: hud(mode), phase: 'calm', swarmNight: mode === 'lantern' });
  ok(!v.embers && !v.flare && !v.burn && !v.weapons && v.wellFed, `${mode} calm: no Embers, Flare, Burn or weapons; the Well-fed glyph`, v);
}
{
  const v = V.hudVisibility({ hud: hud('gloomtide'), phase: 'calm' });
  ok(v.embers && v.flare && v.burn && v.weapons && v.wellFed && !v.relight, 'Gloomtide calm: Embers, Flare and Burn always (the Well-fed glyph too)', v);
}
{
  const st = V.hudVisibility({ hud: hud('still'), phase: 'gloomtide', swarmNight: false });
  ok(!st.embers && !st.flare && !st.burn, 'Still night: nothing of combat', st);
  const lq = V.hudVisibility({ hud: hud('lantern'), phase: 'gloomtide', swarmNight: false });
  ok(!lq.embers && !lq.flare, 'Lantern quiet night: no Embers, no Flare', lq);
  const ld = V.hudVisibility({ hud: hud('lantern'), phase: 'dusk', swarmNight: true });
  ok(ld.embers && ld.flare && ld.weapons && !ld.burn, 'Lantern swarm night from dusk: Embers and Flare (Burn waits for the swarm or low oil)', ld);
  const ls = V.hudVisibility({ hud: hud('lantern'), phase: 'gloomtide', swarmNight: true, swarmActive: true });
  ok(ls.embers && ls.flare && ls.burn && !ls.relight, 'Lantern during the swarm: Burn too', ls);
  const lh = V.hudVisibility({ hud: hud('lantern'), phase: 'calm', hitT: 2 });
  ok(lh.embers && !lh.flare, 'Lantern: Embers show for 4 s after a hit', lh);
  const lh2 = V.hudVisibility({ hud: hud('lantern'), phase: 'calm', hitT: 4.5 });
  ok(!lh2.embers, '…and hide again after 4 s', lh2);
  const sc = V.hudVisibility({ hud: hud('lantern'), phase: 'gloomtide', scorched: true });
  ok(sc.embers, 'Scorched: the (spent) Embers stay in view until dawn mends them', sc);
}
{
  const lo = V.hudVisibility({ hud: hud('still'), phase: 'calm', oilFrac: 0.2 });
  ok(lo.burn && lo.relight, 'Still: Burn appears below 25% oil, as Relight', lo);
  const g = V.hudVisibility({ hud: hud('still'), phase: 'calm', oilFrac: 0.6, guttering: true });
  ok(g.burn && g.relight, 'guttering always offers Relight', g);
  const gt = V.hudVisibility({ hud: hud('gloomtide'), phase: 'calm', oilFrac: 0.1 });
  ok(gt.burn && !gt.relight, 'Gloomtide: Burn stays Burn', gt);
  const vig = V.hudVisibility({ hud: hud('still'), phase: 'calm', hp: 1, maxHp: 5 });
  ok(!vig.lowHpVig, 'Still: no low-Ember vignette (Embers are hidden)', vig);
  const none = V.hudVisibility({ hud: null });
  ok(none.embers && none.flare && none.burn && !none.wellFed, 'no table: everything shows (v1)', none);
}
eq(V.nightWord(D, { swarm: false }), 'Stillnight', 'a quiet night is a Stillnight');
eq(V.nightWord(D, { swarm: true }), 'Gloomtide', 'a swarm night stays the Gloomtide');

section("the float's favour (U13): bands, notches, plain words by family");
eq([0, 1, 2, 3, 4, 5].map((n) => V.favourBand(n)).length, 6, 'six bands');
ok(V.favourBand(2) === 'the water favours you', 'two notches: "the water favours you" (CHOICE.md mockup)');
eq(V.favourBand(3, true, D), 'The water here has gone quiet.', 'quiet: TEXT_V3.quiet');
const bands = [[0, 0], [0.149, 0], [0.15, 1], [0.44, 1], [0.45, 2], [0.79, 2], [0.8, 3], [1.19, 3], [1.2, 4], [1.6, 5], [1.8, 5]];
for (const [mu, n] of bands) eq(V.notchesFor(mu, D), n, `μ ${mu} → ${n} notches`);
eq(V.notchesFor(0.5, null), 2, 'notches without data fall back to the §25.6.1 bands');
const terms = [
  { family: 'tackle', id: 'ember_roe', value: 0.35 }, { family: 'hour', id: 'nightRise', value: 0.25 }, { family: 'place', id: 'astir', value: 0.35 },
  { family: 'hour', id: 'farWater', value: 0.12 }, { family: 'match', id: 'rumour', value: 0.3 }, { family: 'tackle', id: 'depthLowerThird', value: 0.25 },
  { family: 'pressure', id: 'pressure', value: -0.24 }, { family: 'signs', id: 'strike', value: 0.6 }, { family: 'tackle', id: 'zero', value: 0 },
];
const groups = V.favourGroups(terms, D);
eq(groups.map((x) => x.family), ['place', 'hour', 'match', 'tackle', 'signs', 'pressure'], 'families in the §25.7.2 order (zero terms dropped)');
eq(V.favourLine(groups.slice(0, 4)), "Place: Astir · Hour: Night Rise, Far Water · Match: today's rumour · Tackle: Ember Roe, deep band", 'the DESIGN line, word for word');
ok(groups.find((x) => x.family === 'pressure').words[0].neg === true, 'pressure reads as a negative term');
eq(V.termWords({ family: 'tackle', id: 'glimmer_spoon', value: 0.2 }, D), 'Glimmer Spoon', 'a lure reads its name from LURES');
eq(V.termWords({ family: 'place', id: 'inside', value: 0.15 }, D, { placeName: 'The Cupped Hands' }), 'The Cupped Hands', 'inside a place names the place');
eq(V.termWords({ family: 'signs', id: 'letItPass', value: 0.15 }, D), 'let one pass', 'let it pass');
eq(V.favourGroups([], D), [], 'no terms, no groups');
ok(Math.abs(V.favourMu([{ value: 1.2 }, { value: 0.9 }], D) - 1.8) < 1e-9, 'μ is capped at 1.8');

section('the bite tells and the classes (U2)');
eq(Object.keys(V.TELLS), ['doublePop', 'plunge', 'dragUnder', 'flatSlide', 'dome'], 'five tells');
for (const c of D.SIZE_CLASSES) eq(V.TELLS[c.bite]?.cls, c.id, `${c.id}'s tell (${c.bite}) names its class`);
eq(V.classInfo(D, 'trophy'), { id: 'trophy', label: 'Trophy', seal: 'oxbloodWax', rank: 3, ancient: false }, 'Trophy: oxblood wax');
eq(V.classInfo(D, 'elder', true).label, 'Ancient', 'an Elder with z ≥ 3.2 reads Ancient');
eq(V.classInfo(D, 'prize').seal, 'inkStamp', 'Prize: the ink stamp');
eq(V.classInfo(D, 'keeper').seal, null, 'Keepers have no seal');
eq(V.classInfo(D, null), null, 'no class');

section('lengths: mm below 20 cm, cm, metres from 10 m');
eq(V.fmtLength(8, D), '80 mm', 'a Cupbearer prints in mm');
eq(V.fmtLength(19.94, D), '199 mm', 'just under 20 cm');
eq(V.fmtLength(112.4, D), '112 cm', 'cm');
eq(V.fmtLength(850, D), '850 cm', 'the Lantern-Swallower in cm');
eq(V.fmtLength(1210, D), '12.10 m', 'past 10 m, metres');
eq(V.fmtLength(0, D), '—', 'unknown');

section('tackle rating and the near-miss card (DESIGN §25.6.7)');
const r0 = V.tackleRating(D, 'mossmere', { rod: 0, line: 0, reel: 0 });
eq(r0 && { cls: r0.cls, next: r0.next, pct: r0.nextPct }, { cls: 'trophy', next: 'elder', pct: 0 }, 'Mossmere T0: Trophy (Elder 0%)');
const r4 = V.tackleRating(D, 'mossmere', { rod: 4, line: 4, reel: 4 });
eq(r4?.cls, 'elder', 'Mossmere T4: Elder');
const rFb = V.tackleRating({ TACKLE: D.TACKLE, SIZE_CLASSES: D.SIZE_CLASSES }, 'mossmere', { rod: 2, line: 2, reel: 2 });
eq(rFb && [rFb.cls, rFb.nextPct], ['trophy', 15], 'matched-set fallback (TACKLE.rating) without the generated table');
eq(V.tackleRating(D, 'nowhere', {}), null, 'an unknown lake has no rating');
const nm = V.nearMiss(D, { speciesId: 'reedjaw_pike', sizeClass: 'trophy', length: 108, progress: 0.84, cause: 'snap' }, { rating: r0 });
eq(nm.title, 'Reedjaw Pike · Trophy · ~108 cm', 'title');
eq(nm.line, 'Snapped at 84%.', 'cause and % landed');
eq(nm.rating, 'Your tackle is rated Trophy here (Elders 0%).', 'rating');
eq(nm.tip, 'Let go on the hiss.', 'tip (TEXT_V3.tips.snap)');
const nm2 = V.nearMiss(D, { speciesId: 'reedjaw_pike', sizeClass: 'elder', ancient: true, length: 160, progress: 0.4, cause: 'thrown' }, { round: (L, e) => L * (1 + e) });
eq(nm2.title, 'Reedjaw Pike · Ancient · ~173 cm', 'an estimate within ±8% (here +8%)');
eq([nm2.line, nm2.rating, nm2.tip], ['Thrown hook at 40%.', '', 'Keep the line tight through a leap.'], 'thrown hook, no rating');
eq(V.nearMiss(D, { speciesId: 'reedjaw_pike', sizeClass: 'prize', length: 70, progress: 0.2, cause: 'slack' }).line, 'Slipped the slack at 20%.', 'slack (no TEXT_V3 cause)');

section('watch-lamps (S6)');
const lamps = D.ZONE_BY_ID.mossmere.arena.watchLamps;
eq(lamps.map((l) => l.id), ['se_buoy', 'w_buoy'], 'the Mossmere\'s two buoy-lamps (v3 data)');
const n1 = V.nearestLamp(lamps, 19.8, 37.8 - 40, 6);
eq([n1.lamp.id, Math.round(n1.dist), n1.inside, Math.round(n1.secs * 10) / 10], ['se_buoy', 40, false, 5.7], 'nearest lamp, distance and seconds to its pool at raft speed');
eq(V.watchLineText(D, n1), 'Nearest watch-lamp 40\u00a0m · ≈ 6\u00a0s', 'the line from TEXT_V3.watchLamp');
ok(V.nearestLamp(lamps, -46.7, 12, 6).inside, 'inside a pool (r 6)');
eq(V.nearestLamp([], 0, 0), null, 'no lamps');
eq(V.nearestLamp([{ position: { x: 3, z: 4 }, radius: 6 }], 0, 0).dist, 5, 'world.getWatchLamps() entries with a position');

console.log(`\nui-v3: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
