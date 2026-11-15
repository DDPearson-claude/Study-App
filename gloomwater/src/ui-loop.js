// ui-loop.js — the Full Hold's screens (docs/loop/SPEC.md §8, slice-1a/PLAN.md §2.3 items 2 and 10; lane C): the hold row and the
// Home pill on the water, the Jetty, Murk's tally, Murk's shelf, the Chart (a list in 1a), the home pause, Murk's lines and the
// first trip's two tips. Created by ui.js only when data.LOOP_ENABLED (ui.loop), so the v1 and v3 builds never build any of it.
// Every word is TEXT_LOOP's (or a built word SPEC §8 names: a species, a water, a Wick, a tip), read directly from the data;
// every neighbour (ctx.progression.loop, ctx.game.*) is read through optional chaining (PLAN §3's stub rule).
// Drowned Filigree throughout: no boxes, no frames; ink on a feathered pool of night; hook curls on the chosen word; one warm
// light (the clam's gold, the Jetty's lamp) in a cold world. Nothing is ever drawn in world space, and never round the raft.
//
// Pure exports (node: tools/tests/ui-loop.test.mjs): slotCells · tallyPlan · goalLine · shelfCards · murkLineFor · clamTag ·
// pillHold · chartModel · titleModel · descentModel · LOOP_MODALS · tripKeySwallow · journalFirst · journalModel ·
// settingsWords · castTipDue · strikeTipText · allowedWords · textAllowed · chartVignette · scaleSvg
import { icon, ORN, murkPortrait } from './ui-icons.js';
import { drawFishInk } from './ui-fishart.js';
import { fmtClams } from './core.js';
import { createLoopTutorial, murkLineFor } from './loop-tutorial.js';

export { murkLineFor };

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const arr = (v) => (Array.isArray(v) ? v : []);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const spOf = (D, id) => D?.SPECIES_BY_ID?.[id] || arr(D?.SPECIES).find((s) => s?.id === id) || null;
const T_ = (D) => D?.TEXT_LOOP || {};

// ================================================================== pure helpers
/** The size of a kept fish's glyph in its slot, by class (PLAN §2.3: Small 0.7 … Elder 1.2). */
export const CLASS_SCALE = Object.freeze({ small: 0.7, keeper: 0.82, prize: 0.94, trophy: 1.06, elder: 1.2 });
/**
 * The hold row's cells (SPEC §8.1): exactly hold.slots cells (the Wick's count: loop.hold().slots, Tallow one more; the view never
 * tests the Wick), the first ones holding the kept fish in the order caught. A cell: {i, filled, uid, speciesId, sizeClass, scale,
 * gild} (gild: a giant, a legend or an epic fish wears the gold edge).
 */
export function slotCells(hold, { D = null } = {}) {
  const fish = arr(hold?.fish).filter(isObj);
  const n = Math.max(0, Math.floor(num(Number(hold?.slots), 0)), fish.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const f = fish[i];
    if (!f) { out.push({ i, filled: false }); continue; }
    const sp = spOf(D, f.speciesId);
    const r = sp?.rarity || f.rarity || null;
    out.push({ i, filled: true, uid: f.uid ?? null, speciesId: f.speciesId ?? null, sizeClass: f.sizeClass ?? null,
      scale: CLASS_SCALE[f.sizeClass] ?? CLASS_SCALE.keeper, gild: f.giant === true || f.legendary === true || r === 'legendary' || r === 'epic' });
  }
  return out;
}

/** A price with the clam glyph: "<clam> 9,999", "<clam> 12.4k" (core.fmtClams). */
export function clamTag(n, { cls = '' } = {}) {
  return `<span class="gw-price gw-clams${cls ? ` ${cls}` : ''}">${icon('clam')}<b>${escH(fmtClams(Math.max(0, Math.round(num(Number(n), 0)))))}</b></span>`;
}

/** The Home pill's press and hold (SPEC §8.1): 0.6 s fills the ring and goes home; a full hold needs only a tap. Pure. */
export const PILL_HOLD = 0.6;
export function pillHold(t, full = false, { hold = PILL_HOLD } = {}) {
  const k = full ? 1 : clamp01(num(t, 0) / Math.max(1e-6, hold));
  return { k, fire: full === true || num(t, 0) >= hold - 1e-9 };
}

/**
 * The Jetty's goal line (SPEC §8.3): "Next: {name} · {price}" for loop.goal() (the cheapest unbought item), null for none. A hold
 * step names the slots it gives THIS Wick (WICKS §2.4: data.wickSlots of the step; Tallow at the start "Next: Hold 5 · 30"); a tier
 * keeps its TACKLE name. Returns {text, name, price, priceText, html} (html: the price wears the clam glyph).
 */
export function goalLine(goal, { D = null, wick = null } = {}) {
  if (!isObj(goal) || !Number.isFinite(Number(goal.price))) return null;
  const TL = T_(D);
  const isHold = goal.slot === 'hold' || String(goal.id || '').startsWith('hold:');
  const level = Number.isFinite(Number(goal.level)) ? Number(goal.level) : Number(String(goal.id || '').split(':')[1]);
  const slots = isHold ? (typeof D?.wickSlots === 'function' ? D.wickSlots(level, wick) : level) : null;
  const name = isHold ? String(TL.holdName || 'Hold {n}').replace('{n}', String(slots)) : String(goal.name || '');
  if (!name) return null;
  const price = Math.max(0, Math.round(Number(goal.price)));
  const priceText = fmtClams(price);
  const tpl = String(TL.next || 'Next: {name} · {price}');
  const text = tpl.replace('{name}', name).replace('{price}', priceText);
  const [a, b = ''] = tpl.split('{price}');
  const html = `${escH(a.replace('{name}', name))}${icon('clam')}<b>${escH(priceText)}</b>${escH(b)}`;
  return { text, name, price, priceText, html, id: goal.id ?? null };
}

/**
 * Murk's shelf as cards (SPEC §8.4, PLAN CHOICEs 11 and 26), from loop.shelf(): only the tabs with an item, in their order; each
 * card {id (the buy id, data-buy), name, line, price, priceText, dear (too dear: the price dimmed, no other words), bought (the
 * button reads "Yours."), slot, level, art (its glyph)}. The tab words are TEXT_LOOP.tabs'.
 */
const TAB_ICON = { tackle: 'rod', raft: 'hull', bait: 'worm', maps: 'map', home: 'hearth' };
const ART = { rod: 'rod', line: 'line', reel: 'reel', hold: 'creel' };
export function shelfCards(shelf, { D = null, clams = 0 } = {}) {
  const TL = T_(D);
  const tabs = arr(shelf?.tabs).filter((t) => isObj(t) && arr(t.items).length);
  return {
    tabs: tabs.map((t) => ({
      id: t.id, label: TL.tabs?.[t.id] || t.id, icon: TAB_ICON[t.id] || 'star',
      cards: arr(t.items).filter(isObj).map((it) => {
        const price = Math.max(0, Math.round(num(Number(it.price), 0)));
        const bought = it.bought === true;
        return { id: String(it.id), name: String(it.name || ''), line: String(it.line || ''), price, priceText: fmtClams(price),
          dear: !bought && num(Number(clams), 0) < price, bought, slot: it.slot ?? null, level: it.level ?? null, art: ART[it.slot] || 'star',
          buyWord: bought ? (TL.yours || 'Yours.') : null };
      }),
    })),
  };
}

/**
 * The tally's plan (SPEC §8.3; pounds): Murk's scale takes the fish one by one, lightest first and heaviest last by the weight the
 * card showed (data.weightOz of data.fishWeight; two that read the same by value, then in the order caught), legends after them and
 * a giant last of all, alone, with a longer pause. Each row: {uid, speciesId, name, weight (fmtWeight), oz, clams, base, first,
 * giant, legend, sizeClass, at (it settles on the pan), countAt, countDur, ticks ([base, clams] for a first: two ticks, the base
 * then the sale; else [clams])}; then the total (+N, gold) at totalAt and the end. An empty hold: Murk's empty line. Pure.
 */
