/* NEGATIVE CONTROL: (declared and RUN 2026-09-17, REC-110 / D-386, worktree
   agent-adcd3110010904330) FOUR arms over section J's pin — `node test/nc-rec110.mjs
   [arm|all]`, which drives THIS suite on every arm as well as the document and content
   suites, because REC-110's ruling is ONE ruling at THREE sites. The full declaration is at
   the head of `observation-log.test.mjs` and is deliberately not restated here. Baseline
   both ends for THIS suite: 74 pass / 0 fail.
   (a) `gate` (b) `bound` (c) `unsay` — all three arm sites ONE LEVEL OVER and this suite is
       GREEN under every one of them. **That is reported as a RESULT and not as a gap**: it
       is the evidence those arms are local to the site they patch, which is what makes
       `break only the thing` true here rather than asserted.
   (d) `overstrict` — the tally's VALUES changed legitimately: GREEN, 74/0.
   **THE FINDING THIS SUITE CONTRIBUTED, AND IT CORRECTED THE ITEM'S OWN ASSUMPTION RATHER
   THAN ITS CODE.** J0 and J4 were first written as the DOCUMENT level's arms — *the DENY
   caller receives NO rows* — and BOTH FAILED, 1 looked and 2 never_looked. The cause is
   neither a leak nor a defect: `#frontierMeaning` DELIBERATELY DOES NOT GATE AN ENTITY,
   REC-95's decision stated at the site and raised to be ruled rather than inherited. **The
   assumption that three levels fence alike is the thing that was wrong**, and the arms were
   CORRECTED to the measured truth rather than loosened until they passed — a loosened J0
   would have silently pinned a fence nobody had checked. J0 is now kind-scoped to the two
   kinds this level actually gates, and J4 asserts that `by_subject_kind` MUST follow the
   reader, because pinning it invariant beside `tally` would pin a leak into place. */
/* NEGATIVE CONTROL: (declared 2026-09-15, REC-95, worktree agent-aa10d195065b703e8) SIX arms,
   RUN in one step through `node test/nc-rec95.mjs [arm]` (the driver lives INSIDE this worktree),
   each armed ALONE with every other defence held open, each DECLARED must-fail or must-not-fail
   BEFORE it ran, each mutation passing an anchor-occurs-EXACTLY-ONCE guard and a
   bytes-really-changed guard, and every restore verified by sha256 AND by `cmp` against a PRISTINE
   copy named UNIQUELY PER ARM with a byte count printed and a minimum guarded. An opening AND a
   closing BASELINE row bracket the run, because a harness that reported the same answer for every
   arm INCLUDING the baseline is on record in this repository, and without a baseline row six reds
   read exactly like six arms working.
   (a) `baseline` — nothing armed. Declared: everything green. It is the row that distinguishes
       five-arms-broken from five-arms-working.
   (b) `reader` — THE QUEUE ROW'S OWN CONTROL, first half: REMOVE THE READER-RUN WRITER.
       (The two words the marker uses are deliberately not repeated in any arm below: the register
       reads a declaration to the end of its paragraph or until the MARKER PHRASE recurs, so an arm
       that quoted it truncated this whole declaration after arm (a) and the suite was reported
       UNCLASSIFIED. Found by `scripts/coverage.mjs --strict`, which refused to fold an
       uncountable declaration silently into the tally — D-233 working exactly as built.)
       Declared MUST FAIL: section C's arms and section F's `ran_and_found_nothing` arm for a
       capture — a reader run that HAPPENED reads as never-run. Declared MUST NOT FAIL: REC-94's
       content-level arms in `observation-content.test.mjs` and REC-93's document-level arms in
       `observation-log.test.mjs`, because this item's writers are separate from both and the
       one-append-site claim is false if they are entangled.
   (c) `resolution` — REMOVE THE RESOLUTION-ATTEMPT WRITER. Declared MUST FAIL: section D, and
       section F's reference partition. Declared MUST NOT FAIL: sections C and E, which are the
       other two acts — if either moves, the three writers are not three.
   (d) `derivation` — REMOVE THE CONNECTION-DERIVATION WRITER. Declared MUST FAIL: section E and
       section F's entity partition. This is the arm the design's §9 names for this row: *one
       writer removed → the level reads never-run for a run that happened.*
   (e) `empty` — THE OVER-STRICTNESS ARM, AND THE QUEUE ROW'S OWN SECOND CLAUSE: make a look that
       found NOTHING write no row at all (return before the append when the state is
       LOOKED_ABSENT). Declared MUST FAIL: section G's arms BY NAME — *a run that derived nothing
       is recorded as run-and-empty, not as absent*. This is the arm that matters most in this
       item, because the defect it plants is INVISIBLE to every arm about a look that found
       something, and it restores exactly the silence this row exists to end.
   (f) `cause` — collapse §5.1's three causes at the meaning level, so a missing row reads as
       nobody-looked whatever its cause. Declared MUST FAIL: section G's order arms and the
       weakest-default arm. REC-94 shipped this defect once at the content level and caught itself
       mid-run; the arm exists here because the defect is a missing QUESTION rather than a wrong
       answer and nothing about the code looks wrong with it applied.
   THE ACTUAL RESULTS OF EVERY ARM ARE IN `CLAIMS.md`'s release line for REC-95, including the
   ones that came back other than declared.
   WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered: every one is a
   source-level mutation inside this plane. Nothing here exercises a second instance, a real
   network fetch, a real doctype reader (every reading below is composed by this suite, so a
   reading the acquire wire emits in a shape nobody anticipated is outside every arm), or the
   doctype REGISTRY — which is why §4.3's third reader-run outcome is asserted only against the
   pure function's pinned seam and is NOT driven end to end. It has no producer on this tree and
   the suite says so rather than faking one.

   NOTE ON THE MACHINE THIS RAN ON: the first full-battery baseline taken for this item lost seven
   suites to `SQLITE_CANTOPEN` / `SQLITE_IOERR_SHMSIZE` because the volume was at 100%. Every one
   passed alone at exit 0 and the re-run was 205/205. If suites in this neighbourhood ever fail
   with a workerd SQLite open error, read `df` before reading the diff.

   ===== REC-107's ARMS ARE DECLARED IN THIS SAME BLOCK AND NOT UNDER A SECOND MARKER =====
   (declared and RUN 2026-09-17, REC-107, worktree agent-a9a42611f2cdf409e, driver
   `node test/nc-rec107.mjs [arm]`.) The marker phrase is deliberately NOT repeated: the
   coverage register reads a declaration to the end of its paragraph or until the MARKER
   RECURS, and a second marker here would TRUNCATE the declaration above it — the exact
   failure recorded in arm (b) of that declaration, which cost REC-95 an UNCLASSIFIED
   suite. One marker, one declaration, two items' arms.
   THE DRIVER RUNS **BOTH** THIS SUITE AND `observation-content.test.mjs` ON EVERY ARM,
   because REC-107 swept one class across two levels and a driver running only the rowed
   level could not tell a fix that CLOSED one level from a fix that ENTANGLED them.
   EIGHT arms, baseline first, every one AS DECLARED on the final run — baseline 139/0:
   (a) `baseline` — nothing armed. Declared green. 139 pass, 0 fail.
   (b) `never` — THE ROW'S OWN CONTROL: drop `never_looked` from the TWO-SIDED undetermined
       set, restoring exactly the claim that shipped. Declared MUST FAIL: H1 here and H4 in
       the content suite. Declared MUST NOT FAIL: every ONE-SIDED answer. 2/2.
   (c) `onesided` — collapse the one-sided widening onto the two-sided set. Declared MUST
       FAIL: H2, H3, H8. Declared MUST NOT FAIL: the whole content suite, which takes the
       other branch — the orthogonality pair, and it held. 3/3.
       **`H5` WAS DECLARED MUST-FAIL AND CAME BACK GREEN, AND THE ARM WAS RIGHT**: an
       unrecognised cause word exits one line ABOVE the return this arm patches, so the
       function has TWO wide exits for two different reasons and this mutation cannot reach
       the other. The declaration was corrected, not the arm.
   (d) `weakdefault` — THE QUIET ONE. Rewrite `=== false` to a falsy test, so an UNDECLARED
       sidedness inherits the STRONG answer by omission. Every declared kind still answers
       correctly and nothing about the code looks wrong with it applied. Declared MUST FAIL:
       H3 ALONE, and H3 alone is what failed. 1/1.
   (e) `rowfield` — stop publishing the two fields ON the row, leaving the rule correct and
       unreachable: the state this item found. Declared MUST FAIL: H7, H8, H9 here and H2,
       H3 in the content suite. 5/5.
       **THIS ARM FOUND A DEFECT IN THIS ITEM'S OWN INSTRUMENT ON ITS FIRST RUN.** Removing
       the field made four of section H's assertions dereference `.length` / `.every` on
       `undefined`, and a TypeError inside an assertion goes through NO assertion at all —
       BOTH suites died with tallies of -1 instead of going red. Every dereference in
       section H at both levels is now guarded by `Array.isArray`. The control found the
       instrument wrong, which is where WORKER.md says controls find them most often.
   (f) `prose` — restore the two-member assertion in the `purged` SENTENCE alone, so the
       prose claims a set the row's own field contradicts. Declared MUST FAIL: H10 alone,
       proving no computed value is load-bearing on a canned string. 1/1.
   (g) `extrakey` — armed as an over-strictness arm and RED IS THE CORRECT ANSWER, which is
       the finding. It adds an UNMEASURED fourth kind to `MEANING_EVIDENCE_IS_ONE_SIDED` and
       `A4` refuses it. A kind's sidedness is a MEASUREMENT — whether that evidence table
       holds a row when the answer was no — so A4 is refusing an unmeasured claim about the
       record's own coverage rather than being over-strict. The DECLARATION was corrected;
       the assertion was NOT loosened, because an exempted test is a rule nobody enforces.
   (h) `extrakey_content` — THE ACTUAL OVER-STRICTNESS ARM, rebuilt after (g): a declared
       kind added to the CONTENT level's map, which no assertion pins by key set. Declared
       MUST STAY GREEN and did, 139/0 — which is what proves section H reads the published
       map rather than pinning the three kinds it was written against, and what lets
       `OBSERVATION-LOG-DESIGN.md` §8's fourth item land without this suite refusing it for
       being NEW rather than for being wrong.
   WHAT REC-107's ARMS CANNOT SEE: **no arm reaches a genuinely PRE-LOG corpus**, because
   neither suite can register a subject before the log's first row at its own level. The
   `purged` cause is driven at a REFERENCE through the null-`entered` path
   `#missingMeaningCause`'s own guard exists for, and on the PURE RULE for every other kind.
   That is the same window this item concluded cannot be closed, so the control shares the
   subject's limit rather than covering it. */

