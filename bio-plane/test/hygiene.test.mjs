/* NEGATIVE CONTROL: (run 2026-07-31) remove the `.dispose()` calls from a scanned suite (scheduler.test.mjs, temporarily) so a Miniflare is built but never shut down -> 1 assertion fails ("scheduler.test.mjs disposes all 1 of its Miniflare instances"); restored, 144 pass. (An unescaped backtick in setup.mjs's SETUP_HTML template is the other subject this suite guards; the dispose scan is exercised here.) (run 2026-08-03, REC-27/D-137) remove the project_participants DELETEs from store.mjs's purge (both arms) -> 1 assertion fails naming it: "51 of 52 tables covered by purge or a stated exemption (uncovered: [\"project_participants\"])"; restored, 199 pass. (run 2026-08-04, M0-8/D-186) strip the `import "./sandbox.mjs"` line from a scanned suite (purge.test.mjs, temporarily) so it mints temp files with nothing owning them -> 1 assertion fails naming it ("purge.test.mjs imports test/sandbox.mjs"), 342 pass; restored byte-identical (sha256 f2ee2192…). The SUBJECT's own control is in scripts/battery.mjs, not here: comment out `process.on("exit", sweepSandbox)` in test/sandbox.mjs and the battery exits 1 with "LEAKING 84 miniflare sandbox(es) in 84 director(ies)" while all 95 suites still report green — which is the pre-fix state, and the reason the leak went unnoticed for weeks. (run 2026-08-04, REC-48) hand-type a capture grade letter back into any module of src/ — op=acquire's note, op=earnedbasis's ceiling sentence, or a new statement in a module nothing else guards -> the sweep FAILS naming the file, the line and the string, while the suite that OWNS that sentence stays green. The three arms are below IN THIS SAME DECLARATION, each RUN.
   (run 2026-08-04, M0-9) FOUR ARMS ON THE REGISTER ITSELF, each broken ALONE, every file restored BYTE-IDENTICALLY with sha256 compared before and after (scripts/control-register.mjs caeac36b…, scripts/coverage.mjs a5df1b87…, test/acquire.test.mjs e065c8e0…, test/hygiene.test.mjs f66974ac…, test/capture.test.mjs e71bf8b8…); whole = this suite 384 pass, register 98 of 98 at 246 arms. (a) HIDE A SUITE'S DECLARATION ENTIRELY — replace every control marker in acquire.test.mjs -> `node scripts/coverage.mjs --strict` run DIRECTLY with `$?` read unpiped EXITS 1, reports 97 of 98 and NAMES acquire.test.mjs under "No declared control"; arms 246 -> 241, exactly that suite's five. (b) TRUNCATE A MULTI-ARM BLOCK — cut this suite's own declaration from 8 lines to 5 by dropping arms (i), (ii) and (iii) -> the register reports this declaration at 6 arms instead of 9 and the total at 243 instead of 246, while --strict STAYS exit 0. That is the design and not a miss: arms are REPORTED and never gated, so the visible drop is the whole mechanism by which a shrinking control gets noticed. (c) PUT THE 60-LINE HEAD WINDOW BACK into scripts/control-register.mjs -> this suite 381 pass, 3 FAIL, and the three are exactly the window arms ("a control declared past line 60 is found", "...on the line it was actually written on", "a declaration straddling line 60 is read WHOLE"). (d) MAKE THE DETECTOR FIRST-LINE-ONLY -> this suite 377 pass, 7 FAIL, and the REAL-CORPUS arm bites alongside the fixtures: "the tree itself declares at least one MULTI-LINE control" reports []. The register's total falls to 234 arms, which is EXACTLY what the old detector reported over this same tree — so (d) reproduces the defect this item closed rather than merely resembling it. ONE PROPERTY WORTH KNOWING BEFORE THE NEXT SESSION RE-RUNS THESE: the register's arm TOTAL is a function of the declarations' own prose, so writing this record into a declaration moves the total upward — the four totals above are as measured at the moment each arm ran, and it is the DELTAS that the controls establish. Never compare an absolute total across two edits of the register's own text.
   SHAPE RESTORED BY M0-9 (2026-08-04), and it is the point rather than tidying. REC-48 wrote the arms as a continuation of this block, `coverage.mjs` then reported BOTH this suite and acquire.test.mjs as declaring NO CONTROL — its detector could not read past the marker's own line — and the arms were moved into a second comment the register never saw, so the register quoted a summary while the evidence sat outside it. The detector now reads the whole block (scripts/control-register.mjs) and is itself asserted at the foot of this suite; the arms are back where they belong. A declaration ends at its comment's close or at a blank line, so keep this paragraph unbroken and it stays one declaration.
   REC-48's THREE ARMS, in full:
   (run 2026-08-04, REC-48) THE SWEEP THAT SAYS NO SURFACE SPELLS A CAPTURE GRADE LETTER, three arms, each broken ALONE, every file restored BYTE-IDENTICALLY with sha256 compared before and after (src/index.mjs 16cf4e2f..., src/store.mjs 7c1ed3aa..., src/cdx.mjs a9e5912c..., checks/bio-checks.mjs d8da7b9d...); whole = 369 pass. Each arm ALSO reports what the suite that OWNS the mutated sentence did, because that contrast is the point.
   (i) THE THIRD STATEMENT PUT BACK — replace `note: ACQUIRE_GRADE_NOTE,` in src/index.mjs with the sentence hand-typed -> 367 pass, 2 FAIL, detector (A) and detector (B) both naming `index.mjs:1822 "Grade B"` and `"Grade A"`, WHILE acquire.test.mjs STAYS 79/79 GREEN. A copy identical to the composition satisfies every behavioural and wire assertion at zero cost; only this sweep can see it, which is why it exists one altitude above the three suites that own the sentences.
   (ii) THE FOURTH STATEMENT PUT BACK — hand-type `Grade A` into op=earnedbasis's `ceiling:` sentence in src/store.mjs -> 367 pass, 2 FAIL naming `store.mjs:5191 "Grade A"`, WHILE earnedbasis.test.mjs STAYS 54/54 GREEN. Same shape on the sentence REC-48's own scope had not counted, which is how it was found.
   (iii) A FIFTH STATEMENT, WRITTEN LOWERCASE, IN A MODULE NOTHING ELSE GUARDS — append `export const __FIFTH = "a replay capture is grade b: bytes as the archive served them.";` to src/cdx.mjs -> 368 pass, 1 FAIL, and it is detector (B) alone: `cdx.mjs:121 "grade b"`. DETECTOR (A) IS SILENT. That is the arm that earns (B) its existence rather than arguing for it — (A) matches the doctrine's capitalised term and a new statement need not use it. Ran under the ceiling-moved-to-C arm too, where (B) additionally reports `store.mjs:4587 "grade C"`: predicted in the block's own comment, and correct rather than noise — a tree in which one letter carries two doctrines has become ambiguous to a reader. */
