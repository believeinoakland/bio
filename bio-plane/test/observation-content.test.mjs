/* NEGATIVE CONTROL: (declared and RUN 2026-09-17, REC-110 / D-386, worktree
   agent-adcd3110010904330) FOUR arms over section J's pin — `node test/nc-rec110.mjs
   [arm|all]`, which drives THIS suite on every arm as well as the document and meaning
   suites, because REC-110's ruling is ONE ruling at THREE sites and an arm that ran one
   suite would call the other two levels pinned without looking. The full declaration, with
   what each arm must and must not fail, is at the head of `observation-log.test.mjs` and
   is deliberately not restated here. Baseline both ends for THIS suite: 74 pass / 0 fail.
   (a) `gate` — the document tally gated: this suite GREEN (the arm is one level over, and
       that it does not fire here is the evidence the arm is local).
   (b) `bound` — the document tally narrowed to the bound: this suite GREEN, same reason.
   (c) `unsay` — the ruling DELETED from `#frontierContent`'s tally, behaviour untouched:
       **content J3 FAILS**, as declared. This is the arm this suite owes the estate — the
       row's requirement is that the next reader meets the DECISION, so a pin watching only
       behaviour would pass over a site that quietly stopped saying why.
   (d) `overstrict` — the tally's VALUES changed legitimately, no gating and no narrowing:
       GREEN, 74/0. The pin asserts invariance across reader and bound, never a number.
   J0 IS WHAT MAKES J1 WORTH ANYTHING HERE, and this level supplies the sharpest form of it
   in the estate: section G has already driven a member withheld from a REAL capture
   (`SHA_PROJ`) BY NAME, so J1 is not *two viewers happen to agree* but *a viewer provably
   denied a row still receives the count that includes it*. */
/* NEGATIVE CONTROL: (declared 2026-09-15, REC-94, worktree agent-aca2a5e9a42abc8fa) SIX arms,
   RUN in one step through `node test/nc-rec94.mjs [arm]` (the driver lives INSIDE this worktree),
   each armed ALONE with every other defence held open, each DECLARED must-fail or must-not-fail
   BEFORE it ran, each mutation passing an anchor-occurs-EXACTLY-ONCE guard and a
   bytes-really-changed guard, and every restore verified by sha256 AND by `cmp` against a PRISTINE
   copy named UNIQUELY PER ARM with a byte count printed and a minimum guarded. An opening AND a
   closing BASELINE row bracket the run, because a harness that reported the same answer for every
   arm INCLUDING the baseline is on record in this repository, and without a baseline row six reds
   read exactly like six arms working.
   (a) `baseline` — nothing armed. Declared: everything green. It is the row that distinguishes
       five-arms-broken from five-arms-working.
   (b) `writer` — OBSERVATION-LOG-DESIGN.md §9, this item's own row: REMOVE THE PROMOTE-TIME
       CONTENT-LEVEL WRITER. Declared MUST FAIL: a freshly promoted capture reads as
       NEVER-EXTRACTED and section C's arms fail BY NAME. Declared MUST NOT FAIL: section E's
       document-level arm, because REC-93's writers are untouched — that is this item's
       over-strictness pair in the ORTHOGONAL direction, and it is the queue row's own
       over-strictness clause.
   (c) `shortfall` — make a `tier3_candidate` reading read PRESENT rather than `partial`. Declared
       MUST FAIL: the false-coverage arm and the candidate-list arm. This is the DANGEROUS
       direction: a document we got half of reading as a document we got.
   (d) `pagecount` — make a SCOPED chain claim the whole document without a page count. Declared
       MUST FAIL: the undetermined-coverage arm. A coverage claim off a page set nobody counted.
   (e) `spelling` — write one content-axis state as a LITERAL somewhere other than the constant.
       Declared MUST FAIL: section A's mechanism arm, BY NAME. This is the arm that proves the
       shared vocabulary is a mechanism rather than three documents agreeing in prose.
   (f) `fence` — neuter the viewer gate on the per-capture read. Declared MUST FAIL: section D's
       withholding arm. Declared MUST NOT FAIL: everything else, so the arm takes the fence and
       nothing else.
   (g) `cause` — ADDED 2026-09-15 after the BOB #11 session's correction of the same day (`9954a9c`, design §5.1)
       landed on `origin/main` mid-run and this item's first draft was found to violate it. Make
       a missing content-level row read as never-extracted WHATEVER its cause. Declared MUST
       FAIL: §5.1's order arm and the weakest-default arm. This is the defect the design was
       written to prevent, and the arm exists because this item shipped it once already: an
       absence that took no work to produce, reported as a fact about the world.
   (h) `rawflag` — ADDED 2026-09-16 by REC-109 (worktree agent-a8eea05132b9aee1d), RUN in one step
       through `node test/nc-rec109.mjs [arm]`, ARMS EXTENDED IN THIS SAME BLOCK rather than in a
       second declaration paragraph, because the register records ONE declaration per suite — the
       fullest — and a second block would have left these five uncounted (D-233).
       **AND THIS PARAGRAPH MAY NOT SPELL THE REGISTER'S OWN MARKER PHRASE, WHICH IS WRITTEN HERE
       BECAUSE IT WAS PAID FOR ONCE.** The first draft of this line quoted that phrase to explain
       why the arms live here — and the quotation IS a marker, so `markerPositions` split this
       declaration in two and `readControl`, which keeps the FULLEST, recorded 8 arms instead of
       12. Five arms were added and the register moved by one. It is `WORKER.md`'s own receipt —
       *a check that caught its own correction because the correction quoted the token it was
       correcting* — arriving in the arms grammar, and it is invisible except by reading the
       printed figure rather than trusting that five edits made five arms.
       D-385 ITSELF: make `truncated` compare the RAW SUPPLY against the bound again while the
       answer is still cut from the gated list. Declared MUST FAIL G1, printing BOTH the gated
       count and the supply; MUST NOT FAIL the entitled viewer's arms. ACTUAL: G1 and G5b — the
       declaration was wrong, because G5b pins the very expression this arm rewrites.
   (i) `fence` — drop the visibility filter from the raw content page. THE ARM ARMED AGAINST THE
       DATA rather than the flag, which is REC-94's own lesson: its leak passed a flag-only arm
       because `capture_held` was already false. Declared MUST FAIL G0 G1 G1b G4b — the private
       project's capture appears BY NAME in an uninvited member's rows; MUST NOT FAIL G1c G4.
       ACTUAL: exactly as declared.
   (j) `missinglist` — put the second disjunct back to `missing.length > cap`, the list this
       method SPLITS by §5.1's cause and never pages. Declared STRUCTURAL-ONLY before running,
       with the reason: this fixture's `missing` holds ONE row and `unexplained` is EMPTY, so the
       three lists cannot straddle any bound the op accepts. ACTUAL: G5b, as declared.
   (k) `overfetch` — narrow the raw fetch back to `cap + 1`. Declared STRUCTURAL-ONLY and
       BEHAVIOURALLY INVISIBLE. **ACTUAL: G2 G3b G5 — WRONG IN THE INFORMATIVE DIRECTION, and it
       is this control's most useful result.** The over-fetch protects THE ANSWER and not only the
       flag: at a bound of 2 the raw page is 3, the fence drops one, and an uninvited member gets
       TWO rows while entitled to THREE and is told the list is complete.
   (l) `unexplained` — drop the third disjunct alone. Declared STRUCTURAL-ONLY for (j)'s reason.
       ACTUAL: G5b, as declared.
   THE ACTUAL RESULTS OF EVERY ARM ARE IN `CLAIMS.md`'s release line for REC-94 and REC-109,
   including the ones that came back other than declared — and two of REC-109's five did.
   WHAT THESE ARMS CANNOT SEE: they are all local to this plane's own source. Nothing here
   exercises a second instance, a real network fetch, a real OCR engine, or the per-unit text
   index — `capture_text` is REC-91's and does not exist, which is why every `indexed` answer
   below that is not at the two ends of the vocabulary reads UNDETERMINED, asserted rather than
   assumed. Nothing here drives D-319's read-time seam either: what is driven is the WRITER it
   calls, through the re-promotion path that moves a chain. (CORRECTED 2026-09-18 by CPDF-19: this
   said the seam "has no call site on this tree", true when written; `op=pdfstructure&ocr=1` is
   that call site now, it reaches this same writer through `Store.reextract`, and it is driven in
   `reextract.test.mjs` rather than here.)

   ===== REC-107's SECTION H IS DRIVEN FROM `nc-rec107.mjs`, AND ITS ARMS ARE DECLARED IN
   `observation-meaning.test.mjs` RATHER THAN HERE. That is deliberate and is not laziness:
   the coverage register reads a declaration to the end of its paragraph or until the MARKER
   PHRASE recurs, so a second declaration carrying the marker would TRUNCATE the one above —
   the failure recorded in REC-95's own arm (b), which cost that suite an UNCLASSIFIED
   reading. ONE declaration owns those eight arms and it names this suite's arms by number.
   WHAT MATTERS HERE: `nc-rec107.mjs` runs BOTH suites on EVERY arm, because REC-107 swept one
   class across two levels and a driver running only the rowed level could not tell a fix that
   CLOSED one level from a fix that ENTANGLED them. Section H's arms below are named
   MUST-FAIL by the `never` and `rowfield` arms and MUST-PASS by `onesided` — that last one is
   the orthogonality pair, and it held: collapsing the MEANING level's one-sided widening left
   all 70 assertions here green, which is what makes the shared `causesNotRuledOut` shared
   rather than coupled. */

