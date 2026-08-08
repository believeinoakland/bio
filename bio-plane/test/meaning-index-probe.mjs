/* Does the meaning arm need a grade-column index? (PL-8 / D-222 (ii))
 *
 * D-222 recorded that NO grade column is indexed anywhere in the meaning layer
 * and named it as a consequence with teeth. The build plan's instruction is
 * "grade-column index added, or the measurement recorded why not", so this is
 * the measurement. It is a PROBE, not a suite: it is not in the battery, for
 * the same reason `bench:retrieval` and `cite-scale.mjs` are not.
 *
 * WHAT IT DOES, and the one thing that matters about how it is built: THE SQL
 * IS DRIVEN OUT OF `compile()`, never typed here. A probe that measured a
 * hand-written statement would be measuring a statement no member can produce,
 * which is the class of instrument defect this project has already paid for
 * twice — a control that validated a parallel copy of the thing rather than the
 * thing. So the corpus is synthetic and the QUERY is the real one.
 *
 * THE ENGINE IS `node:sqlite`, NOT workerd, and that is stated rather than
 * hidden. What is being measured here is the QUERY PLANNER's use of an index,
 * which is SQLite core and identical in both; the compound-SELECT ceiling is
 * the known workerd difference and it is not what this probe is about. The
 * plan lines below (`EXPLAIN QUERY PLAN`) are the evidence; the milliseconds
 * are the size of the effect.
 *
 *   node test/meaning-index-probe.mjs [bundles] [reps]
 */
import { DatabaseSync } from "node:sqlite";
import { compile, PROVENANCE_COLS } from "../src/query.mjs";
import { SCHEMA } from "../src/schema.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const N_BUNDLES = Number(process.argv[2] || 20000);
const REPS = Number(process.argv[3] || 25);
const VIEWER = "class:member";

/* The corpus proportions come from what the record actually looks like rather
   than from round numbers: most bundles are information, a minority are
   inquiries, most legs are earned (grade_source 'resolution'), and HUNCH IS
   RARE — it is debt, and a corpus where most legs were hunches would be a
   corpus nobody would publish from. A rare value is exactly the case an index
   is for and exactly the case a scan is worst at, so it is the honest shape to
   measure. */
const INQUIRY_SHARE = 0.05;      // 1 in 20 bundles is an inquiry
const LEGS_PER_INQUIRY = 4;
const HUNCH_SHARE = 0.02;        // 2% of legs are hunches
const RESOLUTIONS_PER_BUNDLE = 5;
const ENTITIES = 400;

const db = new DatabaseSync(":memory:");
/* Only the columns these arms touch. A synthetic table is a synthetic table and
   saying so is better than pretending the whole schema is here. */
db.exec(`
  CREATE TABLE bundles (fts_id INTEGER, ${PROVENANCE_COLS.map((c) => c + (c === 'bundle_id' ? ' TEXT PRIMARY KEY' : ' TEXT')).join(', ')}, fm_json TEXT);
  CREATE TABLE inquiry_basis (bundle_id TEXT NOT NULL, ord INTEGER NOT NULL, target_id TEXT NOT NULL,
    target_type TEXT, role TEXT, grade TEXT, grade_axis TEXT, grade_source TEXT, note TEXT, at TEXT, ground TEXT,
    PRIMARY KEY (bundle_id, ord));
  CREATE TABLE resolutions (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
    entity_id TEXT NOT NULL, grade TEXT NOT NULL, method TEXT, basis TEXT, established INTEGER,
    raised_from TEXT, resolved_by TEXT, at TEXT, PRIMARY KEY (capture_sha, ref, entity_id));
  CREATE TABLE project_participants (project_id TEXT, member_id TEXT);
  CREATE TABLE members (member_id TEXT, role TEXT, status TEXT);
`);

