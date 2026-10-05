/*
 * Perf/reliability runtime stub. Like tools/harness/claude-stub.js, but db, sample and mcp are
 * served from Node through the context binding window.__rt(op, args), so that:
 *   - several pages (tabs/devices) share ONE db, with live snapshot delivery between them
 *   - every db op / sample call can get latency, failures or hangs injected from Node
 *   - Node counts subscriptions per page, ops per kind, sample calls per task
 * Config: window.__RT_CFG__ = {label, useMs, deny:[names], mcp:bool}
 */
(function () {
  'use strict';
  var cfg = window.__RT_CFG__ || {};
  var deny = cfg.deny || [];
  var label = cfg.label || 'page';
  function rt(op, args) {
    return window.__rt(op, JSON.stringify(args || {})).then(function (s) {
      var r = JSON.parse(s);
      if (r.err) throw r.err;
      return r.ok;
    });
  }
  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.keys(o).forEach(function (k) { deepFreeze(o[k]); }); }
    return o;
  }
  var SEG = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
  function check(path, kind) {
    if (typeof path !== 'string' || !path) throw new TypeError(kind + ' path must be a non-empty string');
    var segs = path.split('/');
    segs.forEach(function (s) { if (!SEG.test(s)) throw new TypeError('bad path segment "' + s + '" in ' + path); });
    if (kind === 'document' && segs.length % 2 !== 0) throw new TypeError('document path needs even segments: ' + path);
    if (kind === 'collection' && segs.length % 2 !== 1) throw new TypeError('collection path needs odd segments: ' + path);
  }
  function docSnap(s) {
    var data = s.exists ? deepFreeze(s.data) : undefined;
    return { id: s.id, exists: s.exists, data: function () { return data; }, metadata: { fromCache: false, hasPendingWrites: false } };
  }
  function qSnap(list) {
    var docs = list.map(docSnap);
    return { docs: docs, size: docs.length, empty: !docs.length, metadata: { fromCache: false, hasPendingWrites: false }, docChanges: function () { return docs.map(function (d, i) { return { type: 'added', doc: d, oldIndex: -1, newIndex: i }; }); } };
  }
  var subs = {}, subSeq = 0;
  window.__rtDeliver = function (id, kind, payload) {
    var s = subs[id];
    if (!s) return false;
    try {
      if (payload && payload.err) { if (s.error) s.error(payload.err); delete subs[id]; return true; }
      s.next(kind === 'doc' ? docSnap(payload) : qSnap(payload));
    } catch (e) { console.error(e); }
    return true;
  };
  function subscribe(spec, next, error) {
    var id = label + ':' + (++subSeq);
    subs[id] = { next: next, error: error };
    spec.id = id;
    rt('sub', spec).catch(function (e) { var s = subs[id]; delete subs[id]; if (s && s.error) s.error(e); });
    return function () { if (subs[id]) { delete subs[id]; rt('unsub', { id: id }).catch(function () {}); } };
  }
  function docRef(path) {
    check(path, 'document');
    return {
      id: path.split('/').pop(), path: path,
      get: function () { return rt('get', { path: path }).then(docSnap); },
      set: function (data) { return rt('set', { path: path, data: data }); },
      update: function (data) { return rt('update', { path: path, data: data }); },
      delete: function () { return rt('delete', { path: path }); },
      acquire: function (o) { return rt('acquire', { path: path, o: o || {} }); },
      onSnapshot: function (next, error) { return subscribe({ kind: 'doc', path: path }, next, error); },
      collection: function (sub) { return collRef(path + '/' + sub); },
    };
  }
  function makeQuery(coll, q) {
    return {
      where: function (f, op, v) { return makeQuery(coll, { where: q.where.concat([[f, op, v]]), order: q.order, limit: q.limit }); },
      orderBy: function (f, dir) { return makeQuery(coll, { where: q.where, order: { field: f, dir: dir || 'asc' }, limit: q.limit }); },
      limit: function (n) { return makeQuery(coll, { where: q.where, order: q.order, limit: n }); },
      get: function () { return rt('query', { coll: coll, q: q }).then(qSnap); },
      onSnapshot: function (next, error) { return subscribe({ kind: 'query', coll: coll, q: q }, next, error); },
    };
  }
  var autoId = 0;
  function collRef(path) {
    check(path, 'collection');
    var q = makeQuery(path, { where: [], order: null, limit: null });
    q.path = path;
    q.doc = function (id) { return docRef(path + '/' + (id || ('auto' + (++autoId) + Math.random().toString(36).slice(2, 8)))); };
    q.add = function (data) { var r = q.doc(); return r.set(data).then(function () { return r; }); };
    return q;
  }
  var db = Object.freeze({ doc: docRef, collection: collRef });

  var uid = cfg.userId || 'u_stubuser0000000000000000';
  var user = Object.freeze({
    id: function () { return Promise.resolve(uid); },
    me: function () { return Promise.resolve({ id: uid, name: 'Dan', guest: false }); },
    isOwner: function () { return Promise.resolve(true); },
    canEdit: function () { return Promise.resolve(true); },
    can: function () { return Promise.resolve(true); },
    profiles: function (ids) { var o = {}; (ids || []).forEach(function (i) { o[i] = { id: i, name: 'Dan', guest: false }; }); return Promise.resolve(o); },
  });

  var sampleSeq = 0;
  function sample(input, opts) {
    opts = opts || {};
    var id = label + ':s' + (++sampleSeq);
    return new Promise(function (resolve, reject) {
      var settled = false;
      function onAbort() {
        if (settled) return;
        settled = true;
        rt('sampleAbort', { id: id }).catch(function () {});
        reject({ code: 'cancelled', message: 'aborted' });
      }
      if (opts.signal) {
        if (opts.signal.aborted) return onAbort();
        opts.signal.addEventListener('abort', onAbort);
      }
      Promise.resolve().then(function () {
        return rt('sample', { id: id, input: input, tier: opts.modelTier || 'default', tools: (opts.tools || []).map(function (t) { return t.name; }), cache: opts.cache, hasSignal: !!opts.signal });
      }).then(function (r) {
        if (settled) return;
        var text = r.text, chunks = r.stream ? Math.max(1, Math.ceil(text.length / 40)) : 1, i = 0;
        (function step() {
          if (settled) return;
          i++;
          var t = text.slice(0, Math.ceil(text.length * i / chunks));
          if (opts.onText) try { opts.onText({ text: t, delta: t.slice(Math.ceil(text.length * (i - 1) / chunks)) }); } catch (e) { console.error(e); }
          if (i < chunks) return setTimeout(step, 50);
          settled = true;
          resolve({ text: text, truncated: !!r.truncated, modelTierApplied: opts.modelTier || 'default' });
        })();
      }, function (e) { if (!settled) { settled = true; reject(e); } });
    });
  }
  sample.json = function (input, opts) { return sample(input, opts).then(function (r) { return JSON.parse(r.text); }); };
  sample.limits = function () { return Promise.resolve({ maxPromptBytes: 262144, tools: { maxCount: 8 } }); };

  var mcp = Object.freeze({
    listTools: function (server) {
      return rt('mcpList', { server: server || null });
    },
    callTool: function (server, tool, input) { return rt('mcpCall', { server: server, tool: tool, input: input }); },
    describeTool: function () { return Promise.reject({ code: 'bad_request', message: 'no schema in stub' }); },
    watchTool: function () { return function () {}; },
  });
  var downloads = Object.freeze({ save: function () { return Promise.resolve({ saved: true }); } });
  var permissions = Object.freeze({
    state: function () { return Promise.resolve({}); },
    request: function () { return Promise.resolve({}); },
    manage: function () { return Promise.resolve(); },
  });
  var spaces = { db: db, user: user, sample: sample, mcp: cfg.mcp ? mcp : null, downloads: downloads, permissions: permissions };
  window.claude = Object.freeze({
    use: function (name) {
      return new Promise(function (res) {
        setTimeout(function () { res(deny.indexOf(name) >= 0 ? null : (spaces[name] || null)); }, cfg.useMs == null ? 60 : cfg.useMs);
      });
    },
  });
})();
