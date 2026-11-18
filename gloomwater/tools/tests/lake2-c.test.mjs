// LAKE 2, lane C (docs/loop/LAKE2.md §6, §9): the road in, in node. The Chart's reach over the owned sheets (chartReach), a water open
// only once its map is owned and its keys held or the home has lain there (waterOpen), the sheet baked ahead and never drawn before its
// water is open, Sporewood's own sheet drawn from the world's outline (its coast the world's shore, its banks, reeds, in and out, its
// mooring), its four places' words off the shore's pen at every size from 358 px up, the shipped lake map priced on the sealed sheet,
// and the Mossmere's Chart as it was with one water owned.
//   node tools/tests/lake2-c.test.mjs   (or node tools/check.mjs)
import { loadLoopData, freshLoopMeta } from './loop-fixture.mjs';

const D = await loadLoopData();
const U = await import('../../src/ui-loop.js');
const C = await import('../../src/ui-chart.js');
const CD = await import('../../src/chart-draw.js');
const PL = await import('../../src/progression-loop.js');
const WL = await import('../../src/world-layout.js');
const { CHART_ART } = await import('../../src/chart-art.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra).slice(0, 1200) : ''); } }
const section = (s) => console.log(`- ${s}`);
const meet = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
function fakeCtx() {
  const grad = { addColorStop() {} };
  const t = { measureText(s) { const px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(t.font || '')?.[1] || 13); return { width: String(s).length * px * 0.52 }; },
    createRadialGradient: () => grad, createLinearGradient: () => grad, font: '13px serif' };
  return new Proxy(t, { get: (o, k) => (k in o ? o[k] : typeof k === 'string' ? () => {} : undefined), set: (o, k, v) => { o[k] = v; return true; } });
}
const art = { sheets: CHART_ART.sheets.map((s) => ({ ...s, image: null })), paper: { ...CHART_ART.paper, image: null }, live: CHART_ART.live };

// a save at the Mossmere's end, Sporewood shipped (as the gate will set it): its gear bought, its list landed, the lake map bought
const shipped = { ...D, LOOP: { ...D.LOOP, shipped: 'sporewood' } };
function endMeta({ map = true, keys = true, towed = false } = {}) {
  const meta = freshLoopMeta(D), l = meta.loop;
  if (keys) {
    l.tackle = { ...l.tackle, rod: 2, line: 2, reel: 2 };
    meta.journal = { ...(meta.journal || {}) };
    for (const id of U.journalModel(meta, D, 'mossmere', { listFor: PL.listFor }).list.map((x) => x.id)) meta.journal[id] = { caught: 1 };
  }
  if (map) { l.maps = { ...l.maps, lakes: ['mossmere', 'sporewood'], places: [...(l.maps?.places || []), 'lullaby', 'gill_harp'] }; }
  if (towed) l.barge = { water: 'sporewood', towed: ['mossmere', 'sporewood'] };
  return meta;
}

section('the art: sheet 2 baked ahead, its own box and pixels, the live layer\'s second reach (LAKE2 §6.2)');
{
  const s2 = CHART_ART.sheets.find((s) => s.water === 'sporewood');
  ok(!!s2 && s2.n === 2 && s2.box.length === 4 && /^[0-9a-f]{8}$/.test(s2.hash), 'chart-art.js carries Sporewood\'s sheet (n 2, its box, its decoded pixels\' hash)', s2 && { n: s2.n, box: s2.box, hash: s2.hash });
  const raw = (u) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64').length;
  ok(s2 && raw(s2.uri) <= 100_000, `sheet 2: ${s2 && raw(s2.uri)} bytes ≤ 100 KB raw (M1 §3.2's later sheet's line)`);
  const more = CHART_ART.live.more?.[2];
  ok(!!more && Array.isArray(more.edges) && more.edges.length > 0 && JSON.stringify(more.edges) !== JSON.stringify(CHART_ART.live.edges), 'the live layer holds the edge with two sheets owned, its own (live.more[2])');
  ok(CHART_ART.live.pieces.some((p) => p.id === D.LOOP.tow.legs.sporewood.piece && p.leg === 2), 'the road\'s second leg (the Lockwater) is the second reach\'s');
}

