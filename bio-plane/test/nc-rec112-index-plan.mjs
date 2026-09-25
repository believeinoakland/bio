/* ====================================================================== *
 * REC-112 — THE CONTROL DRIVER FOR `provenance_route_marks_finding`.
 * Not a suite: the battery discovers `*.test.mjs`, so this file is skipped
 * by it on purpose, exactly as `nc-rec69-selects.mjs` is. Run it by hand:
 *
 *     node bio-plane/test/nc-rec112-index-plan.mjs
 *
 * WHY IT IS COMMITTED RATHER THAN LEFT IN A REPORT. REC-112 concluded that
 * this index is KEPT for a reader that does not exist yet. That conclusion
 * rests entirely on a query plan, and a plan measured once and quoted in
 * prose is a number nobody re-measures — this project's most-repeated
 * finding. Committing the driver makes the three arms re-runnable in ONE
 * step by whoever finally builds the reader, which is the moment the claim
 * has to still be true.
 *
 * WHAT IT CAN AND CANNOT SEE, because that sentence is load-bearing. It
 * drives the SYSTEM sqlite3 binary, NOT Durable Object SQLite inside
 * workerd, which is where the plane actually runs. What it measures is
 * index ELIGIBILITY for a leading-column equality — core planner behaviour,
 * not a version-dependent costing choice. It does NOT claim the workerd
 * planner produces byte-identical plan text. If sqlite3 is absent it exits
 * 2 NAMING that, and never reports a green over a corpus it could not read.
 *
 * NEGATIVE CONTROL: this file IS the control. Its own polarity arms are
 * ARM C (drop the index -> ARM B's queries must degrade to SCAN) and the
 * ARM A/C equality (the four existing readers must NOT move when it is
 * dropped). Neuter it by deleting the `DROP INDEX` in ARM C: ARM C then
 * reports the index still in use and this driver FAILS naming it.
 * ====================================================================== */
import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { controlPen } from "./pen.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(HERE, "..", "src", "schema.mjs");
const SRC = readFileSync(SCHEMA_PATH, "utf8");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const DIR = controlPen("rec112");
const DB = join(DIR, "plan.db");

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`${ok ? "  ok  " : "  FAIL"} ${name}`);
  if (!ok) console.log(`       got ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`);
};

try { execFileSync("sqlite3", ["--version"], { stdio: "pipe" }); }
catch { console.log("SKIP (NAMED, not green): sqlite3 binary absent — no arm ran"); process.exit(2); }
const SQLITE_VERSION = execFileSync("sqlite3", ["--version"], { encoding: "utf8" }).trim().split(" ")[0];

/* The DDL is EXTRACTED from the artifact, never retyped: a hand copy agrees
   with its author at zero cost and this repository has measured that. */
const table = SRC.match(/CREATE TABLE IF NOT EXISTS provenance_route_marks \([\s\S]*?\n\);/);
const index = SRC.match(/CREATE INDEX IF NOT EXISTS provenance_route_marks_finding\n {2}ON provenance_route_marks\(finding, bundle_id\);/);
if (!table || !index) {
  console.log("ARM DID NOT ARM: could not extract the table and/or index DDL from schema.mjs");
  process.exit(2);
}
/* `#migrate` strips whole-line `--` comments before splitting on ";" (store.mjs:610),
   so the extracted DDL is stripped the same way rather than fed raw. */
const ddl = table[0].split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");

try { rmSync(DIR, { recursive: true, force: true }); } catch {}
mkdirSync(DIR, { recursive: true });
const sh = (sql) => execFileSync("sqlite3", [DB], { input: sql, encoding: "utf8" });
sh(ddl + "\n" + index[0] + "\nCREATE TABLE IF NOT EXISTS bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT, current_state TEXT, title TEXT, last_updated TEXT, bundle_sha TEXT);");
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

const plan = (sql) => sh("EXPLAIN QUERY PLAN " + sql).trim();
const usesIndex = (sql) => /\bprovenance_route_marks_finding\b/.test(plan(sql));

