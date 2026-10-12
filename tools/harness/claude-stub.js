/*
 * Local stand-in for the claude.ai artifact runtime (contract 0.2.67), for
 * browser tests only. Inject before any page script (Playwright
 * addInitScript). It mirrors the documented behaviour of claude.use() and the
 * db, user, sample, mcp and downloads namespaces closely enough to exercise a
 * page end to end:
 *   - use() resolves asynchronously (never during the page's first run)
 *   - db paths follow the even/odd segment grammar and throw TypeError
 *   - documents are plain objects, at most 256 KiB, frozen on delivery
 *   - update() rejects invalid_argument on a missing document
 *   - onSnapshot delivers the current state soon after subscribing, then
 *     every change, including writes made from outside (a build session)
 *
 * Tests drive it through window.__CLAUDE_STUB__:
 *   seed(path, data)        write as if another session did it (fires listeners)
 *   dump()                  every document as {path: data}
 *   calls                   every sample / mcp / downloads call, in order
 *   onSample(fn)            fn(input, opts) -> string | object | Promise
 *   onTool(server, tool, fn) fn(input) -> payload | Promise
 * Optional window.__CLAUDE_STUB_CONFIG__ = {userId, owner, deny:[names], db:{path:data}, noTools}
 * set before this script runs (noTools: a view where sample cannot run page tools).
 */