export const TALLY_PACE = Object.freeze({ start: 0.6, row: 0.95, firstExtra: 0.55, count: 0.45, second: 0.35, giantPause: 0.85, giantCount: 0.9, giantAfter: 0.6, total: 0.4, end: 0.55 });
export function tallyPlan(tally, { D = null, pace = {} } = {}) {
  const P = { ...TALLY_PACE, ...(isObj(pace) ? pace : {}) };
  const lines = arr(tally?.lines).filter(isObj);
  const wOz = (l) => {
    const sp = spOf(D, l.speciesId);
    if (typeof D?.weightOz === 'function' && typeof D?.fishWeight === 'function') return D.weightOz(D.fishWeight(sp, l));
    return num(Number(l.length), 0);
  };
  const keyed = lines.map((l, i) => ({ l, i, oz: wOz(l), g: l.giant === true ? 2 : l.legend === true ? 1 : 0 }));
  keyed.sort((a, b) => a.g - b.g || a.oz - b.oz || num(a.l.clams) - num(b.l.clams) || a.i - b.i);
  let t = P.start;
  const rows = keyed.map(({ l, oz }) => {
    const sp = spOf(D, l.speciesId);
    const clams = Math.max(0, Math.round(num(Number(l.clams), 0)));
    const base = Number.isFinite(Number(l.base)) ? Math.max(0, Math.round(Number(l.base))) : clams;
    const first = l.first === true && clams > base;
    const big = l.giant === true || l.legend === true;
    if (big) t += P.giantPause;
    const at = t, countAt = at + 0.25, countDur = big ? P.giantCount : P.count;
    const row = { uid: l.uid ?? null, speciesId: l.speciesId ?? null, name: sp?.name || String(l.speciesId || ''), sizeClass: l.sizeClass ?? null,
      weight: typeof D?.fmtWeight === 'function' && typeof D?.fishWeight === 'function' ? D.fmtWeight(D.fishWeight(sp, l)) : '', oz,
      clams, base, first, giant: l.giant === true, legend: l.legend === true, at, countAt, countDur,
      secondAt: first ? countAt + countDur + 0.12 : null, ticks: first ? [base, clams] : [clams] };
    t = at + (big ? P.giantCount + P.giantAfter + 0.25 : P.row) + (first ? P.firstExtra : 0);
    return row;
  });
  const total = rows.reduce((a, r) => a + r.clams, 0);
  const totalAt = rows.length ? t + P.total - 0.3 : P.start;
  return { rows, total, totalAt, end: totalAt + P.end, empty: rows.length === 0, line: rows.length ? null : (T_(D).murk?.empty || '') };
}
/** What a row shows at time t of the tally: {shown, value, ticked (0, 1 or 2)}. Pure. */
export function tallyRowAt(row, t) {
  if (!row || t < row.at) return { shown: false, value: 0, ticked: 0 };
  const e = (k) => 1 - (1 - k) * (1 - k);
  if (!row.first) {
    const k = clamp01((t - row.countAt) / Math.max(1e-6, row.countDur));
    return { shown: true, value: Math.round(row.clams * e(k)), ticked: k >= 1 ? 1 : 0 };
  }
  const k1 = clamp01((t - row.countAt) / Math.max(1e-6, row.countDur));
  if (t < row.secondAt) return { shown: true, value: Math.round(row.base * e(k1)), ticked: k1 >= 1 ? 1 : 0 };
  const k2 = clamp01((t - row.secondAt) / Math.max(1e-6, TALLY_PACE.second));
  return { shown: true, value: Math.round(row.base + (row.clams - row.base) * e(k2)), ticked: k2 >= 1 ? 2 : 1 };
}

/**
 * The Chart's model (SPEC §5.4, M1.md §3.8; one signature everywhere): {sheets: [{waterId, name, owned, gilded, places}], next,
 * hold: {slots}, fitted: {lure, bait}, pick: {water, place}}. Slice 1a: one sheet per owned lake that LOOP.waters knows (the
 * Mossmere; no Sporewood row), open water chosen, no places; next is null (and always null in the tutorial). opts.slots is
 * loop.hold().slots (the Wick's count); without it data.loopSlots(meta.loop). M1 step 3's drawn Chart draws the same model.
 */
export function chartModel(meta, D, opts = {}) {
  const ml = isObj(meta?.loop) ? meta.loop : {};
  const W = isObj(D?.LOOP?.waters) ? D.LOOP.waters : {};
  const lakes = arr(ml.maps?.lakes).filter((id) => typeof id === 'string' && isObj(W[id]));
  if (!lakes.length && isObj(W.mossmere)) lakes.push('mossmere');
  lakes.sort((a, b) => num(W[a].order, 99) - num(W[b].order, 99));
  const zone = (id) => D?.ZONE_BY_ID?.[id] || arr(D?.ZONES).find((z) => z?.id === id) || null;
  const sheets = lakes.map((id) => ({ waterId: id, name: zone(id)?.name || id, owned: true, gilded: false, places: [] }));
  const slots = Number.isFinite(Number(opts.slots)) ? Number(opts.slots) : typeof D?.loopSlots === 'function' ? D.loopSlots(ml) : num(ml.holdSlots, 3);
  const water = lakes.includes(opts.water) ? opts.water : lakes[0] ?? null;
  return { sheets, next: null, hold: { slots }, fitted: { lure: ml.fitted?.lure ?? null, bait: ml.fitted?.bait ?? null }, pick: { water, place: null }, tutorial: opts.tutorial === true };
}

/** The title's words under the loop (SPEC §8.5, PLAN CHOICE 33): fresh → New Descent · Settings; else Continue · Settings (· Prologue). */
export function titleModel({ fresh = false, replay = false, D = null } = {}) {
  const TL = T_(D);
  const settings = TL.settings?.label || 'Settings';
  if (fresh) return { fresh: true, primary: TL.newDescent || 'New Descent', words: [TL.newDescent || 'New Descent', settings], prologue: false };
  const words = [TL.continue || 'Continue', settings];
  const pro = D?.INTRO?.trigger?.replay?.word || 'Prologue';
  if (replay) words.push(pro);
  return { fresh: false, primary: TL.continue || 'Continue', words, prologue: !!replay };
}

/** New Descent under the loop (SPEC §8.5, PLAN CHOICEs 29, 42): the five Wicks in LOOP.wicks order, the lit Wick's one line, Back,
 *  Start. {cards: [{id, name, look}], sel, line, words}. */
export function descentModel(D, sel = 'wick') {
  const order = arr(D?.LOOP?.wicks?.order).length ? D.LOOP.wicks.order : ['wick', 'taper', 'stub', 'tallow', 'ashwick'];
  const by = (id) => D?.CHARACTER_BY_ID?.[id] || arr(D?.CHARACTERS).find((c) => c?.id === id) || null;
  const s = order.includes(sel) ? sel : order[0];
  const cards = order.map((id) => ({ id, name: by(id)?.name || id, look: by(id)?.look || {} }));
  const TL = T_(D);
  const line = TL.wicks?.[s] || '';
  return { cards, sel: s, line, words: [...cards.map((c) => c.name), line, TL.back || 'Back', TL.start || 'Start'] };
}

/** The loop's modal options (T57): what Escape does on each screen. The Jetty's Escape opens the home pause (never closes the Jetty);
 *  the tally's skips to its end (never presses Sold); the shelf's and the Chart's go back to the Jetty. */
export const LOOP_MODALS = Object.freeze({
  jetty: Object.freeze({ screen: true, blocking: false, dismissable: false, escape: 'homepause' }),
  tally: Object.freeze({ screen: false, blocking: true, dismissable: false, escape: 'skip' }),
  shelf: Object.freeze({ screen: false, blocking: true, dismissable: true, escape: 'jetty' }),
  chart: Object.freeze({ screen: false, blocking: true, dismissable: true, escape: 'jetty' }),
  homepause: Object.freeze({ screen: false, blocking: true, dismissable: true, escape: 'close' }),
});
/** On a trip ui's handleKey swallows the built creel, Burn-a-fish and bait-cycle keys (T58): true, nothing done, nothing said. */
export function tripKeySwallow(code) { return code === 'KeyC' || code === 'KeyR' || code === 'KeyB'; }

