// U.rt.ready guards each claude.use() with a 10 s timeout, but not user.id(): if that bridge call
// never answers, boot never routes and the app stays on "Opening your university…".
import { open, report, sleep } from './lib.mjs';
const app = await open({ db: {}, sample: () => '{}' });
const { page } = app;
await page.addInitScript(() => {
  const real = window.claude;
  window.claude = { use: (name) => real.use(name).then((ns) => name === 'user' && ns ? Object.assign({}, ns, { id: () => new Promise(() => {}) }) : ns) };
});
await page.goto(app.url('#/'));
await sleep(13000);
const text = (await page.textContent('#view')).replace(/\s+/g, ' ').trim();
report('boot hangs when user.id() never answers', /Opening your university/.test(text), 'after 13 s the view says: "' + text + '"');
await app.close();
