// LAKE 2, lane F (docs/loop/LAKE2.md §2.3, §9): the look sheet of Sporewood's fourteen, each beside its Mossmere relative. Every fish is
// landed by a forced bite on the Mossmere's open water (the same light for both sides of a pair: the Sporewood fish is a data record of
// the loop before its water ships), and shot at the show's close-up and at its card. Then the Nightbloom Carp as the Mossmere's guest,
// at night (its one record: the look changes with it). Desktop and phone; frames only, a few checks.
//
//   node build.mjs --dev --out=tools/out/lake2-f/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/lake2-f/dev.html --shots=tools/out/lake2-f/look --script=tools/tests/lake2-f-look.scenario.mjs --width=1280 --height=720
//   nice -n 10 node tools/playtest.mjs --html=tools/out/lake2-f/dev.html --shots=tools/out/lake2-f/look --script=tools/tests/lake2-f-look.scenario.mjs --mobile
//   node tools/lake2-f-sheet.mjs --in=tools/out/lake2-f/look --out=tools/out/lake2-f/fish.jpg
// Options: --only=<species>[,…]  --frames=show,card (default both)
// Frames: <tag>-f-NN-<species>-<show|card>.png, and <shots>/fish-notes.json {name: {species, pair, frame, light, z, shape, cloud}}.
// Prints `LAKE2_F_LOOK {size, failures, notes, shot}`.
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { makeKit3a, seededSave } from './loop-3a.scenario.mjs';
import { Abort } from './loop-1a.scenario.mjs';

/** The pairs (LAKE2 §2.3): each Sporewood fish, then the Mossmere fish it must look nothing like. [species, z, light] */
export const PAIRS = [
  [['harpstring_eel', 1.2, 'dusk'], ['gloam_eel', 1.2, 'dusk'], ['hullkiss_lamprey', 1.2, 'dusk']],
  [['threadling_eel', 0.6, 'dusk'], ['gloam_eel', 0.6, 'dusk']],
  [['downcast_catfish', 0.8, 'dusk'], ['belled_matriarch', 0, 'dusk']],
  [['cindertail_catfish', 0.8, 'dusk'], ['belled_matriarch', 0, 'dusk']],
  [['nightbloom_carp', 0.8, 'dusk'], ['weeping_carp', 0.8, 'dusk'], ['rustfin_sucker', 0.8, 'dusk'], ['candlefin_koi', 0.8, 'dusk']],
  [['netcloud_fry', 0.6, 'dusk'], ['dusk_minnow', 0.6, 'dusk'], ['likely_chub', 0.6, 'dusk']],
  [['capshell_crayfish', 0.6, 'dusk'], ['gutter_crayfish', 0.6, 'dusk']],
  [['falsesmile_barb', 0.8, 'dusk'], ['overbold_bass', 0.8, 'dusk'], ['mossback_perch', 0.8, 'dusk']],
  [['lostsea_mackerel', 0.8, 'dusk'], ['kissmark_trout', 0.8, 'dusk']],
  [['velvet_ray', 0.8, 'dusk']], [['festival_puffer', 1.0, 'gloomtide']], [['drifting_grove', 0, 'calm']],
  [['mildew_angler', 0.8, 'gloomtide']], [['sleepspore_jelly', 0.8, 'calm']],
  [['nightbloom_carp', 1.0, 'gloomtide', 'guest']],
];

