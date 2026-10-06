# queue-producers (T33)

**Status** · session_01Wn5K5a2uihWZxsspmLhjpn · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

T33-81, R25 and R36: where this module reads each subject's zone, and one file of yours.

(1) `build/modules.json`: queue-producers' `uses` lacks `civil-time` (the requirements' Uses gained it, K1444); `checks/architecture.mjs` refuses my import until it is there. Please add it (it is layer 1, earlier in the order).

(2) No provider answers me a zone, and my Uses name no zone read. action-clocks R3 answers `local_day` but not the zone; R5 answers neither; action-plans R17, local-facts R4 and network-notices R22 answer days or instants with no zone. My best reading, which I am building now:
  (a) R15, R18 (the action's office's or venue's zone, "as actions R12 reads it"): the item's own `zone` when action-clocks carries it; else the zone `actions` R12 reads, `zoneOf(actions.place())` (actions' exports: the active profiles' combined view's `time_zone`). That is what actions' `actionFacts` reads today; action-clocks' `actionZone` additionally prefers a counterparty's own profile zone, so the two can differ for an office whose profile names another zone. If you want them identical, the clean fix is a CHANGE to action-clocks R3/R5: each item carries `zone` (the one it already computes for `local_day`); I read it first already.
  (b) R16 ("the instance profile's time_zone"), R21 (a fact's `lapses_on`/`due_from`, local days of its profile's zone, local-facts R3) and R27's lapse-near and closed windows (also days compared against now, at index.mjs :3118–3132, not among R36's five named sites but within "every day this module ... compares"): the same instance zone, `zoneOf(actions.place())`.
  (c) With no zone held, the day and the age are undetermined, stated (`reason: "zone_undetermined"`); `due` (R25) is then null for R16, whose day is an instant read in the zone; for R15 and R18 `due` stays the entry's date, already a local day by action-clocks' Terms.
  (d) civil-time services: `localDay`, `span` and also `dayRange` (R7: the first instant of a local day, for each `age.since`, which queue parses as an instant). The requirements' Uses (Private) would then read: `actions`: `place`, `zoneOf` (R25, R36); `civil-time`: `localDay`, `dayRange`, `span`.
Nothing waits on the answer except the source of the zone; I carry on.

## J2 · REPORT

Findings outside my module, and one of size (T33-81).
1. **Requirements text (yours, K1675)**: `build/requirements/queue-producers.md` Uses (Private) still reads `civil-time`: `localDay`, `span` and has no `actions` zone read. As accepted, it should read `actions`: … `place`, `zoneOf` (R25, R36), and `civil-time` (T33-81): `localDay`, `dayRange`, `span`, `isCalendarDate` (R25, R36). I also use `isCalendarDate` (civil-time R6) for "is this a day", in place of the old `Date.parse(…T00:00:00Z)` test. Please add it with the rest. R36's site list (`index.mjs`:2449 …) now points at moved lines; the sites are the five producers it names.
2. **action-clocks (N609, T34)**: R3 and R5 items carry no `zone`. Until they do, R15 and R18 read the zone `actions` R12 reads, which differs from action-clocks' own `actionZone` for an office whose own profile names another zone. In that case the day action-clocks judged past and the day I age from could differ by one. My code already reads `zone` on the item first.
3. **actions**: `place()` and `zoneOf` are exported and used by retrieval and now by me, but no requirement of `actions` provides them. They want a Provides line (R12's), so a later job can't drop them unnoticed.
4. **publication → case-tensions (K1643)**: my job did not touch the `caseTensions` import (R6), so it still reads through publication's delegate. Re-pointing needs `case-tensions` in my uses and R6/Uses re-worded. It's left for a later job; not this entry.
5. **Generated artifact**: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from this job's change to `bio-plane/src/queue-producers/index.mjs`. It gets regenerated at the close.
6. **Size (P6, K617)**: queue-producers is now 3,974 lines (index.mjs 3,833, proposals.mjs 141), within about 30 lines of the split mark. The next job that adds to it should split first. The natural seams are the action layer (R15–R21, ~550 lines) or the docket and watch producers (R30–R35, ~450 lines).

## J3 · COMPLETE

T33-81 complete (B1, B2 applied; tranche/T33 merged at 79837a65f0's descendant, K1675). Commit 28cfb9937d on job/T33/queue-producers.

**Entries applied**
- R36, R25 (C-3b, K1444 (iii); readings (a)–(d) accepted, K1675). Every day this module derives or compares is now a local day through civil-time (`localDay`, `dayRange`, `span`, `isCalendarDate`), never a UTC day:
  - R15's age runs from the first instant after the entry's local day.
  - R16's checkpoint ages from its day's first local instant; one stated as an instant is read on its local day for `due`.
  - R18's reminder day and age.
  - R21's `due_from`/`lapses_on`.
  - R27's lapse window, its 30-day closing window and an attestation's `as_of` day.
- Ages now carry `days` (whole local days, `span`). The zone comes from the action item's own `zone` when named (N609 will supply it), else `zoneOf(actions.place())`, the zone actions R12 reads, read once per `feedItems`. Each of these items' basis states `zone`. With no zone held (or one the runtime doesn't know), age is `undetermined` with `reason: "zone_undetermined"`, saying it is never counted on UTC. R16's `due` from an instant is then null; R15 and R18's `due` stays the entry's date, already a local day. R27 withholds nothing for want of a zone: the lapse window is read at the latest local day any zone has reached (Etc/GMT-14), and a closing stated only as a day stands.
- K1658: R15's items state action-clocks' `local_day` and `basis_of`, and `bound.zone_undetermined` is summed over every page read.
- R2: the four T33 FINDING kinds are notice-producers'. None is raised here (it was already true; now tested over the every-producer feed).
- Nothing new is produced (P6).

**Deferred**: none in this module. Requirements wording and other modules' items are in J2.

**Tests and checks**
- `node --test test/m/queue-producers/`: 85 pass, 0 fail (was 80; new: `localday.test.mjs` ×4, R2 in `feeditems.test.mjs`). The new R36 tests run west of UTC at the day boundary and fail by name when the zone is forced to UTC (mutation run: 2 of 3 failed). The existing R15, R16, R18, R21 and R27 expectations now include `days`; R16's `since` is now an instant; R27's closed window is counted in local days, not 720 hours.
- Users of this module: `test/m/queue/`, `test/m/publication/casedoc.test.mjs`, `test/m/plane/watch.test.mjs`: 130 pass, 0 fail (same before and after).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs queue-producers`: 0 failures. `checks/coverage.mjs queue-producers`: 36 of 36, 0 failures. `checks/ownership.mjs queue-producers tranche/T33`: 0 failures.

Size (session_01Wn5K5a2uihWZxsspmLhjpn): test runs 15, module lines 3974
