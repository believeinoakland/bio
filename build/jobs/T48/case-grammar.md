# case-grammar (T48)

**Status** · session_01YKW8GwS3kRscPxRh48DN1m · depth 2 · WORKING · handled B0

## Completion (CASE-GRAMMAR #16)

**Entry applied** · T48-38 (N1016, K3111; N1019): R32 met; R3 and R29 meet the naming N1019 asks.
- **R32** `complete.mjs`: the complete edition (R14) lists a material carried as its copy by R31's stored `kind` first (`copyIsDocument`): `document` is the cleaned-copy line, `photo` the photo's copy line (marked or unmarked by R12's `marked`), whatever the copy's bytes are, and the copy file is not consulted for such a row. Only a row whose `kind` is null (an edition signed before T47) is read by the copy's bytes as before (PDF or zip package = cleaned copy; else, or not handed, a photo's). The header comment is re-worded to say so. Every edition signed before T47 renders byte for byte as before (the pinned T37 hash and both goldens still pass).
- **Tests.** `kind.test.mjs` gains three R32 tests: kind `photo` over a PDF copy and kind `document` over an image copy (the controls R32 names), a stated kind never re-read from bytes (no copy handed, empty, image, PDF, zip, odd), and a row stating none (absent, null, an unknown word) keeping T39's choice by bytes with the T37 edition's hash unchanged. The T39 test "never by the row" in `obscured.test.mjs` is re-stated in its title: by the row's `kind` when it states one (R32's tests), else by the bytes; its assertions are unchanged and still hold.
- **R3, R29 (N1019).** The code already exports `SECTIONS`, `REAUTHORABLE_SECTIONS` and `OUTCOME_KINDS` (frozen); `sections.test.mjs` (R3) and `outcomes.test.mjs` (R29) already pin the names and their order, so no code change.
- **"labelled" → "labeled" (K3261, DEC-221).** The one occurrence in the module is a code comment in `blocks.mjs` (not member-facing); re-spelled. No member-facing "labelled" in the module's output.

**Read** · I read whole, myself: `build/requirements/case-grammar.md`; all 17 files of `bio-plane/src/case-grammar/`; and the tests the entry touches, `kind.test.mjs` and the T39/R32 test of `obscured.test.mjs` (read in part: lines 340–420 of the latter and the head of the former), with the fixture's `memberDoc` and `photo` rows. The other test files and the two goldens I did not read whole this session (the reading set was over the 600 KB limit, §17; I did not use digest helpers): I ran them whole and they pass. The used modules' public parts (`record-grammar`, `calc-grammar`, `strength`) were not re-read: nothing in this entry touches them. No flaw found in the module that a requirement or this entry reaches.

**Deferred** · none.

**Found in other modules** · `case-checker`'s generated `bio-plane/src/case-checker/program.mjs` is stale (it bundles `complete.mjs`): its R13 test "the committed program.mjs is that build" is red (actual `3f4e44ff…`, expected `ee8a71e3…`). It is the accepted red of rule 5.4, regenerated at layer close (`node bio-plane/src/case-checker/build-program.mjs`, manifest order K1540). Not written by this job.

**Tests and checks** (on `job/T48/case-grammar`)
- `node --test bio-plane/test/m/case-grammar/`: tests 155, pass 155, fail 0 (152 before; three new R32 tests).
- Users' tests: `public-read` (`cleaned-key`, `casefile`), `case-disclosures` (`copies`), `case-checker` (all): 92 tests, 91 pass; the one fail is `case-checker` R13's program.mjs freshness above (80/0 without my change, since program.mjs and complete.mjs then agree).
- `checks/format.mjs`: 0 failures; `architecture.mjs … case-grammar`: 0 failures; `coverage.mjs … case-grammar`: 32 of 32 live ids named, 0 failures; `ownership.mjs … tranche/T48`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures, channels 0; coverage 32 failures, none case-grammar's (other modules' ids named by no test, rule 5.1).

Size (session_01YKW8GwS3kRscPxRh48DN1m): test runs 6, module lines 2807
