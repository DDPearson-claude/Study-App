// Unit tests for the drawn Chart (M1 step 3b; docs/loop/M1.md §3, SPEC §5.4, §5.5 (f), §8.8): chartModel's seam kept (its
// signature and keys; `next` the sealed sheet, null in the tutorial), the layout's tap targets (none overlapping at 358 px or on a
// desktop, each at least 44 px), nothing unowned drawn (a mist blot is never named; the tutorial letters the water alone; no place,
// card or seal stands on a later sheet's ground), the Chart's case of the three-cards rule (only Murk's three blots priced and
// tappable), the sealed sheet ("Coming soon", no price), no percentage anywhere, the phone (every word at 16 px or more in IM Fell
// English or the margin hand at 358 px, at 390 x 844 and in Safari's 390 x 664; the lake kept; no two places' words meeting;
// choosing a place moving no word), the byte budget (M1.md §3.2's lines read from
// src/chart-art.js and from the game's bundle), the chart's faces, and the generated art's shape. A recording 2D context stands in
// for the canvas, so drawChart runs in node and every word it letters is read back.
//   node tools/tests/ui-chart.test.mjs   (or node tools/check.mjs)
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLoopData, freshLoopMeta } from './loop-fixture.mjs';

const D = await loadLoopData();
const U = await import('../../src/ui-loop.js');
const C = await import('../../src/ui-chart.js');
const CD = await import('../../src/chart-draw.js');
const { CHART_ART } = await import('../../src/chart-art.js');
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const src = (f) => readFileSync(resolve(root, f), 'utf8');
const veil = JSON.parse(src('tools/tests/fixtures/chart-veil.json')).veil;

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const section = (s) => console.log(`- ${s}`);
const meet = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];

/** A 2D context that records nothing but accepts everything (and measures text at 0.52 em a character). */
function fakeCtx() {
  const grad = { addColorStop() {} };
  const t = { measureText(s) { const px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(t.font || '')?.[1] || 13); return { width: String(s).length * px * 0.52 }; },
    createRadialGradient: () => grad, createLinearGradient: () => grad, font: '13px serif' };
  return new Proxy(t, { get: (o, k) => (k in o ? o[k] : typeof k === 'string' ? () => {} : undefined), set: (o, k, v) => { o[k] = v; return true; } });
}
const art = { sheets: CHART_ART.sheets.map((s) => ({ ...s, image: null })), paper: { ...CHART_ART.paper, image: null }, live: CHART_ART.live };
const water = { mossmere: C.waterGeometry(D, 'mossmere') };
const sites = C.placeSites(D, 'mossmere');
function modelFor(state, { tutorial = false, meta = freshLoopMeta(D), pick = null } = {}) {
  const m = U.chartModel(meta, D, { tutorial, slots: 3 });
  m.sheets[0].places = C.chartPlaces(D, state === 'empty' ? [] : C.CHART_FIXTURE(D, state));
  if (pick) m.pick = pick;
  return m;
}
const ctx = fakeCtx();
const viewFor = (w, h) => ({ w, h, dpr: 1, phone: w < 560, F: C.CHART_FONTS, water, sites, fmtWeight: D.fmtWeight, fishGlyph: () => null, words: { soon: D.TEXT_LOOP.comingSoon },
  measure: (t, f) => { ctx.font = f; return ctx.measureText(t).width; } });
const draw = (m, w, h) => CD.drawChart(fakeCtx(), m, art, viewFor(w, h), 0);
// (the phone sheets: 358 px; a 390 x 844 phone's full layout height (612, 552 with Murk's line); Safari with its bars at 390 x 664
// (432, 372 with the line); the CSS floor (364, under which the panel scrolls))
const SIZES = [[358, 560, 'a phone at 358 px'], [354, 612, 'a 390 x 844 phone'], [354, 552, 'a 390 x 844 phone, Murk\'s line over the sheet'],
  [354, 432, 'a 390 x 664 phone (Safari\'s bars)'], [354, 372, 'a 390 x 664 phone, Murk\'s line'], [358, 364, 'a phone at the sheet\'s floor'],
  [892, 326, 'the 960 x 540 desktop'], [920, 420, 'a tall desktop']];

