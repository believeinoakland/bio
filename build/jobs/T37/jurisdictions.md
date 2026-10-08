# jurisdictions (T37)

**Status** · session_01GXf5ZNcTJXDDTB6mcusumT · depth 2 · WORKING · handled B0

## Record

**Entry:** T37-2 (N669, its share; DEC-157 (6)), R70–R73.

**Reading (mechanics §17).** START measured 539 KB, more than 300 KB. I read these whole myself: my requirements; layer 1's row and the "No jurisdiction in the product" rules in `build/layers.md`; `jurisdictions/index.mjs` (all 1,703 lines), the part of the test profile I changed, `test/helpers.mjs` lines 62–100 (`walkFacts`), the plan's T37-2, T37-30 and rules 1–7, and DEC-157. The Uses service is record-grammar's `BASIS_GRADES` (R39). This entry does not touch it, and I saw it at its import. One worker read in full the five test files (`helpers.mjs`, `jurisdictions.test.mjs`, `t33`, `t34`, `t35`, 228 KB) and wrote a summary of about 6 KB. Every statement in it cites a file and line: the tests that list sections by hand (helpers.mjs:66–97 `walkFacts`; jurisdictions.test.mjs:514, :423, :675–679, :699–700; t33:204–209; t35:50), the conventions, and the error and conflict shapes. It left out nothing that mattered. The first profile (`oakland-alameda.mjs`) was not read whole: this entry adds nothing to it, and its validity is checked by R19's test.

**Applied.**
- R70: `local_names` is a known section. `LOCAL_NAME_KINDS` is exported (`office`, `law`, `program`, `place`). Each entry, explanation and translation carries a basis. A translation's basis is a measurement (`M-<n>` or a dated entry; `TEST` in a test profile): R70 says its basis is "a measurement of it", so a ruling or `UNMEASURED` is `BASIS_INVALID` there.
- R71: `KIND_INVALID`, `LOCALE_INVALID` (through `isLocale`, R37's one reading), `VALUE_INVALID` (an empty name, text or source), `SOURCE_MISSING` (absent, empty or null), and `UNKNOWN_SECTION` for an unknown field.
- R72 in `combine`: entries are unioned under `name` and `kind`, keeping the order given and every giver's basis. Under one name and kind, an explanation or a translation in one language is one value per key, keyed by the language's canonical form (`es` = `ES`). Profiles that disagree have it withheld and reported at `local_names[<name>/<kind>].<explanations|translations>[<locale>]`.
- R73: the test profile holds one name of each kind, one explained in `en` and `es`, and an official `es` translation with its source. The first profile holds no `local_names` section: no Oakland translation is captured in the repository (searched: `MEASUREMENTS.md`, docs, build), so it is absent and undetermined, never invented.
- `test/helpers.mjs` `walkFacts` walks the new section, so the existing basis, `TEST`-only and `profile`/`bases` tests cover it. New tests are in `test/t37.test.mjs` (12, each naming R70–R73).

**My calls on details R70–R73 leave open (BOB's to overrule):**
1. Within one profile, a name of one kind given twice, or two explanations or two translations in one language under one name, is `VALUE_INVALID`. This matches R72's keys: one profile cannot disagree with itself.
2. In `combine`, a translation's value is its text. If profiles agree on the text but cite different publications, that is one translation, and its `source` values are joined with "; ", as a deadline's citations are (R29).
3. A kept explanation or translation carries its own `basis`, `profile` and `bases` (R13).

**Deferred:** none.

**Found in another module:** `installer`'s generated artifact `newgroup/dist/newgroup.bundled.mjs` is made stale by this change. The bundle includes jurisdictions' `index.mjs` and profiles. `bio-plane/test/system/newgroup-bundle-fresh.test.mjs` (C) fails on this branch and passes on `tranche/T37`. I did not regenerate it (mechanics §14). It is BOB's at layer close (`cd newgroup && npm run build`).

**Tests and checks:**
- `node --test jurisdictions/test/`: tests 114, pass 114, fail 0.
- Every user of jurisdictions' tests (modules.json `uses`): results are identical to `tranche/T37`'s baseline (capture 1 fail, five bio-plane single-file tests 1 fail each, scheduler 5, affordances 28, setup-page 5, all failing on the baseline too). The one exception is newgroup-bundle-fresh, described above.
- `format`: 136 modules, 0 failures.
- `architecture jurisdictions`: 0 failures.
- `coverage jurisdictions`: 73 of 73 live ids named by a test, 0 failures.
- `ownership jurisdictions tranche/T37`: 0 failures.

**P6:** the module is 2,894 lines without tests and 6,426 with them, of which this job added about 190 (code and data) and 200 (tests). The code alone is under 4,000. With tests it is over 4,000, as it was before this job.

Size (session_01GXf5ZNcTJXDDTB6mcusumT): test runs 9, module lines 6426
