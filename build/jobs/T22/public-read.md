# public-read (T22)

**Status** · session_0196XwqKVE1wqYGGKbEVYBw6 · depth 2 · COMPLETE · handled B3

## J1 · REPORT

N480 applied (39d102b886): `public-read/index.mjs` :661 (`DO_PATH`, now "then in the plane's index.mjs, now `control-plane`'s"), `inband.mjs`:17 (`control-plane`'s `json()`). Found in the re-scan of my paths and re-worded the same way: `publication/worker.mjs`:7 named `legacy-index` (no such module) as the owner of `json()` → `control-plane`; `public-read/index.mjs`:10–11 and :934 named "the legacy store's op map" as where `publicReadOps` will be spread → past tense, `plane`'s store (`plane/store.mjs`:279); :126 named `rec170-manifest-pair.test.mjs` (no such file) → "(since retired)". Provenance notes kept (`worker.mjs`:4, `door.mjs`:2). `test/m/public-read/` 71 pass, 0 fail.
Stale generated artifact: these comment edits stale the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`; `fleetbundles.test.mjs` 0 pass 1 fail on my branch, 1 pass on its base). Regenerated nothing.
R3 (`what_changed`, `lens`): waiting on your CHANGE announcing case-grammar's merge, as B1 says; case-grammar's branch has no code yet.

## J2 · COMPLETE

Job complete (5fc0245de1, tranche/T22 @ 3a393f68db merged in at d7ba286ca8).

**Entries applied.**
- **R3 met (H6 (1), H9; DEC-101, DEC-103; K1019).** Its `*(not yet met: T22)*` mark can be struck (the requirements file is yours). `publishedCase` reads both from the signed document only (`state.document.text`, parsed once with record-grammar's `parseFrontmatter`), through `case-grammar`'s `whatChangedOf` and `lensOf`, imported from `case-grammar` itself. New keys on the answer:
  - `what_changed` is placed right after `ok`, `caseId`, `edition`. It is `{statement, began_as, draft, adopted_as_drafted}` for an edition above 1. Edition 1 answers null even if its document carries a block. A document without the block answers null, with nothing filled in (R13).
  - `successor` is `{edition, statement}`: the next edition's statement, read from that edition's signed document through `publication`'s `caseEditionState`. On the latest edition it is null; on a successor without a statement, `statement` is null.
  - `lens` is `{bias_acknowledgement, statements: [{bundle, id, kind, subject, text, justification, citations, withheld}], closing, print}`. The acknowledgement comes from the document's front matter. `closing` holds the two sentences the signed section prints. `print` is the signed body section, whole (the print form). The on-screen collapse is left to the reader's surface.
  - Without the blocks: `lens: null`, `lens_fingerprint` set to the frozen `bias_manifest.statements_sha`, and `lens_detail` set to `LENS_FINGERPRINT_SENTENCE` ("this edition carries only the lens's fingerprint…").
  - My own additions, under R13: a manifest that says none was in force answers `LENS_NONE_IN_FORCE_SENTENCE`; an unreadable fingerprint answers `LENS_FINGERPRINT_UNDETERMINED_SENTENCE`; no document or no case answers `LENS_NO_DOCUMENT_SENTENCE`.
  - A withheld citation is a count and is named nowhere. No row, op or table is added (R16).
- **N480.** As in J1.

**Tests** (new `test/m/public-read/edition-statements.test.mjs`, 6 tests named R3). Every document is written with case-grammar's own `whatChangedBlockLines`, `whatChangedSectionLines`, `lensBlockLines` and `lensSectionLines`. Each arm has a negative control. They cover:
- a `/5` edition 2 with both blocks, as signed (member and machine-draft origins);
- never live: a record appears at the lens statements' bundle id and `published_cases.bias_acknowledgement` is rewritten after signing, and the answer stays byte-identical apart from that live column;
- edition 1 and its successor across 3 editions, the latest quoting none;
- no "What changed" block, and a statement edited after signing (undetermined, not filled);
- no lens blocks: the fingerprint and its sentence, none in force, undetermined, and the loose bundle;
- a withheld citation counted and named nowhere.

Mutation check: each of three seeded faults turned the new tests red (answering edition 1, picking the wrong successor, a zeroed withheld count).

**Runs.**
- `test/m/public-read/`: 77 pass, 0 fail.
- Users' suites: `ratification` 181/0, `filings` 58/0, `plane` 33/0, `control-plane` 100 pass, 2 fail. The 2 are the accepted `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15, identical on `tranche/T22`.
- Whole `bio-plane/test/m`: 4870 pass, 12 fail, with no red that the tranche base lacks (both run here and their red locations compared). The 12 are all accepted by name:
  - actions `t18.test.mjs`:299
  - case-authoring `members.test.mjs`:129
  - control-plane `catalogue-end`:15, `doorbell`:310
  - accepted red 4: membership `module-order.test.mjs` R83 and `t9-notice-sight-bounds.test.mjs` R79, with promotion `registry.test.mjs`:58 (K936's R39/R45/R46)
  - queue-producers `proposals.test.mjs`
  - scheduler `plane.test.mjs`:85
- Checks: format, 86 modules, 0 failures; architecture, 26 files, 73 imports, 0 failures; coverage, 17 of 17 live ids, 0 failures; ownership, 5 files, 0 failures.

**Deferred.** None.

**Another module / generated artifact.** My changes stale the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`: `public-read/index.mjs`, `inband.mjs`, `publication/worker.mjs`). I regenerated nothing. Nothing else found in another module.

Size (session_0196XwqKVE1wqYGGKbEVYBw6): test runs 22, module lines 2242
