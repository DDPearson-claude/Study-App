// ui-heart.js — the heart races (the user's ask, 17 Nov 2026: "If an elder or an ancient takes your bait I want the player to be
// notified that youve just hooked one it makes your heart race"). Under the loop only (ui.js builds it beside the loop view; the
// flag-off game never builds it). The moment the hook is set (fishing:hookset, the strike landing, bait or lure) on an Elder or an
// Ancient, once per hooked fish:
//   · a few words low on the screen (TEXT_LOOP.heart, the class's own label, ≤ 3 words) in the strike word's type, the Ancient's in
//     the warm wax; laid out clear of the float, the fish, the strike word, the play's stamp and the HUD, or not shown at all;
//     they hold LOOP.heart.words.hold s and fade;
//   · a soft low lub-dub (sfx heart_hook) on each beat, fast at first and slowing (LOOP.heart[cls]: n beats, first → last s apart),
//     the Ancient's deeper and slower;
//   · the frame's edges darkening on each beat (a vignette over the whole frame, never a ring round anything); off with reduced motion;
//   · a short double buzz on phones (navigator.vibrate, guarded; off with reduced motion or the haptics setting off).
// Nothing for Small, Keeper, Prize or Trophy; it reads no odds, changes nothing in the catch and never fires twice for one fish.
// pointer-events none throughout.
//
// Pure exports (node: tools/tests/loop-heart.test.mjs): heartFor · heartWords · heartBeats · heartEdge · heartPlace · HEART_CSS
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** The heart's class for a hook set ({sizeClass, ancient}): 'ancient', 'elder', or null (every other class, a legend, a find). */
export function heartFor(p, D) {
  if (D?.LOOP_ENABLED !== true || !isObj(D?.LOOP?.heart) || !isObj(p)) return null;
  if (p.legendary || p.find || p.sizeClass !== 'elder') return null;
  const cls = p.ancient === true ? 'ancient' : 'elder';
  return isObj(D.LOOP.heart[cls]) ? cls : null;
}

/** The words for a class (TEXT_LOOP.heart), or '' when there are none. */
export function heartWords(D, cls) {
  const w = D?.TEXT_LOOP?.heart?.[cls];
  return typeof w === 'string' ? w : '';
}

/** The beats' start times (s from the hook set): n beats, each gap from `first` growing to `last` (fast at first, then slowing). */
export function heartBeats(c) {
  const n = Math.max(1, Math.round(num(c?.n, 1))), first = num(c?.first, 0.5), last = num(c?.last, first);
  const out = [0];
  for (let i = 1; i < n; i++) out.push(out[i - 1] + first + (last - first) * (n > 2 ? (i - 1) / (n - 2) : 0));
  return out.map((t) => Math.round(t * 1000) / 1000);
}

/** Each beat's strength (1 at the first, easing to 0.55 at the last). */
const beatAmp = (i, n) => (n > 1 ? 1 - 0.45 * (i / (n - 1)) : 1);

/** The vignette's darkness (0–1) at t s after the hook set: a quick swell on the lub and a smaller one on the dub, each fading. */
export function heartEdge(t, c, beats = heartBeats(c)) {
  const edge = num(c?.edge, 0.4), decay = Math.max(0.05, num(c?.decay, 0.4)), gap = num(c?.gap, 0.2);
  const pulse = (x) => (x < 0 ? 0 : x < 0.07 ? x / 0.07 : Math.exp(-(x - 0.07) / (decay * 0.45)));
  let v = 0;
  beats.forEach((b, i) => { const a = beatAmp(i, beats.length); v = Math.max(v, a * pulse(t - b), 0.7 * a * pulse(t - b - gap)); });
  return Math.max(0, Math.min(1, edge * v));
}

/**
 * Where the words go: low on the screen, clear of every rect in `avoid` (each padded by `pad`) and of the screen's edges (`gutter`).
 * Rows from the foot upward (to 45 % of the height), the middle first, then a third in from either side. {left, top, ok}; ok false
 * when no place is clear (the words are then not shown).
 */
export function heartPlace({ W, H, w, h, avoid = [], gutter = 16, foot = 44, pad = 10, step = 14 } = {}) {
  if (!(W > 0 && H > 0 && w > 0 && h > 0) || w > W - 2 * gutter) return { left: 0, top: 0, ok: false };
  const hit = (a, b) => a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
  const xs = [W / 2, W * 0.3, W * 0.7].map((cx) => Math.max(gutter, Math.min(W - gutter - w, cx - w / 2)));
  for (let top = H - foot - h; top >= H * 0.45; top -= step) {
    for (const left of xs) {
      const r = { left, top, right: left + w, bottom: top + h };
      if (!avoid.some((a) => a && hit(r, a))) return { left: Math.round(left), top: Math.round(top), ok: true };
    }
  }
  return { left: 0, top: 0, ok: false };
}

