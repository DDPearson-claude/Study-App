// Perf/reliability harness for docs/review/performance.md.
// A node-backed stand-in for the claude.ai runtime (rt-stub.js): ONE db shared by every tab/device,
// with injectable latency / 'unavailable' / hangs and live snapshot delivery between tabs; a sample
// scheduler that mimics the contract (2 calls at once, 4 more queued, beyond that rate_limited);
// a gzip server so CDP network throttling applies; CDP CPU throttling.
//
//   node tools/build.mjs                      # the scripts serve dist/my-university.html (or $PERF_APP)
//   node docs/review/perf/s1-paint.mjs phone  # first useful paint (profiles: desktop, phone, phone+fonts)
//   node docs/review/perf/s1b-fonthang.mjs    # a stalled Google Fonts stylesheet
//   node docs/review/perf/s2-leak.mjs via-topic|tutor   # 20 lesson navigations: heap, nodes, listeners, iframes, subs
//   node docs/review/perf/s3-sample.mjs mcp|nomcp       # every sample call one new topic + lesson fires
//   node docs/review/perf/s4-failures.mjs <claude-slow|rate-limited|not-granted|no-sample|upstream|db-hang|db-unavail|db-midlesson|db-slow>
//   node docs/review/perf/s5-background.mjs selftest|takeover   # page suspended mid-generation
//   node docs/review/perf/s6-twotabs.mjs race|cards    # two devices / two tabs on one topic
//   node docs/review/perf/s7-review.mjs 30 | s8-peek.mjs | s9-selftest-cost.mjs | s10-screens.mjs 40
// Results land in tests/out/perf/*.json. Fixtures are frozen copies (./fixtures) from commit 54d1616.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import zlib from 'node:zlib';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, '..', '..', '..');
export const OUT = join(ROOT, 'tests', 'out', 'perf');
mkdirSync(OUT, { recursive: true });
const fx = (n) => JSON.parse(readFileSync(join(HERE, 'fixtures', n), 'utf8'));
export const FX = {
  planJet: fx('plan-jet-engines.json'), researchJet: fx('research-jet-engines.json'),
  jet1: fx('lesson-jet-engines-i1.json'),
  pendTopic: fx('lesson-ui-topic.json'), pendulum: fx('lesson-ui-pendulum.json'),
  clocks: fx('lesson-ui-clocks.json'), small: fx('lesson-ui-small-swings.json'),
};
export const SKATER = readFileSync(join(HERE, 'skater.html'), 'utf8');
export const UID = 'u_stubuser0000000000000000';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function taskOf(input) {
  const text = typeof input === 'string' ? input : Array.isArray(input) ? (input.find((t) => t.role === 'user') || {}).content || '' : '';
  const m = String(text).match(/^TASK:\s*([a-z-]+)/m);
  return m ? m[1] : 'unknown';
}
function ideaOf(input) {
  const text = typeof input === 'string' ? input : Array.isArray(input) ? input.map((t) => t.content).join('\n') : '';
  const m = String(text).match(/^Idea (i\d+):/m) || String(text).match(/Idea (i\d+):/);
  return m ? m[1] : 'i1';
}
const unsourced = (l) => { const o = JSON.parse(JSON.stringify(l).replace(/\s?\[\^\d+\]/g, '')); o.sources = []; if (o.interactive && o.interactive.numbers) o.interactive.numbers.forEach((n) => delete n.source); return o; };

export function defaultReply(task, input) {
  if (task === 'plan-topic') { const p = FX.planJet; return { title: p.title, hook: p.hook, oneBreath: p.oneBreath, ideas: p.ideas, calibration: p.calibration }; }
  if (task === 'research') return FX.researchJet;
  if (task === 'write-lesson') { const l = unsourced(FX.jet1); l.iid = ideaOf(input); return l; }
  if (task === 'build-interactive' || task === 'repair-interactive') return SKATER;
  if (task === 'grade') return { met: [true, false, false], verdict: 'partly', nailed: 'You have the main point.', followUp: 'How much slower is it?' };
  if (task === 'tutor') return 'Because the bob has further to go while gravity pulls just as hard. '.repeat(12);
  return 'ok';
}

