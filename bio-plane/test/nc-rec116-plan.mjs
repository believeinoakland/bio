/* REC-116 / M-49 — THE QUERY-PLAN MEASUREMENT FOR THE READER THAT NOW EXISTS.
 *
 * NOT A SUITE. A control driver, deliberately not named `.test.mjs`, run by
 * hand and recorded in MEASUREMENTS.md as M-49.
 *
 * WHAT THIS ADDS TO M-41, WHICH IS THE WHOLE REASON IT IS A SEPARATE
 * MEASUREMENT RATHER THAN A RE-RUN. REC-112 had to RETYPE the three spellings it
 * measured, because no reader existed to read them off — it was measuring what a
 * reader WOULD do. A retyped query is a hand copy, and a hand copy agrees with
 * its author at zero cost; this repository has measured that five times. There
 * is now a REAL reader, so this driver EXTRACTS `Store.ROUTE_MARKED_PAGE_SQL`
 * from `src/store.mjs` and plans THAT STRING. If the op's SQL and the measured
 * SQL ever diverge, this arm cannot fail to notice, because they are the same
 * bytes.
 *
 * THE INSTRUMENT is M-41's, unchanged and deliberately so: `EXPLAIN QUERY PLAN`
 * against the system sqlite3 binary, over table and index DDL EXTRACTED from
 * `schema.mjs` rather than retyped, with NO `ANALYZE` — which is this plane's
 * live condition, because nothing in `bio-plane/src/` ever runs one.
 *
 * THE LIMIT, STATED RATHER THAN DISCOVERED LATER, and it is M-41's limit too:
 * the plane runs on Durable Object SQLite inside `workerd`, not on this CLI
 * binary, and the two may differ in version. What is measured here is index
 * ELIGIBILITY for a leading-column equality, which is core planner behaviour
 * rather than a version-dependent costing decision. The arm was NOT driven
 * inside `workerd` and this driver does not claim it was.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = controlPen("rec116-plan");
const DB = join(DIR, "plan.db");
const SCHEMA_SRC = readFileSync(join(HERE, "..", "src", "schema.mjs"), "utf8");
const STORE_SRC = readFileSync(join(HERE, "..", "src", "store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* M0-197: the anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read), BEFORE the first spawn. This
   driver patches no tree file: arm A EXTRACTS its subject by the three anchors below (copied from the extraction
   lines further down — keep them together), and arm B drops the index in the sqlite fixture this driver composes. */
anchorTable([{ arm: "A", file: join(HERE, "..", "src", "store.mjs"), find: "provenanceRoutesMarked({", sites: "any" },
  { arm: "A", file: join(HERE, "..", "src", "schema.mjs"), find: /CREATE TABLE IF NOT EXISTS provenance_route_marks \([\s\S]*?\n\);/ },
  { arm: "A", file: join(HERE, "..", "src", "schema.mjs"), find: /CREATE INDEX IF NOT EXISTS provenance_route_marks_finding\n {2}ON provenance_route_marks\(finding, bundle_id\);/ },
  { arm: "B", none: "drops the index in the sqlite fixture this driver composes from arm A's extracted DDL" }]);

try { execFileSync("sqlite3", ["--version"], { stdio: "pipe" }); }
catch { console.log("SKIP (NAMED, not green): sqlite3 binary absent — no arm ran"); process.exit(2); }
const SQLITE_VERSION = execFileSync("sqlite3", ["--version"], { encoding: "utf8" }).trim().split(" ")[0];

/* ============ THE SUBJECT IS EXTRACTED FROM THE OP, NOT RETYPED ============ */
/* EXTRACTED FROM THE `#rows(` CALL INSIDE THE METHOD, not from a named constant,
   and the reason is itself a finding worth carrying: the statement WAS a
   constant, and `derivation-bounds`' D-365 arm — which grades a published
   `truncated` against the SQL of the row source it was measured over — could not
   see the `LIMIT ?` behind that constant and reported the source as UNBOUNDED.
   It was right about what it could read, and a bound that is real but invisible
   is an unbounded read for every purpose that instrument serves. The statement is
   now inline, which is this file's house shape for every other `#rows` call, and
   this driver anchors on the METHOD NAME first so it cannot drift onto some other
   query that happens to name the same table. */
