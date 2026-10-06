#!/usr/bin/env node
// Browser tests for the course dossier (75-dossier.js) on the complete build, with only the model
// stubbed: the topic page's "Keep a dossier" option; the Library (dossiers first, finished and
// still being written, then "In your own words"); the reader on a phone and on a laptop (cover,
// contents, a chapter's three leaves with the plate asleep until Tap to play and drawn in ink,
// "Put it into practice" and sources, glossary and bibliography; page turns, footnotes, Easy
// reading at XL, dark, reduced motion, no sideways scroll); deleting a course and keeping (or not)
// its dossier; saving it as one HTML file; and finishing an idea in a lesson binding its chapter.
// Nothing Dan wrote is ever shown, and (v9) no test question anywhere: the dossier is a book to
// learn from. Older chapters, bound before lessons had practice, end with their sources alone.
// Screenshots land in tests/out/dossier/. Exits non-zero on any failure.
// Usage: node tests/e2e/dossier.spec.mjs [filter]
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, readJson, ROOT } from '../../tools/harness/page.mjs';

const FILE = join(ROOT, 'tests', 'out', 'dossier.html');
const SHOTS = join(ROOT, 'tests', 'out', 'dossier');
const UID = 'u_stubuser0000000000000000';
const FILTER = process.argv[2] || '';
const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FILE], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);
mkdirSync(SHOTS, { recursive: true });

// ---------- tiny runner ----------
const results = [];
let current = null;
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
async function test(name, fn) {
  if (FILTER && !name.includes(FILTER)) return;
  const t0 = Date.now();
  current = { name, apps: [] };
  try {
    await fn();
    for (const app of current.apps) assert(app.errors.length === 0, 'page errors:\n  ' + app.errors.join('\n  '));
    results.push({ name, ok: true });
    console.log(`ok    ${name}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } catch (e) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name}\n      ${String(e && e.stack || e).split('\n').slice(0, 4).join('\n      ')}`);
    for (const app of current.apps) await app.shot('dossier/fail-' + name.replace(/\W+/g, '-').slice(0, 40)).catch(() => {});
  } finally {
    for (const app of current.apps) await app.close().catch(() => {});
  }
}

// ---------- fixtures: two courses, with Dan's own words planted wherever they live ----------
const fx = (n) => readJson('tests/fixtures/lesson-ui-' + n + '.json');
const clone = (o) => JSON.parse(JSON.stringify(o));
const DAN = 'DANWORDS';
const at = (m, d) => `2026-${m}-${d}T10:00:00.000Z`;
// A lesson's "Put it into practice" (lesson.practice, v9).
const PRACTICE = '**Steps**\n1. Measure the string from the pivot to the middle of the bob.\n2. Time ten swings and divide by ten.[^1]\n\n**Rule of thumb:** four times the length, twice the time.\n\n**Worked example:** a 1 m pendulum swings in about 2 s, so a 4 m one takes about 4 s.\n\n**Common mistakes**\n- Timing a single swing: your reaction time swamps it.\n- Measuring to the top of the bob.';
// Every check question, answer and trap the seeded lessons hold: none may ever be printed.
const TESTS = ['pendulum', 'small-swings', 'clocks'].flatMap((n) => (fx(n).lesson.checks || []).flatMap((c) => [c.q].concat(Object.values(c.misconception || {}))));
async function noTests(app, tag, html) {
  const t = html != null ? html : await app.page.evaluate(() => document.body.innerText);
  const hit = TESTS.filter((q) => t.includes(q)).concat((t.match(/field tests?|trap:|the right answer|quick checks?/ig) || []));
  assert(!hit.length, `${tag}: no test question, answer or "field test" anywhere: ` + hit.join(' | ').slice(0, 300));
}
function lesson(doc, iid, practice) {
  const d = clone(doc);
  d.lesson.iid = iid;
  if (practice) d.lesson.practice = { text: practice };
  d.feedback = DAN + '-feedback'; d.flags = { k1: { note: DAN + '-flag', at: at('09', '01'), stage: 'play' } };
  return d;
}
function seed({ option, finished = true } = {}) {
  const P = (rest) => `data/users/${UID}/profile/${rest}`;
  const pend = fx('topic');
  const db = {
    'topics/pendulums': { ...pend, query: DAN + '-query' },
    'topics/pendulums/lessons/i1': lesson(fx('pendulum'), 'i1', PRACTICE),
    'topics/pendulums/lessons/i3': lesson(fx('small-swings'), 'i3'),
    'topics/pendulums/lessons/i5': lesson(fx('clocks'), 'i5'),
    'topics/pendulums/research/topic': { notes: [], sources: fx('pendulum').lesson.sources.concat([{ n: 9, title: 'Pendulum clocks — Science Museum', url: 'https://www.sciencemuseum.org.uk/pendulum', quote: 'Huygens built the first pendulum clock in 1656.' }]), at: at('09', '01') },
    [P('progress/pendulums')]: { updatedAt: at('09', '20'), questions: { q1: { q: DAN + '-question', iid: 'i1', at: at('09', '03') } }, ideas: {
      i1: { stage: 'done', startedAt: at('09', '02'), doneAt: at('09', '03'), predict: { answer: DAN + '-guess', at: at('09', '02') }, say: { k1: { text: DAN + '-say', at: at('09', '03'), verdict: 'got-it' } }, checks: { c1: { correct: false } } },
      i3: { stage: 'done', startedAt: at('09', '05'), doneAt: at('09', '06') },
      i5: { stage: 'done', startedAt: at('09', '08'), doneAt: at('09', '09') },
    }, ...(option === undefined ? {} : { dossier: option }) },
  };
  if (finished) Object.assign(db, {
    'topics/clocks-ab12': { id: 'clocks-ab12', title: 'How clocks count time', query: DAN + '-query2', status: 'ready', createdAt: at('08', '01'), updatedAt: at('08', '01'), hue: 30, level: 'new',
      hook: 'Why does a clock tick evenly?', oneBreath: 'A steady swing is counted.', research: { status: 'done', sources: 2 },
      ideas: [{ id: 'i1', title: 'A steady beat', oneLine: 'The swing keeps time.', deps: [], kind: 'quantity' }, { id: 'i2', title: 'Counting the beat', oneLine: 'Gears count swings.', deps: ['i1'], kind: 'history' }] },
    'topics/clocks-ab12/lessons/i1': lesson(fx('pendulum'), 'i1'),
    'topics/clocks-ab12/lessons/i2': lesson(fx('clocks'), 'i2'),
    [P('progress/clocks-ab12')]: { updatedAt: at('08', '20'), ideas: { i1: { stage: 'done', startedAt: at('08', '02'), doneAt: at('08', '03') }, i2: { stage: 'done', startedAt: at('08', '04'), doneAt: at('08', '21') } } },
  });
  return db;
}
const DOS = (tid, rest = '') => `data/users/${UID}/profile/dossiers/${tid}${rest}`;

