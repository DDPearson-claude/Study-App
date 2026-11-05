// The automatic-fishing audio (DESIGN §25.14.2a Au2) and the First Evening's audio (§25.14.2b FE-Au1) in the browser, on a v3
// phase-1 build with real WebAudio:
//
//   node build.mjs --dev --out=tools/out/af-audio-v3.html
//   node tools/playtest.mjs --html=tools/out/af-audio-v3.html --shots=tools/out/af-audio-v3 --script=tools/tests/af-audio.scenario.mjs --width=640 --height=360 --lean
//
// The page reloads with v3 on at phase 1, a key press unlocks the graph and a Still run starts. Automatic plays are then driven
// through audio's own listeners (debug.audioEvent: the CONTRACT §13.5 payloads fishing emits — no species on fishing:strike /
// fishing:reel / fishing:escaped; the species first on fishing:caught or fish:escaped), on the audio clock, while
// debug.audioRecord captures the real mix. Each recording is written as a WAV and a spectrogram PNG (with the beats marked) in the
// shots folder, and the checks read debug.audioLog / debug.audioPlay / debug.audio and the recording itself:
//   - every class: its beats are heard; a Small (and a Keeper) never starts the `reel` mood, Prize+ do; the Elder's drone; the
//     Ancient's still is silence (the recording's level drops) and then the crash;
//   - the audio log shows no species voice before the reveal; a Trophy plan with the Sexton and with the Mirror Pike gives the same
//     sounds in the same order up to the reveal, and only the Sexton tolls after it;
//   - the strain whine sits one semitone lower per mean tier; each loss cause has its sound;
//   - the Landing: the cove bed, the ember's swell, the flame catching, Murk's grumble per line, and `setout` (never `descend`) on
//     the first and every later departure.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { wav, spectrogram, fromRecord, rmsBetween } from '../audio-spectro.mjs';

