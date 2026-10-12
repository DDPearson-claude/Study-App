#!/usr/bin/env node
// Browser test for spaced review (40-fsrs, 41-cards, 60-today), on a partial build.
// Seeds cards for two topics into the stub db, runs a full review session through every card
// type (choice, order, estimate, target, recall) at phone and desktop widths in light and dark,
// checks that FSRS state and history were written, and screenshots every screen to tests/out/.
// Also covers addFromLesson, lesson-mode cards, ideaBands and the Learn-it-again flag, and (v9)
// that an idea finished as a read lesson ("Just teach me") is never counted: not in Today, a
// review or the badge, even with cards left from an earlier, studied round.
// Run: node tests/e2e/review.spec.mjs   (exits non-zero on any failure or page error)
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { openApp, ROOT } from '../../tools/harness/page.mjs';

const OUT = join(ROOT, 'tests', 'out', 'review.html');
execFileSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--only', '40,41,60,70-views', '--out', OUT], { stdio: 'inherit' });

const UID = 'u_stubuser0000000000000000';
const P = (rest) => `data/users/${UID}/${rest}`;
const failures = [];
function check(cond, msg) {
  if (cond) console.log('  ok  ' + msg);
  else { failures.push(msg); console.log('  FAIL ' + msg); }
}

