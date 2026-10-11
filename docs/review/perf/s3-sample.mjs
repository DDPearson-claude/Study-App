// One lesson from a brand-new topic: which sample calls fire, when, how long user-facing ones wait.
import { createWorld, openTab, serve, closeBrowser, stopServer, save, sleep, FX } from './harness.mjs';
const url = await serve();
const mcp = process.argv[2] !== 'nomcp';
const W = createWorld({ mcp, dbLatency: 150, taskLat: { 'plan-topic': 3000, research: 45000, 'write-lesson': 25000, 'build-interactive': 35000, 'repair-interactive': 35000, grade: 10000, tutor: 8000 } });
const tab = await openTab(W, { label: 'A', width: 360 });
const { page } = tab;
const ev = (name, extra) => { W.ev(Object.assign({ name }, extra || {})); console.log(String(W.now()).padStart(7), name); };
const click = (name, scope) => (scope || page).getByRole('button', { name }).click();
async function dump(tag) {
  const log = W.sample.log.map((e) => ({ task: e.task, idea: e.idea, tier: e.tier, tools: e.tools.length, enq: e.tEnq, run: e.tRun, end: e.tEnd, wait: e.tRun != null ? e.tRun - e.tEnq : null, outcome: e.outcome || 'pending', cache: e.cache, signal: e.hasSignal, kb: Math.round(e.chars / 1024) }));
  console.table(log);
  console.log('db ops', JSON.stringify(W.counts), '\nwrites by path', JSON.stringify(W.writesByPath));
  console.log('errors', tab.errors.slice(0, 5));
  console.log('screen text:', (await page.locator('#view').innerText().catch(() => '')).slice(0, 600).replace(/\n+/g, ' | '));
  save('s3-sample-' + tag + (mcp ? '-mcp' : '-nomcp'), { log, events: W.events, counts: W.counts, writes: W.writesByPath });
}
process.on('unhandledRejection', async (e) => { console.log('FAILED', e.message.split('\n')[0]); await dump('fail'); await closeBrowser(); stopServer(); process.exit(1); });
await page.goto(url + '#/', { waitUntil: 'commit' });
await page.locator('#ask-input').waitFor();
await page.locator('#ask-input').fill('How do jet engines work');
ev('submit topic');
await page.locator('#ask-input').press('Enter');
await page.locator('.pnode').first().waitFor({ timeout: 60000 });
ev('topic plan shown');
await page.locator('.pnode-link').first().click();
await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor({ timeout: 240000 });
ev('lesson 1 predict shown');
await page.locator('.lsn-stage[data-stage="predict"] .option').first().click();
await click("That's my guess");
await page.locator('.kit-frame[data-state="live"], .lsn-none').first().waitFor({ timeout: 300000 });
ev('lesson 1 interactive live');
// Ask Claude while the next lesson is being prefetched in the background
await page.locator('.lsn-ask').click();
await page.locator('.tutor-input').fill('Why does length matter?');
ev('tutor asked');
await page.locator('.tutor-input').press('Enter');
await page.waitForFunction(() => /gravity/.test((document.querySelector('.tutor-log') || {}).textContent || ''), null, { timeout: 300000, polling: 100 });
ev('tutor answer starts');
await page.keyboard.press('Escape');
await click("I've had a play");
await page.locator('.lsn-stage[data-stage="play"]').getByRole('button', { name: 'Continue' }).click();
await page.locator('.lsn-stage[data-stage="explain"]').getByRole('button', { name: 'Continue' }).click();
await page.locator('.lsn-stage[data-stage="say"] textarea').fill('A longer string swings more slowly.');
ev('grade 1 asked');
await click('Check my answer');
await page.locator('.lsn-grade').first().waitFor({ timeout: 300000 });
ev('grade 1 shown');
await click('Have another go');
await page.locator('.lsn-stage[data-stage="say"] textarea').fill('A longer string swings more slowly; four times as long doubles the time.');
ev('grade 2 asked');
await click('Check again');
await page.locator('.lsn-grade').nth(1).waitFor({ timeout: 300000 });
ev('grade 2 shown');
await page.locator('.lsn-stage[data-stage="say"]').getByRole('button', { name: 'Continue' }).click();
for (const c of FX.jet1.checks) {
  const card = page.locator('.lsn-check').last();
  await card.locator('.qc-primary, .qc-continue').first().waitFor();
  if (c.type === 'choice') await card.locator(`.qc-opt[data-i="${c.answer}"]`).click();
  else if (c.type === 'order') { for (const item of c.items) await card.locator('.qc-chip', { hasText: item }).first().click(); }
  else if (c.type === 'estimate') await card.locator('.qc-nudge').last().click();
  if (c.type === 'target') { await card.locator('.kit-frame[data-state="live"]').waitFor({ timeout: 60000 }); ev('target check interactive live'); await card.locator('.qc-primary').click(); await card.locator('.qc-primary:not([disabled])').waitFor(); }
  await card.locator('.qc-primary').click();
  await card.locator('.qc-continue').click();
}
await page.locator('.lsn-done').waitFor();
ev('lesson 1 done');
await page.locator('.lsn-next a.btn').first().click();
await page.locator('.lsn-stage[data-stage="predict"] .option').first().waitFor({ timeout: 300000 });
ev('lesson 2 predict shown');
await page.locator('.kit-frame[data-state="live"], .lsn-none').first().waitFor({ timeout: 300000 });
ev('lesson 2 interactive live');
await sleep(5000);
await dump('ok');
await closeBrowser(); stopServer();
