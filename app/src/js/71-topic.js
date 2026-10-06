// Topic page (#/t/:tid): the plan for one topic, live from the db. While Claude plans it shows
// the question and gentle waiting lines; if planning failed it says why and offers Retry; once
// ready it shows the hook, the idea "in one breath", an optional warm-up (never locks anything),
// the path of ideas, the Library of research sources, Ask Claude, and Delete.
// Contract: docs/ARCHITECTURE.md sections 4 (topics, progress, research) and 9.
(function () {
  'use strict';
  var V = U.views;

  var WAITING = [
    'Finding the few ideas that matter most…',
    'Putting them in an order where each one builds on the last…',
    'Looking for something you can play with in every idea…',
    'Checking what you might already know from other topics…',
    'Writing a first question to get you thinking…',
  ];

  U.routes.add('#/t/:tid', function (params, ctx) {
    var tid = params.tid;
    var topic = null, loaded = false, failure = null, progress = { ideas: {} }, deleting = false;
    var ui = { reveal: null, pick: null, line: 0, retrying: false, researching: false, scrolled: false, slow: false };
    var slowTimer = setTimeout(function () { if (!loaded && ctx.alive()) { ui.slow = true; schedule(); } }, 8000);
    var lib = { key: null, groups: null };
    var avail = null;
    var root = U.h('div', { class: 'tp' });
    ctx.view.appendChild(root);
    root.appendChild(loadingView());

    var frame = 0;
    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(function () { frame = 0; if (ctx.alive() && !deleting) render(); });
    }

    var stops = [
      U.store.topic.watch(tid, function (t) {
        topic = t; loaded = true; failure = null;
        if (t) U.setTitle(t.title || V.asTitle(t.query));
        if (t && t.status === 'ready') loadLibrary();
        schedule();
      }, function (e, info) {
        if (loaded) return;                    // keep showing the page it has
        failure = { e: e, retrying: info.retrying };
        schedule();
      }),
      U.store.progress.watch(tid, function (p) { progress = p || { ideas: {} }; schedule(); }),
    ];
    U.research.available().then(function (a) { avail = !!a; schedule(); }, function () { avail = false; schedule(); });

    var timer = setInterval(function () {
      var el = root.querySelector('.tp-wait-line');
      if (!el) return;
      ui.line = (ui.line + 1) % WAITING.length;
      el.classList.remove('is-in');
      void el.offsetWidth; // restart the fade
      el.textContent = WAITING[ui.line];
      el.classList.add('is-in');
    }, 3200);
    // A planning topic that nobody is planning any more turns into "Planning stopped" by itself.
    var stuckTimer = null;
    function armStuck() {
      clearTimeout(stuckTimer);
      var ms = V.untilStuck(topic);
      if (ms < Infinity) stuckTimer = setTimeout(function () { if (ctx.alive()) schedule(); }, ms + 500);
    }

    // ---------- rendering ----------
    // Only the parts whose data changed are rebuilt (a progress write elsewhere must not rebuild
    // the whole page under Dan's thumb or a screen reader's cursor); focus stays where it was.
    var shown = { state: null, box: null, slots: {} };
    function stateOf() {
      if (!loaded) return failure ? 'error' : 'loading';
      if (!topic) return 'gone';
      if (topic.status === 'planning' && !V.planningStuck(topic)) return 'planning';
      if (topic.status === 'failed' || topic.status === 'planning') return 'failed';
      return 'ready';
    }
    function render() {
      var state = stateOf();
      armStuck();
      var key = document.activeElement && root.contains(document.activeElement) ? document.activeElement.getAttribute('data-key') : null;
      if (state !== shown.state) {
        shown.state = state; shown.slots = {};
        shown.box = U.h('div', { class: state === 'ready' ? 'tp-ready' : state === 'planning' ? 'tp-planning' : state === 'failed' ? 'tp-failed' : 'tp-other' });
        // The ready page has regions: the header (top), the path (main), Ask Claude and the
        // sources (rail) and the footer (end). On a phone they stack in that order; on a laptop
        // main and rail sit side by side (70-views.css).
        shown.regions = { main: shown.box };
        if (state === 'ready') {
          shown.regions = { top: U.h('div', { class: 'tp-top' }), main: U.h('div', { class: 'tp-main' }), rail: U.h('div', { class: 'tp-rail' }), end: U.h('div', { class: 'tp-end' }) };
          U.append(shown.box, [shown.regions.top, U.h('div', { class: 'tp-cols' }, shown.regions.main, shown.regions.rail), shown.regions.end]);
        }
        U.clear(root).appendChild(shown.box);
      }
      var parts = state === 'ready' ? readyParts()
        : state === 'planning' ? planningParts()
        : state === 'failed' ? failedParts()
        : [['only', state + (failure ? String(failure.retrying) : '') + ui.slow, function () {
          if (state === 'loading') return ui.slow ? U.h('div', { class: 'stack' }, V.slowNote('this topic'), loadingView()) : loadingView();
          return state === 'gone' ? goneView() : V.loadError('This topic', failure && failure.e, failure && failure.retrying);
        }]];
      var at = {}, used = {};
      parts.forEach(function (p) {
        if (!p) return;
        var name = p[0], sig = p[1], slot = shown.slots[name];
        var where = p[3] && shown.regions[p[3]] ? p[3] : 'main', box = shown.regions[where], i = at[where] || 0;
        if (!slot || slot.sig !== sig) {
          var el = p[2]();
          slot = shown.slots[name] = { sig: sig, el: el };
        }
        used[name] = true;
        if (!slot.el) return;
        var cur = box.children[i];
        if (cur !== slot.el) box.insertBefore(slot.el, cur || null);
        at[where] = i + 1;
      });
      Object.keys(shown.regions).forEach(function (k) {
        var box = shown.regions[k], n = at[k] || 0;
        while (box.children.length > n) box.lastChild.remove();
      });
      Object.keys(shown.slots).forEach(function (n) { if (!used[n]) delete shown.slots[n]; });
      if (key && !(document.activeElement && root.contains(document.activeElement))) {
        var el = root.querySelector('[data-key="' + key + '"]');
        if (el) try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
      if (state === 'ready' && !ui.scrolled) arrived();
    }
    // Back from a lesson: bring the idea to do next into view instead of the top of the page.
    function arrived() {
      ui.scrolled = true;
      var from = null;
      try { from = sessionStorage.getItem('mu-from-lesson'); sessionStorage.removeItem('mu-from-lesson'); } catch (e) { /* fine */ }
      if (from !== tid) return;
      requestAnimationFrame(function () {
        var cur = root.querySelector('.pnode.is-current') || root.querySelector('.path');
        if (cur) cur.scrollIntoView({ block: 'center', behavior: 'auto' });
      });
    }
    function sig() { return JSON.stringify(Array.prototype.slice.call(arguments)); }

    // ---------- states ----------

    // Shaped like the page it stands in for (cover beside the header on a laptop), so nothing jumps.
    function loadingView() {
      return U.h('div', { class: 'tp-split', 'aria-hidden': 'true' },
        U.h('div', { class: 'skeleton tp-sk-banner' }),
        U.h('div', { class: 'tp-split-main' },
          U.h('div', { class: 'skeleton sk-line tall' }),
          U.h('div', { class: 'skeleton sk-line' }),
          U.h('div', { class: 'skeleton sk-line short' })));
    }

    function goneView() {
      return U.h('div', null, V.back('#/', 'All topics'),
        V.empty({ title: 'This topic is not here any more', text: 'It may have been deleted on another device.', action: { href: '#/', label: 'Back to Learn' } }));
    }

    // The planning and failed pages share the ready page's header shape: on a laptop the cover
    // sits beside the words instead of above them.
    function planningParts() {
      return [['planning', sig(topic.query, topic.title, topic.hue), function () {
        return U.h('div', { class: 'tp-planning-in' },
          V.back('#/', 'All topics'),
          U.h('div', { class: 'tp-split' },
            U.h('div', { class: 'tp-banner is-planning' }, V.cover(topic), U.h('div', { class: 'tcard-shimmer' })),
            U.h('div', { class: 'tp-split-main' },
              U.h('p', { class: 'eyebrow' }, 'Planning your topic'),
              U.h('h1', { class: 'tp-title' }, V.asTitle(topic.query || topic.title) || 'Your new topic'),
              // How long, and that it is safe to look away: the plan is made in this page, so it
              // carries on while the app is open (a closed app shows "Planning stopped" later).
              U.h('p', { class: 'muted tp-wait-note' }, 'This usually takes under a minute. It carries on while you look around the app.'),
              U.h('div', { class: 'tp-wait', role: 'status' },
                U.h('div', { class: 'working' }),
                U.h('p', { class: 'tp-wait-line is-in' }, WAITING[ui.line])),
              U.h('div', { class: 'tp-sk-path', 'aria-hidden': 'true' }, [0, 1, 2, 3, 4].map(function (i) {
                return U.h('div', { class: 'tp-sk-node' }, U.h('span', { class: 'skeleton tp-sk-dot' }),
                  U.h('span', { class: 'tp-sk-text' }, U.h('span', { class: 'skeleton sk-line', style: { width: (78 - i * 7) + '%' } }), U.h('span', { class: 'skeleton sk-line short' })));
              })))));
      }]];
    }

    // Planning failed, or stopped (the page that was planning went away: still 'planning' but
    // nothing has happened for a while). Both offer Try again and Delete.
    function failedParts() {
      var stopped = topic.status === 'planning';
      return [['failed', sig(topic.query, topic.title, topic.error, stopped, ui.retrying), function () {
        var q = V.asTitle(topic.query || topic.title) || 'Your new topic';
        return U.h('div', { class: 'tp-failed-in' },
          V.back('#/', 'All topics'),
          U.h('div', { class: 'tp-split' },
            U.h('div', { class: 'tp-banner is-quiet' }, V.cover(topic)),
            U.h('div', { class: 'tp-split-main' },
              U.h('p', { class: 'eyebrow' }, 'New topic'),
              U.h('h1', { class: 'tp-title' }, q),
              U.h('div', { class: 'notice bad', role: 'alert' },
                U.h('div', null,
                  U.h('strong', null, stopped ? 'Planning stopped before it finished. ' : 'Planning did not finish. '),
                  U.h('span', null, !stopped && topic.error ? U.errText(typeof topic.error === 'string' ? { message: topic.error } : topic.error) : 'Nothing was lost. Try again in a moment.'))),
              // Delete is red here too, as on the ready page: it removes the topic for good.
              U.h('div', { class: 'row tp-failed-actions' },
                U.h('button', { class: 'btn', type: 'button', 'data-key': 'retry', disabled: ui.retrying, on: { click: retry } }, ui.retrying ? 'Trying again…' : 'Try again'),
                U.h('button', { class: 'linkish tp-delete', type: 'button', 'data-key': 'delete-failed', on: { click: del } }, 'Delete this topic')),
              ui.retrying ? U.h('div', { class: 'working' }) : null)));
      }]];
    }

    function retry() {
      if (ui.retrying) return;
      var q = topic.query || topic.title, level = topic.level || 'new';
      var job;
      if (U.gen && U.gen.replan) job = Promise.resolve().then(function () { return U.gen.replan(tid); }).then(function () { return tid; });
      else if (U.gen && U.gen.createTopic && q) {
        job = Promise.resolve().then(function () { return U.gen.createTopic(q, { level: level }); }).then(function (newTid) {
          if (!newTid || newTid === tid) return tid;
          // The new topic exists; now let the failed one go.
          deleting = true;
          return U.store.topic.remove(tid).then(function () { return newTid; }, function () { return newTid; });
        });
      } else job = Promise.reject({ message: 'Claude cannot plan topics in this view yet.' });
      ui.retrying = true; render();
      job.then(function (id) {
        ui.retrying = false;
        if (id !== tid) { if (ctx.alive()) U.go('#/t/' + encodeURIComponent(id)); }
        else if (ctx.alive()) render();
      }, function (e) {
        ui.retrying = false; deleting = false;
        U.toast(U.errText(e), { kind: 'bad' });
        if (ctx.alive()) render();
      });
    }

    function del() {
      if (deleting) return;
      var title = V.asTitle(topic.title || topic.query) || 'this topic';
      U.confirmSheet({
        title: 'Delete this topic?',
        text: 'This removes “' + title + '”, its lessons, your answers and its review cards from all your devices. You cannot undo this.',
        confirm: 'Delete topic', danger: true,
      }).then(function (yes) {
        if (!yes || deleting) return;
        deleting = true;
        return U.store.topic.remove(tid).then(function (r) {
          U.toast(r && r.leftovers ? 'Topic deleted. A few of its saved pieces could not be cleared yet; they are hidden and will be tidied up later.' : 'Topic deleted.');
          if (U.review && U.review.refreshBadge) try { U.review.refreshBadge(); } catch (e) { console.error(e); }
          if (ctx.alive()) U.go('#/');
        }, function (e) {
          deleting = false;
          U.toast('Could not delete the topic: ' + U.errText(e) + ' Nothing was removed.', { kind: 'bad' });
          if (ctx.alive()) render();
        });
      });
    }

    // ---------- ready ----------

    function readyParts() {
      var ideas = Array.isArray(topic.ideas) ? topic.ideas : [];
      var s = V.summary(topic, progress);
      var pi = progress.ideas || {};
      var ideaState = ideas.map(function (i) { var p = pi[i.id] || {}; return [i.id, i.title, i.oneLine, i.deps, i.known, p.stage, p.doneAt, p.known]; });
      var cal = progress.calibration || {};
      var r = topic.research || {};
      return [
        ['head', sig(topic.title, topic.query, topic.hook, topic.hue, s.current && s.current.id, s.current && s.current.title, s.started, s.allDone), function () { return head(s); }, 'top'],
        topic.oneBreath ? ['breath', sig(topic.oneBreath), function () {
          return U.h('section', { class: 'callout remember tp-breath', 'aria-label': 'In one breath' },
            U.h('p', { class: 'eyebrow' }, 'In one breath'),
            U.h('div', { class: 'reading' }, U.rich(topic.oneBreath)));
        }] : null,
        ['warm', sig(topic.calibration, cal, progress.calibrationSkipped, ui.reveal, ui.pick, s.done > 0 || s.started), warmup],
        ['path', sig(ideaState, cal, topic.calibration, progress.lastIdea), function () {
          var prog = (s.done > 0 || s.started) ? U.h('div', { class: 'tp-progress' },
            U.h('div', { class: 'row' },
              s.allDone ? U.h('span', { class: 'done-note' }, U.icon('tick'), 'All ' + s.total + ' ideas done')
                : U.h('span', { class: 'muted' }, s.done + ' of ' + s.total + ' ideas done')),
            U.h('div', { class: 'bar' + (s.allDone ? ' is-complete' : ''), role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(s.total), 'aria-valuenow': String(s.done), 'aria-label': 'Ideas done' }, U.h('i', { style: { width: (s.total ? Math.round((s.done / s.total) * 100) : 0) + '%' } }))) : null;
          return U.h('section', { class: 'tp-path-sec', 'aria-labelledby': 'path-h' },
            U.h('div', { class: 'section-head' }, U.h('h2', { id: 'path-h' }, 'Your path'), prog ? null : U.h('span', { class: 'muted small' }, 'Take them in order, or start anywhere')),
            prog,
            U.h('ol', { class: 'path' }, ideas.map(function (idea, i) { return pathNode(idea, i, ideas, s); })));
        }],
        U.tutor && U.tutor.open ? ['ask', 'ask', function () {
          return U.h('button', { class: 'btn secondary wide tp-ask', type: 'button', 'data-key': 'ask', on: { click: function () { U.tutor.open({ topic: topic, tid: tid }); } } }, U.icon('chat'), 'Ask Claude about this topic');
        }, 'rail'] : null,
        ['library', sig(r.status, r.at, r.sources, r.error, V.researchStale(topic), avail, ui.researching, lib.groups, ideas.map(function (i) { return [i.id, i.title]; })), function () { return library(ideas); }, 'rail'],
        ['foot', 'foot', function () {
          return U.h('div', { class: 'tp-foot' }, U.h('button', { class: 'linkish tp-delete', type: 'button', 'data-key': 'delete', on: { click: del } }, 'Delete this topic'));
        }, 'end'],
      ];
    }

    function head(s) {
      // The next step, right at the top: no scrolling past the warm-up to find it.
      var cta = s.current && !s.allDone
        ? U.h('a', { class: 'btn tp-cta', 'data-key': 'cta', href: '#/t/' + encodeURIComponent(tid) + '/' + encodeURIComponent(s.current.id) },
          U.h('span', { class: 'tp-cta-text' }, (s.started ? 'Continue: ' : 'Start: ') + s.current.title), U.icon('arrow'))
        : null;
      // On a laptop the cover sits beside the title (above the rail), not across the page, so
      // the path starts on the first screen.
      return U.h('header', { class: 'tp-head' },
        V.back('#/', 'All topics'),
        U.h('div', { class: 'tp-split' },
          U.h('div', { class: 'tp-banner' }, V.cover(topic)),
          U.h('div', { class: 'tp-split-main' },
            U.h('p', { class: 'eyebrow' }, s.total + (s.total === 1 ? ' idea' : ' ideas')),
            U.h('h1', { class: 'tp-title' }, V.asTitle(topic.title || topic.query)),
            topic.hook ? U.inline(U.h('p', { class: 'tp-hook' }), topic.hook) : null,
            cta)));
    }

    function pathNode(idea, i, ideas, s) {
      var st = (progress.ideas && progress.ideas[idea.id]) || {};
      var done = st.stage === 'done';
      var current = s.current && s.current.id === idea.id;
      var started = !done && !!st.stage;
      var depIds = Array.isArray(idea.deps) ? idea.deps : [];
      // "Builds on the idea just before" is what the path already shows; only say more.
      if (depIds.length === 1 && i > 0 && depIds[0] === ideas[i - 1].id) depIds = [];
      var deps = depIds.map(function (d) {
        var x = ideas.filter(function (k) { return k.id === d; })[0];
        return x ? x.title : null;
      }).filter(Boolean);
      var kicker = done ? 'Done' + (st.doneAt ? ' · ' + V.day(st.doneAt) : '')
        : current ? (s.started ? 'In progress' : (s.done === 0 ? 'Start here' : 'Up next'))
        : started ? 'Started' : 'Idea ' + (i + 1);
      var cls = 'pnode' + (done ? ' is-done' : '') + (current ? ' is-current' : '');
      return U.h('li', { class: cls },
        U.h('a', { class: 'pnode-link', href: '#/t/' + encodeURIComponent(tid) + '/' + encodeURIComponent(idea.id), 'data-key': 'idea-' + idea.id },
          U.h('span', { class: 'pnode-mark', 'aria-hidden': 'true' }, done ? U.icon('tick') : String(i + 1)),
          U.h('span', { class: 'pnode-body' },
            U.h('span', { class: 'pnode-kicker' }, kicker),
            U.h('span', { class: 'pnode-title' }, idea.title),
            idea.oneLine ? U.h('span', { class: 'pnode-line' }, U.plain(idea.oneLine)) : null,
            mayKnow(idea, st) && !done ? U.h('span', { class: 'pnode-known' }, 'You may already know this') : null,
            deps.length ? U.h('span', { class: 'pnode-deps' }, 'Builds on ' + deps.map(function (t) { return '“' + t + '”'; }).join(' and ')) : null,
            current ? U.h('span', { class: 'btn small pnode-btn' }, s.started ? 'Continue' : 'Start this idea', U.icon('arrow')) : null)));
    }

    // Known from the plan, from progress, or from a right warm-up answer about this idea.
    function mayKnow(idea, st) {
      if (idea.known || st.known) return true;
      var ans = progress.calibration || {};
      return (Array.isArray(topic.calibration) ? topic.calibration : []).some(function (q) {
        return q && q.iid === idea.id && typeof ans[q.id] === 'number' && ans[q.id] === q.answer;
      });
    }

    // ---------- warm-up (calibration) ----------

    function warmup() {
      var qs = (Array.isArray(topic.calibration) ? topic.calibration : []).filter(function (q) { return q && q.id && q.q && Array.isArray(q.options) && q.options.length; });
      if (!qs.length) return null;
      var ans = progress.calibration || {};
      function answered(q) { return typeof ans[q.id] === 'number'; }
      var done = qs.filter(answered);
      var revealQ = ui.reveal ? qs.filter(function (q) { return q.id === ui.reveal; })[0] : null;
      var s = V.summary(topic, progress);
      var begun = s.done > 0 || s.started;

      if (!revealQ && (done.length === qs.length || progress.calibrationSkipped || begun)) {
        if (!done.length) {
          if (begun) return null; // he is already learning: the warm-up has done its job
          return U.h('p', { class: 'tp-warm-again' }, U.h('button', { class: 'linkish', type: 'button', 'data-key': 'warm-again', on: { click: function () {
            progress = Object.assign({}, progress, { calibrationSkipped: false });
            U.store.progress.patch(tid, { calibrationSkipped: false }).catch(function () { /* told */ });
            render();
          } } }, 'Try the ' + (qs.length === 1 ? 'warm-up question' : qs.length + ' warm-up questions')));
        }
        var right = done.filter(function (q) { return ans[q.id] === q.answer; }).length;
        var note = right === done.length ? 'You already know some of this. The early ideas may go quickly.'
          : right === 0 ? 'All new ground, which is the best kind. The path starts from the beginning.'
          : 'A good place to start. The path fills in the rest.';
        return U.h('div', { class: 'tp-warm-done' },
          U.h('span', { class: 'eyebrow' }, 'Warm-up'),
          U.h('p', null, U.h('strong', null, right + ' of ' + done.length + ' right. '), U.h('span', { class: 'muted' }, note)));
      }

      var q = revealQ || qs.filter(function (x) { return !answered(x); })[0];
      var idx = qs.indexOf(q), picked = ans[q.id], revealing = !!revealQ;
      var chosen = !revealing && ui.pick && ui.pick.q === q.id ? ui.pick.i : null;
      var options = q.options.map(function (opt, i) {
        var cls = 'option';
        if (revealing && i === q.answer) cls += ' correct';
        else if (revealing && i === picked) cls += ' wrong';
        return U.h('button', { class: cls, type: 'button', disabled: revealing, 'aria-pressed': (revealing ? i === picked : i === chosen) ? 'true' : 'false', 'data-key': 'warm-' + q.id + '-' + i, on: { click: function () { choose(q, i); } } },
          U.plain(opt));
      });
      var isLast = qs.filter(function (x) { return !answered(x) && x.id !== q.id; }).length === 0;
      return U.h('section', { class: 'card tp-warm', 'aria-labelledby': 'warm-h' },
        U.h('div', { class: 'row tp-warm-top' },
          U.h('p', { class: 'eyebrow grow', id: 'warm-h' }, 'Warm-up · ' + (idx + 1) + ' of ' + qs.length),
          revealing ? null : U.h('button', { class: 'linkish tp-skip', type: 'button', 'data-key': 'warm-skip', on: { click: skip } }, 'Skip')),
        idx === 0 && !revealing ? U.h('p', { class: 'muted small' }, 'A quick look at where you stand. It never locks anything.') : null,
        U.inline(U.h('p', { class: 'tp-warm-q' }), q.q),
        U.h('div', { class: 'options', role: 'group', 'aria-label': 'Answers' }, options),
        revealing ? U.h('div', { class: 'tp-warm-why', role: 'status' },
          U.h('p', { class: 'tp-warm-verdict' }, picked === q.answer ? 'Right.' : 'Not quite. The answer is “' + U.plain(q.options[q.answer] || '') + '”.'),
          q.why ? U.h('div', { class: 'muted' }, U.rich(q.why)) : null,
          U.h('button', { class: 'btn small', type: 'button', 'data-key': 'warm-next', on: { click: function () { ui.reveal = null; render(); } } }, isLast ? 'Done' : 'Next question'))
          : U.h('div', { class: 'tp-warm-go' }, U.h('button', { class: 'btn small tp-warm-check', type: 'button', 'data-key': 'warm-check', disabled: chosen == null, on: { click: function () { if (chosen != null) pick(q, chosen); } } }, 'Check')));
    }

    function choose(q, i) {
      ui.pick = { q: q.id, i: i };
      render();
      var check = root.querySelector('[data-key="warm-check"]');
      var opt = root.querySelector('[data-key="warm-' + q.id + '-' + i + '"]');
      if (opt) try { opt.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      void check;
    }

    function pick(q, i) {
      ui.reveal = q.id;
      ui.pick = null;
      var cal = Object.assign({}, progress.calibration || {});
      cal[q.id] = i;
      progress = Object.assign({}, progress, { calibration: cal });
      var patch = { calibration: {} };
      patch.calibration[q.id] = i;
      U.store.progress.patch(tid, patch).catch(function () { /* the store already told Dan */ });
      render();
      var next = root.querySelector('[data-key="warm-next"]');
      if (next) try { next.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }

    function skip() {
      progress = Object.assign({}, progress, { calibrationSkipped: true });
      U.store.progress.patch(tid, { calibrationSkipped: true }).catch(function () { /* told */ });
      render();
    }

    // ---------- library ----------

    function loadLibrary() {
      var r = topic.research || {};
      var ideas = Array.isArray(topic.ideas) ? topic.ideas : [];
      var key = [r.status, r.at, r.sources, ideas.map(function (i) { return i.id; }).join(',')].join('|');
      if (key === lib.key) return;
      lib.key = key;
      var keys = ['topic'].concat(ideas.map(function (i) { return i.id; }));
      Promise.all(keys.map(function (k) { return U.store.research.get(tid, k).catch(function () { return null; }); })).then(function (docs) {
        if (key !== lib.key) return;
        var seen = {};
        lib.groups = docs.map(function (d, i) {
          var list = (d && Array.isArray(d.sources) ? d.sources : []).filter(function (src) {
            if (!src || !(src.title || src.url)) return false;
            var id = src.url || src.title;
            if (seen[id]) return false;
            seen[id] = true;
            return true;
          });
          return { key: keys[i], sources: list };
        }).filter(function (g) { return g.sources.length; });
        schedule();
      });
    }

    function library(ideas) {
      var r = topic.research || {};
      var count = (lib.groups || []).reduce(function (n, g) { return n + g.sources.length; }, 0);
      var status, stale = V.researchStale(topic);
      var none = V.sourcesNone(topic) && !count;
      if (ui.researching || (r.status === 'running' && !stale)) {
        status = U.h('div', { class: 'lib-status is-running' }, U.h('span', null, 'Checking sources…'), U.h('div', { class: 'working' }));
      } else if (r.status === 'done' && !none) {
        status = U.h('p', { class: 'lib-status is-done' }, U.icon('tick'), U.h('span', null, 'Sources checked' + (count ? ' · ' + count + (count === 1 ? ' source' : ' sources') : '')));
      } else {
        // A check left 'running' by a page that went away counts as not finished; one that ran
        // but could not confirm any source says so, since it did finish.
        var text = none ? 'The source check ran but could not confirm a single source, so these lessons are not source-checked.'
          : r.status === 'failed' || stale ? 'The source check did not finish, so these lessons are not source-checked yet.' : 'Not source-checked yet.';
        if (avail === false) text += ' Connect Parallel Search in Claude\'s settings to add sources.';
        var again = (r.status === 'failed' || stale || none) && avail !== false && U.gen && typeof U.gen.research === 'function'
          ? U.h('button', { class: 'linkish lib-retry', type: 'button', 'data-key': 'research-again', on: { click: researchAgain } }, 'Check the sources again') : null;
        status = U.h('div', { class: 'lib-status is-none' }, U.h('p', null, text), again);
      }
      var groups = (lib.groups || []).map(function (g) {
        var idea = g.key === 'topic' ? null : ideas.filter(function (i) { return i.id === g.key; })[0];
        return U.h('div', { class: 'lib-group' },
          g.key === 'topic' ? null : U.h('h3', { class: 'lib-group-h' }, 'For “' + (idea ? idea.title : g.key) + '”'),
          U.h('ol', { class: 'sources' }, g.sources.map(sourceItem)));
      });
      return U.h('section', { class: 'tp-lib', 'aria-labelledby': 'lib-h' },
        U.h('div', { class: 'section-head' }, U.h('h2', { id: 'lib-h' }, 'Library')),
        status, groups);
    }

    function researchAgain() {
      if (ui.researching) return;
      ui.researching = true; render();
      Promise.resolve().then(function () { return U.gen.research(tid); }).catch(function () { /* research never rejects */ }).then(function () {
        ui.researching = false;
        if (ctx.alive()) render();
      });
    }

    function sourceItem(src) {
      var site = V.site(src.url);
      return U.h('li', { class: 'src' },
        V.extLink(src.url, src.title || site || src.url, 'src-title'),
        site ? U.h('span', { class: 'src-site' }, site) : null,
        src.quote ? U.h('blockquote', { class: 'src-quote' }, '“' + String(src.quote).replace(/^["“]|["”]$/g, '') + '”') : null);
    }

    return function () {
      stops.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
      clearInterval(timer);
      clearTimeout(stuckTimer);
      clearTimeout(slowTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, { tab: 'learn', title: 'Topic' });
})();
