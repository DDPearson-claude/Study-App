// Unit tests for "a fish's size is told in pounds" (docs/v3/pounds/SPEC.md): the one formatter (data.fmtWeight) and its small
// helpers, the catch card's count (ui-v3 weightCount / weightSizer) over every species, the words in the v3 tables (no kg, no bare
// cm figure for a fish), the kept v1 arms (flag off, every string reads as v1 wrote it) and a static scan of src/ for a kg figure
// outside a `// v1` line.
//   node tools/tests/pounds.test.mjs   (or node tools/check.mjs)
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
import { fingerprint } from '../fingerprint.mjs';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const D = await import('../../src/data.js?pounds-p1');       // the preview build (v3 phase 1, raft)
globalThis.GW_V3_PHASE = 3;
const D3 = await import('../../src/data.js?pounds-p3');      // phase 3: the 48 challenges
globalThis.GW_V3_PHASE = 4; globalThis.GW_WALK = true;
const DA = await import('../../src/data.js?pounds-all');     // everything: all 53 species
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;
const V = await import('../../src/ui-v3.js');

const here = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const section = (s) => console.log(`- ${s}`);
const { fmtWeight, fmtWeightNear, weightTarget, weightOz, fishWeight, fmtCm, OZ_PER_KG, LB_PER_KG } = D;

/** A printed weight back to ounces ("¼ oz" 0.25 · "4 lb 6 oz" 70 · "7,055 lb" 112880); NaN when it is not one. */
const FRAC = { '¼': 0.25, '½': 0.5, '¾': 0.75 };
function toOz(t) {
  const m = /^(?:([\d,]+) lb)?(?: ?([¼½¾]|\d+) oz)?$/.exec(String(t));
  if (!m || (!m[1] && !m[2])) return NaN;
  return (m[1] ? Number(m[1].replace(/,/g, '')) * 16 : 0) + (m[2] ? (FRAC[m[2]] ?? Number(m[2])) : 0);
}
const SHAPE = /^([¼½¾]|\d{1,2}) oz$|^\d{1,2} lb \d{1,2} oz$|^\d{1,3}(,\d{3})* lb$/;

// =====================================================================================
section('fmtWeight: the table, word for word (SPEC §2.3)');
{
  const TABLE = [
    [0.0068, '¼ oz', 'a Cupbearer: under 1 oz, nearest quarter'], [0.0001, '¼ oz', 'the minimum is ¼ (never "0 oz")'], [0.0142, '½ oz', 'quarters'],
    [0.0248, '¾ oz', 'just under ⅞: still ¾'], [0.02481, '1 oz', '⅞ rounds up to four quarters: whole ounces'], [0.0283, '1 oz', '1 oz'],
    [0.1, '4 oz', 'whole ounces round half up'], [0.3118, '11 oz', 'the ruling\'s "11 oz"'], [0.4394, '15 oz', 'the last value that stays in ounces'],
    [0.4395, '1 lb 0 oz', '15.5 oz rounds to 16 and carries'], [0.45, '1 lb 0 oz', 'the lead\'s case: 0.45 kg'], [0.4536, '1 lb 0 oz', '1 lb'],
    [0.8930, '1 lb 15 oz', 'the last value before the carry'], [0.8931, '2 lb 0 oz', '31.5 oz carries to 2 lb (never "1 lb 16 oz")'],
    [1.9845, '4 lb 6 oz', 'the ruling\'s "4 lb 6 oz"'], [14.515, '32 lb 0 oz', '"0 oz" is written'], [45.0, '99 lb 3 oz', 'the top of the lb-oz band'],
    [45.35, '100 lb', '99 lb 15.7 oz → 1600 oz → whole pounds (never "100 lb 0 oz")'], [45.5, '100 lb', '100.3 lb'], [45.6, '101 lb', '100.5 lb rounds up'],
    [96.16, '212 lb', 'the ruling\'s "212 lb"'], [120, '265 lb', 'the Belled Matriarch'], [300, '661 lb', '300 kg'],
    [453.6, '1,000 lb', 'grouping from 1,000'], [3200, '7,055 lb', 'the Lantern-Swallower'],
  ];
  for (const [kg, want, why] of TABLE) eq(fmtWeight(kg), want, `fmtWeight(${kg}): ${why}`);
  for (const bad of [0, -2, NaN, undefined, null, '3', Infinity, {}]) eq(fmtWeight(bad), '—', `no weight (${String(bad)})`);
  eq(fmtWeight(1.9845, { nbsp: true }), '4 lb 6 oz', 'nbsp: the figure never breaks across a line');
  eq([fmtWeight(0.3118, { nbsp: true }), fmtWeight(96.16, { nbsp: true }), fmtWeight(0.0068, { nbsp: true })], ['11 oz', '212 lb', '¼ oz'], 'nbsp in every band');
  ok(Math.abs(OZ_PER_KG - 16 * LB_PER_KG) < 1e-6 && Math.abs(1 / LB_PER_KG - 0.45359237) < 1e-9, 'OZ_PER_KG = 16 × LB_PER_KG; 1 lb = 0.45359237 kg');
}

