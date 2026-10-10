// The course dossier (docs/ARCHITECTURE.md sections 4, 9 and 10): a course bound as a naturalist's
// field journal, a teach-you-how book. Each idea Dan finishes in a course that keeps one (the topic
// page's "Keep a dossier", on by default: progress.dossier !== false) is bound as a chapter: a
// snapshot of the lesson's own teaching, taken when he finishes it (50-lesson.js calls
// U.dossier.bind) and taken again when he learns it again (the newest edition). Ideas finished
// before dossiers existed are bound from the stored lesson docs the first time the Library or the
// dossier opens (sync).
//
// Only the course's teaching is printed, never anything Dan wrote, chose or scored, and never a
// test: no say-it-back, no predict, no questions, answers or results, no "This looks wrong" notes,
// not even the words he typed to start the course (topic.query). What it keeps is what he could
// pick up and use: the explanation, the analogy, the key facts card, the plate, "Put it into
// practice" (lesson.practice) and the sources. The only things about him are dates (begun,
// finished, learned on) and how many chapters are bound. Model text goes in through U.h / U.rich
// / U.inline as text; the plate (the lesson's interactive) runs only in the sandboxed kit frame.
//
// Storage (private, 20-store.js): profile/dossiers/{tid} (the index) and
// profile/dossiers/{tid}/chapters/{iid} (one doc per chapter, under LIMIT bytes: a plate that
// would not fit is left out with a note). A dossier outlives its course when Dan keeps it.
//
// Routes (the Library itself is #/book in 73-book.js):
//   #/book/:tid  cover · /contents · /:iid (the idea) · /:iid/plate (/play: awake)
//   · /:iid/practice (put it into practice | sources; /tests, an older address, opens it too)
//   · /glossary · /bibliography (the same leaf, at the bibliography)
//
// Pure parts (chapterFrom, researchFrom, indexFrom, practiceParts, model) touch no DOM, so Node
// tests run them.
(function () {
  'use strict';
  var h = U.h;
  var LIMIT = 240 * 1024;   // a chapter doc's bytes, under the db's 256 KiB per document
  var PLATE_NOTE = 'This plate was too large to keep in the dossier. It still plays in the lesson.';
  var CERTAIN = {
    settled: 'Mainstream and uncontroversial at this level.',
    simplified: 'The full picture has more to it. This is the part that matters for now.',
    contested: 'Experts disagree. The main views are set side by side.',
  };
  var UNSOURCED = 'Not yet source-checked: Claude wrote this from what it already knows.';
  var CLOTH = ['#36324F', '#2F4536', '#5A2B24', '#2E3F52', '#4A2D40', '#5E4126'];
  var FONTS = 'https://fonts.googleapis.com/css2?family=Walter+Turncoat&family=Patrick+Hand&family=Patrick+Hand+SC&family=Permanent+Marker&family=Special+Elite&display=swap';
  // The plate in ink on paper: the kit's palette and its data roles (K_THEME.roles), for 32-sandbox.js.
  var INK = {
    light: { c: { bg: '#F8F1E0', panel: '#EFE6CF', sunk: '#E4D8BC', ink: '#2B2119', muted: '#5A4936', line: '#D3C4A2', strong: '#A08B63', accent: '#1B5B55', accent2: '#1F3A5C', onAccent2: '#F8F1E0', warn: '#962A22', good: '#2B6639', amber: '#F3E3B0' },
      roles: { hl: '#F1D488', amberLine: '#8A5A12', fill1: '#D8DCD8', fill2: '#EDCF83', fill3: '#D2DFD3' } },
    dark: { c: { bg: '#2E2820', panel: '#272119', sunk: '#3A3228', ink: '#EAE0CC', muted: '#C4B59B', line: '#4A4034', strong: '#6E604D', accent: '#8CD0C5', accent2: '#AFC6E3', onAccent2: '#1E1A15', warn: '#F2A79D', good: '#97D5A8', amber: '#4A3A1A' },
      roles: { hl: '#6A5320', amberLine: '#E2B458', fill1: '#3A4048', fill2: '#7A5E22', fill3: '#2F4441' } },
  };

  // =====================================================================================
  // SNAPSHOT (pure): what a chapter and the index keep, from course content only
  // =====================================================================================
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function str(v) { return typeof v === 'string' ? v : v == null ? '' : String(v); }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function pick(o, keys) { var out = {}; keys.forEach(function (k) { if (o[k] !== undefined && o[k] !== null) out[k] = U.clone(o[k]); }); return out; }
  // UTF-8 length without TextEncoder (Node's vm contexts have none).
  function bytes(s) {
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) n += 1; else if (c < 0x800) n += 2;
      else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) { n += 4; i++; } else n += 3;
    }
    return n;
  }
  function ideaOf(topic, iid) { return arr(topic && topic.ideas).filter(function (i) { return isObj(i) && i.id === iid; })[0] || null; }
  // The lesson's own teaching. Left out on purpose: predict, say and checks (questions Dan
  // answers: the dossier is a book to learn from, never a test).
  function cleanLesson(L, doc) {
    var it = isObj(L.interactive) ? L.interactive : null, built = isObj(doc && doc.interactive) ? doc.interactive : null;
    return {
      title: str(L.title),
      explain: { text: str(L.explain && L.explain.text) },
      analogy: isObj(L.analogy) && L.analogy.text ? { text: str(L.analogy.text), breaks: str(L.analogy.breaks) } : null,
      interactive: it ? {
        title: str((built && built.title) || it.title), brief: str(it.brief), whatAmILookingAt: str(it.whatAmILookingAt), ignores: str(it.ignores),
        numbers: arr(it.numbers).filter(isObj).map(function (n) { return Object.assign({ label: str(n.label), value: typeof n.value === 'number' ? n.value : str(n.value), kind: str(n.kind) }, n.source != null ? { source: num(n.source) } : {}); }),
        controls: arr(it.controls).filter(isObj).map(function (c) { return pick(c, ['id', 'label', 'min', 'max', 'step', 'value', 'unit', 'options']); }),
        outputs: arr(it.outputs).filter(isObj).map(function (o) { return pick(o, ['id', 'label', 'unit', 'decimals']); }),
      } : null,
      practice: isObj(L.practice) && typeof L.practice.text === 'string' && L.practice.text.trim() ? { text: L.practice.text } : null,
      sources: arr(L.sources).filter(isObj).map(function (s) { return { n: num(s.n), title: str(s.title), url: str(s.url), quote: str(s.quote) }; }),
      confidence: CERTAIN[L.confidence] ? L.confidence : 'settled',
      contested: isObj(L.contested) && Array.isArray(L.contested.views)
        ? { views: L.contested.views.filter(isObj).map(function (v) { return { label: str(v.label), text: str(v.text) }; }) } : null,
    };
  }
  // A chapter from a whole lesson doc (null for anything else). prev: the index's entry for it.
  function chapterFrom(topic, iid, doc, doneAt, prev) {
    if (!isObj(doc) || doc.status !== 'ready' || !isObj(doc.lesson) || !doneAt) return null;
    var idea = ideaOf(topic, iid) || {}, lesson = cleanLesson(doc.lesson, doc);
    var html = lesson.interactive && isObj(doc.interactive) && typeof doc.interactive.html === 'string' && doc.interactive.html ? doc.interactive.html : null;
    var edition = !prev ? 1 : (Number(prev.edition) || 1) + (prev.doneAt && String(prev.doneAt) !== String(doneAt) ? 1 : 0);
    var ch = {
      v: 1, tid: str(topic && topic.id), iid: str(iid), title: str(idea.title || lesson.title), oneLine: str(idea.oneLine),
      kind: str(idea.kind), deps: arr(idea.deps).map(str), lesson: lesson, sourced: doc.sourced !== false,
      plate: html, plateNote: null, doneAt: str(doneAt), edition: edition, boundAt: U.now(),
    };
    if (html && bytes(JSON.stringify(ch)) > LIMIT) { ch.plate = null; ch.plateNote = PLATE_NOTE; }
    return ch;
  }
  // The bibliography's research: every source the course's research kept (unique by address,
  // with the words quoted), and for each idea the sources its own research notes rest on.
  function researchFrom(docs) {
    var sources = [], at = {}, ideas = {};
    function add(s) {
      if (!isObj(s) || !/^https?:\/\//i.test(str(s.url))) return -1;
      var k = at[s.url];
      if (k == null) { k = at[s.url] = sources.length; sources.push({ title: str(s.title), url: str(s.url), quotes: [] }); }
      var q = str(s.quote).trim();
      if (q && sources[k].quotes.indexOf(q) < 0 && sources[k].quotes.length < 4) sources[k].quotes.push(q);
      return k;
    }
    arr(docs && docs.topic && docs.topic.sources).forEach(add);
    Object.keys(docs || {}).forEach(function (key) {
      if (key === 'topic') return;
      var list = [];
      arr(docs[key] && docs[key].sources).forEach(function (s) { var k = add(s); if (k >= 0 && list.indexOf(k) < 0) list.push(k); });
      if (list.length) ideas[key] = list;
    });
    return { sources: sources.slice(0, 80), ideas: ideas };
  }
  function chaptersOf(index) { return isObj(index && index.chapters) ? index.chapters : {}; }
  function countOf(index) {
    var have = chaptersOf(index);
    return arr(index && index.ideas).filter(function (i) { return isObj(i) && isObj(have[i.id]); }).length;
  }
  // The index patch: the plan's course content, the research, and dates. From progress only the
  // dates (startedAt); the chapter entry says when it was learned.
  function indexFrom(topic, progress, prev, research, entry) {
    var ideas = arr(topic.ideas).filter(isObj).map(function (i) { return { id: str(i.id), title: str(i.title), oneLine: str(i.oneLine), deps: arr(i.deps).map(str), kind: str(i.kind) }; });
    var started = prev && prev.startedAt ? String(prev.startedAt) : '';
    var pi = isObj(progress && progress.ideas) ? progress.ideas : {};
    Object.keys(pi).forEach(function (k) { var s = isObj(pi[k]) && pi[k].startedAt ? String(pi[k].startedAt) : ''; if (s && (!started || s < started)) started = s; });
    var have = Object.assign({}, chaptersOf(prev));
    if (entry) have[entry.iid] = entry.info;
    if (entry && (!started || String(entry.info.doneAt) < started)) started = String(entry.info.doneAt);
    var bound = ideas.filter(function (i) { return isObj(have[i.id]); });
    var last = bound.reduce(function (m, i) { var d = String(have[i.id].doneAt || ''); return d > m ? d : m; }, '');
    var patch = {
      v: 1, tid: str(topic.id), title: str(topic.title), hook: str(topic.hook), oneBreath: str(topic.oneBreath), ideas: ideas,
      startedAt: started || null, count: bound.length, total: ideas.length,
      finishedAt: ideas.length && bound.length >= ideas.length ? last : null,
      createdAt: prev && prev.createdAt ? prev.createdAt : U.now(),
    };
    // The research is replaced whole (an idea whose notes went away loses its entry: its source
    // numbers would point into the old list).
    if (research) patch.research = U.store && U.store.replacing ? U.store.replacing(prev && prev.research, research) : research;
    if (entry) { patch.chapters = {}; patch.chapters[entry.iid] = entry.info; }
    return patch;
  }

  // =====================================================================================
  // THE MODEL (pure): everything a page prints, derived by fixed rules (docs/ARCHITECTURE.md section 4, Dossiers)
  // =====================================================================================
  function roman(n) { var r = ''; [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].forEach(function (p) { while (n >= p[0]) { r += p[1]; n -= p[0]; } }); return r; }
  function paras(t) { return str(t).replace(/\r/g, '').split(/\n{2,}/).map(function (s) { return s.trim(); }).filter(Boolean); }
  function splitTitle(t) { var p = str(t).split(' — '); return { title: p[0].trim(), pub: (p[1] || '').trim() }; }
  function termsOf(L) { var out = [], re = /\[\[([^\]]+)\]\]/g, m, t = str(L && L.explain && L.explain.text); while ((m = re.exec(t))) if (out.indexOf(m[1]) < 0) out.push(m[1]); return out; }
  // "Put it into practice" (lesson.practice.text, U.rich text) sorted into the journal's parts by
  // fixed rules, word for word (nothing reworded or added): a part is named by its own lead label,
  // on a line of its own or before its text ("**Steps**", "Rule of thumb:", "**Worked example:**",
  // "## Common mistakes"); the label's words say which part it is (PRACTICE). A list with no label
  // is the steps (the first one); a block with no label carries on the labelled part before it,
  // else stays plain prose. Lists are "- " lines or numbered "1. " lines.
  // -> [{kind: 'steps'|'rules'|'example'|'mistakes'|'prose', label, paras: [text], items: [text], ordered}]
  var PRACTICE = [
    ['mistakes', /mistake|pitfall|trap|go(es)? wrong|watch out|avoid|error/i],
    ['rules', /\brules?\b/i],
    ['example', /example|for instance|worked|real case|case study/i],
    ['steps', /\bsteps?\b|how to|checklist|what to (do|look for|check)|in practice|method|try this/i],
  ];
  function practiceKind(label) { for (var i = 0; i < PRACTICE.length; i++) if (PRACTICE[i][1].test(label)) return PRACTICE[i][0]; return null; }
  function leadOf(line) {
    var m = /^#{1,4}\s+(.{1,60})$/.exec(line) || /^\*\*([^*]{1,60}?)\s*:?\s*\*\*\s*:?\s*([\s\S]*)$/.exec(line) || /^([A-Za-z][A-Za-z ’'-]{1,40}):(?:\s+([\s\S]*))?$/.exec(line);
    if (!m) return null;
    var label = m[1].replace(/[\s:*]+$/, '').trim(), kind = practiceKind(label);
    return kind ? { label: label, kind: kind, rest: str(m[2]).trim() } : null;
  }
  var BULLET = /^\s*(?:[-•*]|(\d{1,2})[.)])\s+/;
  // A paragraph with no label may still open by naming its part ("For example, …", "A common
  // mistake is …", "A good rule of thumb: …"); its words stay as they are.
  function openingKind(t) {
    t = U.plain(str(t)).trim();
    if (/^(for example|for instance|example\b|say you\b|suppose\b|imagine\b)/i.test(t)) return 'example';
    if (/^((a|the|one|two)\s+)?((common|usual|classic|easy|big)\s+)?(mistakes?|pitfalls?|traps?)\b|^(watch out|beware|don['’]t|do not|avoid|never)\b/i.test(t)) return 'mistakes';
    if (/^((a|one|the)\s+)?((good|simple|handy|useful)\s+)?rules? of thumb\b/i.test(t)) return 'rules';
    return null;
  }
  function practiceParts(text) {
    var parts = [], carry = null, named = null;
    str(text).replace(/\r/g, '').split(/\n{2,}/).forEach(function (block) {
      var lines = block.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      if (!lines.length) return;
      var lead = leadOf(lines[0]), own = lead || carry;
      carry = null;
      // The label becomes the heading, so the words after it start the part: a capital, as a sentence.
      if (lead) { lines[0] = lead.rest.replace(/^([^A-Za-z]*)([a-z])/, function (m, a, b) { return a + b.toUpperCase(); }); if (!lines[0]) lines.shift(); }
      if (!lines.length) { carry = lead; return; }   // a label on its own: it names the next block
      var ps = [], items = [], ordered = false;
      lines.forEach(function (l) {
        var b = BULLET.exec(l);
        if (b) { if (!items.length) ordered = !!b[1]; items.push(l.slice(b[0].length).trim()); } else if (items.length) items[items.length - 1] += ' ' + l; else ps.push(l);
      });
      if (ps.length) ps = [ps.join(' ')];
      var kind = own ? own.kind : !items.length ? openingKind(ps[0]) : null, prev = parts[parts.length - 1];
      if (!kind && items.length && !parts.some(function (p) { return p.kind === 'steps'; })) kind = 'steps';
      // Unlabelled: it carries on the labelled part just before it (or the prose before it).
      if (!kind && prev && (named === prev || prev.kind === 'prose')) { prev.paras = prev.paras.concat(ps); prev.items = prev.items.concat(items); return; }
      var part = { kind: kind || 'prose', label: own ? own.label : '', paras: ps, items: items, ordered: ordered };
      parts.push(part);
      named = kind ? part : null;
    });
    return parts;
  }
  // book: {tid, title, hook, oneBreath, ideas, startedAt, research, chapters:{iid: chapter doc}, no, topic?}
  function model(book) {
    var base = '#/book/' + encodeURIComponent(book.tid), ideas = arr(book.ideas).filter(isObj), N = ideas.length, docs = book.chapters || {};
    var chapters = ideas.map(function (idea, k) {
      var d = isObj(docs[idea.id]) && isObj(docs[idea.id].lesson) ? docs[idea.id] : null;
      return { n: k + 1, rn: roman(k + 1), idea: idea, learned: d ? d.doneAt : null, doc: d, lesson: d ? d.lesson : null, href: base + '/' + encodeURIComponent(idea.id) };
    });
    chapters.forEach(function (c) {
      c.hasPlate = !!(c.lesson && c.lesson.interactive && c.doc && (c.doc.plate || c.doc.plateNote));
      // Older chapters (bound before lessons had it) have no practice: their last leaf is the sources.
      var pr = c.lesson && isObj(c.lesson.practice) ? practiceParts(c.lesson.practice.text) : [];
      c.practice = pr.length ? pr : null;
    });
    var bound = chapters.filter(function (c) { return c.learned; });
    var byId = {}; chapters.forEach(function (c) { byId[c.idea.id] = c; });
    // Bibliography: one entry per web page the course's research and the bound lessons kept.
    var works = [], byUrl = {};
    function work(title, url) {
      var w = byUrl[url];
      if (!w) { var t = splitTitle(title); w = byUrl[url] = { title: t.title || url, pub: t.pub, url: url, quotes: [], ch: [] }; works.push(w); }
      return w;
    }
    function quote(w, q) { q = str(q).trim(); if (q && w.quotes.indexOf(q) < 0) w.quotes.push(q); }
    var research = isObj(book.research) ? book.research : { sources: [], ideas: {} }, rs = arr(research.sources);
    rs.forEach(function (s) { if (isObj(s) && s.url) { var w = work(s.title, s.url); arr(s.quotes).forEach(function (q) { quote(w, q); }); } });
    bound.forEach(function (c) {
      arr(isObj(research.ideas) ? research.ideas[c.idea.id] : null).forEach(function (k) { var s = rs[k]; if (isObj(s) && s.url) { var w = byUrl[s.url]; if (w && w.ch.indexOf(c.n) < 0) w.ch.push(c.n); } });
      arr(c.lesson.sources).forEach(function (s) { if (!s.url) return; var w = work(s.title, s.url); quote(w, s.quote); if (w.ch.indexOf(c.n) < 0) w.ch.push(c.n); });
    });
    works.forEach(function (w) { w.ch.sort(function (a, b) { return a - b; }); });
    works.sort(function (a, b) { return (a.pub || a.title).localeCompare(b.pub || b.title) || a.title.localeCompare(b.title); });
    // Glossary: each [[key term]] with the sentence that introduces it. A sentence that opens with
    // "This/That/These/It/Such" brings the sentence before it, or else the idea's one-line summary.
    var gloss = [];
    bound.forEach(function (c) {
      paras(c.lesson.explain.text).forEach(function (p) {
        var ss = p.match(/[^.!?]+[.!?]+(\[\^\d+\])*["”’]?\s*|[^.!?]+$/g) || [p];
        ss.forEach(function (s, i) {
          var m, re = /\[\[([^\]]+)\]\]/g;
          while ((m = re.exec(s))) {
            var term = m[1];
            if (gloss.some(function (g) { return g.term.toLowerCase() === term.toLowerCase(); })) continue;
            var lead = /^\s*(This|That|These|It|Such)\b/.test(s) ? (i ? ss[i - 1] : str(c.idea.oneLine) + ' ') : '';
            gloss.push({ term: term, text: (lead + s).replace(/\[\^\d+\]/g, '').replace(/\s+/g, ' ').trim(), ch: c });
          }
        });
      });
    });
    gloss.sort(function (a, b) { return a.term.localeCompare(b.term); });
    var hasBack = gloss.length > 0 || works.length > 0;
    // The reading order, for page turns: cover, contents, each bound chapter's leaves, back matter.
    var leaves = [{ id: 'cover', href: base, k: 'Cover' }, { id: 'contents', href: base + '/contents', k: 'Contents' }];
    bound.forEach(function (c) {
      leaves.push({ id: c.idea.id + ':1', href: c.href, k: 'Chapter ' + c.rn, t: c.idea.title });
      if (c.hasPlate) leaves.push({ id: c.idea.id + ':2', href: c.href + '/plate', k: 'Plate ' + c.rn, t: c.lesson.interactive.title });
      leaves.push(c.practice ? { id: c.idea.id + ':3', href: c.href + '/practice', k: 'Put it into practice', t: 'and sources, chapter ' + c.rn }
        : { id: c.idea.id + ':3', href: c.href + '/practice', k: 'Sources', t: 'chapter ' + c.rn });
    });
    if (hasBack) leaves.push({ id: 'back', href: base + '/glossary', k: 'Glossary', t: 'and bibliography' });
    var done = N > 0 && bound.length >= N;
    var finished = done ? bound.reduce(function (m, c) { return String(c.learned) > m ? String(c.learned) : m; }, '') : null;
    return { book: book, base: base, N: N, chapters: chapters, bound: bound, byId: byId, works: works, gloss: gloss, hasBack: hasBack, leaves: leaves,
      // A kept dossier whose course was deleted can never gain a chapter: closed, not in progress.
      done: done, finished: finished, closed: !done && !!book.kept, no: book.no || 0 };
  }

  // =====================================================================================
  // STORE-BACKED: binding chapters, backfill, keep and remove
  // =====================================================================================
  function on(progress) { return !(progress && progress.dossier === false); }
  var books = {}, numbersP = null, synced = {};
  function changed(tid) { delete books[tid]; numbersP = null; }
  function readResearch(tid, topic) {
    var keys = ['topic'].concat(arr(topic.ideas).filter(isObj).map(function (i) { return i.id; }));
    return Promise.all(keys.map(function (k) { return U.store.research.get(tid, k).catch(function () { return null; }); })).then(function (list) {
      var docs = {}; keys.forEach(function (k, i) { if (list[i]) docs[k] = list[i]; });
      return researchFrom(docs);
    });
  }
  // Binds one finished idea as a chapter (again, for a new edition). o: {doc, doneAt, topic,
  // progress}. Resolves the chapter written, or null (the course keeps no dossier, the lesson is not
  // whole, or saving failed). Never rejects.
  function bind(tid, iid, o) {
    o = o || {};
    return Promise.all([o.topic || U.store.topic.get(tid), o.progress || U.store.progress.get(tid), U.store.dossier.get(tid)]).then(function (r) {
      var topic = r[0], progress = r[1] || {}, index = r[2];
      if (!topic || !on(progress)) return null;
      var pi = isObj(progress.ideas) && isObj(progress.ideas[iid]) ? progress.ideas[iid] : {};
      var doneAt = o.doneAt || pi.doneAt;
      if (!doneAt) return null;
      var prev = chaptersOf(index)[iid] || null;
      return Promise.resolve(o.doc || U.store.lesson.get(tid, iid)).then(function (doc) {
        var ch = chapterFrom(topic, iid, doc, doneAt, prev);
        if (!ch) return null;
        return readResearch(tid, topic).then(function (research) {
          return U.store.dossier.chapter.set(tid, iid, ch).then(function () {
            var info = { doneAt: ch.doneAt, edition: ch.edition, plate: !!(ch.plate || ch.plateNote), title: ch.title };
            return U.store.dossier.patch(tid, indexFrom(topic, progress, index, research, { iid: iid, info: info }));
          }).then(function () { changed(tid); return ch; });
        });
      });
    }).catch(function (e) { console.warn('dossier: could not bind', tid, iid, e); return null; });
  }
  // The finished ideas a dossier still lacks (or holds an older edition of). An idea whose Learn it
  // again request is open is left alone: its lesson doc may be the fresh one, not yet learned.
  function due(topic, progress, index) {
    var pi = isObj(progress && progress.ideas) ? progress.ideas : {}, have = chaptersOf(index);
    return arr(topic.ideas).filter(function (i) {
      var p = isObj(i) ? pi[i.id] : null;
      if (!isObj(p) || p.stage !== 'done' || !p.doneAt || p.relearnId) return false;
      var c = have[i.id];
      return !isObj(c) || !c.doneAt || String(c.doneAt) < String(p.doneAt);
    }).map(function (i) { return i.id; });
  }
  // Backfill: binds what a course's dossier lacks, one chapter after another. Once per page load
  // per course unless o.force. o: {topic, progress, index} already read. Resolves how many it bound
  // (a later call in the same page load, which does nothing, resolves 0).
  function sync(tid, o) {
    o = o || {};
    if (!o.force && synced[tid]) return synced[tid];
    var p = Promise.all([o.topic || U.store.topic.get(tid), o.progress || U.store.progress.get(tid), 'index' in o ? o.index : U.store.dossier.get(tid)]).then(function (r) {
      var topic = r[0], progress = r[1] || {}, index = r[2];
      if (!topic || topic.status !== 'ready' || !on(progress)) return 0;
      var n = 0;
      return due(topic, progress, index).reduce(function (chain, iid) {
        return chain.then(function () { return bind(tid, iid, { topic: topic, progress: progress }).then(function (c) { if (c) n++; }); });
      }, Promise.resolve()).then(function () { return n; });
    }).catch(function (e) { console.warn('dossier: sync', tid, e); delete synced[tid]; return 0; });
    synced[tid] = p.then(function () { return 0; });
    return p;
  }
  function syncAll(topics, progressAll, list) {
    var byTid = {}; arr(list).forEach(function (d) { if (d && d.__id) byTid[d.__id] = d; });
    var n = 0;
    return arr(topics).filter(function (t) { return isObj(t) && t.id && t.status === 'ready'; }).reduce(function (chain, t) {
      return chain.then(function () {
        return sync(t.id, { topic: t, progress: (progressAll || {})[t.id] || { ideas: {} }, index: byTid[t.id] || null }).then(function (k) { n += k; });
      });
    }, Promise.resolve()).then(function () { return n; });
  }
  // Before a course is deleted with its dossier kept: bind everything finished while the lessons
  // still exist, then mark it kept (it opens with no course behind it).
  function keep(tid) {
    return sync(tid, { force: true }).then(function () { return U.store.dossier.patch(tid, { kept: true, keptAt: U.now() }); }).then(function () { changed(tid); });
  }
  function remove(tid) { return U.store.dossier.remove(tid).then(function () { changed(tid); }); }
  function setOn(tid, v) {
    return U.store.progress.patch(tid, { dossier: !!v }).then(function () {
      changed(tid);
      if (v) return sync(tid, { force: true });
    }).catch(function (e) { if (!(e && e.queued)) console.warn('dossier: option', e); });
  }

  // Loads what a dossier shows: its index and chapters (cached while the index is unchanged), or
  // for a course that keeps one but has no chapter yet, the plan. null: nothing to show.
  function load(tid) {
    return Promise.all([U.store.dossier.get(tid), U.store.topic.get(tid).catch(function () { return null; }), numbers()]).then(function (r) {
      var index = r[0], topic = r[1], no = r[2][tid] || 0;
      if (index && index.title && arr(index.ideas).length) {
        var c = books[tid];
        var chapters = c && c.at === index.updatedAt ? Promise.resolve(c.chapters) : U.store.dossier.chapters(tid).then(function (list) {
          var o = {}; list.forEach(function (d) { o[d.__id] = d; });
          books[tid] = { at: index.updatedAt, chapters: o };
          return o;
        });
        return chapters.then(function (ch) {
          return { tid: tid, title: index.title, hook: index.hook, oneBreath: index.oneBreath, ideas: index.ideas, startedAt: index.startedAt,
            research: index.research, chapters: ch, no: no, topic: topic, kept: !topic };
        });
      }
      if (!topic || topic.status !== 'ready' || !arr(topic.ideas).length) return null;
      return U.store.progress.get(tid).then(function (pr) {
        if (!on(pr)) return null;
        return { tid: tid, title: topic.title, hook: topic.hook, oneBreath: topic.oneBreath, ideas: topic.ideas, startedAt: null, research: null, chapters: {}, no: no, topic: topic };
      });
    });
  }
  // Each dossier's number: its place in the order the courses were begun (stable; kept ones too).
  function numbers() {
    if (!numbersP) {
      numbersP = U.store.dossier.list().then(function (list) {
        var o = {};
        list.filter(function (d) { return d && d.title; }).sort(function (a, b) {
          return String(a.startedAt || a.createdAt || '').localeCompare(String(b.startedAt || b.createdAt || '')) || String(a.__id).localeCompare(String(b.__id));
        }).forEach(function (d, k) { o[d.__id] = k + 1; });
        return o;
      }).catch(function () { numbersP = null; return {}; });
    }
    return numbersP;
  }

  // =====================================================================================
  // DRAWING HELPERS (DOM from here on)
  // =====================================================================================
  var I = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 5.5 8.5 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 5.5 15.5 12 9 18.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M9 6.5h11M9 12h11M9 17.5h11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M4.2 6.5h.6M4.2 12h.6M4.2 17.5h.6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    nib: '<svg viewBox="0 0 34 34"><path d="M24.6 4.2 29.8 9.4 15.9 23.6 10.2 24.1 10.6 18.3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10.4 24 4.6 29.6M14.1 19.9l3.2-3.1M21.6 7.3l5.1 5.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="17.6" cy="16.5" r="1.4" fill="currentColor"/></svg>',
    warn: '<svg viewBox="0 0 34 34"><path d="M16.6 4.4C17.4 4 18 4.6 18.5 5.5l11.6 21.4c.5 1 .1 2-1.1 2.1-7.7.3-15.6.4-23.2 0-1.2-.1-1.6-1.1-1-2.1L15.3 5.5c.3-.5.7-.9 1.3-1.1Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M17.1 12.2c-.2 2.9-.1 6 .2 8.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="17.3" cy="24.6" r="1.5" fill="currentColor"/></svg>',
    arrow: '<svg viewBox="0 0 40 30"><path d="M3 4c3 11 12 18 30 19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M27 17.5l7 5.6-7.6 4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    xref: '<svg viewBox="0 0 40 30"><path d="M36 26C30 12 19 5 5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M11 1 4.5 6l6.6 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    box: '<svg viewBox="0 0 22 22"><path d="M2.6 3.1c5.6-.5 11.2-.4 16.6-.1.3 5.4.4 10.8 0 16.1-5.5.4-11 .4-16.4.1-.4-5.3-.5-10.8-.2-16.1Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    tick: '<svg viewBox="0 0 22 22"><path d="M2.6 3.1c5.6-.5 11.2-.4 16.6-.1.3 5.4.4 10.8 0 16.1-5.5.4-11 .4-16.4.1-.4-5.3-.5-10.8-.2-16.1Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" opacity=".7"/><path d="M5.2 11.4c1.6 1.4 3 3 4.1 4.8 2.6-5.1 6-9.4 10.6-13.4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ring: '<svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M54 4C80 3 97 14 96 30 95 47 74 57 48 56 22 55 4 45 5 29 6 14 26 5 46 6c6 0 12 1 18 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>',
    out: '<svg viewBox="0 0 12 12"><path d="M4.5 2.5h5v5M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    hand: '<svg viewBox="0 0 24 24"><path d="M8.6 12.4V5.6c0-1 .8-1.7 1.7-1.7s1.6.7 1.6 1.7v5.2m0-1.3c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v1.4m0-.6c0-.9.7-1.5 1.6-1.5s1.5.7 1.5 1.5v1.2m0-.2c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4v3.9c0 3.8-2.6 6.5-6.4 6.5h-1.2c-2.2 0-3.7-.9-5-2.6l-3-4.1c-.6-.8-.4-1.8.3-2.3.8-.5 1.7-.3 2.3.4l1.2 1.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M4.6 8.3 7 10.5l4.4-4.8" fill="none" stroke="var(--on-green, #fff)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clip: '<svg viewBox="0 0 22 56"><path d="M15 15v26a5 5 0 0 1-10 0V9a3.6 3.6 0 0 1 7.2 0v30a1.6 1.6 0 0 1-3.2 0V15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    splat: '<svg viewBox="0 0 150 120"><path d="M38 30c9-6 22-4 27 4 6 9 18 4 22 12 3 7-6 11-4 18 2 8-7 13-15 10-8-3-12 5-21 2-9-4-6-12-13-16-8-5-8-14-3-20 3-4 3-7 7-10Z" fill="currentColor"/><circle cx="96" cy="22" r="4.5" fill="currentColor"/><circle cx="108" cy="40" r="2.6" fill="currentColor"/><circle cx="20" cy="70" r="3.4" fill="currentColor"/><circle cx="74" cy="92" r="2.2" fill="currentColor"/><circle cx="12" cy="20" r="2" fill="currentColor"/><path d="M84 54c8 2 16 6 24 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    stain: '<svg viewBox="0 0 220 220"><g filter="url(#dos-wobble)"><circle cx="110" cy="110" r="84" fill="currentColor" opacity=".3"/><circle cx="110" cy="110" r="86" fill="none" stroke="currentColor" stroke-width="6" opacity=".8"/><circle cx="112" cy="108" r="80" fill="none" stroke="currentColor" stroke-width="2" opacity=".55"/></g></svg>',
    chev: '<svg viewBox="0 0 16 16"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  // Static, app-written SVG only (never model text).
  function svg(markup, cls) {
    var el = U.svg(markup);
    el.setAttribute('aria-hidden', 'true'); el.setAttribute('focusable', 'false');
    if (cls) el.setAttribute('class', cls);
    return el;
  }
  function icon(n, cls) { return svg(I[n], cls); }
  function vh(t) { return h('span', { class: 'vh' }, t); }
  function cap(s) { s = str(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function safeUrl(url) { return /^https?:\/\//i.test(str(url)) ? str(url) : null; }
  function day(iso, o) { var d = new Date(iso); return iso && !isNaN(d) ? d.toLocaleDateString('en-GB', o) : ''; }
  function longDate(iso) { return day(iso, { day: 'numeric', month: 'long', year: 'numeric' }); }
  function shortDate(iso) { return day(iso, { day: 'numeric', month: 'short', year: 'numeric' }); }
  function fmtNum(v, unit) { return String(v) + (unit ? (/^[°%′″]/.test(unit) ? '' : ' ') + unit : ''); }
  function unquote(q) { return '“' + str(q).trim().replace(/^["“]|["”]$/g, '') + '”'; }
  function reduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function clothOf(no) { return CLOTH[((no || 1) - 1) % CLOTH.length]; }

  // The hand-lettered fonts: a second Google Fonts link, added the first time a dossier or the
  // Library is drawn (never at boot). Fallbacks paint first (display=swap).
  var fontsAdded = false;
  function fonts() {
    if (fontsAdded || typeof document === 'undefined') return;
    fontsAdded = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONTS; l.setAttribute('data-dossier-fonts', '');
    document.head.appendChild(l);
  }
  // Torn paper edges: four seeded 160 px strips used as mask layers (75-dossier.css, .page::before),
  // and the filter that wobbles drawn stains. Made once, on the first dossier drawn.
  var furnished = false;
  function furnish() {
    if (furnished) return;
    furnished = true;
    var root = document.documentElement, r = 11;
    function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; }
    function strip(vertical, amp, flip) {
      var L = 160, D = 8, pts = [], t = 0, d;
      while (t < L) { pts.push([t, D - 1 - rnd() * amp - (rnd() < .08 ? 1.6 : 0)]); t += 4 + rnd() * 6; }
      pts.push([L, pts[0][1]]);
      if (vertical) d = 'M0 0' + pts.map(function (p) { return 'L' + p[1].toFixed(1) + ' ' + p[0].toFixed(1); }).join('') + 'L0 ' + L + 'Z';
      else d = 'M0 0' + pts.map(function (p) { return 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') + 'L' + L + ' 0Z';
      var w = vertical ? D : L, hh = vertical ? L : D;
      var tr = flip === 'x' ? " transform='translate(" + w + " 0) scale(-1 1)'" : flip === 'y' ? " transform='translate(0 " + hh + ") scale(1 -1)'" : '';
      return 'url("data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + hh + "'><path" + tr + " d='" + d + "'/></svg>") + '")';
    }
    var r0 = r;
    root.style.setProperty('--tear-r', strip(true, 4.5)); r = r0;
    root.style.setProperty('--tear-l', strip(true, 4.5, 'x'));
    var r1 = r;
    root.style.setProperty('--tear-b', strip(false, 4)); r = r1;
    root.style.setProperty('--tear-t', strip(false, 4, 'y'));
    var defs = U.svg('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><filter id="dos-wobble" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>');
    document.body.appendChild(defs);
  }
  // A margin sketch for each kind of idea: it says the kind, never the topic (seeded wobble).
  function sketch(kind, seed) {
    var r = seed || 1;
    function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; }
    function j(v, a) { return +(v + (rnd() - .5) * 2 * (a == null ? 1.1 : a)).toFixed(1); }
    function ln(x1, y1, x2, y2) { return 'M' + j(x1) + ' ' + j(y1) + 'Q' + j((x1 + x2) / 2, 1.6) + ' ' + j((y1 + y2) / 2, 1.6) + ' ' + j(x2) + ' ' + j(y2); }
    function circ(cx, cy, rad, over) { var n = 14, d = '', a0 = rnd() * 6.28; for (var i = 0; i <= n * (1 + (over == null ? .12 : over)); i++) { var a = a0 + i / n * 6.283, rr = rad * (1 + (rnd() - .5) * .06); d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); } return d; }
    function gear(cx, cy, rad, teeth, dep) { var d = '', n = teeth * 4; for (var i = 0; i <= n; i++) { var a = i / n * 6.283, o = i % 4 === 1 || i % 4 === 2, rr = (o ? rad + dep : rad) * (1 + (rnd() - .5) * .05); d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); } return d + circ(cx, cy, rad * .35, .05); }
    function hatch(x, y, w, hh, s) { var d = ''; for (var t = 0; t < w + hh; t += s) d += ln(x + Math.min(t, w), y + Math.max(0, t - w), x + Math.max(0, t - hh), y + Math.min(t, hh)); return d; }
    var P = [];
    if (kind === 'mechanism') P.push(gear(32, 48, 17, 9, 5), gear(61, 25, 10, 7, 4), ln(8, 74, 74, 72));
    else if (kind === 'quantity') {
      P.push('M' + j(10) + ' ' + j(52) + 'A30 30 0 0 1 ' + j(70) + ' ' + j(52), ln(10, 52, 70, 52), ln(40, 52, 58, 30), circ(40, 52, 3, 0));
      for (var k = 0; k <= 6; k++) { var a = Math.PI + k / 6 * Math.PI; P.push(ln(40 + Math.cos(a) * 30, 52 + Math.sin(a) * 30, 40 + Math.cos(a) * 25, 52 + Math.sin(a) * 25)); }
      P.push(ln(8, 66, 74, 66)); for (var t = 12; t < 74; t += 8) P.push(ln(t, 66, t, t % 16 ? 70 : 72));
    } else if (kind === 'process') P.push(circ(40, 16, 8), circ(64, 56, 8), circ(16, 56, 8), ln(47, 22, 59, 46), ln(56, 59, 25, 59), ln(19, 47, 33, 22), ln(54, 43, 59, 46), ln(59, 46, 61, 40), ln(28, 55, 25, 59), ln(25, 59, 29, 63));
    else if (kind === 'structure') P.push(ln(20, 30, 46, 18), ln(46, 18, 70, 30), ln(70, 30, 44, 42), ln(44, 42, 20, 30), ln(20, 30, 20, 62), ln(44, 42, 44, 74), ln(70, 30, 70, 62), ln(20, 62, 44, 74), ln(44, 74, 70, 62), hatch(46, 44, 22, 26, 5));
    else if (kind === 'history') P.push(ln(22, 10, 58, 10), ln(22, 70, 58, 70), 'M' + j(26) + ' 12C' + j(26) + ' 32 ' + j(54) + ' 32 ' + j(54) + ' 12', 'M' + j(26) + ' 68C' + j(26) + ' 48 ' + j(54) + ' 48 ' + j(54) + ' 68', ln(40, 38, 40, 58), hatch(30, 58, 20, 10, 3.5));
    else P.push('M' + j(30) + ' 52C' + j(18) + ' 42 ' + j(16) + ' 18 ' + j(40) + ' 12C' + j(64) + ' 18 ' + j(62) + ' 42 ' + j(50) + ' 52', ln(30, 52, 50, 52), ln(31, 58, 49, 58), ln(33, 64, 47, 64), ln(8, 14, 16, 18), ln(72, 14, 64, 18));
    var d = P.join('');
    return '<svg viewBox="0 0 80 80"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="currentColor" stroke-width=".8" stroke-linecap="round" opacity=".45" transform="translate(1.2 .9) rotate(.6 40 40)"/></svg>';
  }

  // Lesson rich text, with footnote chips that open a source card in place (fx.open(n, chip)) and
  // stay on the line of the word before them. fx: {by: {n: source}, open} or null (no chips).
  function chipsIn(el, fx) {
    Array.prototype.slice.call(el.querySelectorAll('button.fn')).forEach(function (b) {
      var n = Number(b.textContent), s = fx && fx.by[n];
      if (!s) { b.remove(); return; }
      b.setAttribute('aria-label', 'Source ' + n + ': ' + splitTitle(s.title).title);
      if (fx.pop) b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', function () { fx.open(n, b); });
      var prev = b.previousSibling;
      if (prev && prev.nodeType === 1 && prev.classList.contains('nw')) { prev.appendChild(b); return; }
      var nw = h('span', { class: 'nw' });
      b.parentNode.insertBefore(nw, b);
      if (prev && prev.nodeType === 3) {
        var m = /(\S+)$/.exec(prev.nodeValue);
        if (m) { prev.nodeValue = prev.nodeValue.slice(0, m.index); nw.appendChild(document.createTextNode(m[1])); }
      } else if (prev && prev.nodeType === 1) nw.appendChild(prev);
      nw.appendChild(b);
    });
    return el;
  }
  function fnOpts(fx) { return { footnotes: { has: function (n) { return !!(fx && fx.by[n]); }, open: function () {} } }; }
  function inl(el, text, fx) { return chipsIn(U.inline(el, text, fnOpts(fx)), fx); }
  function rich(text, fx) { var d = h('div'); d.appendChild(U.rich(text, fnOpts(fx))); chipsIn(d, fx); return Array.prototype.slice.call(d.childNodes); }
  function sourcesOf(L) { var by = {}; arr(L && L.sources).forEach(function (s) { by[s.n] = s; }); return by; }

  // =====================================================================================
  // THE READER: one leaf (two pages) per route, in reading order
  // =====================================================================================
  function reader(kind) {
    return function (params, ctx) {
      var tid = params.tid, iid = params.iid || null;
      fonts(); furnish();
      var root = h('div', { class: 'dos reader' }, h('header', { class: 'r-bar' }, h('a', { class: 'r-btn', href: '#/library/dossiers' }, icon('back'), h('span', null, 'Dossiers'))));
      ctx.view.appendChild(root);
      var S = { root: root, ctx: ctx, plates: [], io: null, pop: null, popFrom: null, offs: [] };
      load(tid).then(function (book) {
        if (!ctx.alive()) return;
        if (!book) { U.notHere(ctx.view); return; }
        draw(S, model(book), kind, iid);
        // Backfill once per page load: chapters finished before dossiers existed, or missed.
        if (book.topic) sync(tid).then(function (n) { if (n && ctx.alive()) U.go(U.currentHash()); });
      }, function (e) {
        if (!ctx.alive()) return;
        console.warn('dossier: load', e);
        var V = U.views;
        root.appendChild(h('div', { class: 'd-loaderr' }, V && V.loadError ? V.loadError('This dossier', e, false) : h('p', null, U.errText(e))));
      });
      return function () {
        closePop(S, false);
        if (S.io) S.io.disconnect();
        S.plates.forEach(function (p) { if (p.api) try { p.api.destroy(); } catch (e) { /* gone */ } });
        S.offs.forEach(function (f) { f(); });
      };
    };
  }
  function draw(S, M, kind, iid) {
    var c = iid ? M.byId[iid] : null;
    if (kind === 'cover') return cover(S, M);
    if (kind === 'back' || kind === 'biblio') return M.hasBack ? backMatter(S, M, kind) : contents(S, M);
    if (kind === 'contents' || !c || !c.learned) return contents(S, M);
    if (kind === 'practice') return chapterPractice(S, M, c);
    if ((kind === 'plate' || kind === 'play') && c.hasPlate) return chapterPlate(S, M, c, kind === 'play');
    return chapterIdea(S, M, c);
  }

  // ---------- page furniture ----------
  function tape(cls) { return h('span', { class: 'tape ' + (cls || ''), 'aria-hidden': 'true' }); }
  function deco(name, cls) { return h('span', { class: 'deco ' + cls, 'aria-hidden': 'true' }, icon(name)); }
  function runhead() { return h('p', { class: 'runhead', 'aria-hidden': 'true' }, Array.prototype.slice.call(arguments).map(function (t) { return h('span', null, t); })); }
  function squares(done, total) { var out = []; for (var k = 0; k < total; k++) out.push(h('i', { class: k < done ? 'on' : '' })); return h('span', { class: 'sq', 'aria-hidden': 'true' }, out); }
  function stamp(cls, big, small, label) {
    return h('p', { class: 'stamp ' + cls }, h('span', { 'aria-hidden': label ? 'true' : null }, big), small ? h('small', { 'aria-hidden': label ? 'true' : null }, small) : null, label ? vh(label) : null);
  }
  function bar(S, head) {
    var b = h('header', { class: 'r-bar' },
      h('a', { class: 'r-btn', href: '#/library/dossiers' }, icon('back'), h('span', null, 'Dossiers')),
      h('p', { class: 'r-head' }, head),
      h('button', { class: 'r-btn r-aa', type: 'button', 'aria-label': 'Reading settings', on: { click: function () { if (U.settings && U.settings.open) U.settings.open(); } } }, 'Aa'));
    return b;
  }
  function tabs(M, cur) {
    var items = [h('li', null, h('a', { href: M.base + '/contents', 'aria-current': cur === 'contents' ? 'page' : null, class: 'tab-ico' }, icon('list'), vh('Contents')))];
    M.chapters.forEach(function (c) {
      if (M.closed && !c.learned) return;
      items.push(h('li', null, c.learned
        ? h('a', { href: c.href, 'aria-current': cur === c.idea.id ? 'page' : null }, c.rn, vh(', chapter ' + c.n + ': ' + c.idea.title))
        : h('span', { class: 'off' }, c.rn, vh(', chapter ' + c.n + ': not yet written'))));
    });
    if (M.hasBack) items.push(h('li', null, h('a', { href: M.base + '/glossary', 'aria-current': cur === 'back' ? 'page' : null }, 'A–Z', vh(': glossary and bibliography'))));
    return h('nav', { class: 'd-tabs', 'aria-label': 'Chapters' }, h('ol', null, items));
  }
  function turnLinks(M, leafId) {
    var k = -1; M.leaves.forEach(function (l, i) { if (l.id === leafId) k = i; });
    return { prev: k > 0 ? M.leaves[k - 1] : null, next: k >= 0 ? M.leaves[k + 1] || null : null };
  }
  function turnNav(t) {
    function a(l, dir) {
      return h('a', { class: dir, href: l.href, rel: dir }, dir === 'prev' ? icon('back') : null,
        h('span', { class: 'tw' }, h('span', { class: 'tk' }, (dir === 'prev' ? 'Back: ' : 'Next: ') + l.k), l.t ? h('span', { class: 'tt' }, l.t) : null),
        dir === 'next' ? icon('next') : null);
    }
    return h('nav', { class: 'turn', 'aria-label': 'Turn the page' }, t.prev ? a(t.prev, 'prev') : h('span'), t.next ? a(t.next, 'next') : null);
  }
  // The laptop's page-turn arrows on the desk (the turn links and the arrow keys do the same).
  function sideArrows(t) {
    return h('div', { class: 'sides', 'aria-hidden': 'true' },
      t.prev ? h('a', { class: 'side-a prev', href: t.prev.href, tabindex: '-1', title: t.prev.k }, icon('back')) : null,
      t.next ? h('a', { class: 'side-a next', href: t.next.href, tabindex: '-1', title: t.next.k + (t.next.t ? ' · ' + t.next.t : '') }, icon('next')) : null);
  }
  // The arrow keys turn pages, except in the plate, a form control, details, a sheet or a source card.
  function keys(S) {
    function onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented || S.pop || (U._sheets && U._sheets.length)) return;
      var t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, [contenteditable], iframe, details, [role="radio"], [role="slider"]')) return;
      var a = e.key === 'ArrowRight' ? S.root.querySelector('.turn .next') : e.key === 'ArrowLeft' ? S.root.querySelector('.turn .prev') : null;
      if (a) { e.preventDefault(); U.go(a.getAttribute('href')); }
    }
    document.addEventListener('keydown', onKey);
    S.offs.push(function () { document.removeEventListener('keydown', onKey); });
  }
  function leaf(S, M, o) {
    var t = turnLinks(M, o.leaf);
    // One page alone (a chapter's sources, without practice) stands as a single right-hand page.
    var spread = h('article', { class: 'spread enter' + (o.left ? '' : ' single') }, o.left, o.right);
    U.clear(S.root);
    U.append(S.root, [bar(S, M.book.title), tabs(M, o.tab), h('div', { class: 'd-book' }, spread, turnNav(t)), sideArrows(t)]);
    keys(S);
    startPlates(S);
    return spread;
  }
  function page(side, label, kids) { return h('section', { class: 'page page-' + side, 'aria-label': label }, kids); }

  // ---------- footnotes: a source card that opens in place ----------
  function closePop(S, refocus) {
    if (!S.pop) return;
    S.pop.remove(); S.pop = null;
    if (S.popFrom) { S.popFrom.setAttribute('aria-expanded', 'false'); if (refocus) try { S.popFrom.focus(); } catch (e) { /* gone */ } }
  }
  function popFx(S, L, more) {
    var fx = { by: sourcesOf(L), pop: true };
    fx.open = function (n, b) {
      if (S.pop && S.popFrom === b) { closePop(S, true); return; }
      closePop(S, false); S.popFrom = b;
      var s = fx.by[n], t = splitTitle(s.title), url = safeUrl(s.url);
      S.pop = h('div', { class: 'fn-pop', role: 'dialog', 'aria-label': 'Source ' + n, tabindex: '-1' },
        h('p', { class: 'fp-n' }, 'Source ' + n),
        h('p', { class: 'fp-t' }, t.title, t.pub ? h('span', { class: 'pub' }, ' · ' + t.pub) : null),
        s.quote ? h('blockquote', null, unquote(s.quote)) : null,
        h('p', { class: 'fp-l' }, url ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, hostOf(url), icon('out'), vh(' (opens a new tab)')) : null,
          more ? h('a', { href: more }, 'All sources') : null));
      S.root.appendChild(S.pop);
      var r = b.getBoundingClientRect(), w = Math.min(340, innerWidth - 24);
      S.pop.style.width = w + 'px';
      S.pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + 'px';
      var below = r.bottom + 8, ph = S.pop.offsetHeight;
      S.pop.style.top = (below + ph < innerHeight - 8 ? below : Math.max(60, r.top - ph - 8)) + 'px';
      b.setAttribute('aria-expanded', 'true');
      S.popAt = Date.now();
      S.pop.focus({ preventScroll: true });
    };
    if (!S.popWired) {
      S.popWired = true;
      var onKey = function (e) { if (e.key === 'Escape' && S.pop) { e.preventDefault(); closePop(S, true); } else if (e.key === 'Tab' && S.pop) setTimeout(function () { if (S.pop && !S.pop.contains(document.activeElement)) closePop(S, false); }, 0); };
      var onClick = function (e) { if (S.pop && !S.pop.contains(e.target) && !(e.target.closest && e.target.closest('.fn'))) closePop(S, false); };
      // Scrolling the page closes the card (not the scroll that brought the chip into view).
      var onScroll = function () { if (Date.now() - (S.popAt || 0) > 400) closePop(S, false); };
      document.addEventListener('keydown', onKey); document.addEventListener('click', onClick); window.addEventListener('scroll', onScroll, { passive: true });
      S.offs.push(function () { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); window.removeEventListener('scroll', onScroll); });
    }
    return fx;
  }

  // ---------- cover: the closed field book ----------
  function cover(S, M) {
    var b = M.book, no = M.no, n = M.bound.length;
    U.setTitle(b.title + ' · Dossier');
    var rows = [['Begun', shortDate(b.startedAt) || '—']];
    if (M.done) rows.push(['Finished', shortDate(M.finished)]);
    rows.push(['Ideas', String(M.N)]);
    if (M.works.length) rows.push(['Sources', String(M.works.length)]);
    var first = M.bound[0], t = turnLinks(M, 'cover');
    var saveBtn = h('button', { class: 'd-btn d-ghost d-save', type: 'button', on: { click: function () { save(M, saveBtn); } } }, 'Save a copy');
    U.clear(S.root);
    U.append(S.root, [
      bar(S, no ? 'Dossier No. ' + no : 'Dossier'),
      h('div', { class: 'cover-stage enter' },
        h('div', { class: 'jcover', style: '--cloth:' + clothOf(no), on: { click: function (e) { if (!(e.target.closest && e.target.closest('a, button'))) U.go(M.base + '/contents'); } } },
          h('span', { class: 'deboss', 'aria-hidden': 'true' }),
          h('span', { class: 'jc-top', 'aria-hidden': 'true' }, 'Field Dossier', h('small', null, 'My University')),
          h('span', { class: 'jc-label' }, tape('l'), tape('r'), M.done || M.closed ? null : icon('clip', 'pclip'),
            h('span', { class: 'jc-no' }, (no ? 'No. ' + no + ' · ' : '') + 'Course'),
            h('h1', { class: 'jc-title', tabindex: '-1' }, b.title),
            h('dl', { class: 'jc-rows' }, rows.map(function (r) { return h('div', null, h('dt', null, r[0]), h('dd', null, r[1])); })),
            M.done ? stamp('done', 'Complete', null) : h('span', { class: 'jc-prog' }, squares(n, M.N), h('span', null, (M.closed ? 'Kept from a deleted course · ' : 'Still being written · ') + n + ' of ' + M.N + ' chapters'))),
          h('span', { class: 'strap', 'aria-hidden': 'true' }),
          h('span', { class: 'jc-ribbon' + (M.done ? ' done' : ''), 'aria-hidden': 'true' })),
        h('div', { class: 'cover-actions' },
          h('a', { class: 'd-btn', href: M.base + '/contents' }, 'Open the dossier'),
          first ? h('a', { class: 'd-btn d-ghost', href: first.href }, 'Chapter ' + first.rn) : null,
          n ? saveBtn : null)),
      sideArrows(t)]);
    keys(S);
  }

  // The course's cover picture (35-art.js), taped in facing the title like a frontispiece. Kept
  // with a kept dossier after its course is deleted; said to be drawn by an image model.
  // Opened straight from a link, the pictures may still be on their way: the plate waits, hidden,
  // and appears when this course's picture arrives.
  function frontispiece(S, tid) {
    if (!U.art || !tid || !U.art.shown()) return null;
    var img = h('img', { alt: '', width: String(U.art.W), height: String(U.art.H), decoding: 'async' });
    var fig = h('figure', { class: 'd-front', hidden: true }, tape('l'), tape('r'), img, h('figcaption', null, 'Plate drawn for this course by an image model'));
    var off = null;
    function show() {
      var src = U.art.src(tid);
      if (!src) return false;
      img.src = src; fig.hidden = false;
      return true;
    }
    if (!show()) {
      off = U.on('art', function (a) { if (a && a.tid === tid && show() && off) { off(); off = null; } });
      S.offs.push(function () { if (off) { off(); off = null; } });   // the page closing ends the wait
    }
    return fig;
  }

  // ---------- contents: title page | contents ----------
  function contents(S, M) {
    var b = M.book;
    U.setTitle('Contents · ' + b.title);
    var facts = [['Begun', longDate(b.startedAt) || '—'], M.done ? ['Finished', longDate(M.finished)] : ['Bound', M.bound.length + ' of ' + M.N + ' chapters'], ['Ideas', String(M.N)]];
    if (M.works.length) facts.push(['Sources', String(M.works.length)]);
    var left = page('l', 'Title page', [
      deco('splat', 'splat'),
      runhead('Field dossier', M.no ? 'No. ' + M.no : 'My University'),
      h('p', { class: 'kicker' }, 'A course in ' + M.N + ' ideas'),
      h('h1', { class: 'd-tp-title', tabindex: '-1' }, b.title),
      frontispiece(S, b.tid),
      b.hook ? h('section', { class: 'hook' }, h('h2', { class: 'label' }, 'The question it set out to answer'), h('p', { class: 'hook-q' }, b.hook)) : null,
      b.oneBreath ? h('section', { class: 'breath' }, h('h2', { class: 'label' }, 'In one breath'), h('div', { class: 'prose' }, rich(b.oneBreath, null))) : null,
      h('dl', { class: 'facts' }, tape('c'), facts.map(function (r) { return h('div', null, h('dt', null, r[0]), h('dd', null, r[1])); })),
    ]);
    var right = page('r', 'Contents', [
      runhead(b.title),
      h('h2', { class: 'hh' }, 'Contents'),
      h('ol', { class: 'toc' }, M.chapters.map(function (c) {
        var inner = [
          h('span', { class: 'n', 'aria-hidden': 'true' }, c.rn),
          h('span', { class: 'tb' },
            h('span', { class: 't' }, vh('Chapter ' + c.n + ': '), c.idea.title),
            h('span', { class: 'l' }, c.idea.oneLine),
            h('span', { class: 'm' }, c.learned ? 'Learned ' + shortDate(c.learned) : M.closed ? 'Not written: the course was deleted' : 'Not yet written', c.hasPlate ? ' · Plate ' + c.rn : ''))];
        return h('li', { class: c.learned ? '' : 'unwritten' }, c.learned ? h('a', { href: c.href }, inner) : h('div', null, inner));
      })),
      M.hasBack ? h('p', { class: 'toc-back' }, h('a', { href: M.base + '/glossary' }, 'Glossary'), h('a', { href: M.base + '/bibliography' }, 'Bibliography')) : null,
      deco('stain', 'ring'),
    ]);
    leaf(S, M, { leaf: 'contents', tab: 'contents', left: left, right: right });
  }

  // ---------- chapter, leaf 1: the idea | the explanation and the analogy ----------
  function chapterHead(M, c, title) {
    var idea = c.idea, deps = arr(idea.deps).map(function (d) { return M.byId[d]; }).filter(Boolean);
    var later = M.chapters.filter(function (x) { return arr(x.idea.deps).indexOf(idea.id) >= 0; });
    function link(x) { return x.learned ? h('a', { href: x.href }, 'ch. ' + x.rn, vh(': ' + x.idea.title)) : h('span', null, 'ch. ' + x.rn); }
    function list(xs) { var out = []; xs.forEach(function (x, k) { if (k) out.push(k === xs.length - 1 ? ' and ' : ', '); out.push(link(x)); }); return out; }
    var xref = deps.length || later.length ? h('aside', { class: 'side xref', 'aria-label': 'Compare' },
      h('span', { class: 'side-k' }, icon('xref'), 'Compare'),
      deps.length ? h('span', { class: 'side-t' }, 'Builds on ', list(deps), '.') : null,
      later.length ? h('span', { class: 'side-t' }, 'Comes back in ', list(later), '.') : null) : null;
    return [
      h('header', { class: 'ch-head' },
        h('span', { class: 'sketch', 'aria-hidden': 'true' }, svg(sketch(idea.kind, U.hash(M.book.tid + idea.id) % 2147483646 + 1))),
        h('p', { class: 'kicker' }, 'Chapter ' + c.rn + ' of ' + roman(M.N) + (idea.kind ? ' · ' + cap(idea.kind) : '')),
        h('h1', { class: 'ch-title', tabindex: '-1' }, title || idea.title),
        h('p', { class: 'ch-line' }, idea.oneLine)),
      xref];
  }
  function card(M, c) {
    var L = c.lesson, kt = termsOf(L), name = kt[0] || c.idea.title, rows = [];
    if (kt[0]) rows.push(['Idea', c.idea.title]);
    rows.push(['Course', M.book.title]);
    if (kt.length) rows.push(['Key terms', kt.join(', ')]);
    var conf = CERTAIN[L.confidence] ? L.confidence : 'settled';
    var cert = h('div', { class: 'cert-row' }, h('dt', null, 'How certain'),
      h('dd', null, h('span', { class: 'cert' }, ['settled', 'simplified', 'contested'].map(function (k) {
        return k === conf ? h('span', { class: 'on' }, k, icon('ring'), vh(' (this one)')) : h('span', { class: 'off' }, k);
      })), h('span', { class: 'cert-why' }, c.doc && c.doc.sourced === false ? UNSOURCED : CERTAIN[conf])));
    return h('section', { class: 'd-card', 'aria-label': 'Index card' }, tape('l'), tape('r'),
      h('div', { class: 'card-top' }, h('p', { class: 'card-k' }, kt[0] ? 'Known as:' : 'Idea:'),
        stamp('done', 'Chapter complete', shortDate(c.learned), 'Chapter complete, learned on ' + longDate(c.learned))),
      h('p', { class: 'card-name' + (name.length > 18 ? ' long' : '') }, name),
      h('dl', null, rows.map(function (r) { return h('div', null, h('dt', null, r[0]), h('dd', null, r[1])); }), cert));
  }
  function chapterIdea(S, M, c) {
    var L = c.lesson, idea = c.idea, sid = 'c' + c.n, fx = popFx(S, L, c.href + '/practice');
    U.setTitle('Chapter ' + c.rn + ' · ' + idea.title);
    // The closing all-bold paragraph becomes the field note (not printed twice); the first quoted
    // source cited after the opening paragraph is clipped in after the paragraph that cites it.
    var ps = paras(L.explain.text), noteText = null;
    if (ps.length > 1 && /^\*\*[^*]+\*\*$/.test(ps[ps.length - 1])) noteText = ps.pop().replace(/^\*\*|\*\*$/g, '');
    var clipAt = -1, clip = null;
    for (var i = ps.length > 1 ? 1 : 0; i < ps.length && !clip; i++) {
      var re = /\[\^(\d+)\]/g, m;
      while ((m = re.exec(ps[i])) && !clip) if (fx.by[m[1]] && fx.by[m[1]].quote) { clipAt = i; clip = fx.by[m[1]]; }
    }
    var prose = h('div', { class: 'prose' });
    ps.forEach(function (p, k) {
      U.append(prose, rich(p, fx));
      if (k === clipAt) {
        var ct = splitTitle(clip.title);
        prose.appendChild(h('figure', { class: 'clip' }, tape('c'), h('blockquote', null, unquote(clip.quote)),
          inl(h('figcaption'), (ct.pub || ct.title) + ' [^' + clip.n + ']', fx)));
      }
    });
    var views = L.contested && Array.isArray(L.contested.views) ? L.contested.views.filter(function (v) { return v && v.text; }) : [];
    var field = noteText ? h('aside', { class: 'd-note d-field', 'aria-label': 'Field note' }, icon('nib', 'note-ico'),
      h('div', null, h('p', { class: 'note-k' }, 'Field note'), inl(h('p', { class: 'note-t' }), noteText, fx))) : null;
    var explain = h('section', { class: 'explain', 'aria-labelledby': sid + '-ex' },
      h('h2', { class: 'hh', id: sid + '-ex' }, 'What’s going on'), prose,
      views.length ? h('div', { class: 'd-views' }, views.map(function (v) { return h('div', { class: 'd-view' }, h('h3', null, v.label || 'One view'), rich(v.text, fx)); })) : null);
    var analogy = L.analogy && L.analogy.text ? h('section', { class: 'analogy', 'aria-labelledby': sid + '-an' },
      h('h2', { class: 'hh', id: sid + '-an' }, 'Think of it like this'),
      h('div', { class: 'prose' }, rich(L.analogy.text, fx)),
      L.analogy.breaks ? h('aside', { class: 'd-note d-warn', 'aria-label': 'Where it breaks' }, icon('warn', 'note-ico'),
        h('div', null, h('p', { class: 'note-k' }, 'Where it breaks'), inl(h('p', { class: 'note-t' }), L.analogy.breaks, fx))) : null) : null;
    var left = page('l', 'Chapter ' + c.n + ', the idea', [deco('splat', 'splat'), runhead(M.book.title)].concat(chapterHead(M, c), [card(M, c), field]));
    var right = page('r', 'Chapter ' + c.n + ', the explanation', [runhead('Chapter ' + c.rn, idea.title), explain, analogy, deco('stain', 'ring')]);
    leaf(S, M, { leaf: idea.id + ':1', tab: idea.id, left: left, right: right });
  }

  // ---------- chapter, leaf 2: the plate | its notes ----------
  function chapterPlate(S, M, c, play) {
    var L = c.lesson, it = L.interactive, idea = c.idea, sid = 'c' + c.n, fx = popFx(S, L, c.href + '/practice');
    U.setTitle('Plate ' + c.rn + ' · ' + it.title);
    // A number from the sources: the first cited constant the explanation does not already quote
    // (else the first cited constant), circled in the margin.
    var cited = arr(it.numbers).filter(function (x) { return x.kind === 'constant' && x.source && fx.by[x.source]; });
    var nm = cited.filter(function (x) { return L.explain.text.indexOf(String(x.value)) < 0; })[0] || cited[0];
    var numNote = null;
    if (nm) {
      var lab = String(nm.label), unit = '', um = lab.match(/\s*\(([^)]{1,14})\)\s*$/);
      if (um) { unit = um[1]; lab = lab.slice(0, um.index); }
      if (!/^[a-zA-Z°%]{1,4}$/.test(unit)) unit = '';
      numNote = h('aside', { class: 'side num', 'aria-label': 'A number from the sources' },
        h('span', { class: 'num-v' }, icon('ring'), fmtNum(nm.value, unit)),
        h('span', { class: 'side-t' }, cap(lab)),
        inl(h('span', { class: 'side-src' }, 'Source '), '[^' + nm.source + ']', fx));
    }
    var look = str(it.brief).replace(/^\s*The one thing (you should|to) see is\s*/i, '').replace(/\.?\s*$/, '.');
    var figure;
    if (c.doc.plate) {
      var wake = h('button', { class: 'wake', type: 'button', 'aria-pressed': 'false' }, icon('hand'), h('span', null, 'Tap to play'));
      var frameWrap = h('div', { class: 'frame', inert: '' });
      var tap = h('span', { class: 'cover-tap', 'aria-hidden': 'true' });
      var mount = h('div', { class: 'mount d-wide', 'data-awake': 'false' }, frameWrap, tap,
        ['tl', 'tr', 'bl', 'br'].map(function (k) { return h('i', { class: 'corner ' + k, 'aria-hidden': 'true' }); }));
      var p = { mount: mount, frameWrap: frameWrap, wake: wake, html: c.doc.plate, title: it.title, play: play };
      wake.addEventListener('click', function () { togglePlate(p, true); });
      tap.addEventListener('click', function () { togglePlate(p, false, true); });
      S.plates.push(p);
      figure = h('figure', { class: 'plate', id: sid + '-plate' }, h('div', { class: 'wake-row d-wide' }, wake), mount, h('figcaption', { class: 'vh' }, 'Plate ' + c.rn + ': ' + it.title));
    } else {
      figure = h('figure', { class: 'plate', id: sid + '-plate' }, h('p', { class: 'plate-gone' }, c.doc.plateNote || PLATE_NOTE));
    }
    var left = page('l', 'Plate ' + c.n, [deco('splat', 'splat'), runhead(M.book.title),
      h('header', { class: 'ch-head' },
        h('h1', { class: 'plate-cap', tabindex: '-1' }, h('span', { class: 'plate-no' }, 'Plate ' + c.rn), ' ', h('span', { class: 'plate-t' }, it.title))),
      look.length > 1 ? h('p', { class: 'd-note d-look' }, icon('arrow', 'look-ico'), h('span', null, h('b', null, 'Look for '), look.charAt(0).toLowerCase() + look.slice(1))) : null,
      figure]);
    var right = page('r', 'Plate ' + c.n + ', notes', [runhead('Chapter ' + c.rn, 'The plate'),
      numNote,
      it.whatAmILookingAt ? h('section', { class: 'pn' }, h('h2', { class: 'hh' }, 'What you’re looking at'), h('div', { class: 'prose d-small' }, rich(it.whatAmILookingAt, fx))) : null,
      it.ignores ? h('section', { class: 'pn leaves' }, h('h2', { class: 'label' }, 'What this model leaves out'), rich(it.ignores, fx)) : null,
      arr(it.numbers).length ? h('details', { class: 'numbers' }, h('summary', null, icon('chev'), 'The numbers on this plate (' + it.numbers.length + ')'),
        h('ul', null, it.numbers.map(function (x) {
          return h('li', null, h('span', { class: 'nk' }, x.kind === 'constant' ? 'cited' : x.kind === 'control' ? 'setting' : 'worked out'), h('span', { class: 'nl' }, x.label),
            inl(h('span', { class: 'nv' }, String(x.value)), x.source && fx.by[x.source] ? '[^' + x.source + ']' : '', fx));
        }))) : null,
      deco('stain', 'ring')]);
    leaf(S, M, { leaf: idea.id + ':2', tab: idea.id, left: left, right: right });
    if (play && S.plates[0]) requestAnimationFrame(function () {
      var pl = S.plates[0];
      if (!pl.mount.isConnected) return;
      pl.mount.closest('.plate').scrollIntoView({ block: 'start', behavior: 'auto' });
      togglePlate(pl, false, true);
    });
  }

  // ---------- plates: the lesson's own interactive, asleep until "Tap to play" ----------
  // Drawn (U.sandbox.mount, in ink on paper) when it comes within 900 px of the screen, but inert
  // with the frame out of the Tab order and a cover over it, so a thumb scrolling past never moves
  // a slider. The first tap only wakes it.
  function inkTheme() {
    var t = U.sandbox.theme(), p = INK[t.dark ? 'dark' : 'light'];
    return { dark: !!t.dark, size: t.size, c: Object.assign({}, p.c), roles: Object.assign({}, p.roles) };
  }
  function mountPlate(p) {
    if (p.api) return;
    p.api = U.sandbox.mount(p.frameWrap, { html: p.html, title: 'Plate: ' + p.title + ' (interactive)', minHeight: 320, theme: inkTheme });
    if (p.api.frame) p.api.frame.tabIndex = p.mount.getAttribute('data-awake') === 'true' ? 0 : -1;
  }
  function togglePlate(p, viaButton, forceOn) {
    var awake = forceOn ? true : p.mount.getAttribute('data-awake') !== 'true';
    mountPlate(p);
    p.mount.setAttribute('data-awake', String(awake));
    if (awake) p.frameWrap.removeAttribute('inert'); else p.frameWrap.setAttribute('inert', '');
    if (p.api && p.api.frame) p.api.frame.tabIndex = awake ? 0 : -1;
    p.wake.setAttribute('aria-pressed', String(awake));
    p.wake.lastChild.textContent = awake ? 'Done' : 'Tap to play';
    if (awake && viaButton && p.api && p.api.frame) try { p.api.frame.focus(); } catch (e) { /* fine */ }
  }
  function startPlates(S) {
    if (!S.plates.length) return;
    if (typeof IntersectionObserver !== 'function') { S.plates.forEach(mountPlate); return; }
    S.io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var p = S.plates.filter(function (x) { return x.mount === e.target; })[0];
        if (p) mountPlate(p);
        S.io.unobserve(e.target);
      });
    }, { rootMargin: '900px 0px' });
    S.plates.forEach(function (p) { S.io.observe(p.mount); });
  }

  // ---------- chapter, leaf 3: put it into practice | sources ----------
  // The practice page in the journal's hands (practiceParts): the steps as an ink checklist, the
  // rules of thumb on a taped card, the worked example as a field note and the common mistakes in
  // red ink. A chapter without practice (bound before lessons had it) has the sources page alone.
  function chapterPractice(S, M, c) {
    var L = c.lesson, idea = c.idea, sid = 'c' + c.n;
    U.setTitle((c.practice ? 'Chapter ' + c.rn + ', put it into practice · ' : 'Chapter ' + c.rn + ' sources · ') + idea.title);
    var fx = { by: sourcesOf(L), open: function (n) {
      var el = document.getElementById(sid + '-s' + n);
      if (el) { el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); el.focus({ preventScroll: true }); }
    } };
    var left = c.practice ? page('l', 'Chapter ' + c.n + ', put it into practice', [
      deco('splat', 'splat'), runhead(M.book.title),
      h('header', { class: 'ch-head' },
        h('p', { class: 'kicker' }, 'Chapter ' + c.rn + ' · ' + idea.title),
        h('h1', { class: 'ch-title', tabindex: '-1' }, 'Put it into practice'),
        h('p', { class: 'sub' }, 'How to use this idea, from the lesson.')),
    ].concat(c.practice.map(function (p) { return practicePart(p, fx); }))) : null;
    var right = page('r', 'Chapter ' + c.n + ', sources', [
      runhead('Chapter ' + c.rn, idea.title),
      h('section', { class: 'sources', 'aria-labelledby': sid + '-so' },
        h(c.practice ? 'h2' : 'h1', { class: 'hh', id: sid + '-so', tabindex: c.practice ? null : '-1' }, 'Sources'),
        arr(L.sources).length ? h('p', { class: 'sub' }, 'The pages this chapter rests on, with the words it quoted.')
          : h('p', { class: 'sub' }, c.doc.sourced === false ? UNSOURCED : 'This chapter lists no sources.'),
        h('ol', { class: 'evidence' }, arr(L.sources).map(function (s) {
          var t = splitTitle(s.title), url = safeUrl(s.url);
          return h('li', { class: 'ev', id: sid + '-s' + s.n, tabindex: '-1' }, tape('c'),
            h('p', { class: 'ev-n' }, icon('ring'), vh('Source '), String(s.n)),
            h('p', { class: 'ev-t' }, t.title, t.pub ? h('span', { class: 'pub' }, t.pub) : null),
            s.quote ? h('blockquote', null, unquote(s.quote)) : null,
            url ? h('a', { class: 'ev-u', href: url, target: '_blank', rel: 'noopener noreferrer' }, hostOf(url), icon('out'), vh(' (opens a new tab)')) : null);
        }))),
      deco('stain', 'ring'),
    ]);
    leaf(S, M, { leaf: idea.id + ':3', tab: idea.id, left: left, right: right });
  }
  var PART_LABEL = { steps: 'Steps', rules: 'Rules of thumb', example: 'Worked example', mistakes: 'Common mistakes' };
  function partLabel(p) { return p.label || PART_LABEL[p.kind] || ''; }
  // One part of the practice page, in the lesson's own words.
  function practicePart(p, fx) {
    var paras = p.paras.map(function (t) { return inl(h('p'), t, fx); });
    if (p.kind === 'steps') {
      return h('section', { class: 'd-steps', 'aria-label': partLabel(p) }, h('h2', { class: 'hh' }, partLabel(p)), paras.length ? h('div', { class: 'prose' }, paras) : null,
        p.items.length ? h(p.ordered || !paras.length ? 'ol' : 'ul', { class: 'd-check' }, p.items.map(function (t, k) {
          return h('li', null, icon('box', 'd-box'), h('span', { class: 'd-step-n', 'aria-hidden': 'true' }, String(k + 1)), inl(h('span', { class: 'd-step-t' }), t, fx));
        })) : null);
    }
    var list = p.items.length ? h('ul', { class: 'd-items' }, p.items.map(function (t) { return inl(h('li'), t, fx); })) : null;
    if (p.kind === 'rules') {
      return h('section', { class: 'd-card d-rules', 'aria-label': partLabel(p) }, tape('l'), tape('r'), h('p', { class: 'card-k' }, partLabel(p)), paras, list);
    }
    if (p.kind === 'example') {
      return h('aside', { class: 'd-note d-field d-example', 'aria-label': partLabel(p) }, icon('nib', 'note-ico'),
        h('div', null, h('p', { class: 'note-k' }, partLabel(p)), h('div', { class: 'note-t' }, paras, list)));
    }
    if (p.kind === 'mistakes') {
      return h('aside', { class: 'd-note d-warn d-mistakes', 'aria-label': partLabel(p) }, icon('warn', 'note-ico'),
        h('div', null, h('p', { class: 'note-k' }, partLabel(p)), h('div', { class: 'note-t' }, paras, list)));
    }
    return h('div', { class: 'prose' }, paras, list);
  }

  // ---------- back matter: glossary | bibliography ----------
  function backMatter(S, M, which) {
    var b = M.book;
    U.setTitle((which === 'biblio' ? 'Bibliography' : 'Glossary') + ' · ' + b.title);
    var left = page('l', 'Glossary', [deco('splat', 'splat'), runhead(b.title),
      h('h1', { class: 'hh big', tabindex: '-1', id: 'glossary' }, 'Glossary'),
      M.gloss.length ? h('p', { class: 'sub' }, 'Every key term the chapters introduce, in the words that introduced it.') : h('p', { class: 'sub' }, 'No key terms yet.'),
      h('dl', { class: 'gloss' }, M.gloss.map(function (g) {
        return h('div', null, h('dt', null, h('mark', { class: 'term' }, g.term)),
          h('dd', null, inl(h('p', { class: 'gd' }), g.text, null), h('p', { class: 'gc' }, 'First met in ', h('a', { href: g.ch.href }, 'chapter ' + g.ch.rn + ', ' + g.ch.idea.title))));
      }))]);
    var right = page('r', 'Bibliography', [runhead('Back matter'),
      h('h2', { class: 'hh big', id: 'bibliography', tabindex: '-1' }, 'Bibliography'),
      h('p', { class: 'sub' }, M.works.length ? 'Every page the course’s research kept, with the chapters that rest on it. Open an entry to read the words it quoted.' : 'No sources were kept for this course.'),
      h('ol', { class: 'biblio' }, M.works.map(function (w) {
        var url = safeUrl(w.url);
        return h('li', null,
          h('p', { class: 'bw' }, w.pub ? h('span', { class: 'pub' }, w.pub + '. ') : null, h('cite', null, w.title), '. ',
            url ? h('a', { class: 'dom', href: url, target: '_blank', rel: 'noopener noreferrer' }, hostOf(url), vh(' (opens a new tab)')) : null),
          w.ch.length ? h('p', { class: 'bc' }, 'Chapters ', w.ch.map(function (n, k) { var ch = M.chapters[n - 1]; return [k ? ', ' : '', ch && ch.learned ? h('a', { href: ch.href }, roman(n), vh(': ' + ch.idea.title)) : roman(n)]; })) : null,
          w.quotes.length ? h('details', { class: 'bq' }, h('summary', null, icon('chev'), w.quotes.length === 1 ? 'The passage it quoted' : 'The ' + w.quotes.length + ' passages it quoted'),
            w.quotes.map(function (q) { return h('blockquote', null, unquote(q)); })) : null);
      }))]);
    var sp = leaf(S, M, { leaf: 'back', tab: 'back', left: left, right: right });
    if (which === 'biblio') requestAnimationFrame(function () {
      var el = document.getElementById('bibliography');
      if (el && getComputedStyle(sp).gridTemplateColumns.split(' ').length < 2) el.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }

  // =====================================================================================
  // THE LIBRARY'S SHELVES (73-book.js draws the Library around them)
  // =====================================================================================
  function shelf(box, ctx) {
    fonts();
    var groups = h('div', { class: 'groups' }, h('div', { class: 'skeleton dos-sk', style: 'height:180px;border-radius:16px' }));
    var sec = h('section', { class: 'lib-sec', 'aria-labelledby': 'dos-h' },
      h('h2', { id: 'dos-h' }, 'Dossiers'),
      h('p', { class: 'lede' }, 'Every idea you finish in a course is bound into its dossier as a chapter, ready to reread whenever you like.'),
      groups);
    box.appendChild(sec);
    var ro = null;
    function fill() {
      Array.prototype.forEach.call(sec.querySelectorAll('.shelf'), function (ul) {
        Array.prototype.forEach.call(ul.querySelectorAll('.filler'), function (f) { f.remove(); });
        var cols = getComputedStyle(ul).gridTemplateColumns.split(' ').filter(Boolean).length || 1, n = ul.children.length % cols;
        for (var i = 0; n && i < cols - n; i++) ul.appendChild(h('li', { class: 'slot filler', 'aria-hidden': 'true' }, h('span', { class: 'book-link' }, h('span', { class: 'cloth gap' }), h('span', { class: 'plank' }))));
      });
    }
    function slot(d) {
      var n = d.count, total = d.total;
      return h('li', { class: 'slot' },
        h('a', { class: 'book-link', href: '#/book/' + encodeURIComponent(d.tid) },
          h('span', { class: 'cloth', style: '--cloth:' + clothOf(d.no) },
            h('span', { class: 'ribbon' + (d.done ? ' done' : '') }),
            h('span', { class: 'lbl' }, d.done || d.closed ? null : icon('clip', 'pclip'),
              d.no ? h('span', { class: 'lbl-no' }, 'No. ' + d.no) : null,
              h('span', { class: 'lbl-t' }, d.title))),
          h('span', { class: 'plank', 'aria-hidden': 'true' }),
          h('span', { class: 'meta' }, d.done
            ? [h('span', { class: 'st done' }, icon('check'), 'Finished ' + day(d.finished, { day: 'numeric', month: 'short' })), h('span', { class: 'ms' }, total + (total === 1 ? ' chapter' : ' chapters'))]
            : [squares(n, total), h('span', { class: 'st' }, n + ' of ' + total + ' chapters' + (d.closed ? ' · kept' : ''))])));
    }
    function group(id, title, list) {
      if (!list.length) return null;
      return h('section', { class: 'group', style: '--n:' + list.length, 'aria-labelledby': id },
        h('h3', { id: id }, title, h('span', { class: 'count' }, String(list.length))),
        h('ul', { class: 'shelf', style: '--n:' + list.length }, list.map(slot)));
    }
    function render(list, topics, progressAll, nos) {
      var live = {}; arr(topics).forEach(function (t) { if (t && t.id) live[t.id] = true; });
      var shown = arr(list).filter(function (d) {
        if (!d || !d.title || !d.__id) return false;
        return !live[d.__id] || on((progressAll || {})[d.__id]);   // a kept dossier, or a course that keeps one
      }).map(function (d) {
        var have = chaptersOf(d), ideas = arr(d.ideas).filter(isObj), n = countOf(d);
        var done = ideas.length > 0 && n >= ideas.length;
        var fin = done ? ideas.reduce(function (m, i) { var x = String(have[i.id].doneAt || ''); return x > m ? x : m; }, '') : null;
        return { tid: d.__id, title: d.title, count: n, total: ideas.length, done: done, closed: !done && !live[d.__id], finished: fin, started: String(d.startedAt || d.createdAt || ''), no: nos[d.__id] || 0 };
      }).filter(function (d) { return d.count > 0; });
      var done = shown.filter(function (d) { return d.done; }).sort(function (a, b) { return a.finished < b.finished ? 1 : -1; });
      var going = shown.filter(function (d) { return !d.done && !d.closed; }).sort(function (a, b) { return a.started < b.started ? 1 : -1; });
      var kept = shown.filter(function (d) { return d.closed; }).sort(function (a, b) { return a.started < b.started ? 1 : -1; });
      U.clear(groups);
      if (!shown.length) {
        groups.appendChild(U.rt.savedLate() && U.views && U.views.savedLate ? U.views.savedLate('your dossiers')
          : h('p', { class: 'lib-empty' }, h('strong', null, 'No dossiers yet'), 'When you finish an idea in a course, its first chapter is bound here.'));
        return;
      }
      U.append(groups, [group('sh-done', 'Finished', done), group('sh-going', 'Still being written', going), group('sh-kept', 'Kept from deleted courses', kept)]);
      fill();
    }
    function read() {
      numbersP = null;
      return Promise.all([U.store.dossier.list(), U.store.topics.list(), U.store.progress.all(), numbers()]);
    }
    read().then(function (r) {
      if (!ctx.alive()) return;
      render(r[0], r[1], r[2], r[3]);
      if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(function () { if (ctx.alive()) fill(); }); ro.observe(sec); }
      // Backfill: chapters finished before dossiers existed (or missed), once per page load.
      return syncAll(r[1], r[2], r[0]).then(function (n) {
        if (!n || !ctx.alive()) return;
        return read().then(function (r2) { if (ctx.alive()) render(r2[0], r2[1], r2[2], r2[3]); });
      });
    }).catch(function (e) {
      if (!ctx.alive()) return;
      console.warn('dossier: shelf', e);
      U.clear(groups).appendChild(U.views && U.views.loadError ? U.views.loadError('Your dossiers', e, false) : h('p', null, U.errText(e)));
    });
    return function () { if (ro) ro.disconnect(); };
  }

  // =====================================================================================
  // THE TOPIC PAGE'S OPTION, AND DELETING A COURSE (71-topic.js)
  // =====================================================================================
  function option(tid, progress, index, total) {
    var isOn = on(progress), n = countOf(index), id = 'dos-opt-' + tid;
    return h('section', { class: 'tp-dos', 'aria-labelledby': 'dos-opt-h' },
      h('div', { class: 'section-head' }, h('h2', { id: 'dos-opt-h' }, 'Dossier')),
      h('label', { class: 'set-switch', for: id },
        h('span', { class: 'set-switch-text' }, h('strong', null, 'Keep a dossier'),
          h('span', { class: 'muted small' }, isOn ? 'Each idea you finish is bound as a chapter of a book in your Library, from the course’s own lessons.' : 'Off: no chapters are bound for this course.')),
        h('input', { class: 'switch', type: 'checkbox', role: 'switch', id: id, 'data-key': 'dossier-switch', checked: isOn, on: { change: function (e) { setOn(tid, e.target.checked); } } })),
      isOn && n ? h('a', { class: 'tp-dos-open', href: '#/book/' + encodeURIComponent(tid) }, U.icon('book'), 'Open the dossier · ' + n + ' of ' + (total || n) + ' chapters') : null);
  }
  // Asks before a course is deleted; when it has a dossier, whether to keep it (kept by default).
  // Resolves {keep} to go ahead, or null. Asked again while open: the same answer (one sheet).
  var asking = null;
  function confirmDelete(tid, title, progress) {
    if (asking) return asking;
    asking = ask(tid, title, progress);
    asking.then(function () { asking = null; }, function () { asking = null; });
    return asking;
  }
  function ask(tid, title, progress) {
    var text = 'This removes “' + title + '”, its lessons, your answers and its review cards from all your devices. You cannot undo this.';
    var pi = isObj(progress && progress.ideas) ? progress.ideas : {};
    var finished = Object.keys(pi).some(function (k) { return isObj(pi[k]) && pi[k].stage === 'done'; });
    return U.store.dossier.get(tid).catch(function () { return null; }).then(function (index) {
      if (!on(progress) || !(countOf(index) > 0 || finished)) {
        return U.confirmSheet({ title: 'Delete this topic?', text: text, confirm: 'Delete topic', danger: true }).then(function (y) { return y ? { keep: false } : null; });
      }
      return new Promise(function (done) {
        var keepIt = true, settled = false;
        function resolve(v) { done(v); if (api && api.settle) api.settle(!!v); }
        function opt(val, label, sub) {
          return h('button', { class: 'dos-keep-opt', type: 'button', role: 'radio', 'aria-checked': String(val === keepIt), dataset: { keep: String(val) }, on: { click: function (e) {
            keepIt = val;
            Array.prototype.forEach.call(group.querySelectorAll('[role="radio"]'), function (b) { b.setAttribute('aria-checked', String(b === e.currentTarget)); });
          } } }, h('b', null, label), h('span', null, sub));
        }
        var group = h('div', { class: 'dos-keep', role: 'radiogroup', 'aria-label': 'Its dossier' },
          opt(true, 'Keep its dossier', 'It stays in your Library to read whenever you like.'),
          opt(false, 'Delete its dossier too', 'Its chapters go as well.'));
        U.radios(group);
        var api = U.sheet({
          key: 'confirm:Delete this topic?', title: 'Delete this topic?', autofocus: false,
          body: h('div', { class: 'dos-del' }, h('p', { class: 'muted' }, text), group),
          onClose: function () { if (!settled) { settled = true; resolve(null); } },
          actions: [
            { label: 'Cancel', kind: 'secondary', onClick: function (api) { settled = true; resolve(null); api.close(); } },
            { label: 'Delete topic', kind: 'danger', onClick: function (api) { settled = true; resolve({ keep: keepIt }); api.close(); } },
          ],
        });
        // U.confirmSheet asked the same question meanwhile gets this sheet's yes or no.
        api.answer = new Promise(function (r) { api.settle = r; });
      });
    });
  }

  // =====================================================================================
  // SAVE A COPY: the whole dossier as one HTML file (styles inline, fonts by link, no scripts)
  // =====================================================================================
  var EXPORT_FONTS = 'https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,600;1,400&family=Patrick+Hand&family=Patrick+Hand+SC&family=Permanent+Marker&family=Special+Elite&family=Walter+Turncoat&display=swap';
  var EXPORT_CSS = [
    ':root{--paper:#F1E7D0;--card:#FBF5E6;--ink:#2B2119;--ink2:#5A4936;--navy:#1F3A5C;--teal:#1B5B55;--red:#962A22;--green:#235C33;--hl:rgba(237,185,64,.5);',
    '--serif:"Literata",Georgia,"Times New Roman",serif;--title:"Walter Turncoat","Patrick Hand SC","Comic Sans MS",cursive;--caps:"Patrick Hand SC","Patrick Hand","Comic Sans MS",cursive;',
    '--hand:"Patrick Hand","Comic Sans MS",cursive;--marker:"Permanent Marker","Patrick Hand SC",cursive;--typed:"Special Elite","Courier New",monospace}',
    '*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:#D5CDBF;color:var(--ink);font:400 1.125rem/1.7 var(--serif)}',
    '.x{max-width:46rem;margin:0 auto;padding:16px}.x>section,.x>header,.x>nav{margin:0 0 16px;padding:28px 22px 34px;background:var(--paper);box-shadow:0 1px 2px rgba(60,40,15,.2),0 12px 24px -16px rgba(60,40,15,.5)}',
    'h1,h2,h3{font-family:var(--title);font-weight:400;line-height:1.15;margin:0 0 .5em}h1{font-size:2.2rem}h2{font-size:1.8rem}h3{font-size:1.35rem;margin-top:1.4em}',
    'p,ul,ol,dl,blockquote,figure{margin:0 0 .8em}a{color:var(--navy)}.k{font:.8rem/1.4 var(--typed);letter-spacing:.08em;text-transform:uppercase;color:var(--teal);margin:0 0 .4em}',
    '.line{font-style:italic;color:var(--ink2)}.hook{font:1.3rem/1.45 var(--hand)}dl.facts div,dl.card div{display:flex;gap:.6em;border-bottom:1px solid rgba(70,120,175,.3)}dt{font-family:var(--caps);color:var(--ink2);min-width:6em}dd{margin:0;font-family:var(--typed)}',
    '.card{background:var(--card);padding:12px 16px;margin:1em 0}.name{font:1.6rem/1.15 var(--marker);text-transform:uppercase;margin:.2em 0}.stamp{display:inline-block;border:2px solid var(--green);color:var(--green);padding:2px 8px;font:.8rem/1.3 var(--typed);letter-spacing:.1em;text-transform:uppercase}',
    'mark.term{background:var(--hl);color:inherit;font-weight:600;padding:0 .1em}sup.fn{font:700 .7em/1 sans-serif}sup.fn a{color:var(--teal);text-decoration:none}',
    '.note{font:1.15rem/1.45 var(--hand);margin:1em 0}.note b{font-family:var(--caps);font-weight:400;color:var(--teal)}.warn,.warn b{color:var(--red)}',
    '.clip,blockquote{font:1rem/1.6 var(--typed)}.clip{background:#F7EFDC;padding:14px 16px;margin:1.4em 4%}.clip figcaption{font:.78rem/1.4 var(--typed);text-transform:uppercase;color:var(--ink2)}',
    '.views div{border:1.5px dashed rgba(150,42,34,.5);border-radius:6px;padding:10px 12px;margin:0 0 .8em}.plate{border:1.5px dashed rgba(43,33,25,.35);border-radius:6px;padding:14px 16px;margin:1em 0}',
    '.practice{border-top:1.5px dashed rgba(43,33,25,.28);padding-top:.6em}.steps li{margin:0 0 .4em}.steps li::marker{font-family:var(--marker)}.rules{background:var(--card);padding:10px 16px;margin:1em 0;font-family:var(--hand)}',
    '.rules b,.ex b,.mis b{display:block;font-family:var(--caps);font-weight:400;color:var(--teal)}.ex{font:1.1rem/1.45 var(--hand);margin:1em 0}.mis{font:1.1rem/1.45 var(--hand);color:var(--red);margin:1em 0}.mis b{color:var(--red)}',
    '.src{font-size:1rem}.src .pub{font:.82rem/1.4 var(--typed);text-transform:uppercase;color:var(--ink2)}.dom{font:.82rem var(--typed);color:var(--teal)}',
    '.gloss dt{font:1.3rem/1.2 var(--title);color:var(--ink)}.gloss dd{margin:0 0 1em}.gc,.bc{font:.8rem/1.5 var(--typed);color:var(--ink2)}.small{font-size:.95rem;color:var(--ink2)}',
    '@media print{body{background:#fff}.x>section,.x>header,.x>nav{box-shadow:none;break-inside:auto}}',
  ].join('\n');
  function exportFx(sid, L) {
    return { by: sourcesOf(L), open: function () {}, sid: sid };
  }
  // Footnote chips become plain links to the chapter's sources.
  function asLinks(el, fx) {
    Array.prototype.slice.call(el.querySelectorAll('button.fn')).forEach(function (b) {
      var n = Number(b.textContent);
      b.replaceWith(fx && fx.by[n] ? h('sup', { class: 'fn' }, h('a', { href: '#' + fx.sid + '-s' + n, 'aria-label': 'Source ' + n }, String(n))) : document.createTextNode(''));
    });
    return el;
  }
  function xRich(text, fx) { var d = h('div'); d.appendChild(U.rich(text, fnOpts(fx))); asLinks(d, fx); return Array.prototype.slice.call(d.childNodes); }
  function xInl(el, text, fx) { return asLinks(U.inline(el, text, fnOpts(fx)), fx); }
  function exportChapter(M, c) {
    var L = c.lesson, it = L.interactive, sid = 'c' + c.n, fx = exportFx(sid, L), kt = termsOf(L);
    var conf = CERTAIN[L.confidence] ? L.confidence : 'settled';
    var ps = paras(L.explain.text), noteText = null;
    if (ps.length > 1 && /^\*\*[^*]+\*\*$/.test(ps[ps.length - 1])) noteText = ps.pop().replace(/^\*\*|\*\*$/g, '');
    var out = [
      h('p', { class: 'k' }, 'Chapter ' + c.rn + ' of ' + roman(M.N) + (c.idea.kind ? ' · ' + cap(c.idea.kind) : '')),
      h('h2', null, c.idea.title),
      h('p', { class: 'line' }, c.idea.oneLine),
      h('div', { class: 'card' },
        h('p', { class: 'k' }, kt[0] ? 'Known as' : 'Idea'), h('p', { class: 'name' }, kt[0] || c.idea.title),
        h('p', null, h('span', { class: 'stamp' }, 'Chapter complete · ' + shortDate(c.learned))),
        h('dl', { class: 'card' }, kt.length ? h('div', null, h('dt', null, 'Key terms'), h('dd', null, kt.join(', '))) : null,
          h('div', null, h('dt', null, 'How certain'), h('dd', null, conf + ' — ' + (c.doc.sourced === false ? UNSOURCED : CERTAIN[conf]))))),
      h('h3', null, 'What’s going on'),
    ].concat(ps.map(function (p) { return xRich(p, fx); }));
    if (noteText) out.push(xInl(h('p', { class: 'note' }, h('b', null, 'Field note: ')), noteText, fx));
    var views = L.contested && Array.isArray(L.contested.views) ? L.contested.views.filter(function (v) { return v && v.text; }) : [];
    if (views.length) out.push(h('div', { class: 'views' }, views.map(function (v) { return h('div', null, h('p', null, h('b', null, v.label || 'One view')), xRich(v.text, fx)); })));
    if (L.analogy && L.analogy.text) {
      out.push(h('h3', null, 'Think of it like this'), xRich(L.analogy.text, fx));
      if (L.analogy.breaks) out.push(xInl(h('p', { class: 'note warn' }, h('b', null, 'Where it breaks: ')), L.analogy.breaks, fx));
    }
    if (c.hasPlate) {
      var look = str(it.brief).replace(/^\s*The one thing (you should|to) see is\s*/i, '').replace(/\.?\s*$/, '.');
      out.push(h('div', { class: 'plate' },
        h('h3', null, 'Plate ' + c.rn + ': ' + it.title),
        look.length > 1 ? h('p', { class: 'note' }, h('b', null, 'Look for '), look.charAt(0).toLowerCase() + look.slice(1)) : null,
        h('p', { class: 'small' }, c.doc.plate ? 'The live plate plays in the dossier in My University.' : (c.doc.plateNote || PLATE_NOTE)),
        it.whatAmILookingAt ? [h('p', null, h('b', null, 'What you’re looking at')), xRich(it.whatAmILookingAt, fx)] : null,
        it.ignores ? [h('p', null, h('b', null, 'What this model leaves out')), xRich(it.ignores, fx)] : null,
        arr(it.numbers).length ? h('ul', { class: 'small' }, it.numbers.map(function (x) {
          return xInl(h('li'), x.label + ': ' + x.value + ' (' + (x.kind === 'constant' ? 'cited' : x.kind === 'control' ? 'setting' : 'worked out') + ')' + (x.source && fx.by[x.source] ? ' [^' + x.source + ']' : ''), fx);
        })) : null));
    }
    if (c.practice) out.push(h('div', { class: 'practice' }, h('h3', null, 'Put it into practice'), c.practice.map(function (p) { return exportPart(p, fx); })));
    out.push(h('h3', null, 'Sources'), arr(L.sources).length ? h('ol', { class: 'src' }, arr(L.sources).map(function (s) {
      var t = splitTitle(s.title), url = safeUrl(s.url);
      return h('li', { id: sid + '-s' + s.n }, h('p', null, h('b', null, t.title), t.pub ? h('span', { class: 'pub' }, ' · ' + t.pub) : null),
        s.quote ? h('blockquote', null, unquote(s.quote)) : null, url ? h('p', null, h('a', { class: 'dom', href: url }, url)) : null);
    })) : h('p', { class: 'small' }, c.doc.sourced === false ? UNSOURCED : 'This chapter lists no sources.'));
    return h('section', { id: 'ch-' + c.n }, out);
  }
  // One part of "Put it into practice", in the saved copy's plain style.
  function exportPart(p, fx) {
    var paras = p.paras.map(function (t) { return xInl(h('p'), t, fx); });
    var list = p.items.length ? h(p.kind === 'steps' && (p.ordered || !paras.length) ? 'ol' : 'ul', { class: p.kind === 'steps' ? 'steps' : null }, p.items.map(function (t) { return xInl(h('li'), t, fx); })) : null;
    var label = h('b', null, partLabel(p));
    if (p.kind === 'steps') return [h('p', null, label), paras, list];
    if (p.kind === 'rules') return h('div', { class: 'rules' }, label, paras, list);
    if (p.kind === 'example') return h('div', { class: 'ex' }, label, paras, list);
    if (p.kind === 'mistakes') return h('div', { class: 'mis' }, label, paras, list);
    return [paras, list];
  }
  function exportHtml(M) {
    var b = M.book, x = h('div', { class: 'x' });
    var facts = [['Begun', longDate(b.startedAt) || '—'], M.done ? ['Finished', longDate(M.finished)] : ['Bound', M.bound.length + ' of ' + M.N + ' chapters'], ['Ideas', String(M.N)]];
    if (M.works.length) facts.push(['Sources', String(M.works.length)]);
    x.appendChild(h('header', null,
      h('p', { class: 'k' }, 'Field Dossier · My University' + (M.no ? ' · No. ' + M.no : '')),
      h('h1', null, b.title),
      b.hook ? [h('p', { class: 'k' }, 'The question it set out to answer'), h('p', { class: 'hook' }, b.hook)] : null,
      b.oneBreath ? [h('p', { class: 'k' }, 'In one breath'), xRich(b.oneBreath, null)] : null,
      h('dl', { class: 'facts' }, facts.map(function (r) { return h('div', null, h('dt', null, r[0]), h('dd', null, r[1])); }))));
    x.appendChild(h('nav', { 'aria-label': 'Contents' }, h('h2', null, 'Contents'), h('ol', null, M.chapters.map(function (c) {
      return h('li', null, c.learned ? h('a', { href: '#ch-' + c.n }, c.idea.title) : c.idea.title, ' — ', h('span', { class: 'small' }, c.learned ? 'Learned ' + shortDate(c.learned) : M.closed ? 'Not written' : 'Not yet written'));
    }))));
    M.bound.forEach(function (c) { x.appendChild(exportChapter(M, c)); });
    if (M.gloss.length) x.appendChild(h('section', { id: 'glossary' }, h('h2', null, 'Glossary'), h('dl', { class: 'gloss' }, M.gloss.map(function (g) {
      return [h('dt', null, h('mark', { class: 'term' }, g.term)), h('dd', null, xInl(h('p'), g.text, null), h('p', { class: 'gc' }, 'First met in ', h('a', { href: '#ch-' + g.ch.n }, 'chapter ' + g.ch.rn + ', ' + g.ch.idea.title)))];
    }))));
    if (M.works.length) x.appendChild(h('section', { id: 'bibliography' }, h('h2', null, 'Bibliography'), h('ol', null, M.works.map(function (w) {
      var url = safeUrl(w.url);
      return h('li', null, h('p', null, w.pub ? h('b', null, w.pub + '. ') : null, h('cite', null, w.title), '. ', url ? h('a', { class: 'dom', href: url }, hostOf(url)) : null),
        w.ch.length ? h('p', { class: 'bc' }, 'Chapters ' + w.ch.map(roman).join(', ')) : null,
        w.quotes.map(function (q) { return h('blockquote', null, unquote(q)); }));
    }))));
    var title = h('title', null, b.title + ' · Field Dossier');
    return '<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + title.outerHTML + '\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="' + EXPORT_FONTS.replace(/&/g, '&amp;') + '">\n' +
      '<style>\n' + EXPORT_CSS + '\n</style>\n</head>\n<body>\n' + x.outerHTML + '\n</body>\n</html>\n';
  }
  function save(M, btn) {
    if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }
    var name = 'dossier-' + U.slug(M.book.title) + '-' + U.today() + '.html';
    return Promise.resolve().then(function () { return U.saveFile(name, exportHtml(M), 'text/html'); }).then(function (ok) {
      if (ok) U.toast('Dossier saved.', { kind: 'good' });
      return ok;
    }, function (e) { U.toast('Could not save the dossier: ' + U.errText(e), { kind: 'bad' }); return false; }).then(function (ok) {
      if (btn) { btn.disabled = false; btn.textContent = 'Save a copy'; }
      return ok;
    });
  }

  // =====================================================================================
  // ROUTES (the Library's #/book and the Book's #/book/words are 73-book.js's, registered first)
  // =====================================================================================
  var R = { focus: true, tab: 'book', title: 'Dossier' };
  U.routes.add('#/book/:tid', reader('cover'), R);
  U.routes.add('#/book/:tid/contents', reader('contents'), R);
  U.routes.add('#/book/:tid/glossary', reader('back'), R);
  U.routes.add('#/book/:tid/bibliography', reader('biblio'), R);
  U.routes.add('#/book/:tid/:iid', reader('idea'), R);
  U.routes.add('#/book/:tid/:iid/plate', reader('plate'), R);
  U.routes.add('#/book/:tid/:iid/plate/play', reader('play'), R);
  U.routes.add('#/book/:tid/:iid/practice', reader('practice'), R);
  U.routes.add('#/book/:tid/:iid/tests', reader('practice'), R);   // its older address

  U.dossier = {
    LIMIT: LIMIT, PLATE_NOTE: PLATE_NOTE, INK: INK,
    chapterFrom: chapterFrom, researchFrom: researchFrom, indexFrom: indexFrom, practiceParts: practiceParts, model: model, due: due, countOf: countOf, bytes: bytes,
    on: on, bind: bind, sync: sync, keep: keep, remove: remove, setOn: setOn, load: load,
    fonts: fonts, shelf: shelf, option: option, confirmDelete: confirmDelete, exportHtml: exportHtml, save: save, inkTheme: inkTheme,
  };
})();
