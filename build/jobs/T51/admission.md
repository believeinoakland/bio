# admission (T51)

**Status** · session_015HDWbHmEnfNhPztiBbgnVw · depth 2 · COMPLETE · handled B2

## Completion (T51-108)

**Entries applied.** T51-108 · admission, the words pass: the one finding `checks/words.mjs` lists for the module (`handlist`, `bio-plane/test/m/admission/t50.test.mjs:34`, the hand-list of five administrator ops) is fixed. The test now asserts the count of acts `administratorsOwn()` reads from op-declarations (five today), not a list of op names. The stale comment at `bio-plane/src/admission/checks.mjs:139`, which named the deleted `civicos-ui/app.html`, now says "the legacy interface". Text: none; no requirement changed.

**Deferred.** None.

**Found in another module.** The full words run (`checks/words.mjs /home/user/bio`, all modules) lists 1096 failures in other modules, none naming admission (K3986). Not reported further here; they belong to their own modules' jobs.

**Checks and tests.**
- `node --test bio-plane/test/m/admission/*.test.mjs`: 58 pass, 0 fail, 0 skipped (the directory form of `node --test` printed no summary; the glob form was used).
- `checks/words.mjs /home/user/bio admission`: 0 failures, handlist 0.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio admission`: 0 failures.
- `checks/coverage.mjs /home/user/bio admission`: 31 of 31 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio admission tranche/T51 job/T51/admission`: 0 failures (1 file changed by admission between tranche/T51 and the job branch, before the record commit).
- `bio-plane/src/setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match.
- `node checks/run.mjs` was not run as a whole: this step was not needed for the words-only change, and the individual checks above cover its parts.

**Size (session_01TfUBwfzbh3tVDcKbv3gYqo): test runs 2, module lines 1567.**

## Completion (B2 CHANGE, K4245: export for the founder's session)

**Entries applied.** `admit` (`bio-plane/src/admission/index.mjs`) now refuses `export` `ROOT_OF_TRUST_REQUIRED` (C-38.4) only to a session whose kind is not `admin`; the founder's session (kind `admin`) goes on to `sessionOpGate`, which admits it because `export` is in `SESSION_OPS.admin`. The ADMIN_TOKEN bearer is admitted by R9 as before. An enrolled administrator's session (kind `member`) and every other member session are still refused, before R9 and R11. The refusal's `detail` and the gate's doc comment now state the two forms of the root of trust.

**Tests re-pinned.** `admission.test.mjs` R8 (:39-45, the "no recorded decision" arm) now uses `purge` with its decision removed from an arranged copy of the tables; (:48) loops and the order test (`both`, `onlyAdmin`) exclude `export`, now in the founder's set; the `export` arm (:63-70) asserts: the founder's session and the ADMIN_TOKEN bearer reach `export` (caller class `admin`, the former via a session); controls refused `ROOT_OF_TRUST_REQUIRED` with no store call: an enrolled administrator's session, a member's session, a session holding no capability; the retired member key `MEMBER_TOKEN_RETIRED`; probe and daemon bindings `CLASS_FORBIDDEN`. :209 (export's refusal before R9 and R11 for a capability-less member session) is unchanged and still holds. `invariants.test.mjs` :26 uses `purge` the same way. R8 is the requirement id the tests name.

**Requirement lines for BOB (R8, amended).** Replace its last sentence "A session asking for `export` is refused `ROOT_OF_TRUST_REQUIRED` (C-38.4)" with: "`export` is admitted to the root-of-trust bearer (R9) and to the founder's session (kind `admin`), the session the claim made from that token (Membership v2 §4.6); a session of any other kind, an enrolled administrator's included, is refused `ROOT_OF_TRUST_REQUIRED` (C-38.4), before R9 and R11." The Satisfies line for §4.6 and the header comment of the `admit` order read the same way. Words: the row `refusal.ROOT_OF_TRUST_REQUIRED` (design stream's `words.json`) may still say that the founder's own session is refused too; the wording of that sentence is not this module's.

**Deferred.** None. **Found in another module.** `control-plane`'s R28 test pins `export` as refused to the founder's session (BOB said its job re-pins it after this merge); `bio-plane/src/setup-words/rows.mjs` is stale (an expected note).

**Tests and checks.** `node --test bio-plane/test/m/admission/*.test.mjs`: 58 pass, 0 fail. Process repository: `format` 0 failures; `architecture admission` 0; `coverage admission` 31 of 31, 0; `ownership admission tranche/T51 job/T51/admission` 4 files, 0; `words admission` 0 failures; `setup-words build --check` the expected stale-rows note only. Tests of modules that use admission's `admit` (control-plane) were not run here: BOB's CHANGE leaves them to CONTROL-PLANE's job.

**Size (session_015HDWbHmEnfNhPztiBbgnVw): test runs 3, module lines 1567.**

## J1 · COMPLETE

T51-108 (words pass) is done and pushed (f71da31fdc). The one words finding, the handlist in t50.test.mjs:34, is fixed by asserting the count of administrator acts read from op-declarations; the stale civicos-ui comment at checks.mjs:139 is reworded. Admission: 58 of 58 tests pass; words, format, architecture, coverage (31 of 31), ownership, setup-words --check all clean. Full words run lists no admission line (K3986). Record: build/jobs/T51/admission.md.

## J2 · COMPLETE

B2 (K4245) applied and pushed. export is admitted to the ADMIN_TOKEN bearer (R9) and the founder's session (kind admin); every other session, an enrolled administrator's included, is refused ROOT_OF_TRUST_REQUIRED before R9/R11. Tests re-pinned (admission.test.mjs R8, order test; invariants.test.mjs) with controls for the founder's session, administrator session, member session, capability-less session, retired member key, probe and daemon bindings. 58/58 pass; format, architecture, coverage (31/31), ownership, words clean. R8 amended line, and a note that words row refusal.ROOT_OF_TRUST_REQUIRED may still say the founder is refused, are in my record (build/jobs/T51/admission.md). CONTROL-PLANE re-pins its R28 test after merge.
