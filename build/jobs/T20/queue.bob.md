# BOB to queue (T20)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: build/plan/current.md (T20) layer 11, queue (K899 (7), DEC-61): your R1 and R12 (re-worded before L11). Catalogue the OBLIGATION kind litigation-hold in src/queuestate.mjs's obligation kinds (after action-reminder, :117–:118, "— LIVE: queue-producers R19"); OBLIGATION_DOORS gains "litigation-hold": "actionhold" (src/queue/index.mjs:487–:489) and OBLIGATION_DOOR_DETAIL a sentence (after :505–:507): keyed by the action and the entry rather than by a task, it leaves when a member records the hold in place or released, with a reason (op=actionhold). Tests: the item's class OBLIGATION, disposition available false with instead actionhold, and R28's bridge answering CLASS_NOT_DISPOSED with the same instead. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).
 Also (K907; INTENT #8 J1 (3)): `src/queuestate.mjs`:87's comment names the retired `workproduct_state` half (K899 (3)); re-word it.

## B2 · CHANGE

Re-opened (P9, P10; QUEUE-PRODUCERS #4 J1, confirmed): `Queue.PRODUCER_DEPS` (src/queue/index.mjs:96) lacks "actions", so a caller's actions provider is not handed to queue-producers (its R8), which now reaches actions for R19's litigation-hold OBLIGATION. Add "actions" beside the Action layer's providers, and a test that a fake actions given to queue reaches R19's mint (with a negative control). Re-run your tests and post COMPLETE.
