# filings (T33)

**Status** · session_016bMsS73oBXsth94UBVz1Tn · depth 2 · COMPLETE · handled B5

## Progress

- **T33-75 applied (R33).** The counsel packet's chronology is now `events.timeline` (its R28–R30) over the set of the determination's act event (conformance R25's `act.event`, an object or a bare id), the counterparty office entity (the addressee's `entity_id`, actions R9, else the act's actor's) and each finding's `subject_entity` (read from its published bytes), from the act's date (or the period's start; with neither, the earliest) to the assembly day. The world's lane and each registered source's lane are answered apart, in events' order, each item naming its source; placed-nowhere events are read without the date bounds and listed apart; R27: an event the reader may not see is left out and the lane states `out_of_view: true` (read against the plane's read). The captures attesting each listed event join R9's exhibits. The old composed chronology is gone. `uses` gains `events` (the requirement names it; `modules.json` is BOB's).
- **K1519 (R9, R30).** The test profiles' deadlines lacked `status` (jurisdictions R26 now refuses them): fixed. `deadlineDate` now hands the profile's rule whole (its `closures`, `roll`…) to `action-clocks.computeDeadline`, the one count, so the closure-list skip is action-clocks' (T33-74); R30's test stays red until action-clocks merges (it reads the `list` entries as office entries today).
- **B4 (conformance merged, K1654): re-pointed.** The fixture's act is an event (`ACT_EVENT`, an adoption on 2026-03-02), and R33's test uses the real conformance with no stand-in. A T33 act (`{id, event, actor, evidence, when}`) is read by its event: the `act` blank names the event's kind and id (its source the event), `act_date` is the event's `when` as one day, else undetermined with why (a band, or placed nowhere). The same day starts an `act` deadline, bounds the chronology and asks `inForce`. A pre-T33 act's description, date and period are still read when conformance answers them (its R26). Filings 63/64.
- **B5 (action-clocks, consequences and actions merged, K1655, K1657, K1658): done.** R30 now runs on the real count: the expected dates are re-derived on the test profile's own weekend (Sunday alone; civil-time reads it from the profile, never code), `received` is counted from the group's first `sent` entry (C-1), and a local-facts act's day is the profile's local day (K1581). Filings 64/64.

## J1 · REPORT

T33-75 built and pushed on `job/T33/filings` (f07ef18e00): the packet's chronology is `events.timeline` over the act's event, the counterparty office entity and each finding's `subject_entity`, from the act's date to the assembly; the two lanes apart; placed-nowhere listed apart; R27 `out_of_view` on the world lane; the listed events' captures join R9's exhibits. Filings 63/64; coverage 32/32; format 0; ownership 0.

1. **uses:** filings gains `events` (R33's Uses already names it). Architecture's two failures until `modules.json` has it are that edge alone. No other edge changes.
2. **K1519 (my red):** the test profiles' deadlines lacked `status`, which jurisdictions R26 now requires. Fixed. `deadlineDate` now hands the profile's rule whole (`closures`, `roll`…) to `action-clocks.computeDeadline`. So the closure-list skip is action-clocks' alone (T33-74), and R30's test stays red until it merges.
3. **Finding in `events` (against its R28/R29):** `timeline` with `from` or `to` drops every placed-nowhere item (`#range` keeps only items with a `when`), so a dated read never lists "placed nowhere". Filings works around it by reading placed-nowhere items in a second read without dates. That stays correct after any fix.
4. **Before COMPLETE** (K1563 (1)), I wait for two merges. After conformance (T33-70), `determine` requires `act.event`, so my fixture and R33's proxy are re-pointed to the real module. After action-clocks (T33-74), I re-run R30. Ring me with a CHANGE when each has merged.

## Completion

**Entries applied:** T33-75 (R33, K1494). K1519's red (R9, R30) cleared. B2 (K1650), B3 (K1653), B4 (K1654) and B5 (K1658) processed.

**Final `uses`:** as `modules.json` now holds it (K1653): record-grammar, jurisdictions, record-core, membership, promotion, provenance, attestation, content, publication, standards, conformance, consequences, actions, action-clocks, public-read, strength, filing-templates, local-facts, events. The tests also read `entities` through publication's world (`w.connections.entities`), importing no entities file.

**Deferred:** none. A pre-T33 act (description, `at`, `period`; conformance R26) is still read when conformance answers one. No test drives it, since conformance mints no such act from T33 on.

**Found in other modules (reported in J1):**
- `events` R28/R29 (N602): `timeline` with `from` or `to` drops every placed-nowhere item. Filings reads placed-nowhere items without dates, which stays correct after a fix.
- `escalation` `stages.test.mjs:43` (R6) fails identically on `tranche/T33` without this job's changes (as of a26298400e). It is not caused by filings; it is likely actions' local-day change (K1657), escalation's own job.

**Tests and checks** (on `job/T33/filings` after merging `tranche/T33` @ B5):
- `node --test bio-plane/test/m/filings/`: tests 64, pass 64, fail 0.
- `node --test bio-plane/test/m/escalation/` (a user of filings): 51 pass, 1 fail, the same failure as on the tranche.
- `checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `checks/architecture.mjs filings`: 15 product files, 71 relative imports; 0 failures.
- `checks/coverage.mjs filings`: 32 of 32 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs filings tranche/T33`: 0 failures.

Size (session_016bMsS73oBXsth94UBVz1Tn): test runs 24, module lines 2118

## J2 · COMPLETE

T33-75 complete on `job/T33/filings`. B2–B5 processed: tranche merged at B5, re-pointed at conformance's T33 act and at action-clocks' count. Filings 64/64; format, architecture, coverage (32/32) and ownership each 0 failures. Final `uses` as `modules.json` holds them (K1653), `events` included.
- R33 runs on the real conformance and events, with no stand-ins. A T33 act is read by its event: the `act` blank names the event's kind and id, and `act_date` is its `when` as one day, else undetermined with why. That day also starts an `act` deadline, bounds the chronology and is the date `inForce` is asked at.
- K1519 cleared. R9 and R30 run on action-clocks' count. Their expected dates are re-derived on the test profile's own weekend (Sunday alone), on C-1 (`received` counted from the group's first `sent`) and on K1581's local day.
- Escalation (my user): 51/52. `stages.test.mjs:43` (R6) fails identically on `tranche/T33` without my changes. It is not filings'; it is likely K1657's local day, escalation's own job.
Record: `build/jobs/T33/filings.md`, Completion.
