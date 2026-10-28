#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): L1 on the code that is LIVE on plat-s1 (the alpha plane at 17cf5848, bundled with proto-mem/build-meas.mjs): a generated text or CSV file goes in through the product's own door
   (op=captureupload, op=allocid, op=promote, as the Add door does), then the owed reading is ticked by hand (the `pending-work` consumer) until nothing is owed, in ONE fresh workerd process per file.
   Reported: outcome (or the stated refusal), steps, wall time per step and in all, units landed, peak resident memory of the workerd group above its idle baseline, the JS heap seen by the V8 inspector.
   This is the ALPHA reader, not the beta's structured-text-reader/csv-reader windows (not in this branch). LOCAL, not platform: workerd does not enforce 128 MB, R2 and SQLite are Miniflare's, no CPU limit.
   node run-l1-plane.mjs --files=/home/user/fix1f/text-10485760.dat,... --out=../results/l1-plane-local.json   (name/type by extension: .csv -> text/csv, else text/plain; fixtures here are .dat, so --type= forces it)
   Needs: node proto-mem/build-meas.mjs  (builds proto-mem/dist/meas.bundled.mjs; bio-plane/node_modules symlinked as proto-mem/README.md says) */
import { start, measuredOn, sleep, snapOf, r1 } from "../../lib.mjs";
import { promoteDocParts as promoteDoc } from "./promote-parts.mjs";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, statSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
const a = Object.fromEntries(process.argv.slice(2).map((x) => { const [k, ...v] = x.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const here = dirname(fileURLToPath(import.meta.url));
const bundle = a.bundle || join(here, "../../dist/meas.bundled.mjs");
if (!a.child) {
  const out = { when: new Date().toISOString(), label: "LOCAL, not platform", command: `node proto-mem/1f/local/run-l1-plane.mjs ${process.argv.slice(2).join(" ")}`, plane: "alpha plane, proto-mem/build-meas.mjs bundle of this branch (base 17cf5848)", results: [] };
  for (const f of String(a.files).split(",")) {
    const tmp = join(tmpdir(), `l1p-${process.pid}-${Math.random().toString(36).slice(2)}.json`);
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--child=1", `--file=${f}`, `--out=${tmp}`, ...(a.type ? [`--type=${a.type}`] : []), ...(a.piece ? [`--piece=${a.piece}`] : [])], { stdio: ["ignore", "inherit", "inherit"], timeout: 3600000 });
    try { out.results.push(JSON.parse(readFileSync(tmp, "utf8"))); } catch { out.results.push({ file: f, error: "child produced no result", status: r.status, signal: r.signal }); }
    writeFileSync(a.out, JSON.stringify(out, null, 1));
  }
  console.error("wrote", a.out); process.exit(0);
}
const file = a.file, body = readFileSync(file), type = a.type || (/csv/.test(basename(file)) ? "text/csv" : "text/plain"), name = basename(file).replace(/\.[^.]+$/, "") + (type === "text/csv" ? ".csv" : /spreadsheetml/.test(type) ? ".xlsx" : /opendocument.spreadsheet/.test(type) ? ".ods" : ".txt");   /* the Add door judges name against type: fixtures are .dat, so the upload name takes the type's extension */
const w = await start({ bundle, env: { MEAS_GATE: "1", ...(a.piece ? { PROTO_PIECE_UNITS: String(a.piece) } : {}) } });
const rec = { file: name, file_bytes: body.length, type, steps: [] };
try {
  await w.meas("gate", { closed: true }); await w.signin(); await sleep(800);
  rec.baseline = { ...snapOf(w), heap: await w.heap().catch(() => null) };
  const up = await measuredOn(w, "upload", () => w.call(`/?${new URLSearchParams({ op: "captureupload", statement: "l1 plane", name, type })}`, { method: "POST", body, headers: { "content-type": type } }));
  const u = up.value; rec.upload = { ...up.m, http: u.status, ok: !!(u.json && u.json.result && u.json.result.ok), refusal: u.json && u.json.result && !u.json.result.ok ? JSON.stringify(u.json.result).slice(0, 300) : undefined };
  if (!rec.upload.ok) { rec.outcome = "upload refused/failed"; throw new Error("stop"); }
  const doc = u.json.result.document;
  const pr = await measuredOn(w, "promote", () => promoteDoc(w, doc, name)); rec.promote = { ...pr.m, ok: !!(pr.value.result && pr.value.result.ok) };
  if (!rec.promote.ok) { rec.outcome = "promote failed: " + JSON.stringify(pr.value.result).slice(0, 1500); throw new Error("stop"); }
  const units = async () => (await w.meas("sql", { sql: "SELECT count(*) n FROM capture_text" }))[0].n;
  const job = async () => (await w.meas("sql", { sql: "SELECT state,cursor,written,attempts,last_why,last_ms FROM keeps_pending ORDER BY registered_at DESC LIMIT 1" }))[0] || null;
  const t0 = Date.now(); let n = 0;
  for (; n < 400; n++) {
    const before = await units(); const t = await measuredOn(w, `tick ${n + 1}`, () => w.meas("tick", { name: "pending-work" }), 5); const after = await units(); const j = await job();
    rec.steps.push({ step: n + 1, ms: t.m.ms, peak_rss_above_start: t.m.peak_above_start, heap_used_peak: t.m.heap_used_peak_seen, units_written: after - before, state: j && j.state, last_why: j && j.last_why, error: t.error });
    if (!t.value || !t.value.was_due || (j && ["finished", "final", "refused"].includes(j.state))) break;
  }
  rec.final_job = await job(); rec.units_total = await units(); rec.steps_taken = rec.steps.length; rec.reading_wall_ms = Date.now() - t0;
  rec.outcome = rec.final_job && ["finished", "final"].includes(rec.final_job.state) ? (rec.units_total > 0 ? "read whole" : "job finished but 0 units landed: NOT read (reason not determined here; the harness stubs the sheet/pdf/ocr workers)") : "ended: " + JSON.stringify(rec.final_job);
  rec.stored_over_text = rec.units_total ? undefined : undefined;
  const mem = [rec.upload.peak_above_start, rec.promote.peak_above_start, ...rec.steps.map((s) => s.peak_rss_above_start)].filter((x) => x != null);
  rec.peak_rss_above_baseline_mb = Math.max(...mem); rec.max_step_ms = Math.max(...rec.steps.map((s) => s.ms), 0); rec.heap_used_peak_mb = Math.max(...rec.steps.map((s) => s.heap_used_peak || 0), rec.upload.heap_used_peak_seen || 0, rec.promote.heap_used_peak_seen || 0);
  try { rec.db_bytes = (await w.meas("sql", { sql: "SELECT sum(length(text)) b, count(*) n FROM capture_text" }))[0]; } catch { /* column names unknown: not measured */ }
} catch (e) { if (String(e.message) !== "stop") rec.error = String(e.message).slice(0, 300); }
await w.close(); writeFileSync(a.out, JSON.stringify(rec, null, 1)); process.exit(0);