async function open({ width = 390, height, dark = false, db = seed(), hash = '#/', size = null, easy = false, reduced = false }) {
  const app = await openApp({ width, height: height || (width < 700 ? 844 : 900), dark, file: FILE, config: { db } });
  current.apps.push(app);
  if (reduced) await app.page.emulateMedia({ reducedMotion: 'reduce' });
  await app.page.addInitScript((v) => { try { if (!sessionStorage.getItem('__p')) { localStorage.setItem('mu-prefs', JSON.stringify(v)); sessionStorage.setItem('__p', '1'); } } catch (e) {} },
    { theme: dark ? 'dark' : 'light', size: size || 'm', easy });
  await app.page.goto(app.url(hash));
  await app.booted();
  return app;
}
const text = (app, sel) => app.page.locator(sel).first().innerText();
const doc = (app, p) => app.page.evaluate((x) => { const d = window.__CLAUDE_STUB__.get(x); return d === undefined ? null : d; }, p);
const go = (app, h) => app.page.evaluate((x) => U.go(x), h);
async function noSideways(app, tag) {
  const w = await app.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  assert(w[0] <= w[1], `${tag}: no sideways scroll (${w[0]} > ${w[1]})`);
}
async function noDan(app, tag) {
  const t = await app.page.evaluate(() => document.body.innerText);
  assert(!t.includes('DANWORDS'), `${tag}: none of Dan's own words: ` + (t.match(/DANWORDS[-\w]*/g) || []).join(', '));
}
async function focusedH1(app) {
  await app.page.waitForFunction(() => document.activeElement && document.activeElement.tagName === 'H1', null, { timeout: 8000 });
  return app.page.evaluate(() => document.activeElement.textContent);
}
async function shot(app, name, full = false) { await app.page.waitForTimeout(300); await app.page.screenshot({ path: join(SHOTS, name + '.png'), fullPage: full }); }

// =========================================================================================
await test('option: every course keeps a dossier unless Dan turns it off on its page', async () => {
  const app = await open({ hash: '#/t/pendulums', db: seed({ finished: false }) });
  const sw = app.page.locator('.tp-dos input.switch');
  await sw.waitFor();
  eq(await sw.isChecked(), true, 'on by default');
  eq(await app.page.locator('#lib-h').innerText(), 'Sources', 'the topic page\'s research section is "Sources", so "Library" means one thing');
  await app.page.locator('.tp-dos .set-switch').click();
  await app.page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.dossier === false; }, `data/users/${UID}/profile/progress/pendulums`);
  await app.page.waitForFunction(() => /Off: no chapters/.test(document.querySelector('.tp-dos').textContent));
  eq(await app.page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-key')), 'dossier-switch', 'focus stays on the switch');
  await go(app, '#/book');
  await app.page.waitForSelector('.lib-empty');
  eq(await app.page.locator('.lib-dossiers .slot').count(), 0, 'off: no dossier on the shelf');
  eq(await doc(app, DOS('pendulums')), null, 'and nothing bound');
  await go(app, '#/t/pendulums');
  await app.page.locator('.tp-dos .set-switch').click();
  // On again: what is finished is bound at once, and the page links to the dossier.
  await app.page.waitForFunction(() => /Open the dossier · 3 of 5 chapters/.test((document.querySelector('.tp-dos-open') || {}).textContent || ''), null, { timeout: 15000 });
  eq(await app.page.getAttribute('.tp-dos-open', 'href'), '#/book/pendulums', 'a link to the dossier, with the chapter count');
  await shot(app, 'option-390');
});

