/* Does the `content:` arm need an index per filtered column? (REC-90 /
 * CONTENT-SEARCH-DESIGN.md §4.2: "grade and kind columns indexed or the reason
 * measured and recorded, as `inquiry_basis(grade_source)` was")
 *
 * THE ROW SAYS THE DECISION IS MEASURED, NOT ASSUMED, and `meaning-index-probe.mjs`
 * is the precedent this is built on — same construction, one construct over. It
 * is a PROBE, not a suite: it is not in the battery, for the reason
 * `bench:retrieval` and `cite-scale.mjs` are not.
 *
 * WHAT IT DOES, and the one thing that matters about how it is built: THE SQL IS
 * DRIVEN OUT OF `compile()`, never typed here. A probe that measured a
 * hand-written statement would be measuring a statement no member can produce,
 * which is the class of instrument defect this project has already paid for
 * twice — a control that validated a parallel copy of the thing rather than the
 * thing. So the corpus is synthetic and the QUERY is the real one.
 *
 * THE ENGINE IS `node:sqlite`, NOT workerd, AND THAT IS STATED RATHER THAN
 * HIDDEN — `meaning-index-probe.mjs`'s own words, and they hold here unchanged.
 * What is measured is the QUERY PLANNER's use of an index, which is SQLite core
 * and identical in both; the compound-SELECT ceiling is the known workerd
 * difference and is not what this probe is about. The plan lines
 * (`EXPLAIN QUERY PLAN`) are the evidence; the milliseconds are the size of the
 * effect.
 *
 * WHAT THIS INSTRUMENT CANNOT SEE, said plainly because that sentence is what
 * lets the next reader tell a clean result from a walk looking in the wrong
 * place:
 *   - THE REAL DISTRIBUTION. The proportions below are reasoned from how content
 *     rows are MINTED (lazily, on first cite, plus SK-7/SK-8 machine mints) and
 *     are NOT measured off a live corpus, because no instance has enough content
 *     rows to measure yet — the table landed on 2026-09-14. A different
 *     distribution moves every figure here, and the direction is predictable: an
 *     index is worth MOST where the matching value is RARE and least where it is
 *     common.
 *   - THE WRITE COST IN PRODUCTION. It is priced below in B-trees per mint, not
 *     in milliseconds, because a mint is one INSERT OR IGNORE and the probe has
 *     no honest way to time workerd's storage.
 *   - ANY COST ON RE-PROMOTION. `content` rows are NEVER rewritten by design
 *     (REC-82), unlike `inquiry_basis`, which promote delete-then-inserts. That
 *     asymmetry is the single biggest difference from the `inquiry_basis`
 *     decision this probe is modelled on, and it points TOWARD indexing.
 *
 *   node test/content-index-probe.mjs [bundles] [reps]
 */
import { DatabaseSync } from "node:sqlite";
import { compile, PROVENANCE_COLS } from "../src/query.mjs";
import { SCHEMA } from "../src/schema.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const N_BUNDLES = Number(process.argv[2] || 20000);
const REPS = Number(process.argv[3] || 25);
const VIEWER = "class:member";

/* THE PROPORTIONS, AND WHY EACH ONE IS WHAT IT IS. Every one of these is a claim
   about how content rows come to exist, and each is stated so a later reader can
   overturn it with a real corpus rather than with an opinion. */
const DOC_WITH_CONTENT = 0.30;   // content is minted on first cite; most documents are not cited yet
const ROWS_PER_DOC = 6;          // a cited document tends to be cited several times
const KIND_DOCUMENT = 0.55;      // the legacy backfill mints `document` for every pre-REC-82 leg
const STALE_SHARE = 0.03;        // a re-read moves the chain: rare, and it is DEBT — leg:hunch's shape
const MACHINE_SHARE = 0.20;      // SK-7/SK-8 proposals; the ratio those items exist to watch
const PLANE_SHARE = 0.45;        // promote's own projection
const CAP_NULL_SHARE = 0.35;     // UNDETERMINED is first-class and common
const UNCITED_SHARE = 0.22;      // machine mints nobody has cited — SK-8 §7.3 (6)'s numerator