section('waterOpen: a later water opens once its map is owned and its keys held, or once the home has lain there (SPEC §5.5)');
{
  ok(PL.waterOpen(freshLoopMeta(D), D, 'mossmere') === true, 'the first water: always open');
  ok(PL.waterOpen(endMeta(), D, 'sporewood') === false, 'Sporewood not shipped (LOOP.shipped mossmere): never open, whatever the save');
  ok(PL.waterOpen(endMeta(), shipped, 'sporewood') === true, 'shipped, its map owned, the gear and catch keys held: open');
  ok(PL.waterOpen(endMeta({ map: false }), shipped, 'sporewood') === false, 'its map not bought: not open (the keys gate sailing, never buying)');
  ok(PL.waterOpen(endMeta({ keys: false }), shipped, 'sporewood') === false, 'its map bought, its keys not held: not open');
  const left = endMeta({ towed: true }); left.loop.tackle = { rod: 0, line: 0, reel: 0 };
  ok(PL.waterOpen(left, shipped, 'sporewood') === true, 'towed there (the gear key\'s rod left behind at the tow): open for good');
  ok(PL.waterOpen(endMeta(), shipped, 'glasswater') === false && PL.waterOpen(endMeta(), shipped, 'nowhere') === false, 'a water past the shipped one, or none: closed');
}

section('the Chart\'s model: the sheet drawn only once its water opens; the shipped map priced on the sealed sheet (§6.1)');
{
  const m0 = U.chartModel(endMeta({ map: false }), shipped, {});
  ok(m0.sheets.map((s) => s.waterId).join() === 'mossmere' && m0.next?.waterId === 'sporewood' && m0.next.shipped === true && m0.next.seals.map.held === false, 'before the map: one sheet; Sporewood the sealed sheet, shipped, its map seal hollow', m0.next);
  const L0 = CD.layoutChart(m0, art, { w: 892, h: 420, dpr: 1, phone: false, F: C.CHART_FONTS, water: { mossmere: C.waterGeometry(D, 'mossmere') }, sites: C.placeSites(D, 'mossmere') });
  ok(L0.sealed?.price === shipped.LOOP.waters.sporewood.lake * 2 || Number.isFinite(L0.sealed?.price), 'the sealed sheet carries the map\'s price where "Coming soon" stood', L0.sealed?.price);
  ok(L0.targets.some((t) => t.kind === 'sealed' && t.label === String(L0.sealed.price)), 'its target is labelled with the price', L0.targets.filter((t) => t.kind === 'sealed'));
  const mk = U.chartModel(endMeta({ keys: false }), shipped, {});
  ok(mk.sheets.length === 1 && mk.next?.waterId === 'sporewood' && mk.next.seals.map.held === true, 'the map bought but the keys not held: still the sealed sheet (its map seal pressed)', mk.next?.seals);
  const m2 = U.chartModel(endMeta(), shipped, {});
  ok(m2.sheets.map((s) => s.waterId).join() === 'mossmere,sporewood', 'open: both sheets drawn', m2.sheets.map((s) => s.waterId));
  const mOff = U.chartModel(endMeta(), D, {});
  ok(mOff.sheets.map((s) => s.waterId).join() === 'mossmere', 'Sporewood not shipped: the Mossmere\'s Chart as it was, whatever the save holds');
}

section('chartReach: the window over the owned sheets (one owned: the first sheet\'s own, exactly as M1 drew it)');
{
  const one = CD.chartReach(U.chartModel(freshLoopMeta(D), D, {}), art);
  ok(one.n === 1 && JSON.stringify(one.box) === JSON.stringify(CHART_ART.sheets[0].box) && one.edges === CHART_ART.live.edges && one.wisp === CHART_ART.live.wisp, 'one water: n 1, the first sheet\'s box, its edges and wisp', { n: one.n, box: one.box });
  ok(one.pieces.every((p) => p.leg <= 1) && one.waters.every((w) => w.n <= 1), 'one water: the road\'s first leg and the Mossmere\'s lamp only');
  const two = CD.chartReach(U.chartModel(endMeta(), shipped, {}), art);
  const b1 = CHART_ART.sheets[0].box, b2 = CHART_ART.sheets[1].box;
  ok(two.n === 2 && two.box[0] === Math.min(b1[0], b2[0]) && two.box[1] === Math.min(b1[1], b2[1]) && two.box[0] + two.box[2] === Math.max(b1[0] + b1[2], b2[0] + b2[2]) && two.box[1] + two.box[3] === Math.max(b1[1] + b1[3], b2[1] + b2[3]), 'two waters: the window is both boxes\' union', two.box);
  ok(two.edges === CHART_ART.live.more[2].edges && two.pieces.some((p) => p.leg === 2) && two.waters.some((w) => w.water === 'sporewood'), 'two waters: the second reach\'s edge, the Lockwater\'s leg, Sporewood\'s lamp');
}

