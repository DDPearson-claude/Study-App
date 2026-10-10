#!/usr/bin/env node
// Browser tests for the course dossier (75-dossier.js) on the complete build, with only the model
// stubbed: the topic page's "Keep a dossier" option; the Library's dossiers as D4 tiles (the one
// still being written leads, then finished and kept ones, then "In your own words"); the reader
// (design 3, the field guide) on a phone and on a laptop: At a glance (the cover and contents in
// one), a chapter's two pages (the chapter with its plate asleep until Tap to play, in the app's
// kit theme; put it into practice and its sources), glossary and bibliography; the floating page
// bar and the arrow keys through model().leaves; the old addresses (/contents, /plate, /plate/play);
// footnotes, Easy reading at XL, dark, reduced motion, no sideways scroll; deleting a course and
// keeping (or not) its dossier; saving it as one HTML file in the same tiles; and finishing an idea
// in a lesson binding its chapter. The title is topic.title, never the query. Nothing Dan wrote is
// ever shown, and (v9) no test question anywhere: the dossier is a book to learn from. Older
// chapters, bound before lessons had practice, end with their sources alone.
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
    // Chapter I closes its explanation with an all-bold paragraph: the key idea.
    'topics/pendulums/lessons/i1': (() => { const d = lesson(fx('pendulum'), 'i1', PRACTICE); d.lesson.explain.text += '\n\n**Length sets the beat.**'; return d; })(),
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

// The page bar's links and where it says he is.
async function bar(app) {
  return app.page.evaluate(() => {
    const b = document.querySelector('.dos-pagebar'), a = (s) => b.querySelector(s);
    // (a chapter's numeral is held to its word by a no-break space)
    return { prev: a('.pb-prev .pb-name').textContent.replace(/\u00a0/g, ' '), prevHref: a('.pb-prev').getAttribute('href'), at: a('.pb-at').textContent,
      next: a('.pb-next .pb-name').textContent.replace(/\u00a0/g, ' '), nextHref: a('.pb-next').getAttribute('href'), steps: [...b.querySelectorAll('.pb-steps i')].map((i) => i.className === 'on' ? 1 : 0).join('') };
  });
}
// The page bar's middle: '' when what it shows is whole, else what is cut. A chapter's position:
// the numeral fully inside, " · n of 2" either fully inside on the same line or dropped whole onto
// the hidden line, and never an ellipsis. A page's name ("at a glance"): inside, not cut.
async function middleCut(app) {
  return app.page.evaluate(() => {
    const at = document.querySelector('.dos-pagebar .pb-at'), ar = at.getBoundingClientRect();
    const box = (e) => { const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect(); };
    const inside = (e) => { const r = box(e); return r.left >= ar.left - .5 && r.right <= ar.right + .5; };
    const rn = at.querySelector('.pb-rn'), of = at.querySelector('.pb-of'), word = at.querySelector('.pb-word');
    if ([...at.querySelectorAll('*')].concat(at).some((e) => getComputedStyle(e).textOverflow === 'ellipsis')) return 'an ellipsis';
    if (rn) {
      if (!inside(rn)) return 'the numeral ' + rn.textContent;
      const line = at.querySelector('.pb-pos').getBoundingClientRect();
      // (the span's own box says which line it is on; its glyphs reach a little above it)
      if (of.getBoundingClientRect().top < line.bottom - 1 && !inside(of)) return 'the page ' + of.textContent;
      return '';
    }
    return word && (!inside(word) || word.scrollWidth > word.clientWidth + 1) ? 'the name ' + word.textContent : '';
  });
}
// A token's computed colour, for comparing with a tile's.
const token = (app, name) => app.page.evaluate((n) => { const d = document.createElement('div'); d.style.color = 'var(' + n + ')'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }, name);

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
  await go(app, '#/library/dossiers');
  await app.page.waitForSelector('.lib-empty');
  eq(await app.page.locator('.lib-dossiers .dl-tile:not(.dl-own)').count(), 0, 'off: no dossier in the Library');
  eq(await app.page.locator('.lib-dossiers .dl-grid > li:last-child a.own').count(), 1, '"In your own words" still ends the grid');
  eq(await doc(app, DOS('pendulums')), null, 'and nothing bound');
  await go(app, '#/t/pendulums');
  await app.page.locator('.tp-dos .set-switch').click();
  // On again: what is finished is bound at once, and the page links to the dossier.
  await app.page.waitForFunction(() => /Open the dossier · 3 of 5 chapters/.test((document.querySelector('.tp-dos-open') || {}).textContent || ''), null, { timeout: 15000 });
  eq(await app.page.getAttribute('.tp-dos-open', 'href'), '#/book/pendulums', 'a link to the dossier, with the chapter count');
  await shot(app, 'option-390');
});