/* Suite hygiene: the guard against a battery that wastes hours.
 *
 * Negative-control detail: remove the `.dispose()` calls from a scanned suite (scheduler.test.mjs, temporarily) so a Miniflare is built but never shut down -> 1 assertion fails ("scheduler.test.mjs disposes all 1 of its Miniflare instances"); restored, 144 pass. (An unescaped backtick in setup.mjs's SETUP_HTML template is the other subject this suite guards; the dispose scan is exercised here.)
 * (run 2026-08-03, REC-27/D-137) remove the project_participants DELETEs from store.mjs's purge (both arms) -> 1 assertion fails naming it: "51 of 52 tables covered by purge or a stated exemption (uncovered: [\"project_participants\"])"; restored, 199 pass.
 *
 * Miniflare runs a real workerd child process. A suite that builds one and
 * never disposes it finishes its assertions in about a second, prints its
 * result, and then hangs until something kills it. Nothing fails, nothing
 * is reported, and the only symptom is that the battery takes minutes
 * instead of seconds. That defect shipped in three suites written on July
 * 24, 2026 and cost roughly 150 seconds per suite per run before anyone
 * measured it rather than assuming.
 *
 * The rules below are the two that make a hang impossible:
 *   1. Every Miniflare a suite constructs, it disposes.
 *   2. Every suite ends by exiting on its own result, so a lingering
 *      handle can never turn a green run into a hang.
 *
 * This suite reads its siblings as text on purpose. It is cheap, it needs
 * no runtime, and it catches the mistake at the moment it is made rather
 * than the next time somebody wonders why the battery is slow.
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
/* REC-48: the capture rule's two letters, from the enforcement point that
   refuses a leg claiming more than the ceiling. This suite states them no more
   than the plane does — the sweep below is narrowed BY the rule, not beside it. */
import { EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE } from "../checks/bio-checks.mjs";
/* M0-9: the negative-control register's detector, imported from the instrument
   itself rather than reimplemented here — a second copy would agree with the
   first at zero cost and prove nothing about what coverage.mjs actually reads. */
import { readControl, CONTROL_MARKER } from "../scripts/control-register.mjs";