/* REC-94 / IC-95 — THE CONTENT-LEVEL WRITERS, THE PER-CAPTURE CONTENT-AXIS READ,
 * AND THE BOUNDED CONTENT-LEVEL FRONTIER.
 * =====================================================================
 *
 * `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2 and its §8 decomposition row
 * 2 — the TABLE is the scope's authority and the queue row is the pointer. It
 * sits on REC-93's landing: ONE table, ONE append site, ONE vocabulary. This
 * item is the second writer into it and adds no table, no column and no refusal.
 *
 * WHY IT MATTERS. CLAUDE.md's standing section: *a store full of captured PDFs,
 * none of them read, is a pile of noise with good provenance*, and *saying WHICH
 * absence is true is a first-class obligation*. Part II §17's OBSERVE row reads
 * ABSENT at content grain — so until this item, "we searched the content of
 * every document we hold and found nothing" and "we have never read a single one
 * of them" were the same answer. The arms below are weighted at the two places
 * that can lie: a document we got HALF of reading as one we got (the
 * false-coverage direction, which is the worse one), and a document nobody has
 * read reading as one that was read and held nothing.
 *
 * SIX SECTIONS:
 *   A. THE SHARED VOCABULARY AS A MECHANISM — one constant, and a divergent
 *      spelling is a BUILD ERROR rather than a review finding.
 *   B. THE PURE DERIVATION — tiers off the chain, §4.2's outcome table, and the
 *      content axis, held without workerd.
 *   C. THE WRITER AT PROMOTE, driven through `op=promote`.
 *   D. THE PER-CAPTURE READ, driven through `op=contentaxis`, and its fence.
 *   E. THE BOUNDED CONTENT FRONTIER and the re-extraction candidate list.
 *   F. RE-EXTRACTION — a moved chain appends and never rewrites.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED,
         contentAxisFor, contentObservationsFor,
         OBSERVATION_AUTHORITY_KINDS, OBSERVATION_SUBJECT_KINDS,
         MISSING_ROW_CAUSES, CONTENT_EVIDENCE_IS_ONE_SIDED,
         ALL_MISSING_ROW_CAUSES, causesNotRuledOut } from "../src/airun.mjs";
import { tiersEvidenced, STEP_KINDS } from "../src/textchain.mjs";
import { QUEUE_CONDITION_KINDS } from "../src/queuestate.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC = {
  airun:  readFileSync(new URL("../src/airun.mjs", import.meta.url), "utf8"),
  store:  readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8"),
  index:  readFileSync(new URL("../src/index.mjs", import.meta.url), "utf8"),
  chain:  readFileSync(new URL("../src/textchain.mjs", import.meta.url), "utf8"),
  query:  readFileSync(new URL("../src/query.mjs", import.meta.url), "utf8"),
  self:   readFileSync(new URL("./observation-content.test.mjs", import.meta.url), "utf8"),
};

const TOK = "mem-rec94";
const ADM = "adm-rec94";
const NOW = "2026-09-15T09:00:00Z";
const LATER = "2026-09-15T10:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec94",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0, reachedFoot = false;
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

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const obj = ns.get(ns.idFromName("bio"));
/* THE DURABLE OBJECT TAKES ITS OP FROM THE PATH, not from an `op` parameter —
   that is the control plane's spelling. Driven directly only where an arm needs
   a VIEWER the control plane would never stamp (a named member rather than the
   shared instance credential); everything else goes through the op. */
const DO = async (op, q = "") => rP(await (await obj.fetch(`http://x/${op}?${q}`)).json());

/* ========================================================================= *
 *  A · THE SHARED VOCABULARY IS A MECHANISM, NOT A CONVENTION.
 *
 *  RULED 2026-09-14 by CONDUCT #11 at BOB #11's raising. REC-92, REC-94 and
 *  CPDF-19 all read or write ONE content-axis state, their designs say each may
 *  ship without the others, and three items spelling one vocabulary across three
 *  weeks is the id-collision shape one level up — for which the vigilance fix is
 *  already known to fail. So: ONE exported constant, imported by every reader and
 *  writer, and THE SUITES PIN THE CONSTANT AND NEVER A LITERAL.
 *
 *  THIS SECTION IS WHAT MAKES THAT A BUILD ERROR. Every arm below derives its
 *  corpus from `Object.keys(CONTENT_AXIS_STATES)` — this file contains no member
 *  spelling of its own, which A3 asserts about ITSELF, because a suite that
 *  hard-codes the words it is policing is the second copy it exists to prevent.
 * ========================================================================= */
console.log("\n--- A · the content axis is ONE constant, and a second spelling fails the build ---");

const MEMBERS = Object.keys(CONTENT_AXIS_STATES);

t("A1: the constant carries FOUR states and every one of them has a sentence a member could read "
+ "(CONTENT-SEARCH-DESIGN.md §4.4's set, and no fifth word smuggled in)",
  [MEMBERS.length, MEMBERS.every((k) => typeof CONTENT_AXIS_STATES[k] === "string"
                                     && CONTENT_AXIS_STATES[k].length > 30)],
  [4, true]);

/* THE MECHANISM ARM. A member of this vocabulary may be SPELLED in exactly one
   place — the constant's own definition in `airun.mjs` — and everywhere else it
   must arrive by import. The walk counts occurrences of each member's literal
   text in every source file that could plausibly hold one; `airun.mjs` is
   allowed its definition and nothing else is allowed anything. A fourth item
   spelling a member into `store.mjs` fails HERE, by name, with the file named —
   a build error and not a review finding, which is the whole of the ruling.
   THE ARM IS ABSOLUTE AND COUNTS COMMENTS TOO, which is why no comment in this
   file or in the plane names a member either. A walk that stripped comments
   first would be a walk with a second thing to get wrong, and the cost of the
   strict rule is prose rather than correctness. */
{
  const offenders = [];
  for (const [file, src] of Object.entries(SRC)) {
    if (file === "airun" || file === "self") continue;
    for (const m of MEMBERS) {
      const n = src.split(m).length - 1;
      if (n) offenders.push(`${file}:${m}x${n}`);
    }
  }
  t("A2: THE MECHANISM — no member of the content-axis vocabulary is spelled as a literal anywhere "
  + "but in its own constant. A second spelling is a BUILD ERROR here and not a review finding, "
  + "which is the ruling CONDUCT made on 2026-09-14 and the reason this arm exists",
    offenders, []);

  /* The corpus is NON-EMPTY and the walk can SEE a spelling — asserted in the
     other direction, because a matcher that finds nothing over a corpus it never
     read passes exactly as loudly. Three headline totality assertions in this
     repository passed over an empty corpus. */
  t("A2b: REACH — the same walk over `airun.mjs`, which IS allowed to spell them, finds all four. "
  + "Without this row A2 would pass identically over a walk that was reading nothing",
    MEMBERS.filter((m) => SRC.airun.includes(m)).length, 4);
}

t("A3: and THIS SUITE spells none of them either — every arm here derives its words from the "
+ "imported constant, because a suite holding its own copy of the vocabulary it polices is the "
+ "second copy the ruling exists to prevent",
  MEMBERS.filter((m) => SRC.self.split(m).length - 1 > 0), []);

t("A4: the UNDETERMINED answer is its OWN constant and is deliberately NOT a member of the four — "
+ "§4.4's states are a claim about an index, and an item that folded 'we cannot say' into them "
+ "would have made undetermined unsayable at exactly the level it is most often true",
  [typeof CONTENT_AXIS_UNDETERMINED, MEMBERS.includes(CONTENT_AXIS_UNDETERMINED)],
  ["string", false]);

t("A5: `extract` is the authority kind this level writes under and it was already in REC-93's "
+ "vocabulary — this item arrives as a WRITER into an existing vocabulary rather than as a second "
+ "one, which is the one-table decision doing its job",
  [Object.prototype.hasOwnProperty.call(OBSERVATION_AUTHORITY_KINDS, "extract"),
   Object.prototype.hasOwnProperty.call(OBSERVATION_SUBJECT_KINDS, "capture")],
  [true, true]);

/* ========================================================================= *
 *  B · THE PURE DERIVATION — §4.2's outcome table, held without workerd.
 * ========================================================================= */
console.log("\n--- B · the chain's tiers, §4.2's outcomes, and the content axis (pure) ---");

