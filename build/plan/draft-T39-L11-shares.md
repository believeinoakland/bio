# Draft: T39's layer-11 shares (for BOB #144)

**Status** · a worker's draft for BOB, 2026-10-08, on `tranche/T39` @ `e6e567718b` (after L10's close, K2381). Nothing committed. Sources read whole: `plan/current.md` (L11 section, rule 3), K2333, K2343, K2346, K2354, K2365, K2367, K2369–K2381, `layers.md`:17 (layer 11's row), the L11 modules in `modules.json`, and the requirements and tests named below. The code was read from `git diff origin/main...tranche/T39`.

## 1. What T39's layers 1–10 added that layer 11 could owe anything to

| kind | new or changed in T39 | source |
|---|---|---|
| catalogue rows | C-141.11 `DOCUMENT_COPY_NO_STORE` (case-carriage) | `src/case-carriage/checks.mjs`:64–66; K2377 |
| | C-120.20 `DOCUMENT_COPY_UNDETERMINED`, C-120.21 `DOCUMENT_COPY_PENDING`, C-120.22 `DOCUMENT_NOT_CLEANABLE` (case-disclosures; .21 and .22 read `DOCUMENT_WORDS`, BOB's drafts) | `src/case-disclosures/checks.mjs`:32–41, 177–195; K2378 |
| | C-122.7 `DOCUMENT_COPY_CHANGED_SINCE` (publication) | `src/publication/checks.mjs`:77–88; K2378 |
| | re-pins only, no new row: C-120.19 and C-141.7–.10 stamped 1.66.0 | `src/gate.mjs` (1.66.0 note); K2343 |
| | none: doc-clean's `CLEAN_REFUSALS` and image-cover's `STRIP_REFUSALS` carry no `check`, so no census or family reads them | `src/gate.mjs` 1.66.0 note ("T39's layer 1 added and changed no row") |
| ops | **none**. No module's ops map gained an arm (`caseCarriageOps` is still `obscuremark`, `photomarks`, `obscuremarkwithdraw`: `src/case-carriage/index.mjs`:1083–1092). `copyBatch` has no route (case-carriage R15, "the scheduler's wake; no route"). The new refusals are answered by existing ops (`publish`, `caseratify`, the scheduled publisher) | diff of `bio-plane/src`; `build/requirements/case-carriage.md`:83 |
| tables | `document_copy_queue`, `document_copies` (case-carriage R12, R15, R16), declared to purge under case-carriage's one declaration | `src/case-carriage/schema.mjs`:87–115, 128–132; `src/case-carriage/index.mjs`:1068–1072 |
| listeners and consumers | case-carriage registers `provenance.onReceipt` at creation (`c.start()`) | `src/case-carriage/index.mjs`:910–916, 1073 |
| | scheduler's `document-copy` consumer over `caseCarriageOf(ctx)`, registered with `onCopyWork` (merged, K2381) | `src/scheduler/index.mjs`:414–419, 698, 726, 737 |
| | file-safety R6 now reads `provenance.fetchedByThisCopy` (same per-host provenance) | `src/file-safety/index.mjs` (`#fetched`); `src/provenance/index.mjs`:1651 |
| words keys | none added to `words.json`; proposed keys `document.refused.clean`, `document.refused.pending`, `document.refused.changed`, `document.cleaned.label` live as BOB's drafts in code, the UX stream's to hold | `src/case-disclosures/checks.mjs`:32–41; `src/publication/checks.mjs`:79–82; `src/case-carriage/checks.mjs`:22–25 |
| dependency | `pdfjs-dist` for doc-clean R5's pdf.js oracle (N810) | K2346, K2354; `test/m/doc-clean/oracles.test.mjs`:29–38 |

## 2. Red tests in layer 11 on `tranche/T39` (run 2026-10-08)

`node --test bio-plane/test/m/<module>/`: wizard-scripts 69/0, op-grades 37/0, affordances 220/0, tasks 102/0, machinery-producers 24/0, queue-producers 80/0, notice-producers 74/0, queue 128/0, setup-page 83/0, instance-setup 130/0, op-declarations 117/0, admission 37/0, **answer-envelope 27/1**, store-door 41/0, control-plane 195/0, **plane 150/1**. Outside `test/m`: **queue's `test/conclude-project.test.mjs` 0/1**; installer `newgroup/test/` 51/0; `newgroup-bundle-fresh` and `migrate-released` 2/0; legacy-ui `civicos-ui/test/` 35/3 (the three files are `statement-ack` (N794, rule 3 item 4) and `progression-revision` and `queue-recipients`. The last two fail the same way on `origin/main`: 18 of 30 assertions, and 2 pass 10 fail. These are the carried DEC-88 reds, rule 3 item 3; K2084 "legacy-ui DEC-88 ×3").

| red | cause | owner |
|---|---|---|
| `test/m/answer-envelope/families.test.mjs`:250 (assert :256) | the C-120 pin lists C-120.1–.19, and the table now also holds .20–.22 | answer-envelope (K2378) |
| `test/m/plane/docket.test.mjs`:42 (assert :54) | case-carriage's purge-cleared tables are compared to `CASE_CARRIAGE_MARK_TABLES` only, and now also include `document_copies` and `document_copy_queue` (`CASE_CARRIAGE_DOCUMENT_TABLES`) | plane (K2377) |
| `test/conclude-project.test.mjs`:112 via `enrol` :101–103 | `memberadd` sends `token=` in the address and is refused C-38.10 `CREDENTIAL_IN_ADDRESS` (admission R20, K2166, T36). This is not a T39 change | queue (K2381) |
| ~~affordances' publication fixture (R14/R8/R18)~~ | **already cleared.** `test/m/affordances/backing.test.mjs`:363 imports `../publication/fixture.mjs`, whose `doc(id, {fetched = true})` now records a `direct` receipt (`test/m/publication/fixture.mjs`:200–214, PUBLICATION #26, K2378). affordances is 220/0, as before T39 (CASE-CARRIAGE J1: "219/1 (was 220/0)") | none |

## 3. Entries per layer-11 module

### answer-envelope: T39-19 (tests only)
- **Change.** In `test/m/answer-envelope/families.test.mjs`:250–257, extend the C-120 pin to `C-120.20`, `C-120.21`, `C-120.22`. Assert that `DOCUMENT_COPY_PENDING` (C-120.21) and `DOCUMENT_NOT_CLEANABLE` (C-120.22) decorate with `DOCUMENT_WORDS['document.refused.pending']` and `['document.refused.clean']` verbatim, the drafts that stand until `words.json` holds the keys (`src/case-disclosures/checks.mjs`:32–42). The test title gains "(T39; N806, K2333) .20–.22". Optional, comment only: `src/answer-envelope/families.mjs`:77 says C-141 is "the refusals of `obscuremark`". Since T39 it also holds `copyBatch`'s C-141.11.
- **Clears.** `families.test.mjs`:250 (K2378's accepted red).
- **Also checked, nothing owed.** C-122.7 and C-141.11 already decorate through the families read by file (`families.mjs` reads `src/publication/checks.mjs` and `src/case-carriage/checks.mjs`). No family test pins their row lists, which is why they are green. No new module has a check table (§1), so the catalogue stays total.
- **Requirement.** R7 gains one sentence for the record (BOB's wording): "(T39; N806, K2333) The rows T39 adds join their owners' families at their places, no earlier row moving: `case-disclosures`' C-120.20–C-120.22 (C-120.21 and C-120.22 reading its `DOCUMENT_WORDS` until `words.json` holds their keys), `publication`'s C-122.7 and `case-carriage`'s C-141.11." Without it, R7's existing "the rows T35 adds join their owners' families" pattern already covers the change, so the sentence can be left out.
- **Sources.** K2378; `src/case-disclosures/checks.mjs`:175–195; `build/requirements/answer-envelope.md`:28.

### plane: T39-20 (test fix, dev dependency, composition test). Merges last in L11
1. **docket fixture.** In `test/m/plane/docket.test.mjs`:14 and :54, compare against `[...CASE_CARRIAGE_MARK_TABLES, ...CASE_CARRIAGE_DOCUMENT_TABLES]` (exported, `src/case-carriage/index.mjs` re-export of `schema.mjs`:128–132). In the comment at :51, "its marks and copies" becomes "its marks, photo copies and member documents' queue and copies (its R12)". This clears `docket.test.mjs`:42 (K2377). It needs no requirement change.
2. **N810.** Add `"pdfjs-dist": "4.10.38"` (exact) to `bio-plane/package.json`'s `devDependencies` (:13) and regenerate `package-lock.json`. Both are plane paths in `modules.json`. 4.10.38 is the version the doc-clean job ran its oracle with (`build/jobs/T39/doc-clean.md`:22). Then `oracles.test.mjs`:29–38 resolves it from `bio-plane` and the pdf.js test runs instead of skipping. The regression workflow already runs `npm ci` in `bio-plane` (`.github/workflows/regression.yml`:31–36). **Requirement** R7 gets a new clause (BOB's wording): "`package.json`'s `devDependencies` also hold `pdfjs-dist` at an exact version, with its lock, so `doc-clean`'s R5 pdf.js oracle runs wherever the module tests run, never skipped for want of it (T39; N810, K2346)." **Test:** `test/m/plane/worker.test.mjs`:98, the R7 test, also asserts that `devDependencies['pdfjs-dist']` is an exact version.
3. **Composition (case-carriage's receipt listener; scheduler's `document-copy`).** No code change is needed:
   - `store.mjs`:151 builds provenance first.
   - `store.mjs`:230 builds publication with `bucket` and `store`.
   - publication's factory touches `p.caseCarriage` eagerly (`src/publication/index.mjs`:2552).
   - `caseCarriageOf` reaches the host's one provenance (`src/provenance/index.mjs`:1651), and at creation it declares the document tables and registers `onReceipt` (`src/case-carriage/index.mjs`:1062–1073).
   - The scheduler is first built at `store.mjs`:341, after that. Its `listenTo` and its owner reach the same instance through `caseCarriageOf(ctx)` (`src/scheduler/index.mjs`:726, 737). SCHEDULER #33 reached the same reading: "No plane change was needed" (job record J2).

   The requirement does not yet state this. **R18's second bullet gains** (BOB's wording): "(T39; N806, K2333) At that creation case-carriage registers its receipt listener with the one `provenance` instance (its R15, `provenance` R47), and declares its member documents' queue and copies to purge (its R12), before the first request. `scheduler` reaches that same instance, with the bucket and namespace, for its `document-copy` consumer and `onCopyWork` notice (`scheduler` R25, R9; `case-carriage` R17)." **Tests** follow the patterns of `t36.test.mjs`:138 and :176 and `disclosures.test.mjs`:142, in `disclosures.test.mjs`:
   - (a) After construction, a receipt that is not a fetch (a doorbell's `via`) queues its capture in `document_copy_queue`, and a `direct` receipt queues nothing. This is the negative control.
   - (b) With `CAPTURES` bound and a member PDF queued, one `onAlarm` answers `doccopy` with `copied: 1`, and the copy lies under `<namespace>/obscured/<sha>` in that bucket, not `DOCUMENT_COPY_NO_STORE`.

   The tests clear no red. They make R18's new clause tested (coverage).
- **Plane Uses** (`build/requirements/plane.md`:49): "`case-carriage` (N532): none directly" stays true. Append "its receipt listener and the scheduler's reach are R18's (T39)".
- **Sources.** K2377, K2346, K2354, K2381; `build/requirements/plane.md`:26, 69–73.

### queue: T39-21 (tests only)
- **Change.** In `test/conclude-project.test.mjs`:96–98, `GET` and `POST` lift `token` out of the address into `Authorization: Bearer …` before `mf.dispatchFetch`, as `test/m/scheduler/plane.test.mjs`:42–51 `send` does (admission R20, C-38.10). Every call site (:101, :188, :207, :215–219, :283–288) keeps its readable `token=` and is unchanged.
- **Clears.** `conclude-project.test.mjs` (K2381). It has been red since admission R20 (K2166, T36) and was not on any accepted list.
- **Requirement.** None. This is fixture-only, and the test's own requirements (basis-versions R22's `conclude`, queue's item arm) are unchanged.
- **Sources.** K2381; SCHEDULER #33 J2 ("Found in other modules").

### setup-words, instance-setup: T39-16a/b (unchanged)
These are already planned (K2375, starts written). They have no N806 share.

## 4. Layer-11 modules that need no entry (start no job for them)

| module | why nothing is owed | source |
|---|---|---|
| op-declarations | no new or changed op (§1). It holds no per-op refusal list (no `refusals` field in `src/op-declarations/index.mjs`). 117/0 | §1; K2378 |
| op-grades | no new op to grade. None of the new codes is a reason refusal (`JUSTIFICATION_REFUSALS`, the T38 pattern of `WITHDRAW_NO_REASON`, `src/op-grades/index.mjs`:197). 37/0 | §1 |
| affordances | its fixture red was cleared by publication's fixture (§2). No new op needs act help (`src/affordances/act-help.mjs`) or a backing. 220/0 | K2378; `test/m/publication/fixture.mjs`:200–214 |
| control-plane | no route. `copyBatch` has no op, and the new refusals pass through the existing door with answer-envelope's decoration. It has no per-code status map (no T39 code in `src/control-plane/index.mjs`). 195/0 | case-carriage R15; §1 |
| wizard-scripts, tasks, machinery-producers, queue-producers, notice-producers, setup-page, admission, store-door | none of T39's codes, tables, listeners or words reach them. All green | §2 |
| installer | green, 51/0, plus `newgroup-bundle-fresh`. The bundle is regenerated at each close (rule 3 (7)) | §2 |
| legacy-ui | its three reds are carried by name (rule 3 items 3, 4). Bob's | rule 3; K633, K1849 |

**L11 merge order (proposed):** `modules.json` order (queue, setup-words, instance-setup, answer-envelope), with plane last, as in T38 (K2300).

## 5. Doubts for BOB

1. **pdfjs-dist 4.10.38.** It may install an optional native dependency (`@napi-rs/canvas`, optional in 4.x) under `npm ci`. That does not affect the plane's bundle, because no `src` file imports it. The other oracles in `oracles.test.mjs`:25–28 (`qpdf`, `soffice`, `pdftotext`) still skip by name on the regression runner, which installs none of them. N810 covers pdf.js alone. Whether CI should install the others is a separate item.
2. **Unchecked registration.** case-carriage's factory discards `c.start()`'s answer (`src/case-carriage/index.mjs`:1073, :915). A refused `onReceipt` registration is therefore silent, not a start-up fault as the scheduler's are (`faults()`). This is case-carriage's to fix (L8, closed). If BOB wants it, it would be a T40 item, beside N816.
3. **Optional sentence.** The answer-envelope R7 sentence is optional (§3).
4. **Requirement placement.** Plane's R18 clause could instead be a new id (R30). I placed it in R18 because R18 already holds case-carriage's composition.
