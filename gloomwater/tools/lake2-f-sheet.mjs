// tools/lake2-f-sheet.mjs — LAKE 2, lane F's look sheet for the user (docs/loop/LAKE2.md §9 F): each Sporewood fish beside the Mossmere fish
// it must look nothing like, at the show's close-up and at its card, from the frames tools/tests/lake2-f-look.scenario.mjs shot (one or
// more shot folders, the newest frame of a fish winning). ImageMagick (montage, convert), as tools/show-sheet.mjs uses.
//
//   node tools/lake2-f-sheet.mjs --in=tools/out/lake2-f/r1,tools/out/lake2-f/r2 --out=tools/out/lake2-f/fish.jpg [--size=desk|phone] [--tile=360]
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { PAIRS } from './tests/lake2-f-look.scenario.mjs';

const flags = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const dirs = String(flags.in || 'tools/out/lake2-f/r1').split(',').map((d) => resolve(process.cwd(), d.trim()));
const out = resolve(process.cwd(), String(flags.out || 'tools/out/lake2-f/fish.jpg'));
const size = String(flags.size || 'desk'), phone = size === 'phone';
const TW = Number(flags.tile) || (phone ? 200 : 360), TH = Math.round(phone ? TW * 844 / 390 : TW * 9 / 16);
const BG = '#0c0b14', INK = '#ece6d6', DIM = '#a79fc0';
const im = (cmd, a) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
const nice = (id) => String(id).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** The newest frame of a fish (show | card) at this size, over every folder: {file, mtime} | null. */
function frameOf(sp, what, tag = null) {
  let best = null;
  for (const d of dirs) {
    const p = join(d, 'fish-notes.json');
    if (!existsSync(p)) continue;
    const notes = JSON.parse(readFileSync(p, 'utf8'));
    for (const [name, n] of Object.entries(notes)) {
      if (n.species !== sp || n.frame !== what || n.size !== size || (n.tag || null) !== tag) continue;
      const f = join(d, `${name}.png`);
      if (!existsSync(f)) continue;
      const t = statSync(f).mtimeMs;
      if (!best || t > best.mtime) best = { file: f, mtime: t };
    }
  }
  return best;
}
const tmp = mkdtempSync(join(tmpdir(), 'lake2-f-sheet-'));
try {
  const rows = [];
  let k = 0;
  for (const row of PAIRS) {
    const files = [], labels = [];
    for (const [i, [sp, , light, tag]] of row.entries()) {
      for (const what of ['show', 'card']) {
        const fr = frameOf(sp, what, tag || null);
        if (!fr) continue;
        files.push(fr.file); labels.push(`${i === 0 ? '' : 'the Mossmere: '}${nice(sp)}${tag ? ` (${tag}, ${light})` : ''} · ${what}`);
      }
    }
    if (!files.length) continue;
    const f = join(tmp, `r${k++}.png`), a = ['-background', BG, '-fill', DIM, '-font', 'DejaVu-Sans', '-pointsize', '12'];
    files.forEach((p, i) => a.push('-label', labels[i], p));
    im('montage', [...a, '-tile', `${files.length}x`, '-geometry', `${TW}x${TH}+3+3`, f]);
    rows.push(f);
  }
  if (!rows.length) { console.error(`no frames of size ${size} under ${dirs.join(', ')}`); process.exit(1); }
  const head = join(tmp, 'head.png');
  im('convert', ['-background', BG, '-fill', INK, '-font', 'DejaVu-Sans-Bold', '-pointsize', '18', 'label:Sporewood Pools: the fourteen, each beside its Mossmere relative', '-bordercolor', BG, '-border', '12x8', head]);
  im('convert', [head, ...rows, '-background', BG, '-gravity', 'West', '-append', '-quality', String(flags.quality || 84), out]);
  console.log(`${out}  (${rows.length} rows, ${size})`);
} finally { rmSync(tmp, { recursive: true, force: true }); }
