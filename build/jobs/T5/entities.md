# T5 · entities — job record

**Session** ENTITIES #1, `session_01FFJSjwZY11KjjofLSWARDy`, on `job/T5/entities` (from `tranche/T5` @ `f05090bcad`). Process: civicos-process `main` @ `7549c0b6`, `roles/JOB.md`, mechanics §6, §12.2, §13, §14, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5`.

**Status** · IN PROGRESS. Entry T5-4: extract `entities` from `legacy-store` and `legacy-checks` per `build/extraction/entities.md` and `build/requirements/entities.md`, with N4, N6 (with `id-spaces` retiring its legacy adapter, R26, K35), REC-225 and every requirement marked not yet met (R8, R19, R20, R23, R25, R32).

**Read whole:** `roles/JOB.md`, PROCESS-MECHANICS §1–§16, `build/manifest.md`, `build/layers.md`, `build/requirements/entities.md`, `build/extraction/entities.md`, `build/plan/current.md`, the public parts of `jurisdictions`, `id-spaces`, `record-core`, `membership`, `provenance`, `extraction` (legacy-checks has no requirements file), rulings K1, K3, K4, K6, K23, K31, K35, K53, K61, K64, K102, K106, K120, K134, K138, K140, K141; `build/jobs/T5/content.md` (the pattern); `bio-plane/src/idspaces.mjs`; the legacy code the map names, measured again below. No snapshot branch carries built work for N4, N6 or REC-225.

## The legacy ranges, measured again (`f05090bcad`)

- `store.mjs` (42,981 lines): `idMatch` and `IDMATCH_ADDRESS_LIMIT` 18868–18959; `documentsNamingEntity`, `readingNamePlan` 19484–19809; the registry header, kinds, the term wrappers, `#refTermsSql` … `#candOrderCmp`, `createEntity` … `#entityView` 19811–20197; the recogniser header, `#GRADE_RANK` … `documentsConcerning` 20199–20616; `#strongestResolutionsFor` 21785–21799; dispatch 41953–41989 and `idmatch` 42385–42391; imports 553–555; the purge list 728–750.
- `schema.mjs` (2,784 lines): `entities`, `entity_aliases`, `entity_relations`, `resolutions` and its indexes 211–366.
- `bio-checks.mjs` (15,151 lines): `IDSPACE_CHECKS` (C-91) 14897–14925.

## Questions to BOB

- **Q1 · N6's adapter retirement is in `id-spaces`' files, which this job may not write.** The entry says `id-spaces` retires its legacy adapter (R26, K35) with N6. The adapter is the foot of `bio-plane/src/idspaces.mjs` and its test `bio-plane/test/m/id-spaces/legacy.test.mjs`; both are `id-spaces`' paths, and no `id-spaces` job runs in T5. Best reading, which I am building: `entities` stops using the adapter (the store no longer imports `idspaces.mjs`; `op=idmatch` calls the view-first services over the active profiles' view), so after this job nothing in the plane imports the adapter; its removal, R26's retirement and the test's removal are an `id-spaces` change BOB routes (to a job, or by ruling it into this one: say so and I remove them, and the ownership check will list those two files). The old battery's `rec203-idspaces.test.mjs` also imports the adapter's names (`CMS_FLOOR`, `apnStanding`, `systemOfAddresses`); moving it to the new names is `legacy-tests`' (T5-12).
