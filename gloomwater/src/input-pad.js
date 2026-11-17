// input-pad.js — a game controller (the user's ask, 17 Nov 2026: play on a Windows handheld whose detachable controllers show to
// Chrome / Edge as one standard Xbox-style pad through the Gamepad API). Under the loop only: main attaches it when GW_LOOP is on, and
// nothing changes for a mouse, keyboard or touch player (no DOM and no CSS until a pad is used).
// Polled once a frame from main's loop, after the keys' move: navigator.getGamepads(), the first pad, its buttons edge-detected into
// fixed arrays (nothing allocated per frame while nobody touches it).
//   On the water: the left stick (or the D-pad) sails, as WASD and the touch stick do; A held aims the cast and its release casts
//   (main's own press and release, as a mouse or a finger makes them: the swing-out-and-back aim, the strike gauge, the show's hurry and
//   a lure's retrieve are all as today); the right stick turns the aim (camera-relative; ahead of the raft until it is pushed).
//   Every screen (the home's Jetty and its targets, the Chart, the Journal, Murk's book, the sheet, Settings, the pauses, the tally,
//   the catch and find cards, the guide's boxes, the tackle tin): the D-pad or the left stick moves a focus between the screen's own
//   buttons by where they sit on screen; A chooses; B is Escape (on the catch / find card it is Let go, and held it is Let go held);
//   LB / RB switch tabs; the right stick scrolls. The focus wears the UI's own :focus-visible look (each such rule is twinned for
//   .gw-padfocus: a script's focus after a touch is not "visible" to the browser).
//   Anywhere: Start the pause, Y the Journal, X the tackle tin (the keys P, J and B).
//   While the last input was the pad: small A / B glyphs beside the focused button and the way back (Settings' Controller hints), and
//   the touch stick hidden; a mouse, a touch or a key puts all of it back.
//   Rumble ('dual-rumble', guarded; off with reduced motion or the haptics / vibration / screen-shake setting off): a short soft one at
//   the strike, and the heart's beats (ui-heart.js) when an Elder or an Ancient is hooked. Never a ring in the world.
// Pure exports (node: tools/tests/input-pad.test.mjs): PAD · DEAD · deadZone · firstPad · readPad · edges · stickDir · navPick ·
// createRepeat · chipPlace · attachPad
import { heartFor, heartBeats } from './ui-heart.js';

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** The standard mapping's buttons. */
export const PAD = Object.freeze({ A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9, LS: 10, RS: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 });
const N = 16;
/** The sticks' dead zone (radial, rescaled past it). */
export const DEAD = 0.22;
/** Directions: 0 up, 1 right, 2 down, 3 left. */
const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;

/** A stick's axes (x, y; y down as the pad reports it) → out {x, y} with y up, 0 inside the dead zone, rescaled to 0–1 past it. */
export function deadZone(ax, ay, dz = DEAD, out = { x: 0, y: 0 }) {
  const x = num(ax), y = -num(ay), m = Math.hypot(x, y);
  if (m <= dz) { out.x = 0; out.y = 0; return out; }
  const k = Math.min(1, (m - dz) / (1 - dz)) / m;
  out.x = x * k; out.y = y * k;
  return out;
}
/** The first connected pad of a getGamepads() list (a standard one first), or null. */
export function firstPad(list) {
  if (!list) return null;
  let any = null;
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    if (!p || p.connected === false || !p.buttons || p.buttons.length < 4) continue;
    if (p.mapping === 'standard') return p;
    any = any || p;
  }
  return any;
}
/** A pad's buttons into cur (0/1) and its axes into axes. */
export function readPad(gp, cur, axes) {
  const b = gp?.buttons || [], a = gp?.axes || [];
  for (let i = 0; i < cur.length; i++) { const q = b[i]; cur[i] = q && (q.pressed === true || num(q.value) > 0.5) ? 1 : 0; }
  for (let i = 0; i < axes.length; i++) axes[i] = num(a[i]);
}
/** Edges since the last read: down / up (0/1); prev becomes cur. → whether any button went down. */
export function edges(cur, prev, down, up) {
  let any = false;
  for (let i = 0; i < cur.length; i++) {
    down[i] = cur[i] && !prev[i] ? 1 : 0; up[i] = !cur[i] && prev[i] ? 1 : 0; prev[i] = cur[i];
    if (down[i]) any = true;
  }
  return any;
}
/** A stick (y up) as a direction, or -1 under th. */
export function stickDir(x, y, th = 0.55) {
  if (Math.hypot(x, y) < th) return -1;
  return Math.abs(x) > Math.abs(y) ? (x > 0 ? RIGHT : LEFT) : (y > 0 ? UP : DOWN);
}
/** Spatial navigation: from a rect {l, t, r, b}, the best of rects in dir (0 up, 1 right, 2 down, 3 left), or -1. A target in line
 *  (its row or column overlapping) beats a nearer one off to the side; skip is the from rect's own index. */
