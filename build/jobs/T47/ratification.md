# ratification (T47)

**Status** · session_01MuiXmnj9JeUNyQYyGSoQVj · depth 2 · COMPLETE · handled B2

## Record

**How the reading set was read** (mechanics §17; START: 1547 KB, over the limit). Read whole by me: `roles/JOB.md`; `build/manifest.md`; `build/requirements/ratification.md`; the plan's entry T47-72; my module's source whole (`ops.mjs`, `index.mjs`, `schedule.mjs`; the new `finding.mjs`), and the tests I changed or wrote whole (`fixture.mjs`, `release.test.mjs`, `retire.test.mjs`, `sitting.test.mjs`), plus `converted-d.test.mjs`' worlds and `scheduled-commit.test.mjs`' set-time world; of used modules, the parts R52 calls (publish-schedule's Public part, its `scheduled_editions` schema; record-core `transact`; retrieval `readImage`; publication `caseEditionState`'s answer; bias `withBiasChecks`; plane `ratificationWorker`). By a helper in my session, read whole and digested with citations (K2032): the other 17 test files of `test/m/ratification/` and `refusals.mjs`, `checks.mjs`, `release.mjs`, `retire.mjs` (P20). The sources stay binding.

**Entries applied (T47-72):**
- **R51** (N988; amends R32) `ratificationOps`' `release` and `retire` arms read `handle`, `acknowledgment`, `mitigation` and `reason` from the internal request's body when it states them as strings, else the query (`act(k)` in `index.mjs`); `viewer`, `owner` and `author` stay the query's only. Tests: `release.test.mjs` and `retire.test.mjs` "R51 …" (body and query answer alike; a body's stamps change nothing; the body's own empty field is the one read; a non-string body field falls back to the query). R32's retire op test re-worded: the body's stamps are not read (it said the body was not read at all, which R51 retires).
- **R52** (K3080, DEC-208 (1); my J1 readings, all confirmed by B2, K3109). `op=caseratify` and `op=publishat` take `members: [{id, sha, signature}]` (any other shape, or an id twice, `MALFORMED` before anything is read). After the case's own checks, each member is verified as R4 verifies it (`prepareFinding`, the same code `op=ratify` now runs): sight, C-58.1, C-53.10/.11, C-92.12 (counting the statements of the document signed in the sitting), RATIFY_STALE, NO_SIGNERS, the signature against the one key the case verified against, the whole gate. A refusal names `member` and writes nothing. `op=caseratify`: one store hop commits the case and then each member through R5's `publish`, in one transaction (a member's commit refusal, e.g. C-58.3, rolls the case back, named); then each member is copied and re-fetched as R6 does, and the complete editions assembled once; the answer carries `sitting: [...]`, each member's `op=ratify` answer (not `members`, which is already the roster's). `op=publishat`: the members' commits are made and rolled back with the case's in the probe; their signatures are held in `checked.members` (not a compared part); R42 checks each again at `now` (bias's arm excepted, as J1 (5) states) and commits them after the case in its transaction, or stops the edition with `SCHEDULED_CHECK_REFUSED`, `cause.member` naming it. Without `members` both act as before. Tests: `sitting.test.mjs` (the 1 + 2 + 5 sitting and its retry; one bad signature, a stranger's or another registered member's, commits nothing; R4's refusals naming the member; a commit refusal rolling back; MALFORMED shapes; C-92.12 in a sitting both ways; publishat held and published at its time; publishat refused at signing, and stopped at its time by a member that moved).
- Refactor for R52: `op=ratify`'s pre-commit reads and checks became `prepareFinding` (`ops.mjs`), and its pieces after the commit (`findingFactsRefusal`, `findingShas`, `findingPublishArgs`, `copyFinding`, `reuseCheck`, `casesToAssemble`, `findingAnswer`) moved with their comments to `finding.mjs`; `op=ratify`'s answers are unchanged (every earlier test passes unmodified).

Not-yet-met marks this job meets: **R51, R52**, each named by its tests above.

**Flaws in my own module (P8), fixed:** C-92.11 (`attributionStaleRefusal`) named no observation when the document stated one the edition no longer reaches; it now names that statement (test in `preflight.test.mjs`, "R18, R2 (C-92.11; T47-72)"). Stale headers: `refusals.mjs` (it also holds R49/R50's helpers), `release.mjs` and `retire.mjs` ("whole set or nothing": the examination is whole-set, the writes per member). Deferred, with why: `release.mjs` splices the handle into the state history unescaped; a handle reaches it only after `retrieval.selectionResolve` resolved it, so only minted handles get there (low risk; left as built). `refusals.mjs`' approval comparator never answers 0 (harmless for sorting).

**Other modules (also in a REPORT):**
- `screens-intake`: `test/m/screens-intake/held.test.mjs` (about lines 88–99) has a stand-in asserting "a release read from the body alone is refused (control)", which R51 retires; it passes only because it is a stand-in. `control-plane`'s `t46-e2e.test.mjs` already POSTs the release in the body and expects success.
- `screens-publish` (L11): to sign a sitting, it sends `members` with `op=caseratify` / `op=publishat` and reads the members' answers from `sitting`, not `members`.
- Generated artifacts: the plane bundle includes this module's source, so it is staled (regenerated at the layer's close).

**Tests and checks run** (on a66f099f24):
- `node --test bio-plane/test/m/ratification/`: tests 245, pass 245, fail 0.
- Users of this module (`case-authoring`, `review`, `action-holds`, `affordances`, `op-declarations`, `answer-envelope`, `plane` and `test/system/migrate-released.test.mjs`), with `publish-schedule`, `control-plane` and `screens-intake`: reds only in `case-authoring` (1), `affordances` (3), `op-declarations` (12), `answer-envelope` (1), `plane` (2). Every one is red on `tranche/T47` itself, run in a worktree the same way (rule 5's registry and op-map reds and others), none naming this module.
- `checks/format.mjs` 0 failures; `architecture.mjs ratification` 0 failures; `coverage.mjs ratification` 51 of 51 live ids named, 0 failures; `ownership.mjs ratification tranche/T47` 0 failures. `checks/run.mjs`: format 0, architecture 0 (3085 product files), coverage 43 failures, none `ratification` (other modules' ids), channels 0.

Size (session_01MuiXmnj9JeUNyQYyGSoQVj): test runs 14, module lines 3844

## J1 · QUESTION

R52: my best reading, on which I am building now (answer only where you read it otherwise).

1. **Shape.** `members: [{id, sha, signature}]`, each `id` and `sha` a non-empty string and `signature` an armored SSHSIG; any other shape is `MALFORMED` (asked with the payload's own MALFORMED, before anything is read). An empty list is "without members".
2. **"The same signer".** Each member's signature must verify over `ratifyStatement(id, sha)` against the one key the case signature verified against; any other key (even another active signer's) is that member's `SIG_<reason>`.
3. **"Verified as R4 verifies".** After the case's own checks pass (R2's, through `GATE_REFUSED`), each member in list order runs R4's checks that do not read the credential (the fences and the payload's MALFORMED are the case act's): sight (`ABSENT`), C-58.1, C-53.10/.11, C-92.12, `RATIFY_STALE` (`sha` must be the head), `NO_SIGNERS`, `SIG_<reason>`, `GATE_REFUSED` (R4's whole gate). The first refusal is answered with `member: id` added, nothing written. **C-92.12 within a sitting:** an observation the case document being signed reaches and states the level of (C-92.10 and C-92.11 having passed for it) is read as stated, since that document is the "ratified case document" committed in the same sitting; without that reading no sitting could carry an observation.
4. **"Committed after the case as R5 does", atomically.** The Worker sends the case commit and every member's prepared commit in one store hop; the store commits the case and then each member through R5's `publish` in one transaction, so a refusal of any member's commit (for example `EDITION_EXISTS`) rolls back the case too, and is answered naming the member, nothing written. After the commit, each member's bytes are copied and its reuse re-fetch made as `op=ratify` does (R6), and the case container assembled once. The answer gains `members: [{id, ok, edition, ...}]` with each member's `op=ratify` answer fields.
5. **publishat.** Members are verified at signing as in 3, and held with the waiting edition inside `checked` (`publish-schedule` R1 stores it whole) as `checked.members` (id, sha, signature): not one of R41's compared parts. R42 re-runs, at `now`, each member's checks of 3 but the credential's (the signature against signers active now and the same key as the case's; sha still the head; sight-free facts; the store-half gate with its register and case-member arms). Bias's C-26 arm is the control plane's (`withBiasChecks`, handed to the Worker) and is not reachable in the Durable Object; it reads only the image, whose bytes are unchanged when `sha` is still the head, so signing's verdict stands. Any member refusal stops the whole edition with one `SCHEDULED_CHECK_REFUSED` naming the member in its `cause`; otherwise the case and the members commit in one transaction (a member's refusal there stops it too), and copies follow as after R3's commit.

