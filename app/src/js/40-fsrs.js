// Spaced-review scheduler: FSRS-4.5 at day granularity (docs/ARCHITECTURE.md section 8).
//
// A card's memory state is s = { due, stability, difficulty, reps, lapses, last }, where
// stability is the number of days until recall probability falls to 90%, difficulty runs 1..10,
// and due/last are local 'YYYY-MM-DD' days. Grades: 1 Again, 2 Hard, 3 Good, 4 Easy.
//
//   U.fsrs.init(day)                       new card, first due the day after `day`
//   U.fsrs.review(s, grade, day, cardId?)  state after a review on `day`
//   U.fsrs.preview(s, day, cardId?)        {1..4: next state} for "back in N days" hints
//   U.fsrs.retrievability(s, day)          0..1 chance of recall today (0 for an unreviewed card)
//   U.fsrs.band(s, day)                    'new' | 'fragile' | 'growing' | 'strong' (never shown as %)
//
// Formulas and default weights are the published FSRS-4.5 ones. Because Dan reviews at most
// once a day, there are no same-day learning steps: a forgotten card simply comes back tomorrow.
// Intervals are fuzzed by a small deterministic amount keyed on the card id, so cards learned
// together drift apart instead of always landing on the same day.
(function () {
  var W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367,
    1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
  var DECAY = -0.5;
  var FACTOR = 19 / 81;          // makes R = 0.9 exactly when t = S
  var RETENTION = 0.9;
  var MAX_INTERVAL = 365;
  // Fuzz grows with the interval: +-15% between 2.5 and 7 days, 10% to 20 days, 5% beyond.
  var FUZZ = [{ start: 2.5, end: 7, factor: 0.15 }, { start: 7, end: 20, factor: 0.1 }, { start: 20, end: Infinity, factor: 0.05 }];

  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  function round2(x) { return Math.round(x * 100) / 100; }
  function grade(g) { g = Math.round(Number(g)); return isFinite(g) ? clamp(g, 1, 4) : 3; }

  function initStability(g) { return Math.max(W[g - 1], 0.1); }
  function initDifficulty(g) { return clamp(W[4] - (g - 3) * W[5], 1, 10); }
  function nextDifficulty(d, g) {
    var shifted = d - W[6] * (g - 3);
    return clamp(W[7] * initDifficulty(3) + (1 - W[7]) * shifted, 1, 10);   // mean reversion
  }
  function forgetting(t, s) { return Math.pow(1 + FACTOR * t / s, DECAY); }
  function stabilityAfterRecall(d, s, r, g) {
    var hard = g === 2 ? W[15] : 1, easy = g === 4 ? W[16] : 1;
    return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * hard * easy);
  }
  function stabilityAfterLapse(d, s, r) {
    var next = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]);
    return Math.min(next, s);    // forgetting never leaves a memory stronger than before
  }
  function rawInterval(s) {
    return clamp(Math.round(s / FACTOR * (Math.pow(RETENTION, 1 / DECAY) - 1)), 1, MAX_INTERVAL);
  }
  // Deterministic 0..1 from the card id and how many times it has been reviewed.
  function unit(cardId, reps) { return U.hash(String(cardId || 'card') + ':' + reps) / 4294967296; }
  function fuzz(ivl, u) {
    if (ivl < 2.5) return ivl;
    var delta = 1;
    FUZZ.forEach(function (r) { delta += r.factor * Math.max(Math.min(ivl, r.end) - r.start, 0); });
    var lo = Math.max(2, Math.round(ivl - delta)), hi = Math.min(MAX_INTERVAL, Math.round(ivl + delta));
    lo = Math.min(lo, hi);
    return lo + Math.floor(u * (hi - lo + 1));
  }
  function reviewed(s) { return !!(s && s.reps > 0 && s.stability > 0 && s.last); }

  function init(day) {
    day = day || U.today();
    return { due: U.addDays(day, 1), stability: 0, difficulty: 0, reps: 0, lapses: 0, last: null };
  }

  // Next state for every grade at once, so intervals can be kept in order (Hard <= Good < Easy).
  function preview(s, day, cardId) {
    day = day || U.today();
    s = s || init(day);
    var first = !reviewed(s);
    var r = first ? 1 : forgetting(Math.max(0, U.daysBetween(s.last, day)), s.stability);
    var out = {}, ivl = {}, u = unit(cardId, s.reps || 0);
    [1, 2, 3, 4].forEach(function (g) {
      var st, df;
      if (first) { st = initStability(g); df = initDifficulty(g); }
      else {
        st = g === 1 ? stabilityAfterLapse(s.difficulty, s.stability, r) : stabilityAfterRecall(s.difficulty, s.stability, r, g);
        df = nextDifficulty(s.difficulty, g);
      }
      st = clamp(st, 0.1, 36500);
      out[g] = {
        stability: round2(st), difficulty: round2(df),
        reps: (s.reps || 0) + 1,
        lapses: (s.lapses || 0) + (g === 1 ? 1 : 0),
        last: day,
      };
      ivl[g] = g === 1 ? 1 : fuzz(rawInterval(st), u);
    });
    ivl[2] = Math.min(ivl[2], ivl[3]);
    ivl[3] = Math.min(MAX_INTERVAL, Math.max(ivl[3], ivl[2] + 1));
    ivl[4] = Math.min(MAX_INTERVAL, Math.max(ivl[4], ivl[3] + 1));
    [1, 2, 3, 4].forEach(function (g) { out[g].due = U.addDays(day, ivl[g]); out[g].interval = ivl[g]; });
    return out;
  }

  function review(s, g, day, cardId) {
    var next = preview(s, day, cardId)[grade(g)];
    return { due: next.due, stability: next.stability, difficulty: next.difficulty, reps: next.reps, lapses: next.lapses, last: next.last };
  }

  function retrievability(s, day) {
    if (!reviewed(s)) return 0;
    return forgetting(Math.max(0, U.daysBetween(s.last, day || U.today())), s.stability);
  }

  // Coarse strength for the Map: fragile = just forgotten or fading, strong = holds for weeks.
  function band(s, day) {
    if (!reviewed(s)) return 'new';
    var r = retrievability(s, day);
    if (r < 0.7 || s.stability < 2) return 'fragile';
    if (s.stability >= 21 && r >= 0.85) return 'strong';
    return 'growing';
  }

  U.fsrs = {
    init: init, review: review, preview: preview, retrievability: retrievability, band: band,
    params: { w: W.slice(), decay: DECAY, factor: FACTOR, retention: RETENTION, maxInterval: MAX_INTERVAL },
  };
})();
