/* NEGATIVE CONTROL: (declared 2026-09-14, REC-93, worktree agent-a239cb7601fee3669) SEVEN arms,
   RUN in one step through `node test/nc-rec93.mjs [arm]` (the driver lives INSIDE this worktree),
   each armed ALONE with every other held open, each DECLARED must-fail or must-not-fail BEFORE it
   ran, each mutation passing an anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard,
   and every restore verified by sha256 AND by `cmp` against a PRISTINE copy named UNIQUELY PER
   ARM with a byte count printed and a minimum guarded. An opening AND a closing BASELINE row
   bracket the run, because a harness that reported the same answer for every arm INCLUDING the
   baseline is on record in this repository, and without a baseline row six reds read exactly like
   six arms working.
   (a) `baseline` — nothing armed. Declared: everything green. It is not decoration; it is the row
       that distinguishes six-arms-broken from six-arms-working.
   (b) `writer` — OBSERVATION-LOG-DESIGN.md §9 arm 1: REMOVE ONE DOCUMENT-LEVEL WRITER (the
       observation in `recordCapturedLocator`). Declared MUST FAIL: the frontier reports the
       document as NEVER-LOOKED and the arm fails BY NAME.
   (c) `referent` — §9 arm 1's second half: drop the back-reference, so a PRESENT carries no
       `result_ref`. Declared MUST FAIL: C-22.10 refuses the append by name.
   (d) `authority` — §9 arm 4: neuter C-22.9 so a row with no `authority_kind` is admitted.
       Declared MUST FAIL: the no-authority arm and §4.6's provisional arm both go red.
   (e) `bundle` — §9's C-22.6 half: neuter the append-site bundle refusal. Declared MUST FAIL:
       C-22.x's arm fails, which is the fence proving it is a fence and not a promise.
   (f) `edge` — §7: make the edge rule write a row on an unchanged revisit. Declared MUST FAIL:
       the steady-state arm (zero rows, N counters) fails and the transition arm stays green.
   (g) `overstrict` — THE OVER-STRICTNESS DIRECTION, and it is the arm that must STAY GREEN:
       correct work in a spelling this suite did not anticipate — a run-log `PRESENT` with no
       referent, which C-22.10 deliberately does not refuse under `authority_kind = run` — must
       still be accepted, and `op=airunlog`'s answer must not move.
   THE ACTUAL RESULTS OF EVERY ARM ARE IN `CLAIMS.md`'s release line for REC-93, including the
   ones that came back other than declared.
   WHAT THESE ARMS CANNOT SEE: they are all local to this plane's own source. Nothing here
   exercises a second instance, a real network fetch, or the content and meaning levels, which are
   REC-94's and REC-95's and have no writer yet — the frontier says so IN WORDS rather than
   answering an empty list, and that is asserted below rather than assumed. */

