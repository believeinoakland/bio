#!/usr/bin/env node
/* check-refusal-codes.mjs — THE DEC-49 GUARD (VF-2).
 *
 * DEC-49 (Bob, 2026-08-06): *"I have no problem with those messages being
 * translated, whether at development time or at runtime. These conditions
 * should include an error code that there's a canned translation for."* That
 * ruling AMENDS DEC-8 — a surface may now render an AUTHORED translation keyed
 * on a code the plane SENT, and may still never COMPUTE a refusal.
 *
 * THE RULING IS ONLY SAFE BECAUSE OF THE GUARD, and the ruling says so:
 * **every code a surface can receive has a translation, and an untranslated
 * code FAILS THE HARNESS rather than reaching a member.** Without it, (b)
 * degrades into thirteen surfaces each inventing wording — the drift REC-43
 * closed on the co-attestation fence. This file is that guard. It is an
 * INSTRUMENT, so it lands BEFORE the ops that must pass it (VF-2 is W0);
 * REC-64 is the sweep that gives every remaining condition a code, and it is
 * this guard that will tell REC-64 when it is finished.
 *
 * ---------------------------------------------------------------- THE REACH
 *
 * "Every code A SURFACE CAN RECEIVE" is the ruling's own scope, and it is
 * SMALLER than "every refusal code in the plane". So the reach is a
 * MEASUREMENT, printed every run, ratcheted with a FLOOR as well as a ceiling,
 * and DRIVEN from files rather than typed here — a hand-written set agrees with
 * its author at zero cost, which this project has measured five times.
 *
 * A code is IN REACH when any of these is true:
 *
 *   (R1) it is a row in a DEC-49 family (`*_CHECKS` in `bio-checks.mjs`).
 *        Definitionally receivable: the refusal is built FROM the row and
 *        carries `code` on the wire.
 *   (R2) the SURFACE names it — a code literal in `civicos-ui/app.html` that
 *        the plane also mints. If app.html can key on it, a member can meet it.
 *   (R3) a HARNESS MOCK sends it — a code literal in `civicos-ui/test/*.test.mjs`
 *        that the plane also mints. A code the harness hands the surface is a
 *        code the surface receives.
 *
 * Every code in reach must resolve to a canned translation, from ONE of:
 *   (T1) a DEC-49 family row's `translation` (the plane's, one place); or
 *   (T2) a surface translation table this guard proves TOTAL against its
 *        plane-side producer (arm D) — `PART_REASON` is the one that exists.
 *
 * A code in reach with neither is the DEC-49 failure and this guard exits 1
 * naming it. THAT IS THE WHOLE POINT: the harness fails instead of the member
 * meeting machine vocabulary.
 *
 * THE FLOOR IS THE MORE IMPORTANT HALF, and REC-70 is why it is stated twice.
 * Neutering a walk there left it green at 0 of 40 — so a ceiling could only ever
 * have failed from a reader that GAINED sight, never one that LOST it. Every
 * count below therefore carries a FLOOR, and the corpus size is PRINTED on
 * every run so a walk that has gone blind is visible rather than merely green.
 *
 * THE CENSUS IS REPORTED AND NOT GATED, and the distinction is deliberate.
 * The plane mints far more refusal codes than any surface can receive; the
 * whole-plane figure is REC-64's remaining sweep, not this guard's gate.
 * Gating it would fail on internal refusals no member can ever meet, and a gate
 * set above the current state gets switched off (VERIFICATION.md's own reason
 * for not making `--strict` the gate before its three items land). So the
 * census is printed with its exact gap and the gate stands on the reach.
 *
 * ------------------------------------------------------- ONE-VOCABULARY TRAP
 *
 * This guard is a VOCABULARY MATCHER, which is exactly what went wrong in
 * REC-70 the day before it was written: a walk graded 55 of 156 dispatched ops
 * and READ AS A COMPLETE SWEEP, because its classifier admitted ONE spelling of
 * success — four lines after that same file's other matchers were written as
 * SETS precisely because the plane spells things several ways.
 *
 * So the code walk is a SET of matchers and **each matcher's own yield is
 * printed every run**, not just the union. It is not a hypothetical: the first
 * draft of this walk used `reason: "CODE"` alone and was blind to
 *
 *     r = { ok: false, status: 0, reason: platform ? "PLATFORM_LIMIT" : "FETCH_FAILED", … }
 *
 * in `subresources.mjs` — two codes `PART_REASON` translates, invisible to the
 * narrow matcher. Both are in the union now, and M2 is the matcher that sees
 * them. If a matcher's yield ever collapses, the printed per-matcher line is
 * where that shows.
 *
 * ------------------------------------------------------------- WHAT IT IS NOT
 *
 *   - It does not decide WORDING. DEC-49 licensed translation; whether a given
 *     sentence is good prose is not mechanically checkable and this guard makes
 *     no attempt. It checks that a translation EXISTS, is not a restatement of
 *     the machine code, and is not a copy of another code's translation.
 *   - It does not gate the whole plane's 294-code census (above).
 *   - Arm C is textual over a function body, and it grades an OUTCOME by its
 *     verdict rather than by one spelling (REC-76 — see "WHAT MAKES SOMETHING A
 *     REFUSAL" at the arm). A refusal built by a helper this guard cannot see, or
 *     built into a variable and returned later, would not be judged; arm A's row
 *     completeness and arm B's reach are what cover the ground arm C cannot, and
 *     what the walk CANNOT classify is printed by name on every run rather than
 *     silently scored zero.
 *   - It says nothing about a LIVE plane. A green harness is not a serving
 *     build (D-108).
 *
 * Run from civicos-ui/ (test/run.mjs runs it):
 *
 *     node check-refusal-codes.mjs
 *
 * NEGATIVE CONTROL: recorded in test/refusal-codes.test.mjs's own
 * `NEGATIVE CONTROL:` header, with every arm RUN and what it broke.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLANE = path.join(HERE, "..", "bio-plane");
/* D-257 / M0-16 — THE TWO WALKS BELOW READ THE WORKING TREE AND THIS FILE'S
   `FLOOR` TABLE IS MOVED BY HAND TO FIGURES A GREEN RUN PRINTED. That pairing is
   exactly D-238's payload: `refs/stash` is repository-wide across all sixty
   worktrees and `git stash push -u` carries untracked files, so a phantom
   `src/*.mjs` or a phantom suite raises the census or the reach, somebody moves
   the floor to the figure the run printed, and the floor is then PERMANENTLY TOO
   HIGH — it fails every honest run afterwards until the gate gets switched off.
   The census and the reach are still computed over the whole working tree (a
   code minted in uncommitted work is still a code, and the GAP ceiling must
   still see it — that direction fails safe); the FLOORS are computed over
   `git ls-tree HEAD` alone, which is the figure another checkout reproduces and
   the only one this table may be moved to. */
import { readGitProvenance, repoPath, reportProvenance } from "../bio-plane/scripts/provenance.mjs";
const PLANE_SRC = path.join(PLANE, "src");
const CATALOG = path.join(PLANE, "checks", "bio-checks.mjs");
const APP = path.join(HERE, "app.html");
const TESTDIR = path.join(HERE, "test");
const REPO = path.join(HERE, "..");
const PROV = readGitProvenance(REPO);
/* True for everything when git cannot answer — which is UNVERIFIED, printed as
   UNVERIFIED by `reportProvenance`, and never reported as clean (D-233). */
const inCommit = abs => PROV.inHead === null || PROV.inHead.has(repoPath(REPO, abs));
/* SAY UNVERIFIED, NEVER CLEAN (provenance.mjs rule 4), and it binds this file's
   own NOTEs as well as the report: a line reading "in the commit at HEAD
   (unverified)" claims the commit in the same breath as admitting it could not
   look, which is D-233. Found by D-257's control ARM 3. */
const HEAD_SAYS = PROV.inHead === null
  ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree walk"
  : `in the commit at HEAD (${PROV.headSha})`;

const fails = [];
const notes = [];
const FAIL = m => fails.push(m);
const NOTE = m => notes.push(m);

/* ============================================================
   THE RATCHET — measured 2026-08-07 in worktree agent-a12a5d578497244e9,
   by this file. Every one is a FLOOR: the guard fails when its reach
   SHRINKS, which is the half a ceiling alone cannot see (REC-70).
   A figure that GROWS is fine and the delta is named in the output; the
   grown rows still have to pass every arm, so growth cannot arrive
   unguarded.
   ============================================================ */
/* REMEASURED 2026-08-08 (REC-71), AND THE STALENESS WAS A MEASURED DEFECT
   RATHER THAN AN UNTIDY NUMBER. PL-1 landed a fourth family and 18 rows, so the
   census grew 311 -> 330 and the reach 98 -> 116 while these floors stayed where
   VF-2 set them. **That left 19 codes of SLACK, and slack in a floor is not
   harmless: it is the floor not being a ratchet.** Arm (e) of
   `test/refusal-codes.control.mjs` — neuter the widest matcher, M2 — went from
   RED to GREEN on it: the walk lost an entire spelling, the census fell to 325,
   and 325 is still above 311, so the guard passed a reader that had gone
   partially blind. That is REC-70's own lesson arriving on the FLOOR side, and
   it is why every figure below is now the MEASURED one. Move them WITH the
   corpus, in the same turn, or they stop meaning anything. */
