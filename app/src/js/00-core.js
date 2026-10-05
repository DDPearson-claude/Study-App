// Core helpers shared by every module. See docs/ARCHITECTURE.md section 3.
var U = (window.U = window.U || {});
U.BUILD = "@@BUILD@@";

// ---------- element builder ----------
U.h = function (tag, attrs) {
  var el = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'on') Object.keys(v).forEach(function (e) { el.addEventListener(e, v[e]); });
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'text') el.textContent = v;
      else if (k in el && k !== 'list' && k !== 'form' && typeof v !== 'string') el[k] = v;
      else el.setAttribute(k, v === true ? '' : String(v));
    });
  }
  for (var i = 2; i < arguments.length; i++) U.append(el, arguments[i]);
  return el;
};
U.append = function (el, child) {
  if (child == null || child === false) return el;
  if (Array.isArray(child)) { child.forEach(function (c) { U.append(el, c); }); return el; }
  el.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  return el;
};
U.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };
U.svg = function (markup) {
  // Only for static, app-authored icons (never model text).
  var t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstChild;
};
U.icons = {
  tick: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5.5-6.5 6.5 6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-5.5L18.5 12 13 17.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7-5.6-1.9L10.1 9 12 3.5Z" fill="currentColor"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.5L5 18.5Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.5C10.3 5.2 7.8 4.5 4 4.5v13c3.8 0 6.3.7 8 2m0-13c1.7-1.3 4.2-2 8-2v13c-3.8 0-6.3.7-8 2m0-13v13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
U.icon = function (name, cls) { var s = U.svg(U.icons[name]); if (cls) s.setAttribute('class', cls); return s; };

// ---------- safe rich text ----------
// Paragraphs split on blank lines; **bold**, *italic*, [[key term]], [^n] footnotes, `code`.
// Bullet lines starting with "- " become a list. No links, no raw HTML.
U.rich = function (text, opts) {
  opts = opts || {};
  var frag = document.createDocumentFragment();
  String(text || '').replace(/\r/g, '').split(/\n{2,}/).forEach(function (block) {
    block = block.trim();
    if (!block) return;
    var lines = block.split('\n');
    if (lines.every(function (l) { return /^\s*[-•]\s+/.test(l); })) {
      var ul = U.h('ul');
      lines.forEach(function (l) { ul.appendChild(U.inline(U.h('li'), l.replace(/^\s*[-•]\s+/, ''), opts)); });
      frag.appendChild(ul);
    } else {
      frag.appendChild(U.inline(U.h('p'), lines.join(' '), opts));
    }
  });
  return frag;
};
U.inline = function (el, text, opts) {
  opts = opts || {};
  var re = /\[\[([^\]]{1,80})\]\]|\[\^(\d{1,3})\]|\*\*([^*]{1,300})\*\*|\*([^*\s][^*]{0,300}?)\*|`([^`]{1,120})`/g;
  var last = 0, m;
  text = String(text || '');
  while ((m = re.exec(text))) {
    if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
    if (m[1]) el.appendChild(U.h('mark', { class: 'term' }, m[1]));
    else if (m[2]) {
      var n = Number(m[2]);
      if (opts.footnotes && opts.footnotes.has && !opts.footnotes.has(n)) { /* unknown source: drop the marker */ }
      else el.appendChild(U.h('button', { class: 'fn', type: 'button', 'aria-label': 'Source ' + n, on: { click: function () { if (opts.footnotes && opts.footnotes.open) opts.footnotes.open(n); } } }, String(n)));
    }
    else if (m[3]) el.appendChild(U.h('strong', null, m[3]));
    else if (m[4]) el.appendChild(U.h('em', null, m[4]));
    else if (m[5]) el.appendChild(U.h('code', null, m[5]));
    last = re.lastIndex;
  }
  if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
  return el;
};
U.plain = function (text) { return String(text || '').replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/\[\^\d+\]/g, '').replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/`([^`]+)`/g, '$1'); };

