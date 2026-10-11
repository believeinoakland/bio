# steps (T42)

**Status** · session_01WWPqUf9HsGVbwvRQC3juMx · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied.** T42-14 (N843; K2566, K2608): R28. `stepAccept` refuses an absent or unseen proposed step with `NO_SUCH_STEP_PROPOSAL`. The row C-142.28 was re-coded in place in `src/steps/checks.mjs` and keeps its number, `where` and translation. `src/steps/index.mjs` `stepAccept` answers the new code, and its detail now reads "no proposed step by that id". No `NO_SUCH_PROPOSAL` remains in `src/steps/` or `test/m/steps/`.

**Tests.** `test/m/steps/proposals.test.mjs` has a new test, "R28: …". It first checks the row: its number and translation, and that no `NO_SUCH_PROPOSAL` key is held. It then covers every absent or unseen path into `stepAccept` and checks the full refusal `{ok, code, reason, check, translation}` for each:
- an unknown id
- null
- a malformed id
- a member who may not see the proposal's question
- an absent stamp

It also checks that nothing was written. Negative control: the same proposal, accepted by a joined member, is not refused and is taken up. The R24 test's unseen case was changed to the new code. I checked that the R28 test catches the old code: with the change stashed, the R28 test fails (pass 0, fail 1).

**Reading (mechanics §17; the START measured 505 KB, which is over 300 KB).**
- I read these whole myself:
  - `build/requirements/steps.md`
  - layer 6's row of `build/layers.md`
  - `src/steps/index.mjs` (1,350 lines) and `src/steps/checks.mjs`, the code the entry changes
  - `test/m/steps/proposals.test.mjs`
  - the N843 section of `draft-T42-reqs.md`, and K2566 and K2608
- A worker read the rest of my code and tests whole: `schema.mjs`, `fixture.mjs` and the other eight test files, 72,897 bytes. It wrote a summary of about 1,200 words, citing file and line. None of those files names the old code, `stepAccept` or `stepPropose`, so none needed a change.
- The change uses no other service, so I read no used module's public part beyond what is named above.

**Deferred (own module).** A proposal's `step_id` can point at a step deleted later. Example: an accepted proposal on questions whose step was then deleted while untouched. The `steps_gone` trigger (`schema.mjs` 169–181) does not clear `step_proposals.step_id`, so `stepProposals` can name a step that no longer exists. This is small: the read of that step then answers `NO_SUCH_STEP`. I deferred it because the fix is a schema trigger change, which is outside this entry and touches the migration the released-store test exercises. It suits a later steps entry.

**Found in other modules.**
- **answer-envelope.** `test/m/answer-envelope/families.test.mjs:420` (`HELD_EARLIER`) still pins `["src/steps/checks.mjs", "NO_SUCH_PROPOSAL", "C-142.28"]`. The test at :425 ("R10, R7, R2 (T41; …)") is therefore red. This is expected until T42-27 (L11; rule 4 (6)), and I did not change it.
  - The suite's other red, "R7, R2, R10: every code decorated before the catalogue's end…", is red on the tranche code too. It is hypotheses' C-134.22/.23, inherited and not mine.
  - Suite totals: with my change, 27 pass and 2 fail; on the tranche code, 28 pass and 1 fail.
