// ui-measure.js — the measuring overlay, the catch ceremony's payoff (DESIGN §25.6.8, §25.14.2 U3; CONTRACT §13.7 ui
// showMeasure). In the catch card's ink-wash language (direction C): a feathered band of night ink under the trophy camera's
// frame; the species name in IM Fell English SC; the fish as a pale ink sketch lying along a knotted cord that unrolls nose
// to tail while the centimetres tick up in pale-gold handwriting; the class bands of the species drawn as ink-wash tints under
// the cord, each class word lighting as the count crosses it; at the stamp, the class's seal pressed onto the last knot (Prize
// ink stamp, Trophy oxblood wax, Elder black wax with ribbon, Ancient gold thread) and the red class stamp beside the count; an
// Elder's name written in Cedarville pale gold; then the record banners ("New best: 112 cm (was 97)", "First Trophy Reedjaw",
// "Old Ledger beaten") at the top of the screen.
//
// Two drivers, one drawing:
//   F5 (fishing's ceremony): fishing calls ui.showMeasure(view.measure) when the scoop starts and mutates that live object
//      (phase scoop → pose → cord → banners → card, k, count, records, seal, name, skippable); ctx.cinematic is set, so the
//      overlay is NOT blocking (fishing needs its dt); a tap calls fishing.skipCeremony() (an Elder's after 0.6 s).
//   Without it (fishing measured at once: fish:measured then fish:landed in one tick): the overlay runs the same plan itself
//      (ui-v3 measurePlan: Small / Keeper 1.2 s, Prize 2.4, Trophy 3.5, Elder 5; 1.2 s in a swarm window) as a blocking
//      modal, so survival and combat hold still as the ceremony would hold them, and the card waits until it ends.
// Either way the card (ui-screens showCatch) opens only when the overlay is done (holding()).
// Automatic fishing (U2′, AUTOFISH.ceremony): the cord carries two knots, your PB (oxblood) and the Old Ledger (black); passing your
// PB knot plays a sting, and a Small / Keeper ceremony that passes it stretches to 2.4 s (the overlay's own plan; fishing's F5 plan
// is fishing's).
import { sealSvg } from './ui-icons.js';
import { drawFishInk } from './ui-fishart.js';
import * as V from './ui-v3.js';

const WASH_D = 'M30 30 C220 10 780 12 970 32 C988 120 986 196 968 262 C760 280 240 280 34 264 C14 196 16 110 30 30 Z';
const WASH_PHONE = 'M16 24 C120 8 260 10 364 26 C376 120 374 230 362 318 C250 332 120 332 20 320 C8 230 8 120 16 24 Z';