/* REC-104: THE `chain_kind` COLUMN IS READ OUT OF THE PRODUCT'S OWN DDL, never
   typed — the same rule this file applies to indexes below, for the same reason.
   A probe that declared the column its own way would be measuring a column the
   plane does not have. */
const CHAIN_KIND_DDL = (() => {
  const i = SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS content (");
  const stmt = SCHEMA.slice(i, SCHEMA.indexOf("\n);", i));
  const line = stmt.split("\n").map((l) => l.replace(/--.*$/, "").trim()).find((l) => /^chain_kind\s/.test(l));
  if (!line) throw new Error("schema.mjs's content table declares no chain_kind -- REC-104's column is missing");
  return line.replace(/,$/, "");
})();
console.log(`chain_kind, driven from schema.mjs: ${CHAIN_KIND_DDL}`);
const db = new DatabaseSync(":memory:");
/* Only the columns these arms touch. A synthetic table is a synthetic table and
   saying so is better than pretending the whole schema is here. */
db.exec(`
  CREATE TABLE bundles (fts_id INTEGER, ${PROVENANCE_COLS.map((c) => c + (c === 'bundle_id' ? ' TEXT PRIMARY KEY' : ' TEXT')).join(', ')}, fm_json TEXT);
  CREATE TABLE content (content_id TEXT PRIMARY KEY, capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL,
    extent_kind TEXT NOT NULL, extent TEXT NOT NULL, ref TEXT NOT NULL, chain TEXT, derivation_cap TEXT,
    page_count INTEGER, minted_by TEXT NOT NULL, at TEXT NOT NULL, stale INTEGER NOT NULL DEFAULT 0,
    ${CHAIN_KIND_DDL});
  CREATE TABLE inquiry_basis (bundle_id TEXT NOT NULL, ord INTEGER NOT NULL, target_id TEXT NOT NULL,
    target_type TEXT, role TEXT, grade TEXT, grade_axis TEXT, grade_source TEXT, note TEXT, at TEXT,
    ground TEXT, content_id TEXT, PRIMARY KEY (bundle_id, ord));
  CREATE TABLE inquiry_basis_version_legs (bundle_id TEXT, version INTEGER, ord INTEGER,
    target_id TEXT, content_id TEXT);
  CREATE TABLE project_participants (project_id TEXT, member_id TEXT);
  CREATE TABLE members (member_id TEXT, role TEXT, status TEXT);
`);

/* THE INDEXES ARE READ OUT OF THE SOURCE, NEVER TYPED HERE, and the first
   version of `meaning-index-probe.mjs` proves why: it hand-wrote the indexes and
   therefore MISSED `bundles_fts_id`, which is created in `store.mjs`'s migration
   rather than in the schema text — so it reported a full scan of the bundle
   table on every query and a 97% saving from an index the product had had for
   months. Both sources are swept. */
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const TABLES = ["bundles", "content", "inquiry_basis", "inquiry_basis_version_legs"];
const indexDdl = [];
for (const src of [SCHEMA, STORE_SRC])
  for (const m of src.matchAll(/CREATE\s+(UNIQUE\s+)?INDEX\s+(IF NOT EXISTS\s+)?(\w+)\s+ON\s+(\w+)\s*\(([^)]*)\)/gi))
    if (TABLES.includes(m[4])) indexDdl.push([m[3], m[4], `CREATE ${m[1] ? "UNIQUE " : ""}INDEX IF NOT EXISTS ${m[3]} ON ${m[4]}(${m[5]})`]);
console.log(`indexes driven from source onto ${TABLES.join(", ")}:`);
for (const [n, tbl] of indexDdl) console.log(`  ${n} (${tbl})`);
if (!indexDdl.some(([n]) => n === "bundles_fts_id"))
  throw new Error("the sweep found no bundles_fts_id -- it is in store.mjs's migration and the probe MUST have it");
