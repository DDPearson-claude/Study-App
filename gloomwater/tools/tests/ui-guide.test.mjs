// Unit tests for the first-play guide (src/ui-guide.js; the user's ask of 17 November 2026): the words (TEXT_LOOP.guide: ten boxes,
// each ≤ 30 words and ≤ 3 sentences, no number, on the allow-list), each box once at its trigger along a first play, never during a
// bite, the strike gauge, the show or a lift, the queue (two due together come one after the other), Skip the guide, Settings off and
// on, Replay, the save's default (on for a new save, off for one that has landed a fish), the page switch (?guide=0|1, GW_GUIDE), the
// card's place (inside the screen, never over its target, at the user's phone and desktop sizes), and nothing off the loop.
//   node tools/tests/ui-guide.test.mjs   (or node tools/check.mjs)
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultMeta } from '../../src/core.js';
import { loadLoopData } from './loop-fixture.mjs';

const D = await loadLoopData();
const G = await import('../../src/ui-guide.js');
const U = await import('../../src/ui-loop.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');
const { GUIDE_ORDER, GUIDE_WAIT, GUIDE_TARGETS, guideSwitch, landedAny, guideRecord, guideWords, guideCond, createGuide, guidePlace, GUIDE_CSS } = G;

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const section = (s) => console.log(`- ${s}`);

section('the words: ten boxes in plain English, short');
{
  const TG = D.TEXT_LOOP.guide;
  ok(!!TG && TG.tag === 'Guide' && TG.ok === 'Got it' && TG.skip === 'Skip the guide', 'the card\'s own words: Guide, Got it, Skip the guide', TG && [TG.tag, TG.ok, TG.skip]);
  ok(GUIDE_ORDER.length === 10 && Object.keys(TG.boxes).sort().join() === [...GUIDE_ORDER].sort().join(), 'one box for each id in GUIDE_ORDER', Object.keys(TG.boxes));
  const allowed = U.allowedWords(D);
  for (const id of GUIDE_ORDER) {
    const t = guideWords(D, id).text, words = t.trim().split(/\s+/).length, sentences = (t.match(/[.!?](\s|$)/g) || []).length;
    ok(t.length > 0 && words <= 30, `${id}: ≤ 30 words (${words})`, t);
    ok(sentences >= 1 && sentences <= 3, `${id}: 1–3 short sentences (${sentences})`, t);
    ok(!/\d|%/.test(t), `${id}: no number and no percentage (odds live only in the logs)`, t);
    ok(U.textAllowed(t, { D, words: allowed }), `${id}: on the screens' allow-list`, t);
    ok(!/shells?|memories|descent/i.test(t), `${id}: none of the old run's words`, t);
  }
  for (const [k, v] of Object.entries(TG.settings)) ok(typeof v === 'string' && v.length > 0 && U.textAllowed(v, { D, words: allowed }), `settings.${k}: a word on the allow-list`, v);
  ok(guideWords(D, 'nope').text === '' && guideWords({}, 'welcome').ok === 'Got it', 'an unknown id has no words; the card\'s own words fall back');
  ok(/HOME/.test(TG.boxes.home) && /SAIL/.test(TG.boxes.chart) && /MURK/.test(TG.boxes.murk), 'the boxes name the buttons as the screen shows them (HOME, SAIL, MURK)');
  ok(/worms/i.test(TG.boxes.tackle) && /spoon/i.test(TG.boxes.tackle) && /bait/i.test(TG.boxes.tackle) && /lure/i.test(TG.boxes.tackle), 'tackle: the start kit\'s worms (bait) and spoon (a lure), GEAR-GATES §2.1');
  ok(/too big for your gear/i.test(TG.boxes.away), 'away: a fish too big for the gear (GEAR-GATES §4.2)');
}