const whole1 = [{ step: "layer", tier: 1, container: "pdf" }];
const mixed = (t1pages, t3pages) => [
  { step: "layer", tier: 1, container: "pdf", extent: { kind: "pages", pages: t1pages } },
  { step: "pixels", cap: "C", extent: { kind: "pages", pages: t3pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C",
    confidence: { basis: "none" }, extent: { kind: "pages", pages: t3pages } },
];

t("B1: EVERY step kind DECLARES whether it is an extraction tier, so nothing is classified by "
+ "matching a step name and a sixth kind cannot slip through unclassified",
  Object.keys(STEP_KINDS).filter((k) => !Object.prototype.hasOwnProperty.call(STEP_KINDS[k], "tier")),
  []);

t("B2: a plain tier-1 layer chain evidences ONE tier, over the whole document, with nothing "
+ "unclassified",
  (() => { const e = tiersEvidenced(whole1);
           return [e.tiers.length, e.tiers[0].tier, e.tiers[0].covers, e.unclassified]; })(),
  [1, 1, "all", []]);

t("B3: D-252's MIXED document evidences TWO tiers, each over its own pages, IN THE ORDER THE "
+ "ATTEMPTS HAPPENED — the chain's order, because the writer walks them cumulatively and an order "
+ "that is not the order of events would make a row say the state after a tier that had not run",
  (() => { const e = tiersEvidenced(mixed([0, 1], [2]));
           return e.tiers.map((x) => [x.tier, x.covers]); })(),
  [[1, [0, 1]], [3, [2]]]);

t("B3b: and `pixels` + `ocr` collapse to ONE tier-3 row rather than two, because the tier is a "
+ "property of the kind and both kinds ARE tier 3 — there is no tier-3 route that is not an "
+ "engine over pixels",
  tiersEvidenced(mixed([0], [1])).tiers.filter((x) => x.tier === 3).length, 1);

t("B4: a malformed chain evidences NOTHING rather than throwing — a reader asking what a broken "
+ "chain rests on should get 'nothing this record can name', which is true (`derivationCap`'s "
+ "precedent)",
  [tiersEvidenced("ocr").tiers, tiersEvidenced(null).tiers], [[], []]);

const readingOf = (over) => ({ content_type: "meeting_calendar", reader_version: 1,
                               read_from_text: true, found: false, entities: [], facts: {},
                               at: NOW, text_container: "pdf", ...over });
const SHA1 = "1".repeat(64);

t("B5: §4.2 row 1 — text over the WHOLE document is PRESENT, and it carries the back-reference "
+ "C-22.10 requires: a PRESENT that names nothing it found is a coverage claim with no evidence",
  (() => { const o = contentObservationsFor(readingOf({ text_source: whole1, text_tier: 1 }),
                                            SHA1, tiersEvidenced);
           return [o.rows.length, o.rows[0].state, o.rows[0].resultKind, o.rows[0].resultRef]; })(),
  [1, "PRESENT", "reading", SHA1]);

t("B6: THE FALSE-COVERAGE DIRECTION, and it is the one that matters — a reading flagged "
+ "`tier3_candidate` has pages no engine bound here could read, so it is `partial` and NEVER "
+ "PRESENT. A document we got half of reading as one we got is the failure this level exists to "
+ "prevent",
  contentObservationsFor(readingOf({ text_source: whole1, text_tier: 1, tier3_candidate: true }),
                         SHA1, tiersEvidenced).rows.map((r) => r.state),
  ["partial"]);

t("B7: §4.2 row 3 — no text could be produced is LOOKED_INDETERMINATE with a condition, and the "
+ "condition is the record's EXISTING word rather than a new one",
  (() => { const o = contentObservationsFor(
             readingOf({ read_from_text: false, text_source: whole1, text_tier: 1 }),
             SHA1, tiersEvidenced);
           return [o.rows.length, o.rows[0].state,
                   Object.prototype.hasOwnProperty.call(QUEUE_CONDITION_KINDS, o.rows[0].condition),
                   o.rows[0].resultRef]; })(),
  [1, "LOOKED_INDETERMINATE", true, null]);

t("B8: `found: false` with text READ is PRESENT at the CONTENT level, not LOOKED_ABSENT. The "
+ "reader finding no entities in text it read perfectly well is a MEANING-level absence (REC-95); "
+ "reading it as a content-level one would file every document that mentions nobody as a document "
+ "with no text",
  contentObservationsFor(readingOf({ text_source: whole1, text_tier: 1, found: false }),
                         SHA1, tiersEvidenced).rows[0].state,
  "PRESENT");

t("B9: THE CUMULATIVE RULE — a mixed document whose two tiers together cover every page of a "
+ "KNOWN page set ends PRESENT, and the row before it says `partial`. Each row is the state AFTER "
+ "that attempt, so the log reads as a genuine history and the frontier's latest row is true of "
+ "the capture",
  contentObservationsFor(readingOf({ text_source: mixed([0, 1], [2]), text_tier: 3, page_count: 3 }),
                         SHA1, tiersEvidenced).rows.map((r) => r.state),
  ["partial", "PRESENT"]);

t("B10: and the SAME chain against a LARGER page set stays `partial` at the end — three pages of "
+ "five is three pages of five",
  contentObservationsFor(readingOf({ text_source: mixed([0, 1], [2]), text_tier: 3, page_count: 5 }),
                         SHA1, tiersEvidenced).rows.map((r) => r.state),
  ["partial", "partial"]);

t("B11: and with NO page count it stays `partial` and SAYS WHY — whether those pages are all of "
+ "the document is undetermined, and guessing YES would be a coverage claim off a page set nobody "
+ "counted (CAP-9 / D-345 is what persists the count)",
  (() => { const o = contentObservationsFor(
             readingOf({ text_source: mixed([0, 1], [2]), text_tier: 3 }), SHA1, tiersEvidenced);
           return [o.rows.map((r) => r.state), /undetermined/.test(o.rows[1].detail)]; })(),
  [["partial", "partial"], true]);

/* CORRECTED 2026-09-15 AGAINST THE BOB #11 SESSION'S CORRECTION OF THE SAME DAY (`9954a9c`, design
   §5.1), WHICH LANDED ON `origin/main` WHILE THIS ITEM WAS RUNNING. The arm as
   first written asserted that NO OBSERVATION means the never-extracted member,
   full stop — which is the defect the design was written to prevent, arriving
   one level below where Bob found it. A missing row has THREE causes and they
   are different facts, so the arm now asserts the ORDER instead of the shortcut,
   and the member it used to assert is reachable only under cause (3). */
t("B12: §5.1's ORDER — a missing row is read for its CAUSE and never concluded from. Cause (3), "
+ "which excludes the other two, is the not-extracted member; cause (1) and cause (2) read "
+ "UNDETERMINED and NAME what could not be ruled out. Treating the empty set as a positive "
+ "finding is the costs-nothing rule inverted",
  (() => { const three = contentAxisFor({ observed: null, missingCause: "never_looked" });
           const one   = contentAxisFor({ observed: null, missingCause: "pre_log" });
           const two   = contentAxisFor({ observed: null, missingCause: "purged" });
           return [[three.state, three.determined], [one.state, one.determined],
                   [two.state, two.determined],
                   /readings table/.test(one.why)]; })(),
  [[MEMBERS[3], true], [CONTENT_AXIS_UNDETERMINED, false],
   [CONTENT_AXIS_UNDETERMINED, false], true]);

t("B12b: AND AN ABSENT OR UNRECOGNISED CAUSE IS TREATED AS THE WEAKEST, never the strongest — a "
+ "caller that did not say which cause applies has not established cause (3), and defaulting to "
+ "it would let a later reader reach the positive statement by FORGETTING TO ASK",
  [contentAxisFor({ observed: null }).state,
   contentAxisFor({ observed: null, missingCause: "made-up" }).state,
   contentAxisFor({ observed: null }).determined],
  [CONTENT_AXIS_UNDETERMINED, CONTENT_AXIS_UNDETERMINED, false]);

t("B12c: an observation saying no text could be produced is the none member, with the reason "
+ "carried — this half of the old arm was right and is kept",
  (() => { const ind = contentAxisFor({ observed: "LOOKED_INDETERMINATE", reason: "a scan" });
           return [ind.state, ind.determined, /a scan/.test(ind.why)]; })(),
  [MEMBERS[2], true, true]);

t("B13: and the MIDDLE of the vocabulary reads UNDETERMINED in this build, stated rather than "
+ "answered — the per-unit text index it would be read through is REC-91's `capture_text` and "
+ "does not exist, so answering the none member here would say 'we looked and nothing is indexed' "
+ "about a mechanism this record has no notion of",
  (() => { const a = contentAxisFor({ observed: "PRESENT", unitIndex: false });
           return [a.state, a.determined, /REC-91/.test(a.why)]; })(),
  [CONTENT_AXIS_UNDETERMINED, false, true]);

t("B14: THE CONTRACT REC-91 LANDS INTO, pinned now so that item has something to build against: "
+ "with the unit index present, a whole extraction whose units were all written is the full "
+ "member and anything else is the partial member",
  [contentAxisFor({ observed: "PRESENT", unitIndex: true, unitsComplete: true }).state,
   contentAxisFor({ observed: "PRESENT", unitIndex: true, unitsComplete: false }).state,
   contentAxisFor({ observed: "partial", unitIndex: true, unitsComplete: true }).state],
  [MEMBERS[0], MEMBERS[1], MEMBERS[1]]);

/* ========================================================================= *
 *  C · THE WRITER, DRIVEN THROUGH `op=promote`.
 *  A store-level test and a passing battery are not evidence that a caller can
 *  reach the feature — `op=invitelook` shipped with a ReferenceError while 1,276
 *  assertions passed.
 * ========================================================================= */
console.log("\n--- C · the content-level writer at promote, through the op ---");

const HEAD = new Map();
let snapSeq = 0;
/* CORRECTED 2026-09-24 BY D-510, NEVER EXEMPTED: this wrote `object_type: information` into EVERY document
   while `meta.object_type` carried the caller's `type`, so the project and inquiry fixtures below sent bytes
   saying one thing under an envelope saying another. `promote` believed the envelope, which is the defect
   D-510 closes — and the fixture is the shape that defect let through, so it is corrected rather than
   exempted: a document now says what it is. Nothing this suite asserts is about the type. */
const doc = (id, title, type = "information") => `---\nobject_type: ${type}\ngroup: believe-in-oakland\n`
  + `title: ${title}\ncurrent_state: collected\n---\n\n# ${title}\n`;
const promote = async (id, { type = "information", reading = null, captureSha = null,
                            register = [], author = undefined } = {}) => {
  const text = doc(id, `Bundle ${id}`, type);
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary",
                                                           bytes: 10 }, reading }] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  /* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7) and
     a project creation naming one is refused PROJECT_ID_SUPPLIED (C-59.1); a project creation sends no
     bundleId (`id` is then only its title label) and the minted id comes back on the answer. */
  const mint = type === "project" && !HEAD.has(id);
  const body = {
    ...(mint ? {} : { bundleId: id }), base: HEAD.get(id) ?? null,
    snapKey: `20260915T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register };
  if (author !== undefined) body.author = author;
  const r = await POST(`op=promote&token=${ADM}`, body);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  HEAD.set(mint ? r.bundleId : id, r.bundleSha);
  return r;
};

const rowsFor = async (capture) => {
  const f = await DO("frontier", `level=content&viewer=class:member&limit=500`);
  if (!f || !Array.isArray(f.looked))
    throw new Error(`the content frontier answered no rows array: ${JSON.stringify(f).slice(0, 400)}`);
  return f.looked.filter((r) => r.subject === capture);
};

const SHA_WHOLE   = "a".repeat(64);
const SHA_SHORT   = "b".repeat(64);
const SHA_NOTEXT  = "c".repeat(64);
const SHA_UNREAD  = "d".repeat(64);
const reg = (s) => [{ sha256: s, path: `data/${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 }];

