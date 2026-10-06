// Core helpers shared by every module. See docs/ARCHITECTURE.md section 3.
var U = (window.U = window.U || {});
U.BUILD = "@@BUILD@@";
// TalkBack/VoiceOver pronunciation and hyphenation (head.html has no lang attribute).
try { if (!document.documentElement.lang) document.documentElement.lang = 'en-GB'; } catch (e) { /* no DOM (node evals) */ }

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
// A unique key for an entry in a keyed list (say attempts, questions, flags): time first, so keys
// written on different devices never collide and sort roughly by when they were made.
U.key = function () { return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
// This browser's id (localStorage 'mu.device'; 31-generate.js names lesson jobs with it).
U.device = function () {
  if (U._device) return U._device;
  try {
    var v = localStorage.getItem('mu.device');
    if (!v) { v = U.id('d'); localStorage.setItem('mu.device', v); }
    U._device = v;
  } catch (e) { U._device = U.id('d'); }
  return U._device;
};
// This tab's id (sessionStorage 'mu.tab'): it outlives a reload of the tab, and two open tabs never
// share one. Lesson jobs are named by device/tab (31-generate.js); a busy lesson doc this tab left
// with no job of this page on it is work a reload killed (U.store.lesson.abandoned).
// "Duplicate tab" copies sessionStorage, so the copy would start with the other tab's id. While a
// page of this tab is open, sessionStorage 'mu.tab.open' names it (cleared on pagehide, so a
// reload keeps the id; set again on pageshow): a page that finds it set at load is a copy (or a
// second frame of the app in one tab) and takes a fresh id. This is decided at once, because the
// generator names its jobs with the id as it loads. (A tab whose page died without pagehide, a
// crash, also takes a fresh id: the work that page left is then waited out like another tab's.)
// A copy made while the mark was missing (the page was in the back-forward cache) is caught a
// moment later: each page says hello on the BroadcastChannel 'mu.tab' with its id and when it took
// it (on load, and on coming back from that cache); of two open pages with one id, the one that
// took it later is the newcomer and takes a fresh id (the other answers a hello, so a newcomer
// hears of it either way). Lesson jobs read the id when they start, so the newcomer's are its own.
U.tab = function () {
  if (U._tab) return U._tab;
  var OPEN = 'mu.tab.open', me = U.id('g'), since = Date.now();
  try {
    var v = sessionStorage.getItem('mu.tab');
    if (!v || sessionStorage.getItem(OPEN)) { v = U.id('t'); sessionStorage.setItem('mu.tab', v); }
    sessionStorage.setItem(OPEN, me);
    U._tab = v;
  } catch (e) { U._tab = U.id('t'); return U._tab; }
  var bc = null;
  function say(type) { try { if (bc) bc.postMessage({ type: type, tab: U._tab, page: me, since: since }); } catch (e) { /* fine */ } }
  try {
    if (typeof BroadcastChannel === 'function') {
      bc = new BroadcastChannel('mu.tab');
      bc.onmessage = function (e) {
        var d = (e && e.data) || {};
        if (d.tab !== U._tab || d.page === me) return;
        // Another open page has this id. The one that took it first keeps it (a tie goes by page).
        if (+d.since < since || (+d.since === since && String(d.page) < me)) {
          U._tab = U.id('t'); since = Date.now();
          try { sessionStorage.setItem('mu.tab', U._tab); } catch (x) { /* fine */ }
        } else if (d.type === 'hello') say('mine');
      };
    }
  } catch (e) { bc = null; }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('pagehide', function () { try { if (sessionStorage.getItem(OPEN) === me) sessionStorage.removeItem(OPEN); } catch (e) { /* fine */ } });
    window.addEventListener('pageshow', function (e) { if (!e || !e.persisted) return; try { sessionStorage.setItem(OPEN, me); } catch (x) { /* fine */ } say('hello'); });
  }
  say('hello');
  return U._tab;
};
try { if (typeof sessionStorage !== 'undefined') U.tab(); } catch (e) { /* no storage (node evals) */ }
// ---------- keyed lists ----------
// Lists that two devices can add to at once are stored as maps keyed by U.key() (a merge keeps
// both sides' entries). Older data stored them as arrays; these helpers read either shape.
//   U.entries(v) -> [{key, value}] oldest first (by value.at, then key); arrays get keys 'L000'...
//   U.list(v)    -> [value] oldest first
U.legacyKey = function (i) { return 'L' + ('00' + i).slice(-3); };
U.entries = function (v) {
  var out = [];
  if (Array.isArray(v)) v.forEach(function (x, i) { if (x && typeof x === 'object') out.push({ key: U.legacyKey(i), value: x, i: i }); });
  else if (v && typeof v === 'object') Object.keys(v).forEach(function (k, i) { var x = v[k]; if (x && typeof x === 'object') out.push({ key: k, value: x, i: i }); });
  out.sort(function (a, b) {
    var x = String(a.value.at || ''), y = String(b.value.at || '');
    return x < y ? -1 : x > y ? 1 : a.key < b.key ? -1 : a.key > b.key ? 1 : a.i - b.i;
  });
  return out;
};
U.list = function (v) { return U.entries(v).map(function (e) { return e.value; }); };
// The map form of a keyed list (old arrays become {L000:…}); null entries are dropped.
U.keyed = function (v) { var o = {}; U.entries(v).forEach(function (e) { o[e.key] = e.value; }); return o; };
// Ids that are safe as one db path segment (the router rejects anything else).
U.validId = function (s) { return typeof s === 'string' && /^[A-Za-z0-9_\-.~:@+]{1,200}$/.test(s) && s !== '.' && s !== '..'; };
U.slug = function (text) {
  var s = String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '');
  return s || 'topic';
};
U.pad = function (n) { return (n < 10 ? '0' : '') + n; };
U.today = function (d) { d = d || new Date(); return d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate()); };
U.addDays = function (day, n) { var p = day.split('-').map(Number); var d = new Date(p[0], p[1] - 1, p[2] + n); return U.today(d); };
U.daysBetween = function (a, b) { var pa = a.split('-').map(Number), pb = b.split('-').map(Number); return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 864e5); };
// The study day (of a Date or ISO time, default now): U.today, but turning over at 4 am instead of
// midnight, so late-night study still belongs to that evening and a card answered at 23:55 is not
// due again five minutes later. Spaced review counts every day this way (section 8).
U.studyDay = function (d) { d = d ? new Date(d) : new Date(); return d.getHours() < 4 ? U.addDays(U.today(d), -1) : U.today(d); };
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

