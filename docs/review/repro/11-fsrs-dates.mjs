// Property checks for day arithmetic and FSRS across time zones (run once per TZ).
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const src = (f) => readFileSync(new URL('../../../app/src/js/' + f, import.meta.url), 'utf8');
const ctx = vm.createContext({ console });
vm.runInContext('var window = globalThis;', ctx);
vm.runInContext('"use strict";\n' + ['00-core.js', '40-fsrs.js'].map(src).join('\n'), ctx);
const U = ctx.U, F = U.fsrs;
const problems = [];
const utcNext = (day, n) => new Date(Date.UTC(...day.split('-').map((x, i) => Number(x) - (i === 1 ? 1 : 0))) + n * 864e5).toISOString().slice(0, 10);
for (let t = Date.UTC(2024, 0, 1); t < Date.UTC(2032, 0, 1); t += 864e5) {
  const day = new Date(t).toISOString().slice(0, 10);
  for (const n of [1, -1, 7, 31, 365]) {
    const a = U.addDays(day, n);
    if (a !== utcNext(day, n)) problems.push(`addDays(${day}, ${n}) = ${a}`);
    if (U.daysBetween(day, a) !== n) problems.push(`daysBetween(${day}, ${a}) != ${n}`);
  }
  // local midnight and 23:59 of that day map back to it
  const [y, m, d] = day.split('-').map(Number);
  if (U.today(new Date(y, m - 1, d, 0, 0)) !== day) problems.push('today(midnight ' + day + ') = ' + U.today(new Date(y, m - 1, d)));
  if (U.today(new Date(y, m - 1, d, 23, 59)) !== day) problems.push('today(23:59 ' + day + ')');
}
// FSRS invariants over random states, overdue up to 5 years, and a "last" in the future (clock skew).
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 20000; i++) {
  const day = U.addDays('2026-01-01', Math.floor(rnd() * 2000));
  const s = i % 5 === 0 ? F.init(U.addDays(day, -1)) : { due: day, stability: 0.1 + rnd() * 400, difficulty: 1 + rnd() * 9, reps: 1 + Math.floor(rnd() * 30), lapses: Math.floor(rnd() * 5), last: U.addDays(day, -Math.floor(rnd() * 1800) + (i % 97 === 0 ? 3 : 0)) };
  const p = F.preview(s, day, 'c' + i);
  for (const g of [1, 2, 3, 4]) {
    const n = p[g];
    if (!(n.due > day)) problems.push(`grade ${g} due ${n.due} not after ${day}`);
    if (![n.stability, n.difficulty, n.interval].every(Number.isFinite)) problems.push('NaN ' + JSON.stringify(n));
    if (n.difficulty < 1 || n.difficulty > 10 || n.stability < 0.1) problems.push('bounds ' + JSON.stringify(n));
    if (n.interval > 365) problems.push('interval ' + n.interval);
  }
  if (!(p[2].interval <= p[3].interval && (p[3].interval < p[4].interval || p[4].interval === 365))) problems.push('order ' + [1, 2, 3, 4].map((g) => p[g].interval));
  const r = F.retrievability(s, day); if (!(r >= 0 && r <= 1)) problems.push('R ' + r);
}
console.log(`${process.env.TZ || 'default'}: ${problems.length} problems` + (problems.length ? '\n  ' + problems.slice(0, 5).join('\n  ') : ''));