await promote("INF-2026-0915-whole", { reading: readingOf({ text_source: whole1, text_tier: 1 }),
                                       captureSha: SHA_WHOLE, register: reg(SHA_WHOLE) });
await promote("INF-2026-0915-short", {
  reading: readingOf({ text_source: whole1, text_tier: 1, tier3_candidate: true }),
  captureSha: SHA_SHORT, register: reg(SHA_SHORT) });
await promote("INF-2026-0915-notext", {
  reading: readingOf({ read_from_text: false, text_source: whole1, text_tier: 1 }),
  captureSha: SHA_NOTEXT, register: reg(SHA_NOTEXT) });
/* A capture the record HOLDS and nothing has ever tried to extract — the
   never-extracted fixture, and the one the whole construct exists for. */
await promote("INF-2026-0915-unread", { register: reg(SHA_UNREAD) });

{
  const r = await rowsFor(SHA_WHOLE);
  t("C1: promoting a document with a reading writes a content-level observation, through the op, "
  + "at the vocabulary REC-93 built — one row, level content, subject the capture, authority the "
  + "BUNDLE (which is what makes 'what did this promotion extract' an indexed read distinct from "
  + "'what has this document been through')",
    [r.length, r[0]?.state, r[0]?.subject_kind, r[0]?.authority_kind,
     r[0]?.authority === "INF-2026-0915-whole"],
    [1, "PRESENT", "capture", "extract", true]);
  t("C1b: and it says this was the FIRST extraction rather than leaving the reader to infer it",
    /first extraction/.test(r[0]?.detail || ""), true);
}

t("C2: the `tier3_candidate` document is `partial` IN THE STORE and not only in the pure "
+ "function — the false-coverage direction, driven end to end",
  (await rowsFor(SHA_SHORT)).map((x) => x.state), ["partial"]);

t("C3: the unreadable document is LOOKED_INDETERMINATE with its condition",
  (await rowsFor(SHA_NOTEXT)).map((x) => [x.state, x.condition]),
  [["LOOKED_INDETERMINATE", "text-undetermined"]]);

t("C4: A PROMOTE WITH NO READING WRITES NO ROW — a look not taken is NEVER_LOOKED and "
+ "NEVER_LOOKED is the ABSENCE of a row (§3). This is the arm that keeps 'nobody read it' from "
+ "becoming 'we read it and it held nothing'",
  (await rowsFor(SHA_UNREAD)).length, 0);

/* CORRECTED FROM ITS FIRST DECLARATION, and the correction is the finding: this
   arm was written expecting `plane`, because the promotes above pass no author.
   THEY DO NOT HAVE TO — the control plane stamps one from the authenticated
   session, and these promote with the ADMIN token, which `isMachineIdentity`
   reads as a machine credential. So the answer is `machine` with the credential
   NAMED, and that is the derivation working rather than defaulting: it consumed
   `contentMintState`, the record's existing predicate, instead of holding a
   second opinion about what a machine identity looks like. The arm is corrected
   to what the plane does and asserts BOTH halves — the class and the named
   actor — because a class with a null actor would be the same lossy answer the
   original expectation would have accepted. */
t("C5: the actor is DERIVED THROUGH THE RECORD'S EXISTING PREDICATE and never guessed — this "
+ "promotion carries a machine credential, so the look is attributed to a machine and the "
+ "credential is NAMED. Attributing it to a member who did not make it would be a false "
+ "attribution in the one field that says who looked",
/* ASKED THROUGH `op=contentaxis` RATHER THAN THE FRONTIER, and the reason is
   worth the line: the frontier's rows carry `actor_class` and NOT `actor`, which
   is REC-93's shape at the document level and is kept — a list of subjects does
   not need to name a credential beside every one of them, and naming one there
   widens what a list discloses. The per-capture read is where the named actor
   belongs, so that is where this is asserted. */
/* NULL-SAFE, AND IT WAS NOT ON ITS FIRST RUN — fixed at the SUITE rather than
   tolerated in the control driver, which is WORKER.md's own receipt arriving in
   this item. Under the `writer` arm `extraction` is null, a bare `.actor_class`
   threw a TypeError, and a TypeError inside an assertion goes through NO
   assertion at all: it ended the module while the tally read clean, so the arm's
   verdict read `3/4 declared` when the true answer was that the suite never
   reached the row that would have answered the fourth. */
  await (async () => { const r = await GET(`op=contentaxis&token=${TOK}&captureSha=${SHA_WHOLE}`);
           return [r.extraction?.actor_class ?? null,
                   typeof r.extraction?.actor === "string" && !!r.extraction.actor]; })(),
  ["machine", true]);

/* ========================================================================= *
 *  D · THE PER-CAPTURE READ, THROUGH `op=contentaxis`, AND ITS FENCE.
 * ========================================================================= */
console.log("\n--- D · op=contentaxis, and the withholding that is DRIVEN rather than declared ---");

{
  const a = await GET(`op=contentaxis&token=${TOK}&captureSha=${SHA_WHOLE}`);
  /* CORRECTED 2026-09-15 BY REC-91, AND THE OLD ASSERTION IS WORTH A PARAGRAPH
     BECAUSE IT WAS RIGHT WHEN IT WAS WRITTEN AND THE WORLD MOVED UNDER IT.
     It read: *answers UNDETERMINED on the index axis, with the reason naming
     what it is waiting on*, and expected `[…, CONTENT_AXIS_UNDETERMINED, false,
     "PRESENT"]`. What it was waiting on was `capture_text`, and `capture_text`
     now exists — so a capture that once had no index to be in now HAS one and
     the index has an ANSWER about it, which is the whole point of REC-91
     landing. Leaving the old expectation would have made the suite enforce
     *we cannot say* over a plane that can.
     WHY THE NEW ANSWER IS THE NONE MEMBER AND NOT THE FULL ONE, which is the
     part a reader will want: this fixture's reading carries no `text_container`
     and its promotion carries no `text_units`, so the record cannot name a unit
     arm for it at all — the index looked and could not address a passage of it.
     That is DETERMINED and it is `none` WITH A REASON, which is a strictly
     better answer than the undetermined this row used to assert, and it is a
     different fact from the FULL member in the direction that matters: it claims
     nothing is searchable rather than claiming everything is.
     THE `determined` FLIP IS THE ASSERTION, not an incidental. A capture like
     this used to be a gap in the answer and is now an answer. */
  t("D1: a capture whose text WAS extracted, over a container this record cannot name a unit arm "
  + "for, answers the NONE member on the index axis — DETERMINED, with the reason — and the "
  + "EXTRACTION axis beside it, because what extraction established and what the search index "
  + "holds are two facts (CORRECTED by REC-91: this read UNDETERMINED while no index existed)",
    [a.found, a.capture_held, a.indexed, a.determined, a.extraction?.state],
    [true, true, MEMBERS[2], true, "PRESENT"]);
  /* AND THE REASON IS ON IT RATHER THAN ONLY THE STATE. A none-with-a-reason
     whose reason is the bare vocabulary sentence has told the member nothing
     they could act on — the whole value of this member over UNDETERMINED is
     that it names WHICH absence is true, so the row asserts the sentence is
     longer than the vocabulary's own. */
  t("D1a: and the none answer CARRIES ITS REASON, so a member is told which absence is true "
  + "rather than only that one is",
    typeof a.why === "string" && a.why.length > (a.vocabulary?.[MEMBERS[2]] || "").length, true);
  t("D1b: and the answer PUBLISHES the vocabulary, so a surface renders the plane's own sentence "
  + "rather than matching a literal it learned separately (PL-17)",
    Object.keys(a.vocabulary || {}), MEMBERS);
}

