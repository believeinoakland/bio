# T50's 43 reds, mapped for T51 (K3803)

Source: `build/plan/audit-T50-close.md` (run on `359f60ed99`), K3795, K3797, K3803, `draft-T51-plan.md` rule 5 and the entries named. Re-run on the current branch (tranche/T50 @ f17c6f533e) for 18 of the 19 red modules with `node --test`.

## Summary

**Count.** 43 at the audit; 42 are red today. The one that went green is store-door `routes.test.mjs` R15, cleared by K3797's merge of T50-50 (48/48 re-run here). Every other audited module that could run here re-ran with the same failures. Not reproducible in this checkout (no `node_modules`; the audit's worktree symlinked them): agent-runner (all 8 files fail to load `@modelcontextprotocol/sdk`) and journey-check (`playwright-core` missing); their rows rest on the audit. test-support R2 passed here (42/42, as uid 0), so it is environment-dependent, as the audit said.

**By fix kind (43 rows, store-door's counted as cleared):**

| fix kind | tests | modules |
|---|---|---|
| Test only (stale assertion; no code change) | 10 | agent-runner 1, capture-requests 1, membership 1, hypotheses 1, case-authoring 2, action-holds 2, escalation 1 (R30), test-support 1 |
| Code: copy "group" to "team" / read by key, with its test | 14 | duties 1, case-carriage 1, case-import 1, case-inputs 2, consequences 2, escalation 2, action-producers 3; plus case-disclosures 2 clearing with case-carriage (no change of their own) |
| Goes with legacy-ui's deletion (T51-91) | 8 | legacy-ui 8 |
| Row-census stamp | 1 | promotion 1 |
| journey-check (no T51 entry): "group" on pages | 1 | R17 page scan |
| journey-check: assistant-dependent (K3717) | 6 | R9, R10, R11, R11 control, R15, R16/R18 |
| journey-check: both causes | 2 | R1 (a), R13 |
| Already cleared | 1 | store-door R15 |

(Rows: 10 + 14 + 8 + 1 + 9 + 1 = 43. The 14 includes case-disclosures' 2, which clear through case-carriage's code.)

**By module (reds at audit):** legacy-ui 8; journey-check 9; action-producers 3; escalation 3; case-authoring 2; case-inputs 2; consequences 2; action-holds 2; case-disclosures 2; promotion, test-support, store-door (cleared), agent-runner, capture-requests, membership, duties, hypotheses, case-carriage, case-import 1 each.

**By model:** haiku for every test-only and wording row (all draft entries already haiku; test-support R2 needs a new haiku entry); sonnet for legacy-ui (T51-91), promotion (T51-13) and journey-check (no entry yet; row 43 splits between T51-95 sonnet and T51-10 haiku).

**Needing a new T51 entry (NONE):** journey-check (9 tests; re-scope), test-support R2 (1 test). store-door needs none.

**Depends on legacy-ui:** the 8 civicos-ui tests (K3803: ripped out and reimplemented; T51-91 deletes them, nothing repaired).

**Depends on the assistant (K3717, excluded from work):** journey-check R9, R10, R11, R11 control, R15, R16/R18, and part of R1 (a) and R13 (the subscription sign-in has no route; journey 29's pairs 9, 10, 11, 16; fake model/SEGMENTS). They cannot go green without assistant work. Recommended re-scope (BOB's decision): tests of the declared not-ready state, i.e. the walk reports those steps "not walked" (R18/K3747 already says an assistant-marked step is "reported as not walked, never failed") rather than failed; the group-wording parts clear with T51-95 and T51-10. agent-runner R12 is adjacent (the runner's binding) but is a test-only fix with no assistant work (T51-100).

**Depends on "group" to "team" wording:** duties, case-carriage, case-disclosures (x2), case-inputs R17, consequences, escalation R33/R31, action-producers, hypotheses R11, membership R12/R57 (keyed read), case-import (keys), journey-check R17 page scan (and "group" parts of R1 (a), R13: instance-setup T51-95, file-scanner T51-10).

## Table

Test paths are under `bio-plane/test/m/<module>/` unless a full path is given. "T" = test only; "C" = code (module's copy/read) plus its test.

| # | module | test file:line | req | cause | fix | draft T51 entry | model |
|---|---|---|---|---|---|---|---|
| 1 | legacy-ui | civicos-ui/test/group-identity-surface.test.mjs | N794 | `{role}` sign-in, environment-independent | delete with civicos-ui | T51-91 | sonnet |
| 2 | legacy-ui | civicos-ui/test/group-surface.test.mjs | N794 | same | delete with civicos-ui | T51-91 | sonnet |
| 3 | legacy-ui | civicos-ui/test/meaning-arms.test.mjs | N865 | same | delete with civicos-ui | T51-91 | sonnet |
| 4 | legacy-ui | civicos-ui/test/progression-revision.test.mjs | N865 | same | delete with civicos-ui | T51-91 | sonnet |
| 5 | legacy-ui | civicos-ui/test/queue-recipients.test.mjs | N1057 | same | delete with civicos-ui | T51-91 | sonnet |
| 6 | legacy-ui | civicos-ui/test/review-copy.test.mjs | N1057 | same | delete with civicos-ui | T51-91 | sonnet |
| 7 | legacy-ui | civicos-ui/test/several-cases-choice.test.mjs | N865 | same | delete with civicos-ui | T51-91 | sonnet |
| 8 | legacy-ui | civicos-ui/test/statement-ack.test.mjs | N794 | same | delete with civicos-ui | T51-91 | sonnet |
| 9 | promotion | bio-plane/test/system/row-census.test.mjs (file) | rule 5 (2) | rows T50's L3+ jobs added/changed await the stamp | C: stamp (BOB-listed rows) | T51-13 | sonnet |
| 10 | test-support | test-support.test.mjs:249 "R2 a tree a test left read-only is removed" | R2, K3192 E | run as root under a 0700 directory; passes in this checkout as uid 0, so environment-dependent | T: make the test independent of uid/directory mode, or skip with a stated reason when root cannot be refused | NONE (rule 5.6 calls it environment only) | haiku |
| 11 | store-door | routes.test.mjs:343 R15 `reauthdue` | R15, N1134 | CLEARED: T50-50 merged by K3797 (48/48 here) | none | none needed | n/a |
| 12 | case-authoring | standards.test.mjs:96 R61 (STANDARDS_USE_REFUSED) | R61, N1221 | departures now carry `says: {key, vars}`; test expects old text | T: read `says` through `word` | T51-73 | haiku |
| 13 | case-authoring | standards.test.mjs:140 R61 (COPYRIGHTED_*) | R61, N1221 | same | T: same | T51-73 | haiku |
| 14 | case-inputs | openrequests.test.mjs:150 R17 | R17, N1224 | `signing.openrequest.unread` says "group's"; words.json "team" | C: read by key | T51-72 | haiku |
| 15 | case-inputs | t46-words.test.mjs:45 R10, R12 | R10, R12, N1224 | table words differ from words.json `refusal.<CODE>` | C: table by key | T51-72 | haiku |
| 16 | consequences | t46.test.mjs:70 R25 (seventeen rows) | R25, N1225 | refusal sentences say "group", words.json "team" | C: read by key | T51-75 | haiku |
| 17 | consequences | t46.test.mjs:115 R25 (each re-worded refusal) | R25, N1225 | same | C: same | T51-75 | haiku |
| 18 | escalation | stopped.test.mjs:95 R31 R33 (escalationReopen) | R31, R33, N1225 | refusal words not yet words.json's verbatim | C: ESCALATION_WORDS by key | T51-79 | haiku |
| 19 | escalation | stopped.test.mjs:194 R33 (two rows, C-116.47..) | R33, N1225 | same | C: same | T51-79 | haiku |
| 20 | escalation | structure.test.mjs:265 R30 (timeline lanes) | R30, N1208 | test pins old lane labels; keys are `screen.timeline.lane.ours/.world` | T: assert by key (`hasWord`) | T51-79 | haiku |
| 21 | action-producers | t46.test.mjs:177 R23 | R23, N1225 | held sentences not words.json's en verbatim | C: by key | T51-85 | haiku |
| 22 | action-producers | t47.test.mjs:35 R24 (clock overdue "ours") | R24, N1225 | "group's own date" vs key `queue.action-clock-overdue.ours.detail` | C: by key | T51-85 | haiku |
| 23 | action-producers | t47.test.mjs:71 R24 (plan review due) | R24, N1225 | same, `queue.plan-review-due.detail` | C: by key | T51-85 | haiku |
| 24 | action-holds | hidden.test.mjs:45 R2 | R2, N1227 | refusal now `NO_SUCH_ACTION`, test expects `NO_SUCH_BUNDLE` | T: follow actions R106 | T51-76 | haiku |
| 25 | action-holds | readers.test.mjs:36 R4 | R4, N1227 | same | T: same | T51-76 | haiku |
| 26 | agent-runner | agent-runner/test/worker.test.mjs:27 R12 | R12, agent-worker R109 | asserts `RUNNER` binding in agent-worker's wrangler.jsonc (lines 35-38); R109 removed it. Not re-run here (deps missing) | T: drop the assertion or assert absence (no assistant work) | T51-100 | haiku |
| 27 | capture-requests | plane.test.mjs:285 R48 (T50) | R48, control-plane R105 | fixture question `INQ-2026-9000-cr` not visible to RUTH; door answers `BAD_FOR` | T: build the question in the world; ghost arm expects the refusal | T51-99 | haiku |
| 28 | membership | t19-enrol-boot.test.mjs:133 R12 R57 | R12, R57, N1243 | test matches English `/has NOT been renamed/`; sentence is key `membership.says.member_enrolled_under` | T: assert the key | T51-98 | haiku |
| 29 | duties | t48-reasons.test.mjs:46 R33 | R33, N1244 | `src/duties/checks.mjs:31` "Your group's Civicsmith" vs "team" | C: read by key / "team" | T51-37 | haiku |
| 30 | hypotheses | notes.test.mjs:43 R11 | R11, N1244 | test pins membership R108's English with "group"; module answers the "team" sentence (correct) | T: read sentence by key | T51-46 | haiku |
| 31 | case-carriage | marks.test.mjs:271 R11 (T40) | R11, N1244 | `src/case-carriage/checks.mjs:28-34` three labels say "group holds the original"; words.json "team" | C: labels by key | T51-60 | haiku |
| 32 | case-disclosures | documents.test.mjs:43 R22 | R22, N1244 | cleaned copy's label comes from case-carriage ("group") | none of its own; clears with row 31 | T51-60 (carries it); T51-70 is a sweep | haiku |
| 33 | case-disclosures | photos.test.mjs:47 R22 | R22, N1244 | same | none of its own; clears with row 31 | T51-60 | haiku |
| 34 | case-import | words.test.mjs:18 R14 R4 R19 R21 | R14, R4, R19, R21, N1223 | declared `words-reads.json` lists `caseimport.stake.unreadable`, `refusal.IMPORT_NOT_A_CASE_FILE.{manifest,noparts,notbytes}` the module keeps inline | C: read those keys | T51-69 | haiku |
| 35 | journey-check | journey.test.mjs:101 R1 (a) | R1, K3795 | walk's 37 step failures: "group" on installer/site pages and `/app/security`, plus assistant steps (4, 9-11) | "group": instance-setup and file-scanner entries; assistant part: re-scope (see below) | T51-95, T51-10 (words); assistant part NONE | sonnet |
| 36 | journey-check | journey.test.mjs:110 R9 | R9, K3718 (2) | step 4 (subscription sign-in) has no route (`subscriptionsignin`) | assistant: re-scope as declared not-ready state, or leave excluded (BOB) | NONE | sonnet |
| 37 | journey-check | journey.test.mjs:118 R10 | R10, K3718 (2) | member's own-subscription run; same | assistant, as 36 | NONE | sonnet |
| 38 | journey-check | journey.test.mjs:126 R11 | R11, K3718 (2) | binds agent-worker/fake model; walks R9 | assistant, as 36 | NONE | sonnet |
| 39 | journey-check | journey.test.mjs:132 R11 control | R11 | step 9 by name; depends on R9's steps | assistant, as 36 | NONE | sonnet |
| 40 | journey-check | journey.test.mjs:153 R13 | R13, K3783 (3) | journey 29 pairs 9, 10, 11, 16 missing (14 of 18) | assistant pairs: re-scope as not walked (R18, K3747) | NONE | sonnet |
| 41 | journey-check | journey.test.mjs:159 R15 | R15, K3718 (2) | needs agent-worker SEGMENTS run step | assistant, as 36 | NONE | sonnet |
| 42 | journey-check | journey.test.mjs:178 R16/R18 | R16, R18, K3783 (3) | walk's 18 steps incl. assistant steps | assistant, as 36 | NONE | sonnet |
| 43 | journey-check | group.test.mjs:67 R17 page scan | R17, N1238, N1241 | pages say "group": `setup-fleet.mjs` HOSTING_CONTROL (instance-setup) and file-scanner's catalogue | code in those two modules; journey-check test unchanged | T51-95 (N1238), T51-10 (N1241) | sonnet / haiku |

## Notes

- Rows 35 and 40: whether they fully clear after T51-95 and T51-10 depends on the assistant steps; they cannot go green without a re-scope of the assistant steps. Row 43 clears from the two named entries alone.
- journey-check has no T51 entry at all; the draft's rule 5.5 sends such reds to the module's T51 job, so a journey-check job (sonnet) must be added for rows 35-42 (BOB's decision on the assistant re-scope).
- test-support R2 (row 10) has no T51 entry; rule 5.6 accepts it as environment. K3803 says all 43 are fixed, so it needs a small haiku job.
- The sweeps (T51-1.. etc.) are not needed for these rows.
