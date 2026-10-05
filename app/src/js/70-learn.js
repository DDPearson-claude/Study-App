// Learn (#/): the home screen. Dan asks for a new topic, picks up where he left off, sees when
// reviews are waiting, and finds every topic as a card with its own generated cover.
// Also defines U.views, small helpers the topic page, Map and Book share: generated covers,
// progress summaries, safe outbound links and dates. Contract: docs/ARCHITECTURE.md 4, 9, 10.
(function () {
  'use strict';
  var V = (U.views = U.views || {});
  var SVGNS = 'http://www.w3.org/2000/svg';

  // ---------- shared helpers ----------

  // SVG element builder (numbers and app strings only; never model text as markup).
  V.s = function (tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'on') Object.keys(v).forEach(function (e) { el.addEventListener(e, v[e]); });
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, typeof v === 'number' ? String(Math.round(v * 10) / 10) : String(v));
    });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) el.appendChild(arguments[i]);
    return el;
  };

  // Small seeded random generator (mulberry32): the same seed always draws the same cover.
  V.rand = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  function f1(n) { return Math.round(n * 10) / 10; }

  // A smooth hill line across the cover, closed to the bottom edge.
  function hillPath(r, base, amp) {
    var n = 3 + Math.floor(r() * 2), x0 = -20, w = 360, step = w / n;
    var prev = base + (r() - 0.5) * 2 * amp;
    var d = 'M' + x0 + ' 200 L' + x0 + ' ' + f1(prev);
    for (var i = 1; i <= n; i++) {
      var x = x0 + i * step, y = base + (r() - 0.5) * 2 * amp;
      d += ' C' + f1(x - step * 0.62) + ' ' + f1(prev) + ' ' + f1(x - step * 0.38) + ' ' + f1(y) + ' ' + f1(x) + ' ' + f1(y);
      prev = y;
    }
    return d + ' L' + (x0 + w) + ' 200 Z';
  }
  function archPath(x, w, top, bottom) {
    var rad = w / 2;
    return 'M' + f1(x) + ' ' + f1(bottom) + ' V' + f1(top + rad) + ' A' + f1(rad) + ' ' + f1(rad) + ' 0 0 1 ' + f1(x + w) + ' ' + f1(top + rad) + ' V' + f1(bottom) + ' Z';
  }

  // A jagged ridge line across the cover, closed to the bottom edge.
  function ridgePath(r, base, amp) {
    var n = 4 + Math.floor(r() * 3), step = 360 / n, d = 'M-20 200 L-20 ' + f1(base);
    for (var i = 0; i < n; i++) {
      var x = -20 + i * step;
      d += ' L' + f1(x + step * (0.35 + r() * 0.3)) + ' ' + f1(base - amp * (0.45 + r() * 0.55)) + ' L' + f1(x + step) + ' ' + f1(base + (r() - 0.5) * amp * 0.3);
    }
    return d + ' L340 200 Z';
  }

  // Six calm compositions; the topic title picks one and every detail of it. The first three
  // are the originals: a topic whose title chose one of them before (seed % 3) still does, as
  // seed % 6 < 3 picks the same one, so half of the existing covers stay as Dan knows them.
  var COMPOSE = [
    function hills(svg, r) {
      var sx = 60 + r() * 200, sy = 44 + r() * 26, sr = 20 + r() * 12;
      svg.appendChild(V.s('circle', { class: 'cv-1 cv-soft', cx: sx, cy: sy, r: sr * 2 }));
      svg.appendChild(V.s('circle', { class: 'cv-sun', cx: sx, cy: sy, r: sr }));
      svg.appendChild(V.s('path', { class: 'cv-1', d: hillPath(r, 104, 12) }));
      svg.appendChild(V.s('path', { class: 'cv-2', d: hillPath(r, 126, 14) }));
      svg.appendChild(V.s('path', { class: 'cv-3', d: hillPath(r, 152, 10) }));
    },
    function orbits(svg, r) {
      var cx = 180 + r() * 80, cy = 74 + r() * 34, R = 58 + r() * 18;
      svg.appendChild(V.s('circle', { class: 'cv-1 cv-soft', cx: 30 + r() * 40, cy: 150 + r() * 20, r: 70 }));
      svg.appendChild(V.s('circle', { class: 'cv-ring', cx: cx, cy: cy, r: R + 52 }));
      svg.appendChild(V.s('circle', { class: 'cv-ring', cx: cx, cy: cy, r: R + 26 }));
      svg.appendChild(V.s('circle', { class: 'cv-1', cx: cx, cy: cy, r: R }));
      var a = r() * Math.PI * 2, b = a + 1.6 + r() * 1.6;
      svg.appendChild(V.s('circle', { class: 'cv-2', cx: cx + Math.cos(a) * R * 0.55, cy: cy + Math.sin(a) * R * 0.55, r: R * 0.42 }));
      svg.appendChild(V.s('circle', { class: 'cv-sun', cx: cx + Math.cos(b) * (R + 52), cy: cy + Math.sin(b) * (R + 52), r: 11 }));
      svg.appendChild(V.s('circle', { class: 'cv-4', cx: cx + Math.cos(b + 2.4) * (R + 26), cy: cy + Math.sin(b + 2.4) * (R + 26), r: 6 }));
      svg.appendChild(V.s('path', { class: 'cv-3', d: hillPath(r, 168, 6) }));
    },
    function arches(svg, r) {
      var n = 3 + Math.floor(r() * 3), span = 250, gap = 12, w = (span - gap * (n - 1)) / n, x = (320 - span) / 2;
      svg.appendChild(V.s('circle', { class: 'cv-sun', cx: 40 + r() * 240, cy: 34 + r() * 18, r: 16 + r() * 8 }));
      svg.appendChild(V.s('rect', { class: 'cv-1', x: -20, y: 146, width: 360, height: 60 }));
      for (var i = 0; i < n; i++) {
        var top = 46 + r() * 46, ax = x + i * (w + gap);
        svg.appendChild(V.s('path', { class: i % 2 ? 'cv-3' : 'cv-2', d: archPath(ax, w, top, 150) }));
        var inner = w * 0.46;
        svg.appendChild(V.s('path', { class: 'cv-bg', d: archPath(ax + (w - inner) / 2, inner, top + w * 0.34, 150) }));
      }
      svg.appendChild(V.s('rect', { class: 'cv-3', x: -20, y: 150, width: 360, height: 4 }));
    },
    function peaks(svg, r) {
      svg.appendChild(V.s('circle', { class: 'cv-sun', cx: 50 + r() * 220, cy: 36 + r() * 18, r: 15 + r() * 8 }));
      svg.appendChild(V.s('path', { class: 'cv-1', d: ridgePath(r, 112, 52) }));
      svg.appendChild(V.s('path', { class: 'cv-2', d: ridgePath(r, 138, 36) }));
      svg.appendChild(V.s('path', { class: 'cv-3', d: ridgePath(r, 164, 20) }));
    },
    // A cairn: balanced stones, kept near the middle so square crops still show it.
    function stones(svg, r) {
      svg.appendChild(V.s('circle', { class: 'cv-1 cv-soft', cx: 40 + r() * 240, cy: 50 + r() * 30, r: 62 }));
      svg.appendChild(V.s('circle', { class: 'cv-sun', cx: 60 + r() * 200, cy: 32 + r() * 14, r: 13 + r() * 6 }));
      svg.appendChild(V.s('path', { class: 'cv-1', d: hillPath(r, 156, 5) }));
      var n = 3 + Math.floor(r() * 2), y = 158, w = 112 + r() * 28, cx = 148 + r() * 24;
      for (var i = 0; i < n; i++) {
        var h = 26 - i * 2 + r() * 6;
        svg.appendChild(V.s('ellipse', { class: i % 2 ? 'cv-2' : 'cv-3', cx: cx + (r() - 0.5) * 12, cy: y - h / 2, rx: w / 2, ry: h / 2 }));
        y -= h - 3; w *= 0.7 + r() * 0.1;
      }
    },
    // A small constellation, like the Map's: dots joined by a quiet line.
    function stars(svg, r) {
      svg.appendChild(V.s('circle', { class: 'cv-1 cv-soft', cx: 220 + r() * 60, cy: 40 + r() * 30, r: 70 }));
      svg.appendChild(V.s('path', { class: 'cv-1', d: hillPath(r, 160, 7) }));
      var n = 5 + Math.floor(r() * 2), pts = [];
      for (var i = 0; i < n; i++) pts.push([48 + i * (224 / (n - 1)) + (r() - 0.5) * 16, 62 + r() * 52]);
      svg.appendChild(V.s('path', { class: 'cv-line', d: 'M' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join(' L') }));
      var star = 1 + Math.floor(r() * (n - 2));
      pts.forEach(function (p, k) {
        svg.appendChild(V.s('circle', { class: k === star ? 'cv-sun' : k % 2 ? 'cv-3' : 'cv-2', cx: p[0], cy: p[1], r: k === star ? 11 : 6 + r() * 3 }));
      });
    },
  ];

  // V.cover(topic, {class}) -> <svg>: a calm abstract cover drawn from topic.hue and the title.
  // No text, identical every render; colours come from CSS so light and dark both work.
  V.cover = function (topic, opts) {
    opts = opts || {};
    var title = String((topic && (topic.title || topic.query)) || 'My University');
    var seed = U.hash(title);
    var hue = topic && typeof topic.hue === 'number' ? topic.hue : seed % 360;
    var svg = V.s('svg', { class: 'cover' + (opts.class ? ' ' + opts.class : ''), viewBox: '0 0 320 180', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true', focusable: 'false' });
    svg.style.setProperty('--h', String(((Math.round(hue) % 360) + 360) % 360));
    svg.appendChild(V.s('rect', { class: 'cv-bg', x: -20, y: -20, width: 360, height: 220 }));
    var compose = COMPOSE[seed % COMPOSE.length];
    svg.setAttribute('data-motif', compose.name);
    compose(svg, V.rand(seed));
    return svg;
  };

  // Where Dan stands in a topic: ideas done, the idea to do next, whether it is under way.
  V.summary = function (topic, progress) {
    var ideas = (topic && Array.isArray(topic.ideas)) ? topic.ideas : [];
    var pi = (progress && progress.ideas) || {};
    function st(i) { return pi[i.id] || {}; }
    function isDone(i) { return st(i).stage === 'done'; }
    function known(i) { return !!(i.known || st(i).known); }
    var done = ideas.filter(isDone).length;
    var last = progress && progress.lastIdea;
    var current = ideas.filter(function (i) { return i.id === last && !isDone(i) && st(i).stage; })[0]
      || ideas.filter(function (i) { return !isDone(i) && !known(i); })[0]
      || ideas.filter(function (i) { return !isDone(i); })[0] || null;
    return {
      total: ideas.length, done: done, current: current,
      index: current ? ideas.indexOf(current) : -1,
      started: !!(current && st(current).stage),
      allDone: ideas.length > 0 && done === ideas.length,
      touched: (progress && progress.updatedAt) || (topic && topic.createdAt) || '',
    };
  };
  V.isDone = function (progress, iid) { var s = progress && progress.ideas && progress.ideas[iid]; return !!(s && s.stage === 'done'); };

  // Work left behind by a page that went away (reloaded, killed in the background, republished).
  // A topic still 'planning' 90 s after its last change, with no planning running in this page,
  // has stopped: it is shown as failed, with Try again and Delete. A research status left at
  // 'running' past the generator's own limit (31-generate.js RESEARCH_STALE_MS, 8 minutes) counts
  // as not checked, the moment lessons stop waiting for it.
  V.PLAN_STALE_MS = 90 * 1000;
  V.RESEARCH_STALE_MS = (U.gen && U.gen._cfg && U.gen._cfg.RESEARCH_STALE_MS) || 8 * 60 * 1000;
  V.age = function (iso) { var t = Date.parse(iso || ''); return isFinite(t) ? Date.now() - t : Infinity; };
  function live(tid) { try { return U.gen && typeof U.gen.status === 'function' ? U.gen.status(tid) || {} : {}; } catch (e) { return {}; } }
  V.planningStuck = function (t) {
    if (!t || t.status !== 'planning' || live(t.id).planning) return false;
    return V.age(t.updatedAt || t.createdAt) > V.PLAN_STALE_MS;
  };
  // Milliseconds until a planning topic would count as stopped (Infinity if never).
  V.untilStuck = function (t) {
    if (!t || t.status !== 'planning' || live(t.id).planning) return Infinity;
    return Math.max(0, V.PLAN_STALE_MS - V.age(t.updatedAt || t.createdAt));
  };
  V.researchStale = function (t) {
    var r = t && t.research;
    if (!r || r.status !== 'running' || live(t.id).research === 'running') return false;
    return V.age(r.at) > V.RESEARCH_STALE_MS;
  };

  // A calm error state for a screen whose data could not be loaded (never an empty screen).
  //   retrying: the store is reconnecting by itself; otherwise Try again re-opens the screen.
  // Shown when saved data is slow to arrive (a stalled connection): calm, not an error.
  V.slowNote = function (what) {
    return U.h('p', { class: 'v-slow muted small', role: 'status' }, 'Still waiting for ' + what + '. The connection seems slow; ' + (/s$/.test(what) ? 'they appear' : 'it appears') + ' as soon as ' + (/s$/.test(what) ? 'they arrive' : 'it arrives') + '.');
  };
  V.loadError = function (what, e, retrying) {
    return U.h('div', { class: 'notice v-load-error' + (retrying ? '' : ' bad'), role: 'status' },
      U.h('div', { class: 'stack-sm' },
        U.h('p', null, U.h('strong', null, retrying ? 'Reconnecting… ' : what + ' could not be loaded just now. '),
          retrying ? 'The connection to your saved work dropped for a moment.' : U.errText(e)),
        retrying ? U.h('div', { class: 'working', 'aria-hidden': 'true' })
          : U.h('div', null, U.h('button', { class: 'btn small secondary', type: 'button', on: { click: function () { U._route(); } } }, 'Try again'))));
  };

  // A short local date: "12 Sept", with the year when it is not this year.
  V.day = function (iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var o = { day: 'numeric', month: 'short' };
    if (d.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
    return d.toLocaleDateString(undefined, o);
  };

  // A topic's name as a title. Until Claude's plan names it, a topic is called by Dan's own
  // question, typed however it came: "how black holes form" shows as "How black holes form".
  V.asTitle = function (q) { q = String(q || '').trim(); return q.charAt(0).toUpperCase() + q.slice(1); };

  V.site = function (url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };

  // An outbound link: a real link, which the viewer opens in a new tab (window.open is refused
  // for many viewers, so the page never tries it). Only http(s) URLs become links.
  V.extLink = function (url, label, cls) {
    var ok = /^https?:\/\//i.test(String(url || ''));
    if (!ok) return U.h('span', { class: cls || '' }, label);
    return U.h('a', { class: cls || '', href: url, target: '_blank', rel: 'noopener noreferrer' }, label);
  };

  V.back = function (href, label) {
    return U.h('a', { class: 'backlink', href: href }, U.icon('back'), U.h('span', null, label));
  };

  // A friendly empty state with an optional action.
  V.empty = function (o) {
    return U.h('div', { class: 'v-empty' },
      o.art || null,
      U.h('h2', null, o.title),
      U.h('p', { class: 'muted' }, o.text),
      o.action ? U.h('a', { class: 'btn', href: o.action.href }, o.action.label, U.icon('arrow')) : null);
  };

  V.greeting = function () {
    var h = new Date().getHours();
    return h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  };

  // ---------- the Learn screen ----------

  var EXAMPLES = ['Why the sky is blue', 'The fall of Rome', 'How index funds work', 'Why minor keys sound sad', 'Sharpening a kitchen knife'];
  var LEVELS = [['new', 'New to it'], ['some', 'Know a bit'], ['solid', 'Know it well']];
  var CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  U.routes.add('#/', function (params, ctx) {
    var level = 'new', busy = false, topics = null, progress = {}, seq = 0;

    // --- ask ---
    var eyebrow = U.h('p', { class: 'eyebrow' }, V.greeting());
    // A question can be long ("how vaccines train the immune system"), so the box wraps and grows
    // to three lines instead of scrolling sideways; Enter still asks (it never adds a new line).
    var input = U.h('textarea', {
      class: 'input ask-input', id: 'ask-input', rows: '1', autocomplete: 'off', autocapitalize: 'sentences',
      enterkeyhint: 'go', maxlength: '200', placeholder: 'Tides, black holes, jazz…',
    });
    function fit() {
      if (!input.isConnected) return;
      input.style.height = '';
      var cs = getComputedStyle(input), border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
      var max = Math.ceil((parseFloat(cs.lineHeight) || 26) * 3 + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + border);
      var need = input.scrollHeight + border;
      if (need > input.offsetHeight) input.style.height = Math.min(need, max) + 'px';
      input.style.overflowY = need > max + 1 ? 'auto' : 'hidden';
    }
    input.addEventListener('input', fit);
    var offPrefs = U.on('prefs', fit); // a new text size changes the line height
    // The box's width follows the screen's shape (first run or returning, one column or two, the
    // layout, a busy button), so it is fitted again whenever its width changes; on the next frame,
    // so the height it sets is not a change made inside this observer.
    var fitW = -1, fitRaf = 0;
    var fitRo = window.ResizeObserver ? new ResizeObserver(function (entries) {
      var w = entries[entries.length - 1].contentRect.width;
      if (w === fitW) return;
      fitW = w;
      cancelAnimationFrame(fitRaf);
      fitRaf = requestAnimationFrame(fit);
    }) : null;
    if (fitRo) fitRo.observe(input); else window.addEventListener('resize', fit);
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      submit();
    });
    var goLabel = U.h('span', { class: 'ask-go-label' }, 'Start learning');
    var goBtn = U.h('button', { class: 'btn ask-go', type: 'submit' }, goLabel, U.icon('arrow'));
    var working = U.h('div', { class: 'ask-working', hidden: true },
      U.h('div', { class: 'working' }),
      U.h('p', { class: 'muted small' }, 'Claude is choosing the ideas that matter most. This takes a few seconds.'));
    var levelChips = LEVELS.map(function (l) {
      return U.h('button', { class: 'seg-btn', type: 'button', role: 'radio', 'aria-checked': String(l[0] === level), dataset: { level: l[0] }, on: { click: function () {
        level = l[0];
        levelChips.forEach(function (c) { c.setAttribute('aria-checked', String(c.dataset.level === level)); });
      } } }, l[1]);
    });
    var exampleChips = EXAMPLES.map(function (t) {
      return U.h('button', { class: 'chip chip-soft', type: 'button', on: { click: function () {
        if (input.disabled) return;
        input.value = t;
        fit();
        input.focus();
        try { input.setSelectionRange(t.length, t.length); } catch (e) { /* not supported: fine */ }
      } } }, t);
    });
    var form = U.h('form', { class: 'ask-form', novalidate: true, on: { submit: function (e) { e.preventDefault(); submit(); } } },
      U.h('label', { class: 'visually-hidden', for: 'ask-input' }, 'What do you want to learn?'),
      input, goBtn);

    var ask = U.h('section', { class: 'ask', 'aria-labelledby': 'ask-h' },
      eyebrow,
      U.h('h1', { id: 'ask-h' }, 'What do you want to learn?'),
      U.h('p', { class: 'ask-sub muted' }, 'Type anything you are curious about. Claude maps it into a few clear ideas, each with something to play with.'),
      U.h('div', { class: 'ask-row ask-level-row' }, U.h('span', { class: 'ask-label', id: 'lvl-l' }, 'How well do you know it?'),
        U.h('div', { class: 'seg ask-levels', role: 'radiogroup', 'aria-labelledby': 'lvl-l' }, levelChips)),
      form, working,
      U.h('div', { class: 'ask-row ask-try' }, U.h('span', { class: 'ask-label', id: 'try-l' }, 'Or try one'),
        U.h('div', { class: 'chips', role: 'group', 'aria-labelledby': 'try-l' }, exampleChips)));

    var continueBox = U.h('div', { class: 'learn-continue' });
    var todayBox = U.h('div', { class: 'learn-today' });
    var noteBox = U.h('div', { class: 'learn-note' });
    var listBox = U.h('section', { class: 'learn-topics', 'aria-label': 'Your topics' }, skeletonCards());
    // Reviews waiting come first: today's study is one tap away.
    var page = U.h('div', { class: 'learn' }, ask, todayBox, continueBox, noteBox, listBox);
    ctx.view.appendChild(page);

    // Once Dan has topics, phones get a compact ask so Continue sits on the first screen; the
    // level choice appears as soon as he starts typing.
    // (Focus on the heading, where each screen puts it when it opens, is not typing.)
    function typing() {
      var a = document.activeElement;
      page.classList.toggle('is-typing', !!input.value.trim() || !!(a && ask.contains(a) && a.matches && a.matches('textarea, button')));
    }
    input.addEventListener('input', typing);
    ask.addEventListener('focusin', typing);
    ask.addEventListener('focusout', function (e) { if (!e.relatedTarget || !ask.contains(e.relatedTarget)) setTimeout(typing, 0); });

    // Say hello by first name when the runtime knows it.
    if (U.rt.user && U.rt.user.me) {
      Promise.resolve(U.rt.user.me()).then(function (me) {
        var first = me && me.name ? String(me.name).trim().split(/\s+/)[0] : '';
        if (first && ctx.alive()) eyebrow.textContent = V.greeting() + ', ' + first;
      }, function () {});
    }

    function setBusy(on) {
      input.disabled = on; goBtn.disabled = on;
      goLabel.textContent = on ? 'Planning…' : 'Start learning';
      goBtn.classList.toggle('is-busy', on);
      working.hidden = !on;
      exampleChips.concat(levelChips).forEach(function (c) { c.disabled = on; });
    }

    function submit() {
      var q = input.value.replace(/\s+/g, ' ').trim();
      if (!q) { input.focus(); U.toast('Type something you would like to learn first.'); return; }
      if (busy) return;
      if (!U.gen || !U.gen.createTopic) { U.toast('Claude cannot plan new topics in this view yet.', { kind: 'bad' }); return; }
      busy = true;
      setBusy(true);
      var opened = false;
      // createTopic resolves once the plan is ready; onCreated lets Dan watch the plan form.
      function openTopic(tid) {
        if (opened || !tid || !ctx.alive()) return;
        opened = true;
        U.go('#/t/' + encodeURIComponent(tid));
      }
      Promise.resolve().then(function () { return U.gen.createTopic(q, { level: level, onCreated: openTopic }); }).then(function (tid) {
        busy = false;
        openTopic(tid);
      }, function (e) {
        busy = false;
        if (opened) return; // the topic page already shows what went wrong, with Try again
        U.toast(U.errText(e), { kind: 'bad' });
        if (ctx.alive()) { setBusy(false); input.focus(); }
      });
    }

    // --- live data ---
    // Topics (live) and progress are read in parallel; the first progress read starts with the
    // screen. Later topic changes re-read progress (debounced). Nothing re-renders unless what it
    // shows changed. A failed read shows an error, never the first-run welcome.
    var progressP = U.store.progress.all();
    var progressFailed = null, shownKey = null, stuckTimer = null, refetch = null, progressAt = 0;
    var slowTimer = setTimeout(function () {
      if (ctx.alive() && topics === null && listBox.querySelector('.is-skeleton')) listBox.insertBefore(V.slowNote('your topics'), listBox.firstChild);
    }, 8000);
    function loadProgress(p) {
      var my = ++seq;
      progressAt = Date.now();
      p.then(function (r) {
        if (my !== seq || !ctx.alive()) return;
        progress = r || {};
        progressFailed = null;
        noteProgress();
        render();
      }, function (e) {
        if (my !== seq || !ctx.alive()) return;
        console.warn('progress', e);
        progressFailed = e;
        render();
      });
    }
    var stop = U.store.topics.watch(function (list) {
      var firstTime = topics === null;
      topics = list || [];
      progSig = {};
      if (firstTime) { loadProgress(progressP); return; }
      // Topic changes from another device: progress is re-read at most every 10 s; in between
      // only the cards that changed are redrawn.
      clearTimeout(refetch);
      if (Date.now() - progressAt >= 10000) refetch = setTimeout(function () { if (ctx.alive()) loadProgress(U.store.progress.all()); }, 250);
      else if (seq && progressAt) render();
    }, function (e, info) {
      if (!ctx.alive()) return;
      if (topics !== null) {
        // Keep showing what is there; say so only once the store has given up reconnecting.
        if (!info.retrying) { U.clear(noteBox).appendChild(V.loadError('Your topics', e, false)); }
        return;
      }
      shownKey = null;
      U.clear(continueBox);
      U.clear(listBox).appendChild(V.loadError('Your topics', e, info.retrying));
    });

    if (U.review && (U.review.outlook || U.review.dueCount)) {
      Promise.resolve().then(function () {
        return U.review.outlook ? U.review.outlook() : Promise.resolve(U.review.dueCount()).then(function (n) { return { size: n }; });
      }).then(function (o) {
        if (ctx.alive()) renderToday(o || {});
      }, function (e) { console.error(e); });
    }

    // Reviews waiting: a row that opens Today. Nothing waiting: a quiet line saying so and when
    // cards come back, which only the two-column laptop Learn shows (beside the ask).
    function renderToday(o) {
      var n = Number(o.size) || 0;
      U.clear(todayBox);
      todayBox.classList.toggle('is-quiet', n <= 0);
      if (n <= 0) {
        var head = o.done > 0 ? 'Done for today' : o.cards === 0 ? 'Nothing to review yet' : 'Nothing to review today';
        var sub = o.next || (o.done > 0 ? '' : o.cards === 0 ? 'When you finish an idea, the questions you answered come back the next day, so they stick.'
          : o.cards > 0 ? 'Everything you have learned is holding up for now.' : '');
        todayBox.appendChild(U.h('div', { class: 'today-row is-quiet' },
          U.h('span', { class: 'today-ico' }, U.svg(CLOCK)),
          U.h('span', { class: 'today-text' }, U.h('strong', null, head), sub ? U.h('span', { class: 'muted small' }, sub) : null)));
        return;
      }
      var mins = Math.max(1, Math.round(n * 25 / 60));
      todayBox.appendChild(U.h('a', { class: 'today-row', href: '#/today' },
        U.h('span', { class: 'today-ico' }, U.svg(CLOCK)),
        U.h('span', { class: 'today-text' },
          U.h('strong', null, n === 1 ? '1 review ready' : n + ' reviews ready'),
          U.h('span', { class: 'muted small' }, 'About ' + mins + (mins === 1 ? ' minute' : ' minutes') + ' to keep what you have learned fresh.')),
        U.icon('arrow', 'today-go')));
    }

    // Cheap per-topic summary of progress (what the cards show), recomputed when progress loads.
    var progVersion = 0, progSig = {};
    function noteProgress() {
      progVersion++;
      progSig = {};
      (topics || []).forEach(function (t) { var x = V.summary(t, progress[t.id]); progSig[t.id] = [x.done, x.total, x.current && x.current.id, x.started, x.touched].join('|'); });
    }
    function sigOf(t) {
      if (!(t.id in progSig)) { var x = V.summary(t, progress[t.id]); progSig[t.id] = [x.done, x.total, x.current && x.current.id, x.started, x.touched].join('|'); }
      var r = t.research || {};
      return [t.title, t.query, t.hue, t.status, r.status, r.sources, t.ideas ? t.ideas.length : 0, V.planningStuck(t), V.researchStale(t), progSig[t.id]].join('\u0001');
    }
    // Only what changed is redrawn: cards are kept per topic and re-ordered in place.
    var shownFailed = null, grid = null, head = null, contSig = null;
    function render() {
      // Re-arm the moment a planning topic would count as stopped.
      clearTimeout(stuckTimer);
      var soonest = Math.min.apply(null, topics.map(V.untilStuck).concat([Infinity]));
      if (soonest < Infinity) stuckTimer = setTimeout(function () { if (ctx.alive()) { shownKey = null; render(); } }, soonest + 500);
      var sigs = topics.map(sigOf);
      var keyNow = topics.map(function (t) { return t.id; }).join(',') + '\n' + sigs.join('\n') + '\n' + progVersion + '\n' + !!progressFailed;
      if (keyNow === shownKey) return;
      shownKey = keyNow;
      page.classList.toggle('is-returning', topics.length > 0);
      var ph = topics.length ? 'Type any topic…' : 'Tides, black holes, jazz…';
      if (input.placeholder !== ph) { input.placeholder = ph; fit(); }   // the box was fitted to the old one
      if (shownFailed !== progressFailed) {
        shownFailed = progressFailed;
        U.clear(noteBox);
        if (progressFailed) noteBox.appendChild(V.loadError('Your progress', progressFailed, false));
      }
      if (!topics.length) { U.clear(continueBox); U.clear(listBox); grid = head = null; listBox.appendChild(welcome()); return; }
      var best = continuePick(), cs = best ? best.t.id + '|' + sigOf(best.t) : '';
      if (cs !== contSig) { contSig = cs; U.clear(continueBox); if (best) continueBox.appendChild(continueCard(best)); }
      if (!grid || !grid.isConnected) {
        U.clear(listBox);
        head = U.h('span', { class: 'muted small' });
        grid = U.h('div', { class: 'tgrid' });
        listBox.append(U.h('div', { class: 'section-head' }, U.h('h2', null, 'Your topics'), head), grid);
      }
      head.textContent = topics.length === 1 ? '1 topic' : topics.length + ' topics';
      var keep = {};
      topics.forEach(function (t, i) {
        var c = cards[t.id];
        if (!c || c.sig !== sigs[i]) { var el = topicCard(t); if (c && c.el.parentNode === grid) grid.replaceChild(el, c.el); c = cards[t.id] = { sig: sigs[i], el: el }; }
        keep[t.id] = true;
        if (grid.children[i] !== c.el) grid.insertBefore(c.el, grid.children[i] || null);
      });
      Object.keys(cards).forEach(function (id) { if (!keep[id]) { cards[id].el.remove(); delete cards[id]; } });
    }
    var cards = {};

    function continuePick() {
      var best = null;
      topics.forEach(function (t) {
        if (t.status !== 'ready') return;
        var s = V.summary(t, progress[t.id]);
        if (!s.current || s.allDone) return;
        if (!best || String(s.touched) > String(best.s.touched)) best = { t: t, s: s };
      });
      return best;
    }
    function continueCard(best) {
      var t = best.t, s = best.s, begun = s.started || s.done > 0;
      var pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
      return U.h('a', { class: 'ccard', href: '#/t/' + encodeURIComponent(t.id) + '/' + encodeURIComponent(s.current.id), 'aria-label': (begun ? 'Continue ' : 'Start ') + t.title + ': ' + s.current.title },
        U.h('div', { class: 'ccard-cover' }, V.cover(t)),
        U.h('div', { class: 'ccard-body' },
          U.h('p', { class: 'eyebrow' }, begun ? 'Continue where you left off' : 'Ready when you are'),
          U.h('h2', { class: 'ccard-title' }, t.title),
          U.h('p', { class: 'ccard-next' }, U.h('span', { class: 'muted' }, 'Idea ' + (s.index + 1) + ' of ' + s.total + ' · '), s.current.title),
          U.h('div', { class: 'ccard-progress' },
            U.h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(s.total), 'aria-valuenow': String(s.done), 'aria-label': s.done + ' of ' + s.total + ' ideas done' }, U.h('i', { style: { width: pct + '%' } })),
            U.h('span', { class: 'muted small' }, s.done + ' of ' + s.total + ' done')),
          U.h('span', { class: 'btn ccard-btn' }, begun ? 'Continue' : 'Start', U.icon('arrow'))));
    }

    function topicCard(t) {
      var href = '#/t/' + encodeURIComponent(t.id);
      var title = V.asTitle(t.title || t.query) || 'Untitled topic';
      if (t.status === 'planning' && !V.planningStuck(t)) {
        return U.h('a', { class: 'tcard is-planning', href: href },
          U.h('div', { class: 'tcard-cover' }, V.cover(t), U.h('div', { class: 'tcard-shimmer' })),
          U.h('div', { class: 'tcard-body' },
            U.h('h3', { class: 'tcard-title' }, title),
            U.h('p', { class: 'tcard-meta muted' }, 'Planning the ideas…'),
            U.h('div', { class: 'working' })));
      }
      // The same words as the topic page: "did not finish" when planning failed, "stopped" when
      // the page that was planning went away.
      if (t.status === 'failed' || t.status === 'planning') {
        return U.h('a', { class: 'tcard is-failed', href: href },
          U.h('div', { class: 'tcard-cover' }, V.cover(t)),
          U.h('div', { class: 'tcard-body' },
            U.h('h3', { class: 'tcard-title' }, title),
            U.h('p', { class: 'tcard-meta tcard-warn' }, (t.status === 'failed' ? 'Planning did not finish.' : 'Planning stopped.') + ' Open it to try again.')));
      }
      var s = V.summary(t, progress[t.id]);
      var pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
      var r = t.research || {};
      var badge = r.status === 'done' ? U.h('span', { class: 'src-badge' }, 'Sources checked')
        : r.status === 'running' && !V.researchStale(t) ? U.h('span', { class: 'src-badge is-quiet' }, 'Checking sources…') : null;
      return U.h('a', { class: 'tcard' + (s.allDone ? ' is-done' : ''), href: href },
        U.h('div', { class: 'tcard-cover' }, V.cover(t)),
        U.h('div', { class: 'tcard-body' },
          U.h('h3', { class: 'tcard-title' }, title),
          U.h('p', { class: 'tcard-meta' },
            s.allDone ? U.h('span', { class: 'done-note' }, U.icon('tick'), 'All ' + s.total + ' ideas done')
              : U.h('span', { class: 'muted' }, s.done + ' of ' + s.total + ' ideas done'),
            badge),
          U.h('div', { class: 'bar' + (s.allDone ? ' is-complete' : ''), 'aria-hidden': 'true' }, U.h('i', { style: { width: pct + '%' } }))));
    }

    function welcome() {
      function step(n, head, text) {
        return U.h('li', null, U.h('span', { class: 'step-n', 'aria-hidden': 'true' }, String(n)), U.h('div', null, U.h('strong', null, head + ' '), U.h('span', { class: 'muted' }, text)));
      }
      return U.h('div', { class: 'welcome' },
        U.h('div', { class: 'welcome-art' }, V.cover({ title: 'My University', hue: 205 })),
        U.h('div', { class: 'welcome-body' },
          U.h('h2', null, 'Your university starts here'),
          U.h('ol', { class: 'welcome-steps' },
            step(1, 'Ask about anything.', 'A question, a word you keep hearing, a skill you want.'),
            step(2, 'Learn it idea by idea.', 'Claude plans a short path, and every idea comes with something to play with.'),
            step(3, 'Keep it.', 'Explain each idea in your own words. Today brings it back just before it would fade.'))));
    }

    function skeletonCards() {
      return U.h('div', { class: 'tgrid', 'aria-hidden': 'true' }, [0, 1].map(function () {
        return U.h('div', { class: 'tcard is-skeleton' }, U.h('div', { class: 'tcard-cover skeleton' }),
          U.h('div', { class: 'tcard-body' }, U.h('div', { class: 'skeleton sk-line' }), U.h('div', { class: 'skeleton sk-line short' })));
      }));
    }

    return function () { stop(); clearTimeout(stuckTimer); clearTimeout(refetch); clearTimeout(slowTimer); window.removeEventListener('resize', fit); if (fitRo) fitRo.disconnect(); cancelAnimationFrame(fitRaf); offPrefs(); };
  }, { tab: 'learn', title: 'Learn' });
})();
