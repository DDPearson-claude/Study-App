// The course dossier (docs/ARCHITECTURE.md sections 4, 9, 10 and 12): a course bound as a field
// guide, a teach-you-how book drawn in D4's tiles (design 3, Dan's choice on 10 Oct). Each idea
// Dan finishes in a course that keeps one (the topic page's "Keep a dossier", on by default:
// progress.dossier !== false) is bound as a chapter: a snapshot of the lesson's own teaching, taken
// when he finishes it (50-lesson.js calls U.dossier.bind) and taken again when he learns it again
// (the newest edition). Ideas finished before dossiers existed are bound from the stored lesson docs
// the first time the Library or the dossier opens (sync).
//
// Only the course's teaching is printed, never anything Dan wrote, chose or scored, and never a
// test: no say-it-back, no predict, no questions, answers or results, no "This looks wrong" notes,
// not even the words he typed to start the course (topic.query; the title is topic.title). What
// it keeps is what he could pick up and use: the explanation, the analogy, the plate, "Put it into
// practice" (lesson.practice) and the sources. The only things about him are dates (begun,
// finished, learned on) and how many chapters are bound. Model text goes in through U.h / U.rich
// / U.inline as text; the plate (the lesson's interactive) runs only in the sandboxed kit frame.
//
// Storage (private, 20-store.js): profile/dossiers/{tid} (the index) and
// profile/dossiers/{tid}/chapters/{iid} (one doc per chapter, under LIMIT bytes: a plate that
// would not fit is left out with a note). A dossier outlives its course when Dan keeps it.
//
// Pages, in reading order (model().leaves; the Library itself is #/library/dossiers in 73-book.js):
//   #/book/:tid  at a glance (the cover and contents in one; /contents, an older address, opens it
//   at the chapters) · per bound chapter: /:iid the chapter, with its plate (/plate, older: at the
//   plate; /plate/play: awake) and /:iid/practice put it into practice and its sources (/tests, an
//   older address, opens it too) · /glossary and the bibliography (/bibliography: the same page, at
//   the bibliography).
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
  // "Put it into practice" (lesson.practice.text, U.rich text) sorted into the practice page's parts by
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
    // The reading order, for page turns: at a glance (the cover and contents in one), each bound
    // chapter's two pages (the chapter with its plate; put it into practice and its sources), then
    // the back matter. k: the page bar's name for it; t: its full name; n, rn, p: its chapter and
    // which of the chapter's two pages it is; at: what the page bar says on it.
    var leaves = [{ id: 'glance', href: base, k: 'Contents', t: 'At a glance', at: 'at a glance' }];
    bound.forEach(function (c) {
      leaves.push({ id: c.idea.id + ':chapter', href: c.href, k: 'Chapter ' + c.rn, t: 'Chapter ' + c.rn + ': ' + c.idea.title, part: 'chapter', n: c.n, rn: c.rn, p: 1 });
      leaves.push({ id: c.idea.id + ':practice', href: c.href + '/practice', k: c.practice ? 'Practice' : 'Sources',
        t: (c.practice ? 'Put it into practice and sources, chapter ' : 'Sources, chapter ') + c.rn, part: 'practice', n: c.n, rn: c.rn, p: 2 });
    });
    if (hasBack) leaves.push({ id: 'back', href: base + '/glossary', k: gloss.length ? 'Glossary' : 'Bibliography', t: 'Glossary and bibliography', at: gloss.length ? 'glossary' : 'bibliography' });
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
  // A CHAPTER'S DERIVED PARTS (pure; the pages and the saved copy share these fixed rules)
  // =====================================================================================
  function cap(s) { s = str(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmtNum(v, unit) { return String(v) + (unit ? (/^[°%′″]/.test(unit) ? '' : ' ') + unit : ''); }
  // The explanation's paragraphs, with its closing all-bold paragraph taken out as the field note
  // (the Key idea tile; never printed twice).
  function explainParts(L) {
    var ps = paras(L && L.explain && L.explain.text), note = null;
    if (ps.length > 1 && /^\*\*[^*]+\*\*$/.test(ps[ps.length - 1])) note = ps.pop().replace(/^\*\*|\*\*$/g, '');
    return { ps: ps, note: note };
  }
  // The clipping: the first quoted source cited after the opening paragraph, clipped in after the
  // paragraph that cites it. by: {n: source}. -> {at: paragraph index, src} | null
  function clipOf(ps, by) {
    for (var i = ps.length > 1 ? 1 : 0; i < ps.length; i++) {
      var re = /\[\^(\d+)\]/g, m;
      while ((m = re.exec(ps[i]))) if (by[m[1]] && by[m[1]].quote) return { at: i, src: by[m[1]] };
    }
    return null;
  }
  // "Look for": the brief without "The one thing you should see is", word for word ('' for none).
  function lookFor(it) {
    var look = str(it && it.brief).replace(/^\s*The one thing (you should|to) see is\s*/i, '').replace(/\.?\s*$/, '.');
    return look.length > 1 ? look.charAt(0).toLowerCase() + look.slice(1) : '';
  }
  // A number from the sources: the first cited constant the explanation does not already quote
  // (else the first cited constant). -> {value, label, source} | null
  function numberOf(it, L, by) {
    var cited = arr(it && it.numbers).filter(function (x) { return x.kind === 'constant' && x.source && by[x.source]; });
    var nm = cited.filter(function (x) { return str(L && L.explain && L.explain.text).indexOf(String(x.value)) < 0; })[0] || cited[0];
    if (!nm) return null;
    var lab = String(nm.label), unit = '', um = lab.match(/\s*\(([^)]{1,14})\)\s*$/);
    if (um) { unit = um[1]; lab = lab.slice(0, um.index); }
    if (!/^[a-zA-Z°%]{1,4}$/.test(unit)) unit = '';
    return { value: fmtNum(nm.value, unit), label: cap(lab), source: nm.source };
  }
  // Compare: the plan's deps, and the ideas that build on this one.
  function compareOf(M, c) {
    return { deps: arr(c.idea.deps).map(function (d) { return M.byId[d]; }).filter(Boolean),
      later: M.chapters.filter(function (x) { return arr(x.idea.deps).indexOf(c.idea.id) >= 0; }) };
  }
  // How certain: confidence said once, or "Not yet source-checked" for an unsourced lesson.
  function certainOf(c) {
    var conf = CERTAIN[c.lesson.confidence] ? c.lesson.confidence : 'settled';
    return { conf: conf, why: c.doc && c.doc.sourced === false ? UNSOURCED : CERTAIN[conf] };
  }
  function viewsOf(L) { return L && L.contested && Array.isArray(L.contested.views) ? L.contested.views.filter(function (v) { return v && v.text; }) : []; }
  // The rule of thumb's first sentence (printed large) and the rest, word for word.
  function firstSentence(t) {
    var m = /^([\s\S]*?[.!?](?:\[\^\d+\])*["”’)]?)(\s+[\s\S]*)?$/.exec(str(t));
    return m && m[2] && m[2].trim() ? { lead: m[1], rest: m[2].trim() } : { lead: str(t), rest: '' };
  }
  function leadSize(t) { var n = U.plain(t).length; return n <= 26 ? 'is-short' : n <= 70 ? 'is-mid' : 'is-long'; }
  var PART_LABEL = { steps: 'Steps', rules: 'Rules of thumb', example: 'Worked example', mistakes: 'Common mistakes' };
  function partLabel(p) { return p.label || PART_LABEL[p.kind] || ''; }

  // =====================================================================================
  // DRAWING HELPERS (DOM from here on)
  // =====================================================================================
  var I = {
    back: '<svg viewBox="0 0 24 24"><path d="m14.5 5.5-6.5 6.5 6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="m9.5 5.5 6.5 6.5-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor"/></svg>',
    tick: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cross: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    out: '<svg viewBox="0 0 24 24"><path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg viewBox="0 0 16 16"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 8l3 3" stroke="currentColor" stroke-width="1.8"/></svg>',
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
  function hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function safeUrl(url) { return /^https?:\/\//i.test(str(url)) ? str(url) : null; }
  function day(iso, o) { var d = new Date(iso); return iso && !isNaN(d) ? d.toLocaleDateString('en-GB', o) : ''; }
  function longDate(iso) { return day(iso, { day: 'numeric', month: 'long', year: 'numeric' }); }
  function shortDate(iso) { return day(iso, { day: 'numeric', month: 'short', year: 'numeric' }); }
  function dayMonth(iso) { return day(iso, { day: 'numeric', month: 'short' }); }
  function yearOf(iso) { return day(iso, { year: 'numeric' }); }
  function unquote(q) { return '“' + str(q).trim().replace(/^["“]|["”]$/g, '') + '”'; }
  function reduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  // A dossier's number as the tiles print it: "Dossier 01".
  function dossierNo(no) { return no ? 'Dossier ' + U.pad(no) : 'Dossier'; }
  // Where he is, in the focus bar's mono path: the course by its title's words (never the query).
  function slugOf(book) { return U.slug(book.title); }

  // A tile (75-dossier.css): kind white | grey | em (emphasis) | ink | warn | dashed; o.span
  // full (both columns) | half; the page's first tile carries the shadow (t-first).
  function tile(tag, kind, o, kids) {
    o = o || {};
    var a = Object.assign({}, o.attrs || {});
    a.class = 't t-' + kind + (o.span ? ' t-' + o.span : '') + (o.cls ? ' ' + o.cls : '');
    return h(tag, a, kids);
  }
  function label(text, cls) { return h('p', { class: 't-label' + (cls ? ' ' + cls : '') }, text); }
  function heading(id, text, cls) { return h('h2', { class: 't-label' + (cls ? ' ' + cls : ''), id: id }, text); }
  // A ring: n of N, ink on a track (the CSS colours .tr and .fl). Static numbers only.
  function ring(n, N, size, w, cls) {
    var r = (size - w) / 2, c = 2 * Math.PI * r, f = N ? Math.max(0, Math.min(1, n / N)) : 0, m = size / 2;
    var circle = '<circle cx="' + m + '" cy="' + m + '" r="' + r + '" fill="none" stroke-width="' + w + '"';
    return svg('<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' + circle + ' class="tr"/>' +
      (f > 0 ? circle + ' class="fl" stroke-linecap="round" stroke-dasharray="' + (f * c).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + m + ' ' + m + ')"/>' : '') + '</svg>', 'ring' + (cls ? ' ' + cls : ''));
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
  // THE READER: one page of tiles per route, in reading order, with the page bar
  // =====================================================================================
  var LIBRARY = '#/library/dossiers';
  function reader(kind) {
    return function (params, ctx) {
      var tid = params.tid, iid = params.iid || null;
      var root = h('div', { class: 'dos reader' }, topBar({ href: LIBRARY, label: 'the Library' }, [{ t: 'library' }]),
        h('div', { class: 'dos-page' }, h('div', { class: 't-full skeleton dos-sk' })));
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
        U.clear(root.querySelector('.dos-page')).appendChild(h('div', { class: 't t-grey t-full d-loaderr' }, V && V.loadError ? V.loadError('This dossier', e, false) : h('p', null, U.errText(e))));
      });
      return function () {
        closePop(S, false);
        if (S.io) S.io.disconnect();
        S.plates.forEach(function (p) { if (p.api) try { p.api.destroy(); } catch (e) { /* gone */ } });
        S.offs.forEach(function (f) { f(); });
      };
    };
  }
  // Old addresses keep working: /contents is At a glance at its chapters, /plate (and /plate/play,
  // awake) the chapter page at its plate. An unbound chapter's address shows At a glance.
  function draw(S, M, kind, iid) {
    var c = iid ? M.byId[iid] : null;
    if (kind === 'back' || kind === 'biblio') return M.hasBack ? backMatter(S, M, kind) : glance(S, M, null);
    if (kind === 'glance' || kind === 'contents' || !c || !c.learned) return glance(S, M, kind === 'glance' ? null : 'chapters');
    if (kind === 'practice') return practicePage(S, M, c);
    return chapterPage(S, M, c, kind === 'plate' || kind === 'play' ? kind : null);
  }

  // ---------- the focus bar, the page bar, the arrow keys ----------
  // D4's focus bar: back one level up, where he is (a mono path), and the reading settings.
  function topBar(up, path) {
    return h('header', { class: 'dos-bar' },
      h('a', { class: 'dos-sq dos-up', href: up.href, 'aria-label': 'Back to ' + up.label }, icon('back')),
      h('p', { class: 'dos-path' }, path.map(function (p, k) { return h('span', { class: p.cls || null }, (k ? '/' : '') + p.t); })),
      h('button', { class: 'dos-sq dos-aa', type: 'button', 'aria-label': 'Reading settings', on: { click: function () { if (U.settings && U.settings.open) U.settings.open(); } } }, 'Aa'));
  }
  function turnLinks(M, leafId) {
    var k = -1; M.leaves.forEach(function (l, i) { if (l.id === leafId) k = i; });
    return { at: M.leaves[k] || null, prev: k > 0 ? M.leaves[k - 1] : null, next: k >= 0 ? M.leaves[k + 1] || null : null };
  }
  // A neighbouring page's name in the page bar: short, with the chapter's numeral when it is
  // another chapter's practice ("Ch. I practice").
  // A chapter's numeral never wraps away from its word.
  function barName(l, cur) { return (l.part === 'practice' && (!cur || cur.n !== l.n) ? 'Ch. ' + l.rn + ' ' + l.k.toLowerCase() : l.k).replace(/^(Chapter|Ch\.) /, '$1\u00a0'); }
  // The page bar (it replaces the turn links and the desk arrows): the previous page, where he is
  // (a step segment per page of the chapter), and the next page as the ink button. The book starts
  // and ends at the Library.
  function pageBar(M, t) {
    var cur = t.at, lib = { href: LIBRARY, k: 'Library' };
    function link(l, dir) {
      var leaf = l !== lib;
      return h('a', { class: 'pb-' + dir + (leaf ? ' is-leaf' : ''), href: l.href, rel: leaf ? dir : null },
        dir === 'prev' ? icon('back') : null, vh(dir === 'prev' ? 'Previous page: ' : 'Next page: '),
        h('span', { class: 'pb-name' }, leaf ? barName(l, cur) : l.k), dir === 'next' ? icon('next') : null);
    }
    var at = !cur ? [] : cur.n ? [h('span', { 'aria-hidden': 'true' }, cur.rn + ' · ' + cur.p + ' of 2'), vh('Chapter ' + cur.rn + ', page ' + cur.p + ' of 2'),
      h('span', { class: 'pb-steps', 'aria-hidden': 'true' }, [1, 2].map(function (k) { return h('i', { class: k <= cur.p ? 'on' : null }); }))] : [cur.at];
    return h('nav', { class: 'dos-pagebar', 'aria-label': 'Turn the page' }, link(t.prev || lib, 'prev'), h('p', { class: 'pb-at' }, at), link(t.next || lib, 'next'));
  }
  // The arrow keys turn pages through model().leaves, except in the plate, a form control,
  // details, a sheet or a source card.
  function keys(S) {
    function onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented || S.pop || (U._sheets && U._sheets.length)) return;
      var t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, [contenteditable], iframe, details, [role="radio"], [role="slider"]')) return;
      var a = e.key === 'ArrowRight' ? S.root.querySelector('.dos-pagebar .pb-next.is-leaf') : e.key === 'ArrowLeft' ? S.root.querySelector('.dos-pagebar .pb-prev.is-leaf') : null;
      if (a) { e.preventDefault(); U.go(a.getAttribute('href')); }
    }
    document.addEventListener('keydown', onKey);
    S.offs.push(function () { document.removeEventListener('keydown', onKey); });
  }
  // One page: the focus bar, its tiles, the page bar. o: {leaf, up: {href, label}, path, cls, kids}
  function pageOf(S, M, o) {
    var page = h('div', { class: 'dos-page enter ' + o.cls }, o.kids);
    U.clear(S.root);
    S.root.setAttribute('data-leaf', o.leaf);   // which page of model().leaves this is
    U.append(S.root, [topBar(o.up, o.path), page, pageBar(M, turnLinks(M, o.leaf))]);
    keys(S);
    startPlates(S);
    return page;
  }
  function scrollTo(el, then) {
    requestAnimationFrame(function () {
      if (!el || !el.isConnected) return;
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
      if (then) then();
    });
  }

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

  // ---------- at a glance: the cover and the contents in one ----------
  function glance(S, M, at) {
    var b = M.book, n = M.bound.length;
    U.setTitle(b.title + ' · Dossier');
    var kids = [
      tile('section', 'white', { span: 'full', cls: 't-first g-title', attrs: { 'aria-labelledby': 'g-h1' } },
        [label((M.no ? dossierNo(M.no) + ' · ' : '') + 'A course in ' + plural(M.N, 'idea', 'ideas')), h('h1', { class: 'g-h1', id: 'g-h1', tabindex: '-1' }, b.title)]),
      frontispiece(S, b.tid),
      boundTile(M),
      begunTile(M),
      chaptersTile(M),
      b.hook ? tile('section', 'grey', { span: 'full', cls: 'g-hook', attrs: { 'aria-labelledby': 'g-hook-h' } }, [heading('g-hook-h', 'The question it set out to answer'), inl(h('p', { class: 'g-hook-q' }), b.hook, null)]) : null,
      b.oneBreath ? tile('section', 'grey', { span: 'full', cls: 'g-breath', attrs: { 'aria-labelledby': 'g-breath-h' } }, [heading('g-breath-h', 'In one breath'), h('div', { class: 't-prose' }, rich(b.oneBreath, null))]) : null,
    ];
    if (n) {
      var saveBtn = h('button', { class: 'dos-btn-out d-save', type: 'button', on: { click: function () { save(M, saveBtn); } } }, icon('save'), h('span', null, 'Save a copy'));
      kids.push(tile('section', 'grey', { span: 'full', cls: 'g-save', attrs: { 'aria-labelledby': 'g-save-h' } },
        [heading('g-save-h', 'Keep a copy'), h('p', { class: 'g-save-t' }, 'Every chapter bound so far, as one web page to keep or print.'), saveBtn]));
    }
    var more = [];
    if (M.gloss.length) more.push(['Glossary', '/glossary', plural(M.gloss.length, 'key term', 'key terms')]);
    if (M.works.length) more.push(['Bibliography', '/bibliography', plural(M.works.length, 'source', 'sources')]);
    more.forEach(function (x) {
      kids.push(tile('a', 'grey', { span: more.length === 1 ? 'full' : 'half', cls: 'g-more', attrs: { href: M.base + x[1] } },
        [h('span', { class: 't-label' }, x[0]), h('span', { class: 'g-more-n' }, x[2]), h('span', { class: 't-open' }, 'Open', icon('next'))]));
    });
    pageOf(S, M, { leaf: 'glance', up: { href: LIBRARY, label: 'the Library' }, path: [{ t: 'library' }, { t: slugOf(b), cls: 'fit' }], cls: 'dos-glance', kids: kids });
    if (at === 'chapters') scrollTo(document.getElementById('chapters'));
  }
  // Bound: progress, so the ink tile (a green ring once finished). Said once to a screen reader.
  function boundTile(M) {
    var n = M.bound.length, kept = !!M.book.kept;
    var say = (M.done ? 'Finished on ' + longDate(M.finished) + ': all ' + plural(M.N, 'chapter', 'chapters') + ' bound.' : n + ' of ' + plural(M.N, 'chapter', 'chapters') + ' bound.') + (kept ? ' Kept from a deleted course.' : '');
    return tile('section', 'ink', { span: 'half', cls: 'g-bound' + (M.done ? ' is-done' : '') }, [vh(say),
      h('span', { class: 'g-bound-in', 'aria-hidden': 'true' }, ring(n, M.N, 54, 7, M.done ? 'is-done' : null),
        h('span', { class: 'g-stat' },
          h('span', { class: 't-label' }, M.done ? 'Finished' : 'Bound'),
          M.done ? h('span', { class: 'g-big' }, dayMonth(M.finished)) : h('span', { class: 'g-big' }, String(n), h('small', null, '/' + M.N)),
          h('span', { class: 'g-small' }, M.done ? yearOf(M.finished) : 'chapters'))),
      kept ? h('span', { class: 'g-kept', 'aria-hidden': 'true' }, 'Kept from a deleted course') : null]);
  }
  function begunTile(M) {
    var s = M.book.startedAt, w = M.works.length;
    return tile('section', 'grey', { span: 'half', cls: 'g-begun' }, [
      h('span', { class: 't-label' }, 'Begun'),
      h('span', { class: 'g-big' }, s ? dayMonth(s) : '—'),
      h('span', { class: 'g-small g-mono' }, [s ? yearOf(s) : '', w ? plural(w, 'source', 'sources') : ''].filter(Boolean).join(' · '))]);
  }
  // One cell per idea: a bound chapter is a link with an ink tick; an unbound one is dashed and
  // says so to a screen reader.
  function chaptersTile(M) {
    return tile('section', 'white', { span: 'full', cls: 'g-chapters', attrs: { id: 'chapters', 'aria-labelledby': 'g-ch-h' } }, [
      h('h2', { class: 't-label g-ch-h', id: 'g-ch-h' }, h('span', null, 'Chapters'),
        M.bound.length && M.bound.length < M.N ? h('span', { class: 'g-ch-hint', 'aria-hidden': 'true' }, 'tap a bound one to read it') : null),
      h('ol', { class: 'g-grid' }, M.chapters.map(function (c) {
        var inner = [h('span', { class: 'g-cell-top', 'aria-hidden': 'true' }, h('span', null, c.rn), c.learned ? h('span', { class: 'g-tick' }, icon('tick')) : null),
          h('span', { class: 'g-cell-t' }, vh('Chapter ' + c.n + ': '), c.idea.title,
            vh(c.learned ? ', learned ' + longDate(c.learned) : M.closed ? ', not written: the course was deleted' : ', not yet written'))];
        return h('li', { class: c.learned ? 'is-bound' : 'is-unbound' }, c.learned ? h('a', { class: 'g-cell', href: c.href }, inner) : h('span', { class: 'g-cell' }, inner));
      }))]);
  }
  // The course's picture (35-art.js), a tile after the title, said to be drawn by an image model.
  // Kept with a kept dossier after its course is deleted. Opened straight from a link, the pictures
  // may still be on their way: the tile waits, hidden, and appears when this course's arrives.
  function frontispiece(S, tid) {
    if (!U.art || !tid || !U.art.shown()) return null;
    var img = h('img', { alt: '', width: String(U.art.W), height: String(U.art.H), decoding: 'async' });
    var fig = tile('figure', 'white', { span: 'full', cls: 'd-front', attrs: { hidden: true } }, [img, h('figcaption', null, 'Picture drawn for this course by an image model')]);
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

  // ---------- a chapter: one page of tiles, with its plate ----------
  function chapterPage(S, M, c, at) {
    var L = c.lesson, idea = c.idea, sid = 'c' + c.n, fx = popFx(S, L, c.href + '/practice');
    U.setTitle('Chapter ' + c.rn + ' · ' + idea.title);
    var ex = explainParts(L), clip = clipOf(ex.ps, fx.by), views = viewsOf(L), main = [], side = [];
    var kids = [
      tile('header', 'white', { span: 'full', cls: 't-first c-head' }, [
        h('span', { class: 'c-num n' + Math.min(c.rn.length, 4), 'aria-hidden': 'true' }, c.rn),
        h('span', { class: 'c-head-t' },
          h('span', { class: 't-label c-of', 'aria-hidden': 'true' }, h('span', null, 'Chapter ' + c.rn + ' of ' + roman(M.N)), idea.kind ? h('span', { class: 'c-kind' }, idea.kind) : null),
          vh('Chapter ' + c.n + ' of ' + M.N + (idea.kind ? ', ' + idea.kind : '') + ':'),
          h('h1', { class: 'c-h1', tabindex: '-1' }, idea.title))]),
      // The field note: the explanation's closing all-bold paragraph. None, no tile.
      ex.note ? tile('section', 'em', { span: 'full', cls: 'c-key', attrs: { 'aria-label': 'Key idea' } }, [label('Key idea'), inl(h('p', { class: 'c-key-t' }), ex.note, fx)]) : null,
    ];
    if (c.hasPlate) main.push(plateTile(S, c, fx));
    var prose = h('div', { class: 't-prose c-prose' });
    ex.ps.forEach(function (p, k) {
      U.append(prose, rich(p, fx));
      if (clip && k === clip.at) {
        var ct = splitTitle(clip.src.title);
        prose.appendChild(h('figure', { class: 'c-clip' }, h('blockquote', null, unquote(clip.src.quote)),
          inl(h('figcaption'), (ct.pub || ct.title) + ' [^' + clip.src.n + ']', fx)));
      }
    });
    main.push(tile('section', 'grey', { span: 'full', cls: 'c-explain', attrs: { 'aria-labelledby': sid + '-ex' } }, [heading(sid + '-ex', 'What’s going on'), prose]));
    views.forEach(function (v, k) {
      main.push(tile('section', 'grey', { span: views.length % 2 && k === views.length - 1 ? 'full' : 'half', cls: 'c-view', attrs: { 'aria-labelledby': sid + '-v' + k } },
        [heading(sid + '-v' + k, v.label || 'One view'), h('div', { class: 't-prose t-small' }, rich(v.text, fx))]));
    });
    var A = L.analogy && L.analogy.text ? L.analogy : null;
    if (A) {
      side.push(tile('section', 'grey', { span: A.breaks ? 'half' : 'full', cls: 'c-analogy', attrs: { 'aria-labelledby': sid + '-an' } },
        [heading(sid + '-an', 'Think of it like'), h('div', { class: 't-prose t-small' }, rich(A.text, fx))]));
      if (A.breaks) side.push(tile('aside', 'warn', { span: 'half', cls: 'c-breaks', attrs: { 'aria-labelledby': sid + '-br' } },
        [heading(sid + '-br', 'Where it breaks'), inl(h('p', { class: 't-small' }), A.breaks, fx)]));
    }
    var cmp = compareOf(M, c), cert = certainOf(c), hasCmp = cmp.deps.length > 0 || cmp.later.length > 0;
    function link(x) { return x.learned ? h('a', { href: x.href }, 'ch. ' + x.rn, vh(': ' + x.idea.title)) : h('span', null, 'ch. ' + x.rn); }
    function list(xs) { var out = []; xs.forEach(function (x, k) { if (k) out.push(k === xs.length - 1 ? ' and ' : ', '); out.push(link(x)); }); return out; }
    if (hasCmp) side.push(tile('aside', 'grey', { span: 'half', cls: 'c-compare', attrs: { 'aria-labelledby': sid + '-cm' } }, [heading(sid + '-cm', 'Compare'),
      h('p', { class: 't-small' }, cmp.deps.length ? ['Builds on ', list(cmp.deps), '. '] : null, cmp.later.length ? ['Comes back in ', list(cmp.later), '.'] : null)]));
    side.push(tile('section', 'grey', { span: hasCmp ? 'half' : 'full', cls: 'c-certain', attrs: { 'aria-labelledby': sid + '-ce' } }, [heading(sid + '-ce', 'How certain'),
      h('p', { class: 'c-pills' }, ['settled', 'simplified', 'contested'].map(function (k) { return k === cert.conf ? h('span', { class: 'on' }, k, vh(' (this one)')) : h('span', null, k); })),
      h('p', { class: 't-small c-why' }, cert.why)]));
    kids.push(h('div', { class: 'c-main' }, main), h('div', { class: 'c-side' }, side));
    kids = kids.concat(plateNotes(c, fx));
    pageOf(S, M, { leaf: idea.id + ':chapter', up: { href: M.base, label: 'Contents' }, path: [{ t: slugOf(M.book), cls: 'fit' }, { t: 'ch-' + c.rn.toLowerCase() }], cls: 'dos-chapter', kids: kids });
    var pl = S.plates[0];
    if (at && c.hasPlate) scrollTo(document.getElementById(sid + '-plate'), at === 'play' && pl ? function () { togglePlate(pl, false, true); } : null);
  }
  // The plate: the lesson's own interactive in a well, asleep until Tap to play. A plate too big
  // to keep shows its note instead.
  function plateTile(S, c, fx) {
    var it = c.lesson.interactive, sid = 'c' + c.n, look = lookFor(it), kids;
    var name = h('span', { class: 'c-plate-name' }, h('span', { class: 't-label' }, 'Plate ' + c.rn), h('span', { class: 'c-plate-t' }, it.title));
    if (c.doc.plate) {
      var wake = h('button', { class: 'wake', type: 'button', 'aria-pressed': 'false' }, icon('play', 'w-play'), icon('tick', 'w-done'), h('span', null, 'Tap to play'));
      var frameWrap = h('div', { class: 'frame', inert: '' });
      var tap = h('span', { class: 'cover-tap', 'aria-hidden': 'true' });
      var mount = h('div', { class: 'mount', 'data-awake': 'false' }, frameWrap, tap);
      var p = { mount: mount, frameWrap: frameWrap, wake: wake, html: c.doc.plate, title: it.title };
      wake.addEventListener('click', function () { togglePlate(p, true); });
      tap.addEventListener('click', function () { togglePlate(p, false, true); });
      S.plates.push(p);
      kids = [h('figcaption', { class: 'c-plate-cap' }, name, wake), mount];
    } else {
      kids = [h('figcaption', { class: 'c-plate-cap' }, name), h('p', { class: 'c-plate-gone' }, c.doc.plateNote || PLATE_NOTE)];
    }
    if (look) kids.push(h('p', { class: 'c-look' }, h('b', null, 'Look for '), look));
    return tile('figure', 'grey', { span: 'full', cls: 'c-plate', attrs: { id: sid + '-plate' } }, kids);
  }
  // The plate's notes, which used to face it: a number from the sources, what you're looking at,
  // what the model leaves out (side by side while short), and the numbers on the plate.
  function plateNotes(c, fx) {
    var it = c.hasPlate ? c.lesson.interactive : null, sid = 'c' + c.n, out = [];
    if (!it) return out;
    var nm = numberOf(it, c.lesson, fx.by), small = [];
    if (nm) small.push({ short: true, el: function (span) {
      return tile('aside', 'grey', { span: span, cls: 'c-number', attrs: { 'aria-label': 'A number from the sources' } }, [label('A number from the sources'),
        h('p', { class: 'c-num-v' }, nm.value), h('p', { class: 't-small' }, nm.label), inl(h('p', { class: 'c-num-src' }, 'Source '), '[^' + nm.source + ']', fx)]);
    } });
    [['whatAmILookingAt', 'What you’re looking at', 'c-looking'], ['ignores', 'What this model leaves out', 'c-leaves']].forEach(function (x, k) {
      if (!it[x[0]]) return;
      small.push({ short: U.plain(it[x[0]]).length < 240, el: function (span) {
        return tile('section', 'grey', { span: span, cls: x[2], attrs: { 'aria-labelledby': sid + '-pn' + k } }, [heading(sid + '-pn' + k, x[1]), h('div', { class: 't-prose t-small' }, rich(it[x[0]], fx))]);
      } });
    });
    // Two short notes side by side; a long one, or one left over, across the page.
    for (var i = 0; i < small.length; i++) {
      var pair = small[i].short && small[i + 1] && small[i + 1].short;
      out.push(small[i].el(pair ? 'half' : 'full'));
      if (pair) out.push(small[++i].el('half'));
    }
    if (arr(it.numbers).length) out.push(tile('details', 'grey', { span: 'full', cls: 'c-numbers' }, [
      h('summary', null, icon('chev'), 'The numbers on this plate (' + it.numbers.length + ')'),
      h('ul', null, it.numbers.map(function (x) {
        return h('li', null, h('span', { class: 'nk' }, x.kind === 'constant' ? 'cited' : x.kind === 'control' ? 'setting' : 'worked out'), h('span', { class: 'nl' }, x.label),
          inl(h('span', { class: 'nv' }, String(x.value)), x.source && fx.by[x.source] ? '[^' + x.source + ']' : '', fx));
      }))]));
    return out;
  }

  // ---------- plates: the lesson's own interactive, asleep until "Tap to play" ----------
  // Drawn (U.sandbox.mount, in the app's D4 kit theme like a lesson) when it comes within 900 px
  // of the screen, but inert with the frame out of the Tab order and a cover over it, so a thumb
  // scrolling past never moves a slider. The first tap only wakes it.
  function mountPlate(p) {
    if (p.api) return;
    p.api = U.sandbox.mount(p.frameWrap, { html: p.html, title: 'Plate: ' + p.title + ' (interactive)', minHeight: 320 });
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

  // ---------- put it into practice, and the sources ----------
  // The practice parts (practiceParts) as tiles: the steps as a numbered ink checklist, the rule of
  // thumb in the emphasis tile (its first sentence large), the worked example in a grey panel and
  // each common mistake in a warning tile. A chapter without practice (bound before lessons had it)
  // has its sources on a page of their own.
  function practicePage(S, M, c) {
    var L = c.lesson, idea = c.idea, sid = 'c' + c.n, srcs = arr(L.sources);
    U.setTitle((c.practice ? 'Chapter ' + c.rn + ', put it into practice · ' : 'Chapter ' + c.rn + ' sources · ') + idea.title);
    var fx = { by: sourcesOf(L), open: function (n) {
      var el = document.getElementById(sid + '-s' + n);
      if (el) { el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); el.focus({ preventScroll: true }); }
    } };
    var kids = [h('header', { class: 't-bare t-full p-head' }, h('p', { class: 't-label' }, 'Chapter ' + c.rn + ' · ' + idea.title),
      h('h1', { class: 'p-h1', id: sid + '-ph', tabindex: '-1' }, c.practice ? 'Put it into practice' : 'Sources'))];
    if (c.practice) c.practice.forEach(function (p, k) { kids.push(practicePart(p, fx, sid + '-p' + k)); });
    kids.push(h('section', { class: 't-bare t-full p-sources', 'aria-labelledby': c.practice ? sid + '-so' : sid + '-ph' },
      c.practice ? heading(sid + '-so', 'Sources', 'p-sec') : null,
      srcs.length ? h('ol', { class: 'p-src-grid' + (srcs.length % 2 ? ' is-odd' : '') }, srcs.map(function (s) { return sourceTile(sid, s); }))
        : tile('p', 'grey', { cls: 'p-none' }, c.doc.sourced === false ? UNSOURCED : 'This chapter lists no sources.')));
    pageOf(S, M, { leaf: idea.id + ':practice', up: { href: c.href, label: 'Chapter ' + c.rn }, path: [{ t: slugOf(M.book), cls: 'fit' }, { t: 'ch-' + c.rn.toLowerCase() }, { t: c.practice ? 'practice' : 'sources' }], cls: 'dos-practice', kids: kids });
  }
  function sourceTile(sid, s) {
    var t = splitTitle(s.title), url = safeUrl(s.url);
    return h('li', { class: 't t-grey p-src', id: sid + '-s' + s.n, tabindex: '-1' },
      h('p', { class: 'p-src-top' }, h('span', { class: 'p-chip' }, vh('Source '), String(s.n)), h('span', { class: 'p-src-name' }, t.pub || t.title)),
      t.pub ? h('p', { class: 'p-src-work' }, t.title) : null,
      s.quote ? h('blockquote', { class: 'p-src-q' }, unquote(s.quote)) : null,
      url ? h('a', { class: 'p-src-u', href: url, target: '_blank', rel: 'noopener noreferrer' }, hostOf(url), icon('out'), vh(' (opens a new tab)')) : null);
  }
  // One part of the practice page, in the lesson's own words.
  function practicePart(p, fx, id) {
    var lab = partLabel(p), paras = p.paras.map(function (t) { return inl(h('p'), t, fx); });
    var list = p.items.length ? h('ul', { class: 'p-items' }, p.items.map(function (t) { return inl(h('li'), t, fx); })) : null;
    if (p.kind === 'steps') {
      return tile('section', 'white', { span: 'full', cls: 'p-steps', attrs: { 'aria-labelledby': id } }, [heading(id, lab), paras.length ? h('div', { class: 't-prose' }, paras) : null,
        p.items.length ? h(p.ordered || !paras.length ? 'ol' : 'ul', { class: 'p-check' }, p.items.map(function (t, k) {
          return h('li', null, h('span', { class: 'p-step-n', 'aria-hidden': 'true' }, String(k + 1)), inl(h('span', { class: 'p-step-t' }), t, fx));
        })) : null]);
    }
    if (p.kind === 'rules') {
      var first = p.paras.length ? firstSentence(p.paras[0]) : null, rest = [];
      if (first && first.rest) rest.push(inl(h('p'), first.rest, fx));
      p.paras.slice(1).forEach(function (t) { rest.push(inl(h('p'), t, fx)); });
      return tile('section', 'em', { span: 'full', cls: 'p-rules', attrs: { 'aria-label': lab } }, [label(lab),
        first ? inl(h('p', { class: 'p-rule-lead ' + leadSize(first.lead) }), first.lead, fx) : null,
        rest.length || list ? h('div', { class: 'p-rule-rest' }, rest, list) : null]);
    }
    if (p.kind === 'example') return tile('section', 'grey', { span: 'full', cls: 'p-example', attrs: { 'aria-label': lab } }, [label(lab), h('div', { class: 't-prose' }, paras, list)]);
    if (p.kind === 'mistakes') {
      // One warning tile per mistake, two to a row (an odd last one across); written as
      // paragraphs, one tile across the page.
      var cells = [];
      if (paras.length) cells.push(h('li', { class: 't t-warn p-mis is-wide' }, icon('cross', 'p-x'), h('div', { class: 't-prose' }, paras)));
      p.items.forEach(function (t) { cells.push(h('li', { class: 't t-warn p-mis' }, icon('cross', 'p-x'), inl(h('p'), t, fx))); });
      return h('section', { class: 't-bare t-full p-mistakes', 'aria-labelledby': id }, heading(id, lab, 'p-sec is-red'),
        h('ul', { class: 'p-mis-grid' + (p.items.length % 2 ? ' is-odd' : '') }, cells));
    }
    return tile('section', 'grey', { span: 'full', cls: 'p-other', attrs: lab ? { 'aria-label': lab } : null }, [lab ? label(lab) : null, h('div', { class: 't-prose' }, paras, list)]);
  }

  // ---------- the glossary and the bibliography ----------
  function backMatter(S, M, which) {
    var b = M.book, g = M.gloss.length > 0;
    U.setTitle((which === 'biblio' || !g ? 'Bibliography' : 'Glossary') + ' · ' + b.title);
    var kids = [];
    if (g) {
      kids.push(h('header', { class: 't-bare t-full p-head' }, h('p', { class: 't-label' }, b.title),
        h('h1', { class: 'p-h1', tabindex: '-1', id: 'glossary' }, 'Glossary'),
        h('p', { class: 'p-sub' }, 'Every key term the chapters introduce, in the words that introduced it.')));
      kids.push(h('dl', { class: 't-bare t-full b-gloss' }, M.gloss.map(function (x) {
        return h('div', { class: 't t-grey b-term' }, h('dt', null, h('mark', { class: 'term' }, x.term)),
          h('dd', null, inl(h('p', { class: 'b-def' }), x.text, null), h('p', { class: 'b-first' }, 'First met in ', h('a', { href: x.ch.href }, 'chapter ' + x.ch.rn + ', ' + x.ch.idea.title))));
      })));
    }
    // With no key terms the page is the bibliography alone, headed by it.
    kids.push(h('header', { class: 't-bare t-full p-head' + (g ? ' b-head' : '') }, g ? null : h('p', { class: 't-label' }, b.title),
      h(g ? 'h2' : 'h1', { class: g ? 'p-h2' : 'p-h1', id: 'bibliography', tabindex: '-1' }, 'Bibliography'),
      h('p', { class: 'p-sub' }, M.works.length ? 'Every page the course’s research kept, with the chapters that rest on it. Open an entry to read the words it quoted.' : 'No sources were kept for this course.')));
    if (M.works.length) kids.push(h('ol', { class: 't-bare t-full b-biblio' }, M.works.map(function (w) {
      var url = safeUrl(w.url);
      return h('li', { class: 't t-grey b-work' },
        h('p', { class: 'b-w' }, w.pub ? h('span', { class: 'b-pub' }, w.pub) : null, h('cite', null, w.title)),
        url ? h('a', { class: 'p-src-u', href: url, target: '_blank', rel: 'noopener noreferrer' }, hostOf(url), icon('out'), vh(' (opens a new tab)')) : null,
        w.ch.length ? h('p', { class: 'b-ch' }, w.ch.length === 1 ? 'Chapter ' : 'Chapters ', w.ch.map(function (n, k) {
          var ch = M.chapters[n - 1];
          return [k ? ', ' : '', ch && ch.learned ? h('a', { href: ch.href }, roman(n), vh(': ' + ch.idea.title)) : roman(n)];
        })) : null,
        w.quotes.length ? h('details', { class: 'b-q' }, h('summary', null, icon('chev'), w.quotes.length === 1 ? 'The passage it quoted' : 'The ' + w.quotes.length + ' passages it quoted'),
          w.quotes.map(function (q) { return h('blockquote', null, unquote(q)); })) : null);
    })));
    pageOf(S, M, { leaf: 'back', up: { href: M.base, label: 'Contents' }, path: [{ t: slugOf(b), cls: 'fit' }, { t: g ? 'glossary' : 'bibliography' }], cls: 'dos-back', kids: kids });
    if (which === 'biblio' && g) scrollTo(document.getElementById('bibliography'));
  }

  // =====================================================================================
  // THE LIBRARY'S DOSSIERS (73-book.js draws the page around them)
  // =====================================================================================
  // The lead tile is the dossier most recently bound that is still being written; then the rest
  // as half tiles: still being written, finished, kept. o.after: a tile to end the grid with
  // ("In your own words").
  function shelf(box, ctx, o) {
    o = o || {};
    var grid = h('ul', { class: 'dl-grid', 'aria-label': 'Dossiers' }, h('li', { class: 'dl-span' }, h('div', { class: 'skeleton dl-sk' })));
    box.appendChild(grid);
    function bars(d) {
      var many = d.ideas.length > 10;
      return h('span', { class: 'dl-bars' + (many ? ' is-many' : '') }, d.ideas.map(function (i, k) {
        return h('span', { class: 'dl-bar' + (d.have[i.id] ? ' on' : '') }, h('i'), many ? null : h('b', null, roman(k + 1)));
      }));
    }
    function lead(d) {
      return h('li', { class: 'dl-span' }, h('a', { class: 't t-white t-first dl-tile dl-lead', href: '#/book/' + encodeURIComponent(d.tid) },
        h('span', { class: 'dl-top' }, h('span', { class: 't-label' }, dossierNo(d.no)), h('span', { class: 'dl-state' }, 'still being written')),
        h('span', { class: 'dl-title' }, d.title),
        vh(d.count + ' of ' + plural(d.total, 'chapter', 'chapters') + ' bound.'),
        h('span', { class: 'dl-prog', 'aria-hidden': 'true' },
          h('span', { class: 'dl-ring' }, ring(d.count, d.total, 72, 8), h('span', { class: 'dl-ring-n' }, d.count + '/' + d.total)), bars(d)),
        h('span', { class: 'dl-foot' }, h('span', { class: 'dl-when' }, d.lastRn ? 'ch. ' + d.lastRn + ' bound ' + dayMonth(d.last) : ''),
          h('span', { class: 't-open' }, 'Open', icon('next')))));
    }
    function half(d, kind) {
      var foot = kind === 'done' ? h('span', { class: 'dl-fin' }, h('span', { class: 'dl-check', 'aria-hidden': 'true' }, icon('tick')), 'Finished ' + dayMonth(d.finished))
        : kind === 'kept' ? h('span', { class: 'dl-meta' }, d.count + ' of ' + d.total, vh(' chapters'), ' · course deleted')
        : h('span', { class: 'dl-row' }, ring(d.count, d.total, 34, 5), h('span', { class: 'dl-meta' }, d.count + ' of ' + d.total, vh(' chapters bound, still being written')));
      return h('li', null, h('a', { class: 't ' + (kind === 'done' ? 't-white' : kind === 'kept' ? 't-dashed' : 't-grey') + ' dl-tile dl-' + kind, href: '#/book/' + encodeURIComponent(d.tid) },
        h('span', { class: 't-label' }, dossierNo(d.no) + (kind === 'kept' ? ' · kept' : '')), h('span', { class: 'dl-name' }, d.title), foot));
    }
    function render(list, topics, progressAll, nos) {
      var live = {}; arr(topics).forEach(function (t) { if (t && t.id) live[t.id] = true; });
      var shown = arr(list).filter(function (d) {
        if (!d || !d.title || !d.__id) return false;
        return !live[d.__id] || on((progressAll || {})[d.__id]);   // a kept dossier, or a course that keeps one
      }).map(function (d) {
        var have = chaptersOf(d), ideas = arr(d.ideas).filter(isObj), n = countOf(d);
        var done = ideas.length > 0 && n >= ideas.length, last = '', lastRn = '';
        ideas.forEach(function (i, k) { var x = isObj(have[i.id]) ? String(have[i.id].doneAt || '') : ''; if (x && x > last) { last = x; lastRn = roman(k + 1); } });
        return { tid: d.__id, title: d.title, ideas: ideas, have: have, count: n, total: ideas.length, done: done, closed: !done && !live[d.__id],
          finished: done ? last : null, last: last, lastRn: lastRn, started: String(d.startedAt || d.createdAt || ''), no: nos[d.__id] || 0 };
      }).filter(function (d) { return d.count > 0; });
      var going = shown.filter(function (d) { return !d.done && !d.closed; }).sort(function (a, b) { return a.last < b.last ? 1 : a.last > b.last ? -1 : 0; });
      var done = shown.filter(function (d) { return d.done; }).sort(function (a, b) { return a.finished < b.finished ? 1 : -1; });
      var kept = shown.filter(function (d) { return d.closed; }).sort(function (a, b) { return a.started < b.started ? 1 : -1; });
      var items = [];
      if (!shown.length) {
        items.push(h('li', { class: 'dl-span' }, U.rt.savedLate() && U.views && U.views.savedLate ? U.views.savedLate('your dossiers')
          : tile('p', 'grey', { cls: 'lib-empty' }, [h('strong', null, 'No dossiers yet'), h('span', null, 'When you finish an idea in a course, its first chapter is bound here.')])));
      } else {
        if (going.length) items.push(lead(going[0]));
        going.slice(1).forEach(function (d) { items.push(half(d, 'going')); });
        done.forEach(function (d) { items.push(half(d, 'done')); });
        kept.forEach(function (d) { items.push(half(d, 'kept')); });
      }
      if (o.after) items.push(h('li', null, o.after));
      U.clear(grid);
      U.append(grid, items);
    }
    function read() {
      numbersP = null;
      return Promise.all([U.store.dossier.list(), U.store.topics.list(), U.store.progress.all(), numbers()]);
    }
    read().then(function (r) {
      if (!ctx.alive()) return;
      render(r[0], r[1], r[2], r[3]);
      // Backfill: chapters finished before dossiers existed (or missed), once per page load.
      return syncAll(r[1], r[2], r[0]).then(function (n) {
        if (!n || !ctx.alive()) return;
        return read().then(function (r2) { if (ctx.alive()) render(r2[0], r2[1], r2[2], r2[3]); });
      });
    }).catch(function (e) {
      if (!ctx.alive()) return;
      console.warn('dossier: shelf', e);
      U.clear(grid).appendChild(h('li', { class: 'dl-span' }, tile('div', 'grey', null, U.views && U.views.loadError ? U.views.loadError('Your dossiers', e, false) : h('p', null, U.errText(e)))));
      if (o.after) grid.appendChild(h('li', null, o.after));
    });
    return function () {};
  }
  // "In your own words", as a tile for the Library's grid (73-book.js).
  function ownTile(href) {
    return h('a', { class: 't t-grey dl-tile dl-own own', href: href },
      icon('pen', 'dl-own-ico'), h('span', { class: 'dl-name' }, 'In your own words'), h('span', { class: 't-open' }, 'Open', icon('next')));
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
  // SAVE A COPY: the whole dossier as one HTML file in the same tiles (styles inline, fonts by
  // link with fallbacks, the plate as static text, no scripts)
  // =====================================================================================
  var EXPORT_FONTS = 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Barlow+Semi+Condensed:wght@500;600&family=JetBrains+Mono:wght@400;500&display=swap';
  var EXPORT_CSS = [
    ':root{--bg:#FAFAF8;--surface:#FFFFFF;--sunk:#F2F3F4;--ink:#1D1F22;--muted:#5F6670;--teal:#0B6A70;--teal-tint:#E1F1F1;--hl:#F8DC8A;--red:#9F3038;--green:#2E7D4F;',
    '--line:#E1E4E7;--line-strong:#A9AFB6;--edge:#1D1F22;--dot:#D9D9D4;--on-ink:#FFFFFF;',
    '--sans:"Barlow",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;--cond:"Barlow Semi Condensed","Barlow",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace}',
    '@media (prefers-color-scheme:dark){:root{--bg:#141619;--surface:#1D2024;--sunk:#24282D;--ink:#ECEDEE;--muted:#A3A9B1;--teal:#6CC7BD;--teal-tint:#173030;--hl:rgba(240,185,58,.34);--red:#F2A6AC;--green:#6FCB94;--line:#33373D;--line-strong:#5A6068;--edge:#D7D9DC;--dot:#2A2E33;--on-ink:#141619}}',
    '*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}',
    'body{margin:0;background:var(--bg) radial-gradient(var(--dot) 1px,transparent 1.3px) 0 0/16px 16px;color:var(--ink);font:400 1rem/1.5 var(--sans)}',
    '.x{max-width:46rem;margin:0 auto;padding:16px 16px 40px}.g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 28px}',
    '.t{min-width:0;padding:12px 14px;border-radius:6px;background:var(--sunk);overflow-wrap:break-word}.full{grid-column:1/-1}.mono a{word-break:break-all}',
    '.w{background:var(--surface);border:1.5px solid var(--edge);border-radius:16px}.em{background:var(--surface);border:2px solid var(--edge);border-radius:16px;box-shadow:3px 3px 0 var(--edge)}',
    '.ink{background:var(--ink);color:var(--bg);border-radius:16px}.warn{background:var(--surface);border:1.5px solid var(--red);border-radius:16px;color:var(--red)}',
    '.k{margin:0 0 6px;font:500 .66rem/1.3 var(--mono);text-transform:uppercase;color:var(--muted)}.ink .k{color:inherit;opacity:.75}.red,.warn .k{color:var(--red)}',
    '.kind{margin-left:8px;font:600 .7rem/1 var(--cond);letter-spacing:.09em;color:var(--teal)}',
    'h1,h2,h3{margin:0;line-height:1.1;letter-spacing:-.01em}h1{font-size:2.1rem}h2{font-size:1.25rem}h3{font-size:1rem}h2.part{grid-column:1/-1;margin:14px 2px 0;font-size:1.6rem}',
    'p,ul,ol,dl,blockquote,figure{margin:0 0 .6em}.t>:last-child,.t>div>:last-child{margin-bottom:0}a{color:inherit}',
    'mark.term{color:inherit;font-weight:600;background:linear-gradient(180deg,transparent 50%,var(--hl) 50%,var(--hl) 92%,transparent 92%)}',
    'sup.fn{font:600 .7em/1 var(--cond)}sup.fn a{padding:1px 4px;border-radius:4px;background:var(--teal-tint);color:var(--teal);text-decoration:none}',
    '.big{font-size:1.9rem;font-weight:700;line-height:1}.key{font-size:1.125rem;font-weight:600;line-height:1.35}.lead{font-size:1.6rem;font-weight:700;line-height:1.1;letter-spacing:-.02em}',
    '.small{font-size:.875rem}.mono{font:500 .75rem/1.4 var(--mono);color:var(--muted)}.ink .mono{color:inherit;opacity:.75}',
    '.clip{margin:.6em 0;padding:10px 12px;border-radius:8px;background:var(--surface)}.clip blockquote{margin:0 0 4px}',
    '.pills span{display:inline-block;margin:0 4px 4px 0;padding:2px 10px;border:1.5px solid var(--line-strong);border-radius:99px;font-size:.85rem}.pills .on{background:var(--ink);color:var(--bg);border-color:var(--ink)}',
    '.toc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0;list-style:none}.toc li{padding:8px 9px;border:1.5px dashed var(--line-strong);border-radius:10px;color:var(--muted)}',
    '.toc li.on{border:1.5px solid var(--edge);color:var(--ink);font-weight:600}.toc .mono{display:block}',
    '.mis::before{content:"\\2715  ";font-weight:700}.steps{padding-left:1.4em}.steps li{margin:0 0 .4em}.steps li::marker{font-weight:700}',
    'blockquote{font-style:italic;color:var(--muted)}.chip{display:inline-block;min-width:20px;margin-right:6px;border-radius:4px;background:var(--teal-tint);color:var(--teal);text-align:center;font:600 .75rem/20px var(--cond)}',
    '.num{font-size:1.6rem;font-weight:700}.nums{padding-left:1.1em}',
    '@media (max-width:24rem){.g>.t{grid-column:1/-1}}@media print{body{background:#fff}.t{break-inside:avoid}}',
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
  function xk(text, cls) { return h('p', { class: 'k' + (cls ? ' ' + cls : '') }, text); }
  // Tiles laid two to a row: an odd last one runs across.
  function halves(list) { return list.map(function (t, k) { if (list.length % 2 && k === list.length - 1) t.classList.add('full'); return t; }); }
  function exportChapter(M, c) {
    var L = c.lesson, it = L.interactive, sid = 'c' + c.n, fx = exportFx(sid, L);
    var ex = explainParts(L), clip = clipOf(ex.ps, fx.by), cert = certainOf(c), cmp = compareOf(M, c), views = viewsOf(L);
    var out = [
      h('div', { class: 't w full' }, xk(['Chapter ' + c.rn + ' of ' + roman(M.N), c.idea.kind ? h('span', { class: 'kind' }, c.idea.kind) : null]),
        h('h2', null, c.idea.title), h('p', { class: 'mono' }, 'Learned ' + shortDate(c.learned))),
      ex.note ? h('div', { class: 't em full' }, xk('Key idea'), xInl(h('p', { class: 'key' }), ex.note, fx)) : null,
    ];
    if (c.hasPlate) {
      var look = lookFor(it);
      out.push(h('div', { class: 't full' }, xk('Plate ' + c.rn), h('h3', null, it.title),
        h('p', { class: 'small' }, c.doc.plate ? 'The live plate plays in the dossier in My University.' : (c.doc.plateNote || PLATE_NOTE)),
        look ? h('p', null, h('b', null, 'Look for '), look) : null));
    }
    var exp = h('div', { class: 't full' }, xk('What’s going on'));
    ex.ps.forEach(function (p, k) {
      U.append(exp, xRich(p, fx));
      if (clip && k === clip.at) {
        var ct = splitTitle(clip.src.title);
        exp.appendChild(h('figure', { class: 'clip' }, h('blockquote', null, unquote(clip.src.quote)), xInl(h('figcaption', { class: 'mono' }), (ct.pub || ct.title) + ' [^' + clip.src.n + ']', fx)));
      }
    });
    out.push(exp);
    out = out.concat(halves(views.map(function (v) { return h('div', { class: 't' }, xk(v.label || 'One view'), xRich(v.text, fx)); })));
    var side = [];
    if (L.analogy && L.analogy.text) {
      side.push(h('div', { class: 't' }, xk('Think of it like'), xRich(L.analogy.text, fx)));
      if (L.analogy.breaks) side.push(xInl(h('div', { class: 't warn' }, xk('Where it breaks')), L.analogy.breaks, fx));
    }
    out = out.concat(halves(side));
    function list(xs) { return xs.map(function (x) { return 'ch. ' + x.rn; }).join(', ').replace(/, ([^,]*)$/, ' and $1'); }
    var cc = [];
    if (cmp.deps.length || cmp.later.length) cc.push(h('div', { class: 't' }, xk('Compare'), h('p', { class: 'small' }, (cmp.deps.length ? 'Builds on ' + list(cmp.deps) + '. ' : '') + (cmp.later.length ? 'Comes back in ' + list(cmp.later) + '.' : ''))));
    cc.push(h('div', { class: 't' }, xk('How certain'), h('p', { class: 'pills' }, ['settled', 'simplified', 'contested'].map(function (k) { return h('span', { class: k === cert.conf ? 'on' : null }, k); })), h('p', { class: 'small' }, cert.why)));
    out = out.concat(halves(cc));
    if (c.hasPlate) {
      var nm = numberOf(it, L, fx.by), notes = [];
      if (nm) notes.push(xInl(h('div', { class: 't' }, xk('A number from the sources'), h('p', { class: 'num' }, nm.value), h('p', { class: 'small' }, nm.label), 'Source '), '[^' + nm.source + ']', fx));
      if (it.whatAmILookingAt) notes.push(h('div', { class: 't' }, xk('What you’re looking at'), xRich(it.whatAmILookingAt, fx)));
      if (it.ignores) notes.push(h('div', { class: 't' }, xk('What this model leaves out'), xRich(it.ignores, fx)));
      out = out.concat(halves(notes));
      if (arr(it.numbers).length) out.push(h('div', { class: 't full' }, xk('The numbers on this plate (' + it.numbers.length + ')'), h('ul', { class: 'nums small' }, it.numbers.map(function (x) {
        return xInl(h('li'), x.label + ': ' + x.value + ' (' + (x.kind === 'constant' ? 'cited' : x.kind === 'control' ? 'setting' : 'worked out') + ')' + (x.source && fx.by[x.source] ? ' [^' + x.source + ']' : ''), fx);
      }))));
    }
    if (c.practice) {
      out.push(h('h2', { class: 'part' }, 'Put it into practice'));
      c.practice.forEach(function (p) { out = out.concat(exportPart(p, fx)); });
    }
    out.push(xk('Sources', 'full'));
    out.push(arr(L.sources).length ? halves(arr(L.sources).map(function (s) {
      var t = splitTitle(s.title), url = safeUrl(s.url);
      return h('div', { class: 't', id: sid + '-s' + s.n }, h('p', null, h('span', { class: 'chip' }, String(s.n)), h('b', null, t.pub || t.title)),
        t.pub ? h('p', { class: 'small' }, t.title) : null, s.quote ? h('blockquote', { class: 'small' }, unquote(s.quote)) : null,
        url ? h('p', { class: 'mono' }, h('a', { href: url }, url)) : null);
    })) : h('p', { class: 't full small' }, c.doc.sourced === false ? UNSOURCED : 'This chapter lists no sources.'));
    return h('section', { id: 'ch-' + c.n, class: 'g' }, out);
  }
  // One part of "Put it into practice", as the page's tiles.
  function exportPart(p, fx) {
    var lab = partLabel(p), paras = p.paras.map(function (t) { return xInl(h('p'), t, fx); });
    var list = p.items.length ? h(p.kind === 'steps' && (p.ordered || !paras.length) ? 'ol' : 'ul', { class: p.kind === 'steps' ? 'steps' : null }, p.items.map(function (t) { return xInl(h('li'), t, fx); })) : null;
    if (p.kind === 'steps') return [h('div', { class: 't w full' }, xk(lab), paras, list)];
    if (p.kind === 'rules') {
      var first = p.paras.length ? firstSentence(p.paras[0]) : null;
      return [h('div', { class: 't em full' }, xk(lab), first ? xInl(h('p', { class: 'lead' }), first.lead, fx) : null,
        first && first.rest ? xInl(h('p', { class: 'key' }), first.rest, fx) : null, p.paras.slice(1).map(function (t) { return xInl(h('p', { class: 'key' }), t, fx); }), list)];
    }
    if (p.kind === 'example') return [h('div', { class: 't full' }, xk(lab), paras, list)];
    if (p.kind === 'mistakes') {
      return [xk(lab, 'full red'), paras.length ? h('div', { class: 't warn full mis' }, paras) : null]
        .concat(halves(p.items.map(function (t) { return xInl(h('div', { class: 't warn mis' }), t, fx); })));
    }
    return [h('div', { class: 't full' }, lab ? xk(lab) : null, paras, list)];
  }
  function exportHtml(M) {
    var b = M.book, x = h('div', { class: 'x' }), n = M.bound.length, s = b.startedAt, w = M.works.length;
    x.appendChild(h('header', { class: 'g' },
      h('div', { class: 't w full' }, xk((M.no ? dossierNo(M.no) + ' · ' : '') + 'A course in ' + plural(M.N, 'idea', 'ideas') + ' · My University'), h('h1', null, b.title)),
      h('div', { class: 't ink' }, xk(M.done ? 'Finished' : 'Bound'), h('p', { class: 'big' }, M.done ? dayMonth(M.finished) : n + '/' + M.N),
        h('p', { class: 'mono' }, M.done ? yearOf(M.finished) + ' · ' + plural(M.N, 'chapter', 'chapters') : 'chapters'), b.kept ? h('p', { class: 'small' }, 'Kept from a deleted course') : null),
      h('div', { class: 't' }, xk('Begun'), h('p', { class: 'big' }, s ? dayMonth(s) : '—'), h('p', { class: 'mono' }, [s ? yearOf(s) : '', w ? plural(w, 'source', 'sources') : ''].filter(Boolean).join(' · '))),
      h('nav', { class: 't w full', 'aria-label': 'Contents' }, xk('Chapters'), h('ol', { class: 'toc' }, M.chapters.map(function (c) {
        return h('li', { class: c.learned ? 'on' : null }, h('span', { class: 'mono' }, c.rn), c.learned ? h('a', { href: '#ch-' + c.n }, c.idea.title) : c.idea.title,
          c.learned ? null : h('span', { class: 'mono' }, M.closed ? 'not written' : 'not yet written'));
      }))),
      b.hook ? xInl(h('div', { class: 't full' }, xk('The question it set out to answer')), b.hook, null) : null,
      b.oneBreath ? h('div', { class: 't full' }, xk('In one breath'), xRich(b.oneBreath, null)) : null));
    M.bound.forEach(function (c) { x.appendChild(exportChapter(M, c)); });
    if (M.gloss.length) x.appendChild(h('section', { id: 'glossary', class: 'g' }, h('h2', { class: 'part' }, 'Glossary'), M.gloss.map(function (g) {
      return h('div', { class: 't full' }, h('p', null, h('mark', { class: 'term' }, g.term)), xInl(h('p'), g.text, null),
        h('p', { class: 'mono' }, 'First met in ', h('a', { href: '#ch-' + g.ch.n }, 'chapter ' + g.ch.rn + ', ' + g.ch.idea.title)));
    })));
    if (w) x.appendChild(h('section', { id: 'bibliography', class: 'g' }, h('h2', { class: 'part' }, 'Bibliography'), M.works.map(function (wk) {
      var url = safeUrl(wk.url);
      return h('div', { class: 't full' }, h('p', null, wk.pub ? h('b', null, wk.pub + '. ') : null, h('cite', null, wk.title), url ? ['. ', h('a', { class: 'mono', href: url }, hostOf(url))] : null),
        wk.ch.length ? h('p', { class: 'mono' }, (wk.ch.length === 1 ? 'Chapter ' : 'Chapters ') + wk.ch.map(roman).join(', ')) : null,
        wk.quotes.map(function (q) { return h('blockquote', { class: 'small' }, unquote(q)); }));
    })));
    var title = h('title', null, b.title + ' · Dossier · My University');
    return '<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + title.outerHTML + '\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="' + EXPORT_FONTS.replace(/&/g, '&amp;') + '">\n' +
      '<style>\n' + EXPORT_CSS + '\n</style>\n</head>\n<body>\n' + x.outerHTML + '\n</body>\n</html>\n';
  }
  function save(M, btn) {
    var lab = btn ? btn.querySelector('span') || btn : null;
    if (btn) { btn.disabled = true; lab.textContent = 'Preparing…'; }
    var name = 'dossier-' + U.slug(M.book.title) + '-' + U.today() + '.html';
    return Promise.resolve().then(function () { return U.saveFile(name, exportHtml(M), 'text/html'); }).then(function (ok) {
      if (ok) U.toast('Dossier saved.', { kind: 'good' });
      return ok;
    }, function (e) { U.toast('Could not save the dossier: ' + U.errText(e), { kind: 'bad' }); return false; }).then(function (ok) {
      if (btn) { btn.disabled = false; lab.textContent = 'Save a copy'; }
      return ok;
    });
  }

  // =====================================================================================
  // ROUTES (the Library's #/book and #/library/dossiers, and the Book's #/book/words, are
  // 73-book.js's, registered first)
  // =====================================================================================
  var R = { focus: true, tab: 'book', title: 'Dossier' };
  U.routes.add('#/book/:tid', reader('glance'), R);
  U.routes.add('#/book/:tid/contents', reader('contents'), R);              // older: at a glance, at its chapters
  U.routes.add('#/book/:tid/glossary', reader('back'), R);
  U.routes.add('#/book/:tid/bibliography', reader('biblio'), R);
  U.routes.add('#/book/:tid/:iid', reader('chapter'), R);
  U.routes.add('#/book/:tid/:iid/plate', reader('plate'), R);               // older: the chapter, at its plate
  U.routes.add('#/book/:tid/:iid/plate/play', reader('play'), R);           // and the plate awake
  U.routes.add('#/book/:tid/:iid/practice', reader('practice'), R);
  U.routes.add('#/book/:tid/:iid/tests', reader('practice'), R);            // its older address

  U.dossier = {
    LIMIT: LIMIT, PLATE_NOTE: PLATE_NOTE,
    chapterFrom: chapterFrom, researchFrom: researchFrom, indexFrom: indexFrom, practiceParts: practiceParts, model: model, due: due, countOf: countOf, bytes: bytes,
    on: on, bind: bind, sync: sync, keep: keep, remove: remove, setOn: setOn, load: load,
    shelf: shelf, ownTile: ownTile, option: option, confirmDelete: confirmDelete, exportHtml: exportHtml, save: save,
  };
})();
