# conformance (T34)

**Status** · session_01DVTPBA7uYZBu2KWvjdwvsU · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** T34-87 (DEC-149; N664, K1784, K1811), conformance's two rows of `build/plan/draft-T34-dec149.md`: C-113.28 `STANDARD_SIDE_UNNAMED`'s translation (`bio-plane/src/conformance/checks.mjs`) now reads "Name which side of the question states what the standard requires, a or b. Your group's Civicsmith never chooses it. Nothing was written.", and the same refusal's detail in `comparisonFacts` (`index.mjs`) reads "… a or b: your group's Civicsmith never chooses it. Nothing was written." `index.mjs`:1369 is a comment (operator-facing) and stays. No other string in the module names the group's Civicsmith as this instance, copy, plane or server. Test: `bio-plane/test/m/conformance/dec149.test.mjs` (R21 drives both strings out at the interface and names them whole; a second test holds every C-113 translation and every exported member-facing sentence to the rule, with a negative control). Both tests fail on the old strings (0 pass, 2 fail) and pass on the new.

**Rows awaiting stamp** (plan Rules (5) item 4; T35's promotion job stamps them). C-113.28 STANDARD_SIDE_UNNAMED: translation changed (DEC-149), `awaiting stamp`. `CATALOG_VERSION` is promotion's (`gate.mjs`, its R34, R50) and is not moved by this job.

**Deferred.** Nothing.

**Found in other modules** (reported to BOB):
1. **Requirements text (BOB's).** `build/requirements/conformance.md`'s R21 row table still quotes C-113.28's old translation ("The plane never chooses it."). The code now carries DEC-149's wording; the table wants BOB's matching wording (no meaning change).
2. **promotion** (`bio-plane/test/system/row-census.test.mjs`): names `changed with no record: C-113.28 STANDARD_SIDE_UNNAMED` beside T34's other layer-3+ rows; inside the accepted red of plan Rules (5) item 4 until T35's stamp. Red before this job too (other rows).
3. **control-plane** (`bio-plane/test/m/control-plane/catalogue-end.test.mjs`): `rows-before-r43.json` pins C-113.28's translation digest (`e2cea14e4398e83c`), which this change moves; the suite was already red (1 pass, 1 fail) before this job, inside K1708's named R43 red; the pin is re-taken by control-plane's T34-60 (L11), as for C-91.1/.2 (K1789) and C-48.8/.9 (K1836).
4. **Generated artifact stale (§14):** `bio-plane/dist/bio-plane.bundled.mjs` (its manifest lists `src/conformance/`); regenerated at the layer close. `fleetbundles.test.mjs` was red before this change as well.

**Tests and checks.**
- `node --test bio-plane/test/m/conformance/` : tests 66, pass 66, fail 0.
- `node checks/format.mjs /home/user/bio` : 127 modules, 126 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio conformance` : 10 product files, 51 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio conformance` : 26 of 26 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio conformance tranche/T34` : 4 files changed by conformance; 0 failures.
- No layer tests are named in `build/manifest.md`. No service changed, so no user module's tests were owed.

**Read for the job, whole:** JOB.md; `build/manifest.md`; `build/requirements/conformance.md`; the public parts of all fifteen Uses; layer 9's contract; the plan's Rules at the opening and T34-87; K1811; the DEC-149 draft's rows; the module's code (3 files) and tests (7 files).

Size (session_01DVTPBA7uYZBu2KWvjdwvsU): test runs 5, module lines 1739
