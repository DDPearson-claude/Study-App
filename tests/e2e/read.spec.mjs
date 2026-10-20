#!/usr/bin/env node
// Browser tests for the two ways into a ready-made steps lesson (53-read.js, 71-topic.js,
// 50-lesson.js): "Quiz me through it" (the steps lesson) and "Just read it through" (its still
// guide). The course page's current card offers both, his last choice first; other rows open his
// last choice with the other as a link; a lesson with no guide shows only the lesson. The
// read-through renders a refresher guide (its Keep this card, worked examples, pictures, a
// footnote) and a plain one; each way switches to the other; Finished reading marks the idea read
// (readRound, readThrough; no review cards) and the course page shows "Read" against "Quizzed";
// the choice is kept in his progress (progress.way). The full app, with the model never called.
// Screenshots land in tests/out/read/. Usage: node tests/e2e/read.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'read.html');
const SHOTS = join(ROOT, 'tests', 'out', 'read');
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
    for (const app of current.apps) await app.shot('read/fail-' + name.replace(/\W+/g, '-').slice(0, 40)).catch(() => {});
  } finally {
    for (const app of current.apps) await app.close().catch(() => {});
  }
}

// A ready-made course: i1 a refresher steps lesson with its guide (Keep this card first), i2 a plain
// steps lesson with its guide, i3 a steps lesson with no guide.
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80" width="340" height="80"><rect x="20" y="10" width="300" height="60" style="fill:#2A78D6"/></svg>';
const BODY = '<p class="say">The lesson.</p><div id="fin"></div><script>K.button({ label: "Finish", into: document.getElementById("fin"), press: function () { K.complete(); } }); K.ready();</script>';
function stepsLesson(iid) {
  const d = fx('lesson-ui-pendulum.json');
  d.lesson.iid = iid; d.lesson.mode = 'read'; d.lesson.format = 'steps';
  d.lesson.predict = null; d.lesson.say = null; d.lesson.checks = [];
  d.lesson.practice = { text: '- Time ten swings.' };
  d.interactive.html = BODY;
  return d;
}
const parts = fx('refresher-parts.json');
const GUIDE1 = { v: 1, iid: 'i1', pages: [
  { kind: 'summary', title: parts.summary.title, for: parts.summary.for, rule: parts.summary.rule, traps: parts.summary.traps, where: parts.summary.where,
    figures: [{ label: 'Design current, Ib', value: '23.08 A' }, { label: 'Delta, per cable', value: '13.33 A' }], figuresLabel: 'The showroom so far' },
  { kind: 'show', name: 'Bar', text: 'The design current is what the circuit carries in normal service, the [[design current]].[^1]', svg: SVG, alt: 'A blue bar.' },
  { kind: 'example', name: 'Delta', task: 'Determine the current in each cable in delta.', answer: '13.33 A', why: '23.08 ÷ √3 = 13.33 A.', svg: SVG, alt: 'Solved.' },
  { kind: 'example', name: 'Section B', task: parts.written.b1.q, answer: '', why: 'A model answer: ' + parts.written.b1.model, svg: null, alt: '' },
] };
const GUIDE2 = { v: 1, iid: 'i2', pages: [
  { kind: 'show', name: 'Pull', text: 'Gravity pulls the bob back towards the middle.', svg: SVG, alt: 'A bar.' },
  { kind: 'example', name: 'Which', task: 'Which is faster, a short or a long string?', answer: 'The short one', why: 'A shorter arc.', svg: null, alt: '' },
] };
function db(progress) {
  const t = fx('lesson-ui-topic.json');
  const out = {
    'topics/pendulums': { ...t, mode: 'read', readyMade: { shelf: 'maths', course: 'pendulums' } },
    'topics/pendulums/lessons/i1': stepsLesson('i1'), 'topics/pendulums/lessons/i2': stepsLesson('i2'), 'topics/pendulums/lessons/i3': stepsLesson('i3'),
    'topics/pendulums/guide/i1': GUIDE1, 'topics/pendulums/guide/i2': GUIDE2,
  };
  if (progress) out[PROGRESS] = progress;
  return out;
}
async function open({ width = 360, dark = false, size = 'm', hash = '#/t/pendulums', progress = null } = {}) {
  const app = await openApp({ width, height: width < 700 ? 780 : 900, dark, file: FILE, config: { db: db(progress) }, sample: () => new Promise(() => {}) });
  current.apps.push(app);
  await app.page.addInitScript((v) => { try { if (!sessionStorage.getItem('__p')) { localStorage.setItem('mu-prefs', JSON.stringify(v)); sessionStorage.setItem('__p', '1'); } } catch (e) {} }, { theme: dark ? 'dark' : 'light', size });
  await app.page.goto(app.url(hash));
  await app.booted();
  return app;
}
const doc = (app, p) => app.page.evaluate((x) => { const d = window.__CLAUDE_STUB__.get(x); return d === undefined ? null : d; }, p);
const noSideways = async (app, tag) => { const w = await app.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); assert(w[0] <= w[1], `${tag}: no sideways scroll (${w[0]} > ${w[1]})`); };
const shot = (app, name) => app.page.waitForTimeout(300).then(() => app.page.screenshot({ path: join(SHOTS, name + '.png'), fullPage: true }));
async function waysOn(app) {
  await app.page.locator('.pnode-ways, .pnode-alt').first().waitFor({ timeout: 20000 });
  return app.page.evaluate(() => ({
    current: [...document.querySelectorAll('.pnode.is-current .pnode-ways a')].map((a) => [a.textContent.trim(), a.getAttribute('href'), a.classList.contains('secondary')]),
    rows: [...document.querySelectorAll('.pnode')].map((li) => ({ href: (li.querySelector('a.pnode-link') || {}).getAttribute ? li.querySelector('a.pnode-link').getAttribute('href') : null,
      alt: li.querySelector('.pnode-alt a') ? [li.querySelector('.pnode-alt a').textContent.trim(), li.querySelector('.pnode-alt a').getAttribute('href')] : null,
      kicker: li.querySelector('.pnode-kicker').textContent })),
  }));
}

