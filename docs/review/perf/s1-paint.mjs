// Time to first useful paint of Learn, Topic and Lesson (cold load), seeded data.
import { createWorld, openTab, serve, closeBrowser, stopServer, NET, save, sleep } from './harness.mjs';
import { makeSeed } from './seed.mjs';

const WATCH = [
  ['opening', '.boot-opening'],
  ['learn', '.tcard:not(.is-skeleton)'],
  ['topic', '.pnode'],
  ['lessonQ', '.lsn-stage .lsn-h'],
  ['kitLive', '.kit-frame[data-state="live"]'],
];
const SCREENS = [['learn', '#/'], ['topic', '#/t/topic-0'], ['lesson', '#/t/topic-0/i2']];
const PROFILES = {
  desktop: { cpu: 1, net: null, db: 60, useMs: 60, fontMs: -1 },
  phone: { cpu: 4, net: NET.slow4g, db: 600, useMs: 300, fontMs: -1 },
  'phone+fonts': { cpu: 4, net: NET.slow4g, db: 600, useMs: 300, fontMs: 2250 },
};
const url = await serve();
const rows = [];
const only = process.argv[2];
for (const [pname, P] of Object.entries(PROFILES)) {
  if (only && pname !== only) continue;
  for (const [screen, hash] of SCREENS) {
    for (let rep = 0; rep < 2; rep++) {
      const W = createWorld({ seed: makeSeed({ topics: 12, ideas: 6, stage: screen === 'lesson' ? 'play' : null }), dbLatency: P.db });
      const tab = await openTab(W, { cpu: P.cpu, net: P.net, useMs: P.useMs, fontMs: P.fontMs, watch: WATCH, label: 'A' });
      const t0 = Date.now();
      await tab.page.goto(url + hash, { waitUntil: 'commit' });
      const want = screen === 'learn' ? 'learn' : screen === 'topic' ? 'topic' : 'kitLive';
      try { await tab.page.waitForFunction((w) => window.__perf && window.__perf.marks[w], want, { timeout: 60000, polling: 100 }); } catch (e) { console.log('timeout', pname, screen); }
      await sleep(500);
      const r = await tab.page.evaluate(() => {
        const n = performance.getEntriesByType('navigation')[0] || {};
        return { nav: { responseEnd: Math.round(n.responseEnd), domInteractive: Math.round(n.domInteractive), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) }, perf: window.__perf };
      });
      const lt = r.perf.lt;
      const row = {
        profile: pname, screen, rep, nav: r.nav, fcp: r.perf.paints['first-contentful-paint'], marks: r.perf.marks,
        longTasks: lt.length, longTaskMs: lt.reduce((a, x) => a + x[1], 0), biggest: lt.slice().sort((a, b) => b[1] - a[1]).slice(0, 4),
        dbOps: { get: W.counts.get || 0, query: W.counts.query || 0, sub: W.counts.sub || 0 }, wall: Date.now() - t0, errors: tab.errors.slice(0, 3),
      };
      rows.push(row);
      console.log(pname.padEnd(12), screen.padEnd(7), 'resp', row.nav.responseEnd, 'dcl', row.nav.dcl, 'fcp', row.fcp, 'opening', r.perf.marks.opening, '->', want, r.perf.marks[want], screen === 'lesson' ? 'q ' + r.perf.marks.lessonQ : '', '| LT', row.longTasks, row.longTaskMs + 'ms', JSON.stringify(row.biggest), 'db', JSON.stringify(row.dbOps));
      await tab.context.close();
    }
  }
}
save('s1-paint' + (only ? '-' + only : ''), rows);
await closeBrowser(); stopServer();
