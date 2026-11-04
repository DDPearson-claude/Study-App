// ui-hud.js — the in-run HUD (DESIGN §21.2–21.3): bottom-centre lantern cluster (oil
// glass, wax satiety arc, Ember flames, flare ring), top cinder ribbon + level medallion +
// boon icons, the crescent day/phase clock, Shells / creel / bait, action buttons, the
// touch joystick, off-screen edge markers and the fishing gauges. Imported only by ui.js.
import * as THREE from 'three';
import { drawFish } from './ui-fishart.js';

const PHASES = ['calm', 'dusk', 'gloomtide', 'dawn'];
const DEG = Math.PI / 180;
const EMBER_SVG = `<svg viewBox="0 0 20 28" aria-hidden="true"><path class="o" d="M10 1.5C12 7 18 10 18 18a8 8 0 0 1-16 0c0-4 2.4-6.4 4-9 .6 2.6 1.6 4 3 4.6C8 10.5 8 6.5 10 1.5z"/><path class="i" d="M10 13c1.4 1.8 3 3 3 5.4a3 3 0 0 1-6 0c0-2.2 1.6-3.4 3-5.4z"/><path class="w" d="M10 22.5v4"/></svg><i class="gw-smoke"></i>`;

export function createHud(K) {
  const { ctx, h, icon, num, arr, safe, D, stat, run } = K;
  const el = K.layers.hud;
  el.innerHTML = `
  <div class="gw-vig gw-vig-low"></div><div class="gw-vig gw-vig-dark"></div><div class="gw-vig gw-vig-dmg"></div><div class="gw-vig gw-vig-heal"></div>
  <div class="gw-xp" aria-hidden="true"><div class="gw-xp-fill"></div><div class="gw-xp-spark"></div></div>
  <div class="gw-top">
    <div class="gw-tl">
      <div class="gw-level" title="Your flame's level">
        <svg viewBox="0 0 44 44" aria-hidden="true"><path class="d1" d="M22 2 42 22 22 42 2 22z"/><path class="d2" d="M22 7.5 36.5 22 22 36.5 7.5 22z"/></svg>
        <span class="gw-level-n">1</span>
      </div>
      <div class="gw-boons"><div class="gw-boon-row" data-row="w"></div><div class="gw-boon-row" data-row="p"></div></div>
    </div>
    <div class="gw-clock" aria-label="Day and phase">
      <svg class="gw-clock-svg" viewBox="0 0 220 76" aria-hidden="true">
        <path class="gw-clock-outer"/><path class="gw-clock-inner"/>
        <g class="gw-clock-segs"></g><g class="gw-clock-ticks"></g>
        <circle class="gw-clock-glow" r="9"/><circle class="gw-clock-bead" r="3.6"/>
      </svg>
      <div class="gw-clock-text"><div class="gw-clock-day">Day 1</div><div class="gw-clock-zone"></div></div>
      <div class="gw-clock-phase"></div>
    </div>
    <div class="gw-tr">
      <div class="gw-stats">
        <div class="gw-stat gw-st-shells" title="Shells">${icon('shell')}<span class="gw-shells-n">0</span><span class="gw-shells-pop"></span></div>
        <div class="gw-stat gw-st-creel" title="Creel">${icon('creel')}<span class="gw-creel-n">0/4</span></div>
        <button class="gw-stat gw-st-bait" type="button" title="Equipped bait — tap to change (B)"><span class="gw-bait-ico"></span><span class="gw-bait-name"></span><span class="gw-bait-count"></span></button>
        <div class="gw-streak" title="Perfect-hook streak"></div>
      </div>
      <div class="gw-hbtns">
        <button class="gw-hbtn" type="button" data-act="creel" aria-label="Creel (C)" title="Creel (C)">${icon('creel')}</button>
        <button class="gw-hbtn" type="button" data-act="journal" aria-label="Journal (J)" title="Journal (J)">${icon('journal')}</button>
        <button class="gw-hbtn" type="button" data-act="pause" aria-label="Pause (Esc)" title="Pause (Esc)">${icon('pause')}</button>
      </div>
    </div>
  </div>
  <div class="gw-cluster">
    <div class="gw-embers"></div>
    <svg class="gw-sat" viewBox="0 0 40 120" aria-hidden="true">
      <path class="gw-sat-track" d="M34 112 C8 96 6 34 30 8" pathLength="100"/>
      <path class="gw-sat-fill" d="M34 112 C8 96 6 34 30 8" pathLength="100" stroke-dasharray="100 100"/>
      <g class="gw-sat-drips"><path d="M14.6 80 q1.6 4 0 7 q-1.6 -3 0 -7z"/><path d="M12.2 58 q1.5 3.6 0 6.4 q-1.5 -2.8 0 -6.4z"/><path d="M16.3 34 q1.3 3.2 0 5.6 q-1.3 -2.4 0 -5.6z"/></g>
    </svg>
    <svg class="gw-lantern" viewBox="0 0 80 132" aria-hidden="true">
      <defs>
        <linearGradient id="gwOilG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d9601c"/><stop offset=".55" stop-color="#ffab45"/><stop offset="1" stop-color="#ffe2a0"/></linearGradient>
        <radialGradient id="gwLanGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset=".45" stop-color="#ff9a3c" stop-opacity=".16"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
        <clipPath id="gwGlassClip"><rect x="21" y="40" width="38" height="62" rx="6"/></clipPath>
      </defs>
      <circle class="gw-lan-glow" cx="40" cy="70" r="60" fill="url(#gwLanGlow)"/>
      <circle class="gw-flr-track" cx="40" cy="25" r="16"/>
      <circle class="gw-flr-fill" cx="40" cy="25" r="16" pathLength="100" transform="rotate(-90 40 25)"/>
      <path class="gw-lan-metal" d="M33.5 15.5a6.5 6.5 0 0 1 13 0"/>
      <path class="gw-lan-cap" d="M25 33h30l-5-12H30z"/><path class="gw-lan-cap2" d="M22 40h36l-3-7H25z"/>
      <g clip-path="url(#gwGlassClip)">
        <rect class="gw-glass-bg" x="21" y="40" width="38" height="62"/>
        <g class="gw-oil"><rect x="21" y="40" width="38" height="62" fill="url(#gwOilG)"/><path class="gw-oil-surf" d="M21 40.5 q4.75 -2 9.5 0 t9.5 0 t9.5 0 t9.5 0"/></g>
        <g class="gw-lan-fl"><path d="M0 -14 C3 -8 7 -5 7 0 A7 7 0 0 1 -7 0 C-7 -4 -4 -6 -2 -9 C-1.5 -6.5 -.5 -5.5 .6 -5 C-.6 -8.2 -.6 -11 0 -14z" class="gw-lan-fo"/><path d="M0 -5 C1.4 -3 2.8 -2 2.8 0 A2.8 2.8 0 0 1 -2.8 0 C-2.8 -2 -1.4 -3 0 -5z" class="gw-lan-fi"/></g>
        <path class="gw-glass-shine" d="M25 46 v44" />
      </g>
      <rect class="gw-glass-frame" x="21" y="40" width="38" height="62" rx="6"/>
      <path class="gw-glass-bars" d="M30.5 40v62M49.5 40v62"/>
      <g class="gw-cracks"><path d="M24 52l6 5-2 6 5 4"/><path d="M56 60l-5 3 1 6-4 3"/><path d="M33 98l3-6 5 1 2-5"/></g>
      <path class="gw-lan-base" d="M22 102h36l4 9H18z"/><path class="gw-lan-foot" d="M20 111h40l-4 7H24z"/>
      <path class="gw-lan-orn" d="M25 33c-6 0-8.5 3.5-6 7.5M55 33c6 0 8.5 3.5 6 7.5M18 111c-4.5 1.8-4.5 6.5 0 7.5M62 111c4.5 1.8 4.5 6.5 0 7.5M21 102c-3 -2 -3 -6 0 -8M59 102c3 -2 3 -6 0 -8"/>
      <circle class="gw-lan-rivet" cx="31" cy="37" r="1"/><circle class="gw-lan-rivet" cx="40" cy="37" r="1"/><circle class="gw-lan-rivet" cx="49" cy="37" r="1"/>
    </svg>
    <div class="gw-oil-n" title="Lantern oil">100</div>
    <div class="gw-sat-n" title="Satiety">100</div>
  </div>
  <div class="gw-actions">
    <button class="gw-pill" type="button"><span class="gw-pill-ico"></span><span class="gw-pill-label">Trade</span><kbd>E</kbd></button>
    <div class="gw-act-row">
      <button class="gw-burn" type="button" aria-label="Burn a fish (R)">${icon('brazier', { cls: 'gw-burn-ico' })}<canvas class="gw-burn-fish" width="44" height="24"></canvas><span class="gw-burn-label">Burn</span><kbd>R</kbd></button>
      <button class="gw-flare" type="button" aria-label="Flare (Space)"><span class="gw-flare-ring"></span><span class="gw-flare-core">${icon('flare')}</span><span class="gw-flare-label">Flare</span><i class="gw-flare-charges"></i><kbd>Space</kbd></button>
    </div>
  </div>
  <div class="gw-joyzone"><div class="gw-joy-hint"></div><div class="gw-joy-base"><div class="gw-joy-knob"></div></div></div>
  <div class="gw-markers"></div>
  <div class="gw-fishui">
    <div class="gw-charge">
      <svg viewBox="0 0 34 100" aria-hidden="true"><path class="t" d="M8 94 C26 70 26 30 8 6" pathLength="100"/><path class="f" d="M8 94 C26 70 26 30 8 6" pathLength="100" stroke-dasharray="0 100"/><path class="c" d="M8 94 C26 70 26 30 8 6" pathLength="100" stroke-dasharray="0 92 8 0"/></svg>
      <div class="gw-charge-depth"></div>
    </div>
    <div class="gw-bite"><svg viewBox="0 0 70 70" aria-hidden="true"><circle class="t" cx="35" cy="35" r="30"/><circle class="r" cx="35" cy="35" r="30" pathLength="100" transform="rotate(-90 35 35)"/></svg><span>!</span></div>
    <div class="gw-reel">
      <div class="gw-reel-name"></div>
      <div class="gw-reel-row">
        <div class="gw-reel-medal"><svg viewBox="0 0 48 48" aria-hidden="true"><circle class="t" cx="24" cy="24" r="20"/><circle class="f" cx="24" cy="24" r="20" pathLength="100" transform="rotate(-90 24 24)"/></svg>${icon('fish', { cls: 'gw-reel-fishico' })}</div>
        <div class="gw-reel-gauge">
          <div class="gw-reel-safe"></div><div class="gw-reel-decoy"></div><div class="gw-reel-sweet"></div>
          <div class="gw-reel-shard"></div><div class="gw-reel-shard"></div>
          <div class="gw-reel-danger"></div><div class="gw-reel-needle"></div>
          <i class="gw-reel-cap l"></i><i class="gw-reel-cap r"></i>
        </div>
        <div class="gw-reel-surge"><span class="gw-surge-glyph">▼</span><span class="gw-surge-text">Ease</span></div>
      </div>
      <div class="gw-reel-hint"></div>
      <div class="gw-reel-result"></div>
    </div>
  </div>`;

  const $ = (s) => el.querySelector(s);
  const R = {
    xpFill: $('.gw-xp-fill'), xpSpark: $('.gw-xp-spark'), level: $('.gw-level'), levelN: $('.gw-level-n'),
    boonW: $('[data-row="w"]'), boonP: $('[data-row="p"]'),
    clock: $('.gw-clock'), clockSvg: $('.gw-clock-svg'), clockOuter: $('.gw-clock-outer'), clockInner: $('.gw-clock-inner'), clockSegs: $('.gw-clock-segs'), clockTicks: $('.gw-clock-ticks'),
    bead: $('.gw-clock-bead'), beadGlow: $('.gw-clock-glow'), day: $('.gw-clock-day'), zone: $('.gw-clock-zone'), phase: $('.gw-clock-phase'),
    shells: $('.gw-shells-n'), shellsPop: $('.gw-shells-pop'), shellsBox: $('.gw-st-shells'), creelN: $('.gw-creel-n'), creelBox: $('.gw-st-creel'),
    bait: $('.gw-st-bait'), baitIco: $('.gw-bait-ico'), baitName: $('.gw-bait-name'), baitCount: $('.gw-bait-count'), streak: $('.gw-streak'),
    cluster: $('.gw-cluster'), embers: $('.gw-embers'), satFill: $('.gw-sat-fill'), satDrips: [...el.querySelectorAll('.gw-sat-drips path')],
    oil: $('.gw-oil'), lanFl: $('.gw-lan-fl'), lanGlow: $('.gw-lan-glow'), flrFill: $('.gw-flr-fill'), oilN: $('.gw-oil-n'), satN: $('.gw-sat-n'),
    burnFish: $('.gw-burn-fish'), flareCharges: $('.gw-flare-charges'),
    pill: $('.gw-pill'), pillLabel: $('.gw-pill-label'), pillIco: $('.gw-pill-ico'), burn: $('.gw-burn'), burnLabel: $('.gw-burn-label'),
    flare: $('.gw-flare'), joyzone: $('.gw-joyzone'), joyBase: $('.gw-joy-base'), joyKnob: $('.gw-joy-knob'), joyHint: $('.gw-joy-hint'),
    markers: $('.gw-markers'), fishui: $('.gw-fishui'), charge: $('.gw-charge'), chargeF: $('.gw-charge .f'), chargeDepth: $('.gw-charge-depth'),
    bite: $('.gw-bite'), biteRing: $('.gw-bite .r'), reel: $('.gw-reel'), reelName: $('.gw-reel-name'), reelMedal: $('.gw-reel-medal .f'),
    gauge: $('.gw-reel-gauge'), safeB: $('.gw-reel-safe'), sweet: $('.gw-reel-sweet'), decoy: $('.gw-reel-decoy'), shards: [...el.querySelectorAll('.gw-reel-shard')],
    danger: $('.gw-reel-danger'), needle: $('.gw-reel-needle'), surge: $('.gw-reel-surge'), surgeGlyph: $('.gw-surge-glyph'), surgeText: $('.gw-surge-text'),
    reelHint: $('.gw-reel-hint'), reelResult: $('.gw-reel-result'),
    vigDmg: $('.gw-vig-dmg'), vigLow: $('.gw-vig-low'), vigDark: $('.gw-vig-dark'), vigHeal: $('.gw-vig-heal'),
  };

  // ------------------------------------------------------------------ cached write helpers
  const last = new Map();
  function setText(node, key, v) { if (last.get(key) !== v) { last.set(key, v); node.textContent = v; } }
  function setAttr(node, key, name, v) { if (last.get(key) !== v) { last.set(key, v); node.setAttribute(name, v); } }
  function setStyle(node, key, prop, v) { if (last.get(key) !== v) { last.set(key, v); node.style[prop] = v; } }
  function setVar(node, key, name, v) { if (last.get(key) !== v) { last.set(key, v); node.style.setProperty(name, v); } }
  function toggle(node, key, cls, on) { const k = key + '|' + cls; if (last.get(k) !== on) { last.set(k, on); node.classList.toggle(cls, !!on); } }
  function restartAnim(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }
  const q = (v, s = 200) => Math.round(v * s) / s;

  // ------------------------------------------------------------------ buttons
  const tapGuard = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); try { fn(e); } catch (err) { K.report('hud', err); } e.currentTarget?.blur?.(); };
  el.querySelector('[data-act="creel"]').addEventListener('click', tapGuard(() => { K.sfx('ui_click'); K.screens.openCreel(); }));
  el.querySelector('[data-act="journal"]').addEventListener('click', tapGuard(() => { K.sfx('ui_click'); K.screens.openJournal(); }));
  el.querySelector('[data-act="pause"]').addEventListener('click', tapGuard(() => { K.sfx('ui_click'); safe(() => ctx.game?.pause?.(), null); if (!ctx.game?.pause) K.screens.openPause(); }));
  R.bait.addEventListener('click', tapGuard(() => K.baitCycle()));
  R.pill.addEventListener('click', tapGuard(() => { K.sfx('ui_click'); safe(() => ctx.player?.interact?.(), null); }));
  R.burn.addEventListener('pointerdown', tapGuard(() => K.burnFish()));
  R.flare.addEventListener('pointerdown', tapGuard(() => {
    const ok = safe(() => ctx.combat?.flare?.(), false);
    if (ok) { restartAnim(R.flare, 'gw-fired'); if (K.isTouch) safe(() => navigator.vibrate?.(20), null); }
    else { restartAnim(R.flare, 'gw-nope'); K.sfx('denied', { volume: 0.5 }); }
  }));
  for (const b of [R.burn, R.flare]) b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });

  // ------------------------------------------------------------------ joystick (touch)
  const joy = { id: null, ox: 0, oy: 0, active: false };
  const JOY_R = 60;
  function joyMove(e) {
    const dx = e.clientX - joy.ox, dy = e.clientY - joy.oy;
    const len = Math.hypot(dx, dy);
    const cl = Math.min(JOY_R, len);
    const nx = len > 0 ? dx / len : 0, ny = len > 0 ? dy / len : 0;
    R.joyKnob.style.transform = `translate(${(nx * cl).toFixed(1)}px,${(ny * cl).toFixed(1)}px)`;
    let k = cl / JOY_R;
    k = k < 0.1 ? 0 : (k - 0.1) / 0.9;
    ctx.input?.joy?.set?.(nx * k, -ny * k);
  }
  function joyEnd(e) {
    if (joy.id !== e.pointerId) return;
    joy.id = null; joy.active = false;
    ctx.input?.joy?.set?.(0, 0);
    R.joyBase.classList.remove('gw-on');
    R.joyKnob.style.transform = 'translate(0,0)';
  }
  R.joyzone.addEventListener('pointerdown', (e) => {
    if (joy.id !== null) return;
    e.preventDefault(); e.stopPropagation();
    joy.id = e.pointerId; joy.active = true; joy.ox = e.clientX; joy.oy = e.clientY;
    try { R.joyzone.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    const r = R.joyzone.getBoundingClientRect();
    R.joyBase.style.left = (e.clientX - r.left) + 'px';
    R.joyBase.style.top = (e.clientY - r.top) + 'px';
    R.joyBase.classList.add('gw-on');
    R.joyHint.classList.add('gw-gone');
    joyMove(e);
  });
  R.joyzone.addEventListener('pointermove', (e) => { if (joy.id === e.pointerId) { e.preventDefault(); joyMove(e); } });
  R.joyzone.addEventListener('pointerup', joyEnd);
  R.joyzone.addEventListener('pointercancel', joyEnd);
  R.joyzone.addEventListener('lostpointercapture', joyEnd);
  function joyReset() { if (joy.id !== null) joyEnd({ pointerId: joy.id }); ctx.input?.joy?.set?.(0, 0); }

  // ------------------------------------------------------------------ clock geometry
  const CX = 110, CY = 128, CR = 110, A0 = 150 * DEG, A1 = 30 * DEG;
  const pt = (a, r = CR) => [CX + r * Math.cos(a), CY - r * Math.sin(a)];
  const angAt = (f) => A0 - (A0 - A1) * f;
  function arcD(a0, a1, r = CR) { const p0 = pt(a0, r), p1 = pt(a1, r); return `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}A${r} ${r} 0 0 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`; }
  R.clockOuter.setAttribute('d', arcD(A0 + 2 * DEG, A1 - 2 * DEG, CR + 7));
  R.clockInner.setAttribute('d', arcD(A0 + 1 * DEG, A1 - 1 * DEG, CR - 6));
  let clockDay = -1, clockDur = [120, 14, 90, 8], clockTotal = 232;
  function buildClock(day) {
    const P = D().BALANCE?.phases || { calm: 120, dusk: 14, gloomtide: 90, dawn: 8 };
    const gl = safe(() => D().gloomtideLength?.(day), P.gloomtide);
    clockDur = [num(P.calm, 120), num(P.dusk, 14), num(gl, 90), num(P.dawn, 8)];
    clockTotal = clockDur.reduce((a, b) => a + b, 0) || 1;
    let f = 0, segs = '', ticks = '';
    for (let i = 0; i < 4; i++) {
      const f1 = f + clockDur[i] / clockTotal;
      const gap = 0.9 * DEG;
      segs += `<path class="gw-seg gw-seg-${PHASES[i]}" d="${arcD(angAt(f) - (i ? gap : 0), angAt(f1) + (i < 3 ? gap : 0))}"/>`;
      if (i > 0) { const a = angAt(f), p0 = pt(a, CR - 5), p1 = pt(a, CR + 5); ticks += `<path class="gw-tick" d="M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}"/>`; }
      if (PHASES[i] === 'gloomtide') { const a = angAt(f + (clockDur[i] * 0.93) / clockTotal), p0 = pt(a, CR - 3.5), p1 = pt(a, CR + 3.5); ticks += `<path class="gw-tick gw-tick-hush" d="M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}"/>`; }
      f = f1;
    }
    for (const a of [A0 + 2 * DEG, A1 - 2 * DEG]) { const p = pt(a, CR + 7); ticks += `<path class="gw-tick-end" d="M${p[0].toFixed(1)} ${(p[1] - 3).toFixed(1)}l3 3-3 3-3-3z"/>`; }
    R.clockSegs.innerHTML = segs;
    R.clockTicks.innerHTML = ticks;
  }
  const mmss = (s) => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  // ------------------------------------------------------------------ embers
  let emberN = -1, emberHp = -1;
  const emberEls = [];
  function buildEmbers(n) {
    emberN = n;
    R.embers.innerHTML = '';
    emberEls.length = 0;
    const step = Math.min(16, n > 1 ? 112 / (n - 1) : 0) * DEG;
    const RR = 92;
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * step;
      const e = h('div', 'gw-emb', EMBER_SVG);
      e.style.left = (110 + RR * Math.sin(a) - 10).toFixed(1) + 'px';
      e.style.top = (115 - RR * Math.cos(a) - 14).toFixed(1) + 'px';
      e.style.setProperty('--d', (Math.random() * 1.6).toFixed(2) + 's');
      R.embers.appendChild(e);
      emberEls.push(e);
    }
    emberHp = -1;
  }
  function paintEmbers(hp, prevHp) {
    for (let i = 0; i < emberEls.length; i++) {
      const e = emberEls[i];
      const lit = i < hp;
      e.classList.toggle('gw-lit', lit);
      e.classList.toggle('gw-out', !lit);
      e.classList.toggle('gw-last', lit && hp === 1);
      if (prevHp >= 0 && !lit && i < prevHp) restartAnim(e, 'gw-snuff');
      if (prevHp >= 0 && lit && i >= prevHp) restartAnim(e, 'gw-relit');
    }
  }

  // ------------------------------------------------------------------ boons
  let boonsDirty = true, boonsTimer = 0, boonSig = '';
  function boonList() {
    const out = [];
    const got = safe(() => ctx.combat?.getBoons?.(), null);
    if (Array.isArray(got) && got.length) {
      for (const g of got) {
        const b = g?.boon || K.boonData(g?.boonId || g?.id);
        if (b) out.push({ b, level: num(g.level, 1) });
      }
    } else {
      for (const [id, lvl] of Object.entries(run()?.boons || {})) { const b = K.boonData(id); if (b && num(lvl) > 0) out.push({ b, level: num(lvl, 1) }); }
    }
    return out;
  }
  function paintBoons() {
    const list = boonList();
    const sig = list.map((x) => x.b.id + x.level).join(',');
    if (sig === boonSig) return;
    boonSig = sig;
    const card = (x) => {
      const kindled = x.level >= 6 || x.level > num(x.b.maxLevel, 5);
      const max = Math.min(5, num(x.b.maxLevel, 5));
      let pips = '';
      if (max > 1) for (let i = 0; i < max; i++) pips += `<b class="${i < x.level ? 'on' : ''}"></b>`;
      const name = kindled && x.b.kindle?.name ? x.b.kindle.name : x.b.name;
      return `<div class="gw-boon r-${x.b.rarity || 'common'}${kindled ? ' gw-kindled' : ''}" title="${K.esc(name)} · Lv ${x.level}" style="--rc:${K.rarityCss(kindled ? 'legendary' : x.b.rarity)}">${icon(x.b.icon || 'star')}${pips ? `<i class="gw-pips">${pips}</i>` : ''}</div>`;
    };
    R.boonW.innerHTML = list.filter((x) => x.b.kind === 'weapon').map(card).join('');
    R.boonP.innerHTML = list.filter((x) => x.b.kind !== 'weapon').map(card).join('');
  }

  // ------------------------------------------------------------------ markers
  const MK_N = 9;
  const marks = [];
  for (let i = 0; i < MK_N; i++) {
    const m = h('div', 'gw-mark', `<i class="gw-mark-arrow"></i><span class="gw-mark-ico"></span><span class="gw-mark-d"></span>`);
    R.markers.appendChild(m);
    marks.push({ el: m, ico: m.querySelector('.gw-mark-ico'), d: m.querySelector('.gw-mark-d'), arrow: m.querySelector('.gw-mark-arrow'), kind: '', on: false });
  }
  const targets = [];
  for (let i = 0; i < MK_N; i++) targets.push({ kind: '', pos: new THREE.Vector3(), dist: 0, on: false });
  const MK_ICON = { merchant: 'lantern', gate: 'gate', gateSealed: 'gate', spot: 'spot', spotRare: 'spot', legend: 'star', elite: 'eye', boss: 'eye', stolen: 'fish' };
  let insetTop = 70, insetBottom = 26, insetSide = 24, clockHalf = 150, clockDrop = 34;
  function gatherTargets() {
    let n = 0;
    const pp = ctx.player?.position;
    if (!pp) return 0;
    const add = (kind, pos) => { if (n >= MK_N || !pos) return; const t = targets[n++]; t.kind = kind; t.pos.set(num(pos.x), num(pos.y, 0) + 0.5, num(pos.z)); t.dist = Math.hypot(t.pos.x - pp.x, t.pos.z - pp.z); };
    const m = ctx.actors?.merchant;
    if (m && m.present === true && m.position) add('merchant', m.position);
    const r = run();
    const gate = safe(() => ctx.world?.getGate?.(), null);
    if (gate?.position && safe(() => ctx.world?.getGateState?.(), null) !== 'hidden') add(r?.gateOpen ? 'gate' : 'gateSealed', gate.position);
    // nearest two spots
    let s1 = null, s2 = null, d1 = 1e9, d2 = 1e9;
    for (const s of arr(ctx.fishing?.spots)) {
      const p = s?.position; if (!p) continue;
      const d = (p.x - pp.x) ** 2 + (p.z - pp.z) ** 2;
      if (d < d1) { s2 = s1; d2 = d1; s1 = s; d1 = d; } else if (d < d2) { s2 = s; d2 = d; }
    }
    if (s1) add(s1.rare ? 'spotRare' : 'spot', s1.position);
    if (s2) add(s2.rare ? 'spotRare' : 'spot', s2.position);
    // legend pool (owning the bait, right time, not landed yet)
    const z = K.zoneData(r?.zone);
    const lp = z?.arena?.legendPool;
    if (lp && r) {
      const legId = z.legendary || D().LEGENDARY_BY_ZONE?.[z.id];
      const sp = K.speciesData(legId);
      const eq = safe(() => ctx.progression?.getEquippedBait?.(), r.equippedBait);
      const eqId = typeof eq === 'object' && eq ? eq.id : eq;
      const ph = K.phaseInfo()?.phase || r.phase;
      const timeOk = sp?.time === 'gloom' ? ph === 'gloomtide' : ph !== 'gloomtide';
      if (sp && eqId && eqId === sp.bait && timeOk && !r.legendaries?.[legId]) add('legend', { x: lp.x, y: 0, z: lp.z });
    }
    // elites / wardens / thieves
    let ec = 0;
    for (const e of arr(ctx.combat?.enemies)) {
      if (!e?.position) continue;
      if ((e.boss || e.elite) && ec < 2) { add(e.boss ? 'boss' : 'elite', e.position); ec++; }
      else if (e.fish || e.stolen || e.carrying) add('stolen', e.position);
      if (n >= MK_N) break;
    }
    return n;
  }
  function paintMarkers(n) {
    const W = K.vw, H = K.vh;
    const cx = W / 2, cy = H / 2;
    const x0 = insetSide, x1 = W - insetSide, y0 = insetTop, y1 = H - insetBottom;
    for (let i = 0; i < MK_N; i++) {
      const mk = marks[i];
      if (i >= n) { if (mk.on) { mk.on = false; mk.el.classList.remove('gw-on'); } continue; }
      const t = targets[i];
      const p = K.project(t.pos);
      if (!p.ok) { if (mk.on) { mk.on = false; mk.el.classList.remove('gw-on'); } continue; }
      const inside = !p.behind && p.x >= 6 && p.x <= W - 6 && p.y >= 6 && p.y <= H - 6;
      if (inside) { if (mk.on) { mk.on = false; mk.el.classList.remove('gw-on'); } continue; }
      let dx = p.x - cx, dy = p.y - cy;
      if (p.behind && Math.abs(dy) < 1) dy = H;
      const sx = dx !== 0 ? ((dx > 0 ? x1 : x0) - cx) / dx : Infinity;
      const sy = dy !== 0 ? ((dy > 0 ? y1 : y0) - cy) / dy : Infinity;
      const s = Math.min(Math.abs(sx), Math.abs(sy));
      let mx = cx + dx * s, my = cy + dy * s;
      if (my <= y0 + 1 && Math.abs(mx - cx) < clockHalf) my = y0 + clockDrop;
      if (my >= H - 200 && (mx > W - 140 || Math.abs(mx - cx) < 130)) my = H - 210;
      if (mk.kind !== t.kind) {
        mk.kind = t.kind;
        mk.el.className = `gw-mark gw-mk-${t.kind}${mk.on ? ' gw-on' : ''}`;
        mk.ico.innerHTML = icon(MK_ICON[t.kind] || 'star');
      }
      if (!mk.on) { mk.on = true; mk.el.classList.add('gw-on'); }
      mk.el.style.transform = `translate3d(${mx.toFixed(1)}px,${my.toFixed(1)}px,0)`;
      mk.arrow.style.transform = `rotate(${Math.atan2(dy, dx).toFixed(3)}rad)`;
      const dtxt = Math.round(t.dist) + ' m';
      if (mk.d.textContent !== dtxt) mk.d.textContent = dtxt;
    }
  }

  // ------------------------------------------------------------------ fishing ui
  const rp = new THREE.Vector3();
  let reelShowT = 0, resultT = 0, reelCount = 0;
  function onFishingState({ state, prev } = {}) {
    if (state === 'reeling' && prev !== 'reeling') reelCount++;
  }
  function showResult(text, cls) {
    R.reelResult.textContent = text;
    R.reelResult.className = `gw-reel-result gw-on ${cls}`;
    resultT = 1.3;
  }
  ctx.bus?.on?.('fishing:escaped', (p) => showResult(p?.reason === 'snap' ? 'Snapped' : p?.cut ? 'Line cut' : 'Slipped free', 'bad'));
  ctx.bus?.on?.('fishing:caught', () => showResult('Landed', 'good'));
  function paintFishing(dt) {
    const f = ctx.fishing;
    const st = f && !f.isStub ? f.state : 'idle';
    const v = (f && !f.isStub && f.view) || {};
    // charge meter beside the raft
    const charging = st === 'charging';
    toggle(R.charge, 'chg', 'gw-on', charging);
    if (charging && ctx.player?.position) {
      rp.copy(ctx.player.position); rp.y += 1.1;
      const p = K.project(rp);
      if (p.ok) setStyle(R.charge, 'chgT', 'transform', `translate3d(${(p.x + 54).toFixed(0)}px,${(p.y - 60).toFixed(0)}px,0)`);
      const c = Math.max(0, Math.min(1, num(v.charge)));
      setAttr(R.chargeF, 'chgF', 'stroke-dasharray', `${(c * 100).toFixed(1)} 100`);
      toggle(R.charge, 'chg', 'gw-clean', c >= 0.92);
      const hint = typeof v.hint === 'string' ? v.hint : '';
      const depth = hint === 'shallow' || hint === 'mid' || hint === 'deep' ? hint : '';
      setText(R.chargeDepth, 'chgD', '');
      setAttr(R.chargeDepth, 'chgDc', 'data-depth', depth);
    }
    // bite prompt at the bobber
    const biting = st === 'bite';
    toggle(R.bite, 'bite', 'gw-on', biting);
    if (biting && f.bobberPos) {
      rp.copy(f.bobberPos); rp.y += 0.5;
      const p = K.project(rp);
      if (p.ok) setStyle(R.bite, 'biteT', 'transform', `translate3d(${p.x.toFixed(0)}px,${(p.y - 40).toFixed(0)}px,0)`);
      setAttr(R.biteRing, 'biteR', 'stroke-dasharray', `${(Math.max(0, Math.min(1, num(v.biteWindow, 1))) * 100).toFixed(1)} 100`);
      setVar(R.bite, 'biteC', '--rc', v.rarity ? K.rarityCss(v.rarity) : '#ffe2a8');
    }
    // reel gauge
    const reeling = st === 'reeling' || st === 'landing';
    if (reeling) reelShowT = 0.5; else reelShowT -= dt;
    if (resultT > 0) { resultT -= dt; if (resultT <= 0) R.reelResult.classList.remove('gw-on'); }
    const showReel = reeling || reelShowT > 0 || resultT > 0;
    toggle(R.reel, 'reel', 'gw-on', showReel);
    toggle(R.reel, 'reel', 'gw-active', reeling);
    if (!reeling) return;
    const T = Math.max(0, Math.min(1.04, num(v.tension)));
    const sMin = Math.max(0, Math.min(1, num(v.sweetMin, 0.4))), sMax = Math.max(sMin, Math.min(1, num(v.sweetMax, 0.6)));
    setStyle(R.sweet, 'swL', 'left', (q(sMin, 1000) * 100).toFixed(1) + '%');
    setStyle(R.sweet, 'swW', 'width', (q(sMax - sMin, 1000) * 100).toFixed(1) + '%');
    setStyle(R.needle, 'ndl', 'left', (q(T, 1000) * 100).toFixed(1) + '%');
    const danger = typeof v.danger === 'boolean' ? (v.danger ? 1 : 0) : Math.max(0, Math.min(1, num(v.danger)));
    setStyle(R.danger, 'dng', 'opacity', q(danger, 50).toFixed(2));
    toggle(R.reel, 'reel', 'gw-danger', danger > 0.55);
    const inSweet = T >= sMin && T <= sMax, inSafe = T >= (typeof v.safeMin === 'number' ? v.safeMin : 0.15) && T <= (typeof v.safeMax === 'number' ? v.safeMax : 0.85);
    toggle(R.reel, 'reel', 'gw-sweet-in', inSweet);
    toggle(R.reel, 'reel', 'gw-safe-out', !inSafe);
    const hidden = !!v.bandsHidden;
    toggle(R.reel, 'reel', 'gw-hidden-bands', hidden);
    // decoy band / shards (optional extensions)
    const dMin = v.decoyMin, dMax = v.decoyMax;
    const hasDecoy = typeof dMin === 'number' && typeof dMax === 'number' && dMax > dMin;
    toggle(R.decoy, 'dec', 'gw-on', hasDecoy);
    if (hasDecoy) { setStyle(R.decoy, 'decL', 'left', (dMin * 100).toFixed(1) + '%'); setStyle(R.decoy, 'decW', 'width', ((dMax - dMin) * 100).toFixed(1) + '%'); }
    const sh = Array.isArray(v.shards) ? v.shards : null;
    for (let i = 0; i < 2; i++) {
      const s = sh?.[i];
      const a = Array.isArray(s) ? s[0] : s?.min, b = Array.isArray(s) ? s[1] : s?.max;
      const ok = typeof a === 'number' && typeof b === 'number' && b > a;
      toggle(R.shards[i], 'sh' + i, 'gw-on', ok);
      if (ok) { setStyle(R.shards[i], 'shL' + i, 'left', (a * 100).toFixed(1) + '%'); setStyle(R.shards[i], 'shW' + i, 'width', ((b - a) * 100).toFixed(1) + '%'); }
    }
    toggle(R.sweet, 'swh', 'gw-off', !!sh);
    // surges
    const warn = Math.max(0, Math.min(1, num(v.surgeWarn)));
    const surging = !!v.surge;
    const kind = v.surgeKind || 'pull';
    const hold = kind === 'leap';
    toggle(R.reel, 'reel', 'gw-surge-warn', warn > 0.02 && !surging);
    toggle(R.reel, 'reel', 'gw-surging', surging);
    toggle(R.surge, 'srg', 'gw-on', warn > 0.02 || surging);
    toggle(R.surge, 'srg', 'gw-hold', hold);
    setText(R.surgeGlyph, 'srgG', hold ? '▲' : '▼');
    setText(R.surgeText, 'srgT', hold ? 'Hold' : 'Ease');
    // progress ring & species
    const prog = Math.max(0, Math.min(1, num(v.progress)));
    setAttr(R.reelMedal, 'prog', 'stroke-dasharray', `${(prog * 100).toFixed(1)} 100`);
    const sp = v.speciesId ? K.speciesData(v.speciesId) : null;
    setText(R.reelName, 'rname', sp ? sp.name : '');
    setVar(R.reel, 'rcol', '--rc', K.rarityCss(v.rarity || sp?.rarity || 'common'));
    toggle(R.reel, 'reel', 'gw-legend', (v.rarity || sp?.rarity) === 'legendary');
    const phaseName = typeof v.phaseName === 'string' && v.phaseName ? v.phaseName : '';
    const hint = phaseName || (typeof v.hint === 'string' && v.hint && !['shallow', 'mid', 'deep'].includes(v.hint) ? v.hint : (num(K.meta().runs, 0) <= 2 && reelCount <= 3 ? 'Hold to reel · release to ease' : ''));
    const sfMin = typeof v.safeMin === 'number' ? v.safeMin : 0.15, sfMax = typeof v.safeMax === 'number' ? v.safeMax : 0.85;
    setStyle(R.safeB, 'sfL', 'left', (sfMin * 100).toFixed(1) + '%');
    setStyle(R.safeB, 'sfW', 'width', ((sfMax - sfMin) * 100).toFixed(1) + '%');
    setText(R.reelHint, 'rhint', hint);
  }

  // ------------------------------------------------------------------ state
  let visible = false, shellsShown = -1, shellsTarget = 0, popT = 0, statsDirty = true, statsTimer = 0;
  let prevHp = -1, xpShown = 0, levelShown = -1, phaseShown = '', lowFlags = { oil: 0, satiety: 0, hp: 0 };

  function setVisible(v) {
    visible = !!v;
    el.classList.toggle('gw-visible', visible);
    if (!visible) { joyReset(); for (const m of marks) { m.on = false; m.el.classList.remove('gw-on'); } }
  }
  function reset() {
    prevHp = -1; emberN = -1; boonsDirty = true; boonSig = ''; shellsShown = -1; statsDirty = true; levelShown = -1; reelCount = 0;
    clockDay = -1; last.clear(); R.joyHint.classList.remove('gw-gone');
    lowFlags = { oil: 0, satiety: 0, hp: 0 };
  }

  function update(dt) {
    const r = run();
    const show = visible && !!r && ctx.flow === 'playing';
    toggle(el, 'hud', 'gw-live', show);
    if (!show) return;
    const blocked = K.hasBlocking();
    toggle(el, 'hud', 'gw-blocked', blocked);
    if (blocked && joy.id !== null) joyReset();

    // ---- vitals
    const maxHp = Math.max(1, Math.round(stat('maxHp')));
    const hp = Math.max(0, Math.min(maxHp, Math.round(num(r.hp))));
    if (maxHp !== emberN) buildEmbers(maxHp);
    if (hp !== emberHp) { paintEmbers(hp, prevHp >= 0 ? prevHp : -1); emberHp = hp; prevHp = hp; }
    toggle(R.vigLow, 'vl', 'gw-on', hp <= 1);
    const maxOil = Math.max(1, stat('maxOil'));
    const oil = Math.max(0, num(r.oil));
    const of = Math.max(0, Math.min(1, oil / maxOil));
    const ofq = q(of, 160);
    const sy = Math.max(0.001, ofq), sx = 0.62 + 0.38 * ofq;
    setAttr(R.oil, 'oilT', 'transform', `translate(40 102) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-40 -102)`);
    setStyle(R.oil, 'oilO', 'opacity', (0.4 + 0.6 * ofq).toFixed(3));
    const flY = 102 - 62 * ofq;
    setAttr(R.lanFl, 'lanFl', 'transform', `translate(40 ${Math.max(54, Math.min(96, flY + 2)).toFixed(1)}) scale(${(0.35 + 0.75 * ofq).toFixed(3)})`);
    setStyle(R.lanGlow, 'lanG', 'opacity', (0.15 + 0.85 * ofq).toFixed(3));
    setText(R.oilN, 'oilN', String(Math.round(oil)));
    toggle(R.cluster, 'cl', 'gw-oil-low', of <= 0.25);
    toggle(R.cluster, 'cl', 'gw-oil-out', oil <= 0.01);
    const maxSat = Math.max(1, stat('maxSatiety'));
    const sat = Math.max(0, num(r.satiety));
    const sf = Math.max(0, Math.min(1, sat / maxSat));
    setAttr(R.satFill, 'satF', 'stroke-dasharray', `${(q(sf, 200) * 100).toFixed(1)} 100`);
    for (let i = 0; i < R.satDrips.length; i++) toggle(R.satDrips[i], 'drip' + i, 'gw-on', sf > [0.22, 0.5, 0.78][i]);
    setText(R.satN, 'satN', String(Math.round(sat)));
    toggle(R.cluster, 'cl', 'gw-sat-low', sf <= 0.2);
    for (const k in lowFlags) { if (lowFlags[k] > 0) { lowFlags[k] -= dt; if (lowFlags[k] <= 0) R.cluster.classList.remove('gw-warn-' + k); } }
    const dark = safe(() => ctx.survival?.lanternOut === true, false) || oil <= 0.01;
    toggle(R.vigDark, 'vd', 'gw-on', dark);

    // ---- flare ring + button
    const ready = Math.max(0, Math.min(1, num(safe(() => ctx.combat?.flareReady?.(), 1), 1)));
    const cost = stat('flareCost');
    const charges = Math.max(0, Math.round(num(r.flags?.flareCharges, num(r.flareCharges, 0))));
    const canAfford = oil >= cost || charges > 0;
    setText(R.flareCharges, 'flC', charges ? `×${charges}` : '');
    const rq = q(ready, 100);
    setAttr(R.flrFill, 'flrF', 'stroke-dasharray', `${(rq * 100).toFixed(0)} 100`);
    toggle(R.cluster, 'cl', 'gw-flare-ready', ready >= 1 && canAfford);
    setVar(R.flare, 'flK', '--k', rq.toFixed(2));
    toggle(R.flare, 'fl', 'gw-ready', ready >= 1 && canAfford);
    toggle(R.flare, 'fl', 'gw-poor', !canAfford);

    // ---- burn button
    const bf = K.burnable();
    toggle(R.burn, 'bn', 'gw-disabled', !bf);
    const bOil = bf ? Math.round(num(bf.oil) * stat('oilYieldMult')) : 0;
    const bKey = bf ? `${bf.uid}|${bf.speciesId}` : '';
    if (last.get('bnF') !== bKey) {
      last.set('bnF', bKey);
      R.burn.classList.toggle('gw-has-fish', !!bf);
      if (bf) { try { drawFish(R.burnFish, K.speciesData(bf.speciesId), { w: 44, h: 24, pad: 0.04 }); } catch { /* optional */ } }
    }
    setText(R.burnLabel, 'bnL', bf ? `+${bOil}` : 'Burn');
    setAttr(R.burn, 'bnT', 'title', bf ? `Burn ${K.speciesData(bf.speciesId)?.name || 'a fish'} for +${bOil} oil (R)` : 'Burn a fish (R) — the creel is empty');

    // ---- interact pill
    const it = safe(() => ctx.player?.interactable, null);
    const label = it && typeof it === 'object' ? (it.label || (it.id === 'gate' ? 'Descend' : it.id === 'merchant' ? 'Trade' : '')) : '';
    toggle(R.pill, 'pill', 'gw-on', !!label);
    if (label) { setText(R.pillLabel, 'pillL', label); if (last.get('pillI') !== it.id) { last.set('pillI', it.id); R.pillIco.innerHTML = icon(it.id === 'gate' ? 'gate' : 'lantern'); } }

    // ---- xp ribbon + level
    const lvl = Math.max(1, Math.round(num(r.level, 1)));
    const xpn = Math.max(1, num(r.xpNext, 10));
    const xk = Math.max(0, Math.min(1, num(r.xp) / xpn));
    if (lvl !== levelShown) { if (levelShown > 0 && lvl > levelShown) xpShown = 0; levelShown = lvl; setText(R.levelN, 'lvl', String(lvl)); }
    xpShown += (xk - xpShown) * Math.min(1, dt * 8);
    setStyle(R.xpFill, 'xpw', 'transform', `scaleX(${q(xpShown, 400).toFixed(4)})`);
    setStyle(R.xpSpark, 'xps', 'left', (q(xpShown, 400) * 100).toFixed(2) + '%');

    // ---- shells tick-up
    shellsTarget = Math.round(num(r.shells));
    if (shellsShown < 0) shellsShown = shellsTarget;
    if (shellsShown !== shellsTarget) {
      const d = shellsTarget - shellsShown;
      shellsShown += Math.sign(d) * Math.max(1, Math.ceil(Math.abs(d) * Math.min(1, dt * 7)));
      if ((d > 0 && shellsShown > shellsTarget) || (d < 0 && shellsShown < shellsTarget)) shellsShown = shellsTarget;
    }
    setText(R.shells, 'shells', K.fmt(shellsShown));
    if (popT > 0) { popT -= dt; if (popT <= 0) R.shellsPop.classList.remove('gw-on'); }

    // ---- slower stats (creel, bait, streak) & boons
    statsTimer -= dt;
    if (statsDirty || statsTimer <= 0) {
      statsDirty = false; statsTimer = 0.25;
      const cs = Math.max(1, Math.round(stat('creelSize')));
      const cn = arr(r.creel).length;
      setText(R.creelN, 'creel', `${cn}/${cs}`);
      toggle(R.creelBox, 'cb', 'gw-full', cn >= cs);
      const eq = safe(() => ctx.progression?.getEquippedBait?.(), r.equippedBait ?? null);
      const eqId = typeof eq === 'object' && eq ? eq.id : eq;
      const bd = eqId ? K.baitData(eqId) : null;
      if (last.get('baitId') !== (eqId || '')) { last.set('baitId', eqId || ''); R.baitIco.innerHTML = icon(bd?.icon || 'hook'); }
      setText(R.baitName, 'baitN', bd ? bd.name : 'Bare hook');
      const bc = eqId ? num(r.bait?.[eqId]) : 0;
      setText(R.baitCount, 'baitC', eqId ? `×${bc}` : '');
      toggle(R.bait, 'bt', 'gw-legend', !!bd?.legend);
      const streak = Math.max(0, Math.min(5, Math.round(num(r.flags?.streak))));
      if (last.get('streak') !== streak) { last.set('streak', streak); R.streak.innerHTML = streak ? '<b></b>'.repeat(streak) : ''; }
    }
    boonsTimer -= dt;
    if (boonsDirty || boonsTimer <= 0) { boonsDirty = false; boonsTimer = 2; paintBoons(); }

    // ---- clock
    const pi = K.phaseInfo();
    const day = Math.max(1, Math.round(num(pi?.day, num(r.day, 1))));
    if (day !== clockDay) { clockDay = day; buildClock(day); setText(R.day, 'day', `Day ${day}`); }
    const phase = pi?.phase || r.phase || 'calm';
    const idx = Math.max(0, PHASES.indexOf(phase));
    const ptime = num(pi?.time, num(r.phaseTime));
    const pdur = num(pi?.duration, clockDur[idx]) || 1;
    let before = 0;
    for (let i = 0; i < idx; i++) before += clockDur[i];
    const f = Math.max(0, Math.min(1, (before + Math.min(ptime, clockDur[idx])) / clockTotal));
    const bp = pt(angAt(f));
    const bx = bp[0].toFixed(1), by = bp[1].toFixed(1);
    setAttr(R.bead, 'bx', 'cx', bx); setAttr(R.bead, 'by', 'cy', by);
    setAttr(R.beadGlow, 'gx', 'cx', bx); setAttr(R.beadGlow, 'gy', 'cy', by);
    if (phase !== phaseShown) { phaseShown = phase; R.clock.dataset.phase = phase; el.dataset.phase = phase; }
    const remain = pdur - ptime;
    let ptxt;
    if (phase === 'calm') ptxt = `Gloomtide in ${mmss(remain + clockDur[1])}`;
    else if (phase === 'dusk') ptxt = `Gloomtide in ${mmss(remain)}`;
    else if (phase === 'gloomtide') ptxt = `Dawn in ${mmss(remain)}`;
    else ptxt = 'Grey dawn';
    setText(R.phase, 'ptxt', ptxt);

    // ---- markers & fishing
    gatherTargetsAndPaint();
    paintFishing(dt);
  }
  function gatherTargetsAndPaint() {
    const n = gatherTargets();
    paintMarkers(n);
  }

  function onResize(w, hgt) {
    const narrow = w < 700;
    insetTop = narrow ? 168 : 60;
    clockHalf = narrow ? 0 : 150;
    clockDrop = narrow ? 0 : 52;
    insetBottom = narrow ? 30 : 26;
    insetSide = narrow ? 20 : 26;
    try {
      const probe = h('div', 'gw-safe-probe');
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      insetTop += parseFloat(cs.paddingTop) || 0;
      insetBottom += parseFloat(cs.paddingBottom) || 0;
      insetSide += Math.max(parseFloat(cs.paddingLeft) || 0, parseFloat(cs.paddingRight) || 0);
      probe.remove();
    } catch { /* ignore */ }
    if (!K.isTouch) return;
    joyReset();
  }

  return {
    setVisible, reset, update, onResize, onFishingState,
    dirtyBoons() { boonsDirty = true; },
    dirtyStats() { statsDirty = true; },
    onZone(z) {
      const p = z?.palette || {};
      el.style.setProperty('--zone-glow', K.cssHex(p.glow, '#6ff5c8'));
      el.style.setProperty('--zone-accent', K.cssHex(p.accent, '#d6f59a'));
      K.root.style.setProperty('--zone-glow', K.cssHex(p.glow, '#6ff5c8'));
      setText(R.zone, 'zone', z?.name || '');
    },
    onPhase(phase) { if (phase) el.dataset.phase = phase; },
    onDamage() { restartAnim(R.vigDmg, 'gw-hit'); restartAnim(R.cluster, 'gw-shake'); if (K.isTouch) safe(() => navigator.vibrate?.(30), null); },
    onHeal() { restartAnim(R.vigHeal, 'gw-hit'); },
    onLow(res) { if (!res) return; R.cluster.classList.add('gw-warn-' + res); lowFlags[res] = 2.6; },
    onLantern() { /* state is read every frame */ },
    onShells(delta) {
      statsDirty = true;
      if (delta > 0) { R.shellsPop.textContent = `+${Math.round(delta)}`; restartAnim(R.shellsPop, 'gw-on'); popT = 1.4; restartAnim(R.shellsBox, 'gw-bump'); }
    },
    pulse(kind) {
      if (kind === 'level') restartAnim(R.level, 'gw-pulse');
      else if (kind === 'xp') restartAnim(R.xpSpark, 'gw-pulse');
      else if (kind === 'burn') restartAnim(R.burn, 'gw-fired');
      else if (kind === 'eat') restartAnim(R.cluster, 'gw-fed');
      else if (kind === 'render') restartAnim(R.cluster, 'gw-fueled');
      else if (kind === 'steal' || kind === 'keep') restartAnim(R.creelBox, 'gw-bump');
    },
  };
}