section('the seam: chartModel(meta, D, opts) as M1.md §3.8 has it; next is the sealed sheet');
{
  ok(typeof U.chartModel === 'function' && U.chartModel.length === 2, 'chartModel(meta, D, opts = {}): the one signature');
  const m = U.chartModel(freshLoopMeta(D), D, {});
  ok(JSON.stringify(Object.keys(m)) === JSON.stringify(['sheets', 'next', 'hold', 'fitted', 'pick', 'tutorial']), 'its keys are 1a\'s (sheets, next, hold, fitted, pick, tutorial): no field the plan does not name', Object.keys(m));
  const n = m.next;
  ok(n && n.waterId === 'sporewood' && n.shipped === false && JSON.stringify(Object.keys(n.seals)) === JSON.stringify(['map', 'gear', 'catch']), 'next: {waterId, shipped: false, seals: {map, gear, catch}} (M1.md §3.8): Sporewood, past the last shipped water', n);
  ok(n.seals.map.held === false && n.seals.gear.held === false && n.seals.gear.tier === 1 && n.seals.catch.held === false && n.seals.catch.need === 6 && n.seals.catch.have === 0, 'a fresh save: three hollow seals; the gear is Rod T1, the catch the Mossmere\'s list (0/6)', n.seals);
  const meta = freshLoopMeta(D); meta.loop.tackle.rod = 1;
  for (const id of U.journalModel(meta, D, 'mossmere', { listFor: (await import('../../src/progression-loop.js')).listFor }).list.map((x) => x.id)) meta.journal = { ...meta.journal, [id]: { caught: 1 } };
  const s2 = U.chartNext(meta, D).seals;
  ok(s2.gear.held === true && s2.catch.held === true && s2.catch.have === s2.catch.need && s2.map.held === false, 'the Ashwood bought and the list landed: the gear and catch seals pressed, the map seal still hollow (M1)', s2);
  ok(U.chartModel(freshLoopMeta(D), D, { tutorial: true }).next === null, 'the tutorial\'s Chart: next is null (no wisp, no sealed sheet)');
  const old = freshLoopMeta(D); old.loop.maps.lakes = ['mossmere', 'sporewood'];
  const on = U.chartNext(old, D);
  ok(on?.waterId === 'sporewood' && on.shipped === false && on.seals.map.held === true, 'an old save that owns Sporewood\'s map: Sporewood is still the next sheet, its map seal pressed, "Coming soon"', on);
  ok(U.chartNext({ loop: { maps: { lakes: ['mossmere'] } } }, { ...D, LOOP: { ...D.LOOP, shipped: 'sporewood', waters: { ...D.LOOP.waters, sporewood: { order: 2 } } } })?.shipped === true, 'a water within LOOP.shipped is shipped (no "Coming soon")');
}

section('the tap targets: none overlapping, each at least 44 px (M1.md §3.4)');
for (const [w, h, what] of SIZES) for (const state of ['later', 'three', 'none', 'all']) for (const tutorial of [false, true]) {
  if (tutorial && state !== 'none') continue;
  const L = C.CHART_FIXTURE && CD.layoutChart(modelFor(state, { tutorial }), art, viewFor(w, h));
  const pairs = C.targetOverlaps(L.targets);
  ok(pairs.length === 0, `${what}, ${state}${tutorial ? ' (the tutorial)' : ''}: no two tap targets overlap`, pairs);
  ok(L.targets.every((t) => t.rect[2] >= 44 && t.rect[3] >= 44), `${what}, ${state}: every target ≥ 44 x 44`, L.targets.filter((t) => t.rect[2] < 44 || t.rect[3] < 44).map((t) => t.id));
  ok(L.targets.every((t) => t.rect[0] >= 0 && t.rect[1] >= 0 && t.rect[0] + t.rect[2] <= w + 0.5 && t.rect[1] + t.rect[3] <= h + 0.5), `${what}, ${state}: every target inside the sheet`);
  const water = L.targets.find((t) => t.kind === 'water');
  ok(water?.backdrop && L.targets.filter((t) => t.kind === 'place' || t.kind === 'buy').every((t) => meet(t.rect, water.rect)), `${what}, ${state}: the places sit on their water (the backdrop target)`);
}