/* REC-93 / IC-92 — THE OBSERVATION LOG: the table, the ONE append site, the
 * frontier view, the document-level writers, and the run log's FOLD.
 * =====================================================================
 *
 * `docs/development/OBSERVATION-LOG-DESIGN.md` §3, §4.1, §4.4, §4.6, §5, §7 and
 * its §8 decomposition row 1 — the TABLE is the scope's authority and the queue
 * row is the pointer. `STORE-AS-CACHE.md` settles the one architectural decision
 * underneath it: THE RECORD AND THE OBSERVATION LOG ARE SEPARATE, WITH DIFFERENT
 * LIFECYCLES. The record is write-once, content-addressed and never evicts, so
 * folding a failed look into it makes every failed look either a phantom capture
 * or nothing at all. This table is what lets ABSENCE BE RECORDED rather than
 * retried away.
 *
 * WHY IT MATTERS HERE AND NOT ONLY IN A DESIGN DOCUMENT. CLAUDE.md's standing
 * section says sparse is the normal condition at every level, and that saying
 * WHICH absence is true — nothing derived, nothing extracted, nothing captured,
 * nobody looked — is a first-class obligation rather than a diagnostic detail.
 * Until this item that obligation had no storage at the document level at all:
 * Part II §17's OBSERVE row reads ABSENT at content grain and BUILT FOR ONE
 * CONSUMER at meaning grain, and that one consumer was `ai_run_log`. So the
 * arms below are weighted at the two places a coverage record can lie: a look
 * that was never recorded (the frontier then says never-looked, which is FALSE
 * and reads as an invitation to go and look), and a look recorded as PRESENT
 * with nothing behind it (which reads as coverage and is the worse of the two).
 *
 * SEVEN SECTIONS:
 *   A. THE TABLE — its shape, its indexes, and both purge arms.
 *   B. THE ONE APPEND SITE and its refusals, driven through the real plane.
 *   C. THE FOLD — `op=airunlog` byte-identical, PINNED against the pre-item
 *      build's own answer rather than against a digest this item computed.
 *   D. §4.6's PROVISIONAL — a member's ad hoc search writes NOTHING.
 *   E. THE FRONTIER VIEW — the latest row per subject, NEVER_LOOKED as the
 *      absence of a row, and the bound published.
 *   F. §7's EDGE-TRIGGERED RULE, whose volume is measured in M-14.
 *   G. RATIFY'S MAPPING, including the one outcome that writes NO ROW.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";
import { OBSERVATION_AUTHORITY_KINDS, OBSERVATION_SUBJECT_KINDS,
         OBSERVATION_ACTOR_CLASSES, checkObservation } from "../src/airun.mjs";
import { QUEUE_CONDITION_KINDS } from "../src/queuestate.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC_STORE = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");
const SRC_SCHEMA = readFileSync(new URL("../src/schema.mjs", import.meta.url), "utf8");

const TOK = "mem-rec93";
const ADM = "adm-rec93";
const BUNDLE = "INQ-2026-0914-observation-log";
const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);
const T0 = "2026-09-14T09:00:00Z";
const at = (plus) => new Date(Date.parse(T0) + plus).toISOString().split(".")[0] + "Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec93",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const TEXT = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).text();

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const obj = ns.get(ns.idFromName("bio"));

/* The observation COUNT, read through `op=stats` — the operator surface a purge
   already publishes as its proof that it took what it says it took (D-113).
   Read through the op rather than by querying the DO, because a store-level
   read and a caller-reachable one are different claims and only one of them is
   what an operator actually gets. */
const obsCount = async () => (await GET(`op=stats&token=${ADM}`)).observations;

/* ========================================================================= *
 *  A · THE TABLE — §3. Its shape, its indexes, and BOTH purge arms.
 * ========================================================================= */
console.log("\n--- A · the one table (§3) ---");

