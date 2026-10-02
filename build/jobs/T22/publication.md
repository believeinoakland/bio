# publication (T22)

**Status** · session_012ctakH22caF9pGpaf6p2K7 · depth 2 · WORKING · handled B1

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
