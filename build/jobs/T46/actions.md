# actions (T46)

**Status** · session_01Ewqc3hwvUSkbtBS4noGEft · depth 2 · COMPLETE · handled B0

## Completion (ACTIONS #18)

**Reading.** Read whole: `roles/JOB.md`; BOB's B1; `build/requirements/actions.md` (public and private); the plan's T46-32 entry and "Rules at the opening"; this module's code (`index.mjs`, `schema.mjs`) and every test file under `bio-plane/test/m/actions/` (P20). The reading set measured 1168 KB at START (K2700). Requirements, code and tests (about 570 KB) were read whole by me. The used modules' public parts were read whole by one helper in this session, who wrote a digest citing each R of record-grammar, jurisdictions, civil-time, record-core, membership, promotion, provenance, content, connections, retrieval, inquiry, conformance, entities, lines, events, standards, duties, action-grammar, progressions, intent, consequences, project-roster, local-facts, plus action-clocks and extraction. The sources stay binding (mechanics §17 (3)).

**Entries applied (T46-32).**
- **(N922) R98, amending R33.** In the mechanical-clock region (`#writeArms > is-promote-clock-mechanical`), the moves `clockMovesNotMechanical` reports are filtered. A `pending` → `overdue` move of a held entry carrying `due_at` is admitted once its instant has been reached.
  - The instant comes from `dueInstant(entry, zone)`, newly exported: `due_at` (`YYYY-MM-DDTHH:MM[:SS]`, on the entry's own date) read through `civil-time.bounds` in the entry's `due_zone`, else in R12's zone (`zoneOf(place())`).
  - A wall time the zone skips or repeats reads as no instant (by its date alone, never moved early). This mirrors `monitoring`'s `instantOfDueAt`.
  - "Passed" is `now >= instant`, as `monitoring` R34 marks an entry due at that instant.
  - Date-only entries are judged as before. Every other status change, re-dating or re-timing is still `CLOCK_STATUS_NOT_MECHANICAL`; its detail now says "date, or stated time of day".
- **(N913) R99.** `ACTIONS_WORDS` is a new frozen map holding `words.json`'s `en` verbatim for the five keys, read by key as `HANDLE_WORDS` and `TRANSCRIBE_WORDS` are.
  - `T45_SENTENCES` now answers `{key, says}` with those words. The sites (R74, R82, R87, R92, R93) are unmoved.
  - For `actions.reply.not_owed`, `{reason}` is left for the screen and the member's recorded reason (`reply_owed_reason`) is answered beside it: `reply_owed.reason` in the read, and `reply_owed_reason` beside `NO_REPLY_OWED`. It cannot be `reason` there, since that field is the refusal's code.
  - No refusal row is this module's (action-grammar R9/R26).

**Own code read whole; flaws.** No flaw of this module found beyond those reported below.

**Deferred.**
- (P6) The module is now 4,005 lines (`index.mjs` and `schema.mjs`), just over the 4,000 mark: reported for BOB's ruling.

**Found in other modules (REPORT J1).**
1. **action-grammar R8** says `clockMovesNotMechanical` answers exactly R33's mechanical rule. Since R98 it does not: it has no time-of-day arm, and this module filters its answer. Either action-grammar gains the arm (taking the entry's instant and zone), or R8's sentence is amended.
2. **Zone, R12/R98 vs `action-clocks`' `actionZone`.**
   - R12 names "the zone the active profile gives the counterparty office, else the profile's `time_zone`". `action-clocks` reads exactly that (the office's profile zone first).
   - This module reads only the combined view's `time_zone` (`zoneOf(place())`, R68). That is withheld when several active profiles disagree; t34's R68 test pins that as undetermined.
   - The two therefore differ only with several profiles of different zones. I kept this module's reading (R68 and its tests) and did not change R12's behaviour. BOB's to rule which reading governs.

**Tests and checks.**
- `node --test bio-plane/test/m/actions/`: 121 pass, 0 fail. New: `t46.test.mjs`, ten tests naming R98 and R99, each refusal beside its control.
- Users' tests: see the line below.
- `checks/format.mjs`: 0 failures.
- `architecture.mjs bio actions`: 0 failures.
- `coverage.mjs bio actions`: 72 of 72 live ids named, 0 failures.
- `ownership.mjs bio actions tranche/T46`: 0 failures.
- `checks/run.mjs` over the product: format 0, architecture 0, channels 0. Coverage has 29 failures, all other modules' `(not yet met: T46)` ids (rule 5 (1)), none of this module's.
- The plane bundle is staled by this change (rule 5 (4)).
- Users' tests (this module's services read by them):
  - Clean: action-holds 35/0, action-clocks 66/0, action-replies 16/0, filings 92/0, action-plans 75/0, plan-work 40/0, action-producers 36/0.
  - escalation 71/1. `invariants.test.mjs` R21 pins escalation's states without record-grammar's new `stopped_pursuing` (T46-1). It is not this module's: escalation's own T46 entry.
  - monitoring 133/1. `ends.test.mjs` R34 "(T45, while actions R33 reads the date alone: N922)" pins that `actions` refuses a timed mark on its day. R98 ends that by design, so this red opens with this merge. It is closed by T46-41, which turns R34's two `test.todo` into tests (BOB to name it at the merge, K2704).
- Test runs: 2 of this module's, 1 of the users' modules.

Size (session_01Ewqc3hwvUSkbtBS4noGEft): test runs 3, module lines 4005

## J1 · REPORT

Found in other modules (details in my record's Completion): (1) action-grammar R8 says clockMovesNotMechanical answers R33's mechanical rule exactly; since R98 it has no time-of-day arm and actions filters its answer. Amend R8's sentence, or give action-grammar the arm. (2) Zone: R12 names the office's profile zone first, as action-clocks' actionZone reads it; actions reads only the combined view's time_zone (R68, pinned by t34). The two differ only with several active profiles of different zones; yours to rule which reading governs. (3) Reds opened or seen: monitoring ends.test.mjs R34 '(T45, while actions R33 reads the date alone)' fails by design with R98 and is closed by T46-41. escalation invariants.test.mjs R21 fails on record-grammar's stopped_pursuing (T46-1), not this module's. (4) P6: the module is now 4,005 lines.

## J2 · COMPLETE

T46-32 applied: R98 (a timed clock entry is moved pending to overdue by the mechanical recheck once its instant passes, in due_zone else R12's zone; dueInstant exported) and R99 (ACTIONS_WORDS: the five keys verbatim from words.json, read by key; reply.not_owed answers its {reason} with the member's reason beside it). actions tests 121/0. format, architecture, coverage (72/72) and ownership checks: 0 failures. run.mjs: architecture 0, coverage reds only other modules' not-yet-met ids. Uses no unmerged L9 service: ready to merge. Record: build/jobs/T46/actions.md on job/T46/actions.
