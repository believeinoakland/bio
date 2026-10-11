# case-authoring (T43)

**Status** · session_0115vgTqhQQu4wvo26nopLhu · depth 2 · RUNNING until 2026-10-11T10:58:51Z (users' tests (review … plane)) · handled B2

## J1 · QUESTION

**The fixture's doorbell import has no Uses edge.** K2710 and your START have my fixture build doorbell's tables with `doorbellOf(ctx)` before it inserts into `inbox`. I did that (`test/m/case-authoring/fixture.mjs`: `doorbellOf(host, {capture, record, provenance, credentials})`, right after capture), and it clears rule 4 (12)'s four reds: case-authoring is now 185/185.

`node checks/architecture.mjs . case-authoring` now fails once: "fixture.mjs imports bio-plane/src/doorbell/index.mjs of doorbell, which case-authoring does not declare in uses". doorbell is layer 3, earlier than case-authoring, so the edge is legal.

**My reading:** you add `doorbell` to case-authoring's `uses` in `modules.json`. The need is test-only, for the fixture's inbox. The Uses text in the requirements needs a matching line, which is yours.

**The other route:** the fixture could reach doorbell through `sources`' lazy getter. A read on `sources` would call `doorbellOf(ctx)` with its default `captureOf(ctx)`, which builds a second capture instance on the host. It also couples the test to sources' laziness, so I would not take it.

The code is committed either way. I complete once you answer, or once the edge is on the tranche branch.

## J2 · COMPLETE

**T43-12 applied, on `job/T43/case-authoring` with `tranche/T43` merged in (73d6a2ada2; it carries case-carriage's merge).**

**Entries applied**
- **R69 (N850, K2608).** `accountPropose`, `accountDrafts` and `registerReviewComments` are deleted from `src/case-authoring/index.mjs`. The file's header and factory comments now say these are `case-account`'s alone.
- **No caller is left.** `git grep` over `bio-plane/src` finds none reaching them through case-authoring:
  - `control-plane/owner-ops.mjs`:38–39 calls `of.caseAccount()`;
  - `review/index.mjs`:980 calls `r.caseAccount.registerReviewComments`.
- **`account.test.mjs`.** Every call moves from `w.ca.` to `w.cacc.`. The pass-through equivalence is gone. In its place, a new R69 test checks the three are undefined on case-authoring, and `accountpropose` and `accountdrafts` are absent from its ops, while case-account answers them. Its negative control checks that the services and ops case-authoring keeps are defined, and that it still publishes.
- **The fixture (K2710; clears rule 4 (12)'s four case-authoring reds).** `doorbellOf(host, {capture, record, provenance, credentials})` runs right after capture, before `knocked` inserts into `inbox`. Its Uses edge is K2722 (J1, B2).

**Deferred:** nothing.

**Found in other modules** (wording only, no behaviour):
- plane's requirements, Private R38, still say review registers its comments "through `case-authoring`'s pass-through until T43-12; N850". That clause is stale now. It is BOB's to strike.
- The plane bundle (`dist/bio-plane.bundled.mjs`) still holds the three pass-throughs. That is rule 4 (6), regenerated at the layer's close.

**How the reading set was read (mechanics §17).**
- **Read whole by me:**
  - my requirements;
  - the plan's T43-12 entry and rule 4 (12);
  - K2608, K2698, K2710;
  - `draft-T43-cleanup.md` §N850;
  - every file under `src/case-authoring/`;
  - `fixture.mjs` and `account.test.mjs`, which this job changes.
- **Not read whole:** my other 26 test files. They are unchanged and pass.
- **Read by a helper agent in this session:** the public parts of case-account, control-plane, plane, review and doorbell, each in full, with a digest citing its sections. It found no requirement still naming case-authoring as the provider of the three services, apart from plane's R38 above.

**Tests**
- **case-authoring:** `node --test test/m/case-authoring/`: 185 pass, 0 fail (was 180 and 4 before).
- **My users, after the merge:**
  - review 46 pass, 0 fail;
  - plane (with `test/system/migrate-released.test.mjs`) 185 pass, 0 fail;
  - affordances 231 pass, 1 fail: `t36.test.mjs`:55, rule 4 (10);
  - op-declarations 125 pass, 8 fail: `t34`:68, 145, 307, `t37`:105, 177, 218, `t38`:76, 87, rule 4 (10);
  - answer-envelope 25 pass, 5 fail: `catalogue-end`:17, `envelope`:63, `families`:49, 377, 424, rule 4 (9). It fails the same 5 without my change.
  - control-plane 222 pass, 1 fail: `envelope.test.mjs`:387 (its assertion at :391), rule 4 (12).
- None of these reds is mine.

**Checks**
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture . case-authoring`: 30 product files, 171 relative imports; 0 failures.
- `coverage . case-authoring`: 51 of 51 live requirement ids named by a test; 0 failures.
- `ownership . case-authoring tranche/T43`: 4 files changed; 0 failures.

Size (session_0115vgTqhQQu4wvo26nopLhu): test runs 9, module lines 3696
