# case-checker (T39)

**Status** · session_013nDuZWRyji4rYH9ax6JrLQ · depth 2 · WORKING · handled B0

## Completion

**Reading (mechanics §17 step (3), K2304).** The reading set exceeded 300 KB, so I read these whole myself: my requirements; layer 8's row and its case-checker section in `layers.md`; `spec.mjs` and `spec.test.mjs` (the code and tests this entry changes); case-grammar R12–R14 and case-carriage R15–R16 with `COPY_CLEANED_LABEL` (the requirements the new words come from); K2315, K2333, K2334, K2343 and K2365. A worker read the rest of the module's code and tests in full (`check.mjs`, `index.mjs`, `main.mjs`, `build-program.mjs`, `standards.mjs`, `zip.mjs` and the five other test files). It was told the task and R14, and wrote a 3 KB summary citing file and line. It found that `spec.mjs` is not bundled into `program.mjs`, which reads only the version keys.

**Entries applied.** T39-17 (N806; R14). In the `bio-case-file/3` specification (`spec.mjs`, V3's named changes), the `obscured` kind, the `materials:` row, the complete edition's listing and rule 7 (Presentability) now name a member document's cleaned copy (case-carriage R15) beside a photo's copy, as material carried in place of its original. The changes are words only: the format, the kinds and the fields are unchanged, and the `/1` and `/2` texts are untouched. A new test, `R14 (T39; N806; K2333, K2343)` in `spec.test.mjs`, checks every place the specification speaks of the copy, checks that none of the photo-only wording is left, and checks that the format is unchanged. The two T37 assertions that read the old words now read the new ones.

**Improvement in my own module.** The R8 `missing` entry for a copy that is not carried (`check.mjs`) said "its marked areas obscured", which fits only a photo. It now reads "(a photo with its marked areas obscured, or a member document cleaned)", and its test in `check.test.mjs` matches. I then regenerated `program.mjs` with the manifest's command (626,121 bytes, sha256 `b44c2b3a…a2cb`, 71 inputs), and its byte-identity test is green.

**Deferred.** Nothing.

**Found in other modules / stale artifacts (REPORT).** (1) `program.mjs` changed, so the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`, which bundles `program.mjs`, K1540) is stale until BOB regenerates it at layer close. (2) R14's `*(not yet met: T39)*` marker in `build/requirements/case-checker.md` can be cleared, since the clause is now met. (3) A worker's note, not checked by me: `check.mjs` accepts `obscured` on any material kind, while the spec says a `document` row may state it. Whether case-grammar's `materialsOf` refuses it on an observation is case-grammar's to say; this is not a defect against R8 as worded.

**Tests and checks.**
- `node --test test/m/case-checker/` (from `bio-plane/`): tests 61, pass 61, fail 0, skipped 0.
- `format`: 139 modules, 137 requirements files; 0 failures.
- `architecture`: 15 product files, 64 relative imports; 0 failures.
- `coverage`: 22 of 22 live requirement ids named by a test; 0 failures.
- `ownership`: 6 files changed between tranche/T39 and HEAD; 0 failures.
- No layer tests are named in the manifest.

Size (session_013nDuZWRyji4rYH9ax6JrLQ): test runs 4, module lines 1464