// ---------- layout (per device) ----------
// 'auto' (the default) gives the laptop layout when the window is at least WIDE px wide and the
// phone layout below that; Dan can pin either in settings. The choice belongs to the device, not
// to Dan, so it lives in localStorage 'mu-layout' and never goes to the db. head.html applies it
// before first paint; this keeps it right as the window changes. html[data-layout] is 'phone' or
// 'laptop'; html.framed marks a phone layout pinned on a wide window (a centred phone column).
// U.emit('layout', effective) when the effective layout changes.
U.layout = (function () {
  var WIDE = 900, FRAME = 600, mem = null;
  function mq(q) { try { return window.matchMedia ? window.matchMedia(q) : null; } catch (e) { return null; } }
  function listen(q, fn) { if (!q) return; if (q.addEventListener) q.addEventListener('change', fn); else if (q.addListener) q.addListener(fn); }
  var wideQ = mq('(min-width: ' + WIDE + 'px)'), frameQ = mq('(min-width: ' + FRAME + 'px)');
  var L = {
    WIDE: WIDE,
    CHOICES: ['auto', 'phone', 'laptop'],
    pref: function () {
      var v = mem;
      try { v = localStorage.getItem('mu-layout') || mem; } catch (e) { /* storage blocked: the in-memory copy */ }
      return v === 'phone' || v === 'laptop' ? v : 'auto';
    },
    effective: function (pref) {
      pref = pref || L.pref();
      return pref !== 'auto' ? pref : (wideQ && wideQ.matches ? 'laptop' : 'phone');
    },
    apply: function () {
      var d = document.documentElement, pref = L.pref(), eff = L.effective(pref), before = d.getAttribute('data-layout');
      d.setAttribute('data-layout', eff);
      d.classList.toggle('framed', pref === 'phone' && !!(frameQ && frameQ.matches));
      if (before !== eff) U.emit('layout', eff);
      return eff;
    },
    set: function (pref) {
      mem = L.CHOICES.indexOf(pref) >= 0 ? pref : 'auto';
      try { if (mem === 'auto') localStorage.removeItem('mu-layout'); else localStorage.setItem('mu-layout', mem); } catch (e) { /* kept for this visit */ }
      return L.apply();
    },
  };
  try { if (typeof document !== 'undefined' && document.documentElement) { L.apply(); listen(wideQ, L.apply); listen(frameQ, L.apply); } } catch (e) { /* no DOM (node evals) */ }
  return L;
})();

