#!/usr/bin/env node
// Browser tests for the lesson screen (app/src/js/50-lesson.js) and Ask Claude (51-tutor.js).
//
// Builds a partial page with the real kit host (32/33) and cards (40/41) plus the lesson (50/51),
// seeds a topic and lesson docs into the runtime stub, and fakes what this build does not contain:
// U.gen (ensureLesson, grade, tutor) and U.review (addFromLesson), recording every call.
//
// Last, 'full-app' runs one lesson in the complete build (real boot, U.gen, U.review, cards, kit)
// with only the model stubbed, to catch integration breaks between modules.
//
// Scenarios: the whole lesson at 360 and 1280 px in light and dark (progress writes, grade calls,
// addFromLesson, Ask Claude with the interactive's state, footnote sheet, "This looks wrong",
// revisiting a finished idea), preparing (only the preparation card while the lesson is written
// and while its interactive is built and tested, then the whole lesson; the next idea prepared in
// the background and its status on the finished screen), a lesson finished on another device,
// resuming after a reload mid-build, an error with Retry, resuming mid-lesson,
// the no-interactive path (contested, not source-checked), Text size XL on a phone (headings,
// eyebrow, the interactive's own text size), and every Text size on phones and a laptop (the
// eyebrow keeps the topic name, Ask Claude's starters, check questions on the heading scale), and
// Ask Claude's chips with the keyboard up on a phone, under a conversation on a laptop and a phone.
// Screenshots: tests/out/lesson-*.png.
//
// Usage: node tests/e2e/lesson.spec.mjs [scenario-filter]     exits non-zero on any failure
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openApp, taskOf, ROOT } from '../../tools/harness/page.mjs';

const OUT = join(ROOT, 'tests', 'out');
const PAGE = join(OUT, 'lesson.html');
const filter = process.argv[2] || '';
mkdirSync(OUT, { recursive: true });

const build = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--only', '32,33,40,41,50,51', '--out', PAGE], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);

const fx = (name) => JSON.parse(readFileSync(join(ROOT, 'tests', 'fixtures', 'lesson-ui-' + name + '.json'), 'utf8'));
const TOPIC = fx('topic'), PENDULUM = fx('pendulum'), CLOCKS = fx('clocks'), SMALL = fx('small-swings');
const UID = 'u_stubuser0000000000000000';
const PROGRESS = `data/users/${UID}/profile/progress/pendulums`;
const LESSON = (iid) => `topics/pendulums/lessons/${iid}`;

// ---------- fakes, installed in the page before routing (must be self-contained) ----------
function installFakes(cfg) {
  var T = window.__T = { ensure: [], grade: [], tutor: [], add: [], relearn: [], mounts: [], pending: {}, gradeReplies: cfg.gradeReplies || [], kit: '' };
  (cfg.pending || []).forEach(function (iid) {
    T.pending[iid] = function (o) { return new Promise(function (res, rej) { T.prep = { o: o, res: res, rej: rej }; }); };
  });
  if (cfg.failFirst) {
    var calls = 0;
    T.pending[cfg.failFirst.iid] = function (o) {
      calls++;
      if (calls === 1) return U.sleep(300).then(function () { o.onStatus && o.onStatus('Writing the lesson'); return U.sleep(300); }).then(function () { throw { code: 'unavailable', message: 'offline' }; });
      return U.sleep(200).then(function () { return cfg.failFirst.doc; });
    };
  }
  U.gen = {
    ensureLesson: function (tid, iid, o) {
      T.ensure.push({ tid: tid, iid: iid, status: !!(o && o.onStatus), background: !!(o && o.background) });
      if (T.pending[iid]) return T.pending[iid](o || {});
      return U.store.lesson.get(tid, iid).then(function (d) { return d && d.status === 'ready' ? d : new Promise(function () {}); });
    },
    grade: function (say, text, attempt, opts) {
      T.grade.push({ text: text, attempt: attempt, rubric: (say.rubric || []).length, previous: (opts && opts.previous) || null, title: (opts && opts.title) || null });
      var r = T.gradeReplies.shift() || { met: [true, false, false], verdict: 'partly', nailed: 'You have the main point.', followUp: 'What happens if you make it four times as long?' };
      return U.sleep(cfg.gradeMs || 350).then(function () { return r; });
    },
    // Learn it again: like the real one, the lesson doc is replaced (writing, then the new lesson's
    // text while its interactive is built, then the whole new lesson). T.relearnSeen records what
    // the screen showed at each step.
    relearn: cfg.relearnDoc ? function (tid, iid, o) {
      T.relearn.push({ tid: tid, iid: iid, feedback: (o && o.feedback) || null });
      T.relearnSeen = T.relearnSeen || [];
      function seen(step) { T.relearnSeen.push({ step: step, stages: document.querySelectorAll('.lsn-stage, .lsn-past').length, prep: !!document.querySelector('.lsn-prep'), text: document.querySelector('.lsn').textContent }); }
      var d = JSON.parse(JSON.stringify(cfg.relearnDoc));
      d.lesson.predict.q = d.lesson.predict.q + ' (take ' + T.relearn.length + ')';
      return U.store.lesson.set(tid, iid, { status: 'writing', lesson: null, interactive: null, sourced: false, updatedAt: U.now() }).then(function () {
        return U.sleep(300);
      }).then(function () {
        seen('writing');
        return U.store.lesson.set(tid, iid, { status: 'building', lesson: d.lesson, interactive: null, sourced: true });
      }).then(function () {
        return U.sleep(400);
      }).then(function () {
        seen('building');
        return U.store.lesson.set(tid, iid, d).then(function () { return U.store.lesson.get(tid, iid); });
      });
    } : undefined,
    tutor: function (messages, context, o) {
      T.tutor.push({ messages: messages.map(function (m) { return { role: m.role, content: m.content }; }), state: context.state || null, iid: context.iid || null, hasLesson: !!context.lesson });
      var reply = T.tutor.length === 1
        ? 'Good question. The pull of gravity speeds the bob up, but a longer string gives it further to go along its arc. Those two effects together give the **square root**.\n\nSo at **' + (context.state && context.state.params ? context.state.params.L : '?') + ' m** the swing takes about ' + (context.state && context.state.outputs && context.state.outputs.T ? context.state.outputs.T.toFixed(2) : '?') + ' s.[^2]'
        : 'A playground swing with long chains swings slowly; a short one on a toddler swing goes back and forth much faster.';
      var parts = reply.match(/[\s\S]{1,14}/g), acc = '';
      return new Promise(function (resolve) {
        var i = 0;
        (function tick() {
          if (i >= parts.length) return resolve(acc);
          acc += parts[i]; o.onText({ text: acc, delta: parts[i] }); i++;
          setTimeout(tick, 25);
        })();
      });
    },
  };
  U.review = { addFromLesson: function (tid, iid, lesson, outcome) { T.add.push({ tid: tid, iid: iid, title: lesson && lesson.title, outcome: JSON.parse(JSON.stringify(outcome)) }); return Promise.resolve(); } };
  T.kit = U.sandbox && typeof U.sandbox.mount === 'function' && String(U.KIT_JS || '').length > 2000 ? 'real' : 'missing';
  T.cards = U.cards && typeof U.cards.render === 'function' ? 'real' : 'missing';
}

// ---------- harness ----------
const results = [];
let current = '';
function ok(cond, msg) { results.push({ ok: !!cond, msg: current + ': ' + msg }); if (!cond) console.log('  FAIL ' + msg); }

async function open({ width, height, dark, size = null, hash, seed = {}, cfg = {}, reduced = false }) {
  const app = await openApp({ width, height: height || (width < 700 ? 707 : 860), file: PAGE });
  if (reduced) await app.page.emulateMedia({ reducedMotion: 'reduce' });
  await app.page.goto(app.url(hash));
  await app.page.evaluate(async ({ theme, size, seed }) => {
    await U.rt.ready;
    document.documentElement.dataset.muTheme = theme;
    if (size) document.documentElement.dataset.size = size;
    Object.keys(seed).forEach((p) => window.__CLAUDE_STUB__.seed(p, seed[p]));
  }, { theme: dark ? 'dark' : 'light', size, seed });
  await app.page.evaluate(installFakes, cfg);
  const mods = await app.page.evaluate(() => [window.__T.kit, window.__T.cards]);
  ok(mods[0] === 'real' && mods[1] === 'real', `real kit host and cards module present (${mods.join(', ')})`);
  await app.page.evaluate(() => { window.addEventListener('hashchange', U._route); U._route(); });
  return app;
}
async function shot(app, name, full = false) {
  await app.page.waitForTimeout(450);
  await app.page.screenshot({ path: join(OUT, 'lesson-' + name + '.png'), fullPage: full });
}
const T = (app) => app.page.evaluate(() => JSON.parse(JSON.stringify(window.__T)));
// Keyed lists (say, questions, flags) may be maps or old arrays: values, oldest first.
const vals = (m) => (Array.isArray(m) ? m : Object.values(m || {})).filter(Boolean).sort((a, b) => String(a.at).localeCompare(String(b.at)));
const doc = (app, path) => app.page.evaluate((p) => window.__CLAUDE_STUB__.get(p), path);
async function noOverflow(app) {
  const w = await app.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok(w[0] <= w[1], `no horizontal scroll (${w[0]} <= ${w[1]})`);
}
async function answerCheck(app, check, right = true) {
  const card = app.page.locator('.lsn-check').last();
  await card.locator('.qc-primary, .qc-continue').first().waitFor();
  if (check.type === 'choice') {
    const i = right ? check.answer : (check.answer + 1) % check.options.length;
    const opt = card.locator(`.qc-opt[data-i="${i}"]`);
    if (await opt.count()) await opt.click();
  } else if (check.type === 'order') {
    for (const item of check.items) { const chip = card.locator('.qc-chip', { hasText: item }); if (await chip.count()) await chip.first().click(); }
  } else if (check.type === 'estimate') {
    const plus = card.locator('.qc-nudge').last();
    if (await plus.count()) await plus.click();
  }
  await card.locator('.qc-primary').click();
  await card.locator('.qc-continue').waitFor();
}
async function continueCheck(app) { await app.page.locator('.lsn-check').last().locator('.qc-continue').click(); }
// The eyebrow above the title: how many lines it takes, whether the topic name and the
// "Idea n of N" count are inside its visible box, and whether the count is on one line (whole).
function eyebrowOf(page) {
  return page.locator('.lsn-eb').evaluate((el) => {
    const box = el.getBoundingClientRect(), inside = (sel) => { const p = el.querySelector(sel), r = p && p.getBoundingClientRect(); return !!r && r.width > 0 && r.top >= box.top - 1 && r.bottom <= box.bottom + 1; };
    return { lines: Math.round(box.height / parseFloat(getComputedStyle(el).lineHeight)), topic: inside('.lsn-eb-topic'), count: inside('.lsn-eb-n'),
      whole: el.querySelector('.lsn-eb-n').getClientRects().length === 1 };
  });
}
// The Ask Claude sheet: the chips showing in its dock, chips in the conversation, its height,
// and whether every chip showing is whole inside the sheet (not cut off at its edge); how many
// rows the chips take, whether their row scrolls sideways and which of its edges fade (more-left,
// more-right), whether the keyboard-up layout is on (is-cramped), whether the empty-state
// heading is whole between the sheet's top and the dock, and the height left for the
// conversation between the sheet's title and the dock (msgArea).
function tutorState(page) {
  return page.evaluate(() => {
    const sh = document.querySelector('.tutor-sheet'), sr = sh.getBoundingClientRect();
    const row = sh.querySelector('.tutor-chips'), cs = getComputedStyle(row), dock = sh.querySelector('.tutor-dock').getBoundingClientRect();
    const shown = [...sh.querySelectorAll('.tutor-dock .chip')].filter((c) => !c.hidden);
    const head = sh.querySelector('.tutor-empty-head'), hr = head && head.getBoundingClientRect();
    const title = sh.querySelector('.sheet-head').getBoundingClientRect();
    return { chips: shown.map((c) => c.textContent).join('|'), inLog: sh.querySelectorAll('.tutor-log .chip').length,
      empty: sh.classList.contains('is-empty'), h: Math.round(sr.height), vh: innerHeight, layout: document.documentElement.dataset.layout,
      dockH: Math.round(dock.height), msgArea: Math.round(dock.top - Math.max(sr.top, title.bottom)),
      whole: shown.every((c) => { const r = c.getBoundingClientRect(); return r.left >= sr.left - 0.5 && r.right <= sr.right + 0.5; }),
      rows: new Set(shown.map((c) => Math.round(c.getBoundingClientRect().top))).size,
      scrolls: row.scrollWidth > row.clientWidth + 1, fade: [...row.classList].filter((c) => /^more-/.test(c)).join(' '),
      mask: (cs.maskImage || cs.webkitMaskImage || 'none') !== 'none', cramped: sh.classList.contains('is-cramped'),
      headWhole: !!hr && hr.top >= sr.top - 0.5 && hr.bottom <= dock.top + 0.5 };
  });
}

