// Course pictures: a cover picture for each course, drawn by an image model (Z-Image Turbo)
// through Dan's Hugging Face connector, and shown wherever the course's cover is (V.cover: Learn,
// the topic page, the Map, the Book) and as the frontispiece of its dossier. Decoration only: it
// teaches nothing, so it is said to be drawn by an image model, and nothing waits for it.
//
//   U.art.SERVER, U.art.TOOL      the connector ('Claude MCP', as named in claude.ai) and its tool
//   U.art.shown()                 pictures are on screen: prefs.pictures is not false
//   U.art.wanted()                pictures are drawn: Dan said yes (prefs.pictures === true)
//   U.art.asked()                 he has said yes or no (prefs.pictures is true or false)
//   U.art.turnOn() -> Promise<'on'|'denied'>   yes: asks for the connector now;  U.art.turnOff()
//   U.art.available() -> Promise<bool>   the connector is here with the image tool (cached; reset())
//   U.art.doc(tid)                the course's art doc as last seen, or null
//   U.art.src(tid)                its picture (a data URL) when shown and ready, else null
//   U.art.state(tid)              'ready' | 'making' | 'queued' | 'failed' | 'none'
//   U.art.paint(svg, tid)         puts the picture into a V.cover svg, now and whenever it changes
//   U.art.want(topics)            queues pictures for planned courses that have none; one at a time
//   U.art.make(tid, {force}) -> Promise<'ready'|'busy'|'off'|'unavailable'|'gone'>   draws one now
//            (force: Dan asked, on the topic page: runs even over an older picture, in the foreground)
//   U.art.remove(tid)             deletes it (with its course, unless the course's dossier is kept)
//   U.art.prompt(scene)           (pure) the image model's prompt: the scene, then the house style
//   U.art.fromResult(result)      (pure) the picture in a tool result: {data, mime} | {url} | null
//   U.art.why(doc)                what to tell Dan when it failed, in plain words
// Emits 'art' {tid} when a course's picture or state changes.
//
// The doc art/{tid} (shared, 20-store.js S.art): {status: 'making'|'ready'|'failed', src (a WebP or
// JPEG data URL, 800x450, under MAX characters), scene, model, seed, at, by (the page drawing it,
// while making), code (when failed), updatedAt}. A new attempt keeps the old picture until the new
// one is saved.
(function () {
  'use strict';
  var U = window.U;
  var SERVER = 'Claude MCP', TOOL = 'gr1_z_image_turbo_generate', MODEL = 'Z-Image Turbo';
  var W = 800, H = 450, MAX = 190000;
  var LEASE_MS = 4 * 60000;        // another page's 'making' counts as under way this long
  var RETRY_MS = 24 * 3600000;     // a failed picture is tried again by itself after a day
  var CALL_MS = 150000;            // the image call's own limit (the Space may queue)
  var STYLE = 'Illustration in the style of a naturalist\'s field journal: fine ink line drawing with soft watercolour washes on warm cream paper, filling the whole picture edge to edge, muted sepia with touches of navy blue and teal, calm and uncluttered. No book, no page edges, no border, no frame. No text, no letters, no numbers, no labels, no words, no signature.';
  var NS = 'http://www.w3.org/2000/svg';
  var RASTER = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/;
  var PAGE = 'art-' + Math.random().toString(36).slice(2, 10);

  var docs = {}, loaded = false, stop = null, live = {}, queue = [], busy = null, avail = null;
  var halted = false;      // the connector said no (not allowed, not connected): no more tries this visit
  var triedHere = {};      // tid -> true once this page has tried it by itself
  var lastTopics = null;   // what want() was last given, kept until the docs have loaded

  function pref() { var p = U.settings && U.settings.prefs; return p ? p.pictures : null; }
  function shown() { return pref() !== false; }
  function wanted() { return pref() === true; }
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function age(at) { var t = Date.parse(at || ''); return isFinite(t) ? Date.now() - t : Infinity; }

  // ---------- pure ----------
  function prompt(scene) {
    var s = String(scene || '').replace(/\s+/g, ' ').trim().replace(/[\s.]+$/, '');
    return (s ? s + '. ' : '') + STYLE;
  }
  // The picture in a tool result: an image block ({type:'image', data, mimeType}, or the
  // {source:{data, media_type}} spelling), else a link to one in its text or payload.
  function fromResult(r) {
    if (!isObj(r)) return null;
    var blocks = Array.isArray(r.content) ? r.content : [];
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (!isObj(b) || b.type !== 'image') continue;
      var src = isObj(b.source) ? b.source : b;
      var data = typeof src.data === 'string' ? src.data.replace(/\s+/g, '') : '';
      var mime = String(src.mimeType || src.media_type || b.mimeType || '');
      if (data.length > 100 && /^[A-Za-z0-9+/=]+$/.test(data)) return { data: data, mime: /^image\/(png|jpeg|webp|gif)$/.test(mime) ? mime : 'image/webp' };
    }
    var text = blocks.filter(function (b) { return isObj(b) && b.type === 'text' && typeof b.text === 'string'; }).map(function (b) { return b.text; }).join('\n');
    if (r.payload !== undefined) try { text += '\n' + (typeof r.payload === 'string' ? r.payload : JSON.stringify(r.payload)); } catch (e) { /* not JSON */ }
    var m = text.match(/https:\/\/[^\s"'<>)\]]+?\.(?:webp|png|jpe?g)(?=[\s"'<>)\]?#]|$)/i);
    return m ? { url: m[0] } : null;
  }
  function seedOf(r) {
    var text = '';
    try { text = JSON.stringify(r && (r.content || r.payload)); } catch (e) { return null; }
    var m = String(text).match(/seed[^0-9]{0,40}?(\d{1,16})/i);
    return m ? Number(m[1]) : null;
  }
  // Said to Dan when a picture could not be drawn (doc.code), in plain words.
  function why(d) {
    var c = d && d.code;
    if (c === 'not_in_manifest' || c === 'denied') return 'the Hugging Face connector is not allowed for this app.';
    if (c === 'server_not_connected' || c === 'needs_reauth' || c === 'unavailable') return 'the Hugging Face connector (Claude MCP) is not connected.';
    if (c === 'timeout' || c === 'server_unavailable') return 'the image model did not answer in time.';
    if (c === 'no_image' || c === 'bad_image' || c === 'too_big') return 'the image model sent back no picture that could be used.';
    return 'something went wrong on the way.';
  }

  // ---------- the docs, and the covers on screen ----------
  function start() {
    if (stop || !U.store || !U.store.art) return;
    stop = U.store.art.watch(function (all) {
      var before = docs;
      docs = isObj(all) ? all : {};
      loaded = true;
      Object.keys(Object.assign({}, before, docs)).forEach(function (tid) {
        var a = before[tid] || {}, b = docs[tid] || {};
        if (a.src !== b.src || a.status !== b.status || a.at !== b.at) changed(tid, a.src !== b.src);
      });
      if (lastTopics) want(lastTopics);
    }, function (e) { console.warn('art: watch', e && (e.code || e.message)); });
  }
  // Saved work answered late (10-runtime.js 'rt-late'): read the real collection.
  U.on('rt-late', function () { if (stop) { try { stop(); } catch (e) { /* gone */ } stop = null; loaded = false; start(); } });
  // Turned on or off (here or on another device), or the profile read at boot: covers follow, and
  // the courses still without a picture are queued.
  U.on('prefs', function () {
    Object.keys(live).forEach(function (tid) { repaint(tid, false); });
    if (wanted() && lastTopics) want(null);
  });

  function doc(tid) { start(); return isObj(docs[tid]) ? docs[tid] : null; }
  function src(tid) {
    if (!shown()) return null;
    var d = doc(tid);
    return d && typeof d.src === 'string' && d.src.length <= MAX * 1.1 && RASTER.test(d.src) ? d.src : null;
  }
  function state(tid) {
    var d = doc(tid);
    if (busy === tid || (d && d.status === 'making' && age(d.at) < LEASE_MS)) return 'making';
    if (queue.indexOf(tid) >= 0) return 'queued';
    if (d && d.status === 'failed') return 'failed';
    return src(tid) ? 'ready' : 'none';
  }
  function changed(tid, pic) { repaint(tid, pic); U.emit('art', { tid: tid }); }

  function draw(svg, url, fresh) {
    var img = svg.querySelector('image.cv-art');
    if (!url) { if (img) img.remove(); svg.classList.remove('has-art'); return; }
    if (!img) {
      img = document.createElementNS(NS, 'image');
      img.setAttribute('class', 'cv-art' + (fresh ? ' cv-new' : ''));
      img.setAttribute('x', '0'); img.setAttribute('y', '0'); img.setAttribute('width', '320'); img.setAttribute('height', '180');
      img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      svg.appendChild(img);
    }
    if (img.getAttribute('href') !== url) img.setAttribute('href', url);
    svg.classList.add('has-art');
  }
  function paint(svg, tid) {
    if (!svg || !tid) return;
    live[tid] = (live[tid] || []).filter(function (s) { return s.isConnected; });
    live[tid].push(svg);
    draw(svg, src(tid), false);
  }
  function repaint(tid, fresh) {
    if (!live[tid]) return;
    live[tid] = live[tid].filter(function (s) { return s.isConnected; });
    var url = src(tid);
    live[tid].forEach(function (s) { draw(s, url, fresh); });
    if (!live[tid].length) delete live[tid];
  }

  // ---------- the connector ----------
  function available() {
    var mcp = U.rt && U.rt.mcp;
    if (!mcp) return Promise.resolve(false);
    if (avail) return avail;
    avail = Promise.resolve().then(function () { return mcp.listTools(SERVER); }).then(function (r) {
      var list = r && Array.isArray(r.servers) ? r.servers : [];
      var sv = list.filter(function (x) { return x && (x.server === SERVER || x.name === SERVER); })[0] || list[0];
      var names = sv && Array.isArray(sv.tools) ? sv.tools.map(function (t) { return t && t.name; }) : [];
      return names.indexOf(TOOL) >= 0 && sv.authStatus !== 'needs_reauth';
    }, function () { return false; });
    return avail;
  }
  function reset() { avail = null; halted = false; triedHere = {}; }

  function timeout(p, ms) {
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { rej({ code: 'timeout', message: 'The image model did not answer in time.' }); }, ms);
      p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }
  // The scene, from Claude (quick, and in the background unless Dan asked); the title if not.
  function sceneFor(topic, fg) {
    var plain = 'A calm still life of real objects and a setting that bring to mind ' + String(topic.title || topic.query || 'learning').slice(0, 120);
    if (!U.ask || !U.prompts || !U.prompts.coverPicture) return Promise.resolve(plain);
    return U.ask(U.prompts.coverPicture(topic), { tier: 'quick', json: true, label: 'cover-picture', schema: U.validate.cover, priority: fg ? 'foreground' : 'background' })
      .then(function (o) { return o && typeof o.scene === 'string' && o.scene.trim() ? o.scene.trim().slice(0, 400) : plain; }, function (e) {
        console.warn('art: scene', e && (e.code || e.message));
        return plain;
      });
  }
  function readUrl(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); }).then(function (b) {
      return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result)); }; fr.onerror = rej; fr.readAsDataURL(b); });
    }).catch(function () { throw { code: 'no_image', message: 'The picture could not be fetched.' }; });
  }
  function encode(c, q) { var u = c.toDataURL('image/webp', q); return /^data:image\/webp/.test(u) ? u : c.toDataURL('image/jpeg', q); }
  // Cropped to 16:9 around the middle, W x H, WebP (JPEG where the browser cannot write WebP).
  function shrink(dataUrl) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth, h = img.naturalHeight, r = W / H, sx = 0, sy = 0, sw = w, sh = h;
          if (!w || !h) throw new Error('empty');
          if (w / h > r) { sw = h * r; sx = (w - sw) / 2; } else { sh = w / r; sy = (h - sh) / 2; }
          var out = null;
          [[W, H, 0.8], [W, H, 0.62], [640, 360, 0.6]].some(function (t) {
            var c = document.createElement('canvas');
            c.width = t[0]; c.height = t[1];
            c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, t[0], t[1]);
            out = encode(c, t[2]);
            return out.length <= MAX;
          });
          if (!out || out.length > MAX || !RASTER.test(out)) return rej({ code: 'too_big', message: 'The picture was too large to keep.' });
          res(out);
        } catch (e) { rej({ code: 'bad_image', message: 'The picture could not be read.' }); }
      };
      img.onerror = function () { rej({ code: 'bad_image', message: 'The picture could not be read.' }); };
      img.src = dataUrl;
    });
  }

  // ---------- drawing one ----------
  function make(tid, opts) {
    opts = opts || {};
    if (!wanted() && !opts.force) return Promise.resolve('off');
    start();
    return available().then(function (ok) {
      if (!ok) return 'unavailable';
      return U.store.topic.get(tid).then(function (topic) {
        if (!topic || topic.status !== 'ready') return 'gone';
        var old = doc(tid);
        if (old && old.status === 'making' && old.by !== PAGE && age(old.at) < LEASE_MS) return 'busy';
        var keep = old && old.src && RASTER.test(old.src) ? { src: old.src, scene: old.scene || null, model: old.model || MODEL, seed: old.seed == null ? null : old.seed } : {};
        var claim = Object.assign({}, keep, { status: 'making', at: U.now(), by: PAGE });
        docs[tid] = claim; changed(tid, false);
        var scene = null, seed = null;
        return U.store.art.set(tid, Object.assign({}, claim)).then(function (saved) {
          if (!saved) throw { code: 'gone' };
          return sceneFor(topic, !!opts.force);
        }).then(function (sc) {
          scene = sc;
          var input = { prompt: prompt(scene), resolution: '1280x720 ( 16:9 )', steps: 8, random_seed: true };
          return timeout(Promise.resolve().then(function () { return U.rt.mcp.callTool(SERVER, TOOL, input, { cache: false }); }), CALL_MS);
        }).then(function (r) {
          seed = seedOf(r);
          var pic = fromResult(r);
          if (!pic) throw { code: 'no_image', message: 'No picture came back.' };
          return pic.data ? 'data:' + pic.mime + ';base64,' + pic.data : readUrl(pic.url);
        }).then(shrink).then(function (url) {
          var done = { status: 'ready', src: url, scene: scene, model: MODEL, seed: seed, at: U.now() };
          return U.store.art.set(tid, done).then(function (saved) {
            if (!saved) return 'gone';
            docs[tid] = saved; changed(tid, true);
            return 'ready';
          });
        }).catch(function (e) {
          var code = (e && e.code) || 'failed';
          if (code === 'gone') { if (docs[tid] === claim) { delete docs[tid]; changed(tid, false); } return 'gone'; }
          console.warn('art: could not draw', tid, code, e && e.message);
          if (/^(not_in_manifest|server_not_connected|needs_reauth|not_granted|capability_disabled|blocked_by_policy|selection_required)$/.test(code)) halted = true;
          if (code === 'needs_reauth' || code === 'server_not_connected') avail = null;
          var bad = Object.assign({}, keep, { status: 'failed', code: code, at: U.now() });
          docs[tid] = bad; changed(tid, false);
          return U.store.art.set(tid, bad).catch(function () { /* said on screen already */ }).then(function () { throw { code: code, message: (e && e.message) || why(bad) }; });
        });
      });
    });
  }

  // ---------- by itself: the courses that have none ----------
  function due(tid) {
    if (triedHere[tid] || busy === tid || queue.indexOf(tid) >= 0) return false;
    var d = doc(tid);
    if (!d) return true;
    if (d.status === 'ready') return !src(tid);
    if (d.status === 'making') return age(d.at) > LEASE_MS;
    if (d.status === 'failed') return age(d.at) > RETRY_MS;
    return true;
  }
  function want(topics) {
    lastTopics = Array.isArray(topics) ? topics : lastTopics;
    if (!wanted() || halted || !U.rt || !U.rt.mcp) return;
    start();
    if (!loaded) return;   // decided once the docs are here (start's first snapshot calls again)
    var before = queue.length;
    (lastTopics || []).forEach(function (t) {
      if (t && t.id && t.status === 'ready' && Array.isArray(t.ideas) && t.ideas.length && due(t.id)) queue.push(t.id);
    });
    if (queue.length !== before) queue.slice(before).forEach(function (tid) { U.emit('art', { tid: tid }); });
    pump();
  }
  function pump() {
    if (busy || !queue.length || halted || !wanted()) return;
    var tid = busy = queue.shift();
    triedHere[tid] = true;
    U.emit('art', { tid: tid });
    make(tid, {}).catch(function () { /* recorded in the doc */ }).then(function () {
      busy = null;
      U.emit('art', { tid: tid });
      if (halted) { var left = queue.splice(0); left.forEach(function (t) { U.emit('art', { tid: t }); }); }
      setTimeout(pump, 1500);
    });
  }

  // Dan says yes (Learn's invitation, Settings). The connector is asked for at once, while he is
  // looking, so its consent never pops up later in the middle of something else. A "no" there
  // turns pictures off again. -> Promise<'on'|'denied'>
  function turnOn() {
    if (U.settings) U.settings.set('pictures', true);
    reset();
    var perms = U.rt && U.rt.permissions, name = 'mcp:' + SERVER;
    var ask = perms ? Promise.resolve().then(function () { return perms.request([name]); }).then(function (m) { return m && m[name]; }, function () { return null; }) : Promise.resolve(null);
    return ask.then(function (st) {
      if (st === 'denied') {
        if (U.settings) U.settings.set('pictures', false);
        return 'denied';
      }
      want(null);
      return 'on';
    });
  }
  function turnOff() {
    if (U.settings) U.settings.set('pictures', false);
    queue.splice(0).forEach(function (t) { U.emit('art', { tid: t }); });
  }

  function remove(tid) {
    delete docs[tid];
    queue = queue.filter(function (t) { return t !== tid; });
    return U.store.art.remove(tid);
  }

  U.art = {
    SERVER: SERVER, TOOL: TOOL, MODEL: MODEL, STYLE: STYLE, MAX: MAX, W: W, H: H,
    shown: shown, wanted: wanted, asked: function () { return typeof pref() === 'boolean'; },
    available: available, reset: reset, turnOn: turnOn, turnOff: turnOff,
    doc: doc, src: src, state: state, paint: paint, want: want, make: make, remove: remove,
    prompt: prompt, fromResult: fromResult, seedOf: seedOf, why: why,
    halted: function () { return halted; },
  };
})();