// ---------- router ----------
// Views register with U.routes.add('#/t/:tid', fn, {focus, tab, title}). fn(params, ctx) renders
// into ctx.view and may return a cleanup function. ctx.alive() is false once the user has navigated
// away. Params must be valid db ids (U.validId); anything else shows a "not here" screen. After a
// route renders, keyboard and screen-reader focus moves to the screen's h1 and document.title names
// the screen (views refine it with U.setTitle once their data arrives).
U.routes = {
  list: [],
  add: function (pattern, handler, opts) {
    var keys = [];
    var re = new RegExp('^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\?:([a-z]+)/gi, function (_, k) { keys.push(k); return '([^/]+)'; }) + '/?$');
    this.list.push({ re: re, keys: keys, handler: handler, opts: opts || {}, screen: (opts && opts.screen) || U.routes.screenOf(pattern) });
  },
  // The screen a route draws, set as #view[data-screen] so each screen can choose its width on
  // a laptop: learn, topic, lesson, today, review, map, book (or opts.screen).
  screenOf: function (pattern) {
    var segs = String(pattern).replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!segs.length) return 'learn';
    if (segs[0] === 't') return segs.length === 2 ? 'topic' : 'lesson';
    return segs[0];
  },
};
// The address hash is the route. If the frame ever refuses a fragment change, the route is kept
// in memory instead (U._memHash) so navigation still works; a real hashchange clears it.
U._memHash = null;
U.currentHash = function () { var h = U._memHash || location.hash || '#/'; return h === '#' ? '#/' : h; };
U.go = function (hash) {
  if (U.currentHash() === hash) { U._route(); return; }
  var before = location.hash;
  try { location.hash = hash; } catch (e) { /* refused: handled below */ }
  if (location.hash !== hash) { U._memHash = hash; U._route(); }
  else {
    U._memHash = null;
    // Only the in-memory route differed: the frame already held this address, so no hashchange
    // will come to draw it (going back to where the page started, after the fallback).
    if (before === hash) U._route();
  }
};
// Back to Learn without adding a history entry (bad or unknown addresses). The address is spelled
// out in full: a bare '#/' resolves against the document's base URL, which in a srcdoc frame is the
// host page's, so the frame would load that page instead of moving to its own '#/'.
U._home = function () {
  var before = location.hash;
  try { location.replace(location.href.split('#')[0] + '#/'); } catch (e) { /* refused: handled below */ }
  if (location.hash !== '#/') { U._memHash = '#/'; setTimeout(U._route, 0); }
  else if (before === '#/' && U._memHash) { U._memHash = null; setTimeout(U._route, 0); }   // no hashchange will come
};
U._cleanup = null;
U._routeSeq = 0;
U.setTitle = function (text) {
  try { document.title = (text ? String(text).replace(/\s+/g, ' ').trim().slice(0, 80) + ' · ' : '') + 'My University'; } catch (e) { /* fine */ }
};
U._route = function () {
  var hash = U.currentHash();
  // Find the route and decode its params before touching the screen: a malformed %-escape
  // (or any other bad address) goes home instead of leaving a blank view.
  var r = null, params = {}, bad = false;
  for (var i = 0; i < U.routes.list.length && !r; i++) {
    var m = hash.match(U.routes.list[i].re);
    if (!m) continue;
    r = U.routes.list[i];
    try { r.keys.forEach(function (k, j) { params[k] = decodeURIComponent(m[j + 1]); }); }
    catch (e) { console.warn('bad address', hash); U._home(); return; }
    bad = r.keys.some(function (k) { return !U.validId(params[k]); });
  }
  var seq = ++U._routeSeq;
  var prevFocus = document.activeElement;
  if (U._cleanup) { try { U._cleanup(); } catch (e) { console.error(e); } U._cleanup = null; }
  var view = document.getElementById('view');
  U.clear(view);
  U.closeSheets();
  // A celebration belongs to the screen it was for: it never follows Dan to the next one.
  Array.prototype.forEach.call(document.querySelectorAll('.cheer'), function (c) { c.remove(); });
  if (!r) { U._home(); return; }
  view.setAttribute('data-screen', bad ? 'none' : r.screen);
  U.focusMode(!!r.opts.focus);
  U.setTab(r.opts.tab || null);
  U.setTitle(typeof r.opts.title === 'string' ? r.opts.title : '');
  if (bad) { U.notHere(view); window.scrollTo(0, 0); U._focusScreen(view, seq, prevFocus); return; }
  var ctx = { view: view, hash: hash, alive: function () { return seq === U._routeSeq; } };
  try {
    var out = r.handler(params, ctx);
    if (out && typeof out.then === 'function') out.then(function (c) { if (typeof c === 'function') { if (ctx.alive()) U._cleanup = c; else c(); } }, function (e) { U.fail(view, e); });
    else if (typeof out === 'function') U._cleanup = out;
  } catch (e) { U.fail(view, e); }
  window.scrollTo(0, 0);
  U._focusScreen(view, seq, prevFocus);
};
// Move focus to the new screen's h1 once it exists (views may draw it after their data arrives),
// unless Dan has already put focus somewhere else in the meantime.
// A screen that draws its heading again a moment later (a header rebuilt when more of its data
// arrives) takes the focus along to the new heading, for the same few seconds.
U._focusScreen = function (view, seq, prevFocus) {
  var mo = null, timer = null, landed = null;
  function stop() { if (mo) mo.disconnect(); mo = null; clearTimeout(timer); }
  function untouched() {
    var a = document.activeElement;
    return !a || a === document.body || a === view || a === prevFocus || !a.isConnected;
  }
  function attempt() {
    if (seq !== U._routeSeq) { stop(); return true; }
    if (landed && landed.isConnected) {
      if (document.activeElement === landed) return false;   // still there: a redraw may yet replace it
      stop(); return true;                                    // Dan has moved on
    }
    if (!untouched()) { stop(); return true; }
    var h = view.querySelector('h1');
    if (!h || h.querySelector('.skeleton')) return false;
    if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
    try { h.focus({ preventScroll: true }); } catch (e) { /* fine */ }
    landed = h;
    return false;
  }
  if (attempt()) return;
  if (window.MutationObserver) { mo = new MutationObserver(attempt); mo.observe(view, { childList: true, subtree: true }); }
  timer = setTimeout(stop, 6000);
};
U.notHere = function (view) {
  U.clear(view).appendChild(U.h('div', { class: 'empty not-here' },
    U.h('h1', { class: 'not-here-h' }, 'This page is not here'),
    U.h('p', null, 'The link may be wrong, or what it pointed to has been removed.'),
    U.h('p', { class: 'not-here-go' }, U.h('a', { class: 'btn secondary', href: '#/' }, 'Go to Learn'))));
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

// ---------- radio groups ----------
// U.radios(group) -> group. The role="radio" buttons inside a role="radiogroup" behave as radios
// do (and as the kit's K.choice does): the group is one Tab stop (the checked option, else the
// first), and the arrow keys move the choice and the focus to the next or previous option,
// wrapping. A move clicks the option, so the group's own click handler picks it and sets
// aria-checked; the Tab stop follows the checked option after every click.
U.radios = function (group) {
  function all() { return Array.prototype.slice.call(group.querySelectorAll('[role="radio"]')); }
  function sync() {
    var list = all(), on = list.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0] || list[0];
    list.forEach(function (b) { b.tabIndex = b === on ? 0 : -1; });
  }
  group.addEventListener('keydown', function (e) {
    var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d || e.altKey || e.ctrlKey || e.metaKey) return;
    var list = all().filter(function (b) { return !b.disabled; }), i = list.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    var next = list[(i + d + list.length) % list.length];
    next.click();
    next.focus();
  });
  group.addEventListener('click', sync);   // bubbles here after the option's own handler ran
  sync();
  return group;
};

