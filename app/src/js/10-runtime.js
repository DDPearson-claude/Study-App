// Runtime capabilities: db, user, sample, mcp, downloads, permissions.
// Everything degrades gracefully: a missing capability resolves null and features hide.
U.rt = { db: null, user: null, sample: null, mcp: null, downloads: null, permissions: null, uid: null, inViewer: false,
  TIMEOUT_MS: 10000, DATA_WAIT_MS: 30000, NULL_SLOW_MS: 5000, AGAIN_MAX_MS: 30000, late: [] };
U.rt.has = function (name) { return !!U.rt[name]; };
// Dan's saved work (db, user or user.id()) is still on its way: what the app shows may be
// missing his topics and progress, which arrive with U.emit('rt-late', name).
U.rt.savedLate = function () { return U.rt.late.some(function (n) { return n === 'db' || n === 'user' || n === 'uid'; }); };
// Boot waits for each capability, but not for ever. Most get 10 s: a feature that is slow to
// arrive can light up later. Dan's saved work is different: db and user (and user.id()) decide
// where everything is read and written, and opening without them shows an empty app and keeps
// nothing he does, so those get up to 30 s (boot says plainly that they are slow). Whatever
// answers after its wait is still taken up when it comes: its name sits in U.rt.late until then,
// and U.emit('rt-late', name) follows (boot then reloads the screen from the saved work).
//
// A null for db or user inside the viewer is not believed at once either. Framed by a host that
// does not answer, use() resolves null after 10 s (claude.d.ts), and a null has no stable promise
// identity, so use() can be asked again: it is, after 1, 2, 4, 8… s (at most 30 s apart), within
// the 30 s wait and then quietly for as long as the page is open, and the name waits in
// U.rt.late meanwhile (boot says the saved work is still loading, never "open this in the Claude
// app"). Inside the viewer means framed, or the null took 5 s or more to come (only a host that
// did not answer is that slow). A quick null on a page of its own (served by the platform at its
// own address, where every use() is null) is the answer: there is no saved work to wait for.
U.rt.ready = (function () {
  var claude = window.claude;
  if (!claude || typeof claude.use !== 'function') return Promise.resolve(U.rt);
  U.rt.inViewer = true;
  var framed = false;
  try { framed = !!window.parent && window.parent !== window; } catch (e) { framed = true; }
  var deadline = Date.now() + U.rt.DATA_WAIT_MS;
  function drop(name) { U.rt.late = U.rt.late.filter(function (n) { return n !== name; }); }
  // call() -> a value (null when it fails); take(value, late) stores it. Resolves once the value
  // is in, or after ms with name added to U.rt.late. again(took ms, n) -> ms before asking again
  // after the nth null, or -1 to take the null as the answer.
  function wait(name, call, ms, take, again) {
    return new Promise(function (resolve) {
      var late = false, nulls = 0;
      var timer = setTimeout(function () { late = true; U.rt.late.push(name); resolve(); }, Math.max(0, ms));
      (function ask() {
        var asked = Date.now();
        Promise.resolve().then(call).catch(function () { return null; }).then(function (v) {
          var delay = v == null && again ? again(Date.now() - asked, nulls++) : -1;
          if (delay >= 0) { setTimeout(ask, delay); return; }
          if (!late) { clearTimeout(timer); take(v, false); resolve(); return; }
          take(v, true);
          drop(name);
          U.emit('rt-late', name);
        });
      })();
    });
  }
  function again(took, n) {
    if (!n && !framed && took < U.rt.NULL_SLOW_MS) return -1;
    return Math.min(U.rt.AGAIN_MAX_MS, 1000 * Math.pow(2, Math.min(n, 5)));
  }
  // The user's id, asked once the user capability is here. Without one, private data falls back
  // to the in-memory store and boot shows the "keep your progress" notice.
  function askId(user, ms) {
    if (!user || typeof user.id !== 'function') return Promise.resolve();
    return wait('uid', function () { return user.id(); }, ms, function (id) { U.rt.uid = id || null; });
  }
  function use(name) {
    var saved = name === 'db' || name === 'user';
    return wait(name, function () { return claude.use(name); }, saved ? Math.max(0, deadline - Date.now()) : U.rt.TIMEOUT_MS, function (ns, late) {
      U.rt[name] = ns || null;
      // A user capability that came after boot: its id is still needed (the app is open by now,
      // so it is waited for without a limit). 'uid' joins U.rt.late before 'user' leaves it.
      if (late && name === 'user' && ns && typeof ns.id === 'function') {
        U.rt.late.push('uid');
        Promise.resolve().then(function () { return ns.id(); }).catch(function () { return null; }).then(function (id) {
          U.rt.uid = id || null;
          drop('uid');
          U.emit('rt-late', 'uid');
        });
      }
    }, saved ? again : null);
  }
  var user = use('user').then(function () { return askId(U.rt.user, Math.max(3000, deadline - Date.now())); });
  return Promise.all([use('db'), user, use('sample'), use('mcp'), use('downloads'), use('permissions')]).then(function () { return U.rt; });
})();

