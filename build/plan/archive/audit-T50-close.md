# T50 reds at the close (K2704)

Run: `node .github/scripts/module-tests.mjs` over `origin/tranche/T50` @ `359f60ed99` (K3796: "L11 closed; 29 sessions archived with their rows"), in a separate worktree with node_modules symlinked from /home/user/bio (bio-plane, bio-plane/src/journey-check, agent-runner, sheet-worker, site, pdf-worker, ocr-worker, newgroup, file-scanner), 2026-10-17/18. Log: `/tmp/claude-0/t50-module-tests.log`. The main tree was not touched.

**Totals:** 171 modules, 152 green, 19 red; 14618 passing, 43 failing tests (a `system/` file and a legacy-ui file count as one each). 34 failing tests are accepted by name; 9 are not (8 modules, 5 causes).

Green that were red at T49's close: admission, screens-entry, affordances, answer-envelope, scheduler, instance-setup, screens-daily, screens-wizards, filing-templates, plane, bundler (fleetbundles), ai-accounts, local-facts, standards, reading-guides, case-account, action-grammar, action-replies, filings, action-plans, agent-worker (R111 unbuilt but its tests green), installer, screens-settings, agent-harness, site. Not run to red: coverage (K3718 (2) ids) belongs to `checks/run.mjs`, not this script.

## Reds accepted by name

| module | test | ruling |
|---|---|---|
| test-support | R2 read-only tree removed (run as root; environment) | rule 5 (15), K3192 E |
| promotion | `system/row-census` (rows awaiting stamp) | rule 5 (2), T50-6 stamp |
| store-door | routes R15 `reauthdue` (sign-in without the founder's handle: SIGN_IN_REFUSED) | rule 5 (10), N1134, until T50-50. **Note:** T50-50 (STORE-DOOR #9 J2) is not in the tree: `routes.test.mjs` last changed at T48-66 |
| legacy-ui | civicos-ui x8: group-identity-surface, group-surface, meaning-arms, progression-revision, queue-recipients, review-copy, several-cases-choice, statement-ack (environment-independent, `{role}` sign-in) | rule 5 (3), N794, N865, N1057 |
| case-authoring | `standards.test.mjs` R61 x2 (departures now carry `says`) | N1221 |
| case-inputs | R17 (`signing.openrequest.unread` "group's"); R10, R12 (table words) | N1224 |
| consequences | R25 x2 (refusal words by key, "team") | N1225 |
| escalation | R30, R31 R33, R33 (words/lane labels) | N1225 (and N1208) |
| action-producers | R23, R24 x2 | N1225 |
| action-holds | R2, R4 (`NO_SUCH_BUNDLE` now `NO_SUCH_ACTION`) | N1227 |
| journey-check | R1 (a), R9, R10, R11, R11 control, R13, R15, R16/R18, R17 page scan (9 of 72) | K3795 (with K3718 (2), K3783 (3), N1238, N1241) |

Not red this run, though named by K3718 (2): agent-runner R36-R38, R40; agent-worker R111; agent-harness R17; screens-settings R41, R53; installer R56, R58; journey-check R19 (unbuilt, so they show as coverage, not as failing tests).

## NOT accepted

| # | module | test | likely cause | owner / smallest fix |
|---|---|---|---|---|
| 1 | agent-runner | `worker.test.mjs` R12 "Worker exports the Container Durable Object class AgentRunner..." | The test reads `agent-worker/wrangler.jsonc` and asserts a `RUNNER` durable-object binding. agent-worker R109 (T50, K3693) removed it ("the local container's binding (`RUNNER`) is not declared here"); only `REMOTE`, `SEGMENTS`, `CHECKS` remain. `find` returns undefined. | agent-runner, test only: drop the RUNNER assertion (or assert its absence, R109). Not covered by K3718 (2) (R36-R38, R40 only). |
| 2 | capture-requests | `plane.test.mjs` R48 "in the plane (T50)" | The plane door now judges a member's `acquire` `for` for sight before any fetch (control-plane R105, N1117, K3627): a `for` naming a question RUTH cannot see answers `BAD_FOR` (C-139.21). The test's fixture `INQ-2026-9000-cr` is not a visible question in its world, and its ghost arm expects an unseen `for` to be accepted and shown with `withheld`. | capture-requests (test/fixture) with control-plane R105: build the question in the world, and change the ghost arm to R105's refusal. Test-only. |
| 3 | membership | `t19-enrol-boot.test.mjs` R12 R57 | Test matches `/has NOT been renamed/`; the sentence is now read by key (`membership.says.member_enrolled_under`, words.json: "has not been renamed"). Test compares English (rule 6 says such tests go). | membership, test only: `hasWord`/key read instead of the regex. |
| 4 | duties | `t48-reasons.test.mjs` R33 `duty.reason.deadline_not_held` | `src/duties/checks.mjs:31` still says "Your group's Civicsmith"; words.json says "team" (N1160, K3472). K3350 requires the module's copy to be words.json's `en` verbatim. | duties: change the copy to "team" (or read by key). No T50 job for duties. |
| 5 | hypotheses | `notes.test.mjs` R11 (court-notice `courtStatement`) | Test pins membership R108's English with "group"; the module answers the "team" sentence from words.json (correct per N1160). | hypotheses, test only: read the sentence by key. |
| 6 | case-carriage | `marks.test.mjs` R11 (T40) OBSCURED_LABEL/PUBLISHED_LABEL | `src/case-carriage/checks.mjs:28-34` holds "the group holds the original" (3 labels); words.json `photo.obscured.label` etc. say "team". | case-carriage: copy to "team" (N1160). |
| 7 | case-disclosures | `documents.test.mjs` R22 (cleaned copy's label); `photos.test.mjs` R22 (label is case-carriage's) | Same cause as 6: the labels come from case-carriage's copy ("group") and the tests expect words.json's "team". Clears when case-carriage is fixed. | case-carriage (code); case-disclosures needs nothing. |
| 8 | case-import | `words.test.mjs` R14 R4 R19 R21 "module's keys are the owner's declared list" | The declared list (`words-reads.json` for case-import) holds keys the module does not read: `caseimport.stake.unreadable`, `refusal.IMPORT_NOT_A_CASE_FILE.{manifest,noparts,notbytes}`. The module keeps those sentences inline (N1223, DEC-327 keys now exist). N1223 says the sentences are kept inline until its next job, but does not name this test as red. | case-import (T51 per N1223): read the keys. Or BOB accepts it by name under N1223. |

Note on 6 and 7: the three tests share one cause; with 4 and 8 they are the "group" to "team" and lagging-copy family (K3350, N1160). Items 1, 2, 3, 5 are test-only.
