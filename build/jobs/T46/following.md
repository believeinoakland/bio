# following (T46)

**Status** · session_01L8jTVDmJrcExvnrLUdm4m3 · depth 2 · COMPLETE · handled B2

## Work

**Read.** Read whole, myself: `build/requirements/following.md` (public and private); every file of my code (`index.mjs`, `checks.mjs`, `legistar.mjs`, `meetings.mjs`, `schema.mjs`, `snapshot.mjs`); the tests I changed (`watches.test.mjs`, `fixture.mjs`); my plan entry T46-42 and the plan's rules; plan-work's R13 and R15 and their code (`matterPromiseDuties`, `#metAt`), and its R15 tests. The set was 853 KB, over the 600 KB limit (mechanics §17 (3), K2032). A helper session read my other seven test files (`body`, `checks`, `meetings`, `policy`, `portal`, `registers`, `tick`) and the public parts of all 19 modules in my Uses whole, and wrote me a digest citing each section. The sources stay binding.

**Entries applied.**
- T46-42 (N921; R27, amending R24 (b)). `#promisesMetAt` now reads `plan-work.matterPromiseDuties` alone (its R13, R15), with no member's sight (`viewer: null`), as of the asker's `now`.
  - A link is due on `promises_met` when every one of its matters (all the plan's matters when it names none) answers `ok`, `all_met` and not `partial`, with a readable `met_at`. `due_at` is the latest `met_at`, spelled as a whole-second instant.
  - Any matter without a `met_at`, or partial, or not all met, or refused, or whose read throws, makes the link not due by this cause.
  - The derivation from `duties.occurrencesOf` and occurrence evidence is gone, and so is its fallback: before, a link whose matters were all met but had no evidence instant was answered due at "now". It is now never guessed. The `bounds` import is dropped.
  - R24's other terms are unchanged.
- The test stand-in for plan-work answers R15's `met_at` and counts calls. Two new tests:
  - "R27 promises_met is read from …": the stand-in. Two matters met on different days give the later instant. Plan-work's `met_at` governs over the occurrences, and `occurrencesOf` is never read. No `met_at`, `partial`, not all met, a refusal, an unreadable `met_at` and a throw each make the link not due. Read with `viewer` null and the asker's `now`. Controls: one unmet duty; the closed cause first; an ended watch.
  - "R27 with the real plan-work": two recorded met readings give the later instant (`2026-10-08T17:30:00Z`), read through duties' internal reader. Control: one duty pending, nothing listed.
- I read my own code and tests whole (P20). The flaws found and how each was dealt with (P8):
  - `checks.test.mjs`' R4 test named `MACHINE_CANNOT_FOLLOW` in its title but did not assert it. It now does: a machine author and an empty one, each with row C-137.1, and nothing written.
  - The `#promisesMetAt` "now" fallback (above) is removed.

**Deferred, with why.**
- `body.test.mjs` R18 includes a grep of `src/following/` for place names, and `checks.test.mjs` R18 includes a regex over translations. These are source-text checks beside behavioural ones. Removing them would weaken R18's coverage, and R18's behavioural part ("no place named in outward text") has no full interface check for every answer yet. Left as is for a later following job.
- `policy.test.mjs` R21 (`OUTSIDER.startsWith`) and `tick.test.mjs` R17 (`MACHINE === "class:daemon"`) each end with a fixture assertion. They are harmless and left as is.
- The `checks.test.mjs` loop skips the "writes nothing" count for 7 codes, because their cases set up a follow on each run. Their own tests check that nothing was written elsewhere. Not a flaw.

**Found in other modules (for BOB; no change made).**
- plan-work R15 does not say which transition instant `met_at` is. Its code uses `as_of`, the start of the closing run of met readings. It cites duties "R9", where the transitions are R13/R14. It also names no `met_at_why`, though the code answers one.
- plan-work R13's signature names no `nowMs`, which the code takes. Following now passes it so the read is as of the asker's `now`.
- action-plans' public part names no field for the closing instant. Following reads `closed.at`, as before.
- These are wording only; each module behaves consistently.

**Tests and checks.**
- `node --test bio-plane/test/m/following/`: 75 pass, 0 fail.
- Users of following:
  - scheduler 129/0, action-producers 36/0, notice-producers 102/0.
  - affordances 3 fail, op-declarations 7, answer-envelope 1, control-plane 2, plane 1. Each count is identical with my change stashed: these are the inherited op-table and registry reds of rule 5 (7)–(8) and T46-51/-59/-62, none mine.
- Process checks:
  - `format`: 0 failures.
  - `architecture following`: 0 failures.
  - `coverage following`: 27 of 27 ids named, 0 failures.
  - `ownership following tranche/T46`: 0 failures.
  - `run.mjs`: architecture 0 failures; coverage fails for 17 other modules only, none following.
- No layer tests are named in the manifest.

Size (session_01L8jTVDmJrcExvnrLUdm4m3): test runs 9, module lines 1833

## J1 · COMPLETE

T46-42 applied: R27 met. R24's promises_met is now read from plan-work's matterPromiseDuties met_at alone, with no member's sight, as of the asker's now. The derivation from occurrencesOf is gone, and so is its fallback to "now".
Tests: two new R27 tests, one against a stand-in and one against the real plan-work, each with controls. following: 75 pass, 0 fail.
Checks: format, architecture, coverage (27 of 27 ids) and ownership all report 0 failures; run.mjs reports 0 architecture failures.
Users' reds: the same failures appear with my change stashed, so they are the inherited reds of rule 5 (7)-(8).
Notes for BOB, in the record: plan-work R15 and R13 wording (which instant met_at is, met_at_why, nowMs) and action-plans' closing-instant field.
No file outside my paths.

**B2 (CHANGE, K2992).** I merged `tranche/T46`, which now carries monitoring T46-41, into this branch.
- `node --test bio-plane/test/m/following/`: 75 pass, 0 fail.
- `architecture`, `coverage` (27 of 27 ids) and `ownership`: 0 failures each.
- The merge opens no red.
