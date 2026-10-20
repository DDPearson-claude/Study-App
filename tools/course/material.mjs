#!/usr/bin/env node
// One of Dan's own course materials (a PDF: his slides, formula sheet, learner pack, a drawing, a
// practice paper) as tool files the source checker reads, one per page, so a refresher lesson can
// quote and cite it like any source (RUNBOOK sections 2 and 8). Each page's text is taken with
// pdftotext -layout, verbatim, and saved as
//   <out>/material-<slug>-p<NNN>.json = {"tool": "material", "input": {file, page, title, slug, locator}, "output": "<page text>"}
// The page's locator, "material:<slug>#p<page>", is what a source carries where a web source has
// its url; tools/eval/sources.mjs keeps a source only when its quote is on that very page.
//
//   node tools/course/material.mjs --file build/x/source/slides.pdf --title "EAL Level 4 Design and Verification: course slides" --out $D/tools [--slug eal-slides]
//
// A .pptx is read from its PDF (export it first, as in ../pptx-pdf/). Prints {slug, title, pages,
// locator, empty}: empty lists pages with no text (a scan or a drawing with no words), which cannot
// be quoted.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
const file = arg('file'), title = arg('title'), out = arg('out');
if (!file || !title || !out) { console.error('usage: material.mjs --file <pdf> --title "<title as cited>" --out <tools dir> [--slug <slug>]'); process.exit(2); }
if (!existsSync(file)) { console.error('no file ' + file); process.exit(2); }
if (!/\.pdf$/i.test(file)) { console.error(file + ' is not a PDF: export it to PDF first (a .pptx: its PDF in ../pptx-pdf/)'); process.exit(2); }
const slug = (arg('slug') || basename(file).replace(/\.[^.]+$/, '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(slug)) { console.error('bad slug "' + slug + '": give --slug (letters, digits and "-")'); process.exit(2); }

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) { console.error(cmd + ' failed: ' + (r.stderr || r.error || '').toString().trim()); process.exit(1); }
  return r.stdout;
};
const pages = Number((run('pdfinfo', [file]).match(/^Pages:\s+(\d+)/m) || [])[1]);
if (!(pages > 0)) { console.error('pdfinfo found no pages in ' + file); process.exit(1); }
mkdirSync(out, { recursive: true });
const rel = relative(resolve('.'), resolve(file));
const empty = [];
for (let p = 1; p <= pages; p++) {
  const text = run('pdftotext', ['-layout', '-enc', 'UTF-8', '-f', String(p), '-l', String(p), file, '-']).replace(/\f/g, '');
  if (!text.trim()) empty.push(p);
  const locator = 'material:' + slug + '#p' + p;
  const doc = { tool: 'material', input: { file: rel, page: p, title, slug, locator }, output: text };
  writeFileSync(join(out, 'material-' + slug + '-p' + String(p).padStart(3, '0') + '.json'), JSON.stringify(doc, null, 1) + '\n');
}
console.log(JSON.stringify({ slug, title, pages, locator: 'material:' + slug + '#p<page>', empty }, null, 1));
