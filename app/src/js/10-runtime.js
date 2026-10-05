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

// U.ask(input, {tier, onText, signal, tools, json, schema, cache, label})
//   json:true  -> resolves the parsed object
//   schema(fn) -> returns [] or a list of problems; one corrective retry with the problems listed
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
    return sample(inp, o).then(function (r) {
      U.emit('ask', { label: opts.label, tier: o.modelTier, ms: Date.now() - started, chars: (r.text || '').length, truncated: !!r.truncated });
      if (r.truncated && opts.json) throw { code: 'truncated', message: 'Claude\'s answer was cut off.', text: r.text };
      return r.text || '';
    }, function (e) {
      if (e && e.code === 'rate_limited' && attempt < 2) return U.sleep(2500 + Math.random() * 2500).then(function () { return once(inp, attempt + 1); });
      if (e && e.code === 'unavailable' && attempt < 1) return U.sleep(1200).then(function () { return once(inp, attempt + 1); });
      throw e;
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
  call: function (tool, input) {
    var mcp = U.rt.mcp;
    return mcp.callTool(U.research.SERVER, tool, input).then(function (r) { return r && r.payload !== undefined ? r.payload : r; });
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
  // sample tool definitions; execute() never throws, so Claude can recover from a bad call.
  // opts.allow: extra addresses web_fetch may open (e.g. the lesson's own sources). Otherwise
  // web_fetch only opens pages that web_search returned in this same set of tools, so text
  // planted in a page or a prompt can't send Dan's words to an address of its choosing.
  tools: function (log, opts) {
    opts = opts || {};
    var allowed = new Set();
    (opts.allow || []).forEach(function (u) { var n = U.research._norm(u); if (n) allowed.add(n); });
    return U.research._loadSchemas().then(function (sc) {
      function def(name, description, schema, fallback, max) {
        return {
          name: name, description: description,
          inputSchema: schema || fallback,
          execute: function (input) {
            if (log) log({ tool: name, input: input });
            if (name === 'web_fetch') {
              var asked = U.research._urlsIn(input);
              var refused = asked.filter(function (u) { var n = U.research._norm(u); return !n || !allowed.has(n); });
              if (!asked.length) return Promise.resolve('Tool error: give the full web address of a page from your search results.');
              if (refused.length) return Promise.resolve('Tool error: only pages returned by web_search in this conversation (or the lesson\'s own sources) can be opened. Not allowed: ' + refused.slice(0, 3).join(', ') + '. Search first, then open a result.');
            }
            return U.research.call(name, input).then(function (p) {
              if (name === 'web_search') U.research._urlsIn(p).forEach(function (u) { var n = U.research._norm(u); if (n) allowed.add(n); });
              return U.research._trim(p, max);
            }, function (e) {
              return 'Tool error (' + (e && e.code) + '): ' + (e && e.message) + '. Check the arguments against the tool schema and try again.';
            });
          },
        };
      }
      return [
        def('web_search', 'Search the web. Returns ranked results with URLs, titles and excerpts. Use specific queries; prefer encyclopedias, universities, standards bodies, textbooks and government sources.', sc.web_search,
          { type: 'object', properties: { objective: { type: 'string', description: 'What you are trying to find out' }, search_queries: { type: 'array', items: { type: 'string' } } }, required: ['objective'] }, 12000),
        def('web_fetch', 'Open one or more web pages and return their text, so you can quote them exactly.', sc.web_fetch,
          { type: 'object', properties: { urls: { type: 'array', items: { type: 'string' } } }, required: ['urls'] }, 20000),
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