const FLOOR = {
  /* THE PER-ITEM REMEASUREMENT NOTES WERE CONSOLIDATED HERE 2026-08-08 by
     CONDUCT, at PL-14's integration, and the consolidation is itself a finding.
     Seven items in a row had each prepended its own dated block, and two
     keep-both merges had left continuation comments attached to keys they were
     never written about — `codesChecked` carrying PL-3's sentence about
     `vocabularyTerms`, and `regionLines` carrying a fragment of a line that had
     been split by a conflict marker. **A comment block that has become
     unreadable has stopped carrying its findings**, which is the same failure
     as a stale number, one layer out. Nothing measured is dropped: every
     item's finding is below, in one line each, with its worktree.

     WHAT THE SEVEN NOTES ALL SAID, and it is the reason this block exists:
     **EVERY FIGURE HERE IS ONE THIS FILE PRINTED ON A GREEN RUN — never one an
     item added to the previous figure.** VF-2 set them; PL-1 grew the plane
     without moving them, leaving 19 codes of slack, and arm (e) of
     `test/refusal-codes.control.mjs` went from RED to GREEN on that slack: the
     walk lost an entire spelling, the census fell to 325, and 325 still cleared
     a floor of 311. **A floor with slack is not a ratchet.** The slack came
     back within hours of being cleared (census 330 -> 341), which is why the
     rule is `move them in the turn that grows the plane`.

     AND FIVE ITEMS RUNNING FOUND A FLOOR ALREADY STALE BY MEASURING IT:
     - PL-3   (agent-acad3e0b337d0848f): `families` read 5 over a tree of 6 —
              VERSION_CHAIN_CHECKS landed with PL-10 and nobody moved it.
     - PL-4   (agent-ad191a5dd58a9327f): the guard failed BEFORE any floor moved,
              naming (a) a region marker that had drifted out of the function its
              `where` named and (b) a `where` pointing at `src/index.mjs acquire`,
              a name that does not exist — so nothing had been checking that site.
     - PL-11  (agent-a6feaaff20bdaf423): `vocabularyTerms` read 40 over a tree of
              50, and PL-11 added no vocabulary at all. Ten of pre-existing slack.
     - SK-1   (agent-a1f06561dfc61e51c): the same ten, measured independently from
              a tree without PL-11 — and added ONE row to the existing
              `AI_RUN_CHECKS` rather than minting a family, because a family is a
              floor here and a new one buys slack for everybody else's walk.
     PL-18 (agent-a4e2eff5ca09197e2), 2026-08-09 — DEC-63's project-membership
     gate. EIGHT figures moved, every one from what this file PRINTED on a green
     run of that worktree: `rows` 163->164, `census` 424->425, `reach` 217->218,
     `governedSites` 66->67, `codesChecked` 141->142, `outcomeReturns` 70->74,
     `refusalsJudged` 143->145, `vocabularyTerms` 56->59. **`regions` AND
     `regionLines` ARE DELIBERATELY UNCHANGED AND WERE RE-READ RATHER THAN
     ASSUMED — 53 and 1407, exactly the figures already in this file, no slack.**
     PL-18's first draft DID add three `DEC-49 REGION` marker pairs in
     `store.mjs` and this guard FAILED BY NAME for it: they were relays around a
     refusal minted in `airun.mjs`, so no row's `where` claimed them, and *a
     defence that is documented and not wired is worse than a missing one.* The
     markers were removed rather than given rows — one refusal, one governed
     site. **The guard also failed the same item for reading its gate's two
     PERMITTING returns as CODELESS REFUSALS**, because the verdict field was
     named `applied` (whether the gate had anything to check) rather than
     `permitted` (whether it said yes). It was right on both counts and the
     source moved, not the floor.
     - PL-14  (agent-a78ca0f9b029b7dfa): added ZERO unfalsifiable sites, the number
              REC-71 delegated to REC-64. Its first draft gave the pair guard a
              WHOLE-FUNCTION `where` and this guard reported 6 refusals judged and
              5 COMPARED — the sixth being the local helper's own variable-coded
              return. Narrowed to a REGION before any floor moved.


     PL-15 (agent-aa5e6711b4eb2c064), 2026-08-08: every figure below RE-MEASURED
     from what THIS FILE PRINTED on a green run of the tree carrying PL-15, and
     nothing was arrived at by adding to the number in the file. PL-15 found NO
     pre-existing slack — every floor sat exactly at the measured value, which
     is the first time in eight items that has been true, and it is what a
     ratchet moved in the same turn looks like from the next item's seat. What
     moved is what PL-15 grew: one new family (QUEUE_MINT_CHECKS), five new rows
     (C-31.1..3 at the queue mint, C-28.14/15 added to PL-4's door family rather
     than minting a second family for two rows — SK-1's rule that a family is a
     floor), one new region (is-queue-mint), and one new vocabulary term (the
     `out-of-inquiry-lead` slug in QUEUE_FINDING_KINDS). `reachGap` FELL by one
     because C-31.1 gives `NO_CLASS` — a code that has sat inside REC-64's named
     gap since VF-2 — its first canned translation.

     THE TWO INTEGRATION COLLISIONS, both created by parallel slots and neither
     visible to any worker: **PL-11 and SK-1 each remeasured this whole block
     from its own tree**, so both were right where they stood and both were wrong
     on the merged tree, every floor sitting exactly one low; and **PL-11 and
     PL-14 each allocated a nine-row C-29 family**, PL-14's renumbered to C-30 at
     integration (the note is at the catalogue, where the next allocator reads).
     **The figures below are the ones the guard PRINTED on a green run of the
     tree carrying all three** — neither worker's numbers, because on a merged
     tree neither worker's numbers are true.

     REC-64 (agent-a0fc522fabe53b533), 2026-08-08 — THE SWEEP ITSELF, and it
     moves more of this block than any item before it. Every figure below is one
     THIS FILE PRINTED on a green run of this worktree, read off the run and
     never added to the number that was here. REC-64 found NO pre-existing slack:
     every floor sat exactly at the measured value, which is now the second item
     running for which that is true — the ratchet moved in the same turn is
     holding. What moved is what REC-64 grew: two new families
     (MACHINE_FENCE_CHECKS, ACT_SHAPE_CHECKS), 40 rows, 30 new REGIONS, and one
     new code at the run-open door (UI-38's §14a rider). The CEILING fell 73 ->
     42, which is the item's whole point and the first time it has moved by more
     than one.

     REC-63 (agent-ac23d92b0d07c1ab5), 2026-08-08 — DEC-56's enactment, the
     standing route marker. Every figure below RE-MEASURED from what this file
     PRINTED on a green run of this worktree, never by adding to the number that
     was here. **REC-63 FOUND NO PRE-EXISTING SLACK: every floor sat exactly at
     the value REC-64 left**, which is the third item running for which that has
     been true and is what "move the ratchet in the turn that grows the plane"
     looks like from the next item's seat. What moved is what REC-63 grew: one
     new family (ROUTE_MARK_CHECKS), four rows (C-34.1..4), one new REGION
     (is-route-mark, 26 lines, judging 4 refusals and COMPARING all four), and
     four codes into the census and the reach. **`reachGap` DOES NOT MOVE and is
     deliberately left at 42**: all four new codes arrive translated, so this
     item neither closes nor widens REC-64's named gap, and a ceiling nudged for
     bookkeeping reasons stops being a measurement of that gap.

     REC-76 (agent-a7c06631e829a208f), 2026-08-08 — D-236, THE ARM C CLASSIFIER
     INVERTED. Every figure below is one THIS FILE PRINTED on a green run of this
     worktree, read off the run and never added to the number that was here.
     **REC-76 FOUND NO PRE-EXISTING SLACK: every floor sat exactly at the value
     REC-63 left**, which is the fourth item running for which that has been true.
     What moved is what REC-76 grew: three rows into the existing ACT_SHAPE_CHECKS
     (C-33.30/31/32 — no new family, on SK-1's rule), one new REGION
     (is-selection-moved, 21 lines, judging 1 refusal and COMPARING 2 codes), and
     three codes into the census and the reach.

     **AND ONE FIGURE MOVED FOR A REASON THAT IS NOT GROWTH, WHICH IS WHY IT IS
     WRITTEN HERE RATHER THAN LEFT TO BE INFERRED.** `codesChecked` read 119 under
     the old matcher and 118 under the new one on the SAME tree, before a single
     row was added. The difference is a DE-DUPLICATION, not a loss of sight:
     `captureRequestArm > is-capture-request-arm` returns a refusal NESTED inside
     an envelope (`{ ok:false, silent:false, refusal:{ ok:false, reason:…, code:… }}`),
     the old walk found TWO `ok: false` in it and graded the same object twice —
     `2 judged, 4 code(s) checked` over ONE return. It now reads `1 judged, 2
     code(s) checked`, which is what is there. **A figure that falls because the
     instrument stopped counting one thing twice is not slack, and a figure that
     falls for any other reason is** — so the distinction is measured and named
     rather than left for the next reader to re-derive. The floor below is above
     the old figure regardless, because the three new rows put it at 122.

     `outcomeReturns`, `refusalsJudged` and `unclassifiedOutcomes` are NEW here
     and are explained at their own keys. */
  /*
     **MOVED BY CPDF-10, 2026-08-08, EVERY KEY BELOW FROM THE FIGURE THIS FILE
     PRINTED ON A GREEN RUN IN THIS WORKTREE, never by adding to the number that
     was here.** The arrival is ONE new DEC-49 family, `TEXT_CHAIN_CHECKS`
     (C-35.1..11 — the transcription provenance chain's refusals), with FIVE new
     narrowed REGIONS: `checkChain > is-text-chain-shape` (5 judged, 5 compared),
     `appendStep > is-text-chain-monotone` (1/1), `checkConfidence >
     is-text-region-confidence` (3/3), `checkAnchor > is-text-anchor` (4/4),
     `checkAttestation > is-text-attestation` (6/6). Every region COMPARES every
     code it judges, which is the property this file's arm C exists to check and
     the reason none of these lands as a whole-function `where`.
     THE ORIGINAL CPDF-10 DELEGATION SAID THESE WOULD BE LEFT FOR UI TO MOVE,
     AND THAT WAS WRONG — stated here rather than quietly changed. The rule is to
     move a floor you invalidate IN THE SAME TURN, from what the instrument
     printed; the item could print the figures the moment its own run went green,
     so leaving them would have shipped a harness whose floors sat 11 rows and 5
     regions below the truth, which is exactly the slack this file's own header
     argues a ratchet cannot carry.
     `bodyLines` is DELIBERATELY NOT MOVED — it is this block's one non-ratcheted
     figure by its own stated reason, and it FELL from 61 to 60 sites' worth of
     body because five more `where`s are narrowed regions rather than whole
     functions, which is the direction that file wants. `census` moves because
     the new module mints codes; `unclassifiedOutcomes` is UNCHANGED at 3, and
     none of the new sites is among them.
   */
  /* ================================================================== *
   * TEN FLOORS MOVED IN ONE TURN, 2026-08-09, at REC-69's REPLAY onto `main`,
   * EVERY ONE FROM THE FIGURE THIS GUARD PRINTED ON A GREEN RUN OF THE MERGED
   * TREE — and the reason they were ALL stale is the finding, not the arithmetic.
   *
   * **THE 2026-08-08 MERGE SILENTLY DROPPED THIS ENTIRE FILE.** REC-69's branch
   * (`2d9c57b`) changed `civicos-ui/check-refusal-codes.mjs` by 70 lines, moving
   * every floor below in the same turn as the family that invalidated them —
   * measured here by `git diff 722c37b 2d9c57b --stat`. The merge commit
   * `e241672` carried ELEVEN files and NOT this one (`git diff 7e5f9b0 e241672
   * --stat`), so the floor moves never landed, and the `git revert -m 1` that
   * backed the merge out could not remove what was never there. **The replay
   * therefore restores the code WITHOUT the floors, and nothing failed** —
   * because a dropped floor move does not go red, it goes SLACK. That is the
   * dangerous direction: `--strict` exit 0, battery green, UI harness green, and
   * ten ratchets quietly carrying between 1 and 18 of headroom. The only reason
   * this was caught is that the figures were re-read from the printed run rather
   * than trusted. **A hand-resolved merge can drop a whole file and every
   * instrument in this repository will report success.**
   * ================================================================== */
  /* MOVED AT INTEGRATION 2026-08-09 by CONDUCT to the figures the guard PRINTED on the
     MERGED tree carrying REC-69, PL-18 and PL-19. Each of those measured its own branch
     and NONE of their numbers is true here — the whole reason this block is re-read at
     integration rather than trusted from a report. */
  families: 16,    // + AI_RUNS_CONTEXT_CHECKS (REC-69, C-36 — the context-keyed run list).
                       // + ROUTE_MARK_CHECKS (REC-63);
                       // + MACHINE_FENCE_CHECKS + ACT_SHAPE_CHECKS (REC-64); + QUEUE_MINT_CHECKS (PL-15);
                       // + AI_CREDENTIAL_CHECKS (PL-11) + VERSION_STRENGTH_CHECKS (PL-14).
                       // Was 15 at REC-63, 11 at PL-15, 8 at PL-4, 7 at PL-3, 6 pre-PL-3 while the floor said 5.
                       /* C-22's own header states the tax this line charges: *"a new `*_CHECKS`
                          family is a floor in `civicos-ui/check-refusal-codes.mjs` that buys slack
                          for everybody else's walk unless it is moved in the same turn"*. It is
                          moved in the same turn — for the SECOND time, the first having been
                          dropped by the merge. */
  rows: 167,    // + C-36.1..3 (REC-69, all three DRIVEN through the op).
                       // + C-33.30/31/32 (REC-76 — aiRunOpen's two codeless refusals and SET_MOVED).
                       // + C-34.1..4 (REC-63, the route marker door). + C-32.1..11 (REC-64, the machine fences) + C-33.1..28 (REC-64, the single-homed
                       // tail) + C-22.8 (REC-64, §14a's capability sentence) + C-31.1..3 and C-28.14/15
                       // (PL-15) + C-29.1..9 (PL-11, all nine DRIVEN) + C-30.1..9 (PL-14).
                       // Was 163 at REC-76, 105 at PL-15, 81 at PL-4, 70 at PL-3.
  census: 428,    // distinct refusal codes the plane can mint, UNION of the matcher set.
                       // A plain `reason: "CODE"` grep answers fewer; the set finds the rest.
                       // (was 424 pre-REC-69, 410 pre-REC-76, 406 pre-REC-63, 405, 402, 393, 383 at PL-4, 371 at PL-3, 341 at PL-12, 330, 311 pre-PL-1)
                       // REC-69: +3 (C-36.1..3), MOVED FROM THE PRINTED FIGURE and set EQUAL to it,
                       // for the reason the paragraph below gives in a number: SIX of slack blinds the
                       // widest matcher in this file completely, so three is already half of that —
                       // which is exactly how much the dropped merge left sitting here.
                       /* REC-64 MEASURED HOW MUCH SLACK IT TAKES TO TURN THIS CONTROL GREEN, and the
                          answer is SIX. Arm 3 of `bio-plane/test/nc-rec64.mjs` neuters M2 — the widest
                          matcher, the one that earned the matcher set — and the union falls 406 -> 401.
                          **M2's EXCLUSIVE contribution is five codes**, because the matchers overlap
                          heavily by design. So a floor carrying six codes of slack would let the widest
                          walk in this file go completely blind and still report GREEN. PL-1 left
                          NINETEEN. That is the quantity behind "a floor with slack is not a ratchet",
                          and it is recorded here as a number rather than a principle so the next item
                          can see how little margin it takes to disarm the control. */
  reach: 221,    // codes a surface can receive (R1 + R2 + R3) (was 217 pre-REC-69, 204 pre-REC-76, 200 pre-REC-63, 191, 187, 178, 168, 157, 127, 116, 98)
                       // REC-69: +3, and they arrive TRANSLATED — the reachGap CEILING below does not
                       // move, which is the property a new family owes rather than the number itself.
                       // (Confirmed on this tree: 41 of 220, ceiling 41, sitting exactly at it.)
  governedSites: 68,   // spans named by a row's `where` — a function, or a region inside one.
                       // (was 60 pre-REC-76, 59 pre-REC-63, 28, 27, 25, 20, 17, 13, 9, 5)
  surfaceTables: 1,    // PART_REASON
  bodyLines: 60,    // total lines of governed span arm C actually reads. MEASURED far above this,
                       // and DELIBERATELY NOT RATCHETED TO IT — the one figure here that is not.
                       // Every other floor only ever moves UP as the plane grows, so ratcheting
                       // them costs nothing. This one FALLS whenever a `where` is correctly
                       // narrowed from a function to a region, which is exactly the work REC-71
                       // licensed and REC-64 will keep doing. A gate set above the current state
                       // gets switched off (VERIFICATION.md's own reason for not making `--strict`
                       // the gate yet), so this stays a COLLAPSE DETECTOR — its stated purpose, a
                       // parameter list read as a body — and `codesChecked` carries the ratchet.
  regions: 54,    // + REC-69's `is-airuns-context` (ONE region, three codes, every one COMPARED —
                       // its `refusal` helper sits ABOVE the marker so every call inside the span
                       // names its code as a STRING LITERAL, which is what makes arm C bite here).
                       // + REC-76's ONE (is-selection-moved, judging 1 and comparing 2 — the region
                       // that could not be written until arm C could see a computed verdict).
                       // + REC-63's ONE (is-route-mark, judging 4 and comparing 4). + REC-64's THIRTY: eleven machine fences (is-machine-*) and nineteen act-shape
                       // spans (is-conclude-answer, is-move-resolution, is-correspond-entry,
                       // is-correspond-artifact, is-release-account, is-release-entry,
                       // is-dispose-inquiries, is-publish-statement, is-cite-note, is-cite-role,
                       // is-cite-severed, is-selection-known, is-promote-cas, is-basis-acyclic,
                       // is-promote-files, is-alias-named, is-progression-order, is-mute-class,
                       // is-owner-floor). Every one COMPARES every code it judges.
                       // + PL-15's one (is-queue-mint); + PL-14's two (is-version-strength,
                       // is-pair-composed). Was 15 at PL-14, 13 with
                       // PL-11's four (is-ai-credential-mint, is-ai-credential-revoke,
                       // is-ai-task-scope, is-ai-scope-declaration), each COMPARING every code
                       // it judges (3/3, 2/2, 3/3, 2/2); 9 at PL-4, 6 at PL-3, 3 before.
  regionLines: 1454,   /* MOVED 1407 -> 1425 BY REC-69'S REPLAY, 2026-08-09, RE-READ FROM A GREEN RUN
                          OF THE MERGED TREE and not taken from REC-69's branch — which is the whole
                          instruction the two prior entries below leave, honoured here rather than
                          quoted. The 18 are `is-airuns-context`'s own span and nothing else: the
                          three malformed-question refusals, and REC-69 opened no line inside any of
                          the other 53 spans. **AND THE STANDING NOTE EARNED ITSELF AGAIN — this
                          figure has now moved at integration five times out of six.** REC-69's own
                          branch computed 1281 against a base of 1263; `main` reached 1407 without it
                          while it sat reverted, so neither number was ever true of this tree.
   /* MOVED 1407 -> 1436 BY PL-19, 2026-08-09 (DEC-65 shape (b)), from what this
                          file PRINTED on a green run of this worktree — never by adding 29 to the
                          number that was here. THE 29 ARE ALL MINE AND THE ATTRIBUTION IS EXACT
                          RATHER THAN ASSUMED: `suggestVersion > is-suggest-checks` grew from 314L to
                          343L, and 1436 minus this item's 29 added lines inside that span is 1407 —
                          the figure that was already here, so the floor was NOT stale on arrival and
                          the whole gap is this item's. Measured from the diff hunks, then checked
                          against the printed total. The lines are the single-part licence: the guard
                          moved from `legsIn.length > 0` to *a machine may compose one part and no
                          more*, plus the comment recording why, plus the correction of a wrong
                          C-number (C-25.15 -> C-25.6) this block had been citing at a member.
                          **NOTE FOR THE INTEGRATOR, and it is this figure's standing property: A
                          REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE and this number has
                          moved at integration four times out of five.** An open RECORD claim
                          (`airun.mjs` / `STANDARD_BASIS`) names THIS FLOOR BLOCK as its own path and
                          was running beside PL-19, and other workers were in `store.mjs`. RE-READ
                          this from a green run of the merged tree rather than trusting this number,
                          and if you meet a conflict here KEEP BOTH COMMENTS AND ONE KEY.
                          PRIOR ENTRY, kept as the receipt for how this figure moves:
                          MOVED 1289 -> 1310 BY REC-76, 2026-08-08, from what this file PRINTED on a
                          green run of that worktree. The 21 are `is-selection-moved`'s own span and
                          nothing else — REC-76 opened no line inside another item's region. **NOTE FOR
                          THE INTEGRATOR: THIS FIGURE HAS MOVED AT INTEGRATION FOUR TIMES OUT OF FIVE
                          AND A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE.** Several
                          workers were running against `store.mjs` beside REC-76. If any of them landed
                          a line inside one of the 48 spans, RE-READ this from a green run of the merged
                          tree rather than trusting this number.
                          PRIOR ENTRY, kept as the receipt for how this figure moves:
                          MOVED 1263 -> 1289 BY REC-63, 2026-08-08, from what this file PRINTED on a
                          green run of that worktree. The 26 are `is-route-mark`'s own span and
                          nothing else — REC-63 opened no line inside another item's region. **NOTE
                          FOR THE INTEGRATOR, because this figure has moved at integration three
                          times out of four and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED
                          SOURCE:** several workers were running against `store.mjs` beside REC-63.
                          If any of them landed a line inside one of the 47 spans, RE-READ this from
                          a green run of the merged tree rather than trusting this number.
                          PRIOR ENTRY, kept as the receipt for how this figure moves:
                          MOVED 1220 -> 1263 AT INTEGRATION 2026-08-08 by CONDUCT — AND REC-64
                          ASKED FOR EXACTLY THIS CHECK, WHICH IS WHY IT IS A ONE-LINE MOVE.
                          Its note (kept below) says: `re-read this from a green run of the
                          merged tree rather than trusting this number`. Read, and it was 43
                          low: REC-75 landed inside `is-suggest-shape` and `is-suggest-write`
                          in the same integration, and A REGION'S LINE COUNT IS A PROPERTY OF
                          THE MERGED SOURCE. Neither worker could see the other's lines; both
                          figures were true of the branch that measured them. **A worker that
                          names the check its successor must run has done the part it could
                          do** — this is the third time this figure has moved at integration
                          (919 -> 953 -> 996/1220 -> 1263) and the first time the worker
                          predicted it. REC-64: 953 -> 1220, thirty new regions. NOTE FOR THE INTEGRATOR, because the
                          note below is a receipt that this exact figure is the one only an integrator
                          can set: REC-64 opened no line inside another item's region, but three other
                          workers were running against `store.mjs` and A REGION'S LINE COUNT IS A
                          PROPERTY OF THE MERGED SOURCE. If any of them landed a line inside one of the
                          46 spans, re-read this from a green run of the merged tree rather than from
                          this number. */
                       /* MOVED 919 -> 953 AT INTEGRATION 2026-08-08 by CONDUCT, and it is the block's
                          PRINTED on a green run of this tree — and MEASURED against HEAD's own copy of
                          `store.mjs` first, which printed exactly 953, so the 43 is this item's and the
                          previous figure carried no slack. REC-75's fix lands inside TWO governed
                          regions of `suggestVersion` — `is-suggest-shape` (the name comparison now made
                          over the name AS WRITTEN) and `is-suggest-write` (the rows composed from the
                          one normaliser) — and both carry the reasoning at the site, which is where
                          most of the 43 lines are. The floor is set EQUAL to the measured figure for
                          the reason the note below gives: slack in a floor is the floor not being a
                          ratchet.
                          PRIOR ENTRY, kept because it is the receipt for how this figure moves:
                          MOVED 919 -> 953 AT INTEGRATION 2026-08-08 by CONDUCT, and it is the block's
                          own subject arriving from a direction no worker could have covered. PL-15
                          set 919 — correct, and measured on a green run of ITS tree. M0-13 landed in
                          the same integration and its one-expression fix to `suggestVersion`'s
                          substance comparison sits INSIDE a governed region, so the merged tree
                          measures 953. Neither item touched the other's files and neither could have
                          seen it: a region's line count is a property of the MERGED source, not of
                          either branch. 34 of slack is more than the 19 that had already flipped a
                          control from RED to GREEN, and this is the fourth floor in two days that
                          only the integrator could set. */
                       // lines inside the regions. The wording below said this is floored BELOW the
                       // measured figure; PL-15 MEASURED that the last three items have each set it
                       // EQUAL to what the guard printed, so the intent is recorded and the practice
                       // is what the numbers show. Kept equal here for the same reason a ratchet is:
                       // an ordinary edit ADDING lines inside a governed arm still passes, while a
                       // COLLAPSE fails. The per-region trivial-span arm (REGION_MIN_LINES)
                       // is the tight half and this is the aggregate one; they fail for different
                       // reasons. (was 851, 724, 632, 45)
  codesChecked: 145,   // + REC-69's THREE (C-36.1..3), all COMPARED: the region's `refusal` helper sits
                       // refusals JUDGED, and not the same as lines read. Was 119 pre-REC-76 (and 118 on
                       // the same tree once the double-count above was removed), 76, 58, 46, 30, 11.
                       /* REC-64 MEASURED THE DELEGATION REC-71 LEFT HERE, AND THE ANSWER IS BOTH
                          BETTER AND WORSE THAN THE TREND PREDICTED. REC-71 measured 7 of 13 governed
                          sites unfalsifiable — 776 lines read, ZERO codes compared — and said the
                          trend was the finding, every family since VF-2 adding more. THE TREND HAS
                          REVERSED: 9 of 59 sites compare zero today (1,156 lines), down from 8 of 28
                          at REC-64's own baseline. All 30 of REC-64's new regions compare EVERY code
                          they judge, because the convention works — a string literal at the site.
                          THE WORSE HALF, and it is a finding about the INSTRUMENT rather than the
                          subject, recorded because REC-64's own new site is the one that exposed it:
                          `aiRunOpen` is a governed site that judges NOTHING, and not because its code
                          is a variable. Arm C's matcher is `ok: false`, and `aiRunOpen` refuses with
                          `started: false`. MEASURED over bio-plane/src: 704 `ok: false`, 5
                          `started: false`, 3 computed `ok: !x`. So arm C is structurally blind to
                          eight refusal objects in the plane, and a codeless refusal in any of them
                          would pass this guard silently. Two of those five are inside `aiRunOpen`
                          itself and one of them was codeless until REC-64 gave it a code by hand.
                          NOT fixed there: widening the matcher is a change to VF-2's instrument under
                          `civicos-ui/`, which REC-64 did not claim beyond this constant block.
                          Delegated in CLAIMS.md with the measurement.
                          **CLOSED BY REC-76, 2026-08-08 (D-236).** The matcher was not lengthened by
                          two spellings — it was INVERTED: arm C now takes every RETURN-POSITION
                          outcome and grades it by whether it DECLARES ITSELF A SUCCESS. `aiRunOpen`
                          went from `92L (0 judged, 0 checked)` to 4 judged, and TWO of its four
                          refusals turned out to be CODELESS at a governed site. See "WHAT MAKES
                          SOMETHING A REFUSAL" above the arm. */
                       // The growth is a convention landing, not luck: PL-3 named its helper
                       // `refusal` and passed a STRING LITERAL at every site, and every family
                       // since has done the same, because a local `refuse(key, …)` passes the code
                       // as a VARIABLE and arm C then compares NOTHING. That is how seven of
                       // thirteen governed sites once read 776 lines and checked zero — arm C's
                       // teeth reached 5 of 13 sites, and that is a measurement, delegated to
                       // REC-64 rather than smoothed away.
  outcomeReturns: 74,   /* REC-76 — THE CORPUS OF ARM C'S OUTCOME WALK: return-position object
                          literals across the governed spans. Set from what the guard PRINTED on
                          a green run of this worktree. It is floored SEPARATELY from
                          `refusalsJudged` because the two fail for different reasons — the
                          corpus collapses when the return reader goes blind, the yield when the
                          verdict rule does — and a headline assertion that PASSED OVER AN EMPTY
                          CORPUS is this project's most recent instrument defect. */
  refusalsJudged: 148,   /* +3 by REC-69 (C-36.1..3 inside `is-airuns-context`), 2026-08-09, from the
                          printed figure on a green run of the merged tree. `outcomeReturns` does NOT
                          move: the three refusals are all return positions inside ONE outcome the
                          walk already counted, which is what the two figures being separate is for.
                          REC-76 — the YIELD: outcomes graded as refusals rather than as declared
                          successes. Was implicitly floored at 1 (`if (!refusalsJudged)`), which
                          a walk that had lost every spelling but one would still have cleared. */
  vocabularies: 11,    // the plane's own code->text maps a surface renders verbatim (arm E).
                       // WAS 8. REC-74 added `STANDARD_BASIS` to src/airun.mjs — the five ways a
                       // run's declared standard pair can be known, each carrying the sentence a
                       // member reads instead of the machine word. Moved IN THE SAME TURN from
                       // the figure THIS FILE PRINTED on a green run (9/56), never by adding to
                       // the number: five consecutive items found this block already stale by
                       // measuring it, and REC-71 measured a floor with slack flipping a control
                       // from RED to GREEN.
  vocabularyTerms: 61, // + REC-69's TWO `RUN_CONTEXTS` terms (inquiry, project).
                       // FINDING slug. Read 40 over a tree carrying 50 for long enough that
                       // PL-11 and SK-1 each found the same ten of slack independently, neither
                       // having added any vocabulary. A walk that lost a whole vocabulary would
                       // still have cleared 40.
};

