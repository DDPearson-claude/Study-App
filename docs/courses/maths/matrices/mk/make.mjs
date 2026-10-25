import { pages, norm } from './lib.mjs';
import { SPECS } from './specs.mjs';
import { writeFileSync } from 'node:fs';
const P = pages('/home/user/Study-App/build/maths/matrices/tools');
const out = [], miss = [];
for (const [id, section, claim, urlSub, from, to] of SPECS) {
  let got = null;
  for (const p of P) {
    if (!p.url.includes(urlSub)) continue;
    for (const s of p.strs) {
      const t = norm(s); const i = t.indexOf(from);
      if (i < 0) continue;
      const j = to ? t.indexOf(to, i + Math.max(0, from.length - to.length)) : -1;
      if (to && j < 0) continue;
      const end = to ? j + to.length : i + from.length;
      got = { quote: t.slice(i, end), title: p.title, url: p.url };
      break;
    }
    if (got) break;
  }
  if (!got) { miss.push(id); continue; }
  out.push({ id, section, claim, title: norm(got.title).trim(), url: got.url, quote: got.quote });
}
writeFileSync('built.json', JSON.stringify(out, null, 1));
console.log('built', out.length, 'miss', miss.length, miss.join(' '));
for (const q of out) if (q.quote.length > 900) console.log('LONG', q.id, q.quote.length);
