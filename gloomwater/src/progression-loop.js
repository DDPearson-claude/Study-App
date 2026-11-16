// progression-loop.js — the Full Hold's ledger: catch, keep, sell, upgrade (docs/loop/SPEC.md §3, §4, §9; slice-1a/PLAN.md §3.3,
// §3.4; docs/loop/WICKS.md §2). A helper of progression.js only: createLoop(S) receives the shared internals `S`, as
// progression-af.js does, and becomes `ctx.progression.loop` (null off the loop). It never imports data.js: data comes from
// `S.ctx.data` or is passed in, because the tests evaluate `data.js?loop` as a module instance of its own.
//
// The pure exports (no ctx, no data import; node tests call them directly):
//   freshLoop(D) · migrateLoop(meta, D, {hasTrip}) · tallyLines(creel, {D, saleOf}) · tallyBook(metaLoop, creel, run, opts) ·
//   sellStrandedTrip(save) (the flag-off boot rule: needs no data) · shelfItems(D, metaLoop, session) · goalOf(items) ·
//   stampFirst(firsts, sp, fish, {cls, seals}) (the Wick's ledger) · v8 (SPEC §5.5): listFor(D, waterId) · listCount(meta, D, waterId) ·
//   M1 step 3a (docs/loop/m1-step3a/PLAN.md §3.2): mapCards(D, metaLoop, {meta}) · sealsOf(meta, D, waterId) · liftDue(D, metaLoop) ·
//   catalogueFor(meta, D, waterId)
// meta.loop (SPEC §9, PLAN §3.4): `holdSlots` is the bought count (3–8) for every Wick; a Wick's slots are data.loopSlots. Slice 1a
// adds `wick`, `tutorial`, `said`, `lastTrip` and `firsts` (the Wick's ledger, WICKS §2.1), and `parkedRun` only while an old descent
// waits (PLAN CHOICE 5). A trip is a run with `outing: 'trip'`; its hold IS `run.creel` (PLAN CHOICE 19).
//
// createLoop(S) is the ledger itself (PLAN §3.3, §3.4): progression.js builds it under data.LOOP_ENABLED and exposes it as
// `ctx.progression.loop` (null off the loop). LOOP_METHODS names its methods, for the fixture's fakeLoop and the tests; CONTRACT §14
// is the seam in full. Its one import is core.js's uid (never data.js).
import { uid } from './core.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const int = (v, d = 0) => Math.trunc(num(v, d));
const clampInt = (v, lo, hi) => Math.min(hi, Math.max(lo, int(v, lo)));
const SLOTS = ['rod', 'line', 'reel'];
/** The schema of meta.loop this module writes (v1 and v2 were drafts' blocks, migrated by migrateLoop's five rules). */
export const LOOP_SCHEMA = 3;
/** v5's Quiet Hull I–III, refunded by migrateLoop rule 3 (a draft-only part; never sold again). */
const V5_HULL = [100, 600, 8000];

/** Every method of `ctx.progression.loop` (PLAN §3.3, WICKS §5): createLoop and the fixture's fakeLoop both carry each. */
export const LOOP_METHODS = Object.freeze([
  'state', 'hold', 'holdFull', 'priceOf', 'saleOf', 'keep', 'letGo', 'noteBite', 'bitesSpent', 'bitesLeft', 'favour',
  'closeBite', 'refundOpenBite', 'debugGive', 'isOpen', 'listCount', 'createTrip', 'endTrip', 'lastTrip', 'markTallySeen',
  'shelf', 'goal', 'buy', 'sayOnce', 'parkRun',
  // the opening (docs/loop/OPENING.md)
  'wick', 'setWick', 'tutorial', 'beginTutorial', 'setTutorialStep', 'tutorialDone', 'resetTutorial',
  // the passives (WICKS §2.2, §2.5): Taper's flag, one per evening; Ashwick's comeback
  'taperFirstOpen', 'spendTaperFirst', 'comeback', 'consumeComeback',
  // M1 step 3a (PLAN §3.2): the bait slot, the lift, the Marked giant, the best fish there, the Chart's pick, the cards, seals and catalogue
  'fit', 'fitted', 'spendBait', 'refundBait', 'liftDue', 'markLifted', 'lifted', 'markGiant', 'takeGiantMark', 'noteBest',
  'setPick', 'pick', 'mapCards', 'seals', 'catalogue',
]);

/** The water a fresh save owns: the one LOOP.waters puts first (the Mossmere). */
/** M1 step 2 (SPEC §13 rule 3, decision 39): is a water inside what ships (its order ≤ LOOP.shipped's)? No LOOP.shipped: every water of
 *  LOOP.waters ships (the slice-1a shape). A water past it is sealed: no lake map for it is offered and no trip sails there. */
export function waterShipped(D, waterId) {
  const W = D?.LOOP?.waters, o = num(W?.[waterId]?.order, NaN);
  if (!Number.isFinite(o)) return false;
  const last = D?.LOOP?.shipped, lo = num(W?.[last]?.order, NaN);
  return !last || !Number.isFinite(lo) || o <= lo;
}
function firstWater(D) {
  const W = D?.LOOP?.waters;
  if (isObj(W)) {
    const ids = Object.keys(W).filter((id) => isObj(W[id])).sort((a, b) => num(W[a].order, 99) - num(W[b].order, 99));
    if (ids.length) return ids[0];
  }
  return D?.ZONES?.[0]?.id || 'mossmere';
}

/** A fresh meta.loop (SPEC §9, PLAN §3.4): 3 slots (LOOP.hold.start), T0, the first water owned, no Wick and no tutorial yet. */
export function freshLoop(D) {
  return {
    v: LOOP_SCHEMA, clams: 0, evenings: 0, holdSlots: int(D?.LOOP?.hold?.start, 3) || 3,
    tackle: { rod: 0, line: 0, reel: 0 }, lures: [], fitted: { lure: null, bait: null }, bait: {},
    maps: { lakes: [firstWater(D)], places: [] }, raft: { oars: 0, keel: 0, lantern: 0 }, home: { orders: 0, baitBed: 0, wall: 0, lights: 0 },
    looks: [], orders: [], legends: {}, giants: {}, prints: {}, ledgerPaid: [],
    said: {}, lastTrip: null, wick: null, tutorial: null, firsts: { seen: [], seals: [], best: {} },
    // M1 step 3a (PLAN §3.3): the places whose lift has played; the best fish there (`<placeId | open:<water>>` → {speciesId, length},
    // never a weight); the Chart's pick {water, place}, null until one is made (never filled as an object: 3b reads a non-object as the
    // tutorial's first open). LOOP_SCHEMA stays 3: the keys are additive, the fill below gives them to every block (PLAN CHOICE 1)
    lifted: [], best: {}, chartPick: null,
  };
}

/**
 * meta.loop made whole, in place (idempotent; tolerant of anything, since v1 and v2 blocks were written only by drafts): created when
 * missing, missing keys filled, holdSlots clamped to LOOP.hold.start–max (3–8), tiers to 0–6. A block older than LOOP_SCHEMA gets
 * SPEC §9's five rules: (1) flat bait counts {baitId: n} move under the first water; (2) `hold` (a ladder level 0–5) becomes
 * holdSlots = start + hold; (3) raft.hull (Quiet Hull I–III, v5 prices 100 · 600 · 8,000) is refunded as clams and deleted;
 * (4) maps.places are kept; (5) each owned lake adds its day and old place ids (no lake has any in 1a: a no-op, kept for slice 2).
 * The opening (PLAN §2.1 item 15): a block that has played (evenings > 0, a lastTrip, or `hasTrip`, a trip saved beside it) and has
 * no tutorial record gets {done: true, step: null}, and the Wick 'wick' when it has none. Returns meta.
 */
