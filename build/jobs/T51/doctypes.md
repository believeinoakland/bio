# doctypes (T51)

**Status** · session_0148uDjHuj3piiQwEKdKFmzX · depth 2 · WORKING · handled B4

## J1 · REPORT

Other-module finding from T51-8 (doctypes). Not changed by this job; for the module owners or the T51-126 sweep.

Comments that still name `civicos-ui/app.html` or `civicos-ui/` as a live file, found while reading `build/requirements` and code for the stale-comment check. Several are historical ("deleted in T20") and need no change; the rest describe the old UI as if it were still there:

- bio-plane/src/affordances.mjs:336, :469, :509, :527, :605
- bio-plane/src/provenance-routes/index.mjs:256
- bio-plane/src/review/checks.mjs:25
- bio-plane/src/retrieval/checks.mjs:73
- bio-plane/src/queue/index.mjs:1210, :1443, :1518
- bio-plane/src/public-read/index.mjs:1159
- bio-plane/src/publication/worker.mjs:322
- bio-plane/src/queuestate.mjs:408
- bio-plane/src/gate.mjs:342
- bio-plane/src/bias/checks.mjs:473
- bio-plane/src/content/extent-core.mjs:38, :606
- agent-worker/src/index.mjs:287

Reported only; these are other modules' code. T51-126 deletes `civicos-ui/`, so BOB may want these swept in the same act.

Also observed in a full `checks/run.mjs` run on the tranche's job branch (not doctypes): coverage 3 failures, agent-harness R17, agent-runner R36 R38 R37 R40, journey-check R19. Outside this job; noted for BOB.

## J2 · COMPLETE

**Entries applied**
- B1 (START, depth 2) read and acted on. Cursor moved to B1.
- T51-8: the stale comment at `doctypes/meeting-minutes.mjs` lines 80–82 named `civicos-ui/app.html`, deleted in T51-126. It now names the plane's bundle, `bio-plane/dist/bio-plane.bundled.mjs`, which still puts every doctype in one scope (checked: `minutesFileLines` and `agendaFileLines` are top-level in that bundle). Comment only, no code changed. Commit e436fc2caa on job/T51/doctypes.

**Deferred:** none.

**Other modules:** a list of comments in other modules that still name `civicos-ui` is in a REPORT posted with this COMPLETE. Also seen, not mine: coverage red in agent-harness (R17), agent-runner (R36 R37 R38 R40), journey-check (R19).

**Reading:** the requirements (both parts), T51-8's plan entry, the module's code (all 11 source files, read whole), and the test suite run.

