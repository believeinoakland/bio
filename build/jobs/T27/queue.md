# queue (T27)

**Status** · session_01F38bSR7bu33Tfs9jy4JEQS · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T27 L11, queue: N518 (R1, R12), N520 (R1, R50)):
- **R1 (N518, N520).** `queuestate.mjs` classes four new kinds, each with R1's sentence:
  - `docket-core-due` as an OBLIGATION (`queue-producers` R30, `docket` R9);
  - `edition-withdrawn` and `edition-contested` as FINDINGs (`queue-producers` R31, `reevaluation` R30);
  - `litigation-hold-released` as a FINDING (`queue-producers` R29, `actions` R59).

  `litigation-hold`'s sentence now names its release as its own act (`op=actionholdrelease`, DEC-113). R1's own words for it are unchanged.
- **R12 (N518).** The litigation hold's door stays `actionhold`. Its detail now names `op=actionholdrelease` as the other answer a member may give, as escalation's names `escalationdecline`. The old detail said `op=actionhold` records a release, which `actions` R52 now refuses (`HOLD_RELEASE_IS_ITS_OWN_ACT`).
- **R50 (N520).**
  - `docket-core-due`: `available: false`, `instead: [docketprepare, docketdecline]`, with a detail naming both doors. It is never muted: R19 and R31 hold by its class. The bridge (R28) answers the same two doors.
  - `edition-withdrawn` and `edition-contested`: R12's project-scoped disposition with `acts: [reevaluationrecord]`, as `side-corrected` (one table, `Queue.FINDING_ACTS`).
- **queue-producers R30's provider.** `Queue.PRODUCER_DEPS` gains `"docket"`, as K921 added `filingTemplates` and `localFacts`. queue passes it on and calls none of its reads. R29 and R31 read `actions` and `reevaluation`, which are passed already.
- **Fixed in my module (R28): the bridge's contradiction-duty door.** A key naming `contradiction-duty` or `contradiction-duty-unseen` by its kind was answered `instead: taskresolve`, a door neither has. It now gets R46's doors for a duty not yet taken up: `[contradictionclarify, contradictiontakeup]` and `[contradictionoptin]`. The item's own disposition still reads its subject (R46), unchanged. `Queue.doorOf(kind)` is now the one lookup for R12 and R28. It copies a list out, so no answer hands out a frozen array.
- **The test world.** Its defaults gain `actions.holdsReleased`, `reevaluation.docketDependents` and `docket.coreDue`, each empty and shaped as its owner answers. So the suites that run the real `queue-producers` stay green once its R29–R31 merge.
- No requirement's meaning changed. What queue provides gains only R1's four kinds and R50's doors.

**Deferred** (needs a requirement change, so it is BOB's to word):
- **R28 does not read a contradiction duty's published id.** The id is `OBLIGATION::contradiction::<candidate>` (`queue-producers` R4). Its second segment is not a kind, so R28's reading ("as R26 reads an `OBLIGATION::<kind>` id") does not class it, and the key goes to the progression arm. `-unseen` ids are the same. R28 could read the item's kind from the feed, but a bridge keyed on ids alone cannot. Left as R28 words it.

**Found in other modules and in the requirements (REPORT):**
- **Plane bundle stale:** `queuestate.mjs` and `queue/index.mjs` changed, so `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale. `fleetbundles.test.mjs`' D-298 arm names them, beside `plane/index.mjs`, `signpage.mjs` and `sign-release.html`. Nothing regenerated (manifest §14).
- **`queue` R1's wording:** `litigation-hold` sits after the FINDING list, before "`CONDITION` for", with no class word of its own (it was there before T27). The code, R12 ("an OBLIGATION ... `actionhold` for `litigation-hold`") and `queue-producers` R19 all make it an OBLIGATION. I kept it an OBLIGATION. Suggested fix: move it into R1's OBLIGATION list.

**Tests and checks** (after merging `tranche/T27` @ `4d283665f9`):
- `node --test bio-plane/test/m/queue/`: tests 104, pass 104, fail 0.
  - New: `docket.test.mjs` (7 tests: R1, R8, R11–R14, R19, R26–R28, R31, R50).
  - Extended: `catalogue.test.mjs` (R1's four kinds and their near-misses), `action.test.mjs` (R12's release door) and `dispose.test.mjs` (R28, R50: the docket doors and the duties' doors).
  - Negative control armed by hand: removing the docket doors and the edition acts from `index.mjs` fails 4 tests. The file was then restored and verified.
- `node bio-plane/test/conclude-project.test.mjs`: 75 pass, 0 fail.
- Whole `bio-plane/test/m`: tests 5420, pass 5407, fail 2, todo 11, skipped 0. Both failures are accepted reds:
  - control-plane R22's `CHECK_FAMILIES` (red 4);
  - affordances `backing.test.mjs` R19's `actionhold` case (red 5).
- `test/system/fleetbundles.test.mjs`: the bio-plane arms fail on the stale bundle (above). Every other member passes.
- Checks:
  - `format`: 92 modules, 91 requirements files, 0 failures.
  - `architecture queue`: 24 product files, 66 relative imports, 0 failures.
  - `coverage queue`: 40 of 40 live requirement ids named by a test, 0 failures.
  - `ownership queue tranche/T27`: 8 files changed, 0 failures.
- Accepted red 2: no catalogue row added or changed (no check row; the kinds are vocabulary), so no `awaiting stamp` row to list.
- Merge order (L11): affordances and queue-producers merge before queue. This branch builds without either, and its tests pass before and after queue-producers' R29–R31 land.

Size (session_01F38bSR7bu33Tfs9jy4JEQS): test runs 9, module lines 5936