section('fmtWeight: one rounding, then the band (never "16 oz", "1 lb 16 oz" or "100 lb 0 oz"); the figure never falls');
{
  let prev = 0, n = 0, bad = [];
  for (let kg = 0.0001; kg <= 500; kg *= 1.001) {
    const t = fmtWeight(kg), v = toOz(t), m = /^(\d+) lb (\d+) oz$/.exec(t);
    n++;
    if (!SHAPE.test(t) || !(v >= prev)) bad.push([kg, t]);
    if (m && (+m[1] < 1 || +m[1] > 99 || +m[2] > 15)) bad.push([kg, t]);
    if (/^(1[6-9]|[2-9]\d) oz$/.test(t) || /^0 /.test(t)) bad.push([kg, t]);
    if (Math.abs(v - kg * OZ_PER_KG) > Math.max(0.5, kg * OZ_PER_KG * 0.006) + 1e-9 && kg * OZ_PER_KG >= 0.125) bad.push([kg, t, 'far from the truth']);
    prev = v;
  }
  ok(bad.length === 0 && n > 15000, `${n} weights from 0.1 g to 500 kg: every figure in the format, within half an ounce (half a pound from 100 lb), never falling`, bad.slice(0, 4));
  // each band's edges by ounces
  const oz = (x) => x / OZ_PER_KG;
  eq([fmtWeight(oz(0.124)), fmtWeight(oz(0.126)), fmtWeight(oz(0.874)), fmtWeight(oz(0.876)), fmtWeight(oz(1.49)), fmtWeight(oz(1.51))], ['¼ oz', '¼ oz', '¾ oz', '1 oz', '1 oz', '2 oz'], 'quarters under an ounce, whole ounces from ⅞');
  eq([fmtWeight(oz(15.49)), fmtWeight(oz(15.51)), fmtWeight(oz(1599.49)), fmtWeight(oz(1599.51)), fmtWeight(oz(1607.9)), fmtWeight(oz(1608.1))], ['15 oz', '1 lb 0 oz', '99 lb 15 oz', '100 lb', '100 lb', '101 lb'], 'the carries at 1 lb and 100 lb');
}

section('weightOz and fishWeight: the weight the player reads comes from the length');
{
  eq([weightOz(0.45), weightOz(1.9845), weightOz(0), weightOz(-1), weightOz(NaN), weightOz('2'), weightOz(Infinity), weightOz(null)], [16, 70, 0, 0, 0, 0, 0, 0], 'weightOz: the ounces the card shows; 0 for no weight (as fmtWeight says "—")');
  // it is the printed figure in every band: quarters under an ounce, whole ounces to 100 lb, whole pounds beyond
  const ozk = (x) => x / OZ_PER_KG;
  eq([weightOz(ozk(0.05)), weightOz(ozk(0.3)), weightOz(ozk(0.6)), weightOz(ozk(0.874)), weightOz(ozk(0.876))], [0.25, 0.25, 0.5, 0.75, 1], 'under an ounce: quarters, never below ¼');
  eq([weightOz(ozk(1599.49)), weightOz(ozk(1599.51)), weightOz(ozk(1607.9)), weightOz(ozk(1608.1)), weightOz(3200)], [1599, 1600, 1600, 1616, 112880], 'from 100 lb: whole pounds (a 100.4 lb fish reads "100 lb" and is 1600 oz, not 1608)');
  { let off = [], n = 0; for (let kg = 0.0001; kg <= 500; kg *= 1.001) { n++; if (toOz(fmtWeight(kg)) !== weightOz(kg)) off.push([kg, fmtWeight(kg), weightOz(kg)]); }
    ok(!off.length && n > 15000, `weightOz(kg) is exactly the figure fmtWeight(kg) prints, at ${n} weights`, off.slice(0, 3)); }
  ok(!(weightOz(ozk(1767.9)) > 110 * 16) && weightOz(ozk(1768.1)) > 110 * 16, 'a fish reading "110 lb" does not pass "over 110 lb"; one reading "111 lb" does');
  const carp = D.SPECIES_BY_ID.weeping_carp, bm = D.SPECIES_BY_ID.belled_matriarch, ls = D.SPECIES_BY_ID.lantern_swallower;
  eq(fishWeight(carp, { length: 61, weight: 99 }), 3.63, 'the length wins over the stored kg (k·L³ = 0.016 · 61³ g)');
  eq(fishWeight(carp, { weight: 2.5 }), 2.5, 'no length: the stored kg');
  eq([fishWeight(carp, {}), fishWeight(carp, null), fishWeight(null, { length: 50 }), fishWeight(null, { length: 50, weight: 1.2 })], [0, 0, 0, 1.2], 'nothing known: 0; no species: the stored kg');
  eq([fmtWeight(fishWeight(bm, { length: 260 })), fmtWeight(fishWeight(ls, { length: 850 }))], ['265 lb', '7,055 lb'], 'legends use their own k');
  eq(fishWeight(D.SPECIES_BY_ID.dusk_minnow, { length: 22 }), 0.138, 'under 1 kg: grams (as the Fish rounds it)');
  // every v3 comparison of two sizes uses the ounces the card shows
  const a = fishWeight(carp, { length: 61 }), b = fishWeight(carp, { length: 61.1 });
  ok(weightOz(a) === 128 && weightOz(b) >= weightOz(a), 'a 61 cm carp reads 8 lb 0 oz (128 oz)');
}

