/* NEGATIVE CONTROL: (run 2026-07-31) remove the `.dispose()` calls from a scanned suite (scheduler.test.mjs, temporarily) so a Miniflare is built but never shut down -> 1 assertion fails ("scheduler.test.mjs disposes all 1 of its Miniflare instances"); restored, 144 pass. (An unescaped backtick in setup.mjs's SETUP_HTML template is the other subject this suite guards; the dispose scan is exercised here.) (run 2026-08-03, REC-27/D-137) remove the project_participants DELETEs from store.mjs's purge (both arms) -> 1 assertion fails naming it: "51 of 52 tables covered by purge or a stated exemption (uncovered: [\"project_participants\"])"; restored, 199 pass. */
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
    published_bundles:    "public ratified projection; kept verifiable forever by doctrine, not torn down with the working store",
    published_shas:       "append-only published hashes; a hash once published stays verifiable forever (schema doctrine)",
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

console.log(`\nhygiene: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
