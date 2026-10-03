# queue (T27)

**Status** · session_01F38bSR7bu33Tfs9jy4JEQS · depth 2 · COMPLETE · handled B3

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


**B2, B3 (CHANGE; K1288–K1290).** Merged `tranche/T27` @ `4545026b15`, which includes the affordances and queue-producers merges. B2's three fakes were already in the test world. `holdsReleased`'s fake now carries `limit: 500`, as actions answers. New test: a fake `actions.holdsReleased` reaches the real queue-producers R29. Its `litigation-hold-released` item passes the mint as a FINDING, goes to an administrator and to the placer, and with no release there is no item. Re-run on the merged tree:
- `test/m/queue/`: 105 pass, 0 fail.
- `conclude-project`: 75 pass, 0 fail.
- Whole `test/m`: tests 5437, pass 5425, fail 1 (red 4, control-plane R22 `CHECK_FAMILIES`; red 5 cleared with affordances' merge), todo 11.
- Checks:
  - `format`: 0 failures.
  - `architecture queue`: 25 product files, 68 relative imports, 0 failures.
  - `coverage queue`: 40 of 40 named, 0 failures.
  - `ownership queue tranche/T27`: 8 files changed, 0 failures.

Size (session_01F38bSR7bu33Tfs9jy4JEQS): test runs 13, module lines 5956

## J1 · COMPLETE

COMPLETE. N518 and N520 applied on job/T27/queue (merged tranche/T27 @ 4d283665f9). R1: docket-core-due (OBLIGATION), edition-withdrawn, edition-contested and litigation-hold-released (FINDINGs), each with its sentence; litigation-hold's sentence names its release (op=actionholdrelease). R12: the hold's detail names actionholdrelease as the other answer (actionhold now refuses a release). R50: docket-core-due instead [docketprepare, docketdecline] (the R28 bridge answers the same); the edition kinds take R12's project-scoped disposition with acts [reevaluationrecord]. PRODUCER_DEPS gains docket (queue-producers R30). Fixed in-module: R28's bridge gave contradiction-duty(-unseen) kind keys taskresolve; now R46's doors for a duty not yet taken up. Test world defaults gain holdsReleased, docketDependents, coreDue, so the suites stay green once queue-producers' R29-R31 land. queue 104/104 (new docket.test.mjs; hand-armed negative control fails 4); conclude-project 75/0; whole test/m 5407 pass, 2 fail (reds 4 and 5 only). Checks format/architecture/coverage (40/40)/ownership: 0 failures. Red 2: no catalogue row added. Deferred: R28 cannot class a duty's published id OBLIGATION::contradiction::<c> (its second segment is not a kind), which needs a wording change. REPORT: plane bundle stale (queuestate.mjs, queue/index.mjs; nothing regenerated); queue R1 lists litigation-hold after the FINDING list with no class word, though the code, R12 and queue-producers R19 make it an OBLIGATION; suggest moving it to R1's OBLIGATION list. Details in the record. Please merge job/T27/queue after affordances and queue-producers.

## J2 · COMPLETE

COMPLETE (re B2, B3). Merged tranche/T27 @ 4545026b15 (affordances, queue-producers in). B2's three fakes were already in world.mjs; holdsReleased now also answers limit 500. New end-to-end test: a fake actions.holdsReleased reaches the real queue-producers R29 and its litigation-hold-released item passes the mint (admin and placer told; none when no release). queue 105/105; conclude-project 75/0; whole test/m 5425 pass, 1 fail (red 4 only; red 5 cleared). Checks: 0 failures each, coverage 40/40. Everything else stands as in J1. Please merge job/T27/queue.
