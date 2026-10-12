# standards (T46)

**Status** · session_019UztuJhDzVGDoL16zsLyc7 · depth 2 · WORKING · handled B1

## Completion

**Entry applied.** T46-10 (N913; DEC-194): R55. `checks.mjs` gains `REFUSAL_WORDS`, the `en` of `words.json`'s `refusal.COMMITMENT_AS_HEARD` and `refusal.COMMITMENT_OWN_LETTER` verbatim, keyed by their keys (the `HANDLE_WORDS` / `TRANSCRIBE_WORDS` form); rows C-112.63 and C-112.64 take their `translation` from it by key. Codes, numbers, `where`s and behaviour unmoved (the refusals' `detail`, `content_ids`, `own_sending`, `as_heard` as before). `REFUSAL_WORDS` is re-exported from `index.mjs`. Both sentences were checked against START's bar: neither names the group's Civicsmith bare, and each matches what its refusal does (R52's every-row-heard; R53's own-sending-or-heard with at least one own). `words.json` on the branch is identical to `main` @ 3f40899950. No other row of the module has a `refusal.<CODE>` in the list (checked by the new test), so every other translation stands.

**Awaiting stamp (promotion R50; T46 rule 5 (2)).** C-112.63 and C-112.64, their translations changed in T46 (L5): they wait for T47's promotion stamp; the row census reads them as awaiting stamp meanwhile.

**Reading (mechanics §17).** Read whole: `build/requirements/standards.md` (public and private), every file of `bio-plane/src/standards/` (`index.mjs`, `checks.mjs`, `schema.mjs`, `instrument.mjs`, `words.mjs`) and every file of `bio-plane/test/m/standards/`, and my plan entry and rules. The used modules' public parts (17 modules, about 434 KB) were read in full by a helper in this session, which wrote me a digest citing each section (record-core R81, R82; membership R112, R123, R126, R128; promotion R34, R50; extraction R61, R71, R75; provenance R1, R3, R4, R27, R28, R48; content R16, R49; and the others found to bear nothing); the sources stay binding. Layer contract: nothing in it touches a translation.

**Flaws found in this module, dealt with.** `schema.mjs`' `migrateStandards` comment omitted the T35 columns it adds: corrected. `index.mjs`' header gains the T46 note. No other flaw found.

**Other modules and generated artifacts (reported).** No other module changed. The change stales generated artifacts I do not own (§14): the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (accepted red, rule 5 (4), regenerated at the layer's close), and the two copies holding the old sentences `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` (`RELEASE_SOURCE`, installer's / release tooling; regenerated with the release). The row census fixture `bio-plane/test/fixtures/row-census-1.73.0.jsonl` holds the old sentences; promotion's census reads the two rows as awaiting T47's stamp (rule 5 (2)). The working tree also showed `newgroup/node_modules` (a tracked self-referencing symlink) deleted by the environment; I did not stage it.

**Tests.** `node --test test/m/standards/` (from `bio-plane/`): 89 pass, 0 fail (new `t46.test.mjs`: three R55 tests, the words read by key through `test/m/standards/words.mjs`, a key the list lacks failing; a control over every other row; the refusals at the interface, R52, R53 and R10, with the body's letter landing). No layer tests named in the manifest. No provided service changed (only two rows' translations), so no user module's tests are owed.

**Checks** (from the process repository): `format`: 159 modules, 152 requirements files; 0 failures. `architecture`: 21 product files, 79 relative imports; 0 failures. `coverage`: 46 of 46 live requirement ids named by a test; 0 failures. `ownership` (against `tranche/T46`): 6 files changed by standards; 0 failures.

**Files added** inside my `tests` path only: `bio-plane/test/m/standards/t46.test.mjs`, `bio-plane/test/m/standards/words.mjs`.

Size (session_019UztuJhDzVGDoL16zsLyc7): test runs 2, module lines 3465