// ---------- ids, time, hashing ----------
U.id = function (prefix) { return (prefix || 'x') + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 7); };
U.slug = function (text) {
  var s = String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '');
  return s || 'topic';
};
U.pad = function (n) { return (n < 10 ? '0' : '') + n; };
U.today = function (d) { d = d || new Date(); return d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate()); };
U.addDays = function (day, n) { var p = day.split('-').map(Number); var d = new Date(p[0], p[1] - 1, p[2] + n); return U.today(d); };
U.daysBetween = function (a, b) { var pa = a.split('-').map(Number), pb = b.split('-').map(Number); return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 864e5); };
U.now = function () { return new Date().toISOString(); };
U.hash = function (str) { var h = 2166136261; str = String(str); for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
U.clone = function (o) { return o == null ? o : JSON.parse(JSON.stringify(o)); };
U.when = function (iso) {
  if (!iso) return '';
  var d = new Date(iso), days = U.daysBetween(U.today(d), U.today());
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return days + ' days ago';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: days > 300 ? 'numeric' : undefined });
};
U.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
U.shuffle = function (arr, seed) {
  var a = arr.slice(), s = seed == null ? Math.random() * 1e9 : seed;
  function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
};

// ---------- event bus ----------
U._bus = {};
U.on = function (evt, fn) { (U._bus[evt] = U._bus[evt] || []).push(fn); return function () { U._bus[evt] = (U._bus[evt] || []).filter(function (f) { return f !== fn; }); }; };
U.emit = function (evt, data) { (U._bus[evt] || []).slice().forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } }); };