export function createMeasure(K) {
  const { ctx, D, h, esc, num, arr, safe, run } = K;
  let cur = null;
  const fishV = () => { const f = ctx.fishing; return f && !f.isStub ? f : null; };
  const liveMeasure = () => { const m = fishV()?.view?.measure; return m && typeof m === 'object' ? m : null; };
  const speciesOf = (id) => K.speciesData(id) || { id, name: String(id || 'A fish').replace(/_/g, ' '), rarity: 'common' };
  const enabled = () => !!D().V3_ENABLED && (ctx.flow === 'playing' || ctx.flow === 'hub');

  // ------------------------------------------------------------------ start
  /** F5: fishing's ceremony began (view.measure is live). */
  function show(m) {
    if (!enabled() || !m || typeof m !== 'object') return;
    if (cur && !cur.done && cur.f5 && cur.m === m) return;
    const sp = speciesOf(m.speciesId);
    const j = K.meta().journal?.[sp.id];
    start({ f5: true, m, speciesId: sp.id, length: num(m.length), sizeClass: m.sizeClass || 'keeper', ancient: !!m.ancient,
      legendary: !!m.legendary || sp.rarity === 'legendary', name: m.name || '', records: arr(m.records), uid: m.uid ?? null,
      isNew: !(num(j?.caught) > 0), best: num(j?.pbLength, 0) || null, short: !!m.short });
  }
  /** fish:measured (every v3 landing): the stamp of a ceremony on screen, or a landing measured at once (no F5). */
  function onMeasured(p = {}) {
    if (!enabled() || !(num(p.length) > 0) || !p.speciesId) return;
    const uid = p.fish?.uid ?? null;
    if (cur && !cur.done && (cur.uid === uid || (cur.f5 && cur.speciesId === p.speciesId))) {
      cur.records = arr(p.records); cur.name = p.name || cur.name;
      const pb = cur.records.find((r) => r?.kind === 'pb');
      if (pb && pb.prevLength != null) cur.best = num(pb.prevLength);
      cur.recsDirty = true;
      return;
    }
    // a ceremony running without having called showMeasure (feature-detected): follow it
    const m = liveMeasure();
    if (ctx.cinematic && m && m.phase !== 'card') { show(m); if (cur) { cur.records = arr(p.records); cur.recsDirty = true; } return; }
    const sp = speciesOf(p.speciesId);
    const recs = arr(p.records);
    const pb = recs.find((r) => r?.kind === 'pb');
    const j = K.meta().journal?.[sp.id];
    const short = !!safe(() => ctx.combat?.swarmActive, false);
    start({ f5: false, m: null, speciesId: sp.id, length: num(p.length), sizeClass: p.sizeClass || 'keeper', ancient: !!p.ancient,
      legendary: sp.rarity === 'legendary', name: p.name || '', records: recs, uid, isNew: num(j?.caught) === 1 && !pb,
      best: pb && pb.prevLength != null ? num(pb.prevLength) : (num(j?.pbLength, 0) || null), short });
  }
  /** fish:landed follows at once with isNew (the card's queue holds it until the overlay ends). */
  function onLanded(p = {}) {
    if (!cur || cur.done) return;
    if ((p.fish?.uid ?? null) === cur.uid || p.fish?.speciesId === cur.speciesId) { if (typeof p.isNew === 'boolean' && p.isNew !== cur.isNew) { cur.isNew = p.isNew; cur.recsDirty = true; } }
  }

  function start(o) {
    if (cur && !cur.done) finish(true);
    const sp = speciesOf(o.speciesId);
    const zone = run()?.zone || sp.zone || null;
    const cls = o.legendary ? 'legend' : o.sizeClass;
    const ci = o.legendary ? { id: 'legend', label: 'Legend', seal: 'blackWaxRibbon', ancient: true } : (V.classInfo(D(), o.sizeClass, o.ancient) || { id: o.sizeClass, label: o.sizeClass, seal: null });
    const ruler = V.cordRuler(D(), sp, o.length, { zone, best: o.best });
    const af = !!D().AUTOFISH && !!D().V3_ENABLED;
    const plan = V.measurePlan(D(), { sizeClass: o.sizeClass, legendary: o.legendary, short: o.short, pbPass: af && ruler.passesBest });
    cur = { ...o, sp, zone, cls, ci, plan, ruler, af, t: 0, laid: false, stamped: false, done: false, closing: 0, lit: new Set(), recsShown: false, recsDirty: false, entry: null, els: null, lastCount: -1, stung: false };
    cur.entry = K.openModal('measure', (entry, body) => build(entry, body), {
      screen: true, blocking: !o.f5, dismissable: false, focus: false, quiet: true, cls: 'gw-m-measure',
      onEscape: () => skip(), onKey: (code) => { if (code === 'Space' || code === 'Enter' || code === 'NumpadEnter' || code === 'Escape') { skip(); return true; } return false; },
      state: { measure: true },
    });
    if (cur.entry) cur.entry.tick = (dt) => tick(dt);
  }

  // ------------------------------------------------------------------ drawing
  function build(entry, body) {
    const c = cur;
    if (!c) return;
    const phone = K.vw < 700;
    const legend = c.legendary;
    const zn = K.zoneData(c.zone)?.name || '';
    const unit = c.length < num(D().BALANCE?.ceremony?.mmBelow, 20) ? 'mm' : c.length >= 1000 ? 'm' : 'cm';
    const wrap = h('div', `gw-ms gw-cls-${esc(c.cls)}${c.ancient ? ' gw-ancient' : ''}${legend ? ' gw-legend' : ''}${c.f5 ? ' gw-ms-f5' : ''}${!legend && !c.ci.seal ? ' gw-noseal' : ''}`);
    const pct = (cm) => Math.max(0, Math.min(100, (cm / c.ruler.max) * 100));
    const bands = c.ruler.bands.map((b) => `<rect class="gw-msb gw-msb-${esc(b.cls)}" x="${(pct(b.from) * 10).toFixed(1)}" y="15" width="${((pct(b.to) - pct(b.from)) * 10).toFixed(1)}" height="30" rx="6"/>`).join('');
    const knots = c.ruler.knots.map((cm, i) => `<i class="gw-ms-knot${c.ruler.marks.some((mk) => Math.abs(mk.cm - cm) < c.ruler.step * 0.34) ? ' gw-atmark' : ''}" data-cm="${cm}" style="left:${pct(cm).toFixed(2)}%;--i:${i}"></i>`).join('');
    const marks = c.ruler.marks.map((mk) => `<span class="gw-ms-mark gw-msm-${esc(mk.cls)}" data-cm="${mk.cm}" style="left:${pct(mk.cm).toFixed(2)}%"><i></i><b>${esc(mk.label)}</b></span>`).join('');
    // the cord's two knots (AUTOFISH.ceremony.cordMarks): your PB in oxblood, the Old Ledger's old figure in black
    // a knot under the fish (the fish passes it) writes its word below the cord, so the sketch stays clear
    const best = c.ruler.best ? `<span class="gw-ms-best${c.af ? ` gw-ms-pb${c.ruler.passesBest ? ' gw-under' : ''}` : ''}" style="left:${pct(c.ruler.best).toFixed(2)}%"><i></i><b>${c.af ? 'your best' : 'best'}</b></span>` : '';
    const ledger = c.af && c.ruler.ledger ? `<span class="gw-ms-ledger${c.ruler.passesLedger ? ' gw-under' : ''}" style="left:${pct(c.ruler.ledger).toFixed(2)}%"><i></i><b>Old Ledger</b></span>` : '';
    const seal = !legend && c.ci.seal ? sealSvg(c.ci.seal, { ancient: c.ci.ancient, cls: 'gw-ms-sealsvg' }) : legend ? sealSvg('blackWaxRibbon', { ancient: true, cls: 'gw-ms-sealsvg' }) : '';
    // declutter: "tap to skip" for the first three ceremonies only (a tap still skips after that)
    const mt = K.meta?.() || {};
    mt.seenTips = mt.seenTips || {};
    const skipN = Number(mt.seenTips.ui_msskip) || 0;
    const skipHint = skipN < 3;
    if (skipHint) mt.seenTips.ui_msskip = skipN + 1;
    wrap.innerHTML = `<div class="gw-ms-recs" aria-live="polite"></div>
      <div class="gw-ms-band">
        <svg class="gw-ms-wash" viewBox="0 0 ${phone ? '380 340' : '1000 290'}" preserveAspectRatio="none" aria-hidden="true">${legend ? `<path class="gw-ms-gild" filter="url(#gw-ink-edge)" d="${phone ? WASH_PHONE : WASH_D}"/>` : ''}<path filter="url(#gw-ink-edge)" d="${phone ? WASH_PHONE : WASH_D}"/></svg>
        <div class="gw-ms-head">
          <div class="gw-ms-id"><div class="gw-ms-k">${legend ? 'A legend, measured' : `Measured${zn ? ` in ${esc(zn.replace(/^The /, 'the '))}` : ''}`}</div>
            <div class="gw-ms-name">${esc(c.sp.name)}</div><div class="gw-ms-elder"></div></div>
          <div class="gw-ms-res"><div class="gw-ms-stamp"><span>${esc(c.ci.label)}</span></div>
            <div class="gw-ms-count"><b>0</b><small>${unit}</small></div></div>
        </div>
        <div class="gw-ms-ruler">
          <div class="gw-ms-fishbox"><canvas class="gw-ms-fish gw-ms-fish-ghost"></canvas><div class="gw-ms-ink"><canvas class="gw-ms-fish"></canvas></div></div>
          <svg class="gw-ms-cord" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
            <defs><clipPath id="gw-ms-clip"><rect class="gw-ms-cliprect" x="0" y="0" width="0" height="60"/></clipPath></defs>
            <g class="gw-ms-bands">${bands}</g>
            <path class="gw-ms-ghost" d="M0 30 H1000" vector-effect="non-scaling-stroke"/>
            <g clip-path="url(#gw-ms-clip)"><path class="gw-ms-rope gw-ms-rope-a" d="M0 30 H1000" vector-effect="non-scaling-stroke"/><path class="gw-ms-rope gw-ms-rope-b" d="M0 30 H1000" vector-effect="non-scaling-stroke"/></g>
          </svg>
          <i class="gw-ms-knot gw-ms-knot0" style="left:0%"></i>${knots}
          <div class="gw-ms-marks">${marks}${best}${ledger}</div>
          <i class="gw-ms-bead"></i>
          <div class="gw-ms-seal">${seal}</div>
        </div>
        <div class="gw-ms-skip">${skipHint ? (K.isTouch ? 'tap to skip' : 'click or Space to skip') : ''}</div>
      </div>`;
    body.appendChild(wrap);
    c.laid = false; c.marksLaid = false; c.lastCount = -1;
    wrap.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); skip(); });
    const q = (s) => wrap.querySelector(s);
    c.els = { wrap, band: q('.gw-ms-band'), count: q('.gw-ms-count b'), clip: q('.gw-ms-cliprect'), bead: q('.gw-ms-bead'), fish: q('.gw-ms-ink .gw-ms-fish'), ghost: q('.gw-ms-fish-ghost'), ink: q('.gw-ms-ink'), fishbox: q('.gw-ms-fishbox'),
      ruler: q('.gw-ms-ruler'), seal: q('.gw-ms-seal'), stamp: q('.gw-ms-stamp'), elder: q('.gw-ms-elder'), recs: q('.gw-ms-recs'), skip: q('.gw-ms-skip'),
      knots: [...wrap.querySelectorAll('.gw-ms-knot[data-cm]')], marks: [...wrap.querySelectorAll('.gw-ms-mark')], pb: q('.gw-ms-pb'), ledger: q('.gw-ms-ledger'), unit };
    // a re-render mid-ceremony picks up where the band was
    if (c.t > 0) wrap.classList.add('gw-in');
    if (c.stamped) { c.stamped = false; c.recSig = null; stampNow(c); }
  }
  /** The fish sketch, nose to tail along the cord's first L cm (drawn once the band has a width). */
  function layFish(c) {
    const E = c.els;
    const W = E.ruler.clientWidth;
    if (!(W > 40)) return false;
    c.laid = true;
    const frac = Math.min(1, c.length / c.ruler.max);
    const fw = Math.max(24, Math.round(W * frac));
    const maxH = Math.max(40, Math.min(K.vw < 700 ? 96 : 124, E.ruler.clientHeight - 66));
    try {
      const src = document.createElement('canvas');
      drawFishInk(src, c.sp, { w: fw, h: Math.round(fw * 0.5), pad: 0.02, color: c.legendary ? '#efd9a6' : '#ece8f4' });
      // crop to the drawing's own extent so its nose and tail sit on the cord's 0 and L
      const g = src.getContext('2d');
      const Wd = src.width, Hd = src.height;
      const d = g.getImageData(0, 0, Wd, Hd).data;
      let x0 = Wd, x1 = -1, y0 = Hd, y1 = -1;
      for (let y = 0; y < Hd; y++) for (let x = 0; x < Wd; x++) if (d[(y * Wd + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 <= x0 || y1 <= y0) return true;
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      let cw = fw, ch = fw * (bh / bw);
      if (ch > maxH) { cw = cw * (maxH / ch); ch = maxH; }   // a round fish keeps its shape: it sits inside its own length
      for (const out of [E.fish, E.ghost]) {
        out.width = bw; out.height = bh;
        out.getContext('2d').drawImage(src, x0, y0, bw, bh, 0, 0, bw, bh);
        out.style.width = `${cw.toFixed(1)}px`; out.style.height = `${ch.toFixed(1)}px`;
      }
      E.fishbox.style.width = `${fw}px`;
      E.fishbox.style.height = `${Math.max(ch, 20).toFixed(1)}px`;
    } catch (e) { K.report('measure fish', e); }
    return true;
  }
  /** The class words under the cord: where two would touch (a short species' close classes on a phone), the second drops to a
   *  lower row on a longer tick, so every word stays legible. */
  function layMarks(c) {
    const E = c.els;
    const W = E.ruler.clientWidth;
    if (!(W > 40)) return;
    c.marksLaid = true;
    const rows = V.labelRows(E.marks.map((mk) => ({ x: (num(Number(mk.dataset.cm)) / c.ruler.max) * W, w: mk.querySelector('b')?.offsetWidth || 0 })));
    E.marks.forEach((mk, i) => mk.classList.toggle('gw-row1', rows[i] === 1));
    E.wrap.classList.toggle('gw-ms-2rows', rows.includes(1));
  }
  const fmtCount = (c, cm) => {
    if (c.els.unit === 'mm') return String(Math.round(cm * 10));
    if (c.els.unit === 'm') return (cm / 100).toFixed(2);
    return String(Math.round(cm));
  };

  // ------------------------------------------------------------------ frame
  function tick(dt) {
    const c = cur;
    if (!c || !c.els) return;
    if (c.done) {
      c.closing -= dt;
      if (c.closing <= 0) { K.closeModal('measure'); if (cur === c) cur = null; }
      return;
    }
    if (!c.laid) layFish(c);
    if (!c.marksLaid) layMarks(c);
    // where the ceremony stands: fishing's live view (F5), or the overlay's own clock
    let st;
    if (c.f5) {
      const m = liveMeasure();
      const live = m && m === c.m ? m : (m && (m.uid ?? null) === c.uid ? m : null);
      if (!live || live.phase === 'card' || !ctx.cinematic) { if (live?.records) c.records = arr(live.records); stampNow(c); finish(false); return; }
      c.t = num(live.t, c.t + dt);
      const phase = live.phase || 'scoop';
      const k = num(live.k, 0);
      const count = phase === 'banners' ? c.length : num(live.count, 0);
      st = { phase, k, count, stamped: phase === 'banners' };
      if (live.name) c.name = live.name;
      if (Array.isArray(live.records) && live.records !== c.liveRecs) { c.liveRecs = live.records; c.records = live.records; c.recsDirty = true; }
      c.skippable = live.skippable !== false && (live.skippable === true || V.measureSkippable(c.plan, c.t));
    } else {
      c.t += dt;
      st = V.measureAt(c.plan, c.t, c.length);
      c.skippable = V.measureSkippable(c.plan, c.t);
      if (st.phase === 'card') { stampNow(c); finish(false); return; }
    }
    const E = c.els;
    E.wrap.classList.toggle('gw-in', true);
    E.wrap.classList.toggle('gw-pose', st.phase !== 'scoop');
    E.wrap.classList.toggle('gw-cording', st.phase === 'cord' || st.phase === 'banners');
    E.wrap.classList.toggle('gw-can-skip', !!c.skippable);
    // the cord: its head at the count, the knots it has passed, the class words it crossed
    const count = Math.max(0, Math.min(c.length, st.count));
    if (Math.abs(count - c.lastCount) > 1e-3) {
      c.lastCount = count;
      const p = Math.max(0, Math.min(1, count / c.ruler.max));
      E.clip.setAttribute('width', (p * 1000).toFixed(1));
      E.bead.style.left = `${(p * 100).toFixed(2)}%`;
      E.count.textContent = fmtCount(c, count);
      const fp = c.length > 0 ? Math.max(0, Math.min(1, count / c.length)) : 1;
      E.ink.style.clipPath = `inset(-30% ${((1 - fp) * 100).toFixed(1)}% -30% -2%)`;
      for (const kn of E.knots) if (!kn.classList.contains('gw-on') && num(Number(kn.dataset.cm)) <= count + 1e-6) kn.classList.add('gw-on');
      for (const mk of E.marks) {
        if (c.lit.has(mk) || num(Number(mk.dataset.cm)) > count + 1e-6) continue;
        c.lit.add(mk); mk.classList.add('gw-hit');
      }
      // passing your PB knot: the knot flares and a sting plays (once); the Old Ledger's knot only darkens as it is passed
      if (c.af && E.pb && c.ruler.passesBest && !c.stung && count > c.ruler.best + 1e-6) { c.stung = true; E.pb.classList.add('gw-passed'); pbSting(); }
      if (c.af && E.ledger && count >= c.ruler.ledger - 1e-6) E.ledger.classList.add('gw-passed');
    }
    if (st.stamped) stampNow(c);
    if (c.recsDirty && c.stamped) paintRecords(c);
  }
  /** The PB sting (audio's pb_sting when it has one; otherwise a high class chime). */
  function pbSting() {
    const a = ctx.audio && !ctx.audio.isStub ? ctx.audio : null;
    if (!a) return;
    if (!safe(() => a.play?.('pb_sting', { force: true }), false)) safe(() => a.play?.('class_chime', { pitch: 1.5, cls: 'trophy', force: true }), false);
  }
  function stampNow(c) {
    if (!c.els || c.stamped) return;
    c.stamped = true;
    const E = c.els;
    if (c.af && E.pb && c.ruler.passesBest) { E.pb.classList.add('gw-passed'); if (!c.stung) { c.stung = true; pbSting(); } }
    if (c.af && E.ledger && c.ruler.passesLedger) E.ledger.classList.add('gw-passed');
    E.count.textContent = fmtCount(c, c.length);
    E.clip.setAttribute('width', ((Math.min(1, c.length / c.ruler.max)) * 1000).toFixed(1));
    E.ink.style.clipPath = 'inset(-30% -2% -30% -2%)';
    for (const kn of E.knots) if (num(Number(kn.dataset.cm)) <= c.length) kn.classList.add('gw-on');
    for (const mk of E.marks) if (num(Number(mk.dataset.cm)) <= c.length) mk.classList.add('gw-hit');
    E.bead.style.left = `${((Math.min(1, c.length / c.ruler.max)) * 100).toFixed(2)}%`;
    E.seal.style.left = E.bead.style.left;
    if (c.name) { E.elder.textContent = `“${c.name}”`; }
    E.wrap.classList.add('gw-stamped');
    c.recsDirty = true;
    paintRecords(c);
  }
  function paintRecords(c) {
    c.recsDirty = false;
    if (c.name && c.els.elder.textContent !== `“${c.name}”`) c.els.elder.textContent = `“${c.name}”`;
    // the landing's payoff: one short ink banner (the best of the records), no sub-line; the card keeps the rest
    const lines = V.recordLines(D(), { records: c.records, isNew: c.isNew, species: c.sp, length: c.length, max: 1 });
    const sig = lines.map((l) => l.kind + l.text).join('|');
    if (sig === c.recSig) return;
    c.recSig = sig;
    c.els.recs.innerHTML = lines.map((l, i) => `<div class="gw-ms-rec gw-tone-${esc(l.tone)}" style="--i:${i}"><b>${esc(l.text)}</b><svg class="gw-ms-rec-u" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true"><path pathLength="100" filter="url(#gw-brush)" d="M3 9 C30 4 70 4 97 8"/></svg></div>`).join('');
  }

  // ------------------------------------------------------------------ skip / finish
  function skip() {
    const c = cur;
    if (!c || c.done) return false;
    if (!c.skippable && !V.measureSkippable(c.plan, c.t)) { const b = c.els?.band; if (b) { b.classList.remove('gw-nope'); void b.offsetWidth; b.classList.add('gw-nope'); } return false; }
    if (c.f5) {
      const ok = safe(() => ctx.fishing?.skipCeremony?.(), null);
      if (ok === false) return false;
      if (ok === null && liveMeasure() && ctx.cinematic) return false;   // no skip API: the ceremony runs its course
    }
    stampNow(c);
    finish(false, 0.18);
    return true;
  }
  /** The overlay's turn is over: fade out, then the card (instant: a new ceremony replaced it). */
  function finish(instant, fade = 0.42) {
    const c = cur;
    if (!c || c.done) return;
    c.done = true;
    c.closing = instant ? 0 : fade;
    c.els?.wrap.classList.add('gw-out');
    if (instant) { K.closeModal('measure', { instant: true }); cur = null; }
  }

  return {
    show, onMeasured, onLanded, skip,
    /** the catch card waits while the overlay (or fishing's ceremony) holds the screen */
    holding: () => !!(cur && !cur.done) || (!!D().V3_ENABLED && !!ctx.cinematic && !!liveMeasure() && liveMeasure().phase !== 'card'),
    active: () => !!(cur && !cur.done),
    reset() { if (cur) { finish(true); } cur = null; },
    debug: () => (cur ? { t: Math.round(cur.t * 100) / 100, plan: cur.plan, cls: cur.cls, f5: cur.f5, stamped: cur.stamped, done: cur.done, length: cur.length, max: cur.ruler.max, records: arr(cur.records).map((r) => r?.kind), skippable: !!cur.skippable,
      knots: cur.af ? { pb: cur.ruler.best, ledger: cur.ruler.ledger, passesBest: cur.ruler.passesBest, stung: cur.stung } : null } : null),
  };
}