await test('library: the dossier being written leads, then finished ones, then "In your own words", in D4 tiles', async () => {
  for (const [w, dark] of [[390, false], [1366, true]]) {
    const app = await open({ width: w, dark, hash: '#/library/dossiers' });
    await app.page.waitForFunction(() => document.querySelectorAll('.lib-dossiers .dl-tile:not(.dl-own)').length === 2, null, { timeout: 20000 });
    eq(await app.page.locator('#tabs .tab[data-tab="book"]').innerText(), 'Library', 'the tab is "Library"');
    eq(await app.page.getAttribute('#tabs .tab[data-tab="book"]', 'aria-current'), 'page', 'and is current');
    eq(await focusedH1(app), 'Dossiers', 'heading takes focus');
    eq(await app.page.title(), 'Dossiers · My University', 'title');
    // The lead tile: the dossier most recently bound that is still being written.
    const lead = await app.page.locator('.dl-lead').textContent();
    assert(/Why pendulums keep time/.test(lead) && /still being written/.test(lead) && /3\/5/.test(lead), 'the lead tile: ' + lead);
    assert(/ch\. V bound 9 Sept?/.test(lead), 'with its newest chapter: ' + lead);
    eq(await app.page.locator('.dl-lead .dl-bar').count(), 5, 'a bar per idea');
    eq(await app.page.locator('.dl-lead .dl-bar.on').count(), 3, 'three bound');
    eq(await app.page.getAttribute('.dl-lead', 'href'), '#/book/pendulums', 'it opens the dossier');
    // Then the finished one: a white tile with a green check.
    const order = await app.page.$$eval('.lib-dossiers .dl-tile', (ts) => ts.map((t) => t.className.replace(/.*\bdl-(lead|going|done|kept|own)\b.*/, '$1')));
    eq(order.join(), 'lead,done,own', 'lead, finished, then In your own words');
    const fin = await app.page.locator('.dl-done').textContent();
    assert(/How clocks count time/.test(fin) && /Finished 21 Aug/.test(fin), 'a finished dossier: ' + fin);
    eq(await app.page.locator('.dl-done .dl-check').count(), 1, 'its green check');
    eq(await app.page.$eval('.dl-done .dl-check', (e) => getComputedStyle(e).backgroundColor), await token(app, '--green'), 'green: finished only');
    eq(await app.page.$eval('.dl-done', (e) => getComputedStyle(e).borderTopColor), await token(app, '--edge'), 'the tile is outlined in --edge');
    eq(await app.page.$eval('.dl-lead .dl-bar.on i', (e) => getComputedStyle(e).backgroundColor), await token(app, '--heading'), 'progress in ink');
    const nos = await app.page.$$eval('.lib-dossiers .dl-tile .t-label', (l) => l.map((e) => e.textContent.trim()));
    assert(nos.includes('Dossier 01') && nos.includes('Dossier 02'), 'numbered by when each course was begun: ' + nos);
    eq(await app.page.evaluate(() => document.querySelectorAll('link[data-dossier-fonts]').length), 0, 'no hand-lettered fonts any more');
    eq(await app.page.evaluate(() => [...document.querySelectorAll('link[rel=stylesheet]')].some((l) => /Literata/.test(l.href))), false, 'nor Literata');
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
    } else {
      const g = await app.page.$$eval('.dl-grid > li', (ls) => ls.map((l) => Math.round(l.getBoundingClientRect().width)));
      assert(g[0] > g[1] * 1.6, 'on a laptop the lead tile spans two columns: ' + g);
    }
  }
});

