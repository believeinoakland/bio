#!/usr/bin/env node
/* proto-mem (THROWAWAY): the platform's OWN alarm, ungated, on a COPY of a seeded room (seed.mjs), in a fresh process: the seed left one owed unread 1.9 MB reading. Any request re-arms the alarm
   (Store.fetch -> scheduler.heal); the alarm then runs the due consumers, pending-work among them, and re-arms itself until the reading is finished. The whole timeline is sampled (VmRSS every 10 ms,
   the JS heap by the inspector every ~50 ms); every `scheduler_consumer` line the scheduler logs is kept with its arrival time so a peak can be put against the consumer that was running.
   node proto-mem/measure-natural.mjs --seed=/home/user/seed100 [--out=name] [--piece=N] */
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync, readFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const seed = arg.seed;
if (seed) { try { process.env.PROTO_MEM_TOKEN = readFileSync(seed + "/token.txt", "utf8").trim(); } catch { /* an older seed: --extra needs token.txt */ } }
const { start, status, sleep, snapOf, resetHwm, r1, makeText, uploadFile, promoteDoc } = await import("./lib.mjs"); if (!seed) { console.error("--seed required"); process.exit(2); }
const bundle = "/home/user/wt-mem/proto-mem/dist/meas.bundled.mjs";
const t = mkdtempSync(join(tmpdir(), "proto-mem-n-"));
cpSync(seed + "/do", t + "/do", { recursive: true }); symlinkSync(seed + "/r2", t + "/r2");
if (arg.extra) {   /* one more unread document of --extra bytes, registered by its own process (gate shut) so the measured process meets it cold */
  const u = await start({ bundle, env: { MEAS_GATE: "1" }, persist: t, session: readFileSync(seed + "/session.txt", "utf8").trim() });
  await u.meas("registry");
  let k = 0;
  for (const size of String(arg.extra).split(",").map(Number)) {
    const up = await uploadFile(u, Buffer.from(makeText(size, 4242 + k)), { name: `extra${k}.txt`, statement: `proto-mem extra owed reading ${k}` });
    if (!(up.json && up.json.result)) throw new Error("extra upload: " + up.status + " " + JSON.stringify(up.json || up.text).slice(0, 300));
    const pr = await promoteDoc(u, up.json.result.document, `extra owed reading ${k++}`);
    if (!(pr.result && pr.result.ok)) throw new Error("extra promote failed " + JSON.stringify(pr.result).slice(0, 200));
  }
  await u.close();
}
const w = await start({ bundle, env: { MEAS_GATE: "1", ...(arg.piece ? { PROTO_PIECE_UNITS: String(arg.piece) } : {}), ...Object.fromEntries(String(arg.env || "").split(",").filter(Boolean).map((kv) => kv.split("="))) }, persist: t, session: null });
const out = { when: new Date().toISOString(), seed: JSON.parse(readFileSync(seed + "/seed-summary.json", "utf8")), piece_units_env: arg.piece || null, env_extra: arg.env || null };
try {
  await w.meas("registry"); await sleep(1000);
  out.baseline = { ...snapOf(w), heap: arg.noheap ? { used: null, total: null } : await w.heap() };
  const jobRow = async () => (await w.meas("sql", { sql: "SELECT sha,kind,state,cursor FROM keeps_pending WHERE state NOT IN ('finished','final','refused') ORDER BY registered_at DESC LIMIT 1" }))[0] || null;
  out.owed_before = await jobRow();
  const mark = w.logs.length, t0 = Date.now(); resetHwm(w.pid);
  const series = []; let polling = true;
  const rssTimer = setInterval(() => { try { series.push([Date.now() - t0, status(w.pid).rss]); } catch { /* */ } }, 10);
  const heapSeries = [];
  const hp = (async () => { while (polling && !arg.noheap) { try { const h = await w.heap(); heapSeries.push([Date.now() - t0, h.used, h.total]); } catch { /* */ } await sleep(50); } })();
  /* --drive=natural (default): the platform's own alarm is let run (it was shut while the Store was instantiated and the baseline taken) and any request re-arms it;
     --drive=onalarm: the gate stays shut and onAlarm() is called by hand back to back (every due consumer, as the alarm runs them), until nothing is owed;
     --drive=pending: the gate stays shut and ONLY the pending-work consumer is ticked by hand back to back. */
  const drive = arg.drive || "natural";
  let done = false, left = null;
  if (drive === "natural") {
    await w.meas("gate", { closed: false });
    await w.call("/?op=stats");   /* any request re-arms */
    for (let i = 0; i < 2400 && !done; i++) { await sleep(200); left = await jobRow(); done = !left; }
  } else {
    for (let i = 0; i < 3000 && !done; i++) {
      if (drive === "onalarm") await w.meas("onalarm"); else await w.meas("tick", { name: "pending-work" });
      left = await jobRow(); done = !left;
    }
  }
  out.drive = drive;
  polling = false; await hp; clearInterval(rssTimer);
  const end = status(w.pid);
  out.finished = done; out.wall_ms = Date.now() - t0;
  const rs = series.map((x) => x[1]);
  out.rss = { start: out.baseline.rss, peak_sampled: r1(Math.max(...rs)), vm_hwm_since_reset: r1(end.hwm), end: r1(end.rss), peak_above_baseline: r1(Math.max(end.hwm, ...rs) - out.baseline.rss) };
  out.heap = arg.noheap ? null : { used_start: out.baseline.heap.used, used_peak_seen: Math.max(...heapSeries.map((x) => x[1])), total_start: out.baseline.heap.total, total_peak_seen: Math.max(...heapSeries.map((x) => x[2])), samples: heapSeries.length };
  out.consumer_lines = w.logs.slice(mark).map((l) => { try { const o = JSON.parse(l.line); return o.scheduler_consumer ? { arrived_ms: l.t - t0, ...o.scheduler_consumer, ms: o.scheduler_consumer.ended === null ? null : o.scheduler_consumer.ended - o.scheduler_consumer.started } : o.scheduler_alarm ? { arrived_ms: l.t - t0, alarm: o.scheduler_alarm } : null; } catch { return null; } }).filter(Boolean);
  out.r2 = w.logs.slice(mark).map((l) => { try { const o = JSON.parse(l.line); return o.meas_r2 ? { arrived_ms: l.t - t0, ...o.meas_r2 } : null; } catch { return null; } }).filter(Boolean);
  /* the RSS timeline thinned to every 100 ms, with the heap beside it */
  out.extra_bytes = arg.extra || null;
  out.timeline = series.filter((_, i) => i % 10 === 0).map(([ms, v]) => [ms, r1(v)]);
  out.heap_timeline = heapSeries.filter((_, i) => i % 4 === 0);
  out.heap_all = heapSeries;   /* every probe: [ms, used MB, total MB] */
} finally { await w.close(); rmSync(t, { recursive: true, force: true }); }
mkdirSync("/home/user/wt-mem/proto-mem/results", { recursive: true });
writeFileSync(`/home/user/wt-mem/proto-mem/results/${arg.out || "natural"}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ finished: out.finished, wall_ms: out.wall_ms, rss: out.rss, heap: out.heap, consumers_logged: out.consumer_lines.length }));