const READERS = {
  "op=list route tally (store.mjs:9902)":
    "SELECT m.* FROM provenance_route_marks m WHERE m.bundle_id > 'b00000' AND m.bundle_id <= 'b09999' AND m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = m.bundle_id);",
  "#latestRouteMark (store.mjs:10251)":
    "SELECT * FROM provenance_route_marks WHERE bundle_id='b00007' ORDER BY seq DESC LIMIT 1;",
  "seq allocator (store.mjs:10400)":
    "SELECT COALESCE(MAX(seq),0) AS m FROM provenance_route_marks WHERE bundle_id='b00007';",
  "op=list LEFT JOIN (store.mjs:10531)":
    "SELECT b.bundle_id, m.finding FROM bundles b LEFT JOIN provenance_route_marks m ON m.bundle_id=b.bundle_id AND m.seq=(SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id=b.bundle_id) WHERE b.bundle_id > 'b00000' ORDER BY b.bundle_id;",
};
/* The question no op asks, taken VERBATIM from REC-69's 2026-08-09 DELEGATION in
   CLAIMS.md — "which documents in this instance carry a standing LOOKED_INDETERMINATE
   marker" — rather than invented here, so ARM B cannot be a query shaped to flatter
   the index. Three independent spellings. */
const INTENDED = {
  "finding = ?":
    "SELECT m.bundle_id, m.at FROM provenance_route_marks m WHERE m.finding='LOOKED_INDETERMINATE' AND m.seq=(SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id=m.bundle_id) ORDER BY m.bundle_id;",
  "finding = ? AND bundle_id > ? (the after-cursor paging shape)":
    "SELECT m.bundle_id FROM provenance_route_marks m WHERE m.finding='LOOKED_INDETERMINATE' AND m.bundle_id > 'b00000' AND m.seq=(SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id=m.bundle_id) ORDER BY m.bundle_id LIMIT 20;",
  "COUNT over finding = ?":
    "SELECT COUNT(*) FROM provenance_route_marks WHERE finding='LOOKED_INDETERMINATE';",
};

console.log("\n--- ARM A: the four existing readers must NOT use this index ---");
const planA = {};
for (const [name, sql] of Object.entries(READERS)) {
  planA[name] = plan(sql);
  t(`ARM A: ${name} does not name provenance_route_marks_finding`, usesIndex(sql), false);
}
t("ARM A GUARD: every existing reader resolves through the PRIMARY KEY autoindex — so they are "
+ "INDEXED, just not by this one, and 'no index named' is not a plan this reader failed to parse",
  Object.values(planA).every((p) => /sqlite_autoindex_provenance_route_marks_1/.test(p)), true);

console.log("\n--- ARM B: the reader the delegation said was missing MUST use it ---");
for (const [name, sql] of Object.entries(INTENDED))
  t(`ARM B: ${name} uses provenance_route_marks_finding`, usesIndex(sql), true);
t("ARM B: and the SECOND column does real work — the paged spelling uses `finding` AND `bundle_id`, "
+ "which is this plane's after-cursor paging key. A two-column index whose second column is the "
+ "paging key of the op that would read it was specified FOR a reader, not speculatively",
  /provenance_route_marks_finding \(finding=\? AND bundle_id>\?\)/.test(plan(INTENDED["finding = ? AND bundle_id > ? (the after-cursor paging shape)"])), true);

console.log("\n--- ARM C: POLARITY — drop the index; B must degrade, A must not move ---");
sh("DROP INDEX provenance_route_marks_finding;");
for (const [name, sql] of Object.entries(INTENDED))
  t(`ARM C: ${name} no longer uses it`, usesIndex(sql), false);
t("ARM C: the bare COUNT degrades to a FULL TABLE SCAN — the cost the index removes, driven "
+ "rather than argued", /SCAN provenance_route_marks\b/.test(plan(INTENDED["COUNT over finding = ?"])), true);
for (const [name, sql] of Object.entries(READERS))
  t(`ARM C (over-strictness): ${name} plan is BYTE-IDENTICAL without the index`, plan(sql), planA[name]);

console.log("\n--- ARM D: the nc-rec69 patch anchors still ARM (arm-that-did-not-arm) ---");
for (const [name, anchor] of [
  ["insert-before anchor", "CREATE INDEX IF NOT EXISTS provenance_route_marks_finding\n"],
  ["remove anchor", "CREATE INDEX IF NOT EXISTS provenance_route_marks_finding\n  ON provenance_route_marks(finding, bundle_id);\n"],
]) t(`ARM D: ${name} occurs exactly once in schema.mjs`, SRC.split(anchor).length - 1, 1);
t("ARM D POLARITY: a literal that is NOT in schema.mjs counts zero, so the two ones above are a "
+ "measurement rather than a matcher that matches anything",
  SRC.split("CREATE INDEX IF NOT EXISTS zzz_no_such_index\n").length - 1, 0);

try { rmSync(DIR, { recursive: true, force: true }); } catch {}
console.log(`\nREC-112 CONTROL DRIVER: ${pass} passing, ${fail} failing`);
process.exit(fail ? 1 : 0);
