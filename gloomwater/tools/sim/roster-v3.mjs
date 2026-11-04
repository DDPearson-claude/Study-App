#!/usr/bin/env node
// tools/sim/roster-v3.mjs — the v3 size table and its checks (BRIEF-v3 §6.1–§6.5; T2/T5 input). Port of
// tools/out/pivot/roster-v3.mjs that reads SPECIES_V3 and BALANCE_V3.size from src/data.js:
//   L = L50 · e^(σz + tail · max(0, z − tailFrom)²) · W = k · L³ (k per body shape) · classes cut on z
//   checks: each legend's length ≥ 1.4 × the longest non-legend "said to reach" in its lake; ceiling ≤ 2.8 × median;
//   ≥ 2 giant-tail species (σ ≥ 0.16) per lake; the Elder (z 3.0) / Keeper (z 0.4) length ratio
//   plus the value normaliser at the assumed μ mix, the resident z distribution and the class odds per μ.
// Run from gloomwater/:  node tools/sim/roster-v3.mjs [--rows]     (--rows prints the brief §6.5 size columns)
import * as D from '../../src/data.js';

const SZ = D.BALANCE_V3.size;
const rows = process.argv.includes('--rows');
const LAKES = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
const fmtL = (cm) => (cm < 20 ? `${Math.round(cm * 10)} mm` : `${Math.round(cm)}`);
const fmtW = (g) => (g < 1000 ? `${Math.round(g)} g` : g < 100000 ? `${(g / 1000).toFixed(1)} kg` : `${Math.round(g / 1000)} kg`);
const maxCeil = {}, giant = {}, ratios = [];
const lines = [];
D.SPECIES_V3.forEach((sp, i) => {
  if (sp.rarity === 'legendary') return;
  const zone = sp.zones?.[0] ?? sp.zone, L = (z) => D.sizeLength(sp, z, zone), W = (cm) => D.sizeWeight(sp, cm) * 1000;
  const L50 = D.sizeL50(sp, zone), s = sp.size.sigma;
  const tr = L(1.88), el = L(2.65), ce = L(SZ.reachZ);   // the brief's columns use the uncapped ceiling (z 3.6)
  const ratio = L(SZ.elderKeeperRatio.elderZ) / L(SZ.elderKeeperRatio.keeperZ);
  ratios.push([sp.name, ratio.toFixed(2)]);
  if (ce / L50 > SZ.maxReachRatio) console.log('CHECK ceiling > 2.8× median:', sp.name, (ce / L50).toFixed(2));
  if (LAKES.includes(sp.zone)) { maxCeil[sp.zone] = Math.max(maxCeil[sp.zone] || 0, ce); if (s >= SZ.giantTailSigma) giant[sp.zone] = (giant[sp.zone] || 0) + 1; }
  if (rows) lines.push(`| ${i + 1} | ${sp.name} | ${fmtL(L50)} / ${fmtW(W(L50))} | ${s.toFixed(s * 1000 % 10 ? 3 : 2).replace(/^0/, '')} | ${fmtL(tr)} / ${fmtW(W(tr))} | ${fmtL(el)} / ${fmtW(W(el))} | ${fmtL(ce)} / ${fmtW(W(ce))} | ${ratio.toFixed(2)} |`);
});
for (const l of lines) console.log(l);
for (const lake of LAKES) {
  const lg = D.SPECIES_V3.find((s) => s.zone === lake && s.rarity === 'legendary');
  const len = D.sizeL50(lg), r = len / maxCeil[lake];
  console.log(`legend ${lg.name} ${len} cm vs lake max ceiling ${maxCeil[lake].toFixed(0)} cm → ${r.toFixed(2)}× ${r >= SZ.legend.minRatio ? 'OK' : 'FAIL'} · giant-tail species ${giant[lake] || 0}`);
}
const rs = ratios.map((r) => +r[1]);
console.log('Elder/Keeper length ratio range', Math.min(...rs), '…', Math.max(...rs));

// value normaliser: E[clamp(e^(perZ·z), lo, hi) × classBonus] for z ~ N(μ, 1) truncated [z.min, cap]
const V = SZ.value;
function Ez(mu, cap) {
  let num = 0, den = 0;
  for (let z = SZ.z.min; z <= cap; z += 0.001) {
    const p = Math.exp(-0.5 * (z - mu) ** 2);
    const cb = z >= 2.65 ? V.classBonus.elder : z >= 1.88 ? V.classBonus.trophy : 1;
    num += p * Math.min(V.clamp[1], Math.max(V.clamp[0], Math.exp(V.perZ * z))) * cb; den += p;
  }
  return num / den;
}
const mix = SZ.valueMix.mu, gs = SZ.valueMix.giantShare;
let e = 0; for (const [mu, w] of mix) e += w * ((1 - gs) * Ez(mu, SZ.elsewhereMaxZ) + gs * Ez(mu, SZ.z.max));
const muMean = mix.reduce((a, [m, w]) => a + m * w, 0);
console.log(`size×class multiplier: μ0 ${Ez(0, 2.64).toFixed(3)} · μ0.4 ${Ez(0.4, 2.64).toFixed(3)} · μ0.5 ${Ez(0.5, 2.64).toFixed(3)} · mix (mean μ ${muMean.toFixed(2)}) ${e.toFixed(3)}`);
console.log(`today's average sizeK ${SZ.valueMix.sizeKMean} → species value factor f = ${SZ.valueMix.sizeKMean} / ${e.toFixed(3)} = ${(SZ.valueMix.sizeKMean / e).toFixed(3)} (data: ${V.factor})`);
console.log('Elder Reedjaw (z 2.8) value =', D.fishValueV3(D.SPECIES_V3_BY_ID.reedjaw_pike, 2.8));
// resident z ~ N(1.6, 0.6) truncated [1.88, 3.6]
const RZ = D.BALANCE_V3.residents.z;
const Phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
const tail = (a) => 1 - Phi((a - RZ.mean) / RZ.sd);
const top = tail(RZ.min) - tail(RZ.max);
console.log(`resident: Elder share ${(100 * (tail(2.65) - tail(RZ.max)) / top).toFixed(1)}% · Ancient share ${(100 * (tail(SZ.ancient) - tail(RZ.max)) / top).toFixed(1)}%`);
// class odds per μ (truncated [−2, 3.6])
for (const mu of [0, 0.5, 1.0, 1.5, 1.8]) {
  const o = D.classOdds(mu);
  const c = [o.small, o.keeper, o.prize, o.trophy, o.elder].map((x) => (100 * x).toFixed(1));
  console.log(`μ ${mu}: Small ${c[0]} Keeper ${c[1]} Prize ${c[2]} Trophy ${c[3]} Elder ${c[4]} (Ancient ${(100 * o.ancient).toFixed(1)})`);
}
