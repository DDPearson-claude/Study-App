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
// revisiting a finished idea), preparing (ensureLesson pending with onStatus lines, predict while
// the interactive builds, prefetch of the next idea), an error with Retry, resuming mid-lesson,
// and the no-interactive path (contested, not source-checked). Screenshots: tests/out/lesson-*.png.
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
      T.ensure.push({ tid: tid, iid: iid, status: !!(o && o.onStatus) });
      if (T.pending[iid]) return T.pending[iid](o || {});
      return U.store.lesson.get(tid, iid).then(function (d) { return d && d.status === 'ready' ? d : new Promise(function () {}); });
    },
    grade: function (say, text, attempt, opts) {
      T.grade.push({ text: text, attempt: attempt, rubric: (say.rubric || []).length, previous: (opts && opts.previous) || null, title: (opts && opts.title) || null });
      var r = T.gradeReplies.shift() || { met: [true, false, false], verdict: 'partly', nailed: 'You have the main point.', followUp: 'What happens if you make it four times as long?' };
      return U.sleep(cfg.gradeMs || 350).then(function () { return r; });
    },
    // Learn it again: like the real one, the lesson doc is replaced (writing, then the new lesson).
    relearn: cfg.relearnDoc ? function (tid, iid, o) {
      T.relearn.push({ tid: tid, iid: iid, feedback: (o && o.feedback) || null });
      return U.store.lesson.set(tid, iid, { status: 'writing', lesson: null, interactive: null, sourced: false }).then(function () {
        return U.sleep(300);
      }).then(function () {
        var d = JSON.parse(JSON.stringify(cfg.relearnDoc));
        d.lesson.predict.q = d.lesson.predict.q + ' (take ' + T.relearn.length + ')';
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

async function open({ width, dark, hash, seed = {}, cfg = {}, reduced = false }) {
  const app = await openApp({ width, height: width < 700 ? 707 : 860, file: PAGE });
  if (reduced) await app.page.emulateMedia({ reducedMotion: 'reduce' });
  await app.page.goto(app.url(hash));
  await app.page.evaluate(async ({ theme, seed }) => {
    await U.rt.ready;
    document.documentElement.dataset.muTheme = theme;
    Object.keys(seed).forEach((p) => window.__CLAUDE_STUB__.seed(p, seed[p]));
  }, { theme: dark ? 'dark' : 'light', seed });
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
    ok(await page.locator('.lsn-step.is-now').count() === 1, 'one current step in the progress bar');
    const sure = page.getByRole('button', { name: 'That\'s my guess' });
    ok(await sure.isDisabled(), 'guess button waits for a choice');
    await noOverflow(app);
    await shot(app, `${tag}-1-predict`);
    await page.locator('.lsn-stage[data-stage="predict"] .option').nth(0).click();
    await sure.click();

    // Play
    const play = page.locator('.lsn-stage[data-stage="play"]');
    await play.locator('iframe').waitFor();
    const reserved = await play.locator('.lsn-panel').evaluate((el) => el.getBoundingClientRect().height);
    ok(reserved >= 560, `height reserved while the interactive loads (${Math.round(reserved)}px)`);
    if (width < 700) await shot(app, `${tag}-2a-play-loading`);
    await play.locator('.lsn-selfcheck').waitFor({ timeout: 15000 });
    ok((await play.locator('.lsn-selfcheck').textContent()).includes('2/2 checks'), 'self-check footer shows 2/2 checks');
    await page.waitForTimeout(1000);
    const settledH = await play.locator('.lsn-panel').evaluate((el) => el.getBoundingClientRect().height);
    console.log(`  interactive: reserved ${Math.round(reserved)}px, settled ${Math.round(settledH)}px`);
    ok(await page.evaluate((k) => Number(localStorage.getItem(k)) > 200, 'mu-lsn-h:pendulums/i1' + (width >= 700 ? ':wide' : '')), 'measured height remembered for next time (per width)');
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
    ok(await page.locator('.lsn-step.is-all').count() === 5, 'progress bar turns green when done');
    t = await T(app);
    ok(t.ensure.some((e) => e.iid === 'i2'), 'next idea prefetched');
    await shot(app, `${tag}-8-done`);
    if (width < 700 && !dark) await shot(app, `${tag}-9-full`, true);

    // Revisit: everything collapsed, no second celebration or cards
    await page.waitForFunction(() => !document.querySelector('.cheer'), null, { timeout: 5000 });
    await page.evaluate(() => U.go(location.hash));
    await page.locator('.lsn-done').waitFor();
    ok(await page.locator('.lsn-past').count() === 5, 'revisit shows all five stages collapsed');
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
async function preparing() {
  current = 'preparing 360-light';
  console.log('\n' + current);
  const app = await open({ width: 360, dark: false, hash: '#/t/pendulums/i3', seed: { 'topics/pendulums': TOPIC }, cfg: { pending: ['i3'] } });
  const { page } = app;
  try {
    await page.locator('.lsn-prep').waitFor();
    ok(await page.locator('.lsn-title').textContent() === 'Small swings and big swings', 'title shows while preparing');
    await page.evaluate(() => { const o = window.__T.prep.o; o.onStatus('Reading 4 sources about pendulums'); o.onStatus('Writing the lesson'); });
    ok(await page.locator('.lsn-prep-lines li').count() === 3, 'progress lines appear one per status');
    ok(await page.locator('.lsn-prep-lines li.is-done').count() === 2, 'earlier lines are ticked off');
    await shot(app, 'prep-1-writing');
    // The lesson is written; the interactive is still building -> predict shows now.
    const building = { status: 'building', updatedAt: new Date().toISOString(), lesson: SMALL.lesson, interactive: null, sourced: true };
    await app.seed(LESSON('i3'), building);
    await page.evaluate(() => window.__T.prep.o.onStatus('Building the interactive'));
    await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor();
    ok(await page.locator('.lsn-prep-head').textContent() === 'Building the interactive', 'prep heading follows the work');
    await shot(app, 'prep-2-predict-while-building');
    await page.locator('.lsn-stage[data-stage="predict"] .option').nth(1).click();
    await page.getByRole('button', { name: 'That\'s my guess' }).click();
    const play = page.locator('.lsn-stage[data-stage="play"]');
    await play.locator('.lsn-panel.is-waiting .lsn-prep').waitFor();
    await page.evaluate(() => window.__T.prep.o.onStatus('Testing it at phone and desktop widths'));
    ok(await play.getByRole('button', { name: /read on while it builds/ }).count() === 1, 'can read on while it builds');
    await shot(app, 'prep-3-play-waiting');
    // Ready
    await app.seed(LESSON('i3'), SMALL);
    await page.evaluate((d) => window.__T.prep.res(d), SMALL);
    await play.locator('.lsn-selfcheck').waitFor({ timeout: 15000 });
    ok(await page.locator('.lsn-prep').count() === 0, 'progress lines go once ready');
    ok(await play.getByRole('button', { name: 'I\'ve had a play' }).count() === 1, 'play button appears once ready');
    const t = await T(app);
    ok(t.ensure[0].iid === 'i3' && t.ensure[0].status, 'ensureLesson called with onStatus');
    ok(t.ensure.some((e) => e.iid === 'i4'), 'next idea (i4) prefetched once ready');
    await shot(app, 'prep-4-ready');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'prep-error').catch(() => {});
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
    await page.locator('.lsn-stage[data-stage="predict"] input').waitFor();
    const t2 = await T(app);
    ok(t2.relearn.length === 2 && t2.relearn[1].feedback === 'The date in the reveal looks wrong.', 'Rebuild passes his note to U.gen.relearn');
    pr = await doc(app, PROGRESS);
    ok(pr.ideas.i5.round === 2 && pr.ideas.i5.stage === 'predict', 'rebuilding starts another round');
  } catch (e) {
    ok(false, 'threw: ' + (e.message || e).split('\n')[0]);
    await shot(app, 'relearn-error').catch(() => {});
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

const scenarios = [
  ['walk-360-light', () => walk(360, false)],
  ['walk-360-dark', () => walk(360, true)],
  ['walk-1280-light', () => walk(1280, false)],
  ['walk-1280-dark', () => walk(1280, true)],
  ['preparing', preparing],
  ['retry', retry],
  ['resume-360-light', () => resume(360, false)],
  ['resume-1280-dark', () => resume(1280, true)],
  ['plain-360-dark', () => plain(360, true)],
  ['plain-1280-light', () => plain(1280, false)],
  ['two-devices', twoDevices],
  ['relearn', relearnScenario],
  ['leave-while-grading', leaveWhileGrading],
  ['full-app', fullApp],
];
for (const [name, run] of scenarios) if (name.includes(filter)) await run();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
failed.forEach((r) => console.log('FAIL ' + r.msg));
process.exit(failed.length ? 1 : 0);
