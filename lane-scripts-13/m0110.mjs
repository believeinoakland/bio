// SCHEDULER #13: M0-110's two stages, BOB #27's order of 2026-09-22 (TREE-SHARING, "The three changes, and their order":
// *"M0-110's first stage starts BESIDE M0-99, not after it"*). Edits the row wherever it stands (cache or backlog).
// Usage: M99=<done|open> node m0110.mjs <repo> [--write]
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const REPO = resolve(process.argv[2]);
const WRITE = process.argv.includes("--write");
const M99 = process.env.M99;
if (M99 !== "done" && M99 !== "open") { console.error("M99=done|open"); process.exit(2); }
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const { queueRows } = await import(join(REPO, "tools/ledger.mjs"));
let file = null;
for (const f of ["docs/development/QUEUE.md", "docs/development/BACKLOG.md"]) {
  const t = readFileSync(join(REPO, f), "utf-8");
  if (queueRows(t).some((r) => r.id === "M0-110")) { if (file) fail("M0-110 in both files"); file = f; }
}
if (!file) fail("M0-110 in neither file");
const P = join(REPO, file);
let t = readFileSync(P, "utf-8");
const once = (a, b, what) => { const n = t.split(a).length - 1; if (n !== 1) fail(`${what}: ${n} occurrences`); t = t.replace(a, () => b); };
const inCache = file.endsWith("QUEUE.md");
once("order: FIRST of the backlog: it CUTS GATE TIME on every landing, Bob's own test (`CLAUDE.md` §2), item 1 of the ruling's order; after M0-99, which rewires the same readers (BOB #27: M0-99 lands as placed) (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 1)",
  `order: ${inCache ? "at the head of the plan" : "FIRST of the backlog"}: it CUTS GATE TIME on every landing, Bob's own test (\`CLAUDE.md\` §2), item 1 of the ruling's order; STAGE 1 BESIDE M0-99 and stage 2 after it, which rewires the same readers (BOB #27, 2026-09-22: *"M0-110's first stage starts BESIDE M0-99, not after it"*) (SCHEDULER #12 and #13; BOB #26's inbox entry, item 1)`, "order");
once("depends-on: M0-99.",
  `depends-on: none for STAGE 1 (new files only); STAGE 2 waits for M0-99 (BOB #27, 2026-09-22)${M99 === "done" ? ", which is DONE (CONDUCT #12's batch 4)" : ", still open: the tool cannot hold a staged dependency, so CONDUCT spawns stage 1 alone"}.`, "depends-on");
once("scope: as §1: FIRST measure per-path churn on `main` and name each file moved or kept against §1's line; then the state files move to `coord`, with one write command (fetch, edit without a checkout, the ledger arms, push, retry on a non-fast-forward) and one read command against `origin/coord`; every reader redirected;",
  "scope: as §1. STAGE 1, beside M0-99, NEW FILES ONLY: measure per-path churn on `main` and name each file moved or kept against §1's line; the one write command (fetch, edit without a checkout, the ledger arms, push, retry on a non-fast-forward, each edit an intent anchored to a block) and the one read command against `origin/coord`, with their suite. STAGE 2, after M0-99: the state files move to `coord` and every reader is redirected;", "scope");
const row = queueRows(t).find((r) => r.id === "M0-110");
const cap = inCache ? 3072 : 2048;
if (row.bytes > cap) fail(`M0-110 is ${row.bytes} B, over ${cap} in ${file}`);
console.log(file, "M0-110", row.bytes, "B (cap", cap + ")");
if (WRITE) { writeFileSync(P, t); console.log("WRITTEN"); }