await test('library: dossiers first (finished, then still being written), then "In your own words"', async () => {
  for (const [w, dark] of [[390, false], [1366, true]]) {
    const app = await open({ width: w, dark, hash: '#/book' });
    await app.page.waitForSelector('.lib-dossiers .slot:not(.filler)', { timeout: 20000 });
    await app.page.waitForFunction(() => document.querySelectorAll('.lib-dossiers .slot:not(.filler)').length === 2, null, { timeout: 20000 });
    eq(await app.page.locator('#tabs .tab[data-tab="book"]').innerText(), 'Library', 'the tab is "Library"');
    eq(await app.page.getAttribute('#tabs .tab[data-tab="book"]', 'aria-current'), 'page', 'and is current');
    eq(await focusedH1(app), 'Your library', 'heading takes focus');
    eq(await app.page.title(), 'Library · My University', 'title');
    const groups = await app.page.locator('.lib-dossiers .group h3').allInnerTexts();
    assert(/^Finished\s*1$/.test(groups[0]) && /^Still being written\s*1$/.test(groups[1]), 'finished first: ' + JSON.stringify(groups));
    const fin = await app.page.locator('#sh-done ~ .shelf .book-link').first().innerText();
    assert(/How clocks count time/.test(fin) && /Finished 21 Aug/.test(fin) && /2 chapters/.test(fin), 'a finished dossier: ' + fin);
    const going = await app.page.locator('#sh-going ~ .shelf .book-link').first().innerText();
    assert(/Why pendulums keep time/.test(going) && /3 of 5 chapters/.test(going), 'still being written: ' + going);
    eq(await app.page.locator('#sh-going ~ .shelf .sq i.on').count(), 3, 'three squares filled');
    eq(await app.page.locator('#sh-done ~ .shelf .pclip').count(), 0, 'no paper clip on a finished one');
    const nos = await app.page.locator('.lib-dossiers .lbl-no').allInnerTexts();
    assert(nos.map((s) => s.trim()).sort().join() === 'NO. 1,NO. 2' || nos.map((s) => s.trim().toUpperCase()).sort().join() === 'NO. 1,NO. 2', 'numbered by when each course was begun: ' + nos);
    const fonts = await app.page.evaluate(() => [...document.querySelectorAll('link[data-dossier-fonts]')].map((l) => l.href));
    assert(fonts.length === 1 && /Walter\+Turncoat/.test(fonts[0]) && /display=swap/.test(fonts[0]), 'the hand-lettered fonts are linked once, lazily: ' + fonts);
    await noSideways(app, `library ${w}`);
    await noDan(app, 'library');
    await shot(app, `library-${w}${dark ? '-dark' : ''}`, true);
    if (w === 390) {
      await app.page.locator('a.own').click();
      await app.page.waitForSelector('.book h1');
      eq(await text(app, '.book h1'), 'In your own words', 'the Book, unchanged, at #/book/words');
      eq(await app.page.evaluate(() => location.hash), '#/book/words', 'its address');
      eq(await app.page.getAttribute('#tabs .tab[data-tab="book"]', 'aria-current'), 'page', 'still under the Library tab');
      await app.page.locator('.book .backlink').click();
      await app.page.waitForSelector('.lib-page h1');
    }
  }
});