/* REC-95 — THE MEANING-LEVEL WRITERS: THE READER RUN, THE RESOLUTION ATTEMPT,
 * THE CONNECTION DERIVATION.
 * =====================================================================
 *
 * `docs/development/OBSERVATION-LOG-DESIGN.md` §4.3 and its §8 decomposition row
 * 3 — the TABLE is the scope's authority and the queue row is the pointer. It
 * sits on REC-93's landing (one table, one append site, one vocabulary) and
 * beside REC-94's (the content level). This item is the THIRD writer into that
 * site and adds no table, no column and no refusal.
 *
 * WHY IT MATTERS, in the design's own words (§2's table, the row it gives the
 * reading): **the RESULT is on the reading; the LOOK is not recorded anywhere.**
 * Until this landing a reader that ran over a document and found nobody, a
 * recogniser that tried a name against the registry and matched nothing, and a
 * derivation that found no connections through a subject ALL LEFT THE SAME
 * EVIDENCE AS NEVER HAVING HAPPENED — an empty set. CLAUDE.md's standing rule is
 * that *no meaning derived may mean nothing was extracted* and that saying which
 * is a first-class obligation; this is the level at which the record could not
 * say, and §5.1 is the rule it must not break while learning to.
 *
 * THE ARMS ARE WEIGHTED AT THE PLACE THAT CAN LIE, AND AT THIS LEVEL THAT PLACE
 * IS THE EMPTY ANSWER. A look that found something is easy and every arm about
 * one would pass over a writer that simply dropped the empty case — which is
 * precisely the state the record was already in. So section G exists, the
 * `empty` control arm exists, and both are pointed at the same sentence.
 *
 * SEVEN SECTIONS:
 *   A. THE VOCABULARY AS A MECHANISM — the seventh subject kind, and §5.1's
 *      cause keys shared with the content level rather than re-spelled.
 *   B. THE PURE JUDGEMENT — all three acts, every outcome, without workerd.
 *   C. THE READER RUN, driven through `op=promote`.
 *   D. THE RESOLUTION ATTEMPT, driven through `op=resolve`.
 *   E. THE CONNECTION DERIVATION, driven through `op=connect`.
 *   F. `op=frontier&level=meaning` — bounded, three partitions, and the fence.
 *   G. **NOTHING DERIVED IS NOT NEVER RUN** — the accepts-when, and §5.1's order.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { OBSERVATION_SUBJECT_KINDS, OBSERVATION_AUTHORITY_KINDS, OBSERVATION_STATES,
         MISSING_ROW_CAUSES, MEANING_MISSING_ROW_CAUSES, MEANING_EVIDENCE_IS_ONE_SIDED,
         ALL_MISSING_ROW_CAUSES, causesNotRuledOut,
         readerRunObservation, resolutionObservation, derivationObservation } from "../src/airun.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC = {
  airun: readFileSync(new URL("../src/airun.mjs", import.meta.url), "utf8"),
  store: readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8"),
};

const TOK = "mem-rec95";
const ADM = "adm-rec95";
const NOW = "2026-09-15T09:00:00Z";
const LATER = "2026-09-15T10:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec95",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const obj = ns.get(ns.idFromName("bio"));
/* The Durable Object takes its op from the PATH. Driven directly only where an
   arm needs a VIEWER the control plane would never stamp; everything else goes
   through the op, because a store-level test and a passing battery are not
   evidence that a caller can reach the feature. */
const DO = async (op, q = "") => rP(await (await obj.fetch(`http://x/${op}?${q}`)).json());

/* ========================================================================= *
 *  A · THE VOCABULARY IS A MECHANISM, NOT A SPELLING.
 *
 *  This item adds ONE member to an existing vocabulary and re-uses everything
 *  else. The arms below are what make a fourth spelling of §5.1's causes, or an
 *  eighth subject kind arriving unremarked, a BUILD ERROR rather than a review
 *  finding — the arrangement CONDUCT ruled for the content axis on 2026-09-14,
 *  applied to the thing the content axis is read under.
 * ========================================================================= */
console.log("\n--- A · the vocabulary: one seventh member, and §5.1's causes shared not re-spelled ---");

t("A1: `derive` is the authority kind this level writes under and REC-93 ALLOCATED IT FOR THIS "
+ "ITEM — so this arrives as a WRITER into an existing vocabulary rather than as a second one, "
+ "which is the one-table decision doing its job",
  [Object.prototype.hasOwnProperty.call(OBSERVATION_AUTHORITY_KINDS, "derive"),
   OBSERVATION_AUTHORITY_KINDS.derive.includes("REC-95")],
  [true, true]);

t("A2: THE SEVENTH SUBJECT KIND. A resolution attempt's subject is a REFERENCE, and it cannot be "
+ "`entity`: an attempt that FAILS names no entity, and that failing attempt is the look §4.3 "
+ "exists to record. All seven carry a sentence a member could read",
  [Object.keys(OBSERVATION_SUBJECT_KINDS).sort(),
   Object.values(OBSERVATION_SUBJECT_KINDS).every((v) => typeof v === "string" && v.length > 30)],
  [["address", "capture", "description", "entity", "extent", "reference", "unstated"], true]);

t("A2b: and `reference` says in its own sentence that it may match NO entity — the reason it is "
+ "not `entity` travels with the word rather than living only in a commit message",
  /no entity at all/.test(OBSERVATION_SUBJECT_KINDS.reference), true);

/* THE MECHANISM ARM FOR §5.1. The three causes are the DESIGN's and are the same
   three at every level; only the sentences are per level. Asserting the KEY SETS
   are equal is what makes a fourth level that invents a fourth key fail here
   rather than pass review — and it is the arm that would have caught a level
   spelling `neverLooked` beside `never_looked`. */
/* CORRECTED BY D-516, AND THE ARM'S PROPERTY IS THE ONE THAT MATTERED RATHER THAN
   THE LITERAL. It read `[["never_looked","pre_log","purged"], [same]]`, and BOB #33
   (2026-09-24 17:58Z) added `watermark_band` to BOTH maps — a word that names not a
   §5.1 cause but WHICH TWO OF THE THREE the stored watermark's whole-second
   precision left open. The thing this arm exists to catch is a LEVEL INVENTING A
   WORD THE OTHER DOES NOT HAVE, and that is now asserted as the equality it always
   was, with §5.1's own unchanged three asserted BESIDE it from
   `ALL_MISSING_ROW_CAUSES` — so a level adding a fifth word one side only still
   fails here, and a later session cannot mistake the published vocabulary for the
   undetermined set again. */
t("A3: THE CAUSE VOCABULARY is keyed IDENTICALLY at the content and meaning levels — one "
+ "vocabulary, two sets of sentences, and a word one level invents fails HERE. §5.1's own "
+ "THREE causes are the undetermined set and are unchanged beside it",
  [Object.keys(MISSING_ROW_CAUSES).sort(), Object.keys(MEANING_MISSING_ROW_CAUSES).sort(),
   [...ALL_MISSING_ROW_CAUSES].sort()],
  [["never_looked", "pre_log", "purged", "watermark_band"],
   ["never_looked", "pre_log", "purged", "watermark_band"],
   ["never_looked", "pre_log", "purged"]]);

