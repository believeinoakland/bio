# project-roster (T41)

**Status** · session_01EMvdfBAQoP23gwygdrcexb · depth 2 · COMPLETE · handled B3

## Work (kept current; not a mailbox entry)

Read whole (reading set measured at START 207 KB, under 300 KB, read whole): `roles/JOB.md`; `build/requirements/project-roster.md`; membership's Terms and R18, R43, R44, R60, R75, R77, R80, R84, R88, R120 and its sight code (`viewerPredicate`, `hiddenBundles`, `noSuchProject`, `inSight`, `sight`, `existenceAct`, `rescueRefusal`); record-core's and record-grammar's uses as before; layer 2's contract; this module's code and tests; plan T41-4; K2408, K2409, K2435; `draft-T41-investigation.md` §3.5.

Applied (T41-4): R5 reachable at an administrator's `EXISTENCE` of a hidden project (`#rescueAtExistence`: `EXISTENCE` asked of membership's `sight` on a hidden project; every answer there names only the id, the owners and the member named); R1 and R14 narrowed to an administrator at `FULL` (`#adminAtFull`, membership's `inSight` for `member:<by>`; also fixes R1 answering an administrator `ok` for an id naming nothing); R10 at an administrator's `EXISTENCE` of a hidden project answers C-70.1 (J1's reading, ruled K2437 in B2). Tests re-stated for an administrator neither invited nor joined, each with a negative control: `visibility-directory`, `requests`, `figures-purge`, and also `roster`, `ownership` (they assumed the same `FULL` sight); new R5 (D54) test.

Verified against a local stand-in for membership's D54 (scratch only, never committed): 31 pass; with this module's change reverted, 9 fail. On today's membership 12 fail, all D54 assertions: they wait on T41-3's merge.

R10 as met (K2437, for BOB to fold at the merge): "At an administrator's `EXISTENCE` of a hidden project (one it is neither invited nor joined to, `membership` R44), `projectRequest` answers `membership`'s `PROJECT_SEEN_NOT_A_PARTICIPANT` (C-70.1, with the owners R77 adds) and writes nothing: a request to join is asked only at a discoverable project's `EXISTENCE`; its owners add an administrator by inviting them."

## Completion

Entries applied: T41-4 (N822, D54; K2408, K2409, K2435), with R10's reading ruled K2437 (B2). Merged `tranche/T41` after membership (B3, K2442) at 1250436679.

Deferred: none.

Found in other modules: none of this job's making. The users' suites (answer-envelope, plane, `test/system/migrate-released`) show 4 reds (answer-envelope's two R7/R2 catalogue tests, plane's two R12 bias-debt tests), identical on `tranche/T41` without this branch (180 pass, 4 fail there too): not this job's.

B3's D54 reds, each re-stated and green: `figures-purge` :63 and :107 (the VIEWERS table: the founder in both spellings and an administrator not in either hidden project now count 0, with a discoverable and an invited negative control); `ownership` :24 (an administrator at hidden P's EXISTENCE answered C-70.1), :113 and :145 (the rescue reachable at an administrator's EXISTENCE, unchanged tests now green through the module change), :178 (R6's administrator readers at FULL only, after P is discoverable), :230 (the administrator test split into hidden P at EXISTENCE and discoverable P at FULL); `requests` :24 (R10 at an administrator's EXISTENCE of hidden H: C-70.1 with its owners, K2437).

Tests and checks:
- `node --test bio-plane/test/m/project-roster/`: tests 31, pass 31, fail 0 (on `tranche/T41` merged).
- users' suites: tests 184, pass 180, fail 4 (the same 4 on `tranche/T41` alone).
- `checks/format.mjs`: 145 modules, 144 requirements files; 0 failures.
- `checks/architecture.mjs project-roster`: 11 product files, 32 relative imports; 0 failures.
- `checks/coverage.mjs project-roster`: 20 of 20 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs project-roster tranche/T41`: 7 files changed; 0 failures.

Size (session_01EMvdfBAQoP23gwygdrcexb): test runs 8, module lines 895

## J1 · QUESTION

R10 (`projectRequest`) under D54. Once membership R44 gives an administrator (the founder included) `EXISTENCE` of a hidden project they are neither invited nor joined to, R10 read literally would let that administrator ask to join the hidden project: R10 refuses only `NONE` (absent) and `FULL` (`PROJECT_REQUEST_NOT_OUTSIDE`), and writes at `EXISTENCE`. Today the founder and administrators are refused `PROJECT_REQUEST_NOT_OUTSIDE` there (test `requests` R10).

My best reading, which I am building: the request to join stays open only at a DISCOVERABLE project's `EXISTENCE` (Membership §7.14, "a member outside a discoverable project asks"; R16 keeps a hidden project free of open requests; the founder has no handle, so an owner could never answer the founder's request under R12). At an administrator's `EXISTENCE` of a hidden project, `projectRequest` answers membership's `PROJECT_SEEN_NOT_A_PARTICIPANT` (C-70.1, through `existenceAct`, with the owners R77 adds), the Terms' default for a caller at `EXISTENCE`; nothing is written. The owners add an administrator by inviting them (D54: "its contents only if its owners add them").

The alternative: R10 literal (the administrator's request is written, and the owners grant or decline it). If you rule that, R10's text should also say how the founder's request is answered (no handle). Not blocking: I carry on with the reading above.

## J2 · REPORT

Built and pushed (1767f4ff69 and the record after it): R5 reachable at an administrator's EXISTENCE of a hidden project, R1 and R14 at FULL, R10 per K2437; tests visibility-directory, requests, figures-purge (and roster, ownership, which assumed the same FULL sight) re-stated for an administrator neither invited nor joined, each with a negative control, plus a new R5 (D54) test. Checks format, architecture, coverage (20 of 20), ownership: 0 failures. Against a local stand-in for membership's D54 (never committed) the suite is 31 pass; on today's membership 12 fail, all D54 assertions, waiting on T41-3. Tell me when membership is merged: I merge tranche/T41, run the tests against it and record COMPLETE.