await test('reader on a phone: cover, contents, the three leaves of a chapter, footnotes, the plate asleep until played', async () => {
  const app = await open({ width: 390, hash: '#/book/pendulums' });
  await app.page.waitForSelector('.jcover .jc-title');
  eq(await focusedH1(app), 'Why pendulums keep time', 'the cover\'s h1 takes focus');
  eq(await app.page.evaluate(() => document.getElementById('view').dataset.screen), 'dossier', 'its own screen');
  eq(await app.page.evaluate(() => document.documentElement.classList.contains('focus')), true, 'no app chrome: the leather bar instead');
  await app.page.waitForFunction(() => /3 of 5 chapters/.test(document.querySelector('.jc-prog') && document.querySelector('.jc-prog').textContent), null, { timeout: 15000 });
  await noSideways(app, 'cover');
  await shot(app, 'cover-390');
  await app.page.locator('.cover-actions a', { hasText: 'Open the dossier' }).click();
  await app.page.waitForSelector('.toc');
  eq(await focusedH1(app), 'Why pendulums keep time', 'contents: the title page\'s h1');
  eq(await app.page.locator('.toc li').count(), 5, 'every idea listed');
  eq(await app.page.locator('.toc li.unwritten').count(), 2, 'two not yet written');
  assert(/not yet written/i.test(await app.page.locator('.toc li.unwritten').first().innerText()), 'said so');
  eq(await app.page.locator('.toc li.unwritten a').count(), 0, 'and not links');
  eq(await app.page.locator('.d-tabs .off').count(), 2, 'their tabs are not links either');
  await shot(app, 'contents-390', true);
  // Chapter I, the idea.
  await app.page.locator('.toc a').first().click();
  await app.page.waitForSelector('.d-card');
  eq(await focusedH1(app), 'What sets the beat', 'chapter h1');
  eq(await app.page.locator('h1').count(), 1, 'one h1 per page');
  eq(await text(app, '.card-name'), 'PERIOD', 'Known as: the first key term');
  eq(await app.page.locator('.stamp .vh').first().textContent(), 'Chapter complete, learned on 3 September 2026', 'the stamp says when, to a screen reader');
  eq(await app.page.locator('.cert .on').textContent(), 'settled (this one)', 'how certain: the circled word, said once');
  eq(await app.page.locator('.d-tabs a[aria-current="page"]').textContent(), 'I, chapter 1: What sets the beat', 'chapter tab current, named in full');
  const tabTops = await app.page.$$eval('.d-tabs li', (l) => new Set(l.map((x) => Math.round(x.getBoundingClientRect().top))).size);
  eq(tabTops, 1, 'chapter tabs in one row');
  await noSideways(app, 'chapter');
  await noDan(app, 'chapter');
  // A footnote chip opens its source in place; Escape closes it and focus returns.
  const chip = app.page.locator('.explain button.fn').first();
  await chip.scrollIntoViewIfNeeded();
  await app.page.waitForTimeout(500);
  await chip.click();
  await app.page.waitForSelector('.fn-pop');
  assert(/^Source \d$/.test(await app.page.locator('.fn-pop .fp-n').textContent()) && (await app.page.getAttribute('.fn-pop', 'role')) === 'dialog', 'the source card');
  await app.page.keyboard.press('Escape');
  await app.page.waitForSelector('.fn-pop', { state: 'detached' });
  eq(await app.page.evaluate(() => document.activeElement.classList.contains('fn')), true, 'focus back on the chip');
  await shot(app, 'chapter-390', true);
  // Next: Plate I, asleep until Tap to play.
  await app.page.locator('.turn .next').click();
  await app.page.waitForSelector('.mount');
  eq(await focusedH1(app), 'Plate I Length and swing time', 'the plate\'s h1');
  eq(await app.page.getAttribute('.mount', 'data-awake'), 'false', 'asleep');
  eq(await app.page.locator('.mount .frame[inert]').count(), 1, 'inert while asleep');
  await app.page.waitForSelector('.mount iframe.kit-iframe', { state: 'attached', timeout: 15000 });
  eq(await app.page.getAttribute('.mount iframe', 'tabindex'), '-1', 'out of the Tab order');
  eq(await app.page.getAttribute('.mount iframe', 'sandbox'), 'allow-scripts', 'sandboxed, never same-origin');
  await app.page.locator('.wake').click();
  eq(await app.page.getAttribute('.mount', 'data-awake'), 'true', 'awake');
  eq(await app.page.locator('.mount .frame[inert]').count(), 0, 'no longer inert');
  eq(await text(app, '.wake'), 'Done', 'the tab reads Done');
  eq(await app.page.getAttribute('.wake', 'aria-pressed'), 'true', 'pressed');
  // Drawn in ink on paper: the kit's page and its data roles (K_THEME.roles).
  const frame = app.page.frames().find((f) => f !== app.page.mainFrame());
  await frame.waitForFunction(() => window.K && document.documentElement.style.getPropertyValue('--k-bg'), null, { timeout: 15000 });
  const ink = await frame.evaluate(() => ['--k-bg', '--k-ink', '--k-fill1', '--k-hl'].map((k) => document.documentElement.style.getPropertyValue(k).trim().toUpperCase()));
  eq(ink.join(), '#F8F1E0,#2B2119,#D8DCD8,#F1D488', 'ink-on-paper theme with its roles');
  await shot(app, 'plate-390');
  await app.page.locator('.wake').click();
  eq(await app.page.getAttribute('.mount', 'data-awake'), 'false', 'Done puts it back to sleep');
  // Next: put it into practice, and the sources.
  assert(/Put it into practice/.test(await text(app, '.turn .next')), 'the page turn names it: ' + await text(app, '.turn .next'));
  await app.page.locator('.turn .next').click();
  await app.page.waitForSelector('.d-steps');
  eq(await focusedH1(app), 'Put it into practice', 'its h1');
  eq(await app.page.evaluate(() => location.hash), '#/book/pendulums/i1/practice', 'its address');
  eq(await app.page.locator('.d-check li').count(), 2, 'the steps as an ink checklist');
  eq((await app.page.locator('.d-check .d-step-n').allTextContents()).join(), '1,2', 'numbered');
  eq(await app.page.locator('.d-check .d-box').count(), 2, 'each with its box');
  assert((await text(app, '.d-rules')).includes('four times the length, twice the time'), 'the rule of thumb on a taped card');
  eq(await app.page.locator('.d-rules .tape').count(), 2, 'taped');
  assert(/Worked example[\s\S]*a 1 m pendulum/.test(await text(app, '.d-example')), 'the worked example as a field note');
  assert(/Common mistakes[\s\S]*reaction time/.test(await text(app, '.d-mistakes')), 'the common mistakes');
  const red = await app.page.evaluate(() => [getComputedStyle(document.querySelector('.d-mistakes')).color, getComputedStyle(document.querySelector('.dos')).getPropertyValue('--j-red').trim()]);
  eq(red[0], 'rgb(150, 42, 34)', 'in red ink (' + red[1] + ')');
  eq(await app.page.locator('.d-check button.fn').count(), 1, 'with its footnote');
  eq(await app.page.locator('.ev').count(), 2, 'the chapter\'s sources');
  await noDan(app, 'practice');
  await noTests(app, 'practice');
  await noSideways(app, 'practice');
  await shot(app, 'practice-390', true);
  // An older chapter (bound before lessons had practice): its sources alone.
  await go(app, '#/book/pendulums/i3/practice');
  await app.page.waitForSelector('.spread.single .evidence');
  eq(await focusedH1(app), 'Sources', 'a page of its own, headed Sources');
  eq(await app.page.locator('.spread > .page').count(), 1, 'one page');
  eq(await app.page.locator('.d-steps, .d-rules').count(), 0, 'no practice to show');
  await noTests(app, 'older chapter');
  await go(app, '#/book/pendulums/i3/tests');
  await app.page.waitForSelector('.spread.single .evidence');
  assert(true, 'its older address opens the same leaf');
  // The glossary and bibliography.
  await go(app, '#/book/pendulums/bibliography');
  await app.page.waitForSelector('.biblio');
  const terms = await app.page.locator('.gloss dt').allInnerTexts();
  assert(terms.includes('period') && terms.includes('gravity'), 'glossary terms: ' + terms);
  assert((await app.page.locator('.biblio').innerText()).includes('Science Museum'), 'the research\'s sources in the bibliography');
  const biblioTop = await app.page.evaluate(() => document.getElementById('bibliography').getBoundingClientRect().top);
  assert(biblioTop < 300, 'on a phone #/…/bibliography opens at the bibliography (' + biblioTop + ')');
  await noSideways(app, 'back matter');
  await noTests(app, 'back matter');
  // Every page turn and the contents and tabs: no test anywhere in the book.
  for (const h of ['#/book/pendulums', '#/book/pendulums/contents', '#/book/pendulums/i1', '#/book/pendulums/i1/plate', '#/book/pendulums/i5/practice']) {
    await go(app, h);
    await app.page.waitForSelector('.turn, .cover-actions');
    await app.page.waitForTimeout(200);
    await noTests(app, h);
  }
});

