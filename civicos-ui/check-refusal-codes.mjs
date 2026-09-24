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
/* D-254 — REC-76's VERDICT READER HAS ONE HOME, AND THIS GUARD IMPORTS IT FROM THERE. The eight
   functions arm C reads outcomes with lived in THIS file until 2026-09-21, and a byte-identical copy
   of them lived in `bio-plane/test/verdict-reader.mjs` so two plane instruments could share them
   (D-240) — because this file is a script that runs at the top level and ends in `process.exit`,
   so nothing could import it. The dependency now points the other way: the reader has no side
   effects, this guard imports it, and the copy that lived here is gone. ALL EIGHT names are bound
   although arm C calls three, and that is deliberate: a same-name copy grown back beside this
   import (a stale merge, a revert) is then a LOAD error rather than a quiet second reader, and
   the plane's pin (`readerDrift`, asserted by `meaning-bounds.test.mjs` and
   `plane-envelope.test.mjs`) fails naming any name this import stops binding or this file starts
   declaring. The reader's reasoning moved with it; read it THERE before changing how arm C reads a
   verdict, because a change there changes three instruments at once. */
import { skipString, matchBrace, outcomeReturns, topLevelParts, topLevelProps, topLevelSpreads,
         verdictKind, verdictOf } from "../bio-plane/test/verdict-reader.mjs";
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
/* M0-79 — EVERY FIGURE A RATCHET KEY GATES IS RECORDED WHERE IT IS COMPARED, so the
   slack arm at the foot judges the SAME number the floor or ceiling judged, and a key
   whose figure nobody recorded is a named failure rather than a gate that silently
   has nothing to compare. `value` is the figure the ratchet is pinned to and the only
   one it may be moved to; `working` is the working-tree figure where the guard
   distinguishes one (D-257), printed beside it and never gated on. */
const MEASURED = new Map();
const MEASURE = (key, value, what, working = value) => {
  const prior = MEASURED.get(key);
  if (prior && prior.value !== value)
    FAIL(`RATCHET COVERAGE — \`${key}\` was recorded TWICE, as ${prior.value} and as ${value}. One ratchet key `
       + `is one figure; two readings under one name is the defect a shared unqualified name always is.`);
  MEASURED.set(key, { value, what, working });
};

