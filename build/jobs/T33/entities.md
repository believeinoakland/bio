# entities (T33)

**Status** · session_01GwNBQvLbkzvmQayjiCByXF · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Five readings for T33-25. I am building on each now; none blocks me. Answer only where you disagree.

1. **R47's battery cannot fully pass for this owner.** `connection-grammar`'s `ownerConformance` (R9) needs one item `in` at the date and one fenced item that one member viewer sees and another does not. A declared relation has no dates, so `validAt` answers every item `undetermined`. The registry is group-wide (C6, K1489), so no item is fenced from a member. My reading: the test runs the battery and asserts that its only failures are those two checks (`at` for the `in` item, `sight` for the fenced item). It then tests R6 and R7 directly: every item is marked undetermined; every member viewer gets the whole set; an unrecognised viewer gets nothing; a missing viewer is refused. The battery's gap goes to you as a REPORT against connection-grammar.
2. **R45, a proceeding's label.** The module composes the label from the forum's label, the number and the kind's label, so `ENTITY_NO_LABEL` never arises for a proceeding. A label the caller gives is kept as an extra alias, never as the label (a caption may be one, K1452). The note is still required (R1).
3. **R43, a machine's identifier "only from a system rule" (K1443).** For a `class:` stamp, `basis` must be `{system, row}`, with `system` one of the scheme's `systems`; otherwise the act is refused `NO_BASIS`, with a detail that says why. A member's basis is a cited source: a non-empty string, or that same object.
4. **R42.** A `sector` given to `createEntity` for a kind that is not an organisation is refused `NOT_AN_ORGANISATION` before any id is allocated. `setSector` to the value already held answers `already: true` and writes nothing. `readEntity` answers `sector` (null for a kind that is not an organisation) and `sector_history`, bounded at 500 as R39 bounds the other lists.
5. **R45/R47 mechanics.** A proceeding's number is held under the reserved scheme `proceeding`, scoped by its forum's id, so `IDENTIFIER_TAKEN` is per forum. R9's identifier tier matches on the space, form and normal form across forums. `neighbours` is registered once at load in `connection-grammar`'s default registry and answers through the storage's `Entities` instance (`entitiesOf`; one per Durable Object). An `Entities` instance also exposes `neighbours()` itself, for tests and the battery.

Also: `modules.json`'s `uses` for entities do not list `connection-grammar`, `civil-time` or `content`. Requirements Uses list all three. I import connection-grammar, civil-time and content's pure extent grammar (R46).

## J2 · REPORT

Findings outside my module (T33-25). Each is named against the other module's requirements, with a proposal.

1. **`modules.json`, entities' `uses` (yours).** `architecture entities` fails 4 times, and only because of undeclared edges that requirements Uses already name: `connection-grammar` (R47: `registerOwner`, `BOUNDS`, `DECLARED_LABEL`, `LOWEST_GRADE`; the tests use `ownerConformance` and `kindOf`), `civil-time` (R9, R43, R44: `validAt`, `compare`) and `content` (R46: `checkContentExtent`, `canonicalExtent`, `describeExtent`, `CONTENT_EXTENT_DOCUMENT_ONLY`). Please add all three. Every one is an earlier layer, so P4 holds.
2. **connection-grammar R9 (`ownerConformance`).** The battery cannot be passed by an owner whose items carry no dates, or whose sight is group-wide (C6, K1489). It demands one item `in` at the date, unmarked, and one item fenced from a second member. Over my fixture every other check passes, the `out`, `undetermined`, missing-viewer, kinds, paging and determinism arms included (test "R47 R9 …" asserts exactly this). Proposal: the fixture may omit `in` when the owner declares no dated kinds, and omit `fenced`/`blind` when its sight is group-wide, stating why. `events`, `lines` and `people` have dated items and can supply `in`; a group-wide owner such as `people`' registry will meet the same `sight` gap.
3. **C-91.1 `IDSPACE_UNKNOWN`'s translation (my module, not changed).** It still says the spaces are four (enactment, project, fund, parcel), but id-spaces R1 now lists nine. Changing it turns two other suites red: control-plane's "R43, R22 … every published fence" test pins its hash, and the row census would need it named `awaiting stamp`. So I kept the stamped wording. Proposed text: "That is not an identifier space the record knows how to judge. The answer lists the spaces it knows, each with the forms this instance's jurisdiction profiles give it. Nothing was judged." A CHANGE from you applies it here; control-plane's pin and promotion's stamp would follow.
4. **op-declarations / control-plane.** R43 publishes `op=entityidentify` in `entitiesOps`. It needs its spec, with `by` stamped from the credential as `resolutiondefect`'s `by` is, or no caller reaches it. `affordances` may publish `sectors()` beside `kinds()` (R42), and its re-export of `ENTITY_KINDS` now carries 13 kinds. affordances' tests still pass.
5. **Generated artifact (§14).** The plane bundle is stale, because entities' source changed. It is regenerated at L5's close.

