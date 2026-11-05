#!/usr/bin/env node
// tools/sim/catch-v3.mjs — the automatic-fishing catch-chance model (DESIGN §25.6, CONTRACT §13.7). Everything it prints comes
// from src/data.js: CATCH_V3 (the formula's constants), AUTOFISH (strike, play, leaps, time model), TACKLE[slot][tier].hold,
// LURES / BAITS, the species, the size model and ECONOMY_V3, through the same pure helpers fishing and the logs use
// (catchChance, catchParts, catchItemHold, catchBestItem, catchRating). There is no second copy of the numbers here.
//
//   p = max( floor, cap[class] · σ( scale · (Hold − Fight) ) )        every cap < 1, so p < 1 always
//
// Run from gloomwater/:
//   node tools/sim/catch-v3.mjs                 summary: targets, reference species, lake averages, items, legends, per-run gear,
//                                               the strike model, favour, landings per outing (+ the economy normaliser), the first
//                                               Elder, the Landing, leaps / bites / signs
//   node tools/sim/catch-v3.mjs --all           every lake × species × class at T0…T4, without / with the best bait or lure
//   node tools/sim/catch-v3.mjs --lake mossmere one lake's full table          --species reedjaw_pike  one species
//   node tools/sim/catch-v3.mjs --leaps         the leap, bite and sign ambiguity rules, cell by cell (worst cells first)
//   node tools/sim/catch-v3.mjs --md            markdown tables               --json  CATCH_V3 + AUTOFISH as JSON
//   node tools/sim/catch-v3.mjs --strike clean|struck|early|late   (default struck: the log's reference strike)
// Deterministic (closed form; the outing estimate is an expectation, no RNG). The manual tension reel's sim (reel-v3.mjs) was
// retired with its data by D1′ (DESIGN §25.14.2a); tools/sim/reel.mjs stays for v1.
import * as D from '../../src/data.js';

const C = D.CATCH_V3, A = D.AUTOFISH;
const LAKES = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
const LAKE_NAME = { mossmere: 'The Mossmere', sporewood: 'Sporewood Pools', glasswater: 'Glasswater Vault', paleabyss: 'The Pallid Deep', cove: 'The Landing' };
const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
const CL = { small: 'Small', keeper: 'Keeper', prize: 'Prize', trophy: 'Trophy', elder: 'Elder', ancient: 'Ancient' };
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const STRIKE = opt('--strike', C.display.reference.strike);
const MD = has('--md');
const pct = (p) => (p == null ? '—' : `${D.catchDisplay(p)}`);   // the logs' rounding (down)
const SP = D.SPECIES_V3;
const SPB = D.SPECIES_V3_BY_ID;
const homeLake = (sp) => D.catchHomeLake(sp);
const T = (n) => ({ rod: n, line: n, reel: n });
const ITEM_IDS = Object.keys(C.items).filter((k) => C.items[k].kind !== 'upgrade');
const LURE_IDS = ITEM_IDS.filter((k) => C.items[k].kind === 'lure');
const itemName = (id) => D.LURES.find((l) => l.id === id)?.name || [...D.BAITS, ...D.WALK_BAITS].find((b) => b.id === id)?.name || (id === 'cut_strip' ? 'Cut Strip' : id);
/** chance with the sim's default strike and, unless `buffs` is given, the owned relic Hold a player has at that tier (the log's
 *  reference: CATCH_V3.display.reference.buffs 'relics', CATCH_V3.targets.relicHoldByTier). Tackle given as Hold (per-run levels) gets none. */
const relicDefault = (t) => (t && Number.isFinite(t.rod) && Number.isFinite(t.line) && Number.isFinite(t.reel) ? C.targets.relicHoldByTier[Math.round((t.rod + t.line + t.reel) / 3)] ?? 0 : 0);
export const chance = (sp, cls, o = {}) => D.catchChance(sp, cls, { ...(o.tackle || T(0)), item: o.item }, { strike: o.strike ?? STRIKE, lake: o.lake, buffs: o.buffs ?? relicDefault(o.tackle || T(0)), marked: o.marked, wounds: o.wounds, landings: o.landings, night: o.night, perRun: o.perRun });

// ---------------------------------------------------------------------------------------------------------- tables
const out = [];
const say = (s = '') => out.push(s);
const row = (cells, w) => (MD ? `| ${cells.join(' | ')} |` : cells.map((c, i) => String(c).padEnd(w[i] ?? 8)).join(''));
const sep = (n) => (MD ? `|${' --- |'.repeat(n)}` : '');

function speciesRows(sp, lake = homeLake(sp)) {
  if (sp.rarity === 'legendary') return [[sp.name, 'legend', ...[0, 1, 2, 3, 4].map((n) => pct(chance(sp, 'legend', { tackle: T(n) }))), 'legend bait only']];
  const best = D.catchBestItem(sp), rows = [];
  for (const cls of CLASSES) {
    if (!D.catchClassAllowed(sp, cls)) continue;
    const cells = [sp.name, CL[cls]];
    for (let n = 0; n <= 4; n++) {
      const a = chance(sp, cls, { tackle: T(n), lake }), b = best.id ? chance(sp, cls, { tackle: T(n), item: best.id, lake }) : a;
      cells.push(`${pct(a)}/${pct(b)}`);
    }
    cells.push(best.id ? `${itemName(best.id)} +${best.hold}` : '—');
    rows.push(cells);
  }
  return rows;
}
function lakeTable(lake, filter = () => true) {
  const W = [24, 9, 9, 9, 9, 9, 9, 26];
  say(MD ? `**${LAKE_NAME[lake]}** (% landed, matched tackle T0…T4 with that tier's relics, the log's reference strike: without / with the best bait or lure)` : `== ${LAKE_NAME[lake]} (% landed: no item / best bait-or-lure; matched T0…T4 + that tier's relics; strike ${STRIKE})`);
  say(row(['species', 'class', 'T0', 'T1', 'T2', 'T3', 'T4', 'best item'], W)); if (MD) say(sep(8));
  for (const sp of SP.filter((s) => homeLake(s) === lake && s.rarity !== 'legendary' && filter(s))) for (const r of speciesRows(sp, lake)) say(row(r, W));
  say();
}

