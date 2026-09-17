/* NEGATIVE CONTROL: (declared and RUN 2026-09-17, REC-113 / IC-116, worktree
   agent-ab3bf809046a052e6) FIVE arms over section I's coverage statement, RUN in one step
   through `node test/nc-rec113.mjs [arm|all]` (the driver lives INSIDE this worktree), each
   armed ALONE with every other defence held open, each DECLARED before it ran, each mutation
   passing an anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard, and every
   restore verified by sha256 AND by `cmp` against a PRISTINE copy named UNIQUELY PER ARM with a
   byte count printed and a floor guarded. An opening AND a closing baseline bracket the run;
   both read 81 pass / 0 fail, exit 0. `git checkout --` is never used to undo an arm.
   EVERY ARM ALSO RUNS `test/rec113-identity.mjs` against a pre-change checkout, so the
   over-strictness direction is graded on each arm rather than once at the end.
   (a) `baseline` — nothing armed. The row that distinguishes four-arms-broken from
       four-arms-working. Both ends green.
   (b) `projection` — the row's own arm: the two columns removed from the SELECT. Declared
       MUST FAIL I2 I2b I2c I2d. **ACTUAL: I2 and I2c ONLY — I2b AND I2d CAME BACK GREEN, AND
       THAT IS THIS CONTROL'S MOST USEFUL RESULT RATHER THAN A FAULT IN THE ARM.** With the
       columns gone a row that HAS no referent still reads `null / null / undetermined`, which
       is what it should read — so an assertion over a row with nothing to show cannot tell
       *the record has no referent* from *the read dropped the column*. That is D-366's own
       absence-with-two-causes shape arriving inside the suite written to close it. **Only a
       row that HAS a referent can detect a missing projection**, which is what makes I2 and
       I2c load-bearing; the declaration is CORRECTED in the driver with its reason, never
       exempted.
   (c) `statement` — projected but NOT stated: the columns come back, the `coverage` sentence
       does not. Declared MUST FAIL I2 I2b I2c I2d; MUST NOT FAIL I2e I2f. AS DECLARED. This is
       the arm that proves the third field is load-bearing rather than decoration — without it,
       "STATED as undetermined" would be satisfied by a null after all.
   (d) `manufacture` — THE COSTLY DIRECTION: drop the state test so ANY row without a referent
       reads undetermined, making a LOOKED_ABSENT row say the record does not know something it
       does know. Declared MUST FAIL I2d I2e; MUST NOT FAIL I2 I2b I2c I2f. AS DECLARED.
   (e) `blind` — THE WORST DIRECTION: ignore the referent entirely, so even rows the record CAN
       back read undetermined. Declared MUST FAIL I2 I2c I2e; MUST NOT FAIL I2b I2f. AS
       DECLARED, and the identity driver's own must-fail arm went red with it.
   WHAT THESE ARMS CANNOT SEE: they are local to this plane's source under miniflare — no real
   account, no deploy, no second instance, and critically NOT `agent-worker`'s live use of
   `op=airunlog`, whose own suites MOCK the op, so a consumer break there would not surface in
   this battery at all. That gap was closed by reading every call site rather than by measuring.

   NEGATIVE CONTROL: (declared and RUN 2026-09-16, REC-103, worktree agent-a4fe71943bfcf63db) SIX
   arms over section I's fence, RUN in one step through `node test/nc-rec103.mjs [arm|all]` (the
   driver lives INSIDE this worktree), each armed ALONE with every other defence held open, each
   DECLARED before it ran, each mutation passing an anchor-occurs-EXACTLY-ONCE guard and a
   bytes-really-changed guard, and every restore verified by sha256 AND by `cmp` against a PRISTINE
   copy named UNIQUELY PER ARM with a byte count printed and a 500,000-byte floor guarded. Opening
   AND closing baseline rows bracket the run. Baseline both ends: 72 pass / 0 fail, exit 0.
   The sixth was added mid-item when the `run` referent became a delegation (see (e)).
   **EVERY ARM IS ARMED AGAINST THE DATA AND NOT AGAINST A FLAG**, which is this row's own
   instruction and REC-94's receipt: its leak one method over passed a flag-only arm because
   `capture_held` was already false.
   (a) `fence` — neuter `#frontierDocumentVisible` to admit every row. Declared MUST FAIL I1 I2 I3
       I8; MUST NOT FAIL I4 I4b. ACTUAL: I1 I1b I2 I3 **I5** I8 **I9b** — more than declared, and
       both extras are right to be there: with the predicate gone the absent stamp is answered too,
       and so is every run-context row.
   (b) `authority` — neuter ONLY the authority half of `#observationBundles`, leaving the
       `result_ref` half intact. Declared MUST FAIL I1 I8. Final: I1 I1b I8 I9b. **FIRST RUN: I8 ALONE — I1 CAME
       BACK GREEN, AND THAT IS A FINDING ABOUT THE ARM RATHER THAN ABOUT THE SUBJECT.** On ratify's
       `confirmed` row the capture back-reference withholds it anyway, so the two defences overlap
       and the arm could not tell which one fired — REC-94's fall-through shape pointed at a suite
       instead of at the store. **I1b was ADDED for it**: ratify's `unreachable` verdict carries NO
       `result_ref` (§4.1), so `authority` is its only referent. Re-run: I1 I1b I8.
   (c) `overstrict` — THE ARM THAT MUST GO RED IN THE OTHER DIRECTION: make every referent
       unresolvable. Declared MUST FAIL I4 I4b I8b; MUST NOT FAIL I1 I2 I3. ACTUAL: those plus I9b,
       which follows — an unresolved referent withholds before the run delegation is reached.
   (e) `run` — neuter ONLY the delegated run gate, ADDED after `run-conditions.test.mjs` ARM W3
       caught this item's first draft reading `ai_runs` directly and the referent became a
       delegation to `aiRunLog`. **A referent the resolver DELEGATES is the one most in need of an
       arm**, because nothing in this method's own bytes decides it. Declared MUST FAIL I9b.
       ACTUAL: I8 **and** I9b — one more than declared and right to be there, since `run` is one of
       the nine kinds I8's inversion fixture drives.
   (d) `machine` — remove the machine carve-out from the document arm. Declared MUST FAIL I0 I1 I2
       I3 I4b I7. **ACTUAL: E3 E3b E3c G4 I7 — a different set, and the difference is the finding.**
       `#bundleRedactor` already carves out a machine credential for the RESOLVABLE path, so the
       carve-out here is load-bearing for the UNRESOLVED path alone — which is precisely §7's purge
       annotation (`frontier-seed` and G4's rows name captures the register does not hold). The arm
       proves what preserves the operator path rather than what the declaration guessed.
   (f) `deny` — remove the explicit fail-closed arm for an absent stamp. Declared MUST FAIL I5.
       **ACTUAL: GREEN, and it is RECORDED RATHER THAN SMOOTHED.** Every document-level row this
       plane writes today carries at least one bundle-scoped referent, and under DENY the redactor
       already answers null for every one — so the line is redundant ON TODAY'S WRITERS and is kept
       as the defence for a row with NO referent at all, which `#lookAuthority` can produce in
       principle (`authority: null` on a request that names none) and does not today.
   WHAT THESE ARMS CANNOT SEE: they are local to this plane's source under miniflare. Nothing here
   exercises the real account, a deploy, a second instance, or the control plane's own stamp — the
   arms drive the Durable Object directly with a named member viewer, because the control plane
   stamps `class:member` for a shared token and a token-only arm CANNOT ARM against this fence. */
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
       **WHAT THIS ARM CANNOT SEE, ADDED BY REC-100 2026-09-16 AFTER IT WAS RELIED ON AS A
       SUFFICIENT MEASUREMENT AND IS NOT ONE.** REC-100's accepts-when reads *"no live writer
       emits a `run` `PRESENT` with no referent — measured by the `overstrict` arm coming back
       EMPTY rather than by reading the writers"*. The arm runs THIS SUITE ONLY, so it sees
       neither of the two rollup writers in `store.mjs` (`#aiRunTerminate`, `#aiRunReap`, whose
       PRESENT comes from `#aiRunSearchState` and cannot carry a referent by construction) nor
       the one EXTERNAL caller that matters — `agent-worker`'s `stepLog`, which composes no
       referent field while `observed` sits in `JUDGEABLE`. **And agent-worker's own suites MOCK
       the plane's `op=airuntick`**, so widening C-22.10 would break that integration with the
       whole battery green. An EMPTY arm here would therefore have licensed exactly the wrong
       conclusion. Section I drives the three directly, which is what the arm cannot do.
   THE ACTUAL RESULTS OF EVERY ARM ARE IN `CLAIMS.md`'s release line for REC-93, including the
   ones that came back other than declared.
   NEGATIVE CONTROL RE-RUN AND RE-DECLARED 2026-09-16 BY REC-100 (worktree
   `agent-a984a71a7b324f52c`), which appended section I. ALL SEVEN ARMS RUN, every one AS
   DECLARED, baseline green at 62/0, every restore byte-identical by sha256 AND `cmp`
   (`airun.mjs` 91,867 B sha256 `1890746cfc23…`, `store.mjs` 2,182,088 B sha256 `548259580784…`).
   `overstrict` moved 5 fail -> 7 as section I landed, and **its declaration GAINED I3 so the arm
   now GRADES the rollup rather than printing it** — REC-99's finding applied here.
   **WHAT THAT ARM MEASURED, AND IT IS HEAVIER THAN THE OVER-STRICTNESS IT WAS BUILT FOR:** with
   C-22.10 widened over `run`, `op=airunclose` answers `terminated: false, ok: false,
   code: OBS_PRESENT_NO_REFERENT` and **the run's terminal entry is never written — a run that
   observed anything PRESENT cannot be closed at all**. Deleting the carve-out today is a lifecycle
   deadlock in this plane, not a tightened fence.
   **THE TWO WRITERS ARE HELD TO DIFFERENT EVIDENCE AND THE DIFFERENCE IS STATED RATHER THAN
   BLURRED:** `#aiRunTerminate` is DRIVEN above, through `op=airunclose`, and I3/I4 assert it.
   `#aiRunReap` is READ — it calls the same `#aiRunSearchState` and appends with no `resultRef`,
   so it is the same shape by construction, but no arm here reaches it (the reaper needs an
   expired lease). That is an inference from the source, not a measurement, and it is labelled as
   one; an arm that drives the reaper is owed and is not this item's. I1 and I2 stay GREEN throughout, which is what makes the finding precise: the
   write door is open and the read still does not project the referent, so what the widening breaks
   is exactly the ROLLUP — nothing about the mechanism.
   REC-100's OWN ROW DECLARED TWO ARMS THAT ARE INAPPLICABLE AND ARE RECORDED AS NOT RUN RATHER
   THAN QUIETLY DROPPED: *the carve-out restored* and *the backfill filled with a derived referent
   must FAIL* both presuppose a widening and a backfill that this item deliberately did not do.

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
 *   H. PURGE — both arms, which do opposite things on purpose.
 *   I. REC-100 (appended 2026-09-16) — WHAT THE `run` CARVE-OUT IS WAITING ON,
 *      measured rather than inherited: the write door is already open, the READ
 *      does not project the referent, and the run's terminal entry is a ROLLUP
 *      whose PRESENT has nothing to point at by construction.
 *
 * THE SECTION LIST SAID "SEVEN SECTIONS" AND NAMED SIX while H was already in
 * the file — corrected here rather than left, since a header that miscounts its
 * own contents is the cheapest possible version of this suite's whole subject.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";