export const HEART_CSS = `
.gw-heart-edge { position: fixed; inset: 0; pointer-events: none; opacity: 0; z-index: 0;
  background: radial-gradient(ellipse 78% 74% at 50% 48%, transparent 46%, rgba(6, 7, 16, .55) 78%, rgba(4, 5, 12, .92) 100%); }
.gw-heart-w { position: fixed; left: 0; top: 0; pointer-events: none; white-space: nowrap; z-index: 2;
  font: 400 30px/1.15 var(--f-display); letter-spacing: .16em; margin-right: -.16em; color: var(--ink-hi);
  text-shadow: 0 0 16px rgba(160, 150, 240, .6), 0 1px 2px rgba(4, 5, 12, .95), 0 0 8px rgba(4, 5, 12, .9);
  opacity: 0; transition: opacity .3s ease; }
.gw-heart-w.gw-heart-ancient { color: #f1d6ab; text-shadow: 0 0 16px rgba(214, 140, 72, .42), 0 1px 2px rgba(4, 5, 12, .95), 0 0 8px rgba(4, 5, 12, .9); }
.gw-heart-w.gw-in { opacity: 1; }
.gw-heart-w.gw-out { opacity: 0; transition: opacity var(--gw-heart-fade, .6s) ease; }
@media (max-width: 699px) { .gw-heart-w { font-size: 26px; letter-spacing: .12em; margin-right: -.12em; } }
`;

/** The DOM pieces the words keep clear of (visible ones only): the strike word, the play's stamp, the float's marks, the HUD, toasts. */
const AVOID = ['.gw-strike-w', '.gw-play.gw-on', '.gw-favour.gw-on', '.gw-hold', '[data-loop=home]', '.gw-tl', '.gw-tr', '.gw-hb-pause',
  '.gw-toast.gw-in', '.gw-tackle', '.gw-gotaway', '.gw-away', '.gw-joy-base'];

