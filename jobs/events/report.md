## EVENTS · T53 layer 5 · completion report #2 (CHANGE K5818)

Entry applied: K5818 (R31, R40). `sequence` refuses an event the viewer may not see with `NO_SUCH_EVENT`, as an absent one, alike: no order, date or why is answered for it (`bio-plane/src/events/index.mjs`, `sequence`). An absent viewer sees no event, so it gets the refusal too (Terms: fail closed).

Tests changed with it:
- settle.test.mjs: a new K5818 test. An outsider sees one event and not the other, either way round, and its answer equals the answer for an event never held, apart from the id as asked. A member of the fenced project sees both and gets the order (the control). F1's test now reads the absent viewer's refusal for a cited pair and a dated one.
- The tests that asked `sequence` with no viewer (events.test 122 and 262, follow.test 160, ops.test 39 and 72, reads.test 148, reasons.test 41, 48, 55, 62 and 80) now ask as the reading member. drawn.test 192: the absent viewer reads `NO_SUCH_EVENT`, and still no cited order.

Not done: nothing. The first completion's report (comment on this PR) stands for the six T53 entries. BOB accepted its readings of R60 and R11 (K5818).

Found in other modules: none. people's one caller (`people/index.mjs:1179`) passes the viewer it read the events with, and its suite is green against the change (91/91).

**Met** · R31

**Evidence**
- `node --test test/m/events/` (in bio-plane): tests 122, pass 122, fail 0
- `node --test test/m/people/` (in bio-plane): tests 91, pass 91, fail 0
- bio-plane/test/m/events/settle.test.mjs: the test "R31 R40 (K5818) an event the viewer may not see is refused NO_SUCH_EVENT …"

Tests: 122/122. Checks: format, architecture, coverage, fixtures, ownership: no new finding.
Size: test runs 2, module lines 3008. Head 61a93868c4.