// audio-spectro.mjs — WAV and spectrogram PNG writers for audio renders and recordings (tools/audio-render.mjs, the af-audio
// browser scenario). pcm = [Int16-range number arrays per channel] (L, R).
import { deflateSync } from 'node:zlib';
export function wav(pcm, sr) {
  const [L, R] = pcm, n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(L[i], 44 + i * 4); b.writeInt16LE(R[i], 46 + i * 4); }
  return b;
}
const crcT = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc = (buf) => { let c = -1; for (let i = 0; i < buf.length; i++) c = crcT[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
export function png(w, h, rgb) {
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ar = re[i + j], ai = im[i + j], br = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, bi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr; re[i + j] = ar + br; im[i + j] = ai + bi; re[i + j + len / 2] = ar - br; im[i + j + len / 2] = ai - bi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } }
  }
}
/** A spectrogram (log frequency 40 Hz – 11 kHz) over a peak envelope; marks: [[label, seconds]] drawn as ticks under it. */
export function spectrogram(pcm, sr, marks = []) {
  const x = pcm[0].map((v, i) => (v + pcm[1][i]) / 65534);
  const N = 2048, hop = Math.max(64, Math.round(sr * 0.008));
  const cols = Math.max(1, Math.floor((x.length - N) / hop)), H = 240, EH = 60, W = cols;
  const rgb = Buffer.alloc(W * (H + EH) * 3, 0);
  const lo = Math.log(40), hi = Math.log(11000);
  const win = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));
  const set = (cx, cy, r, g, b) => { const o = (cy * W + cx) * 3; rgb[o] = r; rgb[o + 1] = g; rgb[o + 2] = b; };
  for (let c = 0; c < cols; c++) {
    const re = new Float64Array(N), im = new Float64Array(N);
    let peak = 0;
    for (let i = 0; i < N; i++) { const v = x[c * hop + i] || 0; re[i] = v * win[i]; if (i < hop) peak = Math.max(peak, Math.abs(v)); }
    fft(re, im);
    for (let y = 0; y < H; y++) {
      const f = Math.exp(lo + (hi - lo) * (1 - y / (H - 1))), bin = Math.min(N / 2 - 1, Math.round(f * N / sr));
      const m = Math.hypot(re[bin], im[bin]) / (N / 4);
      const db = 20 * Math.log10(m + 1e-9), k = Math.max(0, Math.min(1, (db + 90) / 80));
      // ink on bone: quiet = bone (#e9e2cf), loud = night ink (#14161e), the loudest tinted lantern amber
      const r = Math.round(233 - k * 213 + (k > 0.85 ? (k - 0.85) * 900 : 0)), g = Math.round(226 - k * 204 + (k > 0.85 ? (k - 0.85) * 420 : 0)), b = Math.round(207 - k * 177);
      set(c, y, Math.min(255, r), Math.min(255, g), Math.max(0, b));
    }
    const e = Math.round(Math.min(1, peak) * (EH - 4));
    for (let y = 0; y < EH; y++) { const on = EH - 1 - y < e; set(c, H + y, on ? (peak > 0.98 ? 200 : 60) : 22, on ? (peak > 0.98 ? 40 : 66) : 24, on ? (peak > 0.98 ? 40 : 90) : 32); }
  }
  // 0.5 s ticks, frequency gridlines at 100 Hz, 1 kHz, 10 kHz, and the marks
  for (let s = 0; s * sr / hop < W; s += 0.5) { const cx = Math.round(s * sr / hop); for (let y = 0; y < (s % 1 ? 6 : 12); y++) if (cx < W) set(cx, y, 200, 60, 60); }
  for (const f of [100, 1000, 10000]) { const y = Math.round((1 - (Math.log(f) - lo) / (hi - lo)) * (H - 1)); for (let cx = 0; cx < W; cx += 3) set(cx, y, 120, 140, 200); }
  for (const [, s] of marks) { const cx = Math.round(s * sr / hop); if (cx >= 0 && cx < W) for (let y = H; y < H + EH; y += 2) set(cx, y, 255, 179, 71); }
  return png(W, H + EH, rgb);
}


/** b64 interleaved int16 (debug.audioRecord) → [L, R] arrays. */
export function fromRecord(rec) {
  const bin = Buffer.from(rec.b64, 'base64');
  const n = bin.length / 4, L = new Array(n), R = new Array(n);
  for (let i = 0; i < n; i++) { L[i] = bin.readInt16LE(i * 4); R[i] = bin.readInt16LE(i * 4 + 2); }
  return [L, R];
}
/** RMS of the mono mix between two times (s). */
export function rmsBetween(pcm, sr, t0, t1) {
  const a = Math.max(0, Math.floor(t0 * sr)), b = Math.min(pcm[0].length, Math.floor(t1 * sr));
  let s = 0; for (let i = a; i < b; i++) { const v = (pcm[0][i] + pcm[1][i]) / 65534; s += v * v; }
  return b > a ? Math.sqrt(s / (b - a)) : 0;
}