// ---- targets (PASS / CHECK) from CATCH_V3.targets. Every figure carries the owned relic Hold a player has at that tier
// (CATCH_V3.targets.relicHoldByTier: the log shows it too), the log's reference strike and no run buffs, unless it says otherwise.
const relicAt = (n) => C.targets.relicHoldByTier[Math.max(0, Math.min(4, Math.round(n)))] ?? 0;
/** The per-run Hold of `n` levels in each slot's upgrade list (P1–P2 runs, The Long Descent). */
export const runHoldFor = (lv) => D.upgradeHold(Object.fromEntries(Object.entries(D.BALANCE_V3.upgradeTiers.slots).flatMap(([slot, ids]) => {
  let left = lv[slot] | 0; return ids.map((id) => { const m = D.UPGRADES.find((u) => u.id === id).maxLevel, k = Math.min(m, left); left -= k; return [id, k]; });
})));
export const slotLevels = (slot) => D.BALANCE_V3.upgradeTiers.slots[slot].reduce((a, id) => a + D.UPGRADES.find((u) => u.id === id).maxLevel, 0);
// the strike model: reaction after the "!" ~ lognormal(median, σ) (AUTOFISH.strike.reaction), + input latency − its compensation
const normCdf = (x) => { const t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989423 * Math.exp(-x * x / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - p : p; };
export function strikeGrades(cls, who = 'novice', input = 'touch', latency = { touch: 0.075, mouse: 0.035, key: 0.02 }) {
  const S = A.strike, win = S.window[cls], clean = Math.max(S.cleanMin, S.cleanFrac * win), [med, sg] = S.reaction[who];
  const shift = (latency[input] ?? 0) - (S.latencyComp[input] ?? 0), P = (t) => (t <= 0 ? 0 : normCdf(Math.log(t / med) / sg));
  const pc = P(clean - shift), ps = P(win - shift) - pc, pl = P(win + S.lateGrace - shift) - P(win - shift);
  return { clean: pc, struck: ps, late: pl, passed: 1 - pc - ps - pl };
}
export function targets() {
  const G = C.targets, res = [];
  const chk = (name, ok, detail) => res.push(`${ok ? 'PASS ' : 'CHECK'} ${name}: ${detail}`);
  const moss = SP.filter((s) => s.zone === 'mossmere' && s.rarity === 'common');
  const c0 = moss.flatMap((s) => ['small', 'keeper'].map((c) => chance(s, c, { tackle: T(0) })));
  chk(`early commons, starter tackle, ${G.commonsT0[0] * 100}–${G.commonsT0[1] * 100}%`, c0.every((p) => p >= G.commonsT0[0] && p <= G.commonsT0[1]), `Mossmere commons Small/Keeper on T0 ${pct(Math.min(...c0))}–${pct(Math.max(...c0))}%`);
  const arrival = LAKES.map((l, i) => { const v = SP.filter((s) => s.zone === l && s.rarity === 'common').map((s) => chance(s, 'keeper', { tackle: T(i), buffs: relicAt(i) })); return `${l} T${i} ${pct(Math.min(...v))}–${pct(Math.max(...v))}`; });
  res.push(`      Keeper commons on each lake's arrival tackle (with that tier's relics): ${arrival.join(' · ')}`);
  // every Elder at T0 (reference strike, no buffs), with or without any one item
  let e0 = 0, e0who = '';
  for (const s of SP) if (D.catchClassAllowed(s, 'elder')) for (const it of [null, ...ITEM_IDS]) { const p = chance(s, 'elder', { tackle: T(0), item: it, strike: 'struck' }); if (p > e0) { e0 = p; e0who = `${s.name}${it ? ` + ${itemName(it)}` : ''}`; } }
  chk(`every Elder on T0 ≤ ${G.elderT0Max * 100}% (reference strike, no buffs, any one item)`, e0 <= G.elderT0Max, `highest ${(e0 * 100).toFixed(1)}% (${e0who})`);
  const ref = Object.values(D.TACKLE.reference).map((id) => SPB[id]);
  const early = ref.slice(0, 2);
  const e02 = early.flatMap((s) => [0, 1, 2].map((n) => chance(s, 'elder', { tackle: T(n), buffs: relicAt(n) })));
  chk(`early headline Elders ≤ ${G.headlineElderEarlyMax * 100}% until late tackle (T0–T2, no item)`, e02.every((p) => p <= G.headlineElderEarlyMax), early.map((s) => `${s.name} ${[0, 1, 2].map((n) => pct(chance(s, 'elder', { tackle: T(n), buffs: relicAt(n) }))).join('/')}`).join(' · '));
  res.push(`      … with their best item on T0/T1/T2: ${early.map((s) => `${s.name} ${[0, 1, 2].map((n) => pct(chance(s, 'elder', { tackle: T(n), item: D.catchBestItem(s).id, buffs: relicAt(n) }))).join('/')}`).join(' · ')}`);
  const top = ref.map((s) => chance(s, 'elder', { tackle: T(4), item: D.catchBestItem(s).id, buffs: relicAt(4) }));
  chk(`headline Elders (Mossmere, Sporewood, Glasswater) on T4 with the right lure ${G.headlineElderT4Item[0] * 100}–${G.headlineElderT4Item[1] * 100}%`, top.slice(0, 3).every((p) => p >= G.headlineElderT4Item[0] && p <= G.headlineElderT4Item[1]), ref.slice(0, 3).map((s, i) => `${s.name} ${pct(top[i])}`).join(' · '));
  chk(`the Pallid Deep's Gilt-Eyed Eel Elder on T4 with its lure ${G.deepHeadlineT4Item[0] * 100}–${G.deepHeadlineT4Item[1] * 100}% (the hardest regular fish, on purpose)`, top[3] >= G.deepHeadlineT4Item[0] && top[3] <= G.deepHeadlineT4Item[1], `${ref[3].name} ${pct(top[3])}`);
  const topMax = ref.map((s) => chance(s, 'elder', { tackle: T(4), item: D.catchBestItem(s).id, strike: 'clean', buffs: C.buffs.cap }));
  res.push(`      … with a clean strike and every buff (+${C.buffs.cap}): ${ref.map((s, i) => `${s.name} ${pct(topMax[i])}`).join(' · ')}`);
  let maxAnc = 0, maxAncWho = '';
  for (const s of SP) if (D.catchClassAllowed(s, 'ancient')) {
    const p = chance(s, 'ancient', { tackle: T(4), item: D.catchBestItem(s).id, strike: 'clean', buffs: C.buffs.cap, marked: true });
    if (p > maxAnc) { maxAnc = p; maxAncWho = s.name; }
  }
  const legIds = Object.keys(C.legend.fight);
  const legMax = legIds.map((id) => chance(SPB[id], 'legend', { tackle: T(4), strike: 'clean', buffs: C.buffs.cap, wounds: 9 }));
  const legMaxRun = legIds.map((id) => chance(SPB[id], 'legend', { tackle: T(4), strike: 'clean', buffs: C.buffs.cap, wounds: 9, perRun: true }));
  chk('Ancients and legends never better than a coin flip', maxAnc < G.ancientMax && [...legMax, ...legMaxRun].every((p) => p < G.legendMax), `best Ancient anywhere (T4, best item, clean, every buff, Marked) ${(maxAnc * 100).toFixed(1)}% (${maxAncWho}); legends at their best ${legMax.map((p) => (p * 100).toFixed(1)).join(' / ')}% (per-run gear ${legMaxRun.map((p) => (p * 100).toFixed(1)).join(' / ')}%)`);
  let maxAll = 0, maxWho = '';
  for (const s of SP) for (const c of [...CLASSES, 'legend']) for (const it of [null, ...ITEM_IDS]) for (const perRun of [false, true]) {
    const parts = D.catchParts(s, c, { ...T(4), item: it }, { strike: 'clean', buffs: C.buffs.cap, marked: true, wounds: 9, perRun });
    if (parts && parts.p / parts.cap > maxAll) { maxAll = parts.p / parts.cap; maxWho = `${s.name} ${c} ${(parts.p * 100).toFixed(2)}% of cap ${parts.cap * 100}%`; }
  }
  chk('nothing ever reaches its cap (and every cap < 1)', maxAll < 1 && Object.values(C.cap).every((c) => c < 1), `closest to a cap: ${maxWho}; the logs round down, so a cap is never printed`);
  const gains = [];
  for (const id of LURE_IDS) for (const s of SP) {
    if (s.rarity === 'legendary' || !D.catchItemHold(id, s)) continue;
    const lake = LAKES.indexOf(homeLake(s));
    for (const n of [Math.max(lake, 1), Math.min(4, lake + 1)]) for (const c of ['prize', 'trophy']) {
      const a = chance(s, c, { tackle: T(n) }), b = chance(s, c, { tackle: T(n), item: id }); if (a != null) gains.push({ id, g: (b - a) * 100 });
    }
  }
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const fam = gains.filter((x) => !C.items[x.id].species).map((x) => x.g), named = gains.filter((x) => C.items[x.id].species).map((x) => x.g);
  chk('a lure is a real choice on its targets (Prize / Trophy, the lake\'s own tackle)', avg(fam) >= G.familyLureGain && avg(named) >= G.giantsLureGain[0] && avg(named) <= G.giantsLureGain[1],
    `family lures avg +${avg(fam).toFixed(1)}, giants' lures avg +${avg(named).toFixed(1)} points`);
  res.push(`      per lure (min–max points): ${LURE_IDS.map((id) => { const g = gains.filter((x) => x.id === id).map((x) => x.g); return g.length ? `${itemName(id)} ${Math.round(Math.min(...g))}–${Math.round(Math.max(...g))}` : `${itemName(id)} —`; }).join(' · ')}`);
  const q = chance(SPB.quayling, 'small', { tackle: T(0), lake: 'cove', strike: 'struck' });
  chk(`the tutorial Quayling (Small, T0) ${G.tutorial[0] * 100}–${G.tutorial[1] * 100}%`, q >= G.tutorial[0] && q <= G.tutorial[1], `${(q * 100).toFixed(1)}%`);
  // per-run gear (P1–P2 runs, The Long Descent): every rod / line / reel level adds Hold that shows
  const rj = SPB[D.TACKLE.reference.mossmere], lvBad = [], lvMin = {};
  for (const slot of ['rod', 'line', 'reel']) for (let k = 0; k < slotLevels(slot); k++) {
    const a = chance(rj, 'trophy', { tackle: { hold: runHoldFor({ [slot]: k }) } }), b = chance(rj, 'trophy', { tackle: { hold: runHoldFor({ [slot]: k + 1 }) } });
    const g = (b - a) * 100; lvMin[slot] = Math.min(lvMin[slot] ?? Infinity, g); if (g < G.levelGain) lvBad.push(`${slot} L${k + 1} +${g.toFixed(2)}`);
  }
  chk(`every per-run rod / line / reel level raises the ${rj.name}'s Trophy chance by ≥ ${G.levelGain} point (others at 0)`, !lvBad.length, lvBad.length ? lvBad.join(', ') : `smallest step: rod +${lvMin.rod.toFixed(1)} · line +${lvMin.line.toFixed(1)} · reel +${lvMin.reel.toFixed(1)}`);
  const sw = SPB.lantern_swallower, swMixed = chance(sw, 'legend', { tackle: { rod: 3, line: 2, reel: 3 }, perRun: true }), swT4 = chance(sw, 'legend', { tackle: T(4), perRun: true });   // with the tier's relics (+3)
  chk(`the Lantern-Swallower on per-run gear: Rod T3 / Line T2 / Reel T3 ${G.perRunSwallower.R3L2E3.map((x) => x * 100).join('–')}%, T4 ≤ ${G.perRunSwallower.T4Max * 100}%`,
    swMixed >= G.perRunSwallower.R3L2E3[0] && swMixed <= G.perRunSwallower.R3L2E3[1] && swT4 <= G.perRunSwallower.T4Max, `${(swMixed * 100).toFixed(1)}% · T4 ${(swT4 * 100).toFixed(1)}% (first attempt, no wounds, the tier's relics)`);
  const nc = strikeGrades('small', 'novice', 'touch').clean;
  chk(`a novice on a phone strikes Clean on ≥ ${G.noviceCleanSmall * 100}% of Small bites`, nc >= G.noviceCleanSmall, `${(nc * 100).toFixed(0)}% (median reaction ${A.strike.reaction.novice[0]} s; Clean part ${Math.max(A.strike.cleanMin, A.strike.cleanFrac * A.strike.window.small).toFixed(2)} s; touch latency compensated ${A.strike.latencyComp.touch} s)`);
  say('== Targets'); for (const r of res) say(r); say();
  return res;
}

// ---- per-run gear (P1–P2 runs, The Long Descent): Hold per owned level, and the legends on per-run gear (CATCH_V3.legend.fightRun)
function perRun() {
  say('== Per-run gear (P1–P2 runs, The Long Descent): Hold per owned level (upgradeHold: every level counts; the rounded tier gives the rating)');
  for (const slot of ['rod', 'line', 'reel']) say(`   ${slot.padEnd(5)} ${[...Array(slotLevels(slot) + 1).keys()].map((k) => runHoldFor({ [slot]: k })[slot].toFixed(1)).join(' · ')}`);
  const W = [24, 9, 9, 9, 9, 9, 22];
  say(row(['legend (per-run gear)', 'T1', 'T2', 'T3', 'T4', 'R3L2E3', 'within 3 (R3L2E3)'], W));
  for (const id of Object.keys(C.legend.fight)) {
    const sp = SPB[id], mixed = { rod: 3, line: 2, reel: 3 };
    let miss = 1; for (let k = 0; k < 3; k++) miss *= 1 - chance(sp, 'legend', { tackle: mixed, perRun: true, wounds: k });
    say(row([sp.name, ...[1, 2, 3, 4].map((n) => pct(chance(sp, 'legend', { tackle: T(n), perRun: true }))), pct(chance(sp, 'legend', { tackle: mixed, perRun: true })), `${pct(1 - miss)}%`], W));
  }
  say('   wounds inside The Long Descent count per descent (run.legendWounds); expeditions keep them in meta');
  say();
}

// ---- the strike model (AUTOFISH.strike): grades by reaction, after the input latency and its compensation
function strikeModel() {
  say('== Strike timing (reaction after the "!" ~ lognormal; touch latency 0.075 s, compensated ' + A.strike.latencyComp.touch + ' s; the 0.25 s last dip makes it a rhythm)');
  for (const who of ['novice', 'average', 'expert']) say(`   ${who.padEnd(8)} ${['small', 'keeper', 'prize', 'elder'].map((c) => { const g = strikeGrades(c, who); return `${c} Clean ${(g.clean * 100).toFixed(0)} / Struck ${(g.struck * 100).toFixed(0)} / Late ${(g.late * 100).toFixed(0)}%`; }).join(' · ')}`);
  say(`   the economy's average player (AUTOFISH.player.strike): ${Object.entries(A.player.strike).map(([k, v]) => `${k} ${v * 100}%`).join(' · ')} → +${Object.entries(A.player.strike).reduce((a, [k, v]) => a + v * C.strike[k], 0).toFixed(2)} Hold on average`);
  say();
}

// ---- lake averages by rarity × class (open water, no item)
function lakeAverages() {
  const W = [18, 10, 8, 8, 8, 8, 8, 8];
  say(MD ? '**Lake averages** (open-water species, no item, reference strike, the tier\'s relics; T(i) = the tier you arrive with, T(i+1) the lake\'s curve tier)' : '== Lake averages: % by rarity × class, no item, the tier\'s relics (arrival T(i) → curve T(i+1) → T4)');
  say(row(['lake · rarity', 'tackle', ...CLASSES.map((c) => CL[c])], W)); if (MD) say(sep(8));
  LAKES.forEach((lake, i) => {
    for (const r of ['common', 'uncommon', 'rare']) {
      const ss = SP.filter((s) => s.zone === lake && s.rarity === r && !s.place);
      if (!ss.length) continue;
      for (const n of [i, i + 1, 4].filter((v, k, a) => v <= 4 && a.indexOf(v) === k)) {
        const cells = [`${MD ? lake : lake.slice(0, 9)} · ${r}`, `T${n}`];
        for (const c of CLASSES) { const v = ss.map((s) => chance(s, c, { tackle: T(n) })).filter((p) => p != null); cells.push(v.length ? pct(v.reduce((a, b) => a + b, 0) / v.length) : '—'); }
        say(row(cells, W));
      }
    }
  });
  say();
}

// ---- the items (the gear log): Hold and targets
function items() {
  const W = [24, 7, 8, 7, 60];
  say(MD ? '**Baits and lures** (Hold on the fish each one helps; nothing on anything else)' : '== Baits and lures: Hold on their targets');
  say(row(['item', 'kind', 'price', 'Hold', 'helps'], W)); if (MD) say(sep(5));
  for (const id of ITEM_IDS) {
    const it = C.items[id], t = D.catchItemTargets(id);
    const price = D.LURES.find((l) => l.id === id)?.price ?? [...D.BAITS, ...D.WALK_BAITS].find((b) => b.id === id)?.price ?? (id === 'cut_strip' ? 'free' : '—');
    const helps = it.all ? 'every fish' : it.family ? `${it.family} family (${t.length} species)` : it.night ? `night-only species, at night (${t.length})` : t.map((x) => SPB[x].name).join(', ');
    say(row([itemName(id), it.kind, price, `+${it.hold}`, helps], W));
  }
  say();
}

// ---- legends
function legends() {
  const W = [24, 8, 8, 8, 8, 8, 30];
  say(MD ? `**Legends** (legend bait required; reference strike; the tier's relics; cap ${C.cap.legend * 100}%)` : '== Legends: % by matched tier (legend bait; the tier\'s relics); wounds = escapes so far');
  say(row(['legend', 'T0', 'T1', 'T2', 'T3', 'T4', 'T4 after 1 / 2 / 3 escapes'], W)); if (MD) say(sep(7));
  const ids = Object.keys(C.legend.fight);
  for (const id of ids) say(row([SPB[id].name, ...[0, 1, 2, 3, 4].map((n) => pct(chance(SPB[id], 'legend', { tackle: T(n) }))), [1, 2, 3].map((w) => pct(chance(SPB[id], 'legend', { tackle: T(4), wounds: w }))).join(' / ')], W));
  const lines = [];
  ids.forEach((id, i) => {
    const n = i + 1;   // the lake's curve tier
    let miss = 1, e = 0;
    for (let k = 0; k < 40; k++) { const p = chance(SPB[id], 'legend', { tackle: T(n), wounds: k }); e += miss; miss *= 1 - p; }
    const price = D.ECONOMY_V3.legendBaits[Object.keys(D.ECONOMY_V3.legendBaits)[i]];
    lines.push(`${SPB[id].name} on T${n}: ${e.toFixed(1)} attempts expected (≈ ${Math.round(e * price)} Shells of legend bait)`);
  });
  for (const l of lines) say(MD ? `- ${l}` : `   ${l}`); say();
}

// ---- favour trade-off: z ~ N(μ, 1); more favour = bigger fish = lower odds, more value per hook
function favour() {
  const W = [10, 8, 8, 8, 8, 8, 8, 10, 12, 12];
  const mus = [0, 0.5, 1.0, 1.5, 1.8];
  const show = [['mossback_perch', 1, false], ['reedjaw_pike', 1, true], ['reedjaw_pike', 4, true]];
  say(MD ? '**Favour: bigger fish, lower odds, more value** (class mix from `classOdds(μ)`; E[p] = the chance a hook lands; Shells = expected sale value per hook)' : '== Favour trade-off (class mix by μ; E[p] per hook; Shells landed per hook)');
  for (const [id, n, giants] of show) {
    const s = SPB[id];
    say(MD ? `*${s.name}, T${n}, ${giants ? 'giant water' : 'ordinary water'}*` : `-- ${s.name}, T${n}, ${giants ? 'giant water (Elders possible)' : 'ordinary water (z ≤ 2.64)'}`);
    say(row(['μ', 'Small', 'Keeper', 'Prize', 'Trophy', 'Elder', 'Anc.', 'E[p]', 'Shells/hook', 'Elders/100'], W)); if (MD) say(sep(10));
    for (const mu of mus) {
      const odds = D.classOdds(mu, giants ? D.BALANCE_V3.size.z.max : D.BALANCE_V3.size.elsewhereMaxZ);
      const mix = { ...odds, elder: odds.elder - odds.ancient };
      let Ep = 0, Ev = 0, El = 0;
      for (const c of CLASSES) {
        const w = mix[c] || 0; if (!w) continue;
        const p = chance(s, c, { tackle: T(n) }) ?? 0;
        Ep += w * p; Ev += w * p * D.fishValueV3(s, D.BALANCE_V3.size.simZ[c]) * C.economy.norm[homeLake(s)]; if (c === 'elder' || c === 'ancient') El += w * p;
      }
      say(row([mu.toFixed(1), ...CLASSES.map((c) => (mix[c] * 100).toFixed(1)), pct(Ep), Ev.toFixed(1), (El * 100).toFixed(2)], W));
    }
    say();
  }
}

// ---- expected landings per outing (an expectation over the lake's open-water pool, the real favour mix and an average strike)
const playMid = (c) => (A.play[c].dur[0] + A.play[c].dur[1]) / 2;
export function outingRows() {
  const P = A.player, Tm = A.time, E = D.ECONOMY_V3.income, VM = D.BALANCE_V3.size.valueMix;
  const timeW = { any: 1, gloom: 0.35, calm: 0.65, dawn: 0.05 };
  const rows = [];
  LAKES.forEach((lake, i) => {
    const pool = SP.filter((s) => s.zone === lake && s.rarity !== 'legendary' && !s.place);
    const wts = pool.map((s) => D.RARITY_WEIGHTS[s.rarity] * (timeW[s.time] ?? 1));
    const wsum = wts.reduce((a, b) => a + b, 0);
    for (const n of [i, Math.min(4, i + 1), 4].filter((v, k, a) => a.indexOf(v) === k)) {
      let Ep = 0, Eplay = 0, Ecer = 0, prize = 0, trophy = 0, elder = 0;
      for (const [mu, mw] of VM.mu) for (const giants of [true, false]) {
        const gw = giants ? VM.giantShare : 1 - VM.giantShare;
        const odds = D.classOdds(mu, giants ? D.BALANCE_V3.size.z.max : D.BALANCE_V3.size.elsewhereMaxZ);
        const mix = { ...odds, elder: odds.elder - odds.ancient };
        pool.forEach((s, k) => {
          const sw = (wts[k] / wsum) * mw * gw;
          for (const c of CLASSES) {
            const w = sw * (mix[c] || 0); if (!w || !D.catchClassAllowed(s, c)) continue;
            const strikeP = Object.entries(P.strike).reduce((a, [st, f]) => a + f * chance(s, c, { tackle: T(n), strike: st, buffs: relicAt(n) }), 0);
            Ep += w * strikeP;
            // Small / Keeper: a share of plays hurried (× 2.5) with the ceremony tapped short (AUTOFISH.player.hurry, play.inputs.hurry)
            const hurried = A.play.inputs.hurry.classes.includes(c) ? P.hurry ?? 0 : 0, playK = 1 - hurried + hurried / A.play.inputs.hurry.mult;
            const cer = (1 - hurried) * Tm.ceremony[c] + hurried * Math.min(Tm.ceremony[c], P.tapTo ?? Tm.ceremony[c]);
            Eplay += w * playMid(c) * playK * (strikeP + (1 - strikeP) * 0.72);   // a lost play ends at ≈ 0.72 of its plan (losses land in the second half)
            Ecer += w * (strikeP * (cer + Tm.card) + (1 - strikeP) * Tm.lostNote);
            if (CLASSES.indexOf(c) >= 2) prize += w * strikeP;
            if (CLASSES.indexOf(c) >= 3) trophy += w * strikeP;
            if (CLASSES.indexOf(c) >= 4) elder += w * strikeP;
          }
        });
      }
      const sPerCast = Tm.cast + Tm.wait + Tm.strike + (1 - P.letPass) * (Eplay + Ecer);
      const casts = P.fishSecPerDay / sPerCast, hooks = casts * (1 - P.letPass), land = hooks * Ep;
      rows.push({ lake, n, arrival: n === i, curve: n === Math.min(4, i + 1), sPerCast, hooks, Ep, land, lost: hooks * (1 - Ep), today: E[lake].landed, prize: hooks * prize * 4, trophy: hooks * trophy * 4, elder: hooks * elder * 4, norm: E[lake].landed / land });
    }
  });
  return rows;
}
/** The economy normaliser per lake: today's landed/day ÷ the model's, averaged over the arrival and curve tiers (CATCH_V3.economy.norm). */
export function recommendedNorm(rows = outingRows()) {
  return Object.fromEntries(LAKES.map((l) => { const r = rows.filter((x) => x.lake === l && (x.arrival || x.curve)); return [l, r.reduce((a, x) => a + x.norm, 0) / r.length]; }));
}
function outings() {
  const P = A.player, VM = D.BALANCE_V3.size.valueMix;
  const W = [12, 7, 8, 9, 7, 8, 7, 8, 10, 11, 10, 9];
  say(MD ? `**Landings per outing** (open water, ${(VM.giantShare * 100).toFixed(0)}% of casts in giant water, the favour mix of §25.7.3, average strike, ${(P.letPass * 100).toFixed(0)}% let pass, ${(P.hurry * 100).toFixed(0)}% of Small / Keeper plays hurried, ${P.fishSecPerDay} s of fishing per day as in §25.2.4; "today" = ECONOMY_V3 landed/day; Elder/4d = open-water casts only, before residents and Marked Fish)` : `== Landings per outing (expectation; ${P.fishSecPerDay} s fishing/day; average strike; ${(P.letPass * 100).toFixed(0)}% let pass; ${(P.hurry * 100).toFixed(0)}% of Small / Keeper plays hurried; the tier's relics)`);
  say(row(['lake', 'tackle', 's/cast', 'hooks/d', 'E[p]', 'land/d', 'lost/4d', 'today', 'per 4d', 'Prize+/4d', 'Trophy+/4d', 'Elder/4d', 'norm'], [12, 7, 8, 9, 7, 8, 8, 7, 8, 10, 11, 10, 9])); if (MD) say(sep(13));
  const rows = outingRows();
  for (const r of rows) say(row([r.lake, `T${r.n}`, r.sPerCast.toFixed(1), r.hooks.toFixed(1), pct(r.Ep), r.land.toFixed(1), (r.lost * 4).toFixed(1), r.today.toFixed(1), (r.land * 4).toFixed(1), r.prize.toFixed(2), r.trophy.toFixed(2), r.elder.toFixed(3), `×${r.norm.toFixed(2)}`], [12, 7, 8, 9, 7, 8, 8, 7, 8, 10, 11, 10, 9]));
  const rec = recommendedNorm(rows);
  const off = LAKES.filter((l) => Math.abs(rec[l] - C.economy.norm[l]) > 0.03);
  say(`${off.length ? 'CHECK' : 'PASS '} economy normaliser (arrival + curve tiers): ${LAKES.map((l) => `${l} ${rec[l].toFixed(2)} (data ${C.economy.norm[l]})`).join(' · ')}`);
  say();
}

// ---- the leap ambiguity rule (AUTOFISH.leapRule): in every lake × hour × depth band × item × size class, the species that can leap
// number 0 or ≥ 2, and none makes up more than maxShare of the expected leaps. Leap counts and windows are class-level (one table for
// every leaper), so a leap's only species information is "it leapt" given the class. `roster` defaults to every species; validate-data
// passes one per phase. The same pools drive the bite rule (biteCells) and the sign rule (signCells).
const timeOk = (t, hour) => (t === 'calm' ? hour !== 'gloomtide' : t === 'gloom' ? hour === 'gloomtide' : t === 'dawn' ? hour === 'calm' : true);
const overlaps = (r, b) => (r?.[0] ?? 0) <= b[1] && (r?.[1] ?? 1) >= b[0];
const poolItems = (walk) => {
  const baits = [...D.BAITS, ...(walk ? D.WALK_BAITS : [])].filter((b) => !b.legend && C.items[b.id]);
  const lures = D.LURES.filter((l) => C.items[l.id]);
  return [{ id: null }, ...baits.map((b) => ({ id: b.id, bait: b })), ...lures.map((l) => ({ id: l.id, lure: l }))];
};
const rollWeight = (s, it) => {
  let v = D.RARITY_WEIGHTS[s.rarity] ?? 10;
  if (it.bait?.bonus?.attract?.includes(s.id)) v *= 2.5;
  if (s.bait && s.bait === it.id) v *= 1.5;
  if (it.lure && ((it.lure.family && s.family === it.lure.family) || (it.lure.night && s.night) || it.lure.species?.includes(s.id))) v *= it.lure.attract;
  return v;
};
const inLake = (s, lake) => (s.zone === lake || (s.zones || []).includes(lake)) && s.rarity !== 'legendary' && !s.cove;
/** The share of a species' bites in a size class at favour μ (open water clamps z to a top Trophy; Elders come from giant water). */
const classShare = (s, cls, mu) => {
  if (!D.catchClassAllowed(s, cls)) return 0;
  const giant = cls === 'elder' || cls === 'ancient', SZ = D.BALANCE_V3.size;
  const o = D.classOdds(mu, Math.min(D.maxZFor(s), giant ? SZ.z.max : SZ.elsewhereMaxZ));
  return cls === 'elder' ? o.elder : (o[cls] || 0);
};
const shareCell = (entries, item, rule, extra = {}) => {
  const pos = entries.filter(([, v]) => v > 1e-12), tot = pos.reduce((a, [, v]) => a + v, 0);
  const top = [...pos].sort((a, b) => b[1] - a[1])[0], share = tot ? top[1] / tot : 0, max = item ? rule.maxShareItem : rule.maxShare;
  return { n: pos.length, share, top: top?.[0].id ?? null, max, split: pos.sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s, v]) => `${s.id} ${Math.round((v / tot) * 100)}%`).join(', '),
    ok: (pos.length === 0 || pos.length >= 2) && share <= max + 1e-9, ...extra };
};
export function leapCells(roster = SP, { walk = true } = {}) {
  const R = A.leapRule, cells = [], items = poolItems(walk);
  const leapOf = (s) => A.leaps[s.id] ?? 0;
  const eval1 = (label, entries, item) => { for (const cls of R.classes) cells.push({ label: `${label} · ${cls}`, ...shareCell(entries.map(([s, w]) => [s, w * leapOf(s) * classShare(s, cls, 0.4)]), item, R) }); };
  for (const lake of LAKES) for (const hour of R.hours) for (const band of R.bands) for (const it of items) {
    const open = roster.filter((s) => inLake(s, lake) && !s.place && timeOk(s.time || 'any', hour) && overlaps(s.depth, band) && (!s.bait || s.bait === it.id));
    if (!open.length) continue;
    eval1(`${lake} · ${hour} · ${band.join('–')} · ${it.id ?? 'no item'}`, open.map((s) => [s, rollWeight(s, it)]), it.id);
  }
  // kept places: the open pool at the kept species' depth band and hours, plus the kept species at × keptWeight
  for (const k of roster.filter((s) => s.place && s.rarity !== 'legendary')) {
    const lake = k.zone; if (!lake) continue;
    for (const hour of R.hours.filter((h) => timeOk(k.time || 'any', h))) for (const it of items) {
      const band = k.depth || [0, 1];
      const open = roster.filter((s) => inLake(s, lake) && !s.place && timeOk(s.time || 'any', hour) && overlaps(s.depth, band) && (!s.bait || s.bait === it.id));
      const entries = open.map((s) => [s, rollWeight(s, it) * (s.spots?.[k.place] ?? 1)]);
      entries.push([k, rollWeight(k, it) * R.keptWeight]);
      eval1(`${lake} · ${k.place} (${k.id}) · ${hour} · ${it.id ?? 'no item'}`, entries, it.id);
    }
  }
  return cells;
}
/** The bite rule (AUTOFISH.biteRule): open water, lake × hour × band × item × class; 0 or ≥ 2 species, none above maxShare. */
export function biteCells(roster = SP, { walk = true } = {}) {
  const R = A.biteRule, cells = [], items = poolItems(walk), accepted = (label) => R.accepted.some((a) => label.startsWith(`${a.cell} · `));
  for (const lake of LAKES) for (const hour of A.leapRule.hours) for (const band of A.leapRule.bands) for (const it of items) {
    const open = roster.filter((s) => inLake(s, lake) && !s.place && timeOk(s.time || 'any', hour) && overlaps(s.depth, band) && (!s.bait || s.bait === it.id));
    if (!open.length) continue;
    for (const cls of R.classes) {
      const label = `${lake} · ${hour} · ${band.join('–')} · ${it.id ?? 'no item'} · ${cls}`;
      const c = shareCell(open.map((s) => [s, rollWeight(s, it) * classShare(s, cls, R.mu)]), it.id, R, { label });
      if (!c.ok && accepted(label)) { c.ok = true; c.accepted = true; }
      cells.push(c);
    }
  }
  return cells;
}
/** The sign rule (AUTOFISH.signRule): each tilting sign kind × lake × hour × band over the open pool; a failing cell pre-rolls from
 *  the blind pool at runtime (`fallback`), so this reports, it does not fail. Filters as fishing applies them (DESIGN §25.6.1). */