if (!indexDdl.some(([, tbl]) => tbl === "content"))
  throw new Error("the sweep found NO index on content -- REC-82 declares two, so the sweep is broken");

/* THE CANDIDATES UNDER TEST are held back from the BEFORE phase. Any that SHIP
   are taken from the source sweep so what is measured is what lands; any that do
   not ship are marked CANDIDATE, because "should this exist too" is a question
   this probe is here to answer and the answer is allowed to be no. */
const CANDIDATES = [
  ["content(extent_kind, bundle_id)",  "CREATE INDEX IF NOT EXISTS content_extent_kind ON content(extent_kind, bundle_id)"],
  ["content(stale, bundle_id)",        "CREATE INDEX IF NOT EXISTS content_stale ON content(stale, bundle_id)"],
  ["content(minted_by, bundle_id)",    "CREATE INDEX IF NOT EXISTS content_minted_by ON content(minted_by, bundle_id)"],
  ["content(derivation_cap, bundle_id)", "CREATE INDEX IF NOT EXISTS content_derivation_cap ON content(derivation_cap, bundle_id)"],
  ["inquiry_basis(content_id)",        "CREATE INDEX IF NOT EXISTS inquiry_basis_content ON inquiry_basis(content_id)"],
  ["inquiry_basis_version_legs(content_id)", "CREATE INDEX IF NOT EXISTS inquiry_basis_version_legs_content ON inquiry_basis_version_legs(content_id)"],
  /* REC-104. Held back from the BEFORE phase like the six above, so the two
     phases separate what the COLUMN buys (no parse per row) from what its INDEX
     buys (no scan). */
  ["content(chain_kind, bundle_id)",   "CREATE INDEX IF NOT EXISTS content_chain_kind ON content(chain_kind, bundle_id)"],
];
const SHIPPING = new Set(indexDdl.map(([n]) => n));
for (const [name, , ddl] of indexDdl) if (!CANDIDATES.some(([, d]) => d === ddl)) db.exec(ddl);

