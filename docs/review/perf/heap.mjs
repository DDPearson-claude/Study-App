// Heap snapshot helpers: count detached DOM nodes and print retainer paths for a few.
export async function snapshot(cdp) {
  const chunks = [];
  const on = (e) => chunks.push(e.chunk);
  cdp.on('HeapProfiler.addHeapSnapshotChunk', on);
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false, captureNumericValue: false });
  cdp.off('HeapProfiler.addHeapSnapshotChunk', on);
  return JSON.parse(chunks.join(''));
}
export function analyze(snap, { match = /^Detached /, paths = 5, depth = 14 } = {}) {
  const m = snap.snapshot.meta, nf = m.node_fields.length, ef = m.edge_fields.length;
  const N = snap.nodes, E = snap.edges, S = snap.strings;
  const nTypes = m.node_types[0], eTypes = m.edge_types[0];
  const iType = m.node_fields.indexOf('type'), iName = m.node_fields.indexOf('name'), iEC = m.node_fields.indexOf('edge_count'), iId = m.node_fields.indexOf('id');
  const eType = m.edge_fields.indexOf('type'), eName = m.edge_fields.indexOf('name_or_index'), eTo = m.edge_fields.indexOf('to_node');
  const count = N.length / nf;
  const firstEdge = new Uint32Array(count + 1);
  for (let i = 0, e = 0; i < count; i++) { firstEdge[i] = e; e += N[i * nf + iEC] * ef; firstEdge[count] = e; }
  const rev = Array.from({ length: count }, () => []);
  for (let i = 0; i < count; i++) {
    for (let e = firstEdge[i]; e < firstEdge[i + 1]; e += ef) {
      const to = E[e + eTo] / nf, t = eTypes[E[e + eType]];
      if (t === 'weak') continue;
      rev[to].push([i, e]);
    }
  }
  const name = (i) => S[N[i * nf + iName]];
  const type = (i) => nTypes[N[i * nf + iType]];
  const edgeName = (e) => { const t = eTypes[E[e + eType]]; const v = E[e + eName]; return (t === 'element' || t === 'hidden') ? '[' + v + ']' : S[v]; };
  const detached = [];
  const byName = {};
  const iDet = m.node_fields.indexOf('detachedness');
  const isDet = (i) => iDet >= 0 ? N[i * nf + iDet] === 2 : match.test(name(i));
  for (let i = 0; i < count; i++) { if (isDet(i)) { const n = name(i).slice(0, 40); detached.push(i); byName[n] = (byName[n] || 0) + 1; } }
  const out = { total: detached.length, byName: Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 12), paths: [] };
  // retainer path: BFS upward from a detached node, skipping other detached DOM nodes, until a non-DOM JS object chain reaches something named
  for (const start of detached.filter((i, k) => k % Math.max(1, Math.floor(detached.length / paths)) === 0).slice(0, paths)) {
    const seen = new Set([start]); let frontier = [[start, []]]; let found = null;
    for (let d = 0; d < depth && frontier.length && !found; d++) {
      const next = [];
      for (const [n, path] of frontier) {
        for (const [from, e] of rev[n]) {
          if (seen.has(from)) continue; seen.add(from);
          const p = path.concat([type(from) + ':' + name(from).slice(0, 60) + ' .' + edgeName(e)]);
          if (type(from) === 'synthetic' || /^\(GC roots|^Window|^system \/ NativeContext/.test(name(from))) { found = p; break; }
          next.push([from, p]);
        }
        if (found) break;
      }
      frontier = next.slice(0, 4000);
    }
    out.paths.push({ node: name(start), path: (found || ['<no root within depth>']).slice(-10) });
  }
  return out;
}