// ---------------- world: shared db + sample scheduler ----------------
export function createWorld(o = {}) {
  const W = {
    t0: Date.now(),
    store: new Map(), subs: new Map(), leases: new Map(),
    db: { latency: o.dbLatency ?? 100, pushMs: o.dbPushMs ?? null, mode: 'ok', failOps: null, slowFirst: 0 },
    counts: {}, subsByLabel: {}, maxSubsByLabel: {}, writesByPath: {},
    sample: { slots: o.slots ?? 2, queueMax: o.queueMax ?? 4, running: 0, queue: [], log: [], mode: 'ok', lat: Object.assign({ quick: 2000, default: 12000, complex: 20000 }, o.sampleLat || {}), taskLat: o.taskLat || {}, reply: o.reply || defaultReply },
    mcp: !!o.mcp, pages: new Set(), events: [],
  };
  W.now = () => Date.now() - W.t0;
  W.ev = (e) => { e.t = W.now(); W.events.push(e); };
  (o.seed ? Object.entries(o.seed) : []).forEach(([p, d]) => W.store.set(p, { data: JSON.parse(JSON.stringify(d)), version: 1 }));
  return W;
}
const parentOf = (p) => p.split('/').slice(0, -1).join('/');
const idOf = (p) => p.split('/').pop();
function getField(o, f) { return f.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o); }
function runQuery(W, coll, q) {
  let docs = [...W.store.keys()].filter((p) => parentOf(p) === coll);
  docs = docs.filter((p) => (q.where || []).every(([f, op, v]) => { const x = getField(W.store.get(p).data, f); return op === '==' ? x === v : op === '!=' ? x !== v : op === '<' ? x < v : op === '>' ? x > v : op === '<=' ? x <= v : op === '>=' ? x >= v : true; }));
  docs.sort((a, b) => {
    if (q.order) { const av = getField(W.store.get(a).data, q.order.field), bv = getField(W.store.get(b).data, q.order.field); if (av !== bv) { const c = av < bv ? -1 : 1; return q.order.dir === 'desc' ? -c : c; } }
    return idOf(a) < idOf(b) ? -1 : 1;
  });
  if (q.limit) docs = docs.slice(0, q.limit);
  return docs.map((p) => ({ id: idOf(p), exists: true, data: W.store.get(p).data }));
}
function snap(W, p) { const r = W.store.get(p); return { id: idOf(p), exists: !!r, data: r ? r.data : undefined }; }
function merge(t, s) { for (const k of Object.keys(s)) { const v = s[k]; if (v && typeof v === 'object' && !Array.isArray(v) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) merge(t[k], v); else t[k] = JSON.parse(JSON.stringify(v)); } return t; }
function deliver(W, sub, payload) {
  const delay = W.db.pushMs ?? W.db.latency;
  setTimeout(() => {
    if (!W.subs.has(sub.id)) return;
    sub.page.evaluate(([id, kind, pl]) => window.__rtDeliver(id, kind, pl), [sub.id, sub.kind, payload]).catch(() => {});
  }, delay);
}
function notify(W, path) {
  const coll = parentOf(path);
  for (const sub of W.subs.values()) {
    if (sub.kind === 'doc' && sub.path === path) deliver(W, sub, snap(W, path));
    else if (sub.kind === 'query' && sub.coll === coll) deliver(W, sub, runQuery(W, sub.coll, sub.q));
  }
}
function write(W, path, data, label) {
  const r = W.store.get(path);
  W.store.set(path, { data, version: r ? r.version + 1 : 1 });
  W.writesByPath[path] = (W.writesByPath[path] || 0) + 1;
  notify(W, path);
}
async function dbOp(W, page, label, op, a) {
  W.counts[op] = (W.counts[op] || 0) + 1;
  W.counts[label + ':' + op] = (W.counts[label + ':' + op] || 0) + 1;
  if (op === 'unsub') {
    const s = W.subs.get(a.id);
    if (s) { W.subs.delete(a.id); W.subsByLabel[s.label]--; }
    return { ok: null };
  }
  if (op === 'sub') {
    const sub = { id: a.id, kind: a.kind, path: a.path, coll: a.coll, q: a.q || {}, page, label, at: W.now() };
    W.subs.set(a.id, sub);
    W.subsByLabel[label] = (W.subsByLabel[label] || 0) + 1;
    W.maxSubsByLabel[label] = Math.max(W.maxSubsByLabel[label] || 0, W.subsByLabel[label]);
    if (W.subsByLabel[label] > 64) { W.subs.delete(a.id); W.subsByLabel[label]--; deliver(W, sub, { err: { code: 'resource_exhausted', message: 'more than 64 subscriptions' } }); return { ok: null }; }
    if (W.db.mode === 'hang') return { ok: null };
    deliver(W, sub, sub.kind === 'doc' ? snap(W, sub.path) : runQuery(W, sub.coll, sub.q));
    return { ok: null };
  }
  if (W.db.mode === 'hang') return new Promise(() => {});
  await sleep(typeof W.db.latency === 'function' ? W.db.latency(op, a) : W.db.latency);
  if (W.db.mode === 'unavailable' && (!W.db.failOps || W.db.failOps.includes(op))) return { err: { code: 'unavailable', message: 'db unavailable (injected)' } };
  switch (op) {
    case 'get': return { ok: snap(W, a.path) };
    case 'query': return { ok: runQuery(W, a.coll, a.q || {}) };
    case 'set': {
      const json = JSON.stringify(a.data);
      if (json.length > 256 * 1024) return { err: { code: 'invalid_argument', message: 'over 256 KiB: ' + json.length } };
      write(W, a.path, JSON.parse(json), label); return { ok: null };
    }
    case 'update': {
      const r = W.store.get(a.path);
      if (!r) return { err: { code: 'invalid_argument', message: 'update on a missing document: ' + a.path } };
      const next = merge(JSON.parse(JSON.stringify(r.data)), a.data);
      if (JSON.stringify(next).length > 256 * 1024) return { err: { code: 'invalid_argument', message: 'over 256 KiB' } };
      write(W, a.path, next, label); return { ok: null };
    }
    case 'delete': if (W.store.delete(a.path)) notify(W, a.path); return { ok: null };
    case 'acquire': {
      const l = W.leases.get(a.path), now = Date.now();
      if (l && l.exp > now && l.holder !== a.o.holder) return { ok: { acquired: false, expiresAt: new Date(l.exp).toISOString() } };
      W.leases.set(a.path, { holder: a.o.holder, exp: now + (a.o.ttlMs || 30000) });
      return { ok: { acquired: true, holder: a.o.holder } };
    }
  }
  return { err: { code: 'invalid_argument', message: 'unknown op ' + op } };
}

