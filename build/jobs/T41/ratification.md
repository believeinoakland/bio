# ratification (T41)

**Status** · session_01CSGGVWaWqeBwcqwfvQ31vc · depth 2 · COMPLETE · handled B5

## Completion (RATIFICATION #23, T41-39)

**Entry applied (T41-39; N811, N823, D60; K2370, K2438, K2471, K2528, K2533, K2535).**
- **R40, R3, R43 (N823): re-pointed to `publish-schedule`.** `op=publishat` calls `publishSchedule.scheduleEdition` (its R1); R3's waiting arm reads `publishSchedule.scheduledEditions` (its R4); the factory creates `publish-schedule` (`publishScheduleOf(host, {record, membership, publication})`, lazily, or `deps.publishSchedule`) and registers R42 once with its `registerScheduledPublisher` (its R2). The `typeof … === "function"` guards on publication's copy are gone. R44's and the headers' wording name `publish-schedule` R1.
- **R42 (N811; DEC-187 (4)):** the stop relays the commit's own C-122.6 code, check and translation (words.json `photo.refused.changed.signed`, by key, publication R33). The code already relayed it as given; the test now asserts the translation is that key's sentence, `{photo}` filled.
- **R49 (D60; K2528, K2533): `APPROVAL_MISSING`, new row C-58.11** (in `RATIFY_SCOPE_CHECKS`; your draft translation; `where` `refusals.mjs approvalMissingRefusal > is-approval-missing`; awaiting T42's stamp, rule 4 (2)). It is asked:
  - at `op=caseratify` and `op=publishat` after CASE_RATIFY_STALE and before NO_SIGNERS, through the new internal op `caseapproval` (R32's map);
  - at the pre-flight after C-58.5 and before NO_ATTESTING_KEY, byte-identical to the act's refusal;
  - at the scheduled publisher after the plan's refusals, as a `SCHEDULED_CHECK_REFUSED` stop with that cause.

  Approvals are matched at the document's approval digest (`case-grammar.approvalSubjectSha`). An approver who has not approved is named in `missing`; an approval that is held but not carried in the document's own `approvals:` block (`case-grammar.approvalsOf`) is named in `not_carried`. Approvals that cannot be read refuse the act (fail closed), make the pre-flight PREFLIGHT_UNDETERMINED, and stop R42 as UNREADABLE. With no rule in force, nothing is asked.
- **R50:**
  - `registerApprovalReader({rule(), approvals({case, edition, docSha})})`, once; a second registration is refused `APPROVAL_READER_DECLARED`, a malformed one `MALFORMED`.
  - (K2533) `approvalsInForce({case, edition, docSha})`, with `docSha` read as the approval digest, answers `{ok: true, rule, approvals, missing}` (with no rule: `rule: null`, nothing missing), or `{ok: false, reason: "APPROVALS_UNREADABLE"}`.
  - `checked.approvals` is canonical `{rule, approvals}`. A waiting edition whose `checked` has no `approvals` part is read as no rule. A difference stops `SCHEDULED_CHECK_REFUSED` with `cause.code` `APPROVALS_CHANGED`, naming what changed.
- **Tests re-pointed:** `schedule.test.mjs` uses a publish-schedule stand-in in place of publication's; `scheduled-commit.test.mjs` uses the real publish-schedule on the world's clock (the fixture creates it with `now: () => NOW`). New `approvals.test.mjs` has 13 tests (R49, R50, each with a negative control). The tests that list exact ops, relays, rows and parts are updated: `caseratify-op`, `relays` (nine relays), `retire` R32, `checks` R14, `schedule` R41.

**Final `uses`:** unchanged; `publish-schedule` is already listed.

**Reading set (mechanics §17).** Measured at about 700 KB (code 250 KB, tests 404 KB, requirements 50 KB), over 300 KB.
- **Read whole myself:**
  - my requirements;
  - `publish-schedule.md`;
  - the extraction map's §1–§6;
  - publication R22, R33, R57, R77;
  - case-grammar R26 (and `account.mjs` 170–230 on its job branch);
  - review R30–R33;
  - plan entries T41-34 to T41-44a;
  - `index.mjs`, `schedule.mjs`, `ops.mjs`, `fixture.mjs`, `schedule.test.mjs`, `scheduled-commit.test.mjs`.
- **Read by a worker, whole:** `release.mjs`, `retire.mjs`, `checks.mjs`, `refusals.mjs` and the 14 other test files. Its summary is about 245 lines, each statement citing file:line. It named the exact-list tests (`checks.test`:54–81, `retire.test`:290, `relays.test`:79–88) and the `publication: {}` worlds, all of which mattered and were handled. Nothing it left out mattered.

**Deferred:** none.

**Found in other modules:** none new. The two case-authoring R14 reds seen with case-grammar's job branch merged come from case-grammar's `marked: true` on `obscured`, not from this module.

**Tests** (`node --test test/m/ratification/*.test.mjs` from `bio-plane/`, with `origin/job/T41/case-grammar` merged temporarily and the merge aborted, since R49 imports its `approvalSubjectSha` and `approvalsOf`): **232 pass, 1 fail.**
- The red, by name: `scheduled-commit.test.mjs`:102, "R42 (T39, T40; N811, DEC-187 (4)) …". It is red until T41-36 merges, because publication's C-122.6 still answers its old translation.
- On my branch alone, the suite cannot load until case-grammar (T41-34) merges: the imports name its R26 functions.
- Earlier, over today's publication through a local, uncommitted stand-in of publish-schedule: 230 pass and that 1 fail.

**Users' suites** (case-authoring, actions, affordances, answer-envelope, op-declarations, plane, compared by test name with `tranche/T41`): no new red. `publish-schedule`: 19 pass, 2 fail (its two named reds, unchanged).

**Checks:** format 0 failures; architecture `ratification` 0 failures (28 product files, 148 relative imports); coverage 49 of 49 live ids, 0 failures; ownership 0 failures (14 files against `tranche/T41`).

**Re-run on B5 (K2543), on `tranche/T41` @ e2f3e4b7f7 merged (publication T41-36 and case-grammar in):** `ratification` 233 pass, 0 fail; the C-122.6 by-key test is green. Users' suites compared by test name with the tranche tip: case-authoring, affordances, answer-envelope, op-declarations, plane and publish-schedule show no new red. One new red in `actions`: `t34.test.mjs`:219, "R69 against ratification R45". Its stub at :204 is `publication.scheduleEdition`, which this module no longer calls, so the real publish-schedule answers `PUBLISH_AT_NO_ZONE`. This is the plan's T41-47 re-point (rule 4 (13), the extraction map's §6 "actions `t34.test.mjs` 204"); it is red from my merge until T41-47. Checks: format, architecture, coverage (49 of 49) and ownership (14 files), each 0 failures.

Size (session_01CSGGVWaWqeBwcqwfvQ31vc): test runs about 30, module lines 3,735

## J1 · QUESTION

Readings I am building on (T41-39); answer only where you read otherwise.

1. **R49 at `op=caseratify`/`op=publishat` (Worker half).** CASE_RATIFY_STALE is checked in the Worker (`ops.mjs`), and the approval reader R50 registers lives on the store half, so the check needs a store hop between CASE_RATIFY_STALE and NO_SIGNERS. Reading: a new internal op `caseapproval` in R32's map (body `caseId`, `edition`, `docSha`; answers `{ok: true, refusal}`, `refusal` null or the APPROVAL_MISSING refusal), as `casetestimony` is; a silence refuses (nothing written). R32's list then names it: wording yours.
2. **R49 placement elsewhere.** Pre-flight (R18): after C-58.5 and before NO_ATTESTING_KEY (the pre-flight's analogue of NO_SIGNERS; it has no CASE_RATIFY_STALE), over the text's own sha (publication's `shaOf`). Scheduled publisher (R42): after the plan's refusals (where CASE_RATIFY_STALE stops), a `SCHEDULED_CHECK_REFUSED` stop with `cause` APPROVAL_MISSING. R3's commit (`ratifyCaseDocument`) does not ask it (R3's list does not name it).
3. **R50's reader shapes** (review R30–R32 do not state them): `rule()` answers null (no rule) or `{approvers: [member ids]}` (a bare array also read); `approvals({case, edition, docSha})` a list of `{by, at}` (or `{approvals: [...]}`). Missing = approvers with no approval `by` them (`member:` prefix ignored). A reader that throws or answers neither shape is read as unreadable: the act refuses APPROVAL_MISSING naming that the approvals could not be read (fail closed, never signed unchecked), the pre-flight answers PREFLIGHT_UNDETERMINED (its existing rule), R42 stops UNREADABLE. A second registration is refused `APPROVAL_READER_DECLARED`, a malformed one `MALFORMED` (R45's pattern).
4. **C-58.11 `APPROVAL_MISSING`**, BOB's draft translation (UX may re-word): "This case edition can't be signed yet: the group requires named members to approve a case before it is signed, and some of them have not approved this version of it. They are named. Ask them to approve it, then sign. Nothing was signed." Row awaiting T42's stamp (rule 4 (2)).
5. **R50's `checked.approvals`**: canonical JSON `{rule, approvals}` (approvals sorted by `by`); with no reader `{rule: null, approvals: []}`. A waiting edition whose `checked` has no `approvals` part (signed before this change) compares as the no-rule reading, so editions already waiting are not all stopped by the deploy. A difference stops it `SCHEDULED_CHECK_REFUSED` with `cause` `{code: "APPROVALS_CHANGED", changed}` (no row: the stop's own row is C-58.10); a missing approval at the time is the APPROVAL_MISSING stop of item 2 as well.
6. **publish-schedule not yet built.** I import `publishScheduleOf` from `../publish-schedule/index.mjs` and reach it lazily (`deps.publishSchedule` or `publishScheduleOf(host, {record, membership, publication})`); my tests pass a stand-in where they used publication's. Until T41-37 merges (and I merge the tranche), the module cannot load on my branch, so my full runs wait on your CHANGE after T41-37 and T41-36 merge.

## J2 · COMPLETE

T41-39 complete (B2–B4 applied: digest and carried arms, approvalsInForce, the real publish-schedule). Completion in this record: 232 pass, 1 red by name (scheduled-commit.test.mjs:102, C-122.6 by key, until T41-36 merges); run with case-grammar's job branch merged temporarily, since R49 imports its approvalSubjectSha and approvalsOf (my branch loads once T41-34 merges). Users' suites: no new red. Checks 0 failures. Uses unchanged. 3,735 lines.

## J3 · COMPLETE

Re B5 (K2543): merged tranche/T41 @ e2f3e4b7f7. ratification 233 pass, 0 fail (the C-122.6 by-key test now green). Users' suites unchanged against the tip except actions t34.test.mjs:219 (R69 against R45): its :204 stub of publication.scheduleEdition is no longer called, so it is red from my merge until T41-47 (plan rule 4 (13), map §6). Checks 0 failures. Record updated.
