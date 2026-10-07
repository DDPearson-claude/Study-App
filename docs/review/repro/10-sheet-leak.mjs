// Route changes clear #sheets without calling each sheet's close(): its document keydown
// listener (and everything it closes over, e.g. the tutor's lesson + interactive handle) leaks,
// onClose never runs, and a pending confirmSheet promise never settles.
import { open, report, sleep, topic, lesson } from './lib.mjs';
const app = await open({ db: { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1') }, sample: () => 'Sure.' });
const { page } = app;
await page.addInitScript(() => {
  window.__keydown = 0;
  const add = document.addEventListener.bind(document), rem = document.removeEventListener.bind(document);
  document.addEventListener = (t, f, o) => { if (t === 'keydown') window.__keydown++; return add(t, f, o); };
  document.removeEventListener = (t, f, o) => { if (t === 'keydown') window.__keydown--; return rem(t, f, o); };
});
await page.goto(app.url('#/t/tA'));
await page.waitForSelector('.tp-ready');
const base = await page.evaluate(() => window.__keydown);
for (let i = 0; i < 5; i++) {
  await page.click('.tp-delete');                      // "Delete this topic?" confirm sheet
  await page.waitForSelector('.sheet');
  await page.evaluate(() => { location.hash = '#/map'; }); // back / tab tap while it is open
  await page.waitForSelector('.map');
  await page.evaluate(() => { location.hash = '#/t/tA'; });
  await page.waitForSelector('.tp-ready');
}
let settled = 'pending';
await page.evaluate(() => { window.__p = U.confirmSheet({ title: 'Delete?', text: 'x' }).then((v) => { window.__settled = String(v); }); });
await page.evaluate(() => { location.hash = '#/map'; });
await sleep(500);
settled = await page.evaluate(() => window.__settled || 'pending');
const leaked = (await page.evaluate(() => window.__keydown)) - base;
report('sheets closed by navigation leak listeners and never settle', leaked >= 5 && settled === 'pending', 'keydown listeners leaked: ' + leaked + '; confirmSheet promise: ' + settled);
await app.close();
