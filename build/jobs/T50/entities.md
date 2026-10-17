# entities (T50)

**Status** · session_01SZdSkPKdsPWvCmU3BMq2HD · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R55 reads 'kinds (person, office; another kind refused as R51 refuses it)'. Best reading: aliasesOf accepts any kind of the closed ENTITY_KINDS list (person and office are what retrieval asks) and refuses only NO_KIND / UNKNOWN_KIND exactly as R51 does, since refusing 'body' as UNKNOWN_KIND while naming a list that holds it would contradict itself. Alternative: only person and office are accepted. I proceed on the first; say if you want the second. Also: modules.json's entities row on tranche/T50 does not list setup-words in uses (K3632 says it was added); I need it for plan rule 6 (checks.mjs reads refusal.<CODE> by key). Not mine to edit; please add it.

**Read.** Whole: `build/requirements/entities.md`, my entries and the plan's rules (`build/plan/current.md`), the layer contract (`build/layers.md` table and layer rules), `bio-plane/src/entities/` (index.mjs, schema.mjs, checks.mjs), `setup-words/index.mjs`, `fixture.mjs` and the tests I changed (registry, contract, defects, idmatch, dec149, naming, t33, t35 in the parts changed); `words-reads.json`'s `entities` share. The other entities tests were run, not read.

**Entries applied (T50-59).**
- **R54.** `createEntity` takes `forum_kind` (op `entitycreate` passes the body as is) for a `body` or `institution`: another kind `FORUM_KIND_NOT_FOR_KIND`, a value outside `jurisdictions`' `FORUM_KINDS` (exported here as that same list) `UNKNOWN_FORUM_KIND` naming it and the list, both after R1's own refusals and the sector's, before an id is allocated; absent or null, none is held (null, never `other`). Stored in a new `entities.forum_kind` column (added by `migrate` to an older store). `readEntity` and `entitiesByAlias` answer it (null for any kind that cannot carry one); `createEntity` answers it for body and institution; `entitiesOfKind` takes `forum_kind` (one value or a list; an empty list or null is no filter; `op=entitieskind` takes a comma-separated string, an empty one meaning none) and refuses a value outside the list `UNKNOWN_FORUM_KIND` after the kind and before the viewer; each item of an organisation kind answers `forum_kind` (null when none). R45 unchanged: a proceeding's facet `forum_kind` stays the proceeding kind's.
- **R55.** `aliasesOf({kinds, limit, after, viewer})`: standing aliases of any kind of the closed list (B2 settled this reading, K3663), `[{entity_id, kind, label, alias}]` in entity id then alias-fold order, `limit` 1–5,000 (1,000), `truncated` by reading one past, `next` = `<entity_id>|<fold>` to pass as `after` (a bare entity id continues after that entity); an unrecognised or absent viewer gets none; `NO_KIND`/`UNKNOWN_KIND` as R51. Not an op.
- **R56.** `labelsOf({ids, viewer})`: `{ok, labels, count}`, `labels` mapping each id string as asked to `{label, kind}` or null; more than 500 ids `TOO_MANY_IDS`; ids that are no list `NO_ENTITY`; an unrecognised viewer gets every one null. Not an op.
- **R35.** The `label` column existed; the requirement now states it and a test (t50.test.mjs) pins it: the canonical label as R1 answers it, read in one query of a later module's own SQL, equal to `labelsOf` and `readEntity`.
- **Plan rule 6.** The ten refusal rows' `translation` are `word("refusal.<CODE>")` (checks.mjs); the sixteen other sentences words-reads.json lists for entities are read by key at their sites (`words.mjs` holds the `WORD_KEYS`, exported); English-comparing tests (dec149, idmatch, registry, contract, defects, naming, t33) read the keys. Refusals' `detail` strings stay in source (words-reads.json: builders' details beside a code). "labeled": the only "labelled" left is in DEC-49 region names (identifiers). "team": the keyed words say team.

**Deferred.** None.

**For BOB (REPORT).**
1. Sentences no key holds (for the design lane): `the name`, the third word of the recogniser's `considered` list (`entities.considered.*` holds only the composite key and the source key); R47's connection kinds' words (`proxy for`, `member of`, `overlaps`, made from the relation's name until the design gives them, R47's Suggestions).
2. New refusals `UNKNOWN_FORUM_KIND` and `FORUM_KIND_NOT_FOR_KIND` have no catalogue row or word key, as `UNKNOWN_SECTOR` and `NOT_AN_ORGANISATION` have none; the "Add a court" screen (T50-29, T50-33) draws them from the answer's `detail` unless the design gives `refusal.*` keys and a row is added. The court-kind labels for N1190 are the design's.
3. Users of entities (the 41 modules in `modules.json`): their tests fail exactly as at `tranche/T50` (standards 3, duties 1, inquiry 1, case-disclosures 2, consequences 2, conformance 3, escalation 2, op-declarations 9, answer-envelope 3, store-door 1, affordances 4, instance-setup 1, scheduler 1, plane 1: the same 46 test names as at the base, run in a clean worktree); none is entities'. The rest pass.
4. Stale until the layer close: the plane bundle and `program.mjs` (the plane bundles entities).
5. Rows: no catalogue row added or changed except the ten `translation`s, now the keys' words ("team"): they wait for T51's stamp (rule 5 (2)).

**Tests and checks.** entities: 118 tests, 118 pass (t50.test.mjs 19; changed: registry, contract, defects, idmatch, dec149, naming, t33, t35). From the process repository over `.`: `format` 171 modules, 0 failures; `architecture entities` 20 product files, 0 failures; `coverage entities` 56 of 56 live ids named, 0 failures; `ownership entities tranche/T50` 0 failures; `checks/run.mjs .`: format 0, architecture 0, channels 0; coverage 30 failures, none entities' (the other modules' not-yet-met ids).