{
  const a = await GET(`op=contentaxis&token=${TOK}&captureSha=${SHA_UNREAD}`);
  t("D2: a capture the record HOLDS that nothing has read is the not-extracted member — "
  + "DETERMINED rather than undetermined, because under cause (3) 'nobody looked' is an ANSWER "
  + "and not a gap in the answer. The CAUSE is published beside it, so a reader can see which of "
  + "§5.1's three this rests on rather than taking the state on trust",
    [a.found, a.capture_held, a.indexed, a.determined, a.extraction, a.missing_cause],
    [true, true, MEMBERS[3], true, null, "never_looked"]);
}

/* §5.1's CAUSE (1) IS THE ONE THIS SUITE CANNOT BUILD, AND THAT IS STATED RATHER
   THAN FAKED. A capture with a READING and NO OBSERVATION is what every capture
   on every existing instance looks like — promoted before this item's writer
   existed — and producing one here would take either a delete door on an
   append-only log (the last thing this table should grow) or a boot of the
   pre-item build. The RULE is asserted in B12, where it lives; the store's own
   classifier is asserted below in the one direction this suite CAN reach. */
{
  const held = await GET(`op=contentaxis&token=${TOK}&captureSha=${SHA_WHOLE}`);
  t("D2b: a capture that HAS an observation is never asked for a cause at all — the classifier "
  + "runs only where there is an absence to explain, so `missing_cause` is null on an answered "
  + "row and is not a field a reader has to interpret twice",
    held.missing_cause, null);
  t("D2c: WHAT THIS SUITE CANNOT DRIVE, NAMED: a store holding a reading with no observation — "
  + "§5.1's cause (1), and the state of every capture on every instance that predates this "
  + "landing. It needs a pre-item build or a delete on an append-only table. The cause "
  + "vocabulary is PUBLISHED on the answer, so a reader can at least see that the causes exist "
  + "and that the state they are reading rests on one of them",
    /* CORRECTED BY D-516 FROM 3 TO 4, WITH THE REASON RATHER THAN BY WIDENING A
       BOUND. The old figure was right about §5.1, which has three causes, and wrong
       about the FIELD, which is the vocabulary a `missing_cause` may carry. BOB #33
       (2026-09-24 17:58Z) added a fourth word to that vocabulary — `watermark_band`,
       which names not a cause but WHICH TWO OF THE THREE the stored watermark's
       whole-second precision left open. §5.1's own set is `ALL_MISSING_ROW_CAUSES`
       and is still three; this arm asserts the PUBLISHED map, and it is counted from
       the constant so the two can never be confused again. */
    [Object.keys(held.missing_causes || {}).length, ALL_MISSING_ROW_CAUSES.length,
     Object.keys(MISSING_ROW_CAUSES).length],
    [4, 3, 4]);
}

{
  const a = await GET(`op=contentaxis&token=${TOK}&captureSha=${"9".repeat(64)}`);
  t("D3: a capture this record does not hold is NOT the not-extracted member, and the answer says "
  + "so in words — 'we hold it and never read it' and 'we do not hold it' are two different "
  + "absences, which is exactly the distinction this table exists to keep",
    [a.found, a.capture_held, a.indexed === undefined,
     /* The note must NAME the member it is distinguishing itself from, and the
        pattern is built FROM the constant so this arm cannot drift from it. */
     new RegExp(MEMBERS[3]).test(String(a.note))],
    [false, false, true, true]);
}

t("D4: an unnamed capture is refused with a sentence rather than answered over nothing",
  (await GET(`op=contentaxis&token=${TOK}`)).found, false);

/* THE FENCE, DRIVEN. A capture inside a PROJECT the viewer was never invited to
   must answer byte-identically to a capture this record does not hold — REC-25 /
   REC-30's rule, because a read that distinguishes "not yours" from "does not
   exist" has told the caller the thing it was refusing to tell them.
   IT IS ASKED THROUGH THE DURABLE OBJECT WITH A REAL MEMBER VIEWER, because the
   control plane stamps `class:member` for a shared instance token and
   `viewerPredicate` deliberately does not filter a machine credential — so an
   arm driven only through the token would be an arm that could not arm. */
const SHA_PROJ = "e".repeat(64);
await promote("PRJ-2026-0915-private", { type: "project", captureSha: SHA_PROJ,
                                         reading: readingOf({ text_source: whole1, text_tier: 1 }),
                                         register: reg(SHA_PROJ) });
{
  const mine    = await DO("contentaxis", `captureSha=${SHA_PROJ}&viewer=class:member`);
  const theirs  = await DO("contentaxis", `captureSha=${SHA_PROJ}&viewer=member:not-invited`);
  const absent  = await DO("contentaxis", `captureSha=${"8".repeat(64)}&viewer=member:not-invited`);
  t("D5: THE FENCE — a capture in a project this member was never invited to answers with "
  + "capture_held false, and the machine credential that IS allowed to see it answers true. Both "
  + "directions, because a fence that refuses everybody is not a fence",
    [mine.capture_held, theirs.capture_held], [true, false]);
  t("D5b: and it answers BYTE-IDENTICALLY to a capture this record does not hold, apart from the "
  + "fingerprint asked for — no count of what was withheld, because the count is the leak (REC-30)",
    JSON.stringify({ ...theirs, capture_sha: null }),
    JSON.stringify({ ...absent, capture_sha: null }));
  t("D5c: the gate FAILS CLOSED on an absent stamp, like every op in that list",
    (await DO("contentaxis", `captureSha=${SHA_PROJ}`)).capture_held, false);
}

/* ========================================================================= *
 *  E · THE BOUNDED CONTENT FRONTIER AND THE CANDIDATE LIST.
 * ========================================================================= */
console.log("\n--- E · op=frontier at the content level: bounded, and the re-extraction list ---");

{
  const f = await GET(`op=frontier&token=${TOK}&level=content`);
  t("E1: the content level is BUILT and says so, where yesterday it said NOT BUILT in words — "
  + "and the bound is PUBLISHED on the answer, so a reader that got a page never has to guess "
  + "which bound it was answered at",
    [f.built, f.found, typeof f.limit === "number" && f.limit > 0], [true, true, true]);

  t("E2: the tally counts the rows this item wrote, per state, and NEVER_LOOKED is reported APART "
  + "from it — it is the one state that is the absence of a row, so counting it in a GROUP BY "
  + "over rows would be counting something that by definition is not there",
    [f.tally.PRESENT >= 1, f.tally.partial >= 1, f.tally.LOOKED_INDETERMINATE >= 1,
     Object.prototype.hasOwnProperty.call(f.tally, "NEVER_LOOKED")],
    [true, true, true, false]);

  t("E3: the `never_looked` set is the captures this record HOLDS that nothing has ever tried to "
  + "extract — the content level's own NEVER_LOOKED, and the number that says WHICH absence is "
  + "true when a content search comes back empty",
    (f.never_looked || []).map((r) => r.subject).includes(SHA_UNREAD), true);

  t("E3b: §5.1 — and the set is SPLIT BY CAUSE rather than named once. Only cause (3) is in "
  + "`never_looked`; captures whose absence this record cannot explain are carried in their own "
  + "list WITH the cause on each row, so a reader who cannot act on them still knows they exist. "
  + "The answer publishes the cause vocabulary as it publishes the state vocabulary, and the two "
  + "lists are DISJOINT — a subject in both would be the split not having happened",
    [Array.isArray(f.missing_unexplained), typeof f.missing_unexplained_count === "number",
     /* CORRECTED BY D-516 FROM 3 TO 4 — the published vocabulary gained BOB #33's
        band word; §5.1's own three are `ALL_MISSING_ROW_CAUSES` and did not move.
        Read from the constant rather than typed, so a fifth word arriving beside
        the writer moves this arm with it instead of silently passing. */
     Object.keys(f.missing_causes || {}).length === Object.keys(MISSING_ROW_CAUSES).length,
     Object.keys(f.missing_causes || {}).length,
     (f.never_looked || []).every((r) => !(f.missing_unexplained || [])
       .map((u) => u.subject).includes(r.subject))],
    [true, true, true, 4, true]);

  t("E4: the candidate list names the document we got HALF of and does NOT name the one we got — "
  + "both directions, because a candidate list that names everything is not a list",
    [(f.recandidates || []).map((r) => r.subject).includes(SHA_SHORT),
     (f.recandidates || []).map((r) => r.subject).includes(SHA_WHOLE)],
    [true, false]);

  t("E4b: and it says WHY each one is a candidate rather than only that it is — the two reasons "
  + "have two different remedies (an engine bound to this instance; a re-run under a calibration "
  + "that already moved) and a member choosing from this list is choosing between them",
    (f.recandidates || []).filter((r) => r.subject === SHA_SHORT)
      .map((r) => [r.tier3_candidate, r.calibration_drifted]),
    [[true, false]]);

  t("E4c: the unreadable document is a candidate too — an instance that later binds an OCR member "
  + "can read it, so it is below what the fleet could do and not a closed question",
    (f.recandidates || []).map((r) => r.subject).includes(SHA_NOTEXT), true);
}

