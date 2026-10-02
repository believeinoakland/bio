# queue (T24)

**Status** · session_019oyErz8GFQGd7LLoJeJpcK · depth 2 · COMPLETE · handled B3

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T24 L11; B2 ANSWER, B3 CHANGE):
- **N508:** `bio-plane/src/queue/index.mjs`:29 (the module note) and :2035 (`queueOps`' note) no longer name the legacy store's dispatcher and op map as live. They now say that control-plane's `controlPlaneRoutes` spreads `queueOps` into the plane's one route map (plane R5), that control-plane's `dispatch` answers over it, and that `queueOp` is reached through the plane's hooks (plane R6). Wording only. R1's reference to `link-sweep` R11 (K1181) is carried into `catalogue.test.mjs`'s note.
- **The re-scan (N469's rule)** of `queuestate.mjs`, `queue/` and the module's tests turned up four more notes of the same kind. Each is re-worded:
  - `index.mjs`:170 named `query.mjs` as the gate's one compilation point. It is membership's `viewerPredicate` (membership R43).
  - `schema.mjs`:2–4 said the retired `schema.mjs` interpolates this text. It now says it did so until T19, and that the plane's migration pass runs `migrate()` (plane R3).
  - `test/conclude-project.test.mjs`:1 said the deleted control "EDITS src/store.mjs". It is now in the past tense.
  - `test/m/queue/signals.test.mjs`' header named monitoring's read. It now names link-sweep's.
  - No `awaiting stamp` note in the module.
- **Found while applying it: link-sweep wiring (J1; confirmed B2, K1211; B3, K1212).** queue-producers R26 reads `deps.linkSweep` since its L11 merge.
  - `Queue.PRODUCER_DEPS` gains `"linkSweep"`, as K921 added `filingTemplates` and `localFacts`. queue passes it on and calls none of its reads.
  - The test world's sweep fake moved from `monitoring.sweepConditions` to `linkSweep.sweepConditions`. `signals.test.mjs` offers the conditions through it.
  - New test `R8 (N506, K1211)`. The fake link-sweep's conditions reach the feed as the five sweep signals. Negative control: the same conditions offered by monitoring raise none. With the producers stubbed, a throwing link-sweep is never called by queue.
  - Removing `"linkSweep"` from `PRODUCER_DEPS` was armed by hand: three `signals.test.mjs` tests fail. The file was then restored.
- No requirement id's meaning changed, and no service queue provides changed.

**Deferred:** none.

**Found in other modules (REPORT):**
- **Plane bundle stale:** `bio-plane/src/queue/index.mjs` and `schema.mjs` changed, so `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale. `fleetbundles.test.mjs`' D-298 arm names both. Nothing regenerated (manifest §14).
- `plane` `test/m/plane/notices.test.mjs`:140 expects monitoring to hold the sweep scope check. Since N506, link-sweep registers it (`LISTENER_DECLARED` names `zz-probe`, not `monitoring`). This falls under red 7, until plane's L11 merge.

**Tests and checks** (after merging `tranche/T24` @ `62f7503320`):
- `node --test bio-plane/test/m/queue/`: tests 97, pass 97, fail 0.
- `node bio-plane/test/conclude-project.test.mjs`: 75 pass, 0 fail.
  - Before queue-producers' merge it was 71/4, identical with my change stashed: op=queue through the plane threw at queue-producers `index.mjs`:2911 (red 7).
- Whole `bio-plane/test/m`: tests 5287, pass 5274, fail 2, skipped 0. Both are accepted reds, and both failed identically before my change:
  - plane `notices.test.mjs`:33 (its assertion at :39, red 9);
  - plane `notices.test.mjs`:140 (red 7, above).
  - Before the merge, the same tree gave 5257/8. All 8 were identical with my change stashed (reds 6, 7 and 9).
- Checks:
  - `format`: 88 modules, 87 requirements files, 0 failures.
  - `architecture queue`: 24 product files, 66 relative imports, 0 failures.
  - `coverage queue`: 39 of 39 live requirement ids named by a test, 0 failures.
  - `ownership queue tranche/T24`: 7 files changed, 0 failures.
- Red 5: no catalogue row added or changed, so no `awaiting stamp` row to list.

Size (session_019oyErz8GFQGd7LLoJeJpcK): test runs 13, module lines 5709

## J1 · QUESTION

Q1 (wording vs wiring, L11 with queue-producers). queue-producers R26 now reads `link-sweep.sweepConditions` (its L11 re-point, running in parallel as QUEUE-PRODUCERS #8). queue hands queue-producers its providers by name through `Queue.PRODUCER_DEPS` (`bio-plane/src/queue/index.mjs`:103), and queue's test world fakes `monitoring.sweepConditions` (`test/m/queue/world.mjs`:135), which `signals.test.mjs` (R1, R5, R11, R12, R14, R19, R30 over the sweep kinds) depends on.

My best reading, which I am building on: queue-producers will take the provider under the dep name `linkSweep` (its convention: `networkNotices`, `filingTemplates`, `corpusExport`). So queue adds `"linkSweep"` to `PRODUCER_DEPS` (as K921 added `filingTemplates`, `localFacts`; queue passes it and calls nothing), and the test world gains a `linkSweep: { sweepConditions }` fake beside monitoring's, with `signals.test.mjs` giving its conditions to both, so queue's tests are green before and after queue-producers' merge. Nothing changes in what queue provides.

Please confirm the dep name with QUEUE-PRODUCERS #8, or give the one it uses; I will match it. This does not block the rest of my job (N508 and the re-scan).
