# entities (T35)

**Status** · session_01AauqX25foruEiA5tiNQTf8 · depth 2 · WORKING · handled B2

## Completion

**Entries applied** (T35-27; K1902 (2); N699, K1867, K1881).
- R50: `SECTORS` is now imported from `jurisdictions/index.mjs` (its R64) and re-exported as that same frozen list; the module's own copy is gone. `sectors()`, `createEntity`'s sector check, `setSector` and `UNKNOWN_SECTOR` (its `sectors` and detail) all read it.
- R51: `entitiesOfKind({kind, limit, after, viewer})`. Refusals in order: `NO_KIND`, `UNKNOWN_KIND` (with `kinds`, the closed list), `VIEWER_MISSING`. A viewer `viewerPredicate` does not recognise (scope DENY) answers `count: 0`. Every recognised viewer sees every entity of the kind (C6). Each entity is `{entity_id, kind, label, note, sector (organisation kinds only, `undetermined` when unset), declared_by, at}`, in `entity_id` order after `after`. `limit` is clamped to 1–500, default 100 (`KIND_LIMIT_DEFAULT`, `KIND_LIMIT_MAX`, K1881), and published. `truncated` is measured by reading one past, and `next` is the last id or null. It is one read on the existing `entities_kind` index, writes nothing, and answers `UNREADABLE` instead of throwing. `op=entitieskind` (`kind`, `limit`, `after`, `viewer` from the query) joins `entitiesOps` (R40).
- DEC-149 sweep: entities has no rows ("Modules with nothing to change").

**Readings made (no QUESTION needed).** `after` that is not a string starts from the first entity. A non-numeric `limit` reads as the default, and a fractional one is truncated. `UNKNOWN_KIND` is answered before the viewer is judged, as R51 orders it.

**Deferred.** None.

**Found in other modules.**
- Generated artifact made stale (§14): `bio-plane/dist/bio-plane.bundled.mjs` bundles `entities/index.mjs`.
- Shares already named for later STARTs: `op-declarations` (T35-70) declares `entitieskind`, and `control-plane` (T35-72) routes it as a member read; `setup-page` (T35-68) reads it for R20.

**Tests and checks run** (on `job/T35/entities` at tranche base cde40eb421):
- `node --test bio-plane/test/m/entities/`: pass 93, fail 0. New `t35.test.mjs` covers R50 and R51 (a negative control per refusal, an unrecognised viewer, a page boundary, member and `class:` offices, the op). `ops.test.mjs` drives `entitieskind`.
- Users of entities (34 modules): every failure is also red on `origin/tranche/T35` with the same tests. That is standards 1 (red 25), leg-earning 1, basis-versions 1, following 1, op-declarations 3 (red 9, plus R19/R6 red on base), control-plane 1 (red 19), plane 6 (red 22). The base had more control-plane and plane reds than this branch. Nothing new.
- `format`: 130 modules, 129 requirements files; 2 failures (law-relations' paths, inherited red 24). `architecture entities`: 16 product files, 47 relative imports; 0 failures. `coverage entities`: 51 of 51 live ids named by a test; 0 failures. `ownership entities tranche/T35`: 4 files; 0 failures.

Size (session_01AauqX25foruEiA5tiNQTf8): test runs 4, module lines 1922

## J1 · COMPLETE

T35-27 applied: R50 (SECTORS imported from jurisdictions, no copy held) and R51 (entitiesOfKind, op=entitieskind; limit 1-500, default 100). entities 93/0; coverage 51/51; architecture, ownership 0 failures; format's only failures are inherited red 24. Users' suites: no new failure (every red is also red on tranche/T35). Stale artifact: the plane bundle. Shares already named: op-declarations T35-70 declares entitieskind; control-plane T35-72 routes it; setup-page T35-68 reads it. Record: build/jobs/T35/entities.md on job/T35/entities.

## Completion (B2 · CHANGE, K1972)

**Applied.** I merged `tranche/T35` (fe0b3eb3e1) and built R52: `namingIn({captureShas, kinds, limit, viewer})`.
- Kinds are refused as R51 refuses them (`NO_KIND`, `UNKNOWN_KIND`). An empty or missing capture list is `NO_SHA` (extraction's `noSha`). More than 200 distinct captures is `TOO_MANY_CAPTURES`.
- It makes one read of the named captures' `reading_ref_terms` rows, with the viewer's gate inside the read. A capture the viewer cannot see is in no figure.
- R17's candidate loop is now one private rule, `#namingCandidates`. `namingDocuments` feeds it from its SQL, unchanged in behaviour (its tests are unchanged and pass). `namingIn` feeds it from the one read. Both answer by the same code.
- The answer is `{ok, kinds, captures, entities, candidates, count, limit, truncated, detail}`.
  - `entities`: every entity of the kinds in id order, each with `names_used`, `names_unusable`, `names_uninformative` and `count`.
  - `candidates`: R17's candidates entity by entity in R17's order, each with its `entity_id`, cut at `limit` (1–500, default 200) with `truncated` measured by reading one past.
- No op was added; none is required.

**Reading made (BOB may overturn).** "Over the references of the given captures only" is read as the corpus too. Selectivity and `names_uninformative` are measured over the named captures the viewer can see, so the answer is what R17 would give were those captures the whole corpus. The test is built on that: R52 in a world that also holds other captures equals R17 in a world holding only the named ones. If BOB means the whole corpus as R17's denominator, only the source's `corpus` and `reach` functions change.

**Tests and checks** (on `job/T35/entities` after the merge):
- `node --test bio-plane/test/m/entities/`: pass 95, fail 0. The two new R52 tests in `t35.test.mjs` cover equality with R17 per entity, sight, an uninformative name, each refusal, the 200-capture bound and the page.
- Retrieval: pass 139, fail 0.
- `format`: 130 modules; 0 failures. `architecture entities`: 0 failures. `coverage entities`: 52 of 52 live ids named by a test. `ownership entities tranche/T35`: 0 failures.
- Stale artifact (§14): the plane bundle, as before.

Size (session_01AauqX25foruEiA5tiNQTf8): test runs 8, module lines 2018
