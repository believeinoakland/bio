# entities (T22)

**Status** · session_01Pubw4dXFVoBiqgMP4yH6nq · depth 2 · RUNNING until 2026-10-02T01:25:30Z (node --test bio-plane/test/m/) · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 5; code at a059babb55).
- **(1) DEC-88: R1 met.** C-91.8 `ENTITY_NO_NOTE` is one new row in `ENTITY_CHECKS` (`checks.mjs`, after C-91.7), R1's translation word for word, `where` `createEntity > is-entity-noted`. `createEntity` asks it after `ENTITY_NO_LABEL` and before the transaction (new region `is-entity-noted`), so a refusal allocates no id and writes no entity and no alias. Refused when the note is absent, not a string, or blank (white space only). A longer note is kept cut to 2,000 characters, as before; no upper-bound refusal is added (B1). The dispatch (`entitycreate`) is unchanged; control-plane's stamp (`src/control-plane/index.mjs`:2319) passes the body whole, `note` included.
- **Own tests** send a note on every create (`ops.test.mjs`' `entitycreate` cases, `registry`, `contract`, `defects`, `naming`, `naming-convert`, `reads`, `resolve`). The exceptions are the refusal arms: R1's kind/label refusals, R1 (DEC-88), and a new `entitycreate` case through the ops map with no note.
- **Re-scan (N469, N471, N480).** One note named the deleted legacy store as live: R40's comment on `entitiesOps` ("entries of the legacy store's op map (its dispatcher spreads them in)") is now worded as `plane`'s `src/plane/store.mjs` spreading them in. Kept as provenance: `schema.mjs`:1 ("moved from `schema.mjs`"), the `index.mjs` header's "Moved from `store.mjs`…" and `counts`' "as the legacy store's `#counts` took them". There was no note naming `tools/` or the plane's deleted `src/index.mjs`. (The `index.mjs` names in `checks.mjs`/`schema.mjs` are this module's own file.)
- **Flaws found in my module:** none beyond the above.

**Deferred:** none.

**Other modules (REPORT J1):** the reds from my change are all callers or rows that B1 named (each one below). `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) are stale: `src/entities/checks.mjs` and `index.mjs` changed (behaviour). I did not regenerate them.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/entities/`: tests 65, pass 65, fail 0. New: R1 (DEC-88). Each negative control (a note absent, left out, null, `""`, white space, a number, `0`, `true`, an object, a list) is refused `ENTITY_NO_NOTE`, C-91.8, with its translation, with no id answered and the entity and alias counts unchanged. The test also checks the order (kind, then label, then note). A noted entity is created at the next id, with its note read back through R5 and R6; a 2,600-character note is kept at 2,000. C-91.8's row test (check, where, translation word for word, frozen, its own number, R31). The negative control was also run by hand: the old `index.mjs` fails the R1 (DEC-88) test.
- Users' suites: connections 104/3 (`converts-derivation.test.mjs`:141 and :206 via :143/:145/:208, `derive.test.mjs`:217 via :219); bias 54/1 (`adopt-manifest.test.mjs`:277 via :303); actions 62/1 (`t18.test.mjs`:299 via :302); scheduler 50/1 (`plane.test.mjs`:85 via :87); inquiry 163/1 (`content-legs.test.mjs`:395, content's, accepted K1047); control-plane 100/2 (`doorbell.test.mjs`:310, `catalogue-end.test.mjs`:15, accepted K1037); progressions 46/0, observation-log 60/0, retrieval 122/0, basis-versions 118/0, contradiction 101/0, intent 60/0.
- `node --test test/m/`: tests 4843, pass 4815, fail 9. These are exactly the 9 above: 6 from B1's named callers of `createEntity` (each refused `ENTITY_NO_NOTE`) and 3 accepted by name. There is no other red.
- `test/system/row-census.test.mjs`: fails; C-91.8 `ENTITY_NO_NOTE` arrived with no record (**awaiting stamp**, accepted red 3; its other moved rows are capture's and content's).
- `test/system/fleetbundles.test.mjs`: fails, bio-plane's member stale (above).
- `node checks/format.mjs .`: 85 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs . entities`: 14 product files, 36 relative imports; 0 failures
- `node checks/coverage.mjs . entities`: 41 of 41 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs . entities tranche/T22`: 11 files changed; 0 failures

**For COMPLETE:** R1 met (its `not yet met: T22` mark is BOB's to strike); C-91.8 `awaiting stamp`.

Size (session_01Pubw4dXFVoBiqgMP4yH6nq): test runs 28, module lines 1326

## J1 · REPORT

Reds and stale artifacts from my change, for acceptance by name or routing (P4), before my merge (code at a059babb55). Each createEntity caller B1 named is now refused ENTITY_NO_NOTE (C-91.8): (1) connections: test/m/connections/converts-derivation.test.mjs:141 and :206 (creates at :143, :145, :208) and derive.test.mjs:217 (:219); connections' L5 job sends the note. (2) bias: test/m/bias/adopt-manifest.test.mjs:277 (:303); bias' L5 job. (3) actions: test/m/actions/t18.test.mjs:299 (:302); L9. (4) scheduler: test/m/scheduler/plane.test.mjs:85 (op=entitycreate at :87); L10. (5) UI entityDraft() (civicos-ui/app.html ~:17128, N487) sends no note; not run. (6) row-census.test.mjs (promotion's): C-91.8 ENTITY_NO_NOTE arrived with no record, awaiting stamp (accepted red 3). (7) bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product) stale: src/entities/checks.mjs and index.mjs changed (behaviour); not regenerated. (8) Note for affordances (L11): entitycreate is in RUNG_ABSENT; its is-sentence does not mention the now-required note; nothing changed. No other red: test/m 4843 tests, 9 fail = (1)-(4) (6 tests) plus the accepted inquiry content-legs.test.mjs:395 (K1047) and control-plane doorbell.test.mjs:310 and catalogue-end.test.mjs:15 (K1037).