export const SIGN_TILTS = {
  rise: { filter: (s) => (s.depth?.[0] ?? 0) <= 0.35 },
  glow: { filter: (s) => s.time === 'gloom' || !!s.model?.glow, hours: ['gloomtide'] },
  nervous: { mult: (s) => (s.family === 'predator' ? 3 : 1) }, strike: { mult: (s) => (s.family === 'predator' ? 3 : 1) },
  bubbles: { mult: (s) => (s.family === 'bottom' ? 2 : 1) },
};
export function signCells(roster = SP) {
  const R = A.signRule, cells = [];
  for (const [kind, t] of Object.entries(SIGN_TILTS)) for (const lake of LAKES) for (const hour of t.hours || A.leapRule.hours) for (const band of A.leapRule.bands) {
    const open = roster.filter((s) => inLake(s, lake) && !s.place && !s.bait && timeOk(s.time || 'any', hour) && overlaps(s.depth, band) && (!t.filter || t.filter(s)));
    if (!open.length) continue;
    const c = shareCell(open.map((s) => [s, (D.RARITY_WEIGHTS[s.rarity] ?? 10) * (t.mult ? t.mult(s) : 1)]), true, { maxShare: R.maxShare, maxShareItem: R.maxShare });
    c.ok = c.n >= R.minSpecies && c.share <= R.maxShare + 1e-9; c.label = `${kind} · ${lake} · ${hour} · ${band.join('–')}`;
    cells.push(c);
  }
  return cells;
}
function leaps(all = false) {
  const cells = leapCells();
  const bad = cells.filter((c) => !c.ok);
  say(`== Leaps: ${Object.keys(A.leaps).length} species can leap (counts and windows by class: ${Object.entries(A.leap.count).map(([c, d]) => `${c} ${d.map(([n, p]) => `${n}×${Math.round(p * 100)}%`).join('/')}`).join(' · ')}); ${cells.length} cells; ${bad.length} fail the ambiguity rule (0 or ≥ 2 leapers; none > ${A.leapRule.maxShare * 100}% with no item, > ${A.leapRule.maxShareItem * 100}% with one)`);
  for (const lake of LAKES) say(`   ${LAKE_NAME[lake]}: ${SP.filter((s) => (s.zone === lake || (s.zones || []).includes(lake)) && A.leaps[s.id]).map((s) => `${s.name} ${A.leaps[s.id]}`).join(' · ')}`);
  const worst = [...cells].sort((a, b) => b.share / b.max - a.share / a.max).slice(0, all ? cells.length : 8);
  for (const c of worst) say(`   ${c.ok ? 'ok  ' : 'FAIL'} ${(c.share * 100).toFixed(0).padStart(3)}%  ${c.label}: ${c.split}`);
  say();
  const bite = biteCells(), bb = bite.filter((c) => !c.ok);
  say(`== Bites: ${bite.length} cells (open water; class at μ ${A.biteRule.mu}); ${bb.length} fail (0 or ≥ 2 species; none > ${A.biteRule.maxShare * 100}% with no item, > ${A.biteRule.maxShareItem * 100}% with one); ${bite.filter((c) => c.accepted).length} accepted by name`);
  for (const c of [...bite].sort((a, b) => b.share / b.max - a.share / a.max).slice(0, all ? bite.length : 6)) say(`   ${c.ok ? (c.accepted ? 'acc ' : 'ok  ') : 'FAIL'} ${(c.share * 100).toFixed(0).padStart(3)}%  ${c.label}: ${c.split}`);
  say();
  const sig = signCells(), sf = sig.filter((c) => !c.ok);
  say(`== Signs: ${sig.length} tilted cells; ${sf.length} fall back to the blind pool at runtime (< ${A.signRule.minSpecies} species or top > ${A.signRule.maxShare * 100}%)`);
  for (const c of sf.slice(0, all ? sf.length : 6)) say(`   blind ${(c.share * 100).toFixed(0).padStart(3)}%  ${c.label}: ${c.split}`);
  say();
  return bad;
}