await test('the course page offers both ways for a built lesson, quiz first by default, reading no guide but the current picture\'s', async () => {
  const app = await open({ hash: '#/' });
  await app.page.evaluate(() => { const get = U.store.guide.get; window.__guides = []; U.store.guide.get = function (t, i) { window.__guides.push(i); return get.apply(this, arguments); }; U.go('#/t/pendulums'); });
  await app.page.locator('.pnode-ways').waitFor({ timeout: 20000 });
  await app.page.waitForTimeout(1500);
  const w = await app.page.evaluate(() => ({ current: [...document.querySelectorAll('.pnode.is-current .pnode-ways a')].map((a) => [a.textContent.trim(), a.getAttribute('href'), a.classList.contains('secondary')]),
    alts: document.querySelectorAll('.pnode-alt').length, later: [...document.querySelectorAll('.pnode:not(.is-current) a.pnode-link')].map((a) => a.getAttribute('href')) }));
  eq(w.current, [['Quiz me through it', '#/t/pendulums/i1', false], ['Just read it through', '#/t/pendulums/i1/read', true]], 'the current card: both ways, quiz first');
  eq([w.alts, w.later.slice(0, 2)], [0, ['#/t/pendulums/i2', '#/t/pendulums/i3']], 'lessons after the current one (not known to be built): only the lesson');
  eq(await app.page.evaluate(() => window.__guides), ['i1'], 'no guide read but the current lesson\'s picture');
  await noSideways(app, 'course page');
  await shot(app, 'course-360-light');
});

await test('Just read it through: the read-through renders the refresher guide, remembers the choice, and switches to the quiz', async () => {
  for (const [width, dark, size] of [[360, false, 'm'], [360, true, 'xl'], [1280, false, 'm']]) {
    const app = await open({ width, dark, size });
    await app.page.locator('.pnode.is-current .pnode-ways a', { hasText: 'Just read it through' }).click();
    await app.page.locator('.rd-pages').waitFor({ timeout: 20000 });
    eq(await app.page.evaluate(() => location.hash), '#/t/pendulums/i1/read', 'its own address');
    await app.page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.way === 'read'; }, PROGRESS, { timeout: 10000 });
    const r = await app.page.evaluate(async () => {
      const pics = [...document.querySelectorAll('.rd-pic')];
      await Promise.all(pics.map((i) => i.decode().catch(() => null)));
      const col = document.querySelector('.rd-pages').getBoundingClientRect().width;
      return {
        title: document.querySelector('.lsn-title').textContent, one: (document.querySelector('.rd-head .lsn-one') || {}).textContent || '',
        shows: document.querySelectorAll('.rd-show').length, examples: [...document.querySelectorAll('.rd-ex')].map((e) => e.innerText.replace(/\s+/g, ' ')),
        pics: pics.length, loaded: pics.filter((i) => i.naturalWidth > 0).length, wide: [...document.querySelectorAll('.rd-show .rd-pic')].every((i) => i.getBoundingClientRect().width >= col - 26),
        sum: (document.querySelector('.rd-sum') || {}).innerText || '', sumLast: !!document.querySelector('.rd-pages + .rd-sum + .rd-end'),
        term: !!document.querySelector('.rd-text mark.term, .rd-text .term'), fn: document.querySelectorAll('.rd-text button.fn').length,
        frames: document.querySelectorAll('iframe').length, hidden: document.querySelectorAll('.rd-body [hidden], .rd-body details:not([open])').length,
      };
    });
    eq(r.title, 'What sets the beat', 'the lesson title');
    assert(r.one.length > 10, 'and its one line');
    eq([r.shows, r.examples.length, r.pics, r.loaded], [1, 2, 2, 2], 'the demonstration and both examples, with their pictures');
    assert(r.wide, 'pictures at the column\'s width');
    assert(/Worked example/i.test(r.examples[0]) && /Answer\s*13\.33 A/i.test(r.examples[0]) && /23\.08 ÷ √3/.test(r.examples[0]), 'the answer shown, no hiding: ' + r.examples[0]);
    assert(/A model answer: The submain drops voltage/.test(r.examples[1]), 'a written question with its model answer');
    assert(r.sumLast && /Keep this/i.test(r.sum) && /Design current, Ib/.test(r.sum) && /Output alone/.test(r.sum) && /23\.08 A/.test(r.sum), 'the Keep this card, last');
    assert(r.term && r.fn === 1 && r.frames === 0 && r.hidden === 0, 'key terms, a working footnote, nothing to play or reveal');
    await app.page.locator('.rd-text button.fn').click();
    await app.page.locator('.sheet .lsn-src').waitFor();
    await app.page.keyboard.press('Escape');
    await noSideways(app, 'read-through ' + width);
    await shot(app, `read-${width}-${dark ? 'dark' : 'light'}-${size}`);
    if (width === 360 && !dark) {
      // To the quiz, and back.
      await app.page.locator('.rd-switch a', { hasText: 'Quiz me through it instead' }).click();
      await app.page.locator('.lsn-way a', { hasText: 'Read it through instead' }).waitFor({ timeout: 20000 });
      eq(await app.page.evaluate(() => location.hash), '#/t/pendulums/i1', 'the steps lesson');
      await app.page.waitForFunction((p) => window.__CLAUDE_STUB__.get(p).way === 'quiz', PROGRESS, { timeout: 10000 });
      assert(await app.page.locator('.lsn-steps-play iframe').count() === 1, 'the quiz is the lesson as before');
      await shot(app, 'quiz-switch-360');
      await app.page.locator('.lsn-way a', { hasText: 'Read it through instead' }).click();
      await app.page.locator('.rd-pages').waitFor({ timeout: 20000 });
      await app.page.waitForFunction((p) => window.__CLAUDE_STUB__.get(p).way === 'read', PROGRESS, { timeout: 10000 });
    }
  }
});

