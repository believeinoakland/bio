# case-grammar (T41)

**Status** · session_01GiDdoJfVAxVEHu47GsComE · depth 2 · COMPLETE · handled B2

## Completion (CASE-GRAMMAR #13)

**Entry applied: T41-34** (was T40-16a; DEC-185; D56, D58–D61, D63; K2394, K2400, K2451, K2528). Readings J1 (1)–(7) as confirmed by B2 (K2528).
- **R12 (T40)** `obscured_marked`: written flat after `obscured_label` only when handed `marked` as a boolean (`MATERIAL_OBSCURED_MARKED_FIELD`); read back as `obscured: {copy, label, marked}`, an absent one read by the label (non-null marked, null unmarked). An `obscured` that cannot be read is now written copy and label null rather than throwing (a flaw found and fixed: the writer threw on a throwing getter). `materials.mjs`.
- **R13 (T41)**: R23–R26's blocks travel inside `case.md`; no file kind added (comment in `casefile.mjs`; tested).
- **R14 (T40, T41)**: the copy line or the unmarked line picked by `marked`, then the label word for word when there is one; "The account" right after the claims (each bias-framed sentence marked, its statement named, with its kind, subject and text when the lens prints it; the four statements' rows not printed there), "What reviewers said" (the included comments and the count left out) and "Approvals" (the rule in force and each approval) right before "How to check this case yourself"; each section only when its block is carried, numbered as rendered. `complete.mjs`.
- **R23–R26** in the new `account.mjs`, exact values as R17's (`facts.mjs`' `exact`), readers gated `/6`+ and null without the block: `accountLines`, `accountOf`, `accountSectionLines`, `accountBiasMark`; `biasApplicationsLines`, `biasApplicationsOf`; `reviewCommentsLines`, `reviewCommentsOf`; `approvalsLines`, `approvalsOf`, and (K2528) `approvalSubjectSha(text)`, the SHA-256 of the document with its front matter's `approval_rule` line and `approvals:` block removed. All re-exported by `index.mjs`.

**Deferred:** none.

**Reading set (mechanics §17, K2304).** Measured over 300 KB (code ~179 KB, tests ~361 KB with the goldens). Read whole myself: `build/requirements/case-grammar.md`; layer 8's row and the publication-split section of `build/layers.md`; the Purpose and the used services of `record-grammar` (`parseFrontmatter` R6–R11, `idPattern`), `calc-grammar` (`resultKey`), `strength` (`gradingMethodText` R31); the plan's T41-34 entry, rule 4 and L8 text owed; `draft-T41-investigation.md` §1, §2 and §3.6's publishing lines; K2394, K2400, K2451; the code and tests the entry changes: `index.mjs`, `materials.mjs`, `blocks.mjs`, `formats.mjs`, `casefile.mjs`, `complete.mjs`, `facts.mjs`, `helpers.mjs`, `casefile-fixture.mjs`, `obscured.test.mjs`, `complete.test.mjs`. Two workers read the rest whole and summarised it: (1) `calculations`, `edition`, `facts`, `people`, `reference`, `standing`, `subject`, `tensions`, `timeline` `.mjs` and the ten matching tests (`calculations`, `citations`, `edition`, `facts`, `invariants`, `people`, `reference`, `sections`, `subject`, `timeline`), about 2,400 words, each statement citing file:line; (2) `casefile.test.mjs` and `formats.test.mjs`, about 1,500 words, citing file:line. Nothing they left out mattered: they named the constraints that bound the work (R7's place-name sweep over every non-function export and the fixture's edition, `invariants.test.mjs`:38–63; the exhaustive `CASE_FILE_KINDS` and format lists, `casefile.test.mjs`:246–265, `formats.test.mjs`:27; the exact-value pattern, `facts.mjs`:34–49), and each holds. The goldens (`complete-v6-golden.json`, `complete-v7-pre-t37-golden.json`) were used as pinned bytes, not read.

**Found in other modules (REPORT J2):**
- Users' tests that deep-compare `materialsOf`'s `obscured` as `{copy, label}` now see R12's `marked` (the reader's required shape, T40): case-carriage `obscured.test.mjs`:29; public-read `obscured.test.mjs`:156 and :365; case-disclosures `documents.test.mjs`:220 and `photos.test.mjs`:241; case-authoring `documents.test.mjs`:147 and `photos.test.mjs`:60. Each is a test expectation in that module's own job (case-carriage and public-read for R12's `obscured_marked`, case-disclosures and case-authoring by their CHANGE).
- Generated artifact staled: `bio-plane/src/case-checker/program.mjs` (case-checker `program.test.mjs`:19), rule 4 (14), regenerated at the layer's close.
- J1's approval circularity (review R31, ratification R49, case-authoring R68), ruled by K2528 with `approvalSubjectSha`.

