// A target card whose interactive gives no reading (missing output, kit error, frame that never
// answers) has no way out: "Check" toasts and re-enables forever, there is no Skip, the card is
// never saved, so it heads every review session.
import { open, report, sleep, P, TODAY, addDays, NOW, isoDaysAgo, topic } from './lib.mjs';
const html = `<div class="k-controls" id="controls"></div>
<script>
K.control({id:'temp', label:'Air temperature', min:-20, max:40, step:1, value:20, unit:'°C', into:'#controls'});
K.model(function (p) { return { other: 331 + 0.6 * p.temp }; });
K.ready();
</script>`;
const spec = { id: 'c3', type: 'target', q: 'Set the temperature so sound travels at 350 m/s.', control: 'temp', output: 'speed', target: 350, tolerance: 2, why: 'About 32 °C.' };
const mk = (id, iid, extra) => ({ id, tid: 'tA', iid, createdAt: isoDaysAgo(9), learnedAt: isoDaysAgo(9), hist: [], ...extra });
const db = {
  'topics/tA': topic('tA'),
  'topics/tA/lessons/i2': { status: 'ready', updatedAt: NOW, lesson: { iid: 'i2', interactive: { controls: [{ id: 'temp', label: 'Air temperature', min: -20, max: 40, step: 1, value: 20 }] }, checks: [spec] }, interactive: { html, title: 'Speed of sound' } },
  [P('profile/cards/tA')]: { cards: {
    i2_c3: mk('i2_c3', 'i2', { type: 'target', spec, s: { due: addDays(TODAY, -4), stability: 3, difficulty: 5, reps: 1, lapses: 0, last: addDays(TODAY, -7) } }),
    i1_c1: mk('i1_c1', 'i1', { type: 'choice', spec: { id: 'c1', type: 'choice', q: 'Other card?', options: ['a', 'b'], answer: 0 }, s: { due: TODAY, stability: 3, difficulty: 5, reps: 1, lapses: 0, last: addDays(TODAY, -3) } }),
  } },
  [P('profile')]: { prefs: {}, days: {} },
};
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/review'));
await page.waitForSelector('.qc-type-target .qc-primary:not([disabled])', { timeout: 15000 });
for (let i = 0; i < 3; i++) {
  await page.click('.qc-type-target .qc-primary');
  await page.waitForSelector('.qc-type-target .qc-primary:not([disabled])', { timeout: 10000 });
}
const foot = await page.$$eval('.qc-foot button', (b) => b.map((x) => x.textContent));
const toasts = await page.$$eval('#toasts .toast', (t) => t.map((x) => x.textContent));
const count = await page.textContent('.rv-count');
report('target card with no reading cannot be finished or skipped', foot.length === 1 && !/skip/i.test(foot.join()),
  'after 3 checks: buttons=' + JSON.stringify(foot) + ', progress "' + count + '", toast: ' + JSON.stringify(toasts[0]));
await app.close();
