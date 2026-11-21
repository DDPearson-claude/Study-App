// FE-T2 (DESIGN §25.14.2b; CONTRACT §13.12 Testing): the First Evening in a browser, driven through playtest.
//
//   node build.mjs --dev --out=tools/out/af-core.html
//   node tools/playtest.mjs --html=tools/out/af-core.html --script=tools/tests/first-evening.scenario.mjs --width=960 --height=540 --lean
//   node tools/playtest.mjs --html=tools/out/af-core.html --script=tools/tests/first-evening.scenario.mjs --mobile --lean        (390 px portrait)
//   (also: node tools/playtest.mjs … --script=tools/scenario-run.mjs --scenario=first-evening)
//   --fe=ref,skip,loss,resume,returning,ribbon,replay,later,snuff,release   picks paths (default: all; --mobile defaults to ref,skip,later)
//
// Paths and what each proves (event order and budgets are read off a bus recorder in GAME time, so a slow software-GL frame rate
// never fails a budget; the hub runs at debug.timeScale 3 to save wall time):
//   ref        Begin on a fresh save → framing → … → setout → firstEvening:done → zone:change {zone: 'mossmere', prev: 'cove'} →
//              run:start; the glide's line before run:start (never a cold start); the First Outing card ≤ 50 s and the lake ≤ 60 s
//              after Begin; one line of each kind at a time, no lore / Murk line in the strike window and no tip there but fe_strike;
//              no "%" anywhere in the DOM outside the log; Murk moors on day 1; `setout` and no `descend` in the audio log (when the
//              audio module knows `setout`); survival's clock does not move in the hub
//   skip       two Skip taps reach the First Outing card within 1 s from a step, grant nothing, and Set Out still glides out
//   loss       the slow reader with one loss arrives in < 90 s; three losses jump to `gate` with the deferred lessons set
//   resume     a reload before the catch resumes at `cast` (Murk's wake line, no framing), after it at `gate`
//   returning  a v1 save and a P1-era v3 save boot with no First Evening ({done, legacy}), the offer ribbon, and af_changed once
//   ribbon     the ribbon runs the replay and goes away for good
//   replay     meta is byte-identical after a replay (and nothing is saved during it); the replay ends at the post → title
//   later      every later run: New Descent → the raft at the jetty → the 3 s glide (a rotating Murk line) → run:start; a tap skips
//   snuff      a snuff cuts to the hearth for 3 s before the Snuffed summary; the next run glides out again
//   release    M2: a page without GW_DEBUG exposes no hidden-state hook; a fresh save's title leads into the First Evening, never
//              straight to a lake; Space during the bite strikes and outside it flares
//   perf       the cove during the First Evening (high, then low quality): draw calls ≤ 110 / ≤ 85 and ≤ 4 PointLights in the scene
//              (COVE.budget; asserted when the cove world is in the build, reported otherwise) — tools/perf.mjs's first-evening case
// Pieces built on sibling branches (fishing's cove mode and setTutorial, the cove world, the ui's lines and card, audio's setout)
// are feature-detected: where one is missing the path drives the director through the bus the way that module would and says so.
export default async function (api) {
  const { page, frames, evalGame: g, log, shot, args } = api;
  const failures = [], notes = [];
  const mobile = !!args.mobile;
  const tag = mobile ? 'm' : 'd';
  const only = new Set(String(args.fe || (mobile ? 'ref,skip,later,perf' : 'ref,skip,loss,resume,returning,ribbon,replay,later,snuff,release,perf')).split(','));
  let stepName = 'boot';
  const t0 = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra).slice(0, 600)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra).slice(0, 600) : '');
    return false;
  };
  const note = (msg) => { notes.push(`[${stepName}] ${msg}`); log('NOTE', msg); };
  const waitFor = async (fn, arg, maxFrames = 200) => {
    for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg).catch(() => false)) return true; await frames(1); }
    return false;
  };
  const base = page.url().split('?')[0];
  const load = async (query = '?v3=1&v3phase=1') => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto(base + query, { waitUntil: 'commit', timeout: 240000 });
        await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
        break;
      } catch (e) { log(`load retry ${attempt + 1}: ${String(e?.message || e).split('\n')[0]}`); if (attempt === 2) throw e; }
    }
    await frames(2);
    await g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.4); } catch { /* optional */ } });
  };
  const noErrors = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };
  // the bus recorder: game-time stamps (ctx.time.gameT) and JSON-safe payloads
  const record = () => g(() => {
    const c = window.__gw;
    window.__ev = [];
    const keep = ['firstEvening:step', 'firstEvening:line', 'firstEvening:done', 'firstEvening:beat', 'firstEvening:card', 'firstEvening:skip',
      'zone:change', 'run:start', 'hub:enter', 'flow:change', 'player:glide', 'station:open', 'interact:change', 'merchant:arrive', 'tip:show',
      'fishing:bite', 'fishing:strike', 'fishing:hook', 'fishing:caught', 'fish:escaped', 'fish:action', 'flare', 'run:end', 'phase:change'];
    const safe = (p) => { try { return JSON.parse(JSON.stringify(p, (k, v) => (v && typeof v === 'object' && (v.isObject3D || v.isVector3 || v.isMaterial) ? undefined : v))); } catch { return null; } };
    for (const e of keep) c.bus.on(e, (p) => window.__ev.push({ e, t: +c.time.gameT.toFixed(3), wall: performance.now(), p: safe(p) }));
    return true;
  });
  const events = () => g(() => window.__ev || []);
  const fe = () => g(() => window.__gw.debug.firstEvening());
  const has = await (async () => { await load(); return g(() => {
    const c = window.__gw;
    return {
      v3: c.data.V3_ENABLED === true, phase: c.data.V3_PHASE, fe: !!c.firstEvening, coveWorld: c.world?.getZone?.()?.id === 'cove',
      fishTutorial: typeof c.fishing?.setTutorial === 'function', uiCard: typeof c.ui?.showFirstOuting === 'function' || typeof c.ui?.showSetOut === 'function',
      audioSetout: Array.isArray(c.audio?.v3Names) ? c.audio.v3Names.includes('setout') : null, debug: c.debug.debugEnabled?.(),
      begin: typeof c.game.begin === 'function', glide: typeof c.player?.setOutFromPost === 'function',
    };
  }); })();
  log('build:', JSON.stringify(has));
  check(has.v3 && has.phase === 1, 'v3 on at phase 1 (?v3=1)', has);
  check(has.fe && has.begin && has.glide, 'the First Evening director, game.begin and the player glides are in the build', has);
  if (!has.coveWorld) note('the cove world (FE-W1/W2/W3) is not in this build: world.getZone() is not COVE (shots show the fallback lake)');
  if (!has.fishTutorial) note('fishing\'s cove mode / setTutorial (FE-F1) is not in this build: the cast → play steps are driven through the bus the way fishing will');
  if (!has.uiCard) note('the ui\'s First Outing card (FE-U1) is not in this build: Set Out goes through game.planSetOut');
  if (has.audioSetout === false) note('audio\'s `setout` sting (FE-Au1) is not in this build: the audio check is skipped');
  check(has.debug === true, 'this run is a debug build (GW_DEBUG from playtest)');

  // ------------------------------------------------------------------ the bot
  const SPEED = 3;
  const hubSpeed = (k = SPEED) => g((k) => { window.__gw.debug.timeScale(k); return k; }, k);
  const stepNow = () => g(() => window.__gw.firstEvening?.step || null);
  const waitStep = async (id, maxFrames = 900) => waitFor((id) => window.__gw.firstEvening?.step === id, id, maxFrames);
  const murkUp = () => g(() => !!window.__gw.firstEvening?.murkLine && window.__gw.firstEvening.murkLine.t < window.__gw.firstEvening.murkLine.hold);
  const waitMurk = async (max = 900) => { for (let i = 0; i < max; i++) { if (!(await murkUp())) return true; await frames(1); } return false; };
  const bus = (e, p = {}) => g(([e, p]) => { window.__gw.bus.emit(e, p); return true; }, [e, p]);
  /** One cast → bite → strike → play, real fishing when the build has the cove mode, else the bus. `lose` forces a loss. */
  async function fishOnce({ lose = false, slow = 0 } = {}) {
    if (!(await waitStep('cast'))) return check(false, 'reached cast', await fe());
    await waitMurk();
    if (slow) await frames(Math.round(slow * 4));
    if (has.fishTutorial) {
      if (lose) await g(() => window.__gw.debug.fishOutcome?.('lose', 'spat'));
      else await g(() => window.__gw.debug.fishOutcome?.('land'));
      const W = api.width, H = api.height;
      await page.mouse.move(W * 0.5, H * 0.38); await page.mouse.down(); await frames(6); await page.mouse.up();
      await waitFor(() => window.__gw.fishing.state === 'bite', null, 600);
      await page.mouse.click(W * 0.5, H * 0.5);
      await waitFor(() => ['measure', 'cast', 'gate'].includes(window.__gw.firstEvening?.step) || window.__gw.fishing.state === 'lost', null, 900);
      return true;
    }
    await bus('fishing:cast', { power: 0.8 });
    await frames(3); await bus('fishing:land', {});
    await waitFor(() => window.__gw.firstEvening?.step === 'wait' && window.__gw.firstEvening.state.t >= 2.4, null, 300);
    await bus('fishing:bite', { sizeClass: 'small', biteTell: 'doublePop' });
    await waitFor(() => window.__gw.firstEvening?.state.t >= 0.4, null, 60);
    await bus('fishing:strike', { grade: 'clean', sizeClass: 'small' });
    await bus('fishing:hook', { grade: 'clean', perfect: true, sizeClass: 'small' });
    await waitFor(() => window.__gw.firstEvening?.state.t >= 2.4, null, 300);
    if (lose) {
      await bus('fishing:escaped', { reason: 'spat', sizeClass: 'small' });
      await frames(4);
      await bus('fish:escaped', { speciesId: 'quayling', sizeClass: 'small', reason: 'spat', approxLength: 12 });
      return true;
    }
    await bus('fishing:caught', { speciesId: 'quayling', sizeClass: 'small' });
    await frames(3); await bus('fish:landed', { measured: true });
    await waitFor(() => window.__gw.firstEvening?.state.t >= 4.8, null, 400);
    await bus('fish:action', { action: 'release' });
    return true;
  }
  async function closeCatchCard() {
    // a real catch card (fishing + ui in the build): Release only in the cove
    const m = await g(() => window.__gw.debug.ui?.()?.openModal ?? null);
    if (m === 'catch') {
      const clicked = await g(() => { const b = [...document.querySelectorAll('#ui button')].find((x) => x.offsetParent && /release|let it go|keep/i.test(x.textContent)); if (b) { b.click(); return true; } return false; });
      if (!clicked) await g(() => window.__gw.ui.closeAll?.());
    }
  }
  /**
   * Sail from the mooring to the Map Table post: an in-page autopilot drives the virtual stick (ctx.input.joy) toward waypoints,
   * screen-relative through render.getYaw() exactly like a thumb would (so it works whatever the hub camera does), and stops in
   * the post's reach; then E uses the Plan pill. Falls back to player.toPost() if the raft does not get there.
   */
  async function sailToPost() {
    await g(() => {
      const c = window.__gw;
      const pts = [[9, 10.8], [-1, 11.2], [-6, 10.8]];
      let i = 0;
      const tick = () => {
        if (!window.__steerOn) { c.input.joy.set(0, 0); return; }
        const p = c.player.position;
        if (c.player.interactable?.id === 'station:map_table') { c.input.joy.set(0, 0); window.__steerOn = false; return; }
        let [tx, tz] = pts[Math.min(i, pts.length - 1)];
        if (Math.hypot(tx - p.x, tz - p.z) < 1.2 && i < pts.length - 1) { i++; [tx, tz] = pts[i]; }
        let dx = tx - p.x, dz = tz - p.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
        const yaw = c.render?.getYaw?.() || 0, sy = Math.sin(yaw), cy = Math.cos(yaw);
        c.input.joy.set(dx * cy - dz * sy, -dx * sy - dz * cy);
        requestAnimationFrame(tick);
      };
      window.__steerOn = true;
      requestAnimationFrame(tick);
      return true;
    });
    const ok1 = await waitFor(() => window.__gw.player.interactable?.id === 'station:map_table', null, 900);
    await g(() => { window.__steerOn = false; window.__gw.input.joy.set(0, 0); });
    if (!ok1) { note('the autopilot did not reach the post; using player.toPost()'); await g(() => window.__gw.player.toPost()); await frames(3); }
    return g(() => window.__gw.player.interactable?.id === 'station:map_table');
  }
  async function planAndSetOut() {
    if (!(await waitStep('plan', 600))) return check(false, 'the First Outing card step', await fe());
    await frames(4);
    const clicked = has.uiCard ? await g(() => { const b = [...document.querySelectorAll('#ui button')].find((x) => x.offsetParent && /set out/i.test(x.textContent)); if (b) { b.click(); return true; } return false; }) : false;
    if (!clicked) await g(() => window.__gw.game.planSetOut({ zone: 'mossmere', nightMode: 'still', character: 'wick', outing: 'first' }));
    return waitStep('setout', 60);
  }
  const lineChecks = (ev, label) => {
    const lines = ev.filter((x) => x.e === 'firstEvening:line');
    // one of each kind at a time is structural (a new line replaces the old); the strike window holds no lore / Murk line
    const at = (id) => ev.find((x) => x.e === 'firstEvening:step' && x.p.id === id);
    const strikes = ev.filter((x) => x.e === 'firstEvening:step' && x.p.id === 'strike');
    let bad = 0;
    for (const s of strikes) {
      const next = ev.find((x) => x.e === 'firstEvening:step' && x.t >= s.t && x !== s && x.p.prev === 'strike');
      const end = next ? next.t : Infinity;
      let murk = null, lore = null;
      for (const x of lines) {
        if (x.t > end) break;
        if (x.p.kind === 'murk') murk = x.p.key ? x : null;
        if (x.p.kind === 'lore') lore = x.p.key ? x : null;
        if (x.t >= s.t && x.t < end && x.p.kind === 'tip' && x.p.key && x.p.key !== 'fe_strike') bad++;
      }
      if (murk && murk.t + (murk.p.hold || 0) > s.t) bad++;
      if (lore) bad++;
    }
    check(strikes.length > 0 && bad === 0, `${label}: no lore or Murk line in the strike window, and no tip there but fe_strike`, { strikes: strikes.length, bad });
    check(lines.every((x) => !x.p.text || (x.p.text.length <= 90 && !/[%!]/.test(x.p.text))), `${label}: every line ≤ 90 characters, no % or "!"`);
    void at;
  };
  const percentScan = async () => g(() => {
    const t = document.getElementById('ui')?.innerText || '';
    const journal = !!document.querySelector('.gw-m-journal, [data-modal="journal"]');
    return { pct: !journal && /\d\s?%/.test(t), sample: t.slice(0, 120) };
  });

  // ================================================================== ref
  if (only.has('ref')) {
    step(`ref (${tag}): fresh save → Begin → the First Evening → the Mossmere`);
    await load();
    await g(() => { window.__gw.debug.freshSave(); window.__gw.debug.glides('real'); });
    await record();
    const meta0 = await g(() => ({ fe: window.__gw.state.meta.firstEvening, runs: window.__gw.state.meta.runs }));
    check(meta0.fe && meta0.fe.done === false && meta0.runs === 0, 'a fresh save: meta.firstEvening {done: false}', meta0);
    // the title: Begin (FE-U1) or the game.begin seam
    const beganByClick = await g(() => { const b = [...document.querySelectorAll('#ui button')].find((x) => x.offsetParent && /^\s*begin/i.test(x.textContent)); if (b) { b.click(); return true; } return false; });
    if (!beganByClick) { note('the title has no Begin button (FE-U1): game.begin()'); await g(() => window.__gw.game.begin()); }
    await hubSpeed();
    const T0 = await g(() => window.__gw.time.gameT);
    check(await g(() => window.__gw.flow === 'hub' && window.__gw.firstEvening.step === 'framing'), 'Begin → flow hub, step framing');
    let pctBad = 0;
    const sampleClock = await g(() => window.__gw.state.run);
    check(sampleClock === null, 'no run exists in the hub (survival\'s clock cannot move)');
    await waitFor(() => window.__gw.firstEvening.state.t > 1.0, null, 200);
    await shot(`fe-${tag}-01-framing`);
    await waitStep('wake');
    await waitFor(() => window.__gw.firstEvening.state.murk?.key === 'murkWake', null, 300);
    await shot(`fe-${tag}-02-wake`);
    if ((await percentScan()).pct) pctBad++;
    await fishOnce();
    if ((await percentScan()).pct) pctBad++;
    await closeCatchCard();
    await shot(`fe-${tag}-03-measure`);
    // odds: the log opens and closes (ui:screen); then gate
    await waitStep('odds', 600);
    await bus('ui:screen', { id: 'journal', open: true }); await frames(4); await bus('ui:screen', { id: 'journal', open: false });
    await waitStep('gate', 900);
    await shot(`fe-${tag}-04-gate`);
    const sailed = await sailToPost();
    check(sailed, 'sailing to the Map Table post shows the Plan pill (station:map_table)');
    await shot(`fe-${tag}-05-post`);
    await waitMurk();
    await page.keyboard.press('KeyE');
    await planAndSetOut();
    await shot(`fe-${tag}-06-card-or-setout`);
    await waitFor(() => window.__gw.player.glideState?.leg === 1, null, 600);
    await shot(`fe-${tag}-07-glide`);
    const arrived = await waitFor(() => window.__gw.flow === 'playing' && !!window.__gw.state.run, null, 900);
    check(arrived, 'the run starts at the arch crossing');
    await hubSpeed(1);
    await frames(10);
    await shot(`fe-${tag}-08-mossmere`);
    const ev = await events();
    const ids = ev.filter((x) => x.e === 'firstEvening:step').map((x) => x.p.id);
    check(JSON.stringify(ids) === JSON.stringify(['framing', 'wake', 'cast', 'wait', 'strike', 'play', 'measure', 'odds', 'gate', 'plan', 'setout']), 'every step in order', ids);
    const iDone = ev.findIndex((x) => x.e === 'firstEvening:done');
    const iZone = ev.findIndex((x, i) => i > iDone && x.e === 'zone:change' && x.p.zone === 'mossmere');
    const iRun = ev.findIndex((x) => x.e === 'run:start');
    const iLine = ev.findIndex((x) => x.e === 'player:glide' && x.p.state === 'line');
    check(iLine >= 0 && iDone > iLine && iZone > iDone && iRun > iZone, 'the glide\'s line → firstEvening:done → zone:change {mossmere} → run:start', { iLine, iDone, iZone, iRun });
    check(ev[iZone]?.p.prev === 'cove', 'the lake zone:change carries prev "cove"', ev[iZone]?.p);
    check(ev.filter((x) => x.e === 'run:start').length === 1 && ev.filter((x) => x.e === 'firstEvening:done').length === 1, 'run:start and firstEvening:done fire once');
    const cardT = (ev.find((x) => x.e === 'firstEvening:card' && x.p.open)?.t ?? Infinity) - T0;
    const lakeT = (ev[iZone]?.t ?? Infinity) - T0;
    check(cardT <= 50, `the First Outing card ${cardT.toFixed(1)} s after Begin (≤ 50)`);
    check(lakeT <= 60, `the Mossmere ${lakeT.toFixed(1)} s after Begin (≤ 60)`);
    const setoutT = ev.find((x) => x.e === 'firstEvening:step' && x.p.id === 'setout')?.t;
    const dep = (ev[iLine]?.t ?? Infinity) - setoutT;
    check(Math.abs(dep - 6) <= 0.3, `the departure (auto-sail + glide) reaches the arch line ${dep.toFixed(2)} s after Set Out (6 ± 0.3)`);
    lineChecks(ev, 'ref');
    check(pctBad === 0, 'no "%" in the DOM outside the log during the First Evening');
    const fm = await g(() => window.__gw.state.meta.firstEvening);
    check(fm.done === true && !fm.skipped, 'meta.firstEvening.done', fm);
    const run = await g(() => { const r = window.__gw.state.run; return { outing: r.outing, mode: r.nightMode, character: r.character, zone: r.zone, runs: window.__gw.state.meta.runs }; });
    check(run.outing === 'first' && run.mode === 'still' && run.zone === 'mossmere' && run.runs === 1, 'the First Outing: the Mossmere, the Wick, every night still', run);
    // Murk moors on day 1 after the glide (the market resets on prev ∈ {null, cove}); give him the calm's first minute
    await hubSpeed(6);
    const moor = await waitFor(() => (window.__ev || []).some((x) => x.e === 'merchant:arrive') || window.__gw.actors?.merchant?.present === true, null, 600);
    await hubSpeed(1);
    check(moor, 'Murk moors on day 1 after the glide');
    if (has.audioSetout) {
      const al = await g(() => (window.__gw.debug.audioLog?.(200) || []).map((x) => x.name));
      check(al.includes('setout') && !al.includes('descend'), 'the audio log has setout and no descend', al.slice(-20));
    }
    await noErrors();
  }

  // ================================================================== skip
  if (only.has('skip')) {
    step(`skip (${tag}): two Skip taps reach the card within 1 s and grant nothing`);
    for (const from of ['framing', 'strike', 'odds']) {
      await g(() => { window.__gw.game.toTitle(); window.__gw.debug.freshSave(); window.__gw.debug.glides('real'); });
      await record();
      await g(() => window.__gw.game.begin());
      await hubSpeed();
      if (from !== 'framing') await g((s) => window.__gw.debug.firstEvening(s), from);
      await frames(4);
      const before = await g(() => JSON.stringify({ m: window.__gw.state.meta.memories, j: window.__gw.state.meta.journal, r: window.__gw.state.meta.relics }));
      const tA = await g(() => window.__gw.time.gameT);
      const skipWord = await g(() => { const b = [...document.querySelectorAll('#ui button, #ui [role=button]')].find((x) => x.offsetParent && /^\s*skip\b/i.test(x.textContent)); if (b) { b.click(); return true; } return false; });
      if (!skipWord) await g(() => window.__gw.firstEvening.skipWord());
      await frames(2);
      const skip2 = await g(() => { const b = [...document.querySelectorAll('#ui button, #ui [role=button]')].find((x) => x.offsetParent && /skip/i.test(x.textContent)); if (b) { b.click(); return true; } return false; });
      if (!skip2) await g(() => window.__gw.firstEvening.skipWord());
      await waitStep('plan', 30);
      const tB = await g(() => window.__gw.time.gameT);
      const after = await g(() => JSON.stringify({ m: window.__gw.state.meta.memories, j: window.__gw.state.meta.journal, r: window.__gw.state.meta.relics }));
      check((await stepNow()) === 'plan' && tB - tA <= 1, `from ${from}: two Skip taps → the First Outing card in ${(tB - tA).toFixed(2)} s`);
      check(before === after && (await g(() => window.__gw.state.meta.firstEvening.skipped)) === true, `from ${from}: skipped, nothing granted`);
      if (from === 'framing') {
        if (!skipWord) note('the ui has no Skip word (FE-U1): firstEvening.skipWord()');
        await shot(`fe-${tag}-09-skip-card`);
        await planAndSetOut();
        const arrived = await waitFor(() => window.__gw.flow === 'playing', null, 900);
        const ev = await events();
        const iLine = ev.findIndex((x) => x.e === 'player:glide' && x.p.state === 'line'), iRun = ev.findIndex((x) => x.e === 'run:start');
        check(arrived && iLine >= 0 && iRun > iLine, 'a skipped First Evening still sets out through the glide');
        check(ev.find((x) => x.e === 'firstEvening:done')?.p.skipped === true, 'firstEvening:done {skipped: true}');
      }
    }
    await hubSpeed(1);
    await noErrors();
  }

  // ================================================================== loss
  if (only.has('loss')) {
    step('loss: the slow reader with one loss < 90 s; three losses jump to gate');
    await g(() => { window.__gw.game.toTitle(); window.__gw.debug.freshSave(); window.__gw.debug.glides('real'); });
    await record();
    await g(() => window.__gw.game.begin());
    await hubSpeed();
    const T0 = await g(() => window.__gw.time.gameT);
    await waitStep('wake', 900);
    await fishOnce({ lose: true, slow: 1.5 });
    await fishOnce({ slow: 1.5 });
    await closeCatchCard();
    await waitStep('gate', 1200);
    await sailToPost(); await waitMurk(); await frames(6);
    await page.keyboard.press('KeyE');
    await frames(6);
    await planAndSetOut();
    await waitFor(() => window.__gw.flow === 'playing', null, 900);
    let ev = await events();
    const lakeT = (ev.find((x) => x.e === 'zone:change' && x.p.zone === 'mossmere')?.t ?? Infinity) - T0;
    check(lakeT < 90, `the slow reader with one loss reaches the Mossmere in ${lakeT.toFixed(1)} s (< 90)`);
    check(ev.some((x) => x.e === 'firstEvening:line' && x.p.text === 'Happens to all of us. Again.'), 'Murk: "Happens to all of us. Again." after the loss');
    // three losses
    await g(() => { window.__gw.game.toTitle(); window.__gw.debug.freshSave(); });
    await record();
    await g(() => window.__gw.game.begin());
    await hubSpeed();
    await g(() => window.__gw.debug.firstEvening('cast'));
    for (let i = 0; i < 3; i++) { await fishOnce({ lose: true }); await frames(4); }
    await waitStep('gate', 1200);
    ev = await events();
    const fm = await g(() => window.__gw.state.meta.firstEvening);
    check((await stepNow()) === 'gate' && fm.deferred?.measure && fm.deferred?.odds, 'three losses → gate, the deferred lessons set', fm);
    check(!ev.some((x) => x.e === 'firstEvening:step' && (x.p.id === 'measure' || x.p.id === 'odds')), 'no measure or odds step after three losses');
    await g(() => window.__gw.game.toTitle());
    await hubSpeed(1);
    await noErrors();
  }

  // ================================================================== resume
  if (only.has('resume')) {
    step('resume: a reload before the catch → cast; after it → gate');
    await g(() => { window.__gw.game.toTitle(); window.__gw.debug.freshSave(); });
    await g(() => window.__gw.game.begin());
    await hubSpeed();
    await g(() => window.__gw.debug.firstEvening('wait'));
    await frames(3);
    check((await g(() => window.__gw.state.meta.firstEvening.step)) === 'wait', 'meta.firstEvening.step saved at the checkpoint');
    await load();
    await record();
    check((await g(() => window.__gw.state.meta.firstEvening)).step === 'wait', 'the reload keeps the step');
    await g(() => window.__gw.game.begin());
    await frames(2);
    let ev = await events();
    check((await stepNow()) === 'wake' && ev.some((x) => x.e === 'firstEvening:line' && x.p.key === 'murkWake') && !ev.some((x) => x.e === 'firstEvening:step' && x.p.id === 'framing'), 'before the catch: Murk\'s wake line once more, no framing');
    await hubSpeed();
    check(await waitStep('cast', 600), '… then cast');
    await g(() => window.__gw.debug.firstEvening('odds'));
    await frames(3);
    await load();
    await record();
    await g(() => window.__gw.game.begin());
    await frames(2);
    check((await stepNow()) === 'gate', 'after the catch: gate');
    await g(() => window.__gw.game.toTitle());
    await hubSpeed(1);
    await noErrors();
  }

  // ================================================================== returning (+ ribbon)
  // the page saves on pagehide: silence it before writing the old save, so the reload boots from that save
  const legacySave = (meta) => g((meta) => { window.__gw.game.save = () => {}; localStorage.setItem('gloomwater.save.v1', JSON.stringify({ version: 1, savedAt: Date.now(), meta, run: null })); return true; }, meta);
  if (only.has('returning') || only.has('ribbon')) {
    step('returning: a v1 save and a P1-era v3 save boot with no First Evening, the ribbon, af_changed once');
    const v1Meta = { memories: 40, runs: 3, deaths: 3, journal: { dusk_minnow: { caught: 4, biggest: 0.2 } }, relics: {}, settings: {}, seenTips: {} };
    const p1Meta = { memories: 9, runs: 1, deaths: 1, v3ids: true, journal: { reed_perch: { caught: 1 } }, relics: {}, settings: {}, seenTips: {} };
    for (const [label, m] of [['v1', v1Meta], ['P1-era v3', p1Meta]]) {
      await legacySave(m);
      await load();
      await record();
      const st = await g(() => ({ fe: window.__gw.state.meta.firstEvening, offer: window.__gw.game.firstEveningOffer(), begin: window.__gw.game.begin() }));
      check(st.fe?.done === true && st.fe?.legacy === true && st.begin === false, `${label} save: {done: true, legacy: true}; Begin plays no First Evening`, st);
      check(st.offer === true, `${label} save: the "A new first evening (1 min)" ribbon is offered`);
      const ribbon = await g(() => /a new first evening/i.test(document.getElementById('ui')?.innerText || ''));
      if (!ribbon) note(`${label}: the ribbon is not drawn (FE-U1); the offer state is main's`);
      // af_changed at the first v3 bite (once)
      await g(() => { window.__gw.debug.glides('skip'); window.__gw.game.startNewRun({ character: 'wick', nightMode: 'still' }); window.__gw.ui.closeAll?.(); });
      await frames(4);
      await g(() => { window.__gw.bus.emit('fishing:bite', { sizeClass: 'keeper', biteTell: 'plunge' }); window.__gw.bus.emit('fishing:bite', { sizeClass: 'keeper', biteTell: 'plunge' }); });
      const tips = (await events()).filter((x) => x.e === 'tip:show').map((x) => x.p.id);
      check(tips.filter((x) => x === 'af_changed').length === 1, `${label}: af_changed once at the first v3 bite`, tips);
      await g(() => window.__gw.game.toTitle());
    }
  }
  if (only.has('ribbon') || only.has('replay')) {
    step('ribbon + replay: the replay is a sandbox (meta byte-identical, nothing saved) that ends at the post');
    const m = { memories: 40, runs: 3, deaths: 3, journal: { dusk_minnow: { caught: 4, biggest: 0.2 } }, relics: {}, settings: {}, seenTips: {} };
    await legacySave(m);
    await load();
    await record();
    await g(() => window.__gw.game.replayFirstEvening({ fromRibbon: true }));
    const metaBefore = await g(() => JSON.stringify(window.__gw.state.meta));
    const saveBefore = await g(() => localStorage.getItem('gloomwater.save.v1'));
    await hubSpeed();
    check((await stepNow()) === 'framing' && (await g(() => window.__gw.firstEvening.sandbox)), 'the replay runs in a sandbox from the framing');
    await waitStep('wake', 900);
    await fishOnce();
    await closeCatchCard();
    await waitStep('gate', 1200);
    await sailToPost(); await frames(4);
    await page.keyboard.press('KeyE');
    const back = await waitFor(() => window.__gw.flow === 'title', null, 900);
    await hubSpeed(1);
    const metaAfter = await g(() => JSON.stringify(window.__gw.state.meta));
    const saveAfter = await g(() => localStorage.getItem('gloomwater.save.v1'));
    const ev = await events();
    check(back, 'the replay returns to the title (the slice)');
    check(ev.some((x) => x.e === 'firstEvening:line' && x.p.key === 'murkReplay'), 'Murk at the Map Table: "Same as it ever was…"');
    check(metaAfter === metaBefore, 'meta is byte-identical after the replay');
    check(saveAfter === saveBefore, 'nothing was saved during the replay');
    check((await g(() => window.__gw.game.firstEveningOffer())) === false, 'the ribbon goes away for good after use');
    await noErrors();
  }

  // ================================================================== later runs
  if (only.has('later')) {
    step(`later (${tag}): every later run sets out from the Landing through the glide`);
    await g(() => { window.__gw.game.toTitle(); window.__gw.debug.freshSave(); window.__gw.debug.firstEvening('done'); window.__gw.state.meta.runs = 2; window.__gw.debug.glides('real'); });
    await record();
    const viaUi = await g(() => { const b = [...document.querySelectorAll('#ui button')].find((x) => x.offsetParent && /new descent/i.test(x.textContent)); if (b) { b.click(); return true; } return false; });
    await frames(3);
    let started = false;
    if (viaUi) {
      // the New Descent screen: the nights (or the Wick) first, then "Descend as …", until the glide starts
      for (let i = 0; i < 30 && !started; i++) {
        await frames(3);
        started = await g(() => !!window.__gw.player.glideState || window.__gw.flow !== 'title');
        if (started) break;
        await g(() => {
          const vis = [...document.querySelectorAll('#ui button')].filter((x) => x.offsetParent);
          const b = vis.find((x) => /^\s*descend as/i.test(x.textContent)) || vis.find((x) => /^\s*(your first outing|choose the nights)\s*$/i.test(x.textContent));
          b?.click();
        });
      }
      if (!started) note('the New Descent screen did not start a run in 30 tries; game.startNewRun()');
    }
    if (!started) await g(() => window.__gw.game.startNewRun({ character: 'wick', nightMode: 'lantern' }));
    await frames(2);
    const gl = await g(() => ({ flow: window.__gw.flow, glide: window.__gw.player.glideState, x: window.__gw.player.position.x, z: window.__gw.player.position.z }));
    check(gl.flow === 'hub' && gl.glide?.kind === 'everyRun', 'New Descent → the cove, the raft gliding from the jetty', gl);
    await shot(`fe-${tag}-10-later-glide`);
    await hubSpeed(1);
    const arrived = await waitFor(() => window.__gw.flow === 'playing', null, 900);
    let ev = await events();
    const iLine = ev.findIndex((x) => x.e === 'player:glide' && x.p.state === 'line'), iRun = ev.findIndex((x) => x.e === 'run:start');
    check(arrived && iLine >= 0 && iRun > iLine, 'the run starts at the glide\'s line (never without the glide)');
    const murk = ev.find((x) => x.e === 'firstEvening:line' && x.p.everyRun);
    check(!!murk && /Mind the oil|story|dusk|Back already/.test(murk.p.text), 'one rotating Murk line on the departure', murk?.p);
    const gT = (ev[iLine]?.t ?? 0) - (ev.find((x) => x.e === 'player:glide' && x.p.state === 'start')?.t ?? 0);
    check(gT > 2 && gT <= 3.1, `the glide crosses the arch line inside its 3 s (${gT.toFixed(2)} s)`);
    // a tap skips a later run's glide
    await g(() => window.__gw.game.toTitle());
    await record();
    await g(() => window.__gw.game.startNewRun({ character: 'wick', nightMode: 'still' }));
    await frames(2);
    await page.mouse.click(api.width / 2, api.height / 2);
    await frames(3);
    ev = await events();
    check(ev.some((x) => x.e === 'player:glide' && x.p.state === 'line' && x.p.skipped) && ev.some((x) => x.e === 'run:start'), 'a tap skips the glide straight to the arch line and the run');
    await noErrors();
  }

  // ================================================================== snuff
  if (only.has('snuff')) {
    step('snuff: the hearth for 3 s before the Snuffed summary');
    await g(() => { window.__gw.game.toTitle(); window.__gw.debug.freshSave(); window.__gw.debug.firstEvening('done'); window.__gw.debug.glides('skip'); window.__gw.game.startNewRun({ character: 'wick', nightMode: 'still' }); window.__gw.ui.closeAll?.(); });
    await frames(3);
    await record();
    await g(() => window.__gw.bus.emit('player:died', { cause: 'snuffed' }));
    await frames(2);
    const h1 = await g(() => ({ flow: window.__gw.flow, hub: window.__gw.debug.hub(), modal: window.__gw.debug.ui?.()?.openModal ?? null }));
    check(h1.flow === 'dead' && h1.hub.zone === 'cove' && h1.hub.hearth > 2 && h1.modal !== 'death', 'the snuff cuts to the cove\'s hearth (no summary yet)', h1);
    await shot(`fe-${tag}-11-hearth`);
    const w0 = Date.now();
    const shown = await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'death' || !window.__gw.debug.hub().hearth, null, 600);
    const ev = await events();
    check(shown && ev.some((x) => x.e === 'zone:change' && x.p.from === 'snuffed') && ev.some((x) => x.e === 'firstEvening:line' && x.p.key === 'snuffedLine'), '"Murk found your raft drifting." over the hearth, then the summary', { wall: Date.now() - w0 });
    await frames(3);
    await shot(`fe-${tag}-12-snuffed`);
    // the next run sets out from the Landing again
    await record();
    await g(() => { window.__gw.ui.closeAll?.(); window.__gw.game.startNewRun({ character: 'wick', nightMode: 'still' }); });
    await frames(3);
    const ev2 = await events();
    const iLine = ev2.findIndex((x) => x.e === 'player:glide' && x.p.state === 'line'), iRun = ev2.findIndex((x) => x.e === 'run:start');
    check(iLine >= 0 && iRun > iLine, 'after a snuff the next run glides out again');
    await g(() => window.__gw.game.toTitle());
    await noErrors();
  }

  // ================================================================== release (M2)
  if (only.has('release')) {
    step('release (M2): no hidden-state hook without debug; a fresh save never reaches a lake without the First Evening');
    const browser = page.context().browser();
    const ctx2 = await browser.newContext({ viewport: { width: api.width, height: api.height } });
    const p2 = await ctx2.newPage();
    await p2.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    try {
      await p2.goto(base + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
      await p2.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
      const r = await p2.evaluate(() => {
        const c = window.__gw, d = c.debug;
        const hidden = ['fishChance', 'fishPlan', 'fishOutcome', 'fishSeed', 'preroll', 'fishing', 'fishSigns', 'forceBite', 'instantCatch'].filter((k) => typeof d[k] === 'function');
        return { debug: d.debugEnabled?.(), hidden, viewSpecies: c.fishing?.view?.speciesId ?? null };
      });
      check(r.debug === false && r.hidden.length === 0, 'a release page exposes no species / roll / plan / pre-roll hook on window.__gw', r);
      // a fresh save: the title's first button leads into the First Evening (Begin, or New Descent routed into it)
      await p2.evaluate(() => { localStorage.removeItem('gloomwater.save.v1'); });
      await p2.goto(base + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
      await p2.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
      await p2.evaluate(() => { const c = window.__gw; window.__rel = []; for (const e of ['firstEvening:step', 'run:start', 'zone:change']) c.bus.on(e, (p) => window.__rel.push({ e, id: p?.id, zone: p?.zone })); });
      const clicked = await p2.evaluate(() => {
        const b = [...document.querySelectorAll('#ui button')].find((x) => x.offsetParent && /^\s*(begin|new descent)/i.test(x.textContent));
        if (!b) return null; const t = b.textContent.trim(); b.click(); return t;
      });
      // the New Descent screen (when the title has no Begin): its next buttons, until the First Evening (or a run) begins
      for (let i = 0; i < 40; i++) {
        await p2.waitForTimeout(700);
        const st = await p2.evaluate(() => {
          const ev = window.__rel || [];
          if (ev.some((x) => x.e === 'firstEvening:step' || x.e === 'run:start')) return 'done';
          const vis = [...document.querySelectorAll('#ui button')].filter((x) => x.offsetParent);
          const b = vis.find((x) => /^\s*descend as/i.test(x.textContent)) || vis.find((x) => /^\s*(your first outing|choose the nights)\s*$/i.test(x.textContent));
          if (b) { b.click(); return 'clicked'; }
          return 'wait';
        });
        if (st === 'done') break;
      }
      await p2.waitForTimeout(1000);
      const rel = await p2.evaluate(() => ({ ev: window.__rel, step: window.__gw.firstEvening?.step, flow: window.__gw.flow }));
      check(!!clicked && rel.ev.some((x) => x.e === 'firstEvening:step' && x.id === 'framing') && !rel.ev.some((x) => x.e === 'run:start'), `the fresh save's "${clicked}" opens the First Evening, not a lake (the release checklist)`, rel);
    } catch (e) { check(false, `release page: ${String(e?.message || e).split('\n')[0]}`); }
    await ctx2.close().catch(() => {});
    // Space during the bite strikes and outside it flares (debug page: forceBite exists here)
    await g(() => { window.__gw.game.toTitle(); window.__gw.debug.freshSave(); window.__gw.debug.firstEvening('done'); window.__gw.state.meta.runs = 3; window.__gw.debug.glides('skip'); window.__gw.game.startNewRun({ character: 'wick', nightMode: 'gloomtide' }); window.__gw.ui.closeAll?.(); });
    await frames(4);
    await record();
    const fb = await g(() => { const c = window.__gw; try { c.debug.forceBite?.({ wait: false }); } catch { /* optional */ } return c.fishing.state; });
    if (fb === 'bite') {
      const strikes0 = await g(() => window.__gw.fishing.state);
      await page.keyboard.press('Space');
      await frames(2);
      const ev = await events();
      const st = await g(() => window.__gw.fishing.state);
      check(st !== 'bite' && (ev.some((x) => x.e === 'fishing:strike' || x.e === 'fishing:hook')) && !ev.some((x) => x.e === 'flare'), `Space during the bite strikes (state ${strikes0} → ${st}) and does not flare`);
    } else note(`debug.forceBite did not leave fishing in 'bite' (${fb}); the Space-strike check is skipped`);
    await g(() => { const c = window.__gw; c.fishing.cancel?.('test'); c.state.run.oil = 100; });
    await frames(3);
    await record();
    await page.keyboard.press('Space');
    await frames(3);
    const fl = (await events()).some((x) => x.e === 'flare') || (await g(() => (window.__gw.combat?.flareCd ?? 0) > 0));
    check(fl, 'outside the bite Space flares (Gloomtide)');
    await g(() => window.__gw.game.toTitle());
    await noErrors();
  }

  // ================================================================== perf (the cove's budget during the First Evening)
  if (only.has('perf')) {
    step(`perf (${tag}): draw calls and PointLights at the Landing`);
    await g(() => { window.__gw.game.toTitle(); window.__gw.debug.freshSave(); window.__gw.game.begin(); window.__gw.debug.firstEvening('gate'); });
    const sample = async (q) => {
      await g((q) => { try { window.__gw.render.setQuality?.(q); window.__gw.debug.renderScale?.(1); } catch { /* optional */ } }, q);
      await frames(8);
      return g(() => {
        const r = window.__gw.render, info = r.renderer?.info?.render || {};
        let lights = 0; r.scene?.traverse?.((o) => { if (o.isPointLight && o.visible !== false && o.intensity > 0) lights++; });
        return { calls: info.calls, tris: info.triangles, lights, quality: r.getQuality?.() };
      });
    };
    const hi = await sample('high'), lo = await sample('low');
    log('cove perf:', JSON.stringify({ hi, lo }));
    const B = await g(() => window.__gw.data.COVE.budget);
    if (has.coveWorld) {
      check(hi.calls <= 110 && lo.calls <= 85, `the cove's draw calls ${hi.calls} high / ${lo.calls} low (≤ 110 / ≤ 85)`, { hi, lo });
      check(hi.lights <= B.pointLights && lo.lights <= B.pointLights, `≤ ${B.pointLights} PointLights at the Landing (${hi.lights} / ${lo.lights})`);
    } else note(`perf measured on the fallback lake (no cove world in this build): ${hi.calls} / ${lo.calls} calls, ${hi.lights} / ${lo.lights} PointLights — the budget is asserted on the merged build`);
    await g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.4); } catch { /* optional */ } window.__gw.game.toTitle(); });
  }

  for (const n of notes) log('note:', n);
  log(`first-evening scenario: ${failures.length} failure(s), ${notes.length} note(s)`);
  return { failures };
}
