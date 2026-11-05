#!/usr/bin/env node
// tools/sim/catch-v3.mjs — the automatic-fishing catch-chance model (DESIGN §25.6, CONTRACT §13.7). Everything it prints comes
// from src/data.js: CATCH_V3 (the formula's constants), AUTOFISH (strike, play, leaps, time model), TACKLE[slot][tier].hold,
// LURES / BAITS, the species, the size model and ECONOMY_V3, through the same pure helpers fishing and the logs use
// (catchChance, catchParts, catchItemHold, catchBestItem, catchRating). There is no second copy of the numbers here.
//
//   p = max( floor, cap[class] · σ( scale · (Hold − Fight) ) )        every cap < 1, so p < 1 always
//
// Run from gloomwater/:
//   node tools/sim/catch-v3.mjs                 summary: targets, reference species, lake averages, items, legends, favour,
//                                               landings per outing (+ the economy normaliser), the Landing, leaps
//   node tools/sim/catch-v3.mjs --all           every lake × species × class at T0…T4, without / with the best bait or lure
//   node tools/sim/catch-v3.mjs --lake mossmere one lake's full table          --species reedjaw_pike  one species
//   node tools/sim/catch-v3.mjs --leaps         the leap ambiguity rule, cell by cell (worst cells first)
//   node tools/sim/catch-v3.mjs --md            markdown tables               --json  CATCH_V3 + AUTOFISH as JSON
//   node tools/sim/catch-v3.mjs --strike clean|struck|early|late   (default struck: the log's reference strike)
// Deterministic (closed form; the outing estimate is an expectation, no RNG). The manual tension reel's sim, reel-v3.mjs, is
// legacy: it no longer gates v3 fishing (see its header).
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
/** chance with the sim's default strike */
export const chance = (sp, cls, o = {}) => D.catchChance(sp, cls, { ...(o.tackle || T(0)), item: o.item }, { strike: o.strike ?? STRIKE, lake: o.lake, buffs: o.buffs, marked: o.marked, wounds: o.wounds, landings: o.landings, night: o.night });

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
  say(MD ? `**${LAKE_NAME[lake]}** (% landed, matched tackle T0…T4, the log's reference strike: without / with the best bait or lure)` : `== ${LAKE_NAME[lake]} (% landed: no item / best bait-or-lure; matched T0…T4; strike ${STRIKE})`);
  say(row(['species', 'class', 'T0', 'T1', 'T2', 'T3', 'T4', 'best item'], W)); if (MD) say(sep(8));
  for (const sp of SP.filter((s) => homeLake(s) === lake && s.rarity !== 'legendary' && filter(s))) for (const r of speciesRows(sp, lake)) say(row(r, W));
  say();
}