await test('reader on a phone: at a glance, a chapter with its plate asleep until played, practice and sources, the page bar', async () => {
  const app = await open({ width: 390, hash: '#/book/pendulums' });
  await app.page.waitForSelector('.g-h1');
  eq(await focusedH1(app), 'Why pendulums keep time', 'at a glance: the course title is the h1');
  eq(await app.page.evaluate(() => document.title), 'Why pendulums keep time · Dossier · My University', 'and the page title');
  eq(await app.page.evaluate(() => document.getElementById('view').dataset.screen), 'dossier', 'its own screen');
  eq(await app.page.evaluate(() => document.documentElement.classList.contains('focus')), true, 'no app chrome: D4\'s focus bar instead');
  eq(await app.page.getAttribute('.dos-bar .dos-up', 'href'), '#/library/dossiers', 'back goes to the Library');
  assert(/^library\/why-pendulums-keep-time$/.test(await app.page.locator('.dos-path').textContent()), 'where he is, by the title\'s words: ' + await app.page.locator('.dos-path').textContent());
  await app.page.waitForFunction(() => /3 of 5 chapters bound/.test(document.querySelector('.g-bound') && document.querySelector('.g-bound').textContent), null, { timeout: 15000 });
  eq(await app.page.$eval('.g-bound', (e) => getComputedStyle(e).backgroundColor), await token(app, '--heading'), 'the Bound tile is ink: progress');
  assert(/Begun\s*2 Sept?\s*2026 · \d+ sources/.test(await app.page.locator('.g-begun').textContent()), 'begun: ' + await app.page.locator('.g-begun').textContent());
  eq(await app.page.locator('.g-grid li').count(), 5, 'a cell per idea');
  eq(await app.page.locator('.g-grid li.is-unbound').count(), 2, 'two not yet written');
  assert(/not yet written/.test(await app.page.locator('.g-grid li.is-unbound').first().textContent()), 'said so to a screen reader');
  eq(await app.page.locator('.g-grid li.is-unbound a').count(), 0, 'and not links');
  eq(await app.page.locator('.g-grid li.is-bound a').count(), 3, 'the bound ones are');
  assert(/A weight on a string kept the world on time/.test(await app.page.locator('.g-hook').textContent()), 'the question it set out to answer');
  eq(JSON.stringify(await bar(app)), JSON.stringify({ prev: 'Library', prevHref: '#/library/dossiers', at: 'at a glance', next: 'Chapter I', nextHref: '#/book/pendulums/i1', steps: '' }), 'the page bar');
  await noSideways(app, 'at a glance');
  await noDan(app, 'at a glance');
  await shot(app, 'glance-390', true);
  // Chapter I: one page, the plate on it.
  await app.page.locator('.g-grid li.is-bound a').first().click();
  await app.page.waitForSelector('.c-head');
  eq(await focusedH1(app), 'What sets the beat', 'chapter h1');
  eq(await app.page.locator('h1').count(), 1, 'one h1 per page');
  assert(/Chapter I of V/.test(await app.page.locator('.c-of').textContent()) && /quantity/.test(await app.page.locator('.c-of').textContent()), 'its place and kind');
  eq(await app.page.locator('.c-key .c-key-t').textContent(), 'Length sets the beat.', 'the key idea: the explanation\'s closing all-bold paragraph');
  assert(!(await app.page.locator('.c-explain').textContent()).includes('Length sets the beat.'), 'taken out of the explanation, not printed twice');
  eq(await app.page.locator('.c-pills .on').textContent(), 'settled (this one)', 'how certain: the filled pill, said once');
  eq(await app.page.locator('.c-compare a').count(), 2, 'Compare links only to bound chapters (III and V)');
  // Top to bottom: header, key idea, plate, what's going on, then the analogy beside where it breaks.
  const tops = await app.page.evaluate(() => ['.c-head', '.c-key', '.c-plate', '.c-explain', '.c-analogy', '.c-breaks', '.c-compare', '.c-certain'].map((s) => Math.round(document.querySelector(s).getBoundingClientRect().top)));
  assert(tops[0] < tops[1] && tops[1] < tops[2] && tops[2] < tops[3] && tops[3] < tops[4] && tops[4] === tops[5] && tops[5] < tops[6] && tops[6] === tops[7], 'the tiles in order, two pairs side by side: ' + tops);
  eq(await app.page.$eval('.c-breaks', (e) => getComputedStyle(e).borderTopColor), await token(app, '--red'), 'where it breaks: a warning tile');
  eq(await app.page.$eval('.c-key', (e) => getComputedStyle(e).boxShadow.includes('3px 3px 0px')), true, 'the key idea: the emphasis tile\'s hard shadow');
  assert(/^the swing time/.test(await app.page.locator('.c-look').textContent().then((t) => t.replace(/^Look for /, ''))), 'Look for: the brief, word for word');
  eq(JSON.stringify(await bar(app)), JSON.stringify({ prev: 'Contents', prevHref: '#/book/pendulums', at: 'I · 1 of 2Chapter I, page 1 of 2', next: 'Practice', nextHref: '#/book/pendulums/i1/practice', steps: '10' }), 'the page bar: page 1 of 2');
  await noSideways(app, 'chapter');
  await noDan(app, 'chapter');
  // A footnote chip opens its source in place; Escape closes it and focus returns.
  const chip = app.page.locator('.c-explain button.fn').first();
  await chip.scrollIntoViewIfNeeded();
  await app.page.waitForTimeout(500);
  await chip.click();
  await app.page.waitForSelector('.fn-pop');
  assert(/^Source \d$/.test(await app.page.locator('.fn-pop .fp-n').textContent()) && (await app.page.getAttribute('.fn-pop', 'role')) === 'dialog', 'the source card');
  await app.page.keyboard.press('Escape');
  await app.page.waitForSelector('.fn-pop', { state: 'detached' });
  eq(await app.page.evaluate(() => document.activeElement.classList.contains('fn')), true, 'focus back on the chip');
  await shot(app, 'chapter-390', true);
  // The plate, asleep until Tap to play.
  await app.page.locator('.c-plate').scrollIntoViewIfNeeded();
  eq(await app.page.getAttribute('.mount', 'data-awake'), 'false', 'asleep');
  eq(await app.page.locator('.mount .frame[inert]').count(), 1, 'inert while asleep');
  await app.page.waitForSelector('.mount iframe.kit-iframe', { state: 'attached', timeout: 15000 });
  eq(await app.page.getAttribute('.mount iframe', 'tabindex'), '-1', 'out of the Tab order');
  eq(await app.page.getAttribute('.mount iframe', 'sandbox'), 'allow-scripts', 'sandboxed, never same-origin');
  await app.page.locator('.wake').click();
  eq(await app.page.getAttribute('.mount', 'data-awake'), 'true', 'awake');
  eq(await app.page.locator('.mount .frame[inert]').count(), 0, 'no longer inert');
  eq(await text(app, '.wake'), 'Done', 'the button reads Done');
  eq(await app.page.getAttribute('.wake', 'aria-pressed'), 'true', 'pressed');
  // In the D4 kit theme, like a lesson: the app's own palette, not the old ink on paper.
  const frame = app.page.frames().find((f) => f !== app.page.mainFrame());
  await frame.waitForFunction(() => window.K && document.documentElement.style.getPropertyValue('--k-bg'), null, { timeout: 15000 });
  const kit = await frame.evaluate(() => ['--k-bg', '--k-ink'].map((k) => document.documentElement.style.getPropertyValue(k).trim().toUpperCase()));
  const app4 = await app.page.evaluate(() => { const t = U.sandbox.theme(); return [t.c.bg, t.c.ink].map((v) => v.toUpperCase()); });
  eq(kit.join(), app4.join(), 'the kit theme is the app\'s (U.sandbox.theme)');
  assert(!kit.includes('#F8F1E0'), 'not the old ink palette');
  await shot(app, 'plate-390');
  await app.page.locator('.wake').click();
  eq(await app.page.getAttribute('.mount', 'data-awake'), 'false', 'Done puts it back to sleep');
  // Next: put it into practice, and the sources.
  await app.page.locator('.dos-pagebar .pb-next').click();
  await app.page.waitForSelector('.p-steps');
  eq(await focusedH1(app), 'Put it into practice', 'its h1');
  eq(await app.page.evaluate(() => location.hash), '#/book/pendulums/i1/practice', 'its address');
  eq(await app.page.locator('.p-check li').count(), 2, 'the steps as a numbered ink checklist');
  eq((await app.page.locator('.p-check .p-step-n').allTextContents()).join(), '1,2', 'numbered');
  eq(await app.page.locator('.p-rules .p-rule-lead').textContent(), 'Four times the length, twice the time.', 'the rule of thumb: its first sentence large, a sentence with a capital');
  assert(/Worked example[\s\S]*A 1 m pendulum/i.test(await app.page.locator('.p-example').textContent()), 'the worked example in a grey panel');
  eq(await app.page.locator('.p-mis').count(), 2, 'a warning tile per common mistake');
  assert(/reaction time/.test(await app.page.locator('.p-mis').first().textContent()), 'in the lesson\'s words');
  eq(await app.page.$eval('.p-mis', (e) => getComputedStyle(e).color), await token(app, '--red'), 'in red');
  eq(await app.page.locator('.p-check button.fn').count(), 1, 'with its footnote');
  eq(await app.page.locator('.p-src').count(), 2, 'the chapter\'s sources, one tile each');
  eq(await app.page.locator('.p-src a[target="_blank"]').count(), 2, 'each linking out in a new tab');
  eq(JSON.stringify(await bar(app)), JSON.stringify({ prev: 'Chapter I', prevHref: '#/book/pendulums/i1', at: 'I · 2 of 2Chapter I, page 2 of 2', next: 'Chapter III', nextHref: '#/book/pendulums/i3', steps: '11' }), 'the page bar: page 2 of 2, then the next bound chapter');
  await noDan(app, 'practice');
  await noTests(app, 'practice');
  await noSideways(app, 'practice');
  await shot(app, 'practice-390', true);
  // The page bar stays put at the bottom, and the last tile scrolls clear of it.
  await app.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await app.page.waitForTimeout(200);
  const pb = await app.page.evaluate(() => { const b = document.querySelector('.dos-pagebar').getBoundingClientRect(), t = [...document.querySelectorAll('.dos-page > *')].pop().getBoundingClientRect(); return { bottom: Math.round(innerHeight - b.bottom), barTop: b.top, lastBottom: t.bottom }; });
  assert(pb.bottom >= 12 && pb.bottom <= 16 && pb.lastBottom <= pb.barTop, 'the bar floats 14 px up and covers nothing at the end: ' + JSON.stringify(pb));
  // From chapter III's page the bar names the previous page by its chapter.
  await go(app, '#/book/pendulums/i3');
  await app.page.waitForSelector('.c-head');
  eq((await bar(app)).prev, 'Ch. I', 'another chapter\'s practice, by its numeral alone');
  assert(/Previous page: Ch\. I practice/.test((await app.page.locator('.pb-prev').textContent()).replace(/\u00a0/g, ' ')), 'its whole name still said to a screen reader');
  // An older chapter (bound before lessons had practice): its sources alone.
  await go(app, '#/book/pendulums/i3/practice');
  await app.page.waitForSelector('.p-sources .p-src');
  eq(await focusedH1(app), 'Sources', 'a page of its own, headed Sources');
  eq(await app.page.locator('.p-steps, .p-rules, .p-mis').count(), 0, 'no practice to show');
  eq((await bar(app)).at.slice(0, 11), 'III · 2 of ', 'still the chapter\'s second page');
  await noTests(app, 'older chapter');
  await go(app, '#/book/pendulums/i3/tests');
  await app.page.waitForSelector('.p-sources .p-src');
  // The glossary and bibliography.
  await go(app, '#/book/pendulums/bibliography');
  await app.page.waitForSelector('.b-biblio');
  const terms = await app.page.locator('.b-gloss dt').allInnerTexts();
  assert(terms.includes('period') && terms.includes('gravity'), 'glossary terms: ' + terms);
  eq(await app.page.locator('.b-term').count(), terms.length, 'a grey tile per term');
  assert((await app.page.locator('.b-biblio').innerText()).includes('Science Museum'), 'the research\'s sources in the bibliography');
  const biblioTop = await app.page.evaluate(() => document.getElementById('bibliography').getBoundingClientRect().top);
  assert(biblioTop < 300, '#/…/bibliography opens at the bibliography (' + biblioTop + ')');
  eq(JSON.stringify(await bar(app)), JSON.stringify({ prev: 'Ch. V', prevHref: '#/book/pendulums/i5/practice', at: 'bibliography', next: 'Library', nextHref: '#/library/dossiers', steps: '' }), 'the book ends at the Library; opened at the bibliography, the bar says so');
  assert(/\/bibliography$/.test(await app.page.locator('.dos-path').textContent()), 'and so does the path');
  await noSideways(app, 'back matter');
  await noTests(app, 'back matter');
  // Every page, and the older addresses: no test anywhere in the book.
  for (const h of ['#/book/pendulums', '#/book/pendulums/contents', '#/book/pendulums/i1', '#/book/pendulums/i1/plate', '#/book/pendulums/i5/practice']) {
    await go(app, h);
    await app.page.waitForSelector('.dos-pagebar');
    await app.page.waitForTimeout(200);
    await noTests(app, h);
  }
});

