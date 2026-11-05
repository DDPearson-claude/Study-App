// tools/scenario-run.mjs (the whole loop, every invariant) with the v3 switch on: the page is reloaded with `?v3=1`
// (`--v3phase=N` picks the phase, default the shipped rollout phase) before the regular scenario runs. Its reload step keeps
// the query, so the Continue half also runs with v3 on.
//
//   node build.mjs --dev --out=tools/out/p1-main.html
//   node tools/playtest.mjs --html=tools/out/p1-main.html --script=tools/tests/run-v3.scenario.mjs --width=960 --height=540 [--v3phase=1]
import runScenario from '../scenario-run.mjs';

export default async function (api) {
  const { page, args, log } = api;
  const phase = args.v3phase ? `&v3phase=${Number(args.v3phase)}` : '';
  await page.goto(page.url().split('?')[0] + `?v3=1${phase}`, { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  const s = await page.evaluate(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE, sw: window.__gw.debug.v3?.().switch }));
  log('v3 switch', JSON.stringify(s));
  const res = (await runScenario(api)) || {};
  const failures = Array.isArray(res.failures) ? res.failures : [];
  if (s.en !== true) failures.unshift(`[v3] the page did not load with v3 on :: ${JSON.stringify(s)}`);
  const end = await page.evaluate(() => ({ en: window.__gw.data.V3_ENABLED, mode: window.__gw.state.run?.nightMode ?? null, outing: window.__gw.state.run?.outing ?? null }));
  log('v3 at the end', JSON.stringify(end));
  if (end.en !== true) failures.push(`[v3] v3 was lost across the reload :: ${JSON.stringify(end)}`);
  return { failures };
}
