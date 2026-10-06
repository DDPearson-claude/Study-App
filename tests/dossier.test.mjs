// Unit tests for the course dossier (app/src/js/75-dossier.js) over the data layer and the real
// runtime stub's db (tools/harness/claude-stub.js), in a VM page with no DOM. Checks: a chapter
// keeps only the lesson's own teaching (nothing Dan wrote, chose or scored, not even his query,
// and no test question: v9 keeps "Put it into practice" instead); practice sorted into the
// journal's parts by fixed rules, word for word; a
// plate too big for one doc is left out with a note; Learn it again binds the newest edition;
// ideas finished before dossiers existed are bound from the stored lessons (backfill), only where
// the course keeps one; the index; keep and remove; the model's glossary, bibliography and page
// order; and the router's screen for dossier pages.
// Run: node --test tests/*.test.mjs
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const fx = (n) => JSON.parse(read('tests/fixtures/lesson-ui-' + n + '.json'));
const plain = (o) => JSON.parse(JSON.stringify(o));
const quiet = { log() {}, info() {}, warn() {}, error() {}, debug() {} };
const UID = 'u1';
const P = (rest) => `data/users/${UID}/profile/${rest}`;
// Page timers are unref'd (a failed test never leaves the process running); this keeps it alive
// while a test runs.
let keepAlive = null;
beforeEach(() => { keepAlive = setInterval(() => {}, 1000); });
afterEach(() => { clearInterval(keepAlive); });

async function page(seed = {}) {
  const sctx = vm.createContext({ console: quiet, setTimeout, clearTimeout, JSON, Math, Promise, Date });
  vm.runInContext('var window = globalThis;', sctx);
  vm.runInContext(read('tools/harness/claude-stub.js'), sctx, { filename: 'claude-stub.js' });
  const db = await vm.runInContext('window.claude.use("db")', sctx);
  const stub = vm.runInContext('window.__CLAUDE_STUB__', sctx);
  for (const [p, d] of Object.entries(seed)) stub.seed(p, d);
  const later = (f, ms, ...a) => { const t = setTimeout(f, ms, ...a); if (t.unref) t.unref(); return t; };
  const ctx = vm.createContext({
    console: quiet, setTimeout: later, clearTimeout, setInterval: (f, ms) => { const t = setInterval(f, ms); if (t.unref) t.unref(); return t; }, clearInterval,
    JSON, Math, Promise, Date, crypto: globalThis.crypto, navigator: {},
    claude: { use: (name) => Promise.resolve(name === 'db' ? db : name === 'user' ? { id: () => Promise.resolve(UID) } : null) },
    addEventListener() {}, removeEventListener() {},
  });
  vm.runInContext('var window = globalThis;', ctx);
  for (const f of ['00-core.js', '10-runtime.js', '20-store.js', '75-dossier.js']) vm.runInContext(read('app/src/js/' + f), ctx, { filename: f });
  const U = ctx.U;
  U.toast = () => {};
  await U.rt.ready;
  const get = (p) => { const d = stub.get(p); return d === undefined ? null : plain(d); };
  const paths = () => Object.keys(plain(stub.dump ? stub.dump() : {}));
  return { U, get, stub, paths };
}