section('the save: meta.guide, on for a new save, off for a save that has landed a fish');
{
  const fresh = defaultMeta();
  const r = guideRecord(fresh);
  ok(r.on === true && Object.keys(r.seen).length === 0 && fresh.guide === r, 'a new save: on, nothing seen, written to meta.guide', fresh.guide);
  const old = { ...defaultMeta(), journal: { dusk_minnow: { caught: 2, biggest: 0.2 } } };
  ok(landedAny(old) && guideRecord(old).on === false, 'an old save with a fish in the Journal: off', old.guide);
  const old2 = { ...defaultMeta(), totalFish: 4 };
  ok(guideRecord(old2).on === false, 'an old save that counted a fish: off');
  const noFish = { ...defaultMeta(), journal: { dusk_minnow: { caught: 0 } }, loop: { evenings: 1 } };
  ok(guideRecord(noFish).on === true, 'a save that has never landed a fish: on');
  const kept = { ...defaultMeta(), journal: { x: { caught: 9 } }, guide: { on: true, seen: { welcome: true } } };
  ok(guideRecord(kept).on === true && kept.guide.seen.welcome === true, 'a record already there is kept (a new save that has since landed fish stays on)');
  const bad = { guide: { on: 'yes', seen: null } };
  const rb = guideRecord(bad);
  ok(rb.on === true && typeof rb.seen === 'object', 'a damaged record is mended');
  ok(guideRecord(null).on === false, 'no meta: off');
}

section('the page switch: ?guide=0|1 wins over a preset GW_GUIDE');
{
  ok(guideSwitch({ location: { search: '?loop=1&guide=0' } }) === false, '?guide=0 → off');
  ok(guideSwitch({ location: { search: '?guide=1' } }) === true, '?guide=1 → on');
  ok(guideSwitch({ location: { search: '?guide' } }) === true, '?guide → on');
  ok(guideSwitch({ location: { search: '?guide=1' }, GW_GUIDE: false }) === true, 'the URL wins over the scenario runner\'s preset');
  ok(guideSwitch({ location: { search: '' }, GW_GUIDE: false }) === false, 'the runner\'s preset alone → off');
  ok(guideSwitch({ location: { search: '?loop=1' } }) === null && guideSwitch({}) === null, 'nothing set → the save decides');
}

// a first play, as the frames would see it
const base = { flow: 'home', top: null, trip: false, paused: false, fish: 'idle', tell: false, gauge: false, inShow: false, measuring: false,
  cinematic: false, lifting: false, casts: 0, holdFull: false, evenings: 0, towPhase: null, away: false, tin: true };
const at = (o) => ({ ...base, ...o });
const water = (o) => at({ flow: 'playing', trip: true, ...o });
/** Hold `s` for `secs` in 0.05 s frames; → the first id the machine shows (opened at once), or null. */
function run(M, s, secs = 3) {
  for (let t = 0; t < secs; t += 0.05) { const id = M.step(s, 0.05); if (id) { M.open(id); return id; } }
  return null;
}

