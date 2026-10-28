/* proto-mem helper: a V8 heap snapshot of the plane isolate through the inspector (HeapProfiler.takeHeapSnapshot, which collects garbage first), summarised by node type and constructor name
   (self size of nodes still reachable). Returns { total_self_bytes, by_type, top_constructors }. The snapshot is parsed in memory and not kept. */
export async function heapSnapshotSummary(port, name = "bio-plane", top = 25) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const t = list.find((x) => x.id === `core:user:${name}`);
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  const chunks = []; let id = 0; const pend = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.method === "HeapProfiler.addHeapSnapshotChunk") chunks.push(d.params.chunk); else if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("HeapProfiler.enable");
  const r = await Promise.race([send("HeapProfiler.takeHeapSnapshot", { reportProgress: false, captureNumericValue: false }), new Promise((res) => setTimeout(() => res({ timeout: true }), 110000))]);
  ws.close();
  if (r.timeout || !chunks.length) return { error: "no snapshot", timeout: !!r.timeout };
  const snap = JSON.parse(chunks.join(""));
  const f = snap.snapshot.meta.node_fields, nf = f.length, nodes = snap.nodes, strings = snap.strings;
  const iType = f.indexOf("type"), iName = f.indexOf("name"), iSize = f.indexOf("self_size");
  const types = snap.snapshot.meta.node_types[0];
  const byType = {}, byName = {}; let total = 0;
  for (let i = 0; i < nodes.length; i += nf) {
    const ty = types[nodes[i + iType]], sz = nodes[i + iSize]; total += sz;
    byType[ty] = (byType[ty] || 0) + sz;
    const key = ty + ":" + (ty === "string" || ty === "concatenated string" || ty === "sliced string" ? "(string)" : String(strings[nodes[i + iName]]).slice(0, 60));
    byName[key] = (byName[key] || 0) + sz;
  }
  const mb = (x) => Math.round(x / 1048576 * 10) / 10;
  return { total_self_mb: mb(total), by_type_mb: Object.fromEntries(Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, mb(v)]).filter(([, v]) => v >= 0.1)),
    top: Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, top).map(([k, v]) => [k, mb(v)]) };
}
