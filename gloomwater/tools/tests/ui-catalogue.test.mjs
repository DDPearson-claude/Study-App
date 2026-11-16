// Unit tests for M1 step 3a's screens (docs/loop/m1-step3a/PLAN.md §2.3, lane C): the shelf's map, bait and sealed cards and the
// map card's life-size drawing (T135), the catalogue's page model and layout rules (T136), the hatch's mode and its probe's wiring
// (T137; the pixel probe itself runs in the browser: ctx.debug.ui.hatchProbe, D's scenario), a tap and the routes into the catalogue
// and the shelf (T138), the gold card (T139), the giants' page (T140), and that the loop's fish plans and the hatch are read only under
// the loop (PLAN CHOICE 14). The DOM is the browser scenario's (lane D's loop-3a.scenario.mjs); here the pure models and the source.
//   node tools/tests/ui-catalogue.test.mjs   (or node tools/check.mjs)
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLoopData, freshLoopMeta, placesMeta, fakeLoop } from './loop-fixture.mjs';
import { catalogueFor, sealsOf, listFor } from '../../src/progression-loop.js';

const D = await loadLoopData();
const U = await import('../../src/ui-loop.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const section = (s) => console.log(`- ${s}`);
const TL = D.TEXT_LOOP;
const sp = (id) => D.SPECIES_BY_ID[id];
const NUMBERISH = /\d|%/;

section('T135: the shelf\'s map card, the ball\'s card and the sealed card (SPEC §8.4; the shelf items as the ledger gives them)');
{
  // the items in progression-loop's shelfItems shape (CONTRACT §14.11): a place card, the next water's sealed card, the legend's bait
  const seals = sealsOf(freshLoopMeta(D), D, 'sporewood');
  const shelf = { tabs: [
    { id: 'bait', items: [{ id: 'bait:heartmoss', tab: 'bait', slot: 'bait', level: null, baitId: 'heartmoss', water: 'mossmere', name: 'Heartmoss Ball', goalName: 'Heartmoss Ball', line: TL.shelf.heartmoss, price: 60, count: 2, consumable: true, bought: false }] },
    { id: 'maps', items: [
      { id: 'place:lily_maze', tab: 'maps', slot: 'place', level: null, placeId: 'lily_maze', kind: 'day', name: 'The Lily Maze', goalName: 'The Lily Maze', line: TL.maps.lily_maze, price: 60, fish: 'candlefin_koi', hours: ['sun', 'dusk'], bought: false },
      { id: 'place:under_the_span', tab: 'maps', slot: 'place', level: null, placeId: 'under_the_span', kind: 'old', name: 'Under the Span', goalName: 'Under the Span', line: TL.maps.under_the_span, price: 150, fish: 'thousandcast_pike', hours: ['dusk', 'moon'], bought: false },
      { id: 'lake:sporewood', tab: 'maps', slot: 'lake', level: null, waterId: 'sporewood', name: 'Sporewood', goalName: 'Sporewood', line: '', price: null, sealed: true, seals, bought: false },
    ] },
  ] };
  const M = U.shelfCards(shelf, { D, clams: 100 });
  eq(M.tabs.map((t) => [t.id, t.label]), [['bait', TL.tabs.bait], ['maps', TL.tabs.maps]], 'the Bait and Maps tabs, their words TEXT_LOOP\'s');
  const [lily, span, lake] = M.tabs[1].cards;
  ok(lily.fishName === 'Candlefin Koi' && lily.star === false && lily.line === TL.maps.lily_maze && lily.price === 60 && lily.dear === false && JSON.stringify(lily.hours) === '["sun","dusk"]', 'a map card: its fish\'s name, its hours, its line, its price', lily);
  ok(span.fishName === 'Thousandcast Pike' && span.star === true && span.dear === true, 'a giant\'s card: ★, and the price dimmed when too dear (100 clams < 150)', span);
  ok(lake.sealed === true && lake.price === null && lake.priceText === '' && lake.dear === false && lake.name === '' && lake.seals === seals, 'the sealed card: no price, no name, its seals (sealsOf\'s)', lake);
  const ball = M.tabs[0].cards[0];
  ok(ball.consumable === true && ball.count === 2 && ball.bought === false && ball.buyWord === null && ball.price === 60 && ball.line === TL.shelf.heartmoss, 'the ball: a consumable with its count, never "Yours.", 60, its line', ball);
  ok(U.shelfCards({ tabs: [{ id: 'bait', items: [{ ...shelf.tabs[0].items[0], bought: true }] }] }, { D }).tabs[0].cards[0].bought === false, 'a consumable is never bought');
  for (const c of [lily, span]) ok(!NUMBERISH.test(c.fishName + c.line), `no number in the map card's words (${c.fishName})`);
  ok(TL.maps && Object.values(TL.maps).every((l) => l.split(/\s+/).length <= 8) && TL.shelf.heartmoss.split(/\s+/).length <= 8, 'the four map lines and the ball\'s line ≤ 8 words');
  // the drawing: the fish life-size beside the Wick (one scale), both inside the card's drawing
  for (const id of ['candlefin_koi', 'thousandcast_pike', 'hullkiss_lamprey', 'belled_matriarch']) {
    const A = U.mapArtSizes(D, sp(id));
    ok(near(A.fish.len / A.k, sp(id).size.L50 / 100, 1e-9) && near((A.wick.h * U.MAP_ART.figure) / A.k, D.BALANCE_V3.ceremony.wickHeight, 1e-9), `${id}: the fish at its length and the Wick at its height, one scale`, A);
    ok(A.wick.w + U.MAP_ART.gap + A.fish.w <= U.MAP_ART.w + 1e-6 && A.wick.h <= U.MAP_ART.h + 1e-6 && A.fish.h <= U.MAP_ART.h + 1e-6, `${id}: inside the card's drawing`, A);
  }
  ok(U.mapArtSizes(D, sp('belled_matriarch')).fish.len > 2.5 * U.mapArtSizes(D, sp('belled_matriarch')).wick.h * U.MAP_ART.figure, 'the Matriarch dwarfs the Wick (2.6 m against 0.85 m)');
  const v = src('ui-loop.js');
  ok(/function mapCard\(entry, c\)/.test(v) && /wickPortrait\(/.test(v) && /drawFishInk\(cv, sp, \{ w: Math\.max\(8, Math\.round\(A\.fish\.w\)\)/.test(v), 'the map card draws the Wick\'s portrait and the fish\'s ink drawing at those sizes');
  ok(/function sealedCard\(entry, c\)/.test(v) && /TL\(\)\.comingSoon \|\| 'Coming soon'/.test(v) && !/sealedCard[\s\S]{0,900}data-buy/.test(v.slice(v.indexOf('function sealedCard'), v.indexOf('function sealRow'))), 'the sealed card: "Coming soon" where the price would be, no buy button');
}

section('T136: the catalogue\'s page (SPEC §8.8): the head, the list notched, the groups, all 17 once, no number and no percentage');
{
  const fresh = U.catalogueView(catalogueFor(freshLoopMeta(D), D, 'mossmere'), D);
  ok(fresh.head.name === 'The Mossmere' && fresh.head.count === '0/12' && fresh.head.seals && fresh.head.seals.map.held === false, 'the head: the name, "0/12", Sporewood\'s seals (the map seal hollow)', fresh.head);
  eq(fresh.list.map((c) => c.id), listFor(D, 'mossmere'), 'the list\'s twelve in its order');
  ok(fresh.list.every((c) => c.listed && !c.caught && c.name === '· · ·'), 'every listed card hatched with "· · ·" until caught');
  eq(fresh.groups.map((g) => [g.placeId, g.kind, g.name, g.cards.map((c) => c.id)]), [
    ['under_the_span', 'old', null, ['bridgechain_sturgeon', 'thousandcast_pike']],
    ['buoy_lights', 'night', null, ['hullkiss_lamprey', 'gloam_eel']],
    ['bell_pool', 'crown', null, ['belled_matriarch']],
  ], 'the places\' groups in the Chart\'s order, an unowned heading its glyph alone; no Lily Maze group');
  const all = [...fresh.list, ...fresh.groups.flatMap((g) => g.cards)];
  ok(all.length === 17 && new Set(all.map((c) => c.id)).size === 17, 'all 17 fish, each once');
  // SPEC §8.8's glyph table
  const G = Object.fromEntries(all.map((c) => [c.id, c.glyphs]));
  for (const id of ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'rustfin_sucker', 'weeping_carp', 'kissmark_trout', 'reedjaw_pike']) eq(G[id], ['kind_open'], `${id}: the open-water glyph alone`);
  for (const id of ['likely_chub', 'overbold_bass', 'candlefin_koi']) eq(G[id], ['kind_open', 'sun', 'dusk'], `${id}: open water, day and dusk`);
  eq(G.lampsipper, ['kind_open', 'moon'], 'the Lampsipper: open water, the moon');
  eq(G.milkeye_perch, ['kind_open', 'dusk', 'moon'], 'the Milkeye Perch: open water, dusk and moon');
  eq(G.bridgechain_sturgeon, [], 'the Bridgechain Sturgeon: none (any hour; its heading is its place)');
  eq(G.thousandcast_pike, ['dusk', 'moon'], '★ the Thousandcast Pike: dusk and moon');
  eq(G.hullkiss_lamprey, ['moon'], '★ the Hullkiss Lamprey: the moon');
  eq(G.gloam_eel, ['moon'], 'the Gloam Eel: the moon, no tin (its bait reaches the shelf in step 4)');
  eq(G.belled_matriarch, ['sun', 'dusk', 'mossball'], '★ the Belled Matriarch: day, dusk and the Heartmoss Ball');
  ok(all.filter((c) => c.star).map((c) => c.id).sort().join() === 'belled_matriarch,hullkiss_lamprey,thousandcast_pike', 'the giants and the legend carry ★');
  ok(all.filter((c) => c.edge === 'gold').map((c) => c.id).sort().join() === 'hullkiss_lamprey,thousandcast_pike' && all.filter((c) => c.gold).map((c) => c.id).join() === 'belled_matriarch', 'the giants gold-edged, the Matriarch\'s card gold');
  // a deep scan of every card: no number and no percentage, caught or not
  const half = placesMeta(D, { own: ['bell_pool', 'under_the_span'], caught: ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'likely_chub', 'weeping_carp', 'candlefin_koi', 'reedjaw_pike', 'kissmark_trout', 'thousandcast_pike'] });
  const hv = U.catalogueView(catalogueFor(half, D, 'mossmere'), D);
  const deep = (v, out = []) => { if (typeof v === 'string' || typeof v === 'number') out.push(String(v)); else if (v && typeof v === 'object') Object.values(v).forEach((x) => deep(x, out)); return out; };
  for (const v of [fresh, hv]) ok(![...v.list, ...v.groups.flatMap((g) => g.cards)].some((c) => deep({ name: c.name, glyphs: c.glyphs }).some((t) => NUMBERISH.test(t))), 'no number and no % in any fish card\'s words or glyphs');
  ok(hv.head.count === '8/12' && hv.list.filter((c) => c.caught).length === 8 && hv.list.find((c) => c.id === 'dusk_minnow').name === 'Dusk Minnow', 'a half page: 8/12, the caught ones named');
  ok(hv.groups.find((g) => g.placeId === 'under_the_span').name === 'Under the Span' && hv.groups.find((g) => g.placeId === 'buoy_lights').name === null, 'an owned place\'s heading its name; an unowned one its glyph alone');
  ok(hv.groups.flatMap((g) => g.cards).find((c) => c.id === 'thousandcast_pike').caught === true, 'a caught giant is drawn and named');
  ok(fresh.finds && fresh.finds.rows.map((r) => r.cards.length).join() === '5,3,3' && fresh.finds.rate === '1 bite in 20', 'M1 step 5c: the finds row (five treasures, three parts, three looks, under "Snags · 1 bite in 20")');
  // the layout (SPEC §8.8): six a row at 960 px, three at 358 px; every card and seal a ≥ 44 px target
  const css = src('ui.css');
  ok(/\.gw-loop-on \.gw-cat-grid \{ display: grid; grid-template-columns: repeat\(6, minmax\(0, 1fr\)\);/.test(css) && /@media \(max-width: 700px\) \{[\s\S]*\.gw-loop-on \.gw-cat-grid \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/.test(css), 'six cards a row on a desktop, three on a phone');
  ok(/\.gw-loop-on \.gw-cat-card \{ position: relative; min-height: 112px;/.test(css) && /\.gw-loop-on \.gw-cat-card \{ min-height: 104px;/.test(css) && /\.gw-loop-on \.gw-seal-btn \{ position: relative; width: 48px; min-height: 48px;/.test(css), 'every card and seal at least 44 px');
  const scr = src('ui-screens.js');
  ok(/const catSize = \(\) => \(K\.vw < 700 \? \{ w: 100, h: 54, bw: 200, bh: 108 \} : \{ w: 116, h: 62, bw: 240, bh: 128 \}\);/.test(scr), 'its drawings 116 × 62 (100 × 54 on a phone); the enlarged 240 × 128 (2× on a phone)');
  ok(/odds\.textContent = TL\(\)\.odds \|\| 'Odds (\\u203a|›)';/.test(scr) && /gw-cat-odds/.test(scr), 'Odds › at the foot');
  ok(/if \(loopOn\(\)\) return openCatalogue\(extra\);/.test(scr) && /function openCatalogue\(extra = \{\}\)/.test(scr), 'openJournal is the catalogue under the loop; off the loop the built Journal');
  ok(/zones = arr\(meta\(\)\.loop\?\.maps\?\.lakes\)\.filter\(\(id\) => W\[id\]/.test(scr), 'no tab of an unowned water (only the owned lakes LOOP.waters ships)');
}

section('T137: the hatch (SPEC §8.8, decision 60): a mode of drawFish, read only under the loop; its probe');
{
  const fa = src('ui-fishart.js');
  ok(/const hatch = !!opts\.hatch;/.test(fa) && /const sil = !hatch && !!opts\.silhouette;/.test(fa), 'drawFish(…, {hatch: true}) beside the built silhouette');
  ok(/const key = `\$\{id\}\|\$\{w\}\|\$\{h\}\|\$\{hatch \? 'h' : sil \? 1 : 0\}/.test(fa), 'cached by species, size and mode');
  ok(/export const HATCH = Object\.freeze\(\{ rgb: \[214, 196, 168\], ink: 0\.55, step: 3, line: 0\.75, edge: 1, halo: 2, haloInk: 0\.25 \}\);/.test(fa), '0.75 px lines 3 px apart, a 1 px edge and a 2 px one at 25%, the whole at 55% ink, in the sepia ink');
  const [r, g, b] = [214, 196, 168], mx = Math.max(r, g, b), mn = Math.min(r, g, b), hue = 60 * ((g - b) / (mx - mn));
  ok(hue > 25 && hue < 45 && (mx - mn) / mx < 0.3, `the ink is sepia's hue (${hue.toFixed(1)}°), pale for the night page`);
  ok(/export function hatchProbe\(species, w = 116, h = 62\)/.test(fa) && /ctx\.debug\.ui\.hatchProbe = \(id, w, h\) =>/.test(src('ui.js')), 'ctx.debug.ui.hatchProbe(id, w, h) → {pixels, offHue, maxInk, inner}');
  const scr = src('ui-screens.js');
  const cat = scr.slice(scr.indexOf('function openCatalogue'), scr.indexOf('function openLog'));
  ok(/hatch: true/.test(cat) && !/\{ silhouette: /.test(cat), 'the catalogue draws a missing fish hatched, never the built silhouette');
  const built = scr.slice(scr.indexOf('function openJournal'), scr.indexOf('THE CATALOGUE'));
  ok(!/hatch/.test(built), 'the built Journal never draws the hatch (off the loop the silhouette is untouched)');
  ok(/if \(loopOn\) setLoopArt\(true\);/.test(src('ui.js')) && /const shapeOf = \(shape\) => SHAPES\[shape\] \|\| \(LOOP_ART \? SHAPES_LOOP\[shape\] : null\) \|\| null;/.test(fa)
    && /else if \(LOOP_ART && shape === 'lamprey'\) drawLamprey/.test(fa), 'the loop\'s plans (trout, sturgeon, lamprey) only once setLoopArt(true): off the loop today\'s fallback (PLAN CHOICE 14)');
}

section('T138: a tap, Back, and the routes into the catalogue and the shelf');
{
  const scr = src('ui-screens.js'), v = src('ui-loop.js');
  ok(/if \(c\.caught\) \{ s\.view = 'species'; s\.sel = c\.id;/.test(scr) && /else s\.big = \{ id: c\.id, glyphs: c\.glyphs\.slice\(\), star: c\.star \};/.test(scr), 'a caught fish opens its species page; a missing one enlarges its silhouette with its glyphs');
  ok(/speciesDetail\(sp, s, \{ J, caughtOf, glimpsedOf, JM: null, listed: new Set\(\), loopJ: true \}\)/.test(scr) && /const ob = oddsBlock\(sp, s\.hl\);/.test(scr), 'the species page is the built one, its odds block as built');
  ok(/if \(s\.big\) \{ s\.big = null; entry\.render\(\); return; \}\s*if \(s\.view === 'species'\) \{ s\.view = 'page';/.test(scr) && /big\.addEventListener\('click', \(e\) => \{ e\.stopPropagation\(\); catalogueBack\(entry\); \}\);/.test(scr), 'Back or a tap closes the silhouette, then the species page; Escape the same');
  ok(/key === 'gear'[\s\S]{0,260}tab: 'tackle', focus: sl\.item \|\| 'rod:1'/.test(v) && /onCatch: \(\) => \{ try \{ listEl\.scrollIntoView/.test(scr), 'the head\'s gear seal opens the shelf at Rod T1\'s card; its catch seal scrolls to the list');
  ok(/const zone = zones\.includes\(extra\.zone\) \? extra\.zone/.test(scr) && /from: extra\.from \|\| null/.test(scr), 'openJournal({from: \'chart\', zone: \'mossmere\'}) opens the catalogue on that water\'s tab (Back closes it: the Chart is under it)');
  ok(/const want = \[String\(s\.focus\), `place:\$\{s\.focus\}`\];/.test(v) && /scrollIntoView\(\{ block: 'nearest', inline: 'nearest' \}\)/.test(v), 'openShelf({tab, focus}): the card named (a place id or a card id) in view and focused; another id: the tab at its head');
  ok(/function openShelf\(o = \{\}\)/.test(v) && /tab: opt\.tab \?\? null/.test(v), 'openShelf honours o.tab');
  // the routes' data: sealsOf's seals are what the sealed card and the head draw
  const meta = placesMeta(D, { tackle: { rod: 1, line: 0, reel: 0 } });
  ok(sealsOf(meta, D, 'sporewood').gear.held === true && sealsOf(meta, D, 'sporewood').gear.item === 'rod:1', 'the gear seal is Rod T1\'s card (sealsOf: item rod:1)');
}

section('T139: the gold card (SPEC §8.2, M1.md §2.4)');
{
  const scr = src('ui-screens.js'), css = src('ui.css');
  ok(/gw-cc-loop\$\{fish\.giant === true \|\| sp\.giant === true \? ' gw-cc-giant' : ''\}/.test(scr), 'a giant\'s card is gw-cc-giant');
  ok(/insertAdjacentHTML\('afterbegin', '<i class="gw-cc-star">\\u2605 <\/i>'\)/.test(scr), 'its name reads "★ " before it');
  ok(/\.gw-loop-on \.gw-cc-giant \.gw-cc-seal \.gw-seal-wax \{ fill: #c9973f; \}/.test(css) && /\.gw-cc-giant \.gw-cc-stamp > span \{ color: var\(--gold\) !important;/.test(css), 'its class seal and stamp in gold');
  ok(/cardActions\(\{ clams: p\.clams \?\? safe\(\(\) => ctx\.progression\?\.loop\?\.priceOf\?\.\(fish\), 0\)/.test(scr), 'Keep\'s value is the ledger\'s price (the legend 500 on her first landing, 200 after: priceOf, T38)');
  const acts = U.cardActions({ clams: 500, D });
  ok(acts[0].label === TL.keep && acts[0].clamsText === '500' && acts[1].label === TL.letGo && acts.length === 2, 'Keep · 500 / Let go');
  ok(U.cardActions({ clams: 200, D })[0].clamsText === '200', 'Keep · 200 after');
}

section('T140: the giants\' page (the ★ tab): the Mossmere\'s three, hatched until landed, then gold-framed with the best weight');
{
  const fresh = U.giantsView(freshLoopMeta(D), D, ['mossmere']);
  eq(fresh.map((g) => [g.id, g.caught, g.name, g.weight]), [['thousandcast_pike', false, '· · ·', null], ['hullkiss_lamprey', false, '· · ·', null], ['belled_matriarch', false, '· · ·', null]], 'exactly the three, hatched until landed');
  const m = placesMeta(D, {});
  m.journal.thousandcast_pike = { caught: 1, pbLength: 96 };
  const v = U.giantsView(m, D, ['mossmere']);
  eq(v[0], { id: 'thousandcast_pike', caught: true, name: 'Thousandcast Pike', legend: false, weight: D.fmtWeight(D.fishWeight(sp('thousandcast_pike'), { length: 96 })) }, 'a landed giant: its name and its best weight in pounds');
  ok(v[2].legend === true, 'the Matriarch on it');
  ok(U.giantsView(m, D, ['mossmere']).every((g) => sp(g.id).zone === 'mossmere') && /giantsView\(meta\(\), D\(\), zones\)/.test(src('ui-screens.js')), 'no other water\'s giant (the page reads the owned lakes only)');
  ok(TL.tabs.giants === 'Giants' && /gt\.setAttribute\('aria-label', TLs\.tabs\?\.giants \|\| 'Giants'\)/.test(src('ui-screens.js')), 'the ★ tab: no visible word, its accessible name "Giants" (PLAN CHOICE 25)');
  const scr = src('ui-screens.js');
  ok(/gw-cat-gfil--top/.test(scr) && !/border-radius: 46% \/ 40%/.test(src('ui.css')), 'framed in gold filigree (a crest and a flourish), never a ring');
}

section('flag-off: the screens\' 3a pieces exist only under the loop');
{
  const ui = src('ui.js');
  ok(/if \(loopOn\) \{\s*ctx\.debug\.ui\.chartList/.test(ui), 'the debug hooks only under the loop');
  const css = src('ui.css');
  const block = css.slice(css.indexOf('/* ---------------------------------------------------------------- M1 step 3a (lane C)'), css.indexOf('/* <<< LOOP 1a */'));
  const bare = block.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, '');
  const sels = (bare.match(/(^|\}|\{)\s*([^{}@]+)\{/g) || []).map((x) => x.replace(/^[}{]?\s*/, '').replace(/\{$/, '').trim()).filter((x) => x && !x.startsWith('@'));
  const loose = sels.flatMap((x) => x.split(',')).map((x) => x.trim()).filter((x) => x && !/^\.gw-loop-on |^\.gw-hud\.gw-loop /.test(x));
  ok(sels.length > 60 && loose.length === 0, 'every 3a rule under .gw-loop-on (or the loop HUD)', loose.slice(0, 6));
  const fl = fakeLoop({ D });
  ok(typeof fl.catalogue === 'function' && fl.catalogue('mossmere').list.length === 12, 'the fixture\'s catalogue() is the real catalogueFor');
}

console.log(`\nui-catalogue: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