section('fmtWeightNear: the got-away steps (never an exact figure)');
{
  eq([0.17, 0.44, 1.36, 4.3, 4.45, 9.1, 44, 44.6, 125, 3200, 0, -1, NaN].map((kg) => fmtWeightNear(kg)),
    ['6 oz', '1 lb', '3 lb', '9 lb', '10 lb', '20 lb', '95 lb', '100 lb', '275 lb', '7,100 lb', '', '', ''], 'whole oz under 1 lb · 1 lb · 5 lb · 25 lb · 100 lb');
  eq(JSON.stringify(D.AUTOFISH.gotAway.roundLb), '[[10,1],[100,5],[1000,25],[null,100]]', 'the steps live in AUTOFISH.gotAway.roundLb');
  eq(fmtWeightNear(4.3, D.AUTOFISH.gotAway.roundLb), '9 lb', 'read from the data');
  eq(D.AUTOFISH.gotAway.word, 'near', 'the word stays "near"');
  let bad = [];
  for (let kg = 0.01; kg < 4000; kg *= 1.01) { const t = fmtWeightNear(kg); if (!/^([¼½¾]|\d{1,2}) oz$|^[\d,]+ lb$/.test(t) || /^(1[6-9]|[2-9]\d) oz$/.test(t)) bad.push([kg, t]); }
  ok(!bad.length, 'every near figure is ounces under a pound (as fmtWeight) or whole pounds', bad.slice(0, 3));
}

section('weightTarget: round targets for "over {w}" in the card\'s own figure, never above the cap');
{
  eq(weightTarget(0.178, 0.201), { oz: 6, kg: 6 / OZ_PER_KG, text: '6 oz' }, 'under 1 lb: whole ounces');
  eq([weightTarget(0.72, 0.81).text, weightTarget(0.79, 0.91).text, weightTarget(3.88, 4.63).text, weightTarget(0.508, 0.567).text], ['1 lb 8 oz', '1 lb 8 oz', '9 lb 0 oz', '1 lb 0 oz'], 'half pounds from 1 to 3 lb, whole pounds beyond, worded as the card words a weight');
  eq(weightTarget(0.72, 0.66).text, '1 lb 0 oz', 'a target that rounds above its cap steps down');
  eq([weightTarget(50, Infinity).text, weightTarget(50, Infinity).oz], ['110 lb', 1760], 'from 100 lb a target is whole pounds, as the card');
  eq([weightTarget(0.72, 0.81).oz, weightTarget(3.88, 4.63).oz], [24, 144], 'the ounces the check uses');
  let bad = [];
  for (let kg = 0.03; kg < 60; kg *= 1.013) for (const capK of [1.02, 1.2, 2, Infinity]) {
    const T = weightTarget(kg, kg * capK);
    if (!SHAPE.test(T.text) || /[¼½¾]/.test(T.text) || T.text !== fmtWeight(T.kg) || weightOz(T.kg) !== T.oz || toOz(T.text) !== T.oz || /^(0|1[6-9]|[2-9]\d) oz$/.test(T.text) || T.oz > kg * capK * OZ_PER_KG + 1e-9 || !(T.oz >= 1) || Math.abs(T.kg * OZ_PER_KG - T.oz) > 1e-9) bad.push([kg, capK, T]);
  }
  ok(!bad.length, 'every target reads as fmtWeight words it (no half-pound glyph, never "16 oz" or "0 oz"), its words and its ounces are the same figure, and it never passes its cap', bad.slice(0, 3));
}

section('fmtCm: the card\'s length line, cm always');
eq([8.4, 19.94, 33.2, 112.4, 850, 0, -3, NaN, '56'].map((x) => fmtCm(x)), ['8.4 cm', '19.9 cm', '33 cm', '112 cm', '850 cm', '—', '—', '—', '56 cm'], 'one decimal under 20 cm, no mm and no m');

