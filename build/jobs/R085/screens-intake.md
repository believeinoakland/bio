# screens-intake (R085)

**Status** · session_015Mf3ce3jZhcJKnA4udwzC2 · depth 2 · WORKING · handled B0

## J1 · COMPLETE

Entry R085-5 applied: screens-intake R27. `sendUpload` (capture.mjs) now adds `type` from `file.type` to the query beside `statement` and `name` when the declared type is a non-empty string; an empty type sends no `type` key. Commit 1f6cfea0f4 on job/R085/screens-intake.

Tests (R27 named in each): "R27 the upload sends the file's declared media type as type ..." (text/plain sends type: "text/plain"); "R27 control: a file whose declared type is empty sends no type" (no `type` key present). Module tests: `node --test bio-plane/test/m/screens-intake/`: 82 pass, 0 fail, 0 skipped.

Checks (run from civicos-process, product /home/user/bio):
- format: 170 modules, 169 requirements files; 0 failures
- architecture screens-intake: 14 product files, 36 relative imports; 0 failures
- coverage screens-intake: 27 of 27 live requirement ids named by a test; 0 failures
- ownership screens-intake tranche/R085: 3 files changed by screens-intake (the two code files and the job record); 0 failures (tranche/R085 is not local, so it fell back to origin/tranche/R085)

Deferred: none. Found in another module: none. No generated artifact of another module touched or staled.
Note for BOB: build/requirements/screens-intake.md still marks R27 "not yet met (R085)"; the requirements file is BOB's to mark met, so I left it.

Size (session_01LTHS3Rs6T9eRCKe5iQiDrX): test runs 1, module lines 1127