// ---- targets (PASS / CHECK) from CATCH_V3.targets
export function targets() {
  const G = C.targets, res = [];
  const chk = (name, ok, detail) => res.push(`${ok ? 'PASS ' : 'CHECK'} ${name}: ${detail}`);
  const moss = SP.filter((s) => s.zone === 'mossmere' && s.rarity === 'common');
  const c0 = moss.flatMap((s) => ['small', 'keeper'].map((c) => chance(s, c, { tackle: T(0) })));
  chk(`early commons, starter tackle, ${G.commonsT0[0] * 100}–${G.commonsT0[1] * 100}%`, c0.every((p) => p >= G.commonsT0[0] && p <= G.commonsT0[1]), `Mossmere commons Small/Keeper on T0 ${pct(Math.min(...c0))}–${pct(Math.max(...c0))}%`);
  const arrival = LAKES.map((l, i) => { const v = SP.filter((s) => s.zone === l && s.rarity === 'common').map((s) => chance(s, 'keeper', { tackle: T(i) })); return `${l} T${i} ${pct(Math.min(...v))}–${pct(Math.max(...v))}`; });
  res.push(`      Keeper commons on each lake's arrival tackle: ${arrival.join(' · ')}`);
  // every Elder at T0 (reference strike, no buffs), with or without any one item
  let e0 = 0, e0who = '';
  for (const s of SP) if (D.catchClassAllowed(s, 'elder')) for (const it of [null, ...ITEM_IDS]) { const p = chance(s, 'elder', { tackle: T(0), item: it, strike: 'struck' }); if (p > e0) { e0 = p; e0who = `${s.name}${it ? ` + ${itemName(it)}` : ''}`; } }
  chk(`every Elder on T0 ≤ ${G.elderT0Max * 100}% (reference strike, no buffs, any one item)`, e0 <= G.elderT0Max, `highest ${(e0 * 100).toFixed(1)}% (${e0who})`);
  const ref = Object.values(D.TACKLE.reference).map((id) => SPB[id]);
  const early = ref.slice(0, 2);
  const e02 = early.flatMap((s) => [0, 1, 2].map((n) => chance(s, 'elder', { tackle: T(n) })));
  chk(`early headline Elders ≤ ${G.headlineElderEarlyMax * 100}% until late tackle (T0–T2, no item)`, e02.every((p) => p <= G.headlineElderEarlyMax), early.map((s) => `${s.name} ${[0, 1, 2].map((n) => pct(chance(s, 'elder', { tackle: T(n) }))).join('/')}`).join(' · '));
  res.push(`      … with their best item on T0/T1/T2: ${early.map((s) => `${s.name} ${[0, 1, 2].map((n) => pct(chance(s, 'elder', { tackle: T(n), item: D.catchBestItem(s).id }))).join('/')}`).join(' · ')}`);
  const top = ref.map((s) => chance(s, 'elder', { tackle: T(4), item: D.catchBestItem(s).id }));
  chk(`early headline Elders on T4 with the right lure ${G.headlineElderT4Item[0] * 100}–${G.headlineElderT4Item[1] * 100}%`, top.slice(0, 2).every((p) => p >= G.headlineElderT4Item[0] && p <= G.headlineElderT4Item[1]), ref.slice(0, 2).map((s, i) => `${s.name} ${pct(top[i])}`).join(' · '));
  res.push(`      deep lakes (by design lower: the endgame's hardest regular fish): ${ref.slice(2).map((s, i) => `${s.name} ${pct(top[i + 2])}`).join(' · ')}`);
  const topMax = ref.map((s) => chance(s, 'elder', { tackle: T(4), item: D.catchBestItem(s).id, strike: 'clean', buffs: C.buffs.cap }));
  res.push(`      … with a clean strike and every buff (+${C.buffs.cap}): ${ref.map((s, i) => `${s.name} ${pct(topMax[i])}`).join(' · ')}`);
  let maxAnc = 0, maxAncWho = '';
  for (const s of SP) if (D.catchClassAllowed(s, 'ancient')) {
    const p = chance(s, 'ancient', { tackle: T(4), item: D.catchBestItem(s).id, strike: 'clean', buffs: C.buffs.cap, marked: true });
    if (p > maxAnc) { maxAnc = p; maxAncWho = s.name; }
  }
  const legIds = Object.keys(C.legend.fight);
  const legMax = legIds.map((id) => chance(SPB[id], 'legend', { tackle: T(4), strike: 'clean', buffs: C.buffs.cap, wounds: 9 }));
  chk('Ancients and legends never better than a coin flip', maxAnc < G.ancientMax && legMax.every((p) => p < G.legendMax), `best Ancient anywhere (T4, best item, clean, every buff, Marked) ${(maxAnc * 100).toFixed(1)}% (${maxAncWho}); legends at their best ${legMax.map((p) => (p * 100).toFixed(1)).join(' / ')}%`);
  let maxAll = 0, maxWho = '';
  for (const s of SP) for (const c of [...CLASSES, 'legend']) for (const it of [null, ...ITEM_IDS]) {
    const parts = D.catchParts(s, c, { ...T(4), item: it }, { strike: 'clean', buffs: C.buffs.cap, marked: true, wounds: 9 });
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
  say('== Targets'); for (const r of res) say(r); say();
  return res;
}

// ---- lake averages by rarity × class (open water, no item)
function lakeAverages() {
  const W = [18, 10, 8, 8, 8, 8, 8, 8];
  say(MD ? '**Lake averages** (open-water species, no item, reference strike; T(i) = the tier you arrive with, T(i+1) the lake\'s curve tier)' : '== Lake averages: % by rarity × class, no item (arrival T(i) → curve T(i+1) → T4)');
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
  say(MD ? `**Legends** (legend bait required; reference strike; cap ${C.cap.legend * 100}%)` : '== Legends: % by matched tier (legend bait); wounds = escapes so far');
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
            const strikeP = Object.entries(P.strike).reduce((a, [st, f]) => a + f * chance(s, c, { tackle: T(n), strike: st }), 0);
            Ep += w * strikeP;
            Eplay += w * playMid(c) * (strikeP + (1 - strikeP) * 0.72);   // a lost play ends at ≈ 0.72 of its plan (losses land in the second half)
            Ecer += w * (strikeP * (Tm.ceremony[c] + Tm.card) + (1 - strikeP) * Tm.lostNote);
            if (CLASSES.indexOf(c) >= 2) prize += w * strikeP;
            if (CLASSES.indexOf(c) >= 3) trophy += w * strikeP;
            if (CLASSES.indexOf(c) >= 4) elder += w * strikeP;
          }
        });
      }
      const sPerCast = Tm.cast + Tm.wait + Tm.strike + (1 - P.letPass) * (Eplay + Ecer);
      const casts = P.fishSecPerDay / sPerCast, hooks = casts * (1 - P.letPass), land = hooks * Ep;
      rows.push({ lake, n, arrival: n === i, curve: n === Math.min(4, i + 1), sPerCast, hooks, Ep, land, today: E[lake].landed, prize: hooks * prize * 4, trophy: hooks * trophy * 4, elder: hooks * elder * 4, norm: E[lake].landed / land });
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
  say(MD ? `**Landings per outing** (open water, ${(VM.giantShare * 100).toFixed(0)}% of casts in giant water, the favour mix of §25.7.3, average strike, ${(P.letPass * 100).toFixed(0)}% let pass, ${P.fishSecPerDay} s of fishing per day as in §25.2.4; "today" = ECONOMY_V3 landed/day; Elder/4d = open-water casts only, before residents and Marked Fish)` : `== Landings per outing (expectation; ${P.fishSecPerDay} s fishing/day; average strike; ${(P.letPass * 100).toFixed(0)}% let pass)`);
  say(row(['lake', 'tackle', 's/cast', 'hooks/d', 'E[p]', 'land/d', 'today', 'per 4d', 'Prize+/4d', 'Trophy+/4d', 'Elder/4d', 'norm'], W)); if (MD) say(sep(12));
  const rows = outingRows();
  for (const r of rows) say(row([r.lake, `T${r.n}`, r.sPerCast.toFixed(1), r.hooks.toFixed(1), pct(r.Ep), r.land.toFixed(1), r.today.toFixed(1), (r.land * 4).toFixed(1), r.prize.toFixed(2), r.trophy.toFixed(2), r.elder.toFixed(3), `×${r.norm.toFixed(2)}`], W));
  const rec = recommendedNorm(rows);
  const off = LAKES.filter((l) => Math.abs(rec[l] - C.economy.norm[l]) > 0.03);
  say(`${off.length ? 'CHECK' : 'PASS '} economy normaliser (arrival + curve tiers): ${LAKES.map((l) => `${l} ${rec[l].toFixed(2)} (data ${C.economy.norm[l]})`).join(' · ')}`);
  say();
}

