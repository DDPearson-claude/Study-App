// The show's proof sheet and film (docs/v3/show/SPEC.md §4), from what tools/tests/show-audit.scenario.mjs shot. Needs ImageMagick
// (montage, convert) for the sheet and ffmpeg for the film. (Its first version built tools/out/show/before.jpg, the contact sheet
// of the measuring ceremony this replaced; the before set's frames are still read here for the comparison at the top.)
//
//   node tools/show-sheet.mjs --after=tools/out/show/after --before=tools/out/show/before --out=tools/out/show/sheet.jpg
//        [--rows=small,keeper,prize,trophy,elder,legend,eel] [--phone=small,elder] [--compare=small] [--tile=424]
//     one row per catch, five frames each (the fish leaving the water, the lift, the show, the pause, the card open) with the
//     measured seconds to the card; a phone row; and at the top the same class before and after.
//   node tools/show-sheet.mjs --strips=tools/out/show/after/desktop [--out=<dir>/strips.jpg] [--only=a,b]
//     every case in a notes.json as a strip of all its frames (the stage's look-and-fix sheet).
//   node tools/show-sheet.mjs --video=tools/out/show/film --out=tools/out/show/show.mp4 [--fps=12]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const flags = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const im = (cmd, a) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
const BG = '#0c0b14', INK = '#ece6d6', DIM = '#a79fc0', GOLD = '#e8b76a';
const list = (s, d) => String(s || d).split(',').map((x) => x.trim()).filter(Boolean);
const readNotes = (dir) => { const p = join(dir, 'notes.json'); return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {}; };
const nice = (id) => String(id || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const POSE = { pinch: 'held out to us in one hand', both: 'held in both hands, pushed forward', hug: 'stood on its tail and hugged', hang: 'too big to lift: hung from the planted rod', alongside: 'too big to lift: laid along the raft, a hand on its brow' };
const CLS = (r) => (r.legendary ? 'Legend' : r.ancient ? 'Ancient' : nice(r.sizeClass || r.cls));
const cm = (v) => (v >= 100 ? `${(v / 100).toFixed(2)} m` : `${Math.round(v)} cm`);

if (flags.video) {
  const dir = resolve(process.cwd(), String(flags.video)), out = resolve(process.cwd(), String(flags.out || join(dir, '..', 'show.mp4')));
  const fps = String(flags.fps || 12);
  execFileSync('/usr/bin/ffmpeg', ['-y', '-loglevel', 'error', '-framerate', fps, '-i', join(dir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(flags.crf || 23), '-vf', 'scale=960:540', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(`${out}  (${(statSync(out).size / 1e6).toFixed(2)} MB at ${fps} frames per second of game time)`);
  process.exit(0);
}

if (flags.strips) {
  const dir = resolve(process.cwd(), String(flags.strips)), notes = readNotes(dir), out = resolve(process.cwd(), String(flags.out || join(dir, 'strips.jpg')));
  const tmp = join(dir, '.sheet'); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
  const only = flags.only ? list(flags.only) : null, rows = [];
  for (const [name, rec] of Object.entries(notes)) {
    if ((only && !only.includes(name)) || !rec.frames?.length) continue;
    const frames = rec.frames.filter((f) => existsSync(join(dir, f.file)));
    const portrait = /phone/.test(dir) || !!flags.portrait;
    const [tw, th] = portrait ? [200, 433] : [384, 216];
    const a = ['-background', BG, '-fill', INK, '-font', 'DejaVu-Sans', '-pointsize', '11'];
    for (const f of frames) a.push('-label', `${f.label}  t ${f.t.toFixed(2)} s\\n${f.hull ? `fish ${f.hull.wPct}x${f.hull.hPct}%` : ''} ${f.wickOffLens != null ? `off ${f.wickOffLens}°` : ''}`, join(dir, f.file));
    const row = join(tmp, `${name}.png`);
    im('montage', [...a, '-tile', `${frames.length}x`, '-geometry', `${tw}x${th}+3+3`, row]);
    const head = join(tmp, `${name}-head.png`);
    im('convert', ['-background', BG, '-fill', DIM, '-font', 'DejaVu-Sans-Bold', '-pointsize', '14', `label:${name.toUpperCase()}   ${nice(rec.species)}  ${CLS(rec)}  ${cm(rec.lengthCm)}  ${rec.picture?.pose || ''}   T0 → card ${rec.tCard} s`, '-bordercolor', BG, '-border', '8x5', head]);
    const both = join(tmp, `${name}-row.png`); im('convert', [head, row, '-background', BG, '-append', both]); rows.push(both);
  }
  if (!rows.length) { console.error(`no frames under ${dir}`); process.exit(1); }
  im('convert', [...rows, '-background', BG, '-append', '-quality', '84', out]);
  rmSync(tmp, { recursive: true, force: true });
  console.log(`${out}  (${rows.length} strips)`);
  process.exit(0);
}

// ---------------------------------------------------------------- the proof sheet
const afterDir = resolve(process.cwd(), String(flags.after || 'tools/out/show/after')), beforeDir = resolve(process.cwd(), String(flags.before || 'tools/out/show/before'));
const out = resolve(process.cwd(), String(flags.out || 'tools/out/show/sheet.jpg'));
const TW = Number(flags.tile) || 424, TH = Math.round(TW * 9 / 16), GAP = 4, COLS = 5, WIDTH = COLS * (TW + 2 * GAP);
const tmp = join(dirname(out), '.sheet'); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const D = { dir: join(afterDir, 'desktop'), notes: readNotes(join(afterDir, 'desktop')) }, Ph = { dir: join(afterDir, 'phone'), notes: readNotes(join(afterDir, 'phone')) };
const FIVE = [['water', 'leaving the water'], ['lift', 'the lift'], ['show', 'the show'], ['pause', 'the pause'], ['card', 'the card']];
let seq = 0;
const text = (s, { size = 15, fill = INK, bold = false, width = WIDTH, pad = '10x6', gravity = 'West' } = {}) => {
  const f = join(tmp, `t${seq++}.png`);
  im('convert', ['-background', BG, '-fill', fill, '-font', bold ? 'DejaVu-Sans-Bold' : 'DejaVu-Sans', '-pointsize', String(size), '-size', `${width - 20}x`, '-gravity', gravity, `caption:${s}`, '-bordercolor', BG, '-border', pad, f]);
  return f;
};
/** Five tiles side by side with a small label under each. */
const strip = (files, labels, { tw = TW, th = TH } = {}) => {
  const f = join(tmp, `s${seq++}.png`), a = ['-background', BG, '-fill', DIM, '-font', 'DejaVu-Sans', '-pointsize', '12'];
  files.forEach((p, i) => a.push('-label', labels[i], p));
  im('montage', [...a, '-tile', `${files.length}x`, '-geometry', `${tw}x${th}+${GAP}+${GAP}`, f]);
  return f;
};
const afterFrames = (S, name) => {
  const rec = S.notes[name]; if (!rec) return null;
  const fr = FIVE.map(([k]) => rec.frames.find((f) => f.label === k)).filter((f) => f && existsSync(join(S.dir, f.file)));
  return fr.length === FIVE.length ? { rec, files: fr.map((f) => join(S.dir, f.file)), labels: fr.map((f, i) => `${FIVE[i][1]}  ·  ${f.t.toFixed(1)} s`) } : null;
};
const poseWords = (rec) => (rec.picture?.pose === 'hang' && /eel/.test(rec.species || '') && rec.lengthCm < 150 ? 'too long and thin to stand up: hung from the planted rod' : POSE[rec.picture?.pose] || '');
const caption = (rec) => `${CLS(rec)}  ·  ${nice(rec.species)}, ${cm(rec.lengthCm)}  ·  ${poseWords(rec)}  ·  ${rec.tCard.toFixed(1)} s from leaving the water to the card`;

const parts = [text('Gloomwater  ·  the catch, shown: the Wick holds up its fish for us, a still pause, then the card', { size: 24, bold: true, pad: '10x12' })];
// ---- before and after, the same class
{
  const name = String(flags.compare || 'small'), A = afterFrames(D, name);
  const bdir = join(beforeDir, 'desktop'), bn = readNotes(bdir)[name];
  if (A && bn?.frames?.length) {
    const live = bn.frames.filter((f) => existsSync(join(bdir, f.file))), card = live.filter((f) => f.modal === 'catch').at(-1) || live.at(-1), pre = live.filter((f) => f.modal !== 'catch');
    const tC = bn.tCard || card.t, pick = [0.12, 0.42, 0.68, 0.94].map((k) => pre.reduce((b, f) => (Math.abs(f.t - k * tC) < Math.abs(b.t - k * tC) ? f : b), pre[0]));
    parts.push(text(`BEFORE  ·  the measuring ceremony  ·  ${CLS(bn)} ${nice(bn.species)}, ${cm(bn.lengthCm)}: the fish is a few pixels at the Wick's chest, an ink band and a ticking count lie over the picture, and the card opens with no pause (${Number(tC).toFixed(1)} s)`, { fill: DIM, size: 15, bold: true }));
    parts.push(strip([...pick, card].map((f) => join(bdir, f.file)), [...pick.map((f) => `${f.t.toFixed(1)} s`), `the card  ·  ${Number(tC).toFixed(1)} s`]));
    parts.push(text(`AFTER  ·  the show  ·  ${caption(A.rec)}  ·  nothing written on the screen until the card`, { fill: GOLD, size: 15, bold: true }));
    parts.push(strip(A.files, A.labels));
  }
}
// ---- one row per catch
parts.push(text('Every class, from the fish leaving the water to the card (960 × 540, the high tier; times are game seconds on a stepped clock)', { size: 17, bold: true, pad: '10x10' }));
for (const name of list(flags.rows, 'small,keeper,prize,trophy,elder,legend,eel')) {
  const A = afterFrames(D, name);
  if (!A) { console.warn(`(no five frames for ${name})`); continue; }
  parts.push(text(caption(A.rec), { size: 15, fill: INK, bold: true }));
  parts.push(strip(A.files, A.labels));
}
// ---- the phone: one row per catch, each frame at the phone's own size (390 × 844)
{
  const names = list(flags.phone, 'small,elder').filter((n) => afterFrames(Ph, n));
  if (names.length) {
    parts.push(text('On a phone held upright (390 × 844, each frame at its own size)', { size: 17, bold: true, pad: '10x10' }));
    const pw = Math.min(390, Math.floor(WIDTH / COLS) - 2 * GAP), ph = Math.round(pw * 844 / 390);
    for (const n of names) {
      const A = afterFrames(Ph, n);
      parts.push(text(`${caption(A.rec)}`, { size: 15, bold: true }));
      parts.push(strip(A.files, A.labels, { tw: pw, th: ph }));
    }
  }
}
im('convert', [...parts, '-background', BG, '-gravity', 'West', '-append', '-quality', String(flags.quality || 86), out]);
rmSync(tmp, { recursive: true, force: true });
console.log(`${out}  (${(statSync(out).size / 1e6).toFixed(2)} MB)`);