export function createHeartView(K) {
  const { ctx, D } = K;
  const report = (where, e) => { try { K.report?.(`heart.${where}`, e); } catch { /* ignore */ } };
  const settings = () => { try { return (typeof K.settings === 'function' ? K.settings() : ctx.state?.meta?.settings) || {}; } catch { return {}; } };
  const reducedMotion = () => settings().reducedMotion === true || (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
  if (typeof document !== 'undefined' && !document.getElementById('gw-heart-css')) {
    const st = document.createElement('style'); st.id = 'gw-heart-css'; st.textContent = HEART_CSS; document.head.appendChild(st);
  }
  const S = { cls: null, t: 0, beats: [], beatI: 0, fired: false, words: null, edge: null, wordsOut: false, place: null, fires: 0, rm: false };
  const cfg = () => (S.cls ? D()?.LOOP?.heart?.[S.cls] : null) || null;

  function rectsToAvoid() {
    const out = [];
    const root = K.root || (typeof document !== 'undefined' ? document : null);
    for (const sel of AVOID) {
      for (const e of root?.querySelectorAll?.(sel) || []) {
        const r = e.getBoundingClientRect(), s = typeof getComputedStyle === 'function' ? getComputedStyle(e) : {};
        if (r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity ?? 1) > 0.05) out.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
      }
    }
    // the float and the fish on the line under it (a wide box round the float's point), and the raft with its Wick
    const b = ctx.fishing?.bobberPos, pp = ctx.player?.position;
    if (b && typeof K.project === 'function') {
      const p = K.project({ x: b.x, y: num(b.y) + 0.2, z: b.z });
      if (p?.ok && !p.behind) { out.push({ left: p.x - 110, right: p.x + 110, top: p.y - 80, bottom: p.y + 90 }); S.float = { x: Math.round(p.x), y: Math.round(p.y) }; }
    }
    if (pp && typeof K.project === 'function') {
      const p = K.project({ x: pp.x, y: num(pp.y) + 0.3, z: pp.z });
      if (p?.ok && !p.behind) out.push({ left: p.x - 60, right: p.x + 60, top: p.y - 60, bottom: p.y + 34 });
    }
    return out;
  }
  function placeWords(keep = false) {
    const el = S.words;
    if (!el) return;
    const W = K.vw || globalThis.innerWidth, H = K.vh || globalThis.innerHeight, w = el.offsetWidth, h = el.offsetHeight, avoid = rectsToAvoid();
    // (once placed the words stay put while their place is clear: they never hop about with the float's bob)
    if (keep && S.place?.ok) {
      const r = { left: S.place.left, top: S.place.top, right: S.place.left + w, bottom: S.place.top + h };
      if (r.bottom <= H - 16 && r.right <= W - 16 && !avoid.some((a) => a.left < r.right + 10 && a.right > r.left - 10 && a.top < r.bottom + 10 && a.bottom > r.top - 10)) return;
    }
    const P = heartPlace({ W, H, w, h, avoid });
    S.place = P;
    if (!P.ok) { el.style.visibility = 'hidden'; return; }
    el.style.visibility = '';
    el.style.transform = `translate3d(${P.left}px,${P.top}px,0)`;
  }
  function buzz() {
    const pat = D()?.LOOP?.heart?.buzz;
    if (!Array.isArray(pat) || !pat.length || S.rm) return false;
    const st = settings();
    if (st.haptics === false || st.vibration === false || st.screenShake === false) return false;
    try { const nv = globalThis.navigator; if (nv && typeof nv.vibrate === 'function') { nv.vibrate(pat); return true; } } catch { /* optional */ }
    return false;
  }
  function beat(i) {
    const c = cfg();
    if (!c) return;
    const a = beatAmp(i, S.beats.length);
    try { ctx.audio?.play?.('heart_hook', { volume: num(c.volume, 0.5) * a, pitch: num(c.pitch, 1), gap: num(c.gap, 0.2), force: true, why: S.cls }); } catch { /* audio optional */ }
  }
  function stop(now = false) {
    const w = S.words, e = S.edge;
    S.words = null; S.edge = null; S.cls = null; S.beats = []; S.beatI = 0;
    for (const el of [w, e]) {
      if (!el) continue;
      if (now) { el.remove(); continue; }
      el.classList.add('gw-out'); el.style.opacity = el === e ? '0' : '';
      setTimeout(() => el.remove(), 700);
    }
  }
  function fire(p) {
    if (S.fired) return false;   // once per hooked fish (until the next cast)
    const cls = heartFor(p, D());
    if (!cls) return false;
    S.fired = true; S.fires++;
    stop(true);
    S.cls = cls; S.t = 0; S.beats = heartBeats(cfg()); S.beatI = 0; S.wordsOut = false; S.rm = reducedMotion();
    const h = K.h, layer = K.layers?.hud || K.root;
    const text = heartWords(D(), cls);
    if (text && layer) {
      const el = h('div', `gw-heart-w gw-heart-${cls}`);
      el.dataset.loop = 'heart';
      el.setAttribute('role', 'status');
      el.textContent = text;
      el.style.setProperty('--gw-heart-fade', `${num(D()?.LOOP?.heart?.words?.fade, 0.6)}s`);
      layer.appendChild(el);
      S.words = el;
      placeWords();
      void el.offsetWidth;
      el.classList.add('gw-in');
    }
    if (!S.rm && layer) {
      const ed = h('div', 'gw-heart-edge');
      ed.setAttribute('aria-hidden', 'true');
      layer.insertBefore(ed, layer.firstChild);
      S.edge = ed;
    }
    buzz();
    try { ctx.bus?.emit?.('loop:heart', { cls, words: text }); } catch { /* ignore */ }
    return true;
  }
  const on = (evt, fn) => { try { ctx.bus?.on?.(evt, fn); } catch (e) { report(`on ${evt}`, e); } };
  on('fishing:hookset', (p) => { try { fire(p); } catch (e) { report('fire', e); } });
  on('fishing:cast', () => { S.fired = false; stop(); });
  for (const evt of ['run:end', 'home:enter', 'run:start']) on(evt, () => { S.fired = false; stop(true); });
  // the words give way to what the play says next (the got-away line, the show); the beats run on under it
  for (const evt of ['fishing:escaped', 'fishing:landing', 'fishing:show']) on(evt, () => { if (S.words && !S.wordsOut) { S.wordsOut = true; S.words.classList.add('gw-out'); } });
  on('flow:change', ({ flow } = {}) => { if (flow !== 'playing') stop(true); });

  function update(dt) {
    if (!S.cls) return;
    const d = Math.max(0, Math.min(0.25, num(dt)));
    const c = cfg();
    S.t += d;
    while (S.beatI < S.beats.length && S.t >= S.beats[S.beatI]) beat(S.beatI++);
    if (S.edge) S.edge.style.opacity = heartEdge(S.t, c, S.beats).toFixed(3);
    const W = D()?.LOOP?.heart?.words || {};
    if (S.words && !S.wordsOut) {
      if (S.t >= num(W.hold, 2) || K.hasBlocking?.()) { S.wordsOut = true; S.words.classList.add('gw-out'); }
      else placeWords(true);
    }
    const end = (S.beats[S.beats.length - 1] || 0) + num(c?.gap, 0.2) + 1.2;
    if (S.t >= Math.max(end, num(W.hold, 2) + num(W.fade, 0.6) + 0.2)) stop(true);
  }

  return {
    update,
    /** debug builds and tests: {on, cls, t, fires, fired, edge, words, place, rm} */
    debug: () => ({ on: !!S.cls, cls: S.cls, t: S.t, fires: S.fires, fired: S.fired, edge: S.edge ? Number(S.edge.style.opacity || 0) : null,
      words: S.words && !S.wordsOut ? S.words.textContent : null, place: S.place ? { ...S.place } : null, rm: S.rm, float: S.float || null }),
  };
}
