# workbooks (T35)

**Status** · session_01NygrqMhr96MVjNZFM6vvfF · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R8 quotes the disclosure word for word ("recomputed by the instance's engine (<engine> <version>); open it in any spreadsheet program") and the meaning ("agreement between the file's engine and the instance's engine"), while your START says no requirement change and the sweep rows (index.mjs:40, :625) re-word both to "the engine your group's Civicsmith runs". My reading, applied: the DEC-149 sweep governs the served text; R8's quoted sentence is re-worded to match by BOB (wording only, no change of meaning), so the code and R8 agree after merge. If you rule instead that R8's text stands, I revert the two strings. Nothing else waits on this.

## J2 · COMPLETE

T35-39 done on `job/T35/workbooks` (commit a69356f523 and the mail commits).

**Entries applied.**
- N634: `ops.test.mjs` R15 now exports the calculation by the id `calculations` minted (`calcId`, asserted against `record-grammar`'s `idPattern("CALC")`), not the hard-coded sequential `CALC-2026-0001`. Clears accepted red 8 (reproduced first: R15 failed with `expected: undefined`).
- DEC-149 sweep, 2 rows (M): `index.mjs`:40 `RECOMPUTE_MEANING` → "agreement between the file's engine and the engine your group's Civicsmith runs, never accuracy"; `index.mjs`:625 the disclosure → "recomputed by the engine your group's Civicsmith runs (<engine> <version>); open it in any spreadsheet program". The R8 test names both strings exactly and asserts neither says "the instance" or "the plane". No check row of this module moves (none in the sweep).

**Open:** J1 (R8 quotes the old wording; my reading: BOB re-words R8's quote to match, wording only). If ruled otherwise I revert the two strings.

**Deferred:** none.

**Found elsewhere:** none stale. No other module's code or test pins the two strings (grep: only code comments remain, in workbooks itself and `case-grammar/calculations.mjs`:33, class X). No generated artifact embeds them.

**Reading note:** step 2's public parts read whole for record-grammar, calc-grammar, sheet-worker and calculations (the ones this change touches) and layer 5's contract; office-readers, record-core, membership, promotion, provenance and content were not re-read, as no service of theirs is used differently by this change.

**Tests and checks.**
- `node --test bio-plane/test/m/workbooks/`: before, 25 pass, 1 fail (R15); after, tests 26, pass 26, fail 0. No layer tests named in the manifest.
- format: 130 modules, 129 requirements files; 2 failures (law-relations paths and tests entries: accepted red 24, not this module's).
- architecture workbooks: 15 product files, 49 relative imports; 0 failures.
- coverage workbooks: 18 of 18 live requirement ids named by a test; 0 failures.
- ownership workbooks tranche/T35: 0 failures.

Size (session_01NygrqMhr96MVjNZFM6vvfF): test runs 3, module lines 1588
