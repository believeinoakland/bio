<!-- Seam read for queue-producers' split before T34-54/T34-82/T34-92 (K617; N612; K1849 (1)), written for BOB #125 on 2026-10-06 on tranche/T34 by a worker. Uncommitted; BOB reviews it. -->
# queue-producers — split before T34-54 (seam read, K617)

**Status** · DRAFT for BOB #125, 2026-10-06, on `tranche/T34`, uncommitted. Why: queue-producers measures **3,974** lines (`index.mjs` 3,833, `proposals.mjs` 141). Its T34 work (T34-54: R6 re-pointed, R15/R18 read `zone`, R24's word; T34-82: R37's three items, R38's registration and item; T34-92: R39) would take it past 4,000. Read whole: `requirements/queue-producers.md`, both source files, the test list (14 suites and `world.mjs`, 3,088 lines), its `modules.json` entry, the plan entries, K617, K624 (1), K1681, K1849 and `extraction/ratification-split.md`. Users found by grep over `bio-plane/src`, `bio-plane/test` and `build/requirements/*.md`.

**Estimate of the T34 work.** On this module's record, R32+R33 landed at ~110 lines, R30+R31 at ~150 and R34+R35 at ~295. So R37 (three items over `scheduledEditions`) is ~150, R38 (the registration door and one item) ~80, R39 ~70 and T34-54 ~30. **The honest range is 300–450 lines.**

## 0. The answer

**Split the machinery conditions out (seam D).** R3, R22, R26 and R27 go by copy to a new module, **`machinery-producers`**. It holds the CONDITIONs about our own capture, rendering, monitoring, sweeps and working-on notices. It sits in layer 11 **directly before** `queue-producers`, after `tasks`. `feedItems` keeps answering every item: it calls the new module's one read, so `queue`, `plane` and every test that reads `feedItems` are unchanged.

| seam | qp after split | after T34 (300 / 450) | new module | other modules' requirements re-worded | code outside the two |
|---|---|---|---|---|---|
| A `action-producers` (R15–R21, R29) | ~3,490 | ~3,780 / **~3,930** | ~620 | 6 (action-clocks, action-plans, escalation, actions R68, local-facts, notice-producers) | none |
| B cases, imports, wizards (R23, R30–R35) | ~3,340 | ~3,640 / ~3,790 | ~760 | 5 (case-import R20, plane R20, publication R56, case-tensions, wizard-scripts R17) | none |
| C R2's shared-inquiry findings | ~3,200 | ~3,500 / ~3,650 | ~880 | splits R2, R9, R10 themselves; `queue` R18 | none |
| **D `machinery-producers` (R3, R22, R26, R27)** | **~3,155** | **~3,455 / ~3,605** | ~1,050 | 3 (monitoring R31, observation-log R33, network-notices), wording only | none |

**Why not A.** It barely clears: at 450 lines it leaves qp at ~3,930. It also re-points six providers' requirements that name qp R15–R21.

**Why not B.** Leaving R37 and R39 here makes it ~3,790 at worst. Moving them re-assigns T34-82 and T34-92 to another job, and R38's door is named in `instance-setup` R62.

**Why not C.** R2 is one requirement listing every FINDING kind. Cutting it re-words R2, R9 and R10. The `unattributed` facts also cross the seam (`#findingsVersionFromAnotherTeam`).

**Why D.**
- **Headroom.** It removes ~840 lines, the most of any seam.
- **No T34 meaning lands in it.** None of R37–R39, R6, R15 or R18 is in the moved code. Only R24's word does (§7 (2)).
- **One class, one purpose.** The Purpose's "our machinery's conditions": every moved producer reads a provider in layers 3–10 and nothing in layer 11.
- **No catalogue row moves.** qp holds no check row and registers nothing (its Suggestions).

## 1. The new module

