# law-relations (T35)

**Status** · session_01MvNbDarJEgUrb9jDF7FgTx · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (T35-78; K1961, K1967). A new module, added files only; `standards/law.mjs` stays until standards' job (T35-31) removes it.
- `bio-plane/src/law-relations/index.mjs`: `standards/law.mjs` copied whole, over the host contract (R13). The three raw reads of the `standards` table became the host reads `idsAtKey` (`addressesOf`), `idsOfKind` (`#statedIn`) and `idsCovering` (`#eventItems`); the unused `recogniseCitations` import is dropped (`recognise` is the host's, K1967). `new LawRecords(host)` throws a `TypeError` naming every read of `HOST_READS` missing, writing nothing; it creates the five tables where absent and declares them to record-core under `law-relations` (a refused declaration is a wiring defect and throws, as content's does). It imports nothing of `standards`. Exports: `LawRecords`, `LAW_RELATIONS`, `COURT_LINKS`, `TREATMENTS`, `LINK_TARGET_KINDS`, `EDITION_MAX`, `CONNECTION_KINDS`, `CONNECTION_OWNER` (`standards`, unchanged), `IN_FORCE_METHOD`, `HOST_READS`, `MODULE`, `weakestCeiling`, `LAW_CODES`, `LAW_RELATIONS_CHECKS`, `LAW_SCHEMA`, `LAW_TABLES`, `migrateLaw`.
- `checks.mjs`: the nine C-112 rows (.23, .24, .26–.32) with ids, codes and translations kept, each `where` naming this module's file; C-112.29's translation names a policy among the targets (R8); C-112.53 `LAW_RELATION_NO_EDITION` new (R9).
- `schema.mjs`: the five tables' DDL, names, columns and indexes unchanged, plus R9's nullable `law_relations.edition`, added where absent and never filled for an earlier row (K1967).
- R8: `COURT_LINKS` gains `requires`; a link ends at a statute, regulation, ordinance or policy, any type to any of the four; `CONNECTION_KINDS` gains `court_requires`, "requires".
- R9: `incorporates` joins the referential set with its `edition` (1–50 characters, trimmed), recorded and read back; `LAW_RELATION_NO_EDITION` after `LAW_RELATION_NO_CITATION` for none, blank or over 50, and for an edition on any other type; `CONNECTION_KINDS` gains `law_incorporates`, "incorporates".
- R19: `lawRelationsOf`, `addressesOf`, `stillStanding` and `neighbours` answer a relation, link or treatment only to a viewer the host's `readable` admits to both ends (an internal read, no viewer sent, reads every one).
- DEC-149 sweep: the entry names no rows for this module, and none of its strings says "the plane" or "the instance".

**Improvements made in my module.** `LAW_RELATION_SELF` is minted at one site (`refuseSelf`) instead of two inline regions (DEC-49), so its `where` names that function. `weakestCeiling` never throws on any input (R12; the copy threw on a null `standings`).

**Rows, each `awaiting stamp` (T36's promotion job; plan rule 9, red 2):**
- C-112.23, C-112.24, C-112.26, C-112.27, C-112.28, C-112.30, C-112.31: `where` re-pointed to `src/law-relations/index.mjs` (held twice until T35-31 deletes `standards/law.mjs`'s rows from `standards/checks.mjs`).
- C-112.32: `where` re-pointed to `src/law-relations/index.mjs refuseSelf > is-relation-two-ends`.
- C-112.29: `where` re-pointed, translation re-worded (R8: "a statute, regulation, ordinance or policy").
- C-112.53 `LAW_RELATION_NO_EDITION`: new (R9).

**Deferred.** None.

**Found in other modules** (for BOB; each a share of a later job, none a defect here):
- `standards` (T35-31, the removal side): its `#internal()` must add `idsAtKey(key, portion)`, `idsOfKind(kind, limit)` and `idsCovering(day)` (each in standard id order) to construct this module; and it must drop the five tables from `STANDARDS_TABLES` and its `migrateStandards` DDL before it constructs `LawRecords`, because this module now declares them under `law-relations` and `standardsOf` declares its own after constructing the instance (a second declaration answers `TABLE_DECLARED`). Its nine rows in `standards/checks.mjs` go with `law.mjs`. Its re-exports should add `LINK_TARGET_KINDS`, `EDITION_MAX` if it re-exports every name (R48).
- `control-plane` (T35-72; red 26): `CHECK_FAMILY_FILES` gains `src/law-relations/checks.mjs`; the totality test names both `checks.mjs` and `index.mjs`'s re-export of the one table.
- `membership` (N723; red 25): `MODULE_ORDER` lacks `law-relations`. This module registers no promotion step, listener or projection, so nothing it does depends on it.
- Generated artifacts (§14): none made stale; nothing bundled imports this module yet.

**Uses** (as `modules.json`): record-grammar, civil-time, connection-grammar, record-core, membership, content imported; id-spaces through the host's `recognise` (the tests pass the real `recogniseCitations`).

**Tests and checks run** (on `job/T35/law-relations`, from `tranche/T35` at 78aeba0b0d):
- `node --test bio-plane/test/m/law-relations/`: tests 25, pass 25, fail 0 (three consecutive runs). Files: `relations.test.mjs` (R1, R2, R9, R11, R14, R20), `courts.test.mjs` (R4, R5, R6, R8, R20), `reads.test.mjs` (R3, R7, R10, R12, R19, R13), `host.test.mjs` (R13, R15, R16, R17, R18), `fixture.mjs` (record-core, membership and content real; stand-in standards as bundles; no `standards` table held).
- Outside my module, my files' effect: `test/system/row-census.test.mjs` lists C-112.53 arrived and the nine rows held twice (red 2, declared above); `test/m/control-plane/totality.test.mjs` R22 fails naming `law-relations/checks.mjs` (red 26). Layer tests: none named in the manifest.
- `format`: 130 modules, 129 requirements files; 0 failures. `architecture law-relations`: 8 product files, 25 relative imports; 0 failures. `coverage law-relations`: 20 of 20 live requirement ids named by a test; 0 failures. `ownership law-relations tranche/T35`: 9 files; 0 failures.

Size (session_01MvNbDarJEgUrb9jDF7FgTx): test runs 14, module lines 944

## J1 · QUESTION

Three readings I am building on; I carry on with them unless you answer otherwise.

1. **R9's `edition` and R15's "columns unchanged".** R9 records and reads back the `edition` of an `incorporates` relation; no column of the five tables holds it. My reading: `law_relations` gains one nullable column, `edition`, added at construction where absent (`ALTER TABLE … ADD COLUMN`, never filled for an earlier row), so a store created before the split still needs no caller migration (R16). Every other name and column is unchanged. An `edition` given on a relation that is not `incorporates` is refused `LAW_RELATION_NO_EDITION` (C-112.53; its translation says only an incorporation carries one), rather than silently dropped.
2. **R8.** `COURT_LINKS` becomes `interprets, applies, holds_invalid, requires`, and a link's target kinds `statute, regulation, ordinance, policy`, independently (any link type to any of the four). `CONNECTION_KINDS` gains `court_requires`, word "requires". C-112.29's translation is re-worded to name a policy among the targets (awaiting stamp).
3. **K1961's "`recogniseCitations` the seam's default".** I read it as `standards`' constructor default (it already passes `recognise = recogniseCitations`), so this module drops the unused import and R13 requires `recognise` of the host, as R13 words it. The `id-spaces` edge stays in `modules.json` (the host's `recognise` is its reading).