/** The Journal species page's "First" cell under the loop (T47, SPEC §10 "Evening N"): never a day or a descent. */
export function journalFirst(entry) {
  const n = Math.floor(num(Number(entry?.firstEvening), 0));
  return n > 0 ? `Evening ${n}` : '—';
}
/**
 * v8 (SPEC §5.5 (f), T83): a water's tab under the loop: its list's cards first (listFor, with a notch, pressed once landed), the
 * water's other species after a thin rule, outside the count; the badge is the list's count "n/6" (num(caught) > 0 only).
 */
export function journalModel(meta, D, waterId, { listFor = null } = {}) {
  const J = isObj(meta?.journal) ? meta.journal : {};
  const ids = typeof listFor === 'function' ? arr(listFor(D, waterId)) : [];
  const caught = (id) => num(Number(J[id]?.caught), 0) > 0;
  const list = ids.map((id) => ({ id, landed: caught(id) }));
  const rest = arr(D?.SPECIES).filter((s) => s?.zone === waterId && !ids.includes(s.id)).map((s) => ({ id: s.id, landed: caught(s.id) }));
  const have = list.filter((x) => x.landed).length;
  return { list, rest, have, need: list.length, badge: `${have}/${list.length}` };
}

/** Settings' words under the loop (PLAN CHOICE 43, T74, T69); off the loop the built words. */
export function settingsWords(D, loopOn) {
  const S = T_(D).settings || {}, F = T_(D).forget || {};
  if (loopOn !== true) {
    return { damageNumbers: true, flashSub: 'Softer flares and hit flashes', ringFirst: 'First outing',
      hurry: 'From your second outing, hold anywhere to hurry a small fish in. It never changes the outcome',
      forgetRow: 'Memories, relics, trials, the Journal. There is no undo.', forgetConfirm: 'Every Memory, relic, trial and name in the Journal will be lost.' };
  }
  return { damageNumbers: false, flashSub: '', ringFirst: S.ringFirst || 'First evening', hurry: S.hurry || '', forgetRow: F.row || '', forgetConfirm: F.confirm || '' };
}

/** The first trip's two words (PLAN CHOICE 39, T68): fe_cast once, castTipAfter s after run:start while fishing is idle. */
export function castTipDue({ evening = 0, seen = false, state = 'idle', since = 0, after = 1.5, shown = false } = {}) {
  return evening === 1 && !seen && !shown && state === 'idle' && since >= after;
}
/** fe_strike: "Now. Tap." on touch, "Now. Click." with a mouse. */
export function strikeTipText(D, isTouch = false) {
  const t = D?.FIRST_EVENING?.tips?.fe_strike;
  return isObj(t) ? (isTouch ? t.touch : t.desktop) || '' : typeof t === 'string' ? t : '';
}

/**
 * T43's allow-list (the scenario's helper, lane D): the words a loop screen may show. A visible text node passes when it is a
 * TEXT_LOOP string, a species, water or Wick name, a size-class label, a shelf item's name, a built record kicker, the card's
 * "length" label, a built tip the loop shows, the Prologue word, a key glyph, or a number (a price, a count, a weight as fmtWeight
 * prints it, the card's one length in cm). "New Descent" is allowed on the fresh title and the panel only (screen 'title' or
 * 'newdescent'); "cm" only on the card ('catch').
 */
export function allowedWords(D) {
  const out = new Set();
  const walk = (v) => { if (typeof v === 'string') out.add(v); else if (Array.isArray(v)) v.forEach(walk); else if (isObj(v)) Object.values(v).forEach(walk); };
  walk(T_(D));
  for (const s of arr(D?.SPECIES)) if (s?.name) out.add(s.name);
  for (const z of arr(D?.ZONES)) if (z?.name) out.add(z.name);
  for (const c of arr(D?.CHARACTERS)) if (c?.name) out.add(c.name);
  for (const c of arr(D?.SIZE_CLASSES)) if (c?.label) out.add(c.label);
  out.add('Legend');
  for (const st of arr(D?.LOOP?.hold?.ladder)) if (st?.name) out.add(st.name);
  if (D?.LOOP?.hold?.startName) out.add(D.LOOP.hold.startName);
  for (const slot of ['rod', 'line', 'reel']) for (const t of arr(D?.TACKLE?.[slot])) if (t?.name) out.add(t.name);
  for (const names of Object.values(D?.LOOP?.tackle?.names || {})) walk(names);
  const tips = D?.FIRST_EVENING?.tips || {};
  walk(tips.fe_cast); walk(tips.fe_strike);
  out.add(D?.INTRO?.trigger?.replay?.word || 'Prologue');
  for (const k of ['A new personal best', 'A new name for the journal', 'Old Ledger beaten', 'Written in the Elder Log', 'A new record for this place', 'length']) out.add(k);
  return out;
}
const NUM_RE = /^[+]?\d[\d,]*(\.\d+)?[km]?$/;
const WEIGHT_RE = /^(?:[¼½¾]|\d+(?:\s?[¼½¾])?)\s?oz$|^\d[\d,]*\s?lb(?:\s\d+\s?oz)?$/;
const CM_RE = /^\d+(?:\.\d+)?\s?cm$/;
const KEY_RE = /^(?:[A-Z0-9]|Esc|Space|Enter)$/;
export function textAllowed(text, { D = null, screen = null, words = null } = {}) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return true;
  const W = words || allowedWords(D);
  if (/descent/i.test(t)) return t === (T_(D).newDescent || 'New Descent') && (screen === 'title' || screen === 'newdescent');
  if (/shells?|memories/i.test(t)) return false;
  if (W.has(t)) return true;
  if (NUM_RE.test(t) || WEIGHT_RE.test(t) || KEY_RE.test(t) || t === '—' || t === '·' || t === '★') return true;
  if (CM_RE.test(t)) return screen === 'catch';
  if (/^Your first (Small|Keeper|Prize|Trophy|Elder|Ancient)$/.test(t) || /^A legend of /.test(t)) return true;
  if (/^Evening \d+$/.test(t)) return true;
  // the goal line: "Next: {name} · {price}" with a known name (a hold step or a shelf item) and a number
  const m = /^Next: (.+) · (.+)$/.exec(t);
  if (m && NUM_RE.test(m[2]) && (W.has(m[1]) || /^Hold \d+$/.test(m[1]))) return true;
  return false;
}

