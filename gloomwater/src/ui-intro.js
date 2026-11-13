// ui-intro.js — the opening cut scene on the DOM side (LANE B "director and flow"): the words, the Skip word, the ink veil and
// the reduced-motion cross-fade layer. docs/v3/intro/SPEC.md §2 (type), §7.2–§7.6, CONTRACT §13.13. Created by ui.js only on a v3
// build that carries INTRO; styles: the INTRO LANE B block of ui.css (.gw-intro-*).
//
// The view owns nothing of the film's time: every frame it reads the director's state (ctx.intro.state) and draws that moment.
//   the words      lineAt(t): Alegreya italic, pale ink on a feathered night-ink pool, one line at a time inside INTRO.words.band
//                  (never a box); each line is announced once through an aria-live region
//   the Skip word  skipWordAt(t): top right, a 44 px target, quiet; a press anywhere else only brightens it for INTRO.skip.poke s
//   the veil       the opening's ink dip veilAt(t); a skip's closing ink (state.skip.k) and, after `intro:done`, its opening on the
//                  play frame (INTRO.skip.veilOut, real time); the hard cut's dip under reduced flashing (cutDipAt)
//   the still      reduced motion: at each change of beat (`intro:beat`, emitted before the stage moves) the canvas is rendered
//                  and copied into a 2D layer that fades out over INTRO.stillFade; if the copy fails, ink dips (stillDipAt)
//   the curtain    curtain({in, out, onFull}): ink closes, `onFull` runs under one painted frame of full ink, ink opens (a
//                  replay putting the title's lake back, SPEC §7.4)
// While the film plays `#ui` carries `.gw-intro-on`: the HUD, toasts, tips, banners and any modal are hidden and take no press.
//
// API (createIntroView(K), K = the ui kit): update(dt) · sync() (draw the director's moment now: seeks) · curtain(o) ·
// poke() · isOn() · debug() -> {on, line, lineK, veil, skip, still, band, portrait, snapshots, closing}
import { lineAt, veilAt, skipWordAt, cutDipAt, stillDipAt } from './intro.js';

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;

/** The words band for a viewport (fractions of its height, top → bottom): the portrait band under aspect 1. Pure. */
export function wordsBand(INTRO, width, height) {
  const B = INTRO?.words?.band || {};
  const portrait = width > 0 && height > 0 && width / height < 1;
  const band = (portrait ? B.portrait : B.landscape) || [0.86, 0.95];
  return { portrait, top: band[0], bottom: band[1] };
}

/** The veil's opacity for a director state: the opening dip, a skip's closing ink, the cut's dip when calm, a still's dip. Pure. */
export function veilFor(INTRO, s, { snapshots = true } = {}) {
  if (!INTRO || !s) return 0;
  let k = veilAt(INTRO, s.t);
  if (s.skip && s.skip.mode === 'veil') k = Math.max(k, s.skip.k);
  if (s.calm && !s.reduced) k = Math.max(k, cutDipAt(INTRO, s.t));
  if (s.reduced && !snapshots) k = Math.max(k, stillDipAt(INTRO, s.t));
  return clamp01(k);
}