- **Name:** `machinery-producers`, the feed's conditions about our own machinery. The alternative is `condition-producers`. That name is not exact, because R15's, R35's, R37's and R38's CONDITIONs stay with their families.
- **Place:** layer 11. In `modules.json` it goes directly after `tasks` and before `queue-producers`. Merge order in L11: wizard-scripts, tasks, **machinery-producers**, queue-producers, notice-producers, ….
- **Merge:** first among the producers, copy first (K624 (1)).
- **Paths:** `bio-plane/src/machinery-producers/` (`index.mjs`). Tests go in `bio-plane/test/m/machinery-producers/`. Per K1043, `paths` and `tests` stay empty in `modules.json` until its job creates them.
- **Uses** (all earlier; none is in layer 11):
  - `record-grammar` (`MACHINE_AUTHOR_PREFIX`);
  - `record-core` (`manifestByAuthor`, `stampInstant`);
  - `membership` (`viewerPredicate`, `projectOwners`);
  - `host-governor` (`governorHolding`);
  - `provenance` (`register`, captured locators by host);
  - `capture` (`liveCaptureSessions`, `gradeNoteOf`, `ACQUIRE_GRADE_NOTE`);
  - `capture-requests` (`completed`, `rendersHeld`, `renderHoldReason`);
  - `monitoring` (`archiveEligible`, `monitoring()`);
  - `link-sweep` (`sweepConditions`, `SWEEP_CONDITION_KINDS`);
  - `network-notices` (`noticesOf`);
  - `actions` (`place`, `zoneOf`);
  - `civil-time` (`localDay`, `dayRange`, `span`, `isCalendarDate`).
- **No cycle:** `queue-producers` uses it, and it uses nothing of queue-producers.
- **No table, no registration.** Its read is `conditionItems({member, viewer, now, homesOf, optionsOf}) → {items}`, the shape of `notice-producers` R1.

## 2. What moves (`queue-producers/index.mjs`, by copy)

| moved | lines today | to |
|---|---|---|
| the CONDITION half's header; `#conditionHomes`, `#conditionBundlesForHost`; governor-holding-host, partial-capture-outstanding, `#gradeNotes`, `#gradeNoteSentence`, capture-completed-unattended (bundles and requests) | 353–802 | R2, R3 |
| `#conditionBundlesForAddress`, archive-fallback-eligible, monitoring-recheck-due | 1842–1939 | R2 |
| `#queueConditions`, render-deferred | 1943–2027 | R2 |
| the sweep and notice block: `SWEEP_CONDITION_KINDS`, `NOTICE_*`, `#sweepWords`, `#conditionsSweep`, `#conditionsNotice` | 3031–3237 | R4, R5 |

That is about **840 lines**.

**Copied, and kept in qp too:**
- `#bundleGate`, `#bundleRedactor`, `#rows`, `#one`;
- the zone helpers (`#instanceZone`, `#knownZone`, `#localDayOf`, `#dayEdge`, `#today`, `#daysBetween`, `#localAge`, `#addDays`);
- `#ownedProjects`;
- `QUEUE_OPTION_SUBJECTS_MAX`, `QUEUE_CONDITION_SUBJECTS_MAX` and `QUEUE_MACHINE_AUTHOR_PREFIX`.

Together they are about 200 lines.

**Stays in qp:**
- `feedItems` (R8) calls `conditionItems` where `#queueConditions` stood, through a lazy `#dep("machinery", …)`. That dep is built with qp's own `#deps`, so injected test deps reach it.
- `static SWEEP_CONDITION_KINDS` stays as a one-line alias, because `sweeps.test.mjs:114` reads `QueueProducers.SWEEP_CONDITION_KINDS`.
- The getters `#governor`, `#linkSweep` and `#networkNotices`, and `capture`'s, go.

