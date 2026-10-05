// Regression check: deleting a topic while its background research is still running used to
// resurrect a ghost topic doc (no id/title) on Learn. Fixed by the 20-store.js change in ce034f6
// (patches no longer create shared docs); prints NOT REPRODUCED on the current tree.
import { open, taskOf, readJson, report, sleep } from './lib.mjs';
const plan = readJson('tests/fixtures/plan-jet-engines.json');
let release; const gate = new Promise((r) => (release = r));
const app = await open({
  tools: { 'Parallel Search': { web_search: () => ({ results: [] }), web_fetch: () => ({ results: [] }) } },
  sample: async (input) => {
    const t = taskOf(input);
    if (t === 'plan-topic') return plan;
    if (t === 'research') { await gate; throw { code: 'overloaded', message: 'busy' }; }
    return new Promise(() => {}); // lesson writing never finishes in this test
  },
});
const { page } = app;
await page.goto(app.url('#/'));
await page.fill('#ask-input', 'How jet engines work');
await page.click('.ask-go');
await page.waitForSelector('.tp-ready', { timeout: 15000 });
const tid = decodeURIComponent((await page.evaluate(() => location.hash)).split('/')[2]);
await page.click('.tp-delete');
await page.click('.sheet .btn.danger');
await page.waitForFunction(() => location.hash === '#/');
await sleep(500);
const before = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p), 'topics/' + tid);
release();                      // research now finishes (here: fails) after the delete
await sleep(1500);
const after = await page.evaluate((p) => window.__CLAUDE_STUB__.get(p), 'topics/' + tid);
await page.goto(app.url('#/map')); await page.goto(app.url('#/'));
await page.waitForSelector('.tcard, .welcome');
const cards = await page.$$eval('.tcard', (els) => els.map((e) => ({ title: e.querySelector('.tcard-title').textContent, href: e.getAttribute('href') })));
report('ghost topic after delete during research', !before && !!after && cards.some((c) => c.href === '#/t/undefined'),
  'doc before release: ' + JSON.stringify(before) + '\n   doc after release: ' + JSON.stringify(after) + '\n   Learn cards: ' + JSON.stringify(cards));
if (cards[0]) {
  await page.click('.tcard');
  await page.waitForTimeout(600);
  console.log('   clicking it shows: ' + (await page.textContent('#view')).replace(/\s+/g, ' ').slice(0, 120));
}
console.log('   page errors: ' + JSON.stringify(app.errors.slice(0, 3)));
await app.close();
