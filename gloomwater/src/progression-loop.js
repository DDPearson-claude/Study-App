// progression-loop.js — the Full Hold's ledger: catch, keep, sell, upgrade (docs/loop/SPEC.md §3, §4, §9; slice-1a/PLAN.md §3.3,
// §3.4; docs/loop/WICKS.md §2). A helper of progression.js only: createLoop(S) receives the shared internals `S`, as
// progression-af.js does, and becomes `ctx.progression.loop` (null off the loop). It never imports data.js: data comes from
// `S.ctx.data` or is passed in, because the tests evaluate `data.js?loop` as a module instance of its own.
//
// The pure exports (no ctx, no data import; node tests call them directly):
//   freshLoop(D) · migrateLoop(meta, D, {hasTrip}) · tallyLines(creel, {D, saleOf}) · tallyBook(metaLoop, creel, run, opts) ·
//   sellStrandedTrip(save) (the flag-off boot rule: needs no data) · shelfItems(D, metaLoop, session) · goalOf(items) ·
//   v8 (SPEC §5.5): listFor(D, waterId) · listCount(meta, D, waterId)
// meta.loop (SPEC §9, PLAN §3.4): `holdSlots` is the bought count (3–8) for every Wick; a Wick's slots are data.loopSlots. Slice 1a
// adds `wick`, `tutorial`, `said`, `lastTrip` and `firsts` (the Wick's ledger, WICKS §2.1), and `parkedRun` only while an old descent
// waits (PLAN CHOICE 5). A trip is a run with `outing: 'trip'`; its hold IS `run.creel` (PLAN CHOICE 19).
//
// Seam commit S (PLAN §2.0): the pure exports are built; createLoop(S) returns every method of §3.3 as an inert stub (null, false,
// 0 or {ok: false}) and is not yet wired into progression.js. LOOP_METHODS names them, for the fixture's fakeLoop and the tests.

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
  'wick', 'setWick', 'tutorial', 'beginTutorial', 'setTutorialStep', 'tutorialDone',
  // the passives (WICKS §2.2, §2.5): Taper's flag, one per evening; Ashwick's comeback
  'taperFirstOpen', 'spendTaperFirst', 'comeback', 'consumeComeback',
]);

/** The water a fresh save owns: the one LOOP.waters puts first (the Mossmere). */
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
 * (1a: Hold 5, T2), once owned, is a permanent {bought: true} card. Prices are LOOP's (the price factor is a fish's, not the shelf's).
 * Each item: {id ('rod:1' | 'hold:4', the buy id and data-buy), tab, slot, level, name (the card's), goalName (the goal line's:
 * "Hold N" or the tier's name), line (the card's one line), price, bought}.
 */
export function shelfItems(D, metaLoop, session = []) {
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
  return out;
}

/** The goal line's item (SPEC §8.3, PLAN CHOICE 11): the cheapest card not bought (the first on a tie), or null when none is left. */
export function goalOf(items) {
  let best = null;
  for (const it of Array.isArray(items) ? items : []) if (isObj(it) && !it.bought && (!best || num(it.price) < num(best.price))) best = it;
  return best ? { id: best.id, name: best.goalName ?? best.name, price: best.price, slot: best.slot, level: best.level } : null;
}

/**
 * v8 (SPEC §5.5 (c)): a water's list, computed by the rule and never listed: its open-water fish and the fish of the day and old
 * water its lake map opens (LOOP.access.list.kinds), on its plain bait (a fish that bites on another bait only is off it);
 * giants and legends never. In 1a, on the loop's data, the Mossmere's six built phase-1 open-water fish.
 */
export function listFor(D, waterId) {
  const A = D?.LOOP?.access?.list || { kinds: ['open', 'day', 'old'], plainBaitOnly: true };
  const plain = D?.LOOP?.waters?.[waterId]?.plainBait ?? null;
  const kindOf = (s) => (s.place ? D?.PLACE_BY_ID?.[s.place]?.kind ?? null : 'open');
  return (D?.SPECIES || []).filter((s) => isObj(s) && s.zone === waterId && s.rarity !== 'legendary' && s.rarity !== 'epic' && !s.giant && !s.cove
    && A.kinds.includes(kindOf(s)) && (!A.plainBaitOnly || !s.bait || s.bait === plain)).map((s) => s.id);
}

/** v8 (SPEC §5.5 (c)): the list's count on this save: listed ids with num(journal[id].caught) > 0 (never the built caughtOf), so a
 *  Glimpsed entry does not count, a fish let go does, and an old save's catches count. */
export function listCount(meta, D, waterId) {
  const ids = listFor(D, waterId), J = isObj(meta?.journal) ? meta.journal : {};
  return { have: ids.filter((id) => num(J[id]?.caught) > 0).length, need: ids.length };
}

/**
 * `ctx.progression.loop` (PLAN §3.3). Seam commit S: every method is an inert stub (null, false, 0 or {ok: false}); lane A builds
 * them on its branch and progression.js wires the object in (null off the loop). Read it through optional chaining (§3's stub rule).
 */
export function createLoop(S) {
  void S;
  const no = () => ({ ok: false, msg: '' });
  const api = {
    state: () => null,
    hold: () => null,
    holdFull: () => false,
    priceOf: () => 0,
    saleOf: () => null,
    keep: no,
    letGo: no,
    noteBite: () => {},
    bitesSpent: () => 0,
    bitesLeft: () => 0,
    favour: () => null,
    closeBite: () => {},
    refundOpenBite: () => false,
    debugGive: () => 0,
    isOpen: () => false,
    listCount: () => null,
    createTrip: () => null,
    endTrip: () => null,
    lastTrip: () => null,
    markTallySeen: () => {},
    shelf: () => null,
    goal: () => null,
    buy: no,
    sayOnce: () => null,
    parkRun: () => {},
    wick: () => null,
    setWick: () => null,
    tutorial: () => null,
    beginTutorial: () => null,
    setTutorialStep: () => {},
    tutorialDone: () => {},
    taperFirstOpen: () => false,
    spendTaperFirst: () => false,
    comeback: () => null,
    consumeComeback: () => null,
  };
  return api;
}