// =====================================================================================
section('the card\'s count: every species, every class top (weightCount lands on fmtWeight; the sizer holds the widest figure)');
{
  const ZS = [-2, -0.25, 0.4, 1.04, 1.88, 2.65, 3.6];
  const cases = [];
  for (const sp of DA.SPECIES_V3) {
    const zones = typeof sp.size.L50 === 'number' ? [null] : Object.keys(sp.size.L50);
    for (const zone of zones) {
      if (sp.rarity === 'legendary') { for (const g of [1, 1.2, 1.5]) cases.push([sp, sp.size.W50 * g, `${sp.id} ×${g}`]); continue; }
      for (const z of ZS) cases.push([sp, fishWeight(sp, { length: Math.round(DA.sizeLength(sp, z, zone) * 10) / 10 }), `${sp.id}${zone ? '@' + zone : ''} z ${z}`]);
    }
  }
  ok(DA.SPECIES_V3.length === 53 && cases.length > 350, `${cases.length} fish across ${DA.SPECIES_V3.length} species`);
  const bad = [];
  let longHero = 0;
  for (const [, W, tag] of cases) {
    const fin = fmtWeight(W), sizer = V.weightSizer(W), big = weightOz(W) >= 1600, tiny = weightOz(W) < 16;
    if (fin.length >= 9) longHero++;
    let prev = -1;
    for (let i = 0; i <= 240; i++) {
      const k = i / 240, e = 1 - (1 - k) ** 3, t = V.weightCount(W * e ** 3, W), v = t === '0 oz' || t === '0 lb' ? 0 : toOz(t);
      if (t.length > sizer.length) bad.push([tag, 'wider than the sizer', t, sizer]);
      if (!(v >= prev) || v > toOz(fin) + 1e-9) bad.push([tag, 'falls or passes the final', t, fin]);
      if (big && !/^[\d,]+ lb$/.test(t)) bad.push([tag, 'a giant counts in whole pounds only', t]);
      if (tiny && /lb/.test(t)) bad.push([tag, 'a final under 1 lb never shows lb', t]);
      if (!big && t !== '0 oz' && !SHAPE.test(t)) bad.push([tag, 'not a weight', t]);
      if (i === 240 && t !== fin) bad.push([tag, 'does not land on the final', t, fin]);
      if (i === 0 && t !== (big ? '0 lb' : '0 oz')) bad.push([tag, 'does not start from nothing', t]);
      prev = v;
      if (bad.length > 8) break;
    }
    if (bad.length > 8) break;
  }
  ok(!bad.length, 'each count starts at 0, never falls, never passes the final, fits the sizer and lands on fmtWeight(W)', bad.slice(0, 4));
  ok(longHero > 100, `the long hand (a pounds-and-ounces figure, ≥ 9 characters) is in use for ${longHero} of them`);
  // the sizer rule
  const carp = D.SPECIES_BY_ID.weeping_carp, W = fishWeight(carp, { length: Math.round(D.sizeLength(carp, 1.4) * 10) / 10 });
  const P = Math.floor(weightOz(W) / 16);
  ok(P >= 10 && V.weightSizer(W).length >= `${P - 1} lb 15 oz`.length, `a ${fmtWeight(W)} carp: the sizer is as wide as "${P - 1} lb 15 oz"`, V.weightSizer(W));
  eq([V.weightSizer(5.5), V.weightSizer(0.3), V.weightSizer(120), V.weightSizer(0.6), V.weightSizer(4.6), V.weightSizer(0)], ['11 lb 15 oz', '11 oz', '265 lb', '1 lb 5 oz', '10 lb 2 oz', '—'],
    '"12 lb 2 oz" is sized by "11 lb 15 oz"; an ounce, a giant, a 1 lb figure and "10 lb 2 oz" (as wide as "9 lb 15 oz") by themselves');
  // the figures that size the hero's box: the final first, the wide ones the count passes with it
  eq([V.weightSizers(5.5), V.weightSizers(0.6), V.weightSizers(120), V.weightSizers(0)], [['12 lb 2 oz', '11 lb 15 oz'], ['1 lb 5 oz'], ['265 lb'], ['—']], 'pounds and ounces: the final and "(P − 1) lb 15 oz"; a 1 lb figure and a giant by themselves');
  eq([V.weightSizers(0.085), V.weightSizers(0.3), V.weightSizers(0.0142), V.weightSizers(0.0068)], [['3 oz', '¾ oz', '½ oz', '¼ oz'], ['11 oz', '¾ oz', '½ oz', '¼ oz'], ['½ oz', '¼ oz'], ['¼ oz']], 'under a pound: the final and the quarter figures it passes (in the hand "¾ oz" is wider than "3 oz")');
  { const bad2 = [];
    for (const [, W, tag] of cases) {
      const sz = V.weightSizers(W), fin = fmtWeight(W);
      if (sz[0] !== fin || new Set(sz).size !== sz.length || !sz.includes(V.weightSizer(W))) bad2.push([tag, sz]);
      for (let i = 0; i <= 240; i++) { const k = i / 240, e = 1 - (1 - k) ** 3, t = V.weightCount(W * e ** 3, W); if (weightOz(W) < 16 && /[¼½¾]/.test(t) && !sz.includes(t)) bad2.push([tag, 'a passing quarter figure is not among the sizers', t, sz]); if (t.length > Math.max(...sz.map((x) => x.length))) bad2.push([tag, 'longer than every sizer', t, sz]); }
      if (bad2.length > 4) break;
    }
    ok(!bad2.length, 'every fish: the sizers open with the final and hold the longest figure; under a pound, every quarter figure the count passes too (a pounds-and-ounces final is wider than any of them)', bad2.slice(0, 3)); }
  // the unit letters are set apart (the hand's "lb" reads "eb"); the text itself is unchanged
  eq([V.weightHtml('4 lb 6 oz'), V.weightHtml('¾ oz'), V.weightHtml('7,055 lb'), V.weightHtml('—'), V.weightHtml('0 oz')],
    ['4 <i class="gw-u">lb</i> 6 <i class="gw-u">oz</i>', '¾ <i class="gw-u">oz</i>', '7,055 <i class="gw-u">lb</i>', '—', '0 <i class="gw-u">oz</i>'], 'weightHtml wraps each unit, and only the units');
  ok(cases.every(([, W]) => V.weightHtml(fmtWeight(W)).replace(/<[^>]+>/g, '') === fmtWeight(W)), 'stripped of its tags, the markup is the figure fmtWeight prints');
  eq(V.weightHtml('<b>4 lb</b> & "oz"'), '&lt;b&gt;4 <i class="gw-u">lb</i>&lt;/b&gt; &amp; &quot;<i class="gw-u">oz</i>&quot;', 'weightHtml escapes what it is given');
  eq([V.weightCount(0, 2), V.weightCount(0.004, 2), V.weightCount(0.2, 2), V.weightCount(1.2, 2), V.weightCount(2, 2), V.weightCount(3, 2)], ['0 oz', '¼ oz', '7 oz', '2 lb 10 oz', '4 lb 7 oz', '4 lb 7 oz'], 'ounces up to a pound, then pounds and ounces');
  eq([V.weightCount(0, 120), V.weightCount(0.4, 120), V.weightCount(60, 120), V.weightCount(119.9, 120), V.weightCount(120, 120)], ['0 lb', '0 lb', '132 lb', '264 lb', '265 lb'], 'a giant counts in whole pounds from "0 lb"');
  eq([V.weightCount(600, 3200), V.weightCount(3200, 3200)], ['1,322 lb', '7,055 lb'], 'grouped from 1,000');
  eq([V.weightCount(1, 0), V.weightCount(NaN, 2)], ['—', '0 oz'], 'no weight: a dash; a bad running value counts as nothing');
  ok(V.fmtWeight === D.fmtWeight || V.fmtWeight(1.9845) === '4 lb 6 oz', 'ui-v3 re-exports the one formatter');
}

