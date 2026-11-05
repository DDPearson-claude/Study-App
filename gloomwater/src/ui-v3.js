// ui-v3.js — pure helpers for the v3 in-play HUD (DESIGN §25.5.7, §25.6.1, §25.6.4, §25.6.7, §25.6.8; CONTRACT §13.7 ui).
// No DOM and no ctx: every function takes the data module (or a slice of it) and plain values, so tools/tests can check
// them in node. ui-hud.js and ui-screens.js build the drawings from what these return.
//
//   v3Run(D, run)                     is this a v3 run (data flag on, the run carries a night mode, not The Long Descent)?
//   modeHud(D, mode)                  BALANCE.nightModes[mode].hud (or null)
//   hudVisibility(o)                  the §25.5.7 table for this frame: {embers, flare, burn, relight, weapons, wellFed, lowHpVig}
//   nightWord(D, o)                   'Stillnight' or 'Gloomtide' for tonight (the phase stays gloomtide in code)
//   favourBand(n, quiet, D)           the float's phrase for 0–5 notches ("the water favours you" …)
//   favourGroups(terms, D, o)         the active favours by family, in plain words
//   favourLine(groups)                "Place: Astir · Hour: Night Rise, Far Water · Tackle: Ember Roe, deep band"
//   favourMu(terms, D) / notchesFor   μ of a term list (capped) and its notches
//   TELLS / tellInfo(id)              the five bite tells: the pictogram key, the words and the class they belong to
//   classInfo(D, id, ancient)         {id, label, seal, rank}
//   fmtLength(cm, D)                  "84 mm" below 20 cm, "112 cm", "8.50 m" from 10 m
//   tackleRating(D, zone, tiers)      {cls, label, next, nextLabel, nextPct} from BALANCE.tackleRating (or TACKLE.rating)
//   nearMiss(D, p, o)                 the near-miss card's lines for a fish:escaped-big payload
//   nearestLamp(lamps, x, z, speed)   {lamp, dist, secs} of the nearest watch-lamp
//   watchLineText(D, info)            "Nearest watch-lamp 34 m · ≈ 7 s" (TEXT_V3.watchLamp)

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const arr = (v) => (Array.isArray(v) ? v : []);
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');
const fill = (tpl, vars = {}) => String(tpl ?? '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? vars[k] : m));

export const CLASS_ORDER = ['small', 'keeper', 'prize', 'trophy', 'elder'];

/** A v3 run: the data flag is on, the night-mode table exists and the run carries a night mode. The Long Descent keeps the
 *  v1 HUD (its survival keeps the satiety bar and the Embers death model). */
export function v3Run(D, run) {
  if (!D || !D.V3_ENABLED || !D.BALANCE?.nightModes || !run) return false;
  if (run.outing === 'descent') return false;
  return typeof run.nightMode === 'string' && !!D.BALANCE.nightModes[run.nightMode];
}

export function modeHud(D, mode) {
  const m = D?.BALANCE?.nightModes?.[mode];
  return m && typeof m.hud === 'object' ? m.hud : null;
}

/**
 * The day screen carries no combat UI (DESIGN §25.5.7). Inputs: hud (the mode's table), phase, swarmNight (tonight's swarm
 * still to come or running: combat.swarmTonight), swarmActive (combat.swarmActive), hitT (s since the last Ember lost; Infinity
 * when none), oilFrac (0–1), scorched, guttering, hp / maxHp. Returns what to show.
 */
export function hudVisibility({ hud, phase = 'calm', swarmNight = false, swarmActive = false, hitT = Infinity, oilFrac = 1,
  scorched = false, guttering = false, hp = 1, maxHp = 1 } = {}) {
  if (!hud) return { embers: true, flare: true, burn: true, relight: false, weapons: true, wellFed: false, lowHpVig: true };
  const night = phase === 'dusk' || phase === 'gloomtide';
  const swarmDusk = (night && swarmNight) || swarmActive;
  const hitShow = num(hud.embersHitShow, 4);
  let embers;
  switch (hud.embers) {
    case 'hidden': embers = false; break;
    case 'swarmOrHit': embers = swarmDusk || hitT <= hitShow || !!scorched; break;
    default: embers = true;
  }
  let flare;
  switch (hud.flare) {
    case 'hidden': flare = false; break;
    case 'swarmDusk': flare = swarmDusk; break;
    default: flare = true;
  }
  const low = oilFrac < 0.25 || !!guttering;
  let burn;
  switch (hud.burn) {
    case 'lowOil': burn = low; break;
    case 'lowOilOrSwarm': burn = low || swarmActive; break;
    default: burn = true;
  }
  // "Relight": the Burn button wears that name when it is shown for a thin lantern (§25.5.7, Still / Lantern)
  const relight = burn && low && hud.burn !== 'always';
  // weapons are combat's: their row waits for the night (or a raid) outside the classic mode
  const weapons = hud.embers === 'always' || swarmDusk;
  return { embers, flare, burn, relight, weapons, wellFed: hud.wellFed !== false, lowHpVig: embers && hp <= 1 && maxHp > 1 };
}

/** The UI calls a quiet night a Stillnight (DESIGN §25.5.1); a swarm night stays the Gloomtide. */
export function nightWord(D, { swarm = true } = {}) {
  return swarm ? 'Gloomtide' : (D?.TEXT_V3?.stillnight || 'Stillnight');
}

// ------------------------------------------------------------------ the float's favour (U13)
const BANDS = [
  'the water gives nothing away',
  'a little favour',
  'the water favours you',
  'the water leans your way',
  'the water is with you',
  'everything is in your favour',
];
export function favourBand(n, quiet = false, D = null) {
  if (quiet) return D?.TEXT_V3?.quiet || 'The water here has gone quiet.';
  return BANDS[Math.max(0, Math.min(5, Math.round(num(n))))];
}

export const FAMILY_LABEL = { place: 'Place', hour: 'Hour', match: 'Match', tackle: 'Tackle', signs: 'Signs', pressure: 'Pressure', debug: 'Set' };
const FAMILY_ORDER = ['place', 'hour', 'match', 'tackle', 'signs', 'pressure', 'debug'];
const TERM_WORDS = {
  place: { inside: 'inside a place', astir: 'Astir', window: 'its window is live' },
  hour: { dusk: 'Last Light', dawn: 'dawn', nightRise: 'Night Rise', hush: 'Hush', farWater: 'Far Water' },
  match: { condition: 'its weather', rumour: "today's rumour" },
  tackle: { cleanCast: 'Clean Cast', depthLowerThird: 'deep band', cutStrip: 'Cut Strip', clearWater: 'the line shows in clear water' },
  signs: { strike: 'strike splash', nervous: 'nervous water', bubbles: 'bubble trail', letItPass: 'let one pass', rise: 'rise ring', boil: 'boil', glow: 'glow trail' },
  pressure: { pressure: 'fished hard today' },
  debug: { setFavour: 'by hand' },
};
/** One term in plain words. Baits and lures read their own names from data. */
export function termWords(t, D = null, { placeName = '' } = {}) {
  if (!t) return '';
  const fam = t.family, id = String(t.id ?? '');
  if (fam === 'place' && id === 'inside' && placeName) return placeName;
  const w = TERM_WORDS[fam]?.[id];
  if (w) return w;
  if (fam === 'tackle') {
    const bait = D?.BAIT_BY_ID?.[id] || arr(D?.BAITS).find((b) => b?.id === id);
    if (bait?.name) return bait.name;
    const lure = arr(D?.LURES).find((l) => l?.id === id);
    if (lure?.name) return lure.name;
  }
  if (fam === 'place') {
    const pl = D?.PLACE_BY_ID?.[id] || D?.PLACE_V3_BY_ID?.[id];
    if (pl?.name) return pl.name;
  }
  return id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();
}
/** The active favours grouped by family in the §25.7.2 order: [{family, label, words: [{text, neg}], value}]. */
export function favourGroups(terms, D = null, opts = {}) {
  const by = new Map();
  for (const t of arr(terms)) {
    if (!t || !num(t.value)) continue;
    const fam = FAMILY_LABEL[t.family] ? t.family : 'tackle';
    if (!by.has(fam)) by.set(fam, { family: fam, label: FAMILY_LABEL[fam], words: [], value: 0 });
    const g = by.get(fam);
    const text = termWords(t, D, opts);
    if (text && !g.words.some((w) => w.text === text)) g.words.push({ text, neg: num(t.value) < 0 });
    g.value += num(t.value);
  }
  return FAMILY_ORDER.filter((f) => by.has(f)).map((f) => by.get(f));
}
export function favourLine(groups) {
  return arr(groups).map((g) => `${g.label}: ${g.words.map((w) => w.text).join(', ')}`).join(' · ');
}
/** μ of a list of terms, capped (BALANCE.favour.cap 1.8; pressure can take it below 0). */
export function favourMu(terms, D = null) {
  const capV = num(D?.BALANCE?.favour?.cap, 1.8);
  return Math.min(capV, arr(terms).reduce((a, t) => a + num(t?.value), 0));
}
export function notchesFor(mu, D = null) {
  if (typeof D?.favourNotches === 'function') return D.favourNotches(mu);
  let n = 0;
  for (const t of arr(D?.BALANCE?.favour?.notches).length ? D.BALANCE.favour.notches : [0.15, 0.45, 0.8, 1.2, 1.6]) if (mu >= t) n++;
  return n;
}

// ------------------------------------------------------------------ bite tells and classes (U2)
/** The five tells (DESIGN §25.6.4), as the float shows them: the words are the bobber's motion, `cls` the class it means. */
export const TELLS = {
  doublePop: { word: 'a quick double pop', short: 'pop, pop', cls: 'small' },
  plunge: { word: 'a clean plunge', short: 'a plunge', cls: 'keeper' },
  dragUnder: { word: 'a slow drag under', short: 'a slow drag', cls: 'prize' },
  flatSlide: { word: 'it lies flat, then slides', short: 'lies flat', cls: 'trophy' },
  dome: { word: 'the water domes', short: 'a dome', cls: 'elder' },
};
export function tellInfo(id) { return TELLS[id] || null; }

const SEALS = { prize: 'inkStamp', trophy: 'oxbloodWax', elder: 'blackWaxRibbon' };
export function classInfo(D, id, ancient = false) {
  if (!id) return null;
  const sc = arr(D?.SIZE_CLASSES).find((c) => c?.id === id);
  const T = D?.TEXT_V3?.classes || {};
  const label = ancient && id === 'elder' ? (T.ancient || 'Ancient') : (T[id] || sc?.label || cap(id));
  return { id, label, seal: sc ? sc.seal : (SEALS[id] || null), rank: Math.max(0, CLASS_ORDER.indexOf(id)), ancient: !!ancient && id === 'elder' };
}

/** Lengths: millimetres under 20 cm (BALANCE.ceremony.mmBelow), centimetres to 10 m, then metres. */
export function fmtLength(cm, D = null) {
  cm = num(cm);
  const mmBelow = num(D?.BALANCE?.ceremony?.mmBelow, 20);
  if (cm <= 0) return '—';
  if (cm < mmBelow) return `${Math.round(cm * 10)} mm`;
  if (cm >= 1000) return `${(cm / 100).toFixed(2)} m`;
  return `${Math.round(cm)} cm`;
}

// ------------------------------------------------------------------ tackle rating and the near-miss card
/** The fitted set's rating in a lake: the largest class a skilled angler lands ≥ 50% against the lake's reference species, and
 *  the next class's land %. tiers = {rod, line, reel} (P1–P2: data.upgradeTiers(run.upgrades)). */
export function tackleRating(D, zone, tiers = {}) {
  const R = D?.BALANCE?.tackleRating;
  const classes = arr(R?.classes).length ? R.classes : CLASS_ORDER;
  const t = (k) => Math.max(0, Math.min(4, Math.floor(num(tiers?.[k]))));
  const L = R?.lakes?.[zone];
  let ci = -1, next = null;
  if (L && typeof L.cls === 'string') {
    const i = t('rod') * 25 + t('line') * 5 + t('reel');
    const ch = L.cls[i];
    ci = ch === undefined ? -1 : Number(ch);
    next = num(arr(L.next)[i], null);
  } else {
    // the matched-set fallback (TACKLE.rating[lake][tier] = [cls, next %] | 'cls' | {cls, next})
    const tier = Math.min(t('rod'), t('line'), t('reel'));
    const m = D?.TACKLE?.rating?.[zone]?.[tier];
    const id = Array.isArray(m) ? m[0] : typeof m === 'string' ? m : m?.cls;
    ci = classes.indexOf(id);
    next = Array.isArray(m) ? num(m[1], null) : typeof m === 'object' && m ? num(m.next, null) : null;
  }
  if (!(ci >= 0)) return null;
  const cls = classes[ci], nxt = classes[ci + 1] || null;
  return { cls, label: classInfo(D, cls)?.label || cap(cls), next: nxt, nextLabel: nxt ? classInfo(D, nxt)?.label || cap(nxt) : null, nextPct: next };
}

const CAUSE_WORD = { snap: 'Snapped', thrown: 'Thrown hook', spooled: 'Spooled', fouled: 'Fouled', slack: 'Slipped the slack' };
const CAUSE_TIP = { slack: 'Keep a little tension, always.' };
/**
 * The near-miss card for fish:escaped-big {speciesId, z, sizeClass, length, progress, cause} (DESIGN §25.6.7):
 * silhouette, estimated class and length (±8%), % landed, cause, the tackle rating here and one tip.
 * Returns {species, title, cls, est, line, rating, tip}. o = {rating (tackleRating result), round (fn for ±8%)}.
 */
export function nearMiss(D, p = {}, o = {}) {
  const sp = D?.SPECIES_BY_ID?.[p.speciesId] || arr(D?.SPECIES).find((s) => s?.id === p.speciesId) || null;
  const ci = classInfo(D, p.sizeClass, p.ancient);
  const est = num(D?.BALANCE?.ceremony?.nearMiss?.estimate, 0.08);
  const L = num(p.length);
  const jitter = typeof o.round === 'function' ? o.round(L, est) : L;
  const estTxt = L > 0 ? `~${fmtLength(jitter, D)}` : '';
  const pct = Math.round(Math.max(0, Math.min(1, num(p.progress))) * 100);
  const T3 = D?.TEXT_V3 || {};
  const cause = T3.causes?.[p.cause] || CAUSE_WORD[p.cause] || 'Lost';
  const tip = T3.tips?.[p.cause] || CAUSE_TIP[p.cause] || '';
  const r = o.rating || null;
  let rating = '';
  if (r) {
    rating = `Your tackle is rated ${r.label} here`;
    if (r.nextLabel && r.nextPct !== null && r.nextPct !== undefined) rating += ` (${r.nextLabel}s ${Math.round(r.nextPct)}%)`;
    rating += '.';
  }
  const parts = [sp?.name || cap(String(p.speciesId || 'A fish').replace(/_/g, ' ')), ci?.label, estTxt].filter(Boolean);
  return { species: sp, title: parts.join(' · '), cls: ci, est: estTxt, line: `${cause} at ${pct}%.`, rating, tip, pct, cause: p.cause || null };
}

// ------------------------------------------------------------------ watch-lamps (S6)
export function nearestLamp(lamps, x, z, speed = 6) {
  let best = null, bd = Infinity;
  for (const l of arr(lamps)) {
    const lx = num(l?.position?.x, num(l?.x, NaN)), lz = num(l?.position?.z, num(l?.z, NaN));
    if (!Number.isFinite(lx) || !Number.isFinite(lz)) continue;
    const d = Math.hypot(lx - x, lz - z);
    if (d < bd) { bd = d; best = { lamp: l, x: lx, z: lz, r: num(l.radius, 6) }; }
  }
  if (!best) return null;
  const inside = bd <= best.r;
  // the line counts to the pool's edge, at the raft's speed
  const toEdge = Math.max(0, bd - best.r);
  return { ...best, dist: bd, toEdge, inside, secs: toEdge / Math.max(0.5, num(speed, 6)) };
}
export function watchLineText(D, info) {
  if (!info) return '';
  const tpl = D?.TEXT_V3?.watchLamp || 'Nearest watch-lamp {m} m · ≈ {s} s';
  return fill(tpl, { m: Math.round(info.dist), s: Math.max(1, Math.round(info.secs)) });
}
