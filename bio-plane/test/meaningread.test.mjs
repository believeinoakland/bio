/* NEGATIVE CONTROL: (RUN 2026-08-07, pl9-agent, each arm armed ALONE by a scripted mutation, the suites run, then every file RESTORED FROM A PRISTINE COPY with the restore verified BY sha256 AND BY `cmp` — an NC harness once reported a byte-identical restore over a file that had not been restored. Whole, clean: 106 pass, 0 fail.) (1) BUILD IT AS A SECOND COMPILATION POINT (D-15) — in `src/query.mjs` the meaning shape emits ``WHERE ${GATE_MARK} 1=1`` instead of interpolating the compiled predicate -> meaningread 95 pass / 11 FAIL and meaningquery 101/1 FAIL, headed by "the gate is STILL minted in exactly ONE function at its three branches — PL-9 added no fourth site" (4 sites, not 3) in BOTH suites. THE POINT: the statement now LOOKS gated to `Store#runQuery`'s marker check while carrying a predicate nobody compiled through `viewerPredicate`, which is the failure the throw alone cannot see and is why the pin is on the COUNT. (2) THE VIEWER DROPPED — `viewerPredicate`'s member branch returns ``1=1`` without the marker -> 79 pass, 27 FAIL, every runtime arm, and the op answers `{"ok":false,"error":"Error: REFUSED: a retrieval statement reached the store without the viewer visibility gate (D-15) at #runQuery ... at Store.meaningRows"}`. The shape never runs ungated; it does not run at all. (2a) AND THIS CONTROL FOUND A DEFECT IN THE SUITE RATHER THAN CONFIRMING IT: on its first run the suite THREW at `many.rows is not iterable` and reported "assertions unknown" with 0 passing, hiding every arm behind it — D-93's class inside a control, for the seventh recorded time. Six reads are null-tolerant now and the counts above are the post-fix ones. (3) REC-36 WEAKENED TO REDACTION — the owning-bundle gate moved out of the WHERE and into the projection as `CASE WHEN (gate) THEN b.bundle_id ELSE NULL END`, so a row the viewer may not see is RETURNED with its bundle nulled instead of withheld -> 97 pass, 9 FAIL, including "WITHHELD, NOT REDACTED: no row arrives with its bundle nulled, blanked or hollowed out" and "THE RULE: the uninvited member's answer does not contain the project's row AT ALL". (3a) ITS FIRST ARMING WAS WRONG AND IS RECORDED AS MEASURED: changing only the WHERE and the projection left the COUNT statement bound with two arguments it no longer had placeholders for, SQLite errored, the op answered NOTHING, and the arm that names the rule PASSED over an empty answer while its neighbours failed for the wrong reason. A control that breaks the subject a DIFFERENT way than intended is not the control. The arming is five coordinated edits and the polarity is now checked. (4) ANSWER A BARE COLLECTION — `return rows;` above the envelope in `Store#meaningRows` -> bounds 102 pass, 5 FAIL, and **"PIN: ZERO capped ops answer with a bare array" FAILS with `got ["meaningrows"]`**, NAMING the op, with no exception list for it to be added to; meaningread 68/38. (5) THE PLAN ROW'S OWN — a `total` LARGER THAN THE GATED ROWS: the count projection loses the gate while the rows keep it -> 103 pass, 3 FAIL, "the TOTAL is gated with the rows" failing with `got [2,1,2,2]` — the uninvited member told there are two rows while reaching one, which is exactly how hidden stops being identical to absent. (6) OVER-STRICTNESS — section 13: five correct alternative phrasings, none of them the compact form this implementation was written around, all PASS. (7) ARMED-NESS is asserted rather than assumed throughout: the corpus sizes are PRINTED every run, "MEASURED: a PROJECT bundle carries meaning rows" proves the withhold arms have a population, and the strip guard proves the gate-site count cannot match a comment. */
/* D-222 OPTION C — THE MEANING-GRAIN READ. PL-9, and PL-8 is what it stands on.
 *
 * WHAT WAS WRONG, in the register's own sentence: `STORE-AS-CACHE.md` records
 * that the scalar projections onto the bundle row *"create a false sense of
 * coverage — the meaning layer is visible as a NUMBER and unreachable as a
 * STRUCTURE."* PL-8 made it reachable as a SET: `leg:hunch` answers WHICH
 * inquiries carry hunch debt. It said so in its own header — *"the arm selects
 * BUNDLES, so `leg:hunch` answers WHICH INQUIRIES carry a hunch leg and never
 * WHICH LEG"* — and named the meaning-GRAIN answer as a separate item. This is
 * that item.
 *
 * THE ACCEPTANCE IS NOT "THE OP ANSWERS". It is:
 *
 *   1. THE GRAIN IS WHAT IT SAYS IT IS, AND IT IS ASSERTED. One row is one
 *      MEANING-TABLE ROW — one LEG, or one RESOLUTION — and two rows are
 *      distinct exactly when the table's own PRIMARY KEY differs. That identity
 *      is not typed here: it is read out of `schema.mjs`'s CREATE TABLE and
 *      compared against the compiler's registry, so the two can disagree.
 *
 *   2. IT COMPOSES WITH PL-8 RATHER THAN DUPLICATING IT. `q` is PL-8's arm
 *      language verbatim and there is no second selector vocabulary. The pair
 *      is asserted as a RELATIONSHIP over the same corpus: the bundles op=search
 *      names for a query are exactly the bundles op=meaningrows returns rows
 *      for, and an inquiry that op=search names ONCE appears here ONCE PER LEG.
 *      Two grains, one selection, and neither is a spelling of the other.
 *
 *   3. IT IS NOT A SECOND QUERY PATH. D-15 gives visibility exactly ONE
 *      compilation point, enforced by a THROW in `Store#runQuery`; PL-8 pinned
 *      the COUNT of places that mint the marker, because "we were careful" is
 *      not an enforcement mechanism. THAT PIN IS KEPT ALIVE HERE at three, and
 *      this shape adds no fourth.
 *
 *   4. REC-36's STRICTER RULE HOLDS, MEASURED AGAINST A REAL WITHHELD ROW. §14c:
 *      a meaning-layer answer is a CANDIDATE LIST, and *"most reads redact a
 *      back-reference; a candidate list withholds the whole row, because even a
 *      nameless candidate discloses that something mentioning the subject sits
 *      in a project the viewer was not invited to."*
 *
 * AND HERE THIS SUITE CORRECTS ITS PREDECESSOR, WHICH IS THE FINDING THAT
 * OUTRANKS THE FEATURE. `meaningquery.test.mjs`'s header states, as the honest
 * gap it could not stage: *"Meaning rows attach to inquiries and to captures,
 * and a project bundle can carry neither."* THE SECOND HALF IS FALSE, and it was
 * false when it was written. `promote` writes `inquiry_basis` only for an
 * inquiry — that half is true and is asserted structurally there — but
 * `#writeReadings` is called for EVERY promote with no object_type test at all,
 * so a PROJECT bundle carrying `data/provenance.json` gets a reading, reference
 * rows, and `resolutions` rows keyed on the project. `gate-reads.test.mjs` has
 * been promoting exactly such a project since REC-30. MEASURED 2026-08-07 by
 * driving it: `op=resolve` over a project's capture writes a grade-A resolution
 * whose `bundle_id` is the project. So the participant half of the D-15 gate IS
 * stageable through the meaning layer, it is staged live below, and REC-36's
 * withhold rule is asserted against rows a real uninvited member really cannot
 * see rather than against a predicate reaching a statement.
 *
 * WHAT THIS SUITE DOES NOT CLAIM. It does not measure the SCAN's bound (D-227's
 * subject): it asserts that the statement carries `LIMIT ?` and that the cap
 * published is the cap applied, which is the honesty half. An unbounded
 * derivation feeding a bounded answer would pass here, and says so.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { compile, MEANING, meaningVocabulary, GATE_MARK,
         MEANING_LIMIT_DEFAULT, MEANING_LIMIT_MAX } from "../src/query.mjs";
import { MEANING_READ_CHECKS } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const M = "class:member";
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");

/* ==================================================================== 1
 * THE SEVENTH SHAPE, AND IT IS THE SEVENTH.
 * ================================================================== */