t("A3b: and the SENTENCES differ, because the evidence differs — sharing the keys must not "
+ "quietly mean sharing the reasons, which would say `readings` is the pre-log evidence for a "
+ "reference",
  Object.keys(MEANING_MISSING_ROW_CAUSES)
    .filter((k) => MEANING_MISSING_ROW_CAUSES[k] === MISSING_ROW_CAUSES[k]), []);

/* THIS LEVEL'S OWN FINDING, ASSERTED AS A STRUCTURE RATHER THAN WRITTEN IN A
   COMMENT. At two of three subject kinds the pre-log evidence exists only where
   the answer was YES, so §5.1's cause (3) is unreachable over the pre-log window
   for those two. A later reader who assumes all three levels resolve §5.1 the
   same way is wrong, and this is where they find out. */
t("A4: THE ONE-SIDED EVIDENCE, and it is this level's own finding: a `readings` row exists "
+ "whether or not the reader found anything, but `resolutions` and `connections` hold a row ONLY "
+ "where the answer was yes — so at a reference or an entity a pre-log look that found NOTHING is "
+ "indistinguishable from no look at all, and the record says so instead of guessing",
  [MEANING_EVIDENCE_IS_ONE_SIDED.capture, MEANING_EVIDENCE_IS_ONE_SIDED.reference,
   MEANING_EVIDENCE_IS_ONE_SIDED.entity,
   Object.keys(MEANING_EVIDENCE_IS_ONE_SIDED).sort()],
  [false, true, true, ["capture", "entity", "reference"]]);

t("A5: `partial` is in D-129's set already, so a CUT derivation is recorded in the record's "
+ "existing vocabulary and this item coins no state — §3's rule that the state column is not a "
+ "SQL enum does not license a new word either",
  [Object.prototype.hasOwnProperty.call(OBSERVATION_STATES, "partial"),
   Object.keys(OBSERVATION_STATES).sort()],
  [true, ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "NEVER_LOOKED", "PRESENT", "partial"]]);

/* THE STORE HOLDS NO SECOND OPINION. Every judgement above is made in `airun.mjs`
   and `store.mjs` only puts judged rows in — `checkObservation`'s arrangement and
   `contentObservationsFor`'s, and the reason is the same one C-5 measured: a rule
   with two implementations is a rule whose control proves nothing about either. */
/* CORRECTED BEFORE LANDING, AND THE CORRECTION IS A FINDING ABOUT THE ARM RATHER
   THAN ABOUT THE SUBJECT — recorded, not smoothed (WORKER.md).
   THE FIRST DRAFT MATCHED `/C-22\.\d+/` over the writers' span and went RED on a
   correct implementation, because the writers' COMMENTS cite the refusals they
   rely on ("C-22.10 requires a referent", "refused by C-22.9"). That is a
   classifier grading a LITERAL and calling it a rule — the exact shape
   WORKER.md's sweep section names, arriving inside this suite's own instrument.
   Citing a refusal is what a well-commented writer SHOULD do; the property that
   actually matters is that the writer never CONSTRUCTS one, because a refusal
   built at this site would be a second copy of a rule that lives in `airun.mjs`
   (C-5's finding, and the reason `checkCondition` collapsed to one
   implementation). So the arm tests for the CONSTRUCTOR and for the catalogue
   import, which is what a second opinion would have to reach for. */
