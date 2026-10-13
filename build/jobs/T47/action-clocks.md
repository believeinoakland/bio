# action-clocks (T47)

**Status** · session_01DV7d612TSVz2gLVE9X2Re4 · depth 2 · WORKING · handled B2

## J1 · REPORT

Progress on T47-39, pushed on job/T47/action-clocks (6e80269144):
- N965 / R22 met: `dueAtOf(entry, zone)` is exported. Pure, never throws. A due_at must be a real local date-time (hour 00–23, minute and second 00–59, a real calendar day); clockState and clockAdopt use the same test, so an hour 24 is now CLOCK_ENTRY_REFUSED (arm due_at). Tested by name in t47.test.mjs, with the four controls.
- N968 / R23 met: each overdueClocks item carries `venue`. It is {kind:"office", role, body} for an office addressee; else {kind:"venue", action_kind, name}, with name = the view's action_kinds[].venue.name; else null with `venue_why`. It reads the same office-or-venue read (actionOffices) the zone rests on. Exported as `venueOf(fm, view)`. Tested with its three controls; R3's order and paging are unchanged.
- Fixed in my own tests (flaws the T46 job deferred): O2–O4 negative controls in worked.test.mjs; the lapsed-confirmation count statement in factreader.test.mjs; overdue R7's "document unchanged by the reads".
- Waiting on merges, as B1 says:
  - N960 / R21 waits for `actions.actionZone` (not yet on origin/job/T47/actions).
  - N961 (t45.test.mjs driving action-records' actionReceipt) waits for action-records to merge.
  - I will apply both on your CHANGE. Note: coverage counts R21 as named only because of a comment mentioning "record-core R21". It gets a real test with the CHANGE.
- Reading on R21 (no answer needed unless you differ): I keep `actionOffices` in count.mjs for R10 and R11's office calendar and for R23, because actions R100 provides only actionZone. If actions also exports actionOffices, I will import it instead.
- Checks: action-clocks 73/73; format, architecture, coverage (23/23) and ownership all 0 failures.
- Users' tests on this branch: action-producers 45/0, queue 142/0, monitoring 137/0, action-plans 79/0, filings 97/0, plan-work 45/0. action-replies 17/6 is identical on tranche/T47. answer-envelope 25/8: every one of the 8 also fails on tranche/T47 (its catalogue-list reds). No red is opened by this change.
- How the reading set was read: requirements and all module code and tests read whole by me; the used modules' public parts, layers.md layer 9 and the split map read whole by a helper in this session, which wrote a digest citing each section.

## J2 · REPORT

B2 is done.
- I merged tranche/T47 into this branch.
- t45.test.mjs now records receipts and service through action-records' actionReceipt, via a lazy `w.records()` in the fixture (actionRecordsOf on the same host). R2's start is still read through actions.actionRead.
- This makes two tests red until actions merges: t45 "R2 (T45) a received rule counts from the receipt…" and "R2 (T45) a served rule…".
  - Cause: actionRecordsOf throws at creation with TABLE_DECLARED ("action_law_proposals is already declared by actions"). On the tranche, actions still declares the six tables that action-records now declares, and a host allows each table to be declared once.
  - Fix: actions' T47-38 job, whose factory creates action-records and drops its own declarations. Nothing in action-clocks can fix it short of a stand-in that bypasses action-records' factory, so I built none.
- Every other test passes: action-clocks 71/73, the 2 being the above.
- I will re-run when your second CHANGE (actions merged, R21) arrives, then apply R21 and complete.