export function migrateLoop(meta, D, { hasTrip = false } = {}) {
  if (!isObj(meta)) return meta;
  const fresh = freshLoop(D), H = D?.LOOP?.hold || {}, start = int(H.start, 3) || 3, max = int(H.max, 8) || 8;
  const topTier = Math.max(0, (D?.LOOP?.tackle?.price?.length ?? 7) - 1), first = firstWater(D);
  if (!isObj(meta.loop)) meta.loop = fresh;
  const L = meta.loop;
  if (!(num(L.v) >= LOOP_SCHEMA)) {
    // rule 1: a flat bait bag belongs to the only water a v4/v5 draft sold bait for
    if (isObj(L.bait)) {
      const flat = Object.entries(L.bait).filter(([, v]) => !isObj(v));
      if (flat.length) {
        const into = isObj(L.bait[first]) ? L.bait[first] : {};
        for (const [id, n] of flat) { delete L.bait[id]; const c = Math.max(0, int(n)); if (c > 0) into[id] = int(into[id]) + c; }
        L.bait[first] = into;
      }
    }
    // rule 2: a ladder level becomes a slot count
    if (L.hold !== undefined) { if (L.holdSlots === undefined && Number.isFinite(Number(L.hold))) L.holdSlots = start + int(L.hold); delete L.hold; }
    // rule 3: the Quiet Hull is gone; its price comes back as clams
    if (isObj(L.raft) && L.raft.hull !== undefined) {
      const lv = clampInt(L.raft.hull, 0, V5_HULL.length);
      L.clams = num(L.clams) + V5_HULL.slice(0, lv).reduce((a, b) => a + b, 0);
      delete L.raft.hull;
    }
    // rule 4 needs nothing (maps.places are kept as they are); the shape is normalised below
    if (Array.isArray(L.maps)) L.maps = { lakes: L.maps, places: [] };
    // rule 5: an owned lake owns its day and old water (place ids per water arrive with slice 2's data)
    if (isObj(L.maps)) {
      const places = Array.isArray(L.maps.places) ? L.maps.places : (L.maps.places = []);
      for (const lake of Array.isArray(L.maps.lakes) ? L.maps.lakes : []) {
        for (const p of D?.LOOP?.waters?.[lake]?.places || []) if (p && (p.kind === 'day' || p.kind === 'old') && !places.includes(p.id)) places.push(p.id);
      }
    }
    L.v = LOOP_SCHEMA;
  }
  // fill and normalise (every block, every boot)
  for (const [k, v] of Object.entries(fresh)) {
    if (L[k] === undefined) { L[k] = v; continue; }
    if (isObj(v) && !isObj(L[k])) L[k] = v;
    else if (Array.isArray(v) && !Array.isArray(L[k])) L[k] = v;
  }
  for (const k of ['tackle', 'fitted', 'maps', 'raft', 'home', 'firsts']) for (const [kk, vv] of Object.entries(fresh[k])) if (L[k][kk] === undefined) L[k][kk] = vv;
  L.clams = Math.max(0, num(L.clams));
  L.evenings = Math.max(0, int(L.evenings));
  L.holdSlots = clampInt(L.holdSlots, start, max);
  for (const s of SLOTS) L.tackle[s] = clampInt(L.tackle[s], 0, topTier);
  if (!Array.isArray(L.maps.lakes)) L.maps.lakes = [first];
  L.maps.lakes = L.maps.lakes.filter((id) => typeof id === 'string');
  if (!L.maps.lakes.includes(first)) L.maps.lakes.unshift(first);
  if (!Array.isArray(L.maps.places)) L.maps.places = [];
  for (const k of ['seen', 'seals']) if (!Array.isArray(L.firsts[k])) L.firsts[k] = [];
  if (!isObj(L.firsts.best)) L.firsts.best = {};
  L.lifted = L.lifted.filter((id, i, a) => typeof id === 'string' && a.indexOf(id) === i);
  if (L.chartPick !== null && !isObj(L.chartPick)) L.chartPick = null;
  if (L.lastTrip !== null && !isObj(L.lastTrip)) L.lastTrip = null;
  if (L.tutorial !== null) L.tutorial = isObj(L.tutorial) ? { done: L.tutorial.done === true, step: typeof L.tutorial.step === 'string' ? L.tutorial.step : null } : null;
  if (L.wick !== null) L.wick = typeof D?.loopWickId === 'function' ? D.loopWickId(L.wick) : (typeof L.wick === 'string' ? L.wick : null);
  if (L.tutorial === null && (L.evenings > 0 || isObj(L.lastTrip) || hasTrip === true)) {
    L.tutorial = { done: true, step: null };
    if (L.wick === null) L.wick = 'wick';
  }
  return meta;
}

/** The ounces a hold fish's weight reads on the card (data.weightOz of data.fishWeight; pounds, PLAN §3.3), or a stand-in with no data. */
function weightKey(D, f) {
  if (typeof D?.weightOz === 'function' && typeof D?.fishWeight === 'function') {
    const sp = D.SPECIES_V3_BY_ID?.[f.speciesId] ?? D.SPECIES_BY_ID?.[f.speciesId] ?? null;
    return D.weightOz(D.fishWeight(sp, f));
  }
  return num(f.weight) > 0 ? num(f.weight) : num(f.length);   // the boot rule has no data: the stored kg, else the length
}

/**
 * The tally's rows (SPEC §8.3; pounds): one per fish in the hold, lightest first and heaviest last by the weight the card shows
 * (ties by clams, then in the order caught); legends after them and a giant last of all. A row keeps the fish's length, never a
 * weight (the weight is derived wherever it is shown). `base` is the stamped price (fish.clams, the card's number); `clams` what
 * the row pays: opts.saleOf(fish) → {base, clams, first} when given (the Wick's firsts, WICKS §2.1), else the base.
 */
export function tallyLines(creel, { D = null, saleOf = null } = {}) {
  const rows = (Array.isArray(creel) ? creel : []).filter(isObj).map((f, i) => {
    const stamped = Math.max(0, Math.round(num(f.clams)));
    const sale = typeof saleOf === 'function' ? saleOf(f) : null;
    const base = isObj(sale) && Number.isFinite(Number(sale.base)) ? Math.max(0, Math.round(Number(sale.base))) : stamped;
    const clams = isObj(sale) && Number.isFinite(Number(sale.clams)) ? Math.max(0, Math.round(Number(sale.clams))) : base;
    const line = {
      uid: f.uid ?? null, speciesId: f.speciesId ?? null, sizeClass: f.sizeClass ?? null, length: num(f.length),
      base, clams, first: isObj(sale) && sale.first === true && clams > base, giant: f.giant === true, legend: f.legendary === true,
    };
    return { line, i, w: weightKey(D, f), g: line.giant ? 2 : line.legend ? 1 : 0 };
  });
  rows.sort((a, b) => a.g - b.g || a.w - b.w || a.line.clams - b.line.clams || a.i - b.i);
  return rows.map((r) => r.line);
}

/**
 * The bookkeeping one tally makes (endTrip and the flag-off boot's sellStrandedTrip share it), on metaLoop in place: clams += the
 * total; evenings += 1; legends[id] += 1 per legend; giants[id].landed += 1 per giant; bait[run.zone] = what is left of run.bait.
 * Reads each fish's own flags (fish.legendary, fish.giant, fish.clams); never data, never ctx. Returns {lines, total}.
 */
export function tallyBook(metaLoop, creel, run, opts = {}) {
  const lines = tallyLines(creel, opts), total = lines.reduce((a, l) => a + l.clams, 0);
  if (isObj(metaLoop)) {
    metaLoop.clams = num(metaLoop.clams) + total;
    metaLoop.evenings = Math.max(0, int(metaLoop.evenings)) + 1;
    if (!isObj(metaLoop.legends)) metaLoop.legends = {};
    if (!isObj(metaLoop.giants)) metaLoop.giants = {};
    for (const l of lines) {
      if (!l.speciesId) continue;
      if (l.legend) metaLoop.legends[l.speciesId] = int(metaLoop.legends[l.speciesId]) + 1;
      if (l.giant) {
        const g = isObj(metaLoop.giants[l.speciesId]) ? metaLoop.giants[l.speciesId] : (metaLoop.giants[l.speciesId] = { landed: 0, marked: 0 });
        g.landed = int(g.landed) + 1;
      }
    }
    if (run?.zone) {
      if (!isObj(metaLoop.bait)) metaLoop.bait = {};
      metaLoop.bait[run.zone] = isObj(run.bait) ? { ...run.bait } : {};
    }
  }
  return { lines, total };
}

/**
 * The boot rule with the flag off (SPEC §9, PLAN §4.1 rule 9): a saved trip is never continued by the old game. Its hold is sold
 * into meta.loop as at a tally (the fish's stamped clams; a card still open was never kept, so it is not sold), recorded as
 * meta.loop.lastTrip {id, evening, total, lines, boot: true, seen: true}, and the run is dropped. Then, with no run left, a
 * descent parked by the loop's first Sail (meta.loop.parkedRun, PLAN CHOICE 5) goes back into save.run. Idempotent by
 * lastTrip.id; a non-trip envelope with no parked descent comes back untouched. Needs no data. Returns {save, sold, restored}.
 */
export function sellStrandedTrip(save) {
  if (!isObj(save)) return { save, sold: false, restored: false };
  let sold = false, restored = false;
  const r = save.run;
  if (isObj(r) && r.active === true && r.outing === 'trip') {
    if (!isObj(save.meta)) save.meta = {};
    if (!isObj(save.meta.loop)) save.meta.loop = { v: LOOP_SCHEMA, clams: 0, evenings: 0, legends: {}, giants: {}, bait: {} };
    const L = save.meta.loop;
    if (!(isObj(L.lastTrip) && r.id != null && L.lastTrip.id === r.id)) {
      const { lines, total } = tallyBook(L, r.creel, r);
      L.lastTrip = { id: r.id ?? null, evening: int(r.evening) || L.evenings, total, lines, boot: true, seen: true };
      sold = true;
    }
    save.run = null;
  }
  const L = save.meta?.loop;
  if (save.run == null && isObj(L) && isObj(L.parkedRun)) { save.run = L.parkedRun; delete L.parkedRun; restored = true; }
  return { save, sold, restored };
}

/** A tier's name: TACKLE's for T0–T4, LOOP.tackle.names for T5 and T6. */
function tierName(D, slot, t) {
  if (t <= 4) return D?.TACKLE?.[slot]?.[t]?.name ?? `${slot} ${t}`;
  return D?.LOOP?.tackle?.names?.[t]?.[SLOTS.indexOf(slot)] ?? `${slot} ${t}`;
}

/**
 * Murk's shelf (SPEC §8.4, PLAN CHOICEs 11 and 26), one card per slot: per tackle slot (Tackle tab) the next tier, if its shelfAt water
 * is owned; for the hold (Raft tab) the next step, up to LOOP.hold.shelfMax. A card bought while the shelf is open (its id in
 * `session`) stays in its place as {bought: true} until the shelf closes, and the last step a slot's ladder offers on this shelf
 * (1a: Hold 5, T2; M1 step 3a: Hold 6), once owned, is a permanent {bought: true} card. Prices are LOOP's (the price factor is a fish's,
 * not the shelf's). Each item: {id ('rod:1' | 'hold:4', the buy id and data-buy), tab, slot, level, name (the card's), goalName (the goal
 * line's: "Hold N" or the tier's name), line (the card's one line), price, bought}.
 * M1 step 3a: the Bait tab's legend bait {id: 'bait:<id>', slot: 'bait', baitId, water, count, consumable: true, bought: false} and the
 * Maps tab from mapCards: a place card {id: 'place:<id>', slot: 'place', placeId, kind, fish, hours, …} and the next water's card {id:
 * 'lake:<id>', slot: 'lake', waterId, sealed, seals, price (null while sealed)}. `opts.meta` (the save's meta) gives the sealed card's
 * catch seal its count.
 */
