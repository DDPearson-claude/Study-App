// The user's look for M1 step 3a (docs/loop/m1-step3a/PLAN.md §6, T150; lane D owns this file): every frame the five sheets ask for,
// shot on a loop dev build from the step-2 save, into <shots>/<sheet>/ with a notes.json beside them; tools/look-sheet.mjs composes them.
//
//   node build.mjs --dev --out=tools/out/m1-s3a/loop.html
//   node tools/playtest.mjs --html=tools/out/m1-s3a/loop.html --shots=tools/out/m1-s3a/look --script=tools/tests/loop-3a-look.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/m1-s3a/loop.html --shots=tools/out/m1-s3a/look --script=tools/tests/loop-3a-look.scenario.mjs --mobile
//   (sheet 4: run both sizes once more with --redress, which loads ?redress=1: the right-hand half of redress.jpg)
//   node tools/look-sheet.mjs --in=tools/out/m1-s3a/look --out=tools/out/m1-s3a/sheets
// Options: --sheets=places,giants,catalogue,redress,hud (default all but redress; --redress shoots sheet 4's re-dressed side)
//          --only=<place id>[,…] (sheet 1's places)  --quality=low|medium|high  --frames (no shots: the walk and its checks only)
//
// Frames are named <tag>-<sheet>-NN-<what>.png (tag desk or phone), and every frame's note (place, light, what it shows, the bank
// readout) goes to <shots>/notes.json, merged across runs. Time is loop-1a's synthetic clock; the light is set with the built
// ctx.debug.setPhase; the places are driven through loop-3a's helper (D's own APIs, or lane B's ctx.debug.loop when present).
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { makeKit3a, seededSave, PLACE_IDS } from './loop-3a.scenario.mjs';
import { Abort } from './loop-1a.scenario.mjs';