// sample scheduler: `slots` run at once, `queueMax` more wait, beyond that rate_limited.
function release(W, entry) {
  if (!entry.holding) return;
  entry.holding = false;
  W.sample.running--;
  const next = W.sample.queue.shift();
  if (next) { next.holding = true; W.sample.running++; next.go(); }
}
async function sampleOp(W, label, a) {
  const S = W.sample, task = taskOf(a.input);
  const e = { id: a.id, label, task, idea: (task === 'write-lesson' || task === 'build-interactive' || task === 'repair-interactive') ? ideaOf(a.input) : null, tier: a.tier, tools: a.tools, cache: a.cache, hasSignal: a.hasSignal, tEnq: W.now(), tRun: null, tEnd: null, outcome: null, chars: JSON.stringify(a.input).length };
  S.log.push(e);
  const mode = typeof S.mode === 'function' ? S.mode(e) : S.mode;
  if (mode === 'not_granted') { await sleep(300); e.outcome = 'not_granted'; e.tEnd = W.now(); return { err: { code: 'not_granted', message: 'declined' } }; }
  if (mode === 'rate_limited') { await sleep(200); e.outcome = 'rate_limited'; e.tEnd = W.now(); return { err: { code: 'rate_limited', message: 'slow down' } }; }
  if (mode === 'upstream_error') { await sleep(1000); e.outcome = 'upstream_error'; e.tEnd = W.now(); return { err: { code: 'upstream_error', message: 'boom' } }; }
  if (S.running >= S.slots && S.queue.length >= S.queueMax) { e.outcome = 'rate_limited'; e.tEnd = W.now(); return { err: { code: 'rate_limited', message: 'too many calls' } }; }
  await new Promise((go) => {
    e.go = go;
    if (S.running < S.slots) { e.holding = true; S.running++; go(); } else S.queue.push(e);
  });
  if (e.aborted) return { err: { code: 'cancelled', message: 'aborted' } };
  e.tRun = W.now();
  const ms = S.taskLat[task] ?? S.lat[a.tier] ?? 10000;
  await new Promise((r) => { e.wake = r; setTimeout(r, ms); });
  release(W, e);
  e.tEnd = W.now();
  if (e.aborted) { e.outcome = 'cancelled'; return { err: { code: 'cancelled', message: 'aborted' } }; }
  if (mode === 'hang') return new Promise(() => {});
  e.outcome = 'ok';
  const out = await S.reply(task, a.input, e);
  if (out && out.__err) { e.outcome = out.__err.code; return { err: out.__err }; }
  return { ok: { text: typeof out === 'string' ? out : JSON.stringify(out), stream: task === 'tutor' } };
}
function sampleAbort(W, a) {
  const e = W.sample.log.find((x) => x.id === a.id);
  if (!e) return;
  e.aborted = true;
  if (!e.tRun) { W.sample.queue = W.sample.queue.filter((x) => x !== e); e.outcome = 'cancelled'; e.tEnd = W.now(); e.go && e.go(); }
  else { release(W, e); e.wake && e.wake(); }
}

