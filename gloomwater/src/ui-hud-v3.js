// ui-hud-v3.js — the v3 half of the in-play HUD (DESIGN §25.5.7, §25.5.2, §25.6.1, §25.6.4–§25.6.7; CONTRACT §13.7 ui, §13.7a).
// Built on ui-hud.js (it owns the elements this module adds to) and only alive on a v3 run (ui-v3.v3Run): with the data
// flag off, or in The Long Descent, every element stays hidden and the v1 HUD runs exactly as before. (The automatic-fishing
// presentation below keys on ui-af.afOn, so The Long Descent's plays read the same way.)
//
//   U1 / C2  the day HUD by night mode (BALANCE.nightModes[mode].hud): Embers, Flare and Burn by the §25.5.7 table, the
//            satiety bar replaced by the Well-fed glyph, weapons wait for the night; the Stillnight word and the forecast
//   U13      the float's favour: 0–5 slanted ink notches beside the bobber, the band's words, "gone quiet", and the active
//            favours by family in plain words on a long press / hover / tap (or always, settings.favourDetails)
//   U2       the bite tell as an ink pictogram + words beside the bobber (readable with sound off and on a phone)
//   U2′      automatic fishing: no reel bar, pips or Ease glyph; the strike word under the float and its ring burst; the strike
//            ring (settings.strikeRing); during the play only the class estimate stamp (after the first glimpse) and, while a
//            Small / Keeper play is hurried, the hurry mark: no cut, no reel control; after a loss and its quiet beat the got-away
//            note (fish:escaped): a one-line ink toast for Small–Prize, the ink card for Trophy+ with "Odds in your log"
//   S6       the watch-lamp line ("Nearest watch-lamp 34 m · ≈ 7 s" from Murk's 85% bell), the lamp-watch / Scorched line,
//            the guttering countdown, and an edge marker to the nearest watch-lamp
//   Hidden information (§13.7a): nothing here reads a species, rarity or chance from the cast to the reveal; the got-away note
//   names the species only after the loss (fish:escaped), and never prints a %.
import { icon, sealSvg } from './ui-icons.js';
import { drawFishInk } from './ui-fishart.js';
import * as V from './ui-v3.js';
import * as AF from './ui-af.js';

// the bite tells as small ink pictograms (60×40): a water line, the float, and the motion that names the class
const TELL_SVG = {
  doublePop: `<path class="wl" d="M4 27h52"/><g class="tf tf-pop"><circle cx="30" cy="22" r="3.4"/><path d="M30 18.6v-6"/></g>
    <path class="tr tr-a" d="M21 27c2.4-3 15.6-3 18 0"/><path class="tr tr-b" d="M15 28c4-5 26-5 30 0"/>`,
  plunge: `<path class="wl" d="M4 22h52"/><g class="tf tf-plunge"><circle cx="30" cy="22" r="3.4"/><path d="M30 18.6v-6"/></g>
    <path class="tm" d="M30 28v8M26.5 32.5 30 36l3.5-3.5"/>`,
  dragUnder: `<path class="wl" d="M4 18h52"/><g class="tf tf-drag"><circle cx="22" cy="18" r="3.4"/><path d="M22 14.6v-6"/></g>
    <path class="tm" d="M25 22c5 3 11 8 16 14M36.4 35.6l4.8.6-.4-4.8"/>`,
  flatSlide: `<path class="wl" d="M4 22h52"/><g class="tf tf-flat"><circle cx="20" cy="20" r="3.4"/><path d="M23.4 20h6"/></g>
    <path class="tm" d="M33 15h17M46.5 11.5 50 15l-3.5 3.5"/>`,
  dome: `<path class="wl" d="M4 27h11c4 0 6-9 15-9s11 9 15 9h11"/><g class="tf tf-dome"><circle cx="30" cy="14.6" r="3.4"/><path d="M30 11.2v-6"/></g>
    <path class="tr tr-a" d="M12 31c6 2.6 30 2.6 36 0"/>`,
};
const TICK_X = [7, 19, 31, 43, 55];