const insB = db.prepare(`INSERT INTO bundles (fts_id, bundle_id, object_type, current_state, last_updated) VALUES (?,?,?,?,?)`);
const insC = db.prepare(`INSERT INTO content (content_id,capture_sha,bundle_id,extent_kind,extent,ref,chain,derivation_cap,page_count,minted_by,at,stale) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
const insL = db.prepare(`INSERT INTO inquiry_basis (bundle_id,ord,target_id,target_type,grade_source,content_id) VALUES (?,?,?,?,?,?)`);
const insV = db.prepare(`INSERT INTO inquiry_basis_version_legs (bundle_id,version,ord,target_id,content_id) VALUES (?,?,?,?,?)`);

const KINDS = ["pdf-page", "sheet-cell", "slide-shape", "doc-para"];
const STEPS = ["layer", "ocr", "ai", "pixels"];
let cRows = 0, staleRows = 0, machineRows = 0, ocrRows = 0, uncited = 0, capNull = 0, pdfPage = 0, legs = 0;
db.exec("BEGIN");
for (let i = 0; i < N_BUNDLES; i++) {
  const id = "INFO-" + String(i).padStart(6, "0");
  insB.run(i + 1, id, "information", "collected",
    new Date(Date.UTC(2026, 0, 1) + (i % 365) * 86400000).toISOString());
  if ((i % Math.round(1 / DOC_WITH_CONTENT)) !== 0) continue;
  for (let r = 0; r < ROWS_PER_DOC; r++) {
    const n = cRows;
    const cid = "c" + String(n).padStart(9, "0");
    const isDoc = (n % 100) < KIND_DOCUMENT * 100;
    const kind = isDoc ? "document" : KINDS[n % KINDS.length];
    const stale = (n % Math.round(1 / STALE_SHARE)) === 0 ? 1 : 0;
    const mBucket = n % 100;
    const minted = mBucket < MACHINE_SHARE * 100 ? "class:assistant"
                 : mBucket < (MACHINE_SHARE + PLANE_SHARE) * 100 ? "plane"
                 : "MEM-" + (n % 40);
    const capNullHere = (n % 100) < CAP_NULL_SHARE * 100;
    const step = STEPS[n % STEPS.length];
    /* The chain is stored EXACTLY as `mintContent` stores it: JSON.stringify of
       the chain array. A probe that stored a bare step string would measure a
       predicate the plane never runs. */
    insC.run(cid, "sha" + i, id, kind, "{}", "ref " + r,
      JSON.stringify([{ step: "layer" }, { step }]),
      capNullHere ? null : "ABCD"[n % 4], isDoc ? null : 20, minted,
      new Date(Date.UTC(2026, 0, 1)).toISOString(), stale);
    cRows++;
    if (stale) staleRows++;
    if (minted.startsWith("class:")) machineRows++;
    if (step === "ocr") ocrRows++;
    if (capNullHere) capNull++;
    if (kind === "pdf-page") pdfPage++;
    /* Most content rows ARE cited — a row is minted BY a citation. The uncited
       tail is the machine-mint tail, which is the set SK-8's ratio watches. */
    if ((n % 100) < UNCITED_SHARE * 100) { uncited++; continue; }
    insL.run("INQ-" + (n % 900), legs, id, "information", "resolution", cid);
    legs++;
    if (n % 7 === 0) insV.run("INQ-" + (n % 900), 1, legs, id, cid);
  }
}
db.exec("COMMIT");
db.exec("ANALYZE");

/* PRINT THE CORPUS EVERY RUN, and FLOOR it. A probe whose corpus silently shrank
   would report a fast query and a wrong conclusion, and a headline totality
   assertion passing over an empty corpus is a failure this project has measured
   THREE times. */
console.log(`\ncorpus: ${N_BUNDLES} bundles · ${cRows} content rows`
  + ` (${pdfPage} pdf-page · ${staleRows} stale · ${machineRows} machine-minted · ${ocrRows} ocr-last`
  + ` · ${capNull} cap UNDETERMINED · ${uncited} uncited) · ${legs} legs · ${REPS} reps\n`);
for (const [label, n] of [["content rows", cRows], ["stale", staleRows], ["machine", machineRows],
                          ["ocr-last", ocrRows], ["uncited", uncited], ["pdf-page", pdfPage],
                          ["cap null", capNull], ["legs", legs]])
  if (!(n > 0)) throw new Error(`the corpus has ZERO ${label} -- every figure below would be meaningless`);

/* THE QUERIES ARE COMPILED, NOT WRITTEN. */
const CASES = [
  ["content:pdf-page",           "the extent-kind question: which documents hold a cited PAGE"],
  ["content:document",           "the COMMON value of the same column -- an index is worth least here"],
  ["content:stale",              "REC-82's debt question: citations made under a transcription since replaced"],
  ["content:machine",            "SK-7/SK-8: which documents hold a passage a MACHINE marked citable"],
  ["content:plane",              "the same column, its commonest value"],
  ["content:cap=undetermined",   "UNDETERMINED as its own value -- IS NULL, never folded into a letter"],
  ["content:cap<C",             "the derivation cap compared: half of §4.2's worked example"],
  ["content:ocr",                "the chain's LAST STEP -- off the chain_kind COLUMN since REC-104, and the other half of that example"],
  ["content:uncited",            "marked citable and used by no finding: SK-8 §7.3 (6) as a SET"],
  ["content:cited",              "its complement, the common case"],
  ["content:ocr content:cap<C",  "§4.2's worked example entire: every OCR'd region below cap C"],
];

/* REC-104 — THE RETIRED STATEMENT, KEPT IN THE INSTRUMENT AND NOWHERE ELSE. Until
   REC-104 `content:<step>` compiled to `json_extract(chain, '$[#-1].step') = ?`.
   The plane no longer produces it, so it cannot be compiled — it is DERIVED from
   the statement the plane DOES produce by substituting the retired predicate for
   the column's, and the substitution is asserted to have happened exactly once.
   It is the row this probe has always used as its noise floor (no index can
   touch a parse), and it is the same-run BEFORE for the column. */
const RETIRED_PRED = "json_extract(chain, '$[#-1].step')";
const RETIRED = [
  ["RETIRED content:ocr",               "content:ocr"],
  ["RETIRED content:ocr content:cap<C", "content:ocr content:cap<C"],
];
const retiredOf = (q) => {
  const st = compile({ q, viewer: VIEWER, facets: [] }).statements.page();
  const n = st.sql.split("chain_kind = ?").length - 1;
  if (n !== 1) throw new Error(`${q}: the column predicate occurs ${n}x, not once -- cannot derive the retired statement`);
  return { sql: st.sql.replace("chain_kind = ?", `${RETIRED_PRED} = ?`), args: st.args };
};

const time = (stmt) => {
  const t0 = process.hrtime.bigint();
  let rows = 0;
  for (let i = 0; i < REPS; i++) rows = stmt.all().length;
  const t1 = process.hrtime.bigint();
  return { ms: Number(t1 - t0) / 1e6 / REPS, rows };
};
const planOf = (sql, args) => db.prepare("EXPLAIN QUERY PLAN " + sql).all(...args)
  .map((r) => r.detail).filter((d) => /content|inquiry_basis/.test(d));

const measure = (label, showWhy) => {
  console.log(`--- ${label} ---`);
  const out = new Map();
  for (const [q, why] of [...CASES, ...RETIRED.map(([l, src]) => [l, `the pre-REC-104 statement for ${src}`])]) {
    const retired = RETIRED.find(([l]) => l === q);
    const plan = retired ? null : compile({ q, viewer: VIEWER, facets: [] });
    if (plan && !plan.meaningArms.length) throw new Error(`${q} compiled NO meaning arm -- the probe is measuring free text`);
    const st = retired ? retiredOf(retired[1]) : plan.statements.page();
    const stmt = db.prepare(st.sql);
    const bound = { all: () => stmt.all(...st.args) };
    const { ms, rows } = time(bound);
    out.set(q, ms);
    console.log(`  ${ms.toFixed(3).padStart(9)} ms  ${String(rows).padStart(5)} rows  ${q}`);
    for (const d of planOf(st.sql, st.args)) console.log(`               plan: ${d}`);
    if (showWhy) console.log(`               (${why})`);
  }
  console.log("");
  return out;
};

const before = measure("BEFORE — only the two indexes REC-82 ships: content(capture_sha), content(bundle_id)", true);
for (const [, sql] of CANDIDATES) db.exec(sql);
db.exec("ANALYZE");
const after = measure("AFTER — " + CANDIDATES.map(([n]) => n).join(", "), false);

console.log("--- the delta, which is the decision ---");
const pc = (b, a) => (b > 0 ? ((b - a) / b) * 100 : 0);
const sign = (x) => `${x >= 0 ? "-" : "+"}${Math.abs(x).toFixed(1)}%`;
/* THE NOISE FLOOR, NAMED AND MEASURED RATHER THAN ASSUMED, and this row is why
   the first run of this probe could not decide anything. `content:ocr` filters on
   a JSON PARSE of the chain column — NO index in the candidate set can touch it,
   and none is proposed for it. So whatever delta it shows between the two phases
   is pure run-to-run variation: cache warmth, ANALYZE, the machine's other load.
   Every other delta must be read AGAINST it, and one that does not clear it is
   not a measurement of an index — it is a measurement of the afternoon. Measured
   at two corpus sizes for the same reason `inquiry_basis_grade_source` was: the
   quantity being bought is the PROPORTION, and the proportion grows with the
   corpus, so a single size cannot tell a real effect from a lucky one. */
/* REC-104 MOVED THE CONTROL, and said so: `content:ocr` now reads a column that a
   candidate index DOES serve, so it can no longer be the row nothing touches. The
   retired parse can, so it inherits the role unchanged. */
const NOISE_CASE = "RETIRED content:ocr";
const noise = Math.abs(pc(before.get(NOISE_CASE), after.get(NOISE_CASE)));
console.log(`  ${"query".padEnd(30)} ${"no index".padStart(11)} ${"with".padStart(10)}      delta   vs noise`);
for (const [q] of [...CASES, ...RETIRED]) {
  const d = pc(before.get(q), after.get(q));
  const verdict = q === NOISE_CASE ? "THE CONTROL"
                : Math.abs(d) <= noise ? "inside noise"
                : Math.abs(d) >= 3 * noise ? "CLEARS x3" : "clears";
  console.log(`  ${q.padEnd(30)} ${before.get(q).toFixed(3).padStart(11)} ${after.get(q).toFixed(3).padStart(10)}   ${sign(d).padStart(9)}   ${verdict}`);
}
console.log(`\nNOISE FLOOR: ${noise.toFixed(1)}% — the swing on \`${NOISE_CASE}\`, which NO candidate index can affect`);
console.log(`(it filters on json_extract over the chain column, so its two phases differ only by chance)`);

