/* NEGATIVE CONTROL: SIX arms and a baseline live in `test/nc-rec92.mjs` and are re-run in one step with `node test/nc-rec92.mjs [arm|all]` from `bio-plane/` (the driver lives INSIDE this worktree). Each arm EDITS A REAL SOURCE, is armed ALONE with every other defence held open, is DECLARED must-fail or must-not-fail BEFORE it ran, passes an anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard, and every restore is verified by sha256 AND by content (`cmp`) against a PRISTINE copy named UNIQUELY PER ARM with a byte count printed and a minimum guarded — never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work. An opening AND a closing BASELINE row bracket the run, because a harness that reported the same answer for every arm INCLUDING the baseline is on record in this repository, and without a baseline row six reds read exactly like six arms working. FIVE ARMS AND A BASELINE, every one RUN, and the DECLARED-vs-ACTUAL comparison is in `nc-rec92.mjs` beside each arm. THREE WERE EXACTLY AS DECLARED and TWO DECLARATIONS WERE WRONG AND ARE CORRECTED THERE RATHER THAN SMOOTHED. (a) `baseline` — nothing armed; green at BOTH ends, 79 pass / 0 fail. (b) `withhold` — the passage row projection takes `1=1` in place of the compiled viewer predicate, conditioned on `fts` so the four row arms this item did not write keep theirs: §8's *a `passage:` hit inside a project the viewer is not in is withheld whole*. ACTUAL 34 assertions including S41-S410 and S61-S611, with ALL of S9* standing — `content:`, `leg:` and the no-term passage path keep their gate, which is the discriminator. Its FIRST run reported only 3 failures because THE SUITE DIED at section 4 and sections 5-9 never ran; the row accesses were hardened so a destructive arm can no longer look like a precise one. (c) `nomatch` — the ROW shape's MATCH removed while the ARM keeps its own. ACTUAL S42 S44. IT FOUND A REAL DEFECT IN THIS ITEM'S CODE: `matched` and the row builder's `fts` were two spellings of one fact, so the envelope announced `matched: true` over rows that had not been matched; collapsed to one predicate (`passageOn`). (d) `tallyhardcoded` — `#contentAxisTally` returns a fixed state instead of calling `contentAxisFor`: §8's *the tally hard-coded → the observation-log arm catches it*. ACTUAL S69 S610, exactly as declared, and S61-S66 STOOD — a shape-only assertion cannot see this defect, which is why S69/S610 are named separately. (e) `foldundetermined` — the fifth bucket dropped from the tally's keys. ACTUAL S63 S66 S611, exactly as declared, and DECLARED STRUCTURAL-ONLY BEFORE RUNNING because this fixture can hold no undetermined capture (see S611). (f) `foldnever` — `not_extracted` folded into `indexed_none`, turning *nobody looked* into *we looked and found nothing*. ACTUAL S610 ALONE, exactly as declared, and S66 STOOD: the arm MOVES a row between buckets rather than losing one, so the sum is blind to it. OVER-STRICTNESS is section S9 and is HELD OPEN under every arm above rather than armed on its own — six correct spellings this implementation was not written around, all of which must keep passing. Declared before arming, and every one RUN; results in this file's own RESULTS line and in the item's report.
   REC-115 ADDS SECTION S10 AND ITS OWN DRIVER: TWO arms and a bracketing baseline live in `test/nc-rec115.mjs`, re-run in one step with `node test/nc-rec115.mjs [arm|all]` from `bio-plane/`. It keeps every guard above and adds two: an arm may carry MORE THAN ONE EDIT, and it drives TWO SUITES — this one AND `civicos-ui/test/passage-surface.test.mjs`, because the surface is where a member actually reads the sentence and REC-115 turned UI-62's REPORT there into an ASSERTION. Baseline green at BOTH ends: 92 pass / 0 fail here, 100 pass / 0 fail at the surface. (a) `levelsunstripped` — THE FIX REVERTED, one variable, one edit: `meaning({mode:"levels"})` builds its scope from the FULL query again instead of `armSet(rowArm)`, which is the defect exactly as it shipped. ACTUAL **EXACTLY AS DECLARED**: 82 pass / 10 fail, failing S102 S103 S104 S105 S106 S107 S109 S1010 S1012 S1013 — **naming BOTH halves, which is the requirement: the COLLAPSED FIGURE (S102, S103) AND the BRANCHES THAT BECOME UNREACHABLE (S104/S105 and S106)**, because a failure naming only one is one a reader cannot act on. The surface went red with it (99 pass / 1 fail). S108 — THE TRUE ZERO SURVIVES — STAYED GREEN, and so did S101, S1011 and every assertion of S1-S9, which is what shows the `axis`, `rows` and `count` statements were not moved by this item. (b) `liar` — TWO EDITS ON PURPOSE, and it is not a test of this implementation: it stages the CHEAPEST GREEN named in the row (the fix reverted AND `says` blinded to `documents`), which reaches the branches and silences the sentence assertions while leaving the scope FIGURE wrong for every other reader of the envelope. ACTUAL 84 pass / 8 fail, failing S85 S102 S103 S106 S108 S1010 S1012 S1013. **TWO DECLARATIONS WERE WRONG AND ARE CORRECTED HERE RATHER THAN SMOOTHED.** (i) S106 was declared to PASS under this arm and it FAILED — because S106 asserts `blind.scope.documents >= 1` as well as the sentence, so it pins the FIGURE too and the liar cannot buy it; the assertion is stronger than its author thought. (ii) S108 was declared held open and it FAILED — correctly, and this is the over-strictness arm catching the liar rather than the liar breaking it: blinding `says` does not merely leave the false zero wrong, it DESTROYS THE TRUE ZERO'S OWN SENTENCE, which is the thing this row must not remove. A third result was undeclared and is the useful one: **S85 — REC-92's own pre-existing assertion — failed too, an independent witness this item did not write.** THE FINDING THAT MATTERS MOST FROM ARM (b): **the SURFACE stayed GREEN under it (100 pass / 0 fail)**, because its assertion counts DISTINCT sentences and the liar still mints four. So the surface assertion alone would NOT have caught the cheapest green — the plane's S102/S103, which assert the NUMBER against an independently-derived count and against `captures_counted`, are what do. That is why S10 does not rest on prose. */
