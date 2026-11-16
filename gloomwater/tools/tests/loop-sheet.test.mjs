// tools/tests/loop-sheet.test.mjs — the Wick's sheet, "Taper's Sheet" (docs/loop/SHEET.md v2 §7.4, S1–S14): the Hold rule made true in
// the land roll (S3, SHEET §8.1), the pure model src/loop-sheet.js against the functions the game draws from, and the view's words.
//   node tools/tests/loop-sheet.test.mjs   (or node tools/check.mjs)
import { loadLoopData } from './loop-fixture.mjs';
import * as WC from '../../src/watercraft.js';

const D = await loadLoopData({ query: 'loop-sheet' });
const SIM = await import('../sim/clams.mjs');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);

const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
const MOSS = D.SPECIES.filter((s) => s.zone === 'mossmere' && s.rarity !== 'legendary' && !s.cove);
const LURES = [null, ...WC.LURE_IDS], BAITS = [null, ...WC.BAIT_IDS];

// ---------------------------------------------------------------- S3: the Hold rule (SHEET §8.1)
section('S3 the Hold rule: the land roll gives a tin\'s or lure\'s Hold to the fish that like it or better (gradeTargets), as the sim does');
{
  const kits = [{ rod: 1, line: 1, reel: 2 }, { rod: 0, line: 0, reel: 0 }];
  let n = 0, worst = 0; const diffs = new Map();
  for (const sp of MOSS) {
    const simSp = SIM.SPECIES.find((s) => s.id === sp.id && s.water === 'mossmere');
    if (!simSp) { ok(false, `the sim has ${sp.id}`); continue; }
    for (const kit of kits) for (const lure of LURES) for (const bait of BAITS) for (const cls of CLASSES) {
      const a = D.catchParts(sp, cls, { ...kit, item: lure, upgrade: bait ? { id: bait } : undefined }, { strike: 'struck' })?.p ?? 0;
      const b = SIM.landP(simSp, cls, { ...kit, lure, bait }, 'struck', false);
      n++;
      const d = Math.abs(a - b);
      if (d > worst) worst = d;
      if (d > 1e-9) diffs.set(sp.id, (diffs.get(sp.id) || 0) + 1);
    }
  }
  ok(n >= 3840, `S3 compared ${n} land chances`);
  ok(diffs.size === 0, `S3 catchParts equals the sim's landP on every Mossmere fish × class × hook × kit (worst ${worst.toExponential(2)}; differ: ${[...diffs].map(([k, v]) => `${k} ×${v}`).join(', ') || 'none'})`);
  for (const id of WC.HOOK_ITEMS.filter((x) => x !== 'bare')) {
    const helped = MOSS.filter((sp) => WC.gradeOf(sp.id, {}) !== undefined && D.catchItemHold(id, sp) > 0).map((s) => s.id).sort();
    eq(helped, WC.gradeTargets(id, D).filter((x) => MOSS.some((s) => s.id === x)).sort(), `S3 ${id} helps exactly its gradeTargets`);
  }
  // the counts the gear line prints (SHEET §8.1's measured audit, now true in the roll): Mire Worms 8, Lumen Moss 6, Cut Strip 10, the Feather Fly 5
  eq(['mireworm', 'lumen_moss', 'cut_strip', 'feather_fly'].map((id) => MOSS.filter((sp) => D.catchItemHold(id, sp) > 0).length), [8, 6, 10, 5],
    'S3 the fish each helps on the Mossmere: worms 8, moss 6, strip 10, fly 5');
  ok(D.catchItemHold('glimmer_spoon', 'mossback_perch') > 0 && D.catchItemHold('glimmer_spoon', 'hullkiss_lamprey') === 0, 'S3 the spoon helps the Mossback Perch, not the Hullkiss Lamprey');
  ok(D.CATCH_V3.items.cut_strip.family === 'predator' && D.CATCH_V3.items.mireworm.attract === true, 'S3 family and attract stay on the records (the sim\'s fallback)');
}
// off the loop the rule is the built one (the v3 fingerprint holds: validate-data --v3)
{
  globalThis.GW_LOOP = false;
  const V3 = await import('../../src/data.js?loop-sheet-v3');
  globalThis.GW_LOOP = true;
  ok(!V3.CATCH_V3.items.mireworm.species && !V3.CATCH_V3.items.cut_strip.species, 'S3 off the loop no item carries the patch\'s species list');
}

console.log(`\nloop-sheet: ${pass} passed, ${fail} failed`);
if (fail) { for (const f of failures) console.log('  -', f); process.exit(1); }