{
  const one = await GET(`op=frontier&token=${TOK}&level=content&limit=1`);
  t("E5: THE BOUND PROVABLY BITES at a cap of one — asserted rather than assumed, because "
  + "REC-93's own bound arm first read `truncated: false` at a cap of one over a store holding "
  + "fewer than two subjects, and an arm that cannot arm is a finding",
    [one.limit, one.looked.length, one.truncated], [1, 1, true]);
}

/* ========================================================================= *
 *  F · RE-EXTRACTION — THE LOG APPENDS AND NEVER REWRITES.
 * ========================================================================= */
console.log("\n--- F · a moved chain appends a row and rewrites none (§3: append-only) ---");

{
  const before = await rowsFor(SHA_SHORT);
  await promote("INF-2026-0915-short", {
    /* The chain MOVED: an engine read the pages tier 1 could not, and the
       shortfall is gone. This is what D-319's read-time seam produces, through
       the same writer — CPDF-19 built the seam that calls it (2026-09-18). */
    reading: readingOf({ text_source: mixed([0, 1], [2]), text_tier: 3, page_count: 3 }),
    captureSha: SHA_SHORT, register: reg(SHA_SHORT) });
  const after = await rowsFor(SHA_SHORT);
  t("F1: the re-extraction's LATEST row is PRESENT — the capture moved between content-axis "
  + "states, which is the movement CPDF-19's opt-in re-read exists to cause",
    [before[0]?.state, after[0]?.state], ["partial", "PRESENT"]);
  t("F1b: and it SAYS it was a re-extraction, derived from the store rather than declared by the "
  + "caller — so the second row says so whether or not the caller thought to mention it",
    /re-extraction/.test(after[0]?.detail || ""), true);

  const f = await GET(`op=frontier&token=${TOK}&level=content&limit=500`);
  t("F2: and the capture LEAVES the candidate list, which is what makes the list a worklist "
  + "rather than a census",
    (f.recandidates || []).map((r) => r.subject).includes(SHA_SHORT), false);

  const all = await DO("frontier", `level=content&viewer=class:member&limit=500`);
  t("F3: THE EARLIER ROW WAS NOT REWRITTEN — the tally still counts a `partial`, because the log "
  + "is append-only and a log that can be rewritten is not evidence of anything. The frontier "
  + "shows the latest state; the TABLE still holds the history",
    all.tally.partial >= 1, true);
}

/* ========================================================================= *
 *  G · REC-109 / IC-109 — `truncated` DESCRIBES THE LIST THE CALLER RECEIVED.
 *      D-385, and the withheld-count disclosure decision beside it.
 * ========================================================================= */
console.log("\n--- G · REC-109: the cut and the claim agree, and the flag is not a one-bit count ---");

/* WHY THIS SECTION USES NO NEW FIXTURE, STATED RATHER THAN LEFT TO LOOK LAZY.
   The census this suite already builds is exactly the shape the row asks to be
   driven: FOUR captures carry a content-level row and ONE of them (`SHA_PROJ`)
   sits in a project `member:not-invited` was never invited to, so at one bound
   the two viewers' own lists fall on OPPOSITE SIDES of it. Adding a fifth
   capture would move the arithmetic without adding a case.

   EVERY FIGURE BELOW IS INDEPENDENT OF THE PRODUCT, and that is REC-111's
   finding of 2026-09-16 inherited rather than re-paid: that item declared eight
   control failures and got five, because three of its assertions read the bound
   out of the product's own constant, so BOTH SIDES MOVED TOGETHER and the arms
   could prove the mechanism right while being blind to the number. `4` (the
   captures with a content-level row), `3` (the ones an uninvited member may
   see), `1` (the one withheld) and the bounds `2` and `3` are written here as
   literals. Nothing below reads `f.limit`, `FRONTIER_LIMIT_DEFAULT` or any
   length off the answer to build its own expectation. */
const G_TOTAL_WITH_ROWS = 4;      /* aaaa, bbbb, cccc (information) + eeee (project) */
const G_VISIBLE_UNINVITED = 3;    /* aaaa, bbbb, cccc — the shared evidence corpus (D-15) */
const G_WITHHELD = 1;             /* eeee — SHA_PROJ, inside the private project */