/* WHAT THIS SUITE IS FOR — REC-92, `CONTENT-SEARCH-DESIGN.md` §7 row 5.
 *
 * §4.2's `passage:` arm and `rows=passage`: the text index made askable. Six
 * things are driven, and the first is the one the whole item exists for.
 *
 *   1. `passage:` AND `text:` ARE DIFFERENT QUESTIONS OVER DIFFERENT SETS, and
 *      §8's first control is exactly this: a term that appears ONLY inside a
 *      captured PDF's page text returns that bundle through `passage:` and does
 *      NOT through `text:`. `text:` searches the group's own notes and
 *      frontmatter (`bundles_fts`); `passage:` searches what the documents SAY
 *      (`capture_text_fts`). A suite that drove only one of them would pass over
 *      an implementation that had quietly wired the new arm to the old table.
 *
 *   2. A HIT IS AN ADDRESS AND NOTHING IS MINTED BY SEARCHING (§4.5, DEC-24).
 *      The content row count is asserted UNCHANGED after every query this suite
 *      runs, and `content_id` is NULL where no row exists and the real id where
 *      one does — which is the difference between "citable" and "cited" that
 *      §4.2 requires the row to state.
 *
 *   3. THE MATCH IS APPLIED AT BOTH GRAINS. The arm selects BUNDLES holding a
 *      matching unit; the row shape returns the units that MATCHED. Those are
 *      different statements and a four-hundred-page packet that matches on one
 *      page must answer ONE row, not four hundred. `total` and the page are
 *      driven together, because a filter present in one and not the other is how
 *      they come to describe different relations.
 *
 *   4. §4.4's TALLY, AND THE FIFTH BUCKET. The envelope's `scope` carries the
 *      content-axis census, and this suite drives a capture in EVERY state the
 *      vocabulary has — including the one §4.4 does not name. See section 6.
 *
 *   5. TRUNCATION IS CARRIED PER UNIT (§8's second control). A unit stored over
 *      the per-unit bound answers `truncated: 1` and one under it answers `0`.
 *      REC-91 wrote that flag and said in its own words that `capture_text.
 *      truncated` is *a column no op reads until REC-92's `rows=passage`* — so
 *      this suite is the first reader of it, and that is asserted rather than
 *      assumed.
 *
 *   6. THE FOUR-LEVEL STATEMENT, ARM-AWARE. An empty `passage:` answer must be
 *      distinguishable BY THE ENVELOPE ALONE from an empty `content:` answer
 *      over the same scope, and from an empty answer over a scope nobody has
 *      read. Section 8 drives all three.
 *
 * WHAT THIS SUITE DOES NOT CLAIM, and both are findings rather than gaps:
 *
 *   - REC-36's WITHHOLD RULE STILL CANNOT BE STAGED AT ROW GRAIN, for the
 *     structural reason REC-90 measured and this item RE-MEASURED rather than
 *     inherited (§7 below prints the measurement). `viewerPredicate`'s
 *     participant clause fences exactly `b.object_type <> 'project'`, and every
 *     indexed unit hangs off an `information` bundle because `capture_text` is
 *     written at promote from a READING, and a reading's target is a document.
 *     So there is no passage row a participant gate can remove, and an assertion
 *     that one was withheld would PASS OVER AN EMPTY SET — the failure this
 *     project has measured three times. Section 7 drives the gate's PRESENCE
 *     instead, three ways that cannot pass vacuously: the compiled statement
 *     carries GATE_MARK, a DENY viewer gets zero rows AND a zero tally over a
 *     corpus this suite proves non-empty, and the `nc-rec92` `withhold` arm makes
 *     the D-15 throw fire.
 *   - IT DOES NOT MEASURE THE `chain_kind` INDEX. `schema.mjs` names REC-92 as
 *     the item that would add it; this item DECLINES it and the reason is in the
 *     report and asserted here in section 9: this arm compiles no predicate over
 *     `chain_kind`, so the index would still have no reader, and adding a filter
 *     to justify an index is building the reader backwards.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { compile, MEANING, meaningVocabulary, GATE_MARK,
         MEANING_AXIS_CAP } from "../src/query.mjs";
/* THE VOCABULARY IS THE IMPORTED CONSTANT AND NO MEMBER OF IT IS SPELLED IN
   THIS FILE. REC-94 exported it and the ruling is a MECHANISM rather than a
   convention: the suites pin the CONSTANT, so a divergent spelling is a build
   error and not a review finding. `nc-rec94.mjs`'s `spelling` arm enforces it
   across the tree, and this file is deliberately inside its reach. */
import { CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED } from "../src/airun.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const IDX = SRC("index.mjs");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r92", MEMBER_TOKEN: "mem-r92", PROBE_TOKEN: "prb-r92",
              AI_TOKEN: "ai-r92", VERSION: "test" },
});

let pass = 0, fail = 0;
/* EVERY ASSERTION CARRIES A STABLE NAME, because a negative-control arm that
   reports "something went red" is not a control. `nc-rec92.mjs` declares which
   assertions each arm MUST fail BY NAME and matches on these ids, so an arm
   that took down the wrong thing is a finding rather than a footnote. The id is
   the section letter plus a counter within the section; sections are numbered in
   the console headers below. */
let SEC = "S0", seq = 0;
const section = (code, title) => { SEC = code; seq = 0; console.log(`\n--- ${code} · ${title} ---`); };
const t = (label, got, want) => {
  const id = `${SEC}${++seq}`;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${id}: ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r92") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r92") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const rows = async (qs, tok = "mem-r92") => get("meaningrows", qs, tok);
/* THE BUNDLE-GRAIN ARM, through `op=search` — the same selector at the other
   grain, which is how sections 3 and 4 show one word answering two questions. */
const ids = async (q, tok = "mem-r92") =>
  (await get("search", `q=${encodeURIComponent(q)}&mode=ids`, tok))?.ids ?? [];

