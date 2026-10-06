// Interactive builder: asks Claude to write one kit body for an idea (TASK: build-interactive),
// pulls the HTML out of the reply, self-tests it in hidden sandboxes (32-sandbox.js), checks what
// the lesson itself needs (the ids its checks use, no web addresses but its own sources, every
// target check reachable) and asks for up to two repairs (TASK: repair-interactive) with the
// problems found. Contract: docs/ARCHITECTURE.md section 9. The prompt builders are pure (no DOM
// at load or call), so tools/eval/prompts.mjs can run them in Node. Kit features that may not
// exist yet are used only when KIT.md documents them (prompts) or U.sandbox has them (reach).
U.KIT_MD = "@@KIT_MD@@";
U.KIT_EXAMPLES = "@@KIT_EXAMPLES@@";   // [{name, kind, body}] from app/kit/examples

U.interactive = (function () {
  // Which exemplar anchors which kind of idea: its own kind, then the nearest cousins.
  var NEAREST = {
    quantity: ['quantity', 'mechanism', 'skill'],
    mechanism: ['mechanism', 'quantity'],
    skill: ['skill', 'quantity', 'mechanism'],
    process: ['process', 'history', 'structure'],
    history: ['history', 'process', 'structure'],
    structure: ['structure', 'process', 'concept'],
    concept: ['concept', 'structure', 'process'],
  };
  var LEVEL = { new: 'Dan is new to this topic.', some: 'Dan knows a little about this topic.', solid: 'Dan is already fairly solid on this topic.' };
  var MAX_ATTEMPTS = 3; // the first build plus two repairs

  function str(v) { return v == null ? '' : String(v).trim(); }
  function clip(v, n) { v = str(v); return v.length > n ? v.slice(0, n - 1) + '…' : v; }
  function num(v) { var n = Number(v); return isFinite(n) ? String(+n.toPrecision(4)) : str(v); }
  function examples() { return Array.isArray(U.KIT_EXAMPLES) ? U.KIT_EXAMPLES : []; }
  function kitMd() { return typeof U.KIT_MD === 'string' && U.KIT_MD.indexOf('@@') !== 0 ? U.KIT_MD : '(kit reference missing from this build)'; }
  function kitHas(name) { return kitMd().indexOf(name) >= 0; }
  function exampleFor(kind) {
    var list = examples(), order = NEAREST[kind] || NEAREST.concept;
    for (var i = 0; i < order.length; i++) {
      var hit = list.filter(function (e) { return e.kind === order[i]; })[0];
      if (hit) return hit;
    }
    return list[0] || null;
  }

  // ---------- what the lesson needs from the page ----------
  function targetChecks(lesson) {
    return ((lesson && lesson.checks) || []).filter(function (c) { return c && c.type === 'target' && c.control && c.output; });
  }
  // Ids the page must have: controls that target checks set, and model outputs that target
  // checks read or the lesson declares.
  function requiredIds(lesson) {
    var out = { controls: [], outputs: [] };
    function add(list, id) { id = str(id); if (id && list.indexOf(id) < 0) list.push(id); }
    targetChecks(lesson).forEach(function (c) { add(out.controls, c.control); add(out.outputs, c.output); });
    (((lesson && lesson.interactive) || {}).outputs || []).forEach(function (o) { if (o) add(out.outputs, o.id); });
    return out;
  }

  // Web addresses: a page may contain only its lesson's own sources (SVG/XML namespaces aside).
  function sourceList(lesson) { return ((lesson && lesson.sources) || []).filter(function (s) { return s && s.url; }); }
  function urlKey(u) {
    return str(u).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\d?\./, '').replace(/#.*$/, '').replace(/\/+$/, '');
  }
  function urlsIn(text) {
    var out = [], re = /https?:\/\/[^\s'"`<>\\)\]]+/gi, m;
    while ((m = re.exec(String(text || '')))) {
      var u = m[0].replace(/[.,;:!?]+$/, '');
      if (!/^https?:\/\/(www\.)?w3\.org\//i.test(u) && out.indexOf(u) < 0) out.push(u);
    }
    return out;
  }
  // Addresses in the body, or in the self-test's check sources, that are not the lesson's sources.
  function foreignUrls(html, lesson, report) {
    var allowed = sourceList(lesson).map(function (s) { return urlKey(s.url); }), found = urlsIn(html);
    ((report && report.checks) || []).forEach(function (c) {
      if (c && c.source) urlsIn(c.source).forEach(function (u) { if (found.indexOf(u) < 0) found.push(u); });
    });
    return found.filter(function (u) { return allowed.indexOf(urlKey(u)) < 0; });
  }
  function stripUrls(html, urls) {
    var out = String(html || '');
    urls.slice().sort(function (a, b) { return b.length - a.length; }).forEach(function (u) { out = out.split(u).join(''); });
    return out;
  }

  // Target checks the page can't satisfy by moving their control alone (U.sandbox.reach, when the
  // host has it) -> [{id, q, control, output, target, tolerance, best}]
  function unreachable(html, lesson) {
    var S = U.sandbox, list = targetChecks(lesson), out = [];
    if (!html || !S || typeof S.reach !== 'function' || !list.length) return Promise.resolve(out);
    return list.reduce(function (p, c) {
      return p.then(function () {
        return Promise.resolve().then(function () {
          return S.reach(html, { control: str(c.control), output: str(c.output), target: Number(c.target), tolerance: Math.abs(Number(c.tolerance)) || 0 });
        }).then(function (r) {
          // A page that could not be asked at all (load trouble) tells us nothing about the target.
          if (r && r.error && !r.tried) console.warn('target reach could not be checked', r.error);
          else if (r && r.reachable === false) out.push({ id: str(c.id), q: str(c.q), control: str(c.control), output: str(c.output), target: c.target, tolerance: c.tolerance, best: r.best || null });
        }, function (e) { console.warn('target reach could not be checked', e); });
      });
    }, Promise.resolve()).then(function () { return out; });
  }
  // best = {value: the control's setting, output: the reading there}, as U.sandbox.reach gives it.
  function bestText(b, control) {
    if (!b || b.output == null || !isFinite(Number(b.output))) return '';
    return ', but the closest this page gets is ' + num(b.output) + (b.value != null && b.value !== '' ? ', with "' + control + '" at ' + num(b.value) : '');
  }

  // ---------- prompt sections ----------
  function ideaSection(topic, idea) {
    topic = topic || {}; idea = idea || {};
    return [
      '## The idea',
      'Topic: ' + str(topic.title || topic.query),
      'Idea: ' + str(idea.title) + (idea.oneLine ? ' (' + str(idea.oneLine) + ')' : ''),
      'Kind: ' + (str(idea.kind) || 'concept'),
      LEVEL[topic.level] || LEVEL.new,
    ].join('\n');
  }
  function controlLine(c) {
    var head = '- id "' + str(c.id) + '": ' + str(c.label) + ', ';
    if (Array.isArray(c.options)) {
      var open = c.options[c.value] != null ? c.options[c.value] : c.options[0];
      return head + 'named options in this order: ' + c.options.map(function (x) { return '"' + str(x) + '"'; }).join(' / ') +
        ', opening on "' + str(open) + '" (K.choice; K.stepper when they are stages in order)';
    }
    if (c.min === 0 && c.max === 1 && c.step === 1) return head + 'an on/off switch (K.toggle), starting ' + (c.value ? 'on' : 'off');
    var unit = c.unit ? (/^[%°:×]/.test(str(c.unit)) ? '' : ' ') + str(c.unit) : '';
    return head + 'from ' + c.min + ' to ' + c.max + (c.step != null ? ' in steps of ' + c.step : '') + ', opening at ' + c.value + unit;
  }
  function isDp(o) { return typeof o.decimals === 'number' && o.decimals >= 0 && o.decimals <= 6 && Math.floor(o.decimals) === o.decimals; }
  function numberLine(n) {
    return '- ' + str(n.label) + ': ' + str(n.value) + ' (' + (str(n.kind) || 'number') + (n.source != null ? ', source [' + n.source + ']' : '') + ')';
  }
  function briefSection(lesson) {
    var spec = (lesson && lesson.interactive) || {}, out = ['## What the interactive must show'];
    if (spec.brief) out.push('Brief: ' + str(spec.brief));
    if (spec.title) out.push('Title (the app shows it above the frame, so do not repeat it): ' + str(spec.title));
    if (spec.whatAmILookingAt) out.push('The rule (the app also shows it beside the page, under "What am I looking at?"): ' + str(spec.whatAmILookingAt));
    if (spec.ignores) out.push('What the model leaves out (the app shows this in its own panel; do not repeat it on the page): ' + str(spec.ignores));
    var controls = (spec.controls || []).filter(function (c) { return c && c.id; });
    if (controls.length) {
      out.push('Controls (use these ids, ranges and opening values exactly):');
      controls.forEach(function (c) { out.push(controlLine(c)); });
    } else out.push('No controls were specified: choose the one that best shows the idea.');
    var outs = (spec.outputs || []).filter(function (o) { return o && o.id; });
    if (outs.length) {
      out.push('Outputs (return each from K.model under exactly this key, and show it with K.readout using the same id' +
        (outs.some(isDp) ? ' and the decimals given, which is how the explanation rounds it' : '') + '):');
      outs.forEach(function (o) {
        out.push('- id "' + str(o.id) + '": ' + str(o.label) + (o.unit ? ' (' + str(o.unit) + ')' : '') + (isDp(o) ? ', decimals: ' + o.decimals : ''));
      });
    } else if (Array.isArray(spec.outputs)) {
      out.push('Outputs: none. No rule computes a number here, so show no readouts beyond plain counts of what is on screen ("4 of 7 at war"): the picture, its labels and the .say line do the teaching.');
    }
    var nums = (spec.numbers || []).filter(function (n) { return n && n.label; });
    if (nums.length) {
      out.push('Numbers it may show (control = Dan sets it; computed = from the rule; constant = a fixed real value; assumed = an example value, shown as "for example"; date = a historical date or fact):');
      nums.forEach(function (n) { out.push(numberLine(n)); });
    }
    targetChecks(lesson).forEach(function (c) {
      out.push('A lesson check asks Dan: "' + clip(c.q, 200) + '" It sets control "' + str(c.control) + '" and reads "' + str(c.output) + '" through the kit (target ' + c.target +
        ', give or take ' + c.tolerance + '), every other control at its opening value. "' + str(c.output) + '" must be a key of what K.model returns, and the app checks that moving "' +
        str(c.control) + '" alone can reach the target.');
    });
    var pr = lesson && lesson.predict;
    if (pr && pr.q) {
      out.push('Dan\'s prediction, made before playing: "' + clip(pr.q, 240) + '"' + (pr.options && pr.options.length ? ' (options: ' + pr.options.map(str).join(' / ') + ')' : '') +
        '.');
    }
    return out.join('\n');
  }
  function explainSection(lesson) {
    var t = lesson && lesson.explain && lesson.explain.text;
    if (!t) return '';
    return '## The explanation Dan reads after playing (use the same words for the same things)\n' + clip(U.plain ? U.plain(t) : t, 1400);
  }
  function sourcesSection(lesson) {
    var src = sourceList(lesson);
    if (!src.length) {
      return '## Sources\nThis lesson has no checked sources, so the page contains no web addresses at all: its K.check entries are known-answer checks with no {source}, ' +
        'and the caption cites nothing. Use only textbook-standard rules, values and facts you are certain of. The app rejects any web address.';
    }
    return '## Sources\nThe only web addresses this page may contain, each only as a K.check {source} (the caption names a source in words); the app rejects any other:\n' + src.map(function (s) {
      return '[' + s.n + '] ' + clip(s.title, 120) + ' (' + str(s.url) + ')' + (s.quote ? ': "' + clip(s.quote, 240) + '"' : '');
    }).join('\n');
  }
  var DAN = [
    '## Dan and how he learns',
    '- He learns best by doing: something visual he can push and watch respond. Warm, plain words, first principles; no jargon unless explained.',
    '- He uses an Android phone (this frame is about 340 px wide there, touch only) and a laptop (about 1000 px, where K.stage puts the controls beside the visual). Design for the phone first.',
  ].join('\n');
  // What this lesson asks of the page beyond the kit reference's general rules (which cover
  // captions, rounding, colour words, extremes, checks and sound). Hiding the answer falls back
  // to a plain instruction when this build's KIT.md does not document k-after-move.
  function rulesSection() {
    return [
      '## Rules for this page',
      '- Dan answers his prediction by moving away from the opening state, so whatever gives the answer away stays hidden until his first move' +
        (kitHas('k-after-move') ? ' (the kit reference shows how: k-after-move, K.moved).' : ': reveal it once any control differs from its opening value.') +
        ' The opening view still looks alive: the picture, its labels and the opening state are drawn, and the lead line says what to try.',
      '- Show only the numbers listed above or computed from the rule, each written the way the explanation writes it (the same rounding). Show assumed values as examples ("for example, £1,000").',
      '- Any example cases you choose are fair and representative, never picked to exaggerate the effect.',
      '- Money, health and law: show how it works, never advice, and never a guaranteed outcome.',
    ].join('\n');
  }
  // KIT.md nested under this section: its title dropped, its headings one level down.
  function kitSection() { return '## The house kit (complete API reference)\n' + kitMd().replace(/^# [^\n]*\n+/, '').replace(/^(#{2,}) /gm, '#$1 '); }
  function outputSection(repair) {
    return '## Output\nReturn ONLY the ' + (repair ? 'complete corrected ' : '') + 'body: HTML elements, an optional <style>, then one inline <script> that ends with K.ready(). ' +
      'No <html>, <head> or <body> tags, no markdown fences, no commentary before or after. Keep it under 40 KB.';
  }

  // TASK: build-interactive
  function prompt(topic, idea, lesson, o) {
    o = o || {};
    var ex = exampleFor(idea && idea.kind);
    var parts = [
      'TASK: build-interactive',
      'You are building one small interactive page for "My University", Dan\'s personal learning app. It lets him see one idea for himself by playing with it. ' +
        'It runs inside a sandboxed iframe on top of the house kit described below, and the app tests it automatically before Dan sees it.',
      ideaSection(topic, idea),
      briefSection(lesson),
      explainSection(lesson),
      sourcesSection(lesson),
      DAN,
      rulesSection(),
      kitSection(),
    ];
    if (ex) {
      parts.push('## A finished example (kind: ' + ex.kind + '). Match its standard and structure, not its topic. Its SOURCE line and {source} addresses belong to that example\'s own lesson: never copy them\n' + ex.body.trim());
    }
    if (o.avoid) {
      parts.push('## Make it different\nA previous interactive for this idea did this: "' + clip(o.avoid, 400) + '". Dan has already seen it. ' +
        'Build a clearly different one: a different picture, or a different thing to push and watch.');
    }
    parts.push(outputSection(false));
    return parts.filter(Boolean).join('\n\n');
  }

  // ---------- problems, as lines a repair can act on ----------
  // Ids the lesson needs that the tested page lacks.
  function missingIds(report, lesson) {
    var req = requiredIds(lesson), out = [];
    var controls = (report && report.controls) || [], outs = (report && report.outputs) || [];
    req.controls.forEach(function (id) { if (controls.indexOf(id) < 0) out.push('Missing control id "' + id + '": a lesson check sets it, so a control must use exactly this id.'); });
    req.outputs.forEach(function (id) { if (outs.indexOf(id) < 0) out.push('Missing output "' + id + '": the lesson reads it, so K.model must return it under exactly this key (a readout alone is not enough).'); });
    return out;
  }
  function urlProblem(u, lesson) {
    return 'Unlisted web address "' + u + '": ' + (sourceList(lesson).length
      ? 'only the addresses under Sources may appear.'
      : 'this lesson has no checked sources, so the page must contain no web addresses.') + ' Remove it, and the {source} that holds it.';
  }
  function reachProblem(x) {
    return 'Target out of reach: check "' + x.id + '" asks Dan to move "' + x.control + '" until "' + x.output + '" reads ' + num(x.target) +
      (x.tolerance ? ' (give or take ' + num(x.tolerance) + ')' : '') + bestText(x.best, x.control) + '.';
  }
  // The failing report as plain lines (also used for the build loop's progress events).
  function problems(report, lesson, html) {
    if (!report) return ['The self-test did not run.'];
    var out = [];
    (report.errors || []).forEach(function (e) { out.push('Error: ' + e); });
    (report.checks || []).forEach(function (c) { if (!c.ok) out.push('Check failed: "' + c.label + '"' + (c.error ? ' (' + c.error + ')' : '')); });
    ((report.sweep && report.sweep.problems) || []).forEach(function (p) { out.push('While sweeping the controls: ' + p); });
    if (report.overflow) out.push('Too wide: ' + (report.overflowDetail || 'the page scrolls sideways at 340 px') + '.');
    (report.clipped || []).forEach(function (c) { out.push('Text cut off: ' + c); });
    out = out.concat(missingIds(report, lesson));
    var foreign = Array.isArray(report.foreign) ? report.foreign : html != null ? foreignUrls(html, lesson, report) : [];
    foreign.forEach(function (u) { out.push(urlProblem(u, lesson)); });
    (report.unreachable || []).forEach(function (x) { out.push(reachProblem(x)); });
    return out;
  }
  // The kit's warnings, minus advice to cite a source when the lesson has none to cite.
  function advice(report, lesson) {
    var sourced = sourceList(lesson).length > 0;
    return ((report && report.warnings) || []).filter(function (w) { return sourced || !/source/i.test(w); }).map(function (w) { return 'Advice: ' + w; });
  }

  // TASK: repair-interactive
  function repairPrompt(topic, idea, lesson, html, report) {
    var found = problems(report, lesson, html).concat(advice(report, lesson));
    return [
      'TASK: repair-interactive',
      'The interactive below, written for Dan\'s learning app, failed its automatic checks. Fix every problem listed and return the complete corrected body. Keep what already works.',
      ideaSection(topic, idea),
      briefSection(lesson),
      '## What the checks found (at 340, 720 and 1040 px wide)\n' + (found.length ? found.map(function (p) { return '- ' + p; }).join('\n') : '- It did not pass, but reported no details. Check that K.ready() is called once at the end.'),
      '## How to fix the usual problems\n' + [
        '- A thrown error (also from a K.button press or a K.anim step): go to the body line it names; check element ids, variable names and the kit call signatures.',
        '- NaN or Infinity: guard the maths at the ends of every control\'s range (division by zero, log of 0, square root of a negative), or start the range where the rule makes sense.',
        '- A model output that is a list or object: K.model returns single numbers or short strings; keep lists in your own variables.',
        '- Too wide at 340 px: let rows wrap (flex-wrap), use width:100% and max-width:100%, give SVG a viewBox with width 100%, no fixed widths over 300 px, shorter labels.',
        '- Text cut off: shorten it or let it wrap, or give it room (a wider box, a bigger viewBox); never cut it off or hide the overflow. SVG labels printed over each other, even by a letter or two: move one, or place them with K.labels. A plot\'s axis title too long for a phone: shorten it (about 30 characters). A word split across two lines (often at Text size XL): size its grid columns or tiles in rem, not px (minmax(6rem, 1fr)), so they reflow to fewer, wider columns; or use a shorter word.',
        '- The first control far below the main figure (phone layout): put the visual and its controls together with K.stage(visual, controls), secondary figures below.',
        '- K.sound: frequencies 20 to 20,000 Hz (200 to 2,000 for anything Dan must hear on a phone), dur above 0 and at most 10 s, gain 0 to 1, a listed type; play it from a K.button press.',
        '- Navigation, links out, connections or frames: everything stays on this page (no <a href> or forms, no location changes, no WebSocket, XMLHttpRequest or iframes); name sources in words.',
        '- A failing check: work the expected value out again by hand. Fix whichever is wrong, the model or the check. Never delete a correct check or change its expected answer to pass. A tolerance that was unrealistically tight (a millionth, where square roots or small steps meet rounding) may be widened to a sensible one (a thousandth of the size).',
        '- Slow updates: sample curves less densely and do not rebuild large parts of the page on every change.',
        '- Missing ids: use exactly the ids listed; an output must be a key of the object K.model returns.',
        '- An unlisted web address: delete it, and the {source} that held it.',
        '- A target out of reach: make the model follow the lesson\'s rule with the lesson\'s ranges and opening values, so moving that one control brings the output to the target.',
      ].join('\n'),
      sourcesSection(lesson),
      rulesSection(),
      kitSection(),
      '## The body that failed\n' + String(html || '(empty reply)'),
      outputSection(true),
    ].filter(Boolean).join('\n\n');
  }

  // A reply -> the body: strips fences, prose around the HTML, doctype and outer html/head/body
  // (keeping any <style> or <script> that was in the head).
  function extract(text) {
    var t = String(text || '');
    var fences = [], re = /```[a-zA-Z0-9-]*[ \t]*\n([\s\S]*?)```/g, m;
    while ((m = re.exec(t))) fences.push(m[1]);
    if (fences.length) t = fences.sort(function (a, b) { return b.length - a.length; })[0];
    else t = t.replace(/^\s*```[a-zA-Z0-9-]*[ \t]*\n/, '').replace(/\n```\s*$/, '');
    t = t.replace(/<!doctype[^>]*>/gi, '');
    t = t.replace(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i, function (_, inner) {
      return (inner.match(/<style\b[\s\S]*?<\/style\s*>|<script\b[\s\S]*?<\/script\s*>/gi) || []).join('\n');
    });
    t = t.replace(/<\/?(?:html|body)\b[^>]*>/gi, '').replace(/<title\b[\s\S]*?<\/title\s*>/gi, '').replace(/<meta\b[^>]*>/gi, '');
    var first = t.search(/<[a-zA-Z!]/);
    if (first > 0) t = t.slice(first);
    var last = t.lastIndexOf('>');
    if (last >= 0) t = t.slice(0, last + 1);
    return first < 0 ? '' : t.trim();
  }

  // Test one body against the kit's self-test and the lesson's own needs. The report gains
  // missing (ids), foreign (web addresses), unreachable (target checks) and passed (the
  // self-test proper, with the lesson's ids); ok is true only when nothing at all is wrong.
  function testBody(html, lesson) {
    if (!html) return Promise.resolve({ ok: false, passed: false, errors: ['The reply contained no HTML.'], overflow: false, checks: [], sweep: { ok: false, problems: [] }, controls: [], readouts: [], outputs: [], warnings: [], missing: [], foreign: [], unreachable: [] });
    return U.sandbox.test(html, { widths: [340, 720, 1040] }).then(function (r) {
      r.missing = missingIds(r, lesson);
      r.foreign = foreignUrls(html, lesson, r);
      r.unreachable = [];
      r.passed = !!r.ok && !r.missing.length;
      r.ok = r.passed && !r.foreign.length;
      if (!r.passed) return r;
      return unreachable(html, lesson).then(function (list) {
        r.unreachable = list;
        if (list.length) r.ok = false;
        return r;
      });
    });
  }

  // build(topic, idea, lesson, {onStatus, avoid, signal, priority, key})   priority: 'background' for
  //   a prefetch, or a function returning it (read at each call); key: U.ask's gate key
  //   -> Promise<{html, title, brief, selftest, attempts, unreachable?:[check ids]} | null>
  // Resolves null when the lesson has no interactive brief or no attempt passed its self-test;
  // rejects only when Claude can't be reached ({code, message} from U.ask). `unreachable` lists
  // target checks the final page could not satisfy: the caller drops them from the lesson.
  function build(topic, idea, lesson, o) {
    o = o || {};
    var spec = lesson && lesson.interactive;
    if (!spec) return Promise.resolve(null);
    var status = function (t) { if (o.onStatus) try { o.onStatus(t); } catch (e) { console.error(e); } };
    var attempts = 0, html = '';
    function ask(text, label) {
      var priority = typeof o.priority === 'function' ? o.priority() : o.priority;
      return U.ask(text, { tier: 'complex', label: label, signal: o.signal, priority: priority, key: o.key });
    }
    // One line per attempt, never the same line twice: the first build is written, then tested
    // (at 340, 720 and 1040 px); each repair is one line that covers fixing and testing again.
    function check(reply) {
      attempts++;
      html = extract(reply);
      if (attempts === 1) status('Testing it at phone, tablet and laptop sizes…');
      return testBody(html, lesson);
    }
    function result(report) {
      return { html: html, title: str(spec.title) || str(idea && idea.title) || 'Interactive', brief: str(spec.brief), selftest: report, attempts: attempts };
    }
    function next(report) {
      U.emit('interactive-test', { idea: idea && idea.id, attempt: attempts, ok: report.ok, problems: report.ok ? [] : problems(report, lesson).slice(0, 6) });
      if (report.ok) return result(report);
      if (attempts < MAX_ATTEMPTS) {
        // No-break spaces keep "(try 2 of 3)" whole when a narrow screen wraps the line.
        status('Fixing what the test found (try\u00a0' + (attempts + 1) + '\u00a0of\u00a0' + MAX_ATTEMPTS + ')…');
        return ask(repairPrompt(topic, idea, lesson, html, report), 'repair-interactive').then(check).then(next);
      }
      return salvage(report);
    }
    // Out of repairs, a page that passes its own self-test is still kept: unlisted web addresses
    // are stripped (and the page tested again), and unreachable target checks are reported.
    function salvage(report) {
      if (!report.passed) return null;
      var again = report.foreign.length ? testBody(html = stripUrls(html, report.foreign), lesson) : Promise.resolve(report);
      return again.then(function (r) {
        if (!r.passed || r.foreign.length) return null;
        r.ok = true;
        var out = result(r);
        if (r.unreachable.length) out.unreachable = r.unreachable.map(function (x) { return x.id; });
        return out;
      });
    }
    status('Building the interactive…');
    return ask(prompt(topic, idea, lesson, { avoid: o.avoid }), 'build-interactive').then(check).then(next);
  }

  return {
    prompt: prompt, repairPrompt: repairPrompt, extract: extract, build: build, problems: problems,
    exampleFor: exampleFor, requiredIds: requiredIds, foreignUrls: foreignUrls, stripUrls: stripUrls, unreachable: unreachable,
  };
})();
