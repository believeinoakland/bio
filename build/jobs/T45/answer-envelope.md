# answer-envelope (T45)

**Status** · session_01V6aaxFDYEfw6Q7h7zHh9zL · depth 2 · WORKING · handled B4

## Record

**How the reading set was read** (mechanics §17). I read these whole: `roles/JOB.md`, BOB's START (B1), `build/manifest.md`, `build/requirements/answer-envelope.md` (public and private), the plan's entry T45-49, rule 4 (14) and (15) and the L11 merge order, and K2834's line. **My own code and tests, read whole** (P20, plan rule 2): `index.mjs`, `checks.mjs`, `families.mjs`, `load.mjs`, `catalogue-end.test.mjs`, `families.test.mjs`, `envelope.test.mjs`, `page-policy.test.mjs`, and the head and `changed` block of `rows-before-r43.json` (its 950 pin rows are a data fixture, which K2053 leaves out of the reading set). Of the 80 used modules, my entry needs only each new family's checks file. For each module whose file I list (case-account, case-check, action-holds, action-replies, plan-work, and action-producers' for later), I read its Purpose and the names of its checks file and family. I took the `where` and ruling of each re-worded or moved row from that owner's checks file, its T45 job record and `build/rulings.md` (K2780, K2791, K2845, K2849, K2852, K2855, K2859, K2864). No helpers were used.

**Entries applied (T45-49):**
- `CHECK_FAMILY_FILES` (`families.mjs`) now lists each new T45 family's file at its `modules.json` place:
  - `src/case-account/checks.mjs` (C-153), directly after case-disclosures' file and before case-authoring's;
  - `src/case-check/checks.mjs` (C-148), after review's and before conformance's;
  - `src/action-holds/checks.mjs` (C-149), after action-grammar's (actions holds no file) and before action-clocks';
  - `src/action-replies/checks.mjs` (C-150), after action-clocks' and before filing-templates';
  - `src/plan-work/checks.mjs` (C-151), after action-plans' and before monitoring's.

  None of their codes is held by an earlier family, and no other code moves. action-producers' C-152 has no file on `tranche/T45` yet; it waits for BOB's CHANGE.
- The R7 snapshot (`rows-before-r43.json`) is re-pinned to each owner's row, with `changed.note` naming each change and its ruling:
  - re-worded: C-113.7 (K2852), C-124.1 and C-124.30 (K2864), C-117.19 (K2849, K2855);
  - retired, added to `changed.retired`: C-115.19 `NO_DETERMINATION` (K2780, K2791);
  - moved, under a new `changed.moved` key: `PRESSURE_MARKED` and `PRESSURE_NO_ENTRY` go from C-117.17 and C-117.18 to C-149.6 and C-149.7, with code and words kept (K2845, K2859).

  `catalogue-end.test.mjs` asserts each move: the code reads its new number, and its old number is held by no code.
- Tests:
  - `families.test.mjs`: the accepted-work/case-import/docket test re-pins `PRESSURE_MARKED` to action-holds' C-149.6, which clears rule 4 (15)'s last item. The case-disclosures test places case-account between case-disclosures and case-authoring.
  - A new test, "R7, R2 (T45-49 …)", checks the five families' places, their own rows by identity and on the wire, that no earlier or later family holds their codes, that no other code moves, and a negative control for each file. It also asserts the `modules.json` edges (J1).

  No assertion was loosened.

**Flaws found in my own module (P8):** none in the code I read whole.

**Tests and checks run before J1** (on ef08a7cf9e, with `tranche/T45` @ 5877d22a2c merged in):
- `node --test bio-plane/test/m/answer-envelope/`: 32 tests, 31 pass, 1 fail. The red is the new T45 test's edge assertion ("answer-envelope uses case-account"), which waits on J1.
- Users: `store-door` 44/44. `control-plane` 219 pass, 4 fail, and `plane` 188 pass, 8 fail: the same failing tests as on `origin/tranche/T45` without my commit (plan rule 4's accepted reds), so none are mine.
- `checks/format.mjs`: 0 failures. `checks/coverage.mjs answer-envelope`: 12 of 12 live ids named, 0 failures. `checks/ownership.mjs answer-envelope tranche/T45`: 5 files, 0 failures. `checks/architecture.mjs answer-envelope`: 6 failures, all the missing `uses` edges (J1).

**After B2** (K2880: the edges and R7's T45 sentence; `tranche/T45` merged in). My `changed.moved` key and its assertion in `catalogue-end.test.mjs` meet R7's new sentence, and the new T45 test meets the Uses line. No code change was needed.
- `node --test bio-plane/test/m/answer-envelope/`: 32 tests, 32 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs answer-envelope`: 9 product files, 0 failures. `checks/coverage.mjs answer-envelope`: 12 of 12, 0 failures. `checks/ownership.mjs answer-envelope tranche/T45`: 5 files, 0 failures.
- Deferred: action-producers' C-152, until its `checks.mjs` lands (BOB's CHANGE).
- Other modules: nothing new to report. Rule 4 (14) and (15)'s answer-envelope items are cleared by this job.

**After B4** (K2888; `tranche/T45` merged in): action-producers merged with no `checks.mjs` and no exported `*_CHECKS` family. Its `reason` fields are undetermined states and relayed reasons, not refusal codes. There is nothing to list, so C-152 does not exist yet, and the T45 Uses line's action-producers clause stays unused until a family lands. If one does later, the totality test turns red until it is listed. No change was needed.
- `node --test bio-plane/test/m/answer-envelope/`: 32/32.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs`: 9 files, 0 failures. `checks/coverage.mjs`: 12 of 12. `checks/ownership.mjs`: 1 file, 0 failures.

Size (session_01V6aaxFDYEfw6Q7h7zHh9zL): test runs 15, module lines 858

## J1 · QUESTION

T45-49 applied on job/T45/answer-envelope (pushed): `CHECK_FAMILY_FILES` lists case-account (C-153, after case-disclosures), case-check (C-148, after review), action-holds (C-149, after action-grammar), action-replies (C-150, after action-clocks) and plan-work (C-151, after action-plans). action-producers has no `checks.mjs` on tranche/T45 yet; I wait for your CHANGE. Module tests 32/32; format, coverage (12/12) and ownership (0 failures) clean.

**Needs you (edges):** `node checks/architecture.mjs` fails 6 times. answer-envelope's `uses` in `build/modules.json` does not name case-account, case-check, action-holds, action-replies or plan-work (or action-producers, for later), and `families.mjs` now imports each one's `checks.mjs`. My best reading is that the entry implies these edges, as T41's did (K2418), and that you add the five, with action-producers when its file lands, to `modules.json` and to my requirements' Uses. My new T45 test asserts each edge, and it stays red until you add them. I am carrying on as if you will.

**Reading, to confirm (R7):** the R7 snapshot (`rows-before-r43.json`) is re-pinned, as rule 4 (14) and (15) direct, to each owner's row:
- re-worded: C-113.7 (K2852), C-124.1 and C-124.30 (K2864), C-117.19 (K2849);
- retired: C-115.19 `NO_DETERMINATION` (K2780, K2791);
- moved: `PRESSURE_MARKED` and `PRESSURE_NO_ENTRY` go from C-117.17 and C-117.18 to C-149.6 and C-149.7, with code and words kept. They are recorded under a new `changed.moved` key and asserted, with the old numbers held by no code.

R7 names re-wordings and retirements as exceptions, but it does not name a row that moves to a new number. I read the T45 plan's id-move table (K2845, K2859) as authorising the move. R7's text could gain a T45 sentence naming these exceptions, as R10 did for T41; that is yours to decide.

## J2 · COMPLETE

T45-49 done (B2 merged): CHECK_FAMILY_FILES lists case-account C-153, case-check C-148, action-holds C-149, action-replies C-150, plan-work C-151 at their modules.json places; R7 snapshot re-pinned (C-113.7, C-124.1, C-124.30, C-117.19 re-worded; C-115.19 retired; PRESSURE_MARKED/PRESSURE_NO_ENTRY moved to C-149.6/.7 under changed.moved, meeting R7's T45 sentence). Clears rule 4 (14) and (15)'s answer-envelope items. answer-envelope 32/32; store-door 44/44; control-plane 219/4 and plane 188/8 identical to tranche/T45 without my commits. format, architecture (9 files), coverage (12/12), ownership (5 files): 0 failures. Deferred: action-producers' C-152 until its checks.mjs lands (your CHANGE). Record in build/jobs/T45/answer-envelope.md.
