// ui-measure.js — the catch's moment on the ui's side (docs/v3/show/SPEC.md §2.9; DESIGN §25.6.8; CONTRACT §13.7b).
//
// The measuring overlay is retired. It was a band of night ink over the lower half of the frame: a sketch of the fish, a knotted
// cord, a ticking count, class words and a record banner, laid exactly over the Wick's hands and its fish. The show replaced it:
// from the fish breaking the surface (T0) until the catch card, NOTHING is written on the screen. What the overlay said moved
// onto the card (ui-screens showCatch): the length counts up beside the class stamp, the stamp presses after it, your best and
// the Old Ledger are two knots on the card's ruler line, the record is the card's kicker.
//
// This module keeps one duty: it knows when the show holds the screen (fishing.view.show is up and has not reached its card),
// so that ui.js holds the card, level-up pickers, toasts, tips and banners back, and the HUD stays off the picture. It also
// remembers where the card should unfold from (fishing:show {phase: 'card', origin}).
// `show` / `onMeasured` / `onLanded` stay as no-ops so older callers (ui.showMeasure) do nothing rather than throw.

export function createMeasure(K) {
  const { ctx, D } = K;
  const fishV = () => { const f = ctx.fishing; return f && !f.isStub ? f : null; };
  /** fishing.view.show while a show or its card is up (null otherwise, and always null with v3 off). */
  const view = () => {
    if (!D().V3_ENABLED) return null;
    const v = fishV()?.view?.show;
    return v && typeof v === 'object' && typeof v.phase === 'string' ? v : null;
  };
  /** The show holds the screen: from T0 until the card's turn. */
  const holding = () => { const v = view(); return !!v && v.phase !== 'card'; };
  let origin = null;   // where the card unfolds from: the held fish's centre on screen (CSS px), from fishing:show {card}
  try {
    ctx.bus.on('fishing:show', (p = {}) => {
      if (p.phase === 'card') origin = p.origin && Number.isFinite(p.origin.x) && Number.isFinite(p.origin.y) ? { x: p.origin.x, y: p.origin.y, uid: p.uid ?? null, at: performance.now() } : null;
      else if (p.phase === 'lift') origin = null;
    });
  } catch { /* bus optional */ }

  return {
    show() { /* the overlay is retired */ }, onMeasured() {}, onLanded() {},
    /** A tap on the picture hurries the show (fishing owns the rule and its floor). */
    skip: () => { try { return fishV()?.hurryShow?.() === true; } catch { return false; } },
    /** the catch card (and every other modal, toast, tip and banner) waits while the show holds the screen */
    holding,
    active: holding,
    /** The show's phase for the HUD: 'reveal' | 'lift' | 'hold' | 'pause' | 'card' | null. */
    phase: () => view()?.phase ?? null,
    /** The unfold's origin for the card that opens now (consumed once; null → the card opens from the screen's centre). */
    takeOrigin(uid = null) {
      const o = origin;
      origin = null;
      if (!o || performance.now() - o.at > 4000) return null;
      if (uid != null && o.uid != null && o.uid !== uid) return null;
      return { x: o.x, y: o.y };
    },
    reset() { origin = null; },
    debug: () => { const v = view(); return v ? { show: true, phase: v.phase, cls: v.cls, pose: v.pose, t: v.t, hurried: !!v.hurried, holding: holding() } : null; },
  };
}
