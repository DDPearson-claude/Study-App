// tools/out/pivot/roster-v3.mjs — BRIEF-v3 (final) size table and checks.
// L = L50·e^(σz + τ·max(0, z − 1.04)²), τ = 0.06 · W = k·L³ (k per body shape, g/cm³)
// Cuts on z: Small < −0.25 ≤ Keeper < 1.04 ≤ Prize < 1.88 ≤ Trophy < 2.65 ≤ Elder; Ancient ≥ 3.2; said to reach = z 3.6
// Checks: legend base length ≥ 1.4 × the lake's largest non-legend "said to reach"; ceiling ≤ 2.8 × median;
// ≥ 2 giant-tail species (σ ≥ 0.16) per lake; Elder (z 3.0) / Keeper (z 0.4) length ratio reported.
// Also: the value-curve normaliser at the expected μ mix. Run: node tools/out/pivot/roster-v3.mjs [--rows]
const TAU = 0.06;
const K = { minnow: .010, perch: .013, crayfish: .030, carp: .016, koi: .015, pike: .0075, eel: .0016, angler: .025, ray: .012, puffer: .030, jelly: .020, ghost: .010, sturgeon: .006 };
const S = [
  // lake, #, name, shape, L50 cm, σ, value
  ['mossmere', 1, 'Dusk Minnow', 'minnow', 22, .12, 5], ['mossmere', 2, 'Mossback Perch', 'perch', 36, .13, 7],
  ['mossmere', 3, 'Gutter Crayfish', 'crayfish', 19, .10, 6], ['mossmere', 4, 'Lampsipper', 'minnow', 26, .12, 9],
  ['mossmere', 5, 'Weeping Carp', 'carp', 56, .16, 15], ['mossmere', 6, 'Candlefin Koi', 'koi', 46, .13, 18],
  ['mossmere', 7, 'Reedjaw Pike', 'pike', 70, .15, 34], ['mossmere', 8, 'Gloam Eel', 'eel', 72, .13, 42],
  ['mossmere', 9, 'Old Portcullis', 'carp', 58, .15, 40], ['mossmere', 10, 'Cupbearer', 'minnow', 8, .09, 48],
  ['mossmere', 11, 'Bridgechain Sturgeon', 'sturgeon', 70, .16, 55],
  ['sporewood', 13, 'Sporebelly Puffer', 'puffer', 25, .10, 13], ['sporewood', 14, 'Plumgill Perch', 'perch', 40, .13, 14],
  ['sporewood', 15, 'Capshell Crayfish', 'crayfish', 24, .10, 12], ['sporewood', 16, 'Velvet Ray', 'ray', 67, .14, 32],
  ['sporewood', 17, 'Threadling Eel', 'eel', 86, .13, 34], ['sporewood', 18, 'Nightbloom Carp', 'carp', 58, .17, 40],
  ['sporewood', 19, 'Mildew Angler', 'angler', 60, .16, 66], ['sporewood', 20, 'Sleepspore Jelly', 'jelly', 33, .09, 62],
  ['sporewood', 21, 'Harpstring Eel', 'eel', 82, .13, 74], ['sporewood', 22, 'Hushcap Koi', 'koi', 50, .13, 78],
  ['sporewood', 23, 'The Remembered Sun', 'koi', 45, .13, 80],
  ['glasswater', 25, 'Prism Minnow', 'minnow', 23, .12, 24], ['glasswater', 26, 'Glassgill Perch', 'perch', 43, .13, 28],
  ['glasswater', 27, 'Glassblown Puffer', 'puffer', 27, .10, 26], ['glasswater', 28, 'Chime Jelly', 'jelly', 36, .09, 56],
  ['glasswater', 29, 'Mirror Pike', 'pike', 75, .17, 62], ['glasswater', 30, 'Shardspine Eel', 'eel', 85, .14, 130],
  ['glasswater', 31, 'Vesper Gar', 'pike', 70, .15, 135], ['glasswater', 32, 'The Blind Scrivener', 'angler', 64, .16, 120],
  ['glasswater', 33, 'The Unreflected', 'perch', 60, .13, 145], ['glasswater', 34, 'The Footnote', 'perch', 51, .13, 140],
  ['glasswater', 35, 'Rainglass Darter', 'minnow', 39, .11, 135], ['glasswater', 36, 'The Sexton', 'carp', 66, .15, 150],
  ['paleabyss', 38, 'Ossuary Fry', 'minnow', 23, .12, 42], ['paleabyss', 39, 'Pallid Wraithfin', 'ghost', 46, .13, 48],
  ['paleabyss', 40, 'Bonecrook Crayfish', 'crayfish', 27, .10, 44], ['paleabyss', 41, 'Gilt-Eyed Eel', 'eel', 131, .16, 92],
  ['paleabyss', 42, 'Shroud Ray', 'ray', 82, .14, 88], ['paleabyss', 43, 'Funeral Veil', 'ghost', 42, .09, 190],
  ['paleabyss', 44, 'Lampwarden Angler', 'angler', 72, .14, 210], ['paleabyss', 45, 'The Clapper', 'carp', 66, .15, 225],
  ['paleabyss', 46, 'The Wax-Bearer', 'eel', 127, .13, 220], ['paleabyss', 47, 'The Unpaid Fare', 'ghost', 87, .14, 240],
  ['paleabyss', 48, 'Candlewake Sturgeon', 'sturgeon', 133, .175, 250], ['paleabyss', 49, 'The Namesake', 'perch', 62, .13, 230],
  ['wander', 51, 'Pilgrim Salmon (Sporewood median)', 'pike', 66, .13, 30], ['wander', 52, 'Hearthfish', 'koi', 32, .12, 28],
  ['cove', 53, 'Quayling', 'minnow', 14, .10, 0],
];
const LEG = { mossmere: ['The Belled Matriarch', 260, 230], sporewood: ['The Drifting Grove', 300, 320], glasswater: ['The Glass Sovereign', 300, 210], paleabyss: ['The Lantern-Swallower', 850, 3200] };
const L = (L50, s, z) => L50 * Math.exp(s * z + TAU * Math.max(0, z - 1.04) ** 2);
const W = (k, cm) => k * cm ** 3;   // grams
const fmtL = (cm) => (cm < 20 ? `${Math.round(cm * 10)} mm` : `${Math.round(cm)}`);
const fmtW = (g) => (g < 1000 ? `${Math.round(g)} g` : g < 100000 ? `${(g / 1000).toFixed(1)} kg` : `${Math.round(g / 1000)} kg`);
const rows = args().includes('--rows');
function args() { return process.argv.slice(2); }
const maxCeil = {};
const giant = {};
let ratios = [];
for (const [lake, n, name, shape, L50, s, v] of S) {
  const k = K[shape];
  const tr = L(L50, s, 1.88), el = L(L50, s, 2.65), an = L(L50, s, 3.2), ce = L(L50, s, 3.6);
  const ratio = L(L50, s, 3.0) / L(L50, s, 0.4);
  ratios.push([name, ratio.toFixed(2)]);
  if (ce / L50 > 2.8) console.log('CHECK ceiling > 2.8× median:', name, (ce / L50).toFixed(2));
  if (lake !== 'wander' && lake !== 'cove') { maxCeil[lake] = Math.max(maxCeil[lake] || 0, ce); if (s >= 0.16) giant[lake] = (giant[lake] || 0) + 1; }
  if (rows) console.log(`| ${n} | ${name} | ${fmtL(L50)} / ${fmtW(W(k, L50))} | ${s.toFixed(s * 1000 % 10 ? 3 : 2).replace(/^0/, '')} | ${fmtL(tr)} / ${fmtW(W(k, tr))} | ${fmtL(el)} / ${fmtW(W(k, el))} | ${fmtL(ce)} / ${fmtW(W(k, ce))} | ${ratio.toFixed(2)} |`);
}
for (const [lake, [name, len]] of Object.entries(LEG)) {
  const r = len / maxCeil[lake];
  console.log(`legend ${name} ${len} cm vs lake max ceiling ${maxCeil[lake].toFixed(0)} cm → ${r.toFixed(2)}× ${r >= 1.4 ? 'OK' : 'FAIL'} · giant-tail species ${giant[lake] || 0}`);
}
const rs = ratios.map((r) => +r[1]);
console.log('Elder/Keeper length ratio range', Math.min(...rs), '…', Math.max(...rs));