// ---- the first Elder (QA §25.9.5 wants it between hours 3 and 8): an open-water lower bound along the tackle timeline. Residents,
// kept places and Marked Fish (+6 Hold on the re-hook) add the rest; the pacing sim T5 owns the full figure and reports it.
function elderPacing() {
  const VM = D.BALANCE_V3.size.valueMix, P = A.player, EC = D.ECONOMY_V3;
  const tierAt = (h) => { const t = { rod: 0, line: 0, reel: 0 }; for (const [hh, items] of EC.timeline) if (hh <= h) for (const k of items) { const [kind, a] = k.split(':'); if (kind in t) t[kind] = Math.max(t[kind], +a); } return t; };
  const lakeAt = (h) => LAKES.find((l) => h >= EC.spans[l][0] && h < EC.spans[l][1]);
  const rows = outingRows(), hooksAt = (lake) => rows.find((r) => r.lake === lake && r.arrival).hooks;
  const odds = D.classOdds;
  const elderPerDay = (lake, tackle, n) => {
    const pool = SP.filter((s) => s.zone === lake && s.rarity !== 'legendary' && !s.place && D.catchClassAllowed(s, 'elder'));
    const all = SP.filter((s) => s.zone === lake && s.rarity !== 'legendary' && !s.place);
    const wsum = all.reduce((a, s) => a + D.RARITY_WEIGHTS[s.rarity], 0);
    let e = 0;
    for (const [mu, mw] of VM.mu) for (const s of pool) {
      const o = odds(mu, D.BALANCE_V3.size.z.max), w = (D.RARITY_WEIGHTS[s.rarity] / wsum) * mw * VM.giantShare;
      for (const c of ['elder', 'ancient']) {
        const share = c === 'elder' ? o.elder - o.ancient : o.ancient;
        const p = Object.entries(P.strike).reduce((a, [st, f]) => a + f * chance(s, c, { tackle, strike: st, buffs: relicAt(n) }), 0);
        e += w * share * p;
      }
    }
    return e * hooksAt(lake) * (1 - P.letPass);
  };
  let L = 0; const marks = [];
  for (let h = 0; h < 8; h += 0.1) {
    const t = tierAt(h), lake = lakeAt(h), n = Math.floor((t.rod + t.line + t.reel) / 3);
    L += elderPerDay(lake, t, n) * EC.daysPerHour * 0.1;
    if ([3, 5, 8].some((x) => Math.abs(h + 0.1 - x) < 1e-6)) marks.push(`h${Math.round(h + 0.1)} ${(100 * (1 - Math.exp(-L))).toFixed(0)}%`);
  }
  say(`== The first Elder (open water only, a lower bound; QA wants h3–8): P(≥ 1 Elder landed) ${marks.join(' · ')}; residents, kept places and Marked Fish add the rest (T5 reports the full figure; if it falls short, raise CATCH_V3.markedFish to 9, not the Elder odds)`);
  say();
}

