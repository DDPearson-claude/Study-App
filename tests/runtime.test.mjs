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
  const sj = JSON.parse(s);
  assert.ok(s.length <= 12000, 'search fits in 12 KB (' + s.length + ')');
  assert.ok(sj.results.length >= 30, 'most results kept (' + sj.results.length + '); their text is shortened instead');
  assert.ok(sj.results.every((r, i) => r.url === 'https://example.org/page-' + i && r.excerpts[0].startsWith('Verbatim text from page ' + i)), 'kept in rank order, each excerpt keeps its start');
  assert.ok(sj.results[sj.results.length - 1].excerpts[0].endsWith(' …'), 'the lowest-ranked are shortened first, the cut marked');
  const f = await fetch.execute({ urls: ['https://example.org/page-0'] });
  assert.ok(f.length <= 20000 && JSON.parse(f).results[0].excerpts[0].endsWith(' …'), 'fetch fits in 20 KB as valid JSON');
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

test('research tools: markdown links in excerpts become plain text and are not results', async () => {
  const page = { url: 'https://www.grc.nasa.gov/www/k-12/airplane/brayton.html', title: 'Brayton Cycle', excerpts: ['we must study the basic thermodynamics of [gases](https://www.grc.nasa.gov/www/k-12/airplane/state.html) .\nGases have **p** and ![a figure](https://x.org/f.png) [T](https://e.org/a_(b))'] };
  const mcp = fakeMcp({ web_search: () => ({ results: [page] }), web_fetch: (inp) => ({ results: inp.urls.map((u) => ({ url: u, excerpts: ['ok'] })) }) });
  const U = boot({ mcp });
  const [search, fetch] = await U.research.tools();
  const r = JSON.parse(await search.execute({ objective: 'o', search_queries: ['brayton cycle efficiency'] }));
  assert.equal(r.results[0].excerpts[0], 'we must study the basic thermodynamics of gases .\nGases have p and a figure T');
  assert.match(await fetch.execute({ urls: ['https://www.grc.nasa.gov/www/k-12/airplane/state.html'] }), /^Tool error \(refused\): /, 'a page only linked from an excerpt is not a result');
  assert.ok(!/^Tool error/.test(await fetch.execute({ urls: [page.url] })), 'the result itself can be opened');
});

test('research tools: a runaway loop meets the budget (10 searches, 6 fetches by default)', async () => {
  const mcp = fakeMcp({ web_search: () => searchPayload(2), web_fetch: (inp) => ({ results: inp.urls.map((u) => ({ url: u, excerpts: ['ok'] })) }) });
  const U = boot({ mcp });
  const [search, fetch] = await U.research.tools();
  for (let i = 0; i < 10; i++) assert.ok(!/^Tool error/.test(await search.execute({ objective: 'o', search_queries: ['a b c ' + i] })));
  assert.match(await search.execute({ objective: 'o', search_queries: ['one more'] }), /^Tool error \(budget\): /);
  for (let i = 0; i < 6; i++) assert.ok(!/^Tool error/.test(await fetch.execute({ urls: ['https://example.org/page-0'] })));
  assert.match(await fetch.execute({ urls: ['https://example.org/page-1'] }), /^Tool error \(budget\): /);
  assert.equal(mcp.calls.length, 16, 'calls over the budget never reach the connector');
  const [s2] = await U.research.tools(null, { budget: { web_search: 1 } });
  await s2.execute({ objective: 'o', search_queries: ['a b c'] });
  assert.match(await s2.execute({ objective: 'o', search_queries: ['a b d'] }), /^Tool error \(budget\): /, 'a caller can set its own budget');
});

test('research tools: fitting to size keeps the best-ranked results whole', async () => {
  const mcp = fakeMcp({ web_search: () => searchPayload(8, 2500), web_fetch: () => ({ results: [] }) });
  const U = boot({ mcp });
  const [search] = await U.research.tools();
  const r = JSON.parse(await search.execute({ objective: 'o', search_queries: ['a b c'] }));
  assert.equal(r.results.length, 8, 'nothing dropped when shortening the tail is enough');
  assert.ok(!r.results[0].excerpts[0].endsWith(' …') && r.results[0].excerpts[0].length > 2500, 'the top result is whole');
  assert.ok(r.results[7].excerpts[0].endsWith(' …'), 'the last is shortened');
});

test('research tools: rate limits, failures and connector errors that arrive as text', async () => {
  let n = 0;
  const limited = 'Error POSTing to endpoint: event: message\ndata: {"error":{"code":-32000,"message":"You\'ve hit the free-tier rate limit for Parallel Search MCP."}}';
  const mcp = fakeMcp({ web_search: () => (++n === 1 ? limited : searchPayload(1)), web_fetch: () => { throw { code: 'tool_error', message: 'boom' }; } });
  let U = boot({ mcp });
  let [search] = await U.research.tools(null, { patient: [5] });
  const r = await search.execute({ objective: 'o', search_queries: ['a b c'] });
  assert.ok(JSON.parse(r).results.length === 1 && mcp.calls.length === 2, 'patient research waits out a rate limit and retries');
  n = 0;
  [search] = await U.research.tools();
  const busy = await search.execute({ objective: 'o', search_queries: ['a b c'] });
  assert.match(busy, /^Tool error \(rate_limited\): the search service is busy/, 'Dan never waits: a plain message, no connector text');
  assert.ok(!/api key/i.test(busy));
  const tools = await U.research.tools(null, { budget: { web_search: 1 } });
  n = 0;
  assert.match(await tools[0].execute({ objective: 'o', search_queries: ['a'] }), /^Tool error \(rate_limited\)/);
  assert.ok(!/^Tool error/.test(await tools[0].execute({ objective: 'o', search_queries: ['a'] })), 'a failed call does not use up the budget');
  // Four failures and the tools stop calling the connector.
  U = boot({ mcp: fakeMcp({ web_search: () => searchPayload(1), web_fetch: () => { throw { code: 'tool_error', message: 'boom' }; } }) });
  const [s2, f2] = await U.research.tools();
  await s2.execute({ objective: 'o', search_queries: ['a'] });
  for (let i = 0; i < 4; i++) assert.match(await f2.execute({ urls: ['https://example.org/page-0'] }), /^Tool error \(tool_error\)/);
  assert.match(await f2.execute({ urls: ['https://example.org/page-0'] }), /^Tool error \(unavailable\)/);
});