await test('release-check nits: page-turn labels whole on a phone, the stamp clear of the key term at XL, a lone book\'s caption under it', async () => {
  // The turn labels never break inside a word (the bibliography's back link was cut mid-word).
  for (const w of [360, 390]) {
    const app = await open({ width: w, height: 760, hash: '#/book/pendulums/bibliography' });
    await app.page.waitForSelector('.biblio', { timeout: 20000 });
    for (const h of ['#/book/pendulums/bibliography', '#/book/pendulums/i5/practice', '#/book/pendulums/i1/practice', '#/book/pendulums/i1/plate']) {
      await go(app, h);
      await app.page.waitForSelector('.turn a');
      await app.page.waitForTimeout(150);
      const cut = await app.page.$$eval('.turn a .tk, .turn a .tt', (els) => els.filter((e) => {
        if (e.scrollWidth > e.clientWidth + 1) return true;
        // A word split across lines: some word of it wider than the line, or a break inside a word.
        const r = document.createRange(), t = e.firstChild;
        if (!t || t.nodeType !== 3) return false;
        const words = t.textContent.split(/(\s+)/); let at = 0;
        for (const wd of words) {
          if (wd.trim()) { r.setStart(t, at); r.setEnd(t, at + wd.length); if (r.getClientRects().length > 1) return true; }
          at += wd.length;
        }
        return false;
      }).map((e) => e.textContent));
      assert(!cut.length, `${w} ${h}: page-turn labels cut or broken mid-word: ` + cut.join(' | '));
    }
    await shot(app, 'turn-labels-' + w);
  }
  // At XL the "Chapter complete" stamp keeps clear of the key term below it.
  const xl = await open({ width: 360, height: 707, size: 'xl', hash: '#/book/pendulums/i1' });
  await xl.page.waitForSelector('.d-card', { timeout: 20000 });
  for (const h of ['#/book/pendulums/i1', '#/book/pendulums/i3', '#/book/pendulums/i5']) {
    await go(xl, h);
    await xl.page.waitForSelector('.d-card .stamp');
    // Measured with the card held straight (it is taped in at a slight angle); the stamp keeps its own turn.
    const g = await xl.page.evaluate(() => { const c = document.querySelector('.d-card'); c.style.transform = 'none'; const s = c.querySelector('.stamp').getBoundingClientRect(), n = c.querySelector('.card-name').getBoundingClientRect(); c.style.transform = ''; return { stamp: Math.round(s.bottom * 10) / 10, name: Math.round(n.top * 10) / 10 }; });
    assert(g.stamp <= g.name - 2, `${h} at XL: the stamp touches the key term (${JSON.stringify(g)})`);
  }
  await shot(xl, 'stamp-xl-360');
  // On a laptop a lone book's caption stands under its book, not at the shelf's far left.
  const lib = await open({ width: 1366, height: 900, hash: '#/book' });
  await lib.page.waitForFunction(() => document.querySelectorAll('.lib-dossiers .slot:not(.filler)').length === 2, null, { timeout: 20000 });
  // Where the caption's words start, against the book's left edge.
  const off = await lib.page.$$eval('.lib-dossiers .slot:not(.filler)', (ss) => ss.map((sl) => {
    const c = sl.querySelector('.cloth').getBoundingClientRect(), r = document.createRange();
    r.selectNodeContents(sl.querySelector('.meta'));
    return Math.round(Math.abs(r.getBoundingClientRect().left - c.left));
  }));
  assert(off.every((d) => d <= 12), 'each caption starts under its book (px from the book\'s edge): ' + off);
  await shot(lib, 'library-lone-1366');
});

