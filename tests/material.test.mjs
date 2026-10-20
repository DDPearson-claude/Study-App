// Unit tests for course-material sources (docs/ARCHITECTURE.md section 5, tools/course/material.mjs):
// a page of Dan's own course materials cited by its locator "material:<slug>#p<page>", checked word
// for word against that page's text like a web page's quote. The material tool is run on a small
// PDF made here; the checker is the app's own (U.gen._corpus / _filterResearch, as sources.mjs runs it).
// Run: node --test tests/material.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, writeFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plain = (x) => JSON.parse(JSON.stringify(x));
function load() {
  const noop = () => {};
  const ctx = { console: { log: noop, warn: noop, error: console.error }, setTimeout, clearTimeout, Promise, Date, Math, JSON, URL };
  ctx.window = ctx;
  ctx.addEventListener = noop;
  vm.createContext(ctx);
  for (const f of ['00-core.js', '10-runtime.js', '30-prompts.js', '31-generate.js', '34-verify.js']) vm.runInContext(readFileSync(join(root, 'app', 'src', 'js', f), 'utf8'), ctx, { filename: f });
  return ctx.U;
}
const U = load();

// A two-page PDF with one line of text a page (Helvetica), offsets worked out so its xref is right.
function pdf(lines) {
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [' + lines.map((_, i) => (3 + i * 2) + ' 0 R').join(' ') + '] /Count ' + lines.length + ' >>'];
  lines.forEach((t, i) => {
    const stream = 'BT /F1 12 Tf 40 700 Td (' + t.replace(/[()\\]/g, '\\$&') + ') Tj ET';
    objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ' + (4 + i * 2) + ' 0 R >>');
    objs.push('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
  });
  let out = '%PDF-1.4\n', offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
  const x = out.length;
  out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  return out + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + x + '\n%%EOF\n';
}

test('U.material reads a locator; urlKey keeps its page; the validators accept it where a web address goes', () => {
  assert.deepEqual(plain(U.material('material:eal-slides#p16')), { slug: 'eal-slides', page: 16 });
  for (const bad of ['material:eal-slides', 'material:EAL#p1', 'material:x#p0', 'https://example.com/#p1', 'slides p.16']) assert.equal(U.material(bad), null, bad);
  assert.equal(U.prompts.urlKey('material:eal-slides#p16'), 'material:eal-slides#p16');
  assert.notEqual(U.prompts.urlKey('material:eal-slides#p16'), U.prompts.urlKey('material:eal-slides#p17'), 'each page its own source');
  assert.equal(U.prompts.copyHost('material:eal-slides#p16'), '');
  const reply = { sources: [{ n: 1, title: 'EAL Level 4: course slides', url: 'material:eal-slides#p16', quote: 'Ib is the design current' }], topic: { notes: [{ claim: 'x', sourceIds: [1] }] }, ideas: {} };
  assert.ok(!plain(U.validate.research(reply, { ideas: [] })).some((p) => /url/.test(p)), 'research');
  const bad = { ...reply, sources: [{ ...reply.sources[0], url: 'slides p.16' }] };
  assert.ok(plain(U.validate.research(bad, { ideas: [] })).some((p) => /material:<slug>#p<page>/.test(p)), 'a bare page reference is refused');
});

test('material.mjs saves each page verbatim; a quote on that page is kept, one not on it or on a page out of range is dropped', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mu-material-'));
  writeFileSync(join(dir, 'slides.pdf'), pdf(['The design current Ib is what the circuit carries in normal service.', 'Diversity is guidance and does not have to be applied.']));
  const r = spawnSync(process.execPath, [join(root, 'tools', 'course', 'material.mjs'), '--file', join(dir, 'slides.pdf'), '--title', 'Course slides', '--slug', 'eal-slides', '--out', join(dir, 'tools')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(plain(JSON.parse(r.stdout)), { slug: 'eal-slides', title: 'Course slides', pages: 2, locator: 'material:eal-slides#p<page>', empty: [] });
  assert.deepEqual(readdirSync(join(dir, 'tools')).sort(), ['material-eal-slides-p001.json', 'material-eal-slides-p002.json']);
  const t1 = JSON.parse(readFileSync(join(dir, 'tools', 'material-eal-slides-p001.json'), 'utf8'));
  assert.equal(t1.tool, 'material');
  assert.deepEqual([t1.input.page, t1.input.title, t1.input.locator], [1, 'Course slides', 'material:eal-slides#p1']);
  assert.match(t1.output, /The design current Ib is what the circuit carries/);

  // The app's own checker, fed as sources.mjs feeds it.
  const corpus = U.gen._corpus();
  readdirSync(join(dir, 'tools')).forEach((f) => { const t = JSON.parse(readFileSync(join(dir, 'tools', f), 'utf8')); corpus.addMaterial(t.input.locator, t.output); });
  const src = (n, page, quote) => ({ n, title: 'Course slides', url: 'material:eal-slides#p' + page, quote });
  const raw = { sources: [
    src(1, 1, 'the circuit carries in normal service'),
    src(2, 2, 'the circuit carries in normal service'),            // on page 1, not page 2
    src(3, 9, 'Diversity is guidance'),                              // no page 9
    src(4, 2, 'Diversity is a rule'),                                // not on the page
    src(5, 2, 'Diversity is guidance … does not have to be applied'),
  ], topic: { notes: [{ claim: 'Ib', sourceIds: [1, 2, 3, 4, 5] }] }, ideas: {} };
  const res = plain(U.gen._filterResearch(raw, corpus, []));
  assert.equal(res.kept, 2);
  assert.deepEqual(res.docs.topic.sources.map((s) => s.url), ['material:eal-slides#p1', 'material:eal-slides#p2']);
  assert.deepEqual(res.dropped.map((d) => [d.n, d.why]), [[2, 'quote not found on that page'], [3, 'not a page of a course material the tools read'], [4, 'quote not found on that page']]);

  // sources.mjs --quotes, as a brief's research runs it.
  writeFileSync(join(dir, 'q.json'), JSON.stringify(raw.sources.map((s) => ({ title: s.title, url: s.url, quote: s.quote }))));
  const q = spawnSync(process.execPath, [join(root, 'tools', 'eval', 'sources.mjs'), '--quotes', join(dir, 'q.json'), '--tools', join(dir, 'tools')], { encoding: 'utf8' });
  assert.equal(q.status, 1);
  assert.match(q.stdout, /"ok":2,"failed":3/);
});

test('a finalised lesson may cite a material page; the writer and the fact-checker are told what it is', () => {
  const L = JSON.parse(readFileSync(join(root, 'tests', 'fixtures', 'lesson-jet-engines-i1.json'), 'utf8'));
  const mat = { n: 1, title: 'EAL Level 4 Design and Verification: course slides', url: 'material:eal-slides#p16', quote: 'Ib = P / (√3 × U)' };
  const lesson = JSON.parse(JSON.stringify(L).replace(/\[\^\d+\]/g, '[^1]'));
  lesson.sources = [mat];
  (lesson.interactive && lesson.interactive.numbers || []).forEach((n) => { if (n.source) n.source = 1; });
  const p = plain(U.validate.lesson(lesson, { iid: lesson.iid, sources: [mat], final: true }));
  assert.ok(!p.some((x) => /url|research sources|web address/i.test(x)), p.join(' | '));
  const topic = JSON.parse(readFileSync(join(root, 'tests', 'fixtures', 'plan-jet-engines.json'), 'utf8'));
  const idea = topic.ideas.find((i) => i.id === lesson.iid);
  const research = { sources: [mat], topic: { notes: [{ claim: 'Ib from the input', sourceIds: [1] }] }, ideas: {} };
  assert.match(U.prompts.writeLesson(topic, idea, { research, mode: 'read' }), /begins "material:" is a page of Dan's own course materials/);
  assert.match(U.prompts.verifyLesson(topic, idea, lesson, { research }), /begins "material:" is a page of Dan's own course materials/);
  assert.doesNotMatch(U.prompts.writeLesson(topic, idea, { research: { ...research, sources: [{ ...mat, url: 'https://example.com/a' }] }, mode: 'read' }), /begins "material:"/);
});
