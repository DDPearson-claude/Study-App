// Interactive builder: asks Claude to write one kit body for an idea (TASK: build-interactive),
// pulls the HTML out of the reply, self-tests it in hidden sandboxes (32-sandbox.js) and asks for
// up to two repairs (TASK: repair-interactive) with the failing report. Contract:
// docs/ARCHITECTURE.md section 9. The prompt builders are pure (no DOM at load or call), so
// tools/eval/prompts.mjs can run them in Node.
U.KIT_MD = "@@KIT_MD@@";
U.KIT_EXAMPLES = "@@KIT_EXAMPLES@@";   // [{name, kind, body}] from app/kit/examples

U.interactive = (function () {
  // Which exemplar anchors which kind of idea (exact kind first, then its nearest cousin).
  var COUSIN = { quantity: 'quantity', concept: 'quantity', mechanism: 'mechanism', skill: 'mechanism', process: 'process', history: 'process', structure: 'process' };
  var LEVEL = { new: 'new to this topic', some: 'knows a little about this topic', solid: 'already fairly solid on this topic' };
  var MAX_ATTEMPTS = 3; // the first build plus two repairs

  function str(v) { return v == null ? '' : String(v).trim(); }
  function clip(v, n) { v = str(v); return v.length > n ? v.slice(0, n - 1) + '…' : v; }
  function examples() { return Array.isArray(U.KIT_EXAMPLES) ? U.KIT_EXAMPLES : []; }
  function kitMd() { return typeof U.KIT_MD === 'string' && U.KIT_MD.indexOf('@@') !== 0 ? U.KIT_MD : '(kit reference missing from this build)'; }
  function exampleFor(kind) {
    var list = examples(), want = COUSIN[kind] || 'quantity';
    return list.filter(function (e) { return e.kind === kind; })[0] || list.filter(function (e) { return e.kind === want; })[0] || list[0] || null;
  }

  // Ids a lesson's own checks rely on: 'target' checks set a control and read an output.
  function requiredIds(lesson) {
    var out = { controls: [], outputs: [] };
    ((lesson && lesson.checks) || []).forEach(function (c) {
      if (!c || c.type !== 'target') return;
      if (c.control && out.controls.indexOf(c.control) < 0) out.controls.push(String(c.control));
      if (c.output && out.outputs.indexOf(c.output) < 0) out.outputs.push(String(c.output));
    });
    return out;
  }

  // ---------- prompt sections ----------
  function ideaSection(topic, idea) {
    topic = topic || {}; idea = idea || {};
    return [
      '## The idea',
      'Topic: ' + str(topic.title || topic.query),
      'Idea: ' + str(idea.title) + (idea.oneLine ? ' (' + str(idea.oneLine) + ')' : ''),
      'Kind: ' + (str(idea.kind) || 'concept'),
      'Dan is ' + (LEVEL[topic.level] || LEVEL.new) + '.',
    ].join('\n');
  }
  function controlLine(c) {
    var unit = c.unit ? (/^[%°:×]/.test(str(c.unit)) ? '' : ' ') + str(c.unit) : '';
    return '- id "' + str(c.id) + '": ' + str(c.label) + ', from ' + c.min + ' to ' + c.max + (c.step != null ? ' in steps of ' + c.step : '') +
      ', starting at ' + c.value + unit;
  }
  function numberLine(n) {
    return '- ' + str(n.label) + ': ' + str(n.value) + ' (' + (str(n.kind) || 'number') + (n.source != null ? ', source [' + n.source + ']' : '') + ')';
  }
  function briefSection(lesson) {
    var spec = (lesson && lesson.interactive) || {}, out = ['## What the interactive must show'];
    if (spec.brief) out.push('Brief: ' + str(spec.brief));
    if (spec.title) out.push('Title (the app shows it above the frame, so do not repeat it): ' + str(spec.title));
    if (spec.whatAmILookingAt) out.push('The rule, in plain words: ' + str(spec.whatAmILookingAt));
    if (spec.ignores) out.push('What it leaves out (say so briefly in the caption): ' + str(spec.ignores));
    var controls = (spec.controls || []).filter(function (c) { return c && c.id; });
    if (controls.length) {
      out.push('Controls (use these ids exactly; keep the ranges unless one is clearly wrong):');
      controls.forEach(function (c) { out.push(controlLine(c)); });
    }
    var nums = (spec.numbers || []).filter(function (n) { return n && n.label; });
    if (nums.length) {
      out.push('Numbers it may show (control = Dan sets it, computed = from the rule, constant = cited):');
      nums.forEach(function (n) { out.push(numberLine(n)); });
    }
    var req = requiredIds(lesson);
    ((lesson && lesson.checks) || []).forEach(function (c) {
      if (c && c.type === 'target') {
        out.push('A lesson check asks Dan: "' + clip(c.q, 200) + '" It sets control "' + str(c.control) + '" and reads "' + str(c.output) +
          '" through the kit (target ' + c.target + ', give or take ' + c.tolerance + '). Both ids must exist: "' + str(c.output) +
          '" as a K.readout id or a key of the model\'s outputs.');
      }
    });
    if (!req.controls.length && !req.outputs.length && !controls.length) out.push('No controls were specified: choose the one or two that best show the idea.');
    var pr = lesson && lesson.predict;
    if (pr && pr.q) {
      out.push('Before playing, Dan predicted an answer to: "' + clip(pr.q, 240) + '"' + (pr.options && pr.options.length ? ' (options: ' + pr.options.map(str).join(' / ') + ')' : '') +
        '. Let playing answer it; do not print the answer before he moves anything.');
    }
    return out.join('\n');
  }
  function explainSection(lesson) {
    var t = lesson && lesson.explain && lesson.explain.text;
    if (!t) return '';
    return '## The explanation Dan reads after playing (use the same words for the same things)\n' + clip(U.plain ? U.plain(t) : t, 1400);
  }
  function sourcesSection(lesson) {
    var src = ((lesson && lesson.sources) || []).filter(function (s) { return s && s.url; });
    if (!src.length) {
      return '## Sources\nNo live sources were checked for this lesson. Use only textbook-standard rules and constants you are certain of, ' +
        'and cite the standard reference you would trust (an encyclopedia, a standards body, a university page) in the K.check source.';
    }
    return '## Sources (cite these in K.check sources and the caption; never invent others)\n' + src.map(function (s) {
      return '[' + s.n + '] ' + clip(s.title, 120) + ' (' + str(s.url) + ')' + (s.quote ? ': "' + clip(s.quote, 240) + '"' : '');
    }).join('\n');
  }
  var DAN = [
    '## Dan and how he learns',
    '- He learns best by doing: something visual he can push and watch respond (graphs, diagrams, simulations). Warm, plain words, first principles; no jargon unless explained.',
    '- He uses an Android phone (this frame is about 340 px wide there, touch only) and a desktop. Design for the phone first.',
    '- Calm: generous space, one idea, colour only for meaning (navy = the main thing and the controls, teal = small labels, red = warnings or mistakes, green = done, amber = a highlighted key term). Light and dark mode both work if you use the kit\'s colour variables.',
    '- Accuracy he can trust: every number is a control, computed from the rule on screen, or a constant whose source the caption names. Say plainly what is simplified.',
  ].join('\n');
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
      kitSection(),
    ];
    if (ex) {
      parts.push('## A finished example (kind: ' + ex.kind + '). Match its standard and structure, not its topic\n' + ex.body.trim());
    }
    if (o.avoid) {
      parts.push('## Make it different\nA previous interactive for this idea did this: "' + clip(o.avoid, 400) + '". Dan has already seen it. ' +
        'Build a clearly different one: a different picture, or a different thing to push and watch.');
    }
    parts.push(outputSection(false));
    return parts.filter(Boolean).join('\n\n');
  }

  // The failing report as plain lines a repair can act on (also used for the build loop's checks).
  function problems(report, lesson) {
    var out = [];
    if (!report) return ['The self-test did not run.'];
    (report.errors || []).forEach(function (e) { out.push('Error: ' + e); });
    (report.checks || []).forEach(function (c) { if (!c.ok) out.push('Check failed: "' + c.label + '"' + (c.error ? ' (' + c.error + ')' : '')); });
    ((report.sweep && report.sweep.problems) || []).forEach(function (p) { out.push('While sweeping the controls: ' + p); });
    if (report.overflow) out.push('Too wide: ' + (report.overflowDetail || 'the page scrolls sideways at 340 px') + '.');
    return out.concat(missingIds(report, lesson));
  }
  // Ids the lesson's checks need that the tested page lacks, as repair lines.
  function missingIds(report, lesson) {
    var req = requiredIds(lesson), out = [];
    var controls = (report && report.controls) || [], outs = ((report && report.readouts) || []).concat((report && report.outputs) || []);
    req.controls.forEach(function (id) { if (controls.indexOf(id) < 0) out.push('Missing control id "' + id + '": a lesson check sets it, so a K.control (or choice/toggle) must use exactly this id.'); });
    req.outputs.forEach(function (id) { if (outs.indexOf(id) < 0) out.push('Missing output "' + id + '": a lesson check reads it, so a K.readout id or a model output key must be exactly this.'); });
    return out;
  }
  function advice(report) { return ((report && report.warnings) || []).map(function (w) { return 'Advice: ' + w; }); }

  // TASK: repair-interactive
  function repairPrompt(topic, idea, lesson, html, report) {
    var found = problems(report, lesson).concat(advice(report));
    return [
      'TASK: repair-interactive',
      'The interactive below, written for Dan\'s learning app, failed its automatic self-test. Fix every problem listed and return the complete corrected body. Keep what already works.',
      ideaSection(topic, idea),
      briefSection(lesson),
      '## What the self-test found (at 340 px and 720 px wide)\n' + (found.length ? found.map(function (p) { return '- ' + p; }).join('\n') : '- It did not pass, but reported no details. Check that K.ready() is called once at the end.'),
      '## How to fix the usual problems\n' + [
        '- A thrown error: go to the body line it names; check element ids, variable names and the kit call signatures.',
        '- NaN or Infinity: guard the maths at the ends of every control\'s range (division by zero, log of 0, square root of a negative), or start the range where the rule makes sense.',
        '- Too wide at 340 px: let rows wrap (flex-wrap), use width:100% and max-width:100%, give SVG a viewBox with width 100%, no fixed widths over 300 px, shorter labels.',
        '- A failing check: work the expected value out again, by hand and from the source. Fix whichever is wrong, the model or the check. Never delete or weaken a correct check to pass.',
        '- Slow updates: sample curves less densely and do not rebuild large parts of the page on every change.',
        '- Missing ids: rename to exactly the ids listed.',
      ].join('\n'),
      sourcesSection(lesson),
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

  // Test one body and fold in the lesson's own requirements (ids its checks depend on).
  function testBody(html, lesson) {
    if (!html) return Promise.resolve({ ok: false, errors: ['The reply contained no HTML.'], overflow: false, checks: [], sweep: { ok: false, problems: [] }, controls: [], readouts: [], outputs: [], warnings: [] });
    return U.sandbox.test(html, { widths: [340, 720] }).then(function (r) {
      var missing = missingIds(r, lesson);
      if (missing.length) { r.ok = false; r.missing = missing; }
      return r;
    });
  }

  // build(topic, idea, lesson, {onStatus, avoid, signal})
  //   -> Promise<{html, title, brief, selftest, attempts} | null>
  // Resolves null when the lesson has no interactive brief or every attempt failed its self-test;
  // rejects only when Claude can't be reached ({code, message} from U.ask).
  function build(topic, idea, lesson, o) {
    o = o || {};
    var spec = lesson && lesson.interactive;
    if (!spec) return Promise.resolve(null);
    var status = function (t) { if (o.onStatus) try { o.onStatus(t); } catch (e) { console.error(e); } };
    var attempts = 0, html = '';
    function ask(text, label) { return U.ask(text, { tier: 'complex', label: label, signal: o.signal }); }
    function check(reply) {
      attempts++;
      html = extract(reply);
      status(attempts === 1 ? 'Testing it on a phone-sized screen…' : 'Testing the fix…');
      return testBody(html, lesson);
    }
    function next(report) {
      U.emit('interactive-test', { idea: idea && idea.id, attempt: attempts, ok: report.ok, problems: report.ok ? [] : problems(report, lesson).slice(0, 6) });
      if (report.ok) {
        return { html: html, title: str(spec.title) || str(idea && idea.title) || 'Interactive', brief: str(spec.brief), selftest: report, attempts: attempts };
      }
      if (attempts >= MAX_ATTEMPTS) return null;
      status('Fixing something the test found…');
      return ask(repairPrompt(topic, idea, lesson, html, report), 'repair-interactive').then(check).then(next);
    }
    status('Building the interactive…');
    return ask(prompt(topic, idea, lesson, { avoid: o.avoid }), 'build-interactive').then(check).then(next);
  }

  return { prompt: prompt, repairPrompt: repairPrompt, extract: extract, build: build, problems: problems, exampleFor: exampleFor, requiredIds: requiredIds };
})();
