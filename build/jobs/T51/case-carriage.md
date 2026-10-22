# case-carriage (T51)

**Status** · session_01TiUC4aAJHXVFiQ6sXRqvjg · depth 2 · WORKING · handled B2

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

## J3 · COMPLETE

COMPLETE. T51-225 (words, K3949 and K3957) is applied on `job/T51/case-carriage` at a223553815, merged with `tranche/T51` (6c98dc6386). Entries applied: T51-225. Deferred: none.

**Applied.** Every finding in `build/plan/words-pass/case-carriage.md` is fixed; the words check reports no case-carriage finding.
- `index.mjs`: the member-read refusal details that were inline sentences are now `localize("case-carriage.index.<slug>", en, vars)`. The ids are new and fixed once: `no_photo_you_can_see` (4 sites), `a_mark_is_made_by`, `that_capture_is_not`, `areas_is_not_a_list`, `area_i_is_not_an` (`{i}`, the inline finding), `a_mark_is_withdrawn`, `no_mark_of_that`, `an_area_lies_wholly`, `no_evidence_store_is`, `no_provenance_onreceipt`. The plain findings' other sentences were already read by key.
- Tests: `archive.test.mjs` takes `authority_basis` from `word("acquisition.authority_basis.file_cut_out", { at })`, the acquisition module's own declared key. `obscured.test.mjs` compares with `word("photo.state.nothing")`. `documents.test.mjs` and `marks.test.mjs` have the copied "the original is unchanged" assertion message reworded to "original digest unchanged".

**Judgment calls (for BOB to confirm or move).**
1. `index.mjs:1190`, the `NO_RECEIPT_NOTICE` detail in `start()`, is a developer diagnostic. I converted it to `localize` rather than listing it as a REPORT, because its sibling `REGISTRATION_UNANSWERED` at `index.mjs:1195` is already localized, and `faults()` is the surface that answers it. If BOB rules it developer-only, it moves to `unkeyed`.
2. `documents.test.mjs:440` (the R18 case) compares the detail with `localize(id, en)` by equality, the form K3810 allows, so the test holds no copy.
3. The rewording in (Tests) above is my choice: no row carries the "original is unchanged" sentence in full, so there was no `word(key)` to read.

**Found in other modules (P9; for BOB).** The full `checks/run.mjs` run reports failures outside case-carriage: the words check has 2,248 failures across modules; coverage has 25 failures across modules, none in case-carriage. In `wizard-scripts` the words check flags test copies at `t47.test.mjs:92, 141, 142, 150, 152, 221, 237`, `t48.test.mjs:55, 142, 169, 170, 180, 198` and `writing-help.test.mjs:204, 205`. Not changed by this job.

**Checks (from civicos-process, product /home/user/bio, after the merge).**
- format: 176 modules, 175 requirements files; 0 failures.
- architecture case-carriage: 0 failures.
- coverage case-carriage: 22 of 22 live requirement ids named by a test; 0 failures.
- ownership `case-carriage` `tranche/T51` → `job/T51/case-carriage`: 6 files changed by case-carriage; 0 failures.
- words: no finding in case-carriage (`checks/words.mjs`).
- `setup-words/build.mjs --check`: exits 1 with a stale-rows note naming the new ids (`rows.mjs` is stale until the layer close). This is the expected note, not a refusal.
- Module tests (`node --test test/m/case-carriage/*.test.mjs`): 88 of 88 pass, 0 fail, after the merge.
- `checks/run.mjs`: 0 failures in format and architecture; the other failures are the other-module findings above.

Size (session_013V7QhsFKttVRZGCkN2oybJ): test runs 4, module lines 1659
