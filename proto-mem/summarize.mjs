/* prints a results/*.json as plain tables */
import { readFileSync } from "node:fs";
const f = JSON.parse(readFileSync(process.argv[2], "utf8"));
const pad = (x, n) => String(x ?? "").padEnd(n);
console.log(`run ${process.argv[2]}  piece_units_env=${f.piece_units_env}`);
if (f.a) console.log("A baseline", JSON.stringify({ before_any_request: f.a.before_any_request.rss, ready_idle: f.a.ready_idle_1_5s.rss, first_request_peak: f.a.first_request.peak_rss, after_first_request_idle: f.a.after_first_request_idle.rss, after_signin: f.a.after_signin.rss }));
for (const r of f.b || []) {
  console.log(`\nB ${r.label}: ${r.file_bytes} B, ${r.lines} lines; rss before file ${r.rss_before_file.rss}`);
  if (r.error) console.log("  ERROR", r.error);
  for (const s of [r.upload, r.promote].filter(Boolean)) console.log(`  ${pad(s.label, 40)} start ${pad(s.start_rss, 7)} peak ${pad(s.peak_rss, 7)} +${pad(s.peak_above_start, 6)} end ${pad(s.end_rss, 7)} ms ${s.ms}`);
  for (const s of r.steps || []) console.log(`  piece ${pad(s.piece, 3)} start ${pad(s.start_rss, 7)} peak ${pad(s.peak_rss, 7)} +${pad(s.peak_above_start, 6)} end ${pad(s.end_rss, 7)} ms ${pad(s.ms, 6)} units +${pad(s.units_written, 5)} total ${pad(s.units_total, 6)} ${s.state_after} ${s.cursor_after || ""}`);
  console.log(`  final: units ${r.units_total} fts ${r.fts_rows} state ${r.final_job && r.final_job.state}; rss after ${r.rss_after && r.rss_after.rss}`);
}
if (f.c) {
  console.log("\nC seeded", JSON.stringify(f.c.seeded), "rss before consumers", f.c.rss_before_consumers.rss);
  for (const mode of ["due_gated", "forced"]) { console.log(` ${mode}:`); for (const s of f.c[mode]) console.log(`  ${pad(s.consumer, 24)} due ${pad(s.was_due, 6)} start ${pad(s.start_rss, 7)} peak ${pad(s.peak_rss, 7)} +${pad(s.peak_above_start, 6)} end ${pad(s.end_rss, 7)} ms ${pad(s.ms, 6)} ${s.error || ""}`); }
  const w = f.c.whole_onalarm; console.log(` whole onAlarm: start ${w.start_rss} peak ${w.peak_rss} +${w.peak_above_start} end ${w.end_rss} ms ${w.ms}`);
}
if (f.n) console.log(`\nN natural alarm 1.9MB: finished ${f.n.finished} wall ${f.n.wall_ms} ms start ${f.n.start_rss} peak ${f.n.peak_rss} +${f.n.peak_above_start} end ${f.n.end_rss}`);