// ---------- scenario: the whole lesson ----------
async function walk(width, dark) {
  const tag = `${width}-${dark ? 'dark' : 'light'}`;
  current = 'walk ' + tag;
  console.log('\n' + current);
  const cfg = { gradeReplies: [
    { met: [true, false, false], verdict: 'partly', nailed: 'You have the main point: a longer string means a slower swing.', followUp: 'How much slower? If the string is four times as long, what happens to the swing time?' },
    { met: [true, true, false], verdict: 'partly', nailed: 'Yes: four times as long only doubles the time, because it goes with the square root.', followUp: 'Why does the size of the swing hardly matter?' },
  ] };
  const app = await open({ width, dark, hash: '#/t/pendulums/i1', seed: { 'topics/pendulums': TOPIC, [LESSON('i1')]: PENDULUM }, cfg, reduced: width > 700 });
  const { page } = app;
  try {
    // Predict
    await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor();
    ok(await page.locator('.lsn-title').textContent() === 'What sets the beat', 'idea title from the topic doc');
    ok((await page.locator('.lsn-eb').textContent()).includes('Idea 1 of 5'), 'eyebrow says Idea 1 of 5');
    const eb = await eyebrowOf(page);
    ok(eb.topic && eb.count && eb.whole && eb.lines <= (width < 700 ? 2 : 1), `eyebrow shows the topic name and the whole count${width < 700 ? ' (wrapping on a phone)' : ' on one line'} (${JSON.stringify(eb)})`);
    ok(await page.locator('.lsn-step.is-now').count() === 1, 'one current step in the progress bar');
    ok(await page.locator('.lsn-steps-label').textContent() === 'Predict', 'the bar names the stage, without a second "of N" beside the eyebrow\'s');
    ok(await page.locator('.lsn-step.is-now').getAttribute('aria-label') === 'Step 1 of 5: Predict, current step', 'the current segment tells a screen reader "Step 1 of 5: Predict"');
    ok(!(await page.locator('.lsn-one').isVisible()), 'the idea\'s one line is hidden while Predict asks (it gives the answer away)');
    const sure = page.getByRole('button', { name: 'That\'s my guess' });
    ok(await sure.isDisabled(), 'guess button waits for a choice');
    await noOverflow(app);
    await shot(app, `${tag}-1-predict`);
    await page.locator('.lsn-stage[data-stage="predict"] .option').nth(0).click();
    await sure.click();

    // Play
    const play = page.locator('.lsn-stage[data-stage="play"]');
    await play.locator('iframe').waitFor();
    ok(await page.locator('.lsn-one').isVisible() && /length, not on how far/.test(await page.locator('.lsn-one').textContent()), 'the one line shows once he has guessed');
    const reserved = await play.locator('.lsn-panel').evaluate((el) => el.getBoundingClientRect().height);
    ok(reserved >= 560, `height reserved while the interactive loads (${Math.round(reserved)}px)`);
    if (width < 700) await shot(app, `${tag}-2a-play-loading`);
    await play.locator('.lsn-selfcheck').waitFor({ timeout: 15000 });
    ok((await play.locator('.lsn-selfcheck').textContent()).includes('2/2 checks'), 'self-check footer shows 2/2 checks');
    await page.waitForTimeout(1000);
    const settledH = await play.locator('.lsn-panel').evaluate((el) => el.getBoundingClientRect().height);
    console.log(`  interactive: reserved ${Math.round(reserved)}px, settled ${Math.round(settledH)}px`);
    // The key follows the width the panel gets: phone, a wide column, or a laptop.
    const panelW = await play.locator('.lsn-play').evaluate((el) => el.getBoundingClientRect().width);
    const hkey = 'mu-lsn-h:pendulums/i1' + (panelW >= 860 ? ':laptop' : panelW >= 560 ? ':wide' : '');
    ok(await page.evaluate((k) => Number(localStorage.getItem(k)) > 200, hkey), 'measured height remembered for next time (per width: ' + hkey + ')');
    let progress = await doc(app, PROGRESS);
    ok(progress && progress.ideas.i1.predict && progress.ideas.i1.predict.answer === 'It takes twice as long', 'prediction saved');
    ok(progress && progress.ideas.i1.stage === 'play' && progress.lastIdea === 'i1', 'stage play and lastIdea saved');
    await play.locator('summary', { hasText: 'What am I looking at?' }).click();
    await page.frameLocator('.lsn-panel iframe').locator('input[type=range]').evaluate((el) => { el.value = '2'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await play.scrollIntoViewIfNeeded();
    await page.evaluate(() => { const p = document.querySelector('.lsn-stage[data-stage="play"]'); window.scrollTo(0, p.getBoundingClientRect().top + scrollY - 120); });
    await shot(app, `${tag}-2b-play`);

    // Ask Claude while playing: the interactive's state goes along
    await page.locator('.lsn-ask').click();
    await page.locator('.tutor-sheet').waitFor();
    const empty = await tutorState(page);
    ok(empty.chips === 'Explain it differently|Give me an example' && empty.inLog === 0, `empty Ask Claude: the two starters sit just above the input (${empty.chips})`);
    ok(empty.whole, 'empty Ask Claude: both starters are whole, not cut off at the sheet edge');
    ok(empty.empty && empty.h < empty.vh * 0.7, `empty Ask Claude is only as tall as it needs to be (${empty.h} of ${empty.vh}px)`);
    await shot(app, `${tag}-3a-tutor-empty`);
    await page.locator('.tutor-input').fill('Why the square root and not just double?');
    await page.locator('.tutor-input').press('Enter');
    await page.waitForFunction(() => window.__T.tutor.length === 1 && !document.querySelector('.tutor-wait'));
    await page.waitForFunction(() => /swing takes about/.test(document.querySelector('.tutor-log').textContent));
    await page.waitForTimeout(400);
    let t = await T(app);
    ok(t.tutor[0].state && t.tutor[0].state.params && t.tutor[0].state.params.L === 2, 'tutor gets the interactive params (L = 2)');
    ok(t.tutor[0].iid === 'i1' && t.tutor[0].hasLesson, 'tutor gets the lesson and idea');
    ok(t.tutor[0].messages.length === 1 && t.tutor[0].messages[0].role === 'user', 'tutor gets the question as messages');
    await page.locator('.tutor-chips .chip', { hasText: 'Give me an example' }).click();
    await page.waitForFunction(() => window.__T.tutor.length === 2 && /playground/.test(document.querySelector('.tutor-log').textContent));
    await page.waitForTimeout(300);
    t = await T(app);
    ok(t.tutor[1].messages.length === 3, 'second question carries the conversation (3 messages)');
    const talking = await tutorState(page);
    ok(talking.chips === 'Explain it differently|Give me an example|Are you sure?' && !talking.empty && talking.h > empty.h, 'after an answer: all three chips, and the sheet grows to hold the conversation');
    progress = await doc(app, PROGRESS);
    const qs = vals(progress.questions);
    ok(progress.questions && !Array.isArray(progress.questions) && qs.length === 1 && qs[0].iid === 'i1' && /square root/.test(qs[0].q), 'typed question saved to progress.questions as a keyed entry (chips are not)');
    await shot(app, `${tag}-3b-tutor`);
    await page.keyboard.press('Escape');
    await page.locator('.tutor-sheet').waitFor({ state: 'detached' });

    await page.getByRole('button', { name: 'I\'ve had a play' }).click();
    await play.locator('.lsn-reveal').waitFor();
    ok((await play.locator('.lsn-reveal-guess').textContent()).includes('It takes twice as long'), 'reveal sits next to his guess');
    await shot(app, `${tag}-4-reveal`);
    await play.getByRole('button', { name: 'Continue' }).click();

    // Explain
    const ex = page.locator('.lsn-stage[data-stage="explain"]');
    await ex.waitFor();
    ok(await ex.locator('mark.term').count() === 2, 'key terms highlighted');
    ok(await ex.locator('.lsn-reading .fn').count() === 2, 'footnote buttons for known sources');
    ok(await ex.locator('.lsn-quiet').count() === 0, 'no "not source-checked" note on a sourced lesson');
    const paras = await ex.locator('.lsn-reading p').evaluateAll((ps) => ps.map((p) => {
      const cs = getComputedStyle(p), fn = p.querySelector('.fn'), hit = fn && getComputedStyle(fn, '::after');
      return { fn: !!fn, lines: p.getBoundingClientRect().height / parseFloat(cs.lineHeight), em: p.getBoundingClientRect().width / parseFloat(cs.fontSize),
        hit: hit ? [parseFloat(hit.width), parseFloat(hit.height)] : null };
    }));
    ok(paras.some((q) => q.fn) && paras.every((q) => Math.abs(q.lines - Math.round(q.lines)) < 0.05), 'a footnote badge leaves its line the same height as the others: ' + paras.map((q) => q.lines.toFixed(2)).join(', '));
    ok(paras.filter((q) => q.fn).every((q) => q.hit[0] >= 44 && q.hit[1] >= 44), 'footnote badges keep a 44 px tap target');
    ok(paras.every((q) => q.em <= 33.01), 'the explanation keeps a reading measure (at most 33em: ' + paras.map((q) => q.em.toFixed(1)).join(', ') + ')');
    await shot(app, `${tag}-5a-explain`);
    await ex.locator('.lsn-reading .fn').first().click();
    const link = page.locator('.sheet .lsn-src-link');
    await link.waitFor();
    ok(await link.getAttribute('target') === '_blank' && await link.getAttribute('rel') === 'noopener', 'source link opens in a new tab with rel=noopener');
    ok((await page.locator('.sheet .lsn-quote').textContent()).includes('acceleration of gravity'), 'source sheet shows the exact quote');
    await shot(app, `${tag}-5b-source`);
    await page.keyboard.press('Escape');
    // This looks wrong
    await page.locator('.lsn-flag-link').click();
    await page.locator('.sheet textarea').fill('The analogy says pushing harder does nothing, but the text says it does for big swings.');
    await shot(app, `${tag}-5c-flag`);
    ok(/kept with this lesson/.test(await page.locator('.sheet').textContent()) && !/checked and fixed/.test(await page.locator('.sheet').textContent()), 'flag sheet says what happens to the note');
    await page.locator('.sheet .btn', { hasText: 'Keep my note' }).click();
    await page.locator('.lsn-flag-kept', { hasText: 'Your note is kept with this lesson' }).waitFor();
    ok(await page.locator('#toasts .toast').count() === 0, 'the thanks shows under the link, not in a toast over the next stage');
    await page.waitForTimeout(400);
    const lessonDoc = await doc(app, LESSON('i1'));
    const flags = vals(lessonDoc.flags);
    ok(flags.length === 1 && /analogy/.test(flags[0].note) && flags[0].at && !Array.isArray(lessonDoc.flags), 'flag saved on the lesson doc as a keyed entry');
    ok(lessonDoc.status === 'ready' && lessonDoc.lesson, 'flagging keeps the lesson intact');
    await ex.getByRole('button', { name: 'Continue' }).click();

    // Say it back: two attempts
    const say = page.locator('.lsn-stage[data-stage="say"]');
    await say.locator('textarea').waitFor();
    await say.locator('textarea').fill('A longer string makes it swing slower.');
    await shot(app, `${tag}-6a-say`);
    await say.getByRole('button', { name: 'Check my answer' }).click();
    await say.locator('.lsn-grade').waitFor();
    ok(await say.locator('.lsn-grade .lsn-met li').count() === 1, 'only the met rubric point gets a tick');
    ok(await say.locator('.lsn-follow').count() === 1, 'shows the one follow-up');
    ok(await say.locator('.lsn-model').count() === 0, 'first miss does not reveal the model answer');
    await shot(app, `${tag}-6b-say-graded`);
    await say.getByRole('button', { name: 'Have another go' }).click();
    ok((await say.locator('textarea').inputValue()).startsWith('A longer string'), 'second go starts from his first answer');
    await say.locator('textarea').fill('A longer string makes it swing slower, but only with the square root: four times as long is twice the time.');
    await say.getByRole('button', { name: 'Check again' }).click();
    await say.locator('.lsn-model').waitFor();
    t = await T(app);
    ok(t.grade.length === 2 && t.grade[0].attempt === 1 && t.grade[1].attempt === 2, 'grade called with attempt 1 then 2');
    ok(t.grade[1].previous && /longer string/.test(t.grade[1].previous.text) && /four times/.test(t.grade[1].previous.followUp) && t.grade[1].title === 'What sets the beat', 'second grade gets the first try, its follow-up and the idea title');
    ok(await say.locator('.lsn-rubric li.is-met').count() === 2, 'model answer marks the 2 points he made');
    await page.waitForTimeout(300);
    progress = await doc(app, PROGRESS);
    const says = vals(progress.ideas.i1.say);
    ok(says.length === 2 && says[1].verdict === 'partly' && says[1].met.join() === 'true,true,false', 'both attempts saved for the Book');
    await shot(app, `${tag}-6c-say-model`);
    await say.getByRole('button', { name: 'Continue' }).click();

    // Checks (real cards module)
    const checks = page.locator('.lsn-stage[data-stage="checks"]');
    await checks.waitFor();
    const C = PENDULUM.lesson.checks;
    await answerCheck(app, C[0], false);
    await shot(app, `${tag}-7a-check-wrong`);
    await continueCheck(app);
    await answerCheck(app, C[1]);
    await continueCheck(app);
    await answerCheck(app, C[2]);
    await shot(app, `${tag}-7b-check-estimate`);
    await continueCheck(app);

    // Done
    const done = page.locator('.lsn-done');
    await done.waitFor();
    await page.waitForTimeout(400);
    t = await T(app);
    ok(t.add.length === 1 && t.add[0].iid === 'i1', 'addFromLesson called once');
    const oc = t.add[0] && t.add[0].outcome;
    ok(oc && oc.checks.c1 && oc.checks.c1.correct === false && oc.checks.c2.correct === true && oc.checks.c3.correct === true, 'outcome carries each check result');
    ok(oc && oc.say && oc.say.verdict === 'partly' && /four times/.test(oc.say.text), 'outcome carries the last say-it-back');
    progress = await doc(app, PROGRESS);
    ok(progress.ideas.i1.stage === 'done' && progress.ideas.i1.doneAt, 'stage done and doneAt saved');
    ok(progress.ideas.i1.checks.c1.correct === false && progress.ideas.i1.checks.c3.correct === true, 'check results saved');
    ok((await done.locator('.lsn-next h3').textContent()) === 'Gravity’s part', 'where next names the next idea');
    const lines = await done.locator('.lsn-done-text > span').allTextContents();
    ok(lines.length === 2 && lines[0] === '2 of 3 checks right.' && /in your Book/.test(lines[1]), 'done says how it went and where his work went, on two short lines: ' + JSON.stringify(lines));
    ok(await page.locator('.lsn-step.is-all').count() === 5, 'progress bar turns green when done');
    ok(await page.locator('.lsn-steps-label').textContent() === 'Idea learned', 'the bar says "Idea learned" at the end');
    t = await T(app);
    ok(t.ensure.some((e) => e.iid === 'i2'), 'next idea prefetched');
    await shot(app, `${tag}-8-done`);
    if (width < 700 && !dark) await shot(app, `${tag}-9-full`, true);

    // Revisit: everything collapsed, no second celebration or cards
    await page.waitForFunction(() => !document.querySelector('.cheer'), null, { timeout: 5000 });
    await page.evaluate(() => U.go(location.hash));
    await page.locator('.lsn-done').waitFor();
    ok(await page.locator('.lsn-past').count() === 5, 'revisit shows all five stages collapsed');
    // The script shortens a summary at a word; the row must show all of it (no cut-off mid-word).
    const sums = await page.locator('.lsn-past-sum').evaluateAll((els) => els.map((el) => ({ text: el.textContent, cut: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1 })));
    ok(sums.every((x) => !x.cut), 'stage summaries wrap and show in full: ' + sums.map((x) => x.text + (x.cut ? ' (cut)' : '')).join(' | '));
    await page.waitForTimeout(600);
    ok(await page.locator('.cheer').count() === 0, 'no celebration on a revisit');
    t = await T(app);
    ok(t.add.length === 1, 'revisit does not add review cards again');
    await page.locator('.lsn-past[data-stage="say"] summary').click();
    await page.locator('.lsn-past[data-stage="say"] .lsn-model').waitFor();
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(app, `${tag}-10-revisit`);
    await noOverflow(app);
  } catch (e) {
    ok(false, 'walk threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, `${tag}-error`).catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: preparing (ensureLesson pending) ----------
// A lesson opens only when it is whole. While it is written, and while its interactive is built
// and tested, the screen shows only the preparation card: eyebrow, title, the idea's one line,
// honest steps and a calm note. Never Predict or any lesson text.
async function onlyPrep(page, what) {
  const s = await page.evaluate(() => ({
    stages: document.querySelectorAll('.lsn-stage, .lsn-past').length,
    options: document.querySelectorAll('.option').length,
    foot: !document.querySelector('.lsn-foot').hidden,
    label: document.querySelector('.lsn-steps-label').textContent,
    now: document.querySelectorAll('.lsn-step.is-now').length,
    text: document.querySelector('.lsn').textContent,
  }));
  ok(s.stages === 0 && s.options === 0, `${what}: no Predict and no lesson stages (${s.stages} stages, ${s.options} options)`);
  ok(!s.foot, `${what}: no "This looks wrong" before there is a lesson to flag`);
  ok(s.label === 'Getting ready' && s.now === 0, `${what}: the bar says it is getting ready, with no current step (${s.label}, ${s.now})`);
  return s.text;
}
async function preparing() {
  current = 'preparing 360-light';
  console.log('\n' + current);
  const app = await open({ width: 360, dark: false, hash: '#/t/pendulums/i3', seed: { 'topics/pendulums': TOPIC }, cfg: { pending: ['i3'] } });
  const { page } = app;
  try {
    await page.locator('.lsn-prep').waitFor();
    ok(await page.locator('.lsn-title').textContent() === 'Small swings and big swings', 'title shows while preparing');
    ok((await page.locator('.lsn-eb').textContent()).includes('Idea 3 of 5'), 'the eyebrow shows while preparing');
    ok(await page.locator('.lsn-one').isVisible(), 'the idea\'s one line shows on the preparation card (there is no question yet)');
    ok(/This usually takes a few minutes\. You can leave this screen; it keeps going while the app is open\./.test(await page.locator('.lsn-prep-calm').textContent()), 'a calm note: how long, and that he can leave');
    await page.evaluate(() => { const o = window.__T.prep.o; o.onStatus('Checking sources for this idea…'); o.onStatus('Writing your lesson from 4 checked sources…'); });
    ok(await page.locator('.lsn-prep-lines li').count() === 3, 'progress lines appear one per status');
    ok(await page.locator('.lsn-prep-lines li.is-done').count() === 2, 'earlier lines are ticked off');
    await onlyPrep(page, 'writing');
    let pr = await doc(app, PROGRESS);
    ok(!(pr && pr.ideas && pr.ideas.i3), 'opening a lesson that is not ready does not count as starting it');
    await shot(app, 'prep-1-writing');
    // The lesson text is written and saved; the interactive is still being built and tested.
    const building = { status: 'building', updatedAt: new Date().toISOString(), lesson: SMALL.lesson, interactive: null, sourced: true };
    await app.seed(LESSON('i3'), building);
    // The builder's own lines (33-interactive.js): one per attempt, none repeated.
    await page.evaluate(() => { const o = window.__T.prep.o; ['Building your interactive…', 'Testing it at phone, tablet and laptop sizes…', 'Fixing what the test found (try\u00a02\u00a0of\u00a03)…', 'Fixing what the test found (try\u00a03\u00a0of\u00a03)…'].forEach((t) => o.onStatus(t)); });
    await page.waitForTimeout(400);
    const text = await onlyPrep(page, 'building');
    ok(!text.includes('twice as far') && !text.includes('period'), 'none of the lesson\'s text shows while its interactive is built');
    const lines = await page.locator('.lsn-prep-lines li').allTextContents();
    const prepLines = await page.locator('.lsn-prep-lines li .lsn-prep-text').allTextContents();
    ok(new Set(prepLines).size === prepLines.length, 'no preparation line twice: ' + JSON.stringify(prepLines));
    ok(prepLines.slice(-2).join(' | ') === 'Fixing what the test found (try\u00a02\u00a0of\u00a03) | Fixing what the test found (try\u00a03\u00a0of\u00a03)…', 'one line per build attempt: ' + JSON.stringify(prepLines));
    ok(lines.some((l) => /Building your interactive/.test(l)) && lines.some((l) => /Testing it/.test(l)) && /Fixing what the test found/.test(lines[lines.length - 1]), 'honest steps: building, testing, fixing what the test found: ' + JSON.stringify(lines));
    await shot(app, 'prep-2-building');
    // Whole: the lesson replaces the card, starting at Predict; the one line waits for his guess.
    await app.seed(LESSON('i3'), SMALL);
    await page.evaluate((d) => window.__T.prep.res(d), SMALL);
    await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor();
    ok(await page.locator('.lsn-prep').count() === 0, 'the preparation card goes once the lesson is whole');
    ok(await page.locator('.lsn-steps-label').textContent() === 'Predict' && await page.locator('.lsn-step.is-now').count() === 1, 'the bar starts at Predict');
    ok(!(await page.locator('.lsn-one').isVisible()), 'the one line is hidden while Predict asks (it would give the answer away)');
    await page.waitForTimeout(400);
    pr = await doc(app, PROGRESS);
    ok(pr && pr.ideas && pr.ideas.i3 && pr.ideas.i3.startedAt && pr.ideas.i3.stage === 'predict', 'the idea is started once the whole lesson is on screen');
    await shot(app, 'prep-3-whole');
    await page.locator('.lsn-stage[data-stage="predict"] .option').nth(1).click();
    await page.getByRole('button', { name: 'That\'s my guess' }).click();
    const play = page.locator('.lsn-stage[data-stage="play"]');
    await play.locator('.lsn-selfcheck').waitFor({ timeout: 15000 });
    ok(await page.locator('.lsn-one').isVisible(), 'the one line shows once he has guessed');
    ok(await play.getByRole('button', { name: 'I\'ve had a play' }).count() === 1, 'the interactive is there at once: no waiting inside the lesson');
    ok(await play.getByRole('button', { name: /read on while it builds/ }).count() === 0, 'no "read on while it builds" any more');
    const t = await T(app);
    ok(t.ensure[0].iid === 'i3' && t.ensure[0].status && !t.ensure[0].background, 'ensureLesson called in the foreground with onStatus');
    ok(t.ensure.some((e) => e.iid === 'i4' && e.background), 'the next idea (i4) is prepared in the background once this one is whole');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'prep-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: finished on another device while this one shows the card ----------
async function preparedElsewhere(width, dark) {
  const tag = `${width}-${dark ? 'dark' : 'light'}`;
  current = 'prepared-elsewhere ' + tag;
  console.log('\n' + current);
  const writing = { status: 'writing', updatedAt: new Date().toISOString(), lesson: null, interactive: null, by: { device: 'other', tab: 'other', holder: 'other/other' } };
  const app = await open({ width, dark, hash: '#/t/pendulums/i3', seed: { 'topics/pendulums': TOPIC, [LESSON('i3')]: writing }, cfg: { pending: ['i3'] } });
  const { page } = app;
  try {
    await page.locator('.lsn-prep').waitFor();
    await page.evaluate(() => window.__T.prep.o.onStatus('Your other device is preparing this lesson. Waiting for it…'));
    await onlyPrep(page, 'writing elsewhere');
    await noOverflow(app);
    await shot(app, `prep-elsewhere-${tag}-1`);
    // The other device saves the whole lesson: it opens here at once, although this page's own
    // ensureLesson has not settled.
    await app.seed(LESSON('i3'), SMALL);
    await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor({ timeout: 5000 });
    ok(await page.locator('.lsn-prep').count() === 0, 'the card goes the moment the doc is whole');
    await page.evaluate((d) => window.__T.prep.res(d), SMALL);
    await page.waitForTimeout(300);
    ok(await page.locator('.lsn-stage[data-stage="predict"]').count() === 1, 'the job settling afterwards draws nothing twice');
    await shot(app, `prep-elsewhere-${tag}-2-whole`);
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, `prep-elsewhere-${tag}-error`).catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: reopened (or reloaded) while the interactive is still being built ----------
// Audit round 3, findings 13 and 35. Progress saved past Predict on an unfinished lesson (older
// app versions let him read on) used to leave only a prep box and no way on. Now the screen shows
// the card until the lesson is whole, then resumes at his stage; a passing failure offers Try
// again, never a partial lesson. A collapsed Predict keeps "What happens" until Play is done.
async function resumeBuilding() {
  current = 'resume-building 360-light';
  console.log('\n' + current);
  const at = '2026-10-04T18:00:00.000Z';
  const building = { status: 'building', updatedAt: new Date().toISOString(), lesson: SMALL.lesson, interactive: null, sourced: true, by: { device: 'd', tab: 'gone', holder: 'd/gone' } };
  const seed = { 'topics/pendulums': TOPIC, [LESSON('i3')]: building,
    [PROGRESS]: { updatedAt: at, lastIdea: 'i3', ideas: { i3: { stage: 'play', startedAt: at, predict: { answer: 'It takes twice as long', at } } } } };
  const app = await open({ width: 360, dark: false, hash: '#/t/pendulums/i3', seed, cfg: { pending: ['i3'] } });
  const { page } = app;
  try {
    await page.locator('.lsn-prep').waitFor();
    ok(/The lesson text is written/.test(await page.locator('.lsn-prep-lines').textContent()), 'the card says the text is already written');
    await page.evaluate(() => window.__T.prep.o.onStatus('Finishing the interactive for this lesson…'));
    await onlyPrep(page, 'reopened mid-build');
    await shot(app, 'resume-building-1');
    // A passing failure: Try again, and still nothing of the lesson.
    await page.evaluate(() => window.__T.prep.rej({ code: 'unavailable', message: 'offline' }));
    await page.locator('.lsn-prep-err').getByRole('button', { name: 'Try again' }).waitFor();
    await onlyPrep(page, 'after a passing failure');
    await shot(app, 'resume-building-2-failed');
    await page.locator('.lsn-prep-err').getByRole('button', { name: 'Try again' }).click();
    await page.waitForFunction(() => window.__T.ensure.filter((e) => e.iid === 'i3').length === 2);
    await app.seed(LESSON('i3'), SMALL);
    await page.evaluate((d) => window.__T.prep.res(d), SMALL);
    // Whole: it resumes where he was (Play), with Predict collapsed above.
    const play = page.locator('.lsn-stage[data-stage="play"]');
    await play.locator('.lsn-selfcheck').waitFor({ timeout: 15000 });
    ok(await page.locator('.lsn-past[data-stage="predict"]').count() === 1 && await page.locator('.lsn-step.is-now').getAttribute('aria-label') === 'Step 2 of 5: Play, current step', 'resumes at Play with Predict collapsed');
    await page.locator('.lsn-past[data-stage="predict"] summary').click();
    await page.locator('.lsn-past[data-stage="predict"] .lsn-reveal-guess').waitFor();
    ok(await page.locator('.lsn-past[data-stage="predict"] .lsn-reveal-answer').count() === 0, 'the collapsed Predict shows his guess but not "What happens" before he has played');
    await shot(app, 'resume-building-3-whole');
    await play.getByRole('button', { name: 'I\'ve had a play' }).click();
    ok(await play.locator('.lsn-reveal-answer').count() === 1, '"What happens" comes after the play, as live');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'resume-building-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: a failure, then Retry ----------
async function retry() {
  current = 'retry 360-dark';
  console.log('\n' + current);
  const i4 = JSON.parse(JSON.stringify(SMALL));
  i4.lesson.iid = 'i4';
  const app = await open({ width: 360, dark: true, hash: '#/t/pendulums/i4', seed: { 'topics/pendulums': TOPIC }, cfg: { failFirst: { iid: 'i4', doc: i4 } } });
  const { page } = app;
  try {
    const again = page.locator('.lsn-prep-err').getByRole('button', { name: 'Try again' });
    await again.waitFor();
    ok((await page.locator('.lsn-prep-err').textContent()).includes('could not be reached'), 'plain-English error');
    ok(await page.locator('.lsn-prep-lines li.is-failed').count() === 1 && await page.locator('.lsn-prep-lines li.is-failed.is-done').count() === 0, 'one failed step, never ticked as well');
    await shot(app, 'retry-1-error');
    await again.click();
    await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor();
    const t = await T(app);
    ok(t.ensure.filter((e) => e.iid === 'i4').length === 2, 'Retry calls ensureLesson again');
    await shot(app, 'retry-2-ready');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: Text size XL on a phone ----------
// Headings grow less than body text, so the predict options still start on the first screen; the
// eyebrow keeps to one line by dropping the topic name; the interactive's text follows the setting.
async function xl() {
  current = 'xl 390-light';
  console.log('\n' + current);
  const app = await open({ width: 390, height: 844, dark: false, size: 'xl', hash: '#/t/pendulums/i1', seed: { 'topics/pendulums': TOPIC, [LESSON('i1')]: PENDULUM } });
  const { page } = app;
  try {
    const pred = page.locator('.lsn-stage[data-stage="predict"]');
    await pred.locator('.option').first().waitFor();
    const eb = await eyebrowOf(page);
    ok(eb.lines === 1 && eb.count && !eb.topic, `eyebrow keeps to one line: the count stays, the topic name drops out whole (${JSON.stringify(eb)})`);
    const sz = await page.evaluate(() => {
      const px = (el) => parseFloat(getComputedStyle(el).fontSize);
      const opts = [...document.querySelectorAll('.lsn-stage[data-stage="predict"] .option')];
      return { body: px(document.body), h2: px(document.querySelector('.lsn-stage[data-stage="predict"] .lsn-h')), h1: px(document.querySelector('.lsn-title')),
        onScreen: opts.filter((o) => o.getBoundingClientRect().bottom <= innerHeight).length };
    });
    ok(sz.body === 20 && sz.h2 > 21.6 && sz.h2 <= 24.5 && sz.h1 <= 30, `headings grow half as fast as the text (body ${sz.body}px, question ${sz.h2}px, title ${sz.h1}px)`);
    ok(sz.onScreen >= 2, `the first answers are on the first screen (${sz.onScreen} of 4)`);
    await noOverflow(app);
    await shot(app, 'xl-1-predict');
    await pred.locator('.option').first().click();
    await page.getByRole('button', { name: 'That\'s my guess' }).click();
    const play = page.locator('.lsn-stage[data-stage="play"]');
    await play.locator('.lsn-selfcheck').waitFor({ timeout: 15000 });
    const inner = await page.frameLocator('.lsn-panel iframe').locator('body').evaluate((b) => ({ body: getComputedStyle(b).fontSize, root: getComputedStyle(document.documentElement).fontSize, size: K.theme.size }));
    ok(inner.size === 20 && inner.body === '20px' && inner.root === '20px', 'the interactive follows Text size XL (' + JSON.stringify(inner) + ')');
    await page.evaluate(() => { const p = document.querySelector('.lsn-stage[data-stage="play"]'); window.scrollTo(0, p.getBoundingClientRect().top + scrollY - 70); });
    await shot(app, 'xl-2-play');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'xl-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: Text size on phones and a laptop ----------
// At every Text size, in one lesson resumed at its checks: the eyebrow keeps the topic name at M
// and L (wrapping it, the count whole) and drops it at XL on a phone only when it cannot fit
// beside the count; Ask Claude's two starters are whole before the first question; a check's
// question follows the lesson's heading scale (--lsn-hrem), one step below its stage heading.
async function textSizes() {
  current = 'text sizes';
  console.log('\n' + current);
  const at = '2026-10-04T18:00:00.000Z';
  const seed = {
    'topics/pendulums': TOPIC, [LESSON('i1')]: PENDULUM,
    [PROGRESS]: { updatedAt: at, lastIdea: 'i1', ideas: { i1: { stage: 'checks', startedAt: at, predict: { answer: 'It takes twice as long', at } } } },
  };
  const titles = ['Tides', 'Why pendulums keep time', 'Why minor keys sound sad', 'Why the Roman Republic fell', 'How the Romans built roads that lasted'];
  const app = await open({ width: 360, height: 707, hash: '#/t/pendulums/i1', seed, reduced: true });
  const { page } = app;
  try {
    await page.locator('.lsn-stage[data-stage="checks"] .qc-q').first().waitFor({ timeout: 15000 });
    for (const [w, h] of [[360, 707], [390, 844], [1366, 768]]) {
      await page.setViewportSize({ width: w, height: h });
      for (const size of ['m', 'l', 'xl']) {
        await page.evaluate((sz) => { document.documentElement.dataset.size = sz; }, size);
        await page.waitForTimeout(200);
        const tag = `${w} ${size}`;
        const dropped = [];
        for (const title of titles) {
          await page.evaluate((t) => { document.querySelector('.lsn-eb-topic').textContent = t; }, title);
          const eb = await eyebrowOf(page);
          if (!eb.count || !eb.whole) ok(false, `${tag}: the eyebrow's count is whole for "${title}" (${JSON.stringify(eb)})`);
          if (w < 700 && size === 'xl') {
            if (eb.lines !== 1) ok(false, `${tag}: at XL on a phone the eyebrow keeps to one line for "${title}" (${JSON.stringify(eb)})`);
            if (!eb.topic) dropped.push(title);
          } else if (!eb.topic) ok(false, `${tag}: the topic name "${title}" stays in the eyebrow (${JSON.stringify(eb)})`);
        }
        if (w < 700 && size === 'xl') ok(!dropped.includes('Tides'), `${tag}: a topic name that fits beside the count stays at XL (dropped: ${dropped.join(', ')})`);
        const q = await page.evaluate(() => {
          const px = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
          return { root: px('html'), stage: px('.lsn-stage[data-stage="checks"] .lsn-h'), q: px('.lsn-stage[data-stage="checks"] .qc-q') };
        });
        const hrem = q.root / 2 + 8;
        ok(Math.abs(q.stage - 1.35 * hrem) < 0.1 && Math.abs(q.q - 1.2 * hrem) < 0.1 && q.q < q.stage,
          `${tag}: the check question follows the heading scale below "Quick checks" (question ${q.q}px, heading ${q.stage}px, predict ${(1.35 * hrem).toFixed(2)}px)`);
        await page.locator('.lsn-ask').click();
        await page.locator('.tutor-sheet').waitFor();
        await page.waitForTimeout(350);
        const t = await tutorState(page);
        ok(t.empty && t.chips === 'Explain it differently|Give me an example' && t.whole, `${tag}: empty Ask Claude shows both starters whole (${JSON.stringify(t)})`);
        if (w === 360 && size === 'xl') await shot(app, 'sizes-360-xl-tutor');
        await page.keyboard.press('Escape');
        await page.locator('.tutor-sheet').waitFor({ state: 'detached' });
      }
    }
    await noOverflow(app);
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'sizes-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: Ask Claude's chips with the keyboard up, on a phone and on a laptop ----------
// With the keyboard up on a phone (the input focused in a 360 x 400 viewport, at XL), the two
// starters go back on one sideways row so the welcome above them stays whole; with it down they
// wrap, both whole. Under a conversation every chip is whole on a laptop at every Text size (they
// wrap); on a phone the sideways row fades at the edge it runs on past, until scrolled to its end,
// and so it does with Laptop pinned on a phone, whose dialog is phone-wide (keyboard up and down).
async function tutorChips() {
  current = 'tutor chips';
  console.log('\n' + current);
  const app = await open({ width: 360, height: 707, size: 'xl', hash: '#/t/pendulums/i1', seed: { 'topics/pendulums': TOPIC, [LESSON('i1')]: PENDULUM }, reduced: true });
  const { page } = app;
  const view = async (w, h, size) => {
    await page.setViewportSize({ width: w, height: h });
    if (size) await page.evaluate((sz) => { document.documentElement.dataset.size = sz; }, size);
    await page.waitForTimeout(350);
    return tutorState(page);
  };
  try {
    await page.locator('.lsn-ask').waitFor({ timeout: 15000 });
    await page.locator('.lsn-ask').click();
    await page.locator('.tutor-sheet').waitFor();
    let t = await view(360, 707);
    ok(t.empty && !t.cramped && t.rows === 2 && t.whole && t.headWhole, `360x707 XL, keyboard down: both starters whole on two rows, the welcome above them (${JSON.stringify(t)})`);
    await page.locator('.tutor-input').focus();
    t = await view(360, 707);
    ok(!t.cramped && t.rows === 2 && t.whole, `360x707 XL, input focused with room to spare: the starters stay wrapped and whole (${JSON.stringify(t)})`);
    t = await view(360, 400);   // the keyboard comes up
    ok(t.cramped && t.rows === 1 && t.headWhole && t.scrolls && t.fade === 'more-right' && t.mask,
      `360x400 XL, keyboard up: the starters go on one sideways row that fades at its edge, and the welcome heading stays whole (${JSON.stringify(t)})`);
    await shot(app, 'tutor-360x400-xl-keyboard');
    await page.locator('.tutor-input').blur();   // and goes down
    t = await view(360, 707);
    ok(!t.cramped && t.rows === 2 && t.whole && !t.fade && !t.mask, `360x707 XL, keyboard down again: both starters whole on two rows, no fade (${JSON.stringify(t)})`);

    await page.locator('.tutor-input').fill('Why the square root?');
    await page.locator('.tutor-input').press('Enter');
    await page.waitForFunction(() => /swing takes about/.test(document.querySelector('.tutor-log').textContent));
    await page.waitForTimeout(300);
    for (const [w, h] of [[1366, 768], [960, 768]]) {
      for (const size of ['m', 'l', 'xl']) {
        t = await view(w, h, size);
        ok(!t.empty && t.chips.split('|').length === 3 && t.whole && !t.scrolls && !t.fade, `${w}x${h} ${size}: under a conversation all three chips are whole in the dialog (${JSON.stringify(t)})`);
        if (size === 'xl') await shot(app, `tutor-${w}-xl-chips`);
      }
    }
    for (const [w, h] of [[360, 707], [390, 844]]) {
      for (const size of ['m', 'xl']) {
        t = await view(w, h, size);
        ok(t.rows === 1 && t.scrolls && t.fade === 'more-right' && t.mask, `${w}x${h} ${size}: the chips run on one sideways row that fades at the edge they run past (${JSON.stringify(t)})`);
      }
    }
    await shot(app, 'tutor-390-xl-chips');
    await page.locator('.tutor-chips').evaluate((el) => { el.scrollLeft = el.scrollWidth; });
    await page.waitForTimeout(200);
    t = await tutorState(page);
    ok(t.fade === 'more-left' && t.mask, `scrolled to its end, the row fades only at the left edge (${JSON.stringify(t)})`);

    // Laptop pinned on a phone: the dialog is phone-wide, so the chips keep the sideways row as on
    // the phone layout (wrapped there they took three rows and, with the keyboard up, nearly all
    // the room the conversation had).
    await page.locator('.tutor-chips').evaluate((el) => { el.scrollLeft = 0; });
    for (const [w, h, size] of [[390, 844, 'm'], [360, 707, 'xl'], [390, 844, 'xl']]) {
      await page.evaluate(() => U.layout.set('auto'));
      const phoneDock = (await view(w, h, size)).dockH;
      await page.evaluate(() => U.layout.set('laptop'));
      t = await view(w, h, size);
      ok(t.layout === 'laptop' && t.rows === 1 && t.scrolls && t.fade === 'more-right' && t.mask && t.dockH <= phoneDock + 2,
        `Laptop pinned at ${w}x${h} ${size}: the chips run on one sideways row that fades at its edge, the dock no taller than on the phone layout (${phoneDock}px) (${JSON.stringify(t)})`);
      if (w === 390 && size === 'm') await shot(app, 'tutor-pinned-laptop-390-m-chips');
    }
    await page.locator('.tutor-input').focus();
    t = await view(360, 400, 'xl');   // the keyboard comes up
    ok(t.layout === 'laptop' && t.cramped && t.rows === 1 && t.msgArea >= 120,
      `Laptop pinned at 360x400 XL, keyboard up: the chips stay on one row, leaving room for the conversation (${JSON.stringify(t)})`);
    await shot(app, 'tutor-pinned-laptop-360x400-xl-keyboard');
    await page.locator('.tutor-input').blur();
    await page.evaluate(() => U.layout.set('auto'));
    await page.evaluate(() => { document.documentElement.dataset.size = 'm'; });
    await noOverflow(app);
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'tutor-chips-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: resume mid-lesson ----------
async function resume(width, dark) {
  const tag = `${width}-${dark ? 'dark' : 'light'}`;
  current = 'resume ' + tag;
  console.log('\n' + current);
  const at = '2026-10-04T18:00:00.000Z';
  const seed = {
    'topics/pendulums': TOPIC, [LESSON('i1')]: PENDULUM,
    [PROGRESS]: { updatedAt: at, lastIdea: 'i1', ideas: { i1: { stage: 'say', startedAt: at, predict: { answer: 'It takes twice as long', at } } } },
  };
  const app = await open({ width, dark, hash: '#/t/pendulums/i1', seed, reduced: true });
  const { page } = app;
  try {
    await page.locator('.lsn-stage[data-stage="say"] textarea').waitFor();
    ok(await page.locator('.lsn-past').count() === 3, 'predict, play and explain collapsed');
    ok((await page.locator('.lsn-past[data-stage="predict"] .lsn-past-sum').textContent()).includes('twice as long'), 'collapsed predict shows his guess');
    ok(await page.locator('iframe').count() === 0, 'collapsed play does not load the interactive');
    ok(await page.locator('.lsn-step.is-done').count() === 3 && await page.locator('.lsn-step.is-now').count() === 1, 'progress bar resumes at step 4');
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(app, `resume-${tag}-1`);
    await page.locator('.lsn-past[data-stage="play"] summary').click();
    await page.locator('.lsn-past[data-stage="play"] .lsn-selfcheck').waitFor({ timeout: 15000 });
    ok(await page.locator('.lsn-past[data-stage="play"] .lsn-reveal').count() === 1, 'reopened play shows the reveal');
    await shot(app, `resume-${tag}-2-reopened`);
    // the progress bar jumps to a stage
    await page.locator('.lsn-step').nth(3).click();
    await page.waitForTimeout(300);
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: no interactive, contested, not source-checked ----------
async function plain(width, dark) {
  const tag = `${width}-${dark ? 'dark' : 'light'}`;
  current = 'no-interactive ' + tag;
  console.log('\n' + current);
  const seed = { 'topics/pendulums': TOPIC, [LESSON('i5')]: CLOCKS };
  const cfg = { gradeReplies: [{ met: [true, true], verdict: 'got-it', nailed: 'Clear and complete: steady beat, and the clock counts it.', followUp: '' }] };
  const app = await open({ width, dark, hash: '#/t/pendulums/i5', seed, cfg, reduced: width > 700 });
  const { page } = app;
  try {
    const input = page.locator('.lsn-stage[data-stage="predict"] input');
    await input.waitFor();
    await shot(app, `plain-${tag}-1-predict`);
    await input.fill('Galileo');
    await input.press('Enter');
    const play = page.locator('.lsn-stage[data-stage="play"]');
    await play.locator('.lsn-none').waitFor();
    ok(await play.locator('iframe').count() === 0, 'no iframe without an interactive');
    ok((await play.locator('.lsn-reveal-guess').textContent()).includes('Galileo'), 'reveal shows straight away next to his guess');
    await shot(app, `plain-${tag}-2-play`);
    await play.getByRole('button', { name: 'Continue' }).click();
    const ex = page.locator('.lsn-stage[data-stage="explain"]');
    await ex.waitFor();
    ok((await ex.locator('.lsn-flag').textContent()) === 'Experts disagree', 'red "Experts disagree" label');
    ok(await ex.locator('.lsn-view').count() === 2, 'both views side by side');
    ok((await ex.locator('.lsn-quiet').textContent()).includes('Not yet source-checked'), 'quiet not-source-checked note');
    await shot(app, `plain-${tag}-3-explain`);
    await ex.getByRole('button', { name: 'Continue' }).click();
    const say = page.locator('.lsn-stage[data-stage="say"]');
    await say.locator('textarea').fill('The pendulum keeps a steady beat and the clock counts the swings.');
    await say.locator('textarea').press('Control+Enter');
    await say.locator('.lsn-grade').waitFor();
    ok(await say.locator('.lsn-grade .lsn-met li').count() === 2, 'two green ticks when both points are met');
    ok(await say.locator('details.lsn-disc', { hasText: 'Compare with a model answer' }).count() === 1, 'got it first time: model answer tucked away');
    await shot(app, `plain-${tag}-4-say`);
    await say.getByRole('button', { name: 'Continue' }).click();
    const checks = page.locator('.lsn-stage[data-stage="checks"]');
    await checks.waitFor();
    ok((await checks.locator('.lsn-lede').textContent()).startsWith('One quick question'), 'target check skipped without an interactive');
    await answerCheck(app, CLOCKS.lesson.checks[0]);
    await continueCheck(app);
    await page.locator('.lsn-done').waitFor();
    await page.waitForTimeout(300);
    const t = await T(app);
    ok(t.add.length === 1 && Object.keys(t.add[0].outcome.checks).join() === 'c1', 'outcome has only the usable check');
    await shot(app, `plain-${tag}-5-done`);
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, `plain-${tag}-error`).catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}


// ---------- scenario: two devices on one idea (stages only move forward; nothing overwritten) ----------
async function twoDevices() {
  current = 'two-devices 360-light';
  console.log('\n' + current);
  const app = await open({ width: 360, dark: false, hash: '#/t/pendulums/i5', seed: { 'topics/pendulums': TOPIC, [LESSON('i5')]: CLOCKS }, reduced: true });
  const { page } = app;
  try {
    const input = page.locator('.lsn-stage[data-stage="predict"] input');
    await input.waitFor();
    await page.waitForTimeout(400);
    // The phone finishes the idea while this screen still shows Predict (its say list in the old array shape).
    const at = new Date().toISOString();
    await app.seed(PROGRESS, { updatedAt: at, lastIdea: 'i5', ideas: { i5: { stage: 'done', startedAt: at, doneAt: at, predict: { answer: 'Huygens', at },
      say: [{ text: 'PHONE: the swing keeps the beat', at, verdict: 'got-it', met: [true, true] }], checks: { c1: { correct: true, at } } } } });
    await page.waitForTimeout(400);
    await input.fill('Galileo');
    await input.press('Enter');
    await page.waitForTimeout(700);
    let pr = await doc(app, PROGRESS);
    ok(pr.ideas.i5.stage === 'done' && pr.ideas.i5.doneAt === at, 'a stale screen never moves a finished idea back (stage ' + pr.ideas.i5.stage + ')');
    ok(pr.ideas.i5.predict.answer === 'Huygens', 'the guess saved first (on the phone) is kept');
    // Go through it again: a separate record; the originals stay.
    await page.evaluate(() => U.go(location.hash));
    await page.locator('.lsn-done').waitFor();
    await page.locator('.lsn-again button').click();
    await page.locator('.lsn-stage[data-stage="predict"] input').fill('Newton');
    await page.locator('.lsn-stage[data-stage="predict"] input').press('Enter');
    await page.locator('.lsn-stage[data-stage="play"]').getByRole('button', { name: 'Continue' }).click();
    await page.locator('.lsn-stage[data-stage="explain"]').getByRole('button', { name: 'Continue' }).click();
    await page.locator('.lsn-stage[data-stage="say"] .lsn-after').getByRole('button', { name: 'Continue' }).click();
    await answerCheck(app, CLOCKS.lesson.checks[0], false);
    await continueCheck(app);
    await page.locator('.lsn-done').waitFor();
    await page.waitForTimeout(500);
    pr = await doc(app, PROGRESS);
    const t = await T(app);
    const rp = vals(pr.ideas.i5.replays);
    ok(pr.ideas.i5.predict.answer === 'Huygens' && pr.ideas.i5.checks.c1.correct === true, 'replay keeps the first guess and check results');
    ok(rp.length === 1 && rp[0].predict.answer === 'Newton' && rp[0].checks.c1.correct === false, 'the replay is recorded separately');
    ok(t.add.length === 0, 'replay does not remake review cards (learnedAt kept)');
    ok(vals(pr.ideas.i5.say).some((x) => /^PHONE/.test(x.text)), 'the phone\'s explanation is kept');
    await shot(app, 'two-devices-replay-done');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'two-devices-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: Learn it again, and Rebuild from "This looks wrong" ----------
async function relearnScenario() {
  current = 'relearn 360-light';
  console.log('\n' + current);
  const at = '2026-09-01T10:00:00.000Z';
  const seed = { 'topics/pendulums': TOPIC, [LESSON('i5')]: CLOCKS,
    [PROGRESS]: { updatedAt: at, lastIdea: 'i5', ideas: { i5: { stage: 'done', startedAt: at, doneAt: at, predict: { answer: 'Galileo', at },
      say: { k1: { text: 'old words', at, verdict: 'got-it', met: [true, true] } }, checks: { c1: { correct: false, at } }, relearn: true } } } };
  const app = await open({ width: 360, dark: false, hash: '#/t/pendulums/i5/again', seed, cfg: { relearnDoc: CLOCKS } });
  const { page } = app;
  try {
    await page.locator('.lsn-prep').waitFor();
    ok(/fresh lesson/i.test(await page.locator('.lsn-prep').textContent()), 'says a fresh lesson is being written');
    await shot(app, 'relearn-1-writing');
    await page.locator('.lsn-stage[data-stage="predict"] input').waitFor();
    ok(/take 1/.test(await page.locator('.lsn-stage[data-stage="predict"] .lsn-h').textContent()), 'the fresh lesson is the one shown');
    const seen1 = (await T(app)).relearnSeen;
    ok(seen1.length === 2 && seen1.every((x) => x.prep && x.stages === 0 && !/Galileo|pendulum clock/.test(x.text)), 'while the new lesson is written and while its interactive is built, only the card shows (never the old lesson, never the half-made new one): ' + JSON.stringify(seen1.map((x) => [x.step, x.prep, x.stages])));
    ok(await page.evaluate(() => location.hash) === '#/t/pendulums/i5', 'the address drops /again (a reload does not rebuild it again)');
    let pr = await doc(app, PROGRESS);
    const i5 = pr.ideas.i5;
    ok(i5.round === 1 && i5.stage === 'predict' && !i5.checks && !i5.doneAt && !i5.predict && i5.relearn === false, 'a new round: stage, guess and check results reset, flag cleared');
    ok(i5.past && i5.past[0] && i5.past[0].checks.c1.correct === false && i5.past[0].predict.answer === 'Galileo', 'the first round is kept under past');
    ok(vals(i5.say).length === 1, 'his earlier explanation stays (for the Book)');
    // Through the fresh lesson: Say it back asks again (the old answer was for the old lesson).
    await page.locator('.lsn-stage[data-stage="predict"] input').fill('Huygens');
    await page.locator('.lsn-stage[data-stage="predict"] input').press('Enter');
    await page.locator('.lsn-stage[data-stage="play"]').getByRole('button', { name: 'Continue' }).click();
    await page.locator('.lsn-stage[data-stage="explain"]').getByRole('button', { name: 'Continue' }).click();
    ok(await page.locator('.lsn-stage[data-stage="say"] textarea').isVisible(), 'say it back asks again in the new round');
    await page.locator('.lsn-stage[data-stage="say"] textarea').fill('The pendulum keeps a steady beat and the clock counts it.');
    await page.locator('.lsn-stage[data-stage="say"]').getByRole('button', { name: 'Check my answer' }).click();
    await page.locator('.lsn-stage[data-stage="say"] .lsn-grade').waitFor();
    await page.locator('.lsn-stage[data-stage="say"]').getByRole('button', { name: /Show me a model answer|Continue/ }).first().click();
    const cont = page.locator('.lsn-stage[data-stage="say"] .lsn-after').getByRole('button', { name: 'Continue' });
    if (await cont.count()) await cont.click();
    await answerCheck(app, CLOCKS.lesson.checks[0], true);
    await continueCheck(app);
    await page.locator('.lsn-done').waitFor();
    await page.waitForTimeout(500);
    const t = await T(app);
    pr = await doc(app, PROGRESS);
    ok(t.add.length === 1 && t.add[0].outcome.checks.c1.correct === true, 'finishing the new round makes its review cards (from the new answers)');
    ok(pr.ideas.i5.stage === 'done' && pr.ideas.i5.doneAt && pr.ideas.i5.round === 1, 'the new round is done');
    // "This looks wrong" -> Rebuild this lesson, with the note.
    await page.locator('.lsn-flag-link').click();
    await page.locator('.sheet textarea').fill('The date in the reveal looks wrong.');
    await shot(app, 'relearn-2-flag-sheet');
    await page.locator('.sheet .btn', { hasText: 'Rebuild this lesson' }).click();
    await page.locator('.lsn-prep').waitFor();
    ok(await page.locator('.lsn-stage, .lsn-past, .lsn-done').count() === 0 && !(await page.locator('.lsn-foot').isVisible()), 'Rebuild takes the old lesson off the screen at once: only the card');
    await page.locator('.lsn-stage[data-stage="predict"] input').waitFor();
    ok(/take 2/.test(await page.locator('.lsn-stage[data-stage="predict"] .lsn-h').textContent()), 'then the rebuilt lesson, whole');
    const t2 = await T(app);
    ok(t2.relearn.length === 2 && t2.relearn[1].feedback === 'The date in the reveal looks wrong.', 'Rebuild passes his note to U.gen.relearn');
    ok(await page.locator('.lsn-flag-kept').textContent() === '', 'a rebuild shows no "note kept" line');
    pr = await doc(app, PROGRESS);
    ok(pr.ideas.i5.round === 2 && pr.ideas.i5.stage === 'predict', 'rebuilding starts another round');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'relearn-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: the finished screen says whether the next idea is ready ----------
async function nextStatus(width, height, dark) {
  const tag = `${width}-${dark ? 'dark' : 'light'}`;
  current = 'next-status ' + tag;
  console.log('\n' + current);
  const at = '2026-10-04T18:00:00.000Z';
  const seed = { 'topics/pendulums': TOPIC, [LESSON('i1')]: PENDULUM,
    [PROGRESS]: { updatedAt: at, lastIdea: 'i1', ideas: { i1: { stage: 'done', startedAt: at, doneAt: at, predict: { answer: 'x', at }, checks: { c1: { correct: true, at } } } } } };
  const app = await open({ width, height, dark, hash: '#/t/pendulums/i1', seed, reduced: true });
  const { page } = app;
  const status = () => page.locator('.lsn-next-status').textContent();
  try {
    await page.locator('.lsn-done .lsn-next').waitFor();
    await page.waitForTimeout(300);
    ok(await status() === '', 'nothing is said while no lesson exists for the next idea');
    const t = await T(app);
    ok(t.ensure.some((e) => e.iid === 'i2' && e.background), 'the next idea is prepared in the background');
    await app.seed(LESSON('i2'), { status: 'writing', updatedAt: new Date().toISOString(), lesson: null, interactive: null });
    await page.waitForFunction(() => /Idea 2 is being prepared…/.test(document.querySelector('.lsn-next-status').textContent));
    await app.seed(LESSON('i2'), { status: 'building', updatedAt: new Date().toISOString(), lesson: SMALL.lesson, interactive: null });
    await page.waitForTimeout(300);
    ok(await status() === 'Idea 2 is being prepared…', 'still being prepared while its interactive is built: ' + await status());
    await page.evaluate(() => document.querySelector('.lsn-next').scrollIntoView({ block: 'center' }));
    await shot(app, `next-${tag}-1-preparing`);
    const i2 = JSON.parse(JSON.stringify(SMALL)); i2.lesson.iid = 'i2';
    await app.seed(LESSON('i2'), i2);
    await page.waitForFunction(() => /Idea 2 is ready\./.test(document.querySelector('.lsn-next-status').textContent));
    await page.evaluate(() => document.querySelector('.lsn-next').scrollIntoView({ block: 'center' }));
    await shot(app, `next-${tag}-2-ready`);
    await noOverflow(app);
    // A doc whose job went silent long ago is not "being prepared" (opening it prepares it).
    await app.seed(LESSON('i2'), { status: 'building', updatedAt: '2026-01-01T00:00:00.000Z', lesson: SMALL.lesson, interactive: null });
    await page.waitForFunction(() => document.querySelector('.lsn-next-status').textContent === '');
    // This page's own job (U.gen.status) counts at once, before its doc is written.
    await page.evaluate(() => { U.gen.status = () => ({ lessons: { i2: 'writing' } }); U.emit('gen', { tid: 'pendulums', iid: 'i2', kind: 'lesson', status: 'writing', text: '' }); });
    await page.waitForFunction(() => /Idea 2 is being prepared…/.test(document.querySelector('.lsn-next-status').textContent));
    ok(true, 'this page\'s own work on the next idea counts as being prepared');
    if (width < 700 && !dark) {
      // Go through it again: Predict asks again, so the one line hides until he skips it.
      await page.getByRole('button', { name: 'Go through it again' }).click();
      await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor();
      ok(!(await page.locator('.lsn-one').isVisible()), 'going through it again: the one line hides while Predict asks');
      await page.locator('.lsn-stage[data-stage="predict"]').getByRole('button', { name: 'Skip' }).click();
      await page.locator('.lsn-stage[data-stage="play"]').waitFor();
      ok(await page.locator('.lsn-one').isVisible(), 'and shows once he skips the guess');
    }
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, `next-${tag}-error`).catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: "This looks wrong" during a bridge outage ----------
// The save fails: the sheet stays open with his words, says so once (no toast on top), and the
// note saves when he tries again.
async function flagOutage() {
  current = 'flag-outage 360-light';
  console.log('\n' + current);
  const at = new Date().toISOString();
  const seed = { 'topics/pendulums': TOPIC, [LESSON('i1')]: PENDULUM, [PROGRESS]: { updatedAt: at, lastIdea: 'i1', ideas: { i1: { stage: 'explain', startedAt: at, predict: { answer: 'x', at } } } } };
  const app = await open({ width: 360, dark: false, hash: '#/t/pendulums/i1', seed, reduced: true });
  const { page } = app;
  try {
    await page.locator('.lsn-stage[data-stage="explain"]').waitFor();
    await page.evaluate(() => {
      window.__down = true;
      const real = U.rt.db;
      const down = (ref, p) => (/\/lessons\//.test(p) ? Object.assign({}, ref, { update: (...a) => (window.__down ? Promise.reject({ code: 'unavailable', message: 'The bridge is down.' }) : ref.update(...a)) }) : ref);
      U.rt.db = Object.assign({}, real, { doc: (p) => down(real.doc(p), p) });
    });
    await page.locator('.lsn-flag-link').click();
    const note = 'The analogy says the opposite of the interactive.';
    await page.locator('.sheet textarea').fill(note);
    await page.locator('.sheet .btn', { hasText: 'Keep my note' }).click();
    await page.locator('.sheet .lsn-flag-err .notice').waitFor({ timeout: 8000 });
    await page.waitForTimeout(400);
    ok(await page.locator('.sheet').count() === 1 && await page.locator('.sheet textarea').inputValue() === note, 'the sheet stays open with his words');
    ok(/Your note is not saved yet\./.test(await page.locator('.sheet .lsn-flag-err').textContent()), 'it says so in the sheet: ' + await page.locator('.sheet .lsn-flag-err').textContent());
    ok(await page.locator('#toasts .toast').count() === 0, 'and only there: no toasts (' + await page.locator('#toasts').textContent() + ')');
    ok(await page.locator('.sheet .btn', { hasText: 'Keep my note' }).isEnabled(), 'he can try again');
    await shot(app, 'flag-outage-1');
    await page.evaluate(() => { window.__down = false; });
    await page.locator('.sheet .btn', { hasText: 'Keep my note' }).click();
    await page.locator('.sheet').waitFor({ state: 'detached' });
    ok(/kept with this lesson/.test(await page.locator('.lsn-flag-kept').textContent()), 'saved on the second go, with thanks under the link');
    const d = await doc(app, LESSON('i1'));
    const flags = vals(d.flags);
    ok(flags.length === 1 && flags[0].note === note, 'saved once: ' + JSON.stringify(flags.map((f) => f.note)));
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'flag-outage-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: leaving while an answer is being graded still saves it ----------
async function leaveWhileGrading() {
  current = 'leave-while-grading 360-light';
  console.log('\n' + current);
  const at = new Date().toISOString();
  const seed = { 'topics/pendulums': TOPIC, [LESSON('i5')]: CLOCKS,
    [PROGRESS]: { updatedAt: at, lastIdea: 'i5', ideas: { i5: { stage: 'say', startedAt: at, predict: { answer: 'x', at } } } } };
  const app = await open({ width: 360, dark: false, hash: '#/t/pendulums/i5', seed, cfg: { gradeMs: 1200 } });
  const { page } = app;
  try {
    await page.locator('.lsn-stage[data-stage="say"] textarea').fill('A swinging weight keeps time.');
    await page.locator('.lsn-stage[data-stage="say"]').getByRole('button', { name: 'Check my answer' }).click();
    await page.waitForTimeout(200);
    await page.evaluate(() => { location.hash = '#/t/pendulums/i1'; });
    await page.waitForTimeout(1800);
    const pr = await doc(app, PROGRESS);
    const says = vals(pr.ideas.i5.say);
    ok(says.length === 1 && /swinging weight/.test(says[0].text) && says[0].verdict, 'the graded answer is saved although he left the lesson');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: the complete app, real modules, only the model stubbed ----------
async function fullApp() {
  current = 'full-app 360-light';
  console.log('\n' + current);
  const FULL = join(OUT, 'lesson-full.html');
  const b = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FULL], { stdio: 'inherit' });
  if (b.status !== 0) { ok(false, 'full build failed'); return; }
  const tasks = [];
  const app = await openApp({
    width: 360, height: 707, file: FULL,
    config: { db: { 'topics/pendulums': TOPIC, [LESSON('i1')]: PENDULUM } },
    sample: (input) => {
      const t = taskOf(input);
      tasks.push(t);
      if (t === 'grade') return { met: [true, false, false], verdict: 'partly', nailed: 'You have the main point.', followUp: 'How much slower is it?' };
      if (t === 'tutor') return 'Because the bob has further to go while gravity pulls just as hard.';
      return new Promise(() => {}); // background lesson writing for the next idea stays pending
    },
  });
  const { page } = app;
  try {
    await page.goto(app.url('#/t/pendulums/i1'));
    await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor({ timeout: 15000 });
    await page.locator('.option').nth(1).click();
    await page.getByRole('button', { name: 'That\'s my guess' }).click();
    await page.locator('.lsn-selfcheck').waitFor({ timeout: 15000 });
    await page.locator('.lsn-ask').click();
    await page.locator('.tutor-input').fill('Why does length matter?');
    await page.locator('.tutor-input').press('Enter');
    await page.waitForFunction(() => /gravity pulls/.test(document.querySelector('.tutor-log').textContent), null, { timeout: 15000 });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'I\'ve had a play' }).click();
    await page.locator('.lsn-stage[data-stage="play"]').getByRole('button', { name: 'Continue' }).click();
    await page.locator('.lsn-stage[data-stage="explain"]').getByRole('button', { name: 'Continue' }).click();
    await page.locator('.lsn-stage[data-stage="say"] textarea').fill('A longer string swings more slowly.');
    await page.getByRole('button', { name: 'Check my answer' }).click();
    await page.locator('.lsn-grade').waitFor({ timeout: 15000 });
    await page.getByRole('button', { name: 'Show me a model answer' }).click();
    await page.locator('.lsn-stage[data-stage="say"]').getByRole('button', { name: 'Continue' }).click();
    for (const c of PENDULUM.lesson.checks) { await answerCheck(app, c); await continueCheck(app); }
    await page.locator('.lsn-done').waitFor();
    await page.waitForTimeout(1500);
    const dump = await app.stub();
    const cards = dump[`data/users/${UID}/profile/cards/pendulums`];
    const types = cards ? Object.values(cards.cards).map((c) => c.type).sort().join(',') : '';
    ok(types === 'choice,estimate,order,recall', `real review module made cards from the lesson (${types})`);
    const pr = dump[PROGRESS];
    ok(pr && pr.ideas.i1.stage === 'done' && vals(pr.ideas.i1.say).length === 1 && vals(pr.questions).length === 1, 'progress saved through the real store');
    ok(tasks.includes('grade') && tasks.includes('tutor') && tasks.includes('write-lesson'), `grade, tutor and the next-idea prefetch reach the model (${[...new Set(tasks)].join(', ')})`);
    await shot(app, 'full-app-done');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'full-app-error').catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

// ---------- scenario: the real generator gives up on a lesson that never passes its checks ----------
// Every write-lesson reply breaks the lesson's structure (one check, not 2-3). The real U.gen
// repairs once, writes it again from scratch (with its own repair), then fails. The prep box
// says so in one honest line per step: the step that failed has only a red cross, aligned
// with the ticks, and the error never blames a "shape".
let fullBuilt = false;
async function failedLesson(width, height, dark) {
  current = `failed-lesson ${width}-${dark ? 'dark' : 'light'}`;
  console.log('\n' + current);
  const FULL = join(OUT, 'lesson-failed.html');
  if (!fullBuilt) {
    const b = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--out', FULL], { stdio: 'inherit' });
    if (b.status !== 0) { ok(false, 'full build failed'); return; }
    fullBuilt = true;
  }
  const tasks = [];
  const broken = JSON.parse(JSON.stringify(PENDULUM.lesson));
  broken.iid = 'i1';
  broken.checks = broken.checks.slice(0, 1);
  const app = await openApp({
    width, height, dark, file: FULL,
    config: { db: { 'topics/pendulums': TOPIC, [`data/users/${UID}/profile`]: { prefs: { theme: dark ? 'dark' : 'light', size: 'm', easy: false, cap: 15, light: false }, days: {} } } },
    sample: async (input) => {
      const t = taskOf(input);
      tasks.push(t);
      await new Promise((r) => setTimeout(r, 300));
      if (t === 'write-lesson') return broken;
      return new Promise(() => {});
    },
  });
  const { page } = app;
  const tag = `${width}-${dark ? 'dark' : 'light'}`;
  try {
    await page.goto(app.url('#/t/pendulums/i1'));
    await page.locator('.lsn-prep').waitFor({ timeout: 15000 });
    await page.waitForFunction((d) => document.documentElement.dataset.muTheme === (d ? 'dark' : 'light'), dark);
    ok(await page.locator('.lsn-steps-label').textContent() === 'Getting ready', 'while preparing, the bar says so (no step is current, and no second "of N")');
    ok(await page.locator('.lsn-step').first().getAttribute('aria-label') === 'Step 1 of 5: Predict' && await page.locator('.lsn-step[aria-current]').count() === 0, 'screen readers hear the steps, none of them current yet');
    ok(await page.locator('.lsn-stage').count() === 0, 'nothing of the lesson while it is being written');
    ok((await page.locator('.lsn-eb').textContent()).includes('Idea 1 of 5'), 'the eyebrow keeps its count');
    await page.waitForFunction(() => /Having another go/.test(document.querySelector('.lsn-prep-lines').textContent) || !document.querySelector('.lsn-prep-err').hidden, null, { timeout: 20000 });
    ok(/Having another go/.test(await page.locator('.lsn-prep-lines').textContent()), 'says it is having another go while it writes the lesson again');
    await shot(app, `failed-${tag}-1-again`);
    await page.locator('.lsn-prep-err').waitFor({ timeout: 20000 });
    const lines = await page.$$eval('.lsn-prep-lines li', (els) => els.map((li) => {
      const vis = (sel) => { const e = li.querySelector(sel); return !!e && getComputedStyle(e).display !== 'none'; };
      const box = (sel) => { const e = li.querySelector(sel); if (!e || getComputedStyle(e).display === 'none') return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      const t = li.querySelector('.lsn-prep-text').getBoundingClientRect();
      return { text: li.textContent.trim(), done: li.classList.contains('is-done'), failed: li.classList.contains('is-failed'), tick: vis('.lsn-prep-ok'), cross: vis('.lsn-prep-x'), dot: vis('.lsn-prep-mark i'), mark: box('.lsn-prep-ok') || box('.lsn-prep-x'), textTop: t.top };
    }));
    const texts = lines.map((l) => l.text.replace(/…$/, ''));
    ok(new Set(texts).size === texts.length, 'no duplicate step lines: ' + JSON.stringify(texts));
    ok(lines.every((l) => !(l.done && l.failed)), 'no line is both done and failed');
    const failed = lines.filter((l) => l.failed);
    ok(failed.length === 1 && failed[0].cross && !failed[0].tick && !failed[0].dot, 'the failed step shows only a red cross: ' + JSON.stringify(failed));
    ok(failed.length === 1 && /^Having another go at writing this lesson/.test(failed[0].text), 'the step that failed is the fresh go at writing: ' + JSON.stringify(failed[0] && failed[0].text));
    ok(texts.filter((t) => /writing this lesson|Writing your lesson/.test(t)).length === 1, 'the fresh go replaces "Writing your lesson" in one line');
    const done = lines.filter((l) => l.done);
    ok(done.length >= 1 && done.every((l) => l.tick && !l.cross), 'earlier steps keep their ticks');
    if (failed.length === 1 && done.length && failed[0].mark && done[0].mark) {
      ok(Math.abs(failed[0].mark.x - done[0].mark.x) <= 1, `the cross sits in the ticks' column (${failed[0].mark.x} vs ${done[0].mark.x})`);
      ok(failed[0].mark.y - failed[0].textTop < 16, 'the cross is level with the first line of its text');
    }
    const err = await page.locator('.lsn-prep-err').textContent();
    ok(err.includes('Claude\'s lesson did not pass the app\'s own checks, so it was not saved. Try again; it usually works.'), 'plain error: ' + err);
    ok(!/shape/i.test(err), 'the error never blames a "shape"');
    ok(tasks.filter((t) => t === 'write-lesson').length === 4, 'one repair, then one fresh write with its own repair (' + tasks.join(', ') + ')');
    await noOverflow(app);
    await shot(app, `failed-${tag}-2-failed`);
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, `failed-${tag}-error`).catch(() => {});
  }
  ok(app.errors.length === 0, 'no page errors' + (app.errors.length ? ': ' + app.errors.join(' | ') : ''));
  await app.close();
}

const scenarios = [
  ['walk-360-light', () => walk(360, false)],
  ['walk-360-dark', () => walk(360, true)],
  ['walk-1280-light', () => walk(1280, false)],
  ['walk-1280-dark', () => walk(1280, true)],
  ['preparing', preparing],
  ['prepared-elsewhere-390-dark', () => preparedElsewhere(390, true)],
  ['prepared-elsewhere-1366-light', () => preparedElsewhere(1366, false)],
  ['resume-building', resumeBuilding],
  ['next-status-360-light', () => nextStatus(360, 707, false)],
  ['next-status-960-dark', () => nextStatus(960, 860, true)],
  ['flag-outage', flagOutage],
  ['retry', retry],
  ['xl-390', xl],
  ['text-sizes', textSizes],
  ['tutor-chips', tutorChips],
  ['resume-360-light', () => resume(360, false)],
  ['resume-1280-dark', () => resume(1280, true)],
  ['plain-360-dark', () => plain(360, true)],
  ['plain-1280-light', () => plain(1280, false)],
  ['two-devices', twoDevices],
  ['relearn', relearnScenario],
  ['leave-while-grading', leaveWhileGrading],
  ['full-app', fullApp],
  ['failed-lesson-360-light', () => failedLesson(360, 707, false)],
  ['failed-lesson-360-dark', () => failedLesson(360, 707, true)],
  ['failed-lesson-390-light', () => failedLesson(390, 844, false)],
  ['failed-lesson-390-dark', () => failedLesson(390, 844, true)],
  ['failed-lesson-1366-light', () => failedLesson(1366, 768, false)],
];
for (const [name, run] of scenarios) if (name.includes(filter)) await run();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
failed.forEach((r) => console.log('FAIL ' + r.msg));
process.exit(failed.length ? 1 : 0);
