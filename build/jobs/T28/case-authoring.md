# case-authoring (T28)

**Status** · session_01HnTijf8F1LJnr1J6wARkTF · depth 2 · WORKING · handled B7

## J1 · QUESTION

Four points from my reading at the START. I carry on with every other part of the entry on my best reading below; (1) and (3) decide what I build last, so I build them last.

1. **Where a finding's grading facts are recorded (K1305; `public-read` R23, `case-grammar` R13's `grading_facts` and `passages` kinds).** No requirement names the vehicle, and `public-read` R23 builds the case file "from the published projection only", whose only part from me is the signed document. **Best reading:** `publishCase` writes them into the `/6` document as a flat block `grading_facts:`, one row per leg of each finding a member's chain reaches (each member, and each inquiry reached through inquiry legs to strength's depth bound, R46), each row `{finding, ord, target, kind, role, grade, grade_axis, grade_source, ground, target_edition, answer, another_groups, origins, origins_complete, captures, author_key}` exactly as `strength.gradingFacts({inquiry, levels: null, viewer})` answers at the pin, its list and map fields (`answer`, `another_groups`, `origins`, `captures`) as canonical JSON strings (the grammar holds flat rows, K549). `levels` stays null: `recomputePair` takes levels separately, and the checker reads them from the signed attribution block. So the facts are signed, recorded at the act, and in the published projection. The block's spelling (writer and reader) would be `case-grammar`'s like every other block; until CASE-GRAMMAR #5 has one, I write it with my own line builder and say so. **Passages** (`{content_id, capture_sha, extent, quoted}`): same question; my reading is that they are mine too, as a `passages:` block, one row per leg with a content row, `quoted` the passage's text from `content`. Please confirm, or name another vehicle, and tell CASE-GRAMMAR #5 and PUBLIC-READ #9.
2. **An edge `case-authoring` → `inquiry-grammar` (index 43, earlier, P4)** for `parseImportedFindingRef` (R51: `case-import.acceptanceOf({import, edition, finding})` needs the ref's two parts). `strength.gradingFacts` already classifies a leg `kind: "imported"` with its `target_edition` (K1305 (2)); I would use that, and parse the ref with `inquiry-grammar` rather than spell its pattern a second time. Please add the edge.
3. **Size (K617; R14 suggestion "P6 (T28)").** Measured at the START: 3,426 lines. R43–R53 as I read them (materials and attestations, method, accepted work and flags, the ceremony's additions, the "Withheld" re-wording, three new body sections, (1)'s blocks) add about 700–800, so about **4,150–4,250**, past the mark. The requirements say BOB splits first at the disclosures seam (R31–R37, R43–R53). **Recommendation:** I build the new arms as separate files inside my paths (`materials.mjs` for R44–R49, `accepted.mjs` for R50–R53, beside `document.mjs`), so a later split moves whole files along that seam with no change of meaning; I report the measure at completion. If you would rather split now, name it and I stop at that seam.
4. **The one spelling of "Withheld" (R37; `publication` R51).** Today R37's unnamed row is `publication.unnamedSourceStatement`, and `publication` R51 re-derives it at the commit, so the two must be one spelling. **Best reading:** PUBLICATION #16 re-words `unnamedSourceStatement` to the label "Withheld" with R37's reason (the source has not consented to being named, and no public record names them) and the receipt's digest and time; I keep calling it. Please confirm with PUBLICATION #16.

## J2 · QUESTION

Adds to J1 (does not replace it). Two definitions R44 and R45 need that must be one spelling across this module, `publication` R57 (what the commit holds), `public-read` R23 (the case file's `extracted_text` file) and `case-checker` R4 and R8 (passages found in it, presentability). I carry on with my best reading below and change it to yours.

1. **A document's extracted text, and `text_sha`.** The record holds it as `extraction.unitsOf(captureSha)`'s units (its R36; `capture_text` is not in extraction's R58 read contract). **Best reading:** the extracted text is the canonical JSON of the units in `seq` order, each `{extent, ref, text}` (`record-grammar.canonicalJson`), so a checker can find a passage at its stated extent (`case-checker` R4); `text_sha` is its SHA-256. It is **held whole** only when `unitsOf` answers `state: "whole"` and no unit is `truncated`. A capture with no reading or a non-whole index is not held whole. The spelling of that text (one function) would best be `case-grammar`'s, beside R13's kinds; until then I write it with a function of my own and say so.
2. **Captured bytes held, and an observation's text.** **Best reading:** a capture's bytes are held when record-core's `files` row at the register's `(bundle_id, path)` for it exists, inline or by blob (`record.readFile`; whether a blob is still in object storage cannot be asked synchronously, and `publishCase` is synchronous, R18). An observation's text is its registered capture's bytes, so its `materials:` row has `kind: observation`, `sha` that capture's digest and `text_sha` null, held whole when its file row exists. `origin` is the capture's earliest captured address (`provenance` R48's `captured_locators`), `archived_copy` its co-archive locator (`attestation.attestationsOf`, else a late one, R35), each null when none.

Please confirm, or name the spelling, and tell PUBLICATION #16, PUBLIC-READ #9 and CASE-CHECKER #1 if (1) is to be theirs too.

## J3 · QUESTION

Adds to J1–J2 (replaces neither). **R48 and when a level is chosen.** An attesting member (and an observation's author) chooses a level per case edition, and only after `op=publish` has authored that edition (`publication` R17, R60: the edition must reach the observation or capture), so at authoring the level in force is almost always none. `publication` R21 re-authors the attribution section on a later choice, but not my `material_attestations:` rows, and a second `op=publish` over the same unsigned preparation is R8's `ALREADY_A_CASE_MEMBER`. So the member row I write at authoring cannot later state a level chosen after it.

**Best reading (the protective one, which I am building):** the attesting member's `material_attestations:` row states the level in force at the act, null when none is chosen, and carries the member's handle, key or signature only at `cover` or `name`; at `group`, `project` or none, it carries only what `publication`'s attribution row shows (`shown`) and, in the `capture_accounts:` block, that capture's account text with `by` and the signature null (never the handle, key or signature). The level that governs signing is the attribution section's (`case-grammar` R2 with K1315 (7)), which `publication` re-authors and `ratification` R2, R35 read; my row never states more than the member allowed. An alternative is to add the `material_attestations:` member rows to `case-grammar` R3's re-authorable sections, so `publication` R60's choice re-authors them too; that is a change to case-grammar R3 and publication R21, so it is yours. I am not blocked: I build the protective reading and change it if you answer otherwise.

## J4 · REPORT

Progress, and what I wait on. Built and pushed on `job/T28/case-authoring` (tested against CASE-GRAMMAR #5's branch in a scratch worktree, 114/114): R43 (`method:`), R44 (C-120.8; chain walk in `materials.mjs`), R45 and R48 (materials and attestations rows through case-grammar's `materialBlockLines`, anonymous attesting members unnamed per B5), R46/R47 (off-the-record = a "Withheld" `sources:` row, K1316; never refused), R49, R50–R52 (C-120.10–.13; `accepted.mjs`), R53 and R34's additions, the `/6` body sections, and R54's rows (assembled, not yet written). Rows C-120.8, C-120.10–C-120.13 are new, awaiting stamp. Measure now: 3,999 lines.

**Waiting on merges, nothing from Bob:** (1) CASE-GRAMMAR #5: R17's `gradingFactsLines`, `passagesLines` and `extractedTextOf` (not on its branch yet); my branch imports case-grammar's `/6` writers, so its tests pass only once case-grammar merges. (2) PUBLICATION #16: R60's `attributionStatements` over capture SHA-256s (K1316's capture rows in the attribution section) and `unnamedSourceStatement` re-worded to "Withheld". (3) CASE-IMPORT #1: its factory, to replace my fixture's stand-in at its R4/R9/R16 interface and my `caseImport` getter. Please send a CHANGE when those are on `tranche/T28`; I then merge, finish R54, K1316's attribution rows and the case-import wiring, and complete.

## J5 · COMPLETE

**Completion record** (job/T28/case-authoring @ bfb9f8e905, tranche/T28 @ 9ce0fedbcd merged).

**Entries applied** (N519, N520, N522; K1305, K1315–K1317, K1320, K1322):
- R14: `bio-case-document/6` through case-grammar's writers: `method:`, `materials:`, `material_attestations:`, `accepted_work:`, `accepted_work_flags:`, `grading_facts:`, `passages:`; body sections "How This Case Was Graded And Checked", "What This Case Carries", "Another Group's Work This Case Rests On"; a member's flag sentence in its block.
- R43: `method:` with strength's `GRADING_METHOD_VERSION` and promotion's `CATALOG_VERSION`.
- R44 (C-120.8), R46: each member's chain walked through inquiry legs to strength's `DEPTH_BOUND`, stopping at a ref leg (R50), as the publisher sees the record. Material is held whole when its file row exists and its extracted text (`case-grammar.extractedTextOf` over `extraction.unitsOf`) is whole with no unit cut. Supporting-only material is listed `included: false`. In `materials.mjs`.
- R45, R47, R48, R49: material and attestation rows (member, co_attestation, project register row, group row signed `case`). Off-the-record = a `sources:` row `sourceRowWithheld` reads (K1316). Its attesting member is unnamed (no `by` or signature, account text kept) unless they choose `cover` or `name`. The attribution section carries the capture's row even with no observation, and publication R60's choice re-authors the row (tested end to end). A named member's account states level `name`, so case-grammar's writer keeps its handle and signature. Sources are now read over every material reached, so a deep off-the-record capture is never named. A knock address is never written as an origin.
- R51 (C-120.10), R52 (C-120.11–.13), R53: `accepted.mjs`, plus `#acceptedWorkJudged` and `#flagsJudged`. `target_edition` is read from `basis[ord]` (K1305 (2)). `checked` stays inside the group; the flagging member is not named.
- R34: the blockers gain R44, R51 and R52. Step one gains `REPUBLISH_SENTENCE`; step two gains `accepted_work`; step three gains the flags (R53) and the "Withheld" sources.
- R37: "Withheld" is publication's `unnamedSourceStatement`, the one spelling (K1315 (8)).
- R54: `grading_facts:` from `strength.gradingFacts({inquiry, levels: null, viewer})` for each finding reached, and `passages:` with `chain` and `quoted` (the extracted unit at the content row's extent). `recomputePair` over the signed facts answers `strengthOf`'s pair (tested).
- R29: rows C-120.8 and C-120.10–C-120.13 added, with the requirements' translations.

**Catalogue rows awaiting stamp (accepted red 2):** C-120.8 `RELIED_ON_NOT_PRESENTABLE`, C-120.10 `ACCEPTED_WORK_NOT_IN_FORCE`, C-120.11 `FLAG_NOT_DISCLOSED`, C-120.12 `FLAGS_UNDETERMINED`, C-120.13 `FLAG_DISCLOSURE_NOT_STANDING`.

**Deferred, and why:**
- Wiring `case-import`'s factory. `bio-plane/src/case-import/` is not on tranche/T28 (CASE-IMPORT #1 is waiting on you). Until it is composed, `caseImport` comes from the composition (`deps.caseImport`). With none, every read of it fails closed: a ref leg is C-120.10 and its flags C-120.12. The tests use a fixture stand-in at case-import's R4/R9/R16 interface, registered with accepted-work through `strength.acceptedWork`. When case-import merges, a CHANGE lets me add `caseImportOf(host)` as the default and run the R51–R53 tests against it.

**Found in other modules (for BOB):**
- The suites outside my paths that import case-authoring show 33 failures. They are identical, test for test, on tranche/T28 itself without my branch: ratification's `converted-*` caseratify arms, public-read's R3/R19 `/5`-shaped conversions, affordances' R19, and others. None is from this job. They look like `/6`-only commit (publication R58) fallout awaiting RATIFICATION #17 and the public-read follow-ups.
- I write no generated artifact.

**Size (P6, K617, K1315 (11)):** 4,007 lines, past the ~4,000 mark (3,426 at the START). By file: `index.mjs` about 2,560, `document.mjs` about 810, `checks.mjs` 230, `materials.mjs` 125, `accepted.mjs` 85, `searched.mjs` 149, `schema.mjs` 61. The disclosures seam is ready for N529's split: `materials.mjs` and `accepted.mjs` are whole files; `#materialsJudged`, `#acceptedWorkJudged`, `#flagsJudged`, `#findingFacts` and `#withheld` in `index.mjs`; the carries and accepted body sections in `document.mjs`.

**Tests and checks:**
- `node --test bio-plane/test/m/case-authoring/`: tests 115, pass 115, fail 0. New suites `rests.test.mjs` and `carries.test.mjs`; R29's, R14's and R17's tests updated.
- No layer tests are named in `build/manifest.md`.
- `checks/format.mjs`: 95 modules, 94 requirements files; 0 failures.
- `checks/architecture.mjs case-authoring`: 22 product files, 112 relative imports; 0 failures.
- `checks/coverage.mjs case-authoring`: 54 of 54 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs case-authoring tranche/T28`: 13 files changed; 0 failures.

Size (session_01HnTijf8F1LJnr1J6wARkTF): test runs 31, module lines 4007