export function navPick(from, rects, dir, skip = -1) {
  const fx = (from.l + from.r) / 2, fy = (from.t + from.b) / 2;
  let best = -1, bs = Infinity;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r || i === skip) continue;
    const cx = (r.l + r.r) / 2, cy = (r.t + r.b) / 2;
    const h = dir === RIGHT || dir === LEFT;
    const along = h ? (dir === RIGHT ? cx - fx : fx - cx) : (dir === DOWN ? cy - fy : fy - cy);
    if (along <= 1) continue;
    const gap = Math.max(0, h ? (dir === RIGHT ? r.l - from.r : from.l - r.r) : (dir === DOWN ? r.t - from.b : from.t - r.b));
    const across = h ? Math.max(0, r.t - from.b, from.t - r.b) : Math.max(0, r.l - from.r, from.l - r.r);
    const s = gap + along * 0.1 + across * 5;
    if (s < bs) { bs = s; best = i; }
  }
  return best;
}
/** A held direction's repeat: (dir | -1, dt) → the direction to move now, or -1 (at once, then after `first` s, then every `every` s). */
export function createRepeat(first = 0.36, every = 0.13) {
  let cur = -1, t = 0;
  return (dir, dt) => {
    if (dir < 0) { cur = -1; return -1; }
    if (dir !== cur) { cur = dir; t = first; return dir; }
    t -= num(dt);
    if (t > 0) return -1;
    t = every;
    return dir;
  };
}
/** Where a glyph of size s goes beside a rect {l, t, r, b} in a vw × vh screen: left of it (right first when `right`), the other
 *  side, above, below (the first in the screen whose box clear(x, y, s) passes), else just inside its top-left corner. → {x, y, inside}. */
export function chipPlace(r, s, vw, vh, clear = () => true, gap = 6, right = false) {
  const my = Math.round((r.t + r.b) / 2 - s / 2);
  const L = [r.l - gap - s, my], Rt = [r.r + gap, my];
  const spots = [right ? Rt : L, right ? L : Rt, [r.l, r.t - gap - s], [r.l, r.b + gap]];
  for (const [x, y] of spots) if (x >= 2 && y >= 2 && x + s <= vw - 2 && y + s <= vh - 2 && clear(x, y, s)) return { x, y, inside: false };
  return { x: Math.min(Math.max(2, r.l + 3), vw - s - 2), y: Math.min(Math.max(2, r.t + 3), vh - s - 2), inside: true };
}

