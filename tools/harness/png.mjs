// Reads the PNGs Playwright's screenshots produce (8-bit RGB or RGBA, not interlaced), so a test
// can look at what is actually drawn on the screen.
//
//   import { readPng } from '../../tools/harness/png.mjs';
//   const img = readPng(await page.screenshot({ clip }));  // { width, height, channels, data }
//   const i = (y * img.width + x) * img.channels;           // img.data[i], [i + 1], [i + 2] = r, g, b
import { inflateSync } from 'node:zlib';

export function readPng(buf) {
  let p = 8, width = 0, height = 0, channels = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), kind = buf.toString('latin1', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (kind === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (data[8] !== 8 || (data[9] !== 6 && data[9] !== 2) || data[12] !== 0) throw new Error('readPng: only 8-bit RGB(A), not interlaced');
      channels = data[9] === 6 ? 4 : 3;
    } else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    p += 12 + len;
  }
  const stride = width * channels, raw = inflateSync(Buffer.concat(idat)), out = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)], src = y * (stride + 1) + 1, row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[row + x - channels] : 0, b = y ? out[row - stride + x] : 0, c = y && x >= channels ? out[row - stride + x - channels] : 0;
      let v = raw[src + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[row + x] = v & 255;
    }
  }
  return { width, height, channels, data: out };
}