export function createIntroView(K) {
  const { ctx, root, h } = K;
  const I = () => ctx.data?.INTRO || null;
  const dir = () => (ctx.intro && typeof ctx.intro.isActive === 'function' ? ctx.intro : null);
  const report = (where, e) => { try { K.report?.(`intro.${where}`, e); } catch { /* ignore */ } };

  let el = null, veilEl = null, lineEl = null, textEl = null, liveEl = null, skipEl = null, stillEl = null;
  const V = { on: false, line: null, lineK: 0, veil: 0, skip: 0, pokeUntil: 0, still: null, snapshots: true, snapCount: 0,
    closing: null, curtain: null, band: null, w: 0, hgt: 0 };

  function build() {
    if (el) return;
    el = h('div', 'gw-intro');
    el.innerHTML = '<canvas class="gw-intro-still" aria-hidden="true"></canvas><div class="gw-intro-veil" aria-hidden="true"></div>'
      + '<p class="gw-intro-line" aria-hidden="true"><span></span></p><p class="gw-intro-live" aria-live="polite"></p>'
      + '<button class="gw-intro-skip" type="button" tabindex="-1"><span></span></button>';
    stillEl = el.querySelector('.gw-intro-still'); veilEl = el.querySelector('.gw-intro-veil');
    lineEl = el.querySelector('.gw-intro-line'); textEl = lineEl.firstChild; liveEl = el.querySelector('.gw-intro-live');
    skipEl = el.querySelector('.gw-intro-skip');
    const word = I()?.skip?.word || 'Skip';
    skipEl.firstChild.textContent = word;
    skipEl.setAttribute('aria-label', `${word} the opening`);
    // the Skip word: one tap, no confirm. The press never reaches the canvas (and so never the game)
    skipEl.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
    skipEl.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); try { (ctx.game?.skipIntro || dir()?.skip)?.(); } catch (err) { report('skip', err); } });
    root.appendChild(el);
    layout(true);
  }
  function layout(force = false) {
    if (!el) return;
    const w = globalThis.innerWidth || 0, hh = globalThis.innerHeight || 0;
    if (!force && w === V.w && hh === V.hgt) return;
    V.w = w; V.hgt = hh;
    const b = wordsBand(I(), w, hh);
    V.band = b;
    el.dataset.o = b.portrait ? 'portrait' : 'landscape';
    el.style.setProperty('--b0', `${(b.top * 100).toFixed(2)}%`);
    el.style.setProperty('--bh', `${((b.bottom - b.top) * 100).toFixed(2)}%`);
  }
  function setOpacity(node, k, key) {
    const v = Math.round(clamp01(k) * 1000) / 1000;
    if (V[key] === v) return;
    V[key] = v;
    node.style.opacity = String(v);
    node.style.visibility = v > 0.001 ? 'visible' : 'hidden';
  }
  function teardown() {
    V.on = false; V.closing = null; V.curtain = null; V.still = null; V.line = null;
    root.classList.remove('gw-intro-on');
    if (el) { el.remove(); el = veilEl = lineEl = textEl = liveEl = skipEl = stillEl = null; }
    V.lineK = V.veil = V.skip = 0;
  }
  function start() {
    teardown();
    build();
    V.on = true; V.snapshots = true; V.snapCount = 0; V.pokeUntil = 0;
    root.classList.add('gw-intro-on');
    draw();
  }

  // ---------------------------------------------------------------- reduced motion: the outgoing still, copied and faded out
  function snapshot(fade) {
    if (!V.snapshots || !stillEl) return false;
    try {
      const R = ctx.render, gl = R && !R.isStub ? (R.canvas || R.renderer?.domElement) : null;
      if (!gl || !gl.width || !gl.height) throw new Error('no canvas');
      // the drawing buffer is only readable in the task that drew it: draw the outgoing still once more, then copy it
      R.render?.();
      if (stillEl.width !== gl.width || stillEl.height !== gl.height) { stillEl.width = gl.width; stillEl.height = gl.height; }
      const c2 = stillEl.getContext('2d');
      c2.drawImage(gl, 0, 0);
      V.still = { t0: now(), fade: Math.max(0.05, fade) };
      V.snapCount++;
      stillEl.style.opacity = '1'; stillEl.style.visibility = 'visible';
      return true;
    } catch (e) {
      V.snapshots = false; V.still = null;   // from here on the changes are ink dips (stillDipAt)
      return false;
    }
  }
  function drawStill() {
    if (!stillEl) return;
    if (!V.still) { if (stillEl.style.visibility !== 'hidden') { stillEl.style.opacity = '0'; stillEl.style.visibility = 'hidden'; } return; }
    const k = 1 - (now() - V.still.t0) / V.still.fade;
    if (k <= 0) { V.still = null; stillEl.style.opacity = '0'; stillEl.style.visibility = 'hidden'; return; }
    stillEl.style.opacity = String(Math.round(k * 1000) / 1000);
  }

  // ---------------------------------------------------------------- one frame
  /** Draw the director's moment: the veil, the line, the Skip word. */
  function draw() {
    if (!el) return;
    const D = I(), d = dir(), s = d && d.isActive() ? d.state : null;
    layout();
    let veil = 0, lineK = 0, skipK = 0;
    if (s && D) {
      veil = veilFor(D, s, { snapshots: V.snapshots });
      const l = s.skip ? null : lineAt(D, s.t);
      if (l) {
        if (V.line !== l.i) { V.line = l.i; textEl.textContent = l.text; }
        lineK = l.k;
      } else V.line = null;
      skipK = s.skip ? 0 : skipWordAt(D, s.t);
    }
    const t = now();
    if (V.closing) {
      const c = V.closing, k = clamp01(1 - (t - c.t0) / c.dur);
      veil = Math.max(veil, c.veil * k); skipK = 0; lineK = 0;
    }
    if (V.curtain) veil = Math.max(veil, V.curtain.k);
    setOpacity(veilEl, veil, 'veil');
    setOpacity(lineEl, lineK, 'lineK');
    setOpacity(skipEl, skipK, 'skip');
    skipEl.classList.toggle('gw-poked', t < V.pokeUntil);
    drawStill();
  }

  function update(dt) {
    if (!V.on && !el) return;
    const d = dir(), t = now();
    if (V.curtain) {
      const c = V.curtain, step = Math.min(0.25, Math.max(0, Number(dt) || 0));
      if (c.phase === 'in') {
        if (c.painted) {   // one frame of full ink has been on screen: do the work, then open
          c.phase = 'out';
          const fn = c.onFull; c.onFull = null;
          try { fn?.(); } catch (e) { report('curtain', e); }
          root.classList.remove('gw-intro-on');
        } else { c.k = clamp01(c.k + step / c.in); if (c.k >= 1) c.painted = true; }
      } else { c.k = clamp01(c.k - step / c.out); if (c.k <= 0) { teardown(); return; } }
    } else if (V.closing) {
      if (t - V.closing.t0 >= V.closing.dur) { teardown(); return; }
    } else if (V.on && !(d && d.isActive())) {
      // the director was stopped with no event (back to the title, a wipe): nothing of the film stays on screen
      teardown(); return;
    }
    draw();
  }

  // ---------------------------------------------------------------- bus
  const on = (evt, fn) => { try { ctx.bus.on(evt, (p) => { try { fn(p || {}); } catch (e) { report(evt, e); } }); } catch (e) { report('bus', e); } };
  on('intro:start', () => start());
  on('intro:line', (p) => {
    if (!liveEl) return;
    // each line is read out once (the visible line is aria-hidden: its opacity is animated every frame)
    liveEl.textContent = p.i === null || p.i === undefined ? '' : String(p.text || '');
  });
  on('intro:beat', (p) => {
    const D = I(), d = dir(), s = d ? d.state : null;
    if (!V.on || !s || !s.reduced || !D || p.prev === null || p.prev === undefined || s.skip) return;
    // the hard cut is the short fade (SPEC §3); every other change of still takes INTRO.stillFade
    const cut = Math.abs(Number(p.t) - Number(D.cut?.at)) < 0.2;
    snapshot(cut ? Number(D.calm?.cutDip) || 0.3 : Number(D.stillFade) || 0.5);
  });
  on('intro:skip', () => { V.still = null; draw(); });
  on('intro:done', (p) => {
    if (!V.on) return;
    V.line = null; V.still = null;
    if (liveEl) liveEl.textContent = '';
    if (skipEl) skipEl.style.pointerEvents = 'none';
    if (V.curtain) { draw(); return; }   // main asked for a curtain on this same event: it owns the ending
    const D = I(), veilSkip = !!p.skipped && p.mode === 'veil';
    // the film is over: the game's own UI comes back now (under the opening ink after a veil skip)
    root.classList.remove('gw-intro-on');
    V.closing = { t0: now(), dur: veilSkip ? Number(D?.skip?.veilOut) || 0.35 : 0.25, veil: veilSkip ? 1 : V.veil };
    draw();
  });
  // a press anywhere but the Skip word only brightens it for a moment (SPEC §7.2)
  const poke = () => { if (V.on) V.pokeUntil = now() + (Number(I()?.skip?.poke) || 2); };
  try { globalThis.addEventListener?.('pointerdown', poke, { capture: true, passive: true }); } catch { /* no window */ }

  return {
    update,
    /** Draw the director's moment now (a seek; main's debug hook calls it so a held film shows its words without a frame). */
    sync() { if (dir()?.isActive() && !V.on) start(); draw(); },
    /**
     * Ink closes over `in` s, `onFull` runs once under a painted frame of full ink, ink opens over `out` s. Returns false (and
     * runs nothing) when the view cannot draw: the caller then does the work at once.
     */
    curtain({ in: tin = 0.15, out: tout = 0.15, onFull = null } = {}) {
      try {
        build();
        V.on = true; V.closing = null;
        root.classList.add('gw-intro-on');
        V.curtain = { phase: 'in', k: V.veil || 0, in: Math.max(0.01, tin), out: Math.max(0.01, tout), onFull, painted: (V.veil || 0) >= 1 };
        draw();
        return true;
      } catch (e) { report('curtain', e); return false; }
    },
    poke,
    isOn: () => V.on,
    debug: () => ({ on: V.on, line: V.line, lineK: V.lineK, veil: V.veil, skip: V.skip, still: !!V.still, snapshots: V.snapshots, snapCount: V.snapCount,
      closing: !!V.closing, curtain: V.curtain ? V.curtain.phase : null, band: V.band ? { ...V.band } : null, el: !!el }),
  };
}