await test('old addresses keep working: /contents, /plate, /plate/play and an unbound chapter', async () => {
  const app = await open({ width: 390, hash: '#/book/pendulums/contents' });
  await app.page.waitForSelector('.g-grid');
  eq(await focusedH1(app), 'Why pendulums keep time', '/contents opens At a glance');
  await app.page.waitForFunction(() => scrollY > 0 && Math.abs(document.getElementById('chapters').getBoundingClientRect().top) < 120, null, { timeout: 5000 });
  eq((await bar(app)).at, 'at a glance', 'the same page');
  await go(app, '#/book/pendulums/i1/plate');
  await app.page.waitForSelector('.c-plate .mount');
  eq(await focusedH1(app), 'What sets the beat', '/plate opens the chapter page');
  await app.page.waitForFunction(() => Math.abs(document.querySelector('.c-plate').getBoundingClientRect().top) < 40, null, { timeout: 5000 });
  eq(await app.page.getAttribute('.mount', 'data-awake'), 'false', 'at the plate, asleep');
  eq((await bar(app)).at.slice(0, 9), 'I · 1 of ', 'on the chapter\'s first page');
  await go(app, '#/book/pendulums/i1/plate/play');
  await app.page.waitForFunction(() => document.querySelector('.mount') && document.querySelector('.mount').getAttribute('data-awake') === 'true', null, { timeout: 5000 });
  assert(Math.abs(await app.page.$eval('.c-plate', (e) => e.getBoundingClientRect().top)) < 40, '/plate/play: at the plate, awake');
  await go(app, '#/book/pendulums/i2');
  await app.page.waitForSelector('.g-grid');
  eq(await focusedH1(app), 'Why pendulums keep time', 'an unbound chapter\'s address shows At a glance');
  await shot(app, 'old-unbound-390');
});