// Can this view run page tools (web search for research and Ask Claude)? sample.limits() has a
// `tools` member only where it can; elsewhere a call with tools rejects tools_unavailable
// (sample.d.ts). A limits() that fails counts as no; a runtime without limits() is given the
// benefit of the doubt, and the first tools_unavailable (see U.ask) settles it for the visit.
U.rt._tools = null;
U.rt.toolsOk = function () {
  var sample = U.rt.sample;
  if (!sample) return Promise.resolve(false);
  if (!U.rt._tools) {
    U.rt._tools = typeof sample.limits !== 'function' ? Promise.resolve(true)
      : Promise.resolve().then(function () { return sample.limits(); }).then(function (l) { return !!(l && l.tools); }, function () { return false; });
  }
  return U.rt._tools;
};

// ---------- asking Claude ----------
U.TIERS = { quick: 'quick', default: 'default', complex: 'complex' };

// Pull the JSON answer out of a reply, tolerating fences and stray prose. With tools, a reply is
// the text of every round (sample.d.ts), so narration comes first and the answer last, and the
// narration can hold brackets of its own ("…at new and full moon [1]", "{objective: …}"). So the
// answer is the last complete JSON object in the text (an array only when there is no object):
// each '{' or '[' is tried in turn, and a value that parses is stepped over whole. A value inside
// a bigger bracketed span that would not parse is a piece of a broken reply, never the answer;
// and a bigger span after the answer that would not parse means the answer itself was broken.
// Without a schema that is the best guess there is; U.ask, which has one, picks among
// U.parseJson.candidates instead (U.parseJson.pick).
U.parseJson = function (text) {
  var c = U.parseJson.candidates(text);
  if (c.whole) return c.list[0].v;
  var obj = null, arr = null;
  c.list.forEach(function (x) { if (x.array) arr = x; else obj = x; });
  var best = obj || arr;
  if (best && !c.broken.some(function (b) { return b[0] > best.to && b[1] - b[0] > best.to - best.at; })) return best.v;
  throw U.parseJson.unread(c);
};
U.parseJson.unread = function (c) {
  return c.tried ? { code: 'bad_json', message: 'Claude replied with JSON that could not be read.' } : { code: 'bad_json', message: 'Claude did not reply with JSON.' };
};
// Every complete JSON value at the top level of the text, in order -> {list:[{v, at, to, array}],
// broken:[[from, to]], tried, whole}. whole: the text (fences aside) is one JSON value.
// Pieces of a broken reply are left out of list: a value inside a bracketed span that closes but
// will not parse ('{"a":[1],}'), and a member of a value that never closes, i.e. a value that
// follows ':' or ',' where the text since that unclosed bracket still reads as JSON
// ('{"sources":[…],"ideas":{"i1":…}' with its last '}' missing). Such spans are listed in broken.
// An unclosed bracket in narration ("I will use {objective here") reads as no JSON, so the
// answer after it still counts.
U.parseJson.candidates = function (text) {
  var t = String(text || '').trim().replace(/^```(?:json|JSON)?\s*/, '').replace(/```\s*$/, '').trim();
  try { return { list: [{ v: JSON.parse(t), at: 0, to: t.length - 1, array: t[0] === '[' }], broken: [], tried: true, whole: true }; } catch (e) {}
  // Where the bracketed value starting at t[start] closes, or -1.
  function end(start) {
    var open = t[start], close = open === '{' ? '}' : ']', depth = 0, inStr = false, esc = false;
    for (var i = start; i < t.length; i++) {
      var ch = t[i];
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === open) depth++;
      else if (ch === close && --depth === 0) return i;
    }
    return -1;
  }
  // Does the value starting at `at` follow ':' or ',' (a member's place)?
  function placed(at) {
    var k = at - 1;
    while (k >= 0 && /\s/.test(t[k])) k--;
    return t[k] === ':' || t[k] === ',';
  }
  // Is the value starting at `at` (placed) a member of the unclosed value starting at `from`? The
  // text between reads as JSON so far: it parses once a value and the missing brackets are added.
  function member(from, at) {
    var p = t.slice(from, at).replace(/\s+$/, '');
    var stack = [], inStr = false, esc = false;
    for (var i = 0; i < p.length; i++) {
      var ch = p[i];
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === '{' || ch === '[') stack.push(ch === '{' ? '}' : ']');
      else if (ch === '}' || ch === ']') { if (stack.pop() !== ch) return false; }
    }
    if (inStr || !stack.length) return false;
    try { JSON.parse(p + ' 0' + stack.reverse().join('')); return true; } catch (e) { return false; }
  }
  var list = [], tried = false, broken = [], open = [];
  for (var i = 0; i < t.length; i++) {
    var ch = t[i];
    if (ch !== '{' && ch !== '[') continue;
    tried = true;
    var j = end(i), v;
    if (j < 0) { open.push({ at: i, piece: false }); continue; }
    try { v = JSON.parse(t.slice(i, j + 1)); } catch (e) { broken.push([i, j]); continue; }
    var at = i, piece = broken.some(function (b) { return b[0] < at && j < b[1]; });
    if (open.length && placed(at)) open.forEach(function (o) { if (member(o.at, at)) piece = o.piece = true; });
    if (!piece) list.push({ v: v, at: i, to: j, array: ch === '[' });
    i = j;
  }
  open.forEach(function (o) { if (o.piece) broken.push([o.at, t.length - 1]); });
  return { list: list, broken: broken, tried: tried, whole: false };
};
// The answer that fits: the last candidate whose schema(value) has no problems -> {value}; else
// {problems}: the problems of the biggest candidate, unless a span that will not parse is bigger
// still (the answer itself is what broke) or there is no candidate at all: then bad_json's own words.
U.parseJson.pick = function (text, schema) {
  var c = U.parseJson.candidates(text), biggest = null, longOnly = null;
  for (var k = c.list.length - 1; k >= 0; k--) {
    // A validator that trips over a value of the wrong shape (narration's "[1]") just rejects it.
    var x = c.list[k], problems;
    try { problems = schema ? schema(x.v) || [] : []; } catch (e) { problems = [(e && e.message) || 'Reply did not have the right shape.']; }
    if (!problems.length) return { value: x.v };
    // Only soft (length) problems: the answer, just too long in places; U.ask decides on it.
    var soft = Array.isArray(problems.soft) ? problems.soft : [];
    if (!longOnly && problems.every(function (p) { return soft.indexOf(p) >= 0; })) longOnly = { value: x.v, problems: problems };
    if (!biggest || x.to - x.at > biggest.to - biggest.at) biggest = { at: x.at, to: x.to, value: x.v, problems: problems };
  }
  if (longOnly) return longOnly;
  var worse = biggest && c.broken.some(function (b) { return b[1] - b[0] > biggest.to - biggest.at; });
  return biggest && !worse ? { value: biggest.value, problems: biggest.problems } : { problems: [U.parseJson.unread(c).message] };
};

