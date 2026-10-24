# inquiry-grammar (T51)

**Status** · session_01B4tHNxMTJamTy5UFQiCoZy · depth 2 · WORKING · handled B7

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

## J1 · COMPLETE

CR-8 applied: R13 standardLegFindings exported; R19 golden/corpus regenerated for VERSION_NAME_MALFORMED (C-25.36); all 57 words findings converted (119 localize ids). Tests 81/81; format, architecture, coverage, words, ownership 0 failures. See Completion in my record (stale rows.mjs expected; basis-versions amended() can go; R13/R19 not-yet-met markers are BOB's to lift).

## Completion (FR-44, wave 2)

**Entry applied**: L9 (K4194) as R68, the requirement line is BOB's file (ownership refuses my writing it): its text is in my REPORT J3 for BOB to add, and the code and tests meet it. `checkGrounds` (`grammar.mjs`) leaves every `role: cuts_against` leg out of the partition: its absence of a ground is no gap in the totality, and a non-empty `ground` on one is one C-2.8 error (no code; two new `localize` ids `inquiry-grammar.grammar.basis_i_cuts_against_ground` and `...remove_the_ground_from_the_leg`) naming `basis[i]` and the label; the label then counts toward no ground. Every other basis is judged as before (golden unchanged).
**Tests** (`t51.test.mjs`, 4 added, three seen failing before the change): supporting plus cutting leg clean; supporting leg left out still refused (control); cutting leg in a ground refused with its own finding; no-cutting-leg basis as before.
**Deferred**: none.

**For FR-45 (`inquiry`) and `strength`**:
- The grammar now accepts a basis whose cutting legs carry no `ground`. `inquiry` must not label a cutting leg (its labelling at `inquiry/index.mjs` 2605-2636 should skip `cuts_against` legs and label supporting ones only), or the new finding refuses it.
- `strength/arithmetic.mjs` does not read `role`: it puts every leg with no ground label into the implicit AND-group (lines 90, 107), so an unlabelled cutting leg would join that group and weaken (or bind) the axis beside the grounds. Found, not mine to change: strength should leave `cuts_against` legs out of the arithmetic's parts (or say that it reads them elsewhere), and its requirement R4 should say so.
- Sentences are keyed in `rows.mjs` only when BOB regenerates it (the two new ids are stale until then).

**Tests and checks run**
- `node --test bio-plane/test/m/inquiry-grammar/*.test.mjs`: tests 85, pass 85, fail 0.
- `node checks/format.mjs`: 0 failures. `architecture.mjs inquiry-grammar`: `13 product files, 54 relative imports; 0 failures`. `coverage.mjs inquiry-grammar`: `20 of 20 live requirement ids named by a test; 0 failures`. `words.mjs inquiry-grammar`: 0 failures (inline 0, plain 0, testcopy 0, missingkey 0). `checks/run.mjs`: format, architecture, words 0 failures; coverage 7 failures, all in other modules (agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring).
- `ownership.mjs inquiry-grammar tranche/T51 job/T51/inquiry-grammar`: 0 failures.

Size (session_01FVBE32weVwYCP8rNDY5AVJ): test runs 6, module lines 2048

## J2 · COMPLETE

FR-44 applied: R68 written and met; checkGrounds leaves cuts_against legs out of the partition and refuses one named in a ground (own finding). Tests 85/85 (4 added, 3 seen failing first); format, architecture, coverage, words, ownership 0 failures for this module. FR-45/strength must know: inquiry must label supporting legs only; strength/arithmetic.mjs ignores role, so an unlabelled cutting leg joins the implicit AND group (see my record). R68 marker is BOB's to lift.

## J3 · REPORT

Ownership refuses my writing build/requirements/inquiry-grammar.md, so R68 is not in the file; I removed my edit (ownership now 0 failures). Please add this line to the requirements (public, leg-grammar section, marked not yet met or met as you judge), my tests t51.test.mjs name R68:

- **R68** (T51; K4194; amends R1, R4) **A leg that cuts against is never in a ground.** The totality of the grounds (C-2.8: "a basis is grouped whole or not at all") counts the supporting legs only: when any leg names a ground, every leg whose `role` is not `cuts_against` must; a `cuts_against` leg need not, and a basis whose supporting legs all name grounds is judged whole whatever its cutting legs. A `cuts_against` leg that names a ground (a non-empty `ground`) is one C-2.8 error naming the leg and the label, and the label is not counted toward a ground, so a ground that only it carried is "declared, no basis leg belongs to it" as ever. A basis with no `cuts_against` leg is judged exactly as before. The strength arithmetic's side (`strength`, `inquiry`) leaves the cutting leg out of every ground likewise. *(not yet met: T51)* Test: one supporting and one cutting leg, the first in a declared ground, is clean; control: a supporting leg left out of the partition is still refused, as is a cutting leg named in a ground (with its own finding naming the leg); a basis with no cutting leg is judged as the golden answers have it.

Until it is there, coverage cannot count R68 live (my tests name it already). Also lift the R13/R19 not-yet-met markers (met in CR-8).

## J4 · REPORT

R4 amendment (job 92) is in and pushed (commit on job/T51/inquiry-grammar), but not COMPLETE: it waits on content's job 91.

Done: grammar.mjs now imports checkContentExtent/legExtent/legHasAuthoredExtent/CONTENT_ID_RE/CONTENT_EXTENT_DOCUMENT_ONLY from content/extent.mjs (the public face, ten kinds) instead of extent-core.mjs. t51.test.mjs gained two R4 tests. Red first seen: checkLegExtentGrammar refused a doc-part footnote leg with the "not one of: document, pdf-page, ..." sentence. After the re-point: the footnote with extent_ref passes; the controls (doc-part naming neither part nor ref, and kind 'doc-prt') are refused; the whole existing suite stays green (golden unchanged).

Still red (1 test, by design, not weakened): a doc-part leg that names only `extent_part` (e.g. word/header1.xml, no extent_ref). content's core `legExtent` (extent-core.mjs) reads extent_part only under `image`, so the part is dropped and checkPart sees "neither". That is the second defect of the diagnosis, content job 91's. Please tell me when tranche/T51 carries job 91; I merge it and re-run, no change of mine needed.

For BOB (not mine to change, byte-identity of R4 pins it): the unknown-kind repair sentence still lists the eight text-chain kinds (grammar.mjs ~565, from textchain.CONTENT_EXTENT_KINDS), so it does not offer doc-part/envelope. Using content's ten changes that sentence in 7 pinned tests/golden; say if you want it as a separate entry.
Checks so far (this module): format 0, architecture 0, coverage 0 (20 of 20), words 0, ownership 0 failures. impact.mjs names 86 modules / 1478 test files (content face is widely used); I'll run the direct users after the merge.