**Tests and checks**
- `node --test doctypes/test/`: tests 45, pass 45, fail 0, skipped 0.
- `checks/format.mjs /home/user/bio`: 174 modules, 170 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio doctypes`: 34 product files, 64 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio doctypes`: 36 of 36 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio doctypes tranche/T51 job/T51/doctypes`: 1 file changed by doctypes; 0 failures.
- `checks/run.mjs /home/user/bio` (BOB's note): format, architecture and channels 0 failures; coverage 3 failures, all in other modules (see above). None in doctypes.

**Note on the pull request:** JOB.md step 1 says to open no pull request, so none is open for this branch. The harness default asks for a draft PR after a push; I followed the process file, which is more specific to this role. BOB merges at the tranche boundary.

**M-T51-1:** module raw source lines = 3493 (`wc -l doctypes/*.mjs`, the module's own code; excludes `doctypes/test/` and its fixtures).

Size (session_01JKKYXh9GYPEvo5f4RVmsfZ): test runs 1, module lines 3493

## J3 · REPORT

Plain (unformatted) member-facing sentences remain in doctypes and the words check does not flag them, so they are not among the 50 findings of build/plan/words-pass/doctypes.md. Examples: meeting-calendar.mjs:52 ("no active jurisdiction profile states how long minutes usually take"), meeting-calendar.mjs:223, policy.mjs:371, regulation.mjs:349. R13 says a module "holds no sentence otherwise". I have not converted them, since the check does not ask for it. BOB to say whether they are in scope before the layer closes; if they are, I can convert them in this job or in a re-run of layer 1.

## J4 · COMPLETE

**Entries applied**
- B2 (START, the re-run of layer 1, T51-168, words pass) read and acted on. Cursor moved to B2. Notes 1 to 3 done: the findings are fixed by the words rule; ids are `doctypes.<file stem>.<slug>`; setup-words added to the import allowance of R21's test.
- T51-168: the 50 findings `checks/words.mjs` listed for doctypes are fixed. Each templated or stitched member-facing sentence in meeting-agenda, meeting-calendar, meeting-minutes, policy-header, policy, regulation, sections, staff-directory and staff-report reads through `localize("doctypes.<file>.<slug>", en, vars)`: 52 call sites, one id each, the wording unchanged. The words check on doctypes reads inline 0, testcopy 0, missingkey 0.
- Test changes: the R21 import list (doctypes/test/doctypes.test.mjs) now allows `bio-plane/src/setup-words`. The Administrative Instruction series label in test/policies.mjs moved to test/fixtures/policy-series.json, since it equalled a words.json `en`. regulation-sections.test.mjs:269 names its assertion "source URL" in place of a sentence the word list holds.
- Commit b90444a9bf on job/T51/doctypes.

**Deferred:** none.

**Other modules:** none found in this job. The full `checks/run.mjs` run shows reds in other modules only (coverage 33 failures across the tree; words findings in court-doctypes, budget-doctypes, wizard-scripts and others). The plain-sentence question for BOB is in a REPORT posted before this COMPLETE.

**Tests and checks** (run from civicos-process)
- `node --test doctypes/test/`: tests 45, pass 45, fail 0, skipped 0.
- `checks/words.mjs /home/user/bio doctypes`: 0 failures (inline 0, testcopy 0, missingkey 0).
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio doctypes`: 35 product files, 73 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio doctypes`: 36 of 36 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio doctypes tranche/T51 job/T51/doctypes`: 14 files changed by doctypes; 0 failures.
- `checks/run.mjs /home/user/bio`: no finding names doctypes. Its reds are in other modules (coverage 33 failures of 6048 ids; words findings in other modules).

**M-T51-1:** module raw source lines = 3507 (`wc -l doctypes/*.mjs`, the module's own code; excludes doctypes/test/).

Size (session_01PbhX4XrTyKrafF9MPnkqXP): test runs 1, module lines 3507

## J5 · REPORT

Two strings in doctypes/index.mjs stay plain. They are the `why` of registerDoctypes' return value (index.mjs:48, "the types are already registered here", and :58, "every type was already held by this registry"). The composition root reads them at wiring time, and no member sees them. The R2 test matches /already/ on them. Please put them on the design's unkeyed list (K3944), or say if they should be keyed instead.

## J6 · COMPLETE

**Entries applied**
- B3 (CHANGE, K3957, K3959) read and acted on. Merged tranche/T51 (fast-forward to 3bc25c6685) and pulled civicos-process (27aa50e) first.
- The 79 plain findings in build/plan/words-pass/doctypes.md are judged. Every sentence a member reads now goes through localize('doctypes.<file stem>.<slug>', en, vars): labels, reasons, signals, and the whole sentence of each two-line concatenation (commit 247c693374 on job/T51/doctypes). Test assertions match the same text, so no test changed.
- Two strings remain plain and are REPORTed to BOB (index.mjs:48 and :58), as wiring text.

**Deferred:** none.

**Other modules:** none.

**Tests and checks** (from civicos-process)
- `node --test doctypes/test/`: tests 45, pass 45, fail 0.
- `checks/words.mjs /home/user/bio doctypes`: 2 findings, both REPORTed above (index.mjs:48, :58); inline 0 other, testcopy 0, missingkey 0.
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio doctypes`: 35 product files, 74 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio doctypes`: 36 of 36 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio doctypes tranche/T51 job/T51/doctypes`: 10 files changed by doctypes; 0 failures.

**M-T51-1:** module raw source lines = 3498 (`wc -l doctypes/*.mjs`; excludes doctypes/test/).

Size (session_01PbhX4XrTyKrafF9MPnkqXP): test runs 2, module lines 3498

## J7 · COMPLETE

**Entries applied**
- B4 (CHANGE, K3962, K3965) read and acted on. Merged tranche/T51 and pulled civicos-process (ea6cd83) first.
- The one test copy in section "Test copies of code sentences (K3962)", doctypes/test/doctypes.test.mjs (the "this meeting has taken place..." assertion), now compares with localize("doctypes.meeting-calendar.taken_place", en).
- Regex copies of localize ens, converted as B4 asks: each now compares with localize(id, en[, vars]) by equality. These were doctypes.test.mjs (form_why and the references/body whys), policy.test.mjs (the detect why, header_why, sections_why), regulation-sections.test.mjs (form_why, the code-forms and neither-form sections_why, the added-section why, sections_none_read). Each test imports localize from bio-plane/src/setup-words/index.mjs. Fragments under 25 characters, and assertions on rendered values, stay as regex; none copies a localize en.
- Commit 56bdcc8415 on job/T51/doctypes.

**Deferred:** none.

**Other modules:** `node bio-plane/src/setup-words/build.mjs --check` (read-only) fails on a jurisdictions key, not doctypes: jurisdictions.index.amount_is_amount_and_units holds a formatted argument ({name, …}), which word and localize do not render yet (R18). For jurisdictions to fix; I have not touched it.

**Tests and checks** (from civicos-process)
- `node --test doctypes/test/`: tests 45, pass 45, fail 0.
- `checks/words.mjs /home/user/bio doctypes`: 2 findings, both REPORTed (index.mjs:48, :58); testcopy 0, inline 0 other.
- `checks/format.mjs`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio doctypes`: 35 product files, 77 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio doctypes`: 36 of 36 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio doctypes tranche/T51 job/T51/doctypes`: 3 files changed by doctypes; 0 failures.

**M-T51-1:** module raw source lines = 3498 (`wc -l doctypes/*.mjs`; excludes doctypes/test/). No product code changed in this round.

Size (session_01PbhX4XrTyKrafF9MPnkqXP): test runs 3, module lines 3498

## J8 · COMPLETE

**Entries applied**
- B5 (START, round RW) read and acted on. Cursor moved to B5. Merged `tranche/T51` (939aacda0f) into the job branch; no rebase.
- The words check's two findings in this module, both `why:` reasons joined by `+` and so read as plain sentences, are now read by key:
  - `doctypes/regulation.mjs` (was :374): `localize("doctypes.regulation.unread_either", …)`, the sentence unchanged.
  - `doctypes/staff-report.mjs` (was :327): `localize("doctypes.staff-report.unread_either", …)`, the sentence unchanged.
  - Stale rows: `setup-words` `rows.mjs` does not yet hold the two new ids; `localize` answers its `en` until BOB regenerates it at the layer close, as B5 says.
- Own-module flaw found while running the suite (P8): test `R3 R8 the minutes-due date is the profile's practice counted by civil-time` failed on the base too (1 of 45). `doctypes/meeting-calendar.mjs` (:67) wrote civil-time's refusal reason object into the sentence as `[object Object]`. Fixed by importing `reasonText` from `bio-plane/src/civil-time/index.mjs` (already imported from that path for `evaluateRule`, and already in this module's uses) and passing `reasonText(r.why)`. No change to civil-time. The test now passes unchanged.

**Deferred:** none.

**Other modules (not changed):**
- `node checks/run.mjs /home/user/bio` (whole repository) reports failures outside doctypes: `testcopy` in `wizard-scripts` (`bio-plane/test/m/wizard-scripts/t47.test.mjs`, `t48.test.mjs`, `writing-help.test.mjs`), and its summary counts 1628 words failures across modules. None is in `doctypes`; none was touched by this job.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for `doctypes.regulation.unread_either` is expected (BOB regenerates `rows.mjs` at the layer close).

**Tests and checks** (from civicos-process, main @ e8ac153)
- `node --test doctypes/test/*.test.mjs`: tests 45, pass 45, fail 0.
- `checks/words.mjs /home/user/bio doctypes`: 0 failures (inline 0, plain 0, testcopy 0, missingkey 0, unkeyed 0).
- `checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio doctypes`: 35 product files, 77 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio doctypes`: 36 of 36 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio doctypes tranche/T51 job/T51/doctypes`: 4 files changed by doctypes; 0 failures.

**M-T51-1:** module raw source lines = 3496 (`wc -l doctypes/*.mjs`; excludes `doctypes/test/`).

Commit `31e0334725` (the three module files), merge `7c950f73fc`, pushed to `job/T51/doctypes`.

Size (session_01KR42421Ri9anbvRDhf8oEd): test runs 8, module lines 3496