console.log("\n--- 1. a seventh statement shape on the SAME compiler ---");
{
  const p = compile({ q: "", viewer: M, rows: "leg" });
  const names = Object.keys(p.statements).sort();
  console.log(`  statement builders: ${names.length} (${names.join(", ")})`);
  t("the compiler registers SEVEN statement builders, and the seventh is the meaning shape",
    names, ["count", "facetScan", "facets", "ids", "meaning", "page", "snapshot"]);
  /* The six that were there must still be there: a new shape that displaced one
     would pass a bare count. */
  t("the six bundle-grain shapes are untouched",
    ["page", "count", "ids", "snapshot", "facets", "facetScan"].filter((n) => typeof p.statements[n] !== "function"), []);
  t("and it is registered in ONE place in the module source",
    (QUERY_SRC.match(/statements: \{ page, count, ids: idsStmt, snapshot, facets: facets_, facetScan, meaning \}/g) || []).length, 1);
  /* The shape is INERT unless a grain is named — so every existing caller of
     compile() gets exactly what it got before. */
  t("no grain named means no statement: the shape cannot fire by accident",
    [compile({ q: "leg:hunch", viewer: M }).statements.meaning(),
     compile({ q: "leg:hunch", viewer: M }).meaning], [null, null]);
  t("and a grain the registry does not hold is inert too, never guessed at",
    compile({ q: "", viewer: M, rows: "legs" }).statements.meaning(), null);
}

/* ==================================================================== 2
 * THE GRAIN, ASSERTED — driven off the SCHEMA, not typed here.
 * ================================================================== */
console.log("\n--- 2. the grain: what is one row, and what makes two rows distinct ---");
const ARMS = Object.keys(MEANING);
console.log(`  corpus of arms: ${ARMS.length} (${ARMS.join(", ")})`);
t("there ARE arms to drive (a walk that covers nothing proves nothing)", ARMS.length > 0, true);
{
  /* The PRIMARY KEY of each meaning table, read out of schema.mjs. This is the
     assertion that makes "the grain is the table's own identity" a checkable
     fact rather than a sentence: the registry and the schema can disagree, and
     if they ever do, THIS fails rather than the answer silently repeating or
     losing rows under paging. */
  const pkOf = (table) => {
    const at = SCHEMA_SRC.indexOf(`CREATE TABLE IF NOT EXISTS ${table} (`);
    if (at < 0) return null;
    const end = SCHEMA_SRC.indexOf("\n);", at);
    if (end < 0) return null;
    const m = /PRIMARY KEY \(([^)]*)\)/.exec(SCHEMA_SRC.slice(at, end));
    return m ? m[1].split(",").map((s) => s.trim()) : null;
  };
  const tables = [...new Set(ARMS.map((a) => MEANING[a].table))];
  console.log(`  meaning tables behind the arms: ${tables.join(", ")}`);
  t("every meaning table's PRIMARY KEY is READABLE from schema.mjs (else nothing below is measuring anything)",
    tables.filter((tb) => !pkOf(tb)), []);
  t("THE GRAIN IS THE TABLE'S OWN IDENTITY: every arm's `identity` is its table's PRIMARY KEY",
    Object.fromEntries(ARMS.map((a) => [a, MEANING[a].identity])),
    Object.fromEntries(ARMS.map((a) => [a, pkOf(MEANING[a].table)])));
  t("every arm says its grain IN WORDS, so a surface cannot present a leg as a bundle",
    ARMS.filter((a) => typeof MEANING[a].rowGrain !== "string" || MEANING[a].rowGrain.length < 20), []);
  t("every arm projects a non-empty row, and its key column is not among the projected ones "
  + "(the owning bundle is projected from `bundles`, gated, and never from the meaning table)",
    ARMS.filter((a) => !MEANING[a].row?.length || MEANING[a].row.includes(MEANING[a].key)), []);
  /* Each projected column must EXIST on the table. A column named here that the
     table does not have would be a runtime SQL error on a path no compile-time
     assertion sees. */
  const missing = [];
  for (const a of ARMS) {
    const at = SCHEMA_SRC.indexOf(`CREATE TABLE IF NOT EXISTS ${MEANING[a].table} (`);
    const ddl = SCHEMA_SRC.slice(at, SCHEMA_SRC.indexOf("\n);", at));
    for (const c of [...MEANING[a].row, ...MEANING[a].identity, ...MEANING[a].refs])
      if (!new RegExp(`^\\s{2}${c}\\s`, "m").test(ddl)) missing.push(`${a}.${c}`);
  }
  t("every projected, identifying and referencing column exists on the table it is read from", missing, []);
  /* And the ORDER BY is that identity, which is what makes paging total. */
  for (const a of ARMS) {
    const sql = compile({ q: "", viewer: M, rows: a }).statements.meaning().sql;
    const order = sql.slice(sql.lastIndexOf("ORDER BY"));
    const want = ["b.bundle_id ASC",
                  ...MEANING[a].identity.filter((c) => c !== MEANING[a].key).map((c) => `m.${c} ASC`)];
    t(`\`${a}\`: the ORDER BY is the grain's own identity, so a row cannot appear on two pages or on none`,
      want.every((w) => order.includes(w)), true);
  }
}