/* AND CORRECTED A SECOND TIME, FOR A DIFFERENT DEFECT IN THE SAME ARM — recorded
   because two instrument defects in one arm is the finding, not an embarrassment.
   THE SPAN WAS HALF THE FILE. `indexOf("#observeReaderRun")` finds the CALL SITE
   inside `#writeReadings`, which is ~17,000 lines ABOVE the definition, so the
   arm was measuring everything between them and going red on other items'
   refusals. It was RIGHT to go red — it had just stopped being about this item.
   An arm whose corpus is wrong fails loudly here and would have passed silently
   if the property had been the other way round, which is the direction that
   matters: anchored on the DEFINITIONS, with a size guard so a span that
   collapses to nothing cannot pass by being empty. */
{
  const from = SRC.store.indexOf("  #observeReaderRun(bundleId, captureSha, reading");
  const to   = SRC.store.indexOf("  #missingMeaningCause(subjectKind, subject");
  const span = from >= 0 && to > from ? SRC.store.slice(from, to) : "";
  t("A6: no refusal is CONSTRUCTED at any of this item's three writers — the judgement lives in "
  + "the pure module and the store puts judged rows in, which is what keeps ONE append site one "
  + "rule. Citing a refusal in a comment is fine; building one here would be a second copy of it",
    [span.length > 1000, span.length < 20000, /\brefusal\s*\(/.test(span),
     /AI_RUN_CHECKS/.test(span), (span.match(/this\.#observe\(\{/g) || []).length],
    [true, true, false, false, 3]);
}

/* ========================================================================= *
 *  B · THE PURE JUDGEMENT — §4.3's three acts, every outcome, no workerd.
 * ========================================================================= */
console.log("\n--- B · the three acts as pure functions: every outcome §4.3 names ---");

/* `read_from_text: true` AND A CHAIN ARE IN THE DEFAULT ON PURPOSE, and it was
   not in the first draft — arm C4 caught it. Without them REC-94's content-level
   writer reads the reading as *no text could be produced* and answers
   LOOKED_INDETERMINATE, so C4's pair would have been *no text* beside *nobody
   mentioned*, which is a true pair of a DIFFERENT fixture and not the one the arm
   claims. The arm exists to show a document whose TEXT WE HAVE and whose reader
   found NOBODY, because that is the combination the two levels must be able to
   tell apart; a fixture that could not produce it would have made C4 pass on the
   wrong evidence. */
const whole1 = [{ step: "layer", tier: 1, container: "pdf" }];
const readingOf = (o = {}) => ({ content_type: "meeting_minutes", reader_version: 2,
                                 read_from_text: true, text_source: whole1, text_tier: 1,
                                 text_container: "pdf", facts: {},
                                 at: NOW, found: false, entities: [], ...o });
const ENT = (k) => ({ ref: `person:${k}`, kind: "person", key: String(k), label: `Person ${k}` });

t("B1: a reader that RAN and found entities is PRESENT with the count in `detail` and the "
+ "reading as its referent — C-22.10 requires a PRESENT to point at what it found",
  await (async () => { const r = readerRunObservation(
      readingOf({ found: true, entities: [ENT(1), ENT(2)] }), "a".repeat(64)).row;
    return [r.state, r.resultKind, r.resultRef === "a".repeat(64), /found 2 entity/.test(r.detail)]; })(),
  ["PRESENT", "reading", true, true]);

t("B2: a reader that RAN and found NONE is LOOKED_ABSENT — the row this level exists for, and it "
+ "carries its referent too, because a reader that found nobody produced a reading just as one "
+ "that found somebody did",
  await (async () => { const r = readerRunObservation(readingOf({ found: false }), "a".repeat(64)).row;
    return [r.state, r.resultKind, r.resultRef === "a".repeat(64)]; })(),
  ["LOOKED_ABSENT", "reading", true]);

t("B2b: and it SAYS this is a meaning-level absence and not a statement about the document's "
+ "TEXT — the collapse REC-94's own arm B8 refuses from the other side",
  /MEANING-level absence/.test(readerRunObservation(readingOf(), "a".repeat(64)).row.detail), true);

/* THE TWO-SIGNAL RULE, IN BOTH DIRECTIONS. A reading that disagrees with itself
   is recorded at the weaker reading of the two, because the record must not claim
   more than both signals support. */
t("B3: a reading that says `found` and carries an EMPTY entity list is LOOKED_ABSENT, not PRESENT "
+ "— the empty list is what this record can actually point at",
  readerRunObservation(readingOf({ found: true, entities: [] }), "a".repeat(64)).row.state,
  "LOOKED_ABSENT");

t("B3b: and a reading that carries entities but does NOT say it found anything is ALSO "
+ "LOOKED_ABSENT — the weaker of the two signals, in the direction that claims less",
  readerRunObservation(readingOf({ found: false, entities: [ENT(9)] }), "a".repeat(64)).row.state,
  "LOOKED_ABSENT");

/* §4.3's THIRD OUTCOME AND THE SEAM IT WAITS ON. It is asserted here against the
   PINNED parameter and is NOT driven end to end, because it has no producer on
   this tree — see the head note. Asserting the seam is what gives the item that
   lands the producer a contract rather than a sentence to interpret, which is
   exactly what REC-94 did with `contentAxisFor`'s `unitIndex`. */
t("B4: `no reader is registered for this type` is LOOKED_INDETERMINATE and is reachable ONLY on "
+ "an explicit `false` — the seam is PINNED so the item that persists the fact lands into a "
+ "contract, and the third outcome is NOT faked from anything this record already holds",
  [readerRunObservation(readingOf(), "a".repeat(64), { readerRegistered: false }).row.state,
   readerRunObservation(readingOf(), "a".repeat(64), { readerRegistered: true }).row.state,
   readerRunObservation(readingOf(), "a".repeat(64), { readerRegistered: null }).row.state],
  ["LOOKED_INDETERMINATE", "LOOKED_ABSENT", "LOOKED_ABSENT"]);

t("B4b: AND AN ABSENT OR UNRECOGNISED ANSWER IS NOT TREATED AS `false`. A caller that did not say "
+ "has not established that no reader exists, and defaulting to the indeterminate would let a "
+ "reader reach `we could not read this type` BY FORGETTING TO ASK",
  [readerRunObservation(readingOf(), "a".repeat(64), {}).row.state,
   readerRunObservation(readingOf(), "a".repeat(64), { readerRegistered: "no" }).row.state],
  ["LOOKED_ABSENT", "LOOKED_ABSENT"]);

t("B5: `found: false` IS NOT PRESSED INTO SERVICE FOR THE THIRD OUTCOME — it means the reader ran "
+ "and found no entities, which is this level's LOOKED_ABSENT. Collapsing them would file every "
+ "document about nobody as a document nothing could read",
  readerRunObservation(readingOf({ found: false, content_type: "generic" }), "a".repeat(64)).row.state,
  "LOOKED_ABSENT");

t("B6: a resolution attempt that MATCHED is PRESENT, and its referent is the ENTITY — which is a "
+ "genuinely different thing from the subject here, because the subject is the reference we "
+ "searched BY and the referent is the registry entry we found",
  await (async () => { const r = resolutionObservation(
      { ref: "person:12", matches: [{ entity_id: "ENT-1", grade: "A" }] }).row;
    return [r.state, r.resultKind, r.resultRef]; })(),
  ["PRESENT", "entity", "ENT-1"]);

t("B6b: a GRADE C match is still a match and stays PRESENT — the grade travels in `detail`, never "
+ "in the state. Demoting a C here would be a fence tighter than its rule, and the record already "
+ "has one place that says what a C is worth",
  await (async () => { const r = resolutionObservation(
      { ref: "person:12", matches: [{ entity_id: "ENT-9", grade: "C" }] }).row;
    return [r.state, /grade\(s\) C/.test(r.detail)]; })(),
  ["PRESENT", true]);

t("B7: A RESOLUTION ATTEMPT THAT MATCHED NOTHING IS LOOKED_ABSENT WITH NO REFERENT — the row that "
+ "used to die with the request, and the one C-22.10 must not be able to refuse, because there "
+ "genuinely is nothing to point at",
  await (async () => { const r = resolutionObservation({ ref: "parcel:999", matches: [] }).row;
    return [r.state, r.resultKind, r.resultRef]; })(),
  ["LOOKED_ABSENT", null, null]);

t("B7b: an AMBIGUOUS name states the ambiguity and does not choose between the entities — the "
+ "registry keeps a genuinely ambiguous alias rather than pretending it away, and a writer that "
+ "picked a winner would make a judgement nobody authorised",
  await (async () => { const r = resolutionObservation({ ref: "person:12",
      matches: [{ entity_id: "ENT-1", grade: "C" }, { entity_id: "ENT-2", grade: "C" }] }).row;
    return [r.resultRef, /ambiguous/.test(r.detail)]; })(),
  ["ENT-1", true]);

t("B8: a derivation that WROTE connections is PRESENT with the count and the document set in "
+ "`detail`",
  await (async () => { const r = derivationObservation(
      { entityId: "ENT-1", count: 3, documents: 3 }).row;
    return [r.state, r.resultRef, /wrote 3 connection/.test(r.detail)]; })(),
  ["PRESENT", "ENT-1", true]);

t("B9: A DERIVATION THAT RAN AND WROTE NOTHING IS LOOKED_ABSENT AND SAYS SO — this is the row "
+ "this whole item exists for, and it is the fact that used to leave exactly the evidence a "
+ "derivation nobody ran leaves",
  await (async () => { const r = derivationObservation(
      { entityId: "ENT-1", count: 0, documents: 1 }).row;
    return [r.state, /RAN and produced nothing/.test(r.detail),
            /no pair to form/.test(r.detail)]; })(),
  ["LOOKED_ABSENT", true, true]);

t("B10: a TRUNCATED derivation is `partial` WHATEVER IT PRODUCED — the false-coverage direction "
+ "is `PRESENT` on a bounded scan, and `LOOKED_ABSENT` on a cut scan would be worse still, "
+ "because pairs that were never formed are not pairs that do not exist",
  [derivationObservation({ entityId: "ENT-1", count: 5, documents: 100, truncated: true }).row.state,
   derivationObservation({ entityId: "ENT-1", count: 0, documents: 100, truncated: true }).row.state],
  ["partial", "partial"]);

t("B11: an UNREGISTERED subject is stated and not hidden — the derivation really does run over "
+ "resolutions naming an entity id the registry does not describe, and a row that did not say so "
+ "would read as a derivation over a subject the record knows",
  /not in the subject registry/.test(
    derivationObservation({ entityId: "ENT-X", count: 1, documents: 2, entityKnown: false }).row.detail),
  true);

t("B12: each function returns NO ROW rather than a guessed one when its subject is absent — a "
+ "look with nothing to be about is not a weaker observation, it is not one",
  [readerRunObservation(null, "a".repeat(64)).row,
   resolutionObservation({ ref: null, matches: [] }).row,
   derivationObservation({ entityId: null }).row],
  [null, null, null]);

/* ========================================================================= *
 *  C · THE READER RUN, DRIVEN THROUGH `op=promote`.
 * ========================================================================= */
console.log("\n--- C · the reader-run writer at promote, through the op ---");

const HEAD = new Map();
let snapSeq = 0;
const bdoc = (id, title) => `---\nobject_type: information\ngroup: believe-in-oakland\n`
  + `title: ${title}\ncurrent_state: collected\n---\n\n# ${title}\n`;
const promote = async (id, { reading = null, captureSha = null, register = [] } = {}) => {
  const text = bdoc(id, `Bundle ${id}`);
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary",
                                                           bytes: 10 }, reading }] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await POST(`op=promote&token=${ADM}`, {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260915T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: "collected", created: NOW, last_updated: LATER },
    files, register });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* EVERY MEANING-LEVEL ROW, read through the op a caller actually has. The
   frontier is asked with a viewer the DO will honour, because sections F and G
   drive the fence and this helper must not quietly bypass it. */
const meaning = async (extra = "") => {
  const f = await DO("frontier", `level=meaning&viewer=class:member&limit=500${extra}`);
  if (!f || !Array.isArray(f.looked))
    throw new Error(`the meaning frontier answered no rows array: ${JSON.stringify(f).slice(0, 400)}`);
  return f;
};
const rowsFor = async (subject) => (await meaning()).looked.filter((r) => r.subject === subject);

const SHA_FOUND  = "a".repeat(64);   /* a reader ran and found two entities */
const SHA_EMPTY  = "b".repeat(64);   /* a reader ran and found NOBODY — the row this item is for */
const SHA_NOREAD = "c".repeat(64);   /* a capture the record holds that nothing has ever read */
const reg = (s) => [{ sha256: s, path: `data/${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 }];

await promote("INF-2026-0915-found", {
  reading: readingOf({ found: true, entities: [ENT(11), ENT(12)] }),
  captureSha: SHA_FOUND, register: reg(SHA_FOUND) });
await promote("INF-2026-0915-empty", {
  reading: readingOf({ found: false, entities: [] }),
  captureSha: SHA_EMPTY, register: reg(SHA_EMPTY) });
await promote("INF-2026-0915-noread", { register: reg(SHA_NOREAD) });

{
  const r = await rowsFor(SHA_FOUND);
  t("C1: promoting a document whose reading found entities writes ONE meaning-level observation, "
  + "through the op, at REC-93's vocabulary — level meaning, subject the CAPTURE, authority the "
  + "BUNDLE, authority kind `derive`",
    [r.length, r[0]?.state, r[0]?.subject_kind, r[0]?.authority_kind,
     r[0]?.authority === "INF-2026-0915-found"],
    [1, "PRESENT", "capture", "derive", true]);
  t("C1b: and it points at the reading it produced, which is keyed by this capture",
    [r[0]?.result_kind, r[0]?.result_ref === SHA_FOUND], ["reading", true]);
}

t("C2: A READER THAT RAN AND FOUND NOBODY LEAVES A ROW SAYING SO — driven end to end. Before this "
+ "landing this document and the one below it were the same answer",
  (await rowsFor(SHA_EMPTY)).map((x) => [x.state, x.ran_and_found_nothing]),
  [["LOOKED_ABSENT", true]]);

t("C3: and a capture the record HOLDS that nothing has ever read leaves NO row — a look not taken "
+ "is the absence of a row (§3), which is the other half of the pair C2 splits",
  (await rowsFor(SHA_NOREAD)).length, 0);

t("C4: THE TWO ROWS ARE DIFFERENT ROWS FROM REC-94's, on the same promote and the same capture — "
+ "one says whether we got the TEXT and one says whether anything READ it, and a document can be "
+ "whole at one level and empty at the other",
  await (async () => {
    const m = (await rowsFor(SHA_EMPTY))[0];
    const c = await DO("frontier", `level=content&viewer=class:member&limit=500`);
    const cc = (c.looked || []).filter((x) => x.subject === SHA_EMPTY)[0];
    return [m?.state, cc?.state, m?.subject_kind === cc?.subject_kind]; })(),
  ["LOOKED_ABSENT", "PRESENT", true]);

t("C5: the actor is DERIVED THROUGH THE RECORD'S EXISTING PREDICATE and never guessed — these "
+ "promotes carry the admin credential, which `contentMintState` reads as a machine identity",
  (await rowsFor(SHA_FOUND))[0]?.actor_class, "machine");

/* ========================================================================= *
 *  D · THE RESOLUTION ATTEMPT, DRIVEN THROUGH `op=resolve`.
 * ========================================================================= */
console.log("\n--- D · the resolution-attempt writer, through op=resolve ---");

const ePerson = await POST(`op=entitycreate&token=${ADM}`,
  { kind: "person", label: "Person 11" });
const PERSON = ePerson.entity_id;
t("D0: the fixture registry is non-empty, so the arms below are not measured over nothing",
  typeof PERSON === "string" && PERSON.length > 0, true);

const resolved = await POST(`op=resolve&token=${ADM}`, { captureSha: SHA_FOUND });
t("D0b: and `op=resolve` really ran over this document's two references, one of which the "
+ "registry can match and one of which it cannot",
  [resolved.ok, resolved.references, resolved.unresolved_count >= 1],
  [true, 2, true]);

{
  const rows = (await meaning()).looked.filter((r) => r.subject_kind === "reference");
  const byRef = Object.fromEntries(rows.map((r) => [r.subject, r]));
  t("D1: EVERY reference the recogniser tried now has a meaning-level row — including the one it "
  + "matched NOTHING for, which is the attempt that has been thrown away since this op was written",
    [rows.length, Object.keys(byRef).sort()],
    [2, ["person:11", "person:12"]]);
  t("D2: THE UNRESOLVED ATTEMPT IS LOOKED_ABSENT WITH NO REFERENT, and it says the registry holds "
  + "no such subject rather than saying nothing at all",
    [byRef["person:12"]?.state, byRef["person:12"]?.result_ref,
     byRef["person:12"]?.ran_and_found_nothing],
    ["LOOKED_ABSENT", null, true]);
  t("D3: the MATCHED attempt is PRESENT and points at the ENTITY — the subject is the name we "
  + "searched by, the referent is the registry entry we found, and they are two different facts",
    [byRef["person:11"]?.state, byRef["person:11"]?.result_kind,
     byRef["person:11"]?.result_ref === PERSON],
    ["PRESENT", "entity", true]);
  t("D4: THE AUTHORITY IS THE CAPTURE THAT CARRIED THE NAME — which is what makes `what did "
  + "resolving this document look for` an indexed read distinct from `what has this name been "
  + "matched to`",
    [byRef["person:11"]?.authority === SHA_FOUND, byRef["person:12"]?.authority === SHA_FOUND,
     byRef["person:11"]?.authority_kind],
    [true, true, "derive"]);
}

/* ========================================================================= *
 *  E · THE CONNECTION DERIVATION, DRIVEN THROUGH `op=connect`.
 * ========================================================================= */
console.log("\n--- E · the connection-derivation writer, through op=connect ---");

const derived = await POST(`op=connect&token=${ADM}`, { entityId: PERSON });
t("E0: `op=connect` really ran over this entity, and ONE document concerns it — so no pair can "
+ "be formed and the derivation genuinely produces nothing",
  [derived.ok, derived.documents, derived.count], [true, 1, 0]);

{
  const r = (await meaning()).looked.filter((x) => x.subject === PERSON);
  t("E1: A DERIVATION THAT RAN AND WROTE NO CONNECTION LEAVES A ROW SAYING SO — level meaning, "
  + "subject the ENTITY, and it is the accepts-when's own sentence made mechanical",
    [r.length, r[0]?.state, r[0]?.subject_kind, r[0]?.authority_kind, r[0]?.ran_and_found_nothing],
    [1, "LOOKED_ABSENT", "entity", "derive", true]);
  t("E1b: and it says WHY, because the reason is knowable and is the useful half — a connection "
  + "is a PAIR and fewer than two documents concern this subject",
    /no pair to form/.test(r[0]?.detail || ""), true);
}

/* THE SAME ACT WITH A DIFFERENT OUTCOME, so the arm above is not passing because
   the writer always writes LOOKED_ABSENT. A second document concerning the same
   entity forms exactly one pair. */
await promote("INF-2026-0915-second", {
  reading: readingOf({ found: true, entities: [ENT(11)] }),
  captureSha: "d".repeat(64), register: reg("d".repeat(64)) });
await POST(`op=resolve&token=${ADM}`, { captureSha: "d".repeat(64) });
const derived2 = await POST(`op=connect&token=${ADM}`, { entityId: PERSON });

t("E2: and a derivation over the SAME entity that now DOES form a pair writes a PRESENT row — "
+ "without this the arm above would pass over a writer that only ever wrote one state",
  [derived2.count, (await meaning()).looked.filter((x) => x.subject === PERSON)[0]?.state],
  [1, "PRESENT"]);

t("E3: THE EARLIER ROW WAS NOT REWRITTEN — the log is append-only (§3) and the frontier shows the "
+ "LATEST state while the table still holds the history of a subject that once had nothing",
  await (async () => { const f = await meaning();
    return [(f.tally.LOOKED_ABSENT || 0) >= 1, f.looked.filter((x) => x.subject === PERSON).length]; })(),
  [true, 1]);

/* ========================================================================= *
 *  F · `op=frontier&level=meaning` — BOUNDED, THREE PARTITIONS, AND THE FENCE.
 * ========================================================================= */
console.log("\n--- F · the bounded meaning frontier, its three partitions and its fence ---");

/* CORRECTED 2026-09-18 BY REC-129 (IC-143), NEVER EXEMPTED: this asked the
   `internet` level, which was the one level with no READ; REC-129 built it, so the
   arm asserted that a built level must not answer. The rule it pins is unchanged —
   the not-built branch still answers in words for a level this reader does not
   read — and it is now asked of a level that does not exist, the only input left. */
t("F1: the meaning level answers BUILT — and REC-93's not-built branch is still the answer for "
+ "a level this reader does not read, so this arm can go red in both directions",
  await (async () => { const m = await meaning();
    const i = await DO("frontier", `level=cosmos&viewer=class:member`);
    return [m.built, m.found, i.built, typeof i.note === "string" && i.note.length > 40]; })(),
  [true, true, false, true]);

t("F2: the bound is PUBLISHED on every answer including the empty one (REC-70, REC-30) — a reader "
+ "that got nothing must not have to guess which bound it would have been answered at",
  await (async () => { const m = await DO("frontier", `level=meaning&viewer=class:member&limit=1`);
    return [typeof m.limit, m.limit, typeof m.truncated]; })(),
  ["number", 1, "boolean"]);

t("F3: THE THREE ACTS ARE THREE PARTITIONS OF ONE TABLE and are kept apart in the answer — `has "
+ "anything read this document` and `has anything derived over this subject` are different "
+ "questions with different remedies, and a member choosing what to do next chooses between them",
  await (async () => { const m = await meaning();
    return Object.keys(m.by_subject_kind).sort(); })(),
  ["capture", "entity", "reference"]);

t("F4: the tally counts the rows this item wrote, by state, and NEVER_LOOKED is NOT in it — it is "
+ "the one state that is the ABSENCE of a row, so counting it in a GROUP BY over rows would be "
+ "counting something that by definition is not there",
  await (async () => { const m = await meaning();
    return [Object.keys(m.tally).includes("NEVER_LOOKED"),
            (m.tally.PRESENT || 0) > 0, (m.tally.LOOKED_ABSENT || 0) > 0]; })(),
  [false, true, true]);

/* THE FENCE, DRIVEN AND NOT DECLARED. A viewer the redactor cannot place sees no
   capture and no reference row — REC-36's withholding, row-whole, failing CLOSED. */
t("F5: THE WITHHOLDING IS DRIVEN — a viewer this record cannot place sees no capture-subject and "
+ "no reference-subject row, because both name a document this group holds. It fails CLOSED",
  await (async () => { const m = await DO("frontier", `level=meaning&viewer=project:NO-SUCH&limit=500`);
    return (m.looked || []).filter((r) => r.subject_kind !== "entity").length; })(),
  0);

t("F5b: and the ENTITY partition is NOT withheld, STATED on the answer rather than left to be "
+ "discovered — the subject registry is instance-wide and op=concerns already serves it, so a "
+ "fence here and nowhere else would be tighter than its rule while changing nothing a caller "
+ "could not read one op over",
  await (async () => { const m = await DO("frontier", `level=meaning&viewer=project:NO-SUCH&limit=500`);
    return [(m.looked || []).some((r) => r.subject_kind === "entity"),
            /ENTITY subject is not withheld/.test(m.note || "")]; })(),
  [true, true]);

/* ========================================================================= *
 *  G · NOTHING DERIVED IS NOT NEVER RUN — the accepts-when, and §5.1's order.
 *
 *  THIS IS THE SECTION THE ITEM IS FOR, and the one the `empty` control arm is
 *  pointed at. Every arm above about a look that FOUND something would pass over
 *  a writer that silently dropped the empty case — which is precisely the state
 *  the record was already in before this landing.
 * ========================================================================= */
console.log("\n--- G · nothing derived is not never run, and §5.1's three causes in order ---");

t("G1: THE ACCEPTS-WHEN. A subject that was looked at and produced NOTHING is in `looked` with a "
+ "state, and a subject nobody has looked at is in `never_looked` or `missing_unexplained` — they "
+ "are DIFFERENT ANSWERS, and before this landing they were the same empty set",
  await (async () => { const m = await meaning();
    const ran = m.looked.filter((r) => r.ran_and_found_nothing).map((r) => r.subject_kind).sort();
    const noRow = [...(m.never_looked || []), ...(m.missing_unexplained || [])]
      .some((r) => r.subject === SHA_NOREAD);
    return [ran.length > 0, [...new Set(ran)], noRow,
            m.looked.some((r) => r.subject === SHA_NOREAD)]; })(),
  [true, ["capture", "reference"], true, false]);

t("G1b: and the frontier SAYS SO in words a member could read, rather than leaving the difference "
+ "to be inferred from which array a subject landed in",
  await (async () => { const m = await meaning();
    return [/RAN and produced nothing|ran and produced nothing/i.test(m.note || ""),
            /nobody has looked at|never_looked/i.test(m.note || "")]; })(),
  [true, true]);

/* §5.1's ORDER, AND IT IS THE RULE THIS ROW WAS BRIEFED ON. A missing row has
   three causes and they are different facts. REC-94 shipped the collapse once at
   the content level and caught itself mid-run; the arms below are that lesson
   applied one level up, where the evidence is WEAKER rather than stronger. */
/* G2 WAS REWRITTEN AFTER ITS OWN CONTROL ARM FOUND IT BLIND, and that is the
   most useful thing in this section.
   THE FIRST DRAFT asked about `SHA_NOREAD` — a capture promoted with no reading —
   and asserted it read `never_looked`. It does, and it reads `never_looked` WITH
   THE CAUSE RULE COLLAPSED TOO, because cause (3) is the right answer for it
   either way. So the `cause` arm applied cleanly and G2 STAYED GREEN: an arm
   declared must-fail came back 0/2, and the arm was right while the assertion was
   asleep. **A suite that only ever asks about subjects whose answer is the same
   under the defect is not testing the rule**, which is this repository's oldest
   shape and is why the control is run rather than reasoned about.
   THE FIXTURE THAT CAN SEE IT is a subject with POSITIVE pre-log evidence and no
   observation — cause (1), which the collapse turns into cause (3). It is built
   from `op=resolvetestify`, a member's grade-D path that writes a `resolutions`
   row WITHOUT going through the recogniser, and therefore without a resolution
   ATTEMPT to observe. That is the honest shape and not a contrivance: testimony
   is an assertion about a subject, not a look for one, so it writes no
   observation — which is exactly the pre-log state every reference in an existing
   instance is in. */
{
  const eTest = await POST(`op=entitycreate&token=${ADM}`,
    { kind: "person", label: "Person 21", aliases: ["person:21"] });
  const SHA_PRELOG = "e".repeat(64);
  await promote("INF-2026-0915-prelog", {
    reading: readingOf({ found: true, entities: [ENT(21)] }),
    captureSha: SHA_PRELOG, register: reg(SHA_PRELOG) });
  /* NOT resolved — so `person:21` has NO meaning-level row. Testimony then gives
     it a `resolutions` row, which is cause (1)'s evidence. */
  const testified = await POST(`op=resolvetestify&token=${ADM}`,
    { captureSha: SHA_PRELOG, ref: "person:21", entityId: eTest.entity_id,
      basis: "a member read the document and says it concerns this person" });
  t("G2-fixture: the pre-log fixture really is pre-log — a `resolutions` row exists for this "
  + "reference and NO meaning-level observation does, which is the state every reference in an "
  + "existing instance is in. Without this row G2 would be measured over nothing",
    [testified.ok, (await meaning()).looked.some((r) => r.subject === "person:21")],
    [true, false]);

  t("G2: §5.1's ORDER — a reference with a `resolutions` row and no meaning-level row reads "
  + "PRE-LOG and NOT nobody-looked, because a look really was made before this level existed. On "
  + "any existing instance the collapse would offer names the record HAD matched as names nobody "
  + "had ever tried",
    await (async () => { const m = await meaning();
      const row = [...(m.never_looked || []), ...(m.missing_unexplained || [])]
        .find((r) => r.subject === "person:21");
      return [row?.missing_cause, row?.subject_kind,
              (m.never_looked || []).some((r) => r.subject === "person:21")]; })(),
    ["pre_log", "reference", false]);

  t("G2a: and the CONVERSE, so the arm can go red in both directions — a capture promoted with no "
  + "reading at all has no evidence anywhere and reads `never_looked`, the ONE cause that "
  + "licenses a positive statement. If this ever stopped being reachable the order would be "
  + "refusing to conclude anything, which is its own defect",
    await (async () => { const m = await meaning();
      const row = [...(m.never_looked || []), ...(m.missing_unexplained || [])]
        .find((r) => r.subject === SHA_NOREAD);
      return [row?.missing_cause, row?.subject_kind]; })(),
    ["never_looked", "capture"]);
}

t("G2b: and `never_looked` is reported APART from `missing_unexplained`, with the cause on every "
+ "unexplained row and the whole cause vocabulary published — a frontier that quietly dropped the "
+ "rows it cannot explain would understate what this instance cannot say about itself",
  await (async () => { const m = await meaning();
    return [Array.isArray(m.never_looked), Array.isArray(m.missing_unexplained),
            Object.keys(m.missing_causes || {}).sort(),
            (m.missing_unexplained || []).every((r) => typeof r.why === "string" && r.why.length > 40)]; })(),
  /* CORRECTED BY D-516: the PUBLISHED vocabulary gained BOB #33's band word, which
     A3 above pins at both levels. §5.1's three are unchanged and are what
     `not_ruled_out` is still drawn from. */
  [true, true, ["never_looked", "pre_log", "purged", "watermark_band"], true]);

t("G3: THE ONE-SIDED EVIDENCE IS PUBLISHED ON THE ANSWER, because a reader who assumes all three "
+ "levels resolve §5.1 the same way is wrong and this is where they find out — at a reference or "
+ "an entity a pre-log look that found NOTHING left no artifact and is UNDETERMINED, not absent",
  await (async () => { const m = await meaning();
    return [m.evidence_one_sided?.capture, m.evidence_one_sided?.reference,
            m.evidence_one_sided?.entity, /ONE-SIDED/.test(m.note || "")]; })(),
  [false, true, true, true]);

t("G4: an entity in the registry that nothing has derived over is a MEANING-level subject with no "
+ "row, and it is read through §5.1's order rather than being called never-derived on the "
+ "strength of the emptiness itself",
  await (async () => {
    const e = await POST(`op=entitycreate&token=${ADM}`, { kind: "parcel", label: "Untouched Parcel" });
    const m = await meaning();
    const row = [...(m.never_looked || []), ...(m.missing_unexplained || [])]
      .find((r) => r.subject === e.entity_id);
    return [!!row, row?.subject_kind,
            Object.keys(MEANING_MISSING_ROW_CAUSES).includes(row?.missing_cause)]; })(),
  [true, "entity", true]);

t("G5: AND AN UNRECOGNISED SUBJECT KIND TAKES THE WEAKEST CAUSE, never the strongest — a caller "
+ "that asked about something the cause function does not understand has not established that "
+ "nobody looked, and defaulting to it would let a later reader reach the positive statement by "
+ "adding an eighth subject kind and forgetting to come here",
  /if \(!probe\) return "purged";/.test(SRC.store), true);

/* ===================================================================== *
 * H · REC-107 — THE UNDETERMINED SET IS NAMED ON THE ROW, AND IT WAS ONE
 *     MEMBER SHORT.
 *
 * WHAT THIS SECTION EXISTS FOR, because section G above was GREEN over the
 * defect and stayed green when it was fixed. G asserts which LIST a subject
 * lands in and which CAUSE WORD it carries; nothing in it — nor in
 * `observation-content.test.mjs`'s 63 — ever asserted on the CONTENT of the
 * undetermined set. So `MEANING_MISSING_ROW_CAUSES.purged` could publish
 * *"either the log did not yet carry this level for it or a whole-store purge
 * cleared the rows that described it. NEITHER CAN BE RULED OUT"* — a
 * two-member enumeration of a three-member set, on every row, at every subject
 * kind — through 120 assertions that could not see it. **A suite that cannot
 * see a defect is not evidence the defect is absent**, and this section is
 * that gap closed rather than a new feature pinned.
 *
 * THE MISSING MEMBER IS `never_looked` AND IT IS LIVE EVERYWHERE THAT CAUSE IS
 * REACHED, because the cause is reached when the EVIDENCE PROBE MISSED. At a
 * reference or an entity a second member is missing too — the pre-log look
 * that found nothing and left no artifact — and that one WAS published, but as
 * a top-level map a caller had to remember to join.
 * ===================================================================== */

t("H1: THE PURE RULE — at a TWO-SIDED subject kind the undetermined set is `purged` AND "
+ "`never_looked`. The second member is the one that was missing: this cause is reached because "
+ "the evidence probe MISSED, so nobody-having-looked is fully live, and the sentence that shipped "
+ "excluded it",
  causesNotRuledOut("purged", { evidenceOneSided: false }),
  ["purged", "never_looked"]);

t("H2: and at a ONE-SIDED kind it is ALL THREE, because a pre-log look that found nothing left no "
+ "artifact for cause (1) to read — so the fruitless look is live alongside the purge and the "
+ "never-look, and this record can never tell them apart over the pre-log window",
  causesNotRuledOut("purged", { evidenceOneSided: true }),
  ["pre_log", "purged", "never_looked"]);

t("H3: THE WEAKEST-CLAIM DEFAULT IS STRUCTURAL AND NOT A CONVENTION — an UNDECLARED sidedness "
+ "takes the WIDE branch. The predicate is `=== false` and never `!evidenceOneSided`, so a fourth "
+ "subject kind somebody adds and forgets to declare reads honestly instead of inheriting the "
+ "strong two-member answer by omission. REC-94's landed rule, made structural",
  [causesNotRuledOut("purged", {}), causesNotRuledOut("purged", { evidenceOneSided: undefined }),
   causesNotRuledOut("purged", { evidenceOneSided: null })],
  [["pre_log", "purged", "never_looked"], ["pre_log", "purged", "never_looked"],
   ["pre_log", "purged", "never_looked"]]);

t("H4: THE OVER-STRICTNESS ARM, and it points the other way — a resolved cause is NOT widened. "
+ "`pre_log` was reached because the evidence table HAS a row, so a look demonstrably happened and "
+ "neither a purge nor a never-look survives it; `never_looked` is §5.1's one positive statement. "
+ "Widening either would make the frontier refuse to conclude anything, which is its own defect",
  [causesNotRuledOut("pre_log", { evidenceOneSided: true }),
   causesNotRuledOut("never_looked", { evidenceOneSided: true })],
  [["pre_log"], ["never_looked"]]);

t("H5: an UNRECOGNISED CAUSE WORD takes the widest set, never the narrowest — G5's rule one field "
+ "over, pointed at the cause vocabulary instead of at the subject vocabulary. A later reader "
+ "cannot reach a narrow answer by inventing a fourth cause and forgetting to come here",
  causesNotRuledOut("something-nobody-has-written-yet", { evidenceOneSided: false }),
  ["pre_log", "purged", "never_looked"]);

t("H6: and every set this function can return is a SUBSET of the published vocabulary — a member "
+ "spelled any other way would be a fourth cause wearing a set's clothes, invisible to the "
+ "key-equality arm that guards the vocabularies themselves",
  ["purged", "pre_log", "never_looked", "unknown"]
    .flatMap((c) => [causesNotRuledOut(c, { evidenceOneSided: true }),
                     causesNotRuledOut(c, { evidenceOneSided: false })])
    .every((set) => Array.isArray(set) && set.length > 0
                 && set.every((k) => ALL_MISSING_ROW_CAUSES.includes(k)
                                  && Object.keys(MEANING_MISSING_ROW_CAUSES).includes(k))),
  true);

/* THROUGH THE OP, AND THE FIXTURE IS BUILT RATHER THAN HOPED FOR. A `purged`
   row is NOT reachable in this suite by promoting normally: everything this
   file promotes is registered AFTER the log's first meaning-level row, so it
   reads `never_looked`. The state that IS reachable is the one
   `#missingMeaningCause`'s own null-guard exists for — a reference whose
   carrying capture is not in `register`, so `MIN(g.registered)` is NULL and
   `entered` cannot be compared to anything. That is the per-bundle-purge shape,
   not a contrivance, and it gives a REFERENCE-subject `purged` row: the
   one-sided kind this row was written about. */
{
  const SHA_UNREG = "f".repeat(64);
  /* A reading (so `reading_refs` carries the name) with NO register entry. */
  await promote("INF-2026-0917-unregistered", {
    reading: readingOf({ found: true, entities: [ENT(31)] }), captureSha: SHA_UNREG });

  const m = await meaning();
  const rowsOf = (mm) => [...(mm.never_looked || []), ...(mm.missing_unexplained || [])];
  const purgedRows = (m.missing_unexplained || []).filter((r) => r.missing_cause === "purged");

  t("H7-fixture: THE FIXTURE REALLY ARMED — at least one `purged`-cause row exists on this answer, "
  + "and it is a REFERENCE. Without this row H7 and H8 would be measured over an EMPTY list and "
  + "would pass no matter what the code did, which is the headline-over-an-empty-corpus trap this "
  + "repository has paid for three times",
    [purgedRows.length > 0, purgedRows.every((r) => typeof r.subject_kind === "string"),
     purgedRows.some((r) => r.subject_kind === "reference")],
    [true, true, true]);

  t("H7: THE DEFECT THIS ROW CLOSED, DRIVEN THROUGH THE OP — `never_looked` is named in "
  + "`not_ruled_out` on EVERY `purged`-cause row. It is the member the shipped sentence excluded, "
  + "and excluding it told a member the subject had been looked at (or purged) when nobody may "
  + "ever have looked — the record claiming more coverage than it can support",
    purgedRows.length > 0
      && purgedRows.every((r) => Array.isArray(r.not_ruled_out)
                              && r.not_ruled_out.includes("never_looked")),
    true);

  t("H8: and at a ONE-SIDED subject kind the row names ALL THREE and SAYS ON ITSELF that its "
  + "evidence could never have narrowed them. The limit moves from a top-level map the caller had "
  + "to remember to join, ONTO the row it applies to — a limit published beside the row is one the "
  + "reader must remember to apply",
    purgedRows.filter((r) => MEANING_EVIDENCE_IS_ONE_SIDED[r.subject_kind] === true)
      .every((r) => r.evidence_one_sided === true
                 && Array.isArray(r.not_ruled_out)
                 && r.not_ruled_out.length === 3
                 && r.not_ruled_out.includes("pre_log")),
    true);

  t("H9: `not_ruled_out` IS TOTAL ACROSS BOTH LISTS — every row of `never_looked` and of "
  + "`missing_unexplained` carries it and carries `evidence_one_sided`. A field present only on "
  + "the rows a reader already distrusts is one they learn to look for only when they are already "
  + "suspicious; on a `never_looked` row it is the one-member set that says THIS row is the "
  + "positive statement",
    await (async () => { const all = rowsOf(m);
      return [all.length > 0,
              all.every((r) => Array.isArray(r.not_ruled_out) && r.not_ruled_out.length > 0),
              all.every((r) => typeof r.evidence_one_sided === "boolean"),
              (m.never_looked || []).every((r) => Array.isArray(r.not_ruled_out)
                && r.not_ruled_out.length === 1 && r.not_ruled_out[0] === "never_looked")]; })(),
    [true, true, true, true]);

  t("H10: AND THE PROSE STOPPED ASSERTING A SET IT CANNOT ASSERT. No `why` on any published row "
  + "still claims that exactly two causes could not be ruled out — the sentence now describes the "
  + "cause and DEFERS the set to the row, which is the only place it can be right, because the set "
  + "differs by subject kind and one canned sentence cannot",
    rowsOf(m).every((r) => typeof r.why !== "string" || !/Neither can be ruled out/i.test(r.why)),
    true);

  t("H11: THE REACH OF THE ARMS ABOVE, STATED RATHER THAN LEFT TO BE ASSUMED. Through the op this "
  + "section drives `purged` at a REFERENCE and `never_looked` at a CAPTURE; it does NOT reach a "
  + "`purged` ENTITY, because `entities.at` is stamped at creation and is always later than the "
  + "log's first row on a store this suite built, so no entity here can predate the log. That kind "
  + "is covered by H1-H6 on the pure rule with the same sidedness map the op passes, and the gap "
  + "is NAMED rather than scored zero",
    [new Set(rowsOf(m).map((r) => r.subject_kind)).has("reference"),
     new Set(rowsOf(m).map((r) => r.subject_kind)).has("capture"),
     (m.missing_unexplained || []).some((r) => r.subject_kind === "entity"
                                            && r.missing_cause === "purged")],
    [true, true, false]);
}

/* ===================================================================== *
 * J · REC-110 / D-386 — THE `tally` IS UNGATED ON PURPOSE AT THIS LEVEL TOO,
 *     AND THIS IS THE LEVEL WHERE THE SILENCE COST MOST.
 *
 * **THIS SITE CARRIED NO STATEMENT AT ALL UNTIL REC-110.** REC-103 stated the
 * posture at the DOCUMENT arm alone. Here that gap was worst: two of this
 * level's three subject kinds have ONE-SIDED pre-log evidence (§5.1), so a
 * reader at `#frontierMeaning` is ALREADY being asked to hold a careful
 * distinction about what an absence means — and an unexplained ungated
 * aggregate sitting beside that is the worst place in the file to leave a
 * decision unrecorded. The reasoning itself is at the document arm and is
 * deliberately not restated: one rule with three spellings is mirror-and-drift.
 *
 * AND THE SCOPE OF THE RULING IS PINNED AS NARROWLY AS THE RULING ITSELF, which
 * matters here and at no other level: `by_subject_kind` is a PROJECTION OF
 * `looked`, so it moves with the viewer and with the bound BY CONSTRUCTION. It
 * is gated because the list it projects is gated, and it is NOT part of D-386.
 * J4 asserts that difference, because a future reader who pins *the meaning
 * level's counts do not follow the reader* one field too wide would be pinning
 * a leak into place — the over-strictness direction of this row.
 * ===================================================================== */
{
  const T = (f) => Object.values(f.tally || {}).reduce((a, b) => a + b, 0);
  const J = (f) => JSON.stringify(f.tally || {});

  const machine = await DO("frontier", `level=meaning&viewer=class:member&limit=500`);
  const nobody  = await DO("frontier", `level=meaning&limit=500`);

  /* THIS ARM IS KIND-SCOPED, AND THAT IS A CORRECTION THIS RUN FORCED RATHER
     THAN A REFINEMENT. It was first written as the DOCUMENT level's arm —
     *the DENY caller receives NO rows at all* — and it FAILED, 1 looked and 2
     never_looked. The cause is not a leak and not a defect: `#frontierMeaning`
     DELIBERATELY DOES NOT GATE AN ENTITY, REC-95's decision stated at the site
     (*the subject registry is instance-wide and `op=concerns` already serves an
     entity to any reader … a fence here and nowhere else would be tighter than
     its rule*), and REC-95 raised it to be ruled rather than inherited. **THE
     ASSUMPTION THAT THREE LEVELS FENCE ALIKE IS THE THING THAT WAS WRONG**, and
     the arm is corrected to the measured truth instead of being loosened until
     it passed — which would have silently pinned a fence this suite never
     checked. So the data arm is aimed where withholding ACTUALLY happens at
     this level: the CAPTURE and REFERENCE kinds. */
  t("J0: THE ARM IS ARMED AGAINST THE DATA, AND IT IS KIND-SCOPED BECAUSE THIS LEVEL'S FENCE IS "
  + "— the DENY caller receives NOT ONE capture row and NOT ONE reference row, the two kinds "
  + "`#frontierMeaning` gates, while the entitled viewer receives some. (An ENTITY row is "
  + "ungated BY REC-95'S STATED DECISION, not by omission, so it is excluded here rather than "
  + "asserted away.) Without this, J1 is an equality between answers that were never different",
    [(nobody.looked || []).filter((r) => r.subject_kind === "capture").length,
     (nobody.looked || []).filter((r) => r.subject_kind === "reference").length,
     (machine.looked || []).filter((r) => r.subject_kind !== "entity").length > 0,
     T(machine) > 0],
    [0, 0, true, true]);

  t("J1: THE RULING, DRIVEN THROUGH THE OP — a caller DEMONSTRABLY denied every capture and "
  + "every reference row at this level (J0) still receives a "
  + "`tally` BYTE-IDENTICAL to the entitled viewer's. It counts every row at this level and does "
  + "not follow the reader. D-386 RULED (a) by REC-110, reasoning at the document arm in "
  + "`store.mjs`. **BOTH TALLIES ARE IN THE TUPLE ON PURPOSE**: gate this later and the failure "
  + "prints the withheld tally beside the full one, because a failure naming one is unactionable",
    J(nobody), J(machine));

  const at1   = await DO("frontier", `level=meaning&viewer=class:member&limit=1`);
  const at500 = await DO("frontier", `level=meaning&viewer=class:member&limit=500`);
  t("J2: …AND IT DOES NOT FOLLOW THE BOUND EITHER — the arm against D-386's OTHER refused route, "
  + "*count this page's states*, which moves every viewer together and walks straight past J1. "
  + "The same viewer at `limit=1` and `limit=500` gets the same tally while the page really is "
  + "cut; the cut length is in the tuple so this cannot pass over a bound that never bit",
    [J(at1), at1.looked.length <= 1, at500.looked.length > 1],
    [J(at500), true, true]);

  t("J3: AND THE DECISION IS AT THIS SITE — `#frontierMeaning`'s tally names REC-110 and D-386 "
  + "and POINTS at the document arm rather than restating it. A session that gated the field "
  + "would delete this comment too, so the arm reads the SOURCE and not only the answer",
    [/REC-110, 2026-09-17, D-386 CLOSED/.test(
       SRC.store.slice(SRC.store.indexOf("#frontierMeaning(cap, viewer"))),
     /* CORRECTED 2026-09-24 BY D-486, NEVER EXEMPTED — the content suite's J3 carries the reasoning and
        it is not restated here: this was an ADJACENCY pin, and D-486 interpolates `#hiddenRunTail(viewer)`
        between the level literal and the GROUP BY, so the two tokens stopped being neighbours. The rule
        (whole level, grouped by state, never the page) is pinned as its own tokens instead of a spelling. */
     /level = 'meaning'\$\{hidTail\.sql\} GROUP BY state/.test(SRC.store)],
    [true, true]);

  /* J5 — D-486 / BOB #32 (2026-09-24): THE ONE NARROWING, AND ITS PIN AT THIS SITE. The content suite's J5
     carries the reasoning. THIS LEVEL OWES ONE MORE ARM THAN THE OTHER TWO, and it is a DEFECT D-486's own
     live arm found rather than a widening: this arm's row predicate gates a `capture` and a `reference`
     and returns `true` for everything else, reasoned for an ENTITY — but `#aiRunAppend` stamps every run
     row `subject_kind = 'unstated'`, a FOURTH kind this level never had, so a hidden project's run rows
     were published WHOLE here (`authority`, the run id, included) while the document arm withheld them.
     `runSeen` delegates to `aiRunLog` exactly as `#frontierDocumentVisible` does. J4 below is unchanged and
     still passes, which is the statement that the ENTITY decision was not reopened by this. */
  t("J5: D-486's narrowing is at this site and is the SHARED predicate; and the run referent is now gated "
  + "row-whole at this level through the reader that already gates it, delegated rather than spelled twice",
    [/const hidTail = this\.#hiddenRunTail\(viewer\);/.test(
       SRC.store.slice(SRC.store.indexOf("#frontierMeaning(cap, viewer"))),
     /const runSeen = \(r\) => r\.authority_kind !== "run" \|\| !r\.authority/.test(SRC.store),
     /aiRunLog\(\{ run: r\.authority, viewer, limit: 1 \}\)\.found === true/.test(SRC.store),
     (SRC.store.match(/this\.#hiddenRunTail\(viewer\)/g) || []).length],
    [true, true, true, 3]);

  /* J4 — THE OVER-STRICTNESS ARM, AND IT IS THE ONE THAT MATTERS MOST HERE.
     The ruling is about `tally` and about NOTHING ELSE. `by_subject_kind` is a
     projection of the GATED `looked`, so it MUST move with the reader — pinning
     it invariant alongside `tally` would pin a leak into place, and it is the
     mistake a reader who skims J1 is most likely to make. */
  t("J4: OVER-STRICTNESS — THE RULING IS ABOUT `tally` AND NOTHING ELSE. `by_subject_kind` is a "
  + "PROJECTION of the gated `looked`, so it DOES follow the reader and MUST: the DENY caller "
  + "sees ONLY the `entity` kind (the one this level does not gate), where the entitled viewer "
  + "sees more than one. **A pin that held this invariant alongside `tally` would be pinning a "
  + "leak into place**, which is the mistake a reader who skims J1 is most likely to make, so "
  + "the arm asserts the DIFFERENCE rather than trusting nobody will widen it",
    [Object.keys(nobody.by_subject_kind || {}).sort().join(","),
     Object.keys(machine.by_subject_kind || {}).length > 1],
    ["entity", true]);
}

} catch (e) {
  fail++;
  console.log(`  THREW  ${e && e.stack ? e.stack : e}`);
} finally {
  reachedFoot = true;
  await mf.dispose();
}

/* THE FOOT GUARD. A TypeError inside an assertion goes through NO assertion at
   all: it ends the module while the tally reads clean. So a run that did not
   reach here reports -1 and never 0 — WORKER.md's rule, and `nc-rec95.mjs` reads
   the same sentinel, so the driver and the suite agree on the one number that
   means `this run proved nothing`. */
if (!reachedFoot) {
  console.log("\nobservation-meaning: -1 pass, -1 fail  (the suite did not reach its own foot)");
  process.exit(1);
}
console.log(`\nobservation-meaning: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