const DIR = fileURLToPath(new URL(".", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const suites = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs") && f !== "hygiene.test.mjs");
t("there are suites to check", suites.length > 0, true);

console.log("\n--- every workerd instance is shut down ---");
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  const built = (src.match(/new Miniflare\(/g) || []).length;
  if (!built) continue;
  const disposed = (src.match(/\.dispose\(\)/g) || []).length;
  t(`${f} disposes all ${built} of its Miniflare instances`, disposed >= built, true);
}

console.log("\n--- every suite ends on its own result ---");
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  const tail = src.slice(-400);
  t(`${f} exits deterministically`, /process\.exit\((?!1\))/.test(tail) || /process\.exit\(fail/.test(tail), true);
}

/* ---- every suite that makes temp files owns a sandbox that outlives it ------
 * D-186. The rule above ("every suite ends on its own result") is what MAKES
 * this necessary rather than being in tension with it: a suite ends
 * `await mf.dispose(); process.exit(…)`, and miniflare's dispose() disarms its
 * own synchronous exit hook and then starts removing the sandbox WITHOUT
 * awaiting it — so process.exit() beats the removal and the directory survives.
 * 23,263 of them accumulated in days and filled the disk to zero.
 *
 * `test/sandbox.mjs` fixes it by owning the ground: it points $TMPDIR at one
 * directory and removes that synchronously on exit. A suite gets the guarantee
 * by importing it, and that is the whole contract — which is exactly the kind of
 * requirement a hand-kept list falls behind (D-93's chain of 38 files while the
 * directory held 41). So the list is derived from the source instead: build a
 * Miniflare or mkdtemp, and this assertion requires the import. */
console.log("\n--- every suite that makes temp files owns a sandbox ---");
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  if (!/new Miniflare\(|mkdtempSync\(/.test(src)) continue;
  t(`${f} imports test/sandbox.mjs`, /^import ["']\.\/sandbox\.mjs["'];/m.test(src), true);
}


/* ---- the generated page cannot be broken by its own comments ----
 * setup.mjs is one enormous template literal. An unescaped backtick inside it
 * TERMINATES the literal, and a ${ starts an interpolation, so a comment
 * written in ordinary prose can silently destroy the module or the served
 * script. This has now happened twice: the 0.3.8 hang, where escapes were eaten
 * and the browser received a dead script, and again on 2026-07-24, where a
 * comment quoting two field names in backticks made the module unparseable.
 *
 * Both were found by accident. This finds them on purpose.
 */
console.log("\n--- the served page template is intact ---");
{
  const src = readFileSync(join(DIR, "..", "src", "setup.mjs"), "utf8");
  const open = src.indexOf("export const SETUP_HTML = `");
  t("setup.mjs still exports one template literal", open > -1, true);
  const body = src.slice(open + "export const SETUP_HTML = `".length, src.lastIndexOf("`;"));
  let ticks = 0, interps = 0, i = 0;
  while (i < body.length) {
    if (body[i] === "\\") { i += 2; continue; }
    if (body[i] === "`") ticks++;
    if (body[i] === "$" && body[i + 1] === "{") interps++;
    i += 1;
  }
  t("no unescaped backtick inside it", ticks, 0);
  /* Interpolations are legitimate: the page injects the catalog's tables. They
     are counted so a surprising jump is visible in a diff rather than silent. */
  t("interpolations are few and deliberate", interps <= 4, true);

  /* The strongest check available without a browser: the module loads, and the
     script it serves parses as JavaScript. */
  let loaded = null;
  try { loaded = (await import("../src/setup.mjs")).SETUP_HTML; } catch (e) {
    console.log("    load error:", e.message);
  }
  t("the module loads", typeof loaded, "string");
  if (typeof loaded === "string") {
    const script = loaded.slice(loaded.lastIndexOf("<script>") + 8, loaded.lastIndexOf("</script>"));
    let parses = true;
    try { new Function(script); } catch (e) { parses = false; console.log("    parse error:", e.message); }
    t("the script it serves parses", parses, true);
  }
}

/* schema.mjs is the same shape and met the same fate on 2026-07-30: a comment
 * quoting a column name in backticks terminated the SCHEMA literal, node
 * --check still passed because the stray pair happened to re-balance, and only
 * miniflare's parser refused it. Same class, third strike, so the guard covers
 * it now. SQL comments quote nothing in backticks. */
console.log("\n--- the schema template is intact ---");
{
  const src = readFileSync(join(DIR, "..", "src", "schema.mjs"), "utf8");
  const open = src.indexOf("export const SCHEMA = `");
  t("schema.mjs still exports one template literal", open > -1, true);
  const body = src.slice(open + "export const SCHEMA = `".length, src.lastIndexOf("`;"));
  let ticks = 0, interps = 0, i = 0;
  while (i < body.length) {
    if (body[i] === "\\") { i += 2; continue; }
    if (body[i] === "`") ticks++;
    if (body[i] === "$" && body[i + 1] === "{") interps++;
    i += 1;
  }
  t("no unescaped backtick inside it", ticks, 0);
  t("and no interpolation at all: the schema is static text", interps, 0);
  let loaded = null;
  try { loaded = (await import("../src/schema.mjs")).SCHEMA; } catch (e) {
    console.log("    load error:", e.message);
  }
  t("the module loads", typeof loaded, "string");
  t("and the literal ends where the file says it does", typeof loaded === "string" && loaded.trimEnd().endsWith(");"), true);
}

/* D-106. The installer embedded 0.35.0 while the plane ran 0.48.0 for thirteen
   releases. `newgroup/scripts/embed-release.mjs` now refuses on a mismatch, but
   that refusal fires when somebody builds the INSTALLER, which may be weeks
   after the drift was introduced and in a different thread. This fires at the
   moment the drift is created: whoever bumps package.json to cut a release runs
   this suite, and a wrangler.jsonc left behind fails here immediately.

   Two checks in two places for one invariant is not duplication. The embed
   refusal is the one that cannot be bypassed; this one is the one that is
   cheap and early. */
console.log("\n--- the version sources agree (D-106) ---");
{
  const root = fileURLToPath(new URL("..", import.meta.url));
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const declared = /"VERSION":\s*"([^"]*)"/.exec(readFileSync(join(root, "wrangler.jsonc"), "utf8"));
  t("package.json declares a semver version",
    typeof pkg.version === "string" && /^\d+\.\d+\.\d+/.test(pkg.version), true);
  t("wrangler.jsonc declares a VERSION var", !!declared, true);
  t(`wrangler.jsonc VERSION equals package.json (${pkg.version}), the authority`,
    declared ? declared[1] : null, pkg.version);
}

/* D-112. The archive leg of a provenance chain must be built by the call that
   fetched the CDX record, never handed in by a caller: a chain hop a caller can
   supply is a chain hop a caller can invent, and the entire value of a disclosed
   transitive-trust chain is that the disclosure is ours. This is a SOURCE check
   because it is a property of what the code may read, and a runtime test can
   only ever show that one particular forged request was ignored. */
console.log("\n--- no caller-supplied provenance (D-112) ---");
{
  const idx = readFileSync(join(fileURLToPath(new URL("../src", import.meta.url)), "index.mjs"), "utf8");
  const reads = (re) => (idx.match(re) || []).length;
  t("nothing reads a documentAddress off the request body",
    reads(/body\??\.\s*documentAddress/g), 0);
  t("nothing reads a provenance hop or chain off the request body",
    reads(/body\??\.\s*(provenance_chain|provenanceHop|archiveHop|hop)\b/g), 0);
  t("nothing reads a capture grade off the request body",
    reads(/body\??\.\s*grade\b/g), 0);
  t("the archive hop is built from archiveSelect's own result",
    /archiveHopRecorded = sel\.hop/.test(idx), true);
  t("and the document address comes from the CDX record, not the request",
    /documentAddress = via === "archive\.org" && archiveAddress/.test(idx), true);
}

/* D-113 as a CLASS. op=purge's whole-store branch clears the corpus and every
   table DERIVED from it, and that list is maintained by hand. Nothing failed
   when a new derived table was added to schema.mjs and forgotten: D-98's tables
   were three releases old before anyone noticed, and only during a tidy-up. A
   whole-store purge that then reports scope "ALL" while leaving rows behind is
   worse than one that reports a narrower scope, because the caller believes the
   store is empty.

   This closes the class the same way the template checks above close theirs: at
   the moment the mistake is made. Every `CREATE TABLE` in schema.mjs AND every
   one written by hand in store.mjs's DO constructor (D-137: eight tables lived
   outside the schema literal and were invisible to this check for three
   releases) must be either cleared by the whole-store purge or named in the
   exemption allowlist below with a one-line reason. A new derived table added
   to EITHER file and not to purge fails here immediately.

   The exemptions are the tables a whole-store purge MUST NOT clear, each because
   it is not derived from the corpus: identity, auth, measured runtime capability,
   transient rate/governor state, inbound intake, or the deliberately-durable
   published projection. If you are adding a DERIVED table, it does not belong
   here; add it to purge. */
console.log("\n--- every table is purged or explicitly exempt (D-113 / D-137) ---");
{
  const schema = readFileSync(join(fileURLToPath(new URL("../src", import.meta.url)), "schema.mjs"), "utf8");
  const store = readFileSync(join(fileURLToPath(new URL("../src", import.meta.url)), "store.mjs"), "utf8");

  const schemaTables = [...schema.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/g)].map((m) => m[1]);
  t("schema.mjs declares tables to check", schemaTables.length > 0, true);

  /* D-137. Eight tables are created BY HAND in the DO constructor rather than in
     the schema literal, so a check that read only schema.mjs had a blind spot
     the size of eight tables — four of them neither purged nor exempt, and one
     (project_participants) keyed on a bundle id, the exact D-113 silent-leftover
     in a table the D-113 check could not see. Closing a class by parsing one
     file closes it only for that file, so the check now parses BOTH. The name is
     anchored to the opening paren (or USING, for the FTS5 virtual table) so the
     PROSE "CREATE TABLE IF NOT EXISTS does nothing to a table that already
     exists" in a constructor comment cannot mint a phantom table — D-137's own
     first enumeration listed a table named "does" for exactly that reason. */
  const storeTables = [...new Set(
    [...store.matchAll(/CREATE (?:VIRTUAL )?TABLE IF NOT EXISTS\s+(\w+)\s*(?:\(|USING\s)/g)].map((m) => m[1]))];
  t("store.mjs's hand-created tables are seen too (D-137)", storeTables.length >= 8, true);
  const allTables = [...new Set([...schemaTables, ...storeTables])];

  /* What the WHOLE-STORE purge clears. Sliced from the purge method's source so
     the check reads the real deletion list rather than a copy of it: the TABLES
     array it deletes WHERE bundle_id IN both branches, plus every `DELETE FROM`
     in the purge method (the per-bundle arm's project_id-keyed DELETEs included,
     since those tables clear in both arms). */
  const pStart = store.indexOf("purge({ bundleId");
  const pEnd = store.indexOf("---- credentials ----", pStart);
  t("the purge method is locatable in store.mjs", pStart > -1 && pEnd > pStart, true);
  const purgeSrc = store.slice(pStart, pEnd);
  const tablesArr = /const TABLES\s*=\s*\[([^\]]*)\]/.exec(purgeSrc);
  const fromArray = tablesArr ? [...tablesArr[1].matchAll(/"(\w+)"/g)].map((m) => m[1]) : [];
  const fromDeletes = [...purgeSrc.matchAll(/DELETE FROM\s+(\w+)/g)].map((m) => m[1]);
  const purged = new Set([...fromArray, ...fromDeletes]);
  t("purge clears a non-trivial set of tables", purged.size >= 10, true);

  /* Tables a whole-store purge MUST NOT clear. Each is not derived from the
     corpus; the reason is stated so the exemption can be audited rather than
     trusted. */
  const EXEMPT = {
    seq:                  "monotonic id counter; must survive so allocid never reissues an identifier (see purge comment)",
    credentials:          "operator/member auth; a data purge must not delete logins and lock the instance out",
    sessions:             "bearer login sessions; auth state, not corpus-derived",
    bootstrap:            "one-row claim state; whether the instance has been claimed, not corpus data",
    members:              "the roster; membership is identity, not derived from captured documents",
    signers:              "registered signing keys; identity, not corpus-derived",
    /* REC-14 / DEC-17. The GROUP's declared default required strength: a
       standing declaration about the standard the group holds its own work to,
       authored before the work and dated, exactly like the roster and the
       signing keys beside it. It is not derived from any captured document and
       no bundle_id appears in it, so a whole-store purge that cleared it would
       silently lower the bar on everything published afterwards. A project's
       OWN bar is not here at all: it is authored frontmatter on the project's
       bundle.md and is purged with that bundle, which is correct — the project
       is gone, and so is the standard it set for itself. */
    group_strength_bar:   "the group's declared default required evidentiary strength (DEC-17); a standing governance declaration about the group's own work, authored and dated like the roster, not derived from any document",
    published_bundles:    "public ratified projection; kept verifiable forever by doctrine, not torn down with the working store",
    published_shas:       "append-only published hashes; a hash once published stays verifiable forever (schema doctrine)",
    /* REC-44 / DEC-44, and the exemption is the SAME judgement its two siblings
       above already carry rather than a new one. published_cases holds what
       nothing else holds — the authored scope, the completeness assertion and
       the container's manifest for each edition of each published case — and
       published_case_members holds the declared roster, which is the only thing
       that can say a case edition was INCOMPLETE (published_bundles holds the
       ratified subset and cannot). Both are the published projection, so a
       purge of the working corpus must leave them standing for the same reason
       it leaves published_bundles standing: a case once published answers
       forever. published_edges is the counter-example that keeps this honest —
       it IS purged, because every row of it is recomputable from bytes that
       answer forever, and neither of these is. */
    published_cases:      "published case projection (DEC-44): the authored scope, the completeness assertion and the container manifest per case per edition; nothing else holds them, and a case once published answers forever",
    published_case_members: "the DECLARED case->findings roster per edition, from the members' own signed bytes; it is what says a case edition is incomplete, which published_bundles (the ratified subset) cannot",
    inbox:                "quarantined public intake; inbound submissions awaiting review, explicitly not the record and not corpus-derived",
    knock_rate:           "fixed-window knock rate accounting; transient, self-pruning as windows pass",
    capture_limits:       "measured per-runtime subrequest ceiling; a capability fact, relearned by being refused, not corpus-derived",
    runtime_observations: "measured CPU cost; a capability fact, not corpus-derived",
    cpu_probe:            "stepped CPU-probe checkpoints; transient instrumentation, not corpus-derived",
    host_governor:        "per-host token-bucket governor state; transient pacing, not corpus-derived",
    /* The three DO-constructor tables a purge must not touch (D-137). The other
       five hand-created tables are PURGED: bundles_fts, selections and
       selection_items always were, and project_participants / project_owner_votes
       are keyed on project_id — a bundle id — so REC-27 added them to both arms. */
    member_expertise:     "roster state: an append-only event log of declared and confirmed expertise per member; identity like members, not corpus-derived (D-137)",
    admin_votes:          "administrator governance record, append-only by doctrine so an ejection can be audited by the people it was done to; membership, not corpus-derived (D-137)",
    export_log:           "the record that an export happened, kept so an export can never happen SILENTLY; a purge that erased the evidence of a pre-purge export would defeat it (D-137)",
  };

  /* An exemption for a table that IS purged, or for a table that does not exist,
     is stale and misleading; catch it so the allowlist stays honest. */
  for (const name of Object.keys(EXEMPT)) {
    t(`exemption "${name}" names a real table`, allTables.includes(name), true);
    t(`exemption "${name}" is not also purged (a stale exemption)`, purged.has(name), false);
  }

  /* The load-bearing assertion: nothing falls through the crack, in EITHER file. */
  const uncovered = allTables.filter((tbl) => !purged.has(tbl) && !(tbl in EXEMPT));
  t(`${allTables.length - uncovered.length} of ${allTables.length} tables covered by purge or a stated exemption (uncovered: ${JSON.stringify(uncovered)})`,
    uncovered, []);
}

/* D-131. A single raw NUL in store.mjs — a string separator written as the byte
   rather than the escape — made ugrep-backed `grep` classify the repo's largest
   source file as BINARY, so every plain grep against it returned exit 1, no
   output, no warning: a false negative indistinguishable from "no matches",
   which nearly got a correct research finding discarded. Same defect class as
   the unescaped-backtick guards above — every test passes while a verification
   instrument silently stops verifying — so it gets the same treatment: caught
   at the moment the byte is written. Tab, LF and CR are the only control bytes
   a source file may carry. */
console.log("\n--- no source file carries a raw control byte (D-131) ---");
{
  const srcDir = join(DIR, "..", "src");
  for (const f of readdirSync(srcDir).filter((n) => n.endsWith(".mjs"))) {
    const buf = readFileSync(join(srcDir, f));
    let badAt = -1;
    for (let i = 0; i < buf.length; i++) {
      const b = buf[i];
      if (b < 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d) { badAt = i; break; }
    }
    t(`${f} carries no raw control byte`, badAt, -1);
  }
}

/* REC-48 (2026-08-04). NO SURFACE SPELLS A CAPTURE GRADE LETTER.
 *
 * The capture-grade doctrine — what a direct capture by this instance earns,
 * and which letter above it this plane cannot produce — was written out in its
 * own letters in FOUR places: the surface's `ATTEST_YIELDS_GRADE` (REC-43/DEC-39
 * moved it to a composed publication), `op=acquire`'s `note`, `op=earnedbasis`'s
 * `ceiling` sentence, and the one enforcement point that is allowed to hold the
 * value. Each copy agreed with the rule ON THE DAY IT WAS TYPED and would go on
 * agreeing at zero cost until the day the rule moved, which is the one day the
 * agreement mattered. REC-43 measured exactly that: a hand-typed copy identical
 * to the composition left every behavioural and wire assertion in the
 * affordances suite green, and only a structural pin could see it.
 *
 * So this is the structural pin, one altitude up from the three suites that own
 * the individual sentences: the LETTER may not appear beside the word in any
 * module of the plane. A fifth statement is then not something a reviewer has to
 * notice — it fails here, by file and by line, at the moment it is written.
 *
 * WHAT IT SWEEPS AND WHAT IT DOES NOT. Comments are excluded, in the three
 * comment forms this tree writes: JS block comments (the overwhelming majority
 * here), JS line comments and the `--` lines inside schema.mjs's SQL literal.
 * A comment reaches no reader — it cannot overclaim to a member, which is the
 * subject — and several comments must go on quoting the doctrine and the old
 * wording verbatim in order to explain why the letters are composed at all;
 * excluding them is the difference between a rule and an exemption list. The
 * line-comment strips are anchored to the START of a line ON PURPOSE: an
 * unanchored `//` strip would eat everything after `https:` inside a string
 * literal, which would make this sweep quietly reach LESS than it claims, and a
 * sweep that reaches less than it claims is the failure UI-30 found in an
 * instrument and REC-49 found in an arm that first fired zero.
 *
 * TWO DETECTORS, AND THE SECOND EXISTS BECAUSE THE FIRST HAS A LOOPHOLE.
 * (A) `Grade <LETTER>` with a capital G — the doctrine's own capitalised term,
 * which is how every capture-grade statement in this tree has ever written it.
 * That is the sweep REC-48's accepts-when names, and it must read ZERO.
 * (B) the same match CASE-INSENSITIVELY, restricted to the two letters the
 * capture rule actually owns — `EARNED_CAPTURE_CEILING` and the derived
 * `UNREACHABLE_CAPTURE_GRADE`, imported, never typed here either. (A) alone
 * would let a new statement through as lowercase `grade b`; (B) closes that for
 * exactly the letters that can overclaim, and takes its subject FROM the rule so
 * it cannot drift from it.
 *
 * WHY (B) IS NOT SIMPLY (A) CASE-INSENSITIVE, measured rather than assumed. Five
 * sentences in store.mjs spell a lowercase connection-axis letter — "section
 * 8.1's grade C", "grade D is recorded testimony", "testimony at grade D". Those
 * are a DIFFERENT doctrine on a different axis, they have no exported constant
 * to compose from (checkEarnedLeg types testimony's 'D' at the enforcement point
 * itself), and giving them one is a doctrine act rather than a sweep. They are
 * therefore OUT OF THIS SWEEP'S SUBJECT and are NOT exempted from it — a stated
 * limit rather than an allowlist, and it is routed rather than buried. The same
 * block also shows why no letter-near-the-word rule can ever be complete for all
 * axes: it says "no leg of it earns an A/B/C connection grade", with the letters
 * on the wrong side of the word, and matching prose in both directions is
 * unbounded. The capture axis CAN be complete, because it owns exactly two
 * letters and both are exported.
 * One consequence of (B) taking its letters from the rule, stated so it is not
 * read later as a defect: if the capture ceiling were ever MOVED onto a letter
 * the connection-axis prose also spells, (B) fires on that prose. That is the
 * correct answer, not noise — a tree where one letter means two doctrines has
 * become ambiguous to a reader and somebody should look at it.
 *
 * ITS OWN REACH IS ASSERTED BELOW FOUR WAYS, because a walk that covers nothing
 * passes everything: the file list is non-trivial and names the modules that
 * carry the doctrine; the detector fires on a planted control IN EVERY FILE'S
 * OWN STRIPPED TEXT, so no file is silently skipped; the same detector over the
 * RAW sources DOES find matches, proving the walk reaches the very lines where
 * the doctrine is discussed and that only the comment strip stands between it
 * and a hit; and the two emitted doctrine SENTENCES survive the strip intact, so
 * the strip cannot have swallowed the region a spelled letter would appear in. */
console.log("\n--- no surface spells a capture grade letter (REC-48) ---");
{
  const srcDir = join(DIR, "..", "src");
  const files = readdirSync(srcDir).filter((n) => n.endsWith(".mjs")).sort();
  const raw = new Map(files.map((f) => [f, readFileSync(join(srcDir, f), "utf8")]));

  const uncomment = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, "")   /* JS block comment */
    .replace(/^[ \t]*\/\/.*$/gm, "")    /* JS line comment, ANCHORED — see above */
    .replace(/^[ \t]*--.*$/gm, "");     /* SQL line comment inside the schema literal */

  /* The word, then whitespace, then a lone capital letter. Deliberately wider
     than A-D: an invented "Grade E" is the same defect and must fail here too.
     `(?![A-Za-z0-9_])` keeps `#weakerGrade`, `instanceGrade` and "Grade states
     HOW it was matched" out of it — a letter that continues into a word is a
     word, not a grade. `only` narrows detector (B) to the rule's own letters. */
  const spelled = (text, { anyCase = false, only = null } = {}) => {
    const hits = [];
    const re = new RegExp("\\bGrade\\s+([A-Z])(?![A-Za-z0-9_])", anyCase ? "gi" : "g");
    let m;
    while ((m = re.exec(text)) !== null) {
      if (only && !only.includes(m[1].toUpperCase())) continue;
      hits.push({ line: text.slice(0, m.index).split("\n").length, what: m[0] });
    }
    return hits;
  };
  /* Taken from the enforcement point, never typed: this file states the rule's
     letters no more than the plane does. */
  const RULE_LETTERS = [EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE];

  /* REACH 1: the walk found the tree, and the modules that carry the doctrine
     are in it by name. A rename that moved one of them out would fail here
     rather than leaving this sweep quietly guarding a smaller tree. */
  t("the src walk reaches a whole tree, not a file or two", files.length >= 20, true);
  for (const named of ["affordances.mjs", "index.mjs", "store.mjs", "schema.mjs"])
    t(`the walk includes ${named}, which states or enforces the doctrine`, files.includes(named), true);
  t("every file walked was actually read", files.filter((f) => raw.get(f).length > 0).length, files.length);

  /* REACH 2: the detector fires, in EVERY file's own stripped text. Planting the
     control per file rather than once proves the per-file scan is executed —
     a loop that skipped a file would pass a single global control. It is
     measured as a DELTA against that file's own count, not against 1: an
     absolute count would conflate "the detector is deaf here" with "this file
     already has hits", which is the state every negative-control arm below puts
     one file into, and the reach assertion must go on saying only what it means. */
  const PLANT = '\nconst __reach = "Grade Z";\n';
  const deaf = files.filter((f) => {
    const stripped = uncomment(raw.get(f));
    return spelled(stripped + PLANT).length !== spelled(stripped).length + 1;
  });
  t(`the detector fires in all ${files.length} files' own stripped text (deaf: ${JSON.stringify(deaf)})`,
    deaf, []);

  /* REACH 3: over the RAW sources the same detector DOES match — so the walk
     reaches the very lines where the doctrine is written about, and the comment
     strip is the only thing between this sweep and a hit. If this ever goes to
     zero the sweep has stopped reading anything that mentions the subject, and
     its silence would mean nothing. */
  const rawHits = files.flatMap((f) => spelled(raw.get(f)).map((h) => `${f}:${h.line}`));
  t(`the same detector matches the doctrine's own prose in the raw sources (${rawHits.length} in ${new Set(rawHits.map((h) => h.split(":")[0])).size} files)`,
    rawHits.length >= 4 && new Set(rawHits.map((h) => h.split(":")[0])).size >= 2, true);

  /* REACH 4: the strip leaves the EMITTED doctrine sentences standing. These are
     the exact two strings a spelled letter would appear in, so if the stripper
     had swallowed them the sweep would be silent for the worst possible reason. */
  t("the strip leaves op=acquire's note in affordances.mjs standing",
    uncomment(raw.get("affordances.mjs")).includes("bytes as fetched, hashed at receipt"), true);
  t("the strip leaves op=earnedbasis's ceiling sentence in store.mjs standing",
    uncomment(raw.get("store.mjs")).includes("is not reachable on the capture axis at all"), true);

  /* REACH 5: the rule's own two letters are readable and distinct, so detector
     (B) is narrowed to something real. A `null` unreachable grade would make (B)
     silently look for one letter instead of two. */
  t("detector (B) takes two distinct letters from the enforced rule",
    [RULE_LETTERS.length, RULE_LETTERS.every((g) => /^[A-Z]$/.test(g || "")),
     EARNED_CAPTURE_CEILING !== UNREACHABLE_CAPTURE_GRADE],
    [2, true, true]);

  /* THE LOAD-BEARING ASSERTIONS. */
  const offendersA = files.flatMap((f) =>
    spelled(uncomment(raw.get(f))).map((h) => `${f}:${h.line} ${JSON.stringify(h.what)}`));
  t(`(A) no module of the plane spells "Grade <letter>" outside a comment (found: ${JSON.stringify(offendersA)})`,
    offendersA, []);

  const offendersB = files.flatMap((f) =>
    spelled(uncomment(raw.get(f)), { anyCase: true, only: RULE_LETTERS })
      .map((h) => `${f}:${h.line} ${JSON.stringify(h.what)}`));
  t(`(B) no module spells the capture rule's own letters (${RULE_LETTERS.join("/")}) beside "grade", in any case (found: ${JSON.stringify(offendersB)})`,
    offendersB, []);
}

/* ---- the negative-control REGISTER's own detector, asserted (M0-9) ----------
 * `scripts/coverage.mjs` is the instrument CONDUCT verifies every landing with,
 * and the register is the part of it that answers "which suites have actually
 * been controlled". It was believed rather than tested, and it was wrong in the
 * generous direction twice over: a declaration whose arms continued onto a second
 * line matched NOTHING and the suite read as declaring NO CONTROL (REC-48 hit
 * exactly this and got past it by moving its arms into a second comment the
 * register never saw), and a declaration that did match was recorded first line
 * only, so a five-arm control entered the register as one arm — fully green while
 * quoting a fraction of what it checked.
 *
 * This suite is the right altitude for it for the same reason the sweep above is:
 * it reads its siblings as text, needs no runtime, and sits one level above the
 * thing it measures. It is here rather than in a suite of its own deliberately —
 * a 99th suite would move the register's own denominator, and an instrument whose
 * test changes the number it reports is the worst kind to reason about.
 *
 * ITS OWN REACH IS ASSERTED, because a detector that finds nothing passes
 * everything (UI-30 in an instrument, REC-49's arm that first fired zero, and
 * REC-48's reach assertion that was WRONG when first written because it compared
 * a planted count to 1 instead of to a delta). Every arm below is either a DELTA
 * against the same source with one thing changed, or a read of the REAL corpus —
 * never an absolute count that a deaf detector could also satisfy. */
console.log("\n--- the negative-control register's own detector (M0-9) ---");
{
  const lines = (n, what) => Array(n).fill(what).join("\n");
  const arm = (k) => `   (${k}) break ${k} -> ${k} fails`;
  /* EVERY fixture builds its marker from the instrument's OWN exported constant
     and never as a literal. A literal here would put real declarations into THIS
     suite's source, and a register that reads its own test's fixtures is how a
     number quietly stops meaning what it says — the same class of accident this
     item exists to close. It also keeps the marker spelled in exactly one place. */
  const decl = (rest) => `${CONTROL_MARKER} ${rest}`;

  /* PAST THE OLD 60-LINE HEAD WINDOW, and the delta that proves it was read. */
  const deep = lines(200, "/* header prose */") + "\n/* " + decl("break X -> Y fails") + " */\n";
  const deepFound = readControl(deep);
  t("a control declared past line 60 is found", deepFound != null, true);
  t("...on the line it was actually written on", deepFound && deepFound.line > 60, true);
  t("...and the same source with its marker hidden reads as NO control (the delta)",
    readControl(deep.replaceAll(CONTROL_MARKER, "NEGATIVE CONTROL(hidden):")), null);

  /* STRADDLING line 60: the window used to record whatever fell inside it and
     call the suite controlled — a fragment, silently. */
  const straddle = lines(58, "/* x */")
    + "\n/* " + decl("three arms") + "\n" + ["a", "b", "c"].map(arm).join("\n") + " */\n";
  const straddled = readControl(straddle);
  t("a declaration straddling line 60 is read WHOLE, not truncated at the window",
    [straddled.arms, straddled.text.includes("(c) break c")], [3, true]);

  /* EVERY ARM. The marker line here states no arm at all, so a first-line-only
     detector reports 0 and this is not satisfiable by accident. The truncation is
     a DELTA between two blocks, never a comparison against 1. */
  const five = "/* " + decl("five arms, each RUN") + "\n" + ["a", "b", "c", "d", "e"].map(arm).join("\n") + " */\n";
  const two = "/* " + decl("five arms, each RUN") + "\n" + ["a", "b"].map(arm).join("\n") + " */\n";
  t("every arm of a five-arm block is counted, though the marker line states none",
    readControl(five).arms, 5);
  t("truncating that block to two arms drops the count by exactly the three removed",
    readControl(five).arms - readControl(two).arms, 3);

  /* WHERE A DECLARATION ENDS, asserted in BOTH directions: it must reach past the
     marker's own line, and it must NOT swallow the paragraph after it. One
     without the other is half an answer. */
  const withProse = "/* Header.\n *\n * " + decl("break X -> Y fails")
    + "\n *   (b) break Z -> W fails\n *\n * UNRELATED PARAGRAPH, not part of the control.\n */\n";
  const extent = readControl(withProse);
  t("a declaration inside a header reaches its continuation lines",
    extent.text.includes("break Z"), true);
  t("...and stops at the blank comment line, before unrelated prose",
    extent.text.includes("UNRELATED PARAGRAPH"), false);

  /* The other comment form, and its end. */
  const slashes = "// " + decl("break X -> Y fails") + "\n//   (b) break Z -> W fails\nconst after = 1;\n";
  t("a declaration written as a // run is read to the end of the run and no further",
    [readControl(slashes).arms, readControl(slashes).text.includes("const after")], [2, false]);

  /* NEVER THE SUM. Most suites state their control twice — prose in the header and
     the one-line register entry — and they are the same control; crediting both
     would be the generous direction wearing a different hat. */
  const twice = "/* " + decl("break X -> Y fails") + "\n   (b) break Z -> W fails */\n"
    + "/* " + decl("break X -> Y fails") + " */\n";
  t("a control stated twice is recorded once at its fullest, never summed",
    readControl(twice).arms, 2);

  /* ---- and now on the REAL corpus, which is what the register actually reads. */
  const registry = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs"))
    .map((f) => ({ f, c: readControl(readFileSync(join(DIR, f), "utf8")) }));
  const read = registry.filter((r) => r.c);

  t(`the register scan reaches the whole battery, not a file or two (${registry.length} suites)`,
    registry.length >= 90, true);

  /* THE DELTA ON REAL DATA: hide the marker in one real suite's source and that
     suite alone leaves the register. An absolute count would be satisfied by a
     detector that had stopped reading. */
  const victimSrc = readFileSync(join(DIR, "capture.test.mjs"), "utf8");
  t("the register reads capture.test.mjs's declaration out of its real source",
    readControl(victimSrc) != null, true);
  t("...and reads none once its marker is hidden, so the read above is a measurement",
    readControl(victimSrc.replaceAll(CONTROL_MARKER, "NEGATIVE CONTROL(hidden):")), null);

  /* The corpus exercises the two capabilities this detector was fixed to have.
     If either of these ever goes to zero, the fix is still in the code but nothing
     in the tree proves it works — which is how the workaround got in. */
  const arms = read.reduce((n, r) => n + r.c.arms, 0);
  const multiLine = read.filter((r) => r.c.lines > 1).map((r) => r.f);
  t(`the register reads more arms than suites (${arms} arms across ${read.length} registered suites), so it is not stopping at one per suite`,
    arms > read.length, true);
  t(`the tree itself declares at least one MULTI-LINE control, so the block read is exercised by the corpus and not only by fixtures (${JSON.stringify(multiLine)})`,
    multiLine.length > 0, true);
}

console.log(`\nhygiene: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