await test('reader on a phone at XL with Easy reading, and dark with reduced motion', async () => {
  const a = await open({ width: 360, height: 707, size: 'xl', easy: true, hash: '#/book/pendulums/i1' });
  await a.page.waitForSelector('.d-card', { timeout: 20000 });
  await noSideways(a, 'xl easy');
  eq(await a.page.$$eval('.d-tabs li', (l) => new Set(l.map((x) => Math.round(x.getBoundingClientRect().top))).size), 1, 'tabs keep one row at XL');
  const inCard = await a.page.evaluate(() => { const c = document.querySelector('.d-card').getBoundingClientRect(), st = document.querySelector('.d-card .stamp').getBoundingClientRect(); return st.right <= c.right && st.left >= c.left; });
  eq(inCard, true, 'the stamp stays on the index card at XL');
  const fam = await a.page.evaluate(() => [getComputedStyle(document.querySelector('.note-t, .cert-why')).fontFamily, getComputedStyle(document.querySelector('.prose p')).fontFamily, getComputedStyle(document.querySelector('.ch-title')).fontFamily]);
  assert(/Atkinson/.test(fam[0]) && /Atkinson/.test(fam[1]), 'Easy reading: notes and reading text in Atkinson Hyperlegible: ' + fam);
  assert(/Walter Turncoat/.test(fam[2]), 'the big lettered title keeps its hand: ' + fam[2]);
  const fs = await a.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.prose p')).fontSize));
  eq(fs, 22.5, 'reading text follows the app\'s Text size (1.125rem at XL)');
  await shot(a, 'chapter-360-xl-easy', true);
  const b = await open({ width: 390, dark: true, reduced: true, hash: '#/book/pendulums/i1' });
  await b.page.waitForSelector('.d-card', { timeout: 20000 });
  const d = await b.page.evaluate(() => [getComputedStyle(document.querySelector('.dos')).getPropertyValue('--paper').trim(), getComputedStyle(document.querySelector('.spread')).animationName]);
  eq(d[0], '#2A241D', 'lamp-lit paper in dark');
  eq(d[1], 'none', 'no settle animation under reduced motion');
  await shot(b, 'chapter-390-dark');
});

await test('reader on a laptop: a two-page spread, page turns by arrow keys and desk arrows', async () => {
  const app = await open({ width: 1366, height: 900, hash: '#/book/pendulums/i1' });
  await app.page.waitForSelector('.d-card', { timeout: 20000 });
  const pages = await app.page.$$eval('.spread > .page', (ps) => ps.map((p) => { const r = p.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width)]; }));
  assert(pages.length === 2 && pages[0][1] === pages[1][1] && pages[1][0] > pages[0][0] + 300, 'left and right pages side by side: ' + JSON.stringify(pages));
  eq(await app.page.locator('.sides .side-a').count(), 2, 'desk arrows');
  eq(await app.page.getAttribute('.sides', 'aria-hidden'), 'true', 'which repeat the turn links');
  // The Compare note sits in the outer margin column, beside the text, not over it.
  const xref = await app.page.evaluate(() => { const x = document.querySelector('.side.xref').getBoundingClientRect(), c = document.querySelector('.d-card').getBoundingClientRect(); return x.right <= c.left + 1; });
  eq(xref, true, 'Compare in the margin');
  await noSideways(app, 'laptop chapter');
  await shot(app, 'chapter-1366');
  await app.page.keyboard.press('ArrowRight');
  await app.page.waitForSelector('.mount');
  eq(await app.page.evaluate(() => location.hash), '#/book/pendulums/i1/plate', 'ArrowRight: the next leaf');
  await app.page.keyboard.press('ArrowRight');
  await app.page.waitForSelector('.d-steps');
  const pp = await app.page.$$eval('.spread > .page', (ps) => ps.map((p) => Math.round(p.getBoundingClientRect().top)));
  assert(pp.length === 2 && pp[0] === pp[1], 'put it into practice | sources, side by side');
  await shot(app, 'practice-1366');
  await app.page.keyboard.press('ArrowLeft');
  await app.page.waitForSelector('.mount');
  eq(await app.page.evaluate(() => location.hash), '#/book/pendulums/i1/plate', 'ArrowLeft: back');
  await shot(app, 'plate-1366');
  await go(app, '#/book/pendulums/i1/plate/play');
  await app.page.waitForFunction(() => document.querySelector('.mount') && document.querySelector('.mount').getAttribute('data-awake') === 'true');
  // The circled number from the sources, in the margin.
  await go(app, '#/book/pendulums/glossary');
  await app.page.waitForSelector('.gloss');
  const cols = await app.page.$$eval('.spread > .page', (ps) => ps.map((p) => Math.round(p.getBoundingClientRect().top)));
  eq(cols[0], cols[1], 'glossary | bibliography side by side');
  await shot(app, 'glossary-1366');
});

