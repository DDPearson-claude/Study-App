// ui-af.js — pure helpers for the automatic-fishing presentation and the logs (DESIGN §25.6.4–§25.6.11, §25.14.2a U2′ / U19;
// CONTRACT §13.7 ui, §13.7a). No DOM and no ctx: every function takes the data module (or a slice of it) and plain values, so
// tools/tests can check the words in node. ui-hud-v3.js, ui-screens.js and ui-measure.js build the drawings from what these return.
//
// Promise 2 of §25.6.0 lives here: the only strings with a "%" in them come from oddsView / compareLine (the Journal's Your odds
// block and the gear log). Everything shown from the cast to the reveal (strike word, class estimate, hurry mark) is size-only;
// everything after a loss (the got-away note) names the species and a rough size, never the odds.
//
//   afOn(D)                           the automatic-fishing path (a v3 build that carries AUTOFISH): no reel bar, pips or Ease
//   logLocked(o)                      the log lock (AUTOFISH.logLock): a line is out and neither the card nor the note shows
//   strikeWord(D, grade, n)           the word under the float for a strike grade ("Struck" only for the first 20 strikes)
//   strikeRingOn(setting, o)          the strike ring: always / the First Evening and the first expedition / never
//   strikeTiming(D, cls, mult)        {dur, clean, cleanK}: the window after the "!" and its Clean part, by class (never species)
//   withArticle(name) / classPhrase   "A Dusk Minnow", "the Remembered Sun"; "An Elder", "A Trophy"
//   nearLength(D, cm)                 "near 14 cm" · "near 85 cm" · "near 1.6 m" (AUTOFISH.gotAway.round)
//   placePhrase(name)                 "under the Span", "at the Bell Pool"
//   gotAwayNote(D, p, o)              the toast (Small–Prize) or the card (Trophy+) for a fish:escaped payload
//   oddsView(D, res, o)               the Journal's Your odds block from progression.getOdds (floored %, "?" unseen, "—" unreachable)
//   gearLine / gearHold / compareLine the gear log: an item's Hold, its ×1.6 styles, its targets; the pinned compare
//   ratingLine(D, rating, o)          the Set Out card's tackle rating, in words only
//   leakScan(text, o)                 the hidden-information scan the tests run over the DOM: species names, rarity words, "%"

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const arr = (v) => (Array.isArray(v) ? v : []);
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');
const fill = (tpl, vars = {}) => String(tpl ?? '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? vars[k] : m));

export const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
const CLASS_LABEL = { small: 'Small', keeper: 'Keeper', prize: 'Prize', trophy: 'Trophy', elder: 'Elder', ancient: 'Ancient', legend: 'Legend' };
const CLASS_PLURAL = { small: 'Smalls', keeper: 'Keepers', prize: 'Prizes', trophy: 'Trophies', elder: 'Elders', ancient: 'Ancients', legend: 'Legends' };
const STYLE_PLURAL = { leaper: 'leapers', runner: 'runners', thrasher: 'thrashers', sinker: 'sinkers', sulker: 'sulkers', steady: 'steady fish', darter: 'darters' };
const FAMILY_PLURAL = { insect: 'insect feeders', predator: 'predators', bottom: 'bottom feeders', glow: 'glow fish' };
const T = (D) => D?.AUTOFISH?.text || {};

/** The automatic-fishing path: every v3 build (P1–P2 runs, expeditions, the cove, The Long Descent) that carries AUTOFISH. */
export function afOn(D) { return !!(D && D.V3_ENABLED && D.AUTOFISH && typeof D.AUTOFISH === 'object'); }

export function classLabel(D, cls, ancient = false) {
  if (!cls) return '';
  const c = ancient && cls === 'elder' ? 'ancient' : cls;
  return D?.TEXT_V3?.classes?.[c] || CLASS_LABEL[c] || cap(c);
}
export function classPlural(D, cls) {
  const lbl = classLabel(D, cls);
  return CLASS_PLURAL[cls] && lbl === CLASS_LABEL[cls] ? CLASS_PLURAL[cls] : `${lbl}s`;
}
const andList = (xs) => { xs = arr(xs).filter(Boolean); return xs.length <= 1 ? (xs[0] || '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`; };

// ------------------------------------------------------------------ the log lock (AUTOFISH.logLock, CONTRACT §13.7a "The logs")
export const LOCK_STATES = ['charging', 'casting', 'waiting', 'bite', 'reeling', 'landing'];
/**
 * Is the Journal / gear log locked now? o = {af, state, awaitingNote (a loss whose note has not shown yet), cardOpen (the catch card
 * is up)}. From the cast until the line is back: charging … landing, and `lost` before the got-away note shows. The catch card (or the
 * note) lifts it. Off the automatic-fishing path nothing is ever locked.
 */
export function logLocked({ af = false, state = 'idle', awaitingNote = false, cardOpen = false } = {}) {
  if (!af) return false;
  if (state === 'lost') return !!awaitingNote;
  if (state === 'landing') return !cardOpen;
  return LOCK_STATES.includes(state);
}

// ------------------------------------------------------------------ the strike (DESIGN §25.6.4)
/**
 * The word under the float for a strike: Clean always (lavender glow), Struck for the first `showStruckWord` strikes, Early and
 * Late always (dim). n = how many Struck strikes have already printed their word. Returns {text, grade, tone} or null.
 */
export function strikeWord(D, grade, n = 0) {
  const words = T(D).strike || {};
  const word = words[grade] || CLASS_LABEL[grade] || cap(grade);
  if (grade === 'clean') return { text: word, grade, tone: 'clean' };
  if (grade === 'struck') return num(n) < num(D?.AUTOFISH?.strike?.showStruckWord, 20) ? { text: word, grade, tone: 'struck' } : null;
  if (grade === 'early' || grade === 'late') return { text: word, grade, tone: 'dim' };
  return null;
}
/** The strike ring (Settings: always / first expedition / never; AUTOFISH.strike.ring.default 'firstExpedition'). It shows timing
 *  only, never odds. o = {firstExpedition (the First Outing run / the first expedition), firstEvening (the director is active),
 *  tutorial (fishing's tutorial asked for it)}. */
export function strikeRingOn(setting, { firstExpedition = false, firstEvening = false, tutorial = false } = {}) {
  const s = setting === 'always' || setting === 'never' || setting === 'firstExpedition' ? setting : 'firstExpedition';
  if (s === 'never') return false;
  if (s === 'always') return true;
  return !!(firstExpedition || firstEvening || tutorial);
}
/** The window after the "!" by size class (× the strike-window multiplier the player's Rod, Boons and relics give), clamped, and its
 *  Clean part (the first 40%, at least 0.3 s). Never by species. Returns {dur, clean, cleanK}. */
export function strikeTiming(D, cls, mult = 1) {
  const S = D?.AUTOFISH?.strike || {};
  const base = num(S.window?.[cls], num(S.window?.keeper, 0.7));
  const [lo, hi] = arr(S.clamp).length === 2 ? S.clamp : [0.35, 1.4];
  const dur = Math.max(lo, Math.min(hi, base * Math.max(0.1, num(mult, 1))));
  const clean = Math.min(dur, Math.max(dur * num(S.cleanFrac, 0.4), num(S.cleanMin, 0.3)));
  return { dur, clean, cleanK: dur > 0 ? clean / dur : 0.4 };
}

// ------------------------------------------------------------------ words for a fish
/** "A Dusk Minnow" · "An Ossuary Fry" · "The Remembered Sun" (a name that carries its own article keeps it). */
export function withArticle(name, { capital = true } = {}) {
  const n = String(name || '').trim();
  if (!n) return capital ? 'A fish' : 'a fish';
  if (/^the\s/i.test(n)) return (capital ? 'The' : 'the') + n.slice(3);
  const a = /^[aeiou]/i.test(n) ? 'an' : 'a';
  return `${capital ? cap(a) : a} ${n}`;
}
/** "An Elder", "A Trophy", "An Ancient". */
export function classPhrase(D, cls, ancient = false) {
  const l = classLabel(D, cls, ancient);
  return `${/^[aeiou]/i.test(l) ? 'An' : 'A'} ${l}`;
}
/** A got-away length, never exact (AUTOFISH.gotAway: "near", 1 cm under 20 cm, 5 cm under 1 m, 0.1 m above). cm in. */
export function nearLength(D, cm) {
  cm = Math.max(0, num(cm));
  const G = D?.AUTOFISH?.gotAway || {};
  const word = G.word || 'near';
  if (!(cm > 0)) return '';
  if (cm >= 100) return `${word} ${(Math.round(cm / 10) / 10).toFixed(1)} m`;
  const steps = arr(G.round).length ? G.round : [[20, 1], [100, 5], [Infinity, 10]];
  const step = num((steps.find(([below]) => cm < num(below, Infinity)) || steps[steps.length - 1])[1], 1);
  return `${word} ${Math.max(step, Math.round(cm / step) * step)} cm`;
}
/** A place's name as a phrase after "It's still out there, …": "under the Span", "at the Bell Pool". */
export function placePhrase(name) {
  const n = String(name || '').trim();
  if (!n) return '';
  if (/^(under|beneath|below|among|behind|inside|in|by|beyond|past)\s/i.test(n)) return n.charAt(0).toLowerCase() + n.slice(1).replace(/\bThe\b/, 'the');
  return `at ${n.replace(/^The\s/, 'the ')}`;
}

// ------------------------------------------------------------------ the got-away note (DESIGN §25.6.7)
/**
 * The note for fish:escaped {speciesId, sizeClass, approxLength (cm, already ±8%), reason, place, markedFish, name?, grade, legendary,
 * ancient?, beat?}. o = {speciesName, placeName}. Small / Keeper / Prize: a one-line toast; Trophy and bigger (and legends): the card.
 * Returns {mode, toast, kicker, title, name, size, cause, still, hint, link, aria}. Never a % and never a progress number.
 */
export function gotAwayNote(D, p = {}, { speciesName = '', placeName = '' } = {}) {
  const tx = T(D);
  const G = D?.AUTOFISH?.gotAway || {};
  const toastCls = arr(G.toast).length ? G.toast : ['small', 'keeper', 'prize'];
  const legend = !!p.legendary || p.sizeClass === 'legend';
  const cls = legend ? 'legend' : (p.sizeClass || 'keeper');
  const mode = !legend && toastCls.includes(cls) ? 'toast' : 'card';
  const name = speciesName || cap(String(p.speciesId || 'fish').replace(/_/g, ' '));
  const reason = p.reason || 'thrown';
  const beat = p.beat || p.phase || p.kind || '';
  const C = tx.cause || {};
  let cause = C[reason] || 'It got away.';
  if (reason === 'thrown' && (beat === 'leap' || p.onLeap) && C.thrownLeap) cause = C.thrownLeap;
  if (reason === 'snapped' && (beat === 'lastStand' || beat === 'run') && C.snappedLong) cause = C.snappedLong;
  const len = nearLength(D, p.approxLength ?? p.length);
  const size = legend ? (len ? `${cap(len)}.` : '') : fill(tx.size || '{a} {class}, near {len}.', { a: classPhrase(D, cls, p.ancient).split(' ')[0], class: classLabel(D, cls, p.ancient), len: len.replace(/^near\s/, '') });
  let still = '';
  if (p.markedFish) {
    const ph = placePhrase(placeName);
    still = ph ? fill(tx.stillOut || "It's still out there, {place}.", { place: ph }) : (tx.stillOutWater || "It's still out there, in that deep water.");
  }
  const slot = D?.AUTOFISH?.loss?.hint?.[reason] ?? null;
  let hint = '';
  if (slot === 'strike') hint = p.grade === 'early' || p.grade === 'late' ? (tx.hint?.strike || '') : '';
  else if (slot) hint = tx.hint?.[slot] || '';
  const verb = tx.toastCause?.[reason] || 'got away';
  const toastLine = fill(tx.toast || '{a} {species} {cause}.', { a: '', species: withArticle(name), cause: verb }).replace(/\s{2,}/g, ' ').trim();
  const note = {
    mode, toast: toastLine, kicker: tx.kicker || 'THE ONE THAT GOT AWAY', title: name, name: p.name || '', size, cause, still, hint,
    link: tx.oddsLink || 'Odds in your log', cls,
  };
  note.aria = mode === 'toast' ? toastLine : [note.kicker.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) + '.', name + (note.name ? `, ${note.name}` : '') + '.', size, cause, still, hint].filter(Boolean).join(' ');
  return note;
}

// ------------------------------------------------------------------ the fishing log: Your odds (DESIGN §25.6.11)
/** A chance as the logs print it: data.catchDisplay (whole percent, rounded down) + "%"; null → "—". */
export function pct(D, p) {
  if (p === null || p === undefined) return T(D).log?.unreachable || D?.CATCH_V3?.display?.unreachable || '—';
  const n = typeof D?.catchDisplay === 'function' ? D.catchDisplay(p) : Math.floor(num(p) * 100 + 1e-9);
  return `${n}%`;
}
/**
 * The Your odds block from progression.getOdds(speciesId) = {known: 'unseen'|'glimpsed'|'caught', odds: {small…ancient: p|null} |
 * {legend: p}, withBest: {item, odds}|null, marked: [{name, sizeClass, approxLength, p}], wounds}. o = {speciesName, loadout: [names],
 * itemName (the name for withBest.item), nightMode}. Returns {title, loadout, cells: [{cls, label, text, p, unseen, unreachable}],
 * unseen, withBest: {label, cells}|null, marked: [string], wounds: string, notes: [string]}.
 */
export function oddsView(D, res, { speciesName = '', loadout = [], itemName = '', nightMode = null } = {}) {
  const L = T(D).log || {};
  const unseenMark = D?.CATCH_V3?.display?.unseen || '?';
  const known = res?.known || 'unseen';
  const unseen = known === 'unseen' || !res?.odds;
  const odds = res?.odds || {};
  const legend = odds && Object.prototype.hasOwnProperty.call(odds, 'legend');
  const classes = legend ? ['legend'] : CLASSES;
  const cell = (c, o, isUnseen) => {
    const p = o?.[c];
    const unreachable = !isUnseen && (p === null || p === undefined);
    return { cls: c, label: classLabel(D, c), text: isUnseen ? unseenMark : pct(D, p), p: isUnseen ? null : p ?? null, unseen: isUnseen, unreachable };
  };
  const cells = classes.map((c) => cell(c, odds, unseen));
  let withBest = null;
  if (!unseen && res?.withBest?.odds && res.withBest.item) {
    const reach = classes.filter((c) => res.withBest.odds[c] !== null && res.withBest.odds[c] !== undefined);
    const show = legend ? reach : reach.slice(-3);
    const label = fill(L.with || 'With the {item}:', { item: itemName || String(res.withBest.item).replace(/_/g, ' ') }).replace(/^With the The /, 'With the ');
    withBest = { label, item: res.withBest.item, cells: show.map((c) => cell(c, res.withBest.odds, false)) };
  }
  const marked = unseen ? [] : arr(res?.marked).map((m) => `${fill(L.marked || '{name}, {class}, near {len}', { name: m.name || speciesName, class: classLabel(D, m.sizeClass, m.ancient), len: nearLength(D, m.approxLength).replace(/^near\s/, '') })}: ${pct(D, m.p)}`);
  const w = Math.max(0, Math.round(num(res?.wounds)));
  const per = num(D?.CATCH_V3?.legend?.woundPerEscape, 6);
  const wounds = w > 0 ? `Wounded ${w === 1 ? 'once' : w === 2 ? 'twice' : `${w} times`}: +${Math.min(num(D?.CATCH_V3?.legend?.woundCap, 18), w * per)}` : '';
  const notes = unseen ? [L.unseen || 'Land or lose one to learn its odds.'] : [L.strike || 'A clean strike adds a little; an early or late one costs a little.'];
  if (!unseen && !legend) notes.push(L.gloomtide || 'Gloomtide: a hand slam that lands parts the line.');
  return {
    title: `${speciesName ? `${speciesName} — ` : ''}${(L.title || 'Your odds').toLowerCase()}`, heading: L.title || 'Your odds', known,
    loadout: arr(loadout).filter(Boolean).join(' · '), cells, unseen, legend, withBest, marked, wounds, notes, nightMode,
  };
}

// ------------------------------------------------------------------ the gear log (DESIGN §25.6.11)
/** The styles a tackle slot counts ×1.6 against (CATCH_V3.emphasis): rod → leapers; line → thrashers, sinkers and sulkers; reel → runners. */
export function slotStyles(D, slot) {
  const E = D?.CATCH_V3?.emphasis || {};
  return Object.keys(E).filter((st) => num(E[st]?.[slot], 1) > 1.001);
}
const holdText = (h) => { h = num(h); return Math.abs(h - Math.round(h)) < 0.05 ? String(Math.round(h)) : h.toFixed(1); };
/**
 * One gear-log line for progression.getGearLog()'s entry {id, kind: 'rod'|'line'|'reel'|'bait'|'lure', name, hold, emphasis?
 * ([styles] or {mult, styles}), targets: [speciesId] | 'all' | {family, met?} | {night, met?} | {species: [ids]}, upgrade?, gain?,
 * maxed?}. o = {names (id → species name)}.
 *   "+8 Hold on every fish · counts ×1.6 against leapers."
 *   "+6 Hold against predators (9 species you have met)." · "+10 Hold against Reedjaw Pike, Weeping Carp and Bridgechain Sturgeon."
 */
export function gearLine(D, e, { names = {} } = {}) {
  if (!e) return '';
  const G = T(D).gear || {};
  // a per-run level (P1–P2 rows carry the slot's Hold now and the gain of the next level): the line says what buying it adds
  const hold = holdText(e.upgrade && !e.maxed && num(e.gain) > 0 ? e.gain : e.hold);
  const known = Object.keys(names).length > 0;
  const nm = (id) => names[id] || String(id).split('_').map(cap).join(' ');
  // a species the build does not carry yet (a phase-2 giant in a phase-1 build) is not named
  const inBuild = (ids) => arr(ids).filter((id) => !known || names[id]);
  if (e.kind === 'rod' || e.kind === 'line' || e.kind === 'reel') {
    const given = Array.isArray(e.emphasis) ? e.emphasis : arr(e.emphasis?.styles);
    const styles = (given.length ? given : slotStyles(D, e.kind)).map((s) => STYLE_PLURAL[s] || s);
    if (!styles.length) return `+${hold} Hold on every fish.`;
    return fill(G.tackle || '+{hold} Hold on every fish · counts ×1.6 against {styles}.', { hold, styles: andList(styles) });
  }
  const tg = e.targets;
  const met = (x) => (Array.isArray(x?.met) ? x.met.length : num(x?.met, -1));
  let targets = '';
  if (tg === 'all') targets = 'every fish';
  else if (Array.isArray(tg)) {
    const ids = inBuild(tg);
    if (!ids.length) return G.none || 'Helps nothing you have met yet.';
    targets = ids.length > 5 ? `${ids.length} species you have met` : andList(ids.map(nm));
  } else if (tg && typeof tg === 'object') {
    if (Array.isArray(tg.species)) { const ids = inBuild(tg.species); if (!ids.length) return G.none || 'Helps nothing you have met yet.'; targets = andList(ids.map(nm)); }
    else {
      const base = tg.family ? (FAMILY_PLURAL[tg.family] || `${tg.family} fish`) : tg.night ? 'night-only fish, at night' : 'some fish';
      const n = met(tg);
      targets = n >= 0 ? `${base} (${n === 0 ? 'none you have met yet' : `${n} species you have met`})` : base;
    }
  } else return G.none || 'Helps nothing you have met yet.';
  if (targets === 'every fish') return `+${hold} Hold on every fish.`;
  return fill(G.item || '+{hold} Hold against {targets}.', { hold, targets });
}
/**
 * The pinned compare: pinned = {speciesId, sizeClass, reason?} (reason set = the last fish that got away, auto-pinned). a, b = the
 * chances (progression.compareOdds) without and with the item. "The Reedjaw Pike that threw the hook (Trophy): 16% → 24% with this."
 */
export function compareLine(D, pinned, a, b, { speciesName = '' } = {}) {
  if (!pinned || a === null || a === undefined || b === null || b === undefined) return '';
  const G = T(D).gear || {};
  const name = speciesName || cap(String(pinned.speciesId || 'fish').replace(/_/g, ' '));
  const who = pinned.reason ? `The ${name.replace(/^the\s/i, '')} that ${T(D).toastCause?.[pinned.reason] || 'got away'}` : name;
  return fill(G.compare || '{name} ({class}): {from} → {to} with this.', { name: who, class: classLabel(D, pinned.sizeClass, pinned.ancient), from: pct(D, a), to: pct(D, b) });
}
/** The pinned fish as a heading over the gear log: "The Reedjaw Pike that threw the hook (Trophy)". */
export function pinnedLabel(D, pinned, { speciesName = '' } = {}) {
  if (!pinned) return '';
  const name = speciesName || cap(String(pinned.speciesId || 'fish').replace(/_/g, ' '));
  if (pinned.reason) return fill(T(D).gear?.lastAway || 'The {name} that {cause} ({class})', { name: name.replace(/^the\s/i, ''), cause: T(D).toastCause?.[pinned.reason] || 'got away', class: classLabel(D, pinned.sizeClass, pinned.ancient) });
  return `${name} (${classLabel(D, pinned.sizeClass, pinned.ancient)})`;
}

// ------------------------------------------------------------------ the Set Out card's rating, in words (DESIGN §25.6.6)
/** rating = progression.getTackleRating(zone) = {reference, held, next, word}. "Against the Reedjaw Pike: holds Keepers. Prizes are a
 *  long shot." Words only: no % ever. */
export function ratingLine(D, rating, { speciesName = '' } = {}) {
  if (!rating || !rating.reference) return '';
  const tx = T(D);
  const sp = (speciesName || cap(String(rating.reference).replace(/_/g, ' '))).replace(/^the\s/i, '');
  const plural = (c) => classPlural(D, c);
  if (!rating.held) return fill(tx.ratingNone || 'Against the {species}: even Smalls are {word}.', { species: sp, word: rating.word || 'beyond this tackle' });
  const [s1, s2] = String(tx.rating || 'Against the {species}: holds {held}s. {next}s are {word}.').split(/(?<=\.)\s+/);
  let out = fill(s1.replace('{held}s', plural(rating.held)), { species: sp });
  if (rating.next && rating.word && s2) out += ` ${fill(s2.replace('{next}s', plural(rating.next)), { word: rating.word })}`;
  return out;
}

// ------------------------------------------------------------------ the hidden-information scan (U2′ acceptance)
const RARITY_WORDS = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
/**
 * Scan some visible text (the DOM's text plus every aria-label and title) for anything that names or encodes the hooked fish while a
 * line is out: species names, rarity words and "%". o = {names: [species names], words: [extra], allowPct: false}. Returns the hits.
 */
export function leakScan(text, { names = [], words = RARITY_WORDS, allowPct = false } = {}) {
  const s = String(text || '');
  const hits = [];
  if (!allowPct && s.includes('%')) hits.push('%');
  for (const n of arr(names)) {
    if (!n || n.length < 3) continue;
    const re = new RegExp(`(^|[^A-Za-z])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^A-Za-z])`, 'i');
    if (re.test(s)) hits.push(n);
  }
  for (const w of arr(words)) if (new RegExp(`\\b${w}\\b`).test(s)) hits.push(w);
  return hits;
}