// =====================================================================================
section('the weights ring true (SPEC §6): the retune and the anchors');
{
  const at = (id, cm, dd = DA) => fmtWeight(dd.sizeWeight(dd.SPECIES_V3.find((s) => s.id === id), cm));
  eq([at('weeping_carp', 61), at('reedjaw_pike', 112), at('gloam_eel', 90)], ['8 lb 0 oz', '23 lb 4 oz', '3 lb 9 oz'], 'a 61 cm carp, a 112 cm pike, a 90 cm eel');
  const K = DA.BALANCE_V3.size.k;
  eq([K.minnow, K.eel, K.angler, K.ghost, K.trout, K.gar, K.greateel, K.swampeel], [0.013, 0.0022, 0.017, 0.006, 0.011, 0.003, 0.004, 0.0016], 'the retuned and the new body constants');
  eq([K.perch, K.crayfish, K.carp, K.koi, K.pike, K.ray, K.puffer, K.jelly, K.sturgeon], [0.013, 0.03, 0.016, 0.015, 0.0075, 0.012, 0.03, 0.02, 0.006], 'the kept ones');
  const body = (id) => DA.SPECIES_V3.find((s) => s.id === id).size.body;
  eq([body('pilgrim_salmon'), body('rainglass_darter'), body('vesper_gar'), body('gilt_eyed_eel'), body('threadling_eel')], ['trout', 'trout', 'gar', 'greateel', 'swampeel'], 'five fish on their own body keys');
  for (const s of DA.SPECIES_V3) if (s.rarity !== 'legendary') ok(s.size.k === K[s.size.body], `${s.id}: k is its body's (${s.size.body})`);
  // at L50, before → after (SPEC §6.2)
  const l50 = (id, zone = null) => { const s = DA.SPECIES_V3.find((x) => x.id === id); return fmtWeight(DA.sizeWeight(s, DA.sizeL50(s, zone))); };   // the model itself (a Fish's own figure is rounded to 10 g first)
  eq([l50('dusk_minnow'), l50('gloam_eel'), l50('mildew_angler'), l50('lampwarden_angler'), l50('pallid_wraithfin'), l50('gilt_eyed_eel'), l50('vesper_gar'), l50('threadling_eel')],
    ['5 oz', '1 lb 13 oz', '8 lb 2 oz', '14 lb 0 oz', '1 lb 5 oz', '19 lb 13 oz', '2 lb 4 oz', '2 lb 4 oz'], 'a typical fish of each retuned body (the Threadling keeps its weight)');
  eq([l50('pilgrim_salmon', 'sporewood'), l50('pilgrim_salmon', 'glasswater'), l50('pilgrim_salmon', 'paleabyss')], ['7 lb 0 oz', '10 lb 10 oz', '16 lb 0 oz'], 'the Pilgrim Salmon, lake by lake');
  eq(['belled_matriarch', 'drifting_grove', 'glass_sovereign', 'lantern_swallower'].map((id) => fmtWeight(DA.SPECIES_V3.find((s) => s.id === id).size.W50)), ['265 lb', '331 lb', '463 lb', '7,055 lb'], 'the giants, in the hundreds of pounds (and one in the thousands)');
  eq(DA.SPECIES_V3.find((s) => s.id === 'belled_matriarch').weight, [120, 180], 'a legend\'s derived range follows its authored weight');
  // carp heavy, eels light: at one length a carp outweighs a pike outweighs an eel
  const w = (id) => DA.sizeWeight(DA.SPECIES_V3.find((s) => s.id === id), 80);
  ok(w('weeping_carp') > w('reedjaw_pike') && w('reedjaw_pike') > w('gloam_eel') && w('gloam_eel') > w('threadling_eel'), 'at 80 cm: carp > pike > eel > swamp eel');
}

