// ui-sheet.js — the Wick's sheet, "Taper's Sheet" (docs/loop/SHEET.md v2 §2–§6; the user's answers 41–43): the Journal's first tab, a
// page of Murk's paper on the Journal's night ink. Left (or first, on a phone) what you are and what you own: the Wick and its passive's
// exact numbers, Tackle (rod, line, reel; the lure and the bait on the hook), Raft, Home and the parts you found, each an engraved plate
// with its notches, what it does, and the next tier Murk sells with its price and its effect as a chance. Right what it does: the picks
// (where, the hour, the class), Buffs (every modifier on, each with its move as a chance) and Odds (how big they run here, who bites and
// your odds). On a phone one column: the head, a jump row, Buffs, Tackle, Raft, Home, Odds. The sheet is a log: it is the one page odds
// live on, and it is never open while a line is out. Every number is the model's (src/loop-sheet.js); every word is TEXT_LOOP's, the
// built formatters' or a name.
//
//   sheetView(model, D, {names, phone})   the page in words (pure strings, node-testable: S11 runs textAllowed over them)
//   createSheetView(K)                    {render(entry, content), open state helpers, onClose(entry)}; its CSS injected once
import * as AF from './ui-af.js';
import { termWords } from './ui-v3.js';
import { engrave } from './murk-engrave.js';
import { wickPortrait, passiveIcon, icon } from './ui-icons.js';
import { GEAR_GLYPH, CHALK_TICK } from './ui-gear.js';
import { PAPER_NOISE, FIBRE, CORNER, RULE } from './ui-catalogue-murk.js';
import { drawFindArt } from './ui-finds.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const arr = (v) => (Array.isArray(v) ? v : []);
const fill = (tpl, vars = {}) => String(tpl ?? '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m));
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder'];
const HOURS = ['day', 'dusk', 'night'];
const HOUR_GLYPH = { day: 'sun', dusk: 'dusk', night: 'moon' };
const SLATE = '#4a4e60';   // the Slate Cloak Dye on the portrait (actors-looks LOOK_COLOURS.slate)

// ---------------------------------------------------------------- figures as the logs print them
/** A share of the bites: whole percent, "<1%" under one (WC-3's rule: every fish that won't take the hook reads "<1%"). */
export function sharePct(D, p) { const v = num(p) * 100; return v < 1 ? (D?.TEXT_LOOP?.log?.under ?? '') : `${Math.round(v)}%`; }
/** A land chance: the logs' whole percent, rounded down (data.catchDisplay); null → "—". */
export function landPct(D, p) { if (p == null) return '—'; const n = typeof D?.catchDisplay === 'function' ? D.catchDisplay(p) : Math.floor(p * 100); return `${n}%`; }
/** A size share: whole percent, "<1%" under a half, "—" where the class cannot be rolled. */
function sizePct(D, p) { if (!(p > 1e-9)) return '—'; const v = p * 100; return v < 0.5 ? (D?.TEXT_LOOP?.log?.under ?? '') : `${Math.round(v)}%`; }
const signed = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2).replace(/0$/, '')}` : `+${String(Math.round(v * 100) / 100)}`);
const classLabel = (D, c) => AF.classLabel(D, c);

/**
 * The page in words (SHEET §6). model = loop-sheet.sheetModel's; o = {names (species id → name), phone}. Every string here is drawn as
 * one text node; S11 checks each passes ui-loop.textAllowed(t, {screen: 'sheet'}).
 */
export function sheetView(model, D, { names = {}, phone = false } = {}) {
  const T = D?.TEXT_LOOP || {}, TS = T.sheet || {}, M = model || {};
  const nm = (id) => names[id] || D?.SPECIES_BY_ID?.[id]?.name || String(id || '');
  const wickName = arr(D?.CHARACTERS).find((c) => c?.id === M.wickId)?.name || 'The Wick';
  const gearName = (id) => T.gearItems?.[id] ?? arr(D?.BAITS).find((b) => b?.id === id)?.name ?? arr(D?.LURES).find((l) => l?.id === id)?.name ?? id;
  const placeName = (id) => (typeof D?.loopPlace === 'function' ? D.loopPlace(id)?.name : null) || id;
  const waterName = arr(D?.ZONES).find((z) => z?.id === M.water)?.name || '';
  const findName = (id) => T.finds?.items?.[id]?.name || id;
  const lookName = (id) => T.lookNames?.[id] || id;
  const cls = M.picks?.cls || 'trophy';
  const move = (mv, { next = false } = {}) => (mv ? fill(next ? TS.moveNext : TS.move, { what: CLASSES.includes(mv.what) ? classLabel(D, mv.what) : nm(mv.what), from: sharePct(D, mv.from), to: sharePct(D, mv.to) }) : '');
  const cmpLine = (c) => (c && M.odds?.ref ? AF.compareLine(D, { speciesId: M.odds.ref.speciesId, sizeClass: M.odds.ref.cls }, c.from, c.to, { speciesName: nm(M.odds.ref.speciesId) }) : '');
  const nextLine = (n) => (n ? fill(T.next || 'Next: {name} · {price}', { name: n.name, price: n.price }) : '');
  const notchLabel = (n) => fill(TS.notches || '{n} of {of}', { n: n?.on ?? 0, of: n?.of ?? 0 });
  // ---- the head
  const ex = M.wick?.exact;
  const head = {
    name: wickName, title: fill(TS.title, { name: wickName }), passive: T.passives?.[M.wickId] || '', line: T.wicks?.[M.wickId] || '',
    exact: ex ? fill(TS.exact?.[ex.id], { ...ex.values, ...(ex.id === 'taper' ? { cap: `${ex.values.cap}%` } : {}) }) : '',
    worn: arr(M.wick?.worn).map((l) => ({ key: l.key, name: l.found ? findName(l.id) : lookName(l.id), fresh: !!l.fresh })),
  };
  // ---- Tackle
  const slotPlate = (p) => {
    const lines = [];
    if (p.slot === 'rod') lines.push(fill(TS.cast, { m: p.values.castMax, n: `${p.values.strike}%` }));
    lines.push(AF.gearLine(D, { kind: p.slot, hold: p.values.hold }));
    return { key: p.key, slot: p.slot, level: p.level, name: p.name, notches: p.notches, notchLabel: notchLabel(p.notches), lines, fresh: !!p.fresh,
      figure: p.slot === 'rod' ? `${p.values.castMax} m` : `+${p.values.hold} Hold`,
      next: p.next ? { id: p.next.id, text: nextLine(p.next), compare: cmpLine(p.next.compare) } : null, art: { id: p.key, slot: p.slot, level: p.level } };
  };
  const hk = M.tackle?.hook || {};
  const itemWords = (kind, id) => {
    if (!id) return [];
    const out = [];
    const legend = id === D?.LOOP?.legendBait?.[M.water]?.id;
    if (legend) return [T.shelf?.[id] || ''].filter(Boolean);
    const pl = hk.plates?.[kind];
    if (pl?.hold) out.push(AF.gearLine(D, { kind, hold: pl.hold, targets: { suits: true, met: num(pl.suits?.met) } }));
    if (kind === 'bait') {
      if (D?.BALANCE?.favour?.tackle?.bait?.[id]) out.push(T.shelf?.keel || 'Bigger fish.');
      if (id === 'cut_strip') out.push(TS.bigger?.predator || '');
      const b = arr(D?.BAITS).find((x) => x?.id === id)?.bonus || {};
      if (num(b.biteSpeed) > 0) out.push(fill(TS.sooner, { k: Math.round((1 + num(b.biteSpeed)) * 100) / 100 }));
      if (num(b.rarityBonus) > 0) out.push(TS.rarer || '');
    } else {
      const L = arr(D?.LURES).find((x) => x?.id === id), LL = D?.LOOP?.lures?.[id] || {};
      if (L?.family && TS.bigger?.[L.family] && num(D?.BALANCE?.favour?.tackle?.lure?.[id], num(L.favour))) out.push(TS.bigger[L.family]);
      if (arr(LL.giants).length) out.push(fill(TS.giants, { k: num(LL.share, 1.5) }));
    }
    if (pl?.compare) out.push(cmpLine(pl.compare));
    return out.filter(Boolean);
  };
  const hookPlate = (kind) => {
    const id = kind === 'lure' ? hk.lure : hk.bait;
    const pl = hk.plates?.[kind] || {};
    return { kind, id, name: id ? gearName(id) : '', count: kind === 'bait' && id ? pl.count : null, lines: itemWords(kind, id), fresh: !!pl.fresh,
      figure: id ? (kind === 'lure' ? (pl.hold ? `+${pl.hold} Hold` : '') : String(num(pl.count))) : '',
      art: id ? { slot: kind === 'lure' ? 'lure' : (id === D?.LOOP?.legendBait?.[M.water]?.id ? 'bait' : 'tin'), id } : { slot: 'hook', id: 'bare' } };
  };
  const chips = (kind) => {
    const list = kind === 'lure' ? arr(hk.lures).map((id) => ({ id, count: null })) : arr(hk.baits);
    const on = kind === 'lure' ? hk.lure : hk.bait;
    return [...list.map((c) => ({ id: c.id, glyph: GEAR_GLYPH[c.id] || (kind === 'lure' ? 'lure' : 'worm'), name: gearName(c.id), count: c.count, on: c.id === on,
      tipped: kind === 'bait' && c.id === on && !!hk.lure })), { id: null, glyph: null, name: '—', count: null, on: kind === 'bait' && !hk.bait && !hk.lure }];   // (one thing on the hook: one pressed)
  };
  const tackle = {
    head: T.tabs?.tackle || 'Tackle',
    rating: M.tackle?.rating ? AF.ratingLine(D, M.tackle.rating, { speciesName: nm(M.tackle.rating.reference) }) : '',
    plates: arr(M.tackle?.slots).map(slotPlate),
    // what a Clean strike adds (the gauge's notch; CATCH_V3.strike.clean, never typed): one quiet line
    hookSet: num(D?.CATCH_V3?.strike?.clean, 0) > 0 && TS.hookSet ? fill(TS.hookSet, { hold: num(D.CATCH_V3.strike.clean, 0) }) : '',
    hook: { lure: hookPlate('lure'), bait: hookPlate('bait'), lureChips: chips('lure'), baitChips: chips('bait'), canFit: !!hk.canFit, tipped: !!hk.tipped },
  };
  // ---- Raft and Home
  const raftPlate = (p) => {
    const out = { key: p.key, slot: p.slot, level: p.level, name: p.name, owned: !!p.owned, notches: p.notches, notchLabel: notchLabel(p.notches), lines: [], fresh: !!p.fresh,
      figure: '', ticks: null, dots: null, next: null, night: false, art: { slot: p.slot, level: p.owned ? p.level : Math.max(1, p.level + 1) } };
    const nx = p.next ? { id: p.next.id, text: nextLine(p.next), extra: '' } : null;
    if (p.slot === 'hold') {
      out.ticks = { n: p.values.slots, extra: p.values.extra }; out.dots = p.values.good;
      out.art = { slot: 'hold', level: p.level };
      if (nx) { nx.ticks = p.next.slots; nx.dots = p.next.good; }
    } else if (!p.owned) { /* not owned yet: faint, no line and no number */ }
    else if (p.slot === 'oars') { out.lines.push(T.shelf?.oars || '', `+${p.values.speed.toFixed(1)} m/s`); out.figure = `+${p.values.speed.toFixed(1)} m/s`; }
    else if (p.slot === 'keel') { out.lines.push(T.shelf?.keel || '', move(p.move)); out.figure = p.figure ? `${classLabel(D, p.figure.what)} ${sharePct(D, p.figure.to)}` : ''; }
    else if (p.slot === 'lantern') { out.lines.push(T.shelf?.lantern || '', move(p.move)); out.night = true; out.figure = p.figure ? `${classLabel(D, p.figure.what)} ${sharePct(D, p.figure.to)}` : ''; }
    else if (p.slot === 'orders') { out.lines.push(T.shelf?.orders || ''); out.ticks = { n: p.values.count, chalk: true }; }
    else if (p.slot === 'baitBed') { out.lines.push(T.shelf?.baitBed || ''); out.tin = p.values.n; out.figure = String(p.values.n); }
    else if (p.slot === 'wall') out.lines.push(T.shelf?.wall || '');
    if (nx) {
      if (p.slot === 'oars') nx.extra = `+${num(p.next.speed).toFixed(1)} m/s`;
      if ((p.slot === 'keel' || p.slot === 'lantern') && p.next.move) nx.extra = move(p.next.move, { next: true });
      if (p.slot === 'lantern') nx.night = true;
      if (p.slot === 'orders') nx.ticks = p.next.count;
      if (p.slot === 'baitBed') nx.tin = p.next.n;
    }
    out.lines = out.lines.filter(Boolean);
    out.next = p.owned || p.slot === 'hold' ? nx : null;
    out.shelfId = !p.owned && p.slot !== 'hold' && p.next ? p.next.id : null;   // (not owned yet: no line, no number; a tap at home opens the book there)
    return out;
  };
  const raft = { head: T.tabs?.raft || 'Raft', plates: arr(M.raft).map(raftPlate), looks: arr(M.raftLooks).map((l) => ({ key: l.key, name: l.found ? findName(l.id) : lookName(l.id), fresh: !!l.fresh })) };
  const home = { head: T.tabs?.home || 'Home', plates: arr(M.home).map(raftPlate),
    parts: arr(M.parts).map((p) => ({ key: p.key, id: p.id, name: findName(p.id), effect: p.effect, n: `+${p.effect.n}`, fresh: !!p.fresh })),
    looks: arr(M.homeLooks).map((l) => ({ key: l.key, name: l.found ? findName(l.id) : lookName(l.id), fresh: !!l.fresh })) };
  // ---- Buffs
  const P = M.picks || {};
  const whereName = P.place === 'last' ? TS.lastCast : P.place ? placeName(P.place) : waterName;
  const buffRow = (b) => {
    const e = b.effect || {}, s = b.source || {};
    const r = { key: b.key, glyph: 'star', name: '', effect: [], move: move(b.move), night: !!b.night, ticks: null, dots: null, tin: null };
    if (e.kind === 'exact') { r.glyph = 'passive'; r.name = T.passives?.[s.id] || ''; r.effect = [head.exact]; }
    else if (s.kind === 'bait') {
      r.glyph = GEAR_GLYPH[s.id] || 'worm'; r.name = gearName(s.id);
      r.effect = [e.kind === 'bigger' ? (T.shelf?.keel || 'Bigger fish.') : e.kind === 'sooner' ? fill(TS.sooner, { k: e.value }) : e.kind === 'rarer' ? TS.rarer : e.kind === 'family' ? TS.bigger?.[e.family] : ''];
    } else if (s.kind === 'lure') { r.glyph = GEAR_GLYPH[s.id] || 'lure'; r.name = gearName(s.id); r.effect = [e.kind === 'giants' ? fill(TS.giants, { k: e.value }) : TS.bigger?.[e.family] || '']; }
    else if (e.kind === 'keel') { r.glyph = 'hull'; r.name = T.gearNames?.keel?.[s.level - 1] || ''; r.effect = [T.shelf?.keel || '']; }
    else if (e.kind === 'lantern') { r.glyph = 'lantern'; r.name = T.gearNames?.lantern?.[s.level - 1] || ''; r.effect = [T.shelf?.lantern || '']; }
    else if (e.kind === 'creel') { r.glyph = 'creel'; r.name = arr(M.raft)[0]?.name || ''; r.ticks = { n: e.value, extra: arr(M.raft)[0]?.values?.extra || 0 }; }
    else if (e.kind === 'good') { r.glyph = 'bobber'; r.name = TS.good; r.goods = arr(e.list).map((g) => ({ name: g.id ? placeName(g.id) : waterName, n: g.n })); }
    else if (e.kind === 'glass') { r.glyph = 'lens'; r.name = findName(s.id); r.dots = 1; r.effect = []; }
    else if (e.kind === 'orders') { r.glyph = 'ledger'; r.name = T.gearNames?.orders?.[s.level - 1] || ''; r.effect = [T.shelf?.orders || '']; r.ticks = { n: e.value, chalk: true }; }
    else if (e.kind === 'bed') { r.glyph = 'worm'; r.name = s.level ? (T.homeNames?.baitBed?.[s.level - 1] || '') : findName('moat_bollard'); r.effect = [T.shelf?.baitBed || '']; r.tin = e.value; }
    else if (e.kind === 'oars') { r.glyph = 'oar'; r.name = T.gearNames?.oars?.[s.level - 1] || ''; r.effect = [T.shelf?.oars || '', `+${num(e.value).toFixed(1)} m/s`]; }
    else if (e.kind === 'letGo') { r.glyph = 'hand'; r.name = T.letGo || 'Let go'; r.effect = []; }
    else if (e.kind === 'quiet') { r.glyph = 'wave'; r.name = TS.quiet || ''; r.effect = []; }
    r.effect = r.effect.filter(Boolean);
    return r;
  };
  let buffRows = arr(M.buffs).map(buffRow);
  if (phone) buffRows = buffRows.filter((r) => r.glyph !== 'passive');   // (the head sits right above it on a phone)
  const buffs = { head: TS.buffs || 'Buffs', where: whereName, hour: P.light, hourName: TS.hours?.[P.light] || '', cls: classLabel(D, cls), rows: buffRows };
  // ---- Odds
  const O = M.odds || {};
  const choices = arr(P.choices).map((c) => ({ id: c.id, kind: c.kind, name: c.id === 'last' ? TS.lastCast : c.id ? placeName(c.id) : waterName, on: c.id === P.place,
    glyph: c.kind === 'open' ? 'kind_open' : c.kind === 'last' ? 'bobber' : `kind_${c.kind}` }));
  const hours = HOURS.map((id) => ({ id, glyph: HOUR_GLYPH[id], label: TS.hours?.[id] || id, on: id === P.light, dim: !!P.nightOnly && id !== 'night' }));
  const classes = CLASSES.map((id) => ({ id, label: classLabel(D, id), on: id === cls }));
  const termName = (t) => (t.family === 'place' ? placeName(t.id) : t.family === 'tackle' && (t.id === 'keel' || t.id === 'lantern')
    ? (T.gearNames?.[t.id]?.[num(M.raft?.find?.((p) => p.slot === t.id)?.level, 1) - 1] || '') : t.family === 'letGo' ? (T.letGo || 'Let go') : t.family === 'quiet' ? (TS.quiet || '')
    : termWords(t, D));
  const here = { terms: arr(O.here?.terms).map((t) => ({ name: termName(t), value: signed(t.value) })), total: `= ${(Math.round(num(O.here?.mu) * 100) / 100).toFixed(2)}`, notches: num(O.here?.notches) };
  const size = arr(O.size).map((s) => ({ label: s.label == null ? '' : TS.family?.[s.label] || (s.giant ? `★ ${nm(s.label)}` : nm(s.label)), cells: CLASSES.map((c) => ({ cls: c, name: classLabel(D, c), pct: sizePct(D, s.shares?.[c]) })) }));
  const rows = arr(O.rows).map((r) => ({
    id: r.id, name: nm(r.id), star: !!r.giant, legend: !!r.legend, pinned: !!r.pinned, share: sharePct(D, r.share),
    odds: r.legend ? landPct(D, r.land?.legend) : landPct(D, r.land?.[cls]),
    open: r.pinned && !r.legend ? CLASSES.map((c) => ({ cls: c, name: classLabel(D, c), pct: landPct(D, r.land?.[c]) })) : null,
  }));
  const odds = {
    head: TS.odds || 'Odds', choices, hours, classes, here, size, sizeHead: T.teach?.notches || 'How big they run here.',
    table: { whoBites: T.log?.whoBites || 'Who bites', yourOdds: D?.AUTOFISH?.text?.log?.title || 'Your odds', cls: classLabel(D, cls), rows },
    unmet: O.unmet > 0 ? fill(T.log?.unmet || 'and {n} you have not met', { n: O.unmet }) : '',
    strike: D?.AUTOFISH?.text?.log?.strike || '',
  };
  return { head, tackle, raft, home, buffs, odds, fresh: arr(M.fresh), trip: !!M.trip, jump: [['buffs', buffs.head, 'spark'], ['tackle', tackle.head, 'rod'], ['raft', raft.head, 'oar'], ['home', home.head, 'hearth'], ['odds', odds.head, 'bobber']] };
}
/** Every string the view draws (S11's scan). */
export function sheetStrings(v) {
  const out = [];
  const walk = (x, k = '') => {
    if (typeof x === 'string') { if (!['id', 'key', 'slot', 'kind', 'glyph', 'cls', 'hour', 'fresh', 'shelfId'].includes(k)) out.push(x); }
    else if (Array.isArray(x)) x.forEach((y) => walk(y, k));
    else if (isObj(x)) for (const [kk, y] of Object.entries(x)) if (!['art', 'effect', 'jump'].includes(kk) || kk === 'effect') walk(y, kk);
  };
  walk(v);
  for (const [, word] of arr(v?.jump)) out.push(word);
  return out.filter((s) => s.trim());
}

// ---------------------------------------------------------------- the page's paper and its CSS
const CSS = `
.gw-sheet { --cat-paper: rgb(238, 228, 210); --cat-paper-2: rgb(226, 214, 194); --cat-ink: rgb(38, 29, 44); --cat-ink-2: rgba(38, 29, 44, .66);
  --cat-faint: rgba(38, 29, 44, .34); --cat-amber: rgb(150, 84, 18); --sh-pink: rgb(196, 74, 136);
  position: relative; flex: 1 1 auto; min-height: 0; display: flex; gap: 14px; color: var(--cat-ink); font: 400 17px/1.3 var(--f-body); }