await test('release-check nits: page-bar names whole on a phone, half tiles across at XL, numerals in their box', async () => {
  // The page bar's names never break inside a word, nor overlap where he is.
  for (const w of [360, 390]) {
    const app = await open({ width: w, height: 760, hash: '#/book/pendulums/bibliography' });
    await app.page.waitForSelector('.b-biblio', { timeout: 20000 });
    for (const h of ['#/book/pendulums/bibliography', '#/book/pendulums/i5/practice', '#/book/pendulums/i1/practice', '#/book/pendulums/i3', '#/book/pendulums']) {
      await go(app, h);
      await app.page.waitForSelector('.dos-pagebar .pb-name');
      await app.page.waitForTimeout(150);
      const cut = await app.page.$$eval('.dos-pagebar .pb-name', (els) => els.filter((e) => {
        if (e.scrollWidth > e.clientWidth + 1) return true;
        const r = document.createRange(), t = e.firstChild;
        if (!t || t.nodeType !== 3) return false;
        const words = t.textContent.split(/(\s+)/); let at = 0;
        for (const wd of words) {
          if (wd.trim()) { r.setStart(t, at); r.setEnd(t, at + wd.length); if (r.getClientRects().length > 1) return true; }
          at += wd.length;
        }
        return false;
      }).map((e) => e.textContent));
      assert(!cut.length, `${w} ${h}: page-bar names cut or broken mid-word: ` + cut.join(' | '));
      const clash = await app.page.evaluate(() => { const r = (s) => document.querySelector('.dos-pagebar ' + s).getBoundingClientRect(); return r('.pb-prev').right <= r('.pb-at').left + 1 && r('.pb-at').right <= r('.pb-next').left + 1; });
      assert(clash, `${w} ${h}: the page bar's parts overlap`);
      eq(await middleCut(app), '', `${w} ${h}: the middle label whole`);
    }
    await shot(app, 'pagebar-' + w);
  }
  // Where he is is never cut: at the larger text sizes " · 2 of 2" drops away whole and the numeral
  // stays (never "I…"); a narrow bar keeps the previous page's chevron, its name said, 44 px wide.
  for (const [size, easy] of [['m', false], ['l', false], ['xl', false], ['xl', true]]) {
    const app = await open({ width: 360, height: 707, size, easy, hash: '#/book/pendulums/i3/practice' });
    await app.page.waitForSelector('.p-sources .p-src', { timeout: 20000 });
    for (const h of ['#/book/pendulums/i3/practice', '#/book/pendulums/i1', '#/book/pendulums/i5', '#/book/pendulums', '#/book/pendulums/bibliography']) {
      await go(app, h);
      await app.page.waitForSelector('.dos-pagebar .pb-at');
      await app.page.waitForTimeout(150);
      eq(await middleCut(app), '', `360 ${size}${easy ? ' easy' : ''} ${h}: the position or the page's name whole`);
      const prev = await app.page.evaluate(() => { const a = document.querySelector('.dos-pagebar .pb-prev'); return { w: a.getBoundingClientRect().width, said: /^Previous page: \S/.test(a.textContent) }; });
      assert(prev.w >= 44 && prev.said, `360 ${size} ${h}: the previous page keeps a 44 px target and its name: ` + JSON.stringify(prev));
    }
    await shot(app, `pagebar-360-${size}${easy ? '-easy' : ''}`);
  }
  // At XL on a small phone the half tiles go across, so their words keep a sensible measure.
  const xl = await open({ width: 360, height: 707, size: 'xl', hash: '#/book/pendulums/i1' });
  await xl.page.waitForSelector('.c-analogy', { timeout: 20000 });
  const g = await xl.page.evaluate(() => { const a = document.querySelector('.c-analogy').getBoundingClientRect(), b = document.querySelector('.c-breaks').getBoundingClientRect(); return { aw: a.width, bt: b.top, ab: a.bottom }; });
  assert(g.aw > 300 && g.bt >= g.ab, 'analogy and where it breaks one above the other at XL: ' + JSON.stringify(g));
  for (const h of ['#/book/pendulums/i1', '#/book/pendulums/i3', '#/book/pendulums/i5']) {
    await go(xl, h);
    await xl.page.waitForSelector('.c-num');
    const fits = await xl.page.$eval('.c-num', (e) => e.scrollWidth <= e.clientWidth + 1);
    eq(fits, true, h + ': the numeral fits its box at XL');
    await noSideways(xl, h + ' xl');
  }
  await shot(xl, 'chapter-xl-360');
});

