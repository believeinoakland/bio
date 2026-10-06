# case-authoring (T34)

**Status** · session_014q5tbRsMqLZiMWfEsHugGb · depth 2 · COMPLETE · handled B1

## Completion (CASE-AUTHORING #18)

**Entries applied.** T34-48 whole; T34-87's case-authoring rows.
- N596 (R56, calculations R9, case-grammar R18): each `calculations:` row's inputs are `{name, sha256}` from `read`'s `calculation.inputs[].sha`. That covers every input, not only tables: a typed figure, money, another calculation, a set, a draw and the threshold. So the row is keyed, and publication R22 commits its bytes. A calculation from before T34 has a null hash for a non-table input, so its row's inputs and key are written undetermined (case-grammar's whole-or-null), never half-stated.
- DEC-149 (N664; the 13 rows of `plan/draft-T34-dec149.md`, BASIS-VERSIONS #12's two among them).
  - Member-facing refusals now say "your group's Civicsmith". These are C-136.1's translation and CALCULATION_NOT_DISCLOSED's detail; NO_SCOPE; NOT_CONCLUDED (stance undetermined); and C-82.7's detail (two places).
  - Case-document text needs no name:
    - statement_by_stated ×3 says "before drafts recorded their authors" / "arguments that cannot be read".
    - The Bias Manifest section says "computed then", "LOCKED group-wide statement", "adopted for the group or this project".
    - The calculations section says "recomputed when the case was published".
  - Each change is named by `dec149.test.mjs` (6 tests).
- Flaws fixed in this module, found by a read of the uses' Provides:
  - (a) R57/R26: a timeline lane events answered `truncated` (its R29, R30) was signed as if whole, and a failed timeline read as empty. The body now states each cut lane and an unread timeline (`timelineBodyLines(rows, leftOut, {cut, unread})`). The front-matter block is unchanged.
  - (b) R56/workbooks R8: workbook rows were described as "recomputed at publication". They now have their own words (`WORKBOOK_STATE_WORDS`), a sentence framing the state as agreement between engines, never accuracy, and the engine named.

**Deferred.** Nothing in this module.

**Found in other modules / for BOB** (in the REPORT, J1):
1. Row census: C-136.1's re-worded translation (stamped at 1.61.0) is "changed with no record" until promotion's next stamp, as with K1750. `row-census.test.mjs` was already red on the tranche with other T34 rows.
2. Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (and its copies in `release/` and `newgroup/`), regenerated at the layer close.
3. A possible DEC-149 row missing from L5's list: `bias/index.mjs:469` lock-violation `detail` says "a LOCKED instance statement".
4. publication R66–R69/R21 (waiting editions, T34): case-authoring's requirements say nothing of a waiting edition.
   - `publishCase` derives the edition from `published_cases`, so a case with an edition waiting under R66 would author over its number. `storeCaseDocument` refuses to replace it, but the act gives no refusal of its own.
   - `acknowledgeStatement` treats a waiting document as open, since it refuses only when `ratified_at` is set.
   - Proposed: a requirement for case-authoring (refuse, or author the edition after it) in a later tranche.
5. ratification R44: `publish_at` from `caseRatifyPreflight` is not carried into R34's step 5. R34 does not ask for it; this is proposed for when the ceremony's "Publish at…" is placed.
6. Wording only: case-authoring's Uses still names `inquiry.basisFor`, now leg-earning's R4 behind inquiry's delegate. Several renderers imported from case-grammar, publication, ratification, strength and case-disclosures are not named in those modules' Provides. publication R21 spells `{case}` where the code also takes `caseId`. The `peopleLines`/`memberTieLines` import can move to case-grammar R21 once T34-88 has merged; case-disclosures keeps the names working.

**Tests and checks** (on `job/T34/case-authoring`, `tranche/T34` @ b0d9ba966a merged in):
- `node --test bio-plane/test/m/case-authoring/`: tests 145, pass 145, fail 0.
- Users of what this writes: review 35/0, publication 97 pass/0 fail (1 skipped), public-read 123/0, case-import 84/0.
- format: 127 modules, 126 requirements files; 0 failures. architecture: 0 failures. coverage: 41 of 41 live ids named; 0 failures. ownership: 0 failures.
- `row-census.test.mjs`: fail 1 (the inherited red, now also naming C-136.1; item 1).

Size (session_014q5tbRsMqLZiMWfEsHugGb): test runs 11, module lines 3315

## J1 · REPORT

**Found in other modules / for BOB** (in the REPORT, J1):
1. Row census: C-136.1's re-worded translation (stamped at 1.61.0) is "changed with no record" until promotion's next stamp, as with K1750. `row-census.test.mjs` was already red on the tranche with other T34 rows.
2. Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (and its copies in `release/` and `newgroup/`), regenerated at the layer close.
3. A possible DEC-149 row missing from L5's list: `bias/index.mjs:469` lock-violation `detail` says "a LOCKED instance statement".
4. publication R66–R69/R21 (waiting editions, T34): case-authoring's requirements say nothing of a waiting edition.
   - `publishCase` derives the edition from `published_cases`, so a case with an edition waiting under R66 would author over its number. `storeCaseDocument` refuses to replace it, but the act gives no refusal of its own.
   - `acknowledgeStatement` treats a waiting document as open, since it refuses only when `ratified_at` is set.
   - Proposed: a requirement for case-authoring (refuse, or author the edition after it) in a later tranche.
5. ratification R44: `publish_at` from `caseRatifyPreflight` is not carried into R34's step 5. R34 does not ask for it; this is proposed for when the ceremony's "Publish at…" is placed.
6. Wording only: case-authoring's Uses still names `inquiry.basisFor`, now leg-earning's R4 behind inquiry's delegate. Several renderers imported from case-grammar, publication, ratification, strength and case-disclosures are not named in those modules' Provides. publication R21 spells `{case}` where the code also takes `caseId`. The `peopleLines`/`memberTieLines` import can move to case-grammar R21 once T34-88 has merged; case-disclosures keeps the names working.
