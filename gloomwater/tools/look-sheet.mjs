// tools/look-sheet.mjs — M1 step 3a's five look sheets for the user (docs/loop/m1-step3a/PLAN.md §6, T150): it composes the frames the
// look scenario (tools/tests/loop-3a-look.scenario.mjs) shot into <in>/<sheet>/ and described in <in>/notes.json, with ImageMagick
// (montage, convert) as tools/show-sheet.mjs does.
//
//   node tools/look-sheet.mjs --in=tools/out/m1-s3a/look --out=tools/out/m1-s3a/sheets   [--quality=84] [--width=1800]
//
// The sheets: places.jpg (each place: its bank, the lift's three beats, lifted at dusk, at night and in late day; the backs, the raft
// inside a bank, the cast into a bank), giants.jpg (each giant's show in five frames), catalogue.jpg, redress.jpg (today on the left,
// LOOP.redress on the right, pose by pose) and hud.jpg. Desktop frames and phone frames sit in rows of their own; every row is headed
// by what it shows (the notes' words). A sheet with no frames is skipped and named in the summary. Prints {sheet: path | null}.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

export const SHEETS = ['places', 'giants', 'catalogue', 'redress', 'hud'];
const BG = '#14122a', INK = '#d8d2f0', DIM = '#9890c0';

/** A frame's file name → {tag, sheet, n, what} (tag desk | phone); null for a name the look scenario does not write. */
export function parseFrame(name) {
  const m = /^(desk|phone)-([a-z]+)-(\d+)-(.+)\.png$/.exec(name);
  return m ? { tag: m[1], sheet: m[2], n: Number(m[3]), what: m[4] } : null;
}
/** The rows of a sheet: frames grouped by size, then by the group key (sheet 1: the place, sheet 2: the fish and its size, sheet 4: the
 *  pose's light), in shot order; each row at most `max` frames. → [{title, files: [path…]}] */
export function rowsFor(sheet, files, notes = {}, { max = 6 } = {}) {
  const fr = files.map((f) => ({ f, ...parseFrame(basename(f)) })).filter((x) => x.sheet === sheet).sort((a, b) => (a.tag === b.tag ? a.n - b.n : a.tag < b.tag ? -1 : 1));
  const key = (x) => {
    const note = notes[`${sheet}/${basename(x.f, '.png')}`] || {};
    if (sheet === 'places') return note.place || (x.what.startsWith('inside') || x.what.startsWith('cast') ? 'the raft and the cast' : 'before any lift');
    if (sheet === 'giants') return x.what.replace(/-(leave|lift|show|pause|card)$/, '');
    if (sheet === 'redress') return x.what.replace(/-(on|off)$/, '');
    return sheet;
  };
  const rows = [];
  for (const x of fr) {
    const title = `${x.tag === 'desk' ? 'desktop' : 'phone'} · ${key(x)}`;
    let row = rows.find((r) => r.title === title && r.files.length < max);
    if (!row) { row = { title, files: [] }; rows.push(row); }
    row.files.push(x.f);
  }
  // sheet 4 is read side by side: today and re-dressed, pose by pose
  if (sheet === 'redress') for (const r of rows) r.files.sort((a, b) => (basename(a).endsWith('-off.png') ? 0 : 1) - (basename(b).endsWith('-off.png') ? 0 : 1));
  return rows;
}

function main() {
  const flags = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
  const inDir = resolve(process.cwd(), String(flags.in || 'tools/out/m1-s3a/look')), outDir = resolve(process.cwd(), String(flags.out || 'tools/out/m1-s3a/sheets'));
  mkdirSync(outDir, { recursive: true });
  const notes = existsSync(join(inDir, 'notes.json')) ? JSON.parse(readFileSync(join(inDir, 'notes.json'), 'utf8')) : {};
  const width = Number(flags.width) || 1800;
  const im = (cmd, a) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
  const tmp = mkdtempSync(join(tmpdir(), 'look-sheet-'));
  const done = {};
  try {
    for (const sheet of SHEETS) {
      const dir = join(inDir, sheet);
      const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.png')).map((f) => join(dir, f)) : [];
      const rows = rowsFor(sheet, files, notes);
      if (!rows.length) { done[sheet] = null; continue; }
      const parts = [];
      const title = join(tmp, `${sheet}-title.png`);
      im('convert', ['-background', BG, '-fill', INK, '-font', 'DejaVu-Sans-Bold', '-pointsize', '22', `label:${sheet}.jpg  ·  M1 step 3a`, '-bordercolor', BG, '-border', '14x10', title]);
      parts.push(title);
      rows.forEach((r, i) => {
        const head = join(tmp, `${sheet}-${i}-h.png`), row = join(tmp, `${sheet}-${i}.png`);
        im('convert', ['-background', BG, '-fill', DIM, '-font', 'DejaVu-Sans', '-pointsize', '15', `label:${r.title}`, '-bordercolor', BG, '-border', '10x4', head]);
        const phone = r.title.startsWith('phone');
        const tw = phone ? Math.floor(width / 8) - 8 : Math.floor(width / 6) - 8;   // (one tile size for every row: the sheet reads as a grid)
        const th = phone ? Math.round(tw * 844 / 390) : Math.round(tw * 540 / 960);
        const caps = [];
        for (const f of r.files) {
          const n = notes[`${sheet}/${basename(f, '.png')}`];
          const cap = join(tmp, `${sheet}-${i}-${caps.length}.png`);
          im('convert', [f, '-resize', `${tw}x${th}`, '-background', BG, '-gravity', 'north', '-extent', `${tw}x${th}`, '(', '-size', `${tw}x34`, '-background', BG, '-fill', DIM, '-font', 'DejaVu-Sans', '-pointsize', '11', `caption:${(n?.note || parseFrame(basename(f))?.what || '').slice(0, 120)}`, ')', '-append', cap]);
          caps.push(cap);
        }
        im('montage', [...caps, '-tile', `${caps.length}x`, '-geometry', '+4+4', '-background', BG, row]);
        parts.push(head, row);
      });
      const out = join(outDir, `${sheet}.jpg`);
      im('convert', [...parts, '-background', BG, '-gravity', 'West', '-append', '-quality', String(flags.quality || 84), out]);
      done[sheet] = out;
    }
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  console.log(JSON.stringify(done, null, 1));
  const missing = Object.entries(done).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) console.log(`no frames yet for: ${missing.join(', ')}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
