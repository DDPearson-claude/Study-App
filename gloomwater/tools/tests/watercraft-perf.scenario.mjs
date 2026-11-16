// WC-3: the clarity-perf --loop measure (DESIGN §25.8.8's lines: world <= 54 high and medium, <= 42 low; frame <= 200 / 150), driven by
// the loop kit's held frames, for a box too loaded for clarity-perf's own real-time Sail wait (its 300 s timeout at ~1 fps). Per tier:
// night with the four banks up (clarity-perf's 'banks' case) and with every place lifted ('lifted'), and dusk with the heron standing
// ('heron': the WC-3 lane's one added call), at the same pose and counting as clarity-perf's measure. cpuMs as clarity-perf's (CDP).
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-wc3/dev3.html --shots=tools/out/mvp-wc3/perf --script=tools/tests/watercraft-perf.scenario.mjs --width=960 --height=540
// Writes <shots>/perf-wc3[-phone].json; prints WC3_PERF.
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { makeKit3a, seededSave } from './loop-3a.scenario.mjs';

const LINES = { high: { frame: 200, world: 54 }, medium: { frame: 200, world: 54 }, low: { frame: 150, world: 42 } };

export default async function (api) {
  const { page, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'wc3perf' });
  const phone = !!args.mobile || width < height;
  const N = Math.max(2, Number(args.frames) || 4);
  const tiers = typeof args.tiers === 'string' ? args.tiers.split(',') : ['low', 'medium', 'high'];
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/mvp-wc3/perf'));
  mkdirSync(shotsDir, { recursive: true });
  const out = {};
  try {
    await K.boot(seededSave({ clams: 3000, holdSlots: 6 }));
    await K.toJetty();
    await K.sail(null);
    const cdp = await page.context().browser().newBrowserCDPSession();
    const cpu = async () => { const { processInfo } = await cdp.send('SystemInfo.getProcessInfo'); return processInfo.filter((p) => /^(gpu|renderer)$/i.test(String(p.type))).reduce((s, p) => s + (p.cpuTime || 0), 0); };
    await g(() => {
      const c = window.__gw;
      window.__wp = {
        own(lifted) { const m = c.state.meta.loop; m.maps = m.maps || {}; m.maps.places = Object.keys(c.data.LOOP.places); m.lifted = lifted ? m.maps.places.slice() : []; c.world.setPlaces?.({ owned: m.maps.places, lifted: m.lifted }); },
        measure(N) {
          const R = c.render, rr = R.renderer, gl = rr.getContext(), px = new Uint8Array(4), t = [];
          let key = null; R.scene.traverse((o) => { if (o.isDirectionalLight && o.castShadow && o.shadow) key = o; });
          const every = Math.max(1, (R.clarity && R.clarity.shadowEvery) | 0);
          let calls = 0;
          for (let i = 0; i < N; i++) { if (key) key.shadow.needsUpdate = i % every === 0; const a = performance.now(); R.render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); t.push(performance.now() - a); calls = Math.max(calls, rr.info.render.calls); }
          const wg = c.world.group, ar = rr.info.autoReset; rr.info.autoReset = true;
          if (key) key.shadow.needsUpdate = false;
          rr.render(R.scene, R.camera); const sceneAll = rr.info.render.calls;
          wg.visible = false;
          rr.render(R.scene, R.camera); const sceneOff = rr.info.render.calls;
          // the heron stands outside the world's group: hidden too, its call is counted as the world's (WATERCRAFT §10)
          const her = R.scene.getObjectByName('heron');
          let heron = 0;
          if (her && her.visible) { her.visible = false; rr.render(R.scene, R.camera); heron = sceneOff - rr.info.render.calls; her.visible = true; }
          wg.visible = true;
          rr.info.autoReset = ar;
          return { calls, world: sceneAll - sceneOff + heron, heron, wallMs: Math.round(Math.min(...t)) };
        },
      };
    });
    for (const tier of tiers) {
      await g((tier) => { const c = window.__gw; c.state.meta.settings.quality = tier; c.render.setQuality(tier); c.world.setZone?.('sporewood', { instant: true }); c.world.setZone?.('mossmere', { instant: true }); }, tier);
      await K.secs(0.5);
      for (const [name, lifted, phase] of [['banks', false, 'gloomtide'], ['lifted', true, 'gloomtide'], ['heron', true, 'dusk']]) {
        try {
          await g((lifted) => window.__wp.own(lifted), lifted);
          await K.places.light(phase, phase === 'dusk' ? 0.45 : 0.35);
          await K.places.pose(-34, 14, 0);
          await K.secs(2.5);
          if (name === 'heron') {
            const h = await g(() => window.__gw.debug.heron?.() ?? null);
            if (h && h.mode !== 'gone') {
              const d = Math.hypot(h.x, h.z) || 1, ux = -h.x / d, uz = -h.z / d;
              await K.places.pose(h.x + ux * 16, h.z + uz * 16, 0); await K.secs(1.5);
              await K.places.camera({ pos: [h.x + ux * 9, 4, h.z + uz * 9], look: [h.x, 0.6, h.z], fov: 55 }); await K.secs(0.3);
            }
          }
          await g(() => window.__gw.render.snapCamera?.());
          const c0 = await cpu();
          const r = await g((N) => window.__wp.measure(N), N);
          r.cpuMs = Math.round((await cpu() - c0) * 1000 / (N + 2));
          const line = LINES[tier] || LINES.high;
          r.okFrame = r.calls <= line.frame; r.okWorld = r.world <= line.world;
          K.check(r.okFrame && r.okWorld, `${tier}-${name}: frame ${r.calls} <= ${line.frame}, world ${r.world} <= ${line.world}${r.heron ? ` (the heron ${r.heron})` : ''}`, r);
          out[`${tier}-${name}`] = r;
          if (name === 'heron') await K.places.camera(null);
          log(`perf-wc3 ${tier}-${name} ${JSON.stringify(r)}`);
        } catch (e) { K.check(false, `${tier}-${name}: ${e?.message || e}`); }
      }
    }
    K.check(['medium', 'high'].every((t) => !tiers.includes(t) || out[`${t}-heron`]?.heron === 1) && (!tiers.includes('low') || out['low-heron']?.heron === 0), 'the heron: one call on high and medium, none on low', Object.fromEntries(Object.entries(out).filter(([k]) => k.endsWith('heron')).map(([k, v]) => [k, v.heron])));
    writeFileSync(resolve(shotsDir, `perf-wc3${phone ? '-phone' : ''}.json`), JSON.stringify({ width, height, frames: N, lines: LINES, perf: out }, null, 1));
    await K.noErrors?.('the perf');
  } catch (e) { K.check(false, `perf threw: ${e?.message || e}`); log(String(e?.stack || e)); }
  await K.release().catch(() => {});
  log('WC3_PERF', JSON.stringify({ size: K.tag, failures: K.failures, perf: out }));
  return { failures: K.failures };
}