/* ==================================================================== 3
 * D-15: STILL EXACTLY ONE COMPILATION POINT. PL-8's pin, kept alive.
 * ================================================================== */
console.log("\n--- 3. one compilation point, and this shape adds no fourth ---");
{
  /* COUNTED OVER COMMENT-STRIPPED SOURCE, and that correction is this item's,
     paid for immediately. PL-8's pin counts the marker's template literal
     textually across the WHOLE file, so the first draft of PL-9's own
     explanatory comment — which named the literal in prose — took the count to
     FOUR and turned both suites red against a sentence. D-160's shape, met
     inside the mechanism it guards. A check that fails on its own explanation is
     not a check, so the source is stripped of block and line comments first and
     the stripper is GUARDED IN BOTH DIRECTIONS below. */
  const stripped = QUERY_SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  t("STRIP GUARD: a known CODE line survives the stripper",
    /export function viewerPredicate\(viewer\) \{/.test(stripped), true);
  t("STRIP GUARD: and a known PROSE line does not — the count below cannot match a comment",
    /D-160's shape/.test(stripped) || /THE MEANING ARM — D-222 option A/.test(stripped), false);
  const fnStart = stripped.indexOf("export function viewerPredicate(");
  const fnEnd = stripped.indexOf("\n}", stripped.indexOf("scope: \"participant\"", fnStart));
  const sites = [];
  for (let i = stripped.indexOf("${GATE_MARK}"); i !== -1; i = stripped.indexOf("${GATE_MARK}", i + 1)) sites.push(i);
  console.log(`  gate-mint sites found (comments stripped): ${sites.length}`);
  /* PL-8 pinned this at THREE and the number is the assertion, not the care.
     A meaning-GRAIN statement joins two more tables and interpolates the
     predicate twice, which is exactly the shape that would tempt a fourth. */
  t("the gate is STILL minted in exactly ONE function at its three branches — PL-9 added no fourth site",
    [sites.length, sites.every((i) => i > fnStart && i < fnEnd)], [3, true]);
  t("and store.mjs still THROWS on a statement that arrives without the marker (D-15)",
    /a retrieval statement reached the store without the viewer visibility gate \(D-15\)/.test(STORE_SRC), true);
  /* THE STORE BUILDS NO SQL FOR THIS PATH. If it did, that would be the second
     query path `query.mjs:701-705` says the design exists to prevent — reached
     by writing the statement somewhere else rather than by minting a gate. */
  const body = STORE_SRC.slice(STORE_SRC.indexOf("  meaningRows(input = {}) {"));
  const method = body.slice(0, body.indexOf("\n  }\n"));
  t("the meaning read HAS a method body to inspect (an empty slice would pass everything below)",
    method.length > 400, true);
  t("and it assembles NO SQL of its own — every statement comes from compile(), which is what "
  + "makes this a seventh shape and not a second query path",
    [/\bSELECT\b/.test(method), /\bFROM\b/.test(method), /compile\(/.test(method), /#runQuery\(/.test(method)],
    [false, false, true, true]);
}
{
  /* The gate REACHES the statement, in both projections, for every arm. */
  const bad = [];
  for (const a of ARMS) {
    const p = compile({ q: "", viewer: "member:M-0007", rows: a });
    for (const [name, st] of [["rows", p.statements.meaning()], ["count", p.statements.meaning({ mode: "count" })]]) {
      if (!st.sql.includes(GATE_MARK)) bad.push(`${a}.${name}: no marker`);
      if (!st.sql.includes("project_participants")) bad.push(`${a}.${name}: no participant predicate`);
    }
  }
  t("both projections of the shape carry the participant predicate, for every arm", bad, []);
  t("an unrecognised viewer denies BOTH projections at compile — hidden and absent are one answer",
    [compile({ q: "", viewer: "nobody", rows: "leg" }).statements.meaning().sql.includes("0=1"),
     compile({ q: "", viewer: "nobody", rows: "leg" }).statements.meaning({ mode: "count" }).sql.includes("0=1")],
    [true, true]);
  /* REC-36's clause 2, structurally: an arm with a column naming another bundle
     gates THAT reference too, and the gate is the same predicate. */
  const withRefs = ARMS.filter((a) => MEANING[a].refs.length);
  console.log(`  arms carrying a column that names another bundle: ${withRefs.length} (${withRefs.join(", ") || "none"})`);
  t("there IS an arm with a bundle-naming column to check (else the clause below asserts nothing)",
    withRefs.length > 0, true);
  for (const a of withRefs) for (const col of MEANING[a].refs) {
    const sql = compile({ q: "", viewer: "member:M-0007", rows: a }).statements.meaning().sql;
    t(`\`${a}.${col}\`: the referenced bundle is gated by the SAME predicate, and the row is WITHHELD rather than the id redacted`,
      [sql.includes(`EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = m.${col} AND (`),
       /CASE WHEN[\s\S]*THEN b\.bundle_id/.test(sql)],
      [true, false]);
    t(`\`${a}.${col}\`: and a target that does not EXIST is reported rather than withheld — visibility and existence are different questions`,
      sql.includes(`AS ${col}_present`), true);
  }
}

/* ==================================================================== 4
 * THE BOUND, structurally. The honesty half; the scan is D-227's.
 * ================================================================== */
console.log("\n--- 4. the bound is in the STATEMENT, and the cap published is the cap applied ---");
{
  t("the meaning shape has its own named pair, distinct from the page's",
    [MEANING_LIMIT_DEFAULT, MEANING_LIMIT_MAX, MEANING_LIMIT_MAX > MEANING_LIMIT_DEFAULT], [200, 1000, true]);
  const st = compile({ q: "", viewer: M, rows: "leg", rowLimit: 7, rowOffset: 3 }).statements.meaning();
  t("the row statement is bounded IN SQL, not only sliced afterwards",
    /LIMIT \? OFFSET \?$/.test(st.sql.trim()), true);
  t("and the bound travels as an ARGUMENT, so it is the number the statement actually applied",
    st.args.slice(-2), [7, 3]);
  t("an over-ask is CLAMPED at compile and the CLAMP is what the plan publishes, never the ask",
    compile({ q: "", viewer: M, rows: "leg", rowLimit: 99999 }).meaning.limit, MEANING_LIMIT_MAX);
  t("and an absent ask takes the shape's own default rather than the page's",
    compile({ q: "", viewer: M, rows: "leg" }).meaning.limit, MEANING_LIMIT_DEFAULT);
  t("the COUNT projection carries no LIMIT — a gated total that was itself paged would be a second lie",
    /LIMIT/.test(compile({ q: "", viewer: M, rows: "leg" }).statements.meaning({ mode: "count" }).sql), false);
}

/* ==================================================================== 5
 * THE REFUSALS: DEC-49's shape, allocated and translated.
 * ================================================================== */
console.log("\n--- 5. the two refusals, each a C-number with a code and a canned translation ---");
{
  const keys = Object.keys(MEANING_READ_CHECKS);
  console.log(`  refusals allocated: ${keys.length} (${keys.join(", ")})`);
  t("both refusals are allocated in the CATALOG, which is where a C-number lives",
    keys.sort(), ["MEANING_ROWS_NO_ARM", "MEANING_ROWS_UNKNOWN_ARM"]);
  t("C-23.1 and C-23.2 are the numbers, and each carries a canned translation a member can read",
    keys.sort().map((k) => [MEANING_READ_CHECKS[k].check,
                            typeof MEANING_READ_CHECKS[k].translation === "string"
                            && MEANING_READ_CHECKS[k].translation.length > 40]),
    [["C-23.1", true], ["C-23.2", true]]);
  t("and each names where it fires, so the fence is findable from the catalog",
    keys.filter((k) => !/store\.mjs meaningRows/.test(MEANING_READ_CHECKS[k].where || "")), []);
  /* ONE place, not two. A hand copy agrees at zero cost. */
  t("the store does not restate a translation — it reads the catalog's row",
    [/MEANING_READ_CHECKS\[key\]/.test(STORE_SRC),
     STORE_SRC.includes(MEANING_READ_CHECKS.MEANING_ROWS_NO_ARM.translation)],
    [true, false]);
}

/* ==================================================================== 6
 * THE RUNTIME. Everything below goes through the control plane.
 * ================================================================== */
console.log("\n--- 6. the corpus, written through op=promote ---");
const IDX = SRC("index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl9", MEMBER_TOKEN: "mem-pl9", PROBE_TOKEN: "prb-pl9", VERSION: "test" },
});
const post = async (op, body, tok = "mem-pl9") => (await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-pl9") => (await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

const member = async (id, caps, role = "member") => {
  const add = rP(await post("memberadd", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps }, "adm-pl9"));
  const en = rP(await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` }));
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = rP(await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` }));
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const ASSERTED_AT = "2026-08-01T00:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.grade_axis ? [`    grade_axis: ${l.grade_axis}`] : []),
      ...(l.grade_source ? [`    grade_source: ${l.grade_source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.ground ? [`    ground: ${l.ground}`] : [])])]
  : [];
const groundLines = (rows) => rows === null ? [] : rows.length
  ? ["grounds:", ...rows.flatMap((r) => [`  - ground: ${r.ground}`,
      `    asserted_by: ${r.by ?? "carol"}`, `    at: "${ASSERTED_AT}"`])]
  : ["grounds: []"];

const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [], grounds = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs), ...groundLines(grounds),
  "---", "", "## Question", "", question, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const infoMd = (id, prose = "A captured document about the sewer fund.") => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", prose, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const projectMd = (id) => ["---", `id: ${id}`, "object_type: project",
  `current_state: forming`, `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "---", "", "## Summary", "", "A project the uninvited must not learn about.", ""].join("\n");

const promote = async (id, text, type, extraFiles = [], register = [], tok = "mem-pl9") => rP(await post("promote", {
  bundleId: id, base: null, snapKey: `${id}-new`, author: "pl9",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extraFiles],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER },
  register,
}, tok));

