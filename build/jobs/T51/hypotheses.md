# hypotheses (T51)

**Status** · session_01EadYoLQpp5GhXS6UWqUpKn · depth 2 · WORKING · handled B1

## J1 · COMPLETE

Applied BOB's note 1 (red #30, rule 5.4, N1244). `notes.test.mjs` R11 copied the court sentence; it now takes the expected text from `Membership.COURT_STATEMENT` (the word-table row `court.statement`, the sentence membership R108 names). Commit 93ac3f2156 on job/T51/hypotheses. No source change: the module already answers the "team" sentence, which is correct.

A decision recorded here for BOB, not made silently: I first read the word table through `setup-words` directly, but `architecture.mjs` then failed because hypotheses does not declare `setup-words` in `uses`. A `uses` edge is BOB's, so I took the expected value from `Membership.COURT_STATEMENT` instead, a module already in `uses`. Please confirm, or say if you want the edge added.

Deferred: none.
Found in another module: none. The 23 other modules with coverage failures in the full run (24 ids) are the T51 jobs still open; not reported as new.

Tests: `node --test bio-plane/test/m/hypotheses/*.test.mjs`: 51 pass, 0 fail (after the change; the notes file alone was 7/7 green before it).
Checks (process repo, product /home/user/bio): format 0 failures; architecture (this module) 0 failures, and the whole tree 0 failures; coverage (hypotheses) 23 of 23 live ids named, 0 failures; ownership (tranche/T51 to job/T51/hypotheses) 1 file, 0 failures; `checks/run.mjs`: format, architecture, ownership and channels 0 failures, coverage 24 failures, all in other modules.

Size (session_01MSX35oLuKxfsaPu7fR6wpD): test runs 3, module lines 1110

## J2 · COMPLETE

Applied B2 (T51-215, the words rule; BOB's note 1 and note 2). Commit dc4a82567a on job/T51/hypotheses, merged with tranche/T51 (f70c043c78, never rebased).

- Finding 1, `checks.mjs` PROPOSAL_NOT_OPEN: the sentence had no word-table row, so it now reads `localize('hypotheses.checks.proposal_not_open', en)`, a new fixed id (setup-words R14), the same form as the module's other unrowed sentences.
- Finding 2, `index.mjs` neighbours' VIEWER_MISSING reason: row `hypotheses.why.read_names_member` exists, so it reads `word(...)`.
- Not in the findings, found by the run: `connection-grammar` now requires an undetermined reason as `{key, vars}` (its reads.mjs `reasonFills`). `UNDATED_WHY` was a bare string, so R4's owner-conformance test and the R6 re-derive test failed (3 reds, also red before my edits). `UNDATED_WHY` is now `{ key: 'hypotheses.hunch_states_period', vars: {} }`; the one test that pinned the old string shape now asserts the keyed form (`owner.test.mjs`). This is a flaw in my module, fixed here (P8).
- Deferred: none.
- Found in another module: none. The whole-tree run's failures are other modules' (coverage 28, words 3366 across the tree); none names hypotheses.
- Stale branch: as B3 said, the earlier local job branch was renamed `stale-local-hypotheses`, kept local and never pushed; this branch was taken from origin.
- `setup-words/build.mjs --check`: the one stale-rows note is the new row `hypotheses.checks.proposal_not_open`, which BOB regenerates at the layer close; no refusal names hypotheses.

Tests: `node --test bio-plane/test/m/hypotheses/*.test.mjs`: 51 pass, 0 fail (after the merge).
Checks (product /home/user/bio): format 0 failures; architecture 0 failures (module, and whole tree); coverage (hypotheses) 23 of 23 live ids named, 0 failures; ownership (tranche/T51 to job/T51/hypotheses) 4 files, 0 failures; `checks/run.mjs`: format, architecture, ownership, channels 0 failures; words: no finding in hypotheses; coverage and words failures in the whole tree are other modules'.

Size (session_01EadYoLQpp5GhXS6UWqUpKn): test runs 9, module lines 1113
