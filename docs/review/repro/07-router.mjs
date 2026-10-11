// A malformed %-escape in the hash throws inside U._route after the view was cleared: blank screen.
import { open, report, sleep, topic } from './lib.mjs';
const app = await open({ db: { 'topics/tA': topic('tA') }, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/t/tA'));
await page.waitForSelector('.tp-ready');
await page.evaluate(() => { location.hash = '#/t/tA%E0%A4%A'; });
await sleep(600);
const view = (await page.textContent('#view')).trim();
report('malformed %-escape leaves a blank screen', view === '' && app.errors.some((e) => /URIError/.test(e)), 'view text: "' + view + '"; errors: ' + JSON.stringify(app.errors));
// Ids outside the db path grammar reach the store: shows a raw TypeError message.
await page.evaluate(() => { location.hash = '#/t/..'; });
await sleep(600);
console.log('   #/t/.. shows: ' + (await page.textContent('#view')).replace(/\s+/g, ' ').trim().slice(0, 140));
await app.close();