/* ============================================================
   THE RATCHET — measured 2026-08-07 in worktree agent-a12a5d578497244e9,
   by this file. Every one is a FLOOR: the guard fails when its reach
   SHRINKS, which is the half a ceiling alone cannot see (REC-70).
   A figure that GROWS is fine and the delta is named in the output; the
   grown rows still have to pass every arm, so growth cannot arrive
   unguarded.

   CORRECTED 2026-09-21 by M0-79, never exempted, and the correction is the
   item: "a figure that GROWS is fine" was this guard's rule for seven weeks,
   and it is how four floors came to sit 11 to 46 below their measurement
   (`outcomeReturns` 98 against 127, `vocabularies` 11 against 22,
   `vocabularyTerms` 64 against 110, `untranslated` 270 against 297) while
   every run PRINTED the gap and exited 0. The sentence was right that growth
   arrives guarded — the grown rows still pass every arm — and wrong about the
   FLOOR, which growth leaves behind as slack. Growth is still legitimate; its
   floor moves IN THE SAME COMMIT, and the guard now FAILS on slack beyond the
   bound `SLACK` (below `CEILING`) states for each key — zero for every key but
   one, whose exemption is argued there. `SLACK` must name every FLOOR and
   CEILING key, or the guard fails naming the one it does not.
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
  /* ================================================================== *
   * TWELVE FLOORS MOVED IN ONE TURN, 2026-09-10 by D-309 (worktree
   * agent-a26bce57cd13e5ea5), EVERY ONE FROM THE FIGURE THIS GUARD PRINTED ON
   * ITS OWN GREEN RUN (exit 0) and never by adding to the number that was here.
   *
   * WHY THEY MOVED: D-309 enacted DEC-72 clause 6 and minted ONE new DEC-49
   * family — CASE_DERIVATION_CHECKS, one row, C-44.1 — inside ONE new narrowed
   * region, publishCase > case-identity-derivation. C-22's header states the tax
   * that charges: *"a new `*_CHECKS` family is a floor in
   * civicos-ui/check-refusal-codes.mjs that buys slack for everybody else's walk
   * unless it is moved in the same turn"*. It is moved in the same turn.
   *
   * **THE SPLIT IS MEASURED RATHER THAN ASSERTED, AND MOST OF IT IS NOT THIS
   * ITEM'S.** Each figure below carries three numbers: the floor that was here,
   * what the PRISTINE tree printed, and what this item's tree printed. The
   * pristine figures were taken by reverting `src/store.mjs`, `src/index.mjs`
   * and `checks/bio-checks.mjs` to HEAD, re-running this guard (exit 0), and
   * restoring all three verified by `cmp`. D-309's own delta is +1 family,
   * +1 row, +1 reach, +1 governed site, +1 region, +18 region lines,
   * +2 codes checked, +2 refusals judged, and -1 untranslated. **Everything
   * else in these moves was ALREADY STALE before this item touched anything** —
   * the census sat 28 low, rows and reach 8 low, regionLines 83 low.
   *
   * That makes D-309 the SEVENTH item in a row to find a floor already stale by
   * measuring it, which is this file's own argument arriving again: a floor with
   * slack is not a ratchet, and one that is not a ratchet has already flipped a
   * control from RED to GREEN once in this repository.
   *
   * `bodyLines` is NOT moved — it is the one figure here deliberately not
   * ratcheted (see its own note). `reachGap` is NOT moved: it is a CEILING that
   * may only FALL, and it printed 40 on BOTH trees, sitting exactly at it. The
   * new code arrives TRANSLATED, so it never enters the gap.
   * ================================================================== */
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
  /* MOVED AT INTEGRATION 2026-08-09 by CONDUCT to the figures the guard PRINTED on the
     MERGED tree. REC-64's sweep predicted its own `regionLines` would be wrong here and it
     was — it measured 1527, the merge reads 1556. Thirteen floors collided and NOT ONE was
     resolvable by taking a side, which is what that item said when it filed the delegation. */
  /* D-309 2026-09-10: 17 -> 19. pristine tree printed 18, this item's 19 — so 1 of this move was PRE-EXISTING SLACK and 1 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): families 19 -> 20. PRISTINE `origin/main` at 9a713f1 printed 20, this item's tree 20 — so 1 of this move was PRE-EXISTING SLACK and 0 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): families 20 -> 22. PRISTINE `origin/main` at 173bc66 printed 22, this item's committed tree (2e5d21f) 22 — so 2 of this move was PRE-EXISTING SLACK and 0 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 38 -> 39 from this guard's own print on the item's tree over origin/main 02603e88: one new family, QUOTE_CHECKS (C-72). ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 38. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 38 -> 39 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — one new family, GOVERNING_LAW_CHECKS (C-73). */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 38 -> 39 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. one new family, CONNECTION_CHOICE_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 38 -> 39 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +1 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 43 -> 44 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 38 -> 40 from this guard's own print on the item's tree — +2 families: PER_ITEM_CHECKS (C-75) and TASK_ACTOR_CHECKS (C-76). */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 38 -> 39 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 41 -> 42 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 41, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 38 -> 39 from this guard's own print on the item's tree over origin/main 02603e88: one new family, PARTITION_INDEPENDENCE_CHECKS. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 38, every key gated at slack 0. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 38 -> 40 from this guard's own print on the item's tree, every other ratchet key gated. two new families, INSTALLATION_CHECKS (C-68) and DISPATCH_CHECKS (C-69). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 37 -> 38 from this guard's own print on the item's tree, every other ratchet key gated. One new family, SURFACE_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 36 -> 37 from this guard's own print on the item's tree, every other ratchet key gated. One new family, CASE_CONCLUSION_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 35 -> 36 from this guard's own GREEN print on the item's committed tree 2f09b7b6. One new family, INSTANCE_GROUP_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 34 -> 35 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 34, so 0 of the move is PRE-EXISTING SLACK and +1 is this item's (one new family, SIGNER_ENROLMENT_CHECKS). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 23 -> 34 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 33, so 10 of the move is PRE-EXISTING SLACK and +1 is this item's (one new family, REQUIRED_ARGUMENT_CHECKS). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 22 -> 23 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 22, so 0 of the move is PRE-EXISTING slack and +1 (NARROW_CHECKS) is this item's. */ // + AI_RUNS_CONTEXT_CHECKS (REC-69, C-36 — the context-keyed run list).
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 41 -> 42 from this guard's own print on the item's tree, every other ratchet key gated. One new family, THEME_CHECKS. ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 41 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 38 -> 39 from this guard's own print on the item's tree over origin/main 02603e88: one new family, PARTITION_INDEPENDENCE_CHECKS. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 38, every key gated at slack 0. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 38 -> 40 from this guard's own print on the item's tree, every other ratchet key gated. two new families, INSTALLATION_CHECKS (C-68) and DISPATCH_CHECKS (C-69). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 37 -> 38 from this guard's own print on the item's tree, every other ratchet key gated. One new family, SURFACE_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 36 -> 37 from this guard's own print on the item's tree, every other ratchet key gated. One new family, CASE_CONCLUSION_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 35 -> 36 from this guard's own GREEN print on the item's committed tree 2f09b7b6. One new family, INSTANCE_GROUP_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 34 -> 35 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 34, so 0 of the move is PRE-EXISTING SLACK and +1 is this item's (one new family, SIGNER_ENROLMENT_CHECKS). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 23 -> 34 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 33, so 10 of the move is PRE-EXISTING SLACK and +1 is this item's (one new family, REQUIRED_ARGUMENT_CHECKS). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 22 -> 23 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 22, so 0 of the move is PRE-EXISTING slack and +1 (NARROW_CHECKS) is this item's. */ // + AI_RUNS_CONTEXT_CHECKS (REC-69, C-36 — the context-keyed run list).
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  families: 51, /* c19-unionfix (c19-batch9, 2026-09-24): 50 -> 51, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 47 -> 48 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 45 -> 47 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 44 -> 45 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 43 -> 44 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 42 -> 43 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 41 -> 42 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 38 -> 39 from this guard's own print on the item's tree over origin/main 02603e88: one new family, PARTITION_INDEPENDENCE_CHECKS. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 38, every key gated at slack 0. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 38 -> 40 from this guard's own print on the item's tree, every other ratchet key gated. two new families, INSTALLATION_CHECKS (C-68) and DISPATCH_CHECKS (C-69). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 37 -> 38 from this guard's own print on the item's tree, every other ratchet key gated. One new family, SURFACE_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 36 -> 37 from this guard's own print on the item's tree, every other ratchet key gated. One new family, CASE_CONCLUSION_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 35 -> 36 from this guard's own GREEN print on the item's committed tree 2f09b7b6. One new family, INSTANCE_GROUP_CHECKS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 34 -> 35 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 34, so 0 of the move is PRE-EXISTING SLACK and +1 is this item's (one new family, SIGNER_ENROLMENT_CHECKS). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 23 -> 34 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 33, so 10 of the move is PRE-EXISTING SLACK and +1 is this item's (one new family, REQUIRED_ARGUMENT_CHECKS). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 22 -> 23 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 22, so 0 of the move is PRE-EXISTING slack and +1 (NARROW_CHECKS) is this item's. */ // + AI_RUNS_CONTEXT_CHECKS (REC-69, C-36 — the context-keyed run list).
  /* ================================================================== *
   * TEN FLOORS AND ONE CEILING MOVED IN ONE TURN, 2026-08-09 by REC-79, EVERY
   * ONE FROM THE FIGURE THIS GUARD PRINTED ON A GREEN RUN of its own worktree.
   * They moved because `ADMISSION_CHECKS` (C-38) landed — the control plane's
   * admission gate, six refusals, FOUR OF WHICH HAD NO CODE AT ALL — and
   * because the outcome reader was widened to see `return json({ … }, 403)`.
   * Every figure below is this item's OWN delta and nothing else: measured on a
   * quiet tree, with the baseline re-run rather than subtracted from.
   * ================================================================== */
                       // + AI_RUNS_CONTEXT_CHECKS (REC-69, C-36 — the context-keyed run list).
                       // + ROUTE_MARK_CHECKS (REC-63);
                       // + MACHINE_FENCE_CHECKS + ACT_SHAPE_CHECKS (REC-64); + QUEUE_MINT_CHECKS (PL-15);
                       // + AI_CREDENTIAL_CHECKS (PL-11) + VERSION_STRENGTH_CHECKS (PL-14).
                       // Was 15 at REC-63, 11 at PL-15, 8 at PL-4, 7 at PL-3, 6 pre-PL-3 while the floor said 5.
                       /* C-22's own header states the tax this line charges: *"a new `*_CHECKS`
                          family is a floor in `civicos-ui/check-refusal-codes.mjs` that buys slack
                          for everybody else's walk unless it is moved in the same turn"*. It is
                          moved in the same turn — for the SECOND time, the first having been
                          dropped by the merge. */
  /* D-309 2026-09-10: 176 -> 185. pristine tree printed 184, this item's 185 — so 8 of this move was PRE-EXISTING SLACK and 1 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): rows 185 -> 191. PRISTINE `origin/main` at 9a713f1 printed 189, this item's tree 191 — so 4 of this move was PRE-EXISTING SLACK and 2 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): rows 191 -> 205. PRISTINE `origin/main` at 173bc66 printed 201, this item's committed tree (2e5d21f) 205 — so 10 of this move was PRE-EXISTING SLACK and 4 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 291 -> 292 from this guard's own print on the item's tree, every other ratchet key gated. Its one row, C-65.1 CASE_CONCLUSION_MOVED. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* [CONDUCT #14 at REC-167's merge onto REC-165's main] 2026-09-22: RE-READ from this guard's own print on the COMMITTED merge — measured 294 (REC-165 and REC-167 each moved this key from the same base, so neither side's figure is the sum). Never added by hand. */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 309 -> 313 from this guard's own print on the item's tree: the four new rows C-64.4..C-64.7 in INSTANCE_GROUP_CHECKS. ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 309 -> 317 from this guard's own print on the item's tree over origin/main 02603e88: eight new rows, C-72.1..C-72.8. ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 309. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 309 -> 315 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — C-32.18 MACHINE_CANNOT_SET_LAWS and C-73.1-5. */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 309 -> 312 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. three new rows, C-74.1/C-74.2/C-74.3. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 309 -> 313 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +4 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 340 -> 344 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 309 -> 315 from this guard's own print on the item's tree — +6 rows: C-75.1..5 and C-76.1. */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 309 -> 312 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 322 -> 323 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 322, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 309 -> 316 from this guard's own print on the item's tree over origin/main 02603e88: its seven rows, C-71.1..C-71.7. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 309, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 305 -> 306 from this guard's own print on the item's tree: the one new row, C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE in TESTIMONY_CHECKS. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 305 -> 310 from this guard's own print on the item's tree, every other ratchet key gated. five new rows: C-68.1-.4 and C-69.1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 302 -> 303 from this guard's own print on the item's tree: the one new row, C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 302, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 303 -> 304 from this guard's own print on the merged tree: the one new row, C-22.16. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 303 -> 304 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 303. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 303 -> 304 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. One new row, C-45.12. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11 CONTENT_EXTENT_NOT_A_CONTAINER, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054 (which carries REC-175's moves from the same base): MOVED 303 -> 304 from this guard's own print on the merged tree, every other ratchet key gated. The one new row. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 301 -> 302 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new row, C-33.38. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (C-22.15 AI_RUN_BOUND_UNKNOWN in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad79857cb007927b7): MOVED 300 -> 301 from this guard's own print on the item's tree: the one new row. ZERO pre-existing slack — the pristine HEAD (91913d6b) sources printed 300, every key gated.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 300 -> 301 from this guard's own print on the merged tree, every other ratchet key gated. One new row, C-44.2. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 298 -> 300 from this guard's own print on the item's tree: the two new AI_RUN_CHECKS rows. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 294 -> 298 from this guard's own print on the item's tree, every other ratchet key gated. Its four rows, C-66.1..C-66.4 (SURFACE_NO_RUN, SURFACE_RUN_NOT_RUNNING, SURFACE_NO_BOUND, SURFACE_BOUND_REACHED). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (C-27.18 SUGGEST_RUN_NOT_RUNNING, C-27.19 SUGGEST_OUTSIDE_RUN_CONTEXT, 2026-09-22, worktree agent-a6e92d28647553f52): MOVED 291 -> 293 from this guard's own print on the item's tree. Every floor here is gated at slack 0 (M0-79), so main measured 291 and the +2 is this item's two rows. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 288 -> 291 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Its three rows, C-64.1 to C-64.3. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 285 -> 288 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 286, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (C-63.1 SIGNER_MEMBER_NOT_ENROLLED and C-63.2 SIGNER_MEMBER_NOT_ACTIVE). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 219 -> 285 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 282, so 63 of the move is PRE-EXISTING SLACK and +3 is this item's (C-38.7, C-38.8, C-61.1). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 205 -> 219 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 208, so 3 of the move is PRE-EXISTING slack and +11 (C-50.1..11) is this item's. */ /* MOVED 174 -> 176, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), READ */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 322 -> 332 from this guard's own print on the item's tree, every other ratchet key gated. Ten new rows, C-74.1..C-74.10. ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 322 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 309 -> 316 from this guard's own print on the item's tree over origin/main 02603e88: its seven rows, C-71.1..C-71.7. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 309, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 305 -> 306 from this guard's own print on the item's tree: the one new row, C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE in TESTIMONY_CHECKS. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 305 -> 310 from this guard's own print on the item's tree, every other ratchet key gated. five new rows: C-68.1-.4 and C-69.1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 302 -> 303 from this guard's own print on the item's tree: the one new row, C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 302, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 303 -> 304 from this guard's own print on the merged tree: the one new row, C-22.16. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 303 -> 304 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 303. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 303 -> 304 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. One new row, C-45.12. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11 CONTENT_EXTENT_NOT_A_CONTAINER, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054 (which carries REC-175's moves from the same base): MOVED 303 -> 304 from this guard's own print on the merged tree, every other ratchet key gated. The one new row. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 301 -> 302 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new row, C-33.38. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (C-22.15 AI_RUN_BOUND_UNKNOWN in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad79857cb007927b7): MOVED 300 -> 301 from this guard's own print on the item's tree: the one new row. ZERO pre-existing slack — the pristine HEAD (91913d6b) sources printed 300, every key gated.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 300 -> 301 from this guard's own print on the merged tree, every other ratchet key gated. One new row, C-44.2. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 298 -> 300 from this guard's own print on the item's tree: the two new AI_RUN_CHECKS rows. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 294 -> 298 from this guard's own print on the item's tree, every other ratchet key gated. Its four rows, C-66.1..C-66.4 (SURFACE_NO_RUN, SURFACE_RUN_NOT_RUNNING, SURFACE_NO_BOUND, SURFACE_BOUND_REACHED). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (C-27.18 SUGGEST_RUN_NOT_RUNNING, C-27.19 SUGGEST_OUTSIDE_RUN_CONTEXT, 2026-09-22, worktree agent-a6e92d28647553f52): MOVED 291 -> 293 from this guard's own print on the item's tree. Every floor here is gated at slack 0 (M0-79), so main measured 291 and the +2 is this item's two rows. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 288 -> 291 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Its three rows, C-64.1 to C-64.3. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 285 -> 288 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 286, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (C-63.1 SIGNER_MEMBER_NOT_ENROLLED and C-63.2 SIGNER_MEMBER_NOT_ACTIVE). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 219 -> 285 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 282, so 63 of the move is PRE-EXISTING SLACK and +3 is this item's (C-38.7, C-38.8, C-61.1). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 205 -> 219 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 208, so 3 of the move is PRE-EXISTING slack and +11 (C-50.1..11) is this item's. */ /* MOVED 174 -> 176, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), READ */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  rows: 370, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): MOVED 368 -> 370 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. the two new ACT_SHAPE_CHECKS rows. */ /* c19-unionfix (c19-batch9, 2026-09-24): 367 -> 368, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 353 -> 356 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 347 -> 353 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 343 -> 347 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 340 -> 343 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 334 -> 340 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 326 -> 334 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 322 -> 326 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 309 -> 316 from this guard's own print on the item's tree over origin/main 02603e88: its seven rows, C-71.1..C-71.7. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 309, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 305 -> 306 from this guard's own print on the item's tree: the one new row, C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE in TESTIMONY_CHECKS. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 305 -> 310 from this guard's own print on the item's tree, every other ratchet key gated. five new rows: C-68.1-.4 and C-69.1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 302 -> 303 from this guard's own print on the item's tree: the one new row, C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 302, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 303 -> 304 from this guard's own print on the merged tree: the one new row, C-22.16. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 303 -> 304 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 303. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 303 -> 304 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. One new row, C-45.12. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11 CONTENT_EXTENT_NOT_A_CONTAINER, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054 (which carries REC-175's moves from the same base): MOVED 303 -> 304 from this guard's own print on the merged tree, every other ratchet key gated. The one new row. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 301 -> 302 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new row, C-33.38. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (C-22.15 AI_RUN_BOUND_UNKNOWN in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad79857cb007927b7): MOVED 300 -> 301 from this guard's own print on the item's tree: the one new row. ZERO pre-existing slack — the pristine HEAD (91913d6b) sources printed 300, every key gated.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 300 -> 301 from this guard's own print on the merged tree, every other ratchet key gated. One new row, C-44.2. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 298 -> 300 from this guard's own print on the item's tree: the two new AI_RUN_CHECKS rows. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 294 -> 298 from this guard's own print on the item's tree, every other ratchet key gated. Its four rows, C-66.1..C-66.4 (SURFACE_NO_RUN, SURFACE_RUN_NOT_RUNNING, SURFACE_NO_BOUND, SURFACE_BOUND_REACHED). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (C-27.18 SUGGEST_RUN_NOT_RUNNING, C-27.19 SUGGEST_OUTSIDE_RUN_CONTEXT, 2026-09-22, worktree agent-a6e92d28647553f52): MOVED 291 -> 293 from this guard's own print on the item's tree. Every floor here is gated at slack 0 (M0-79), so main measured 291 and the +2 is this item's two rows. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 288 -> 291 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Its three rows, C-64.1 to C-64.3. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 285 -> 288 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 286, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (C-63.1 SIGNER_MEMBER_NOT_ENROLLED and C-63.2 SIGNER_MEMBER_NOT_ACTIVE). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 219 -> 285 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 282, so 63 of the move is PRE-EXISTING SLACK and +3 is this item's (C-38.7, C-38.8, C-61.1). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 205 -> 219 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 208, so 3 of the move is PRE-EXISTING slack and +11 (C-50.1..11) is this item's. */ /* MOVED 174 -> 176, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), READ
                          OFF THIS FILE'S OWN GREEN RUN and never by adding to the number that was here.
                          CASE-3 minted ONE row — PUBLISHED_CANNOT_MOVE_VERSION (C-25.34) in the
                          EXISTING VERSION_ACT_CHECKS, so `families` does not move: SK-1's rule that a
                          family is a floor which buys slack for everybody else's walk, and C-25.32's
                          row records the same choice one item earlier.
                          **PRE-EXISTING SLACK OF 1 FOUND AND CLEARED HERE, AND IT WAS NOT THIS
                          ITEM'S:** the tree measured 175 rows against a floor of 174 BEFORE this
                          item touched anything (measured by reverting bio-checks.mjs to HEAD and
                          re-running). That is the sixth item running to find a floor already stale,
                          and the file's own header says why it matters — a floor with slack is not a
                          ratchet. */
                       /* `rows`' PRIOR NOTE, KEPT AND EXPLICITLY LABELLED AS THE PRIOR ONE. The
                          header above records that two keep-both merges left continuation comments
                          attached to keys they were never written about, and that an unreadable
                          comment block has stopped carrying its findings — so this one says whose
                          it is rather than floating above the next key.
                          MOVED 167 -> 168, 2026-08-09, worktree agent-ae8e8c4d786783a6b, READ OFF
                          THIS FILE'S OWN GREEN RUN ON THE MERGED TREE (`arm A: … 168 rows — floor
                          16/167 · GREW by 1 row(s) since the floor was set`) and never by adding one
                          to the number that was here. **THE FIRST FIGURE THIS ITEM WROTE WAS
                          166 -> 167 AND IT WAS TRUE OF A TREE THAT NO LONGER EXISTED BY THE TIME IT
                          WAS WRITTEN** — `origin/main` moved under the item and arrived at 167 for
                          its own reasons, so the pre-merge number was right where it stood and wrong
                          on the merge. Re-read after the merge commit, on a tree with nothing
                          uncommitted. + C-25.32 `VERSION_REASON_MALFORMED` in the EXISTING
                          VERSION_ACT_CHECKS — no new family, so `families` does not move: SK-1's
                          rule that a family is a floor which buys slack for everybody else's walk.
                          NO PRE-EXISTING SLACK FOUND in any figure on this line or the three below:
                          every one sat exactly where REC-69's replay left it, which is the fifth
                          item running for which that has been true. */
                       // + C-36.1..3 (REC-69, all three DRIVEN through the op).
                       // + C-33.30/31/32 (REC-76 — aiRunOpen's two codeless refusals and SET_MOVED).
                       // + C-34.1..4 (REC-63, the route marker door). + C-32.1..11 (REC-64, the machine fences) + C-33.1..28 (REC-64, the single-homed
                       // tail) + C-22.8 (REC-64, §14a's capability sentence) + C-31.1..3 and C-28.14/15
                       // (PL-15) + C-29.1..9 (PL-11, all nine DRIVEN) + C-30.1..9 (PL-14).
                       // Was 163 at REC-76, 105 at PL-15, 81 at PL-4, 70 at PL-3.
  /* D-309 2026-09-10: 437 -> 465. pristine tree printed 465, this item's 465 — so 28 of this move was PRE-EXISTING SLACK and 0 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): census 465 -> 472. PRISTINE `origin/main` at 9a713f1 printed 470, this item's tree 472 — so 5 of this move was PRE-EXISTING SLACK and 2 is REC-84's. */
  /* RE-READ 2026-09-14 by REC-84 AFTER MERGING `origin/main` (commit 40f34e1): census 472 -> 474. The figure REC-84 set an hour earlier was true of its own branch and is not true of the merged tree — the merge with `origin/main` brought REC-83's content-grain reads, whose two new codes join the plane's census. Read off the merged tree's own green run, never incremented by hand. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): census 474 -> 490. PRISTINE `origin/main` at 173bc66 printed 486, this item's committed tree (2e5d21f) 490 — so 12 of this move was PRE-EXISTING SLACK and 4 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 601 -> 602 from this guard's own print on the item's tree, every other ratchet key gated. One new code minted in src/store.mjs: CASE_CONCLUSION_MOVED. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* [CONDUCT #14 at REC-167's merge onto REC-165's main] 2026-09-22: RE-READ from this guard's own print on the COMMITTED merge — measured 604 (REC-165 and REC-167 each moved this key from the same base, so neither side's figure is the sum). Never added by hand. */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 618 -> 622 from this guard's own print on the item's tree: the four new codes. ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-150 (2026-09-23, cloud session WORKER D-150 (CONDUCT #17), land/worker/D-150): MOVED 618 -> 623 from this guard's own print on the item's tree over origin/main 02603e88, every other ratchet key gated at slack 0 on the same run. Five new codes minted in src/store.mjs acknowledgeStatement: STATEMENT_ACK_NO_SUBJECT, STATEMENT_ACK_ALREADY_SIGNED, STATEMENT_ACK_NOT_A_PARTICIPANT, STATEMENT_ACK_NO_STATEMENT, STATEMENT_ACK_BY_ITS_AUTHOR. ZERO of the move is pre-existing slack: the baseline run on 02603e88 printed exactly the old floor. */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 618 -> 626 from this guard's own print on the item's tree over origin/main 02603e88: the eight C-72 codes. ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 618. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 618 -> 625 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — the six coded refusals plus UNSPLICEABLE_GOVERNING_LAWS. */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 618 -> 621 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. three new codes, CONNECTION_CHOICE_NOT_A_MEMBER / _NO_CONNECTION / _NOT_A_MENTION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 618 -> 622 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +4 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 655 -> 659 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 618 -> 623 from this guard's own print on the item's tree — +5 codes: SET_NO_ITEMS, SET_TOO_LARGE, SET_ITEM_MALFORMED, SET_ITEM_FAILED, SET_ITEMS_RETAINED (NOT_YOURS was already in the census). */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 618 -> 621 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 631 -> 632 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 631, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 618 -> 625 from this guard's own print on the item's tree over origin/main 02603e88: the seven PARTITION_INDEPENDENCE_* codes. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 618, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 614 -> 615 from this guard's own print on the item's tree: the one new code, CAPTURE_HELD_BY_ANOTHER_BUNDLE. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 614 -> 619 from this guard's own print on the item's tree, every other ratchet key gated. five new codes: EVIDENCE_STORAGE_NOT_CONFIGURED, BOOTSTRAP_CREDENTIAL_UNSET/_PUBLISHED/_MISMATCH, UNKNOWN_OP. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 611 -> 612 from this guard's own print on the item's tree: the one new code, RETIRED_NOT_CITABLE, minted in src/store.mjs cite. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 611, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 612 -> 613 from this guard's own print on the merged tree: AI_RUN_BOUND_NO_ALLOWANCE, the one new code. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 612 -> 613 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 612. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 612 -> 613 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. One new code minted in the `is-content-extent` region: CONTENT_EXTENT_NO_IMAGE_PAINTED. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 612 -> 613 from this guard's own print on the merged tree. The one new code. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 610 -> 611 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new code minted in src/store.mjs promote: FILE_DIGEST_MISMATCH. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 610 -> 611 from this guard's own print: AI_RUN_BOUND_UNKNOWN, the one new code. The pristine HEAD (91913d6b) printed 610, so ZERO of the move is pre-existing slack. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 608 -> 610 from this guard's own print on the item's tree: the two new codes, AI_RUN_CONSUME_INVALID and AI_RUN_BOUND_PLANE_COUNTED. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 604 -> 608 from this guard's own print on the item's tree, every other ratchet key gated. Four new codes minted in src/store.mjs #surfacingGate. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 601 -> 603 from this guard's own print (the commit-at-HEAD figure). The two codes minted in src/store.mjs suggestVersion: SUGGEST_RUN_NOT_RUNNING, SUGGEST_OUTSIDE_RUN_CONTEXT. Slack 0 on main (M0-79), so the +2 is this item's. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 598 -> 601 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Three new codes minted in src/store.mjs: GROUP_UNDETERMINED, GROUP_SLUG_MALFORMED, GROUP_ALREADY_RECORDED. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 595 -> 598 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 596, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two new codes). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 517 -> 595 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 592, so 75 of the move is PRE-EXISTING SLACK and +3 is this item's (the three new codes). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 490 -> 517 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 506, so 16 of the move is PRE-EXISTING slack and +11 is this item's. */ /* MOVED 433 -> 437, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), from */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 631 -> 641 from this guard's own print on the item's tree, every other ratchet key gated. Ten new codes the plane can mint, every one translated. ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 631 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 618 -> 625 from this guard's own print on the item's tree over origin/main 02603e88: the seven PARTITION_INDEPENDENCE_* codes. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 618, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 614 -> 615 from this guard's own print on the item's tree: the one new code, CAPTURE_HELD_BY_ANOTHER_BUNDLE. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 614 -> 619 from this guard's own print on the item's tree, every other ratchet key gated. five new codes: EVIDENCE_STORAGE_NOT_CONFIGURED, BOOTSTRAP_CREDENTIAL_UNSET/_PUBLISHED/_MISMATCH, UNKNOWN_OP. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 611 -> 612 from this guard's own print on the item's tree: the one new code, RETIRED_NOT_CITABLE, minted in src/store.mjs cite. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 611, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 612 -> 613 from this guard's own print on the merged tree: AI_RUN_BOUND_NO_ALLOWANCE, the one new code. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 612 -> 613 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 612. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 612 -> 613 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. One new code minted in the `is-content-extent` region: CONTENT_EXTENT_NO_IMAGE_PAINTED. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 612 -> 613 from this guard's own print on the merged tree. The one new code. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 610 -> 611 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new code minted in src/store.mjs promote: FILE_DIGEST_MISMATCH. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 610 -> 611 from this guard's own print: AI_RUN_BOUND_UNKNOWN, the one new code. The pristine HEAD (91913d6b) printed 610, so ZERO of the move is pre-existing slack. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 608 -> 610 from this guard's own print on the item's tree: the two new codes, AI_RUN_CONSUME_INVALID and AI_RUN_BOUND_PLANE_COUNTED. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 604 -> 608 from this guard's own print on the item's tree, every other ratchet key gated. Four new codes minted in src/store.mjs #surfacingGate. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 601 -> 603 from this guard's own print (the commit-at-HEAD figure). The two codes minted in src/store.mjs suggestVersion: SUGGEST_RUN_NOT_RUNNING, SUGGEST_OUTSIDE_RUN_CONTEXT. Slack 0 on main (M0-79), so the +2 is this item's. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 598 -> 601 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Three new codes minted in src/store.mjs: GROUP_UNDETERMINED, GROUP_SLUG_MALFORMED, GROUP_ALREADY_RECORDED. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 595 -> 598 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 596, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two new codes). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 517 -> 595 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 592, so 75 of the move is PRE-EXISTING SLACK and +3 is this item's (the three new codes). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 490 -> 517 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 506, so 16 of the move is PRE-EXISTING slack and +11 is this item's. */ /* MOVED 433 -> 437, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), from */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  census: 682, /* c19-unionfix (c19-batch9, 2026-09-24): 681 -> 682, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 667 -> 670 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 662 -> 667 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 658 -> 662 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 655 -> 658 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 648 -> 655 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 640 -> 648 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-150 merged over REC-164; 635 -> 640 RE-READ from this guard's --strict print on the committed merge 4e45ca5d. The new members are D-150's five STATEMENT_ACK_* codes; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 631 -> 635 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 618 -> 625 from this guard's own print on the item's tree over origin/main 02603e88: the seven PARTITION_INDEPENDENCE_* codes. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 618, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 614 -> 615 from this guard's own print on the item's tree: the one new code, CAPTURE_HELD_BY_ANOTHER_BUNDLE. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 614 -> 619 from this guard's own print on the item's tree, every other ratchet key gated. five new codes: EVIDENCE_STORAGE_NOT_CONFIGURED, BOOTSTRAP_CREDENTIAL_UNSET/_PUBLISHED/_MISMATCH, UNKNOWN_OP. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 611 -> 612 from this guard's own print on the item's tree: the one new code, RETIRED_NOT_CITABLE, minted in src/store.mjs cite. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 611, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 612 -> 613 from this guard's own print on the merged tree: AI_RUN_BOUND_NO_ALLOWANCE, the one new code. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 612 -> 613 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 612. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 612 -> 613 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. One new code minted in the `is-content-extent` region: CONTENT_EXTENT_NO_IMAGE_PAINTED. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 612 -> 613 from this guard's own print on the merged tree. The one new code. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 610 -> 611 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new code minted in src/store.mjs promote: FILE_DIGEST_MISMATCH. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 610 -> 611 from this guard's own print: AI_RUN_BOUND_UNKNOWN, the one new code. The pristine HEAD (91913d6b) printed 610, so ZERO of the move is pre-existing slack. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 608 -> 610 from this guard's own print on the item's tree: the two new codes, AI_RUN_CONSUME_INVALID and AI_RUN_BOUND_PLANE_COUNTED. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 604 -> 608 from this guard's own print on the item's tree, every other ratchet key gated. Four new codes minted in src/store.mjs #surfacingGate. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 601 -> 603 from this guard's own print (the commit-at-HEAD figure). The two codes minted in src/store.mjs suggestVersion: SUGGEST_RUN_NOT_RUNNING, SUGGEST_OUTSIDE_RUN_CONTEXT. Slack 0 on main (M0-79), so the +2 is this item's. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 598 -> 601 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Three new codes minted in src/store.mjs: GROUP_UNDETERMINED, GROUP_SLUG_MALFORMED, GROUP_ALREADY_RECORDED. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 595 -> 598 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 596, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two new codes). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 517 -> 595 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 592, so 75 of the move is PRE-EXISTING SLACK and +3 is this item's (the three new codes). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 490 -> 517 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 506, so 16 of the move is PRE-EXISTING slack and +11 is this item's. */ /* MOVED 433 -> 437, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), from
                          the figure this file PRINTED on a green run (`walk: UNION (the census) 437
                          codes over 27 files`) and never by adding to what was here.
                          **THREE OF THE FOUR ARE PRE-EXISTING SLACK AND ONE IS THIS ITEM'S.**
                          Measured, not inferred: with `bio-checks.mjs` reverted to HEAD the census
                          read 436 against a floor of 433, so 3 codes had landed since the floor was
                          last moved and nobody moved it; CASE-3's own C-25.34 takes it to 437. The
                          slack is reported rather than quietly absorbed, because the whole argument
                          of this block is that a floor with slack is not a ratchet — and a floor
                          moved to the measured value without saying how much of the move was
                          somebody else's is the same silence one layer in. */
                       /* `census`' PRIOR NOTE, KEPT AND LABELLED AS THE PRIOR ONE:
                          MOVED 428 -> 429, 2026-08-09, agent-ae8e8c4d786783a6b, from the figure this
                          file PRINTED on a green run of the MERGED tree (`walk: UNION (the census)
                          429 codes over 26 files … floor 428`); the pre-merge read of 427 -> 428 was
                          superseded by main moving under the item, and is re-read rather than kept. One code, `VERSION_REASON_MALFORMED`, minted at the
                          one site that used to answer a reason it could not store with the code for
                          a reason nobody gave. */
                       // distinct refusal codes the plane can mint, UNION of the matcher set.
                       // A plain `reason: "CODE"` grep answers fewer; the set finds the rest.
                       // REC-79: +4, and the FOUR ARE THE POINT. NOT_AUTHENTICATED, CLASS_FORBIDDEN,
                       // MACHINE_CREDENTIAL_REQUIRED and SCOPE_REFUSED are not new refusals — they are
                       // refusals that have always fired at the admission gate and carried NO CODE, so
                       // no census could count them. **THE CENSUS IS A FLOOR ON THE PLANE'S REFUSAL
                       // VOCABULARY AND NOT A TOTAL**, and it took giving four of them codes to see it.
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
  /* D-309 2026-09-10: 229 -> 238. pristine tree printed 237, this item's 238 — so 8 of this move was PRE-EXISTING SLACK and 1 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): reach 238 -> 244. PRISTINE `origin/main` at 9a713f1 printed 242, this item's tree 244 — so 4 of this move was PRE-EXISTING SLACK and 2 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): reach 244 -> 258. PRISTINE `origin/main` at 173bc66 printed 254, this item's committed tree (2e5d21f) 258 — so 10 of this move was PRE-EXISTING SLACK and 4 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 344 -> 345 from this guard's own print on the item's tree, every other ratchet key gated. The one row, in reach by R1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* [CONDUCT #14 at REC-167's merge onto REC-165's main] 2026-09-22: RE-READ from this guard's own print on the COMMITTED merge — measured 347 (REC-165 and REC-167 each moved this key from the same base, so neither side's figure is the sum). Never added by hand. */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 362 -> 366 from this guard's own print on the item's tree: the four new R1 family rows. ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 362 -> 370 from this guard's own print on the item's tree over origin/main 02603e88: the eight C-72 rows (R1). ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 362. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 362 -> 368 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — the six new family rows. */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 362 -> 365 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. the three C-74 rows, reached as R1 family rows. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 362 -> 366 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +4 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 393 -> 397 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 362 -> 368 from this guard's own print on the item's tree — +6: the five C-75 codes (R1) and NOT_YOURS (R1 now, and FED by queue-peritem.test.mjs). */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 362 -> 365 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 375 -> 376 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 375, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 362 -> 369 from this guard's own print on the item's tree over origin/main 02603e88: the seven C-71 rows. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 362, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 358 -> 359 from this guard's own print on the item's tree: R1: the one new family row. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 358 -> 363 from this guard's own print on the item's tree, every other ratchet key gated. the five new codes, reached as R1 family rows. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 355 -> 356 from this guard's own print on the item's tree: the new row reaches by R1 (a family row). ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 355, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 356 -> 357 from this guard's own print on the merged tree: the new row's R1 reach. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 356 -> 357 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 356. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 356 -> 357 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. Its one R1 family row. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 356 -> 357 from this guard's own print on the merged tree — the new row's R1 reach. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 354 -> 355 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. Its one R1 family row. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 353 -> 354 from this guard's own print: the new row's R1 reach. The pristine HEAD (91913d6b) printed 353: ZERO pre-existing slack.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 353 -> 354 from this guard's own print on the merged tree, every other ratchet key gated. The new row, in reach by R1 and arriving TRANSLATED; app.html keys on the refusal's `cases[]` and names no code, so R2 did not move. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 351 -> 353 from this guard's own print on the item's tree: both codes are received by a committed suite (rec169-consume.test.mjs). The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 347 -> 351 from this guard's own print on the item's tree, every other ratchet key gated. The four rows, in reach by R1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 344 -> 346 from this guard's own print (the commit-at-HEAD figure). The two new C-27 rows, in reach by R1, both arriving TRANSLATED. Slack 0 on main (M0-79), so the +2 is this item's. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 341 -> 344 from this guard's own GREEN print on the item's committed tree 2f09b7b6. The three rows, in reach by R1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 338 -> 341 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 339, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two new codes, both arriving TRANSLATED). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 272 -> 338 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 335, so 63 of the move is PRE-EXISTING SLACK and +3 is this item's (the three new codes, all three arriving TRANSLATED). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 258 -> 272 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 261, so 3 of the move is PRE-EXISTING slack and +11 is this item's. */ /* MOVED 227 -> 229, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), from */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 375 -> 385 from this guard's own print on the item's tree, every other ratchet key gated. The ten C-74 codes, in reach and every one translated. ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 375 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 362 -> 369 from this guard's own print on the item's tree over origin/main 02603e88: the seven C-71 rows. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 362, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 358 -> 359 from this guard's own print on the item's tree: R1: the one new family row. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 358 -> 363 from this guard's own print on the item's tree, every other ratchet key gated. the five new codes, reached as R1 family rows. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 355 -> 356 from this guard's own print on the item's tree: the new row reaches by R1 (a family row). ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 355, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 356 -> 357 from this guard's own print on the merged tree: the new row's R1 reach. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 356 -> 357 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 356. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 356 -> 357 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. Its one R1 family row. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 356 -> 357 from this guard's own print on the merged tree — the new row's R1 reach. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 354 -> 355 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. Its one R1 family row. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 353 -> 354 from this guard's own print: the new row's R1 reach. The pristine HEAD (91913d6b) printed 353: ZERO pre-existing slack.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 353 -> 354 from this guard's own print on the merged tree, every other ratchet key gated. The new row, in reach by R1 and arriving TRANSLATED; app.html keys on the refusal's `cases[]` and names no code, so R2 did not move. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 351 -> 353 from this guard's own print on the item's tree: both codes are received by a committed suite (rec169-consume.test.mjs). The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 347 -> 351 from this guard's own print on the item's tree, every other ratchet key gated. The four rows, in reach by R1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 344 -> 346 from this guard's own print (the commit-at-HEAD figure). The two new C-27 rows, in reach by R1, both arriving TRANSLATED. Slack 0 on main (M0-79), so the +2 is this item's. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 341 -> 344 from this guard's own GREEN print on the item's committed tree 2f09b7b6. The three rows, in reach by R1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 338 -> 341 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 339, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two new codes, both arriving TRANSLATED). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 272 -> 338 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 335, so 63 of the move is PRE-EXISTING SLACK and +3 is this item's (the three new codes, all three arriving TRANSLATED). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 258 -> 272 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 261, so 3 of the move is PRE-EXISTING slack and +11 is this item's. */ /* MOVED 227 -> 229, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), from */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  reach: 422, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): MOVED 421 -> 422 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. R1 gains two rows; only NO_CITATION is a new code IN REACH, because NO_BASIS was already reached through R3 (conclude-act.test.mjs feeds it) and the union does not double-count it. +2 rows, +1 reach, and the difference is the measurement rather than an error. */ /* c19-unionfix (c19-batch9, 2026-09-24): 420 -> 421, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 406 -> 409 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 400 -> 406 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 396 -> 400 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 393 -> 396 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 387 -> 393 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 379 -> 387 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 375 -> 379 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 362 -> 369 from this guard's own print on the item's tree over origin/main 02603e88: the seven C-71 rows. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 362, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 358 -> 359 from this guard's own print on the item's tree: R1: the one new family row. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 358 -> 363 from this guard's own print on the item's tree, every other ratchet key gated. the five new codes, reached as R1 family rows. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 355 -> 356 from this guard's own print on the item's tree: the new row reaches by R1 (a family row). ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 355, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 356 -> 357 from this guard's own print on the merged tree: the new row's R1 reach. ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 356 -> 357 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 356. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 356 -> 357 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. Its one R1 family row. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 356 -> 357 from this guard's own print on the merged tree — the new row's R1 reach. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 354 -> 355 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. Its one R1 family row. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 353 -> 354 from this guard's own print: the new row's R1 reach. The pristine HEAD (91913d6b) printed 353: ZERO pre-existing slack.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 353 -> 354 from this guard's own print on the merged tree, every other ratchet key gated. The new row, in reach by R1 and arriving TRANSLATED; app.html keys on the refusal's `cases[]` and names no code, so R2 did not move. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 351 -> 353 from this guard's own print on the item's tree: both codes are received by a committed suite (rec169-consume.test.mjs). The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 347 -> 351 from this guard's own print on the item's tree, every other ratchet key gated. The four rows, in reach by R1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 344 -> 346 from this guard's own print (the commit-at-HEAD figure). The two new C-27 rows, in reach by R1, both arriving TRANSLATED. Slack 0 on main (M0-79), so the +2 is this item's. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 341 -> 344 from this guard's own GREEN print on the item's committed tree 2f09b7b6. The three rows, in reach by R1. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 338 -> 341 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 339, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two new codes, both arriving TRANSLATED). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 272 -> 338 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 335, so 63 of the move is PRE-EXISTING SLACK and +3 is this item's (the three new codes, all three arriving TRANSLATED). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 258 -> 272 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 261, so 3 of the move is PRE-EXISTING slack and +11 is this item's. */ /* MOVED 227 -> 229, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3), from
                          this file's own printed figure (`arm B: REACH 229 codes`) and never by
                          adding to what was here. ONE of the two is pre-existing slack (the tree
                          measured 228 against a floor of 227 with `bio-checks.mjs` reverted to HEAD)
                          and one is C-25.34, which enters reach through R1 — it is a family row, and
                          every family row is in reach by definition. **The ratchet beside this
                          figure did NOT move: 40 of 229 codes in reach still carry no canned
                          translation, exactly as before, because C-25.34 shipped WITH its sentence.**
                          A refusal added without one would have raised that ceiling, which is the
                          number this whole file exists to drive down. */
                       /* `reach`' PRIOR NOTE, KEPT AND LABELLED AS THE PRIOR ONE:
                          MOVED 221 -> 222, 2026-08-09, agent-ae8e8c4d786783a6b, from this file's own
                          green run of the MERGED tree (`arm B: REACH 222 codes — R1 family rows 168
                          … floor 221 · GREW by 1`); the pre-merge read of 220 -> 221 was superseded
                          by main moving under the item, and is re-read rather than kept. The new code arrives TRANSLATED, so `reachGap` below does NOT move
                          and is deliberately left at 41: a ceiling nudged for bookkeeping reasons
                          stops being a measurement of the gap it names (REC-63's rule). Confirmed on
                          this tree: 41 of 221, sitting exactly at the ceiling. */
                       // codes a surface can receive (R1 + R2 + R3) (was 217 pre-REC-69, 204 pre-REC-76, 200 pre-REC-63, 191, 187, 178, 168, 157, 127, 116, 98)
                       // REC-79: +5, all six C-38 rows arriving TRANSLATED and NOT_CAPABLE already
                       // being in reach — so the gap CEILING falls by one rather than the five.
                       // REC-69: +3, and they arrive TRANSLATED — the reachGap CEILING below does not
                       // move, which is the property a new family owes rather than the number itself.
                       // (Confirmed on this tree: 41 of 220, ceiling 41, sitting exactly at it.)
  /* D-309 2026-09-10: 69 -> 73. pristine tree printed 72, this item's 73 — so 3 of this move was PRE-EXISTING SLACK and 1 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): governedSites 73 -> 75. PRISTINE `origin/main` at 9a713f1 printed 74, this item's tree 75 — so 1 of this move was PRE-EXISTING SLACK and 1 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): governedSites 75 -> 81. PRISTINE `origin/main` at 173bc66 printed 80, this item's committed tree (2e5d21f) 81 — so 5 of this move was PRE-EXISTING SLACK and 1 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 135 -> 139 from this guard's own print on the item's tree: the four new `where`s. ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 135 -> 138 from this guard's own print on the item's tree over origin/main 02603e88: three new spans: actionCorrespond > is-quote-grammar, actionCorrespond > is-quote-writable, actionQuotes > is-quote-read-axis. ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 135. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 135 -> 138 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — is-machine-set-laws, is-laws-entry, is-promote-governing-laws. */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 135 -> 136 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. one new governed site, chooseConnectionPair > is-connection-choice. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 135 -> 138 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +3 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 150 -> 153 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 135 -> 140 from this guard's own print on the item's tree — +5: #perItem > is-per-item-set-shape / -malformed / -failed / -retained, and #refuseNotYours > is-task-actor-fence. */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 135 -> 136 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 140 -> 141 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 140, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 135 -> 136 from this guard's own print on the item's tree over origin/main 02603e88: the one new region partitionIndependence > is-partition-independence. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 135, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 134 -> 135 from this guard's own print on the item's tree: the new row's `where`, #testimonyFence > is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 134 -> 137 from this guard's own print on the item's tree, every other ratchet key gated. three new spans: storageAbsent > is-storage-absent, fetch > is-bootstrap-claim, fetch > is-unknown-op. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 131 -> 132 from this guard's own print on the item's tree: one new governed site, the region is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 131, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 132 -> 133 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 132. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 131 -> 132 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new `where`, promote > is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 130 -> 131 from this guard's own print on the merged tree, every other ratchet key gated. One new span: #resolveOneCase > is-finding-in-several-cases. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 129 -> 130 from this guard's own print on the item's tree: the one `where` both rows name, airun.mjs checkConsume. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 128 -> 129 from this guard's own print on the item's tree, every other ratchet key gated. One new span: #surfacingGate > is-surface-run. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 127 -> 128 from this guard's own print on the item's tree, every other ratchet key gated. One new span: ratifyCaseDocument > is-caseratify-conclusion-moved. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 125 -> 127 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Two new spans: #groupUndetermined > is-group-undetermined and instanceGroupSeed > is-instance-group-seed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 123 -> 125 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 124, so 1 of the move is PRE-EXISTING SLACK and +1 is this item's (one new span, #signerMemberBar > is-signer-member-attesting). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 84 -> 123 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 121, so 37 of the move is PRE-EXISTING SLACK and +2 is this item's (sessionOpGate > is-session-op-gate and requiredArgument > is-required-argument). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 81 -> 84 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 81, so 0 of the move is PRE-EXISTING slack and +3 (#narrowSource > is-narrow-source, narrow > is-narrow-extent, narrow > is-narrow-claim) is this item's. */ // spans named by a row's `where` — a function, or a region inside one.
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 140 -> 146 from this guard's own print on the item's tree, every other ratchet key gated. Six new REGIONs: is-theme-not-evidence, is-theme-declare, is-theme-source, is-theme-place, is-theme-target, is-theme-propose. ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 140 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 135 -> 136 from this guard's own print on the item's tree over origin/main 02603e88: the one new region partitionIndependence > is-partition-independence. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 135, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 134 -> 135 from this guard's own print on the item's tree: the new row's `where`, #testimonyFence > is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 134 -> 137 from this guard's own print on the item's tree, every other ratchet key gated. three new spans: storageAbsent > is-storage-absent, fetch > is-bootstrap-claim, fetch > is-unknown-op. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 131 -> 132 from this guard's own print on the item's tree: one new governed site, the region is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 131, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 132 -> 133 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 132. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 131 -> 132 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new `where`, promote > is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 130 -> 131 from this guard's own print on the merged tree, every other ratchet key gated. One new span: #resolveOneCase > is-finding-in-several-cases. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 129 -> 130 from this guard's own print on the item's tree: the one `where` both rows name, airun.mjs checkConsume. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 128 -> 129 from this guard's own print on the item's tree, every other ratchet key gated. One new span: #surfacingGate > is-surface-run. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 127 -> 128 from this guard's own print on the item's tree, every other ratchet key gated. One new span: ratifyCaseDocument > is-caseratify-conclusion-moved. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 125 -> 127 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Two new spans: #groupUndetermined > is-group-undetermined and instanceGroupSeed > is-instance-group-seed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 123 -> 125 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 124, so 1 of the move is PRE-EXISTING SLACK and +1 is this item's (one new span, #signerMemberBar > is-signer-member-attesting). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 84 -> 123 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 121, so 37 of the move is PRE-EXISTING SLACK and +2 is this item's (sessionOpGate > is-session-op-gate and requiredArgument > is-required-argument). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 81 -> 84 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 81, so 0 of the move is PRE-EXISTING slack and +3 (#narrowSource > is-narrow-source, narrow > is-narrow-extent, narrow > is-narrow-claim) is this item's. */ // spans named by a row's `where` — a function, or a region inside one.
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  governedSites: 170, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): MOVED 168 -> 170 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. the two new `where`s. */ /* c19-unionfix (c19-batch9, 2026-09-24): 167 -> 168, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 159 -> 160 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 154 -> 159 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 151 -> 154 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 150 -> 151 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 147 -> 150 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 144 -> 147 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 140 -> 144 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 135 -> 136 from this guard's own print on the item's tree over origin/main 02603e88: the one new region partitionIndependence > is-partition-independence. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 135, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 134 -> 135 from this guard's own print on the item's tree: the new row's `where`, #testimonyFence > is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 134 -> 137 from this guard's own print on the item's tree, every other ratchet key gated. three new spans: storageAbsent > is-storage-absent, fetch > is-bootstrap-claim, fetch > is-unknown-op. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 131 -> 132 from this guard's own print on the item's tree: one new governed site, the region is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 131, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 132 -> 133 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 132. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 131 -> 132 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new `where`, promote > is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 130 -> 131 from this guard's own print on the merged tree, every other ratchet key gated. One new span: #resolveOneCase > is-finding-in-several-cases. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 129 -> 130 from this guard's own print on the item's tree: the one `where` both rows name, airun.mjs checkConsume. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 128 -> 129 from this guard's own print on the item's tree, every other ratchet key gated. One new span: #surfacingGate > is-surface-run. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 127 -> 128 from this guard's own print on the item's tree, every other ratchet key gated. One new span: ratifyCaseDocument > is-caseratify-conclusion-moved. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 125 -> 127 from this guard's own GREEN print on the item's committed tree 2f09b7b6. Two new spans: #groupUndetermined > is-group-undetermined and instanceGroupSeed > is-instance-group-seed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 123 -> 125 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 124, so 1 of the move is PRE-EXISTING SLACK and +1 is this item's (one new span, #signerMemberBar > is-signer-member-attesting). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 84 -> 123 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 121, so 37 of the move is PRE-EXISTING SLACK and +2 is this item's (sessionOpGate > is-session-op-gate and requiredArgument > is-required-argument). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 81 -> 84 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 81, so 0 of the move is PRE-EXISTING slack and +3 (#narrowSource > is-narrow-source, narrow > is-narrow-extent, narrow > is-narrow-claim) is this item's. */ // spans named by a row's `where` — a function, or a region inside one.
                       // (was 60 pre-REC-76, 59 pre-REC-63, 28, 27, 25, 20, 17, 13, 9, 5)
                       // + REC-79's `fetch > is-admission` — THE FIRST GOVERNED SITE IN THE CONTROL
                       //   PLANE'S REQUEST PATH. Three index.mjs sites were governed before it, all
                       //   of them helper functions returning plain objects; nothing had ever
                       //   governed a `return json(…)` refusal because arm C could not see one.
                       // + REC-69's `aiRunsInContext > is-airuns-context`.
                       // (was 66 pre-REC-69, 60 pre-REC-76, 59 pre-REC-63, 28, 27, 25, 20, 17, 13, 9, 5)
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
                       // M0-79, 2026-09-21: the ONE key EXEMPT from the slack gate, and the
                       // exemption is this note's argument restated at `SLACK.bodyLines` and
                       // printed every run — measured 4712 against this floor of 60 on
                       // `origin/main` @ 4fac1548, deliberately, and NOT moved.
  /* D-309 2026-09-10: 55 -> 59. pristine tree printed 58, this item's 59 — so 3 of this move was PRE-EXISTING SLACK and 1 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): regions 59 -> 61. PRISTINE `origin/main` at 9a713f1 printed 60, this item's tree 61 — so 1 of this move was PRE-EXISTING SLACK and 1 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): regions 61 -> 67. PRISTINE `origin/main` at 173bc66 printed 66, this item's committed tree (2e5d21f) 67 — so 5 of this move was PRE-EXISTING SLACK and 1 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 118 -> 122 from this guard's own print on the item's tree: the four new DEC-49 REGION pairs. ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 118 -> 121 from this guard's own print on the item's tree over origin/main 02603e88: the same three regions. ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 118. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 118 -> 121 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — the same three regions. */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 118 -> 119 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. one new region, is-connection-choice. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 118 -> 121 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +3 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 133 -> 136 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 118 -> 123 from this guard's own print on the item's tree — +5: the same five new marker pairs. */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 118 -> 119 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 123 -> 124 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 123, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 118 -> 119 from this guard's own print on the item's tree over origin/main 02603e88: the one new region partitionIndependence > is-partition-independence. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 118, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 117 -> 118 from this guard's own print on the item's tree: the one new REGION, is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 117 -> 120 from this guard's own print on the item's tree, every other ratchet key gated. the same three narrowed REGIONs. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 114 -> 115 from this guard's own print on the item's tree: one new region, is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 114, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 115 -> 116 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 115. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 114 -> 115 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new REGION marker pair, is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3): MOVED 113 -> 114 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 112 -> 113 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 111 -> 112 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 109 -> 111 from this guard's own GREEN print on the item's committed tree 2f09b7b6. The same two spans, both narrowed REGIONS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 107 -> 109 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 108, so 1 of the move is PRE-EXISTING SLACK and +1 is this item's (the same one region). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 70 -> 107 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 105, so 35 of the move is PRE-EXISTING SLACK and +2 is this item's (the same two regions). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 67 -> 70 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 67, so 0 of the move is PRE-EXISTING slack and +3 is this item's. */ // + REC-69's `is-airuns-context` (ONE region, three codes, every one COMPARED —
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 123 -> 129 from this guard's own print on the item's tree, every other ratchet key gated. The same six marker pairs. ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 123 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 118 -> 119 from this guard's own print on the item's tree over origin/main 02603e88: the one new region partitionIndependence > is-partition-independence. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 118, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 117 -> 118 from this guard's own print on the item's tree: the one new REGION, is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 117 -> 120 from this guard's own print on the item's tree, every other ratchet key gated. the same three narrowed REGIONs. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 114 -> 115 from this guard's own print on the item's tree: one new region, is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 114, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 115 -> 116 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 115. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 114 -> 115 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new REGION marker pair, is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3): MOVED 113 -> 114 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 112 -> 113 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 111 -> 112 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 109 -> 111 from this guard's own GREEN print on the item's committed tree 2f09b7b6. The same two spans, both narrowed REGIONS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 107 -> 109 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 108, so 1 of the move is PRE-EXISTING SLACK and +1 is this item's (the same one region). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 70 -> 107 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 105, so 35 of the move is PRE-EXISTING SLACK and +2 is this item's (the same two regions). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 67 -> 70 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 67, so 0 of the move is PRE-EXISTING slack and +3 is this item's. */ // + REC-69's `is-airuns-context` (ONE region, three codes, every one COMPARED —
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  regions: 153, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): MOVED 151 -> 153 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. the two new marker pairs, `is-act-no-basis` and `is-act-no-citation`. */ /* c19-unionfix (c19-batch9, 2026-09-24): 150 -> 151, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 142 -> 143 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 137 -> 142 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 134 -> 137 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 133 -> 134 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 130 -> 133 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 127 -> 130 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 123 -> 127 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 118 -> 119 from this guard's own print on the item's tree over origin/main 02603e88: the one new region partitionIndependence > is-partition-independence. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 118, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 117 -> 118 from this guard's own print on the item's tree: the one new REGION, is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 117 -> 120 from this guard's own print on the item's tree, every other ratchet key gated. the same three narrowed REGIONs. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 114 -> 115 from this guard's own print on the item's tree: one new region, is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 114, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 115 -> 116 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 115. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 114 -> 115 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. One new REGION marker pair, is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3): MOVED 113 -> 114 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 112 -> 113 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 111 -> 112 from this guard's own print on the item's tree, every other ratchet key gated. The same span, a narrowed REGION. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 109 -> 111 from this guard's own GREEN print on the item's committed tree 2f09b7b6. The same two spans, both narrowed REGIONS. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 107 -> 109 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 108, so 1 of the move is PRE-EXISTING SLACK and +1 is this item's (the same one region). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 70 -> 107 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 105, so 35 of the move is PRE-EXISTING SLACK and +2 is this item's (the same two regions). */    /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 67 -> 70 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 67, so 0 of the move is PRE-EXISTING slack and +3 is this item's. */ // + REC-69's `is-airuns-context` (ONE region, three codes, every one COMPARED —
                       // eight judged refusals — `ROOT_OF_TRUST_REQUIRED` fires at two conditions
                       // inside the one span, which is what a region `where` can honestly hold).
                       // + REC-69's `is-airuns-context` (ONE region, three codes, every one COMPARED —
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
  /* D-309 2026-09-10: 1556 -> 1657. pristine tree printed 1639, this item's 1657 — so 83 of this move was PRE-EXISTING SLACK and 18 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): regionLines 1657 -> 1745. PRISTINE `origin/main` at 9a713f1 printed 1713, this item's tree 1745 — so 56 of this move was PRE-EXISTING SLACK and 32 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): regionLines 1745 -> 2035. PRISTINE `origin/main` at 173bc66 printed 1971, this item's committed tree (2e5d21f) 2035 — so 226 of this move was PRE-EXISTING SLACK and 64 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 2991 -> 3004 from this guard's own print on the item's tree, every other ratchet key gated. 13 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* [CONDUCT #14 at REC-167's merge onto REC-165's main] 2026-09-22: RE-READ from this guard's own print on the COMMITTED merge — measured 3043 (REC-165 and REC-167 each moved this key from the same base, so neither side's figure is the sum). Never added by hand. */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 3175 -> 3202 from this guard's own print on the item's tree: the four new regions' lines (8 + 7 + 6 + 6). ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 3175 -> 3204 from this guard's own print on the item's tree over origin/main 02603e88: the 29 lines inside the three new regions (12 + 7 + 10 as the per-site line prints them; A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 3175. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 3175 -> 3217 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — 6 + 28 + 8 lines, the three regions. */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 3175 -> 3197 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. is-connection-choice's 22 lines. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 3175 -> 3198 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +23 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 3392 -> 3415 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 3175 -> 3221 from this guard's own print on the item's tree — +46: the lines inside those five regions. */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 3175 -> 3195 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 3294 -> 3299 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 3294, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 3175 -> 3262 from this guard's own print on the item's tree over origin/main 02603e88: the new region, 87 lines. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 3175, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 3151 -> 3163 from this guard's own print on the item's tree: the new region is-register-home, 12 lines as printed on the per-site line; no other region moved. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-125 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-125 (2026-09-23, land/worker/D-125): MOVED 3151 -> 3153 from this guard's own print on the item's tree over origin/main 91bcea6b, every other ratchet key gated at slack 0 on the same run: queueMute > is-mute-class now refuses an OBLIGATION by class for BOTH the kind and the item form (the test reads PERSONALLY_MUTABLE_CLASSES and the refusal names `item` or `kind`), +2 lines. ZERO pre-existing slack: the baseline run on 91bcea6b printed exactly 3151. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 3151 -> 3169 from this guard's own print on the item's tree, every other ratchet key gated. the lines inside those three new regions. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 3112 -> 3130 from this guard's own print on the item's tree: the lines inside the new region is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 3112, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 3123 -> 3130 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 3123. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 3123 -> 3129 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. 6 lines inside checkContentExtent > is-content-extent (273L -> 279L: the page-form call and its comment) — A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 3123 -> 3134 from this guard's own print on the merged tree — the eleven lines of the new arm inside checkContentExtent > is-content-extent. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 3112 -> 3123 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The 11 lines inside is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3): MOVED 3104 -> 3112 from this guard's own print on the item's tree, every other ratchet key gated. 8 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 3072 -> 3104 from this guard's own print on the item's tree, every other ratchet key gated. 32 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 3043 -> 3072 from this guard's own print on the item's tree: all 29 lines inside captureRequest > is-capture-request (91L -> 120L: the run's sight, the principal relay, the status refusal and their comments). Slack 0 on main (M0-79). A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 2991 -> 3030 from this guard's own print on the item's tree: all 39 lines inside suggestVersion > is-suggest-shape (the run's sight, principal relay, status and BOB #28's context check, with their comments). Slack 0 on main (M0-79). A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 2973 -> 2991 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 5 + 13 lines, as the per-site line prints them. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 2952 -> 2973 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 2963, so 11 of the move is PRE-EXISTING SLACK and +10 is this item's (the 10 lines inside is-signer-member-attesting — AND A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 2215 -> 2952 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 2910, so 695 of the move is PRE-EXISTING SLACK and +42 is this item's (+29 is-session-op-gate, +7 is-required-argument, +6 on fetch > is-admission whose header comment is CORRECTED because the session gate has left it — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 2035 -> 2215 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 2094, so 59 of the move is PRE-EXISTING slack and +121 — AND regionLines IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration is this item's. */ /* MOVED 1407 -> 1425 BY REC-69'S REPLAY, 2026-08-09, RE-READ FROM A GREEN RUN */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* REC-159 (§4.9 custodial acts, 2026-09-23, cloud session WORKER REC-159, branch land/worker/REC-159): MOVED 3294 -> 3297 from this guard's own print on the item's tree over origin/main a8f6094a, every other ratchet key gated at slack 0 on the same run: fetch > is-admission 108L -> 111L, the three-line comment at the class check saying why a row carrying `machineClasses` judges a bearer against it. No code, row or refusal was added (the one CLASS_FORBIDDEN site is unchanged). ZERO pre-existing slack: 3294 is the floor at bound 0 on a8f6094a. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 3175 -> 3262 from this guard's own print on the item's tree over origin/main 02603e88: the new region, 87 lines. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 3175, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 3151 -> 3163 from this guard's own print on the item's tree: the new region is-register-home, 12 lines as printed on the per-site line; no other region moved. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-125 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-125 (2026-09-23, land/worker/D-125): MOVED 3151 -> 3153 from this guard's own print on the item's tree over origin/main 91bcea6b, every other ratchet key gated at slack 0 on the same run: queueMute > is-mute-class now refuses an OBLIGATION by class for BOTH the kind and the item form (the test reads PERSONALLY_MUTABLE_CLASSES and the refusal names `item` or `kind`), +2 lines. ZERO pre-existing slack: the baseline run on 91bcea6b printed exactly 3151. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 3151 -> 3169 from this guard's own print on the item's tree, every other ratchet key gated. the lines inside those three new regions. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 3112 -> 3130 from this guard's own print on the item's tree: the lines inside the new region is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 3112, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 3123 -> 3130 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 3123. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 3123 -> 3129 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. 6 lines inside checkContentExtent > is-content-extent (273L -> 279L: the page-form call and its comment) — A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 3123 -> 3134 from this guard's own print on the merged tree — the eleven lines of the new arm inside checkContentExtent > is-content-extent. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 3112 -> 3123 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The 11 lines inside is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3): MOVED 3104 -> 3112 from this guard's own print on the item's tree, every other ratchet key gated. 8 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 3072 -> 3104 from this guard's own print on the item's tree, every other ratchet key gated. 32 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 3043 -> 3072 from this guard's own print on the item's tree: all 29 lines inside captureRequest > is-capture-request (91L -> 120L: the run's sight, the principal relay, the status refusal and their comments). Slack 0 on main (M0-79). A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 2991 -> 3030 from this guard's own print on the item's tree: all 39 lines inside suggestVersion > is-suggest-shape (the run's sight, principal relay, status and BOB #28's context check, with their comments). Slack 0 on main (M0-79). A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 2973 -> 2991 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 5 + 13 lines, as the per-site line prints them. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 2952 -> 2973 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 2963, so 11 of the move is PRE-EXISTING SLACK and +10 is this item's (the 10 lines inside is-signer-member-attesting — AND A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 2215 -> 2952 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 2910, so 695 of the move is PRE-EXISTING SLACK and +42 is this item's (+29 is-session-op-gate, +7 is-required-argument, +6 on fetch > is-admission whose header comment is CORRECTED because the session gate has left it — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 2035 -> 2215 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 2094, so 59 of the move is PRE-EXISTING slack and +121 — AND regionLines IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration is this item's. */ /* MOVED 1407 -> 1425 BY REC-69'S REPLAY, 2026-08-09, RE-READ FROM A GREEN RUN */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): REC-159 merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 3294 -> 3367 from this guard's own print on the item's tree, every other ratchet key gated. The six regions' 73 lines (23+19+6+8+11+6). ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 3294 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 3175 -> 3262 from this guard's own print on the item's tree over origin/main 02603e88: the new region, 87 lines. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 3175, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 3151 -> 3163 from this guard's own print on the item's tree: the new region is-register-home, 12 lines as printed on the per-site line; no other region moved. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-125 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-125 (2026-09-23, land/worker/D-125): MOVED 3151 -> 3153 from this guard's own print on the item's tree over origin/main 91bcea6b, every other ratchet key gated at slack 0 on the same run: queueMute > is-mute-class now refuses an OBLIGATION by class for BOTH the kind and the item form (the test reads PERSONALLY_MUTABLE_CLASSES and the refusal names `item` or `kind`), +2 lines. ZERO pre-existing slack: the baseline run on 91bcea6b printed exactly 3151. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 3151 -> 3169 from this guard's own print on the item's tree, every other ratchet key gated. the lines inside those three new regions. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 3112 -> 3130 from this guard's own print on the item's tree: the lines inside the new region is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 3112, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 3123 -> 3130 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 3123. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 3123 -> 3129 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. 6 lines inside checkContentExtent > is-content-extent (273L -> 279L: the page-form call and its comment) — A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 3123 -> 3134 from this guard's own print on the merged tree — the eleven lines of the new arm inside checkContentExtent > is-content-extent. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 3112 -> 3123 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The 11 lines inside is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3): MOVED 3104 -> 3112 from this guard's own print on the item's tree, every other ratchet key gated. 8 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 3072 -> 3104 from this guard's own print on the item's tree, every other ratchet key gated. 32 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 3043 -> 3072 from this guard's own print on the item's tree: all 29 lines inside captureRequest > is-capture-request (91L -> 120L: the run's sight, the principal relay, the status refusal and their comments). Slack 0 on main (M0-79). A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 2991 -> 3030 from this guard's own print on the item's tree: all 39 lines inside suggestVersion > is-suggest-shape (the run's sight, principal relay, status and BOB #28's context check, with their comments). Slack 0 on main (M0-79). A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 2973 -> 2991 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 5 + 13 lines, as the per-site line prints them. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 2952 -> 2973 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 2963, so 11 of the move is PRE-EXISTING SLACK and +10 is this item's (the 10 lines inside is-signer-member-attesting — AND A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 2215 -> 2952 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 2910, so 695 of the move is PRE-EXISTING SLACK and +42 is this item's (+29 is-session-op-gate, +7 is-required-argument, +6 on fetch > is-admission whose header comment is CORRECTED because the session gate has left it — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 2035 -> 2215 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 2094, so 59 of the move is PRE-EXISTING slack and +121 — AND regionLines IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration is this item's. */ /* MOVED 1407 -> 1425 BY REC-69'S REPLAY, 2026-08-09, RE-READ FROM A GREEN RUN */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  regionLines: 3609, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): MOVED 3593 -> 3609 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. the 16 lines inside those two regions. */ /* c19-unionfix (c19-batch9, 2026-09-24): 3584 -> 3593, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #19 (c19-batch9, 2026-09-24): REC-159 merged over the batch — its custodial regions — 3508 -> 3511 RE-READ from --strict on the merged tree. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 3483 -> 3503 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 3437 -> 3483 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 3414 -> 3437 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 3392 -> 3414 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 3350 -> 3392 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 3321 -> 3350 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 3294 -> 3321 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 3175 -> 3262 from this guard's own print on the item's tree over origin/main 02603e88: the new region, 87 lines. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 3175, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 3151 -> 3163 from this guard's own print on the item's tree: the new region is-register-home, 12 lines as printed on the per-site line; no other region moved. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-125 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-125 (2026-09-23, land/worker/D-125): MOVED 3151 -> 3153 from this guard's own print on the item's tree over origin/main 91bcea6b, every other ratchet key gated at slack 0 on the same run: queueMute > is-mute-class now refuses an OBLIGATION by class for BOTH the kind and the item form (the test reads PERSONALLY_MUTABLE_CLASSES and the refusal names `item` or `kind`), +2 lines. ZERO pre-existing slack: the baseline run on 91bcea6b printed exactly 3151. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 3151 -> 3169 from this guard's own print on the item's tree, every other ratchet key gated. the lines inside those three new regions. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 3112 -> 3130 from this guard's own print on the item's tree: the lines inside the new region is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 3112, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 3123 -> 3130 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 3123. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 3123 -> 3129 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. 6 lines inside checkContentExtent > is-content-extent (273L -> 279L: the page-form call and its comment) — A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 3123 -> 3134 from this guard's own print on the merged tree — the eleven lines of the new arm inside checkContentExtent > is-content-extent. A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 3112 -> 3123 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The 11 lines inside is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3): MOVED 3104 -> 3112 from this guard's own print on the item's tree, every other ratchet key gated. 8 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 3072 -> 3104 from this guard's own print on the item's tree, every other ratchet key gated. 32 lines, as the per-site line prints them — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 3043 -> 3072 from this guard's own print on the item's tree: all 29 lines inside captureRequest > is-capture-request (91L -> 120L: the run's sight, the principal relay, the status refusal and their comments). Slack 0 on main (M0-79). A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 2991 -> 3030 from this guard's own print on the item's tree: all 39 lines inside suggestVersion > is-suggest-shape (the run's sight, principal relay, status and BOB #28's context check, with their comments). Slack 0 on main (M0-79). A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration. */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 2973 -> 2991 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 5 + 13 lines, as the per-site line prints them. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 2952 -> 2973 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 2963, so 11 of the move is PRE-EXISTING SLACK and +10 is this item's (the 10 lines inside is-signer-member-attesting — AND A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 2215 -> 2952 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 2910, so 695 of the move is PRE-EXISTING SLACK and +42 is this item's (+29 is-session-op-gate, +7 is-required-argument, +6 on fetch > is-admission whose header comment is CORRECTED because the session gate has left it — and A REGION'S LINE COUNT IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 2035 -> 2215 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 2094, so 59 of the move is PRE-EXISTING slack and +121 — AND regionLines IS A PROPERTY OF THE MERGED SOURCE, so CONDUCT re-reads it at integration is this item's. */ /* MOVED 1407 -> 1425 BY REC-69'S REPLAY, 2026-08-09, RE-READ FROM A GREEN RUN
                          nothing else. **CONDUCT MUST RE-READ THIS FROM A GREEN RUN OF THE MERGED
                          TREE RATHER THAN TRUST THIS NUMBER** — it is a property of the MERGED source
                          and it has moved at integration FOUR times, most recently when REC-75 landed
                          inside two `suggestVersion` regions during REC-64's integration and left this
                          figure 43 low. REC-79's region is in `index.mjs`, which is one of the three
                          contended files, so the risk is live rather than theoretical.

                          MOVED 1407 -> 1425 BY REC-69'S REPLAY, 2026-08-09, RE-READ FROM A GREEN RUN
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
                       // CORRECTED 2026-09-21 by M0-79, never exempted: "an ordinary edit ADDING
                       // lines inside a governed arm still passes" was true of a one-sided floor and
                       // is how this figure came to carry 83, 56, 226, 59 and then 695 lines of slack
                       // (the D-309, REC-84, REC-97, REC-86 and D-270 notes above) — a collapse of up
                       // to that many lines was invisible to the aggregate. An edit adding lines inside
                       // a governed region now FAILS until this floor is moved to the printed figure in
                       // the same commit (`SLACK.regionLines`, bound 0). Because a region's line count
                       // is a property of the MERGED source, the integrator's re-read of it on the
                       // merged tree is now enforced by the gate rather than asked for in a note.
  /* D-309 2026-09-10: 152 -> 167. pristine tree printed 165, this item's 167 — so 13 of this move was PRE-EXISTING SLACK and 2 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): codesChecked 167 -> 177. PRISTINE `origin/main` at 9a713f1 printed 175, this item's tree 177 — so 8 of this move was PRE-EXISTING SLACK and 2 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): codesChecked 177 -> 201. PRISTINE `origin/main` at 173bc66 printed 197, this item's committed tree (2e5d21f) 201 — so 20 of this move was PRE-EXISTING SLACK and 4 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 323 -> 324 from this guard's own print on the item's tree, every other ratchet key gated. 1 code compared at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* [CONDUCT #14 at REC-167's merge onto REC-165's main] 2026-09-22: RE-READ from this guard's own print on the COMMITTED merge — measured 326 (REC-165 and REC-167 each moved this key from the same base, so neither side's figure is the sum). Never added by hand. */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 349 -> 353 from this guard's own print on the item's tree: the four codes compared at their new sites. ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 349 -> 357 from this guard's own print on the item's tree over origin/main 02603e88: the eight C-72 codes compared at their sites. ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 349. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 349 -> 356 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — 1 + 5 + 1 codes compared in the three regions. */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 349 -> 352 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. the three C-74 codes compared inside is-connection-choice. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 349 -> 353 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +4 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 383 -> 387 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 349 -> 357 from this guard's own print on the item's tree — +8: the codes compared inside the five new regions. */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 349 -> 352 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 364 -> 365 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 364, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 349 -> 358 from this guard's own print on the item's tree over origin/main 02603e88: the nine refusal sites in the new region. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 349, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 345 -> 346 from this guard's own print on the item's tree: the one code compared at is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 345 -> 350 from this guard's own print on the item's tree, every other ratchet key gated. the five new codes compared at their sites. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 339 -> 341 from this guard's own print on the item's tree: the codes compared inside the new region, as the per-site walk counts them. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 339, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 341 -> 342 from this guard's own print on the merged tree: checkConsume compares 8 codes where it compared 7 (`checkConsume 77L (8 judged, 8 code(s) checked)`). ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 341 -> 342 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 341. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 341 -> 342 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. The one literal code the region now compares (32 -> 33 at is-content-extent). ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 341 -> 342 from this guard's own print on the merged tree — the one new literal compared against its row. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 334 -> 336 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The codes compared inside is-promote-digest, as the per-site line printed them (2 for 1 judged). ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 333 -> 338 from this guard's own print: checkConsume compares 7 codes where it compared 2 (pristine HEAD 91913d6b printed `checkConsume 17L (2 judged, 2 code(s) checked)` and 333; this tree prints 67L, 7 and 7) — the map refusal, the list's two, the unknown key and `lease`, every one a literal inside the one governed span. The move is exactly this item's; every other key gated on the same run.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 333 -> 334 from this guard's own print on the merged tree, every other ratchet key gated. 1 code compared at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 331 -> 333 from this guard's own print on the item's tree: checkConsume compares 2 codes, as printed. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 327 -> 331 from this guard's own print on the item's tree, every other ratchet key gated. 4 codes compared at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 326 -> 327 from this guard's own print: is-capture-request compares 8 where it compared 7 — the status refusal's own CAPTURE_REQUEST_NO_RUN literal. The relayed AI_RUN_NOT_PRINCIPAL is judged and NOT compared (a variable code; its literal stays at runPrincipalGate). Slack 0 on main (M0-79). */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 323 -> 325 from this guard's own print: the two literal codes is-suggest-shape now compares (SUGGEST_RUN_NOT_RUNNING, SUGGEST_OUTSIDE_RUN_CONTEXT). The relayed AI_RUN_NOT_PRINCIPAL is judged and NOT compared (a variable code; its literal stays at runPrincipalGate). Slack 0 on main (M0-79). */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 319 -> 323 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 2 + 2 codes compared at the two spans, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 316 -> 319 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 317, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two codes the new region compares). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 218 -> 316 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 313, so 95 of the move is PRE-EXISTING SLACK and +3 is this item's (+3 net: the four new region codes less the one that left is-admission). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 201 -> 218 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 204, so 3 of the move is PRE-EXISTING slack and +14 (the eleven C-50 codes, plus three the moved regions compare) is this item's. */ // + REC-69's THREE (C-36.1..3), all COMPARED: the region's `refusal` helper sits
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 364 -> 375 from this guard's own print on the item's tree, every other ratchet key gated. Eleven codes compared at those sites (C-74.1 at two branches). ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 364 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 349 -> 358 from this guard's own print on the item's tree over origin/main 02603e88: the nine refusal sites in the new region. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 349, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 345 -> 346 from this guard's own print on the item's tree: the one code compared at is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 345 -> 350 from this guard's own print on the item's tree, every other ratchet key gated. the five new codes compared at their sites. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 339 -> 341 from this guard's own print on the item's tree: the codes compared inside the new region, as the per-site walk counts them. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 339, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 341 -> 342 from this guard's own print on the merged tree: checkConsume compares 8 codes where it compared 7 (`checkConsume 77L (8 judged, 8 code(s) checked)`). ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 341 -> 342 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 341. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 341 -> 342 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. The one literal code the region now compares (32 -> 33 at is-content-extent). ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 341 -> 342 from this guard's own print on the merged tree — the one new literal compared against its row. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 334 -> 336 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The codes compared inside is-promote-digest, as the per-site line printed them (2 for 1 judged). ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 333 -> 338 from this guard's own print: checkConsume compares 7 codes where it compared 2 (pristine HEAD 91913d6b printed `checkConsume 17L (2 judged, 2 code(s) checked)` and 333; this tree prints 67L, 7 and 7) — the map refusal, the list's two, the unknown key and `lease`, every one a literal inside the one governed span. The move is exactly this item's; every other key gated on the same run.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 333 -> 334 from this guard's own print on the merged tree, every other ratchet key gated. 1 code compared at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 331 -> 333 from this guard's own print on the item's tree: checkConsume compares 2 codes, as printed. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 327 -> 331 from this guard's own print on the item's tree, every other ratchet key gated. 4 codes compared at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 326 -> 327 from this guard's own print: is-capture-request compares 8 where it compared 7 — the status refusal's own CAPTURE_REQUEST_NO_RUN literal. The relayed AI_RUN_NOT_PRINCIPAL is judged and NOT compared (a variable code; its literal stays at runPrincipalGate). Slack 0 on main (M0-79). */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 323 -> 325 from this guard's own print: the two literal codes is-suggest-shape now compares (SUGGEST_RUN_NOT_RUNNING, SUGGEST_OUTSIDE_RUN_CONTEXT). The relayed AI_RUN_NOT_PRINCIPAL is judged and NOT compared (a variable code; its literal stays at runPrincipalGate). Slack 0 on main (M0-79). */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 319 -> 323 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 2 + 2 codes compared at the two spans, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 316 -> 319 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 317, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two codes the new region compares). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 218 -> 316 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 313, so 95 of the move is PRE-EXISTING SLACK and +3 is this item's (+3 net: the four new region codes less the one that left is-admission). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 201 -> 218 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 204, so 3 of the move is PRE-EXISTING slack and +14 (the eleven C-50 codes, plus three the moved regions compare) is this item's. */ // + REC-69's THREE (C-36.1..3), all COMPARED: the region's `refusal` helper sits
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  codesChecked: 418, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): MOVED 414 -> 418 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. two codes compared at each of the two new sites (`reason:` and `code:`, both string literals at the site, which is what makes them comparable at all). */ /* c19-unionfix (c19-batch9, 2026-09-24): 413 -> 414, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 398 -> 401 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 390 -> 398 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 386 -> 390 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 383 -> 386 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 376 -> 383 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 368 -> 376 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 364 -> 368 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 349 -> 358 from this guard's own print on the item's tree over origin/main 02603e88: the nine refusal sites in the new region. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 349, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 345 -> 346 from this guard's own print on the item's tree: the one code compared at is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 345 -> 350 from this guard's own print on the item's tree, every other ratchet key gated. the five new codes compared at their sites. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 339 -> 341 from this guard's own print on the item's tree: the codes compared inside the new region, as the per-site walk counts them. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 339, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 341 -> 342 from this guard's own print on the merged tree: checkConsume compares 8 codes where it compared 7 (`checkConsume 77L (8 judged, 8 code(s) checked)`). ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 341 -> 342 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 341. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 341 -> 342 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. The one literal code the region now compares (32 -> 33 at is-content-extent). ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 341 -> 342 from this guard's own print on the merged tree — the one new literal compared against its row. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 334 -> 336 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The codes compared inside is-promote-digest, as the per-site line printed them (2 for 1 judged). ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 333 -> 338 from this guard's own print: checkConsume compares 7 codes where it compared 2 (pristine HEAD 91913d6b printed `checkConsume 17L (2 judged, 2 code(s) checked)` and 333; this tree prints 67L, 7 and 7) — the map refusal, the list's two, the unknown key and `lease`, every one a literal inside the one governed span. The move is exactly this item's; every other key gated on the same run.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 333 -> 334 from this guard's own print on the merged tree, every other ratchet key gated. 1 code compared at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 331 -> 333 from this guard's own print on the item's tree: checkConsume compares 2 codes, as printed. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 327 -> 331 from this guard's own print on the item's tree, every other ratchet key gated. 4 codes compared at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 326 -> 327 from this guard's own print: is-capture-request compares 8 where it compared 7 — the status refusal's own CAPTURE_REQUEST_NO_RUN literal. The relayed AI_RUN_NOT_PRINCIPAL is judged and NOT compared (a variable code; its literal stays at runPrincipalGate). Slack 0 on main (M0-79). */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 323 -> 325 from this guard's own print: the two literal codes is-suggest-shape now compares (SUGGEST_RUN_NOT_RUNNING, SUGGEST_OUTSIDE_RUN_CONTEXT). The relayed AI_RUN_NOT_PRINCIPAL is judged and NOT compared (a variable code; its literal stays at runPrincipalGate). Slack 0 on main (M0-79). */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 319 -> 323 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 2 + 2 codes compared at the two spans, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 316 -> 319 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 317, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the two codes the new region compares). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 218 -> 316 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 313, so 95 of the move is PRE-EXISTING SLACK and +3 is this item's (+3 net: the four new region codes less the one that left is-admission). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 201 -> 218 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 204, so 3 of the move is PRE-EXISTING slack and +14 (the eleven C-50 codes, plus three the moved regions compare) is this item's. */ // + REC-69's THREE (C-36.1..3), all COMPARED: the region's `refusal` helper sits
                       // refusals JUDGED, and not the same as lines read. Was 119 pre-REC-76 (and 118 on
                       // minted at two conditions in the span). Every code there is a STRING LITERAL
                       // at its site precisely so this number can move; `admissionRow` supplies the
                       // C-number and the sentence, and it THROWS rather than returning a partial row.
                       // + REC-69's THREE (C-36.1..3), all COMPARED: the region's `refusal` helper sits
                       // ABOVE the marker and every call inside it names its code as a STRING LITERAL,
                       // which is the convention the note below says is what makes arm C bite.
                       // refusal codes actually COMPARED against a family row — NOT the same as
                       // refusals JUDGED, and not the same as lines read. Was 141 pre-REC-69,
                       // 119 pre-REC-76 (and 118 on
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
  /* D-309 2026-09-10: 83 -> 84. pristine tree printed 84, this item's 84 — so 1 of this move was PRE-EXISTING SLACK and 0 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): outcomeReturns 84 -> 86. PRISTINE `origin/main` at 9a713f1 printed 84, this item's tree 86 — so 0 of this move was PRE-EXISTING SLACK and 2 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): outcomeReturns 86 -> 98. PRISTINE `origin/main` at 173bc66 printed 94, this item's committed tree (2e5d21f) 98 — so 8 of this move was PRE-EXISTING SLACK and 4 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* M0-79 2026-09-21 (worktree agent-a6d389a12c371468a): outcomeReturns 98 -> 127, from THIS GUARD'S OWN PRINT
     (`arm C: THE OUTCOME WALK — 127 return-position outcome(s) read … floors 98 corpus / 319 refusals · corpus GREW by
     29`, exit 0) on `origin/main` @ 4fac1548, which is this item's tree for every source the figure reads — M0-79 edits
     the guard and its suites, never a governed span — so ALL 29 are PRE-EXISTING SLACK and none is M0-79's. The notes on
     `refusalsJudged` below record three items that moved THAT floor after REC-97 set this one (REC-86, D-270, D-158),
     each from the line that prints both floors side by side, and none moved this one. It is the slack the row was
     written about, and the first figure the slack gate (`SLACK`, below `CEILING`) fails on when it is left behind. */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 135 -> 136 from this guard's own print on the item's tree: one new return-position outcome read by the walk (136, from 135); WHICH of the four new sites contributes it was not established — the print gives the total, not the site. ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 135 -> 142 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — the seven refusal returns in the three regions. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 135 -> 136 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +1 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 135 -> 137 from this guard's own print on the item's tree — +2: the return-position outcomes in the new regions (the retained summary is written out LITERALLY so it is not an inherited verdict; inheritedVerdicts held at 4). */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 140 -> 141 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 140, every key gated at slack 0. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 135 -> 140 from this guard's own print on the item's tree, every other ratchet key gated. five new return-position refusals at the three spans. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 132 -> 133 from this guard's own print on the item's tree: the one new return-position refusal in is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 132, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-176 (C-67.1 SNAP_KEY_TAKEN in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-af684c758de00aae7): MOVED 132 -> 133 from this guard's own print on the item's tree: is-promote-snapkey's one return. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own, read off the per-site line.  — CONDUCT #16 merged it with REC-175, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 132 -> 133 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The one return-position outcome in is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 131 -> 132 from this guard's own print on the item's tree: aiRunOpen's new seed refusal return. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 130 -> 131 from this guard's own print on the item's tree, every other ratchet key gated. The new span's relayed AI_RUN_NOT_PRINCIPAL return (the gate's code, field by field, never a spread). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */   /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 129 -> 130 from this guard's own print on the item's tree; the two new returns in is-capture-request moved it by one, and WHICH of them the walk counts as the new outcome was not traced here (stated, not guessed). Slack 0 on main (M0-79). */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 128 -> 129 from this guard's own print on the item's tree; the three new returns in is-suggest-shape moved it by one, and WHICH of them the walk counts as the new outcome was not traced here (stated, not guessed). Slack 0 on main (M0-79). */ /* D-436 AT INTEGRATION (CONDUCT #11, 2026-09-21, merged onto origin/main 8d2ba50f): MOVED 127 -> 128 from this guard's own print on the MERGED tree, where M0-79's slack gate FAILED naming it (floor 127, measured 128). The branch's base (ce830340) floored this figure at 98 with slack, so the branch never moved it; M0-79 moved main's to 127 at slack 0 (45064d8f, and nothing but docs/ changed from there to 8d2ba50f). So ZERO of the move is pre-existing slack and +1 is D-436's one new return-position outcome at a governed site. */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  outcomeReturns: 154, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): MOVED 152 -> 154 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. the two helpers' single return each. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 149 -> 151 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 148 -> 149 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 141 -> 148 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 140 -> 141 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 135 -> 140 from this guard's own print on the item's tree, every other ratchet key gated. five new return-position refusals at the three spans. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 132 -> 133 from this guard's own print on the item's tree: the one new return-position refusal in is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 132, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-176 (C-67.1 SNAP_KEY_TAKEN in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-af684c758de00aae7): MOVED 132 -> 133 from this guard's own print on the item's tree: is-promote-snapkey's one return. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own, read off the per-site line.  — CONDUCT #16 merged it with REC-175, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 132 -> 133 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. The one return-position outcome in is-promote-digest. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 131 -> 132 from this guard's own print on the item's tree: aiRunOpen's new seed refusal return. The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 130 -> 131 from this guard's own print on the item's tree, every other ratchet key gated. The new span's relayed AI_RUN_NOT_PRINCIPAL return (the gate's code, field by field, never a spread). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */   /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 129 -> 130 from this guard's own print on the item's tree; the two new returns in is-capture-request moved it by one, and WHICH of them the walk counts as the new outcome was not traced here (stated, not guessed). Slack 0 on main (M0-79). */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 128 -> 129 from this guard's own print on the item's tree; the three new returns in is-suggest-shape moved it by one, and WHICH of them the walk counts as the new outcome was not traced here (stated, not guessed). Slack 0 on main (M0-79). */ /* D-436 AT INTEGRATION (CONDUCT #11, 2026-09-21, merged onto origin/main 8d2ba50f): MOVED 127 -> 128 from this guard's own print on the MERGED tree, where M0-79's slack gate FAILED naming it (floor 127, measured 128). The branch's base (ce830340) floored this figure at 98 with slack, so the branch never moved it; M0-79 moved main's to 127 at slack 0 (45064d8f, and nothing but docs/ changed from there to 8d2ba50f). So ZERO of the move is pre-existing slack and +1 is D-436's one new return-position outcome at a governed site. */
                         /* REC-76 — THE CORPUS OF ARM C'S OUTCOME WALK: return-position object
                          separating: EIGHT are `is-admission`'s own outcomes, and ONE is a return the
                          walk could never see before — `suggestVersion > is-suggest-write`'s
                          `return remember({ ...promoted, … })`, at a site that has been governed since
                          REC-75 and was reporting one judged refusal where there were two. A corpus
                          floor that grows when a READER gains sight is the direction this figure
                          exists to make visible.

                          REC-76 — THE CORPUS OF ARM C'S OUTCOME WALK: return-position object
                          literals across the governed spans. Set from what the guard PRINTED on
                          a green run of this worktree. It is floored SEPARATELY from
                          `refusalsJudged` because the two fail for different reasons — the
                          corpus collapses when the return reader goes blind, the yield when the
                          verdict rule does — and a headline assertion that PASSED OVER AN EMPTY
                          CORPUS is this project's most recent instrument defect. */
  /* D-309 2026-09-10: 156 -> 170. pristine tree printed 168, this item's 170 — so 12 of this move was PRE-EXISTING SLACK and 2 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): refusalsJudged 170 -> 180. PRISTINE `origin/main` at 9a713f1 printed 178, this item's tree 180 — so 8 of this move was PRE-EXISTING SLACK and 2 is REC-84's. */
  /* REC-97 2026-09-14 (worktree agent-a39cfbab2c77ec9e4): refusalsJudged 180 -> 203. PRISTINE `origin/main` at 173bc66 printed 199, this item's committed tree (2e5d21f) 203 — so 19 of this move was PRE-EXISTING SLACK and 4 is REC-97's (the four C-45 rows for `op=cite`'s extent and the one new region `cite > is-cite-extent`). */
  /* REC-167 (C-65 CASE_CONCLUSION_CHECKS, 2026-09-22, worktree agent-a33d4bac9a4ff9d3a): MOVED 322 -> 323 from this guard's own print on the item's tree, every other ratchet key gated. 1 refusal judged at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* [CONDUCT #14 at REC-167's merge onto REC-165's main] 2026-09-22: RE-READ from this guard's own print on the COMMITTED merge — measured 326 (REC-165 and REC-167 each moved this key from the same base, so neither side's figure is the sum). Never added by hand. */
  /* REC-164 (C-64.4..C-64.7, the group's display name and verified domain, 2026-09-23, branch land/worker/REC-164): MOVED 349 -> 353 from this guard's own print on the item's tree: the four new refusals. ZERO pre-existing slack: every other key gated at slack 0 on the same run. */
  /* D-148 (C-72 QUOTE_CHECKS, 2026-09-23, cloud session WORKER D-148 (CONDUCT #17)): MOVED 349 -> 357 from this guard's own print on the item's tree over origin/main 02603e88: the eight refusals inside the three regions. ZERO of the move is pre-existing slack: the pristine origin/main 02603e88, run in a scratch worktree, printed exactly 349. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 349 -> 356 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — the same seven. */
  /* REC-122 (C-74 CONNECTION_CHOICE_CHECKS, IC-232, 2026-09-23, cloud session WORKER REC-122): MOVED 349 -> 352 from this guard's own --strict print on the item's tree over origin/main 02603e88, every other ratchet key gated. the three C-74 refusals judged inside is-connection-choice. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */
  /* REC-149 (C-70 PROJECT_VISIBILITY_CHECKS, 2026-09-23, branch land/worker/REC-149): MOVED 349 -> 354 from this guard's own print on the item's tree. ZERO of the move is pre-existing slack: the guard run over PRISTINE origin/main (02603e88) printed every key at its floor, GREEN, so +5 is this item's (one family, four rows C-70.1..4, three governed regions). */
  /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 383 -> 388 RE-READ from this guard's --strict print on the committed merge 16400d39. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 349 -> 355 from this guard's own print on the item's tree — +6: five C-75 refusals and NOT_YOURS, each graded at its region. */
  /* D-394 (C-80 VERSION_NOTICE_CHECKS, 2026-09-23, cloud WORKER D-394): MOVED 349 -> 352 from this guard's own --strict print on the item's tree, every other ratchet key gated. One new family (VERSION_NOTICE_CHECKS), three rows and three codes (VERSION_NOTICE_NO_SUBJECT, _NO_INQUIRY, _NO_CONTENT), one new governed region is-version-notice-subject in Store#versionNotice (20 lines). ZERO of the move is pre-existing slack: the unmodified tree printed every key gated at its floor (0 slack) before this item's edit. */
  /* D-456 (C-78 NAMESPACE_CHECKS, 2026-09-23, cloud session WORKER D-456 (CONDUCT #18), branch land/worker/D-456): MOVED 364 -> 365 from this guard's own --strict print on the item's tree over origin/main a8f6094a: one new family, one row (NAMESPACE_UNKNOWN), one governed region (namespaceGate > is-namespace-gate, 5 lines), one code judged and compared. ZERO of the move is pre-existing slack: the same guard on a8f6094a before the change printed 364, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 349 -> 358 from this guard's own print on the item's tree over origin/main 02603e88: the nine refusal sites in the new region. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 349, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 345 -> 346 from this guard's own print on the item's tree: the one refusal returned at is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 345 -> 350 from this guard's own print on the item's tree, every other ratchet key gated. the same five refusals judged. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 342 -> 343 from this guard's own print on the item's tree: the one new refusal judged in is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 342, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 343 -> 344 from this guard's own print on the merged tree: the same new refusal at checkConsume (7 -> 8 judged). ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 343 -> 344 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 343. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 343 -> 344 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. That outcome, graded a refusal (32 -> 33 judged at is-content-extent). ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 343 -> 344 from this guard's own print on the merged tree — the one new refusal. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 337 -> 338 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. That outcome, graded a refusal. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 336 -> 341 from this guard's own print: the same five refusals at checkConsume (2 -> 7 judged), pristine HEAD 91913d6b printing 336. ZERO pre-existing slack.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 336 -> 337 from this guard's own print on the merged tree, every other ratchet key gated. 1 refusal judged at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 333 -> 336 from this guard's own print on the item's tree: checkConsume's 2 refusals and aiRunOpen's relayed seed refusal (judged, a variable code, not compared). The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 328 -> 333 from this guard's own print on the item's tree, every other ratchet key gated. 5 refusals judged at the new span, as printed: its four codes and the relayed C-22.12. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 326 -> 328 from this guard's own print: is-capture-request judges 9 where it judged 7 — the status refusal and the principal relay (stated `ok: false`, never spread, so its verdict is readable). Slack 0 on main (M0-79). */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 322 -> 325 from this guard's own print: is-suggest-shape judges 12 where it judged 9 — the two new refusals and the principal relay (stated `ok: false`, never spread, so its verdict is readable). Slack 0 on main (M0-79). */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 319 -> 322 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 1 + 2 refusals judged at the two spans, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 316 -> 319 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 317, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the same two, on codesChecked's arithmetic). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 220 -> 316 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 313, so 93 of the move is PRE-EXISTING SLACK and +3 is this item's (+3 net, on codesChecked's arithmetic). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 203 -> 220 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 206, so 3 of the move is PRE-EXISTING slack and +14 is this item's. */ /* +3 by REC-69 (C-36.1..3 inside `is-airuns-context`), 2026-08-09, from the */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): the security train (D-456, D-447) merged over the batch; RE-READ from this guard's --strict print on the committed merge. */
  /* D-162 (C-81 THEME_CHECKS, minted C-74, 2026-09-23, cloud worker D-162 for CONDUCT #18): MOVED 364 -> 375 from this guard's own print on the item's tree, every other ratchet key gated. Eleven outcomes graded as refusals at those sites. ZERO of the move is pre-existing slack: the same guard run on the tree merged with origin/main (3f4b8f8c) printed exactly 364 plus this item's own, the same delta measured against 02603e88 before the merge. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 349 -> 358 from this guard's own print on the item's tree over origin/main 02603e88: the nine refusal sites in the new region. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 349, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 345 -> 346 from this guard's own print on the item's tree: the one refusal returned at is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 345 -> 350 from this guard's own print on the item's tree, every other ratchet key gated. the same five refusals judged. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 342 -> 343 from this guard's own print on the item's tree: the one new refusal judged in is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 342, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 343 -> 344 from this guard's own print on the merged tree: the same new refusal at checkConsume (7 -> 8 judged). ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 343 -> 344 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 343. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 343 -> 344 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. That outcome, graded a refusal (32 -> 33 judged at is-content-extent). ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 343 -> 344 from this guard's own print on the merged tree — the one new refusal. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 337 -> 338 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. That outcome, graded a refusal. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 336 -> 341 from this guard's own print: the same five refusals at checkConsume (2 -> 7 judged), pristine HEAD 91913d6b printing 336. ZERO pre-existing slack.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 336 -> 337 from this guard's own print on the merged tree, every other ratchet key gated. 1 refusal judged at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 333 -> 336 from this guard's own print on the item's tree: checkConsume's 2 refusals and aiRunOpen's relayed seed refusal (judged, a variable code, not compared). The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 328 -> 333 from this guard's own print on the item's tree, every other ratchet key gated. 5 refusals judged at the new span, as printed: its four codes and the relayed C-22.12. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 326 -> 328 from this guard's own print: is-capture-request judges 9 where it judged 7 — the status refusal and the principal relay (stated `ok: false`, never spread, so its verdict is readable). Slack 0 on main (M0-79). */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 322 -> 325 from this guard's own print: is-suggest-shape judges 12 where it judged 9 — the two new refusals and the principal relay (stated `ok: false`, never spread, so its verdict is readable). Slack 0 on main (M0-79). */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 319 -> 322 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 1 + 2 refusals judged at the two spans, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 316 -> 319 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 317, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the same two, on codesChecked's arithmetic). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 220 -> 316 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 313, so 93 of the move is PRE-EXISTING SLACK and +3 is this item's (+3 net, on codesChecked's arithmetic). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 203 -> 220 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 206, so 3 of the move is PRE-EXISTING slack and +14 is this item's. */ /* +3 by REC-69 (C-36.1..3 inside `is-airuns-context`), 2026-08-09, from the */
  /* CONDUCT #19 (c19-batch9, 2026-09-24): D-162 (the THEME family, renumbered C-74 -> C-81) merged over the batch; RE-READ from this guard's --strict print on the merged tree. */
  refusalsJudged: 415, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): MOVED 413 -> 415 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. each of those two returns is graded a refusal (`ok: false`). */ /* c19-unionfix (c19-batch9, 2026-09-24): 412 -> 413, re-read from this guard's --strict print on the union with IC-246: its ONE new family STATEMENT_ACK_CHECKS (C-82), ONE row and code STATEMENT_ACK_DOCUMENTS_OVER_BOUND, ONE region `is-statement-ack-documents-bound` in acknowledgeStatement. */ /* CONDUCT #18 (c18-batch8, 2026-09-23): D-394 merged over the batch; 397 -> 400 RE-READ from this guard's --strict print on the committed merge 8477cdb5. The new members are D-394's; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 (C-75 and C-76, the per-item weight) merged over the batch; 391 -> 397 RE-READ from this guard's --strict print on the committed merge 6ab139df. The new members are D-126 (C-75 and C-76, the per-item weight)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-149 (C-70, discoverable or hidden) merged over the batch; 386 -> 391 RE-READ from this guard's --strict print on the committed merge f4be4c07. The new members are REC-149 (C-70, discoverable or hidden)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-122 (C-74, the on-point choice) merged over the batch; 383 -> 386 RE-READ from this guard's --strict print on the committed merge e1d34ee0. The new members are REC-122 (C-74, the on-point choice)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 376 -> 383 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-148 (C-72, the fee quote) merged over the batch; 368 -> 376 RE-READ from this guard's --strict print on the committed merge c81aec68. The new members are D-148 (C-72, the fee quote)'s; neither side's figure is the sum. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): REC-164 merged over c17-batch6; 364 -> 368 RE-READ from this guard's --strict print on the committed merge 84443ad4. The new members are REC-164's (C-64.4..C-64.7, the group's name and domain acts); neither side's figure is the sum. */ /* CONDUCT #17 (c17-batch5, 2026-09-23): REC-161 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-161 (C-71 PARTITION_INDEPENDENCE_CHECKS, 2026-09-23, cloud session WORKER REC-161 (CONDUCT #17)): MOVED 349 -> 358 from this guard's own print on the item's tree over origin/main 02603e88: the nine refusal sites in the new region. ZERO of the move is pre-existing slack: the same guard over a pristine 02603e88 worktree printed 349, every key gated at slack 0. */ /* CONDUCT #17 (c17-batch4, 2026-09-23): D-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-179 (C-53.13 CAPTURE_HELD_BY_ANOTHER_BUNDLE, 2026-09-23, branch land/worker/D-179): MOVED 345 -> 346 from this guard's own print on the item's tree: the one refusal returned at is-register-home. ZERO pre-existing slack — every other key gated at 0 on the same run, and the move is exactly this item's own. */ /* CONDUCT #17 (c17-batch3, 2026-09-23): D-278 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-278 (C-68 + C-69, 2026-09-23, branch land/worker/D-278): MOVED 345 -> 350 from this guard's own print on the item's tree, every other ratchet key gated. the same five refusals judged. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): origin/main (c16-batch7) merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* D-168 (C-33.39 RETIRED_NOT_CITABLE in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-ab0b1ebe531cb428b): MOVED 342 -> 343 from this guard's own print on the item's tree: the one new refusal judged in is-cite-retired. ZERO pre-existing slack — the pristine HEAD (0e7cc03e) sources, swapped in and restored by sha256 AND cmp, printed 342, every key gated.  — CONDUCT #16 merged it onto REC-175/REC-176, which moved this key from the same base; the figure is re-read from the merged print. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-177 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-177 (C-22.16 AI_RUN_BOUND_NO_ALLOWANCE in AI_RUN_CHECKS, 2026-09-23, worktree agent-ad7020ce0605889f4), RE-READ ON THE MERGE onto origin/main 0e5f7054 (which carries REC-175's and D-168's moves of this key from the same base): MOVED 343 -> 344 from this guard's own print on the merged tree: the same new refusal at checkConsume (7 -> 8 judged). ZERO of the move is pre-existing slack: every other key gated at slack 0 on the same run. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): REC-179 merged over the batch; value RE-READ from this guard's print on the committed merge. */ /* REC-179 (C-66.5 SURFACED_BY_REWRITTEN in SURFACE_CHECKS, one new region promote > is-promote-surfaced-by, 2026-09-23, worktree agent-a368de25bd347b32f): MOVED 343 -> 344 from this guard's own print on the item's tree MERGED with origin/main 0e5f7054 (REC-175 landed first and moved this key from the same base, so this figure is re-read, never added), every other ratchet key gated. ZERO of the move is pre-existing slack: the merged tree without this item printed 343. */ /* CONDUCT #17 (c17-batch1, 2026-09-23): D-440 and D-420 each moved this key by their own row from 0e5f7054; the union's value is RE-READ from this guard's print on the committed merge. */ /* D-420 (C-45.12 CONTENT_EXTENT_NO_IMAGE_PAINTED in CONTENT_EXTENT_CHECKS, 2026-09-23, cloud session WORKER D-420 (CONDUCT #16)): MOVED 343 -> 344 from this guard's own print on the item's tree over origin/main 0e5f7054, every other ratchet key gated at slack 0 on the same run. That outcome, graded a refusal (32 -> 33 judged at is-content-extent). ZERO of the move is pre-existing slack: the baseline run on 0e5f7054 printed exactly the old floor, so the move is this item's own. D-440 moves this key from the same base; CONDUCT re-reads the figure from the merged print. */ /* D-440 (C-45.11, 2026-09-23, worktree agent-aa6d775965f554582), RE-READ ON ITS MERGE with origin/main 0e5f7054: MOVED 343 -> 344 from this guard's own print on the merged tree — the one new refusal. ZERO pre-existing slack. */ /* REC-175 (C-33.38 FILE_DIGEST_MISMATCH in ACT_SHAPE_CHECKS, 2026-09-23, worktree agent-a6f377d2e96aa24af): MOVED 337 -> 338 from this guard's own print on the item's tree over origin/main 14faa089, every other ratchet key gated at slack 0 on the same run. That outcome, graded a refusal. ZERO of the move is pre-existing slack: the baseline run on 14faa089 printed exactly the old floor, so the move is this item's own.  — CONDUCT #16 merged it with REC-172, which moved this key from the same base; the figure is re-read from the merged print. */ /* REC-172 (2026-09-23, worktree agent-ad79857cb007927b7): MOVED 336 -> 341 from this guard's own print: the same five refusals at checkConsume (2 -> 7 judged), pristine HEAD 91913d6b printing 336. ZERO pre-existing slack.  — CONDUCT #16 merged it with UI-81, which moved this key from the same base; the figure is re-read from the merged print. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3), RE-READ ON THE MERGE onto origin/main 91913d6b (which carries REC-169's moves): MOVED 336 -> 337 from this guard's own print on the merged tree, every other ratchet key gated. 1 refusal judged at the new span, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-169 (C-22.13/C-22.14 in AI_RUN_CHECKS, 2026-09-23, worktree agent-a30f15e61a2d24169): MOVED 333 -> 336 from this guard's own print on the item's tree: checkConsume's 2 refusals and aiRunOpen's relayed seed refusal (judged, a variable code, not compared). The move is exactly this item's own additions, read off the per-site line; every other key gated on the same run. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 328 -> 333 from this guard's own print on the item's tree, every other ratchet key gated. 5 refusals judged at the new span, as printed: its four codes and the relayed C-22.12. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* REC-168 (2026-09-23, worktree agent-a960b19c9e4696303): MOVED 326 -> 328 from this guard's own print: is-capture-request judges 9 where it judged 7 — the status refusal and the principal relay (stated `ok: false`, never spread, so its verdict is readable). Slack 0 on main (M0-79). */ /* REC-165 (2026-09-22, worktree agent-a6e92d28647553f52): MOVED 322 -> 325 from this guard's own print: is-suggest-shape judges 12 where it judged 9 — the two new refusals and the principal relay (stated `ok: false`, never spread, so its verdict is readable). Slack 0 on main (M0-79). */ /* D-436 (C-64 INSTANCE_GROUP_CHECKS, 2026-09-21, worktree agent-a6dd0a0a3a3a6cc10): MOVED 319 -> 322 from this guard's own GREEN print on the item's committed tree 2f09b7b6. 1 + 2 refusals judged at the two spans, as printed. ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ /* D-158 (C-63 SIGNER_ENROLMENT_CHECKS, 2026-09-20, worktree d158-conduct8): MOVED 316 -> 319 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (e1aa2eee) with this item's three plane files (store.mjs, setup.mjs, bio-checks.mjs) swapped out and restored by sha256 AND cmp: pristine printed 317, so 1 of the move is PRE-EXISTING SLACK and +2 is this item's (the same two, on codesChecked's arithmetic). */    /* D-270 (C-38.7/C-38.8 + C-61 REQUIRED_ARGUMENT_CHECKS, 2026-09-19, worktree d270-record): MOVED 220 -> 316 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE origin/main sources (98209ce2) with this item's two plane files swapped out and restored by sha256 AND cmp: pristine printed 313, so 93 of the move is PRE-EXISTING SLACK and +3 is this item's (+3 net, on codesChecked's arithmetic). */   /* REC-86 (IC-123, C-50 NARROW_CHECKS, 2026-09-18, worktree agent-a3fbd59a3fef1a961): MOVED 203 -> 220 from this guard's own GREEN print on the item's tree. Split, measured by running this guard over the PRISTINE HEAD sources (92f4c64e) with the item's four plane files swapped out and restored by sha256 + cmp: pristine printed 206, so 3 of the move is PRE-EXISTING slack and +14 is this item's. */ /* +3 by REC-69 (C-36.1..3 inside `is-airuns-context`), 2026-08-09, from the
                          2026-08-09, from the printed figure on a green run.

                          +3 by REC-69 (C-36.1..3 inside `is-airuns-context`), 2026-08-09, from the
                          printed figure on a green run of the merged tree. `outcomeReturns` does NOT
                          move: the three refusals are all return positions inside ONE outcome the
                          walk already counted, which is what the two figures being separate is for.
                          REC-76 — the YIELD: outcomes graded as refusals rather than as declared
                          successes. Was implicitly floored at 1 (`if (!refusalsJudged)`), which
                          a walk that had lost every spelling but one would still have cleared. */
  /* M0-79 2026-09-21 (worktree agent-a6d389a12c371468a): vocabularies 11 -> 22 and vocabularyTerms 64 -> 110, from THIS
     GUARD'S OWN PRINT (`arm E: … 22 vocabularies, 110 terms across 2 modules … floors 11/64`, exit 0) on `origin/main`
     @ 4fac1548 — M0-79 edits no vocabulary module, so ALL of both moves (11 vocabularies, 46 terms) is PRE-EXISTING
     SLACK. Measured unchanged since SCHEDULER #3 re-measured the row on 2026-09-19 (22/110 then too): these two floors
     sat HALF their measurement for at least two days of green runs, so a walk that lost every vocabulary this floor did
     not know about would still have cleared it. The printed list names all 22. */
  vocabularies: 22,    // the plane's own code->text maps a surface renders verbatim (arm E).
                       // WAS 8. REC-74 added `STANDARD_BASIS` to src/airun.mjs — the five ways a
                       // run's declared standard pair can be known, each carrying the sentence a
                       // member reads instead of the machine word. Moved IN THE SAME TURN from
                       // the figure THIS FILE PRINTED on a green run (9/56), never by adding to
                       // the number: five consecutive items found this block already stale by
                       // measuring it, and REC-71 measured a floor with slack flipping a control
                       // from RED to GREEN.
  /* D-309 2026-09-10: 63 -> 64. pristine tree printed 64, this item's 64 — so 1 of this move was PRE-EXISTING SLACK and 0 is D-309's. */
  vocabularyTerms: 110, /* D-125 (2026-09-23): FALLS 111 -> 110 from this guard's own print, AND THE FALL IS NOT SLACK: queuestate.mjs `MUTE_REFUSAL_DETAIL` lost its FINDING term because BOB #26 RULED (2026-09-22, NOTIFICATIONS.md "MARKED AS HANDLED") that a member may mute a FINDING for themselves, so no member can receive that sentence any more; the vocabulary still stands with its OBLIGATION term. */ /* D-85 (C-66 SURFACE_CHECKS, 2026-09-23, worktree agent-a09e49cc337fc2200): MOVED 110 -> 111 from this guard's own print on the item's tree, every other ratchet key gated. RUN_BOUNDS gained `surfaces` (§11 item 5, rule 2). ZERO of the move is pre-existing slack: the printed figure is exactly the old floor plus this item's own, read off the guard's per-site line. */ // + REC-69's TWO `RUN_CONTEXTS` terms (inquiry, project). M0-79: 64 -> 110, see `vocabularies`.
  /* D-309 2026-09-10: 248 -> 267. pristine tree printed 268, this item's 267 — so 20 of this move was PRE-EXISTING SLACK and -1 is D-309's. */
  /* REC-84 2026-09-14 (worktree agent-ae95c3be71f5bd167): untranslated 267 -> 268. PRISTINE `origin/main` at 9a713f1 printed 268, this item's tree 268 — so 1 of this move was PRE-EXISTING SLACK and 0 is REC-84's. */
  /* RE-READ 2026-09-14 by REC-84 AFTER MERGING `origin/main` (commit 40f34e1): untranslated 268 -> 270. The figure REC-84 set an hour earlier was true of its own branch and is not true of the merged tree — the same two codes from the merge; they are NOT in reach of a surface, so `reachGap` is unmoved at its ceiling of 40 and this figure and that one move independently, which is the partition arm's whole point. Read off the merged tree's own green run, never incremented by hand. */
  /* M0-79 2026-09-21 (worktree agent-a6d389a12c371468a): untranslated 270 -> 297, from THIS GUARD'S OWN PRINT (`arm F:
     THE PARTITION of 297 untranslated code(s) over a census of 598 … F1=2 F2=1 F3=18 F4=103 F5=5 F6=168 · floor 270`,
     exit 0) on `origin/main` @ 4fac1548 — every one of the 297 in the commit at HEAD, and M0-79 mints no code, so ALL 27
     are PRE-EXISTING SLACK: codes minted without a translation since REC-84's re-read, while the census floor above was
     moved past them (D-270's 517 -> 595) and this one was not. A partition floor 27 below its subject would have passed a
     walk that lost sight of 27 untranslated codes, which is the empty-corpus defence this floor exists to be. */
  /* D-149 (C-73 GOVERNING_LAW_CHECKS + C-32.18, 2026-09-23, branch land/worker/D-149): MOVED 296 -> 297 from this guard's own print on the item's tree over origin/main 02603e88. ZERO of the move is pre-existing slack: the delta is exactly this item's — UNSPLICEABLE_GOVERNING_LAWS, an unreachable splice guard (F6), stated rather than translated ahead of a surface. */
  /* D-126 (C-75 PER_ITEM_CHECKS + C-76 TASK_ACTOR_CHECKS, 2026-09-23, branch land/worker/D-126): MOVED 296 -> 295 from this guard's own print on the item's tree — FELL by 1, and the fall is a CLOSURE rather than slack: NOT_YOURS was untranslated and now carries C-76.1's canned translation, because a queue selection can surface it to a member (reachGap held at 40 for that reason). */
  untranslated: 299, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): FELL 301 -> 299 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0.
     **THIS FLOOR FALLING IS THE ITEM'S PAYLOAD AND NOT SLACK, and the reason is written here because a falling
     floor read without one is indistinguishable from a walk that went blind.** NO_BASIS and NO_CITATION each
     gained a canned translation, so arm F's F4 MULTI-SITE partition falls 102 -> 100 by exactly those two and
     every other partition is unchanged (F1=2 F2=1 F3=18 F5=5 F6=173, summing to 299). The census did NOT move:
     the codes are the same codes and were always minted; what changed is that each is now minted at ONE site,
     which is what let the catalogue hold a row for it at all (see ACT_SHAPE_CHECKS's own header, which named
     this fix and routed it). A fall for any other reason would be slack. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-126 merged over the batch; 302 -> 301, a FALL, re-read from this guard's --strict print on the committed merge 6ab139df: D-126 translated NOT_YOURS (C-76.1), which a selection now surfaces to a member, so one code left the untranslated set. */ /* CONDUCT #18 (c17-batch7, 2026-09-23): D-149 (C-73 and C-32.18, the governing laws) merged over the batch; 301 -> 302 RE-READ from this guard's --strict print on the committed merge 8086d64f. The new members are D-149 (C-73 and C-32.18, the governing laws)'s; neither side's figure is the sum. */   /* D-150 (2026-09-23, land/worker/D-150): ROSE 296 -> 301 from this guard's own print: the five STATEMENT_ACK_* codes above, minted without a canned translation beside the review copy's own REVIEW_* codes — no surface reaches `op=statementack` yet (the UI half is DELEGATED to UI with the review-copy surface, BIO_Publication §6A.4). The baseline on 02603e88 printed exactly 296. */ /* UI-81 (C-44.2 FINDING_IN_SEVERAL_CASES in CASE_DERIVATION_CHECKS, 2026-09-23, worktree agent-a306ff29faf082ef3): FELL 297 -> 296 from this guard's own print, and THE FALL IS NOT SLACK: FINDING_IN_SEVERAL_CASES was in arm F's subject (F6, one site, out of reach) and left it because it now carries a canned translation — the census is unchanged at 608 and the partition still sums to exactly this figure (F6 168 -> 167). A floor that falls needs its reason at the site; this is it. */
                       /* MOVED 246 -> 248, 2026-08-10, worktree agent-a36b6782b06f5a651 (CASE-3),
                          from arm F's own printed partition (F1=2 F2=1 F3=18 F4=94 F5=6 F6=127,
                          summing to 248). **ALL OF THIS MOVE IS PRE-EXISTING SLACK AND NONE OF IT IS
                          THIS ITEM'S** — the partition summed to 248 against a floor of 246 with
                          `bio-checks.mjs` reverted to HEAD, and C-25.34 does not enter arm F's
                          subject at all because it shipped with a canned translation. Moved because
                          leaving it is the slack this file's header spent four paragraphs arguing
                          against, and reported as somebody else's because a floor moved without
                          saying whose growth it absorbed teaches the next reader nothing. */
                       /* `untranslated`' PRIOR NOTE, KEPT AND LABELLED AS THE PRIOR ONE:
                          REC-79 — the size of arm F's SUBJECT: census codes with no canned
                          translation. A FLOOR and not a ceiling, which reads backwards until you see
                          what it defends: the partition is only meaningful if it is partitioning the
                          real remainder, and a walk that lost sight of half the census would produce
                          a small, tidy, WRONG partition that summed perfectly. The ceiling that stops
                          this number growing is `reachGap` plus the census floor above; this one stops
                          it SHRINKING for the wrong reason. Set from the figure printed on a green run
                          (248 before C-38 translated NOT_CAPABLE and added five coded refusals that
                          had none, which is a net -2 on a subject that GREW by four). */
                       // WAS 56, and 51 before that (+5, STANDARD_BASIS's five terms). + PL-15's `out-of-inquiry-lead`
                       // FINDING slug. Read 40 over a tree carrying 50 for long enough that
                       // PL-11 and SK-1 each found the same ten of slack independently, neither
                       // having added any vocabulary. A walk that lost a whole vocabulary would
                       // still have cleared 40.

  /* ============================================================ D-433, 2026-09-19
     THE FED HALF OF R3, FLOORED IN ITS OWN RIGHT. Set to 70 from this guard's own
     GREEN print on this item's tree, never by arithmetic on the number that was here.

     **WHY IT NEEDS A FLOOR OF ITS OWN, and the measurement is the argument.** The
     partition took R3 from 74 to 70 and left the TOTAL REACH UNCHANGED AT 338,
     because all four observed-only codes (BAD_KIND, FALSIFIER_AND_NONE_STATED,
     NO_STATEMENT, NO_TITLE) are independently in reach through R1's family rows or
     R2's app.html names. So `FLOOR.reach` did NOT move and is not evidence about
     this half either way — **the union hid the correction completely**, and it
     would hide a future regression in the same direction just as completely.

     A floor ONLY on the union is therefore blind to exactly the thing this row is
     about: R3 could collapse to nothing and the total would not notice, which is
     REC-70's shrunken-walk failure with a different subject. This floor is what
     makes the fed half a measurement rather than a by-product of a larger one.

     IT IS A FLOOR AND NOT A CEILING, deliberately: a suite genuinely handing a new
     code to a surface SHOULD raise it, and that is a real widening of what a member
     can meet. What must never happen silently is the fed half FALLING — that means
     the partition stopped recognising hand-offs, and a walk that lost sight reports
     a smaller, tidier, wrong answer.
     RAISED 70 -> 71 on 2026-09-22 by UI-77, from the figure this instrument PRINTED (`measured 71`): the new
     `group-surface.test.mjs` FEEDS `NOT_AUTHENTICATED` to the public header — the refusal an older plane (before
     REC-163/IC-174) answers a stranger's `op=instancegroup` with — so the header can be shown saying it could not
     read the group rather than that none is recorded. A real widening, which this floor says should raise it. */
  r3Fed: 73, /* UI-84 (2026-09-24, branch land/worker/UI-84): MOVED 72 -> 73 from this guard's own print, and it is a REAL WIDENING in the direction D-433 says should raise this floor — one more code is now handed to a surface, not one more recognised by the walk. THE CODE IS UNKNOWN_OP (C-69.1, D-278's dispatch miss): refusal-translation-surface.test.mjs gained an arm that builds that refusal in the shape D-278 sends it — the row's own `translation`, IMPORTED from DISPATCH_CHECKS and never retyped — and drives it through `actRefusalHtml`, so the canned sentence a member would read is asserted at a surface for the first time. ESTABLISHED BEFORE MOVING, as the FAIL text beside this table demands: the same guard run on a PRISTINE checkout of this item's base (548eb2c5, a scratch worktree) prints `r3Fed measured 72 · slack 0 · gated` and exits 0, so the +1 is this landing's and is not a floor that was already stale. `untranslated` did not move (301 -> 301) and no ceiling moved. PRIOR: D-126 (2026-09-23, branch land/worker/D-126) MOVED 71 -> 72 from this guard's own print at the COMMIT that adds civicos-ui/test/queue-peritem.test.mjs (D-257: the working tree read it before the file was committed) — that suite FEEDS NOT_YOURS into the queue surface through a real plane. */
};

