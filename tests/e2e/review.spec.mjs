#!/usr/bin/env node
// Browser test for spaced review (40-fsrs, 41-cards, 60-today), on a partial build.
// Seeds cards for two topics into the stub db, runs a full review session through every card
// type (choice, order, estimate, target, recall) at phone and desktop widths in light and dark,
// checks that FSRS state and history were written, and screenshots every screen to tests/out/.
// Also covers addFromLesson, lesson-mode cards, ideaBands and the Learn-it-again flag.
// Run: node tests/e2e/review.spec.mjs   (exits non-zero on any failure or page error)
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { openApp, ROOT } from '../../tools/harness/page.mjs';

const OUT = join(ROOT, 'tests', 'out', 'review.html');
execFileSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--only', '40,41,60', '--out', OUT], { stdio: 'inherit' });

const UID = 'u_stubuser0000000000000000';
const P = (rest) => `data/users/${UID}/${rest}`;
const failures = [];
function check(cond, msg) {
  if (cond) console.log('  ok  ' + msg);
  else { failures.push(msg); console.log('  FAIL ' + msg); }
}

// Local calendar days, the same way the app computes them.
const pad = (n) => (n < 10 ? '0' : '') + n;
const dayStr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const TODAY = dayStr(new Date());
const addDays = (day, n) => { const [y, m, d] = day.split('-').map(Number); return dayStr(new Date(y, m - 1, d + n)); };
const isoDaysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();

// ---------- seed data ----------
const SPECS = {
  'tA/i1_c1': { id: 'c1', type: 'choice', q: 'When a speaker cone pushes forward, what happens to the air just in front of it?',
    options: ['It is squeezed into a patch of higher pressure', 'It travels all the way to your ear', 'It warms up and rises', 'Nothing happens until the cone pulls back'],
    answer: 0, why: 'The cone shoves nearby air molecules closer together, making a [[compression]]. That squeeze is passed from molecule to molecule; the air itself only jiggles back and forth.',
    misconception: { 1: 'The air barely travels. Each molecule nudges the next one and drifts back, like a shove passed along a crowd.' } },
  'tA/i2_c2': { id: 'c2', type: 'estimate', q: 'Roughly how fast does sound travel through air at room temperature?', min: 0, max: 1000, answer: 343, tolerance: 30, unit: 'm/s',
    why: 'At about 20 °C sound covers roughly [[343 metres per second]]: about a kilometre every three seconds. That is why counting seconds after lightning tells you how far away the storm is.' },
  'tA/i2_c3': { id: 'c3', type: 'target', q: 'Warm air carries sound faster. Set the air temperature so sound travels at 350 m/s.', control: 'temp', output: 'speed', target: 350, tolerance: 2,
    why: 'Speed rises by about 0.6 m/s for every degree, because warmer molecules move faster and pass the push along sooner. 350 m/s needs about 32 °C.' },
  'tA/i3_c1': { id: 'c1', type: 'choice', q: 'Why do you hear an echo in an empty hall?', options: ['Sound bounces off hard walls', 'The air is thinner'], answer: 0, why: 'Hard flat surfaces reflect sound.' },
  'tA/i1_c9': { id: 'c9', type: 'target', q: 'Set the loudness to 70 dB.', control: 'gone', output: 'db', target: 70, tolerance: 2, why: 'Old interactive.' },
  'tB/i1_c1': { id: 'c1', type: 'order', q: 'Put the steps of starting a sourdough starter in order.',
    items: ['Mix flour and water in a jar', 'Leave it somewhere warm for a day', 'Throw away half and feed it fresh flour and water', 'Repeat daily until it doubles within hours of a feed'],
    why: 'Wild yeast and bacteria need food and warmth to multiply. Discarding half before each feed keeps the mix from going too sour and gives the microbes fresh flour.' },
  'tB/i1_say': { prompt: 'In your own words: why does a sourdough starter make bread rise?',
    rubric: ['Wild yeast eat sugars in the flour', 'They give off carbon dioxide gas', 'Gluten traps the gas so the dough puffs up'],
    model: 'Wild yeast living in the starter eat the sugars in flour and breathe out carbon dioxide. The stretchy [[gluten]] network in the dough traps those bubbles, so the dough swells and rises.',
    mine: 'The yeast eat the flour and make gas that puffs the dough up.' },
  'tB/i2_c1': { id: 'c1', type: 'choice', q: 'Why does kneading make dough stretchy?',
    options: ['It links gluten proteins into a network', 'It folds in air that makes it soft', 'It warms the yeast so they multiply', 'It dissolves the salt'], answer: 0,
    misconception: { 1: 'Kneading does fold in a little air, but the stretch comes from gluten strands linking up, not from the air.' },
    why: 'Working the dough lines up two flour proteins so they bond into long elastic strands of [[gluten]], which is what lets dough stretch and hold gas.' },
};
const TYPE = { 'tB/i1_say': 'recall' };
const DUE = { 'tA/i1_c1': addDays(TODAY, -3), 'tA/i2_c2': TODAY, 'tA/i2_c3': addDays(TODAY, -1), 'tA/i3_c1': addDays(TODAY, 5), 'tA/i1_c9': addDays(TODAY, -2),
  'tB/i1_c1': addDays(TODAY, -2), 'tB/i1_say': TODAY, 'tB/i2_c1': TODAY };

