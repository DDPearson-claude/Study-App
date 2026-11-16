// The map art under a host's Content-Security-Policy (the full gate's CSP check; CONTRACT §14.10). The user's phone in the host app
// (16 November 2026) showed the Landing's sheet blank and the Chart as its list: the host refuses fetch() of a data: URI (connect-src)
// while images stay allowed, and both views decoded their bake through fetch. This runs the opening under that policy: the page's CSP
// copy (tools/csp-copy.mjs: <meta http-equiv=Content-Security-Policy content="connect-src 'self' https://fonts.googleapis.com
// https://fonts.gstatic.com"> before any script; written beside the page given when it has no policy of its own), a fresh save, New
// Descent → Start → the film skipped → the Landing: the tow view's art decoded ('ready') and drawn; then the tow untouched to the chart
// beat over the moored barge: the drawn Chart (its art 'ready', the drawn panel), never the list. No policy violation in the page.
//   node build.mjs --dev --out=tools/out/csp/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/csp/dev.html --shots=tools/out/csp/desktop --script=tools/tests/csp-art.scenario.mjs --width=960 --height=540
// Prints `CSP_ART {size, failures, notes}`; returns its failures.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeKit, Abort } from './loop-1a.scenario.mjs';
import { cspCopy, HOST_CSP } from '../csp-copy.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  // every policy violation the page meets, kept in the page (a refused fetch of data: is one)
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => { window.__csp.push({ dir: e.violatedDirective, uri: String(e.blockedURI || '').slice(0, 40) }); });
  });
  // the page under the host's policy: the CSP copy of the page given (unless it carries a policy already)
  const own = await g(() => !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')).catch(() => false);
  if (!own) {
    const url = page.url().split('?')[0];
    if (!url.startsWith('file:')) throw new Error(`csp-art: a built page on disk is needed (got ${url})`);
    const out = cspCopy(fileURLToPath(url));
    log('csp-art: the CSP copy', out);
    await page.goto(pathToFileURL(out).href, { waitUntil: 'load', timeout: 300000 });
  }
  const K = makeKit(api, { label: 'csp' });
  const tow = () => g(() => ({ phase: window.__gw.debug.loop?.tow?.()?.phase ?? null, view: window.__gw.ui?.loop?.tow?.debug?.() ?? null, modal: window.__gw.debug.ui().openModal }));
  try {
    K.step('csp: a fresh save under the policy');
    await K.load({ fresh: true });
    const pol = await g(() => {
      const m = document.querySelector('meta[http-equiv="Content-Security-Policy"]'), s = document.querySelector('script');
      return m ? { content: m.content, first: !s || !!(m.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) } : null;
    });
    K.need(pol && pol.content === HOST_CSP && pol.first, 'the page runs under the host\'s policy (its meta before every script)', pol);
    const T = await g(() => window.__gw.data.TEXT_LOOP);
    await g(() => { window.__gw.debug.intro?.('auto', true); window.__gw.ui.showTitle(); });
    await K.titleReady();
    K.need(await K.tap('[data-modal=title] .gw-tbtn', T.newDescent), 'New Descent');
    await K.settle();
    K.need((await K.until("c.debug.ui().openModal === 'newdescent'", 2)).ok, 'the New Descent panel');
    await K.tap('[data-modal=newdescent] button.gw-char[data-wick=taper]');
    for (let i = 0; i < 12 && !(await g(() => !!window.__lp.one('[data-modal=newdescent] [data-action=start]'))); i++) await K.settle(300);
    const st = await g(() => { const b = window.__lp.one('[data-modal=newdescent] [data-action=start]'); if (!b) return null; b.click(); return { flow: window.__gw.flow }; });
    K.need(st && st.flow === 'intro', 'Start plays the film', st);
    await g(() => window.__lp.runTo(0.6));
    await g(() => window.__gw.game.skipIntro?.());
    await g(() => window.__lp.runOut());
    K.need((await K.until("c.flow === 'home'", 4)).ok, 'the film hands off: flow home');

    K.step('csp: the Landing (the tow view\'s art)');
    K.need((await K.until("c.debug.loop.tow().phase === 'arrive'", 3)).ok, 'the dip opens on the Landing', await tow());
    for (let i = 0; i < 40 && (await g(() => window.__gw.ui?.loop?.tow?.debug?.()?.status)) === 'loading'; i++) await K.settle(250);   // (the bake decodes in idle time)
    await K.steps(3);
    let s = await tow();
    K.check(s.view?.status === 'ready', 'the tow view\'s art decodes under the policy (status ready)', s.view);
    K.check(s.modal === 'tow' && s.view?.open === true && s.view?.last?.art === true, 'the Landing\'s sheet is drawn (the bake, not a blank sheet)', s);
    await K.shoot('landing');

    K.step('csp: the drawn Chart over the moored barge');
    K.need((await K.until("c.debug.ui().openModal === 'chart'", 40)).ok, 'the tow to the chart beat (the Chart opens over the moored barge)', await tow());
    await K.secs(1.2);
    await K.settle(700);
    const ch = await g(() => {
      const d = window.__gw.debug.loop.chart?.() || null, T = window.__lp;
      return { status: d?.status ?? null, error: d?.error ?? null, drawn: !!T.one('[data-loop=chart] .gw-chart--drawn canvas'), panel: !!document.querySelector('.gw-p-chart--drawn'),
        forced: window.__gw.debug.ui().chartList ?? null };
    });
    K.check(ch.status === 'ready' && !ch.error, 'the drawn Chart\'s art decodes under the policy (status ready)', ch);
    K.check(ch.drawn && ch.panel, 'the Chart opens drawn (its canvas), not the list', ch);
    await K.shoot('chart');

    const v = await g(() => (window.__csp || []).slice(0, 8));
    K.check(v.length === 0, 'no policy violation in the page (no fetch of a data: URI)', v);
    await K.noErrors('the opening under the policy');
  } catch (e) {
    if (!(e instanceof Abort)) K.check(false, `threw: ${e?.stack || e}`);
  }
  await K.release().catch(() => {});
  log('CSP_ART', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
