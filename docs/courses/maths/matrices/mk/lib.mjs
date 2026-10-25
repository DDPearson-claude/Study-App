import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
const root = '/home/user/Study-App';
const MAX = { web_search: 12000, web_fetch: 20000 };
function load() {
  const noop = () => {};
  const ctx = { console: { log: noop, warn: noop, error: console.error }, setTimeout, clearTimeout, Promise, Date, Math, JSON, URL };
  ctx.window = ctx; ctx.addEventListener = noop; vm.createContext(ctx);
  for (const f of ['00-core.js', '10-runtime.js', '30-prompts.js', '31-generate.js', '34-verify.js']) vm.runInContext(readFileSync(join(root, 'app', 'src', 'js', f), 'utf8'), ctx, { filename: f });
  return ctx.U;
}
export const U = load();
export function pages(dir) {
  const out = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const t = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const o = typeof t.output === 'string' ? (() => { try { return JSON.parse(t.output); } catch (e) { return t.output; } })() : t.output;
    const s = U.research._fit(U.research._clean(o), MAX[t.tool]);
    let j; try { j = JSON.parse(s); } catch (e) { continue; }
    for (const r of (j.results || [])) {
      const strs = [].concat(r.excerpts || [], r.full_content ? [r.full_content] : []);
      out.push({ file: f, url: r.url, title: r.title, strs });
    }
  }
  return out;
}
export const norm = (s) => s.replace(/\s+/g, ' ');