**Tests and checks.**
- `node --test bio-plane/test/m/case-grammar/*.test.mjs`: tests 123, pass 123, fail 0 (104 before; new `account.test.mjs` 15, `marked.test.mjs` 4; `obscured.test.mjs`'s expectations gained `marked`).
- Users of case-grammar, this branch against `origin/tranche/T41` (pass/fail): case-carriage 63/4 vs 64/3; case-tensions 23/0 = ; publication 134/5 = ; docket 59/0 = ; public-read 154/2 vs 156/0; case-catalogue 16/0 = ; ratification 220/0 = ; case-checker 60/1 vs 61/0; case-import 88/0 = ; case-disclosures 78/3 vs 80/1; case-authoring 162/7 vs 164/5. Every added failure is listed above; the others are inherited and unchanged.
- `node checks/format.mjs`: 145 modules, 144 requirements files; 0 failures. `architecture.mjs . case-grammar`: 36 product files, 115 relative imports; 0 failures. `coverage.mjs . case-grammar`: 26 of 26 live requirement ids named by a test; 0 failures. `ownership.mjs . case-grammar tranche/T41`: 0 failures.

Size (session_01GiDdoJfVAxVEHu47GsComE): test runs 14, module lines 2,657

## J1 · QUESTION

My best readings, which I am building on now (none stops the job). Correct any you read differently.

1. **Format.** R23–R26's blocks join `bio-case-document/7` with no format bump (R1's, R10's and R22's precedent: optional fields of the current format); each reader is gated as R17's are (`caseDocumentRequiresMaterials`) and answers null for a document without its block (as R8, R9, R11), so every earlier edition reads and renders byte for byte. R13: no new case-file kind; a test proves a case file whose document carries the blocks meets the manifest rule, and a manifest naming an `account` kind departs.
2. **R23 `cites`.** Each cite is `{kind, ref, ord}`, `kind` one of `finding`, `leg`, `passage`, `material` (`ACCOUNT_CITE_KINDS`): a finding's id; a leg as its finding's id with its `ord`; a passage by its `content_id`; a material by its `materials:` ref. `ord` only for a leg, else null. Values are written exactly (R17's canonical-JSON form, `exact`), so the checker re-runs case-disclosures R30's arms over the very text. `kind` is `account` or one of the four statements, spelled `statement`, `subject_justification`, `excluded`, `what_changed` (case-authoring R65's names, snake case); `draft` (the machine draft named) is null unless `began_as` is `machine_draft`. The body section (`accountSectionLines`, under `## The Account`) prints the `account` rows in `ord` order, each bias-framed sentence followed by its mark naming its statement; the four statements' rows are carried for the check and printed where they are printed today.
3. **R24.** `target` is `leg` or `conclusion`; `ord` the leg's (null for a conclusion); `effect` one of `grade_lowered`, `leg_excluded`, `inference_refused` (inquiry-grammar R18) and `scrutiny_raised` (basis-versions R48); `from`/`to` grades, null unless `grade_lowered`.
4. **R25.** `reviewCommentsLines({comments, left_out})` writes `review_comments:` rows `{reviewer, text, at}` and `review_comments_left_out: <n>` (always stated, 0 when none left out); `reviewCommentsOf` answers `{comments, left_out}`.
5. **R26.** Two keys, since a block of rows cannot also hold a map: `approval_rule` (one exact value, `{approvers, set_by, set_at}`, or null when no rule is in force, the default) and `approvals:` rows `{by, at}`; `approvalsOf` answers `{rule, approvals}`.
6. **R14 placement.** The account right after the claims (its own section, "The account"); the included review comments ("What reviewers said") and the approvals ("Approvals") right before "How to check this case yourself"; each only when its block is carried, the sections numbered as rendered (T33-60's precedent). A bias-framed sentence is marked and its statement named by id, with its subject when the lens block prints that statement.
7. **R12 `obscured_marked`.** Written after `obscured_label` only when handed `marked` as a boolean; read back as `obscured: {copy, label, marked}`, `marked` the written boolean, else by the label (non-null true, null false).

For BOB, another module (not mine to change): ratification R49 asks that approvers approved "this case edition's document at its `doc_sha`", while R26's block (with the approvals) is written into that same document by case-authoring, so the document an approver saw cannot carry its own approval. A reading is needed in review R31 / ratification R49 / case-authoring R68 (for example, approval of the document's digest before R26's block is written, the `doc_sha` defined over the document without it). This module only carries the rows; nothing here waits on it.

## J2 · REPORT

Found in other modules (my record's Completion lists each):
1. R12's reader now answers `obscured: {copy, label, marked}` (T40, required). Users' tests that deep-compare `{copy, label}` fail on the added key, and only on it: case-carriage `obscured.test.mjs`:29; public-read `obscured.test.mjs`:156, :365; case-disclosures `documents.test.mjs`:220, `photos.test.mjs`:241; case-authoring `documents.test.mjs`:147, `photos.test.mjs`:60. Each is that module's expectation to update in its job (case-carriage and public-read for `obscured_marked`; case-disclosures and case-authoring with their CHANGE).
2. Generated artifact staled: `bio-plane/src/case-checker/program.mjs` (case-checker `program.test.mjs`:19), rule 4 (14).
Every other failure in the users' suites is inherited, the same on `origin/tranche/T41`.

## J3 · COMPLETE

T41-34 complete on `job/T41/case-grammar` @ fbf2d2e62f, `tranche/T41` merged in (B2's R26). R12 `obscured_marked`, R13, R14 (T40 and T41), R23–R26 with K2528's `approvalSubjectSha`, each tested with negative controls. case-grammar 123/123; format, architecture, ownership 0 failures; coverage 26 of 26. Users' added reds: J2. Size: 2,657 module lines (~2,550 planned), test runs 14. Ready to merge (first in L8).