await test('Finished reading marks it read (no review cards); the course page says Read, against Quizzed, and keeps the choice', async () => {
  const at = '2026-10-19T10:00:00.000Z';
  // i2 quizzed through earlier this round; the remembered choice is the read-through.
  const app = await open({ hash: '#/t/pendulums/i1/read', progress: { updatedAt: at, way: 'read', ideas: { i2: { round: 0, stage: 'done', startedAt: at, doneAt: at, readRound: 0, cardsRound: 0, quizRound: 0 } } } });
  await app.page.locator('.rd-finish').waitFor({ timeout: 20000 });
  await app.page.locator('.rd-finish').click();
  await app.page.locator('.rd-done').waitFor();
  const next = await app.page.locator('.rd-done .lsn-next a.lsn-main').getAttribute('href');
  eq(next, '#/t/pendulums/i3/read', 'the next open lesson, read through (it opens the lesson if it has no guide)');
  await app.page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.ideas.i1 && d.ideas.i1.stage === 'done'; }, PROGRESS, { timeout: 10000 });
  const p = (await doc(app, PROGRESS)).ideas.i1;
  eq([p.stage, p.readRound, p.cardsRound, p.readThrough, p.quizRound, !!p.doneAt], ['done', 0, 0, 0, undefined, true], 'read, as a read-through');
  eq(await doc(app, `data/users/${UID}/profile/cards/pendulums`), null, 'no review cards from a read-through');
  await shot(app, 'finished-360');
  await app.page.evaluate(() => U.go('#/t/pendulums'));
  const w = await waysOn(app);
  assert(/^Read · /.test(w.rows[0].kicker) && /^Quizzed · /.test(w.rows[1].kicker), 'Read against Quizzed: ' + w.rows.map((r) => r.kicker).join(' | '));
  eq([w.rows[0].href, w.rows[0].alt], ['#/t/pendulums/i1/read', ['or quiz me through it', '#/t/pendulums/i1']], 'a lesson read through still offers the quiz');
  assert(w.current.length === 0 || w.current[0][0] === 'Just read it through', 'his choice first');
  await shot(app, 'course-after-360');
});

await test('the remembered choice comes first on the current card; a lesson with no guide opens as it is', async () => {
  const app = await open({ progress: { updatedAt: '2026-10-19T10:00:00.000Z', way: 'read', ideas: {} } });
  const w = await waysOn(app);
  eq(w.current.map((c) => [c[0], c[2]]), [['Just read it through', false], ['Quiz me through it', true]], 'read first, quiz one tap away');
  eq([w.rows[1].href, w.rows[1].alt], ['#/t/pendulums/i2', null], 'a lesson after the current one: only the lesson');
  await app.page.evaluate(() => U.go('#/t/pendulums/i3/read'));
  await app.page.locator('.lsn-steps-play iframe').waitFor({ timeout: 20000 });
  eq(await app.page.evaluate(() => location.hash), '#/t/pendulums/i3', 'no guide: the lesson at its own address');
  eq(await app.page.locator('.lsn-way:not([hidden])').count(), 0, 'and no switch to a read-through it does not have');
});

console.log('\n' + results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`).join('\n'));
process.exit(results.every((r) => r.ok) ? 0 : 1);