// ---- the Landing (tutorial)
function landing() {
  const q = SPB.quayling;
  const mix = D.classOdds(0, D.maxZFor(q)), split = { small: mix.small / (mix.small + mix.keeper), keeper: mix.keeper / (mix.small + mix.keeper) };
  const blended = split.small * chance(q, 'small', { tackle: T(0), lake: 'cove' }) + split.keeper * chance(q, 'keeper', { tackle: T(0), lake: 'cove' });
  say(`== The Landing: Quayling (tutorial, μ 0: ${(split.small * 100).toFixed(1)}% Small / ${(split.keeper * 100).toFixed(1)}% Keeper) Small ${(chance(q, 'small', { tackle: T(0), lake: 'cove' }) * 100).toFixed(1)}% · Keeper ${(chance(q, 'keeper', { tackle: T(0), lake: 'cove' }) * 100).toFixed(1)}% on T0 with a struck strike (blended ${(blended * 100).toFixed(1)}%); clean ${(chance(q, 'small', { tackle: T(0), lake: 'cove', strike: 'clean' }) * 100).toFixed(1)}%, early or late ${(chance(q, 'small', { tackle: T(0), lake: 'cove', strike: 'early' }) * 100).toFixed(1)}%; three losses in a row ≈ ${((1 - blended) ** 3 * 100).toFixed(2)}%`);
  const r = LAKES.map((l, i) => { const x = D.catchRating(l, T(i)); return `${l} T${i}: ${x.held ? `holds ${x.held}s` : 'holds nothing'}, ${x.next ?? '—'} ${x.word ?? ''}`; });
  say(`== Set Out tackle rating (words only, on arrival tackle): ${r.join(' · ')}`);
  say();
}

// ---------------------------------------------------------------------------------------------------------- main
if (import.meta.url === `file://${process.argv[1]}`) {
  if (has('--json')) { console.log(JSON.stringify({ CATCH_V3: C, AUTOFISH: A }, null, 1)); process.exit(0); }
  const lake = opt('--lake'), sid = opt('--species');
  if (sid) { const W = [24, 9, 9, 9, 9, 9, 9, 26]; say(row(['species', 'class', 'T0', 'T1', 'T2', 'T3', 'T4', 'best item'], W)); if (MD) say(sep(8)); for (const r of speciesRows(SPB[sid])) say(row(r, W)); }
  else if (lake) lakeTable(lake);
  else if (has('--all')) for (const l of LAKES) lakeTable(l);
  else if (has('--leaps')) leaps(true);
  else {
    targets();
    for (const l of LAKES) lakeTable(l, (s) => s.reference || s.id === SP.find((x) => x.zone === l && x.rarity === 'common')?.id);
    lakeAverages(); items(); legends(); perRun(); strikeModel(); favour(); outings(); elderPacing(); landing(); leaps();
  }
  console.log(out.join('\n'));
}
