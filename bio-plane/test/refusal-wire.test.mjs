/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/refusal-wire.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's, PL-4's, PL-11's and REC-73's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in the shared scratchpad, every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a UNIQUELY-NAMED per-arm pristine copy, and a BASELINE arm runs first so a run in which every arm reports the same thing is distinguishable from a run in which the arms worked.
   DECLARED BEFORE ARMING — what MUST fail and what MUST NOT. Actual figures are written into the control driver's header when it runs, including any arm that came back other than declared.
   (a) BASELINE — nothing armed. MUST be green, and its assertion count is what every other arm's figure is read against.
   (b) THE SUBJECT, REMOVED — delete the `dec49Attach(o)` call from `json()` in `src/index.mjs`, leaving the helper defined and every refusal site untouched. MUST FAIL, naming the eleven fences and every other catalogued code that then arrives bare. This is the state `main` was in before D-262 and it is the arm that proves this suite watches the WIRE.
   (c) THE DIVERGENCE — a REAL refusal site (`MACHINE_CANNOT_CONCLUDE` in `src/store.mjs`) is given a translation the catalogue does NOT hold. MUST FAIL naming it. ONE arm testing TWO properties: that the grade is an EQUALITY against the row and not a presence check, and that the decoration FILLS rather than OVERWRITES — an overwriting decoration would silently correct the planted sentence into agreement and this arm would come back GREEN.
   (d) THE CATALOGUE WALK GOES BLIND — make the `_CHECKS$` family harvest match nothing in THIS FILE. MUST FAIL on the corpus FLOOR, before any membership claim is made over the empty set. A gate that passes over an empty corpus is this project's three-times-measured failure and the floor is the whole defence.
   (e) THE OP WALK GOES BLIND — neuter the `OPS` parse in THIS FILE. MUST FAIL on the op-corpus FLOOR for the same reason, and MUST NOT be able to report "0 violations" as good news.
   (f) A THIRTEENTH FENCE ARRIVES UNMEASURED — drop one code out of the harvested machine-fence set. MUST FAIL naming the code and the count (the set is harvested from `store.mjs`, never typed).
   (g) OVER-STRICTNESS, and it is the arm this file exists to survive: a REAL site is rewritten to carry its row itself, in a SHAPE THIS SUITE WAS NOT WRITTEN AROUND — the code spelled in `code` with NO `reason` at all, the row IMPORTED rather than hand-copied (an equality that costs nothing is not evidence), an extra key the grader has never seen. It MUST PASS. A grader that reports correct work as bare is worse than no grader, because it teaches the next author to route around it.
   (h) REC-185 — `op=purge`'s CODED REFUSAL REVERTED TO ITS BARE SENTENCE at its site in `src/index.mjs`, the whole refusal restored to the pre-REC-185 answer rather than one key deleted, so the arm is the defect and not a caricature of it. Section 6b MUST FAIL BY NAME on four of its six lines (and, FROM D-495, section 6c's residue pin fails beside them, for five failures in total rather than REC-185's four — see the D-495 run line below) — no code, no C-number and no canned translation, no argument/shape, and no "Nothing was changed." on the one op that destroys a record. MUST NOT FAIL: 6b's `error` line, because the sentence is byte-identical either way and that is precisely what makes this an arm about the CODE and not about the wording; nor anything in section 2c, whose two walks do not read this site (it carries no spread, and it never left by a raw `new Response`) — an arm that took those down with it would be moving a second variable.
   (i) REC-185's OVER-STRICTNESS ARM, on the REAL site: `op=purge`'s refusal rebuilt AT ITS SITE in a spelling 6b was not written around — the code in `code` with NO `reason`, the row IMPORTED from `REQUIRED_ARGUMENT_CHECKS` rather than hand-copied, the `detail` worded unlike anything the helper writes, an extra key the grader has never seen. It MUST PASS: 6b grades whether a caller is told the FACT, never whether the helper was the author.
   (j) D-494 — A FENCE'S MINT DROPPED AT ITS SITE IN `src/store.mjs`: `MACHINE_CANNOT_REVIEW`'s literal replaced with a code the harvest does not match, so the catalogue row survives a fence that no longer exists. Section 3b MUST FAIL naming `MACHINE_CANNOT_REVIEW` under `cataloguedMintedNowhere` — BY NAME, never on a count. MUST NOT FAIL: 3b's template census, and nothing in 2c or 6b. Section 3's older `store.mjs`-only floor MAY also fail on the same loss; that is the two instruments agreeing over one variable, not a second variable.
   (k) D-494's OVER-STRICTNESS ARM: `MACHINE_CANNOT_GROUND` hoisted into a `const` above its DEC-49 region and minted THROUGH THE VARIABLE — the shape a `machineFenceRow` refactor produces and the one section 3b was not written around. It MUST PASS: the widened harvest walks literals wherever they stand. A RED here would be an instrument demanding one syntax, which is how a check comes to be routed around.
   RUN 2026-09-24 BY THE D-494 WORKER on branch `land/worker/D-494`, TWICE — once over origin/main 0fdef669 and again after rebasing onto origin/main d536f834 (which moved `src/store.mjs`, so the figures were RE-MEASURED rather than carried across the rebase; they agree), and the figures are the ones the driver PRINTED: **a GREEN 35/0 · b RED 31/4 · c RED 32/3 · d RED 1/2 · e RED 29/6 · f RED 34/1 · g GREEN 35/0 · h RED 31/4 · i GREEN 35/0 · j RED 33/2 · k GREEN 35/0 — ALL ELEVEN AS DECLARED**, all three files byte-identical to their pristine-of-record by sha256 AND by `cmp` (on d536f834: `src/store.mjs` 3164607 bytes sha `213ad1fa0b4dd608…`, `src/index.mjs` 779787 bytes sha `ee3c550c242f7895…`, `test/refusal-wire.test.mjs` 66452 bytes sha `32e24d56b970eda4…`). Arm (j)'s two failures are the declared one plus section 3's older `store.mjs`-only floor, which reads the same loss — the two instruments agreeing over one variable. **AND THE DRIVER ITSELF WAS CORRECTED BY THIS ARM RATHER THAN THE ARM BY THE DRIVER:** the first run printed arm (j) RED on a label TRUNCATED AT 200 CHARACTERS, so the driver's own output said a line had failed and NOT which fence it failed over — the count-not-names reading this item exists to refuse, in the instrument that grades the item. The driver now prints each FAIL's `want`/`got` continuation and was RE-RUN rather than adjusted on paper; the figures above are the second run's, and arm (j)'s `got` reads `cataloguedMintedNowhere: ["MACHINE_CANNOT_REVIEW"]`.
   (l) D-495 (was j on its branch) — AN ADMIN-ONLY REFUSAL STRIPPED OF ITS CODE: `GROUP_SLUG_MALFORMED` at its site in `src/store.mjs`, reverted to a bare `error` sentence — the whole refusal and not one key deleted, so the arm is the defect and not a caricature of it. `op=instancegroupseed` is `["admin"]` ALONE, so it is invisible to the member drive, to section 9's pin and to 6b's hand-driven purge: ONLY the class drive can see it, which is what makes this the arm for D-495 rather than a second copy of (h). MUST FAIL on section 6c's residue pin, NAMING `instancegroupseed (admin)`. MUST NOT FAIL: 6c's admin and probe REACH counts, because the op body is still reached and that is what separates a refusal finding from a gate finding; 6c's grade, because a refusal carrying NO code is not a bare TRANSLATION and scoring it as one would be the instrument confusing its own two questions; section 9's member+`ai` pin, which cannot see this op at all; and 6b, whose site is untouched.
   (m) D-495's (was k on its branch) OVER-STRICTNESS ARM, on the REAL site: the same refusal rebuilt in a spelling 6c was not written around — the code in `code` with NO `reason`, the row IMPORTED from `INSTANCE_GROUP_CHECKS` rather than hand-copied, and an extra key the grader has never seen. It MUST PASS: 6c asks whether the caller was told WHICH condition fired, never which helper wrote the answer.
   RUN 2026-09-24 BY CONDUCT #20 ON THE c20-batch17 UNION (D-494 + D-495 together, D-495's arms relabelled l/m), the
   figures the driver PRINTED: a GREEN 42/0 · b RED 37/5 · c RED 38/4 · d RED 1/2 · e RED 33/9 · f RED 41/1 · g GREEN 42/0 ·
   h RED 37/5 · i GREEN 42/0 · j RED 40/2 · k GREEN 42/0 · l RED 41/1 · m GREEN 42/0 — ALL THIRTEEN AS DECLARED; index.mjs,
   store.mjs and this suite byte-identical to pristine-of-record by sha256 and cmp. The per-branch RUN lines below are each
   branch's own figures, kept as history.
   RUN 2026-09-24 BY THE D-495 WORKER on branch `land/worker/D-495` over origin/main 0fdef669, and the figures are the ones the driver PRINTED: **a GREEN 40/0 · b RED 35/5 · c RED 36/4 · d RED 1/2 · e RED 31/9 · f RED 39/1 · g GREEN 40/0 · h RED 35/5 · i GREEN 40/0 · j RED 39/1 · k GREEN 40/0 — ALL ELEVEN AS DECLARED**, all three files byte-identical to their pristine-of-record by sha256 AND by `cmp` (`src/index.mjs` 779787 bytes, `src/store.mjs` 3160297 bytes, this file 71433 bytes). Arm (j)'s ONE failure is the declared one and no others. **AND ARM (h) NOW FAILS ON FIVE LINES WHERE REC-185 DECLARED AND MEASURED FOUR — recorded here rather than smoothed, because it is this item's own effect and not a drift.** The fifth is 6c's residue pin: `op=purge` is `["admin", "probe"]`, so stripping its code now makes it a codeless refusal the CLASS DRIVE sees, where before D-495 only 6b's hand-driven call could. That is the blindness closing, measured from the inside — the same defect is now caught by two instruments instead of one, and (h)'s declaration above is corrected to five for that reason rather than the arm being re-scoped.
   RUN 2026-09-24 BY THE REC-185 WORKER on branch `land/worker/REC-185` over origin/main 548eb2c5, TWICE, and the figures are the ones the driver PRINTED: FIRST PASS **ARM (f) CAME BACK GREEN 33/0 WHERE IT IS DECLARED RED** — not this item's arm and not a broken arm, but the fence floor of 12 gone slack against a family of 14, which had disarmed (f) silently. The floor was moved to the measured 14 with its reason at the site and the driver RE-RUN rather than adjusted on paper: **a GREEN 33/0 · b RED 29/4 · c RED 30/3 · d RED 1/2 · e RED 27/6 · f RED 32/1 · g GREEN 33/0 · h RED 29/4 · i GREEN 33/0 — ALL NINE AS DECLARED**, all three files byte-identical to their pristine-of-record by sha256 AND by `cmp`. Arm (h)'s four failures are exactly the four declared and no others.
   RUN 2026-08-09 IN WORKTREE agent-a0afb13cbfcc0d6b9, THREE TIMES, and the figures are the ones the driver PRINTED. FIRST RUN (suite at 22 assertions): six of seven as declared — a GREEN 22/0, b RED 18/4, c RED 19/3, e RED 15/7, f RED 21/1, g GREEN 22/0. **ARM (d) CAME BACK `NO TALLY` RATHER THAN RED, AND IT IS RECORDED HERE RATHER THAN SMOOTHED: the arm was right and the INSTRUMENT was wrong.** A blind catalogue made every later block read `ROWS.get(code).translation` on `undefined`, so a `TypeError` ended the module while the tally read clean — WORKER.md's named failure, arriving inside the file built to find that class. Corrected in two ways at once (every `ROWS.get` read is null-tolerant, and a corpus below its floor HALTS at the floor with its tally printed) and RE-RUN: all seven as declared. THIRD RUN against the FINAL suite (23 assertions, after the static-class block landed) — re-run rather than adjusted on paper, because a figure carried forward across an edit is a figure nobody measured: **ALL SEVEN AS DECLARED — (a) GREEN 23/0 · (b) RED 19/4 · (c) RED 20/3 · (d) RED 1/2 · (e) RED 16/7 · (f) RED 22/1 · (g) GREEN 23/0**, all three files byte-identical to their pristine-of-record by sha256 and by `cmp`.
 * =========================================================================
 * refusal-wire.test.mjs — D-262. **THE RESPONSE, GRADED AGAINST THE CATALOGUE.**
 *
 * WHAT NOTHING ELSE DOES, AND IT IS THE WHOLE REASON THIS FILE EXISTS.
 *
 * `civicos-ui/check-refusal-codes.mjs` (VF-2, the DEC-49 guard) grades the SITE
 * against the CATALOGUE: does every refusable condition name a code, does every
 * code resolve to a row, is every governed span real. It says so itself — *"it
 * says nothing about a LIVE plane"*. `test/machinefences-dec49.test.mjs` grades
 * the CATALOGUE against its RENDERER. `test/machine-fences.test.mjs` (REC-73)
 * grades the FENCE against the ACT: each of the twelve refuses a machine by NAME
 * under a payload that would otherwise succeed.
 *
 * **NOT ONE OF THEM GRADES THE RESPONSE A CALLER ACTUALLY RECEIVES.** So a fence
 * could be perfectly declared, perfectly catalogued, pass every guard, refuse by
 * name under a complete payload — and still hand a member the bare string
 * `MACHINE_CANNOT_RELEASE`. That is exactly what eleven of the twelve did, for
 * as long as they have existed, with four instruments watching. **A mechanism
 * believed on its EXISTENCE rather than its BEHAVIOUR is this project's
 * most-repeated defect, and here the mechanism was a checker.**
 *
 * WHY THE CONSEQUENCE IS REAL AND NOT AESTHETIC. A counter-reading says a
 * consumer holding the catalogue can resolve a bare code, so the wire need not
 * carry the sentence. **The agent worker deliberately holds no catalogue.**
 * `agent-worker/src/index.mjs` says it three times in its own words — *"the
 * plane's refusal carries its C-number and its DEC-49 canned translation; this
 * member passes it through UNCHANGED"* — and it is right to: a component that
 * paraphrases a refusal is the thirteen-surfaces drift DEC-49 exists to close.
 * A pass-through that receives nothing passes nothing through. So for the one
 * consumer built since DEC-49, "the catalogue can resolve it" resolves nothing.
 *
 * ------------------------------------------------------------- WHAT IT DOES
 *
 * It drives the plane's OWN op surface and grades every refusal that comes back.
 *
 *   1. THE CATALOGUE, harvested by the `_CHECKS` suffix — the same rule the
 *      DEC-49 guard harvests by, so a family minted tomorrow is in the corpus
 *      with no edit here. FLOORED and PRINTED.
 *   2. THE OPS, parsed out of `index.mjs`'s own table. FLOORED and PRINTED.
 *      A hand list of ops would go stale the day a new one lands, which is the
 *      staleness that produced this defect in the first place.
 *   3. THE DRIVE. Every op the surface admits, called with an EMPTY payload,
 *      under a signed-in MEMBER and again under an `ai` credential whose
 *      declared scope names every mutating op a member reaches. **AND, FROM
 *      D-495 (2026-09-24), under the ADMIN and PROBE bearer credentials too
 *      (section 6c)** — which takes this drive from the 183 member-class rows
 *      to all 196 rows that name any class, closing the blindness section 9's
 *      pin had carried in prose and that REC-185 had to drive `op=purge` by hand
 *      around. An empty
 *      payload is not a weakness here: what is being graded is the ENVELOPE a
 *      refusal travels in, and a refusal that arrives is a refusal whatever
 *      provoked it. The machine fences sit ABOVE the payload complaints (that
 *      is what D-229 measured), so the machine pass reaches them.
 *   4. THE GRADE — **the gate**. Every refusal whose code has a catalogue row
 *      must carry `check` and `translation`, and they must EQUAL the row. Not
 *      "carry something": equal it, because a surface rendering a sentence the
 *      catalogue does not hold is DEC-8's defect wearing DEC-49's clothes.
 *   5. THE CENSUS — **reported, not gated**. Codes received with NO row are
 *      REC-64's remaining sweep, not this item's, and gating them here would
 *      fail on work somebody else is doing. **That is the boundary between the
 *      two items, drawn by the instrument rather than by an agreement.**
 *   6. WHAT IT COULD NOT CLASSIFY — printed BY NAME. A thing this walk does not
 *      understand must be named, never silently scored zero.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - IT CAN SEE any refusal that leaves the control plane through `json()` in
 *     an op response, at the top level or under the Durable Object's `result`.
 *   - IT CANNOT SEE a refusal returned as a raw `new Response(...)` (bytes,
 *     HTML, 204, the version string — 7 such returns, none of them a refusal
 *     carrier). **THAT FIGURE IS NO LONGER PROSE: REC-185 walks it on every run
 *     in section 2c and GATES the refusal-carrying set at empty, because a
 *     figure measured once by hand is a claim about the day it was taken and
 *     this one had been carried across weeks.** Also invisible here: a refusal
 *     whose code arrives only through a SPREAD of somebody else's answer — 13
 *     such forwards, walked and PRINTED in 2c, visible on the wire wherever the
 *     drive reaches the op and residual exactly where it does not; a refusal
 *     nested deeper than `result` (deliberately out
 *     of the decoration's reach too, and for the same reason: those are data);
 *     a refusal a payload richer than empty would be needed to provoke; or a
 *     refusal shape that does not say `ok: false`. The last of those is the
 *     interesting one and it is COUNTED and PRINTED rather than assumed absent.
 *   - IT IS NOT A LIVE PROBE. A green harness is not a serving build (D-108).
 *   - D-495: the four credentials cover the 196 op rows that NAME a class. The
 *     17 that name none — the pre-authentication and public surface — are
 *     outside every arm here and are PRINTED BY NAME in 6c rather than counted
 *     clean; `d278-codeless-refusals.test.mjs` is their instrument. The `daemon`
 *     class gets no arm of its own: all three rows naming it also name `admin`,
 *     so each op body is reached — by a different caller than a daemon would be,
 *     which is said rather than glossed.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as CHECK_CATALOGUE from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* Comments blanked length-preservingly before any source walk: this file's
   subject is named in dozens of comments inside the spans it reads, and a walk
   over raw source would read a fence's own explanation as a refusal site. */
const decomment = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
const STORE_BARE = decomment(STORE_SRC);

/* ====================================================================== 1
 * THE CATALOGUE — HARVESTED, FLOORED, PRINTED.
 * ==================================================================== */
console.log("\n=== D-262 · the RESPONSE a caller receives, graded against the catalogue ===");
console.log("\n--- 1. the catalogue, harvested by the `_CHECKS` suffix (the DEC-49 guard's own rule) ---");

const FAMILIES = Object.keys(CHECK_CATALOGUE).filter((k) => /_CHECKS$/.test(k)).sort();
/* code -> {check, translation, family}, plus every code seen more than once. */
const ROWS = new Map();
const DUPLICATED = [];
let untranslatedRows = 0;
for (const family of FAMILIES) {
  const rows = CHECK_CATALOGUE[family];
  if (!rows || typeof rows !== "object") continue;
  for (const [code, row] of Object.entries(rows)) {
    if (!row || typeof row !== "object") continue;
    if (typeof row.translation !== "string" || row.translation === "") { untranslatedRows++; continue; }
    if (ROWS.has(code)) { DUPLICATED.push(code); continue; }
    ROWS.set(code, { check: row.check ?? null, translation: row.translation, family });
  }
}
console.log(`    CORPUS: ${FAMILIES.length} DEC-49 families · ${ROWS.size} codes carrying a canned translation`);
console.log(`            ${untranslatedRows} catalogue entr(ies) in those families carry NO translation and are not gradable here`);

/* THE FLOOR IS THE DEFENCE, and it comes before every claim made over the set.
   A totality assertion that passed over an empty corpus is a thing this project
   has measured THREE TIMES.

   THE FIGURES ARE MEASURED, AND THEY AGREE WITH THE DEC-49 GUARD AT A COST.
   `civicos-ui/check-refusal-codes.mjs` floors at 16 families / 166 rows; this
   walk reported 16 / 166 on 2026-08-09 without being told either number. That
   agreement is NOT free and is therefore worth something: the guard PARSES
   `bio-checks.mjs` as text, and this IMPORTS the module and reads its exported
   objects. Two different mechanisms over one source agreeing is evidence; a hand
   copy of the guard's constants would have agreed for nothing.

   Floored AT the measured figures rather than below them, on purpose: these are
   the DEC-49 guard's own floor, so a family or row that vanishes fails there
   too, and this file adds a second reader rather than a second, laxer standard.
   It is not a ratchet on REC-64 — the sweep only ever ADDS rows. */
/* MOVED 16 -> 35 families and 166 -> 288 codes, 2026-09-20 by D-158 (worktree d158-conduct8),
   FROM THIS SUITE'S OWN GREEN PRINT (`CORPUS: 35 DEC-49 families - 288 codes carrying a canned
   translation`) and never by adding to the numbers that were here. THE MOVE IS ALMOST ALL
   PRE-EXISTING SLACK AND THAT IS THE POINT OF RECORDING THE SPLIT: this file's own paragraph above
   says the figures are floored AT the measurement so that this walk and
   `civicos-ui/check-refusal-codes.mjs` hold one standard, and that agreement had quietly lapsed —
   the other guard floored at 34/285 while this one still said 16/166, nineteen families of slack in
   a floor whose whole job is to catch a walk going blind. Measured by running this suite over the
   PRISTINE origin/main sources (e1aa2eee) with this item's three plane files swapped out and
   restored by sha256 AND cmp: pristine printed 34/286, so 18 families and 120 codes of the move are
   PRE-EXISTING SLACK and +1 family / +2 codes are this item's (SIGNER_ENROLMENT_CHECKS, C-63.1 and
   C-63.2). Both guards now floor at the same figures again. */
t("the catalogue walk found real families and did not go blind", FAMILIES.length >= 35, true);
t("the catalogue walk found real translated rows — the floor is asserted BEFORE anything is "
+ "claimed over the set, because a gate that passes over an empty corpus passes over anything",
  ROWS.size >= 288, true);
/* `dec49Attach` in index.mjs resolves a code against exactly this set, so a code
   living in two families would make the wire's answer depend on module order.
   The DEC-49 guard's arm A refuses a duplicated CHECK NUMBER; this is the same
   property one level over, on the CODE, and it is what the decoration rests on. */
t("no code is minted in two families — the property the one-place decoration rests on", DUPLICATED, []);

/* HALT ON A BLIND CORPUS, AND THIS LINE WAS EARNED BY THE CONTROL RATHER THAN
   FORESEEN. ARM d (the catalogue harvest made to match nothing) was DECLARED to
   come back RED and came back **NO TALLY**: every later block reads
   `ROWS.get(code).translation`, so a blind harvest threw a `TypeError` and the
   module ENDED — the exact shape WORKER.md names, where an assertion that throws
   goes through no assertion at all. The arm was right and the instrument was
   wrong. Two corrections, both here: the reads below are null-tolerant, and a
   corpus that fails its floor STOPS at the floor with its tally printed, so
   "the corpus went blind" is reported as a RED with a number rather than as a
   silence. Recorded rather than smoothed. */
if (FAMILIES.length < 35 || ROWS.size < 288) {
  console.log("\n  HALTED: the catalogue corpus is below its floor. Nothing below can mean anything "
            + "over a corpus this walk cannot see, so nothing below is claimed.");
  console.log(`\nFAILED  ${pass} pass, ${fail} fail`);
  process.exit(1);
}

/* ====================================================================== 2
 * THE OPS — PARSED OUT OF THE PLANE'S OWN TABLE, FLOORED, PRINTED.
 * ==================================================================== */
console.log("\n--- 2. the op surface, parsed out of `index.mjs`'s OPS table (never typed here) ---");
const OPS_BLOCK = INDEX_SRC.slice(INDEX_SRC.indexOf("const OPS = {"),
                                  INDEX_SRC.indexOf("\n};", INDEX_SRC.indexOf("const OPS = {")));
/* `[a-z0-9]+` and NOT `[a-z]+`: an op name carrying a digit is invisible to the
   narrower spelling, and a walk that silently drops rows is the blind-classifier
   shape this repository names most. Both yields are printed so a collapse shows. */
const OP_ROWS = [...OPS_BLOCK.matchAll(/^ {2}([a-z0-9]+):\s*\{\s*classes:\s*(null|\[([^\]]*)\]),\s*mutating:\s*(true|false)/gm)]
  .map((m) => ({
    op: m[1],
    classes: m[2] === "null" ? null : m[3].split(",").map((s) => s.trim().replace(/"/g, "")).filter(Boolean),
    mutating: m[4] === "true",
  }));
const forClass = (c) => OP_ROWS.filter((r) => r.classes && r.classes.includes(c));
const MEMBER_OPS = forClass("member");
const MUTATING_MEMBER_OPS = MEMBER_OPS.filter((r) => r.mutating).map((r) => r.op);
/* D-495: the other two credential classes, harvested by the SAME parse and never typed here.
   `daemon` gets no arm of its own and that is stated rather than implied: all three rows naming
   it (`acquire`, `monitor`, `capturerequestdrain`) also name `admin`, so every one is driven
   below — under the ADMIN credential, which is a different caller reaching the same op body. */
const ADMIN_OPS = forClass("admin");
const PROBE_OPS = forClass("probe");
const CLASSED_OPS = OP_ROWS.filter((r) => r.classes);
const CLASSLESS_OPS = OP_ROWS.filter((r) => !r.classes).map((r) => r.op).sort();
console.log(`    CORPUS: ${OP_ROWS.length} op row(s) parsed · ${MEMBER_OPS.length} admit the member class `
          + `· ${MUTATING_MEMBER_OPS.length} of those are mutating`);
console.log(`    CORPUS (D-495): ${ADMIN_OPS.length} admit admin · ${PROBE_OPS.length} admit probe · `
          + `${CLASSED_OPS.length} name a class at all · ${CLASSLESS_OPS.length} name none`);
t("the OPS table was actually read — a silent parse failure would make every drive below vacuous, "
+ "and would report ZERO VIOLATIONS as good news", OP_ROWS.length >= 120, true);
t("and the member-reachable subset is real too", MEMBER_OPS.length >= 100, true);
/* D-495: the same floor for the two subsets section 6c drives. A collapsed parse here would make
   that whole block vacuous in exactly the way the line above exists to prevent, and it would report
   ZERO codeless refusals — the answer this item is looking for — as good news. */
t("and the admin- and probe-reachable subsets are real too (D-495), floored before the class drive "
+ "rests anything on them", [ADMIN_OPS.length >= 150, PROBE_OPS.length >= 140], [true, true]);

/* ====================================================================== 2b
 * THE STATIC CLASS — HOW BIG THE DEFECT WAS, AND WHY IT IS A DECORATION.
 *
 * REPORTED AND NOT GATED, on purpose and permanently. The drive below can only
 * see refusals an EMPTY payload provokes; this walk sees every SITE that names a
 * catalogued code as a string literal and builds an object carrying no
 * `translation` of its own. **That number is expected to stay above zero
 * forever** — sites are written by hand and always will be — which is exactly
 * the argument for attaching the row at ONE place rather than at each of them.
 * Gating it would be a ratchet demanding eleven, then forty-seven, then a
 * hundred site edits nobody has any reason to make.
 *
 * WHAT THIS MATCHER CAN AND CANNOT SEE, stated because the sentence is what
 * lets the next reader tell a clean result from a walk looking in the wrong
 * place: it reads the enclosing OBJECT LITERAL of a `reason:`/`code:` string
 * literal, so it CANNOT see a refusal assembled across statements, one built by
 * a helper (the twelfth fence is exactly that and is correctly counted as
 * CARRYING), or one whose code is in a variable. Every one of those still
 * leaves through `json()`, so the decoration covers what this walk cannot.
 * ==================================================================== */
console.log("\n--- 2b. the STATIC class: sites naming a catalogued code and carrying no translation ---");
const enclosingObject = (src, at) => {
  let depth = 0, start = -1;
  for (let k = at; k >= 0 && k > at - 4000; k--) {
    if (src[k] === "}") depth++;
    else if (src[k] === "{") { if (depth === 0) { start = k; break; } depth--; }
  }
  if (start === -1) return null;
  depth = 0;
  for (let k = start; k < src.length && k < start + 6000; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") { depth--; if (depth === 0) return src.slice(start, k + 1); }
  }
  return null;
};
const STATIC = { carried: 0, bare: 0, bareCodes: new Set(), uncatalogued: 0, unreadable: 0 };
for (const src of [STORE_BARE, decomment(INDEX_SRC)]) {
  for (const m of src.matchAll(/\b(?:reason|code)\s*:\s*"([A-Z][A-Z0-9_]{2,})"/g)) {
    const body = enclosingObject(src, m.index);
    if (body === null) { STATIC.unreadable++; continue; }
    if (!ROWS.has(m[1])) { STATIC.uncatalogued++; continue; }
    if (/\btranslation\s*:/.test(body)) STATIC.carried++;
    else { STATIC.bare++; STATIC.bareCodes.add(m[1]); }
  }
}
console.log(`    ${STATIC.carried} site(s) name a catalogued code and carry the row THEMSELVES`);
console.log(`    ${STATIC.bare} site(s) name a catalogued code and carry NO translation of their own `
          + `(${STATIC.bareCodes.size} distinct code(s)) — every one of them reaches a caller translated`);
console.log(`    ONLY because of the one attach in json(); this is the size of what eleven site edits`);
console.log(`    would have had to become, and it grows on its own every time a refusal is written.`);
console.log(`    ${STATIC.uncatalogued} site(s) name a code with NO catalogue row (REC-64's sweep) · `
          + `${STATIC.unreadable} site(s) this matcher could not read an object literal around`);
t("the static walk found real sites and did not go blind — the figures above are a MEASUREMENT and "
+ "not a reassurance, and this is the floor that tells the two apart",
  STATIC.carried + STATIC.bare + STATIC.uncatalogued >= 300, true);

/* ====================================================================== 2c
 * REC-185 — THE TWO BLIND SPOTS THIS FILE'S OWN "WHAT IT CANNOT SEE" PARAGRAPH
 * NAMES, MEASURED RATHER THAN DESCRIBED.
 *
 * That paragraph says this suite cannot see a refusal returned as a raw
 * `new Response(...)`, and it carries a figure — *"measured: 7 such returns,
 * none of them a refusal carrier"* — taken once, by hand, on a tree that is now
 * weeks old. A FIGURE IN PROSE IS A CLAIM ABOUT THE DAY IT WAS TAKEN; the eighth
 * such return can land tomorrow and this file would still say seven. So the two
 * blind spots are walked HERE, on every run, and the second one is GATED.
 *
 * (B) A REFUSAL BUILT WITHOUT `json()` — GATED, as an EMPTY SET and not a count.
 *     `json()` is the one place `dec49Attach` runs, so a refusal that leaves by
 *     any other door reaches a caller undecorated no matter how well it is
 *     catalogued. The corpus is FLOORED first, because a walk that found nothing
 *     would otherwise report an empty residue as good news.
 *
 * (A) A CODE ARRIVING AT ITS SITE ONLY THROUGH A SPREAD — REPORTED AND FLOORED,
 *     not gated on membership. These are the control plane forwarding somebody
 *     else's refusal (the store's, a helper's) rather than minting one: the code
 *     is a string literal at the SOURCE and there is no literal at the FORWARD,
 *     so the static walks — 2b above, and VF-2's guard, which both key on a
 *     literal `reason:`/`code:` — are blind to every one of them. They are not
 *     therefore undecorated: they leave through `json()`, so the WIRE sees them
 *     for any op the drive reaches. The residue is the ops it does not reach.
 *     WHAT THIS PIN CANNOT SEE, and it is the sentence that matters: it pins the
 *     DISTINCT SPREAD EXPRESSIONS, so a SECOND site forwarding an already-listed
 *     name (`...r` is the commonest) arrives invisibly. It fails on a new NAME,
 *     never on a new SITE — which is why the count is printed beside it.
 * ==================================================================== */
console.log("\n--- 2c. the two blind spots: refusals built without `json()`, and codes arriving by spread ---");
const INDEX_BARE = decomment(INDEX_SRC);
const lineOf = (src, at) => src.slice(0, at).split("\n").length;

/* (B) every `new Response(` construction in the control plane, classified. */
const RESP = [];
for (const m of INDEX_BARE.matchAll(/new Response\(/g)) {
  const tail = INDEX_BARE.slice(m.index, m.index + 320);
  /* `json()`'s OWN construction is the one that decorates; it is the door, not a
     way around it, and is named rather than filtered silently. */
  const isJsonItself = /dec49Attach/.test(tail);
  const carriesRefusal = /\bok\s*:\s*false\b/.test(tail) || /\berror\s*:/.test(tail);
  RESP.push({ line: lineOf(INDEX_BARE, m.index), isJsonItself, carriesRefusal,
              head: INDEX_SRC.split("\n")[lineOf(INDEX_BARE, m.index) - 1].trim().slice(0, 96) });
}
const RESP_OUT = RESP.filter((r) => !r.isJsonItself);
console.log(`    (B) ${RESP.length} \`new Response(\` construction(s) in index.mjs — ${RESP.length - RESP_OUT.length} `
          + `is json()'s own, ${RESP_OUT.length} leave by another door:`);
for (const r of RESP_OUT) console.log(`        L${r.line}  ${r.carriesRefusal ? "REFUSAL CARRIER" : "not a refusal"}  ${r.head}`);
t("the `new Response` walk found a real corpus and did not go blind — floored BEFORE the emptiness "
+ "below is read as good news, which is this project's three-times-measured failure",
  RESP_OUT.length >= 6, true);
t("NO refusal leaves the control plane by a door other than `json()` — pinned as a SET and not a "
+ "count, so it fails in BOTH directions: a refusal written as a raw Response fails this line and "
+ "must be looked at, and this file's prose figure can no longer go stale in silence",
  RESP_OUT.filter((r) => r.carriesRefusal).map((r) => `L${r.line} ${r.head}`), []);

/* (A) every `json({…})` whose object literal spreads a VALUE and carries no
   literal code of its own. Three-way, because a thing the matcher does not
   understand must be NAMED and never silently scored zero. */
const FWD = [], FWD_UNDET = [];
for (const m of INDEX_BARE.matchAll(/json\(\{/g)) {
  let i = m.index + 5, depth = 0, end = -1;
  for (; i < INDEX_BARE.length; i++) {
    const c = INDEX_BARE[i];
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) continue;
  const body = INDEX_BARE.slice(m.index + 5, end + 1);
  /* a spread of a VALUE. `...helper(…)` is a row minted at this site with a
     literal code inside it and is NOT a forward. */
  const names = [...body.matchAll(/\.\.\.\s*([A-Za-z_$][\w$.]*)(\s*\()?/g)].filter((x) => !x[2]).map((x) => x[1]);
  if (!names.length) continue;
  if (/\b(?:reason|code)\s*:\s*"/.test(body)) continue;     /* visible to the static walks already */
  const after = INDEX_BARE.slice(end + 1, end + 40);
  const st = /^\s*\}?\s*,\s*(\d{3})\s*\)/.exec(after) || /^\s*,\s*(\d{3})\s*\)/.exec(after);
  const statusVar = !st && /^\s*,\s*[A-Za-z_$]/.test(after);
  const site = { line: lineOf(INDEX_BARE, m.index), names: names.join(", "),
                 status: st ? Number(st[1]) : null,
                 head: INDEX_SRC.split("\n")[lineOf(INDEX_BARE, m.index) - 1].trim().slice(0, 96) };
  const saysRefused = /\bok\s*:\s*false\b/.test(body) || names.some((n) => /\.(error|refusal)$/.test(n));
  if (saysRefused || (site.status !== null && site.status >= 400)) FWD.push(site);
  else if (statusVar && !/\bok\s*:\s*true\b/.test(body)) FWD_UNDET.push(site);
}
console.log(`    (A) ${FWD.length} site(s) forward a refusal through a spread with NO literal code of their own:`);
for (const f of FWD) console.log(`        L${f.line}  ${f.status ?? "—"}  spreads ${f.names}  |  ${f.head}`);
console.log(`        AND ${FWD_UNDET.length} this matcher COULD NOT CLASSIFY (the status is a variable, so whether `
          + `the body is a refusal is not decidable here) — NAMED, never scored zero:`);
for (const f of FWD_UNDET) console.log(`        L${f.line}  status=<variable>  spreads ${f.names}  |  ${f.head}`);
t("the forward walk found a real corpus — floored, for the same reason the walk above is",
  FWD.length >= 10, true);
t("the DISTINCT SOURCES a refusal is forwarded from are pinned as a SET — a NEW kind of forward "
+ "must be looked at, and one that disappears must be struck with its reason. It does NOT see a "
+ "second site forwarding a name already on this list, which is why the count is printed beside it",
  [...new Set(FWD.map((f) => f.names))].sort(),
  /* CORRECTED 2026-09-24 by D-463, never exempted: `confinement.error` joins the set, and the arm working is
     WHY it is here. `op=aicredentialmint` now forwards a SECOND declaration refusal beside `declared.error` —
     `aiConfinementDeclaration`'s, the confinement judged before anything is written (C-29.10) — and it is the
     same KIND of forward as the one beside it: a `{ error: { reason, code, check, translation, detail } }`
     built by a named declaration judge and spread at the mint edge with the op and the class added. The old
     set was right for the tree it was written on. */
  /* CORRECTED by D-549, LOOKED AT as this assertion asks: `storeAbsent` is op=publishedbytes forwarding
     publishedStoreAbsent's answer, the ONE governed site of the published-store complaint (C-68.5), whose code,
     check and canned translation are minted inside its DEC-49 region and graded in publishedcase.test.mjs. */
  ["arm.refusal", "built", "c", "confinement.error", "declared.error", "facts", "r", "rec.result",
   "scoped.error", "storeAbsent", "zip"]);

/* ====================================================================== 3
 * THE TWELVE — HARVESTED FROM `store.mjs`, SO A THIRTEENTH CANNOT ARRIVE
 * UNMEASURED. (REC-73's harvest, for REC-73's reason.)
 * ==================================================================== */
const FENCES = [...new Set([...STORE_BARE.matchAll(/"(MACHINE_CANNOT_[A-Z_]+)"/g)].map((m) => m[1]))].sort();
console.log(`    the machine-fence family, harvested from store.mjs: ${FENCES.length} code(s)`);
/* THE FLOOR MOVED 12 -> 14 BY REC-185, 2026-09-24, FROM THIS LINE'S OWN PRINT ON ITS TREE — AND IT
   WAS FOUND BY A CONTROL COMING BACK GREEN, NOT BY READING IT. Arm (f) of this file's driver drops
   one code out of the harvest and is DECLARED RED. On 2026-09-24 it came back **GREEN, 33/0**. The
   arm was not broken: the family has grown from 12 codes to 14 since this floor was written, so a
   floor of 12 tolerated losing TWO — `CLAUDE.md` §"a floor with slack is not a ratchet", and the
   receipt it names is one sitting 19 codes low that had already flipped a control from RED to GREEN.
   This is the same failure, two codes deep, and the fifth item in a row to find a floor stale BY
   MEASURING IT. Moved to the printed 14, and arm (f) re-run to RED.
   WHAT THIS FLOOR STILL CANNOT DO, stated rather than implied: it is a NUMBER, so it goes stale
   again the day a fifteenth fence lands, and the honest fix is to derive it. REC-185 did NOT derive
   it, and the reason is a measurement rather than a shortage of time: `MACHINE_FENCE_CHECKS` holds
   **18** rows where this harvest finds **14** — three are `OPERATOR_TOKEN_*` and two
   (`MACHINE_CANNOT_RATIFY`, `MACHINE_CANNOT_RATIFY_CASE`) are catalogued fences that appear as NO
   string literal in `store.mjs` at all. So catalogue-size is not this corpus's size, the gap is
   somebody's finding rather than a derivation detail, and it is reported to SCHEDULER by name. */
t("the fence harvest found a REAL family and not an empty set — and the floor is a RATCHET rather "
+ "than a reassurance: it is this family's measured size today, so ONE code leaving the harvest "
+ "fails this line and must be struck with its reason",
  FENCES.length >= 14, true);
t("every harvested fence has a catalogue row with a canned translation — REC-64's work, and the "
+ "precondition for asking whether it reaches anybody",
  FENCES.filter((c) => !ROWS.has(c)), []);

/* ====================================================================== 3b
 * D-494 · THE HARVEST WIDENED TO BOTH SOURCES, AND THE CATALOGUE GRADED
 * AGAINST IT BY NAME.
 *
 * WHY THIS EXISTS, AND IT IS REC-185's OWN FINDING RATHER THAN A TIDY-UP.
 * Section 3's harvest reads `store.mjs` only, and only the `MACHINE_CANNOT_`
 * spelling, so it finds 14 where `MACHINE_FENCE_CHECKS` holds 18. REC-185
 * measured that gap, said plainly it had not derived the floor, and reported
 * the four unseen codes to SCHEDULER by name. **Four catalogued fences were
 * therefore governed by a catalogue nothing checked against the code**: the two
 * `MACHINE_CANNOT_RATIFY*` rows (REC-123/IC-132) and the three
 * `OPERATOR_TOKEN_CANNOT_*` rows (REC-125/IC-137, BOB #14's D-421) are all
 * minted in `index.mjs`, which section 3 does not read. A row whose fence had
 * been deleted would have read exactly the same as one whose fence is standing,
 * which is `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4 believed on the
 * strength of its EXISTENCE rather than its behaviour — the defect this file
 * was built to find, one level up, in this file.
 *
 * THE ANSWER IS A DERIVATION AND NOT A SECOND FLOOR. A number goes stale the
 * day a nineteenth fence lands; this grades the two corpora against each other
 * BY NAME, so a fence added, moved between sources, or deleted moves a NAME and
 * not a count. **A catalogued fence with NO site anywhere is a DEFECT and this
 * gate says so** — the row is either deleted or the fence is built; it is never
 * allow-listed, because an allow-list of missing fences is the catalogue lying
 * about the plane in the direction that costs nothing.
 *
 * WHAT THIS MATCHER CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - IT CAN SEE a fence code written as a STRING LITERAL anywhere in either
 *     source with comments blanked — at its refusal site, inside a
 *     `machineFenceRow("…")` call, or ASSIGNED TO A VARIABLE that the refusal
 *     then mints through. The last is why this walks literals rather than
 *     `reason:` sites: a variable mint is still a literal somewhere, and a
 *     harvest keyed to one syntax is the staleness this file exists to refuse.
 *   - IT CANNOT SEE a code ASSEMBLED from a template (`` `MACHINE_CANNOT_${x}` ``)
 *     — no static walk can name such a code. That is not left as prose: the
 *     template census below is PRINTED and GATED AT EMPTY, so the day one
 *     arrives it is a named failure here rather than a silent hole.
 *   - IT IS A SOURCE WALK, not a drive. That a fence is MINTED says nothing
 *     about whether the act reaches it; `test/machine-fences.test.mjs` grades
 *     the fence against the act, and section 4 below grades the wire.
 * ==================================================================== */
console.log("\n--- 3b. D-494 · the catalogue vs the WIDENED harvest (both sources, both spellings) ---");

const FENCE_LITERAL = /"((?:MACHINE|OPERATOR_TOKEN)_CANNOT_[A-Z_]+)"/g;
const SITES = new Map();                       /* code -> [{ file, line }] */
for (const [file, bare] of [["src/store.mjs", STORE_BARE], ["src/index.mjs", INDEX_BARE]]) {
  for (const m of bare.matchAll(FENCE_LITERAL)) {
    if (!SITES.has(m[1])) SITES.set(m[1], []);
    const at = SITES.get(m[1]), line = lineOf(bare, m.index);
    if (!at.some((s) => s.file === file && s.line === line)) at.push({ file, line });
  }
}

/* A code this walk cannot name. Gated at empty rather than described. */
const TEMPLATED = [];
for (const [file, bare] of [["src/store.mjs", STORE_BARE], ["src/index.mjs", INDEX_BARE]])
  for (const m of bare.matchAll(/`[^`\n]*(?:MACHINE|OPERATOR_TOKEN)_CANNOT_[A-Z_]*\$\{[^`\n]*`/g))
    TEMPLATED.push(`${file} L${lineOf(bare, m.index)}  ${m[0].slice(0, 80)}`);

const CAT = CHECK_CATALOGUE.MACHINE_FENCE_CHECKS;
const CAT_CODES = Object.keys(CAT).sort();
const whereFile = (w) => (/(src\/[A-Za-z.]+\.mjs)/.exec(String(w)) || [])[1] || null;
const familyOf = (c) => (ROWS.get(c) || {}).family || null;

console.log(`    MACHINE_FENCE_CHECKS holds ${CAT_CODES.length} row(s); the widened harvest finds `
          + `${SITES.size} code(s) minted across src/store.mjs + src/index.mjs`);
for (const code of [...SITES.keys()].sort()) {
  const at = SITES.get(code).map((s) => `${s.file}:${s.line}`).join(", ");
  console.log(`      ${(familyOf(code) === "MACHINE_FENCE_CHECKS" ? "   " : "  *")} ${code.padEnd(34)} `
            + `${(familyOf(code) || "NO ROW IN ANY _CHECKS FAMILY").padEnd(22)} ${at}`);
}
for (const code of CAT_CODES) if (!SITES.has(code))
  console.log(`      !!! ${code} — CATALOGUED AND MINTED NOWHERE (${CAT[code].check}, where says ${CAT[code].where})`);
console.log(`    templated/assembled codes this walk cannot name: ${TEMPLATED.length}`);
for (const l of TEMPLATED) console.log(`        ${l}`);

/* THE AGREEMENT, IN NAMES. Each of the three lists is a different way for the
   catalogue and the plane to disagree, and each is reported as NAMES so the
   failure says WHICH fence rather than how many.
     1. a catalogued fence minted nowhere — the DEFECT the row names;
     2. a catalogued fence whose `where` names a source it is NOT minted in —
        the row drifted from the code it governs (REC-123 moved two fences from
        `store.mjs` to `index.mjs`, which is exactly this shape);
     3. a minted fence outside `MACHINE_FENCE_CHECKS` — pinned as a SET with the
        family that DOES hold it, so a sixteenth `MACHINE_CANNOT_*` catalogued
        somewhere else is a name to look at and not a silent pass.
   A code in list 3 with NO family at all is a bare code on the wire, and it
   fails here reading `NO ROW IN ANY _CHECKS FAMILY`. */
const cataloguedMintedNowhere = CAT_CODES.filter((c) => !SITES.has(c));
const whereNamesTheWrongSource = CAT_CODES.filter((c) => SITES.has(c))
  .filter((c) => whereFile(CAT[c].where) && !SITES.get(c).some((s) => s.file === whereFile(CAT[c].where)))
  .map((c) => `${c} — where says ${whereFile(CAT[c].where)}, minted in `
             + `${[...new Set(SITES.get(c).map((s) => s.file))].sort().join(" + ")}`);
const mintedOutsideTheFenceFamily = [...SITES.keys()].filter((c) => !CAT_CODES.includes(c)).sort()
  .map((c) => `${c} -> ${familyOf(c) || "NO ROW IN ANY _CHECKS FAMILY"}`);

t("D-494 · the CATALOGUE and the WIDENED HARVEST agree, BY NAME and not by count: every one of "
+ "MACHINE_FENCE_CHECKS' rows is minted in the source its `where` names, and the only fence-shaped "
+ "code minted outside that family is MACHINE_CANNOT_MOVE_VERSION, which VERSION_ACT_CHECKS holds "
+ "on purpose (C-25.24, REC-46's one predicate at the six version acts' one transition). A row "
+ "minted nowhere is a DEFECT — delete the row or build the fence; it is never allow-listed here",
  { cataloguedMintedNowhere, whereNamesTheWrongSource, mintedOutsideTheFenceFamily },
  { cataloguedMintedNowhere: [], whereNamesTheWrongSource: [],
    mintedOutsideTheFenceFamily: ["MACHINE_CANNOT_MOVE_VERSION -> VERSION_ACT_CHECKS"] });

t("D-494 · no fence code is ASSEMBLED from a template — the one spelling no static harvest can "
+ "name, gated at empty rather than described, because a hole stated in prose is a hole nobody "
+ "is watching",
  TEMPLATED, []);

/* ====================================================================== 4
 * THE DRIVE.
 * ==================================================================== */
let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d262", MEMBER_TOKEN: "mem-d262", PROBE_TOKEN: "prb-d262",
              DAEMON_TOKEN: "dmn-d262", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-d262",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              /* The DO's own drain alarm would race the sweep below and change
                 what an op answers mid-walk. task-fence.test.mjs pins it for the
                 same reason. */
              TASK_DRAIN_DELAY_MS: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response(new Uint8Array(2048), { headers: { "content-type": "application/pdf" } }); },
});
MF = mf;

/* THE RAW BODY, NOT THE UNWRAPPED RESULT. Every other suite in this directory
   unwraps `result` before looking, and unwrapping is exactly what hides this
   item's defect: the question here is what the WIRE carried. */
const RAW = async (q, body) => {
  const res = body === undefined
    ? await mf.dispatchFetch(`http://x/api/?${q}`)
    : await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body) });
  let parsed = null;
  try { parsed = await res.json(); } catch { parsed = null; }
  return { status: res.status, body: parsed };
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP((await RAW(q, body ?? {})).body);

try {

console.log("\n--- 3. the drive: every admitted op, empty payload, as a MEMBER and as a MACHINE ---");

const enrol = async (memberId, role, capabilities) => {
  const add = await POST(`op=memberadd&token=adm-d262`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are
   no ordinary members until TWO exist. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
await enrol("gus", "admin", ["contribute", "publish"]);

/* THE MACHINE. Its declared scope is HARVESTED — every mutating op a member
   reaches — so the credential layer is held OPEN and what answers these calls is
   the identity fence rather than the gate in front of it (PL-11's block 8
   reasoning, REC-73's restatement). Member-scoped so its viewer stamp is
   `member:ruth` and it sees what she sees. */
const minted = await POST(`op=aicredentialmint&token=${RUTH}`, {
  tokenId: "d262-wire-grader", principalKind: "member", principalMember: "ruth",
  taskScope: "D-262's own: grade the refusal a caller RECEIVES against the catalogue",
  writes: MUTATING_MEMBER_OPS,
  note: "D-262. A member authored this scope so the credential gate is open and the identity fences "
      + "below are what refuse — the same instrument REC-73 used, pointed at the envelope." });
if (!minted?.ok) throw new Error(`mint: ${JSON.stringify(minted).slice(0, 600)}`);
const AI = minted.token;
t("the machine credential's declared scope was HARVESTED from the OPS table and accepted whole — "
+ "so nothing below is refused by the gate in front of the fence",
  [minted.ok, Array.isArray(minted.credential?.writes) ? minted.credential.writes.length : null],
  [true, MUTATING_MEMBER_OPS.length]);

/* --------------------------------------------------------------- the sweep */
/* Every refusal observed, keyed by code, with the FIRST full envelope seen for
   it and the op that produced it. `seen` is deliberately a Map and not a count:
   a violation must be nameable, and a count cannot be argued with. */
const OBSERVED = new Map();      /* code -> { code, check, translation, op, who, envelope } */
const NO_CODE = [];              /* ok:false with no string code at all */
const NOT_CLASSIFIED = [];       /* a body this walk does not understand */
let calls = 0, refusals = 0;

const record = (op, who, wire) => {
  if (!wire || typeof wire !== "object") { NOT_CLASSIFIED.push({ op, who, why: "no JSON body" }); return; }
  /* TWO PLACES A REFUSAL LIVES ON THIS WIRE and no more: the control plane's
     own, at the top level, and the store's, under the DO envelope's `result`.
     Anything else is named rather than counted as clean. */
  const candidates = [];
  if (wire.ok === false) candidates.push(wire);
  if (wire.result && typeof wire.result === "object" && !Array.isArray(wire.result)
      && wire.result.ok === false) candidates.push(wire.result);
  if (candidates.length === 0) {
    if (wire.ok !== true && !(wire.result && typeof wire.result === "object"))
      NOT_CLASSIFIED.push({ op, who, why: `body says neither ok:true nor ok:false (keys: ${Object.keys(wire).slice(0, 6).join(",")})` });
    return;
  }
  for (const r of candidates) {
    refusals++;
    const code = typeof r.reason === "string" ? r.reason
               : typeof r.code === "string" ? r.code : null;
    if (!code) {
      NO_CODE.push({ op, who, keys: Object.keys(r).slice(0, 8),
                     /* the words the caller actually got, so the residue is a
                        finding somebody can act on rather than a tally */
                     said: typeof r.error === "string" ? r.error.slice(0, 90) : null });
      continue;
    }
    if (!OBSERVED.has(code))
      OBSERVED.set(code, { code, check: r.check, translation: r.translation, op, who });
  }
};

for (const who of ["member", "machine"]) {
  const token = who === "member" ? RUTH : AI;
  for (const row of MEMBER_OPS) {
    /* A machine credential may only be handed a mutating op it declared; the
       non-mutating ones it reaches by the floor. Both are driven. */
    const wire = row.mutating
      ? (await RAW(`op=${row.op}&token=${token}`, {})).body
      : (await RAW(`op=${row.op}&token=${token}`)).body;
    calls++;
    record(row.op, who, wire);
  }
}
console.log(`    DRIVEN: ${calls} call(s) over ${MEMBER_OPS.length} op(s) × 2 credentials · `
          + `${refusals} refusal envelope(s) · ${OBSERVED.size} distinct code(s) received`);
t("the drive actually reached the plane and refusals actually came back — floored before any "
+ "claim is made over what came back", [calls >= 200, OBSERVED.size >= 40], [true, true]);

/* ====================================================================== 5
 * THE GRADE — THE GATE.
 * ==================================================================== */
console.log("\n--- 4. the grade: every catalogued code RECEIVED must carry its row on the wire ---");

const BARE = [];        /* catalogued, but the wire carried no translation */
const NO_CHECK = [];    /* catalogued, but the wire carried no C-number */
const DIVERGENT = [];   /* the wire carried a translation the catalogue does not hold */
const CENSUS = [];      /* received with NO catalogue row — REC-64's sweep, reported not gated */
for (const got of [...OBSERVED.values()].sort((a, b) => a.code.localeCompare(b.code))) {
  const row = ROWS.get(got.code);
  if (!row) { CENSUS.push(got.code); continue; }
  if (typeof got.translation !== "string" || got.translation === "") BARE.push(got.code);
  else if (got.translation !== row.translation) DIVERGENT.push(got.code);
  if (got.check !== row.check) NO_CHECK.push(got.code);
}
const graded = OBSERVED.size - CENSUS.length;
console.log(`    GRADED: ${graded} received code(s) have a catalogue row · ${CENSUS.length} do not (census below)`);

t("EVERY catalogued refusal a caller RECEIVED carried its canned translation on the wire — this is "
+ "the assertion nothing in this repository made before D-262, and it is the one the eleven fences "
+ "failed for as long as they have existed", BARE, []);
t("...and its C-NUMBER, equal to the catalogue's — a member who cannot name the check cannot look "
+ "it up, and a wrong number is worse than none", NO_CHECK, []);
t("...and the sentence is the CATALOGUE'S, not a second copy that has drifted from it. DEC-8 says "
+ "a surface may render what it RECEIVED; that protection is worth nothing if what it received was "
+ "invented upstream", DIVERGENT, []);
t("something was actually graded — an empty graded set would satisfy all three assertions above by "
+ "accident, which is the only way they could read as good news while meaning nothing",
  graded >= 30, true);

/* ====================================================================== 6
 * THE TWELVE, PINNED BY NAME.
 * ==================================================================== */
console.log("\n--- 5. the twelve machine fences, each pinned on the WIRE ---");
const fenceWire = FENCES.map((c) => {
  const got = OBSERVED.get(c);
  return { code: c, reached: !!got, translated: !!got && got.translation === (ROWS.get(c)?.translation ?? null) };
});
const unreached = fenceWire.filter((f) => !f.reached).map((f) => f.code);
const untranslated = fenceWire.filter((f) => f.reached && !f.translated).map((f) => f.code);
for (const f of fenceWire)
  console.log(`      ${f.reached ? (f.translated ? "wire+row" : "WIRE BARE") : "not reached"}  ${f.code}`
            + (f.reached ? `  (via op=${OBSERVED.get(f.code).op}, as ${OBSERVED.get(f.code).who})` : ""));
t("every machine fence this sweep REACHED carries its canned translation to the caller", untranslated, []);
/* NOT an emptiness claim: the set of fences an empty payload cannot reach is
   NAMED, so a fence that stops being reachable is a change to this line rather
   than a silent shrink of the corpus.

   ELEVEN OF THE TWELVE ARE REACHED BY AN EMPTY PAYLOAD, AND THAT WAS NOT WHAT
   THIS ITEM PREDICTED — it expected two or three to sit behind acts an empty
   call cannot address. It is the same fact D-229 measured from the other side:
   these fences sit ABOVE the payload complaints, so the thinnest possible call
   reaches them. **`MACHINE_CANNOT_MOVE_VERSION` is the single exception, and it
   is the one fence that was never broken** — it is reached through the six
   version acts, whose dispatch needs `target=` and `version=` before the fence,
   so an empty call is refused by the subject complaint first. The fence with the
   helper is the fence an empty payload cannot see; recorded because it is a
   coincidence worth not mistaking for a cause. */
t("the fences this empty-payload sweep does not reach are NAMED rather than counted, so the corpus "
+ "cannot quietly shrink — REC-73 drives all twelve under complete payloads and is the instrument "
+ "for reachability; this one is the instrument for the envelope",
  /* MOVED 2026-09-24 by REC-189, never exempted: C-32.19 MACHINE_CANNOT_SET_RISK_TIER stands INSIDE
     `promote`'s action block and refuses a CHANGE of an action's tier, so an empty promote — no bundle.md,
     no action — is refused by the payload complaints long before it. Reachability is REC-73's instrument
     (`machine-fences.test.mjs` block xiv drives it under a complete payload); `fence-e2e` and
     `aicredential` carry its wire.
     MOVED BACK 2026-09-24 by REC-214, never exempted: C-32.19 now also stands FIRST in `op=actionrisktier`, the
     member's revision act, above every payload complaint (through the one helper `promote` asks too) — so this
     sweep's empty call reaches it through that op, with its translation, and it leaves the unreached set. The
     REC-189 note above was true of `promote`, and still is. */
  unreached, ["MACHINE_CANNOT_MOVE_VERSION"]);

/* ====================================================================== 7
 * TWO PRODUCERS, ONE CODE — AND THE `detail` IS WHAT TELLS THEM APART.
 * ==================================================================== */
console.log("\n--- 6. `AI_BEYOND_TASK_SCOPE` has TWO producers and the code does not say which fired ---");
/* VF-5 pinned this pair by `detail` because the code cannot distinguish them.
   A decoration that attached the catalogue row could have flattened the two into
   one indistinguishable answer; it does not, and this is what says so. */
const beyondReach = (await RAW(`op=capturerequestdrain&token=${AI}`, {})).body;
const beyondScope = (await RAW(`op=memberadd&token=${AI}`, {})).body;
const detailOf = (b) => (b && typeof b.detail === "string") ? b.detail : null;
t("producer 1 — an op NO MEMBER reaches is refused AI_BEYOND_TASK_SCOPE",
  [beyondReach?.reason ?? beyondReach?.code, beyondReach?.ok], ["AI_BEYOND_TASK_SCOPE", false]);
t("producer 2 — an op the credential DID NOT DECLARE is refused with the SAME code",
  [beyondScope?.reason ?? beyondScope?.code, beyondScope?.ok], ["AI_BEYOND_TASK_SCOPE", false]);
t("both carry the catalogue's one sentence for that code — one code, one canned translation",
  [beyondReach?.translation === (ROWS.get("AI_BEYOND_TASK_SCOPE")?.translation ?? null),
   beyondScope?.translation === (ROWS.get("AI_BEYOND_TASK_SCOPE")?.translation ?? null)], [true, true]);
t("AND THE TWO REMAIN DISTINGUISHABLE BY `detail`, which is the only thing that tells a reader "
+ "which producer fired — the canned translation is the same sentence for both BY DESIGN, so if "
+ "`detail` ever collapsed too, the answer would name a condition without naming its cause",
  [detailOf(beyondReach) !== null, detailOf(beyondScope) !== null,
   detailOf(beyondReach) !== detailOf(beyondScope)], [true, true, true]);

/* ====================================================================== 7b
 * REC-185 — `op=purge`, THE PLANE'S ONE DESTRUCTIVE OP, DRIVEN OUTSIDE THE
 * MEMBER CLASS.
 *
 * WHY BY HAND. The sweep above filters to MEMBER-class ops, and `purge` is
 * `["admin", "probe"]` — the class-filter blindness section 8's pin already
 * names in its own words. So the one op that destroys a record answered a bare
 * `error` string, outside every wire instrument, for as long as it has existed:
 * a refusal with no code is one a member cannot be told in WORDS at all
 * (CLAUDE.md §2), which is one layer further out than a code with no sentence.
 *
 * DRIVING THE DESTRUCTIVE OP HERE IS SAFE, AND THE ASSERTION IS WHAT SAYS SO
 * RATHER THAN THE COMMENT: it is called with NO `confirm`, which is the arm's
 * whole subject, and the refusal is taken before anything is read or written.
 * `ok:false` is pinned first, so a run in which the purge SUCCEEDED could not
 * come back green.
 * ==================================================================== */
console.log("\n--- 6b. op=purge without `confirm`: the coded refusal, through the op (REC-185) ---");
{
  const wire = (await RAW(`op=purge&token=adm-d262`, {})).body;
  const row = ROWS.get("REQUIRED_ARGUMENT_MISSING") ?? { check: null, translation: null };
  t("op=purge with no `confirm` is REFUSED, and refused with C-61.1's code — minted through the one "
  + "governed `requiredArgument` helper, so the row's `where` still names a single span",
    [wire?.ok, wire?.reason ?? wire?.code], [false, "REQUIRED_ARGUMENT_MISSING"]);
  t("and it carries the CATALOGUE'S canned translation and C-number, compared by EQUALITY against "
  + "the row rather than for presence — a surface rendering a sentence the catalogue does not hold "
  + "is DEC-8's defect wearing DEC-49's clothes",
    [wire?.check, wire?.translation], [row.check, row.translation]);
  t("the ARGUMENT and the SHAPE are named beside it, which is what lets one code serve every op's "
  + "argument complaint without the catalogue growing a row per call site",
    [wire?.op, wire?.argument, wire?.shape], ["purge", "confirm", "<store name>"]);
  t("`error` is BYTE-IDENTICAL to the pre-REC-185 answer (D-270's pattern), so no consumer reading "
  + "it moves — `purge.test.mjs` reads exactly this string and is the proof the sentence is load-bearing",
    wire?.error, "purge requires confirm=<store>");
  t("and the caller is told NOTHING WAS CHANGED — on the one op that can destroy a record, a caller "
  + "who cannot tell a refused request from a half-applied one has to go and look",
    typeof wire?.detail === "string" && /Nothing was changed\./.test(wire.detail), true);
  t("the refusal still names the store it wanted and the class that asked, so the fields the old "
  + "bare-string answer carried are ADDED TO and not replaced",
    [wire?.expected === wire?.store, wire?.got, typeof wire?.tokenClass], [true, null, "string"]);
}

/* ====================================================================== 6c
 * D-495 — THE CLASS-FILTER BLINDNESS, CLOSED. THE SAME `record()` DRIVEN OVER
 * THE ADMIN AND PROBE CREDENTIALS, NOT ONLY THE MEMBER-CLASS ONES.
 *
 * WHY. Section 9's residue pin below carries this blindness in its own words —
 * *"it filters to member-CLASS ops, so `forbidden for token class` on a read
 * outside that class is invisible to it"* — and 6b is the receipt that the gap
 * was real rather than theoretical: `op=purge`, the plane's ONE destructive op,
 * is `["admin", "probe"]`, so it answered a bare sentence outside every wire
 * instrument until REC-185 drove it BY HAND. A hand-driven op is a list of
 * spellings, and this file's own doctrine is to invert rather than lengthen one.
 * So the drive is widened to the classes instead, and `purge` stops being a
 * special case and becomes one row of a corpus.
 *
 * THE CLASSES SWEPT, STATED RATHER THAN IMPLIED — four credentials over the
 * three classes that hold an op table row:
 *   · MEMBER — Ruth's signed-in session           (section 3, 183 rows)
 *   · ai     — the minted machine credential      (section 3, the same 183)
 *   · ADMIN  — the ADMIN_TOKEN-class bearer        (here, 196 rows)
 *   · PROBE  — the PROBE_TOKEN-class bearer        (here, 178 rows)
 * Their UNION is every op row that names any class, and that is ASSERTED below
 * against the parse rather than trusted to the arithmetic: 196 of 196.
 *
 * THE LIAR THIS BLOCK REFUSES TO BE, and it is the reason the reach count is
 * pinned per class rather than the drive merely being run. A sweep whose
 * credential is rejected ABOVE the op — unauthenticated, forbidden for its
 * class, refused a namespace — drives nothing at all and reports a clean,
 * confident, entirely empty result. It would look exactly like this block
 * passing. So every call's refusal code is checked against the ADMISSION set
 * (`NOT_AUTHENTICATED`, `CLASS_FORBIDDEN`, `SCOPE_REFUSED`,
 * `ROOT_OF_TRUST_REQUIRED`, `NOT_CAPABLE`, `NAMESPACE_UNKNOWN` — every refusal
 * `index.mjs` can return before dispatch), and the count that REACHED the op
 * body is pinned at the full corpus for each class.
 *
 * WHAT THIS DRIVE CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - It sweeps the 196 rows naming a class. The 17 naming NONE are outside it
 *     and are NAMED below, not counted as clean: they are the pre-authentication
 *     and public surface, whose codeless argument complaints were D-278's and are
 *     graded in `d278-codeless-refusals.test.mjs`.
 *   - PROBE is confined by `scopeFor` to the `scratch` namespace while admin and
 *     member answer out of `bio`, so the probe arm reads a DIFFERENT and empty
 *     store. That is the class behaving correctly, not the arm going blind, and
 *     the reach count is what tells the two apart.
 *   - The payload is still EMPTY, so a refusal a richer call would provoke is
 *     invisible here, exactly as it is in section 3.
 * ==================================================================== */
console.log("\n--- 6c. the class drive (D-495): ADMIN and PROBE, through the same `record()` ---");

/* Every refusal `index.mjs` can answer BEFORE it dispatches to the op. A call
   refused with one of these did not reach the op body, whatever else it says. */
const ADMISSION = new Set(["NOT_AUTHENTICATED", "CLASS_FORBIDDEN", "SCOPE_REFUSED",
                           "ROOT_OF_TRUST_REQUIRED", "NOT_CAPABLE", "NAMESPACE_UNKNOWN"]);
const CLASS_NO_CODE = [];    /* D-495's own residue, kept apart from section 3's */
const CLASS_OBSERVED = new Map();   /* `${who}\u0000${code}` -> the first envelope seen */
const REACH = {};

/* `record()`'s twin, and it is a twin ON PURPOSE rather than a second opinion:
   the same two candidate sites, the same `reason`-then-`code` precedence, the
   same "named, never silently scored zero". It differs in exactly two ways, and
   both are this item's subject: it keys its observations by CLASS as well as by
   code, so a code coded for one caller and bare for another is two findings and
   not one; and it RETURNS the code, which is what lets the reach count above be
   taken from the same read rather than from a second call. */
const recordAs = (op, who, wire) => {
  if (!wire || typeof wire !== "object") { NOT_CLASSIFIED.push({ op, who, why: "no JSON body" }); return null; }
  const candidates = [];
  if (wire.ok === false) candidates.push(wire);
  if (wire.result && typeof wire.result === "object" && !Array.isArray(wire.result)
      && wire.result.ok === false) candidates.push(wire.result);
  if (candidates.length === 0) {
    if (wire.ok !== true && !(wire.result && typeof wire.result === "object"))
      NOT_CLASSIFIED.push({ op, who, why: `body says neither ok:true nor ok:false (keys: ${Object.keys(wire).slice(0, 6).join(",")})` });
    return null;
  }
  let first = null;
  for (const r of candidates) {
    const code = typeof r.reason === "string" ? r.reason
               : typeof r.code === "string" ? r.code : null;
    if (first === null) first = code;
    if (!code) {
      CLASS_NO_CODE.push({ op, who, keys: Object.keys(r).slice(0, 8),
                           said: typeof r.error === "string" ? r.error.slice(0, 90) : null });
      continue;
    }
    const k = `${who}\u0000${code}`;
    if (!CLASS_OBSERVED.has(k)) CLASS_OBSERVED.set(k, { code, who, op, check: r.check, translation: r.translation });
  }
  return first;
};

for (const [who, token, rows] of [["admin", "adm-d262", ADMIN_OPS], ["probe", "prb-d262", PROBE_OPS]]) {
  let driven = 0, reached = 0;
  const gated = [];
  for (const row of rows) {
    const wire = row.mutating
      ? (await RAW(`op=${row.op}&token=${token}`, {})).body
      : (await RAW(`op=${row.op}&token=${token}`)).body;
    driven++;
    const code = recordAs(row.op, who, wire);
    if (code && ADMISSION.has(code)) gated.push(`${row.op}:${code}`); else reached++;
  }
  REACH[who] = { driven, reached, gated };
  console.log(`    DRIVEN as ${who}: ${driven} op(s) · ${reached} reached the op body · `
            + `${gated.length} refused at the admission gate${gated.length ? ` (${gated.join(", ")})` : ""}`);
}

t("the ADMIN arm drove every op row admitting the admin class, and every one of them REACHED THE OP "
+ "BODY — a credential refused above the op drives nothing and reports a confident empty result, so "
+ "this is the line that tells this block apart from a liar",
  [REACH.admin.driven, REACH.admin.reached], [ADMIN_OPS.length, ADMIN_OPS.length]);
t("...and the PROBE arm likewise, out of the `scratch` namespace `scopeFor` confines it to",
  [REACH.probe.driven, REACH.probe.reached], [PROBE_OPS.length, PROBE_OPS.length]);
t("the three classes together reach EVERY op row that names a class — asserted against the parse and "
+ "not inferred from the three counts, because three subsets summing right is not the same fact as "
+ "their union being whole",
  CLASSED_OPS.filter((r) => !MEMBER_OPS.includes(r) && !ADMIN_OPS.includes(r) && !PROBE_OPS.includes(r))
             .map((r) => r.op), []);
console.log(`    OUTSIDE THIS DRIVE: ${CLASSLESS_OPS.length} op row(s) name no class at all and are NOT`);
console.log(`    swept here — the pre-authentication and public surface, D-278's subject, graded in`);
console.log(`    d278-codeless-refusals.test.mjs: ${CLASSLESS_OPS.join(", ")}`);

/* ---- the grade, for the two new classes ---- */
const CBARE = [], CNOCHECK = [], CDIVERGENT = [], CCENSUS = [];
for (const got of [...CLASS_OBSERVED.values()].sort((a, b) => (a.who + a.code).localeCompare(b.who + b.code))) {
  const row = ROWS.get(got.code);
  if (!row) { CCENSUS.push(`${got.code} (${got.who}, via op=${got.op})`); continue; }
  if (typeof got.translation !== "string" || got.translation === "") CBARE.push(`${got.code} (${got.who}, op=${got.op})`);
  else if (got.translation !== row.translation) CDIVERGENT.push(`${got.code} (${got.who}, op=${got.op})`);
  if (got.check !== row.check) CNOCHECK.push(`${got.code} (${got.who}, op=${got.op})`);
}
const cGraded = CLASS_OBSERVED.size - CCENSUS.length;
console.log(`    GRADED (admin+probe): ${cGraded} received code(s) carry a catalogue row · ${CCENSUS.length} do not`);
t("every catalogued refusal the ADMIN or PROBE caller received carries the catalogue's own sentence "
+ "and C-number on the wire — D-262's gate, applied to the two classes it was never driven over",
  [CBARE, CNOCHECK, CDIVERGENT], [[], [], []]);
t("and something was actually graded for these two classes — an empty graded set satisfies the line "
+ "above by accident, which is the only way it could read as good news while meaning nothing",
  cGraded >= 20, true);

/* ---- THE RESIDUE OVER ALL THREE CLASSES, PINNED AS THE EXACT NAMED SET ---- */
const ALL_NO_CODE = [...NO_CODE.map((n) => ({ ...n })), ...CLASS_NO_CODE];
const RESIDUE = [...new Set(ALL_NO_CODE.map((n) => `${n.op} (${n.who})`))].sort();
console.log(`    REFUSALS CARRYING NO CODE AT ALL, over member + ai + admin + probe: ${ALL_NO_CODE.length}`);
for (const n of ALL_NO_CODE) console.log(`      no-code  op=${n.op} (${n.who})  keys: ${n.keys.join(",")}`
                                       + `  said: ${n.said === null ? "— (no `error` string either)" : `"${n.said}"`}`);
/* PINNED AS A SET AND NOT A COUNT, for the reason section 9 gives below: it then
   fails in BOTH directions — a NEW codeless refusal anywhere in the four-credential
   drive fails this line and must be looked at, and one of these being given a code
   fails it too and must be STRUCK WITH ITS REASON. An allow-list widened silently
   is the failure this shape exists to make impossible.
 *
 * WHAT WAS IN IT, AND WHAT STRUCK IT — the pin working exactly as the paragraph
 * above says it must. D-495 found one op here, under both classes that reach it:
 * `op=livefire`, and it was NOT A REFUSAL, which was the finding rather than a
 * false positive to filter away. `livefire` is the plane's own canary battery,
 * and its `ok` WAS a VERDICT over its 19 assertions (`src/livefire.mjs`:
 * `ok: A.every((a) => a.ok) && r2.ok`), dispatched at `index.mjs` as
 * `json(out, out.ok ? 200 : 500)`. So it answered `ok:false` with no `reason`,
 * no `code` and no `error` sentence of any kind — one layer further out than
 * D-270's bare-sentence residue, which at least carried words — and every
 * consumer that reads `ok:false` as a refusal (this instrument, and the agent
 * worker, which deliberately holds no catalogue and passes a plane refusal
 * through UNCHANGED) received something it could neither translate nor name.
 *
 * STRUCK 2026-09-24 BY D-506 (IC-265), WITH ITS REASON, and it is the SECOND of
 * the two directions this line was written to fail in: not a new codeless refusal,
 * but this one being FIXED. BOB #32 ruled the interface question D-495 raised and
 * deliberately did not settle — D-270's boundary, a code on the verdict versus
 * reserving `ok:false` for refusals — at 06:07Z: **`ok` says the op ANSWERED, and
 * the canary's result moves to `verdict` with `failing` naming the assertions.**
 * So `op=livefire` no longer answers `ok:false` at all in this drive; it is not a
 * refusal candidate here, and the residue is EMPTY.
 *
 * AN EMPTY PIN IS NOT A VACUOUS ONE, and this file is the place that has to say
 * so. `[]` still fails the moment any op in the four-credential drive answers
 * `ok:false` with no code, and the drive it is taken over is floored by the
 * `cGraded >= 20` line above, which exists precisely so an empty result cannot be
 * read as good news while meaning nothing.
 *
 * THE FIXTURE IS UNCHANGED AND THE CANARY STILL GOES RED HERE, which is worth
 * stating so nobody later "repairs" it: the harness's own 8-character `adm-d262`
 * still fails the assertion *"no configured token is shorter than 16 characters"*,
 * 18 of 19 pass, and the op now answers `ok:true`, `verdict:"fail"` and that
 * assertion's name in `failing`. What left this set is the SILENCE, not the
 * finding. `installer.test.mjs` pins that shape on its own published-token
 * fixture; this line only records that the codeless answer is gone. */
t("the ops answering a caller with NO code at all, over ALL FOUR credentials and all three classes "
+ "(D-495) — pinned as the exact named set, so a new codeless refusal fails here and a fixed one "
+ "fails here too and must be struck with its reason",
  RESIDUE, []);

/* ====================================================================== 8
 * THE OVER-STRICTNESS ARM, BUILT IN. A correct refusal in a shape this file did
 * not anticipate must be graded CLEAN.
 * ==================================================================== */
console.log("\n--- 7. over-strictness: correct work in an unanticipated spelling must NOT be reported bare ---");
{
  const row = ROWS.get("MACHINE_CANNOT_RELEASE") ?? { check: null, translation: null };
  /* Four things this suite's grader was not written around, all at once: the
     code spelled in `code` and NOT in `reason`; the row built at the site rather
     than attached by the decoration; the `detail` worded unlike anything REC-64
     wrote; and extra keys the grader has never seen. It must pass. */
  const exotic = { ok: false, code: "MACHINE_CANNOT_RELEASE", check: row.check,
                   translation: row.translation,
                   detail: "Nope — not from a robot, thanks.", weight: "refuse", sigil: 7 };
  const before = { bare: BARE.length, divergent: DIVERGENT.length };
  const probe = new Map();
  const saved = OBSERVED.get("MACHINE_CANNOT_RELEASE");
  OBSERVED.delete("MACHINE_CANNOT_RELEASE");
  /* The label is NOT spelled `op=<something>`: `test/op-claims.test.mjs` reads
     every `op=` mention in this repository and fails on one the dispatch table
     does not hold, which is exactly right — a fixture inventing an op name is
     how a planning document comes to reference a verb nobody built. Caught by
     that suite on this file's first battery run. */
  record("(over-strictness fixture, not an op)", "member", { ok: true, result: exotic });
  const got = OBSERVED.get("MACHINE_CANNOT_RELEASE");
  probe.set("graded", got && ROWS.has(got.code) && got.translation === (ROWS.get(got.code)?.translation ?? null)
                       && got.check === (ROWS.get(got.code)?.check ?? null));
  if (saved) OBSERVED.set("MACHINE_CANNOT_RELEASE", saved); else OBSERVED.delete("MACHINE_CANNOT_RELEASE");
  t("a refusal that DOES carry its row, spelled in `code` rather than `reason`, built at its own "
  + "site, worded unlike anything in the catalogue and carrying keys this grader has never seen, "
  + "is graded CLEAN — a grader that reported correct work as bare would teach the next author to "
  + "route around it", [probe.get("graded"), before.bare, before.divergent], [true, 0, 0]);
}

/* ====================================================================== 9
 * THE CENSUS AND THE RESIDUE — REPORTED, NAMED, NOT GATED.
 * ==================================================================== */
console.log("\n--- 8. the census: what came back with NO catalogue row (REC-64's remaining sweep) ---");
console.log(`    ${CENSUS.length} received code(s) have no DEC-49 row and are therefore not gradable here.`);
console.log(`    THIS IS THE BOUNDARY between D-262 and REC-64, drawn by the instrument: REC-64 owns codes`);
console.log(`    with NO translation; D-262 owns translations that exist and do not reach the caller. A row`);
console.log(`    REC-64 writes moves a code from this list into the GRADED set with no edit to this file.`);
for (const c of CENSUS) console.log(`      census  ${c}  (via op=${OBSERVED.get(c).op})`);
console.log(`    REFUSALS CARRYING NO CODE AT ALL: ${NO_CODE.length}`);
for (const n of NO_CODE) console.log(`      no-code  op=${n.op} (${n.who}) keys: ${n.keys.join(",")}`
                                   + (n.said ? `  said: "${n.said}"` : ""));
/* THE RESIDUE, PINNED AS A SET AND NOT A COUNT — D-270's subject, RAISED by this
   item and deliberately NOT fixed here.
   These refusals carry no code of any kind, so DEC-49 cannot reach them at all:
   they are not "a code with no translation" (REC-64's sweep) but "a refusal with
   no code", one layer further out. TWO KINDS, both QUOTED in the lines printed
   above rather than described, because the words are the finding: (1) the
   SESSION GATE — `{ok:false, error:"this operation requires a machine
   credential, not a signed-in session", op}` — which is what a signed-in member
   meets on every unattended verb; and (2) three ops refusing a missing argument
   with a bare `error` string (`"capture requires sha256=<64 lowercase hex>"` and
   its two siblings).
   A SET rather than a count, so it fails in BOTH directions: a new codeless
   refusal fails this line and must be looked at, and one of these being given a
   code fails it too and must be struck WITH its reason. That is what stops a
   known gap from becoming a permanent one. */
t("the ops answering a caller with NO code at all are NAMED — D-270, raised by this item and not "
+ "fixed by it, because giving the session gate a code is an interface decision and not a translation",
  [...new Set(NO_CODE.map((n) => n.op))].sort(),
  /* STRUCK AT INTEGRATION 2026-08-09 by CONDUCT, WITH THE REASON, exactly as the
     comment above requires: `provenancechain`, `provenanceroute` and `taskdrain`
     were the SESSION-GATE three, and REC-64's remaining sweep gave that gate a code
     in its admission-gate family (C-38) — so they answer a code now and this line
     failed in the GOOD direction. That is the pin working as designed: it was
     written to fail when one of the six was fixed, not only when a seventh arrived.
     THREE REMAIN, and they are the other kind D-270 names: ops refusing a MISSING
     ARGUMENT with a bare `error` string. Giving those a code is still an interface
     decision rather than a translation, so D-270 stays open on a smaller corpus.

     STRUCK AGAIN 2026-09-19 BY D-270 ITSELF, TO EMPTY, WITH THE REASON — and the
     set is KEPT rather than deleted, which is the whole point of pinning a SET.
     `capture`, `pdfstructure` and `monitor` now answer `REQUIRED_ARGUMENT_MISSING`
     (C-61.1) beside a BYTE-IDENTICAL `error`, minted in one governed helper
     `requiredArgument` so the row's `where` names one span rather than three.
     **AN EMPTY SET IS STILL AN ASSERTION AND STILL FAILS IN BOTH DIRECTIONS:** a
     new codeless refusal anywhere in this drive fails this line and must be looked
     at. That is exactly what it was written to do, and D-270 is the second time it
     has fired in the GOOD direction — which is the argument for pinning a set over
     counting, made twice by the same line.
     WHAT THIS DRIVE STILL CANNOT SEE, so an empty set is not read as a clean plane:
     it filters to member-CLASS ops, so `forbidden for token class` on a read outside
     that class is invisible to it, and the PRE-AUTHENTICATION sha256 complaints
     (`op=verify`, `op=publishedbytes`) are outside it too. CORRECTED 2026-09-23 BY
     D-278: this read *"Both are D-278's"*. The pre-authentication complaints are
     coded now (C-61.1) and graded in `d278-codeless-refusals.test.mjs`; the
     class-filter blindness is CORRECTED 2026-09-24 BY D-495, and this pin is KEPT
     rather than rewritten: it is the member+`ai` drive's residue, it is still
     empty, and that is still worth asserting. The BLINDNESS it named is gone —
     section 6c drives the same `record()` logic over the ADMIN and PROBE
     credentials, 196 of 196 op rows that name a class, and pins the residue over
     all four credentials. What remains outside EVERY drive is the 17 rows naming
     no class, and 6c prints them by name. */
  []);
console.log(`    BODIES THIS WALK COULD NOT CLASSIFY: ${NOT_CLASSIFIED.length}`);
for (const n of NOT_CLASSIFIED.slice(0, 20)) console.log(`      unclassified  op=${n.op} (${n.who}) — ${n.why}`);
/* The census is REPORTED and NOT GATED, deliberately: gating it would fail this
   suite on REC-64's unfinished work, and a gate set above the current state gets
   switched off. What IS gated is that the census is not the whole answer — a
   walk in which EVERYTHING is uncatalogued has almost certainly gone blind. */
t("the census is not the whole corpus — a run in which nothing at all resolved to a row would be a "
+ "blind walk reporting zero violations, and this is what tells the two apart",
  CENSUS.length < OBSERVED.size, true);

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
