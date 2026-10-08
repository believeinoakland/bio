# case-carriage (T37)

**Status** · session_013UybDevdS9DJfUx9eqiUuX · depth 2 · RUNNING until 2026-10-08T11:56:50Z (users' tests (control-plane, plane)) · handled B2

## Reading set (mechanics §17, N739)

Read whole: `build/requirements/case-carriage.md`; the plan's "Rules at the opening" and entries T37-18, -19, -34, -41, -42; DEC-180 in `docs/development/DECISIONS.md`; K2108, K2145, K2171, K2206 in `build/rulings.md`; my module's code (`index.mjs`, `schema.mjs`) and tests (`fixture.mjs`, `hold`, `archive`, `invariants`, `rereads`), 114 KB; `image-cover`'s Purpose and public R1–R5 and its `index.mjs` interface; `case-grammar` R12 (T37 text) and its `materials.mjs` writer and reader of `obscured`; `record-core` R21, R37, R38, R46, R47, R77, R80 and `evidenceStore` (`index.mjs`:1790–1805); `membership` R43, R44, R80 (`inSight`); `record-grammar` R15 (`isMachineIdentity`). The services read are the Uses' named ones only, under 300 KB in all.

## Entries applied (T37-34)

- **R1, R8 (N768; K2145):** `files` names an item once per ref that carries it; each text is written, and each SHA-256 listed in the edition's `[{sha, held}]`, once. Two tests that pinned the old once-per-call `files` were changed to the new requirement (`archive.test.mjs` R8's two members, `hold.test.mjs` R1's held-once arm), each with a negative control.
- **R1 (N757):** a row `included: false` stating `obscured` holds its copy alone (`held: "derived"`, kind `obscured`, the copy's byte count), only when this module derived that copy from that original; else `unheld` (kind `obscured`, "the obscured copy is not held"). Nothing else of the row: no bytes, extracted text (extraction is not asked), tokens, archive or container record. `published_case_materials.held` admits `derived`: a store made before T37 is widened once in its own transaction, every row kept (SQLite cannot widen a CHECK in place).
- **R8 (N757):** every archive that holds a copy-carried photo, at any depth, is carried for no material; each walk reaching it answers it unheld ("the archive holds a photo this case carries obscured") and stops.
- **R9 `obscureMark` (async; image-cover is):** refusals in order MACHINE_CANNOT_MARK, NO_SUCH_PHOTO (not held, or no home bundle `membership.inSight` admits `by` to), NOT_A_PHOTO, MARK_MALFORMED (with `area`), STAFF_MARK_NO_REASON (with `area`), AREA_OUTSIDE (image-cover's detail relayed, `area` renumbered to this mark's own index); each writes nothing. `MARK_AREAS_MAX` 100. Then the copy is derived over every recorded area plus this mark's, and the mark and the derivation are written in one `record.transact`. Answers R10's view plus `mark`.
- **R10 `photoMarks`:** synchronous; a photo is told by its home provenance's `capture.content_type`, else the register path's extension; reads no bucket.
- **R11:** derivations are serialised per capture (a promise chain), so each copy covers every area recorded up to its mark (tested with two members marking at once). The original is read from `record-core.evidenceStore()` by digest (size by `head` first; over `COVER_MAX_BYTES` answers `refused` PHOTO_TOO_LARGE with nothing fetched) and verified against its digest. **The copy's key: `<store>/obscured/<sha256>` in the CAPTURES bucket** (`obscuredKey`, exported), with `sha256` and custom metadata `{derived: "obscured", original, label: OBSCURED_LABEL}`; never registered or written to the record. image-cover's named refusals record the mark with no copy and `refused` set; no bytes or no bucket records the mark with no copy and `refused` null (fail closed, B2). `OBSCURED_LABEL` is in `checks.mjs`.
- **R12:** `photo_marks` and `photo_copies` declared with `declareTable` (purge `clear`, expunge `none`, export `admin-only`, sight `source`, derive `stored`, `version_chain: true`; `marksDeclaration`); the module only inserts into them.
- **R13 `marksLapsed(fm)`:** an `obscured` row whose copy is not the current one (including a later refused derivation), a whole row whose photo is now `marked`; unreadable marks lapse every such row; at most 200.
- **C-141** (`checks.mjs`, `CASE_CARRIAGE_CHECKS`, six rows awaiting stamp); `caseCarriageOps` (`obscuremark`, `photomarks`; `by` and `viewer` from the query only).

Deferred: nothing.

## Found in other modules (REPORT with COMPLETE)

- **The composition root** (store-door's `plane/store.mjs`, or publication's factory, which creates this module first): pass `bucket: env.CAPTURES` and `store: () => <the own namespace>` to `caseCarriageOf`; until then no copy is held in the running plane, and every marked photo's case is refused (fail closed). B2.
- **answer-envelope** `families.mjs`: import `case-carriage/checks.mjs` (C-141) in the module order. B2.
- **plane** `docket.test.mjs`:41 (R15, R2, R23; K1643) asserts case-tensions declares directly after publication in the order of modules with purge-cleared tables; `photo_marks` and `photo_copies` are cleared by purge (R12's classes), so case-carriage, which publication's factory builds, now sits between them (25 ≠ 24). Green on `tranche/T37` without my change. The test's point (docket after publication and case-tensions, before network-notices and layer 9) still holds; the plane's job re-pins the adjacency.
- **plane** `disclosures.test.mjs`:67 (R18, R5) pins "case-carriage exports no ops map"; this job's `caseCarriageOps` (R9, R10, the ops map the START names) makes it red until the plane's L11 job re-pins it when it routes `obscuremark` and `photomarks`.
- **case-disclosures** `R6, R7: materialsJudged …` (its test 14) is red on `tranche/T37` @ `19e619535d` without my change too (case-grammar's merge, I take it), so not this job's.

## Tests and checks

- case-carriage (`bio-plane/test/m/case-carriage/`, 7 files): 48 tests, 48 pass, 0 fail (after merging `tranche/T37` @ f3f6002068 and later, with case-grammar).
- Users of this module: publication 122 tests, 121 pass, 0 fail; control-plane 180 pass, 0 fail; `test/system/migrate-released.test.mjs` 1 pass; case-disclosures 58 of 59 (its test 14, red on the tranche too); op-declarations 103 of 106 (the three of rule 6 item 11); plane 139 of 144: 64, 65 (rule 6 red 7), 141 (census row 51), and two this job makes stale, `disclosures.test.mjs`:67 and `docket.test.mjs`:41 (above).
- `node checks/format.mjs`: 136 modules, 0 failures. `architecture.mjs case-carriage`: 10 product files, 0 failures. `coverage.mjs case-carriage`: 13 of 13 live ids, 0 failures. `ownership.mjs case-carriage tranche/T37`: 0 failures.
- **P6:** 392 lines at START; now 810 (`index.mjs` 672, `schema.mjs` 97, `checks.mjs` 41).

Size (session_013UybDevdS9DJfUx9eqiUuX): test runs 16, module lines 810

## J1 · QUESTION

Three points; I carry on with each best reading.

1. **The bucket for the copy (R11).** `record-core.evidenceStore()` (R38) keys every object `<ns>/captures/<digest>`, so it reads the original but cannot hold the copy outside `captures/`. Best reading: `caseCarriageOf(host, deps)` takes `deps.bucket` (the `CAPTURES` R2 binding) and `deps.store` (the namespace, a string or function, default `"bio"`), as file-safety's `derivedKey` does, and holds the copy at `<store>/obscured/<sha>` with custom metadata `{derived: "obscured", original: <capture sha>}`. Until the composition root (store-door / publication's factory) passes them, no copy can be held; the tests pass a stand-in bucket. The handing-in is the composition root's (a REPORT for its owner).
2. **No bytes to cover.** When the evidence store or the bucket is unbound, or the original's bytes cannot be read, R9/R11 name no outcome. Best reading (fail closed): the mark is recorded, no copy is made, `copy` null and `refused` null; R10 answers `state: marked` with `copy: null`, so R1 answers a copy-carried row unheld and R13 answers a whole-carried row lapsed. The next mark (even `areas: []`) derives again. A original over `COVER_MAX_BYTES` (read by `head` first, so nothing over the bound is fetched) is answered `refused: {code: "PHOTO_TOO_LARGE"}` as image-cover would.
3. **The refusal family.** R9's refusals are "a family of this module's own": best reading C-141 (C-140 is file-safety's, the highest I find), rows C-141.1 MACHINE_CANNOT_MARK, .2 NO_SUCH_PHOTO, .3 NOT_A_PHOTO, .4 MARK_MALFORMED, .5 STAFF_MARK_NO_REASON, .6 AREA_OUTSIDE, in `case-carriage/checks.mjs` as `CASE_CARRIAGE_CHECKS`, awaiting stamp. `answer-envelope/families.mjs` must import it for the catalogue (another module's; REPORT follows at COMPLETE). If another L8 job has claimed C-141, name mine.

## J2 · REPORT

Built and pushed T37-34 on B2's readings: R1/R8 (N768 per-ref files; the copy-carried row; the sealed archive), R9–R13, C-141 rows, the ops map. 41 of my 47 tests green; the 6 red (obscured.test.mjs: R1's copy row, R8's sealed archive, R13) need case-grammar's R12 `obscured` (T37-40), not yet merged. I am waiting for your word to merge `tranche/T37` after case-grammar, then I run everything and post COMPLETE.

## J3 · COMPLETE

T37-34 complete on `job/T37/case-carriage` (tranche merged @ f3f6002068 and later). Record: Entries applied, Found in other modules, Tests and checks.
- 48/48 module tests; format, architecture, coverage (13/13), ownership: 0 failures. P6: 392 → 810 lines.
- **The copy's key (for RATIFICATION R39):** `<store>/obscured/<sha256>` in the CAPTURES bucket (`obscuredKey(store, sha)`, exported), custom metadata `{derived: "obscured", original, label}`; `heldMaterialsOf` lists it `held: "derived"`.
- Users: publication 121/122 pass, 0 fail; control-plane 180/180; case-disclosures test 14 red on the tranche too; op-declarations' three of rule 6 item 11.
- **Reds this job makes, both plane's to re-pin (green on the tranche without me):** `plane/disclosures.test.mjs`:67 pins "case-carriage exports no ops map" (R9/R10's `caseCarriageOps`); `plane/docket.test.mjs`:41 pins case-tensions directly after publication among purge-cleared declarers, and the marks tables are purge `clear` (R12), so case-carriage (built by publication's factory) sits between them.
- REPORTs as B2 asked: the composition root must pass `bucket: env.CAPTURES` and `store` to `caseCarriageOf` (until then no copy is held: fail closed); answer-envelope `families.mjs` must import `case-carriage/checks.mjs` (C-141).