{
  /* THE CENSUS IS ASSERTED BEFORE ANYTHING RESTS ON IT, because a headline
     totality arm that passed over an EMPTY corpus is on record in this project
     three times. If the suite's fixture ever changes shape, this arm goes red
     FIRST and names the number, instead of the arms below quietly measuring a
     different world. */
  const mAll = await DO("frontier", `level=content&viewer=class:member&limit=500`);
  const nAll = await DO("frontier", `level=content&viewer=member:not-invited&limit=500`);
  t("G0: THE CORPUS, ASSERTED AND NOT ASSUMED — four captures carry a content-level row, an "
  + "uninvited member may see three of them, and exactly one is withheld. Every arm below rests "
  + "on this and none of it is read off the product",
    [mAll.looked.length, nAll.looked.length, mAll.looked.length - nAll.looked.length,
     nAll.looked.some((r) => r.subject === SHA_PROJ)],
    [G_TOTAL_WITH_ROWS, G_VISIBLE_UNINVITED, G_WITHHELD, false]);

  /* ---- THE EQUALITY, DRIVEN AND NEVER ASSERTED OVER ONE PATH ---------------
     The row's own words: *two paths through one function cannot disagree and a
     pin over them proves nothing*. So both cases below are driven by ASKING THE
     PRODUCT with a real viewer, at a real bound, and reading what came back —
     never by comparing `truncated` against a second expression computed here. */

  /* CASE ONE — the raw fetch EXCEEDS the bound and the gated answer does NOT.
     Bound 3. The supply is 4 rows, which is more than 3. An uninvited member's
     own list is 3, which is not. `false` is the only honest answer: they have
     every row they are entitled to and the flag must say so. */
  const nAt3 = await DO("frontier", `level=content&viewer=member:not-invited&limit=3`);
  const mAt3 = await DO("frontier", `level=content&viewer=class:member&limit=3`);
  t("G1: THE DEFECT, DRIVEN — at a bound of 3 over a supply of 4, an uninvited member receives "
  + "3 rows, which is their WHOLE entitlement, and `truncated` reads FALSE. Before this landing "
  + "it read TRUE, because the flag compared the RAW FETCH against the bound while the answer was "
  + "cut from the GATED list — a question about a list the caller never sees. THE SUPPLY IS IN "
  + "THE TUPLE ON PURPOSE: a failure naming only one of the two counts is a failure a reader "
  + "cannot act on, so this arm goes red printing the gated count AND the raw supply together",
    [nAt3.looked.length, nAt3.truncated, mAll.looked.length],
    [G_VISIBLE_UNINVITED, false, G_TOTAL_WITH_ROWS]);

  t("G1b: …AND IT IS ARMED AGAINST THE DATA, NEVER AGAINST THE FLAG (REC-94's leak passed a "
  + "flag-only arm because `capture_held` was already false). The three rows are the three "
  + "captures an uninvited member may see, BY NAME, and the withheld one is in none of them — so "
  + "the `false` above is a statement about a list whose contents this arm has checked",
    [nAt3.looked.map((r) => r.subject).sort().join(","),
     JSON.stringify(nAt3).includes(SHA_PROJ)],
    [[SHA_WHOLE, SHA_SHORT, SHA_NOTEXT].sort().join(","), false]);

  t("G1c: THE SAME BOUND, THE OTHER VIEWER, THE OPPOSITE ANSWER — and this is the arm that shows "
  + "the flag now follows the CALLER'S OWN LIST rather than the supply. A viewer entitled to all "
  + "four gets 3 rows at a bound of 3 and `truncated` TRUE, because for THEM a row really was cut",
    [mAt3.looked.length, mAt3.truncated], [3, true]);

  /* CASE TWO — THE REVERSE. Bound 2. The uninvited member's own list is 3, which
     DOES exceed it, so their answer really is cut and `true` is the honest
     answer. Without this arm G1 would be satisfied by a flag hard-wired false. */
  const nAt2 = await DO("frontier", `level=content&viewer=member:not-invited&limit=2`);
  t("G2: THE REVERSE, DRIVEN — at a bound of 2 the same uninvited member's own list of 3 DOES "
  + "exceed it, they receive 2 rows, and `truncated` reads TRUE. Without this arm G1 is satisfied "
  + "by a flag wired to false, which is the equality costing nothing to produce",
    [nAt2.looked.length, nAt2.truncated], [2, true]);

  /* ---- THE DISCLOSURE DECISION, PINNED -------------------------------------
     REC-109 was asked to decide whether a count of what was withheld is
     published beside this flag. IT IS NOT, and the reasoning is at the site in
     `store.mjs` rather than here: the defect this row closed WAS such a count.
     A `truncated` read off the raw supply is one bit of it wearing a bound's
     name — to a viewer whose page is short, `true` said *rows exist here that
     you are not being shown*. So fixing the flag and refusing the count are one
     act, and this arm keeps the decision visible to the next reader. */
  t("G3: NO COUNT OF WHAT WAS WITHHELD IS PUBLISHED, and the answer carries no field that is one "
  + "— REC-30's rule, and the decision is recorded at the site in `store.mjs` rather than in a "
  + "report. The defect this row closed WAS a one-bit count of exactly that, so refusing the "
  + "count and fixing the flag were ONE act",
    [Object.keys(nAt3).filter((k) => /withheld|hidden|redacted|suppressed/i.test(k)),
     Object.keys(nAt3).some((k) => /count/i.test(k) && /withh|hidd/i.test(k))],
    [[], false]);

  t("G3b: …AND THE FLAG LEAKS NOTHING BY CONSTRUCTION, which is a stronger statement than *no "
  + "field is named withheld* and is why it is driven separately: at a bound of 2 BOTH viewers "
  + "read TRUE and at a bound of 4 BOTH read FALSE, so across those bounds the flag does not "
  + "distinguish the viewer who is being withheld from the one who is not",
    [nAt2.truncated, (await DO("frontier", `level=content&viewer=class:member&limit=2`)).truncated,
     (await DO("frontier", `level=content&viewer=member:not-invited&limit=4`)).truncated,
     (await DO("frontier", `level=content&viewer=class:member&limit=4`)).truncated],
    [true, true, false, false]);

  /* ---- OVER-STRICTNESS, AND IT IS THE ARM THAT MATTERS MOST ---------------- */
  t("G4: OVER-STRICTNESS — a viewer entitled to EVERY row gets an answer this landing did not "
  + "move, because for them the gated list and the supply ARE the same list. Four rows at a bound "
  + "of 500, `truncated` false, and the rows themselves byte-identical to the first three of the "
  + "unbounded read",
    [mAll.looked.length, mAll.truncated,
     JSON.stringify(mAt3.looked) === JSON.stringify(mAll.looked.slice(0, 3))],
    [G_TOTAL_WITH_ROWS, false, true]);

  t("G4b: …and the uninvited member's three rows are BYTE-IDENTICAL to what the entitled viewer "
  + "gets for those same three subjects. The row does not change with the reader; only whether it "
  + "is published at all does (REC-103's I4b, at this level)",
    JSON.stringify(nAll.looked),
    JSON.stringify(mAll.looked.filter((r) => r.subject !== SHA_PROJ)));

  /* ---- THE RESIDUAL, NOW CLOSED — MOVED 2026-09-23 BY D-389 ------------------
     This block read: *`truncated: false` rests on the raw over-fetch being wide
     enough to absorb the fence … THIS ARM EXISTS SO THE NEXT READER MEETS THE
     DECISION RATHER THAN THE DEFECT.* That was right when written and is now
     superseded, not exempted: D-389 put the full-fetch disjunct (`raw.length ===
     limit`) in `#frontierPage`, the ONE over-fetch the document, content and meaning
     arms share, so a FULL raw fetch reads `truncated: true` for every viewer and
     `false` no longer rests on the room being enough. The OLD PIN named the fetch
     as `this.#frontierLatest("content", …)` in this arm; the fetch now happens in
     the shared helper, so the pin names the arm's call into it WITH THE SAME
     FACTOR — the over-fetch is still twice the bound and still protects the answer
     (REC-109's `overfetch` arm), and the residual is driven behaviourally at all
     three levels by `d389-fullfetch.test.mjs`. */
  t("G5: THE OVER-FETCH IS PINNED AT TWICE THE BOUND, ON PURPOSE AND WITH ITS LIMIT NAMED — the "
  + "raw page is fetched at `(cap + 1) * 2`, the DOCUMENT arm's factor, so the fence has room to "
  + "drop rows before the cut. IT PROTECTS THE ANSWER AND NOT ONLY THE FLAG, which this item's "
  + "control MEASURED rather than assumed: narrowed back to `cap + 1`, an uninvited member at a "
  + "bound of 2 receives TWO rows while entitled to THREE and is told the list is complete, and "
  + "G2 and G3b go red for that reason alone. This pin is the belt beside those braces. The "
  + "residual (D-389) is CLOSED at the shared over-fetch, `#frontierPage`: a FULL raw fetch now "
  + "reads truncated for every viewer",
    [/#frontierPage\("content", cap, \{ limit: \(cap \+ 1\) \* 2, subjectKind: "capture" \}/
       .test(SRC.store),
     /* MOVED 2026-09-23 BY REC-174, NEVER EXEMPTED: the missing supply is no longer fetched bare and
        filtered after (`LIMIT ?`, (cap + 1) * 2).filter(…)`) — it goes through `#frontierFetch` at the SAME
        factor, so its FULL bit reaches the claim; and the full-fetch test moved from `#frontierPage`'s own
        line into that helper (`full: raw.length === limit`), which the page's claim ORs as `|| full`. The
        pin still names the same two facts: the factor, and the one test. */
     /const missingFetch = this\.#frontierFetch\(\(cap \+ 1\) \* 2,[\s\S]{0,600}?LIMIT \?`, n\), \(r\) => visible\(r\.bundle_id\) !== null\)/
       .test(SRC.store),
     /truncated: gated\.length > cap \|\| full\b/.test(SRC.store)
       && /full: raw\.length === limit/.test(SRC.store)],
    [true, true, true]);

  /* MOVED 2026-09-23 BY D-389: the page's disjunct is no longer spelled `page.length > cap` here — it is
     `latest.truncated`, computed once in `#frontierPage` — and this arm's own claims are written FIRST so
     `derivation-bounds.test.mjs` can grade them. What G5b pins is unchanged: `never` and `unexplained`,
     never `missing`. */
  t("G5b: AND THE CLAIM NAMES ONLY COLLECTIONS THIS METHOD PAGES — `never` and `unexplained` are "
  + "what get cut at the bound, never `missing`, which is split by §5.1's cause before anything "
  + "is published. That was the SECOND error in the one statement D-385 named, and it is the one "
  + "CONDUCT #11 already corrected in `#frontierMeaning` on 2026-09-15",
    /* MOVED 2026-09-23 BY REC-174: the claim gained `missingFetch.full` (the missing supply's full-fetch bit)
       between the arm's own lists and the page's. `never` and `unexplained`, never `missing`, is unchanged. */
    [/truncated: never\.length > cap \|\| unexplained\.length > cap\s*\n\s*\|\| missingFetch\.full \|\| latest\.truncated/
       .test(SRC.store),
     /truncated: [^\n]*missing\.length > cap/.test(SRC.store)],
    [true, false]);
}