/* 4.2/4.3: the first two roster members must be administrators. carol OWNS the
   project (her session creates it, so the control plane stamps ownerMemberId);
   dave is the uninvited member the withhold control is about. */
await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);

const DOC_A = "INFO-2026-0900-memo", DOC_B = "INFO-2026-0900-ledger";
/* PURGED after the fixture is written, which is the ONLY way the record produces
   a leg whose target it no longer holds — and it produces one BY DESIGN. D-168
   refuses a leg at the WRITE whose target does not exist (this suite's first
   fixture was refused for exactly that, and the refusal was correct), so a
   phantom target is unwritable. `Store#purge`'s own comment says what happens
   instead: *"A per-bundle purge clears only the purged inquiry's OWN legs; legs
   elsewhere that TARGET it stay, honestly unresolvable, the same way refs to a
   purged bundle read as C-6.2 findings rather than silently vanishing."* That
   recorded doctrine is what this shape's departure from `#bundleGate` serves. */
const DOC_GONE = "INFO-2026-0900-withdrawn";
const DOC_R = "INFO-2026-0900-resolved";
const HUNCH_1 = "INQ-2026-0900-transfer", HUNCH_2 = "INQ-2026-0900-vendor";
const CLEAN_1 = "INQ-2026-0900-earned", LEGLESS = "INQ-2026-0900-legless";
const PROJ = "PROJ-2026-0900-secret";