## J3 · COMPLETE

**T33-25 applied** (B1a.3, A ORG, A COURTS C1; K1441, K1443, K1452, K1453, K1487, K1515, K1543). Commits f01293a2cf and a282855f70 on `job/T33/entities`. The module grows 1,289 → 1,868 lines (P6 well under). J1's five readings are built as stated (no answer had arrived when this was posted).
- **R1:** kinds `program`, `place` and `proceeding` added. The `ENT-` counter has no ceiling: `ENT-2026-10000` is allocated, read back, accepted by the id grammar and usable as a relation end.
- **R42:** organisations (`institution`, `body`, `movement`) carry a closed `sector`. Absent, it is `undetermined`; a store from before T33 reads the same. `UNKNOWN_SECTOR` and `NOT_AN_ORGANISATION` are refused before any id is allocated. `setSector` refuses `NO_SUCH_ENTITY`, `NOT_AN_ORGANISATION`, `UNKNOWN_SECTOR` and `NO_REASON`, in that order. Each change keeps the old value in an append-only history (`entity_sectors`); a repeat answers `already`. `sectors()` answers the list; `readEntity` answers `sector` and `sector_history`.
- **R43/R44:** `addIdentifier` (`op=entityidentify`) refuses, in R43's order: `NO_ENTITY`, `NO_SUCH_ENTITY`, `UNKNOWN_SCHEME`, `SCHEME_NOT_FOR_KIND`, `IDENTIFIER_NOT_IN_SPACE` (the scheme's form too), `BAD_VALIDITY` (civil-time's own reading), `NO_BASIS` (a machine only `{system, row}` of the scheme's systems, K1443), then `IDENTIFIER_TAKEN` on an overlapping or unstated validity, naming the holder. `withdrawIdentifier`, `identifiersOf` and `entityByIdentifier` (validity at `at`; undetermined, or more than one holder, answered with why) never throw.
- **R9:** the identifier tier. A reference or its key, recognised in a held identifier's space, form and normal form, is not `out` at the capture's retrieval instant (earliest `first_retrieved`, else `registered`). It resolves at A, the basis naming the scheme and the method naming the tier, with the validity stated when undetermined. The alias-fold A is unchanged. The tier costs nothing while no identifier is held.
- **R45/R46:** the proceeding facet: `PROCEEDING_FACET_MISSING`, `NO_SUCH_ENTITY` (field `forum`), `PROCEEDING_KIND_UNKNOWN`, `IDENTIFIER_NOT_IN_SPACE`, then `IDENTIFIER_TAKEN` per forum. The label is composed (forum, number, kind label). The number is held as an alias and as an identifier (scheme `proceeding`, scoped by forum), so a capture carrying it resolves at A. Read through `readEntity` and `proceedingOf`. `registerProceeding` refuses as R45 does, plus content's extent grammar and `NO_SUCH_REFERENCE` (not held or not visible, answered alike). A forum that already holds the number answers `existed`, adding a new caption as an alias. The basis is held as `{capture_sha, extent}`, attributed to the stamp.
- **R26/R47/R48:** registered at load as the owner of `proxy_for`, `member_of` and `overlaps` (class `declared`, words the relation names until UX gives them). `neighbours` answers live relations from either end in connection-grammar's shape (lowest grade, "declared, not evidenced", evidence the citation, validity unstated so marked undetermined). It is group-wide; a missing viewer is refused. Pages are keyed by relation id; a hub above 1,000 is named. Two new composite indexes `(from_entity|to_entity, relation_id)`. The default registry's own judging passes the answer whole. The battery: everything passes except its `in` and fenced arms (REPORT J2 item 2).
- **R49:** all eight tables are declared through `declareTable`. The registry tables are `keys: []`, `sight: group`, `export: yes` (`entity_sectors` `version_chain: true`); `resolutions` and `resolution_defects` are bundle-keyed with the default form's classes.
- **Named reds fixed:** `resolve.test.mjs` R13 now takes its expected order from `MODULE_ORDER` (K1543); `idmatch.test.mjs` R20 expects id-spaces' nine spaces, checked against `spaces()` (K1515).