(function () {
  'use strict';
  var cfg = window.__CLAUDE_STUB_CONFIG__ || {};
  var deny = cfg.deny || [];
  var MAX_DOC = 256 * 1024;
  var store = new Map(); // docPath -> {data, version}
  var docListeners = new Map(); // docPath -> Set(fn)
  var queryListeners = new Set(); // {collection, query, next}
  var calls = [];
  var sampleHandler = null;
  var toolHandlers = {};

  function err(code, message) { return { code: code, message: message || code }; }
  function later(fn) { setTimeout(fn, 0); }
  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      Object.keys(o).forEach(function (k) { deepFreeze(o[k]); });
    }
    return o;
  }
  function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
  var SEG = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
  function segments(path, kind) {
    if (typeof path !== 'string' || !path) throw new TypeError(kind + ' path must be a non-empty string');
    var segs = path.split('/');
    if (segs.length > 16 || path.length > 1000) throw new TypeError(kind + ' path too long');
    segs.forEach(function (s) {
      if (!SEG.test(s) || s === '.' || s === '..') throw new TypeError('bad path segment "' + s + '" in ' + path);
    });
    if (kind === 'document' && segs.length % 2 !== 0) throw new TypeError('document path needs an even number of segments (got ' + segs.length + '): ' + path);
    if (kind === 'collection' && segs.length % 2 !== 1) throw new TypeError('collection path needs an odd number of segments (got ' + segs.length + '): ' + path);
    return segs;
  }
  function parentOf(docPath) { var s = docPath.split('/'); s.pop(); return s.join('/'); }
  function idOf(docPath) { var s = docPath.split('/'); return s[s.length - 1]; }
  function checkBody(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return err('invalid_argument', 'document body must be a plain object');
    var json;
    try { json = JSON.stringify(data); } catch (e) { return err('invalid_argument', 'body is not JSON'); }
    if (json.length > MAX_DOC) return err('invalid_argument', 'document over 256 KiB (' + json.length + ' bytes)');
    return null;
  }
  function snap(path) {
    var rec = store.get(path);
    var frozen = rec ? deepFreeze(clone(rec.data)) : undefined;
    return { id: idOf(path), exists: !!rec, data: function () { return frozen; }, metadata: { fromCache: false, hasPendingWrites: false } };
  }
  function merge(target, src) {
    Object.keys(src).forEach(function (k) {
      var v = src[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) merge(target[k], v);
      else target[k] = clone(v);
    });
    return target;
  }
  function getField(obj, field) {
    return field.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function matches(data, where) {
    return where.every(function (w) {
      var v = getField(data, w[0]), op = w[1], x = w[2];
      switch (op) {
        case '==': return v === x;
        case '!=': return v !== x;
        case '<': return v < x;
        case '<=': return v <= x;
        case '>': return v > x;
        case '>=': return v >= x;
        case 'in': return Array.isArray(x) && x.indexOf(v) >= 0;
        case 'not-in': return Array.isArray(x) && x.indexOf(v) < 0;
        case 'array-contains': return Array.isArray(v) && v.indexOf(x) >= 0;
        default: throw new TypeError('unknown operator ' + op);
      }
    });
  }
  function runQuery(collection, q) {
    var docs = [];
    store.forEach(function (rec, path) {
      if (parentOf(path) === collection && matches(rec.data, q.where)) docs.push(path);
    });
    docs.sort(function (a, b) {
      if (q.order) {
        var av = getField(store.get(a).data, q.order.field), bv = getField(store.get(b).data, q.order.field);
        if (av === undefined && bv !== undefined) return 1;
        if (bv === undefined && av !== undefined) return -1;
        if (av < bv) return q.order.dir === 'desc' ? 1 : -1;
        if (av > bv) return q.order.dir === 'desc' ? -1 : 1;
      }
      return idOf(a) < idOf(b) ? -1 : idOf(a) > idOf(b) ? 1 : 0;
    });
    if (q.limit) docs = docs.slice(0, q.limit);
    var list = docs.map(snap);
    return { docs: list, size: list.length, empty: list.length === 0, metadata: { fromCache: false, hasPendingWrites: false }, docChanges: function () { return list.map(function (d, i) { return { type: 'added', doc: d, oldIndex: -1, newIndex: i }; }); } };
  }
  function notify(path) {
    var set = docListeners.get(path);
    if (set) set.forEach(function (fn) { later(function () { fn(snap(path)); }); });
    var coll = parentOf(path);
    queryListeners.forEach(function (l) { if (l.collection === coll) later(function () { l.next(runQuery(l.collection, l.query)); }); });
  }
  function write(path, data) {
    var rec = store.get(path);
    store.set(path, { data: clone(data), version: rec ? rec.version + 1 : 1 });
    notify(path);
  }

  function docRef(path) {
    segments(path, 'document');
    return {
      id: idOf(path),
      path: path,
      get: function () { return new Promise(function (res) { later(function () { res(snap(path)); }); }); },
      set: function (data) {
        return new Promise(function (res, rej) {
          var e = checkBody(data); if (e) return later(function () { rej(e); });
          later(function () { write(path, data); res(); });
        });
      },
      update: function (data) {
        return new Promise(function (res, rej) {
          var e = checkBody(data); if (e) return later(function () { rej(e); });
          later(function () {
            var rec = store.get(path);
            if (!rec) return rej(err('invalid_argument', 'update on a missing document: ' + path));
            var next = merge(clone(rec.data), data);
            var e2 = checkBody(next); if (e2) return rej(e2);
            write(path, next); res();
          });
        });
      },
      delete: function () {
        return new Promise(function (res) { later(function () { if (store.delete(path)) notify(path); res(); }); });
      },
      acquire: function () { return Promise.resolve({ acquired: true, expiresAt: Date.now() + 10000 }); },
      onSnapshot: function (next) {
        var set = docListeners.get(path) || new Set();
        docListeners.set(path, set);
        set.add(next);
        later(function () { if (set.has(next)) next(snap(path)); });
        return function () { set.delete(next); };
      },
      collection: function (sub) { return collRef(path + '/' + sub); },
    };
  }
  function makeQuery(collection, q) {
    return {
      where: function (f, op, v) { return makeQuery(collection, { where: q.where.concat([[f, op, v]]), order: q.order, limit: q.limit }); },
      orderBy: function (f, dir) { return makeQuery(collection, { where: q.where, order: { field: f, dir: dir || 'asc' }, limit: q.limit }); },
      limit: function (n) { return makeQuery(collection, { where: q.where, order: q.order, limit: n }); },
      get: function () { return new Promise(function (res) { later(function () { res(runQuery(collection, q)); }); }); },
      onSnapshot: function (next) {
        var l = { collection: collection, query: q, next: next };
        queryListeners.add(l);
        later(function () { if (queryListeners.has(l)) next(runQuery(collection, q)); });
        return function () { queryListeners.delete(l); };
      },
    };
  }
  var autoId = 0;
  function collRef(path) {
    segments(path, 'collection');
    var q = makeQuery(path, { where: [], order: null, limit: null });
    q.path = path;
    q.doc = function (id) { return docRef(path + '/' + (id || ('auto' + (++autoId) + Math.random().toString(36).slice(2, 8)))); };
    q.add = function (data) { var r = q.doc(); return r.set(data).then(function () { return r; }); };
    return q;
  }
  var db = Object.freeze({ doc: docRef, collection: collRef });

  var userId = cfg.userId || 'u_stubuser0000000000000000';
  var user = Object.freeze({
    id: function () { return Promise.resolve(userId); },
    me: function () { return Promise.resolve({ id: userId, name: 'Dan', guest: false }); },
    isOwner: function () { return Promise.resolve(cfg.owner !== false); },
    canEdit: function () { return Promise.resolve(cfg.owner !== false); },
    can: function () { return Promise.resolve(true); },
    profiles: function (ids) { var o = {}; (ids || []).forEach(function (i) { o[i] = { id: i, name: i === userId ? 'Dan' : '', guest: false }; }); return Promise.resolve(o); },
  });

  function sample(input, opts) {
    opts = opts || {};
    calls.push({ kind: 'sample', input: input, opts: { modelTier: opts.modelTier, hasTools: !!opts.tools } });
    return new Promise(function (res, rej) {
      // A view that cannot run page tools (cfg.noTools) refuses a call that offers them.
      if (cfg.noTools && opts.tools && opts.tools.length) return later(function () { rej(err('tools_unavailable', 'this view cannot run page tools')); });
      later(function () {
        if (!sampleHandler) return rej(err('not_granted', 'no stub sample handler'));
        Promise.resolve().then(function () { return sampleHandler(input, opts); }).then(function (out) {
          var text = typeof out === 'string' ? out : JSON.stringify(out);
          if (opts.onText) opts.onText({ text: text, delta: text });
          res({ text: text, truncated: false });
        }, function (e) { rej(e && e.code ? e : err('unavailable', String(e))); });
      });
    });
  }
  sample.json = function (input, opts) {
    return sample(input, opts).then(function (r) {
      var t = r.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
      return JSON.parse(t);
    });
  };
  // `tools` only where page tools can run (sample.d.ts); cfg.noTools plays a view that cannot.
  sample.limits = function () {
    var l = { maxPromptBytes: 262144, images: true, maxImages: 4 };
    if (!cfg.noTools) l.tools = { maxCount: 20 };
    return Promise.resolve(l);
  };

  var mcp = Object.freeze({
    listTools: function (server) {
      var servers = Object.keys(toolHandlers).map(function (s) { return { name: s, authStatus: 'connected', tools: Object.keys(toolHandlers[s]).map(function (t) { return { name: t, description: '' }; }) }; });
      if (server) servers = servers.filter(function (s) { return s.name === server; });
      return Promise.resolve({ servers: servers });
    },
    callTool: function (server, tool, input) {
      calls.push({ kind: 'mcp', server: server, tool: tool, input: clone(input) });
      return new Promise(function (res, rej) {
        later(function () {
          var h = toolHandlers[server] && toolHandlers[server][tool];
          if (!h) return rej(err('not_in_manifest', server + '/' + tool + ' has no stub handler'));
          Promise.resolve().then(function () { return h(clone(input)); }).then(function (payload) { res(payload && payload.__result ? payload.__result : { payload: payload, content: [] }); }, function (e) { rej(e && e.code ? e : err('tool_error', String(e))); });
        });
      });
    },
    describeTool: function () { return Promise.reject(err('bad_request', 'no schema in stub')); },
    watchTool: function () { return function () {}; },
  });

  var downloads = Object.freeze({
    save: function (o) { calls.push({ kind: 'download', filename: o && o.filename, size: o && o.data && (o.data.length || o.data.size) }); return Promise.resolve({ saved: true }); },
  });

  // permissions (built in on the platform) only when a test asks for it: cfg.permissions =
  // { states: {name: state}, answer: {name: state after request}, delayMs }. request() waits delayMs
  // (Dan reading the dialog) and records itself in calls.
  var permissions = cfg.permissions ? (function (P) {
    var states = Object.assign({}, P.states || {});
    return Object.freeze({
      state: function (name) { return Promise.resolve(name ? (states[name] || 'unavailable') : Object.assign({}, states)); },
      request: function (names) {
        calls.push({ kind: 'permissions', names: names });
        return new Promise(function (res) {
          setTimeout(function () {
            var out = {};
            (names || Object.keys(states)).forEach(function (n) {
              if (states[n] === 'prompt' && P.answer && P.answer[n]) states[n] = P.answer[n];
              out[n] = states[n] || 'unavailable';
            });
            res(out);
          }, P.delayMs || 0);
        });
      },
      manage: function () { calls.push({ kind: 'permissions-manage' }); if (P.afterManage) Object.assign(states, P.afterManage); return Promise.resolve(); },
    });
  })(cfg.permissions) : null;

  var namespaces = { db: db, user: user, sample: sample, mcp: mcp, downloads: downloads, permissions: permissions };
  window.claude = Object.freeze({
    use: function (name) {
      return new Promise(function (res) {
        setTimeout(function () { res(deny.indexOf(name) >= 0 ? null : (namespaces[name] || null)); }, 5);
      });
    },
  });

  Object.keys(cfg.db || {}).forEach(function (p) { segments(p, 'document'); store.set(p, { data: clone(cfg.db[p]), version: 1 }); });

  window.__CLAUDE_STUB__ = {
    seed: function (path, data) { segments(path, 'document'); write(path, data); },
    remove: function (path) { if (store.delete(path)) notify(path); },
    get: function (path) { var r = store.get(path); return r ? clone(r.data) : undefined; },
    dump: function () { var o = {}; store.forEach(function (r, p) { o[p] = clone(r.data); }); return o; },
    calls: calls,
    onSample: function (fn) { sampleHandler = fn; },
    onTool: function (server, tool, fn) { (toolHandlers[server] = toolHandlers[server] || {})[tool] = fn; },
  };
})();
