#!/usr/bin/env node
/* proto-mem (THROWAWAY): each alarm consumer COLD. For every consumer of the scheduler's registry, and for the whole onAlarm: a FRESH Miniflare/workerd process is started on a copy of the seeded room
   (seed.mjs; the DO SQLite copied, the R2 directory shared read-only in practice), the Store is instantiated, 1 s idle, then that one consumer's tick is run once and its resident-memory peak taken
   (VmHWM since a reset just before it, and 5 ms samples). mode "due" ticks the consumer only if its own due() says so (as onAlarm does); mode "forced" ticks it whatever due() says.
   node proto-mem/measure-consumers.mjs --seed=/home/user/seed100 [--out=name] [--only=name1,name2] [--modes=due,forced] */
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync, readFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { start, sleep, measuredOn, snapOf } from "./lib.mjs";

const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const seed = arg.seed; if (!seed) { console.error("--seed required"); process.exit(2); }
const bundle = "/home/user/wt-chain/proto-mem/dist/meas.bundled.mjs";
const modes = (arg.modes || "due,forced").split(",");
const name = arg.out || "consumers-cold";
const out = { when: new Date().toISOString(), seed: JSON.parse(readFileSync(seed + "/seed-summary.json", "utf8")), results: [] };

async function trial(label, fn) {
  const t = mkdtempSync(join(tmpdir(), "proto-mem-c-"));
  cpSync(seed + "/do", t + "/do", { recursive: true }); symlinkSync(seed + "/r2", t + "/r2");
  const w = await start({ bundle, env: { MEAS_GATE: "1" }, persist: t });
  try {
    await w.meas("registry"); await sleep(1000);
    const baseline = snapOf(w), heap = await w.heap();
    const m = await fn(w);
    return { baseline: baseline.rss, baseline_heap: heap, ...m };
  } finally { await w.close(); rmSync(t, { recursive: true, force: true }); }
}

let registry = [];
await trial("registry", async (w) => { registry = await w.meas("registry"); return {}; });
const only = arg.only ? arg.only.split(",") : null;
for (const mode of modes) {
  for (const n of registry.concat(["__whole_onAlarm__"])) {
    if (only && !only.includes(n)) continue;
    const r = await trial(n, async (w) => {
      const mark = w.logs.length;
      const m = await measuredOn(w, `${n} (${mode})`, () => n === "__whole_onAlarm__" ? w.meas("onalarm") : w.meas("tick", { name: n, force: mode === "forced" }), 5);
      const logs = n === "__whole_onAlarm__" ? w.logs.slice(mark).map((l) => l.line).filter((l) => l.includes("scheduler_consumer")).map((l) => { try { const c = JSON.parse(l).scheduler_consumer; return `${c.name}:${c.ended - c.started}ms`; } catch { return l; } }) : undefined;
      return { op: m.m, was_due: n === "__whole_onAlarm__" ? null : m.value && m.value.was_due, tick_ms: m.value && m.value.ms, result: n === "__whole_onAlarm__" ? undefined : (m.value && m.value.result || "").slice(0, 160), error: m.error || (m.value && (m.value.error || m.value.due_error)), consumers_run: logs };
    });
    out.results.push({ mode, consumer: n, baseline: r.baseline, baseline_heap: r.baseline_heap, ...r.op, was_due: r.was_due, tick_ms: r.tick_ms, result: r.result, error: r.error, consumers_run: r.consumers_run });
    console.error(`${mode} ${n}: base ${r.baseline} peak ${r.op.peak_rss} +${r.op.peak_above_start} heapused ${r.baseline_heap.used}->${r.op.heap_used_peak_seen} due ${r.was_due}`);
  }
}
mkdirSync("/home/user/wt-chain/proto-mem/results", { recursive: true });
writeFileSync(`/home/user/wt-chain/proto-mem/results/${name}.json`, JSON.stringify(out, null, 1));
console.error("wrote", name);