export function shelfItems(D, metaLoop, session = [], { meta = null } = {}) {
  const L = D?.LOOP; if (!L) return [];
  const ml = isObj(metaLoop) ? metaLoop : {}, T = L.tackle, TL = D.TEXT_LOOP || {}, ses = new Set(Array.isArray(session) ? session : []);
  const owned = new Set([1]);   // shelfAt 1 = the start
  for (const id of ml.maps?.lakes || []) { const o = num(L.waters?.[id]?.order, NaN); if (Number.isFinite(o)) owned.add(o); }
  const top = T.price.length - 1, onShelf = (t) => t >= 1 && t <= top && owned.has(T.shelfAt[t]);
  const out = [];
  const tier = (slot, t, bought) => ({ id: `${slot}:${t}`, tab: 'tackle', slot, level: t, name: tierName(D, slot, t), goalName: tierName(D, slot, t),
    line: TL.shelf?.[slot] ?? '', price: T.price[t], bought });
  for (const slot of SLOTS) {
    const cur = clampInt(ml.tackle?.[slot], 0, top);
    if (cur >= 1 && ses.has(`${slot}:${cur}`)) out.push(tier(slot, cur, true));
    else if (onShelf(cur + 1)) out.push(tier(slot, cur + 1, false));
    else if (cur >= 1) out.push(tier(slot, cur, true));
  }
  const H = L.hold, h = clampInt(ml.holdSlots, H.start, H.max), step = (n) => H.ladder.find((s) => s.slots === n);
  const hold = (n, bought) => ({ id: `hold:${n}`, tab: 'raft', slot: 'hold', level: n, name: step(n)?.name ?? '',
    goalName: String(TL.holdName ?? 'Hold {n}').replace('{n}', n), line: TL.shelf?.hold ?? '', price: step(n)?.price ?? 0, bought });
  if (h > H.start && ses.has(`hold:${h}`)) out.push(hold(h, true));
  else if (h + 1 <= H.shelfMax && step(h + 1)) out.push(hold(h + 1, false));
  else if (h > H.start && step(h)) out.push(hold(h, true));
  // M1 step 3a (SPEC §5.1 rule 8, M1.md §2.5; PLAN §2.1 item 4): the Bait tab's legend bait (a consumable: always on the shelf of its
  // water, never "Yours.", never the goal line; `count` the bag holds) and the Maps tab (mapCards: the two cheapest place maps not owned,
  // then the next lake's card). A place map bought while the shelf is open keeps its slot as {bought: true} ("Yours.") and the next card
  // takes it only when the shelf closes, so the tab never holds more than three cards.
  for (const [water, lb] of Object.entries(isObj(L.legendBait) ? L.legendBait : {})) {
    if (!isObj(lb) || typeof lb.id !== 'string' || !(ml.maps?.lakes || []).includes(water) || !waterShipped(D, water)) continue;
    const b = (D.BAITS || []).find((x) => x?.id === lb.id);
    out.push({ id: `bait:${lb.id}`, tab: 'bait', slot: 'bait', level: null, baitId: lb.id, water, name: b?.name ?? lb.id, goalName: b?.name ?? lb.id,
      line: TL.shelf?.[lb.id] ?? '', price: num(lb.price, 0), count: Math.max(0, int(ml.bait?.[water]?.[lb.id])), consumable: true, bought: false });
  }
  const sesPlaces = [...ses].filter((id) => typeof id === 'string' && id.startsWith('place:')).map((id) => id.slice(6));
  const ownedPlaces = Array.isArray(ml.maps?.places) ? ml.maps.places : [];
  const view = sesPlaces.length ? { ...ml, maps: { ...(ml.maps || {}), places: ownedPlaces.filter((p) => !sesPlaces.includes(p)) } } : ml;
  const zoneName = (id) => (D.ZONES || []).find((z) => z?.id === id)?.name ?? id;
  for (const c of mapCards(D, view, { meta: isObj(meta) ? { ...meta, loop: ml } : { loop: ml } })) {
    if (c.waterId) {
      out.push({ id: c.id, tab: 'maps', slot: 'lake', level: null, waterId: c.waterId, name: zoneName(c.waterId), goalName: zoneName(c.waterId),
        line: '', price: c.sealed ? null : c.price, sealed: c.sealed === true, seals: c.seals, bought: false });
      continue;
    }
    const name = D.loopPlace?.(c.placeId)?.name ?? D.PLACE_BY_ID?.[c.placeId]?.name ?? c.placeId;
    out.push({ id: c.id, tab: 'maps', slot: 'place', level: null, placeId: c.placeId, kind: c.kind, name, goalName: name, line: c.line, price: c.price,
      fish: c.fish, hours: c.hours, bought: ses.has(c.id) && ownedPlaces.includes(c.placeId) });
  }
  // M1 step 2 (decision 39): a lake map past LOOP.shipped is never offered (the sealed card is the next water's, never a lake map to buy)
  return out.filter((it) => !(it.tab === 'maps' && it.water && !waterShipped(D, it.water)));
}

/** The goal line's item (SPEC §8.3, PLAN CHOICEs 6 and 11): the cheapest permanent card not bought (the first on a tie), or null when
 *  none is left. A consumable (the legend bait, later the tins) and a sealed card (no price) are never the goal. */
export function goalOf(items) {
  let best = null;
  const goalable = (it) => isObj(it) && !it.bought && it.consumable !== true && it.sealed !== true && it.price != null && Number.isFinite(Number(it.price));
  for (const it of Array.isArray(items) ? items : []) if (goalable(it) && (!best || num(it.price) < num(best.price))) best = it;
  return best ? { id: best.id, name: best.goalName ?? best.name, price: best.price, slot: best.slot, level: best.level } : null;
}

/**
 * v8 (SPEC §5.5 (c)): a water's list, computed by the rule and never listed: its open-water fish and the fish of the day and old
 * water its lake map opens (LOOP.access.list.kinds), on its plain bait (a fish that bites on another bait only is off it);
 * giants and legends never. In 1a, on the loop's data, the Mossmere's six built phase-1 open-water fish.
 * M1 step 3a (PLAN §2.0): a fish of a place (its `place`) or of a kind of place (a `kind` other than 'open') joins the list only when
 * a place its water's lake map opens (LOOP.waters[w].places, [{id, kind}], migrateLoop rule 5's list) has that id or that kind, and
 * that kind is a list kind. A place map's place (LOOP.places) never counts: the Mossmere's lake map opens none, so the Bridgechain and
 * the Gloam Eel stay off and its list is its open water's twelve.
 */
export function listFor(D, waterId) {
  const A = D?.LOOP?.access?.list || { kinds: ['open', 'day', 'old'], plainBaitOnly: true };
  const plain = D?.LOOP?.waters?.[waterId]?.plainBait ?? null;
  const opens = (D?.LOOP?.waters?.[waterId]?.places || []).filter((p) => isObj(p) && A.kinds.includes(p.kind));
  const inList = (s) => {
    if (s.place) return opens.some((p) => p.id === s.place);
    const kind = typeof s.kind === 'string' && s.kind ? s.kind : 'open';
    return kind === 'open' ? A.kinds.includes('open') : opens.some((p) => p.kind === kind);
  };
  return (D?.SPECIES || []).filter((s) => isObj(s) && s.zone === waterId && s.rarity !== 'legendary' && s.rarity !== 'epic' && !s.giant && !s.cove
    && inList(s) && (!A.plainBaitOnly || !s.bait || s.bait === plain)).map((s) => s.id);
}

/** v8 (SPEC §5.5 (c)): the list's count on this save: listed ids with num(journal[id].caught) > 0 (never the built caughtOf), so a
 *  Glimpsed entry does not count, a fish let go does, and an old save's catches count. */
export function listCount(meta, D, waterId) {
  const ids = listFor(D, waterId), J = isObj(meta?.journal) ? meta.journal : {};
  return { have: ids.filter((id) => num(J[id]?.caught) > 0).length, need: ids.length };
}

// ---------------------------------------------------------------- M1 step 3a (PLAN §3.2): the cards, the seals, the lift, the catalogue
/** The waters in the Chart's order (ZONES by index), as ids. */
const chartWaters = (D) => (Array.isArray(D?.ZONES) ? D.ZONES : []).filter((z) => isObj(z) && typeof z.id === 'string').slice()
  .sort((a, b) => num(a.index, 0) - num(b.index, 0)).map((z) => z.id);
/** The frontier water (the last owned water the Chart draws: owned and in LOOP.waters, as 3b's chartNext reads it) and the water after
 *  it ({frontier, next}; either null). A fresh save's frontier is the Mossmere and its next water Sporewood. */
function frontierOf(metaLoop, D) {
  const W = isObj(D?.LOOP?.waters) ? D.LOOP.waters : {}, zones = chartWaters(D);
  const owned = (Array.isArray(metaLoop?.maps?.lakes) ? metaLoop.maps.lakes : []).filter((id) => typeof id === 'string');
  if (!owned.length && isObj(W.mossmere)) owned.push('mossmere');
  const at = Math.max(-1, ...owned.filter((id) => isObj(W[id])).map((id) => zones.indexOf(id)));
  return { frontier: at >= 0 ? zones[at] : null, next: at >= 0 ? zones[at + 1] ?? null : null };
}
/** Is a water inside what ships, as 3b's chartNext computes it (LOOP.shipped a string: its order ≥ the water's > 0; an array: listed;
 *  none: in LOOP.waters)? */