// ---- the leap ambiguity rule (AUTOFISH.leapRule): in every lake × hour × depth band × item, the species that can leap number 0 or
// ≥ 2, and none makes up more than maxShare of the expected leaps. `roster` defaults to every species; validate-data passes per phase.
const timeOk = (t, hour) => (t === 'calm' ? hour !== 'gloomtide' : t === 'gloom' ? hour === 'gloomtide' : t === 'dawn' ? hour === 'calm' : true);
const overlaps = (r, b) => (r?.[0] ?? 0) <= b[1] && (r?.[1] ?? 1) >= b[0];
export function leapCells(roster = SP, { walk = true, phase = 4 } = {}) {
  const R = A.leapRule, W = D.RARITY_WEIGHTS, cells = [];
  const baits = [...D.BAITS, ...(walk ? D.WALK_BAITS : [])].filter((b) => !b.legend && C.items[b.id]);
  const lures = D.LURES.filter((l) => C.items[l.id]);
  const items = [{ id: null }, ...baits.map((b) => ({ id: b.id, bait: b })), ...lures.map((l) => ({ id: l.id, lure: l }))];
  const leapOf = (s) => (A.leaps[s.id] && D.catchClassAllowed(s, 'keeper') ? A.leaps[s.id][0] : 0);
  const weight = (s, it) => {
    let v = W[s.rarity] ?? 10;
    if (it.bait?.bonus?.attract?.includes(s.id)) v *= 2.5;
    if (s.bait && s.bait === it.id) v *= 1.5;
    if (it.lure && ((it.lure.family && s.family === it.lure.family) || (it.lure.night && s.night) || it.lure.species?.includes(s.id))) v *= it.lure.attract;
    return v;
  };
  const inLake = (s, lake) => (s.zone === lake || (s.zones || []).includes(lake)) && s.rarity !== 'legendary' && !s.cove;
  const eval1 = (label, entries, item) => {
    const leaps = entries.map(([s, w]) => [s, w * leapOf(s)]).filter(([, v]) => v > 0);
    const tot = leaps.reduce((a, [, v]) => a + v, 0);
    const top = leaps.sort((a, b) => b[1] - a[1])[0];
    const share = tot ? top[1] / tot : 0;
    cells.push({ label, n: leaps.length, share, top: top?.[0].id ?? null, split: leaps.map(([s, v]) => `${s.id} ${Math.round((v / tot) * 100)}%`).join(', '),
      max: item ? R.maxShareItem : R.maxShare, ok: (leaps.length === 0 || leaps.length >= 2) && share <= (item ? R.maxShareItem : R.maxShare) });
  };
  for (const lake of LAKES) for (const hour of R.hours) for (const band of R.bands) for (const it of items) {
    const open = roster.filter((s) => inLake(s, lake) && !s.place && timeOk(s.time || 'any', hour) && overlaps(s.depth, band) && (!s.bait || s.bait === it.id));
    if (!open.length) continue;
    eval1(`${lake} · ${hour} · ${band.join('–')} · ${it.id ?? 'no item'}`, open.map((s) => [s, weight(s, it)]), it.id);
  }
  // kept places: the open pool at the kept species' depth band and hours, plus the kept species at × keptWeight
  for (const k of roster.filter((s) => s.place && s.rarity !== 'legendary')) {
    const lake = k.zone; if (!lake) continue;
    for (const hour of R.hours.filter((h) => timeOk(k.time || 'any', h))) for (const it of items) {
      const band = k.depth || [0, 1];
      const open = roster.filter((s) => inLake(s, lake) && !s.place && timeOk(s.time || 'any', hour) && overlaps(s.depth, band) && (!s.bait || s.bait === it.id));
      const entries = open.map((s) => [s, weight(s, it) * (s.spots?.[k.place] ?? 1)]);
      entries.push([k, weight(k, it) * R.keptWeight]);
      eval1(`${lake} · ${k.place} (${k.id}) · ${hour} · ${it.id ?? 'no item'}`, entries, it.id);
    }
  }
  return cells;
}
function leaps(all = false) {
  const cells = leapCells();
  const bad = cells.filter((c) => !c.ok);
  say(`== Leaps: ${Object.keys(A.leaps).length} species can leap; ${cells.length} cells; ${bad.length} fail the ambiguity rule (0 or ≥ 2 leapers; none > ${A.leapRule.maxShare * 100}% with no item, > ${A.leapRule.maxShareItem * 100}% with one)`);
  for (const lake of LAKES) say(`   ${LAKE_NAME[lake]}: ${SP.filter((s) => (s.zone === lake || (s.zones || []).includes(lake)) && A.leaps[s.id]).map((s) => `${s.name} ${A.leaps[s.id][0]}${A.leaps[s.id][1] > 1 ? ` ×${A.leaps[s.id][1]}` : ''}`).join(' · ')}`);
  const worst = [...cells].sort((a, b) => b.share / b.max - a.share / a.max).slice(0, all ? cells.length : 8);
  for (const c of worst) say(`   ${c.ok ? 'ok  ' : 'FAIL'} ${(c.share * 100).toFixed(0).padStart(3)}%  ${c.label}: ${c.split}`);
  say();
  return bad;
}

// ---- the Landing (tutorial)
function landing() {
  const q = SPB.quayling;
  say(`== The Landing: Quayling (tutorial) Small ${pct(chance(q, 'small', { tackle: T(0), lake: 'cove' }))}% · Keeper ${pct(chance(q, 'keeper', { tackle: T(0), lake: 'cove' }))}% on T0 with a struck strike; clean ${pct(chance(q, 'small', { tackle: T(0), lake: 'cove', strike: 'clean' }))}%, early or late ${pct(chance(q, 'small', { tackle: T(0), lake: 'cove', strike: 'early' }))}%; three losses in a row ≈ ${((1 - chance(q, 'small', { tackle: T(0), lake: 'cove' })) ** 3 * 100).toFixed(2)}%`);
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
    lakeAverages(); items(); legends(); favour(); outings(); landing(); leaps();
  }
  console.log(out.join('\n'));
}