function seedDb() {
  const db = {};
  const now = new Date().toISOString();
  db['topics/tA'] = { id: 'tA', title: 'How sound travels', status: 'ready', createdAt: now, updatedAt: now, hue: 200,
    ideas: [{ id: 'i1', title: 'Sound is a pressure wave' }, { id: 'i2', title: 'The speed of sound' }, { id: 'i3', title: 'Echoes' }] };
  db['topics/tB'] = { id: 'tB', title: 'Sourdough bread', status: 'ready', createdAt: now, updatedAt: now, hue: 30,
    ideas: [{ id: 'i1', title: 'Wild yeast and bacteria' }, { id: 'i2', title: 'How gluten traps gas' }] };
  // A topic with no cards yet (extras make some from a lesson: cards exist only under a topic).
  db['topics/tC'] = { id: 'tC', title: 'Echoes', status: 'ready', createdAt: now, updatedAt: now, hue: 90,
    ideas: [{ id: 'i1', title: 'Pressure' }, { id: 'i2', title: 'Pitch' }] };
  db['topics/tA/lessons/i2'] = { status: 'ready', updatedAt: now, sourced: false,
    lesson: { iid: 'i2', title: 'The speed of sound', interactive: { controls: [{ id: 'temp', label: 'Air temperature', min: -20, max: 40, step: 1, value: 20, unit: '°C' }] }, checks: [] },
    interactive: { html: '<div id="fake"></div>', title: 'Speed of sound and temperature' } };
  db['topics/tA/lessons/i1'] = { status: 'ready', updatedAt: now, lesson: { iid: 'i1', interactive: { controls: [{ id: 'amp', label: 'Loudness' }] }, checks: [] },
    interactive: { html: '<div></div>', title: 'Pressure wave' } };
  const cards = { tA: {}, tB: {} };
  for (const key of Object.keys(SPECS)) {
    const [tid, id] = key.split('/');
    const iid = id.split('_')[0];
    const type = TYPE[key] || SPECS[key].type;
    const card = { id, tid, iid, type, spec: SPECS[key], createdAt: isoDaysAgo(20), learnedAt: isoDaysAgo(20),
      s: { due: DUE[key], stability: 3.2, difficulty: 5.4, reps: 1, lapses: 0, last: addDays(TODAY, -7) }, hist: [{ at: isoDaysAgo(7), grade: 3, ok: true }] };
    if (key === 'tB/i2_c1') { card.s.lapses = 1; card.s.stability = 0.8; card.hist.push({ at: isoDaysAgo(5), grade: 1, ok: false }); }
    cards[tid][id] = card;
  }
  db[P('profile/cards/tA')] = { cards: cards.tA };
  db[P('profile/cards/tB')] = { cards: cards.tB };
  db[P('profile')] = { prefs: { size: 'm', easy: false, theme: 'light', cap: 15, light: false }, days: { [addDays(TODAY, -1)]: 12 }, createdAt: isoDaysAgo(30) };
  return db;
}

// Runs in the page: fake Claude grading and the interactive host, apply the theme, start routing.
async function setup(theme) {
  await U.rt.ready;
  document.documentElement.dataset.muTheme = theme;
  window.__grades = [];
  U.gen = U.gen || {};
  U.gen.grade = function (say, answer, attempt) {
    window.__grades.push({ say, answer, attempt });
    return new Promise((r) => setTimeout(() => r({ met: [true, true, false], verdict: 'partly', nailed: false,
      followUp: 'You have the yeast and the gas. What holds the gas in, so the dough rises instead of leaking?' }), 500));
  };
  U.sandbox = U.sandbox || {};
  window.__mounts = 0; window.__destroyed = 0;
  U.sandbox.mount = function (container, o) {
    let temp = 20;
    const input = U.h('input', { type: 'range', min: '-20', max: '40', step: '1', value: '20', class: 'fake-kit-range', 'aria-label': 'Air temperature' });
    const out = U.h('output', { class: 'fake-kit-out' });
    const draw = () => { out.textContent = 'Air ' + temp + ' °C · sound travels at ' + (331 + 0.6 * temp).toFixed(1) + ' m/s'; };
    input.addEventListener('input', () => { temp = Number(input.value); draw(); });
    draw();
    const el = U.h('div', { class: 'fake-kit', style: { padding: '24px 20px', display: 'grid', gap: '14px', fontWeight: '600' } },
      U.h('span', null, (o && o.title) || 'Interactive'), input, out);
    container.appendChild(el);
    window.__mounts++;
    return { el, frame: null, ready: Promise.resolve([]), selftest: () => Promise.resolve({ ok: true }),
      get: () => Promise.resolve({ params: { temp }, outputs: { speed: 331 + 0.6 * temp } }), set: () => Promise.resolve(),
      destroy: () => { window.__destroyed++; el.remove(); } };
  };
  window.addEventListener('hashchange', U._route);
  U._route();
}

