# strength (T31)

**Status** · session_01EghdokiWqHZ7K6YuUQjVB9 · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (`plan/current.md` T31 L6, N538; B1):
- **R15**: the bar's honest note (`BAR_HONEST_NOTE`, `index.mjs`) now reads "Civicsmith has no guidance yet on what particular audiences expect. Readers see the bar you set in these words." (DEC-105, DEC-124). Test: `reads.test.mjs` R15 (DEC-105), with a negative control that the old "CivicOS" note fails.
- **R31**: `gradingMethodText(version, product)` (`method.mjs`). `product` is a plain second argument (K1367 lets the job choose the form): a non-blank string is used as given; anything else, a missing one included, is read as `PRODUCT_NAME`, "Civicsmith" (exported from `method.mjs` and `index.mjs`). Only the first line names the product; the method's rules are the same under either name. An unknown version answers null; it never throws. With "CivicOS" it answers the pre-T31 words byte for byte: `method.test.mjs` pins their SHA-256 (`85cac7dd…c77c08`, 3,085 characters, measured on this branch before the change) and shows the two names differ only in that line. `vocabulary.test.mjs` R28 also sweeps the "CivicOS" text.
- The module header gained a T31 paragraph.

**Deferred:** nothing.

**In other modules (REPORT to BOB):**
- **case-checker** (generated artifact, mechanics §14): `bio-plane/src/case-checker/program.mjs` bundles `strength/method.mjs`, so this change makes it stale. Two case-checker tests fail on this branch ("R13: the build gives the same bytes…", "R13 R16: run offline…"); both pass without the change. It is regenerated after case-grammar's L8 merge (draft §6; case-checker's own L8 entry). I did not write it.
- **case-grammar**: `complete.mjs:234` calls `gradingMethodText(method.grading)` with one argument, so from this merge until case-grammar's L8 job passes "CivicOS" for `/6` (its R14), a complete edition renders "How Civicsmith grades…". `case-grammar`'s own tests stay green: they compare against the same one-argument call.
- **skills**: one test fails on this branch with or without my change ("R28 the action_planning layer: …"), probably from the opening's ASSISTANT-PILOT amendment (K1368). It belongs to the skills job (T31 L6).

**Tests and checks:**
- `node --test bio-plane/test/m/strength/`: tests 115, pass 115, fail 0.
- Tests of every module that uses strength (17 modules, `modules.json`): tests 1325, pass 1322, fail 3. The 3 failures are the two case-checker failures and the skills failure described above.
- `node checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `node checks/architecture.mjs … strength`: 18 product files, 61 relative imports; 0 failures.
- `node checks/coverage.mjs … strength`: 35 of 35 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … strength tranche/T31`: 6 files changed by strength; 0 failures.
- The Uses modules' public parts were not re-read whole: no entry touches a service this module uses.

Size (session_01EghdokiWqHZ7K6YuUQjVB9): test runs 5, module lines 2220

## J1 · COMPLETE

N538 applied: R15 (the bar's note names Civicsmith) and R31 (gradingMethodText(version, product); missing product reads as Civicsmith; "CivicOS" gives the pre-T31 bytes, pinned by SHA-256 in method.test.mjs). strength 115/115; checks format, architecture, coverage (35/35), ownership: 0 failures. Report, in the record: (1) case-checker's generated program.mjs is now stale; 2 case-checker tests fail until it is regenerated after case-grammar's L8 merge. (2) case-grammar complete.mjs calls gradingMethodText with one argument, so it renders 'Civicsmith' until its L8 R14 job passes 'CivicOS' for /6. (3) A skills R28 test (action_planning) already failed on the branch before this change; it is the skills job's.