// =====================================================================================
section('the Journal\'s range: from the smallest to a top Trophy; the ceiling is what it is "said to reach"');
{
  const span = (id, dd = DA) => { const w = dd.weightSpan(dd.SPECIES_V3.find((s) => s.id === id)); return [fmtWeight(w.min), fmtWeight(w.top), fmtWeight(w.reach)]; };
  eq(span('mossback_perch'), ['10 oz', '5 lb 15 oz', '17 lb 11 oz'], 'a perch: 10 oz – 5 lb 15 oz, said to reach 17 lb 11 oz (not "10 oz – 17 lb 11 oz")');
  eq(span('dusk_minnow'), ['2 oz', '1 lb 4 oz', '3 lb 10 oz'], 'a minnow');
  eq(span('gloam_eel'), ['13 oz', '8 lb 1 oz', '24 lb 0 oz'], 'an eel');
  eq(span('lampwarden_angler').slice(1), [fmtWeight(DA.SPECIES_V3.find((s) => s.id === 'lampwarden_angler').weight[1]), fmtWeight(DA.SPECIES_V3.find((s) => s.id === 'lampwarden_angler').weight[1])], 'a species capped at a Trophy: its ceiling is its top (no second line)');
  eq(span('belled_matriarch'), ['265 lb', '397 lb', '397 lb'], 'a legend: first landing to fully grown');
  const bad = [];
  for (const sp of DA.SPECIES_V3) {
    const w = DA.weightSpan(sp);
    if (!w || w.min !== sp.weight[0] || w.reach !== sp.weight[1] || !(w.min < w.top) || !(w.top <= w.reach)) { bad.push([sp.id, w]); continue; }
    if (sp.rarity !== 'legendary' && DA.maxZFor(sp) > DA.BALANCE_V3.size.elsewhereMaxZ) {
      const L50 = typeof sp.size.L50 === 'number' ? sp.size.L50 : Math.min(...Object.values(sp.size.L50));
      const want = DA.sizeWeight(sp, L50 * Math.exp(sp.size.sigma * 2.64 + DA.BALANCE_V3.size.tail * (2.64 - DA.BALANCE_V3.size.tailFrom) ** 2));
      if (Math.abs(w.top - want) > 1e-9 || !(w.top < w.reach)) bad.push([sp.id, 'top is not the top Trophy', w, want]);
    }
  }
  ok(!bad.length, 'every species: min and reach are the derived pair, the top is a top Trophy (z 2.64) of its smallest lake, under the ceiling', bad.slice(0, 3));
  eq([DA.weightSpan(null), DA.weightSpan({}), DA.weightSpan({ weight: [1, 2] })], [null, null, { min: 1, top: 2, reach: 2 }], 'no weights: null; a species with no size model (v1): its own pair');
  const scr = readFileSync(resolve(here, '../../src/ui-screens.js'), 'utf8').split('\n');
  const jr = scr.find((l) => /const jRange = V3\(\)/.test(l)) || '', jv1 = scr[scr.indexOf(jr) + 1] || '';
  ok(/gw-facts-range/.test(jr) && /fmtWeight\(span\.min\)/.test(jr) && /fmtWeight\(span\.top\)/.test(jr) && /gw-facts-sub/.test(jr) && !/sp\.weight\[1\]/.test(jr), 'the Journal words the range from weightSpan (min – top) and the ceiling under it');
  ok(/`\$\{sp\.weight\[0\]\}–\$\{sp\.weight\[1\]\} kg`/.test(jv1) && /\/\/ v1\b/.test(jv1), 'its v1 arm is as v1 wrote it');
}

