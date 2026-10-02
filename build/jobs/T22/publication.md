# publication (T22)

**Status** · session_012ctakH22caF9pGpaf6p2K7 · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (B1, B2; `build/plan/current.md` T22 layer 8; J10, K617, K1024; DEC-88, K1025, K1030, K1058).
- **(1) The split** (seam map `build/extraction/corpus-export.md` §7.1), in one commit after B2 (corpus-export merged, K1075), with `tranche/T22` merged first. In `index.mjs`:
  - Deleted the three export constants; they are re-exported from `corpus-export`, unchanged, for queue-producers.
  - Deleted the section 8 comment, `exportManifest` and `exportLog`. They are now one-line delegates to `this.corpusExport`.
  - `corpusExportOf` is imported and created eagerly in `publicationOf` with this module's clock and storage, beside the purge declaration. `publicationOf` now keeps that declaration's answer as `purgeDeclaration` (R31), as corpus-export does. A refused declaration declares nothing, so it must be seen.
  - The ops `export` and `exportlog` are unchanged.

  In `schema.mjs`: deleted the `export_log` DDL and its comment, and dropped `"export_log"` from `PUBLICATION_EXEMPT`. Comments re-worded: the `index.mjs` header (the export, `refs`, R18's tables, the `deps` list, the read contracts) and the `schema.mjs` header.
- **(2) The split's tests.**
  - Deleted `export.test.mjs` and R32's todo.
  - R31's test keeps its arms. The exempt list no longer has `export_log`, `publicationOwns({name: "export_log"})` is false, and the purge snapshot covers my exempt tables plus `export_log`.
  - New: `op=export` and `op=exportlog` answer through the delegates (corpus-export R1, R2), with the bounds re-exported equal.
  - New: on one host, both declarations answer `{ok: true}`; `export_log` exists at boot; a whole-store purge leaves `export_log` and my exempt tables byte-identical. On a bare host, the same order is ok. Negative control: with `export_log` restored to my exempt list, corpus-export's declaration is refused `TABLE_DECLARED` (`declaredBy: publication`).
- **(3) DEC-88, R17.**
  - `attributeObservation` takes `reason`, and `op=attribute` passes `b.reason`.
  - A new row C-92.13 `ATTRIBUTION_NO_REASON` in `ATTRIBUTION_ACT_CHECKS`, after C-92.9, with R17's translation word for word. It is asked after C-92.2 and before C-92.3. It refuses a reason that is absent, not a string, blank after trim, or over 2,000 code points (`ATTRIBUTION_REASON_MAX`).
  - The reason is stored as written (K1050's form) in a nullable `observation_attributions.reason`. The column is in the DDL and added by hand in `ADDITIVE_COLUMNS`, null before DEC-88, and written at the insert.
  - The same level again at the same edition writes nothing, so the first reason stands (K1058). Another level replaces the level with its own reason.
  - It is read back in the act's answer and by `attributionInForce` (R39 answers a `reason` field beside the level).
  - My tests send a reason except where they prove the refusal.
- **(4) Callers.** Re-grep on my branch: no other module sends the act. provenance's miniflare test is N496 (B2); the UI sends none; control-plane relays the body.
- **(6)** Notes naming the retired legacy-store or its op map as live re-worded (comments, and the fixture's stand-in names). No note names `tools/` or the deleted plane `index.mjs` as live. Provenance notes ("Moved from `src/index.mjs`") stay.
- **R17 met; R33 met** (C-92.13 tested by R17's test and R33's row test). Their `(not yet met: T22)` marks are BOB's to strike. C-92.13 is `awaiting stamp`: row-census red, accepted red 3.
- **(5) Size:** 3,643 lines (`index.mjs` 2,710, `schema.mjs` 666, `checks.mjs` 120, `door.mjs` 92, `deliverer.mjs` 55), under 4,000.

**Deferred:** none.

**Found in other modules, or BOB's:**
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from `src/publication/` (fleetbundles: the bio-plane member FAIL). I regenerated nothing.
- Requirements (BOB's):
  - R39's wording could name the `reason` it now answers beside the level.
  - My Uses' `record-core` line still carries "*(not yet provided: T8's record-core entry)*", the mark corpus-export's J1 (2) found stale (record-core R37 states the `bundles` columns I read).
  - The Uses' record-core line names `the bundles read contract` only, which matches the code now.
- J1 said corpus-export's suite was green before it existed. It is green now: 9 of the 105 below.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/corpus-export/ test/m/publication/`: 105 pass, 0 fail, 1 todo (R30, D-246).
- `node --test test/m/` (after the split): 4,866 pass, 12 fail, 18 todo. Every fail is accepted by name:
  - actions `t18.test.mjs`:299
  - case-authoring `members.test.mjs` (:129)
  - control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310
  - membership `module-order.test.mjs` R83, `t9-notice-sight-bounds.test.mjs` R79 and `promotion/registry.test.mjs`:58 (accepted red 4)
  - queue-producers `proposals.test.mjs` (4 tests, from :39)
  - scheduler `plane.test.mjs`:85

  My users' suites are all inside it: corpus-export, public-read, project-stage, ratification, review, queue, conformance, reevaluation, filings, plane, affordances green; case-authoring, queue-producers and control-plane only the reds named.
- `node --test test/system/row-census.test.mjs`: 1 fail, C-92.13 arrived with no record (accepted red 3, awaiting stamp).
- `node --test bio-plane/test/system/fleetbundles.test.mjs` (repository root): the bio-plane member stale (reported above).
- From `civicos-process`:
  - `format`: 86 modules, 85 requirements files; 0 failures.
  - `architecture publication`: 23 product files, 78 relative imports; 0 failures.
  - `coverage publication`: 38 of 38 live requirement ids named by a test; 0 failures.
  - `ownership publication tranche/T22`: 10 files changed by publication; 0 failures.

Size (session_012ctakH22caF9pGpaf6p2K7): test runs 10, module lines 3643

## J1 · REPORT

Progress, and the reds to route before my merge (START (3), (4), (6)). The split (1), (2) waits on your CHANGE announcing corpus-export's merge; corpus-export's job has only started.

**Done, pushed on `job/T22/publication`:**
- DEC-88, R17. `attributeObservation` takes `reason`; `op=attribute` passes `b.reason`.
  - Refused `ATTRIBUTION_NO_REASON`, C-92.13 (new row; R17's translation word for word), after C-92.2 and before C-92.3. Refused when absent, not a string, blank after trim, or over 2,000 code points (`ATTRIBUTION_REASON_MAX`).
  - The reason is stored as written, as observation-log does (K1050). It goes in a nullable `observation_attributions.reason`: in the DDL and added by hand to `ADDITIVE_COLUMNS`, null before DEC-88.
  - The same level again at the same edition writes nothing, so the first reason stands (K1058). Another level is a new choice with its own reason.
  - Read back by the act's answer and by `attributionInForce` (R39 gains a `reason` field; review's one read of it uses only truthiness).
- Tests send a reason (`attribution.test.mjs`'s helper, `convert-mk6-bundle-names-no-author.test.mjs`:41 and :144, `invariants.test.mjs`'s R34 arm).
  - R17's new tests check that absent, null, a number, an object, blank, whitespace only, 2,001 characters and 2,001 code points are each refused, with the attribution count and `doc_sha` unchanged.
  - Negative control: 2,000 astral code points (4,000 UTF-16 units) is accepted and read back. The order of refusals is checked (no level, then no reason, then unknown level). So are the kept first reason and the migration of a pre-DEC-88 table (reason null).
  - R33's row test lists C-92.13.
- (6) Comments no longer name legacy-store or its op map as live. producingGroup is instance-setup's, the provider is review's, and the op map is `plane/store.mjs`'s. Comments and test stand-in names only.
- `test/m/publication/`: 96 pass, 0 fail, 2 todo (R30; R32's todo goes with the split).

**Reds, each to accept by name or route (P4):**
1. Provenance's `bio-plane/test/mk6-bundle-names-no-author.test.mjs`:203 posts `op=attribute` with no reason. It is now refused `ATTRIBUTION_NO_REASON`. It needs miniflare and is outside `npm test`. Provenance has no T22 job; K1058 names it N496.
2. `bio-plane/test/system/row-census.test.mjs`: C-92.13 arrived with no record. Accepted red 3, `awaiting stamp`.
3. The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from my changes under `src/publication/`. I regenerated nothing.
4. The whole `bio-plane/test/m` on my branch: 4,850 pass, 12 fail, 19 todo. Every fail is one already accepted by name; none comes from publication:
   - actions `t18.test.mjs`:299
   - case-authoring `members.test.mjs` (the bar without a reason, :129)
   - control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310
   - membership `module-order.test.mjs` R83, `t9-notice-sight-bounds.test.mjs` R79 and `promotion/registry.test.mjs` R39/R45/R46 (accepted red 4)
   - queue-producers `proposals.test.mjs` (4 tests, from :39)
   - scheduler `plane.test.mjs`:85

   My users' suites are all inside that run. corpus-export, public-read, project-stage, ratification, review, queue, conformance, reevaluation, filings, plane, affordances: green. case-authoring, queue-producers, control-plane: only the reds above.

**Grep** (`attributeObservation`, `"attribute"`, `op=attribute` over `bio-plane/`, `agent-worker/`, `civicos-ui/`): no other caller sends the act. The UI sends none. control-plane stamps only `by` and relays the body, so `reason` reaches the act. ratification `refusals.mjs`:72 and review `index.mjs`:666, :668 only name the op. affordances' `attribute` rung is its L11 job.

Next: the split, on your CHANGE.
