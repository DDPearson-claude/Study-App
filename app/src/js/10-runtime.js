// Runtime capabilities: db, user, sample, mcp, downloads, permissions.
// Everything degrades gracefully: a missing capability resolves null and features hide.
U.rt = { db: null, user: null, sample: null, mcp: null, downloads: null, permissions: null, uid: null, inViewer: false, TIMEOUT_MS: 10000 };
U.rt.has = function (name) { return !!U.rt[name]; };
U.rt.ready = (function () {
  var claude = window.claude;
  if (!claude || typeof claude.use !== 'function') return Promise.resolve(U.rt);
  U.rt.inViewer = true;
  // Every bridge call gets the same 10 s guard: a call that never answers must not hold up boot.
  function guard(p) {
    return Promise.race([
      Promise.resolve(p).catch(function () { return null; }),
      new Promise(function (r) { setTimeout(function () { r(null); }, U.rt.TIMEOUT_MS); }),
    ]);
  }
  function use(name) {
    return guard(Promise.resolve().then(function () { return claude.use(name); })).then(function (ns) { U.rt[name] = ns || null; return ns; });
  }
  return Promise.all(['db', 'user', 'sample', 'mcp', 'downloads', 'permissions'].map(use)).then(function () {
    if (!U.rt.user || !U.rt.user.id) return U.rt;
    // No uid (it never answered): private data falls back to the in-memory store, and boot shows
    // the "keep your progress" notice.
    return guard(Promise.resolve().then(function () { return U.rt.user.id(); })).then(function (id) { U.rt.uid = id || null; return U.rt; });
  });
})();

// ---------- asking Claude ----------
U.TIERS = { quick: 'quick', default: 'default', complex: 'complex' };

// Pull the first JSON object/array out of a reply, tolerating fences and stray prose.
U.parseJson = function (text) {
  var t = String(text || '').trim().replace(/^```(?:json|JSON)?\s*/, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(t); } catch (e) {}
  var starts = [t.indexOf('{'), t.indexOf('[')].filter(function (i) { return i >= 0; });
  if (!starts.length) throw { code: 'bad_json', message: 'Claude did not reply with JSON.' };
  var start = Math.min.apply(null, starts), open = t[start], close = open === '{' ? '}' : ']';
  var depth = 0, inStr = false, esc = false;
  for (var i = start; i < t.length; i++) {
    var ch = t[i];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close && --depth === 0) {
      try { return JSON.parse(t.slice(start, i + 1)); } catch (e) { break; }
    }
  }
  throw { code: 'bad_json', message: 'Claude replied with JSON that could not be read.' };
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
//   schema(fn) -> returns [] or a list of problems; one corrective retry with the problems listed
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
  if (opts.tools && opts.tools.length) o.tools = opts.tools;
  if (opts.images) o.images = opts.images;
  var started = Date.now();
  function once(inp, attempt) {
    return U._gate.enter(opts, inp).then(function (release) {
      return Promise.resolve().then(function () { return sample(inp, o); }).then(function (r) {
        release();
        U.emit('ask', { label: opts.label, tier: o.modelTier, ms: Date.now() - started, chars: (r.text || '').length, truncated: !!r.truncated });
        if (r.truncated && opts.json) throw { code: 'truncated', message: 'Claude\'s answer was cut off.', text: r.text };
        return r.text || '';
      }, function (e) {
        release();
        if (e && (e.code === 'upstream_error' || e.code === 'unavailable') && attempt < 1 && !(opts.signal && opts.signal.aborted)) {
          return U.sleep(1000 + Math.random() * 2000).then(function () { return once(inp, attempt + 1); });
        }
        throw e;
      });
    });
  }
  if (!opts.json) return once(input, 0);
  function check(text, tries) {
    var data, problems;
    try { data = U.parseJson(text); problems = opts.schema ? opts.schema(data) : []; }
    catch (e) { problems = [e.message || 'Reply was not valid JSON.']; }
    if (!problems.length) return data;
    if (tries >= 1) throw { code: 'invalid', message: 'Claude\'s answer did not have the right shape: ' + problems.slice(0, 3).join('; ') };
    var fix = [
      typeof input === 'string' ? { role: 'user', content: input } : null,
      { role: 'assistant', content: String(text).slice(0, 60000) },
      { role: 'user', content: 'Your reply had these problems:\n- ' + problems.slice(0, 12).join('\n- ') + '\nReply again with the complete corrected JSON only, no commentary.' },
    ];
    var turns = typeof input === 'string' ? fix.filter(Boolean) : input.concat(fix.slice(1));
    return once(turns, 0).then(function (t2) { return check(t2, tries + 1); });
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
  // list, and only then are the last results dropped.
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
    [1200, 500, 200].forEach(function (floor) {
      for (var i = p.results.length - 1; i >= 0 && s.length > max; i--) { shrink(p.results[i], floor); s = JSON.stringify(p); }
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
  // planted in a page or a prompt can't send Dan's words to an address of its choosing.
  // opts.budget: most calls of each tool in this set of tools (default 10 searches, 6 fetches: a
  // little above what the prompts ask for, so only a runaway loop meets it). A failed call does
  // not use up the budget; after 4 failures the tools stop calling the connector.
  // opts.patient: wait out a rate limit and retry (background research; never while Dan waits).
  tools: function (log, opts) {
    opts = opts || {};
    var allowed = new Set();
    var budget = Object.assign({ web_search: 10, web_fetch: 6 }, opts.budget || {}), used = { web_search: 0, web_fetch: 0 }, failed = 0;
    var waits = Array.isArray(opts.patient) ? opts.patient : opts.patient ? [20000, 45000] : [];
    (opts.allow || []).forEach(function (u) { var n = U.research._norm(u); if (n) allowed.add(n); });
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
              var asked = U.research._urlsIn(input);
              var refused = asked.filter(function (u) { var n = U.research._norm(u); return !n || !allowed.has(n); });
              if (!asked.length) return Promise.resolve('Tool error (bad_request): give the full web address of a page from your search results.');
              if (refused.length) return Promise.resolve('Tool error (refused): only pages returned by web_search in this conversation (or the lesson\'s own sources) can be opened. Not allowed: ' + refused.slice(0, 3).join(', ') + '. Search first, then open a result.');
            }
            used[name] = (used[name] || 0) + 1;
            if (input && typeof input === 'object' && !Array.isArray(input) && input.session_id == null) {
              input = Object.assign({}, input, { session_id: U.research.SESSION });
            }
            return U.research._call(name, input, waits).then(function (p) {
              p = U.research._clean(p);
              if (name === 'web_search') {
                var found = p && Array.isArray(p.results) ? p.results.map(function (r) { return r && r.url; }) : U.research._urlsIn(p);
                found.forEach(function (u) { var n = U.research._norm(u); if (n) allowed.add(n); });
              }
              return U.research._fit(p, max);
            }, function (e) {
              used[name]--;
              failed++;
              if (U.research._isRate(e)) return 'Tool error (rate_limited): the search service is busy right now. Do not repeat the call; write your answer from what you already have.';
              return 'Tool error (' + (e && e.code) + '): ' + String(e && e.message || '').slice(0, 300) + '. Check the arguments against the tool schema; try a different call at most once.';
            });
          },
        };
      }
      return [
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
