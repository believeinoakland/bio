# monitoring (T33)

**Status** · session_01XaKEVPm9N9a9f7CAG1p53m · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings for T33-78; I am building on each now and will bring the work in line if you answer otherwise.
(1) R34, R50, the zone. I read "the local day of the office's or venue's jurisdiction, as actions R12 reads it" as the zone actions itself uses at its R33 write guard: `zoneOf(view)`, the active profiles' combined view's `time_zone` (actions `index.mjs:639`), read through civil-time `localDay` and `dayRange`. Not action-clocks' per-office `actionZone`: where an office's profile zone differs from the view's, a mark on the office's day could be refused `CLOCK_STATUS_NOT_MECHANICAL` by actions' guard, which reads the view's day. With no zone held, R34 marks nothing (actions R33: no entry has passed) and R50 holds no wake (`deadlineRecheckWake` null), stated in `deadlineRecheck`'s answer as `zone: null` with a reason.
(2) R15's new clause. Monitoring's share is: an address that is a register's own query for one identifier is watched exactly as any address (captured, compared), and the tick fetches only that address, following no link out of its answer; monitoring composes no query and takes no person or name from any caller (R36). Refusing a query by name alone or across registers is `following` R9's (`PERSON_QUERY_NOT_NAMED`), not a check here. The test drives a monitored bundle at such a query address whose answer links out, and asserts one fetch, of that address only.
(3) `modules.json`: monitoring's `uses` lacks `civil-time` (the plan's T33-78 names it, and the requirements' Uses list it). I import `../civil-time/index.mjs`; if `checks/architecture.mjs` refuses the edge, I will say so in my COMPLETE for you to set it, as at actions' merge (K1657).

## J2 · COMPLETE

T33-78 applied, on J1's readings as K1665 accepted them. Final `uses`: as `modules.json` now holds them (civil-time added by K1665); no other edge added or dropped.

**Applied**
- R34, R44: `deadlineRecheck` reads "passed" on the local day of the actions' jurisdiction: the active profiles' combined view's `time_zone` (as actions R12 and its R33 guard read it), through `civil-time.localDay`; `pendingClocks` is asked `before` that local day. With no zone held it marks nothing and answers `zone: null`, `undetermined: DEADLINE_NO_ZONE`. The answer gains `zone` and `day`.
- R50: `deadlineRecheckWake` is the start of the local day after the earliest pending date (`civil-time.dayRange(d, d, zone).end`, so 03:00 UTC in Halifax daylight time, 04:00 after 2026-11-01); a failed mark is held to the start of the local day after the failure (N429); no zone, no wake. The UTC-midnight arithmetic (`DAY_MS`) is gone. K1657's red `understanding.test.mjs:480` is re-pinned and green.
- R69: `GATH_ID_RE` is built from `record-grammar.idPattern("GATH")` plus the request's slug; a counter of 4+ digits is accepted, every pre-T33 id stays valid, and the findings on a pre-T33 file are byte-identical (tested).
- R15: the named register query clause. Monitoring watches such an address as any address and fetches only it; a caller's added `person`/`name`/`locator` names nothing fetched (R36). Tested in `cadence.test.mjs` with an answer that links out.
- No following code is added (P6).

**Tests** (`bio-plane/test/m/monitoring/`): 115 pass, 0 fail, 0 skip, 0 todo (110/1 before; +4 tests: R34 R50 local day and DST, R34 R50 no zone, R69, R15; the four R50 tests re-pinned to the local day). Scheduler (a user of R34/R50): 64 pass, 2 fail: R12 (named, AI_NO_ACCOUNT) and `plane.test.mjs:109` "R5, R9 … real alarm marks it overdue" (see below).
**Checks:** format 126 modules, 0 failures; architecture 16 files, 77 imports, 0 failures (after merging K1665); coverage 56 of 56 live ids, 0 failures; ownership 6 files, 0 failures.

**Found in other modules (REPORT)**
1. scheduler `test/m/scheduler/plane.test.mjs:109` (R5, R9, "the real alarm marks it overdue") is red on `tranche/T33` before this job too (verified with my change stashed): the plane instance in that test holds no jurisdiction profile, so actions R33's guard has no zone and refuses every mark, and from this job R50 holds no wake with no zone. It is not on the named-reds list. The fix is the scheduler test's: set `jurisdiction_profiles` to a profile with a `time_zone` on that instance, and date the entry before the local day in that zone (not "yesterday, UTC"). For SCHEDULER #27 (T33-80's job), or a named red.
2. Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (and its `.bundle.json`) carry monitoring's old `GATH_ID_RE` and deadline code; regenerate at L10's close (manifest §14). `release/bio-plane.bundled.mjs` also carries the old `GATH_ID_RE`, for the release.
3. Requirements marks: R15, R34, R50 and R69's "not yet met: T33-78" can be struck.

**Deferred:** none.

Size (session_01XaKEVPm9N9a9f7CAG1p53m): test runs 10, module lines 3406
