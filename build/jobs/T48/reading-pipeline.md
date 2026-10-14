# reading-pipeline (T48)

**Status** · session_01T7UhAbiPhxxWq4Nm3MKfcU · depth 2 · COMPLETE · handled B1

## Completion

**Read, whole (mechanics §17):**
- Read myself, whole:
  - `build/requirements/reading-pipeline.md` (public and private parts);
  - my code: `index.mjs`, `readingprov.mjs`, `hooks.mjs` (P20; plan rule 2);
  - layer 4's row in `build/layers.md`;
  - my entry T48-17 and the plan's "Rules at the opening";
  - the tests I changed: `transcribe.test.mjs`, and the sign-in arms of `d606-perpage-ocr`, `tier2-wire` and `system/pdf-worker-binding`;
  - `credentials` R67 and R72, and `ai-accounts`' `aiAccountsOf` and `accountFor`.
- Read by a helper in this session, whole, with a digest citing each file and test title: the set measured 848 KB at START, over the limit. The helper read:
  - every other file under `bio-plane/test/m/reading-pipeline/` (14 test files and the fixture);
  - `tier-pagewise.probe.mjs`;
  - the Purpose and Provides of `ai-accounts` (R7, R11 in full), `credentials` (R67, R72 in full), `text-chain`, `format-registry`, `docprofile`, `capture-sources`, `membership` (R81, R83, R119) and `acquisition`.

  The sources stay binding. Every flaw the digest named is dealt with below or listed as deferred.

**Entry applied, T48-17:**
- **R31 (N996 §5).** `tier4Extend` reads the paying account from `transcription.accounts`, an object whose `accountFor` is `ai-accounts.accountFor` (its R7, R11). R29's answers are unchanged: the same act `{kind: "transcribe", member, project?}`, a refusal answered as given in `aiRefusal`, and `aiNote` for every other stop. `credentials` is read only when no `accounts` is handed, through T48, so the plane's transcriber (`plane/transcribe.mjs`:159, which still hands `credentials`) keeps working until T48-78 re-points it. An `accounts` that is handed but has no `accountFor` stops the AI tier, even beside a `credentials` that would answer. The docblock now names `accounts`.
- **The `transcribe` test follows.** It builds real `ai-accounts` over the same SQLite storage as record-core and membership. It never builds `credentials`, later in the order: membership's claim and password seams (its R94, R95) are test facts, as in `ai-accounts`' own tests. Every former `credentials:` hand-in is now `accounts:`.
- **New tests for R31:**
  - `NO_ACCOUNT` from the real `ai-accounts` is answered as given in `aiRefusal` and nothing is filled. Control: ann's account transcribes the asked pages, with the same act asked.
  - An absent, null, `accountFor`-less, non-function or throwing `accounts` stops with the "could not be checked" note.
  - The through-T48 alias answers deep-equal to `accounts` for three members. When both are handed, `accounts` alone is asked.

  With `tier4Extend` reading `credentials` only, 14 of the 17 transcribe tests fail, so the tests bind.
- **N1052.** The three tests sign in by `{handle: "m1"}` (credentials R67), clearing their K3192 reds:
  - `d606-perpage-ocr.test.mjs`:105
  - `tier2-wire.test.mjs`:155
  - `system/pdf-worker-binding.test.mjs`:113
- **Imports of `credentials`: none remain** in my paths or tests. `uses` can drop it. With `credentials` removed from `modules.json` locally, `architecture` reports 0 failures; that change was reverted, since it is BOB's at the merge.

**Flaws found in my own tests and fixed (P8):**
- `read.test.mjs` "R1": the test branched on whether the registered type had a reader, so only one arm ever ran. Both arms now run on the probe type, with the exact basis; the type's `parse` is restored.
- `read.test.mjs` "R8": it asserted only tier 2 and that `found` was defined. It now checks that the page keeps its still-true `image_unread` in `tier2Escalate`'s text (R23), that tier 1's undecoded markers go with its text, and that `text_undetermined` is 0.
- `read.test.mjs` "R7 R8": the title claimed that OCR discharges `image_unread`, but nothing asserted it. It is now asserted for a page filled by append and one filled by replacement (`tier3Extend`).
- `read.test.mjs` "R8 (N253)": the marker list was checked only through `text-chain.mergeTier2Text` directly. It is now checked on this module's own `tier2Escalate`, once each, whether tier 2 states the image or not.
- `pieces.test.mjs` "R23": the export list now includes `emittedFieldsOf`.

**Deferred:**
- `read.test.mjs` "R24 R22" checks R22 ("no place named") by two place names over two bases, a sample. A full check would need a list of every place. It is outside this entry and is named for BOB.
- R7, R20 and R27 are each named by one test. Each test checks the requirement fully, so no gap.

**Found elsewhere, for BOB:**
- The Uses text in `requirements/reading-pipeline.md` does not name `doctypes`, `court-doctypes` (test-only imports) or `record-core` (handed in, "no edge"), which `modules.json` `uses` lists.
- `capture-sources`' `readDriveAddress`, `driveHop` and `archiveHop` are used by `convert-chain.test.mjs` but not listed in Uses. This is wording only.
- No generated artifact is staled beyond the plane bundle, which rule 5 (5) accepts. `program.mjs` does not include this module.

**Tests and checks run:**
- My tests, the module's whole `tests` set (`test/m/reading-pipeline/`, `d606-perpage-ocr`, `tier2-wire`, `system/pdf-worker-binding`): tests 115, pass 115, fail 0.
- Users of the changed service (P11): `test/m/extraction/` and plane's `t42`, `t43`, `t44`, `t46` (the transcriber): tests 211, pass 211, fail 0.
- Checks:
  - `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
  - `node checks/architecture.mjs . reading-pipeline`: 27 product files, 86 relative imports; 0 failures.
  - `node checks/coverage.mjs . reading-pipeline`: 31 of 31 live requirement ids named by a test; 0 failures.
  - `node checks/ownership.mjs . reading-pipeline tranche/T48`: 8 files; 0 failures.
- `node checks/run.mjs` over the product:
  - format 0 failures; architecture 3276 product files, 0 failures (K2950); channels 0 failures.
  - coverage 46 failures, every one another module's not-yet-met T48 ids (rule 5 (1)); none is reading-pipeline's.

Size (session_01T7UhAbiPhxxWq4Nm3MKfcU): test runs 13, module lines 1666
