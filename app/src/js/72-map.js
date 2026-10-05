// Map (#/map): every topic as a small constellation of idea dots, coloured by how well each idea
// is holding (new = outline, fragile = amber, growing = teal, strong = navy). Bands come from
// U.review.ideaBands() when the review module is present, else from progress (done = growing).
// The SVG is laid out in real pixels for the card's width so labels stay readable on a phone;
// tapping a dot opens that idea. Contract: docs/ARCHITECTURE.md sections 8 and 9.
(function () {
  'use strict';
  var V = U.views;

  var BANDS = [
    ['new', 'New', 'not learned yet'],
    ['fragile', 'Fragile', 'a review will help'],
    ['growing', 'Growing', 'settling in'],
    ['strong', 'Strong', 'yours for now'],
  ];
  var WORDS = { new: 'new', fragile: 'fragile', growing: 'growing', strong: 'strong' };

  var measureCtx = null;
  function textWidth(text, font) {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    if (!measureCtx) return text.length * 7.4;
    measureCtx.font = font;
    return measureCtx.measureText(text).width;
  }
  // Wrap a label into at most `max` lines that fit maxW, with an ellipsis when it runs over.
  function wrap(text, maxW, font, max) {
    var words = String(text || '').split(/\s+/).filter(Boolean), lines = [], line = '', over = false;
    for (var i = 0; i < words.length; i++) {
      var next = line ? line + ' ' + words[i] : words[i];
      if (!line || textWidth(next, font) <= maxW) { line = next; continue; }
      lines.push(line);
      if (lines.length === max) { over = true; line = ''; break; }
      line = words[i];
    }
    if (line) lines.push(line);
    return lines.map(function (ln, k) {
      var last = k === lines.length - 1;
      if (!(last && over) && textWidth(ln, font) <= maxW) return ln;
      while (ln.length > 1 && textWidth(ln + '…', font) > maxW) ln = ln.slice(0, -1).trimEnd();
      return ln.replace(/[,.;:]$/, '') + '…';
    });
  }

  function dot(band, r) {
    return V.s('circle', { class: 'map-dot is-' + band, r: r, cx: 0, cy: 0 });
  }

  // Draw one topic's constellation for a given pixel width: a snake of rows (left to right, then
  // right to left) joined by a dotted trail, each dot labelled underneath.
  // Label size follows the reading-size setting (the labels are 0.875rem, see 70-views.css).
  function labelPx() { var r = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; return Math.round(r * 0.875 * 10) / 10; }
  function constellation(topic, bands, W) {
    var ideas = topic.ideas || [];
    var px = labelPx();
    var font = '600 ' + px + 'px ' + getComputedStyle(document.body).fontFamily;
    var n = ideas.length, LINE = Math.round(px * 1.3);
    var cols = Math.max(2, Math.min(4, Math.floor(W / 150)));
    if (n <= 4 && W >= 480) cols = Math.max(2, n);
    var pad = 12, inner = W - pad * 2, cellW = inner / cols;
    var labelW = Math.min(cellW - 14, 170);
    // Up to four lines: a phone's narrow columns would otherwise cut titles short.
    var labels = ideas.map(function (idea) { return wrap(idea.title, labelW, font, W < 480 ? 4 : 3); });
    var halfW = labels.map(function (ls) { return Math.max.apply(null, ls.map(function (l) { return textWidth(l, font); }).concat([20])) / 2; });
    var maxLines = Math.max.apply(null, labels.map(function (l) { return l.length; }).concat([1]));
    var top = 30, rowH = 58 + px + LINE * maxLines, rows = Math.ceil(n / cols);
    var H = top + (rows - 1) * rowH + 48 + LINE * (maxLines - 1) + 8;
    var pts = ideas.map(function (idea, i) {
      var row = Math.floor(i / cols), c = i % cols;
      if (row % 2) c = cols - 1 - c;
      var j = (U.hash(topic.id + idea.id) % 13) - 6;
      return { x: pad + (c + 0.5) * cellW, y: top + row * rowH + j, row: row };
    });
    var svg = V.s('svg', { class: 'map-svg', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': 'Ideas in ' + (topic.title || 'this topic') });

    // The trail: straight within a row; at a row end it swings wide enough to clear both labels.
    if (n > 1) {
      var d = 'M' + pts[0].x + ' ' + pts[0].y;
      for (var i = 1; i < n; i++) {
        var a = pts[i - 1], b = pts[i];
        if (a.row === b.row) d += ' L' + b.x + ' ' + b.y;
        else {
          var side = (a.x > W / 2) ? 1 : -1;
          var bulge = side * (Math.max(halfW[i - 1], halfW[i]) + 10) / 0.6;
          d += ' C' + (a.x + bulge) + ' ' + a.y + ' ' + (b.x + bulge) + ' ' + b.y + ' ' + b.x + ' ' + b.y;
        }
      }
      svg.appendChild(V.s('path', { class: 'map-trail', d: d }));
    }

    ideas.forEach(function (idea, i) {
      var p = pts[i], band = bands[idea.id] || 'new';
      var a = V.s('a', { class: 'map-node', href: '#/t/' + encodeURIComponent(topic.id) + '/' + encodeURIComponent(idea.id), 'aria-label': idea.title + ', ' + WORDS[band], transform: 'translate(' + p.x + ' ' + p.y + ')' });
      a.appendChild(V.s('rect', { class: 'map-hit', x: -cellW / 2 + 4, y: -24, width: cellW - 8, height: rowH - 20, rx: 14 }));
      a.appendChild(V.s('circle', { class: 'map-halo', r: 19 }));
      a.appendChild(dot(band, 13));
      var label = V.s('text', { class: 'map-label', x: 0, y: 26 + px, 'text-anchor': 'middle', 'aria-hidden': 'true' });
      labels[i].forEach(function (ln, k) { label.appendChild(V.s('tspan', { x: 0, dy: k ? LINE : 0, text: ln })); });
      a.appendChild(label);
      svg.appendChild(a);
    });
    return svg;
  }

  function legend() {
    return U.h('div', { class: 'map-legend', role: 'list', 'aria-label': 'What the colours mean' }, BANDS.map(function (b) {
      var s = V.s('svg', { class: 'map-key', viewBox: '-10 -10 20 20', width: 20, height: 20, 'aria-hidden': 'true' }, dot(b[0], 7));
      return U.h('div', { class: 'map-legend-item', role: 'listitem' }, s, U.h('span', { class: 'map-legend-text' }, U.h('strong', null, b[1]), U.h('span', { class: 'muted' }, b[2])));
    }));
  }

  U.routes.add('#/map', function (params, ctx) {
    var topics = null, progress = {}, bandsAll = {}, seq = 0, lastW = 0, shownKey = null, drawJob = 0;
    var listBox = U.h('div', { class: 'map-list' });
    var body = U.h('div', { class: 'map-body' }, U.h('div', { class: 'skeleton map-sk' }));
    ctx.view.appendChild(U.h('div', { class: 'map' },
      U.h('header', { class: 'page-head' },
        U.h('p', { class: 'eyebrow' }, 'Map'),
        U.h('h1', null, 'Everything you are learning'),
        U.h('p', { class: 'muted' }, 'Each dot is one idea. The colour shows how well it is holding, and it shifts as you learn and review.')),
      body));

    var stop = U.store.topics.watch(function (list) {
      topics = (list || []).filter(function (t) { return t.status === 'ready' && Array.isArray(t.ideas) && t.ideas.length; });
      var my = ++seq;
      var bandsP = U.review && U.review.ideaBands ? Promise.resolve().then(function () { return U.review.ideaBands(); }).catch(function (e) { console.error(e); return {}; }) : Promise.resolve({});
      Promise.all([U.store.progress.all().catch(function () { return {}; }), bandsP]).then(function (r) {
        if (my !== seq || !ctx.alive()) return;
        progress = r[0] || {}; bandsAll = r[1] || {};
        render();
      });
    }, function (e, info) {
      if (!ctx.alive() || topics !== null) return;
      U.clear(body).appendChild(V.loadError('Your map', e, info.retrying));
    });

    // An idea Dan has finished counts as learned even before its first review (its cards say
    // 'new' until then), so the dot agrees with "N of M ideas learned".
    function bandsFor(t) {
      var from = bandsAll[t.id] || {}, out = {};
      t.ideas.forEach(function (i) {
        var b = WORDS[from[i.id]] ? from[i.id] : null, done = V.isDone(progress[t.id], i.id);
        if (!b || (b === 'new' && done)) b = done ? 'growing' : 'new';
        out[i.id] = b;
      });
      return out;
    }

    // Redraws only when something it shows changed. Topics are added a few per frame (each with
    // its constellation), so a large library never blocks the screen.
    var renderJob = 0;
    function render() {
      var keyNow = JSON.stringify([topics.map(function (t) { return [t.id, t.title, t.hue, t.ideas.map(function (i) { return [i.id, i.title]; })]; }),
        topics.map(function (t) { return [bandsFor(t), V.summary(t, progress[t.id]).done]; })]);
      if (keyNow === shownKey) return;
      shownKey = keyNow;
      var job = ++renderJob;
      drawJob++;
      U.clear(body);
      if (!topics.length) {
        body.appendChild(V.empty({
          art: U.h('div', { class: 'v-empty-art map-empty-art' }, emptyArt()),
          title: 'Your map is empty for now',
          text: 'Each topic you start appears here as a cluster of ideas. The dots fill in with colour as you learn and review them.',
          action: { href: '#/', label: 'Start a topic' },
        }));
        return;
      }
      body.appendChild(legend());
      U.clear(listBox);
      body.appendChild(listBox);
      var queue = topics.slice();
      (function chunk() {
        if (job !== renderJob || !ctx.alive()) return;
        var t0 = performance.now(), first = !listBox.firstChild;
        while (queue.length && (first || performance.now() - t0 < 12)) {
          first = false;
          var t = queue.shift(), s = V.summary(t, progress[t.id]);
          var holder = U.h('div', { class: 'map-svg-box', dataset: { tid: t.id } });
          listBox.appendChild(U.h('section', { class: 'card map-topic' + (s.allDone ? ' is-done' : '') },
            U.h('a', { class: 'map-topic-head', href: '#/t/' + encodeURIComponent(t.id) },
              U.h('span', { class: 'map-thumb' }, V.cover(t)),
              U.h('span', { class: 'map-topic-text' },
                U.h('h2', null, t.title),
                U.h('span', { class: 'muted small' }, s.allDone ? 'Every idea learned' : s.done ? s.done + ' of ' + s.total + ' ideas learned' : 'Not started yet')),
              U.icon('arrow', 'map-topic-go')),
            holder));
          if (!lastW) lastW = Math.floor(holder.clientWidth);
          if (lastW) holder.appendChild(constellation(t, bandsFor(t), lastW));
        }
        if (queue.length) requestAnimationFrame(chunk);
      })();
    }

    // After a resize: redraw the constellations already there, a few per frame.
    function draw(force) {
      var boxes = Array.prototype.slice.call(listBox.querySelectorAll('.map-svg-box'));
      if (!boxes.length) return;
      var W = Math.floor(boxes[0].clientWidth);
      if (!W || (!force && Math.abs(W - lastW) < 4)) return;
      lastW = W;
      var job = ++drawJob, byId = {};
      topics.forEach(function (t) { byId[t.id] = t; });
      (function chunk() {
        if (job !== drawJob || !ctx.alive()) return;
        var t0 = performance.now();
        while (boxes.length && performance.now() - t0 < 12) {
          var box = boxes.shift(), t = byId[box.dataset.tid];
          if (t && box.isConnected) U.clear(box).appendChild(constellation(t, bandsFor(t), lastW));
        }
        if (boxes.length) requestAnimationFrame(chunk);
      })();
    }

    var ro = null, raf = 0;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; if (ctx.alive()) draw(false); }); });
      ro.observe(ctx.view);
    }
    var onPrefs = U.on('prefs', function () { if (ctx.alive()) draw(true); });

    function emptyArt() {
      var svg = V.s('svg', { viewBox: '0 0 220 90', width: 220, height: 90, 'aria-hidden': 'true' });
      var pts = [[30, 52], [78, 30], [124, 58], [170, 34], [196, 66]];
      svg.appendChild(V.s('path', { class: 'map-trail', d: 'M' + pts.map(function (p) { return p.join(' '); }).join(' L') }));
      ['new', 'fragile', 'growing', 'strong', 'new'].forEach(function (b, i) {
        var g = V.s('g', { transform: 'translate(' + pts[i][0] + ' ' + pts[i][1] + ')' });
        g.appendChild(V.s('circle', { class: 'map-halo', r: 14 }));
        g.appendChild(dot(b, 10));
        svg.appendChild(g);
      });
      return svg;
    }

    return function () { stop(); onPrefs(); drawJob++; renderJob++; if (ro) ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, { tab: 'map', title: 'Map' });
})();