/* THE INDEXES ARE READ OUT OF THE SOURCE, NEVER TYPED HERE, AND THE FIRST
   VERSION OF THIS PROBE PROVES WHY. It hand-wrote the two indexes `schema.mjs`
   declares on `bundles` and therefore MISSED `bundles_fts_id`, which is created
   in `store.mjs`'s migration rather than in the schema text — so the probe
   reported a full scan of the bundle table on every query and a 97% saving from
   an index THE PRODUCT HAS ALREADY HAD FOR MONTHS. That is the exact instrument
   defect this project keeps paying for: a control that validates a parallel copy
   rather than the thing. Both sources are swept, so an index declared in either
   place is one the probe has. */
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const TABLES = ["bundles", "inquiry_basis", "resolutions"];
const indexDdl = [];
for (const src of [SCHEMA, STORE_SRC])
  for (const m of src.matchAll(/CREATE\s+(UNIQUE\s+)?INDEX\s+(IF NOT EXISTS\s+)?(\w+)\s+ON\s+(\w+)\s*\(([^)]*)\)/gi))
    if (TABLES.includes(m[4])) indexDdl.push([m[3], m[4], `CREATE ${m[1] ? "UNIQUE " : ""}INDEX IF NOT EXISTS ${m[3]} ON ${m[4]}(${m[5]})`]);
/* THE TWO INDEXES UNDER TEST ARE HELD BACK from the initial sweep, so "before"
   is genuinely before them. Their DDL is still the SHIPPING DDL, taken from the
   source sweep rather than retyped -- what is measured is what lands. */
const UNDER_TEST = ["inquiry_basis_grade_source", "resolutions_grade"];
for (const [name, , ddl] of indexDdl) if (!UNDER_TEST.includes(name)) db.exec(ddl);
console.log(`indexes driven from source onto ${TABLES.join(", ")}: `
          + indexDdl.map(([n, tbl]) => `${n} (${tbl})`).join(", "));
if (!indexDdl.some(([n]) => n === "bundles_fts_id"))
  throw new Error("the sweep found no bundles_fts_id -- it is in store.mjs's migration and the probe MUST have it");

const insB = db.prepare(`INSERT INTO bundles (fts_id, bundle_id, object_type, current_state, last_updated) VALUES (?,?,?,?,?)`);
const insL = db.prepare(`INSERT INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,ground) VALUES (?,?,?,?,?,?,?,?,?)`);
const insR = db.prepare(`INSERT INTO resolutions (capture_sha,bundle_id,ref,entity_id,grade,method,established) VALUES (?,?,?,?,?,?,?)`);

let legs = 0, hunches = 0, resolutions = 0, inquiries = 0, gradeC = 0;
db.exec("BEGIN");
for (let i = 0; i < N_BUNDLES; i++) {
  const isInq = i % Math.round(1 / INQUIRY_SHARE) === 0;
  const id = (isInq ? "INQ-" : "INFO-") + String(i).padStart(6, "0");
  /* last_updated is POPULATED, because the default sort is over it and a column
     that is NULL for every row makes the ORDER BY degenerate — which would have
     measured a query no member ever runs. Spread over a year so ties are the
     ordinary number of ties rather than none or all. */
  insB.run(i + 1, id, isInq ? "inquiry" : "information", isInq ? "open" : "collected",
    new Date(Date.UTC(2026, 0, 1) + (i % 365) * 86400000).toISOString());
  if (isInq) {
    inquiries++;
    for (let o = 0; o < LEGS_PER_INQUIRY; o++) {
      const hunch = (legs % Math.round(1 / HUNCH_SHARE)) === 0;
      insL.run(id, o, "INFO-" + String((i + o + 1) % N_BUNDLES).padStart(6, "0"),
        "information", o === 3 ? "cuts_against" : "supports",
        "ABCD"[(legs + o) % 4], o % 2 ? "connection" : "capture",
        hunch ? "hunch" : (legs % 5 === 1 ? "testimony" : "resolution"),
        o < 2 ? null : "ground-" + (o % 2));
      legs++; if (hunch) hunches++;
    }
  }
  for (let r = 0; r < RESOLUTIONS_PER_BUNDLE; r++) {
    const g = "ABCD"[(i + r) % 4];
    insR.run("sha" + i + "-" + r, id, "ref-" + r, "ENT-" + ((i + r) % ENTITIES), g, "m", g === "A" || g === "B" ? 1 : 0);
    resolutions++; if (g === "C") gradeC++;
  }
}
db.exec("COMMIT");
db.exec("ANALYZE");

/* PRINT THE CORPUS EVERY RUN. A probe whose corpus silently shrank would report
   a fast query and a wrong conclusion, and the only defence is saying the size
   out loud beside the number. */
console.log(`\ncorpus: ${N_BUNDLES} bundles (${inquiries} inquiries) · ${legs} legs of which ${hunches} hunch`
          + ` · ${resolutions} resolutions of which ${gradeC} grade C · ${REPS} reps\n`);

