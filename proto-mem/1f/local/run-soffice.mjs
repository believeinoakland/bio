#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): LOCAL: LibreOffice (this machine's, see `tools` in the result) converting generated workbooks to CSV, one fresh private profile per run, tree RSS/CPU from /proc.
   It is NOT the product's XLSX/ODS reader (those are JavaScript readers on Workers, windowed; not in this branch); it is the "container later" alternative the specs mention (LOAD-PER-TYPE.md section 2, XLSX row)
   and a yardstick for how large these workbooks are for a general-purpose engine. LOCAL, not platform.
   node run-soffice.mjs --fix=/home/user/fix1f --files=a.xlsx,b.ods --out=../results/l2-soffice-local.json [--timeout-s=900] */
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TreeSampler } from "./proc-tree.mjs";
const a = Object.fromEntries(process.argv.slice(2).map((x) => { const [k, ...v] = x.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const fix = a.fix || "/home/user/fix1f", limit = Number(a["timeout-s"] || 900) * 1000;
const out = { when: new Date().toISOString(), label: "LOCAL, not platform", command: `node proto-mem/1f/local/run-soffice.mjs ${process.argv.slice(2).join(" ")}`, tools: { libreoffice: execFileSync("soffice", ["--version"]).toString().trim() }, results: [] };
for (const f of String(a.files).split(",")) {
  const dir = mkdtempSync(join(tmpdir(), "so-")); const t0 = performance.now();
  const child = spawn("soffice", [`-env:UserInstallation=file://${dir}/profile`, "--headless", "--norestore", "--convert-to", "csv", "--outdir", `${dir}/out`, join(fix, f)], { stdio: "ignore" });
  const s = new TreeSampler(child.pid, 50).start(); let timedOut = false; const to = setTimeout(() => { timedOut = true; execFileSync("sh", ["-c", `pkill -KILL -P ${child.pid}; kill -KILL ${child.pid}`]); }, limit);
  const code = await new Promise((r) => child.on("exit", r)); clearTimeout(to); const cpu = s.cpu(); const mem = s.stop();
  let csvBytes = null; try { const o = readdirSync(`${dir}/out`); csvBytes = o.length ? statSync(join(dir, "out", o[0])).size : null; } catch { /* none */ }
  out.results.push({ file: f, file_bytes: statSync(join(fix, f)).size, exit: code, timed_out: timedOut, wall_s: Math.round((performance.now() - t0) / 100) / 10, cpu_s_tree: cpu, csv_bytes: csvBytes, ...mem });
  console.error(f, out.results.at(-1).wall_s, "s", mem.peak_tree_rss_mb, "MB"); rmSync(dir, { recursive: true, force: true }); writeFileSync(a.out, JSON.stringify(out, null, 1));
}
