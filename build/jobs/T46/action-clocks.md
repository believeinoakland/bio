# action-clocks (T46)

**Status** · session_01DhUXTVeJCC1jtm51pfpgGh · depth 2 · WORKING · handled B2

## Completion (ACTION-CLOCKS #12)

**Entry applied** · T46-34 (N918, N925): R19 and R20 met.
- **R19** `pendingClocks`' items carry `due_at` and `due_zone`, read by the same `dueAtOf` R3 and R18 use (so `actions` R98's reading and `monitoring`'s agree): the entry's time and its `due_zone`, else the action's zone (`actionZone`, read lazily, once an action, only for a timed entry stating none); else both null. R1's refusal, order, paging and bounds unchanged. Ruled here (detail, mine): a timed entry of an action with no zone held and no `due_zone` answers its `due_at` with `due_zone: null`, as R3 already did; a reader then has the wall time and no zone, never a zone guessed.
- **R20** `clockProposalsFor({action, viewer})`, `op=clockproposals` (a read; `action` from query or body, `viewer` the stamp from the query): the standing (unadopted) proposals in (rule, proposer) order, each `{key, rule, date, undetermined, basis, entry, trace, trace_line, candidates?, due?, label: {by, state, machine_work, says}, proposed_by, proposed_at}`; `[]` when none; at most 500 (`CLOCK_PROPOSALS_MAX`) with `truncated`; absent or invisible is `actions.noSuchAction`. A two-candidate date answers `date` (the earliest, as R2 stores it) with `candidates`. Writes nothing.

**Improvement in my module** · `#entryPage` hands each item the action's document it already read; `overdueClocks` and `ourDeadlines` no longer read each document a second time.

**Read** · requirements (whole) and all module code (`index.mjs`, `count.mjs`, `checks.mjs`, `ics.mjs`, `schema.mjs`) whole; tests `fixture.mjs`, `clocks.test.mjs`, `adopt.test.mjs`, `t45.test.mjs` whole myself. Over the 600 KB limit (mechanics §17 (3)): helpers in this session read whole and digested, citing each section, (a) `calendar`, `factreader`, `ics`, `lateness`, `overdue`, `reminders`, `worked` tests; (b) the public parts of all 16 used modules, plus monitoring, affordances, op-declarations and `build/layers.md` layer 9. The sources stayed binding.

**Deferred (my module's tests, flaws the digest found, none affecting a requirement's compliance)** · test-only wording, left for a later job to keep this one to its entry: `reminders.test.mjs` pins the ops-map keys inside a stamps test; `lateness.test.mjs`:92 a control that cannot fail (no reminder ever set); some titles claim more than they check (factreader "R12 a lapsed confirmation … the count says so", worked "each with its negative control" (O2–O4 have none), overdue R7 "same document before and after every read"); `factreader.test.mjs`:129–135 replaces `localFacts.factStatus` on the instance. Each requirement named is otherwise tested at the interface.

**Found in other modules (REPORT J3)** · serving `op=clockproposals` opens one red not inherited: `affordances` "R1 R12: layer 9's op maps hold exactly …" (the op is in no catalogue yet). `op-declarations` needs a spec (`"action-clocks"` family, `clockproposals: "read"`, viewer stamped, NEEDS null; its R6, R49/R51) and help text or `ACT_HELP_ABSENT` (R34); `op-grades` a grade; `affordances` (T46-45) its catalogue row and R51's `clockadopt` offer. Its R6 tests in op-declarations were already red before this change (7 reds, same titles before and after); plane's 1 red likewise inherited.

**Tests and checks** (on `job/T46/action-clocks` with `tranche/T46` merged per B2; no red opened by the merge)
- `node --test test/m/action-clocks/`: tests 70, pass 70, fail 0.
- Users' tests, before/after this change: action-replies 16/0, filings 92/0, action-plans 75/0, plan-work 40/0, monitoring 134/0, action-producers 36/0, answer-envelope 32/0 unchanged; affordances 232/2 → 231/3 (the one above); op-declarations 133/7 and plane 210/1 identical before and after (inherited).
- `checks/format.mjs`: 0 failures; `architecture.mjs … action-clocks`: 0 failures; `coverage.mjs … action-clocks`: 20 of 20 live ids named, 0 failures; `ownership.mjs … tranche/T46`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (2963 files), channels 0; coverage 23 failures, none action-clocks' (interface and screens modules, monitoring R73, plan-work R14 R15, op-grades R33, setup-page R31, setup-words R5, wizard-scripts R29 R30, notice-producers R19).

Size (session_01DhUXTVeJCC1jtm51pfpgGh): test runs 7, module lines 2090

## J1 · REPORT

Serving op=clockproposals (R20) opens one red not inherited: affordances 'R1 R12: layer 9's op maps hold exactly …' (the op is in no catalogue yet). It needs: op-declarations a spec in the action-clocks family (clockproposals: "read", viewer stamped, NEEDS null; its R6, R49/R51) and help text or ACT_HELP_ABSENT (R34); op-grades a grade (R33); affordances (T46-45) its catalogue row and R51's clockadopt offer through clockProposalsFor. op-declarations' 7 reds and plane's 1 are identical before and after this change (inherited).

## J2 · COMPLETE

T46-34 applied: R19 (pendingClocks items carry due_at/due_zone via dueAtOf, as R3) and R20 (clockProposalsFor, op=clockproposals, cap 500) met; tranche/T46 merged per B2, no red opened. action-clocks 70/70; format, architecture, coverage (20/20), ownership 0 failures; run.mjs architecture 0. One red in affordances from the new op (REPORT above). Record: build/jobs/T46/action-clocks.md on job/T46/action-clocks.
