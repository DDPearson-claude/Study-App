// LAKE 2, lane A in the browser (docs/loop/LAKE2.md §3.7, §9): Sporewood's sound in the real game. A loop dev build from a fresh save;
// Sporewood is made to ship in the page (LOOP.shipped = 'sporewood', as the gate will set it) and the save is given the Mossmere's end.
// A key press unlocks the audio. Home on the Mossmere: its bed, none of Sporewood's. The lake map, the leaving card's Tow, the leg and
// the glide in; then the evening at Sporewood: its bed (and not the Mossmere's), the score in its key; by the Seep its fall and drops;
// on the Lullaby its music-box drip; a lily frog plopping off its raft as the raft comes near; at night the frog chorus, the insects'
// pulse, the deeper drone, the Gill Harp's hum and, forced, the Harpstring's back (the hum swells); home at Rootfoot Landing: its bed.
// Every check reads ctx.debug.audioSpore() / audioMoss() / audio() / audioLog(): what the game's own audio module did.
//
//   node build.mjs --dev --out=tools/out/l2a/dev.html
//   node tools/playtest.mjs --html=tools/out/l2a/dev.html --shots=tools/out/l2a/desk --script=tools/tests/lake2-a.scenario.mjs --width=1280 --height=720
//   node tools/playtest.mjs --html=tools/out/l2a/dev.html --shots=tools/out/l2a/phone --script=tools/tests/lake2-a.scenario.mjs --mobile
//
// Prints `LAKE2_A {size, failures, notes, info}`; returns {failures} (playtest exits 1 on any).
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, wait, evalGame: g, log, width, height } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'l2a' });
  const info = {};
  const spore = () => g(() => window.__gw.debug.audioSpore?.() ?? null);
  const moss = () => g(() => window.__gw.debug.audioMoss?.() ?? null);
  const zone = () => g(() => window.__gw.debug.audio?.()?.zone ?? null);
  const now = () => g(() => window.__gw.debug.audio().time);
  const since = (t) => g((t) => window.__gw.debug.audioLog(240).filter((e) => e.at >= t - 0.005).map((e) => ({ n: e.name, w: e.why ?? null })), t);
  const put = (x, z) => g(([x, z]) => { const c = window.__gw; c.player.teleport({ x, z }, 0); c.player.velocity?.set?.(0, 0, 0); c.render.snapCamera?.(); }, [x, z]);
  // (listening at the wall clock's pace: the kit steps frames faster than the audio clock runs, and a voice's gap and its count of
  // voices at once are the audio clock's, so a held, hurried loop would refuse what the game plays)
  const listen = async (sec) => { for (let i = 0; i < Math.round(sec * 10); i++) { await K.steps(6, 1 / 60); await wait(100); } };
  const SP = /^(spore_|frog_|lullaby_|veil_|cup_|seep_|harp_|puffer_)/;
  try {
    K.step('l2a: a fresh save, home at the Mossmere, the audio unlocked');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.ui.loop?.tutorial?.start?.({}); c.ui.closeAll?.(); });
    await page.keyboard.press('Shift');
    await K.secs(0.5);
    K.need((await K.until("c.debug.audio().state === 'running'", 5)).ok, 'the WebAudio graph runs after a key press');
    await g(() => {
      const c = window.__gw, d = c.data, l = c.state.meta.loop;
      d.LOOP.shipped = 'sporewood';
      Object.assign(l, { clams: 12000, tackle: { rod: 2, line: 2, reel: 2 }, holdSlots: 6, raft: { oars: 2, keel: 2, lantern: 2 } });
      c.state.meta.journal = c.state.meta.journal || {};
      for (const s of d.SPECIES.filter((x) => x.zone === 'mossmere')) c.state.meta.journal[s.id] = { ...(c.state.meta.journal[s.id] || {}), caught: Math.max(1, Number(c.state.meta.journal[s.id]?.caught) || 0) };
      c.game.save();
    });
    await K.secs(4);
    const h0 = { moss: await moss(), spore: await spore(), zone: await zone() };
    info.homeMossmere = h0;
    K.check(h0.moss?.level > 0 && h0.spore?.level === 0 && Object.keys(h0.spore?.layers || {}).length === 0, 'home on the Mossmere: its bed, none of Sporewood\'s', h0);

    K.step('l2a: the lake map, Tow: the leg and the glide in to Sporewood');
    K.check((await g(() => window.__gw.progression.loop.buy('lake:sporewood')))?.ok === true, 'the lake map bought');
    await g(() => { window.__gw.ui.closeAll?.(); window.__gw.game.sail({ water: 'sporewood', leave: true }); });
    K.need((await K.until("c.flow === 'playing' && c.state.run?.zone === 'sporewood'", 40)).ok, 'the evening begins at Sporewood');
    await K.until('c.game.lifting?.() === null', 12);
    await g(() => window.__gw.ui.closeAll?.());
    const t0 = await now();
    await listen(8);
    const s1 = await spore(), m1 = await moss(), heard = await since(t0);
    info.evening = { spore: s1, moss: m1, zone: await zone(), heard: heard.map((e) => e.n) };
    K.check(s1?.level > 0 && s1.light === 'day' && s1.layers.canopy > 0 && s1.layers.leaves > 0, 'the evening at Sporewood: the air under the caps and the leaves', s1);
    K.check(m1?.level === 0 && !heard.some((e) => /^moss_/.test(e.n)), 'none of the Mossmere\'s bed at Sporewood', { m1, heard: heard.map((e) => e.n) });
    K.check(heard.some((e) => e.n === 'spore_drip' && e.w === 'bed:day'), 'late day: drips from the caps', heard.map((e) => e.n));
    K.check(info.evening.zone === 'sporewood', 'the score in Sporewood\'s key', info.evening.zone);

    K.step('l2a: by the Seep; on the Lullaby');
    await put(76, -27.6);
    const t1 = await now();
    await listen(4);
    const s2 = await spore(), h2 = await since(t1);
    K.check(s2?.fall?.level > 0.02 && h2.some((e) => e.n === 'seep_drop'), 'by the Seep: its fall and the drops at its foot', { fall: s2?.fall, heard: h2.map((e) => e.n) });
    await put(-51.5, -35);
    const t2 = await now();
    await listen(10);
    const s3 = await spore(), h3 = await since(t2), lul = s3?.places?.find((p) => p.id === 'lullaby');
    info.lullaby = { place: lul, heard: h3.filter((e) => SP.test(e.n)).map((e) => `${e.n}:${e.w}`) };
    K.check(lul?.gain > 0.4 && h3.some((e) => e.n === 'lullaby_drip'), 'on the Lullaby: its music-box drip', info.lullaby);
    K.check(s3?.fall === null, '… the Seep\'s fall let go out of earshot', s3?.fall);
    // a lily frog: the raft brought onto one (it plops off its raft as the raft comes near)
    const frog = await g(() => { const f = (window.__gw.debug.wildlife?.()?.frogs || []).find((b) => b.mode !== 'dive'); return f ? { x: f.x, z: f.z } : null; });
    if (frog) {
      const t3 = await now();
      await put(frog.x + 14, frog.z); await K.secs(1);
      await put(frog.x + 2, frog.z); await K.secs(2);
      const h4 = await since(t3);
      K.check(h4.some((e) => e.n === 'frog_plop'), 'a lily frog plops off its raft as the raft comes near', { frog, heard: h4.map((e) => e.n) });
    } else K.note('no lily frog to come near (the wildlife off at this quality?)');
    await K.noErrors('the evening');

    K.step('l2a: night: the chorus, the pulse, the deeper drone; the Gill Harp and the Harpstring\'s back');
    await g(() => window.__gw.survival.setPhase('gloomtide'));
    await put(-38, 36);
    const t5 = await now();
    await listen(8);
    const s5 = await spore(), h5 = await since(t5);
    info.night = { layers: s5?.layers, calls: h5.filter((e) => e.n === 'frog_croak').length };
    K.check(s5?.light === 'night' && s5.layers.deep > (s5.layers.warm || 0) && s5.layers.pulse > 0, 'night: the drone deeper, the insects\' pulse', s5?.layers);
    K.check(info.night.calls >= 5, 'night: the frog chorus full', info.night);
    await put(0, 6.5);
    await K.secs(3);
    const s6 = await spore();
    K.check(Array.isArray(s6?.hum) && s6.hum[0].level > 0, 'at the Gill Harp: its one note hummed', s6?.hum);
    const t6 = await now();
    const forced = await g(() => window.__gw.debug.world?.giantBack?.('gill_harp'));
    await K.secs(1.5);
    const s7 = await spore(), h7 = await since(t6);
    info.back = { forced, swell: s7?.swell, hum: s7?.hum, heard: h7.map((e) => e.n) };
    K.check(forced === true && h7.some((e) => e.n === 'harp_swell') && s7?.swell === true && s7.hum[0].level > s6.hum[0].level, 'the Harpstring\'s back: the hum swells', info.back);
    await K.noErrors('the night');

    K.step('l2a: home at Rootfoot Landing');
    await g(() => window.__gw.game.goHome({}));
    K.need((await K.until("c.flow === 'home' && !c.game.homeGlide?.()", 12)).ok, 'home at Sporewood');
    await g(() => window.__gw.ui.closeAll?.());
    await K.secs(4);
    const hs = { spore: await spore(), moss: await moss(), zone: await zone(), mood: await g(() => window.__gw.debug.audio().mood) };
    info.homeSporewood = hs;
    K.check(hs.spore?.level > 0 && hs.spore.layers.canopy > 0 && hs.moss?.level === 0, 'home at Sporewood: its bed, not the Mossmere\'s', hs);
    K.check(hs.zone === 'sporewood' && hs.mood === 'hub', 'home\'s hub mood in Sporewood\'s key', { zone: hs.zone, mood: hs.mood });
    await K.noErrors('home');
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${e?.stack || e}`); log('THREW', e?.stack || e); }
  }
  await K.release().catch(() => {});
  const out = { size: `${width}x${height}`, failures: K.failures, notes: K.notes, info };
  log('LAKE2_A ' + JSON.stringify(out));
  return { failures: K.failures };
}