/* THE OTHER HALF OF THE RATCHET. A floor catches an instrument going blind; a
   ceiling catches the SUBJECT getting worse. REC-64 is the sweep that lowers
   this to zero, one family at a time, and until then no new receivable code may
   arrive without a translation. Measured 2026-08-07 by this file. */
const CEILING = {
  reachGap: 39, /* D-484 (C-33.40 NO_BASIS, C-33.41 NO_CITATION consolidated behind one governed helper each, 2026-09-24, branch land/worker/D-484): FELL 40 -> 39 from this guard's own --strict print on the item's tree over origin/main 16fe1e7f. ZERO pre-existing slack: the PRISTINE origin/main 16fe1e7f, run before any edit in this worktree, printed exit 0 with EVERY ratchet key at slack 0. NO_BASIS was one of the 40 codes in reach with no
     canned translation and now has one; NO_CITATION was NOT in that 40 (it entered reach in the same landing that
     translated it, which is why the ceiling falls by one while two codes were translated). This is the direction
     this ceiling exists to record. */    /* codes in reach with no canned translation — may only FALL. FELL 73 -> 42 at

                          LOWERED 41 -> 40 BY CASE-6, 2026-09-10, AND IT IS A CORRECTION RATHER THAN
                          A FALL: REC-79 below already records "FELL 41 -> 40", and the NUMBER WAS
                          NEVER MOVED WITH THE SENTENCE. The ceiling has been carrying one code of
                          slack ever since, which is precisely the state this file's own header calls
                          not-a-ratchet. Measured twice by CASE-6 on two different trees — its
                          baseline at `a4c983a` and its final — both reading 40 of 237, so the figure
                          is the instrument's and not this item's: **CASE-6 added no code to the reach
                          and removed none.** It is taken here because a ceiling nobody re-measures
                          goes stale silently, which is this project's most-repeated finding, and
                          because one code of slack is one new untranslated receivable code that this
                          guard would have waved through.

                          THE ITEM ALSO PAID FOR THE OTHER DIRECTION AND IT IS WORTH THE SENTENCE:
                          CASE-6's first draft wrote two refusal codes into `app.html` COMMENTS in
                          backticks, to explain a fence. `screamingLiterals` reads a backtick as a
                          string delimiter, so both entered R2 and the gap went 40 -> 42 and FAILED.
                          The guard was right about the bytes and wrong about the world — the surface
                          cannot receive either code, it was describing them — and the cheap
                          correction was to not spell the literal. **A comment about a code is
                          indistinguishable from a use of one to this matcher**, which is worth
                          knowing before writing the next such comment.

                          FELL 41 -> 40 AT REC-79, and the SIZE of that fall is the honest headline
                          rather than the fall itself: an item that added a whole family of six moved
                          this by ONE, because five of the six were codes that did not exist to be
                          counted and the sixth (`NOT_CAPABLE`) was the only one already in reach.
                          **A ratchet cannot see work that ENLARGES the subject**, and REC-79's arm F
                          exists because of exactly that blindness.

                          FELL 73 -> 42 at
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
  unclassifiedOutcomes: 1, /* REC-76 — return-position outcomes at a governed site carrying NO
                          verdict this walk can read. NAMED every run and ceilinged: a new one is
                          a new place a codeless refusal could hide, so it FAILS here rather than
                          being scored zero. Set from what the guard PRINTED on a green run.

                          **FELL 3 -> 1 at REC-79, AND THE REASON IS AT THE SITE BECAUSE A FALLING
                          FLOOR NEEDS ONE.** It did NOT fall because anything was fixed: it fell
                          because THREE of the three were never "shapes the walk does not
                          understand" at all — they were outcomes whose verdict is INHERITED FROM A
                          SPREAD, which the walk understands perfectly and cannot resolve until run
                          time. They moved to `inheritedVerdicts` below. One number was doing two
                          jobs, which is precisely what REC-79 found the census gap doing to 248
                          codes, arriving here in the instrument's own tally. The one that remains
                          (`store.mjs:8828`) is a genuine unread shape. */
  inheritedVerdicts: 4, /* REC-79 — return-position outcomes whose verdict comes from a spread
                          (`{ ...promoted, … }`). NAMED every run. Not gated at zero because three
                          are deliberate and correct: promote's own refusal handed back unwrapped
                          rather than restated. Set from what this guard PRINTED on a green run.
                          ONE OF THE FOUR WAS INVISIBLE UNTIL REC-79 WIDENED THE OUTCOME READER —
                          `suggestVersion > is-suggest-write` returns `remember({ ...promoted, … })`,
                          a WRAPPED return, and the reader stopped at the wrapper's name.

                          THE FOURTH IS REC-79'S OWN AND IT IS SET AT 4 RATHER THAN 3 KNOWINGLY.
                          `is-admission` passes `aiTaskScope`'s refusal straight through
                          (`{ ok: false, ...scoped.error, op, cls }`) — an explicit verdict with an
                          INHERITED CODE, from a refusal `aiTaskScope > is-ai-task-scope` already
                          governs, rows and translations and all. Restating that code here would be a
                          second copy of the thing DEC-49 exists to keep singular. So the ceiling is
                          set at the measured 4 and the pass-through is NAMED every run rather than
                          made invisible by a literal nobody needed. */
};

