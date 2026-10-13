# action-clocks (T47)

**Status** · session_01DV7d612TSVz2gLVE9X2Re4 · depth 2 · COMPLETE · handled B3

## Completion (ACTION-CLOCKS #13)

**Entry applied** · T47-39: R21, R22, R23 met; N961 applied (test only); R2's wording re-point needs no code.
- **R21 (N960)** Every day is read in `actions.actionZone(fm, view)` (actions R100), imported from `actions`. `count.mjs`' own `actionZone` and its `jurisdictions.get` import are removed, and `index.mjs` no longer exports one. R1's fallback `due_zone`, R3's and R5's local day and `zone`, R14's `TZID`, R15's day and R2's count each read actions' zone. `actionOffices` stays here: it is the office-calendar read for R10 and R11 and the read for R23, and actions R100 provides only the zone. Tested with two active profiles of different zones (the test profile and the first profile).
- **R22 (N965)** `dueAtOf(entry, zone)` is exported. It is pure and never throws. A `due_at` is a real local date-time (hour 00–23, minute and second 00–59, a calendar day), and `clockState` and `clockAdopt` judge it the same way, so `T24:00` is `CLOCK_ENTRY_REFUSED`, arm `due_at` (ruled here, a detail: the old pattern admitted hour 99).
- **R23 (N968)** Each `overdueClocks` item carries `venue`, read through the same office-or-venue read as the zone (`venueOf(fm, view)`, exported):
  - `{kind: "office", role, body}` for an office addressee;
  - else `{kind: "venue", action_kind, name}`, with `name` the view's `action_kinds[].venue.name`;
  - else `null` with `venue_why`.
- **N961** `t45.test.mjs` records receipts and service through action-records' `actionReceipt`, reached as `actions.records`, the one instance actions creates (no import of a module this one does not use).

**Flaws fixed in my module (P8)** · deferred by ACTION-CLOCKS #12: `worked.test.mjs` O2–O4 now have negative controls; `factreader.test.mjs` "the count says so" now checks the count's statement; `overdue.test.mjs` R7 checks the document is unchanged by the reads themselves.

**Kept, with why** · `computeDeadline` still anchors a stated start day in `UTC` when no zone is held (`count.mjs`). It counts from a day the ledger states, never from the local day of an instant, and R2's pure-caller tests count with no view. R21's "never the UTC day" governs the local day of the instance clock, which no read here takes in UTC.

**Read** · My requirements, all module code (`index.mjs`, `count.mjs`, `checks.mjs`, `ics.mjs`, `schema.mjs`) and all tests, each whole, by me. Over the 600 KB limit (mechanics §17 (3)): a helper in this session read whole and digested, citing each section, the used modules' public parts named in my Uses (actions, jurisdictions, action-records, civil-time), `build/layers.md` layer 9 and its shared rules, and the split map §§4–8. The sources stayed binding. After B3, I read actions' `actionZone` and `records` getter whole.

**Found in other modules** · none beyond the TABLE_DECLARED clash already reported (J2), which actions' merge resolved.

**Tests and checks** (on `job/T47/action-clocks` with `tranche/T47` merged per B3)
- `node --test bio-plane/test/m/action-clocks/`: tests 74, pass 74, fail 0.
- Users' and providers' tests: action-producers 45/0, queue 142/0, monitoring 137/0, action-plans 79/0, filings 107/0, action-replies 25/0, plan-work 45/0, actions 130/0, action-records 19/0. answer-envelope 25/8: the 8 are its catalogue-list reds, each also red on tranche/T47 (inherited).
- `checks/format.mjs`: 0 failures. `architecture.mjs … action-clocks`: 0 failures. `coverage.mjs … action-clocks`: 23 of 23 live ids named, 0 failures. `ownership.mjs … tranche/T47`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (3122 files), channels 0; coverage 29 failures, none action-clocks'.

Size (session_01DV7d612TSVz2gLVE9X2Re4): test runs 14, module lines 2122


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
