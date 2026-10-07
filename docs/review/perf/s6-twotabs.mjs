// Two devices (separate storage) or two tabs of one device (shared localStorage) on the same topic.
import { createWorld, openTab, serve, closeBrowser, stopServer, save, sleep, FX, UID, summarizeSamples, getBrowser } from './harness.mjs';
import { makeSeed } from './seed.mjs';
const url = await serve();
const which = process.argv[2];
const PLANNED = () => ({ ['topics/jet']: Object.assign({}, FX.planJet, { id: 'jet', status: 'ready', research: { status: 'unavailable', at: new Date().toISOString(), sources: 0 } }) });
const doc = (W, p) => { const d = W.store.get(p); return d ? { status: d.data.status, hasLesson: !!d.data.lesson, by: d.data.by && d.data.by.page } : null; };

async function race(name, sameDevice, gapMs, stagger = 0) {
  const W = createWorld({ seed: PLANNED(), dbLatency: 300, taskLat: { 'write-lesson': 8000, 'build-interactive': 12000 } });
  const A = await openTab(W, { label: 'A' });
  const B = sameDevice ? await openTab(W, { label: 'B', context: A.context }) : await openTab(W, { label: 'B', context: await (await getBrowser()).newContext({ viewport: { width: 1280, height: 800 } }), width: 1280 });
  await A.page.goto(url + '#/t/jet', { waitUntil: 'commit' });
  if (stagger) { await A.page.locator('.pnode').first().waitFor(); await sleep(stagger); }
  await B.page.goto(url + '#/t/jet', { waitUntil: 'commit' });
  await A.page.locator('.pnode').first().waitFor(); await B.page.locator('.pnode').first().waitFor();
  await A.page.evaluate(() => { location.hash = '#/t/jet/i1'; });
  await sleep(gapMs);
  await B.page.evaluate(() => { location.hash = '#/t/jet/i1'; });
  const t0 = Date.now();
  while (Date.now() - t0 < 45000) {
    const ok = await Promise.all([A, B].map((t) => t.page.locator('.kit-frame[data-state="live"]').count()));
    if (ok[0] && ok[1]) break;
    await sleep(500);
  }
  await sleep(3000);
  const byIdea = {};
  W.sample.log.forEach((e) => { const k = e.label + ':' + e.task + ':' + (e.idea || ''); byIdea[k] = (byIdea[k] || 0) + 1; });
  const devices = await Promise.all([A, B].map((t) => t.page.evaluate(() => U.gen._who().device)));
  const out = { name, sameDevice, gapMs, devices, calls: byIdea, writesToLessonDoc: W.writesByPath['topics/jet/lessons/i1'], finalDoc: doc(W, 'topics/jet/lessons/i1'), Alive: await A.page.locator('.kit-frame[data-state="live"]').count(), Blive: await B.page.locator('.kit-frame[data-state="live"]').count(), errors: A.errors.concat(B.errors).slice(0, 3) };
  console.log('\n## ' + name + '\n' + JSON.stringify(out, null, 1));
  save('s6-' + name, out);
  await A.page.close(); await B.page.close();
}
if (!which || which === 'race') {
  if (process.argv[3] !== 'same') {
    await race('two-devices-open-same-new-lesson-0.2s-apart', false, 200);
    await race('two-devices-open-same-new-lesson-3s-apart', false, 3000);
  }
  await race('two-tabs-same-browser-3s-apart', true, 3000, 1500);
}

if (!which || which === 'cards') {
  // Desktop finishes a lesson (addFromLesson: get cards doc, then set the WHOLE doc) while the phone
  // is saving review answers into the same topic's cards doc.
  const seed = makeSeed({ topics: 1, ideas: 4 });
  const W = createWorld({ seed, dbLatency: 400 });
  const P = `data/users/${UID}/profile/cards/topic-0`;
  const A = await openTab(W, { label: 'phone' });
  await A.page.goto(url + '#/', { waitUntil: 'commit' });
  await A.page.waitForFunction(() => window.U && U.review && U.boot && U.boot.ready, null, { timeout: 20000 });
  const B = await openTab(W, { label: 'desktop', context: await (await getBrowser()).newContext() });
  await B.page.goto(url + '#/', { waitUntil: 'commit' });
  await B.page.waitForFunction(() => window.U && U.review && U.boot && U.boot.ready, null, { timeout: 20000 });
  const before = Object.values(W.store.get(P).data.cards).filter((c) => c.iid === 'i1').map((c) => [c.id, c.hist.length]);
  // Phone reviews the i1 cards (U.review save path = cards.patch) while the desktop completes idea i3.
  const lesson = W.store.get('topics/topic-0/lessons/i3').data.lesson;
  // Phone answers its i1 review cards (same write path as a review session: cards.patch)...
  const pA = A.page.evaluate(() => U.store.cards.get('topic-0').then((d) => {
    const patch = { cards: {} };
    Object.values(d.cards).filter((c) => c.iid === 'i1').forEach((c) => { patch.cards[c.id] = { hist: c.hist.concat([{ at: new Date().toISOString(), grade: 3, ok: true }]), s: U.fsrs.review(c.s, 3, U.today(), c.id) }; });
    return U.store.cards.patch('topic-0', patch);
  }));
  // ...and 0.7 s later the desktop finishes idea i3 (addFromLesson: get the doc, then set it whole).
  await sleep(700);
  const pB = B.page.evaluate((l) => U.review.addFromLesson('topic-0', 'i3', l, { checks: { c1: { correct: true } }, say: { text: 'mine', verdict: 'got-it' } }), lesson);
  await pA;
  await pB;
  await sleep(1500);
  const after = Object.values(W.store.get(P).data.cards).filter((c) => c.iid === 'i1').map((c) => [c.id, c.hist.length]);
  const out = { name: 'cards-lost-update', i1HistBefore: before, phoneWroteOneMoreEach: true, i1HistAfter: after, lost: JSON.stringify(before) === JSON.stringify(after) };
  console.log('\n## cards\n' + JSON.stringify(out, null, 1));
  save('s6-cards', out);
}
await closeBrowser(); stopServer();
