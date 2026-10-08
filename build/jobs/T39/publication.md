# publication (T39)

**Status** · session_01WbD8jksEcAKJZvuvR4ohT8 · depth 2 · WORKING · handled B2

## J1 · REPORT

T39-11 built against case-carriage R13's `kind` field (no QUESTION; case-carriage not yet merged). Waiting on your CHANGE that case-carriage has merged, to merge the tranche and re-run against the real R13 (and add a test over the real case-carriage, as T38's).

**Built (commit on job/T39/publication).** R57/R33: `commitCaseEdition` splits `marksLapsed`'s rows: `kind: "document"` → C-122.7 `DOCUMENT_COPY_CHANGED_SINCE` (`documents`, at most 200), every other row (kind `photo`, or no kind) → C-122.6 as before (`photos`). The answer is the first refusal spread (C-122.6 when photos lapse, else C-122.7), plus `refusals`: one entry per code, C-122.6 then C-122.7, each `{reason, code, check, translation, photos|documents, detail}` — "both answered when both hold". A non-list answer stays C-122.6 "marks could not be read" (fail closed, unchanged). C-122.7's row in checks.mjs with BOB's draft translation verbatim (proposed key `document.refused.changed`; no such key in words.json yet). R67 needed no code: schedule.mjs keeps each stop entry's `code`, `translation`, `check`, `cause` as answered (a worker's read, :187–191); t39 drives it with C-122.6, C-122.7 and both.
Tests: new `t39.test.mjs` (R33, R57 ×3, R67); invariants' R33 table test now C-122.1–.7. Module: tests 139, pass 138, fail 0, todo 1 (R30, D-246). Ratification's tests (uses commitCaseEdition): 216/216. Checks: format, architecture, coverage (51/51), ownership (5 files) — 0 failures. P6: +36 lines (about 3,835).

**Found in other modules (nothing changed there):**
1. ratification R42/R67 publisher: `#publishScheduled` records a commit refusal as one `refusedStop(done)` (its index.mjs:869, schedule.mjs:184–190), from the top-level `reason`/`translation` only. When both C-122.6 and C-122.7 hold, only C-122.6 reaches the stopped edition's reasons; to keep both it would map `done.refusals` (one stop per entry). Single-code stops already keep the right code and translation in `cause`. The same applies to the immediate `op=caseratify` answer if it shows only the top-level refusal.
2. Rule 17: the new row moves CATALOG_VERSION (`src/gate.mjs`, promotion's); awaiting stamp until T40 (rule 3 item 2).
3. UX: C-122.7's words are BOB's draft; `words.json` has no `document.refused.changed` yet (UX stream's).

## J2 · COMPLETE

T39-11 complete, after B3 (tranche/T39 merged in, case-carriage T39-10 real).

**Applied.** R57/R33: `commitCaseEdition` splits case-carriage R13's lapsed rows by `kind`. `document` rows → C-122.7 `DOCUMENT_COPY_CHANGED_SINCE` (`documents`, at most 200). Every other row (kind `photo`, or no kind) → C-122.6 (`photos`), as before. The answer spreads the first refusal (C-122.6 when photos lapse, else C-122.7) and always carries `refusals`: one entry per code, C-122.6 then C-122.7, each with its rows and detail. A non-list answer stays C-122.6, fail closed. C-122.7's row is in checks.mjs with BOB's draft translation verbatim. R67 needed no code: schedule.mjs keeps each stop entry's code, translation, check and cause as answered (:187–191).
B3's fixture fix: `w.doc(id)` now records a `direct` receipt (provenance R62), so it is fetched and carried whole as captured; `w.doc(id, {fetched: false})` is a member document. t28's two hand-registered captures each get a direct receipt. Tests: `t39.test.mjs` (R33; R57 ×3 over a stand-in; R67 with C-122.6, C-122.7 and both; R57 over the real case-carriage: a member document carried whole while pending, or naming a copy that is not its current one, refused C-122.7 with nothing committed; a fetched document commits whole; after `copyBatch` derives it `clean` it commits whole). invariants' R33 table test now C-122.1–.7.

**Deferred.** Nothing. The `*(not yet met: T39)*` marks on R57 and R33 are yours to lift; both are met.

**Reading (mechanics §17 (3), K2304).** Read whole myself: `build/requirements/publication.md`; layer 8's row of `build/layers.md`; case-carriage R13–R16 (requirements) and its `marksLapsed`/`#documentState`/`documentCopy`/`copyBatch` code (index.mjs:780–1010, post-merge); provenance R47, R62 and `recordReceipt`'s signature; checks.mjs; index.mjs (whole); t37, t38, invariants tests; t28's R57 tests (:150–235); fixture.mjs :1–300. One worker read the rest in full and summarised for this task (each statement citing file:line): schedule.mjs, worker.mjs, door.mjs, schema.mjs, deliverer.mjs and every other publication test. About 1,100 words. What mattered: schedule.mjs keeps a stop's fields (:187–191), no list of C-122 ids elsewhere, and no status mapping of C-122 codes in door or worker.

**Found in other modules.**
1. (J1, forwarded by you in B2) ratification R42: one stop per entry of `refusals`.
2. ratification's tests: 216 tests, 66 pass, 150 fail on `tranche/T39` itself, identical with and without this job. Cause: its fixture fails `fixture project refused … no such table: register`. Since T39-10, publication's factory creates case-carriage, which registers its provenance listener at creation. Ratification's fixture builds no provenance `register` table. Its job's fixture needs provenance migrated, as publication's fixture does.
3. Rule 17: C-122.7 moves CATALOG_VERSION (promotion's, T40 stamp; rule 3 item 2).
4. UX: `document.refused.changed` is not yet in words.json (UX stream's); the draft words stand (B2).

**Tests and checks.** `node --test test/m/publication/`: tests 140, pass 139, fail 0, todo 1 (R30, D-246). ratification (uses commitCaseEdition): before the merge 216/216 pass; after, 66 pass and 150 fail, the same as the tranche alone (item 2). format: 139 modules, 138 requirements files; 0 failures. architecture: 29 product files, 114 relative imports; 0 failures. coverage: 51 of 51 live requirement ids named by a test; 0 failures. ownership: 7 files changed by publication between tranche/T39 and HEAD; 0 failures.

Size (session_01WbD8jksEcAKJZvuvR4ohT8): test runs 14, module lines 3835