// A course with Dan's own words planted everywhere they live: his query, his guesses, his
// say-it-back, his answers, his questions, his "This looks wrong" note and Learn it again request.
const DAN = 'DANWORDS';
// A lesson's "Put it into practice" (lesson.practice, v9), as write-lesson writes it.
const PRACTICE = '**Steps**\n1. Measure from the pivot to the middle of the bob.\n2. Time ten swings and divide by ten.\n\n**Rule of thumb:** four times the length, twice the time.\n\n**Worked example:** a 1 m pendulum swings in about 2 s[^1], so a 4 m one takes about 4 s.\n\n**Common mistakes**\n- Timing a single swing: your reaction time swamps it.\n- Measuring to the top of the bob.';
function course({ option = undefined, extra = {} } = {}) {
  const topic = { ...fx('topic'), query: DAN + '-query typed by Dan' };
  const lesson = (doc, mark) => {
    const d = plain(doc);
    d.feedback = DAN + '-feedback'; d.request = DAN + '-request'; d.flags = { k1: { note: DAN + '-flag', at: '2026-09-01', stage: 'play' } };
    d.lesson.predict.q = d.lesson.predict.q + ' ' + DAN + '-predictq';
    d.lesson.say.model = DAN + '-saymodel'; d.lesson.say.prompt = DAN + '-sayprompt';
    if (mark) d.lesson.explain.text += '\n\n' + mark;
    return d;
  };
  const at = (d) => `2026-09-${d}T10:00:00.000Z`;
  const progress = { updatedAt: at('20'), lastIdea: 'i3', calibration: { c1: 1 },
    questions: { q1: { q: DAN + '-question', iid: 'i1', at: at('03') } },
    ideas: {
      i1: { stage: 'done', round: 0, startedAt: at('02'), doneAt: at('03'), predict: { answer: DAN + '-guess', at: at('02') },
        say: { k1: { text: DAN + '-say', at: at('03'), verdict: 'partly', met: [true, false] } }, checks: { c1: { correct: false, at: at('03') } } },
      i2: { stage: 'done', round: 0, startedAt: at('04'), doneAt: at('05') },
      i3: { stage: 'done', round: 1, startedAt: at('06'), doneAt: at('07'), relearnId: 'r1', relearnNote: DAN + '-relearn' },
      i4: { stage: 'checks', round: 0, startedAt: at('08') },
    } };
  if (option !== undefined) progress.dossier = option;
  return {
    'topics/pendulums': topic,
    'topics/pendulums/lessons/i1': (() => { const d = lesson(fx('pendulum')); d.lesson.practice = { text: PRACTICE }; return d; })(),
    'topics/pendulums/lessons/i2': { ...lesson(fx('pendulum')), status: 'building' },   // not whole: never bound
    'topics/pendulums/lessons/i3': lesson(fx('small-swings')),
    'topics/pendulums/research/topic': { notes: [{ claim: 'x', sourceIds: [1] }], sources: fx('pendulum').lesson.sources, at: at('01') },
    'topics/pendulums/research/i1': { notes: [{ claim: 'y', sourceIds: [9] }], sources: [{ n: 9, title: 'Pendulum clocks — Science Museum', url: 'https://www.sciencemuseum.org.uk/pendulum', quote: 'Huygens built one in 1656.' }], at: at('01') },
    [P('progress/pendulums')]: progress,
    ...extra,
  };
}
function dossierDocs(t) { return t.paths().filter((p) => p.includes('/dossiers/')); }

