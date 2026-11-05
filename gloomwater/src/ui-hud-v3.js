// ui-hud-v3.js — the v3 half of the in-play HUD (DESIGN §25.5.7, §25.5.2, §25.6.1, §25.6.4, §25.6.7; CONTRACT §13.7 ui).
// Built on ui-hud.js (it owns the elements this module adds to) and only alive on a v3 run (ui-v3.v3Run): with the data
// flag off, or in The Long Descent, every element stays hidden and the v1 HUD runs exactly as before.
//
//   U1 / C2  the day HUD by night mode (BALANCE.nightModes[mode].hud): Embers, Flare and Burn by the §25.5.7 table, the
//            satiety bar replaced by the Well-fed glyph, weapons wait for the night; the Stillnight word and the forecast
//   U13      the float's favour: 0–5 slanted ink notches beside the bobber, the band's words, "gone quiet", and the active
//            favours by family in plain words on a long press / hover / tap (or always, settings.favourDetails)
//   U2       the bite tell as an ink pictogram + words beside the bobber (readable with sound off and on a phone), hook-hold
//            pips on the reel medal, the class estimate after the breach (seal + word), an Elder's old trick
//   S6       the watch-lamp line ("Nearest watch-lamp 34 m · ≈ 7 s" from Murk's 85% bell), the lamp-watch / Scorched line,
//            the guttering countdown, and an edge marker to the nearest watch-lamp
//   C4       the snag glyph (fishing:snag warn: a hand rises under the line, "ease")
//   near-miss  fish:escaped-big → a non-blocking ink card (silhouette, class and ~length, % landed, cause, rating, tip)
import { icon, sealSvg } from './ui-icons.js';
import { drawFish } from './ui-fishart.js';
import * as V from './ui-v3.js';

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
  // reel: class estimate, pips, snag, old trick
  const rcls = h('div', 'gw-reel-class');
  R.reelName.after(rcls);
  const pipSvg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  pipSvg.setAttribute('class', 'gw-pipset');
  R.reelMedalSvg.appendChild(pipSvg);
  const hookIco = h('span', 'gw-reel-hook', icon('hook'));
  R.reelMedalBox.appendChild(hookIco);
  const snag = h('div', 'gw-reel-snag', `${icon('hand')}`);
  R.gauge.appendChild(snag);
  const trickEl = h('div', 'gw-reel-trick');
  R.reel.appendChild(trickEl);
  // the near-miss card
  const nm = h('div', 'gw-nearmiss', `<svg class="gw-nm-wash" viewBox="0 0 560 190" preserveAspectRatio="none" aria-hidden="true"><path filter="url(#gw-ink-edge)" d="M26 22 C160 8 400 10 536 24 C550 80 548 130 532 170 C380 184 170 184 30 172 C14 130 14 70 26 22 Z"/></svg>
    <canvas class="gw-nm-fish" width="150" height="70"></canvas><div class="gw-nm-txt"><div class="gw-nm-k"></div><div class="gw-nm-title"></div><div class="gw-nm-est"></div>
    <div class="gw-nm-line"></div><div class="gw-nm-rate"></div><div class="gw-nm-tip"></div></div>`);
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
  const nmFish = nm.querySelector('.gw-nm-fish');
  const nmT = { k: nm.querySelector('.gw-nm-k'), title: nm.querySelector('.gw-nm-title'), est: nm.querySelector('.gw-nm-est'), line: nm.querySelector('.gw-nm-line'), rate: nm.querySelector('.gw-nm-rate'), tip: nm.querySelector('.gw-nm-tip') };

  // ------------------------------------------------------------------ state
  let live = false, vis = null, hitAt = -1e9, swarmSeen = false, nightKey = '';
  let favN = -1, favQuiet = null, favSig = '', favOpen = false, favHover = false, favPress = null, favPinned = false;
  let tellId = '', pipMax = 0, pipN = 0, clsShown = '', snagT = 0, snagLead = 1, trickT = 0, nmT0 = 0, nmQ = [];
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
  on('fishing:pip', ({ n, max }) => {
    pipN = Math.max(0, num(n)); pipMax = Math.max(pipMax, num(max));
    paintPips(true);
    restartAnim(R.reelMedalBox, 'gw-pip-hit');
  });
  on('fishing:hook', ({ pips }) => { pipN = num(pips?.n, num(pips, 0)); pipMax = num(pips?.max, pipN); clsShown = ''; rcls.className = 'gw-reel-class'; rcls.innerHTML = ''; paintPips(false); });
  on('fishing:snag', ({ state, lead }) => {
    if (state === 'warn') { snagLead = Math.max(0.3, num(lead, 1)); snagT = snagLead + 0.25; restartAnim(snag, 'gw-rise'); snag.style.setProperty('--lead', snagLead.toFixed(2) + 's'); }
    else if (state === 'hit') { snagT = 0.35; restartAnim(R.reel, 'gw-snag-hit'); }
  });
  on('fishing:oldTrick', () => { trickT = 2.4; trickEl.textContent = 'An old trick. Read it.'; restartAnim(trickEl, 'gw-on'); });
  on('fish:escaped-big', (p) => { nmQ.push({ p, at: performance.now() }); });
  on('player:scorched', () => showScorched());

  // ------------------------------------------------------------------ frame
  /** The §25.5.7 visibility for this frame (null when this is not a v3 run). Called by ui-hud before it paints vitals. */
  function frame(r, dt) {
    const d = D();
    const was = live;
    live = V.v3Run(d, r);
    toggle(el, 'v3', 'gw-v3', live);
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
    const we = d.BALANCE?.wellFed?.effects || {};
    const wtitle = fed ? `Well-fed: reeling +${Math.round(num(we.reelSpeed, 0.08) * 100)}%, a wider sweet band. Hunger never hurts.`
      : `Eat a fish to be Well-fed again (satiety ${Math.round(num(d.BALANCE?.wellFed?.at, 0.6) * 100)}%+). Hunger never hurts.`;
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
    if (!live || !f) { toggle(fav, 'fav', 'gw-on', false); toggle(tell, 'tell', 'gw-on', false); return; }
    // the bobber on screen
    bobP.ok = false;
    if (f.bobberPos) {
      const p = K.project({ x: f.bobberPos.x, y: num(f.bobberPos.y) + 0.35, z: f.bobberPos.z });
      if (p.ok && !p.behind) { bobP.x = p.x; bobP.y = p.y; bobP.ok = true; }
    }
    paintFavour(st, v);
    paintTell(st, v);
    paintReelExtras(st, v, dt);
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
      const legend = v.legendary || v.rarity === 'legendary';
      tellW.innerHTML = `<span>${esc(T.short)}</span>${n < 3 && ci && !legend ? `<em class="gw-cls-${ci.id}">${esc(ci.label)}?</em>` : ''}`;
      if (n < 3) markSeen(`ui_tell_${id}_${n + 1}`);
      restartAnim(tell, 'gw-pop');
    }
    placeNear(tell, 'tellT', bobP, -92, -62, 66);
  }

  function paintPips(lost) {
    const max = Math.max(0, Math.min(5, pipMax));
    if (!max) { pipSvg.innerHTML = ''; toggle(R.reelMedalBox, 'pips', 'gw-has-pips', false); return; }
    toggle(R.reelMedalBox, 'pips', 'gw-has-pips', true);
    // beads along the medal's lower arc (the hook icon sits inside the ring)
    const span = Math.min(120, 38 * (max - 1));
    let s = '';
    for (let i = 0; i < max; i++) {
      const a = (90 + (max > 1 ? -span / 2 + (span * i) / (max - 1) : 0)) * Math.PI / 180;
      const x = 24 + 20 * Math.cos(a), y = 24 + 20 * Math.sin(a);
      const litP = i < pipN;
      s += `<circle class="gw-pip${litP ? ' gw-lit' : ''}${lost && i === pipN ? ' gw-lost' : ''}${litP && pipN === 1 ? ' gw-last' : ''}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.8"/>`;
    }
    pipSvg.innerHTML = s;
  }

  function paintReelExtras(st, v, dt) {
    const reeling = st === 'reeling' || st === 'landing';
    // pips (view.pips is the truth; the events animate)
    const vp = v.pips && typeof v.pips === 'object' ? v.pips : null;
    if (reeling && vp && (num(vp.n) !== pipN || num(vp.max) !== pipMax)) { const lost = num(vp.n) < pipN; pipN = num(vp.n); pipMax = num(vp.max); paintPips(lost); }
    if (reeling && !vp && pipMax) { pipMax = 0; pipN = 0; paintPips(false); }
    // the class estimate after the breach (Prize+; Small and Keeper show at the landing card)
    const c = reeling && v.sizeClass && !v.legendary ? v.sizeClass : '';
    const ckey = c ? `${c}${v.ancient ? '+' : ''}` : '';
    if (ckey !== clsShown) {
      clsShown = ckey;
      if (ckey) {
        const ci = V.classInfo(D(), c, !!v.ancient);
        rcls.className = `gw-reel-class gw-on gw-cls-${c}${ci.ancient ? ' gw-ancient' : ''}`;
        rcls.innerHTML = `${ci.seal ? sealSvg(ci.seal, { ancient: ci.ancient }) : ''}<span class="gw-rc-k">by the look of it</span><b>${esc(ci.label)}</b>`;
        restartAnim(rcls, 'gw-stamp-in');
      } else { rcls.className = 'gw-reel-class'; rcls.innerHTML = ''; }
    }
    // snag (C4): a hand rises under the line for the warning, then the line flinches
    if (snagT > 0) snagT -= dt;
    toggle(snag, 'snag', 'gw-on', snagT > 0 && reeling);
    toggle(R.reel, 'snag', 'gw-snag-warn', snagT > 0.35 && reeling);
    if (snagT > 0 && reeling) setStyle(snag, 'snagL', 'left', (Math.max(0.06, Math.min(0.94, num(v.tension))) * 100).toFixed(1) + '%');
    if (trickT > 0) { trickT -= dt; if (trickT <= 0) trickEl.classList.remove('gw-on'); }
    if (!reeling && st !== 'lost') { if (clsShown) { clsShown = ''; rcls.className = 'gw-reel-class'; rcls.innerHTML = ''; } if (pipMax && st === 'idle') { pipMax = 0; pipN = 0; paintPips(false); } }
  }
  /** The reel's hint while a snag rises (ui-hud asks before writing its own hint). */
  function reelHint() {
    if (!live) return '';
    if (snagT > 0.35) return 'Something grasps the line. Ease off!';
    return '';
  }

  // ------------------------------------------------------------------ near-miss card
  function rating(zone) {
    const d = D();
    const r = run();
    const tiers = safe(() => (typeof d.upgradeTiers === 'function' ? d.upgradeTiers(r?.upgrades || {}) : null), null);
    return tiers ? V.tackleRating(d, zone, tiers) : null;
  }
  function showNearMiss(p) {
    const r = run();
    const zone = r?.zone || null;
    const est = (L, e) => L * (1 + (Math.random() * 2 - 1) * e * 0.5);   // within ±8% of the truth, as the card says "~"
    const M = V.nearMiss(D(), p, { rating: rating(zone), round: est });
    // the species on its own line, then its class and estimated length (the model's one-line title is M.title)
    nmT.k.textContent = D().TEXT_V3?.nearMissKicker || 'The one that got away';
    nmT.title.textContent = M.species?.name || M.title;
    nmT.est.innerHTML = M.species ? `${M.cls ? `<b>${esc(M.cls.label)}</b>` : ''}${M.cls && M.est ? ' · ' : ''}<span class="gw-nm-len">${esc(M.est)}</span>` : '';
    nmT.est.className = `gw-nm-est${M.cls ? ` gw-cls-${M.cls.id}` : ''}`;
    nm.setAttribute('aria-label', `${M.title}. ${M.line} ${M.rating} ${M.tip}`);
    nmT.line.textContent = M.line;
    nmT.rate.textContent = M.rating;
    nmT.tip.textContent = M.tip;
    nm.dataset.cls = M.cls?.id || '';
    try {
      drawFish(nmFish, M.species || { id: p.speciesId }, { w: 150, h: 70, pad: 0.06, silhouette: true });
      const g = nmFish.getContext('2d');
      if (g) { g.save(); g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgba(190, 186, 226, .72)'; g.fillRect(0, 0, nmFish.width, nmFish.height); g.restore(); }
      nmFish.style.width = ''; nmFish.style.height = '';   // drawFish sizes the canvas inline; the CSS sizes it per screen
    } catch (e) { K.report('nearmiss art', e); }
    nm.classList.remove('gw-out');
    restartAnim(nm, 'gw-on');
    nmT0 = 7.5;
  }
  nm.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); nmT0 = Math.min(nmT0, 0.01); });

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
    // a near-miss card waiting behind it keeps its turn
    if (nmT0 > 0) { nmT0 = 0; nm.classList.remove('gw-on'); }
  }
  sc.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); scT0 = Math.min(scT0, 0.01); });
  function scorchTick(dt) {
    if (scT0 <= 0) return;
    scT0 -= dt;
    if (scT0 <= 0) { sc.classList.remove('gw-on'); sc.classList.add('gw-out'); el.classList.remove('gw-sc-up'); }
  }
  function nearMissTick(dt) {
    const f = fishV();
    if (nmT0 > 0) {
      nmT0 -= dt;
      // a new cast or bite clears it early
      if (f && (f.state === 'charging' || f.state === 'bite')) nmT0 = Math.min(nmT0, 0.01);
      if (nmT0 <= 0) { nm.classList.remove('gw-on'); nm.classList.add('gw-out'); }
    } else if (nmQ.length && performance.now() - nmQ[0].at > 1200 && (!f || f.state === 'idle' || f.state === 'lost' || f.state === 'waiting') && !K.hasBlocking()) {
      // after the reel's own "Snapped" word has had its moment
      showNearMiss(nmQ.shift().p);
    }
    if (nmQ.length > 2) nmQ.splice(0, nmQ.length - 2);
  }

  return {
    frame, markers, fishing, reelHint,
    update(dt) {
      if (live) { if (scT0 <= 0) nearMissTick(dt); scorchTick(dt); }
      else { if (nmT0 > 0) { nmT0 = 0; nm.classList.remove('gw-on'); } if (scT0 > 0) { scT0 = 0; sc.classList.remove('gw-on'); el.classList.remove('gw-sc-up'); } }
    },
    get vis() { return vis; },
    get live() { return live; },
    /** the Scorched card is up (banners wait behind it rather than print over it) */
    get cardUp() { return scT0 > 0; },
    reset() { hitAt = -1e9; swarmSeen = false; nightKey = ''; favN = -1; favQuiet = null; favSig = ''; favPinned = false; favOpen = false; tellId = ''; pipMax = 0; pipN = 0; clsShown = ''; snagT = 0; nmQ.length = 0; nmT0 = 0; nm.classList.remove('gw-on'); scT0 = 0; sc.classList.remove('gw-on'); el.classList.remove('gw-sc-up'); },
    /** the clock's durations from survival (v3 phases: 210 / 20 / 90 / 10 on day 1) */
    durations(day) {
      if (!live) return null;
      const d = safe(() => ctx.survival?.getPhaseDurations?.(day), null);
      if (!d || !(num(d.calm) > 0)) return null;
      return [num(d.calm), num(d.dusk), num(d.gloomtide), num(d.dawn)];
    },
  };
}