export function createHudV3(K, el, R, w) {
  const { ctx, D, num, arr, safe, run, stat, h, esc } = K;
  const { setText, setStyle, setVar, toggle, restartAnim } = w;
  const fishV = () => { const f = ctx.fishing; return f && !f.isStub ? f : null; };
  const settings = () => K.settings();

  // ------------------------------------------------------------------ elements
  const wf = h('div', 'gw-wf', `<span class="gw-wf-ico">${icon('wellfed')}</span><span class="gw-wf-t">Well-fed</span>`);
  R.cluster.appendChild(wf);
  const fore = h('div', 'gw-clock-fore');
  R.clock.appendChild(fore);
  const status = h('div', 'gw-status', '<span class="gw-status-ico"></span><span class="gw-status-t"></span>');
  R.clock.parentNode.insertBefore(status, R.clock.nextSibling);
  const statusIco = status.querySelector('.gw-status-ico'), statusT = status.querySelector('.gw-status-t');
  const bank = h('i', 'gw-level-bank');
  R.level.appendChild(bank);

  // the float's favour
  const fav = h('div', 'gw-favour', `<svg class="gw-fav-ticks" viewBox="0 0 64 24" aria-hidden="true">${TICK_X.map((x, i) => `<path class="gw-tick-${i}" pathLength="100" d="M${x - 3.2} 20.5 C${x - 1.6} 15 ${x + 1.6} 9 ${x + 3.6} 3.5"/>`).join('')}</svg>
    <div class="gw-fav-say"></div><div class="gw-fav-list"></div>`);
  fav.setAttribute('aria-label', "The water's favour (press and hold for details)");
  R.fishui.appendChild(fav);
  const favTicks = [...fav.querySelectorAll('.gw-fav-ticks path')], favSay = fav.querySelector('.gw-fav-say'), favList = fav.querySelector('.gw-fav-list');
  // the bite tell
  const tell = h('div', 'gw-tell', '<svg class="gw-tell-svg" viewBox="0 0 60 40" aria-hidden="true"></svg><div class="gw-tell-w"></div>');
  R.fishui.appendChild(tell);
  const tellSvg = tell.querySelector('svg'), tellW = tell.querySelector('.gw-tell-w');
  // the play (U2′): the class estimate stamp and the hurry mark, where the reel line used to be; nothing else is on screen
  const play = h('div', 'gw-play', `<div class="gw-play-est" aria-live="polite"></div><div class="gw-play-hurry" aria-hidden="true"><svg viewBox="0 0 44 20"><path d="M4 3l8 7-8 7"/><path d="M16 3l8 7-8 7"/><path d="M28 3l8 7-8 7"/></svg><span>hurrying</span></div>`);
  R.fishui.appendChild(play);
  const estEl = play.querySelector('.gw-play-est'), hurryEl = play.querySelector('.gw-play-hurry');
  // the strike word under the float and its ring burst (≤ 0.6 s; Clean adds pale-gold glints)
  const GLINTS = Array.from({ length: 9 }, (_, i) => `<i style="--a:${(i * 40 + 12).toFixed(0)}deg;--d:${(0.86 + (i % 3) * 0.12).toFixed(2)}"></i>`).join('');
  const strike = h('div', 'gw-strike', `<div class="gw-strike-burst"><svg viewBox="-50 -50 100 100" aria-hidden="true"><circle class="gw-sb-r" r="20"/><circle class="gw-sb-r2" r="14"/></svg><div class="gw-sb-glints">${GLINTS}</div></div><div class="gw-strike-w"></div>`);
  strike.setAttribute('aria-live', 'polite');
  R.fishui.appendChild(strike);
  const strikeW = strike.querySelector('.gw-strike-w');
  // the word's own animation ends the strike feedback (a timer is only the fallback for a tab that does not animate)
  strikeW.addEventListener('animationend', () => { strikeT = 0; strike.classList.remove('gw-on'); });
  // the strike ring: a thin ink ring that closes on the float over the window, its Clean part brighter (timing only, never odds)
  const ringNS = 'http://www.w3.org/2000/svg';
  const ringK = document.createElementNS(ringNS, 'circle');
  // centred on the float itself (the "!" rides 40 px above it), so the ring visibly closes onto the float
  ringK.setAttribute('class', 'k'); ringK.setAttribute('cx', '35'); ringK.setAttribute('cy', '75'); ringK.setAttribute('r', '30');
  R.bite.querySelector('svg')?.appendChild(ringK);
  // the got-away note (DESIGN §25.6.7): a one-line ink toast (Small–Prize) …
  const away = h('button', 'gw-away', `<svg class="gw-away-wash" viewBox="0 0 600 64" preserveAspectRatio="none" aria-hidden="true"><path filter="url(#gw-ink-edge)" d="M18 14 C150 4 450 4 584 16 C594 30 592 44 580 52 C440 62 160 62 20 52 C8 42 8 26 18 14 Z"/></svg><span class="gw-away-t"></span><i class="gw-away-go" aria-hidden="true">›</i>`);
  away.type = 'button';
  el.appendChild(away);
  const awayT = away.querySelector('.gw-away-t');
  // … and the ink card for Trophy and bigger (the P1b gw-nearmiss shell, restyled in the catch card's ink-wash language)
  const nm = h('div', 'gw-gotaway', `<svg class="gw-ga-wash" viewBox="0 0 560 230" preserveAspectRatio="none" aria-hidden="true"><path filter="url(#gw-ink-edge)" d="M26 22 C160 8 400 10 536 24 C552 90 550 160 532 206 C380 220 170 220 30 208 C12 160 12 80 26 22 Z"/></svg>
    <div class="gw-ga-art"><canvas class="gw-ga-fish" width="170" height="80"></canvas></div>
    <div class="gw-ga-txt"><div class="gw-ga-k"></div><div class="gw-ga-title"></div><div class="gw-ga-name"></div><p class="gw-ga-line"></p><p class="gw-ga-still"></p><p class="gw-ga-hint"></p>
    <button type="button" class="gw-link gw-ga-link"></button></div>`);
  nm.setAttribute('role', 'status');
  el.appendChild(nm);
  // the Scorched card (U18: Lantern, Embers at 0; the run continues): a non-blocking ink patch, gone on a tap or after 8 s
  const SCORCH_EMBERS = [14, 30, 46].map((x, i) => `<g transform="translate(${x} ${i === 1 ? 30 : 34})"><path class="gw-sc-ember" d="M0-13c1.6 4.2 6 6.6 6 11.6a6 6 0 0 1-12 0c0-3.4 2-5 3.2-7 .5 2 1.3 3 2.3 3.6C-1-7.4-1-10.4 0-13z"/></g>`).join('');
  const sc = h('div', 'gw-scorched', `<svg class="gw-sc-wash" viewBox="0 0 560 220" preserveAspectRatio="none" aria-hidden="true"><path filter="url(#gw-ink-edge)" d="M24 24 C170 8 400 10 538 26 C552 90 550 150 534 198 C380 212 170 212 28 200 C12 150 12 80 24 24 Z"/></svg>
    <svg class="gw-sc-glyph" viewBox="0 0 60 52" aria-hidden="true">${SCORCH_EMBERS}<path class="gw-sc-smoke" pathLength="100" d="M30 16 C26 10 34 6 30 0"/></svg>
    <div class="gw-sc-txt"><div class="gw-sc-k"></div><div class="gw-sc-title"></div><div class="gw-sc-lines"></div><div class="gw-sc-note"></div></div>`);
  sc.setAttribute('role', 'status');
  el.appendChild(sc);
  const scT = { k: sc.querySelector('.gw-sc-k'), title: sc.querySelector('.gw-sc-title'), lines: sc.querySelector('.gw-sc-lines'), note: sc.querySelector('.gw-sc-note') };
  const nmFish = nm.querySelector('.gw-ga-fish');
  const nmT = { k: nm.querySelector('.gw-ga-k'), title: nm.querySelector('.gw-ga-title'), name: nm.querySelector('.gw-ga-name'), line: nm.querySelector('.gw-ga-line'), still: nm.querySelector('.gw-ga-still'), hint: nm.querySelector('.gw-ga-hint'), link: nm.querySelector('.gw-ga-link') };

  // ------------------------------------------------------------------ state
  let live = false, vis = null, hitAt = -1e9, swarmSeen = false, nightKey = '';
  let favN = -1, favQuiet = null, favSig = '', favOpen = false, favHover = false, favPress = null, favPinned = false;
  let tellId = '', clsShown = '', nmT0 = 0, nmQ = [], nmP = null, awayT0 = 0, awayP = null;
  let strikeT = 0, glimpsed = false, playSeen = false, ringOn = false;
  const strikeAt = { x: 0, y: 0, ok: false };
  let watchTarget = null;
  let scT0 = 0;
  const memo = new Map();
  const last = (k) => memo.get(k);
  const lastSet = (k, v) => memo.set(k, v);
  const seen = (k) => !!K.meta().seenTips?.[k];
  const markSeen = (k) => { const m = K.meta(); m.seenTips = m.seenTips || {}; m.seenTips[k] = true; };

  // ------------------------------------------------------------------ favour: long press / hover / tap
  const LONG = 380;
  fav.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    favPress = { id: e.pointerId, at: performance.now(), opened: false };
    favPress.timer = setTimeout(() => { if (favPress) { favPress.opened = true; favOpen = true; paintFavOpen(); K.sfx('ui_hover', { volume: 0.35 }); } }, LONG);
  });
  const favUp = (e) => {
    if (!favPress || (e && e.pointerId !== favPress.id)) return;
    clearTimeout(favPress.timer);
    // a tap (no long press) pins the list open or closed; a long press shows it while held
    if (!favPress.opened) { favPinned = !favPinned; favOpen = favPinned; K.sfx('ui_click', { volume: 0.4 }); }
    else if (!favPinned) favOpen = false;
    favPress = null;
    paintFavOpen();
  };
  fav.addEventListener('pointerup', favUp);
  fav.addEventListener('pointercancel', favUp);
  fav.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { favHover = false; paintFavOpen(); } });
  fav.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { favHover = true; paintFavOpen(); } });
  fav.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
  function paintFavOpen() { toggle(fav, 'fav', 'gw-open', favOpen || favHover || settings().favourDetails === true); }

  // ------------------------------------------------------------------ events
  const on = (evt, fn) => { try { ctx.bus.on(evt, (p) => { try { if (live) fn(p || {}); } catch (e) { K.report(`hudv3 ${evt}`, e); } }); } catch { /* bus optional */ } };
  on('player:damage', ({ amount }) => { if (num(amount, 1) >= 1) hitAt = performance.now(); });
  on('swarm:window', ({ state }) => { if (state === 'open') swarmSeen = true; });
  on('phase:change', ({ phase }) => { if (phase === 'calm' || phase === 'dawn') swarmSeen = false; });
  // automatic fishing (U2′): the strike word and burst; the first glimpse stamps the class estimate (Prize+, or the Small skitter
  // when fishing names it: view.estimate / view.sizeClass); the got-away note after the quiet beat
  const onAf = (evt, fn) => { try { ctx.bus.on(evt, (p) => { try { if (AF.afOn(D())) fn(p || {}); } catch (e) { K.report(`hudv3 ${evt}`, e); } }); } catch { /* bus optional */ } };
  onAf('fishing:strike', (p) => showStrike(p));
  onAf('fishing:reel', (p) => {
    playSeen = true;
    if (p.phase === 'glimpse' && !p.legendary && (p.kind === 'skitter' || ['prize', 'trophy', 'elder', 'ancient'].includes(p.sizeClass))) glimpsed = p.sizeClass || true;
  });
  onAf('fishing:cast', () => { glimpsed = false; playSeen = false; dismissNote(); });
  onAf('fish:escaped', (p) => { nmQ.push({ p, at: performance.now() }); });
  on('player:scorched', () => showScorched());

  // ------------------------------------------------------------------ frame
  /** The §25.5.7 visibility for this frame (null when this is not a v3 run). Called by ui-hud before it paints vitals. */
  function frame(r, dt) {
    const d = D();
    const was = live;
    live = V.v3Run(d, r);
    toggle(el, 'v3', 'gw-v3', live);
    // automatic fishing (U2′): no reel bar, pips or Ease glyph on any v3 path (The Long Descent's plays are automatic too)
    toggle(el, 'af', 'gw-af', AF.afOn(d));
    if (!live) {
      if (was) { for (const c of ['gw-hide-embers', 'gw-hide-flare', 'gw-hide-burn', 'gw-hide-weapons', 'gw-wf-mode', 'gw-cine']) el.classList.remove(c); }
      vis = null; return null;
    }
    const mode = r.nightMode;
    const pi = K.phaseInfo() || {};
    const phase = pi.phase || r.phase || 'calm';
    const key = `${r.id ?? ''}:${r.day}`;
    if (key !== nightKey) { nightKey = key; swarmSeen = false; }
    const cb = ctx.combat && !ctx.combat.isStub ? ctx.combat : null;
    const swarmNight = !!safe(() => cb?.swarmTonight, false);
    const swarmActive = !!safe(() => cb?.swarmActive, false);
    const maxOil = Math.max(1, stat('maxOil'));
    const S = ctx.survival && !ctx.survival.isStub ? ctx.survival : null;
    vis = V.hudVisibility({
      hud: V.modeHud(d, mode), phase, swarmNight, swarmActive, hitT: (performance.now() - hitAt) / 1000,
      oilFrac: num(r.oil) / maxOil, scorched: !!r.scorched, guttering: !!safe(() => S?.guttering, false),
      hp: num(r.hp), maxHp: Math.max(1, Math.round(stat('maxHp'))),
    });
    vis.mode = mode; vis.phase = phase; vis.swarmNight = swarmNight; vis.swarmActive = swarmActive;
    // tonight reads Gloomtide once a swarm came (to dawn, even through Lantern's quiet tail); a Still run never does
    vis.swarmWord = mode !== 'still' && (mode === 'gloomtide' || swarmActive || swarmSeen || swarmNight);
    toggle(el, 'v3', 'gw-hide-embers', !vis.embers);
    toggle(el, 'v3', 'gw-hide-flare', !vis.flare);
    toggle(el, 'v3', 'gw-hide-burn', !vis.burn);
    toggle(el, 'v3', 'gw-hide-weapons', !vis.weapons);
    toggle(el, 'v3', 'gw-wf-mode', vis.wellFed);
    toggle(R.burn, 'v3', 'gw-relight', vis.relight);
    // the measuring ceremony (ctx.cinematic, F5): the fight's gauge and the buttons step back for the camera and the overlay
    toggle(el, 'v3', 'gw-cine', !!ctx.cinematic || !!K.measure?.active?.());
    // Well-fed glyph
    const fed = !!safe(() => S?.wellFed, false);
    toggle(wf, 'wf', 'gw-fed', fed);
    setText(wf.querySelector('.gw-wf-t'), 'wfT', fed ? 'Well-fed' : 'Hungry');
    // automatic fishing: Well-fed is +2 Hold (BALANCE.wellFed.effects since D1′); no reel stat and no % on the HUD
    const hold = num(d.BALANCE?.wellFed?.effects?.hold, num(d.CATCH_V3?.buffs?.wellFed, 2));
    const wtitle = fed ? `Well-fed: a steadier hand on the line (+${hold} Hold). Hunger never hurts.`
      : 'Eat a fish to be Well-fed again. Hunger never hurts.';
    if (wf.title !== wtitle) wf.title = wtitle;
    // banked level-ups wait for the card or the dawn bell: a small count on the level ring
    const nb = Math.max(0, Math.round(num(safe(() => cb?.bankedLevels, r.levelBank), num(r.levelBank))));
    // one gold bead per waiting level-up on the ring's upper arc (up to three)
    if (last('bankN') !== nb) { lastSet('bankN', nb); bank.innerHTML = '<b></b>'.repeat(Math.min(3, nb)); }
    const lt = nb ? `Your flame's level · ${nb} level-up${nb > 1 ? 's' : ''} waiting for the next catch card or the dawn bell` : "Your flame's level";
    if (R.level.title !== lt) R.level.title = lt;
    toggle(bank, 'bank', 'gw-on', nb > 0);
    paintForecast(r, phase, mode, swarmNight);
    paintStatus(r, pi, phase, mode, swarmNight, S);
    return vis;
  }

  // the clock's forecast line (Lantern: tonight's swarm or a Stillnight, said in calm and dusk)
  function paintForecast(r, phase, mode, swarmNight) {
    let t = '', cls = '';
    if (mode === 'lantern' && (phase === 'calm' || phase === 'dusk') && !r.lampWatch) {
      if (swarmNight) { t = D().TEXT_V3?.stirs || 'The Gloom stirs tonight.'; cls = 'gw-stirs'; }
      else { t = `A ${V.nightWord(D(), { swarm: false })} tonight.`; cls = 'gw-still'; }
    }
    setText(fore, 'fore', t);
    toggle(fore, 'fore', 'gw-on', !!t);
    toggle(fore, 'fore', 'gw-stirs', cls === 'gw-stirs');
    // declutter: the forecast is a tint on the day line's night stretch (pink: the Gloom stirs; pale: a Stillnight); its words
    // ride the clock's hover title
    const fk = cls === 'gw-stirs' ? 'stirs' : cls === 'gw-still' ? 'still' : '';
    if (last('foreK') !== fk) { lastSet('foreK', fk); if (fk) R.clock.dataset.fore = fk; else delete R.clock.dataset.fore; }
  }

  // ------------------------------------------------------------------ the status line (S2 guttering, S6, Scorched)
  function lampsOf(r) {
    const wl = safe(() => (ctx.world && !ctx.world.isStub ? ctx.world.getWatchLamps?.() : null), null);
    // a §24 sister-candle's pool exists only while it is lit (world reports lit:false until then), as survival reads it
    if (Array.isArray(wl) && wl.length) return wl.filter((l) => l && l.lit !== false);
    return arr(K.zoneData(r.zone)?.arena?.watchLamps);
  }
  /** TEXT_V3.hud copy with {m}/{s} slots; a number and its unit never break apart */
  function hudLine(key, fallback, vars = {}) {
    const tpl = D().TEXT_V3?.hud?.[key];
    return String(typeof tpl === 'string' && tpl ? tpl : fallback)
      .replace(/\{(\w+)\}/g, (m0, k) => (vars[k] === undefined ? m0 : String(vars[k])))
      .replace(/(\d) (m|s)\b/g, '$1\u00a0$2');
  }
  let statusKind = '';
  function setStatus(kind, ico, text) {
    if (kind !== statusKind) {
      statusKind = kind;
      status.className = `gw-status${kind ? ` gw-on gw-st-${kind}` : ''}`;
      statusIco.innerHTML = ico ? icon(ico) : '';
    }
    setText(statusT, 'stT', text || '');
    // declutter: the calm states (the nearest lamp, a lamp-watch) are a glyph; their words on hover / long-press
    if (status.title !== (text || '')) status.title = text || '';
  }
  function paintStatus(r, pi, phase, mode, swarmNight, S) {
    watchTarget = null;
    const LW = D().BALANCE?.nightModes?.lampWatch || {};
    const pp = ctx.player?.position;
    if (safe(() => S?.guttering, false)) {
      const left = Math.max(0, Math.ceil(num(safe(() => S.gutterLeft, 0))));
      setStatus('gutter', 'lantern', hudLine(K.burnable() ? 'gutter' : 'gutterEmpty', K.burnable() ? 'Guttering · {s} s · render a fish to relight' : 'Guttering · {s} s · the creel is empty: catch one, fast', { s: left }));
      return;
    }
    const lw = safe(() => S?.lampWatch, null) || r.lampWatch || null;
    const fishR = Math.round(num(LW.fishWithin, 10));
    if (lw) {
      if (lw.forced) { setStatus('scorch', 'ember', hudLine('scorchedWatch', 'Scorched · held here till dawn · fish within {m} m', { m: fishR })); return; }
      const lim = num(lw.radius, num(LW.radius, 6)) + num(LW.leaveCancels, 10);
      const d = pp ? Math.hypot(pp.x - num(lw.x), pp.z - num(lw.z)) : 0;
      if (d > lim - 4) setStatus('stray', 'watchlamp', hudLine('stray', 'Stray no farther · the watch breaks at {m} m', { m: Math.round(lim) }));
      else setStatus('watch', 'watchlamp', hudLine('lampWatch', 'Lamp-watch · the Gloom keeps away · fish within {m} m', { m: fishR }));
      return;
    }
    const modes = arr(LW.modes).length ? LW.modes : ['lantern'];
    const from = num(LW.hudFromMurkBell, 0.85);
    const k = num(pi.k, num(pi.time) / Math.max(1, num(pi.duration, 1)));
    const window = modes.includes(mode) && swarmNight && !r.scorched && ((phase === 'calm' && k >= from) || phase === 'dusk');
    if (window && pp) {
      const info = V.nearestLamp(lampsOf(r), pp.x, pp.z, stat('moveSpeed') || 6);
      if (info) {
        watchTarget = info;
        if (info.inside) setStatus('watch', 'watchlamp', hudLine('watchHere', "In the watch-lamp's light · stay till dusk ends"));
        else setStatus('lamp', 'watchlamp', V.watchLineText(D(), info));
        return;
      }
    }
    setStatus('', null, '');
  }
  /** Edge marker to the nearest watch-lamp while the line shows (ui-hud's gatherTargets calls this). */
  function markers(add) { if (live && watchTarget && !watchTarget.inside) add('watch', { x: watchTarget.x, y: 0.6, z: watchTarget.z }); }

  // ------------------------------------------------------------------ fishing: favour, tell, reel extras
  function placeNear(node, key, p, dx, dy, wHalf = 70) {
    const W = K.vw, H = K.vh;
    const top = W < 700 ? 190 : 120;
    const x = Math.max(16 + wHalf, Math.min(W - 16 - wHalf, p.x + dx));
    const y = Math.max(top, Math.min(H - 230, p.y + dy));
    setStyle(node, key, 'transform', `translate3d(${x.toFixed(0)}px,${y.toFixed(0)}px,0)`);
  }
  /** The float's favour never covers the bobber: above-right of it when there is room, else below; the list opens away
   *  from the bobber when it fits. */
  function placeFav(p) {
    const W = K.vw, H = K.vh;
    const top = W < 700 ? 190 : 118;
    const open = fav.classList.contains('gw-open');
    const wHalf = open ? Math.min(164, W * 0.44) : 74;
    const listH = open ? (favList.offsetHeight || 120) : 0;
    const x = Math.max(16 + wHalf, Math.min(W - 16 - wHalf, p.x + 36));
    const below = p.y - 70 < top;
    const y = Math.max(top, Math.min(H - 250, below ? p.y + 46 : p.y - 66));
    toggle(fav, 'fav', 'gw-list-up', !below && y - 20 - listH > (W < 700 ? 150 : 90));
    setStyle(fav, 'favT', 'transform', `translate3d(${x.toFixed(0)}px,${y.toFixed(0)}px,0)`);
  }
  const bobP = { x: 0, y: 0, ok: false };
  function fishing(dt) {
    const f = fishV();
    const st = f ? f.state : 'idle';
    const v = (f && f.view) || {};
    const af = AF.afOn(D());
    if ((!live && !af) || !f) { toggle(fav, 'fav', 'gw-on', false); toggle(tell, 'tell', 'gw-on', false); paintPlay('idle', {}, dt, false); return; }
    // the bobber on screen
    bobP.ok = false;
    if (f.bobberPos) {
      const p = K.project({ x: f.bobberPos.x, y: num(f.bobberPos.y) + 0.35, z: f.bobberPos.z });
      if (p.ok && !p.behind) { bobP.x = p.x; bobP.y = p.y; bobP.ok = true; }
    }
    if (bobP.ok && (st === 'bite' || st === 'waiting')) { strikeAt.x = bobP.x; strikeAt.y = bobP.y; strikeAt.ok = true; }
    if (live) { paintFavour(st, v); paintTell(st, v); } else { toggle(fav, 'fav', 'gw-on', false); toggle(tell, 'tell', 'gw-on', false); }
    paintPlay(st, v, dt, af);
  }

  function paintFavour(st, v) {
    const F = v.favour;
    const show = bobP.ok && st === 'waiting' && F && typeof F === 'object';
    toggle(fav, 'fav', 'gw-on', !!show);
    if (!show) { if (!favPinned) favOpen = false; return; }
    const n = Math.max(0, Math.min(5, Math.round(num(F.notches))));
    const quiet = !!F.quiet;
    if (n !== favN || quiet !== favQuiet) {
      const grew = favN >= 0 && n > favN;
      favTicks.forEach((t, i) => {
        t.classList.toggle('gw-lit', i < n);
        // a new notch inks itself in (SVG: getBoundingClientRect forces the restart)
        if (grew && i >= favN && i < n) { t.classList.remove('gw-ink'); t.getBoundingClientRect(); t.classList.add('gw-ink'); }
      });
      favN = n; favQuiet = quiet;
      toggle(fav, 'fav', 'gw-quiet', quiet);
      toggle(fav, 'fav', 'gw-full', n >= 5);
      favSay.textContent = V.favourBand(n, quiet, D());
      if (grew) restartAnim(favSay, 'gw-fresh');
    }
    // the list (rebuilt only when the terms change: the hour, a sign, pressure)
    const sig = arr(F.terms).map((t) => `${t?.family}:${t?.id}:${t?.value}`).join('|');
    if (sig !== favSig) {
      favSig = sig;
      const placeName = v.place ? (D().PLACE_BY_ID?.[v.place]?.name || '') : '';
      const groups = V.favourGroups(F.terms, D(), { placeName });
      favList.innerHTML = groups.length
        ? groups.map((g) => `<p class="gw-fam-${g.family}"><b>${esc(g.label)}</b><span>${g.words.map((x) => `<span${x.neg ? ' class="gw-neg"' : ''}>${esc(x.text)}</span>`).join(', ')}</span></p>`).join('')
        : '<p class="gw-fav-none">Nothing in your favour here. Try dusk, a place, or the right bait.</p>';
    }
    paintFavOpen();
    // dims while a tell plays beside it
    toggle(fav, 'fav', 'gw-dim', !!v.biteTell);
    placeFav(bobP);
  }

  function tellCount(id) { let n = 0; for (let i = 1; i <= 3; i++) if (seen(`ui_tell_${id}_${i}`)) n = i; return n; }
  function paintTell(st, v) {
    const id = (st === 'waiting' || st === 'bite') && bobP.ok ? v.biteTell : null;
    const T = id ? V.tellInfo(id, D()) : null;
    toggle(tell, 'tell', 'gw-on', !!T);
    if (!T) { tellId = ''; return; }
    if (id !== tellId) {
      tellId = id;
      tellSvg.innerHTML = TELL_SVG[id] || TELL_SVG.plunge;
      tell.dataset.tell = id;
      // the first three of each kind also name the class they mean (the reading is the player's after that)
      const n = tellCount(id);
      const ci = V.classInfo(D(), T.cls);
      const legend = !!v.legendary;   // legends are exempt (named by their pool and bait); consumers key on `legendary`, never on rarity
      tellW.innerHTML = `<span>${esc(T.short)}</span>${n < 3 && ci && !legend ? `<em class="gw-cls-${ci.id}">${esc(ci.label)}?</em>` : ''}`;
      if (n < 3) markSeen(`ui_tell_${id}_${n + 1}`);
      restartAnim(tell, 'gw-pop');
    }
    placeNear(tell, 'tellT', bobP, -92, -62, 66);
  }

  // ------------------------------------------------------------------ the play (U2′): only the class estimate and the hurry mark
  /** The class fishing names during the play: view.estimate (a class id or {sizeClass}), view.sizeClass (null until the first
   *  breach), or the first Prize+ glimpse / the Small skitter on the bus. Never a species; legends carry their own banner. */
  function estimateClass(st, v) {
    if (v.legendary) return '';
    const e = v.estimate;
    const fromView = typeof e === 'string' ? e : e && typeof e === 'object' && typeof e.sizeClass === 'string' ? e.sizeClass : '';
    if (fromView) return fromView;
    if (typeof v.sizeClass === 'string' && v.sizeClass) return v.sizeClass;
    if (st === 'reeling' && typeof glimpsed === 'string') return glimpsed;
    return '';
  }
  function paintPlay(st, v, dt, af) {
    if (strikeT > 0) { strikeT -= dt; if (strikeT <= 0) strike.classList.remove('gw-on'); }
    const playing = af && (st === 'reeling' || (st === 'bite' && !!v.sizeClass));
    // the class estimate stamp (a seal and a word, "by the look of it")
    const c = playing ? estimateClass(st, v) : '';
    const ckey = c ? `${c}${v.ancient ? '+' : ''}` : '';
    if (ckey !== clsShown) {
      clsShown = ckey;
      if (ckey) {
        const ci = V.classInfo(D(), c, !!v.ancient) || { id: c, label: c, seal: null };
        const words = String(D().AUTOFISH?.text?.estimate || 'by the look of it: {class}').split(/:\s*\{class\}/)[0];
        estEl.className = `gw-play-est gw-on gw-cls-${c}${ci.ancient ? ' gw-ancient' : ''}`;
        estEl.innerHTML = `<svg class="gw-pe-wash" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true"><path filter="url(#gw-ink-edge)" d="M16 14 C90 4 210 4 286 14 C296 30 294 46 282 56 C200 66 100 66 18 56 C6 44 6 28 16 14 Z"/></svg>${ci.seal ? sealSvg(ci.seal, { ancient: ci.ancient }) : ''}<span class="gw-pe-k">${esc(words)}</span><b>${esc(ci.label)}</b>`;
        estEl.setAttribute('aria-label', `${words}: ${ci.label}`);
        restartAnim(estEl, 'gw-stamp-in');
      } else { estEl.className = 'gw-play-est'; estEl.innerHTML = ''; estEl.removeAttribute('aria-label'); }
    }
    // the hurry mark: a Small or Keeper play held to hurry (fishing: view.play.hurry); it never changes the outcome
    const hurry = af && st === 'reeling' && !!(v.play?.hurry || v.hurry || fishV()?.hurrying);
    toggle(hurryEl, 'hurry', 'gw-on', hurry);
    toggle(play, 'play', 'gw-on', af && (st === 'reeling' || st === 'bite'));
    if (!af) return;
    // the strike ring at the float while the bite is live (settings.strikeRing: always / first expedition / never)
    const S = settings();
    const r = run();
    // fishing may draw the ring itself on the water (view.strikeRing present: {window, clean} or null): then it is its ring alone
    const fishingRing = Object.prototype.hasOwnProperty.call(v, 'strikeRing');
    ringOn = st === 'bite' && !fishingRing && AF.strikeRingOn(S.strikeRing, {
      firstExpedition: r?.outing === 'first' || num(K.meta().expeditions, 0) < 1 && !!r?.expedition,
      firstEvening: !!safe(() => ctx.firstEvening?.isActive?.(), false), tutorial: !!(v.tutorial?.strikeRing ?? v.strikeRing),
    });
    toggle(R.bite, 'ring', 'gw-ring', ringOn);
    if (ringOn) {
      const w = v.strikeWindow && typeof v.strikeWindow === 'object' ? v.strikeWindow : null;
      let k, cleanK;
      if (w && num(w.dur) > 0) { k = Math.max(0, Math.min(1, num(w.t) / num(w.dur))); cleanK = Math.max(0, Math.min(1, num(w.clean) / num(w.dur))); }
      else {
        k = 1 - Math.max(0, Math.min(1, num(v.biteWindow, 1)));
        const cls = V.TELLS[v.biteTell]?.cls || (v.legendary ? 'legend' : 'keeper');
        cleanK = AF.strikeTiming(D(), cls, num(K.stats().hookWindow, 1)).cleanK;
      }
      const start = num(D().AUTOFISH?.strike?.ring?.startPx?.[K.vw < 700 ? 'phone' : 'desktop'], K.vw < 700 ? 64 : 80);
      const rad = start + (13 - start) * k;
      setAttr(ringK, 'ringR', 'r', rad.toFixed(1));
      toggle(R.bite, 'ring', 'gw-ring-clean', k < cleanK);
    }
  }
  const setAttr = (node, key, name, val) => { if (last(key) !== val) { lastSet(key, val); node.setAttribute(name, val); } };

  // ------------------------------------------------------------------ the strike word and its ring burst (DESIGN §25.6.4)
  function showStrike(p) {
    const grade = p.grade;
    if (!['clean', 'struck', 'early', 'late'].includes(grade)) return;
    const m = K.meta();
    m.seenTips = m.seenTips || {};
    const n = num(m.seenTips.ui_struck, 0);
    const word = AF.strikeWord(D(), grade, n);
    if (grade === 'struck' && word) m.seenTips.ui_struck = n + 1;   // "Struck" is printed for the first 20 strikes, then the ring says it
    const W = K.vw, H = K.vh;
    const x = strikeAt.ok ? strikeAt.x : W / 2, y = strikeAt.ok ? strikeAt.y : H * 0.55;
    strike.style.transform = `translate3d(${Math.max(70, Math.min(W - 70, x)).toFixed(0)}px,${Math.max(80, Math.min(H - 200, y)).toFixed(0)}px,0)`;
    strike.dataset.grade = grade;
    strikeW.textContent = word ? word.text : '';
    strikeW.className = `gw-strike-w${word ? ` gw-tone-${word.tone}` : ''}`;
    restartAnim(strike, 'gw-on');
    strikeT = 3;   // (the phone haptic for the grade, AUTOFISH.strike.haptic, is fishing's: one owner, no double buzz)
  }

  // ------------------------------------------------------------------ the got-away note (DESIGN §25.6.7, fish:escaped)
  const placeName = (id) => (id ? (D().PLACE_BY_ID?.[id]?.name || D().PLACE_V3_BY_ID?.[id]?.name || arr(D().PLACES).find((x) => x?.id === id)?.name || '') : '');
  function noteOf(p) {
    const sp = K.speciesData(p.speciesId);
    return AF.gotAwayNote(D(), p, { speciesName: sp?.name || '', placeName: placeName(p.place) });
  }
  function openOdds(p) {
    if (!p?.speciesId) return false;
    return !!K.openLog?.({ speciesId: p.speciesId, section: 'odds', sizeClass: p.sizeClass === 'legend' ? null : p.sizeClass, from: 'gotAway' });
  }
  function showGotAway(p) {
    if (!p || !p.speciesId) return;
    const N = noteOf(p);
    if (N.mode === 'toast') {
      awayP = p;
      awayT.innerHTML = esc(N.toast).replace(esc(N.title), `<b>${esc(N.title)}</b>`);
      away.setAttribute('aria-label', `${N.toast} ${N.link}`);
      away.title = N.link;
      away.dataset.cls = N.cls;
      away.classList.remove('gw-out');
      restartAnim(away, 'gw-on');
      awayT0 = num(D().AUTOFISH?.gotAway?.toastSec, 2.5);
      return;
    }
    nmP = p;
    nmT.k.textContent = N.kicker;
    nmT.title.textContent = N.title;
    nmT.name.textContent = N.name ? `\u201c${N.name}\u201d` : '';
    nmT.line.textContent = [N.size, N.cause].filter(Boolean).join(' ');
    nmT.still.textContent = N.still;
    nmT.hint.textContent = N.hint;
    nmT.link.innerHTML = `${esc(N.link)} <i aria-hidden="true">\u203a</i>`;
    nm.setAttribute('aria-label', N.aria);
    nm.dataset.cls = N.cls;
    try {
      const sp = K.speciesData(p.speciesId) || { id: p.speciesId };
      drawFishInk(nmFish, sp, { w: 170, h: 80, pad: 0.06, color: p.legendary ? '#efd9a6' : '#d9d6ec' });
      nmFish.style.width = ''; nmFish.style.height = '';   // the CSS sizes it per screen
    } catch (e) { K.report('gotaway art', e); }
    nm.classList.remove('gw-out');
    restartAnim(nm, 'gw-on');
    nmT0 = num(D().AUTOFISH?.gotAway?.cardSec, 7.5);
  }
  nm.addEventListener('pointerdown', (e) => { if (e.target.closest?.('.gw-ga-link')) return; e.preventDefault(); e.stopPropagation(); nmT0 = Math.min(nmT0, 0.01); });
  nmT.link.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); K.sfx('ui_click'); if (openOdds(nmP)) nmT0 = Math.min(nmT0, 0.01); });
  away.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); });
  away.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); K.sfx('ui_click'); if (openOdds(awayP)) awayT0 = Math.min(awayT0, 0.01); });
  function dismissNote() {
    if (nmT0 > 0) nmT0 = Math.min(nmT0, 0.01);
    if (awayT0 > 0) awayT0 = Math.min(awayT0, 0.01);
  }

  // ------------------------------------------------------------------ the Scorched card
  function showScorched() {
    const r = run();
    const pending = !!r?.scorched?.pending || ['reeling', 'landing'].includes(fishV()?.state);
    const L = V.scorchedLines(D(), { pending });
    scT.k.textContent = L.kicker;
    scT.title.textContent = L.title;
    scT.lines.innerHTML = L.lines.map((x) => `<p>${esc(x)}</p>`).join('');
    scT.note.textContent = L.note;
    sc.setAttribute('aria-label', `${L.title}. ${L.lines.join(' ')} ${L.note}`);
    sc.classList.remove('gw-out');
    restartAnim(sc, 'gw-on');
    scT0 = 8;
    el.classList.add('gw-sc-up');   // the status line steps back while the card says the same
    // a got-away card under it steps aside (the Scorched card says what matters now)
    if (nmT0 > 0) { nmT0 = 0; nm.classList.remove('gw-on'); }
  }
  sc.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); scT0 = Math.min(scT0, 0.01); });
  function scorchTick(dt) {
    if (scT0 <= 0) return;
    scT0 -= dt;
    if (scT0 <= 0) { sc.classList.remove('gw-on'); sc.classList.add('gw-out'); el.classList.remove('gw-sc-up'); }
  }
  function noteTick(dt) {
    const f = fishV();
    const casting = f && (f.state === 'charging' || f.state === 'casting' || f.state === 'bite');
    if (awayT0 > 0) {
      awayT0 -= dt;
      if (casting) awayT0 = Math.min(awayT0, 0.01);
      if (awayT0 <= 0) { away.classList.remove('gw-on'); away.classList.add('gw-out'); }
    }
    if (nmT0 > 0) {
      nmT0 -= dt;
      // gone on a tap, after 7.5 s, or at the next cast
      if (casting) nmT0 = Math.min(nmT0, 0.01);
      if (nmT0 <= 0) { nm.classList.remove('gw-on'); nm.classList.add('gw-out'); }
    }
    // fishing already held the 0.6 s quiet beat before fish:escaped: the note shows at once (a newer note replaces an older one)
    if (nmQ.length) { const q = nmQ.pop(); nmQ.length = 0; if (nmT0 > 0) { nmT0 = 0; nm.classList.remove('gw-on'); } if (awayT0 > 0) { awayT0 = 0; away.classList.remove('gw-on'); } showGotAway(q.p); }
  }

  return {
    frame, markers, fishing, showGotAway,
    update(dt) {
      const af = AF.afOn(D());
      if (af) noteTick(dt);
      else { if (nmT0 > 0) { nmT0 = 0; nm.classList.remove('gw-on'); } if (awayT0 > 0) { awayT0 = 0; away.classList.remove('gw-on'); } }
      if (live) scorchTick(dt);
      else if (scT0 > 0) { scT0 = 0; sc.classList.remove('gw-on'); el.classList.remove('gw-sc-up'); }
    },
    get vis() { return vis; },
    get live() { return live; },
    /** the Scorched card is up (banners wait behind it rather than print over it) */
    get cardUp() { return scT0 > 0; },
    /** a got-away note is on screen (the log lock lifts when it shows; ui.js tracks that from the bus) */
    get noteUp() { return nmT0 > 0 || awayT0 > 0; },
    debug: () => ({ strike: strike.classList.contains('gw-on') ? { grade: strike.dataset.grade, word: strikeW.textContent } : null, estimate: clsShown || null, ring: ringOn,
      note: nmT0 > 0 ? { mode: 'card', t: Math.round(nmT0 * 100) / 100, cls: nm.dataset.cls } : awayT0 > 0 ? { mode: 'toast', t: Math.round(awayT0 * 100) / 100, cls: away.dataset.cls } : null }),
    reset() { hitAt = -1e9; swarmSeen = false; nightKey = ''; favN = -1; favQuiet = null; favSig = ''; favPinned = false; favOpen = false; tellId = ''; clsShown = ''; estEl.className = 'gw-play-est'; estEl.innerHTML = ''; glimpsed = false; playSeen = false; strikeT = 0; strike.classList.remove('gw-on'); nmQ.length = 0; nmT0 = 0; nm.classList.remove('gw-on'); awayT0 = 0; away.classList.remove('gw-on'); scT0 = 0; sc.classList.remove('gw-on'); el.classList.remove('gw-sc-up'); },
    /** the clock's durations from survival (v3 phases: 210 / 20 / 90 / 10 on day 1) */
    durations(day) {
      if (!live) return null;
      const d = safe(() => ctx.survival?.getPhaseDurations?.(day), null);
      if (!d || !(num(d.calm) > 0)) return null;
      return [num(d.calm), num(d.dusk), num(d.gloomtide), num(d.dawn)];
    },
  };
}