/* ============================================================== M0-79, 2026-09-21
   THE SLACK BOUND OF EVERY RATCHET KEY, STATED AT THE SITE — AND A KEY WITH NO LINE
   HERE IS A FAILURE, NOT A DEFAULT.

   WHAT WAS WRONG. Every floor above failed only when its figure fell BELOW it, and a
   figure that rose past it was printed (`GREW by N`) and passed. So each landing that
   grew a figure and did not move its floor left slack behind, and the guard announced
   the slack on every run and exited 0: measured on `origin/main` @ 4fac1548,
   `outcomeReturns` 127 against 98, `vocabularies` 22 against 11, `vocabularyTerms` 110
   against 64, `untranslated` 297 against 270. **A floor with slack is not a ratchet**
   (REC-71's receipt: 19 codes of it turned control arm (e) from RED to GREEN, and REC-64
   measured that SIX is enough to blind the widest matcher). A check that reports where it
   should gate cannot fail, which CLAUDE.md §2 grades worse than a missing feature.

   THE RULE. For a FLOOR key, `measured - floor` may not exceed `bound`; for a CEILING
   key, `ceiling - measured` may not. Past it the guard FAILS naming the key, its floor
   (or ceiling), its measured value and the bound — and the remedy is the one the notes
   above have always given: move the figure to what THIS RUN PRINTED, in the same commit
   as the change that moved it, and say whose growth it absorbs. Never by arithmetic.

   THE BOUND IS A DESIGN CALL, MADE KEY BY KEY, and the reason is the entry's `why`:
     - ZERO for every figure a landing moves by an edit it makes itself — which is all of
       them but one. Each such landing is already editing the thing the figure counts, so
       it can print the new figure and move the floor in the same turn; WORKER.md's DEC-49
       rule has always said so, and this makes the rule a gate.
     - EXEMPT only where this file already argues it: `bodyLines`, deliberately far below
       its measurement since VF-2 (its FLOOR note). An exemption is a STRING with its
       reason, printed every run beside the slack it carries — never a missing line.
     - NO NON-ZERO BOUND IS SET TODAY. The shape allows one (`bound: n`), and the fixture
       suite drives it, because the next figure that legitimately wobbles should be given a
       stated tolerance here rather than an exemption or a quiet loosening elsewhere.

   WHICH FIGURE IS GATED. The one each arm RECORDS with `MEASURE` where it already
   compares the floor: the same number, never a second reading. Where the guard tells
   the commit at HEAD from the working tree (D-257: `census`, `reach`, `r3Fed`,
   `untranslated`), a FLOOR's slack is gated on the figure IN THE COMMIT AT HEAD, because
   a slack failure is an instruction to move the floor and D-257's rule is that a floor
   moves only to the figure another checkout reproduces — so a phantom file carried in by
   `refs/stash` can never DEMAND a move to a contaminated number, which would then fail
   every honest run. The working-tree figure is printed beside it; a difference names the
   uncommitted file's work, to be moved WHEN that file is committed. A CEILING's slack is
   gated on the figure the ceiling already gates (the working tree for `reachGap`): an
   uncommitted file can only RAISE that figure, so it can hide slack for a run and never
   invent it. (The floor-direction checks of `r3Fed` and `untranslated` read the working
   tree, unlike `census` and `reach`, and are NOT changed here — reported as a finding.)

   THE COVERAGE ARM, because the cheap way past this gate is to gate only the figures that
   are currently equal: every FLOOR and CEILING key must have an entry here, every entry
   must name a FLOOR or CEILING key, and every key must have a recorded figure — or the
   guard FAILS naming the key. A new floor added without a decision here fails on the day
   it lands.
   ============================================================================ */
