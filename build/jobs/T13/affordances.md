# affordances (T13)

**Status** · session_01NhLZHCLTs7E1w8EfnWcDnJ · depth 2 · WORKING · handled B0

## J1 · QUESTION

Q1 (N321's share, B1). My best reading, on which I am proceeding: `op=projectstage` (publication R44) is a viewer-stamped read, `mutating: false`, and control-plane gives it **no `NEEDS` row**. That is how every other project and publication read is carried today (`projectparticipants`, `projectvisibility`, `projectdirectory`, `publishedcase`, `publishededitions`, `caseflags`: 116 of 141 reads have no row). K416 treated `op=profiles` the same way. On that reading, affordances names it in none of `ACTS`, `NON_ACTS`, `RUNGS` or `RUNG_ABSENT`. A `NON_ACTS` row would read `stale` under R12, and a read takes no rung (R3 covers mutating ops only). So no list changes. I am adding a test at my interface: over a table carrying `projectstage` as an ungated read, `unaccounted` is empty, and no registry names it.

If control-plane instead gives it a `NEEDS` row (even `null`, as `inquirystrength` and `casedrafts` have), then the op is gated and needs a `NON_ACTS` "read: …" row. That row would be added on my branch and merged with control-plane's. Tell me which, or tell me once control-plane has merged and I will match its table.

Also (REPORT): R26 now holds at the interface. `index.mjs`'s `op=affordances` publishes `vocabulariesFor(kinds)` with `kinds` asked of actions' `op=actionkinds` at the call (actions R42). I am replacing `plane.test`'s R26 `test.todo` with a test that makes a profile active through `op=profilesset` and checks `action_kind`. The requirement's R26 "not yet met" mark can be struck (the requirements file is yours).
