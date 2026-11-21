// The heart at the hook set, in the browser (src/ui-heart.js; the user's ask, 17 Nov 2026). A loop dev build from a fresh save (no
// film), the tutorial done through the debug hook, Sail, then an Elder and an Ancient each forced to bite and struck: frames at the
// hook set and 1 s later; the words (TEXT_LOOP.heart), on screen inside 16 px gutters, clear of the float, the strike word, the play's
// stamp and the HUD; the vignette up on a beat; it fires once per fish. Prints `LOOP_HEART {size, failures, notes}`.
//
//   node build.mjs --dev --out=tools/out/heart/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/heart/dev.html --shots=tools/out/heart/desktop --script=tools/tests/loop-heart.scenario.mjs --width=1280 --height=720
//   nice -n 10 node tools/playtest.mjs --html=tools/out/heart/dev.html --shots=tools/out/heart/phone --script=tools/tests/loop-heart.scenario.mjs --mobile --width=820 --height=900
import { makeKit, Abort } from './loop-1a.scenario.mjs';

function readHeart() {
  const c = window.__gw, el = document.querySelector('[data-loop=heart]');
  const R = (r) => ({ left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom) });
  const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05; };
  const others = [];
  for (const sel of ['.gw-strike-w', '.gw-play.gw-on', '.gw-hold', '[data-loop=home]', '.gw-tl', '.gw-tr', '.gw-hb-pause', '.gw-toast.gw-in', '.gw-tackle'])
    for (const e of document.querySelectorAll(sel)) if (vis(e)) others.push({ sel, r: R(e.getBoundingClientRect()) });
  const p = c.ui?.loop?.heart?.debug?.()?.float || null;
  const edge = document.querySelector('.gw-heart-edge');
  return { on: vis(el), text: el?.textContent || null, r: el ? R(el.getBoundingClientRect()) : null, fs: el ? parseFloat(getComputedStyle(el).fontSize) : null,
    color: el ? getComputedStyle(el).color : null, float: p, others, W: innerWidth, H: innerHeight,
    edge: edge ? Number(getComputedStyle(edge).opacity) : null, debug: c.ui?.loop?.heart?.debug?.() ?? null, state: c.fishing?.state };
}
const hit = (a, b, pad = 0) => !!a && !!b && a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'heart' });
  const TL = await g(() => window.__gw?.data?.TEXT_LOOP ?? null).catch(() => null);
  async function look(where, cls, { first }) {
    const t = await g(readHeart);
    log('heart', JSON.stringify({ where, t }));
    if (first) {
      K.check(t.on && t.text === TL?.heart?.[cls], `${where}: the words "${TL?.heart?.[cls]}" are up`, { on: t.on, text: t.text, debug: t.debug });
      K.check(t.debug?.cls === cls, `${where}: the heart's class is ${cls}`, t.debug);
    }
    if (t.on && t.r) {
      K.check(t.r.left >= 15 && t.r.right <= t.W - 15 && t.r.top >= 0 && t.r.bottom <= t.H - 15, `${where}: on the screen, never cut (16 px gutters)`, { r: t.r, W: t.W, H: t.H });
      K.check(t.r.top >= t.H * 0.45, `${where}: low on the screen`, t.r);
      if (K.phone || t.W <= 700) K.check(t.fs >= 16, `${where}: ≥ 16 px on a phone`, t.fs);
      const fl = t.float ? { left: t.float.x - 60, right: t.float.x + 60, top: t.float.y - 50, bottom: t.float.y + 60 } : null;
      K.check(!hit(t.r, fl), `${where}: clear of the float and the fish under it`, { words: t.r, float: t.float });
      const over = t.others.filter((o) => hit(t.r, o.r));
      K.check(over.length === 0, `${where}: clear of the strike word, the play's stamp and the HUD`, over);
    }
    return t;
  }
  async function hookOne(cls, z) {
    K.step(`heart: an ${cls} bites and is struck`);
    let atHook = null;
    await K.realCatch('reedjaw_pike', z, { what: cls, onStrike: async () => {
      atHook = await look(`${cls} at the hook set`, cls, { first: true });
      await K.shoot(`${cls}-hook`);
      await K.secs(1);
      const later = await look(`${cls} 1 s later`, cls, { first: false });
      K.check(later.debug?.on === true, `${cls}: the heart still beats 1 s on`, later.debug);
      K.check(K.phone || later.edge !== null, `${cls}: the vignette is laid over the frame`, later.edge);
      await K.shoot(`${cls}-1s`);
      K.check((await g(() => window.__gw.ui.loop.heart.debug().fires)) === (cls === 'elder' ? 1 : 2), `${cls}: fired once for this fish`);
    } });
    await K.toCard(cls);
    return atHook;
  }
  try {
    K.step('heart: a fresh save, Start with no film, the tutorial done, Sail');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    K.need(await g(() => window.__gw.game.sail({ water: 'mossmere' })), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 12)).ok, 'on the water');
    await K.secs(2.2);
    await hookOne('elder', 3.0);
    await hookOne('ancient', 3.45);
    await K.noErrors('the heart');
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${String(e?.stack || e).split('\n').slice(0, 4).join(' | ')}`); log('THREW', String(e?.stack || e)); }
  }
  try { await K.release(); } catch { /* ignore */ }
  const out = { size: K.tag, failures: K.failures, notes: K.notes };
  log(`LOOP_HEART ${JSON.stringify(out)}`);
  return K.failures;
}
