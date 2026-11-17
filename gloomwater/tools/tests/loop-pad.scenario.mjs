// The game controller in the browser (src/input-pad.js; the user's ask, 17 Nov 2026: a Windows handheld's controllers). A loop dev
// build with navigator.getGamepads stubbed by a scripted standard pad (its buttons and axes set by the scenario, its rumble recorded),
// from a fresh save with the tutorial done. Desktop (1280x800, 16:10, then 1920x1200 at each screen worth seeing): home → the focus on
// CHART → A opens the Chart → the D-pad to Sail → A → the trip; the stick sails; A held aims, released casts; a bite, A strikes (a
// rumble); the play; the catch card, A keeps; Y the Journal, B back; Start the pause, the D-pad moves, Start resumes; a real key puts
// the page back (no hints). Phone (--mobile 820x900): the glyph beside CHART's word at home; on the water no touch stick while the
// pad is in use; a cast, a strike, the card (A before Keep, B after Let go); the pause; a touch brings the touch stick back.
// Every frame with the glyphs: they sit on screen, over no word.
//
//   node build.mjs --dev --out=tools/out/pad/dev.html
//   node tools/playtest.mjs --html=tools/out/pad/dev.html --shots=tools/out/pad/shots --script=tools/tests/loop-pad.scenario.mjs --width=1280 --height=800
//   node tools/playtest.mjs --html=tools/out/pad/dev.html --shots=tools/out/pad/shots --script=tools/tests/loop-pad.scenario.mjs --mobile --width=820 --height=900
// Prints `LOOP_PAD {size, failures, notes}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

const B = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