**Not moved:**
- every FINDING, OBLIGATION and contradiction producer;
- `#leadBasisAbsence` (R2's lead);
- R15's, R35's and R37's CONDITIONs, and R38's.

## 3. Requirement ids

**`machinery-producers`, numbered afresh:**
- **R1** (was queue-producers R8, its share): `conditionItems` answers every item R2–R5 derive for this member and viewer. Each is homed through `homesOf` and carries `options` from `optionsOf`, both passed in by `queue-producers` R8. It writes nothing.
- **R2** (was queue-producers R3): the six CONDITIONs, word for word. The bound is 16, then `subject_bound`.
- **R3** (was queue-producers R22): the grade note on `capture-completed-unattended`. "R2's option bound" reads "the option bound, 8 (`queue-producers` R2)".
- **R4** (was queue-producers R26): the five `sweep-*` CONDITIONs.
- **R5** (was queue-producers R27): the three `notice-*` CONDITIONs.
- **R6–R10** (copies; the originals stay in qp):
  - R6 copies R11 (no hidden bundle, no count);
  - R7 copies R12 (a CONDITION only where a member's act can change it);
  - R8 copies R13 (no place named);
  - R9 copies R24 ("status", never "signal" or "condition");
  - R10 copies R36 (the local day, R5's windows).

**Retired in qp as moved:** R3, R22, R26 and R27, each marked "*(moved to `machinery-producers` R2/R3/R4/R5)*".

**Re-worded in qp (wording only, ids kept):**
- **R8:** "Answers every item R1, R2, R4–R7, R9, R14–R21, R23, R29–R35, R37–R39 derive, and every item `machinery-producers.conditionItems` answers (its R1), passed the same `homesOf` and `optionsOf`; …". The rest is unchanged.
- **R36:** the site list drops R27 ("R27's windows are `machinery-producers`' (its R10)").
- **Status:** gains a "SPLIT for T34" paragraph in K1505 (1)'s form.
- **Uses:**
  - gains `machinery-producers` (`conditionItems`);
  - `host-governor`, `link-sweep`, `network-notices` and `capture` go (nothing else reads them);
  - `capture-requests` keeps `leads` and `captureRequestAttribution`;
  - `monitoring` keeps `flagged`;
  - `record-core`'s `manifestByAuthor` clause goes.
- **Satisfies:** unchanged.

## 4. Other modules (requirement text: wording only; code: none)

| module | requirement text | code |
|---|---|---|
| `monitoring` | R31: "`queue-producers` R3" becomes "`machinery-producers` R2"; "`queue-producers` R26" becomes "`machinery-producers` R4". R2's source-modified stays qp's | none |
| `observation-log` | R33: "`queue-producers` R26, R27" becomes "`machinery-producers` R4, R5" | none |
| `network-notices` | Satisfies line: the item contract (`machinery-producers` R5) | none |
| `queue`, `plane`, `instance-setup`, `case-import`, `notice-producers` | none (they name qp R1–R2, R4–R8, R18, R25, R35, R38, which stay) | none: `queue` and `plane/watch.test.mjs` read `queueProducersOf().feedItems` |

**Catalogue rows (C-…) that move: none.**

**`modules.json`:**
- a new entry before `queue-producers`;
- `queue-producers.uses` gains `machinery-producers` and drops `host-governor`, `link-sweep`, `network-notices` and `capture`. Its job confirms each by grep.

`queue`'s `PRODUCER_DEPS` is unchanged, because qp passes the deps through.

## 5. Tests

**Move to `test/m/machinery-producers/`** (re-labelled with the new ids, driving `conditionItems` directly). About 440 lines:
- `conditions.test.mjs` whole (147: R3 ×4, R22);
- `producers.test.mjs` 137–209 (R3 ×4);
- `sweeps.test.mjs` 40–221 (R26 ×4, R27 ×3).

`world.mjs` (166) is copied and adapted. Importing it across modules' test folders is avoided.

**Stay in qp:**
- `sweeps.test.mjs` 222–253 (R8 over R26 and R27, through `feedItems`) and its N483 arms;
- `feeditems.test.mjs` (R8, R12, R13 and R24 sweep every kind through `feedItems`);
- `localday.test.mjs` (R36; its notice windows are now reached through the delegate);
- every other suite.

## 6. Line counts after the split

| module | lines |
|---|---|
| `machinery-producers` | ~1,050 (840 moved, ~200 copied helpers, header and factory) |
| `queue-producers` | **~3,155** (3,974 − 840 + ~20 for the delegate) |
| `queue-producers` after T34 | ~3,455 at 300 lines; ~3,605 at 450 |

**Reserve cut (seam B), for a later tranche.** Cases, imports and wizards (R23, R30–R35, and then R37 and R39) would free another ~640–860 lines.

## 7. Risks

1. **Accepted reds.** There are none in the copy window: qp keeps its copy until its own job deletes it, and the new module's tests are green. Two items are named for acceptance:
   - the plane bundle is stale from the first of the two merges until it is regenerated at L11's close (as K1681);
   - the architecture check while the new `modules.json` entry has empty `paths` (K1043), if it reports one.
2. **R24's word in moved code.** "a signal is a fact about OUR OWN machinery" (`basis.detail`, :487, :2013) and the sweep details (:3120, :3126) now live in the new module. Its job applies T34-54's R24 share in its copy (its R9), so the two copies never disagree in wording. *Flag for BOB:* T34-54's R24 share is now split across two jobs.
3. **Item order.** The R26 and R27 items now arrive inside `conditionItems` at R3's position, not after R23's. `queue` R49/R6 sorts before cutting, so the published order is unchanged. Any test that reads raw `feedItems` order must sort first.
4. **Two copies in the window** (K624 (1)). There is no census effect, because no rows are involved.
5. **The job count.** T34's job count rises by one: **MACHINERY-PRODUCERS #1**. T34-54 also deletes qp's copy and re-points.
6. **Meaning.** None changes. Every key, kind, recipient, bound, word and `basis` is copied verbatim. `feedItems` answers the same items. Re-wording: "this module" in R3, R22, R26 and R27 changes owner.
