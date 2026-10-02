# skills (T23)

**Status** · session_015eX5NoPCBpnBZAoA4ASL2u · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.**
- N485 (K1025, K1035): R31, the `edition_statement` layer (`skilldoctrine.mjs` `editionStatementLayer`, `EDITION_STATEMENT_CLAUSES`, `EDITION_STATEMENT_ACTS`, `PUBLICATION_SOURCE`, `EDITION_STATEMENT_SECTION`): authored, R31's `load_when`, the two §5A clauses (found by R21's normaliser), the acts `whatchangedpropose` (case-authoring R39), `publish` (case-authoring R38) and `caseratify` (ratification R2) read from `published.catalog` by id; a stated absence in R9's form with no `whatchangedpropose`. R5: the layer in `disclosed` after `filing_drafting`, before `recipes` (`skillpack.mjs`, with `SOURCING.edition_statement` / `edition_statement_unpublished`). R1: with `whatchangedpropose` published, a missing `publish` or `caseratify` throws naming it.
- N498 (K1089): `standardadopt`'s `defined_by` is `standards R10`; `planning.test.mjs` pinned the old string and moved with it.

**Improvement in my own module.** The three act-reading layers (R28, R30, R31) now share one catalogue lookup and one act reader (`catalogueById`, `actReader`) in place of three copies; their refusal wording is unchanged.

**Deferred.** None.

**Found in other modules.**
- skills' own requirement R28 still reads `standardadopt` (`standards` R9); N498 says R10. The text is BOB's.
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is STALE by this change (`fleetbundles.test.mjs`: `skilldoctrine.mjs` and `skillpack.mjs` changed; it matched HEAD before). The `agent-worker`, `ocr-worker` and `pdf-worker` bundles PASS (no staleness). Regenerated nothing.

**Tests and checks.**
- `node --test bio-plane/test/m/skills/`: tests 49, pass 49, fail 0 (new `edition.test.mjs`: R31 R5; R31 acts/R23; R31 R1 with controls; R31 R9; R31 R16 R24 R26). Mutation control: with `actReader`'s throw disabled, `edition.test.mjs` fails 1 of 5.
- Users: control-plane `affordances-pack`, `catalogue-end`, affordances `plane`, ai-runs `converts`, run-rules `rules`: tests 49, pass 49, fail 0. `agent-worker/test/`: tests 8, pass 8, fail 0.
- Whole `bio-plane/test/m`: tests 5044, pass 5029, fail 3, all accepted by name: control-plane `inbox-door.test.mjs`:81 (red 9); queue `catalogue.test.mjs`:34 R1 and :116 R5 (red 13).
- `node bio-plane/test/system/fleetbundles.test.mjs`: fail 1, the plane bundle stale (above).
- `format`: 87 modules, 86 requirements files; 0 failures. `architecture skills`: 8 product files, 46 relative imports; 0 failures. `coverage skills`: 31 of 31 live requirement ids named by a test; 0 failures. `ownership skills tranche/T23`: 0 failures.

Size (session_015eX5NoPCBpnBZAoA4ASL2u): test runs 12, module lines 1896

## J1 · REPORT

Users re-tested: control-plane affordances-pack, catalogue-end; affordances plane; ai-runs converts; run-rules rules: 49/49 pass. agent-worker/test: 8/8 pass. Whole bio-plane/test/m: 5044 tests, 5029 pass, 3 fail, all accepted by name: control-plane inbox-door.test.mjs:81 (red 9); queue catalogue.test.mjs:34 R1 and :116 R5 (red 13). No other red. Generated artifacts: fleetbundles.test.mjs finds the plane bundle bio-plane/dist/bio-plane.bundled.mjs STALE by this job (skilldoctrine.mjs, skillpack.mjs; it matched HEAD before); agent-worker, ocr-worker and pdf-worker bundles PASS. Regenerated nothing. Requirements: skills R28 still names standardadopt as (standards R9); N498 makes the code standards R10, so R28's text wants the same change (yours).
