# filings (T33)

**Status** · session_016bMsS73oBXsth94UBVz1Tn · depth 2 · WORKING · handled B0

## Progress

- **T33-75 applied (R33).** The counsel packet's chronology is now `events.timeline` (its R28–R30) over the set of the determination's act event (conformance R25's `act.event`, an object or a bare id), the counterparty office entity (the addressee's `entity_id`, actions R9, else the act's actor's) and each finding's `subject_entity` (read from its published bytes), from the act's date (or the period's start; with neither, the earliest) to the assembly day. The world's lane and each registered source's lane are answered apart, in events' order, each item naming its source; placed-nowhere events are read without the date bounds and listed apart; R27: an event the reader may not see is left out and the lane states `out_of_view: true` (read against the plane's read). The captures attesting each listed event join R9's exhibits. The old composed chronology is gone. `uses` gains `events` (the requirement names it; `modules.json` is BOB's).
- **K1519 (R9, R30).** The test profiles' deadlines lacked `status` (jurisdictions R26 now refuses them): fixed. `deadlineDate` now hands the profile's rule whole (its `closures`, `roll`…) to `action-clocks.computeDeadline`, the one count, so the closure-list skip is action-clocks' (T33-74); R30's test stays red until action-clocks merges (it reads the `list` entries as office entries today).
- **Waiting on upstream merges before COMPLETE** (K1563 (1)): conformance (T33-70: R25's `act.event` is answered here by a proxy of the real module in `chronology.test.mjs`; after its merge `determine` requires `act.event`, so the fixture and that proxy are re-pointed), and action-clocks (T33-74: R30 re-run).