section('the phone: every word at 16 px or more (M1.md §2.12); a short phone keeps its lake; choosing moves no other word');
{
  const px = (f) => parseFloat(/(\d+(?:\.\d+)?)px/.exec(f)?.[1] || 0);
  for (const [w, h, what] of SIZES.filter(([w]) => w < 560)) for (const state of ['later', 'three', 'all']) {
    const L = CD.layoutChart(modelFor(state, { pick: { water: 'mossmere', place: 'under_the_span' } }), art, viewFor(w, h));
    const small = L.fonts.filter((f) => px(f) < 16);
    ok(L.fonts.length >= 4 && small.length === 0, `${what}, ${state}: every font the layout letters in is at least 16 px`, small);
    ok([...L.places.flatMap((p) => [p.label?.font, p.sub?.font]), L.sealed?.countFont, L.sealed?.soon?.font, L.cards[0]?.name?.font].filter(Boolean).every((f) => L.fonts.includes(f)), `${what}, ${state}: the layout's font list holds every word's font`);
    ok(!L.fonts.some((f) => /Alegreya/.test(f)), `${what}, ${state}: no word in Alegreya (M1.md §3.1)`, L.fonts);
    const lake = L.cards[0].lake.rect;
    ok(lake[3] >= (h >= 420 ? 200 : 175) && L.cont.h >= 110, `${what}, ${state}: the water's lake keeps its room (${Math.round(lake[3])} px) and the first sheet its (${Math.round(L.cont.h)} px)`);
    ok(L.cont.x >= 0 && L.cont.x + L.cont.w <= w + 0.5 && L.cards.every((c) => c.x >= 0 && c.x + c.w <= w + 0.5 && c.y + c.h <= h + 0.5) && (!L.sealed || (L.sealed.x >= 0 && L.sealed.x + L.sealed.w <= w + 0.5 && L.sealed.y + L.sealed.h <= h + 0.5)), `${what}, ${state}: the first sheet, the water's sheet and the sealed sheet inside the sheet`);
    ok(!L.sealed || !meet([L.sealed.x, L.sealed.y, L.sealed.w, L.sealed.h], [L.cards[0].x, L.cards[0].y, L.cards[0].w, L.cards[0].h]), `${what}, ${state}: the sealed sheet beside the water's sheet, never on it`);
    ok(!L.sealed?.trail || (Math.abs(L.sealed.trail.from[1] - (L.cont.y + L.cont.h)) < 0.5 && L.sealed.trail.from[0] >= L.cont.x && L.sealed.trail.from[0] <= L.cont.x + L.cont.w), `${what}, ${state}: the wisp's trail leaves the first sheet's edge under the road's end`);
    // the chosen place's best-fish line is fitted last: no other word moves when a place is chosen
    const L0 = CD.layoutChart(modelFor(state), art, viewFor(w, h));
    const pos = (X) => X.places.filter((p) => p.id !== 'under_the_span' && p.label).map((p) => [p.id, Math.round(p.label.x), Math.round(p.label.y)]);
    ok(JSON.stringify(pos(L0)) === JSON.stringify(pos(L)) || L.relettered === true, `${what}, ${state}: choosing a place moves no other place's words (unless its best fish found no room: relettered)`, [pos(L0), pos(L)]);
    const boxes = L.places.filter((p) => p.box).map((p) => [p.id, p.box]), clash = [];
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (meet(boxes[i][1], boxes[j][1])) clash.push([boxes[i][0], boxes[j][0]]);
    ok(clash.length === 0, `${what}, ${state}: no two places' words meet`, clash);
    const ch = L.places.find((p) => p.id === 'under_the_span');
    ok(!ch?.owned || !ch.p.best || (ch.sub?.kind === 'best' && px(ch.sub.font) >= 16) || (L.relettered && h < 400), `${what}, ${state}: the chosen place shows its best fish (16 px)`);
  }
  // every phone height from the floor to a tall phone, every state and every choice: no two places' words meet, the chosen place's
  // best fish meets no word or place, each place's words stand by it, no two targets overlap
  let n = 0, bad = [];
  for (const w of [354, 358]) for (let h = 364; h <= 660; h += 8) for (const state of ['later', 'three', 'all']) for (const pick of [null, 'under_the_span', 'lily_maze', 'buoy_lights', 'bell_pool']) {
    const L = CD.layoutChart(modelFor(state, pick ? { pick: { water: 'mossmere', place: pick } } : {}), art, viewFor(w, h));
    const P = L.places.filter((p) => p.box); n++;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (meet(P[i].box, P[j].box)) bad.push([w, h, state, pick, 'words', P[i].id, P[j].id]);
    for (const p of P) { const dx = Math.max(0, Math.abs(p.box[0] + p.box[2] / 2 - p.at[0]) - p.box[2] / 2 - p.size / 2), dy = Math.max(0, Math.abs(p.box[1] + p.box[3] / 2 - p.at[1]) - p.box[3] / 2 - p.size / 2); if (Math.hypot(dx, dy) > 8) bad.push([w, h, state, pick, 'far', p.id]); }
    const c = pick && L.places.find((p) => p.id === pick);
    if (c?.sub && !(c.sub.y >= c.box[1] && c.sub.y <= c.box[1] + c.box[3])) {
      const sb = [c.sub.x - (c.sub.w + 6) / 2, c.sub.y - (c.sub.px + 3) / 2, c.sub.w + 6, c.sub.px + 3];
      if (L.places.some((p) => p.id !== pick && ((p.box && meet(sb, p.box)) || meet(sb, [p.at[0] - p.size / 2, p.at[1] - p.size / 2, p.size, p.size])))) bad.push([w, h, state, pick, 'best']);
    }
    if (C.targetOverlaps(L.targets).length) bad.push([w, h, state, pick, 'targets']);
  }
  ok(bad.length === 0, `${n} phone layouts (354 and 358 px wide, 364 to 660 tall, every state and choice): no words meet, each stands by its place, no targets overlap`, bad.slice(0, 6));
  for (const [w, h, what] of SIZES.filter(([w]) => w >= 560)) {
    const L = CD.layoutChart(modelFor('later'), art, viewFor(w, h));
    ok(!L.fonts.some((f) => /Alegreya/.test(f)) && L.fonts.every((f) => px(f) >= 14), `${what}: every word in IM Fell English or the margin hand, at 14 px or more`, L.fonts);
  }
  const tut = CD.layoutChart(modelFor('none', { tutorial: true }), art, viewFor(354, 372));
  ok(tut.short && !tut.sealed && tut.cont.h >= 150 && tut.cards[0].lake.rect[3] >= 130, 'the tutorial on a 390 x 664 phone: the first sheet stays large (its ink-in is the beat), the lake under it', { cont: tut.cont.h, lake: tut.cards[0].lake.rect[3] });
  ok(!tut.targets.some((t) => t.kind === 'book') && !tut.cards[0].book, 'the tutorial: no book (nothing to read but Murk\'s, M1.md §3.5)');
  ok(CD.layoutChart(modelFor('later'), art, viewFor(354, 612)).targets.some((t) => t.kind === 'book'), 'after the tutorial the catalogue\'s book is on the sheet');
  const marks = [CHART_ART.live.home?.n ?? 0, ...(CHART_ART.live.waters || []).map((x) => x.n)];
  ok(marks.every((n) => typeof C.SHIPPED_VIGNETTES[n] === 'function') && Object.keys(C.SHIPPED_VIGNETTES).length === marks.length, 'every mark the art carries has its vignette, and the game bundles no other (SHIPPED_VIGNETTES)', marks);
  ok(/font: `400 \$\{Math\.max\(17, /.test(src('src/ui-chart.js')) && /CHART_FONTS\.figure/.test(src('src/ui-chart.js')), 'the sealed card\'s catch count: at least 17 px, in the Chart\'s figures');
}

section('nothing unowned drawn; few words; no percentage');
{
  const tut = draw(modelFor('none', { tutorial: true }), 378, 576);
  ok(JSON.stringify(tut.texts) === JSON.stringify(['The Mossmere']), 'the tutorial\'s Chart letters one word: the water\'s name (no price, no wisp, no sealed sheet)', tut.texts);
  ok(!tut.sealed && !tut.targets.some((t) => t.kind === 'sealed' || t.kind === 'buy'), 'the tutorial: no sealed sheet, no priced blot');
  for (const [w, h, what] of SIZES) {
    const L = draw(modelFor('later'), w, h);
    const owned = C.CHART_FIXTURE(D, 'later').filter((p) => p.owned).map((p) => p.name), mist = C.CHART_FIXTURE(D, 'later').filter((p) => !p.owned).map((p) => p.name);
    ok(owned.every((n) => L.texts.includes(n)) && !mist.some((n) => L.texts.includes(n)), `${what}: owned places are named; a mist blot never is`, L.texts);
    ok(!L.texts.some((t) => /sporewood|eastern downs|morning|low horn|never charted/i.test(t)), `${what}: no name of a water not owned`, L.texts);
    ok(!L.texts.some((t) => t.includes('%')), `${what}: no percentage anywhere (none under any fish)`, L.texts);
    const allowed = new Set(['The Mossmere', ...owned, 'Coming soon', '★']);
    const odd = L.texts.filter((t) => !allowed.has(t) && !/^\d[\d,]*$/.test(t) && !/^\d+\/\d+$/.test(t) && !/^(\d+ lb( \d+ oz)?|\d+ oz|[¼½¾] oz)$/.test(t));
    ok(odd.length === 0, `${what}: every word is a name, a price, a weight, the catch count or "Coming soon" (M1.md §3.3)`, odd);
    ok(L.texts.includes('Coming soon') && L.sealed && L.targets.some((t) => t.kind === 'sealed' && t.water === 'sporewood'), `${what}: the sealed sheet with "Coming soon", one tap target`);
    // the later sheet's ground (chart-veil.json, the generator's own masks): no place, card or seal stands on it
    const v = veil.find((q) => q.sheet === 1), c = L.cont;
    const grid = v.rows.map((r) => r.split(',').map((t) => t[0].repeat(Number(t.slice(1)))).join(''));
    const items = [...L.cards.map((k) => ['card', [k.x, k.y, k.w, k.h]]), ...(L.sealed ? [['sealed', [L.sealed.x, L.sealed.y, L.sealed.w, L.sealed.h]]] : []), ...L.targets.filter((t) => !t.backdrop).map((t) => [t.id, t.rect])];
    let hits = [];
    for (let j = 0; j < grid.length; j++) for (let i = 0; i < grid[j].length; i++) {
      if (grid[j][i] !== '1') continue;
      const cell = [c.x + i * c.k, c.y + j * c.k, c.k, c.k];
      for (const [id, r] of items) if (meet(cell, r)) hits.push(id);
    }
    hits = [...new Set(hits)];
    ok(v.cells > 0 && hits.length === 0, `${what}: nothing stands on the later sheet's ground inside the first sheet's frame (${v.cells} cells)`, hits);
  }
}

section("the Chart's case of the three-cards rule (SPEC §5.1 rule 8): only Murk's three blots carry a price or open a card");
for (const [w, h, what] of SIZES) {
  const L = draw(modelFor('three'), w, h);
  const buys = L.targets.filter((t) => t.kind === 'buy').map((t) => t.place).sort();
  ok(JSON.stringify(buys) === JSON.stringify(['buoy_lights', 'under_the_span']), `${what}: the two cheapest place maps open their cards`, buys);
  ok(!L.targets.some((t) => t.place === 'bell_pool'), `${what}: the Bell Pool's blot (500, not among Murk's three) opens nothing`);
  ok(L.texts.includes('150') && L.texts.includes('260') && !L.texts.includes('500'), `${what}: only those two carry a price`, L.texts);
  const all = draw(modelFor('later'), w, h);
  ok(all.places.filter((p) => p.price != null).length === all.targets.filter((t) => t.kind === 'buy').length, `${what}: every priced blot, and no other, is a card's door`);
}

