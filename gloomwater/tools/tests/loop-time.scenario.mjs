// The visit home, measured (docs/loop/slice-1a/PLAN.md §2.4 T37, §6.3 steps 4c and 5; lane D owns this file). On a loop dev build,
// on the stepped synthetic clock of loop-1a.scenario.mjs (requestAnimationFrame held, every frame exactly 1/30 s of the game's real
// clock, performance.now on the same clock, so the UI's real-dt clocks are as deterministic as the game's), it times each leg the
// sim's trip() charges (tools/sim/clams.mjs: out, the shows, home + sale + shop) and the opening's tutorial, and prints them for the
// stager to write into LOOP.time:
//   tutorial  intro:done → run:start: the hand-off glide, Murk's wake line, the Chart opening itself, Sail pressed 2.5 s after the
//             Chart opens (no other tap), the glide out (T65's reference ≤ 20 s; the budget LOOP.tutorial.budget.max, 45 s)
//   sailOut   the first Sail → run:start (the 3 s glide, which LOOP.time.out now includes)
//   show      per catch, the reveal (fishing:landing) → the card (fishing:show {phase: 'card'}), against AUTOFISH.time.ceremony[class]:
//             `show` is the mean time past the ceremony the sim already charges (LOOP.time.show; PLAN CHOICE 15 expects 0)
//   home      the Home pill's tap (a full hold) → the tally open (the 2 s sail home)
//   sale      the tally open → its last row and total (no taps: the player watches Murk buy the hold, fish by fish), then Sold →
//             the Jetty; per fish, the sim time of each row's coin (from the built audio log, when the page logs it)
//   shop      the Jetty → the Murk tile → the shelf → one buy (Hold 4) → back to the Jetty (each control pressed the moment it is
//             live: the mechanical time; `taps` counts the player's presses, for the stager's reading allowance)
//   out       the Jetty → the Chart tile → Sail → run:start (the second Sail)
// The last stdout line is `LOOP_TIME {json}`; with --shots the same JSON is written to <shots>/loop-time.json.
//
//   node build.mjs --dev --out=tools/out/loop-1a.html
//   node tools/playtest.mjs --html=tools/out/loop-1a.html --shots=tools/out/loop-1a/time --script=tools/tests/loop-time.scenario.mjs --width=960 --height=540
//   (or --script=tools/scenario-run.mjs --scenario=loop-time) · --wick=<id> (default wick) · --seed=<n> · --noshots
//   node tools/tests/loop-time.scenario.mjs   (no browser) dry-runs the pure helpers
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Abort, makeKit, expectFor, catchPlan, clamText } from './loop-1a.scenario.mjs';

const r2 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 100) / 100 : null);

// ================================================================== pure helpers (the dry run checks them)
/** The first event of `name` (matching `pred`) at or after sim time `from`. */
export function firstEv(ev, name, from = -Infinity, pred = null) {
  return (ev || []).find((e) => e.e === name && e.sim >= from - 1e-9 && (!pred || pred(e.p || {}))) || null;
}
/** Each catch's show from the event log: the reveal (fishing:landing) to the card (fishing:show {phase: 'card'}), with its class. */
export function showsFrom(ev) {
  const out = [];
  for (const land of (ev || []).filter((e) => e.e === 'fishing:landing')) {
    const cardEv = firstEv(ev, 'fishing:show', land.sim, (p) => p.phase === 'card');
    if (!cardEv) continue;
    const cls = cardEv.p?.cls || land.p?.sizeClass || null;
    out.push({ cls, t0: land.sim, card: cardEv.sim, dur: r2(cardEv.sim - land.sim), hurried: !!cardEv.p?.hurried });
  }
  return out;
}
/** LOOP.time.show from the shows: the mean time past AUTOFISH.time.ceremony[class] (never below 0). */
export function showExtra(shows, cer) {
  const xs = (shows || []).filter((s) => typeof s.dur === 'number' && typeof cer?.[s.cls] === 'number').map((s) => Math.max(0, s.dur - cer[s.cls]));
  return xs.length ? r2(xs.reduce((a, b) => a + b, 0) / xs.length) : null;
}
/** The legs from the marks (seconds of the synthetic clock); a leg with a missing mark is null. */
export function legsFrom(m) {
  const d = (a, b) => (typeof m[a] === 'number' && typeof m[b] === 'number' ? r2(m[b] - m[a]) : null);
  return {
    tutorial: d('introDone', 'runStart1'), sailOut: d('sail1', 'runStart1'), home: d('homeTap', 'tallyOpen'),
    sale: d('tallyOpen', 'jettyAfterSold'), saleWatch: d('tallyOpen', 'tallyEnd'), shop: d('murkTap', 'jettyAfterShop'), out: d('chartTap', 'runStart2'),
  };
}
/** The tutorial's checks (T65): within the budget and near the reference. */
export function tutorialFaults(t, T) {
  const bad = [];
  if (typeof t !== 'number') return ['no tutorial time'];
  if (t > (T?.budget?.max ?? 45)) bad.push(`tutorial ${t} s is over the budget ${T?.budget?.max ?? 45} s`);
  if (t > (T?.budget?.reference ?? 20)) bad.push(`tutorial ${t} s is over T65's reference ${T?.budget?.reference ?? 20} s`);
  return bad;
}