/* REC-104 — THE COLUMN AGAINST THE PARSE IT REPLACED, IN THE SAME RUN, and the
   OVER-STRICTNESS half first: the column must change how the question is
   answered and NEVER which rows answer it. Every step value, presence and the
   worked example are asked both ways over the whole corpus and must agree row for
   row; a single disagreement stops the probe, because a faster wrong answer is
   not an improvement. */
console.log("\n--- REC-104: the column against the retired parse ---");
{
  const both = (q) => {
    const now = compile({ q, viewer: VIEWER, facets: [] }).statements.page();
    const old = retiredOf(q);
    const a = JSON.stringify(db.prepare(now.sql).all(...now.args));
    const b = JSON.stringify(db.prepare(old.sql).all(...old.args));
    return [a === b, db.prepare(now.sql).all(...now.args).length];
  };
  for (const q of [...STEPS.map((x) => `content:${x}`), "content:ocr content:cap<C", "content:layer content:stale"]) {
    const [same, n] = both(q);
    console.log(`  ${same ? "SAME" : "DIFFERENT"}  ${String(n).padStart(5)} rows  ${q}`);
    if (!same) throw new Error(`${q}: the column and the retired parse DISAGREE -- the column is not the same question`);
  }
  const col = after.get("content:ocr"), par = after.get("RETIRED content:ocr");
  console.log(`\n  content:ocr   column+index ${col.toFixed(3)} ms   retired parse ${par.toFixed(3)} ms   `
            + `${sign(pc(par, col))} same run, both phases' indexes present`);
  console.log(`  REC-90's recorded figure for the parse (M-23, 20,000 bundles, 9 reps): 8.579 ms no-index phase, 6.819 ms with`);
}