await test('delete a course and keep its dossier (the default); or delete the dossier too', async () => {
  const app = await open({ hash: '#/t/pendulums', db: seed({ finished: false }) });
  await app.page.locator('.tp-delete').waitFor();
  await app.page.locator('.tp-delete').click();
  await app.page.waitForSelector('.dos-keep');
  eq(await app.page.getAttribute('.dos-keep-opt[data-keep="true"]', 'aria-checked'), 'true', 'keep is chosen by default');
  eq(await app.page.locator('.dos-keep[role="radiogroup"] [role="radio"]').count(), 2, 'a radio choice');
  await shot(app, 'delete-sheet-390');
  await app.page.locator('.sheet-actions .btn', { hasText: 'Delete topic' }).click();
  await app.page.waitForFunction(() => location.hash === '#/', null, { timeout: 20000 });
  eq(await doc(app, 'topics/pendulums'), null, 'the course is gone');
  const idx = await doc(app, DOS('pendulums'));
  assert(idx && idx.kept === true && Object.keys(idx.chapters).length === 3, 'its dossier is kept, every finished idea bound first: ' + JSON.stringify(idx && Object.keys(idx.chapters || {})));
  await go(app, '#/book');
  await app.page.waitForSelector('.lib-dossiers .slot:not(.filler)', { timeout: 15000 });
  assert((await text(app, '.lib-dossiers .book-link')).includes('Why pendulums keep time'), 'on the shelf');
  // Its course is gone, so it can never gain a chapter: never "still being written".
  const shelfText = await text(app, '.lib-dossiers');
  assert(/Kept from deleted courses/.test(shelfText) && !/Still being written/.test(shelfText), 'a kept dossier sits on its own shelf: ' + shelfText.replace(/\s+/g, ' ').slice(0, 200));
  eq(await app.page.locator('.lib-dossiers .pclip').count(), 0, 'no paper clip on a closed dossier');
  await app.page.locator('.lib-dossiers .book-link').first().click();
  await app.page.waitForSelector('.jc-title');
  const coverText = await text(app, '.jc-label');
  assert(/Kept from a deleted course/.test(coverText) && !/Still being written/.test(coverText), 'the cover says it was kept: ' + coverText.replace(/\s+/g, ' '));
  await go(app, '#/book/pendulums/contents');
  await app.page.waitForSelector('.d-tabs');
  eq(await app.page.locator('.d-tabs .off').count(), 0, 'no greyed tabs for chapters that can never be written');
  await go(app, '#/book/pendulums/i3');
  await app.page.waitForSelector('.d-card');
  eq(await focusedH1(app), 'Small swings and big swings', 'a kept dossier opens with no course behind it');
  await noDan(app, 'kept');
  // The other choice: the dossier goes too.
  const b = await open({ hash: '#/book/pendulums', db: seed({ finished: false }) });
  await b.page.waitForSelector('.jc-title');
  await b.page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.chapters && Object.keys(d.chapters).length === 3; }, DOS('pendulums'), { timeout: 15000 });
  await go(b, '#/t/pendulums');
  await b.page.locator('.tp-delete').click();
  await b.page.locator('.dos-keep-opt[data-keep="false"]').click();
  eq(await b.page.getAttribute('.dos-keep-opt[data-keep="false"]', 'aria-checked'), 'true', 'chosen');
  await b.page.locator('.sheet-actions .btn', { hasText: 'Delete topic' }).click();
  await b.page.waitForFunction((p) => !window.__CLAUDE_STUB__.get(p), DOS('pendulums'), { timeout: 20000 });
  const left = await b.page.evaluate(() => Object.keys(window.__CLAUDE_STUB__.dump()).filter((p) => p.includes('/dossiers/')));
  eq(left.length, 0, 'no dossier docs left: ' + left);
});

