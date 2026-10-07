# jurisdictions (T35)

**Status** · session_016ugHTajUHdmuCsGKMnbB4L · depth 2 · COMPLETE · handled B3

## Completion

**Entries applied (T35-1; N638, N700; K1713, K1742, K1868, K1902, K1916 (2), K1918 (1); DEC-145 (8)).**
- R23: `standard` is a seventh kind, exported with the six as `STANDARD_SOURCE_KINDS`, which validate and `law_ranks` accept; `SOURCE_KINDS` is unchanged (K1902 (1)).
- R31, R64: a statute, regulation, ordinance or court entry needs a level (`LEVEL_UNKNOWN`); a policy, commitment or standard carries one only for a government at one of the four, else its `sector` (`SECTOR_UNKNOWN`, naming the list, for neither or a sector outside it); a level beside a sector other than government is `VALUE_INVALID`; `SECTORS` (K1453's eight) exported. An entry with no level stays without one in the view.
- R63, R65: `series {key, label}` with the issuer's `key`; the `cite` has a named group `number`, optionally `portion`, and `edition` on a `standard` only; `normal` is R3's parts over the cite's groups (integer group indices, as R3), given only with a series. Refusals `SERIES_INVALID` naming the field (no key, a bad series key or label, no number group, an edition on a non-standard, a family twice, a normal with no series) and `NORMAL_INVALID`.
- R66 with K1916 (2): standard sources unioned; a family's `series.label`, `cite` and `normal` under `key`/`series.key`, and `level` and `sector` under `source`/`issuer` (a level alone reads government), one value per key; a conflict's `at` is `standard_sources[<key>/<series.key>].<field>` (or `[<source>/<issuer>]`), a family in conflict dropped from the view whole, a level or sector withheld from its entry.
- R67: the first profile holds six families, each measured on its primary pages 2026-10-07 (basis `2026-10-07 policies`; the pages read, every citation and header line measured are in `jurisdictions/test/fixtures/policies.mjs`, the measurement's record): the City's Administrative Instructions (City Administrator, `city`); OPD's Departmental General Orders, Special Orders and Training Bulletins (Office of Chief of Police, `city`; DGO and TB numbers with a normal form: `K-03` and `K-3` one, `I F.06` read `I-F.06`; DGO's printed portion `K-03: II C`); OUSD's Board Policies and Administrative Regulations (sector government, no level). Sources: OPD's public PowerDMS directory (289 documents read through its own API; one document per family read whole), the City's AI 123 PDF, OUSD's board-policy portal and BP 5124. **No standard designation is held:** no page read names one Oakland adopts (the City Auditor's 9-1-1 audit names NENA's standards with no designation); absent, never invented. No family waits: all five named were sourced.
- R68: the test profile holds a government series at a level with a padding-removing `normal` (Harbour Standing Orders), one at no level (sector government), a company's, a `standard` whose designation reads an `edition`, and its own `policy_headers`.
- R69: `vocabulary.policy_headers {field, pattern, basis}`, `field` from the nine (`POLICY_HEADER_FIELDS`), unioned; the first profile's 13 labels measured on the families' headers (SUBJECT, NUMBER, REFERENCE, EFFECTIVE, SUPERSEDE, Effective Date, (Evaluation) Coordinator, Evaluation Due Date, Automatic Revision Cycle, Index as, Index Number, and each family's type line).
- R37 (N700): `isLocale` exported, the same reading validate gives `locale.value`; never throws.
- R23, R36 tests: my own tests that pinned "every entry a level" now read R31 as amended (J1, answered by K1918 (1)).

**Deferred.** None.

**Found in other modules (to BOB).** Stale generated artifact: `newgroup/dist/newgroup.bundled.mjs` embeds `jurisdictions/` (installer's `newgroup-bundle-fresh.test.mjs` (C) is red from this job's change; BOB regenerates at the layer close, mechanics §14). Every other red among the users is an accepted red (5: standards `reads` R29; 6: extraction and reading-pipeline's read/convert tests), red on `tranche/T35` too.

**Tests and checks run** (on the commit below):
- `node --test jurisdictions/test/`: tests 102, pass 102, fail 0.
- Every user of jurisdictions (43 modules from `modules.json`): pass 3040, fail 8, the 8 being the accepted reds above and the installer bundle; `tranche/T35` gives 12 fails over the same tests, none of them new here.
- `format`: 129 modules, 128 requirements files; 0 failures. `architecture jurisdictions`: 10 product files, 14 relative imports; 0 failures. `coverage jurisdictions`: 69 of 69 live ids named by a test; 0 failures. `ownership jurisdictions tranche/T35`: 7 files; 0 failures.

Size (session_016ugHTajUHdmuCsGKMnbB4L): test runs 9, module lines 6048

## J1 · QUESTION

R36 says the first profile gives every records_laws and standard_sources entry a level; R31 (amended, T35-1) and R67 say an OUSD BP/AR entry carries no level, only sector government. My reading, which I am building on: R31 as amended governs, so R36's sentence reads 'every entry R31 requires a level for carries one' (statute, regulation, ordinance, court, and a policy, commitment or standard of a government at one of the four levels); OUSD's entries carry sector government and no level. I am updating my own R23 and R36 tests to that reading. If you want R36's wording amended to match, that is yours; nothing else waits on it.

## J2 · COMPLETE

T35-1 done: R23, R28, R31, R37, R63-R69 met and tested (102/102); K1916 (2) applied (a family in conflict dropped whole); all six Oakland/OUSD families sourced on primary pages 2026-10-07, no standard designation held (none measured). Checks: format, architecture, coverage (69/69), ownership all 0 failures. Stale artifact from this change: newgroup/dist/newgroup.bundled.mjs (installer newgroup-bundle-fresh (C)), yours to regenerate. Record: build/jobs/T35/jurisdictions.md, Completion.