test('a chapter keeps only the lesson\'s own teaching: nothing Dan wrote, chose or scored, and no test question', async () => {
  const t = await page(course());
  const n = await t.U.dossier.sync('pendulums');
  assert.equal(n, 1, 'one chapter bound (i1); i2 is not whole, i3 has an open Learn it again request');
  const docs = dossierDocs(t);
  assert.deepEqual(docs.sort(), [P('dossiers/pendulums'), P('dossiers/pendulums/chapters/i1')].sort());
  const all = JSON.stringify(docs.map(t.get));
  assert.ok(!all.includes(DAN), 'no word of Dan\'s anywhere in the dossier: ' + (all.match(/DANWORDS[-\w]*/g) || []).join(', '));
  const ch = t.get(P('dossiers/pendulums/chapters/i1'));
  for (const k of ['predict', 'say', 'checks']) assert.ok(!(k in ch.lesson), 'the lesson\'s ' + k + ' is a question for Dan, not chapter content');
  for (const k of ['feedback', 'request', 'flags', 'checks', 'stage', 'verdict']) assert.ok(!(k in ch), k + ' is not kept');
  const kept = JSON.stringify(ch);
  for (const c of fx('pendulum').lesson.checks) {
    assert.ok(!kept.includes(c.q), 'no test question in the snapshot: ' + c.q);
    for (const m of Object.values(c.misconception || {})) assert.ok(!kept.includes(m), 'no trap either: ' + m);
  }
  assert.equal(ch.lesson.explain.text, fx('pendulum').lesson.explain.text, 'the explanation, word for word');
  assert.deepEqual(ch.lesson.practice, { text: PRACTICE }, 'Put it into practice, word for word');
  assert.equal(ch.plate, fx('pendulum').interactive.html, 'the plate is the lesson\'s interactive');
  assert.equal(ch.doneAt, '2026-09-03T10:00:00.000Z', 'learned on: the idea\'s doneAt');
  assert.equal(ch.edition, 1);
  const idx = t.get(P('dossiers/pendulums'));
  assert.equal(idx.title, 'Why pendulums keep time', 'the plan\'s title, never the query');
  assert.equal(idx.startedAt, '2026-09-02T10:00:00.000Z', 'begun: the earliest startedAt');
  assert.equal(idx.count, 1); assert.equal(idx.total, 5); assert.ok(!idx.finishedAt, 'not finished');
  assert.deepEqual(Object.keys(idx.chapters), ['i1']);
  assert.ok(idx.research.sources.some((s) => s.url === 'https://www.sciencemuseum.org.uk/pendulum'), 'the research is kept for the bibliography');
  assert.deepEqual(idx.research.ideas.i1.length, 1, 'with the sources each idea\'s research rests on');
  assert.equal(await t.U.dossier.sync('pendulums'), 0, 'a second backfill in the same page load does nothing');
});

test('practice is sorted into the journal\'s parts by fixed rules, word for word', async () => {
  const { U } = await page();
  const kinds = (t) => plain(U.dossier.practiceParts(t)).map((p) => p.kind + (p.label ? ':' + p.label : '') + '=' + p.paras.concat(p.items).join('|'));
  assert.deepEqual(kinds(PRACTICE), [
    'steps:Steps=Measure from the pivot to the middle of the bob.|Time ten swings and divide by ten.',
    'rules:Rule of thumb=Four times the length, twice the time.',
    'example:Worked example=A 1 m pendulum swings in about 2 s[^1], so a 4 m one takes about 4 s.',
    'mistakes:Common mistakes=Timing a single swing: your reaction time swamps it.|Measuring to the top of the bob.',
  ], 'labelled parts, on their own line or before their text');
  assert.equal(plain(U.dossier.practiceParts(PRACTICE))[0].ordered, true, 'numbered steps stay numbered');
  // No labels: the first list is the steps; a paragraph that opens by naming its part is that part;
  // a heading line ("## …") names the block after it.
  const loose = 'To check a claim like this:\n- Ask what was measured.\n- Look for the date.\n\nFor example, the 1656 clock kept time to a minute a day.\n\nA common mistake is to trust the first number you see.\n\n## Rules of thumb\n\n- Older is not worse.\n- Two sources beat one.';
  assert.deepEqual(kinds(loose), [
    'steps=To check a claim like this:|Ask what was measured.|Look for the date.',
    'example=For example, the 1656 clock kept time to a minute a day.',
    'mistakes=A common mistake is to trust the first number you see.',
    'rules:Rules of thumb=Older is not worse.|Two sources beat one.',
  ]);
  // A paragraph with no label carries on the labelled part before it; bold words that are not a
  // part's name are text, not a label.
  assert.deepEqual(kinds('**Worked example:** a 2 m swing.\n\nSo it takes about 2.8 s.\n\n**Length sets the beat.** Keep it in mind.'), [
    'example:Worked example=A 2 m swing.|So it takes about 2.8 s.|**Length sets the beat.** Keep it in mind.',
  ]);
  assert.deepEqual(kinds('Just one plain paragraph.'), ['prose=Just one plain paragraph.']);
  assert.deepEqual(kinds(''), []);
  // Every word of the text is printed somewhere (nothing dropped but the labels themselves).
  const words = (t) => U.plain(t).replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ');
  const printed = words(plain(U.dossier.practiceParts(loose)).map((p) => p.label + ' ' + p.paras.concat(p.items).join(' ')).join(' '));
  assert.deepEqual(words(loose).filter((w) => !printed.includes(w)), [], 'no word lost');
});