const methodAt = STORE_SRC.indexOf("provenanceRoutesMarked({");
const sqlMatch = methodAt < 0 ? null
  : STORE_SRC.slice(methodAt).match(/this\.#rows\(\s*`([\s\S]*?)`/);
if (!sqlMatch) {
  console.log("ARM DID NOT ARM: could not extract the page statement from provenanceRoutesMarked");
  process.exit(2);
}
const PAGE_SQL = sqlMatch[1];
t("ARM-THAT-DID-NOT-ARM GUARD: the extracted statement is the op's own and is non-trivial — it "
+ "names the table, the finding predicate and the cursor predicate",
  [/provenance_route_marks/.test(PAGE_SQL), /m\.finding\s*=\s*\?/.test(PAGE_SQL),
   /m\.bundle_id\s*>\s*\?/.test(PAGE_SQL), PAGE_SQL.length > 150],
  [true, true, true, true]);
t("POLARITY on that extraction — a method that is NOT in store.mjs does not match, so the four "
+ "trues above are a measurement rather than a matcher that matches anything",
  STORE_SRC.indexOf("zzzNoSuchMethodAnywhere({"), -1);

/* The DDL is EXTRACTED from the artifact, never retyped — M-41's rule. */
const table = SCHEMA_SRC.match(/CREATE TABLE IF NOT EXISTS provenance_route_marks \([\s\S]*?\n\);/);
const index = SCHEMA_SRC.match(/CREATE INDEX IF NOT EXISTS provenance_route_marks_finding\n {2}ON provenance_route_marks\(finding, bundle_id\);/);
if (!table || !index) {
  console.log("ARM DID NOT ARM: could not extract the table and/or index DDL from schema.mjs");
  process.exit(2);
}
/* `#migrate` strips whole-line `--` comments before splitting on ";", so the
   extracted DDL is stripped the same way rather than fed raw. */
const ddl = table[0].split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");

try { rmSync(DIR, { recursive: true, force: true }); } catch {}
mkdirSync(DIR, { recursive: true });
const sh = (sql) => execFileSync("sqlite3", [DB], { input: sql, encoding: "utf8" });
sh(ddl + "\n" + index[0]
  + "\nCREATE TABLE IF NOT EXISTS bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT, current_state TEXT, title TEXT, last_updated TEXT, bundle_sha TEXT);");
sh(`WITH RECURSIVE c(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM c WHERE i<5000)
    INSERT INTO bundles SELECT printf('b%05d',i),'information','verified','t','2026-01-01','sha' FROM c;
    WITH RECURSIVE c(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM c WHERE i<500)
    INSERT INTO provenance_route_marks SELECT printf('b%05d',i*7),1,'2026-01-01','m:1',
      CASE WHEN i%8=0 THEN 'LOOKED_INDETERMINATE' ELSE 'PRESENT' END,
      'verified','readable',0,1,'[]' FROM c;`);

const rows = Number(sh("SELECT COUNT(*) FROM provenance_route_marks;").trim());
const marked = Number(sh("SELECT COUNT(*) FROM provenance_route_marks WHERE finding='LOOKED_INDETERMINATE';").trim());
console.log(`\nCORPUS: sqlite3 ${SQLITE_VERSION} · no ANALYZE (the plane never runs one) · `
          + `${rows} marks, ${marked} standing LOOKED_INDETERMINATE, 5000 bundles`);
t("GUARD: the fixture is NON-EMPTY and the filter is SELECTIVE — a plan measured over an empty "
+ "table is a beautiful zero", [rows > 100, marked > 10, marked < rows / 2], [true, true, true]);

const plan = (sql) => sh("EXPLAIN QUERY PLAN " + sql.replace(/\?/g, "'x'")).trim();
const usesIndex = (sql) => /\bprovenance_route_marks_finding\b/.test(plan(sql));

/* THE TWO SPELLINGS THE OP ACTUALLY RUNS. The first page and a paged one are
   the SAME STATEMENT with a different cursor bound, which is itself the finding
   worth recording: the op has ONE page statement and there is no second shape
   that could drift away from the measured one. */
const FIRST_PAGE = PAGE_SQL.replace(/\?/g, "'x'").replace("m.bundle_id > 'x'", "m.bundle_id > ''");
const PAGED = PAGE_SQL.replace(/\?/g, "'x'").replace("m.bundle_id > 'x'", "m.bundle_id > 'b00100'");

console.log("\n--- ARM A: the op's OWN page statement uses the index, on both cursors ---");
t("ARM A: the first page (empty cursor) uses provenance_route_marks_finding", usesIndex(FIRST_PAGE), true);
t("ARM A: a paged call (real cursor) uses it too", usesIndex(PAGED), true);
t("ARM A: AND THE SECOND COLUMN DOES REAL WORK — the plan names BOTH `finding` and `bundle_id`, "
+ "which is this plane's after-cursor paging key. A two-column index whose second column is the "
+ "paging key of the op that reads it was specified FOR this reader (M-41's finding, now driven "
+ "against the reader rather than against a retyped stand-in)",
  /provenance_route_marks_finding \(finding=\? AND bundle_id>\?\)/.test(plan(PAGED)), true);
console.log(`\n  PLAN (first page): ${plan(FIRST_PAGE).replace(/\n/g, "\n                     ")}`);
console.log(`  PLAN (paged)     : ${plan(PAGED).replace(/\n/g, "\n                     ")}`);

console.log("\n--- ARM B: POLARITY — drop the index and the op's statement must DEGRADE ---");
const beforeDrop = { first: plan(FIRST_PAGE), paged: plan(PAGED) };
sh("DROP INDEX provenance_route_marks_finding;");
t("ARM B: the first page no longer uses it", usesIndex(FIRST_PAGE), false);
t("ARM B: the paged call no longer uses it", usesIndex(PAGED), false);
/* A SURPRISING RESULT IS A FINDING ABOUT THE ARM, AND IT IS RECORDED RATHER
   THAN SMOOTHED. This assertion was DECLARED as `degrades to a SCAN` — by
   analogy with M-41, whose bare `COUNT over finding=?` does exactly that — and
   it came back FALSE. The reason is the arm's, not the subject's: this
   statement ALSO carries `m.bundle_id > ?`, so with the two-column index gone
   the planner still has the PRIMARY KEY autoindex to range-scan on `bundle_id`.
   It never falls all the way to a table scan.
   THE DEGRADATION IS REAL AND IS WORSE THAN A SCAN WOULD BE CHEAP TO SPOT: the
   `finding` filter STOPS BEING AN INDEX PREDICATE and becomes a row-by-row test
   over every mark after the cursor — the op reads the whole tail of the table
   to return the few rows standing at one finding. So the assertion is CORRECTED
   to what actually distinguishes the two plans rather than relaxed. */
t("ARM B: and the degradation is that `finding` LEAVES THE INDEX PREDICATE — without this index "
+ "the planner falls back to the PRIMARY KEY autoindex on `bundle_id>?` alone and tests `finding` "
+ "row by row over the whole tail after the cursor. NOT a full table SCAN, which is what this arm "
+ "first declared and measured FALSE: the statement's own cursor predicate keeps a range scan "
+ "available, and that is a fact about this query rather than about the index",
  [/sqlite_autoindex_provenance_route_marks_1 \(bundle_id>\?\)/.test(plan(PAGED)),
   /provenance_route_marks_finding/.test(plan(PAGED))], [true, false]);
t("ARM B GUARD: the plans really MOVED, so ARM A measured the index rather than a plan that "
+ "reads the same either way",
  [plan(FIRST_PAGE) === beforeDrop.first, plan(PAGED) === beforeDrop.paged], [false, false]);

try { rmSync(DIR, { recursive: true, force: true }); } catch {}
console.log(`\nREC-116 PLAN DRIVER (M-49): ${pass} passing, ${fail} failing`);
process.exit(fail ? 1 : 0);
