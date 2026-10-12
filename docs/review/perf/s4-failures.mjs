// Behaviour when Claude is slow / rate-limited / not granted, and when the db is slow / unavailable / hung.
import { createWorld, openTab, serve, closeBrowser, stopServer, save, sleep, FX, UID, summarizeSamples } from './harness.mjs';
import { makeSeed } from './seed.mjs';
const url = await serve();
const which = process.argv[2];
const PLANNED = () => { const p = FX.planJet; return { ['topics/jet']: Object.assign({}, p, { id: 'jet', status: 'ready', research: { status: 'unavailable', at: new Date().toISOString(), sources: 0 } }) }; };
async function screen(page) { return (await page.locator('#view').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 260); }
async function toasts(page) { return page.evaluate(() => window.__toasts || []); }
const TOAST_SPY = () => { const box = () => document.getElementById('toasts'); const t = setInterval(() => { const b = box(); if (!b) return; clearInterval(t); window.__toasts = []; new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => window.__toasts.push(n.textContent)))).observe(b, { childList: true }); }, 50); };

async function lessonRun(name, worldOpts, tabOpts, watchMs, after) {
  const W = createWorld(Object.assign({ seed: PLANNED(), dbLatency: 100 }, worldOpts));
  if (worldOpts.sampleMode) W.sample.mode = worldOpts.sampleMode;
  const tab = await openTab(W, Object.assign({ label: 'A' }, tabOpts));
  await tab.page.addInitScript(TOAST_SPY);
  const { page } = tab;
  const marks = {};
  const t0 = Date.now();
  await page.goto(url + '#/t/jet/i1', { waitUntil: 'commit' });
  const probes = { predict: '.lsn-stage[data-stage="predict"] .option', live: '.kit-frame[data-state="live"]', error: '.lsn-prep-err:not([hidden])', slow: '.lsn-prep-slow:not([hidden])', fatal: '.notice.bad' };
  while (Date.now() - t0 < watchMs) {
    for (const [k, sel] of Object.entries(probes)) if (!marks[k] && await page.locator(sel).count()) marks[k] = Date.now() - t0;
    if (marks.error || marks.fatal || (marks.live && !after)) break;
    await sleep(250);
  }
  const out = { name, marks, samples: summarizeSamples(W), sampleLog: W.sample.log.map((e) => [e.task, e.idea, e.tEnq, e.tEnd, e.outcome]), lessonDoc: (() => { const d = W.store.get('topics/jet/lessons/i1'); return d && { status: d.data.status, error: d.data.error }; })(), screen: await screen(page), toasts: await toasts(page), errors: tab.errors.slice(0, 3) };
  if (after) Object.assign(out, await after(page, W, tab));
  console.log('\n## ' + name + '\n' + JSON.stringify(out, null, 1));
  save('s4-' + name, out);
  await tab.context.close();
  return out;
}

if (!which || which === 'claude-slow') await lessonRun('claude-slow-30s', { taskLat: { 'write-lesson': 30000, 'build-interactive': 30000, 'repair-interactive': 30000, grade: 30000 } }, {}, 120000);
if (!which || which === 'rate-limited') await lessonRun('rate-limited', { sampleMode: 'rate_limited' }, {}, 60000, async (page, W) => {
  const before = W.sample.log.length;
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.locator('.lsn-prep-err:not([hidden])').waitFor({ timeout: 60000 });
  return { tryAgainCalls: W.sample.log.length - before };
});
if (!which || which === 'not-granted') await lessonRun('not-granted', { sampleMode: 'not_granted' }, {}, 30000);
if (!which || which === 'no-sample') await lessonRun('sample-capability-null', {}, { deny: ['sample'] }, 30000);
if (!which || which === 'upstream') await lessonRun('upstream-error-once', { sampleMode: (e) => (e.task === 'write-lesson' && !globalThis.__u1 ? (globalThis.__u1 = 1, 'upstream_error') : 'ok') }, {}, 30000);

// ---- db ----
async function dbRun(name, mode, hash, seedOpts, wait = 15000) {
  const W = createWorld({ seed: makeSeed(seedOpts || { topics: 3 }), dbLatency: 100 });
  W.db.mode = mode;
  const tab = await openTab(W, { label: 'A' });
  await tab.page.addInitScript(TOAST_SPY);
  await tab.page.goto(url + hash, { waitUntil: 'commit' });
  const snaps = [];
  for (const t of [3000, wait]) { await sleep(t - (snaps.length ? 3000 : 0)); snaps.push({ t, screen: await screen(tab.page) }); }
  const out = { name, mode, hash, snaps, toasts: await toasts(tab.page), errors: tab.errors.slice(0, 3) };
  console.log('\n## ' + name + '\n' + JSON.stringify(out, null, 1));
  save('s4-' + name, out);
  await tab.context.close();
}
if (!which || which === 'db-hang') { await dbRun('db-hang-learn', 'hang', '#/'); await dbRun('db-hang-lesson', 'hang', '#/t/topic-0/i2', { topics: 3, stage: 'play' }); }
if (!which || which === 'db-unavail') { await dbRun('db-unavailable-learn', 'unavailable', '#/'); await dbRun('db-unavailable-topic', 'unavailable', '#/t/topic-0'); await dbRun('db-unavailable-lesson', 'unavailable', '#/t/topic-0/i2', { topics: 3, stage: 'play' }); await dbRun('db-unavailable-today', 'unavailable', '#/today'); }