await test('at a glance, finished: the Bound tile\'s date stays inside the ink on a phone at every text size', async () => {
  // Measured against the tile's content edge, not its border: white on the page, text in the
  // padding or past the edge would vanish. The harness has no web fonts, so the wider fallback
  // font makes this the stricter check.
  for (const [m, d] of [['06', '28'], ['09', '21'], ['09', '30']]) {
    const db = seed();
    const pr = db[`data/users/${UID}/profile/progress/clocks-ab12`].ideas;
    pr.i1 = { stage: 'done', startedAt: at('06', '01'), doneAt: at('06', '02') };
    pr.i2 = { stage: 'done', startedAt: at('06', '03'), doneAt: at(m, d) };
    const app = await open({ width: 360, height: 760, db, hash: '#/book/clocks-ab12' });
    await app.page.waitForSelector('.g-bound.is-done', { timeout: 20000 });
    for (const [w, size, easy] of [[360, 'm', false], [390, 'm', false], [390, 'l', false], [412, 'xl', false], [360, 'm', true]]) {
      await app.page.setViewportSize({ width: w, height: 760 });
      await app.page.evaluate((o) => U.settings.apply(Object.assign({}, U.settings.prefs, o)), { size, easy });
      await app.page.waitForTimeout(200);
      const r = await app.page.evaluate(() => {
        const t = document.querySelector('.g-bound'), s = t.querySelector('.g-stat'), big = t.querySelector('.g-big');
        const g = document.createRange(); g.selectNodeContents(big);
        return { text: big.textContent, tile: t.scrollWidth - t.clientWidth, stat: s.scrollWidth - s.clientWidth, past: Math.round((g.getBoundingClientRect().right - (t.getBoundingClientRect().right - parseFloat(getComputedStyle(t).paddingRight))) * 10) / 10 };
      });
      assert(r.tile <= 0 && r.stat <= 0 && r.past <= 0.5, `${m}-${d} at ${w} ${size}${easy ? ' easy' : ''}: the date inside the tile: ` + JSON.stringify(r));
    }
    if (m === '09' && d === '30') {
      await app.page.setViewportSize({ width: 360, height: 760 });
      await app.page.evaluate(() => U.settings.apply(Object.assign({}, U.settings.prefs, { size: 'm', easy: false })));
      await shot(app, 'glance-finished-360');
      // Dark: the ink tile is light, so the finished ring takes the green that holds 3:1 on it.
      await app.page.evaluate(() => U.settings.apply(Object.assign({}, U.settings.prefs, { theme: 'dark' })));
      await app.page.waitForTimeout(200);
      eq(await app.page.$eval('.g-bound .ring .fl', (e) => getComputedStyle(e).stroke), 'rgb(46, 125, 79)', 'dark: the finished ring on the ink tile is the darker green');
      await shot(app, 'glance-finished-360-dark');
    }
  }
});

await test('a chapter\'s order and outline: contested views last, the plate a heading, held at its height; links Dan taps on their own are 44 px', async () => {
  const app = await open({ width: 390, hash: '#/book/pendulums/i5' });
  await app.page.waitForSelector('.c-view', { timeout: 20000 });
  // The brief's order: ... Compare beside How certain, the plate's notes, then the contested views.
  const v = await app.page.evaluate(() => { const c = document.querySelector('.c-certain'), vs = [...document.querySelectorAll('.c-view')]; return { n: vs.length, after: vs.every((x) => c.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING), below: vs[0].getBoundingClientRect().top > c.getBoundingClientRect().bottom }; });
  assert(v.n === 2 && v.after && v.below, 'the contested views come after How certain: ' + JSON.stringify(v));
  // The plate has a heading of its own, so moving by headings finds it; Tap to play is not in it.
  await go(app, '#/book/pendulums/i1');
  await app.page.waitForSelector('.c-plate .mount');
  const hs = await app.page.$$eval('h2', (l) => l.map((e) => e.textContent));
  assert(hs.some((t) => /^Plate I\b/.test(t)) && hs.indexOf(hs.find((t) => /^Plate I\b/.test(t))) < hs.indexOf('What’s going on'), 'the chapter\'s h2s: ' + hs.join(' | '));
  eq(await app.page.evaluate(() => { const f = document.querySelector('.c-plate'); return document.getElementById(f.getAttribute('aria-labelledby')).textContent; }), 'Plate I: Length and swing time', 'the plate is named by its heading, not by Tap to play');
  // A flat well: none of the kit host's own card.
  eq(await app.page.$eval('.mount .kit-frame', (e) => { const c = getComputedStyle(e); return c.borderTopWidth + ' ' + c.boxShadow; }), '0px none', 'the plate sits in a flat well');
  // Its height is held from the first paint: what this device measured last time.
  await app.page.waitForFunction(() => Number(localStorage.getItem('mu-dos-h:pendulums:i1')) > 120, null, { timeout: 20000 });
  const kept = await app.page.evaluate(() => Number(localStorage.getItem('mu-dos-h:pendulums:i1')));
  await go(app, '#/book/pendulums');
  await app.page.waitForSelector('.g-grid');
  await app.page.evaluate(() => U.go('#/book/pendulums/i1'));
  const first = await app.page.waitForFunction(() => { const w = document.querySelector('.c-plate .mount .frame'); if (!w) return null; const f = w.querySelector('iframe'); return parseFloat(f ? f.style.height : w.style.minHeight); });
  const held = await first.jsonValue();
  assert(Math.abs(held - kept) <= 2, `the plate starts at the height it had last time (${held} vs ${kept})`);
  assert(!(await app.page.evaluate(() => JSON.stringify(Object.keys(window.__CLAUDE_STUB__.dump()).filter((p) => p.includes('/dossiers/')).map((p) => window.__CLAUDE_STUB__.get(p))))).includes('mu-dos-h'), 'a look, never written to the dossier');
  // Links tapped on their own: 44 px tall.
  for (const [h, sel] of [['#/book/pendulums/i1', '.c-compare a'], ['#/book/pendulums/i1/practice', '.p-src-u'], ['#/book/pendulums/glossary', '.b-first a'], ['#/book/pendulums/glossary', '.b-ch a'], ['#/book/pendulums/glossary', '.b-work .p-src-u']]) {
    await go(app, h);
    await app.page.waitForSelector(sel);
    const small = await app.page.$$eval(sel, (l) => l.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), e.textContent.slice(0, 20)]; }).filter((x) => x[1] < 44 || x[0] < 24));
    assert(!small.length, `${h} ${sel}: tap targets under 44 px: ` + JSON.stringify(small));
  }
  // The practice tiles are headings too.
  await go(app, '#/book/pendulums/i1/practice');
  await app.page.waitForSelector('.p-rules');
  const ph = await app.page.$$eval('h2', (l) => l.map((e) => e.textContent));
  assert(['Steps', 'Rule of thumb', 'Worked example', 'Common mistakes', 'Sources'].every((t) => ph.includes(t)), 'the practice page\'s h2s: ' + ph.join(' | '));
  await noSideways(app, 'practice');
});