const FIXTURE = [
  { id: HUNCH_1, refs: [DOC_A, DOC_B, DOC_GONE], legs: [
      { target: DOC_A, role: "supports", grade: "B", grade_axis: "connection",
        grade_source: "hunch", author: "casey", date: "2026-08-03" },
      { target: DOC_B, role: "supports" },
      { target: DOC_GONE, role: "cuts_against" }] },
  { id: HUNCH_2, refs: [DOC_A], legs: [
      { target: DOC_A, role: "cuts_against", grade: "C", grade_axis: "connection",
        grade_source: "hunch", author: "dana", date: "2026-08-04" }] },
  { id: CLEAN_1, refs: [DOC_A, DOC_B], legs: [
      { target: DOC_A, role: "supports", ground: "charter" },
      { target: DOC_B, role: "supports", ground: "code" }],
    grounds: [{ ground: "charter" }, { ground: "code" }] },
  { id: LEGLESS, refs: [], legs: [] },
];

await promote(DOC_A, infoMd(DOC_A), "information");
await promote(DOC_B, infoMd(DOC_B, "A ledger extract naming the transfer."), "information");
await promote(DOC_GONE, infoMd(DOC_GONE, "A document later withdrawn from the record."), "information");
const promoted = [];
for (const f of FIXTURE) {
  const r = await promote(f.id, inquiryMd(f.id, { refs: f.refs, legs: f.legs, grounds: f.grounds ?? null }), "inquiry");
  promoted.push([f.id, r?.ok === true]);
  if (r?.ok !== true) console.log("    REFUSED " + f.id + ": " + JSON.stringify(r).slice(0, 900));
}
t("EVERY fixture inquiry promoted (a corpus that silently shrank would make every arm below look clean)",
  promoted.filter(([, ok]) => !ok).map(([id]) => id), []);
/* NOW withdraw the document, leaving HUNCH_1's third leg pointing at a bundle
   the record no longer holds. Admin class: `op=purge` is fenced to admin/probe. */
{
  const p = rP(await (await mf.dispatchFetch(
    `http://x/api/?op=purge&token=adm-pl9&confirm=bio&bundleId=${encodeURIComponent(DOC_GONE)}`,
    { method: "POST", body: "{}" })).json());
  t("the withdrawn document is purged, which is how the record MAKES an unresolvable leg",
    p?.ok, true);
  t("ARMED: and it really is gone — op=search no longer names it",
    ((rP(await get("search", `q=id:${DOC_GONE}&mode=ids`)))?.ids ?? []), []);
}

/* The capture half: one INFORMATION bundle and one PROJECT bundle, each carrying
   a reading that names the SAME registered subject. The project is what makes
   REC-36's withhold rule stageable. */
