// The show's contact sheet: one strip per case from the frames tools/tests/show-audit.scenario.mjs shot, labelled with the game
// time and what the frame holds (from notes.json), all strips stacked into one JPEG. Needs ImageMagick (montage, convert).
//
//   node tools/show-sheet.mjs <dir with desktop/ and phone/> <out.jpg> [--title="Before: the catch today"]
//   → <out.jpg> (every case, desktop then phone) and <dir>/strips/<set>-<case>.jpg (one case, larger tiles, for a close look)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const [dirArg, outArg] = args.filter((a) => !a.startsWith('--'));
if (!dirArg || !outArg) { console.error('usage: node tools/show-sheet.mjs <dir> <out.jpg> [--title=…]'); process.exit(2); }
const dir = resolve(process.cwd(), dirArg), out = resolve(process.cwd(), outArg);
const tmp = join(dir, '.sheet'), strips = join(dir, 'strips');
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true }); mkdirSync(strips, { recursive: true });
const im = (cmd, a) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
const BG = '#0c0b14', INK = '#ece6d6', DIM = '#a79fc0';

const rows = [];
for (const set of ['desktop', 'phone']) {
  const sdir = join(dir, set), np = join(sdir, 'notes.json');
  if (!existsSync(np)) continue;
  const notes = JSON.parse(readFileSync(np, 'utf8'));
  const portrait = set === 'phone';
  const [tw, th] = portrait ? [150, 325] : [288, 162], [bw, bh] = portrait ? [234, 506] : [480, 270];
  for (const [name, rec] of Object.entries(notes)) {
    const frames = (rec.frames || []).filter((f) => existsSync(join(sdir, f.file)));
    if (!frames.length) continue;
    const label = (f) => {
      const fish = f.fish ? `fish ${f.fish.wPct}x${f.fish.hPct}%` : 'no fish';
      const cov = f.cover ? Math.max(f.cover.band || 0, f.cover.card || 0, f.cover.banner || 0) : 0;
      return `t ${f.t.toFixed(2)} s  ${f.modal === 'catch' ? 'card' : f.phase || 'reveal'}\\n${fish}${cov ? `  ${cov}% covered` : ''}  ${f.words} words`;
    };
    const tiles = (w, h, file, perRow) => {
      const a = ['-background', BG, '-fill', INK, '-font', 'DejaVu-Sans', '-pointsize', String(portrait ? 10 : 11)];
      for (const f of frames) a.push('-label', label(f), join(sdir, f.file));
      a.push('-tile', `${perRow}x`, '-geometry', `${w}x${h}+3+3`, file);
      im('montage', a);
    };
    const row = join(tmp, `${set}-${name}.png`);
    tiles(tw, th, row, frames.length);
    const head = join(tmp, `${set}-${name}-head.png`);
    const title = `${set === 'phone' ? 'PHONE 390x844' : 'DESKTOP 960x540'}   ${name.toUpperCase()}   ${rec.species.replace(/_/g, ' ')}  ${rec.ancient ? 'ancient' : rec.sizeClass}  ${rec.lengthCm} cm   ·   fish clears the water → card: ${rec.tCard ?? '?'} s`;
    im('convert', ['-background', BG, '-fill', DIM, '-font', 'DejaVu-Sans-Bold', '-pointsize', '15', `label:${title}`, '-bordercolor', BG, '-border', '8x6', head]);
    const both = join(tmp, `${set}-${name}-row.png`);
    im('convert', [head, row, '-background', BG, '-append', both]);
    rows.push(both);
    tiles(bw, bh, join(strips, `${set}-${name}.jpg`), portrait ? 6 : 4);
  }
}
if (!rows.length) { console.error(`no notes.json with frames under ${dir}/desktop or ${dir}/phone`); process.exit(1); }
const a = [];
if (flags.title) { const t = join(tmp, 'title.png'); im('convert', ['-background', BG, '-fill', INK, '-font', 'DejaVu-Sans-Bold', '-pointsize', '22', `label:${flags.title}`, '-bordercolor', BG, '-border', '10x10', t]); a.push(t); }
im('convert', [...a, ...rows, '-background', BG, '-append', '-quality', '82', out]);
rmSync(tmp, { recursive: true, force: true });
console.log(`${out}  (${rows.length} strips; single strips in ${strips})`);
