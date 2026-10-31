#!/usr/bin/env node
// Browser tests for a lesson's problem set (54-problems.js): a ready-made steps lesson's worked
// examples with a figure for an answer, worked on paper and typed in (Dan, 27 Oct). The course
// page links a finished lesson's problems; the set asks them one at a time, a wrong first answer
// gets one more go, then the working shows; the end gives the score, lists the problems, and saves
// progress.ideas[iid].problems, which the course page then shows. A lesson with no figures says so.
// Its finish screens (the lesson's, the read-through's) link to it. The full app, the model never
// called, the puzzle box hidden as it is by default. Screenshots in tests/out/problems/.
// Usage: node tests/e2e/problems.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'problems.html');
const SHOTS = join(ROOT, 'tests', 'out', 'problems');
const FILTER = process.argv[2] || '';
const UID = 'u_stubuser0000000000000000';
const PROGRESS = `data/users/${UID}/profile/progress/pendulums`;
const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FILE], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);
mkdirSync(SHOTS, { recursive: true });

const fx = (n) => JSON.parse(readFileSync(join(ROOT, 'tests', 'fixtures', n), 'utf8'));
const results = [];
let current = null;
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
async function test(name, fn) {
  if (FILTER && !name.includes(FILTER)) return;
  current = { name, apps: [] };
  try {
    await fn();
    for (const app of current.apps) assert(app.errors.length === 0, 'page errors:\n  ' + app.errors.join('\n  '));
    results.push({ name, ok: true });
    console.log(`ok    ${name}`);
  } catch (e) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name}\n      ${String(e && e.stack || e).split('\n').slice(0, 4).join('\n      ')}`);
    for (const app of current.apps) await app.shot('problems/fail-' + name.replace(/\W+/g, '-').slice(0, 40)).catch(() => {});
  } finally {
    for (const app of current.apps) await app.close().catch(() => {});
  }
}

// A ready-made course: i1 with three figure problems (a typed one, a figure picked in the lesson,
// an About figure) among words and named options; i2 with words only; i3 with no guide.
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80" width="340" height="80"><rect x="20" y="10" width="300" height="60" style="fill:#2A78D6"/></svg>';
const BODY = '<p class="say">The lesson.</p><div id="fin"></div><script>K.button({ label: "Finish", into: document.getElementById("fin"), press: function () { K.complete(); } }); K.ready();</script>';
function stepsLesson(iid) {
  const d = fx('lesson-ui-pendulum.json');
  d.lesson.iid = iid; d.lesson.mode = 'read'; d.lesson.format = 'steps';
  d.lesson.predict = null; d.lesson.say = null; d.lesson.checks = [];
  d.interactive.html = BODY;
  return d;
}
const GUIDE1 = { v: 2, iid: 'i1', pages: [
  { kind: 'show', name: 'Bar', text: 'The design current is what the circuit carries.', svg: SVG, alt: 'A bar.' },
  { kind: 'example', name: 'Typed', task: 'A plant room is 6 m by 4 m. What is its area?', answer: '24 m²', why: '6 × 4 = 24.', svg: SVG, alt: 'Solved.', input: 'typed', unit: 'm²' },
  { kind: 'example', name: 'Words', task: 'Which floor is bigger?', answer: 'Floor B', why: 'It is wider.', svg: SVG, alt: '', input: 'pick', options: ['Floor A', 'Floor B'] },
  { kind: 'example', name: 'Picked figure', task: 'The load draws 100 A through 7 mΩ. What are the lost volts?', answer: '0.70 V', why: 'I × r = 100 × 0.007 = 0.70 V.', svg: SVG, alt: 'Solved.', input: 'pick', options: ['0.07 V', '0.70 V', '7.0 V'] },
  { kind: 'example', name: 'Named', task: 'Which of these is the line voltage?', answer: '440 V', why: '254 × 1.732.', svg: null, alt: '', input: 'pick', options: ['254 V', '440 V'] },
  { kind: 'example', name: 'About', task: 'A 100 V board: 500 kΩ and 51 kΩ to the hull. What does the negative read?', answer: 'About 9.26 V', why: '100 × 51 ÷ 551 = 9.26 V.', svg: SVG, alt: 'Solved.', input: 'pick', options: ['About 51 V', 'About 9.26 V'] },
] };
const GUIDE2 = { v: 2, iid: 'i2', pages: [
  { kind: 'example', name: 'Which', task: 'Which is faster, a short or a long string?', answer: 'The short one', why: 'A shorter arc.', svg: null, alt: '', input: 'pick', options: ['The short one', 'The long one'] },
] };
const at = '2026-10-26T10:00:00.000Z';
const doneIdea = { round: 0, stage: 'done', startedAt: at, doneAt: at, readRound: 0, cardsRound: 0, quizRound: 0 };
function db(progress) {
  const t = fx('lesson-ui-topic.json');
  return {
    'topics/pendulums': { ...t, mode: 'read', readyMade: { shelf: 'maths', course: 'pendulums' } },
    'topics/pendulums/lessons/i1': stepsLesson('i1'), 'topics/pendulums/lessons/i2': stepsLesson('i2'), 'topics/pendulums/lessons/i3': stepsLesson('i3'),
    'topics/pendulums/guide/i1': GUIDE1, 'topics/pendulums/guide/i2': GUIDE2,
    [PROGRESS]: progress || { updatedAt: at, way: 'quiz', ideas: { i1: { ...doneIdea }, i2: { ...doneIdea } } },
  };
}
// Claude, played by each test: a reply per TASK (the prompt's first line); calls are recorded with their image count.
let replies = {}, asked = [];
const taskOf = (input) => String(typeof input === 'string' ? input : input[input.length - 1].content).split('\n')[0].replace('TASK: ', '');
async function open({ width = 360, dark = false, hash = '#/t/pendulums', progress = null } = {}) {
  const app = await openApp({ width, height: width < 700 ? 780 : 900, dark, file: FILE, config: { db: db(progress) },
    sample: (input, info) => { const t = taskOf(input); asked.push({ task: t, images: info.images }); return replies[t] ? replies[t](input) : new Promise(() => {}); } });
  current.apps.push(app);
  await app.page.addInitScript((v) => { try { if (!sessionStorage.getItem('__p')) { localStorage.setItem('mu-prefs', JSON.stringify(v)); sessionStorage.setItem('__p', '1'); } } catch (e) {} }, { theme: dark ? 'dark' : 'light', size: 'm' });
  await app.page.goto(app.url(hash));
  await app.booted();
  return app;
}
const doc = (app, p) => app.page.evaluate((x) => { const d = window.__CLAUDE_STUB__.get(x); return d === undefined ? null : d; }, p);
const noSideways = async (app, tag) => { const w = await app.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); assert(w[0] <= w[1], `${tag}: no sideways scroll (${w[0]} > ${w[1]})`); };
const shot = (app, name) => app.page.waitForTimeout(300).then(() => app.page.screenshot({ path: join(SHOTS, name + '.png'), fullPage: true }));
async function answer(app, text) {
  const input = app.page.locator('.qc-typed-input:not([readonly])');
  await input.fill(text);
  await app.page.locator('.qc-foot .btn', { hasText: 'Check' }).click();
}

await test('the course page links each finished lesson\'s problems', async () => {
  const app = await open();
  await app.page.locator('.pnode-problems').first().waitFor({ timeout: 20000 });
  const links = await app.page.evaluate(() => [...document.querySelectorAll('.pnode-problems')].map((a) => [a.textContent.trim(), a.getAttribute('href')]));
  eq(links, [['Work the problems', '#/t/pendulums/i1/problems'], ['Work the problems', '#/t/pendulums/i2/problems']], 'one per finished lesson with a guide');
  await noSideways(app, 'course page');
  await shot(app, 'course-360-light');
});

await test('a problem set: figures only, typed; a wrong first answer gets one more go; the score is kept and shown', async () => {
  for (const [width, dark] of [[360, false], [360, true], [1280, false]]) {
    const app = await open({ width, dark, hash: '#/t/pendulums/i1/problems' });
    await app.page.locator('.pb-start .btn', { hasText: /^Start$/ }).click({ timeout: 20000 });
    await app.page.locator('.qc-typed-input').waitFor({ timeout: 20000 });
    const head = await app.page.evaluate(() => ({ bar: document.querySelector('.rd-bar-label').textContent, calc: !!document.querySelector('.rd-bar .rd-calc, .rd-bar [aria-label*="alculator"]'),
      lede: document.querySelector('.pb-lede').textContent, kind: document.querySelector('.qc-kind').textContent, q: document.querySelector('.qc-q').textContent,
      unit: (document.querySelector('.qc-typed-unit') || {}).textContent || '', pic: document.querySelectorAll('.qc .rd-pic, .qc .rd-still').length }));
    eq([head.bar, head.calc, head.kind, head.q, head.unit, head.pic], ['Problems', true, 'Problem 1 of 3', 'A plant room is 6 m by 4 m. What is its area?', 'm²', 0], 'the first problem, its unit, the calculator in the bar, no picture before the answer');
    assert(/^3 problems from this lesson\. Work each one out on paper/.test(head.lede), 'the lede: ' + head.lede);
    if (width === 360 && !dark) await shot(app, 'first-360-light');
    // 1: wrong, then right on the second go.
    await answer(app, '25');
    const retry = await app.page.evaluate(() => ({ msg: document.querySelector('.qc-typed-msg').textContent, fb: !!document.querySelector('.qc-fb'), ro: document.querySelector('.qc-typed-input').readOnly }));
    eq(retry, { msg: 'Not quite: 25 is not it. Check your working and try again.', fb: false, ro: false }, 'one more go, no working yet');
    if (width === 360) await shot(app, 'retry-360-' + (dark ? 'dark' : 'light'));
    await answer(app, '24');
    await app.page.locator('.qc-fb.is-right').waitFor({ timeout: 5000 });
    eq(await app.page.evaluate(() => document.querySelectorAll('.qc-fb .rd-pic').length), 1, 'the solved picture with the answer');
    await app.page.locator('.qc-continue').click();
    // 2: a figure picked in the lesson, typed here: wrong twice, then the working.
    await app.page.locator('.qc-kind', { hasText: 'Problem 2 of 3' }).waitFor({ timeout: 5000 });
    eq(await app.page.evaluate(() => document.querySelectorAll('.qc-choice, .qc-opt, .qc .choice').length), 0, 'no options to pick from');
    await answer(app, '7');
    await answer(app, '0.07');
    await app.page.locator('.qc-fb.is-wrong').waitFor({ timeout: 5000 });
    const shown = await app.page.evaluate(() => document.querySelector('.qc-fb').innerText.replace(/\s+/g, ' '));
    assert(/You said 0\.07\. The answer: 0\.70 V\./.test(shown) && /100 × 0\.007 = 0\.70 V/.test(shown), 'the answer and the working: ' + shown);
    if (width === 360 && !dark) await shot(app, 'wrong-360-light');
    await app.page.locator('.qc-continue').click();
    // 3: an About figure, within 1%.
    await app.page.locator('.qc-kind', { hasText: 'Problem 3 of 3' }).waitFor({ timeout: 5000 });
    eq(await app.page.evaluate(() => (document.querySelector('.qc-typed-unit') || {}).textContent), 'V', 'the About answer\'s unit');
    await answer(app, '9.3');
    await app.page.locator('.qc-fb.is-right').waitFor({ timeout: 5000 });
    await app.page.locator('.qc-continue').click();
    // The end: the score, the list, saved.
    await app.page.locator('.pb-end').waitFor({ timeout: 5000 });
    const end = await app.page.evaluate(() => ({ h: document.querySelector('.pb-end h2').textContent, text: (document.querySelector('.pb-end .lsn-done-text') || {}).textContent,
      rows: [...document.querySelectorAll('.pb-list li')].map((li) => [li.className, li.querySelector('.pb-a').textContent]) }));
    eq(end, { h: '1 of 3 right first time', text: '1 more on the second go. One to look at again.',
      rows: [['is-right', 'Right on the second go: 24 m²'], ['is-wrong', 'You said 0.07. The answer: 0.70 V'], ['is-right', 'Right: About 9.26 V']] }, 'the end');
    await app.page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.ideas && d.ideas.i1 && d.ideas.i1.problems; }, PROGRESS, { timeout: 10000 });
    const pb = (await doc(app, PROGRESS)).ideas.i1;
    eq([pb.problems.of, pb.problems.first, pb.problems.right, pb.stage], [3, 1, 2, 'done'], 'the score saved, the lesson left done');
    await noSideways(app, 'end');
    if (width === 360) await shot(app, 'end-360-' + (dark ? 'dark' : 'light'));
    if (width === 1280) await shot(app, 'end-1280-light');
    // Work them again starts over; the course page shows the score.
    await app.page.locator('.pb-go .btn', { hasText: 'Again with the lesson\'s numbers' }).click();
    await app.page.locator('.qc-kind', { hasText: 'Problem 1 of 3' }).waitFor({ timeout: 5000 });
    await app.page.evaluate(() => U.go('#/t/pendulums'));
    await app.page.locator('.pnode-problems').first().waitFor({ timeout: 20000 });
    eq(await app.page.evaluate(() => document.querySelector('.pnode-problems').textContent), 'Problems: 1 of 3 first time', 'the course page shows the last score');
  }
});

await test('a lesson whose questions are all words says it has no problems', async () => {
  const app = await open({ hash: '#/t/pendulums/i2/problems' });
  await app.page.locator('.pb-none').waitFor({ timeout: 20000 });
  const t = await app.page.evaluate(() => ({ text: document.querySelector('.pb-none p').textContent, links: [...document.querySelectorAll('.pb-none a')].map((a) => a.getAttribute('href')) }));
  eq(t, { text: 'This lesson has no problems with a figure to work out. Its questions are answered by choosing words or by moving the picture.', links: ['#/t/pendulums/i2', '#/t/pendulums'] }, 'said, with the way back');
  await shot(app, 'none-360-light');
});

await test('the read-through\'s finish links the problems', async () => {
  const app = await open({ hash: '#/t/pendulums/i1/read', progress: { updatedAt: at, way: 'read', ideas: {} } });
  await app.page.locator('.rd-finish').click({ timeout: 20000 });
  await app.page.locator('.rd-done').waitFor({ timeout: 5000 });
  eq(await app.page.evaluate(() => [...document.querySelectorAll('.rd-done a')].filter((a) => /problems/.test(a.getAttribute('href'))).map((a) => [a.textContent, a.getAttribute('href')])),
    [['Work the problems on paper', '#/t/pendulums/i1/problems']], 'the link');
});

await test('new numbers: Claude writes them, the app checks each formula and works the answers; a problem that fails keeps the lesson\'s numbers', async () => {
  replies = { 'new-numbers': () => ({ problems: [
    { id: 'i1_x1', vars: { W: { was: 6, now: 8 }, L: { was: 4, now: 5 } }, formula: '{W} * {L}', task: 'A plant room is 8 m by 5 m. What is its area?', why: '8 × 5 = {answer}.' },
    { id: 'i1_x3', vars: { I: { was: 100, now: 150 }, r: { was: 7, now: 5 } }, formula: '{I} * {r} / 100', task: 'The load draws 150 A through 5 mΩ. What are the lost volts?', why: '{answer}' },
    { id: 'i1_x5', skip: true },
  ] }) };
  asked = [];
  const app = await open({ hash: '#/t/pendulums/i1/problems' });
  await app.page.locator('.pb-start .btn', { hasText: 'Start with new numbers' }).click({ timeout: 20000 });
  await app.page.locator('.qc-kind', { hasText: 'Problem 1 of 3' }).waitFor({ timeout: 10000 });
  const one = await app.page.evaluate(() => ({ kind: document.querySelector('.qc-kind').textContent, q: document.querySelector('.qc-q').textContent, note: (document.querySelector('.pb-fresh-note') || {}).textContent }));
  eq(one, { kind: 'Problem 1 of 3 · new numbers', q: 'A plant room is 8 m by 5 m. What is its area?', note: '1 of the 3 problems have new numbers; the rest keep the lesson\'s.' }, 'the new problem, said so');
  eq(asked.map((a) => a.task), ['new-numbers'], 'one call for the set');
  await answer(app, '40');
  await app.page.locator('.qc-fb.is-right').waitFor({ timeout: 5000 });
  const fb = await app.page.evaluate(() => ({ pics: document.querySelectorAll('.qc-fb .rd-pic').length, why: document.querySelector('.qc-fb').innerText.replace(/\s+/g, ' ') }));
  assert(fb.pics === 0 && /8 × 5 = 40 m²/.test(fb.why), 'no lesson picture for new numbers; the working with the app\'s answer: ' + JSON.stringify(fb));
  await app.page.locator('.qc-continue').click();
  await app.page.locator('.qc-kind', { hasText: 'Problem 2 of 3' }).waitFor({ timeout: 5000 });
  eq(await app.page.evaluate(() => [document.querySelector('.qc-kind').textContent, document.querySelector('.qc-q').textContent]),
    ['Problem 2 of 3', 'The load draws 100 A through 7 mΩ. What are the lost volts?'], 'a formula that does not give the lesson\'s answer: the lesson\'s numbers');
  await shot(app, 'fresh-360-light');
});

await test('check my working: a photo of the paper goes to Claude, and its reading of the method shows under the working', async () => {
  replies = { 'check-working': () => ({ verdict: 'slip', line: '6 x 4 = 25', note: 'You chose the right rule and put in both sides. The multiplication slipped.', next: 'Six fours are twenty-four.' }) };
  asked = [];
  const app = await open({ hash: '#/t/pendulums/i1/problems' });
  await app.page.locator('.pb-start .btn', { hasText: /^Start$/ }).click({ timeout: 20000 });
  await answer(app, '25');
  await answer(app, '26');
  await app.page.locator('.qc-fb.is-wrong .pr-photo:not([hidden])').waitFor({ timeout: 5000 });
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  await app.page.locator('.pr-photo input[type=file]').setInputFiles({ name: 'working.png', mimeType: 'image/png', buffer: png });
  await app.page.locator('.pr-photo-res').waitFor({ timeout: 10000 });
  const r = await app.page.evaluate(() => document.querySelector('.pr-photo-res').innerText.replace(/\s+/g, ' '));
  assert(/One slip to put right/.test(r) && /6 x 4 = 25/.test(r) && /Six fours are twenty-four/.test(r), 'the reading: ' + r);
  eq(asked.map((a) => [a.task, a.images]), [['check-working', 1]], 'one call, with the photo');
  const prompt = await app.page.evaluate(() => window.__CLAUDE_STUB__.calls.filter((c) => c.kind === 'sample').map((c) => String(c.input))[0]);
  assert(/HE TYPED: "26"/.test(prompt) && /THE RIGHT ANSWER: 24 m²/.test(prompt), 'the prompt carries the problem and his answer');
  await shot(app, 'photo-360-light');
});

await test('mixed problems: from Today, across his finished lessons; one course from its page; a course with none says so', async () => {
  replies = {};
  const app = await open({ hash: '#/today' });
  await app.page.locator('.td-mix').waitFor({ timeout: 20000 });
  eq(await app.page.evaluate(() => document.querySelector('.td-mix').getAttribute('href')), '#/problems/mix', 'Today\'s row');
  await app.page.locator('.td-mix').click();
  await app.page.locator('.pb-course').waitFor({ timeout: 20000 });
  eq(await app.page.evaluate(() => [...document.querySelectorAll('.pb-course')].map((l) => [l.querySelector('input').checked, l.innerText.replace(/\s+/g, ' ').trim()])),
    [[true, 'Why pendulums keep time 2 lessons finished']], 'the courses with finished lessons, chosen');
  await shot(app, 'mix-pick-360-light');
  await app.page.locator('.pb-start .btn', { hasText: 'Make the set' }).click();
  await app.page.locator('.pb-start .btn', { hasText: /^Start$/ }).click({ timeout: 20000 });
  await app.page.locator('.qc-kind').waitFor({ timeout: 5000 });
  const k = await app.page.evaluate(() => document.querySelector('.qc-kind').textContent);
  assert(/^Problem 1 of 3 · Why pendulums keep time, lesson 1$/.test(k), 'all three of lesson 1\'s figures (lesson 2 has none), each says where it is from: ' + k);
  await noSideways(app, 'mixed');
  // From the course page: Practise on paper, its mixed problems alone.
  await app.page.evaluate(() => U.go('#/t/pendulums'));
  await app.page.locator('.tp-practise').waitFor({ timeout: 20000 });
  eq(await app.page.evaluate(() => [...document.querySelectorAll('.tp-practise a')].map((a) => [a.textContent, a.getAttribute('href')])),
    [['Formula sheet', '#/sheet/pendulums'], ['Mixed problems', '#/problems/mix?topic=pendulums']], 'the course page\'s row');
  await app.page.locator('.tp-practise a', { hasText: 'Mixed problems' }).click();
  await app.page.locator('.pb-start .btn', { hasText: 'Make the set' }).waitFor({ timeout: 20000 });
  eq(await app.page.evaluate(() => document.querySelectorAll('.pb-course').length), 0, 'one course: no picker');
  const none = await open({ hash: '#/problems/mix', progress: { updatedAt: at, way: 'quiz', ideas: {} } });
  await none.page.locator('.pb-none').waitFor({ timeout: 20000 });
});

await test('formula sheet: Claude writes it once from the lessons, it is kept and shown at once next time, and a copy can be saved', async () => {
  replies = { 'formula-sheet': () => ({ sections: [
    { lesson: 1, title: 'What sets the beat', rules: [{ name: 'The period', formula: 'T = 2π √(L ÷ g)', symbols: 'T in s, L in m, g = 9.81 m/s²', note: 'For small swings.' }], traps: ['The mass does not change the period.'] },
    { lesson: 2, title: 'Longer strings', rules: [{ name: 'Length and period', formula: 'T ∝ √L', symbols: '', note: '' }], traps: [] },
  ] }) };
  asked = [];
  const app = await open({ hash: '#/sheet/pendulums' });
  await app.page.locator('.fs-make .btn').click({ timeout: 20000 });
  await app.page.locator('.fs-sec').first().waitFor({ timeout: 10000 });
  const s1 = await app.page.evaluate(() => ({ secs: [...document.querySelectorAll('.fs-sec')].map((x) => x.querySelector('.fs-h').textContent), f: document.querySelector('.fs-f').textContent, trap: document.querySelector('.fs-trap').textContent }));
  eq(s1, { secs: ['Lesson 1What sets the beat', 'Lesson 2Longer strings'], f: 'T = 2π √(L ÷ g)', trap: 'The mass does not change the period.' }, 'the sheet');
  const prompt = await app.page.evaluate(() => String(window.__CLAUDE_STUB__.calls.filter((c) => c.kind === 'sample')[0].input));
  assert(/^TASK: formula-sheet/.test(prompt) && /Lesson 1: /.test(prompt) && /Lesson 3: /.test(prompt), 'written from the course\'s ready lessons');
  await app.page.waitForFunction(() => { const d = window.__CLAUDE_STUB__.get('topics/pendulums/sheet/main'); return d && d.sections && d.sections.length === 2; }, null, { timeout: 10000 });
  await noSideways(app, 'sheet');
  await shot(app, 'sheet-360-light');
  await app.page.locator('.fs-end .btn', { hasText: 'Save a copy to print' }).click();
  await app.page.waitForFunction(() => window.__CLAUDE_STUB__.calls.some((c) => c.kind === 'download'), null, { timeout: 5000 });
  const dl = await app.page.evaluate(() => window.__CLAUDE_STUB__.calls.filter((c) => c.kind === 'download')[0]);
  assert(/formula-sheet\.html$/.test(dl.filename) && dl.size > 500, 'a standalone HTML copy: ' + JSON.stringify(dl).slice(0, 200));
  // Next time: shown at once, no call.
  asked = [];
  await app.page.evaluate(() => U.go('#/t/pendulums'));
  await app.page.evaluate(() => U.go('#/sheet/pendulums'));
  await app.page.locator('.fs-sec').first().waitFor({ timeout: 10000 });
  eq(asked.length, 0, 'kept: no second call');
});

console.log('\n' + results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`).join('\n'));
process.exit(results.every((r) => r.ok) ? 0 : 1);