// ---------- router ----------
// Views register with U.routes.add('#/t/:tid', fn). fn(params, ctx) renders into ctx.view and may
// return a cleanup function. ctx.alive() is false once the user has navigated away.
U.routes = {
  list: [],
  add: function (pattern, handler, opts) {
    var keys = [];
    var re = new RegExp('^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\?:([a-z]+)/gi, function (_, k) { keys.push(k); return '([^/]+)'; }) + '/?$');
    this.list.push({ re: re, keys: keys, handler: handler, opts: opts || {} });
  },
};
U.go = function (hash) { if (location.hash === hash) U._route(); else location.hash = hash; };
U._cleanup = null;
U._routeSeq = 0;
U._route = function () {
  var hash = location.hash || '#/';
  if (hash === '#') hash = '#/';
  var seq = ++U._routeSeq;
  if (U._cleanup) { try { U._cleanup(); } catch (e) { console.error(e); } U._cleanup = null; }
  var view = document.getElementById('view');
  U.clear(view);
  U.closeSheets();
  for (var i = 0; i < U.routes.list.length; i++) {
    var r = U.routes.list[i], m = hash.match(r.re);
    if (!m) continue;
    var params = {};
    r.keys.forEach(function (k, j) { params[k] = decodeURIComponent(m[j + 1]); });
    U.focusMode(!!r.opts.focus);
    U.setTab(r.opts.tab || null);
    var ctx = { view: view, hash: hash, alive: function () { return seq === U._routeSeq; } };
    try {
      var out = r.handler(params, ctx);
      if (out && typeof out.then === 'function') out.then(function (c) { if (typeof c === 'function') { if (ctx.alive()) U._cleanup = c; else c(); } }, function (e) { U.fail(view, e); });
      else if (typeof out === 'function') U._cleanup = out;
    } catch (e) { U.fail(view, e); }
    window.scrollTo(0, 0);
    return;
  }
  location.replace('#/');
};
U.fail = function (view, e) {
  console.error(e);
  U.clear(view).appendChild(U.h('div', { class: 'notice bad' }, U.h('div', null, U.h('strong', null, 'Something went wrong on this screen. '), String(e && (e.message || e.code) || e))));
};
U.focusMode = function (on) { document.documentElement.classList.toggle('focus', !!on); };
U.setTab = function (tab) {
  document.querySelectorAll('.tab').forEach(function (a) {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
};

// ---------- toasts ----------
U.toast = function (text, opts) {
  opts = opts || {};
  var box = document.getElementById('toasts');
  var t = U.h('div', { class: 'toast' + (opts.kind ? ' ' + opts.kind : '') }, text);
  box.appendChild(t);
  setTimeout(function () { t.remove(); }, opts.ms || (opts.kind === 'bad' ? 6000 : 3200));
};
U.errText = function (e) {
  var code = e && e.code;
  if (code === 'not_granted') return 'Claude needs your permission for this. Tap allow when the app asks.';
  if (code === 'rate_limited') return 'Claude is busy right now. Wait a moment and try again.';
  if (code === 'cancelled') return 'Stopped.';
  if (code === 'quota_exceeded') return 'Your University storage is full. Delete an old topic to make room.';
  if (code === 'unavailable' || code === 'timeout') return 'Claude could not be reached. Check your connection and try again.';
  return (e && (e.message || e.code)) ? String(e.message || e.code) : 'Something went wrong.';
};

// ---------- sheets ----------
U.closeSheets = function () { var root = document.getElementById('sheets'); if (root) U.clear(root); document.documentElement.classList.remove('sheet-open'); };
U.sheet = function (o) {
  var root = document.getElementById('sheets');
  var prevFocus = document.activeElement;
  var scrim = U.h('div', { class: 'scrim' });
  var titleId = U.id('sh');
  var actions = (o.actions || []).map(function (a) {
    return U.h('button', { class: 'btn small ' + (a.kind || 'secondary'), type: 'button', on: { click: function () { a.onClick ? a.onClick(api) : api.close(); } } }, a.label);
  });
  var box = U.h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    U.h('div', { class: 'sheet-in' },
      U.h('div', { class: 'sheet-grip', 'aria-hidden': 'true' }),
      U.h('div', { class: 'sheet-head' },
        U.h('h2', { id: titleId }, o.title || ''),
        U.h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', on: { click: function () { api.close(); } } }, U.icon('close'))),
      o.body || null,
      actions.length ? U.h('div', { class: 'sheet-actions' }, actions) : null));
  function onKey(e) { if (e.key === 'Escape') api.close(); }
  var api = {
    el: box,
    close: function () {
      scrim.remove(); box.remove(); document.removeEventListener('keydown', onKey);
      if (!root.children.length) document.documentElement.classList.remove('sheet-open');
      if (o.onClose) o.onClose();
      if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
    },
  };
  scrim.addEventListener('click', function () { api.close(); });
  document.addEventListener('keydown', onKey);
  root.appendChild(scrim); root.appendChild(box);
  document.documentElement.classList.add('sheet-open');
  setTimeout(function () { var f = box.querySelector('textarea, input, button.btn'); if (f && o.autofocus !== false) f.focus(); }, 60);
  return api;
};
U.confirmSheet = function (o) {
  return new Promise(function (resolve) {
    var done = false;
    var s = U.sheet({
      title: o.title, body: U.h('p', { class: 'muted' }, o.text || ''), autofocus: false,
      onClose: function () { if (!done) resolve(false); },
      actions: [
        { label: o.cancel || 'Cancel', kind: 'secondary', onClick: function (api) { done = true; api.close(); resolve(false); } },
        { label: o.confirm || 'OK', kind: o.danger ? 'danger' : '', onClick: function (api) { done = true; api.close(); resolve(true); } },
      ],
    });
    return s;
  });
};

// ---------- feedback ----------
U.haptic = function (pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern || 12); } catch (e) {} };
U.cheer = function (text) {
  var c = U.h('div', { class: 'cheer', 'aria-hidden': 'true' }, U.h('div', { class: 'cheer-bubble' }, U.icon('tick')), text ? U.h('p', { class: 'cheer-text' }, text) : null);
  document.body.appendChild(c);
  U.haptic([10, 40, 18]);
  setTimeout(function () { c.remove(); }, 1700);
};