// ---------------------------------------------------------------- drawings (pure strings)
/** The Chart's ink vignette of a water (1a: the Mossmere): its rim, its islands, the Jetty's warm lamp and the way out to open water. */
export function chartVignette(D, waterId = 'mossmere', { uid = 'cv' } = {}) {
  const z = D?.ZONE_BY_ID?.[waterId] || arr(D?.ZONES).find((x) => x?.id === waterId) || null;
  const A = z?.arena || {};
  const R = Math.max(10, num(A.radius, 60));
  const s = 64 / R;   // the drawing's radius is 64 units
  const P = (x, y) => `${(x * s).toFixed(1)} ${(y * s).toFixed(1)}`;
  // the rim: a hand-inked loop (a few slow harmonics, so it never reads as a drawn circle)
  const seed = String(waterId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = R * (1 + 0.06 * Math.sin(3 * a + seed) + 0.035 * Math.sin(5 * a + seed * 0.7) + 0.02 * Math.cos(9 * a + seed * 1.3));
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const rim = `M${P(...pts[0])}` + pts.slice(1).map((p) => ` L${P(...p)}`).join('') + ' Z';
  const isles = arr(A.islands).map((q, i) => {
    const r = Math.max(1.5, num(q.r, 4));
    const k = 8, wob = (j) => 1 + 0.18 * Math.sin(j * 2.3 + i * 1.7);
    let d = '';
    for (let j = 0; j <= k; j++) { const a = (j / k) * Math.PI * 2; d += `${j ? ' L' : 'M'}${P(num(q.x) + Math.cos(a) * r * wob(j), num(q.z) + Math.sin(a) * r * wob(j))}`; }
    return `<path class="gw-cv-isle" d="${d} Z"/>`;
  }).join('');
  const dock = arr(A.docks)[0] || null;
  let way = '', home = '';
  if (dock && typeof D?.sailPlan === 'function') {
    const g = D.sailPlan({ x: num(dock.x), z: num(dock.z) }, { x: 0, z: 0 }, D?.LOOP?.tutorial, waterId);
    way = `<path class="gw-cv-way" d="M${g.path.map((p) => P(p.x, p.z)).join(' L')}"/>`
      + `<g class="gw-cv-float" transform="translate(${P(g.to.x, g.to.z).replace(' ', ' ')})"><circle r="2.6"/><path d="M0 -2.6 V-6.4"/></g>`;
  }
  if (dock) home = `<circle class="gw-cv-glow" cx="${(num(dock.x) * s).toFixed(1)}" cy="${(num(dock.z) * s).toFixed(1)}" r="9" fill="url(#${uid}g)"/><circle class="gw-cv-home" cx="${(num(dock.x) * s).toFixed(1)}" cy="${(num(dock.z) * s).toFixed(1)}" r="2.2"/>`;
  return `<svg class="gw-cv" viewBox="-74 -74 148 148" aria-hidden="true"><defs><radialGradient id="${uid}g"><stop offset="0" stop-color="#ed9e3b" stop-opacity=".75"/><stop offset="1" stop-color="#ed9e3b" stop-opacity="0"/></radialGradient></defs>`
    + `<path class="gw-cv-wash" d="${rim}"/><path class="gw-cv-rim" filter="url(#gw-brush)" d="${rim}"/>${isles}${way}${home}</svg>`;
}
/** Murk's scale (the tally): a post, a beam and two pans in ink; the fish settle on the right pan, the clams on the left. */
export function scaleSvg() {
  const pan = (x, cls) => `<g class="gw-scale-pan ${cls}" data-x="${x}"><path class="gw-sc-thread" d="M${x} 24 L${x - 22} 66 M${x} 24 L${x + 22} 66 M${x} 24 V66"/>`
    + `<path class="gw-sc-dish" d="M${x - 26} 66 Q${x} 80 ${x + 26} 66"/><g class="gw-sc-load"></g></g>`;
  return `<svg class="gw-scale" viewBox="0 0 260 112" aria-hidden="true"><g filter="url(#gw-brush)">`
    + '<path class="gw-sc-post" d="M130 106 V20 M104 106 H156 M118 106 Q130 98 142 106"/><circle class="gw-sc-pin" cx="130" cy="20" r="3"/></g>'
    + `<g class="gw-scale-beam"><path class="gw-sc-beam" filter="url(#gw-brush)" d="M42 22 Q130 16 218 22"/><circle class="gw-sc-knob" cx="42" cy="22" r="2.2"/><circle class="gw-sc-knob" cx="218" cy="22" r="2.2"/></g>`
    + `${pan(46, 'gw-scale-pan--clams')}${pan(214, 'gw-scale-pan--fish')}</svg>`;
}
/** The three Jetty tiles' small ink drawings: Murk (his barge-lamp, the UI's one sage trace), the Chart (a rolled sheet), the Journal. */
function tileArt(id) {
  if (id === 'murk') return murkPortrait();
  if (id === 'chart') {
    return `<svg class="gw-tile-art" viewBox="0 0 96 64" aria-hidden="true"><g filter="url(#gw-brush)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 14 C30 10 66 10 82 14 L80 50 C64 46 32 46 16 50 Z" stroke-width="1.8"/><path d="M82 14 c5 1 6 6 3 9 c-2 2 -5 1 -5 -2" stroke-width="1.6"/>
      <path d="M16 50 c-5 1 -7 6 -3 8 c3 2 6 -1 4 -4" stroke-width="1.6"/>
      <path d="M30 32 C34 22 50 20 58 26 C66 32 62 42 50 42 C40 42 28 40 30 32 Z" stroke-width="1.3" stroke-opacity=".8"/>
      <path d="M38 30 q4 -3 7 0" stroke-width="1.1" stroke-opacity=".6"/><path d="M52 36 q3 -2 5 0" stroke-width="1.1" stroke-opacity=".6"/></g>
      <circle cx="58" cy="38" r="2.2" class="gw-tile-lamp"/></svg>`;
  }
  return `<svg class="gw-tile-art" viewBox="0 0 96 64" aria-hidden="true"><g filter="url(#gw-brush)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 14 C32 10 42 12 48 18 C54 12 64 10 76 14 V52 C64 48 54 50 48 56 C42 50 32 48 20 52 Z" stroke-width="1.8"/><path d="M48 18 V56" stroke-width="1.4"/>
    <path d="M27 24 h14 M27 31 h12 M56 24 h13 M56 31 h10" stroke-width="1.1" stroke-opacity=".55"/>
    <path d="M57 40 c4 -3 9 -3 12 0 l3 -2 v5 l-3 -2 c-3 3 -8 3 -12 -1z" stroke-width="1.1" stroke-opacity=".8"/></g></svg>`;
}
const SEAL_GLYPH = '<svg class="gw-trow-seal" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c2.2 0 2.6 1.6 4.4 2.3s3.4.1 4 2.1-.8 2.9-.7 4.6.9 3.2-.4 4.6-2.9.6-4.4 1.6-1.9 2.8-3.9 2.8-2.5-1.8-3.9-2.8-3.2-.2-4.4-1.6-.4-2.9-.4-4.6S2.4 9.6 3 7.6s2.3-1.4 4-2.1S9.8 3.2 12 3.2z"/><path class="k" d="M8.6 12.4l2.4 2.4 4.6-5"/></svg>';

// ================================================================== the view
export function createLoopView(K) {
  const { ctx, h, D, safe } = K;
  const esc = K.esc || escH;
  const report = (where, e) => { try { K.report?.(`loop.${where}`, e); } catch { /* ignore */ } };
  const loop = () => { const p = ctx.progression; if (!p || p.isStub) return null; const l = p.loop; return l && typeof l === 'object' && !l.isStub ? l : null; };
  const L = (name, ...a) => { const l = loop(); const f = l?.[name]; if (typeof f !== 'function') return null; try { return f.apply(l, a); } catch (e) { report(name, e); return null; } };
  const game = () => (ctx.game && typeof ctx.game === 'object' ? ctx.game : {});
  const G = (name, ...a) => { const f = game()[name]; if (typeof f !== 'function') return null; try { return f.apply(game(), a); } catch (e) { report(`game.${name}`, e); return null; } };
  const TL = () => T_(D());
  const run = () => ctx.state?.run || null;
  const onTrip = () => run()?.outing === 'trip';
  const parts = () => K.screens?.parts || {};
  const audioPlay = (name, o) => { try { return ctx.audio?.play?.(name, o) === true; } catch { return false; } };
  const coin = (bright, o = {}) => { if (bright) { if (!audioPlay('coinBright', o)) audioPlay('coin', o); } else audioPlay('coin', o); };
  const tut = createLoopTutorial({ bus: ctx.bus, loop, data: D, now: () => (typeof performance !== 'undefined' ? performance.now() / 1000 : 0) });
  const reducedMotion = () => K.settings?.().reducedMotion === true || (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
  K.root.classList.add('gw-loop-on');

  // ------------------------------------------------------------------ the HUD on the water: the hold row and the Home pill
  const hudEl = K.layers.hud;
  const holdRow = h('div', 'gw-hold');
  holdRow.dataset.loop = 'hold';
  (hudEl.querySelector('.gw-tl') || hudEl).appendChild(holdRow);
  const pill = h('button', 'gw-pill gw-home', `<span class="gw-home-k" aria-hidden="true"><i class="gw-home-ring"></i>${icon('hearth')}</span><span class="gw-pill-label"></span><kbd>H</kbd>`);
  pill.type = 'button';
  pill.dataset.loop = 'home';
  pill.querySelector('.gw-pill-label').textContent = TL().home || 'Home';
  (hudEl.querySelector('.gw-actions') || hudEl).appendChild(pill);
  const P = { press: null, fired: false, key: false, k: 0 };
  const holdFull = () => L('holdFull') === true;
  function fireHome(via) {
    if (P.fired) return;
    P.fired = true;
    const ok = G('goHome');
    if (ok === false || ok === null) { pill.classList.remove('gw-nope'); void pill.offsetWidth; pill.classList.add('gw-nope'); P.fired = false; }
    else K.sfx?.('ui_click', { volume: 0.5 });
    void via;
  }
  function pressStart(src) {
    if (!onTrip() || P.press) return;
    if (G('canGoHome', { fromPause: false })?.ok !== true) return;
    P.press = { src, t: 0 }; P.fired = false;
    pill.classList.add('gw-held');
  }
  function pressEnd(src, { cancel = false } = {}) {
    if (!P.press || P.press.src !== src) return;
    const t = P.press.t;
    P.press = null;
    pill.classList.remove('gw-held');
    if (!cancel && !P.fired && pillHold(t, holdFull()).fire) fireHome(src);
    P.k = 0; pill.style.setProperty('--k', '0');
  }
  const guard = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); try { fn(e); } catch (err) { report('pill', err); } };
  pill.addEventListener('pointerdown', guard((e) => { try { pill.setPointerCapture?.(e.pointerId); } catch { /* ignore */ } pressStart('pointer'); }));
  pill.addEventListener('pointerup', guard(() => pressEnd('pointer')));
  pill.addEventListener('pointercancel', guard(() => pressEnd('pointer', { cancel: true })));
  pill.addEventListener('lostpointercapture', () => pressEnd('pointer', { cancel: true }));
  pill.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
  try { addEventListener('keyup', (e) => { if (e.code === 'KeyH') pressEnd('key'); }); addEventListener('blur', () => { pressEnd('key', { cancel: true }); pressEnd('pointer', { cancel: true }); }); } catch { /* no window */ }

  let holdSig = '';
  const fishArt = new Map();
  function paintHold(force = false) {
    const H = L('hold');
    const cells = slotCells(isObj(H) ? H : { slots: 0, fish: [] }, { D: D() });
    const sig = cells.map((c) => (c.filled ? `${c.uid}:${c.sizeClass}:${c.gild ? 1 : 0}` : '-')).join('|');
    if (!force && sig === holdSig) return;
    const before = holdSig.split('|').filter((x) => x && x !== '-').length;
    holdSig = sig;
    holdRow.innerHTML = '';
    let filled = 0;
    for (const c of cells) {
      const cell = h('span', `gw-slot${c.filled ? ' gw-filled' : ''}${c.gild ? ' gw-gild' : ''}`);
      cell.dataset.filled = c.filled ? '1' : '0';
      if (c.filled) {
        filled++;
        cell.style.setProperty('--s', String(c.scale));
        let cv = fishArt.get(c.uid);
        if (!cv) {
          cv = h('canvas', 'gw-slot-fish');
          try { drawFishInk(cv, spOf(D(), c.speciesId), { w: 40, h: 22, pad: 0.04, gain: 7, color: c.gild ? '#f1d7a0' : '#ece8f4' }); } catch (e) { report('slot art', e); }
          if (c.uid) fishArt.set(c.uid, cv);
        }
        cell.appendChild(cv);
        if (filled > before && before >= 0 && holdSig) cell.classList.add('gw-new');
      }
      holdRow.appendChild(cell);
    }
    holdRow.classList.toggle('gw-full', cells.length > 0 && filled >= cells.length);
    if (fishArt.size > 24) for (const k of fishArt.keys()) { if (!cells.some((c) => c.uid === k)) fishArt.delete(k); }
  }

  // ------------------------------------------------------------------ the first trip's two words (PLAN CHOICE 39)
  const TIP = { since: 0, castEl: null, strikeEl: null, firstBite: false };
  const seenTip = (id) => !!K.meta?.().seenTips?.[id];
  const markTip = (id) => { const m = K.meta?.(); if (m) { m.seenTips = m.seenTips || {}; m.seenTips[id] = true; } };
  function tipEl(text) {
    const el = h('div', 'gw-toast gw-toast--tip gw-loop-tip', `${icon('quill', { cls: 'gw-toast-ico' })}<span></span>`);
    el.querySelector('span').textContent = text;
    K.layers.toasts.appendChild(el);
    requestAnimationFrame(() => el.classList.add('gw-in'));
    return el;
  }
  function dropTip(which) {
    const el = TIP[which];
    if (!el) return;
    TIP[which] = null;
    el.classList.remove('gw-in'); el.classList.add('gw-out');
    setTimeout(() => el.remove(), 420);
  }

  // ------------------------------------------------------------------ Murk's lines on the water (one lore toast; never in a bite)
  function murkToast(line) {
    if (!line) return;
    K.toast(line, 'lore', { icon: 'lantern', cls: 'gw-toast--murk', dur: 4600 });
  }
  let quietSaid = false;

  // ------------------------------------------------------------------ the Jetty
  const J = { line: null, lineT: 0, lineHold: 0 };
  function jettyLine() {
    const c = tut.cue();
    if (tut.isActive()) return c.line || null;
    return J.line;
  }
  function openJetty({ line = null } = {}) {
    J.line = line || null; J.lineT = 0;
    J.lineHold = line ? 4.5 + 0.05 * String(line).length : 0;
    if (K.has('jetty')) { K.entry('jetty')?.render(); return; }
    const o = LOOP_MODALS.jetty;
    K.openModal('jetty', renderJetty, { screen: o.screen, blocking: o.blocking, dismissable: false, cls: 'gw-m-jetty', onEscape: () => openHomePause(), onKey: jettyKeys });
  }
  let jettySig = '';
  function renderJetty(entry, body) {
    const c = tut.cue();
    const clams = num(Number(L('state')?.clams), 0);
    const goal = tut.isActive() ? null : goalLine(L('goal'), { D: D(), wick: L('wick') });
    const line = jettyLine();
    jettySig = JSON.stringify([c, clams, goal?.text, line]);
    const wrap = h('div', `gw-jetty${reducedMotion() ? ' gw-rm' : ''}`);
    wrap.dataset.loop = 'jetty';
    wrap.innerHTML = `<div class="gw-jetty-veil" aria-hidden="true"></div>
      <button type="button" class="gw-hbtn gw-hb-pause gw-loop-pauseglyph" data-loop="homepause">${icon('pause')}</button>
      <div class="gw-jetty-purse">${clamTag(clams)}</div>
      <div class="gw-jetty-low">
        <p class="gw-murk-line${line ? ' gw-in' : ''}"></p>
        <nav class="gw-jetty-tiles"></nav>
        <p class="gw-jetty-goal"></p>
      </div>`;
    body.appendChild(wrap);
    if (line) wrap.querySelector('.gw-murk-line').textContent = line;
    if (goal) wrap.querySelector('.gw-jetty-goal').innerHTML = goal.html; else wrap.querySelector('.gw-jetty-goal').remove();
    const nav = wrap.querySelector('.gw-jetty-tiles');
    for (const id of ['murk', 'chart', 'journal']) {
      const cue = c.tile === id, dim = c.dim && !cue;
      const b = h('button', `gw-mode gw-tile gw-tile--${id}${cue ? ' gw-cue' : ''}${dim ? ' gw-dim' : ''}`);
      b.type = 'button';
      b.dataset.tile = id;
      if (cue || (!c.tile && id === 'chart')) b.dataset.autofocus = '1';
      b.innerHTML = `<span class="gw-mode-vig gw-tile-vig">${tileArt(id)}</span><span class="gw-mode-name">${ORN.hookL}<b></b>${ORN.hookR}</span>`;
      b.querySelector('b').textContent = TL().jetty?.[id] || id;
      b.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); onTile(id); });
      nav.appendChild(b);
    }
    wrap.querySelector('[data-loop=homepause]').addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); openHomePause(); });
    // a tap on the sheet outside a tile only ends Murk's line (the tutorial's, or a once-line)
    wrap.addEventListener('click', () => { if (tut.tap()) { refreshJetty(true); return; } if (J.line) { J.line = null; refreshJetty(true); } });
  }
  function refreshJetty(force = false) {
    const e = K.entry('jetty');
    if (!e) return;
    const c = tut.cue();
    const clams = num(Number(L('state')?.clams), 0);
    const goal = tut.isActive() ? null : goalLine(L('goal'), { D: D(), wick: L('wick') });
    const sig = JSON.stringify([c, clams, goal?.text, jettyLine()]);
    if (force || sig !== jettySig) e.render();
  }
  function onTile(id) {
    if (id === 'murk') { openShelf(); return; }
    if (id === 'journal') { K.screens?.openJournal?.({ from: 'jetty' }); return; }
    if (id === 'chart') { tut.onTile('chart'); openChart(); }
  }
  function jettyKeys(code) {
    const t = K.top();
    if (!t || t.id !== 'jetty') return false;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(code)) return false;
    const btns = [...t.el.querySelectorAll('.gw-tile')];
    if (!btns.length) return false;
    const d = ['ArrowLeft', 'ArrowUp', 'KeyA', 'KeyW'].includes(code) ? -1 : 1;
    const i = btns.indexOf(document.activeElement);
    const next = i < 0 ? (d > 0 ? 0 : btns.length - 1) : (i + d + btns.length) % btns.length;
    btns[next].focus();
    K.sfx?.('ui_hover', { volume: 0.3 });
    return true;
  }
  const backToJetty = (id) => { K.closeModal(id); if (!K.has('jetty') && ctx.flow === 'home') openJetty(); else refreshJetty(true); };

  // ------------------------------------------------------------------ the home pause (the lead's ruling 12, PLAN CHOICE 45)
  function openHomePause() {
    if (K.has('homepause')) return;
    K.openModal('homepause', (entry, body) => {
      const { panel = null, btn = null } = parts();
      if (!panel || !btn) return;
      const { content, foot } = panel(entry, body, { cls: 'gw-p-pause gw-p-homepause', close: false });
      const menu = h('nav', 'gw-pause-menu');
      menu.appendChild(btn(TL().resume || 'Resume', { cls: 'gw-mbtn gw-btn--primary', icon: 'flame', autofocus: true, onClick: () => K.closeModal('homepause') }));
      menu.appendChild(btn(TL().settings?.label || 'Settings', { cls: 'gw-mbtn', icon: 'sun', onClick: () => K.screens?.openSettings?.({ pauseChild: true, homeChild: true }) }));
      content.appendChild(menu);
      foot.remove();
    }, { cls: 'gw-m-center', onEscape: () => K.closeModal('homepause'), onKey: (code) => menuArrows(code, '.gw-mbtn') });
  }
  function menuArrows(code, sel) {
    if (!['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(code)) return false;
    const t = K.top();
    const btns = [...(t?.el.querySelectorAll(`${sel}:not([disabled])`) || [])];
    if (!btns.length) return false;
    const i = btns.indexOf(document.activeElement);
    btns[(i + (code === 'ArrowUp' || code === 'KeyW' ? -1 : 1) + btns.length) % btns.length].focus();
    return true;
  }

  // ------------------------------------------------------------------ the tally (SPEC §8.3)
  function openTally(tally) {
    if (!isObj(tally)) { openJetty(); return; }
    const plan = tallyPlan(tally, { D: D() });
    const st = { tally, plan, t: 0, done: false, ticks: new Map(), soldAt: 0 };
    K.closeModal('jetty', { silent: true, instant: true });
    const o = LOOP_MODALS.tally;
    const entry = K.openModal('tally', renderTally, { state: st, dismissable: o.dismissable, cls: 'gw-m-center gw-m-tally', onEscape: () => skipTally(), onKey: (code) => {
      if (code === 'Enter' || code === 'NumpadEnter') { if (st.done) sold(); else skipTally(); return true; }
      return false;
    } });
    entry.tick = (dt) => tickTally(entry, dt);
    // a tap anywhere (the scrim included) skips to the end; a second one presses Sold
    entry.el.addEventListener('click', (e) => { if (e.target?.closest?.('[data-action=sold]')) return; if (st.done) sold(); else skipTally(); });
  }
  function renderTally(entry, body) {
    const { panel = null, btn = null } = parts();
    if (!panel || !btn) return;
    const s = entry.state, plan = s.plan;
    const { panel: pn, content, foot } = panel(entry, body, { cls: 'gw-p-tally', close: false });
    pn.dataset.loop = 'tally';
    content.innerHTML = `<div class="gw-tally${plan.empty ? ' gw-tally--empty' : ''}">${scaleSvg()}
      ${plan.empty ? '<p class="gw-murk-line gw-in"></p>' : '<ol class="gw-tally-rows"></ol><div class="gw-tally-total"><span class="gw-tally-plus"></span></div>'}</div>`;
    if (plan.empty) content.querySelector('.gw-murk-line').textContent = plan.line || '';
    const ol = content.querySelector('.gw-tally-rows');
    plan.rows.forEach((r, i) => {
      const li = h('li', `gw-trow${r.first ? ' gw-trow--first' : ''}${r.giant || r.legend ? ' gw-trow--giant' : ''}`);
      li.dataset.i = String(i);
      if (r.uid) li.dataset.uid = r.uid;
      const art = h('canvas', 'gw-trow-fish');
      try { drawFishInk(art, spOf(D(), r.speciesId), { w: 56, h: 28, pad: 0.04, gain: 6, color: r.giant || r.legend ? '#efd9a6' : '#ece8f4' }); } catch (e) { report('tally art', e); }
      li.appendChild(art);
      li.insertAdjacentHTML('beforeend', `<span class="gw-trow-name"><b></b><small></small></span><span class="gw-trow-v">${r.first ? SEAL_GLYPH : ''}${icon('clam')}<b>0</b></span>`);
      li.querySelector('.gw-trow-name b').textContent = `${r.giant || r.legend ? '★ ' : ''}${r.name}`;
      li.querySelector('.gw-trow-name small').textContent = r.weight;
      ol.appendChild(li);
    });
    const tot = content.querySelector('.gw-tally-total');
    if (tot) tot.insertAdjacentHTML('beforeend', `${icon('clam')}`);
    const b = btn(TL().sold || 'Sold', { cls: 'gw-btn--primary gw-tally-sold', action: 'sold', autofocus: true, onClick: () => { if (!s.done) { skipTally(); return; } sold(); } });
    foot.appendChild(b);
    paintTally(entry, true);
  }
  function paintTally(entry, init = false) {
    const s = entry.state, plan = s.plan, el = entry.el;
    const t = s.done ? Infinity : s.t;
    let onPans = 0, cl = 0;
    plan.rows.forEach((r, i) => {
      const li = el.querySelector(`.gw-trow[data-i="${i}"]`);
      if (!li) return;
      const at = tallyRowAt(r, t);
      li.classList.toggle('gw-on', at.shown);
      const v = li.querySelector('.gw-trow-v b');
      const txt = fmtClams(at.value);
      if (v && v.textContent !== txt) v.textContent = txt;
      li.classList.toggle('gw-sale', r.first && at.ticked >= 2);
      if (at.shown) onPans++;
      if (at.ticked >= 1) cl++;
      const prev = s.ticks.get(i) || 0;
      if (!init && !s.done && at.ticked > prev) coin(r.first && at.ticked >= 2, { volume: 0.32, pitch: 0.95 + 0.05 * Math.min(6, i) });
      s.ticks.set(i, at.ticked);
    });
    const shown = t >= plan.totalAt;
    const tot = el.querySelector('.gw-tally-total');
    if (tot) {
      tot.classList.toggle('gw-on', shown);
      const plus = tot.querySelector('.gw-tally-plus');
      const want = `+${fmtClams(plan.total)}`;
      if (plus && plus.textContent !== want) plus.textContent = want;
    }
    // the scale: a fish glyph lands on the right pan per row, a clam on the left as it is valued; the beam dips to the fish and levels
    const fishLoad = el.querySelector('.gw-scale-pan--fish .gw-sc-load'), clamLoad = el.querySelector('.gw-scale-pan--clams .gw-sc-load');
    if (fishLoad && fishLoad.childElementCount !== onPans) {
      fishLoad.innerHTML = Array.from({ length: onPans }, (_, i) => `<path class="gw-sc-fish" transform="translate(${214 - 14 + (i % 3) * 10} ${60 - Math.floor(i / 3) * 5}) scale(.5)" d="M0 6c3-4 7.5-5.5 11.5-3.5L17 -1v14l-5.5-3.5C7.5 11.5 3 10 0 6z"/>`).join('');
    }
    if (clamLoad && clamLoad.childElementCount !== cl) {
      clamLoad.innerHTML = Array.from({ length: cl }, (_, i) => `<ellipse class="gw-sc-clam" cx="${46 - 12 + (i % 3) * 12}" cy="${62 - Math.floor(i / 3) * 4}" rx="5" ry="3.2"/>`).join('');
    }
    const tilt = Math.max(-5, Math.min(5, (onPans - cl) * 3.2));
    const beam = el.querySelector('.gw-scale-beam');
    if (beam) beam.setAttribute('transform', `rotate(${tilt.toFixed(2)} 130 20)`);
    for (const p of el.querySelectorAll('.gw-scale-pan')) {
      const x = Number(p.dataset.x) || 0, dy = Math.sin((tilt * Math.PI) / 180) * (x - 130);
      p.setAttribute('transform', `translate(0 ${dy.toFixed(2)})`);
    }
    el.querySelector('.gw-tally-sold')?.classList.toggle('gw-wait', !s.done && t < plan.end);
  }
  function tickTally(entry, dt) {
    const s = entry.state;
    if (s.done) return;
    s.t += Math.max(0, Math.min(0.25, num(dt)));
    if (s.t >= s.plan.end) s.done = true;
    paintTally(entry);
  }
  function skipTally() {
    const entry = K.entry('tally');
    if (!entry) return;
    const s = entry.state;
    if (!s.done) { s.done = true; if (s.plan.total > 0) coin(false, { volume: 0.3 }); paintTally(entry, true); }
  }
  function sold() {
    const entry = K.entry('tally');
    if (!entry) return;
    const s = entry.state;
    if (!s.done) { skipTally(); return; }
    if (s.soldAt) return;
    s.soldAt = Date.now();
    const id = s.tally?.id ?? null;
    if (id != null) L('markTallySeen', id);
    // Murk's one line after a sale (SPEC §8.6): the first sale, else the first Trophy or bigger; one at a time
    let line = null;
    if (!s.plan.empty) {
      const said = L('state')?.said || {};
      const big = s.plan.rows.some((r) => r.giant || r.legend || r.sizeClass === 'trophy' || r.sizeClass === 'elder');
      if (!said.firstSale) line = L('sayOnce', 'firstSale');
      else if (big && !said.firstTrophy) line = L('sayOnce', 'firstTrophy');
    }
    K.closeModal('tally');
    if (ctx.flow === 'home') openJetty({ line });
  }

  // ------------------------------------------------------------------ the shelf (SPEC §8.4)
  function openShelf() {
    const st = { tab: null, line: '' };
    K.openModal('shelf', renderShelf, { state: st, cls: 'gw-m-center gw-m-shelf', onEscape: () => backToJetty('shelf'),
      onKey: (code) => {
        if (!['BracketLeft', 'BracketRight', 'ArrowLeft', 'ArrowRight'].includes(code)) return false;
        const e = K.entry('shelf'); const ids = shelfCards(L('shelf'), { D: D() }).tabs.map((t) => t.id);
        if (!e || ids.length < 2) return false;
        const i = Math.max(0, ids.indexOf(e.state.tab));
        e.state.tab = ids[(i + (code === 'BracketLeft' || code === 'ArrowLeft' ? -1 : 1) + ids.length) % ids.length];
        e.render(); return true;
      } });
  }
  function renderShelf(entry, body) {
    const { panel = null, btn = null, tabs = null } = parts();
    if (!panel || !btn) return;
    const s = entry.state;
    const clams = num(Number(L('state')?.clams), 0);
    const model = shelfCards(L('shelf'), { D: D(), clams });
    if (!model.tabs.some((t) => t.id === s.tab)) s.tab = model.tabs[0]?.id ?? null;
    const { panel: pn, content, foot } = panel(entry, body, { cls: 'gw-p-shelf' });
    pn.dataset.loop = 'shelf';
    const head = h('div', 'gw-shelf-head', `<span class="gw-shelf-murk">${murkPortrait()}</span><div class="gw-shelf-purse">${clamTag(clams)}</div><p class="gw-murk-line${s.line ? ' gw-in' : ''}"></p>`);
    head.querySelector('.gw-murk-line').textContent = s.line || '';
    pn.insertBefore(head, content);
    if (tabs && model.tabs.length > 1) pn.insertBefore(tabs(model.tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon })), s.tab, (id) => { s.tab = id; entry.render(); }), content);
    const tab = model.tabs.find((t) => t.id === s.tab);
    const grid = h('div', 'gw-shelf-cards');
    for (const c of tab?.cards || []) {
      const card = h('div', `gw-shelf-card${c.bought ? ' gw-bought' : ''}${c.dear ? ' gw-dear' : ''}`);
      card.dataset.item = c.id;
      card.innerHTML = `<span class="gw-shelf-art">${icon(c.art)}</span><b class="gw-shelf-name"></b><span class="gw-shelf-line"></span>`;
      card.querySelector('.gw-shelf-name').textContent = c.name;
      card.querySelector('.gw-shelf-line').textContent = c.line;
      const b = btn(c.bought ? esc(c.buyWord) : clamTag(c.price), { cls: `gw-btn--sm gw-shelf-buy${c.dear ? ' gw-dear' : ''}`, hooks: !c.bought && !c.dear, disabled: c.bought || c.dear, onClick: () => buy(entry, c.id) });
      b.dataset.buy = c.id;
      card.appendChild(b);
      grid.appendChild(card);
    }
    content.appendChild(grid);
    if (s.tab === 'tackle' && typeof K.screens?.openTackle === 'function' && D().AUTOFISH) {
      const odds = h('button', 'gw-link gw-shelf-odds');
      odds.type = 'button';
      odds.textContent = TL().odds || 'Odds ›';
      odds.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); K.screens.openTackle({ titleChild: true }); });
      content.appendChild(odds);
    }
    foot.remove();
  }
  function buy(entry, id) {
    const res = L('buy', id);
    if (res?.ok === true) {
      coin(true, { volume: 0.4 });
      K.sfx?.('shop_buy');
      K.hud?.dirtyStats?.();
    } else K.sfx?.('denied', { volume: 0.5 });
    entry.render();
  }

  // ------------------------------------------------------------------ the Chart (SPEC §5.4, slice 1a: a list from chartModel)
  function openChart() {
    if (K.has('chart')) { K.entry('chart')?.render(); return; }
    const st = { opened: performance.now(), sailing: false, inked: !tut.isActive() };
    K.openModal('chart', renderChart, { state: st, cls: 'gw-m-center gw-m-chart', onEscape: () => { tut.onEscapeChart(); backToJetty('chart'); } });
  }
  function renderChart(entry, body) {
    const { panel = null, btn = null } = parts();
    if (!panel || !btn) return;
    const s = entry.state;
    const c = tut.cue();
    const H = L('hold');
    const model = chartModel(ctx.state?.meta, D(), { slots: Number.isFinite(Number(H?.slots)) ? Number(H.slots) : undefined, tutorial: tut.isActive() });
    const { panel: pn, content, foot } = panel(entry, body, { cls: `gw-p-chart${reducedMotion() ? ' gw-rm' : ''}` });
    pn.dataset.loop = 'chart';
    const line = c.line;
    content.innerHTML = `${line ? '<p class="gw-murk-line gw-in"></p>' : ''}<div class="gw-chart"></div>`;
    if (line) content.querySelector('.gw-murk-line').textContent = line;
    const list = content.querySelector('.gw-chart');
    for (const sh of model.sheets) {
      const row = h('div', `gw-chart-row${model.pick.water === sh.waterId ? ' gw-on' : ''}`);
      row.dataset.water = sh.waterId;
      row.innerHTML = `<span class="gw-chart-map">${chartVignette(D(), sh.waterId, { uid: `cv${sh.waterId}` })}</span><span class="gw-chart-name">${ORN.hookL}<b></b>${ORN.hookR}</span>`;
      row.querySelector('b').textContent = sh.name;
      list.appendChild(row);
    }
    const slots = h('div', 'gw-hold gw-chart-hold');
    const ink = !s.inked && !reducedMotion();
    const step = num(D().LOOP?.tutorial?.slotInk, 0.25);
    for (let i = 0; i < Math.max(0, model.hold.slots); i++) {
      const cell = h('span', `gw-slot${ink ? ' gw-ink' : ''}`);
      cell.dataset.filled = '0';
      if (ink) cell.style.animationDelay = `${(0.35 + i * step).toFixed(2)}s`;
      slots.appendChild(cell);
    }
    s.inked = true;
    list.appendChild(slots);
    const b = btn(TL().sail || 'Sail', { cls: `gw-btn--primary gw-chart-sail${c.sail ? ' gw-cue' : ''}`, action: 'sail', icon: 'flame', autofocus: true, disabled: s.sailing, onClick: () => {
      if (s.sailing) return;
      s.sailing = true;
      b.disabled = true;
      tut.onSail();
      const ok = G('sail', { water: model.pick.water || 'mossmere', place: null });
      if (ok === false || ok === null) { s.sailing = false; b.disabled = false; }
    } });
    foot.appendChild(b);
  }

  // ------------------------------------------------------------------ events
  const on = (evt, fn) => { try { ctx.bus.on(evt, (p) => { try { fn(p || {}); } catch (e) { report(`on(${evt})`, e); } }); } catch (e) { report('bus', e); } };
  on('home:enter', (p) => {
    tut.start({ from: p.from ?? null });
    const unseen = isObj(p.tally) && p.tally.seen !== true ? p.tally : (() => { const lt = L('lastTrip'); return isObj(lt) && lt.seen !== true ? lt : null; })();
    if (unseen) openTally(unseen); else openJetty();
  });
  on('run:start', (p) => {
    holdSig = ''; paintHold(true);
    quietSaid = false;
    TIP.since = 0; TIP.firstBite = false; dropTip('castEl'); dropTip('strikeEl');
    if (!p.continued && onTrip() && num(run()?.evening, 1) >= 2) {
      const line = L('sayOnce', 'sailOut');
      if (line) setTimeout(() => { if (ctx.flow === 'playing' && onTrip()) murkToast(line); }, 2200);
    }
  });
  on('fish:action', (p) => {
    paintHold(true);
    if (onTrip() && p.letgo === true) { const line = L('sayOnce', 'firstLetGo'); if (line) murkToast(line); }
  });
  on('loop:holdFull', (p) => {
    if (p.via !== 'cast') return;
    K.toast(TL().holdFull || "Hold's full.", 'bad', { icon: 'creel', dur: 2200 });
    K.sfx?.('denied', { volume: 0.5 });
    pill.classList.remove('gw-pulse'); void pill.offsetWidth; pill.classList.add('gw-pulse');
    holdRow.classList.remove('gw-shake'); void holdRow.offsetWidth; holdRow.classList.add('gw-shake');
  });
  on('fishing:cast', () => dropTip('castEl'));
  on('fishing:bite', () => {
    if (!onTrip() || TIP.firstBite) return;
    TIP.firstBite = true;
    if (num(run()?.evening, 0) !== 1 || seenTip('fe_strike')) return;
    const text = strikeTipText(D(), K.isTouch);
    if (!text) return;
    markTip('fe_strike');
    TIP.strikeEl = tipEl(text);
  });
  on('fishing:strike', () => dropTip('strikeEl'));
  on('fishing:miss', () => dropTip('strikeEl'));
  on('fishing:escaped', () => dropTip('strikeEl'));
  on('fish:landed', () => dropTip('strikeEl'));
  on('flow:change', ({ flow }) => {
    if (flow !== 'playing') { pressEnd('pointer', { cancel: true }); pressEnd('key', { cancel: true }); dropTip('castEl'); dropTip('strikeEl'); }
  });
  on('ui:modal', (p) => { if (p.id === 'journal' && p.open === false && ctx.flow === 'home') refreshJetty(true); });

  // ------------------------------------------------------------------ per frame
  function update(dt) {
    const d = Math.max(0, Math.min(0.25, num(dt)));
    // the tutorial's clock (real time; it runs only under the Jetty or the Chart)
    const topId = K.top()?.id ?? null;
    if (ctx.flow === 'home') {
      tut.update(d, { top: topId });
      if (tut.wantsChart && topId === 'jetty') { tut.onTile('chart'); openChart(); }
      if (J.line && topId === 'jetty') { J.lineT += d; if (J.lineT > J.lineHold) J.line = null; }
      if (topId === 'jetty') refreshJetty();
    }
    if (!onTrip() || ctx.flow !== 'playing') return;
    paintHold();
    // the Home pill: hidden (no pointer) while home is not allowed; it pulses on a full hold; the press-and-hold ring
    const can = G('canGoHome', { fromPause: false });
    const ok = can?.ok === true;
    pill.classList.toggle('gw-on', ok);
    const full = holdFull();
    pill.classList.toggle('gw-full', full);
    if (!ok && P.press) pressEnd(P.press.src, { cancel: true });
    if (P.press) {
      P.press.t += d;
      const ph = pillHold(P.press.t, false);
      if (Math.abs(ph.k - P.k) > 0.004) { P.k = ph.k; pill.style.setProperty('--k', ph.k.toFixed(3)); }
      if (ph.fire && !P.fired) { const src = P.press.src; fireHome(src); pressEnd(src, { cancel: true }); }
    }
    // the first trip's two words
    const fs = ctx.fishing && !ctx.fishing.isStub ? ctx.fishing.state : 'idle';
    TIP.since += d;
    if (castTipDue({ evening: num(run()?.evening, 0), seen: seenTip('fe_cast'), state: fs, since: TIP.since, after: num(D().LOOP?.tutorial?.castTipAfter, 1.5), shown: !!TIP.castEl })
      && !K.hasBlocking()) {
      const text = D().FIRST_EVENING?.tips?.fe_cast;
      if (text) { markTip('fe_cast'); TIP.castEl = tipEl(text); }
    }
    // Murk's first quiet water (once a save; never during a bite)
    if (!quietSaid) {
      const F = ctx.fishing?.view?.favour;
      if (typeof F?.bitesLeft === 'number' && F.bitesLeft <= 0 && (fs === 'waiting' || fs === 'idle')) {
        quietSaid = true;
        const line = L('sayOnce', 'firstQuiet');
        if (line) murkToast(line);
      }
    }
  }

  /** ui's handleKey on a trip (T58): the parked keys are swallowed; H is the Home pill's press and hold (PLAN CHOICE 9). */
  function handleKey(code) {
    if (!onTrip() || ctx.flow !== 'playing') return false;
    if (tripKeySwallow(code)) return true;
    if (code === 'KeyH') { if (!P.press) { pressStart('key'); if (P.press && holdFull()) { fireHome('key'); pressEnd('key', { cancel: true }); } } return true; }
    return false;
  }

  return {
    update, handleKey, openJetty, openTally, openShelf, openChart, openHomePause, paintHold,
    /** the tutorial's machine (its state, step and cue(): PLAN §3.6) */
    tutorial: tut,
    pill, holdRow,
    debug: () => ({
      tutorial: { step: tut.step, active: tut.isActive(), cue: tut.cue() },
      hold: [...holdRow.querySelectorAll('.gw-slot')].map((c) => c.dataset.filled),
      pill: { on: pill.classList.contains('gw-on'), pulse: pill.classList.contains('gw-pulse'), k: P.k, held: !!P.press },
      tips: { cast: !!TIP.castEl, strike: !!TIP.strikeEl },
    }),
  };
}
