# case-authoring (T31)

**Status** · session_01HNgAFdfDCrMf2zid6uorgB · depth 2 · WAITING ON BOB (J3) · handled B2

## Completion

**Entries applied.** N538: R14 (writes `bio-case-document/7`). The document's `format:` line is `publication`'s re-export of `case-grammar`'s `CASE_DOCUMENT_FORMAT` (R14; `document.mjs` `caseDocumentText`), so it writes `/7` as soon as case-grammar's R1 makes that constant `/7`; no second spelling of the format is added here (P15). Changed: the R14 tests now name `/7` literally — `document.test.mjs` (the R14 arm asserts the stored `format:` is `bio-case-document/7`), `carries.test.mjs` (`/7` with `caseDocumentRequiresMaterials` true, as for `/6`), `tensions.test.mjs` (`/7`, read back through `caseTensionsOf`); the stale `/5` comment on `caseDocumentText` and the `/6` header of `carries.test.mjs` corrected. No product name is rendered by this module (`grep CivicOS` over its paths: none), so K1365 (1)'s name-by-format is case-grammar's R14 and strength's alone.

**Dependency (merge order).** The three `/7` assertions are red on this branch alone and green once case-grammar's R1 lands before it (L8 merges in `modules.json` order; case-grammar first, this module last). Proved in a scratch worktree of this branch with only `case-grammar/formats.mjs` changed as R1 states (`/7` current, `/6` accepted, every predicate holding for `/7` as for `/6`): 122 of 122 pass, the pre-flight's `ratification.caseRatifyPreflight` arms included (ratification and publication read the format through the constants). Not yet run against case-grammar's own branch: at completion it had pushed only a `QUESTION` (J1). If its constant or predicates differ from R1, BOB's `CHANGE` re-opens this.

**Deferred.** None.

**Found in other modules.** None beyond what T31 already holds (case-grammar R1, ratification and publication's `/7` reads).

**Tests and checks.**
- `node --test test/m/case-authoring/` on `tranche/T31` before the change: 122 pass, 0 fail.
- after, on this branch: 119 pass, 3 fail (the three `/7` assertions; the dependency above).
- after, with case-grammar R1 simulated: 122 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs . case-authoring`: 0 failures. `checks/coverage.mjs . case-authoring`: 39 of 39 live ids named; 0 failures. `checks/ownership.mjs . case-authoring tranche/T31`: 0 failures.

Size (session_01HNgAFdfDCrMf2zid6uorgB): test runs 4, module lines 2925

## J1 · COMPLETE

N538 R14 applied: the document writes case-grammar's CASE_DOCUMENT_FORMAT (through publication), so it writes /7 once case-grammar R1 lands; the R14 tests (document, carries, tensions) now name bio-case-document/7 literally. On this branch alone those 3 are red (119/122); with case-grammar R1 simulated in a scratch worktree, 122/122 green, pre-flight arms included. Merge after case-grammar (modules.json order already does). Checks format, architecture, coverage (39/39), ownership: 0 failures. Record: build/jobs/T31/case-authoring.md.

## B2 · CHANGE (case-grammar merged, K1382)

Merged `tranche/T31` (case-grammar R1 `/7`). `node --test test/m/case-authoring/`: 122 pass, 0 fail (the three `/7` arms green against case-grammar's own code). Checks format, architecture, coverage (39 of 39), ownership: 0 failures. Waiting for publication, network-notices, ratification and case-import to merge before COMPLETE again (B2).

## J3 · REPORT

B2 done: tranche/T31 merged (case-grammar /7); case-authoring tests 122/122 green, checks 0 failures. Will post COMPLETE once publication, network-notices, ratification and case-import (my same-layer providers) are merged and I re-run on your CHANGE.
