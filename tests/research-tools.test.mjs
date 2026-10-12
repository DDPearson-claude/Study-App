// Tests for the research tooling: tools/course/harvest.mjs (search results saved verbatim from an
// agent transcript) and tools/eval/sources.mjs --quotes (a brief's quotes checked the app's way).
// Run: node --test tests/research-tools.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = (script, args) => spawnSync(process.execPath, [join(root, script), ...args], { encoding: 'utf8' });

const PAGE = 'https://www.bbc.co.uk/bitesize/articles/ratio';
const search = { search_id: 'search_abc', results: [{ url: PAGE, title: 'Ratio - BBC Bitesize', publish_date: '2024-01-01', excerpts: ['A ratio compares two or more quantities. To simplify a ratio, divide each part by the same number.'] }] };
const fetched = { extract_id: 'extract_def', results: [{ url: 'https://example.org/gears', title: 'Gears', excerpts: ['A gear ratio of 3:1 turns the output once for every three turns of the input.'] }] };

function transcript(dir, persistedDir) {
  // Line shapes as Claude Code writes them: tool_use in an assistant message, tool_result in a user one.
  const big = join(persistedDir, 'big.txt');
  writeFileSync(big, JSON.stringify(fetched, null, 1));
  const lines = [
    { type: 'user', message: { role: 'user', content: 'RESEARCH-RUN test-marker\nFind sources.' } },
    { type: 'assistant', message: { role: 'assistant', content: [
      { type: 'tool_use', id: 't1', name: 'mcp__Parallel_Search__web_search', input: { objective: 'ratio', search_queries: ['ratio'], model_name: 'm', session_id: 's' } },
      { type: 'tool_use', id: 't2', name: 'mcp__Parallel_Search__web_fetch', input: { urls: ['https://example.org/gears'], objective: 'gears' } },
      { type: 'tool_use', id: 't3', name: 'mcp__Parallel_Search__web_search', input: { objective: 'broken' } },
      { type: 'tool_use', id: 't4', name: 'Bash', input: { command: 'ls' } }] } },
    { type: 'user', message: { role: 'user', content: [
      { type: 'tool_result', tool_use_id: 't1', content: JSON.stringify(search) },
      { type: 'tool_result', tool_use_id: 't2', content: '<persisted-output>\nOutput too large (40KB). Full output saved to: ' + big + '\n\nPreview (first 2KB):\n{' },
      { type: 'tool_result', tool_use_id: 't3', is_error: true, content: 'rate limited' },
      { type: 'tool_result', tool_use_id: 't4', content: JSON.stringify({ search_id: 'not-a-search' }) }] } },
  ];
  const f = join(dir, 'agent-test.jsonl');
  writeFileSync(f, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  return f;
}

test('harvest saves each search and fetch verbatim, once', () => {
  const dir = mkdtempSync(join(tmpdir(), 'harvest-'));
  const out = join(dir, 'tools');
  const f = transcript(dir, dir);
  const r = run('tools/course/harvest.mjs', ['--transcript', f, '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(readdirSync(out).sort(), ['01-web_search.json', '02-web_fetch.json']);
  const a = JSON.parse(readFileSync(join(out, '01-web_search.json'), 'utf8'));
  assert.deepEqual(a, { tool: 'web_search', input: { objective: 'ratio', search_queries: ['ratio'] }, output: search });
  const b = JSON.parse(readFileSync(join(out, '02-web_fetch.json'), 'utf8'));
  assert.deepEqual(b.output, fetched, 'a persisted (large) result is read from its saved file');
  assert.match(r.stdout, /skipped 1/);
  // Running again adds nothing.
  const again = run('tools/course/harvest.mjs', ['--transcript', f, '--out', out]);
  assert.equal(again.status, 0);
  assert.equal(readdirSync(out).length, 2);
  assert.match(again.stdout, /saved 0/);
});

test('sources --quotes passes quotes on the page and fails the rest', () => {
  const dir = mkdtempSync(join(tmpdir(), 'quotes-'));
  const tools = join(dir, 'tools'); mkdirSync(tools);
  writeFileSync(join(tools, '01-web_search.json'), JSON.stringify({ tool: 'web_search', input: {}, output: search }));
  const q = join(dir, 'quotes.json');
  writeFileSync(q, JSON.stringify([
    { title: 'Ratio', url: PAGE, quote: 'To simplify a ratio, divide each part by the same number.' },
    { title: 'Ratio', url: PAGE, quote: 'To simplify a ratio, add the same number to each part.' },
    { title: 'Elsewhere', url: 'https://example.com/other', quote: 'A ratio compares two or more quantities.' },
  ]));
  const r = run('tools/eval/sources.mjs', ['--quotes', q, '--tools', tools]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FAIL 2 .*quote not found on that page/);
  assert.match(r.stdout, /FAIL 3 .*not a page the tools returned/);
  assert.match(r.stdout, /"ok":1,"failed":2/);
});

test('harvest --marker finds a workflow agent whose prompt follows a relayed request', () => {
  const dir = mkdtempSync(join(tmpdir(), 'harvest-wf-'));
  const f = transcript(dir, dir);
  const lines = readFileSync(f, 'utf8').trim().split('\n');
  const relay = JSON.stringify({ type: 'user', message: { role: 'user', content: '[Workflow harness] the user asked for a build' } });
  // A fake home whose projects folder holds only this transcript, nested as workflow agents are.
  const home = join(dir, 'home'), wf = join(home, '.claude', 'projects', 'p', 's', 'subagents', 'workflows', 'wf_x');
  mkdirSync(wf, { recursive: true });
  writeFileSync(join(wf, 'agent-wf.jsonl'), [relay].concat(lines).join('\n') + '\n');
  const out = join(dir, 'tools');
  const r = spawnSync(process.execPath, [join(root, 'tools/course/harvest.mjs'), '--marker', 'RESEARCH-RUN test-marker', '--out', out], { encoding: 'utf8', env: { ...process.env, HOME: home } });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(readdirSync(out).length, 2);
});