import { OBSERVATION_AUTHORITY_KINDS, OBSERVATION_SUBJECT_KINDS,
         OBSERVATION_ACTOR_CLASSES, checkObservation,
         /* REC-113 / IC-116: section I2e drives the READ's rule and the REFUSAL's
            side by side, so the suite holds them together rather than trusting
            that somebody kept two literals in step. */
         observationCoverage } from "../src/airun.mjs";
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
/* CORRECTED 2026-09-15 by REC-95, NOT EXEMPTED, and the correction is why this
   arm is written as an exact key set rather than as a floor.
   IT READ `["address", "capture", "description", "entity", "extent", "unstated"]`
   and that was right until this landing. It is now SEVEN: REC-95 added
   `reference` as the subject of a RESOLUTION ATTEMPT (design §4.3's second act).
   The old expectation was not wrong when written — it is superseded, and the
   reason it is superseded is the thing worth recording: §4.3 says *"one row per
   resolution attempt over an entity"*, but an attempt that FAILS names no
   entity — there is no registry entry, which is exactly what it found out — and
   that failing attempt is the look §4.3 exists to record. Keying it on `entity`
   would have written a row for every success and NOTHING for the case the
   section was written for; putting a raw unresolved `kind:key` into a column
   called `entity` would say the record keeps a registry entry for a name it has
   just established it does not.
   THE PIN DID ITS JOB. It is the only instrument here that can see a member of
   this vocabulary appear, and it brought REC-95's author to this line to say why
   instead of letting a seventh spelling arrive unremarked. Keep it EXACT: a floor
   would have passed silently and the whole value of the arm would be gone. */