**Deferred:** C-91.1's stale translation (four of nine spaces). Fixing it reds control-plane's pinned fence and the row census, so it needs your CHANGE (REPORT J2 item 3).

**Found in other modules:** REPORT J2: the `uses` edges, connection-grammar's battery, op-declarations' `entityidentify` spec and affordances' `sectors`, and the stale plane bundle.

**Final `uses`:** record-grammar, jurisdictions, id-spaces, record-core, membership, provenance, extraction, plus **connection-grammar, civil-time, content** (to be added to `modules.json`).

**Tests and checks:**
- `node --test bio-plane/test/m/entities/`: tests 82, pass 82, fail 0 (new `t33.test.mjs`, 17 tests: R1, R9, R26, R42 ×2, R43 ×4, R44, R45, R46, R47 ×3, R48, R49).
- The 16 test paths of entities' users that have tests (connections, observation-log, progressions, bias, retrieval, inquiry, basis-versions, contradiction, intent, docket, actions, scheduler, affordances, control-plane, plane, `test/system/migrate-released.test.mjs`), on my tree and on the unchanged base: 1,463 tests each. The failure set matches the base: affordances "R2 R3 R7 R12" (K1550) and control-plane R26 (K1550). Nothing new, after reverting C-91.1's wording.
- `format`: 0 failures. `architecture entities`: 4 failures, all the undeclared `uses` above. `coverage entities`: 49 of 49 live ids named, 0 failures. `ownership entities tranche/T33`: 8 files, 0 failures.

Size (session_01GwNBQvLbkzvmQayjiCByXF): test runs 13, module lines 1868

## J4 · COMPLETE

**B2 applied** (K1563). This replaces J3, which crossed B2 in the post. J3's account of T33-25 stands except as stated here.
- `tranche/T33` @ e07becea is merged into `job/T33/entities` (34d479dddd).
- **(5) Registration (K1563 (1)):** the owner's `neighbours`, registered at load, takes the optional `host` the registry passes through unchanged and answers from that host's instance. Without a host it answers from the isolate's one instance. With none open, or more than one, it is refused `OWNER_HOST_AMBIGUOUS` with why; `OWNER_NOT_OPEN` is gone. The R47 test covers each arm through the default registry.
- **(1) The battery:** as accepted; J2's item 2 needs nothing further (N560).
- **R35 + `entities.kind`:** it is in the stated contract. The R35 test checks that the column is there and that it holds the kind R1 answers and R5 reads, for every kind of the closed list.
- **`uses`:** now declared. `architecture entities` passes with 0 failures.

J2's other items stand for you: C-91.1's stale wording, `entityidentify`'s spec, affordances' `sectors`, and the stale plane bundle.

**Tests and checks** (commit after 34d479dddd):
- `node --test bio-plane/test/m/entities/`: tests 82, pass 82, fail 0.
- The users' suites: not re-run for B2. No service another module calls changed; only the registry adapter (no caller yet, explore merges after) and a test changed. J3's run stands: same failure set as base.
- `format`: 0 failures. `architecture entities`: 0 failures. `coverage entities`: 49 of 49, 0 failures. `ownership entities tranche/T33`: 9 files, 0 failures.

**Final `uses`:** as `modules.json` now reads (record-grammar, jurisdictions, civil-time, connection-grammar, id-spaces, record-core, membership, provenance, extraction, content).

Size (session_01GwNBQvLbkzvmQayjiCByXF): test runs 15, module lines 1874

## J5 · COMPLETE

**B3 applied** (K1572). `tranche/T33` is merged into `job/T33/entities` (2b3318d8ab). C-91.1 `IDSPACE_UNKNOWN`'s translation now reads, word for word: "That is not an identifier space the record knows how to judge. The answer lists the spaces it knows, each with the forms this instance's jurisdiction profiles give it. Nothing was judged." (b4d03e89c2). The idmatch R20 test asserts that wording. **C-91.1 IDSPACE_UNKNOWN awaiting stamp** (the row census's K1542 red). Control-plane's fence-hash pin is red until T33-89, as B3 accepts.

Tests and checks: `node --test bio-plane/test/m/entities/`: tests 82, pass 82, fail 0. `format`: 0 failures. `architecture entities`: 0 failures. `coverage entities`: 49 of 49, 0 failures. `ownership entities tranche/T33`: 3 files, 0 failures.

Size (session_01GwNBQvLbkzvmQayjiCByXF): test runs 16, module lines 1874