await test('reader on a phone at XL with Easy reading, and dark with reduced motion', async () => {
  const a = await open({ width: 360, height: 707, size: 'xl', easy: true, hash: '#/book/pendulums/i1' });
  await a.page.waitForSelector('.c-explain', { timeout: 20000 });
  await noSideways(a, 'xl easy');
  const fam = await a.page.evaluate(() => ['.c-explain .t-prose p', '.c-h1', '.c-explain .t-label', '.c-kind'].map((s) => getComputedStyle(document.querySelector(s)).fontFamily));
  assert(fam.every((f) => /^"?Atkinson Hyperlegible/.test(f)), 'Easy reading: Atkinson everywhere, labels and mono included: ' + fam.join(' | '));
  const fs = await a.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.c-explain .t-prose p')).fontSize));
  eq(fs, 21.25, 'reading text follows the app\'s Text size (1.0625rem at XL)');
  await shot(a, 'chapter-360-xl-easy', true);
  const b = await open({ width: 390, dark: true, reduced: true, hash: '#/book/pendulums/i1' });
  await b.page.waitForSelector('.c-explain', { timeout: 20000 });
  const d = await b.page.evaluate(() => [getComputedStyle(document.querySelector('.c-head')).backgroundColor, getComputedStyle(document.querySelector('.c-explain')).backgroundColor, getComputedStyle(document.querySelector('.dos-page')).animationName]);
  eq(d[0], await token(b, '--surface'), 'dark: the white tiles are the dark surface');
  eq(d[0], 'rgb(29, 32, 36)', 'D4\'s dark --surface');
  eq(d[1], await token(b, '--sunk'), 'and the grey ones --sunk');
  eq(d[2], 'none', 'no settle animation under reduced motion');
  await shot(b, 'chapter-390-dark');
});

await test('reader on a laptop: one wider tile page, the plate beside its notes, the arrow keys follow the page order', async () => {
  const app = await open({ width: 1366, height: 900, hash: '#/book/pendulums/i1' });
  await app.page.waitForSelector('.c-plate', { timeout: 20000 });
  eq(await app.page.$eval('.dos-page', (e) => getComputedStyle(e).gridTemplateColumns.split(' ').length), 4, 'four columns');
  const w = await app.page.$eval('.dos-page', (e) => e.getBoundingClientRect().width);
  assert(w <= 1200 + 1, 'up to --wide: ' + w);
  const side = await app.page.evaluate(() => { const p = document.querySelector('.c-plate').getBoundingClientRect(), a = document.querySelector('.c-analogy').getBoundingClientRect(), c = document.querySelector('.c-certain').getBoundingClientRect(); return { beside: a.left >= p.right, stacked: c.top > a.top && Math.abs(c.left - a.left) < 2, top: Math.abs(a.top - p.top) < 2 }; });
  assert(side.beside && side.stacked && side.top, 'the analogy, where it breaks, Compare and How certain stack beside the plate: ' + JSON.stringify(side));
  const head = await app.page.evaluate(() => [document.querySelector('.c-head'), document.querySelector('.c-key')].map((e) => Math.round(e.getBoundingClientRect().width)));
  assert(head[0] === head[1] && head[0] > w - 60, 'the header and key idea run across: ' + head);
  eq(await app.page.locator('.sides, .turn').count(), 0, 'no desk arrows or turn links: the page bar instead');
  const pbw = await app.page.$eval('.dos-pagebar', (e) => e.getBoundingClientRect().width);
  assert(pbw <= 34 * 16 + 1, 'the page bar keeps its size: ' + pbw);
  await noSideways(app, 'laptop chapter');
  await shot(app, 'chapter-1366');
  // Each turn waits for that page to be drawn (the reader says which leaf it shows) before the next key.
  async function turn(key, leaf) {
    await app.page.keyboard.press(key);
    await app.page.waitForSelector(`.dos.reader[data-leaf="${leaf}"] .dos-pagebar`, { timeout: 10000 });
  }
  await turn('ArrowRight', 'i1:practice');
  eq(await app.page.evaluate(() => location.hash), '#/book/pendulums/i1/practice', 'ArrowRight: the next page');
  await app.page.waitForSelector('.p-steps');
  await shot(app, 'practice-1366');
  await turn('ArrowRight', 'i3:chapter');
  eq(await app.page.evaluate(() => location.hash), '#/book/pendulums/i3', 'then the next bound chapter');
  await turn('ArrowLeft', 'i1:practice');
  await turn('ArrowLeft', 'i1:chapter');
  await turn('ArrowLeft', 'glance');
  eq(await app.page.evaluate(() => location.hash), '#/book/pendulums', 'back to At a glance');
  await app.page.waitForSelector('.g-grid');
  eq(await app.page.$eval('.g-grid', (e) => getComputedStyle(e).gridTemplateColumns.split(' ').length), 4, 'at a glance: four chapters a row');
  await app.page.keyboard.press('ArrowLeft');
  await app.page.waitForTimeout(300);
  eq(await app.page.evaluate(() => location.hash), '#/book/pendulums', 'ArrowLeft on the first page stays: the Library is not a page of the book');
  await shot(app, 'glance-1366');
  await go(app, '#/book/pendulums/glossary');
  await app.page.waitForSelector('.b-gloss');
  assert(await app.page.$eval('.b-gloss', (e) => getComputedStyle(e).gridTemplateColumns.split(' ').length >= 2), 'glossary tiles side by side');
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
  await go(app, '#/library/dossiers');
  await app.page.waitForSelector('.lib-dossiers .dl-kept', { timeout: 15000 });
  // Its course is gone, so it can never gain a chapter: never "still being written".
  const kept = await app.page.locator('.lib-dossiers .dl-kept').textContent();
  assert(/Why pendulums keep time/.test(kept) && /Dossier 01 · kept/.test(kept) && /3 of 5 chapters · course deleted/.test(kept), 'a kept dossier\'s tile: ' + kept);
  eq(await app.page.locator('.lib-dossiers .dl-lead').count(), 0, 'and it never leads as still being written');
  eq(await app.page.$eval('.dl-kept', (e) => getComputedStyle(e).borderTopStyle), 'dashed', 'dashed');
  await shot(app, 'library-kept-390');
  await app.page.locator('.lib-dossiers .dl-kept').click();
  await app.page.waitForSelector('.g-h1');
  const glanceText = await app.page.locator('.g-bound').textContent();
  assert(/Kept from a deleted course/.test(glanceText) && !/Still being written/i.test(await app.page.locator('.dos-page').textContent()), 'at a glance says it was kept: ' + glanceText);
  assert(/not written: the course was deleted/.test(await app.page.locator('.g-grid .is-unbound').first().textContent()), 'its unwritten chapters say why');
  await go(app, '#/book/pendulums/i3');
  await app.page.waitForSelector('.c-head');
  eq(await focusedH1(app), 'Small swings and big swings', 'a kept dossier opens with no course behind it');
  await noDan(app, 'kept');
  // The other choice: the dossier goes too.
  const b = await open({ hash: '#/book/pendulums', db: seed({ finished: false }) });
  await b.page.waitForSelector('.g-h1');
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

await test('save a copy: the whole dossier as one HTML file in the same tiles, styles inline, fonts by link, no scripts', async () => {
  const app = await open({ hash: '#/book/pendulums' });
  await app.page.waitForFunction(() => /3 of 5 chapters bound/.test((document.querySelector('.g-bound') || {}).textContent || ''), null, { timeout: 20000 });
  await app.page.evaluate(() => { const f = U.saveFile; window.__saved = []; U.saveFile = function (n, t, ty) { window.__saved.push({ n, t, ty }); return f.apply(this, arguments); }; });
  await app.page.locator('.d-save').click();
  await app.page.waitForFunction(() => window.__saved.length === 1);
  const s = await app.page.evaluate(() => window.__saved[0]);
  assert(/^dossier-why-pendulums-keep-time-\d{4}-\d{2}-\d{2}\.html$/.test(s.n), 'file name ' + s.n);
  eq(s.ty, 'text/html', 'type');
  const dl = (await app.calls()).filter((c) => c.kind === 'download');
  eq(dl.length, 1, 'through the downloads capability');
  await app.page.waitForFunction(() => /Save a copy/.test(document.querySelector('.d-save').textContent) && !document.querySelector('.d-save').disabled);
  const h = s.t;
  assert(h.startsWith('<!doctype html>') && h.includes('<style>') && /fonts\.googleapis\.com\/css2\?family=Barlow/.test(h), 'a page with its styles and a fonts link');
  assert(!/Literata|Walter|Patrick|Special\+Elite/.test(h), 'none of the old fonts');
  assert(/system-ui/.test(h) && /monospace/.test(h), 'with fallbacks');
  assert(/class="t w full"/.test(h) && /class="t em full"/.test(h) && /class="t warn( mis)?"/.test(h) && /class="t ink"/.test(h), 'in the same tiles: white, emphasis, warning, ink');
  assert(!/<script/i.test(h) && !/\son[a-z]+=/i.test(h) && !/<iframe/i.test(h), 'no scripts, handlers or frames');
  for (const t of ['What sets the beat', 'Small swings and big swings', 'From pendulums to clocks', 'Key idea', 'Length sets the beat.', 'Put it into practice', 'Rule of thumb', 'Worked example', 'Common mistakes', 'Four times the length, twice the time', 'Glossary', 'Bibliography', 'The live plate plays']) assert(h.includes(t), 'contains ' + t);
  eq((h.match(/Put it into practice/g) || []).length, 1, 'practice only where the chapter has it (one of the three)');
  await noTests(app, 'the saved copy', h.replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"'));
  assert(!h.includes(DAN), 'none of Dan\'s words: ' + (h.match(/DANWORDS[-\w]*/g) || []).join(', '));
  // It reads on its own.
  const p2 = await app.context.newPage();
  await p2.route('**/*', (r) => r.abort());
  await p2.setContent(h);
  eq(await p2.locator('h1').innerText(), 'Why pendulums keep time', 'opens as a page, titled by the course');
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