section('the sealed sheet: no price and no buy button; its three seals');
{
  const L = draw(modelFor('later'), 892, 326);
  ok(L.sealed.seals.map((s) => s.key).join() === 'map,gear,catch', 'three seals in the user\'s order: map, gear, catch');
  ok(L.targets.filter((t) => t.kind === 'sealed').length === 1 && !L.targets.some((t) => t.kind === 'buy' && t.water === 'sporewood'), 'one target, the sheet itself: never a buy');
  const numbers = L.texts.filter((t) => /^\d[\d,]*$/.test(t));
  ok(numbers.every((t) => ['260', '500'].includes(t)), 'no price on the sealed sheet (the only prices are the place maps\')', numbers);
  const u = src('src/ui-chart.js'), body = u.slice(u.indexOf('function openSealed('), u.indexOf('function veilCheck('));
  ok(body.length > 400 && /TEXT_LOOP\?\.comingSoon/.test(body) && !/clamTag|price|dataset\.buy|data-buy|L\('buy'/.test(body), 'the sealed card letters "Coming soon" where the price button would be, and has no price and no buy (its source)');
}

section('the byte budget (M1.md §3.2, the spike\'s lines)');
{
  const b64 = (u) => u.slice(u.indexOf(',') + 1), raw = (u) => Buffer.from(b64(u), 'base64').length;
  const sheet = raw(CHART_ART.sheets[0].uri), paper = raw(CHART_ART.paper.uri), live = JSON.stringify(CHART_ART.live).length;
  ok(sheet <= 100_000, `sheet 1: ${sheet} bytes ≤ 100 KB raw`);
  ok(paper <= 6_000, `the paper: ${paper} bytes ≤ 6 KB`);
  ok(live <= 15_000, `the live layer's data: ${live} bytes ≤ 15 KB`);
  const esbuild = await import('esbuild');
  const r = await esbuild.build({ entryPoints: [resolve(root, 'src/main.js')], bundle: true, format: 'esm', target: ['es2020'], minify: true, write: false, metafile: true,
    loader: { '.css': 'text', '.glsl': 'text', '.svg': 'text' }, legalComments: 'none', logLevel: 'silent' });
  const out = Object.values(r.metafile.outputs)[0].inputs;
  const of = (f) => Object.entries(out).filter(([k]) => k.endsWith(f)).reduce((a, [, v]) => a + v.bytesInOutput, 0);
  const code = of('src/chart-draw.js') + of('src/ui-chart.js'), artBytes = of('src/chart-art.js');
  ok(code > 0 && code <= 60_000, `chart-draw.js + ui-chart.js as the game bundles them: ${code} bytes ≤ 60 KB`);
  ok(artBytes > 0 && artBytes + code <= 200_000, `M1's Chart in the built file: ${artBytes} (chart-art.js) + ${code} = ${artBytes + code} bytes ≤ 200 KB`);
}

section('the chart\'s faces before the first paint; the generated art');
{
  ok(/IM\+Fell\+English:ital@0;1/.test(src('src/template.html')), 'the template loads IM Fell English, roman and italic (M1.md §3.1)');
  ok(C.CHART_FONTS.chart.startsWith("'IM Fell English'") && C.CHART_FONTS.figure.startsWith("'IM Fell English'") && C.FONT_FACES.some((f) => /IM Fell English/.test(f)) && !/Alegreya/.test(JSON.stringify([C.CHART_FONTS, C.FONT_FACES])), 'the Chart letters in IM Fell English (its names italic, its figures roman), never in Alegreya', C.CHART_FONTS);
  const u = src('src/ui-chart.js');
  ok(/await Promise\.all\(\[Promise\.all\(A\.sheets\.map[\s\S]*?fonts\]\)/.test(u) && /S\.status = 'ready'/.test(u), 'the art and the faces are both awaited before the Chart is ready (its first paint)');
  ok(/^\/\/ src\/chart-art\.js — generated by `node tools\/world-map\/build\.mjs --game`; never edited by hand/.test(src('src/chart-art.js')) && /Baked in Chromium [\d.]+/.test(src('src/chart-art.js')), 'chart-art.js: generated, never edited by hand; its header records the Chromium version');
  ok(CHART_ART.sheets.every((s) => /^[0-9a-f]{8}$/.test(s.hash) && s.scale === 5.5 && s.w === Math.round(s.box[2] * s.scale)), 'each sheet carries its decoded pixels\' hash, at 5.5 px a unit');
  ok(!/(Sporewood|Glasswater|Pallid|Eastern Downs|Morning Gulf|Low Horn)/.test(JSON.stringify(CHART_ART.live)), 'the live data holds nothing of an unshipped water');
  ok(!/from '\.\/(data|main|ui|core|world|render)/.test(src('src/chart-draw.js')) && !/^import /m.test(src('src/chart-draw.js')), 'chart-draw.js imports nothing (no game import)');
}

console.log(`\nui-chart: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