function shippedAsChart(D, waterId) {
  const W = isObj(D?.LOOP?.waters) ? D.LOOP.waters : {}, sh = D?.LOOP?.shipped, order = (id) => num(W[id]?.order, 0);
  return typeof sh === 'string' ? order(waterId) > 0 && order(waterId) <= order(sh) : Array.isArray(sh) ? sh.includes(waterId) : isObj(W[waterId]);
}
const LIGHT_GLYPH = { day: 'sun', dusk: 'dusk', night: 'moon' };
/** A fish's hour glyphs (SPEC §8.8): its window (data.loopHours) as 'sun' | 'dusk' | 'moon'; a fish of every light shows none. */
function hourGlyphs(D, sp) {
  const h = typeof D?.loopHours === 'function' ? D.loopHours(sp) : ['day', 'dusk', 'night'];
  return h.length >= 3 ? [] : h.map((x) => LIGHT_GLYPH[x]).filter(Boolean);
}
/** The bait glyph of a fish that bites on one bait only, while that bait is on the shelf (3a: the water's legend bait, LOOP.legendBait;
 *  PLAN CHOICE 16: the Gloam Eel's Lumen Moss arrives with step 4's data); else null. */
function baitGlyph(D, sp) {
  const id = sp?.bait;
  if (!id) return null;
  return Object.values(D?.LOOP?.legendBait || {}).some((b) => b?.id === id) ? id : null;
}
/**
 * The next water's three keys as the save stands (SPEC §5.5 (f)): {map: {held, price, shipped}, gear: {held, slot, tier, item},
 * catch: {held, have, need}}, a superset of 3b's chartNext seals. `shipped` as chartNext computes it; the map seal is held when its lake
 * map is owned, and priced only once shipped (in M1 always hollow: "Coming soon", price null); the gear key from LOOP.access.gear
 * (tackle by tier, the hold by its slots, a raft part by level); the catch from listCount of the water before it (the frontier).
 */
export function sealsOf(meta, D, waterId = 'sporewood') {
  const ml = isObj(meta?.loop) ? meta.loop : {}, owned = Array.isArray(ml.maps?.lakes) ? ml.maps.lakes : [];
  const shipped = shippedAsChart(D, waterId), W = D?.LOOP?.waters?.[waterId];
  const item = String(D?.LOOP?.access?.gear?.[waterId] || ''), [slot, t] = item.split(':'), tier = Math.max(0, Math.floor(Number(t) || 0));
  const have = slot === 'hold' ? num(ml.holdSlots, 0) : SLOTS.includes(slot) ? num(ml.tackle?.[slot], 0) : num(ml.raft?.[slot], 0);
  const zones = chartWaters(D), i = zones.indexOf(waterId), prev = i > 0 ? zones[i - 1] : null;
  const lc = prev ? listCount(meta, D, prev) : { have: 0, need: 0 };
  return {
    map: { held: owned.includes(waterId), price: shipped && Number.isFinite(Number(W?.lake)) ? Number(W.lake) : null, shipped },
    gear: { held: !!slot && tier > 0 && have >= tier, slot: slot || null, tier: tier || 1, item: item || null },
    catch: { held: lc.need > 0 && lc.have >= lc.need, have: lc.have, need: lc.need },
  };
}
/**
 * Murk's map cards (SPEC §5.1 rule 8, M1.md §2.4): the two cheapest place maps of the owned, shipped waters not yet owned (by price,
 * then the Chart's order), then the next lake's card; at most three, in that order. A place card: {id: 'place:<id>', placeId, kind, price,
 * fish (the fish its card names), line (TEXT_LOOP.maps), hours (that fish's hour glyphs)}; the lake card: {id: 'lake:<id>', waterId,
 * sealed (not shipped: "Coming soon", no buy), price (null while sealed), seals (sealsOf; pass `meta` for the catch seal's count)}.
 */
export function mapCards(D, metaLoop, { meta = null } = {}) {
  const ml = isObj(metaLoop) ? metaLoop : {}, P = isObj(D?.LOOP?.places) ? D.LOOP.places : {};
  const lakes = (Array.isArray(ml.maps?.lakes) ? ml.maps.lakes : []).filter((w) => waterShipped(D, w));
  const have = new Set(Array.isArray(ml.maps?.places) ? ml.maps.places : []), ids = Object.keys(P);
  const places = ids.filter((id) => isObj(P[id]) && lakes.includes(P[id].water) && !have.has(id))
    .sort((a, b) => num(P[a].price, Infinity) - num(P[b].price, Infinity) || ids.indexOf(a) - ids.indexOf(b)).slice(0, 2)
    .map((id) => {
      const sp = D?.SPECIES_BY_ID?.[P[id].card] || null;
      return { id: `place:${id}`, placeId: id, kind: P[id].kind, price: num(P[id].price, 0), fish: P[id].card ?? null,
        line: D?.TEXT_LOOP?.maps?.[id] ?? '', hours: sp ? hourGlyphs(D, sp) : [] };
    });
  const { next } = frontierOf(ml, D);
  if (!next) return places;
  const seals = sealsOf(isObj(meta) ? { ...meta, loop: ml } : { loop: ml }, D, next);
  return [...places, { id: `lake:${next}`, waterId: next, sealed: !seals.map.shipped, price: seals.map.shipped ? seals.map.price : null, seals }];
}
/** The owned places whose mist has not lifted yet (maps.places not in `lifted`, LOOP.places only), in price order (the Chart's on a tie). */
export function liftDue(D, metaLoop) {
  const P = isObj(D?.LOOP?.places) ? D.LOOP.places : {}, ids = Object.keys(P), ml = isObj(metaLoop) ? metaLoop : {};
  const done = new Set(Array.isArray(ml.lifted) ? ml.lifted : []);
  return (Array.isArray(ml.maps?.places) ? ml.maps.places : []).filter((id, i, a) => isObj(P[id]) && !done.has(id) && a.indexOf(id) === i)
    .sort((a, b) => num(P[a].price, 0) - num(P[b].price, 0) || ids.indexOf(a) - ids.indexOf(b));
}
/**
 * The catalogue of a water (SPEC §8.8, M1.md §2.17): {head: {waterId, name, have, need, seals (the next water's, while this water is the
 * frontier; else null)}, list: Entry[] (the list's fish in its order, each with its place glyph), groups: [{placeId, kind, owned, name
 * (null while unowned), entries}] (open water first for its fish off the list, then each place in the Chart's order: its own fish, its
 * giant, its kind's fish, its legend; a place with none has no group), finds: null (M1 step 5c)}. Entry: {id, caught, giant, legend,
 * hours: ('sun'|'dusk'|'moon')[], place: 'open'|'day'|'old'|'night'|'crown'|null (the list's glyph; null under a heading), bait}. Every
 * fish of the water once; never a number or a rate in an entry (revision 7); caught = journal[id].caught > 0.
 */
export function catalogueFor(meta, D, waterId) {
  const J = isObj(meta?.journal) ? meta.journal : {}, ml = isObj(meta?.loop) ? meta.loop : {};
  const P = isObj(D?.LOOP?.places) ? D.LOOP.places : {}, owned = new Set(Array.isArray(ml.maps?.places) ? ml.maps.places : []);
  const fish = (D?.SPECIES || []).filter((s) => isObj(s) && s.zone === waterId && !s.cove);
  const byId = new Map(fish.map((s) => [s.id, s]));
  const entry = (s, place) => ({ id: s.id, caught: num(J[s.id]?.caught) > 0, giant: s.giant === true, legend: s.rarity === 'legendary',
    hours: hourGlyphs(D, s), place, bait: baitGlyph(D, s) });
  const used = new Set(), take = (s, place) => { used.add(s.id); return entry(s, place); };
  const kindOf = (s) => (s.place ? P[s.place]?.kind ?? D?.PLACE_BY_ID?.[s.place]?.kind ?? null : typeof s.kind === 'string' && s.kind ? s.kind : 'open');
  const list = listFor(D, waterId).map((id) => byId.get(id)).filter(Boolean).map((s) => take(s, kindOf(s)));
  const groups = [];
  const placeIds = Object.keys(P).filter((id) => isObj(P[id]) && P[id].water === waterId);
  for (const id of placeIds) {
    const p = P[id], legend = p.legend ? byId.get(p.legend) : null, giant = p.giant ? byId.get(p.giant) : null;
    const own = fish.filter((s) => s.place === id && !s.giant && s.rarity !== 'legendary');
    const kind = fish.filter((s) => !s.place && !s.giant && s.rarity !== 'legendary' && s.kind === p.kind && s.kind !== 'open');
    const es = [...own, ...(giant ? [giant] : []), ...kind, ...(legend ? [legend] : [])].filter((s) => !used.has(s.id)).map((s) => take(s, null));
    if (es.length) groups.push({ placeId: id, kind: p.kind, owned: owned.has(id), name: owned.has(id) ? D?.loopPlace?.(id)?.name ?? D?.PLACE_BY_ID?.[id]?.name ?? null : null, entries: es });
  }
  const rest = fish.filter((s) => !used.has(s.id)).map((s) => take(s, null));
  if (rest.length) groups.unshift({ placeId: null, kind: 'open', owned: true, name: null, entries: rest });
  const { frontier, next } = frontierOf(ml, D), lc = listCount(meta, D, waterId);
  const name = (D?.ZONES || []).find((z) => z?.id === waterId)?.name ?? null;
  return { head: { waterId, name, have: lc.have, need: lc.need, seals: frontier === waterId && next ? sealsOf(meta, D, next) : null }, list, groups, finds: null };
}

/**
 * The Wick's ledger (WICKS §2.1): record a measured fish in `meta.loop.firsts` = {seen: [speciesId], seals: ['id|class'], best:
 * {speciesId: cm}} and say whether it is a first of this New Descent: a kind not seen before; that kind's first Prize, Trophy or
 * Elder (the built class seals, `seals` = data.sealsFor(sp)) or its first Ancient; or a new personal best (longer than any of that
 * kind before). Giants and legends are never a first (their prices are their own), though the ledger still notes them. In place;
 * returns {kind, seal, best, first}.
 */
