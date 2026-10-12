// A log-scale estimate snaps to 2 significant figures, so an answer whose tolerance is tighter
// than that grid can never be marked right (every review -> Again).
import { open, report } from './lib.mjs';
const app = await open({ db: {}, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/'));
await page.waitForSelector('.ask');
const res = await page.evaluate(async () => {
  const spec = { id: 'c4', type: 'estimate', q: 'Speed of sound in air?', min: 1, max: 10000, answer: 343, tolerance: 2, unit: 'm/s', log: true, why: '343 m/s.' };
  let result = null;
  const el = U.cards.render({ id: 'i2_c4', type: 'estimate', spec }, { mode: 'review', onDone: (r) => { result = r; } });
  document.getElementById('view').appendChild(el);
  const range = el.querySelector('.qc-range'), outEl = el.querySelector('.qc-est-value'), out = { get textContent() { return outEl.querySelector('.qc-est-num').textContent; } };
  const seen = new Set(), MAX = Number(range.max);
  for (let p = 0; p <= MAX; p++) { range.value = String(p); range.dispatchEvent(new Event('input')); seen.add(out.textContent); }
  // Walk with the nudge buttons from the slider position nearest 343 too.
  range.value = String(Math.round(MAX * Math.log10(343) / 4)); range.dispatchEvent(new Event('input'));
  const plus = el.querySelectorAll('.qc-nudge')[1], minus = el.querySelectorAll('.qc-nudge')[0];
  for (let i = 0; i < 5; i++) { minus.click(); seen.add(out.textContent); }
  for (let i = 0; i < 10; i++) { plus.click(); seen.add(out.textContent); }
  const nums = [...seen].map((t) => Number(t.replace(/,/g, ''))).filter((n) => n >= 300 && n <= 400).sort((a, b) => a - b);
  // Lock in the closest reachable value (by slider, else by nudging from the nearest slider value).
  const best = nums.reduce((b, n) => (Math.abs(n - 343) < Math.abs(b - 343) ? n : b), nums[0]);
  const cur = () => Number(out.textContent.replace(/,/g, ''));
  let p = 0;
  for (; p <= MAX; p++) { range.value = String(p); range.dispatchEvent(new Event('input')); if (cur() >= best) break; }
  for (let i = 0; i < 20 && cur() > best; i++) minus.click();
  for (let i = 0; i < 20 && cur() < best; i++) plus.click();
  el.querySelector('.qc-primary').click();
  const title = el.querySelector('.qc-fb h3').textContent;
  el.querySelector('.qc-continue').click();
  return { near: nums, best, title, grade: result && result.grade, correct: result && result.correct, max: MAX };
});
report('log estimate unanswerable when tolerance < 2-sig-fig grid', res.correct === false,
  'slider positions: ' + res.max + '; reachable values 300-400: ' + JSON.stringify(res.near) + '; closest locked in: ' + res.best + ' -> "' + res.title + '", grade ' + res.grade);
await app.close();
