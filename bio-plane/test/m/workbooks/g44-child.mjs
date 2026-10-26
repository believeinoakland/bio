/* A child process for g44-large.test.mjs: the real workbooks module over the fixture's world, run under the old-space
   limit its parent sets. Reads a package from a file, then does one job and prints one JSON line a step. Not a test.
     node --import <platform-sqlite> --expose-gc --max-old-space-size=N g44-child.mjs <file> add|lifecycle|x20|old [cells]
   `x20` is `lifecycle` with a binding of the first three constants to a captured table between the add and the reads. */
import { readFileSync } from "node:fs";
import { world, BASIC, V } from "./fixture.mjs";
import { workbooksOps } from "../../../src/workbooks/index.mjs";

const [file, job, extra] = process.argv.slice(2);
const bytes = file === "-" ? null : new Uint8Array(readFileSync(file));
/* the stub engine answers every formula cell, as the real engine's answer does (workbooks pairs it with every cell) */
let w;
const engine = async () => ({ ok: true, engine: "stub", engine_version: "0",
  cells: w.rows(`SELECT sheet, cell, type, cached FROM workbook_cells WHERE formula IS NOT NULL`)
    .map((c) => ({ source: { ref: `${c.sheet}!${c.cell}` }, type: "number", value: c.cached })) });
w = world({ recompute: engine });
for (const m of ["alice", "bob", "carol"]) w.member(m, m === "alice" ? { role: "admin" } : {});
w.P = w.project("Rates", "bob", ["carol"]);
const cap = w.capture(bytes || BASIC()).capSha;
globalThis.gc(); globalThis.gc();
const idleMB = process.memoryUsage().heapUsed / 1e6;
const url = (q = {}) => new URL(`https://x/?${new URLSearchParams({ capture: cap, project: w.P, viewer: V("bob"), ...q })}`);
const body = { captureSha: cap, question: "What does it cost?", period: "FY2025", project: w.P, by: V("bob") };
const ops = (u = url(), b = body) => workbooksOps(w.wb, u, b);
const brief = (r) => { const s = JSON.stringify(r); return { ok: r.ok === true, reason: r.reason ?? null, cells: r.cells ?? null, bound_cells: r.bound_cells ?? null,
  condition: r.condition ?? null, size: r.size ?? null, bound: r.bound ?? null, already: r.already ?? null, limit: r.limit ?? null,
  dropped: r.dropped ?? null, answerBytes: s.length }; };
/* each step prints its line as it ends, so a child that dies leaves the steps it passed */
const out = {};
const emit = (k, v) => { out[k] = v; process.stdout.write(JSON.stringify({ [k]: v }) + "\n"); };
emit("idleMB", idleMB);
const before = JSON.stringify(w.snapshot());

if (job === "old") {
  /* a workbook stored by the old code: a small one, then rows inserted past the bound as the old add would have */
  emit("setup", brief(await ops().workbookadd()));
  const n = Number(extra);
  w.st.transactionSync(() => {
    for (let i = 0; i < n; i++)
      w.st.sql.exec(`INSERT OR IGNORE INTO workbook_cells (capture_sha, project, sheet, cell, r, c, type, value, formula, cached) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    cap, w.P, "Model", `A${100 + i}`, 100 + i, 1, "number", String(i), null, null);
  });
  emit("stored", w.count("workbook_cells"));
} else {
  const added = brief(await ops().workbookadd());
  emit("add", added);
  emit("changed", JSON.stringify(w.snapshot()) !== before);
  emit("cells", w.count("workbook_cells"));
}
if (job !== "add" && (job === "old" || out.add.ok)) {
  if (job === "x20") {
    const t = await w.table([["amount", "number"]], [["1"], ["1"], ["1"]]);
    const b = await w.wb.bind({ captureSha: cap, project: w.P, range: "Big!A1:A3", input: { table: t, range: "A1:A3" }, by: V("bob") });
    emit("bind", { ok: b.ok === true, reason: b.reason ?? null, agrees: b.binding?.agrees ?? null, compared: b.binding?.compared ?? null });
  }
  emit("read", brief(await ops().workbook()));
  emit("lint", brief(await ops().workbooklint()));
  emit("inputs", brief(await ops().workbookinputs()));
  const lint = await w.wb.lint({ captureSha: cap, project: w.P, viewer: V("bob") });
  const f = lint.ok && lint.findings[0];
  emit("explain", brief(await ops(url(), { ...body, finding: f ? { kind: f.kind, cell: f.cell } : { kind: "constant_in_formula", cell: "Model!B6" }, note: "a note" }).workbooklintexplain()));
  const re = await ops().workbookrecompute();
  emit("recompute", { ...brief(re), status: re.recompute?.status ?? null, compared: re.recompute?.counts?.compared ?? null });
}
emit("endMB", process.memoryUsage().heapUsed / 1e6);