/* THE QUERIES ARE COMPILED, NOT WRITTEN. */
const CASES = [
  ["leg:hunch",        "the D-223 question: which inquiries carry a hunch leg"],
  ["leg:cuts_against", "a leg that argues the other way (invariant 7)"],
  ["resolves:C",       "the flagged set: schema.mjs's C tier, 'FLAGGED for a member to confirm'"],
  ["resolves:>=B",     "B or weaker, the range form"],
  ["concerns:ENT-7",   "the reverse index, which already has an index on entity_id"],
  ["leg:hunch state:open", "the arm composed with an ordinary metadata filter"],
];

/* What gets added in the AFTER phase: the two shipping indexes, DDL taken from
   the source sweep, plus one CANDIDATE that is deliberately NOT in the source --
   inquiry_basis(role) -- because "should this exist too" is a question this probe
   is here to answer and the answer is allowed to be no. */
const INDEXES = [
  ...UNDER_TEST.map((n) => {
    const row = indexDdl.find(([name]) => name === n);
    if (!row) throw new Error(`the sweep found no DDL for ${n} -- it must ship, or this probe measures a fiction`);
    return [n, row[2]];
  }),
  ["inquiry_basis_role (CANDIDATE, not in source)",
   "CREATE INDEX IF NOT EXISTS inquiry_basis_role ON inquiry_basis(role, bundle_id)"],
];

const time = (stmt) => {
  const t0 = process.hrtime.bigint();
  let rows = 0;
  for (let i = 0; i < REPS; i++) rows = stmt.all().length;
  const t1 = process.hrtime.bigint();
  return { ms: Number(t1 - t0) / 1e6 / REPS, rows };
};

const planOf = (sql, args) => db.prepare("EXPLAIN QUERY PLAN " + sql).all(...args)
  .map((r) => r.detail).filter((d) => /inquiry_basis|resolutions/.test(d));

const measure = (label) => {
  console.log(`--- ${label} ---`);
  const out = new Map();
  for (const [q, why] of CASES) {
    const plan = compile({ q, viewer: VIEWER, facets: [] });
    const st = plan.statements.page();
    const stmt = db.prepare(st.sql);
    /* Bind once, run REPS times: the binding is not what is being measured. */
    const bound = { all: () => stmt.all(...st.args) };
    const { ms, rows } = time(bound);
    out.set(q, ms);
    console.log(`  ${ms.toFixed(3).padStart(9)} ms  ${String(rows).padStart(5)} rows  ${q}`);
    for (const d of planOf(st.sql, st.args)) console.log(`               plan: ${d}`);
    if (label === "BEFORE") console.log(`               (${why})`);
  }
  console.log("");
  return out;
};

const before = measure("BEFORE — the state D-222 measured: no grade column indexed anywhere");

for (const [, sql] of INDEXES) db.exec(sql);
db.exec("ANALYZE");
const withGrade = measure("AFTER — " + INDEXES.map(([n]) => n).join(", "));

console.log("--- the delta, which is the decision ---");
const pc = (b, a) => (b > 0 ? ((b - a) / b) * 100 : 0);
const sign = (x) => `${x >= 0 ? "-" : "+"}${Math.abs(x).toFixed(1)}%`;
console.log(`  ${"query".padEnd(24)} ${"no grade idx".padStart(13)} ${"with".padStart(10)}      delta`);
for (const [q] of CASES) {
  const b = before.get(q), g = withGrade.get(q);
  console.log(`  ${q.padEnd(24)} ${b.toFixed(3).padStart(13)} ${g.toFixed(3).padStart(10)}   ${sign(pc(b, g)).padStart(9)}`);
}
/* The cost side, because an index is not free and a decision that priced only
   the benefit is half a decision. */
const pages = (t) => db.prepare(`SELECT count(*) AS n FROM sqlite_master WHERE type='index' AND tbl_name=?`).get(t).n;
console.log(`\nindexes now on inquiry_basis: ${pages("inquiry_basis")} · on resolutions: ${pages("resolutions")}`);
console.log(`write cost: every op=promote of an inquiry rewrites its basis rows (delete-then-insert),`);
console.log(`so an added index is one more B-tree per leg written, at ${LEGS_PER_INQUIRY} legs per inquiry.\n`);