section('each box once, at its moment, along a first play');
{
  const meta = defaultMeta();
  const M = createGuide({ record: () => guideRecord(meta) });
  const shown = [];
  const go = (s, want, what) => { const id = run(M, s); ok(id === want, `${what}: ${want ?? 'nothing'}`, { got: id, held: M.held }); if (id) { shown.push(id); M.close(); } };
  go(at({ top: 'tow', towPhase: 'dipOut' }), null, 'the ink dip after the film');
  go(at({ top: 'tow', towPhase: 'arrive' }), 'welcome', 'the Landing on the Chart (the tow waits under it)');
  go(at({ top: 'tow', towPhase: 'wake' }), null, 'Murk\'s wake line (the welcome is not said beside it)');
  go(at({ top: 'chart' }), 'chart', 'the Chart at the mooring');
  go(at({ flow: 'home', top: null }), null, 'the glide out');
  go(water({ fish: 'idle' }), 'cast', 'on the water, before the first cast');
  go(water({ fish: 'charging' }), null, 'the press on the water');
  go(water({ fish: 'waiting', casts: 1 }), 'bite', 'the float settled, before the first bite');
  go(water({ fish: 'bite', casts: 1 }), null, 'the bite');
  go(water({ fish: 'waiting', casts: 1, gauge: true }), null, 'the strike gauge');
  go(water({ fish: 'reeling', casts: 1 }), 'fight', 'the first hook (the play waits under it)');
  go(water({ fish: 'landing', casts: 1, inShow: true, cinematic: true }), null, 'the reveal and the show');
  go(water({ top: 'catch', fish: 'landing', casts: 1, inShow: true, measuring: true }), null, 'the show holding the screen before the card');
  go(water({ top: 'catch', fish: 'landing', casts: 1, inShow: true }), 'card', 'the first catch card');
  go(water({ fish: 'idle', casts: 1 }), 'tackle', 'the line back after the first cast');
  go(water({ fish: 'idle', casts: 3, holdFull: true }), 'home', 'the hold full');
  go(at({ flow: 'home', top: 'tally', evenings: 1 }), null, 'Murk\'s tally');
  go(at({ flow: 'home', top: 'jetty', evenings: 1 }), 'murk', 'home after the first trip');
  go(water({ fish: 'lost', casts: 4, away: true }), null, 'a fish got away: the line still coming in');
  go(water({ fish: 'idle', casts: 4, away: true }), 'away', 'a fish got away: the line back');
  ok(shown.join() === GUIDE_ORDER.join(), 'all ten, in order', shown);
  ok(GUIDE_ORDER.every((id) => meta.guide.seen[id] === true), 'each recorded seen in meta.guide.seen');
  // a second evening: the same moments show nothing
  const again = [at({ top: 'tow', towPhase: 'arrive' }), at({ top: 'chart' }), water({}), water({ fish: 'waiting', casts: 1 }), water({ fish: 'reeling', casts: 1 }),
    water({ top: 'catch', casts: 1 }), water({ casts: 1, holdFull: true }), at({ top: 'jetty', evenings: 2 }), water({ casts: 2, away: true })];
  ok(again.every((s) => run(M, s) === null), 'never again once seen');
}

section('the waits: a moment must hold, calm, for its wait');
{
  const M = createGuide({ record: () => ({ on: true, seen: {} }) });
  const s = water({ fish: 'waiting', casts: 1 });
  let id = null;
  for (let t = 0; t < GUIDE_WAIT.bite - 0.1; t += 0.05) id = id || M.step(s, 0.05);
  ok(id === null, 'not before its wait (the float settles first)');
  M.step(water({ fish: 'waiting', casts: 1, tell: true }), 0.05);   // the bite's tell begins: the moment breaks
  id = null;
  for (let t = 0; t < GUIDE_WAIT.bite - 0.1; t += 0.05) id = id || M.step(s, 0.05);
  ok(id === null, 'a broken moment starts its wait again');
  ok(run(M, s) === 'bite', 'then it shows');
  ok(GUIDE_WAIT.card >= 1.2, 'the card\'s box waits for the count-up and the stamp', GUIDE_WAIT.card);
}

section('never in a bite, the strike, the show, a lift, a pause or under another screen');
{
  const busy = [{ fish: 'bite' }, { tell: true }, { gauge: true }, { inShow: true }, { cinematic: true }, { lifting: true }, { paused: true }, { top: 'pause' }, { top: 'tackle' }, { measuring: true }];
  for (const id of ['cast', 'bite', 'tackle', 'home', 'away']) {
    const okState = { cast: { fish: 'idle' }, bite: { fish: 'waiting', casts: 1 }, tackle: { fish: 'idle', casts: 1 }, home: { fish: 'idle', holdFull: true }, away: { fish: 'idle', away: true } }[id];
    ok(guideCond(id, water(okState)), `${id}: due when calm`);
    for (const b of busy) ok(!guideCond(id, water({ ...okState, ...b })), `${id}: not with ${JSON.stringify(b)}`);
  }
  for (const b of [{ gauge: true }, { inShow: true }, { cinematic: true }, { top: 'pause' }]) ok(!guideCond('fight', water({ fish: 'reeling', ...b })), `fight: not with ${JSON.stringify(b)}`);
  ok(!guideCond('card', water({ top: 'catch', measuring: true })), 'card: not while the show holds the screen');
  ok(!guideCond('welcome', at({ flow: 'title', top: 'title' })) && !guideCond('welcome', at({ flow: 'intro', top: null })), 'welcome: not on the title or in the film');
  ok(!guideCond('tackle', water({ fish: 'idle', casts: 1, tin: false })), 'tackle: only once the tin is on screen');
  ok(!guideCond('murk', at({ top: 'jetty', evenings: 0 })), 'murk: only after a trip');
}