// (the waits step the game at 1/12 s: every step draws a frame, and a frame on the software renderer is slow; the show's own beats
// are shot at the kit's 1/30 s)
const FAST = 1 / 12;

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'f' });
  const shotsRoot = resolve(process.cwd(), String(args.shots || 'tools/out/lake2-f/look'));
  const only = typeof args.only === 'string' ? args.only.split(',') : null;
  const want = typeof args.frames === 'string' ? args.frames.split(',') : ['show', 'card'];
  const notesPath = resolve(shotsRoot, 'fish-notes.json');
  const notes = existsSync(notesPath) ? JSON.parse(readFileSync(notesPath, 'utf8')) : {};
  const saveNotes = () => { mkdirSync(shotsRoot, { recursive: true }); writeFileSync(notesPath, JSON.stringify(notes, null, 1)); };
  let n = 0, shot = 0;
  const frame = async (what, note) => {
    const name = `${K.tag}-f-${String(++n).padStart(2, '0')}-${what}`;
    try { await g(() => window.__lp.step(1, 1 / 120, true)); } catch { /* between loads */ }
    await api.wait(90);
    await page.screenshot({ path: resolve(shotsRoot, `${name}.png`), timeout: 120000 }).then(() => { shot++; }).catch((e) => K.note(`screenshot ${name}: ${String(e?.message || e).split('\n')[0]}`));
    notes[name] = { size: K.tag, ...note };
    saveNotes();
    log('frame', name);
  };
  try {
    K.step('boot: the Mossmere\'s open water');
    await K.boot(seededSave({ clams: 3000, holdSlots: 6 }));
    K.need(await g(() => window.__gw.data.LOOP_ENABLED === true), 'a loop build');
    await K.toJetty();
    await K.sail(null);
    await K.places.unlift();
    // (every forced bite a fish: the snag roll, and its finds' guarantee, held off for the sheet)
    K.need(await g(() => { const L = window.__gw.progression?.loop; if (!L) return false; try { L.snagRoll = () => null; return L.snagRoll() === null; } catch { return false; } }), 'the snag roll held off');
    await K.secs(1);
    const errs0 = await g(() => (window.__gw.errors || []).length), done = new Set();
    for (const [pi, row] of PAIRS.entries()) {
      for (const [sp, z, light, tag] of row) {
        if ((only && !only.includes(sp)) || done.has(`${sp}|${tag || ''}`)) continue;   // (a relative of two is shot once a run)
        done.add(`${sp}|${tag || ''}`);
        K.step(`${sp} (${light}${tag ? `, ${tag}` : ''})`);
        await K.places.light(light, 0.45); await K.secs(1.2, FAST);
        const ok = await g(([sp, z]) => { const d = window.__gw.debug; try { window.__gw.fishing.cancel?.('debug'); d.fishOutcome?.('land'); return d.forceBite?.({ speciesId: sp, z, wait: 0.2 }) !== false; } catch { return false; } }, [sp, z]);
        if (!K.check(ok, `${sp}: a forced bite`)) continue;
        const bit = await K.until("c.fishing.state === 'bite'", 8, FAST);
        if (!K.check(bit.ok, `${sp}: it bites`, bit)) continue;
        await g(() => window.__gw.debug.fishStrike?.('struck'));
        await K.until("c.fishing.state === 'reeling' || c.fishing.state === 'landing'", 3, FAST);
        await g(() => window.__gw.debug.fishPlayTo?.(0.97));
        const sh = await K.until('c.fishing?.inShow === true', 30, FAST);
        if (!K.check(sh.ok, `${sp}: its show`, sh)) continue;
        const info = await g(() => { const c = window.__gw, F = c.fishing.debug?.() || {}; const fv = c.actors?.debug?.()?.catchFish || null; return { shape: F.shape ?? fv?.shape ?? null }; }).catch(() => ({}));
        await K.secs(1.5);
        const cloud = await g(() => { let k = 0; window.__gw.render?.scene?.traverse?.((o) => { if (o.name === 'cloud' && o.parent) k++; }); return k; }).catch(() => null);
        if (sp === 'netcloud_fry') K.check(cloud === 1, 'the Netcloud Fry comes as a cloud in the show', cloud);
        if (want.includes('show')) await frame(`${sp}-show`, { species: sp, pair: pi, frame: 'show', light, z, tag: tag || null, ...info, cloud });
        const card = await K.until("c.debug.ui().openModal === 'catch'", 25, FAST);
        if (card.ok) {
          await K.settle(300); await K.secs(1.4);
          if (want.includes('card')) await frame(`${sp}-card`, { species: sp, pair: pi, frame: 'card', light, z, tag: tag || null });
          await g(() => { const b = document.querySelector('[data-modal=catch] [data-action=letgo]') || document.querySelector('[data-modal=catch] [data-action=keep]'); b?.click(); });
        } else K.note(`${sp}: no card`, card);
        await K.until("c.fishing.state === 'idle'", 10, FAST);
        await K.secs(0.4);
      }
    }
    const errs = await g(() => (window.__gw.errors || []).slice(0, 6).map((e) => String(e?.message || e).slice(0, 200)));
    K.check(errs.length <= errs0, 'no game errors on the way', errs);
  } catch (e) {
    if (!(e instanceof Abort)) K.check(false, `threw: ${String(e?.stack || e).slice(0, 400)}`);
  }
  console.log(`LAKE2_F_LOOK ${JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes.length, shot })}`);
  return { failures: K.failures };
}