const CAND = 'button, [role=button], [role=tab], [role=switch], a[href], input[type=range], [tabindex="0"]';
const BACKS = '.gw-x, .gw-book-close, .gw-loop-back';
const LETGO = '.gw-cc-letgo, [data-action=letgo]';
const KEYS = { Escape: 'Escape', KeyP: 'p', KeyJ: 'j', KeyB: 'b', Enter: 'Enter', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown' };
const CSS = `
.gw-pad-on .gw-joyzone { display: none !important; }
.gw-padg { position: fixed; left: 0; top: 0; z-index: 2147483000; width: 20px; height: 20px; box-sizing: border-box; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0; transition: opacity .14s;
  font: 600 11px/1 var(--f-body, Georgia, serif); letter-spacing: 0; color: var(--ink-hi, #f8f7fe); background: rgba(10, 12, 25, .86);
  box-shadow: 0 0 0 1px rgba(174, 172, 208, .62), 0 0 10px rgba(160, 150, 240, .34); text-shadow: none; }
.gw-padg.gw-on { opacity: 1; }
.gw-padg[data-b] { color: var(--ink-dim, #aeacd0); }
`;

/**
 * The pad, attached: → {poll(dt), state, debug()}. hooks: press() / release() (main's pointer press and release for the water),
 * busy() (a home glide or a place's lift is running: A skips it, as a tap does). win / doc / nav are the browser's (fakes in node).
 */
export function attachPad(ctx, { press = () => {}, release = () => {}, busy = () => false, win = globalThis, doc = globalThis.document, nav = globalThis.navigator, report = () => {} } = {}) {
  const input = ctx.input || (ctx.input = {});
  const aim = input.padAim || (input.padAim = { on: false, x: 0, z: -1 });
  const cur = new Uint8Array(N), prev = new Uint8Array(N), dn = new Uint8Array(N), upE = new Uint8Array(N), axes = new Float32Array(4);
  const L = { x: 0, y: 0 }, R = { x: 0, y: 0 };
  const rep = createRepeat();
  const S = { seen: false, active: false, mode: 'none', scope: null, focus: null, fsig: '', frect: null, aWater: false, letgo: null,
    css: null, chips: null, scopeT: 0, done: new WeakSet(), sheetN: -1, tick: 0, back: null, chipKey: '', synth: false, lastPad: null, rumbles: 0 };
  const settings = () => ctx.state?.meta?.settings || {};
  const root = () => doc?.documentElement || null;

  // ---- the last input: a real pointer, key or wheel puts the page back as it was
  const off = () => { if (!S.synth && S.active) setActive(false); };
  try { for (const ev of ['pointerdown', 'keydown', 'wheel']) win.addEventListener?.(ev, off, { capture: true, passive: true }); } catch { /* no window */ }

  function setActive(on) {
    if (S.active === on) return;
    S.active = on;
    if (on) ensureCss();
    root()?.classList?.toggle('gw-pad-on', on);
    if (!on) { markFocus(null, false); showChips(false); }
  }
  function ensureCss() {
    if (S.css || !doc?.createElement) return;
    try { S.css = doc.createElement('style'); S.css.id = 'gw-pad-css'; S.css.textContent = CSS; doc.head.appendChild(S.css); } catch (e) { report('css', e); }
    twinFocusRules();
  }
  /** Twin every :focus-visible rule for .gw-padfocus (the sheets seen so far; a new sheet is twinned when a screen opens). */
  function twinFocusRules() {
    const sheets = doc?.styleSheets, out = S.css?.sheet;
    if (!sheets || !out) return;
    for (let i = 0; i < sheets.length; i++) {
      const sh = sheets[i];
      if (S.done.has(sh) || sh === out) continue;
      S.done.add(sh);
      let rules = null;
      try { rules = sh.cssRules; } catch { continue; }
      twin(rules, out, '');
    }
  }
  function twin(rules, out, wrap) {
    for (let i = 0; i < (rules?.length || 0); i++) {
      const r = rules[i];
      if (r.selectorText && r.selectorText.includes(':focus-visible')) {
        const t = `${r.selectorText.replace(/:focus-visible/g, '.gw-padfocus')} { ${r.style.cssText} }`;
        try { out.insertRule(wrap ? `${wrap} { ${t} }` : t, out.cssRules.length); } catch { /* a selector this browser refuses */ }
      } else if (r.cssRules && r.media) twin(r.cssRules, out, `@media ${r.media.mediaText}`);
    }
  }

  // ---- keys and clicks (the game's own handlers; a synthetic event never counts as the player's key)
  function key(code) {
    const KE = win.KeyboardEvent;
    S.synth = true;
    try {
      for (const type of ['keydown', 'keyup']) {
        const init = { code, key: KEYS[code] || code, bubbles: true, cancelable: true };
        win.dispatchEvent(KE ? new KE(type, init) : Object.assign(new win.Event(type, init), init));
      }
    } catch (e) { report('key', e); } finally { S.synth = false; }
  }
  function pointer(el, type) {
    const PE = win.PointerEvent || win.MouseEvent;
    S.synth = true;
    try { el.dispatchEvent(new PE(type, { bubbles: true, cancelable: true, button: 0, buttons: type === 'pointerdown' ? 1 : 0, pointerId: 91, pointerType: 'mouse', isPrimary: true })); }
    catch (e) { report('pointer', e); } finally { S.synth = false; }
  }
  function click(el) { S.synth = true; try { el.click(); } catch (e) { report('click', e); } finally { S.synth = false; } }

  // ---- the screen on top, its targets, the focus
  function topScope() {
    const layer = doc?.querySelector?.('.gw-modal-layer');
    for (let el = layer?.lastElementChild; el; el = el.previousElementSibling) {
      if (el.classList.contains('gw-modal') && !el.classList.contains('gw-out') && !el.dataset.held) return el;
    }
    return null;
  }
  function usable(el) {
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[aria-hidden="true"], [inert]')) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    try { if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return null; } catch { /* old browser */ }
    if (win.getComputedStyle?.(el).pointerEvents === 'none') return null;
    return { l: r.left, t: r.top, r: r.right, b: r.bottom };
  }
  function targets(scope) {
    const els = [], rects = [];
    for (const el of scope.querySelectorAll(CAND)) { const r = usable(el); if (r) { els.push(el); rects.push(r); } }
    return { els, rects };
  }
  const sigOf = (el) => `${el.tagName}|${el.getAttribute('aria-label') || ''}|${Object.keys(el.dataset).sort().map((k) => `${k}=${el.dataset[k]}`).join(',')}|${(el.textContent || '').trim().slice(0, 24)}`;
  function markFocus(el, domFocus = true) {
    if (S.focus && S.focus !== el) S.focus.classList?.remove('gw-padfocus');
    S.focus = el || null;
    S.chipKey = '';
    if (!el) return;
    S.fsig = sigOf(el);
    const r = el.getBoundingClientRect();
    S.frect = { l: r.left, t: r.top, r: r.right, b: r.bottom };
    if (S.active) el.classList.add('gw-padfocus');
    if (domFocus) { try { el.focus({ preventScroll: true }); el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); } catch { /* ignore */ } }
  }
  /** The screen's first focus: the UI's own focused element, its autofocus, else its first target (a close button last). */
  function defaultFocus(scope) {
    if (scope.dataset.modal === 'tow') return null;   // (the tow is a tap anywhere: A taps it)
    const T = targets(scope);
    if (!T.els.length) return null;
    const act = doc.activeElement;
    if (act && T.els.includes(act)) return act;
    return T.els.find((e) => e.dataset.autofocus) || T.els.find((e) => !e.matches(BACKS)) || T.els[0];
  }
  /** The focus after a re-render: the same target (by its signature), else the one nearest where it was. */
  function recover(scope) {
    const T = targets(scope);
    if (!T.els.length) return null;
    const same = T.els.find((e) => sigOf(e) === S.fsig);
    if (same || !S.frect) return same || null;
    const fx = (S.frect.l + S.frect.r) / 2, fy = (S.frect.t + S.frect.b) / 2;
    let best = null, bd = Infinity;
    T.rects.forEach((r, i) => { const d = Math.hypot((r.l + r.r) / 2 - fx, (r.t + r.b) / 2 - fy); if (d < bd) { bd = d; best = T.els[i]; } });
    return best;
  }
  function move(scope, dir) {
    const f = S.focus;
    if (f && f.matches?.('input[type=range]') && (dir === LEFT || dir === RIGHT)) {   // a slider: its own keys
      S.synth = true;
      try { f.dispatchEvent(new win.KeyboardEvent('keydown', { code: dir === LEFT ? 'ArrowLeft' : 'ArrowRight', key: dir === LEFT ? 'ArrowLeft' : 'ArrowRight', bubbles: true, cancelable: true })); }
      catch (e) { report('slider', e); } finally { S.synth = false; }
      return;
    }
    const T = targets(scope);
    if (!T.els.length) return;
    const i = f ? T.els.indexOf(f) : -1;
    if (i < 0) { markFocus(defaultFocus(scope)); return; }
    const j = navPick(T.rects[i], T.rects, dir, i);
    if (j < 0) return;
    markFocus(T.els[j]);
    try { ctx.audio?.play?.('ui_hover', { volume: 0.3 }); } catch { /* optional */ }
  }
  function tab(scope, d) {
    const tabs = [...scope.querySelectorAll('[role=tab], .gw-tab')].filter((e) => usable(e));
    if (tabs.length < 2) return;
    let i = tabs.findIndex((e) => e.getAttribute('aria-selected') === 'true' || e.classList.contains('gw-on'));
    if (i < 0) i = 0;
    const j = Math.max(0, Math.min(tabs.length - 1, i + d));
    if (j !== i) { markFocus(tabs[j]); click(tabs[j]); }
  }

  // ---- the glyphs beside the focus and the way back
  function chip(letter) {
    const c = doc.createElement('i');
    c.className = 'gw-padg'; c.setAttribute('aria-hidden', 'true'); c.textContent = letter;
    if (letter === 'B') c.dataset.b = '1';
    doc.body.appendChild(c);
    return c;
  }
  function showChips(on) { if (S.chips) for (const c of S.chips) c.classList.toggle('gw-on', !!on && c.dataset.placed === '1'); }
  /** A glyph's box is clear when no word, no drawing and no other button is under its corners and centre (its own button's padding is). */
  function clearAt(el) {
    return (x, y, s) => {
      for (const [px, py] of [[x + 1, y + 1], [x + s - 1, y + 1], [x + 1, y + s - 1], [x + s - 1, y + s - 1], [x + s / 2, y + s / 2]]) {
        const e = doc.elementFromPoint?.(px, py);
        if (!e) continue;
        const c = e.closest?.(CAND);
        if (c && c !== el) return false;   // another button
        if (/^(CANVAS|IMG|SVG|PATH|USE|CIRCLE|LINE|POLYLINE|INPUT)$/i.test(e.tagName) && S.scope?.contains(e)) return false;   // the screen's own art (the world's canvas is not)
        for (let n = e.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return false;
      }
      return true;
    };
  }
  /** What a glyph sits beside: a home target's word, else the button's own label (its contents' box, not its padding). */
  function anchorRect(el) {
    const w = el.querySelector?.('.gw-jetty-tword');
    const r = (w || el).getBoundingClientRect();
    if (!w && doc.createRange) {
      try { const rg = doc.createRange(); rg.selectNodeContents(el); const c = rg.getBoundingClientRect(); if (c.width > 4 && c.height > 4 && c.width < r.width - 8) return c; } catch { /* old browser */ }
    }
    return r;
  }
  function placeChip(c, el, right = false) {
    if (!el) { c.dataset.placed = ''; c.classList.remove('gw-on'); return; }
    const r = anchorRect(el);
    const p = chipPlace({ l: r.left, t: r.top, r: r.right, b: r.bottom }, 20, win.innerWidth, win.innerHeight, clearAt(el), 6, right);
    c.style.transform = `translate(${Math.round(p.x)}px,${Math.round(p.y)}px)`;
    c.dataset.placed = '1';
  }
  function updateChips(scope) {
    const want = S.active && settings().padHints !== false && S.mode === 'menu' && !!scope;
    if (!want) { showChips(false); return; }
    if (!S.chips) S.chips = [chip('A'), chip('B')];
    if (!S.back || !S.back.isConnected || (S.tick % 30) === 0) S.back = [...scope.querySelectorAll(scope.dataset.modal === 'catch' ? LETGO : BACKS)].find((e) => usable(e)) || null;
    const a = S.focus && S.focus.isConnected ? S.focus : null, b = S.back && S.back !== a ? S.back : null;
    const ra = a?.getBoundingClientRect(), rb = b?.getBoundingClientRect();
    const k = `${ra ? `${ra.left | 0},${ra.top | 0},${ra.width | 0}` : '-'}|${rb ? `${rb.left | 0},${rb.top | 0},${rb.width | 0}` : '-'}|${win.innerWidth}x${win.innerHeight}`;
    if (k !== S.chipKey) {
      S.chipKey = k;
      showChips(false);
      placeChip(S.chips[0], a); placeChip(S.chips[1], b, true);
    }
    showChips(true);
  }

  // ---- rumble
  const reduced = () => settings().reducedMotion === true || (() => { try { return !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
  function rumble(ms, strong, weak) {
    const st = settings();
    if (!S.active || reduced() || st.haptics === false || st.vibration === false || st.screenShake === false) return false;
    let gp = null;
    try { gp = firstPad(nav?.getGamepads?.()); } catch { gp = null; }
    const va = gp?.vibrationActuator;
    if (!va || typeof va.playEffect !== 'function') return false;
    try { const p = va.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: strong, weakMagnitude: weak }); p?.catch?.(() => {}); S.rumbles++; return true; } catch { return false; }
  }
  try {
    ctx.bus?.on?.('fishing:strike', () => rumble(90, 0.18, 0.42));
    ctx.bus?.on?.('fishing:hookset', (p) => {
      const D = ctx.data, cls = heartFor(p, D);
      if (!cls) return;
      const c = D.LOOP.heart[cls], beats = heartBeats(c), gap = num(c.gap, 0.2) * 1000, n = beats.length;
      beats.forEach((t, i) => {
        const a = n > 1 ? 1 - 0.45 * (i / (n - 1)) : 1;
        win.setTimeout?.(() => rumble(110, 0.75 * a, 0.3 * a), t * 1000);
        win.setTimeout?.(() => rumble(80, 0.45 * a, 0.2 * a), t * 1000 + gap);
      });
    });
  } catch (e) { report('bus', e); }

  // ---- the frame
  function modeNow() {
    if (ctx.flow === 'intro') return 'intro';
    let blocking = false;
    try { blocking = ctx.ui?.isBlocking?.() === true; } catch { blocking = false; }
    if (ctx.flow === 'playing' && !blocking && !ctx.paused) return 'water';
    return 'menu';
  }
  function endWater() {
    if (S.aWater) { S.aWater = false; try { release(); } catch (e) { report('release', e); } }
    aim.on = false;
  }
  function water(dt) {
    // sail: the stick and the D-pad on top of the keys (main's move, read by the raft)
    let mx = L.x + (cur[PAD.RIGHT] - cur[PAD.LEFT]), my = L.y + (cur[PAD.UP] - cur[PAD.DOWN]);
    const m = Math.hypot(mx, my);
    if (m > 1) { mx /= m; my /= m; }
    if (input.move && m > 0) { input.move.x += mx; input.move.y += my; if (input.move.lengthSq?.() > 1) input.move.normalize(); }
    // the aim: ahead of the raft until the right stick turns it (camera-relative, as the pointer's up-screen is)
    if (S.aWater && (R.x || R.y)) {
      const cy = num(ctx.render?.getYaw?.(), 0), s = Math.sin(cy), c = Math.cos(cy);
      const x = c * R.x - s * R.y, z = -s * R.x - c * R.y, l = Math.hypot(x, z) || 1;
      aim.x = x / l; aim.z = z / l;
    }
    if (dn[PAD.A]) {
      const h = num(ctx.player?.heading, 0);
      aim.x = -Math.sin(h); aim.z = -Math.cos(h); aim.on = true;
      S.aWater = true;
      try { press(); } catch (e) { report('press', e); }
    }
    if (upE[PAD.A] && S.aWater) { S.aWater = false; try { release(); } catch (e) { report('release', e); } aim.on = false; }
    if (dn[PAD.START]) key('KeyP');
    else if (dn[PAD.Y]) key('KeyJ');
    else if (dn[PAD.X]) key('KeyB');
  }
  function menu(dt) {
    const scope = topScope();
    if (scope !== S.scope) { S.scope = scope; S.scopeT = 0; markFocus(null, false); S.back = null; S.letgo = null; twinFocusRules(); }
    S.scopeT++;
    if (!scope) return;
    const id = scope.dataset.modal || '';
    // the focus follows the UI's own moves (its arrows, a screen's first focus) and survives a re-render
    const act = doc.activeElement;
    if (S.active && S.focus && act && act !== S.focus && act !== doc.body && scope.contains(act) && act.matches?.(CAND)) markFocus(act, false);
    if (S.focus && (!S.focus.isConnected || !scope.contains(S.focus))) markFocus(S.active ? recover(scope) : null, S.active);
    if (S.active && !S.focus && (S.scopeT < 16 || (S.tick % 6) === 0)) { const d = defaultFocus(scope); if (d) markFocus(d); }   // (a new screen: at once)
    if (S.focus && S.active && !S.focus.classList.contains('gw-padfocus')) S.focus.classList.add('gw-padfocus');
    // move
    let dir = -1;
    if (cur[PAD.UP]) dir = UP; else if (cur[PAD.DOWN]) dir = DOWN; else if (cur[PAD.LEFT]) dir = LEFT; else if (cur[PAD.RIGHT]) dir = RIGHT;
    else dir = stickDir(L.x, L.y);
    const go = rep(dir, dt);
    if (go >= 0) move(scope, go);
    // scroll: the right stick
    if (R.y) { const sc = S.focus?.closest?.('.gw-scroll') || scope.querySelector('.gw-scroll'); if (sc) sc.scrollTop -= R.y * 900 * dt; }
    if (dn[PAD.A]) {
      if (busy()) { try { press(); } catch (e) { report('press', e); } }
      else if (S.focus && S.focus.isConnected) click(S.focus);
      else { const d = defaultFocus(scope); if (d) { markFocus(d); click(d); } else { const tap = scope.querySelector('.gw-modal-body > *'); if (tap) click(tap); else key('Enter'); } }
    }
    if (dn[PAD.B]) {
      const lg = id === 'catch' ? [...scope.querySelectorAll(LETGO)].find((e) => usable(e)) : null;
      if (lg) { S.letgo = lg; pointer(lg, 'pointerdown'); }
      else key('Escape');
    }
    if (upE[PAD.B] && S.letgo) { const lg = S.letgo; S.letgo = null; pointer(lg, 'pointerup'); if (lg.isConnected) click(lg); }
    if (dn[PAD.LB]) tab(scope, -1);
    if (dn[PAD.RB]) tab(scope, 1);
    if (dn[PAD.START]) key(id === 'pause' || id === 'homepause' || id === 'jetty' ? 'Escape' : 'KeyP');
    if (dn[PAD.Y]) {
      if (id === 'journal') key('Escape');
      else if (id === 'jetty') { const j = scope.querySelector('[data-tile=journal]'); if (j && usable(j)) { markFocus(j); click(j); } }
      else key('KeyJ');
    }
    if (dn[PAD.X]) key('KeyB');
  }

  function poll(dt = 1 / 60) {
    let list = null;
    try { list = nav?.getGamepads?.() || null; } catch { list = null; }
    const gp = firstPad(list);
    if (!gp) {
      if (S.lastPad) { S.lastPad = null; cur.fill(0); edges(cur, prev, dn, upE); endWater(); setActive(false); }
      return;
    }
    S.lastPad = gp;
    if (!S.seen) { S.seen = true; input.padSeen = true; }
    readPad(gp, cur, axes);
    const any = edges(cur, prev, dn, upE);
    deadZone(axes[0], axes[1], DEAD, L);
    deadZone(axes[2], axes[3], DEAD, R);
    if (any || L.x || L.y || R.x || R.y) setActive(true);
    S.tick++;
    const mode = modeNow();
    if (mode !== S.mode) { if (S.mode === 'water') endWater(); S.mode = mode; }
    if (mode === 'intro') { if (dn[PAD.A] || dn[PAD.B] || dn[PAD.START]) key('Escape'); showChips(false); return; }
    if (mode === 'water') { water(dt); showChips(false); return; }
    menu(dt);
    if ((S.tick % 6) === 0 || any || S.chipKey === '') updateChips(S.scope);
  }

  const api = {
    poll(dt) { try { poll(dt); } catch (e) { report('poll', e); } },
    state: S,
    debug: () => ({ seen: S.seen, active: S.active, mode: S.mode, scope: S.scope?.dataset?.modal ?? null, aim: { ...aim },
      focus: S.focus ? { cls: S.focus.className, text: (S.focus.textContent || '').trim().slice(0, 30), tile: S.focus.dataset?.tile ?? null, action: S.focus.dataset?.action ?? null } : null,
      chips: S.chips ? S.chips.map((c) => ({ on: c.classList.contains('gw-on'), t: c.style.transform })) : null, rumbles: S.rumbles,
      root: !!root()?.classList?.contains('gw-pad-on') }),
  };
  return api;
}
