#!/usr/bin/env node
/* proto-mem (THROWAWAY): COLD measurement. Every operation runs in a FRESH Miniflare/workerd process started on the persisted state the earlier steps left (DO SQLite + R2 on disk),
   as the live object meets each operation after a reset: a new isolate, the cursor on disk. The baseline of each process is its RSS after the Store is instantiated and 1 s idle.
   node proto-mem/measure-cold.mjs [--piece=N] [--files=1000000,1900000] [--out=name]
   Per file: process U uploads (op=captureupload), process P promotes (op=promote), then one process per owed piece (pending-work ticked by hand; the platform alarm is gated shut). */
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { start, makeText, uploadFile, promoteDoc, sleep, measuredOn, snapOf } from "./lib.mjs";

const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const bundle = arg.bundle || "/home/user/wt-mem/proto-mem/dist/meas.bundled.mjs";
const files = (arg.files || "1000000,1900000").split(",").map(Number);
const env = { MEAS_GATE: "1", ...(arg.piece ? { PROTO_PIECE_UNITS: String(arg.piece) } : {}) };
const name = arg.out || `cold-piece${arg.piece || "default"}`;
const dir = mkdtempSync(join(tmpdir(), "proto-mem-"));
const out = { when: new Date().toISOString(), piece_units_env: arg.piece || null, files: [] };

let session = null;
async function proc(fn) {
  const w = await start({ bundle, env, persist: dir, session });
  try {
    await w.meas("registry");              /* instantiates the Store */
    await sleep(1000);
    const baseline = { ...snapOf(w), heap: await w.heap() };
    const r = await fn(w, baseline);
    return { baseline, ...r };
  } finally { await w.close(); }
}
/* the setup process: claim + login (not measured) */
await proc(async (w) => { await w.signin(); session = w.getSession(); return {}; });

for (const bytes of files) {
  const rec = { file_bytes: bytes, steps: [] };
  const body = Buffer.from(makeText(bytes, 5 + bytes % 97));
  rec.lines = body.toString().split("\n").filter(Boolean).length;
  let doc;
  const u = await proc(async (w) => { const m = await measuredOn(w, "upload", () => uploadFile(w, body, { name: "cold.txt", statement: `proto-mem cold ${bytes}` })); doc = m.value.json.result.document; return { op: m.m, ok: !!(m.value.json && m.value.json.result.ok), r2: w.logs.filter((l) => l.line.includes("meas_r2")).map((l) => l.line) }; });
  rec.upload = { baseline: u.baseline.rss, baseline_heap: u.baseline.heap, ...u.op, ok: u.ok, r2: u.r2 };
  const p = await proc(async (w) => { const m = await measuredOn(w, "promote", () => promoteDoc(w, doc, `cold ${bytes}`)); return { op: m.m, ok: !!(m.value.result && m.value.result.ok), r2: w.logs.filter((l) => l.line.includes("meas_r2")).map((l) => l.line) }; });
  rec.promote = { baseline: p.baseline.rss, baseline_heap: p.baseline.heap, ...p.op, ok: p.ok, r2: p.r2 };
  for (let i = 1; i <= 120; i++) {
    const s = await proc(async (w) => {
      const m = await measuredOn(w, `piece ${i}`, () => w.meas("tick", { name: "pending-work" }), 5);
      const row = (await w.meas("sql", { sql: "SELECT state,cursor,written FROM keeps_pending ORDER BY registered_at DESC LIMIT 1" }))[0];
      const n = (await w.meas("sql", { sql: "SELECT count(*) n FROM capture_text" }))[0].n;
      return { op: m.m, was_due: m.value && m.value.was_due, tick_ms: m.value && m.value.ms, row, units_total: n, error: m.error,
        r2: w.logs.filter((l) => l.line.includes("meas_r2")).map((l) => l.line.replace('{"meas_r2":', "").replace(/}$/, "")), readout: w.logs.filter((l) => l.line.includes("proto_readout")).map((l) => l.line.slice(0, 300)) };
    });
    rec.steps.push({ piece: i, baseline: s.baseline.rss, baseline_heap: s.baseline.heap, ...s.op, was_due: s.was_due, units_total: s.units_total, state: s.row && s.row.state, cursor: s.row && s.row.cursor, r2: s.r2, error: s.error });
    if (!s.was_due || (s.row && s.row.state === "finished")) break;
  }
  out.files.push(rec);
  console.error("done", bytes);
}
mkdirSync("/home/user/wt-mem/proto-mem/results", { recursive: true });
writeFileSync(`/home/user/wt-mem/proto-mem/results/${name}.json`, JSON.stringify(out, null, 1));
rmSync(dir, { recursive: true, force: true });
console.error("wrote", name);
