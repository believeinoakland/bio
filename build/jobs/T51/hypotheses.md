# hypotheses (T51)

**Status** · session_01MSX35oLuKxfsaPu7fR6wpD · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Applied BOB's note 1 (red #30, rule 5.4, N1244). `notes.test.mjs` R11 copied the court sentence; it now takes the expected text from `Membership.COURT_STATEMENT` (the word-table row `court.statement`, the sentence membership R108 names). Commit 93ac3f2156 on job/T51/hypotheses. No source change: the module already answers the "team" sentence, which is correct.

A decision recorded here for BOB, not made silently: I first read the word table through `setup-words` directly, but `architecture.mjs` then failed because hypotheses does not declare `setup-words` in `uses`. A `uses` edge is BOB's, so I took the expected value from `Membership.COURT_STATEMENT` instead, a module already in `uses`. Please confirm, or say if you want the edge added.

Deferred: none.
Found in another module: none. The 23 other modules with coverage failures in the full run (24 ids) are the T51 jobs still open; not reported as new.

Tests: `node --test bio-plane/test/m/hypotheses/*.test.mjs`: 51 pass, 0 fail (after the change; the notes file alone was 7/7 green before it).
Checks (process repo, product /home/user/bio): format 0 failures; architecture (this module) 0 failures, and the whole tree 0 failures; coverage (hypotheses) 23 of 23 live ids named, 0 failures; ownership (tranche/T51 to job/T51/hypotheses) 1 file, 0 failures; `checks/run.mjs`: format, architecture, ownership and channels 0 failures, coverage 24 failures, all in other modules.

Size (session_01MSX35oLuKxfsaPu7fR6wpD): test runs 3, module lines 1110
