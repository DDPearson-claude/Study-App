// Check and review cards: one interactive question per card (docs/ARCHITECTURE.md sections 5, 8, 9).
//
//   U.cards.render(card, {mode, lesson, onDone}) -> Element
//     card   {id, type, spec, s?}   type: choice | order | estimate | target | recall | puzzle | written
//            In a lesson the player passes {id, type, spec: <the Check object>}; in review it is a
//            stored Card (with its FSRS state `s`, used for "back in N days" hints).
//     mode   'lesson' (no rating) | 'review' (objective cards auto-grade, Dan can override)
//     lesson the lesson doc (topics/{tid}/lessons/{iid}); needed only by 'target' cards, which mount
//            its interactive in quiz mode (the readout aimed at shows "?" and .say lines are hidden
//            until Check, which sends reveal; docs/ARCHITECTURE.md section 6)
//     page   a puzzle card's guide page as the review read it ({svg, html, alt, style}: its still
//            step, the picture once solved), shown with the answer; none, the card is words only
//   A puzzle (a worked example of a ready-made steps lesson's guide, 60-today.js) is typed (a
//   figure, graded to the course's rounding: half a unit in the last decimal shown, the unit
//   optional) or picked from the lesson's own options. A written card (a refresher lesson's
//   Section B question) is marked by Claude against its points (U.gen.markWritten); when Claude
//   cannot be reached Dan ticks the points his answer covers.
//     onDone(result) once Dan taps Continue:
//            {correct: bool|null, grade: 1-4|null, answer, ms}
//            + auto (review, the grade the app picked), verdict (recall), skipped (card unusable),
//            + pending: Promise<{grade, correct, verdict}> when a recall answer is still being graded
//   The returned element has destroy(): call it when the card leaves the screen (stops a mounted
//   interactive). A target card's element also has mount: its interactive (U.sandbox.mount's api).
//   Focus never drops to the page: after an answer it goes to Continue (which carries the
//   verdict), on an order card to the next item to place, on a recall card to the panel's heading.
//
// Flow on every card: answer -> a feedback panel slides up (green tick only when right; red plus
// the misconception when a wrong option has one; always the why) -> Continue.
(function () {
  var h = U.h;
  var GRADES = [{ g: 1, label: 'Again' }, { g: 2, label: 'Hard' }, { g: 3, label: 'Good' }, { g: 4, label: 'Easy' }];
  var KIND = {
    choice: 'Choose one', order: 'Put these in order', estimate: 'Make an estimate',
    target: 'Hit the target', recall: 'In your own words', puzzle: 'A puzzle from the lesson',
    written: 'Answer in writing',
  };
  var RIGHT = ['That\'s right', 'Yes, that\'s it', 'Spot on', 'Exactly right'];
  var VERDICT = {
    'got-it': { text: 'You\'ve got it', grade: 3, cls: 'good' },
    partly: { text: 'Partly there', grade: 2, cls: 'mid' },
    'not-yet': { text: 'Not there yet', grade: 1, cls: 'bad' },
  };

  // ---------- small helpers ----------
  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  function num(v, d) { var n = Number(v); return isFinite(n) ? n : d; }
  function reducedMotion() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function finePointer() { return !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches); }
  function inline(tag, cls, text) { return U.inline(h(tag, cls ? { class: cls } : null), String(text == null ? '' : text)); }
  function label(text, kind) { return h('p', { class: 'qc-label' + (kind ? ' ' + kind : '') }, text); }
  function mark(icon, cls) { return h('span', { class: 'qc-mark ' + cls, 'aria-hidden': 'true' }, U.icon(icon)); }
  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function inDays(n) { return n <= 0 ? 'today' : n === 1 ? 'tomorrow' : 'in ' + n + ' days'; }
  function shortDays(n) { return n <= 1 ? '1 day' : n < 60 ? n + ' days' : Math.round(n / 30) + ' months'; }
  function niceStep(x, down) {
    if (!(x > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p;
    if (down) return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  }
  function decimalsFor(step) { return step >= 1 ? 0 : Math.min(6, Math.ceil(-Math.log10(step) - 1e-9)); }
  function fmt(v, decimals) {
    if (!isFinite(v)) return '–';
    var d = decimals == null ? (Math.abs(v) >= 100 || Number.isInteger(v) ? 0 : Math.abs(v) >= 1 ? 2 : 3) : decimals;
    return Number(v.toFixed(d)).toLocaleString(undefined, { maximumFractionDigits: d });
  }
  // A no-break space: the number never ends a line with its unit on the next.
  function withUnit(text, unit) { return unit ? text + '\u00a0' + unit : text; }
  function primary(text, onClick) { return h('button', { class: 'btn wide qc-primary', type: 'button', on: { click: onClick } }, text); }
  function richBlock(cls, text) { return h('div', { class: cls }, U.rich(String(text || ''))); }
  function why(text) { return text ? h('div', { class: 'qc-why' }, label('Why'), richBlock('qc-prose', text)) : null; }
  // Misconception notes should talk to Dan ("It's easy to think..."). Older lessons describe him in
  // the third person ("Thinks the push comes from..."): turn those into the same friendly form.
  var VERB = { think: 'think', thinks: 'think', believe: 'believe', believes: 'believe', assume: 'assume', assumes: 'assume',
    confuse: 'confuse', confuses: 'confuse', expect: 'expect', expects: 'expect', 'mix up': 'mix up', 'mixes up': 'mix up' };
  function toYou(text) {
    var t = String(text || '').trim();
    var m = t.match(/^(?:(?:dan|the learner|learner|a learner|students?|they|he|she)\s+)?(thinks?|believes?|assumes?|confuses?|expects?|mix(?:es)? up)\b\s*(.*)$/i);
    if (!m || !m[2]) return t;
    return 'It\'s easy to ' + VERB[m[1].toLowerCase()] + ' ' + m[2];
  }

  // ---------- card shell ----------
  function shell(card, opts) {
    var mode = opts.mode === 'review' ? 'review' : 'lesson';
    var spec = card.spec || {};
    var type = card.type || spec.type;
    var el = h('section', { class: 'qc qc-' + mode + ' qc-type-' + type, 'aria-label': KIND[type] || 'Question' });
    var body = h('div', { class: 'qc-body' });
    var foot = h('div', { class: 'qc-foot' });
    el.appendChild(h('p', { class: 'eyebrow qc-kind' }, KIND[type] || 'Quick check'));
    el.appendChild(inline('h2', 'qc-q', spec.q || spec.prompt || ''));
    el.appendChild(body);
    el.appendChild(foot);
    var c = {
      card: card, spec: spec, type: type, mode: mode, opts: opts, el: el, body: body, foot: foot,
      t0: Date.now(), ms: null, done: false, cleanups: [],
      answered: function () { if (c.ms == null) c.ms = Date.now() - c.t0; return c.ms; },
      setFoot: function (children) { U.clear(foot); U.append(foot, children); },
      finish: function (result) {
        if (c.done) return;
        c.done = true;
        if (result.ms == null) result.ms = c.answered();
        el.classList.add('qc-finished');
        foot.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        var cont = foot.querySelector('.qc-continue');
        if (cont) cont.remove();
        if (opts.onDone) opts.onDone(result);
      },
    };
    el.destroy = function () {
      c.cleanups.splice(0).forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    };
    return c;
  }

  // Interval hints for the four grades ("back in 4 days"), when the card has a schedule.
  function nextDays(c) {
    if (c.mode !== 'review' || !U.fsrs) return null;
    var day = U.studyDay(), p = U.fsrs.preview(c.card.s || U.fsrs.init(day), day, c.card.id), out = {};   // the day save() uses
    [1, 2, 3, 4].forEach(function (g) { out[g] = U.daysBetween(day, p[g].due); });
    return out;
  }

  // Four segmented buttons: Again / Hard / Good / Easy, each with its interval.
  function gradePicker(c, selected, onPick) {
    var days = nextDays(c) || {};
    var btns = GRADES.map(function (x) {
      return h('button', {
        class: 'qc-g qc-g' + x.g, type: 'button', 'aria-pressed': String(x.g === selected), dataset: { g: x.g },
        on: { click: function () { set(x.g); onPick(x.g); } },
      }, h('span', { class: 'qc-g-label' }, x.label), days[x.g] ? h('span', { class: 'qc-g-days' }, shortDays(days[x.g])) : null);
    });
    function set(g) { btns.forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.g) === g)); }); }
    return { el: h('div', { class: 'qc-grades', role: 'group', 'aria-label': 'How well did you know it?' }, btns), set: set, btns: btns };
  }

  // How quickly a right answer counts as "knew it instantly" (Easy): reading time plus a beat.
  function fastMs(c) {
    var s = c.spec, text = String(s.q || '');
    if (Array.isArray(s.options)) text += s.options.join(' ');
    if (Array.isArray(s.items)) text += s.items.join(' ');
    // A typed puzzle is worked out, not recognised: more time before a right answer counts as instant.
    var base = c.type === 'order' ? 4000 + 1000 * (s.items || []).length : c.type === 'estimate' ? 5000 : c.typed ? 9000 : 2500;
    return Math.min(30000, base + text.length * 30);
  }
  function autoGrade(c, correct, opts) {
    if (c.mode !== 'review') return null;
    if (!correct) return 1;
    if (opts && opts.hinted) return 2;
    if (opts && opts.noEasy) return 3;
    return c.answered() <= fastMs(c) ? 4 : 3;
  }

  // The panel that slides up after an answer.
  //   o = {correct, title, parts:[Element], grade (the auto grade in review, else null), result}
  function feedback(c, o) {
    var right = o.correct === true, wrong = o.correct === false, titleId = U.id('qcfb'), review = c.mode === 'review';
    var panel = h('div', { class: 'qc-fb ' + (right ? 'is-right' : wrong ? 'is-wrong' : 'is-neutral'), role: 'status' });
    // D4: the explanation under the verdict is Claude's (written when it built the lesson), so it
    // carries Claude's byline, and Dan can answer it (Ask Claude opens with his question asked).
    // In a review the byline rides in the head (its context for screen readers only), so the
    // panel stays short enough to dock on a small phone.
    var by = U.notes && (o.parts || []).some(Boolean) ? U.notes.byline('claude', 'from the lesson') : null;
    if (by && review) by.querySelector('.note-ctx').classList.add('visually-hidden');
    panel.appendChild(h('div', { class: 'qc-fb-head' },
      right ? h('span', { class: 'qc-fb-icon good', 'aria-hidden': 'true' }, U.icon('tick')) : null,
      wrong ? h('span', { class: 'qc-fb-icon bad', 'aria-hidden': 'true' }, U.icon('close')) : null,
      h('h3', { id: titleId }, o.title), review ? by : null));
    if (!review) U.append(panel, by);
    U.append(panel, o.parts);

    var chosen = o.grade;
    if (c.mode === 'review' && chosen) {
      var days = nextDays(c);
      var line = h('p', { class: 'qc-grade-line' });
      var picker = gradePicker(c, chosen, function (g) { chosen = g; drawLine(); });
      picker.el.hidden = true;
      var change = h('button', { class: 'qc-change', type: 'button', 'aria-expanded': 'false', on: { click: function () {
        picker.el.hidden = !picker.el.hidden;
        change.setAttribute('aria-expanded', String(!picker.el.hidden));
        change.textContent = picker.el.hidden ? 'Change' : 'Done';
        reveal(c, { end: true });
      } } }, 'Change');
      var drawLine = function () {
        U.clear(line);
        var name = GRADES[chosen - 1].label;
        line.appendChild(h('span', null, days ? 'Coming back ' + inDays(days[chosen]) : 'Marked ' + name));
        if (days) line.appendChild(h('span', { class: 'qc-grade-name' }, ' · ' + name));
      };
      drawLine();
      panel.appendChild(h('div', { class: 'qc-grade' }, h('div', { class: 'qc-grade-row' }, line, change), picker.el));
    }
    var rep = askRow(c, o.correct === false ? ['Why?', 'Show me another way'] : ['Why?', 'Give me an example'],
      Object.assign({ kind: 'check', q: c.spec.q || c.spec.prompt || '', correct: o.correct }, o.about || {}));
    // Focus moves to Continue (show), which carries the verdict, so a screen reader says the
    // result with it: a panel that arrives already filled is not reliably read as a live region.
    var cont = h('button', { class: 'btn wide qc-continue', type: 'button', 'aria-describedby': titleId, on: { click: function () {
      var r = Object.assign({}, o.result);
      r.correct = o.correct;
      r.grade = c.mode === 'review' ? chosen : null;
      if (c.mode === 'review') r.auto = o.grade;
      c.finish(r);
    } } }, 'Continue');
    // A review's compact reply row sits over Continue (both docked); a lesson's reply box comes
    // after Continue, so Continue follows the explanation on a small phone without hunting.
    U.append(panel, review ? [rep, cont] : [cont, rep]);
    show(c, panel, cont);
    U.haptic(right ? 12 : [8, 50, 8]);
    return panel;
  }

  // Reply to Claude under a feedback panel: chips and a box that open Ask Claude with the question
  // asked (opts.ask, given by the lesson and the review: they know the topic and idea). None
  // without it. In a review it is one compact row (its panel must fit beside the card on a laptop,
  // and dock on a small phone: fold); its "Reply…" asks nothing (text null) and opens the sheet to
  // type in.
  function askRow(c, chips, about) {
    if (!U.notes || typeof c.opts.ask !== 'function') return null;
    return U.notes.reply({ chips: chips, compact: c.mode === 'review', onAsk: function (text, chip) { c.opts.ask(text, { chip: chip, about: about }); } });
  }

  // Put a panel in the foot, slide it up and bring it into view.
  function show(c, panel, focusEl) {
    c.setFoot(panel);
    c.foot.classList.add('qc-foot-fb');
    requestAnimationFrame(function () {
      reveal(c);
      if (focusEl) try { focusEl.focus({ preventScroll: true }); } catch (e) {}
    });
  }
  // Scroll towards the end of the card (where the panel sits in the flow), but never so far that
  // the question goes under the sticky bar: Dan should see the question, his answer and the
  // feedback together. scrollIntoView would not do: a docked (sticky) panel already counts as
  // visible while it covers the answer. A docked panel may cover a sliver of the answers (they are
  // marked, and the panel names the right one), never most of them: then it joins the flow below
  // them and peeks in at the bottom of the screen. A panel in the flow shows at least its start;
  // when the question cannot stay as well, the panel wins. A panel taller than most of the screen
  // never docks, so the answer above stays reachable; one held under the bar instead (a laptop
  // target card's column, 40-review.css) lets go only when it cannot fit below the bar. Either way
  // a panel never starts under the bar: one that would (beside a question Dan has scrolled past,
  // or one that has just let go) comes down to just under it.
  //   o.noScroll  only re-check the docking     o.end  bring the panel's end (the grades) into view
  function reveal(c, o) {
    o = o || {};
    var vh = window.innerHeight, panel = c.foot.firstChild;
    var fs = getComputedStyle(c.foot), under = fs.position === 'sticky' ? parseFloat(fs.top) : NaN;
    if (panel && !o.noScroll && !o.end && fs.position === 'sticky' && !(under >= 0)) fold(c, panel);
    if (panel && panel.offsetHeight > (under >= 0 ? vh - under - 16 : vh * 0.62)) c.foot.classList.add('qc-unstick');
    if (o.noScroll) return;
    var docked = function () { return getComputedStyle(c.foot).position === 'sticky'; };
    // Where the bar's bottom edge sits once it has stuck (it rides a little lower before that).
    var bar = document.querySelector('.rv-top, .lsn-bar');
    var top = bar ? (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight : 0;
    var over = c.el.getBoundingClientRect().bottom - vh + 8;
    if (!o.end || docked()) {
      var q = c.el.querySelector('.qc-q');
      var keep = q ? q.getBoundingClientRect().top - top - 12 : over;
      // How much of the answers a docked panel would hide once the question is under the bar. (A
      // target card's answer is the interactive, already read: its panel may stay docked over it.)
      var hidden = panel && c.type !== 'target' && over > keep && docked() ? c.body.getBoundingClientRect().bottom - keep - (vh - panel.offsetHeight) : 0;
      if (hidden > 64) c.foot.classList.add('qc-unstick');
      var p = panel && !docked() && panel.getBoundingClientRect();
      over = p && p.top + Math.min(p.height, 120) - vh + 8 > keep ? Math.min(over, p.top - top - 12) : Math.min(over, keep);
    }
    // Dan asked for the grades (Change, or a grade): a panel in the flow, even one that has just
    // left the dock because the grades made it taller, shows its end and Continue, though the
    // question may scroll away for them. (The panel's own end: beside a tall interactive on a
    // laptop, the card's end is further down.)
    var end = o.end && !docked();
    if (end) over = c.foot.getBoundingClientRect().bottom - vh + 8;
    // Where the panel starts, from the foot (the panel itself is still sliding up). Docked, it stays
    // put as the page scrolls; held under the bar it can be pushed up by the card's end. In the
    // flow it moves with the page: no further than keeps its start in view, unless its end was
    // asked for and it is too tall to show both.
    var start = panel ? c.foot.getBoundingClientRect().top - top - 12 : Infinity;
    if (docked()) over = start < 0 ? start : Math.max(over, 0);
    else if (!end || over <= start) over = Math.min(Math.max(over, 0), start);
    if (Math.abs(over) >= 1) try { window.scrollBy({ top: over, behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (e) { window.scrollBy(0, over); }
  }
  // A review's panel on a small phone: when it does not dock with its row of reply chips, the row
  // folds into its "Reply…" chip beside Continue (.is-folded). Then the panel docks and Continue
  // shows as they did before Claude's notes; or, too tall to dock either way, it joins the flow
  // with Continue no further down than before them. Ask Claude, which "Reply…" opens, has its own
  // starter questions. A panel that docks with its row keeps the row.
  function fold(c, panel) {
    var row = panel.querySelector('.note-reply.is-compact');
    if (!row || row.parentNode !== panel || panel.classList.contains('is-folded') || dockable(c, panel)) return;
    panel.classList.add('is-folded');
  }
  // reveal()'s two rules for a panel docked at the foot: it takes at most 62% of the screen, and
  // once the question is under the bar it hides no more than a sliver (64 px) of the answers.
  function dockable(c, panel) {
    var vh = window.innerHeight, ph = panel.offsetHeight;
    if (ph > vh * 0.62) return false;
    var bar = document.querySelector('.rv-top, .lsn-bar');
    var top = bar ? (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight : 0;
    var q = c.el.querySelector('.qc-q'), over = c.el.getBoundingClientRect().bottom - vh + 8;
    var keep = q ? q.getBoundingClientRect().top - top - 12 : over;
    return c.type === 'target' || over <= keep || c.body.getBoundingClientRect().bottom - keep - (vh - ph) <= 64;
  }

  function unavailable(c, text) {
    c.body.appendChild(h('div', { class: 'notice qc-unavailable' }, h('p', null, text)));
    c.setFoot(h('button', { class: 'btn wide secondary qc-continue', type: 'button', on: { click: function () {
      c.finish({ correct: null, grade: null, answer: null, skipped: true });
    } } }, 'Skip this one'));
  }

  // ---------- choice ----------
  function choice(c) {
    var s = c.spec, options = (s.options || []).map(String), answer = num(s.answer, 0), picked = null;
    var order = U.shuffle(options.map(function (_, i) { return i; }), U.hash(String(c.card.id) + '|' + (s.q || '')));
    var check = primary('Check', function () {
      if (picked == null || c.locked) return;
      c.locked = true;
      c.answered();
      var correct = picked === answer;
      btns.forEach(function (b) {
        var i = Number(b.dataset.i);
        b.disabled = true;
        if (i === answer) { b.classList.add('correct'); b.appendChild(mark('tick', 'good')); }
        else if (i === picked) { b.classList.add('wrong'); b.appendChild(mark('close', 'bad')); }
        else b.classList.add('qc-dim');
      });
      var mis = !correct && s.misconception && s.misconception[picked];
      var parts = [];
      if (mis) parts.push(h('div', { class: 'qc-mis' }, label('A common mix-up', 'bad'), richBlock('qc-prose', toYou(mis))));
      if (!correct) parts.push(h('p', { class: 'qc-answer' }, 'The answer: ', inline('strong', null, options[answer])));
      parts.push(why(s.why));
      if (c.extra) parts.push(c.extra());
      feedback(c, {
        correct: correct, title: correct ? RIGHT[U.hash(c.card.id) % RIGHT.length] : 'Not quite',
        parts: parts, grade: autoGrade(c, correct), result: { answer: picked },
        about: { picked: options[picked], answer: options[answer] },
      });
    });
    check.disabled = true;
    var btns = order.map(function (i) {
      var b = h('button', { class: 'option qc-opt', type: 'button', 'aria-pressed': 'false', dataset: { i: i }, on: { click: function () {
        if (c.locked) return;
        picked = i;
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        check.disabled = false;
      } } }, inline('span', 'qc-opt-text', options[i]));
      return b;
    });
    c.body.appendChild(h('div', { class: 'options qc-options', role: 'group', 'aria-label': 'Answers' }, btns));
    c.setFoot(check);
  }

  // ---------- order ----------
  function order(c) {
    var s = c.spec, items = (s.items || []).map(String), n = items.length, seq = [];
    var idx = U.shuffle(items.map(function (_, i) { return i; }), U.hash(String(c.card.id) + '|' + (s.q || '')));
    if (n > 1 && idx.every(function (v, i) { return v === i; })) idx.push(idx.shift());
    var seqList = h('ol', { class: 'qc-seq', 'aria-label': 'Your order' });
    var poolHead = label('Tap the one that comes first');
    var pool = h('div', { class: 'qc-pool', role: 'group', 'aria-label': 'Items left to place' });
    var undo = h('button', { class: 'btn ghost small qc-undo', type: 'button', on: { click: function () { seq.pop(); draw(); if (undo.disabled) refocus(); } } }, 'Undo');
    var check = primary('Check my order', function () {
      if (seq.length !== n || c.locked) return;
      c.locked = true;
      c.answered();
      var wrongAt = seq.map(function (oi, pos) { return oi !== pos; });
      var correct = wrongAt.every(function (w) { return !w; });
      U.clear(seqList);
      seq.forEach(function (oi, pos) {
        seqList.appendChild(h('li', { class: 'qc-step ' + (wrongAt[pos] ? 'wrong' : 'correct') },
          h('span', { class: 'qc-num' }, String(pos + 1)),
          inline('span', 'qc-step-text', items[oi]),
          wrongAt[pos] ? mark('close', 'bad') : mark('tick', 'good')));
      });
      undo.remove();
      var parts = [];
      if (!correct) {
        var right = h('ol', { class: 'qc-right-order' });
        items.forEach(function (text, i) {
          var had = seq.indexOf(i);
          right.appendChild(h('li', { class: had === i ? 'ok' : 'moved' },
            h('span', { class: 'qc-num' }, String(i + 1)),
            h('span', { class: 'qc-step-text' }, U.inline(h('span'), text),
              had !== i ? h('span', { class: 'qc-had' }, ' You put it ' + ordinal(had + 1) + '.') : null)));
        });
        parts.push(label('The right order'), right);
      }
      parts.push(why(s.why));
      feedback(c, {
        correct: correct, title: correct ? RIGHT[U.hash(c.card.id) % RIGHT.length] : 'Not quite',
        parts: parts, grade: autoGrade(c, correct), result: { answer: seq.slice() },
      });
    });
    function draw() {
      U.clear(seqList);
      seq.forEach(function (oi, pos) {
        seqList.appendChild(h('li', { class: 'qc-step' },
          h('button', { class: 'qc-step-btn', type: 'button', 'aria-label': 'Remove: ' + U.plain(items[oi]), on: { click: function () { seq.splice(pos, 1); draw(); refocus(); } } },
            h('span', { class: 'qc-num' }, String(pos + 1)), inline('span', 'qc-step-text', items[oi]))));
      });
      if (seq.length < n) seqList.appendChild(h('li', { class: 'qc-slot', 'aria-hidden': 'true' }, h('span', { class: 'qc-num' }, String(seq.length + 1)), h('span', null, '')));
      U.clear(pool);
      idx.forEach(function (oi) {
        if (seq.indexOf(oi) >= 0) return;
        pool.appendChild(h('button', { class: 'option qc-chip', type: 'button', on: { click: function () { if (!c.locked) { seq.push(oi); draw(); refocus(); } } } }, inline('span', null, items[oi])));
      });
      poolHead.textContent = seq.length ? 'Tap the one that comes next' : 'Tap the one that comes first';
      poolHead.hidden = pool.hidden = seq.length === n;
      undo.disabled = !seq.length;
      check.disabled = seq.length !== n;
    }
    // Drawing again replaces the button that was pressed: focus goes on to the next item to
    // place, or to Check once every item is placed (never left on the page itself).
    function refocus() {
      var next = pool.hidden ? check : pool.querySelector('.qc-chip');
      if (next && !next.disabled) try { next.focus({ preventScroll: true }); } catch (e) { /* fine */ }
    }
    c.body.appendChild(h('div', { class: 'qc-order' }, seqList, h('div', { class: 'qc-order-tools' }, undo), poolHead, pool));
    c.setFoot(check);
    draw();
  }

  // ---------- estimate ----------
  function estimate(c) {
    var s = c.spec, unit = s.unit || '';
    var min = num(s.min, 0), max = num(s.max, 100), ans = num(s.answer, (min + max) / 2), tol = Math.abs(num(s.tolerance, 0));
    if (!(max > min)) max = min + 1;
    var log = !!s.log && min > 0;
    var step = niceStep((max - min) / 200);
    if (!log && tol > 0 && step > tol) step = niceStep(tol, true);
    // On a log scale values snap to 2 significant figures, but never to a step wider than the
    // tolerance: every answer that counts as right can be reached.
    var tolStep = tol > 0 ? niceStep(tol, true) : Infinity;
    function unitAt(v) { return log ? Math.min(Math.pow(10, Math.floor(Math.log10(Math.abs(v) || min)) - 1), tolStep) : step; }
    // Slider positions: enough that each one moves by less than a snap step near the answer.
    var N = 1000;
    if (log && tol > 0) N = Math.ceil(1.05 * Math.log(max / min) / Math.log(1 + unitAt(ans) / Math.max(ans, min)));
    else if (!log) N = Math.ceil((max - min) / step);
    N = Math.min(10000, Math.max(1000, N || 1000));
    var dec = log ? null : decimalsFor(step);
    function toPos(v) { v = clamp(v, min, max); return log ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min); }
    function fromPos(p) { return log ? min * Math.pow(max / min, p) : min + p * (max - min); }
    function onGrid(v, u) { return Number((Math.round(v / u) * u).toFixed(decimalsFor(u))); }
    function snap(v) { v = clamp(v, min, max); return log ? clamp(onGrid(v, unitAt(v)), min, max) : clamp(onGrid(v - min, step) + min, min, max); }
    function disp(v) { return fmt(v, log ? decimalsFor(unitAt(v)) : dec); }
    function nudge(dir) {
      if (log) {
        var u = unitAt(dir < 0 ? value * 0.9999 : value);
        set(clamp((Math.round(value / u) + dir) * u, min, max));
      } else set(value + dir * step);
      touched();
    }
    var value = snap(fromPos(0.5)), moved = false;
    var out = h('output', { class: 'qc-est-value', 'aria-live': 'polite' });
    var range = h('input', { class: 'qc-range', type: 'range', min: '0', max: String(N), step: '1', 'aria-label': 'Your estimate' });
    var band = h('i', { class: 'qc-band', hidden: true });
    var ansMark = h('i', { class: 'qc-ans', hidden: true });
    var ansTag = h('span', { class: 'qc-ans-tag', hidden: true });
    var wrap = h('div', { class: 'qc-track-wrap' }, h('div', { class: 'qc-track' }), band, ansMark, ansTag, range);
    var minus = h('button', { class: 'icon-btn qc-nudge', type: 'button', 'aria-label': 'A little less', on: { click: function () { nudge(-1); } } }, '−');
    var plus = h('button', { class: 'icon-btn qc-nudge', type: 'button', 'aria-label': 'A little more', on: { click: function () { nudge(1); } } }, '+');
    var lock = primary('Lock it in', function () {
      if (c.locked) return;
      c.locked = true;
      c.answered();
      range.disabled = minus.disabled = plus.disabled = true;
      var correct = Math.abs(value - ans) <= tol + Math.abs(ans) * 1e-9 + 1e-12;
      var lo = Math.max(min, ans - tol), hi = Math.min(max, ans + tol);
      place(band, toPos(lo), toPos(hi));
      place(ansMark, toPos(ans));
      place(ansTag, toPos(ans));
      ansTag.style.transform = 'translateX(' + (-clamp(toPos(ans) * 100, 6, 94)) + '%)';
      ansTag.textContent = 'Answer ' + disp(ans);
      band.hidden = ansMark.hidden = ansTag.hidden = false;
      wrap.classList.add(correct ? 'is-right' : 'is-wrong');
      hint.textContent = 'The shaded band is close enough; the line is the answer.';
      var range2 = tol > 0 ? ' Anything from ' + withUnit(disp(lo), unit) + ' to ' + withUnit(disp(hi), unit) + ' counts.' : '';
      feedback(c, {
        correct: correct,
        title: correct ? (Math.abs(value - ans) <= tol / 4 ? 'Spot on' : 'Close enough, well judged') : 'Not quite',
        parts: [h('p', { class: 'qc-answer' }, 'You said ' + withUnit(disp(value), unit) + '. The answer is ', h('strong', null, withUnit(disp(ans), unit)), '.' + range2), why(s.why)],
        grade: autoGrade(c, correct), result: { answer: value },
      });
    });
    lock.disabled = true;
    function place(elm, a, b) {
      var T = 'var(--qc-thumb)';
      elm.style.left = 'calc(' + T + ' / 2 + ' + a + ' * (100% - ' + T + '))';
      if (b != null) elm.style.width = 'calc(' + Math.max(0, b - a) + ' * (100% - ' + T + '))';
    }
    function set(v) {
      value = snap(v);
      range.value = String(Math.round(toPos(value) * N));
      U.clear(out).appendChild(h('span', { class: 'qc-est-num' }, disp(value)));
      if (unit) out.appendChild(h('span', { class: 'qc-est-unit' }, ' ' + unit));
      range.setAttribute('aria-valuetext', withUnit(disp(value), unit));
    }
    function touched() { if (!moved) { moved = true; lock.disabled = false; hint.textContent = 'Happy with that? Lock it in.'; } }
    range.addEventListener('input', function () { set(fromPos(Number(range.value) / N)); touched(); });
    var hint = h('p', { class: 'qc-tip muted small' }, log ? 'Drag to your best guess. The scale stretches: each step along multiplies the number.' : 'Drag to your best guess.');
    var scale = h('div', { class: 'qc-scale', 'aria-hidden': 'true' },
      h('span', null, withUnit(disp(min), unit)),
      log ? h('span', null, disp(snap(fromPos(0.5)))) : null,
      h('span', null, withUnit(disp(max), unit)));
    set(value);
    c.body.appendChild(h('div', { class: 'qc-est' }, h('div', { class: 'qc-est-row' }, minus, out, plus), wrap, scale, hint));
    c.setFoot(lock);
  }

  // ---------- target (the lesson's own interactive grades it) ----------
  function interactiveOf(l) {
    if (!l) return null;
    if (l.interactive && typeof l.interactive.html === 'string' && l.interactive.html) return l.interactive;
    if (typeof l.html === 'string' && l.html) return l;
    return null;
  }
  function controlOf(l, id) {
    var lj = l && (l.lesson || l), list = (lj && lj.interactive && lj.interactive.controls) || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return null;
  }
  // The readout a target check reads: its label and unit say what the number is ("Time for one
  // swing", "s"). Lessons older than declared readouts have none; then the number stands alone.
  function outputOf(l, id) {
    var lj = l && (l.lesson || l), list = (lj && lj.interactive && lj.interactive.outputs) || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return null;
  }
  function target(c) {
    var s = c.spec, it = interactiveOf(c.opts.lesson);
    if (!it || !U.sandbox || typeof U.sandbox.mount !== 'function') {
      unavailable(c, 'The interactive this question uses is not available right now, so this one is skipped.');
      return;
    }
    var goal = num(s.target, 0), tol = Math.abs(num(s.tolerance, 0)), ctl = controlOf(c.opts.lesson, s.control);
    var out = outputOf(c.opts.lesson, s.output), name = out && out.label ? String(out.label) : '', unit = out && out.unit ? String(out.unit) : '';
    var dp = out && out.decimals >= 0 && out.decimals <= 6 ? Math.round(out.decimals) : null;
    var tries = 0, fails = 0, api = null, skip = null;
    // Every number says what it is: "make Time for one swing read 3 s (give or take 0.05 s)".
    function amount(v, d) { return withUnit(fmt(v, d), unit); }
    var within = tol ? ' (give or take ' + amount(tol) + ')' : '';
    var goalNum = h('strong', { class: 'qc-goal-num' }, amount(goal));
    var goalLine = h('p', { class: 'qc-goal' },
      ctl ? 'Use the ' : null, ctl ? h('strong', null, ctl.label || ctl.id) : null,
      name ? [ctl ? ' control to make ' : 'Make ', h('strong', null, name), ' read '] : [ctl ? ' control. ' : '', 'Aim for a reading of '],
      goalNum, within, '.');
    var stage = h('div', { class: 'qc-stage' });
    var hintBox = h('div', { class: 'qc-hint', role: 'status', hidden: true });
    c.body.append(goalLine, stage);
    var btn = primary('Check my setting', check);
    btn.disabled = true;
    // The goal again beside the button: the interactive can be taller than the screen. In a laptop
    // review the button sits beside the goal sentence (or docks under the interactive on the same
    // screen), so there the aim shows only once the goal's number has left the screen
    // (.qc-goal-away, 40-review.css, which brings it in under Check): the same instruction never
    // shows twice at once.
    var aim = h('p', { class: 'qc-aim muted small' }, name ? name + ': aim for ' : 'Aim for ', h('strong', null, amount(goal)), within);
    c.setFoot([hintBox, aim, btn]);
    if (c.mode === 'review') watchGoal();
    function watchGoal() {
      var raf = 0;
      function seen() {
        raf = 0;
        if (!goalLine.isConnected) return;
        var bar = document.querySelector('.rv-top'), n = goalNum.getBoundingClientRect();
        // The number has left only once most of it is under the bar: with just its top edge
        // covered it still reads. (Its box runs below the digits, so under 40% of the box showing
        // is about a third of the digits.)
        var on = n.bottom - (bar ? bar.getBoundingClientRect().bottom : 0) > n.height * 0.4 && goalLine.getBoundingClientRect().bottom <= window.innerHeight + 1;
        c.el.classList.toggle('qc-goal-away', !on);
      }
      function soon() { if (!raf) raf = requestAnimationFrame(seen); }
      window.addEventListener('scroll', soon, { passive: true });
      window.addEventListener('resize', soon);
      c.cleanups.push(function () {
        window.removeEventListener('scroll', soon);
        window.removeEventListener('resize', soon);
        if (raf) cancelAnimationFrame(raf);
      });
      soon();
    }
    function enable() { if (!c.locked) btn.disabled = false; }
    try {
      api = U.sandbox.mount(stage, {
        html: it.html, title: it.title || 'Interactive', minHeight: 280,
        // Quiz mode (contract Q): the readout he aims at shows "?" and the .say line is hidden
        // while he answers, so he steers by the picture and the rule, not by scrubbing until the
        // number matches. Check ends it (reveal); grading reads the real outputs either way.
        quiz: s.output != null && s.output !== '' ? { hide: String(s.output) } : undefined,
        onError: function (msg) { console.warn('interactive error', msg); },
        // Only a K.stage that sets its controls beside the visual gains from a laptop's full
        // width (40-review.css); any other interactive keeps the answers' column.
        onReady: function (checks, info) { c.el.classList.toggle('qc-wide', !!(info && info.beside)); },
      });
    } catch (e) {
      console.error(e);
      U.clear(stage);
      unavailable(c, 'The interactive could not start, so this one is skipped.');
      return;
    }
    // The lesson tells Ask Claude where this copy's controls are set while it is on screen.
    c.el.mount = api;
    c.cleanups.push(function () { c.el.mount = null; if (api && api.destroy) api.destroy(); });
    Promise.resolve(api && api.ready).then(enable, enable);
    setTimeout(enable, 6000);

    function check() {
      if (c.locked) return;
      btn.disabled = true;
      btn.textContent = 'Reading the interactive…';
      // His answer is in: the hidden readout and the .say line show again.
      try { if (api && typeof api.reveal === 'function') api.reveal(); } catch (e) { console.warn('reveal', e); }
      var timer;
      Promise.race([
        Promise.resolve().then(function () { return api.get(); }),
        new Promise(function (_, rej) { timer = setTimeout(function () { rej(new Error('timeout')); }, 6000); }),
      ]).then(function (state) {
        clearTimeout(timer);
        var v = Number(state && state.outputs && state.outputs[s.output]);
        if (!isFinite(v)) throw new Error('no reading');
        tries++;
        var ok = Math.abs(v - goal) <= tol + Math.abs(goal) * 1e-9 + 1e-12;
        if (!ok && tries === 1) {
          hintBox.hidden = false;
          U.clear(hintBox).append(label('Not yet', 'bad'), h('p', null,
            (name || 'It') + ' reads ', h('strong', null, amount(v, dp)), ' and you are aiming for ', h('strong', null, amount(goal)), '. ',
            v < goal ? 'Try a setting that pushes the reading higher.' : 'Try a setting that brings the reading lower.'));
          btn.textContent = 'Check again';
          btn.disabled = false;
          U.haptic([8, 50, 8]);
          return;
        }
        c.locked = true;
        c.answered();
        feedback(c, {
          correct: ok,
          title: ok ? (tries === 1 ? RIGHT[U.hash(c.card.id) % RIGHT.length] : 'Got it on the second go') : 'Not quite',
          parts: [ok ? null : h('p', { class: 'qc-answer' }, (name || 'It') + ' read ' + amount(v, dp) + '; the target was ' + amount(goal) + (tol ? ', give or take ' + amount(tol) : '') + '.'), why(s.why)],
          grade: autoGrade(c, ok, { hinted: tries > 1, noEasy: true }), result: { answer: v, tries: tries },
        });
      }).catch(function (e) {
        clearTimeout(timer);
        if (c.done) return;
        console.warn('target check failed', e);
        fails++;
        hintBox.hidden = false;
        U.clear(hintBox).append(label('No reading', 'bad'), h('p', null, fails < 2
          ? 'The interactive did not give a reading. Move the control a little and check again.'
          : 'The interactive is still not giving a reading, so this one cannot be checked right now. You can skip it.'));
        btn.textContent = 'Check again';
        btn.disabled = false;
        // After a second failed reading there is a way out (in review the card is then retired).
        if (fails >= 2 && !skip) {
          skip = h('button', { class: 'btn wide secondary qc-skip', type: 'button', on: { click: function () {
            if (c.done) return;
            c.locked = true;
            c.finish({ correct: null, grade: null, answer: null, skipped: true, reason: 'no-reading' });
          } } }, 'Skip this one');
          c.foot.appendChild(skip);
          requestAnimationFrame(function () { try { skip.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (e) { /* fine */ } });
        }
      });
    }
  }

  // ---------- recall (say it back, graded by Claude in the background) ----------
  // Claude's verdict as a review grade: got it = Good, partly = Hard, not yet = Again. A recall is
  // the hardest kind of card, so Claude never awards Easy; Dan can, with "Change".
  function verdictGrade(r) {
    var v = VERDICT[r && r.verdict];
    return v ? v.grade : null;
  }
  // A written card (a refresher lesson's Section B question, lesson.written[id]: {q, points:[{text,
  // cite}], need, model}) runs the same way, marked by U.gen.markWritten against its points as the
  // lesson marks it. When Claude cannot mark it, the points become a checklist Dan ticks himself
  // (as the lesson's own fallback does) and his ticks suggest the grade: as many as the question
  // needs, Good; some, Hard; none, Again.
  function pointsOf(s) {
    return (Array.isArray(s.points) ? s.points : []).map(function (p) { return p && typeof p === 'object' ? String(p.text || '') : String(p || ''); }).filter(Boolean);
  }
  function recall(c) {
    var s = c.spec, isWritten = c.type === 'written';
    var rubric = isWritten ? pointsOf(s) : Array.isArray(s.rubric) ? s.rubric : [];
    var need = isWritten && Number.isInteger(s.need) && s.need > 0 && s.need < rubric.length ? s.need : rubric.length;
    var ta = h('textarea', { class: 'textarea qc-recall-input', rows: '5', maxlength: '3000', placeholder: isWritten ? 'Write your answer…' : 'Explain it in your own words…', 'aria-label': 'Your answer' });
    var tip = h('p', { class: 'qc-tip muted small' }, 'Tip: tap the microphone on your keyboard to say it out loud instead of typing.');
    c.body.append(ta, tip);
    var submitBtn = primary('Check my answer', submit);
    submitBtn.disabled = true;
    ta.addEventListener('input', function () { submitBtn.disabled = ta.value.trim().length < 3; });
    c.setFoot(submitBtn);
    if (finePointer()) setTimeout(function () { if (!c.done) try { ta.focus({ preventScroll: true }); } catch (e) {} }, 80);

    function submit() {
      var answer = ta.value.trim();
      if (answer.length < 3 || c.locked) return;
      c.locked = true;
      c.answered();
      ta.readOnly = true;
      ta.classList.add('qc-locked');
      tip.remove();

      var grading = isWritten
        ? (U.gen && typeof U.gen.markWritten === 'function' && rubric.length
          ? Promise.resolve().then(function () { return U.gen.markWritten({ q: s.q, points: s.points, need: s.need, model: s.model }, answer, 1, { title: s.title || '' }); })
          : null)
        : U.gen && typeof U.gen.grade === 'function'
          ? Promise.resolve().then(function () { return U.gen.grade({ prompt: s.prompt, rubric: rubric, model: s.model }, answer, 1); })
          : null;
      var graded = null, failed = !grading, picked = null, claudeGrade = null, ticks = rubric.map(function () { return false; }), ticking = false;

      var rubricLabel = null;
      var points = rubric.map(function (p) { return h('li', { class: 'qc-point' }, h('span', { class: 'qc-dot', 'aria-hidden': 'true' }), inline('span', null, p)); });
      // The self-tick fallback (written cards): each point a toggle he presses for what he covered.
      function selfGrade() { var n = ticks.filter(Boolean).length; return n >= need ? 3 : n > 0 ? 2 : 1; }
      function tickable() {
        if (ticking || !isWritten || !points.length) return;
        ticking = true;
        points.forEach(function (li, i) {
          var b = h('button', { class: 'qc-tick', type: 'button', role: 'checkbox', 'aria-checked': 'false', on: { click: function () {
            if (c.done) return;
            ticks[i] = !ticks[i];
            b.setAttribute('aria-checked', String(ticks[i]));
            li.classList.toggle('met', ticks[i]);
            var dot = li.querySelector('.qc-dot');
            U.clear(dot);
            if (ticks[i]) dot.appendChild(U.icon('tick'));
            refresh();
          } } });
          while (li.firstChild) b.appendChild(li.firstChild);
          li.appendChild(b);
          li.classList.add('is-tick');
        });
      }
      var status = h('div', { class: 'qc-claude', role: 'status' });
      var replySlot = h('div', { class: 'qc-reply-slot' });
      var panel = h('div', { class: 'qc-fb is-neutral qc-fb-recall' },
        h('div', { class: 'qc-fb-head' }, h('h3', null, 'Compare with a model answer')),
        richBlock('qc-model qc-prose', s.model),
        points.length ? h('div', { class: 'qc-rubric' }, rubricLabel = label(isWritten ? 'The points it is marked on' : 'A good answer covers'), h('ul', { class: 'qc-points' }, points)) : null,
        status, replySlot,
        c.mode === 'review' && s.mine ? h('details', { class: 'qc-mine' },
          h('summary', null, h('span', null, 'What you wrote when you learned it'), h('span', { class: 'qc-chev', 'aria-hidden': 'true' }, U.icon('back'))),
          h('p', null, String(s.mine))) : null);

      var picker = null, pickHint = null, pickNote = null, settleUntil = 0;
      // Taps that land just after Claude's grade arrived (the layout may have moved) are ignored.
      function steady() { return Date.now() >= settleUntil; }
      if (c.mode === 'review') {
        picker = gradePicker(c, null, function (g) { if (!steady()) { picker.set(picked || claudeGrade); return; } picked = g; refresh(); reveal(c, { end: true }); });
        pickHint = h('p', { class: 'qc-label' }, 'How well did you know it?');
        pickNote = h('p', { class: 'muted small qc-pick-note', hidden: true }, 'Claude\'s pick is marked. Change it if you disagree.');
        panel.append(pickHint, pickNote, picker.el);
      }
      var cont = h('button', { class: 'btn wide qc-continue', type: 'button', on: { click: function () { if (steady()) done(); } } }, 'Continue');
      panel.appendChild(cont);

      function drawStatus() {
        U.clear(status);
        if (graded) {
          var v = VERDICT[graded.verdict] || VERDICT.partly;
          if (U.notes) status.appendChild(U.notes.byline('claude', 'on your answer'));
          status.appendChild(h('p', { class: 'qc-verdict ' + v.cls }, v.cls === 'good' ? U.icon('tick') : null, v.text));
          if (!replySlot.firstChild) {
            var rep = askRow(c, ['What did I miss?', 'Give me an example'], { kind: 'say', text: answer, verdict: graded.verdict, followUp: graded.followUp || '' });
            if (rep) replySlot.appendChild(rep);
          }
          // The answer box is locked by now, so Claude's follow-up question is something to mull
          // over (the model answer above usually settles it), not a prompt to type again.
          if (graded.followUp) status.appendChild(h('div', { class: 'qc-follow' }, label('Something to think over'), richBlock('qc-prose', graded.followUp)));
        } else if (failed && isWritten && points.length) {
          tickable();
          if (rubricLabel) rubricLabel.textContent = 'Tick the points your answer covers';
          status.appendChild(h('p', { class: 'muted small' }, grading ? 'Claude could not mark this one just now. Tick the points you covered and your ticks set the grade.' : 'Tick the points you covered and your ticks set the grade.'));
        } else if (failed) {
          status.appendChild(h('p', { class: 'muted small' }, grading ? 'Claude could not check this one just now. Compare it yourself.' : 'Compare your answer with the model answer.'));
        } else {
          status.append(h('div', { class: 'working', 'aria-hidden': 'true' }), h('p', { class: 'muted small' }, 'Claude is reading your answer…'));
        }
      }
      function refresh() {
        drawStatus();
        if (!picker) return;
        var g = picked || claudeGrade || (ticking ? selfGrade() : null);
        picker.set(g);
        picker.btns.forEach(function (b) {
          var tag = b.querySelector('.qc-g-claude');
          if (Number(b.dataset.g) === claudeGrade && !tag) b.appendChild(h('span', { class: 'qc-g-claude', 'aria-label': ', Claude\'s pick' }, 'Claude'));
        });
        // Continue needs a rating, unless Claude is still grading (then it finishes in the background).
        cont.disabled = !g && failed;
        cont.textContent = !g && !failed ? 'Continue, Claude will grade it' : 'Continue';
        pickNote.hidden = !(claudeGrade && !picked);
      }
      function done() {
        var g = picked || claudeGrade || (ticking ? selfGrade() : null);
        var base = { answer: answer, ms: c.ms };
        if (ticking) base.self = ticks.slice();
        if (c.mode !== 'review') {
          base.correct = graded ? graded.verdict === 'got-it' : null;
          base.grade = null;
          base.verdict = graded ? graded.verdict : null;
          if (!graded && !failed) base.pending = settle();
          return c.finish(base);
        }
        if (g) {
          base.grade = g;
          base.correct = graded ? graded.verdict === 'got-it' : g >= 3;
          base.verdict = graded ? graded.verdict : null;
          base.auto = claudeGrade;
          return c.finish(base);
        }
        base.grade = null;
        base.correct = null;
        base.pending = settle();
        c.finish(base);
      }
      // Resolves once Claude has graded. Falls back to Hard if grading fails or takes over 30 s,
      // so the card is always saved and comes back reasonably soon.
      var settled = null;
      function settle() {
        if (!settled) {
          var fallback = { grade: 2, correct: null, verdict: null, failed: true };
          settled = Promise.race([
            grading.then(function (r) {
              return { grade: verdictGrade(r) || 2, correct: !!(r && r.verdict === 'got-it'), verdict: r && r.verdict || null };
            }, function () { return fallback; }),
            new Promise(function (r) { setTimeout(function () { r(fallback); }, 30000); }),
          ]);
        }
        return settled;
      }

      if (grading) {
        grading.then(function (r) {
          graded = r && VERDICT[r.verdict] ? r : null;
          if (!graded) { failed = true; refresh(); return; }
          claudeGrade = verdictGrade(graded);
          settleUntil = Date.now() + 350;
          requestAnimationFrame(function () { if (!c.done) reveal(c, { noScroll: true }); });
          var met = Array.isArray(graded.met) ? graded.met : [];
          points.forEach(function (li, i) {
            if (met[i] == null) return;
            li.classList.add(met[i] ? 'met' : 'missed');
            var dot = li.querySelector('.qc-dot');
            U.clear(dot);
            if (met[i]) dot.appendChild(U.icon('tick'));
            li.setAttribute('aria-label', (met[i] ? 'Covered: ' : 'Missing: ') + U.plain(rubric[i]));
          });
          refresh();
        }, function (e) {
          console.warn('grading failed', e);
          failed = true;
          refresh();
        });
      }
      refresh();
      // The button pressed has gone with the box: focus goes to the panel's heading.
      var head = panel.querySelector('.qc-fb-head h3');
      head.setAttribute('tabindex', '-1');
      show(c, panel, head);
    }
  }

  // ---------- puzzle (a worked example from a ready-made steps lesson's guide) ----------
  // Typed answers are read as the kit's K.answer reads them (app/kit/REFRESHER.md): "13.33",
  // "13,33", "20 000", "1,000.5", "−4.2", "13.33 A". A unit after the number is optional, and when
  // one is typed it must be the answer's own ("ohms" for Ω, "u" for µ, "mm2" for mm² are fine).
  var PREFIX = '[pnµumckMG]?', BASE = '(?:A|V|W|Ω|F|H|Hz|s|m|g|t|L|l|J|N|Pa|VA|VAr|var|Wh|h|S|T|Wb|C|K|lx|lm|dB|bar|rad|rpm|min)';
  var UNIT = new RegExp('^(?:' + PREFIX + BASE + '(?:²|³)?(?:/' + PREFIX + '(?:s|m|h|min|A|V|W|Ω|g|L|K|°C)(?:²|³)?)?|%|°|°C|°F)$');
  function unitKey(u) {
    return String(u || '').replace(/\s+/g, '').replace(/μ/g, 'µ').replace(/Ω/g, 'Ω').replace(/ohms?$/i, 'Ω')
      .replace(/^u([A-Za-zΩ])/, 'µ$1').replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/([A-Za-z])2$/, '$1²').replace(/([A-Za-z])3$/, '$1³')
      .replace(/^deg(rees?)?$/i, '°').toLowerCase();
  }
  function readTyped(text, unit) {
    var str = String(text == null ? '' : text).replace(/[−‒–—]/g, '-').replace(/[  ]/g, ' ').trim();
    if (!str) return { empty: true };
    var m = /^([+-]?)\s*((?:\d[\d ,]*)?(?:\.\d*)?)\s*(.*)$/.exec(str);
    if (!m || !/\d/.test(m[2])) return { unreadable: true };
    var digits = m[2].trim(), rest = m[3].trim();
    if (rest && !/^[A-Za-zΩΩµμ°%²³\/·.^23 ]+$/.test(rest)) return { unreadable: true };
    if (rest && (!unit || unitKey(rest) !== unitKey(unit))) return { unreadable: true, unit: true };
    if (/^\d{1,3}( \d{3})+(\.\d*)?$/.test(digits)) digits = digits.replace(/ /g, '');
    if (/,/.test(digits)) {
      if (/^\d{1,3}(,\d{3})+(\.\d*)?$/.test(digits)) digits = digits.replace(/,/g, '');
      else if (/^\d+,\d+$/.test(digits)) digits = digits.replace(',', '.');
      else return { unreadable: true };
    }
    if (!/^(\d+\.?\d*|\.\d+)$/.test(digits)) return { unreadable: true };
    return { value: (m[1] === '-' ? -1 : 1) * parseFloat(digits) };
  }
  // An answer as the guide prints it, when it is a figure: a number and, at most, a unit
  // ("28.87 A", "1,000,000 mm²", "−3", "0.5 m") -> {value, decimals, unit}; anything else (a
  // fraction, a power, words, "about 2.8") -> null. decimals: the places shown (the course's rounding).
  function figureOf(answer) {
    var str = String(answer == null ? '' : answer).replace(/[−‒–—]/g, '-').replace(/[  ]/g, ' ').trim();
    var m = /^([+-]?\d[\d ,]*(?:\.\d+)?)\s*([^\s\d][^\s]*)?$/.exec(str);
    if (!m) return null;
    var num = m[1].trim(), unit = m[2] || '';
    if (unit && !UNIT.test(unit.replace(/μ/g, 'µ').replace(/Ω/g, 'Ω'))) return null;
    var r = readTyped(num, '');
    if (r.value == null) return null;
    var decimals = /\.(\d+)$/.test(num) ? num.split('.')[1].length : /^[+-]?\d+,\d{1,2}$/.test(num) ? num.split(',')[1].length : 0;
    return { value: r.value, decimals: decimals, unit: unit };
  }
  // -> {state: 'right'|'wrong'|'empty'|'unreadable', value?, unit?}: right within half a unit in
  // the last decimal the answer shows (the course's rounding).
  function gradeTyped(text, spec) {
    var f = figureOf(spec && spec.answer);
    if (!f) return { state: 'unreadable' };
    var r = readTyped(text, f.unit);
    if (r.empty) return { state: 'empty' };
    if (r.unreadable) return r.unit ? { state: 'unreadable', unit: true } : { state: 'unreadable' };
    var tol = 0.5 * Math.pow(10, -f.decimals);
    return { state: Math.abs(r.value - f.value) <= tol + 1e-9 * Math.max(1, Math.abs(f.value)) ? 'right' : 'wrong', value: r.value };
  }
  // The worked example's picture once solved (the guide's still step: an SVG as a plain image, or
  // still HTML in a sandboxed frame, 53-read.js), shown with the answer: before it, it would give
  // the answer away. None when the review could not read the guide.
  function solvedPicture(c) {
    var pg = c.opts.page, RT = U.readThrough;
    if (!pg || !RT) return null;
    if (pg.html && RT.stillHtml(pg.html, pg.style)) {
      var box = h('div', { class: 'rd-still qc-still' });
      requestAnimationFrame(function () {
        if (!box.isConnected || c.stillMounted) return;
        c.stillMounted = true;
        var m = RT.still(box, pg.html, pg.style);
        if (m) c.cleanups.push(function () { try { m.destroy(); } catch (e) { /* gone */ } });
      });
      return h('div', { class: 'qc-pic' }, label('Worked through'), box);
    }
    var src = RT.pic(pg.svg);
    return src ? h('div', { class: 'qc-pic' }, label('Worked through'), h('div', { class: 'rd-well' }, h('img', { class: 'rd-pic', src: src, alt: String(pg.alt || ''), decoding: 'async' }))) : null;
  }
  function puzzle(c) {
    var s = c.spec, options = Array.isArray(s.options) ? s.options.map(String) : [], at = options.indexOf(String(s.answer));
    c.extra = function () { return solvedPicture(c); };
    if (s.input === 'pick' && options.length >= 2 && at >= 0) {
      c.spec = { q: s.q, options: options, answer: at, why: s.why };
      return choice(c);
    }
    if (!figureOf(s.answer)) { unavailable(c, 'This puzzle cannot be answered here, so it is skipped.'); return; }
    typed(c);
  }
  function typed(c) {
    var s = c.spec, f = figureOf(s.answer), unit = f.unit;
    c.typed = true;
    var msg = h('p', { class: 'qc-typed-msg muted small', id: U.id('qcmsg'), 'aria-live': 'polite' });
    var input = h('input', { class: 'input qc-typed-input', type: 'text', inputmode: 'decimal', enterkeyhint: 'done', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', maxlength: '40',
      'aria-label': 'Your answer' + (unit ? ', in ' + unit : ''), 'aria-describedby': msg.id });
    var check = primary('Check', submit);
    check.disabled = true;
    input.addEventListener('input', function () { check.disabled = !input.value.trim(); msg.textContent = ''; });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    var box = h('div', { class: 'qc-typed' }, h('div', { class: 'qc-typed-row' }, input, unit ? h('span', { class: 'qc-typed-unit', 'aria-hidden': 'true' }, unit) : null), msg);
    c.body.appendChild(box);
    c.setFoot(check);
    if (finePointer()) setTimeout(function () { if (!c.done) try { input.focus({ preventScroll: true }); } catch (e) {} }, 80);
    function submit() {
      if (c.locked) return;
      var r = gradeTyped(input.value, s);
      if (r.state === 'empty') { msg.textContent = 'Type your answer first.'; return; }
      if (r.state === 'unreadable') { msg.textContent = r.unit ? (unit ? 'Type the number in ' + unit + '.' : 'Type just the number.') : 'Type a number, like ' + (f.value < 0 ? '−' : '') + '12.5' + (unit ? ' ' + unit : '') + '.'; return; }
      c.locked = true;
      c.answered();
      input.readOnly = true;
      check.disabled = true;
      var correct = r.state === 'right', said = input.value.trim();
      box.classList.add(correct ? 'is-right' : 'is-wrong');
      var parts = [];
      if (!correct) parts.push(h('p', { class: 'qc-answer' }, 'You said ' + said + '. The answer: ', inline('strong', null, String(s.answer)), '.'));
      parts.push(why(s.why));
      parts.push(c.extra());
      feedback(c, {
        correct: correct, title: correct ? RIGHT[U.hash(c.card.id) % RIGHT.length] : 'Not quite',
        parts: parts, grade: autoGrade(c, correct), result: { answer: said },
        about: { picked: said, answer: String(s.answer) },
      });
    }
  }

  var TYPES = { choice: choice, order: order, estimate: estimate, target: target, recall: recall, puzzle: puzzle, written: recall };

  U.cards = {
    types: Object.keys(TYPES),
    render: function (card, opts) {
      opts = opts || {};
      card = card || {};
      var c = shell(card, opts);
      var build = TYPES[c.type];
      if (!build) unavailable(c, 'This kind of question is not supported yet, so it is skipped.');
      else {
        try { build(c); }
        catch (e) {
          console.error(e);
          U.clear(c.body);
          unavailable(c, 'This question could not be shown, so it is skipped.');
        }
      }
      return c.el;
    },
    interactiveOf: interactiveOf,
    controlOf: controlOf,
    outputOf: outputOf,
    verdictGrade: verdictGrade,
    figureOf: figureOf,
    gradeTyped: gradeTyped,
  };
})();
