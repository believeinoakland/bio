# action-grammar (T50)

**Status** · session_013ytnNAu1YXcVZABMCxL1tX · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

COMPLETE, T50-44 · action-grammar. Commit b5078b92bc, pushed to job/T50/action-grammar.

**Applied.** T50-44 (words check by key). `ACTION_GRAMMAR_WORDS` (the 24 R26 rows) and C-117.58's translation now read each sentence with setup-words' `word(key)` (layer 1, already a declared use), not a copy of `words.json`. Twelve copied sentences had drifted from the file (the design stream's "team", N1160; "group" was stale). The table keeps R26's key order. C-117.58 (`MACHINE_CANNOT_SET_COPIED`) now reads its key too, because `words.json` has held it since T50 (R26 says it "keeps its own" because the file did not hold it then).

**Plan rule 6, the Haiku items.**
- Item 2 ("labelled" to "labeled"): my member-facing words hold no "labelled". The only occurrences in `src/action-grammar` are two code comments (`checks.mjs` 308 and 1276), which are not member-facing and are left as they are.
- Item 3 (hand-lists): my tests hand-list no other module's ops, rows or words. The census (`archive/drafts/draft-T49-N1073-hand-lists.md`, in `build/plan/archive/drafts/`) lists action-grammar only as hand-listed by `action-records`. Nothing to change.

**Deferred.** None in this module.

**Found in other modules (report, not changed).**
- The sentences "a machine credential proposed … That is machine work, labelled as machine work" are member-facing text owned by others: `record-grammar/labels.mjs`, copied into `action-records/index.mjs`, `actions/index.mjs`, `action-clocks/index.mjs`, `case-checker/program.mjs` and `skilldoctrine.mjs`. My `test/m/action-grammar/golden.json` holds three fixtures of that sentence (lines 15031, 15037, 15043). Their owner, `record-grammar`, should move to "labeled" under its own job (N1068).

**Ruling for BOB** (I may not write `build/rulings.md`, outside my paths; please record it there). R26's text "C-117.58 … which words.json does not hold, keeps its own" is stale: the key exists now. I took C-117.58 by key, as the entry's "words check by key" and the file both point to. Please confirm, or amend R26 to say so. The R26 wording is yours to change, not mine.

**Tests and checks.**
- `node --test test/m/action-grammar/`: 80 pass, 0 fail (before the change: 3 failing, on the drifted copies).
- `format.mjs`: 0 failures. `architecture.mjs`: 0 failures. `coverage.mjs`: 29 of 29 live ids named by a test, 0 failures. `ownership.mjs tranche/T50`: 4 files, 0 failures.
- `checks/run.mjs` over the product: 30 failures, all coverage gaps in other modules (none in action-grammar); architecture and format pass; channels 0 failures.

Size (session_013ytnNAu1YXcVZABMCxL1tX): test runs 7, module lines 2748.

## J2 · COMPLETE

COMPLETE, B2 CHANGE (noSuchAction moved to action-records). Commits 83c8632053 and the revert after it, pushed to job/T50/action-grammar.

**Applied.** Merged `tranche/T50` into the branch. C-117.2 `NO_SUCH_ACTION`'s `where` now reads `src/action-records/index.mjs noSuchAction > is-no-such-action`. Its golden fixture (`golden.json`) follows, and the moved-row lists in `t47.test.mjs` (R28) and `t48.test.mjs` (R29) include it, with the count raised to 12+5+1.

**Not done: the census fixture.** `bio-plane/test/fixtures/row-census-1.77.0.jsonl` line 424 still names `actions`' site for C-117.2. That fixture is outside action-grammar's paths, so the ownership check refused my edit, and I reverted it. Its reader is `bio-plane/test/system/row-census.test.mjs`, which is red for many rows from other modules' moves (C-117.34, C-117.51, C-100.18 and others), so C-117.2 is one of them. Whoever owns the census (or you, by authorizing me to write it) needs to re-take line 424.

**Found in another module (report).** `bio-plane/test/m/actions/t11.test.mjs` R43 pins `actions`' old site (line 128) and now fails. Its owner, `actions`, should re-point it. `actions/index.mjs` still carries the `is-no-such-action` DEC-49 region at line 172 (its R18 moved to action-records), which `actions` should retire too.

**Tests and checks.**
- `node --test test/m/action-grammar/`: 80 pass, 0 fail.
- `format.mjs`: 0 failures. `architecture.mjs`: 0 failures. `coverage.mjs action-grammar`: 29 of 29 named, 0 failures. `ownership.mjs tranche/T50`: 4 files, 0 failures.
- `checks/run.mjs` over the product: 29 coverage failures, all in other modules; none in action-grammar. Channels 0 failures.

Size (session_013ytnNAu1YXcVZABMCxL1tX): test runs 9, module lines 2748.