section('Sporewood\'s sheet is the world\'s outline (LAKE2 §6.2): its coast on the shore, its banks, reeds, in and out, its mooring');
{
  const geo = C.waterGeometry(D, 'sporewood'), zone = D.ZONE_BY_ID.sporewood, L = WL.buildLayout(zone);
  ok(geo?.outline === true && geo.shore.length > 100 && L.outline, 'an outline water: its sheet carries the shore as a closed polygon', geo && { outline: geo.outline, n: geo.shore.length });
  const off = geo.shore.map(([x, z]) => Math.abs(WL.shoreDist(L, x, z)));
  ok(Math.max(...off) < 0.75, `every vertex of the sheet's coast lies on the world's shore (worst ${Math.max(...off).toFixed(2)} m, the SDF's 1 m grid)`);
  let area = 0; for (let i = 0; i < geo.shore.length; i++) { const a = geo.shore[i], b = geo.shore[(i + 1) % geo.shore.length]; area += a[0] * b[1] - b[0] * a[1]; }
  let wet = 0, n = 0; for (let x = geo.bbox.x0; x <= geo.bbox.x1; x += 2) for (let z = geo.bbox.z0; z <= geo.bbox.z1; z += 2) { n++; if (WL.shoreDist(L, x, z) > 0) wet++; }
  const isles = (geo.islands || []).reduce((s, q) => { let a = 0; const P = q.outline || []; for (let i = 0; i < P.length; i++) { const p = P[i], r = P[(i + 1) % P.length]; a += p[0] * r[1] - r[0] * p[1]; } return s + Math.abs(a) / 2; }, 0);
  const polyWet = Math.abs(area) / 2 - isles, sdfWet = wet * 4;
  ok(Math.abs(polyWet - sdfWet) / sdfWet < 0.03, `the coast's water (${Math.round(polyWet)} m², less its isles) is the world's water (${sdfWet} m² by the SDF) within 3%`);
  ok(geo.banks?.length === geo.shore.length && geo.banks.every((b) => Number.isFinite(b.h) && Math.abs(Math.hypot(b.nx, b.nz) - 1) < 0.01), 'each coast vertex carries its bank (height, a unit normal into the land)');
  const hi = geo.banks.filter((b) => b.h > 4).length, lo = geo.banks.filter((b) => b.h < 1).length;
  ok(hi > 10 && lo > 10, `high banks for the hachures (${hi} vertices over 4 m: the Fern Bluff, the East Pool's north shore) and low ones bare (${lo} under 1 m)`);
  ok(geo.reeds?.length > 0 && geo.reeds.every((r) => r.length === 2 && r.every(Number.isFinite)), 'its reed runs, as arc lengths along the shore', geo.reeds);
  ok(geo.inflow && geo.outflow && WL.shoreDist(L, geo.inflow.x, geo.inflow.z) < 6 && WL.shoreDist(L, geo.outflow.x, geo.outflow.z) < 6, 'the Seep (its in) and the Root Weir (its out), each at the shore', { inflow: geo.inflow, outflow: geo.outflow });
  ok(geo.mooring?.hull && geo.mooring?.murk && WL.shoreDist(L, geo.mooring.hull.x, geo.mooring.hull.z) > 0, 'its mooring: the Hearth\'s hull on the water, Murk\'s barge beside it');
  ok((geo.islands || []).length === 6 && geo.islands.every((q) => Array.isArray(q.outline) && q.outline.length > 4), 'its six isles, each its own coast');
  ok((geo.deep || []).length >= 1, 'the Mother\'s Cup: the one deep well');
  const moss = C.waterGeometry(D, 'mossmere');
  ok(!moss.outline && !moss.banks && !moss.reeds, 'the Mossmere\'s sheet as it was: no outline keys');
}