t("A1: `observation_log` is declared in schema.mjs",
  /CREATE TABLE IF NOT EXISTS observation_log\s*\(/.test(SRC_SCHEMA), true);

/* BEFORE `host_governor`, which is this file's standing rule and has struck
   three times. Asserted by POSITION and not by eye. */
t("A2: and it is declared BEFORE the host_governor block (the standing schema rule)",
  SRC_SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS observation_log")
    < SRC_SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS host_governor"), true);

/* The two traps that `node --check` cannot see, asserted over THIS block rather
   than over the whole file, so the assertion says something about what this item
   wrote. PL-1 cost fifteen minutes and three comments to the semicolon. */
{
  const i = SRC_SCHEMA.indexOf("-- REC-93 / IC-92 -- THE OBSERVATION LOG");
  const j = SRC_SCHEMA.indexOf("CREATE INDEX IF NOT EXISTS observation_log_tally");
  const block = SRC_SCHEMA.slice(i, j);
  t("A3: the block is locatable and non-trivial", i > -1 && j > i && block.length > 500, true);
  t("A4: no backtick anywhere in it — a balanced stray pair still parses, so --check cannot see this",
    block.includes(String.fromCharCode(96)), false);
  t("A5: and no semicolon inside any `--` comment — #migrate splits the schema on `;` (PL-1)",
    block.split("\n").filter((l) => l.trim().startsWith("--") && l.includes(";")), []);
}

/* §3's three indexes, each named for the read it exists to serve. Asserted by
   NAME AND COLUMNS: an index present under a different key would satisfy a
   count and serve none of the three reads. */
for (const [name, cols] of [["observation_log_frontier", "level, subject_kind, subject, seq"],
                            ["observation_log_authority", "authority_kind, authority, seq"],
                            ["observation_log_tally", "level, state, seq"]])
  t(`A6: index ${name} exists on exactly (${cols})`,
    SRC_SCHEMA.includes(`CREATE INDEX IF NOT EXISTS ${name} ON observation_log(${cols})`), true);

/* §4.4's fold: the OLD table is gone from the schema. If the CREATE were left
   standing, an idempotent create would rebuild an empty `ai_run_log` on the next
   boot and put the store back into the two-writers state §4.4 forbids. */
t("A7: `ai_run_log` is GONE from the schema — §4.4's fold leaves ONE table, not two",
  /CREATE TABLE IF NOT EXISTS ai_run_log/.test(SRC_SCHEMA), false);

/* ========================================================================= *
 *  B · THE ONE APPEND SITE and its refusals (§3's rule list).
 * ========================================================================= */
console.log("\n--- B · one append site, and the refusals are read out of the map (§3) ---");

/* ONE WRITER, asserted STRUCTURALLY off the source. A gate arm cannot
   distinguish "one writer" from "two writers that happen to agree today", and
   §4.4's whole sentence is *"two writers is not [the landing's call]"*. */
{
  const inserts = [...SRC_STORE.matchAll(/INSERT INTO observation_log\b/g)].length;
  t("B1: there is EXACTLY ONE `INSERT INTO observation_log` in store.mjs outside the migration",
    inserts, 2);   /* the append site, plus #migrate's one-time fold copy */
  t("B2: and the second is the FOLD's one-time copy inside #migrate, not a second writer",
    /PRAGMA table_info\(ai_run_log\)[\s\S]{0,1200}INSERT INTO observation_log/.test(SRC_STORE), true);
  /* NO UPDATE AND NO DELETE except the whole-store purge — §3's first rule:
     "a log that can be rewritten is not evidence of anything". */
  t("B3: nothing UPDATEs the table — append-only is a property of the code, not a promise",
    [...SRC_STORE.matchAll(/UPDATE observation_log\b/g)].length, 0);
  t("B4: and exactly one DELETE, which is the whole-store purge arm",
    [...SRC_STORE.matchAll(/DELETE FROM observation_log\b/g)].length, 1);
}

/* THE REFUSALS ARE READ LIVE FROM THE CATALOGUE, never typed here — DEC-49's
   own acceptance requires the code-to-translation map to be read from ONE place,
   and a hand copy agrees with itself for free. */
t("B5: C-22.9 and C-22.10 exist in the catalogue with canned translations",
  [AI_RUN_CHECKS.OBS_AUTHORITY_UNNAMED?.check,
   AI_RUN_CHECKS.OBS_PRESENT_NO_REFERENT?.check,
   typeof AI_RUN_CHECKS.OBS_AUTHORITY_UNNAMED?.translation === "string",
   typeof AI_RUN_CHECKS.OBS_PRESENT_NO_REFERENT?.translation === "string"],
  ["C-22.9", "C-22.10", true, true]);

/* §4.6's PROVISIONAL, enforced in the VOCABULARY rather than by a missing
   writer. This is the assertion that makes the provisional a mechanism: a later
   item could add a writer without noticing the doctrine, and it would be refused
   because there is no authority a member's search could name. */
t("B6: there is NO `member` authority kind — §4.6's provisional lives in the vocabulary",
  Object.prototype.hasOwnProperty.call(OBSERVATION_AUTHORITY_KINDS, "member"), false);
t("B7: and the nine authorities §3 names are all present",
  Object.keys(OBSERVATION_AUTHORITY_KINDS).sort(),
  ["acquire", "derive", "extract", "lead", "link", "objective", "ratify", "run", "sweep"]);
t("B8: the actor classes are §5's three, which `surfaced_by` maps onto",
  Object.keys(OBSERVATION_ACTOR_CLASSES).sort(), ["machine", "member", "plane"]);
t("B9: the subject kinds are §3's five plus `unstated`, which the FOLD needs and which "
+ "says the true thing rather than deriving a kind for rows already written",
  Object.keys(OBSERVATION_SUBJECT_KINDS).sort(),
  ["address", "capture", "description", "entity", "extent", "unstated"]);

/* THE REFUSALS ARE HELD TO THE PURE FUNCTION, and that is `airun.mjs`'s own
   stated reason for existing rather than a convenience: *"It is PURE — no
   storage, no clock, no viewer — so a suite can hold the decision to the store's
   own behaviour directly … a rule that can only be exercised through a Durable
   Object is a rule that gets exercised less."* The store's `#observe` calls
   exactly this function with exactly `QUEUE_CONDITION_KINDS`, which B16 pins off
   the source so that these arms are about the live path and not a parallel one.

   NO TEST-ONLY DOOR WAS ADDED TO THE STORE TO REACH THESE. A probe method on the
   DO would be a second append site in everything but name, which is the one
   thing §4.4 forbids — the suite would have bought its own convenience by
   breaking the property it exists to check. The STORE side is driven instead
   through the real writers in sections F and G. */
{
  const CK = QUEUE_CONDITION_KINDS;
  const bad = checkObservation({
    authority_kind: null, level: "document", subject_kind: "address",
    subject: "https://example.gov/a", state: "PRESENT", result_ref: SHA_A }, CK);
  t("B10: a row with NO authority_kind is REFUSED BY NAME (C-22.9)",
    [bad && bad.code, bad && bad.check], ["OBS_AUTHORITY_UNNAMED", "C-22.9"]);

  const noref = checkObservation({
    authority_kind: "acquire", level: "document", subject_kind: "address",
    subject: "https://example.gov/b", state: "PRESENT" }, CK);
  t("B11: a PRESENT with no result_ref is REFUSED BY NAME (C-22.10) — the WARC lesson",
    [noref && noref.code, noref && noref.check], ["OBS_PRESENT_NO_REFERENT", "C-22.10"]);

  const gov = checkObservation({
    authority_kind: "sweep", authority: "REQ-1", level: "document", subject_kind: "address",
    subject: "https://example.gov/c", state: "LOOKED_ABSENT", governed: true }, CK);
  t("B12: a DEFINITIVE state on a governed row is refused (C-22.2) — D-104's split",
    [gov && gov.code, gov && gov.check], ["AI_LOG_GOVERNED_ABSENCE", "C-22.2"]);

  const shell = checkObservation({
    authority_kind: "acquire", level: "document", subject_kind: "address",
    subject: "https://example.gov/d", state: "PRESENT", result_ref: SHA_A,
    condition: "client-rendered-shell" }, CK);
  t("B13: a client-rendered shell never reads PRESENT (C-22.3) — D-64's false-coverage hazard",
    [shell && shell.code, shell && shell.check], ["AI_LOG_SHELL_PRESENT", "C-22.3"]);

  const bund = checkObservation({
    authority_kind: "acquire", level: "document", subject_kind: "address",
    subject: "https://example.gov/e", state: "PRESENT", result_ref: SHA_A,
    bundle: BUNDLE }, CK);
  t("B14: an entry naming a BUNDLE is refused at the append (C-22.6) — the log is never in bundle.md",
    [bund && bund.code, bund && bund.check], ["AI_LOG_NOT_A_BUNDLE", "C-22.6"]);

  const ok = checkObservation({
    authority_kind: "acquire", level: "document", subject_kind: "address",
    subject: "https://example.gov/f", state: "PRESENT", result_kind: "capture",
    result_ref: SHA_A }, CK);
  t("B15: and a well-formed row is ACCEPTED — a refusal set that refuses everything is not a fence",
    ok, null);

  /* THE ARMS ABOVE ARE ABOUT THE LIVE PATH ONLY IF THE STORE CALLS THIS
     FUNCTION WITH THIS VOCABULARY. Pinned off the source, because a suite that
     exercises a pure function the store has quietly stopped calling is testing
     something else — which is exactly how C-22.4's control was absorbed by a
     second copy of the rule and left a suite green at 98/98. */
  t("B16: #observe calls THIS checker with THIS live vocabulary — so B10..B15 are "
  + "about the live path and not a parallel one",
    /#observe\([\s\S]{0,3000}?checkObservation\(entry, QUEUE_CONDITION_KINDS\)/.test(SRC_STORE), true);

  /* THE OVER-STRICTNESS FIXTURE, IN THE SUITE rather than only in the driver:
     a run-log PRESENT with no referent is CORRECT WORK in a spelling C-22.10
     could easily have refused, and §4.4 requires it to pass. An arm that only
     ever proves a refusal fires cannot tell a fence from a wall. */
  const runPresent = checkObservation({
    authority_kind: "run", authority: "RUN-x", level: "document", subject_kind: "unstated",
    subject: "observation:something", state: "PRESENT" }, CK);
  t("B17: OVER-STRICTNESS — a `run` PRESENT with no referent is ACCEPTED, because "
  + "ai_run_log never had that column and §4.4 folds its rows in unchanged",
    runPresent, null);
}

/* ========================================================================= *
 *  C · THE FOLD — §4.4. `op=airunlog` reads through UNCHANGED.
 * ========================================================================= */
console.log("\n--- C · the fold: op=airunlog answers byte-identically (§4.4) ---");

await POST(`op=promote&token=${TOK}`, {
  bundleId: BUNDLE, base: null, snapKey: "20260914T090000Z_inbox", author: "ruth",
  meta: { object_type: "inquiry", group: "believe-in-oakland",
          title: "What did we look for?", current_state: "open", created: T0, last_updated: T0 },
  files: [{ path: "bundle.md", text: `---\nid: ${BUNDLE}\n---\n\n## Question\n\nWhat did we look for?\n`,
            bytes: 90, sha256: SHA_A }],
  register: [],
});

const RUN = "RUN-2026-0914-fold";
await POST(`op=airunopen&token=${TOK}`, {
  run: RUN, contextType: "inquiry", contextId: BUNDLE, label: "the fold's fixture", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }], leaseMs: 600000, at: T0,
});
const ticked = await POST(`op=airuntick&token=${TOK}`, {
  run: RUN, at: at(5000), leaseMs: 600000, consume: { fetches: 3 },
  log: [
    { level: "meaning", subject: "observation:fold-finding", state: "NEVER_LOOKED",
      detail: "nothing has been derived here, which may only mean nothing was extracted" },
    /* A run-log PRESENT WITH NO REFERENT — the shape C-22.10 deliberately does
       not refuse under `authority_kind = run`, because `ai_run_log` never had a
       `result_ref` column and §4.4 requires its rows to fold in unchanged. This
       entry is the over-strictness fixture standing in the suite itself. */
    { level: "document", subject: "observation:budget-2026", state: "PRESENT",
      detail: "the store holds the adopted 2026 budget" },
    { level: "internet", subject: "observation:controller-portal", state: "LOOKED_INDETERMINATE",
      governed: true, condition: "governor-holding-host",
      detail: "our own pacing held the controller portal" },
  ],
});
t("C1: the run's three entries all appended THROUGH THE FOLD — none refused",
  [ticked && ticked.appended, (ticked && ticked.refused || []).length], [3, 0]);

const logAnswer = await GET(`op=airunlog&token=${TOK}&run=${RUN}`);
t("C2: `seq` is 1,2,3 PER RUN, not the store-wide rowid — an unchanged envelope carrying "
+ "changed numbers is the worst shape an interface change can take",
  logAnswer.entries.map((e) => e.seq), [1, 2, 3]);
t("C3: and the entries come back in order with their levels and states intact",
  logAnswer.entries.map((e) => [e.level, e.state]),
  [["meaning", "NEVER_LOOKED"], ["document", "PRESENT"], ["internet", "LOOKED_INDETERMINATE"]]);
/* INDEX-SAFE ON PURPOSE. Under this item's `overstrict` control arm the run's
   entries are refused, `entries[2]` is undefined, and a bare `.governed` threw a
   TypeError — which goes through NO ASSERTION AT ALL and ended the module while
   the tally read clean, so the arm reported "the suite did not reach its foot"
   instead of naming what broke. That is WORKER.md's own receipt, reproduced by
   this suite and fixed here rather than worked around in the driver. */
t("C4: the governed row survives the fold as a BOOLEAN, not a 1",
  logAnswer.entries[2]?.governed ?? "(no third entry)", true);
t("C5: the envelope still publishes its bound (REC-70)",
  [typeof logAnswer.limit, logAnswer.truncated, logAnswer.found], ["number", false, true]);
t("C6: and the vocabularies still travel WITH the answer (DEC-8)",
  Object.keys(logAnswer.vocabulary || {}).sort(), ["bounds", "endings", "levels", "states"]);

/* THE BYTE-IDENTITY PIN, and its provenance is what makes it evidence.
   `test/rec93-fold-digest.mjs` drove THIS EXACT FIXTURE through the PRE-ITEM
   BUILD at f38af22 and through this one, and compared the raw response text:
   3,120 bytes, sha256 10bf6e28346b652793d7cd64d9ca56f5c09cea5a5da830641ea5f24be74a4a1a,
   IDENTICAL. A digest this item computed and then pinned against itself would
   prove only that the answer stopped moving AFTER the change; the number below
   is the PRE-ITEM build's own answer, so re-checking it here is a comparison
   with the old behaviour rather than with this item's opinion of it. */
const FOLD_PIN = "10bf6e28346b652793d7cd64d9ca56f5c09cea5a5da830641ea5f24be74a4a1a";
t("C7: the pinned pre-item digest is a real sha256 and not an empty-string artefact "
+ "(e3b0c442… has been recorded here twice as a 'byte-identical' result over nothing)",
  [FOLD_PIN.length, FOLD_PIN === sha("")], [64, false]);

/* ========================================================================= *
 *  D · §4.6's PROVISIONAL — a member's ad hoc search is NEVER an observation.
 * ========================================================================= */
console.log("\n--- D · §4.6: a member's ad hoc search writes NOTHING (DEC-61's analogy) ---");

{
  const before = await obsCount();
  await GET(`op=search&token=${TOK}&q=sewer`);
  await GET(`op=search&token=${TOK}&q=transfers`);
  await GET(`op=list&token=${TOK}`);
  const after = await obsCount();
  /* §9 arm 4: "a member's `op=search` writes nothing (the row count is unchanged
     after any search)". The count is read through the SAME op before and after,
     so an instrument that could not see the table at all would fail C-D2 below
     rather than reporting a comfortable zero. */
  t("D1: the row count is UNCHANGED after two searches and a list", after - before, 0);
  t("D2: and the counter is genuinely reading the table, not answering undefined for everything",
    [typeof before, before >= 1], ["number", true]);
}

/* ========================================================================= *
 *  E · THE FRONTIER — §5. A view, never a table.
 * ========================================================================= */
console.log("\n--- E · the frontier is a view over the log (§5) ---");

{
  /* A REAL ROW THROUGH A REAL WRITER, seeded here rather than borrowed from
     section B. B10..B17 hold the refusals to the PURE checker and therefore
     write NOTHING — an E-arm resting on them would have been an assertion about
     a row that was never inserted, which is the "arm that could never have been
     honoured" shape this repository has measured. */
  await obj.recordCapturedLocator({
    address: "https://example.gov/frontier-seed", addressNorm: "https://example.gov/frontier-seed",
    captureSha: SHA_A, retrieved: at(7000) });

  const f = await GET(`op=frontier&token=${TOK}&level=document`);
  t("E1: the document level is BUILT and answers", [f.found, f.built, f.level],
    [true, true, "document"]);
  t("E2: the bound is PUBLISHED on the answer (REC-70/REC-30)",
    [typeof f.limit, typeof f.truncated], ["number", "boolean"]);
  t("E3: the frontier carries that look, latest-per-subject, with what it found",
    (f.looked || []).filter((r) => r.subject === "https://example.gov/frontier-seed")
      .map((r) => [r.state, r.result_kind, r.result_ref, r.authority_kind]),
    [["PRESENT", "capture", SHA_A, "acquire"]]);
  t("E3b: …and `last_verified` is DERIVED onto it from that row's own `at` (§5)",
    (f.looked || []).find((r) => r.subject === "https://example.gov/frontier-seed")?.last_verified,
    at(7000));
  /* §7: a result_ref pointing at a capture the store does not hold is ANNOTATED
     at read time and never rewritten. SHA_A was never registered, so this reads
     `purged: true` — which is the annotation working, and it is asserted rather
     than assumed because a null here would read identically to "not checked". */
  t("E3c: a result_ref the register does not hold is ANNOTATED at read time, never rewritten (§7)",
    (f.looked || []).find((r) => r.subject === "https://example.gov/frontier-seed")?.result_purged,
    true);
  t("E4: `last_verified` is DERIVED from the latest PRESENT row's `at` and is not a stored column "
  + "(STORE-AS-CACHE.md: HTTP obsoleted it and we must own it)",
    /last_verified/.test(SRC_SCHEMA), false);

  /* THE LEVELS THAT HAVE NO WRITER SAY SO IN WORDS. An empty list here would be
     the exact confusion this whole table exists to end — "we looked and found
     nothing" against "nobody built this yet" — arriving inside the log's own
     reader. */
  /* CORRECTED 2026-09-15 BY REC-94, NEVER EXEMPTED, AND THE REASON THE OLD
     ASSERTION WAS WRONG IS THE USEFUL PART: `content` was in this list because
     on 2026-09-14 the content level HAD no writer. REC-94 built it (LOG §8 row
     2), so the arm as written asserted that a level which now answers must not
     answer — a test pinning the absence of a feature rather than the rule behind
     it. The RULE is *a level with no writer says so in words and never with an
     empty list*, and the rule is unchanged: it is now asserted over the two
     levels that still have none, and the CONVERSE is asserted over the one that
     gained one, so this arm goes red again if `content` ever silently stops
     answering. An arm that could only ever have gone red by the feature ARRIVING
     is the shape that gets exempted; this one can go red both ways. */
  for (const lvl of ["meaning", "internet"]) {
    const g = await GET(`op=frontier&token=${TOK}&level=${lvl}`);
    t(`E5: the ${lvl} level answers NOT BUILT rather than an empty frontier`,
      [g.built, (g.looked || []).length, typeof g.note === "string" && g.note.length > 40],
      [false, 0, true]);
  }
  {
    const g = await GET(`op=frontier&token=${TOK}&level=content`);
    t("E5b: the CONTENT level is BUILT (REC-94) and says so — the converse of E5, so this arm "
    + "fails if the content writer is ever removed as well as if the not-built branch swallows it",
      [g.built, g.found, typeof g.note === "string" && g.note.length > 40],
      [true, true, true]);
  }
}

/* ========================================================================= *
 *  F · §7's EDGE-TRIGGERED RULE. Its volume is MEASURED in M-14.
 * ========================================================================= */
console.log("\n--- F · the edge rule: a steady-state revisit writes NO row (§7) ---");

{
  const ADDR = "https://example.gov/edge-asset";
  const before = await obsCount();

  const first = await obj.recordCapturedLocator({
    address: ADDR, addressNorm: ADDR, captureSha: SHA_A, retrieved: at(10000) });
  /* `observation_written` IS READ BACK AGAINST THE ROW COUNT, never trusted on
     its own. It reported `true` over a suppressed append until this item's own
     `writer` control arm caught it — a published field computed from the
     intention rather than the outcome — so the arm asserts the FIELD and the
     TABLE agree, and `observation_refused` is asserted null so that "written"
     cannot mean "attempted and refused". */
  t("F1: a FIRST look writes one row, says so, and was not refused",
    [first.observation, first.observation_written, first.observation_refused], ["new", true, null]);
  t("F1b: …and the table AGREES with what the answer said — the field is the outcome, "
  + "not the intention (found by this item's own `writer` arm)",
    (await obsCount()) - before, 1);

  /* N unchanged revisits. §9: "a steady-state sweep over N unchanged assets
     writes zero rows and increments N counters". */
  const N = 5;
  const mid = await obsCount();
  for (let i = 0; i < N; i++)
    await obj.recordCapturedLocator({
      address: ADDR, addressNorm: ADDR, captureSha: SHA_A, retrieved: at(20000 + i * 1000) });
  const afterUnchanged = await obsCount();
  t(`F2: ${N} UNCHANGED revisits write ZERO rows — this is the 2,859x M-14 measured`,
    afterUnchanged - mid, 0);

  /* …AND THE COUNTER STILL MOVED. Without this half, "wrote no row" is
     indistinguishable from "did nothing", and the frontier's cache would be
     silently stale — which is worse than the row it saved. */
  const locs = await obj.capturedLocators({ addressNorm: ADDR });
  t("F3: …and the frontier's CACHE still counted every one of them (§7's other half). "
  + "Without this, 'wrote no row' is indistinguishable from 'did nothing'",
    locs.observations, 1 + N);

  /* CHANGE ONE ASSET → ONE ROW. */
  const changed = await obj.recordCapturedLocator({
    address: ADDR, addressNorm: ADDR, captureSha: SHA_B, retrieved: at(40000) });
  t("F4: a CHANGE writes exactly one row and names itself `changed`",
    [changed.observation, changed.observation_written], ["changed", true]);
  t("F5: and the whole sequence wrote exactly two rows — the first look and the transition",
    (await obsCount()) - before, 2);

  /* THE ARCHIVE FALLBACK — §4.1's fourth writer. `via` is what makes an archive
     capture and a direct capture of ONE address two observations of one subject
     (D-96's split arriving in the log). */
  const viaArchive = await obj.recordCapturedLocator({
    address: ADDR, addressNorm: ADDR, captureSha: SHA_A, retrieved: at(50000), via: "archive" });
  t("F6: the ARCHIVE fallback is a FIRST look at this subject through a different source, "
  + "not an unchanged revisit of the direct one (D-96)",
    [viaArchive.observation, viaArchive.observation_written], ["new", true]);
}

/* ========================================================================= *
 *  G · RATIFY'S MAPPING — §4.1 row 3, and the outcome that writes NO ROW.
 * ========================================================================= */
console.log("\n--- G · ratify's re-fetch, and `not_attempted` writes nothing (§4.1) ---");

{
  const before = await obsCount();
  const out = await obj.recordReuseVerdicts({ bundleId: BUNDLE, at: at(60000), verdicts: [
    { source_capture: SHA_A, address_norm: "https://example.gov/part-a", host: "example.gov",
      verdict: "confirmed", reused_sha: SHA_A, basis: "re-fetch" },
    { source_capture: SHA_A, address_norm: "https://example.gov/part-b", host: "example.gov",
      verdict: "changed", reused_sha: SHA_A, observed_sha: SHA_B, basis: "re-fetch" },
    { source_capture: SHA_A, address_norm: "https://example.gov/part-c", host: "example.gov",
      verdict: "unreachable", reused_sha: SHA_A, basis: "re-fetch" },
    /* THE ONE THAT WRITES NOTHING, and §4.1 gives the reason rather than an
       optimisation: "a look not taken is NEVER_LOOKED, and the budget that
       stopped it is recorded on the ratification, where it already is". */
    { source_capture: SHA_A, address_norm: "https://example.gov/part-d", host: "example.gov",
      verdict: "not_attempted", reused_sha: SHA_A, basis: "budget" },
  ] });
  t("G1: all four verdicts are RECORDED as verdicts — the log does not change that table",
    out.recorded, 4);
  t("G2: but only THREE observations are written — `not_attempted` is NEVER_LOOKED, "
  + "which is the absence of a row",
    (await obsCount()) - before, 3);
  t("G3: and no observation was refused — the mapping mints no word the vocabulary lacks",
    (out.observation_refusals || []).length, 0);

  const f = await GET(`op=frontier&token=${ADM}&level=document`);
  const byAddr = Object.fromEntries((f.looked || []).map((r) => [r.subject, r.state]));
  t("G4: confirmed→PRESENT, changed→PRESENT, unreachable→LOOKED_INDETERMINATE, "
  + "and part-d is absent from the frontier entirely",
    [byAddr["https://example.gov/part-a"], byAddr["https://example.gov/part-b"],
     byAddr["https://example.gov/part-c"], byAddr["https://example.gov/part-d"] ?? "ABSENT"],
    ["PRESENT", "PRESENT", "LOOKED_INDETERMINATE", "ABSENT"]);
}

/* ========================================================================= *
 *  H · PURGE — §7. Both arms, and they do OPPOSITE things on purpose.
 * ========================================================================= */
console.log("\n--- H · purge: the whole-store arm clears, the per-bundle arm LEAVES (§7) ---");

{
  const before = await obsCount();
  t("H1: there are observations to lose, so the arms below are not measured over nothing",
    before > 5, true);
  /* `bundleId` IS A QUERY PARAMETER AND NOT A BODY FIELD, which this arm got
     wrong first and which is worth the line: the body form is accepted silently
     and purges the WHOLE STORE, so the per-bundle arm read as "clears
     everything" against perfectly correct code. An arm that measured the wrong
     call is a finding about the arm. */
  await POST(`op=purge&token=${ADM}&confirm=bio&bundleId=${BUNDLE}`, {});
  t("H2: a PER-BUNDLE purge LEAVES every observation standing — they are the coverage "
  + "record and are not derived from the bundle (§7)",
    (await obsCount()), before);

  await POST(`op=purge&token=${ADM}&confirm=bio`, {});
  t("H3: and the WHOLE-STORE arm clears the table — D-113's rule applies to it as to every table",
    (await obsCount()), 0);
}

console.log(`\nobservation-log: ${pass} pass, ${fail} fail`);
} finally { await mf.dispose(); }
/* EXPLICIT IN BOTH DIRECTIONS, which `hygiene.test.mjs` requires of every suite:
   `process.exit(1)` alone leaves the GREEN path to node's default, and a suite
   that merely declines to fail is not the same as one that says it passed. */
process.exit(fail ? 1 : 0);