// value normaliser: E[clamp(e^(0.45z), 0.6, 6) × classBonus] for z ~ N(μ,1) truncated [−2, cap]
function Ez(mu, cap) {
  let num = 0, den = 0;
  for (let z = -2; z <= cap; z += 0.001) {
    const p = Math.exp(-0.5 * (z - mu) ** 2);
    const cb = z >= 2.65 ? 1.6 : z >= 1.88 ? 1.25 : 1;
    num += p * Math.min(6, Math.max(0.6, Math.exp(0.45 * z))) * cb; den += p;
  }
  return num / den;
}
const mix = [[0, 0.25], [0.3, 0.3], [0.6, 0.25], [1.0, 0.15], [1.5, 0.05]];   // assumed μ mix per sold fish (average player)
let e = 0; for (const [mu, w] of mix) e += w * (2 / 3 * Ez(mu, 2.64) + 1 / 3 * Ez(mu, 3.6));
const muMean = mix.reduce((a, [m, w]) => a + m * w, 0);
console.log(`size×class multiplier: μ0 ${Ez(0, 2.64).toFixed(3)} · μ0.4 ${Ez(0.4, 2.64).toFixed(3)} · μ0.5 ${Ez(0.5, 2.64).toFixed(3)} · mix (mean μ ${muMean.toFixed(2)}) ${e.toFixed(3)}`);
console.log(`today's average sizeK 0.942 → species value factor f = 0.942 / ${e.toFixed(3)} = ${(0.942 / e).toFixed(3)}`);
// Elder Reedjaw example
console.log('Elder Reedjaw (z 2.8) value =', Math.round(34 * 0.72 * Math.exp(0.45 * 2.8) * 1.6));
// resident z ~ N(1.6, 0.6) truncated [1.88, 3.6]
const Phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
const tail = (a) => 1 - Phi((a - 1.6) / 0.6);
const top = tail(1.88) - tail(3.6);
console.log(`resident: Elder share ${(100 * (tail(2.65) - tail(3.6)) / top).toFixed(1)}% · Ancient share ${(100 * (tail(3.2) - tail(3.6)) / top).toFixed(1)}%`);
// class odds per μ (truncated [−2, 3.6])
for (const mu of [0, 0.5, 1.0, 1.5, 1.8]) {
  const P = (a) => Phi(a - mu); const lo = P(-2), hi = P(3.6), n = hi - lo;
  const c = [(P(-0.25) - lo), P(1.04) - P(-0.25), P(1.88) - P(1.04), P(2.65) - P(1.88), hi - P(2.65)].map((x) => (100 * x / n).toFixed(1));
  console.log(`μ ${mu}: Small ${c[0]} Keeper ${c[1]} Prize ${c[2]} Trophy ${c[3]} Elder ${c[4]} (Ancient ${(100 * (hi - P(3.2)) / n).toFixed(1)})`);
}
