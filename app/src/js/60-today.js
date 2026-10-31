// Spaced review: the card store, today's queue, the Today tab and the review session
// (docs/ARCHITECTURE.md sections 4, 8, 9, 10).
//
//   U.review.addFromLesson(tid, iid, lesson, outcome, {round, at}) -> Promise<[cardId]>
//       outcome = {checks:{[checkId]:{correct}}, say:{text, verdict}}. Each check Dan answered becomes
//       a card of the same type; his say-it-back answer becomes a 'recall' card. Re-learning an idea
//       replaces its cards (unchanged questions keep their schedule). Records cardsRound = round.
//   U.review.mendCards() -> Promise<[{tid, iid}]>   cards for ideas finished while they could not
//       be saved (at boot and when Today opens)
//   U.review.queue({cap, light, extra}) -> Promise<[card]>   due today or overdue, most overdue first,
//       interleaved so one idea never shows twice in a row and topics alternate. The daily cap
//       counts cards already reviewed today, unless `extra` (a "keep going" batch).
//   U.review.dueCount() -> Promise<number>     what today's session holds right now
//   U.review.outlook() -> Promise<{size, done, cards, minutes, head, lead, next}>   dueCount, cards
//       reviewed today, cards in all, Today's time for today's session ("About 5 minutes", from each
//       card's type; 0 when nothing is waiting), and Today's words when nothing is waiting ("Done for
//       today", its lead, "Next up: 2 puzzles tomorrow." or '')
//   U.review.box() -> Promise<{size, courses: [{tid, n, ideas: [iid]}]}>   what is in the box: the
//       puzzles ready to flip through now (due today or before, never called "due"), and by course
//       (most first), for the Library's puzzle row, a course's puzzles and Today's By course
//   U.review.refreshBadge()                    re-reads what the box holds (the Today tab carries no
//       badge since the Library became the home, 18 Oct: nothing counts down; #today-badge, if a
//       page still has one, is filled)
//   U.review.ideaBands() -> Promise<{tid:{iid: band}}>
//   U.review.slipping() -> Promise<[{tid, iid, lapses, last}]>   ideas forgotten 2+ times in 30 days
//       (only Agains since the idea was last learned and since its latest round began)
//   Ideas read, not studied ("Just teach me": progress readRound is the idea's round) have no
//   cards, and any left from an earlier round are never counted anywhere (loadCards).
//
// Puzzles (phase 6, Dan 20 Oct): a ready-made steps lesson is a read lesson and makes no check
// cards, but finishing it by quizzing through it (not by "Just read it through") turns its guide's
// worked examples into cards of type 'puzzle' and a refresher lesson's Section B questions into
// cards of type 'written', in the same cards doc, scheduled by FSRS like the rest:
//   U.review.puzzlesFrom(tid, iid, guide, lesson, idea) -> {[cardId]: card without a schedule}   pure
//       iid_x<n>: the n-th example page with an answer it can be asked by (typed: a figure;
//       pick: the guide's own options, version 2 guides); iid_w_<qid>: each lesson.written question
//   U.review.addPuzzles(tid, iid, made, {round, at, due, guideV}) -> Promise<[cardId]>   writes them
//       (unchanged questions keep their schedule), then records puzzleRound (and puzzleV) on progress
//   U.review.puzzlesFor(tid, iid, {guide, lesson, idea, round}) -> Promise<n>   the lesson screen's
//       call when Dan finishes a steps lesson by quizzing through it
//   U.review.mendPuzzles() -> Promise<[{tid, iid}]>   the backfill: lessons quizzed through before
//       (or whose puzzles could not be saved) get theirs once, their first days spread out
//   A puzzle or written card is left out only while its lesson was read through and not quizzed
//   (V.readThrough); Learn it again and slipping never count them (ready-made lessons are never
//   rewritten in the page).
//
// Routes: '#/today' (tab), '#/review' and '#/review/more' (focus mode, one card per screen); either
// review with ?topic=<tid> takes that course's puzzles only, and closes back to where it was opened.
// Today is the puzzle box (Dan, 18 Oct: the Library home design): it counts the puzzles in the box
// and never says "due"; the cards are "puzzles" in every word Today and a review say.
//
// The box is hidden while U.flags.puzzleBox is off (00-core.js; Dan, 25 Oct): Today is then the way
// to today's study (the lesson he left open, else the Library) and reads no cards; #/review and its
// addresses go home quietly; refreshBadge reads nothing; puzzlesFor and mendPuzzles make and record
// nothing (so the backfill makes them once the switch is on again). Nothing saved is changed: the
// cards, their schedules and progress stay as they are. Lessons the app writes itself still save
// their check cards (addFromLesson, mendCards' own part); they are simply not shown.
// Cards live one doc per topic at data/users/{uid}/profile/cards/{tid} as {cards:{[id]: Card}}.
// Card fields beyond the contract: learnedAt (last time the lesson was completed; lapses before it
// no longer count towards "Learn it again") and retired (a card that cannot be used: its interactive
// is gone, or it was skipped as unusable in review).
//
// Writes never replace the whole cards doc: finishing a lesson patches only the cards it changes,
// and saving a review re-reads that one card inside the write and merges its history, so a review
// saved on another device in the meantime is kept. Cards with no type or question, and cards whose
// topic no longer exists, never reach a session (their leftover docs are tidied away).
(function () {
  var h = U.h;
  var DEFAULT_CAP = 15, LIGHT_CAP = 5, MORE = 5;
  var LAPSE_DAYS = 30, LAPSE_LIMIT = 2, HIST_MAX = 40;
  var SECONDS = { choice: 25, order: 40, estimate: 30, target: 60, recall: 90, puzzle: 40, written: 120 };
  var TYPES = { choice: 1, order: 1, estimate: 1, target: 1 };
  // Cards made from a ready-made lesson's guide and its written questions, never from its checks.
  var GUIDED = { puzzle: 1, written: 1 };
  function guided(c) { return !!c && GUIDED[c.type] === 1; }
  // The puzzle box is shown (U.flags.puzzleBox, 00-core.js), read each time it matters.
  function boxOn() { return !!(U.flags && U.flags.puzzleBox); }

  // ---------- data ----------
  function flatten(all) {
    var list = [];
    Object.keys(all || {}).forEach(function (tid) {
      var cards = (all[tid] && all[tid].cards) || {};
      Object.keys(cards).forEach(function (id) {
        var c = cards[id];
        // A partial card (no type or question) is a leftover, never something to show.
        if (!c || typeof c !== 'object' || !c.type || !c.spec || typeof c.spec !== 'object') return;
        c.id = c.id || id;
        c.tid = c.tid || tid;
        list.push(c);
      });
    });
    return list;
  }
  // An idea whose latest round was a read lesson ("Just teach me": progress readRound, written when
  // it is finished, 50-lesson.js). Its round makes no cards, and any its earlier rounds left are
  // never counted: not in Today, a review, the badge, the Map's bands or Learn it again.
  function readIdea(idea) {
    return !!idea && typeof idea === 'object' && idea.readRound != null && Number(idea.readRound) === (Number(idea.round) || 0);
  }
  // A ready-made steps lesson finished this round by its read-through only (readThrough is the
  // round, quizRound is not; V.readThrough in 70-learn.js). Quizzed through, or finished before
  // there were two ways (neither field), it keeps its puzzles: a steps lesson is a read lesson
  // either way, so its puzzle and written cards go by this, not by readIdea.
  function readThroughOnly(idea) {
    if (!readIdea(idea) || idea.stage !== 'done') return false;
    var r = Number(idea.round) || 0;
    return idea.readThrough != null && Number(idea.readThrough) === r && !(idea.quizRound != null && Number(idea.quizRound) === r);
  }
  function quizzed(idea) { return !!idea && typeof idea === 'object' && idea.stage === 'done' && !readThroughOnly(idea); }
  // Every usable card; the cards of topics deleted (here or on another device) are dropped and
  // their leftover docs removed; the cards of ideas he chose only to read are left out (puzzles:
  // of lessons only read through).
  function loadCards() {
    return Promise.all([U.store.cards.all(), U.store.progress.all().catch(function () { return {}; })]).then(function (r) {
      var all = r[0], prog = r[1] || {};
      var tids = Object.keys(all);
      if (!tids.length) return [];
      function usable(list) {
        return list.filter(function (c) {
          var p = prog[c.tid], ideas = p && p.ideas, idea = ideas && ideas[c.iid];
          return guided(c) ? !(idea && readThroughOnly(idea)) : !(idea && readIdea(idea));
        });
      }
      return U.store.topicsExist(tids).then(function (ok) {
        var keep = {};
        tids.forEach(function (tid) {
          if (ok[tid] !== false) keep[tid] = all[tid];
          else U.store.cards.dropOrphan(tid).catch(function (e) { console.warn('tidy', e); });
        });
        return usable(flatten(keep));
      }, function () { return usable(flatten(all)); });
    });
  }
  // Every day in review is a study day (U.studyDay, turning over at 4 am): due dates, the cap,
  // light days, the week strip and slipping all agree on when one day ends.
  function dayOf(iso) { return iso ? U.studyDay(iso) : null; }
  function isDue(c, day) { return !c.retired && !!(c.s && c.s.due) && c.s.due <= day; }
  function hist(c) { return Array.isArray(c.hist) ? c.hist : U.list(c.hist); }
  // The ideas Dan reviewed on this day, the most recently reviewed first: [{tid, iid}].
  function reviewedToday(cards, day) {
    var last = {};
    cards.forEach(function (c) {
      hist(c).forEach(function (e) {
        if (dayOf(e.at) !== day) return;
        var k = c.tid + '/' + c.iid;
        if (!last[k] || String(e.at) > last[k].at) last[k] = { tid: c.tid, iid: c.iid, at: String(e.at) };
      });
    });
    return Object.keys(last).map(function (k) { return last[k]; }).sort(function (a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : 0; });
  }
  function reviewedOn(cards, day) {
    var n = 0;
    cards.forEach(function (c) { hist(c).forEach(function (e) { if (dayOf(e.at) === day) n++; }); });
    return n;
  }
  function capOf(prefs, opts) {
    var cap = opts.cap > 0 ? opts.cap : prefs.cap > 0 ? prefs.cap : DEFAULT_CAP;
    var light = opts.light != null ? !!opts.light : lightToday(prefs);
    return light ? Math.min(cap, LIGHT_CAP) : cap;
  }
  // 'Light days' in settings is a lasting mode; the switch on Today sets a light day for today only.
  function lightToday(prefs) { return !!prefs.light || prefs.lightDay === U.studyDay(); }
  function ideaKey(c) { return c.tid + '/' + c.iid; }

  // Most overdue first; then the most faded; then a stable shuffle.
  function byPriority(day) {
    return function (a, b) {
      return (U.daysBetween(b.s.due, day) - U.daysBetween(a.s.due, day)) ||
        (U.fsrs.retrievability(a.s, day) - U.fsrs.retrievability(b.s, day)) ||
        (U.hash(a.id + a.tid) - U.hash(b.id + b.tid));
    };
  }

  // Order a session so the same idea never comes twice in a row (when that is possible at all) and
  // topics alternate, while keeping the most overdue cards early.
  function interleave(list) {
    var rest = list.slice(), out = [];
    function arrangeable(i) {
      var k = ideaKey(rest[i]), counts = {}, n = rest.length - 1;
      rest.forEach(function (c, j) { if (j !== i) counts[ideaKey(c)] = (counts[ideaKey(c)] || 0) + 1; });
      return Object.keys(counts).every(function (g) { return counts[g] <= (g === k ? Math.floor(n / 2) : Math.ceil(n / 2)); });
    }
    function find(test) { for (var i = 0; i < rest.length; i++) if (test(i)) return i; return -1; }
    while (rest.length) {
      var prev = out[out.length - 1];
      var fresh = function (i) { return !prev || ideaKey(rest[i]) !== ideaKey(prev); };
      var otherTopic = function (i) { return !prev || rest[i].tid !== prev.tid; };
      var pick = find(function (i) { return fresh(i) && otherTopic(i) && arrangeable(i); });
      if (pick < 0) pick = find(function (i) { return fresh(i) && arrangeable(i); });
      if (pick < 0) pick = find(fresh);
      if (pick < 0) pick = 0;
      out.push(rest.splice(pick, 1)[0]);
    }
    return out;
  }

  // One plan({}) shared for about 2 s: the badge, Learn and Today ask at the same moment at boot.
  var shared = null;
  function planShared() {
    if (shared && Date.now() - shared.at < 2000) return shared.p;
    var p = plan({});
    var mine = shared = { p: p, at: Date.now() };
    p.catch(function () { if (shared === mine) shared = null; });
    return p;
  }
  function changed() { shared = null; }

  // Answers still on their way to the db, by 'tid/cardId': a recall answer waits up to 30 s for
  // Claude's grade before it is saved, and Dan may close the review meanwhile. Until one lands,
  // plans leave its card out and count it as reviewed today, so Today, the badge and a new session
  // never offer a card he has just answered.
  // A read of the cards can also miss an answer that lands while the read is on its way (on a slow
  // connection Today's read begins as the session closes, the grade lands, and the read answers
  // with the card still due). So every save that lands gets the next number (savedAt), every read
  // notes the number when it begins (its data.mark), and a card saved after its read began is
  // treated as still on its way. A save that failed wrote nothing, so no read can have missed it.
  var saving = {}, savedAt = {}, saves = 0;
  function holding(card, job) {
    var k = card.tid + '/' + card.id;
    saving[k] = (saving[k] || 0) + 1;
    function landed(ok) { if (--saving[k] <= 0) delete saving[k]; if (ok) savedAt[k] = ++saves; changed(); }
    return job.then(function (v) { landed(true); return v; }, function (e) { landed(false); throw e; });
  }
  // Whether a read of the cards that began at `mark` may not show this card's latest answer.
  function onItsWay(c, mark) { var k = c.tid + '/' + c.id; return !!saving[k] || savedAt[k] > mark; }

  // Everything Today and a session need, from one read of the cards and the profile.
  function plan(opts, data) {
    opts = opts || {};
    var mark = saves;
    var load = data ? Promise.resolve(data) : Promise.all([loadCards(), U.store.profile.get()]).then(function (r) { return { cards: r[0], profile: r[1] || {}, mark: mark }; });
    return load.then(function (d) {
      var day = U.studyDay(), prefs = d.profile.prefs || {}, held = 0, since = d.mark != null ? d.mark : mark;
      var due = d.cards.filter(function (c) {
        if (!onItsWay(c, since)) return isDue(c, day);
        // Counted once: by the answer on its way, or (if it has just landed) by its history entry.
        if (!hist(c).some(function (e) { return dayOf(e.at) === day; })) held++;
        return false;
      }).sort(byPriority(day));
      if (opts.topic) due = due.filter(function (c) { return c.tid === opts.topic; });
      var cap = capOf(prefs, opts), done = reviewedOn(d.cards, day) + held;
      var size = Math.min(due.length, opts.extra ? cap : Math.max(0, cap - done));
      return { data: d, day: day, prefs: prefs, due: due, cap: cap, done: done, size: size, queue: interleave(due.slice(0, size)) };
    });
  }

  // The Agains (their times) on each idea's cards in the last 30 days, since its lesson was last
  // finished; only ideas with enough of them to be slipping. Puzzles never count: their lessons are
  // ready-made, never rewritten in the page, so there is no Learn it again to offer.
  function slippingIn(cards, day) {
    var since = U.addDays(day, -LAPSE_DAYS), groups = {};
    cards.forEach(function (c) {
      if (c.retired || guided(c)) return;
      hist(c).forEach(function (e) {
        if (e.grade !== 1 || !e.at || dayOf(e.at) <= since) return;
        if (c.learnedAt && e.at < c.learnedAt) return;
        var k = ideaKey(c);
        (groups[k] = groups[k] || { tid: c.tid, iid: c.iid, ats: [] }).ats.push(e.at);
      });
    });
    return Object.keys(groups).map(function (k) { return groups[k]; }).filter(function (g) { return g.ats.length >= LAPSE_LIMIT; });
  }
  // The slipping ideas still worth offering, as {tid, iid, lapses, last}. Only Agains since the
  // idea's latest round began (againAt) count: until Dan finishes a Learn it again, the old round's
  // cards stay in review with their old learnedAt, and the lapses that started the round (plus one
  // more) must not flag it again and throw the half-done round away. The rest are flagged on
  // progress (relearn: true) so the lesson screen rebuilds them with a different interactive.
  function slippingNow(cards, day) {
    var list = slippingIn(cards, day);
    if (!list.length) return Promise.resolve([]);
    var tids = uniq(list.map(function (g) { return g.tid; })), prog = {};
    return Promise.all(tids.map(function (tid) {
      return U.store.progress.get(tid).then(function (p) { prog[tid] = p; }, function () { prog[tid] = null; });
    })).then(function () {
      var out = list.map(function (g) {
        var idea = prog[g.tid] && prog[g.tid].ideas && prog[g.tid].ideas[g.iid], from = idea && idea.againAt;
        var ats = g.ats.filter(function (at) { return !from || at > from; }).sort();
        return { tid: g.tid, iid: g.iid, lapses: ats.length, last: ats[ats.length - 1] || '' };
      }).filter(function (g) { return g.lapses >= LAPSE_LIMIT; });
      out.forEach(function (g) {
        var idea = prog[g.tid] && prog[g.tid].ideas && prog[g.tid].ideas[g.iid];
        if (idea && idea.relearn) return;
        var patch = { ideas: {} };
        patch.ideas[g.iid] = { relearn: true };
        U.store.progress.patch(g.tid, patch).catch(function (e) { console.error('relearn flag failed', e); });
      });
      return out;
    });
  }

  // Record one answer: the card is re-read inside the write, so a review saved on another device
  // since this session loaded is kept (its history entry and its effect on the schedule).
  function mergeHist(a, b) {
    var seen = {}, out = [];
    a.concat(b).forEach(function (e) {
      if (!e || typeof e !== 'object') return;
      var k = e.at + '|' + e.grade;
      if (seen[k]) return;
      seen[k] = true;
      out.push(e);
    });
    out.sort(function (x, y) { return String(x.at) < String(y.at) ? -1 : String(x.at) > String(y.at) ? 1 : 0; });
    return out.slice(-HIST_MAX);
  }
  function save(card, grade, ok) {
    var day = U.studyDay(), entry = { at: U.now(), grade: grade, ok: !!ok };
    changed();
    return U.store.cards.update(card.tid, card.id, function (fresh) {
      var before = hist(fresh);
      if (before.some(function (e) { return e && e.at === entry.at; })) return null;   // already saved (a resend)
      return { s: U.fsrs.review(fresh.s || U.fsrs.init(day), grade, day, card.id), hist: mergeHist(before, [entry]) };
    }).then(function (fields) { if (fields) { card.s = fields.s; card.hist = fields.hist; } return fields; });
  }
  function retire(card) {
    changed();
    return U.store.cards.update(card.tid, card.id, function () { return { retired: true }; }).then(changed, function () {});
  }
  // Put a card off to the next study day without grading it (no history entry, its memory state
  // as it was): it cannot be shown today. A card already due later than that is left alone.
  function postpone(card) {
    var next = U.addDays(U.studyDay(), 1);
    changed();
    return U.store.cards.update(card.tid, card.id, function (fresh) {
      return fresh.s && fresh.s.due && fresh.s.due < next ? { s: Object.assign({}, fresh.s, { due: next }) } : null;
    }).then(changed, function () {});
  }
  // A lesson being written at this moment: its job refreshes the doc every 45 s, and 31-generate.js
  // treats one silent for 4 minutes as abandoned (CFG.STALE_MS).
  var WRITING_MS = 4 * 60 * 1000;
  function writingNow(doc) {
    var t = Date.parse(doc.updatedAt || '');
    return doc.status === 'writing' && isFinite(t) && Date.now() - t < WRITING_MS;
  }

  // A puzzle's or written card's question without what may change around it (his latest words,
  // where its page sits in the guide, its name), keys in order.
  var LOOSE = { mine: 1, page: 1, name: 1, title: 1 };
  function core(sp) { var o = {}; Object.keys(sp).sort().forEach(function (k) { if (!LOOSE[k]) o[k] = sp[k]; }); return JSON.stringify(o); }
  function sameQuestion(a, b, type) {
    if (!a || !b) return false;
    if (type === 'recall') return a.prompt === b.prompt && a.model === b.model;
    if (GUIDED[type]) return core(a) === core(b);
    return JSON.stringify(a) === JSON.stringify(b);
  }
  // The patch that gives this idea `made` as its cards of one kind (own(card): check cards or
  // guided ones): unchanged questions keep their schedule (Dan's latest words refreshed), changed
  // ones start afresh, ones no longer made are removed. due[id]: a later first day for a new card.
  function ideaPatch(cards, iid, made, own, now, day, due) {
    var patch = { cards: {} };
    Object.keys(cards).forEach(function (id) { var c = cards[id]; if (c && c.iid === iid && own(c) && !made[id]) patch.cards[id] = null; });
    Object.keys(made).forEach(function (id) {
      var m = made[id], old = cards[id];
      if (old && old.s && old.type === m.type && sameQuestion(old.spec, m.spec, m.type)) {
        var keep = { spec: U.store.replacing(old.spec, m.spec), learnedAt: now };
        if (old.retired != null) keep.retired = null;
        patch.cards[id] = keep;
      } else {
        m.createdAt = now;
        m.learnedAt = now;
        m.s = U.fsrs.init(day, due && due[id]);
        m.hist = [];
        patch.cards[id] = old && typeof old === 'object' ? U.store.replacing(old, m) : m;
      }
    });
    return patch;
  }

  // opts.round: the round Dan finished; once the cards are saved it is recorded on the idea's
  // progress (cardsRound), so mendCards can tell an idea whose cards were never made.
  // opts.at: when he finished it (mendCards making them later), else now.
  var making = {};   // 'tid/iid' -> true while this page is making that idea's cards
  function addFromLesson(tid, iid, lesson, outcome, opts) {
    lesson = lesson || {};
    outcome = outcome || {};
    opts = opts || {};
    var now = opts.at || U.now(), day = U.studyDay(), made = {}, mk = tid + '/' + iid;
    making[mk] = (making[mk] || 0) + 1;
    function done() { if (!--making[mk]) delete making[mk]; }
    (lesson.checks || []).forEach(function (ch) {
      if (!ch || !ch.id || !TYPES[ch.type]) return;
      if (!outcome.checks || !outcome.checks[ch.id]) return;     // only what Dan actually answered
      var id = iid + '_' + ch.id;
      made[id] = { id: id, tid: tid, iid: iid, type: ch.type, spec: U.clone(ch) };
    });
    var say = outcome.say, sp = lesson.say;
    if (say && say.text && sp && sp.prompt) {
      made[iid + '_say'] = {
        id: iid + '_say', tid: tid, iid: iid, type: 'recall',
        spec: { prompt: sp.prompt, rubric: sp.rubric || [], model: sp.model || '', mine: String(say.text) },
      };
    }
    // Only this idea's cards change: unchanged questions keep their schedule (Dan's latest words
    // refreshed), changed ones start afresh, ones the lesson no longer has are removed. A re-learned
    // lesson reuses check ids (c1, c2...), so a card is kept only when its question is the same.
    // (A ready-made lesson's puzzles are not this idea's check cards: they are left as they are.)
    return U.store.cards.get(tid).then(function (doc) {
      var cards = (doc && doc.cards) || {};
      var patch = ideaPatch(cards, iid, made, function (c) { return !guided(c); }, now, day, null);
      changed();
      return Object.keys(patch.cards).length ? U.store.cards.patch(tid, patch) : null;
    }).then(function () {
      done();
      U.review.refreshBadge();
      if (typeof opts.round !== 'number') return Object.keys(made);
      // Made for this round. A failure here is harmless: mendCards finds the cards and records it.
      var mark = { ideas: {} };
      mark.ideas[iid] = { cardsRound: opts.round };
      return U.store.progress.patch(tid, mark).catch(function () {}).then(function () { return Object.keys(made); });
    }, function (e) {
      done();
      // The cards could not be read (or written) just now: the whole step runs again once the
      // db answers (it is safe to repeat: only this idea's cards are patched). If the page closes
      // first, mendCards makes them the next time the app opens.
      if (e && e.queued) throw e;
      throw U.store.retryLater(e, function () { return addFromLesson(tid, iid, lesson, outcome, opts); });
    });
  }

  // ---------- puzzles: a ready-made steps lesson's worked examples ----------
  // A guide's example page (tools/course/guide.mjs) becomes a puzzle when it can be asked here:
  // version 2 guides say how each was answered in the lesson (`input`: 'typed' into a K.answer
  // field, or 'pick' from `options`, the lesson's own buttons). A figure ("28.87 A") is typed,
  // a stronger test than spotting it, unless the task names the options ("Which of these…");
  // anything else is picked from the lesson's options. Examples answered by dragging or colouring
  // (no input), and every example of an older guide, make none.
  function str(v) { return typeof v === 'string' ? v : v == null ? '' : String(v); }
  var NAMES_OPTIONS = /\b(these|the options|which one)\b/i;
  function puzzleSpec(p, at) {
    var task = str(p.task).trim(), answer = str(p.answer).trim();
    if (!task || !answer || !U.cards || typeof U.cards.figureOf !== 'function') return null;
    var options = Array.isArray(p.options) ? p.options.map(function (o) { return str(o).trim(); }).filter(Boolean) : [];
    var pick = p.input === 'pick' && options.length >= 2 && options.length <= 8 && options.indexOf(answer) >= 0;
    var fig = !!U.cards.figureOf(answer);
    var input = p.input === 'typed' && fig ? 'typed' : pick && fig && !NAMES_OPTIONS.test(task) ? 'typed' : pick ? 'pick' : null;
    if (!input) return null;
    var spec = { q: task, answer: answer, why: str(p.why).trim(), input: input, page: at };
    if (input === 'pick') spec.options = options;
    if (str(p.name)) spec.name = str(p.name).slice(0, 80);
    return spec;
  }
  // -> {[cardId]: {id, tid, iid, type, spec}} (no schedule yet). Pure.
  //   iid_x<n>   the n-th example page of the guide, when it can be asked (puzzleSpec)
  //   iid_w_<q>  each written question of a refresher lesson (lesson.written[q]: {q, points, need,
  //              model}), with Dan's latest words for it (idea.written) as `mine`
  function puzzlesFrom(tid, iid, guide, lesson, idea) {
    var made = {}, pages = guide && Array.isArray(guide.pages) ? guide.pages : [], n = 0;
    pages.forEach(function (p, at) {
      if (!p || typeof p !== 'object' || p.kind !== 'example') return;
      n++;
      var spec = puzzleSpec(p, at), id = iid + '_x' + n;
      if (spec) made[id] = { id: id, tid: tid, iid: iid, type: 'puzzle', spec: spec };
    });
    var written = lesson && lesson.written && typeof lesson.written === 'object' ? lesson.written : {};
    Object.keys(written).forEach(function (qid) {
      var w = written[qid];
      if (!w || typeof w !== 'object' || !str(w.q).trim() || !U.validId(qid)) return;
      var points = (Array.isArray(w.points) ? w.points : []).filter(function (p) { return p && str(p.text).trim(); })
        .map(function (p) { return { text: str(p.text).trim(), cite: str(p.cite).trim() }; });
      if (!points.length) return;
      var spec = { qid: qid, q: str(w.q).trim(), points: points, model: str(w.model).trim() };
      if (Number.isInteger(w.need) && w.need > 0) spec.need = w.need;
      if (str(lesson.title)) spec.title = str(lesson.title);
      var tries = U.list(idea && idea.written && idea.written[qid]).filter(function (t) { return t && str(t.text).trim(); });
      if (tries.length) spec.mine = str(tries[tries.length - 1].text).slice(0, 3000);
      var id = iid + '_w_' + qid;
      made[id] = { id: id, tid: tid, iid: iid, type: 'written', spec: spec };
    });
    return made;
  }
  // The cards doc stays under the db's limit (256 KiB): new cards that would take it past this are
  // left out (and said in the console); a course's puzzles come to about 110 KB.
  var CARDS_LIMIT = 230 * 1024;
  function fit(cards, patch) {
    var after = Object.assign({}, cards);
    Object.keys(patch.cards).forEach(function (id) { var v = patch.cards[id]; if (v === null) delete after[id]; else after[id] = cards[id] ? Object.assign({}, cards[id], v) : v; });
    var size = JSON.stringify({ cards: after }).length;
    var fresh = Object.keys(patch.cards).filter(function (id) { return patch.cards[id] && !cards[id]; });
    while (size > CARDS_LIMIT && fresh.length) {
      var id = fresh.pop();
      size -= JSON.stringify(patch.cards[id]).length + id.length + 4;
      delete patch.cards[id];
      console.warn('puzzle left out: the cards doc is full', id);
    }
    return patch;
  }
  // opts.round: the round he quizzed through, recorded as puzzleRound once saved (with puzzleV, the
  // guide version they came from), so mendPuzzles can tell a lesson whose puzzles were never made.
  // opts.only 'written': an older guide, whose examples cannot be asked yet: only the written
  // questions are written, and nothing is recorded (the guide's next version makes the rest).
  // opts.due {[cardId]: day}: later first days (the backfill's spread). opts.at: when he finished.
  function addPuzzles(tid, iid, made, opts) {
    opts = opts || {};
    var now = opts.at || U.now(), day = U.studyDay(), mk = tid + '/' + iid;
    making[mk] = (making[mk] || 0) + 1;
    function done() { if (!--making[mk]) delete making[mk]; }
    var own = opts.only ? function (c) { return c.type === opts.only; } : guided;
    return U.store.cards.get(tid).then(function (doc) {
      var cards = (doc && doc.cards) || {};
      var patch = fit(cards, ideaPatch(cards, iid, made, own, now, day, opts.due));
      changed();
      return Object.keys(patch.cards).length ? U.store.cards.patch(tid, patch) : null;
    }).then(function () {
      done();
      U.review.refreshBadge();
      if (typeof opts.round !== 'number') return Object.keys(made);
      var mark = { ideas: {} };
      mark.ideas[iid] = { puzzleRound: opts.round };
      if (opts.guideV) mark.ideas[iid].puzzleV = opts.guideV;
      return U.store.progress.patch(tid, mark).catch(function () {}).then(function () { return Object.keys(made); });
    }, function (e) {
      done();
      if (e && e.queued) throw e;
      throw U.store.retryLater(e, function () { return addPuzzles(tid, iid, made, opts); });
    });
  }
  // The lesson screen, when Dan finishes a steps lesson by quizzing through it: its puzzles, first
  // in the box the next study day. -> Promise<number of cards>
  // With the box hidden: none, and nothing recorded (no puzzleRound), so the backfill makes them
  // once it is on again.
  function puzzlesFor(tid, iid, o) {
    if (!boxOn()) return Promise.resolve(0);
    o = o || {};
    var v = o.guide && Number(o.guide.v) || 1, made = puzzlesFrom(tid, iid, o.guide, o.lesson, o.idea);
    if (v < 2 && !Object.keys(made).length) return Promise.resolve(0);
    return addPuzzles(tid, iid, made, v >= 2 ? { round: Number(o.round) || 0, guideV: v } : { only: 'written' })
      .then(function (ids) { return ids.length; });
  }

  // ---------- the backfill: puzzles for lessons quizzed through before ----------
  // At boot and when Today opens (with mendCards): every lesson of a ready-made course whose guides
  // can be asked (topic.guideV >= 2, stamped by tools/course/assemble.mjs) that Dan finished by
  // quizzing through it, in a round with no puzzles made (puzzleRound) or from an older guide
  // (puzzleV), gets them now, once. The guides are read one at a time, oldest finished lesson
  // first. So that a long list does not land in the box at once, the new cards' first days are
  // spread: round the lessons, a puzzle from each in turn, at most half the daily limit of new
  // cards a day (counting new cards already waiting), from tomorrow.
  var puzzling = null, puzzledAt = 0;
  function newPerDay(prefs) {
    var cap = prefs && prefs.cap > 0 ? prefs.cap : DEFAULT_CAP;
    if (prefs && prefs.light) cap = Math.min(cap, LIGHT_CAP);
    return Math.max(3, Math.round(cap / 2));
  }
  // -> {tid: {cardId: day}} for the cards new to the box (a question already there keeps its day).
  function spread(list, all, day, perDay) {
    var count = {}, due = {}, d = U.addDays(day, 1);
    Object.keys(all || {}).forEach(function (tid) {
      var cs = (all[tid] && all[tid].cards) || {};
      Object.keys(cs).forEach(function (id) {
        var c = cs[id];
        if (c && c.s && c.s.due && !c.retired && !(Number(c.s.reps) > 0) && c.s.due >= d) count[c.s.due] = (count[c.s.due] || 0) + 1;
      });
    });
    var lists = list.map(function (t) {
      var cs = (all[t.tid] && all[t.tid].cards) || {};
      return Object.keys(t.made).filter(function (id) {
        var old = cs[id], m = t.made[id];
        return !(old && old.s && old.type === m.type && sameQuestion(old.spec, m.spec, m.type));
      });
    });
    for (var r = 0, more = true; more; r++) {
      more = false;
      lists.forEach(function (ids, k) {
        if (r >= ids.length) return;
        more = true;
        while ((count[d] || 0) >= perDay) d = U.addDays(d, 1);
        var tid = list[k].tid;
        (due[tid] = due[tid] || {})[ids[r]] = d;
        count[d] = (count[d] || 0) + 1;
      });
    }
    return due;
  }
  // -> Promise<[{tid, iid}]> the lessons given puzzles now. Never rejects; at most once a minute
  // after a clean run (force: run anyway), never twice at once. With the box hidden: nothing read,
  // made or recorded (a run then would stamp puzzleRound with puzzles nobody sees).
  function mendPuzzles(force) {
    if (!boxOn()) return Promise.resolve([]);
    if (puzzling) return puzzling;
    if (!force && Date.now() - puzzledAt < MEND_EVERY) return Promise.resolve([]);
    if (!U.store.guide || typeof U.store.guide.get !== 'function') return Promise.resolve([]);
    var out = [], ok = true;
    puzzling = Promise.all([U.store.progress.all(), U.store.topics.list(), U.store.profile.get().catch(function () { return null; })]).then(function (r) {
      var prog = r[0] || {}, topics = {}, prefs = (r[2] && r[2].prefs) || {}, todo = [];
      (r[1] || []).forEach(function (t) { if (t) topics[t.__id || t.id] = t; });
      Object.keys(prog).forEach(function (tid) {
        var t = topics[tid], gv = t && Number(t.guideV) || 0;
        if (!t || !t.readyMade || gv < 2) return;
        var ideas = (prog[tid] && prog[tid].ideas) || {};
        Object.keys(ideas).forEach(function (iid) {
          var idea = ideas[iid], round = Number(idea && idea.round) || 0;
          if (!quizzed(idea) || making[tid + '/' + iid]) return;
          if (idea.puzzleRound != null && Number(idea.puzzleRound) >= round && (Number(idea.puzzleV) || 1) >= gv) return;
          todo.push({ tid: tid, iid: iid, idea: idea, round: round, gv: gv, at: str(idea.doneAt) });
        });
      });
      if (!todo.length) return null;
      todo.sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : 0; });
      return todo.reduce(function (chain, t) {
        return chain.then(function () {
          return U.store.guide.get(t.tid, t.iid).then(function (g) {
            // No guide yet (a course still being published): leave the lesson unstamped, so its
            // puzzles are made once the guide arrives rather than recorded as made with none.
            if (!g || !Array.isArray(g.pages)) { t.skip = true; return; }
            // A refresher lesson (its guide opens on the Keep this card) has written questions:
            // the lesson doc holds them. Other lessons need only the guide.
            var refresher = !!(g && Array.isArray(g.pages) && g.pages.some(function (p) { return p && (p.kind === 'summary' || p.written); }));
            return (refresher ? U.store.lesson.get(t.tid, t.iid).then(function (d) { return (d && d.lesson) || null; }) : Promise.resolve(null)).then(function (lesson) {
              t.made = puzzlesFrom(t.tid, t.iid, g, lesson, t.idea);
            });
          }).catch(function (e) { ok = false; t.skip = true; console.warn('puzzles', t.tid, t.iid, e); });
        });
      }, Promise.resolve()).then(function () {
        var ready = todo.filter(function (t) { return !t.skip; });
        if (!ready.length) return null;
        return U.store.cards.all().then(function (all) {
          var due = spread(ready, all, U.studyDay(), newPerDay(prefs));
          return ready.reduce(function (chain, t) {
            return chain.then(function () {
              if (making[t.tid + '/' + t.iid]) return null;
              return addPuzzles(t.tid, t.iid, t.made, { round: t.round, guideV: t.gv, at: t.at || null, due: due[t.tid] || {} })
                .then(function () { out.push({ tid: t.tid, iid: t.iid }); });
            }).catch(function (e) { ok = false; console.warn('puzzles', t.tid, t.iid, e); });
          }, Promise.resolve());
        });
      });
    }).then(function () { if (ok) puzzledAt = Date.now(); return out; }, function (e) {
      console.warn('mend puzzles', e);
      return out;
    }).then(function (x) { puzzling = null; if (x.length) U.review.refreshBadge(); return x; });
    return puzzling;
  }

  // ---------- cards that were never made ----------
  // Finishing an idea saves its progress ('done'), then its review cards. If the cards could not
  // be saved and the app closed before they were, the idea would never come back in review. So
  // each idea's progress records the round its cards were made for (cardsRound), and at boot and
  // when Today opens, an idea done in a round with no cards made gets them now: from the lesson as
  // stored and Dan's answers as stored, as finishing it would have made them. It is safe to run
  // again and again: cards made for that round already (learned at or after he finished) are only
  // recorded; otherwise addFromLesson keeps the schedule of every card whose question is the same.
  var mending = null, mendedAt = 0, MEND_EVERY = 60000;
  function outcomeOf(idea, doc) {
    var lesson = doc.lesson || {}, hasIt = !!(doc.interactive && doc.interactive.html), res = idea.checks || {}, checks = {};
    (lesson.checks || []).forEach(function (c) {
      if (!c || !c.id || (c.type === 'target' && !hasIt)) return;   // as the lesson screen offers them
      var r = res[c.id];
      if (r && typeof r === 'object' && !r.skipped) checks[c.id] = { correct: !!r.correct };
    });
    var round = Number(idea.round) || 0;
    var says = U.list(idea.say).filter(function (a) { return (Number(a.round) || 0) === round; }), last = says[says.length - 1];
    return { checks: checks, say: last && last.text ? { text: last.text, verdict: last.verdict || null } : null };
  }
  function mendOne(t, cards) {
    var since = String(t.idea.doneAt || ''), mark = { ideas: {} };
    mark.ideas[t.iid] = { cardsRound: t.round };
    var made = Object.keys(cards).some(function (id) {
      var c = cards[id];
      return c && typeof c === 'object' && c.iid === t.iid && c.type && String(c.learnedAt || c.createdAt || '') >= since;
    });
    if (made) return U.store.progress.patch(t.tid, mark).then(function () { return null; });
    return U.store.lesson.get(t.tid, t.iid).then(function (doc) {
      // Nothing to make them from yet (the lesson is being written again): the next run will.
      if (!doc || !doc.lesson || (doc.status !== 'ready' && doc.status !== 'building')) return null;
      // Rewritten since he finished: these are not the questions he answered.
      if (doc.startedAt && since && String(doc.startedAt) > since) return null;
      if (making[t.tid + '/' + t.iid]) return null;
      return addFromLesson(t.tid, t.iid, doc.lesson, outcomeOf(t.idea, doc), { round: t.round, at: since || null })
        .then(function () { return { tid: t.tid, iid: t.iid }; });
    });
  }
  // -> Promise<[{tid, iid}]> the ideas whose cards were made now. Never rejects. Runs at most
  // once a minute after one that went through (force: run anyway), and never twice at once.
  // The check cards of studied ideas, then the puzzles of quizzed ready-made lessons (mendPuzzles).
  function mendCards(force) {
    return mendChecks(force).then(function (a) { return mendPuzzles(force).then(function (b) { return a.concat(b); }); });
  }
  function mendChecks(force) {
    if (mending) return mending;
    if (!force && Date.now() - mendedAt < MEND_EVERY) return Promise.resolve([]);
    var out = [], ok = true;
    mending = Promise.all([U.store.progress.all(), U.store.cards.all()]).then(function (r) {
      var todo = [];
      Object.keys(r[0]).forEach(function (tid) {
        var ideas = (r[0][tid] && r[0][tid].ideas) || {};
        Object.keys(ideas).forEach(function (iid) {
          var idea = ideas[iid], round = Number(idea && idea.round) || 0;
          if (!idea || typeof idea !== 'object' || idea.stage !== 'done' || making[tid + '/' + iid] || readIdea(idea)) return;
          if (idea.cardsRound != null && Number(idea.cardsRound) >= round) return;
          todo.push({ tid: tid, iid: iid, idea: idea, round: round });
        });
      });
      if (!todo.length) return null;
      return U.store.topicsExist(uniq(todo.map(function (t) { return t.tid; }))).then(function (exists) {
        // One idea at a time: a handful of small writes, not a burst at boot.
        return todo.filter(function (t) { return exists[t.tid] !== false; }).reduce(function (chain, t) {
          return chain.then(function () { return mendOne(t, (r[1][t.tid] && r[1][t.tid].cards) || {}); })
            .then(function (x) { if (x) out.push(x); }, function (e) { ok = false; console.warn('mend cards', t.tid, t.iid, e); });
        }, Promise.resolve());
      });
    }).then(function () { if (ok) mendedAt = Date.now(); return out; }, function (e) {
      console.warn('mend cards', e);
      return out;
    }).then(function (x) { mending = null; if (x.length) U.review.refreshBadge(); return x; });
    return mending;
  }

  function ideaBands() {
    var RANK = { new: 0, fragile: 1, growing: 2, strong: 3 }, NAMES = ['new', 'fragile', 'growing', 'strong'];
    return loadCards().then(function (cards) {
      var day = U.studyDay(), groups = {}, out = {};
      cards.forEach(function (c) {
        if (c.retired || !c.iid) return;
        var t = groups[c.tid] = groups[c.tid] || {};
        (t[c.iid] = t[c.iid] || []).push(RANK[U.fsrs.band(c.s, day)]);
      });
      Object.keys(groups).forEach(function (tid) {
        out[tid] = {};
        Object.keys(groups[tid]).forEach(function (iid) {
          // The middle reviewed card decides, so one slip does not paint a whole idea fragile.
          var ranks = groups[tid][iid].filter(function (r) { return r > 0; }).sort();
          out[tid][iid] = ranks.length ? NAMES[ranks[Math.floor((ranks.length - 1) / 2)]] : 'new';
        });
      });
      return out;
    });
  }

  // The puzzles in the box by course, the course with most first: [{tid, n, ideas: [iid]}].
  function boxOf(cards) {
    var by = {}, courses = [];
    cards.forEach(function (c) {
      if (!by[c.tid]) courses.push(by[c.tid] = { tid: c.tid, n: 0, ideas: [] });
      by[c.tid].n++;
      if (by[c.tid].ideas.indexOf(c.iid) < 0) by[c.tid].ideas.push(c.iid);
    });
    courses.sort(function (a, b) { return b.n - a.n; });
    return { size: cards.length, courses: courses };
  }
  // " from lessons 1 to 3", " from lesson 2", or '' (lessons by their place in the course).
  function fromLessons(topics, tid, iids) {
    var ideas = ((topics[tid] && topics[tid].ideas) || []).map(function (i) { return i.id; });
    var n = iids.map(function (iid) { return ideas.indexOf(iid) + 1; }).filter(function (k) { return k > 0; }).sort(function (a, b) { return a - b; });
    return !n.length ? '' : n[0] === n[n.length - 1] ? ' from lesson ' + n[0] : ' from lessons ' + n[0] + ' to ' + n[n.length - 1];
  }
  function andList(list) { return list.length <= 1 ? list.join('') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]; }
  function setBadge(n) {
    var b = document.getElementById('today-badge');
    if (!b) return n;
    b.textContent = n > 99 ? '99+' : String(n);
    b.hidden = !n;
    b.setAttribute('aria-label', n + (n === 1 ? ' card' : ' cards') + ' to review');
    return n;
  }
  U.review = {
    addFromLesson: addFromLesson,
    mendCards: mendCards,
    queue: function (opts) { return plan(opts).then(function (p) { return p.queue; }); },
    dueCount: function () { return planShared().then(function (p) { return p.size; }); },
    box: function () { return planShared().then(function (p) { return boxOf(p.due); }); },
    // From the same read as dueCount: Today's time for the session and, when nothing is waiting,
    // Today's words.
    outlook: function () {
      return planShared().then(function (p) { var w = clearWords(p); return { size: p.size, done: p.done, cards: p.data.cards.length, minutes: p.size ? minutesFor(p.queue) : 0, head: w.head, lead: w.lead, next: w.next }; });
    },
    // With the box hidden there is nothing to count: no cards are read.
    refreshBadge: function () {
      if (!boxOn()) return Promise.resolve(setBadge(0));
      changed();
      return U.review.dueCount().then(setBadge, function (e) { console.error('badge', e); return 0; });
    },
    setBadge: setBadge,
    ideaBands: ideaBands,
    slipping: function () { return loadCards().then(function (cards) { return slippingNow(cards, U.studyDay()); }); },
    _interleave: interleave,
    _plan: plan,
    _hold: holding,
    _clearWords: clearWords,
    _backCount: backCount,
    puzzlesFrom: puzzlesFrom,
    addPuzzles: addPuzzles,
    puzzlesFor: puzzlesFor,
    mendPuzzles: mendPuzzles,
    _spread: spread,
  };

  // ---------- shared view bits ----------
  function errorBox(lead, e) {
    return h('div', { class: 'notice bad', role: 'status' }, h('div', { class: 'stack-sm' },
      h('p', null, h('strong', null, lead), U.errText(e)),
      h('div', null, h('button', { class: 'btn small secondary', type: 'button', on: { click: function () { U._route(); } } }, 'Try again'))));
  }
  function minutesFor(cards) {
    var s = 0;
    cards.forEach(function (c) { s += SECONDS[c.type] || 30; });
    return Math.max(1, Math.round(s / 60));
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many || one + 's'); }
  // "4 puzzles, from 2 lessons:" above the list of lessons coming back (a review says puzzles).
  function backCount(cards, ideas) {
    if (ideas === 1) return cards === 1 ? 'One puzzle, from this lesson:' : plural(cards, 'puzzle') + ', all from this lesson:';
    return plural(cards, 'puzzle') + ', from ' + ideas + ' lessons:';
  }
  function longDate(day) {
    var p = day.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  }
  // "Next up: 2 cards tomorrow.", or ''. Cards the daily limit held back today are still due, so
  // they are waiting tomorrow (with any due then); otherwise the soonest day cards come back. The
  // count is what that day's review holds (its usual limit: a light day is for today only).
  function nextUp(p) {
    var held = Math.max(0, p.due.length - p.size);
    var upcoming = p.data.cards.filter(function (c) { return !c.retired && c.s && c.s.due > p.day; });
    var nextDay = held ? U.addDays(p.day, 1) : upcoming.reduce(function (m, c) { return !m || c.s.due < m ? c.s.due : m; }, null);
    var nextN = Math.min(held + upcoming.filter(function (c) { return c.s.due === nextDay; }).length, capOf(Object.assign({}, p.prefs, { lightDay: '' }), {}));
    return nextDay ? 'Next up: ' + plural(nextN, 'puzzle') + ' ' + whenDay(nextDay, p.day) + '.' : '';
  }
  // The words for a day with nothing waiting: one set, for Today and a review with nothing to show.
  function clearWords(p) {
    var w = p.done > 0 ? ['Done for today', 'You flipped through ' + plural(p.done, 'puzzle') + ' today. That is what keeps it all fresh.']
      : !p.data.cards.length ? ['Nothing in the box yet', 'Finish a lesson and its puzzles come here.']
      : ['Nothing in the box today', 'Everything you have learned is holding up for now.'];
    return { head: w[0], lead: w[1], next: nextUp(p) };
  }
  // Nothing waiting, on Today and in a review with nothing to show: those words, and any cards the
  // daily limit held back, offered without hurry. `first` is the main way on.
  function clearBox(p, first, topic) {
    var w = clearWords(p), more = p.due.length;
    var box = h('section', { class: 'td-clear' });
    if (p.done > 0) box.appendChild(h('div', { class: 'td-done-mark', 'aria-hidden': 'true' }, U.icon('tick')));
    box.appendChild(h('h1', { class: 'td-title' }, w.head));
    box.appendChild(h('p', { class: 'td-lead' }, w.lead));
    if (w.next) box.appendChild(h('p', { class: 'muted td-next' }, w.next));
    var actions = h('div', { class: 'td-actions' }, first);
    if (more > 0) actions.appendChild(h('a', { class: 'btn wide secondary', href: '#/review/more' + (topic ? '?topic=' + encodeURIComponent(topic) : '') }, 'Flip through ' + Math.min(MORE, more) + ' more'));
    box.appendChild(actions);
    if (more > 0) box.appendChild(h('p', { class: 'muted small td-more-note' }, plural(more, 'more puzzle is', 'more puzzles are') + ' in the box. There is no rush: they keep.'));
    return box;
  }
  function whenDay(day, today) {
    var n = U.daysBetween(today, day);
    if (n <= 0) return 'today';
    if (n === 1) return 'tomorrow';
    var p = day.split('-').map(Number), d = new Date(p[0], p[1] - 1, p[2]);
    if (n < 7) return 'on ' + d.toLocaleDateString(undefined, { weekday: 'long' });
    return 'on ' + d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
  }
  // Titles for these topics, from one read of the topics list.
  function topicsFor(tids) {
    var out = {};
    if (!tids.length) return Promise.resolve(out);
    return U.store.topics.list().then(function (list) {
      var by = {};
      list.forEach(function (t) { by[t.__id || t.id] = t; });
      tids.forEach(function (tid) { out[tid] = by[tid] || null; });
      return out;
    }, function () { tids.forEach(function (tid) { out[tid] = null; }); return out; });
  }
  // Dan's progress on these topics (null where a doc cannot be read), for Claude's notes on Today.
  function progressFor(tids) {
    var out = {};
    return Promise.all(tids.map(function (tid) {
      return U.store.progress.get(tid).then(function (d) { out[tid] = d; }, function () { out[tid] = null; });
    })).then(function () { return out; });
  }
  function ideaTitle(topics, tid, iid) {
    var t = topics[tid], ideas = (t && t.ideas) || [];
    for (var i = 0; i < ideas.length; i++) if (ideas[i].id === iid) return ideas[i].title;
    return 'An idea';
  }
  function topicTitle(topics, tid) { return (topics[tid] && topics[tid].title) || 'A topic'; }
  function uniq(list) { return list.filter(function (x, i) { return list.indexOf(x) === i; }); }

  function relearnBlock(list, topics) {
    // A ready-made course's lessons are never rewritten in the page (topic.readyMade), so it
    // offers no Learn it again.
    list = list.filter(function (g) { return !(topics[g.tid] && topics[g.tid].readyMade); });
    if (!list.length) return null;
    return h('section', { class: 'card-quiet td-relearn', 'aria-label': 'Ideas to learn again' },
      h('p', { class: 'eyebrow' }, 'Worth another look'),
      h('p', { class: 'td-relearn-lead' }, list.length === 1 ? 'This idea has slipped a couple of times lately. A fresh lesson with a new interactive often makes it click.' : 'These ideas have slipped a couple of times lately. A fresh lesson with a new interactive often makes them click.'),
      h('ul', { class: 'td-relearn-list' }, list.map(function (g) {
        return h('li', null, h('a', { class: 'td-relearn-link', href: '#/t/' + encodeURIComponent(g.tid) + '/' + encodeURIComponent(g.iid) + '/again' },
          h('span', { class: 'td-relearn-text' }, h('strong', null, ideaTitle(topics, g.tid, g.iid)), h('span', { class: 'muted small' }, topicTitle(topics, g.tid))),
          h('span', { class: 'td-relearn-go' }, 'Learn it again', U.icon('arrow'))));
      })));
  }

  // Monday-to-Sunday dots for days with any study (logged minutes or reviews). Facts only: no
  // streaks, no missed-day marks.
  function weekStrip(days, today, cards) {
    var mins = {};
    Object.keys(days || {}).forEach(function (d) { mins[d] = U.store.minutesOn(days[d]); });
    days = mins;
    (cards || []).forEach(function (c) {
      hist(c).forEach(function (e) { var d = dayOf(e.at); if (d && !(days[d] > 0)) days[d] = 0.5; });
    });
    var p = today.split('-').map(Number), dow = (new Date(p[0], p[1] - 1, p[2]).getDay() + 6) % 7;
    var start = U.addDays(today, -dow), studied = 0;
    var cells = [];
    for (var i = 0; i < 7; i++) {
      var d = U.addDays(start, i), mins = Number(days[d]) || 0, q = d.split('-').map(Number);
      var date = new Date(q[0], q[1] - 1, q[2]);
      var on = mins > 0 && d <= today;
      if (on) studied++;
      cells.push(h('li', {
        class: 'td-day' + (on ? ' on' : '') + (d === today ? ' today' : '') + (d > today ? ' future' : ''),
        'aria-label': date.toLocaleDateString(undefined, { weekday: 'long' }) + (on ? ', studied' + (mins >= 1 ? ' ' + plural(Math.round(mins), 'minute') : '') : ''),
      }, h('span', { class: 'td-day-name', 'aria-hidden': 'true' }, date.toLocaleDateString(undefined, { weekday: 'narrow' })),
        h('span', { class: 'td-day-dot', 'aria-hidden': 'true' }, on ? U.icon('tick') : null)));
    }
    return h('section', { class: 'td-week', 'aria-label': 'This week' },
      h('div', { class: 'td-week-head' }, h('h2', { class: 'eyebrow' }, 'This week'),
        h('p', { class: 'muted small' }, studied ? 'You studied on ' + plural(studied, 'day') + '.' : 'Days you study show up here.')),
      h('ol', { class: 'td-days' }, cells));
  }

  // ---------- #/today with the puzzle box hidden ----------
  // Today's study, one tap away: the lesson he left open (the Library's own row, 77-library.js),
  // else the way to the Library; then This week from his study minutes. No card is read or counted.
  // A read that fails leaves its part out (no left-open row, an empty week): never an error here.
  function studyToday(root, ctx) {
    var L = U.library, S = U.store;
    var shelves = L && S.shelves && typeof S.shelves.list === 'function' ? S.shelves.list() : Promise.resolve([]);
    Promise.all([
      S.topics.list().catch(function () { return []; }),
      S.progress.all().catch(function () { return {}; }),
      shelves.catch(function () { return []; }),
      S.profile.get().catch(function () { return null; }),
    ]).then(function (r) {
      if (!ctx.alive()) return;
      var day = U.studyDay(), best = L && typeof L.leftOpen === 'function' ? L.leftOpen(r[0] || [], r[1] || {}, r[2] || []) : null;
      U.clear(root);
      root.appendChild(h('p', { class: 'eyebrow td-date' }, longDate(day)));
      if (best) {
        root.appendChild(h('h1', { class: 'td-title' }, 'Pick up where you left off'));
        root.appendChild(h('section', { class: 'td-plan td-study', 'aria-label': 'Today\'s study' }, L.openRow(best)));
      } else {
        root.appendChild(h('h1', { class: 'td-title' }, 'Nothing left open'));
        root.appendChild(h('p', { class: 'td-lead' }, 'Start a course from your library whenever you feel like it.'));
        root.appendChild(h('section', { class: 'td-plan td-study', 'aria-label': 'Today\'s study' }, h('a', { class: 'btn wide', href: '#/' }, 'Browse your library')));
      }
      // Mixed problems from his finished lessons (54-problems.js), once a ready-made course has one.
      var V = U.views || {};
      var mixable = U.problems && (r[0] || []).some(function (t) {
        var p = (r[1] || {})[t.__id];
        return t && t.readyMade && (t.ideas || []).some(function (i) { return V.isDone ? V.isDone(p, i.id) : false; });
      });
      if (mixable) {
        root.appendChild(h('a', { class: 'today-row td-mix', href: U.problems.mixHref() },
          h('span', { class: 'today-ico', 'aria-hidden': 'true' }, U.icon('puzzle')),
          h('span', { class: 'today-text' }, h('strong', null, 'Mixed problems'), h('span', { class: 'muted small' }, 'From the lessons you have finished, to work on paper')),
          U.icon('arrow', 'today-go')));
      }
      root.appendChild(weekStrip((r[3] && r[3].days) || {}, day, []));
    });
  }

  // ---------- #/today ----------
  function todayView(params, ctx) {
    var root = h('div', { class: 'td' });
    ctx.view.appendChild(root);
    root.appendChild(h('div', { class: 'td-loading' }, h('div', { class: 'skeleton', style: { height: '28px', width: '60%' } }), h('div', { class: 'skeleton', style: { height: '180px' } })));
    // Cards an idea finished earlier never got (the app closed before they were saved). Made ones
    // first come due tomorrow, so today's list need not wait for this. (With the box hidden, only
    // the check cards of lessons the app wrote: mendPuzzles makes nothing.)
    mendCards();
    if (!boxOn()) { studyToday(root, ctx); return; }

    // Claude's notes come after the session (Dan, 10 Oct: before it they would be hints for the very
    // cards he is about to recall). They are read with the rest (the progress of every topic with a
    // card reviewed today), so they are part of the first paint whichever state the screen is in.
    var topics = {}, slipping = [], progress = {};
    planShared().then(function (p) {
      var tids = uniq(p.data.cards.map(function (c) { return c.tid; }));
      var doneTids = U.notes ? uniq(reviewedToday(p.data.cards, p.day).map(function (x) { return x.tid; })) : [];
      return Promise.all([topicsFor(tids), slippingNow(p.data.cards, p.day), progressFor(doneTids)]).then(function (r) { return { p: p, topics: r[0], slipping: r[1], progress: r[2] }; });
    }).then(function (r) {
      if (!ctx.alive()) return;
      topics = r.topics;
      slipping = r.slipping;
      progress = r.progress;
      draw(r.p);
    }).catch(function (e) {
      if (!ctx.alive()) return;
      console.error(e);
      U.clear(root).appendChild(errorBox('Today\'s review could not be loaded. ', e));
    });

    function draw(p) {
      U.clear(root);
      root.appendChild(h('p', { class: 'eyebrow td-date' }, longDate(p.day)));
      if (p.size > 0) drawBox(p);
      else { drawClear(p); drawNotes(p); }
      U.append(root, relearnBlock(slipping, topics));
      root.appendChild(weekStrip(p.data.profile.days, p.day, p.data.cards));
    }
    // The whole screen again after the Light day switch changed which state it is in; focus goes
    // to the switch drawn in its place (else the heading), so Dan's place (and a screen reader's)
    // is kept.
    function redraw(q) {
      draw(q);
      var to = root.querySelector('.td-light .switch') || root.querySelector('h1');
      if (to && to.tagName === 'H1') to.setAttribute('tabindex', '-1');
      if (to) try { to.focus({ preventScroll: true }); } catch (e) { /* fine */ }
    }

    // The Light day switch: today only (the lasting "Light days" setting shows it on and locked).
    // onPlan(q) gets the plan with the new cap.
    function lightRow(p, onPlan) {
      var lasting = !!p.prefs.light;
      var light = h('input', { class: 'switch', type: 'checkbox', role: 'switch', checked: lightToday(p.prefs), disabled: lasting, 'aria-describedby': 'td-light-note' });
      light.addEventListener('change', function () {
        var on = light.checked, day = on ? U.studyDay() : '';
        p.data.profile.prefs = Object.assign({}, p.data.profile.prefs, { lightDay: day });
        if (U.settings && U.settings.prefs) U.settings.prefs.lightDay = day;
        U.store.profile.patch({ prefs: { lightDay: day } }).catch(function () {});
        changed();
        plan({ light: on }, p.data).then(function (q) { if (ctx.alive()) onPlan(q); });
        setTimeout(function () { U.review.refreshBadge(); }, 400);
      });
      return h('label', { class: 'td-light' },
        h('span', { class: 'td-light-text' }, h('strong', null, 'Light day'), h('span', { class: 'muted small', id: 'td-light-note' }, lasting ? 'Light days are on in settings: just ' + LIGHT_CAP + ' puzzles a day, then stop.' : 'Just ' + LIGHT_CAP + ' puzzles, then stop.')),
        light);
    }

    // The box: how many puzzles are in it and from where, Flip through, then By course (when
    // there are two or more), each with "Just these". The Light day switch bounds a batch.
    function drawBox(p) {
      var box = boxOf(p.due);
      var names = box.courses.map(function (c) { return topicTitle(topics, c.tid); });
      root.appendChild(h('h1', { class: 'td-title' }, plural(box.size, 'puzzle') + ' in the box'));
      root.appendChild(h('p', { class: 'td-lead' }, (names.length ? 'From ' + andList(names) + '. ' : '') + 'Flip through a few, or leave them. They keep, and come back round when a second look would help.'));
      var start = h('button', { class: 'btn wide td-start', type: 'button', on: { click: function () { U.go('#/review'); } } }, 'Flip through', U.icon('arrow'));
      root.appendChild(h('section', { class: 'td-plan', 'aria-label': 'The puzzle box' }, start));
      if (box.courses.length > 1) {
        root.appendChild(h('section', { class: 'td-by', 'aria-labelledby': 'td-by-h' },
          h('h2', { class: 'eyebrow', id: 'td-by-h' }, 'By course'),
          h('ul', { class: 'td-by-list' }, box.courses.map(function (c) {
            var t = topics[c.tid], tone = U.views && U.views.toneOf ? U.views.toneOf(topicTitle(topics, c.tid), t) : null;
            return h('li', { class: 'td-by-row', 'data-tone': tone },
              h('span', { class: 'td-by-text' }, h('strong', null, topicTitle(topics, c.tid)), h('span', { class: 'muted small' }, plural(c.n, 'puzzle') + fromLessons(topics, c.tid, c.ideas))),
              h('a', { class: 'btn secondary small td-by-go', href: '#/review?topic=' + encodeURIComponent(c.tid), 'aria-label': 'Just these: ' + topicTitle(topics, c.tid) }, 'Just these'));
          }))));
      }
      // A light day can leave nothing for today (Dan has already flipped through 5 or more): then
      // the screen says so, as after a session.
      root.appendChild(lightRow(p, function (q) { if (q.size <= 0) redraw(q); }));
    }

    // Claude's notes on today's review (D4), once the session is done: for each idea reviewed today,
    // the most recent first, what Claude last said about the words Dan used for it (its say-it-back
    // grade): the follow-up question when he was not there yet, else what he nailed. Drawn with the
    // screen (the progress was read with the plan), so nothing below moves once it has appeared;
    // nothing when there is none.
    function drawNotes(p) {
      if (!U.notes) return;
      var notes = [];
      reviewedToday(p.data.cards, p.day).forEach(function (c) {
        if (notes.length >= 3) return;
        var doc = progress[c.tid], ip = doc && doc.ideas && doc.ideas[c.iid];
        var said = U.entries(ip && ip.say).map(function (e) { return e.value; }).filter(function (a) { return a && a.verdict && (a.followUp || a.nailed); });
        var a = said[said.length - 1];
        if (!a) return;
        notes.push(U.notes.card({ who: 'claude', context: 'on ' + ideaTitle(topics, c.tid, c.iid),
          text: a.verdict !== 'got-it' && a.followUp ? a.followUp : a.nailed || a.followUp }));
      });
      var list = U.notes.list({ title: 'Claude\'s notes on today\'s review', id: 'td-notes-h', notes: notes });
      if (list) root.appendChild(h('div', { class: 'td-notes' }, list));
    }

    function drawClear(p) {
      var box = clearBox(p, h('a', { class: 'btn wide', href: '#/' }, 'Browse your library'));
      // When today's light day is what holds those cards back, its switch stays here to undo it.
      if (p.due.length > 0 && !p.prefs.light && lightToday(p.prefs)) box.appendChild(lightRow(p, redraw));
      root.appendChild(box);
    }
  }

  // A puzzle's worked example in its guide, as the card shows it with the answer: {svg, html, alt,
  // style, w, h (a still's size, 53-read.js)} | null (no guide here, a page that is not that example any more, or a read over 5 s).
  function pageFor(card) {
    var RT = U.readThrough, sp = card.spec || {};
    if (!RT || typeof RT.guide !== 'function' || typeof sp.page !== 'number') return Promise.resolve(null);
    return Promise.race([
      RT.guide(card.tid, card.iid).then(function (g) {
        var p = g && Array.isArray(g.pages) ? g.pages[sp.page] : null;
        if (!p || p.kind !== 'example' || str(p.task).trim() !== sp.q) return null;
        return p.svg || p.html ? { svg: p.svg || null, html: p.html || null, alt: str(p.alt), style: str(g.style), w: Number(g.stillW) || 0, h: Number(p.h) || 0 } : null;
      }, function () { return null; }),
      U.sleep(5000).then(function () { return null; }),
    ]);
  }

  // ---------- #/review ----------
  function reviewView(extra) {
    return function (params, ctx) {
      // The box hidden: its addresses (an old link, a bookmark) go home quietly, in place.
      if (!boxOn()) { U._home(); return; }
      var root = h('div', { class: 'rv' });
      var fill = h('i', { style: { width: '0%' } });
      var bar = h('div', { class: 'bar rv-bar', role: 'progressbar', 'aria-label': 'Review progress', 'aria-valuemin': '0', 'aria-valuemax': '0', 'aria-valuenow': '0' }, fill);
      var count = h('span', { class: 'rv-count' });
      // ?topic=<tid>: that course's puzzles only. Its close goes back where it was opened from
      // (Today, or the course page), and so do the buttons that end it.
      var topic = ctx.query && ctx.query.topic || null;
      var from = U._from && /^#\/(today|t\/[^/?]+)$/.test(U._from) ? U._from : '#/today';
      var backLabel = from === '#/today' ? 'Back to Today' : 'Back to the course';
      var close = h('button', { class: 'icon-btn rv-close', type: 'button', 'aria-label': 'Close review', on: { click: function () { U.go(from); } } }, U.icon('close'));
      var where = h('p', { class: 'rv-where' });
      var stage = h('div', { class: 'rv-stage' }, h('div', { class: 'skeleton', style: { height: '220px' } }));
      root.append(h('div', { class: 'rv-top' }, close, bar, count, U.calcSheet ? U.calcSheet.button('rv-calc') : null), where, stage);
      ctx.view.appendChild(root);

      var S = { plan: null, queue: [], i: 0, topics: {}, results: [], saves: [], ms: 0, el: null, logged: false };

      plan(Object.assign(extra ? { extra: true, cap: MORE } : {}, topic ? { topic: topic } : {})).then(function (p) {
        S.plan = p;
        S.queue = p.queue;
        return topicsFor(uniq(p.queue.map(function (c) { return c.tid; })));
      }).then(function (topics) {
        if (!ctx.alive()) return;
        S.topics = topics;
        bar.setAttribute('aria-valuemax', String(S.queue.length));
        if (!S.queue.length) return empty(S.plan);
        showCard();
      }).catch(function (e) {
        if (!ctx.alive()) return;
        console.error(e);
        U.clear(stage).appendChild(errorBox('The review could not start. ', e));
      });

      function progress() {
        var n = S.queue.length;
        fill.style.width = (n ? Math.round(S.i / n * 100) : 0) + '%';
        bar.setAttribute('aria-valuenow', String(S.i));
        count.textContent = Math.min(S.i + 1, n) + ' of ' + n;
      }
      // A target card plays on its idea's interactive, which is gone while the lesson is rebuilt
      // (Learn it again, "This looks wrong"). What happens to one that cannot be shown is saved, so
      // Today and the badge stop counting a card no session can show:
      //   'tomorrow'  the lesson is being written right now, and a write that fails for a passing
      //               reason puts the old lesson back: the card waits a day;
      //   'retire'    building a new interactive, failed, or a rebuild left part-way: the
      //               interactive it was made for will not come back (finishing the new lesson
      //               makes the idea's cards afresh), as for a card whose control has gone;
      //   'later'     the lesson could not be read just now: still due, for the next session.
      function lessonFor(card) {
        // A puzzle shows its worked example's picture with the answer: the guide's page, read once
        // per page load (U.readThrough.guide); without it, the puzzle is words only.
        if (card.type === 'puzzle') return pageFor(card).then(function (page) { return { use: 'ok', doc: null, page: page }; });
        if (card.type !== 'target') return Promise.resolve({ use: 'ok', doc: null });
        return U.store.lesson.get(card.tid, card.iid).then(function (doc) {
          if (!doc) return { use: 'retire' };
          if (doc.status && doc.status !== 'ready') return { use: writingNow(doc) ? 'tomorrow' : 'retire' };
          if (!U.cards.interactiveOf(doc)) return { use: 'retire' };
          var lj = doc.lesson || {}, ctl = lj.interactive && lj.interactive.controls;
          if (Array.isArray(ctl) && ctl.length && !U.cards.controlOf(doc, card.spec && card.spec.control)) return { use: 'retire' };
          return { use: 'ok', doc: doc };
        }, function () { return { use: 'later' }; });
      }
      function showCard() {
        if (S.i >= S.queue.length) return summary();
        var card = S.queue[S.i];
        progress();
        // Take the answered card away at once; a target card may need a moment to load its lesson.
        if (S.el && S.el.destroy) S.el.destroy();
        S.el = null;
        where.textContent = '';
        U.clear(stage).appendChild(h('div', { class: 'skeleton rv-loading', 'aria-hidden': 'true' }));
        lessonFor(card).then(function (l) {
          if (!ctx.alive()) return;
          if (l.use !== 'ok') {
            // Not usable (its interactive was rebuilt or is mid-build): drop it from this session.
            if (l.use === 'retire') S.saves.push(retire(card));
            else if (l.use === 'tomorrow') S.saves.push(postpone(card));
            S.queue.splice(S.i, 1);
            bar.setAttribute('aria-valuemax', String(S.queue.length));
            return showCard();
          }
          where.textContent = topicTitle(S.topics, card.tid) + ' · ' + ideaTitle(S.topics, card.tid, card.iid);
          var el = U.cards.render(card, { mode: 'review', lesson: l.doc, page: l.page || null, ask: function (text, o) { askAbout(card, text, o); }, onDone: function (r) { answered(card, r); } });
          S.el = el;
          U.clear(stage).appendChild(el);
          window.scrollTo(0, 0);
          var q = el.querySelector('.qc-q');
          if (q) { q.setAttribute('tabindex', '-1'); try { q.focus({ preventScroll: true }); } catch (e) {} }
          // The next puzzle's guide is read while he answers this one.
          var nx = S.queue[S.i + 1];
          if (nx && nx.type === 'puzzle') pageFor(nx);
        });
      }
      // A reply to Claude's note on an answer (D4): Ask Claude about this card's idea, opened with
      // the question asked and what he has just done.
      function askAbout(card, text, o) {
        if (!U.tutor || typeof U.tutor.open !== 'function') { U.toast('Ask Claude is not available in this view.'); return; }
        o = o || {};
        U.tutor.open({ tid: card.tid, iid: card.iid, topic: S.topics[card.tid] || null, stage: 'review', about: o.about || null }, text ? { ask: text, chip: !!o.chip } : null);
      }
      function answered(card, r) {
        S.ms += r.ms || 0;
        // Skipped as unusable (an interactive that gives no reading, a card that cannot be shown):
        // retire it, so it does not head every session from now on.
        if (r.skipped) S.saves.push(retire(card));
        else {
          var rec = { card: card, grade: r.grade, correct: r.correct };
          S.results.push(rec);
          var job = r.pending
            ? r.pending.then(function (x) { rec.grade = x.grade; rec.correct = x.correct; return save(card, x.grade, x.correct == null ? x.grade > 1 : x.correct); })
            : save(card, r.grade || 3, r.correct == null ? (r.grade || 3) > 1 : r.correct);
          S.saves.push(holding(card, job).catch(function (e) { console.error('save failed', e); }));
        }
        S.i++;
        // The badge follows the session itself (no re-read of every card after each answer).
        if (!extra) setBadge(Math.max(0, S.queue.length - S.i));
        showCard();
      }
      // 99-boot.js already counts active minutes app-wide; log here only when it is not running.
      function logTime() {
        if (S.logged || !S.results.length) return;
        S.logged = true;
        if (U.boot && U.boot.study) return;
        U.logStudy(Math.max(1, Math.round(S.ms / 60000))).catch(function () {});
      }
      // Nothing to show: what Today says (no cards yet, nothing due, done for today, or the cards
      // the daily limit held back), with the way back to Today.
      function empty(p) {
        fill.style.width = '100%';
        count.textContent = '';
        var box = clearBox(p, h('a', { class: 'btn wide', href: from }, backLabel), topic);
        box.classList.add('rv-empty');
        U.clear(stage).appendChild(box);
      }
      function summary() {
        fill.style.width = '100%';
        bar.setAttribute('aria-valuenow', String(S.queue.length));
        count.textContent = '';
        where.textContent = '';
        if (S.el && S.el.destroy) S.el.destroy();
        S.el = null;
        logTime();
        var waiting = h('div', { class: 'rv-wait' }, h('div', { class: 'working', 'aria-hidden': 'true' }), h('p', { class: 'muted' }, 'Saving your answers…'));
        U.clear(stage).appendChild(waiting);
        var all = Promise.all(S.saves);
        var limit = new Promise(function (r) { setTimeout(r, 32000); });
        Promise.race([all, limit]).then(function () { changed(); return loadCards(); }).then(function (cards) {
          return slippingNow(cards, U.studyDay());
        }).then(function (slipping) {
          var missing = uniq(slipping.map(function (g) { return g.tid; })).filter(function (tid) { return !(tid in S.topics); });
          return topicsFor(missing).then(function (more) { Object.assign(S.topics, more); return slipping; });
        }).then(function (slipping) {
          if (ctx.alive()) drawSummary(slipping);
        }, function (e) { console.error(e); if (ctx.alive()) drawSummary([]); });
      }
      function drawSummary(slipping) {
        var n = S.results.length;
        var again = S.results.filter(function (r) { return r.grade === 1; });
        var kept = n - again.length;
        var mins = Math.max(1, Math.round(S.ms / 60000));
        var back = uniq(again.map(function (r) { return r.card.tid + '\n' + r.card.iid; })).map(function (k) {
          var t = k.split('\n');
          return h('li', null, h('strong', null, ideaTitle(S.topics, t[0], t[1])), h('span', { class: 'muted small' }, ' · ' + topicTitle(S.topics, t[0])));
        });
        U.clear(stage).appendChild(h('section', { class: 'rv-done' },
          h('div', { class: 'td-done-mark', 'aria-hidden': 'true' }, U.icon('tick')),
          h('h1', { tabindex: '-1' }, 'Review done'),
          h('p', { class: 'td-lead' }, n ? 'You flipped through ' + plural(n, 'puzzle') + ' in about ' + plural(mins, 'minute') + '.' : 'Nothing was flipped through this time.'),
          n ? h('dl', { class: 'rv-stats' },
            h('div', null, h('dt', null, 'Remembered'), h('dd', null, String(kept))),
            h('div', null, h('dt', null, 'Back tomorrow'), h('dd', null, String(again.length)))) : null,
          // The tile counts cards; the list names ideas. Say how the two meet ("4 cards, from 2 ideas").
          back.length ? h('div', { class: 'rv-back' }, h('p', { class: 'qc-label' }, 'Coming back tomorrow'),
            h('p', { class: 'rv-back-count' }, backCount(again.length, back.length)), h('ul', null, back)) : null,
          relearnBlock(slipping, S.topics),
          h('div', { class: 'td-actions' },
            h('a', { class: 'btn wide', href: from }, 'Done'),
            h('a', { class: 'btn wide secondary', href: '#/' }, 'Browse your library'))));
        // No pop-up cheer here: the page's own tick already says it, and the cheer covered the heading.
        var h1 = stage.querySelector('.rv-done h1');
        if (h1) try { h1.focus({ preventScroll: true }); } catch (e) { /* fine */ }
        U.review.refreshBadge();
      }

      return function cleanup() {
        if (S.el && S.el.destroy) S.el.destroy();
        logTime();
        U.review.refreshBadge();
        // An answer still being saved (a recall waiting for Claude's grade) is left out of that
        // count; count again once this session's saves have landed, or failed.
        if (Object.keys(saving).length) Promise.all(S.saves).then(function () { U.review.refreshBadge(); });
      };
    };
  }

  U.routes.add('#/today', todayView, { tab: 'today', title: 'Today' });
  U.routes.add('#/review', reviewView(false), { focus: true, title: 'Review' });
  U.routes.add('#/review/more', reviewView(true), { focus: true, title: 'Review' });

  // A new day can make cards due while the app sits open: refresh the badge when Dan comes back.
  if (typeof document !== 'undefined' && document.addEventListener && U.rt && U.rt.ready) {
    U.rt.ready.then(function () {
      document.addEventListener('visibilitychange', function () { if (!document.hidden) U.review.refreshBadge(); });
    });
  }
})();