const keyFor = (q) => Object.keys(SPECS).find((k) => (SPECS[k].q || SPECS[k].prompt) === q);
const optionText = (key, i) => SPECS[key].options[i];

async function runSession({ width, theme, full }) {
  const tag = `${width}-${theme}`;
  console.log(`\n== review session at ${tag}`);
  const app = await openApp({ file: OUT, width, height: width < 700 ? 707 : 900, dark: theme === 'dark', config: { db: seedDb() } });
  const { page } = app;
  const shot = (name) => app.shot(`review-${tag}-${name}`);
  // Session cards: capture the viewport, which is what Dan sees (full-page captures misplace sticky bars).
  const vshot = (name) => page.screenshot({ path: join(ROOT, 'tests', 'out', `review-${tag}-${name}.png`) });
  await page.goto(app.url('#/today'));
  await page.evaluate(setup, theme);
  await page.waitForSelector('.td-plan');
  await page.waitForTimeout(300);

  const todayText = await page.locator('.td').innerText();
  check(/7\s+cards to revisit/.test(todayText), `${tag}: Today shows 7 cards due (got "${todayText.split('\n').slice(0, 4).join(' | ')}")`);
  check(/About \d+ minutes?/.test(todayText), `${tag}: Today estimates minutes`);
  check(/How sound travels/.test(todayText) && /Sourdough bread/.test(todayText), `${tag}: Today names both topics`);
  const badge = await page.evaluate(async () => { await U.review.refreshBadge(); const b = document.getElementById('today-badge'); return { text: b.textContent, hidden: b.hidden }; });
  check(badge.text === '7' && !badge.hidden, `${tag}: badge shows 7`);
  await shot('00-today');

  if (full) {
    // Light day trims the session to 5 and remembers it; then switch back.
    await page.locator('.td-light').click();
    await page.waitForTimeout(400);
    check(/5\s+cards to revisit/.test(await page.locator('.td-plan').innerText()), `${tag}: light day shows 5`);
    await shot('01-today-lightday');
    await page.waitForTimeout(300);
    const prefs = (await app.stub())[P('profile')].prefs;
    const today = await page.evaluate(() => U.today());
    check(prefs.lightDay === today && !prefs.light, `${tag}: light day saved for today only (lightDay ${prefs.lightDay})`);
    await page.locator('.td-light').click();
    await page.waitForTimeout(400);
    check(/7\s+cards to revisit/.test(await page.locator('.td-plan').innerText()), `${tag}: light day off shows 7 again`);

    const q = await page.evaluate(async () => (await U.review.queue()).map((c) => ({ tid: c.tid, iid: c.iid, id: c.id })));
    check(q.length === 7, `${tag}: queue holds the 7 due cards (not the future one)`);
    check(q[0].tid === 'tA' && q[0].id === 'i1_c1', `${tag}: most overdue card comes first`);
    check(q.every((c, i) => i === 0 || c.tid + c.iid !== q[i - 1].tid + q[i - 1].iid), `${tag}: no idea twice in a row ` + q.map((c) => c.tid + '/' + c.id).join(','));
    const switches = q.filter((c, i) => i > 0 && c.tid !== q[i - 1].tid).length;
    check(switches >= 4, `${tag}: topics alternate (${switches} switches)`);
    check((await page.evaluate(() => U.review.queue({ light: true }))).length === 5, `${tag}: light day caps the queue at 5`);
  }

  await page.locator('.td-start').click();
  await page.waitForSelector('.rv-stage > .qc');
  const seen = [];
  let lastCount = '';
  const t0 = Date.now();
  for (let step = 0; step < 12; step++) {
    await page.waitForSelector('.rv-stage > .qc:not(.qc-finished), .rv-done, .rv-wait', { timeout: 8000 });
    if (await page.locator('.rv-done, .rv-wait').count()) break;
    const info = await page.evaluate(() => {
      const el = document.querySelector('.rv-stage > .qc');
      return { type: [...el.classList].find((c) => c.startsWith('qc-type-')).slice(8), q: el.querySelector('.qc-q').textContent,
        where: document.querySelector('.rv-where').textContent, count: document.querySelector('.rv-count').textContent };
    });
    const key = keyFor(info.q);
    lastCount = info.count;
    seen.push(key);
    const n = String(seen.length).padStart(2, '0');
    const name = `${n}-${info.type}`;
    check(!!key, `${tag}: card ${n} is a seeded card (${info.type}: ${info.q.slice(0, 40)})`);
    await page.waitForTimeout(150);
    await vshot(name + '-before');
    const cont = page.locator('.rv-stage .qc-continue');

    if (key === 'tA/i1_c1') {                                   // choice, answered right and quickly -> Easy
      await page.locator('.qc-opt', { hasText: optionText(key, 0) }).click();
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-fb.is-right');
      check(await page.locator('.qc-fb .qc-fb-icon.good').count() === 1, `${tag}: right choice shows the green tick`);
      check(/Coming back .*· Easy/.test(await page.locator('.qc-grade-line').innerText()), `${tag}: fast right answer auto-grades Easy (in plain words: when it comes back)`);
    } else if (key === 'tB/i2_c1') {                            // choice, wrong option with a misconception
      await page.locator('.qc-opt', { hasText: optionText(key, 1) }).click();
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-fb.is-wrong');
      const fb = await page.locator('.qc-fb').innerText();
      check(/A common mix-up/i.test(fb) && /gluten strands linking up/.test(fb), `${tag}: wrong choice shows its misconception`);
      check(/The answer:/.test(fb) && /Working the dough/.test(fb), `${tag}: wrong choice shows the answer and the why`);
      check(await page.locator('.qc-fb .qc-fb-icon.good').count() === 0, `${tag}: no green tick when wrong`);
      check(/Coming back tomorrow · Again/.test(await page.locator('.qc-grade-line').innerText()), `${tag}: wrong answer auto-grades Again`);
    } else if (key === 'tB/i1_c1') {                            // order, with an undo, then one swap wrong
      const items = SPECS[key].items;
      await page.locator('.qc-pool .qc-chip', { hasText: items[1] }).click();
      await page.locator('.qc-undo').click();
      check(await page.locator('.qc-seq .qc-step').count() === 0, `${tag}: undo takes the last item back`);
      for (const i of [0, 2, 1, 3]) {
        await page.locator('.qc-pool .qc-chip', { hasText: items[i] }).click();
        if (i === 2) { await page.waitForTimeout(300); await vshot(name + '-partial'); }
      }
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-fb.is-wrong');
      check(await page.locator('.qc-seq .qc-step.wrong').count() === 2 && await page.locator('.qc-seq .qc-step.correct').count() === 2, `${tag}: order marks 2 right and 2 wrong`);
      check(await page.locator('.qc-right-order li').count() === 4 && /You put it 3rd/.test(await page.locator('.qc-right-order').innerText()), `${tag}: order shows the right order with mistakes marked`);
    } else if (key === 'tA/i2_c2') {                            // estimate: slide, nudge, lock in; override to Hard
      await page.evaluate(() => {
        const r = document.querySelector('.qc-range');
        r.value = '330'; r.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await page.locator('.qc-nudge[aria-label="A little more"]').click();
      const val = await page.locator('.qc-est-value').innerText();
      check(/335/.test(val), `${tag}: estimate slider and nudge read 335 m/s (got ${val})`);
      await vshot(name + '-moved');
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-fb.is-right');
      const fb = await page.locator('.qc-fb').innerText();
      check(/Anything from 313 m\/s to 373 m\/s counts/.test(fb), `${tag}: estimate shows the tolerance after`);
      check(await page.locator('.qc-band:not([hidden])').count() === 1, `${tag}: estimate draws the accepted band`);
      await page.locator('.qc-change').click();
      await page.locator('.qc-grades .qc-g2').click();
      check(/· Hard/.test(await page.locator('.qc-grade-line').innerText()), `${tag}: grade override changes the mark`);
    } else if (key === 'tA/i2_c3') {                            // target: miss, hint, then hit
      await page.waitForSelector('.fake-kit');
      await page.waitForFunction(() => !document.querySelector('.qc-primary').disabled);
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-hint:not([hidden])');
      const hint = await page.locator('.qc-hint').innerText();
      check(/343/.test(hint) && /higher/.test(hint), `${tag}: target miss gives one hint (${hint.replace(/\n/g, ' ')})`);
      await page.waitForTimeout(350);
      await vshot(name + '-hint');
      await page.evaluate(() => { const r = document.querySelector('.fake-kit-range'); r.value = '32'; r.dispatchEvent(new Event('input', { bubbles: true })); });
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-fb.is-right');
      check(/Got it on the second go/.test(await page.locator('.qc-fb').innerText()), `${tag}: target hit after the hint`);
      check(/· Hard/.test(await page.locator('.qc-grade-line').innerText()), `${tag}: target right after a hint grades Hard`);
    } else if (key === 'tB/i1_say') {                           // recall: Claude grades in the background, Dan overrides
      check(/microphone/.test(await page.locator('.qc-tip').innerText()), `${tag}: recall mentions the keyboard mic`);
      await page.locator('.qc-recall-input').fill('Yeast in the starter eat sugar from the flour and give off carbon dioxide, which makes the dough rise.');
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-fb-recall');
      check(/Claude is reading/.test(await page.locator('.qc-claude').innerText()), `${tag}: recall shows grading in progress`);
      check(/Continue, Claude will grade it/.test(await cont.innerText()), `${tag}: recall can continue before grading finishes`);
      check(/Wild yeast living in the starter/.test(await page.locator('.qc-model').innerText()), `${tag}: recall reveals the model answer`);
      await vshot(name + '-grading');
      await page.waitForSelector('.qc-verdict');
      check(/Partly there/.test(await page.locator('.qc-verdict').innerText()), `${tag}: recall shows Claude's verdict`);
      check(await page.locator('.qc-g2[aria-pressed="true"] .qc-g-claude').count() === 1, `${tag}: Claude's pick (Hard) is preselected`);
      check(await page.locator('.qc-point.met').count() === 2 && await page.locator('.qc-point.missed').count() === 1, `${tag}: rubric points marked from the grade`);
      // Taps in the first moments after Claude's grade lands are ignored (the layout may have moved).
      const grid = await page.locator('.qc-grades').boundingBox();
      check(grid && (await page.locator('.qc-g').evaluateAll((bs) => new Set(bs.map((b) => Math.round(b.getBoundingClientRect().height))).size)) === 1, `${tag}: the four grade buttons keep one height with Claude's badge`);
      await page.waitForTimeout(450);
      await page.locator('.qc-grades .qc-g3').click();
    } else {
      check(false, `${tag}: unexpected card ${key}`);
    }
    await page.waitForTimeout(450);
    await vshot(name + '-after');
    await cont.click();
  }
  await page.waitForSelector('.rv-done', { timeout: 25000 });
  check(lastCount === '6 of 6', `${tag}: the counter drops the skipped card (last card read "${lastCount}")`);
  check(seen.length === 6 && !seen.includes('tA/i1_c9'), `${tag}: session showed 6 cards and skipped the stale target (${seen.join(', ')})`);
  check(['choice', 'order', 'estimate', 'target', 'recall'].every((t) => seen.some((k) => (TYPE[k] || SPECS[k].type) === t)), `${tag}: every card type appeared`);
  const summary = await page.locator('.rv-done').innerText();
  check(/Review done/.test(summary) && /6 cards/.test(summary), `${tag}: summary says 6 cards`);
  check(/Remembered\s*4/i.test(summary) && /Back tomorrow\s*2/i.test(summary), `${tag}: summary counts remembered and back tomorrow`);
  check(await page.locator('.rv-done a[href="#/t/tB/i2/again"]').count() === 1, `${tag}: summary offers Learn it again for the slipping idea`);
  await page.waitForTimeout(1800);
  await shot('20-summary');

  // ---- what was saved ----
  await page.waitForTimeout(400);
  const db = await app.stub();
  const cards = { ...db[P('profile/cards/tA')].cards, ...Object.fromEntries(Object.entries(db[P('profile/cards/tB')].cards).map(([k, v]) => ['B' + k, v])) };
  const expectGrade = { i1_c1: 4, i2_c2: 2, i2_c3: 2, Bi1_c1: 1, Bi1_say: 3, Bi2_c1: 1 };
  for (const [id, g] of Object.entries(expectGrade)) {
    const c = cards[id];
    const last = c.hist[c.hist.length - 1];
    check(c.hist.length === (id === 'Bi2_c1' ? 3 : 2) && last.grade === g, `${tag}: ${id} history gained grade ${g} (got ${last.grade})`);
    check(c.s.reps === 2 && c.s.last === TODAY && c.s.due > TODAY, `${tag}: ${id} FSRS state moved on (due ${c.s.due}, reps ${c.s.reps})`);
    if (g === 1) check(c.s.due === addDays(TODAY, 1) && c.s.lapses >= 1, `${tag}: ${id} forgotten -> back tomorrow`);
  }
  check(cards.i3_c1.hist.length === 1 && cards.i3_c1.s.due === DUE['tA/i3_c1'], `${tag}: a card not yet due is untouched`);
  check(cards.i1_c9.retired === true && cards.i1_c9.hist.length === 1, `${tag}: target card with a missing control is retired, not graded`);
  const prog = db[P('profile/progress/tB')];
  check(prog && prog.ideas && prog.ideas.i2 && prog.ideas.i2.relearn === true, `${tag}: relearn flag patched on progress`);
  const mins = ((d) => (typeof d === 'number' ? d : Object.values(d || {}).reduce((a, n) => a + (Number(n) || 0), 0)))((db[P('profile')].days || {})[TODAY]);
  check(mins >= 1 && typeof (db[P('profile')].days || {})[TODAY] === 'object', `${tag}: study minutes logged for today, per device (${mins})`);
  const after = await page.evaluate(async () => { await U.review.refreshBadge(); const b = document.getElementById('today-badge'); return { hidden: b.hidden, n: await U.review.dueCount() }; });
  check(after.hidden && after.n === 0, `${tag}: badge hidden and nothing due after the session`);
  const grades = await page.evaluate(() => window.__grades);
  check(grades.length === 1 && grades[0].say.prompt === SPECS_PROMPT && grades[0].attempt === 1, `${tag}: U.gen.grade called once with the recall spec`);
  check(await page.evaluate(() => window.__mounts === window.__destroyed && window.__mounts === 1), `${tag}: the target interactive was destroyed when the card left`);

  // ---- Today afterwards ----
  await page.locator('.rv-done a[href="#/today"]').click();
  await page.waitForSelector('.td-clear');
  const clear = await page.locator('.td').innerText();
  check(/Done for today/.test(clear) && /reviewed 6 cards/.test(clear), `${tag}: Today says done for today`);
  check(/Learn it again/.test(clear), `${tag}: Today lists the idea to learn again`);
  check(await page.locator('.td-day.today.on').count() === 1, `${tag}: this week marks today as studied`);
  await shot('21-today-done');

  if (full) await extras(app, tag);
  check(app.errors.length === 0, `${tag}: no page errors ${app.errors.join(' | ')}`);
  await app.close();
}
const SPECS_PROMPT = SPECS['tB/i1_say'].prompt;

// addFromLesson, lesson-mode cards, ideaBands, empty states.
async function extras(app, tag) {
  const { page } = app;
  console.log(`-- extras at ${tag}`);
  const lesson = {
    iid: 'i1', title: 'Pressure',
    say: { prompt: 'Explain what a sound wave is.', rubric: ['A travelling squeeze', 'Air only jiggles'], model: 'A travelling pattern of squeezes.' },
    checks: [
      { id: 'c1', type: 'choice', q: 'What carries sound?', options: ['Air molecules nudging each other', 'Light'], answer: 0, why: 'Sound needs a medium.' },
      { id: 'c2', type: 'order', q: 'Order the journey.', items: ['Cone pushes', 'Air squeezes', 'Ear drum moves'], why: 'Cause then effect.' },
      { id: 'c3', type: 'estimate', q: 'How many?', min: 1, max: 1000, answer: 100, tolerance: 20, log: true, unit: 'Hz', why: 'Because.' },
    ],
  };
  const made = await page.evaluate(async (l) => {
    const ids = await U.review.addFromLesson('tC', 'i1', l, { checks: { c1: { correct: true }, c2: { correct: false } }, say: { text: 'A squeeze that travels.', verdict: 'partly' } });
    await new Promise((r) => setTimeout(r, 300));
    return ids;
  }, lesson);
  let db = await app.stub();
  let doc = db[P('profile/cards/tC')];
  check(made.length === 3 && doc && Object.keys(doc.cards).sort().join() === 'i1_c1,i1_c2,i1_say', `${tag}: addFromLesson makes cards only for answered checks + say (${made})`);
  check(doc.cards.i1_c1.s.due === addDays(TODAY, 1) && doc.cards.i1_c1.s.reps === 0 && doc.cards.i1_say.type === 'recall' && doc.cards.i1_say.spec.mine === 'A squeeze that travels.', `${tag}: new cards due tomorrow; say becomes a recall card`);
  // Same lesson again keeps the schedule; a changed check starts fresh; a dropped check goes.
  await page.evaluate(async (l) => {
    const p = { cards: { i1_c1: { s: { due: '2099-01-01', stability: 9, difficulty: 5, reps: 3, lapses: 0, last: '2026-01-01' } } } };
    await U.store.cards.patch('tC', p);
    const l2 = JSON.parse(JSON.stringify(l));
    l2.checks[1].items = ['Cone pushes', 'Air squeezes', 'Ear drum moves', 'Brain hears'];
    await U.review.addFromLesson('tC', 'i1', l2, { checks: { c1: { correct: true }, c2: { correct: true } }, say: { text: 'Second try.', verdict: 'got-it' } });
    await U.review.addFromLesson('tC', 'i2', l2, { checks: { c3: { correct: true } }, say: null });
    await new Promise((r) => setTimeout(r, 300));
  }, lesson);
  db = await app.stub();
  doc = db[P('profile/cards/tC')];
  check(doc.cards.i1_c1.s.reps === 3 && doc.cards.i1_c2.s.reps === 0 && doc.cards.i1_c2.spec.items.length === 4, `${tag}: re-learning keeps unchanged cards' schedules and resets changed ones`);
  check(doc.cards.i1_say.spec.mine === 'Second try.' && doc.cards.i2_c3 && doc.cards.i2_c3.type === 'estimate', `${tag}: recall keeps Dan's latest words; other ideas add alongside`);

  const bands = await page.evaluate(() => U.review.ideaBands());
  check(bands.tC && bands.tC.i2 === 'new' && ['fragile', 'growing', 'strong'].includes(bands.tA.i2) && bands.tB.i2 === 'fragile', `${tag}: ideaBands ${JSON.stringify(bands)}`);

  // Lesson-mode cards: no rating, onDone result, log-scale estimate.
  await page.evaluate((l) => {
    window.__res = [];
    const view = document.getElementById('view');
    U.clear(view);
    const box = U.h('div', { class: 'stack', id: 'lsn' });
    view.appendChild(box);
    l.checks.forEach((c) => box.appendChild(U.cards.render({ id: c.id, type: c.type, spec: c }, { mode: 'lesson', onDone: (r) => window.__res.push(r) })));
    box.appendChild(U.cards.render({ id: 'r1', type: 'recall', spec: { prompt: l.say.prompt, rubric: l.say.rubric, model: l.say.model } }, { mode: 'lesson', onDone: (r) => window.__res.push(r) }));
    box.appendChild(U.cards.render({ id: 'x', type: 'mystery', spec: { q: 'Unknown type' } }, { mode: 'lesson', onDone: (r) => window.__res.push(r) }));
    window.scrollTo(0, 0);
  }, lesson);
  const first = page.locator('#lsn > .qc').first();
  await first.locator('.qc-opt', { hasText: 'Light' }).click();
  await first.locator('.qc-primary').click();
  await first.locator('.qc-fb.is-wrong').waitFor();
  check(await first.locator('.qc-grades, .qc-grade').count() === 0, `${tag}: lesson mode shows no rating`);
  await app.shot(`review-${tag}-30-lesson-choice`);
  await first.locator('.qc-continue').click();
  const estimateCard = page.locator('#lsn > .qc-type-estimate');
  check(/×|multiplies/.test(await estimateCard.locator('.qc-tip').innerText()), `${tag}: log-scale estimate explains the stretched scale`);
  await page.evaluate(() => { const r = document.querySelector('#lsn .qc-type-estimate .qc-range'); r.value = '667'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  check(/^100\b/.test((await estimateCard.locator('.qc-est-value').innerText()).trim()), `${tag}: log slider maps the middle-upper position to 100 Hz`);
  await estimateCard.locator('.qc-primary').click();
  await estimateCard.locator('.qc-fb.is-right').waitFor();
  await estimateCard.scrollIntoViewIfNeeded();
  await app.shot(`review-${tag}-31-lesson-estimate-log`);
  await estimateCard.locator('.qc-continue').click();
  const unknown = page.locator('#lsn > .qc-type-mystery');
  await unknown.locator('.qc-continue').click();
  const res = await page.evaluate(() => window.__res);
  check(res.length === 3 && res[0].correct === false && res[0].grade === null && res[0].answer === 1 && typeof res[0].ms === 'number', `${tag}: lesson onDone result shape ${JSON.stringify(res[0])}`);
  check(res[1].correct === true && res[1].answer === 100, `${tag}: estimate onDone answer is the shown value`);
  check(res[2].skipped === true, `${tag}: unknown type can be skipped`);
  check(await page.locator('#lsn > .qc.qc-finished .qc-continue').count() === 0, `${tag}: finished cards drop their Continue button`);

  // ---- regressions (docs/review/correctness.md) ----
  // #7 a log-scale estimate with a tight tolerance can be answered right (by slider and by nudge).
  const est = await page.evaluate(() => {
    const spec = { id: 'c9', type: 'estimate', q: 'Speed of sound?', min: 1, max: 10000, answer: 343, tolerance: 2, unit: 'm/s', log: true };
    let r = null;
    const el = U.cards.render({ id: 'x_c9', type: 'estimate', spec }, { mode: 'lesson', onDone: (x) => { r = x; } });
    document.getElementById('view').appendChild(el);
    const range = el.querySelector('.qc-range'), num = () => Number(el.querySelector('.qc-est-num').textContent.replace(/,/g, ''));
    const hits = new Set();
    for (let p = 0; p <= Number(range.max); p++) { range.value = String(p); range.dispatchEvent(new Event('input')); const v = num(); if (Math.abs(v - 343) <= 2) hits.add(v); }
    el.querySelectorAll('.qc-nudge')[0].click();
    el.querySelector('.qc-primary').click();
    el.querySelector('.qc-continue').click();
    return { hits: [...hits], correct: r && r.correct };
  });
  check(est.hits.length >= 2, `${tag}: every value within the tolerance of a log estimate can be reached (${est.hits})`);
  // #1 cards whose topic is gone, and partial cards, never reach the queue; their docs are tidied.
  await page.evaluate(([gone, part]) => {
    const S = window.__CLAUDE_STUB__;
    S.seed(gone, { cards: { i1_c1: { id: 'i1_c1', tid: 'tZ', iid: 'i1', type: 'choice', spec: { q: 'Ghost?', options: ['a', 'b'], answer: 0 }, s: { due: '2000-01-01' }, hist: [] } } });
    const d = S.get(part); d.cards.ghost = { s: { due: '2000-01-01' }, hist: [] }; S.seed(part, d);
  }, [P('profile/cards/tZ'), P('profile/cards/tC')]);
  const q2 = await page.evaluate(async () => (await U.review.queue({ extra: true, cap: 50 })).map((c) => c.tid + '/' + c.id));
  await page.waitForTimeout(400);
  check(!q2.some((k) => /tZ|ghost/.test(k)), `${tag}: no card from a deleted topic or without a question in the queue (${q2})`);
  check(!(await app.stub())[P('profile/cards/tZ')], `${tag}: the cards doc of a deleted topic is removed`);

  // Empty state when nothing has ever been made.
  await page.evaluate(async () => {
    const all = await U.store.cards.all();
    for (const tid of Object.keys(all)) await U.store.setDoc(U.store.paths.cards(tid), { cards: {} });
    location.hash = '#/review';
  });
  await page.waitForSelector('.rv-empty');
  check(/Nothing to review/.test(await page.locator('.rv-empty').innerText()), `${tag}: review with nothing due says so`);
  await page.evaluate(() => { location.hash = '#/today'; });
  await page.waitForSelector('.td-clear');
  await app.shot(`review-${tag}-32-today-empty`);
}

// Regressions from the correctness review: a target card that gives no reading (#6) and a review
// saved on another device while this session was open (#9b).
async function regressions() {
  const tag = 'regressions';
  console.log(`\n== ${tag}`);
  const db = seedDb();
  // Only two cards due: the target (most overdue) and a choice card.
  for (const tid of ['tA', 'tB']) for (const c of Object.values(db[P('profile/cards/' + tid)].cards)) c.s.due = addDays(TODAY, 3);
  db[P('profile/cards/tA')].cards.i2_c3.s.due = addDays(TODAY, -5);
  db[P('profile/cards/tA')].cards.i1_c1.s.due = addDays(TODAY, -1);
  const app = await openApp({ file: OUT, width: 360, height: 707, config: { db } });
  const { page } = app;
  await page.goto(app.url('#/today'));
  await page.evaluate(setup, 'light');
  await page.evaluate(() => {
    const mount = U.sandbox.mount;
    U.sandbox.mount = (c, o) => Object.assign(mount(c, o), { get: () => Promise.resolve({ params: { temp: 20 }, outputs: { other: 343 } }) });
  });
  await page.waitForSelector('.td-plan');
  await page.locator('.td-start').click();
  await page.waitForSelector('.qc-type-target .qc-primary:not([disabled])');
  await page.locator('.qc-primary').click();
  await page.waitForSelector('.qc-hint:not([hidden])');
  check(await page.locator('.qc-skip').count() === 0, `${tag}: no Skip after the first failed reading`);
  await page.waitForSelector('.qc-type-target .qc-primary:not([disabled])');
  await page.locator('.qc-primary').click();
  await page.waitForSelector('.qc-skip');
  check(await page.locator('#toasts .toast').count() === 0, `${tag}: failed readings are explained on the card, not in toasts`);
  check(/not giving a reading/.test(await page.locator('.qc-hint').innerText()), `${tag}: the card says why it can be skipped`);
  await page.screenshot({ path: join(ROOT, 'tests', 'out', 'review-regressions-target-skip.png') });
  await page.locator('.qc-skip').click();
  // The other device reviews the choice card while this session shows it.
  await page.waitForSelector('.qc-type-choice .qc-opt');
  await page.evaluate((path) => {
    const S = window.__CLAUDE_STUB__, d = S.get(path), c = d.cards.i1_c1;
    c.hist.push({ at: new Date(Date.now() - 5000).toISOString(), grade: 1, ok: false, from: 'phone' });
    c.s = Object.assign({}, c.s, { lapses: 1, reps: 2, due: '2099-01-01' });
    S.seed(path, d);
  }, P('profile/cards/tA'));
  await page.locator('.qc-opt', { hasText: optionText('tA/i1_c1', 0) }).click();
  await page.locator('.qc-primary').click();
  await page.locator('.qc-continue').click();
  await page.waitForSelector('.rv-done', { timeout: 15000 });
  await page.waitForTimeout(500);
  const cards = (await app.stub())[P('profile/cards/tA')].cards;
  check(cards.i2_c3.retired === true && cards.i2_c3.hist.length === 1, `${tag}: a target card skipped as unusable is retired, not graded`);
  const h = cards.i1_c1.hist;
  check(h.length === 3 && h.some((e) => e.from === 'phone') && cards.i1_c1.s.lapses >= 1 && cards.i1_c1.s.reps === 3, `${tag}: the other device's review is kept and this answer added on top (hist ${h.map((e) => e.grade).join(',')}, lapses ${cards.i1_c1.s.lapses}, reps ${cards.i1_c1.s.reps})`);
  const after = await page.evaluate(async () => { await U.review.refreshBadge(); return document.getElementById('today-badge').hidden; });
  check(after, `${tag}: the badge clears`);
  check(app.errors.length === 0, `${tag}: no page errors ${app.errors.join(' | ')}`);
  await app.close();
}

// ONLY=360-light node tests/e2e/review.spec.mjs runs a single combination while iterating.
const RUNS = [{ width: 360, theme: 'light', full: true }, { width: 360, theme: 'dark' }, { width: 1280, theme: 'light' }, { width: 1280, theme: 'dark' }]
  .filter((r) => !process.env.ONLY || process.env.ONLY === `${r.width}-${r.theme}`);
try {
  for (const r of RUNS) await runSession({ full: false, ...r });
  if (!process.env.ONLY || process.env.ONLY === 'regressions') await regressions();
} catch (e) {
  failures.push('crashed: ' + (e.stack || e));
  console.error(e);
}
console.log(failures.length ? `\n${failures.length} FAILED:\n- ` + failures.join('\n- ') : '\nall review checks passed');
process.exit(failures.length ? 1 : 0);
