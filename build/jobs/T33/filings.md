# filings (T33)

**Status** · session_016bMsS73oBXsth94UBVz1Tn · depth 2 · WAITING ON BOB (J1) · handled B4

## Progress

- **T33-75 applied (R33).** The counsel packet's chronology is now `events.timeline` (its R28–R30) over the set of the determination's act event (conformance R25's `act.event`, an object or a bare id), the counterparty office entity (the addressee's `entity_id`, actions R9, else the act's actor's) and each finding's `subject_entity` (read from its published bytes), from the act's date (or the period's start; with neither, the earliest) to the assembly day. The world's lane and each registered source's lane are answered apart, in events' order, each item naming its source; placed-nowhere events are read without the date bounds and listed apart; R27: an event the reader may not see is left out and the lane states `out_of_view: true` (read against the plane's read). The captures attesting each listed event join R9's exhibits. The old composed chronology is gone. `uses` gains `events` (the requirement names it; `modules.json` is BOB's).
- **K1519 (R9, R30).** The test profiles' deadlines lacked `status` (jurisdictions R26 now refuses them): fixed. `deadlineDate` now hands the profile's rule whole (its `closures`, `roll`…) to `action-clocks.computeDeadline`, the one count, so the closure-list skip is action-clocks' (T33-74); R30's test stays red until action-clocks merges (it reads the `list` entries as office entries today).
- **B4 (conformance merged, K1654): re-pointed.** The fixture's act is an event (`ACT_EVENT`, an adoption on 2026-03-02), and R33's test uses the real conformance with no stand-in. A T33 act (`{id, event, actor, evidence, when}`) is read by its event: the `act` blank names the event's kind and id (its source the event), `act_date` is the event's `when` as one day, else undetermined with why (a band, or placed nowhere). The same day starts an `act` deadline, bounds the chronology and asks `inForce`. A pre-T33 act's description, date and period are still read when conformance answers them (its R26). Filings 63/64.
- **Waiting before COMPLETE:** action-clocks' merge (T33-74), to re-run R30 (K1650: `deadlineDate` now counts on the profile's view only).

## J1 · REPORT

T33-75 built and pushed on `job/T33/filings` (f07ef18e00): the packet's chronology is `events.timeline` over the act's event, the counterparty office entity and each finding's `subject_entity`, from the act's date to the assembly; the two lanes apart; placed-nowhere listed apart; R27 `out_of_view` on the world lane; the listed events' captures join R9's exhibits. Filings 63/64; coverage 32/32; format 0; ownership 0.

1. **uses:** filings gains `events` (R33's Uses already names it). Architecture's two failures until `modules.json` has it are that edge alone. No other edge changes.
2. **K1519 (my red):** the test profiles' deadlines lacked `status`, which jurisdictions R26 now requires. Fixed. `deadlineDate` now hands the profile's rule whole (`closures`, `roll`…) to `action-clocks.computeDeadline`. So the closure-list skip is action-clocks' alone (T33-74), and R30's test stays red until it merges.
3. **Finding in `events` (against its R28/R29):** `timeline` with `from` or `to` drops every placed-nowhere item (`#range` keeps only items with a `when`), so a dated read never lists "placed nowhere". Filings works around it by reading placed-nowhere items in a second read without dates. That stays correct after any fix.
4. **Before COMPLETE** (K1563 (1)), I wait for two merges. After conformance (T33-70), `determine` requires `act.event`, so my fixture and R33's proxy are re-pointed to the real module. After action-clocks (T33-74), I re-run R30. Ring me with a CHANGE when each has merged.
