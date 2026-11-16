// WC-3 (WATERCRAFT.md §7, §9.4): the lost fish. On a trip nothing names a fish that got away: no got-away note (no toast, no card, no
// queue), one neutral tell glyph for every bite, no class word at the float, no class stamp in the play; the Journal's Glimpsed page,
// the Got away list, the escape, the Elder Log and the gear log's pin are left as they were; the odds block has no Marked and no wound
// line; the Chart's model gives marked false and wounds 0. What the water silently remembers still happens: the giant is marked at its
// place, the legend wounded, Ashwick's comeback stored. With the flag off (and on an expedition) the got-away note still shows.
// No DOM in node: the HUD runs on a small fake DOM (elements are plain objects), progression on the loop-trip harness's fake ctx.
//   node tools/tests/loop-lost.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBus } from '../../src/core.js';
import { create } from '../../src/progression.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const DV3 = await import('../../src/data.js?loop-lost-v3');      // v3 without the loop (an expedition's got-away note)
const { loadLoopData, freshLoopMeta, placesMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-lost' });
const AF = await import('../../src/ui-af.js');
const U = await import('../../src/ui-loop.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const OPEN = 'open:mossmere', SPAN = 'under_the_span', BELL = 'bell_pool';

// ------------------------------------------------------------------ a small fake DOM (enough for createHudV3)
class FakeEl {
  constructor(tag = 'div', cls = '') {
    this.tagName = tag; this.className = cls; this.innerHTML = ''; this.textContent = ''; this.title = ''; this.type = '';
    this.dataset = {}; this.style = { setProperty() {} }; this.children = []; this.attrs = {}; this.kids = new Map(); this.parentNode = null;
    const set = new Set(String(cls).split(/\s+/).filter(Boolean));
    this.classList = { add: (...c) => c.forEach((x) => set.add(x)), remove: (...c) => c.forEach((x) => set.delete(x)), contains: (c) => set.has(c),
      toggle: (c, on) => { const want = on === undefined ? !set.has(c) : !!on; if (want) set.add(c); else set.delete(c); return want; }, set };
    this.offsetWidth = 0; this.offsetHeight = 0;
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c) { return this.appendChild(c); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener() {}
  insertAdjacentHTML(_w, html) { this.innerHTML += html; }
  querySelector(sel) { if (!this.kids.has(sel)) { const k = new FakeEl('div', sel.replace(/^[.#]/, '')); k.parentNode = this; this.kids.set(sel, k); } return this.kids.get(sel); }
  querySelectorAll() { return []; }
  getContext() { return null; }
  /** every text, html, aria-label and title under this node (the page-text scan's stand-in) */
  allText() { return [this.innerHTML, this.textContent, this.title, this.attrs['aria-label'] || '', ...[...this.kids.values(), ...this.children].map((k) => k.allText())].join(' '); }
}
globalThis.document = globalThis.document || { createElementNS: (_ns, tag) => new FakeEl(tag), createElement: (tag) => new FakeEl(tag), fonts: null };

const { createHudV3 } = await import('../../src/ui-hud-v3.js');

/** A HUD on data `data` with a run `run` and a fishing view the test drives. */
function makeHud({ data, run }) {
  const bus = createBus();
  const meta = { seenTips: {}, settings: {}, expeditions: 3 };
  const fishing = { isStub: false, state: 'idle', view: {}, bobberPos: { x: 0, y: 0, z: 5 } };
  const ctx = { bus, fishing, firstEvening: null, combat: null, survival: null };
  const reports = [];
  let noteCalls = 0;
  const h = (tag, cls = '', html = '') => { const e = new FakeEl(tag, cls); e.innerHTML = html; return e; };
  const K = {
    ctx, D: () => data, run: () => run, h,
    num: (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d), arr: (v) => (Array.isArray(v) ? v : []),
    safe: (f, d) => { try { return f(); } catch { return d; } }, stat: () => 5, esc: (s) => String(s ?? ''),
    settings: () => meta.settings, meta: () => meta, sfx() {}, report: (w, e) => reports.push(`${w}: ${e?.message || e}`),
    speciesData: (id) => data.SPECIES_BY_ID?.[id] || null, openLog: () => true, vw: 1280, vh: 720,
    project: () => ({ ok: true, behind: false, x: 640, y: 400 }), stats: () => ({ hookWindow: 1 }), phaseInfo: () => ({ phase: 'calm' }),
    rarityCss: () => '#fff', measure: null,
  };
  const last = new Map();
  const w = {
    setText(n, k, v) { if (last.get(k) !== v) { last.set(k, v); n.textContent = v; } },
    setStyle(n, k, p, v) { if (last.get(k) !== v) { last.set(k, v); n.style[p] = v; } },
    setVar() {}, toggle(n, k, c, on) { n.classList.toggle(c, !!on); }, restartAnim(n, c) { n.classList.remove(c); n.classList.add(c); },
  };
  const el = new FakeEl('div', 'gw-hud');
  const clockWrap = new FakeEl('div');
  const R = { cluster: new FakeEl(), clock: clockWrap.appendChild(new FakeEl()), level: new FakeEl(), fishui: new FakeEl(), bite: new FakeEl(), burn: new FakeEl() };
  // count gotAwayNote's calls through the module the HUD imported (ui-af is an ES module: its export is read-only, so the HUD's
  // own path is watched instead: the note's text lands in the toast or the card, and the debug() view says which)
  const hud = createHudV3(K, el, R, w);
  hud.frame(run, 0.016);
  return { hud, bus, ctx, fishing, el, R, reports, meta, count: () => noteCalls, text: () => el.allText() + R.fishui.allText() };
}
const names = Object.values(D.SPECIES_BY_ID || {}).map((s) => s?.name).filter(Boolean);
const CLASS_WORDS = ['Small', 'Keeper', 'Prize', 'Trophy', 'Elder', 'Ancient', 'Legend'];
const LOSSES = [
  { speciesId: 'dusk_minnow', sizeClass: 'small', z: -1, approxLength: 12, reason: 'spat' },
  { speciesId: 'mossback_perch', sizeClass: 'keeper', z: 0, approxLength: 22, reason: 'thrown' },
  { speciesId: 'weeping_carp', sizeClass: 'prize', z: 1.2, approxLength: 60, reason: 'snapped' },
  { speciesId: 'reedjaw_pike', sizeClass: 'trophy', z: 2.1, approxLength: 90, reason: 'thrown' },
  { speciesId: 'reedjaw_pike', sizeClass: 'elder', z: 2.8, approxLength: 120, reason: 'snapped', markedFish: true },
  { speciesId: 'thousandcast_pike', sizeClass: 'keeper', z: 0.3, approxLength: 70, reason: 'thrown', place: SPAN, markedFish: true },
  { speciesId: 'belled_matriarch', sizeClass: null, z: 0, approxLength: 130, reason: 'thrown', place: BELL, legendary: true },
];

section('the HUD on a trip: showGotAway is a no-op; fish:escaped queues nothing; the tell is one glyph; no class word or stamp');
{
  const trip = { id: 't1', outing: 'trip', nightMode: 'still', day: 1, zone: 'mossmere', oil: 100, hp: 5, phase: 'calm' };
  const H = makeHud({ data: D, run: trip });
  for (const p of LOSSES) {
    H.hud.showGotAway({ ...p, zone: 'mossmere' });
    ok(H.hud.debug().note === null && H.hud.noteUp === false, `showGotAway on a trip shows nothing (${p.sizeClass || 'legend'} ${p.speciesId})`);
    H.bus.emit('fish:escaped', { ...p, zone: 'mossmere' });
    H.hud.update(0.1); H.hud.update(0.1);
    ok(H.hud.debug().note === null && H.hud.noteUp === false, `fish:escaped on a trip queues no note (${p.sizeClass || 'legend'})`);
  }
  const t = H.text();
  const hits = AF.leakScan(t, { names, words: CLASS_WORDS });
  eq(hits, [], 'the HUD\'s text after every loss names no species, class or weight');
  // the bite's tell: one neutral glyph (plunge) for every class's tell, no class word under it
  const tellEl = H.R.fishui.children.find((c) => c.className === 'gw-tell');
  const svg = tellEl.querySelector('svg'), words = tellEl.querySelector('.gw-tell-w');
  const PLUNGE = svg && (() => { H.fishing.state = 'waiting'; H.fishing.view = { biteTell: 'plunge' }; H.hud.fishing(0.016); return svg.innerHTML; })();
  for (const id of ['doublePop', 'plunge', 'dragUnder', 'flatSlide', 'dome']) {
    H.fishing.state = 'idle'; H.fishing.view = {}; H.hud.fishing(0.016);   // between bites the tell is cleared
    H.fishing.state = 'waiting'; H.fishing.view = { biteTell: id }; H.hud.fishing(0.016);
    ok(tellEl.classList.contains('gw-on') && tellEl.dataset.tell === 'plunge' && svg.innerHTML === PLUNGE, `the ${id} tell shows the plunge glyph on a trip`, tellEl.dataset);
    ok(words.innerHTML === '' && !CLASS_WORDS.some((c) => words.innerHTML.includes(c)), `no class word beside the ${id} tell`);
  }
  // the play: no class stamp even when fishing names the class (view.estimate / view.sizeClass)
  const playEl = H.R.fishui.children.find((c) => c.className === 'gw-play');
  const est = playEl.querySelector('.gw-play-est');
  for (const c of ['small', 'keeper', 'prize', 'trophy', 'elder']) {
    H.fishing.state = 'reeling'; H.fishing.view = { estimate: c, sizeClass: c }; H.hud.fishing(0.016);
    ok(H.hud.debug().estimate === null && est.innerHTML === '', `no ${c} stamp in the play on a trip`);
  }
  eq(H.reports, [], 'no HUD errors');
}

section('the HUD off a trip: the flag-off-style got-away note still shows (an expedition on v3 data, and the loop build at home)');
{
  const exp = { id: 'e1', outing: 'normal', nightMode: 'still', day: 1, zone: 'mossmere', oil: 100, hp: 5, phase: 'calm', expedition: true };
  const H = makeHud({ data: DV3, run: exp });
  H.hud.showGotAway({ speciesId: 'dusk_minnow', sizeClass: 'small', approxLength: 12, reason: 'spat' });
  ok(H.hud.debug().note?.mode === 'toast', 'an expedition: a Small loss is the toast', H.hud.debug());
  H.hud.showGotAway({ speciesId: 'reedjaw_pike', sizeClass: 'trophy', approxLength: 90, reason: 'thrown' });
  ok(H.hud.debug().note?.mode === 'card', 'an expedition: a Trophy loss is the card');
  H.hud.update(10);
  H.bus.emit('fish:escaped', { speciesId: 'weeping_carp', sizeClass: 'prize', approxLength: 60, reason: 'snapped' });
  H.hud.update(0.016);
  ok(H.hud.debug().note?.mode === 'toast', 'an expedition: fish:escaped queues the note and it shows');
  // the tell keeps its class glyph and word off a trip
  const tellEl = H.R.fishui.children.find((c) => c.className === 'gw-tell');
  H.fishing.state = 'waiting'; H.fishing.view = { biteTell: 'dome' }; H.hud.fishing(0.016);
  ok(tellEl.dataset.tell === 'dome', 'an expedition: the dome tell keeps its own glyph');
  ok(/Elder/.test(tellEl.querySelector('.gw-tell-w').innerHTML), 'an expedition: the first dome names its class');
  eq(H.reports, [], 'no HUD errors');
}

// ------------------------------------------------------------------ progression on the loop-trip harness
function makeEnv({ data = D, meta = freshLoopMeta(D) } = {}) {
  const bus = createBus();
  const events = [];
  const ctx = {
    THREE, bus, data, state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {},
    core: { debugEnabled: () => false }, game: { save() {} },
    survival: { getPhaseInfo: () => ({ phase: 'calm', day: 1, time: 0, duration: 40, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp() {} }, fishing: { state: 'idle', spots: [], signs: [], addSpots() {}, armChum() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  ctx.progression = create(ctx);
  ctx.progression.init();
  return { ctx, events, P: ctx.progression, L: ctx.progression.loop, count: (e) => events.filter((x) => x.evt === e).length };
}
function startTrip(env, { character = null } = {}) {
  const r = env.P.createRun({ startZone: 'mossmere', character, nightMode: 'still', outing: 'trip' });
  env.ctx.state.run = r; env.ctx.flow = 'playing';
  env.ctx.bus.emit('zone:change', { zone: r.zone, prev: null, sail: true });
  env.ctx.bus.emit('run:start', { continued: false });
  return r;
}
const bite = (env, key = OPEN) => env.ctx.bus.emit('fishing:bite', { sizeClass: 'keeper', biteTell: 'plunge', waterKey: key });
const lose = (env, p, key = p.place || OPEN) => {
  bite(env, key);
  env.ctx.bus.emit('fishing:escaped', { reason: p.reason, sizeClass: p.sizeClass });
  env.ctx.bus.emit('fish:escaped', { zone: 'mossmere', place: null, markedFish: false, ...p });
};
const shown = (meta, run) => clone({ journal: meta.journal, elderLog: meta.elderLog ?? null, lastAway: meta.lastAway ?? null, gotAway: run?.flags?.gotAway ?? null });

section('progression on a trip: the loss writes nothing a screen shows (each class, the legend, a giant at its place)');
{
  const meta = placesMeta(D, { own: [SPAN, BELL], balls: 3 });
  const env = makeEnv({ meta });
  const r = startTrip(env);
  const before = shown(meta, r);
  for (const p of LOSSES) lose(env, p);
  const after = shown(meta, r);
  eq(after.journal, before.journal, 'the Journal is unchanged: no Glimpsed page (seen), no Got away list, no escape');
  ok(Object.values(meta.journal || {}).every((e) => !e?.seen && !e?.gotAway && !e?.escape), 'no journal entry carries seen, gotAway or escape');
  eq(after.elderLog, before.elderLog, 'the Elder Log is unchanged (no "still out there" name)');
  eq(after.lastAway, before.lastAway, 'the gear log\'s pin (m.lastAway) is unchanged');
  eq(after.gotAway, before.gotAway, 'the run\'s got-away lines (run.flags.gotAway) are unchanged');
  eq(env.count('journal:seen'), 0, 'no journal:seen');
  eq(env.P.gotAwayLines?.(r) ?? [], [], 'the summary\'s got-away lines are empty');
  // what the water remembers, silently
  ok(meta.loop.giants?.thousandcast_pike?.marked === 1, 'the giant lost at its place is marked (progression-loop, as built)');
  ok((meta.legendWounds?.belled_matriarch | 0) === 1, 'the legend is wounded once (as built)', meta.legendWounds);
  ok((meta.markedFish || []).some((m) => m.speciesId === 'reedjaw_pike' && m.name === null), 'the Elder Reedjaw is a Marked Fish, with no name', meta.markedFish);
  ok(env.count('fish:escaped') === LOSSES.length, 'fish:escaped keeps its payload on the bus (progression needs it)');
  eq(env.ctx.errors, [], 'no errors');
  // the Chart: no ripple, no nick (the save keeps both)
  const places = U.chartModel(meta, D, {}).sheets[0].places, by = Object.fromEntries(places.map((p) => [p.id, p]));
  ok(by[SPAN].marked === false && by[BELL].wounds === 0, 'chartModel: marked false and wounds 0 after a giant loss and a Matriarch loss', [by[SPAN], by[BELL]]);
  // the odds block: the cells stay true, no Marked line, no wound line
  const res = env.P.getOdds('reedjaw_pike');
  const mres = { ...(res || {}), known: 'caught', odds: res?.odds || { keeper: 0.5 }, marked: [{ name: 'Old Ninefin', sizeClass: 'elder', approxLength: 120, p: 0.2 }], wounds: 2 };
  const v = AF.oddsView(D, mres, { speciesName: 'Reedjaw Pike', species: D.SPECIES_BY_ID.reedjaw_pike });
  ok(v.marked.length === 0 && v.wounds === '' && v.cells.length > 0 && v.cells.some((c) => /%/.test(c.text)), 'oddsView under the loop: no Marked line, no wound line, the cells stay', v);
  const lv = AF.oddsView(D, { known: 'caught', odds: { legend: 0.3 }, wounds: 2 }, { speciesName: 'The Belled Matriarch' });
  ok(lv.wounds === '' && lv.cells[0].text.includes('%'), 'the Matriarch\'s odds under the loop: her cell, no "Wounded twice"');
  const off = AF.oddsView(DV3, mres, { speciesName: 'Reedjaw Pike', species: DV3.SPECIES_BY_ID.reedjaw_pike });
  ok(off.marked.length === 1 && /Wounded twice/.test(off.wounds), 'off the loop the Marked line and the wound line stay', off);
}

section('Ashwick on a trip: the comeback is stored, silently');
{
  const meta = freshLoopMeta(D); meta.loop.wick = 'ashwick';
  const env = makeEnv({ meta });
  const r = startTrip(env);
  const before = shown(meta, r);
  lose(env, { speciesId: 'reedjaw_pike', sizeClass: 'prize', z: 1.4, approxLength: 70, reason: 'thrown' });
  ok(r.comeback?.speciesId === 'reedjaw_pike' && r.comeback.z === 1.4, 'Ashwick\'s comeback is stored (progression-loop, as built)', r.comeback);
  eq(shown(meta, r), before, 'and nothing a screen shows was written');
  ok(!(meta.markedFish || []).length, 'the comeback is not also marked');
  eq(env.ctx.errors, [], 'no errors');
}

section('off a trip (the v3 expedition path) the built Journal path is unchanged');
{
  const meta = freshLoopMeta(DV3);
  const env = makeEnv({ data: DV3, meta });
  const r = env.P.createRun({ startZone: 'mossmere', nightMode: 'still', outing: 'normal' });
  env.ctx.state.run = r; env.ctx.bus.emit('zone:change', { zone: r.zone, prev: null }); env.ctx.bus.emit('run:start', { continued: false });
  env.ctx.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', sizeClass: 'trophy', z: 2.1, approxLength: 90, reason: 'thrown', zone: 'mossmere' });
  const e = meta.journal?.reedjaw_pike;
  ok(e?.seen === true && e.gotAway?.length === 1 && meta.lastAway?.speciesId === 'reedjaw_pike' && env.count('journal:seen') === 1, 'an expedition: Glimpsed, the Got away list, the pin and journal:seen', { e, lastAway: meta.lastAway });
}

section('static: the seams (no screen reads fish:escaped on a trip; the flag-off paths kept)');
{
  const hud = src('ui-hud-v3.js');
  ok(/function showGotAway\(p\) \{\n\s+if \(trip\(\)\) return;/.test(hud), 'showGotAway returns at once on a trip');
  ok(/onAf\('fish:escaped', \(p\) => \{ if \(!trip\(\)\) nmQ\.push/.test(hud), 'the HUD queues fish:escaped only off a trip');
  ok(/gotAwayNote\(/.test(hud) && hud.indexOf('if (trip()) return;') < hud.indexOf('const N = noteOf(p);'), 'gotAwayNote is only reached past the trip guard');
  const scr = src('ui-screens.js');
  ok(/if \(af\(\) && !loopOn\(\)\) det\.insertAdjacentHTML\('beforeend', gotAwayBlock/.test(scr), 'the Got away list is not drawn under the loop');
  // every fish:escaped listener in src/: progression (the ledger), audio (the sting), first-evening (the Landing), the HUD (guarded)
  const files = ['ui.js', 'ui-hud.js', 'ui-loop.js', 'ui-screens.js', 'ui-chart.js', 'ui-gear.js', 'ui-measure.js', 'ui-v3.js', 'ui-intro.js'];
  for (const f of files) {
    let t = ''; try { t = src(f); } catch { continue; }
    const uses = [...t.matchAll(/on\(\s*'fish:escaped'\s*,\s*\(([^)]*)\)/g)].map((m) => m[1].trim());
    ok(uses.every((a) => a === ''), `${f}: a fish:escaped listener reads no payload`, uses);
  }
  const contract = readFileSync(resolve(here, '../../CONTRACT.md'), 'utf8');
  ok(/on a trip[^\n]*no screen[^\n]*fish:escaped|fish:escaped[^\n]*on a trip[^\n]*no screen/i.test(contract), 'CONTRACT §13.5 notes that on a trip no screen consumes fish:escaped');
}

console.log(`\nloop-lost: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