// ================================================================== the scenario
export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const wick = typeof args.wick === 'string' ? args.wick : 'wick';
  const K = makeKit(api, { label: `time-${wick}` });
  const seed = Number.isFinite(Number(args.seed)) ? Number(args.seed) : 7;
  const m = {}, detail = { taps: {}, rows: [], notes: [] };
  const sim = () => K.sim();
  const evAt = async (name, pred = null, from = -Infinity) => firstEv(await K.events(), name, from, pred);
  try {
    // ---------------------------------------------------------- a fresh save, the film on, Start, Skip at 1.2 s
    K.step('time: the opening');
    await K.load({ fresh: true });
    const D = await g(() => { const d = window.__gw.data; return { loop: d.LOOP_ENABLED === true, LOOP: { wicks: d.LOOP?.wicks, hold: d.LOOP?.hold, tutorial: d.LOOP?.tutorial, time: d.LOOP?.time }, T: d.TEXT_LOOP, cer: d.AUTOFISH?.time?.ceremony || {} }; });
    K.need(D.loop, 'a loop build (?loop=1)');
    K.need((D.LOOP.wicks?.order || []).includes(wick), `--wick=${wick} names a Wick`);
    const TL = D.T, E = expectFor(D.LOOP, TL, wick);
    await g(() => { window.__gw.debug.intro?.('auto', true); window.__gw.ui.showTitle(); });
    await K.titleReady();
    await K.release();
    await page.waitForFunction(() => window.__gw.intro?.stage?.ready === true, null, { timeout: 40000, polling: 250 }).catch(() => K.note('the film\'s stage was not prebuilt in 40 s'));
    await K.hold();
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.newDescent), 'New Descent');
    await K.settle();
    await K.tap(`[data-modal=newdescent] button.gw-char[data-wick=${wick}]`);
    const st = await g(() => { const c = window.__gw, T = window.__lp, b = T.one('[data-modal=newdescent] [data-action=start]'); if (!b) return null; T.ev.length = 0; T.sim = 0; b.click(); return c.flow; });
    K.need(st === 'intro', 'Start → the film', st);
    await g(() => window.__lp.runTo(1.2));
    await g(() => window.__gw.game.skipIntro?.());
    await g(() => window.__lp.runOut());
    const done = await K.until("window.__lp.ev.some((e) => e.e === 'intro:done')", 3);
    K.need(done.ok, 'intro:done');
    m.introDone = (await evAt('intro:done')).sim;

    // ---------------------------------------------------------- the tutorial with no taps; Sail 2.5 s after the Chart opens
    K.step('time: the tutorial');
    const chartUp = await K.until("c.debug.ui().openModal === 'chart'", 30);
    K.need(chartUp.ok, 'the Chart opens itself after the wake line (LOOP.tutorial.chartWait)', await K.state());
    m.chartOpen = (await evAt('ui:modal', (p) => p.open === true && p.id === 'chart', m.introDone))?.sim ?? await sim();
    await K.secs(Math.max(0, 2.5 - ((await sim()) - m.chartOpen)));
    await K.shoot('chart');
    m.sail1 = await sim();
    K.need(await K.tap('[data-loop=chart] [data-action=sail]', null, { settle: 0 }), 'Sail');
    const rs1 = await K.until("window.__lp.ev.some((e) => e.e === 'run:start')", 8);
    K.need(rs1.ok, 'run:start after the glide out');
    m.runStart1 = (await evAt('run:start', null, m.sail1)).sim;
    m.wakeLine = (await evAt('firstEvening:line', (p) => p.key === 'wake', m.introDone))?.sim ?? null;
    detail.tutorialBeats = (await K.events()).filter((e) => e.e === 'loop:tutorial' || e.e === 'player:glide' || e.e === 'home:enter' || e.e === 'firstEvening:line')
      .map((e) => ({ e: e.e, sim: r2(e.sim), step: e.p?.step ?? null, kind: e.p?.kind ?? e.p?.key ?? null, state: e.p?.state ?? null, hold: e.p?.hold ?? null }));

    // ---------------------------------------------------------- the trip: a full hold through the real path, each show at its own pace
    K.step('time: the shows');
    await g((n) => window.__gw.debug.fishSeed?.(n), seed);
    await K.secs(2.2);   // (the first trip's cast tip has its moment)
    for (const [i, c] of catchPlan(E.slots0).entries()) {
      await K.realCatch(c.speciesId, c.z, { what: `catch ${i + 1}` });
      await K.toCard(`catch ${i + 1}`, { hurry: false, dwell: 0.6 });
    }
    detail.shows = showsFrom(await K.events());
    const s1 = await K.state();
    K.check(s1.hold?.full === true, 'the hold is full', s1.hold);

    // ---------------------------------------------------------- home, the tally watched to its end, Sold
    K.step('time: home and the sale');
    await K.pillReady();
    m.homeTap = await sim();
    K.need(await K.tap('[data-loop=home]', null, { settle: 0 }), 'the Home pill (a tap, the hold full)');
    detail.taps.home = 1;
    const tal = await K.until("c.debug.ui().openModal === 'tally'", 8);
    K.need(tal.ok, 'the tally opens', await K.state());
    m.tallyOpen = (await evAt('ui:modal', (p) => p.open === true && p.id === 'tally', m.homeTap))?.sim ?? await sim();
    const lt = (await K.state()).loop?.lastTrip;
    const totalText = `+${clamText(lt?.total ?? 0)}`;
    // (stepped at the wall clock's pace, one frame each 1/30 s: a tally sequenced on timers or CSS reads the same as one on the frame's dt)
    const watch = await g(async ([totalText, maxSec]) => {
      const c = window.__gw, T = window.__lp, coins = [];
      let seenLog = 0, t = 0;
      const logLen = () => { try { return (c.debug.audioLog?.(400) || []).filter((x) => /^coin/.test(x?.name || '')).length; } catch { return 0; } };
      const base = logLen();
      const soldUp = () => !!T.one('[data-loop=tally] [data-action=sold]') || !!T.one('[data-action=sold]');
      const wall0 = Date.now();
      while (t < maxSec) {
        const lag = wall0 + (t + 1 / 30) * 1000 - Date.now();
        if (lag > 0) await new Promise((r) => setTimeout(r, lag));
        if (!(await T.step(1, 1 / 30))) break;
        t += 1 / 30;
        const n = logLen() - base;
        while (seenLog < n) { coins.push(+T.sim.toFixed(3)); seenLog++; }
        if (T.seen(totalText) && soldUp()) return { ok: true, end: +T.sim.toFixed(3), coins };
      }
      return { ok: false, end: +T.sim.toFixed(3), coins };
    }, [totalText, 40]);
    K.check(watch.ok, `the tally runs to its total ${totalText} with no tap`, watch);
    m.tallyEnd = watch.end;
    detail.rows = watch.coins.map((x) => r2(x - m.tallyOpen));
    if (!watch.coins.length) K.note('no coin sound in the audio log (a suspended context): the per-fish times are not measured');
    await K.shoot('tally-end');
    await (K.tap('[data-loop=tally] [data-action=sold]', null, { settle: 0 }).then((b) => b || K.tap('[data-action=sold]', null, { settle: 0 })));
    detail.taps.sale = 1;
    const jt = await K.until("c.debug.ui().openModal === 'jetty'", 3);
    K.need(jt.ok, 'Sold → the Jetty');
    m.jettyAfterSold = (await evAt('ui:modal', (p) => p.open === true && p.id === 'jetty', m.tallyEnd))?.sim ?? await sim();

    // ---------------------------------------------------------- the shelf: one buy and back
    K.step('time: the shelf');
    await K.settle();
    m.murkTap = await sim();
    K.need(await K.tap('[data-loop=jetty] [data-tile=murk]', null, { settle: 0 }), 'the Murk tile');
    K.need((await K.until("c.debug.ui().openModal === 'shelf'", 3)).ok, 'the shelf');
    await K.settle(200);
    const b4 = await K.buyBox('hold:4', TL.tabs?.raft);
    K.need(b4 && !b4.disabled, 'the shelf offers Hold 4', b4);
    await K.tapXY(b4.x, b4.y);
    detail.taps.shopTab = (await K.box('[data-loop=shelf] [role=tab]')) ? 1 : 0;
    const bought = await K.until(`(c.progression?.loop?.state?.()?.holdSlots ?? 0) >= 4 && window.__lp.seen(${JSON.stringify(TL.yours)})`, 3);
    K.check(bought.ok, 'Hold 4 bought (Yours.)');
    await K.key('Escape', { settle: 0 });
    const back = await K.until("c.debug.ui().openModal === 'jetty'", 3);
    K.need(back.ok, 'Escape → the Jetty');
    m.jettyAfterShop = await sim();
    detail.taps.shop = 3 + (detail.taps.shopTab || 0);

    // ---------------------------------------------------------- out: the Chart and Sail
    K.step('time: out');
    await K.settle();
    m.chartTap = await sim();
    K.need(await K.tap('[data-loop=jetty] [data-tile=chart]', null, { settle: 0 }), 'the Chart tile');
    K.need((await K.until("c.debug.ui().openModal === 'chart'", 3)).ok, 'the Chart');
    await K.settle(200);
    K.need(await K.tap('[data-loop=chart] [data-action=sail]', null, { settle: 0 }), 'Sail');
    detail.taps.out = 2;
    const rs2 = await K.until("window.__lp.ev.filter((e) => e.e === 'run:start').length >= 2", 8);
    K.need(rs2.ok, 'the second trip starts');
    m.runStart2 = (await evAt('run:start', null, m.chartTap)).sim;
    await K.noErrors('loop-time');
  } catch (e) {
    if (e instanceof Abort) K.note('loop-time stopped at a step it could not pass', e.message);
    else K.check(false, 'loop-time threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }

  // ---------------------------------------------------------- the figures
  const legs = legsFrom(m);
  const cer = await g(() => window.__gw?.data?.AUTOFISH?.time?.ceremony || {}).catch(() => ({}));
  const tut = await g(() => window.__gw?.data?.LOOP?.tutorial || {}).catch(() => ({}));
  const now = await g(() => window.__gw?.data?.LOOP?.time || {}).catch(() => ({}));
  const out = { home: legs.home, sale: legs.sale, shop: legs.shop, out: legs.out, show: showExtra(detail.shows, cer), tutorial: legs.tutorial, sailOut: legs.sailOut,
    detail: { wick, size: K.tag, saleWatch: legs.saleWatch, marks: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, r2(v)])), shows: detail.shows, rows: detail.rows,
      taps: detail.taps, tutorialBeats: detail.tutorialBeats, ceremony: cer, nowInData: now, notes: K.notes } };
  for (const f of tutorialFaults(out.tutorial, tut)) K.check(false, `T65: ${f}`);
  K.check(typeof out.sailOut === 'number' && Math.abs(out.sailOut - (tut.out ?? 3)) <= 0.4, `the glide out takes about ${tut.out ?? 3} s (sailOut ${out.sailOut})`);
  K.check(['home', 'sale', 'shop', 'out'].every((k) => typeof out[k] === 'number'), 'every leg of the visit home measured', legs);
  if (args.shots) {
    try { const dir = resolve(process.cwd(), String(args.shots)); mkdirSync(dir, { recursive: true }); writeFileSync(resolve(dir, 'loop-time.json'), JSON.stringify(out, null, 1)); } catch (e) { log('could not write loop-time.json', String(e?.message || e)); }
  }
  await K.release().catch(() => {});
  console.log(`LOOP_TIME ${JSON.stringify(out)}`);
  return { failures: K.failures };
}

