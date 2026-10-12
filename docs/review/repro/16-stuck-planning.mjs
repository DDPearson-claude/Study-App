// A topic whose planner died (app closed or killed while planning) stays 'planning' forever:
// the topic page animates "Planning…" with no Retry and no Delete, on every device.
import { open, report, sleep, isoDaysAgo } from './lib.mjs';
const t = { id: 'tP', title: 'Tides', query: 'tides', status: 'planning', createdAt: isoDaysAgo(2), updatedAt: isoDaysAgo(2), ideas: [], calibration: [], research: { status: 'none' }, hue: 10 };
const app = await open({ db: { 'topics/tP': t }, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/t/tP'));
await page.waitForSelector('.tp-planning, .tp-failed');
await sleep(4000);
const buttons = await page.$$eval('.tp button', (b) => b.map((x) => x.textContent));
const links = await page.$$eval('.tp a', (a) => a.map((x) => x.textContent.trim()));
const live = await page.evaluate(() => U.gen.status('tP'));
report('two-day-old "planning" topic offers no way out', buttons.length === 0 && !live.planning,
  'buttons: ' + JSON.stringify(buttons) + ', links: ' + JSON.stringify(links) + ', U.gen.status: ' + JSON.stringify(live));
await page.goto(app.url('#/'));
await page.waitForSelector('.tcard');
console.log('   Learn card: ' + (await page.textContent('.tcard')).replace(/\s+/g, ' '));
// A research status left at 'running' by a page that went away (10 minutes ago).
const t2 = { ...t, id: 'tR', status: 'ready', ideas: [{ id: 'i1', title: 'Gravity', oneLine: 'x', deps: [], kind: 'concept' }], research: { status: 'running', at: new Date(Date.now() - 6e5).toISOString(), sources: 0 } };
await page.evaluate((d) => window.__CLAUDE_STUB__.seed('topics/tR', d), t2);
await page.goto(app.url('#/t/tR'));
await page.waitForSelector('.lib-status');
const lib = (await page.textContent('.lib-status')).replace(/\s+/g, ' ').trim();
report('research left "running" by a dead page shows "Checking sources…" forever', /Checking sources/.test(lib), 'library says: "' + lib + '"');
await app.close();
