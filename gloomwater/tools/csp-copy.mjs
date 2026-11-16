// csp-copy.mjs — a built page's copy under a host's Content-Security-Policy, for the browser gate (tools/tests/csp-art.scenario.mjs).
// The user's phone in the host app (16 November 2026): the host's policy refuses fetch() of a data: URI (connect-src) while images
// stay allowed (img-src), so an image decode through fetch(data:) fails there and nowhere else (the Landing's sheet was blank, the drawn
// Chart fell back to the list). The copy carries the host's policy in a <meta http-equiv> placed before any script, so every load of
// the copy runs under it.
//   node tools/csp-copy.mjs --html=tools/out/x/dev.html [--out=tools/out/x/dev.csp.html] [--policy="connect-src 'self'"]
// Exports HOST_CSP, cspHtml(html, policy), cspCopy(src, out?, policy?) (→ the copy's path).
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The host's policy as the gate plays it: the page's own origin and the fonts; no data: for connect-src. */
export const HOST_CSP = "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com";

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The page's text with the policy's meta first in <head> (after its charset meta, before any script). Throws if it cannot be placed. */
export function cspHtml(html, policy = HOST_CSP) {
  const src = String(html);
  if (/<meta[^>]+http-equiv\s*=\s*["']?content-security-policy/i.test(src)) return src;   // (a copy already)
  const meta = `<meta http-equiv="Content-Security-Policy" content="${escAttr(policy)}">`;
  const head = /<head\b[^>]*>/i.exec(src);
  if (!head) throw new Error('csp-copy: no <head> in the page');
  let at = head.index + head[0].length;
  const cs = /<meta\s+charset\s*=[^>]*>/i.exec(src.slice(at, at + 400));
  if (cs) at += cs.index + cs[0].length;
  const out = `${src.slice(0, at)}${meta}${src.slice(at)}`;
  const m = out.indexOf(meta), s = out.search(/<script\b/i);
  if (s >= 0 && s < m) throw new Error('csp-copy: a script comes before the policy');
  return out;
}

/** Write the CSP copy of a built page (default: beside it, <name>.csp.html); returns its path. */
export function cspCopy(src, out = String(src).replace(/\.html?$/i, '') + '.csp.html', policy = HOST_CSP) {
  writeFileSync(out, cspHtml(readFileSync(src, 'utf8'), policy));
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const src = resolve(root, String(args.html || 'index.html'));
  const out = cspCopy(src, args.out ? resolve(root, String(args.out)) : undefined, typeof args.policy === 'string' ? args.policy : HOST_CSP);
  console.log(`csp-copy: ${out}`);
}