const SLACK = {
  families:             { bound: 0, why: "a new *_CHECKS family is minted by an edit to bio-checks.mjs, and C-22's header already charges its tax: move this floor in the same turn" },
  rows:                 { bound: 0, why: "a row is added or removed by an edit to bio-checks.mjs, in the landing that makes it" },
  census:               { bound: 0, why: "a code enters the census by an edit to bio-plane/src in the landing that mints it; gated on the codes in the commit at HEAD (D-257), so a phantom file cannot demand a move" },
  reach:                { bound: 0, why: "R1, R2 and R3 each move by an edit to the catalog, app.html or a committed suite, in the landing that makes it; gated on the figure in the commit at HEAD (D-257)" },
  r3Fed:                { bound: 0, why: "a suite starts or stops FEEDING a code in the landing that edits it (D-433: a real widening SHOULD raise this, and raising it is this move); gated on the suites in the commit at HEAD (D-257)" },
  governedSites:        { bound: 0, why: "a `where` is written by the landing that writes or narrows the row" },
  surfaceTables:        { bound: 0, why: "a new surface table already fails TABLE_PRODUCERS until this file pairs it, so the landing that adds one is already editing here" },
  bodyLines:            { exempt: "DELIBERATELY NOT A RATCHET since VF-2 (its FLOOR note): it FALLS whenever a `where` is correctly narrowed from a function to a region, the work REC-71 licensed, so a floor near its measurement would fail that work and be switched off. It stays a COLLAPSE DETECTOR for a parameter list read as a body; codesChecked and regionLines carry the ratchet" },
  regions:              { bound: 0, why: "a region is a marker pair plus a `where`, written by the landing that narrows the row" },
  regionLines:          { bound: 0, why: "EVERY edit inside a governed region moves it, so the landing that edits there moves this floor; a region's line count is a property of the MERGED source, so the integrator re-reads it on the merged tree, which this bound now enforces (later items found 83, 56, 226, 59 and 695 lines of slack here)" },
  codesChecked:         { bound: 0, why: "a code compared at a governed site is added or removed by the landing that writes the refusal" },
  outcomeReturns:       { bound: 0, why: "a return-position outcome at a governed site is added or removed by the landing that writes it (the first figure this gate caught: 98 against a measured 127)" },
  refusalsJudged:       { bound: 0, why: "an outcome graded a refusal is added or removed by the landing that writes it" },
  vocabularies:         { bound: 0, why: "a vocabulary is added to airun.mjs or queuestate.mjs by the landing that adds it (found at 11 against 22)" },
  vocabularyTerms:      { bound: 0, why: "a term is added by the landing that adds it (found at 64 against 110)" },
  untranslated:         { bound: 0, why: "a code minted without a translation raises it and a translation lowers it, both in the landing that makes them; gated on the codes in the commit at HEAD (D-257)" },
  reachGap:             { bound: 0, why: "a code in reach gains a translation or leaves reach in the landing that does it, and the ceiling falls with it in the same turn (CASE-6 found it carrying one code of slack)" },
  unclassifiedOutcomes: { bound: 0, why: "an unclassifiable outcome is retired by the landing that retires it, and the ceiling falls with it" },
  inheritedVerdicts:    { bound: 0, why: "an inherited verdict is retired by the landing that retires it, and the ceiling falls with it" },
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

/* ============================================================== D-433, 2026-09-19
   A SUITE THAT *OBSERVES* A REFUSAL IS NOT A SURFACE THAT CAN *RECEIVE* ONE.

   R3's whole claim is "a HARNESS MOCK sends it" — a code the SURFACE is handed,
   which is what makes it reachable by a member. `screamingLiterals` cannot tell
   that from a code a suite merely ASSERTS AGAINST, and the two are opposite
   facts about the same string:

       fetchMock = async () => ({ ok: false, reason: "NOT_CAPABLE" });   // FED
       ok(r.reason === "NOT_CAPABLE");                                   // OBSERVED

   The first proves the surface can receive that code. **The second proves the
   PLANE sent it, which is the opposite of evidence that the surface was ever
   handed it** — and as real-plane UI suites replace mocks, every refusal a suite
   asserts by name inflated the reach.

   WHY THIS IS WORSE THAN A MERELY BLIND INSTRUMENT, and it is the reason the row
   outranks its own size: `FLOOR.reach` is a RATCHET that may only rise. An
   inflated reach is moved into the floor by the next worker reading a green
   print, and from then on every run inherits the inflation and no later
   measurement can bring it back down without looking like a regression. **A
   blind instrument reports nothing; a ratchet LOCKS THE ERROR IN.**

   THE PARTITION IS PRINTABLE, SO BOTH HALVES ARE PRINTED PER SUITE and only the
   FED half is floored. Printing both is not decoration — it is the arm against
   the cheap way past this row, which is to drop the observed half and call the
   smaller number an improvement. The two halves together must still account for
   every code `screamingLiterals` finds, so a code cannot fall out of the world
   by being classified into neither.

   WHAT THIS MATCHER CAN AND CANNOT SEE, stated rather than left to be found:
     - It reads OCCURRENCES, and a code is FED for a suite if ANY occurrence of
       it is fed. A code appearing only in comparisons is OBSERVED-only.
     - It recognises two observation shapes: a comparison against a value
       (`x === "CODE"`, `"CODE" !== x`, `==`/`!=` alike), and `reason: "CODE"`
       (or `code:`/`check:`) inside an `ok(...)` / `is(...)` / `t(...)`
       expectation call. Anything else counts as fed.
     - **It cannot see a code fed through a VARIABLE** (`const R = "X"; … reason: R`)
       — that is `screamingLiterals`' own blind spot inherited, and such a code
       is counted FED only if the literal also appears somewhere fed-shaped.
     - A suite that builds an expectation object and passes it to a mock in the
       same expression is read as FED, which is the safe direction: this
       partition may only ever REMOVE codes from reach that are provably
       observation-only, never add one. */
const OBS_CALL = /\b(?:ok|is|eq|assert|t|expect|deepEqual|strictEqual)\s*\(/g;

function partitionSuiteLiterals(src) {
  const fed = new Set(), observed = new Set();
  /* The spans of every expectation call, so `reason: "X"` inside one is read as
     an expectation rather than as a mock's answer. Parenthesis-matched, because
     a fixed character window cuts a long assertion in half and misreads its
     tail — the span rule this estate arrived at for DEC-49 regions, one level
     out. */
  const obsSpans = [];
  OBS_CALL.lastIndex = 0;
  for (const m of src.matchAll(OBS_CALL)) {
    let i = m.index + m[0].length - 1, d = 0;
    for (; i < src.length; i++) {
      if (src[i] === "(") d++;
      else if (src[i] === ")") { d--; if (!d) break; }
    }
    obsSpans.push([m.index, Math.min(i + 1, src.length)]);
  }
  const inObsCall = (at) => obsSpans.some(([a, b]) => at >= a && at < b);

  for (const m of src.matchAll(/["'`]([A-Z][A-Z0-9_]{2,})["'`]/g)) {
    const code = m[1];
    if (!CODE_RE.test(code)) continue;
    const before = src.slice(Math.max(0, m.index - 40), m.index);
    const after = src.slice(m.index + m[0].length, m.index + m[0].length + 40);
    /* A COMPARISON AGAINST A RECEIVED VALUE, in either order. */
    const comparedRight = /[!=]==?\s*$/.test(before);
    const comparedLeft = /^\s*[!=]==?/.test(after);
    /* `reason:` / `code:` / `check:` INSIDE an expectation call. */
    const keyedExpectation = /\b(?:reason|code|check)\s*:\s*$/.test(before) && inObsCall(m.index);
    if (comparedRight || comparedLeft || keyedExpectation) observed.add(code);
    else fed.add(code);
  }
  /* The object-key shape `CODE:` at the head of a line is a table declaration,
     never an observation — kept FED, as `screamingLiterals` reads it. */
  for (const m of src.matchAll(/^\s*([A-Z][A-Z0-9_]{2,})\s*:/gm))
    if (CODE_RE.test(m[1])) fed.add(m[1]);
  /* OBSERVED is reported as the codes seen ONLY in observation position: a code
     both fed and observed is FED, because one real hand-off is what reach means. */
  for (const c of fed) observed.delete(c);
  return { fed, observed };
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
  MEASURE("families", families.length, "DEC-49 families harvested from bio-checks.mjs (the `arm A` line)");
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

  MEASURE("rows", rows.length, "DEC-49 rows across the families (the `arm A` line)");
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
  /* D-433: R3 harvests only what a suite FEEDS INTO the surface. A code the
     suite merely asserts against is the PLANE's evidence, not the surface's
     reach, and counting it inflated a ratchet that may only rise. Both halves
     are kept per suite and PRINTED below; only the fed half enters R3. */
  const R3 = new Set(), R3repro = new Set(), R3observed = new Set();
  const r3PerSuite = [];
  for (const s of suites) {
    const committed = inCommit(path.join(TESTDIR, s));
    const { fed, observed } = partitionSuiteLiterals(fs.readFileSync(path.join(TESTDIR, s), "utf8"));
    const fedIn = [...fed].filter(c => census.union.has(c)).sort();
    const obsIn = [...observed].filter(c => census.union.has(c)).sort();
    for (const c of fedIn) { R3.add(c); if (committed) R3repro.add(c); }
    for (const c of obsIn) R3observed.add(c);
    if (fedIn.length || obsIn.length) r3PerSuite.push({ suite: s, committed, fed: fedIn, obs: obsIn });
  }
  /* A code OBSERVED in one suite and FED in another is FED: one real hand-off
     is what reach means, and the union is taken across suites for the same
     reason it is taken within one. */
  for (const c of R3) R3observed.delete(c);

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

  /* D-433: THE FED HALF IS FLOORED IN ITS OWN RIGHT, because the union above
     cannot see it move — measured: the partition moved R3 74 -> 70 and left the
     union at 338. A fed half that FALLS means this walk stopped recognising a
     hand-off, which is a blind instrument reporting a tidy number, never an
     improvement in the surface. */
  MEASURE("r3Fed", R3repro.size, "codes a suite in the commit at HEAD FEEDS to a surface (D-433's FED half of R3)",
    R3.size);
  if (R3.size < FLOOR.r3Fed)
    FAIL(`R3's FED half is ${R3.size} code(s) a suite hands to a surface, floor is ${FLOOR.r3Fed}. `
       + `THE PARTITION LOST SIGHT OF A HAND-OFF — and the total reach cannot tell you, because a code `
       + `dropped here is usually still in reach through R1 or R2 (measured at D-433's landing: R3 fell `
       + `74 -> 70 with the union unmoved at 338). Establish whether a suite stopped feeding the code or `
       + `this walk stopped reading the shape, before moving this floor.`);

  MEASURE("reach", reachRepro.size, "codes a surface can receive, R1 + R2 + R3 FED, in the commit at HEAD (the "
    + "`arm B: REACH` line)", reach.size);
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

  MEASURE("reachGap", gap.length, "codes in reach with no canned translation (the `arm B: RATCHET` line)");
  if (gap.length > CEILING.reachGap)
    FAIL(`${gap.length} code(s) a surface CAN RECEIVE have no canned translation; the ratchet's ceiling is `
       + `${CEILING.reachGap} and REC-64 may only ever move it DOWN. The ${gap.length - CEILING.reachGap} `
       + `beyond it are new: ${gap.join(", ")}. A refusal a surface can meet owes a code with a canned `
       + `translation (DEC-49, and every IS fence inherits it) — add a row in a \`*_CHECKS\` family rather `
       + `than wording at the call site, then lower this ceiling in the same turn.`);

  /* ============================================================== D-433
     BOTH HALVES OF R3, PER SUITE, AND THE FED HALF IS THE ONE FLOORED.
     Printed rather than summarised because the cheap way past this row is to
     drop the observed half and report the smaller number as an improvement:
     with both printed, a suite whose codes all moved into OBSERVED is visible
     as exactly that, and a reader can check any single line against the suite.
     The two halves are disjoint by construction and their union is every code
     `screamingLiterals` would have harvested, so nothing falls out of the
     world by being classified into neither. */
  NOTE(`arm B / D-433: R3 PARTITIONED — a suite that FEEDS a code into the surface proves reach; one `
     + `that merely ASSERTS a code arrived proves the PLANE sent it, which is not the same fact. `
     + `FED ${R3.size} code(s) (floored; ${R3repro.size} of them fed by a suite ${HEAD_SAYS}, the figure its slack `
     + `is gated on and the one a floor may be moved to — M0-79) · OBSERVED-ONLY ${R3observed.size} code(s) `
     + `(printed, NOT floored)`);
  for (const r of r3PerSuite)
    NOTE(`arm B / D-433:   ${r.suite}${r.committed ? "" : " (NOT in the commit at HEAD)"} — `
       + `FED ${r.fed.length}${r.fed.length ? ` [${r.fed.join(", ")}]` : ""} · `
       + `OBSERVED ${r.obs.length}${r.obs.length ? ` [${r.obs.join(", ")}]` : ""}`);
  if (R3observed.size)
    NOTE(`arm B / D-433: the OBSERVED-ONLY union, in NO suite's fed half and therefore NOT in reach: `
       + `${[...R3observed].sort().join(", ")}`);

  NOTE(`arm B: REACH ${reach.size} codes — R1 family rows ${R1.size}, R2 named by app.html ${R2.size}, `
     + `R3 FED by a harness mock ${R3.size} (R2/R3 intersected with the plane census; D-433: `
     + `observed-only codes excluded) · `
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

  MEASURE("governedSites", sites.size, "spans named by the rows' `where` (the `arm C:` sites line)");
  if (sites.size < FLOOR.governedSites)
    FAIL(`${sites.size} governed sites derived from the rows' \`where\` fields, floor is `
       + `${FLOOR.governedSites}. Arm C only judges what \`where\` points it at, so a site that stopped `
       + `resolving is an arm that stopped running while still reporting green.`);

  let bodiesRead = 0, refusalsJudged = 0, bodyLines = 0;
  let regionsResolved = 0, regionLines = 0, codesChecked = 0;
  let outcomeReturnsRead = 0, successesSeen = 0;
  const unclassified = [];
  const inherited = [];       // REC-79 — verdict inherited from a spread. A category, not a bin.
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
        /* (1a) THE VERDICT IS INHERITED FROM A SPREAD (REC-79) — a shape this
           walk understands completely and cannot resolve statically. Its own
           category, its own ceiling, NOT the unclassified bin. See
           `topLevelSpreads` for why the two must not be one number. */
        const sp = topLevelSpreads(stmt);
        if (sp.length) {
          inherited.push(`${site.file}:${line} (${site.fn}${at_}) VERDICT from \`...${sp.join("`, `...")}\``
                       + ` ${JSON.stringify(stmt.replace(/\s+/g, " ").slice(0, 70))}`);
          continue;
        }
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
      /* THE CODE, LIKE THE VERDICT, CAN BE INHERITED FROM A SPREAD (REC-79).
         `return json({ ok: false, ...scoped.error, op, cls }, 403)` in the
         admission gate declares its verdict outright and takes its CODE from a
         refusal another governed region already built — `aiTaskScope`'s, rows
         and translations and all. Demanding a literal code on top of that would
         force a second copy of the code the spread already carries, which is a
         fence tighter than its rule and would push the plane toward exactly the
         duplicated wording DEC-49 forbids. So it is NAMED and COUNTED with the
         inherited-verdict outcomes rather than failed — same principle, same
         ceiling: what is inherited is visible, not absent. */
      const spreadHere = (!named.length && !viaVar) ? topLevelSpreads(stmt) : [];
      if (spreadHere.length) {
        inherited.push(`${site.file}:${line} (${site.fn}${at_}) CODE from \`...${spreadHere.join("`, `...")}\``
                     + ` ${JSON.stringify(stmt.replace(/\s+/g, " ").slice(0, 70))}`);
        continue;
      }
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
  MEASURE("bodyLines", bodyLines, "lines of governed span arm C read, all sites (`lines total` on the `arm C:` line)");
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
  MEASURE("regions", regionsResolved, "narrowed REGION `where`s resolved (the `arm C:` sites line)");
  MEASURE("regionLines", regionLines, "lines inside the governed regions (the `arm C:` sites line)");
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
  MEASURE("codesChecked", codesChecked, "refusal codes COMPARED against a family row (the `arm C:` sites line)");
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
  MEASURE("outcomeReturns", outcomeReturnsRead, "return-position outcomes read across the governed spans (the "
    + "`arm C: THE OUTCOME WALK` line)");
  MEASURE("refusalsJudged", refusalsJudged, "outcomes graded as REFUSALS (the `arm C: THE OUTCOME WALK` line)");
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
  MEASURE("unclassifiedOutcomes", unclassified.length, "outcomes with no verdict this walk can read (the "
    + "`arm C: UNCLASSIFIED` line)");
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
     + `${refusalsJudged} REFUSAL(s) / ${successesSeen} declared SUCCESS(es) / ${inherited.length} `
     + `INHERITED-verdict / ${unclassified.length} `
     + `unclassified, by verdict rather than by spelling · floors ${FLOOR.outcomeReturns} corpus / `
     + `${FLOOR.refusalsJudged} refusals`
     + `${outcomeReturnsRead > FLOOR.outcomeReturns ? ` · corpus GREW by ${outcomeReturnsRead - FLOOR.outcomeReturns}` : ""}`);

  /* THE INHERITED-VERDICT CEILING (REC-79). Named every run for the same reason
     the unclassified ones are: a spread that starts carrying a refusal nobody
     coded must be VISIBLE, not absent. It is ceilinged rather than gated at zero
     because three of these are deliberate — promote's refusal handed back
     unwrapped — and a gate above the current state gets switched off. */
  MEASURE("inheritedVerdicts", inherited.length, "outcomes taking their verdict or code from a spread (the "
    + "`arm C: INHERITED VERDICT` line)");
  if (inherited.length > CEILING.inheritedVerdicts)
    FAIL(`${inherited.length} return-position outcome(s) at governed sites take their verdict from a `
       + `SPREAD; the ceiling is ${CEILING.inheritedVerdicts} and it may only ever move DOWN. The `
       + `${inherited.length - CEILING.inheritedVerdicts} beyond it are new. An inherited verdict is not `
       + `a shape this walk failed to understand — it is one it cannot resolve until run time — so a new `
       + `one is a new place a refusal can pass through ungraded. They are: ${inherited.join(" · ")}`);
  if (inherited.length)
    NOTE(`arm C: INHERITED VERDICT — ${inherited.length} of ${outcomeReturnsRead} return-position outcome(s) `
       + `take their verdict (and their code) from a spread and are NAMED rather than scored zero `
       + `(ceiling ${CEILING.inheritedVerdicts}, may only fall): ${inherited.join(" · ")}`);
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

/* ---------------------------------------------------------------------------
 * THE OUTCOME WALK'S READER IS NOT HERE ANY MORE (D-254) — it is imported, above,
 * from `bio-plane/test/verdict-reader.mjs`, and the comments that stood here
 * moved with it: RETURN POSITION and REC-79's wrapped form, the detail-object
 * exclusion, the spread category, the boolean-shaped operators, and why the
 * FIRST such property is the verdict. (The one note NOT moved was an orphan
 * describing `objectLiteralAround`, a reader that no longer exists; its receipt
 * — the 400-character window that failed in the generous direction — was
 * already kept in `outcomeReturns`' own comment, and is.) What arm C DOES with
 * a verdict — a `true` is a success, anything else a refusal owing a code, none
 * is named — is still this file's, and is written at the arm.
 * ------------------------------------------------------------------------ */

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
    /* M0-144: the key harvest reads a QUOTED key too, on `surface-registry.test.mjs`'s
       precedent — `(["']?)…\1` requires the SAME delimiter on both sides, so `"ABC':`
       is not a key and a mismatched quote cannot smuggle one past. The old pattern saw
       bare keys ONLY, which is a blind spot rather than a policy: `{ "PART_TOO_LARGE":
       "…" }` is the same table in a spelling nobody had written yet, and a table
       re-quoted by a formatter would have LOST keys here — silently turning real holes
       into "no wording found" or dropping the table out of the walk altogether.
       MEASURED on the real `app.html` (2026-09-24): 36 keys harvested before, 40 after;
       the four gained are GLOSSARY's `ACFR`, `GPF`, `CAFR`, `SSHSIG` — glossary terms,
       not codes, so `minted` stays 0 there and GLOSSARY does NOT enter the pairing. The
       threshold below is what keeps it out: it is membership in the plane census, never
       the spelling of the key. */
    const keys = [...bodyText.matchAll(/(?:^|[{,\s])(["']?)([A-Z][A-Z0-9_]{2,})\1\s*:/g)].map(x => x[2]);
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

  MEASURE("surfaceTables", tables.length, "surface translation tables proved total (the `arm D` line)");
  if (tables.length < FLOOR.surfaceTables)
    FAIL(`${tables.length} surface translation table(s) proved total, floor is ${FLOOR.surfaceTables}. `
       + `A table that stopped being FOUND is an arm that stopped running: this walk finds tables by `
       + `SHAPE (a const whose keys are codes the plane mints), so a table refactored out of that shape `
       + `disappears from the guard while its holes stay in front of members.`);
  return tables;
}

/* ============================================================
   ARM F — THE PARTITION (REC-79)
   ============================================================ */

/* **THE 248 ARE NOT ONE THING, AND COUNTING THEM AS ONE IS WHY THE REMAINDER
 * READ AS A SWAMP.** This arm is REC-79's whole subject.
 *
 * -------------------------------------------------- WHAT WAS WRONG WITH "248"
 *
 * The census NOTE at the foot of this file said, in one sentence, that 248
 * codes "have NO canned translation and are NOT in reach of a surface today".
 * **MEASURED: 41 of those 248 WERE in reach** — they are the very set arm B
 * names, by code, three lines earlier, on every single run. One number was
 * carrying two claims and the second was false for a sixth of it. That is the
 * shape of defect this repository ranks above a missing feature: **a record
 * claiming more than it can support**, sitting inside the instrument whose job
 * is to stop exactly that. The sentence is corrected at the site; this arm is
 * what makes it impossible to write again, because the partition has to add up.
 *
 * ------------------------------------------- WHY PARTITION AND NOT TRANSLATE
 *
 * REC-64 enacted DEC-49 partly and said plainly it could not close the class.
 * The honest reason is in this arm's numbers: the remainder is FOUR different
 * defects wearing one total, and only one of them is answered by writing a
 * sentence. **An unreachable code needs a DECISION, not prose.** A code minted
 * at fifteen sites needs a `where` that can name a set, not prose. A code in a
 * module that may never cross the wire needs somebody to establish whether it
 * does. Handing the next item "248 untranslated codes" hands it a swamp;
 * handing it these partitions hands it a slice.
 *
 * THE PARTITIONS ARE ORDERED BY THE DECISION THEY NEED, and every code lands in
 * exactly ONE — first match wins — so the parts sum to the whole and a code
 * cannot be quietly counted twice. The sum is ASSERTED, not assumed.
 *
 * ----------------------------------- WHAT THIS ARM CANNOT SEE, STATED PLAINLY
 *
 * This is a source-text walk and it is wrong in both directions. Both are
 * PRINTED rather than described, because a limitation in a comment is not a
 * measurement.
 *
 *  (a) IT COUNTS THINGS THAT ARE NOT CODES. `index.mjs` mints
 *      `reason: "SIG_" + sv.reason` — the literal is a PREFIX, and the census
 *      records `SIG_` as though it were a code while the real `SIG_*` codes are
 *      invisible. Detected and reported as CONSTRUCTED, not silently left in.
 *  (b) IT MISSES CODES HELD IN CONSTANTS. `storeSilent` refuses with
 *      `STORE_DID_NOT_ANSWER`, held in a module constant and referenced by name.
 *      **It is not in the 431-code census at all.** This arm resolves that one
 *      shape — `reason: IDENT` where IDENT is a `const IDENT = "CODE"` — and
 *      reports what it recovers, so the census can be read as a FLOOR on the
 *      plane's refusal vocabulary rather than mistaken for a total.
 *  (c) IT CANNOT SEE PER-SITE `detail` PROSE AT ALL, and UI-43 measured that
 *      those are far more numerous than the canned translations and have never
 *      been walked. Nothing here changes that; it is named so the next reader
 *      can tell a clean result from a walk looking in the wrong place.
 *  (d) REACHABILITY HERE IS THIS FILE'S R1/R2/R3 AND NOTHING MORE. "In reach"
 *      means a family row holds it, or `app.html` names it, or a harness mock
 *      sends it. It is a fact about what SURFACES EXIST TODAY, not about what a
 *      member could ever meet. A code can be perfectly reachable by a member
 *      through an op and sit in the out-of-reach partition because nobody has
 *      built the screen yet. That is why that partition's disposition is "when
 *      its surface exists" and not "never".
 *  (e) IT DOES NOT KNOW WHETHER A REFUSAL CROSSES THE WIRE. That is the whole
 *      content of the SUBSYSTEM partition, and it is stated as an open question
 *      rather than answered by guessing.
 *
 * TWO CODES ARE MEASURED UNREACHABLE THROUGH THEIR OWN OP and this arm does NOT
 * try to rediscover that from source, because it cannot: REC-78 established it
 * by DRIVING all four machine classes (`NO_AUTHOR`, whose op is not in
 * `SESSION_OPS`) and by exhausting the ceremony (`EDITION_NOT_INCREMENTED`).
 * They are DECLARED below with their receipt, and labelled as declared. A
 * measurement that cost something to produce is not one this walk may fake. */

/* Modules that never answer a caller directly — the format readers, the
   signature and timestamp verifiers, the setup writer. Read from the plane's
   own directory MINUS the two request-path modules, so a new subsystem file
   joins this partition the day it lands instead of the release after somebody
   remembers to list it. THAT DIRECTION IS DELIBERATE: an unlisted new module
   would otherwise fall into a partition claiming its codes are member-facing,
   which is the direction that overclaims. */
const REQUEST_PATH = new Set(["index.mjs", "store.mjs"]);

/* REC-78, 2026-08-08, MEASURED BY DRIVING and recorded in MEASUREMENTS.md. Not
   derivable from source text, so declared here with its receipt and printed as
   DECLARED every run — never presented as something this walk established. */
const DECLARED_UNREACHABLE = new Map([
  ["NO_AUTHOR", "REC-78: op=provenancechain is not in SESSION_OPS, and every machine class arrives "
              + "stamped token:<class> — driven at all four caller classes, not one reaches it."],
  ["EDITION_NOT_INCREMENTED", "REC-78: the edition never regresses and never leaves a hole, so the "
              + "only route is an edition authored into the ratified bytes below the highest published."],
]);

function armF(census, translated, reach) {
  /* PER-CODE SITES, at LINE granularity over the same matcher set the census
     uses. One walk, one vocabulary — a second, narrower matcher here would make
     the partition disagree with the census it partitions. */
  const sites = new Map();          // code -> [{file, line, text}]
  const constants = new Map();      // IDENT -> ["CODE", …]  (a string constant, or a lookup table)
  const byIdent = new Map();        // IDENT -> [{file, line}]  (`reason: IDENT` sites)
  for (const f of fs.readdirSync(PLANE_SRC).filter(x => x.endsWith(".mjs"))) {
    const src = fs.readFileSync(path.join(PLANE_SRC, f), "utf8");
    for (const m of src.matchAll(/\bconst\s+([A-Z][A-Z0-9_]{2,})\s*=\s*"([A-Z][A-Z0-9_]{2,})"/g))
      constants.set(m[1], [m[2]]);
    /* AND THE LOOKUP-TABLE SPELLING, which is the same defect one shape over and
       was found by this arm's own residue reporting `REASON (unresolved)`:
       `const REASON = { bias_acknowledgement: "BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD" }`,
       refused as `reason: REASON[k] || "…"`. The code is real, reaches a caller,
       and appears in NO matcher's yield. A residue that says "unresolved" is
       already better than silence; one that says WHICH code is better still. */
    for (const m of src.matchAll(/\bconst\s+([A-Z][A-Z0-9_]{2,})\s*=\s*\{([^{}]{0,600})\}/g)) {
      const vals = [...m[2].matchAll(/"([A-Z][A-Z0-9_]{2,})"/g)].map(x => x[1]);
      if (vals.length && !constants.has(m[1])) constants.set(m[1], vals);
    }
    src.split("\n").forEach((L, i) => {
      const found = new Set();
      for (const fn of Object.values(MATCHERS)) for (const c of fn(L)) found.add(c);
      for (const c of found) {
        if (!sites.has(c)) sites.set(c, []);
        sites.get(c).push({ file: f, line: i + 1, text: L });
      }
      for (const m of L.matchAll(/\breason\s*[:=]\s*([A-Z][A-Z0-9_]{2,})\b/g)) {
        if (!byIdent.has(m[1])) byIdent.set(m[1], []);
        byIdent.get(m[1]).push({ file: f, line: i + 1 });
      }
    });
  }

  const untranslated = [...census.union].filter(c => !translated.has(c)).sort();
  /* M0-79: the same subject restricted to the codes in the commit at HEAD, which is the figure the slack gate reads
     (see `SLACK`'s header, D-257). DERIVED FROM `untranslated` on purpose: a walk that empties the subject empties this
     too, so nothing here can keep a blinded partition's floor quiet (refusal-partition.control.mjs arm 7 empties it).
     The floor check just below still reads the whole subject, as it always has. */
  const untranslatedRepro = untranslated.filter(c => census.unionRepro.has(c));
  MEASURE("untranslated", untranslatedRepro.length, "census codes with no canned translation, in the commit at HEAD "
    + "(arm F's subject; the `arm F: THE PARTITION` line)", untranslated.length);
  /* THE EMPTY-CORPUS DEFENCE IS THE FLOOR AND NOT A HARD ZERO CHECK, and the
     difference was measured rather than reasoned: a hard `if (!untranslated.length)`
     FAILED THE GUARD'S OWN CONFORMANT FIXTURE, where every code being translated
     is the SUCCESS condition. An instrument that cannot express "this subject is
     legitimately finished" would have made its own suite unwritable — and on the
     real tree the floor says the same thing far more precisely, because 0 < 246
     fails just as loudly as 0 < 1 while ALSO catching a walk that lost half. */
  if (untranslated.length < FLOOR.untranslated)
    FAIL(`arm F has ${untranslated.length} untranslated code(s) to partition, floor is `
       + `${FLOOR.untranslated}. A partition of nothing sums correctly and proves nothing — this is the `
       + `empty-corpus failure this project has measured passing a headline assertion three times. `
       + `Either the sweep closed ${FLOOR.untranslated - untranslated.length} codes, in which case move `
       + `this floor in the same turn from the printed figure, or the walk lost sight of them.`);

  /* A LITERAL THAT IS A PREFIX IS NOT A CODE. `reason: "SIG_" + sv.reason` —
     detected structurally (the literal is immediately followed by a `+`), never
     by naming `SIG_`. */
  const isConstructed = (c) => (sites.get(c) || []).length > 0
    && (sites.get(c) || []).every(s => new RegExp(`"${c}"\\s*\\+`).test(s.text));

  const P = new Map();
  const put = (k, c) => { if (!P.has(k)) P.set(k, []); P.get(k).push(c); };
  for (const c of untranslated) {
    const at = sites.get(c) || [];
    const files = new Set(at.map(s => s.file));
    if (DECLARED_UNREACHABLE.has(c))                     put("F1 UNREACHABLE — needs a DECISION, not a sentence", c);
    else if (isConstructed(c))                           put("F2 CONSTRUCTED — not a code; the real ones are invisible", c);
    else if (at.length && ![...files].some(f => REQUEST_PATH.has(f)))
                                                         put("F3 SUBSYSTEM — needs a DETERMINATION: does it cross the wire?", c);
    else if (at.length >= 2)                             put("F4 MULTI-SITE — needs a STRUCTURAL change, not a sentence", c);
    else if (reach.has(c))                               put("F5 IN REACH, one site — needs a SENTENCE, now", c);
    else                                                 put("F6 out of reach, one site — needs a sentence WHEN its surface exists", c);
  }

  /* THE PARTITION MUST ADD UP, and this is the arm that says so. A partition
     whose parts do not sum to its whole is the same defect as the census
     sentence this arm was written to correct: a number that has stopped
     describing its subject. Gated at zero, never ratcheted. */
  const summed = [...P.values()].reduce((n, v) => n + v.length, 0);
  if (summed !== untranslated.length)
    FAIL(`arm F's partitions sum to ${summed} but there are ${untranslated.length} untranslated codes. `
       + `A code has landed in two partitions or in none, so the parts no longer describe the whole — `
       + `which is precisely the defect this arm exists to have caught.`);
  for (const k of [...P.keys()].sort())
    NOTE(`arm F: ${k.padEnd(66)} ${String(P.get(k).length).padStart(3)} — ${P.get(k).join(", ")}`);
  NOTE(`arm F: THE PARTITION of ${untranslated.length} untranslated code(s) over a census of `
     + `${census.union.size}, in ${P.size} partitions ordered BY THE DECISION EACH NEEDS, summing exactly `
     + `(gated at zero). ${[...P.keys()].sort().map(k => `${k.slice(0, 2)}=${P.get(k).length}`).join(" ")} · `
     + `floor ${FLOOR.untranslated} · ${untranslatedRepro.length} of them ${HEAD_SAYS}, the figure its slack is gated `
     + `on and the one a floor may be moved to (M0-79)`);
  for (const [c, why] of DECLARED_UNREACHABLE)
    NOTE(`arm F: DECLARED unreachable (NOT established by this walk) — ${c}: ${why}`);

  /* THE RESIDUE: codes this walk knows it cannot see. Printed, never scored
     zero — a thing the matcher does not understand must be NAMED. */
  const hidden = [];
  const recovered = new Set();
  for (const [ident, where] of byIdent) {
    if (census.union.has(ident)) continue;              // it is a code in its own right
    const resolved = constants.get(ident) || null;
    const missing = (resolved || []).filter(c => !census.union.has(c));
    for (const c of missing) recovered.add(c);
    hidden.push(`${ident}${resolved ? ` -> ${resolved.map(c => `"${c}"`).join("/")}` : " (UNRESOLVED — this walk "
              + "cannot say what code this refusal sends)"} at `
              + where.slice(0, 3).map(w => `${w.file}:${w.line}`).join(", ")
              + (resolved ? (missing.length ? ` [${missing.length} NOT IN THE CENSUS]` : " [already in the census]") : ""));
  }
  if (hidden.length)
    NOTE(`arm F: RESIDUE — ${hidden.length} refusal(s) name their code through a CONSTANT or a LOOKUP `
       + `TABLE, which no source-text matcher in this file can see; ${recovered.size} real code(s) recovered `
       + `that the census does NOT contain (${[...recovered].sort().join(", ") || "none"}). **SO THE CENSUS IS `
       + `A FLOOR ON THE PLANE'S REFUSAL VOCABULARY AND NOT A TOTAL**, and that sentence is this arm's most `
       + `important output: every figure in this file that divides by the census is dividing by a floor. `
       + `${hidden.join(" · ")}`);
  NOTE(`arm F: WHAT THIS ARM CANNOT SEE (stated every run, not only in the header): per-site \`detail\` `
     + `prose is NOT walked at all and UI-43 measured it far more numerous than the canned translations; `
     + `"in reach" means a surface EXISTS today, never that a member could not otherwise meet the code; `
     + `and whether a subsystem refusal crosses the wire is an open question this walk does not answer.`);
  return { untranslated, P };
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
  MEASURE("vocabularies", vocabularies, "the plane's own text vocabularies found by shape (the `arm E` line)");
  MEASURE("vocabularyTerms", terms, "terms across those vocabularies (the `arm E` line)");
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
MEASURE("census", census.unionRepro.size, "the plane census — refusal codes the matcher set finds in the "
  + "bio-plane/src files in the commit at HEAD, plus the family rows (the `walk: UNION` line)", census.union.size);
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
   estimated, because an unmeasured answer is not a result.

   **THE SENTENCE BELOW WAS WRONG UNTIL REC-79 AND THE CORRECTION IS THE POINT.**
   It read: *"N of M refusal codes the plane can mint have NO canned translation
   AND ARE NOT IN REACH of a surface today."* Both halves were joined by an
   `and`, and the second half was false for 41 of the 248 — the exact set arm B
   names by code three lines above it, every run. One number carried two claims;
   nobody had to be careless for it to go wrong, because the two claims were true
   together on the day it was written and then drifted apart. It now states the
   ONE thing it measures, and the reach split is quoted from arm B rather than
   re-derived, so the two cannot disagree again. Arm F is the partition. */
const ungoverned = [...census.union].filter(c => !translated.has(c)).sort();
const ungovernedInReach = ungoverned.filter(c => reach.has(c));
NOTE(`census gap (REPORTED, not gated — see header): ${ungoverned.length} of ${census.union.size} refusal codes `
   + `the plane can mint have NO canned translation. ${ungovernedInReach.length} of those ARE in reach of a `
   + `surface today (arm B's ratchet, named above) and ${ungoverned.length - ungovernedInReach.length} are not — `
   + `**two different defects, and arm F partitions them by the decision each needs.** `
   + `${census.union.size - ungoverned.length} are translated.`);
armF(census, translated, reach);

/* ============================================================== M0-79, 2026-09-21
   THE SLACK ARM — EVERY RATCHET KEY JUDGED IN THE DIRECTION ITS OWN ARM DOES NOT
   LOOK, AND THE FULL SET ACCOUNTED FOR. The rule, the bounds and which figure is
   gated are in `SLACK`'s header; this is the comparison each arm was one line from
   making. It runs LAST so it judges the figures every arm above RECORDED, and it
   judges nothing the arms did not record: a key with no recorded figure is a
   failure here, never a silent pass.
   ============================================================================ */
const RATCHET_KEYS = (() => {
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const words = s => (typeof s === "string" ? s.trim().split(/\s+/).filter(Boolean).length : 0);
  const keys = [...new Set([...Object.keys(FLOOR), ...Object.keys(CEILING), ...Object.keys(SLACK), ...MEASURED.keys()])];
  const table = [];
  let gated = 0, over = 0, unaccounted = 0;
  const exempted = [];
  for (const k of keys) {
    const inF = has(FLOOR, k), inC = has(CEILING, k), s = has(SLACK, k) ? SLACK[k] : null, m = MEASURED.get(k);
    const lose = (why) => { unaccounted++; FAIL(`RATCHET COVERAGE — \`${k}\` ${why} (M0-79: every FLOOR and CEILING key is `
      + `gated at a slack bound stated in \`SLACK\`, or exempted there with its reason, and judged on the figure its own arm `
      + `records — the cheap way past a slack gate is to gate only the figures that happen to be equal).`); };
    if (inF && inC) { lose("is BOTH a FLOOR and a CEILING key, so the direction its slack is measured in is undecidable"); continue; }
    if (!inF && !inC) {
      lose(s ? "has a line in `SLACK` but is neither a FLOOR nor a CEILING key — a bound for a ratchet that no longer "
             + "exists, or one deleted without its bound"
             : "was RECORDED as a measured figure but is neither a FLOOR nor a CEILING key — a misspelt key, or a floor "
             + "removed while its arm still reports");
      continue;
    }
    const dir = inF ? "floor" : "ceiling", set = inF ? FLOOR[k] : CEILING[k];
    if (!s) { lose(`is a ${dir} with NO SLACK BOUND STATED — nobody decided how far its measurement may run past it`); continue; }
    if (has(s, "bound") === has(s, "exempt")) {
      lose(`has a \`SLACK\` line carrying ${has(s, "bound") ? "BOTH a bound and an exemption" : "NEITHER a bound nor an exemption"}`
         + " — exactly one of the two is the decision");
      continue;
    }
    if (has(s, "bound") && !(Number.isInteger(s.bound) && s.bound >= 0)) {
      lose(`has a bound of ${JSON.stringify(s.bound)}, which is not a whole number of zero or more`); continue;
    }
    if (has(s, "bound") && words(s.why) < 6) {
      lose("has a bound with no stated reason (`why`, six words or more) — a bound is a design call made AT THE SITE, "
         + "and one with no reason is a number nobody can re-examine"); continue;
    }
    if (has(s, "exempt") && words(s.exempt) < 6) {
      lose("is EXEMPT with no stated reason (six words or more) — an exemption without its argument is a floor nobody "
         + "is enforcing and nobody remembers deciding about"); continue;
    }
    if (typeof set !== "number" || !Number.isFinite(set)) {
      lose(`has a ${dir} of ${JSON.stringify(set)}, which is not a number — every comparison against it is false, `
         + `so it gates nothing in either direction`); continue;
    }
    if (!m) {
      lose(`has NO RECORDED FIGURE — the arm that compares its ${dir} did not \`MEASURE\` what it measured, so neither its `
         + `slack nor its ${dir} can be judged, and a gate with nothing to compare passes everything`); continue;
    }
    const slack = inF ? m.value - set : set - m.value;
    const elsewhere = m.working !== m.value
      ? ` · the working tree reads ${m.working}: an uncommitted file moves it, and the ${dir} moves to that figure only in `
      + `the commit that adds the file (D-257)` : "";
    if (has(s, "exempt")) {
      exempted.push(k);
      table.push(`ratchet:   ${k.padEnd(20)} ${dir.padEnd(7)} ${String(set).padStart(5)} · measured ${String(m.value).padStart(5)}`
        + ` · slack ${String(slack).padStart(5)} · EXEMPT — ${s.exempt}${elsewhere}`);
      continue;
    }
    gated++;
    const status = slack < 0 ? `BREACHED (failed above by its own arm)`
                 : slack > s.bound ? `SLACK BEYOND ITS BOUND — FAILS` : `gated`;
    table.push(`ratchet:   ${k.padEnd(20)} ${dir.padEnd(7)} ${String(set).padStart(5)} · measured ${String(m.value).padStart(5)}`
      + ` · slack ${String(slack).padStart(5)} / bound ${s.bound} · ${status}${elsewhere}`);
    if (slack > s.bound) {
      over++;
      FAIL(inF
        ? `FLOOR SLACK — \`${k}\`: floor ${set}, measured ${m.value} — ${slack} above the floor, against a stated bound of `
          + `${s.bound} (${s.why}). A floor with slack is not a ratchet: this figure could fall by ${slack} and the guard `
          + `would still pass, and REC-71 measured 19 codes of such slack turning a control arm from RED to GREEN. Move `
          + `FLOOR.${k} to ${m.value} — the figure this run printed — in the same commit as the change that moved it, and `
          + `say whose growth it absorbs (M0-79). Measured as: ${m.what}.${elsewhere}`
        : `CEILING SLACK — \`${k}\`: ceiling ${set}, measured ${m.value} — ${slack} below the ceiling, against a stated bound `
          + `of ${s.bound} (${s.why}). A ceiling with slack lets its subject get worse by ${slack} without failing (CASE-6 `
          + `found \`reachGap\` carrying one). Lower CEILING.${k} to ${m.value} — the figure this run printed — in the same `
          + `commit as the change that lowered it (M0-79). Measured as: ${m.what}.${elsewhere}`);
    }
  }
  const nF = Object.keys(FLOOR).length, nC = Object.keys(CEILING).length;
  NOTE(`ratchet: M0-79 SLACK — ${nF + nC} ratchet key(s) (${nF} floor(s), ${nC} ceiling(s)), `
     + `${unaccounted ? `${unaccounted} NOT ACCOUNTED FOR (failed below)` : "EVERY one accounted for"}: ${gated} gated at a `
     + `bound stated at the site, ${exempted.length} EXEMPT with its reason${exempted.length ? ` (${exempted.join(", ")})` : ""}; `
     + `${over} carrying slack beyond its bound. Slack is measured - floor for a floor and ceiling - measured for a ceiling, `
     + `on the figure each arm records (for a floor, the figure in the commit at HEAD where the guard tells the two apart)`);
  for (const line of table) NOTE(line);
  return { total: nF + nC, over, unaccounted };
})();

for (const n of notes) console.log("  " + n);
if (fails.length) {
  for (const f of fails) console.error("FAIL: " + f);
  console.error(`check-refusal-codes: ${fails.length} failure${fails.length === 1 ? "" : "s"} — DEC-49's guard is `
    + `not optional: an untranslated code must FAIL THE HARNESS rather than reach a member.`);
  process.exit(1);
}
console.log(`check-refusal-codes: every code a surface can receive carries a canned translation `
  + `(${reach.size} in reach, ${rows.length} plane rows, ${surfaceTables.length} surface table(s) proved total) · `
  + `${RATCHET_KEYS.total} ratchet key(s), none carrying slack beyond its stated bound`);
