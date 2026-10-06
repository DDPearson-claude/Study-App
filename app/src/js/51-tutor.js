// "Ask Claude": a bottom-sheet chat about the current lesson or topic. U.tutor.open(context)
//   context = {topic, tid?, iid?, idea?, lesson?, lessonDoc?, stage?, getState?}
// Replies stream in through U.gen.tutor(messages, context, {onText}). Conversations live in memory
// for this page session, keyed by topic and idea, so closing and reopening the sheet keeps them
// (a reply that is still streaming carries on into the reopened sheet). When context.getState is
// given, the interactive's current {params, outputs} go with each question as context.state.
// Questions Dan types are saved to progress.questions ({[key]: {q, iid, at}}, the newest 20 kept;
// older docs hold an array, see 20-store.js) so the Book can show what he wondered about; the quick
// chips are not saved.
//
// A reply streams in place: the paragraphs it has finished are drawn once, and only the one still
// coming is drawn again as text arrives; a new question adds its own messages and leaves the
// conversation above as it is. The conversation is not a live region (it would be read out again
// at every change): one status line says "Claude is answering…" and then the whole reply, once
// (a list said as sentences).
// The chips wrap, every one whole. Under a conversation on a touch screen they wrap while they
// leave it ROOM of the sheet; where they would not, fewer show (the most useful first, at least
// one) rather than any being cut. Only while the keyboard is up do they run on one sideways row
// that fades at the edge it runs past.
(function () {
  var CHIPS = ['Explain it differently', 'Give me an example', 'Are you sure?'];   // most useful first
  var STARTERS = 2;     // the chips that make sense before any answer ("Are you sure?" needs one)
  var SHORT = 500;      // a viewport shorter than this (px) with the input focused: the keyboard is up
  // The share of the sheet the conversation keeps under wrapped chips (below the sheet's title,
  // read as if scrolled to the top). From screenshots with the app's font at 320-412 px and every
  // Text size: at 0.47 or more it shows his question and about five lines of the reply; at 0.44
  // four; at 0.42 three and a half; at 0.35 two, too few to read on with.
  var ROOM = 0.45;
  var KEEP = 20;
  var threads = {};     // 'tid/iid' -> [{role, content, pending?, error?}]
  var view = null;      // the open sheet: {key, refresh(msg), close()}
  var saving = Promise.resolve();

  function media(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  function clip(text, n) { var t = String(text || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
  // A reply as it is said once on the status line: plain words (U.plain), and a list (U.rich's
  // "- " lines) said as sentences, each item ending with a full stop, never with its markers.
  function spoken(text) {
    return String(text || '').replace(/\r/g, '').split('\n').map(function (l) {
      var item = /^\s*[-•]\s+/.test(l);
      l = U.plain(l.replace(/^\s*[-•]\s+/, '')).trim();
      if (item && l) l = l.replace(/[,;]$/, '') + (/[.!?…:]$/.test(l) ? '' : '.');
      return l;
    }).join(' ').replace(/\s+/g, ' ').trim();
  }

  // Streaming callbacks may hand over the whole text so far ({text}) or just the new piece.
  function streamed(cur, t) {
    if (t && typeof t === 'object') {
      if (typeof t.text === 'string') return t.text;
      if (typeof t.delta === 'string') return cur + t.delta;
      return cur;
    }
    t = t == null ? '' : String(t);
    return cur && t.indexOf(cur) === 0 ? t : cur + t;
  }

  // History for the model: drop failed turns (and the question that led to each one).
  function history(msgs, except) {
    var out = [];
    msgs.forEach(function (m) {
      if (m === except) return;
      if (m.role === 'assistant' && (m.error || !m.content)) {
        if (out.length && out[out.length - 1].role === 'user') out.pop();
        return;
      }
      out.push({ role: m.role, content: m.content });
    });
    return out;
  }

  // The interactive's state crosses the sandbox boundary into a prompt that can use web tools,
  // so keep only short, plain names with finite numbers or booleans: no free text.
  function cleanState(s) {
    if (!s || typeof s !== 'object') return null;
    function pick(o) {
      var out = {}, n = 0;
      if (!o || typeof o !== 'object') return out;
      Object.keys(o).forEach(function (k) {
        var v = o[k];
        if (n >= 24 || !/^[A-Za-z][A-Za-z0-9_]{0,31}$/.test(k)) return;
        if ((typeof v === 'number' && isFinite(v)) || typeof v === 'boolean') { out[k] = v; n++; }
      });
      return out;
    }
    return { params: pick(s.params), outputs: pick(s.outputs) };
  }
  function stateOf(context) {
    if (typeof context.getState !== 'function') return Promise.resolve(null);
    return Promise.race([
      Promise.resolve().then(function () { return context.getState(); }).then(cleanState, function () { return null; }),
      U.sleep(1500).then(function () { return null; }),
    ]);
  }

  // Each question is its own keyed entry, so questions asked on two devices are both kept; the
  // oldest beyond KEEP are removed (null) in the same write.
  function saveQuestion(tid, iid, q) {
    if (!tid || !U.store || !U.store.progress) return;
    var rec = { q: q.slice(0, 500), iid: iid || null, at: U.now() }, k = U.key();
    saving = saving.then(function () {
      return U.store.progress.get(tid).then(function (p) {
        var list = U.entries(p && p.questions), patch = { questions: {} };
        patch.questions[k] = rec;
        list.slice(0, Math.max(0, list.length - (KEEP - 1))).forEach(function (e) { patch.questions[e.key] = null; });
        return U.store.progress.patch(tid, patch);
      });
    }).catch(function () { /* the store already told Dan if a write failed */ });
  }

  function ask(key, msgs, reply, context) {
    msgs.busy = true;
    stateOf(context).then(function (state) {
      if (!U.gen || typeof U.gen.tutor !== 'function') throw { message: 'Ask Claude is not available in this view.' };
      var ctx = Object.assign({}, context, { state: state });
      return U.gen.tutor(history(msgs, reply), ctx, { onText: function (t) {
        reply.content = streamed(reply.content, t);
        reply.pending = false;
        notify(key, reply);
      } });
    }).then(function (full) {
      if (typeof full === 'string' && full.trim()) reply.content = full;
      if (!reply.content) reply.content = 'Claude did not say anything back. Try asking another way.';
      reply.pending = false;
      msgs.busy = false;
      notify(key, reply, true);
    }, function (e) {
      reply.pending = false;
      reply.error = U.errText(e);
      msgs.busy = false;
      notify(key, reply, true);
    });
  }
  function notify(key, msg, finished) { if (view && view.key === key) view.refresh(msg, finished); }

  function open(context) {
    context = context || {};
    if (view) view.close();
    var topic = context.topic || {}, lesson = context.lesson || null;
    var tid = context.tid || topic.id || '', iid = context.iid || '';
    var key = tid + '/' + iid;
    var msgs = threads[key] = threads[key] || [];
    var about = (context.idea && context.idea.title) || (lesson && lesson.title) || topic.title || 'this';
    var sources = lesson && Array.isArray(lesson.sources) ? lesson.sources : [];
    function sourceOf(n) { return sources.filter(function (s) { return Number(s.n) === Number(n); })[0] || null; }
    var fn = { footnotes: {
      has: function (n) { return !!sourceOf(n) && !!(U.lesson && U.lesson.sourceSheet); },
      open: function (n) { U.lesson.sourceSheet(sourceOf(n)); },
    } };

    var log = U.h('div', { class: 'tutor-log' });
    var voice = U.h('p', { class: 'visually-hidden', role: 'status' });
    var els = new Map();
    var input = U.h('textarea', { class: 'textarea tutor-input', rows: 1, maxlength: 2000, 'aria-label': 'Your question', placeholder: 'Type your question', enterkeyhint: 'send' });
    var sendBtn = U.h('button', { class: 'tutor-send', type: 'button', 'aria-label': 'Send', disabled: true, on: { click: function () { send(input.value, false); } } }, U.icon('arrow'));
    var chips = U.h('div', { class: 'chips tutor-chips' }, CHIPS.map(function (c) {
      return U.h('button', { class: 'chip', type: 'button', on: { click: function () { send(c, true); } } }, c);
    }));
    var seeing = lesson
      ? (context.getState ? 'Claude can see this lesson and where your controls are set.' : 'Claude can see this lesson.')
      : 'Claude can see the plan for this topic.';
    var dock = U.h('div', { class: 'tutor-dock' }, chips, U.h('div', { class: 'tutor-compose' }, input, sendBtn));
    var body = U.h('div', { class: 'tutor' },
      U.h('p', { class: 'tutor-about' }, seeing),
      log, voice, dock);
    var sayTimer = 0;
    function announce(text) {
      clearTimeout(sayTimer);
      voice.textContent = '';
      text = spoken(text);
      if (text) sayTimer = setTimeout(function () { voice.textContent = text; }, 80);
    }

    function autosize() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight + 3, 160) + 'px'; }
    input.addEventListener('input', function () { autosize(); sendBtn.disabled = !!msgs.busy || !input.value.trim(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(input.value, false); }
    });
    // The chips sit just above the input from the start, so every way to ask is in one place; an
    // empty conversation also makes the sheet only as tall as it needs to be (50-lesson.css).
    function sync() {
      sendBtn.disabled = !!msgs.busy || !input.value.trim();
      chips.querySelectorAll('.chip').forEach(function (c) { c.disabled = !!msgs.busy; });
      if (sheet) sheet.el.classList.toggle('is-empty', !msgs.length);
      fit();
    }
    // The chips wrap (is-wrapped, 50-lesson.css), as many rows as they need, except while the
    // keyboard is up (is-cramped: one sideways row). Under a conversation on a touch screen, the
    // last of them are left out while they take more than one row and do not leave the
    // conversation ROOM of the sheet (one always shows). With a mouse every chip shows. Worked
    // out afresh each time, from all of them, so the choice depends only on the sheet's size and
    // the text size.
    function fit() {
      if (!sheet) return;
      var el = sheet.el;
      var shown = Array.prototype.filter.call(chips.querySelectorAll('.chip'), function (c, i) { c.hidden = !msgs.length && i >= STARTERS; return !c.hidden; });
      var wrap = !el.classList.contains('is-cramped');
      el.classList.toggle('is-wrapped', wrap);
      if (wrap && touch && msgs.length) for (var n = shown.length; n > 1 && rows(shown.slice(0, n)) > 1 && room() < ROOM; n--) shown[n - 1].hidden = true;
      edges();
    }
    function rows(list) { var tops = {}; list.forEach(function (c) { tops[Math.round(c.offsetTop)] = true; }); return Object.keys(tops).length; }
    // The share of the sheet the conversation has above the dock, below the sheet's title, as if
    // scrolled to the top (so reading on never changes the choice).
    function room() {
      var el = sheet.el, head = el.querySelector('.sheet-head'), sr = el.getBoundingClientRect();
      var top = head ? head.getBoundingClientRect().bottom + el.scrollTop : sr.top;
      return sr.height > 0 ? (dock.getBoundingClientRect().top - top) / sr.height : 1;
    }
    // A sideways row of chips that runs on past the sheet's edge fades out there (50-lesson.css).
    function edges() {
      var max = chips.scrollWidth - chips.clientWidth;
      chips.classList.toggle('more-left', max > 1 && chips.scrollLeft > 1);
      chips.classList.toggle('more-right', max > 1 && chips.scrollLeft < max - 1);
    }
    // The keyboard is up on a phone: the input has focus in a short viewport. The starters then go
    // back on one sideways row, so the welcome above them stays readable (50-lesson.css).
    // Only a touch screen has an on-screen keyboard: a short laptop window keeps its chips whole,
    // since a mouse cannot easily scroll a sideways row.
    var vv = window.visualViewport;
    var touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    function cramped() {
      var h = Math.min(window.innerHeight || Infinity, vv && vv.height || Infinity);
      if (sheet) sheet.el.classList.toggle('is-cramped', touch && document.activeElement === input && h < SHORT);
      fit();
    }

    function msgEl(m, i) {
      if (m.role === 'user') return U.h('div', { class: 'tutor-msg me' }, U.h('p', null, m.content));
      var el = U.h('div', { class: 'tutor-msg bot' });
      fill(el, m, i === msgs.length - 1);
      return el;
    }
    function fill(el, m, last) {
      U.clear(el);
      el._text = null;
      if (m.pending && !m.content) {
        el.appendChild(U.h('div', { class: 'tutor-wait' }, U.h('span', null, 'Thinking'), U.h('div', { class: 'working', 'aria-hidden': 'true' })));
      } else if (m.error) {
        el.appendChild(U.h('div', { class: 'notice bad' }, U.h('div', { class: 'stack-sm' },
          U.h('p', null, U.h('strong', null, 'No answer this time. '), m.error),
          last ? U.h('div', null, U.h('button', { class: 'btn small secondary', type: 'button', on: { click: function () { retry(m); } } }, 'Try again')) : null)));
      } else {
        stream(el, m.content);
      }
    }
    // The reply so far, drawn incrementally (U.rich's blocks are split by blank lines): blocks the
    // text has moved past are final and drawn once; only the last, still growing, is drawn again.
    // Text that is not the drawn text carried on (a reply replaced as a whole) is drawn afresh.
    function stream(el, text) {
      text = String(text || '').replace(/\r/g, '');
      var t = el._text;
      if (!t || text.indexOf(t.drawn) !== 0) {
        U.clear(el);
        t = el._text = { box: U.h('div', { class: 'tutor-text' }), drawn: '', at: 0, tail: [] };
        el.appendChild(t.box);
      }
      if (text === t.drawn) return;
      t.tail.forEach(function (n) { n.remove(); });
      t.tail = [];
      var rest = text.slice(t.at), re = /\n{2,}/g, m, from = 0;
      while ((m = re.exec(rest))) {
        t.box.appendChild(U.rich(rest.slice(from, m.index), fn));
        from = m.index + m[0].length;
      }
      t.at += from;
      var frag = U.rich(rest.slice(from), fn);
      t.tail = Array.prototype.slice.call(frag.childNodes);
      t.box.appendChild(frag);
      t.drawn = text;
    }
    function draw() {
      U.clear(log); els.clear();
      if (!msgs.length) log.appendChild(emptyEl());
      msgs.forEach(function (m, i) { var el = msgEl(m, i); els.set(m, el); log.appendChild(el); });
      sync();
    }
    function emptyEl() {
      return U.h('div', { class: 'tutor-empty' },
        U.h('p', { class: 'tutor-empty-head' }, 'Stuck, curious or not convinced?'),
        U.h('p', null, 'Ask anything about “' + clip(about, 60) + '”. No question is too small.'));
    }
    // New messages join the end of the conversation; what is above them stays as it is (a turn
    // that failed loses its Try again, which only the last turn offers).
    function add(list) {
      var empty = log.querySelector('.tutor-empty');
      if (empty) empty.remove();
      msgs.forEach(function (m, i) {
        var el = els.get(m);
        if (el && m.error && list.indexOf(m) < 0 && el.querySelector('.btn')) fill(el, m, i === msgs.length - 1);
      });
      list.forEach(function (m) { var el = msgEl(m, msgs.indexOf(m)); els.set(m, el); log.appendChild(el); });
      sync();
    }
    var frame = 0;
    function refresh(m, finished) {
      var el = els.get(m);
      if (!el) { draw(); toBottom(false); return; }
      if (finished) {
        cancelAnimationFrame(frame); frame = 0;
        if (m.error || !el._text) fill(el, m, msgs[msgs.length - 1] === m);
        else stream(el, m.content);
        sync(); toBottom(false);
        announce(m.error ? 'No answer this time. ' + m.error : m.content);
        return;
      }
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        if (m.pending && !m.content) return;
        if (!el._text) fill(el, m, msgs[msgs.length - 1] === m); else stream(el, m.content);
        toBottom(false);
      });
    }
    function toBottom(force) {
      var box = sheet.el;
      if (force || box.scrollHeight - box.scrollTop - box.clientHeight < 160) box.scrollTop = box.scrollHeight;
    }
    function send(text, chip) {
      text = String(text || '').trim();
      if (!text || msgs.busy) return;
      if (!chip) { input.value = ''; autosize(); saveQuestion(tid, iid, text); }
      var mine = { role: 'user', content: text };
      var reply = { role: 'assistant', content: '', pending: true };
      msgs.push(mine, reply);
      msgs.busy = true;
      add([mine, reply]);
      chips.scrollLeft = 0;
      toBottom(true);
      announce('Claude is answering…');
      ask(key, msgs, reply, context);
    }
    function retry(m) {
      if (msgs.busy) return;
      m.error = null; m.content = ''; m.pending = true;
      msgs.busy = true;
      var el = els.get(m);
      if (el) fill(el, m, true);
      sync();
      announce('Claude is answering…');
      // The Try again pressed has gone. On a touch screen focus goes to the answer being asked for
      // again (the box for the next question would bring the keyboard up and squash the sheet
      // while it streams in); with a keyboard, to that box.
      try {
        if (touch && el) { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
        else input.focus({ preventScroll: true });
      } catch (e) { /* fine */ }
      ask(key, msgs, m, context);
    }

    // The keyboard opening or closing resizes the viewport. Leaving the input is looked at a moment
    // later, so a starter tapped then does not move under the finger before its click lands.
    var later = 0, ro = null;
    function blurred() { clearTimeout(later); later = setTimeout(cramped, 150); }
    var sheet = U.sheet({
      title: 'Ask Claude', body: body, autofocus: !media('(pointer: coarse)'),
      onClose: function () {
        if (view && view.sheet === sheet) view = null;
        clearTimeout(later);
        window.removeEventListener('resize', cramped);
        if (vv) vv.removeEventListener('resize', cramped);
        if (ro) ro.disconnect();
        cancelAnimationFrame(fitting);
        clearTimeout(sayTimer);
      },
    });
    sheet.el.classList.add('tutor-sheet');
    view = { key: key, sheet: sheet, refresh: refresh, close: function () { sheet.close(); } };
    input.addEventListener('focus', cramped);
    input.addEventListener('blur', blurred);
    window.addEventListener('resize', cramped);
    if (vv) vv.addEventListener('resize', cramped);
    chips.addEventListener('scroll', edges, { passive: true });
    // The row changes size with the text size and the layout too, and the room the conversation
    // has with the sheet's (a reply arriving, the window resized).
    // (Looked at in the next frame: changing the layout from inside the observer's own callback
    // would only make it report again.)
    var fitting = 0;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { if (!fitting) fitting = requestAnimationFrame(function () { fitting = 0; fit(); }); });
      ro.observe(chips); ro.observe(sheet.el);
    }
    draw();
    requestAnimationFrame(function () { toBottom(true); });
    return sheet;
  }

  U.tutor = {
    open: open,
    // The conversation so far for a topic/idea (for tests and the Book).
    thread: function (tid, iid) { return (threads[(tid || '') + '/' + (iid || '')] || []).map(function (m) { return { role: m.role, content: m.content }; }); },
  };
})();
