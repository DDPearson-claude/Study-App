// Shared helpers for the correctness review repros. Full build at tests/out/correct.html.
import { openApp, taskOf, readJson, ROOT } from '../../../tools/harness/page.mjs';
import { join } from 'node:path';
export { taskOf, readJson, ROOT };
export const FILE = join(ROOT, 'tests', 'out', 'correct.html');
export const UID = 'u_stubuser0000000000000000';
export const P = (rest) => `data/users/${UID}/${rest}`;
const pad = (n) => (n < 10 ? '0' : '') + n;
export const dayStr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const TODAY = dayStr(new Date());
export const addDays = (day, n) => { const [y, m, d] = day.split('-').map(Number); return dayStr(new Date(y, m - 1, d + n)); };
export const isoDaysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
export const NOW = new Date().toISOString();
export async function open(opts = {}) {
  const app = await openApp({ file: FILE, ...opts, config: { ...(opts.config || {}), db: opts.db || {} } });
  return app;
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function topic(tid, extra = {}) {
  return { id: tid, title: 'How sound travels', query: 'how sound travels', status: 'ready', createdAt: NOW, updatedAt: NOW, hue: 200,
    hook: 'Hook', oneBreath: 'One breath', level: 'new', calibration: [], research: { status: 'done', at: NOW, sources: 0 },
    ideas: [{ id: 'i1', title: 'Sound is a pressure wave', oneLine: 'A push passed along', deps: [], kind: 'mechanism' },
            { id: 'i2', title: 'The speed of sound', oneLine: 'How fast', deps: ['i1'], kind: 'quantity' }], ...extra };
}
export function lesson(iid, extra = {}) {
  return { status: 'ready', updatedAt: NOW, sourced: false, interactive: null,
    lesson: { iid, title: 'Lesson ' + iid,
      predict: { q: 'What happens to the air?', options: ['Squeezed', 'Travels to your ear'], reveal: 'It is squeezed.' },
      interactive: null,
      explain: { text: 'Sound is a [[pressure wave]].' },
      say: { prompt: 'Explain sound in your own words.', rubric: ['pressure', 'passed along'], model: 'A pressure wave passed along.' },
      checks: [
        { id: 'c1', type: 'choice', q: 'What moves to your ear?', options: ['The squeeze', 'The air itself'], answer: 0, why: 'The squeeze.' },
      ],
      sources: [], confidence: 'settled' }, ...extra };
}
export function report(name, ok, detail) {
  console.log((ok ? 'REPRODUCED ' : 'NOT REPRODUCED ') + name + (detail ? '\n   ' + detail : ''));
}