// ---------- toasts ----------
// The same message twice in a row extends the one on screen instead of stacking a copy.
U.toast = function (text, opts) {
  opts = opts || {};
  var box = document.getElementById('toasts');
  if (!box) return;
  var ms = opts.ms || (opts.kind === 'bad' ? 6000 : 3200);
  var cls = 'toast' + (opts.kind ? ' ' + opts.kind : '');
  var same = Array.prototype.filter.call(box.children, function (t) { return t.textContent === String(text) && t.className.replace(/ is-(cut|open)/g, '') === cls; })[0];
  if (same) { clearTimeout(same._t); same._t = setTimeout(same._drop, ms); return; }
  // The words sit in their own block: that is what gets cut to lines above a sheet (a flex item
  // cannot be cut itself).
  var t = U.h('div', { class: cls }, U.h('span', { class: 'toast-text' }, text));
  t._drop = function () { t.remove(); U._fitToasts(); };   // an older toast may show again
  // A toast cut short above an open sheet (U._fitToasts) shows the rest on a tap, and stays
  // up a while longer to be read; another tap folds it again.
  t.addEventListener('click', function () {
    if (!t.classList.contains('is-cut') && !t.classList.contains('is-open')) return;
    t.classList.toggle('is-open');
    clearTimeout(t._t); t._t = setTimeout(t._drop, Math.max(ms, 6000));
  });
  box.appendChild(t);
  t._t = setTimeout(t._drop, ms);
  U._fitToasts();
};
// While a bottom sheet is open on a phone, toasts sit at the top of the screen (10-base.css):
// above the scrim, where the sheet does not reach. They may run down over the sheet's rounded top
// and grip, never onto its heading or Close: the newest toast shows as many whole lines as fit
// there (--toast-lines) and is marked is-cut when that is not all of it.
U._fitToasts = function () {
  if (typeof document === 'undefined') return;
  var box = document.getElementById('toasts'), d = document.documentElement;
  if (!box || !d) return;
  var top = U._sheets[U._sheets.length - 1], phone = d.getAttribute('data-layout') !== 'laptop';
  var list = Array.prototype.slice.call(box.children);
  if (!top || !phone || !d.classList.contains('sheet-open')) {
    box.style.removeProperty('--toast-lines');
    list.forEach(function (t) { t.classList.remove('is-cut', 'is-open'); });
    return;
  }
  var t = list[list.length - 1];
  if (!t) return;
  // Where the heading rests (its layout box: the sheet's opening slide is a transform, not counted).
  var sheet = top.el, head = sheet.querySelector('.sheet-head');
  var view = window.innerHeight;
  var limit = view - sheet.offsetHeight + (head ? head.offsetTop : 0) - 6;
  var cs = getComputedStyle(t), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4 || 20, words = t.firstChild || t;
  var room = limit - box.getBoundingClientRect().top - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
  box.style.setProperty('--toast-lines', String(Math.max(1, Math.floor(room / lh))));
  list.forEach(function (x) { if (x !== t) x.classList.remove('is-cut'); });
  t.classList.toggle('is-cut', !t.classList.contains('is-open') && words.scrollHeight > words.clientHeight + 1);
};
(function () {
  if (typeof window === 'undefined' || !window.addEventListener) return;
  window.addEventListener('resize', function () { U._fitToasts(); });
  U.on('prefs', function () { setTimeout(U._fitToasts, 0); });     // text size changed in Settings
  U.on('layout', function () { U._fitToasts(); });
})();
// Plain words for an error. Errors from saved data (tagged where:'db' by the store) never blame Claude.
U.errText = function (e) {
  var code = e && e.code;
  if (e && e.where === 'db') {
    if (code === 'quota_exceeded') return 'Your University storage is full. Delete an old topic to make room.';
    if (/^(unavailable|timeout|resource_exhausted|deadline_exceeded|aborted|internal)$/.test(code || '')) return 'Your saved work could not be reached just now. Check your connection, then try again.';
    if (/^(permission_denied|not_granted|revoked)$/.test(code || '')) return 'Saving is not allowed in this view.';
    if (code === 'invalid_argument') return 'That could not be saved because it was not in the right form.';
  }
  if (code === 'not_granted') return 'Claude needs your permission for this. Tap allow when the app asks.';
  if (code === 'rate_limited') return 'Claude is busy right now. Wait a moment and try again.';
  if (code === 'cancelled') return 'Stopped.';
  if (code === 'quota_exceeded') return 'Your University storage is full. Delete an old topic to make room.';
  if (code === 'unavailable' || code === 'timeout') return 'Claude could not be reached. Check your connection and try again.';
  if (code === 'upstream_error' || code === 'overloaded') return 'Claude ran into a problem on its side. Try again in a moment.';
  if (code === 'session_expired') return 'Your Claude session has ended. Close and reopen the app, then try again.';
  if (code === 'refused') return 'Claude would not answer this one. Try asking it a different way.';
  if (code === 'empty_completion') return 'Claude sent back an empty answer. Try again.';
  if (code === 'prompt_too_large') return 'This was too long for Claude to read in one go.';
  if (code === 'truncated') return 'Claude\'s answer was cut off. Try again.';
  return (e && (e.message || e.code)) ? String(e.message || e.code) : 'Something went wrong.';
};