/* THE OTHER HALF OF THE RATCHET. A floor catches an instrument going blind; a
   ceiling catches the SUBJECT getting worse. REC-64 is the sweep that lowers
   this to zero, one family at a time, and until then no new receivable code may
   arrive without a translation. Measured 2026-08-07 by this file. */
const CEILING = {
  reachGap: 41,    /* codes in reach with no canned translation — may only FALL. FELL 73 -> 42 at
                          REC-64, the enactment itself: 31 codes inside the reach gained a canned
                          translation in one item. Was 74 before PL-15, which took it to 73 by giving
                          `NO_CLASS` its first translation.

                          **WHAT THE REMAINING 42 ARE, because the count alone would mislead whoever
                          reads it next.** They are not a tail of the same work. REC-64 closed every
                          gap code minted at exactly ONE site in `store.mjs`; what is left is two
                          kinds, and NEITHER is closed by writing more translations:

                          (1) THE MULTI-SITE CODES — the large half. A row holds ONE `where`, and a
                              `where` names THE SMALLEST SPAN IN WHICH THE REFUSAL IS ENFORCED. One
                              code may not hold two rows: arm A refuses a duplicated check number and
                              a duplicated translation, and two rows for one code is two wordings for
                              one condition — the drift this guard exists to stop. So a code minted at
                              fifteen sites cannot honestly name one of them. MEASURED in the plane:
                              NO_SUCH_BUNDLE 15 sites, NO_REASON 12, NO_ENTITY 10, NO_SUCH_PROJECT 9,
                              NOT_A_PROJECT 8, NO_TARGET 9, ILLEGAL_TRANSITION 8, NOT_AN_INQUIRY 7,
                              NO_SUCH_ENTITY 7, NO_SHA 5, NOT_THE_OWNER 5, EMPTY_SELECTION 5. The
                              honest fix is a `where` that can name a SET of spans, or those refusals
                              consolidated behind one helper so there IS one site — a change to this
                              guard or to the plane's shape, not a translation.
                          (2) THE FOUR IN `index.mjs` — BAD_LOCATOR, GATE_REFUSED, NO_ATTESTATION,
                              NO_SUCH_CAPTURE, all minted inside the control plane's `fetch`. REC-64
                              did not claim `index.mjs` and did not reach into an unclaimed file for
                              four codes.

                          So this ceiling does NOT fall to zero by continuing REC-64's method, and
                          saying so here is the point: a ratchet whose next move is unavailable reads
                          as neglect unless the reason is written where the number is. */
  unclassifiedOutcomes: 3, /* REC-76 — return-position outcomes at a governed site carrying NO
                          verdict this walk can read. NAMED every run and ceilinged: a new one is
                          a new place a codeless refusal could hide, so it FAILS here rather than
                          being scored zero. Set from what the guard PRINTED on a green run. */
};