export default async function (api) {
  const { page, evalGame: g, log, width, height } = api;
  page.setDefaultTimeout(300000);
  await page.addInitScript(() => {
    const P = { buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })), axes: [0, 0, 0, 0], on: true };
    window.__padRumble = [];
    const gp = { id: 'Scripted pad (STANDARD GAMEPAD)', index: 0, mapping: 'standard', connected: true, timestamp: 0,
      get buttons() { return P.buttons; }, get axes() { return P.axes; },
      vibrationActuator: { type: 'dual-rumble', playEffect: (t, o) => { window.__padRumble.push({ t, ...o }); return Promise.resolve('complete'); } } };
    window.__pad = { set(b, on) { P.buttons[b].pressed = on; P.buttons[b].value = on ? 1 : 0; }, axes(a) { for (let i = 0; i < 4; i++) P.axes[i] = a[i] || 0; } };
    Object.defineProperty(Navigator.prototype, 'getGamepads', { configurable: true, value() { return [P.on ? gp : null, null, null, null]; } });
    // the glyphs on screen, over no word of the screen on top
    window.__padCheck = () => {
      const W = innerWidth, H = innerHeight, chips = [...document.querySelectorAll('.gw-padg.gw-on')].map((c) => c.getBoundingClientRect());
      const bad = [];
      for (const c of chips) if (c.left < 0 || c.top < 0 || c.right > W || c.bottom > H) bad.push(`cut ${Math.round(c.left)},${Math.round(c.top)}`);
      const top = [...document.querySelectorAll('.gw-modal-layer > .gw-modal:not(.gw-out)')].pop();
      if (top && chips.length) {
        const tw = document.createTreeWalker(top, NodeFilter.SHOW_TEXT), rg = document.createRange();
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          if (!n.nodeValue.trim() || !n.parentElement?.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true })) continue;
          rg.selectNodeContents(n);
          for (const r of rg.getClientRects()) for (const c of chips) if (r.width > 0 && c.left < r.right - 0.5 && c.right > r.left + 0.5 && c.top < r.bottom - 0.5 && c.bottom > r.top + 0.5) bad.push(`over "${n.nodeValue.trim().slice(0, 24)}"`);
        }
      }
      const f = document.querySelector('.gw-padfocus');
      return { chips: chips.length, bad, focus: f ? (f.getAttribute('aria-label') || f.textContent || '').trim().slice(0, 30) : null, root: document.documentElement.classList.contains('gw-pad-on') };
    };
  });
  const K = makeKit(api, { label: 'pad' });
  const set = (b, on) => g(([b, on]) => window.__pad.set(b, on), [b, on]);
  const axes = (a) => g((a) => window.__pad.axes(a), a);
  const press = async (b, hold = 2) => { await set(b, true); await K.steps(hold); await set(b, false); await K.steps(3); };
  const dbg = () => g(() => window.__gw.debug.pad?.() ?? null);
  const modal = () => g(() => window.__gw.debug.ui?.().openModal ?? null);
  const check = async (where) => { await K.steps(8); const c = await g(() => window.__padCheck()); K.check(c.bad.length === 0, `${where}: the glyphs on screen, over no word`, c); return c; };
  /** The D-pad toward a target (by where it is on screen) until the focus is on it. */
  const seek = async (sel, max = 14) => {
    for (let i = 0; i < max; i++) {
      const s = await g((sel) => {
        const t = document.querySelector(sel), f = document.querySelector('.gw-padfocus');
        if (!t) return { none: true };
        if (f === t) return { at: true };
        const a = t.getBoundingClientRect(), b = f ? f.getBoundingClientRect() : null;
        if (!b) return { dir: 'any' };
        const dx = (a.left + a.right) / 2 - (b.left + b.right) / 2, dy = (a.top + a.bottom) / 2 - (b.top + b.bottom) / 2;
        return { dir: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u') };
      }, sel);
      if (s.at) return true;
      if (s.none) return false;
      await press(s.dir === 'l' ? B.LEFT : s.dir === 'u' ? B.UP : s.dir === 'd' ? B.DOWN : B.RIGHT);
    }
    return false;
  };
  const both = async (name) => {   // a frame at this size and at 1920x1200 (the same 16:10)
    await check(`${name} ${width}x${height}`);
    await K.settle(450);   // (the focus's own fade, a CSS transition, runs on the browser's frames)
    await K.shoot(`${name}-${width}x${height}`);
    await page.setViewportSize({ width: 1920, height: 1200 });
    await K.settle(400); await K.steps(10);
    await check(`${name} 1920x1200`);
    await K.settle(450);
    await K.shoot(`${name}-1920x1200`);
    await page.setViewportSize({ width, height });
    await K.settle(400); await K.steps(10);
  };
  try {
    K.step('pad: a fresh save, the tutorial done, home');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__gw.game.beginIntro({ character: 'stub' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.game.save(); });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), "the title's Continue");
    K.need((await K.until("c.flow === 'home' && !c.loopHome?.gliding?.()", 12)).ok || (await K.until("c.flow === 'home'", 2)).ok, 'Continue: home');
    await K.secs(1.5);
    const before = await dbg();
    K.check(before && before.seen && !before.active && !before.root, 'a pad plugged in but not used: the page as it was', before);

    const glyphs = () => g(() => {
      const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; };
      const [a, b] = [...document.querySelectorAll('.gw-padg')].map((c) => (c.classList.contains('gw-on') ? box(c) : null));
      const f = document.querySelector('.gw-padfocus');
      return { a, b, word: box(f?.querySelector('.gw-jetty-tword') || null), focus: box(f), letgo: box(document.querySelector('[data-modal=catch] .gw-cc-letgo, [data-modal=catch] [data-action=letgo]')) };
    });
    if (K.phone) {
      K.step('pad (phone): home, the glyph beside CHART');
      await press(B.RIGHT);
      if ((await dbg()).focus?.tile !== 'chart') await seek('[data-modal=jetty] [data-tile=chart]');
      const hg = await glyphs();
      const by = hg.a && hg.word && Math.abs((hg.a.t + hg.a.b) / 2 - (hg.word.t + hg.word.b) / 2) <= 14 && (hg.a.r <= hg.word.l + 2 || hg.a.l >= hg.word.r - 2) && Math.min(Math.abs(hg.a.r - hg.word.l), Math.abs(hg.a.l - hg.word.r)) <= 30;
      K.check(by, 'the A glyph sits beside the CHART word (its line, its side)', hg);
      await check('phone home');
      await K.settle(450);
      await K.shoot('home');
      K.step('pad (phone): the touch stick, then the pad');
      await g(() => window.__gw.debug.loop.sail('mossmere'));
      K.need((await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.loopHome?.gliding?.()", 14)).ok || (await K.until("c.flow === 'playing'", 2)).ok, 'the trip begins');
      await K.secs(3);
      const joy = () => g(() => { const z = document.querySelector('.gw-joyzone'); return z ? getComputedStyle(z).display : null; });
      K.check((await joy()) === 'none', 'the pad in use since home: no touch stick on the water', await joy());
      await K.shoot('touch-stick');
      await axes([0, -1, 0, 0]); await K.secs(1); await axes([0, 0, 0, 0]); await K.steps(2);
      K.check((await joy()) === 'none', 'the pad sailing: still no touch stick', await joy());
      await K.shoot('pad-no-stick');
      K.step('pad (phone): a cast, a strike, the card (B beside Let go, on its right)');
      await set(B.A, true); await K.secs(0.7); await set(B.A, false); await K.steps(2);
      K.need((await K.until("c.fishing.state === 'waiting'", 8)).ok, 'A held and released: the cast');
      await g(() => { const d = window.__gw.debug; d.fishOutcome?.('land'); d.forceBite?.({ speciesId: 'dusk_minnow', z: 0.3, wait: 0.2 }); });
      K.need((await K.until("c.fishing.state === 'bite'", 6)).ok, 'the bite');
      await K.steps(6); await press(B.A);
      K.need((await K.until("c.debug.ui().openModal === 'catch'", 60)).ok, 'the catch card');
      await K.settle(900); await K.steps(30);
      const cg = await glyphs();
      K.check(cg.b && cg.letgo && cg.b.l >= cg.letgo.r - 2 && cg.a && cg.focus && cg.a.r <= (cg.focus.l + cg.focus.r) / 2, 'A before Keep, B after Let go', cg);
      await check('phone catch');
      await K.settle(450);
      await K.shoot('catch');
      await press(B.A); await K.settle(400); await K.steps(4);
      K.check((await modal()) !== 'catch', 'A: kept');
      await K.secs(1);
      await press(B.START);
      K.check((await modal()) === 'pause', 'Start: the pause', await modal());
      await press(B.DOWN);
      await check('phone pause');
      await K.shoot('pause');
      await press(B.START);
      K.check((await modal()) === null && !(await g(() => window.__gw.paused)), 'Start again: back on the water', await modal());
      const pt = await K.waterPoint();
      await K.tapXY(pt.x, pt.y); await K.steps(4);
      K.check((await joy()) === 'block' && !(await dbg()).root, 'a touch: the touch stick back, no hints', await dbg());
      await K.shoot('touch-again');
    } else {
      K.step('pad: home, the focus on CHART, A opens the Chart');
      await press(B.RIGHT);   // (the first touch of the pad shows where its focus is: the screen's own first target)
      let d = await dbg();
      K.check(d.active && d.root && d.scope === 'jetty' && d.focus, 'the pad in use at home: a focus on the Jetty', d);
      if (d.focus?.tile !== 'chart') await seek('[data-modal=jetty] [data-tile=chart]');
      d = await dbg();
      K.check(d.focus?.tile === 'chart', 'the focus on CHART', d.focus);
      await both('home');
      await press(B.RIGHT);
      const moved = await dbg();
      K.check(moved.focus && moved.focus.tile !== 'chart', 'the D-pad moves the focus to the next target', moved.focus);
      K.check(await seek('[data-modal=jetty] [data-tile=chart]'), 'and back to CHART');
      await press(B.A);
      await K.settle(500); await K.steps(4);
      K.need((await modal()) === 'chart', 'A: the Chart', await modal());
      K.need(await seek('[data-modal=chart] [data-action=sail]'), 'the D-pad to Sail');
      await both('chart-sail');

      K.step('pad: Sail, the stick sails');
      await press(B.A);
      K.need((await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.loopHome?.gliding?.()", 16)).ok || (await K.until("c.flow === 'playing'", 2)).ok, 'A on Sail: the trip begins');
      await K.until('!c.loopHome?.lifting?.()', 10);
      await K.secs(2);
      const p0 = await g(() => ({ x: window.__gw.player.position.x, z: window.__gw.player.position.z }));
      await axes([0.35, -1, 0, 0]); await K.secs(1.4); await axes([0, 0, 0, 0]);
      await K.secs(1.2);
      const p1 = await g(() => ({ x: window.__gw.player.position.x, z: window.__gw.player.position.z, mode: window.__gw.debug.pad().mode }));
      const dist = Math.hypot(p1.x - p0.x, p1.z - p0.z);
      K.check(dist > 0.8 && p1.mode === 'water', `the left stick sails the raft (${dist.toFixed(2)} m)`, { p0, p1 });
      await K.shoot('sailed');

      K.step('pad: A held aims (ahead of the raft, the right stick turns it), released casts');
      await set(B.A, true);
      await K.secs(0.5);
      const a0 = await g(() => ({ st: window.__gw.fishing.state, aim: window.__gw.debug.pad().aim, yaw: window.__gw.fishing.view?.aim ?? null, h: window.__gw.player.heading }));
      K.check(a0.st === 'charging' && a0.aim.on && Math.abs(a0.aim.x + Math.sin(a0.h)) < 1e-3, 'A held: charging, aimed ahead of the raft', a0);
      await axes([0, 0, 0.8, -0.4]); await K.secs(0.4);
      const a1 = await g(() => window.__gw.debug.pad().aim);
      K.check(Math.hypot(a1.x - a0.aim.x, a1.z - a0.aim.z) > 0.2, 'the right stick turns the aim', { a0: a0.aim, a1 });
      await K.secs(0.3);
      await K.shoot('aiming');
      await axes([0, 0, 0, 0]);
      await set(B.A, false); await K.steps(2);
      K.need((await K.until("c.fishing.state === 'waiting'", 8)).ok, 'A released: the cast flies, the float waits');
      K.check(!(await dbg()).aim.on, "the release gives the pointer its aim back");

      K.step('pad: the bite, A strikes');
      await g(() => { window.__padRumble.length = 0; const d = window.__gw.debug; d.fishOutcome?.('land'); d.forceBite?.({ speciesId: 'dusk_minnow', z: 0.3, wait: 0.2 }); });
      K.need((await K.until("c.fishing.state === 'bite'", 6)).ok, 'the bite opens');
      await K.steps(6);
      await press(B.A);
      K.need((await K.until("c.fishing.state === 'reeling' || c.fishing.state === 'landing'", 4)).ok, 'A in the bite: hooked', await g(() => window.__gw.fishing.state));
      const rum = await g(() => window.__padRumble.slice());
      K.check(rum.length >= 1 && rum[0].t === 'dual-rumble' && rum[0].duration <= 120, 'a short soft rumble at the strike', rum);
      await K.shoot('strike');

      K.step('pad: the play, the catch card, A keeps');
      K.need((await K.until("c.debug.ui().openModal === 'catch'", 60)).ok, 'the catch card');
      await K.settle(900); await K.steps(30);
      d = await dbg();
      K.check(d.scope === 'catch' && /keep/i.test(d.focus?.cls || '') , 'the card: the focus on Keep', d.focus);
      await both('catch');
      const held0 = await g(() => (window.__gw.state.run?.creel || []).length);
      await press(B.A);
      await K.settle(400); await K.steps(4);
      const held1 = await g(() => (window.__gw.state.run?.creel || []).length);
      K.check((await modal()) !== 'catch' && held1 === held0 + 1, 'A: kept (the card closes, the hold one fuller)', { held0, held1, modal: await modal() });

      K.step('pad: Y the Journal, B back');
      await K.secs(1);
      await press(B.Y);
      await K.settle(500); await K.steps(4);
      K.check((await modal()) === 'journal', 'Y: the Journal', await modal());
      await press(B.DOWN);
      await check('journal');
      await K.shoot('journal');
      await press(B.B);
      await K.settle(400); await K.steps(4);
      K.check((await modal()) === null, 'B: back to the water', await modal());

      K.step('pad: Start the pause');
      await press(B.START);
      await K.settle(400); await K.steps(4);
      K.check((await modal()) === 'pause' && (await g(() => window.__gw.paused)) === true, 'Start: the pause', await modal());
      await K.steps(3);
      const f0 = (await dbg()).focus;
      await press(B.DOWN);
      const f1 = (await dbg()).focus;
      K.check(f0 && f1 && f0.text !== f1.text, 'the D-pad moves down the pause', { f0, f1 });
      await both('pause');
      await press(B.START);
      await K.settle(300); await K.steps(4);
      K.check((await modal()) === null && (await g(() => window.__gw.paused)) === false, 'Start again: resumed', await modal());
      await page.keyboard.press('Shift');
      await K.steps(3);
      const off = await g(() => window.__padCheck());
      K.check(!off.root && off.chips === 0 && !off.focus, 'a real key: the page as it was (no hints, no pad focus)', off);
    }
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${String(e?.stack || e).split('\n').slice(0, 3).join(' | ')}`); log('THREW', e); }
  }
  const errs = await g(() => (window.__gw?.errors || []).slice(-6)).catch(() => []);
  if (errs.length) K.note('ctx.errors', errs);
  log('LOOP_PAD', JSON.stringify({ size: `${width}x${height}`, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
