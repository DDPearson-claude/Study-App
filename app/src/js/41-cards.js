// Check and review cards: one interactive question per card (docs/ARCHITECTURE.md sections 5, 8, 9).
//
//   U.cards.render(card, {mode, lesson, onDone}) -> Element
//     card   {id, type, spec, s?}   type: choice | order | estimate | target | recall
//            In a lesson the player passes {id, type, spec: <the Check object>}; in review it is a
//            stored Card (with its FSRS state `s`, used for "back in N days" hints).
//     mode   'lesson' (no rating) | 'review' (objective cards auto-grade, Dan can override)
//     lesson the lesson doc (topics/{tid}/lessons/{iid}); needed only by 'target' cards, which mount
//            its interactive
//     onDone(result) once Dan taps Continue:
//            {correct: bool|null, grade: 1-4|null, answer, ms}
//            + auto (review, the grade the app picked), verdict (recall), skipped (card unusable),
//            + pending: Promise<{grade, correct, verdict}> when a recall answer is still being graded
//   The returned element has destroy(): call it when the card leaves the screen (stops a mounted
//   interactive).
//
// Flow on every card: answer -> a feedback panel slides up (green tick only when right; red plus
// the misconception when a wrong option has one; always the why) -> Continue.
(function () {
  var h = U.h;
  var GRADES = [{ g: 1, label: 'Again' }, { g: 2, label: 'Hard' }, { g: 3, label: 'Good' }, { g: 4, label: 'Easy' }];
  var KIND = {
    choice: 'Choose one', order: 'Put these in order', estimate: 'Make an estimate',
    target: 'Hit the target', recall: 'In your own words',
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
  function withUnit(text, unit) { return unit ? text + ' ' + unit : text; }
  function primary(text, onClick) { return h('button', { class: 'btn wide qc-primary', type: 'button', on: { click: onClick } }, text); }
  function richBlock(cls, text) { return h('div', { class: cls }, U.rich(String(text || ''))); }
  function why(text) { return text ? h('div', { class: 'qc-why' }, label('Why'), richBlock('qc-prose', text)) : null; }

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
    var day = U.today(), p = U.fsrs.preview(c.card.s || U.fsrs.init(day), day, c.card.id), out = {};
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
    var base = c.type === 'order' ? 4000 + 1000 * (s.items || []).length : c.type === 'estimate' ? 5000 : 2500;
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
    var right = o.correct === true, wrong = o.correct === false;
    var panel = h('div', { class: 'qc-fb ' + (right ? 'is-right' : wrong ? 'is-wrong' : 'is-neutral'), role: 'status' });
    panel.appendChild(h('div', { class: 'qc-fb-head' },
      right ? h('span', { class: 'qc-fb-icon good', 'aria-hidden': 'true' }, U.icon('tick')) : null,
      wrong ? h('span', { class: 'qc-fb-icon bad', 'aria-hidden': 'true' }, U.icon('close')) : null,
      h('h3', null, o.title)));
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
        reveal(c);
      } } }, 'Change');
      var drawLine = function () {
        U.clear(line);
        var name = GRADES[chosen - 1].label;
        line.appendChild(h('span', null, days ? 'Marked ' + name + ' · back ' + inDays(days[chosen]) : 'Marked ' + name));
      };
      drawLine();
      panel.appendChild(h('div', { class: 'qc-grade' }, h('div', { class: 'qc-grade-row' }, line, change), picker.el));
    }
    var cont = h('button', { class: 'btn wide qc-continue', type: 'button', on: { click: function () {
      var r = Object.assign({}, o.result);
      r.correct = o.correct;
      r.grade = c.mode === 'review' ? chosen : null;
      if (c.mode === 'review') r.auto = o.grade;
      c.finish(r);
    } } }, 'Continue');
    panel.appendChild(cont);
    show(c, panel, cont);
    U.haptic(right ? 12 : [8, 50, 8]);
    return panel;
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
  // Scroll so the end of the card (where the panel sits in the flow) is on screen. scrollIntoView
  // would not do: a docked (sticky) panel already counts as visible while it covers the answer.
  // A panel taller than most of the screen stops docking, so the answer above stays reachable.
  function reveal(c, noScroll) {
    var panel = c.foot.firstChild;
    if (panel && panel.offsetHeight > window.innerHeight * 0.62) c.foot.classList.add('qc-unstick');
    if (noScroll) return;
    var over = c.el.getBoundingClientRect().bottom - window.innerHeight + 8;
    if (over > 0) try { window.scrollBy({ top: over, behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (e) { window.scrollBy(0, over); }
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
      if (mis) parts.push(h('div', { class: 'qc-mis' }, label('A common mix-up', 'bad'), richBlock('qc-prose', mis)));
      if (!correct) parts.push(h('p', { class: 'qc-answer' }, 'The answer: ', inline('strong', null, options[answer])));
      parts.push(why(s.why));
      feedback(c, {
        correct: correct, title: correct ? RIGHT[U.hash(c.card.id) % RIGHT.length] : 'Not quite',
        parts: parts, grade: autoGrade(c, correct), result: { answer: picked },
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
    var undo = h('button', { class: 'btn ghost small qc-undo', type: 'button', on: { click: function () { seq.pop(); draw(); } } }, 'Undo');
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
          h('button', { class: 'qc-step-btn', type: 'button', 'aria-label': 'Remove: ' + U.plain(items[oi]), on: { click: function () { seq.splice(pos, 1); draw(); } } },
            h('span', { class: 'qc-num' }, String(pos + 1)), inline('span', 'qc-step-text', items[oi]))));
      });
      if (seq.length < n) seqList.appendChild(h('li', { class: 'qc-slot', 'aria-hidden': 'true' }, h('span', { class: 'qc-num' }, String(seq.length + 1)), h('span', null, '')));
      U.clear(pool);
      idx.forEach(function (oi) {
        if (seq.indexOf(oi) >= 0) return;
        pool.appendChild(h('button', { class: 'option qc-chip', type: 'button', on: { click: function () { if (!c.locked) { seq.push(oi); draw(); } } } }, inline('span', null, items[oi])));
      });
      poolHead.textContent = seq.length ? 'Tap the one that comes next' : 'Tap the one that comes first';
      poolHead.hidden = pool.hidden = seq.length === n;
      undo.disabled = !seq.length;
      check.disabled = seq.length !== n;
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
    var dec = log ? null : decimalsFor(step);
    function toPos(v) { v = clamp(v, min, max); return log ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min); }
    function fromPos(p) { return log ? min * Math.pow(max / min, p) : min + p * (max - min); }
    function sig2(v) { var e = Math.floor(Math.log10(Math.abs(v))) - 1, u = Math.pow(10, e); return Math.round(v / u) * u; }
    function snap(v) { v = clamp(v, min, max); return log ? clamp(sig2(v), min, max) : clamp(Math.round((v - min) / step) * step + min, min, max); }
    function disp(v) { return fmt(v, log ? (Math.abs(v) >= 10 ? 0 : decimalsFor(Math.pow(10, Math.floor(Math.log10(Math.abs(v))) - 1))) : dec); }
    function nudge(dir) {
      if (log) {
        var e = Math.floor(Math.log10(value)) - 1, u = Math.pow(10, e);
        set(clamp((Math.round(value / u) + dir) * u, min, max));
      } else set(value + dir * step);
      touched();
    }
    var value = snap(fromPos(0.5)), moved = false;
    var out = h('output', { class: 'qc-est-value', 'aria-live': 'polite' });
    var range = h('input', { class: 'qc-range', type: 'range', min: '0', max: '1000', step: '1', 'aria-label': 'Your estimate' });
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
      range.value = String(Math.round(toPos(value) * 1000));
      U.clear(out).appendChild(h('span', { class: 'qc-est-num' }, disp(value)));
      if (unit) out.appendChild(h('span', { class: 'qc-est-unit' }, ' ' + unit));
      range.setAttribute('aria-valuetext', withUnit(disp(value), unit));
    }
    function touched() { if (!moved) { moved = true; lock.disabled = false; hint.textContent = 'Happy with that? Lock it in.'; } }
    range.addEventListener('input', function () { set(fromPos(Number(range.value) / 1000)); touched(); });
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
  function target(c) {
    var s = c.spec, it = interactiveOf(c.opts.lesson);
    if (!it || !U.sandbox || typeof U.sandbox.mount !== 'function') {
      unavailable(c, 'The interactive this question uses is not available right now, so this one is skipped.');
      return;
    }
    var goal = num(s.target, 0), tol = Math.abs(num(s.tolerance, 0)), ctl = controlOf(c.opts.lesson, s.control);
    var tries = 0, api = null;
    var goalLine = h('p', { class: 'qc-goal' },
      ctl ? 'Use the ' : null, ctl ? h('strong', null, ctl.label || ctl.id) : null, ctl ? ' control. ' : null,
      'Aim for ', h('strong', null, fmt(goal)), tol ? ' (give or take ' + fmt(tol) + ')' : '', '.');
    var stage = h('div', { class: 'qc-stage' });
    var hintBox = h('div', { class: 'qc-hint', role: 'status', hidden: true });
    c.body.append(goalLine, stage);
    var btn = primary('Check my setting', check);
    btn.disabled = true;
    c.setFoot([hintBox, btn]);
    function enable() { if (!c.locked) btn.disabled = false; }
    try {
      api = U.sandbox.mount(stage, {
        html: it.html, title: it.title || 'Interactive', minHeight: 280,
        onError: function (msg) { console.warn('interactive error', msg); },
      });
    } catch (e) {
      console.error(e);
      U.clear(stage);
      unavailable(c, 'The interactive could not start, so this one is skipped.');
      return;
    }
    c.cleanups.push(function () { if (api && api.destroy) api.destroy(); });
    Promise.resolve(api && api.ready).then(enable, enable);
    setTimeout(enable, 6000);

    function check() {
      if (c.locked) return;
      btn.disabled = true;
      btn.textContent = 'Reading the interactive…';
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
            'It reads ', h('strong', null, fmt(v)), ' and you are aiming for ', h('strong', null, fmt(goal)), '. ',
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
          parts: [ok ? null : h('p', { class: 'qc-answer' }, 'It read ' + fmt(v) + '; the target was ' + fmt(goal) + (tol ? ' give or take ' + fmt(tol) : '') + '.'), why(s.why)],
          grade: autoGrade(c, ok, { hinted: tries > 1, noEasy: true }), result: { answer: v, tries: tries },
        });
      }).catch(function (e) {
        clearTimeout(timer);
        console.warn('target check failed', e);
        U.toast('The interactive did not answer. Move the control a little and try again.', { kind: 'bad' });
        btn.textContent = tries ? 'Check again' : 'Check my setting';
        btn.disabled = false;
      });
    }
  }

  // ---------- recall (say it back, graded by Claude in the background) ----------
  function verdictGrade(r) {
    var v = VERDICT[r && r.verdict];
    if (!v) return null;
    return r.verdict === 'got-it' && r.nailed ? 4 : v.grade;
  }
  function recall(c) {
    var s = c.spec, rubric = Array.isArray(s.rubric) ? s.rubric : [];
    var ta = h('textarea', { class: 'textarea qc-recall-input', rows: '5', placeholder: 'Explain it in your own words…', 'aria-label': 'Your answer' });
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

      var grading = U.gen && typeof U.gen.grade === 'function'
        ? Promise.resolve().then(function () { return U.gen.grade({ prompt: s.prompt, rubric: rubric, model: s.model }, answer, 1); })
        : null;
      var graded = null, failed = !grading, picked = null, claudeGrade = null;

      var points = rubric.map(function (p) { return h('li', { class: 'qc-point' }, h('span', { class: 'qc-dot', 'aria-hidden': 'true' }), inline('span', null, p)); });
      var status = h('div', { class: 'qc-claude', role: 'status' });
      var panel = h('div', { class: 'qc-fb is-neutral qc-fb-recall' },
        h('div', { class: 'qc-fb-head' }, h('h3', null, 'Compare with a model answer')),
        richBlock('qc-model qc-prose', s.model),
        points.length ? h('div', { class: 'qc-rubric' }, label('A good answer covers'), h('ul', { class: 'qc-points' }, points)) : null,
        status,
        c.mode === 'review' && s.mine ? h('details', { class: 'qc-mine' }, h('summary', null, 'What you wrote when you learned it'), h('p', null, String(s.mine))) : null);

      var picker = null, pickHint = null;
      if (c.mode === 'review') {
        picker = gradePicker(c, null, function (g) { picked = g; refresh(); reveal(c); });
        pickHint = h('p', { class: 'qc-label' }, 'How well did you know it?');
        panel.append(pickHint, picker.el);
      }
      var cont = h('button', { class: 'btn wide qc-continue', type: 'button', on: { click: done } }, 'Continue');
      panel.appendChild(cont);

      function drawStatus() {
        U.clear(status);
        if (graded) {
          var v = VERDICT[graded.verdict] || VERDICT.partly;
          status.appendChild(h('p', { class: 'qc-verdict ' + v.cls }, v.cls === 'good' ? U.icon('tick') : null, v.text));
          if (graded.followUp) status.appendChild(richBlock('qc-prose qc-follow', graded.followUp));
        } else if (failed) {
          status.appendChild(h('p', { class: 'muted small' }, grading ? 'Claude could not check this one just now. Compare it yourself.' : 'Compare your answer with the model answer.'));
        } else {
          status.append(h('div', { class: 'working', 'aria-hidden': 'true' }), h('p', { class: 'muted small' }, 'Claude is reading your answer…'));
        }
      }
      function refresh() {
        drawStatus();
        if (!picker) return;
        var g = picked || claudeGrade;
        picker.set(g);
        picker.btns.forEach(function (b) {
          var tag = b.querySelector('.qc-g-claude');
          if (Number(b.dataset.g) === claudeGrade && !tag) b.appendChild(h('span', { class: 'qc-g-claude' }, 'Claude'));
        });
        // Continue needs a rating, unless Claude is still grading (then it finishes in the background).
        cont.disabled = !g && failed;
        cont.textContent = !g && !failed ? 'Continue, Claude will grade it' : 'Continue';
        pickHint.textContent = claudeGrade && !picked ? 'How well did you know it? Claude\'s pick is marked; change it if you disagree.' : 'How well did you know it?';
      }
      function done() {
        var g = picked || claudeGrade;
        var base = { answer: answer, ms: c.ms };
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
          requestAnimationFrame(function () { if (!c.done) reveal(c, true); });
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
      show(c, panel, null);
    }
  }

  var TYPES = { choice: choice, order: order, estimate: estimate, target: target, recall: recall };

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
    verdictGrade: verdictGrade,
  };
})();