// ---------- priority gate ----------
// Foreground calls (what Dan is waiting for: planning, the lesson on screen, grading, the tutor)
// go straight to Claude. Background calls (prefetching the next lesson, research) run one at a
// time, and only while no foreground call is in flight, so the lesson he is on never queues
// behind work he only glanced at. A background call still waiting is dropped when its signal
// aborts (rejects {code:'cancelled'}); one that has started is cancelled through sample's signal.
// A queued background call becomes foreground (it runs at once) when:
//   - a foreground call with the same opts.key arrives (callers that share a key: one lesson's job), or
//   - U._gate.promote(test) finds it: test(input, opts) -> true (the lesson screen promotes the
//     prefetch of the lesson Dan just opened).
U._gate = { fg: 0, bg: 0, queue: [] };
U._gate.enter = function (opts, input) {
  var G = U._gate;
  function cancelled() { return { code: 'cancelled', message: 'Stopped.' }; }
  function fgRelease() { var done = false; return function () { if (!done) { done = true; G.fg--; G.pump(); } }; }
  if (opts.priority !== 'background') {
    if (opts.key) G.promote(function (inp, o) { return o.key === opts.key; });
    G.fg++;
    return Promise.resolve(fgRelease());
  }
  return new Promise(function (resolve, reject) {
    var sig = opts.signal;
    if (sig && sig.aborted) return reject(cancelled());
    var w = { resolve: resolve, opts: opts, input: input, fgRelease: fgRelease };
    if (sig && sig.addEventListener) sig.addEventListener('abort', function () {
      var i = G.queue.indexOf(w);
      if (i >= 0) { G.queue.splice(i, 1); reject(cancelled()); }
    });
    G.queue.push(w);
    G.pump();
  });
};
U._gate.pump = function () {
  var G = U._gate;
  while (G.bg === 0 && G.fg === 0 && G.queue.length) {
    var w = G.queue.shift(), done = false;
    G.bg++;
    w.resolve(function () { if (!done) { done = true; G.bg--; G.pump(); } });
  }
};
U._gate.promote = function (test) {
  var G = U._gate, n = 0;
  G.queue.slice().forEach(function (w) {
    var hit = false;
    try { hit = !!test(w.input, w.opts); } catch (e) { hit = false; }
    if (!hit) return;
    G.queue.splice(G.queue.indexOf(w), 1);
    G.fg++; n++;
    w.resolve(w.fgRelease());
  });
  return n;
};