t("B9: the subject kinds are §3's five plus `unstated`, which the FOLD needs, plus "
+ "`reference` (REC-95), which a resolution attempt that matched NOTHING needs — each "
+ "added because the alternative was a kind the record cannot support",
  Object.keys(OBSERVATION_SUBJECT_KINDS).sort(),
  ["address", "capture", "description", "entity", "extent", "reference", "unstated"]);

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
/* CORRECTED 2026-09-17, REC-113 / IC-116. The old pin named four and was right
   until this read began STATING each row's coverage claim; it is superseded, not
   mistaken, and it is widened rather than exempted — an exempted pin is a rule
   nobody is enforcing and nobody remembers deleting. */
t("C6: and the vocabularies still travel WITH the answer (DEC-8)",
  Object.keys(logAnswer.vocabulary || {}).sort(),
  ["bounds", "coverage", "coverage_undetermined", "endings", "levels", "states"]);

/* THE BYTE-IDENTITY PIN, and its provenance is what makes it evidence.
   `test/rec93-fold-digest.mjs` drove THIS EXACT FIXTURE through the PRE-ITEM
   BUILD at f38af22 and through this one, and compared the raw response text:
   3,120 bytes, sha256 10bf6e28346b652793d7cd64d9ca56f5c09cea5a5da830641ea5f24be74a4a1a,
   IDENTICAL. A digest this item computed and then pinned against itself would
   prove only that the answer stopped moving AFTER the change; the number below
   is the PRE-ITEM build's own answer, so re-checking it here is a comparison
   with the old behaviour rather than with this item's opinion of it.

   **SUPERSEDED AS A LIVE NUMBER 2026-09-17 BY REC-113 / IC-116, AND SAID HERE
   RATHER THAN LEFT TO GO QUIETLY STALE — which is this project's most-repeated
   finding and would have happened silently, because NO ASSERTION BELOW
   RECOMPUTES THIS DIGEST.** `op=airunlog` now projects `result_kind` and
   `result_ref` and STATES a per-row `coverage`, so this fixture's answer is no
   longer 3,120 bytes and no longer digests to `10bf6e28…`. The sentence above is
   kept because it is the true record of what REC-93 measured against f38af22;
   what changed is the READ, by an accepted additive interface change.
   THE BYTE-IDENTITY CLAIM ITSELF DID NOT GO AWAY, IT MOVED AND GOT STRONGER:
   `test/rec113-identity.mjs` drives a fixture carrying BOTH a referent-bearing
   and a bare `run` PRESENT through this build and a pre-change checkout, strips
   exactly the three added keys, and compares the raw text — so the old answer is
   still pinned against a build that predates the change rather than against this
   item's opinion of it. C7 below is unchanged and still does its own job. */
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
  /* CORRECTED AGAIN 2026-09-15 BY REC-95, NEVER EXEMPTED, on exactly the grounds
     REC-94's correction above states and for the next level down the list.
     `meaning` was here because on 2026-09-14 it had no writer; REC-95 built it
     (LOG §8 row 3), so the arm as written asserted that a level which now answers
     must not answer. THE RULE IS UNCHANGED and is what the arm is about: *a level
     with no writer says so in words and never with an empty list.* It is asserted
     over the ONE level that still has none — `internet`, whose authored writer is
     a member's LEAD and is Program B's, not a RECORD row (§4.5, D-194) — and the
     CONVERSE is asserted over each level that has gained one, so this goes red
     both ways: if a built level silently stops answering, and if the not-built
     branch ever swallows one. An arm that could only go red by the feature
     ARRIVING is the shape that gets exempted; this one cannot be. */
  for (const lvl of ["internet"]) {
    const g = await GET(`op=frontier&token=${TOK}&level=${lvl}`);
    t(`E5: the ${lvl} level answers NOT BUILT rather than an empty frontier`,
      [g.built, (g.looked || []).length, typeof g.note === "string" && g.note.length > 40],
      [false, 0, true]);
  }
  for (const lvl of ["content", "meaning"]) {
    const g = await GET(`op=frontier&token=${TOK}&level=${lvl}`);
    t(`E5b: the ${lvl.toUpperCase()} level is BUILT and says so — the converse of E5, so this arm `
    + `fails if that level's writer is ever removed as well as if the not-built branch swallows it`,
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
 *  I · REC-103 / IC-105 — THE DOCUMENT ARM'S FENCE.
 *
 *  OUT OF LETTER ORDER ON PURPOSE, and the reason is mechanical rather than
 *  stylistic: section H purges the whole store, so anything appended after it
 *  measures an empty table. This section is the last one that needs rows.
 *
 *  WHAT IT CLOSES. `Store#frontier` accepted a `viewer` and the DOCUMENT arm
 *  never read it, while `gate-reads.test.mjs` classified the op GATED — a
 *  signature ADVERTISING a fence that was not there. REC-94 measured it while
 *  building the content arm and left it for this row's owner.
 *
 *  EVERY ARM HERE IS DRIVEN AGAINST THE DATA AND NEVER AGAINST A FLAG, which is
 *  the queue row's own instruction and REC-94's receipt: its leak one method over
 *  passed a flag-only arm because `capture_held` was already false. So each arm
 *  below builds a PROJECT the viewer is not a participant of, writes a real row
 *  under a real writer, and asks what comes back.
 *
 *  ASKED THROUGH THE DURABLE OBJECT WITH A REAL MEMBER VIEWER, because the
 *  control plane stamps `class:member` for a shared instance token and
 *  `viewerPredicate` deliberately does not filter a machine credential — an arm
 *  driven only through the token is an arm that CANNOT ARM. That is why every
 *  pre-existing arm in this file is untouched by this item: they all hold a class
 *  credential, and the machine carve-out means their answers do not move.
 * ========================================================================= */
console.log("\n--- I · REC-103: the document frontier withholds row-whole (§6) ---");

{
  const DO = async (op, q = "") => rP(await (await obj.fetch(`http://x/${op}?${q}`)).json());
  const SECRET = "PRJ-2026-0916-rec103-secret";
  const OPEN = "INF-2026-0916-rec103-open";
  const SHA_SECRET = "e".repeat(64);
  const SHA_OPEN = "f".repeat(64);
  const reg = (s) => [{ sha256: s, path: `data/${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 }];
  const mk = async (id, type, capture) => {
    const text = `---\nid: ${id}\nobject_type: ${type}\n---\n\n## Summary\n\n${id}\n`;
    const r = await POST(`op=promote&token=${TOK}`, {
      bundleId: id, base: null, snapKey: `20260916T0900${id.length % 10}0Z_${sha(id).slice(0, 8)}`,
      meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
              current_state: type === "project" ? "forming" : "collected",
              created: T0, last_updated: T0 },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
      register: reg(capture) });
    if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 400)}`);
  };
  await mk(OPEN, "information", SHA_OPEN);
  await mk(SECRET, "project", SHA_SECRET);

  /* THE THREE VECTORS, EACH THROUGH ITS OWN REAL WRITER rather than through one
     that happens to be convenient — the leak arrives by three doors and a suite
     that drove one would have called the other two closed. */
  await obj.recordCapturedLocator({                        // acquire: result_ref
    address: "https://example.gov/rec103-secret-target",
    addressNorm: "https://example.gov/rec103-secret-target",
    captureSha: SHA_SECRET, retrieved: at(70000) });
  await obj.recordReuseVerdicts({ bundleId: SECRET, at: at(70000), verdicts: [
    { source_capture: SHA_SECRET, address_norm: "https://example.gov/rec103-secret-asset.css",
      host: "example.gov", verdict: "confirmed", reused_sha: SHA_SECRET, basis: "re-fetch" },
    /* THE ROW WHERE THE AUTHORITY IS THE ONLY REFERENT, ADDED BECAUSE THIS ITEM'S
       OWN `authority` CONTROL ARM CAME BACK GREEN ON I1 AND THAT WAS A FINDING
       ABOUT THE ARM. §4.1 maps `unreachable` to LOOKED_INDETERMINATE with
       `resultKind: null, resultRef: null`, so this row's ONLY bundle-scoped
       referent is `authority` — the project id ratify passes as `bundleId`. On
       the `confirmed` row above, the capture back-reference withholds it anyway,
       so neutering the authority half left I1 green over a leak the OTHER half
       happened to cover. That is REC-94's fall-through shape pointed at this
       suite instead of at the store: two overlapping defences, and an arm that
       cannot tell which one fired. */
    { source_capture: SHA_SECRET, address_norm: "https://example.gov/rec103-secret-unreachable",
      host: "example.gov", verdict: "unreachable", reused_sha: SHA_SECRET, basis: "re-fetch" }] });
  await obj.recordLinks({ sourceCapture: SHA_SECRET, sourceBundle: SECRET, capturedAt: at(70000),
    links: [{ ref: "https://example.gov/rec103-secret-lead",
              address: "https://example.gov/rec103-secret-lead",
              address_norm: "https://example.gov/rec103-secret-lead", type: "deferred" }] });
  /* THE OVER-STRICTNESS FIXTURE, built in the same breath so it cannot drift from
     the leak fixture: `viewerPredicate` filters PROJECT bundles and NOTHING else
     (the evidence corpus stays shared, D-15), so every row below must survive for
     the same uninvited member the rows above are withheld from. */
  await obj.recordCapturedLocator({
    address: "https://example.gov/rec103-open-target",
    addressNorm: "https://example.gov/rec103-open-target",
    captureSha: SHA_OPEN, retrieved: at(70000) });
  await obj.recordLinks({ sourceCapture: SHA_OPEN, sourceBundle: OPEN, capturedAt: at(70000),
    links: [{ ref: "https://example.gov/rec103-open-lead",
              address: "https://example.gov/rec103-open-lead",
              address_norm: "https://example.gov/rec103-open-lead", type: "deferred" }] });

  const asMachine = await DO("frontier", `level=document&limit=500&viewer=class:member`);
  const asMember  = await DO("frontier", `level=document&limit=500&viewer=member:not-invited`);
  const asNobody  = await DO("frontier", `level=document&limit=500`);
  const subj = (f) => (f.looked || []).map((r) => r.subject);
  const leads = (f) => (f.never_looked || []).map((r) => r.subject);

  t("I0: THE FIXTURE IS NOT EMPTY — the arms below are measured over real rows through real "
  + "writers, not over a store that happened to have nothing in it (three headline totality "
  + "assertions have passed over an empty corpus in this repository)",
    [subj(asMachine).length >= 3, leads(asMachine).length >= 2], [true, true]);

  t("I1: THE LEAK, DRIVEN — the ratify writer passes `bundleId` as the observation's AUTHORITY, "
  + "so before this item an uninvited member read the PROJECT BUNDLE ID VERBATIM off the document "
  + "frontier. The machine credential still sees it; the uninvited member sees no row at all",
    [(asMachine.looked || []).some((r) => r.authority === SECRET),
     (asMember.looked  || []).some((r) => r.authority === SECRET),
     JSON.stringify(asMember).includes(SECRET)],
    [true, false, false]);

  t("I1b: THE AUTHORITY HALF, ALONE AND OVER A REAL WRITER'S ROW — ratify's `unreachable` verdict "
  + "maps to LOOKED_INDETERMINATE with NO `result_ref` (§4.1), so the project id in `authority` is "
  + "the row's ONLY bundle-scoped referent and nothing else can withhold it. Added because this "
  + "item's `authority` control arm came back GREEN on I1: two overlapping defences, and an arm "
  + "that could not tell which one fired",
    [(asMachine.looked || []).some((r) => r.subject === "https://example.gov/rec103-secret-unreachable"
                                        && r.state === "LOOKED_INDETERMINATE" && r.result_ref === null),
     subj(asMember).includes("https://example.gov/rec103-secret-unreachable")],
    [true, false]);

  t("I2: THE BACK-REFERENCE — a row whose `result_ref` names a capture registered to that project "
  + "says THIS RECORD HOLDS THIS DOCUMENT, which is `op=contentaxis`' own disclosure and is gated "
  + "there on this same register resolution. Withheld ROW-WHOLE, not column-redacted, because a "
  + "subject with its authority nulled still names what was looked for (§6)",
    [subj(asMachine).includes("https://example.gov/rec103-secret-target"),
     subj(asMember).includes("https://example.gov/rec103-secret-target"),
     JSON.stringify(asMember).includes(SHA_SECRET)],
    [true, false, false]);

  t("I3: THE NEVER-LOOKED PARTITION — a deferred link discovered INSIDE that project's capture "
  + "published the capture sha as `from_document`. It takes the SAME predicate as the looked "
  + "rows, because two ways to decide one question is the mirror-and-drift class",
    [leads(asMachine).includes("https://example.gov/rec103-secret-lead"),
     leads(asMember).includes("https://example.gov/rec103-secret-lead")],
    [true, false]);

  t("I4: OVER-STRICTNESS, AND IT IS THE ARM THAT MATTERS MOST — the same uninvited member still "
  + "sees every row of the INFORMATION bundle, in both partitions. The evidence corpus stays "
  + "shared (D-15); a fence tighter than its rule is not a safer fence",
    [subj(asMember).includes("https://example.gov/rec103-open-target"),
     leads(asMember).includes("https://example.gov/rec103-open-lead")],
    [true, true]);

  t("I4b: …and BYTE-IDENTICALLY to what the machine credential gets for those same subjects — the "
  + "row does not change with the reader, only whether it is published at all",
    JSON.stringify((asMember.looked || []).filter((r) => r.subject.includes("rec103-open"))),
    JSON.stringify((asMachine.looked || []).filter((r) => r.subject.includes("rec103-open"))));

  t("I5: THE GATE FAILS CLOSED ON AN ABSENT STAMP, at the STORE and not only at the control "
  + "plane — a missing stamp is an outage and never a leak, and a row naming NO bundle would "
  + "otherwise walk past a redactor whose whole job is ids",
    [(asNobody.looked || []).length, (asNobody.never_looked || []).length, asNobody.built],
    [0, 0, true]);

  t("I6: NO COUNT OF WHAT WAS WITHHELD is published, because the count is the leak (REC-30). "
  + "`truncated` is computed from the GATED collections and not from the raw fetch, which would "
  + "be true exactly when the gate dropped enough rows — a one-bit count wearing a bound's name",
    [asMember.truncated, asNobody.truncated,
     Object.keys(asMember).filter((k) => /withheld|hidden|redacted/i.test(k))],
    [false, false, []]);

  /* THE INVERSION ARM, and it is the one that keeps this a RULE rather than a
     list of spellings. Every member of `OBSERVATION_AUTHORITY_KINDS` gets a row
     whose authority resolves to NOTHING, over a capture that DOES resolve — so
     the only variable is the authority, which is the break-only-the-thing rule
     applied to a fixture instead of to a control arm. A tenth kind added to that
     constant with no resolver in `#observationBundles` is WITHHELD and this arm
     stays green; a tenth kind waved through by omission turns it red. */
  const KINDS = Object.keys(OBSERVATION_AUTHORITY_KINDS);
  for (const k of KINDS)
    await obj.recordCapturedLocator({
      address: `https://example.gov/rec103-kind-${k}`,
      addressNorm: `https://example.gov/rec103-kind-${k}`,
      captureSha: SHA_OPEN, retrieved: at(80000),
      authorityKind: k, authority: `REC103-UNRESOLVABLE-${k}` });
  const m2 = await DO("frontier", `level=document&limit=500&viewer=class:member`);
  const u2 = await DO("frontier", `level=document&limit=500&viewer=member:not-invited`);
  const kindsSeen = (f) => KINDS.filter((k) =>
    (f.looked || []).some((r) => r.subject === `https://example.gov/rec103-kind-${k}`));

  t("I7: the fixture ARMED — every authority kind in the vocabulary actually wrote a row "
  + "(an arm that did not arm is a finding, and this one has nine chances to not arm)",
    [kindsSeen(m2).length, KINDS.length >= 9], [KINDS.length, true]);

  t("I8: THE INVERSION — an authority this record cannot attribute to a bundle WITHHOLDS the row, "
  + "for every member of the vocabulary. The referent resolves to nothing while the capture "
  + "back-reference resolves fine, so the authority is the only variable. Anything the resolver "
  + "does not UNDERSTAND fails closed rather than being waved through by omission",
    kindsSeen(u2), []);

  t("I8b: …and the SAME uninvited member still sees the open bundle's row, so I8 measured a fence "
  + "and not an outage — six reds read exactly like six arms working without this row",
    subj(u2).includes("https://example.gov/rec103-open-target"), true);

  /* THE RUN REFERENT, IN BOTH DIRECTIONS. It is the one referent the resolver
     DELEGATES rather than resolving — `aiRunLog` already gates on
     `ai_runs.context_id` and a second implementation of one gate is the
     mirror-and-drift class — so it is the one that most needs driving, and I8's
     unresolvable fixture only exercises the closed half. Two real runs, one in
     each kind of context, and the rows are otherwise identical. */
  for (const [run, ctxType, ctx] of [["RUN-2026-0916-rec103-open", "information", OPEN],
                                     ["RUN-2026-0916-rec103-secret", "project", SECRET]]) {
    const o = await POST(`op=airunopen&token=${TOK}`, {
      run, contextType: ctxType, contextId: ctx, label: "REC-103's fence fixture", mode: "check",
      principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 4, unit: "requests" }], leaseMs: 600000, at: at(90000) });
    if (!o || o.ok === false) throw new Error(`airunopen ${run}: ${JSON.stringify(o).slice(0, 300)}`);
    await obj.recordCapturedLocator({
      address: `https://example.gov/rec103-run-${ctxType}`,
      addressNorm: `https://example.gov/rec103-run-${ctxType}`,
      captureSha: SHA_OPEN, retrieved: at(90000), authorityKind: "run", authority: run });
  }
  const m3 = await DO("frontier", `level=document&limit=500&viewer=class:member`);
  const u3 = await DO("frontier", `level=document&limit=500&viewer=member:not-invited`);

  t("I9: THE RUN REFERENT ARMED — both rows were written under a `run` authority over the SAME "
  + "capture, so the run's context is the only thing that differs between them",
    [subj(m3).includes("https://example.gov/rec103-run-information"),
     subj(m3).includes("https://example.gov/rec103-run-project")], [true, true]);

  t("I9b: A ROW UNDER A RUN IS GATED ON THAT RUN'S CONTEXT, and the gate is DELEGATED to "
  + "`aiRunLog` rather than re-implemented — handing a run id to a caller who cannot see its "
  + "context is `op=airuns`' disclosure by a new door. The information-context row is published "
  + "to the uninvited member and the project-context row is not, which is the fence proving it "
  + "is a fence rather than a refusal of everything",
    [subj(u3).includes("https://example.gov/rec103-run-information"),
     subj(u3).includes("https://example.gov/rec103-run-project"),
     JSON.stringify(u3).includes("RUN-2026-0916-rec103-secret")],
    [true, false, false]);
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

