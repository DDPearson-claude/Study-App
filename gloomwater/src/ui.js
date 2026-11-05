// ui.js — GLOOMWATER DOM UI: every screen, the HUD, toasts, banners, tips and world-space
// text, in the hand-inked melancholic style (CONTRACT §7 ui, §9; DESIGN §3, §21).
// Helpers: ui-hud.js (HUD, fishing gauges, joystick, edge markers), ui-screens.js (modals
// and full screens), ui-icons.js (SVG glyphs/ornaments), ui-fishart.js (fish drawings).
import * as THREE from 'three';
import css from './ui.css';
import { icon, ORN, ornamentCss, spriteSvg } from './ui-icons.js';
import { createHud } from './ui-hud.js';
import { createScreens } from './ui-screens.js';
import { createMeasure } from './ui-measure.js';
import { v3Run, nightWord, pickMomentOk } from './ui-v3.js';

export function create(ctx) {
  // ------------------------------------------------------------------ root & style
  let root = document.getElementById('ui');
  if (!root) { root = document.createElement('div'); root.id = 'ui'; document.body.appendChild(root); }
  root.classList.add('gw-ui');
  const style = document.createElement('style');
  style.id = 'gw-ui-style';
  style.textContent = css + ornamentCss();   // the ornament drawings as --orn-* mask images
  document.head.appendChild(style);
  // the line ornaments and the ink-wash / brush filters, once per page (UI style v2, DESIGN §21.6)
  if (!root.querySelector(':scope > .gw-sprite')) root.insertAdjacentHTML('afterbegin', spriteSvg());
  // the catch card's faces load before the first catch, so it never shows them in a fallback face
  try { for (const f of ["400 24px 'IM Fell English SC'", "400 24px 'Cedarville Cursive'", "italic 400 20px 'Alegreya'"]) document.fonts?.load?.(f).catch(() => {}); } catch { /* fonts optional */ }

  const isTouch = (() => {
    try { return !!ctx.isMobile || matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; } catch { return !!ctx.isMobile; }
  })();
  root.classList.toggle('gw-touch', isTouch);

  // ------------------------------------------------------------------ kit (shared helpers)
  const D = () => ctx.data || {};
  const report = (where, e) => { try { console.error(`[ui] ${where}`, e); ctx.errors?.push?.(`ui.${where}: ${e?.message || e}`); } catch { /* ignore */ } };
  const isStub = (v) => !!(v && (typeof v === 'object' || typeof v === 'function') && v.isStub === true);
  const safe = (fn, d) => { try { const v = fn(); return v === undefined || v === null || isStub(v) ? d : v; } catch (e) { report('call', e); return d; } };
  const num = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);
  const arr = (v) => (Array.isArray(v) ? v : []);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (tpl, vars = {}) => String(tpl ?? '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? vars[k] : m));
  const fmt = (n) => Math.round(num(n)).toLocaleString('en-US');
  const fmtKg = (kg) => { kg = num(kg); return (kg < 10 ? kg.toFixed(2) : kg < 100 ? kg.toFixed(1) : Math.round(kg).toString()) + ' kg'; };
  const cssHex = (n, d = '#e9e2cf') => (typeof n === 'number' && isFinite(n) ? '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6) : typeof n === 'string' && n ? n : d);
  const pick = (list) => { const a = arr(list); return a.length ? a[Math.floor(Math.random() * a.length)] : ''; };
  function h(tag, cls = '', html = '') {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }
  const sfx = (name, opts) => { try { ctx.audio?.play?.(name, opts); } catch { /* audio optional */ } };

  // stats, cached per frame
  let statCache = null, statFrame = -1;
  function stats() {
    const f = ctx.time?.frame ?? 0;
    if (statCache && statFrame === f) return statCache;
    statFrame = f;
    const s = ctx.state?.run ? safe(() => ctx.progression?.getStats?.(), null) : null;
    statCache = s && typeof s === 'object' ? s : {};
    return statCache;
  }
  const stat = (key) => num(stats()[key], num(D().STATS?.[key]?.base, 0));
  const run = () => ctx.state?.run || null;
  const meta = () => ctx.state?.meta || {};
  const settings = () => { const m = meta(); if (!m.settings) m.settings = {}; return m.settings; };
  const zoneData = (id) => D().ZONE_BY_ID?.[id] || arr(D().ZONES).find((z) => z.id === id) || null;
  const zoneIndex = () => num(zoneData(run()?.zone)?.index, 0);
  const speciesData = (id) => D().SPECIES_BY_ID?.[id] || arr(D().SPECIES).find((s) => s.id === id) || null;
  const boonData = (id) => D().BOON_BY_ID?.[id] || arr(D().BOONS).find((b) => b.id === id) || null;
  const baitData = (id) => D().BAIT_BY_ID?.[id] || arr(D().BAITS).find((b) => b.id === id) || null;
  // the UI reads common catches in pale stone (the reference palette) rather than the world's warm bone
  const rarityCss = (r) => (r === 'common' || !r ? '#d6d6e4' : cssHex(D().RARITY_COLORS?.[r], '#d6d6e4'));
  const phaseInfo = () => safe(() => ctx.survival?.getPhaseInfo?.(), null);

  /** "+3 m Cast Range" style effect lines from a {statKey: delta} map. */
  function fmtEffect(key, v) {
    const def = D().STATS?.[key];
    const EXTRA = { weightBias: ['Heavier Fish', 'pct'], gloomDraw: ['Gloom Drawn', 'pct'], shimmer: ['Shimmer', 'pct'], flareCharges: ['Free Flares', 'int'] };
    const label = def?.label || EXTRA[key]?.[0] || key;
    const sign = v < 0 ? '−' : '+';
    const a = Math.abs(v);
    let val;
    if (key === 'oilDrain' || key === 'satietyDrain') val = Math.round((a / Math.max(0.0001, def?.base || 1)) * 100) + '%';
    else if (def?.fmt === 'pct' || def?.fmt === 'x' || (!def && EXTRA[key]?.[1] === 'pct')) val = (Math.round(a * 1000) / 10) + '%';
    else if (def?.fmt === 'm') val = (Math.round(a * 10) / 10) + ' m';
    else if (def?.fmt === 's') val = (Math.round(a * 10) / 10) + ' s';
    else if (def?.fmt === 'int') val = String(Math.round(a));
    else val = String(Math.round(a * 100) / 100);
    return `${sign}${val} ${label}`;
  }
  const effectLines = (effects) => Object.entries(effects || {}).filter(([k, v]) => typeof v === 'number' && v !== 0 && k !== 'attract').map(([k, v]) => fmtEffect(k, v));

  function unlockLabel(key) {
    if (!key) return '';
    const [kind, id] = String(key).split(':');
    const d = D();
    if (kind === 'character') return `Wick: ${d.CHARACTER_BY_ID?.[id]?.name || id}`;
    if (kind === 'boon') return `Boon: ${boonData(id)?.name || id}`;
    if (kind === 'relic') return `Relic: ${d.RELIC_BY_ID?.[id]?.name || id}`;
    if (kind === 'bait') return `Bait: ${baitData(id)?.name || id}`;
    return String(key);
  }

  // ------------------------------------------------------------------ layers
  const layers = {
    world: h('div', 'gw-world'),
    hud: h('div', 'gw-hud'),
    fx: h('div', 'gw-fx'),
    banner: h('div', 'gw-banner-layer'),
    modals: h('div', 'gw-modal-layer'),
    toasts: h('div', 'gw-toasts'),
  };
  for (const k of ['world', 'hud', 'fx', 'banner', 'modals', 'toasts']) root.appendChild(layers[k]);
  layers.toasts.setAttribute('aria-live', 'polite');

  // ------------------------------------------------------------------ modal stack
  const stack = [];
  const top = () => stack[stack.length - 1] || null;
  const has = (id) => stack.some((m) => m.id === id);
  const hasBlocking = () => stack.some((m) => m.blocking);
  function openModal(id, render, opts = {}) {
    closeModal(id, { silent: true, instant: true });
    // a previous copy still fading out (260 ms) must not linger beside the new one (e.g. back-to-back level-ups)
    for (const old of layers.modals.querySelectorAll(`[data-modal="${id}"]`)) old.remove();
    const wrap = h('div', `gw-modal gw-m-${id} ${opts.screen ? 'gw-screen' : ''} ${opts.cls || ''}`);
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.dataset.modal = id;
    const entry = { id, el: wrap, blocking: opts.blocking !== false, quiet: !!opts.quiet, onKey: opts.onKey || null, onClose: opts.onClose || null,
      onEscape: opts.onEscape || null, state: opts.state || {}, render: null, t: 0 };
    if (!opts.screen) {
      const scrim = h('div', 'gw-scrim');
      if (opts.dismissable !== false) scrim.addEventListener('click', () => userEscape(entry));
      wrap.appendChild(scrim);
    }
    const body = h('div', 'gw-modal-body');
    wrap.appendChild(body);
    entry.body = body;
    entry.render = () => {
      statFrame = -1;
      const scrolls = [...body.querySelectorAll('.gw-scroll')].map((s) => s.scrollTop);
      body.innerHTML = '';
      try { render(entry, body); } catch (e) { report(`render(${id})`, e); body.appendChild(h('div', 'gw-panel gw-error', `<p>The ink ran. (${esc(e?.message || e)})</p>`)); }
      const after = body.querySelectorAll('.gw-scroll');
      scrolls.forEach((v, i) => { if (after[i]) after[i].scrollTop = v; });
    };
    entry.render();
    layers.modals.appendChild(wrap);
    stack.push(entry);
    markCovered();
    void wrap.offsetWidth;
    wrap.classList.add('gw-in');
    if (opts.focus !== false) setTimeout(() => focusFirst(wrap), 30);
    // a quiet layer (the measuring overlay) is not a modal to the rest of the game: no ui:modal (no click, and fishing keeps
    // the caught fish held up for the card that follows)
    if (!opts.quiet) { try { ctx.bus.emit('ui:modal', { open: true, id }); } catch { /* ignore */ } }
    return entry;
  }
  function closeModal(id, { silent = false, instant = false } = {}) {
    const i = stack.findIndex((m) => m.id === id);
    if (i < 0) return false;
    const [entry] = stack.splice(i, 1);
    markCovered();
    try { entry.onClose?.(entry); } catch (e) { report('onClose', e); }
    const el = entry.el;
    el.classList.remove('gw-in');
    el.classList.add('gw-out');
    if (instant) el.remove(); else setTimeout(() => el.remove(), 260);
    if (!silent && !entry.quiet) { try { ctx.bus.emit('ui:modal', { open: false, id }); } catch { /* ignore */ } }
    const t = top();
    if (t && !instant) setTimeout(() => focusFirst(t.el), 40);
    return true;
  }
  /** A full screen (title, death, victory) under another modal fades its own text so it cannot bleed through. */
  function markCovered() {
    for (let i = 0; i < stack.length; i++) stack[i].el.classList.toggle('gw-covered', i < stack.length - 1 && stack[i].el.classList.contains('gw-screen'));
  }
  function closeAll(filter = null) {
    for (const m of [...stack].reverse()) if (!filter || filter(m)) closeModal(m.id);
  }
  function focusFirst(el) {
    if (!el || isTouch) return;
    const f = el.querySelector('[data-autofocus]:not([disabled])') || el.querySelector('.gw-btn:not([disabled]), button:not([disabled])');
    try { f?.focus({ preventScroll: true }); } catch { /* ignore */ }
  }
  function userEscape(entry) {
    if (!entry) return;
    if (entry.onEscape) { entry.onEscape(entry); return; }
    closeModal(entry.id);
  }

  // ------------------------------------------------------------------ toasts
  let measure = null;   // the measuring overlay (created with the screens below)
  const toasts = [];
  const recentToast = new Map();
  const recentTexts = [];
  /** Deferred toast that is skipped when another module already toasted about the same thing. */
  function softToast(text, kind, opts = {}, phrase = '') {
    const key = String(phrase || text).toLowerCase();
    setTimeout(() => {
      const now = performance.now();
      if (recentTexts.some((r) => now - r.t < 2500 && r.text.includes(key))) return;
      toast(text, kind, opts);
    }, 160);
  }
  const heldToasts = [];
  /** A banner owns the upper screen for a few seconds: non-warning toasts wait for it (≤ 5 s). */
  const bannerBusy = () => !!(bannerEl && !bannerEl.classList.contains('gw-out')) || bannerQ.length > 0;
  function flushHeldToasts(force = false) {
    if (!heldToasts.length) return;
    const now = performance.now();
    while (heldToasts.length) {
      const q = heldToasts[0];
      const ready = force || (q.modal ? !hasBlocking() && !measure?.active() : (!bannerBusy() || now - q.at > 5000));
      if (!ready) break;
      heldToasts.shift();
      if (q.modal && now - q.at > 30000) continue;   // stale news from behind a long modal
      if (!force && hasBlocking() && !q.modal) { q.modal = true; heldToasts.push(q); continue; }
      toast(q.text, q.kind, { ...q.opts, now: true });
    }
  }
  const HOLD_BEHIND_MODAL = new Set(['info', 'lore', 'tip']);
  function toast(text, kind = 'info', opts = {}) {
    if (!text) return;
    if (ctx.flow === 'dead' && kind !== 'good') return;   // the death summary says it all
    if (!opts.now && ctx.flow === 'playing') {
      // flavour waits behind blocking modals (shop, catch card, level-up) and banners; warnings never wait
      const modal = (hasBlocking() && HOLD_BEHIND_MODAL.has(kind)) || (kind !== 'bad' && !!measure?.active());
      if (modal || (kind !== 'bad' && !hasBlocking() && bannerBusy())) {
        if (!heldToasts.some((q) => q.text === text) && heldToasts.length < 6) heldToasts.push({ text, kind, opts, at: performance.now(), modal });
        return;
      }
    }
    const now = performance.now();
    const key = kind + '|' + text;
    if (recentToast.has(key) && now - recentToast.get(key) < 2200) return;
    recentToast.set(key, now);
    recentTexts.push({ t: now, text: String(text).toLowerCase() + ' ' + String(opts.title || '').toLowerCase() });
    if (recentTexts.length > 12) recentTexts.shift();
    if (recentToast.size > 40) for (const [k, t] of recentToast) if (now - t > 5000) recentToast.delete(k);
    while (toasts.length >= 3) dropToast(toasts[0], true);
    const glyph = opts.icon || (kind === 'tip' ? 'quill' : kind === 'good' ? 'star' : kind === 'bad' ? 'eye' : kind === 'lore' ? null : null);
    const el = h('div', `gw-toast gw-toast--${kind}`, `${glyph ? icon(glyph, { cls: 'gw-toast-ico' }) : ''}<span>${esc(text)}</span>`);
    if (opts.title) el.insertAdjacentHTML('afterbegin', `<b class="gw-toast-title">${esc(opts.title)}</b>`);
    layers.toasts.appendChild(el);
    const entry = { el, dead: false, held: false };
    toasts.push(entry);
    requestAnimationFrame(() => el.classList.add('gw-in'));
    const dur = opts.dur || (kind === 'lore' ? 5600 : kind === 'tip' ? 6500 : kind === 'bad' ? 3800 : 3400);
    entry.deadline = now + dur;
    entry.timer = setTimeout(() => dropToast(entry), dur);
  }
  /** Toasts already on screen when a banner rises or a modal opens step aside (hidden, timers paused). */
  function yieldToasts(on) {
    const now = performance.now();
    for (const t of toasts) {
      if (on && !t.held) { t.held = true; t.left = Math.max(1200, t.deadline - now); clearTimeout(t.timer); t.el.classList.add('gw-held'); }
      else if (!on && t.held) { t.held = false; t.deadline = now + t.left; t.timer = setTimeout(() => dropToast(t), t.left); t.el.classList.remove('gw-held'); }
    }
  }
  let toastsYield = '';
  function dropToast(entry, fast = false) {
    if (!entry || entry.dead) return;
    entry.dead = true;
    clearTimeout(entry.timer);
    const i = toasts.indexOf(entry);
    if (i >= 0) toasts.splice(i, 1);
    entry.el.classList.remove('gw-in');
    entry.el.classList.add('gw-out');
    setTimeout(() => entry.el.remove(), fast ? 160 : 420);
  }

  // ------------------------------------------------------------------ banners
  const bannerQ = [];
  let bannerEl = null, bannerT = 0, bannerDur = 0, lastBannerTitle = '', lastBannerAt = -99;
  let bannerKinds = null;
  function inferKind(title) {
    if (!bannerKinds) {
      bannerKinds = new Map();
      for (const e of arr(D().ENEMIES)) if (e?.boss && e.name) bannerKinds.set(e.name, 'boss');
      for (const b of arr(D().BOONS)) if (b?.kindle?.name) bannerKinds.set(b.kindle.name, 'kindle');
      for (const sp of arr(D().SPECIES)) if (sp?.rarity === 'legendary' && sp.name) bannerKinds.set(sp.name, 'legend');
      for (const f of arr(D().FORMATIONS)) if (f?.name) bannerKinds.set(f.name, 'formation');
      for (const z of arr(D().ZONES)) if (z?.name) bannerKinds.set(z.name, 'area');
    }
    return bannerKinds.get(title) || null;
  }
  const PHASE_KINDS = new Set(['phase', 'gloom', 'dawn']);
  function banner(title, subtitle = '', opts = {}) {
    if (!title) return;
    title = String(title);
    const now = performance.now() / 1000;
    const kind = opts.kind || inferKind(title) || 'phase';
    const dedupe = kind === 'boss' || inferKind(title) === 'boss' ? 8 : 3;   // a Warden is bannered before it rises and again on boss:spawn
    if (title === lastBannerTitle && now - lastBannerAt < dedupe) {
      // the same banner from two sources (bus + direct call): keep one, prefer the specific style
      const q = bannerQ.find((b) => b.title === title);
      if (q && kind !== 'phase') q.kind = kind;
      if (!q && bannerEl && bannerEl.dataset.title === title && kind !== 'phase') bannerEl.className = bannerEl.className.replace(/gw-banner--\w+/, `gw-banner--${kind}`);
      return;
    }
    lastBannerTitle = title; lastBannerAt = now;
    // a newer phase banner makes any still-waiting one stale (dusk → gloomtide in quick succession)
    if (PHASE_KINDS.has(kind)) for (let i = bannerQ.length - 1; i >= 0; i--) if (PHASE_KINDS.has(bannerQ[i].kind)) bannerQ.splice(i, 1);
    if (bannerQ.length >= 3) { const i = bannerQ.findIndex((b) => b.kind !== 'area'); bannerQ.splice(i >= 0 ? i : 0, 1); }
    bannerQ.push({ title, subtitle, kind, dur: opts.dur || (kind === 'area' ? 3.6 : kind === 'formation' ? 1.8 : 2.9) });
  }
  function showNextBanner() {
    const b = bannerQ.shift();
    if (!b) return;
    bannerEl?.remove();
    bannerEl = h('div', `gw-banner gw-banner--${b.kind}`, `
      <div class="gw-banner-orn">${ORN.crest}</div>
      <div class="gw-banner-title">${esc(b.title)}</div>
      ${b.subtitle ? `<div class="gw-banner-sub">${esc(b.subtitle)}</div>` : ''}
      <div class="gw-banner-orn gw-banner-orn--b">${ORN.flourish}</div>`);
    bannerEl.dataset.title = b.title;
    layers.banner.appendChild(bannerEl);
    void bannerEl.offsetWidth;
    bannerEl.classList.add('gw-in');
    bannerT = 0; bannerDur = b.dur;
  }
  function clearBanners() {
    bannerQ.length = 0;
    if (bannerEl) { bannerEl.remove(); bannerEl = null; }
  }
  function updateBanner(dt) {
    // banners wait behind blocking modals (level-up, catch card, shop, death) instead of bleeding through
    const blocked = hasBlocking() || !!hud?.cardUp?.();   // v3: also behind the Scorched card
    layers.banner.classList.toggle('gw-hidden', blocked);
    // toasts already up step aside while a banner owns the top of the screen or a blocking modal
    // (catch card, level-up, shop) opens over them; they come back with their time left
    const showing = !blocked && !!bannerEl && !bannerEl.classList.contains('gw-out');
    const reason = showing ? 'banner' : blocked && ctx.flow === 'playing' ? 'modal' : '';
    if (reason !== toastsYield) {
      // re-evaluate on every change of reason, so a toast raised under a modal still steps aside
      // for the banner that follows it
      if (toastsYield) yieldToasts(false);
      if (reason) yieldToasts(true);
      toastsYield = reason;
    }
    if (blocked) return;
    if (bannerEl) {
      bannerT += dt;
      if (bannerT > bannerDur && !bannerEl.classList.contains('gw-out')) { bannerEl.classList.remove('gw-in'); bannerEl.classList.add('gw-out'); }
      if (bannerT > bannerDur + 0.9) { bannerEl.remove(); bannerEl = null; }
    }
    if (!bannerEl && bannerQ.length) showNextBanner();
  }

  // ------------------------------------------------------------------ tips
  const tipQ = [];
  let lastTipAt = -99;
  const tipsByTrigger = new Map();
  for (const t of arr(D().TIPS)) {
    if (!t?.trigger) continue;
    if (!tipsByTrigger.has(t.trigger)) tipsByTrigger.set(t.trigger, []);
    tipsByTrigger.get(t.trigger).push(t);
  }
  const tipEvents = [...new Set([...tipsByTrigger.keys()].map((k) => k.split(':').slice(0, 2).join(':')))];
  function onTipEvent(evt, p = {}) {
    if (ctx.flow !== 'playing') return;
    const disc = p?.phase ?? p?.resource ?? p?.reason ?? p?.state ?? p?.id ?? (p?.enemy?.elite ? 'elite' : undefined);
    const keys = disc !== undefined && disc !== null ? [evt, `${evt}:${disc}`] : [evt];
    const seen = meta().seenTips || {};
    for (const k of keys) {
      for (const t of tipsByTrigger.get(k) || []) {
        if (seen[t.id] || tipQ.some((q) => q.tip.id === t.id)) continue;
        tipQ.push({ tip: t, at: performance.now() / 1000 });
      }
    }
  }
  function updateTips() {
    if (!tipQ.length || ctx.flow !== 'playing' || hasBlocking() || has('pause') || bannerBusy()) return;
    const now = performance.now() / 1000;
    if (now - lastTipAt < 6) return;
    while (tipQ.length && now - tipQ[0].at > 40) tipQ.shift();
    const q = tipQ.shift();
    if (!q) return;
    const m = meta();
    if (!m.seenTips) m.seenTips = {};
    if (m.seenTips[q.tip.id]) return;
    m.seenTips[q.tip.id] = true;
    lastTipAt = now;
    toast(q.tip.text, 'tip');
  }
  const tipSeen = (id) => !!meta().seenTips?.[id];

  // ------------------------------------------------------------------ world-space text (pooled)
  const _v = new THREE.Vector3();
  const _p = { x: 0, y: 0, behind: false, ok: false };
  let vw = innerWidth, vh = innerHeight;
  /** Project a world position to CSS pixels. Returns a shared object (copy what you need). */
  function project(pos, out = _p) {
    out.ok = false;
    if (!pos || typeof pos.x !== 'number') return out;
    const cam = ctx.render?.camera;
    if (cam && cam.isCamera === true && cam.matrixWorldInverse?.isMatrix4) {
      _v.set(pos.x, pos.y || 0, pos.z).applyMatrix4(cam.matrixWorldInverse);
      out.behind = _v.z > -0.01;
      _v.applyMatrix4(cam.projectionMatrix);
      let x = _v.x, y = _v.y;
      if (out.behind) { x = -x; y = -y; }
      out.x = (x * 0.5 + 0.5) * vw; out.y = (-y * 0.5 + 0.5) * vh; out.ok = isFinite(out.x) && isFinite(out.y);
      return out;
    }
    const r = safe(() => ctx.render?.projectToScreen?.(pos), null);
    if (r && isFinite(r.x)) { out.x = r.x; out.y = r.y; out.behind = r.visible === false; out.ok = true; }
    return out;
  }
  const FLOAT_N = 14, DMG_N = 40;
  const floats = [], dmgs = [];
  for (let i = 0; i < FLOAT_N; i++) { const el = h('div', 'gw-float'); layers.world.appendChild(el); floats.push({ el, pos: new THREE.Vector3(), t: 0, life: 0, on: false, rise: 0 }); }
  for (let i = 0; i < DMG_N; i++) { const el = h('div', 'gw-dmg'); layers.world.appendChild(el); dmgs.push({ el, pos: new THREE.Vector3(), t: 0, life: 0, on: false, rise: 0, dx: 0 }); }
  function claim(pool) {
    let best = null;
    for (const p of pool) { if (!p.on) return p; if (!best || p.t / p.life > best.t / best.life) best = p; }
    return best;
  }
  function floatText(worldPos, text, cssCls = '') {
    if (!worldPos || text === undefined || text === null) return;
    const f = claim(floats);
    f.pos.set(num(worldPos.x), Math.max(num(worldPos.y, 0), 0) + 0.4, num(worldPos.z));
    f.t = 0; f.life = 1.5; f.on = true; f.rise = 46;
    f.el.className = `gw-float ${cssCls || ''}`;
    f.el.textContent = String(text);
    f.el.style.opacity = '0';
  }
  let externalDmg = false, dmgBudget = 0;
  function spawnDmg(worldPos, amount, crit) {
    if (settings().damageNumbers === false) return;
    if (dmgBudget > 28) return;
    dmgBudget++;
    const d = claim(dmgs);
    d.pos.set(num(worldPos?.x), num(worldPos?.y, 0) + 0.9, num(worldPos?.z));
    d.t = 0; d.life = crit ? 0.95 : 0.75; d.on = true; d.rise = crit ? 40 : 30; d.dx = (Math.random() - 0.5) * 26;
    d.el.className = crit ? 'gw-dmg gw-dmg--crit' : 'gw-dmg';
    const a = num(amount);
    d.el.textContent = a >= 10 ? String(Math.round(a)) : (Math.round(a * 10) / 10).toString();
    d.el.style.opacity = '0';
  }
  function damageNumber(worldPos, amount, crit = false) { externalDmg = true; spawnDmg(worldPos, amount, crit); }
  const pendHits = new Map();
  function onEnemyHit(p) {
    if (externalDmg || !p || settings().damageNumbers === false) return;
    const pos = p.position || p.enemy?.position;
    if (!pos) return;
    if (p.crit) { spawnDmg(pos, p.amount, true); return; }
    const key = p.enemy?.id ?? p.enemy ?? 'x';
    let e = pendHits.get(key);
    if (!e) { if (pendHits.size > 60) return; e = { amt: 0, pos: new THREE.Vector3(), last: 0, t: 0 }; pendHits.set(key, e); }
    e.amt += num(p.amount); e.pos.set(num(pos.x), num(pos.y), num(pos.z)); e.t = 0;
  }
  function updateWorldText(dt) {
    dmgBudget = Math.max(0, dmgBudget - dt * 56);
    for (const [k, e] of pendHits) {
      e.last += dt; e.t += dt;
      if (e.amt > 0 && e.last >= 0.3) { spawnDmg(e.pos, e.amt, false); e.amt = 0; e.last = 0; }
      if (e.t > 2) pendHits.delete(k);
    }
    for (const pool of [floats, dmgs]) {
      for (const f of pool) {
        if (!f.on) continue;
        f.t += dt;
        const k = f.t / f.life;
        if (k >= 1) { f.on = false; f.el.style.opacity = '0'; continue; }
        const p = project(f.pos);
        if (!p.ok || p.behind) { f.el.style.opacity = '0'; continue; }
        const ease = 1 - Math.pow(1 - k, 2.2);
        const x = p.x + (f.dx || 0) * ease, y = p.y - f.rise * ease;
        const op = k < 0.12 ? k / 0.12 : k > 0.7 ? (1 - k) / 0.3 : 1;
        const sc = f.dx !== undefined && k < 0.18 ? 1.25 - k : 1;
        f.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${sc.toFixed(2)})`;
        f.el.style.opacity = op.toFixed(2);
      }
    }
  }

  // ------------------------------------------------------------------ tweens (count-ups)
  const tweens = [];
  function tween(el, from, to, dur = 1.2, delay = 0, format = fmt) {
    if (!el) return;
    el.textContent = format(from);
    tweens.push({ el, from, to, dur, t: -delay, format });
  }
  function updateTweens(dt) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t += dt;
      if (tw.t < 0) continue;
      const k = Math.min(1, tw.t / tw.dur);
      const e = 1 - Math.pow(1 - k, 3);
      tw.el.textContent = tw.format(tw.from + (tw.to - tw.from) * e);
      if (k >= 1 || !tw.el.isConnected) tweens.splice(i, 1);
    }
  }

  // ------------------------------------------------------------------ fish helpers shared by HUD & screens
  function burnable() {
    const r = run();
    if (typeof ctx.progression?.getBurnCandidate === 'function') {
      const c = safe(() => ctx.progression.getBurnCandidate(), null);
      return c && c.speciesId ? c : null;
    }
    let best = null;
    for (const f of arr(r?.creel)) {
      const sp = speciesData(f?.speciesId);
      if (!f || sp?.rarity === 'legendary') continue;
      if (!best || num(f.value) < num(best.value)) best = f;
    }
    return best;
  }
  let burnLock = 0;
  function burnFish() {
    const r = run();
    if (!r || ctx.flow !== 'playing' || ctx.paused || hasBlocking()) return false;
    if (performance.now() < burnLock) return false;
    const f = burnable();
    if (!f) { toast(r.creel?.length ? 'Only a legend is left in the creel.' : 'The creel is empty. Nothing to burn.', 'bad'); sfx('denied'); return false; }
    const res = safe(() => ctx.progression?.fishAction?.(f.uid, 'render'), null);
    if (res && res.ok === false) { toast(res.msg || 'It will not burn.', 'bad'); sfx('denied'); return false; }
    burnLock = performance.now() + num(D().BALANCE?.economy?.burnFishTime, 0.8) * 1000;   // actors tosses it into the brazier on fish:action render
    hud?.pulse?.('burn');
    return true;
  }
  function baitCycle() {
    const r = run();
    if (!r) return;
    let next;
    if (typeof ctx.progression?.cycleBait === 'function') {
      next = safe(() => ctx.progression.cycleBait(), null);
    } else {
      const owned = arr(D().BAITS).filter((b) => num(r.bait?.[b.id]) > 0).map((b) => b.id);
      const list = [null, ...owned];
      const cur = safe(() => ctx.progression?.getEquippedBait?.(), r.equippedBait ?? null);
      const curId = typeof cur === 'object' && cur ? cur.id : cur;
      const i = list.indexOf(curId ?? null);
      next = list[(i + 1) % list.length];
      const res = safe(() => ctx.progression?.equipBait?.(next), null);
      if (res && res.ok === false && res.msg) { toast(res.msg, 'bad'); sfx('denied'); return; }
    }
    if (next && typeof next === 'object') next = next.id;
    hud?.dirtyStats?.();
    sfx('ui_click');
    toast(next ? `Bait: ${baitData(next)?.name || next}` : 'Bare hook', 'info', { icon: next ? (baitData(next)?.icon || 'worm') : 'hook', dur: 1600 });
  }

  // ------------------------------------------------------------------ assemble
  const K = {
    ctx, root, layers, D, h, esc, fill, fmt, fmtKg, cssHex, pick, num, arr, safe, isStub, report, sfx,
    stats, stat, run, meta, settings, zoneData, zoneIndex, speciesData, boonData, baitData, rarityCss, phaseInfo,
    fmtEffect, effectLines, unlockLabel, icon, ORN, isTouch,
    openModal, closeModal, closeAll, top, has, hasBlocking, userEscape, entry: (id) => stack.find((m) => m.id === id) || null,
    toast, banner, tween, floatText, project, burnable, burnFish, baitCycle, tipSeen,
    get vw() { return vw; }, get vh() { return vh; },
  };
  const screens = createScreens(K);
  K.screens = screens;
  // v3: the measuring overlay (U3); the catch card waits for it
  measure = createMeasure(K);
  K.measure = measure;
  const hud = createHud(K);
  K.hud = hud;

  // ------------------------------------------------------------------ per-run trackers
  let zonesSeen = new Set();
  const dmgSources = new Map();
  const catchQ = [];
  const levelQ = [];
  let resolvedSig = '', resolvedRef = null;
  K.dmgSources = dmgSources;
  K.markResolved = (sig, ref) => { resolvedSig = sig; resolvedRef = ref || null; };
  K.optionsSig = (opts) => arr(opts).map((o) => `${o?.boonId}:${o?.level}`).join('|') + '@' + num(run()?.level, 0);

  // v3 (U14): banked level-ups wait for the measuring card or the dawn bell, and open only at a still moment
  let dawnBell = false, stillT = 0;
  const bankedLevels = () => Math.max(0, Math.round(num(safe(() => ctx.combat?.bankedLevels, run()?.levelBank), num(run()?.levelBank))));
  function pickMoment() {
    const f = ctx.fishing && !ctx.fishing.isStub ? ctx.fishing : null;
    const i = ctx.input || {};
    const mv = Math.hypot(num(i.move?.x) + num(i.joy?.x), num(i.move?.y) + num(i.joy?.y));
    return pickMomentOk({ fishingState: f?.state || 'idle', speed: num(ctx.player?.speed), moveInput: mv, cinematic: !!ctx.cinematic, blocking: hasBlocking(), measuring: !!measure?.holding() });
  }
  function updateDawnBell(dt) {
    if (!v3Run(D(), run())) { dawnBell = false; return; }
    const ok = pickMoment();
    stillT = ok ? stillT + dt : 0;
    if (!dawnBell) return;
    if (bankedLevels() <= 0 || typeof ctx.combat?.offerBanked !== 'function') { dawnBell = false; return; }
    if (stillT < 0.5 || pendingOptions()) return;
    const opts = safe(() => ctx.combat.offerBanked(), null);
    dawnBell = false;
    if (Array.isArray(opts) && opts.length) screens.openLevelUp(opts, { banked: 'dawn' });
  }

  function pendingOptions() {
    const p = safe(() => ctx.combat?.pendingOptions, null);
    return Array.isArray(p) && p.length ? p : null;
  }

  // ------------------------------------------------------------------ v3 phase banners
  /** v3 runs: a quiet night is a Stillnight (DESIGN §25.5.1); dusk says what the night holds. [title, subtitle, kind] */
  function v3PhaseBanner(p) {
    const T = D().TEXT?.phaseBanner || {}, T3 = D().TEXT_V3 || {};
    const r = run();
    const swarm = typeof p.swarm === 'boolean' ? p.swarm : !!safe(() => ctx.combat?.swarmTonight, r?.nightMode === 'gloomtide');
    if (p.phase === 'dusk') return [T.dusk?.[0] || 'The Light Thins', swarm ? (T3.stirs || 'The Gloom stirs tonight.').replace(/\.$/, '') : (T3.lastLight || 'The big ones come up at dusk.').replace(/\.$/, ''), 'phase'];
    if (p.phase === 'gloomtide') {
      if (swarm) return [T.gloomtide?.[0] || 'The Gloomtide Rises', T.gloomtide?.[1] || 'Guard your flame', 'gloom'];
      return [nightWord(D(), { swarm: false }), 'Night Rise. The big ones come up', 'phase'];
    }
    return T[p.phase] || null;
  }

  // ------------------------------------------------------------------ bus wiring
  function on(evt, fn) { try { ctx.bus.on(evt, (p) => { try { fn(p || {}); } catch (e) { report(`on(${evt})`, e); } }); } catch (e) { report('bus', e); } }

  function wire() {
    for (const evt of tipEvents) on(evt, (p) => onTipEvent(evt, p));
    on('flow:change', ({ flow }) => {
      hud.setVisible(flow === 'playing');
      if (flow === 'playing') closeAll((m) => m.id === 'title' || m.id === 'newdescent' || m.id === 'death' || m.state?.titleChild);
      if (flow !== 'playing') { catchQ.length = 0; levelQ.length = 0; }
    });
    on('run:start', ({ continued }) => {
      if (!continued) zonesSeen = new Set();
      dmgSources.clear();
      catchQ.length = 0; levelQ.length = 0; resolvedSig = ''; resolvedRef = null;
      dawnBell = false; stillT = 0; K.nextBanked = null;
      hud.reset();
      if (continued) toast('The descent continues.', 'lore');
    });
    on('run:end', () => { measure.reset(); closeAll(); catchQ.length = 0; levelQ.length = 0; clearBanners(); heldToasts.length = 0; tipQ.length = 0; for (const t of [...toasts]) dropToast(t, true); hud.setVisible(false); });
    on('zone:change', ({ zone, prev }) => {
      closeModal('descend'); closeModal('shop');
      const z = zoneData(zone);
      if (!z) return;
      banner(z.name, z.subtitle || '', { kind: 'area' });
      hud.onZone(z);
      if (!zonesSeen.has(z.id)) {
        zonesSeen.add(z.id);
        const line = D().TEXT?.zoneEnter?.[z.id];
        if (line) setTimeout(() => { if (ctx.flow === 'playing') toast(line, 'lore'); }, prev ? 4400 : 5200);
      }
    });
    on('phase:change', (p) => {
      const { phase, day } = p;
      const pb = v3Run(D(), run()) ? v3PhaseBanner(p) : D().TEXT?.phaseBanner?.[phase];
      if (pb) banner(fill(pb[0], { day: day ?? run()?.day ?? 1 }), fill(pb[1] || '', { day }), { kind: pb[2] || (phase === 'gloomtide' ? 'gloom' : phase === 'dawn' ? 'dawn' : 'phase') });
      if (phase === 'dusk' && has('shop')) closeModal('shop');
      if (v3Run(D(), run())) { if (phase === 'dawn' && bankedLevels() > 0) dawnBell = true; else if (phase === 'dusk') dawnBell = false; }
      hud.onPhase(phase);
    });
    on('boss:spawn', ({ enemy }) => {
      const e = D().ENEMY_BY_ID?.[enemy?.enemyId] || {};
      const bb = D().TEXT?.bossBanner || ['{name}', 'A Warden rises from the Gloom'];
      banner(fill(bb[0], { name: e.name || enemy?.name || 'A Warden' }), fill(bb[1], { name: e.name }), { kind: 'boss', dur: 3.4 });
      safe(() => navigator.vibrate?.(60), null);
    });
    on('boss:slain', ({ enemy }) => {
      const e = D().ENEMY_BY_ID?.[enemy?.enemyId] || {};
      softToast(`${e.name || 'The Warden'} is silenced.`, 'good', { icon: 'star' }, e.name || 'warden');
    });
    on('boon:chosen', ({ boonId, level }) => {
      hud.dirtyBoons();
      const b = boonData(boonId);
      if (b?.kindle && num(level) >= 6) {
        const kb = D().TEXT?.kindleBanner || ['{name}', 'The flame remembers'];
        banner(fill(kb[0], { name: b.kindle.name }), fill(kb[1], { name: b.kindle.name }), { kind: 'kindle', dur: 3.2 });
      }
    });
    on('fishing:hook', ({ speciesId }) => {
      const sp = speciesData(speciesId);
      if (sp?.rarity === 'legendary') banner(sp.name, sp.epithet || '', { kind: 'legend', dur: 3.2 });
    });
    on('fish:measured', (p) => measure.onMeasured(p));
    on('fish:landed', (p) => {
      if (!p?.fish) return;
      measure.onLanded(p);
      catchQ.push(p);
      hud.dirtyStats();
    });
    on('levelup', (p) => {
      K.lastLevelUp = p;
      hud.pulse('level');
      if (!pendingOptions() && arr(p?.options).length) levelQ.push(p.options);
    });
    on('toast', ({ text, kind }) => {
      // v3: the lamp-watch's start is said by its banner and the HUD's status line (survival's toast would repeat it)
      if (v3Run(D(), run()) && /^Lamp-watch\. /.test(String(text || ''))) return;
      toast(text, kind || 'info');
    });
    // v3 night modes (DESIGN §25.5): the swarm window and the lamp-watch are moments, not just HUD state
    on('swarm:window', ({ state, mode, reason }) => {
      if (!v3Run(D(), run()) || mode !== 'lantern') return;
      if (state === 'open') banner('The Gloom Stirs', 'Guard your light. It passes before the night is out.', { kind: 'gloom', dur: 2.6 });
      else if (reason === 'window') toast('The swarm withdraws. The rest of the night is yours.', 'lore');
    });
    on('lampwatch:start', ({ forced }) => {
      if (!v3Run(D(), run())) return;
      if (forced) return;   // the Scorched card (and the HUD line) say it
      banner('Lamp-watch', 'The Gloom keeps away tonight. Fish near the lamp.', { kind: 'dawn', dur: 3 });
    });
    on('levelup:banked', () => hud.pulse('level'));
    on('player:damage', ({ amount, source }) => {
      hud.onDamage(num(amount, 1));
      const key = typeof source === 'object' && source ? (source.enemyId || source.kind || source.id || 'gloom') : String(source ?? 'gloom');
      dmgSources.set(key, (dmgSources.get(key) || 0) + 1);
    });
    on('player:heal', () => hud.onHeal());
    on('resource:low', ({ resource }) => {
      hud.onLow(resource);
      const tipId = { oil: 'low_oil', satiety: 'low_food', hp: 'low_hp' }[resource];
      if (tipId && tipSeen(tipId)) {
        const msg = { oil: 'Your lantern gutters. Oil is low.', satiety: 'Your wax runs thin. Eat something.', hp: 'Two Embers left.' }[resource];
        if (msg) toast(msg, 'bad', { icon: resource === 'oil' ? 'oil' : resource === 'hp' ? 'ember' : 'food' });
      }
    });
    on('lantern:out', () => {
      hud.onLantern(false);
      // v3: 0 oil gutters for 25 s before the Snuff; the HUD's status line counts it down
      if (v3Run(D(), run())) toast(`Guttering. ${isTouch ? 'Tap Relight' : 'Press R'} to render a fish into oil.`, 'bad', { icon: 'lantern' });
      else if (tipSeen('lantern_out')) toast('Darkness. Burn a fish to relight your lantern.', 'bad', { icon: 'lantern' });
    });
    on('lantern:lit', () => hud.onLantern(true));
    on('shells:change', ({ delta }) => hud.onShells(num(delta)));
    on('xp:gain', () => hud.pulse('xp'));
    on('interact:change', () => hud.dirtyStats());
    on('challenge:complete', ({ challenge }) => {
      if (ctx.flow === 'dead' || !challenge) return;
      const mem = num(challenge.reward?.memories);
      softToast(`${challenge.name}${mem ? ` · +${mem} Memories` : ''}`, 'good', { title: 'Trial complete', icon: 'check', dur: 4600 }, challenge.name);
      screens.refreshIfOpen?.('challenges');
    });
    on('unlock', ({ key, label }) => {
      if (ctx.flow === 'dead') return;
      const lbl = label || unlockLabel(key);
      softToast(`Unlocked: ${lbl}`, 'good', { icon: 'lock', dur: 4200 }, String(lbl).replace(/^\w+: /, ''));
    });
    on('bounty:complete', ({ bounty }) => {
      const s = num(bounty?.reward?.shells);
      softToast(`Bounty honoured${s ? `: +${s} Shells` : ''}`, 'good', { icon: 'ledger' }, 'bount');
      screens.refreshIfOpen?.('shop');
    });
    on('bounty:new', ({ bounty }) => { if (bounty?.text && !has('shop')) softToast(`Murk's ledger: ${bounty.text}`, 'info', { icon: 'ledger' }, String(bounty.text).slice(0, 18)); screens.refreshIfOpen?.('shop'); });
    on('enemy:steal', () => { hud.dirtyStats(); hud.pulse('steal'); });
    on('bait:change', () => hud.dirtyStats());
    on('enemy:hit', onEnemyHit);
    on('merchant:arrive', () => {
      const line = pick(D().MERCHANT_LINES?.arrive);
      if (line && tipSeen('merchant')) softToast(`“${line}”`, 'lore', { title: 'Old Murk' }, 'murk');
    });
    on('merchant:leave', () => {
      if (has('shop')) closeModal('shop');
      const line = pick(D().MERCHANT_LINES?.farewell);
      if (line && ctx.flow === 'playing') softToast(`“${line}”`, 'lore', { title: 'Old Murk' }, 'murk');
    });
    on('fish:action', ({ action }) => { hud.dirtyStats(); hud.pulse(action); screens.refreshIfOpen?.('creel'); });
    on('shop:buy', () => hud.dirtyStats());
    on('relic:buy', () => screens.refreshIfOpen?.('shrine'));
    on('gate:open', () => hud.dirtyStats());
    on('fishing:state', (p) => hud.onFishingState?.(p));
  }

  // ------------------------------------------------------------------ resize
  function onResize() {
    vw = innerWidth; vh = innerHeight;
    root.classList.toggle('gw-portrait', vh > vw);
    root.classList.toggle('gw-narrow', vw < 700);
    root.classList.toggle('gw-short', vh < 560);
    hud.onResize?.(vw, vh);
  }
  addEventListener('resize', onResize);
  addEventListener('orientationchange', () => setTimeout(onResize, 120));

  // ------------------------------------------------------------------ keyboard
  function handleKey(code) {
    const t = top();
    if (t) {
      try { if (t.onKey && t.onKey(code) === true) return true; } catch (e) { report('onKey', e); }
      if (code === 'Escape' || (code === 'KeyP' && t.id === 'pause')) { userEscape(t); return true; }
      if (code === 'KeyP' || code === 'KeyE' || code === 'KeyF' || code === 'KeyR' || code === 'KeyC' || code === 'KeyJ' || code === 'KeyB') return true;
      return false;
    }
    if (ctx.flow === 'playing' && !ctx.paused) {
      if (code === 'KeyC') { screens.openCreel(); return true; }
      if (code === 'KeyJ') { screens.openJournal(); return true; }
      if (code === 'KeyR') { burnFish(); return true; }
      if (code === 'KeyB') { baitCycle(); return true; }
    }
    return false;
  }

  // ------------------------------------------------------------------ public api
  let lastUiT = 0;
  const api = {
    init() {
      wire();
      onResize();
      hud.setVisible(ctx.flow === 'playing');
      ctx.debug = ctx.debug || {};
      ctx.debug.ui = () => ({
        openModal: top()?.id ?? null,
        stack: stack.map((m) => m.id),
        tips: { queue: tipQ.map((q) => q.tip.id), seen: Object.keys(meta().seenTips || {}) },
        toasts: toasts.length,
      });
    },
    update(frameDt) {
      const nowMs = performance.now();
      let dt = lastUiT ? (nowMs - lastUiT) / 1000 : num(frameDt, 0.016);
      lastUiT = nowMs;
      dt = Math.max(0, Math.min(0.25, dt));
      try {
        // keep the pause modal in sync with ctx.paused (pause can come from main, blur, etc.)
        if (ctx.flow === 'playing') {
          if (ctx.paused && !has('pause')) screens.openPause();
          else if (!ctx.paused && has('pause')) { closeModal('pause'); closeAll((m) => m.state?.pauseChild); }
          // queued decisions: catch card first, then level-up picks
          if (!hasBlocking() && !measure.holding()) {
            if (catchQ.length) screens.showCatch(catchQ.shift());
            else {
              const po = pendingOptions();
              if (po && (po !== resolvedRef || K.optionsSig(po) !== resolvedSig)) { screens.openLevelUp(po, K.nextBanked ? { banked: K.nextBanked } : undefined); K.nextBanked = null; }
              else if (!po && levelQ.length) screens.openLevelUp(levelQ.shift());
            }
          }
          updateDawnBell(dt);
        }
        layers.toasts.classList.toggle('gw-low', hasBlocking() && ctx.flow === 'playing');
        layers.toasts.classList.toggle('gw-dead', ctx.flow === 'dead');
        const S = settings();
        root.classList.toggle('gw-calm-fx', S.reducedFlashing === true);
        root.classList.toggle('gw-no-dmg', S.damageNumbers === false);
        hud.update(dt);
        for (const m of stack) { m.t += dt; m.tick?.(dt); }
        updateWorldText(dt);
        updateBanner(dt);
        flushHeldToasts(ctx.flow !== 'playing');
        updateTips();
        updateTweens(dt);
      } catch (e) { report('update', e); }
    },
    isBlocking: () => hasBlocking(),
    isShopOpen: () => has('shop'),
    handleKey,
    showTitle: () => screens.showTitle(),
    showDeath: (summary) => screens.showDeath(summary),
    showVictory: (summary) => screens.showVictory(summary),
    openShop: () => screens.openShop(),
    openCreel: () => screens.openCreel(),
    openJournal: () => screens.openJournal(),
    openShrine: () => screens.openShrine(),
    openChallenges: () => screens.openChallenges(),
    openSettings: () => screens.openSettings(),
    openPause: () => screens.openPause(),
    openDescend: () => screens.openDescend(),
    openLevelUp: (options) => screens.openLevelUp(options),
    openNewDescent: () => screens.openNewDescent(),
    closeAll: () => closeAll(),
    showCatch: (fish, info = {}) => screens.showCatch({ fish, ...info }),
    showMeasure: (m) => measure.show(m),
    measureDebug: () => measure.debug(),
    toast: (text, kind) => toast(text, kind),
    floatText, damageNumber,
    banner: (title, subtitle, opts) => banner(title, subtitle, opts),
    burnFish, cycleBait: baitCycle,
  };
  return api;
}