export default async function (api) {
  const { page, frames, evalGame: g, log, shot, args } = api;
  const outDir = resolve(process.cwd(), String(args.shots || 'tools/out/af-audio-v3'));
  mkdirSync(outDir, { recursive: true });
  const failures = [];
  let stepName = 'boot';
  const t0w = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0w) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra).slice(0, 600)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra).slice(0, 600) : '');
    return false;
  };
  const waitFor = async (fn, arg, maxFrames = 120) => { for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg)) return true; await frames(1); } return false; };
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      await frames(2);
      if (!(await g(() => !!window.__gw.ui.isBlocking?.() || window.__gw.paused))) return;
      const m = await g(() => window.__gw.debug.ui?.()?.openModal ?? null);
      if (m === 'levelup') await page.keyboard.press('Digit1');
      else await g(() => { try { window.__gw.ui.closeAll?.(); if (window.__gw.paused) window.__gw.game.resume?.(); } catch { /* optional */ } });
    }
  };

  step('reload with v3 on at phase 1');
  await page.addInitScript(() => { globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; });
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.4); } catch { /* optional */ } });
  const D = await g(() => {
    const d = window.__gw.data;
    return { en: d.V3_ENABLED, ph: d.V3_PHASE, af: d.AUTOFISH, fe: { ember: d.FIRST_EVENING.ember, text: d.FIRST_EVENING.text, everyRun: d.FIRST_EVENING.everyRun }, names: window.__gw.audio.v3Names, moods: window.__gw.audio.v3Moods };
  });
  check(D.en === true && D.ph === 1 && !!D.af, 'v3 phase-1 data with AUTOFISH');
  const AFN = ['strike_clean', 'strike_struck', 'strike_early', 'strike_late', 'reel_take', 'reel_ratchet', 'line_hiss', 'line_hold', 'surge_splash', 'strain_whine',
    'fish_roll', 'fish_skitter', 'fish_pass', 'leap_slap', 'scare_splash', 'reel_scream', 'still_crash', 'loss_snap', 'loss_thrown', 'loss_spat', 'loss_spooled', 'loss_fouled',
    'voice_harpstring', 'voice_vesper', 'voice_sexton', 'voice_clapper', 'voice_wineglass', 'voice_chime', 'cove_ambience', 'cove_bell_far', 'ember_swell', 'flame_catch', 'murk_grumble', 'setout'];
  check(AFN.every((n) => D.names.includes(n)) && D.moods.includes('hub'), 'audio carries the Au2 / FE-Au1 sounds and the hub mood', AFN.filter((n) => !D.names.includes(n)));

  step('unlock the audio and start a Still run');
  await page.keyboard.press('Shift');
  check(await waitFor(() => window.__gw.debug.audio().state === 'running', null, 60), 'the WebAudio graph runs after a gesture');
  await g(() => {
    const c = window.__gw;
    c.game.wipeAll?.();
    c.game.startNewRun({ character: 'wick', nightMode: 'still' });
    const r = c.state.run;
    if (r && !r.nightMode) r.nightMode = 'still';
    if (r && !r.outing) r.outing = 'normal';
    try { c.debug.god?.(true); } catch { /* optional */ }
  });
  await clearModals();
  await frames(6);
  // the page-side driver: events on the audio clock, moods sampled, snapshots of debug.audioPlay at marked times, the mix recorded
  await g(() => {
    window.__afRun = (timeline, recSec) => new Promise((resolve) => {
      const c = window.__gw;
      const t0 = c.debug.audio().time;
      const rec = recSec > 0 ? c.debug.audioRecord(recSec) : Promise.resolve(null);
      const q = timeline.slice().sort((a, b) => a.t - b.t);
      const moods = [], snaps = {};
      const end = Math.max(recSec || 0, (q.at(-1)?.t ?? 0) + 0.3);
      const tick = () => {
        const t = c.debug.audio().time - t0;
        while (q.length && q[0].t <= t) {
          const e = q.shift();
          if (e.flow) c.flow = e.flow;
          if (e.evt) c.debug.audioEvent(e.evt, e.p || {});
          if (e.snap) snaps[e.snap] = { at: t, play: c.debug.audioPlay(), audio: c.debug.audio() };
        }
        const m = c.debug.audio().mood;
        if (moods.at(-1)?.[1] !== m) moods.push([+t.toFixed(2), m]);
        if (t < end) setTimeout(tick, 15);
        else rec.then((r) => resolve({ t0, moods, snaps, log: c.debug.audioLog(240).filter((x) => x.at >= t0 - 0.005), rec: r }));
      };
      tick();
    });
  });

  // ------------------------------------------------------------------ class-level plans (as fishing-play.js lays them out)
  let seed = 20261105;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const BEAT = D.af.play.beat;
  function makePlan(cls) {
    const P = D.af.play[cls], U = (r) => r[0] + (r[1] - r[0]) * rnd(), I = (r) => Math.round(U(r));
    const acts = [];
    for (let i = 0; i < I(P.runs); i++) acts.push({ phase: 'run', kind: cls === 'elder' && i === 0 ? 'long' : null });
    for (let i = 0; i < I(P.surges); i++) acts.push({ phase: 'surge' });
    if (cls !== 'small') acts.push({ phase: 'hold' });
    for (let i = 0; i < (P.lastStand || 0); i++) acts.push({ phase: 'lastStand' });
    if (P.still) acts.splice(acts.length - 1, 0, { phase: 'still' });
    const seq = [{ phase: 'take' }];
    for (const a of acts) seq.push({ phase: 'gain' }, a);
    seq.push({ phase: 'gain' }, { phase: 'lift' });
    // beat lengths from AUTOFISH.play.beat, then scaled to the class's play length (AUTOFISH.play[class].dur, as planPlay does);
    // the still keeps its 1.5 s
    const raw = seq.map((b) => (b.phase === 'still' ? 1.5 : U(BEAT[b.phase] || [0.6, 1])));
    const want = P.dur[0] + (P.dur[1] - P.dur[0]) * (0.25 + 0.3 * rnd());
    const fixed = seq.reduce((a, b, i) => a + (b.phase === 'still' ? raw[i] : 0), 0);
    const k = Math.max(0.2, (want - fixed) / Math.max(0.1, raw.reduce((a, v, i) => a + (seq[i].phase === 'still' ? 0 : v), 0)));
    let t = 0;
    const beats = seq.map((b, i) => { const d = b.phase === 'still' ? raw[i] : raw[i] * k; const x = { ...b, t, dur: d }; t += d; return x; });
    const dur = t, ev = [];
    const nG = cls === 'small' ? 0 : I(P.glimpses);
    for (let i = 0; i < nG; i++) ev.push({ phase: 'glimpse', kind: i === 1 && (cls === 'elder' || cls === 'ancient') ? 'pass' : cls === 'keeper' ? 'swirl' : i === 1 ? 'tailSlap' : 'roll', t: dur * (0.2 + 0.6 * (i + 0.5) / nG), dur: U(BEAT.glimpse) });
    if (cls === 'small') ev.push({ phase: 'glimpse', kind: 'skitter', t: beats.at(-1).t, dur: beats.at(-1).dur });
    const nS = I(D.af.play.scare[cls]);
    for (let i = 0; i < nS; i++) ev.push({ phase: 'scare', kind: i % 2 ? 'shake' : 'slack', t: dur * (0.3 + 0.35 * i / Math.max(1, nS)), dur: U(BEAT.scare) });
    if (cls !== 'small') ev.push({ phase: 'leap', kind: D.af.leap.kind[cls], t: dur * 0.42, dur: U(BEAT.leap) });
    return { beats, ev, dur };
  }
  const LAD = (cls) => D.af.proxy.ladder[cls] * D.af.proxy.lakeMult.mossmere;
  /** The timeline of one play, exactly the payloads fishing emits (no species until the reveal / the note). */
  function playTimeline(cls, plan, { speciesId, tier = 1, outcome = 'land', reason = 'thrown', lossAt = 0.75, grade = 'struck' } = {}) {
    const sizeClass = cls === 'ancient' ? 'elder' : cls, extra = cls === 'ancient' ? { ancient: true } : {};
    const T = [{ t: 0.05, evt: 'fishing:strike', p: { grade, sizeClass, ...extra } }, { t: 0.05, evt: 'fishing:hook', p: { grade, perfect: grade === 'clean', sizeClass, ...extra } }];
    const lossT = outcome === 'lose' ? plan.dur * lossAt : Infinity;
    const at = (x) => 0.15 + x;
    for (const b of plan.beats) if (b.t < lossT) {
      T.push({ t: at(b.t), evt: 'fishing:reel', p: { phase: b.phase, ...(b.kind ? { kind: b.kind } : {}), sizeClass, ...extra, t: +b.t.toFixed(2), dur: +b.dur.toFixed(2), strength: b.phase === 'surge' || b.phase === 'lastStand' ? 1 : 0.6, tier } });
      if (b.phase === 'still') { T.push({ t: at(b.t) + 0.5, snap: 'still' }); T.push({ t: at(b.t) - 0.4, snap: 'beforeStill' }); }
      if (b.phase === 'lastStand') T.push({ t: at(b.t) + 1.2, snap: 'lastStand' });
      if (b.phase === 'hold') T.push({ t: at(b.t) + Math.min(0.8, b.dur * 0.6), snap: 'hold' });
    }
    for (const e of plan.ev) if (e.t < lossT) {
      T.push({ t: at(e.t), evt: 'fishing:reel', p: { phase: e.phase, kind: e.kind, sizeClass, ...extra, t: +e.t.toFixed(2), dur: +e.dur.toFixed(2), strength: 0.6, tier, length: +LAD(cls).toFixed(3) } });
      if (e.phase === 'scare' && !T.some((x) => x.snap === 'scare')) T.push({ t: at(e.t) + 0.08, snap: 'scare' });
    }
    T.push({ t: at(plan.dur * 0.5), snap: 'mid' });
    if (outcome === 'lose') {
      T.push({ t: at(lossT), evt: 'fishing:reel', p: { phase: 'loss', sizeClass, ...extra, t: +lossT.toFixed(2), dur: 0.6, strength: 1, tier } });
      T.push({ t: at(lossT), evt: 'fishing:escaped', p: { reason, sizeClass, ...extra } });
      T.push({ t: at(lossT) + 0.6, mark: 'note', evt: 'fish:escaped', p: { speciesId, sizeClass, ...extra, approxLength: 120, reason, place: null, markedFish: false, grade, legendary: false } });
      T.push({ t: at(lossT) + 0.65, evt: 'fishing:state', p: { state: 'idle', prev: 'lost' } });
    } else {
      T.push({ t: at(plan.dur) + 0.35, mark: 'reveal', evt: 'fishing:caught', p: { speciesId, weight: 1, quality: 'normal', z: 1.5, sizeClass, ancient: cls === 'ancient', length: 90, fish: { uid: `${speciesId}-${cls}` }, grade, zone: 'mossmere' } });
      T.push({ t: at(plan.dur) + 2.4, evt: 'fishing:state', p: { state: 'idle', prev: 'landing' } });
    }
    return T;
  }
  const revealT = (T) => T.find((x) => x.mark === 'reveal' || x.mark === 'note')?.t ?? Infinity;
  async function runAndSave(name, T, recSec) {
    const r = await g(([T, s]) => window.__afRun(T, s), [T, recSec]);
    if (r.rec) {
      const pcm = fromRecord(r.rec);
      const marks = T.filter((x) => x.evt === 'fishing:reel' || x.evt === 'fishing:strike' || x.mark).map((x) => [x.p?.phase || x.evt, x.t]);
      writeFileSync(resolve(outDir, `${name}.wav`), wav(pcm, r.rec.sampleRate));
      writeFileSync(resolve(outDir, `${name}.png`), spectrogram(pcm, r.rec.sampleRate, marks));
      r.pcm = pcm; r.sr = r.rec.sampleRate;
      log(`     recorded ${name}: ${(pcm[0].length / r.sr).toFixed(1)} s → ${name}.png / .wav`);
      delete r.rec;
    }
    r.before = r.log.filter((x) => x.at - r.t0 < revealT(T) - 0.02);
    r.after = r.log.filter((x) => x.at - r.t0 >= revealT(T) - 0.02);
    return r;
  }
  const PLAYN = /^(reel_|line_|surge_|strain_|fish_|leap_|scare_|still_)/;

  // ------------------------------------------------------------------ the plays, class by class
  const plans = {};
  for (const cls of ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient']) {
    step(`an automatic ${cls} play`);
    const plan = plans[cls] = makePlan(cls);
    const T = playTimeline(cls, plan, { speciesId: cls === 'trophy' ? 'the_sexton' : 'reedjaw_pike', tier: 1 });
    if (cls === 'elder') setTimeout(() => { shot('af-elder-play').catch(() => {}); }, 6000);
    const r = await runAndSave(`play_${cls}`, T, plan.dur + 3.2);
    const nm = r.before.map((x) => x.name);
    const want = { small: ['reel_take', 'reel_ratchet', 'fish_skitter'], keeper: ['reel_take', 'reel_ratchet', 'line_hiss', 'line_hold', 'fish_roll', 'leap_slap'],
      prize: ['line_hiss', 'surge_splash', 'strain_whine', 'fish_roll', 'leap_slap', 'scare_splash'], trophy: ['line_hiss', 'surge_splash', 'fish_roll', 'leap_slap'],
      elder: ['reel_scream', 'fish_pass', 'leap_slap', 'line_hold'], ancient: ['reel_scream', 'still_crash', 'fish_pass'] }[cls];
    check(want.every((n) => nm.includes(n)), `${cls}: its beats are heard (${[...new Set(nm.filter((n) => PLAYN.test(n)))].join(' ')})`, want.filter((n) => !nm.includes(n)));
    check(r.before.filter((x) => PLAYN.test(x.name)).every((x) => x.why === cls), `${cls}: every play sound is logged with its class`);
    const moods = r.moods.map((m) => m[1]);
    if (cls === 'small' || cls === 'keeper') check(!moods.includes('reel'), `${cls}: never the reel mood (${moods.join(' → ')})`);
    else check(moods.includes('reel'), `${cls}: the reel mood (${moods.join(' → ')})`);
    if (cls === 'keeper') check(r.snaps.mid?.play?.params?.pulse > 0, 'keeper: the bed carries a soft pulse', r.snaps.mid?.play?.params);
    if (cls === 'prize' || cls === 'trophy' || cls === 'elder') check(r.snaps.mid?.play?.params?.reelLevel > 0, `${cls}: the score's reel level ${r.snaps.mid?.play?.params?.reelLevel}`);
    if (r.snaps.scare) check(r.snaps.scare.play.hum.muted === true, `${cls}: the scare stops the line's hum`, r.snaps.scare.play.hum);
    if (r.snaps.hold) check(r.snaps.hold.play.hum.on && r.snaps.hold.play.hum.target === 1, `${cls}: the line hums through the hold`, r.snaps.hold.play.hum);
    if (cls === 'elder' || cls === 'ancient') check(r.snaps.lastStand?.audio?.loops?.drone === true && r.snaps.lastStand.play.drone.target > 1, `${cls}: the low drone swells on the last stand`, r.snaps.lastStand?.play?.drone);
    if (cls === 'ancient') {
      check(r.snaps.still?.play?.still === true && r.snaps.still.play.hum.level === 0 && r.snaps.still.play.duck <= 0.02, 'ancient: the still — hum and score silent', r.snaps.still?.play);
      check(r.snaps.mid?.play?.params?.heart === true, 'ancient: the heartbeat under the reel');
      const st = plan.beats.find((b) => b.phase === 'still');
      if (r.pcm && st) {
        const s0 = 0.15 + st.t, inStill = rmsBetween(r.pcm, r.sr, s0 + 0.5, s0 + 1.4), before = rmsBetween(r.pcm, r.sr, s0 - 1.2, s0 - 0.1);
        check(inStill < before * 0.6, `ancient: the recording falls quiet in the still (rms ${inStill.toFixed(4)} vs ${before.toFixed(4)} just before)`);
      }
    }
    check(!r.before.some((x) => /^voice_/.test(x.name)), `${cls}: no species voice before the reveal`);
    if (cls === 'trophy') check(r.after.filter((x) => /^voice_/.test(x.name)).map((x) => x.why).join() === 'the_sexton', 'trophy: the Sexton tolls once, at the reveal', r.after.map((x) => x.name));
    await clearModals();
  }

  step('species swap: the same Trophy plan with the Mirror Pike');
  {
    const T = playTimeline('trophy', plans.trophy, { speciesId: 'mirror_pike', tier: 1 });
    const r2 = await runAndSave('play_trophy_mirror_pike', T, 0);
    const T1 = playTimeline('trophy', plans.trophy, { speciesId: 'the_sexton', tier: 1 });
    const r1 = await runAndSave('play_trophy_sexton_again', T1, 0);
    // the play's own sounds (the lake goes on around it: Murk's bell, a rise ring or the bed may fall anywhere in either run)
    const PLAYSND = /^(strike_|reel_|line_|surge_|strain_|fish_|leap_|scare_|still_|loss_|voice_|gotaway)/;
    const mine = (r) => r.before.filter((x) => PLAYSND.test(x.name));
    const seq = (r) => mine(r).map((x) => `${x.name}:${x.why ?? ''}`);
    check(JSON.stringify(seq(r1)) === JSON.stringify(seq(r2)), `the same sounds, in the same order, up to the reveal (${seq(r1).length})`, { a: seq(r1).slice(0, 12), b: seq(r2).slice(0, 12) });
    const rel = (r) => mine(r).map((x) => x.t - r.t0);
    const dmax = Math.max(...rel(r1).map((v, i) => Math.abs(v - (rel(r2)[i] ?? 99))));
    check(dmax < 0.2, `… at the same moments (largest drift ${dmax.toFixed(3)} s on a loaded audio clock)`);
    check(r2.after.every((x) => !/^voice_/.test(x.name)) && r1.after.some((x) => x.name === 'voice_sexton'), 'only the Sexton sings at the reveal');
  }

  step('the strain whine: one semitone lower per mean tier');
  {
    const f = [];
    for (const tier of [0, 1, 2, 3, 4]) {
      const r = await runAndSave(`strain_t${tier}`, [{ t: 0.05, evt: 'fishing:strike', p: { grade: 'struck', sizeClass: 'trophy' } },
        { t: 0.1, evt: 'fishing:reel', p: { phase: 'surge', sizeClass: 'trophy', t: 2, dur: 0.8, strength: 1, tier } }, { t: 0.2, snap: 's' },
        { t: 1.2, evt: 'fishing:state', p: { state: 'idle' } }], 0);
      f.push(r.snaps.s.play.strain);
    }
    const ratios = f.slice(1).map((v, i) => v / f[i]);
    check(ratios.every((q) => Math.abs(q - Math.pow(2, -1 / 12)) < 3e-4), `strain whine ${f.map((v) => v.toFixed(1)).join(' → ')} Hz`, ratios);
  }

  step('losses by cause');
  {
    const want = { snapped: 'loss_snap', thrown: 'loss_thrown', spat: 'loss_spat', spooled: 'loss_spooled', fouled: 'loss_fouled', staggered: 'loss_snap' };
    for (const [reason, sfx] of Object.entries(want)) {
      const plan = makePlan('elder');
      const T = playTimeline('elder', plan, { speciesId: 'reedjaw_pike', outcome: 'lose', reason, lossAt: 0.6 });
      const r = await runAndSave(`loss_${reason}`, T, reason === 'snapped' || reason === 'spooled' ? plan.dur * 0.6 + 3 : 0);
      const l = r.before.filter((x) => /^loss_/.test(x.name));
      check(l.length === 1 && l[0].name === sfx && l[0].why === reason, `${reason}: ${sfx}`, l);
      check(r.after.some((x) => x.name === 'gotaway') && !r.log.some((x) => /^voice_/.test(x.name)), `${reason}: the note (an Elder: the card) rings, and no voice`);
    }
  }

  step('let it pass; a spooked fish');
  {
    const r = await runAndSave('miss', [{ t: 0.05, evt: 'fishing:miss', p: { reason: 'passed', refunded: true, favour: 0.15, lingers: false } }, { t: 0.6, evt: 'fishing:miss', p: { reason: 'spooked' } }], 0);
    check(r.log.map((x) => x.name).join() === 'bite_pass,denied', 'passed → bite_pass; spooked → denied', r.log.map((x) => x.name));
  }
  await shot('af-after-plays');

  // ------------------------------------------------------------------ with AF fishing in the build (the staged merge): a real play
  const realAF = await g(() => { const d = window.__gw.debug; return typeof d.fishOutcome === 'function' && typeof d.fishPlan === 'function' && typeof d.forceBite === 'function'; });
  if (!realAF) log('note: AF fishing (F4′ / F2′ and its debug hooks) is not in this build: the real-play step is skipped (the plays above drive audio\'s listeners directly)');
  else {
    for (const [name, sp, z] of [['trophy', 'the_sexton', 2.2], ['small', 'dusk_minnow', -0.9]]) {
      step(`a real automatic ${name} play (AF fishing)`);
      await clearModals();
      const t0 = await g(() => window.__gw.debug.audio().time);
      await g(([sp, z]) => {
        const c = window.__gw;
        window.__caughtAt = null; window.__moods = [];
        if (!window.__caughtHook) { window.__caughtHook = true; c.bus.on('fishing:caught', () => { window.__caughtAt = c.debug.audio().time; }); }
        c.debug.fishSeed(20261105 + Math.round(z * 100)); c.debug.fishOutcome('land');
        c.debug.forceBite({ speciesId: sp, z, wait: 1.6 });
      }, [sp, z]);
      const bit = await g(() => new Promise((res) => { const c = window.__gw, t = performance.now(); c.debug.timeScale?.(3);
        const k = () => { if (c.fishing.state === 'bite') { c.debug.timeScale?.(0.3); return res(true); } if (performance.now() - t > 600000) return res(false); requestAnimationFrame(k); }; k(); }));
      await page.mouse.click(api.width * 0.5, api.height * 0.42);
      await frames(1);
      const st = await g(() => { window.__gw.debug.timeScale?.(1); return window.__gw.fishing.state; });
      check(bit && st === 'reeling', `${name}: a click on the bite strikes and the play begins (${st})`);
      await g(() => new Promise((res) => { const c = window.__gw, t = performance.now();
        const k = () => { const m = c.debug.audio().mood; if (window.__moods.at(-1) !== m) window.__moods.push(m);
          if (c.debug.ceremony?.()?.active && c.debug.ceremony().t > 0.8) c.fishing.skipCeremony?.();
          if (c.ui.isBlocking?.()) { try { c.ui.closeAll?.(); } catch { /* optional */ } }
          if (c.fishing.state === 'idle' || performance.now() - t > 900000) return res(true); requestAnimationFrame(k); }; k(); }));
      const r = await g((t0) => ({ log: window.__gw.debug.audioLog(240).filter((x) => x.at >= t0 - 0.005), caughtAt: window.__caughtAt, moods: window.__moods }), t0);
      const before = r.log.filter((x) => r.caughtAt === null || x.at < r.caughtAt - 0.002), after = r.log.filter((x) => r.caughtAt !== null && x.at >= r.caughtAt - 0.002);
      const nm = before.map((x) => x.name);
      check(nm.some((n) => /^strike_/.test(n)) && nm.includes('reel_take') && nm.includes('reel_ratchet'), `${name}: the real play is heard (${[...new Set(nm)].join(' ')})`);
      check(before.filter((x) => PLAYN.test(x.name)).every((x) => x.why === name), `${name}: every play sound carries the class (${name})`);
      check(!before.some((x) => /^voice_/.test(x.name)), `${name}: no species voice before fishing:caught`);
      if (name === 'trophy') check(after.some((x) => x.name === 'voice_sexton') && r.moods.includes('reel'), `trophy: the Sexton tolls at the reveal; the score went to reel (${r.moods.join(' → ')})`);
      else check(!r.moods.includes('reel'), `small: never the reel mood (${r.moods.join(' → ')})`);
    }
  }

  // ------------------------------------------------------------------ the Landing and the First Evening
  step('the Landing: the cove bed, the Lantern Line, the wake, Murk');
  {
    const F = D.fe;
    const T = [
      { t: 0.02, flow: 'hub', evt: 'zone:change', p: { zone: 'cove', hub: true, prev: 'mossmere', from: 'title' } },
      { t: 0.05, evt: 'hub:enter', p: { from: 'boot' } },
      { t: 0.1, evt: 'firstEvening:step', p: { id: 'framing', prev: null, replay: false } },
      { t: 0.1, evt: 'firstEvening:line', p: { kind: 'lore', key: 'lore0', text: F.text.lore[0] } },
      { t: 0.1 + F.ember.at, evt: 'firstEvening:beat', p: { id: 'ember', step: 'framing' } },
      { t: 3.1, evt: 'firstEvening:line', p: { kind: 'lore', key: 'lore1', text: F.text.lore[1] } },
      { t: 6.3, evt: 'firstEvening:line', p: { kind: 'lore', key: 'lore2', text: F.text.lore[2] } },
      { t: 6.5, snap: 'framing' },
      { t: 9.1, evt: 'firstEvening:step', p: { id: 'wake', prev: 'framing', replay: false } },
      { t: 10.3, evt: 'firstEvening:line', p: { kind: 'murk', key: 'murkWake', text: F.text.murkWake } },
      { t: 16.2, evt: 'firstEvening:line', p: { kind: 'murk', key: null, text: '' } },
      { t: 16.4, evt: 'firstEvening:line', p: { kind: 'murk', key: 'murkOdds', text: F.text.murkOdds } },
      { t: 18.0, snap: 'hub' },
    ];
    const r = await runAndSave('first_evening', T, 19);
    const n = r.log.map((x) => x.name);
    check(!n.includes('descend') && !n.includes('setout'), 'entering the Landing rings no sting');
    check(r.snaps.framing?.audio?.loops?.cove === true && r.snaps.framing.audio.cove.bed, 'the cove bed (the hearth, the water) runs at the Landing', r.snaps.framing?.audio?.cove);
    check(r.snaps.hub?.audio?.mood === 'hub' && r.snaps.hub.audio.zone === 'cove', 'the hub mood, in the cove colour', { mood: r.snaps.hub?.audio?.mood, zone: r.snaps.hub?.audio?.zone });
    check(n.filter((x) => x === 'ember_swell').length === 1, 'the ember swells once, far down the channel');
    check(n.filter((x) => x === 'flame_catch').length === 1, 'the wake: the flame catches');
    check(r.log.filter((x) => x.name === 'murk_grumble').map((x) => x.why).join() === 'murkWake,murkOdds', "Murk's grumble per line (none for lore lines or a cleared line)", r.log.filter((x) => x.name === 'murk_grumble'));
    check(n.includes('cove_ambience'), 'the water breathes at the quay (cove_ambience)');
    await shot('af-first-evening');
  }

  step('setout, never descend: the first and every later departure');
  {
    const F = D.fe;
    const T = [{ t: 0.05, flow: 'playing', evt: 'zone:change', p: { zone: 'mossmere', prev: 'cove' } }, { t: 0.06, evt: 'run:start', p: { continued: false } }];
    let t = 4.5;
    for (let run = 2; run <= 3; run++) {
      const key = F.everyRun.murk[run % F.everyRun.murk.length];
      T.push({ t, flow: 'hub', evt: 'zone:change', p: { zone: 'cove', hub: true, prev: 'mossmere', from: 'title' } });
      T.push({ t: t + 0.1, evt: 'firstEvening:line', p: { kind: 'murk', key, text: F.text[key], everyRun: true } });
      T.push({ t: t + 3.1, flow: 'playing', evt: 'zone:change', p: { zone: 'mossmere', prev: 'cove' } });
      T.push({ t: t + 3.12, evt: 'run:start', p: { continued: false } });
      t += 7.5;
    }
    T.push({ t: t, evt: 'zone:change', p: { zone: 'sporewood', prev: 'mossmere' } });
    T.push({ t: t + 3.5, evt: 'zone:change', p: { zone: 'mossmere', prev: 'cove', continued: true } });
    const r = await runAndSave('setout', T, t + 4.5);
    const stings = r.log.filter((x) => x.name === 'setout' || x.name === 'descend').map((x) => x.name);
    check(JSON.stringify(stings) === JSON.stringify(['setout', 'setout', 'setout', 'descend']), `three departures from the Landing set out; the gate passage descends; the Continue rings nothing (${stings.join(', ')})`);
    check(r.log.filter((x) => x.name === 'murk_grumble').length === 2, "Murk grumbles each later run's glide line");
  }
  await g(() => { window.__gw.flow = 'playing'; });
  await frames(3);

  step('errors');
  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs);
  log(`done in ${((Date.now() - t0w) / 1000).toFixed(0)} s`);
  return { failures };
}