// ---------------- server ----------------
let server = null, port = 0;
export async function serve(file = process.env.PERF_APP || join(ROOT, 'dist', 'my-university.html')) {
  if (server) return `http://127.0.0.1:${port}/`;
  const body = readFileSync(file);
  const gz = zlib.gzipSync(body, { level: 6 });
  server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-encoding': 'gzip', 'cache-control': 'no-store' });
    res.end(gz);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
  return `http://127.0.0.1:${port}/`;
}
export function stopServer() { if (server) server.close(); server = null; }

// ---------------- tabs ----------------
export const NET = {
  slow4g: { offline: false, latency: 562.5, downloadThroughput: (1.6 * 1024 * 1024) / 8 * 0.9, uploadThroughput: (750 * 1024) / 8 * 0.9 },
  fast: null,
};
let browser = null;
export async function getBrowser() {
  if (!browser) browser = await chromium.launch({ headless: true, args: ['--disable-features=IsolateSandboxedIframes,site-per-process', '--disable-site-isolation-trials', '--js-flags=--expose-gc'] });
  return browser;
}
export async function closeBrowser() { if (browser) await browser.close(); browser = null; }

const PERF_INIT = `(function(){
  var P = window.__perf = { lt: [], paints: {}, marks: {}, found: {} };
  try { new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ P.lt.push([Math.round(e.startTime), Math.round(e.duration), e.attribution && e.attribution[0] ? e.attribution[0].containerType : '']); }); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  try { new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ P.paints[e.name] = Math.round(e.startTime); }); }).observe({ type: 'paint', buffered: true }); } catch (e) {}
  var watches = [];
  P.watch = function (name, sel) { watches.push([name, sel]); scan(); };
  function scan() {
    for (var i = watches.length - 1; i >= 0; i--) {
      var w = watches[i], el = document.querySelector(w[1]);
      if (el) { watches.splice(i, 1); (function(name){ var t = performance.now(); P.found[name] = Math.round(t); requestAnimationFrame(function(){ setTimeout(function(){ P.marks[name] = Math.round(performance.now()); }, 0); }); })(w[0]); }
    }
  }
  new MutationObserver(function(){ if (watches.length) scan(); }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-state'] });
})();`;

