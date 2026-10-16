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

## J2 · COMPLETE · re B2

Entry R085-32 applied: screens-intake R28. The slug of a promoted upload's id is now cut to 40 first, then a trailing hyphen the cut left is trimmed (`bio-plane/src/screens-intake/capture.mjs`, the slug line in `promoteDocument`; commit 1a3e7487bd on job/R085/screens-intake). Tests (R28 named in each): "R28 a name whose 40-character cut ends at a hyphen promotes under an id with no trailing hyphen, its slug beginning and ending with a letter or digit" (a 39-letter name then `-b.pdf` promotes as `INFO-2026-0011-` plus 39 letters, canonical); "R28 control: a name of 41 plain characters is cut to 40 characters of slug".

Entry R085-5 (B1) was applied in J1 (commit 1f6cfea0f4) and is not re-applied here. The record's Status line still read "handled B0", so the inbox listed B1 and B2 as unread; B1 is done, and B2 is done by this entry.

Tests: `node --test bio-plane/test/m/screens-intake/`: 84 pass, 0 fail, 0 skipped (82 before, plus the two R28 tests).

Checks (run from civicos-process, product /home/user/bio):
- format: 170 modules, 169 requirements files; 0 failures
- architecture screens-intake: 14 product files, 36 relative imports; 0 failures
- coverage screens-intake: 28 of 28 live requirement ids named by a test; 0 failures
- ownership screens-intake tranche/R085: 3 files changed by screens-intake (the two code files and the job record); 0 failures

Deferred: none. Found in another module: none. No generated artifact of another module touched or staled.

Note for BOB: build/requirements/screens-intake.md still marks R28 "not yet met (R085)". The requirements file is BOB's to mark met, so I left it.

Note on attribution: the commit carries the Claude-Session trailer only. I left out the model-name co-author line because the session rules forbid model identifiers in commits.

Size (session_015Mf3ce3jZhcJKnA4udwzC2): test runs 3, module lines 2754
