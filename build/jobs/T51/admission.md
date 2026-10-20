# admission (T51)

**Status** · session_015HDWbHmEnfNhPztiBbgnVw · depth 2 · WORKING · handled B1

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

## J1 · COMPLETE

T51-108 (words pass) is done and pushed (f71da31fdc). The one words finding, the handlist in t50.test.mjs:34, is fixed by asserting the count of administrator acts read from op-declarations; the stale civicos-ui comment at checks.mjs:139 is reworded. Admission: 58 of 58 tests pass; words, format, architecture, coverage (31 of 31), ownership, setup-words --check all clean. Full words run lists no admission line (K3986). Record: build/jobs/T51/admission.md.