/** The frames of sheet 1 for one place (pure: the dry run checks the list). */
export function placeFrames(id) {
  const out = [
    { light: 'dusk', what: 'bank', note: 'the bank at dusk from the raft (before)' },
    { light: 'dusk', what: 'lift-thin', note: 'the lift: the bank thinning' },
    { light: 'dusk', what: 'lift-framed', note: 'the lift: the landmark framed' },
    { light: 'dusk', what: 'lift-title', note: 'the lift: the title card' },
    { light: 'dusk', what: 'lifted-a', note: 'lifted, dusk, pose a (the raft)' },
    { light: 'dusk', what: 'lifted-b', note: 'lifted, dusk, pose b' },
    { light: 'gloomtide', what: 'night-a', note: 'lifted, night, pose a (the raft)' },
    { light: 'gloomtide', what: 'night-b', note: 'lifted, night, pose b' },
  ];
  if (id === 'lily_maze' || id === 'bell_pool') out.push({ light: 'calm', what: 'day-a', note: 'lifted, late day (pose a)' }, { light: 'calm', what: 'day-b', note: 'lifted, late day (pose b)' });
  return out;
}
/** Pose a for each place: where the raft sits to look at it (the play camera looks north), clear of every other bank and island. */
export const POSE_A = {
  lily_maze: { x: -36, z: 38 },
  under_the_span: { x: -20, z: 16 },
  buoy_lights: { x: -45, z: 13 },
  bell_pool: { x: -4, z: 0 },
};
/** Pose b for each place: a still lens {pos, look, fov} laid over the rig (the other side of the place from the raft's pose a). */
export const POSE_B = {
  lily_maze: { pos: [-28, 5.5, 34], look: [-41, 0.2, 23.5], fov: 50 },
  under_the_span: { pos: [-22, 4.2, -9], look: [-31, 1.8, 1.5], fov: 52 },
  buoy_lights: { pos: [-41, 4.5, -18], look: [-48, 0.2, -1], fov: 52 },
  bell_pool: { pos: [4, 6.5, -11.5], look: [-3.5, 0, -16.6], fov: 50 },   // (on its drowned bell, which lies in the pool's north half: the fix pass)
};
/** Sheet 4's poses: the same four poses with LOOP.redress off and on. */
export const REDRESS_POSES = [
  { what: 'gate', note: 'the Sunken Gate and its tower', pos: [0, 9, -18], look: [0, 18, -80], fov: 55 },
  { what: 'veil', note: 'the east cliff and the Sluice Veil', pos: [30, 6, 8], look: [62, 8, 4], fov: 55 },
  { what: 'lamp', note: 'a lamp pylon\'s post, or its bollard and buoy-lantern', pos: [18.5, 3.6, 2.5], look: [12, 2.2, -5], fov: 50 },
  { what: 'bridge', note: 'the Toppled Bridge for reference', pos: [-24, 5, 12], look: [-30, 2, 0], fov: 55 },
];

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'look' });
  const shotsRoot = resolve(process.cwd(), String(args.shots || 'tools/out/m1-s3a/look'));
  const redress = !!args.redress;
  const sheets = typeof args.sheets === 'string' ? args.sheets.split(',') : redress ? ['redress'] : ['places', 'giants', 'catalogue', 'hud'];
  const only = typeof args.only === 'string' ? args.only.split(',') : PLACE_IDS;
  const notesPath = resolve(shotsRoot, 'notes.json');
  const notes = existsSync(notesPath) ? JSON.parse(readFileSync(notesPath, 'utf8')) : {};
  const saveNotes = () => { mkdirSync(shotsRoot, { recursive: true }); writeFileSync(notesPath, JSON.stringify(notes, null, 1)); };
  let n = 0;
  /** Shoot one frame of a sheet (a drawn frame first), with its note. */
  const frame = async (sheet, what, note, extra = {}) => {
    const dir = resolve(shotsRoot, sheet);
    mkdirSync(dir, { recursive: true });
    const name = `${K.tag}-${sheet}-${String(++n).padStart(2, '0')}-${what}`;
    if (!args.frames) {
      try { await g(() => window.__lp.step(1, 1 / 120, true)); } catch { /* between loads */ }
      await api.wait(90);
      await page.screenshot({ path: resolve(dir, `${name}.png`), timeout: 120000 }).catch((e) => K.note(`screenshot ${name}: ${String(e?.message || e).split('\n')[0]}`));
    }
    const ro = await K.places.readout().catch(() => null);
    notes[`${sheet}/${name}`] = { sheet, what, note, size: K.tag, redress, ...extra, banks: ro?.world?.banks?.map((b) => `${b.id}:${b.op}`) ?? null };
    saveNotes();
    log('frame', name, note);
  };
  const settle = async (sec = 2.5) => { await K.secs(sec); };
  try {
    K.step(`boot (${redress ? 'redress on' : 'today'})`);
    await K.boot(seededSave({ clams: 3000, holdSlots: 6 }), { query: redress ? '&redress=1' : '' });
    const R = await g(() => ({ loop: window.__gw.data.LOOP_ENABLED === true, redress: window.__gw.data.LOOP?.redress === true }));
    K.need(R.loop, 'a loop build');
    K.check(R.redress === redress, `LOOP.redress is ${redress} on this page`, R);
    await K.toJetty();
    await K.sail(null);
    await K.places.unlift();
    await settle(1);

    // ------------------------------------------------------------ sheet 1: the places
    if (sheets.includes('places')) {
      K.step('sheet 1: the backs at night and the banks at dusk (before any lift)');
      for (const id of ['under_the_span', 'buoy_lights']) {
        await K.places.light('dusk', 0.5); await K.places.pose(POSE_A[id].x, POSE_A[id].z); await settle(3);
        await frame('places', `${id}-bank-dusk`, `${id}: the bank at dusk, no back (PLAN CHOICE 10)`, { place: id, light: 'dusk' });
        await K.places.light('gloomtide', 0.35); await settle(3);
        await K.places.back(id); await K.secs(0.95);
        await frame('places', `${id}-back-night`, `${id}: a giant's back turning in its bank at night`, { place: id, light: 'gloomtide' });
        await K.secs(1.5);
      }
      K.step('sheet 1: the raft inside an unowned bank');
      await K.places.light('dusk', 0.6); await K.places.at('under_the_span', { dx: -4 }); await settle(2.5);
      await frame('places', 'inside-bank', 'the raft inside Under the Span\'s bank: the whole bank thinned, no clearing round the raft', { place: 'under_the_span' });
      await K.places.at('lily_maze', {}); await settle(2.5);
      await frame('places', 'inside-bank-lily', 'the raft inside the Lily Maze\'s bank', { place: 'lily_maze' });

      for (const id of only) {
        K.step(`sheet 1: ${id}`);
        for (const f of placeFrames(id)) {
          await K.places.light(f.light, f.light === 'calm' ? 0.55 : 0.45);
          if (f.what === 'bank') { await K.places.unlift(); await K.places.pose(POSE_A[id].x, POSE_A[id].z); await settle(3); }
          if (f.what === 'lift-thin') { await K.places.own(id); await K.places.lift(id, { play: true }); await K.secs(1.3); }
          if (f.what === 'lift-framed') await K.secs(1.5);
          if (f.what === 'lift-title') await K.secs(0.6);
          if (f.what === 'lifted-a' || f.what === 'night-a' || f.what === 'day-a') { await K.secs(2); await K.places.camera(null); await K.places.pose(POSE_A[id].x, POSE_A[id].z); await settle(f.what === 'lifted-a' ? 2 : 3.5); }
          if (f.what.endsWith('-b')) { await K.places.camera(POSE_B[id]); await settle(0.6); }
          await frame('places', `${id}-${f.what}`, `${id}: ${f.note}`, { place: id, light: f.light });
          if (f.what.endsWith('-b')) await K.places.camera(null);
        }
      }
      K.step('sheet 1: the cast into a bank (lane B\'s mist cast)');
      await K.places.unlift();
      // (a clear gap of water between the raft and the bank's feathered edge, so the float lands inside the mist: the fix pass)
      await K.places.light('dusk', 0.5); await K.places.at('bell_pool', { back: 4 }); await settle(2);
      // (a forced cast from just outside the bank lands in it: lane B's mist cast sinks the float into the bank and brings it back)
      const ev0 = await K.evCount();
      await g(() => { const d = window.__gw.debug; try { window.__gw.fishing.cancel?.('debug'); d.forceBite?.({ wait: 2 }); } catch { /* optional */ } });
      await K.secs(0.5);
      const cast = (await K.events(ev0)).some((e) => e.e === 'fishing:mist') || await g(() => window.__lp.ev.some((e) => e.e === 'fishing:mist'));
      if (!cast) K.note('no fishing:mist: the cast into a bank is lane B\'s (the frames wait for the stage)');
      else {
        await K.secs(0.9); await frame('places', 'cast-sinking', 'the cast into a bank: the float sinking into it', { place: 'bell_pool' });
        await K.secs(1.2); await frame('places', 'cast-rising', 'the cast into a bank: the float back', { place: 'bell_pool' });
      }
    }

    // ------------------------------------------------------------ sheet 4: the re-dress (both halves: today, then --redress)
    if (sheets.includes('redress') || (sheets.includes('places') && !redress && !args.noredress)) {
      K.step(`sheet 4: the harbour ${redress ? 're-dressed' : 'today'}`);
      await K.places.lift('all', { play: false });   // (the harbour, not the mist: every place lifted on both sides)
      // (both halves at the same moment: no Murk line on either; the re-dressed run, shot straight after its sail out, waited for none and
      // caught his sail-out line on the phone: the fix pass)
      await K.until("!document.querySelector('.gw-toast--murk.gw-in')", 12);
      for (const light of ['dusk', 'gloomtide']) {
        await K.places.light(light, 0.45); await K.places.pose(-6, 30, 0); await settle(3);
        await g(() => { for (const el of document.querySelectorAll('.gw-toast--murk')) { el.classList.remove('gw-in'); el.classList.add('gw-out'); } });
        for (const p of REDRESS_POSES) {
          await K.places.camera({ pos: p.pos, look: p.look, fov: p.fov }); await settle(0.5);
          await frame('redress', `${p.what}-${light}-${redress ? 'on' : 'off'}`, `${p.note}, ${light}, ${redress ? 're-dressed' : 'today'}`, { side: redress ? 'right' : 'left', light });
        }
        await K.places.camera(null);
      }
    }

    // ------------------------------------------------------------ sheets 2, 3, 5 need lanes B and C (the show, the card, the screens)
    if (sheets.includes('giants')) {
      K.step('sheet 2: the giants\' shows (a forced bite at each place)');
      // (the Thousandcast twice: a Prize, z 1.2, and an Elder, z 2.9: the Elder starts at z 2.65, so the first run's 2.6 was a Trophy; the stage)
      await K.places.lift('all', { play: false });
      for (const [sp, id, light, z] of [['thousandcast_pike', 'under_the_span', 'dusk', 1.2], ['thousandcast_pike', 'under_the_span', 'dusk', 2.9], ['hullkiss_lamprey', 'buoy_lights', 'gloomtide', 1.2], ['belled_matriarch', 'bell_pool', 'calm', 1.0]]) {
        await K.places.light(light, 0.45); await K.places.at(id, {}); await settle(1.5);
        const ok = await g(([sp, z]) => { const d = window.__gw.debug; try { window.__gw.fishing.cancel?.('debug'); d.fishOutcome?.('land'); d.forceBite?.({ speciesId: sp, z, wait: 0.2 }); return true; } catch { return false; } }, [sp, z]);
        if (!ok) { K.note(`no forceBite for ${sp}`); continue; }
        const bit = await K.until("c.fishing.state === 'bite' || c.fishing.state === 'waiting'", 6);
        if (!bit.ok) { K.note(`${sp}: no bite`, bit); continue; }
        await K.until("c.fishing.state === 'bite'", 6);
        await g(() => window.__gw.debug.fishStrike?.('struck'));
        await K.until("c.fishing.state === 'reeling' || c.fishing.state === 'landing'", 3);
        await g(() => window.__gw.debug.fishPlayTo?.(0.97));
        const sh = await K.until('c.fishing?.inShow === true', 25);
        if (!sh.ok) { K.note(`${sp}: no show`); continue; }
        await frame('giants', `${sp}-${z}-leave`, `${sp} (${id}): the fish leaving the water`, { place: id });
        for (const [s, what] of [[0.6, 'lift'], [0.9, 'show'], [1.4, 'pause']]) { await K.secs(s); await frame('giants', `${sp}-${z}-${what}`, `${sp}: the ${what}`, { place: id }); }
        const card = await K.until("c.debug.ui().openModal === 'catch'", 20);
        if (card.ok) { await K.settle(300); await K.secs(1.6); await frame('giants', `${sp}-${z}-card`, `${sp}: the card`, { place: id }); await g(() => { const b = document.querySelector('[data-modal=catch] [data-action=letgo]') || document.querySelector('[data-modal=catch] [data-action=keep]'); b?.click(); }); }
        await K.until("c.fishing.state === 'idle'", 8);
      }
    }
    if (sheets.includes('catalogue')) {
      K.step('sheet 3: the catalogue (lane C\'s screens), two saves, scrolled, the giants\' page, an enlarged silhouette');
      // (the fix pass: the sheet showed only the unscrolled head; the places' groups, the giants' gold edges, the Matriarch's gold card,
      // Odds ›, the giants' page and the enlarged silhouette are 3a's and were never looked at)
      const open = () => g(() => { const s = window.__gw.ui?.screens ?? window.__gw.screens; try { (s?.openJournal ?? window.__gw.ui?.openJournal)?.({ from: 'chart', zone: 'mossmere' }); return true; } catch { return false; } });
      const scrollTo = (f) => g((f) => { const sc = document.querySelector('[data-loop=catalogue] .gw-cat-scroll'); if (!sc) return null; sc.scrollTop = (sc.scrollHeight - sc.clientHeight) * f; return Math.round(sc.scrollTop); }, f);
      const saved = await g(() => { const m = window.__gw.state.meta; return JSON.stringify({ places: m.loop?.maps?.places ?? [], journal: m.journal ?? {} }); });
      for (const variant of ['bare', 'owned']) {
        await g(([variant, saved]) => {
          const m = window.__gw.state.meta, S0 = JSON.parse(saved);
          m.loop.maps = m.loop.maps || {};
          const J = JSON.parse(JSON.stringify(S0.journal));
          if (variant === 'bare') {
            m.loop.maps.places = [];
            for (const id of ['thousandcast_pike', 'hullkiss_lamprey', 'belled_matriarch', 'bridgechain_sturgeon', 'candlefin_koi', 'weeping_carp', 'gloam_eel']) delete J[id];
          } else {
            m.loop.maps.places = ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool'];
            for (const [id, len, w] of [['thousandcast_pike', 120, 4.5], ['belled_matriarch', 130, 127], ['bridgechain_sturgeon', 90, 9], ['candlefin_koi', 51, 4]]) J[id] = { ...(J[id] || {}), caught: Math.max(1, J[id]?.caught | 0), biggest: w, pbLength: len, seals: { prize: true, ...(J[id]?.seals || {}) } };
          }
          m.journal = J;
        }, [variant, saved]);
        if (!(await open())) { K.note('no catalogue'); break; }
        await K.secs(0.5); await K.settle(400);
        await frame('catalogue', `${variant}-top`, `the Mossmere's catalogue (${variant === 'bare' ? 'no place owned, no giant caught' : 'every place owned, a giant and the Matriarch caught'}): its head and the list`);
        await scrollTo(0.5); await K.steps(1); await K.settle(250);
        await frame('catalogue', `${variant}-mid`, `the catalogue scrolled to its middle (${variant}): the fixed head clear of the list`);
        await scrollTo(1); await K.steps(1); await K.settle(250);
        await frame('catalogue', `${variant}-end`, `the catalogue's end (${variant}): the places' groups, the giants' gold edges, the Matriarch's card, Odds ›`);
        const tab = await g(() => { const t = document.querySelector('[data-loop=catalogue] .gw-tab--giants'); if (t) { t.click(); return true; } return false; });
        if (tab) { await K.steps(2); await K.settle(350); await frame('catalogue', `${variant}-giants`, `the giants' page (${variant}): hatched until landed, then gold-framed`); }
        await g(() => window.__gw.ui.closeAll?.()); await K.steps(1);
        if (variant === 'bare') {
          await open(); await K.secs(0.4); await K.settle(300);
          const big = await g(() => { const c = [...document.querySelectorAll('[data-loop=catalogue] .gw-cat-card.gw-hatched[data-species]')].find((e) => /thousandcast|hullkiss|belled/.test(e.dataset.species)) || document.querySelector('[data-loop=catalogue] .gw-cat-card.gw-hatched[data-species]'); if (!c) return null; c.scrollIntoView({ block: 'center' }); c.click(); return c.dataset.species; });
          await K.steps(2); await K.settle(350);
          if (big) await frame('catalogue', 'bare-big', `an uncaught fish enlarged (${big}): its silhouette and glyphs, no word`);
          await g(() => window.__gw.ui.closeAll?.()); await K.steps(1);
        }
      }
      await g((saved) => { const m = window.__gw.state.meta, S0 = JSON.parse(saved); m.loop.maps.places = S0.places; m.journal = S0.journal; }, saved);
    }
    if (sheets.includes('hud')) {
      K.step('sheet 5: the HUD (the hold row, the title card)');
      await K.places.unlift(); await K.places.light('dusk', 0.4); await K.places.at('lily_maze', { back: 14 }); await settle(1.5);
      await K.places.lift('lily_maze', { play: true }); await K.secs(3.3);
      await frame('hud', 'title-card', 'the lift\'s title card');
      await K.until('!c.game.lifting?.() && !c.cinematic', 6); await K.secs(2.5);   // (the HUD back after the lift: the stage)
      await frame('hud', 'hold-row-6', 'the hold row at Hold 6 (the Wick: six cells)');
      // Tallow's seven: one row on the desktop, two on the phone (T141)
      await K.toHomeVia();
      await g(() => { const L = window.__gw.progression.loop; L.setWick?.('tallow') ?? (L.state().wick = 'tallow'); });
      // the ball fitted on the Chart's foot (its count on the slot)
      await g(() => { const c = window.__gw, m = c.progression.loop.state(); m.bait = m.bait || {}; m.bait.mossmere = { ...(m.bait.mossmere || {}), heartmoss: 2 }; if (c.progression.loop.fit?.('bait', 'heartmoss')?.ok !== true) m.fitted = { ...(m.fitted || {}), bait: 'heartmoss' }; c.ui?.loop?.openChart?.(); });
      await K.secs(0.6); await K.settle(500);
      await frame('hud', 'chart-ball', 'the Chart: its places and the bait slot with the ball fitted, its count');
      await g(() => window.__gw.ui.closeAll?.());
      await K.sail(null);
      await K.secs(0.6); await K.settle(700);
      await frame('hud', 'hold-row-7', `Tallow's seven cells (${K.phone ? 'two rows on the phone' : 'one row on the desktop'})`);
    }
    await K.noErrors('the look');
  } catch (e) {
    if (!(e instanceof Abort)) K.failures.push(`[${K.part}] threw: ${e?.stack || e}`);
  }
  saveNotes();
  await K.release().catch(() => {});   // (the held frame loop handed back, so playtest's fps read and close can run: the stage)
  log(`LOOP_3A_LOOK ${JSON.stringify({ size: K.tag, redress, failures: K.failures, notes: K.notes, frames: n })}`);
  return { failures: K.failures };
}

export function dryRun() {
  const bad = [];
  for (const id of PLACE_IDS) {
    const f = placeFrames(id);
    if (f.length < 8) bad.push(`${id}: sheet 1 has every beat`);
    if ((id === 'lily_maze' || id === 'bell_pool') !== f.some((x) => x.light === 'calm')) bad.push(`${id}: late day only for the Lily Maze and the Bell Pool`);
    if (!POSE_B[id] || POSE_B[id].pos.length !== 3) bad.push(`${id}: pose b`);
    if (!POSE_A[id]) bad.push(`${id}: pose a`);
  }
  if (REDRESS_POSES.length !== 4) bad.push('sheet 4 has four poses');
  return bad;
}
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const bad = dryRun();
  if (bad.length) { console.log('loop-3a-look dry run FAIL\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('loop-3a-look dry run ok');
}
