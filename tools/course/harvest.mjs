#!/usr/bin/env node
// Saves a research agent's Parallel Search results verbatim, straight from its transcript, as the
// tool files sources.mjs checks quotes against. The agent never retypes a result (the Percentages
// research lost every source that way, 11 Oct): it searches, writes its reply, and this copies
// each call's input and the connector's own payload.
//   node tools/course/harvest.mjs --agent <agentId> --out $D/tools
//   node tools/course/harvest.mjs --marker <unique text from the agent's prompt> --out $D/tools
//   node tools/course/harvest.mjs --transcript <path.jsonl> --out $D/tools
// Writes <out>/NN-web_search.json / NN-web_fetch.json = {"tool", "input", "output"}, numbering on
// from the files already there and skipping any result (by search_id / extract_id) already saved.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

function arg(name) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : null; }
const out = arg('out');
if (!out || !(arg('agent') || arg('transcript') || arg('marker'))) { console.error('usage: harvest.mjs (--agent <id> | --marker <text> | --transcript <file>) --out <dir>'); process.exit(2); }

function find(dir, name) {
  let hit = null;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) hit = hit || find(p, name);
    else if (e.name === name) hit = p;
    if (hit) return hit;
  }
  return null;
}
// --marker: the newest agent transcript whose first message contains this text, so a research agent
// whose prompt carries a unique marker can harvest its own run before it finishes.
function byMarker(dir, marker, best) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { best = byMarker(p, marker, best); continue; }
    if (!/^agent-.*\.jsonl$/.test(e.name)) continue;
    const fd = openSync(p, 'r'), buf = Buffer.alloc(65536), got = readSync(fd, buf, 0, buf.length, 0); closeSync(fd);
    const first = buf.toString('utf8', 0, got).split('\n', 1)[0];
    if (first.includes(marker) && (!best || statSync(p).mtimeMs > statSync(best).mtimeMs)) best = p;
  }
  return best;
}
const projects = join(homedir(), '.claude', 'projects');
const file = arg('transcript') || (arg('marker') ? byMarker(projects, arg('marker'), null) : find(projects, 'agent-' + arg('agent') + '.jsonl'));
if (!file || !existsSync(file)) { console.error('no transcript found for ' + (arg('agent') || arg('marker') || arg('transcript'))); process.exit(1); }

// A result's text: inline, as text blocks, or (when large) in the file a persisted-output note names.
function text(content) {
  let s = typeof content === 'string' ? content : Array.isArray(content) ? content.filter((b) => b && b.type === 'text').map((b) => b.text).join('') : '';
  const m = /^<persisted-output>[\s\S]*?saved to: (\S+)/.exec(s);
  if (m) s = readFileSync(m[1], 'utf8');
  return s;
}
const idOf = (o) => (o && (o.search_id || o.extract_id)) || null;

mkdirSync(out, { recursive: true });
const have = new Set(), names = readdirSync(out).filter((f) => /^\d+-.*\.json$/.test(f));
for (const f of names) { try { const id = idOf(JSON.parse(readFileSync(join(out, f), 'utf8')).output); if (id) have.add(id); } catch (e) { /* not a tool file */ } }
let n = names.reduce((a, f) => Math.max(a, parseInt(f, 10)), 0);

const uses = new Map(), saved = [], skipped = [];
for (const line of readFileSync(file, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  let o; try { o = JSON.parse(line); } catch (e) { continue; }
  const content = o.message && Array.isArray(o.message.content) ? o.message.content : [];
  for (const b of content) {
    if (b.type === 'tool_use' && /Parallel_Search__web_(search|fetch)$/.test(b.name)) uses.set(b.id, { tool: b.name.split('__').pop(), input: b.input });
    if (b.type !== 'tool_result' || !uses.has(b.tool_use_id)) continue;
    const u = uses.get(b.tool_use_id);
    if (b.is_error) { skipped.push(u.tool + ': error result'); continue; }
    let output; try { output = JSON.parse(text(b.content)); } catch (e) { skipped.push(u.tool + ': result is not JSON'); continue; }
    const id = idOf(output);
    if (id && have.has(id)) { skipped.push(u.tool + ': ' + id + ' already saved'); continue; }
    if (id) have.add(id);
    const input = { ...u.input }; delete input.model_name; delete input.session_id;
    const name = String(++n).padStart(2, '0') + '-' + u.tool + '.json';
    writeFileSync(join(out, name), JSON.stringify({ tool: u.tool, input, output }) + '\n');
    saved.push(name + '  ' + (output.results || []).length + ' results  ' + (input.objective || (input.urls || []).join(' ')).slice(0, 70));
  }
}
console.log('transcript ' + file + ' (' + Math.round(statSync(file).size / 1024) + ' KB)');
console.log('saved ' + saved.length + (saved.length ? ':\n  ' + saved.join('\n  ') : ''));
if (skipped.length) console.log('skipped ' + skipped.length + ':\n  ' + skipped.join('\n  '));
if (!saved.length && !have.size) process.exit(1);