- **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` (owned by not_product, from the plane's source) still carries the row under `NO_SUCH_PROPOSAL` (around line 151206), so my change makes it stale. BOB regenerates it at the layer close; I did not touch it.

**Users' suites (P11).**
- These pass:
  - ai-runs: 81 pass, 0 fail
  - run-productions: 54 pass, 0 fail
  - capture-requests: 108 pass, 0 fail
  - question-explorer: 27 pass, 0 fail
  - investigation: 28 pass, 0 fail
  - affordances: 232 pass, 0 fail
  - notice-producers: 90 pass, 0 fail
  - op-declarations: 128 pass, 0 fail
  - control-plane: 216 pass, 0 fail
  - plane (`test/m/plane/`): 166 pass, 0 fail
- answer-envelope: 27 pass, 2 fail, as described above.
- `test/system/migrate-released.test.mjs`: fails with 1 fail both with my change and on the tranche code (it runs for about 396 s). This is inherited: rule 4 (7), the `ai_ceilings` arm, until T42-17.

**Module tests.** `node --test bio-plane/test/m/steps/`: 34 pass, 0 fail. Layer tests: none named in `build/manifest.md`.

**Checks** (civicos-process @ bbe8f30):
- format: 147 modules, 146 requirements files; 0 failures.
- architecture steps: 13 product files, 34 relative imports; 0 failures.
- coverage steps: 27 of 27 live requirement ids named by a test; 0 failures.
- ownership steps tranche/T42: 0 failures (re-run after the commit, below).

Size (session_01WWPqUf9HsGVbwvRQC3juMx): test runs 17, module lines 3

## J1 · COMPLETE

T42-14 applied, so R28 is met.
- C-142.28 is re-coded in place as NO_SUCH_STEP_PROPOSAL, with its number and translation kept.
- The R28 test covers every absent or unseen path and has a negative control; it fails on the old code.
- steps: 34 pass, 0 fail.
- All four checks report 0 failures.

Users' suites are green except two:
- answer-envelope: families.test.mjs:420 (HELD_EARLIER) still pins steps' C-142.28 under NO_SUCH_PROPOSAL, so the test at :425 is red. Your START expected this until T42-27, and I left it unchanged. The suite's other red is hypotheses' C-134.22/.23, which is red on the tranche code too.
- test/system/migrate-released.test.mjs fails the same way on the tranche code (rule 4 (7)).

bio-plane/dist/bio-plane.bundled.mjs is stale for this row; it is regenerated at the layer close.

One small flaw in my module is deferred, with the reason in my record: a proposal's step_id can point at a step deleted later.

Record: build/jobs/T42/steps.md.

## B2 · CHANGE (K2655): the deferred flaw, fixed in this job

The flaw is fixed in this job, so the Completion section's "Deferred (own module)" no longer stands.

**The fix** (`src/steps/schema.mjs`):
- A new trigger, `steps_gone_proposals`, runs AFTER DELETE ON steps and clears `step_proposals.step_id` for the step that went. It is its own trigger because `CREATE TRIGGER IF NOT EXISTS steps_gone` would not change on a store that already holds `steps_gone`.
- An idempotent update clears any `step_id` that already names no held step, on a store that predates the trigger.
- As a result, a decided proposal keeps its status, form, reason and decider, and `stepProposals` answers `step: null` instead of naming a deleted step.

**Requirement wording, for BOB.** No existing R id covers what `stepProposals` answers about the step: R24 says only that a set-aside proposal stays readable with its reason. A suggested line for R24: "A decided proposal names the step it created only while that step is held; once that step is deleted, it names none." The test is titled R24, R6, since R6 says a deletion leaves no row.

**Test.** proposals.test.mjs has a new test, "R24, R6: a decided proposal never names a step that has gone…". It deletes the step an accepted proposal created and checks that the proposal is still accepted, keeps its form, and names no step. It then drops the trigger to stand for an older store, deletes a step, sees the name left behind, runs `migrate()`, and checks that the name is cleared and the trigger exists again. Negative control: a proposal whose step is still held still names it. The test fails with the schema change stashed (pass 0, fail 1).

**Re-run, after merging `tranche/T42` at 93c845ce53.**
- steps: 35 pass, 0 fail.
- Users' suites: these all pass with 0 fail:
  - ai-runs (81 pass)
  - run-productions (54)
  - capture-requests (108)
  - question-explorer (27)
  - investigation (28)
  - affordances (232)
  - notice-producers (90)
  - op-declarations (128)
  - control-plane (216)
  - plane (166)
  - `test/system/migrate-released.test.mjs` (1 pass, 0 fail; it now passes on this head)
- answer-envelope: 28 pass, 1 fail. The one red is `families.test.mjs:425` (its pin at :420), the expected red until T42-27. The hypotheses red is gone on this head.
- Checks: format, architecture, coverage (27 of 27) and ownership each report 0 failures.

Size (session_01WWPqUf9HsGVbwvRQC3juMx): test runs 31, module lines 9

## J3 · COMPLETE

B2 is done: the flaw from J1 is fixed in this job.
- A new trigger, steps_gone_proposals, runs AFTER DELETE ON steps. It is separate so that existing stores gain it.
- An idempotent update clears any step_id that already names a gone step.
- So stepProposals never names a deleted step, and the decision itself is kept.

New test "R24, R6: …":
- covers both the trigger and the clean-up of an older store at start
- has a negative control: a held step is still named
- fails with the fix stashed

Results after merging tranche/T42 @ 93c845ce53:
- steps: 35 pass, 0 fail.
- Users' suites are all green, including migrate-released (1 pass, 0 fail).
- answer-envelope: 1 red, families.test.mjs:425 (pin at :420), which is expected until T42-27.
- All four checks: 0 failures.

Wording is yours: no existing R id covers what stepProposals answers about the step. My record suggests a line for R24.
