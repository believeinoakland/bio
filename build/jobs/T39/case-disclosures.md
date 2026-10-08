# case-disclosures (T39)

**Status** · session_017U4puvgg5SbVfxAghkjSpV · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Two findings outside my module, both from building R6's member-document arm against case-carriage R16 (not yet on the tranche; built against its stated interface, a local stub of `COPY_CLEANED_LABEL` never committed).

1. **case-authoring's tests go red once case-carriage and I merge (another module; no T39 entry).** Its fixture (`test/m/case-authoring/fixture.mjs`:278–280) composes the real case-disclosures over the real case-carriage. Measured now: with my change and today's case-carriage (no `documentCopy`), 144 of 164 case-authoring tests fail (every document reads `DOCUMENT_COPY_UNDETERMINED`, fail closed); without my change, 164 of 164 pass. After case-carriage merges, its real R16 answers every fixture document captured without a receipt (`w.doc` default) `fetched: false`, so `pending`, and a load-bearing chain is refused `DOCUMENT_COPY_PENDING` (R6 item 2). Either way case-authoring's fixture needs a `documentCopy` answer (e.g. a stand-in answering `public`, as mine does, or its documents given receipts); `photos.test.mjs`:35 builds its own `caseCarriage` stand-in with `photoMarks` only and needs `documentCopy` too. answer-envelope and plane also compose case-disclosures; I have not run their tests (larger) and will after the merge. This is required behaviour, not a flaw of mine; it needs a case-authoring change (tests only) in T39, or an accepted red.
2. **R23's wording (my requirements).** R23 says the one write this module reaches is `sources.sourceOf`'s minting. case-carriage R16 now adds a second: `documentCopy` queues a member document neither queued nor derived, inside the caller's transaction. My code comment states it; R23's text should name it (BOB's: requirements). I read it as R16 states and built on that.

## J2 · COMPLETE

T39-14 complete on `job/T39/case-disclosures` (tranche merged through B3, case-carriage included).

**Entries applied.**
- R6 member-document arm: a document `photoRead` finds no photo is asked `case-carriage.documentCopy` (its R16), read by the new `documentRead` (exported with `DOCUMENT_STATES`; an unread, malformed, `undetermined`, or `photo`-for-no-photo answer is undetermined, fail closed). In R6's order: `undetermined` → `DOCUMENT_COPY_UNDETERMINED` whichever chain reaches it; `pending` → `DOCUMENT_COPY_PENDING` and `refused` → `DOCUMENT_NOT_CLEANABLE` (with doc-clean's `refused.code`) when a load-bearing chain reaches it, else `included: false`, no `obscured`; `copy` → `included: false`, `obscured: {copy, label: COPY_CLEANED_LABEL}`; `clean`/`public` → by what is held. None of these is C-120.8. Refusals after the photos', each carrying `document` (fills `{document}`); each writes nothing of its own.
- R7: the copy row comes out of `materialRows` unchanged (original's fingerprints, origin, archived copy; `obscured`), read back by case-grammar R12.
- R22: `DOCUMENT_COPY_UNDETERMINED` C-120.20, `DOCUMENT_COPY_PENDING` C-120.21, `DOCUMENT_NOT_CLEANABLE` C-120.22 (provisional, R6's order, awaiting T40's stamp), BOB's draft words held in `DOCUMENT_WORDS` under `document.refused.clean` / `.pending` until `words.json` holds the keys. C-120.19's comment now says stamped in 1.66.0.
- R23 (B2): the seam comment names documentCopy's queueing.
- The archive clause of R6 is case-carriage R8's: this module answers materials, never an archive (stated in the method comment).

**Deferred:** none.

**Reading (K2304).** Read whole: my requirements; layer 8's row of `layers.md`; `materials.mjs`, `checks.mjs`, `index.mjs` (the code the entry changes), `fixture.mjs`, `photos.test.mjs`, `seam.test.mjs` R22/R23 parts; case-carriage R15–R17 and its `documentCopy`/`copyBatch` code; the plan entry; K2315, K2333, K2334, K2343, K2365; `plan/draft-T39-N806.md` §2–§3. Not read: the other used modules' public parts (only `documentCopy`/`COPY_CLEANED_LABEL` are new uses), my other test files and `document.mjs`/`people.mjs`/`accepted.mjs` (unchanged; their tests pass). No worker summary.

**Found in other modules (reported J1, answered B2).** case-authoring's tests: 130 of 164 red now (fixture composes the real case-carriage; documents without receipts read `pending`) → T39-18. answer-envelope: 1 red, `families.test.mjs` test 18, its C-120 pin lacks C-120.20–.22 (an L11 share). plane: 1 red, test 35 (docket build order / purge declarations), red on `tranche/T39` without my change too, so not mine (case-carriage's new tables, I read).

**Tests and checks.**
- `node --test test/m/case-disclosures/`: tests 81, pass 81, fail 0 (incl. new `documents.test.mjs`, 10 tests, one over the real case-carriage with `copyBatch`).
- format: 139 modules, 138 requirements files; 0 failures. architecture: 16 product files, 95 relative imports; 0 failures. coverage: 29 of 29 live requirement ids named by a test; 0 failures. ownership: 8 files changed; 0 failures.

Size (session_017U4puvgg5SbVfxAghkjSpV): test runs 14, module lines 2098
