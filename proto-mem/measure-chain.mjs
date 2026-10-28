#!/usr/bin/env node
/* proto-mem (THROWAWAY): the chain of pieces with the platform's own alarm on a COPY of a seeded room, in cold processes, for the PROTO_WINDOW_BYTES / PROTO_CHAIN_BYTES study.
   node proto-mem/measure-chain.mjs --seed=/home/user/seed100 --out=name [--extra=8000000] [--only-extra] [--env=K=V,K=V] [--recycle-ms=N] [--maxwait-s=1500]
   --extra: one more unread document of that many bytes (registered by its own process); --only-extra: first end the seed's own owed 1.9 MB reading (row removed), so the extra is the only reading owed.
   --recycle-ms=N: every N ms of wall the workerd process is closed and a new one started on the persisted state (imitates an eviction or reset); the run is in segments.
   Samples VmRSS every 10 ms and the JS heap (inspector) every ~50 ms; the heap FLOOR is the minimum `used` in each 3 s window. */
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync, readFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const seed = arg.seed;
if (!seed) { console.error("--seed required"); process.exit(2); }
try { process.env.PROTO_MEM_TOKEN = readFileSync(seed + "/token.txt", "utf8").trim(); } catch { /* */ }
const { start, status, sleep, resetHwm, r1, makeText, uploadFile, promoteDoc } = await import("./lib.mjs");
const bundle = process.env.MEAS_BUNDLE || "/home/user/wt-chain/proto-mem/dist/meas.bundled.mjs";
const envKV = Object.fromEntries(String(arg.env || "").split(",").filter(Boolean).map((kv) => { const i = kv.indexOf("="); return [kv.slice(0, i), kv.slice(i + 1)]; }));
const t = mkdtempSync(join(tmpdir(), "proto-mem-c-"));
const prepared = arg.prepared;   /* --prepared=DIR: a room made by --save-prepared (the extra file already registered); its own r2 and do are copied, no session is needed */
if (prepared) { cpSync(prepared + "/do", t + "/do", { recursive: true }); cpSync(prepared + "/r2", t + "/r2", { recursive: true }); }
else { cpSync(seed + "/do", t + "/do", { recursive: true }); symlinkSync(seed + "/r2", t + "/r2"); }
if (!prepared && (arg.extra || arg["only-extra"])) {
  const u = await start({ bundle, env: { MEAS_GATE: "1" }, persist: t, session: readFileSync(seed + "/session.txt", "utf8").trim() });
  await u.meas("registry");
  if (arg["only-extra"]) await u.meas("sql", { sql: "DELETE FROM keeps_pending WHERE state NOT IN ('finished','final','refused')" });
  let k = 0;
  for (const size of String(arg.extra || "").split(",").filter(Boolean).map(Number)) {
    const up = await uploadFile(u, Buffer.from(makeText(size, 4242 + k)), { name: `extra${k}.txt`, statement: `proto-mem extra owed reading ${k}` });
    if (!(up.json && up.json.result)) throw new Error("extra upload: " + up.status);
    const pr = await promoteDoc(u, up.json.result.document, `extra owed reading ${k++}`);
    if (!(pr.result && pr.result.ok)) throw new Error("extra promote failed");
  }
  await u.close();
}
if (arg["save-prepared"]) { cpSync(t + "/do", arg["save-prepared"] + "/do", { recursive: true }); cpSync(seed + "/r2", arg["save-prepared"] + "/r2", { recursive: true, dereference: true }); cpSync(t + "/r2", arg["save-prepared"] + "/r2", { recursive: true, dereference: true, force: true }); rmSync(t, { recursive: true, force: true }); console.log("prepared", arg["save-prepared"]); process.exit(0); }
const recycleMs = arg["recycle-ms"] ? Number(arg["recycle-ms"]) : null;
const maxWait = Number(arg["maxwait-s"] || 1500) * 1000;
const out = { when: new Date().toISOString(), seed_summary: JSON.parse(readFileSync(seed + "/seed-summary.json", "utf8")), env: envKV, extra_bytes: arg.extra || null, only_extra: !!arg["only-extra"], recycle_ms: recycleMs, segments: [] };
const T0 = Date.now();
let done = false;
const WIN = 3000;
const floors = (hs) => { const w = new Map(); for (const [ms, used] of hs) { const k = Math.floor(ms / WIN); w.set(k, Math.min(w.get(k) ?? Infinity, used)); } return [...w.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => [k * WIN / 1000, v]); };
try {
  while (!done && Date.now() - T0 < maxWait) {
    const w = await start({ bundle, env: { MEAS_GATE: "1", ...envKV }, persist: t, session: null });
    const seg = { n: out.segments.length };
    await w.meas("registry"); await sleep(1000);
    const b = status(w.pid); seg.baseline = { rss: r1(b.rss), heap: await w.heap() };
    const jobRow = async () => (await w.meas("sql", { sql: "SELECT sha,kind,state,cursor FROM keeps_pending WHERE state NOT IN ('finished','final','refused') AND kind='reading' LIMIT 1" }))[0] || null;
    const mark = w.logs.length, t0 = Date.now(); resetHwm(w.pid);
    const rss = [], heap = []; let polling = true;
    const rt = setInterval(() => { try { rss.push([Date.now() - t0, status(w.pid).rss]); } catch { /* */ } }, 10);
    const gcEvery = arg["gc-every-ms"] ? Number(arg["gc-every-ms"]) : null, gcs = []; let lastGc = Date.now();
    const hp = (async () => { while (polling) { try { const h = await w.heap(); heap.push([Date.now() - t0, h.used, h.total]);
      if (gcEvery && Date.now() - lastGc >= gcEvery) { lastGc = Date.now(); const r = await w.meas("gc", { mode: "direct" }); const h2 = await w.heap(); gcs.push({ at_ms: Date.now() - t0, used_before: h.used, used_after: h2.used, total_after: h2.total, rss_after: r1(status(w.pid).rss), gc_fn: r.gc_fn, gc_called: !!r.gc_called, gc_ms: r.gc_ms ?? null }); } } catch { /* */ } await sleep(50); } })();
    await w.meas("gate", { closed: false });
    await w.call("/?op=stats");
    while (Date.now() - T0 < maxWait && (recycleMs === null || Date.now() - t0 < recycleMs)) {
      await sleep(300);
      if (arg.verbose && Date.now() % 5000 < 400) { const cl = w.logs.slice(mark).filter((l) => l.line.includes('proto_chain')).slice(-1)[0]; console.error(Math.round((Date.now() - t0) / 1000) + 's', cl ? cl.line.slice(0, 200) : '-', JSON.stringify(await w.meas('sql', { sql: "SELECT sha,kind,state,attempts,due_at,last_why FROM keeps_pending WHERE state NOT IN ('finished','final','refused')" }))); }
      try { if (!(await jobRow())) { done = true; break; } } catch { /* busy */ }
    }
    polling = false; await hp; clearInterval(rt);
    const end = status(w.pid);
    seg.wall_ms = Date.now() - t0;
    seg.rss = { start: seg.baseline.rss, end: r1(end.rss), vm_hwm: r1(end.hwm), peak_sampled: r1(Math.max(...rss.map((x) => x[1]))), peak_above_baseline: r1(Math.max(end.hwm, ...rss.map((x) => x[1])) - seg.baseline.rss) };
    const fl = floors(heap);
    seg.heap = { baseline_used: seg.baseline.heap.used, peak_used: Math.max(...heap.map((x) => x[1])), peak_total: Math.max(...heap.map((x) => x[2])), floor_windows_3s: fl.length,
      floor_first: fl[0] && fl[0][1], floor_last: fl.length ? fl[fl.length - 1][1] : null, floor_min: Math.min(...fl.map((x) => x[1])), floor_max: Math.max(...fl.map((x) => x[1])), floors: fl };
    seg.chain_lines = w.logs.slice(mark).map((l) => { try { const o = JSON.parse(l.line); return o.proto_chain ? { arrived_ms: l.t - t0, ...o.proto_chain } : null; } catch { return null; } }).filter(Boolean);
    seg.readout_reads = w.logs.slice(mark).filter((l) => l.line.startsWith('{"proto_readout_read"')).length;
    /* RSS and heap around each rest: the value just before rest_begin and the minimum during the rest */
    seg.rests = [];
    for (let i = 0; i < seg.chain_lines.length; i++) {
      const c = seg.chain_lines[i]; if (c.event !== "rest_begin") continue;
      const e = seg.chain_lines.slice(i + 1).find((x) => x.event === "rest_end");
      const a = c.arrived_ms, z = e ? e.arrived_ms : seg.wall_ms;
      const rr = rss.filter((x) => x[0] >= a - 200 && x[0] <= z), hh = heap.filter((x) => x[0] >= a - 200 && x[0] <= z);
      const before = rss.filter((x) => x[0] <= a).slice(-1)[0], hbefore = heap.filter((x) => x[0] <= a).slice(-1)[0];
      seg.rests.push({ at_ms: a, rest_ms: z - a, rss_before: before && r1(before[1]), rss_min_during: r1(Math.min(...rr.map((x) => x[1]))), heap_used_before: hbefore && hbefore[1], heap_used_min_during: Math.min(...hh.map((x) => x[1])), heap_used_end: hh.length ? hh[hh.length - 1][1] : null,
        isolate_age_at_rest_begin: c.isolate_age_ms, isolate_age_at_rest_end: e ? e.isolate_age_ms : null });
    }
    seg.gc_probes = gcs;
    seg.timeline = rss.filter((_, i) => i % 50 === 0).map(([ms, v]) => [ms, r1(v)]);
    seg.heap_series = heap.filter((_, i) => i % 4 === 0);
    out.segments.push(seg);
    await w.close();
  }
  out.finished = done; out.wall_ms = Date.now() - T0;
} finally { rmSync(t, { recursive: true, force: true }); }
mkdirSync("/home/user/wt-chain/proto-mem/results", { recursive: true });
writeFileSync(`/home/user/wt-chain/proto-mem/results/${arg.out || "chain"}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ out: arg.out, finished: out.finished, wall_ms: out.wall_ms, segments: out.segments.map((s) => ({ wall_ms: s.wall_ms, rss: s.rss, heap: { ...s.heap, floors: undefined }, rests: s.rests.length })) }));