const CAP_I = sha("pl9-capture-info"), CAP_P = sha("pl9-capture-project");
const ent = rP(await post("entitycreate", { kind: "contract", label: "Cascade Waterworks Contract", aliases: ["vendor:77"] }));
t("a subject is registered (the resolutions arms below rest on it)", !!ent?.entity_id, true);
const readingFile = (capSha) => {
  const prov = JSON.stringify({ documents: [{ capture: { sha256: capSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "generic", reader_version: 1, found: true, at: NOW, entities: [
      { ref: "vendor:77", kind: "vendor", key: "77", label: "Cascade Waterworks" }] } }] });
  return [[{ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
          [{ sha256: capSha, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }]];
};
{
  const [files, reg] = readingFile(CAP_I);
  t("the shared document promoted with its reading",
    (await promote(DOC_R, infoMd(DOC_R, "A document naming the vendor."), "information", files, reg))?.ok, true);
}
{
  const [files, reg] = readingFile(CAP_P);
  /* CAROL's session promotes it, so the control plane stamps her as owner and
     dave is genuinely uninvited rather than merely unnamed. */
  t("the PROJECT promoted with a capture and a reading — and THIS is what `meaningquery.test.mjs` "
  + "says cannot happen: `#writeReadings` has no object_type test",
    (await promote(PROJ, projectMd(PROJ), "project", files, reg, carol))?.ok, true);
}
const resI = rP(await post("resolve", { captureSha: CAP_I, resolvedBy: "pl9" }));
const resP = rP(await post("resolve", { captureSha: CAP_P, resolvedBy: "pl9" }));
console.log(`  resolutions written: info ${resI?.resolved_count ?? 0}, project ${resP?.resolved_count ?? 0}`);
/* THE PREMISE, MEASURED RATHER THAN ASSUMED. If a project could not carry a
   resolution row, every withhold arm below would be asserting over an empty
   population — a control that passes while asserting nothing. */
t("MEASURED: a PROJECT bundle carries meaning rows — the correction to PL-8's stated gap",
  (resP?.resolved ?? []).some((r) => r.bundle_id === PROJ), true);
t("and the shared document carries them too, so an uninvited member still has something to see",
  (resI?.resolved ?? []).some((r) => r.bundle_id === DOC_R), true);

/* GROUND TRUTH, computed in JavaScript from the fixture definitions, never read
   back from the compiler — the two must be able to disagree. */
const TRUTH = {
  hunchInquiries: FIXTURE.filter((f) => f.legs.some((l) => l.grade_source === "hunch")).map((f) => f.id).sort(),
  legsOf: Object.fromEntries(FIXTURE.map((f) => [f.id, f.legs.length])),
  allLegs: FIXTURE.reduce((n, f) => n + f.legs.length, 0),
};
console.log(`  ground truth: ${FIXTURE.length} inquiries, ${TRUTH.allLegs} legs, `
          + `${TRUTH.hunchInquiries.length} inquiries carrying hunch debt`);
t("the corpus is not empty (assume a walk covers nothing until a control proves otherwise)",
  TRUTH.allLegs > 0 && TRUTH.hunchInquiries.length > 0, true);

const rows = async (qs, tok = "mem-pl9") => rP(await get("meaningrows", qs, tok));

/* ==================================================================== 7
 * THE ITEM: LEGS RETURNED WITH ROLE, GROUND AND grade_source.
 * ================================================================== */
console.log("\n--- 7. the meaning GRAIN: legs, with role, ground and grade_source ---");
{
  const a = await rows(`rows=leg&q=${encodeURIComponent("leg:hunch")}`);
  t("op=meaningrows answers, and says which grain it answered at",
    [a?.ok, a?.arm, a?.table], [true, "leg", "inquiry_basis"]);
  t("THE ITEM: every row carries role, ground and grade_source — the three the plan names",
    (a?.rows ?? []).every((r) => "role" in r && "ground" in r && "grade_source" in r), true);
  t("and there ARE rows (a shape that answered nothing would satisfy the line above)",
    (a?.rows ?? []).length > 0, true);
  t("the hunch legs are REACHABLE AS ROWS, which no op could do before — with their author's grade and axis",
    (a?.rows ?? []).filter((r) => r.grade_source === "hunch")
      .map((r) => [r.bundle_id, r.role, r.grade, r.grade_axis]).sort(),
    [[HUNCH_1, "supports", "B", "connection"], [HUNCH_2, "cuts_against", "C", "connection"]]);
  t("the grain travels WITH the answer, in words",
    typeof a?.grain === "string" && a.grain.includes("one LEG"), true);
  t("and the identity travels with it, so a consumer can address a row", a?.identity, ["bundle_id", "ord"]);

  /* THE WHOLE BASIS, NOT THE MATCHING LEGS. A basis returned in part reads as a
     basis, and that is the failure this rule prevents. */
  t("A BASIS IS RETURNED WHOLE: the non-hunch legs of a hunch-carrying inquiry are here too",
    (a?.rows ?? []).filter((r) => r.bundle_id === HUNCH_1).length, TRUTH.legsOf[HUNCH_1]);
  t("so the answer covers exactly the legs of exactly the inquiries the arm selected",
    a?.total, TRUTH.hunchInquiries.reduce((n, id) => n + TRUTH.legsOf[id], 0));
  /* REC-42's ground, which is the OR-branch relationship between legs and the
     thing a strength pair is computed over. */
  const g = await rows(`rows=leg&q=${encodeURIComponent("leg:ground=*")}`);
  t("`ground` is a real value on the rows of a multi-ground basis (REC-42's OR branches, at grain)",
    (g?.rows ?? []).map((r) => r.ground).sort(), ["charter", "code"]);
  /* Existence, reported rather than inferred. */
  const dang = (a?.rows ?? []).find((r) => r.target_id === DOC_GONE);
  t("a leg whose target the record does NOT hold is RETURNED with `target_id_present` false — "
  + "hiding it would under-report the debt, and existence is not a disclosure",
    [!!dang, dang?.target_id_present], [true, 0]);
  t("while a leg whose target IS held says so", (a?.rows ?? []).find((r) => r.target_id === DOC_A)?.target_id_present, 1);
}

/* ==================================================================== 8
 * IT COMPOSES WITH PL-8 RATHER THAN DUPLICATING IT.
 * ================================================================== */
console.log("\n--- 8. PL-8's arms choose the SET; this returns the GRAIN ---");
{
  const ids = async (q) => ((rP(await get("search", `q=${encodeURIComponent(q)}&mode=ids`)))?.ids ?? []).sort();
  for (const q of ["leg:hunch", "has:leg", "leg:ground=*", "type:inquiry -leg:hunch"]) {
    const selected = await ids(q);
    const r = await rows(`rows=leg&q=${encodeURIComponent(q)}`);
    const named = [...new Set((r?.rows ?? []).map((x) => x.bundle_id))].sort();
    /* The bundles this answers rows FOR are exactly the bundles op=search names
       that CARRY a leg. Bundles with no meaning row drop out by the join, which
       is the honest difference between the two grains rather than a discrepancy. */
    t(`\`${q}\`: the bundles answered at grain are exactly the selected bundles that carry a leg`,
      named, selected.filter((id) => (TRUTH.legsOf[id] ?? 0) > 0).sort());
  }
  /* THE GRAIN INVERSION, ASSERTED. One selection, two grains, and the numbers
     must differ in exactly the way the two shapes promise. */
  const one = await ids("leg:hunch");
  const many = await rows(`rows=leg&q=${encodeURIComponent("leg:hunch")}`);
  const per = {};
  for (const r of (many?.rows ?? [])) per[r.bundle_id] = (per[r.bundle_id] ?? 0) + 1;
  t("op=search names an inquiry with three legs ONCE (PL-8's `IN`, never a join)",
    one.filter((x) => x === HUNCH_1).length, 1);
  t("op=meaningrows answers it ONCE PER LEG (a join, deliberately — the legs ARE the answer)",
    per[HUNCH_1], TRUTH.legsOf[HUNCH_1]);
  t("and neither is a spelling of the other: the row count exceeds the bundle count on this corpus",
    (many?.rows ?? []).length > one.length, true);
  /* There is NO second selector vocabulary: the op adds exactly one argument. */
  t("the op adds ONE argument to the query language and no new selector — `rows`, and nothing else",
    /meaningrows: \(\) => this\.meaningRows\(\{[\s\S]*?\}\),/.exec(STORE_SRC)?.[0]
      ?.match(/^\s+([a-z]+):/gm)?.map((s) => s.trim().replace(":", "")).sort(),
    ["ids", "limit", "offset", "q", "rows", "viewer"]);
  /* And a warning raised by PL-8's parser reaches this answer, so a member who
     mistyped a sub-field is told here too rather than only through op=search. */
  const w = await rows(`rows=leg&q=${encodeURIComponent("leg:sorce=hunch")}`);
  t("a warning from the shared parser reaches this op's answer too — one language, one set of warnings",
    (w?.query?.warnings ?? []).some((x) => /leg: unknown sub-field "sorce"/.test(x)), true);
}

/* ==================================================================== 9
 * THE RESOLUTIONS GRAIN, and the two arms over ONE table.
 * ================================================================== */
console.log("\n--- 9. the resolutions grain ---");
{
  const r = await rows(`rows=resolves&q=${encodeURIComponent("has:resolves")}`);
  t("the flagged-set table answers at ITS grain: one row per (capture, reference, subject)",
    [r?.ok, r?.table, r?.identity], [true, "resolutions", ["capture_sha", "ref", "entity_id"]]);
  t("and the rows carry the grade and the method, which is what a member confirms a C from",
    (r?.rows ?? []).every((x) => "grade" in x && "method" in x && "entity_id" in x), true);
  t("there ARE resolution rows to have carried them", (r?.rows ?? []).length > 0, true);
  /* `resolves` and `concerns` are two NAMES over one table (D-21: the reverse
     index is one fact). At meaning grain they must therefore return the same
     rows — the arms differ in what a BARE value means, not in what they read. */
  const c = await rows(`rows=concerns&q=${encodeURIComponent("has:resolves")}`);
  t("`resolves` and `concerns` are two names over ONE table, so at grain they answer identically",
    [c?.rows?.length, JSON.stringify(c?.rows) === JSON.stringify(r?.rows)], [r?.rows?.length, true]);
  t("and each still says which name was asked, so an answer is self-describing",
    [r?.arm, c?.arm], ["resolves", "concerns"]);
}

/* ==================================================================== 10
 * REC-36: THE ROW IS WITHHELD, NOT REDACTED — LIVE.
 * ================================================================== */
console.log("\n--- 10. REC-36: a candidate row the viewer may not see is WITHHELD ENTIRELY ---");
{
  const asCarol = await rows(`rows=concerns&q=${encodeURIComponent("has:resolves")}`, carol);
  const asDave = await rows(`rows=concerns&q=${encodeURIComponent("has:resolves")}`, dave);
  const bundlesOf = (a) => [...new Set((a?.rows ?? []).map((r) => r.bundle_id))].sort();
  console.log(`  participant sees ${asCarol?.rows?.length ?? 0} rows, uninvited sees ${asDave?.rows?.length ?? 0}`);
  /* ARMED: the participant must see the project's row, or everything below is a
     measurement over an empty set. */
  t("ARMED: the project OWNER sees the project's meaning row",
    bundlesOf(asCarol).includes(PROJ), true);
  t("and she sees the shared document's row as well, so the two are distinguishable",
    bundlesOf(asCarol), [DOC_R, PROJ].sort());
  t("THE RULE: the uninvited member's answer does not contain the project's row AT ALL",
    bundlesOf(asDave), [DOC_R]);
  t("WITHHELD, NOT REDACTED: no row arrives with its bundle nulled, blanked or hollowed out",
    (asDave?.rows ?? []).filter((r) => r.bundle_id == null || r.bundle_id === "").length, 0);
  t("and every row he DID receive is fully formed — the answer was narrowed, not damaged",
    (asDave?.rows ?? []).every((r) => typeof r.entity_id === "string" && typeof r.grade === "string"), true);
  /* THE TOTAL IS GATED WITH THE ROWS. "A total larger than the pages says
     something is hidden" — so the two must move together. */
  t("the TOTAL is gated with the rows: it counts what this viewer may see and nothing more",
    [asDave?.total, asDave?.rows?.length, asCarol?.total, asCarol?.rows?.length],
    [1, 1, 2, 2]);
  t("and the participant's total is STRICTLY larger, so the gate is measured and not merely applied",
    (asCarol?.total ?? 0) > (asDave?.total ?? 0), true);
  /* NO COUNT OF WHAT WAS WITHHELD, because that count is the leak. The whole key
     set is enumerated rather than allow-listed, so the next key added has to
     come past this line. */
  t("no field of the answer discloses a withheld count",
    Object.keys(asDave).sort(),
    ["arm", "count", "gate", "grain", "identity", "limit", "offset", "ok", "query", "rows", "table", "total"]);
  t("the gate reports the scope it compiled for, and that every statement carried it",
    [asDave?.gate?.scope, asDave?.gate?.applied], ["participant", 2]);
  /* Hidden and absent are ONE answer: an unrecognised caller is refused at the
     door, and a recognised one who may see nothing gets an honest empty. */
  const denied = await (await mf.dispatchFetch(`http://x/api/?op=meaningrows&rows=leg`)).json();
  t("a caller with no recognised credential is REFUSED at the door, never answered ungated",
    [denied?.ok ?? false, typeof denied?.error === "string" || typeof denied?.reason === "string"], [false, true]);
  const empty = await rows(`rows=leg&q=${encodeURIComponent("leg:target=NOTHING-AT-ALL")}`, dave);
  t("and a query that matches nothing answers an honest empty — rows and total agree at zero",
    [empty?.ok, empty?.rows, empty?.total], [true, [], 0]);
}

/* ==================================================================== 11
 * THE ENVELOPE, LIVE. Never a bare collection.
 * ================================================================== */
console.log("\n--- 11. the envelope: the cap APPLIED, and paging that covers the set exactly once ---");
{
  const whole = await rows(`rows=leg&q=${encodeURIComponent("has:leg")}&limit=500`);
  t("the answer is an ENVELOPE, never a bare collection (REC-59's pin, one op over)",
    [Array.isArray(whole), Array.isArray(whole?.rows)], [false, true]);
  t("it publishes the bound it APPLIED", whole?.limit, 500);
  const over = await rows(`rows=leg&q=${encodeURIComponent("has:leg")}&limit=99999`);
  t("an over-ask is answered at the ceiling and the CEILING is what is published, never the ask",
    over?.limit, MEANING_LIMIT_MAX);
  t("the whole answer is reachable, and `total` counts rows and not bundles", whole?.total, TRUTH.allLegs);
  /* THE DELTA: a cut answer and a complete one must not read alike. */
  const cut = await rows(`rows=leg&q=${encodeURIComponent("has:leg")}&limit=2`);
  /* NULL-TOLERANT: a control that breaks the op must still let every arm after
     it RUN. D-93's class inside a control has been recorded six times, and this
     suite met it on its own control (2) before this line existed. */
  const more = (a) => (a?.offset ?? 0) + (a?.count ?? 0) < (a?.total ?? 0);
  t("a cut answer says so in op=search's own vocabulary — `offset + count < total`", more(cut), true);
  t("a complete answer says the opposite", more(whole), false);
  t("DELTA: 'this is all of it' and 'this is the first N' do NOT read alike", more(cut) !== more(whole), true);
  t("and `count` is the length of what was SENT, which is a different fact from `total`",
    [cut?.count, (cut?.rows ?? []).length, cut?.total], [2, 2, TRUTH.allLegs]);
  /* PAGING COVERS THE SET EXACTLY ONCE — the property the grain's identity
     ORDER BY exists for. Addressed by (bundle_id, ord), so a repeat or a miss
     is visible rather than merely suspected. */
  const seen = [];
  for (let off = 0; off < TRUTH.allLegs; off += 2) {
    const p = await rows(`rows=leg&q=${encodeURIComponent("has:leg")}&limit=2&offset=${off}`);
    seen.push(...(p?.rows ?? []).map((r) => `${r.bundle_id}#${r.ord}`));
  }
  t("paging over meaning rows covers the set exactly once — no row on two pages, none on none",
    [seen.length, new Set(seen).size], [TRUTH.allLegs, TRUTH.allLegs]);
}

/* ==================================================================== 12
 * THE REFUSALS, THROUGH THE OP.
 * ================================================================== */
console.log("\n--- 12. the refusals, through the door a caller actually has ---");
{
  const none = await rows("");
  t("no grain named: refused by C-23.1 with its code and its canned translation",
    [none?.ok, none?.reason, none?.check, typeof none?.translation === "string" && none.translation.length > 40],
    [false, "MEANING_ROWS_NO_ARM", "C-23.1", true]);
  t("and the translation is the CATALOG's, byte for byte — one row, not a copy",
    none?.translation, MEANING_READ_CHECKS.MEANING_ROWS_NO_ARM.translation);
  const bad = await rows("rows=legs");
  t("an unknown grain: refused by C-23.2 rather than answered from a different table",
    [bad?.ok, bad?.reason, bad?.check], [false, "MEANING_ROWS_UNKNOWN_ARM", "C-23.2"]);
  t("and the refusal NAMES the kinds the record does hold, driven off the registry",
    ARMS.filter((a) => !String(bad?.detail ?? "").includes(a)), []);
  t("a refusal carries no rows at all — a refused read that answered anything would be the worse defect",
    [Object.hasOwn(bad ?? {}, "rows"), Object.hasOwn(bad ?? {}, "total")], [false, false]);
}

/* ==================================================================== 13
 * OVER-STRICTNESS, AND THE PUBLISHED VOCABULARY.
 * ================================================================== */
console.log("\n--- 13. an equally correct phrasing must PASS, and the grain is published ---");
{
  /* Phrased nothing like the compact forms this implementation was written
     around. Every one is a genuinely correct way to ask the same thing, and a
     surface that only understood its author's habits would pass everything
     above and fail a member. */
  const same = async (a, b) => {
    const x = await rows(a), y = await rows(b);
    return JSON.stringify(x?.rows) === JSON.stringify(y?.rows) && x?.total === y?.total;
  };
  t("`rows=LEG` — the grain name is case-folded, as every selector name is",
    await same(`rows=leg&q=${encodeURIComponent("leg:hunch")}`, `rows=LEG&q=${encodeURIComponent("leg:hunch")}`), true);
  t("` rows=leg ` with surrounding space is the same request",
    await same("rows=leg", "rows=%20leg%20"), true);
  t("`leg:source=hunch` selects the same set as `leg:hunch`, at grain as it does at bundle grain",
    await same(`rows=leg&q=${encodeURIComponent("leg:hunch")}`, `rows=leg&q=${encodeURIComponent("leg:source=hunch")}`), true);
  t("a parenthesised, negated, OR'd query — the compiler's whole language reaches this shape",
    await same(`rows=leg&q=${encodeURIComponent("has:leg")}`,
               `rows=leg&q=${encodeURIComponent("(has:leg OR leg:hunch) type:inquiry")}`), true);
  t("and an empty query is the whole corpus at grain, not a refusal",
    (await rows("rows=leg"))?.total, TRUTH.allLegs);

  const sf = rP(await get("searchfields"));
  t("op=searchfields publishes the MEANING-GRAIN half beside the bundle-grain half",
    Object.values(sf?.meaning ?? {}).every((v) => v?.rows && typeof v.rows.grain === "string"
      && Array.isArray(v.rows.identity) && Array.isArray(v.rows.columns)), true);
  t("and it is the COMPILER's registry, not a copy — identity by identity",
    Object.fromEntries(Object.entries(sf?.meaning ?? {}).map(([a, v]) => [a, v.rows.identity])),
    Object.fromEntries(Object.entries(meaningVocabulary()).map(([a, v]) => [a, v.rows.identity])));
  t("the two grains are named DIFFERENTLY, so a surface cannot read one for the other",
    Object.values(sf?.meaning ?? {}).filter((v) => v.grain === v.rows.grain), []);
}

/* ==================================================================== 14
 * THE OP IS ON THE CONTROL PLANE, FENCED LIKE op=search.
 * ================================================================== */
console.log("\n--- 14. the op itself ---");
{
  t("op=meaningrows is in the OPS table, read-only, fenced to the same classes as op=search",
    /^\s{2}meaningrows: \{ classes: \["admin", "member", "probe"\],\s+mutating: false \},$/m.test(INDEX_SRC), true);
  t("and the viewer is stamped SERVER-SIDE beside op=search's — a gate whose view the caller picks is not a gate",
    /op === "search" \|\| op === "meaningrows"/.test(INDEX_SRC), true);
  t("a member SESSION reaches it (a plane-only op would be unreachable from the browser half)",
    /RETRIEVAL_READS = \[[^\]]*"meaningrows"/s.test(INDEX_SRC), true);
  /* A caller-supplied viewer must not be honoured. Driven, not asserted about. */
  const spoof = rP(await (await mf.dispatchFetch(
    `http://x/api/?op=meaningrows&token=${dave}&rows=concerns&q=${encodeURIComponent("has:resolves")}&viewer=${encodeURIComponent("member:carol")}`)).json());
  t("a caller naming somebody else's viewer is answered as HIMSELF — the stamp overwrites",
    [...new Set((spoof?.rows ?? []).map((r) => r.bundle_id))], [DOC_R]);
}

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