if (!which || which === 'db-midlesson') {
  // db drops out after the lesson has loaded; Dan finishes the lesson; db comes back.
  const W = createWorld({ seed: Object.assign(makeSeed({ topics: 1, ideas: 2, stage: 'predict' })), dbLatency: 100, taskLat: { grade: 1500 } });
  // use the jet lesson so the flow matches FX.jet1
  const L = W.store.get('topics/topic-0/lessons/i1').data; L.lesson = Object.assign(JSON.parse(JSON.stringify(FX.jet1)), { iid: 'i1' }); L.interactive.html = (await import('./harness.mjs')).SKATER;
  const tab = await openTab(W, { label: 'A' });
  await tab.page.addInitScript(TOAST_SPY);
  const { page } = tab;
  await page.goto(url + '#/t/topic-0/i1', { waitUntil: 'commit' });
  await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor({ timeout: 20000 });
  await sleep(1000);
  const progPath = `data/users/${UID}/profile/progress/topic-0`;
  const before = JSON.stringify(W.store.get(progPath).data.ideas.i1);
  W.db.mode = 'unavailable';
  await page.locator('.lsn-stage[data-stage="predict"] .option').first().click();
  await page.getByRole('button', { name: 'That\'s my guess' }).click();
  await page.locator('.kit-frame[data-state="live"]').waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: 'I\'ve had a play' }).click();
  await page.locator('.lsn-stage[data-stage="play"]').getByRole('button', { name: 'Continue' }).click();
  await page.locator('.lsn-stage[data-stage="explain"]').getByRole('button', { name: 'Continue' }).click();
  await page.locator('.lsn-stage[data-stage="say"] textarea').fill('You throw the ball back and it pushes you forward.');
  await page.getByRole('button', { name: 'Check my answer' }).click();
  await page.locator('.lsn-grade').first().waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: 'Show me a model answer' }).click();
  await page.locator('.lsn-stage[data-stage="say"]').getByRole('button', { name: 'Continue' }).click();
  for (const c of FX.jet1.checks) {
    const card = page.locator('.lsn-check').last();
    await card.locator('.qc-primary, .qc-continue').first().waitFor();
    if (c.type === 'choice') await card.locator(`.qc-opt[data-i="${c.answer}"]`).click();
    if (c.type === 'target') { await card.locator('.qc-primary:not([disabled])').waitFor({ timeout: 30000 }); await card.locator('.qc-primary').click(); await card.locator('.qc-primary:not([disabled])').waitFor(); }
    await card.locator('.qc-primary').click();
    await card.locator('.qc-continue').click();
  }
  await page.locator('.lsn-done').waitFor();
  await sleep(2000);
  W.db.mode = 'ok';
  await sleep(4000);
  const after = W.store.get(progPath).data.ideas.i1;
  const cards = W.store.get(`data/users/${UID}/profile/cards/topic-0`);
  const out = { progressBefore: JSON.parse(before), progressAfterDbBack: after, cardsDocExists: !!cards, toasts: await toasts(page), screen: await screen(page) };
  console.log('\n## db-unavailable-mid-lesson\n' + JSON.stringify(out, null, 1));
  save('s4-db-midlesson', out);
  await tab.context.close();
}
if (!which || which === 'db-slow') {
  for (const hash of ['#/', '#/t/topic-0', '#/t/topic-0/i2']) {
    const W = createWorld({ seed: makeSeed({ topics: 6, stage: hash.includes('/i') ? 'play' : null }), dbLatency: 3000 });
    const tab = await openTab(W, { label: 'A', watch: [['learn', '.tcard:not(.is-skeleton)'], ['topic', '.pnode'], ['lesson', '.lsn-stage .lsn-h'], ['live', '.kit-frame[data-state="live"]']] });
    const t0 = Date.now();
    await tab.page.goto(url + hash, { waitUntil: 'commit' });
    await tab.page.waitForFunction(() => Object.keys(window.__perf.marks).some((k) => k !== 'live'), null, { timeout: 60000, polling: 200 }).catch(() => {});
    await sleep(3500);
    const m = await tab.page.evaluate(() => window.__perf.marks);
    console.log('db 3 s/op', hash, JSON.stringify(m), 'gets', W.counts.get, 'queries', W.counts.query);
    await tab.context.close();
  }
}
await closeBrowser(); stopServer();
