#!/usr/bin/env node
/* proto-mem (THROWAWAY): allocation attribution of the reading path. For each tick of the `pending-work` consumer on a COPY of a room, the V8 inspector's SAMPLING HEAP PROFILER
   (HeapProfiler.startSampling, samplingInterval 4096, includeObjectsCollectedByMajorGC/MinorGC = true: counts the bytes allocated, live or collected) is started before the tick and stopped after,
   and the profile is reduced to the self bytes per (function, bundle line:col) with the call stack of its first callers. Gate shut; the driver ticks by hand.
   node proto-mem/alloc-profile.mjs --room=/home/user/seed100 [--seed=/home/user/seed100 (token)] --ticks=3 --out=name [--env=K=V,K=V] [--interval=4096] [--nocollected] [--tick=pending-work] */
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync, readFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os"; import { join, dirname } from "node:path"; import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const room = arg.room, seed = arg.seed || "/home/user/seed100";
try { process.env.PROTO_MEM_TOKEN = readFileSync(seed + "/token.txt", "utf8").trim(); } catch { /* */ }
const { start, sleep, r1 } = await import("./lib.mjs");
const bundle = process.env.MEAS_BUNDLE || join(here, "dist/meas.bundled.mjs");
const envKV = Object.fromEntries(String(arg.env || "").split(",").filter(Boolean).map((kv) => { const i = kv.indexOf("="); return [kv.slice(0, i), kv.slice(i + 1)]; }));
const t = mkdtempSync(join(tmpdir(), "alloc-"));
cpSync(room + "/do", t + "/do", { recursive: true });
if (room === seed || arg.linkr2) symlinkSync(room + "/r2", t + "/r2"); else cpSync(room + "/r2", t + "/r2", { recursive: true });
const w = await start({ bundle, env: { MEAS_GATE: "1", ...envKV }, persist: t, session: null });
const list = await (await fetch(`http://127.0.0.1:${w.inspectorPort}/json`)).json();
const tg = list.find((x) => x.id === "core:user:bio-plane");
const ws = new WebSocket(tg.webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const heapU = async () => { const r = await send("Runtime.getHeapUsage"); return { used: r1(r.result.usedSize / 1048576), total: r1(r.result.totalSize / 1048576) }; };
const out = { when: new Date().toISOString(), room, env: envKV, interval: Number(arg.interval || 4096), collected_included: !arg.nocollected, ticks: [] };
try {
  await w.meas("registry"); await sleep(1000);
  await send("Runtime.enable"); await send("HeapProfiler.enable");
  out.baseline_heap = await heapU();
  const jobRow = async () => (await w.meas("sql", { sql: "SELECT sha,kind,state,cursor FROM keeps_pending WHERE state NOT IN ('finished','final','refused') AND kind='reading' LIMIT 1" }))[0] || null;
  const cnt = async () => (await w.meas("sql", { sql: "SELECT (SELECT count(*) FROM capture_text) n" }))[0].n;
  out.rows0 = await cnt();
  for (let k = 0; k < Number(arg.ticks || 3); k++) {
    const before = await jobRow(); if (!before) break;
    const mark = w.logs.length, n0 = await cnt();
    await send("HeapProfiler.startSampling", { samplingInterval: out.interval, includeObjectsCollectedByMajorGC: !arg.nocollected, includeObjectsCollectedByMinorGC: !arg.nocollected });
    const h0 = await heapU(); const t0 = Date.now();
    const tr = await w.meas("tick", { name: arg.tick || "pending-work" });
    const ms = Date.now() - t0;
    const r = await send("HeapProfiler.stopSampling");
    const p = r.result.profile;
    const flat = []; let total = 0;
    const walk = (n, stack) => {
      const cf = n.callFrame, nm = cf.functionName || "(anonymous)";
      const st = stack.concat([nm]);
      if (n.selfSize > 0) { flat.push({ fn: nm, url: cf.url.split("/").pop(), line: cf.lineNumber + 1, col: cf.columnNumber + 1, self: n.selfSize, stack: st.slice(-24).reverse().join(" < ") }); total += n.selfSize; }
      for (const c of n.children) walk(c, st);
    };
    walk(p.head, []);
    const after = await jobRow(), n1 = await cnt();
    const r2 = w.logs.slice(mark).map((l) => { try { const o = JSON.parse(l.line); return o.meas_r2 ? o.meas_r2 : null; } catch { return null; } }).filter(Boolean);
    out.ticks.push({ k: k + 1, ms, tick: { was_due: tr.was_due, result: tr.result, error: tr.error }, cursor_before: before.cursor && String(before.cursor).slice(0, 160), cursor_after: after && after.cursor && String(after.cursor).slice(0, 160), done: !after,
      rows_added: n1 - n0, r2: r2.filter((x) => x.op === "get"), heap_used_before: h0.used, total_sampled_bytes: total, nodes: flat.length, samples: (p.samples || []).length, flat });
  }
} finally { try { ws.close(); } catch { /* */ } await w.close(); rmSync(t, { recursive: true, force: true }); }
mkdirSync(join(here, "results"), { recursive: true });
writeFileSync(join(here, `results/alloc-${arg.out || "x"}.json`), JSON.stringify(out));
for (const k of out.ticks) console.log(JSON.stringify({ k: k.k, ms: k.ms, rows_added: k.rows_added, done: k.done, r2: k.r2, total_MB: r1(k.total_sampled_bytes / 1048576), was_due: k.tick.was_due, err: k.tick.error }));
process.exit(0);