// =====================================================================================
section('v3 words: a fish\'s size is never told in kg (or a bare cm figure) in any v3 table');
{
  const KG = /\bkg\b|\{kg\}|\{cm\} cm|\{len\}/;
  const strings = (v, path, out = []) => {
    if (typeof v === 'string') out.push([path, v]);
    else if (v && typeof v === 'object') for (const [k, c] of Object.entries(v)) strings(c, `${path}.${k}`, out);
    return out;
  };
  for (const [tag, dd] of [['P1', D], ['P3', D3], ['P4 + §24', DA]]) {
    const all = [...strings(dd.TEXT_V3, 'TEXT_V3'), ...strings(dd.AUTOFISH.text, 'AUTOFISH.text'), ...strings(dd.FIRST_EVENING.text, 'FIRST_EVENING.text'), ...strings(dd.DESC_V3, 'DESC_V3'),
      ...strings(dd.TIPS.map((t) => t.text), 'TIPS'), ...strings(dd.MERCHANT_LINES, 'MERCHANT_LINES'), ...strings(dd.BOUNTIES.map((b) => b.text), 'BOUNTIES'),
      ...strings(dd.CHALLENGES.map((c) => [c.name, c.desc]), 'CHALLENGES'), ...strings(dd.TEXT.v3, 'TEXT.v3')];
    const hits = all.filter(([, s]) => KG.test(s));
    ok(all.length > 300 && hits.length === 0, `${tag}: ${all.length} strings, none with kg, {kg}, "{cm} cm" or {len}`, hits.slice(0, 4));
  }
  eq(D.TEXT_V3.newBest, 'New best: {w} (was {was})', 'the record line takes a weight');
  eq([D.AUTOFISH.text.size, D.AUTOFISH.text.log.marked], ['{a} {class}, near {size}.', '{name}, {class}, near {size}'], 'the got-away words take a size (a weight)');
  eq(D.BOUNTY_BY_ID.heavy.text, 'Land a {species} over {w}.', 'the heavy bounty asks in pounds');
  const hc1 = D.CHALLENGE_BY_ID.heavy_catch, hc3 = D3.CHALLENGE_BY_ID.heavy_catch;
  eq([hc1.desc, hc1.params.lb, hc1.params.excludeLegendary, 'kg' in hc1.params], ['Land a non-legendary fish over 18 lb 0 oz.', 18, true, false], 'the Heavyweight, phases 1–2: 8 kg → 18 lb, in the card\'s own figure');
  eq([hc3.desc, hc3.params.lb, hc3.params.excludeLegendary, 'kg' in hc3.params], ['Land a non-legendary fish over 33 lb 0 oz.', 33, true, false], 'the Heavyweight from phase 3: 15 kg → 33 lb');
  eq([hc1.desc.endsWith(`over ${fmtWeight(18 / LB_PER_KG)}.`), hc3.desc.endsWith(`over ${fmtWeight(33 / LB_PER_KG)}.`)], [true, true], 'each target is worded by fmtWeight ("18 lb 0 oz", "33 lb 0 oz")');
  eq(D.TEXT_V3.saidToReach, 'said to reach {w}', 'the Journal\'s ceiling line takes a weight');
  eq([Math.round(8 * 2.20462), Math.round(15 * 2.20462)], [18, 33], 'by lb = round(kg × 2.20462)');
  eq(D.BALANCE_V3.records.elderLog.slice(0, 3), ['name', 'weight', 'cm'], 'an Elder Log line leads with the weight, then the length');
}

// =====================================================================================
section('v1 parity: flag off, every table and every word is as v1 wrote it');
{
  eq(dataV1.V3_ENABLED, false, 'plain data.js is the flag-off build');
  const REF = JSON.parse(readFileSync(resolve(here, 'v1-exports.json'), 'utf8'));
  const names = ['TEXT', 'BOUNTIES', 'CHALLENGES', 'SPECIES', 'BALANCE', 'TIPS', 'MERCHANT_LINES', 'SPECIES_BY_ID', 'CHALLENGE_BY_ID'];
  const now = fingerprint(dataV1, names);
  for (const n of names) ok(REF.names.includes(n) && now[n] === REF.v1[n], `flag off: export ${n} hashes as the v1 reference (${REF.from})`);
  eq(dataV1.TEXT.records.biggest, 'Biggest catch: {name}, {kg} kg', 'v1 summary words');
  eq(dataV1.BOUNTY_BY_ID.heavy.text, 'Land a {species} over {kg} kg.', 'v1 heavy bounty words');
  const hc = dataV1.CHALLENGE_BY_ID.heavy_catch;
  eq([hc.desc, hc.params], ['Land a non-legendary fish over 8 kg.', { kg: 8, excludeLegendary: true }], 'v1 Heavyweight');
  ok(!('v3' in dataV1.TEXT) && dataV1.SPECIES.every((s) => !('size' in s)), 'no v3 text and no size model on a v1 species');
  // the helpers are plain exports outside the fingerprint's fixed name list, and pure (the same from either build)
  for (const n of ['fmtWeight', 'weightOz', 'fishWeight', 'fmtWeightNear', 'weightTarget', 'fmtCm', 'LB_PER_KG', 'OZ_PER_KG']) ok(n in dataV1 && !REF.names.includes(n), `${n}: exported, outside the v1 fingerprint`);
  eq([dataV1.fmtWeight(1.9845), dataV1.fmtWeightNear(4.3), dataV1.fmtCm(56)], ['4 lb 6 oz', '9 lb', '56 cm'], 'the same helpers in the flag-off build (nothing in v1 calls them)');
}