.gw-sheet .cat-pp { fill: var(--cat-paper); } .gw-sheet .cat-pp-stroke { stroke: var(--cat-paper); }
.gw-sh-page { position: relative; flex: 1 1 0; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; background-color: var(--cat-paper);
  background-image: ${PAPER_NOISE}, ${FIBRE}, radial-gradient(ellipse 120% 100% at 50% 50%, rgba(0,0,0,0) 62%, rgba(120, 92, 70, .14) 100%);
  border-radius: 4px; box-shadow: 0 1px 0 var(--cat-paper-2), 0 2px 0 rgb(214, 204, 190), 0 3px 0 var(--cat-paper-2), 0 12px 30px rgba(0,0,0,.45); }
/* the page's own scroll: its words fade into the paper over its last 30 px while there is more below (no line reads as cut) */
.gw-sh-scroll { position: relative; flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: clip; overscroll-behavior: contain; scrollbar-width: thin;
  scrollbar-color: rgba(38, 29, 44, .3) transparent; padding: 14px 24px 40px;
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 30px), transparent 100%); mask-image: linear-gradient(to bottom, #000 calc(100% - 30px), transparent 100%); }
.gw-sh-scroll.gw-sh-end { -webkit-mask-image: none; mask-image: none; }
/* … and its head: once scrolled, the words melt into the paper over its first 26 px (a sticky paper fog under the corners and the table's
   head), and a row slides under the stuck table head through a short fade below its rule (no line reads as cut at either edge) */
.gw-sh-fog { position: sticky; top: -14px; display: block; height: 0; z-index: 1; pointer-events: none; }
.gw-sh-fog::before { content: ''; position: absolute; left: -24px; right: -24px; top: 0; height: 26px; opacity: 0; transition: opacity .2s;
  background: linear-gradient(to bottom, var(--cat-paper) 35%, rgba(238, 228, 210, 0)); }
.gw-sheet[data-layout=phone] .gw-sh-fog { top: -10px; } .gw-sheet[data-layout=phone] .gw-sh-fog::before { left: -14px; right: -14px; }
.gw-sh-scroll.gw-sh-scrolled .gw-sh-fog::before { opacity: 1; }
.gw-sh-table thead th::after { content: ''; position: absolute; left: 0; right: 0; top: 100%; height: 10px; pointer-events: none; opacity: 0;
  background: linear-gradient(to bottom, var(--cat-paper), rgba(238, 228, 210, 0)); }
.gw-sh-table.gw-sh-stuck thead th::after { opacity: 1; }
.gw-mbtn.gw-loop-sheet.gw-locked > span, .gw-mbtn.gw-loop-sheet.gw-locked .gw-sh-wick { opacity: .32; }
.gw-sh-corner { position: sticky; display: block; height: 0; z-index: 2; pointer-events: none; }
.gw-sh-corner .gw-mb-corner { position: absolute; width: 26px; height: 26px; color: var(--cat-ink-2); }
.gw-sh-corner--t .gw-mb-corner:first-child { left: -16px; top: -8px; } .gw-sh-corner--t .gw-mb-corner:last-child { right: -16px; top: -8px; transform: scaleX(-1); }
.gw-sh-sec { margin: 0 0 14px; scroll-margin-top: 8px; }
.gw-sh-h { display: flex; flex-direction: column; align-items: center; margin: 14px 0 8px; }
.gw-sh-h h3 { margin: 0; font: 400 22px/1 var(--f-fell); letter-spacing: .14em; text-transform: uppercase; color: var(--cat-ink); }
.gw-sh-h .gw-mb-rule { display: block; width: 62%; height: 8px; color: var(--cat-ink-2); margin-top: 3px; }
/* the head: the Wick */
.gw-sh-head { display: grid; grid-template-columns: 92px 1fr; gap: 4px 14px; align-items: center; padding-top: 4px; }
.gw-sh-portrait { grid-row: span 2; width: 92px; height: 104px; display: flex; align-items: center; justify-content: center; }
.gw-sh-portrait svg { width: 92px; height: 104px; }
.gw-sh-name { margin: 0; font: 400 36px/1 var(--f-display); letter-spacing: .16em; text-transform: uppercase; color: var(--cat-ink); overflow-wrap: break-word; min-width: 0; }
.gw-sh-passive { display: flex; align-items: center; gap: 10px; }
.gw-sh-passive .gw-pico { width: 56px; height: 56px; flex: none; color: var(--cat-ink); }
.gw-sh-passive b { display: block; font: 400 18px/1.05 var(--f-display); letter-spacing: .12em; text-transform: uppercase; }
.gw-sh-passive span { display: block; font: 400 17px/1.25 var(--f-body); }
.gw-sh-exact { grid-column: 1 / -1; margin: 2px 0 0; font: italic 400 17px/1.3 var(--f-body); color: var(--cat-ink-2); text-wrap: balance; }
.gw-sh-worn { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.gw-sh-tag { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border: 1px solid var(--cat-ink-2); border-radius: 2px; font: 400 16px/1.1 var(--f-body); }
/* a plate */
.gw-sh-rating { margin: 0 0 8px; font: italic 400 17px/1.3 var(--f-body); text-align: center; text-wrap: balance; }
.gw-sh-hookset { margin: -2px 0 10px; font: italic 400 16px/1.3 var(--f-body); text-align: center; opacity: .78; }
.gw-sh-plate { position: relative; display: grid; grid-template-columns: 120px 1fr; gap: 2px 14px; padding: 8px 0 10px; border-top: 1px solid rgba(38, 29, 44, .22); }
.gw-sh-plate:first-of-type { border-top: none; }
.gw-sh-art { grid-row: span 6; width: 120px; height: 90px; display: flex; align-items: center; justify-content: center; }
.gw-sh-art .cat-eng { width: 120px; height: 90px; color: var(--cat-ink); }
.gw-sh-pname { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; font: 400 19px/1.1 var(--f-display); letter-spacing: .1em; text-transform: uppercase; color: var(--cat-ink); }
.gw-sh-pname b { font-weight: 400; min-width: 0; }
.gw-sh-line { font: 400 17px/1.3 var(--f-body); color: var(--cat-ink); }
.gw-sh-next { font: 400 17px/1.3 var(--f-body); color: var(--cat-ink-2); }
.gw-sh-next .gw-sh-price { color: var(--cat-amber); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.gw-sh-cmp { font: italic 400 17px/1.3 var(--f-body); color: var(--cat-ink-2); }
.gw-sh-plate.gw-faint .gw-sh-art .cat-eng { color: var(--cat-faint); opacity: .55; }
.gw-sh-plate.gw-faint .gw-sh-pname { color: var(--cat-faint); }
.gw-sh-hookrow { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); gap: 0 18px; }
.gw-sh-hookrow .gw-sh-plate { grid-template-columns: 76px 1fr; border-top: 1px solid rgba(38, 29, 44, .22); }
.gw-sh-hookrow .gw-sh-art, .gw-sh-hookrow .gw-sh-art .cat-eng { width: 76px; height: 57px; }
.gw-sh-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.gw-sh-chip { position: relative; min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 0 10px;
  border: 1px solid var(--cat-ink-2); border-radius: 3px; background: transparent; color: var(--cat-ink); font: 400 17px/1 var(--f-body); cursor: pointer; }
.gw-sh-chip .gw-ico { width: 22px; height: 22px; color: var(--cat-ink); }
.gw-sh-chip.gw-on { border-width: 2px; border-color: var(--cat-ink); padding: 0 9px; }
.gw-sh-chip.gw-on::after { content: ''; position: absolute; left: 50%; bottom: 4px; width: 5px; height: 5px; margin-left: -2.5px; border-radius: 50%; background: var(--cat-ink); }
.gw-sh-chip[disabled], .gw-sh-chip.gw-dim { opacity: .4; cursor: default; }
.gw-sh-chip:focus-visible { outline: 1.5px dashed var(--cat-ink-2); outline-offset: 2px; }
.gw-sh-chip .gw-sh-barb { width: 12px; height: 14px; color: var(--cat-ink); }
.gw-sh-chip--txt { padding: 0 9px; font: 400 17px/1 var(--f-body); }
.gw-sh-chip--txt.gw-on { padding: 0 8px; }
.gw-sh-hooks { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; } .gw-sh-hooks .gw-sh-chips { margin-top: 0; }
.gw-sh-chip--where { font: 400 17px/1 var(--f-body); letter-spacing: 0; text-transform: none; }
/* the notches: the float's slanted strokes in ink */
.gw-sh-notches { display: inline-flex; gap: 3px; align-items: center; height: 16px; }
.gw-sh-notches svg { width: 9px; height: 16px; overflow: visible; }
.gw-sh-notches .on { fill: var(--cat-ink); } .gw-sh-notches .off { fill: none; stroke: var(--cat-ink-2); stroke-width: 1.1; }
.gw-sh-ticks { display: inline-flex; gap: 2px; align-items: center; color: var(--cat-ink); }
.gw-sh-ticks svg { width: 6px; height: 16px; } .gw-sh-ticks path { stroke: currentColor; stroke-width: 2; stroke-linecap: round; fill: none; }
.gw-sh-ticks .gw-sh-ring { width: 10px; } .gw-sh-ticks .gw-sh-ring circle { fill: none; stroke: currentColor; stroke-width: 1.4; }
.gw-sh-ticks .gw-chalk-tick { display: inline-block; width: 20px; height: 15px; } .gw-sh-ticks .gw-chalk-tick svg { width: 20px; height: 15px; }
.gw-sh-ticks .gw-chalk-tick path { stroke: var(--cat-ink); stroke-width: 2; fill: none; }
.gw-sh-dots { display: inline-flex; gap: 3px; align-items: center; } .gw-sh-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--cat-ink); display: block; }
.gw-sh-tin { display: inline-flex; align-items: center; gap: 3px; } .gw-sh-tin .gw-ico { width: 20px; height: 20px; }
.gw-sh-night { display: inline-flex; vertical-align: -3px; } .gw-sh-night .gw-ico { display: inline-block; width: 18px; height: 18px; margin-right: 3px; }
.gw-sh-drop { display: inline-block; width: 9px; height: 12px; vertical-align: 1px; } .gw-sh-drop path { fill: var(--sh-pink); }
.gw-sh-small { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap: 0 18px; }
.gw-sh-small .gw-sh-plate { grid-template-columns: 72px 1fr; border-top: 1px solid rgba(38, 29, 44, .22); }
.gw-sh-small .gw-sh-art, .gw-sh-small .gw-sh-art .cat-eng { width: 72px; height: 54px; }
.gw-sh-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
/* the picks, Buffs, Odds */
.gw-sh-picks { display: flex; flex-direction: column; gap: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(38, 29, 44, .3); }
.gw-sh-pickrow { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.gw-sh-at { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; justify-content: center; margin: -2px 0 6px; font: italic 400 17px/1.2 var(--f-body); color: var(--cat-ink-2); }
.gw-sh-at .gw-ico { width: 20px; height: 20px; color: var(--cat-ink-2); }
.gw-sh-buff { display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 1px 10px; padding: 6px 0; border-top: 1px solid rgba(38, 29, 44, .16); align-items: start; }
.gw-sh-buff .gw-sh-eff { grid-column: 2; }
.gw-sh-buff:first-of-type { border-top: none; }
.gw-sh-buff > .gw-sh-bg { width: 26px; height: 26px; color: var(--cat-ink); display: flex; } .gw-sh-buff > .gw-sh-bg svg { width: 26px; height: 26px; }
.gw-sh-buff b { font: 400 17px/1.25 var(--f-body); font-weight: 600; }
.gw-sh-buff .gw-sh-eff { display: flex; flex-direction: column; gap: 1px; }
.gw-sh-move { font-variant-numeric: tabular-nums; font-weight: 600; }
.gw-sh-goods { display: flex; flex-direction: column; gap: 2px; } .gw-sh-goods span { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.gw-sh-here { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: center; margin: 4px 0 8px; font: 400 17px/1.3 var(--f-body); }
.gw-sh-here span { white-space: nowrap; } .gw-sh-here em { font-style: normal; font-variant-numeric: tabular-nums; color: var(--cat-ink-2); }
.gw-sh-size { margin: 2px 0 10px; }
.gw-sh-size h4 { margin: 4px 0 4px; font: italic 400 17px/1.2 var(--f-body); color: var(--cat-ink-2); }
.gw-sh-sline { display: flex; flex-wrap: wrap; gap: 2px 12px; padding: 3px 0; font: 400 17px/1.3 var(--f-body); }
.gw-sh-sline > b { flex: 0 0 100%; font-weight: 600; }
.gw-sh-sline span { white-space: nowrap; font-variant-numeric: tabular-nums; } .gw-sh-sline span i { font-style: normal; color: var(--cat-ink-2); margin-right: 4px; }
.gw-sh-table { width: 100%; border-collapse: collapse; font: 400 17px/1.25 var(--f-body); font-variant-numeric: tabular-nums; }
.gw-sh-table th { position: sticky; top: -14px; z-index: 1; background: var(--cat-paper); font: italic 400 17px/1.15 var(--f-body);
  color: var(--cat-ink-2); text-align: right; padding: 8px 4px 6px; border-bottom: 1.5px solid var(--cat-ink); vertical-align: bottom; line-height: 1.2; }
.gw-sh-table th span { display: block; white-space: nowrap; } .gw-sh-table th .gw-sh-dot { display: none; }
.gw-sh-table td:nth-child(n+2) { white-space: nowrap; width: 1%; }
.gw-sh-table th:first-child, .gw-sh-table td:first-child { text-align: left; }
.gw-sh-table td { padding: 0 4px; text-align: right; border-bottom: 1px solid rgba(38, 29, 44, .14); }
.gw-sh-table tr.gw-sh-row td { height: 44px; cursor: pointer; }
.gw-sh-table tr.gw-sh-row:focus-visible td { outline: none; background: rgba(38, 29, 44, .07); }
.gw-sh-table tr.gw-pinned td { font-weight: 700; }
.gw-sh-table td .gw-ico { width: 18px; height: 18px; vertical-align: -3px; margin-right: 4px; }
.gw-sh-table tr.gw-sh-open td { height: auto; padding: 2px 4px 8px; text-align: left; font-weight: 400; cursor: default; }
.gw-sh-open-l { display: flex; flex-wrap: wrap; gap: 2px 12px; } .gw-sh-open-l span { white-space: nowrap; } .gw-sh-open-l i { font-style: normal; color: var(--cat-ink-2); margin-right: 4px; }
.gw-sh-foot { margin: 8px 0 0; font: italic 400 17px/1.3 var(--f-body); color: var(--cat-ink-2); }
.gw-sh-jump { display: none; }
/* a phone: one column; plates fold to one row */
.gw-sheet[data-layout=phone] { gap: 0; }
.gw-sheet[data-layout=phone] .gw-sh-scroll { padding: 10px 14px 40px; }
.gw-sheet[data-layout=phone] .gw-sh-corner--t .gw-mb-corner:first-child { left: -11px; } .gw-sheet[data-layout=phone] .gw-sh-corner--t .gw-mb-corner:last-child { right: -11px; }
.gw-sheet[data-layout=phone] .gw-sh-head { grid-template-columns: 72px 1fr; }
.gw-sheet[data-layout=phone] .gw-sh-portrait, .gw-sheet[data-layout=phone] .gw-sh-portrait svg { width: 72px; height: 82px; }
.gw-sheet[data-layout=phone] .gw-sh-name { font-size: 29px; }
.gw-sheet[data-layout=phone] .gw-sh-h h3 { font-size: 18px; }
.gw-sheet[data-layout=phone] .gw-sh-jump { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; margin: 10px 0 0; }
.gw-sh-jbtn { min-height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: none; border: 1px solid rgba(38, 29, 44, .3);
  border-radius: 3px; color: var(--cat-ink); font: 400 16px/1 var(--f-body); cursor: pointer; padding: 4px 0; }
.gw-sh-jbtn .gw-ico { width: 22px; height: 22px; }
.gw-sheet[data-layout=phone] .gw-sh-plate { grid-template-columns: 56px 1fr; gap: 0 10px; padding: 6px 0; cursor: pointer; }
.gw-sheet[data-layout=phone] .gw-sh-art, .gw-sheet[data-layout=phone] .gw-sh-art .cat-eng { width: 56px; height: 56px; }
.gw-sheet[data-layout=phone] .gw-sh-art { grid-row: span 1; }
.gw-sheet[data-layout=phone] .gw-sh-fold { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; min-height: 56px; min-width: 0; }
.gw-sheet[data-layout=phone] .gw-sh-fold .gw-sh-pname { flex: 1 1 9em; min-width: 0; font-size: 17px; letter-spacing: .06em; }
.gw-sheet[data-layout=phone] .gw-sh-fold .gw-sh-fig { margin-left: auto; }   /* (a name keeps its words whole: the figure drops below it when they do not fit beside) */
.gw-sheet[data-layout=phone] .gw-sh-fig { flex: none; display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; font: 600 17px/1 var(--f-body); font-variant-numeric: tabular-nums; }
.gw-sheet[data-layout=phone] .gw-sh-plate:not(.gw-open) .gw-sh-more { display: none; }
.gw-sheet[data-layout=phone] .gw-sh-plate.gw-open .gw-sh-more { grid-column: 1 / -1; }
.gw-sheet[data-layout=phone] .gw-sh-hookrow, .gw-sheet[data-layout=phone] .gw-sh-small { grid-template-columns: 1fr; }
.gw-sheet[data-layout=phone] .gw-sh-hookrow .gw-sh-plate, .gw-sheet[data-layout=phone] .gw-sh-small .gw-sh-plate { grid-template-columns: 56px 1fr; }
.gw-sheet[data-layout=phone] .gw-sh-hookrow .gw-sh-art, .gw-sheet[data-layout=phone] .gw-sh-small .gw-sh-art,
.gw-sheet[data-layout=phone] .gw-sh-hookrow .gw-sh-art .cat-eng, .gw-sheet[data-layout=phone] .gw-sh-small .gw-sh-art .cat-eng { width: 56px; height: 56px; }
.gw-sheet[data-layout=phone] .gw-sh-buff { grid-template-columns: 26px minmax(0, 1fr); gap: 0 10px; }
.gw-sheet[data-layout=phone] .gw-sh-chip--txt { padding: 0 4px; font-size: 16px; } .gw-sheet[data-layout=phone] .gw-sh-chip--txt.gw-on { padding: 0 3px; }
/* (a phone's picks a little tighter, the review at 358 px: two Where chips to a row, the five classes on one row) */
.gw-sheet[data-layout=phone] .gw-sh-pickrow { gap: 5px; }
.gw-sheet[data-layout=phone] .gw-sh-chip--where { padding: 0 5px; gap: 3px; font-size: 16px; } .gw-sheet[data-layout=phone] .gw-sh-chip--where.gw-on { padding: 0 4px; }
/* a section a jump or an Odds › brings to the top sits below the page's top fade */
.gw-sh-sec, .gw-sh-picks { scroll-margin-top: 24px; }
.gw-sheet[data-layout=phone] .gw-sh-buff .gw-sh-eff { grid-column: 2; }
.gw-sheet[data-layout=phone] .gw-sh-table td:first-child { word-break: normal; overflow-wrap: anywhere; }
.gw-sheet[data-layout=desktop] .gw-sh-fold { display: contents; }
.gw-sheet[data-layout=desktop] .gw-sh-fig { display: none; }
.gw-sheet[data-layout=desktop] .gw-sh-more { display: contents; }
.gw-loop-on .gw-p-catalogue.gw-p-sheet .gw-pc { overflow: hidden; }
.gw-tab .gw-tab-wick { display: inline-flex; width: 22px; height: 26px; } .gw-tab .gw-tab-wick svg { width: 22px; height: 26px; }
.gw-tab .gw-sh-drop, .gw-mbtn .gw-sh-drop { margin-left: 2px; }
.gw-mbtn .gw-sh-wick { display: inline-flex; width: 24px; height: 28px; margin-right: 2px; } .gw-mbtn .gw-sh-wick svg { width: 24px; height: 28px; }
/* a phone: the Journal's head is the page's own running head, "Taper's Sheet" (the user's answer 42), one line clear of the close X, and
   the tab row below it; the row (gw-tabs--sheet) fits its four tabs in 302 px at 358: the sheet's tab is the portrait alone from the first
   paint (its accessible name the full label), the words 16 px, the count badges dropped only when the row would still not fit */
@media (max-width: 700px) {
  .gw-loop-on .gw-p-catalogue.gw-p-sheet .gw-ph { display: block; padding: 12px 52px 0; margin: 0; }
  .gw-loop-on .gw-p-catalogue.gw-p-sheet .gw-ph .gw-pdiv, .gw-loop-on .gw-p-catalogue.gw-p-sheet .gw-ph .gw-psub { display: none; }
  .gw-loop-on .gw-p-catalogue.gw-p-sheet .gw-ph h2 { font-size: 20px; line-height: 28px; margin: 0; letter-spacing: .12em; white-space: nowrap; overflow: visible; }
  .gw-loop-on .gw-p-catalogue.gw-p-sheet .gw-tabs { margin-top: 4px; }
  .gw-loop-on .gw-p-catalogue .gw-tabs--sheet .gw-tab { padding: 0 7px 6px; min-height: 44px; font-size: 16px; letter-spacing: .04em; gap: 4px; }
  .gw-loop-on .gw-p-catalogue .gw-tabs--sheet .gw-badge { font-size: 16px; }
  .gw-loop-on .gw-p-catalogue .gw-tabs--sheet .gw-tab--giants { min-width: 44px; }
  .gw-loop-on .gw-p-catalogue .gw-tabs--sheet .gw-tab--sheet { min-width: 48px; }
  .gw-loop-on .gw-p-catalogue .gw-tabs--sheet .gw-tab--sheet .gw-tab-lab { display: none; }
  .gw-loop-on .gw-p-catalogue .gw-tabs--tight .gw-badge { display: none; }
}
@media (prefers-reduced-motion: reduce) { .gw-sheet * { transition: none !important; } }
`;
const DROP = '<i class="gw-sh-drop" aria-hidden="true"><svg viewBox="0 0 9 12"><path d="M4.5 0.6 C3 3.6 1 5.6 1 8 a3.5 3.5 0 0 0 7 0 C8 5.6 6 3.6 4.5 0.6Z"/></svg></i>';
const BARB = '<svg class="gw-sh-barb" viewBox="0 0 12 14" aria-hidden="true"><path d="M6 1 V9 a3 3 0 0 1 -5 2 M6 9 l3 -3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
/** The notches: one solid stroke for each tier owned, a hollow one for each Murk sells that you do not. */
export function notchesHtml(n = {}) {
  const on = Math.max(0, num(n.on)), of = Math.max(on, num(n.of));
  let s = '';
  for (let i = 0; i < of; i++) s += `<svg viewBox="0 0 9 16" aria-hidden="true"><path class="${i < on ? 'on' : 'off'}" d="M4.6 1 H8.4 L4.4 15 H0.6 Z"/></svg>`;
  return s;
}
const ticksHtml = (t) => {
  if (!t) return '';
  if (t.chalk) return Array.from({ length: Math.max(0, num(t.n)) }, () => CHALK_TICK).join('');
  const base = Math.max(0, num(t.n) - num(t.extra));
  let s = '';
  for (let i = 0; i < base; i++) s += '<svg viewBox="0 0 6 16" aria-hidden="true"><path d="M3 2 V14"/></svg>';
  for (let i = 0; i < num(t.extra); i++) s += '<svg class="gw-sh-ring" viewBox="0 0 10 16" aria-hidden="true"><circle cx="5" cy="8" r="3.6"/></svg>';
  return s;
};
const dotsHtml = (n) => Array.from({ length: Math.max(0, num(n)) }, () => '<i></i>').join('');

/** The engraving of a plate (Murk's catalogue's hand); the bare hook and the tier-0 tackle are the sheet's additions (murk-engrave). */
function artSvg(a, uid) {
  if (!a) return '';
  let card;
  if (a.slot === 'lure') card = { id: `lure:${a.id}`, slot: 'lure', lureId: a.id };
  else if (a.slot === 'tin') card = { id: `tin:${a.id}`, slot: 'tin', baitId: a.id };
  else if (a.slot === 'bait') card = { id: `bait:${a.id}`, slot: 'bait', baitId: a.id };
  else if (a.slot === 'hook') card = { id: 'hook:bare', slot: 'hook' };
  else card = { id: `${a.slot}:${a.level}`, slot: a.slot, level: a.level };
  try { return engrave(card, { uid }); } catch { return ''; }
}

/**
 * The page's picks (SHEET §3.5, §5.1): they persist for the session (never in the save but the pin), but Where and the hour belong to
 * one stretch of play. bump() begins a new stretch (a trip's start, its end, home, each landed cast: ui-sheet's bus), and a new
 * stretch drops the Where and hour picks so the defaults hold again: on a trip where the raft is and the hour it is; once a spot
 * has been fished, where you last cast (the user's answer 41). The class stays. Pure (node-tested, S15).
 *   view()             the session's picks now
 *   forEntry(state)    the picks a drawing uses: the session's with this opening's own view on top (state.picks set by openSheet)
 *   pick(state, o)     a tap on a pick
 */
export function pickSession() {
  const SPOT = ['place', 'light'];
  const unspot = (o) => { const out = { ...(isObj(o) ? o : {}) }; for (const k of SPOT) delete out[k]; return out; };
  let view = {}, at = 0, epoch = 0;
  const now = () => { if (at !== epoch) { view = unspot(view); at = epoch; } return view; };
  return {
    bump() { epoch += 1; },
    view: now,
    forEntry(st) {
      now();
      if (isObj(st.picks)) view = { ...view, ...(st.picksAt === undefined || st.picksAt === epoch ? st.picks : unspot(st.picks)) };
      st.picks = view; st.picksAt = epoch;
      return view;
    },
    pick(st, o) { now(); view = { ...view, ...(isObj(o) ? o : {}) }; st.picks = view; st.picksAt = epoch; return view; },
  };
}

/**
 * The view (DOM). K: the screens kit (ctx, h, esc, D, meta, run, sfx, entry, loop …). One instance in createScreens; render(entry,
 * content) draws the sheet tab into the Journal's content with the entry's state (state.view: the picks; state.section: where to open).
 */
export function createSheetView(K) {
  const { ctx } = K;
  const D = () => K.D();
  const report = (where, e) => { try { K.report?.(`sheet.${where}`, e); } catch { /* ignore */ } };
  try {
    if (typeof document !== 'undefined' && !document.getElementById('gw-sheet-css')) {
      const st = document.createElement('style'); st.id = 'gw-sheet-css'; st.textContent = CSS; document.head.appendChild(st);
    }
  } catch (e) { report('css', e); }
  const L = () => ctx.progression?.loop || null;
  // the picks: the session's, Where and the hour for one stretch of play (pickSession; the user's answer 41)
  const pickS = pickSession();
  try { for (const ev of ['run:start', 'run:end', 'home:enter', 'fishing:land']) ctx.bus?.on?.(ev, () => pickS.bump()); } catch (e) { report('epoch', e); }
  let uidN = 0;
  const uid = () => `sh${(uidN = (uidN + 1) % 1e6)}`;
  const phone = () => num(K.vw, typeof innerWidth === 'number' ? innerWidth : 960) < 700;
  const trip = () => { const r = K.run?.(); return !!r && r.outing === 'trip' && ctx.flow === 'playing'; };
  const names = () => Object.fromEntries(arr(D().SPECIES).map((s) => [s.id, s.name]));
  /** Where the raft is and the hour, on a trip (SHEET §5.1): the raft's water (a mist bank is the open water), the light. */
  function live() {
    if (!trip()) return null;
    try {
      const p = ctx.player?.position, w = p ? ctx.fishing?.waterAt?.(p) : null;
      const ph = ctx.survival?.getPhaseInfo?.()?.phase ?? K.run?.()?.phase ?? 'calm';
      const light = typeof D().loopLight === 'function' ? D().loopLight(ph) : 'day';
      const lifted = new Set(arr(L()?.lifted?.()));
      const place = w && !w.mist && w.placeId && lifted.has(w.placeId) ? w.placeId : null;
      const key = w?.waterKey ?? null, fv = key ? L()?.favour?.(key) : null;
      return { waterKey: place ? place : key && !place && String(key).startsWith('open:') ? key : key, place, light, quiet: num(fv?.favour), mercy: num(fv?.mercy) };
    } catch (e) { report('live', e); return null; }
  }
  const lastCast = () => { try { return ctx.fishing?.lastCastArea?.() || null; } catch { return null; } };
  /** A chip's tap: loop.changeHook at home and on a trip (refused while a fish is on); the bare fit where the ledger has no changeHook. */
  function fitHook(kind, id) {
    try {
      const lp = L();
      if (typeof lp?.changeHook === 'function') { if (lp.canChangeHook?.() === false) return false; return lp.changeHook(kind === 'bait' ? { bait: id } : { lure: id })?.ok === true; }
      return lp?.fit?.(kind, id)?.ok === true;
    } catch (er) { report('fit', er); return false; }
  }
  function model(view = pickS.view()) {
    try { return L()?.sheet?.(view, live(), lastCast()) || null; } catch (e) { report('model', e); return null; }
  }
  /** The Wick's small portrait in the dye it wears. */
  function portrait(m, key) {
    const c = D().CHARACTER_BY_ID?.[m?.wickId || L()?.wick?.() || 'wick'] || arr(D().CHARACTERS).find((x) => x?.id === (m?.wickId || 'wick'));
    const dyed = arr(K.meta?.()?.loop?.looks).includes('slate_dye');
    return wickPortrait({ ...(c?.look || {}), ...(dyed ? { cloak: SLATE } : {}) }, { loop: true, uid: `${key}${uid()}` });
  }
  /** The page's label: "{name}'s Sheet". */
  function title() {
    const wid = D().loopWickId?.(K.run?.()?.character || L()?.wick?.()) || 'wick';
    const nm = arr(D().CHARACTERS).find((c) => c?.id === wid)?.name || 'The Wick';
    return fill(D().TEXT_LOOP?.sheet?.title || "{name}'s Sheet", { name: nm });
  }
  const hasFresh = () => { try { return arr(model()?.fresh).length > 0; } catch { return false; } };

  // ---- the "new" marks: seen once half a plate has been on screen for 0.8 s; saved when the page closes
  let seenNow = new Set(), io = null;
  const timers = new Map();
  function watch(root) {
    try { io?.disconnect(); } catch { /* ignore */ }
    if (typeof IntersectionObserver !== 'function') return;
    io = new IntersectionObserver((list) => {
      for (const e of list) {
        const k = e.target.dataset.fresh;
        if (!k) continue;
        if (e.isIntersecting && e.intersectionRatio >= 0.5) { if (!timers.has(k)) timers.set(k, setTimeout(() => { seenNow.add(k); timers.delete(k); }, 800)); }
        else if (timers.has(k)) { clearTimeout(timers.get(k)); timers.delete(k); }
      }
    }, { threshold: [0, 0.5, 1] });
    for (const el of root.querySelectorAll('[data-fresh]')) io.observe(el);
  }
  function flushSeen() {
    if (!seenNow.size) return;
    try { L()?.markSheetSeen?.([...seenNow]); } catch (e) { report('seen', e); }
    seenNow = new Set();
  }

  // ---------------------------------------------------------------- the DOM
  function render(entry, content) {
    const s = entry.state, t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    const m = model(pickS.forEntry(s));
    const lay = phone() ? 'phone' : 'desktop';
    const root = document.createElement('div');
    root.className = 'gw-sheet';
    root.dataset.layout = lay;
    root.dataset.loop = 'sheet';
    if (!m) { content.appendChild(root); return; }
    const v = sheetView(m, D(), { names: names(), phone: lay === 'phone' });
    const esc = escH;
    const dropIf = (f) => (f ? DROP : '');
    const pageL = document.createElement('div'), pageR = lay === 'phone' ? pageL : document.createElement('div');
    pageL.className = 'gw-sh-scroll gw-sh-scroll--l'; if (pageR !== pageL) pageR.className = 'gw-sh-scroll gw-sh-scroll--r';
    const leaf = (sc, side) => { const p = document.createElement('div'); p.className = `gw-sh-page gw-sh-page--${side}`; p.appendChild(sc); return p; };   // (the paper; its scroll inside)
    const corners = `<div class="gw-sh-corner gw-sh-corner--t">${CORNER}${CORNER}</div><i class="gw-sh-fog" aria-hidden="true"></i>`;
    pageL.insertAdjacentHTML('beforeend', corners);
    if (pageR !== pageL) pageR.insertAdjacentHTML('beforeend', corners);
    const secHead = (word) => `<div class="gw-sh-h"><h3>${esc(word)}</h3>${RULE.replace('gw-mb-rule', 'gw-mb-rule')}</div>`;
    const sec = (id, word) => { const el = document.createElement('section'); el.className = `gw-sh-sec gw-sh-sec--${id}`; el.dataset.sec = id; el.innerHTML = secHead(word); return el; };
    // ---- the head
    const hd = document.createElement('div');
    hd.className = 'gw-sh-head';
    hd.dataset.sec = 'head';
    hd.innerHTML = `<div class="gw-sh-portrait">${portrait(m, 'shp')}</div><h3 class="gw-sh-name"></h3>
      <div class="gw-sh-passive">${passiveIcon(m.wickId)}<div><b></b><span></span></div></div><p class="gw-sh-exact"></p><div class="gw-sh-worn"></div>`;
    hd.querySelector('.gw-sh-name').textContent = v.head.name;
    hd.querySelector('.gw-sh-passive b').textContent = v.head.passive;
    hd.querySelector('.gw-sh-passive span').textContent = v.head.line;
    hd.querySelector('.gw-sh-exact').textContent = v.head.exact;
    const worn = hd.querySelector('.gw-sh-worn');
    for (const w of v.head.worn) { const t = document.createElement('span'); t.className = 'gw-sh-tag'; if (w.fresh) t.dataset.fresh = w.key; t.textContent = w.name; if (w.fresh) t.insertAdjacentHTML('beforeend', DROP); worn.appendChild(t); }
    if (!v.head.worn.length) worn.remove();
    pageL.appendChild(hd);
    // the jump row (a phone)
    if (lay === 'phone') {
      const j = document.createElement('nav'); j.className = 'gw-sh-jump';
      for (const [id, word, g] of v.jump) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'gw-sh-jbtn'; b.dataset.jump = id;
        b.innerHTML = `${icon(g)}<span></span>`; b.querySelector('span').textContent = word;
        b.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); const t = root.querySelector(`[data-sec=${id}]`); try { t?.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch { /* ignore */ } });
        j.appendChild(b);
      }
      pageL.appendChild(j);
    }
    // ---- a plate
    const plateEl = (p, { faint = false, open = false } = {}) => {
      const el = document.createElement('div');
      el.className = `gw-sh-plate${faint ? ' gw-faint' : ''}${open ? ' gw-open' : ''}`;
      el.dataset.plate = p.key || p.kind || '';
      if (p.fresh) el.dataset.fresh = p.key;
      const art = `<div class="gw-sh-art" aria-hidden="true">${artSvg(p.art, uid())}</div>`;
      const nameRow = `<div class="gw-sh-pname"><b></b>${p.notches ? `<span class="gw-sh-notches" role="img" aria-label="${esc(p.notchLabel)}">${notchesHtml(p.notches)}</span>` : ''}${p.ticks ? `<span class="gw-sh-ticks" aria-hidden="true">${ticksHtml(p.ticks)}</span>` : ''}${p.dots ? `<span class="gw-sh-dots" aria-hidden="true">${dotsHtml(p.dots)}</span>` : ''}${dropIf(p.fresh)}</div>`;
      const fig = `<span class="gw-sh-fig">${p.night && p.figure ? `<span class="gw-sh-night">${icon('moon')}</span>` : ''}${p.tin != null && p.figure ? `<span class="gw-sh-tin">${icon('worm')}</span>` : ''}${esc(p.figure || '')}</span>`;   // (the Bait Bed's figure with its tin glyph)
      el.innerHTML = `${art}<div class="gw-sh-fold">${nameRow}${fig}</div><div class="gw-sh-more"></div>`;
      el.querySelector('.gw-sh-pname b').textContent = p.name;
      const more = el.querySelector('.gw-sh-more');
      for (const ln of arr(p.lines)) {
        const d = document.createElement('div'); d.className = /→/.test(ln) && !/with this/.test(ln) && !/:/.test(ln) ? 'gw-sh-line gw-sh-move' : /with this/.test(ln) ? 'gw-sh-cmp' : 'gw-sh-line';
        if (p.night && /→/.test(ln)) d.insertAdjacentHTML('beforeend', `<span class="gw-sh-night">${icon('moon')}</span>`);
        d.appendChild(document.createTextNode(ln)); more.appendChild(d);
      }
      if (p.tin) { const d = document.createElement('div'); d.className = 'gw-sh-line gw-sh-tin'; d.innerHTML = `${icon('worm')}<span></span>`; d.querySelector('span').textContent = String(p.tin); more.appendChild(d); }
      if (p.next) {
        const d = document.createElement('div'); d.className = 'gw-sh-next';
        const atHome = ctx.flow === 'home' && !trip();
        const n = p.next;
        const t = document.createElement(atHome ? 'button' : 'span');
        if (atHome) { t.type = 'button'; t.className = 'gw-link gw-sh-nextbtn'; t.style.cssText = 'background:none;border:none;padding:0;min-height:44px;color:inherit;font:inherit;cursor:pointer;text-align:left';
          t.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); try { K.loop?.openShelf?.({ focus: n.id }); } catch (er) { report('shelf', er); } }); }
        // (candle amber only on a price: the goal line's figure set apart, SHEET §4.3)
        const mm = /^(.*· )(\S+)$/.exec(n.text);
        if (mm) { t.appendChild(document.createTextNode(mm[1].trimEnd())); const pr = document.createElement('span'); pr.className = 'gw-sh-price'; pr.textContent = mm[2]; t.append(' ', pr); }
        else t.textContent = n.text;
        d.appendChild(t);
        if (n.ticks) d.insertAdjacentHTML('beforeend', ` <span class="gw-sh-ticks" aria-hidden="true">${ticksHtml(typeof n.ticks === 'number' && p.slot === 'orders' ? { n: n.ticks, chalk: true } : { n: n.ticks, extra: p.ticks?.extra || 0 })}</span>`);
        if (n.dots) d.insertAdjacentHTML('beforeend', ` <span class="gw-sh-dots" aria-hidden="true">${dotsHtml(n.dots)}</span>`);
        if (n.tin) { const q = document.createElement('span'); q.className = 'gw-sh-tin'; q.innerHTML = ` ${icon('worm')}<span></span>`; q.querySelector('span').textContent = String(n.tin); d.appendChild(q); }
        more.appendChild(d);
        if (n.extra) { const x = document.createElement('div'); x.className = 'gw-sh-cmp'; if (n.night) x.innerHTML = `<span class="gw-sh-night">${icon('moon')}</span>`; x.appendChild(document.createTextNode(n.extra)); more.appendChild(x); }
        if (n.compare) { const x = document.createElement('div'); x.className = 'gw-sh-cmp'; x.textContent = n.compare; more.appendChild(x); }
      }
      if (p.shelfId && ctx.flow === 'home' && !trip()) {
        el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', p.name);
        const go = (e) => { e.stopPropagation(); K.sfx?.('ui_click'); try { K.loop?.openShelf?.({ focus: p.shelfId }); } catch (er) { report('shelf', er); } };
        el.addEventListener('click', go);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(e); } });
        return el;
      }
      if (lay === 'phone') {
        el.setAttribute('role', 'button'); el.tabIndex = 0;
        el.setAttribute('aria-expanded', open ? 'true' : 'false');
        const tog = (e) => { if (e.target?.closest?.('button,.gw-sh-chip')) return; e.stopPropagation(); const o = !el.classList.contains('gw-open'); el.classList.toggle('gw-open', o); el.setAttribute('aria-expanded', o ? 'true' : 'false'); const st = entry.state; st.opened = { ...(st.opened || {}), [el.dataset.plate]: o }; };
        el.addEventListener('click', tog);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(e); } });
      }
      return el;
    };
    const opened = (k, dflt = false) => (lay === 'desktop' ? true : (s.opened && k in s.opened ? s.opened[k] : dflt));
    const chipRow = (list, kind) => {
      const row = document.createElement('div'); row.className = 'gw-sh-chips'; row.dataset.chips = kind;
      // (the user, 16 Nov 2026, superseding answer 43: the hook changes on the lake too; loop.canChangeHook decides, CONTRACT §14.19)
      const canFit = v.tackle.hook.canFit && (ctx.flow === 'home' || trip());
      for (const c of list) {
        const b = document.createElement('button'); b.type = 'button';
        b.className = `gw-sh-chip${c.on ? ' gw-on' : ''}`;
        b.dataset.fit = `${kind}:${c.id ?? ''}`;
        b.setAttribute('aria-pressed', c.on ? 'true' : 'false');
        b.setAttribute('aria-label', c.name);
        b.innerHTML = c.glyph ? `${icon(c.glyph)}${c.count != null ? `<span>${esc(c.count)}</span>` : ''}${c.tipped ? `<i role="img" aria-label="${esc(D().TEXT_LOOP?.sheet?.tipped || 'Tipped')}">${BARB}</i>` : ''}` : '<span>—</span>';
        if (!canFit) b.disabled = !c.on && true;
        if (canFit) b.addEventListener('click', (e) => { e.stopPropagation(); if (c.on) return; K.sfx?.('ui_click'); fitHook(kind, c.id ?? null); s.scroll = captureScroll(root); entry.render(); });
        row.appendChild(b);
      }
      return row;
    };
    // ---- Tackle
    const tk = sec('tackle', v.tackle.head);
    if (v.tackle.rating) { const r = document.createElement('p'); r.className = 'gw-sh-rating'; r.textContent = v.tackle.rating; tk.appendChild(r); }
    if (v.tackle.hookSet) { const r = document.createElement('p'); r.className = 'gw-sh-hookset'; r.textContent = v.tackle.hookSet; tk.appendChild(r); }
    for (const p of v.tackle.plates) tk.appendChild(plateEl(p, { open: opened(p.key, s.from === 'rack') }));
    const hr = document.createElement('div'); hr.className = 'gw-sh-hookrow';
    for (const kind of ['lure', 'bait']) {
      const hp = v.tackle.hook[kind];
      const el = plateEl({ ...hp, key: `hook:${kind}`, name: hp.name || '—' }, { open: opened(`hook:${kind}`, s.from === 'rack'), faint: !hp.id });
      el.querySelector('.gw-sh-more').appendChild(chipRow(kind === 'lure' ? v.tackle.hook.lureChips : v.tackle.hook.baitChips, kind));
      hr.appendChild(el);
    }
    tk.appendChild(hr);
    // ---- Raft, Home
    const rf = sec('raft', v.raft.head);
    { const g = document.createElement('div'); g.className = 'gw-sh-small'; for (const p of v.raft.plates) g.appendChild(plateEl(p, { faint: !p.owned, open: opened(p.key) })); rf.appendChild(g); }
    if (v.raft.looks.length) { const t = document.createElement('div'); t.className = 'gw-sh-tags'; for (const l of v.raft.looks) { const x = document.createElement('span'); x.className = 'gw-sh-tag'; if (l.fresh) x.dataset.fresh = l.key; x.textContent = l.name; if (l.fresh) x.insertAdjacentHTML('beforeend', DROP); t.appendChild(x); } rf.appendChild(t); }
    const hm = sec('home', v.home.head);
    { const g = document.createElement('div'); g.className = 'gw-sh-small'; for (const p of v.home.plates) g.appendChild(plateEl(p, { faint: !p.owned, open: opened(p.key) }));
      for (const q of v.home.parts) {
        const el = document.createElement('div'); el.className = 'gw-sh-plate gw-sh-part'; el.dataset.plate = q.key; if (q.fresh) el.dataset.fresh = q.key;
        const glyph = q.effect.glyph === 'tick' ? `<span class="gw-sh-ticks">${CHALK_TICK}</span>` : q.effect.glyph === 'dot' ? '<span class="gw-sh-dots"><i></i></span>' : `<span class="gw-sh-tin">${icon('worm')}</span>`;
        el.innerHTML = `<div class="gw-sh-art" aria-hidden="true"><canvas></canvas></div><div class="gw-sh-fold"><div class="gw-sh-pname"><b></b>${dropIf(q.fresh)}</div><span class="gw-sh-fig"></span></div>
          <div class="gw-sh-more"><div class="gw-sh-line" style="${q.effect.on ? '' : 'opacity:.45'}">${glyph} <span></span></div></div>`;
        el.querySelector('.gw-sh-pname b').textContent = q.name;
        el.querySelector('.gw-sh-more span:last-child').textContent = q.n;
        el.querySelector('.gw-sh-fig').innerHTML = `${glyph}<span></span>`; el.querySelector('.gw-sh-fig > span:last-child').textContent = q.n;
        try { drawFindArt(el.querySelector('canvas'), D(), q.id, { ink: [38, 29, 44], w: lay === 'phone' ? 56 : 72, h: lay === 'phone' ? 42 : 54 }); } catch (er) { report('findArt', er); }
        g.appendChild(el);
      }
      hm.appendChild(g); }
    if (v.home.looks.length) { const t = document.createElement('div'); t.className = 'gw-sh-tags'; for (const l of v.home.looks) { const x = document.createElement('span'); x.className = 'gw-sh-tag'; if (l.fresh) x.dataset.fresh = l.key; x.textContent = l.name; if (l.fresh) x.insertAdjacentHTML('beforeend', DROP); t.appendChild(x); } hm.appendChild(t); }
    // ---- the picks (the right page's head on a desktop, Odds' head on a phone)
    const picks = document.createElement('div'); picks.className = 'gw-sh-picks'; picks.dataset.sec = 'picks';
    const pickBtn = (cls, label, on, attrs, onPick, { dim = false, html = null } = {}) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = `gw-sh-chip ${cls}${on ? ' gw-on' : ''}${dim ? ' gw-dim' : ''}`;
      for (const [k, val] of Object.entries(attrs)) b.dataset[k] = val;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (html) { b.innerHTML = html; b.setAttribute('aria-label', label); } else { b.innerHTML = ''; b.appendChild(document.createTextNode(label)); }
      if (dim) b.disabled = true;
      b.addEventListener('click', (e) => { e.stopPropagation(); if (on || dim) return; K.sfx?.('ui_click'); onPick(); });
      return b;
    };
    const repick = (o) => { pickS.pick(s, o); s.scroll = captureScroll(root); entry.render(); };
    { const r = document.createElement('div'); r.className = 'gw-sh-pickrow';
      for (const c of v.odds.choices) { const b = pickBtn('gw-sh-chip--where', c.name, c.on, { where: c.id ?? 'open' }, () => repick({ place: c.id }), { html: `${icon(c.glyph)}<span>${esc(c.name)}</span>` }); r.appendChild(b); }
      picks.appendChild(r); }
    { const r = document.createElement('div'); r.className = 'gw-sh-pickrow';
      for (const hh of v.odds.hours) r.appendChild(pickBtn('', hh.label, hh.on, { hour: hh.id }, () => repick({ light: hh.id }), { dim: hh.dim, html: icon(hh.glyph) }));
      picks.appendChild(r); }
    { const r = document.createElement('div'); r.className = 'gw-sh-hooks'; r.append(chipRow(v.tackle.hook.lureChips, 'lure'), chipRow(v.tackle.hook.baitChips, 'bait')); picks.appendChild(r); }
    { const r = document.createElement('div'); r.className = 'gw-sh-pickrow';
      for (const c of v.odds.classes) r.appendChild(pickBtn('gw-sh-chip--txt', c.label, c.on, { cls: c.id }, () => {
        const pin = ctx.progression?.getPinned?.();
        if (pin?.speciesId && !pin.auto) { try { ctx.progression?.pinGear?.(pin.speciesId, c.id); } catch (er) { report('pin', er); } }
        repick({ cls: c.id });
      }));
      picks.appendChild(r); }
    // ---- Buffs
    const bf = sec('buffs', v.buffs.head);
    { const at = document.createElement('div'); at.className = 'gw-sh-at';
      at.innerHTML = `<span></span><span>·</span>${icon(HOUR_GLYPH[v.buffs.hour] || 'dusk')}<span>·</span><span></span>`;
      at.querySelectorAll('span')[0].textContent = v.buffs.where; at.querySelectorAll('span')[2].textContent = v.buffs.cls;
      at.querySelector('.gw-ico')?.setAttribute('aria-label', v.buffs.hourName);
      bf.appendChild(at); }
    for (const r of v.buffs.rows) {
      const el = document.createElement('div'); el.className = 'gw-sh-buff'; el.dataset.buff = r.key;
      const g = r.glyph === 'passive' ? passiveIcon(m.wickId) : icon(r.glyph);
      el.innerHTML = `<span class="gw-sh-bg" aria-hidden="true">${g}</span><b></b><div class="gw-sh-eff"></div>`;
      el.querySelector('b').textContent = r.name;
      const eff = el.querySelector('.gw-sh-eff');
      for (const t of r.effect) { const d = document.createElement('span'); d.textContent = t; eff.appendChild(d); }
      if (r.ticks) eff.insertAdjacentHTML('beforeend', `<span class="gw-sh-ticks" aria-hidden="true">${ticksHtml(r.ticks)}</span>`);
      if (r.dots) eff.insertAdjacentHTML('beforeend', `<span class="gw-sh-dots" aria-hidden="true">${dotsHtml(r.dots)}</span>`);
      if (r.tin != null) { const d = document.createElement('span'); d.className = 'gw-sh-tin'; d.innerHTML = `${icon('worm')}<span></span>`; d.querySelector('span').textContent = String(r.tin); eff.appendChild(d); }
      if (r.goods) { const gd = document.createElement('div'); gd.className = 'gw-sh-goods'; for (const q of r.goods) { const x = document.createElement('span'); x.innerHTML = `<i></i><span class="gw-sh-dots" aria-hidden="true">${dotsHtml(q.n)}</span>`; x.querySelector('i').textContent = q.name; x.querySelector('i').style.fontStyle = 'normal'; gd.appendChild(x); } eff.appendChild(gd); }
      if (r.move) { const d = document.createElement('span'); d.className = 'gw-sh-move'; if (r.night) d.innerHTML = `<span class="gw-sh-night">${icon('moon')}</span>`; d.appendChild(document.createTextNode(r.move)); eff.appendChild(d); }
      bf.appendChild(el);
    }
    // ---- Odds
    const od = sec('odds', v.odds.head);
    if (lay === 'phone') od.appendChild(picks);
    if (lay === 'desktop' && v.odds.here.terms.length) {
      const hh = document.createElement('div'); hh.className = 'gw-sh-here';
      for (const t of v.odds.here.terms) { const x = document.createElement('span'); x.innerHTML = '<span></span> <em></em>'; x.querySelector('span').textContent = t.name; x.querySelector('em').textContent = t.value; hh.appendChild(x); }
      const tot = document.createElement('span'); tot.innerHTML = `<em></em> <span class="gw-sh-notches" aria-hidden="true">${notchesHtml({ on: v.odds.here.notches, of: 5 })}</span>`; tot.querySelector('em').textContent = v.odds.here.total; hh.appendChild(tot);
      od.appendChild(hh);
    }
    { const sz = document.createElement('div'); sz.className = 'gw-sh-size';
      sz.innerHTML = `<h4><span></span>${lay === 'phone' ? ` <span class="gw-sh-notches" aria-hidden="true">${notchesHtml({ on: v.odds.here.notches, of: 5 })}</span>` : ''}</h4>`;
      sz.querySelector('h4 span').textContent = v.odds.sizeHead;
      for (const line of v.odds.size) {
        const l = document.createElement('div'); l.className = 'gw-sh-sline';
        if (line.label) { const b = document.createElement('b'); b.textContent = line.label; l.appendChild(b); }
        for (const c of line.cells) { const x = document.createElement('span'); x.innerHTML = '<i></i><span></span>'; x.querySelector('i').textContent = c.name; x.querySelector('span').textContent = c.pct; l.appendChild(x); }
        sz.appendChild(l);
      }
      od.appendChild(sz); }
    { const tb = document.createElement('table'); tb.className = 'gw-sh-table';
      tb.innerHTML = '<thead><tr><th scope="col"><span class="gw-sh-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></span></th><th scope="col"></th><th scope="col"></th></tr></thead><tbody></tbody>';
      const th = tb.querySelectorAll('th');
      th[1].textContent = v.odds.table.whoBites;
      th[2].innerHTML = '<span></span><span class="gw-sh-dot"> · </span><span></span>'; th[2].querySelectorAll('span')[0].textContent = v.odds.table.yourOdds; th[2].querySelectorAll('span')[2].textContent = v.odds.table.cls;
      const tbody = tb.querySelector('tbody');
      for (const r of v.odds.table.rows) {
        const tr = document.createElement('tr'); tr.className = `gw-sh-row${r.pinned ? ' gw-pinned' : ''}`; tr.dataset.fish = r.id; tr.tabIndex = 0;
        tr.innerHTML = `<td>${r.pinned ? `<i role="img" aria-label="${esc(D().TEXT_LOOP?.sheet?.pinned || 'Pinned')}">${icon('hook')}</i>` : ''}<span></span></td><td></td><td></td>`;
        tr.querySelector('td span').textContent = `${r.star ? '★ ' : ''}${r.name}`;
        tr.children[1].textContent = r.share; tr.children[2].textContent = r.odds;
        const pin = (e) => {
          e.stopPropagation(); if (r.legend) return; K.sfx?.('ui_click');
          try { if (r.pinned) ctx.progression?.pinGear?.(null); else ctx.progression?.pinGear?.(r.id, s.picks?.cls || m.picks.cls); } catch (er) { report('pin', er); }
          s.scroll = captureScroll(root); entry.render();
        };
        tr.addEventListener('click', pin);
        tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin(e); } });
        tbody.appendChild(tr);
        if (r.open) {
          const o = document.createElement('tr'); o.className = 'gw-sh-open';
          o.innerHTML = '<td colspan="3"><div class="gw-sh-open-l"></div></td>';
          for (const c of r.open) { const x = document.createElement('span'); x.innerHTML = '<i></i><span></span>'; x.querySelector('i').textContent = c.name; x.querySelector('span').textContent = c.pct; o.querySelector('div').appendChild(x); }
          tbody.appendChild(o);
        }
      }
      od.appendChild(tb); }
    for (const t of [v.odds.unmet, v.odds.strike]) if (t) { const p = document.createElement('p'); p.className = 'gw-sh-foot'; p.textContent = t; od.appendChild(p); }
    // ---- assemble: a desktop's spread (left you and what you own, right what it does) or a phone's column (Buffs first)
    if (lay === 'desktop') { pageL.append(tk, rf, hm); pageR.append(picks, bf, od); root.append(leaf(pageL, 'l'), leaf(pageR, 'r')); }
    else { pageL.append(bf, tk, rf, hm, od); root.append(leaf(pageL, 'l')); }
    content.appendChild(root);
    try { root.dataset.ms = (performance.now() - t0).toFixed(1); } catch { /* ignore */ }   // (the page's build time, SHEET §9's 50 ms budget)
    // where it opens: Odds (an Odds ›), Tackle (the rack), the head (the ledger, the pause), or where it was
    const sc = s.scroll;
    requestAnimationFrame(() => {
      try {
        if (sc) { restoreScroll(root, sc); s.scroll = null; return; }
        const at = s.section;
        if (at === 'odds') { const t = root.querySelector('[data-sec=odds]'); if (lay === 'desktop') pageR.scrollTop = 0; else t?.scrollIntoView({ block: 'start' }); }
        else if (at === 'tackle') { const t = root.querySelector('[data-sec=tackle]'); if (lay === 'desktop') pageL.scrollTop = Math.max(0, t.offsetTop - 28); else t?.scrollIntoView({ block: 'start' }); }   // (its head below the page's top fade)
        s.section = null;
      } catch (e) { report('scroll', e); }
    });
    watch(root);
    footFade(root);
  }
  /** The page's foot fades while there is more below, and lifts at the scroll's end (its last line whole). */
  function footFade(root) {
    for (const p of root.querySelectorAll('.gw-sh-scroll')) {
      const tb = p.querySelector('.gw-sh-table'), th = tb?.querySelector('thead th');
      const upd = () => {
        p.classList.toggle('gw-sh-end', p.scrollTop + p.clientHeight >= p.scrollHeight - 2);
        p.classList.toggle('gw-sh-scrolled', p.scrollTop > 2);
        if (th) tb.classList.toggle('gw-sh-stuck', p.scrollTop > 2 && th.getBoundingClientRect().top <= p.getBoundingClientRect().top + 1);
      };
      p.addEventListener('scroll', upd, { passive: true });
      requestAnimationFrame(upd);
    }
  }
  const captureScroll = (root) => [...root.querySelectorAll('.gw-sh-scroll')].map((p) => p.scrollTop);
  const restoreScroll = (root, sc) => { [...root.querySelectorAll('.gw-sh-scroll')].forEach((p, i) => { p.scrollTop = num(sc[i]); }); };

  // ---- live: the page re-reads the save on every change while it is open (SHEET §5.1)
  try {
    for (const ev of ['loop:fit', 'loop:buy', 'loop:hook', 'bait:change', 'fishing:found', 'home:enter', 'run:start', 'run:end', 'shelf:buy']) {
      ctx.bus?.on?.(ev, () => {
        const e = K.entry?.('journal');
        if (e && e.state?.tab === 'sheet') { e.state.scroll = (() => { try { return captureScroll(e.el); } catch { return null; } })(); e.render(); }
      });
    }
  } catch (e) { report('bus', e); }
  return { render, title, portrait: (key = 'tab') => portrait(model(), key), hasFresh, flushSeen, model, sheetView, DROP };
}