/* A REGION'S MINIMUM SPAN. Not a style rule: it is the cheap arm against the
   failure this whole item is about, a walk taking the WRONG SPAN and reporting a
   clean verdict over bytes that could not have carried what it sought. The two
   live regions MEASURE 19 and 16 lines; a real governed arm is not three lines,
   and a pair of markers that have collapsed onto each other is. */
const REGION_MIN_LINES = 4;
const REGION_MIN_CHARS = 120;
/* Built rather than written, because the literal two-character sequence closes
   THIS comment and every other one in this file — the same trap as the backticks
   in `schema.mjs`'s template literals (CLAUDE.md), and it cost a parse error here
   before it was noticed. */
const CLOSE_COMMENT = "*" + "/";

/* ============================================================
   THE CODE WALK — a SET of matchers, each yield printed
   ============================================================ */

/* A refusal code is SCREAMING_SNAKE. Three characters minimum, so `OK` and a
   stray `R2` in prose are not codes; the plane has none that short. */
const CODE_RE = /^[A-Z][A-Z0-9_]{2,}$/;

/* Each matcher says what SPELLING of a refusal it can see. They overlap on
   purpose — the union is the corpus and the per-matcher yields are how a
   matcher that has gone blind becomes visible. */
const MATCHERS = {
  /* The plain object-literal refusal, the commonest spelling. */
  'M1 reason:"CODE"':  src => harvest(src, /\breason\s*[:=]\s*"([A-Z][A-Z0-9_]{2,})"/g),
  /* THE ONE THAT EARNED THE SET. `reason` bound to an EXPRESSION rather than a
     literal — a ternary, a `||` default, a lookup with a fallback. Every code
     literal in the expression is a code the plane can mint. Bounded to the line
     so it cannot run away into the next statement. */
  'M2 reason:<expr>':  src => {
    const out = new Set();
    for (const m of src.matchAll(/\breason\s*[:=]\s*([^\n]*)/g))
      for (const q of m[1].slice(0, 240).matchAll(/"([A-Z][A-Z0-9_]{2,})"/g)) out.add(q[1]);
    return out;
  },
  /* DEC-49's own shape: the wire field is `code`, not `reason`. */
  'M3 code:"CODE"':    src => harvest(src, /\bcode\s*[:=]\s*"([A-Z][A-Z0-9_]{2,})"/g),
  /* A COMPARISON site. The plane and the surface both branch on a code they did
     not mint on that line; the code is still one the wire carries. */
  'M4 reason==="CODE"':src => harvest(src, /\breason\s*[!=]==\s*"([A-Z][A-Z0-9_]{2,})"/g),
  /* The family helper. `refusal("CODE", detail)` in airun.mjs builds the whole
     refusal from a row, so the code never appears beside the word `reason`. */
  'M5 refusal("CODE"': src => harvest(src, /\brefusal\s*\(\s*"([A-Z][A-Z0-9_]{2,})"/g),
};

function harvest(src, re) {
  const out = new Set();
  for (const m of src.matchAll(re)) out.add(m[1]);
  return out;
}

/* Every SCREAMING_SNAKE literal in a file, used to ask what a SURFACE names —
   intersected with the plane census, never trusted on its own. */
function screamingLiterals(src) {
  const out = new Set();
  for (const m of src.matchAll(/["'`]([A-Z][A-Z0-9_]{2,})["'`]/g)) if (CODE_RE.test(m[1])) out.add(m[1]);
  for (const m of src.matchAll(/^\s*([A-Z][A-Z0-9_]{2,})\s*:/gm)) if (CODE_RE.test(m[1])) out.add(m[1]);
  return out;
}

/* THE SIXTH MATCHER IS NOT A REGEX, AND THAT IS THE POINT. `meaningRows` and
   `versionChain` build their refusals as `MEANING_READ_CHECKS[key]` — the code
   is a VARIABLE at the mint site, so no source-text matcher can see it, and the
   first five between them missed all five of those codes while reporting a
   confident 306. A DEC-49 row is by construction a code the plane can send, so
   the family tables ARE a matcher: the one that reads the declaration instead
   of the call. Measured on the first green run of this file — the census went
   306 -> 311 and the five were exactly the two families that use a lookup. */
let FAMILY_CODES = new Set();

function planeCensus() {
  const files = fs.readdirSync(PLANE_SRC).filter(f => f.endsWith(".mjs"));
  const yields = {}, union = new Set(), unionRepro = new Set();
  for (const name of Object.keys(MATCHERS)) yields[name] = new Set();
  const off = [];
  for (const f of files) {
    const abs = path.join(PLANE_SRC, f);
    const committed = inCommit(abs);
    if (!committed) off.push(f);
    const src = fs.readFileSync(abs, "utf8");
    for (const [name, fn] of Object.entries(MATCHERS))
      for (const c of fn(src)) { yields[name].add(c); union.add(c); if (committed) unionRepro.add(c); }
  }
  /* The family rows come from `checks/bio-checks.mjs`, a NAMED path rather than a
     discovered one, so they belong to both unions on the same terms. */
  yields["M6 a DEC-49 row"] = new Set(FAMILY_CODES);
  for (const c of FAMILY_CODES) { union.add(c); if (inCommit(CATALOG)) unionRepro.add(c); }
  return { files: files.length, filesRepro: files.length - off.length, yields, union, unionRepro };
}

/* ============================================================
   ARM A — the DEC-49 families, harvested, and every row complete
   ============================================================ */

/* Harvested by export name matching /_CHECKS$/, never listed here — a family
   added by PL-1 or PL-12 must be guarded the moment it lands, not the release
   after somebody remembers to add it to a list. */
async function dec49Families() {
  const mod = await import("file://" + CATALOG);
  return Object.entries(mod)
    .filter(([k, v]) => /_CHECKS$/.test(k) && v && typeof v === "object" && !Array.isArray(v));
}

function armA(families) {
  if (families.length < FLOOR.families)
    FAIL(`only ${families.length} DEC-49 check families found in checks/bio-checks.mjs, floor is `
       + `${FLOOR.families}. A family that vanished took its codes' translations with it, and the `
       + `codes did not vanish with it. Harvested by export name matching /_CHECKS$/ — a family `
       + `RENAMED out of that shape is invisible to this guard and reads exactly like a deletion.`);

  const rows = [];            // {family, code, check, where, translation}
  const byCheck = new Map(), byTranslation = new Map();

  for (const [fam, table] of families) {
    for (const [code, row] of Object.entries(table)) {
      rows.push({ fam, code, ...row });

      if (!CODE_RE.test(code))
        FAIL(`${fam}.${code} is not the shape a wire code has (SCREAMING_SNAKE, 3+ chars). `
           + `A surface keys on this string; a code it cannot recognise is a code with no translation.`);

      /* THE TRANSLATION — the whole subject of the ruling. */
      const t = row.translation;
      if (typeof t !== "string" || !t.trim())
        FAIL(`${fam}.${code} has NO CANNED TRANSLATION. DEC-49: every code a surface can receive has `
           + `a translation, and an untranslated code FAILS THE HARNESS rather than reaching a member. `
           + `Add a \`translation\` to this row in checks/bio-checks.mjs.`);
      else {
        /* 40 characters is THIS REPOSITORY'S OWN BAR, not one invented here:
           `airun.test.mjs` and `meaningread.test.mjs` both already assert a
           translation is a string longer than 40. Adopting it keeps the guard
           consistent with the suites it generalises rather than quietly raising
           the floor under three families that already pass. */
        if (t.trim().length < 40 || t.trim().split(/\s+/).length < 6)
          FAIL(`${fam}.${code}'s translation is ${t.trim().length} characters — too short to be the `
             + `sentence a member reads instead of the code. DEC-49's translations explain what `
             + `happened and, where there is one, the remedy. Got: ${JSON.stringify(t)}`);
        /* A "translation" that prints the machine vocabulary back is not one.
           This is the exact failure the ruling names: a member being made to
           decode SCREAMING_SNAKE at a screen. */
        const shouty = [...t.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map(m => m[1]).filter(c => c.includes("_"));
        if (shouty.length)
          FAIL(`${fam}.${code}'s translation restates machine vocabulary (${shouty.join(", ")}). `
             + `The translation is what a member reads INSTEAD of the code; a code inside it is the `
             + `member decoding it anyway.`);
      }

      /* THE C-NUMBER — the row is a check as well as a translation, and a check
         number claimed twice is two conditions the audit reports as one. */
      if (!/^C-\d+\.\d+$/.test(String(row.check || "")))
        FAIL(`${fam}.${code} carries check=${JSON.stringify(row.check)}, which is not a C-number. `
           + `DEC-49's row is one place holding the C-number, the wire code and the translation; a row `
           + `without its C-number is not in the catalog the gate runs.`);
      else {
        const prior = byCheck.get(row.check);
        if (prior) FAIL(`${row.check} is claimed by BOTH ${prior} and ${fam}.${code}. Two conditions `
                      + `behind one C-number are one condition as far as op=audit can see.`);
        else byCheck.set(row.check, `${fam}.${code}`);
      }

      /* A TRANSLATION COPIED between two codes says the same thing about two
         different facts, which is the drift the guard exists to stop arriving
         from inside. */
      if (typeof t === "string" && t.trim()) {
        const key = t.trim();
        const prior = byTranslation.get(key);
        if (prior) FAIL(`${fam}.${code} and ${prior} carry the IDENTICAL translation. Two different `
                      + `refusals that read the same are two refusals a member cannot tell apart.`);
        else byTranslation.set(key, `${fam}.${code}`);
      }

      /* `where` IS LOAD-BEARING — arm C goes and reads it. A `where` naming no
         real file is a row whose enforcement site nobody can check. */
      const site = parseWhere(row.where);
      if (!site) FAIL(`${fam}.${code}'s \`where\` (${JSON.stringify(row.where)}) does not begin with a `
                    + `path this guard can open. Arm C reads that function looking for a codeless `
                    + `refusal beside this one; a \`where\` it cannot resolve disables that arm silently.`);
      else if (!fs.existsSync(path.join(PLANE, site.file)))
        FAIL(`${fam}.${code}'s \`where\` names ${site.file}, which does not exist under bio-plane/.`);
    }
  }

  if (rows.length < FLOOR.rows)
    FAIL(`${rows.length} DEC-49 rows across ${families.length} families, floor is ${FLOOR.rows}. `
       + `The reach SHRANK. A ceiling would not have seen this (REC-70: a neutered walk sat green at `
       + `0 of 40) — say which rows went and why, then move the floor with a dated reason.`);

  NOTE(`arm A: ${families.length} DEC-49 families (${families.map(([k]) => k).join(", ")}), `
     + `${rows.length} rows — floor ${FLOOR.families}/${FLOOR.rows}`
     + `${rows.length > FLOOR.rows ? ` · GREW by ${rows.length - FLOOR.rows} row(s) since the floor was set` : ""}`);
  return rows;
}

/* WHAT A `where` MEANS, and REC-71 is the whole reason this has a second form.
 *
 * A `where` names THE SMALLEST SPAN IN WHICH THE ROW'S REFUSAL IS ENFORCED, and
 * arm C judges exactly that span and nothing else. Two spellings:
 *
 *   "src/airun.mjs checkObservation, called from …"
 *       the WHOLE FUNCTION BODY is the governed site. Correct only when every
 *       refusal that function makes is the family's business.
 *
 *   "src/store.mjs promote > basis-version-freeze, NOT reachable from …"
 *       a NAMED REGION inside that function is the governed site, delimited in
 *       the source by `DEC-49 REGION <name>` / `END DEC-49 REGION <name>` block
 *       comments.
 *
 * A GOVERNED SITE AND A GOVERNED FUNCTION ARE DIFFERENT CLAIMS. Before REC-71
 * only the first form existed, so PL-1's two rows — whose own prose said *"(the
 * basis-version freeze arm)"* — were read as governing the whole of `promote`:
 * 870 lines, the plane's largest function, 34 refusals. **32 long-standing
 * refusals that pre-dated the rows instantly owed canned translations they were
 * never in scope for, and `main`'s UI harness went red.** The rows meant a
 * region and there was no way to say so. Now there is.
 *
 * WHY A SOURCE MARKER RATHER THAN A LINE RANGE OR AN ANCHOR SIGNATURE. Both of
 * the alternatives go stale SILENTLY, and this repository has now been bitten
 * twice in one week by a source walk anchored on a signature taking the wrong
 * span and reporting a clean verdict over bytes that could not have carried what
 * it sought — including by this very file, whose first draft read
 * `versionChain`'s PARAMETER LIST as its body and passed. A marker cannot go
 * stale quietly: it sits in front of the person moving the code, and every way
 * it can be wrong FAILS below rather than narrowing the span to nothing. */
const REGION_START = name => new RegExp(`/\\*[\\s*]*DEC-49 REGION\\s+(${name})\\b`, "g");
const REGION_END   = name => new RegExp(`/\\*[\\s*]*END DEC-49 REGION\\s+(${name})\\b`, "g");
/* Any marker at all, used to find ORPHANS — a region declared in the source that
   no `where` claims. Region names are `[\w-]+`, which is deliberately narrower
   than prose: the `<region>` placeholders in bio-checks.mjs's own explanatory
   block are not markers and must not be harvested as one. */
const ANY_REGION_MARKER = /\/\*[\s*]*(END )?DEC-49 REGION\s+([\w-]+)/g;

function parseWhere(where) {
  const m = /^([\w./-]+\.mjs)\s+([#\w$]+)(?:\s*>\s*([\w-]+))?/.exec(String(where || ""));
  return m ? { file: m[1], fn: m[2], region: m[3] || null } : null;
}

/* ============================================================
   ARM B — THE REACH, and every code in it translated
   ============================================================ */

function armB(rows, census, surfaceTables) {
  const app = fs.readFileSync(APP, "utf8");
  const suites = fs.readdirSync(TESTDIR).filter(f => f.endsWith(".test.mjs")).sort();

  const R1 = new Set(rows.map(r => r.code));
  /* R2/R3 are INTERSECTED with the plane census on purpose: a SCREAMING_SNAKE
     literal in a surface or a suite is only a receivable code if the plane
     mints it. Without the intersection this would harvest every constant name
     in two large files and call the noise "reach". */
  const R2 = new Set([...screamingLiterals(app)].filter(c => census.union.has(c)));
  const R3 = new Set(), R3repro = new Set();
  for (const s of suites) {
    const committed = inCommit(path.join(TESTDIR, s));
    for (const c of screamingLiterals(fs.readFileSync(path.join(TESTDIR, s), "utf8")))
      if (census.union.has(c)) { R3.add(c); if (committed) R3repro.add(c); }
  }

  const reach = new Set([...R1, ...R2, ...R3]);
  /* THE REACH FLOOR IS THE REPRODUCIBLE ONE (D-257). `suites` is discovered off
     `civicos-ui/test/`; `app.html` and the catalog are NAMED paths and cannot be
     inflated by an arrival, so R1 and R2 sit in both figures unchanged. */
  const reachRepro = new Set([...R1, ...R2, ...R3repro]);

  /* THE TRANSLATIONS AVAILABLE, from the two licensed places and no third.
     DEC-49 licenses BOTH — Bob left build-time and runtime lookup open — but it
     licenses ONE PLACE PER CODE. A code translated by a plane row AND by a
     surface table is two wordings for one condition that will drift apart, and
     drift is the entire reason the guard is not optional (REC-43's fence).
     Gated at zero: there is no overlap today and there must not be a first one. */
  const translated = new Map();       // code -> where its translation lives
  for (const r of rows) translated.set(r.code, `${r.fam}.${r.code} (checks/bio-checks.mjs)`);
  for (const t of surfaceTables)
    for (const c of t.codes) {
      if (translated.has(c))
        FAIL(`${c} is translated TWICE — by ${translated.get(c)} and by \`${t.name}\` in app.html. DEC-49 `
           + `licenses either home and one wording: two are two sentences for one condition, and they will `
           + `drift. Keep the PLANE's row (one wording for every surface, every instance and every export) `
           + `and delete the surface entry, or the reverse — but not both.`);
      else translated.set(c, `${t.name} (app.html)`);
    }

  /* ---- THE ENACTED PERIMETER: gated at ZERO, and this is the guard's floor
     of correctness rather than of size. A code inside DEC-49's enactment —
     a family row, or a code its producer mints into a surface table — that has
     no translation is the failure the ruling calls not optional. There is no
     ratchet here and there must not be: zero is the only defensible number. */
  const perimeter = new Set([...R1]);
  for (const t of surfaceTables) for (const c of t.producerMints) perimeter.add(c);
  const perimeterGaps = [...perimeter].filter(c => !translated.has(c)).sort();
  if (perimeterGaps.length)
    FAIL(`${perimeterGaps.length} code(s) INSIDE DEC-49's enacted perimeter have NO CANNED TRANSLATION: `
       + `${perimeterGaps.join(", ")}. DEC-49 is not optional about this — an untranslated code FAILS THE `
       + `HARNESS rather than reaching a member. Give each one a row in a \`*_CHECKS\` family in `
       + `bio-plane/checks/bio-checks.mjs (the plane's translation, one place, every surface), or an entry `
       + `in the surface table its producer feeds. Do NOT write the wording at a call site: thirteen `
       + `surfaces each inventing wording is the drift REC-43 closed.`);

  /* ---- THE MEASURED REACH: floored on SIZE, ceilinged on the GAP.
     R2 and R3 reach past the enacted perimeter — a code app.html branches on,
     or a harness mock sends, is a code a member can meet whether or not REC-64
     has got to it yet. Gating that at zero today would fail on the day it
     landed and be switched off, which VERIFICATION.md gives as the reason
     `--strict` is not yet the gate. So it is a RATCHET instead, and it has both
     halves:
       FLOOR on the reach — the walk may not lose sight (REC-70's neutered walk
         sat green at 0 of 40, which a ceiling alone cannot see);
       CEILING on the gap — REC-64 may only ever shrink it. A new refusal code
         that a surface names or a mock sends, with no translation, pushes the
         gap up by one and FAILS HERE.
     Both figures are printed every run and the gap is named code by code, so
     the answer to "how many conditions lack a translation" is a measurement
     rather than an impression. */
  const gap = [...reach].filter(c => !translated.has(c)).sort();

  if (reachRepro.size < FLOOR.reach)
    FAIL(`the reach is ${reachRepro.size} codes that are in the commit at HEAD (${reach.size} over the `
       + `working tree), floor is ${FLOOR.reach}. THE WALK LOST SIGHT — this is the `
       + `failure a ceiling cannot see. Establish which of R1/R2/R3 stopped yielding before moving the floor.`);

  /* ONE PROVENANCE REPORT FOR BOTH WALKS — the plane sources the census read and
     the suites R3 was harvested from, plus the two named paths, so a reader owed
     the corpus is owed all of it (M0-16 rule 3: print the reproducible total
     beside the contaminated one, at the place the figure is quoted). */
  reportProvenance({
    prov: PROV,
    items: [
      ...fs.readdirSync(PLANE_SRC).filter(f => f.endsWith(".mjs"))
        .map(f => ({ path: repoPath(REPO, path.join(PLANE_SRC, f)), what: `src/${f}`,
          counted: "matched for refusal codes, and counted into the census floor" })),
      ...suites.map(s => ({ path: repoPath(REPO, path.join(TESTDIR, s)), what: `test/${s}`,
        counted: "harvested for R3, and counted into the reach floor" })),
      { path: repoPath(REPO, APP), what: "app.html", counted: "harvested for R2 (a NAMED path, not discovered)" },
      { path: repoPath(REPO, CATALOG), what: "checks/bio-checks.mjs",
        counted: "the DEC-49 families, R1 (a NAMED path, not discovered)" },
    ],
    instrument: "this guard's census and reach walks",
    corpus: `bio-plane/src/: ${census.files} file(s), ${census.filesRepro} in the commit`
      + ` · civicos-ui/test/: ${suites.length} suite(s)`,
    totals: PROV.inHead === null ? [] : [
      { label: "census codes", contaminated: census.union.size, reproducible: census.unionRepro.size, source: "plane sources" },
      { label: "codes in reach", contaminated: reach.size, reproducible: reachRepro.size, source: "sources and suites" },
    ],
  });

  if (gap.length > CEILING.reachGap)
    FAIL(`${gap.length} code(s) a surface CAN RECEIVE have no canned translation; the ratchet's ceiling is `
       + `${CEILING.reachGap} and REC-64 may only ever move it DOWN. The ${gap.length - CEILING.reachGap} `
       + `beyond it are new: ${gap.join(", ")}. A refusal a surface can meet owes a code with a canned `
       + `translation (DEC-49, and every IS fence inherits it) — add a row in a \`*_CHECKS\` family rather `
       + `than wording at the call site, then lower this ceiling in the same turn.`);

  NOTE(`arm B: REACH ${reach.size} codes — R1 family rows ${R1.size}, R2 named by app.html ${R2.size}, `
     + `R3 sent by a harness mock ${R3.size} (R2/R3 intersected with the plane census) · `
     + `${reachRepro.size} of them ${HEAD_SAYS}, which is the figure `
     + `floored and the one a floor may be moved to · floor ${FLOOR.reach}`
     + `${reachRepro.size > FLOOR.reach ? ` · GREW by ${reachRepro.size - FLOOR.reach}` : ""}`);
  NOTE(`arm B: enacted perimeter ${perimeter.size} codes, ALL translated, gated at zero — `
     + `${R1.size} plane rows + ${perimeter.size - R1.size} minted into a surface table proved total`);
  NOTE(`arm B: RATCHET — ${gap.length} of ${reach.size} codes in reach still have no canned translation `
     + `(ceiling ${CEILING.reachGap}, may only fall). THAT IS REC-64'S REMAINING WORK INSIDE THE REACH, `
     + `named: ${gap.join(", ")}`);
  return { reach, translated, gap, perimeter };
}

/* ============================================================
   ARM C — NO CODELESS REFUSAL AT A GOVERNED SITE (the teeth)
   ============================================================ */

/* A function named by a row's `where` is a site DEC-49 governs. Every refusal
   it returns must carry a code the family holds. A refusal added there with no
   code — or with a code nobody translated — is precisely the thing that must
   fail the harness rather than reach a member, and this is the arm that fails.
   Read as text over the function's body because the plane runs in workerd and
   cannot be exercised from this harness at all. */

/* ---------------------------------------------------------------------------
 * WHAT MAKES SOMETHING A REFUSAL — ASKED IN PRINCIPLE, NOT BY SPELLING.
 * REC-76 / D-236, and it is REC-70's lesson on its fourth outing in this repo.
 *
 * THIS ARM USED TO GRADE A REFUSAL BY ONE LITERAL, `ok: false`. The cost is
 * MEASURED rather than argued. Over `bio-plane/src`: **704 `ok: false`, 5
 * `started: false`, 3 computed `ok: !<expr>`** — so eight refusal objects were
 * invisible to the one arm whose entire job is to fail on a codeless refusal.
 * It was found the only way this class ever is: REC-64's own new governed site,
 * `aiRunOpen`, came back `92L (0 judged, 0 code(s) checked)` — read in full,
 * asserting nothing, and green. **And it had already cost a translation**:
 * `selectionResolve`'s `SET_MOVED` could not be given a region `where`, because
 * it refuses through `ok: !stopped` and a region around it would have judged
 * zero refusals and failed as a drifted marker.
 *
 * THE FIX INVERTS. It does not lengthen a list, because a list of spellings goes
 * stale SILENTLY the moment a fourth is written — which is the failure being
 * fixed. So:
 *
 *   THE CORPUS is every object literal in RETURN POSITION inside the governed
 *   span: what the code HANDS BACK. That is a property of the language, not of
 *   this plane's vocabulary.
 *
 *   THE VERDICT is the FIRST BOOLEAN-SHAPED top-level property of that object.
 *   `ok`, `started`, `found`, `proposed`, `preview` are five field names in this
 *   plane today and there will be a sixth; what every one of them has in common
 *   is that it is a BOOLEAN, and the set of boolean-producing operators is fixed
 *   by JavaScript's grammar rather than by anybody's next commit.
 *
 *   - verdict is the literal `true`  -> the outcome DECLARES ITSELF A SUCCESS.
 *     Not a refusal, not judged. This is the direction that must not over-fire.
 *   - verdict is the literal `false`, or a COMPUTED boolean (`!stopped`, a
 *     comparison, `Boolean(x)`) -> a refusal, or a refusal on at least one path.
 *     JUDGED: it owes a code with a canned translation.
 *   - NO boolean-shaped property at all -> the walk CANNOT CLASSIFY it. It is
 *     NAMED and ceilinged, never silently scored zero, because a shape scored
 *     zero is indistinguishable from a site with nothing to judge.
 *
 * WHAT THIS WALK STILL CANNOT SEE, stated rather than left to be discovered:
 *   - a refusal BUILT INTO A VARIABLE and returned later (`const r = { ok:false,
 *     … }; return r;`). `subresources.mjs` writes refusals that way. MEASURED
 *     when this landed: 0 of the 60 governed sites do, and every `ok:false` the
 *     old matcher judged is inside a return-position object — so this widening
 *     lost nothing, and that was checked rather than assumed.
 *   - a NEGATIVE-POLARITY verdict (`failed: true`, `error: true`). A `true`
 *     verdict reads as a success by construction. The cross-check below is the
 *     cheap half: a declared success carrying a refusal CODE is a contradiction
 *     and FAILS, gated at zero.
 *   - a refusal a HELPER builds out of sight. Arm A's row completeness and arm
 *     B's reach are what cover that ground, as they always were.
 * ------------------------------------------------------------------------ */
function armC(rows) {
  const sites = new Map();          // "file::fn::region" -> {file, fn, region, codes:Set}
  const claimedRegions = new Set(); // "file::region" — used to find ORPHAN markers below
  for (const r of rows) {
    const w = parseWhere(r.where);
    if (!w) continue;
    const key = `${w.file}::${w.fn}::${w.region || ""}`;
    if (!sites.has(key)) sites.set(key, { ...w, codes: new Set(), fams: new Set() });
    sites.get(key).codes.add(r.code);
    sites.get(key).fams.add(r.fam);
    if (w.region) claimedRegions.add(`${w.file}::${w.region}`);
  }

  if (sites.size < FLOOR.governedSites)
    FAIL(`${sites.size} governed sites derived from the rows' \`where\` fields, floor is `
       + `${FLOOR.governedSites}. Arm C only judges what \`where\` points it at, so a site that stopped `
       + `resolving is an arm that stopped running while still reporting green.`);

  let bodiesRead = 0, refusalsJudged = 0, bodyLines = 0;
  let regionsResolved = 0, regionLines = 0, codesChecked = 0;
  let outcomeReturnsRead = 0, successesSeen = 0;
  const unclassified = [];
  const perSite = [];
  for (const [key, site] of sites) {
    const full = path.join(PLANE, site.file);
    let src;
    try { src = fs.readFileSync(full, "utf8"); }
    catch (_) { FAIL(`arm C cannot read ${site.file} for ${key} — the site named by \`where\` is unreadable`); continue; }
    const fnBody = functionBody(src, site.fn);
    if (!fnBody) {
      FAIL(`arm C could not find function ${site.fn} in ${site.file} (named by \`where\` on `
         + `${[...site.codes].join(", ")}). The row points at a site that is not there under that name, `
         + `so nothing is checking that site for a codeless refusal.`);
      continue;
    }
    /* THE NARROWING (REC-71). A region `where` reduces the judged span from the
       whole function to the marked arm. EVERY way that can go wrong FAILS —
       narrowing a span is exactly how a walk goes quietly blind, so none of it
       is inferred from a green run. */
    let body = fnBody;
    if (site.region) {
      body = regionSpan(src, fnBody, site.region, key, site);
      if (!body) continue;
      regionsResolved++;
      regionLines += body.text.split("\n").length;
    }
    bodiesRead++;
    const nLines = body.text.split("\n").length;
    bodyLines += nLines;
    perSite.push(`${site.fn}${site.region ? ` > ${site.region}` : ""} ${nLines}L`);
    const judgedHereStart = refusalsJudged;
    let checkedHere = 0;

    /* Every OUTCOME the span hands back, graded by whether it DECLARES ITSELF A
       SUCCESS — see "WHAT MAKES SOMETHING A REFUSAL" above. The family helper is
       the other way a refusal is built and is judged below. A refusal object
       that carries neither a `code` in the family nor a `reason` naming one
       FAILS; an outcome this walk cannot classify at all is NAMED. */
    const at_ = site.region ? ` > ${site.region}` : "";
    for (const [s, e] of outcomeReturns(body.text)) {
      const stmt = body.text.slice(s, e + 1);
      const line = body.startLine + body.text.slice(0, s).split("\n").length - 1;
      outcomeReturnsRead++;
      const named = [...stmt.matchAll(/\b(?:code|reason)\s*:\s*"([A-Z][A-Z0-9_]{2,})"/g)].map(x => x[1]);
      const viaVar = /\b(?:code|reason)\s*:\s*(?!["'])[\w.[\]]+/.test(stmt);
      const v = verdictOf(stmt);
      /* (1) NO VERDICT AT ALL — the walk does not understand this outcome's
         shape. It is NAMED and counted against a ceiling, never silently scored
         zero: a shape scored zero is indistinguishable from a site with nothing
         to judge, which is the whole of D-236. */
      if (!v) {
        unclassified.push(`${site.file}:${line} (${site.fn}${at_}) ${JSON.stringify(stmt.replace(/\s+/g, " ").slice(0, 90))}`);
        continue;
      }
      /* (2) IT DECLARES ITSELF A SUCCESS. Not a refusal, not judged — and this
         is the direction that must NOT over-fire: a success spelled in a way
         nobody anticipated, graded as a refusal, floods the guard with false
         sites and gets it switched off (VERIFICATION.md's own reason for not
         making `--strict` the gate yet). The ONE cross-check is cheap and is
         gated at zero rather than ratcheted: a declared success carrying a
         refusal CODE is a contradiction, and it is also the only way this rule
         could hide a negative-polarity verdict such as `failed: true`. */
      if (v.kind === "true") {
        successesSeen++;
        if (named.length)
          FAIL(`${site.file}:${line} (in ${site.fn}${at_}) returns an outcome whose verdict \`${v.key}\` `
             + `DECLARES SUCCESS (\`true\`) while carrying refusal code(s) ${named.join(", ")}. Those are two `
             + `different claims in one object and this arm grades it as a success, so the refusal would go `
             + `unjudged. If the verdict is negative-polarity (\`failed: true\`), say so at the site — this `
             + `walk reads a \`true\` verdict as a success by construction and cannot see that on its own.`);
        continue;
      }
      /* (3) EVERYTHING ELSE IS A REFUSAL — a `false` verdict, or a COMPUTED one
         (`ok: !stopped`), which refuses on at least one path and owes a code on
         that path. */
      refusalsJudged++;
      if (!named.length && !viaVar)
        FAIL(`${site.file}:${line} (in ${site.fn}${at_}) returns a CODELESS REFUSAL — an outcome whose verdict `
           + `\`${v.key}\` is ${v.kind === "false" ? "`false`" : "computed, so it refuses on at least one path"}, `
           + `with no \`code\` and no \`reason\`. This site is governed by DEC-49 (${[...site.fams].join(", ")}), `
           + `so every refusal it makes owes a code with a canned translation. A refusal with no code is `
           + `a sentence a surface can only render verbatim or blank, which is the state DEC-49 ended. `
           + `Offending text: ${JSON.stringify(stmt.split("\n")[0].trim().slice(0, 120))}`);
      for (const c of named) {
        codesChecked++; checkedHere++;
        if (!site.codes.has(c))
          FAIL(`${site.file}:${line} (in ${site.fn}${at_}) refuses with code ${c}, which is NOT a row in `
             + `${[...site.fams].join("/")}. A code minted at a governed site with no row has no canned `
             + `translation, so it reaches a member as machine vocabulary — the exact failure DEC-49's `
             + `guard exists to prevent. Add the row, or refuse with one of: ${[...site.codes].sort().join(", ")}.`
             + (site.region ? "" : ` (This \`where\` names a WHOLE FUNCTION. If the row governs only an arm `
                                 + `of it, the fix is a REGION \`where\` and not a translation for this code — `
                                 + `see bio-checks.mjs's "WHAT A \`where\` MEANS" block, REC-71.)`));
      }
    }
    /* The family helper's own call sites, judged the same way. */
    for (const m of body.text.matchAll(/\brefusal\s*\(\s*"([A-Z][A-Z0-9_]{2,})"/g)) {
      refusalsJudged++; codesChecked++; checkedHere++;
      if (!site.codes.has(m[1])) {
        const line = body.startLine + body.text.slice(0, m.index).split("\n").length - 1;
        FAIL(`${site.file}:${line} (in ${site.fn}${at_}) calls refusal("${m[1]}"), which is NOT a row in `
           + `${[...site.fams].join("/")} — the helper would read \`undefined.translation\` and the code `
           + `would go out with no canned translation behind it.`);
      }
    }
    /* A REGION THAT JUDGES NOTHING IS A WRONG SPAN, and this is the arm that says
       so. A `where` names where the refusal FIRES; markers that have drifted off
       the arm they were put around leave a well-formed, non-trivial, correctly
       nested span containing no refusal at all — and every other check above
       would pass over it. Gated at zero for regions and NOT for functions: a
       function `where` may legitimately point at a site whose refusals arm C's
       matchers cannot see (four of them do today — see the arm's own NOTE), and
       failing on that would be doing REC-64's and REC-70's work here. */
    const judgedHere = refusalsJudged - judgedHereStart;
    if (site.region && !judgedHere)
      FAIL(`arm C judged NO refusal inside the region \`${site.region}\` of ${site.fn} in ${site.file}, `
         + `named by ${[...site.codes].sort().join(", ")}. A region \`where\` says THIS is where the refusal `
         + `fires; a span containing none is a marker that has drifted off the arm it was put around. The `
         + `span resolved, was non-trivial and was correctly nested, so nothing else here would have caught `
         + `it. Move the markers back around the refusal, or point the \`where\` somewhere true.`);
    perSite[perSite.length - 1] += ` (${judgedHere} judged, ${checkedHere} code(s) checked)`;
  }
  if (!refusalsJudged)
    FAIL(`arm C judged NO refusals across ${sites.size} governed sites. A guard that passes on nothing `
       + `observed is not a guard — establish whether the sites moved or the matcher went blind.`);
  /* THE BODY-LINE FLOOR IS THE FIX FOR THIS ARM'S OWN MEASURED DEFECT: it read
     `versionChain`'s PARAMETER LIST as a body, found no refusals in it, and
     reported green. A parameter list is a handful of lines; a governed function
     is not. Both the total and the per-site counts are printed, so a body that
     collapses is visible rather than inferred from a green run. */
  if (bodyLines < FLOOR.bodyLines)
    FAIL(`arm C read only ${bodyLines} lines of governed span across ${bodiesRead} site(s), floor `
       + `is ${FLOOR.bodyLines} (${perSite.join(", ")}). A body that shrinks to a handful of lines is this `
       + `walk matching a PARAMETER LIST rather than a body — the defect this arm was measured to have and `
       + `the reason the count is printed. Establish which site collapsed before moving the floor.`);

  /* THE REGION FLOORS (REC-71). Narrowing a span is the single most likely way
     this arm goes blind, so the narrowed spans carry their own floors on BOTH
     the number of regions resolved and the lines inside them. A region that
     silently stopped resolving would otherwise just remove itself from the
     judged set — green, and asserting nothing. */
  if (regionsResolved < FLOOR.regions)
    FAIL(`arm C resolved ${regionsResolved} region \`where\`(s), floor is ${FLOOR.regions}. A region that `
       + `stopped resolving takes its refusals out of the judged set and leaves this arm green over them.`);
  if (regionsResolved && regionLines < FLOOR.regionLines)
    FAIL(`arm C read ${regionLines} lines inside ${regionsResolved} governed region(s), floor is `
       + `${FLOOR.regionLines}. A region that has SHRUNK is a narrowing that went too far — the guard would `
       + `stop seeing refusals the row governs, which is the failure the narrowing must not buy.`);

  /* THE TEETH FLOOR, and it is the answer to "a control can pass while asserting
     nothing". Body lines measure what was READ; this measures what was actually
     COMPARED against a row. They come apart badly: four governed sites today read
     449 lines and check ZERO codes, because they refuse through a local
     `refuse(key, …)` helper (the code is a variable) or by pushing findings
     rather than returning an outcome at all. Those sites are neither passing nor
     failing on merit and this figure is how that stays visible. */
  if (codesChecked < FLOOR.codesChecked)
    FAIL(`arm C compared only ${codesChecked} refusal code(s) against a family row, floor is `
       + `${FLOOR.codesChecked}. Lines read is not the measure — a site can be read in full and assert `
       + `nothing. Establish which site stopped yielding a literal code before moving the floor.`);

  /* THE OUTCOME WALK'S OWN FLOORS (REC-76). The corpus is the returns READ; the
     yield is the ones GRADED AS REFUSALS. They are floored separately because
     they fail for different reasons: the corpus collapses when the return
     reader goes blind, and the yield collapses when the verdict rule does — and
     a walk that read every return and graded none of them would clear a corpus
     floor alone. This is REC-70's lesson stated as two numbers rather than one. */
  if (outcomeReturnsRead < FLOOR.outcomeReturns)
    FAIL(`arm C read ${outcomeReturnsRead} return-position outcome(s) across ${bodiesRead} governed span(s), `
       + `floor is ${FLOOR.outcomeReturns}. THE CORPUS COLLAPSED — the return reader stopped finding what `
       + `the spans hand back, and every verdict below it is a verdict over nothing.`);
  if (refusalsJudged < FLOOR.refusalsJudged)
    FAIL(`arm C graded ${refusalsJudged} of ${outcomeReturnsRead} outcome(s) as REFUSALS, floor is `
       + `${FLOOR.refusalsJudged}. The corpus may be intact while the VERDICT RULE has gone blind: a walk `
       + `that reads every return and declares them all successes asserts nothing and reports green.`);

  /* AND WHAT THE WALK COULD NOT CLASSIFY IS NAMED (D-236's second half, and the
     fix M0-14 landed for the control register and CPDF-9 for the dark fleet
     member). An outcome with no boolean-shaped property has no verdict this walk
     can read. Scoring it zero would make it indistinguishable from a site with
     nothing to judge — which is the failure this whole item exists to close — so
     it is PRINTED by name and held under a ceiling that may only FALL. */
  if (unclassified.length > CEILING.unclassifiedOutcomes)
    FAIL(`${unclassified.length} return-position outcome(s) at governed sites carry NO verdict this walk can `
       + `read; the ceiling is ${CEILING.unclassifiedOutcomes} and it may only ever move DOWN. The `
       + `${unclassified.length - CEILING.unclassifiedOutcomes} beyond it are new. An outcome whose shape the `
       + `walk does not understand is not judged, so a codeless refusal hiding in one would pass silently — `
       + `give it a verdict this walk can read (a boolean-shaped property), or lower the ceiling in the same `
       + `turn if one has been retired. They are: ${unclassified.join(" · ")}`);
  NOTE(`arm C: UNCLASSIFIED — ${unclassified.length} of ${outcomeReturnsRead} return-position outcome(s) carry no `
     + `verdict this walk can read and are NAMED rather than scored zero (ceiling ${CEILING.unclassifiedOutcomes}, `
     + `may only fall)${unclassified.length ? `: ${unclassified.join(" · ")}` : ""}`);

  /* AN ORPHAN MARKER — a `DEC-49 REGION` declared in the plane that no `where`
     claims. It reads at the site as if that span were governed, and nothing is
     governing it: a comment asserting a guarantee nobody enforces, which is the
     "unreachable defence" class (REC-68) one file over. Gated at zero. */
  const marked = new Map();          // "file::region" -> file
  for (const rel of markerFiles()) {
    const src = fs.readFileSync(path.join(PLANE, rel), "utf8");
    for (const m of src.matchAll(ANY_REGION_MARKER)) marked.set(`${rel}::${m[2]}`, rel);
  }
  const orphans = [...marked.keys()].filter(k => !claimedRegions.has(k)).sort();
  if (orphans.length)
    FAIL(`${orphans.length} \`DEC-49 REGION\` marker(s) in the plane that NO row's \`where\` claims: `
       + `${orphans.join(", ")}. The marker tells the next reader that span is a governed site and nothing `
       + `is governing it. Point a \`where\` at it with the \`<file> <fn> > <region>\` spelling, or remove `
       + `the marker — a defence that is documented and not wired is worse than a missing one.`);

  NOTE(`arm C: ${sites.size} governed sites from the rows' \`where\` — ${sites.size - regionsResolved} whole `
     + `function(s), ${regionsResolved} narrowed REGION(s) (${regionLines} lines inside them, ${marked.size} `
     + `marker pair(s) in the plane, all claimed); ${bodiesRead} spans read, ${bodyLines} lines total; `
     + `${refusalsJudged} refusals judged and ${codesChecked} code(s) actually COMPARED against a row `
     + `· ${perSite.join(" · ")} · floors ${FLOOR.governedSites} sites / ${FLOOR.bodyLines} lines / `
     + `${FLOOR.regions} regions / ${FLOOR.regionLines} region lines / ${FLOOR.codesChecked} codes checked`);
  NOTE(`arm C: THE OUTCOME WALK — ${outcomeReturnsRead} return-position outcome(s) read, graded `
     + `${refusalsJudged} REFUSAL(s) / ${successesSeen} declared SUCCESS(es) / ${unclassified.length} `
     + `unclassified, by verdict rather than by spelling · floors ${FLOOR.outcomeReturns} corpus / `
     + `${FLOOR.refusalsJudged} refusals`
     + `${outcomeReturnsRead > FLOOR.outcomeReturns ? ` · corpus GREW by ${outcomeReturnsRead - FLOOR.outcomeReturns}` : ""}`);
}

/* WHICH FILES CAN HOLD A REGION MARKER. The plane's sources and its check
   catalog — the two places a `where` can name. Read from the directory rather
   than listed, so a new source file cannot hide an orphan marker. */
function markerFiles() {
  const out = fs.readdirSync(PLANE_SRC).filter(f => f.endsWith(".mjs")).map(f => path.join("src", f));
  out.push(path.join("checks", "bio-checks.mjs"));
  return out;
}

/* THE REGION SPAN (REC-71) — resolved from the source's own markers, and every
 * way it can be wrong FAILS rather than narrowing the judged span to nothing.
 *
 * The span is taken from the END of the opening marker's comment to the START of
 * the closing marker's, so the marker prose itself is never judged: a marker that
 * mentions a code in its explanation must not be read as a refusal.
 *
 * It returns null on every failure, and the caller skips the site. That is
 * deliberate: a site whose span could not be established must not be judged as
 * though it were empty — an empty span passes everything. */
function regionSpan(src, fnBody, region, key, site) {
  const esc = region.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const label = `region \`${region}\` for ${key} (${[...site.codes].sort().join(", ")})`;

  const starts = [...src.matchAll(REGION_START(esc))];
  const ends   = [...src.matchAll(REGION_END(esc))];
  /* An END marker also matches the START pattern's prefix in some spellings; the
     patterns are anchored on the literal words, so subtract any overlap by
     position rather than trusting the two counts independently. */
  const endAt = new Set(ends.map(m => m.index));
  const pureStarts = starts.filter(m => !endAt.has(m.index) && !/END\s+DEC-49/.test(src.slice(Math.max(0, m.index), m.index + m[0].length + 4)));

  if (pureStarts.length !== 1) {
    FAIL(`${label}: found ${pureStarts.length} \`DEC-49 REGION ${region}\` opening marker(s) in ${site.file}, `
       + `expected exactly 1. ${pureStarts.length ? "A duplicated marker makes the span ambiguous and the guard "
       + "would silently pick one." : "A `where` naming a region the source does not declare is an arm that "
       + "stopped running while still reporting green — this is the failure the marker exists to make loud."}`);
    return null;
  }
  if (ends.length !== 1) {
    FAIL(`${label}: found ${ends.length} \`END DEC-49 REGION ${region}\` marker(s) in ${site.file}, expected `
       + `exactly 1. An unclosed region has no end, and a doubled one has two — either way the judged span `
       + `is not the one the row claims.`);
    return null;
  }

  const openTag = pureStarts[0];
  /* The span starts where the opening marker's own block comment CLOSES, so the
     marker's prose is never judged: it explains the region and mentions codes. */
  const afterOpen = src.indexOf(CLOSE_COMMENT, openTag.index);
  const start = afterOpen < 0 ? openTag.index + openTag[0].length : afterOpen + 2;
  const end = ends[0].index;
  if (end <= start) {
    FAIL(`${label}: the END marker at offset ${end} comes BEFORE the opening marker's span start (${start}) `
       + `in ${site.file}. The region is inside out, so there is no span to judge.`);
    return null;
  }

  /* THE SPAN MUST BE INSIDE THE FUNCTION THE `where` NAMES. A marker pair that
     drifted out of `promote` into a neighbouring method would resolve cleanly
     and judge somebody else's refusals under this family's rows. */
  const fnStart = src.indexOf(fnBody.text);
  const fnEnd = fnStart + fnBody.text.length;
  if (fnStart < 0 || start < fnStart || end > fnEnd) {
    FAIL(`${label}: the marked region is NOT inside ${site.fn}'s body in ${site.file} (region ${start}..${end}, `
       + `function ${fnStart}..${fnEnd}). A \`where\` claims a span inside the function it names; a region that `
       + `has drifted out of it would have this family's rows judging another function's refusals.`);
    return null;
  }

  const text = src.slice(start, end);
  const nLines = text.split("\n").length;
  /* THE NON-TRIVIAL-SPAN ARM. A source walk that takes the WRONG SPAN and
     reports a clean verdict over bytes that could not have carried what it
     sought has now been sighted twice in a week in this repository, including
     inside this very file (a parameter list read as a body). A span of a line or
     two is that failure, and it is cheap to refuse. */
  if (nLines < REGION_MIN_LINES || text.trim().length < REGION_MIN_CHARS) {
    FAIL(`${label}: the marked span is ${nLines} line(s) / ${text.trim().length} characters, below the `
       + `${REGION_MIN_LINES}-line / ${REGION_MIN_CHARS}-character floor. A span that small is markers that `
       + `have collapsed onto each other, and it would pass every other arm here while judging nothing. `
       + `This is the same defect class as this file's own parameter-list-read-as-a-body, recorded in `
       + `\`functionBody\`'s header.`);
    return null;
  }
  return { text, startLine: src.slice(0, start).split("\n").length };
}

/* THE REFUSAL OBJECT AROUND AN `ok: false`, by brace balance in both
 * directions.
 *
 * THIS REPLACED A FIXED 400-CHARACTER WINDOW, and the fixed window is recorded
 * rather than quietly dropped because it FAILED IN THE GENEROUS DIRECTION —
 * the one failure mode `VERIFICATION.md` exists to prevent. A codeless refusal
 * followed within 400 characters by a properly coded one read as coded: the
 * window ran past the end of its own statement and found the NEXT refusal's
 * code. Arm 3 of `test/refusal-codes.test.mjs` is that fixture, and it was RED
 * on the first run of this file's own suite. A refusal is an object literal;
 * its bounds are its braces and nothing else. */
/* ---------------------------------------------------------------------------
 * THE OUTCOME WALK (REC-76 / D-236) — three small readers, and every one of
 * them is about SHAPE rather than about a field name.
 *
 * `outcomeReturns`  — the CORPUS: every object literal in RETURN POSITION.
 * `topLevelProps`   — its depth-0 `key: value` pairs, strings and comments skipped.
 * `verdictOf`       — the FIRST boolean-shaped one, which is the verdict.
 * ------------------------------------------------------------------------ */

/* Skip a quoted string starting at `i`; returns the index of its closing quote. */
function skipString(text, i) {
  const q = text[i];
  for (let j = i + 1; j < text.length; j++) {
    if (text[j] === "\\") { j++; continue; }
    if (text[j] === q) return j;
  }
  return text.length - 1;
}

/* The `}` matching the `{` at `open`, with strings and block comments skipped —
 * a brace inside a comment or a sentence is not a brace. */
function matchBrace(text, open) {
  let d = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(text, i); continue; }
    if (c === "/" && text[i + 1] === "*") { const j = text.indexOf(CLOSE_COMMENT, i + 2); i = j < 0 ? text.length : j + 1; continue; }
    if (c === "{") d++;
    else if (c === "}") { d--; if (!d) return i; }
  }
  return -1;
}

/* RETURN POSITION, and the two forms the plane actually writes:
 *   return { … }            — including `return (\n  { … })`
 *   return cond ? { … } : { … }   — both branches are outcomes
 * An object literal handed to a HELPER (`refusal("CODE", detail, { … })`) is an
 * ARGUMENT and not an outcome; it is deliberately outside this corpus, because
 * grading detail objects is exactly the over-strictness that would flood the
 * guard with false sites. The helper's own call is judged separately below.
 * MEASURED before that decision: taking every object literal in the span instead
 * graded FIVE detail objects at real governed sites as refusals.
 *
 * THE BOUNDS ARE THE OBJECT'S OWN BRACES, and the receipt is kept from the
 * `objectLiteralAround` reader this replaced — which itself replaced a FIXED
 * 400-CHARACTER WINDOW that failed in the GENEROUS direction: a codeless refusal
 * followed within 400 characters by a properly coded one read as coded, because
 * the window ran past the end of its own statement and found the NEXT refusal's
 * code. Arm 3 of `test/refusal-codes.test.mjs` is that fixture and it was RED on
 * the first run of this file's own suite. */
function outcomeReturns(text) {
  const out = [];
  const seen = new Set();
  const push = (s, e) => { if (e > s && !seen.has(s)) { seen.add(s); out.push([s, e]); } };
  for (const m of text.matchAll(/\breturn\b/g)) {
    /* the direct form: only whitespace and opening parens may sit in front.
       `lead` is how many of those parens there were, and it is what the
       conditional reader below measures its own depth against. */
    let lead = 0;
    for (let i = m.index + 6; i < text.length; i++) {
      const c = text[i];
      if (/\s/.test(c)) continue;
      if (c === "(") { lead++; continue; }
      if (c === "{") { const e = matchBrace(text, i); if (e > 0) push(i, e); }
      break;
    }
    /* the conditional form: `return cond ? { … } : { … }` — both branches are
       outcomes. THE DEPTH TEST IS LOAD-BEARING and was added after measuring
       what its absence cost: without it, a `pair ? { … } : null` sitting inside
       a DETAIL ARGUMENT four calls deep was read as a returned branch and
       reported as an outcome the walk could not classify. A branch of the
       returned expression sits at the return's OWN depth and nowhere else. */
    const seg = text.slice(m.index, Math.min(text.length, m.index + 6000));
    if (!/^return\s*[^;{]{0,240}\?/.test(seg)) continue;
    let d = 0;
    for (let k = 6; k < seg.length; k++) {
      const c = seg[k];
      if (c === '"' || c === "'" || c === "`") { k = skipString(seg, k); continue; }
      if (c === "(" || c === "[") { d++; continue; }
      if (c === ")" || c === "]") { d--; continue; }
      if (c === ";" && d <= lead) break;
      if (c === "{" && d === lead && /[?:]\s*$/.test(seg.slice(Math.max(0, k - 40), k))) {
        const e = matchBrace(seg, k);
        if (e > 0) { push(m.index + k, m.index + e); k = e; }
      }
    }
  }
  return out.sort((a, b) => a[0] - b[0]);
}

/* The depth-0 `key: value` pairs of an object literal. Strings, block comments
 * and line comments are skipped, so a `,` or a `:` inside a member-facing
 * sentence — and this plane's refusals are full of them — does not split a
 * property. */
function topLevelProps(objText) {
  const parts = [];
  let buf = "", depth = 0;
  for (let i = 1; i < objText.length - 1; i++) {
    const c = objText[i];
    if (c === '"' || c === "'" || c === "`") { const j = skipString(objText, i); buf += objText.slice(i, j + 1); i = j; continue; }
    if (c === "/" && objText[i + 1] === "*") { const j = objText.indexOf(CLOSE_COMMENT, i + 2); i = j < 0 ? objText.length : j + 1; continue; }
    if (c === "/" && objText[i + 1] === "/") { const j = objText.indexOf("\n", i); i = j < 0 ? objText.length : j; continue; }
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    if (c === "," && depth === 0) { parts.push(buf); buf = ""; continue; }
    buf += c;
  }
  parts.push(buf);
  const props = [];
  for (const p of parts) {
    const m = /^\s*([A-Za-z_$][\w$]*)\s*:([\s\S]*)$/.exec(p);
    if (m) props.push({ key: m[1], value: m[2] });
  }
  return props;
}

/* IS THIS VALUE BOOLEAN-SHAPED? The two literals, or an expression whose DEPTH-0
 * operator is one the LANGUAGE guarantees produces a boolean. That distinction is
 * the whole reason this is not a list that goes stale: `ok`, `started`, `found`,
 * `proposed`, `preview` are five field names in this plane and there will be a
 * sixth next week, but the set of boolean-producing operators is fixed by
 * JavaScript's grammar and cannot grow when somebody writes a new refusal.
 * `=>` is excluded explicitly — an arrow is not a comparison, and reading one as
 * a verdict is how the first draft of this walk graded five detail objects. */
function verdictKind(value) {
  const s = value.trim();
  if (s === "true") return "true";
  if (s === "false") return "false";
  if (/^!/.test(s)) return "expr";
  if (/^Boolean\s*\(/.test(s)) return "expr";
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(s, i); continue; }
    if (c === "(" || c === "[" || c === "{") { d++; continue; }
    if (c === ")" || c === "]" || c === "}") { d--; continue; }
    if (d) continue;
    if (c === "=" && s[i + 1] === ">") { i++; continue; }
    if ((c === "=" || c === "!") && s[i + 1] === "=") return "expr";
    if ((c === "<" || c === ">") && s[i - 1] !== "=" && s[i + 1] !== "=") return "expr";
  }
  return null;
}

/* THE VERDICT IS THE FIRST BOOLEAN-SHAPED TOP-LEVEL PROPERTY, and that ordering
 * is load-bearing rather than incidental: `{ ok: false, terminal: true }` is a
 * refusal carrying a datum, and reading ANY `true` as a success would have
 * un-judged seven of `#captureRequestConduct`'s refusals that the old one-literal
 * matcher did judge. Measured over all 60 governed sites when this landed: no
 * outcome leads with a datum. */
function verdictOf(objText) {
  for (const p of topLevelProps(objText)) {
    const kind = verdictKind(p.value);
    if (kind) return { key: p.key, kind };
  }
  return null;
}

/* The body of a top-level `function NAME(` / `NAME(` method.
 *
 * THE PARAMETER LIST HAS BRACES TOO, and the first draft of this walked to the
 * first `{` after the name — which for `meaningRows(input = {}) {` is the
 * DEFAULT VALUE and for `versionChain({ addressNorm = null, … }) {` is the
 * DESTRUCTURING PATTERN. `meaningRows` failed loudly (its `{}` balances in two
 * characters, under the length guard); `versionChain` did NOT — its pattern is
 * long enough to look like a body, so arm C judged a parameter list, found no
 * refusals in it, and reported green. **That is this guard's own version of the
 * defect it was written to catch**, and it is recorded rather than quietly
 * fixed: an instrument is the most likely thing to be wrong.
 *
 * So: balance the PARENS from the declaration's `(` to its match, and only then
 * take the body's `{`. Arm C prints the line count of every body it read, so a
 * body that collapses to a parameter list is visible in the output instead of
 * being inferred from a green run. */
function functionBody(src, fn) {
  const esc = fn.replace(/[$]/g, "\\$");
  const re = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:async\\s+)?(?:function\\s+)?${esc}\\s*\\(`, "g");
  for (const m of src.matchAll(re)) {
    const lparen = src.indexOf("(", m.index + m[0].length - 2);
    if (lparen < 0) continue;
    let pd = 0, j = lparen;
    for (; j < src.length; j++) {
      if (src[j] === "(") pd++;
      else if (src[j] === ")") { pd--; if (!pd) break; }
    }
    if (pd) continue;
    /* Only whitespace may sit between `)` and the body's `{`. Anything else —
       `=>`, a `;`, an argument — means this match was a CALL, not a
       declaration, and the next match is the one wanted. */
    let open = j + 1;
    while (open < src.length && /\s/.test(src[open])) open++;
    if (src[open] !== "{") continue;
    let depth = 0, i = open;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") { depth--; if (!depth) break; }
    }
    if (depth) continue;
    const text = src.slice(open, i + 1);
    return { text, startLine: src.slice(0, open).split("\n").length };
  }
  return null;
}

/* ============================================================
   ARM D — the SURFACE's translation tables, proved TOTAL
   ============================================================ */

/* A surface table is licensed by DEC-49 only while it is TOTAL over what its
   producer can mint: the render site falls back to printing the raw code, so a
   table with a hole IS an untranslated code reaching a member.

   THE TABLE→PRODUCER PAIRING, on `check-mock-envelope.mjs`'s FLAT_OPS
   precedent: each line is the EVIDENCE, so the pairing can be re-checked
   without re-deriving it. It lives here rather than as a marker in `app.html`
   because this guard is VF-2's and `app.html` is UI's — VF-2 opened no line of
   it. A table found in `app.html` with no line here FAILS rather than being
   skipped, so the list cannot become a place to make an inconvenient table
   disappear: the only way past this arm is to pair the table with a producer
   and be total over it. */
const TABLE_PRODUCERS = new Map(Object.entries({
  /* `man.subresources[].reason` — every row the surface lists under "Still to be
     collected" is minted in `subresources.mjs`'s record builder, including the
     two the narrow matcher could not see:
       r = { ok:false, status:0, reason: platform ? "PLATFORM_LIMIT" : "FETCH_FAILED", … }
     `cdx.mjs` mints four codes of its own (CDX_*) and NONE of them rides on a
     subresource record, so it is deliberately not this table's producer. */
  PART_REASON: "src/subresources.mjs",
}));

function armD() {
  const app = fs.readFileSync(APP, "utf8");
  const tables = [];

  /* Every code->wording map the surface holds, found by SHAPE rather than by
     name, so a second table cannot arrive unnoticed: a top-level `const NAME =
     {` whose keys are two or more SCREAMING_SNAKE codes the plane mints. */
  const census = planeCensus();
  const found = [];
  for (const m of app.matchAll(/\bconst\s+([A-Z_][A-Z0-9_]*)\s*=\s*\{/g)) {
    const open = app.indexOf("{", m.index);
    let depth = 0, i = open;
    for (; i < app.length; i++) { if (app[i] === "{") depth++; else if (app[i] === "}") { depth--; if (!depth) break; } }
    const bodyText = app.slice(open, i + 1);
    const keys = [...bodyText.matchAll(/(?:^|[{,\s])([A-Z][A-Z0-9_]{2,})\s*:/g)].map(x => x[1]);
    const minted = keys.filter(k => census.union.has(k));
    if (minted.length >= 2) found.push({ name: m[1], keys: new Set(keys), minted: new Set(minted) });
  }

  for (const t of found) {
    const producer = TABLE_PRODUCERS.get(t.name);
    if (!producer) {
      FAIL(`app.html holds a code-to-wording table \`${t.name}\` (${t.minted.size} of its ${t.keys.size} keys `
         + `are codes the plane mints) that TABLE_PRODUCERS does not pair with a producer. Pair it here, `
         + `with the evidence, so this guard can prove the table TOTAL against what that file can send. `
         + `A surface table that cannot be proved total is a table with a hole nobody is watching, and the `
         + `render site prints the raw code through the hole.`);
      continue;
    }
    const d = [null, t.name, producer];
    const prod = path.join(PLANE, producer);
    if (!fs.existsSync(prod)) { FAIL(`\`${t.name}\` is paired with producer ${producer}, which does not exist under bio-plane/.`); continue; }
    const psrc = fs.readFileSync(prod, "utf8");
    const mints = new Set();
    for (const fn of Object.values(MATCHERS)) for (const c of fn(psrc)) mints.add(c);

    const holes = [...mints].filter(c => !t.keys.has(c)).sort();
    if (holes.length)
      FAIL(`app.html's \`${t.name}\` has NO WORDING for ${holes.length} code(s) its producer ${d[2]} can `
         + `mint: ${holes.join(", ")}. The render site falls back to printing the code, so each of these `
         + `reaches a member as machine vocabulary. DEC-49: an untranslated code fails the harness instead.`);

    const dead = [...t.minted].filter(c => !mints.has(c)).sort();
    if (dead.length)
      NOTE(`arm D: \`${t.name}\` translates ${dead.length} code(s) ${d[2]} no longer mints (${dead.join(", ")}) — `
         + `wording with no producer. Not a failure: a code retired from the plane is exactly when the surface `
         + `should still know the word, because an older instance can still send it.`);

    tables.push({ name: t.name, producer: d[2], codes: t.keys, producerMints: mints });
    if (!mints.size)
      FAIL(`\`${t.name}\`'s producer ${d[2]} mints NO codes at all, so "total" is a claim about an empty `
         + `set — the walk over the producer went blind and the table would pass however many holes it had.`);
    NOTE(`arm D: \`${t.name}\` is TOTAL over ${d[2]} — ${mints.size} codes minted, ${t.keys.size} translated, `
       + `${holes.length} hole(s)`);
  }

  if (tables.length < FLOOR.surfaceTables)
    FAIL(`${tables.length} surface translation table(s) proved total, floor is ${FLOOR.surfaceTables}. `
       + `A table that stopped being FOUND is an arm that stopped running: this walk finds tables by `
       + `SHAPE (a const whose keys are codes the plane mints), so a table refactored out of that shape `
       + `disappears from the guard while its holes stay in front of members.`);
  return tables;
}

/* ============================================================
   ARM E — THE PLANE'S OWN VOCABULARY TEXTS
   ============================================================ */

/* DEC-49's SECOND CONDUCT INPUT (2026-08-07, from UI-47): **`src/airun.mjs`
   composes condition sentences and the running-session surface renders them
   VERBATIM**, so those strings are read by MEMBERS — *"when this entry's
   code-and-canned-translation rule is enacted it must cover `src/airun.mjs`'s
   vocabulary texts, not only `civicos-ui`."*
 *
 * A vocabulary here is already DEC-49's shape and nobody called it that: the KEY
 * is the machine word the record stores (`fetches`, `client-rendered-shell`,
 * `LOOKED_INDETERMINATE`) and the VALUE is the canned sentence a member reads
 * instead of it. So the same rule applies — a term with no text is a machine
 * word reaching a member — and the same guard can carry it.
 *
 * THE MODULES, with the evidence, on `check-mock-envelope.mjs`'s FLAT_OPS
 * precedent. Harvested BY SHAPE inside them (an exported plain object whose
 * values are ALL strings), never by name, so a vocabulary added to one of these
 * files is guarded the moment it lands. `RUN_STATUS = { running: 1, … }` is
 * excluded by that shape rather than by an exception: its values are not text,
 * so it is not a vocabulary a member reads. */
const VOCABULARY_MODULES = new Map(Object.entries({
  "src/airun.mjs":     "DEC-49's UI-47 input names this file: it composes the condition sentences the "
                     + "running-session surface renders VERBATIM (OBSERVATION_LEVELS, OBSERVATION_STATES, "
                     + "RUN_BOUNDS, RUN_ENDINGS)",
  "src/queuestate.mjs": "airun.mjs's checkCondition takes the condition vocabulary LIVE from here rather "
                     + "than copying it (C-22.4), so these texts are the ones a stopped run explains "
                     + "itself with — QUEUE_CONDITION_KINDS and its siblings, plus MUTE_REFUSAL_DETAIL, "
                     + "which is a member-facing refusal sentence already",
}));

async function armE() {
  let vocabularies = 0, terms = 0;
  const seen = [];
  for (const [rel, why] of VOCABULARY_MODULES) {
    const full = path.join(PLANE, rel);
    if (!fs.existsSync(full)) { FAIL(`arm E: ${rel} does not exist under bio-plane/ — a vocabulary module named with the evidence "${why}" that is not there is an arm that stopped running.`); continue; }
    const mod = await import("file://" + full);
    for (const [name, v] of Object.entries(mod)) {
      if (!v || typeof v !== "object" || Array.isArray(v)) continue;
      const entries = Object.entries(v);
      if (!entries.length) continue;
      if (!entries.every(([, x]) => typeof x === "string")) continue;   // not a TEXT vocabulary
      if (/_CHECKS$/.test(name)) continue;                              // arm A's, judged there
      vocabularies++;
      for (const [term, text] of entries) {
        terms++;
        if (!text.trim())
          FAIL(`${rel}'s \`${name}.${term}\` has NO TEXT. This vocabulary's values are what a surface `
             + `renders VERBATIM in place of the machine word (DEC-49's UI-47 input), so an empty one `
             + `puts \`${term}\` itself in front of a member.`);
        /* A WORD COUNT, NOT A CHARACTER COUNT, and the difference was measured
           rather than reasoned about: the first draft of this arm used 20
           characters and failed `RUN_ENDINGS.cancelled` — *"a member stopped
           it"*, 19 characters, which is a complete, accurate, member-readable
           sentence and exactly the kind of good short wording an over-strict
           guard gets switched off for. What actually distinguishes a text from
           a placeholder is that it is a PHRASE rather than a token. */
        else if (text.trim().split(/\s+/).length < 3)
          FAIL(`${rel}'s \`${name}.${term}\` reads ${JSON.stringify(text)} — that is a token, not the `
             + `phrase a member reads instead of the term. DEC-49's rule reaches these texts too.`);
        else if (text.trim() === term)
          FAIL(`${rel}'s \`${name}.${term}\` restates its own key. A vocabulary whose text is the machine `
             + `word is the member decoding it anyway.`);
      }
      seen.push(`${name}(${entries.length})`);
    }
  }
  if (vocabularies < FLOOR.vocabularies || terms < FLOOR.vocabularyTerms)
    FAIL(`arm E found ${vocabularies} vocabularies / ${terms} terms, floors are ${FLOOR.vocabularies}/`
       + `${FLOOR.vocabularyTerms}. THE WALK LOST SIGHT: it finds vocabularies by SHAPE (an exported plain `
       + `object whose values are all strings), so one refactored out of that shape leaves the guard `
       + `silently while its texts stay in front of members.`);
  NOTE(`arm E: the PLANE's own vocabulary texts — ${vocabularies} vocabularies, ${terms} terms across `
     + `${VOCABULARY_MODULES.size} modules, every term carrying the sentence a member reads instead of it `
     + `· ${seen.join(" ")} · floors ${FLOOR.vocabularies}/${FLOOR.vocabularyTerms}`);
}

/* ============================================================ */

const families = await dec49Families();
for (const [, table] of families) for (const c of Object.keys(table)) FAMILY_CODES.add(c);

const census = planeCensus();
for (const [name, set] of Object.entries(census.yields))
  NOTE(`walk: ${name.padEnd(20)} ${String(set.size).padStart(4)} codes`);
NOTE(`walk: ${"UNION (the census)".padEnd(20)} ${String(census.union.size).padStart(4)} codes over ${census.files} files in bio-plane/src`
   + ` · ${census.unionRepro.size} of them from the ${census.filesRepro} file(s) ${HEAD_SAYS} · floor ${FLOOR.census}`);
/* THE FLOOR IS COMPARED AGAINST THE REPRODUCIBLE CENSUS (D-257), and that is the
   figure to move this table to. A floor moved to a contaminated run's number is
   permanently too high — the payload D-238 names. */
if (census.unionRepro.size < FLOOR.census)
  FAIL(`the plane census is ${census.unionRepro.size} refusal codes that are in the commit at HEAD `
     + `(${census.union.size} over the working tree), floor is ${FLOOR.census}. The WALK lost `
     + `sight — read the per-matcher line above to see which spelling stopped yielding. This is REC-70's `
     + `failure exactly, and a ceiling alone would have stayed green through it.`);

const surfaceTables = armD();
const rows = armA(families);
const { reach, translated, gap } = armB(rows, census, surfaceTables);
armC(rows);
await armE();

/* THE CENSUS GAP — reported, not gated, and the reason is in the header. This
   is the number REC-64's sweep closes, and it is stated exactly rather than
   estimated, because an unmeasured answer is not a result. */
const ungoverned = [...census.union].filter(c => !translated.has(c)).sort();
NOTE(`census gap (REPORTED, not gated — see header): ${ungoverned.length} of ${census.union.size} refusal codes `
   + `the plane can mint have NO canned translation and are NOT in reach of a surface today. That is REC-64's `
   + `remaining sweep. ${census.union.size - ungoverned.length} are translated.`);

for (const n of notes) console.log("  " + n);
if (fails.length) {
  for (const f of fails) console.error("FAIL: " + f);
  console.error(`check-refusal-codes: ${fails.length} failure${fails.length === 1 ? "" : "s"} — DEC-49's guard is `
    + `not optional: an untranslated code must FAIL THE HARNESS rather than reach a member.`);
  process.exit(1);
}
console.log(`check-refusal-codes: every code a surface can receive carries a canned translation `
  + `(${reach.size} in reach, ${rows.length} plane rows, ${surfaceTables.length} surface table(s) proved total)`);