/* THE COST SIDE, because an index is not free and a decision that priced only
   the benefit is half a decision. THE ASYMMETRY WITH `inquiry_basis` IS THE
   POINT: a promote delete-then-inserts every leg of an inquiry, so an index
   there is re-written on every promotion; a content row is minted ONCE and NEVER
   REWRITTEN (REC-82), so an index here is one B-tree insert per mint, for ever. */
const idxCount = (t) => db.prepare(`SELECT count(*) AS n FROM sqlite_master WHERE type='index' AND tbl_name=? AND sql IS NOT NULL`).get(t).n;
console.log(`\nindexes now on content: ${idxCount("content")} · inquiry_basis: ${idxCount("inquiry_basis")}`
          + ` · inquiry_basis_version_legs: ${idxCount("inquiry_basis_version_legs")}`);
console.log(`write cost: a content row is INSERT OR IGNORE'd once and NEVER rewritten (REC-82), so each`);
console.log(`added index is ONE B-tree insert per mint and nothing on re-promotion — unlike inquiry_basis,`);
console.log(`whose every leg is delete-then-inserted by every op=promote.`);
console.log(`\nwhich candidates already SHIP: ${CANDIDATES.filter(([, d]) => SHIPPING.has(/INDEX IF NOT EXISTS (\w+)/.exec(d)[1])).map(([n]) => n).join(", ") || "(none yet)"}`);
