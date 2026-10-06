#!/usr/bin/env node
// Research with the real Parallel Search tools, checked the way the app checks it in the page.
//
//   node tools/eval/sources.mjs --show tools/03-web_search.json
//       Prints a saved tool result exactly as the in-app Claude sees it: markdown links and
//       emphasis removed (U.research._clean) and fitted to 12 KB (search) or 20 KB (fetch) as
//       valid JSON (U.research._fit). Read this, never the raw file, when wearing the model hat.
//
//   node tools/eval/sources.mjs --reply research.reply.txt --tools <dir> --topic topic.json --out research.json
//       Validates the research reply (U.validate.research), records every saved tool result in the
//       app's source checker (U.gen._corpus, after the same cleaning and fitting), and keeps only
//       sources that are pages a tool returned with their quote on that page
//       (U.gen._filterResearch). Prints {problems, kept, dropped} and writes the kept research, in
//       the reply's own shape, to --out (give that to `prompts.mjs write-lesson --research`).
//
// Tool files: <dir>/*.json (read in name order), each {"tool": "web_search"|"web_fetch",
// "input": {...}, "output": <the connector's payload, verbatim>}.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
const MAX = { web_search: 12000, web_fetch: 20000 };

function load() {
  const noop = () => {};
  const ctx = { console: { log: noop, warn: noop, error: console.error }, setTimeout, clearTimeout, Promise, Date, Math, JSON, URL };
  ctx.window = ctx;
  ctx.addEventListener = noop;
  vm.createContext(ctx);
  for (const f of ['00-core.js', '10-runtime.js', '30-prompts.js', '31-generate.js']) {
    vm.runInContext(readFileSync(join(root, 'app', 'src', 'js', f), 'utf8'), ctx, { filename: f });
  }
  return ctx.U;
}

function readTool(path) {
  const t = JSON.parse(readFileSync(path, 'utf8'));
  if (!t || !MAX[t.tool] || t.output === undefined) throw new Error(path + ': expected {tool: "web_search"|"web_fetch", input, output}');
  const out = typeof t.output === 'string' ? (() => { try { return JSON.parse(t.output); } catch (e) { return t.output; } })() : t.output;
  return { tool: t.tool, input: t.input, output: out };
}

const U = load();
const seen = (t) => U.research._fit(U.research._clean(t.output), MAX[t.tool]);

if (arg('show')) {
  const t = readTool(arg('show'));
  const s = seen(t);
  try { console.log(JSON.stringify(JSON.parse(s), null, 1)); } catch (e) { console.log(s); }
  process.exit(0);
}

const replyText = readFileSync(arg('reply'), 'utf8');
const topic = JSON.parse(readFileSync(arg('topic'), 'utf8'));
const dir = arg('tools');
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const corpus = U.gen._corpus();
for (const f of files) {
  const t = readTool(join(dir, f));
  corpus.calls++;
  const text = seen(t);
  if (!corpus.add(text) && t.tool === 'web_fetch' && t.input) corpus.add([].concat(t.input.urls || []).join('\n'));
}
// The answer is picked as the app picks it (U.ask: U.parseJson.pick with the research validator).
let raw = null, problems = [];
const got = U.parseJson.pick(replyText, (o) => U.validate.research(o, { ideas: topic.ideas }));
if (got.problems) {
  problems = got.problems;
  try { raw = U.parseJson(replyText); } catch (e) { problems = ['could not parse: ' + (e.message || e)]; }
} else raw = got.value;
const ids = (topic.ideas || []).map((i) => i.id);
const res = raw ? U.gen._filterResearch(raw, corpus, ids) : { docs: {}, kept: 0, dropped: [] };
// Back to the reply's shape: kept sources renumbered 1..k, notes pointing at them.
const all = [];
const add = (doc) => (doc && doc.sources || []).forEach((s) => { if (!all.some((x) => x.n === s.n)) all.push(s); });
Object.values(res.docs).forEach(add);
all.sort((a, b) => a.n - b.n);
const shaped = { sources: all, topic: { notes: (res.docs.topic || {}).notes || [] }, ideas: {} };
ids.forEach((iid) => { shaped.ideas[iid] = { notes: (res.docs[iid] || {}).notes || [] }; });
if (arg('out')) writeFileSync(arg('out'), JSON.stringify(shaped, null, 2));
console.log(JSON.stringify({ toolFiles: files.length, problems, cited: raw && Array.isArray(raw.sources) ? raw.sources.length : 0, kept: res.kept, dropped: res.dropped }, null, 2));
process.exit(problems.length ? 1 : 0);
