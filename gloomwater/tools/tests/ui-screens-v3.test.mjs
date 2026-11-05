// Unit tests for the v3 screens' pure helpers (src/ui-v3.js; DESIGN §25.6.8, §25.5.4, §25.14.2 U3 U14 U17 U18):
//   the measuring overlay's plan per class (Small / Keeper 1.2 s, Prize 2.4, Trophy 3.5, Elder 5; the 1.2 s swarm variant;
//   an Elder skippable after 0.6 s), its phases and eased count, the knotted cord as a ruler (class bands at the species'
//   own lengths), the record banners' words, the New Descent mode cards (First Outing only on a fresh save, Lantern
//   preselected from run 2), the still moment a banked pick needs, and the Scorched card's lines.
//   node tools/tests/ui-screens-v3.test.mjs   (or node tools/check.mjs)
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const D = await import('../../src/data.js?ui-screens-v3');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;
const V = await import('../../src/ui-v3.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const section = (s) => console.log(`- ${s}`);

section('U3: the ceremony plan per class matches §25.6.8');
const want = { small: 1.2, keeper: 1.2, prize: 2.4, trophy: 3.5, elder: 5 };
for (const [cls, dur] of Object.entries(want)) {
  const p = V.measurePlan(D, { sizeClass: cls });
  ok(near(p.dur, dur), `${cls}: ${dur} s`, p);
  const k = dur / 3.6;
  ok(near(p.scoop, 0.6 * k) && near(p.cordStart, 1.4 * k) && near(p.cordEnd, 2.8 * k), `${cls}: the beats scale from the 3.6 s reference (scoop 0.6, cord 1.4–2.8)`, p);
  ok(p.skipAfter === (cls === 'elder' ? 0.6 : 0), `${cls}: skippable ${cls === 'elder' ? 'after 0.6 s' : 'at once'}`, p.skipAfter);
}
{
  const lg = V.measurePlan(D, { sizeClass: 'keeper', legendary: true });
  ok(near(lg.dur, 5) && lg.skipAfter === 0.6 && lg.elderish, 'a legend plays the Elder\'s 5 s and waits 0.6 s before a skip', lg);
  for (const cls of Object.keys(want)) ok(near(V.measurePlan(D, { sizeClass: cls, short: true }).dur, 1.2), `${cls}: 1.2 s during a swarm window`);
  const nod = V.measurePlan(null, { sizeClass: 'trophy' });
  ok(near(nod.dur, 3.5) && near(nod.cordEnd, 2.8 * 3.5 / 3.6), 'the plan stands without data (fallback timings)', nod);
}

section('U3: phases, the eased count and the skip rule');
{
  const p = V.measurePlan(D, { sizeClass: 'trophy' });
  const L = 112;
  ok(V.measureAt(p, 0.1, L).phase === 'scoop', 'scoop first');
  ok(V.measureAt(p, p.scoop + 0.01, L).phase === 'pose', 'then the pose');
  const mid = V.measureAt(p, (p.cordStart + p.cordEnd) / 2, L);
  ok(mid.phase === 'cord' && near(mid.k, 0.5, 1e-9) && near(mid.count, L * 0.75, 1e-9) && !mid.stamped, 'the cord: half way in time is ¾ of the length (ease-out)', mid);
  const st = V.measureAt(p, p.cordEnd + 0.001, L);
  ok(st.phase === 'banners' && st.stamped && st.count === L, 'the stamp lands on the last knot, then the banners', st);
  ok(V.measureAt(p, p.dur, L).phase === 'card', 'the card at the end');
  let mono = true, prev = -1;
  for (let t = 0; t <= p.dur; t += 0.02) { const c = V.measureAt(p, t, L).count; if (c < prev - 1e-9) mono = false; prev = c; }
  ok(mono, 'the count never runs backwards');
  const e = V.measurePlan(D, { sizeClass: 'elder' });
  ok(!V.measureSkippable(e, 0.59) && V.measureSkippable(e, 0.6), 'an Elder: no skip before 0.6 s');
  ok(V.measureSkippable(p, 0), 'a Trophy: skip at once');
  ok(V.measureAt(null, 1, 50).phase === 'card', 'no plan: straight to the card');
}

section('U3: the knotted cord as a ruler (class bands at the species\' lengths)');
{
  const sp = D.SPECIES_BY_ID.reedjaw_pike;
  const r = V.cordRuler(D, sp, 112);
  ok(r.max >= D.reachOf(sp) && r.max >= 112 * 1.06, 'the cord runs to the species\' "said to reach"', r.max);
  ok(r.knots.length >= 6 && r.knots.length <= 16, 'between 6 and 16 knots', r.knots.length);
  ok(r.knots.every((k, i) => i === 0 || k > r.knots[i - 1]) && r.knots.every((k) => k < r.max), 'knots ascend inside the cord', r.knots);
  ok(r.bands.map((b) => b.cls).join() === 'small,keeper,prize,trophy,elder', 'five class bands, small → elder', r.bands.map((b) => b.cls));
  ok(r.marks.map((m) => m.cls).join() === 'keeper,prize,trophy,elder', 'a class word where each band begins', r.marks);
  const lenAt = (z) => Math.round(D.sizeLength(sp, z) * 10) / 10;
  ok(near(r.marks[0].cm, lenAt(-0.25), 0.11) && near(r.marks[2].cm, lenAt(1.88), 0.11), 'the marks sit at the lengths of the class thresholds', r.marks);
  ok(r.bands[r.bands.length - 1].to === r.max && r.bands[0].from === 0, 'the bands cover the whole cord');
  ok(r.best === null, 'no best mark without one');
  ok(V.cordRuler(D, sp, 112, { best: 97 }).best === 97, 'the previous best is marked');
  ok(V.cordRuler(D, sp, 112, { best: 112 }).best === null, 'a best equal to this fish is not marked twice');
  const big = V.cordRuler(D, sp, 260);
  ok(big.max >= 260 * 1.06, 'a fish past the reach still fits on the cord', big.max);
  const lg = V.cordRuler(D, D.SPECIES_BY_ID.lantern_swallower, 860);
  ok(lg.bands.length === 0 && lg.marks.length === 0 && lg.max >= 860, 'a legend: a plain cord, no class bands', lg);
  const tiny = V.cordRuler(D, { size: { L50: 8, sigma: 0.1, k: 0.01 }, rarity: 'common' }, 8.2);
  ok(tiny.step <= 2 && tiny.max >= 8.2 && tiny.max < 30, 'a thumb-sized fish gets a short cord with knots every 2 cm or less', tiny);
}

section('U3: the class words under the cord never collide');
{
  // a phone's Reedjaw: Keeper, Prize, Trophy close together, Elder further on
  const words = [{ x: 120, w: 50 }, { x: 148, w: 40 }, { x: 176, w: 52 }, { x: 236, w: 42 }];
  const rows = V.labelRows(words);
  ok(rows.join() === '0,1,0,0', 'Prize drops under Keeper; Trophy and Elder have room above', rows);
  ok(V.labelRows([{ x: 120, w: 50 }, { x: 148, w: 40 }, { x: 176, w: 52 }, { x: 214, w: 42 }]).join() === '0,1,0,1', 'a crowded Elder drops too');
  ok(V.labelRows([{ x: 50, w: 40 }, { x: 200, w: 40 }, { x: 350, w: 40 }]).every((r) => r === 0), 'words with room stay on one row');
  ok(V.labelRows([{ x: 236, w: 42 }, { x: 120, w: 50 }, { x: 176, w: 52 }, { x: 148, w: 40 }]).join() === '0,0,0,1', 'rows come back in the input order');
  ok(V.labelRows([]).length === 0 && V.labelRows(null).length === 0, 'no words, no rows');
  // where two rows are enough, no two words in a row touch
  const evenly = Array.from({ length: 6 }, (_, i) => ({ x: 40 + i * 30, w: 44 }));
  const er = V.labelRows(evenly);
  const touch = [0, 1].some((r) => { const w = evenly.filter((_, i) => er[i] === r); return w.some((x, i) => i > 0 && x.x - x.w / 2 < w[i - 1].x + w[i - 1].w / 2 + 8); });
  ok(er.join() === '0,1,0,1,0,1' && !touch, 'evenly crowded words alternate and never touch', er);
}

section('U3: the record banners');
{
  const sp = D.SPECIES_BY_ID.reedjaw_pike;
  const L = V.recordLines(D, { species: sp, length: 112, records: [{ kind: 'pb', length: 112, prevLength: 97 }, { kind: 'classFirst', sizeClass: 'trophy' }, { kind: 'oldLedger' }, { kind: 'bestSetup', favours: [] }] });
  ok(L.length === 3 && L[0].kind === 'oldLedger' && L[1].kind === 'classFirst' && L[2].kind === 'pb', 'Old Ledger, class first, then the PB (best setup stays quiet)', L.map((l) => l.kind));
  ok(L[2].text === 'New best: 112 cm (was 97)', 'DESIGN\'s own words for a PB', L[2].text);
  ok(L[1].text === 'First Trophy Reedjaw Pike', 'a class first names class and species', L[1].text);
  ok(L[0].text === 'Old Ledger beaten', 'the Old Ledger', L[0].text);
  const anc = V.recordLines(D, { species: sp, records: [{ kind: 'classFirst', sizeClass: 'elder', ancient: true }] });
  ok(/^First Ancient Reedjaw Pike$/.test(anc[0].text) && anc[0].tone === 'gold', 'an Ancient first, in gold', anc);
  const nw = V.recordLines(D, { species: sp, isNew: true, records: [] });
  ok(nw.length === 1 && nw[0].kind === 'isNew', 'a first catch of the species', nw);
  const small = V.recordLines(D, { species: sp, records: [{ kind: 'pb', length: 8.36, prevLength: 7.9 }] });
  ok(small[0].text === 'New best: 8.4 cm (was 7.9)', 'under 20 cm the banner keeps a decimal', small[0].text);
  ok(V.recordLines(D, { species: sp, records: [{ kind: 'pb', length: 50, prevLength: 40 }, { kind: 'oldLedger' }], max: 1 }).length === 1, 'max lines respected');
  const pbL = V.recordLines(D, { species: sp, records: [{ kind: 'pb', length: 156.2, prevLength: 112 }] })[0];
  ok(pbL.sub === '44 cm past your old mark', 'the PB banner says by how much', pbL);
  const pb0 = V.recordLines(D, { species: sp, records: [{ kind: 'pb', length: 60 }] })[0];
  ok(pb0.text === 'New best: 60 cm' && pb0.sub === sp.name, 'a PB with no earlier mark names the species', pb0);
  ok(V.recordLines(D, { species: sp, records: null }).length === 0, 'no records, no banners');
}

section('U17: New Descent mode cards');
{
  const first = V.modeCards(D, { firstOuting: true, default: 'still', modes: [], firstOutingLine: 'Every night of your first outing is still.' });
  ok(first.first && first.cards.length === 1 && first.cards[0].id === 'first' && first.selected === 'first', 'a fresh save sees only the First Outing card', first);
  ok(/First Outing/.test(first.cards[0].name) && /still/.test(first.cards[0].line), 'the First Outing card says every night is still', first.cards[0]);
  const T = D.TEXT_V3.modes;
  const nm = { firstOuting: false, default: 'lantern', modes: ['still', 'lantern', 'gloomtide'].map((id) => ({ id, name: T[id].name, line: T[id].line })) };
  const r2 = V.modeCards(D, nm);
  ok(!r2.first && r2.cards.map((c) => c.id).join() === 'still,lantern,gloomtide' && r2.selected === 'lantern', 'run 2: Still / Lantern / Gloomtide with Lantern preselected', r2);
  ok(r2.cards.every((c) => c.line && c.line.length > 10 && c.line.length < 110), 'one line each', r2.cards.map((c) => c.line));
  const noApi = V.modeCards(D, null, { runs: 3 });
  ok(!noApi.first && noApi.cards.length === 3 && noApi.selected === 'lantern', 'without progression.getNightModes: BALANCE.nightModes and meta.runs', noApi);
  ok(V.modeCards(D, null, { runs: 0 }).first, 'without the API, a fresh save is the First Outing');
  ok(V.modeCards(dataV1, null, { runs: 3 }) === null, 'flag off: no mode cards');
}

section('U14: a banked pick waits for a still moment');
{
  ok(V.pickMomentOk({ fishingState: 'idle' }), 'still, no line out: yes');
  ok(V.pickMomentOk({ fishingState: 'lost' }), 'a lost fish (line back in): yes');
  for (const st of ['charging', 'casting', 'waiting', 'bite', 'reeling', 'landing']) ok(!V.pickMomentOk({ fishingState: st }), `a line out (${st}): no`);
  ok(!V.pickMomentOk({ fishingState: 'idle', speed: 2 }), 'sailing: no');
  ok(!V.pickMomentOk({ fishingState: 'idle', moveInput: 0.6 }), 'stick held: no');
  ok(!V.pickMomentOk({ fishingState: 'idle', cinematic: true }), 'the ceremony: no');
  ok(!V.pickMomentOk({ fishingState: 'idle', blocking: true }), 'another modal: no');
  ok(!V.pickMomentOk({ fishingState: 'idle', measuring: true }), 'the measuring overlay: no');
}

section('U17: the mode vignettes are clean SVG');
{
  const I = await import('../../src/ui-icons.js');
  for (const id of ['first', 'still', 'lantern', 'gloomtide']) {
    const svg = I.modeVignette(id);
    ok(/^<svg /.test(svg) && !/MLZ|NaN|undefined|d=""/.test(svg), `${id}: every pen stroke has a path`, svg.match(/MLZ|NaN|undefined/)?.[0]);
  }
}

section('U18: the Scorched card');
{
  const L = V.scorchedLines(D);
  ok(L.title === 'Scorched' && L.lines.length === 3 && /30 oil/.test(L.lines[1]) && /10 m/.test(L.lines[2]) && /dawn/.test(L.note), 'Scorched: the swarm withdraws, 30 oil, fish within 10 m, Embers mend at dawn', L);
  ok(/fight ends/.test(V.scorchedLines(D, { pending: true }).lines[2]), 'a fight in progress: the watch anchors where it ends');
  ok(V.SNUFF_EPITAPHS.length >= 2 && V.SNUFF_EPITAPHS.every((x) => typeof x === 'string' && x.length > 20), 'Snuffed has its own epitaphs');
}

console.log(`ui-screens-v3: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
