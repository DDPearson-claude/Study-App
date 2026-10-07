// Page frozen (backgrounded) mid-generation, then resumed; with and without a second device.
import { createWorld, openTab, serve, closeBrowser, stopServer, save, sleep, FX, summarizeSamples, defaultReply, getBrowser } from './harness.mjs';
const url = await serve();
const which = process.argv[2];
const PLANNED = () => ({ ['topics/jet']: Object.assign({}, FX.planJet, { id: 'jet', status: 'ready', research: { status: 'unavailable', at: new Date().toISOString(), sources: 0 } }) });
async function screen(page) { return (await page.locator('#view').innerText({ timeout: 2000 }).catch(() => '')).replace(/\s+/g, ' ').slice(0, 220); }
const doc = (W, p) => { const d = W.store.get(p); return d ? { status: d.data.status, hasLesson: !!d.data.lesson, hasInteractive: !!(d.data.interactive && d.data.interactive.html), builtBy: d.data.interactive && d.data.interactive.html ? ((d.data.interactive.html.match(/built by (\w+)/) || [])[1] || '?') : null, by: d.data.by && d.data.by.page, error: d.data.error || null } : null; };
async function scale(page) { await page.waitForFunction(() => window.U && U.gen && U.gen._cfg, null, { timeout: 20000 }); await page.evaluate(() => { U.gen._cfg.STALE_MS = 20000; U.gen._cfg.HEARTBEAT_MS = 4000; }); }

if (!which || which === 'selftest') {
  // Freeze the page 300 ms into the interactive's self-test (as when Dan switches apps while it builds); resume after 15 s.
  const W = createWorld({ seed: PLANNED(), dbLatency: 100, taskLat: { 'write-lesson': 4000, 'build-interactive': 6000, 'repair-interactive': 6000 } });
  const A = await openTab(W, { label: 'A', cpu: 4 });
  let froze = 0;
  await A.page.exposeFunction('__freezeMe', async () => {
    if (froze++) return;
    setTimeout(async () => {
      console.log('freeze at', W.now());
      await A.cdp.send('Debugger.enable'); await A.cdp.send('Debugger.pause');
      setTimeout(async () => { await A.cdp.send('Debugger.resume').catch(() => {}); console.log('resume at', W.now()); }, 15000);
    }, 0);
  });
  await A.page.goto(url + '#/t/jet', { waitUntil: 'commit' });
  await A.page.waitForFunction(() => window.U && U.sandbox && U.sandbox.test, null, { timeout: 20000 });
  await A.page.evaluate(() => {
    const orig = U.sandbox.test;
    window.__testReports = [];
    U.sandbox.test = function (h, o) { const p = orig(h, o); setTimeout(() => window.__freezeMe(), 300); return p.then((r) => { window.__testReports.push({ ok: r.ok, errors: r.errors }); return r; }); };
    location.hash = '#/t/jet/i1';
  });
  const t0 = Date.now();
  while (Date.now() - t0 < 120000) { const d = doc(W, 'topics/jet/lessons/i1'); if (d && (d.status === 'ready' || d.status === 'failed') && Date.now() - t0 > 30000) break; await sleep(500); }
  await sleep(3000);
  const out = { name: 'freeze-during-selftest', samples: summarizeSamples(W), log: W.sample.log.map((e) => [e.task, e.idea, e.tEnq, e.tEnd, e.outcome]), reports: await A.page.evaluate(() => window.__testReports), doc: doc(W, 'topics/jet/lessons/i1'), attempts: (() => { const d = W.store.get('topics/jet/lessons/i1'); return d && d.data.interactive ? d.data.interactive.attempts : null; })(), screen: await screen(A.page), errors: A.errors.slice(0, 3) };
  console.log(JSON.stringify(out, null, 1));
  save('s5-selftest', out);
  await A.context.close();
}

if (!which || which === 'takeover') {
  // Phone (A) is writing lesson i1 and gets frozen (backgrounded) for 45 s. Desktop (B) opens the
  // same lesson while A is frozen. STALE_MS scaled to 20 s, heartbeat to 4 s.
  // Each device's interactive is tagged, so the final doc shows whose result won.
  const W = createWorld({ seed: PLANNED(), dbLatency: 150, taskLat: { 'write-lesson': 8000, 'build-interactive': 25000, 'repair-interactive': 25000 },
    reply: (task, input, e) => (task === 'build-interactive' || task === 'repair-interactive') ? defaultReply(task, input).replace('<div class="sk">', '<p class="built-by">built by ' + e.label + '</p><div class="sk">') : defaultReply(task, input) });
  const A = await openTab(W, { label: 'phone' });
  const b = await getBrowser();
  const ctxB = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const B = await openTab(W, { label: 'desktop', context: ctxB, width: 1280 });
  await A.page.goto(url + '#/t/jet', { waitUntil: 'commit' }); await scale(A.page);
  await B.page.goto(url + '#/t/jet', { waitUntil: 'commit' }); await scale(B.page);
  await A.page.evaluate(() => { location.hash = '#/t/jet/i1'; });
  const timeline = [];
  const snap = async (label) => { const d = doc(W, 'topics/jet/lessons/i1'); timeline.push([W.now(), label, JSON.stringify(d)]); console.log(String(W.now()).padStart(6), label, JSON.stringify(d)); };
  while (!(doc(W, 'topics/jet/lessons/i1') || {}).status || doc(W, 'topics/jet/lessons/i1').status !== 'building') await sleep(200);
  await snap('A reached building');
  await A.cdp.send('Debugger.enable'); await A.cdp.send('Debugger.pause');
  await snap('A frozen');
  await sleep(2000);
  await B.page.evaluate(() => { location.hash = '#/t/jet/i1'; });
  await snap('B opens lesson');
  for (let i = 0; i < 9; i++) { await sleep(5000); await snap('...'); }
  await A.cdp.send('Debugger.resume');
  await snap('A resumed');
  for (let i = 0; i < 8; i++) { await sleep(5000); await snap('...'); }
  const out = { name: 'freeze-takeover', samples: summarizeSamples(W), log: W.sample.log.map((e) => [e.label, e.task, e.tEnq, e.tEnd, e.outcome]), timeline, writes: W.writesByPath, screenA: await screen(A.page), screenB: await screen(B.page), errors: A.errors.concat(B.errors).slice(0, 4) };
  console.log(JSON.stringify(out, null, 1));
  save('s5-takeover', out);
}
await closeBrowser(); stopServer();