export async function openTab(W, o = {}) {
  const b = await getBrowser();
  const context = o.context || await b.newContext({ viewport: { width: o.width || 360, height: o.height || 707 }, deviceScaleFactor: o.dpr || 3, hasTouch: (o.width || 360) < 700, isMobile: false, colorScheme: 'light' });
  const label = o.label || 'A';
  if (!context.__rtBound) {
    context.__rtBound = true;
    await context.exposeBinding('__rt', async (source, op, json) => {
      const a = JSON.parse(json);
      const lbl = source.page.__label || 'A';
      let r;
      try {
        if (op === 'sample') r = await sampleOp(W, lbl, a);
        else if (op === 'sampleAbort') { sampleAbort(W, a); r = { ok: null }; }
        else if (op === 'mcpList') r = { ok: W.mcp ? { servers: [{ name: 'Parallel Search', authStatus: 'connected', tools: [{ name: 'web_search' }, { name: 'web_fetch' }] }] } : { servers: [] } };
        else if (op === 'mcpCall') { await sleep(1500); r = { ok: { payload: { results: [] }, content: [] } }; }
        else r = await dbOp(W, source.page, lbl, op, a);
      } catch (e) { r = { err: { code: 'unavailable', message: String(e && e.message || e) } }; }
      return JSON.stringify(r);
    });
    // Web fonts: by default answered after `fontMs` with an empty stylesheet (fonts can't load here).
    await context.route(/fonts\.(googleapis|gstatic)\.com/, async (r) => {
      const ms = context.__fontMs ?? -1;
      if (ms < 0) return r.abort();
      await sleep(ms);
      try { await r.fulfill({ status: 200, contentType: 'text/css', body: '/* fonts stub */' }); } catch (e) {}
    });
  }
  if (o.fontMs != null) context.__fontMs = o.fontMs;
  const page = await context.newPage();
  page.__label = label;
  W.pages.add(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + (e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript((c) => { window.__RT_CFG__ = c; }, { label, useMs: o.useMs ?? 60, deny: o.deny || [], mcp: W.mcp, userId: UID });
  await page.addInitScript({ path: join(HERE, 'rt-stub.js') });
  await page.addInitScript(PERF_INIT);
  if (o.watch) await page.addInitScript((list) => { list.forEach((w) => window.__perf.watch(w[0], w[1])); }, o.watch);
  const cdp = await context.newCDPSession(page);
  if (o.cpu) await cdp.send('Emulation.setCPUThrottlingRate', { rate: o.cpu });
  if (o.net) { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', o.net); }
  return { page, context, cdp, errors, label };
}

export async function memory(cdp) {
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.collectGarbage');
  const h = await cdp.send('Runtime.getHeapUsage');
  const d = await cdp.send('Memory.getDOMCounters');
  return { heapMB: +(h.usedSize / 1048576).toFixed(2), documents: d.documents, nodes: d.nodes, listeners: d.jsEventListeners };
}

export function summarizeSamples(W, filter = () => true) {
  const rows = W.sample.log.filter(filter);
  const by = {};
  rows.forEach((e) => { const k = e.task + (e.outcome && e.outcome !== 'ok' ? '(' + e.outcome + ')' : ''); by[k] = (by[k] || 0) + 1; });
  return by;
}
export function save(name, data) { writeFileSync(join(OUT, name + '.json'), JSON.stringify(data, null, 2)); }