export function stampFirst(firsts, sp, fish, { cls = fish?.sizeClass, seals = [] } = {}) {
  const none = { kind: false, seal: false, best: false, first: false };
  if (!isObj(firsts) || !sp?.id || !isObj(fish)) return none;
  if (!Array.isArray(firsts.seen)) firsts.seen = [];
  if (!Array.isArray(firsts.seals)) firsts.seals = [];
  if (!isObj(firsts.best)) firsts.best = {};
  const id = sp.id, len = num(fish.length), kind = !firsts.seen.includes(id);
  let seal = false;
  const mark = (k) => { if (!firsts.seals.includes(k)) { firsts.seals.push(k); seal = true; } };
  if (Array.isArray(seals) && seals.includes(cls)) mark(`${id}|${cls}`);
  if (fish.ancient === true && cls === 'elder' && Array.isArray(seals) && seals.includes('elder')) mark(`${id}|ancient`);
  const prev = num(firsts.best[id], 0), best = !kind && len > prev;
  if (kind || best) firsts.best[id] = Math.max(prev, len);
  if (kind) firsts.seen.push(id);
  const priced = sp.rarity === 'legendary' || fish.legendary === true || fish.giant === true || sp.giant === true;
  return { kind, seal, best, first: !priced && (kind || seal || best) };
}

/**
 * `ctx.progression.loop` (PLAN §3.3, §3.4; WICKS §2): the ledger of the Full Hold, built by progression.js's create() under
 * data.LOOP_ENABLED (null off the loop). `S` is progression's shared internals; createLoop needs from it: ctx, report, requestSave,
 * invalidate, species, pending (the card's Map), gone (the Set of fish acted on), addToCreel, syncPending, computeStats,
 * freshRunStats and debugOn. Every method calls ensureLoop() first (a lazy migrateLoop: wipeAll resets meta to defaultMeta()).
 * On a trip (run.outing === 'trip') the hold IS run.creel (PLAN CHOICE 19), sized by data.loopSlots(meta.loop, run.character);
 * at home (no run) a method reads meta.loop.wick. Internals for progression.js (the measure's firsts, fishAction, the comeback on
 * fish:escaped, the shelf's session) go on S.loopInternal; they are not part of the API.
 */
