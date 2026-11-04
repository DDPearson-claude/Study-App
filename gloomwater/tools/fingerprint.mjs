// tools/fingerprint.mjs — a stable per-export fingerprint of src/data.js, so validate-data can prove that the flag-off builds
// (v1, and v2 with WALK_ENABLED) stay exactly as they were before v3 (CONTRACT §13.0, §13.10). Functions are fingerprinted by their
// source text, numbers by value (NaN / ±Infinity tagged), objects with sorted keys. The reference file tools/tests/v1-exports.json
// was generated from c0e0ab9 (the last commit before any v3 data) and is refreshed only on purpose:
//   node tools/validate-data.mjs --refresh-fingerprint
import { createHash } from 'node:crypto';

export function stable(v, seen = new Set()) {
  if (v === null) return 'null';
  if (v === undefined) return 'undef';
  const t = typeof v;
  if (t === 'number') return Number.isNaN(v) ? 'NaN' : v === Infinity ? 'Inf' : v === -Infinity ? '-Inf' : JSON.stringify(v);
  if (t === 'string' || t === 'boolean') return JSON.stringify(v);
  if (t === 'function') return `fn:${JSON.stringify(v.toString())}`;
  if (t === 'bigint' || t === 'symbol') return `${t}:${String(v)}`;
  if (seen.has(v)) return 'cycle';
  seen.add(v);
  let out;
  if (ArrayBuffer.isView(v)) out = `${v.constructor.name}[${Array.from(v).join(',')}]`;
  else if (Array.isArray(v)) out = `[${v.map((x) => stable(x, seen)).join(',')}]`;
  else out = `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k], seen)}`).join(',')}}`;
  seen.delete(v);
  return out;
}

export const hash = (v) => createHash('sha256').update(stable(v)).digest('hex').slice(0, 24);

/** {exportName: hash} for the given names (default: every export of the module namespace). */
export function fingerprint(D, names = Object.keys(D)) {
  return Object.fromEntries(names.slice().sort().map((k) => [k, hash(D[k])]));
}
