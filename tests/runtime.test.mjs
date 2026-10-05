// Unit tests for the runtime layer (app/src/js/10-runtime.js) with a fake Parallel Search
// connector shaped like the real one: U.research tools (session id, trimming, the web_fetch
// allow-list and its error texts) and the U.ask priority gate.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const src = (f) => readFileSync(new URL('../app/src/js/' + f, import.meta.url), 'utf8');

function boot({ mcp = null, sample = null } = {}) {
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, crypto: globalThis.crypto });
  vm.runInContext('var window = globalThis;', ctx);
  for (const f of ['00-core.js', '10-runtime.js']) vm.runInContext(src(f), ctx, { filename: f });
  const U = ctx.U;
  U.rt.mcp = mcp;
  U.rt.sample = sample;
  return U;
}

// A web_search payload in the real connector's shape.
function searchPayload(n, excerptChars = 200) {
  return {
    search_id: 'search_abc123',
    results: Array.from({ length: n }, (_, i) => ({
      url: 'https://example.org/page-' + i,
      title: 'Page ' + i,
      publish_date: '2025-01-0' + ((i % 9) + 1),
      excerpts: ['Verbatim text from page ' + i + '. ' + 'x'.repeat(excerptChars)],
    })),
    warnings: null,
    session_id: 'server-side',
  };
}

function fakeMcp(payloads) {
  const calls = [];
  return {
    calls,
    listTools: () => Promise.resolve({ servers: [{ name: 'Parallel Search', authStatus: 'connected', tools: [{ name: 'web_search' }, { name: 'web_fetch' }] }] }),
    describeTool: () => Promise.reject({ code: 'bad_request' }),
    callTool: (server, tool, input) => { calls.push({ server, tool, input: JSON.parse(JSON.stringify(input)) }); return Promise.resolve({ payload: payloads[tool](input) }); },
  };
}

test('research tools: session id on every call, result urls opened, refusals carry an error code', async () => {
  const mcp = fakeMcp({ web_search: () => searchPayload(3), web_fetch: (inp) => ({ results: inp.urls.map((u) => ({ url: u, excerpts: ['quote'] })) }) });
  const U = boot({ mcp });
  assert.match(U.research.SESSION, /^mu-[0-9a-f]{32}$/);
  assert.equal(await U.research.available(), true);
  const [search, fetch] = await U.research.tools();
  assert.deepEqual([...search.inputSchema.required], ['objective', 'search_queries']);
  assert.deepEqual([...fetch.inputSchema.required], ['urls']);

  const out = await search.execute({ objective: 'How tides work', search_queries: ['moon tides gravity', 'two tidal bulges'] });
  assert.equal(mcp.calls[0].input.session_id, U.research.SESSION, 'session id added');
  assert.equal(mcp.calls[0].input.model_name, undefined, 'model_name left unset');
  assert.ok(JSON.parse(out).results.length === 3, 'payload passed through as text');

  // A page from the results can be opened; the same session id goes with it.
  const f1 = await fetch.execute({ urls: ['https://example.org/page-1/'] });
  assert.match(f1, /quote/);
  assert.equal(mcp.calls[1].input.session_id, U.research.SESSION);
  // A session id Claude passes itself is kept.
  await search.execute({ objective: 'x', search_queries: ['a b c'], session_id: 'mine' });
  assert.equal(mcp.calls[2].input.session_id, 'mine');

  // Addresses not returned by a search are refused, with an error code 31-generate.js skips.
  const refused = await fetch.execute({ urls: ['https://evil.example/collect?q=dan'] });
  assert.match(refused, /^Tool error \(refused\): /);
  const empty = await fetch.execute({ urls: [] });
  assert.match(empty, /^Tool error \(bad_request\): /);
  assert.equal(mcp.calls.length, 3, 'refused calls never reach the connector');
});

test('research tools: big results are trimmed (search 12 KB, fetch 20 KB); connector errors come back as text', async () => {
  const mcp = fakeMcp({ web_search: () => searchPayload(40, 800), web_fetch: () => ({ results: [{ url: 'https://example.org/page-0', excerpts: ['y'.repeat(50000)] }] }) });
  const U = boot({ mcp });
  const [search, fetch] = await U.research.tools();
  const s = await search.execute({ objective: 'o', search_queries: ['a b c'] });
  assert.ok(s.length <= 12000 + 20 && s.endsWith('…[trimmed]'), 'search trimmed to 12 KB');
  const f = await fetch.execute({ urls: ['https://example.org/page-0'] });
  assert.ok(f.length <= 20000 + 20 && f.endsWith('…[trimmed]'), 'fetch trimmed to 20 KB');
  mcp.callTool = () => Promise.reject({ code: 'rate_limited', message: 'slow down' });
  assert.match(await search.execute({ objective: 'o', search_queries: ['a b c'] }), /^Tool error \(rate_limited\): /);
});

test('ask: background calls run one at a time, after foreground ones, and can be cancelled or promoted', async () => {
  const log = [];
  const pending = [];
  const sample = (input) => new Promise((res) => { log.push('start ' + input); pending.push(() => { log.push('end ' + input); res({ text: input }); }); });
  const U = boot({ sample });
  const fg = U.ask('fg1');
  const bg1 = U.ask('bg1', { priority: 'background' });
  const ctl = new AbortController();
  const bg2 = U.ask('bg2', { priority: 'background', signal: ctl.signal });
  const bg3 = U.ask('bg3 lesson', { priority: 'background', label: 'write-lesson' });
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(log, ['start fg1'], 'background waits while a foreground call runs');
  ctl.abort();
  await assert.rejects(bg2, (e) => e.code === 'cancelled', 'a waiting background call is cancelled by its signal');
  assert.equal(U._gate.promote((input, o) => o.label === 'write-lesson'), 1, 'promoted');
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(log, ['start fg1', 'start bg3 lesson'], 'a promoted call runs at once');
  pending.shift()(); await fg;
  pending.shift()(); await bg3;
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(log.slice(-1), ['start bg1'], 'then the background queue moves');
  pending.shift()(); assert.equal(await bg1, 'bg1');
});

test('ask: rate limits are not retried; a transient upstream error is retried once', async () => {
  let n = 0;
  const U = boot({ sample: () => { n++; return Promise.reject({ code: 'rate_limited' }); } });
  await assert.rejects(U.ask('x'), (e) => e.code === 'rate_limited');
  assert.equal(n, 1);
  let m = 0;
  const U2 = boot({ sample: () => (++m === 1 ? Promise.reject({ code: 'upstream_error' }) : Promise.resolve({ text: 'ok' })) });
  U2.sleep = () => Promise.resolve();
  assert.equal(await U2.ask('y'), 'ok');
  assert.equal(m, 2);
});
