import { readFileSync } from "node:fs";
const f = JSON.parse(readFileSync(process.argv[2], "utf8"));
const pad = (x, n) => String(x ?? "").padEnd(n);
console.log(`cold run ${process.argv[2]} piece_units_env=${f.piece_units_env}`);
for (const r of f.files) {
  console.log(`\nfile ${r.file_bytes} B, ${r.lines} lines`);
  for (const [k, s] of [["upload", r.upload], ["promote", r.promote]]) console.log(`  ${pad(k, 9)} baseline ${pad(s.baseline, 6)} peak ${pad(s.peak_rss, 6)} +${pad(r.upload && (s.peak_rss - s.baseline).toFixed(1), 6)} ms ${pad(s.ms, 5)} ok ${s.ok}`);
  for (const s of r.steps) console.log(`  piece ${pad(s.piece, 3)} baseline ${pad(s.baseline, 6)} peak ${pad(s.peak_rss, 6)} +${pad((s.peak_rss - s.baseline).toFixed(1), 6)} ms ${pad(s.ms, 5)} units_total ${pad(s.units_total, 6)} ${pad(s.state, 9)} r2 ${(s.r2 || []).map((x) => { try { const o = JSON.parse(x); return `${o.op}${o.range ? `[${o.range.offset}+${o.range.length}]` : "[whole]"}`; } catch { return x; } }).join(" ")}`);
}