export function createLoop(S) {
  const ctx = S.ctx;
  const D = () => ctx.data || {};
  const meta = () => ctx.state?.meta || null;
  const run = () => ctx.state?.run || null;
  const on = () => D().LOOP_ENABLED === true;
  const onTrip = (r = run()) => on() && !!r && r.outing === 'trip';
  const report = (where, err) => { try { S.report?.(`loop.${where}`, err); } catch { /* optional */ } };
  const requestSave = () => { try { S.requestSave?.(); } catch (e) { report('requestSave', e); } };
  const saveNow = () => { try { ctx.game?.save?.(); } catch (e) { report('save', e); } };
  const emit = (evt, payload) => { try { ctx.bus?.emit?.(evt, payload); } catch (e) { report(`emit(${evt})`, e); } };
  const LOOP = () => D().LOOP || {};
  const wickIdOf = (id) => (typeof D().loopWickId === 'function' ? D().loopWickId(id) : 'wick');
  const keyOf = (place, zone) => (typeof D().loopWaterKey === 'function' ? D().loopWaterKey(place ?? null, zone) : place ? String(place) : `open:${zone}`);
  const spOf = (id) => (typeof S.species === 'function' ? S.species(id) : D().SPECIES_BY_ID?.[id]) || null;

  // ---------------------------------------------------------------- the save block (lazy, PLAN §3.3)
  let seen = { meta: null, loop: null };
  function ensureLoop() {
    if (!on()) return null;
    const m = meta();
    if (!isObj(m)) return null;
    if (m === seen.meta && m.loop === seen.loop && isObj(m.loop)) return m.loop;
    try { migrateLoop(m, D(), { hasTrip: run()?.outing === 'trip' }); } catch (e) { report('migrateLoop', e); if (!isObj(m.loop)) m.loop = freshLoop(D()); }
    seen = { meta: m, loop: m.loop };
    return m.loop;
  }
  /** The Wick that fishes now: the trip's (run.character) or, at home, the save's (meta.loop.wick). */
  const wickNow = () => { const r = run(); return onTrip(r) ? wickIdOf(r.character) : wickIdOf(ensureLoop()?.wick); };
  const passive = (w = wickNow()) => LOOP().wicks?.[w]?.passive ?? null;
  const slotsNow = () => { const L = ensureLoop(); if (!L) return 0; return typeof D().loopSlots === 'function' ? D().loopSlots(L, wickNow()) : L.holdSlots; };
  /** The kind of water a bite-count key names: 'open:<zone>' is open water; a place's id its place kind (PLACE_BY_ID). */
  function kindOf(key) {
    if (typeof key !== 'string' || key.startsWith('open:')) return 'open';
    const p = D().PLACE_BY_ID?.[key] || (D().ZONES || []).flatMap((z) => z.arena?.places || []).find((x) => x?.id === key);
    return p?.kind || 'day';
  }
  const goodAt = (key) => {
    const L = ensureLoop();
    if (!L) return 0;
    const fn = D().goodBitesFor;
    return typeof fn === 'function' ? fn({ kind: kindOf(key), holdSlots: L.holdSlots, wickId: wickNow() }) : 0;
  };
  const tripKey = (k) => (typeof k === 'string' && k ? k : keyOf(null, run()?.zone || 'mossmere'));
  const spentAt = (key) => { const r = run(); return onTrip(r) && isObj(r.bites) ? Math.max(0, int(r.bites[tripKey(key)])) : 0; };
  const flags = (r = run()) => { if (!r) return {}; if (!isObj(r.flags)) r.flags = {}; return r.flags; };

  // ---------------------------------------------------------------- prices (SPEC §4.1, §4.6; WICKS §2.1)
  /** The card's number: a fish's stamped clams, else its price by size (data.fishClams on the water it bites in), or a legend's
   *  crown price: her first landing (none sold before and none already in the hold) the crown map's price, later × legendRematch. */
  function priceOf(fish) {
    ensureLoop();
    if (!isObj(fish)) return 0;
    if (Number.isFinite(Number(fish.clams)) && fish.clams !== null) return Math.max(0, Math.round(Number(fish.clams)));
    const sp = spOf(fish.speciesId);
    if (!sp) return 1;
    const L = ensureLoop() || {}, LP = LOOP();
    if (sp.rarity === 'legendary' || fish.legendary === true) {
      const crown = num(LP.waters?.[sp.zone]?.prices?.crown, 0);
      const r = run();
      const inHold = onTrip(r) && (r.creel || []).some((f) => f && f.uid !== fish.uid && f.speciesId === sp.id);
      const first = int(L.legends?.[sp.id]) === 0 && !inHold;
      return Math.max(1, Math.round(first ? crown : crown * num(LP.value?.legendRematch, 0.4)));
    }
    const zone = run()?.zone || sp.zone;
    let v = null;
    try { v = D().fishClams?.(sp, num(fish.z), { zone }); } catch (e) { report('fishClams', e); }
    return Math.max(1, Math.round(num(v, 1)));
  }
  /** What the tally pays for a hold fish (WICKS §2.1): {base (the card's number), clams (the sale), first}. The Wick (Curious) adds
   *  max(round(firstFloor × tier), round((firstMult − 1) × base)) to a kept first, once a fish, never on a giant or a legend; with an
   *  order or the Old Ledger (later slices) the larger applies, never both. Every other Wick sells at the base. */
  function saleOf(fish) {
    const base = priceOf(fish);
    const out = { base, clams: base, first: false };
    if (!isObj(fish) || fish.first !== true || fish.giant === true || fish.legendary === true) return out;
    const r = run(), w = r ? wickIdOf(r.character) : wickNow(), K = LOOP().wicks?.[w];
    if (K?.passive !== 'curious') return out;
    const sp = spOf(fish.speciesId);
    if (!sp || sp.rarity === 'legendary') return out;
    const tier = num(LOOP().waters?.[r?.zone || sp.zone]?.tier, 0);
    const bonus = Math.max(Math.round(num(K.firstFloor) * tier), Math.round((num(K.firstMult, 1) - 1) * base));
    const order = 0;   // Murk's orders and the Old Ledger's double arrive in later slices: the larger of the three applies
    const add = Math.max(bonus, order);
    if (add > 0) { out.clams = base + add; out.first = bonus >= order; }
    return out;
  }

  // ---------------------------------------------------------------- the hold (SPEC §3.1, §3.2)
  const hold = () => { ensureLoop(); const r = run(); return { slots: slotsNow(), fish: onTrip(r) ? (r.creel || []) : [], full: holdFull() }; };
  function holdFull() {
    const r = run();
    if (!onTrip(r)) return false;
    return (r.creel || []).length >= slotsNow();
  }
  function keep(fish) {
    const r = run();
    ensureLoop();
    if (!onTrip(r) || !isObj(fish)) return { ok: false, msg: '', gained: { clams: 0 } };
    if ((r.creel || []).some((f) => f?.uid === fish.uid)) return { ok: true, msg: '', gained: { clams: priceOf(fish) } };
    if (holdFull()) {
      emit('loop:holdFull', { via: 'keep' });
      return { ok: false, full: true, msg: D().TEXT_LOOP?.holdFull || '', gained: { clams: 0 } };
    }
    const clams = priceOf(fish);
    fish.clams = clams;
    if (!S.addToCreel?.(fish)) {
      emit('loop:holdFull', { via: 'keep' });
      return { ok: false, full: true, msg: D().TEXT_LOOP?.holdFull || '', gained: { clams: 0 } };
    }
    S.pending?.delete?.(fish.uid);
    S.syncPending?.();
    const gained = { clams };
    emit('fish:action', { action: 'keep', fish, gained });
    requestSave();
    return { ok: true, msg: '', gained };
  }
  function letGo(fish) {
    const r = run();
    ensureLoop();
    if (!onTrip(r) || !isObj(fish)) return { ok: false, msg: '', gained: { bite: 0, favour: 0 } };
    if ((r.creel || []).some((f) => f?.uid === fish.uid)) return { ok: false, msg: '', gained: { bite: 0, favour: 0 } };   // kept stays kept
    const LG = LOOP().letGo || {};
    const key = typeof fish.waterKey === 'string' && fish.waterKey ? fish.waterKey : keyOf(fish.place ?? null, r.zone);
    r.bites = isObj(r.bites) ? r.bites : {};
    r.mercy = isObj(r.mercy) ? r.mercy : {};
    const n = Math.max(0, int(r.bites[key]));
    const back = Math.min(n, Math.max(0, int(LG.refund ?? 1)));
    r.bites[key] = n - back;
    const before = num(r.mercy[key]), after = Math.min(num(LG.cap, 0.4), before + num(LG.favour, 0.2));
    r.mercy[key] = Math.round(after * 1e6) / 1e6;
    const favour = Math.round(Math.max(0, after - before) * 1e6) / 1e6;
    if (fish.uid) S.gone?.add?.(fish.uid);
    S.pending?.delete?.(fish.uid);
    S.syncPending?.();
    const gained = { bite: back, favour };
    emit('fish:action', { action: 'release', letgo: true, fish, gained });
    requestSave();
    return { ok: true, msg: '', gained };
  }

  // ---------------------------------------------------------------- quiet water and the open bite (SPEC §3.3, PLAN CHOICE 27)
  let warnedKey = false;
  let lastBiteComeback = false;
  function noteBite(e = {}) {
    const r = run();
    if (!onTrip(r)) return;
    ensureLoop();
    let key = e?.waterKey;
    if (typeof key !== 'string' || !key) {
      key = keyOf(null, r.zone);
      if (!warnedKey) { warnedKey = true; report('noteBite', new Error(`a bite without a waterKey: counted at ${key}`)); }
    }
    r.bites = isObj(r.bites) ? r.bites : {};
    r.bites[key] = Math.max(0, int(r.bites[key])) + 1;
    const f = flags(r);
    f.biteN = Math.max(0, int(f.biteN)) + 1;   // the evening's bite count: a legend's ball is spent once a bite (spendBait)
    const spook = e?.reason === 'spooked' || e?.spooked === true;
    if (!spook) f.openBite = key;
    lastBiteComeback = e?.comeback === true;
    if (lastBiteComeback && !spook) f.openComeback = true;
    requestSave();
  }
  const bitesSpent = (key) => { ensureLoop(); return spentAt(key); };
  const bitesLeft = (key) => { ensureLoop(); return Math.max(0, goodAt(tripKey(key)) - spentAt(key)); };
  /** The quiet terms of the NEXT bite at a water (PLAN CHOICE 17: at 4 good bites the 5th is already quiet): over = max(0, spent + 1 −
   *  good); favour and waitMult from data.quietTerms(over, the Wick); mercy the let-go favour there (0–0.4); quiet = spent ≥ good. */
  function favour(key) {
    ensureLoop();
    const k = tripKey(key), spent = spentAt(k), good = goodAt(k), r = run();
    const over = Math.max(0, spent + 1 - good);
    const q = typeof D().quietTerms === 'function' ? D().quietTerms(over, wickNow()) : { over, favour: 0, waitMult: 1 };
    const mercy = onTrip(r) && isObj(r.mercy) ? num(r.mercy[k]) : 0;
    return { favour: q.favour, waitMult: q.waitMult, over: q.over ?? over, good, spent, mercy, quiet: spent >= good };
  }
  function closeBite() {
    const r = run();
    if (!onTrip(r)) return;
    const f = flags(r);
    f.openBite = null;
    f.openComeback = false;
  }
  function refundOpenBite() {
    const r = run();
    if (!onTrip(r)) return false;
    const f = flags(r), key = f.openBite;
    f.openBite = null;
    f.openComeback = false;
    if (typeof key !== 'string' || !key) return false;
    const list = Array.isArray(f.pendingCatch) ? f.pendingCatch : [];
    if (list.some((p) => (typeof p?.waterKey === 'string' ? p.waterKey : keyOf(p?.place ?? null, r.zone)) === key)) return false;
    r.bites = isObj(r.bites) ? r.bites : {};
    const n = Math.max(0, int(r.bites[key]));
    if (n <= 0) return false;
    r.bites[key] = n - 1;
    return true;
  }

  // ---------------------------------------------------------------- the passives' run state (WICKS §2.2, §2.5)
  /** Taper's first bite (one an evening, run.flags.taperFirst): open while the Wick is Taper and fewer than firstBites have been served
   *  under the rule this evening. A let-go refund never re-arms it; the next evening's run starts it afresh. */
  function taperFirstOpen() {
    const r = run();
    if (!onTrip(r) || passive(wickIdOf(r.character)) !== 'long_reach') return false;
    const want = Math.max(1, int(LOOP().wicks?.taper?.firstBites, 1));
    const v = flags(r).taperFirst, served = v === true ? want : Math.max(0, int(v));
    return served < want;
  }
  function spendTaperFirst() {
    if (!taperFirstOpen()) return false;
    const r = run(), f = flags(r), want = Math.max(1, int(LOOP().wicks?.taper?.firstBites, 1));
    const served = Math.max(0, int(f.taperFirst)) + 1;
    f.taperFirst = served >= want ? true : served;
    requestSave();
    return true;
  }
  /** Ashwick's waiting comeback at this water (the same species and z), or null. */
  function comeback(key) {
    const r = run();
    if (!onTrip(r) || !isObj(r.comeback)) return null;
    if (key != null && r.comeback.waterKey !== key) return null;
    return { ...r.comeback };
  }
  /** Fishing serves the comeback's bite: it is gone from the run (and saved) before the land roll, so a Continue never brings it twice. */
  function consumeComeback() {
    const r = run();
    if (!onTrip(r) || !isObj(r.comeback)) return null;
    const c = { ...r.comeback };
    r.comeback = null;
    requestSave();
    return c;
  }
  /** fish:escaped (internal): Ashwick's fish comes back once at that water this evening, tired. Never a giant or a legend, never a
   *  line cut by sailing away, and never the comeback itself (lost twice, it is gone). Returns true when a comeback was stored, so the
   *  built marking skips it (a fish that will come back is not also a Marked Fish). */
  function onEscaped(e = {}) {
    const r = run();
    const wasComeback = lastBiteComeback;
    lastBiteComeback = false;
    if (!onTrip(r)) return false;
    const sp = spOf(e.speciesId);
    // M1 step 3a (M1.md §2.4, PLAN CHOICE 22): a giant lost at its own place is a Marked Fish there, for every Wick and at any class
    if (sp && sp.giant === true && sp.rarity !== 'legendary' && (!sp.place || e.place === sp.place)) markGiant(sp.id);
    if (passive(wickIdOf(r.character)) !== 'burns_back') return false;
    if (wasComeback || e.cut === true || e.reason === 'cut' || e.legendary === true) return false;
    if (!sp || sp.rarity === 'legendary' || sp.giant === true || e.giant === true) return false;
    const z = Number(e.z);
    if (!Number.isFinite(z)) return false;
    const zone = e.zone || r.zone;
    r.comeback = { waterKey: keyOf(e.place ?? null, zone), speciesId: sp.id, z, zone, sizeClass: e.sizeClass ?? null };
    requestSave();
    return true;
  }
  /** zone:change on a trip: a comeback waits only at its own lake. */
  function onZoneChange(e = {}) {
    const r = run();
    if (onTrip(r) && isObj(r.comeback) && e.zone && r.comeback.zone && r.comeback.zone !== e.zone) r.comeback = null;
  }

  // ---------------------------------------------------------------- the records (WICKS §2.1): measure's part, internal
  /** measure() on a trip (internal): the Wick's ledger in the same save as the Journal; fish.first on the hold fish. */
  function noteFirst(fish, sp, cls) {
    const r = run(), L = ensureLoop();
    if (!onTrip(r) || !L || !isObj(fish) || !sp) return false;
    if (passive(wickIdOf(r.character)) !== 'curious') return false;
    let seals = [];
    try { seals = D().sealsFor?.(sp) || []; } catch { seals = []; }
    const res = stampFirst(L.firsts, sp, fish, { cls, seals });
    if (res.first) fish.first = true;
    return res.first;
  }

  // ---------------------------------------------------------------- a trip (PLAN §2.1 item 6) and its tally (§3.4)
  function isOpen(waterId) {
    const L = ensureLoop();
    if (!L || typeof waterId !== 'string') return false;
    return !!LOOP().waters?.[waterId] && waterShipped(D(), waterId) && (L.maps?.lakes || []).includes(waterId);
  }
  function createTrip({ startZone = 'mossmere', character = null } = {}) {
    const L = ensureLoop();
    if (!L) return null;
    const d = D();
    const zone = isOpen(startZone) ? startZone : (L.maps.lakes.find((id) => isOpen(id)) || L.maps.lakes[0] || 'mossmere');
    const wick = wickIdOf(L.wick != null ? L.wick : character);
    const m = meta() || {};
    const r = {
      active: true, id: uid('run'), seed: (Math.random() * 1e9) | 0, playTime: 0, character: wick,
      day: 1, phase: 'calm', phaseTime: 0, hp: 5, oil: 100, satiety: 100,
      zone, zonesUnlocked: [zone], gateOpen: false,
      shells: 0, bait: isObj(L.bait?.[zone]) ? { ...L.bait[zone] } : {}, equippedBait: null, creel: [], upgrades: {}, legendaries: {}, bounties: [],
      level: 1, xp: 0, xpNext: d.xpForLevel?.(1) ?? 5, boons: {}, rerollsUsed: 0,
      stats: typeof S.freshRunStats === 'function' ? S.freshRunStats() : {},
      flags: {
        zoneEnteredDay: 1, streak: 0, mercy: 0, heartwax: 0, wounded: {},
        nights: 0, nightActive: false, nightSlain: 0, maxNightSlain: 0, nightCatch: 0, maxNightCatch: 0,
        nightDamaged: false, nightFlares: 0, perfectHooks: 0, bestStreak: 0, slain: 0, elites: 0, bosses: 0, landed: 0,
        deepestEndured: -1, bountiesDone: 0, bountyMemories: 0, challengesDone: [], records: [], ch: {},
        startDeepest: m.deepestZone || 0,
        nightLog: [], openBite: null, openComeback: false, taperFirst: false,
      },
      outing: 'trip', nightMode: 'still', tally: { dawns: 0, stillNights: 0, swarmNights: 0 },
      lures: {}, equipped: null, bites: {}, mercy: {}, evening: Math.max(0, int(L.evenings)) + 1, comeback: null,
    };
    // M1 step 3a (PLAN §2.1 item 5): the bait slot's fit goes on the line when the bag holds one (the ball rides until her bite)
    const fb = L.fitted?.bait;
    if (typeof fb === 'string' && int(r.bait[fb]) > 0) { r.equippedBait = fb; r.equipped = fb; }
    try {
      const st = S.computeStats?.({}, r);
      if (st) { r.hp = st.maxHp ?? 5; r.oil = st.maxOil ?? 100; r.satiety = st.maxSatiety ?? 100; }
    } catch (e) { report('computeStats', e); }
    session = [];
    return r;
  }
  /** The tally (PLAN §3.4): pays once (a second call on the same run returns {…lastTrip, already: true}), empties the hold, ends the
   *  run (active false) and saves at once, before anything moves; then loop:tally. A row stores the fish's length, never a weight. */
  function endTrip() {
    const r = run(), L = ensureLoop();
    if (!onTrip(r) || !L) return null;
    if (isObj(L.lastTrip) && r.id != null && L.lastTrip.id === r.id) return { ...L.lastTrip, already: true };
    const creel = Array.isArray(r.creel) ? r.creel : [];
    for (const f of creel) if (isObj(f) && !Number.isFinite(Number(f.clams))) f.clams = priceOf(f);
    const { lines, total } = tallyBook(L, creel, r, { D: D(), saleOf });
    // the bag comes home (tallyBook); a fitted ball with none left comes off the slot (a fit needs one in the bag)
    if (typeof L.fitted?.bait === 'string' && !(int(L.bait?.[r.zone]?.[L.fitted.bait]) > 0)) L.fitted.bait = null;
    L.lastTrip = { id: r.id ?? null, evening: int(r.evening) || L.evenings, zone: r.zone ?? null, total, lines, seen: false };
    r.creel = [];
    try { S.pending?.clear?.(); } catch { /* optional */ }
    S.syncPending?.();
    const f = flags(r);
    f.openBite = null; f.openComeback = false;
    delete f.pendingCatch;
    r.comeback = null;
    r.active = false;
    S.invalidate?.();
    saveNow();
    const out = { ...L.lastTrip };
    emit('loop:tally', { ...out });
    return out;
  }
  const lastTrip = () => { const L = ensureLoop(); return isObj(L?.lastTrip) ? L.lastTrip : null; };
  function markTallySeen(id) {
    const L = ensureLoop();
    if (!isObj(L?.lastTrip) || L.lastTrip.id !== id || L.lastTrip.seen === true) return;
    L.lastTrip.seen = true;
    requestSave();
  }

  // ---------------------------------------------------------------- Murk's shelf (SPEC §8.4, PLAN CHOICEs 11 and 26)
  // the shelf's session: the cards bought since the shelf opened (they read "Yours." in place until it closes). Cleared when the
  // 'shelf' modal opens or closes (ui:modal), at home:enter and at a trip's start; never saved.
  let session = [];
  const TAB_ORDER = ['tackle', 'raft', 'bait', 'maps', 'home'];
  function shelf() {
    const L = ensureLoop();
    if (!L) return { tabs: [] };
    const all = shelfItems(D(), L, session, { meta: meta() });
    return { tabs: TAB_ORDER.map((id) => ({ id, items: all.filter((i) => i.tab === id) })).filter((t) => t.items.length) };
  }
  const goal = () => { const L = ensureLoop(); return L ? goalOf(shelfItems(D(), L, [], { meta: meta() })) : null; };
  /** buy(itemId): a tackle tier, a hold step, (M1 step 3a) a place map 'place:<id>' (to maps.places), the legend bait 'bait:<id>' (+1 in
   *  its water's bag; a consumable, never "Yours.") or an unsealed lake card 'lake:<id>' (none in M1: Sporewood's is sealed and refused).
   *  The price comes off at once and the save is written before loop:buy {item, price, clams}. */
  function buy(itemId) {
    const L = ensureLoop();
    if (!L) return { ok: false, msg: '', clams: 0 };
    const id = itemId === 'hold' ? `hold:${L.holdSlots + 1}` : String(itemId ?? '');
    const it = shelfItems(D(), L, [], { meta: meta() }).find((i) => i.id === id && !i.bought);
    if (!it || it.sealed === true || it.price == null || !Number.isFinite(Number(it.price)) || num(L.clams) < num(it.price)) return { ok: false, msg: '', clams: num(L.clams) };
    L.clams = num(L.clams) - num(it.price);
    if (it.slot === 'hold') L.holdSlots = it.level;
    else if (it.slot === 'place') { if (!L.maps.places.includes(it.placeId)) L.maps.places.push(it.placeId); }
    else if (it.slot === 'lake') { if (!L.maps.lakes.includes(it.waterId)) L.maps.lakes.push(it.waterId); }
    else if (it.slot === 'bait') {
      if (!isObj(L.bait)) L.bait = {};
      const bag = isObj(L.bait[it.water]) ? L.bait[it.water] : (L.bait[it.water] = {});
      bag[it.baitId] = Math.max(0, int(bag[it.baitId])) + 1;   // a legend's bait is one try a ball (SPEC §4.6)
    } else L.tackle[it.slot] = it.level;
    if (it.consumable !== true && !session.includes(id)) session.push(id);
    try { S.invalidate?.(); } catch { /* optional */ }
    saveNow();
    emit('loop:buy', { item: id, price: it.price, clams: L.clams });
    return { ok: true, msg: '', clams: L.clams };
  }
  function debugGive(n) {
    const L = ensureLoop();
    if (!L) return 0;
    let dbg = false;
    try { dbg = S.debugOn?.() === true; } catch { dbg = false; }
    if (!dbg) return num(L.clams);
    L.clams = Math.max(0, num(L.clams) + Math.round(num(n)));
    requestSave();
    return L.clams;
  }

  // ---------------------------------------------------------------- Murk's once-lines (SPEC §8.6)
  function sayOnce(id) {
    const L = ensureLoop();
    const M = D().TEXT_LOOP?.murk || {};
    if (!L || typeof id !== 'string') return null;
    if (!isObj(L.said)) L.said = {};
    if (id === 'sailOut') {
      const lines = Array.isArray(M.sailOut) ? M.sailOut : [];
      if (!lines.length) return null;
      const i = Math.max(0, int(L.said.sailOut)) % lines.length;
      L.said.sailOut = (i + 1) % lines.length;
      requestSave();
      return lines[i];
    }
    if (L.said[id]) return null;
    const text = id === 'firstChart' ? (M.firstChartBy?.[wickNow()] ?? M.firstChart) : M[id];
    if (typeof text !== 'string' || !text) return null;
    L.said[id] = true;
    requestSave();
    return text;
  }
  /** A saved non-trip descent at the first Sail (PLAN CHOICE 5): kept in meta.loop.parkedRun, never resumed under the loop; the
   *  flag-off boot puts it back (sellStrandedTrip). */
  function parkRun(r) {
    const L = ensureLoop();
    if (!L || !isObj(r) || r.outing === 'trip') return;
    L.parkedRun = r;
    requestSave();
  }

  // ---------------------------------------------------------------- the opening (OPENING.md §10, PLAN §2.1 item 15)
  const wick = () => wickIdOf(ensureLoop()?.wick);
  function setWick(id) {
    const L = ensureLoop();
    if (!L) return null;
    if (id == null) { L.wick = null; return null; }
    L.wick = wickIdOf(id);
    // New Descent's Start: the Wick's ledger is this New Descent's own (WICKS §2.1); a save that has sold an evening keeps its ledger
    if (int(L.evenings) === 0 && !isObj(L.lastTrip)) L.firsts = { seen: [], seals: [], best: {} };
    return L.wick;
  }
  const tutorial = () => { const L = ensureLoop(); return isObj(L?.tutorial) ? { ...L.tutorial } : null; };
  function beginTutorial() {
    const L = ensureLoop();
    if (!L) return null;
    if (!isObj(L.tutorial)) L.tutorial = { done: false, step: 'arrive' };
    return { ...L.tutorial };
  }
  function setTutorialStep(id) {
    const L = ensureLoop();
    if (!isObj(L?.tutorial) || L.tutorial.done === true) return;
    L.tutorial.step = typeof id === 'string' ? id : null;
    requestSave();
  }
  function tutorialDone() {
    const L = ensureLoop();
    if (!L) return;
    L.tutorial = { done: true, step: null };
    if (!isObj(L.said)) L.said = {};
    L.said.firstChart = true;
    saveNow();
  }
  /** Debug builds only (main's debug.loop.tutorial('reset')): the tutorial begins again at its first beat, the Chart's line its own. */
  function resetTutorial() {
    const L = ensureLoop();
    if (!L) return null;
    L.tutorial = { done: false, step: 'arrive' };
    if (isObj(L.said)) delete L.said.firstChart;
    requestSave();
    return { ...L.tutorial };
  }

  // ---------------------------------------------------------------- M1 step 3a (PLAN §2.1 item 5, §3.2, CONTRACT §14.11): the bait slot,
  // the ball, the lift, the Marked giant, the best fish there, the Chart's pick; the cards, seals and catalogue (pure reads)
  const fitted = () => { const L = ensureLoop(); return { lure: L?.fitted?.lure ?? null, bait: L?.fitted?.bait ?? null }; };
  /** The water whose legend bait `id` is (LOOP.legendBait), or null: in 3a the bait slot holds only a legend's bait (PLAN CHOICE 16). */
  const ballWater = (id) => Object.entries(isObj(LOOP().legendBait) ? LOOP().legendBait : {}).find(([, b]) => isObj(b) && b.id === id)?.[0] ?? null;
  /** How many of a bait the bag holds: the trip's (run.bait) on a trip, else the save's bag of that bait's water. */
  const bagCount = (id, L = ensureLoop()) => {
    const r = run();
    if (onTrip(r)) return Math.max(0, int(r.bait?.[id]));
    return Math.max(0, int(L?.bait?.[ballWater(id) ?? r?.zone ?? firstWater(D())]?.[id]));
  };
  /** fit(slot, id) (SPEC §5.4, M1.md §3.6): the bait slot takes a legend's bait the bag holds (refused with none left), or null to
   *  unfit; saved in meta.loop.fitted.bait at once; loop:fit {slot, id}. On a trip the run's line carries it too (run.equippedBait). The
   *  lure slot is step 4's (refused). */
  function fit(slot, id = null) {
    const L = ensureLoop();
    if (!L || slot !== 'bait') return { ok: false };
    const r = run(), trip = onTrip(r);
    if (id != null) {
      if (typeof id !== 'string' || !ballWater(id) || bagCount(id, L) <= 0) return { ok: false };
    }
    const next = id == null ? null : id, prev = L.fitted.bait ?? null;
    L.fitted.bait = next;
    if (trip) {
      if (next) { r.equippedBait = next; r.equipped = next; }
      else if (prev && r.equippedBait === prev) { r.equippedBait = null; r.equipped = null; }
      emit('bait:change', { baitId: r.equippedBait ?? null });
    }
    saveNow();
    emit('loop:fit', { slot, id: next });
    return { ok: true, id: next, count: next ? bagCount(next, L) : 0 };
  }
  /** The ball on her hook (PLAN CHOICE 5): one comes out of the trip's bag, once a bite (a second call for the same bite, as fishing's
   *  hook and progression's fishing:hook both ask, spends nothing more); false off a trip, for a bait that is not a legend's, or with
   *  none left. refundBait gives back only the ball this bite spent (a pass), once. */
  function spendBait(id) {
    const r = run();
    ensureLoop();
    if (!onTrip(r) || typeof id !== 'string' || !ballWater(id)) return false;
    const f = flags(r), bite = Math.max(0, int(f.biteN));
    if (isObj(f.baitOut) && f.baitOut.id === id && f.baitOut.bite === bite) return true;
    const n = Math.max(0, int(r.bait?.[id]));
    if (n <= 0) return false;
    if (!isObj(r.bait)) r.bait = {};
    r.bait[id] = n - 1;
    f.baitOut = { id, bite };
    requestSave();
    return true;
  }
  function refundBait(id) {
    const r = run();
    const L = ensureLoop();
    if (!onTrip(r) || typeof id !== 'string') return false;
    const f = flags(r);
    if (!isObj(f.baitOut) || f.baitOut.id !== id || f.baitOut.bite !== Math.max(0, int(f.biteN))) return false;
    if (!isObj(r.bait)) r.bait = {};
    r.bait[id] = Math.max(0, int(r.bait[id])) + 1;
    f.baitOut = null;
    if (L?.fitted?.bait === id && r.equippedBait !== id) { r.equippedBait = id; r.equipped = id; emit('bait:change', { baitId: id }); }
    requestSave();
    return true;
  }
  const liftDueNow = () => { const L = ensureLoop(); return L ? liftDue(D(), L) : []; };
  /** The lift has played (SPEC §5.1 rule 7, PLAN CHOICE 8): `lifted` gains an owned place once, saved at once; false otherwise (a place
   *  not owned, not a place, or already lifted). A reload before it replays the lift on the next trip. */
  function markLifted(id) {
    const L = ensureLoop();
    if (!L || typeof id !== 'string' || !isObj(LOOP().places?.[id]) || !L.maps.places.includes(id) || L.lifted.includes(id)) return false;
    L.lifted.push(id);
    saveNow();
    return true;
  }
  const lifted = () => { const L = ensureLoop(); return Array.isArray(L?.lifted) ? L.lifted.slice() : []; };
  /** A giant lost at its place is a Marked Fish there (M1.md §2.4, PLAN CHOICE 22): giants[id].marked = 1, for every Wick, at any class.
   *  progression's fish:escaped calls it (through onEscaped); false for a fish that is not a giant. */
  function markGiant(id) {
    const L = ensureLoop();
    const sp = spOf(id);
    if (!L || !sp || sp.giant !== true || sp.rarity === 'legendary') return false;
    if (!isObj(L.giants)) L.giants = {};
    const g = isObj(L.giants[sp.id]) ? L.giants[sp.id] : (L.giants[sp.id] = { landed: 0, marked: 0 });
    g.landed = Math.max(0, int(g.landed));
    g.marked = 1;
    requestSave();
    return true;
  }
  /** Fishing hooks a giant: its mark (if any) is taken, once (+LOOP.giant.markedHold Hold on this hook: catchChance's mods.marked);
   *  true when there was one. */
  function takeGiantMark(id) {
    const L = ensureLoop();
    const g = L?.giants?.[id];
    if (!isObj(g) || !(int(g.marked) > 0)) return false;
    g.marked = 0;
    requestSave();
    return true;
  }
  /** The key a fish's best is kept under: a loop place's id, or open water's `open:<water>` (the fish's waterKey, where its bite was
   *  spent: night water before dark is open water's); null for anything else. */
  function bestKey(fish, key) {
    const k = typeof key === 'string' && key ? key : typeof fish?.waterKey === 'string' && fish.waterKey ? fish.waterKey
      : keyOf(fish?.place ?? null, run()?.zone || spOf(fish?.speciesId)?.zone || firstWater(D()));
    return k.startsWith('open:') || isObj(LOOP().places?.[k]) ? k : null;
  }
  /** The best fish there (M1.md §3.8): a measured fish that is the heaviest at its place (or in open water, `open:<water>`) by the
   *  weight the card shows (data.fishWeight) is written as best[key] = {speciesId, length} (never a weight); true when it is. */
  function noteBest(fish, key) {
    const L = ensureLoop();
    if (!L || !isObj(fish)) return false;
    const sp = spOf(fish.speciesId), len = num(fish.length);
    if (!sp || !(len > 0)) return false;
    const k = bestKey(fish, key);
    if (!k) return false;
    if (!isObj(L.best)) L.best = {};
    const w = (s, length) => { try { return num(D().fishWeight?.(s, { length }), length); } catch { return length; } };
    const prev = L.best[k];
    if (isObj(prev)) {
      const ps = spOf(prev.speciesId);
      if (!(w(sp, len) > (ps ? w(ps, num(prev.length)) : 0))) return false;
    }
    L.best[k] = { speciesId: sp.id, length: len };
    requestSave();
    return true;
  }
  /** The Chart's pick (M1.md §3.8; the ledger's one writer; 3b's ui-chart writes the same {water, place} shape itself): an open water
   *  and, optionally, a place of it the save owns. Refused otherwise ({ok: false}). Saved with the next save. */
  function setPick(o = {}) {
    const L = ensureLoop();
    if (!L || !isObj(o)) return { ok: false };
    const water = typeof o.water === 'string' ? o.water : null, place = o.place == null ? null : String(o.place);
    if (!water || !isOpen(water)) return { ok: false };
    if (place !== null) {
      const P = LOOP().places?.[place];
      if (!isObj(P) || P.water !== water || !L.maps.places.includes(place)) return { ok: false };
    }
    L.chartPick = { water, place };
    requestSave();
    return { ok: true, pick: { water, place } };
  }
  /** The Chart's pick {water, place} (setPick's, or 3b's direct write of the same shape), or null before one is made. */
  const pick = () => { const p = ensureLoop()?.chartPick; return isObj(p) ? { water: p.water ?? null, place: p.place ?? null } : null; };
  const mapCardsNow = () => { const L = ensureLoop(); return L ? mapCards(D(), L, { meta: meta() }) : []; };
  /** sealsOf for a water (default: the next water after the frontier, Sporewood in M1). */
  const seals = (waterId) => { const L = ensureLoop(); return L ? sealsOf(meta(), D(), waterId ?? frontierOf(L, D()).next ?? 'sporewood') : null; };
  const catalogue = (waterId = 'mossmere') => (ensureLoop() ? catalogueFor(meta(), D(), waterId) : null);

  const api = {
    state: () => ensureLoop(),
    hold, holdFull, priceOf, saleOf, keep, letGo, noteBite, bitesSpent, bitesLeft, favour, closeBite, refundOpenBite, debugGive,
    isOpen, listCount: (waterId) => { ensureLoop(); return listCount(meta(), D(), waterId); },
    createTrip, endTrip, lastTrip, markTallySeen, shelf, goal, buy, sayOnce, parkRun,
    wick, setWick, tutorial, beginTutorial, setTutorialStep, tutorialDone, resetTutorial,
    taperFirstOpen, spendTaperFirst, comeback, consumeComeback,
    fit, fitted, spendBait, refundBait, liftDue: liftDueNow, markLifted, lifted, markGiant, takeGiantMark, noteBest,
    setPick, pick, mapCards: mapCardsNow, seals, catalogue,
  };
  /** progression.js's side of the seam (not the API): fishAction's routing, the measure's firsts, the comeback, the shelf session. */
  S.loopInternal = {
    ensure: ensureLoop, onTrip, noteFirst, onEscaped, onZoneChange,
    resetSession: () => { session = []; },
    /** fishAction on a trip: Keep → keep, Let go (and Release) → letGo; every other action does nothing. */
    fishAction(fish, action) {
      if (action === 'keep') return keep(fish);
      if (action === 'letgo' || action === 'release') return letGo(fish);
      return { ok: false, msg: '', gained: {} };
    },
  };
  return api;
}