/* ========================================================================= *
 *  I · REC-100 — WHAT THE `run` CARVE-OUT IS ACTUALLY WAITING ON.
 *
 *  APPENDED 2026-09-16. C-22.10 does not fire on `authority_kind = run`
 *  (D-366). REC-100 was spawned to DELETE that carve-out and did not, because
 *  its own accepts-when requires the `overstrict` arm to come back EMPTY first
 *  and it does not. These assertions are the MEASUREMENT of why — driven
 *  through the real plane, because the blocker recorded in three places named
 *  writers that either do not exist under this authority or cannot satisfy the
 *  rule at all, and this repository's standing rule is that a blocker is a
 *  claim nothing audits.
 *
 *  THEY PIN A GAP RATHER THAN A CAPABILITY, WHICH IS DELIBERATE AND IS THE
 *  POINT. Each one states what is true TODAY. When the gap closes, the arm goes
 *  red AT THE SITE THAT HAS TO CHANGE and names it — which is how the next
 *  worker finds these three places instead of re-deriving them. A finding left
 *  in prose reaches nobody; this is the same finding with a failing test
 *  attached to it.
 * ========================================================================= */
console.log("\n--- I · REC-100: the three live `run` PRESENT writers (D-366) ---");

{
  const B2 = "INQ-2026-0916-rec100";
  const R2 = "RUN-2026-0916-rec100";
  await POST(`op=promote&token=${TOK}`, {
    bundleId: B2, base: null, snapKey: "20260916T090000Z_inbox", author: "ruth",
    meta: { object_type: "inquiry", group: "believe-in-oakland",
            title: "what is the carve-out waiting on?", current_state: "open",
            created: T0, last_updated: T0 },
    files: [{ path: "bundle.md", text: `---\nid: ${B2}\n---\n\n## Question\n\nWaiting on what?\n`,
              bytes: 90, sha256: SHA_A }],
    register: [],
  });
  await POST(`op=airunopen&token=${TOK}`, {
    run: R2, contextType: "inquiry", contextId: B2, label: "REC-100's fixture", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }], leaseMs: 600000, at: T0,
  });

  /* I1 — THE WRITE DOOR IS ALREADY OPEN, and nothing in the record said so.
     D-366 reads as though the fold cannot carry a referent at all; in fact
     `aiRunTick` hands the caller's entry straight to `#aiRunAppend`, which reads
     `entry.result_ref`. So the plane half of "the run's writers carry referents"
     needs NO plane change — which is exactly the kind of already-built
     precondition a decomposition rests a deferral on without checking. */
  const withRef = await POST(`op=airuntick&token=${TOK}`, {
    run: R2, at: at(5000), leaseMs: 600000, consume: { fetches: 1 },
    log: [{ level: "document", subject: "observation:budget-2026", state: "PRESENT",
            result_kind: "capture", result_ref: SHA_B,
            detail: "a run PRESENT that DOES name what it found" }],
  });
  t("I1: a `run` PRESENT that CARRIES a referent is accepted through `op=airuntick` — "
  + "the write door is already open and needs no plane change",
    [withRef && withRef.appended, (withRef && withRef.refused || []).length], [1, 0]);

  /* I2 — INVERTED 2026-09-17 BY REC-113 / IC-116, WHICH IS THE ARM WORKING
     EXACTLY AS REC-100 BUILT IT TO.
     ==================================================================
     REC-100 wrote this assertion to PIN A GAP rather than a capability, and said
     so in this section's header: *"Each one states what is true TODAY. When the
     gap closes, the arm goes red AT THE SITE THAT HAS TO CHANGE and names it —
     which is how the next worker finds these three places instead of re-deriving
     them."* It went red here, on the site that changed, and this is the
     CORRECTION rather than an exemption: the old assertion was true when it was
     written and is now false, and saying which is the whole value of having
     written it.
     WHAT IT USED TO ASSERT, kept so the inversion is legible: `aiRunLog`'s SELECT
     listed `seq, at, level, subject, state, governed, condition, bound, terminal,
     detail` and NOT `result_kind` / `result_ref`, so a referent that WAS stored
     could not be seen through the op — which made REC-100's own accepts-when
     ("rows read back with their coverage claim STATED as undetermined")
     unsatisfiable, because a field the read never projects cannot be stated as
     anything.
     WHAT IT ASSERTS NOW: the referent is VISIBLE, and — the half the projection
     alone would not have bought — the claim it supports is SAID. A `null`
     `result_ref` is an absence with two causes (never written, or dropped by the
     read); `coverage: "backed"` is a statement. Note this row is the one that
     CARRIES a referent, so it must read `backed` and NEVER `undetermined`: the
     failure that costs here is the record saying it does not know something it
     does know. I2b below drives the other direction. */
  const back = await GET(`op=airunlog&token=${TOK}&run=${R2}`);
  t("I2: …and `op=airunlog` NOW PROJECTS IT — the stored referent is visible AND the coverage "
  + "claim it supports is STATED as `backed`, never left to be inferred from a non-null "
  + "(REC-113 / IC-116 closes the READ half of D-366)",
    [back.entries[0].state, back.entries[0].result_kind, back.entries[0].result_ref,
     back.entries[0].coverage],
    ["PRESENT", "capture", SHA_B, "backed"]);

  /* I2b — THE ARM THIS ITEM EXISTS FOR, AND IT IS DRIVEN THROUGH THE OP RATHER
     THAN AT THE STORE, because `op=invitelook` shipped with a ReferenceError
     while 1,276 assertions passed.
     A BARE `run` PRESENT — the exact shape C-22.10's carve-out admits (D-366) —
     is appended, then read back. It must come back STATED as `undetermined`:
     NEVER FILLED (no referent is invented to get past a gate — that is the
     failure CLAUDE.md names by name), NEVER DROPPED (the row is still there, in
     order, with its state intact), and NEVER INFERRED FROM A SIBLING ROW — which
     is why this run already contains a row that IS backed, so a read that
     borrowed a neighbour's referent would answer `backed` here and fail. */
  const bare = await POST(`op=airuntick&token=${TOK}`, {
    run: R2, at: at(6000), leaseMs: 600000, consume: { fetches: 1 },
    log: [{ level: "document", subject: "observation:budget-2025", state: "PRESENT",
            detail: "a run PRESENT that names NOTHING — the carve-out's own shape" }],
  });
  const back2 = await GET(`op=airunlog&token=${TOK}&run=${R2}`);
  const bareRow = back2.entries.find((e) => e.subject === "observation:budget-2025");
  t("I2b: a pre-existing bare `run` PRESENT is accepted (the carve-out STANDS — this item did "
  + "not touch `checkObservation`) and reads back STATED as undetermined: not filled, not "
  + "dropped, and not inferred from the backed sibling one row above it",
    [bare && bare.appended, (bare && bare.refused || []).length,
     bareRow?.state, bareRow?.result_kind, bareRow?.result_ref, bareRow?.coverage],
    [1, 0, "PRESENT", null, null, "undetermined"]);

  /* I2c IS LOAD-BEARING AND THE NEGATIVE CONTROL IS WHAT PROVED IT, which is
     worth knowing before anyone decides it duplicates I2b.
     Under this item's `projection` arm — the two columns removed from the SELECT
     so the read projects NOTHING — I2b AND I2d BOTH CAME BACK GREEN. They had to:
     with the columns gone `e.result_ref` is `undefined`, so a row that has no
     referent reads `null / null / undetermined`, which is exactly what it should
     read. An assertion over a row with nothing to show CANNOT TELL "the record
     has no referent" from "the read dropped the column" — the same two bytes for
     two different facts, which is D-366's own shape arriving inside the suite
     written to close it.
     So only a row that HAS a referent can detect a missing projection. I2 and
     this line are those rows. A suite built only around the undetermined case
     would have passed, in full, over a read that projected nothing at all. */
  t("I2c: …and the SIBLING is untouched by it — the backed row still reads `backed` after an "
  + "undetermined row lands in the same run, which is what makes I2b a per-row statement "
  + "rather than a property of the answer",
    back2.entries.find((e) => e.subject === "observation:budget-2026")?.coverage, "backed");

  /* I2d — THE OTHER DIRECTION, AND IT IS THE ONE THAT PROTECTS THE RECORD FROM
     MANUFACTURING AN UNKNOWN. A `LOOKED_ABSENT` row has nothing to point at BY
     DEFINITION — that is what it found out — so calling it undetermined would be
     the record saying it does not know something it DOES know. `none_owed` is
     that third value, and it is why this item did not simply answer
     "undetermined whenever `result_ref` is null". */
  await POST(`op=airuntick&token=${TOK}`, {
    run: R2, at: at(7000), leaseMs: 600000, consume: { fetches: 1 },
    log: [{ level: "document", subject: "observation:never-existed", state: "LOOKED_ABSENT",
            detail: "positively gone, 404 from the origin" }],
  });
  const back3 = await GET(`op=airunlog&token=${TOK}&run=${R2}`);
  t("I2d: a LOOKED_ABSENT row reads `none_owed`, NOT undetermined — a row with nothing to "
  + "point at by definition is not an unknown, and manufacturing one would be an overclaim "
  + "wearing the costume of caution",
    back3.entries.find((e) => e.subject === "observation:never-existed")?.coverage, "none_owed");

  /* I2e — THE READ AND THE REFUSAL HELD TOGETHER BY DRIVING BOTH, not by
     asserting that somebody kept two literals in step. `observationCoverage`
     answers `undetermined` on exactly the rows C-22.10 would REFUSE under a
     non-`run` authority; if the two ever drift, this goes red. `checkObservation`
     is imported and driven — it is NOT edited by this item, and must not be:
     widening the carve-out is REC-100's refused scope and a lifecycle deadlock
     (`op=airunclose` answers `OBS_PRESENT_NO_REFERENT`, so a run that observed
     anything PRESENT cannot be closed at all). */
  {
    const matrix = [
      { state: "PRESENT",              resultRef: null },
      { state: "PRESENT",              resultRef: SHA_B },
      { state: "LOOKED_ABSENT",        resultRef: null },
      { state: "LOOKED_INDETERMINATE", resultRef: null },
      { state: "NEVER_LOOKED",         resultRef: null },
    ];
    const refusesUnderSweep = matrix.map((m) => !!checkObservation(
      { level: "document", subject_kind: "address", subject: "https://example.gov/x",
        state: m.state, result_ref: m.resultRef,
        actor_class: "machine", authority_kind: "sweep", authority: "SWEEP-1" },
      QUEUE_CONDITION_KINDS));
    const saysUndetermined = matrix.map((m) => observationCoverage(m) === "undetermined");
    t("I2e: the read's `undetermined` fires on EXACTLY the rows C-22.10 refuses elsewhere — "
    + "the read and the refusal share one rule instead of two literals somebody must keep "
    + "in step, and the carve-out itself is UNTOUCHED",
      saysUndetermined, refusesUnderSweep);
    t("I2f: …and that agreement is not free — the matrix genuinely contains both answers, so "
    + "two all-false lists cannot pass it (an equality that costs nothing is not evidence)",
      [refusesUnderSweep.filter(Boolean).length, refusesUnderSweep.filter((x) => !x).length],
      [1, 4]);
  }

  /* I3 — THE ROLLUP, AND IT IS THE FINDING THAT UNSEATS D-366's REMEDY.
     `#aiRunTerminate` writes the run's terminal entry with `#aiRunSearchState`'s
     state — a reduction over the run's WHOLE log. Because this run wrote a
     PRESENT, the rollup is PRESENT, and the terminal row carries no referent.
     No writer-side work fixes this: a summary does not report a look, so there
     is no single thing for it to point at. D-366 says the carve-out becomes
     "ONE DELETED CONDITION" once the writers carry referents; two of the three
     writers structurally cannot, and both of them are in this plane. */
  const closed = await POST(`op=airunclose&token=${TOK}`, {
    run: R2, at: at(9000), bound: "completed",
  });
  t("I3: the run's TERMINAL entry is a bare `run` PRESENT — `#aiRunSearchState` ROLLS UP the "
  + "run's whole log, and a summary PRESENT has no referent BY CONSTRUCTION, so no writer "
  + "change can satisfy C-22.10 here (a DESIGN GAP against §3, not a defect in the writer)",
    closed && closed.state, "PRESENT");
  const after = await GET(`op=airunlog&token=${TOK}&run=${R2}`);
  const terminal = after.entries.filter((e) => e.terminal === true);
  t("I4: …and it is written to the log as one row, terminal, PRESENT — driven rather than "
  + "read off the method, because a blocker is a claim and nothing here audits one",
    [terminal.length, terminal[0]?.state], [1, "PRESENT"]);
}

console.log(`\nobservation-log: ${pass} pass, ${fail} fail`);
} finally { await mf.dispose(); }
/* EXPLICIT IN BOTH DIRECTIONS, which `hygiene.test.mjs` requires of every suite:
   `process.exit(1)` alone leaves the GREEN path to node's default, and a suite
   that merely declines to fail is not the same as one that says it passed. */
process.exit(fail ? 1 : 0);