section('the queue: two due together come one after the other');
{
  const rec = { on: true, seen: {} };
  const M = createGuide({ record: () => rec });
  const s = at({ top: 'chart' });   // a reload past the Landing: the welcome and the Chart fall due together
  ok(guideCond('welcome', s) && guideCond('chart', s), 'both are due on the Chart');
  ok(run(M, s) === 'welcome', 'the welcome first');
  ok(M.step(s, 1) === null, 'nothing while a box is open');
  M.close();
  ok(M.step(s, 0.05) === null, 'the next waits its own wait after the close');
  ok(run(M, s) === 'chart', 'then the Chart');
  M.close();
  ok(run(M, s) === null, 'and nothing more');
}

section('Skip the guide, Settings off and on, Replay');
{
  const meta = defaultMeta();
  const M = createGuide({ record: () => guideRecord(meta) });
  ok(run(M, at({ top: 'tow', towPhase: 'arrive' })) === 'welcome', 'the welcome');
  M.skip();
  ok(meta.guide.on === false, 'Skip the guide turns it off (saved)');
  ok([at({ top: 'chart' }), water({}), water({ fish: 'waiting', casts: 1 })].every((s) => run(M, s) === null), 'nothing more after a skip');
  M.setOn(true);
  ok(run(M, at({ top: 'chart' })) === 'chart', 'Guide tips on again: the next unseen box');
  M.close();
  M.setOn(false);
  ok(run(M, water({})) === null, 'Guide tips off: nothing');
  M.replay();
  ok(meta.guide.on === true && Object.keys(meta.guide.seen).length === 0, 'Replay guide: on, nothing seen');
  ok(run(M, at({ top: 'jetty' })) === 'welcome', 'after a replay the welcome comes again at home');
  M.close();
  const off = createGuide({ record: () => ({ on: true, seen: {} }), force: false });
  ok(run(off, at({ top: 'tow', towPhase: 'arrive' })) === null && off.isOn() === false, '?guide=0: nothing, whatever the save says');
  const onF = createGuide({ record: () => ({ on: false, seen: {} }), force: true });
  ok(run(onF, at({ top: 'tow', towPhase: 'arrive' })) === 'welcome', '?guide=1: shows on a save with it off');
  const oldMeta = { ...defaultMeta(), journal: { a: { caught: 1 } } };
  const Mo = createGuide({ record: () => guideRecord(oldMeta) });
  ok(run(Mo, at({ top: 'jetty', evenings: 3 })) === null, 'an old save that has landed fish sees none');
}

