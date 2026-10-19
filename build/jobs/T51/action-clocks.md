# action-clocks (T51)

**Status** · session_01GRpmGF7jXboFitBgdF89Tk · depth 2 · WORKING · handled B1

## Completion (T51-238)

**Entries applied.**
- Words (K3949, K3957, K3962): all 9 findings of `checks/words.mjs` (the 6 conversion findings, the 2 `plain` ones, `checks.mjs` CLOCK_ENTRY_REFUSED) fixed by the words rule. Existing rows read by `word` where one held the sentence (`action-clocks.source_stated`, `.confirmed`, `.corrected_locally`, `.why.malformed_rule`, `.later_event`, `.machine_credential_computed`, `.member_asked_clock`, `.basis_commitment`, `.basis`, `.closed_day_skipped`, `refusal.CLOCK_ENTRY_REFUSED`); the rest by `localize('action-clocks.<index|count|ics>.<slug>', en, vars)`, ids fixed once. Also converted (setup-words R13, whatever the check counts): every refusal `detail`, the proposal's UNMEASURED reason, the trace-line fragments, the basis fragments of the calendar file, the calendar's name, `computed fact` and `observed practice` labels. "the other side" gets its own id (`action-clocks.index.the_other_side`) rather than another module's row. No string was judged unread, so no REPORT of such strings.
- Tests: sentence copies in my tests now compare with `word`/`localize` by equality (adopt, calendar, clocks, factreader, ics, lateness, overdue, t45, t46, t47); regexes over sentences that are civil-time's own (`disputed`, `cannot be read`, `weekend`, `whole number`, `close of business`, `does not cover for every office`, `anchor's time`) stay, being that module's words.
- The eight reds (K3958, K3997, K4036): `count.mjs` `whyOf` rendered civil-time's `{key, vars}` reason with `String()`, printing "[object Object]". It now renders it with civil-time's `reasonText`, only where this module builds the sentence a member reads. All 8 are green (`calendar.test.mjs`, `clocks.test.mjs`, `factreader.test.mjs`, `worked.test.mjs`).

**Shape of `why` (for filings).** `computeDeadline(...).why`, `clockPropose` `proposal.undetermined`, `clockProposalsFor` `undetermined` and `clockAdopt`'s `CLOCK_PROPOSAL_UNDETERMINED` `why` are plain rendered sentences (strings), never `{key, vars}`: a civil-time reason is rendered at the count, once. `factReader` answers `why` as a string as before. Nothing in this module passes a keyed reason on, so filings reads a string.

**Deferred.** None.

**Found in another module.** `word(key, vars)` does not yet fill a var that is itself a reason (CR-14 not merged): I did not need it, using civil-time's `reasonText` instead. Tests in this module hold civil-time sentences in regexes (listed above); they belong to civil-time's words.

**Generated artifacts made stale.** `setup-words/rows.mjs` and `words-unreviewed.json` (my new `localize` ids): BOB regenerates at the layer close. `build.mjs --check` reports rows.mjs stale at my first new id; setup-words R10, R16 and R17 tests read red only for that reason.

**Tests and checks.**
- `node --test test/m/action-clocks/*.test.mjs`: tests 74, pass 74, fail 0 (before: 66 pass, 8 fail).
- Tests of every module that imports action-clocks, before and after my change: the same failures, apart from the three setup-words stale-rows tests above.
- `checks/words.mjs bio action-clocks`: 0 failures; the 14-module cross run names no line of this module.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio action-clocks`: 0 failures. `checks/coverage.mjs bio action-clocks`: 23 of 23 live ids named, 0 failures. `checks/ownership.mjs bio action-clocks tranche/T51 job/T51/action-clocks`: 15 files changed, 0 failures. `checks/run.mjs bio`: format and architecture 0 failures, no line names this module.

Size (session_01GRpmGF7jXboFitBgdF89Tk): test runs 8, module lines 2081