// U.ask(input, {tier, onText, signal, tools, json, schema, cache, label, priority, key})
//   json:true  -> resolves the parsed object
//   schema(fn) -> returns [] or a list of problems; one corrective retry with the problems listed.
//              The list may name some of its problems as soft (problems.soft: length limits, see
//              30-prompts.js). Soft problems get the repair too, but a reply whose only problems
//              left after it are soft is accepted as it is (a console warning and
//              U.emit('ask-soft', {label, problems}), nothing Dan sees). If the repair breaks
//              something a soft-only first reply had right, the first reply is kept.
//   priority   'foreground' (default) | 'background'; key: see the gate above
// A transient 'upstream_error' or 'unavailable' is retried once after 1-3 s. 'rate_limited' is
// never retried from here (retrying a rate limit only makes it last longer): it reaches the caller.
U.ask = function (input, opts) {
  opts = opts || {};
  var sample = U.rt.sample;
  if (!sample) return Promise.reject({ code: 'not_granted', message: 'Claude is not available in this view.' });
  var o = { modelTier: opts.tier || 'default', cache: opts.cache === true };
  if (opts.onText) o.onText = opts.onText;
  if (opts.signal) o.signal = opts.signal;
  // sample gets a plain copy of the tool list (a list from U.research.tools also carries reset()).
  if (opts.tools && opts.tools.length) o.tools = Array.prototype.slice.call(opts.tools);
  if (opts.images) o.images = opts.images;
  var started = Date.now();
  function once(inp, attempt) {
    return U._gate.enter(opts, inp).then(function (release) {
      // Each call to Claude is a fresh, memory-less start, so its tools start with their whole
      // budget: a retry must not inherit the searches (or failures) the first attempt used up.
      if (o.tools && typeof opts.tools.reset === 'function') opts.tools.reset();
      return Promise.resolve().then(function () { return sample(inp, o); }).then(function (r) {
        release();
        U.emit('ask', { label: opts.label, tier: o.modelTier, ms: Date.now() - started, chars: (r.text || '').length, truncated: !!r.truncated });
        if (r.truncated && opts.json) throw { code: 'truncated', message: 'Claude\'s answer was cut off.', text: r.text };
        return r.text || '';
      }, function (e) {
        release();
        // This view cannot run page tools after all (U.rt.toolsOk says so from now on); the caller
        // decides how to go on without them.
        if (e && e.code === 'tools_unavailable') U.rt._tools = Promise.resolve(false);
        if (e && (e.code === 'upstream_error' || e.code === 'unavailable') && attempt < 1 && !(opts.signal && opts.signal.aborted)) {
          return U.sleep(1000 + Math.random() * 2000).then(function () { return once(inp, attempt + 1); });
        }
        throw e;
      });
    });
  }
  if (!opts.json) return once(input, 0);
  // Problems the schema did not mark soft (a parse error is never soft).
  function hardOf(problems) {
    var soft = Array.isArray(problems.soft) ? problems.soft : [];
    return problems.filter(function (p) { return soft.indexOf(p) < 0; });
  }
  function lenient(data, problems) {
    console.warn('ask' + (opts.label ? ' ' + opts.label : '') + ': accepted with only length problems left', problems.slice(0, 6));
    U.emit('ask-soft', { label: opts.label, problems: problems.slice(0, 12) });
    return data;
  }
  // The reply's answer is the last JSON value in it that fits the schema: narration from tool
  // rounds can hold objects of its own, before the answer or after it ("I used {…}"). When none
  // fits, the corrective turn names the problems of the best one (U.parseJson.pick), or says the
  // JSON could not be read when that is what went wrong.
  // first: the first reply, when its only problems were soft (kept if the repair is worse).
  function check(text, tries, first) {
    var data, problems;
    if (opts.schema) {
      var got = U.parseJson.pick(text, opts.schema);
      data = got.value; problems = got.problems || [];
    } else {
      try { data = U.parseJson(text); problems = []; } catch (e) { problems = [e.message || 'Reply was not valid JSON.']; }
    }
    if (!problems.length) return data;
    var hard = hardOf(problems);
    if (tries >= 1) {
      if (!hard.length) return lenient(data, problems);
      if (first) return lenient(first.data, first.problems);
      throw { code: 'invalid', message: 'Claude\'s reply did not pass the app\'s checks: ' + hard.slice(0, 3).join('; ') };
    }
    var fix = [
      typeof input === 'string' ? { role: 'user', content: input } : null,
      { role: 'assistant', content: String(text).slice(0, 60000) },
      // Hard problems first, so a cut-down list never leaves out the ones that must be fixed.
      { role: 'user', content: 'Your reply had these problems:\n- ' + hard.concat(problems.filter(function (p) { return hard.indexOf(p) < 0; })).slice(0, 12).join('\n- ') + '\nReply again with the complete corrected JSON only, no commentary.' },
    ];
    var turns = typeof input === 'string' ? fix.filter(Boolean) : input.concat(fix.slice(1));
    var keep = hard.length ? null : { data: data, problems: problems };
    return once(turns, 0).then(function (t2) { return check(t2, tries + 1, keep); }, function (e) {
      // The repair could not be had (busy, cut off): a first reply that was only too long stands.
      if (keep && !(e && e.code === 'cancelled') && !(opts.signal && opts.signal.aborted)) return lenient(keep.data, keep.problems);
      throw e;
    });
  }
  return once(input, 0).then(function (t) { return check(t, 0); }, function (e) {
    // A truncated JSON reply gets one more go with a reminder to be concise.
    if (e && e.code === 'truncated') {
      var turns = [{ role: 'user', content: typeof input === 'string' ? input : JSON.stringify(input) + '' }];
      if (typeof input !== 'string') turns = input.slice();
      turns.push({ role: 'assistant', content: String(e.text || '').slice(0, 4000) });
      turns.push({ role: 'user', content: 'That reply was cut off. Reply again with the complete JSON, keeping every text field shorter.' });
      return once(turns, 0).then(function (t) { return check(t, 1); });
    }
    throw e;
  });
};