section('the card\'s place: inside the screen, beside its target, never over it');
{
  const sizes = [[690, 760], [900, 1000], [390, 844], [358, 664], [960, 540], [1280, 720], [1920, 1080]];
  const box = (W, H, l, t, w, h) => ({ left: l, top: t, right: l + w, bottom: t + h });
  let bad = [];
  for (const [W, H] of sizes) {
    const w = Math.min(400, W - 32), h = W < 700 ? 230 : 190;
    const targets = {
      home: box(W, H, W - 140, H - 80, 120, 56), sail: box(W, H, W / 2 - 60, H - 90, 120, 48), tin: box(W, H, 16, 70, 96, 48),
      murk: box(W, H, W * 0.6, H * 0.45, 90, 40), keep: box(W, H, W / 2 - 150, H - 110, 300, 56),
    };
    for (const [k, t] of Object.entries(targets)) {
      const P = guidePlace({ W, H, w, h, target: t });
      const r = { left: P.left, top: P.top, right: P.left + w, bottom: P.top + h };
      const inside = r.left >= 15.5 && r.top >= 15.5 && r.right <= W - 15.5 && r.bottom <= H - 15.5;
      const over = r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top;
      const arrowOk = P.side === 'above' || P.side === 'below' ? P.ax >= 0 && P.ax <= w : P.ay >= 0 && P.ay <= h;
      if (!inside || over || !P.side || !arrowOk || !P.ok) bad.push({ W, H, k, P });
    }
    // no target: high, middle or low, clear of the raft
    const raft = box(W, H, W / 2 - 60, H * 0.5, 120, 90);
    const P = guidePlace({ W, H, w, h, avoid: [raft] });
    const r = { left: P.left, top: P.top, right: P.left + w, bottom: P.top + h };
    if (P.side !== null || !P.ok || (r.left < raft.right && r.right > raft.left && r.top < raft.bottom && r.bottom > raft.top)) bad.push({ W, H, k: 'none', P });
  }
  ok(bad.length === 0, 'every size: inside the 16 px gutters, clear of the target, an arrow on the facing edge', bad.slice(0, 4));
  const P = guidePlace({ W: 1280, H: 720, w: 400, h: 190, target: box(1280, 720, 1140, 640, 120, 56) });
  ok(P.side === 'above' && P.top + 190 <= 640 - 10, 'a target low on the screen: the card above it, the arrow pointing down', P);
  const M = guidePlace({ W: 820, H: 900, w: 400, h: 177, target: box(820, 900, 483, 227, 164, 225), avoid: [box(820, 900, 358, 492, 112, 18), box(820, 900, 740, 20, 60, 25)] });
  ok(M.ok && M.side === 'above' && M.left + 400 <= 740, 'Murk\'s box keeps clear of the Journal\'s word and the purse (flush with the target\'s edge)', M);
  const L = guidePlace({ W: 1280, H: 720, w: 400, h: 200, low: true });
  ok(L.side === null && L.top + 200 >= 720 * 0.7 && L.ok, 'low: the card sits in the lower part (the welcome over the Landing)', L);
  const Q = guidePlace({ W: 390, H: 844, w: 358, h: 230, target: box(390, 844, 16, 70, 96, 48) });
  ok(Q.side === 'below' && Q.top >= 118, 'a target high on a phone: the card below it', Q);
}

section('the look: the frame\'s palette and fonts, 16 px or more on a phone, no ring');
{
  ok(/\.gw-guide-text \{[^}]*font: 400 18px/.test(GUIDE_CSS) && /max-width: 700px\)[\s\S]*?\.gw-guide-text \{ font-size: 17px/.test(GUIDE_CSS), 'body text 18 px, 17 px on a phone (≥ 16)');
  ok(/var\(--f-body\)/.test(GUIDE_CSS) && /var\(--f-display\)/.test(GUIDE_CSS) && /var\(--lavender\)/.test(GUIDE_CSS), 'Drowned Filigree\'s fonts and the Clear Night palette');
  ok(!/outline: (?!none)/.test(GUIDE_CSS) && !/border: (?!0)/.test(GUIDE_CSS), 'no outline and no border drawn (never a ring round anything)');
  ok(/\.gw-ui\.gw-guide-on \.gw-loop-tip/.test(GUIDE_CSS) && /gw-guide-on \.gw-teach/.test(GUIDE_CSS) && /gw-guide-on \.gw-murk-line/.test(GUIDE_CSS), 'the in-world lines wait while a box is up');
  ok(Object.keys(GUIDE_TARGETS).every((k) => GUIDE_ORDER.includes(k)), 'every target belongs to a box');
}

section('the seams: under the loop only');
{
  const ui = src('ui.js');
  ok(/if \(loopView\) \{ try \{ loopView\.guide = createGuideView\(K\)/.test(ui), 'ui.js builds the guide only with the loop view');
  ok(/loopView\.guide\.update\(dt\)/.test(ui), 'ui.js runs it each frame');
  ok(/if \(SW\) safe\(\(\) => K\.loop\?\.guide\?\.settingsRows/.test(src('ui-screens.js')), 'Settings adds its two rows under the loop only');
  ok(!/from '\.\/(fishing|progression|main|ui-loop)\.js'/.test(src('ui-guide.js')), 'ui-guide.js imports no gameplay module');
  ok(/blocking: true/.test(src('ui-guide.js')) && /quiet: true/.test(src('ui-guide.js')), 'a blocking modal (the game waits), quiet (no ui:modal to the game)');
}

console.log(`ui-guide: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