## J2 · REPORT

Two things for other modules, found in this job (details in my record):
- `screens-intake`: `test/m/screens-intake/held.test.mjs` (about lines 88–99) has a stand-in asserting "a release read from the body alone is refused (control)". R51 retires that: a release with its fields in the body is now answered as the same fields in the query. The test passes only because it is a stand-in; it states the old rule.
- `screens-publish` (L11): a sitting is sent as `members: [{id, sha, signature}]` with `op=caseratify` / `op=publishat`. The members' answers come back as `sitting: [...]`, each member's `op=ratify` answer, because `members` in the case answer is already the roster's.
Also: the plane bundle is staled by my source change (regenerated at the layer's close).

## J3 · COMPLETE

T47-72 is complete on `job/T47/ratification` (pushed). R51 and R52 are met, each named by its tests.
- **R51:** `release` and `retire` read their act's fields from the body, else the query; the stamps stay the query's. Tested both ways. R32's retire test is re-worded to "the body's stamps are not read".
- **R52:** built on my J1 readings (all confirmed by B2, K3109).
  - `op=ratify`'s checks before its commit are now `prepareFinding`, and the steps after it are in `finding.mjs`. Every member of a sitting goes through that same code, and `op=ratify`'s answers are unchanged.
  - With `op=caseratify`, the case and its members commit in one transaction, and a refusal rolls everything back. The answer lists each member under `sitting`.
  - With `op=publishat`, the members are held in `checked.members`, checked again by R42 and committed after the case, or the edition stops with them.
  - Tests are in `sitting.test.mjs`: the 1 + 2 + 5 sitting, and the control where one bad signature commits nothing.
- **P8:** I read my code and tests whole, with a helper's digest for the rest. I fixed C-92.11 naming no observation, and corrected some stale headers. Two small items are deferred, with reasons in my record.
- **Results:** ratification 245/245.
  - Its users' suites have 19 reds. All 19 are also red on `tranche/T47` itself, and none names this module.
  - format, architecture, coverage (51/51) and ownership show 0 failures for ratification. `checks/run.mjs` architecture shows 0.
- **Other modules:** one REPORT, J2 (screens-intake's stand-in test; how screens-publish reads the answer). The plane bundle is staled.