// ---------- live research (Parallel Search connector) ----------
U.research = {
  SERVER: 'Parallel Search',
  // One stable id per page load, sent with every search and fetch (the connector uses it for
  // free-tier rate limiting): 'mu-' + 32 hex characters.
  SESSION: (function () {
    var hex = '';
    try {
      var b = new Uint8Array(16);
      (window.crypto || window.msCrypto).getRandomValues(b);
      for (var i = 0; i < b.length; i++) hex += (b[i] < 16 ? '0' : '') + b[i].toString(16);
    } catch (e) { hex = ''; }
    while (hex.length < 32) hex += Math.floor(Math.random() * 16).toString(16);
    return 'mu-' + hex.slice(0, 32);
  })(),
  _avail: null,
  _schemas: null,
  available: function () {
    if (U.research._avail) return U.research._avail;
    var mcp = U.rt.mcp;
    if (!mcp) return Promise.resolve(false);
    U.research._avail = mcp.listTools(U.research.SERVER).then(function (r) {
      var sv = (r && r.servers || [])[0];
      var names = sv && sv.tools ? sv.tools.map(function (t) { return t.name; }) : [];
      return names.indexOf('web_search') >= 0 && sv.authStatus !== 'needs_reauth';
    }, function () { return false; });
    return U.research._avail;
  },
  reset: function () { U.research._avail = null; U.research._schemas = null; },
  _loadSchemas: function () {
    if (U.research._schemas) return U.research._schemas;
    var mcp = U.rt.mcp, S = U.research.SERVER;
    var perm = U.rt.permissions ? Promise.resolve(U.rt.permissions.request(['mcp:' + S])).catch(function () {}) : Promise.resolve();
    U.research._schemas = perm.then(function () {
      return Promise.all(['web_search', 'web_fetch'].map(function (t) {
        return mcp.describeTool(S, t).then(function (d) { return d && d.inputSchema || null; }, function () { return null; });
      }));
    }).then(function (s) { return { web_search: s[0], web_fetch: s[1] }; });
    return U.research._schemas;
  },
  _trim: function (payload, max) {
    var s = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return s.length > max ? s.slice(0, max) + ' …[trimmed]' : s;
  },
  // Excerpts arrive as markdown: links ("[gases](https://…)") and emphasis become plain text, so
  // Claude quotes clean words, the quote check compares like with like, and a link inside a
  // page's text never passes for a page the tools returned.
  _plain: function (t) {
    return String(t)
      .replace(/!?\[([^\]\n]*)\]\((?:[^()\s]|\([^()\s]*\))*\)/g, '$1')
      .replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/__([^_\n]+)__/g, '$1');
  },
  _clean: function (p) {
    if (!p || typeof p !== 'object' || !Array.isArray(p.results)) return p;
    return Object.assign({}, p, { results: p.results.map(function (r) {
      if (!r || typeof r !== 'object') return r;
      var o = Object.assign({}, r);
      if (typeof o.title === 'string') o.title = o.title.replace(/\s+/g, ' ').replace(/^\[(PDF|DOCX?|PPTX?|XLSX?)\]\s*/i, '').trim();
      if (Array.isArray(o.excerpts)) o.excerpts = o.excerpts.map(function (e) { return typeof e === 'string' ? U.research._plain(e) : e; });
      if (typeof o.full_content === 'string') o.full_content = U.research._plain(o.full_content);
      return o;
    }) });
  },
  // A result as JSON of at most max characters that stays valid JSON. Results come ranked, best
  // first, so the top ones are kept whole: the lowest-ranked result's text is shortened first
  // (to 1,200 characters, then 500, then 200, cut at a word and marked " …"), working up the
  // list; the top three are shortened only after every result below them is down to 200 (and
  // then to 2,400, 1,200, 500, 200); only then are the last results dropped.
  _fit: function (p, max) {
    var s = typeof p === 'string' ? p : JSON.stringify(p);
    if (s.length <= max) return s;
    if (!p || typeof p !== 'object' || !Array.isArray(p.results)) return U.research._trim(s, max);
    p = JSON.parse(s);
    function cut(t, n) {
      if (t.length <= n) return t;
      var c = t.slice(0, Math.max(0, n - 2)), sp = c.lastIndexOf(' ');
      return (sp > n * 0.6 ? c.slice(0, sp) : c) + ' …';
    }
    // Keeps at most n characters of a result's text, its excerpts in order, then its page text.
    function shrink(r, n) {
      if (!r || typeof r !== 'object') return;
      var left = n;
      if (Array.isArray(r.excerpts)) {
        r.excerpts = r.excerpts.reduce(function (out, e) {
          if (typeof e !== 'string') return out;
          if (left > 40) { var k = cut(e, left); out.push(k); left -= k.length; }
          return out;
        }, []);
      }
      if (typeof r.full_content === 'string') r.full_content = left > 40 ? cut(r.full_content, left) : '';
    }
    // Results below the top three give way first, all the way down; the top three only after.
    [[3, 1200], [3, 500], [3, 200], [0, 2400], [0, 1200], [0, 500], [0, 200]].forEach(function (pass) {
      for (var i = p.results.length - 1; i >= pass[0] && s.length > max; i--) { shrink(p.results[i], pass[1]); s = JSON.stringify(p); }
    });
    while (s.length > max && p.results.length > 1) { p.results.pop(); s = JSON.stringify(p); }
    return s.length > max ? U.research._trim(s, max) : s;
  },
  call: function (tool, input) {
    var mcp = U.rt.mcp;
    return Promise.resolve().then(function () { return mcp.callTool(U.research.SERVER, tool, input); }).then(function (r) {
      var p = r && r.payload !== undefined ? r.payload : r;
      // A connector failure can come back as text instead of a rejection.
      if (typeof p === 'string' && /^Error POSTing|"error"\s*:\s*\{\s*"code"\s*:\s*-?\d/.test(p)) throw { code: 'tool_error', message: p };
      return p;
    });
  },
  // Parallel Search's free tier limits bursts of calls.
  _isRate: function (e) { return !!e && (e.code === 'rate_limited' || /rate.?limit|too many requests|\b429\b/i.test(String(e.message || ''))); },
  // call(), waiting out a rate limit before each retry (waits: ms per retry, e.g. [20000, 45000]).
  _call: function (tool, input, waits) {
    return U.research.call(tool, input).catch(function (e) {
      if (!waits || !waits.length || !U.research._isRate(e)) throw e;
      return U.sleep(waits[0]).then(function () { return U.research._call(tool, input, waits.slice(1)); });
    });
  },
  // Normalised form of a web address for comparing (no fragment, no trailing slash, lower-case host).
  _norm: function (u) {
    var m = String(u || '').trim().match(/^(https?):\/\/([^\/?#\s]+)([^#\s]*)/i);
    if (!m) return null;
    return m[1].toLowerCase() + '://' + m[2].toLowerCase() + (m[3] || '').replace(/\/+$/, '');
  },
  // One web address, read the way the connector will read it: the browser's own URL parser, so
  // the address that is checked is the very address that is sent ("…/page)?q=…" or "…\\?q=…" is
  // a different page, and "https://en.wikipedia.org/wiki/Pendulum_(mechanics)" keeps its ")").
  // Only http(s), with no user name or password. The fragment is dropped: it never names another
  // page, and it is text the model chose ("…/pendulum-facts#I%20failed%20this"), so it is neither
  // sent to the connector nor part of what is allowed. -> {href (what is sent), key (_norm, for
  // comparing)} or null.
  _page: function (u) {
    if (typeof u !== 'string' || !u.trim()) return null;
    var x;
    try { x = new URL(u.trim()); } catch (e) { return null; }
    if ((x.protocol !== 'https:' && x.protocol !== 'http:') || x.username || x.password || !x.hostname) return null;
    x.hash = '';
    var key = U.research._norm(x.href);
    return key ? { href: x.href, key: key } : null;
  },
  _urlsIn: function (value, out) {
    out = out || [];
    if (typeof value === 'string') { (value.match(/https?:\/\/[^\s"'<>)\]\\]+/gi) || []).forEach(function (u) { out.push(u); }); }
    else if (value && typeof value === 'object') Object.keys(value).forEach(function (k) { U.research._urlsIn(value[k], out); });
    return out;
  },
  // sample tool definitions; execute() never throws, so Claude can recover from a bad call. Every
  // error it returns starts "Tool error (<code>): " (31-generate.js skips those texts when it
  // records what the tools returned). The real connector's shapes:
  //   web_search {objective, search_queries:[2-3 queries of 3-6 words], session_id?, model_name?}
  //     -> {search_id, results:[{url, title, publish_date, excerpts:[...]}], warnings, session_id}
  //   web_fetch {urls:[up to 20], objective?, search_queries?, full_content?, allow_live_fetch?, session_id?}
  // session_id is filled in (U.research.SESSION) when Claude leaves it out; model_name is never set.
  // opts.allow: extra addresses web_fetch may open (e.g. the lesson's own sources). Otherwise
  // web_fetch only opens pages that web_search returned in this same set of tools, so text
  // planted in a page or a prompt can't send Dan's words to an address of its choosing. Each
  // entry of urls is parsed on its own (_page) and the connector gets only those parsed, allowed
  // addresses, with the other arguments that cannot name a page; one entry not allowed refuses
  // the whole call.
  // opts.budget: most calls of each tool in one call to Claude (default 10 searches, 6 fetches: a
  // little above what the prompts ask for, so only a runaway loop meets it). U.ask calls the
  // list's reset() before each call it makes, so a retry starts with the whole budget. A failed
  // call does not use up the budget; after 4 failures the tools stop calling the connector.
  // opts.patient: wait out a rate limit and retry (background research; never while Dan waits).
  tools: function (log, opts) {
    opts = opts || {};
    var allowed = new Set();
    var budget = Object.assign({ web_search: 10, web_fetch: 6 }, opts.budget || {}), used = { web_search: 0, web_fetch: 0 }, failed = 0;
    var waits = Array.isArray(opts.patient) ? opts.patient : opts.patient ? [20000, 45000] : [];
    function allow(u) { var x = U.research._page(u); if (x) allowed.add(x.key); }
    (opts.allow || []).forEach(allow);
    // web_fetch's input as it goes to the connector: the checked addresses (as parsed), then only
    // arguments that cannot carry an address of their own. -> {input} or {error}.
    function fetchInput(input) {
      var asked = input && typeof input === 'object' && input.urls != null ? [].concat(input.urls) : [];
      var urls = [], refused = [];
      asked.forEach(function (u) {
        var x = U.research._page(u);
        if (x && allowed.has(x.key)) { if (urls.indexOf(x.href) < 0) urls.push(x.href); }
        else refused.push(String(u).slice(0, 120));
      });
      if (!asked.length) return { error: 'Tool error (bad_request): give the full web address of a page from your search results.' };
      if (refused.length) return { error: 'Tool error (refused): only pages returned by web_search in this conversation (or the lesson\'s own sources) can be opened. Not allowed: ' + refused.slice(0, 3).join(', ') + '. Search first, then open a result.' };
      var out = { urls: urls.slice(0, 20) };
      if (typeof input.objective === 'string') out.objective = input.objective;
      if (Array.isArray(input.search_queries)) out.search_queries = input.search_queries.filter(function (q) { return typeof q === 'string'; });
      if (typeof input.full_content === 'boolean') out.full_content = input.full_content;
      if (typeof input.allow_live_fetch === 'boolean') out.allow_live_fetch = input.allow_live_fetch;
      if (typeof input.session_id === 'string') out.session_id = input.session_id;
      return { input: out };
    }
    return U.research._loadSchemas().then(function (sc) {
      function def(name, description, schema, fallback, max) {
        return {
          name: name, description: description,
          inputSchema: schema || fallback,
          execute: function (input) {
            if (log) log({ tool: name, input: input });
            if (used[name] >= budget[name]) return Promise.resolve('Tool error (budget): that is all the ' + (name === 'web_search' ? 'searches' : 'page openings') + ' for this question. Write your answer from what you already have.');
            if (failed >= 4) return Promise.resolve('Tool error (unavailable): the search service is not answering. Write your answer from what you already have.');
            if (name === 'web_fetch') {
              var checked = fetchInput(input);
              if (checked.error) return Promise.resolve(checked.error);
              input = checked.input;
            }
            used[name] = (used[name] || 0) + 1;
            if (input && typeof input === 'object' && !Array.isArray(input) && input.session_id == null) {
              input = Object.assign({}, input, { session_id: U.research.SESSION });
            }
            return U.research._call(name, input, waits).then(function (p) {
              p = U.research._clean(p);
              if (name === 'web_search') {
                (p && Array.isArray(p.results) ? p.results.map(function (r) { return r && r.url; }) : U.research._urlsIn(p)).forEach(allow);
              }
              return U.research._fit(p, max);
            }, function (e) {
              used[name] = Math.max(0, used[name] - 1);
              failed++;
              if (U.research._isRate(e)) return 'Tool error (rate_limited): the search service is busy right now. Do not repeat the call; write your answer from what you already have.';
              return 'Tool error (' + (e && e.code) + '): ' + String(e && e.message || '').slice(0, 300) + '. Check the arguments against the tool schema; try a different call at most once.';
            });
          },
        };
      }
      var list = [
        def('web_search', 'Search the web. Returns ranked results with URLs, titles and excerpts. Use specific queries; prefer encyclopedias, universities, standards bodies, textbooks and government sources.', sc.web_search,
          { type: 'object', properties: {
            objective: { type: 'string', description: 'What you are trying to find out, in a sentence' },
            search_queries: { type: 'array', items: { type: 'string' }, description: '2-3 short keyword queries (3-6 words each)' },
          }, required: ['objective', 'search_queries'] }, 12000),
        def('web_fetch', 'Open one or more web pages and return their text, so you can quote them exactly.', sc.web_fetch,
          { type: 'object', properties: {
            urls: { type: 'array', items: { type: 'string' }, description: 'Up to 20 addresses from your search results' },
            objective: { type: 'string', description: 'What you want from these pages' },
            full_content: { type: 'boolean', description: 'true for the whole page text; false (default) for the relevant excerpts' },
          }, required: ['urls'] }, 20000),
      ];
      // A fresh budget and failure count for the next call to Claude (U.ask calls it before each
      // one). Pages already allowed stay allowed: a corrective turn may reopen a page its own
      // earlier reply cited.
      list.reset = function () { used.web_search = 0; used.web_fetch = 0; failed = 0; };
      return list;
    });
  },
};

// ---------- downloads ----------
U.saveFile = function (filename, text, type) {
  var dl = U.rt.downloads;
  if (!dl) { U.toast('Saving files is not available here.', { kind: 'bad' }); return Promise.resolve(false); }
  return Promise.resolve(dl.save({ filename: filename, data: new Blob([text], { type: type || 'application/json' }) })).then(function () { return true; }, function (e) {
    if (e && e.code !== 'cancelled' && e.code !== 'declined') U.toast(U.errText(e), { kind: 'bad' });
    return false;
  });
};