section('Sporewood\'s card: its four places\' words wholly on the water or the paper, on the card, meeting no other (358 px and up)');
{
  const water = { mossmere: C.waterGeometry(D, 'mossmere'), sporewood: C.waterGeometry(D, 'sporewood') };
  const sites = { ...C.placeSites(D, 'mossmere'), ...C.placeSites(D, 'sporewood') };
  ok(['lullaby', 'gill_harp', 'veilwater', 'mothers_cup'].every((id) => sites[id] && water.sporewood.shoreDist(sites[id].x, sites[id].z) > 0), 'each place\'s site is on Sporewood\'s water', sites);
  ok(!['lullaby', 'gill_harp', 'veilwater', 'mothers_cup'].some((id) => id in C.placeSites(D, 'mossmere')) && !Object.keys(C.placeSites(D, 'sporewood')).some((id) => id in C.placeSites(D, 'mossmere')), 'each water\'s sites its own');
  const ctx = fakeCtx();
  const viewFor = (w, h) => ({ w, h, dpr: 1, phone: w < 560, F: C.CHART_FONTS, water, sites, fmtWeight: D.fmtWeight, fishGlyph: () => null, words: { soon: D.TEXT_LOOP.comingSoon },
    measure: (t, f) => { ctx.font = f; return ctx.measureText(t).width; } });
  const SIZES = [[358, 560], [354, 612], [354, 552], [354, 432], [354, 372], [358, 364], [640, 640], [892, 326], [920, 420], [1100, 560], [1200, 680]];
  const states = [['the two the map opens', (l) => l], ['all four owned', (l) => { l.maps.places.push('veilwater', 'mothers_cup'); return l; }]];
  let n = 0;
  const bad = [];
  for (const [w, h] of SIZES) for (const [what, put] of states) for (const pick of [null, 'lullaby', 'gill_harp', 'veilwater', 'mothers_cup']) {
    const meta = endMeta(); put(meta.loop);
    const m = U.chartModel(meta, shipped, { slots: 3 });
    for (const s of m.sheets) s.places = C.chartPlaces(D, s.places);
    m.pick = { water: 'sporewood', place: pick && m.sheets[1].places.some((p) => p.id === pick && p.owned) ? pick : null };
    const L = CD.layoutChart(m, art, viewFor(w, h)); n++;
    const card = L.cards.find((c) => c.waterId === 'sporewood');
    if (!card) { bad.push([w, h, what, pick, 'no card']); continue; }
    const P = L.places.filter((p) => p.box);
    for (const A of P) {
      if (A.side === 'cross') bad.push([w, h, what, pick, 'across the pen', A.id]);
      if (!(A.box[0] >= card.x && A.box[0] + A.box[2] <= card.x + card.w && A.box[1] >= card.y && A.box[1] + A.box[3] <= card.y + card.h)) bad.push([w, h, what, pick, 'off the card', A.id]);
      for (const B of P) if (B !== A && meet(A.box, B.box)) bad.push([w, h, what, pick, 'words meet', A.id, B.id]);
      for (const t of L.targets) if (!t.backdrop && t.place !== A.id && meet(A.box, t.rect)) bad.push([w, h, what, pick, 'on a target', A.id, t.id]);
    }
    // (a name with no room off the pen waits unlettered on the smallest sheets; the chosen place is always named)
    if (m.pick.place && !L.places.find((p) => p.id === m.pick.place)?.label) bad.push([w, h, what, pick, 'the chosen place unnamed']);
    if (h >= 432 && P.length < L.places.filter((p) => p.owned).length) bad.push([w, h, what, pick, 'a name dropped on a sheet with room']);
    const pairs = C.targetOverlaps(L.targets);
    if (pairs.length) bad.push([w, h, what, pick, 'targets overlap', pairs]);
    if (!L.targets.every((t) => t.rect[2] >= 44 && t.rect[3] >= 44)) bad.push([w, h, what, pick, 'a target under 44 px']);
    if (w < 560 && L.fonts.some((f) => parseFloat(/(\d+(?:\.\d+)?)px/.exec(f)?.[1] || 0) < 16)) bad.push([w, h, what, pick, 'a word under 16 px']);
    if (!L.targets.some((t) => t.kind === 'sheet' && t.water === 'mossmere')) bad.push([w, h, what, pick, 'no way back to the Mossmere\'s card']);
  }
  ok(bad.length === 0, `${n} layouts of Sporewood's card: no word across the shore's pen, off the card or meeting another word or target; no two targets overlap`, bad.slice(0, 60));
  // and the drawing itself: both sheets, the outline lake, the places' words lettered, nothing thrown
  for (const [w, h] of [[358, 560], [892, 326]]) {
    const meta = endMeta(); const m = U.chartModel(meta, shipped, { slots: 3 });
    for (const s of m.sheets) s.places = C.chartPlaces(D, s.places);
    m.pick = { water: 'sporewood', place: null };
    let L = null, err = null;
    try { L = CD.drawChart(fakeCtx(), m, art, { ...viewFor(w, h), barge: 'sporewood' }, 0); } catch (e) { err = String(e?.stack || e); }
    ok(!err && L.texts.includes('Sporewood Pools') && L.texts.some((t) => /Lullaby/.test(t)), `${w} x ${h}: the Chart draws both sheets and Sporewood's card (its name and its places')`, err || L.texts);
  }
}

section('the Mossmere\'s Chart with one water owned: its layout as it was (no sheet target, the first sheet\'s window)');
{
  const water = { mossmere: C.waterGeometry(D, 'mossmere') }, sites = C.placeSites(D, 'mossmere');
  const L = CD.layoutChart(U.chartModel(freshLoopMeta(D), D, {}), art, { w: 892, h: 420, dpr: 1, phone: false, F: C.CHART_FONTS, water, sites });
  ok(L.reach === 1 && !L.targets.some((t) => t.kind === 'sheet') && L.sealed?.price === undefined, 'one sheet: reach 1, no sheet target, the sealed sheet unpriced ("Coming soon")');
  ok(L.cards[0].lake.ox === 0 && L.cards[0].lake.oz === 0, 'the Mossmere\'s lake centred on its own centre, as built');
}

console.log(`\nlake2-c: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
