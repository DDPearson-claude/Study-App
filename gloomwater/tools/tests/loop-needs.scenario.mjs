// The Journal's hint (the user's words of 17 November 2026: "A Journal hint when a fish needs gear you don't have ("Needs a lure"), so
// nobody hunts a fish they can't catch yet"): a fresh save's catalogue shows "Needs a lure." under the pike and the giants and "Needs
// bait." under the Gloam Eel (progression-loop.needsHint); a Glimmer Spoon given through the debug seam takes the pike's and the giants'
// away. Checks each hint sits inside its card, whole (never cut), clear of every other card, at the run's size and at a 390 × 844 switch.
//   nice -n 10 node tools/playtest.mjs --html=<dev.html> --shots=<dir> --script=tools/tests/loop-needs.scenario.mjs --width=1280 --height=800
//   (add --mobile --width=820 --height=900 for the touch layout). Prints `LOOP_NEEDS {size, failures, notes}`.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log, width, height } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'needs' });
  const hints = () => g(() => {
    const R = (n) => { const b = n.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
    const cards = [...document.querySelectorAll('[data-modal=journal] [data-fish]')];
    return [...document.querySelectorAll('[data-modal=journal] [data-loop=need]')].map((n) => {
      const card = n.closest('[data-fish]'), r = R(n), c = R(card), lh = parseFloat(getComputedStyle(n).lineHeight) || 16;
      const hits = cards.filter((o) => o !== card).filter((o) => { const b = R(o); return b.l < r.r - 0.5 && b.r > r.l + 0.5 && b.t < r.b - 0.5 && b.b > r.t + 0.5; }).map((o) => o.dataset.fish);
      const kids = [...card.children].filter((k) => k !== n && k.getBoundingClientRect().height > 0).filter((k) => { const b = R(k); return b.l < r.r - 0.5 && b.r > r.l + 0.5 && b.t < r.b - 0.5 && b.b > r.t + 0.5; }).map((k) => k.className);
      return { fish: card.dataset.fish, text: n.textContent, inside: r.l >= c.l - 0.5 && r.r <= c.r + 0.5 && r.t >= c.t - 0.5 && r.b <= c.b + 0.5,
        whole: n.scrollWidth <= n.clientWidth + 1 && n.scrollHeight <= n.clientHeight + 1, lines: Math.round((r.b - r.t) / lh), px: parseFloat(getComputedStyle(n).fontSize), hits, kids };
    });
  });
  const openList = async () => {
    await g(() => window.__gw.ui.openJournal({ from: 'jetty', tab: 'water', zone: 'mossmere', view: 'page', sel: null, big: null, pageScroll: null }));
    await K.settle(900); await K.steps(2);
  };
  const closeJournal = async () => {
    await g(() => document.querySelector('[data-modal=journal] .gw-x')?.click());
    for (let i = 0; i < 20 && (await g(() => !!document.querySelector('[data-modal=journal]'))); i++) await K.settle(200);
    await K.settle(300);
  };
  const fitCheck = (H, sz) => {
    for (const x of H) K.check(x.inside && x.whole && x.lines <= 2 && !x.hits.length && !x.kids.length && x.px >= 13, `${sz}: ${x.fish}'s "${x.text}" whole, in its card, clear`, x);
  };
  // T43 on the hints alone (the page's other words are the Journal's own, scanned by its scenarios; a stub Wick's name is not listed)
  const scanHints = async (where) => {
    const r = await K.scanRaw();
    K.check(r.banned.length === 0 && !r.unknown.some((u) => /^Needs\b/.test(u.text)), `T43 (${where}): every hint on the allow-list, no banned word`, r.unknown);
  };
  const shotAt = async (name, fish) => {
    await g((id) => document.querySelector(`[data-modal=journal] [data-fish=${id}]`)?.scrollIntoView({ block: 'center' }), fish);
    await K.settle(400); await K.shoot(name);
  };
  try {
    K.step('needs: a fresh save past the tutorial, at home');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => window.__gw.game.beginIntro({ character: 'stub' }));
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.game.save(); });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'home');
    await K.secs(1.2); await K.settle(300);
    K.note('the save', await g(() => ({ journal: Object.keys(window.__gw.state.meta.journal || {}), lures: window.__gw.state.meta.loop.lures, bag: window.__gw.state.meta.loop.bait })));

    K.step('needs: the Journal\'s list on a fresh save');
    await openList();
    let H = await hints();
    const by = (id) => H.find((x) => x.fish === id)?.text ?? null;
    const G = TL.gate.hint;
    K.check(by('reedjaw_pike') === G.lure && by('thousandcast_pike') === G.lure && by('hullkiss_lamprey') === G.lure && by('gloam_eel') === G.bait,
      'the pike and both giants "Needs a lure.", the Gloam Eel "Needs bait."', H.map((x) => [x.fish, x.text]));
    K.check(H.length === 4, 'no other card carries a hint', H.map((x) => x.fish));
    fitCheck(H, K.tag);
    await K.shoot('list-top');
    await shotAt('list-pike', 'reedjaw_pike');
    await shotAt('list-eel', 'gloam_eel');
    await scanHints('the Journal\'s list');

    K.step('needs: a Glimmer Spoon given; the pike\'s hint goes');
    await closeJournal();
    await g(() => { const c = window.__gw, L = c.state.meta.loop; if (!L.lures.includes('glimmer_spoon')) L.lures.push('glimmer_spoon'); c.game.save(); });
    await openList();
    H = await hints();
    K.check(!H.some((x) => ['reedjaw_pike', 'thousandcast_pike', 'hullkiss_lamprey'].includes(x.fish)) && H.some((x) => x.fish === 'gloam_eel' && x.text === G.bait),
      'with the spoon: no hint on the pike or the giants; the eel\'s stays', H.map((x) => [x.fish, x.text]));
    await shotAt('spoon-pike', 'reedjaw_pike');
    await closeJournal();

    K.step('needs: 390 × 844');
    await page.setViewportSize({ width: 390, height: 844 });
    await K.settle(900);
    await g(() => { const L = window.__gw.state.meta.loop; L.lures = L.lures.filter((id) => id !== 'glimmer_spoon'); });   // (the hints back, to see them small)
    await openList();
    H = await hints();
    K.check(H.length === 4, '390: the four hints', H.map((x) => x.fish));
    fitCheck(H, '390x844');
    await K.shoot('390-top');
    await shotAt('390-pike', 'reedjaw_pike');
    await shotAt('390-eel', 'gloam_eel');
    await scanHints('the Journal\'s list at 390');
    await closeJournal();
    await page.setViewportSize({ width, height });
    await K.settle(600);
    await K.noErrors('the needs walk');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_NEEDS', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