/* ===================================================================== *
 * J · REC-110 / D-386 — THE `tally` IS UNGATED ON PURPOSE AT THIS LEVEL TOO.
 *
 * **THIS SITE CARRIED NO STATEMENT AT ALL UNTIL REC-110, AND THAT IS THE GAP
 * D-386 DID NOT NAME.** REC-103 stated the posture at the DOCUMENT arm alone,
 * so a reader who arrived at `#frontierContent` met an identical ungated
 * aggregate over a table whose rows this very file proves are withheld
 * row-whole (section G), with nothing beside it saying why — the *reader meets
 * the defect rather than the decision* condition, one method away from where it
 * was being prevented.
 *
 * THE REASONING IS IN `store.mjs` AT THE DOCUMENT ARM and is deliberately not
 * restated here or there: one rule with three spellings is the mirror-and-drift
 * class. THE ARMS ARE WHAT THIS FILE OWES — a decided-not-to-act outcome is
 * worth exactly what its pin is worth.
 *
 * AND THIS LEVEL GIVES THE SHARPEST ARM IN THE ESTATE FOR IT, which is why the
 * pin lives here as well as at the document level rather than only there:
 * section G has already DRIVEN a member who is withheld from a REAL capture
 * (`SHA_PROJ`) by name. So J1 below is not *two viewers happen to agree* — it
 * is *a viewer provably denied a row still receives the count that includes
 * it*, which is the ruling stated as an experiment.
 * ===================================================================== */
{
  const T = (f) => Object.values(f.tally || {}).reduce((a, b) => a + b, 0);
  const J = (f) => JSON.stringify(f.tally || {});

  const mAll = await DO("frontier", `level=content&viewer=class:member&limit=500`);
  const nAll = await DO("frontier", `level=content&viewer=member:not-invited&limit=500`);

  t("J0: THE ARM IS ARMED AGAINST THE DATA, NEVER AGAINST THE FLAG — the uninvited member is "
  + "REALLY being withheld from a REAL capture here (`SHA_PROJ`, by name, section G's fixture) "
  + "and really receives fewer rows than the entitled viewer. Without this, J1 is an equality "
  + "between two answers that were never different — the costs-nothing rule, and REC-94's leak "
  + "passed a flag-only arm for exactly this reason",
    [nAll.looked.length < mAll.looked.length,
     JSON.stringify(nAll.looked).includes(SHA_PROJ),
     JSON.stringify(mAll.looked).includes(SHA_PROJ),
     T(mAll) > 0],
    [true, false, true, true]);

  t("J1: THE RULING, DRIVEN THROUGH THE OP — a member DEMONSTRABLY denied a row (J0) still "
  + "receives a `tally` BYTE-IDENTICAL to the entitled viewer's, because it counts every row at "
  + "this level and does not follow the reader. D-386 RULED (a) by REC-110; the reasoning is at "
  + "the document arm in `store.mjs`. **BOTH TALLIES ARE IN THE TUPLE ON PURPOSE: if a later "
  + "session gates this, the failure prints the withheld tally beside the full one**, because a "
  + "failure naming one is a failure a reader cannot act on",
    J(nAll), J(mAll));

  const at1   = await DO("frontier", `level=content&viewer=class:member&limit=1`);
  const at500 = await DO("frontier", `level=content&viewer=class:member&limit=500`);
  t("J2: …AND IT DOES NOT FOLLOW THE BOUND EITHER — D-386's option (b) had a SECOND spelling, "
  + "*change what the field counts to this page's states*, which moves every viewer together and "
  + "so walks straight past J1. What it cannot walk past is the bound: the same viewer at "
  + "`limit=1` and `limit=500` gets the same tally while the page really is cut. The cut length "
  + "is in the tuple so this cannot pass over a bound that never bit",
    [J(at1), at1.looked.length <= 1, at500.looked.length > 1],
    [J(at500), true, true]);

  t("J3: AND THE DECISION IS AT THIS SITE, which is the half of this row that was missing — "
  + "`#frontierContent`'s tally now names REC-110 and D-386 and POINTS at the document arm for "
  + "the reasoning rather than restating it. An assertion that the field is ungated is only half "
  + "a pin: a session that gated it would delete the comment too, so the arm reads the SOURCE",
    [/REC-110, 2026-09-17, D-386 CLOSED/.test(
       SRC.store.slice(SRC.store.indexOf("#frontierContent("),
                       SRC.store.indexOf("#frontierMeaning("))),
     /* CORRECTED 2026-09-24 BY D-486, NEVER EXEMPTED. This read `/level = 'content' GROUP BY state/`,
        an ADJACENCY pin — and the adjacency is exactly what BOB #32's ruling had to break: the tally now
        interpolates `#hiddenRunTail(viewer)` between the level literal and the GROUP BY, so the two tokens
        are no longer neighbours. **THE OLD ASSERTION WAS PINNING A SPELLING RATHER THAN THE RULE**, which
        is why it went red on a change that strengthens the very thing J3 exists to protect. What the rule
        actually is: this site counts the WHOLE level (not the page), grouped by state. Both halves are
        pinned below as their own tokens, so a future narrowing to the page still fails here. */
     /level = 'content'\$\{hidTail\.sql\} GROUP BY state/.test(SRC.store)],
    [true, true]);

  /* J5 — D-486 / BOB #32 (2026-09-24): THE ONE NARROWING, AND ITS PIN. REC-110's ruling is NOT reopened —
     the tally still counts every row at this level for every viewer and still does not follow the page.
     What it no longer counts is a run row whose project the caller cannot see, because Bob ruled a hidden
     project's run output to be THE PROJECT'S THINKING until something outside uses it. The pin here is that
     the narrowing is spelled ONCE: all five readers take `#hiddenSets`' predicate, and this site reaches it
     through the shared `#hiddenRunTail` rather than restating the subtraction — one rule with five spellings
     is the mirror-and-drift class, and it is the failure mode REC-110's own J3 was written against.
     The LIVE arm is `project-sight.test.mjs` §9, which drives a real run over a real hidden project through
     the op; this is the SITE arm, J3's job for the new rule. */
  t("J5: D-486's narrowing is at this site and is the SHARED predicate, not a second spelling — this tally "
  + "calls `#hiddenRunTail`, the helper names BOB #32's ruling, and the subtraction itself is written in "
  + "exactly ONE place in the file (`#hiddenSets`), which is what keeps the five readers one rule",
    [/const hidTail = this\.#hiddenRunTail\(viewer\);/.test(
       SRC.store.slice(SRC.store.indexOf("#frontierContent("), SRC.store.indexOf("#frontierMeaning("))),
     /BOB #32, 2026-09-24 02:30Z/.test(SRC.store),
     (SRC.store.match(/NOT \(authority_kind = 'run' AND COALESCE\(authority, ''\) IN /g) || []).length,
     (SRC.store.match(/this\.#hiddenRunTail\(viewer\)/g) || []).length],
    [true, true, 1, 3]);
}

/* ===================================================================== *
 * H · REC-107 — THE SWEPT HALF. This level had the SAME defect the meaning
 *     level was rowed for, and fixing one while leaving the other would have
 *     taught the next reader that the short enumeration was acceptable.
 *
 * `MISSING_ROW_CAUSES.purged` published, on every row, *"either the log did
 * not yet exist for it or a whole-store purge cleared the rows that described
 * it. NEITHER CAN BE RULED OUT."* Two members. A capture reaches that cause
 * because the `readings` probe MISSED — so NOBODY HAVING LOOKED is fully live
 * and the sentence excluded it. This level's evidence is TWO-SIDED, which is
 * REC-94's own finding and is why the set here is two rather than three; the
 * sidedness is now PUBLISHED in the same key and the same map shape the
 * meaning level uses, so a reader who joins it the same way at both levels is
 * right at both.
 * ===================================================================== */
{
  const f = await GET(`op=frontier&token=${TOK}&level=content&limit=500`);
  const all = [...(f.never_looked || []), ...(f.missing_unexplained || [])];

  t("H1: THIS LEVEL PUBLISHES ITS SIDEDNESS, in the SAME key and the SAME shape as the meaning "
  + "level rather than as a bare boolean — one key name carrying a map at one level and a scalar "
  + "at another is two shapes for one fact, and REC-94 measured this level TWO-SIDED without ever "
  + "publishing it",
    [f.evidence_one_sided && typeof f.evidence_one_sided === "object",
     f.evidence_one_sided?.capture],
    [true, false]);

  t("H1-fixture: and the rows this section measures are NOT AN EMPTY LIST — a totality arm over an "
  + "empty corpus passes whatever the code does, which this repository has paid for three times",
    all.length > 0, true);

  t("H2: `not_ruled_out` IS TOTAL over both published lists, and every member of every set is a "
  + "key of this level's own published cause vocabulary — a fourth spelling would be a cause "
  + "wearing a set's clothes",
    [all.every((r) => Array.isArray(r.not_ruled_out) && r.not_ruled_out.length > 0),
     all.every((r) => typeof r.evidence_one_sided === "boolean"),
     all.every((r) => Array.isArray(r.not_ruled_out)
                   && r.not_ruled_out.every((k) => ALL_MISSING_ROW_CAUSES.includes(k)
                                               && Object.keys(MISSING_ROW_CAUSES).includes(k)))],
    [true, true, true]);

  t("H3: A `never_looked` ROW CARRIES THE ONE-MEMBER SET, which is what makes it the positive "
  + "statement §5.1 licenses — and it carries the field at all, so a reader never meets a row "
  + "without it and never has to wonder whether its absence meant anything",
    (f.never_looked || []).every((r) => Array.isArray(r.not_ruled_out)
                                     && r.not_ruled_out.length === 1
                                     && r.not_ruled_out[0] === "never_looked"),
    true);

  t("H4: AND THE TWO-SIDED SET IS TWO AND NOT THREE — driven through THIS level's constant rather "
  + "than asserted as a literal, so the day `readings` stops holding a row for every capture the "
  + "extractor ran over, this arm moves with it instead of pinning a stale answer",
    causesNotRuledOut("purged", { evidenceOneSided: CONTENT_EVIDENCE_IS_ONE_SIDED.capture }),
    ["purged", "never_looked"]);

  t("H5: no published `why` at this level still asserts that exactly two causes could not be ruled "
  + "out. The sentence describes the cause and DEFERS the set to the row, which is the only place "
  + "it can be right",
    all.every((r) => typeof r.why !== "string" || !/Neither can be ruled out/i.test(r.why)),
    true);

  t("H6: WHAT THIS SECTION CANNOT SEE, STATED. Every row above is one THIS suite's fixture "
  + "produced, so the arms reach the causes this store can reach and no others; a `purged`-cause "
  + "capture needs a registration predating the log's first content-level row, which a store built "
  + "inside this file cannot have. That branch is driven on the pure rule in H4 with this level's "
  + "own sidedness — the same value the op passes — and the gap is NAMED rather than scored zero",
    [new Set(all.map((r) => r.missing_cause)).size > 0,
     (f.missing_unexplained || []).some((r) => r.missing_cause === "purged")],
    [true, false]);
}


reachedFoot = true;

} catch (e) {
  /* THE THROW IS PRINTED, because a suite that dies silently reports a clean
     tally and the foot-guard's `-1` says only THAT it died. */
  console.log(`  THREW: ${e && e.stack ? e.stack : e}`);
} finally {
  await mf.dispose();
  /* THE FOOT WAS REACHED — asserted rather than assumed. A TypeError inside an
     assertion goes through NO assertion at all: it ends the module while the
     tally reads clean, and a suite that stopped early reports a comfortable
     green. `-1` rather than `0` when the foot was missed, because 0 is a number
     a reader can mistake for a result. */
  console.log(`\nobservation-content: ${reachedFoot ? pass : -1} pass, ${fail} fail`);
}
/* EXPLICIT IN BOTH DIRECTIONS, which `hygiene.test.mjs` requires of every suite and
   which it caught this suite failing: `process.exit(1)` under a condition leaves the
   GREEN path to node's default, and a suite that merely declines to fail is not the
   same as one that says it passed. The foot guard is folded into the SAME expression
   rather than sitting in a second `exit` above it, so there is one place this suite
   decides its own verdict — a suite that died early exits 1 for the same reason a
   suite with a red assertion does, and neither can reach the 0. */
process.exit(fail || !reachedFoot ? 1 : 0);