// A schema's problems may name some as soft (length limits, 30-prompts.js): problems.soft.
function problemsOf(hard, soft) { const l = [...hard, ...soft]; l.soft = soft.slice(); return l; }
// replies: objects (sent as JSON), strings (sent as they are) or {code} errors, one per call.
function scripted(replies) {
  const seen = [];
  const sample = (input) => {
    seen.push(input);
    const r = replies[seen.length - 1];
    if (r && r.code) return Promise.reject(r);
    return Promise.resolve({ text: typeof r === 'string' ? r : JSON.stringify(r) });
  };
  return { sample, seen };
}
// The test schema: a reply {soft, hard} has that many soft and hard problems.
const schema = (d) => problemsOf(Array.from({ length: d.hard || 0 }, (_, i) => 'hard problem ' + i), Array.from({ length: d.soft || 0 }, (_, i) => 'text ' + i + ' is too long'));

test('ask: the repair message lists hard problems before soft ones, even past twelve', async () => {
  const s = scripted([{ id: 1, soft: 20, hard: 1 }, { id: 2 }]);
  const U = boot({ sample: s.sample });
  // A validator that reports the long text first, as vLesson does when the lengths come earlier.
  const softFirst = (d) => { const l = schema(d); const out = [...l.soft, ...l.filter((p) => !l.soft.includes(p))]; out.soft = l.soft; return out; };
  assert.equal((await U.ask('TASK: x', { json: true, schema: softFirst })).id, 2);
  const repair = s.seen[1];
  const last = Array.isArray(repair) ? repair[repair.length - 1].content : String(repair);
  const lines = last.split('\n').filter((l) => l.startsWith('- '));
  assert.equal(lines.length, 12, 'twelve problems listed');
  assert.equal(lines[0], '- hard problem 0', 'the hard problem comes first: ' + lines.slice(0, 2).join(' | '));
});

test('ask: soft problems get one repair, then the reply is accepted as it is; hard ones still fail', async () => {
  // Soft only, then soft only after the repair: accepted, with a warning event, nothing thrown.
  let s = scripted([{ id: 1, soft: 1 }, { id: 2, soft: 1 }]);
  let U = boot({ sample: s.sample });
  const events = [];
  U.on('ask-soft', (d) => events.push(d));
  const warn = console.warn; const warned = []; console.warn = (...a) => warned.push(a.join(' '));
  try {
    assert.equal((await U.ask('TASK: x', { json: true, schema, label: 'x' })).id, 2);
  } finally { console.warn = warn; }
  assert.equal(s.seen.length, 2, 'one repair');
  assert.match(s.seen[1][2].content, /text 0 is too long/, 'the repair lists the soft problem, asking for a cut');
  assert.equal(events.length, 1);
  assert.equal(events[0].label, 'x');
  assert.ok(warned.some((w) => /accepted with only length problems left/.test(w)));

  // Hard, then soft only: accepted.
  s = scripted([{ id: 1, hard: 1 }, { id: 2, soft: 2 }]);
  U = boot({ sample: s.sample });
  assert.equal((await U.ask('TASK: x', { json: true, schema })).id, 2);

  // Soft only, then the repair breaks something: the first reply is kept.
  s = scripted([{ id: 1, soft: 1 }, { id: 2, hard: 1 }]);
  U = boot({ sample: s.sample });
  assert.equal((await U.ask('TASK: x', { json: true, schema })).id, 1);
  s = scripted([{ id: 1, soft: 1 }, 'Sorry, here is some prose.']);
  U = boot({ sample: s.sample });
  assert.equal((await U.ask('TASK: x', { json: true, schema })).id, 1, 'also when the repair is not JSON');

  // Soft only, then the repair cannot be had (busy): the first reply stands. Cancelled is still cancelled.
  s = scripted([{ id: 1, soft: 1 }, { code: 'rate_limited', message: 'busy' }]);
  U = boot({ sample: s.sample });
  assert.equal((await U.ask('TASK: x', { json: true, schema })).id, 1);
  s = scripted([{ id: 1, soft: 1 }, { code: 'cancelled', message: 'Stopped.' }]);
  U = boot({ sample: s.sample });
  await assert.rejects(U.ask('TASK: x', { json: true, schema }), (e) => e.code === 'cancelled');

  // Hard after the repair: rejects invalid, naming the hard problem first.
  s = scripted([{ id: 1, hard: 1, soft: 1 }, { id: 2, hard: 1, soft: 1 }]);
  U = boot({ sample: s.sample });
  await assert.rejects(U.ask('TASK: x', { json: true, schema }), (e) => e.code === 'invalid' && /hard problem 0/.test(e.message) && !/too long/.test(e.message) && !/shape/.test(e.message));
  assert.equal(s.seen.length, 2);

  // A schema that marks nothing soft (plain arrays) behaves as before: one repair, then invalid.
  s = scripted([{ id: 1 }, { id: 2 }]);
  U = boot({ sample: s.sample });
  await assert.rejects(U.ask('TASK: x', { json: true, schema: () => ['too long'] }), (e) => e.code === 'invalid');
  assert.equal(s.seen.length, 2);
});