// Study days, the same way the app computes them (U.studyDay: the local day, turning over at 4 am).
const pad = (n) => (n < 10 ? '0' : '') + n;
const dayStr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const studyDay = (d) => { const x = new Date(d); if (x.getHours() < 4) x.setDate(x.getDate() - 1); return dayStr(x); };
const TODAY = studyDay(new Date());
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
    lesson: { iid: 'i2', title: 'The speed of sound', interactive: { controls: [{ id: 'temp', label: 'Air temperature', min: -20, max: 40, step: 1, value: 20, unit: '°C' }],
      outputs: [{ id: 'speed', label: 'Speed of sound', unit: 'm/s', decimals: 1 }] }, checks: [] },
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
  window.__mounts = 0; window.__destroyed = 0; window.__quiz = []; window.__reveals = 0;
  U.sandbox.mount = function (container, o) {
    let temp = 20;
    // Quiz mode as the kit does it (contract Q): the readout it hides shows "?" until reveal.
    let hide = o && o.quiz && o.quiz.hide ? o.quiz.hide : null;
    window.__quiz.push(o && o.quiz ? JSON.parse(JSON.stringify(o.quiz)) : null);
    const input = U.h('input', { type: 'range', min: '-20', max: '40', step: '1', value: '20', class: 'fake-kit-range', 'aria-label': 'Air temperature' });
    const out = U.h('output', { class: 'fake-kit-out' });
    const draw = () => { out.textContent = 'Air ' + temp + ' °C · sound travels at ' + (hide === 'speed' ? '?' : (331 + 0.6 * temp).toFixed(1)) + ' m/s'; };
    input.addEventListener('input', () => { temp = Number(input.value); draw(); });
    draw();
    const el = U.h('div', { class: 'fake-kit', style: { padding: '24px 20px', display: 'grid', gap: '14px', fontWeight: '600' } },
      U.h('span', null, (o && o.title) || 'Interactive'), input, out);
    container.appendChild(el);
    window.__mounts++;
    return { el, frame: null, ready: Promise.resolve([]), selftest: () => Promise.resolve({ ok: true }),
      get: () => Promise.resolve({ params: { temp }, outputs: { speed: 331 + 0.6 * temp } }), set: () => Promise.resolve(),
      reveal: () => { window.__reveals++; hide = null; draw(); },
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

  check(await page.locator('.td-light input.switch[role="switch"]').count() === 1, `${tag}: Light day uses the shared switch`);
  if (full) {
    // Light day trims the session to 5 and remembers it; then switch back.
    await page.locator('.td-light').click();
    await page.waitForTimeout(400);
    check(/5\s+cards to revisit/.test(await page.locator('.td-plan').innerText()), `${tag}: light day shows 5`);
    await shot('01-today-lightday');
    await page.waitForTimeout(300);
    const prefs = (await app.stub())[P('profile')].prefs;
    const today = await page.evaluate(() => U.studyDay());
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
    if (width >= 1200 && info.type === 'choice') {
      const gap = await page.evaluate(() => document.querySelector('.rv-stage .qc-primary').getBoundingClientRect().top - document.querySelector('.rv-stage .qc-options').getBoundingClientRect().bottom);
      check(gap >= 0 && gap < 40, `${tag}: Check follows the answers on a laptop (${Math.round(gap)} px below them)`);
    }
    await vshot(name + '-before');
    const cont = page.locator('.rv-stage .qc-continue');
    // Right after answering: the question stays in view with the feedback (Dan's own taps on
    // Change or a grade may then scroll on to the grades); on a laptop the panel sits beside the answers.
    const fbView = async () => {
      await page.waitForTimeout(500);
      const v = await page.evaluate(() => {
        const r = (s) => { const e = document.querySelector(s); return e && e.getBoundingClientRect(); };
        const q = r('.rv-stage .qc-q'), bar = r('.rv-top'), fb = r('.rv-stage .qc-fb'), body = r('.rv-stage .qc-body');
        return { q: q.top, qb: q.bottom, bar: bar.bottom, fbTop: fb.top, fbLeft: fb.left, bodyRight: body.right, vh: innerHeight, wide: getComputedStyle(document.querySelector('.rv-stage .qc')).display === 'grid' };
      });
      check(v.q >= v.bar - 1 && v.qb <= v.vh, `${tag}: ${info.type} keeps the question in view with the feedback (q ${Math.round(v.q)}-${Math.round(v.qb)}, bar ${Math.round(v.bar)})`);
      if (width >= 1200) check(v.wide && v.fbLeft > v.bodyRight && v.fbTop < v.qb, `${tag}: ${info.type} feedback sits beside the answers on a laptop`);
    };

    if (key === 'tA/i1_c1') {                                   // choice, answered right and quickly -> Easy
      await page.locator('.qc-opt', { hasText: optionText(key, 0) }).click();
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-fb.is-right');
      await fbView();
      check(await page.locator('.qc-fb .qc-fb-icon.good').count() === 1, `${tag}: right choice shows the green tick`);
      check(/Coming back .*· Easy/.test(await page.locator('.qc-grade-line').innerText()), `${tag}: fast right answer auto-grades Easy (in plain words: when it comes back)`);
    } else if (key === 'tB/i2_c1') {                            // choice, wrong option with a misconception
      await page.locator('.qc-opt', { hasText: optionText(key, 1) }).click();
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-fb.is-wrong');
      await fbView();
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
      await fbView();
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
      await fbView();
      const fb = await page.locator('.qc-fb').innerText();
      check(/Anything from 313\sm\/s to 373\sm\/s counts/.test(fb), `${tag}: estimate shows the tolerance after`);
      check(await page.locator('.qc-band:not([hidden])').count() === 1, `${tag}: estimate draws the accepted band`);
      await page.locator('.qc-change').click();
      await page.locator('.qc-grades .qc-g2').click();
      check(/· Hard/.test(await page.locator('.qc-grade-line').innerText()), `${tag}: grade override changes the mark`);
    } else if (key === 'tA/i2_c3') {                            // target: miss, hint, then hit
      await page.waitForSelector('.fake-kit');
      // Quiz mode: the card mounts its interactive with the readout it aims at hidden, and Check reveals it.
      const quiz = await page.evaluate(() => [window.__quiz[window.__quiz.length - 1], window.__reveals, document.querySelector('.fake-kit-out').textContent]);
      check(JSON.stringify(quiz[0]) === '{"hide":"speed"}' && quiz[1] === 0 && /at \? m\/s/.test(quiz[2]), `${tag}: target card mounts in quiz mode, its readout hidden while he answers (${JSON.stringify(quiz)})`);
      const goal = await page.locator('.qc-goal').innerText();
      check(/Use the Air temperature control to make Speed of sound read 350\sm\/s \(give or take 2\sm\/s\)/.test(goal), `${tag}: target goal names the readout and its unit (${goal})`);
      check(/Speed of sound: aim for 350\sm\/s/.test(await page.locator('.qc-aim').innerText()), `${tag}: the goal beside the button has the unit too`);
      await page.waitForFunction(() => !document.querySelector('.qc-primary').disabled);
      await page.locator('.qc-primary').click();
      await page.waitForSelector('.qc-hint:not([hidden])');
      const hint = await page.locator('.qc-hint').innerText();
      check(/Speed of sound reads 343\sm\/s and you are aiming for 350\sm\/s/.test(hint) && /higher/.test(hint), `${tag}: target miss gives one hint, with units (${hint.replace(/\n/g, ' ')})`);
      const shown = await page.evaluate(() => [window.__reveals, document.querySelector('.fake-kit-out').textContent]);
      check(shown[0] >= 1 && /at 343\.0 m\/s/.test(shown[1]), `${tag}: Check reveals the readout (${JSON.stringify(shown)})`);
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
      await fbView();
      check(/Partly there/.test(await page.locator('.qc-verdict').innerText()), `${tag}: recall shows Claude's verdict`);
      check(/^Something to think over\s+You have the yeast/i.test(await page.locator('.qc-follow').innerText()), `${tag}: Claude's follow-up is offered as something to think over`);
      check(await page.locator('.qc-mine summary .qc-chev svg').count() === 1 && !(await page.locator('.qc-mine').evaluate((d) => d.open)), `${tag}: Dan's earlier words sit behind a row with a chevron`);
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
  check(/2 cards, from 2 ideas:/.test(summary), `${tag}: summary says how the cards coming back map to ideas`);
  const widths = await page.evaluate(() => [...document.querySelectorAll('.rv-done > .rv-stats, .rv-done > .rv-back, .rv-done > .td-relearn, .rv-done > .td-actions')].map((e) => Math.round(e.getBoundingClientRect().width)));
  check(widths.length === 4 && new Set(widths).size === 1, `${tag}: summary blocks share one width (${widths})`);
  const bleed = await page.evaluate(() => { const b = document.querySelector('.rv-top').getBoundingClientRect(), v = document.getElementById('view').getBoundingClientRect(); return Math.abs(b.left - v.left) + Math.abs(b.right - v.right); });
  check(bleed < 1, `${tag}: the sticky review header spans the whole view (${bleed})`);
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

// ---------- audit round 3 (docs/review/audit-round3.md) ----------
const TOMORROW = addDays(TODAY, 1);
function auditDb(cards, prefs = {}) {
  const db = {}, now = new Date().toISOString();
  db['topics/tA'] = { id: 'tA', title: 'How sound travels', status: 'ready', createdAt: now, updatedAt: now, hue: 200,
    ideas: Array.from({ length: 8 }, (_, i) => ({ id: 'i' + (i + 1), title: 'Idea ' + (i + 1) })) };
  db[P('profile/cards/tA')] = { cards };
  db[P('profile')] = { prefs: { size: 'm', easy: false, theme: 'light', cap: 15, light: false, ...prefs }, days: {}, createdAt: isoDaysAgo(30) };
  return db;
}
const choiceCard = (id, iid, due, extra = {}) => ({ id, tid: 'tA', iid, type: 'choice', createdAt: isoDaysAgo(20), learnedAt: isoDaysAgo(20),
  spec: { id: id.split('_')[1], type: 'choice', q: 'Question ' + id + '?', options: ['Right', 'Wrong'], answer: 0, why: 'Because.' },
  s: { due, stability: 3.2, difficulty: 5.4, reps: 1, lapses: 0, last: addDays(TODAY, -7) }, hist: [{ at: isoDaysAgo(7), grade: 3, ok: true }], ...extra });
const badgeOf = (page) => page.evaluate(() => { const b = document.getElementById('today-badge'); return b.hidden ? 0 : Number(b.textContent); });

// #11 A target card whose lesson is not ready (a Learn it again or rebuild that failed, is under
// way, or was left part-way) is neither shown nor left due for ever: the session retires it, or
// (while the lesson is being written right now) puts it off a day, so Today and the badge agree.
async function targetNotReady() {
  const tag = 'audit #11';
  console.log(`\n== ${tag}: target cards whose lesson is not ready`);
  const now = new Date().toISOString(), tenMinAgo = new Date(Date.now() - 10 * 60e3).toISOString();
  const target = (iid, due) => ({ id: iid + '_c3', tid: 'tA', iid, type: 'target', createdAt: isoDaysAgo(20), learnedAt: isoDaysAgo(20),
    spec: { id: 'c3', type: 'target', q: 'Set the air temperature so sound travels at 350 m/s.', control: 'temp', output: 'speed', target: 350, tolerance: 2, why: 'w' },
    s: { due, stability: 3.2, difficulty: 5.4, reps: 1, lapses: 0, last: addDays(TODAY, -7) }, hist: [{ at: isoDaysAgo(7), grade: 3, ok: true }] });
  const db = auditDb({
    i1_c1: choiceCard('i1_c1', 'i1', TODAY),
    i2_c3: target('i2', addDays(TODAY, -4)), i3_c3: target('i3', addDays(TODAY, -3)), i4_c3: target('i4', addDays(TODAY, -2)), i5_c3: target('i5', addDays(TODAY, -1)),
  });
  const newLesson = { iid: 'iX', title: 'Rewritten', interactive: { controls: [{ id: 'temp', label: 'Air temperature' }] }, checks: [] };
  db['topics/tA/lessons/i2'] = { status: 'failed', updatedAt: now, lesson: null, interactive: null, error: 'The lesson could not be written.' };
  db['topics/tA/lessons/i3'] = { status: 'building', updatedAt: now, lesson: { ...newLesson, iid: 'i3' }, interactive: null };
  db['topics/tA/lessons/i4'] = { status: 'writing', updatedAt: now, lesson: null, interactive: null };          // being written right now
  db['topics/tA/lessons/i5'] = { status: 'writing', updatedAt: tenMinAgo, lesson: null, interactive: null };    // left part-way
  const app = await openApp({ file: OUT, width: 360, height: 707, config: { db } });
  const { page } = app;
  await page.goto(app.url('#/today'));
  await page.evaluate(setup, 'light');
  await page.waitForSelector('.td-plan');
  check(/5\s+cards to revisit/.test(await page.locator('.td-plan').innerText()), `${tag}: Today first counts all 5 due cards`);
  await page.locator('.td-start').click();
  await page.waitForSelector('.rv-stage > .qc');
  check(await page.locator('.rv-stage > .qc-type-choice').count() === 1, `${tag}: the session shows the choice card`);
  await page.locator('.qc-opt', { hasText: 'Right' }).click();
  await page.locator('.qc-primary').click();
  await page.locator('.qc-continue').click();
  await page.waitForSelector('.rv-done', { timeout: 15000 });
  check(/1 card/.test(await page.locator('.rv-done .td-lead').innerText()), `${tag}: only the choice card was reviewed`);
  await page.waitForTimeout(300);
  const cards = (await app.stub())[P('profile/cards/tA')].cards;
  for (const id of ['i2_c3', 'i3_c3', 'i5_c3']) {
    check(cards[id].retired === true && cards[id].hist.length === 1 && cards[id].s.reps === 1, `${tag}: ${id} (${db['topics/tA/lessons/' + id.split('_')[0]].status}) is retired, not graded`);
  }
  const w = cards.i4_c3;
  check(!w.retired && w.s.due === TOMORROW && w.hist.length === 1 && w.s.reps === 1 && w.s.stability === 3.2,
    `${tag}: a card whose lesson is being written right now waits until tomorrow, ungraded (due ${w.s.due}, retired ${w.retired})`);
  check(await badgeOf(page) === 0, `${tag}: the badge clears after the session (${await badgeOf(page)})`);
  await page.locator('.rv-done a[href="#/today"]').click();
  await page.waitForSelector('.td-clear, .td-plan');
  const after = await page.locator('.td').innerText();
  check(/Done for today/.test(after) && !/to revisit/.test(after), `${tag}: Today no longer counts the cards no session can show (${after.split('\n').slice(0, 3).join(' | ')})`);
  check(app.errors.length === 0, `${tag}: no page errors ${app.errors.join(' | ')}`);
  await app.close();
}

// #30 Closing the review while a recall answer still waits for Claude's grade: Today, the badge and
// a new session leave that card out (it counts as reviewed), and stay right once it is saved.
async function pendingRecall() {
  const tag = 'audit #30';
  console.log(`\n== ${tag}: closing review while a recall grade is pending`);
  const recall = { id: 'i1_say', tid: 'tA', iid: 'i1', type: 'recall', createdAt: isoDaysAgo(20), learnedAt: isoDaysAgo(20),
    spec: SPECS['tB/i1_say'], s: { due: TODAY, stability: 3.2, difficulty: 5.4, reps: 1, lapses: 0, last: addDays(TODAY, -7) }, hist: [{ at: isoDaysAgo(7), grade: 3, ok: true }] };
  const db = auditDb({ i1_say: recall, i2_c1: choiceCard('i2_c1', 'i2', addDays(TODAY, 3)) });
  const app = await openApp({ file: OUT, width: 360, height: 707, config: { db } });
  const { page } = app;
  await page.goto(app.url('#/today'));
  await page.evaluate(setup, 'light');
  // Claude takes 3 s to grade.
  await page.evaluate(() => {
    U.gen.grade = () => new Promise((r) => setTimeout(() => r({ met: [true, true, true], verdict: 'got-it', nailed: false, followUp: '' }), 3000));
  });
  await page.waitForSelector('.td-plan');
  await page.locator('.td-start').click();
  await page.waitForSelector('.qc-recall-input');
  await page.locator('.qc-recall-input').fill('Yeast eat the sugar in flour and give off gas, and gluten traps it.');
  await page.locator('.qc-primary').click();
  await page.waitForSelector('.qc-fb-recall');
  check(/Continue, Claude will grade it/.test(await page.locator('.qc-continue').innerText()), `${tag}: Dan moves on before the grade`);
  await page.locator('.qc-continue').click();
  await page.waitForSelector('.rv-wait');
  await page.locator('.rv-close').click();                       // closes while "Saving your answers…"
  await page.waitForSelector('.td-clear, .td-plan');
  await page.waitForTimeout(300);
  const today = await page.locator('.td').innerText();
  check(/Done for today/.test(today) && /reviewed 1 card today/.test(today) && !/to revisit/.test(today),
    `${tag}: Today does not offer the card being saved (${today.split('\n').slice(0, 3).join(' | ')})`);
  check(await badgeOf(page) === 0, `${tag}: the badge does not count it (${await badgeOf(page)})`);
  check((await page.evaluate(() => U.review.queue())).length === 0, `${tag}: a new session would not show it again`);
  await page.waitForTimeout(3500);
  const saved = (await app.stub())[P('profile/cards/tA')].cards.i1_say;
  check(saved.hist.length === 2 && saved.hist[1].grade === 3 && saved.s.due > TODAY, `${tag}: the answer is saved once graded (due ${saved.s.due})`);
  check(await badgeOf(page) === 0 && await page.evaluate(() => U.review.dueCount()) === 0, `${tag}: the badge stays right after it lands`);
  check(app.errors.length === 0, `${tag}: no page errors ${app.errors.join(' | ')}`);
  await app.close();
}

// #30, the race: on a slow connection Today's read of the cards begins as Dan closes the review,
// the grade lands while that read is on its way, and the read answers with the card still due.
// Today must not offer it again. The reads are held until the answer is in the db, so the race
// happens every time however loaded the machine is.
async function pendingRace() {
  const tag = 'audit #30 race';
  console.log(`\n== ${tag}: the grade lands while Today's plan is being read`);
  const recall = { id: 'i1_say', tid: 'tA', iid: 'i1', type: 'recall', createdAt: isoDaysAgo(20), learnedAt: isoDaysAgo(20),
    spec: SPECS['tB/i1_say'], s: { due: TODAY, stability: 3.2, difficulty: 5.4, reps: 1, lapses: 0, last: addDays(TODAY, -7) }, hist: [{ at: isoDaysAgo(7), grade: 3, ok: true }] };
  const app = await openApp({ file: OUT, width: 360, height: 707, config: { db: auditDb({ i1_say: recall }) } });
  const { page } = app;
  await page.goto(app.url('#/today'));
  await page.evaluate(setup, 'light');
  await page.evaluate(() => {
    // Claude's grade arrives when the test says; so do the cards, once window.__slow is set: each
    // read answers with what was stored when it began.
    const gate = new Promise((r) => { window.__releaseGrade = r; });
    U.gen.grade = () => gate.then(() => ({ met: [true, true, true], verdict: 'got-it', nailed: false, followUp: '' }));
    const all = U.store.cards.all, held = [];
    U.store.cards.all = function () {
      return all.call(U.store.cards).then((v) => (window.__slow ? new Promise((r) => held.push(() => r(v))) : v));
    };
    window.__answerReads = () => { window.__slow = false; held.splice(0).forEach((f) => f()); };
  });
  await page.waitForSelector('.td-plan');
  await page.locator('.td-start').click();
  await page.waitForSelector('.qc-recall-input');
  await page.locator('.qc-recall-input').fill('Yeast eat the sugar in flour and give off gas, and gluten traps it.');
  await page.locator('.qc-primary').click();
  await page.locator('.qc-continue').click();
  await page.waitForSelector('.rv-wait');
  await page.evaluate(() => { window.__slow = true; });
  await page.locator('.rv-close').click();
  await page.waitForSelector('.td-loading');                      // Today's read is on its way
  await page.evaluate(() => window.__releaseGrade());
  const landed = async () => ((await app.stub())[P('profile/cards/tA')].cards.i1_say.hist || []).length === 2;
  for (let i = 0; i < 100 && !(await landed()); i++) await page.waitForTimeout(100);
  check(await landed(), `${tag}: the answer is saved while Today's read is still on its way`);
  check(await page.locator('.td-loading').count() === 1, `${tag}: Today is still waiting for its read`);
  await page.evaluate(() => window.__answerReads());
  await page.waitForSelector('.td-clear, .td-plan');
  await page.waitForTimeout(300);
  const today = await page.locator('.td').innerText();
  check(/Done for today/.test(today) && /reviewed 1 card today/.test(today) && !/to revisit/.test(today),
    `${tag}: Today does not offer the card just saved (${today.split('\n').slice(0, 3).join(' | ')})`);
  check(await badgeOf(page) === 0 && await page.evaluate(() => U.review.dueCount()) === 0, `${tag}: the badge and a new session agree`);
  check(app.errors.length === 0, `${tag}: no page errors ${app.errors.join(' | ')}`);
  await app.close();
}

// #31 Light day turned on after 6 reviews (cap 5) with 8 more due: "Done for today" with
// "Review 5 more", not "0 cards to revisit"; the switch stays to undo it; #/review says the limit
// is reached instead of "holding up".
async function lightAfterReviews() {
  const tag = 'audit #31';
  console.log(`\n== ${tag}: Light day after some reviews`);
  const cards = {};
  for (let i = 1; i <= 14; i++) {
    const iid = 'i' + ((i % 8) + 1), id = iid + '_c' + i;
    cards[id] = i <= 6
      ? choiceCard(id, iid, addDays(TODAY, 4), { s: { due: addDays(TODAY, 4), stability: 4, difficulty: 5, reps: 2, lapses: 0, last: TODAY }, hist: [{ at: isoDaysAgo(4), grade: 3, ok: true }, { at: new Date().toISOString(), grade: 3, ok: true }] })
      : choiceCard(id, iid, TODAY);
  }
  const app = await openApp({ file: OUT, width: 360, height: 707, config: { db: auditDb(cards) } });
  const { page } = app;
  await page.goto(app.url('#/today'));
  await page.evaluate(setup, 'light');
  await page.waitForSelector('.td-plan');
  check(/8\s+cards to revisit/.test(await page.locator('.td-plan').innerText()), `${tag}: 8 cards to revisit before`);
  await page.locator('.td-light').click();
  const clear = await page.waitForSelector('.td-clear', { timeout: 3000 }).catch(() => null);
  const text = await page.locator('.td').innerText();
  check(!!clear && /Done for today/.test(text) && /reviewed 6 cards today/.test(text) && !/0\s+cards to revisit/.test(text),
    `${tag}: Light day says done for today, not "0 cards to revisit" (${text.split('\n').slice(0, 4).join(' | ')})`);
  check(await page.locator('.td-clear a[href="#/review/more"]').innerText().catch(() => '') === 'Review 5 more' && /8 more cards are due/.test(text), `${tag}: offers Review 5 more`);
  check(await page.locator('.td-clear .td-light .switch:checked').count() === 1, `${tag}: the Light day switch stays, on, to undo it`);
  check(await page.evaluate(() => !!document.activeElement && document.activeElement.matches('.td-light .switch')), `${tag}: focus stays on the switch`);
  await page.waitForTimeout(600);
  check(await badgeOf(page) === 0, `${tag}: the badge clears (${await badgeOf(page)})`);
  await page.screenshot({ path: join(ROOT, 'tests', 'out', 'review-audit31-lightday-done.png'), fullPage: true });
  // Undo: back to the plan with the normal cap.
  await page.locator('.td-light').click();
  await page.waitForSelector('.td-plan', { timeout: 3000 }).catch(() => null);
  check(/8\s+cards to revisit/.test(await page.locator('.td').innerText()), `${tag}: turning it off brings the 8 cards back`);
  check(await page.evaluate(() => !!document.activeElement && document.activeElement.matches('.td-plan .td-light .switch')), `${tag}: focus follows to the plan's switch`);
  // On again, then the review route itself.
  await page.locator('.td-light').click();
  await page.waitForSelector('.td-clear', { timeout: 3000 }).catch(() => null);
  await page.goto(app.url('#/review'));
  await page.waitForSelector('.rv-empty');
  const empty = await page.locator('.rv-empty').innerText();
  check(/Done for today/.test(empty) && /8 more cards are due/.test(empty) && !/holding up/.test(empty), `${tag}: #/review says it is done for today, with Today's words, and the cards still due (${empty.replace(/\n/g, ' | ')})`);
  check(await page.locator('.rv-empty a[href="#/review/more"]').count() === 1, `${tag}: #/review offers Review 5 more`);
  await page.locator('.rv-empty a[href="#/review/more"]').click();
  await page.waitForSelector('.rv-stage > .qc');
  check(/1 of 5/.test(await page.locator('.rv-count').innerText()), `${tag}: Review 5 more starts a batch of 5`);
  check(app.errors.length === 0, `${tag}: no page errors ${app.errors.join(' | ')}`);
  await app.close();
}

// NEXT.md 10: the line saying where a card comes from wraps on a phone instead of ending in "…",
// so the topic and the idea stay readable at every text size.
async function whereWraps() {
  const tag = 'where line';
  console.log(`\n== ${tag}: wraps on a phone`);
  const db = auditDb({ i1_c1: choiceCard('i1_c1', 'i1', TODAY) });
  db['topics/tA'] = { ...db['topics/tA'], title: 'Why pendulums keep time', ideas: [{ id: 'i1', title: 'What sets the time of one swing, and what does not' }] };
  for (const size of ['m', 'xl']) {
    for (const [width, theme] of [[360, 'light'], [390, 'dark']]) {
      const app = await openApp({ file: OUT, width, height: width === 360 ? 707 : 844, dark: theme === 'dark', config: { db } });
      const { page } = app;
      await page.goto(app.url('#/review'));
      await page.evaluate(setup, theme);
      await page.evaluate((s) => { document.documentElement.dataset.size = s; }, size);
      await page.waitForSelector('.rv-stage > .qc');
      const r = await page.evaluate(() => {
        const w = document.querySelector('.rv-where'), cs = getComputedStyle(w);
        return { text: w.textContent, cut: w.scrollWidth > w.clientWidth + 1 || cs.textOverflow === 'ellipsis', lines: Math.round(w.getBoundingClientRect().height / parseFloat(cs.lineHeight)), right: w.getBoundingClientRect().right, vw: innerWidth };
      });
      check(r.text === 'Why pendulums keep time · What sets the time of one swing, and what does not', `${tag} ${width}-${theme}-${size}: names the topic and the idea (${r.text})`);
      check(!r.cut && r.lines >= 2 && r.right <= r.vw - 16, `${tag} ${width}-${theme}-${size}: wraps, nothing cut (${JSON.stringify(r)})`);
      await page.screenshot({ path: join(ROOT, 'tests', 'out', `review-where-${width}-${theme}-${size}.png`) });
      check(app.errors.length === 0, `${tag}: no page errors ${app.errors.join(' | ')}`);
      await app.close();
    }
  }
}

// v9: an idea Dan finished as a read lesson is never counted, though cards from its earlier,
// studied round are still due in the db.
async function readIdeas() {
  const tag = 'v9 read ideas';
  console.log(`\n== ${tag}`);
  const db = seedDb();
  db[P('profile/progress/tA')] = { ideas: { i1: { round: 1, stage: 'done', doneAt: isoDaysAgo(1), readRound: 1, cardsRound: 1, againAt: isoDaysAgo(2) } } };
  const app = await openApp({ file: OUT, width: 360, height: 707, config: { db } });
  const { page } = app;
  await page.goto(app.url('#/today'));
  await page.evaluate(setup, 'light');
  await page.waitForSelector('.td-plan');
  const n = await page.evaluate(() => U.review.dueCount());
  check(n === 5, `${tag}: Today counts 5 cards, not the read idea's 2 (got ${n})`);
  await page.evaluate(() => U.review.refreshBadge());
  check(await badgeOf(page) === 5, `${tag}: and so does the badge`);
  const q = await page.evaluate(async () => (await U.review.queue({ extra: true, cap: 50 })).map((c) => c.tid + '/' + c.iid));
  check(!q.includes('tA/i1'), `${tag}: a review never shows its cards (${q})`);
  check(/\b5\b/.test(await page.locator('.td-plan').innerText()), `${tag}: Today's plan says 5`);
  await page.screenshot({ path: join(ROOT, 'tests', 'out', 'review-v9-read-ideas.png') });
  check(app.errors.length === 0, `${tag}: no page errors ${app.errors.join(' | ')}`);
  await app.close();
}

// ONLY=360-light node tests/e2e/review.spec.mjs runs a single combination while iterating.
const RUNS = [{ width: 360, theme: 'light', full: true }, { width: 360, theme: 'dark' }, { width: 1280, theme: 'light' }, { width: 1280, theme: 'dark' }]
  .filter((r) => !process.env.ONLY || process.env.ONLY === `${r.width}-${r.theme}`);
try {
  for (const r of RUNS) await runSession({ full: false, ...r });
  if (!process.env.ONLY || process.env.ONLY === 'regressions') await regressions();
  if (!process.env.ONLY || process.env.ONLY === 'audit3') {
    await targetNotReady();
    await pendingRecall();
    await pendingRace();
    await lightAfterReviews();
    await whereWraps();
  }
  if (!process.env.ONLY || process.env.ONLY === 'v9') await readIdeas();
} catch (e) {
  failures.push('crashed: ' + (e.stack || e));
  console.error(e);
}
console.log(failures.length ? `\n${failures.length} FAILED:\n- ` + failures.join('\n- ') : '\nall review checks passed');
process.exit(failures.length ? 1 : 0);
