# inquiry-grammar (T51)

**Status** · session_01FVkqfj8YYFrYagPu7FJCRG · depth 2 · WORKING · handled B0

## Completion (CR-8)

**Entries applied** (requirements `build/requirements/inquiry-grammar.md`):
- **R13** `standardLegFindings(label, leg, findings)` is exported from `grammar.mjs` and from the module's `index.mjs`, its behaviour unchanged; it is the function R4's standard arm calls (`checkInquiryBasis`).
- **R19** (N1216) `golden.json` regenerated for `VERSION_NAME_MALFORMED` / C-25.36 by a step that runs `basis-versions`' `basisVersionFindings` over every corpus bundle and re-judges each bundle under every registry variant through `record.grammars()` and with none; the only existing entry that changed is `INQ-2026-0131-versions-bad` (its `versions`, `both`, `nosubject`, `none`), every other entry byte-identical. Corpus gains `INQ-2026-0133-version-name-long` (65 characters: MALFORMED, not NOT_UNIQUE) and `INQ-2026-0134-version-name-twice` (NOT_UNIQUE, not MALFORMED); a valid unique name (0129) raises neither.
- **Words (K3949, K3957, K3962)**: the 11 left findings, the 44 plain findings and the 2 test copies. In `grammar.mjs` 119 sentences and repair fragments that were still literals are now `localize('inquiry-grammar.grammar.<slug>', en, vars)` (messages and repairs of the C-2.8, C-6.1, C-15.1 arms; the brace text `{statement, effect}`, `{text, description}` and `{rel: supersedes, target: {parent}}` is plain text to `localize`, the placeholder rule matching `{name}` only). Tests: the handlist at `grammar.test.mjs` 223 is compared with the keys of the `numbers` object; `IMPORTED_LEG_MALFORMED`'s translation is compared with `word('refusal.IMPORTED_LEG_MALFORMED')`; the two repair strings and the `imported.test.mjs` 128 message are compared with `localize(id, en, vars)`.
- K3958 (civil-time's `{key, vars}` reason): no red test of mine; the `why` relayed from the earned registry (`observation.why`, `earned.why`) is still handed in as the registry gives it, a string, and interpolated as before.

**Tests added**: `t51.test.mjs` (R13 export and equality with the arm's findings, with its control; R19 both codes, the composites, and the control that no other corpus case holds either). Changed: `grammar.test.mjs`, `imported.test.mjs` (above), `corpus.mjs`, `golden.json`.

**Deferred**: none.

**Found in other modules / for BOB**
- `basis-versions`: its `registration.test.mjs` `amended()` is now a no-op (the golden carries the new code); its job can delete it (CR-9 already names it).
- Requirements: R13 and R19 still carry "*(not yet met: T51)*"; both are met now (BOB edits the requirement).
- Strings I did not convert, none a sentence a member reads: `index.mjs` 62–63, the `Error` thrown for a wiring defect (developer text); the `where` fields of the rows in `checks.mjs` (source locations); `grammar.mjs` 1748, `FORM`, the numbered-key encoding `bias_<n>_statement, …`, a wire grammar spliced into the bias sentences as a variable (it is the encoding's own spelling, K2479). `rows.mjs` and `words-unreviewed.json` are stale for the 119 new ids until BOB regenerates them at the layer close.
- A sentence I left as its own row, not a fragment: five fragment rows (`…_and_more`, `a_hunch`, `a_grade_axis_axis`, `is_not_a_published_case`, `cannot_be_checked_against_the_published_record_here`, the `…_cut_v1_against` phrase) are joined into other sentences in English order; the design stream may prefer whole sentences for translation.

**Tests and checks run**
- `node --test bio-plane/test/m/inquiry-grammar/*.test.mjs`: tests 81, pass 81, fail 0 (76 before; 5 added).
- `node --test bio-plane/test/m/basis-versions/registration.test.mjs` (reads this module's golden): tests 5, pass 5, fail 0.
- `node checks/format.mjs /home/user/bio`: `176 modules, 175 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio inquiry-grammar`: `12 product files, 49 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio inquiry-grammar`: `1 modules, 19 of 19 live requirement ids named by a test; 0 failures`.
- `node checks/words.mjs /home/user/bio inquiry-grammar`: `inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0, dev 1, unkeyed 0; 0 failures`.
- `node checks/ownership.mjs /home/user/bio inquiry-grammar tranche/T51 job/T51/inquiry-grammar`: see the push below.
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only (the new ids), no refusal naming this module.

Size (session_01FVkqfj8YYFrYagPu7FJCRG): test runs 7, module lines 2038