Size (session_01SZdSkPKdsPWvCmU3BMq2HD): test runs 9, module lines 2199

## J2 · COMPLETE

COMPLETE J2: T50-59 entities done on job/T50/entities (details in build/jobs/T50/entities.md).
R54 forum_kind (createEntity/entitycreate, readEntity, entitiesOfKind filter + item field; UNKNOWN_FORUM_KIND, FORUM_KIND_NOT_FOR_KIND before any id; new entities.forum_kind column, migrated); R55 aliasesOf; R56 labelsOf; R35 label stated and pinned by test; plan rule 6 (10 rows and 16 sentences by key).
Provider for retrieval (T50-10) and explore (T50-63): aliasesOf({kinds, limit, after, viewer}) -> {ok, aliases:[{entity_id,kind,label,alias}], count, limit, truncated, next}; labelsOf({ids, viewer}) -> {ok, labels:{id:{label,kind}|null}, count} or TOO_MANY_IDS.
Tests: entities 118/118; format, architecture, coverage (56/56), ownership 0 failures; users of entities fail exactly as at tranche/T50 (46 same names, clean worktree). Stale until layer close: plane bundle, program.mjs.
REPORT items in my record: sentences no key holds (the name; R47's kind words); no keys/rows for UNKNOWN_FORUM_KIND and FORUM_KIND_NOT_FOR_KIND.

**CHANGE B3 (K3677).** `aliasesOf` now answers exactly `{ok, aliases, limit, truncated, next}` (I had also `kinds` and `count`; dropped); an unrecognised viewer `aliases: []`. Tests adjusted; entities 118/118; architecture, coverage (56/56), ownership 0 failures.

## J3 · COMPLETE

COMPLETE J3: B3 applied. aliasesOf answers exactly {ok, aliases, limit, truncated, next} (dropped my extra kinds/count); unrecognised viewer aliases: []. tranche/T50 merged; entities 118/118; architecture, coverage 56/56, ownership 0 failures.