// ---------- sheets ----------
// U.sheet({title, body, actions:[{label, kind, onClick(api)}], onClose, autofocus, key}) -> api
// A modal bottom sheet (a centred dialog on wide screens). While any sheet is open the app behind
// it is inert, Tab stays inside the top sheet and the page behind does not scroll. Focus moves into
// the sheet (its first field or button, or its heading when autofocus is false) and returns to
// where it was on close. Opening a sheet with the same key (default: its title) as one already open
// brings that one forward instead of stacking a copy. U.closeSheets() (every route change) runs each
// open sheet's full close: listeners removed, onClose called, a pending confirmSheet settles false.
U._sheets = [];
U._syncSheets = function () {
  var open = U._sheets.length > 0, app = document.getElementById('app');
  document.documentElement.classList.toggle('sheet-open', open);
  if (app) { if (open) app.setAttribute('inert', ''); else app.removeAttribute('inert'); }  U._fitToasts();
};
U.closeSheets = function () {
  U._sheets.slice().reverse().forEach(function (api) { try { api.close({ quiet: true }); } catch (e) { console.error(e); } });
  var root = document.getElementById('sheets');
  if (root) U.clear(root);
  U._sheets = [];
  U._syncSheets();
};
U.sheet = function (o) {
  var key = o.key || ('title:' + (o.title || ''));
  var open = U._sheets.filter(function (s) { return s.key === key; })[0];
  if (open) { open.focus(); return open; }
  var root = document.getElementById('sheets');
  var prevFocus = document.activeElement;
  var scrim = U.h('div', { class: 'scrim' });
  var titleId = U.id('sh');
  var closed = false;
  var actions = (o.actions || []).map(function (a) {
    return U.h('button', { class: 'btn small ' + (a.kind || 'secondary'), type: 'button', on: { click: function () { a.onClick ? a.onClick(api) : api.close(); } } }, a.label);
  });
  var grip = U.h('div', { class: 'sheet-grip', 'aria-hidden': 'true' });
  var title = U.h('h2', { id: titleId, tabindex: '-1' }, o.title || '');
  var head = U.h('div', { class: 'sheet-head' }, title,
    U.h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', on: { click: function () { api.close(); } } }, U.icon('close')));
  var box = U.h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    U.h('div', { class: 'sheet-in' }, grip, head,
      o.body || null,
      actions.length ? U.h('div', { class: 'sheet-actions' }, actions) : null));
  function top() { return U._sheets[U._sheets.length - 1] === api; }
  function focusables() {
    return Array.prototype.filter.call(box.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }
  function onKey(e) {
    if (!top()) return;
    if (e.key === 'Escape') { e.preventDefault(); api.close(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) { e.preventDefault(); title.focus(); return; }
    var first = f[0], last = f[f.length - 1], a = document.activeElement;
    if (!box.contains(a)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && (a === first || a === title)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
  }
  // Swipe down on the grip or the heading closes the sheet on a phone.
  var drag = null;
  function narrow() { return document.documentElement.getAttribute('data-layout') !== 'laptop'; }
  function down(e) {
    if (!narrow() || (e.button != null && e.button !== 0) || (e.target.closest && e.target.closest('button'))) return;
    drag = { y: e.clientY, dy: 0 };
    box.style.transition = 'none';
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
  }
  function move(e) { if (!drag) return; drag.dy = Math.max(0, e.clientY - drag.y); box.style.transform = drag.dy ? 'translateY(' + drag.dy + 'px)' : ''; }
  function up() {
    if (!drag) return;
    var dy = drag.dy; drag = null;
    box.style.transition = ''; box.style.transform = '';
    if (dy > 90) api.close();
  }
  [grip, head].forEach(function (el) {
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });
  var api = {
    el: box, key: key,
    focus: function () {
      var f = o.autofocus !== false ? box.querySelector('textarea, input, button.btn') : null;
      try { (f || title).focus({ preventScroll: !!f }); } catch (e) { /* fine */ }
    },
    // close({quiet}) - quiet when a route change closes it: focus is not sent back to the old screen.
    close: function (opts) {
      if (closed) return;
      closed = true;
      scrim.remove(); box.remove(); document.removeEventListener('keydown', onKey);
      if (resized) resized.disconnect();
      U._sheets = U._sheets.filter(function (s) { return s !== api; });
      U._syncSheets();
      if (o.onClose) try { o.onClose(); } catch (e) { console.error(e); }
      if (!(opts && opts.quiet) && prevFocus && prevFocus.isConnected && prevFocus.focus) try { prevFocus.focus({ preventScroll: true }); } catch (e) { /* fine */ }
    },
  };
  scrim.addEventListener('click', function () { api.close(); });
  document.addEventListener('keydown', onKey);
  root.appendChild(scrim); root.appendChild(box);
  U._sheets.push(api);
  U._syncSheets();
  // A sheet that grows or shrinks (an answer arriving) moves its heading: refit any toast above it.
  var resized = typeof ResizeObserver === 'function' ? new ResizeObserver(function () { if (top()) U._fitToasts(); }) : null;
  if (resized) resized.observe(box);
  setTimeout(function () { if (!closed && top() && !box.contains(document.activeElement)) api.focus(); }, 60);
  return api;
};
// U.confirmSheet({title, text, confirm, cancel, danger}) -> Promise<boolean>. Asking the same
// question again while it is open returns the pending answer instead of a second sheet.
U.confirmSheet = function (o) {
  var key = 'confirm:' + (o.title || '');
  var open = U._sheets.filter(function (s) { return s.key === key; })[0];
  if (open && open.answer) { open.focus(); return open.answer; }
  var s = null;
  var answer = new Promise(function (resolve) {
    var done = false;
    s = U.sheet({
      key: key, title: o.title, body: U.h('p', { class: 'muted' }, o.text || ''), autofocus: false,
      onClose: function () { if (!done) { done = true; resolve(false); } },
      actions: [
        { label: o.cancel || 'Cancel', kind: 'secondary', onClick: function (api) { done = true; resolve(false); api.close(); } },
        { label: o.confirm || 'OK', kind: o.danger ? 'danger' : 'primary', onClick: function (api) { done = true; resolve(true); api.close(); } },
      ],
    });
  });
  if (s) s.answer = answer;
  return answer;
};

// ---------- feedback ----------
U.haptic = function (pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern || 12); } catch (e) {} };
U.cheer = function (text) {
  var c = U.h('div', { class: 'cheer', 'aria-hidden': 'true' }, U.h('div', { class: 'cheer-bubble' }, U.icon('tick')), text ? U.h('p', { class: 'cheer-text' }, text) : null);
  document.body.appendChild(c);
  U.haptic([10, 40, 18]);
  setTimeout(function () { c.remove(); }, 1700);
};
