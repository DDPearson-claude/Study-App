// Spaced review: the card store, today's queue, the Today tab and the review session
// (docs/ARCHITECTURE.md sections 4, 8, 9, 10).
//
//   U.review.addFromLesson(tid, iid, lesson, outcome) -> Promise<[cardId]>
//       outcome = {checks:{[checkId]:{correct}}, say:{text, verdict}}. Each check Dan answered becomes
//       a card of the same type; his say-it-back answer becomes a 'recall' card. Re-learning an idea
//       replaces its cards (unchanged questions keep their schedule).
//   U.review.queue({cap, light, extra}) -> Promise<[card]>   due today or overdue, most overdue first,
//       interleaved so one idea never shows twice in a row and topics alternate. The daily cap
//       counts cards already reviewed today, unless `extra` (a "keep going" batch).
//   U.review.dueCount() -> Promise<number>     what today's session holds right now
//   U.review.outlook() -> Promise<{size, done, cards, head, lead, next}>   dueCount, cards reviewed
//       today, cards in all, and Today's words when nothing is waiting ("Done for today", its lead,
//       "Next up: 2 cards tomorrow." or ''), for Learn's quiet line
//   U.review.refreshBadge()                    #today-badge text + hidden
//   U.review.ideaBands() -> Promise<{tid:{iid: band}}>
//   U.review.slipping() -> Promise<[{tid, iid, lapses}]>   ideas forgotten 2+ times in 30 days
//
// Routes: '#/today' (tab), '#/review' and '#/review/more' (focus mode, one card per screen).
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
  var SECONDS = { choice: 25, order: 40, estimate: 30, target: 60, recall: 90 };
  var TYPES = { choice: 1, order: 1, estimate: 1, target: 1 };

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
  // Every usable card; the cards of topics deleted (here or on another device) are dropped and
  // their leftover docs removed.
  function loadCards() {
    return U.store.cards.all().then(function (all) {
      var tids = Object.keys(all);
      if (!tids.length) return [];
      return U.store.topicsExist(tids).then(function (ok) {
        var keep = {};
        tids.forEach(function (tid) {
          if (ok[tid] !== false) keep[tid] = all[tid];
          else U.store.cards.dropOrphan(tid).catch(function (e) { console.warn('tidy', e); });
        });
        return flatten(keep);
      }, function () { return flatten(all); });
    });
  }
  function dayOf(iso) { return iso ? U.today(new Date(iso)) : null; }
  function isDue(c, day) { return !c.retired && !!(c.s && c.s.due) && c.s.due <= day; }
  function hist(c) { return Array.isArray(c.hist) ? c.hist : U.list(c.hist); }
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
  function lightToday(prefs) { return !!prefs.light || prefs.lightDay === U.today(); }
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
  // Everything Today and a session need, from one read of the cards and the profile.
  function plan(opts, data) {
    opts = opts || {};
    var load = data ? Promise.resolve(data) : Promise.all([loadCards(), U.store.profile.get()]).then(function (r) { return { cards: r[0], profile: r[1] || {} }; });
    return load.then(function (d) {
      var day = U.today(), prefs = d.profile.prefs || {};
      var due = d.cards.filter(function (c) { return isDue(c, day); }).sort(byPriority(day));
      var cap = capOf(prefs, opts), done = reviewedOn(d.cards, day);
      var size = Math.min(due.length, opts.extra ? cap : Math.max(0, cap - done));
      return { data: d, day: day, prefs: prefs, due: due, cap: cap, done: done, size: size, queue: interleave(due.slice(0, size)) };
    });
  }

  function slippingIn(cards, day) {
    var since = U.addDays(day, -LAPSE_DAYS), groups = {};
    cards.forEach(function (c) {
      if (c.retired) return;
      hist(c).forEach(function (e) {
        if (e.grade !== 1 || !e.at || dayOf(e.at) <= since) return;
        if (c.learnedAt && e.at < c.learnedAt) return;
        var k = ideaKey(c);
        groups[k] = groups[k] || { tid: c.tid, iid: c.iid, lapses: 0, last: '' };
        groups[k].lapses++;
        if (e.at > groups[k].last) groups[k].last = e.at;
      });
    });
    return Object.keys(groups).map(function (k) { return groups[k]; }).filter(function (g) { return g.lapses >= LAPSE_LIMIT; });
  }
  // The slipping ideas still worth offering: one Dan is already re-learning (a fresh round began
  // after those lapses) is left out. The rest are flagged on progress (relearn: true) so the lesson
  // screen rebuilds them with a different interactive.
  function slippingNow(cards, day) {
    var list = slippingIn(cards, day);
    if (!list.length) return Promise.resolve([]);
    var tids = uniq(list.map(function (g) { return g.tid; })), prog = {};
    return Promise.all(tids.map(function (tid) {
      return U.store.progress.get(tid).then(function (p) { prog[tid] = p; }, function () { prog[tid] = null; });
    })).then(function () {
      var out = list.filter(function (g) {
        var idea = prog[g.tid] && prog[g.tid].ideas && prog[g.tid].ideas[g.iid];
        return !(idea && idea.againAt && idea.againAt >= g.last);
      });
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
    var day = U.today(), entry = { at: U.now(), grade: grade, ok: !!ok };
    changed();
    return U.store.cards.update(card.tid, card.id, function (fresh) {
      var before = hist(fresh);
      if (before.some(function (e) { return e && e.at === entry.at; })) return null;   // already saved (a resend)
      return { s: U.fsrs.review(fresh.s || U.fsrs.init(day), grade, day, card.id), hist: mergeHist(before, [entry]) };
    }).then(function (fields) { if (fields) { card.s = fields.s; card.hist = fields.hist; } return fields; });
  }
  function retire(card) {
    changed();
    return U.store.cards.update(card.tid, card.id, function () { return { retired: true }; }).catch(function () {});
  }

  function sameQuestion(a, b, type) {
    if (!a || !b) return false;
    if (type === 'recall') return a.prompt === b.prompt && a.model === b.model;
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function addFromLesson(tid, iid, lesson, outcome) {
    lesson = lesson || {};
    outcome = outcome || {};
    var now = U.now(), day = U.today(), made = {};
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
    return U.store.cards.get(tid).then(function (doc) {
      var cards = (doc && doc.cards) || {}, patch = { cards: {} };
      Object.keys(cards).forEach(function (id) { var c = cards[id]; if (c && c.iid === iid && !made[id]) patch.cards[id] = null; });
      Object.keys(made).forEach(function (id) {
        var m = made[id], old = cards[id];
        if (old && old.s && old.type === m.type && sameQuestion(old.spec, m.spec, m.type)) {
          var keep = { spec: U.store.replacing(old.spec, m.spec), learnedAt: now };
          if (old.retired != null) keep.retired = null;
          patch.cards[id] = keep;
        } else {
          m.createdAt = now;
          m.learnedAt = now;
          m.s = U.fsrs.init(day);
          m.hist = [];
          patch.cards[id] = old && typeof old === 'object' ? U.store.replacing(old, m) : m;
        }
      });
      changed();
      return Object.keys(patch.cards).length ? U.store.cards.patch(tid, patch) : null;
    }).then(function () {
      U.review.refreshBadge();
      return Object.keys(made);
    }, function (e) {
      // The cards could not be read (or written) just now: the whole step runs again once the
      // db answers (it is safe to repeat: only this idea's cards are patched).
      if (e && e.queued) throw e;
      throw U.store.retryLater(e, function () { return addFromLesson(tid, iid, lesson, outcome); });
    });
  }

  function ideaBands() {
    var RANK = { new: 0, fragile: 1, growing: 2, strong: 3 }, NAMES = ['new', 'fragile', 'growing', 'strong'];
    return loadCards().then(function (cards) {
      var day = U.today(), groups = {}, out = {};
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
    queue: function (opts) { return plan(opts).then(function (p) { return p.queue; }); },
    dueCount: function () { return planShared().then(function (p) { return p.size; }); },
    // For Learn when nothing is waiting, from the same read as dueCount, in Today's words.
    outlook: function () {
      return planShared().then(function (p) { var w = clearWords(p); return { size: p.size, done: p.done, cards: p.data.cards.length, head: w.head, lead: w.lead, next: w.next }; });
    },
    refreshBadge: function () {
      changed();
      return U.review.dueCount().then(setBadge, function (e) { console.error('badge', e); return 0; });
    },
    setBadge: setBadge,
    ideaBands: ideaBands,
    slipping: function () { return loadCards().then(function (cards) { return slippingNow(cards, U.today()); }); },
    _interleave: interleave,
    _plan: plan,
    _clearWords: clearWords,
    _backCount: backCount,
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
  // "4 cards, from 2 ideas:" above the list of ideas coming back.
  function backCount(cards, ideas) {
    if (ideas === 1) return cards === 1 ? 'One card, from this idea:' : plural(cards, 'card') + ', all from this idea:';
    return plural(cards, 'card') + ', from ' + ideas + ' ideas:';
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
    return nextDay ? 'Next up: ' + plural(nextN, 'card') + ' ' + whenDay(nextDay, p.day) + '.' : '';
  }
  // The words for a day with nothing waiting: one set, for Today, a review with nothing to show
  // and Learn's quiet line.
  function clearWords(p) {
    var w = p.done > 0 ? ['Done for today', 'You reviewed ' + plural(p.done, 'card') + ' today. That is what keeps it all fresh.']
      : !p.data.cards.length ? ['Nothing to review yet', 'When you finish a lesson, the questions you answered come back the next day, so they stick.']
      : ['Nothing to review today', 'Everything you have learned is holding up for now.'];
    return { head: w[0], lead: w[1], next: nextUp(p) };
  }
  // Nothing waiting, on Today and in a review with nothing to show: those words, and any cards the
  // daily limit held back, offered without hurry. `first` is the main way on.
  function clearBox(p, first) {
    var w = clearWords(p), more = p.due.length;
    var box = h('section', { class: 'td-clear' });
    if (p.done > 0) box.appendChild(h('div', { class: 'td-done-mark', 'aria-hidden': 'true' }, U.icon('tick')));
    box.appendChild(h('h1', { class: 'td-title' }, w.head));
    box.appendChild(h('p', { class: 'td-lead' }, w.lead));
    if (w.next) box.appendChild(h('p', { class: 'muted td-next' }, w.next));
    var actions = h('div', { class: 'td-actions' }, first);
    if (more > 0) actions.appendChild(h('a', { class: 'btn wide secondary', href: '#/review/more' }, 'Review ' + Math.min(MORE, more) + ' more'));
    box.appendChild(actions);
    if (more > 0) box.appendChild(h('p', { class: 'muted small td-more-note' }, plural(more, 'more card is', 'more cards are') + ' due. There is no rush: they wait for you.'));
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
  function ideaTitle(topics, tid, iid) {
    var t = topics[tid], ideas = (t && t.ideas) || [];
    for (var i = 0; i < ideas.length; i++) if (ideas[i].id === iid) return ideas[i].title;
    return 'An idea';
  }
  function topicTitle(topics, tid) { return (topics[tid] && topics[tid].title) || 'A topic'; }
  function uniq(list) { return list.filter(function (x, i) { return list.indexOf(x) === i; }); }

  function relearnBlock(list, topics) {
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

  // ---------- #/today ----------
  function todayView(params, ctx) {
    var root = h('div', { class: 'td' });
    ctx.view.appendChild(root);
    root.appendChild(h('div', { class: 'td-loading' }, h('div', { class: 'skeleton', style: { height: '28px', width: '60%' } }), h('div', { class: 'skeleton', style: { height: '180px' } })));

    planShared().then(function (p) {
      var tids = uniq(p.data.cards.map(function (c) { return c.tid; }));
      return Promise.all([topicsFor(tids), slippingNow(p.data.cards, p.day)]).then(function (r) { return { p: p, topics: r[0], slipping: r[1] }; });
    }).then(function (r) {
      if (!ctx.alive()) return;
      draw(r.p, r.topics, r.slipping);
    }).catch(function (e) {
      if (!ctx.alive()) return;
      console.error(e);
      U.clear(root).appendChild(errorBox('Today\'s review could not be loaded. ', e));
    });

    function draw(p, topics, slipping) {
      U.clear(root);
      root.appendChild(h('p', { class: 'eyebrow td-date' }, longDate(p.day)));
      if (p.size > 0) drawDue(p, topics);
      else drawClear(p);
      U.append(root, relearnBlock(slipping, topics));
      root.appendChild(weekStrip(p.data.profile.days, p.day, p.data.cards));
    }

    function drawDue(p, topics) {
      var names = uniq(p.queue.map(function (c) { return c.tid; })).map(function (tid) { return topicTitle(topics, tid); });
      var count = h('span', { class: 'td-count-n' }), minutes = h('span');
      var lasting = !!p.prefs.light;
      var light = h('input', { class: 'switch', type: 'checkbox', role: 'switch', checked: lightToday(p.prefs), disabled: lasting, 'aria-describedby': 'td-light-note' });
      var start = h('button', { class: 'btn wide td-start', type: 'button', on: { click: function () { U.go('#/review'); } } }, 'Start review', U.icon('arrow'));
      var countWord = h('span', { class: 'td-count-word' });
      function update(q) {
        count.textContent = String(q.size);
        countWord.textContent = q.size === 1 ? 'card to revisit' : 'cards to revisit';
        minutes.textContent = 'About ' + plural(minutesFor(q.queue), 'minute');
      }
      light.addEventListener('change', function () {
        var on = light.checked, day = on ? U.today() : '';
        p.data.profile.prefs = Object.assign({}, p.data.profile.prefs, { lightDay: day });
        if (U.settings && U.settings.prefs) U.settings.prefs.lightDay = day;
        U.store.profile.patch({ prefs: { lightDay: day } }).catch(function () {});
        changed();
        plan({ light: on }, p.data).then(update);
        setTimeout(function () { U.review.refreshBadge(); }, 400);
      });
      root.appendChild(h('h1', { class: 'td-title' }, 'Today\'s review'));
      root.appendChild(h('p', { class: 'td-lead' }, 'A few things you learned are ready to come back. Remembering them now is what makes them stick.'));
      root.appendChild(h('section', { class: 'card td-plan', 'aria-label': 'Today\'s plan' },
        h('p', { class: 'td-count' }, count, ' ', countWord),
        h('p', { class: 'td-meta muted' }, minutes, names.length ? ' · from ' + names.slice(0, 3).join(', ') + (names.length > 3 ? ' and more' : '') : ''),
        h('label', { class: 'td-light' },
          h('span', { class: 'td-light-text' }, h('strong', null, 'Light day'), h('span', { class: 'muted small', id: 'td-light-note' }, lasting ? 'Light days are on in settings: ' + LIGHT_CAP + ' cards a day, the most overdue first.' : 'Just ' + LIGHT_CAP + ' cards today, the most overdue first.')),
          light),
        start));
      update(p);
    }

    function drawClear(p) {
      root.appendChild(clearBox(p, h('a', { class: 'btn wide', href: '#/' }, 'Learn something new')));
    }
  }

  // ---------- #/review ----------
  function reviewView(extra) {
    return function (params, ctx) {
      var root = h('div', { class: 'rv' });
      var fill = h('i', { style: { width: '0%' } });
      var bar = h('div', { class: 'bar rv-bar', role: 'progressbar', 'aria-label': 'Review progress', 'aria-valuemin': '0', 'aria-valuemax': '0', 'aria-valuenow': '0' }, fill);
      var count = h('span', { class: 'rv-count' });
      var close = h('button', { class: 'icon-btn rv-close', type: 'button', 'aria-label': 'Close review', on: { click: function () { U.go('#/today'); } } }, U.icon('close'));
      var where = h('p', { class: 'rv-where' });
      var stage = h('div', { class: 'rv-stage' }, h('div', { class: 'skeleton', style: { height: '220px' } }));
      root.append(h('div', { class: 'rv-top' }, close, bar, count), where, stage);
      ctx.view.appendChild(root);

      var S = { plan: null, queue: [], i: 0, topics: {}, results: [], saves: [], ms: 0, el: null, logged: false };

      plan(extra ? { extra: true, cap: MORE } : {}).then(function (p) {
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
      function lessonFor(card) {
        if (card.type !== 'target') return Promise.resolve({ use: 'ok', doc: null });
        return U.store.lesson.get(card.tid, card.iid).then(function (doc) {
          if (!doc) return { use: 'retire' };
          if (doc.status && doc.status !== 'ready') return { use: 'later' };
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
            if (l.use === 'retire') retire(card);
            S.queue.splice(S.i, 1);
            bar.setAttribute('aria-valuemax', String(S.queue.length));
            return showCard();
          }
          where.textContent = topicTitle(S.topics, card.tid) + ' · ' + ideaTitle(S.topics, card.tid, card.iid);
          var el = U.cards.render(card, { mode: 'review', lesson: l.doc, onDone: function (r) { answered(card, r); } });
          S.el = el;
          U.clear(stage).appendChild(el);
          window.scrollTo(0, 0);
          var q = el.querySelector('.qc-q');
          if (q) { q.setAttribute('tabindex', '-1'); try { q.focus({ preventScroll: true }); } catch (e) {} }
        });
      }
      function answered(card, r) {
        S.ms += r.ms || 0;
        // Skipped as unusable (an interactive that gives no reading, a card that cannot be shown):
        // retire it, so it does not head every session from now on.
        if (r.skipped) retire(card);
        else {
          var rec = { card: card, grade: r.grade, correct: r.correct };
          S.results.push(rec);
          var job = r.pending
            ? r.pending.then(function (x) { rec.grade = x.grade; rec.correct = x.correct; return save(card, x.grade, x.correct == null ? x.grade > 1 : x.correct); })
            : save(card, r.grade || 3, r.correct == null ? (r.grade || 3) > 1 : r.correct);
          S.saves.push(job.catch(function (e) { console.error('save failed', e); }));
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
        var box = clearBox(p, h('a', { class: 'btn wide', href: '#/today' }, 'Back to Today'));
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
          return slippingNow(cards, U.today());
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
          h('p', { class: 'td-lead' }, n ? 'You went through ' + plural(n, 'card') + ' in about ' + plural(mins, 'minute') + '.' : 'Nothing was reviewed this time.'),
          n ? h('dl', { class: 'rv-stats' },
            h('div', null, h('dt', null, 'Remembered'), h('dd', null, String(kept))),
            h('div', null, h('dt', null, 'Back tomorrow'), h('dd', null, String(again.length)))) : null,
          // The tile counts cards; the list names ideas. Say how the two meet ("4 cards, from 2 ideas").
          back.length ? h('div', { class: 'rv-back' }, h('p', { class: 'qc-label' }, 'Coming back tomorrow'),
            h('p', { class: 'rv-back-count' }, backCount(again.length, back.length)), h('ul', null, back)) : null,
          relearnBlock(slipping, S.topics),
          h('div', { class: 'td-actions' },
            h('a', { class: 'btn wide', href: '#/today' }, 'Done'),
            h('a', { class: 'btn wide secondary', href: '#/' }, 'Learn something new'))));
        // No pop-up cheer here: the page's own tick already says it, and the cheer covered the heading.
        var h1 = stage.querySelector('.rv-done h1');
        if (h1) try { h1.focus({ preventScroll: true }); } catch (e) { /* fine */ }
        U.review.refreshBadge();
      }

      return function cleanup() {
        if (S.el && S.el.destroy) S.el.destroy();
        logTime();
        U.review.refreshBadge();
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