// =====================================================================================
section('static: no kg figure in src/ outside a line marked `// v1`');
{
  const srcDir = resolve(here, '../../src');
  const files = readdirSync(srcDir).filter((f) => f.endsWith('.js'));
  // a string that ends a figure in kg (' kg', " kg", ` kg`, " kg."), a {kg} slot, a bare 'kg' field word, or a call of fmtKg
  const KG_SRC = / kg['"`.]|\{kg\}|['"`]kg['"`]|\bfmtKg\(/;
  const hits = [], marked = [];
  for (const f of files) {
    readFileSync(resolve(srcDir, f), 'utf8').split('\n').forEach((line, i) => {
      const v1 = /\/\/ v1\b/.test(line);
      const code = line.replace(/\/\/.*$/, '');
      if (/^\s*(\*|\/\*)/.test(code) || !KG_SRC.test(code)) return;
      (v1 ? marked : hits).push(`${f}:${i + 1}`);
    });
  }
  ok(hits.length === 0, 'every line that prints or asks for kg is a kept v1 arm (marked `// v1`)', hits);
  ok(marked.length >= 12, `${marked.length} kept v1 lines carry the marker`, marked);
  for (const f of ['ui-screens.js', 'progression-market.js', 'progression.js', 'ui.js', 'core.js', 'data.js']) ok(marked.some((m) => m.startsWith(`${f}:`)), `${f} keeps its v1 kg arm`);
  // the v3 screens read a size through the one formatter: no fmtLength on a v3 line, no weight row on the v3 card
  const scr = readFileSync(resolve(srcDir, 'ui-screens.js'), 'utf8').split('\n');
  const fl = scr.map((l, i) => [l, i + 1]).filter(([l]) => /\bfmtLength\(/.test(l.replace(/\/\/.*$/, '')));
  ok(fl.every(([l]) => /\/\/ v1\b/.test(l)) && fl.length <= 1, 'ui-screens.js calls fmtLength only on its kept v1 arm (the Journal, flag off)', fl.map(([, n]) => n));
  const statsV3 = scr.find((l) => /const stats = N\.v3 \?/.test(l)) || '';
  ok(/gw-cc-len">\$\{esc\(N\.cm\)\}/.test(statsV3) && !/weight/.test(statsV3) && !/fmtKg/.test(statsV3), 'the v3 card\'s list: the length line in cm, no weight row (the hero is the weight)');
  const hero = scr.find((l) => /const heroHtml = /.test(l)) || '';
  ok(/gw-cc-hero-sizer/.test(hero) && /weightSizers\(N\.W\)\.map\(\(t\) => `<i>\$\{weightHtml\(t\)\}<\/i>`\)/.test(hero) && /gw-cc-hero-n">\$\{weightHtml\(N\.wt\)\}/.test(hero) && /aria-label="\$\{esc\(N\.wt\)\}"/.test(hero) && /gw-cc-hero--long/.test(hero) && !/<span/.test(hero), 'the hero: a sizer of stacked figures, the live figure with its units set apart, the plain figure as its label, the long hand (no <span>: the stamp row styles every span as a stamp)');
  ok(scr.some((l) => /write\(k >= 1 \? N\.wt : say\(cm\)\)/.test(l)) && scr.some((l) => /hero\.innerHTML = weightHtml\(t\)/.test(l)) && scr.some((l) => /weightCount\(N\.W \* \(cm \/ L\) \*\* 3, N\.W\)/.test(l)) && !scr.some((l) => /hero\.textContent = /.test(l)), 'the count shows the weight of the running length (its units set apart) and lands on the final');
  ok(scr.some((l) => /gw-cc-note/.test(l) && /N\.v3 \? weightHtml\(N\.wt\) : esc\(N\.len\)/.test(l)) && scr.some((l) => /gw-room-name/.test(l) && /weightHtml\(lbs\(fsp, f\)\)/.test(l)), 'the handwritten note and a full card\'s creel rows set the units apart too');
  const css = readFileSync(resolve(srcDir, 'ui.css'), 'utf8');
  ok(/\.gw-cc-hero > \.gw-cc-hero-sizer \{ display: grid; visibility: hidden; \}/.test(css) && /\.gw-cc-hero-sizer > i \{ grid-area: 1 \/ 1;/.test(css) && /\.gw-u \{ font: italic 400 \.8em\/1 var\(--f-body\);/.test(css) && /\.gw-cc-hero \.gw-u \{ font-size: \.56em; margin-left: -\.3em; \}/.test(css) && /\.gw-cc-hero--long > i \{ font-size: \.78em; \}/.test(css) && /\.gw-cc-hero > i \{[^}]*font-style: normal;/.test(css) && /\.gw-cc-hero-n \{ position: absolute; left: 0; top: 0; \}/.test(css) && !/\.gw-cc-v3 \.gw-cc-stats \.gw-cc-lenk[^{]*\{ display: none/.test(css), 'ui.css: the stacked sizer gives the box, the live figure lies over it out of the flow, the units in the body face, the long hand, and the v3 length line is shown');
  // the play's HUD never formats a weight (a weight is k·L³: it would name the body before the reveal)
  const hud = readFileSync(resolve(srcDir, 'ui-hud-v3.js'), 'utf8');
  ok(!/fmtWeight|fishWeight|nearWeight|weightCount|fmtWeightNear/.test(hud), 'the in-play HUD never reads a weight');
  // nothing that ships names a real fish: the cousins of the audit live in docs only
  const COUSINS = /\b(roach|wels|chinook|longnose|conger|european (eel|perch)|northern pike|kaluga|sixgill|ratfish|grayling|flathead|zander|mussum)\b/i;
  const named = files.filter((f) => COUSINS.test(readFileSync(resolve(srcDir, f), 'utf8')));
  ok(named.length === 0, 'no real cousin is named in src/', named);
  ok(Object.keys(DA.BALANCE_V3.size.k).every((b) => !COUSINS.test(b)), 'no body key is a real species\' own name (a key is a plain family or build word)', Object.keys(DA.BALANCE_V3.size.k));
}

console.log(`\npounds: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
