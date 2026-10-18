# case-carriage (T51)

**Status** · session_01X6mu5tbjL2pAmrUPvxveWL · depth 2 · WAITING ON BOB (J1) · handled B0

## J1 · BLOCKED

BLOCKED (cause: needs Bob) — one act to unblock: add `setup-words` to case-carriage's `uses` in `build/modules.json`.

Entries applied: T51-70 (the entry's red, #31, and its other work per plan rule 6: the module reads its labels by key).
- `bio-plane/src/case-carriage/checks.mjs`: the seven words the module holds are read from setup-words' list by key (`word`, and placeholders left as written for the screen); no sentence is copied. Pushed as 9f22b3e8f9 on `job/T51/case-carriage`.
- `bio-plane/test/m/case-carriage/marks.test.mjs` (R11): the two literal label assertions and the "BOB's draft" negative control are dropped (they quoted sentences, K3810); the key-to-en check stays.
- No change to any exported value: OBSCURED_LABEL, PUBLISHED_LABEL, COPY_CLEANED_LABEL and the four refusal translations are equal to before.

Deferred: none. Not changed: requirements' wording ("the group holds the original", R11, R14) is BOB's (plan rule 7); a stale "group" in the requirement text is noted, not edited.

Tests (own module, `node --test test/m/case-carriage/*.test.mjs`): 88 tests, 88 pass, 0 fail. case-disclosures `documents.test.mjs` and `photos.test.mjs` (the R22 reds): 23 pass, 0 fail. So the red is green after the change.

Checks (from civicos-process, product /home/user/bio):
- format: 174 modules, 173 requirements files; 0 failures.
- coverage case-carriage: 22 of 22 live requirement ids named by a test; 0 failures.
- ownership case-carriage tranche/T51 job/T51/case-carriage: 2 files changed by case-carriage; 0 failures.
- architecture case-carriage: 1 FAIL, not mine to clear: `bio-plane/src/case-carriage/checks.mjs` imports `setup-words`, which case-carriage does not declare in `uses`. setup-words is layer 1 and uses nothing, so the edge is the only fix. It is in build/modules.json, which this job may not write.

Needs Bob: add "setup-words" to the uses array of the case-carriage entry in build/modules.json (the same act as the other modules that already declare it, e.g. case-checker, membership). Once BOB's commit is on tranche/T51 I will merge it, re-run architecture, and post COMPLETE.

Not opened: a pull request. The job role says open none; BOB merges from the tranche.
Size (session_01X6mu5tbjL2pAmrUPvxveWL): test runs 5, module lines 1660

## J2 · COMPLETE

COMPLETE. J1 BLOCKED is answered by B2: `setup-words` is in case-carriage's uses (merged from tranche/T51 on this branch), and R11's wording is "team" (BOB's edit, merged).

Entries applied: T51-70. checks.mjs reads its seven words by key from setup-words' list (placeholders left for the screen); marks.test.mjs drops the literal sentences (K3810). Deferred: none.

Tests: case-carriage, 88 of 88 pass; case-disclosures documents.test.mjs and photos.test.mjs (R22), 23 of 23 pass; both green after the merge.

Checks (product /home/user/bio): format 0 failures; architecture case-carriage 0 failures (after the merge); coverage case-carriage 22 of 22 live ids named, 0 failures; ownership tranche/T51 to job/T51/case-carriage 0 failures (3 files: checks.mjs, marks.test.mjs, this record).

Found in other modules: none.

Size (session_01X6mu5tbjL2pAmrUPvxveWL): test runs 7, module lines 1660