// ================================================================== the dry run: node tools/tests/loop-time.scenario.mjs
export async function dryRun() {
  const { loadLoopData } = await import('./loop-fixture.mjs');
  const D = await loadLoopData();
  const bad = [];
  let n = 0;
  const ok = (c, msg, x) => { n++; if (!c) bad.push(`${msg}${x !== undefined ? ` :: ${JSON.stringify(x)}` : ''}`); };
  const ev = [
    { e: 'intro:done', sim: 1.7 }, { e: 'player:glide', sim: 1.7, p: { state: 'start', kind: 'home' } }, { e: 'home:enter', sim: 4.7 },
    { e: 'ui:modal', sim: 13.65, p: { open: true, id: 'chart' } }, { e: 'run:start', sim: 19.2 },
    { e: 'fishing:landing', sim: 30, p: { sizeClass: 'keeper' } }, { e: 'fishing:show', sim: 30.5, p: { phase: 'lift', cls: 'keeper' } }, { e: 'fishing:show', sim: 32.1, p: { phase: 'card', cls: 'keeper' } },
    { e: 'fishing:landing', sim: 40, p: { sizeClass: 'prize' } }, { e: 'fishing:show', sim: 43.4, p: { phase: 'card', cls: 'prize' } },
    { e: 'fishing:landing', sim: 50, p: { sizeClass: 'keeper' } },
  ];
  const sh = showsFrom(ev);
  ok(sh.length === 2 && sh[0].dur === 2.1 && sh[1].dur === 3.4 && sh[0].cls === 'keeper' && sh[1].cls === 'prize', 'showsFrom pairs each reveal with its card', sh);
  const cer = D.AUTOFISH.time.ceremony;
  ok(showExtra(sh, cer) === r2((Math.max(0, 2.1 - cer.keeper) + Math.max(0, 3.4 - cer.prize)) / 2), 'showExtra: the mean past the ceremony', [showExtra(sh, cer), cer]);
  ok(showExtra([{ cls: 'keeper', dur: 1.0 }], cer) === 0, 'showExtra never goes below 0');
  ok(showExtra([], cer) === null, 'showExtra of no show is null');
  ok(firstEv(ev, 'ui:modal', 0, (p) => p.id === 'chart')?.sim === 13.65 && firstEv(ev, 'run:start', 20) === null, 'firstEv');
  const legs = legsFrom({ introDone: 1.7, sail1: 16.2, runStart1: 19.2, homeTap: 60, tallyOpen: 62.03, tallyEnd: 68, jettyAfterSold: 68.1, murkTap: 70, jettyAfterShop: 70.5, chartTap: 71, runStart2: 74.1 });
  ok(legs.tutorial === 17.5 && legs.sailOut === 3 && legs.home === 2.03 && legs.sale === 6.07 && legs.saleWatch === 5.97 && legs.shop === 0.5 && legs.out === 3.1, 'legsFrom', legs);
  ok(legsFrom({}).home === null, 'legsFrom: a missing mark is null');
  ok(tutorialFaults(17.5, D.LOOP.tutorial).length === 0 && tutorialFaults(21, D.LOOP.tutorial).length === 1 && tutorialFaults(46, D.LOOP.tutorial).length === 2 && tutorialFaults(null, D.LOOP.tutorial).length === 1, 'tutorialFaults (T65: reference 20 s, budget 45 s)');
  // the plan the trip keeps (from loop-1a): a full hold of keepers for every Wick
  for (const id of D.LOOP.wicks.order) {
    const E = expectFor(D.LOOP, D.TEXT_LOOP, id);
    ok(catchPlan(E.slots0).length === E.slots0, `${id}: a full hold planned`);
  }
  // the reference the PLAN gives (§5.5): 3 + 5.95 + 3 + 2.5 + 3 ≈ 17.5 s, inside the budget
  const T = D.LOOP.tutorial;
  ok(T.arrive + 5.95 + T.chartWait + 2.5 + T.out <= T.budget.reference, 'the reference tutorial fits T65\'s 20 s', T);
  console.log(`loop-time dry run: ${n - bad.length}/${n} checks passed`);
  for (const b of bad) console.log('  FAIL', b);
  return bad.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const k = await dryRun();
  process.exit(k ? 1 : 0);
}
