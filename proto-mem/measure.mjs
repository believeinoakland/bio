#!/usr/bin/env node
/* proto-mem (THROWAWAY): the plane Worker's resident memory, measured from OUTSIDE (/proc/<workerd pid>/status), ONE Miniflare, ONE workerd, ONE Store object, every step in that one process (WARM:
   what one step costs after the earlier ones have grown the process; the COLD scripts (measure-cold.mjs, measure-consumers.mjs, measure-natural.mjs) start a fresh process per step).
   node proto-mem/measure.mjs [--bundle=proto-mem/dist/meas.bundled.mjs] [--piece=<PROTO_PIECE_UNITS>] [--phases=a,b] [--out=name]
   a  baseline (before any request, after the first request, idle)
   b  readHeld: a ~1 MB and a ~1.9 MB plain-text file through op=captureupload + op=promote, then pending-work ticked by hand piece by piece (the platform alarm gated shut)
   Memory: VmHWM of the workerd child (reset by clear_refs before each operation) and VmRSS sampled every 10 ms; the JS heap by the V8 inspector (Runtime.getHeapUsage). Nothing leaves the machine. */
import { writeFileSync, mkdirSync } from "node:fs";
import { start, status, rollup, makeText, uploadFile, promoteDoc, sleep, r1, measuredOn } from "./lib.mjs";

const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const bundle = arg.bundle || "/home/user/wt-mem/proto-mem/dist/meas.bundled.mjs";
const phases = (arg.phases || "a,b").split(",");
const piece = arg.piece ? { PROTO_PIECE_UNITS: String(arg.piece) } : {};
const name = arg.out || `run-piece${arg.piece || "default"}`;
const out = { when: new Date().toISOString(), bundle, piece_units_env: arg.piece || null, phases, a: null, b: [] };

const w = await start({ bundle, env: piece });
const pid = w.pid;
const MB = (x) => r1(x);
const snap = () => { const s = status(pid); return { rss: MB(s.rss), anon: MB(s.anon), file: MB(s.file), hwm: MB(s.hwm) }; };

const measured = (label, fn, ms = 10) => measuredOn(w, label, fn, ms);

/* ---------------- (a) baseline ---------------- */
out.a = { before_any_request: snap(), heap_before_any_request: await w.heap().catch(() => null) };
await sleep(1500); out.a.ready_idle_1_5s = snap();
const first = await measured("first request (op=stats)", () => w.call("/?op=stats"));
out.a.first_request = first.m; await sleep(2500); out.a.after_first_request_idle = snap();
out.a.workerd_pids = w.pids;
out.a.rollup = Object.fromEntries(Object.entries(rollup(pid)).map(([k, v]) => [k, MB(v)]));
await w.meas("gate", { closed: true });
await w.signin();
await sleep(500);
out.a.after_signin = snap(); out.a.heap_after_signin = await w.heap().catch(() => null);
console.error("a:", JSON.stringify(out.a.after_first_request_idle));

/* ---------------- (b) readHeld ---------------- */
const units = async () => (await w.meas("sql", { sql: "SELECT count(*) n FROM capture_text" }))[0].n;
const jobRow = async () => (await w.meas("sql", { sql: "SELECT state,cursor,written,attempts,last_why,last_ms,own_ms,last_mem FROM keeps_pending ORDER BY registered_at DESC LIMIT 1" }))[0] || null;
async function readOne(label, bytes, seed, drive) {
  const body = Buffer.from(makeText(bytes, seed));
  const rec = { label, file_bytes: body.length, lines: body.toString().split("\n").filter(Boolean).length, steps: [] };
  const pre = snap(); rec.rss_before_file = pre;
  const up = await measured(`${label}: op=captureupload`, () => uploadFile(w, body, { name: `${label}.txt`, statement: `proto-mem ${label}` }));
  rec.upload = { ...up.m, status: up.value && up.value.status, ok: !!(up.value && up.value.json && up.value.json.result && up.value.json.result.ok) };
  if (!rec.upload.ok) { rec.error = "upload failed " + JSON.stringify(up.value && (up.value.json || up.value.text)).slice(0, 300); return rec; }
  const doc = up.value.json.result.document;
  const pr = await measured(`${label}: op=promote`, () => promoteDoc(w, doc, label));
  rec.promote = { ...pr.m, status: pr.value && pr.value.status, ok: !!(pr.value && pr.value.result && pr.value.result.ok), units_after: await units() };
  if (!rec.promote.ok) { rec.error = "promote failed " + JSON.stringify(pr.value && pr.value.result).slice(0, 300); return rec; }
  rec.rss_before_first_piece = snap();
  for (let i = 0; i < 40; i++) {
    const before = await units(), jb = await jobRow();
    const t = await measured(`${label}: pending-work tick ${i + 1}`, () => w.meas("tick", { name: "pending-work" }));
    const after = await units(), ja = await jobRow();
    rec.steps.push({ piece: i + 1, ...t.m, units_written: after - before, units_total: after, cursor_before: jb && jb.cursor, cursor_after: ja && ja.cursor, state_after: ja && ja.state, was_due: t.value && t.value.was_due, error: t.error });
    if (!t.value || !t.value.was_due || (ja && (ja.state === "finished" || ja.state === "final" || ja.state === "refused"))) break;
  }
  const j = await jobRow(); rec.final_job = j; rec.units_total = await units();
  rec.fts_rows = (await w.meas("sql", { sql: "SELECT count(*) n FROM capture_text_fts" }).catch(() => [{ n: null }]))[0].n;
  rec.rss_after = snap();
  return rec;
}
if (phases.includes("b")) {
  out.b.push(await readOne("file-1mb", 1_000_000, 11));
  out.b.push(await readOne("file-1_9mb", 1_900_000, 12));
  console.error("b done");
}

mkdirSync("/home/user/wt-mem/proto-mem/results", { recursive: true });
writeFileSync(`/home/user/wt-mem/proto-mem/results/${name}.json`, JSON.stringify(out, null, 1));
console.error("wrote", name);
await w.close();