await test('save a copy: the whole dossier as one HTML file, styles inline, fonts by link, no scripts', async () => {
  const app = await open({ hash: '#/book/pendulums' });
  await app.page.waitForFunction(() => /3 of 5 chapters/.test((document.querySelector('.jc-prog') || {}).textContent || ''), null, { timeout: 20000 });
  await app.page.evaluate(() => { const f = U.saveFile; window.__saved = []; U.saveFile = function (n, t, ty) { window.__saved.push({ n, t, ty }); return f.apply(this, arguments); }; });
  await app.page.locator('.d-save').click();
  await app.page.waitForFunction(() => window.__saved.length === 1);
  const s = await app.page.evaluate(() => window.__saved[0]);
  assert(/^dossier-why-pendulums-keep-time-\d{4}-\d{2}-\d{2}\.html$/.test(s.n), 'file name ' + s.n);
  eq(s.ty, 'text/html', 'type');
  const dl = (await app.calls()).filter((c) => c.kind === 'download');
  eq(dl.length, 1, 'through the downloads capability');
  const h = s.t;
  assert(h.startsWith('<!doctype html>') && h.includes('<style>') && /fonts\.googleapis\.com\/css2\?family=Literata/.test(h), 'a page with its styles and a fonts link');
  assert(/"Courier New", ?monospace/.test(h) && /Georgia/.test(h), 'with fallbacks');
  assert(!/<script/i.test(h) && !/\son[a-z]+=/i.test(h) && !/<iframe/i.test(h), 'no scripts, handlers or frames');
  for (const t of ['What sets the beat', 'Small swings and big swings', 'From pendulums to clocks', 'Put it into practice', 'Rule of thumb', 'Worked example', 'Common mistakes', 'four times the length, twice the time', 'Glossary', 'Bibliography', 'The live plate plays']) assert(h.includes(t), 'contains ' + t);
  eq((h.match(/Put it into practice/g) || []).length, 1, 'practice only where the chapter has it (one of the three)');
  await noTests(app, 'the saved copy', h.replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"'));
  assert(!h.includes(DAN), 'none of Dan\'s words: ' + (h.match(/DANWORDS[-\w]*/g) || []).join(', '));
  // It reads on its own.
  const p2 = await app.context.newPage();
  await p2.route('**/*', (r) => r.abort());
  await p2.setContent(h);
  eq(await p2.locator('h1').innerText(), 'Why pendulums keep time', 'opens as a page');
  eq(await p2.locator('section[id^="ch-"]').count(), 3, 'one section per bound chapter');
  await p2.close();
});

await test('finishing an idea in its lesson binds its chapter', async () => {
  const db = seed({ finished: false });
  db['topics/pendulums/lessons/i2'] = lesson(fx('pendulum'), 'i2');
  db[`data/users/${UID}/profile/progress/pendulums`].ideas.i2 = { stage: 'checks', startedAt: new Date().toISOString(), predict: { answer: 'x', at: new Date().toISOString() } };
  const app = await open({ hash: '#/t/pendulums/i2', db });
  const { page } = app;
  await page.locator('.lsn-stage[data-stage="checks"]').waitFor({ timeout: 20000 });
  for (const c of fx('pendulum').lesson.checks) {
    const card = page.locator('.lsn-check').last();
    await card.locator('.qc-primary, .qc-continue').first().waitFor();
    if (c.type === 'choice') await card.locator(`.qc-opt[data-i="${c.answer}"]`).click();
    else if (c.type === 'order') { for (const item of c.items) { const chip = card.locator('.qc-chip', { hasText: item }); if (await chip.count()) await chip.first().click(); } }
    else if (c.type === 'estimate') { const plus = card.locator('.qc-nudge').last(); if (await plus.count()) await plus.click(); }
    await card.locator('.qc-primary').click();
    await card.locator('.qc-continue').waitFor();
    await card.locator('.qc-continue').click();
  }
  await page.locator('.lsn-done').waitFor({ timeout: 20000 });
  await page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.doneAt && d.lesson; }, DOS('pendulums', '/chapters/i2'), { timeout: 20000 });
  await page.waitForFunction((p) => { const d = window.__CLAUDE_STUB__.get(p); return d && d.ideas.i2.doneAt; }, `data/users/${UID}/profile/progress/pendulums`, { timeout: 20000 });
  const ch = await doc(app, DOS('pendulums', '/chapters/i2'));
  const pr = await doc(app, `data/users/${UID}/profile/progress/pendulums`);
  eq(ch.doneAt, pr.ideas.i2.doneAt, 'learned on: the moment he finished');
  eq(ch.plate, fx('pendulum').interactive.html, 'with its plate');
  assert(!JSON.stringify(ch).includes('DANWORDS') && !('checks' in ch) && !('say' in ch.lesson), 'and none of his answers');
});

console.log('\n' + results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`).join('\n'));
process.exit(results.every((r) => r.ok) ? 0 : 1);