test('a plate too big for one doc is left out with a note, and the chapter still fits under the cap', async () => {
  const { U } = await page();
  const topic = fx('topic'), doc = fx('pendulum');
  const pad = (kb) => '<div>' + 'x'.repeat(kb * 1024) + '</div>\n' + doc.interactive.html;
  const big = plain(doc); big.interactive.html = pad(260);
  const ch = U.dossier.chapterFrom(topic, 'i1', big, '2026-09-03T10:00:00.000Z', null);
  assert.equal(ch.plate, null, 'the plate is dropped');
  assert.equal(ch.plateNote, U.dossier.PLATE_NOTE, 'with a note saying so');
  assert.ok(U.dossier.bytes(JSON.stringify(ch)) < U.dossier.LIMIT, 'the rest fits');
  const ok = plain(doc); ok.interactive.html = pad(150);   // the kit's own limit for a body
  const ch2 = U.dossier.chapterFrom(topic, 'i1', ok, '2026-09-03T10:00:00.000Z', null);
  assert.equal(ch2.plate, ok.interactive.html, 'a 150 KB plate is kept');
  assert.ok(U.dossier.bytes(JSON.stringify(ch2)) < U.dossier.LIMIT && U.dossier.bytes(JSON.stringify(ch2)) < 256 * 1024);
  const wide = plain(doc); wide.interactive.html = '<p>' + 'é'.repeat(130 * 1024) + '</p>';   // 2 bytes each
  assert.equal(U.dossier.chapterFrom(topic, 'i1', wide, 'x', null).plate, null, 'measured in bytes, not characters');
  assert.equal(U.dossier.chapterFrom(topic, 'i1', { ...doc, status: 'building' }, 'x', null), null, 'only a whole lesson is bound');
  assert.equal(U.dossier.chapterFrom(topic, 'i1', doc, '', null), null, 'only a finished idea');
  // And the db takes it: the stub refuses documents over 256 KiB.
  const t = await page(course({ extra: { 'topics/pendulums/lessons/i1': big } }));
  await t.U.dossier.sync('pendulums');
  const stored = t.get(P('dossiers/pendulums/chapters/i1'));
  assert.ok(stored && stored.plate === null && stored.plateNote, 'saved without its plate');
  assert.equal(t.get(P('dossiers/pendulums')).chapters.i1.plate, true, 'the index still lists a plate page (with the note)');
});

test('Learn it again binds the newest edition over the old chapter, with its date', async () => {
  const t = await page(course());
  const { U } = t;
  await U.dossier.sync('pendulums');
  const fresh = plain(fx('pendulum'));
  fresh.lesson.explain.text = 'A rewritten explanation of the [[period]].';
  const again = '2026-10-01T09:00:00.000Z';
  const ch = await U.dossier.bind('pendulums', 'i1', { doc: fresh, doneAt: again });
  assert.ok(ch, 'bound');
  const stored = t.get(P('dossiers/pendulums/chapters/i1'));
  assert.equal(stored.lesson.explain.text, 'A rewritten explanation of the [[period]].', 'the new lesson replaces the old');
  assert.equal(stored.doneAt, again, 'learned on: the new date');
  assert.equal(stored.edition, 2, 'second edition');
  const idx = t.get(P('dossiers/pendulums'));
  assert.equal(idx.chapters.i1.doneAt, again); assert.equal(idx.chapters.i1.edition, 2);
  assert.equal(idx.count, 1, 'still one chapter');
  await U.dossier.bind('pendulums', 'i1', { doc: fresh, doneAt: again });
  assert.equal(t.get(P('dossiers/pendulums/chapters/i1')).edition, 2, 'binding the same edition again keeps its number');
});