const NOW = "2026-09-17T00:00:00Z";
const LATER = "2026-09-17T01:00:00Z";

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, { document = null, registerOnly = null } = {}) => {
  const text = infoMd(id);
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (document) {
    const prov = JSON.stringify({ documents: [document] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260917T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: LATER },
    files,
    /* `registerOnly` REGISTERS A CAPTURE AND PROMOTES NO READING FOR IT, which
       is how section 6 stages the bucket that matters most: a document the
       record HOLDS and nobody has ever read. It is not a contrived state — it is
       the ordinary one for every capture between acquisition and extraction, and
       it is the difference between "these documents do not say that" and "nobody
       has opened these documents". */
    register: registerOnly
      ? [{ sha256: registerOnly, path: "data/unread.bin", encoding: "binary", bytes: 10 }]
      : document && document.capture && document.capture.sha256
      ? [{ sha256: document.capture.sha256, path: document.file || "data/doc.bin",
           encoding: "binary", bytes: document.capture.bytes || 10 }]
      : [] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

const pdfDocOf = (captureSha, pages, chainStep = "layer") => ({
  file: "snapshots/packet.pdf", locator: "https://www.oaklandca.gov/packet.pdf", retrieved: NOW,
  capture: { sha256: captureSha, encoding: "binary", bytes: 4096 },
  reading: { content_type: "meeting_packet", reader_version: 1, read_from_text: true,
             found: false, entities: [], facts: {}, at: NOW,
             text_source: [{ step: chainStep, tier: chainStep === "ocr" ? 3 : 1, container: "pdf" }],
             text_tier: chainStep === "ocr" ? 3 : 1, text_container: "pdf",
             page_count: pages.length, container_extent: null,
             basis: "a synthetic reading for the passage arm" },
  text_units: pages.map((text, i) => ({ extent: { kind: "pdf-page", page: i, rect: null },
                                        seq: i, text })),
});

/* THE TERM THAT EXISTS ONLY INSIDE A CAPTURED PAGE. It appears in NO
   frontmatter, NO title and NO note — which is what makes section 3's
   `passage:` / `text:` split a real measurement rather than a coincidence. */
const ONLY_IN_PAGE = "hydrostatic";
const ALSO_IN_TITLE = "Info";

let contentRowsBefore = null;

try {

/* ==================================================================== 1
 * THE ARM EXISTS ON THE ONE COMPILER, AND ITS SHAPE IS DRIVEN NOT TYPED.
 * ================================================================== */
section("S1", "the arm on the registry, and the shape section 4.2 specifies");
{
  t("`passage` is an arm on the ONE compiler's registry, keyed on the bundle like every other",
    [MEANING.passage?.table, MEANING.passage?.key], ["capture_text", "bundle_id"]);
  t("it declares the LEVEL it answers at, and it is the CONTENT level — Part II section 14.3's vocabulary",
    MEANING.passage.level, "content");
  t("`content:` declares the same level, because the two arms answer two halves of ONE level",
    [MEANING.content.level, MEANING.passage.level], ["content", "content"]);
  /* The identity must be the table's own PRIMARY KEY or paging repeats or loses
     rows. §4.2 names it and `schema.mjs` declares it; both are read here rather
     than one being trusted. */
  t("the identity is section 4.2's, and it IS `capture_text`'s PRIMARY KEY",
    MEANING.passage.identity, ["capture_sha", "extent_kind", "extent"]);
  t("...and that is the PRIMARY KEY the schema actually declares",
    /PRIMARY KEY \(capture_sha, extent_kind, extent\)/.test(SCHEMA_SRC), true);
  t("it names NO bundle-reference column, for `content:`'s reason: `bundle_id` is the owner",
    MEANING.passage.refs, []);
  t("the FTS side is DECLARED on the descriptor rather than known by the row builder",
    [MEANING.passage.ftsTable, MEANING.passage.ftsColumn], ["capture_text_fts", 0]);
  /* `capture_text_fts` indexes exactly ONE column, so column 0 is `text` and
     `-1` would be a claim about a table with more than one. Driven off the DDL
     in `store.mjs`, not off this file's belief about it. */
  t("...and `capture_text_fts` really does index exactly one column, so column 0 is `text`",
    /capture_text_fts USING fts5\(\s*\n?\s*text, content='capture_text'/.test(
      readFileSync(SRC("store.mjs"), "utf8")), true);
  t("no bare word of the passage arm is claimed by two sub-fields",
    meaningVocabulary().passage.ambiguous, []);
  /* §4.2 gives this arm ONE question. The five row-shaped questions are
     `content:`'s and landed at REC-90; an arm that grew them here would be two
     spellings of one question. */
  t("section 4.2 gives this arm exactly ONE sub-field, and the registry agrees",
    Object.keys(MEANING.passage.sub), ["text"]);
  t("`snippet` is PUBLISHED in the vocabulary a surface builds its table from",
    meaningVocabulary().passage.rows.columns.includes("snippet"), true);
  t("...and so is `content_id`, `truncated`, `ref` and `chain_kind` — section 4.2's row, in full",
    ["content_id", "truncated", "ref", "chain_kind", "extent", "extent_kind", "seq"]
      .every((c) => meaningVocabulary().passage.rows.columns.includes(c)), true);
  /* The three arms that predate `content:` publish NO `snippet` column, which is
     what makes the line above a statement about THIS arm rather than about the
     projection generally. */
  t("and an arm with no text index publishes no `snippet` column at all",
    meaningVocabulary().leg.rows.columns.includes("snippet"), false);
}

/* ==================================================================== 2
 * THE COMPILED STATEMENT: THE MEMBER'S STRING IS ALWAYS AN ARGUMENT.
 * ================================================================== */
section("S2", "the member's string is an ARGUMENT, and the SQL does not move");
{
  /* The property the whole compiler has, asserted for the new arm the way
     `content-arm.test.mjs` asserts it for `content:` — by compiling a battery of
     hostile values and requiring the SQL to be BYTE-IDENTICAL while only `args`
     moves. A single interpolation would show up here as a moving statement. */
  /* EVERY VALUE HERE IS ONE TOKEN, AND THAT RESTRICTION IS A MEASUREMENT RATHER
     THAN A CONVENIENCE. The first draft of this battery used values containing
     spaces, quotes and semicolons and the assertion failed at 4 variants — not
     because anything was interpolated, but because the QUERY TOKENIZER, which
     is upstream of this arm and untouched by this item, splits
     `passage:"x" OR "y"` into two atoms and a UNION, and drops a bare `;` as a
     term with no word in it. That is the parser's documented behaviour at a
     different layer, and a battery that mixed it in would be reporting the
     tokenizer's shape as this arm's defect. The property THIS assertion is for
     is narrower and is the one that matters: for a fixed parse shape, the
     member's value never reaches the SQL TEXT. The assertion below covers the
     characters themselves for every value, tokenized or not. */
  const hostile = [`water`, `a'OR1=1--`, `x*y`, `café`, `MATCH`, `NEAR`, `bundles_fts`];
  const sqls = new Set(), argsSeen = [];
  for (const v of hostile) {
    const p = compile({ q: `passage:${JSON.stringify(v)}`, viewer: "member:MEM-1", rows: "passage" });
    const s = p.statements.meaning();
    if (s) { sqls.add(s.sql); argsSeen.push(JSON.stringify(s.args)); }
  }
  t("every hostile value compiles to ONE statement text — the SQL does not move",
    sqls.size, 1);
  t("...while the ARGS move for every one of them, so the values really did reach the plan",
    new Set(argsSeen).size, argsSeen.length);
  /* THE SECURITY PROPERTY ITSELF, over EVERY value including the ones the
     tokenizer reshapes: whatever the parse did, the member's characters are in
     `args` and never in the statement text. */
  const nasty = [`"; DROP TABLE capture_text; --`, `a' OR 1=1 --`, `x" OR "y`, `' UNION SELECT`];
  t("the FTS expression is BOUND and never interpolated: no hostile value's characters "
    + "reach the SQL text, whatever the tokenizer made of them",
    nasty.filter((v) => {
      const pp = compile({ q: `passage:${JSON.stringify(v)}`, viewer: "member:MEM-1", rows: "passage" });
      const s2 = pp.statements.meaning();
      return s2 && (s2.sql.includes("DROP TABLE") || s2.sql.includes("UNION SELECT c")
                    || s2.sql.includes("1=1 --"));
    }), []);
  /* The statement carries the gate marker, which is what `Store#runQuery`
     asserts at runtime. A statement that skipped the gate would be caught by the
     marker's absence rather than by an audit of the code (D-15). */
  t("every mode of the passage plan carries GATE_MARK",
    ["rows", "count", "levels", "axis"].map((mode) => {
      const p = compile({ q: "passage:water", viewer: "member:MEM-1", rows: "passage" });
      const s = p.statements.meaning(mode === "rows" ? undefined : { mode });
      return !!s && s.sql.includes(GATE_MARK);
    }), [true, true, true, true]);
  /* The axis read binds exactly two variables whatever the scope size — the
     property that keeps it clear of D-36's ~100 bound-variable ceiling, which
     `#frontierContent` is already over. Asserted, because the alternative
     spelling (an `IN (?)` list of subjects) is the obvious one and would look
     identical from outside until a real corpus hit it. */
  const axisPlan = compile({ q: "passage:water", viewer: "member:MEM-1", rows: "passage" })
    .statements.meaning({ mode: "axis" });
  /* THE HAZARD IS NAMED PRECISELY, because the loose form of this assertion is
     WRONG and this suite's first draft shipped it: the statement DOES contain
     `IN (` — the arm's own `rowid IN (SELECT rowid FROM …)` lives in the CTE
     above it. What must not appear is a list of SUBJECTS bound one per capture,
     which is the spelling `#frontierContent` uses and which is already over
     D-36's measured ~100-bound-variable ceiling (D-390). */
  t("the content-axis read binds no per-capture subject list — it JOINS, so its bound-variable "
    + "count cannot grow with the scope (D-36, and D-390 is the receipt for getting this wrong)",
    /subject IN \(/.test(axisPlan.sql), false);
  /* §4.4's *OTHER arms*, pinned. The tally's scope is the query WITHOUT this
     arm's own text filter — otherwise a query that matched nothing has an empty
     scope and therefore an empty tally, and the answer says "0 hits over 0
     captures", which is the false absence this mechanism exists to refuse
     arriving through the mechanism itself. This item shipped that in its first
     draft and this suite caught it; the assertion is the tripwire. */
  t("section 4.4's *OTHER arms*: the tally's scope does NOT carry this arm's own text filter, "
    + "so an empty answer still has a real denominator",
    axisPlan.sql.includes("capture_text_fts MATCH"), false);
  t("...while the ROW statement DOES carry it — the two scopes are deliberately different",
    compile({ q: "passage:water", viewer: "member:MEM-1", rows: "passage" })
      .statements.meaning().sql.includes("capture_text_fts MATCH"), true);
  /* And the other arms really do survive into the tally's scope, or the
     denominator would silently become the whole corpus. */
  t("...and a NON-text arm of the same query DOES survive into the tally's scope",
    compile({ q: "passage:water type:information", viewer: "member:MEM-1", rows: "passage" })
      .statements.meaning({ mode: "axis" }).sql.includes("object_type = ?"), true);
  t("...and it over-fetches by exactly one, so truncation is OBSERVED and not inferred",
    axisPlan.args[axisPlan.args.length - 1], MEANING_AXIS_CAP + 1);
  /* A comparison against a text index has no meaning and is DROPPED WITH A
     WARNING — the visible direction, which widens the answer. Compiling it to a
     MATCH would answer a question the member did not ask. */
  /* `text` is this arm's only sub-field, so `passage:text>=bar` is the spelling
     that actually reaches the qualified-comparison path. `passage:foo>=bar` is
     NOT a comparison at all — `foo` is not a sub-field, so the whole string is
     an ordinary search term, and asserting a refusal there would have been this
     suite testing a path the parser never takes. */
  const cmp = compile({ q: "passage:text>=bar", viewer: "member:MEM-1", rows: "passage" });
  t("a COMPARISON against the text index is dropped with a warning, never compiled",
    [cmp.meaningArms.length, cmp.warnings.length > 0], [0, true]);
  const punct = compile({ q: "passage:---", viewer: "member:MEM-1", rows: "passage" });
  t("a term with no word in it is dropped with a warning, never compiled to a MATCH nothing satisfies",
    [punct.meaningArms.length, punct.warnings.length > 0], [0, true]);
}

/* ==================================================================== 3
 * §8's FIRST CONTROL: `passage:` AND `text:` ARE DIFFERENT QUESTIONS.
 * ================================================================== */
section("S3", "a term only inside a captured page: `passage:` finds it, `text:` does not");

const SHA_PACKET = sha("rec92 a captured pdf whose pages carry text");
const B_PACKET = "INFO-2026-9201-packet";
await promote(B_PACKET, { document: pdfDocOf(SHA_PACKET, [
  `the layer read this page as quorum absent and ${ONLY_IN_PAGE} pressure rising`,
  "and this page as appropriation of the reserve fund",
  "a third page that mentions neither term at all",
]) });

/* THE CORPUS IS PRINTED AND FLOORED BEFORE ANYTHING IS CONCLUDED FROM IT.
   Three headline totality assertions in this repository have PASSED OVER AN
   EMPTY CORPUS, so the fixture states its own size and every later count is
   read against a set this line proves non-empty. */
{
  const st = await get("stats", "", "adm-r92");
  console.log(`  CORPUS: textUnits=${st.textUnits} across the fixture so far`);
  t("FIXTURE FLOOR: the index really holds units — every count below is over a NON-EMPTY set",
    st.textUnits >= 3, true);
  contentRowsBefore = st.content ?? 0;
}

{
  const viaPassage = await ids(`passage:${ONLY_IN_PAGE}`);
  const viaText = await ids(`text:${ONLY_IN_PAGE}`);
  t("section 8 control 1a: the term inside the PAGE is found by `passage:`",
    viaPassage.includes(B_PACKET), true);
  t("section 8 control 1b: and is NOT found by `text:` — the group's notes do not contain it",
    viaText.includes(B_PACKET), false);
  /* The converse, which is what stops the pair passing because `text:` is simply
     broken: a term that IS in the frontmatter is found by `text:`. Without this
     the assertion above is satisfied by a `text:` arm that finds nothing ever. */
  t("the CONVERSE, so the pair is not satisfied by a `text:` arm that finds nothing: "
    + "a frontmatter term IS found by `text:`",
    (await ids(`text:${ALSO_IN_TITLE}`)).includes(B_PACKET), true);
  t("`passage:*` is a presence test — which documents in scope are searchable at passage grain",
    (await ids("passage:*")).includes(B_PACKET), true);
  /* A word in no page at all: the arm narrows rather than matching everything,
     which is the other way this could pass vacuously. */
  t("and a word in no page at all returns nothing — the arm really narrows",
    (await ids("passage:zzzznotaword")).length, 0);
}

/* ==================================================================== 4
 * §4.2's ROW SHAPE: THE UNITS THAT MATCHED, WITH `snippet` AND `ref`.
 * ================================================================== */
section("S4", "rows=passage returns the units that MATCHED, not every unit of the document");
{
  const a = await rows(`rows=passage&q=${encodeURIComponent(`passage:${ONLY_IN_PAGE}`)}`);
  t("the op answers, at the passage grain, with the arm and grain named in words",
    [a.ok, a.arm, a.table], [true, "passage", "capture_text"]);
  /* THE HEADLINE. The packet holds THREE units and exactly ONE matches. An
     implementation that applied the match only at the arm would answer three
     here, with `total` agreeing — the widening that `nc-rec92`'s `nomatch` arm
     produces on purpose. */
  t("section 4.2: only the MATCHING unit comes back — one of the packet's three pages",
    [a.count, a.total], [1, 1]);
  t("...and the row is the page that actually holds the term",
    a.rows?.[0]?.extent_kind === "pdf-page" && Number(JSON.parse(a.rows[0].extent).page) === 0, true);
  t("`snippet()` is returned and it CENTRES ON THE TERM, bracketed as the bundle snippet is",
    typeof a.rows?.[0]?.snippet === "string" && a.rows[0].snippet.includes(`[${ONLY_IN_PAGE}]`), true);
  t("IC-1's human `ref` rides with it, so a member can be told where they are",
    typeof a.rows?.[0]?.ref === "string" && a.rows[0].ref.length > 0, true);
  t("the chain's last step is published per unit, off the COLUMN and not a parse",
    a.rows?.[0]?.chain_kind, "layer");
  t("`seq` rides with the row, so a member can place the passage in reading order",
    a.rows?.[0]?.seq, 0);
  /* §4.5: a hit is an ADDRESS. No content row has been minted for this extent,
     so `content_id` is NULL — REPORTED, never invented to make the column
     look full. */
  t("section 4.5: a hit is an ADDRESS — `content_id` is NULL where no content row exists",
    a.rows?.[0]?.content_id, null);
  t("the answer names the LEVEL it answers at",
    a.level, "content");
  t("and it states that these rows MATCHED a term rather than being every unit in scope",
    a.levels?.content?.matched, true);
}

/* ==================================================================== 5
 * §8's SECOND CONTROL: TRUNCATION, PER UNIT, READ FOR THE FIRST TIME.
 * ================================================================== */
section("S5", "a unit over the per-unit bound says so, and one under it says so too");

const SHA_BIG = sha("rec92 a capture with one oversized unit");
const B_BIG = "INFO-2026-9202-oversize";
{
  /* `CAPTURE_TEXT_UNIT_CAP` is 128 KiB. One unit over it, one comfortably under,
     and the same searchable term in BOTH so a single query returns the pair and
     the flag is the only thing that differs between the two rows. */
  const BIG = `${ONLY_IN_PAGE} ` + "x".repeat(140 * 1024);
  const SMALL = `${ONLY_IN_PAGE} a short page`;
  await promote(B_BIG, { document: pdfDocOf(SHA_BIG, [BIG, SMALL]) });
  const a = await rows(`rows=passage&q=${encodeURIComponent(`passage:${ONLY_IN_PAGE}`)}`);
  /* Narrowed in JS on `capture_sha` rather than by a selector: the point of this
     section is the FLAG, and picking the two rows out of the answer keeps it
     from also depending on a second arm's behaviour. */
  const mine = (a.rows || []).filter((r) => r.capture_sha === SHA_BIG);
  t("the oversize fixture really reached the index — both its units are in the answer",
    mine.length, 2);
  const byPage = Object.fromEntries(mine.map((r) => [JSON.parse(r.extent).page, r.truncated]));
  t("section 8 control 2: the unit over the per-unit bound carries `truncated = 1`",
    byPage[0], 1);
  t("...and the unit under it carries `0` — the two are distinguishable by the row alone",
    byPage[1], 0);
  /* REC-91 wrote this flag and recorded that nothing read it until this item.
     Asserted rather than assumed, because a flag nothing publishes is a
     mechanism believed on the strength of its existence. */
  t("REC-91's `truncated` column has its FIRST READER, and both values are reachable",
    new Set(Object.values(byPage)).size, 2);
}

/* ==================================================================== 6
 * §4.4's TALLY — AND THE FIFTH BUCKET THE DESIGN DOES NOT NAME.
 * ================================================================== */
section("S6", "the content-axis tally, over a capture in every state the vocabulary has");

const SHA_NOTEXT = sha("rec92 a capture whose extraction found no text");
const B_NOTEXT = "INFO-2026-9203-notext";
{
  /* A capture registered with a reading that produced NO units: extraction
     looked and there was nothing to index. That is the none-with-a-reason
     member, and it must not read as "partly indexed". */
  const doc = pdfDocOf(SHA_NOTEXT, []);
  doc.text_units = [];
  await promote(B_NOTEXT, { document: doc });

  /* AND THE BUCKET THE WHOLE MECHANISM EXISTS FOR: a capture the record HOLDS
     and NOBODY HAS EVER READ. Registered, never promoted with a reading — which
     is the ordinary state of every document between acquisition and extraction.
     Without a fixture in this state section 6 would be asserting over four
     buckets one of which no test could ever put a row in, and the one that says
     NOBODY LOOKED is exactly the one a member must not read as silence. */
  const SHA_UNREAD = sha("rec92 a capture the record holds and nobody has read");
  await promote("INFO-2026-9204-unread", { registerOnly: SHA_UNREAD });

  const a = await rows(`rows=passage&q=${encodeURIComponent("passage:zzzznotaword")}`);
  const K = Object.keys(CONTENT_AXIS_STATES);
  t("section 4.4: the envelope's `scope` carries the content-axis tally",
    typeof a.scope?.captures_counted, "number");
  /* EVERY KEY THE VOCABULARY HAS IS A BUCKET, and the fifth is present. The keys
     are read off the CONSTANT so a sixth state added beside the writer appears
     here the same day. */
  t("every one of the four states the vocabulary declares is a bucket on the tally",
    K.every((k) => typeof a.scope?.[k] === "number"), true);
  t("AND THE FIFTH BUCKET IS THERE — the UNDETERMINED section 4.4 does not name, "
    + "spelled from the constant REC-94 exported separately and deliberately",
    typeof a.scope?.[CONTENT_AXIS_UNDETERMINED], "number");
  t("the tally publishes its own BOUND and whether it bit, so a sample is never read as a census",
    [typeof a.scope?.captures_bound, typeof a.scope?.captures_truncated],
    ["number", "boolean"]);
  t("the vocabulary travels with the answer, so a surface renders it rather than matching a literal",
    [Object.keys(a.content_axis?.vocabulary || {}).length, a.content_axis?.undetermined_value],
    [4, CONTENT_AXIS_UNDETERMINED]);
  /* THE BUCKETS SUM TO THE COUNT. A tally whose parts do not add up to its whole
     is one that has silently dropped a state — which is exactly what an
     unrecognised sixth value would do without the else-branch that counts it as
     undetermined. */
  const summed = [...K, CONTENT_AXIS_UNDETERMINED].reduce((n, k) => n + a.scope?.[k], 0);
  t("the buckets SUM to the captures counted — no state is silently dropped",
    summed, a.scope?.captures_counted);
  t("the fixture really exercises this: more than one capture is in scope",
    a.scope?.captures_counted >= 3, true);
  /* The real states of the real fixture: the packet was indexed whole, the
     no-text capture looked and found nothing. Read by NAME off the constant's
     key order, never by typing the member. */
  t(`at least one capture is fully indexed (${K[0]})`, a.scope?.[K[0]] >= 1, true);
  t(`and at least one is the none-with-a-reason member (${K[2]}) — extraction looked, `
    + `there was nothing to index`, a.scope?.[K[2]] >= 1, true);
  /* THE BUCKET THAT SAYS NOBODY LOOKED, driven rather than merely declared. This
     is the one §4.4 exists for: without it an empty answer over a corpus nobody
     has read is byte-identical to an empty answer over a corpus that genuinely
     does not mention the term. */
  t(`AND at least one capture says NOBODY HAS EVER READ IT (${K[3]}) — the absence of an `
    + `observation, never a finding about the document`, a.scope?.[K[3]] >= 1, true);
  /* THE FIFTH BUCKET IS PINNED STRUCTURALLY AND NOT BEHAVIOURALLY, AND THAT IS
     DECLARED HERE RATHER THAN LEFT TO BE INFERRED FROM A GREEN. Every capture
     this suite can create is promoted through REC-91's writer or registered with
     no reading at all, so each lands in one of the four DETERMINED states.
     `undetermined` needs a capture whose extraction is recorded but whose INDEX
     observation is absent — the state of every capture promoted before REC-91
     existed — and this suite cannot manufacture a pre-REC-91 promote. So S63
     above pins the bucket's PRESENCE and `nc-rec92.mjs` declares the matching
     arm structural-only. Named, because a structural-only green read later as a
     behavioural one is this project's most-measured instrument defect. */
  t("the fifth bucket is present and EMPTY on this fixture, which is the honest value: "
    + "every capture here is in a determined state",
    a.scope?.[CONTENT_AXIS_UNDETERMINED], 0);
}

/* ==================================================================== 7
 * THE GATE: PRESENT AND LIVE, MEASURED RATHER THAN ASSERTED OVER AN EMPTY SET.
 * ================================================================== */
section("S7", "REC-36: the fence is LIVE, and what it cannot be staged against is MEASURED");
{
  /* THE MEASUREMENT REC-90 MADE ONE CONSTRUCT OVER, RE-TAKEN HERE RATHER THAN
     INHERITED — a blocker is a claim, and this one is re-driven on this tree. */
  const participantOnly = /b\.object_type <> 'project'/.test(QUERY_SRC);
  console.log(`  MEASURED: viewerPredicate's participant clause fences project bundles only: ${participantOnly}`);
  t("the participant clause fences `project` bundles and nothing else — so no INFORMATION "
    + "bundle's passages can be withheld by it, and an assertion that one was would pass over an empty set",
    participantOnly, true);
  /* So the fence is driven three ways that CANNOT pass vacuously. */
  const p = compile({ q: `passage:${ONLY_IN_PAGE}`, viewer: "member:MEM-1", rows: "passage" });
  t("(i) the row statement takes its WHERE from the ONE compilation point",
    p.statements.meaning().sql.includes(GATE_MARK), true);
  /* (ii) A viewer the gate does not recognise fails CLOSED — zero rows AND a
     zero tally, over a corpus section 3 proved non-empty. Both halves matter: a
     tally that ranged wider than the answer would be REC-36's leak arriving as
     an instrument. */
  const denied = await rows(`rows=passage&q=${encodeURIComponent(`passage:${ONLY_IN_PAGE}`)}`,
                            "not-a-token");
  const seen = await rows(`rows=passage&q=${encodeURIComponent(`passage:${ONLY_IN_PAGE}`)}`);
  t("(ii) an unrecognised viewer gets NOTHING, over a corpus that answers a real member",
    [denied?.ok === true ? denied.total : 0, seen.total >= 1], [0, true]);
  t("...AND its content-axis tally is zero too — the tally cannot range wider than the rows",
    denied?.ok === true ? denied.scope.captures_counted : 0, 0);
  /* (iii) is the `nc-rec92` `withhold` arm: with the predicate replaced by
     `1=1`, `Store#runQuery`'s D-15 throw fires and the op answers ok:false.
     Declared on this file's NEGATIVE CONTROL line and RUN. */
  t("(iii) the gate is a WHERE predicate on the bundle the unit hangs off, not a second "
    + "compilation point — one gate, D-15",
    p.statements.meaning().sql.split(GATE_MARK).length - 1, 1);
}

/* ==================================================================== 8
 * THE FOUR-LEVEL STATEMENT, ARM-AWARE: THREE EMPTIES, ALL DISTINGUISHABLE.
 * ================================================================== */
section("S8", "three different empties, told apart BY THE ENVELOPE ALONE");
{
  const noHit = await rows(`rows=passage&q=${encodeURIComponent("passage:zzzznotaword")}`);
  const noDoc = await rows(`rows=passage&q=${encodeURIComponent(
    "passage:zzzznotaword type:nosuchtype")}`);
  /* Documents ARE in scope and none of them holds a content row — which is the
     branch that produces `content:`'s citation sentence. Selecting on
     `content:pdf-page` instead would put only documents that HAVE content rows
     in scope, so the branch would never be reached and the assertion below
     would be testing the other sentence. */
  const contentArm = await rows(`rows=content&q=${encodeURIComponent("type:information")}`);

  t("an empty PASSAGE answer over a searchable scope says so, and does NOT say `nothing was cited`",
    [noHit.total, /cited/.test(noHit.levels?.content?.why)], [0, false]);
  /* THE SENTENCE THAT WOULD HAVE LIED. Before this item, `level: "content"` alone
     selected the prose, so a passage miss would have published `content:`'s
     citation sentence — the honesty mechanism itself making a false statement. */
  t("...it names the INDEX COVERAGE instead: how many captures were read at passage grain",
    /never extracted/.test(noHit.levels?.content?.why), true);
  t("an empty CONTENT answer over the same corpus still says what it always said — about CITATION",
    /cited or marked citable/.test(contentArm.levels?.content?.why), true);
  t("THE TWO EMPTIES ARE DISTINGUISHABLE BY THE ENVELOPE ALONE",
    noHit.levels?.content?.why === contentArm.levels?.content?.why, false);
  t("an empty answer with NO DOCUMENT in scope is a third, distinct statement",
    [noDoc.total, /empty DOCUMENT level/.test(noDoc.says || "")], [0, true]);
  t("the level nobody can see is NAMED as undetermined rather than omitted (CLAUDE.md's sparse rule)",
    noHit.levels?.internet?.state, "UNDETERMINED");
  t("`says` is one sentence a surface renders without composing it",
    typeof noHit.says === "string" && noHit.says.length > 40, true);
  /* §4.5 / DEC-24 / §8's fifth control: searching mints nothing. Asserted over
     EVERY query this suite has run, against the count taken in section 3. */
  const st = await get("stats", "", "adm-r92");
  t("section 8 control 5: SEARCHING MINTS NOTHING — the content row count is unchanged",
    (st.content ?? 0), contentRowsBefore);
}

/* ==================================================================== 9
 * OVER-STRICTNESS: SPELLINGS THIS IMPLEMENTATION WAS NOT WRITTEN AROUND.
 * ================================================================== */
section("S9", "over-strictness: six correct spellings that MUST still work");
{
  t("(1) a QUOTED PHRASE compiles and finds the page",
    (await ids(`passage:"quorum absent"`)).includes(B_PACKET), true);
  t("(2) a `*` PREFIX compiles and finds it",
    (await ids(`passage:hydrostat*`)).includes(B_PACKET), true);
  t("(3) `passage:` composes with `text:` in one query — two arms, two tables, one answer",
    (await ids(`passage:${ONLY_IN_PAGE} text:${ALSO_IN_TITLE}`)).includes(B_PACKET), true);
  /* §4.2's precedent from `rows=content`: a row arm with no selector of its own
     is ANSWERED and not refused. It lists every indexed unit in scope, its
     `snippet` is NULL for want of a term, and THE ANSWER SAYS SO rather than
     leaving a member to read the null. */
  const bare = await rows(`rows=passage&q=${encodeURIComponent("type:information")}`);
  t("(4) `rows=passage` with NO `passage:` selector is ANSWERED, not refused — every unit in scope",
    [bare.ok, (bare.count ?? 0) >= 3], [true, true]);
  t("...its `snippet` is NULL for want of a term, and that is not left to be inferred",
    [bare.rows?.[0]?.snippet ?? null, bare.levels?.content?.matched], [null, false]);
  t("...and the envelope SAYS the rows are every indexed unit rather than units that matched",
    /no \`passage:\` selector/.test(bare.levels?.content?.why || ""), true);
  t("(5) `passage:*` presence still compiles with a row shape and mints nothing",
    (await rows(`rows=passage&q=${encodeURIComponent("passage:*")}`)).ok, true);
  /* (6) THE ARM THAT PREDATES THIS ITEM MUST BE UNTOUCHED. A fence tighter than
     its rule is an undeclared interface change wearing the costume of caution. */
  const c = await rows(`rows=content&q=${encodeURIComponent("content:pdf-page")}`);
  t("(6) `content:` with `rows=content` answers exactly as it did before this item",
    [c.ok, c.arm, c.level], [true, "content", "content"]);
  t("...and `leg:` is likewise untouched at the meaning level",
    (await rows("rows=leg&q=has%3Aresolves")).level, "meaning");

  /* THE DECLINED INDEX, ASSERTED SO THE DECISION CANNOT ROT SILENTLY.
     `schema.mjs` names REC-92 as the item that would add a `chain_kind` index
     *with its own measurement*. This arm compiles NO predicate over
     `chain_kind`, so the index would still have no reader — and REC-12's rule is
     that an index nobody seeks on is cost with no reader. If a later item gives
     this arm a chain filter, THIS ASSERTION FAILS and the index question is
     re-opened at the moment it acquires a reader, which is the honest trigger. */
  const chainPlan = compile({ q: "passage:water", viewer: "member:MEM-1", rows: "passage" });
  t("THE DECLINED `chain_kind` INDEX: this arm compiles no predicate over that column, "
    + "so the index would still have no reader — and this assertion is the tripwire if that changes",
    chainPlan.statements.meaning({ mode: "count" }).sql.includes("chain_kind ="), false);
  t("...and the schema still declares exactly ONE index on `capture_text`, by bundle",
    (SCHEMA_SRC.match(/CREATE INDEX IF NOT EXISTS capture_text_\w+/g) || []).length, 1);
}

/* ==================================================================== 10
 * REC-115 / IC-115 — THE `levels` SCOPE IS THE QUERY'S *OTHER* ARMS, AND THE
 * TWO BRANCHES OF `says` THAT NO PASSAGE MISS COULD EVER REACH ARE DRIVEN.
 *
 * WHAT WAS WRONG, stated as the defect and not as the fix. `meaning({mode:
 * "levels"})` built its scope from the FULL query, this arm included, while its
 * own comment promised *how many documents the query's other arms put in scope
 * at all*. The arm selects the documents that HOLD a matching row, so on a MISS
 * the scope was empty by construction and `scope.documents` collapsed to 0 —
 * and since `Store.#meaningLevels` tests `documents === 0` BEFORE
 * `searchable === 0`, the first branch won every time and the two honest
 * branches below it were UNREACHABLE BY ANY PASSAGE MISS AT ALL. Measured
 * against the live plane by UI-62 (`MEASUREMENTS.md` M-43) and re-measured here
 * (M-44): a member who searched two documents, one of them fully indexed, was
 * told NO DOCUMENT WAS IN SCOPE.
 *
 * WHY S8 DID NOT CATCH IT, recorded because the gap is the interesting part and
 * the delegation asked for exactly these two assertions. S8 asserts
 * `levels.content.why`, which is composed from the TALLY and was therefore
 * already correct, and it never compared the empties' `says` TO EACH OTHER nor
 * asked `scope.documents` to agree with `captures_counted` about the same
 * scope. Both are asserted below.
 *
 * HOW A LIAR WOULD SATISFY THIS SECTION, stated before what it checks. The
 * cheapest green is to make `says` stop testing `documents` at all: that
 * reaches both branches and silences every sentence assertion while leaving the
 * scope FIGURE wrong for every other reader of the envelope — the surface's own
 * denominator among them. So S10 does NOT assert sentences alone. It asserts
 * the NUMBER (`scope.documents`) against an independently-derived count, and it
 * asserts the number AGREES with `captures_counted`, which is minted by the
 * OTHER statement over the same scope — a figure this statement cannot move.
 * A `says` divorced from `documents` fails S104 and S105 on the numbers while
 * every sentence still reads fine.
 * ================================================================== */
section("S10", "REC-115: the levels scope is the OTHER arms, and both honest branches are REACHED");
{
  /* A SCOPE OF EXACTLY TWO DOCUMENTS, ONE FULLY INDEXED AND SEARCHED AND ONE
     NEVER READ — M-43's shape, staged here rather than inherited. The two share
     the token `scopeprobe` in their ids, which is what lets one non-text arm
     (`text:`) select exactly this pair and nothing else in the corpus. */
  const SHA_SCOPE = sha("scope-probe-read");
  await promote("INFO-2026-9205-scopeprobe-read",
    { document: pdfDocOf(SHA_SCOPE, ["a page about culverts and drainage easements"]) });
  await promote("INFO-2026-9206-scopeprobe-unread", { registerOnly: sha("scope-probe-unread") });

  /* THE MISS. A term that is in neither document, over a scope the OTHER arm
     puts two documents in. Driven END TO END through `op=meaningrows&rows=
     passage` and never asserted at the store, because `op=invitelook` shipped
     with a ReferenceError while 1,276 assertions passed. */
  const miss = await rows(`rows=passage&q=${encodeURIComponent(
    "passage:zzzznotaword text:scopeprobe")}`);
  /* THE INDEPENDENT COUNT: the same non-text arm at BUNDLE grain through
     op=search, which does not go anywhere near `meaning()`. Deriving the
     expected 2 from the envelope itself would be the equality that costs
     nothing to produce. */
  const scopeIds = await ids("text:scopeprobe");

  t("S10 fixture: the other arm really does put exactly two documents in scope, "
    + "counted at BUNDLE grain through a different op",
    scopeIds.length, 2);
  t("THE FALSE ZERO IS GONE: a passage MISS over that scope counts the documents the "
    + "OTHER arms put in scope, rather than collapsing to the arm's own empty result",
    [miss.total, miss.scope.documents], [0, scopeIds.length]);
  /* THE ASSERTION THE DELEGATION NAMED, and the one a liar cannot dodge: the
     two halves of ONE envelope must mean the same thing by *in scope*. The
     tally is minted by the `axis` statement, which this item did not move. */
  t("...and `scope.documents` AGREES WITH `captures_counted` about that same scope — "
    + "the two halves of one envelope no longer mean different things by *in scope*",
    miss.scope.documents, miss.scope.captures_counted);
  /* BRANCH ONE OF THE TWO THAT WERE UNREACHABLE: searched, something WAS
     searchable, nothing matched. */
  t("BRANCH REACHED (1/2) — the honest final branch: the answer names how many captures "
    + "were searchable and says the absence covers only the part of the record that was read",
    [/no document was in scope/.test(miss.says), /searchable capture\(s\) in scope/.test(miss.says)],
    [false, true]);
  t("...and it names the UNREAD remainder rather than letting the searched part speak for the whole",
    /have not been read at passage grain/.test(miss.says), true);

  /* BRANCH TWO: documents ARE in scope and NOT ONE of them was searchable. Only
     the never-read bundle, selected by its own token. */
  const blind = await rows(`rows=passage&q=${encodeURIComponent(
    "passage:zzzznotaword text:9206")}`);
  t("BRANCH REACHED (2/2) — NOTHING IN SCOPE WAS SEARCHABLE: a document IS in scope and "
    + "not one capture of it has been read, and the answer says the next move is to READ them",
    [blind.scope.documents >= 1, /NOTHING IN SCOPE WAS SEARCHABLE/.test(blind.says),
     /next\s+move is to read them/.test(blind.says)],
    [true, true, true]);
  t("...and that is a DIFFERENT sentence from the searched-and-empty one, which is the whole "
    + "point: three different empties, three different next moves",
    blind.says === miss.says, false);

  /* OVER-STRICTNESS, AND IT IS THE HALF THAT MATTERS MOST: this item narrows a
     FALSE zero and must not remove the TRUE one. A query whose OTHER arms
     select no document at all must STILL report `documents: 0` and must STILL
     publish the empty-DOCUMENT-level sentence. Without this arm the cheapest
     way to pass everything above is to stop counting zero at all. */
  const trueZero = await rows(`rows=passage&q=${encodeURIComponent(
    "passage:zzzznotaword type:nosuchtype")}`);
  t("THE TRUE ZERO SURVIVES: a scope whose other arms select NO document still reports "
    + "`documents: 0` and still says so — this narrows a false zero and does not remove the true one",
    [trueZero.scope.documents, /empty DOCUMENT level/.test(trueZero.says)], [0, true]);

  /* THE THREE EMPTIES, DISTINGUISHABLE BY `says` ALONE — the second assertion
     the delegation named, and the one `civicos-ui/test/passage-surface.test.mjs`
     was reduced to REPORTING rather than asserting. */
  t("THE THREE EMPTIES ARE DISTINGUISHABLE BY `says` ALONE, which is what the surface "
    + "renders verbatim and what UI-62's suite could only REPORT on before this item",
    new Set([miss.says, blind.says, trueZero.says]).size, 3);

  /* THE EQUALITY THAT COST NOTHING, NOW A MEASUREMENT. Against the unstripped
     scope every document in scope held a matching row by construction, so
     `documents_with_rows === documents` always and the second count was
     evidence of nothing. On a HIT over a wider scope the two must now differ. */
  const hit = await rows(`rows=passage&q=${encodeURIComponent(
    `passage:${ONLY_IN_PAGE} type:information`)}`);
  t("`documents_with_rows` is a MEASUREMENT rather than a tautology now: on a hit over the "
    + "whole corpus it is SMALLER than the documents in scope, which it could never be before",
    [hit.total >= 1, hit.scope.documents_with_rows < hit.scope.documents], [true, true]);
  t("...and the three document counts still agree with each other arithmetically",
    hit.scope.documents_without_rows,
    hit.scope.documents - hit.scope.documents_with_rows);

  /* THE PLAN-LEVEL TRIPWIRE, the twin of S2's assertion for the `axis`
     statement. If a later edit puts this arm's own text filter back into the
     `levels` scope, this fails at COMPILE time and names the cause, rather than
     surfacing four hundred lines away as a member reading a false absence. */
  const lp = compile({ q: "passage:water type:information", viewer: "member:MEM-1", rows: "passage" });
  t("section 4.4's *OTHER arms* now binds the `levels` statement too: its scope does NOT "
    + "carry this arm's own text filter, while a NON-text arm of the same query DOES survive",
    [lp.statements.meaning({ mode: "levels" }).sql.includes("capture_text_fts MATCH"),
     lp.statements.meaning({ mode: "levels" }).sql.includes("object_type = ?")],
    [false, true]);
  /* AND `axis` IS UNTOUCHED, BYTE FOR BYTE. This row corrects `levels` and moves
     nothing else, so the statement REC-92 shipped must compile identically. */
  t("...and the `axis` statement is byte-identical to the `levels` one in the scope it builds — "
    + "the two now agree by CONSTRUCTION and not by two authors happening to write the same thing",
    lp.statements.meaning({ mode: "levels" }).sql.split("\nSELECT")[0],
    lp.statements.meaning({ mode: "axis" }).sql.split("\nSELECT")[0]);
}

} catch (e) {
  /* A `TypeError` inside an assertion goes through NO assertion at all and ends
     the module while the tally reads clean. This catch is what stops that
     reading as a pass, and the foot below reports a missing tally as -1. */
  fail++;
  console.log(`  FAIL  the suite threw before reaching its foot: ${e && e.stack ? e.stack : e}`);
} finally {
  await mf.dispose();
}

/* THE FOOT IS NAMED, so `nc-rec92.mjs` can tell a suite that finished from one
   that died before reaching its own tally — a TypeError inside an assertion goes
   through NO assertion at all and ends the module while the count reads clean.
   A missing foot is reported as -1 by the driver and never as 0. */
console.log(`\npassage-arm: ${pass} pass, ${fail} fail`);
/* `process.exit(fail ? 1 : 0)` and NOT `exitCode`, which `hygiene.test.mjs`
   refuses BY NAME: a suite that sets `exitCode` and returns can be kept alive by
   a straggling handle and exit on something other than its own result. The
   dispose above has already run, and `stdio.mjs` (D-282) is what stops the exit
   discarding this suite's own output. */
process.exit(fail ? 1 : 0);