test('backfill binds finished ideas from the stored lessons only where the course keeps a dossier', async () => {
  const off = await page(course({ option: false }));
  assert.equal(await off.U.dossier.sync('pendulums'), 0);
  assert.deepEqual(dossierDocs(off), [], 'the option off: nothing is bound');
  assert.equal(await off.U.dossier.bind('pendulums', 'i1', { doc: fx('pendulum'), doneAt: '2026-09-03T10:00:00.000Z' }), null, 'nor by finishing an idea');
  // Every idea finished (i2 whole now, i3's request settled): all three bound, then i4 and i5 finish too.
  const seed = course();
  seed['topics/pendulums/lessons/i2'].status = 'ready';
  delete seed[P('progress/pendulums')].ideas.i3.relearnId;
  const on = await page(seed);
  assert.equal(await on.U.dossier.sync('pendulums'), 3, 'i1, i2 and i3');
  assert.ok(!on.get(P('dossiers/pendulums')).finishedAt, 'not finished while ideas are left');
  const pr = on.get(P('progress/pendulums'));
  pr.ideas.i4 = { stage: 'done', startedAt: '2026-09-08T10:00:00.000Z', doneAt: '2026-09-09T10:00:00.000Z' };
  pr.ideas.i5 = { stage: 'done', startedAt: '2026-09-10T10:00:00.000Z', doneAt: '2026-09-11T10:00:00.000Z' };
  on.stub.seed(P('progress/pendulums'), pr);
  on.stub.seed('topics/pendulums/lessons/i4', fx('pendulum'));
  on.stub.seed('topics/pendulums/lessons/i5', fx('clocks'));
  assert.equal(await on.U.dossier.sync('pendulums', { force: true }), 2, 'only what is missing is bound');
  const idx = on.get(P('dossiers/pendulums'));
  assert.equal(idx.count, 5);
  assert.equal(idx.finishedAt, '2026-09-11T10:00:00.000Z', 'finished: the last chapter\'s date');
  assert.equal(on.get(P('dossiers/pendulums/chapters/i5')).plate, null, 'a lesson without an interactive has no plate');
});

test('keeping a dossier binds what is finished and marks it kept; removing deletes every doc', async () => {
  const t = await page(course());
  await t.U.dossier.keep('pendulums');
  const idx = t.get(P('dossiers/pendulums'));
  assert.equal(idx.kept, true);
  assert.ok(idx.chapters.i1, 'bound before the course goes');
  await t.U.store.topic.remove('pendulums');
  assert.equal(t.get('topics/pendulums'), null);
  assert.ok(t.get(P('dossiers/pendulums/chapters/i1')), 'the dossier outlives the course');
  const book = await t.U.dossier.load('pendulums');
  assert.ok(book && book.kept && book.chapters.i1, 'and opens with no course behind it');
  await t.U.dossier.remove('pendulums');
  assert.deepEqual(dossierDocs(t), [], 'removed: index and chapters');
  assert.equal(await t.U.dossier.load('pendulums'), null, 'nothing left to open');
});

test('the model: glossary from the bound chapters, bibliography by address, and the page order', async () => {
  const { U } = await page();
  const L = plain(fx('pendulum').lesson);
  L.explain.text = 'A [[bob]] is the weight at the end.[^1] This makes the [[period]] steady.\n\n**Length sets the beat.**';
  const ch = { lesson: L, doneAt: '2026-09-03T10:00:00.000Z', plate: '<p>x</p>', plateNote: null };
  const ideas = fx('topic').ideas;
  const M = U.dossier.model({ tid: 'pendulums', title: 'T', ideas, chapters: { i1: ch },
    research: { sources: [{ title: 'Pendulum clocks — Science Museum', url: 'https://www.sciencemuseum.org.uk/pendulum', quotes: ['q'] }, { title: L.sources[0].title, url: L.sources[0].url, quotes: [] }], ideas: { i1: [0] } } });
  assert.deepEqual(plain(M.gloss.map((g) => g.term)), ['bob', 'period'], 'A to Z');
  assert.equal(M.gloss[0].text, 'A [[bob]] is the weight at the end.', 'the defining sentence (its key term still marked), footnote removed');
  assert.ok(M.gloss[1].text.startsWith('A [[bob]] is the weight at the end. This makes'), 'a "This…" sentence brings the one before it');
  const museum = M.works.find((w) => w.url.includes('sciencemuseum'));
  assert.equal(museum.pub, 'Science Museum'); assert.equal(museum.title, 'Pendulum clocks');
  assert.deepEqual(plain(museum.ch), [1], 'research notes of the idea point to its chapter');
  assert.equal(M.works.filter((w) => w.url === L.sources[0].url).length, 1, 'one entry per address');
  assert.deepEqual(plain(M.leaves.map((l) => l.id)), ['cover', 'contents', 'i1:1', 'i1:2', 'i1:3', 'back']);
  assert.equal(M.bound.length, 1); assert.equal(M.done, false);
  assert.equal(M.chapters[1].learned, null, 'chapter II not yet written');
  // A chapter bound before lessons had practice (and with the checks older snapshots kept): its
  // last leaf is its sources alone, and no page turn, label or part of the model names a test.
  const old = { ...ch, lesson: { ...L, checks: plain(fx('pendulum').lesson.checks) } };
  const M1 = U.dossier.model({ tid: 'pendulums', title: 'T', ideas, chapters: { i1: old } });
  const last = M1.leaves.find((l) => l.id === 'i1:3');
  assert.equal(last.k + ' / ' + last.t, 'Sources / chapter I', 'an older chapter\'s last leaf: its sources');
  assert.equal(last.href, '#/book/pendulums/i1/practice');
  assert.equal(M1.chapters[0].practice, null);
  // With practice: the practice leaf, its parts ready to print.
  const M2 = U.dossier.model({ tid: 'pendulums', title: 'T', ideas, chapters: { i1: { ...ch, lesson: { ...L, practice: { text: PRACTICE } } } } });
  const pl = M2.leaves.find((l) => l.id === 'i1:3');
  assert.equal(pl.k + ' / ' + pl.t, 'Put it into practice / and sources, chapter I');
  assert.deepEqual(plain(M2.chapters[0].practice.map((p) => p.kind)), ['steps', 'rules', 'example', 'mistakes']);
  for (const m of [M1, M2]) assert.ok(!/test/i.test(JSON.stringify(m.leaves)), 'no "test" in any page turn: ' + JSON.stringify(m.leaves));
});

test('the router: a dossier\'s pages are their own screen; the Library and the Book are "book"', async () => {
  const { U } = await page();
  assert.equal(U.routes.screenOf('#/book'), 'book');
  assert.equal(U.routes.screenOf('#/book/words'), 'book');
  for (const p of ['#/book/:tid', '#/book/:tid/contents', '#/book/:tid/:iid', '#/book/:tid/:iid/plate/play']) assert.equal(U.routes.screenOf(p), 'dossier', p);
  const hit = (h) => (U.routes.list.find((r) => r.re.test(h)) || {}).screen;
  assert.equal(hit('#/book/pendulums/i1/practice'), 'dossier');
  assert.equal(hit('#/book/pendulums/i1/tests'), 'dossier', 'the older address still opens the same leaf');
  assert.equal(hit('#/book/pendulums/glossary'), 'dossier');
});
